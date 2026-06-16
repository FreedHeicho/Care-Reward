export type OpportunityCategory =
  | "medication"
  | "preventive"
  | "mail-delivery"
  | "specialist"
  | "upcoming";

export type OpportunityStatus = "active" | "completed" | "missed";
export type OpportunityPriority = "high" | "medium" | "low";

export interface Opportunity {
  id: string;
  category: OpportunityCategory;
  title: string;
  description: string;
  savings: number;
  points: number;
  pointsMonthly: number;
  status: OpportunityStatus;
  priority: OpportunityPriority;
  steps: string[];
  why: string;
  benefits: string[];
}

export type ClaimStatus = "processed" | "pending" | "in-review";

export interface Claim {
  id: string;
  provider: string;
  date: string;
  month: string;
  billed: number;
  insurancePaid: number;
  patientResponsibility: number;
  status: ClaimStatus;
  type: string;
  claimNumber: string;
}

export interface PointsTransaction {
  id: string;
  type: "earned" | "redeemed";
  description: string;
  category: string;
  amount: number;
  date: string;
  dateLabel: string;
  icon: string;
}

export interface ActivityEvent {
  id: string;
  title: string;
  description: string;
  points: number;
  date: string;
  dateLabel: string;
  icon: "heart" | "shield" | "check-circle" | "mail" | "activity" | "star";
  iconBg: string;
  iconColor: string;
}

export interface UserPlan {
  deductible: number;
  deductibleMet: number;
  oopMax: number;
  oopMet: number;
  planName: string;
  memberId: string;
}

export const MOCK_USER_PLAN: UserPlan = {
  deductible: 1500,
  deductibleMet: 890,
  oopMax: 4500,
  oopMet: 1240,
  planName: "BlueCross PPO Gold",
  memberId: "MBR-2024-8821",
};

export const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: "opp-1",
    category: "medication",
    title: "Medication Opportunity",
    description: "For your Substitution Opportunity",
    savings: 127,
    points: 50,
    pointsMonthly: 50,
    status: "active",
    priority: "high",
    steps: [
      "Review the generic medication details",
      "Generate a note for your doctor",
      "Send note and get approval",
      "Update your prescription at pharmacy",
    ],
    why: "Your plan covers generic statins at Tier 1 copay ($10) vs. brand-name at Tier 3 ($137). Clinically equivalent.",
    benefits: [
      "Save money on medication costs",
      "Same therapeutic benefits as brand name",
    ],
  },
  {
    id: "opp-2",
    category: "preventive",
    title: "Annual Physical Due",
    description: "Covered at 100% — no copay, no deductible",
    savings: 250,
    points: 100,
    pointsMonthly: 0,
    status: "active",
    priority: "high",
    steps: [
      "Schedule with your primary care provider",
      "Confirm it's coded as preventive",
      "Complete your visit",
      "Earn points automatically",
    ],
    why: "ACA-compliant plans cover annual preventive physicals at $0 cost share. Last recorded visit was over 13 months ago.",
    benefits: [
      "100% covered by your plan",
      "Includes key health screenings",
    ],
  },
  {
    id: "opp-3",
    category: "mail-delivery",
    title: "Switch Amlodipine to Mail Order",
    description: "Save on 90-day supply with home delivery",
    savings: 45,
    points: 150,
    pointsMonthly: 0,
    status: "active",
    priority: "medium",
    steps: [
      "Enroll in mail delivery pharmacy",
      "Transfer your prescription",
      "Confirm shipping address",
      "Receive your first 90-day supply",
    ],
    why: "Mail-order pharmacy 90-day supply is $15 vs. $60 for 3 monthly retail fills.",
    benefits: [
      "Convenient home delivery",
      "Lower cost per dose",
    ],
  },
  {
    id: "opp-4",
    category: "preventive",
    title: "Flu Shot — 100% Covered",
    description: "Get your annual flu shot at any in-network pharmacy at $0",
    savings: 40,
    points: 75,
    pointsMonthly: 0,
    status: "active",
    priority: "medium",
    steps: [
      "Find an in-network pharmacy near you",
      "Show your member ID",
      "Get vaccinated",
      "Points credited within 48 hours",
    ],
    why: "Preventive immunizations are covered at $0 under your plan.",
    benefits: [
      "Free at in-network pharmacies",
      "Protects you and your community",
    ],
  },
  {
    id: "opp-5",
    category: "specialist",
    title: "Lower-Cost Cardiologist",
    description: "Switch to an in-network cardiologist and save $95 per visit",
    savings: 95,
    points: 75,
    pointsMonthly: 0,
    status: "active",
    priority: "medium",
    steps: [
      "Review the alternative cardiologist profile",
      "Compare quality ratings and wait times",
      "Request a referral from your PCP",
      "Schedule with the new provider",
    ],
    why: "Dr. Williams at Northside Cardiology has equal quality scores but is Tier 1 vs. your current cardiologist's Tier 2 status.",
    benefits: [
      "Same quality, lower cost",
      "Shorter wait times",
    ],
  },
  {
    id: "opp-6",
    category: "preventive",
    title: "Mammogram Reminder",
    description: "Annual mammogram is 100% covered — no cost to you",
    savings: 350,
    points: 100,
    pointsMonthly: 0,
    status: "active",
    priority: "low",
    steps: [
      "Get a referral or self-refer",
      "Choose an in-network imaging center",
      "Schedule your appointment",
      "Complete screening and earn points",
    ],
    why: "Preventive cancer screenings are covered at $0.",
    benefits: [
      "100% covered, no cost to you",
      "Early detection saves lives",
    ],
  },
];

export const MISSED_OPPORTUNITIES_COUNT = 5;
export const NEW_OPPORTUNITIES_COUNT = 9;

export const MOCK_CLAIMS: Claim[] = [
  {
    id: "clm-1",
    provider: "City Medical Center",
    date: "Dec 15, 2025",
    month: "December 2025",
    billed: 850,
    insurancePaid: 720,
    patientResponsibility: 130,
    status: "processed",
    type: "Primary Care",
    claimNumber: "CLM-2025-88421",
  },
  {
    id: "clm-2",
    provider: "CVS Pharmacy",
    date: "Dec 10, 2025",
    month: "December 2025",
    billed: 145,
    insurancePaid: 95,
    patientResponsibility: 50,
    status: "processed",
    type: "Prescription",
    claimNumber: "CLM-2025-88319",
  },
  {
    id: "clm-3",
    provider: "Radiology Plus Imaging",
    date: "Dec 1, 2025",
    month: "December 2025",
    billed: 1200,
    insurancePaid: 0,
    patientResponsibility: 0,
    status: "pending",
    type: "Radiology",
    claimNumber: "CLM-2025-88102",
  },
  {
    id: "clm-4",
    provider: "Dr. Chen Dermatology",
    date: "Nov 28, 2025",
    month: "November 2025",
    billed: 320,
    insurancePaid: 270,
    patientResponsibility: 50,
    status: "processed",
    type: "Specialist",
    claimNumber: "CLM-2025-87991",
  },
  {
    id: "clm-5",
    provider: "Metro Lab Services",
    date: "Nov 15, 2025",
    month: "November 2025",
    billed: 480,
    insurancePaid: 380,
    patientResponsibility: 100,
    status: "in-review",
    type: "Laboratory",
    claimNumber: "CLM-2025-87754",
  },
  {
    id: "clm-6",
    provider: "Northside Urgent Care",
    date: "Nov 5, 2025",
    month: "November 2025",
    billed: 275,
    insurancePaid: 200,
    patientResponsibility: 75,
    status: "processed",
    type: "Urgent Care",
    claimNumber: "CLM-2025-87512",
  },
];

export const MOCK_ACTIVITY: ActivityEvent[] = [
  {
    id: "act-1",
    title: "You completed your annual wellness visit",
    description: "Annual wellness visit completed",
    points: 27,
    date: "2025-06-15",
    dateLabel: "JUN\n15",
    icon: "heart",
    iconBg: "#E8F5F2",
    iconColor: "#2D7D6F",
  },
  {
    id: "act-2",
    title: "Refilled Amlodipine prescription",
    description: "Prescription refill completed",
    points: 9,
    date: "2025-06-14",
    dateLabel: "JUN\n14",
    icon: "shield",
    iconBg: "#F0F2F5",
    iconColor: "#7A8699",
  },
  {
    id: "act-3",
    title: "4 day Admission at H&H Jacobi Hospital",
    description: "Hospital admission completed",
    points: 200,
    date: "2025-06-11",
    dateLabel: "JUN\n11",
    icon: "check-circle",
    iconBg: "#F0F2F5",
    iconColor: "#7A8699",
  },
  {
    id: "act-4",
    title: "Switch your Amlodipine to mail order",
    description: "Mail order prescription setup",
    points: 20,
    date: "2025-06-09",
    dateLabel: "JUN\n9",
    icon: "mail",
    iconBg: "#FEF3C7",
    iconColor: "#F59E0B",
  },
  {
    id: "act-5",
    title: "7 day post admission to primary care",
    description: "Post-admission follow-up visit",
    points: 100,
    date: "2025-06-06",
    dateLabel: "JUN\n6",
    icon: "check-circle",
    iconBg: "#F0F2F5",
    iconColor: "#7A8699",
  },
];

export const MOCK_POINTS_HISTORY: PointsTransaction[] = [
  {
    id: "pt-1",
    type: "earned",
    description: "Patient Satisfaction Survey - H+H Ultrasound",
    category: "Care Quality",
    amount: 10,
    date: "2025-06-04",
    dateLabel: "JUN\n4",
    icon: "activity",
  },
  {
    id: "pt-2",
    type: "earned",
    description: "Annual Physical Exam",
    category: "Preventive Care",
    amount: 300,
    date: "2025-06-03",
    dateLabel: "JUN\n3",
    icon: "activity",
  },
  {
    id: "pt-3",
    type: "earned",
    description: "Switched to generic Atorvastatin",
    category: "Medication",
    amount: 500,
    date: "2025-06-02",
    dateLabel: "JUN\n2",
    icon: "star",
  },
  {
    id: "pt-4",
    type: "redeemed",
    description: "Premium reduction — December",
    category: "Redemption",
    amount: 750,
    date: "2025-05-30",
    dateLabel: "MAY\n30",
    icon: "activity",
  },
  {
    id: "pt-5",
    type: "earned",
    description: "Monthly engagement bonus",
    category: "Engagement",
    amount: 500,
    date: "2025-05-01",
    dateLabel: "MAY\n1",
    icon: "star",
  },
];

export const CATEGORY_LABELS: Record<OpportunityCategory, string> = {
  medication: "Medication",
  preventive: "Preventive Care",
  "mail-delivery": "Mail Delivery",
  specialist: "Specialist",
  upcoming: "Upcoming Care",
};

export const CATEGORY_COLORS: Record<OpportunityCategory, string> = {
  medication: "#8B5CF6",
  preventive: "#2D7D6F",
  "mail-delivery": "#F59E0B",
  specialist: "#0EA5E9",
  upcoming: "#EC4899",
};
