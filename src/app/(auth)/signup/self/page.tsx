import { redirect } from "next/navigation";

export default function SignupSelfRedirect() {
  redirect("/signup");
}
