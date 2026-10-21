const crypto = require("crypto");
const { db, admin } = require("../config/firebase");

const FEATURED_PLAN = {
  id: "featured-7-days",
  name: "Featured listing - 7 days",
  amountKobo: Number(process.env.FEATURED_PRICE_KOBO || 5000000),
  currency: "NGN",
  durationDays: 7,
  active: true,
};

const timestampDate = (value) => value?.toDate?.() || (value ? new Date(value) : null);
const isFeaturedActive = (property) => {
  const until = timestampDate(property.featuredUntil);
  return Boolean(property.featured && until && until.getTime() > Date.now());
};
const serialize = (value) => value?.toDate?.()?.toISOString?.() || value || null;
async function getStoredPlan() {
  const ref = db.collection("plans").doc(FEATURED_PLAN.id);
  const snap = await ref.get();
  if (!snap.exists) {
    await ref.set({ ...FEATURED_PLAN, createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    return FEATURED_PLAN;
  }
  return { id: snap.id, ...snap.data() };
}

async function verifyPaystack(reference) {
  if (!process.env.PAYSTACK_SECRET_KEY) throw new Error("Payment provider is not configured");
  const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
  });
  const result = await response.json();
  if (!response.ok || !result.status) throw new Error(result.message || "Could not verify payment");
  return result.data;
}

async function applyPayment(reference, transaction) {
  const orderRef = db.collection("orders").doc(reference);
  return db.runTransaction(async (tx) => {
    const orderSnap = await tx.get(orderRef);
    if (!orderSnap.exists) throw new Error("Payment order not found");
    const order = orderSnap.data();
    if (["paid", "partially_refunded", "refunded", "refund_pending"].includes(order.status)) return { order, alreadyPaid: true };
    if (transaction.status !== "success" || transaction.reference !== reference ||
        Number(transaction.amount) !== order.amountKobo || transaction.currency !== order.currency) {
      tx.update(orderRef, { status: transaction.status === "failed" ? "failed" : "pending", updatedAt: admin.firestore.FieldValue.serverTimestamp() });
      if (transaction.status === "failed") tx.set(db.collection("payments").doc(reference), { orderId: reference, sellerId: order.sellerId, propertyId: order.propertyId, provider: "paystack", amountKobo: order.amountKobo, currency: order.currency, status: "failed", updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
      return { order, invalid: true };
    }

    const propertyRef = db.collection("properties").doc(order.propertyId);
    const propertySnap = await tx.get(propertyRef);
    if (!propertySnap.exists || propertySnap.data().createdById !== order.sellerId) throw new Error("Order property ownership could not be confirmed");
    const now = new Date();
    const currentUntil = timestampDate(propertySnap.data().featuredUntil);
    const startsAt = currentUntil && currentUntil > now ? currentUntil : now;
    const endsAt = new Date(startsAt.getTime() + order.durationDays * 86400000);
    tx.update(orderRef, { status: "paid", paidAt: admin.firestore.FieldValue.serverTimestamp(), providerTransactionId: String(transaction.id), updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    tx.update(propertyRef, { featured: true, featuredFrom: admin.firestore.Timestamp.fromDate(startsAt), featuredUntil: admin.firestore.Timestamp.fromDate(endsAt), featuredOrderId: reference, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    tx.set(db.collection("payments").doc(reference), { orderId: reference, sellerId: order.sellerId, propertyId: order.propertyId, provider: "paystack", providerTransactionId: String(transaction.id), amountKobo: order.amountKobo, currency: order.currency, status: "success", paidAt: admin.firestore.FieldValue.serverTimestamp(), createdAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    return { order, endsAt };
  });
}

const getPlans = async (req, res, next) => {
  try { const plan = await getStoredPlan(); res.json({ success: true, data: plan.active ? [plan] : [] }); }
  catch (error) { next(error); }
};

const updatePromotionPlan = async (req, res, next) => {
  try {
    const current = await getStoredPlan();
    const amountKobo = Number(req.body?.amountKobo);
    const durationDays = Number(req.body?.durationDays);
    const active = req.body?.active;
    if (!Number.isSafeInteger(amountKobo) || amountKobo < 100 ||
        !Number.isInteger(durationDays) || durationDays < 1 || durationDays > 90 ||
        typeof active !== "boolean") {
      return res.status(400).json({ success: false, message: "Enter a price of at least ₦1, a duration from 1 to 90 days, and an active setting" });
    }
    await db.collection("plans").doc(FEATURED_PLAN.id).set({
      ...current,
      name: `Featured listing - ${durationDays} days`,
      amountKobo,
      durationDays,
      active,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    const saved = await getStoredPlan();
    res.json({ success: true, data: saved, message: "Promotion plan updated" });
  } catch (error) { next(error); }
};

const getPromotionPlanForAdmin = async (req, res, next) => {
  try {
    const plan = await getStoredPlan();
    res.json({ success: true, data: plan });
  } catch (error) { next(error); }
};

const initializeCheckout = async (req, res, next) => {
  try {
    const { propertyId, planId } = req.body || {};
    if (!propertyId || typeof planId !== "string") return res.status(400).json({ success: false, message: "Choose a valid promotion and property" });
    if (!process.env.PAYSTACK_SECRET_KEY) return res.status(503).json({ success: false, message: "Payments are not configured yet" });
    const plan = await getStoredPlan();
    if (!plan.active || plan.id !== planId || !Number.isInteger(plan.amountKobo) || plan.amountKobo <= 0 || !Number.isInteger(plan.durationDays) || plan.durationDays < 1) return res.status(400).json({ success: false, message: "This promotion is unavailable" });
    const propertyRef = db.collection("properties").doc(String(propertyId));
    const propertySnap = await propertyRef.get();
    if (!propertySnap.exists) return res.status(404).json({ success: false, message: "Property not found" });
    if (propertySnap.data().createdById !== req.user.uid) return res.status(403).json({ success: false, message: "You can only promote your own property" });
    const email = req.user.email || req.userProfile?.email;
    if (!email) return res.status(400).json({ success: false, message: "Add an email address to your account before checkout" });

    const reference = `feat-${req.user.uid}-${crypto.randomUUID()}`;
    const order = { reference, planId: plan.id, planName: plan.name, sellerId: req.user.uid, propertyId: String(propertyId), amountKobo: plan.amountKobo, currency: plan.currency, durationDays: plan.durationDays, status: "initializing", provider: "paystack", createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() };
    await db.collection("orders").doc(reference).create(order);
    await db.collection("payments").doc(reference).create({ orderId: reference, sellerId: req.user.uid, propertyId: String(propertyId), provider: "paystack", amountKobo: plan.amountKobo, currency: plan.currency, status: "initializing", createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");
    const initResponse = await fetch("https://api.paystack.co/transaction/initialize", { method: "POST", headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ email, amount: String(plan.amountKobo), currency: plan.currency, reference, callback_url: `${frontendUrl}/seller?payment=complete`, channels: ["card", "bank", "ussd", "bank_transfer"], metadata: { order_id: reference, property_id: String(propertyId), seller_id: req.user.uid } }) });
    const result = await initResponse.json();
    if (!initResponse.ok || !result.status) {
      await db.collection("orders").doc(reference).update({ status: "failed", failureReason: result.message || "Checkout initialization failed", updatedAt: admin.firestore.FieldValue.serverTimestamp() });
      await db.collection("payments").doc(reference).set({ orderId: reference, sellerId: req.user.uid, propertyId: String(propertyId), provider: "paystack", amountKobo: plan.amountKobo, currency: plan.currency, status: "failed", createdAt: admin.firestore.FieldValue.serverTimestamp() });
      return res.status(502).json({ success: false, message: result.message || "Could not start checkout" });
    }
    await Promise.all([
      db.collection("orders").doc(reference).update({ status: "pending", updatedAt: admin.firestore.FieldValue.serverTimestamp() }),
      db.collection("payments").doc(reference).update({ status: "pending", updatedAt: admin.firestore.FieldValue.serverTimestamp() }),
    ]);
    res.status(201).json({ success: true, data: { authorizationUrl: result.data.authorization_url, reference } });
  } catch (error) { next(error); }
};

const confirmCheckout = async (req, res, next) => {
  try {
    const { reference } = req.body || {};
    if (typeof reference !== "string" || !/^[a-zA-Z0-9.=\-]+$/.test(reference)) return res.status(400).json({ success: false, message: "Invalid payment reference" });
    const orderSnap = await db.collection("orders").doc(reference).get();
    if (!orderSnap.exists || orderSnap.data().sellerId !== req.user.uid) return res.status(404).json({ success: false, message: "Payment order not found" });
    if (orderSnap.data().status === "refunded") return res.status(409).json({ success: false, message: "This promotion payment has been refunded" });
    if (orderSnap.data().status === "refund_pending") return res.status(409).json({ success: false, message: "A refund for this promotion is being processed" });
    const transaction = await verifyPaystack(reference);
    const applied = await applyPayment(reference, transaction);
    if (applied.invalid) return res.status(402).json({ success: false, message: "Payment is not confirmed yet", data: { status: transaction.status } });
    res.json({ success: true, data: { status: "paid", promotionEndsAt: applied.endsAt?.toISOString?.() || null } });
  } catch (error) { next(error); }
};

const getSellerOrders = async (req, res, next) => {
  try {
    const snapshot = await db.collection("orders").where("sellerId", "==", req.user.uid).get();
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data(), createdAt: serialize(doc.data().createdAt), paidAt: serialize(doc.data().paidAt) })).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    res.json({ success: true, data, count: data.length });
  } catch (error) { next(error); }
};

const handlePaystackWebhook = async (req, res) => {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret || !req.rawBody) return res.sendStatus(400);
  const expected = crypto.createHmac("sha512", secret).update(req.rawBody).digest();
  let supplied;
  try { supplied = Buffer.from(req.get("x-paystack-signature") || "", "hex"); } catch { return res.sendStatus(401); }
  if (expected.length !== supplied.length || !crypto.timingSafeEqual(expected, supplied)) return res.sendStatus(401);
  try {
    const event = req.body;
    if (event?.event === "charge.success" && event.data?.reference) {
      // Verify against Paystack directly as well as validating the signed webhook payload.
      const verified = await verifyPaystack(event.data.reference);
      await applyPayment(event.data.reference, verified);
    } else if (event?.event === "charge.failed" && event.data?.reference) {
      await markFailed(event.data.reference, event.data);
    } else if ((event?.event === "refund.processed" || event?.event === "refund.pending") && event.data?.transaction?.reference) {
      const reference = event.data.transaction.reference;
      const orderRef = db.collection("orders").doc(reference);
      const paymentRef = db.collection("payments").doc(reference);
      const refundId = String(event.data.id || event.data.refund_id || `${reference}-${event.data.amount || "refund"}-${event.data.createdAt || "event"}`);
      await db.runTransaction(async (transaction) => {
        const [orderSnap, paymentSnap] = await Promise.all([transaction.get(orderRef), transaction.get(paymentRef)]);
        if (!orderSnap.exists) return;
        const order = orderSnap.data();
        const payment = paymentSnap.exists ? paymentSnap.data() : {};
        const processedRefundIds = Array.isArray(payment.processedRefundIds) ? payment.processedRefundIds : [];
        const pendingRefundIds = Array.isArray(payment.pendingRefundIds) ? payment.pendingRefundIds : [];
        if (event.event === "refund.pending") {
          if (processedRefundIds.includes(refundId) || pendingRefundIds.includes(refundId)) return;
          transaction.set(paymentRef, {
            orderId: reference,
            sellerId: order.sellerId,
            propertyId: order.propertyId,
            provider: "paystack",
            amountKobo: order.amountKobo,
            currency: order.currency,
            status: "refund_pending",
            pendingRefundIds: [...pendingRefundIds, refundId],
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          }, { merge: true });
          transaction.set(orderRef, { status: "refund_pending", updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
          return;
        }

        if (processedRefundIds.includes(refundId)) return;
        const requestedRefundKobo = Number(event.data.amount) || Math.max(0, Number(order.amountKobo) - (Number(payment.refundAmountKobo) || 0));
        const refundAmountKobo = Math.min(Number(order.amountKobo) || 0, (Number(payment.refundAmountKobo) || 0) + requestedRefundKobo);
        const fullyRefunded = refundAmountKobo >= (Number(order.amountKobo) || 0);
        const remainingPendingRefunds = pendingRefundIds.filter((id) => id !== refundId);
        const refundStatus = fullyRefunded ? "refunded" : remainingPendingRefunds.length ? "refund_pending" : "partially_refunded";
        const propertyRef = db.collection("properties").doc(order.propertyId);
        const propertySnap = fullyRefunded ? await transaction.get(propertyRef) : null;
        transaction.set(paymentRef, {
          orderId: reference,
          sellerId: order.sellerId,
          propertyId: order.propertyId,
          provider: "paystack",
          amountKobo: order.amountKobo,
          currency: order.currency,
          status: refundStatus,
          refundAmountKobo,
          processedRefundIds: [...processedRefundIds, refundId],
          pendingRefundIds: remainingPendingRefunds,
          refundedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        transaction.set(orderRef, { status: refundStatus, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
        if (fullyRefunded && propertySnap?.exists && propertySnap.data().featuredOrderId === reference) {
          transaction.update(propertyRef, {
            featured: false,
            featuredFrom: admin.firestore.FieldValue.delete(),
            featuredUntil: admin.firestore.FieldValue.delete(),
            featuredOrderId: admin.firestore.FieldValue.delete(),
          });
        }
      });
    }
    return res.sendStatus(200);
  } catch (error) { console.error("Paystack webhook processing failed:", error.message); return res.sendStatus(500); }
};

async function markFailed(reference, payload = {}) {
  const orderRef = db.collection("orders").doc(reference);
  const snap = await orderRef.get();
  if (!snap.exists || ["paid", "partially_refunded", "refunded", "refund_pending"].includes(snap.data().status)) return;
  await orderRef.update({ status: "failed", updatedAt: admin.firestore.FieldValue.serverTimestamp() });
  await db.collection("payments").doc(reference).set({ orderId: reference, sellerId: snap.data().sellerId, propertyId: snap.data().propertyId, provider: "paystack", amountKobo: snap.data().amountKobo, currency: snap.data().currency, status: "failed", failureReason: payload.gateway_response || payload.message || "Payment failed", updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
}

const confirmPaymentForAdmin = async (reference, transaction) => applyPayment(reference, transaction);
module.exports = { FEATURED_PLAN, getPlans, getPromotionPlanForAdmin, updatePromotionPlan, initializeCheckout, confirmCheckout, getSellerOrders, handlePaystackWebhook, confirmPaymentForAdmin, isFeaturedActive };
