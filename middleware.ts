import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth-utils";

const protectedRoutes = ["/dashboard", "/inventory", "/sales", "/reports", "/users"];
const authRoutes = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  const isAuthRoute = authRoutes.some(route => path.startsWith(route));

  const session = await getSessionFromRequest(request);

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
  }

  // Check permissions for protected routes
  if (session && isProtectedRoute) {
    const userRole = session.user?.role;
    const allowedPages: string[] = session.user?.allowedPages || [];

    // Admins can see everything
    if (userRole === "admin") return NextResponse.next();

    // Check if the current path is allowed
    const isAllowed = allowedPages.some(page => path.startsWith(page));

    if (!isAllowed) {
      return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$|.*\\.svg$|.*\\.ico$).*)"],
};
