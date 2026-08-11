import { auth } from "@/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard");
  const isOnApi = req.nextUrl.pathname.startsWith("/api");

  if (isOnDashboard) {
    if (!isLoggedIn) {
      return Response.redirect(new URL("/auth/signin", req.nextUrl));
    }
  }

  if (isOnApi && !req.nextUrl.pathname.startsWith("/api/auth")) {
    if (!isLoggedIn) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};