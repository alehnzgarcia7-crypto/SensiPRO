import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Rutas que requieren autenticacion
const protectedRoutes = [
  '/generator',
  '/results',
  '/compare',
  '/favorites',
  '/history',
  '/profile',
  '/activate',
  '/support',
  '/payments',
  '/leaderboard',
  '/tournaments',
];

// Rutas exclusivas de admin
const adminRoutes = ['/admin'];

// Command Center — acceso blindado por email
const COMMAND_CENTER_EMAIL = 'alehnzgarcia7@gmail.com';
const commandCenterRoutes = ['/command-center'];

// Rutas de auth (redirigir si ya esta autenticado)
const authRoutes = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Headers de seguridad
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthenticated = !!token;

  // Si esta en ruta de auth y ya esta autenticado, redirigir a generator
  if (authRoutes.some((route) => pathname.startsWith(route)) && isAuthenticated) {
    return NextResponse.redirect(new URL('/generator', request.url));
  }

  // Si esta en ruta protegida y no esta autenticado, redirigir a login
  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si esta en ruta admin, verificar rol
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/generator', request.url));
    }
  }

  // Command Center — acceso blindado solo por email autorizado
  const isCommandCenter = pathname.startsWith('/command-center') || pathname.startsWith('/api/command-center');
  if (isCommandCenter) {
    // API routes del command center (excepto /track que es publico)
    if (pathname.startsWith('/api/command-center') && !pathname.endsWith('/track')) {
      if (!isAuthenticated || token.email !== COMMAND_CENTER_EMAIL) {
        return NextResponse.json(
          { success: false, error: 'unauthorized' },
          { status: 403 }
        );
      }
    }

    // Paginas del command center
    if (pathname.startsWith('/command-center')) {
      if (!isAuthenticated) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      if (token.email !== COMMAND_CENTER_EMAIL) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|icons|api/auth).*)'],
};
