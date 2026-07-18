import { useState } from "react"
import { useListPatients, useGetPatient } from "@workspace/api-client-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, FileHeart, User, Phone, MapPin, Activity, AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function Patients() {
  const [search, setSearch] = useState("")
  const { data: patients } = useListPatients({ search: search || undefined })
  const [selectedId, setSelectedId] = useState<number | null>(null)
  
  const { data: selectedPatient } = useGetPatient(selectedId as number, { 
    query: { enabled: !!selectedId, queryKey: ['getPatient', selectedId] } 
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Patient List (Left Column) */}
      <div className="lg:col-span-1 space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-serif font-bold text-foreground">Records</h2>
            <Button size="icon" className="h-8 w-8 rounded-full"><Plus className="w-4 h-4" /></Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search patients..." 
              className="pl-9 bg-card"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-3 h-[calc(100vh-250px)] overflow-y-auto pr-2 pb-10">
          {patients?.map((patient: any) => (
            <div 
              key={patient.id} 
              onClick={() => setSelectedId(patient.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedId === patient.id ? 'bg-primary/5 border-primary shadow-sm' : 'bg-card hover:border-primary/50'}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-foreground">{patient.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">ID: P-{patient.id.toString().padStart(4, '0')}</p>
                </div>
                {patient.allergies && (
                  <div className="w-2 h-2 rounded-full bg-destructive" title="Has Allergies" />
                )}
              </div>
            </div>
          ))}
          {(!patients || patients.length === 0) && (
            <div className="text-center py-10 text-muted-foreground">
              <p>No records found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Patient Detail (Right Columns) */}
      <div className="lg:col-span-2">
        {selectedPatient ? (
          <Card className="shadow-md border-t-4 border-t-primary h-full">
            <CardHeader className="pb-4 border-b bg-muted/10">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-serif text-2xl font-bold">
                    {selectedPatient.name.charAt(0)}
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{selectedPatient.name}</CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-3">
                      <span className="capitalize">{selectedPatient.gender}</span>
                      <span>•</span>
                      <span>DOB: {selectedPatient.dateOfBirth}</span>
                      {selectedPatient.bloodType && (
                        <>
                          <span>•</span>
                          <span className="font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded text-xs">{selectedPatient.bloodType}</span>
                        </>
                      )}
                    </CardDescription>
                  </div>
                </div>
                <Button variant="outline" size="sm">Edit Record</Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <User className="w-4 h-4" /> Contact Info
                  </h4>
                  <div className="space-y-3 bg-muted/20 p-4 rounded-lg border border-border/50">
                    <div className="flex items-start gap-3 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <span>{selectedPatient.phone || 'No phone recorded'}</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <span>{selectedPatient.address || 'No address recorded'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Allergies
                  </h4>
                  <div className={`p-4 rounded-lg border ${selectedPatient.allergies ? 'bg-red-500/5 border-red-500/20' : 'bg-muted/20 border-border/50'}`}>
                    {selectedPatient.allergies ? (
                      <p className="text-sm text-red-800 font-medium">{selectedPatient.allergies}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No known allergies</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Medical History
                </h4>
                <div className="bg-muted/20 p-5 rounded-lg border border-border/50 min-h-[100px]">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedPatient.medicalHistory || 'No significant medical history recorded.'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <FileHeart className="w-4 h-4" /> Current Medications
                </h4>
                <div className="bg-muted/20 p-5 rounded-lg border border-border/50 min-h-[80px]">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedPatient.currentMeds || 'None recorded.'}
                  </p>
                </div>
              </div>

            </CardContent>
          </Card>
        ) : (
          <div className="h-full flex items-center justify-center border border-dashed rounded-xl bg-card/50">
            <div className="text-center text-muted-foreground">
              <FileHeart className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Select a patient to view their full record.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
