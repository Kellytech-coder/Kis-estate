const { db } = require("../config/firebase");

const asIso = (value) => value?.toDate?.()?.toISOString?.() || value || null;
const dateValue = (value) => value?.toDate?.() || (value ? new Date(value) : null);

const netPaymentKobo = (payment) => {
  const amount = Number(payment.amountKobo) || 0;
  if (payment.status === "refunded") return 0;
  if (["partially_refunded", "refund_pending"].includes(payment.status)) return Math.max(0, amount - (Number(payment.refundAmountKobo) || 0));
  return payment.status === "success" ? amount : 0;
};

const getPaymentReport = async (req, res, next) => {
  try {
    const [ordersSnap, paymentsSnap, inquiriesSnap, propertiesSnap, usersSnap, legacyUsersSnap, promotionViewsSnap] = await Promise.all([
      db.collection("orders").get(),
      db.collection("payments").get(),
      db.collection("inquiries").get(),
      db.collection("properties").get(),
      db.collection("users").get(),
      db.collection("user").get(),
      db.collection("promotion_views").get(),
    ]);
    const orders = ordersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const payments = paymentsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const inquiries = inquiriesSnap.docs.map((doc) => doc.data());
    const propertyTitles = new Map(propertiesSnap.docs.map((doc) => [doc.id, doc.data().title || "Property"]));
    const sellers = new Map();
    [...legacyUsersSnap.docs, ...usersSnap.docs].forEach((doc) => sellers.set(doc.id, doc.data()));
    const paymentById = new Map(payments.map((payment) => [payment.id, payment]));
    const viewsByOrderId = new Map();
    promotionViewsSnap.docs.forEach((doc) => {
      const record = doc.data();
      viewsByOrderId.set(record.orderId, (viewsByOrderId.get(record.orderId) || 0) + (Number(record.views) || 0));
    });
    const data = orders.map((order) => {
      const payment = paymentById.get(order.id) || {};
      const seller = sellers.get(order.sellerId) || {};
      const paidAt = dateValue(payment.paidAt || order.paidAt);
      const promotionEnds = paidAt ? new Date(paidAt.getTime() + (Number(order.durationDays) || 0) * 86400000) : null;
      const refundDate = dateValue(payment.refundedAt);
      const inquiryWindowEnds = payment.status === "refunded" && refundDate && promotionEnds && refundDate < promotionEnds ? refundDate : promotionEnds;
      const promotedInquiries = ["success", "partially_refunded", "refund_pending", "refunded"].includes(payment.status) && paidAt && inquiryWindowEnds
        ? inquiries.filter((inquiry) => {
          const createdAt = dateValue(inquiry.createdAt);
          return inquiry.propertyId === order.propertyId && createdAt && createdAt >= paidAt && createdAt <= inquiryWindowEnds;
        }).length
        : 0;
      return {
        id: order.id,
        propertyId: order.propertyId,
        propertyTitle: propertyTitles.get(order.propertyId) || "Deleted property",
        sellerId: order.sellerId,
        sellerName: seller.name || seller.email || "Seller",
        sellerEmail: seller.email || "",
        planName: order.planName,
        amountNaira: (Number(order.amountKobo) || 0) / 100,
        currency: order.currency,
        status: payment.status || order.status,
        provider: order.provider,
        createdAt: asIso(order.createdAt),
        paidAt: asIso(payment.paidAt || order.paidAt),
        refundedAt: asIso(payment.refundedAt),
        refundAmountNaira: (Number(payment.refundAmountKobo) || 0) / 100,
        views: viewsByOrderId.get(order.id) || 0,
        inquiries: promotedInquiries,
      };
    }).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

    const successfulPayments = payments.filter((payment) => payment.provider === "paystack" && netPaymentKobo(payment) > 0);
    const payingSellerIds = new Set(successfulPayments.map((payment) => payment.sellerId).filter(Boolean));
    const sellerIds = new Set([...sellers.keys()].filter((id) => {
      const seller = sellers.get(id);
      return ["SELLER", "SELLER_PROPERTY_OWNER"].includes(String(seller?.role || "").toUpperCase());
    }));
    const totalSellers = sellerIds.size;
    const payingSellers = [...payingSellerIds].filter((id) => sellerIds.has(id)).length;
    const revenueKobo = payments.reduce((sum, payment) => sum + netPaymentKobo(payment), 0);

    res.json({
      success: true,
      data: {
        orders: data,
        summary: {
          orders: orders.length,
          paid: orders.filter((order) => ["paid", "partially_refunded", "refunded", "refund_pending"].includes(paymentById.get(order.id)?.status || order.status)).length,
          failed: payments.filter((payment) => payment.status === "failed").length,
          refunds: payments.filter((payment) => ["refunded", "partially_refunded"].includes(payment.status)).length,
          revenueNaira: revenueKobo / 100,
          promotedInquiries: data.reduce((sum, order) => sum + order.inquiries, 0),
          promotedViews: data.reduce((sum, order) => sum + order.views, 0),
          totalSellers,
          payingSellers,
          sellerConversionRate: totalSellers ? Math.round((payingSellers / totalSellers) * 10000) / 100 : 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPaymentReport };
