import { NextResponse, type NextRequest } from "next/server"

// Pages accessible without being logged in (adapt to your routes)
const publicRoutes = ["/connection", "/register", "/debug"]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("token")?.value
  const isPublic = publicRoutes.includes(pathname)

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