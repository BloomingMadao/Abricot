import { NextResponse, type NextRequest } from "next/server"

// Pages accessibles sans être connecté (adapte à tes routes)
const publicRoutes = ["/connection", "/register", "/"]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("token")?.value
  const isPublic = publicRoutes.includes(pathname)

  // Non connecté sur une page protégée → page de connexion
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/connection", request.url))
  }

  // Déjà connecté sur connexion/inscription → accueil
  if (token && isPublic) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  // Exclut les fichiers statiques (images, favicon…) et l'API
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
}