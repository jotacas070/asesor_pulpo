import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: { code?: string; error?: string }
}) {
  const supabase = createClient()

  if (searchParams.error) {
    redirect("/auth/login?error=" + encodeURIComponent(searchParams.error))
  }

  if (searchParams.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(searchParams.code)
    if (error) {
      redirect("/auth/login?error=" + encodeURIComponent(error.message))
    }
  }

  // Redirect to home page after successful authentication
  redirect("/")
}
