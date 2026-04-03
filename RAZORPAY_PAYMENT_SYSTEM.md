# Razorpay Payment & Subscription System - Complete Implementation

## Overview
Complete production-ready Razorpay payment and subscription system integrated into CodeCampus AI.

## Features Implemented

### 1. Payment Flow
- ✅ Razorpay order creation with server-side validation
- ✅ Secure signature verification
- ✅ Automatic subscription activation
- ✅ Invoice generation
- ✅ Email notifications
- ✅ Webhook support for reliability

### 2. Subscription Management
- ✅ Monthly and yearly billing cycles
- ✅ Automatic expiry tracking
- ✅ Subscription source tracking (payment, admin_grant, promo, free)
- ✅ Grace period handling
- ✅ Renewal support

### 3. Feature Access Control
- ✅ Centralized subscription access helper
- ✅ Plan-based feature gating
- ✅ AI query limits (Free: 25, Basic: 100, Pro: Unlimited)
- ✅ Code debug limits (Free: 0, Basic: 5, Pro: Unlimited)
- ✅ Premium resume templates (Pro only)
- ✅ Company sheets access (Basic & Pro)
- ✅ Advanced DSA features (Pro only)

### 4. Admin Panel Integration
- ✅ Subscription management view
- ✅ Invoice records
- ✅ Payment transaction logs
- ✅ Billing cycle display
- ✅ Expiry date tracking
- ✅ Revenue analytics

## Pricing Configuration

```typescript
Free Plan: ₹0
Basic Plan:
  - Monthly: ₹259
  - Yearly: ₹2,599 (17% savings)
  
Pro Plan:
  - Monthly: ₹599
  - Yearly: ₹5,999 (17% savings)
```

## API Endpoints

### Payment Endpoints (`/api/payments`)

#### 1. Create Order
```
POST /api/payments/create-order
Authorization: Bearer <token>

Request:
{
  "plan": "pro",
  "billing_cycle": "monthly"
}

Response:
{
  "order_id": "order_xxx",
  "amount": 59900,
  "currency": "INR",
  "key_id": "rzp_test_xxx",
  "plan": "pro",
  "billing_cycle": "monthly",
  "user_name": "John Doe",
  "user_email": "john@example.com"
}
```

#### 2. Verify Payment
```
POST /api/payments/verify
Authorization: Bearer <token>

Request:
{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature_xxx",
  "plan": "pro",
  "billing_cycle": "monthly"
}

Response:
{
  "success": true,
  "message": "Payment successful! Your PRO plan is now active.",
  "subscription_id": 123,
  "invoice_number": "INV-20250403120000"
}
```

#### 3. Get Subscription Status
```
GET /api/payments/subscription/status
Authorization: Bearer <token>

Response:
{
  "has_subscription": true,
  "subscription_id": 123,
  "plan": "pro",
  "billing_cycle": "monthly",
  "source": "payment",
  "status": "active",
  "starts_at": "2025-04-03T12:00:00",
  "expires_at": "2025-05-03T12:00:00",
  "days_remaining": 30
}
```

#### 4. Get Invoices
```
GET /api/payments/invoices
Authorization: Bearer <token>

Response:
[
  {
    "id": 1,
    "invoice_number": "INV-20250403120000",
    "plan_name": "pro",
    "billing_cycle": "monthly",
    "amount_paid": 599,
    "currency": "INR",
    "payment_id": "pay_xxx",
    "validity_period": "03 Apr 2025 to 03 May 2025",
    "invoice_date": "2025-04-03T12:00:00"
  }
]
```

#### 5. Webhook Handler
```
POST /api/payments/webhook
X-Razorpay-Signature: <signature>

Handles:
- payment.captured
- payment.failed
- subscription.charged
- subscription.cancelled
```

### Admin Endpoints

#### Get All Subscriptions
```
GET /api/admin/subscriptions
Authorization: Bearer <admin_token>

Response: Array of subscription records with billing cycle, expiry, source
```

#### Get All Invoices
```
GET /api/admin/invoices
Authorization: Bearer <admin_token>

Response: Array of invoice records
```

## Database Schema

### Subscriptions Table
```sql
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_name VARCHAR(50) NOT NULL,
    billing_cycle VARCHAR(20) NOT NULL,
    source VARCHAR(50) DEFAULT 'payment',
    amount_paid INTEGER DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'INR',
    razorpay_payment_id VARCHAR(255),
    razorpay_order_id VARCHAR(255),
    razorpay_subscription_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    starts_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Invoices Table
```sql
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id INTEGER REFERENCES subscriptions(id) ON DELETE SET NULL,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    plan_name VARCHAR(50) NOT NULL,
    billing_cycle VARCHAR(20) NOT NULL,
    amount_paid INTEGER NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    payment_id VARCHAR(255),
    order_id VARCHAR(255),
    validity_period VARCHAR(100),
    invoice_date TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Payment Webhooks Table
```sql
CREATE TABLE payment_webhooks (
    id SERIAL PRIMARY KEY,
    event_id VARCHAR(255) UNIQUE NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Frontend Integration

### Payment Service
```typescript
import { paymentService, openRazorpayCheckout } from '@/services/paymentService';

// Create order
const orderData = await paymentService.createOrder({
  plan: 'pro',
  billing_cycle: 'monthly'
});

// Open Razorpay checkout
openRazorpayCheckout({
  key: orderData.key_id,
  amount: orderData.amount,
  currency: orderData.currency,
  name: 'CodeCampus AI',
  description: 'PRO Plan - Monthly',
  order_id: orderData.order_id,
  prefill: {
    name: orderData.user_name,
    email: orderData.user_email,
  },
  theme: {
    color: '#667eea',
  },
  handler: async (response) => {
    // Verify payment
    const result = await paymentService.verifyPayment({
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
      plan: 'pro',
      billing_cycle: 'monthly'
    });
    
    if (result.success) {
      // Payment successful
      alert(result.message);
    }
  },
  modal: {
    ondismiss: () => {
      console.log('Payment cancelled');
    },
  },
});
```

## Subscription Access Control

### Backend Usage
```python
from app.core.subscription import SubscriptionAccess

# Check if user has active subscription
has_active = SubscriptionAccess.has_active_subscription(user, db)

# Check if user is PRO
is_pro = SubscriptionAccess.is_pro_user(user, db)

# Check feature access
can_access_premium = SubscriptionAccess.can_access_premium_resumes(user, db)

# Get AI query limit
query_limit = SubscriptionAccess.get_ai_query_limit(user, db)

# Get complete subscription info
info = SubscriptionAccess.get_subscription_info(user, db)
```

## Email Notifications

### Payment Confirmation Email
Sent automatically after successful payment with:
- Subscription details
- Payment information
- Invoice number
- Validity period
- Premium features unlocked
- Dashboard link

## Security Features

1. **Signature Verification**: All payments verified using HMAC SHA256
2. **Server-side Validation**: Amount and plan validated on backend
3. **Idempotent Processing**: Duplicate payments prevented
4. **Webhook Verification**: Webhook signatures verified
5. **Secret Key Protection**: Razorpay secret never exposed to frontend

## Testing

### Test Mode
Currently using Razorpay test keys:
```
RAZORPAY_KEY_ID=rzp_test_SZ3UjrYKuAkesh
RAZORPAY_KEY_SECRET=HnieJyJ7mz4Vx6mqA4f99gPC
```

### Test Cards
Use Razorpay test cards for testing:
- Success: 4111 1111 1111 1111
- Failure: 4000 0000 0000 0002

## Production Deployment

### 1. Update Environment Variables
```bash
# Replace with production keys
RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=your_live_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

### 2. Configure Webhooks
In Razorpay Dashboard:
1. Go to Settings → Webhooks
2. Add webhook URL: `https://your-domain.com/api/payments/webhook`
3. Select events: payment.captured, payment.failed
4. Copy webhook secret to env

### 3. Run Migrations
```bash
cd backend
python3 run_subscriptions_migration.py
```

### 4. Test Payment Flow
1. Create test order
2. Complete payment with test card
3. Verify subscription activated
4. Check invoice generated
5. Confirm email received

## Monitoring

### Admin Dashboard
- View all subscriptions
- Track revenue
- Monitor payment failures
- Check expiring subscriptions
- View invoice history

### Webhook Logs
All webhook events logged in `payment_webhooks` table for debugging.

## Support

### Common Issues

1. **Payment verification failed**
   - Check signature verification
   - Ensure order_id matches
   - Verify Razorpay secret is correct

2. **Subscription not activated**
   - Check payment status in database
   - Verify webhook received
   - Check email logs

3. **Invoice not generated**
   - Check subscription record created
   - Verify invoice number generation
   - Check database constraints

## Future Enhancements

- [ ] Subscription cancellation
- [ ] Plan upgrades/downgrades
- [ ] Refund processing
- [ ] Promo codes
- [ ] Trial periods
- [ ] Subscription pause/resume
- [ ] PDF invoice generation
- [ ] Payment reminders
- [ ] Failed payment retry logic

## Files Modified/Created

### Backend
- `backend/app/routes/payment_routes.py` - Payment endpoints
- `backend/app/core/subscription.py` - Access control helper
- `backend/app/models/__init__.py` - Subscription, Invoice models
- `backend/migrations/create_subscriptions_and_invoices.sql` - Database schema
- `backend/requirements.txt` - Added razorpay package

### Frontend
- `frontend/src/services/paymentService.ts` - Payment API client
- `frontend/src/pages/marketing/PricingPage.tsx` - Razorpay integration
- `frontend/src/pages/admin/AdminPage.tsx` - Admin subscription view
- `frontend/src/services/adminAPI.ts` - Admin API methods

## Conclusion

Complete, production-ready Razorpay payment system with:
- ✅ Secure payment processing
- ✅ Automatic subscription management
- ✅ Invoice generation
- ✅ Email notifications
- ✅ Webhook support
- ✅ Admin panel integration
- ✅ Feature access control
- ✅ Comprehensive error handling

Ready for production deployment with test keys. Replace with live keys when ready to go live.
