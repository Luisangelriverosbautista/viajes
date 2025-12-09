import { NextRequest, NextResponse } from 'next/server';

// Rutas que requieren wallet conectada
const PROTECTED_ROUTES = ['/dashboard', '/ebas-credit', '/ebas-dashboard', '/travel-packages'];

// Rutas públicas
const PUBLIC_ROUTES = ['/', '/login', '/register', '/wallet-login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verificar si es una ruta protegida
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    // Verificar si hay wallet conectada en localStorage (via cookie)
    const walletCookie = request.cookies.get('wallet_connected')?.value;

    if (!walletCookie) {
      // Redirigir a wallet login si no está conectada
      const url = request.nextUrl.clone();
      url.pathname = '/wallet-login';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
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
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
