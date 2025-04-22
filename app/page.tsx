import ApplicationDashboard from "@/components/application-dashboard"
import colors from "@/lib/colors.json"
import { Waitlist } from '@clerk/nextjs'

export default function Home() {
  // In a real implementation, you would check if the user is authenticated
  // const isAuthenticated = false;
  // if (!isAuthenticated) {
  //   redirect("/sign-in");
  // }

  return (
    <main
      className="min-h-screen flex justify-center"
      style={{ backgroundColor: colors.theme.background, color: colors.theme.foreground }}
    >
      {/* <ApplicationDashboard /> */}
      <div className="flex items-center">
      <Waitlist />
      </div>

    </main>
  )
}
