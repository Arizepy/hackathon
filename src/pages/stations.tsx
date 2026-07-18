import { useListStations } from "@workspace/api-client-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Clock, Stethoscope, BriefcaseMedical } from "lucide-react"

export default function Stations() {
  const { data: stations } = useListStations()

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
            <MapPin className="w-6 h-6 text-primary" />
            Satellite Stations
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Volunteer-run community care points</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {stations?.map((station: any) => (
            <Card key={station.id} className="border-l-4 border-l-primary/60">
              <CardHeader className="pb-2">
                <CardTitle>{station.name}</CardTitle>
                <CardDescription className="flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5" /> {station.location}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <div className="flex flex-wrap gap-2">
                  {station.services.split(',').map((service: any, i: number) => (
                    <Badge key={i} variant="secondary" className="bg-primary/5 text-primary border-primary/20">
                      {service.trim()}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-md border border-border/50">
                    <Phone className="w-4 h-4" /> {station.contact}
                  </div>
                  {station.hours && (
                    <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-md border border-border/50">
                      <Clock className="w-4 h-4" /> {station.hours}
                    </div>
                  )}
                </div>

                {station.basicCareGuide && (
                  <div className="mt-4 p-4 bg-blue-500/5 rounded-lg border border-blue-500/10">
                    <h4 className="text-sm font-semibold flex items-center gap-2 text-blue-700 mb-2">
                      <BriefcaseMedical className="w-4 h-4" /> Specific Care Guide
                    </h4>
                    <p className="text-sm text-blue-900/80 leading-relaxed">{station.basicCareGuide}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {(!stations || stations.length === 0) && (
            <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed rounded-xl">
              <MapPin className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p>No satellite stations registered.</p>
            </div>
          )}
        </div>
      </section>

      <section className="pt-6 border-t border-border/50">
        <div className="mb-6">
          <h2 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-emerald-500" />
            General Basic Care Guides
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Quick reference for common community health issues</p>
        </div>

        <Card className="shadow-sm">
          <CardContent className="p-0">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="px-6">
                <AccordionTrigger className="text-lg font-serif">Fever Management in Children</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Keep the child lightly dressed in a cool room.</li>
                    <li>Offer plenty of fluids to prevent dehydration.</li>
                    <li>Administer paracetamol (acetaminophen) according to age/weight guidelines. <strong>Never give aspirin to children.</strong></li>
                    <li>Seek immediate medical help if fever is over 39°C (102.2°F), persists for more than 3 days, or is accompanied by a stiff neck or rash.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="px-6">
                <AccordionTrigger className="text-lg font-serif">Wound Cleaning & First Aid</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Wash hands thoroughly before treating the wound.</li>
                    <li>Stop bleeding by applying direct pressure with a clean cloth.</li>
                    <li>Clean the wound gently with clean water. Avoid harsh soaps or iodine on open tissue.</li>
                    <li>Apply a thin layer of antibiotic ointment and cover with a sterile bandage.</li>
                    <li>Change the dressing daily or if it becomes wet/dirty.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="px-6 border-b-0">
                <AccordionTrigger className="text-lg font-serif">Recognizing Dehydration</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Mild to Moderate:</strong> Thirst, dry mouth, dark yellow urine, dry skin, headache, muscle cramps. Provide ORS (Oral Rehydration Solution) or clean water.</li>
                    <li><strong>Severe (Seek Help):</strong> Extreme thirst, very dry mouth, no urine for hours, sunken eyes, confusion, lethargy. Needs IV fluids at a primary facility.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </section>

    </div>
  )
}
