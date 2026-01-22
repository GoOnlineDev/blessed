import { redirect } from "next/navigation";

export default async function Home() {
  // Redirect to dashboard - middleware will handle auth check
  redirect("/dashboard");
}
