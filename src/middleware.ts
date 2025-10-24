import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Additional middleware logic can go here
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/auth/signin',
    },
  }
);

// Protect all routes under /dashboard, /reunions, /convocations, /remontees, /comptes-rendus, /membres
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/reunions/:path*',
    '/convocations/:path*',
    '/remontees/:path*',
    '/comptes-rendus/:path*',
    '/membres/:path*',
  ],
};
