import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  return (
    <div className="space-y-4">
      <Card className="border-neutral-200">
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="text-neutral-700">
          Logged in as{" "}
          <span className="font-medium">{userData.user?.email}</span>
        </CardContent>
      </Card>
    </div>
  );
}
