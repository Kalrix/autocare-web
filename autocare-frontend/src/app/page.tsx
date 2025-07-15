'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-4">
      <Card className="w-full max-w-md border border-gray-200 shadow-md">
        <CardContent className="p-6 flex flex-col items-center gap-6">
          <h1 className="text-3xl font-bold text-center text-black">
            Welcome to AutoCare24
          </h1>

          <div className="w-full flex flex-col gap-4">
            <Button asChild className="w-full">
              <Link href="https://admin.autocare24.co.in">Admin Login</Link>
            </Button>

            <Button asChild className="w-full">
              <Link href="https://store.autocare24.co.in">Store Login</Link>
            </Button>

            <Button asChild className="w-full">
              <Link href="https://garage.autocare24.co.in">Garage Login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
