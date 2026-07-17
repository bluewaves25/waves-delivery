# Delivery App — Architecture Reference & Build Verdict

---

## 0. Verdict

**Base the platform on `Delivery-management-system` (NestJS + Prisma + MySQL backend, Remix web frontend). Do not use Enatega Single Vendor.**

- Enatega ships real mobile apps (React Native/Expo) but withholds the backend behind a paid license. Without buying it, reverse-engineering its GraphQL schema from Apollo query files and then building a matching backend is *harder* than building a backend from scratch — you'd inherit someone else's UI decisions with none of the control.
- `Delivery-management-system` gives a real, working, open backend today: auth, roles, parcel state machine, service-area/zone modeling. That's the infrastructure work already done. What it lacks — mobile app, GPS, payments, notifications, customer app — is exactly what's fastest to build when you own the backend and control the schema.
- Net result: build the mobile app from scratch (React Native) against the NestJS API, extending the Prisma schema as needed. Use Enatega's screens only as a **UX/feature reference**, never as code that runs.

---

## 1. Chosen Base — `Delivery-management-system`

**Stack:** NestJS + Prisma + MySQL (backend), Remix + Tailwind (web frontend, admin/merchant/package-handler panels).

**What it already has:**
- JWT auth, role-based guards
- Three roles/panels: Merchant, Admin, Package Handler (pickup + delivery man)
- Data model: `Parcel`, `ParcelStatus`, `ParcelTimeline`, `Shops`, `PickUpPoints`, `Divisions/Districts/Areas`, `Zones`, `ParcelPricing` (weight-tiered)
- Admin: user/role management, shop and pickup-point management, service-area management, basic statistics
- Merchant: create parcels, track status, manage shops
- Package handler: view assigned parcels, update status through a timeline

**Confirmed gaps (checked directly against source — zero matches found for any of these):**

| Missing | Why it matters |
|---|---|
| Mobile app | No `/mobile`, no React Native/Flutter. Package-handler panel is Remix web, opened in a browser — no background GPS, camera capture, push, or offline queueing. |
| Customer-facing app | Customers are a name/phone/address string typed in by the merchant. No customer account, login, or self-service tracking. |
| Lat/lng on any address | `customerAddress` is a plain string. No map pins anywhere — blocks live tracking, navigation, zone-based pricing, and dispatch by definition. |
| Real-time layer | No WebSocket gateway, no Redis. Status updates are pull-based, not pushed. |
| Automated dispatch | Package-handler assignment looks manual (admin/merchant assigns), not nearest-rider matching. |
| Payments | `parcelCashCollection`/`parcelCharge` are just numbers — no gateway integration, no payout ledger. |
| Push/SMS notifications | None found. |
| Ratings/reviews | Not modeled at all. |
| Proof of delivery | `ParcelTimeline` records a status change, not evidence (no photo/OTP/signature). |
| Promo codes / dynamic pricing | `ParcelPricing` is a static weight-tier table only. |

---

## 2. Build Roadmap (priority order)

1. **Add lat/lng everywhere an address exists** — `Parcel`, `PickUpPoints`, `Areas`. Everything downstream (tracking, navigation, zone pricing, dispatch) depends on this existing first.
2. **Build the mobile rider app** (React Native) against the existing NestJS API. Highest-leverage gap — couriers are the ones worst served by a web-only tool. Use Enatega's rider-app screens (order accept/decline, navigation, delivery confirmation) as a UX reference only.
3. **Real-time layer** — WebSocket gateway + Redis for live rider location and pushed status updates to merchant/admin/customer.
4. **Payments** — Paystack/Flutterwave/mobile money for Ghana; add a payout ledger for package handlers.
5. **Push notifications** — FCM for the mobile app; SMS fallback for customers (relevant since there's no customer app yet).
6. **Minimal customer-facing surface** — start with an SMS-linked web tracking page (no login required) before a full customer app. Closes the biggest visibility gap cheaply.
7. **Proof of delivery** — photo/OTP capture at the `ParcelTimeline` "delivered" transition.
8. **Dispatch automation, ratings, promos, fraud flags** — last, once the above is live and there's real usage to tune against.

---

## 3. Full Mobile App Feature Reference (for scoping the rider/customer apps)

### Customer App
- Sign-up (phone/email), OTP verification, address book with map pin drop
- Ordering/tracking flow, checkout, payment method selection, promo codes
- Live order status + live rider location on map, ETA, in-app chat/call with rider or support
- Order history, rate rider, dispute/refund flow

### Rider/Driver App
- Onboarding: document upload, verification status, vehicle type
- Online/offline toggle, incoming job card (accept/decline with timer), multi-drop batching
- Turn-by-turn navigation to pickup and drop-off
- Pickup/delivery confirmation (photo, signature, or OTP)
- Earnings tracking, payout history, in-app chat/call, ratings received

### Admin Dashboard (already largely covered by the base repo, extend as needed)
- Live map of active riders/orders, manual dispatch override, SLA timers
- Rider/vendor onboarding approval, customer account management
- Pricing rules, delivery zone editor, promo codes, commission rates
- Payout reconciliation, transaction ledger, fraud flags
- Analytics: delivery times, cancellation rate, rider utilization, order volume, retention

---

## 4. Backend Services Checklist (target state)

| Service | Responsibility | Status in base repo |
|---|---|---|
| Auth | Login, tokens, role-based access | ✅ Done |
| Order/parcel state machine | Valid status transitions | ✅ Done |
| Dispatch/matching engine | Nearest-rider auto-assignment | ❌ Build |
| Pricing engine | Base + distance/zone + surge + promo | ⚠️ Static only, needs zone/surge logic |
| Payments & wallet ledger | Charge, hold, payout, refund | ❌ Build |
| Real-time location service | GPS ingestion + broadcast (WebSockets) | ❌ Build |
| Notifications service | Push, SMS, in-app | ❌ Build |
| Ratings & reviews service | Rider/customer/vendor ratings | ❌ Build |

---

## 5. Infrastructure

| Component | Recommendation |
|---|---|
| Primary database | MySQL (already in use via Prisma) |
| Real-time/cache store | Redis — rider locations, live order state |
| Message queue | Redis Streams (simplest to start; Kafka/RabbitMQ only if scale demands it) |
| Maps & routing | Google Maps Platform or Mapbox |
| Payment gateway | Paystack or Flutterwave (strongest in Ghana/West Africa) |
| Push notifications | Firebase Cloud Messaging (FCM) |
| File/image storage | S3-compatible object storage (proof-of-delivery photos, ID docs) |
| Hosting | DigitalOcean/Oracle OCI/AWS depending on budget |

---

## 6. Things Easy to Miss

- **Idempotency** on payments and dispatch — a retry should never double-charge or double-assign.
- **Cancellation windows/cutoffs** — define when customer/vendor/rider can no longer cancel penalty-free.
- **Rider reassignment on timeout** — rider accepts but goes silent (no GPS movement).
- **Address accuracy fallback** — "share live location" / pin-drop, since typed addresses are unreliable outside major Ghanaian cities.
- **Offline handling** — rider app must queue actions (like delivery confirmation) and sync when back online.
- **Refund/dispute workflow** — who approves refunds, does it auto-reverse the rider's payout?
- **Rate limiting/abuse prevention** — fake accounts, GPS spoofing, promo abuse.
- **Data privacy** — location history and ID documents need defined retention/access rules from the start.