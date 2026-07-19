export type VopajTrack = {
  slug: string;
  title: string;
  description: string;
  programs: string[];
};

export const VOPAJ_TRACKS: VopajTrack[] = [
  {
    slug: "interview-placement-readiness",
    title: "Interview & Placement Readiness",
    description:
      "Get ready for the interviews and written tests that actually decide finance hiring — practiced with real feedback, not guesswork.",
    programs: [
      "CA Fresher Interview-Ready Programme",
      "Mock Interview Programme",
      "Resume Building for Finance Professionals",
      "Aptitude and Written-Test Preparation",
      "Recruiter Screening and Interview Training",
    ],
  },
  {
    slug: "articleship-early-career",
    title: "Articleship & Early Career",
    description: "Structured orientation for students starting or about to start their articleship.",
    programs: ["Pre-Articleship Training", "Articleship Orientation Programme"],
  },
  {
    slug: "practical-software-compliance",
    title: "Practical Software & Compliance",
    description:
      "Hands-on training on the tools finance teams actually run on — Excel, Tally, GST, QuickBooks, and US accounting/taxation.",
    programs: [
      "Advanced Excel for Finance Professionals",
      "Tally and GST Practical Training",
      "QuickBooks and US Accounting",
      "US Taxation Fundamentals",
      "Statutory Audit Practical Training",
      "Internal Audit Practical Training",
      "Income-tax Return Preparation",
      "GST Return Filing",
      "Bookkeeping Assignments",
    ],
  },
  {
    slug: "career-growth",
    title: "Career Growth",
    description: "Ongoing support beyond a single course — communication skills and one-on-one mentorship.",
    programs: ["Communication Skills for Finance Professionals", "Career Mentorship Sessions"],
  },
];
