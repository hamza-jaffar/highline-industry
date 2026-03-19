import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server-client";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (user) {
        try {
          const { db } = await import("@/db");
          const { userRoles } = await import("@/db/schemas/user-roles.schema");
          const { eq } = await import("drizzle-orm");

          // Check if user role already exists
          const existingRole = await db
            .select()
            .from(userRoles)
            .where(eq(userRoles.userId, user.id))
            .limit(1);

          if (existingRole.length === 0) {
            console.log("Setting default 'user' role for new user:", user.id);
            await db.insert(userRoles).values({
              userId: user.id,
              role: "user",
            });
          } else {
            console.log("User already has a role, skipping default role assignment.");
          }
        } catch (dbError) {
          console.error(
            "Failed to handle user role during auth callback:",
            dbError,
          );
        }
      }

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=Invalid+magic+link`);
}
