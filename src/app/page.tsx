import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-50 p-6">
      <div className="mx-auto max-w-xl">
        <Card className="border-neutral-200">
          <CardHeader>
            <CardTitle className="text-neutral-900">Smriti</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-neutral-700">
              Voice-first memory capture for Indian families.
            </p>
            <Button className="bg-primary-600 hover:bg-primary-500">
              Get started
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
