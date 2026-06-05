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
  status: OpportunityStatus;
  priority: OpportunityPriority;
  steps: string[];
  why: string;
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
  amount: number;
  date: string;
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
    title: "Switch to Generic Atorvastatin",
    description:
      "Save $127/month by switching from Lipitor to its FDA-approved generic equivalent",
    savings: 127,
    points: 500,
    status: "active",
    priority: "high",
    steps: [
      "Review the generic medication details",
      "Generate a note for your doctor",
      "Send note and get approval",
      "Update your prescription at pharmacy",
    ],
    why: "Your plan covers generic statins at Tier 1 copay ($10) vs. brand-name at Tier 3 ($137). Clinically equivalent.",
  },
  {
    id: "opp-2",
    category: "preventive",
    title: "Annual Physical Overdue",
    description:
      "Your annual physical is covered at 100% — no copay, no deductible",
    savings: 250,
    points: 300,
    status: "active",
    priority: "high",
    steps: [
      "Schedule with your primary care provider",
      "Confirm it's coded as preventive",
      "Complete your visit",
      "Earn 300 points automatically",
    ],
    why: "ACA-compliant plans cover annual preventive physicals at $0 cost share. Last recorded visit was over 13 months ago.",
  },
  {
    id: "opp-3",
    category: "mail-delivery",
    title: "Mail Delivery for Metformin",
    description: "Get a 90-day supply delivered home — save $45 vs. retail",
    savings: 45,
    points: 200,
    status: "active",
    priority: "medium",
    steps: [
      "Enroll in mail delivery pharmacy",
      "Transfer your Metformin prescription",
      "Confirm shipping address",
      "Receive your first 90-day supply",
    ],
    why: "Mail-order pharmacy 90-day supply is $15 vs. $60 for 3 monthly retail fills. Same medication, delivered to your door.",
  },
  {
    id: "opp-4",
    category: "preventive",
    title: "Flu Shot — 100% Covered",
    description: "Get your annual flu shot at any in-network pharmacy at $0",
    savings: 40,
    points: 150,
    status: "active",
    priority: "medium",
    steps: [
      "Find an in-network pharmacy near you",
      "Show your member ID",
      "Get vaccinated",
      "Points credited within 48 hours",
    ],
    why: "Preventive immunizations are covered at $0 under your plan. CVS, Walgreens, and Rite Aid are all in-network.",
  },
  {
    id: "opp-5",
    category: "specialist",
    title: "Lower-Cost Cardiologist",
    description:
      "Switch to an in-network cardiologist and save $95 per visit",
    savings: 95,
    points: 250,
    status: "active",
    priority: "medium",
    steps: [
      "Review the alternative cardiologist profile",
      "Compare quality ratings and wait times",
      "Request a referral from your PCP",
      "Schedule with the new provider",
    ],
    why: "Dr. Williams at Northside Cardiology has equal quality scores but is Tier 1 vs. your current cardiologist's Tier 2 status.",
  },
  {
    id: "opp-6",
    category: "preventive",
    title: "Mammogram Reminder",
    description: "Annual mammogram is 100% covered — no cost to you",
    savings: 350,
    points: 300,
    status: "active",
    priority: "low",
    steps: [
      "Get a referral or self-refer",
      "Choose an in-network imaging center",
      "Schedule your appointment",
      "Complete screening and earn points",
    ],
    why: "Preventive cancer screenings are covered at $0. Annual mammograms are recommended for women 40+.",
  },
];

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

export const MOCK_POINTS_HISTORY: PointsTransaction[] = [
  {
    id: "pt-1",
    type: "earned",
    description: "Completed annual physical",
    amount: 300,
    date: "Dec 10, 2025",
  },
  {
    id: "pt-2",
    type: "earned",
    description: "Switched to generic Atorvastatin",
    amount: 500,
    date: "Dec 5, 2025",
  },
  {
    id: "pt-3",
    type: "redeemed",
    description: "Premium reduction — December",
    amount: 750,
    date: "Nov 30, 2025",
  },
  {
    id: "pt-4",
    type: "earned",
    description: "Monthly engagement bonus",
    amount: 500,
    date: "Nov 1, 2025",
  },
  {
    id: "pt-5",
    type: "earned",
    description: "App feedback survey",
    amount: 10,
    date: "Oct 28, 2025",
  },
  {
    id: "pt-6",
    type: "earned",
    description: "Set up mail delivery pharmacy",
    amount: 200,
    date: "Oct 20, 2025",
  },
  {
    id: "pt-7",
    type: "redeemed",
    description: "Copay credit — Q4",
    amount: 500,
    date: "Sep 30, 2025",
  },
  {
    id: "pt-8",
    type: "earned",
    description: "Completed flu shot",
    amount: 150,
    date: "Sep 15, 2025",
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
  preventive: "#10B981",
  "mail-delivery": "#F59E0B",
  specialist: "#0EA5E9",
  upcoming: "#EC4899",
};
