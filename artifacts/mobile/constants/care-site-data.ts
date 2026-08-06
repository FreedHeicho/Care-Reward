/**
 * Shared Care Site Alternative data.
 * Imported by both the combined view (care-site-alternatives)
 * and the individual group view (care-site-alternative/[id]).
 * Will be replaced by real API calls — see Task #4.
 */

export interface Provider {
  id: string;
  name: string;
  distance: string;
  points: number;
}

export interface CareSiteGroup {
  id: string;
  procedure: string;
  providers: Provider[];
}

export const CARE_SITE_GROUPS: CareSiteGroup[] = [
  {
    id: "csg-1",
    procedure: "Hospital C-section Delivery",
    providers: [
      { id: "p1", name: "New York Presbyterian hospital", distance: "2.5 miles away", points: 0 },
      { id: "p2", name: "NY Langone", distance: "3.8 miles away", points: 400 },
      { id: "p3", name: "NY Health & Hospital", distance: "5.2 miles away", points: 2000 },
    ],
  },
  {
    id: "csg-2",
    procedure: "Diagnostics Ultrasound",
    providers: [
      { id: "p4", name: "New York Presbyterian hospital", distance: "2.5 miles away", points: 0 },
      { id: "p5", name: "NY Langone", distance: "3.8 miles away", points: 20 },
      { id: "p6", name: "NY Health & Hospital", distance: "5.2 miles away", points: 40 },
    ],
  },
  {
    id: "csg-3",
    procedure: "Specialist OB/GYN",
    providers: [
      { id: "p7", name: "New York Presbyterian hospital (Dr sun)", distance: "2.5 miles away", points: 0 },
      { id: "p8", name: "NY Langone (Dr. Perrone)", distance: "3.8 miles away", points: 20 },
      { id: "p9", name: "NY Health & Hospital (IP Dr. Cohen)", distance: "5.2 miles away", points: 80 },
    ],
  },
];

/** Maps opportunity ID → care site group */
export const OPP_TO_GROUP: Record<string, string> = {
  "opp-csa-1": "csg-1",
  "opp-csa-2": "csg-2",
  "opp-csa-3": "csg-3",
};
