import ApplicationDashboard from "@/components/application-dashboard"
import { SignedIn, SignedOut } from '@clerk/nextjs'

export default function Home() {
  return (
    <main className="min-h-screen flex justify-center">
      <ApplicationDashboard />
    </main>
  )
}
