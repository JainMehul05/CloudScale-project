import { auth } from "@/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard");
  const isOnApi = req.nextUrl.pathname.startsWith("/api");
  const isAuthApi = req.nextUrl.pathname.startsWith("/api/auth");
  const isAuthPage = req.nextUrl.pathname.startsWith("/auth/");
  const isPublicApi = req.nextUrl.pathname === "/api/health";

  // Allow access to auth pages, auth API, and health endpoint without authentication
  if (isAuthPage || isAuthApi || isPublicApi) {
    return;
  }

  // Protect dashboard routes
  if (isOnDashboard) {
    if (!isLoggedIn) {
      const signInUrl = new URL("/auth/signin", req.nextUrl);
      signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
      return Response.redirect(signInUrl);
    }
  }

  // Protect API routes (except auth and health)
  if (isOnApi && !isAuthApi && !isPublicApi) {
    if (!isLoggedIn) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
});

export const config = {
  runtime: "nodejs",
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|public/).*)",
  ],
};