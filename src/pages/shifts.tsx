import { useListShifts } from "@workspace/api-client-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Users, Calendar, Plus, Moon } from "lucide-react"

export default function Shifts() {
  const { data: shifts } = useListShifts()

  // Group shifts by date
  const groupedShifts = shifts?.reduce((acc: any, shift: any) => {
    const date = shift.date
    if (!acc[date]) acc[date] = []
    acc[date].push(shift)
    return acc
  }, {} as Record<string, typeof shifts>) || {}

  const sortedDates = Object.keys(groupedShifts).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

  const getShiftBadge = (type: string) => {
    switch(type) {
      case 'day': return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">DAY</Badge>
      case 'evening': return <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-200">EVENING</Badge>
      case 'night': return <Badge variant="outline" className="bg-slate-800 text-slate-100 border-slate-700">NIGHT</Badge>
      default: return <Badge variant="outline">{type}</Badge>
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">Staff & Shifts</h2>
          <p className="text-sm text-muted-foreground mt-1">Schedule and manage facility coverage</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Users className="w-4 h-4 mr-2" /> Manage Staff</Button>
          <Button><Plus className="w-4 h-4 mr-2" /> Assign Shift</Button>
        </div>
      </div>

      <div className="space-y-8">
        {sortedDates.map(dateStr => (
          <Card key={dateStr} className="overflow-hidden shadow-sm">
            <CardHeader className="bg-muted/30 border-b py-4">
              <CardTitle className="text-lg flex items-center gap-2 font-sans font-medium">
                <Calendar className="w-5 h-5 text-primary" />
                {format(new Date(dateStr), 'EEEE, MMMM d, yyyy')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-transparent hover:bg-transparent">
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupedShifts[dateStr].map((shift: any) => (
                    <TableRow key={shift.id}>
                      <TableCell className="font-medium">{shift.staffName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getShiftBadge(shift.shiftType)}
                          {shift.nightDifferential && (
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-500" title="Night Differential Applies">
                              <Moon className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">
                        {shift.startTime.slice(0,5)} - {shift.endTime.slice(0,5)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                        {shift.notes || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}

        {sortedDates.length === 0 && (
          <div className="py-16 text-center text-muted-foreground bg-card rounded-xl border border-dashed">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No upcoming shifts scheduled.</p>
          </div>
        )}
      </div>
    </div>
  )
}
