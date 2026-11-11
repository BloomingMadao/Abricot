import { redirect } from "next/navigation"

// "/" has no page of its own: we go to the dashboard.
// (Not logged in: proxy.ts has already sent the user to /connection)
export default function Home() {
  redirect("/dashboard")
}