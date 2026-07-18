import { useState } from "react"
import { useListMedicines, useAdjustMedicineStock, useGetTopMedicines, getListMedicinesQueryKey } from "@workspace/api-client-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Minus, ArrowUpRight, FlaskConical } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { format } from "date-fns"

export default function Inventory() {
  const [search, setSearch] = useState("")
  const { data: medicines } = useListMedicines({ search: search || undefined })
  const { data: topMedicines } = useGetTopMedicines({ period: "weekly" })
  
  const queryClient = useQueryClient()
  const adjustStock = useAdjustMedicineStock()

  const handleAdjust = (id: number, delta: number) => {
    adjustStock.mutate({ id, data: { delta } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMedicinesQueryKey() })
        toast.success(`Stock adjusted by ${delta > 0 ? "+" : ""}${delta}`)
      },
      onError: () => {
        toast.error("Failed to adjust stock")
      }
    })
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="xl:col-span-3 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search medicines..." 
              className="pl-9 bg-card"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button>Add Medicine</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {medicines?.map((med: any) => (
            <Card key={med.id} className="group overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{med.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">Batch: {med.batchNumber} • Exp: {format(new Date(med.expiryDate), 'MMM yyyy')}</p>
                    </div>
                    <Badge variant={med.status as any}>{med.status}</Badge>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Current Stock</span>
                        <span className="font-medium">{med.quantity} {med.unit}</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${med.status === 'out' ? 'bg-destructive' : med.status === 'low' ? 'bg-amber-500' : 'bg-primary'}`} 
                          style={{ width: `${Math.min(100, (med.quantity / (med.threshold * 2)) * 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">Threshold: {med.threshold}</p>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Button 
                        size="icon" 
                        variant="outline" 
                        className="h-8 w-8 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
                        onClick={() => handleAdjust(med.id, 10)}
                        disabled={adjustStock.isPending}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="outline" 
                        className="h-8 w-8 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                        onClick={() => handleAdjust(med.id, -10)}
                        disabled={adjustStock.isPending}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {medicines?.length === 0 && (
            <div className="col-span-1 md:col-span-2 py-16 text-center text-muted-foreground bg-card rounded-xl border border-dashed">
              <FlaskConical className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No medicines found matching "{search}"</p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <Card className="sticky top-24 shadow-sm border-primary/10">
          <CardHeader className="bg-primary/5 pb-4 border-b">
            <CardTitle className="text-lg">Most Used</CardTitle>
            <CardDescription>Top 10 highest consumption (Weekly)</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {topMedicines?.map((med: any, i: number) => (
                <div key={med.medicineId} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{med.name}</p>
                      <p className="text-xs text-muted-foreground">Rank {med.rank}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">{med.totalUsed}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">{med.unit || 'units'}</p>
                  </div>
                </div>
              ))}
              {(!topMedicines || topMedicines.length === 0) && (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No usage data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
