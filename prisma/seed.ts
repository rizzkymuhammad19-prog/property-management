import { PrismaClient, SourceChannel, CampaignPlatform, UnitStatus, LeadStatus, LeadPriority, FinancingType, KprStatus, BookingPaymentStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "password123";

const FIRST_NAMES = [
  "Budi", "Sinta", "Andi", "Rina", "Dewi", "Agus", "Putri", "Rizal", "Wulan", "Fajar",
  "Yuni", "Dedi", "Lestari", "Hendra", "Ayu", "Bagus", "Citra", "Doni", "Eka", "Firman",
  "Gita", "Hana", "Irfan", "Joko", "Kartika", "Lukman", "Mega", "Nanda", "Oki", "Prita",
];
const LAST_NAMES = [
  "Santoso", "Wijaya", "Pratama", "Kusuma", "Saputra", "Hidayat", "Nugroho", "Setiawan",
  "Rahayu", "Purnama", "Gunawan", "Susanti", "Wibowo", "Halim", "Suryani",
];

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomName() {
  return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
}
function daysFromNow(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

async function main() {
  console.log("Seeding PROPERTY MANAGEMENT dummy data...");
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // ---------- Users ----------
  const superAdmin = await prisma.user.create({
    data: {
      name: "Super Admin",
      email: "superadmin@propertymanagement.local",
      passwordHash,
      role: "SUPER_ADMIN",
    },
  });

  const owner = await prisma.user.create({
    data: {
      name: "Ahmad Owner",
      email: "owner@propertymanagement.local",
      passwordHash,
      role: "OWNER",
    },
  });

  const salesManager = await prisma.user.create({
    data: {
      name: "Sari Manager",
      email: "salesmanager@propertymanagement.local",
      passwordHash,
      role: "SALES_MANAGER",
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: "Admin Operasional",
      email: "admin@propertymanagement.local",
      passwordHash,
      role: "ADMIN",
    },
  });

  const digitalMarketing = await prisma.user.create({
    data: {
      name: "Digital Marketing",
      email: "marketing@propertymanagement.local",
      passwordHash,
      role: "DIGITAL_MARKETING",
    },
  });

  const salesUsers = [];
  for (let i = 1; i <= 10; i++) {
    const name = randomName();
    const user = await prisma.user.create({
      data: {
        name: `${name} (Sales ${i})`,
        email: `sales${i}@propertymanagement.local`,
        passwordHash,
        role: "SALES",
        area: pick(["Bekasi Timur", "Bekasi Utara", "Cikarang", "Bekasi Selatan"]),
      },
    });
    salesUsers.push(user);
  }

  console.log(`Created ${salesUsers.length + 5} users.`);

  // ---------- Project & Blocks & Units ----------
  const project = await prisma.project.create({
    data: {
      name: "Cluster Harmoni Residence",
      slug: "harmoni-residence",
      city: "Bekasi",
      priceFrom: 195_000_000,
    },
  });

  const blockNames = ["A", "B", "C", "D", "E"];
  const unitsPerBlock = 26; // 5 x 26 = 130
  const statusPlan: UnitStatus[] = [
    ...Array(62).fill("AVAILABLE"),
    ...Array(5).fill("HOLD"),
    ...Array(28).fill("BOOKED"),
    ...Array(20).fill("KPR"),
    ...Array(15).fill("SOLD"),
  ]; // 130 total, shuffle below
  for (let i = statusPlan.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [statusPlan[i], statusPlan[j]] = [statusPlan[j], statusPlan[i]];
  }

  const units = [];
  let statusIdx = 0;
  for (const blockName of blockNames) {
    const block = await prisma.block.create({
      data: { projectId: project.id, name: blockName },
    });
    for (let n = 1; n <= unitsPerBlock; n++) {
      const status = statusPlan[statusIdx++];
      const price = randInt(195, 230) * 1_000_000;
      const unit = await prisma.unit.create({
        data: {
          blockId: block.id,
          unitNumber: `${blockName}${n}`,
          type: pick(["36/72", "45/90", "60/120"]),
          landArea: pick([72, 90, 120]),
          buildingArea: pick([36, 45, 60]),
          price,
          dp: Math.round(price * 0.1),
          estimatedInstallment: Math.round((price * 0.9) / 180),
          status,
          financingScheme:
            price <= 200_000_000
              ? pick<FinancingType>(["SUBSIDIZED_FLPP", "COMMERCIAL"])
              : "COMMERCIAL",
        },
      });
      units.push(unit);
    }
  }
  console.log(`Created ${units.length} units across ${blockNames.length} blocks.`);

  // ---------- Lead sources & Campaigns ----------
  const sourceRows = await Promise.all(
    Object.values(SourceChannel).map((name) =>
      prisma.leadSource.create({ data: { name } })
    )
  );

  const campaignPlatforms: CampaignPlatform[] = [
    "META_ADS",
    "INSTAGRAM",
    "GOOGLE_ADS",
    "TIKTOK",
    "ORGANIC",
  ];
  const campaigns = [];
  for (let i = 0; i < 5; i++) {
    const campaign = await prisma.campaign.create({
      data: {
        projectId: project.id,
        name: `Campaign ${["Awal Tahun", "Promo DP Ringan", "Subsidi FLPP", "Ramadan Sale", "Akhir Tahun"][i]}`,
        platform: campaignPlatforms[i],
        objective: "Lead generation",
        budget: randInt(5, 25) * 1_000_000,
        startDate: daysFromNow(-randInt(30, 120)),
        endDate: daysFromNow(-randInt(0, 20)),
      },
    });
    campaigns.push(campaign);
  }
  console.log(`Created ${campaigns.length} campaigns.`);

  // ---------- Content ----------
  for (let i = 1; i <= 30; i++) {
    const campaign = pick(campaigns);
    await prisma.content.create({
      data: {
        campaignId: campaign.id,
        title: `Konten Promo #${i}`,
        platform: campaign.platform,
        contentType: pick(["Reels", "Static Post", "Story", "Video Ads"]),
        publishDate: daysFromNow(-randInt(1, 90)),
        views: randInt(500, 20000),
        reach: randInt(300, 15000),
        engagement: randInt(10, 800),
        leadsCount: randInt(0, 15),
        surveyCount: randInt(0, 5),
        bookingCount: randInt(0, 2),
        revenue: randInt(0, 4) * 200_000_000,
      },
    });
  }
  console.log("Created 30 content records.");

  // ---------- Leads ----------
  // Funnel plan for 100 leads, mirroring the doc's example proportions.
  const statusPlanLeads: LeadStatus[] = [
    ...Array(20).fill("NEW"),
    ...Array(25).fill("CONTACTED"),
    ...Array(15).fill("QUALIFIED"),
    ...Array(10).fill("SURVEY"),
    ...Array(10).fill("FOLLOW_UP"),
    ...Array(5).fill("BOOKING"),
    ...Array(5).fill("KPR"),
    ...Array(5).fill("AKAD"),
    ...Array(5).fill("LOST"),
  ]; // sums to 100

  const availableUnitsForBooking = units.filter((u) => u.status === "BOOKED");
  const kprUnits = units.filter((u) => u.status === "KPR");
  const soldUnits = units.filter((u) => u.status === "SOLD");

  const leads = [];
  let bookedUnitPtr = 0;
  let kprUnitPtr = 0;
  let soldUnitPtr = 0;

  for (let i = 0; i < statusPlanLeads.length; i++) {
    const status = statusPlanLeads[i];
    const sales = pick(salesUsers);
    const hasSales = status !== "NEW" || Math.random() > 0.4;
    const lead = await prisma.lead.create({
      data: {
        projectId: project.id,
        name: randomName(),
        whatsapp: `08${randInt(1000000000, 1999999999)}`,
        email: Math.random() > 0.3 ? `lead${i}@example.com` : null,
        domisili: pick(["Bekasi", "Jakarta Timur", "Cikarang", "Bogor", "Depok"]),
        pekerjaan: pick(["Karyawan Swasta", "PNS", "Wiraswasta", "Freelancer"]),
        penghasilan: randInt(5, 15) * 1_000_000,
        statusKeluarga: pick(["Menikah", "Belum Menikah"]),
        jumlahTanggungan: randInt(0, 3),
        budget: randInt(190, 240) * 1_000_000,
        kemampuanDp: randInt(10, 30) * 1_000_000,
        tipeRumahDiminati: pick(["36/72", "45/90", "60/120"]),
        estimasiCicilan: randInt(1500000, 3000000),
        sourceId: pick(sourceRows).id,
        campaignId: Math.random() > 0.3 ? pick(campaigns).id : null,
        salesId: hasSales ? sales.id : null,
        status,
        priority: pick<LeadPriority>(["LOW", "MEDIUM", "HIGH"]),
        tanggalMasuk: daysFromNow(-randInt(1, 90)),
        lastContact: status === "NEW" ? null : daysFromNow(-randInt(0, 10)),
        nextFollowUp:
          status === "LOST" || status === "AKAD" ? null : daysFromNow(randInt(-3, 5)),
        notes: "Dummy data untuk keperluan demo.",
      },
    });
    leads.push({ lead, status });
  }
  console.log(`Created ${leads.length} leads.`);

  // ---------- Surveys (20 records, for leads that passed the survey stage) ----------
  const eligibleForSurvey = leads.filter((l) =>
    ["SURVEY", "FOLLOW_UP", "BOOKING", "KPR", "AKAD"].includes(l.status)
  );
  const surveyTargets = eligibleForSurvey.slice(0, 20);
  for (const { lead } of surveyTargets) {
    await prisma.survey.create({
      data: {
        leadId: lead.id,
        unitId: pick(units).id,
        scheduledAt: daysFromNow(-randInt(2, 30)),
        completedAt: daysFromNow(-randInt(0, 25)),
        result: pick(["Tertarik, lanjut booking", "Perlu waktu pikir", "Cocok, budget sesuai"]),
      },
    });
  }
  console.log(`Created ${surveyTargets.length} surveys.`);

  // ---------- Follow-ups (some overdue, to populate the Action Center) ----------
  const eligibleForFollowUp = leads.filter((l) =>
    ["FOLLOW_UP", "SURVEY", "QUALIFIED"].includes(l.status)
  );
  for (const { lead } of eligibleForFollowUp) {
    if (!lead.salesId) continue;
    await prisma.followUp.create({
      data: {
        leadId: lead.id,
        userId: lead.salesId,
        scheduledAt: daysFromNow(randInt(-5, 3)), // some in the past -> overdue
        contactMethod: pick(["WHATSAPP", "PHONE_CALL", "MEETING"]),
        notes: "Follow-up dummy data.",
        completedAt: Math.random() > 0.6 ? daysFromNow(-1) : null,
      },
    });
  }
  console.log("Created follow-ups.");

  // ---------- Bookings (15) + KPR (10, 5 of which reach AKAD) ----------
  const bookingGroup = leads.filter((l) => l.status === "BOOKING");
  const kprGroup = leads.filter((l) => l.status === "KPR");
  const akadGroup = leads.filter((l) => l.status === "AKAD");

  let bookingCount = 0;
  for (const { lead } of bookingGroup) {
    const unit = availableUnitsForBooking[bookedUnitPtr++] ?? pick(units);
    if (!lead.salesId) continue;
    await prisma.booking.create({
      data: {
        leadId: lead.id,
        unitId: unit.id,
        salesId: lead.salesId,
        bookingFee: 5_000_000,
        price: unit.price,
        dp: unit.dp,
        paymentStatus: "PARTIAL",
        bookingDate: daysFromNow(-randInt(5, 40)),
        notes: "Booking dummy data.",
      },
    });
    bookingCount++;
  }

  for (const { lead } of kprGroup) {
    const unit = kprUnits[kprUnitPtr++] ?? pick(units);
    if (!lead.salesId) continue;
    const booking = await prisma.booking.create({
      data: {
        leadId: lead.id,
        unitId: unit.id,
        salesId: lead.salesId,
        bookingFee: 5_000_000,
        price: unit.price,
        dp: unit.dp,
        paymentStatus: "PAID",
        bookingDate: daysFromNow(-randInt(30, 60)),
      },
    });
    bookingCount++;
    await prisma.kprApplication.create({
      data: {
        bookingId: booking.id,
        unitId: unit.id,
        salesId: lead.salesId,
        bank: pick(["BTN", "BCA", "Mandiri", "BRI"]),
        financingType: pick<FinancingType>(["SUBSIDIZED_FLPP", "COMMERCIAL"]),
        applicationDate: daysFromNow(-randInt(10, 30)),
        plafond: unit.price - unit.dp,
        tenor: pick([120, 180, 240]),
        status: pick<KprStatus>(["SUBMITTED", "ANALYSIS", "SURVEY_BANK"]),
        mbrEligible: Math.random() > 0.5,
        slaDueAt: daysFromNow(randInt(-10, 5)), // some overdue -> SLA warning
      },
    });
  }

  for (const { lead } of akadGroup) {
    const unit = soldUnits[soldUnitPtr++] ?? pick(units);
    if (!lead.salesId) continue;
    const booking = await prisma.booking.create({
      data: {
        leadId: lead.id,
        unitId: unit.id,
        salesId: lead.salesId,
        bookingFee: 5_000_000,
        price: unit.price,
        dp: unit.dp,
        paymentStatus: "PAID",
        bookingDate: daysFromNow(-randInt(60, 90)),
      },
    });
    bookingCount++;
    await prisma.kprApplication.create({
      data: {
        bookingId: booking.id,
        unitId: unit.id,
        salesId: lead.salesId,
        bank: pick(["BTN", "BCA", "Mandiri", "BRI"]),
        financingType: pick<FinancingType>(["SUBSIDIZED_FLPP", "COMMERCIAL"]),
        applicationDate: daysFromNow(-randInt(40, 80)),
        plafond: unit.price - unit.dp,
        tenor: pick([120, 180, 240]),
        status: "AKAD",
        mbrEligible: Math.random() > 0.5,
      },
    });
  }
  console.log(`Created ${bookingCount} bookings and 10 KPR applications (5 reaching AKAD).`);

  // ---------- Sales targets (current period) ----------
  const now = new Date();
  const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const perSalesTarget = 500_000_000; // 10 sales x 500jt = 5B, matching the doc's example
  for (const sales of salesUsers) {
    await prisma.salesTarget.create({
      data: {
        userId: sales.id,
        projectId: project.id,
        period,
        targetUnit: 5,
        targetBooking: 3,
        targetAkad: 1,
        targetRevenue: perSalesTarget,
      },
    });
  }
  console.log(`Created sales targets for period ${period}.`);

  console.log("\nSeed complete. Demo login (password for all accounts: 'password123'):");
  console.log(`  Super Admin        -> ${superAdmin.email}`);
  console.log(`  Owner / Direksi    -> ${owner.email}`);
  console.log(`  Sales Manager      -> ${salesManager.email}`);
  console.log(`  Admin              -> ${admin.email}`);
  console.log(`  Digital Marketing  -> ${digitalMarketing.email}`);
  console.log(`  Sales (10 akun)    -> sales1@propertymanagement.local ... sales10@propertymanagement.local`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
