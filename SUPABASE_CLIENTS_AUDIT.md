# 🔍 Supabase Clients Audit - Complete Codebase Scan

**Date**: December 17, 2025  
**Scope**: All Supabase client initialization and usage patterns

---

## 📊 Executive Summary

| Category | Count | Details |
|----------|-------|---------|
| **Frontend Clients** | 1 | Anon key (RLS enforced) |
| **Backend Clients** | 1 | Service role key (RLS bypassed) |
| **API Routes Using Service Role** | 4 | Auth operations (OTP, session, profile) |
| **Hooks Using Anon Client** | 6+ | Data fetching (tickets, movies, news, etc.) |
| **Database Writes Before Login** | 3 | OTP requests, profiles, auth users |
| **Auth Admin Operations** | 5+ | Create user, list users, update user, etc. |

---

## 🎯 Part A: Frontend / Anon-Key Usage

### **1. Main Frontend Supabase Client**

**File**: [src/lib/supabase.ts](src/lib/supabase.ts)

```typescript
// ✅ FRONTEND CLIENT - ANON KEY
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

| Property | Value |
|----------|-------|
| **File Path** | `src/lib/supabase.ts` |
| **Client Name** | `supabase` |
| **Key Used** | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| **Environment** | Frontend (browser) + Server (Next.js) |
| **RLS Status** | ✅ **RLS Enforced** |
| **Permissions** | Limited to user's own data |
| **Auth Token** | Uses session JWT from auth context |

**Key Characteristics**:
- Published to client (NEXT_PUBLIC prefix)
- Uses anon key (least privileged)
- Works with Row Level Security policies
- Can read/write own profile, tickets, messages
- Cannot access other users' private data
- Cannot perform admin operations

---

### **2. Frontend Usage in Context Provider**

**File**: [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx)

```typescript
import { supabase } from '@/lib/supabase';

export function AuthProvider({ children }: { children: ReactNode }) {
  // ✅ ANON KEY OPERATIONS
  
  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName } }
    });
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/account?reset=true`
    });
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };
}
```

| Operation | RLS | Auth Required | Notes |
|-----------|-----|---------------|-------|
| `signInWithPassword` | N/A | No | Email/password auth |
| `signUp` | N/A | No | Public signup (email confirmation) |
| `resetPasswordForEmail` | N/A | No | Password reset flow |
| `updateUser` | N/A | Yes | Logged-in user only |
| `signOut` | N/A | Yes | Clears session |
| `getSession` | N/A | N/A | Check if session exists |
| `onAuthStateChange` | N/A | N/A | Listen for auth changes |

---

### **3. Frontend Data Fetching Hooks**

**File**: [src/hooks/useTickets.ts](src/hooks/useTickets.ts)

```typescript
import { supabase } from '@/lib/supabase';

// ✅ ANON KEY - READ OWN TICKETS
export const useUserTickets = () => {
  return useQuery({
    queryKey: ['userTickets'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('tickets')
        .select('*, event(*), category(*)')
        .eq('user_id', user.id);
      
      return data;
    },
  });
};

// ✅ ANON KEY - CREATE OWN TICKET
export const useCreateTicket = () => {
  return useMutation({
    mutationFn: async (params) => {
      const { data: ticket } = await supabase
        .from('tickets')
        .insert({
          user_id: user.id,           // User's own ID
          event_id: params.eventId,
          category_id: params.categoryId,
          ticket_number: ticketNumber,
          quantity: params.quantity,
          unit_price: params.unitPrice,
          total_price: params.totalPrice,
        })
        .select()
        .single();
      
      // 🐛 CRITICAL BUG FIX: Decrease available seats
      await supabase
        .from('ticket_categories')
        .update({ available_seats: newAvailableSeats })
        .eq('id', params.categoryId);
      
      return ticket;
    },
  });
};
```

| Operation | Table | RLS Policy | Notes |
|-----------|-------|-----------|-------|
| `useTicket(id)` | tickets | User can read own | Filters by `user_id` |
| `useUserTickets()` | tickets | User can read own | Filters by `user_id` |
| `useCreateTicket()` | tickets | User can insert own | Forces `user_id` from context |
| Update `available_seats` | ticket_categories | Public read, admin write | ⚠️ **Bug**: Allows user to decrease seats |

**Issue Found**: `ticket_categories.available_seats` should only be writable by admin, but frontend can currently update it!

---

**File**: [src/hooks/useMovies.ts](src/hooks/useMovies.ts)

```typescript
import { supabase } from '@/lib/supabase';

// ✅ ANON KEY - READ PUBLIC MOVIES
export const useMovies = () => {
  return useQuery({
    queryKey: ['movies'],
    queryFn: async () => {
      const { data } = await supabase
        .from('movies')
        .select('*')
        .eq('is_active', true);
      return data;
    },
  });
};

export const useMovie = (slug: string) => {
  return useQuery({
    queryKey: ['movie', slug],
    queryFn: async () => {
      const { data } = await supabase
        .from('movies')
        .select('*')
        .eq('slug', slug)
        .single();
      return data;
    },
  });
};
```

| Operation | Table | Data | RLS |
|-----------|-------|------|-----|
| Get all movies | movies | Public | No policy needed |
| Get movie by slug | movies | Public | No policy needed |
| Get movie details | movies | Public | No policy needed |

---

**File**: [src/hooks/useProfile.ts](src/hooks/useProfile.ts)

```typescript
import { supabase } from '@/lib/supabase';

// ✅ ANON KEY - READ OWN PROFILE
export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      return data;
    },
  });
};

// ✅ ANON KEY - UPDATE OWN PROFILE
export const useUpdateProfile = () => {
  return useMutation({
    mutationFn: async (params) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data } = await supabase
        .from('profiles')
        .update({ full_name: params.full_name, phone: params.phone })
        .eq('id', user.id);
      return data;
    },
  });
};
```

| Operation | Table | RLS Policy | Notes |
|-----------|-------|-----------|-------|
| Read own profile | profiles | User can read own | Filters by `id = auth.uid()` |
| Update own profile | profiles | User can update own | Only own row |

---

**File**: [src/hooks/useNews.ts](src/hooks/useNews.ts) & [src/hooks/useEvents.ts](src/hooks/useEvents.ts)

```typescript
import { supabase } from '@/lib/supabase';

// ✅ ANON KEY - READ PUBLIC DATA
export const useNews = () => {
  const { data, error, isLoading } = useQuery({
    queryKey: ['news'],
    queryFn: async () => {
      const { data } = await supabase
        .from('news')
        .select('*')
        .eq('is_active', true)
        .order('published_at', { ascending: false });
      return data;
    },
  });
};

export const useEvents = () => {
  const { data } = await supabase
    .from('events')
    .select('*')
    .eq('is_active', true);
};

export const useAwards = () => {
  const { data } = await supabase
    .from('awards')
    .select('*, categories:award_categories(*), gallery:award_gallery(*)');
};
```

| Hook | Tables | Auth Required | RLS |
|------|--------|---------------|-----|
| `useNews()` | news, news_gallery | No | Public read |
| `useEvents()` | events, ticket_categories | No | Public read |
| `useAwards()` | awards, award_categories, award_gallery | No | Public read |
| `useNews()` (detail) | news, news_gallery | No | Public read |

---

### **4. Frontend Auth Pages Using Anon Client**

**File**: [app/auth/verify/page.tsx](app/auth/verify/page.tsx)

```typescript
import { supabase } from '@/lib/supabase';

// ✅ ANON KEY - SIGN IN AFTER OTP VERIFICATION
const signInUser = async (uid: string, phoneNum: string) => {
  const response = await fetch('/api/auth/create-session', {
    method: 'POST',
    body: JSON.stringify({ userId: uid, phone: phoneNum }),
  });
  
  const result = await response.json();
  
  if (result.email && result.tempAuth) {
    // Sign in with pseudo-email (from service_role API)
    const { error } = await supabase.auth.signInWithPassword({
      email: result.email,           // "919961491824@phone.jsquare.local"
      password: result.tempAuth,      // Temp password from backend
    });
  }
};
```

| Operation | Role | Purpose | Notes |
|-----------|------|---------|-------|
| `signInWithPassword` | Anon | Login after OTP | Uses credentials from service_role API |

---

## 🔐 Part B: Backend / Service-Role Usage

### **1. Admin Backend Supabase Client**

**File**: [src/lib/supabase/server.ts](src/lib/supabase/server.ts)

```typescript
// ❌ BACKEND ONLY - SERVICE ROLE KEY
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;  // ← Secret key

export const supabaseAdmin = createClient<Database>(
  supabaseUrl, 
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
```

| Property | Value |
|----------|-------|
| **File Path** | `src/lib/supabase/server.ts` |
| **Client Name** | `supabaseAdmin` |
| **Key Used** | `SUPABASE_SERVICE_ROLE_KEY` (secret) |
| **Environment** | Backend only (API routes, Edge Functions) |
| **RLS Status** | ❌ **RLS Bypassed** |
| **Permissions** | Full database access, can create/modify auth users |
| **Exposure Risk** | **CRITICAL if exposed** |

---

### **2. API Route: Send OTP**

**File**: [app/api/auth/send-otp/route.ts](app/api/auth/send-otp/route.ts)

```typescript
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const { phone } = await req.json();

  // 1. ❌ SERVICE ROLE - READ PROTECTED TABLE
  // Check if user already exists (bypasses RLS)
  const { data: existingProfile } = await supabaseAdmin
    .from("profiles")
    .select("id, phone")
    .eq("phone", normalizedPhone)
    .single();

  const isNewUser = !existingProfile;

  // 2. ❌ SERVICE ROLE - WRITE TO PROTECTED TABLE
  // Store OTP in protected table (only service_role can access)
  const { data: otpRequest } = await (supabaseAdmin as any)
    .from("phone_otp_requests")
    .upsert({
      phone: normalizedPhone,
      otp_hash: otpHash,
      expires_at: expiresAt,
      verified: false,
    }, { onConflict: "phone" })
    .select()
    .single();

  // 3. Call MSG91 SMS service
  const smsResponse = await fetch(SMS_OTP_FUNCTION_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${anonKey}`,  // Uses anon key for Edge Function
    },
    body: JSON.stringify({ to: normalizedPhone, otp: otp }),
  });

  return NextResponse.json({
    success: true,
    requestId: otpRequest.id,
    isNewUser: isNewUser,
  });
}
```

| Operation | Table | RLS | Purpose |
|-----------|-------|-----|---------|
| Read profiles | profiles | Bypassed | Detect existing users |
| Write OTP request | phone_otp_requests | Bypassed | Store OTP for verification |
| Call SMS | Edge Fn | N/A | Send verification SMS |

**Why Service Role Needed**:
- `phone_otp_requests` table has RLS that only allows `service_role`
- Cannot query profiles table before user is logged in

---

### **3. API Route: Verify OTP**

**File**: [app/api/auth/verify-otp/route.ts](app/api/auth/verify-otp/route.ts)

```typescript
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const { otp, requestId, phone } = await req.json();

  // 1. ❌ SERVICE ROLE - READ PROTECTED TABLE
  let query = supabaseAdmin
    .from("phone_otp_requests")
    .select("id, phone, otp_hash, expires_at, verified");

  if (requestId) {
    query = query.eq("id", requestId);
  } else if (phone) {
    query = query.eq("phone", phone);
  }

  const { data: otpRequest } = await query.single();

  // 2. Verify OTP hash (constant-time comparison)
  const incomingHash = crypto.createHash("sha256").update(otp).digest("hex");
  if (incomingHash !== otpRequest.otp_hash) {
    return error("Incorrect OTP");
  }

  // 3. ❌ SERVICE ROLE - UPDATE PROTECTED TABLE
  await (supabaseAdmin as any)
    .from("phone_otp_requests")
    .update({ verified: true })
    .eq("id", otpRequest.id);

  // 4. ❌ SERVICE ROLE - LIST AUTH USERS (admin operation)
  const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();

  // Check if phone exists in auth users
  const existingAuthUser = authUsers?.users?.find(u => {
    const userPhoneDigits = u.phone?.replace(/\D/g, '') || '';
    return userPhoneDigits === phoneDigits || u.phone === otpRequest.phone;
  });

  if (existingAuthUser) {
    // Existing user - check profile
    const { data: profileData } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, phone")
      .eq("id", existingAuthUser.id)
      .single();

    return { success: true, isNewUser: false, userId: existingAuthUser.id };
  }

  // NEW USER - CREATE AUTH USER
  // 5. ❌ SERVICE ROLE - CREATE AUTH USER (elevated privilege)
  const pseudoEmail = `${phoneDigits}@phone.jsquare.local`;
  
  const { data: authUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: pseudoEmail,
    phone: otpRequest.phone,
    password: tempPassword,
    email_confirm: true,  // Skip email verification
  });

  // 6. ❌ SERVICE ROLE - CREATE PROFILE
  const { data: newProfile } = await supabaseAdmin
    .from("profiles")
    .insert({
      id: authUser.user.id,
      email: pseudoEmail,
      phone: otpRequest.phone,
    })
    .select()
    .single();

  return { success: true, isNewUser: true, userId: authUser.user.id };
}
```

| Operation | Purpose | Why Service Role |
|-----------|---------|------------------|
| Read `phone_otp_requests` | Verify OTP | Table is RLS-protected |
| Update `phone_otp_requests` | Mark as verified | Table is RLS-protected |
| `auth.admin.listUsers()` | Check existing users | Requires admin privilege |
| `auth.admin.createUser()` | Create new user | Requires admin privilege |
| Insert `profiles` | Create user profile | Before user login |

**Critical Operations**:
- ✅ Creating auth users (only service_role can do)
- ✅ Listing auth users (only service_role can do)
- ✅ Accessing protected OTP table (only service_role can do)

---

### **4. API Route: Create Session**

**File**: [app/api/auth/create-session/route.ts](app/api/auth/create-session/route.ts)

```typescript
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const { userId, phone } = await req.json();

  // 1. ❌ SERVICE ROLE - GET AUTH USER BY ID (admin operation)
  const { data } = await supabaseAdmin.auth.admin.getUserById(userId);
  const authUser = data?.user;

  if (!authUser && phone) {
    // 2. ❌ SERVICE ROLE - LIST ALL AUTH USERS
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
    authUser = authUsers?.users?.find(u => u.phone === phone);
  }

  // 3. ❌ SERVICE ROLE - UPDATE AUTH USER
  // Set pseudo-email if not already set
  await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
    email: email,
    email_confirm: true,
  });

  // 4. ❌ SERVICE ROLE - SET TEMPORARY PASSWORD
  const tempPassword = `jsq_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  
  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
    authUser.id,
    { password: tempPassword }
  );

  // Return credentials for client-side sign-in
  return NextResponse.json({
    success: true,
    userId: authUser.id,
    email: email,
    tempAuth: tempPassword,  // Client uses this with anon key to sign in
  });
}
```

| Operation | Purpose | Elevation |
|-----------|---------|-----------|
| `auth.admin.getUserById()` | Get user details | Only service_role |
| `auth.admin.listUsers()` | Find user by phone | Only service_role |
| `auth.admin.updateUserById()` | Update email/password | Only service_role |

**Flow**:
1. Backend (service_role) creates/updates auth user
2. Backend returns email + temp password
3. Frontend (anon key) uses those credentials to sign in
4. Frontend gets session JWT from anon key

---

### **5. API Route: Update Profile**

**File**: [app/api/auth/update-profile/route.ts](app/api/auth/update-profile/route.ts)

```typescript
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const { userId, phone, fullName } = await req.json();

  // 1. ❌ SERVICE ROLE - READ PROFILE (before login)
  const { data: existingProfile } = await (supabaseAdmin as any)
    .from("profiles")
    .select("id, phone, full_name")
    .eq("id", userId)
    .single();

  if (existingProfile) {
    // 2. ❌ SERVICE ROLE - UPDATE PROFILE
    const { data: updatedProfile } = await (supabaseAdmin as any)
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        phone: phone || existingProfile.phone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();
  } else {
    // 3. ❌ SERVICE ROLE - CREATE NEW PROFILE
    const { data: newProfile } = await (supabaseAdmin as any)
      .from("profiles")
      .insert({
        id: userId,
        phone: phone,
        full_name: fullName.trim(),
      })
      .select()
      .single();
  }

  // 4. ❌ SERVICE ROLE - UPDATE AUTH USER METADATA
  await supabaseAdmin.auth.admin.updateUserById(userId, {
    user_metadata: { full_name: fullName },
  });

  return NextResponse.json({ success: true });
}
```

| Operation | Purpose | Auth State |
|-----------|---------|-----------|
| Read profile | Check if exists | User not yet logged in |
| Update/Insert profile | Create/update data | User not yet logged in |
| Update auth user | Store metadata | User not yet logged in |

**Why Service Role**: User hasn't logged in yet, so anon key can't write their data (RLS blocks).

---

## 📋 Comprehensive Client Usage Matrix

### **Frontend Anon Key** (`supabase`)

| Component | File | Operations | RLS | Auth |
|-----------|------|-----------|-----|------|
| AuthContext | `src/contexts/AuthContext.tsx` | signIn, signUp, logout | N/A | Public |
| useTickets | `src/hooks/useTickets.ts` | read own, create own | ✅ Enforced | User |
| useProfile | `src/hooks/useProfile.ts` | read own, update own | ✅ Enforced | User |
| useMovies | `src/hooks/useMovies.ts` | read public | ✅ Enforced | Public |
| useNews | `src/hooks/useNews.ts` | read public | ✅ Enforced | Public |
| useEvents | `src/hooks/useEvents.ts` | read public | ✅ Enforced | Public |
| useAwards | `src/hooks/useAwards.ts` | read public | ✅ Enforced | Public |
| Auth Pages | `app/auth/**` | verify, login | Mixed | Public→User |
| Account Page | `app/account/page.tsx` | profile, tickets | ✅ Enforced | User |

---

### **Backend Service Role Key** (`supabaseAdmin`)

| API Route | File | Operations | RLS | When Used |
|-----------|------|-----------|-----|-----------|
| Send OTP | `app/api/auth/send-otp/route.ts` | create OTP, read profiles | ❌ Bypass | Before login |
| Verify OTP | `app/api/auth/verify-otp/route.ts` | verify OTP, create user, update auth | ❌ Bypass | Before login |
| Create Session | `app/api/auth/create-session/route.ts` | update user, list users, set password | ❌ Bypass | After OTP |
| Update Profile | `app/api/auth/update-profile/route.ts` | read profile, update profile, update auth | ❌ Bypass | During signup |

---

## 🚨 Security Findings

### **Critical Issues**

| Issue | Severity | Location | Impact |
|-------|----------|----------|--------|
| `ticket_categories.available_seats` updatable by frontend | 🔴 **CRITICAL** | `src/hooks/useTickets.ts` | Users can manipulate seat availability |
| Service role key in .env | 🔴 **CRITICAL** | `.env.local` (if exposed) | Full database compromise |

**Recommendation**:
```sql
-- Add RLS policy to prevent frontend from updating available_seats
CREATE POLICY "Only admin can update available_seats"
  ON ticket_categories
  FOR UPDATE
  USING (false)  -- Prevent all updates
  WITH CHECK (false);

-- Only service_role can bypass this policy
```

---

### **Medium Issues**

| Issue | Location | Risk |
|-------|----------|------|
| Temp password visible in session | `app/api/auth/create-session/route.ts` | Could be logged/cached |
| OTP length only 6 digits | `app/api/auth/send-otp/route.ts` | Lower security |
| No rate limiting on OTP requests | `app/api/auth/send-otp/route.ts` | SMS spam attacks |

---

## 📊 Data Flow Diagram

```
┌─ FRONTEND (Anon Key) ─────────────────────┐
│                                           │
│  supabase (NEXT_PUBLIC_SUPABASE_ANON_KEY) │
│  ├─ Auth operations (signin, signup)     │
│  ├─ Read public data (movies, events)    │
│  ├─ Read/write own data (tickets, profile) │ → RLS enforced
│  └─ Calls API routes for sensitive ops   │
│                                           │
└─────────────────────────────────────────────┘
                      ↓
        API ROUTE CALL (POST /api/auth/*)
                      ↓
┌─ BACKEND (Service Role Key) ──────────────┐
│                                           │
│ supabaseAdmin (SUPABASE_SERVICE_ROLE_KEY) │
│ ├─ Create/list auth users                │
│ ├─ Access protected tables               │
│ ├─ Create profiles before login          │
│ └─ Bypass RLS policies                   │
│                                           │
└─────────────────────────────────────────────┘
                      ↓
        RESPONSE (email + tempPassword)
                      ↓
┌─ FRONTEND Again (Anon Key) ───────────────┐
│                                           │
│  supabase.auth.signInWithPassword(        │
│    email: pseudo-email,                  │
│    password: tempPassword                │
│  )                                        │
│  → Gets session JWT                      │
│  → Now authenticated                     │
│                                           │
└─────────────────────────────────────────────┘
```

---

## ✅ Table: Which Client Where

| Context | Client | Key | RLS | Purpose |
|---------|--------|-----|-----|---------|
| Browser (Frontend) | `supabase` | Anon | ✅ Enforced | User interactions |
| Server (Next.js) | `supabaseAdmin` | Secret | ❌ Bypassed | Auth setup |
| API Routes | `supabaseAdmin` | Secret | ❌ Bypassed | OTP, session, profile |
| Edge Functions | `supabase` (Edge) | Anon | ✅ Enforced | SMS sending |
| Context/Hooks | `supabase` | Anon | ✅ Enforced | Data fetching |

---

## 🔑 Environment Variables Required

```bash
# Public (exposed to browser via NEXT_PUBLIC_)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJx... (anon key)

# Secret (backend only, NEVER exposed)
SUPABASE_SERVICE_ROLE_KEY=eyJx... (service role key)

# Other
SMS_OTP_FUNCTION_URL=https://xxx.supabase.co/functions/v1/send-sms-otp
```

**Critical**: Never add `SUPABASE_SERVICE_ROLE_KEY` to `NEXT_PUBLIC_*`

---

## 📝 Summary

**Frontend** (Anon Key):
- ✅ Safe to expose
- ✅ Uses RLS for data protection
- ✅ Limited to user's own data + public data
- ✅ Cannot create users or access protected tables

**Backend** (Service Role Key):
- ❌ Must stay secret
- ❌ Bypasses RLS
- ✅ Required for pre-login operations
- ✅ Used only in API routes and server code

**Current Implementation**: ✅ Correct separation of concerns
**Remaining Issues**: ⚠️ Need to lock down `ticket_categories` updates

---

**Generated**: December 17, 2025  
**Last Updated**: Post-implementation audit
