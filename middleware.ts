import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { env } from "process";

import { decrypt } from "./lib/session";

// 1. Specify protected and public routes
const protectedRoutes = ["/"];
const publicRoutes = ["/login"];

export default async function middleware(req: NextRequest) {
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  // 3. Decrypt the session from the cookie
  const cookieStore = cookies();
  const cookie = cookieStore.get("session")?.value;
  const session = await decrypt(cookie);

  // 4. Redirect to /login if the user is not authenticated
  if (isProtectedRoute && env.PASSWORD && !session?.userId) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // 5. Redirect to /dashboard if the user is authenticated
  if (
    isPublicRoute &&
    (!env.PASSWORD || session?.userId) &&
    !(req.nextUrl.pathname === "/")
  ) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
