import { NextResponse, type NextRequest } from "next/server"

// Pages accessible without being logged in.
// (/debug is no longer here: it only exists in development, see app/debug/page.tsx)
const publicRoutes = ["/connection", "/register"]

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  const token = request.cookies.get("token")?.value
  const isPublic = publicRoutes.includes(pathname)

  // The backend refused the token (expired, or the database was reset):
  // api.ts sends the user here with ?expired=1 (see request() in app/lib/api.ts).
  // We delete the cookie and show the login page (instead of sending back to /dashboard below)
  if (pathname === "/connection" && searchParams.has("expired")) {
    const response = NextResponse.next()
    response.cookies.delete("token")
    return response
  }

  // Not logged in on a protected page → login page
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/connection", request.url))
  }

  // Already logged in on login/sign-up → home
  if (token && isPublic) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  // Excludes static files (images, favicon…) and the API
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
}