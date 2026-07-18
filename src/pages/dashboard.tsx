import { useGetInventorySummary, useGetTopMedicines, useListMedicines } from "@workspace/api-client-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, AlertTriangle, XCircle, Tag, ArrowRight } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { Badge } from "@/components/ui/badge"
import { Link } from "wouter"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function Dashboard() {
  const { data: summary } = useGetInventorySummary()
  const { data: topMedicines } = useGetTopMedicines()
  const { data: medicines } = useListMedicines()

  const alerts = medicines?.filter((m: any) => m.status === 'out' || m.status === 'low').slice(0, 5) || []

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-t-4 border-t-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Total Units</p>
                <p className="text-3xl font-serif font-bold mt-2">{summary?.totalUnits || 0}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">SKUs Tracked</p>
                <p className="text-3xl font-serif font-bold mt-2">{summary?.skusTracked || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center">
                <Tag className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-amber-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Low Stock</p>
                <p className="text-3xl font-serif font-bold mt-2">{summary?.lowStock || 0}</p>
              </div>
              <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-destructive">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Out of Stock</p>
                <p className="text-3xl font-serif font-bold mt-2">{summary?.outOfStock || 0}</p>
              </div>
              <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Usage Analytics</CardTitle>
            <CardDescription>Top 10 most used medicines across facilities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              {topMedicines && topMedicines.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topMedicines} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                    <Bar dataKey="totalUsed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <FlaskConical className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>No usage data available yet</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Reorder Alerts */}
        <Card className="shadow-sm border-amber-500/20 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Action Required
            </CardTitle>
            <CardDescription>Items that need immediate reordering</CardDescription>
          </CardHeader>
          <CardContent>
            {alerts.length > 0 ? (
              <div className="space-y-4">
                {alerts.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-background border shadow-sm">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} / {item.threshold} {item.unit} left
                      </p>
                    </div>
                    <Badge variant={item.status as any}>{item.status}</Badge>
                  </div>
                ))}
                <Link href="/inventory" className="w-full">
                  <Button variant="outline" className="w-full mt-2 bg-background">
                    View All Inventory <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500/50" />
                <p>All stock levels look good.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function FlaskConical(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2v7.31"/><path d="M14 9.3V1.99"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/><path d="M5.52 16h12.96"/></svg>
}

function CheckCircle2(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
}