import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  checkApiRateLimit,
  clientIpFromHeaders,
  rateLimitResponseInit,
} from "@/lib/cache/api-rate-limit";

const publicRoutes = ["/", "/login", "/signup", "/callback", "/demo"];

function isPublicRoute(pathname: string): boolean {
  if (publicRoutes.includes(pathname)) return true;
  if (pathname.startsWith("/vibe/")) return true;
  if (pathname.startsWith("/callback")) return true;
  if (pathname.startsWith("/demo")) return true;
  return false;
}

// API routes never redirect — they must respond with their own JSON
// (401/403/etc.) rather than a 302 to /login. Auth is enforced inside each
// handler. Inngest's webhook handler verifies its own signature.
function isApiRoute(pathname: string): boolean {
  return pathname.startsWith("/api/");
}

export async function middleware(request: NextRequest) {
  // Skip middleware if Supabase isn't configured (prevents edge runtime crash)
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Per-IP rate limit on the public report routes — keeps the slug space
  // from being brute-forced and protects the anon Supabase queries.
  //
  // Wrapped in a 250ms timeout that fails open: if Upstash is slow or down,
  // we'd rather serve the page than hold up every request behind a stuck
  // Redis call.
  if (pathname.startsWith("/vibe/")) {
    const ip = clientIpFromHeaders(request.headers);
    const limitCheck = checkApiRateLimit("vibe-page", ip, 60);
    const timeout = new Promise<{ ok: true }>((resolve) =>
      setTimeout(() => resolve({ ok: true }), 250)
    );
    const limit = await Promise.race([limitCheck, timeout]);
    if (!limit.ok) {
      return new NextResponse("Too Many Requests", rateLimitResponseInit(limit));
    }
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session — required by Supabase to keep auth tokens valid
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect unauthenticated users away from protected pages. API routes are
  // explicitly excluded — they enforce auth inside their handlers and must
  // return JSON, not a redirect.
  if (!user && !isPublicRoute(pathname) && !isApiRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages to dashboard
  if (user && (pathname === "/login" || pathname === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Skip Next internals, static metadata files (manifest/robots/sitemap are
    // served by Next's route handlers — middleware intercepting them breaks
    // the response body), and common image types.
    "/((?!_next/static|_next/image|favicon\\.ico|manifest\\.webmanifest|robots\\.txt|sitemap\\.xml|icon\\.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
