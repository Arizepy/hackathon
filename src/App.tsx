import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AppLayout } from "@/components/layout"
import { Route, Switch, Router as WouterRouter } from "wouter"
import { RoleProvider } from "@/contexts/RoleContext"
import Dashboard from "@/pages/dashboard"
import Inventory from "@/pages/inventory"
import StockDuration from "@/pages/stock-duration"
import Facilities from "@/pages/facilities"
import Stations from "@/pages/stations"
import Training from "@/pages/training"
import Shifts from "@/pages/shifts"
import Patients from "@/pages/patients"
import NotFound from "@/pages/not-found"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "next-themes"

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <RoleProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AppLayout>
              <Switch>
                <Route path="/" component={Dashboard} />
                <Route path="/inventory" component={Inventory} />
                <Route path="/stock-duration" component={StockDuration} />
                <Route path="/facilities" component={Facilities} />
                <Route path="/stations" component={Stations} />
                <Route path="/training" component={Training} />
                <Route path="/shifts" component={Shifts} />
                <Route path="/patients" component={Patients} />
                <Route component={NotFound} />
              </Switch>
            </AppLayout>
          </WouterRouter>
          <Toaster />
        </RoleProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
