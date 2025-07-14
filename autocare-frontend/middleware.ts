import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';

  // Rewrite based on subdomain
  if (hostname.startsWith('admin.')) {
    return NextResponse.rewrite(new URL('/admin/login', request.url));
  }

  if (hostname.startsWith('garage.')) {
    return NextResponse.rewrite(new URL('/garage/login', request.url));
  }

  if (hostname.startsWith('store.')) {
    return NextResponse.rewrite(new URL('/store/login', request.url));
  }

  // fallback for main domain or unknown subdomains
  return NextResponse.next();
}
