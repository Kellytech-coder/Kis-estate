# Property Listing API

The Express API reads and writes property, profile, inquiry, and contact data in Firebase Firestore. Firebase Authentication verifies passwords and issues ID tokens. The browser sends the ID token as a bearer token to protected API routes; passwords are never sent to this API or stored in Firestore.

## Setup

1. Install dependencies with `npm install`.
2. Create `backend/.env` with Firebase Admin credentials. Either set `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` (newlines in the key may be written as `\\n`), or set `FIREBASE_SERVICE_ACCOUNT` to the service account JSON. A local `backend/firebase-service-account.json` is also supported and must not be committed.
3. Set `FRONTEND_URL` to the deployed frontend origin in production. The API also supports the local frontend at `http://localhost:3000`.
4. Start the API with `npm run dev`.

The health endpoint is `GET /api/health`. It reports that the API is running; it does not currently perform a Firestore connectivity check.

## Deploy the API and rules

This repository includes a Render Blueprint at the repository root for the Express API. In Render, create a Blueprint from this repository and provide the Firebase service account's client email and private key when prompted. Render will deploy the service from `backend/` and provide a public URL. Confirm that `GET https://<your-api-host>/api/health` returns JSON before connecting the frontend.

Publish the Firestore rules from the repository root using the Firebase CLI:

```powershell
firebase deploy --only firestore:rules --project property-listing-5df59
```

Then add `NEXT_PUBLIC_API_URL=https://<your-api-host>` to the Vercel project's Production Environment Variables and redeploy. Use the API host only; the frontend adds `/api/...` to requests automatically. The backend host must allow outbound HTTPS and Firestore traffic to Google APIs. Firebase Admin credentials and the frontend Firebase project ID must refer to the same Firebase project. The login page can read the signed-in user's own profile directly from Firestore if the API is temporarily down, so publish the included Firestore rules before relying on that fallback.

## Authentication and authorization

- The frontend uses Firebase Authentication for account creation and password verification.
- After successful sign-in, it requests `GET /api/auth/me` to load the profile and role from Firestore. A valid Firebase ID token is required.
- Registration creates a Firebase Authentication account, then initializes the Firestore profile through `POST /api/auth/register-profile`. Registration is restricted to buyer/renter or seller roles; administrator status can only be assigned server-side.
- `/api/admin/*` routes verify the Firebase ID token and the active `ADMIN` Firestore profile on each request.
- Never store or log passwords or Firebase service-account secrets. The only initial admin provisioning script is `npm run create-admin`; provide `INITIAL_ADMIN_NAME`, `INITIAL_ADMIN_EMAIL`, and `INITIAL_ADMIN_PASSWORD` in the backend environment, then run it once.

## Frontend connection

The Next.js app uses `NEXT_PUBLIC_API_URL` as the API base URL. For local development this can be `http://localhost:4000`; add it to the root `.env.local` if needed. Set it to the deployed Express API URL in the Vercel project’s Environment Variables for every deployed environment, then redeploy. Production builds do not fall back to localhost. Firebase browser configuration values may be public; service-account credentials must never use `NEXT_PUBLIC_*` variables.

## Data collections

- `users`: account profiles, roles, active state, and saved property IDs
- `properties`: property listings
- `inquiries`: property inquiries and tour requests
- `contact_messages`: website contact form submissions
- `plans`: server-owned promotion catalog (the featured plan is created from `FEATURED_PRICE_KOBO` on first read)
- `orders`: seller promotion purchases and lifecycle status
- `payments`: Paystack transaction records, failures, and refunds
- `promotion_views`: promoted listing detail views grouped by order and UTC day

## Featured promotion payments

Set `PAYSTACK_SECRET_KEY` in the backend environment and set `FEATURED_PRICE_KOBO` to the default integer price in kobo (for example, `5000000` is ₦50,000). The first request creates the featured plan document. Admins can edit its NGN price, duration, and availability from **Admin → Revenue & Promotions**; each order keeps the price and duration it was purchased with. Configure the Paystack webhook URL as `https://<your-api-host>/api/payments/webhook` and subscribe to `charge.success`, `charge.failed`, `refund.pending`, and `refund.processed`.

Seller checkout creates an order, initializes Paystack from the backend, and only marks the property featured after a Paystack server verification confirms the exact reference, amount, and currency. The seller callback is only a UX signal; it does not grant promotion. The purchased duration is stored on each order, and public listing APIs stop returning `featured: true` after `featuredUntil`. Property detail views are counted once per browser session, and promoted views are grouped by order. Publish updated `firestore.rules` so browser clients cannot set featured status or dates directly.

Admin payment reporting is available at `GET /api/admin/payments`; **Admin → Revenue & Promotions** includes promotion pricing, net revenue, paid/failed/refunded orders, paying seller conversion, promoted detail views, and inquiries during each promotion. Buyer browsing and inquiries and basic seller listings remain free. This marketplace does not yet track completed sale or lease transactions, so referral commissions or closing fees are not charged. Recurring seller subscriptions can be added if higher listing limits or ongoing seller tools become part of the product.
