import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { canAccessModule } from "@/lib/rbac";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // /dashboard/<module>/... -> module key is the first segment after /dashboard
    const segments = pathname.split("/").filter(Boolean); // ["dashboard", "units", ...]
    const moduleKey = segments[1]; // undefined for the /dashboard root itself

    if (moduleKey && token?.role && !canAccessModule(token.role, moduleKey)) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      url.searchParams.set("denied", moduleKey);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};
