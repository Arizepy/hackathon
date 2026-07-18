import { useListFacilities } from "@workspace/api-client-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Phone, Info, Plus } from "lucide-react"

export default function Facilities() {
  const { data: facilities } = useListFacilities()

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">Facility Hours</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage operational hours and statuses</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" /> Add Facility</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {facilities?.map((facility: any) => (
          <Card key={facility.id} className="relative overflow-hidden group">
            {/* Status indicator bar */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${facility.isOpen ? 'bg-emerald-500' : 'bg-red-500'}`} />
            
            <CardHeader className="pb-3 pt-6">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{facility.name}</CardTitle>
                <Badge variant={facility.isOpen ? "stocked" : "destructive"}>
                  {facility.isOpen ? "OPEN" : "CLOSED"}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-1.5 mt-2">
                <MapPin className="w-3.5 h-3.5" /> {facility.location}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{facility.openTime} - {facility.closeTime}</span>
                  </div>
                </div>

                {facility.contact && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" /> {facility.contact}
                  </div>
                )}
                
                {facility.notice && (
                  <div className="flex items-start gap-2 text-sm bg-amber-500/10 text-amber-700 p-3 rounded-md border border-amber-200">
                    <Info className="w-4 h-4 mt-0.5 shrink-0" />
                    <p className="leading-snug">{facility.notice}</p>
                  </div>
                )}

                <div className="pt-2">
                  <Button variant="outline" className="w-full text-xs">Edit Details</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {(!facilities || facilities.length === 0) && (
          <div className="col-span-full py-16 text-center text-muted-foreground bg-card rounded-xl border border-dashed">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No facilities configured yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
