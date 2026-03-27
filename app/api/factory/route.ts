import { NextRequest, NextResponse } from "next/server";
import { getFactory, upsertFactory, assignFactoryRole, getFactoryUserId } from "@/lib/queries/factory";
import { getSupabaseAdmin } from "@/lib/supabase/admin-client";

export async function GET() {
  try {
    const data = await getFactory();
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/factory error:", error);
    return NextResponse.json({ error: "Failed to fetch factory" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, address, phone, email, password, description, logoUrl, coverImageUrl } = body;

    const trimmedEmail = email?.trim();

    if (!name?.trim() || !trimmedEmail) {
      return NextResponse.json({ error: "Factory name and email are required" }, { status: 400 });
    }

    const existingFactory = await getFactory();
    const supabaseAdmin = getSupabaseAdmin();

    // --- 1. Supabase Auth Handling ---
    if (!existingFactory) {
      // Creation Flow: Requires a manual password
      if (!password || password.length < 6) {
        return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
      }

      // Create the user in Supabase Auth and send confirmation email
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: trimmedEmail,
        password: password,
        email_confirm: false, // Send confirmation email automatically
      });

      if (authError) {
        if (!authError.message.includes("already registered")) {
          throw new Error(`Auth Error: ${authError.message}`);
        }
      }

      // Assign the "factory" role in our DB
      if (authData.user) {
        await assignFactoryRole(authData.user.id);
      }
    } else {
      // Edit Flow: Check if email changed
      if (existingFactory.email !== trimmedEmail) {
        const factoryUserId = await getFactoryUserId();
        if (factoryUserId) {
          // Update the email in Supabase Auth (will trigger change email flow depending on settings)
          const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(factoryUserId, {
            email: trimmedEmail,
          });

          if (updateError) {
            console.error("Failed to sync auth email:", updateError);
            throw new Error(`Auth Sync Error: ${updateError.message}`);
          }
        }
      }
    }

    // --- 2. Update Factory DB Record ---
    const result = await upsertFactory({
      name: name.trim(),
      address: address?.trim() || null,
      phone: phone?.trim() || null,
      email: trimmedEmail,
      description: description?.trim() || null,
      logoUrl: logoUrl || null,
      coverImageUrl: coverImageUrl || null,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("POST /api/factory error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to save factory" }, { status: 500 });
  }
}


