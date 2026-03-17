import { PrismaClient } from "@prisma/client";
import {
  Role,
  UserStatus,
  Location,
  AssetCategory,
  AssetStatus,
  AssetCondition,
  AccessLevel,
  AccessStatus,
  TicketCategory,
  TicketPriority,
  TicketStatus,
  AuditAction,
  NotificationType,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ─── HELPERS ──────────────────────────────────────────

function pad(n: number, width: number): string {
  return String(n).padStart(width, "0");
}

function randomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

// ─── SEED DATA ──────────────────────────────────────────

const DEPARTMENTS = [
  "Engineering",
  "Design",
  "Operations",
  "Sales",
  "HR",
  "Finance",
  "QA",
];

const DESIGNATIONS: Record<string, string[]> = {
  Engineering: [
    "Software Engineer",
    "Senior Software Engineer",
    "Staff Engineer",
    "Frontend Developer",
    "Backend Developer",
    "DevOps Engineer",
    "Full Stack Developer",
  ],
  Design: [
    "UI/UX Designer",
    "Senior Designer",
    "Product Designer",
    "Graphic Designer",
  ],
  Operations: [
    "Operations Analyst",
    "Operations Manager",
    "Project Coordinator",
  ],
  Sales: [
    "Sales Executive",
    "Account Manager",
    "Business Development Rep",
    "Sales Lead",
  ],
  HR: ["HR Coordinator", "Recruiter", "HR Business Partner", "Talent Specialist"],
  Finance: [
    "Financial Analyst",
    "Accountant",
    "Senior Accountant",
    "Finance Manager",
  ],
  QA: [
    "QA Engineer",
    "Senior QA Engineer",
    "QA Lead",
    "Automation Tester",
  ],
};

interface UserSeed {
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  department: string;
  designation: string;
  location: Location;
  phone: string;
  status: UserStatus;
}

// ─── USER DEFINITIONS ──────────────────────────────────────────

const superAdmin: UserSeed = {
  firstName: "Hari",
  lastName: "Verman",
  email: "hari.sv@techjays.com",
  role: Role.SUPER_ADMIN,
  department: "Engineering",
  designation: "CTO",
  location: Location.USA,
  phone: "+1-512-555-0100",
  status: UserStatus.ACTIVE,
};

const itAdmins: UserSeed[] = [
  {
    firstName: "Priya",
    lastName: "Sharma",
    email: "priya.sharma@techjays.com",
    role: Role.IT_ADMIN,
    department: "Engineering",
    designation: "IT Administrator",
    location: Location.INDIA,
    phone: "+91-98765-43210",
    status: UserStatus.ACTIVE,
  },
  {
    firstName: "James",
    lastName: "Mitchell",
    email: "james.mitchell@techjays.com",
    role: Role.IT_ADMIN,
    department: "Engineering",
    designation: "Senior IT Administrator",
    location: Location.USA,
    phone: "+1-512-555-0101",
    status: UserStatus.ACTIVE,
  },
  {
    firstName: "Oliver",
    lastName: "Bennett",
    email: "oliver.bennett@techjays.com",
    role: Role.IT_ADMIN,
    department: "Engineering",
    designation: "IT Administrator",
    location: Location.UK,
    phone: "+44-20-7946-0102",
    status: UserStatus.ACTIVE,
  },
  {
    firstName: "Ahmed",
    lastName: "Al-Rashid",
    email: "ahmed.alrashid@techjays.com",
    role: Role.IT_ADMIN,
    department: "Engineering",
    designation: "IT Administrator",
    location: Location.UAE,
    phone: "+971-4-555-0103",
    status: UserStatus.ACTIVE,
  },
];

const managers: UserSeed[] = [
  {
    firstName: "Rajesh",
    lastName: "Krishnan",
    email: "rajesh.krishnan@techjays.com",
    role: Role.MANAGER,
    department: "Engineering",
    designation: "Engineering Manager",
    location: Location.INDIA,
    phone: "+91-98765-43211",
    status: UserStatus.ACTIVE,
  },
  {
    firstName: "Sarah",
    lastName: "Thompson",
    email: "sarah.thompson@techjays.com",
    role: Role.MANAGER,
    department: "Design",
    designation: "Design Lead",
    location: Location.USA,
    phone: "+1-512-555-0201",
    status: UserStatus.ACTIVE,
  },
  {
    firstName: "Fatima",
    lastName: "Hassan",
    email: "fatima.hassan@techjays.com",
    role: Role.MANAGER,
    department: "Operations",
    designation: "Operations Manager",
    location: Location.UAE,
    phone: "+971-4-555-0202",
    status: UserStatus.ACTIVE,
  },
  {
    firstName: "Michael",
    lastName: "Davies",
    email: "michael.davies@techjays.com",
    role: Role.MANAGER,
    department: "Sales",
    designation: "Sales Manager",
    location: Location.UK,
    phone: "+44-20-7946-0203",
    status: UserStatus.ACTIVE,
  },
  {
    firstName: "Ananya",
    lastName: "Patel",
    email: "ananya.patel@techjays.com",
    role: Role.MANAGER,
    department: "HR",
    designation: "HR Manager",
    location: Location.INDIA,
    phone: "+91-98765-43212",
    status: UserStatus.ACTIVE,
  },
  {
    firstName: "David",
    lastName: "Wilson",
    email: "david.wilson@techjays.com",
    role: Role.MANAGER,
    department: "Finance",
    designation: "Finance Manager",
    location: Location.AUSTRALIA,
    phone: "+61-2-5555-0204",
    status: UserStatus.ACTIVE,
  },
  {
    firstName: "Tanvir",
    lastName: "Rahman",
    email: "tanvir.rahman@techjays.com",
    role: Role.MANAGER,
    department: "QA",
    designation: "QA Manager",
    location: Location.BANGLADESH,
    phone: "+880-1711-555205",
    status: UserStatus.ACTIVE,
  },
  {
    firstName: "Emily",
    lastName: "Rodriguez",
    email: "emily.rodriguez@techjays.com",
    role: Role.MANAGER,
    department: "Engineering",
    designation: "Engineering Manager",
    location: Location.USA,
    phone: "+1-512-555-0206",
    status: UserStatus.ACTIVE,
  },
  {
    firstName: "Vikram",
    lastName: "Singh",
    email: "vikram.singh@techjays.com",
    role: Role.MANAGER,
    department: "Engineering",
    designation: "Engineering Manager",
    location: Location.INDIA,
    phone: "+91-98765-43213",
    status: UserStatus.ACTIVE,
  },
  {
    firstName: "Charlotte",
    lastName: "Brown",
    email: "charlotte.brown@techjays.com",
    role: Role.MANAGER,
    department: "Operations",
    designation: "Operations Director",
    location: Location.CANADA,
    phone: "+1-416-555-0207",
    status: UserStatus.ACTIVE,
  },
];

const employees: UserSeed[] = [
  // ── INDIA (20) ──
  { firstName: "Arjun", lastName: "Nair", email: "arjun.nair@techjays.com", role: Role.EMPLOYEE, department: "Engineering", designation: "Software Engineer", location: Location.INDIA, phone: "+91-98765-43301", status: UserStatus.ACTIVE },
  { firstName: "Deepika", lastName: "Menon", email: "deepika.menon@techjays.com", role: Role.EMPLOYEE, department: "Engineering", designation: "Senior Software Engineer", location: Location.INDIA, phone: "+91-98765-43302", status: UserStatus.ACTIVE },
  { firstName: "Karthik", lastName: "Rajan", email: "karthik.rajan@techjays.com", role: Role.EMPLOYEE, department: "Engineering", designation: "Full Stack Developer", location: Location.INDIA, phone: "+91-98765-43303", status: UserStatus.ACTIVE },
  { firstName: "Sneha", lastName: "Gupta", email: "sneha.gupta@techjays.com", role: Role.EMPLOYEE, department: "Design", designation: "UI/UX Designer", location: Location.INDIA, phone: "+91-98765-43304", status: UserStatus.ACTIVE },
  { firstName: "Rohit", lastName: "Verma", email: "rohit.verma@techjays.com", role: Role.EMPLOYEE, department: "Engineering", designation: "Backend Developer", location: Location.INDIA, phone: "+91-98765-43305", status: UserStatus.ACTIVE },
  { firstName: "Meera", lastName: "Iyer", email: "meera.iyer@techjays.com", role: Role.EMPLOYEE, department: "QA", designation: "QA Engineer", location: Location.INDIA, phone: "+91-98765-43306", status: UserStatus.ACTIVE },
  { firstName: "Aditya", lastName: "Chakraborty", email: "aditya.chakraborty@techjays.com", role: Role.EMPLOYEE, department: "Engineering", designation: "DevOps Engineer", location: Location.INDIA, phone: "+91-98765-43307", status: UserStatus.ACTIVE },
  { firstName: "Kavitha", lastName: "Sundaram", email: "kavitha.sundaram@techjays.com", role: Role.EMPLOYEE, department: "HR", designation: "Recruiter", location: Location.INDIA, phone: "+91-98765-43308", status: UserStatus.ACTIVE },
  { firstName: "Suresh", lastName: "Pillai", email: "suresh.pillai@techjays.com", role: Role.EMPLOYEE, department: "Finance", designation: "Accountant", location: Location.INDIA, phone: "+91-98765-43309", status: UserStatus.ACTIVE },
  { firstName: "Lakshmi", lastName: "Reddy", email: "lakshmi.reddy@techjays.com", role: Role.EMPLOYEE, department: "Operations", designation: "Project Coordinator", location: Location.INDIA, phone: "+91-98765-43310", status: UserStatus.ACTIVE },
  { firstName: "Nitin", lastName: "Deshmukh", email: "nitin.deshmukh@techjays.com", role: Role.EMPLOYEE, department: "Engineering", designation: "Frontend Developer", location: Location.INDIA, phone: "+91-98765-43311", status: UserStatus.ACTIVE },
  { firstName: "Pooja", lastName: "Bhatt", email: "pooja.bhatt@techjays.com", role: Role.EMPLOYEE, department: "Design", designation: "Product Designer", location: Location.INDIA, phone: "+91-98765-43312", status: UserStatus.ACTIVE },
  { firstName: "Sanjay", lastName: "Mishra", email: "sanjay.mishra@techjays.com", role: Role.EMPLOYEE, department: "Sales", designation: "Sales Executive", location: Location.INDIA, phone: "+91-98765-43313", status: UserStatus.ACTIVE },
  { firstName: "Divya", lastName: "Joshi", email: "divya.joshi@techjays.com", role: Role.EMPLOYEE, department: "QA", designation: "Automation Tester", location: Location.INDIA, phone: "+91-98765-43314", status: UserStatus.ACTIVE },
  { firstName: "Manoj", lastName: "Kumar", email: "manoj.kumar@techjays.com", role: Role.EMPLOYEE, department: "Engineering", designation: "Staff Engineer", location: Location.INDIA, phone: "+91-98765-43315", status: UserStatus.ACTIVE },
  { firstName: "Shreya", lastName: "Saxena", email: "shreya.saxena@techjays.com", role: Role.EMPLOYEE, department: "HR", designation: "Talent Specialist", location: Location.INDIA, phone: "+91-98765-43316", status: UserStatus.ACTIVE },
  { firstName: "Pranav", lastName: "Tiwari", email: "pranav.tiwari@techjays.com", role: Role.EMPLOYEE, department: "Engineering", designation: "Senior Software Engineer", location: Location.INDIA, phone: "+91-98765-43317", status: UserStatus.ACTIVE },
  { firstName: "Nandini", lastName: "Rao", email: "nandini.rao@techjays.com", role: Role.EMPLOYEE, department: "Finance", designation: "Financial Analyst", location: Location.INDIA, phone: "+91-98765-43318", status: UserStatus.ACTIVE },
  { firstName: "Venkat", lastName: "Subramanian", email: "venkat.subramanian@techjays.com", role: Role.EMPLOYEE, department: "Engineering", designation: "Backend Developer", location: Location.INDIA, phone: "+91-98765-43319", status: UserStatus.ACTIVE },
  { firstName: "Ritu", lastName: "Agarwal", email: "ritu.agarwal@techjays.com", role: Role.EMPLOYEE, department: "Operations", designation: "Operations Analyst", location: Location.INDIA, phone: "+91-98765-43320", status: UserStatus.ACTIVE },

  // ── USA (15) ──
  { firstName: "Jason", lastName: "Carter", email: "jason.carter@techjays.com", role: Role.EMPLOYEE, department: "Engineering", designation: "Senior Software Engineer", location: Location.USA, phone: "+1-512-555-0301", status: UserStatus.ACTIVE },
  { firstName: "Amanda", lastName: "Lee", email: "amanda.lee@techjays.com", role: Role.EMPLOYEE, department: "Design", designation: "Senior Designer", location: Location.USA, phone: "+1-512-555-0302", status: UserStatus.ACTIVE },
  { firstName: "Brandon", lastName: "Martinez", email: "brandon.martinez@techjays.com", role: Role.EMPLOYEE, department: "Engineering", designation: "Full Stack Developer", location: Location.USA, phone: "+1-512-555-0303", status: UserStatus.ACTIVE },
  { firstName: "Stephanie", lastName: "Kim", email: "stephanie.kim@techjays.com", role: Role.EMPLOYEE, department: "Sales", designation: "Account Manager", location: Location.USA, phone: "+1-512-555-0304", status: UserStatus.ACTIVE },
  { firstName: "Tyler", lastName: "Johnson", email: "tyler.johnson@techjays.com", role: Role.EMPLOYEE, department: "Engineering", designation: "DevOps Engineer", location: Location.USA, phone: "+1-512-555-0305", status: UserStatus.ACTIVE },
  { firstName: "Rachel", lastName: "Green", email: "rachel.green@techjays.com", role: Role.EMPLOYEE, department: "HR", designation: "HR Coordinator", location: Location.USA, phone: "+1-512-555-0306", status: UserStatus.ACTIVE },
  { firstName: "Nathan", lastName: "Brooks", email: "nathan.brooks@techjays.com", role: Role.EMPLOYEE, department: "Finance", designation: "Senior Accountant", location: Location.USA, phone: "+1-512-555-0307", status: UserStatus.ACTIVE },
  { firstName: "Jessica", lastName: "Taylor", email: "jessica.taylor@techjays.com", role: Role.EMPLOYEE, department: "QA", designation: "Senior QA Engineer", location: Location.USA, phone: "+1-512-555-0308", status: UserStatus.ACTIVE },
  { firstName: "Kevin", lastName: "Anderson", email: "kevin.anderson@techjays.com", role: Role.EMPLOYEE, department: "Engineering", designation: "Software Engineer", location: Location.USA, phone: "+1-512-555-0309", status: UserStatus.ACTIVE },
  { firstName: "Lauren", lastName: "White", email: "lauren.white@techjays.com", role: Role.EMPLOYEE, department: "Operations", designation: "Project Coordinator", location: Location.USA, phone: "+1-512-555-0310", status: UserStatus.ACTIVE },
  { firstName: "Daniel", lastName: "Harris", email: "daniel.harris@techjays.com", role: Role.EMPLOYEE, department: "Engineering", designation: "Frontend Developer", location: Location.USA, phone: "+1-512-555-0311", status: UserStatus.ACTIVE },
  { firstName: "Megan", lastName: "Clark", email: "megan.clark@techjays.com", role: Role.EMPLOYEE, department: "Design", designation: "Graphic Designer", location: Location.USA, phone: "+1-512-555-0312", status: UserStatus.ACTIVE },
  { firstName: "Christopher", lastName: "Lewis", email: "christopher.lewis@techjays.com", role: Role.EMPLOYEE, department: "Sales", designation: "Business Development Rep", location: Location.USA, phone: "+1-512-555-0313", status: UserStatus.ACTIVE },
  { firstName: "Ashley", lastName: "Walker", email: "ashley.walker@techjays.com", role: Role.EMPLOYEE, department: "Engineering", designation: "Backend Developer", location: Location.USA, phone: "+1-512-555-0314", status: UserStatus.ACTIVE },
  { firstName: "Ryan", lastName: "Hall", email: "ryan.hall@techjays.com", role: Role.EMPLOYEE, department: "QA", designation: "QA Engineer", location: Location.USA, phone: "+1-512-555-0315", status: UserStatus.ACTIVE },

  // ── UK (13) ──
  { firstName: "George", lastName: "Whitfield", email: "george.whitfield@techjays.com", role: Role.EMPLOYEE, department: "Engineering", designation: "Software Engineer", location: Location.UK, phone: "+44-20-7946-0301", status: UserStatus.ACTIVE },
  { firstName: "Sophie", lastName: "Harrington", email: "sophie.harrington@techjays.com", role: Role.EMPLOYEE, department: "Design", designation: "UI/UX Designer", location: Location.UK, phone: "+44-20-7946-0302", status: UserStatus.ACTIVE },
  { firstName: "William", lastName: "Crawford", email: "william.crawford@techjays.com", role: Role.EMPLOYEE, department: "Engineering", designation: "Senior Software Engineer", location: Location.UK, phone: "+44-20-7946-0303", status: UserStatus.ACTIVE },
  { firstName: "Emma", lastName: "Fitzgerald", email: "emma.fitzgerald@techjays.com", role: Role.EMPLOYEE, department: "Operations", designation: "Operations Analyst", location: Location.UK, phone: "+44-20-7946-0304", status: UserStatus.ACTIVE },
  { firstName: "Thomas", lastName: "Blackwood", email: "thomas.blackwood@techjays.com", role: Role.EMPLOYEE, department: "Sales", designation: "Sales Lead", location: Location.UK, phone: "+44-20-7946-0305", status: UserStatus.ACTIVE },
  { firstName: "Lucy", lastName: "Pemberton", email: "lucy.pemberton@techjays.com", role: Role.EMPLOYEE, department: "HR", designation: "HR Business Partner", location: Location.UK, phone: "+44-20-7946-0306", status: UserStatus.ACTIVE },
  { firstName: "Henry", lastName: "Spencer", email: "henry.spencer@techjays.com", role: Role.EMPLOYEE, department: "Finance", designation: "Financial Analyst", location: Location.UK, phone: "+44-20-7946-0307", status: UserStatus.ACTIVE },
  { firstName: "Isabella", lastName: "Ashton", email: "isabella.ashton@techjays.com", role: Role.EMPLOYEE, department: "QA", designation: "QA Engineer", location: Location.UK, phone: "+44-20-7946-0308", status: UserStatus.ACTIVE },
  { firstName: "Jack", lastName: "Thornton", email: "jack.thornton@techjays.com", role: Role.EMPLOYEE, department: "Engineering", designation: "Full Stack Developer", location: Location.UK, phone: "+44-20-7946-0309", status: UserStatus.ACTIVE },
  { firstName: "Amelia", lastName: "Chambers", email: "amelia.chambers@techjays.com", role: Role.EMPLOYEE, department: "Design", designation: "Product Designer", location: Location.UK, phone: "+44-20-7946-0310", status: UserStatus.ACTIVE },
  { firstName: "Oscar", lastName: "Kingsley", email: "oscar.kingsley@techjays.com", role: Role.EMPLOYEE, department: "Engineering", designation: "DevOps Engineer", location: Location.UK, phone: "+44-20-7946-0311", status: UserStatus.ACTIVE },
  { firstName: "Chloe", lastName: "Fairfax", email: "chloe.fairfax@techjays.com", role: Role.EMPLOYEE, department: "Sales", designation: "Account Manager", location: Location.UK, phone: "+44-20-7946-0312", status: UserStatus.ACTIVE },
  { firstName: "Edward", lastName: "Langley", email: "edward.langley@techjays.com", role: Role.EMPLOYEE, department: "Engineering", designation: "Backend Developer", location: Location.UK, phone: "+44-20-7946-0313", status: UserStatus.ACTIVE },

  // ── UAE (12) ──
  { firstName: "Omar", lastName: "Al-Mansoori", email: "omar.almansoori@techjays.com", role: Role.EMPLOYEE, department: "Engineering", designation: "Software Engineer", location: Location.UAE, phone: "+971-4-555-0301", status: UserStatus.ACTIVE },
  { firstName: "Layla", lastName: "Khalil", email: "layla.khalil@techjays.com", role: Role.EMPLOYEE, department: "Design", designation: "UI/UX Designer", location: Location.UAE, phone: "+971-4-555-0302", status: UserStatus.ACTIVE },
  { firstName: "Khalid", lastName: "Bin Saeed", email: "khalid.binsaeed@techjays.com", role: Role.EMPLOYEE, department: "Operations", designation: "Operations Analyst", location: Location.UAE, phone: "+971-4-555-0303", status: UserStatus.ACTIVE },
  { firstName: "Mariam", lastName: "Al-Hashimi", email: "mariam.alhashimi@techjays.com", role: Role.EMPLOYEE, department: "Sales", designation: "Sales Executive", location: Location.UAE, phone: "+971-4-555-0304", status: UserStatus.ACTIVE },
  { firstName: "Youssef", lastName: "Nasser", email: "youssef.nasser@techjays.com", role: Role.EMPLOYEE, department: "Engineering", designation: "Senior Software Engineer", location: Location.UAE, phone: "+971-4-555-0305", status: UserStatus.ACTIVE },
  { firstName: "Aisha", lastName: "Farooq", email: "aisha.farooq@techjays.com", role: Role.EMPLOYEE, department: "HR", designation: "HR Coordinator", location: Location.UAE, phone: "+971-4-555-0306", status: UserStatus.ACTIVE },
  { firstName: "Hassan", lastName: "Mirza", email: "hassan.mirza@techjays.com", role: Role.EMPLOYEE, department: "Finance", designation: "Accountant", location: Location.UAE, phone: "+971-4-555-0307", status: UserStatus.ACTIVE },
  { firstName: "Noura", lastName: "Al-Thani", email: "noura.althani@techjays.com", role: Role.EMPLOYEE, department: "QA", designation: "Senior QA Engineer", location: Location.UAE, phone: "+971-4-555-0308", status: UserStatus.ACTIVE },
  { firstName: "Tariq", lastName: "Siddiqui", email: "tariq.siddiqui@techjays.com", role: Role.EMPLOYEE, department: "Engineering", designation: "Frontend Developer", location: Location.UAE, phone: "+971-4-555-0309", status: UserStatus.ACTIVE },
  { firstName: "Huda", lastName: "Mahmoud", email: "huda.mahmoud@techjays.com", role: Role.EMPLOYEE, department: "Operations", designation: "Project Coordinator", location: Location.UAE, phone: "+971-4-555-0310", status: UserStatus.ACTIVE },
  { firstName: "Samir", lastName: "El-Amin", email: "samir.elamin@techjays.com", role: Role.EMPLOYEE, department: "Engineering", designation: "Full Stack Developer", location: Location.UAE, phone: "+971-4-555-0311", status: UserStatus.ACTIVE },
  { firstName: "Reem", lastName: "Bakr", email: "reem.bakr@techjays.com", role: Role.EMPLOYEE, department: "Design", designation: "Graphic Designer", location: Location.UAE, phone: "+971-4-555-0312", status: UserStatus.ACTIVE },

  // ── AUSTRALIA (10) ──
  { firstName: "Liam", lastName: "O'Sullivan", email: "liam.osullivan@techjays.com", role: Role.EMPLOYEE, department: "Engineering", designation: "Software Engineer", location: Location.AUSTRALIA, phone: "+61-2-5555-0301", status: UserStatus.ACTIVE },
  { firstName: "Ella", lastName: "MacGregor", email: "ella.macgregor@techjays.com", role: Role.EMPLOYEE, department: "Design", designation: "Senior Designer", location: Location.AUSTRALIA, phone: "+61-2-5555-0302", status: UserStatus.ACTIVE },
  { firstName: "Noah", lastName: "Callahan", email: "noah.callahan@techjays.com", role: Role.EMPLOYEE, department: "Engineering", designation: "DevOps Engineer", location: Location.AUSTRALIA, phone: "+61-2-5555-0303", status: UserStatus.ACTIVE },
  { firstName: "Olivia", lastName: "Patterson", email: "olivia.patterson@techjays.com", role: Role.EMPLOYEE, department: "Sales", designation: "Account Manager", location: Location.AUSTRALIA, phone: "+61-2-5555-0304", status: UserStatus.ACTIVE },
  { firstName: "Ethan", lastName: "Morrison", email: "ethan.morrison@techjays.com", role: Role.EMPLOYEE, department: "QA", designation: "QA Lead", location: Location.AUSTRALIA, phone: "+61-2-5555-0305", status: UserStatus.ACTIVE },
  { firstName: "Grace", lastName: "Fletcher", email: "grace.fletcher@techjays.com", role: Role.EMPLOYEE, department: "HR", designation: "Recruiter", location: Location.AUSTRALIA, phone: "+61-2-5555-0306", status: UserStatus.ACTIVE },
  { firstName: "Harrison", lastName: "Webb", email: "harrison.webb@techjays.com", role: Role.EMPLOYEE, department: "Finance", designation: "Financial Analyst", location: Location.AUSTRALIA, phone: "+61-2-5555-0307", status: UserStatus.ACTIVE },
  { firstName: "Mia", lastName: "Donovan", email: "mia.donovan@techjays.com", role: Role.EMPLOYEE, department: "Operations", designation: "Operations Analyst", location: Location.AUSTRALIA, phone: "+61-2-5555-0308", status: UserStatus.ACTIVE },
  { firstName: "Cooper", lastName: "Hughes", email: "cooper.hughes@techjays.com", role: Role.EMPLOYEE, department: "Engineering", designation: "Senior Software Engineer", location: Location.AUSTRALIA, phone: "+61-2-5555-0309", status: UserStatus.ACTIVE },
  { firstName: "Ruby", lastName: "Fitzgerald", email: "ruby.fitzgerald@techjays.com", role: Role.EMPLOYEE, department: "Engineering", designation: "Frontend Developer", location: Location.AUSTRALIA, phone: "+61-2-5555-0310", status: UserStatus.ACTIVE },

  // ── CANADA (8) ──
  { firstName: "Alexandre", lastName: "Tremblay", email: "alexandre.tremblay@techjays.com", role: Role.EMPLOYEE, department: "Engineering", designation: "Software Engineer", location: Location.CANADA, phone: "+1-416-555-0301", status: UserStatus.ACTIVE },
  { firstName: "Sophie", lastName: "Gagnon", email: "sophie.gagnon@techjays.com", role: Role.EMPLOYEE, department: "Design", designation: "Product Designer", location: Location.CANADA, phone: "+1-416-555-0302", status: UserStatus.ACTIVE },
  { firstName: "Matthew", lastName: "Campbell", email: "matthew.campbell@techjays.com", role: Role.EMPLOYEE, department: "Engineering", designation: "Full Stack Developer", location: Location.CANADA, phone: "+1-416-555-0303", status: UserStatus.ACTIVE },
  { firstName: "Claire", lastName: "Bouchard", email: "claire.bouchard@techjays.com", role: Role.EMPLOYEE, department: "HR", designation: "Talent Specialist", location: Location.CANADA, phone: "+1-416-555-0304", status: UserStatus.ACTIVE },
  { firstName: "Etienne", lastName: "Lavoie", email: "etienne.lavoie@techjays.com", role: Role.EMPLOYEE, department: "Sales", designation: "Business Development Rep", location: Location.CANADA, phone: "+1-416-555-0305", status: UserStatus.ACTIVE },
  { firstName: "Natasha", lastName: "Singh", email: "natasha.singh@techjays.com", role: Role.EMPLOYEE, department: "QA", designation: "Automation Tester", location: Location.CANADA, phone: "+1-416-555-0306", status: UserStatus.ACTIVE },
  { firstName: "Marcus", lastName: "Chen", email: "marcus.chen@techjays.com", role: Role.EMPLOYEE, department: "Finance", designation: "Accountant", location: Location.CANADA, phone: "+1-416-555-0307", status: UserStatus.ACTIVE },
  { firstName: "Isabelle", lastName: "Roy", email: "isabelle.roy@techjays.com", role: Role.EMPLOYEE, department: "Operations", designation: "Project Coordinator", location: Location.CANADA, phone: "+1-416-555-0308", status: UserStatus.ACTIVE },

  // ── BANGLADESH (7) ──
  { firstName: "Rafiq", lastName: "Uddin", email: "rafiq.uddin@techjays.com", role: Role.EMPLOYEE, department: "Engineering", designation: "Software Engineer", location: Location.BANGLADESH, phone: "+880-1711-555301", status: UserStatus.ACTIVE },
  { firstName: "Nasreen", lastName: "Akter", email: "nasreen.akter@techjays.com", role: Role.EMPLOYEE, department: "QA", designation: "QA Engineer", location: Location.BANGLADESH, phone: "+880-1711-555302", status: UserStatus.ACTIVE },
  { firstName: "Imran", lastName: "Hossain", email: "imran.hossain@techjays.com", role: Role.EMPLOYEE, department: "Engineering", designation: "Senior Software Engineer", location: Location.BANGLADESH, phone: "+880-1711-555303", status: UserStatus.ACTIVE },
  { firstName: "Taslima", lastName: "Begum", email: "taslima.begum@techjays.com", role: Role.EMPLOYEE, department: "Design", designation: "UI/UX Designer", location: Location.BANGLADESH, phone: "+880-1711-555304", status: UserStatus.ACTIVE },
  { firstName: "Shahid", lastName: "Islam", email: "shahid.islam@techjays.com", role: Role.EMPLOYEE, department: "Engineering", designation: "Backend Developer", location: Location.BANGLADESH, phone: "+880-1711-555305", status: UserStatus.ACTIVE },
  { firstName: "Farhana", lastName: "Chowdhury", email: "farhana.chowdhury@techjays.com", role: Role.EMPLOYEE, department: "Operations", designation: "Operations Analyst", location: Location.BANGLADESH, phone: "+880-1711-555306", status: UserStatus.ACTIVE },
  { firstName: "Kamal", lastName: "Miah", email: "kamal.miah@techjays.com", role: Role.EMPLOYEE, department: "Sales", designation: "Sales Executive", location: Location.BANGLADESH, phone: "+880-1711-555307", status: UserStatus.ACTIVE },
];

// ─── MAIN SEED ──────────────────────────────────────────

async function main() {
  console.log("Seeding JAYS DECK database...\n");

  // Hash password once
  const passwordHash = await bcrypt.hash("JaysDeck2024!", 12);

  // ── 1. DELETE ALL (order matters for FK constraints) ──
  console.log("Cleaning existing data...");
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.ticketAttachment.deleteMany();
  await prisma.ticketComment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.accessRequest.deleteMany();
  await prisma.accessRecord.deleteMany();
  await prisma.assetAssignment.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.knowledgeArticle.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.user.deleteMany();
  console.log("  Done.\n");

  // ── 2. CREATE USERS ──
  console.log("Creating users...");
  const allUserSeeds: UserSeed[] = [superAdmin, ...itAdmins, ...managers, ...employees];

  // Map to track department -> manager ID for subordinate assignment
  const departmentManagerMap: Record<string, string> = {};
  const createdUserIds: string[] = [];
  const createdUsers: Array<{ id: string; email: string; role: Role; department: string | null; location: Location }> = [];

  let empCounter = 1;
  for (const u of allUserSeeds) {
    const user = await prisma.user.create({
      data: {
        email: u.email,
        passwordHash,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        department: u.department,
        designation: u.designation,
        employeeId: `TJ-EMP-${pad(empCounter, 4)}`,
        phone: u.phone,
        location: u.location,
        status: u.status,
        dateOfJoining: randomDate(new Date("2020-01-01"), new Date("2025-06-01")),
      },
    });
    createdUserIds.push(user.id);
    createdUsers.push({ id: user.id, email: user.email, role: user.role, department: user.department, location: user.location });

    // Track first manager per department
    if (u.role === Role.MANAGER && u.department && !departmentManagerMap[u.department]) {
      departmentManagerMap[u.department] = user.id;
    }

    empCounter++;
  }

  // Assign managers to employees
  for (const cu of createdUsers) {
    if (cu.role === Role.EMPLOYEE && cu.department) {
      const managerId = departmentManagerMap[cu.department];
      if (managerId) {
        await prisma.user.update({
          where: { id: cu.id },
          data: { managerId },
        });
      }
    }
  }

  console.log(`  Created ${createdUsers.length} users.\n`);

  // Helpful lookups
  const superAdminUser = createdUsers.find((u) => u.email === "hari.sv@techjays.com")!;
  const itAdminUsers = createdUsers.filter((u) => u.role === Role.IT_ADMIN);
  const employeeUsers = createdUsers.filter((u) => u.role === Role.EMPLOYEE);
  const allNonSuperUsers = createdUsers.filter((u) => u.role !== Role.SUPER_ADMIN);

  // ── 3. CREATE ASSETS ──
  console.log("Creating assets...");

  interface AssetDef {
    name: string;
    category: AssetCategory;
    brand: string;
    model: string;
    priceMin: number;
    priceMax: number;
    vendor: string;
  }

  const laptopDefs: AssetDef[] = [
    { name: "MacBook Pro 14 M3", category: AssetCategory.LAPTOP, brand: "Apple", model: "MacBook Pro 14\" M3", priceMin: 1999, priceMax: 2499, vendor: "Apple Store" },
    { name: "MacBook Pro 16 M3", category: AssetCategory.LAPTOP, brand: "Apple", model: "MacBook Pro 16\" M3", priceMin: 2499, priceMax: 3499, vendor: "Apple Store" },
    { name: "ThinkPad X1 Carbon Gen 11", category: AssetCategory.LAPTOP, brand: "Lenovo", model: "ThinkPad X1 Carbon Gen 11", priceMin: 1449, priceMax: 2199, vendor: "Lenovo Direct" },
    { name: "Dell XPS 15", category: AssetCategory.LAPTOP, brand: "Dell", model: "XPS 15 9530", priceMin: 1299, priceMax: 1999, vendor: "Dell Technologies" },
  ];

  const monitorDefs: AssetDef[] = [
    { name: 'Dell U2723QE 27"', category: AssetCategory.MONITOR, brand: "Dell", model: "U2723QE", priceMin: 519, priceMax: 619, vendor: "Dell Technologies" },
    { name: "LG 27UK850-W", category: AssetCategory.MONITOR, brand: "LG", model: "27UK850-W", priceMin: 449, priceMax: 549, vendor: "LG Electronics" },
  ];

  const keyboardDefs: AssetDef[] = [
    { name: "Apple Magic Keyboard", category: AssetCategory.KEYBOARD, brand: "Apple", model: "Magic Keyboard with Touch ID", priceMin: 199, priceMax: 299, vendor: "Apple Store" },
    { name: "Logitech MX Keys", category: AssetCategory.KEYBOARD, brand: "Logitech", model: "MX Keys S", priceMin: 109, priceMax: 129, vendor: "Logitech" },
  ];

  const mouseDefs: AssetDef[] = [
    { name: "Logitech MX Master 3S", category: AssetCategory.MOUSE, brand: "Logitech", model: "MX Master 3S", priceMin: 99, priceMax: 99, vendor: "Logitech" },
    { name: "Apple Magic Mouse", category: AssetCategory.MOUSE, brand: "Apple", model: "Magic Mouse", priceMin: 79, priceMax: 99, vendor: "Apple Store" },
  ];

  const headsetDefs: AssetDef[] = [
    { name: "Sony WH-1000XM5", category: AssetCategory.HEADSET, brand: "Sony", model: "WH-1000XM5", priceMin: 348, priceMax: 398, vendor: "Sony Store" },
    { name: "Apple AirPods Max", category: AssetCategory.HEADSET, brand: "Apple", model: "AirPods Max", priceMin: 549, priceMax: 549, vendor: "Apple Store" },
  ];

  const printerDefs: AssetDef[] = [
    { name: "HP LaserJet Pro M404", category: AssetCategory.PRINTER, brand: "HP", model: "LaserJet Pro M404dn", priceMin: 279, priceMax: 349, vendor: "HP Store" },
  ];

  const softwareDefs: AssetDef[] = [
    { name: "Adobe Creative Cloud", category: AssetCategory.SOFTWARE_LICENSE, brand: "Adobe", model: "Creative Cloud All Apps", priceMin: 659, priceMax: 659, vendor: "Adobe" },
    { name: "JetBrains All Products", category: AssetCategory.SOFTWARE_LICENSE, brand: "JetBrains", model: "All Products Pack", priceMin: 649, priceMax: 649, vendor: "JetBrains" },
    { name: "Figma Enterprise", category: AssetCategory.SOFTWARE_LICENSE, brand: "Figma", model: "Enterprise Plan", priceMin: 900, priceMax: 900, vendor: "Figma" },
    { name: "Slack Business+", category: AssetCategory.SOFTWARE_LICENSE, brand: "Salesforce", model: "Slack Business+", priceMin: 150, priceMax: 150, vendor: "Slack" },
    { name: "Zoom Enterprise", category: AssetCategory.SOFTWARE_LICENSE, brand: "Zoom", model: "Enterprise Plan", priceMin: 250, priceMax: 250, vendor: "Zoom" },
  ];

  // Build asset list: 60 laptops, 20 monitors, 15 keyboards, 10 mice, 5 headsets, 5 printers, 5 software
  const assetEntries: Array<{
    def: AssetDef;
    status: AssetStatus;
    condition: AssetCondition;
  }> = [];

  function addAssets(defs: AssetDef[], count: number) {
    for (let i = 0; i < count; i++) {
      assetEntries.push({
        def: defs[i % defs.length]!,
        status: AssetStatus.AVAILABLE, // will reassign below
        condition: AssetCondition.GOOD,
      });
    }
  }

  addAssets(laptopDefs, 60);
  addAssets(monitorDefs, 20);
  addAssets(keyboardDefs, 15);
  addAssets(mouseDefs, 10);
  addAssets(headsetDefs, 5);
  addAssets(printerDefs, 5);
  addAssets(softwareDefs, 5);

  // Assign statuses: 80 ASSIGNED, 20 AVAILABLE, 10 IN_MAINTENANCE, 10 RETIRED
  for (let i = 0; i < 80; i++) assetEntries[i]!.status = AssetStatus.ASSIGNED;
  for (let i = 80; i < 100; i++) assetEntries[i]!.status = AssetStatus.AVAILABLE;
  for (let i = 100; i < 110; i++) {
    assetEntries[i]!.status = AssetStatus.IN_MAINTENANCE;
    assetEntries[i]!.condition = AssetCondition.FAIR;
  }
  for (let i = 110; i < 120; i++) {
    assetEntries[i]!.status = AssetStatus.RETIRED;
    assetEntries[i]!.condition = AssetCondition.POOR;
  }

  const createdAssets: Array<{ id: string; status: AssetStatus }> = [];

  for (let i = 0; i < assetEntries.length; i++) {
    const entry = assetEntries[i]!;
    const serialPrefix = entry.def.brand.substring(0, 3).toUpperCase();
    const price = entry.def.priceMin + Math.random() * (entry.def.priceMax - entry.def.priceMin);

    // Assign to an employee if status is ASSIGNED
    const assigneeId = entry.status === AssetStatus.ASSIGNED ? employeeUsers[i % employeeUsers.length]!.id : undefined;

    const asset = await prisma.asset.create({
      data: {
        assetTag: `TJ-AST-${pad(i + 1, 4)}`,
        name: entry.def.name,
        category: entry.def.category,
        brand: entry.def.brand,
        model: entry.def.model,
        serialNumber: `${serialPrefix}-${pad(2024000 + i, 7)}`,
        status: entry.status,
        condition: entry.condition,
        purchaseDate: randomDate(new Date("2023-01-01"), new Date("2025-06-01")),
        purchasePrice: Math.round(price * 100) / 100,
        vendor: entry.def.vendor,
        warrantyExpiry: randomDate(new Date("2026-01-01"), new Date("2028-12-31")),
        currentAssigneeId: assigneeId ?? null,
      },
    });
    createdAssets.push({ id: asset.id, status: entry.status });
  }

  console.log(`  Created ${createdAssets.length} assets.\n`);

  // ── 4. ASSET ASSIGNMENTS ──
  console.log("Creating asset assignments...");
  const assignedAssets = createdAssets.filter((a) => a.status === AssetStatus.ASSIGNED);
  const assignerPool = [superAdminUser, ...itAdminUsers];

  for (let i = 0; i < assignedAssets.length; i++) {
    const asset = assignedAssets[i]!;
    const assignee = employeeUsers[i % employeeUsers.length]!;
    const assigner = assignerPool[i % assignerPool.length]!;

    await prisma.assetAssignment.create({
      data: {
        assetId: asset.id,
        userId: assignee.id,
        assignedById: assigner.id,
        assignedAt: randomDate(new Date("2024-01-01"), new Date("2025-06-01")),
        conditionAtAssign: AssetCondition.GOOD,
        notes: "Initial asset assignment",
      },
    });
  }

  console.log(`  Created ${assignedAssets.length} asset assignments.\n`);

  // ── 5. TICKETS ──
  console.log("Creating tickets...");

  const ticketData: Array<{
    title: string;
    description: string;
    category: TicketCategory;
    priority: TicketPriority;
    status: TicketStatus;
  }> = [
    // 10 OPEN
    { title: "Laptop screen flickering", description: "My MacBook Pro screen has been flickering intermittently since this morning. Happens every 10-15 minutes.", category: TicketCategory.HARDWARE, priority: TicketPriority.HIGH, status: TicketStatus.OPEN },
    { title: "Need VPN access for client project", description: "I need VPN access to connect to the client's staging environment for the Acme Corp project.", category: TicketCategory.ACCESS_REQUEST, priority: TicketPriority.MEDIUM, status: TicketStatus.OPEN },
    { title: "Outlook not syncing emails", description: "My Outlook desktop app stopped syncing emails since yesterday. Web version works fine.", category: TicketCategory.SOFTWARE, priority: TicketPriority.MEDIUM, status: TicketStatus.OPEN },
    { title: "Printer on 3rd floor not responding", description: "The HP LaserJet on the 3rd floor shows offline status. Multiple team members affected.", category: TicketCategory.HARDWARE, priority: TicketPriority.LOW, status: TicketStatus.OPEN },
    { title: "Request for second monitor", description: "I would like to request an additional monitor for improved productivity. Currently using a single 14\" laptop display.", category: TicketCategory.HARDWARE, priority: TicketPriority.LOW, status: TicketStatus.OPEN },
    { title: "Unable to access Jira after password reset", description: "After resetting my corporate password, I can no longer log into Jira. Getting 'invalid credentials' error.", category: TicketCategory.ACCESS_REQUEST, priority: TicketPriority.HIGH, status: TicketStatus.OPEN },
    { title: "Slack notifications not working on mobile", description: "Push notifications for Slack stopped working on my iPhone after the latest iOS update.", category: TicketCategory.SOFTWARE, priority: TicketPriority.LOW, status: TicketStatus.OPEN },
    { title: "Wi-Fi dropping in conference room B", description: "The Wi-Fi connection keeps dropping during video calls in conference room B. This has been happening for a week.", category: TicketCategory.NETWORK, priority: TicketPriority.HIGH, status: TicketStatus.OPEN },
    { title: "New laptop setup for incoming hire", description: "We have a new engineer joining on March 25th. Need a MacBook Pro 16 M3 configured with standard dev tools.", category: TicketCategory.HARDWARE, priority: TicketPriority.MEDIUM, status: TicketStatus.OPEN },
    { title: "Adobe Creative Cloud license expired", description: "My Adobe CC license shows as expired. I need it for ongoing design work on the rebrand project.", category: TicketCategory.SOFTWARE, priority: TicketPriority.URGENT, status: TicketStatus.OPEN },

    // 5 ASSIGNED
    { title: "Keyboard keys sticking after coffee spill", description: "Accidentally spilled coffee on my Magic Keyboard. Several keys are now sticky and unresponsive.", category: TicketCategory.HARDWARE, priority: TicketPriority.MEDIUM, status: TicketStatus.ASSIGNED },
    { title: "Need GitHub organization access", description: "I was recently moved to the Platform team and need access to the github.com/techjays-platform org.", category: TicketCategory.ACCESS_REQUEST, priority: TicketPriority.HIGH, status: TicketStatus.ASSIGNED },
    { title: "Slow internet speed at desk 42", description: "Download speeds at my desk are consistently below 10 Mbps. Other desks nearby seem fine.", category: TicketCategory.NETWORK, priority: TicketPriority.MEDIUM, status: TicketStatus.ASSIGNED },
    { title: "Docker Desktop license compliance", description: "Docker Desktop is now requiring a paid license for enterprise use. Need guidance on approved alternatives.", category: TicketCategory.SOFTWARE, priority: TicketPriority.MEDIUM, status: TicketStatus.ASSIGNED },
    { title: "Badge not working for server room", description: "My access badge stopped working for the server room on floor 2. I need regular access for hardware maintenance.", category: TicketCategory.ACCESS_REQUEST, priority: TicketPriority.HIGH, status: TicketStatus.ASSIGNED },

    // 5 IN_PROGRESS
    { title: "Laptop battery draining rapidly", description: "My ThinkPad battery is draining from 100% to 0% in under 2 hours. It used to last 6+ hours.", category: TicketCategory.HARDWARE, priority: TicketPriority.HIGH, status: TicketStatus.IN_PROGRESS },
    { title: "Setup VPN for remote office in Dubai", description: "We need to set up a site-to-site VPN connection for the new Dubai office location.", category: TicketCategory.NETWORK, priority: TicketPriority.URGENT, status: TicketStatus.IN_PROGRESS },
    { title: "Migrate team from Slack to Teams channels", description: "The Operations team is migrating communication channels from Slack to Microsoft Teams.", category: TicketCategory.SOFTWARE, priority: TicketPriority.MEDIUM, status: TicketStatus.IN_PROGRESS },
    { title: "Suspicious login attempts on admin account", description: "Security alert: Multiple failed login attempts detected on the IT admin account from unknown IP addresses.", category: TicketCategory.SECURITY, priority: TicketPriority.URGENT, status: TicketStatus.IN_PROGRESS },
    { title: "Configure new network switches for floor 5", description: "New Cisco switches arrived for floor 5 expansion. Need configuration and deployment.", category: TicketCategory.NETWORK, priority: TicketPriority.HIGH, status: TicketStatus.IN_PROGRESS },

    // 5 RESOLVED
    { title: "Webcam not detected in Zoom", description: "Built-in webcam was not being detected by Zoom. Fixed by reinstalling camera drivers.", category: TicketCategory.HARDWARE, priority: TicketPriority.MEDIUM, status: TicketStatus.RESOLVED },
    { title: "Cannot install VS Code extensions", description: "VS Code marketplace was blocked by firewall. Network team added exception for marketplace.visualstudio.com.", category: TicketCategory.SOFTWARE, priority: TicketPriority.LOW, status: TicketStatus.RESOLVED },
    { title: "Email forwarding setup for maternity leave", description: "Set up automatic email forwarding for Sarah during her 3-month maternity leave.", category: TicketCategory.GENERAL_IT, priority: TicketPriority.LOW, status: TicketStatus.RESOLVED },
    { title: "AWS Console MFA token not working", description: "MFA authenticator app was out of sync. Resolved by re-syncing the time-based token.", category: TicketCategory.ACCESS_REQUEST, priority: TicketPriority.HIGH, status: TicketStatus.RESOLVED },
    { title: "Laptop running extremely slow", description: "Laptop had only 2GB free disk space. Cleared temp files and old Docker images, freed 80GB.", category: TicketCategory.HARDWARE, priority: TicketPriority.MEDIUM, status: TicketStatus.RESOLVED },

    // 5 CLOSED
    { title: "Onboarding IT setup for new QA engineer", description: "Complete IT onboarding: laptop, accounts, and access provisioned for new QA team member.", category: TicketCategory.GENERAL_IT, priority: TicketPriority.MEDIUM, status: TicketStatus.CLOSED },
    { title: "Office Wi-Fi password rotation", description: "Quarterly Wi-Fi password rotation completed for all office locations.", category: TicketCategory.NETWORK, priority: TicketPriority.LOW, status: TicketStatus.CLOSED },
    { title: "Decommission old file server", description: "Migrated all data from legacy file server to SharePoint and securely wiped the hardware.", category: TicketCategory.HARDWARE, priority: TicketPriority.LOW, status: TicketStatus.CLOSED },
    { title: "Annual software license audit", description: "Completed annual audit of all software licenses. Identified 12 unused licenses for reclamation.", category: TicketCategory.SOFTWARE, priority: TicketPriority.MEDIUM, status: TicketStatus.CLOSED },
    { title: "Setup conference room AV equipment", description: "Installed and configured new AV equipment in conference rooms A, C, and D.", category: TicketCategory.HARDWARE, priority: TicketPriority.LOW, status: TicketStatus.CLOSED },
  ];

  const createdTickets: Array<{ id: string; ticketNumber: string }> = [];

  for (let i = 0; i < ticketData.length; i++) {
    const t = ticketData[i]!;
    const reporter = employeeUsers[i % employeeUsers.length]!;
    const assignee = t.status !== TicketStatus.OPEN ? itAdminUsers[i % itAdminUsers.length]! : undefined;

    const resolvedAt = t.status === TicketStatus.RESOLVED || t.status === TicketStatus.CLOSED
      ? randomDate(new Date("2025-04-01"), new Date("2025-06-01"))
      : undefined;

    const closedAt = t.status === TicketStatus.CLOSED
      ? randomDate(new Date("2025-05-01"), new Date("2025-06-15"))
      : undefined;

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: `TJ-TKT-${pad(i + 1, 4)}`,
        title: t.title,
        description: t.description,
        category: t.category,
        priority: t.priority,
        status: t.status,
        reporterId: reporter.id,
        assigneeId: assignee?.id ?? null,
        slaDeadline: randomDate(new Date("2025-06-15"), new Date("2025-07-15")),
        resolvedAt: resolvedAt ?? null,
        closedAt: closedAt ?? null,
        satisfactionRating: t.status === TicketStatus.CLOSED ? Math.floor(Math.random() * 3) + 3 : null,
      },
    });
    createdTickets.push({ id: ticket.id, ticketNumber: ticket.ticketNumber });
  }

  console.log(`  Created ${createdTickets.length} tickets.\n`);

  // ── 6. ACCESS RECORDS ──
  console.log("Creating access records...");

  const systems = [
    "AWS Console",
    "GitHub Organization",
    "Jira",
    "Confluence",
    "Slack Enterprise",
    "Google Workspace",
    "VPN",
    "Figma",
    "Azure DevOps",
    "Salesforce",
  ];

  const accessLevels: AccessLevel[] = [AccessLevel.READ, AccessLevel.WRITE, AccessLevel.ADMIN, AccessLevel.FULL];

  for (let i = 0; i < 20; i++) {
    const user = employeeUsers[i % employeeUsers.length]!;
    const granter = itAdminUsers[i % itAdminUsers.length]!;
    const system = systems[i % systems.length]!;

    await prisma.accessRecord.create({
      data: {
        userId: user.id,
        systemName: system,
        accessLevel: accessLevels[i % accessLevels.length]!,
        grantedById: granter.id,
        grantedAt: randomDate(new Date("2024-01-01"), new Date("2025-06-01")),
        reviewDate: randomDate(new Date("2025-09-01"), new Date("2026-03-01")),
        status: i < 16 ? AccessStatus.ACTIVE : AccessStatus.PENDING_REVIEW,
      },
    });
  }

  console.log("  Created 20 access records.\n");

  // ── 7. KNOWLEDGE ARTICLES ──
  console.log("Creating knowledge articles...");

  const articles = [
    {
      title: "How to Connect to TechJays VPN",
      content: `# How to Connect to TechJays VPN\n\n## Prerequisites\n- TechJays corporate credentials\n- Cisco AnyConnect client installed\n\n## Steps\n1. Open Cisco AnyConnect Secure Mobility Client\n2. Enter the server address: vpn.techjays.com\n3. Click **Connect**\n4. Enter your corporate email and password\n5. Approve the MFA prompt on your authenticator app\n6. Wait for the connection to establish\n\n## Troubleshooting\n- If connection fails, ensure you are not on a restricted network\n- Try disconnecting and reconnecting\n- Contact IT support if issues persist`,
      category: "Network",
      tags: ["vpn", "remote-access", "network", "cisco"],
    },
    {
      title: "Requesting a New Device",
      content: `# Requesting a New Device\n\n## Process\n1. Log into JAYS DECK portal\n2. Navigate to **Assets > Request New Device**\n3. Fill in the request form:\n   - Device type (laptop, monitor, etc.)\n   - Justification\n   - Preferred specifications\n4. Submit for manager approval\n5. Once approved, IT will procure and configure the device\n\n## Standard Devices\n- **Engineers**: MacBook Pro 14" M3 or ThinkPad X1 Carbon\n- **Designers**: MacBook Pro 16" M3\n- **General**: Dell XPS 15\n\n## Timeline\n- Standard requests: 5-7 business days\n- Urgent requests: 2-3 business days (requires director approval)`,
      category: "Assets",
      tags: ["device", "laptop", "hardware", "request"],
    },
    {
      title: "Reset Your Password",
      content: `# Reset Your Password\n\n## Self-Service Reset\n1. Go to https://identity.techjays.com/reset\n2. Enter your corporate email address\n3. Check your email for the reset link (valid for 15 minutes)\n4. Click the link and enter your new password\n\n## Password Requirements\n- Minimum 12 characters\n- At least one uppercase letter\n- At least one lowercase letter\n- At least one number\n- At least one special character\n- Cannot reuse last 5 passwords\n\n## If You're Locked Out\nContact IT support via Slack #it-helpdesk or call ext. 5555`,
      category: "Security",
      tags: ["password", "reset", "security", "account"],
    },
    {
      title: "Setting Up Development Environment",
      content: `# Setting Up Development Environment\n\n## macOS Setup\n1. Install Homebrew: \`/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"\`\n2. Install Node.js: \`brew install node@20\`\n3. Install pnpm: \`npm install -g pnpm\`\n4. Install Docker Desktop from Self-Service portal\n5. Clone repos: \`git clone git@github.com:techjays/<repo>.git\`\n\n## Required Tools\n- VS Code (with recommended extensions)\n- Docker Desktop\n- Postman\n- pgAdmin 4\n\n## Access Needed\n- GitHub Organization invite\n- NPM registry token\n- AWS credentials (for backend devs)`,
      category: "Engineering",
      tags: ["development", "setup", "onboarding", "engineering"],
    },
    {
      title: "Connecting to Office Wi-Fi",
      content: `# Connecting to Office Wi-Fi\n\n## Corporate Network (TechJays-Corp)\n1. Select **TechJays-Corp** from available networks\n2. Authentication: WPA2-Enterprise\n3. Username: your corporate email\n4. Password: your corporate password\n5. Accept the certificate when prompted\n\n## Guest Network (TechJays-Guest)\n- SSID: TechJays-Guest\n- Password: Rotated monthly (check lobby display)\n- Limited bandwidth, no access to internal resources\n\n## Notes\n- Corporate Wi-Fi provides access to internal tools\n- Guest Wi-Fi is for visitors and personal devices only\n- Report connectivity issues to #it-helpdesk on Slack`,
      category: "Network",
      tags: ["wifi", "network", "connectivity", "office"],
    },
    {
      title: "Submitting an IT Support Ticket",
      content: `# Submitting an IT Support Ticket\n\n## How to Submit\n1. Log into JAYS DECK\n2. Click **Support > New Ticket**\n3. Select the appropriate category:\n   - **Hardware**: Physical device issues\n   - **Software**: Application problems\n   - **Network**: Connectivity issues\n   - **Access Request**: Permission/account needs\n   - **General IT**: Everything else\n4. Set priority level\n5. Provide a detailed description\n6. Attach screenshots if applicable\n\n## SLA Response Times\n- **Urgent**: 1 hour\n- **High**: 4 hours\n- **Medium**: 8 hours\n- **Low**: 24 hours`,
      category: "General",
      tags: ["ticket", "support", "helpdesk", "sla"],
    },
    {
      title: "Software Installation Guide",
      content: `# Software Installation Guide\n\n## Self-Service Portal\nMost approved software can be installed from the Self-Service portal:\n1. Open **Self-Service** app (pre-installed on all corporate devices)\n2. Browse or search for the software\n3. Click **Install**\n\n## Available Software\n- VS Code\n- Slack\n- Zoom\n- Docker Desktop\n- Postman\n- pgAdmin\n- Figma (Design team)\n- Adobe CC (Design team)\n\n## Requesting New Software\nIf software is not in Self-Service:\n1. Submit an IT ticket with category **Software**\n2. Include the software name, version, and business justification\n3. IT will review for security compliance before approval`,
      category: "Software",
      tags: ["software", "installation", "self-service", "apps"],
    },
    {
      title: "Remote Work Setup Guide",
      content: `# Remote Work Setup Guide\n\n## Requirements\n- Stable internet connection (minimum 25 Mbps recommended)\n- Corporate VPN installed and configured\n- Webcam and headset for video calls\n\n## Checklist\n- [ ] VPN connection tested\n- [ ] Slack/Teams accessible\n- [ ] Email syncing properly\n- [ ] Calendar visible\n- [ ] Can access Jira/Confluence\n- [ ] Printer configured (if needed)\n\n## Best Practices\n- Use a wired ethernet connection when possible\n- Keep your laptop plugged in during long calls\n- Use the VPN only when accessing internal resources\n- Enable Do Not Disturb during deep focus time\n\n## Ergonomics\nRequest a monitor and keyboard for your home office through JAYS DECK asset request.`,
      category: "General",
      tags: ["remote", "work-from-home", "setup", "vpn"],
    },
    {
      title: "Data Backup Best Practices",
      content: `# Data Backup Best Practices\n\n## Automated Backups\n- All corporate laptops have automatic cloud backup enabled\n- Google Drive / OneDrive syncs your Documents folder\n- Code should ALWAYS be pushed to GitHub — local-only code is not backed up\n\n## What's Backed Up\n- Documents folder\n- Desktop folder\n- Browser bookmarks (via Chrome sync)\n\n## What's NOT Backed Up\n- Downloads folder\n- External drive contents\n- Virtual machine images\n- Docker volumes\n\n## Recovery\nIf you need to recover files:\n1. Check Google Drive / OneDrive version history\n2. For code: check GitHub\n3. For everything else: submit an IT ticket\n\n## Best Practices\n- Don't store sensitive data on local drives\n- Regularly push code to remote repositories\n- Use cloud storage for important documents`,
      category: "Security",
      tags: ["backup", "data", "recovery", "cloud-storage"],
    },
    {
      title: "Security Awareness - Phishing Prevention",
      content: `# Security Awareness - Phishing Prevention\n\n## How to Identify Phishing Emails\n- Suspicious sender address (check the actual email, not display name)\n- Urgency or threat language ("Your account will be deleted!")\n- Unexpected attachments\n- Links that don't match the displayed text (hover to check)\n- Requests for passwords or personal information\n\n## What to Do\n1. **DO NOT** click any links or download attachments\n2. **DO NOT** reply to the email\n3. Report to security@techjays.com\n4. Forward the email as an attachment if possible\n5. Mark as phishing in your email client\n\n## Real Examples We've Seen\n- Fake "IT Password Reset" emails\n- Fake invoice attachments\n- Impersonation of executives requesting urgent wire transfers\n\n## Remember\n- TechJays IT will NEVER ask for your password via email\n- When in doubt, verify via Slack or phone`,
      category: "Security",
      tags: ["security", "phishing", "awareness", "email"],
    },
  ];

  for (const article of articles) {
    await prisma.knowledgeArticle.create({
      data: {
        title: article.title,
        content: article.content,
        category: article.category,
        tags: article.tags,
        authorId: superAdminUser.id,
        isPublished: true,
        viewCount: Math.floor(Math.random() * 500) + 50,
      },
    });
  }

  console.log(`  Created ${articles.length} knowledge articles.\n`);

  // ── 8. AUDIT LOGS ──
  console.log("Creating audit logs...");

  const auditEntries: Array<{
    userId: string;
    action: AuditAction;
    entityType: string;
    entityId: string;
    changes: object;
  }> = [
    {
      userId: superAdminUser.id,
      action: AuditAction.CREATE,
      entityType: "User",
      entityId: createdUsers[5]?.id ?? "seed",
      changes: { description: "Created new user account" },
    },
    {
      userId: itAdminUsers[0]!.id,
      action: AuditAction.ASSIGN,
      entityType: "Asset",
      entityId: createdAssets[0]?.id ?? "seed",
      changes: { description: "Assigned MacBook Pro 14 M3 to employee" },
    },
    {
      userId: itAdminUsers[1]!.id,
      action: AuditAction.CREATE,
      entityType: "Ticket",
      entityId: createdTickets[0]?.id ?? "seed",
      changes: { description: "New hardware ticket created" },
    },
    {
      userId: superAdminUser.id,
      action: AuditAction.APPROVE,
      entityType: "AccessRequest",
      entityId: "seed-access-req-001",
      changes: { description: "Approved AWS Console access request" },
    },
    {
      userId: itAdminUsers[2]!.id,
      action: AuditAction.UPDATE,
      entityType: "Asset",
      entityId: createdAssets[100]?.id ?? "seed",
      changes: { status: { from: "ASSIGNED", to: "IN_MAINTENANCE" }, description: "Sent laptop for battery replacement" },
    },
    {
      userId: superAdminUser.id,
      action: AuditAction.LOGIN,
      entityType: "Session",
      entityId: "seed-session-001",
      changes: { description: "Admin login from 192.168.1.100" },
    },
    {
      userId: itAdminUsers[0]!.id,
      action: AuditAction.EXPORT,
      entityType: "Report",
      entityId: "seed-report-001",
      changes: { description: "Exported asset inventory report as CSV" },
    },
    {
      userId: itAdminUsers[3]!.id,
      action: AuditAction.UNASSIGN,
      entityType: "Asset",
      entityId: createdAssets[110]?.id ?? "seed",
      changes: { description: "Unassigned and retired old ThinkPad" },
    },
  ];

  for (const entry of auditEntries) {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        changes: entry.changes,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    });
  }

  console.log(`  Created ${auditEntries.length} audit logs.\n`);

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
