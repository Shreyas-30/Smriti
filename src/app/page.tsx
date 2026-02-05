import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle>Smriti</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">
              Voice-first memory capture for Indian families.
            </p>

            <Button>Get started</Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
