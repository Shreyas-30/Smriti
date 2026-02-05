"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function LogoutButton() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) toast.error(error.message);
    router.push("/login");
  }

  return (
    <Button variant="outline" onClick={logout}>
      Logout
    </Button>
  );
}
