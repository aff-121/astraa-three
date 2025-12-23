import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    // 1. Extract and verify JWT token from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: "Missing or invalid Authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7); // Remove "Bearer " prefix
    
    // Verify token and extract user ID from JWT
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      console.error('🔐 [AUTH] JWT verification failed:', authError?.message);
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid or expired token" },
        { status: 401 }
      );
    }

    const authenticatedUserId = user.id; // This is the ONLY user ID we trust
    
    // 2. Parse request body
    const { userId: requestedUserId, phone, fullName } = await req.json();

    console.log("🔐 [UPDATE-PROFILE] Request from user:", authenticatedUserId);

    // 3. Security check: Verify user is updating THEIR OWN profile
    if (requestedUserId && requestedUserId !== authenticatedUserId) {
      console.error('🔐 [SECURITY] Unauthorized profile update attempt:', {
        authenticatedUserId,
        requestedUserId,
      });
      return NextResponse.json(
        { success: false, message: "Unauthorized: You can only update your own profile" },
        { status: 403 }
      );
    }

    // 4. Validate inputs
    if (!fullName || !fullName.trim()) {
      return NextResponse.json(
        { success: false, message: "Full name is required" },
        { status: 400 }
      );
    }

    // 5. Update profile using authenticated user ID
    const userId = authenticatedUserId;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingProfile, error: findError } = await (supabaseAdmin as any)
      .from("profiles")
      .select("id, phone, full_name")
      .eq("id", userId)
      .single();

    console.log("🔐 [UPDATE-PROFILE] Profile lookup:", { found: !!existingProfile });

    if (existingProfile) {
      // Profile exists - update it
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: updatedProfile, error: updateError } = await (supabaseAdmin as any)
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          phone: phone || existingProfile.phone,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
        .single();

      if (updateError) {
        console.error("Profile update error:", updateError);
        return NextResponse.json(
          { success: false, message: "Failed to update profile" },
          { status: 500 }
        );
      }

      console.log("✅ [UPDATE-PROFILE] Profile updated:", updatedProfile?.id);
      return NextResponse.json({
        success: true,
        message: "Profile updated successfully",
        profile: { id: updatedProfile.id, fullName: updatedProfile.full_name, phone: updatedProfile.phone },
      });
    }

    // Profile doesn't exist - create it (should be rare due to auth trigger)
    console.log("🔐 [UPDATE-PROFILE] Creating new profile for:", userId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: newProfile, error: createError } = await (supabaseAdmin as any)
      .from("profiles")
      .insert({
        id: userId,
        phone: phone,
        full_name: fullName.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError) {
      console.error("Profile create error:", createError);
      
      // If constraint error (profile already exists), try to update
      if (createError.code === "23505") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: retryProfile } = await (supabaseAdmin as any)
          .from("profiles")
          .update({
            full_name: fullName.trim(),
            phone: phone,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId)
          .select()
          .single();

        if (retryProfile) {
          return NextResponse.json({
            success: true,
            message: "Profile updated successfully",
            profile: { id: retryProfile.id, fullName: retryProfile.full_name, phone: retryProfile.phone },
          });
        }
      }
      
      return NextResponse.json(
        { success: false, message: "Failed to create profile" },
        { status: 500 }
      );
    }

    // Update auth user metadata
    try {
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: { full_name: fullName.trim() },
      });
    } catch (e) {
      console.error("Auth user update error (non-critical):", e);
    }

    console.log("✅ [UPDATE-PROFILE] Profile created:", newProfile?.id);
    return NextResponse.json({
      success: true,
      message: "Profile created successfully",
      profile: { id: newProfile.id, fullName: newProfile.full_name, phone: newProfile.phone },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
