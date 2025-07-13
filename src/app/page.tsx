import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center">
          <h1 className="text-2xl font-semibold mb-2">Hello, AutoCare!</h1>
          <p className="text-gray-600">ShadCN + Tailwind + Next.js = ❤️</p>
        </CardContent>
      </Card>
    </main>
  );
}
