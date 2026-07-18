import { PrismaClient } from "@prisma/client";
import { Role, StationKind, OrderStatus } from "../src/types/enums";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Clear database
  await prisma.orderStatusEvent.deleteMany();
  await prisma.govOrderLine.deleteMany();
  await prisma.govOrder.deleteMany();
  await prisma.restockLine.deleteMany();
  await prisma.restockRequest.deleteMany();
  await prisma.item.deleteMany();
  await prisma.user.deleteMany();
  await prisma.station.deleteMany();
  await prisma.nationalCatalogItem.deleteMany();
  await prisma.facility.deleteMany();
  await prisma.trainingAssignment.deleteMany();
  await prisma.trainingModule.deleteMany();
  await prisma.shift.deleteMany();
  await prisma.patient.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  // 2. Create Stations
  const kibera = await prisma.station.create({
    data: {
      name: "Kibera Main Clinic",
      kind: StationKind.CLINIC,
      location: "Kibera Sector 3, Nairobi",
      services: "Outpatient Care, Maternity, Pharmacy, Vaccinations",
      contact: "+254 722 000 111",
      hours: "08:00 - 20:00",
      basicCareGuide: "Prioritize fever checks and hydration for pediatric cases.",
    },
  });

  const northlands = await prisma.station.create({
    data: {
      name: "Northlands Satellite",
      kind: StationKind.VOLUNTEER,
      location: "Northlands Outpost, Central Region",
      services: "Basic First Aid, Health Education, Medication Dispensing",
      contact: "+254 733 222 333",
      hours: "09:00 - 17:00",
      basicCareGuide: "Focus on clean wound care dressing and first response.",
    },
  });

  const riverside = await prisma.station.create({
    data: {
      name: "Riverside Clinic",
      kind: StationKind.CLINIC,
      location: "Riverside Drive, Westlands",
      services: "General Practice, Laboratory services, Family Planning",
      contact: "+254 711 444 555",
      hours: "24 Hours",
      basicCareGuide: "Monitor emergency hydration runway levels.",
    },
  });

  const hillcrest = await prisma.station.create({
    data: {
      name: "Hillcrest Care Point",
      kind: StationKind.VOLUNTEER,
      location: "Hillcrest Heights",
      services: "Home Care visits, Nutrition advice, First Aid triage",
      contact: "+254 700 888 999",
      hours: "08:00 - 16:00",
      basicCareGuide: "Primary checkups and nutritional assessments.",
    },
  });

  console.log("Stations seeded.");

  // 3. Create Users
  const nurse = await prisma.user.create({
    data: {
      email: "nurse@healthlinkgh.demo",
      passwordHash,
      name: "Akosua Mansa",
      role: Role.NURSE,
      stationId: kibera.id,
    },
  });

  const doctor = await prisma.user.create({
    data: {
      email: "doctor@healthlinkgh.demo",
      passwordHash,
      name: "Dr. Kofi Mensah",
      role: Role.DOCTOR,
      stationId: riverside.id,
    },
  });

  const supervisor = await prisma.user.create({
    data: {
      email: "supervisor@healthlinkgh.demo",
      passwordHash,
      name: "Serwaa Bonsu",
      role: Role.SUPERVISOR,
      stationId: null, // Supervisors scope nationwide
    },
  });

  const pharmacy = await prisma.user.create({
    data: {
      email: "pharmacy@healthlinkgh.demo",
      passwordHash,
      name: "Pharmacist Yaw Osei",
      role: Role.PHARMACY,
      stationId: null, // Pharmacy scope nationwide
    },
  });

  console.log("Users seeded.");

  // 4. Create Items per station (Drugs/Stock levels)
  const kiberaItems = [
    { name: "ORS sachets", unit: "sachets", qty: 240, threshold: 100, batchNumber: "B-2411", expiryDate: new Date("2027-02-13") },
    { name: "Malaria rapid tests", unit: "kits", qty: 18, threshold: 25, batchNumber: "B-2408", expiryDate: new Date("2026-10-21") },
    { name: "Paracetamol 500mg", unit: "tabs", qty: 1200, threshold: 500, batchNumber: "B-2401", expiryDate: new Date("2028-01-05") },
    { name: "Amoxicillin 250mg", unit: "tabs", qty: 0, threshold: 150, batchNumber: "B-2402", expiryDate: new Date("2026-12-15") }, // Out of stock
    { name: "Iron/folate tabs", unit: "tabs", qty: 65, threshold: 120, batchNumber: "B-2403", expiryDate: new Date("2027-05-18") }, // Low stock
  ];

  const riversideItems = [
    { name: "ORS sachets", unit: "sachets", qty: 85, threshold: 100, batchNumber: "B-2411", expiryDate: new Date("2027-02-13") }, // Low stock
    { name: "Malaria rapid tests", unit: "kits", qty: 45, threshold: 25, batchNumber: "B-2408", expiryDate: new Date("2026-10-21") },
    { name: "Paracetamol 500mg", unit: "tabs", qty: 800, threshold: 500, batchNumber: "B-2401", expiryDate: new Date("2028-01-05") },
    { name: "Amoxicillin 250mg", unit: "tabs", qty: 350, threshold: 150, batchNumber: "B-2402", expiryDate: new Date("2026-12-15") },
    { name: "Co-trimoxazole 480mg", unit: "tabs", qty: 400, threshold: 200, batchNumber: "B-2415", expiryDate: new Date("2027-09-30") },
  ];

  for (const item of kiberaItems) {
    await prisma.item.create({
      data: { ...item, stationId: kibera.id },
    });
  }

  for (const item of riversideItems) {
    await prisma.item.create({
      data: { ...item, stationId: riverside.id },
    });
  }

  // Seed default items for other stations too
  const otherStations = [northlands, hillcrest];
  for (const s of otherStations) {
    await prisma.item.create({
      data: { name: "Paracetamol 500mg", unit: "tabs", qty: 300, threshold: 100, batchNumber: "B-2401", expiryDate: new Date("2028-01-05"), stationId: s.id },
    });
    await prisma.item.create({
      data: { name: "ORS sachets", unit: "sachets", qty: 150, threshold: 50, batchNumber: "B-2411", expiryDate: new Date("2027-02-13"), stationId: s.id },
    });
  }

  console.log("Station Items seeded.");

  // 5. Create National Catalog Items
  const catalog = [
    { name: "Paracetamol 500mg", unit: "tabs", nationalStock: 50000, avgLeadTimeDays: 3 },
    { name: "Amoxicillin 250mg", unit: "tabs", nationalStock: 25000, avgLeadTimeDays: 5 },
    { name: "ORS sachets", unit: "sachets", nationalStock: 15000, avgLeadTimeDays: 4 },
    { name: "Iron/folate tabs", unit: "tabs", nationalStock: 30000, avgLeadTimeDays: 7 },
    { name: "Co-trimoxazole 480mg", unit: "tabs", nationalStock: 18000, avgLeadTimeDays: 5 },
    { name: "Malaria rapid tests", unit: "kits", nationalStock: 10000, avgLeadTimeDays: 3 },
  ];

  const catalogItems = [];
  for (const cat of catalog) {
    const created = await prisma.nationalCatalogItem.create({ data: cat });
    catalogItems.push(created);
  }

  console.log("National Catalog seeded.");

  // 6. Create Gov Orders in different states
  // Order 1: Delivered order for Riverside
  const orderDelivered = await prisma.govOrder.create({
    data: {
      stationId: riverside.id,
      requestedById: doctor.id,
      status: OrderStatus.DELIVERED,
      createdAt: new Date("2026-07-01"),
      lines: {
        create: [
          { catalogItemId: catalogItems[0].id, qtyRequested: 500, qtyApproved: 500 },
          { catalogItemId: catalogItems[2].id, qtyRequested: 100, qtyApproved: 100 },
        ],
      },
    },
  });
  await prisma.orderStatusEvent.createMany({
    data: [
      { govOrderId: orderDelivered.id, status: OrderStatus.SUBMITTED, note: "Routine monthly order", timestamp: new Date("2026-07-01") },
      { govOrderId: orderDelivered.id, status: OrderStatus.APPROVED, note: "Full amount approved", timestamp: new Date("2026-07-02") },
      { govOrderId: orderDelivered.id, status: OrderStatus.DISPATCHED, note: "Dispatched via Dispatch Van A", timestamp: new Date("2026-07-03") },
      { govOrderId: orderDelivered.id, status: OrderStatus.DELIVERED, note: "Received and counted. Matches.", timestamp: new Date("2026-07-05") },
    ],
  });

  // Order 2: Approved / Dispatched order for Kibera
  const orderDispatched = await prisma.govOrder.create({
    data: {
      stationId: kibera.id,
      requestedById: nurse.id,
      status: OrderStatus.DISPATCHED,
      createdAt: new Date("2026-07-15"),
      lines: {
        create: [
          { catalogItemId: catalogItems[1].id, qtyRequested: 300, qtyApproved: 300 },
          { catalogItemId: catalogItems[3].id, qtyRequested: 150, qtyApproved: 120 }, // partial approval
        ],
      },
    },
  });
  await prisma.orderStatusEvent.createMany({
    data: [
      { govOrderId: orderDispatched.id, status: OrderStatus.SUBMITTED, note: "Stock is critically low", timestamp: new Date("2026-07-15") },
      { govOrderId: orderDispatched.id, status: OrderStatus.APPROVED, note: "Iron folate stock limited. Approved 120.", timestamp: new Date("2026-07-16") },
      { govOrderId: orderDispatched.id, status: OrderStatus.DISPATCHED, note: "Shipped with order batch #441", timestamp: new Date("2026-07-17") },
    ],
  });

  // Order 3: Submitted (Pending approval) order for Kibera
  const orderSubmitted = await prisma.govOrder.create({
    data: {
      stationId: kibera.id,
      requestedById: nurse.id,
      status: OrderStatus.SUBMITTED,
      createdAt: new Date("2026-07-18"),
      lines: {
        create: [
          { catalogItemId: catalogItems[2].id, qtyRequested: 200 },
        ],
      },
    },
  });
  await prisma.orderStatusEvent.create({
    data: { govOrderId: orderSubmitted.id, status: OrderStatus.SUBMITTED, note: "Requested restock for ORS", timestamp: new Date("2026-07-18") },
  });

  console.log("Gov Orders seeded.");

  // 7. Seed Facilities (Module 2)
  const facilities = [
    { name: "Kibera Main Clinic", location: "Kibera Sector 3", isOpen: true, openTime: "08:00", closeTime: "20:00", contact: "+254 722 000 111", notice: null },
    { name: "Riverside Clinic", location: "Riverside Drive, Westlands", isOpen: true, openTime: "00:00", closeTime: "23:59", contact: "+254 711 444 555", notice: "Open 24/7 for emergency cases." },
    { name: "Northlands Outpost", location: "Northlands Central Region", isOpen: false, openTime: "09:00", closeTime: "17:00", contact: "+254 733 222 333", notice: "Currently closed due to renovations." },
    { name: "Hillcrest Care Point", location: "Hillcrest Heights", isOpen: true, openTime: "08:00", closeTime: "16:00", contact: "+254 700 888 999", notice: "Staff training held on Friday afternoons." },
  ];
  for (const fac of facilities) {
    await prisma.facility.create({ data: fac });
  }

  // 8. Seed Training Modules & Assignments (Module 5)
  const trainModules = [
    { title: "First Aid Basics & Wound Care", durationMinutes: 60, description: "Covers bleeding control, wound sanitation, dressing application, and emergency pressure points." },
    { title: "Pediatric Hydration & Fever Management", durationMinutes: 45, description: "How to identify dehydration stages in kids and manage fevers safely using paracetamol and ORS." },
    { title: "Emergency Triage Procedures", durationMinutes: 90, description: "HR training on prioritizing patients during critical arrivals and reducing facility stress levels." },
  ];
  for (const tm of trainModules) {
    await prisma.trainingModule.create({ data: tm });
  }

  const assignments = [
    { staffName: "Akosua Mansa", moduleTitle: "First Aid Basics & Wound Care", status: "certified" },
    { staffName: "Akosua Mansa", moduleTitle: "Pediatric Hydration & Fever Management", status: "completed" },
    { staffName: "Dr. Kofi Mensah", moduleTitle: "Emergency Triage Procedures", status: "certified" },
    { staffName: "Ekow Boateng", moduleTitle: "First Aid Basics & Wound Care", status: "in_progress" },
    { staffName: "Afia Owusu", moduleTitle: "Pediatric Hydration & Fever Management", status: "assigned" },
  ];
  for (const ass of assignments) {
    await prisma.trainingAssignment.create({ data: ass });
  }

  console.log("Training Modules and Assignments seeded.");

  // 9. Seed Shifts (Module 6)
  const shifts = [
    { date: "2026-07-18", staffName: "Akosua Mansa", shiftType: "day", startTime: "08:00", endTime: "16:00", notes: "Kibera main shift", nightDifferential: false },
    { date: "2026-07-18", staffName: "Ekow Boateng", shiftType: "evening", startTime: "16:00", endTime: "22:00", notes: "Evening coverage", nightDifferential: false },
    { date: "2026-07-18", staffName: "Dr. Kofi Mensah", shiftType: "night", startTime: "22:00", endTime: "08:00", notes: "Emergency doctor on-call", nightDifferential: true },
    
    { date: "2026-07-19", staffName: "Afia Owusu", shiftType: "day", startTime: "08:00", endTime: "16:00", notes: "Regular morning duty", nightDifferential: false },
    { date: "2026-07-19", staffName: "Dr. Kofi Mensah", shiftType: "night", startTime: "22:00", endTime: "08:00", notes: "Rotational night-shift", nightDifferential: true },
  ];
  for (const sh of shifts) {
    await prisma.shift.create({ data: sh });
  }

  console.log("Shifts seeded.");

  // 10. Seed Patients (Keeping user details / Medical records)
  const patients = [
    {
      name: "Kofi Annan Jr.",
      gender: "male",
      dateOfBirth: "2018-05-14",
      bloodType: "O+",
      phone: "+233 24 555 1212",
      address: "House 45, Adabraka, Accra",
      allergies: "Penicillin",
      medicalHistory: "Childhood asthma. Hospitalized in 2024 for severe asthmatic attack. Managed with salbutamol.",
      currentMeds: "Salbutamol inhaler as needed.",
    },
    {
      name: "Ama Serwaa",
      gender: "female",
      dateOfBirth: "1994-09-22",
      bloodType: "A-",
      phone: "+233 27 666 4545",
      address: "Apartment 3B, Cantonments, Accra",
      allergies: "Sulfa drugs, Peanuts",
      medicalHistory: "Chronic iron deficiency anemia. Follow-up visits show improving red blood counts.",
      currentMeds: "Iron supplements (ferrous sulfate 325mg daily).",
    },
    {
      name: "Kwame Boateng",
      gender: "male",
      dateOfBirth: "1972-11-03",
      bloodType: "B+",
      phone: "+233 20 888 7777",
      address: "Plot 12, Kumasi Ring Road",
      allergies: null,
      medicalHistory: "Type 2 diabetes mellitus diagnosed in 2021. Generally well-controlled through diet and medication.",
      currentMeds: "Metformin 500mg twice daily.",
    },
  ];
  for (const pat of patients) {
    await prisma.patient.create({ data: pat });
  }

  console.log("Patients records seeded.");
  console.log("All seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
