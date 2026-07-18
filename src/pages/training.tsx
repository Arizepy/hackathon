import { useListTrainingModules, useListTrainingAssignments, useCompleteTrainingAssignment, getListTrainingAssignmentsQueryKey } from "@workspace/api-client-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Stethoscope, CheckCircle2, Clock, BookOpen, GraduationCap } from "lucide-react"

export default function Training() {
  const { data: modules } = useListTrainingModules()
  const { data: assignments } = useListTrainingAssignments()
  const queryClient = useQueryClient()
  const completeMutation = useCompleteTrainingAssignment()

  const handleComplete = (id: number) => {
    completeMutation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTrainingAssignmentsQueryKey() })
        toast.success("Training marked as completed")
      },
      onError: () => toast.error("Failed to update status")
    })
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'certified': return <Badge className="bg-purple-500 hover:bg-purple-600"><GraduationCap className="w-3 h-3 mr-1"/> Certified</Badge>
      case 'completed': return <Badge className="bg-emerald-500 hover:bg-emerald-600">Completed</Badge>
      case 'in_progress': return <Badge className="bg-blue-500 hover:bg-blue-600">In Progress</Badge>
      case 'assigned': return <Badge variant="outline" className="text-muted-foreground border-dashed">Assigned</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">First Aid & Protocol Training</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage staff certifications and basic care modules</p>
        </div>
        <Button variant="outline"><BookOpen className="w-4 h-4 mr-2" /> Add Module</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Staff Training Status</CardTitle>
              <CardDescription>Track completion of required modules</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments?.map((assignment: any) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">{assignment.staffName}</TableCell>
                      <TableCell className="text-muted-foreground">{assignment.moduleTitle}</TableCell>
                      <TableCell>{getStatusBadge(assignment.status)}</TableCell>
                      <TableCell className="text-right">
                        {(assignment.status === 'assigned' || assignment.status === 'in_progress') && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            onClick={() => handleComplete(assignment.id)}
                            disabled={completeMutation.isPending}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Complete
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!assignments || assignments.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No training assignments found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <h3 className="font-serif font-semibold text-lg">Available Modules</h3>
          {modules?.map((mod: any) => (
            <Card key={mod.id} className="bg-card shadow-sm border-l-4 border-l-blue-500">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base leading-tight">{mod.title}</CardTitle>
                <CardDescription className="flex items-center gap-1 text-xs mt-1">
                  <Clock className="w-3.5 h-3.5" /> {mod.durationMinutes} minutes
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{mod.description}</p>
                <Button variant="outline" size="sm" className="w-full">Assign to Staff</Button>
              </CardContent>
            </Card>
          ))}
          {(!modules || modules.length === 0) && (
            <div className="py-8 text-center text-muted-foreground border border-dashed rounded-xl">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No modules created.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
