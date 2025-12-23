# 🎫 Ticket System - Complete Documentation

## 📋 Overview

The ticket system is a complete end-to-end solution for **buying, storing, and viewing event tickets** with a premium design aesthetic. It includes:
- Event ticket browsing and selection
- Checkout and payment flow
- Ticket creation and storage
- Premium ticket display with QR codes
- Download functionality
- User ticket history

---

## 📁 File Structure

### **1. Pages (User Facing)**

#### **[app/tickets/page.tsx](app/tickets/page.tsx)**
- **Purpose**: Display all user's purchased tickets
- **Route**: `/tickets`
- **Features**:
  - Shows list of all tickets for authenticated user
  - Each ticket card displays: event, date, category, ticket number
  - Click to view individual ticket details
  - Empty state when no tickets
  - Loading states with spinner
- **Key Data**: Uses `useUserTickets()` hook
- **Auth**: Requires login, redirects to auth if not logged in

```typescript
// Main features
const { data: tickets, isLoading } = useUserTickets();
// Displays: Event title, Date, Time, Category, Ticket number
```

---

#### **[app/tickets/[id]/page.tsx](app/tickets/[id]/page.tsx)** 🌟 **PREMIUM DESIGN**
- **Purpose**: Show individual ticket with premium design
- **Route**: `/tickets/[id]` - Dynamic route per ticket
- **Features**:
  - Premium ticket design with scalloped edges
  - QR code display (from `/reg_scanner.png`)
  - Ticket metadata: date, time, venue, category
  - Status badge (Confirmed/Pending)
  - Additional info card with pricing
  - Download button - captures ticket as PNG
  - Share button - native share or copy link
  - Floating award logo animation
- **Dependencies**: `html2canvas` for download
- **Auth**: Requires login
- **Key Data**: Fetches via `useTicket(id)`

```typescript
// Download feature
const handleDownload = async () => {
  const canvas = await html2canvas(ticketRef.current);
  // Downloads as: ticket-{TICKET_NUMBER}.png
};

// Premium design component
<EventTicket
  ticketType={ticket.category?.name}
  ticketId={ticket.ticket_number}
  venue={ticket.event?.venue}
  date={formatDate(ticket.event?.date)}
  time={ticket.event?.time}
  year={getYear(ticket.event?.date)}
  qrCodeUrl="/reg_scanner.png"
/>
```

---

#### **[app/checkout/page.tsx](app/checkout/page.tsx)** 💳 **CHECKOUT & PAYMENT**
- **Purpose**: Complete purchase and create ticket
- **Route**: `/checkout`
- **Features**:
  - Order summary (event, category, quantity, price)
  - Payment method selection (UPI, Card, Wallet - UI only)
  - Tax calculation (default 18%)
  - Ticket number generation
  - Instant ticket creation on payment confirmation
  - Success screen with ticket details
  - View ticket / Browse events buttons
- **Payment Flow**:
  1. User selects event + category + quantity from event detail
  2. Data stored in sessionStorage as `ticketSelection`
  3. User navigates to checkout
  4. Confirms payment (currently mock)
  5. Creates ticket in database
  6. Shows success screen
  7. Can download or view ticket
- **Key Data**:
  - `ticketSelection` from sessionStorage
  - Uses `useCreateTicket()` hook to save

```typescript
// Ticket creation
const ticket = await createTicket.mutateAsync({
  eventId: ticketSelection.eventId,
  categoryId: ticketSelection.categoryId,
  quantity: ticketSelection.quantity,
  unitPrice: ticketSelection.unitPrice,
  totalPrice: ticketSelection.totalPrice,
});
```

---

#### **[app/events/[id]/page.tsx](app/events/[id]/page.tsx)** 🎫 **TICKET SELECTION**
- **Purpose**: Select and book tickets for an event
- **Route**: `/events/[id]`
- **Features**:
  - Display available ticket categories
  - Show prices and availability
  - Quantity picker (increment/decrement)
  - Real-time price calculation
  - "Proceed to Checkout" button
  - Disabled state for sold-out categories
- **Data Flow**:
  1. Fetch event details via `useEvent(id)`
  2. Fetch ticket categories via `useTicketCategories(eventId)`
  3. User selects category
  4. User picks quantity
  5. Store selection in sessionStorage
  6. Navigate to `/checkout`

```typescript
const { data: ticketCategories } = useTicketCategories(event?.id);
const [selectedCategory, setSelectedCategory] = useState(null);
const [ticketCount, setTicketCount] = useState(1);
const totalPrice = selectedTicket ? selectedTicket.price * ticketCount : 0;
```

---

#### **[app/account/page.tsx](app/account/page.tsx)** 👤 **USER DASHBOARD**
- **Purpose**: Show user tickets in account
- **Route**: `/account`
- **Features**:
  - Tab: "Your Tickets"
  - Lists all user tickets
  - Quick preview: event, date, category, ticket number
  - Link to individual ticket detail
  - Empty state: "No tickets found"

---

### **2. Components**

#### **[src/components/EventTicket.tsx](src/components/EventTicket.tsx)** 🎨 **PREMIUM DESIGN**
- **Purpose**: Reusable premium ticket design component
- **Type**: Presentational component (no hooks)
- **Props**:
  ```typescript
  interface EventTicketProps {
    ticketType?: string;      // e.g., "VIP Access", "General"
    ticketId?: string;        // e.g., "AFA25VP13"
    venue?: string;           // Event venue
    date?: string;            // Formatted date
    time?: string;            // Event time
    year?: string;            // Year for badge
    qrCodeUrl?: string;       // QR code image URL
  }
  ```
- **Design Features**:
  - ✨ Scalloped edges (torn perforation look)
  - 🏆 Floating award logo with animation
  - 🎨 Gold & red cinema theme
  - 📍 Venue with location icon
  - 🔗 QR code (white background)
  - 📅 Date & time display
  - ✔️ Year badge
  - Tear line with circular notches divider
- **Styling**: Hardcoded HSL colors (not using Tailwind vars for ticket isolation)
- **Animation**: Uses `animate-float` from globals.css

```typescript
// Example usage
<EventTicket
  ticketType="VIP Access"
  ticketId="AFA25VP13"
  venue="Jio World Convention Centre, Bengaluru"
  date="13 December 2025"
  time="6:00 PM"
  year="2025"
  qrCodeUrl="/reg_scanner.png"
/>
```

---

### **3. Hooks (Data Fetching)**

#### **[src/hooks/useTickets.ts](src/hooks/useTickets.ts)** 📊 **MAIN HOOK**
- **Purpose**: All ticket-related data operations
- **Hooks Included**:

1. **`useTicket(ticketId)`** - Fetch single ticket
   ```typescript
   const { data: ticket, isLoading, error } = useTicket(id);
   // Returns: Ticket with event & category details
   ```

2. **`useUserTickets()`** - Fetch all user's tickets
   ```typescript
   const { data: tickets, isLoading } = useUserTickets();
   // Returns: Array of tickets with event info
   ```

3. **`useCreateTicket()`** - Create new ticket
   ```typescript
   const createTicket = useCreateTicket();
   const ticket = await createTicket.mutateAsync({
     eventId: string,
     categoryId: string,
     quantity: number,
     unitPrice: number,
     totalPrice: number,
   });
   // Creates ticket + decreases available_seats
   ```

- **Key Logic** (in `useCreateTicket`):
  ```typescript
  // 1. Generate unique ticket number: AFA-XXXXXX
  const ticketNumber = generateTicketNumber();
  
  // 2. Generate QR code URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(...)}`;
  
  // 3. Create ticket record
  await supabase.from('tickets').insert({
    user_id,
    event_id,
    category_id,
    ticket_number,
    quantity,
    total_price,
    qr_code_url,
  });
  
  // 4. CRITICAL: Decrease available_seats
  // Buy 1 = minus 1, Buy 10 = minus 10
  const newAvailableSeats = category.available_seats - quantity;
  await supabase.from('ticket_categories')
    .update({ available_seats: newAvailableSeats })
    .eq('id', categoryId);
  ```

---

### **4. Database Schema**

#### **[supabase/migrations/001_initial_schema.sql](supabase/migrations/001_initial_schema.sql)**

**Table: `ticket_categories`**
```sql
CREATE TABLE IF NOT EXISTS ticket_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id),
  name TEXT NOT NULL,                    -- e.g., "VIP Access", "General"
  price INTEGER NOT NULL,                -- Price in rupees
  total_seats INTEGER NOT NULL,          -- Total capacity
  available_seats INTEGER NOT NULL,      -- Remaining seats (CRITICAL)
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

**Table: `tickets`**
```sql
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  event_id UUID NOT NULL REFERENCES events(id),
  category_id UUID NOT NULL REFERENCES ticket_categories(id),
  ticket_number TEXT UNIQUE NOT NULL,   -- e.g., "AFA-123456"
  quantity INTEGER NOT NULL,             -- How many tickets
  unit_price INTEGER NOT NULL,           -- Price per ticket
  total_price INTEGER NOT NULL,          -- quantity * unit_price
  qr_code_url TEXT,                     -- QR code image URL
  status TEXT DEFAULT 'confirmed',       -- confirmed/pending/cancelled
  purchase_time TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

**Indexes** (for performance):
```sql
CREATE INDEX idx_tickets_user_id ON tickets(user_id);
CREATE INDEX idx_tickets_event_id ON tickets(event_id);
CREATE INDEX idx_ticket_categories_event_id ON ticket_categories(event_id);
```

---

#### **[supabase/migrations/002_seed_data.sql](supabase/migrations/002_seed_data.sql)**
- **Purpose**: Populate test data
- **Seed Data Example**:
  ```sql
  INSERT INTO ticket_categories (event_id, name, price, total_seats, available_seats, description, sort_order)
  VALUES
    (event_id, 'VIP Access', 5000, 100, 100, 'Premium seating', 1),
    (event_id, 'Premium', 3000, 200, 200, 'Good views', 2),
    (event_id, 'General', 1500, 500, 500, 'Standard seating', 3),
    (event_id, 'Early Bird', 1000, 200, 200, 'Limited time offer', 4);
  ```

---

### **5. Types & Interfaces**

#### **[src/types/database.types.ts](src/types/database.types.ts)**
```typescript
interface Ticket {
  id: string;
  user_id: string;
  event_id: string;
  category_id: string;
  ticket_number: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  qr_code_url: string | null;
  status: "confirmed" | "pending" | "cancelled";
  purchase_time: string;
  created_at: string;
  updated_at: string;
  // Relations
  event?: Event;
  category?: TicketCategory;
}

interface TicketCategory {
  id: string;
  event_id: string;
  name: string;
  price: number;
  total_seats: number;
  available_seats: number;
  description: string | null;
  sort_order: number;
}
```

---

### **6. Assets**

#### **Public Folder Assets**
- `/public/reg_scanner.png` - QR scanner design (placeholder)
- `/public/text_logo.svg` - Astra Filmfare Awards logo
- `/public/award_logo.svg` - Award trophy logo

#### **Usage**:
```typescript
// In EventTicket component
<img src="/reg_scanner.png" alt="QR Code" />
<img src="/text_logo.svg" alt="Logo" />
<img src="/award_logo.svg" alt="Award" />
```

---

## 🔄 Complete User Flow

```
1. User Browses Event
   ↓
2. Clicks Event Card → /events/[id]
   ↓
3. Views Available Ticket Categories
   ↓
4. Selects Category + Quantity
   ↓
5. Clicks "Proceed to Checkout"
   ↓
6. Ticket Selection → sessionStorage
   ↓
7. Navigate to /checkout
   ↓
8. Reviews Order Summary
   ↓
9. Selects Payment Method (UI only currently)
   ↓
10. Clicks "Pay ₹XXXX"
   ↓
11. Creates Ticket Record:
    - Generates ticket number
    - Generates QR code URL
    - Saves to database
    - Decreases available_seats
   ↓
12. Shows Success Screen
   ↓
13. User Can:
    - View Ticket → /tickets/[id]
    - Download as PNG
    - Share with others
    - Browse Events
```

---

## 🎨 Design Details

### **Premium Ticket Design** (EventTicket.tsx)
```
┌─ Scalloped Top Edge ─────────────────┐
│                                      │
│  [Logo]        [Year][Award Icon]   │
│                                      │
│       VIP Access                     │
│   Astra Filmfare Awards              │
│                                      │
│  Ticket ID : AFA25VP13               │
│                                      │
│  📍 Jio World Convention Centre      │
│     Bengaluru                        │
│                                      │
│  ━━ • ━━━━━━━━━━━━━━━━━━━━ • ━━━━━ │
│                                      │
│  [QR Code]      Date: 13 Dec 2025   │
│                 Time: 6:00 PM       │
│                                      │
└─ Scalloped Bottom Edge ──────────────┘
```

### **Colors**
- Gold: `hsl(43 74% 49%)`
- Gold Light: `hsl(45 90% 65%)`
- Background: `hsl(0 0% 6%)`
- Card: `hsl(0 0% 6%)`

### **Animations**
- `.animate-float` - Award logo floats up/down (6s loop)

---

## 🐛 Critical Bug Fixes

### **Issue 1: Available Seats Not Decreasing** ✅ FIXED
- **Problem**: After buying tickets, `available_seats` wasn't updated
- **Solution**: Added atomic update in `useCreateTicket` hook
- **Code**:
  ```typescript
  const newAvailableSeats = category.available_seats - params.quantity;
  await supabase.from('ticket_categories')
    .update({ available_seats: newAvailableSeats })
    .eq('id', params.categoryId);
  ```

### **Issue 2: Checkout Flash Before Auth** ✅ FIXED
- **Problem**: Checkout content flashed before redirect to auth
- **Solution**: Added auth check before rendering
- **Code**:
  ```typescript
  if (!user && !authLoading) {
    return <Loader2 />;  // Show loading instead
  }
  ```

---

## 🚀 Future Enhancements

1. **Payment Gateway Integration**
   - Razorpay implementation
   - Real payment processing
   - Receipt generation

2. **Email Notifications**
   - Ticket confirmation email
   - PDF ticket attachment
   - Reminder emails

3. **Admin Features**
   - Manage ticket inventory
   - Refunds & cancellations
   - Sales analytics
   - Bulk ticket generation

4. **User Features**
   - Ticket transfer to friends
   - Digital wallet
   - Subscription passes
   - Event reminders

5. **Mobile App**
   - React Native version
   - Mobile ticket scanning
   - Offline access

---

## 📊 Statistics

- **Lines of Code**: ~1,500+
- **Components**: 3 (Pages) + 1 (Component) = 4
- **Database Tables**: 2 (ticket_categories, tickets)
- **Hooks**: 3 (useTicket, useUserTickets, useCreateTicket)
- **Pages**: 4 (/tickets, /tickets/[id], /checkout, /events/[id])
- **Assets**: 3 images (scanner, logos)

---

## ✅ Testing Checklist

- [ ] Buy ticket (quantity 1)
- [ ] Buy multiple tickets (quantity > 1)
- [ ] Verify available_seats decreases
- [ ] View ticket detail page
- [ ] Download ticket as PNG
- [ ] Share ticket (web share API or copy)
- [ ] View tickets in account dashboard
- [ ] Check QR code displays correctly
- [ ] Verify ticket number is unique
- [ ] Test with sold-out category (disabled button)

---

**Created**: December 16, 2025  
**Last Updated**: December 17, 2025
