import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const hasUserId = request.cookies.has("userId");
  console.log("hasUserId", hasUserId);

  if (!hasUserId) {
    const userId = `user_${nanoid(21)}`;
    const url = new URL(request.url);
    const redirect = NextResponse.redirect(url);
    redirect.cookies.set("userId", userId);
    redirect.headers.set("x-user-id", userId);
    return redirect;
  }
  const next = NextResponse.next();
  return next;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
