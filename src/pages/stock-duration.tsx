import { useGetStockDuration } from "@workspace/api-client-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, TrendingDown } from "lucide-react"

export default function StockDuration() {
  const { data: durationEstimates } = useGetStockDuration()

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 text-muted-foreground mb-4">
        <TrendingDown className="w-8 h-8 text-primary" />
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">Runway Estimates</h2>
          <p className="text-sm">Based on recent average consumption rates</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stock Duration Projection</CardTitle>
          <CardDescription>Predictive analytics for remaining stock</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicine</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Avg. Daily Use</TableHead>
                <TableHead className="w-1/3">Est. Days Remaining</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {durationEstimates?.map((est: any) => {
                const days = est.daysRemaining ?? 0
                const isCritical = days < 7
                const isWarning = days >= 7 && days < 14
                
                let progressValue = (days / 30) * 100 // Scale relative to 30 days
                if (progressValue > 100) progressValue = 100
                if (est.daysRemaining === null) progressValue = 0

                return (
                  <TableRow key={est.medicineId}>
                    <TableCell className="font-medium">{est.name}</TableCell>
                    <TableCell>{est.quantity}</TableCell>
                    <TableCell>{est.usageRate?.toFixed(1) || '0.0'}/day</TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium">
                            {est.daysRemaining === null ? 'Unknown' : `${days} days`}
                          </span>
                        </div>
                        <Progress 
                          value={progressValue} 
                          indicatorClassName={
                            isCritical ? 'bg-destructive' : 
                            isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                          } 
                          className="h-2"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {est.reorderSuggested ? (
                        <Badge variant="destructive" className="animate-pulse">
                          <AlertTriangle className="w-3 h-3 mr-1" /> Reorder Now
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">OK</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
              {(!durationEstimates || durationEstimates.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No estimate data available yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
