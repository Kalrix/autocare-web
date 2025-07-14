// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';

  if (hostname.startsWith('admin.')) {
    return NextResponse.rewrite(new URL('/admin/login', request.url));
  }

  if (hostname.startsWith('garage.')) {
    return NextResponse.rewrite(new URL('/garage/login', request.url));
  }

  if (hostname.startsWith('store.')) {
    return NextResponse.rewrite(new URL('/store/login', request.url));
  }

  return NextResponse.next();
}

// 👇 Specify which paths to match (optional)
export const config = {
  matcher: ['/'],
};
