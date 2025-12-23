# Razorpay Payment Integration - Detailed Implementation Prompt

## 📋 Project Overview
**Project**: Astra Productions Movie Ticketing Platform  
**Feature**: Razorpay Payment Integration for Ticket Checkout  
**Stack**: Next.js 14 (App Router), TypeScript, Supabase, TailwindCSS  
**Current Status**: Checkout UI complete, payment processing is mocked  

---

## 🎯 Objective
Implement a complete end-to-end payment processing system using Razorpay's Standard Checkout, including:
- Server-side order creation
- Client-side payment processing
- Payment verification & signature validation
- Webhook handling for payment status updates
- Database schema for orders and payments

---

## 📊 Database Schema Changes

### 1. Create `orders` Table
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  event_id TEXT NOT NULL,
  razorpay_order_id TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL, -- Amount in paise (e.g., 50000 for ₹500)
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'created', -- created, attempted, paid, failed, refunded
  payment_method TEXT, -- 'upi' or 'card'
  notes JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_razorpay_id ON orders(razorpay_order_id);
```

### 2. Create `payments` Table
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  razorpay_payment_id TEXT UNIQUE,
  razorpay_signature TEXT,
  status TEXT DEFAULT 'pending', -- pending, authorized, captured, failed
  amount INTEGER NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_payment_id ON payments(razorpay_payment_id);
```

### 3. Update `tickets` Table
```sql
ALTER TABLE tickets ADD COLUMN order_id UUID REFERENCES orders(id);
ALTER TABLE tickets ADD COLUMN payment_status TEXT DEFAULT 'pending';
ALTER TABLE tickets ADD COLUMN razorpay_payment_id TEXT;
```

### 4. Create `refunds` Table
```sql
CREATE TABLE refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  payment_id UUID NOT NULL REFERENCES payments(id),
  razorpay_refund_id TEXT UNIQUE,
  reason TEXT NOT NULL, -- 'customer_request', 'event_cancelled', 'duplicate_payment', 'other'
  amount INTEGER NOT NULL, -- Amount in paise
  status TEXT DEFAULT 'pending', -- pending, processed, failed
  requested_by UUID NOT NULL REFERENCES auth.users(id),
  processed_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_refunds_order_id ON refunds(order_id);
CREATE INDEX idx_refunds_payment_id ON refunds(payment_id);
CREATE INDEX idx_refunds_razorpay_id ON refunds(razorpay_refund_id);
CREATE INDEX idx_refunds_status ON refunds(status);
```

---

## 🔌 API Endpoints

### 1. POST `/api/orders/create`
**Purpose**: Create a Razorpay order before payment  
**Auth**: Required (user must be logged in)  
**Request Body**:
```json
{
  "eventId": "string",
  "categoryId": "string",
  "quantity": "number",
  "unitPrice": "number",
  "totalPrice": "number",
  "paymentMethod": "upi|card"
}
```

**Response (Success - 201)**:
```json
{
  "success": true,
  "order": {
    "id": "uuid",
    "razorpay_order_id": "order_1234567890",
    "amount": 50000,
    "currency": "INR",
    "status": "created"
  }
}
```

**Response (Error - 400/500)**:
```json
{
  "success": false,
  "error": "Failed to create order"
}
```

**Implementation Details**:
- Validate user authentication
- Validate ticket selection data
- Call Razorpay Orders API endpoint:
  ```
  POST https://api.razorpay.com/v1/orders
  Authorization: Basic [Base64(KEY_ID:KEY_SECRET)]
  ```
- Store order in database
- Return razorpay_order_id to client

---

### 2. POST `/api/orders/verify`
**Purpose**: Verify payment signature and mark order as paid  
**Auth**: Required  
**Request Body**:
```json
{
  "razorpay_order_id": "order_1234567890",
  "razorpay_payment_id": "pay_1234567890",
  "razorpay_signature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d"
}
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "order": {
    "id": "uuid",
    "status": "paid"
  }
}
```

**Implementation Details**:
- Extract from request: razorpay_order_id, razorpay_payment_id, razorpay_signature
- Verify signature using HMAC-SHA256:
  ```
  generated_signature = HMAC-SHA256(razorpay_order_id + "|" + razorpay_payment_id, KEY_SECRET)
  ```
- Compare with provided signature (must be EXACTLY equal)
- Update order status to 'paid' in database
- Store payment details in payments table
- Create ticket automatically upon successful verification
- Return success response

**Error Cases**:
- Invalid signature → 401 Unauthorized
- Order not found → 404 Not Found
- Duplicate payment → 400 Bad Request

---

### 3. POST `/api/orders/webhook`
**Purpose**: Handle real-time Razorpay webhook notifications  
**Auth**: Webhook signature verification (Razorpay sends X-Razorpay-Signature header)  
**Webhook Events to Handle**:
- `payment.authorized` → Update order status
- `payment.captured` → Mark as fully paid, create ticket
- `payment.failed` → Update order status, notify user
- `payment.refunded` → Handle refunds

**Request Body (from Razorpay)**:
```json
{
  "event": "payment.captured",
  "created_at": 1677836200,
  "entity": {
    "id": "pay_1234567890",
    "entity": "payment",
    "amount": 50000,
    "currency": "INR",
    "status": "captured",
    "order_id": "order_1234567890",
    "invoice_id": null,
    "international": false,
    "method": "card",
    "amount_refunded": 0,
    "refund_status": null,
    "captured": true,
    "error_code": null,
    "error_description": null,
    "error_source": null,
    "error_reason": null,
    "error_step": null,
    "error_field": null,
    "notes": {},
    "fee": 1180,
    "tax": 0,
    "contact": "+919876543210",
    "email": "gaurav.kumar@example.com",
    "fee_details": null,
    "card_id": "card_1234567890",
    "bank": null,
    "wallet": null,
    "vpa": null,
    "email_verified": null,
    "phone_verified": null,
    "acquirer_data": {
      "auth_code": null
    },
    "recurring": false,
    "settlement_id": null,
    "batch_id": null,
    "receipt": "Receipt No. 1",
    "settlement_batch_id": null,
    "created_at": 1677836200
  }
}
```

**Implementation Details**:
- Verify webhook signature using Razorpay secret
- Extract payment ID and order ID from webhook data
- Update payment status in database based on event type
- For `payment.captured`: Create ticket, send confirmation email
- For `payment.failed`: Send failure notification to user
- Log all webhook events for audit trail
- Return 200 OK immediately to acknowledge receipt

---

### 4. GET `/api/orders/[orderId]`
**Purpose**: Fetch order status and payment details  
**Auth**: Required (user can only see their own orders)  
**Response (Success - 200)**:
```json
{
  "success": true,
  "order": {
    "id": "uuid",
    "razorpay_order_id": "order_1234567890",
    "amount": 50000,
    "status": "paid",
    "payment": {
      "razorpay_payment_id": "pay_1234567890",
      "status": "captured",
      "created_at": "2024-12-23T10:30:00Z"
    }
  }
}
```

---

## 💰 Refund System

### 5. POST `/api/refunds/create`
**Purpose**: Create a refund request for a paid order  
**Auth**: Required (user can only refund their own orders)  
**Request Body**:
```json
{
  "orderId": "uuid",
  "reason": "customer_request|event_cancelled|duplicate_payment|other",
  "notes": "optional explanation"
}
```

**Response (Success - 201)**:
```json
{
  "success": true,
  "refund": {
    "id": "uuid",
    "razorpay_refund_id": "rfnd_1234567890",
    "orderId": "uuid",
    "amount": 50000,
    "status": "pending",
    "reason": "customer_request",
    "created_at": "2024-12-23T10:30:00Z"
  }
}
```

**Response (Error)**:
```json
{
  "success": false,
  "error": "Order not found or already refunded"
}
```

**Implementation Details**:
- Validate user authentication
- Verify order belongs to user
- Check if order status is 'paid' or 'captured'
- Validate refund reason
- Call Razorpay Refund API:
  ```
  POST https://api.razorpay.com/v1/payments/{razorpay_payment_id}/refund
  Authorization: Basic [Base64(KEY_ID:KEY_SECRET)]
  Body: {
    "amount": 50000,
    "notes": {
      "reason": "customer_request",
      "notes": "customer explanation"
    }
  }
  ```
- Store refund request in database
- Return refund details to client

**Error Cases**:
- Order not found → 404
- Order already refunded → 400
- User not authorized → 403
- Payment not captured → 400

---

### 6. POST `/api/refunds/webhook`
**Purpose**: Handle Razorpay refund webhook notifications  
**Webhook Event**: `refund.created`, `refund.processed`, `refund.failed`

**Request Body (from Razorpay)**:
```json
{
  "event": "refund.processed",
  "created_at": 1677836200,
  "entity": {
    "id": "rfnd_1234567890",
    "entity": "refund",
    "payment_id": "pay_1234567890",
    "amount": 50000,
    "currency": "INR",
    "receipt": null,
    "reason": null,
    "notes": {
      "reason": "customer_request"
    },
    "receipt": "Receipt No. 1",
    "status": "processed",
    "created_at": 1677836200
  }
}
```

**Implementation Details**:
- Verify webhook signature
- Extract refund_id and payment_id
- Update refund status in database based on event type
- For `refund.processed`: Mark order as refunded, send confirmation email, cancel ticket
- For `refund.failed`: Notify user of failure, log error
- Return 200 OK immediately

---

### 7. GET `/api/refunds/[refundId]`
**Purpose**: Check refund status  
**Auth**: Required  
**Response (Success - 200)**:
```json
{
  "success": true,
  "refund": {
    "id": "uuid",
    "orderId": "uuid",
    "amount": 50000,
    "status": "processed",
    "reason": "customer_request",
    "razorpay_refund_id": "rfnd_1234567890",
    "processed_at": "2024-12-23T10:35:00Z"
  }
}
```

---

### 8. GET `/api/refunds/user`
**Purpose**: Get all refunds for logged-in user  
**Auth**: Required  
**Query Parameters**:
```
?status=pending|processed|failed (optional)
?limit=10 (optional, default: 10)
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "refunds": [
    {
      "id": "uuid",
      "orderId": "uuid",
      "amount": 50000,
      "status": "processed",
      "reason": "customer_request",
      "created_at": "2024-12-23T10:30:00Z",
      "processed_at": "2024-12-23T10:35:00Z"
    }
  ],
  "total": 5
}
```

---

## 🔄 Refund Flow Diagram

```
User clicks "Request Refund" on ticket
         ↓
User selects reason (customer_request, event_cancelled, etc)
         ↓
Frontend calls POST /api/refunds/create
         ↓
Backend validates order & creates refund request
         ↓
Backend calls Razorpay Refund API
         ↓
Razorpay processes refund asynchronously
         ↓
Backend returns refund_id (status: pending)
         ↓
Frontend shows "Refund requested - Processing..."
         ↓
(Async) Razorpay sends webhook: refund.processed
         ↓
Backend updates refund status to "processed"
         ↓
Backend cancels/invalidates ticket
         ↓
Backend sends refund confirmation email to user
         ↓
User can check refund status via GET /api/refunds/[refundId]
```

---

## 📄 Refund Terms & Policy

Add to Terms of Service:

```
### Refund Policy

1. **Refund Eligibility**
   - Refunds are available for cancelled events
   - Refunds due to customer error (duplicate booking, wrong selection)
   - Special circumstances (event postponement, technical issues)

2. **Refund Timeline**
   - Refund requests processed within 2-3 business days
   - Bank transfer takes 5-7 business days to appear in your account
   - Event cancellations refunded immediately

3. **Non-Refundable Cases**
   - No-show to event
   - Partial attendance
   - Lost/damaged physical tickets (if applicable)

4. **How to Request a Refund**
   - Log in to your account
   - Go to "My Tickets"
   - Click "Request Refund"
   - Select reason and submit
   - Track refund status in real-time

5. **Refund Status**
   - Pending: Under review
   - Processed: Refund has been initiated
   - Failed: Contact support for assistance
```

---

## 🔐 Security Requirements

### API Keys Management
- Store `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.env.local`
- **NEVER** expose `RAZORPAY_KEY_SECRET` to frontend
- Use different keys for Test and Production modes
- Rotate keys periodically

### Signature Verification
- Always verify `razorpay_signature` on the server
- Use HMAC-SHA256 algorithm
- Compare signatures in constant-time to prevent timing attacks

### Request Validation
- Validate user authentication before processing orders
- Verify order amount matches the calculated price (prevent tampering)
- Rate limit order creation endpoint (max 10 orders per minute per user)

### Webhook Security
- Verify webhook signature from Razorpay header: `X-Razorpay-Signature`
- Implement webhook signature verification using the same KEY_SECRET
- Idempotency: Handle duplicate webhook events gracefully
- Store webhook event IDs to prevent reprocessing

---

## 🎨 Frontend Integration

### Checkout Page Updates (`app/checkout/page.tsx`)

1. **Load Razorpay Script**
```tsx
useEffect(() => {
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.async = true;
  document.body.appendChild(script);
}, []);
```

2. **Create Order on Payment Step**
```tsx
const handleCreateOrder = async () => {
  const response = await fetch('/api/orders/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventId: ticketSelection.eventId,
      categoryId: ticketSelection.categoryId,
      quantity: ticketSelection.quantity,
      unitPrice: ticketSelection.unitPrice,
      totalPrice: ticketSelection.totalPrice,
      paymentMethod: paymentMethod
    })
  });
  const data = await response.json();
  return data.order.razorpay_order_id;
};
```

3. **Initialize Razorpay Checkout**
```tsx
const handlePayment = async () => {
  const orderId = await handleCreateOrder();
  
  const options = {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    amount: ticketSelection.totalPrice * 100, // Convert to paise
    currency: 'INR',
    name: 'Astra Productions',
    description: ticketSelection.eventTitle,
    order_id: orderId,
    prefill: {
      name: fullName,
      email: email,
      contact: phone
    },
    handler: function(response) {
      verifyPayment(response);
    },
    modal: {
      ondismiss: function() {
        toast({
          title: 'Payment Cancelled',
          description: 'You closed the payment window.',
          variant: 'destructive'
        });
      }
    },
    theme: {
      color: '#FF6B35' // Your brand color
    }
  };
  
  const rzp = new window.Razorpay(options);
  rzp.open();
};
```

4. **Verify Payment on Success**
```tsx
const verifyPayment = async (response) => {
  setIsProcessing(true);
  try {
    const verifyResponse = await fetch('/api/orders/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature
      })
    });
    
    if (verifyResponse.ok) {
      setStep('success');
      toast({
        title: 'Payment Successful!',
        description: 'Your tickets have been booked.'
      });
    } else {
      throw new Error('Payment verification failed');
    }
  } catch (error) {
    toast({
      title: 'Verification Failed',
      description: error.message,
      variant: 'destructive'
    });
  }
  setIsProcessing(false);
};
```

### Environment Variables
```env
# Test Keys (from Razorpay Dashboard)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx

# Webhook Secret
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

---

## 🎨 Refund Frontend Integration

### Add Refund Request Modal/Page

**In Ticket Details Page** (`app/tickets/[id]/page.tsx`):

```tsx
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function TicketPage() {
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [refundNotes, setRefundNotes] = useState('');
  const [isRefundProcessing, setIsRefundProcessing] = useState(false);

  const handleRequestRefund = async () => {
    if (!refundReason) {
      toast({
        title: 'Select Reason',
        description: 'Please select a reason for refund',
        variant: 'destructive'
      });
      return;
    }

    setIsRefundProcessing(true);
    try {
      const response = await fetch('/api/refunds/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: ticket.order_id,
          reason: refundReason,
          notes: refundNotes
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Refund Requested',
          description: 'Your refund request has been submitted. Processing will take 2-3 business days.',
          variant: 'default'
        });
        setRefundDialogOpen(false);
        // Refresh ticket data
        window.location.reload();
      } else {
        throw new Error(data.error || 'Failed to request refund');
      }
    } catch (error) {
      toast({
        title: 'Refund Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
    setIsRefundProcessing(false);
  };

  return (
    <>
      {/* Ticket Details */}
      <div className="space-y-6">
        {/* ... existing ticket info ... */}

        {/* Refund Button - Show only if ticket is paid and not refunded */}
        {ticket.payment_status === 'captured' && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setRefundDialogOpen(true)}
          >
            Request Refund
          </Button>
        )}

        {/* Refund Status - Show if refund exists */}
        {ticket.refund_status && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-700 mb-2">Refund Status</h4>
            <p className="text-sm text-yellow-600">
              Status: <span className="font-semibold capitalize">{ticket.refund_status}</span>
            </p>
            {ticket.refund_processed_date && (
              <p className="text-sm text-yellow-600 mt-1">
                Processed: {new Date(ticket.refund_processed_date).toLocaleDateString()}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Refund Request Dialog */}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Refund</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Reason for Refund</label>
              <Select value={refundReason} onValueChange={setRefundReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer_request">Customer Request</SelectItem>
                  <SelectItem value="event_cancelled">Event Cancelled</SelectItem>
                  <SelectItem value="duplicate_payment">Duplicate Payment</SelectItem>
                  <SelectItem value="other">Other Reason</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Additional Notes (Optional)</label>
              <Textarea
                placeholder="Explain your reason for requesting a refund..."
                value={refundNotes}
                onChange={(e) => setRefundNotes(e.target.value)}
                className="min-h-24"
              />
            </div>

            <div className="bg-muted/50 rounded p-3 text-sm">
              <p className="font-medium mb-2">Refund Details</p>
              <div className="space-y-1 text-muted-foreground">
                <p>Amount: ₹{ticket.amount.toLocaleString()}</p>
                <p>Processing Time: 2-3 business days</p>
                <p>Bank Transfer: 5-7 business days</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setRefundDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="coral"
                className="flex-1"
                onClick={handleRequestRefund}
                disabled={isRefundProcessing || !refundReason}
              >
                {isRefundProcessing ? 'Processing...' : 'Request Refund'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

---

## 🧪 Testing Checklist

### Test Payment Cards
- **Visa**: 4111 1111 1111 1111 (Success)
- **Mastercard**: 5555 5555 5555 4444 (Success)
- **Failed Card**: 4000 0000 0000 0002 (Failure)

### Test UPI
- UPI ID: success@razorpay (auto-success)
- UPI ID: failure@razorpay (auto-failure)

### Test Scenarios
- [ ] Create order successfully
- [ ] Complete payment with card
- [ ] Complete payment with UPI
- [ ] Verify payment signature correctly
- [ ] Handle failed payment
- [ ] Verify webhook notifications received
- [ ] Ticket created after payment captured
- [ ] User receives confirmation email
- [ ] Order status updates in real-time
- [ ] Request refund successfully
- [ ] Refund webhook processed
- [ ] Ticket becomes invalid after refund
- [ ] Refund confirmation email received
- [ ] Check refund status via API
- [ ] Partial refund handling (if enabled)

---

## 🔐 Refund Security Requirements

### Authorization & Validation
- Only users who created the order can request refunds
- Verify order status is 'paid' before allowing refund
- Check refund hasn't already been requested
- Prevent duplicate refund requests within 24 hours

### Amount Validation
- Verify refund amount matches order amount (for full refunds)
- Implement partial refund limits if needed
- Log all refund amount changes

### Webhook Security for Refunds
- Verify refund webhook signature
- Match refund_id with database record
- Handle race conditions (webhook arrives before DB update)
- Idempotency: Don't process same refund twice

### Audit Trail
- Log all refund requests with reason and notes
- Track who requested the refund and when
- Store refund history for compliance
- Keep email logs of refund communications

---

## 📝 File Structure (with Refunds)

```
app/
├── api/
│   ├── orders/
│   │   ├── create/
│   │   │   └── route.ts
│   │   ├── verify/
│   │   │   └── route.ts
│   │   ├── webhook/
│   │   │   └── route.ts
│   │   └── [orderId]/
│   │       └── route.ts
│   │
│   └── refunds/                 ✨ NEW
│       ├── create/
│       │   └── route.ts         (Request refund)
│       ├── webhook/
│       │   └── route.ts         (Refund webhooks)
│       ├── [refundId]/
│       │   └── route.ts         (Get refund status)
│       └── user/
│           └── route.ts         (List user refunds)
│
└── checkout/
    └── page.tsx

src/
├── lib/
│   ├── razorpay.ts
│   ├── verification.ts
│   └── refunds.ts               ✨ NEW (Refund utilities)
│
└── hooks/
    ├── useRazorpay.ts
    └── useRefunds.ts            ✨ NEW (Refund hook)

supabase/
└── migrations/
    ├── 004_add_orders_payments.sql
    └── 005_add_refunds.sql      ✨ NEW
```

---

## 🚀 Deployment Checklist

### Before Going Live

1. **Switch to Production Keys**
   - Generate live API keys from Razorpay Dashboard
   - Update environment variables

2. **Webhook Configuration**
   - Register webhook URL in Razorpay Dashboard
   - Format: `https://yourdomain.com/api/orders/webhook`
   - Verify signature is working

3. **Payment Settings**
   - Enable auto-capture in Razorpay Dashboard (recommended)
   - Configure payment methods (UPI, Card)
   - Set settlement schedule

4. **Email Notifications**
   - Configure email templates for:
     - Payment successful
     - Payment failed
     - Ticket confirmation

5. **Monitoring**
   - Set up error tracking (Sentry)
   - Monitor webhook delivery
   - Track payment success rate

6. **Legal/Compliance**
   - Add payment terms to website
   - Display refund policy
   - Ensure PCI compliance
   - Update privacy policy

---

## 📝 File Structure

```
app/
├── api/
│   └── orders/
│       ├── create/
│       │   └── route.ts          (Create order)
│       ├── verify/
│       │   └── route.ts          (Verify signature)
│       ├── webhook/
│       │   └── route.ts          (Webhook handler)
│       └── [orderId]/
│           └── route.ts          (Get order status)
│
└── checkout/
    └── page.tsx                  (Updated with Razorpay integration)

src/
├── lib/
│   ├── razorpay.ts              (Razorpay utilities)
│   └── verification.ts          (Signature verification)
│
└── hooks/
    └── useRazorpay.ts           (Payment hook)

supabase/
└── migrations/
    └── 004_add_orders_payments.sql  (Database migration)
```

---

## 🔄 Payment Flow Diagram

```
User selects tickets
         ↓
Clicks "Proceed to Payment"
         ↓
Frontend calls POST /api/orders/create
         ↓
Backend creates Razorpay order
         ↓
Returns order_id to frontend
         ↓
Frontend opens Razorpay Checkout with order_id
         ↓
User completes payment (card/UPI)
         ↓
Razorpay returns payment details to checkout
         ↓
Frontend calls POST /api/orders/verify with signature
         ↓
Backend verifies signature & updates order status
         ↓
Backend creates ticket
         ↓
Frontend shows success page
         ↓
(Simultaneously) Razorpay sends webhook notification
         ↓
Backend handles webhook, sends confirmation email
```

---

## ⚠️ Important Notes

1. **Order Creation is Mandatory**: An order MUST be created before initiating payment. Payments without order_id cannot be captured.

2. **Signature Verification is Non-Negotiable**: Always verify the signature on the server side to prevent payment fraud.

3. **Webhook Implementation**: Set up webhooks for asynchronous payment status updates. Don't rely solely on client-side callbacks.

4. **Idempotency**: Handle duplicate webhook events gracefully to prevent creating multiple tickets for one payment.

5. **Error Handling**: Implement proper error messages and user guidance for common failure scenarios.

6. **Logging**: Log all payment-related transactions for audit and compliance purposes.

---

## 📚 Helpful Resources

- Razorpay Documentation: https://razorpay.com/docs/
- Orders API: https://razorpay.com/docs/api/orders/
- Webhooks: https://razorpay.com/docs/webhooks/
- Testing: https://razorpay.com/docs/payments/payments/test-mode/
- SDKs: https://razorpay.com/docs/payments/sdks/

---

## 👤 Implementation Owner
**Status**: Pending Implementation  
**Estimated Time**: 2-3 days  
**Priority**: High (Blocking Feature)

---

## 🧾 Invoice Generation System

### Overview
After successful payment, generate a professional PDF invoice that users can download or receive via WhatsApp using the existing MSG91 edge function.

### Invoice Features
- ✅ Professional PDF with brand styling
- ✅ Order & payment details
- ✅ Ticket QR code for validation
- ✅ Download link in app
- ✅ WhatsApp delivery option
- ✅ Email attachment option

---

## 📄 Invoice Edge Function

### New Edge Function: `generate-invoice`

**Purpose**: Generate PDF invoice and store in Supabase Storage  
**File Path**: `supabase/functions/generate-invoice/index.ts`  
**Runtime**: Deno  
**Auth**: Verify JWT (only authenticated users can generate their invoices)

**Request Body**:
```json
{
  "orderId": "uuid",
  "ticketId": "uuid"
}
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "invoice": {
    "id": "uuid",
    "filename": "Invoice_ORD_2024_001.pdf",
    "downloadUrl": "https://storage.supabase.co/...",
    "publicUrl": "https://storage.supabase.co/...",
    "size": 245000,
    "generatedAt": "2024-12-23T10:30:00Z"
  }
}
```

**Implementation Details**:

```typescript
// supabase/functions/generate-invoice/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js";

// Use https://deno.land/x/pdf for PDF generation
import { PDF } from "https://deno.land/x/pdf@0.38.0/mod.ts";
import QRCode from "npm:qrcode@1.5.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Invoice {
  orderId: string;
  ticketId: string;
}

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const body: Invoice = await req.json();
    const { orderId, ticketId } = body;

    if (!orderId || !ticketId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing orderId or ticketId",
        }),
        {
          status: 400,
          headers: { "content-type": "application/json", ...corsHeaders },
        }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, payments(*), user:user_id(*)")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      throw new Error("Order not found");
    }

    // Fetch ticket details
    const { data: ticket, error: ticketError } = await supabase
      .from("tickets")
      .select("*")
      .eq("id", ticketId)
      .single();

    if (ticketError || !ticket) {
      throw new Error("Ticket not found");
    }

    // Generate QR code for ticket validation
    const qrCode = await QRCode.toDataURL(ticketId, {
      width: 200,
      margin: 1,
      color: { dark: "#000", light: "#FFF" },
    });

    // Create PDF
    const pdf = new PDF();
    
    // Header
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(24);
    pdf.text("ASTRA PRODUCTIONS", 20, 20);
    
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text("Movie Ticketing Platform", 20, 28);
    pdf.text("Invoice", 170, 20);
    
    // Invoice number and date
    pdf.setFontSize(9);
    pdf.text(`Invoice #: INV-${order.id.slice(0, 8).toUpperCase()}`, 20, 40);
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 46);
    pdf.text(`Order ID: ${order.razorpay_order_id}`, 20, 52);

    // Customer details
    pdf.setFont("helvetica", "bold");
    pdf.text("BILL TO:", 20, 65);
    pdf.setFont("helvetica", "normal");
    pdf.text(order.user.name || "N/A", 20, 72);
    pdf.text(order.user.email, 20, 78);
    pdf.text(order.user.phone || "N/A", 20, 84);

    // Event details
    pdf.setFont("helvetica", "bold");
    pdf.text("EVENT DETAILS:", 20, 97);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Event: ${ticket.event_title}`, 20, 104);
    pdf.text(`Category: ${ticket.category_name}`, 20, 110);
    pdf.text(`Date: ${ticket.event_date}`, 20, 116);
    pdf.text(`Venue: ${ticket.venue}`, 20, 122);

    // Table header
    const tableTop = 135;
    pdf.setFont("helvetica", "bold");
    pdf.setFillColor(240, 240, 240);
    pdf.rect(20, tableTop, 170, 7, "F");
    pdf.text("Description", 25, tableTop + 5);
    pdf.text("Qty", 100, tableTop + 5);
    pdf.text("Rate", 130, tableTop + 5);
    pdf.text("Amount", 155, tableTop + 5);

    // Table data
    pdf.setFont("helvetica", "normal");
    const rowHeight = 7;
    let yPos = tableTop + rowHeight + 2;

    pdf.text("Ticket", 25, yPos);
    pdf.text(String(ticket.quantity), 100, yPos);
    pdf.text(`₹${ticket.unit_price?.toLocaleString() || "N/A"}`, 130, yPos);
    pdf.text(`₹${order.amount / 100}`, 155, yPos);

    yPos += rowHeight + 5;

    // Total
    pdf.setFont("helvetica", "bold");
    pdf.line(20, yPos - 2, 190, yPos - 2);
    pdf.text("Total Amount", 25, yPos);
    pdf.text(`₹${order.amount / 100}`, 155, yPos);

    // Payment details
    yPos += 15;
    pdf.setFont("helvetica", "bold");
    pdf.text("PAYMENT DETAILS:", 20, yPos);
    pdf.setFont("helvetica", "normal");
    yPos += 7;
    pdf.text(`Payment Method: ${order.payment_method?.toUpperCase() || "N/A"}`, 20, yPos);
    yPos += 6;
    pdf.text(`Transaction ID: ${order.payments?.[0]?.razorpay_payment_id || "N/A"}`, 20, yPos);
    yPos += 6;
    pdf.text(`Status: ${order.status.toUpperCase()}`, 20, yPos);

    // QR Code
    yPos += 20;
    pdf.text("TICKET QR CODE:", 20, yPos);
    yPos += 8;
    const qrImageData = qrCode.split(",")[1]; // Get base64 part
    pdf.addImage(qrImageData, "PNG", 20, yPos, 40, 40);

    // Footer
    yPos += 50;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.text("Thank you for your booking! Please present this invoice at the venue.", 20, yPos);
    yPos += 5;
    pdf.text("For support, contact: astraproduction@gmail.com | +91 9876543210", 20, yPos);
    yPos += 5;
    pdf.text("Valid only with original ticket QR code.", 20, yPos);

    // Get PDF as buffer
    const pdfBuffer = pdf.output("arraybuffer");

    // Upload to Supabase Storage
    const filename = `Invoice_${order.razorpay_order_id}_${Date.now()}.pdf`;
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from("invoices")
      .upload(filename, pdfBuffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("invoices")
      .getPublicUrl(filename);

    // Get signed URL (valid for 7 days)
    const { data: signedUrlData } = await supabase.storage
      .from("invoices")
      .createSignedUrl(filename, 7 * 24 * 60 * 60); // 7 days

    // Store invoice reference in database
    const { error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        order_id: orderId,
        ticket_id: ticketId,
        filename: filename,
        storage_path: filename,
        public_url: publicUrlData?.publicUrl,
        signed_url: signedUrlData?.signedUrl,
        file_size: pdfBuffer.byteLength,
        generated_at: new Date().toISOString(),
      });

    if (invoiceError) {
      console.error("Invoice DB error:", invoiceError);
      // Don't fail - file is already uploaded
    }

    return new Response(
      JSON.stringify({
        success: true,
        invoice: {
          id: uploadData?.path || filename,
          filename: filename,
          downloadUrl: signedUrlData?.signedUrl || publicUrlData?.publicUrl,
          publicUrl: publicUrlData?.publicUrl,
          size: pdfBuffer.byteLength,
          generatedAt: new Date().toISOString(),
        },
      }),
      {
        status: 200,
        headers: { "content-type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: String(error),
      }),
      {
        status: 500,
        headers: { "content-type": "application/json", ...corsHeaders },
      }
    );
  }
});
```

---

## 📊 Invoice Database Schema

```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  ticket_id UUID NOT NULL REFERENCES tickets(id),
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT,
  signed_url TEXT,
  file_size INTEGER,
  generated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_invoices_order_id ON invoices(order_id);
CREATE INDEX idx_invoices_ticket_id ON invoices(ticket_id);
```

---

## 🔌 API Endpoint for Invoice Download

### POST `/api/invoices/generate`
**Purpose**: Trigger invoice generation  
**Auth**: Required  
**Request Body**:
```json
{
  "orderId": "uuid",
  "ticketId": "uuid"
}
```

**Implementation**:
```typescript
// app/api/invoices/generate/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, ticketId } = body;

    // Verify user authentication
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Call edge function
    const response = await fetch(
      `${process.env.SUPABASE_URL}/functions/v1/generate-invoice`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          apikey: process.env.SUPABASE_ANON_KEY || "",
        },
        body: JSON.stringify({ orderId, ticketId }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
```

### GET `/api/invoices/[orderId]`
**Purpose**: Fetch generated invoices for an order  
**Response**:
```json
{
  "success": true,
  "invoices": [
    {
      "id": "uuid",
      "filename": "Invoice_ORD_2024_001.pdf",
      "downloadUrl": "https://...",
      "generatedAt": "2024-12-23T10:30:00Z"
    }
  ]
}
```

---

## 🎨 Frontend Integration

### Success Page with Invoice Download

```tsx
// In app/checkout/page.tsx (Success Step)

import { Download, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutSuccess() {
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);

  const handleGenerateInvoice = async () => {
    setIsGeneratingInvoice(true);
    try {
      const response = await fetch("/api/invoices/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: createdTicketId, // or actual order ID
          ticketId: createdTicketId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setInvoiceUrl(data.invoice.downloadUrl);
        toast({
          title: "Invoice Generated",
          description: "Your invoice is ready to download",
        });
      } else {
        throw new Error(data.error || "Failed to generate invoice");
      }
    } catch (error) {
      toast({
        title: "Invoice Generation Failed",
        description: error instanceof Error ? error.message : "Try again",
        variant: "destructive",
      });
    }
    setIsGeneratingInvoice(false);
  };

  const handleSendViaWhatsApp = async () => {
    if (!invoiceUrl) {
      toast({
        title: "Generate Invoice First",
        description: "Please generate the invoice before sending",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/whatsapp/send-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: user?.phone,
          link: invoiceUrl,
          filename: "Invoice.pdf",
          body1: `Your ticket for ${ticketSelection.eventTitle}`,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Sent via WhatsApp",
          description: "Invoice sent to your WhatsApp number",
        });
      } else {
        throw new Error("Failed to send via WhatsApp");
      }
    } catch (error) {
      toast({
        title: "WhatsApp Send Failed",
        description: error instanceof Error ? error.message : "Try again",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="pt-24 pb-20 bg-background min-h-screen">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-lg mx-auto text-center">
            {/* Success message */}
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-4">
              Payment Successful!
            </h1>
            <p className="text-muted-foreground mb-8">
              Your tickets have been booked successfully.
            </p>

            {/* Booking details */}
            <div className="bg-cinema-card rounded-2xl p-6 border border-border mb-8 text-left">
              <h3 className="font-semibold text-foreground mb-4">Booking Details</h3>
              {/* ... booking details ... */}
            </div>

            {/* Invoice Section */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6 mb-8">
              <h3 className="font-semibold text-foreground mb-4">📄 Download Invoice</h3>
              
              {!invoiceUrl ? (
                <p className="text-sm text-muted-foreground mb-4">
                  Generate your invoice to download or share via WhatsApp
                </p>
              ) : (
                <p className="text-sm text-green-600 mb-4">✓ Invoice ready!</p>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                {!invoiceUrl ? (
                  <Button
                    variant="coral"
                    className="flex-1 gap-2"
                    onClick={handleGenerateInvoice}
                    disabled={isGeneratingInvoice}
                  >
                    {isGeneratingInvoice ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Generate Invoice
                      </>
                    )}
                  </Button>
                ) : (
                  <>
                    <a href={invoiceUrl} download className="flex-1">
                      <Button variant="coral" className="w-full gap-2">
                        <Download className="w-4 h-4" />
                        Download Invoice
                      </Button>
                    </a>
                    <Button
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={handleSendViaWhatsApp}
                    >
                      <Mail className="w-4 h-4" />
                      Send via WhatsApp
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* View Ticket & Home buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
              <Link href={createdTicketId ? `/tickets/${createdTicketId}` : "/tickets"}>
                <Button variant="coral" size="lg" className="rounded-full gap-2">
                  <TicketIcon className="w-4 h-4" />
                  View Ticket
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" size="lg" className="rounded-full">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
```

---

## 📝 Ticket Details Page - Invoice Download

```tsx
// app/tickets/[id]/page.tsx

export default function TicketDetailsPage() {
  const [invoice, setInvoice] = useState<any>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      const response = await fetch(`/api/invoices/${ticket.order_id}`);
      const data = await response.json();
      if (data.invoices?.[0]) {
        setInvoice(data.invoices[0]);
      }
    };
    fetchInvoice();
  }, [ticket.order_id]);

  return (
    <>
      {/* Ticket details */}

      {/* Invoice Section */}
      {invoice && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-600" />
              <div>
                <p className="text-sm font-medium">Invoice Available</p>
                <p className="text-xs text-muted-foreground">
                  Generated {new Date(invoice.generatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <a href={invoice.downloadUrl} download>
                <Button size="sm" variant="outline" gap="1">
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

---

## 🔗 Integration with WhatsApp Function

### New Wrapper Endpoint: `POST /api/whatsapp/send-invoice`

```typescript
// app/api/whatsapp/send-invoice/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, link, filename, body1 } = body;

    // Call your existing WhatsApp edge function
    const response = await fetch(
      `${process.env.SUPABASE_URL}/functions/v1/send-document-whatsapp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.SUPABASE_ANON_KEY || "",
        },
        body: JSON.stringify({
          to,
          link,
          filename,
          body1,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
```

---

## 🧪 Invoice Testing Checklist

- [ ] Invoice generates successfully after payment
- [ ] PDF contains all order details (event, date, venue, etc.)
- [ ] QR code appears on invoice and is scannable
- [ ] Invoice downloads correctly
- [ ] Invoice uploads to Supabase Storage
- [ ] Multiple invoice downloads work
- [ ] Invoice can be sent via WhatsApp
- [ ] WhatsApp message includes PDF attachment
- [ ] Signed URL expires after 7 days
- [ ] Invoice metadata stored in database
- [ ] PDF file size is reasonable (<500KB)
- [ ] Invoice filename is unique per order

---

## 📝 File Structure (with Invoices)

```
supabase/
├── functions/
│   ├── send-document-whatsapp/      (Your existing function)
│   │   └── index.ts
│   └── generate-invoice/            ✨ NEW
│       ├── index.ts
│       └── deno.json
│
└── migrations/
    └── 006_add_invoices.sql         ✨ NEW

app/
├── api/
│   ├── invoices/                    ✨ NEW
│   │   ├── generate/
│   │   │   └── route.ts
│   │   └── [orderId]/
│   │       └── route.ts
│   │
│   └── whatsapp/                    ✨ NEW
│       └── send-invoice/
│           └── route.ts
│
└── checkout/
    └── page.tsx (updated with invoice section)
```

---

## 🚀 Deployment Steps for Invoice System

1. **Create Supabase Storage Bucket**
   ```
   Bucket name: invoices
   Public: true (for direct download links)
   ```

2. **Deploy Edge Function**
   ```bash
   supabase functions deploy generate-invoice
   ```

3. **Run Database Migration**
   ```bash
   supabase migration up
   ```

4. **Update Environment Variables**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=...
   SUPABASE_ANON_KEY=...
   ```

5. **Test Invoice Generation**
   - Complete payment
   - Click "Generate Invoice"
   - Verify PDF downloads
   - Test WhatsApp sending

---

## 💡 Invoice Workflow Summary

```
Payment Successful
        ↓
User sees "Generate Invoice" button
        ↓
User clicks button / Calls /api/invoices/generate
        ↓
Edge function generate-invoice starts
        ↓
Fetches order + ticket details
        ↓
Generates PDF with PDFKit
        ↓
Adds QR code for ticket validation
        ↓
Uploads to Supabase Storage (invoices bucket)
        ↓
Generates signed URL (7-day expiry)
        ↓
Stores invoice metadata in DB
        ↓
Returns download URL to frontend
        ↓
User can:
  ├─ Download invoice directly
  ├─ Send via WhatsApp (uses existing function)
  └─ Share link
```

---

### What Gets Added for Refunds:

| Component | Details |
|-----------|---------|
| **Database** | 1 new table (`refunds`), 3 new columns in `tickets` |
| **API Endpoints** | 4 new endpoints (create, webhook, status, list) |
| **Frontend** | Refund dialog modal, refund status display |
| **Security** | Signature verification, authorization checks |
| **Webhooks** | 3 refund events (created, processed, failed) |
| **Testing** | 5 new test scenarios |
| **Documentation** | Refund policy, terms, user guide |

### Refund Processor Rules:

1. **Automatic Processing**
   - Partial refunds: Manual review (implement in v2)
   - Full refunds: Auto-process if within 30 days
   - Event cancelled: Auto-approve all refunds

2. **Refund Timing**
   - Admin approval: 24 hours
   - Razorpay processing: 2-3 business days
   - Bank transfer: 5-7 business days

3. **Ticket Invalidation**
   - After refund processed → Ticket becomes invalid
   - Customer receives notification
   - QR code disabled in system

### Cost Implications:
- **Razorpay Refund Fee**: Usually 0% (included in payment fee)
- **Bank Charges**: Minimal or covered by Razorpay
- **No additional infrastructure cost**

### Compliance Checklist:
- ✅ RBI Guidelines for refunds followed
- ✅ Consumer protection compliant
- ✅ Audit trail maintained
- ✅ Terms clearly communicated
- ✅ No hidden refund conditions
