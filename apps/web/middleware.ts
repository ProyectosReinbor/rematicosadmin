import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const adminRoutes = ["/admin/dashboard", "/admin/payments", "/admin/verificaciones", "/admin/publicidad-ia", "/admin/products", "/admin/customers", "/admin/settings"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const response = NextResponse.next();

  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  const isLoginRoute = pathname === "/admin/login";

  if (isAdminRoute) {
    const accessToken = request.cookies.get("accessToken")?.value;
    const hasAccessTokenInStorage = request.headers.get("x-has-token");

    if (!accessToken && !hasAccessTokenInStorage) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isLoginRoute) {
    const accessToken = request.cookies.get("accessToken")?.value;
    if (accessToken) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
