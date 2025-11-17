export interface Simulation {
  id: string;
  title: string;
  description: string;
}

export const SIMULATIONS: Simulation[] = [
  {
    id: "board-deck-crisis",
    title: "Board Deck Crisis Mode",
    description: "Last-minute board presentation creation under tight deadlines with multiple stakeholders"
  },
  {
    id: "quarterly-business-review",
    title: "Quarterly Business Review Prep",
    description: "Gathering insights across departments and synthesizing into executive narratives"
  },
  {
    id: "customer-complaint-triage",
    title: "Customer Complaint Triage",
    description: "Analyzing high-volume support tickets and escalating critical issues"
  },
  {
    id: "contract-review-bottleneck",
    title: "Contract Review Bottleneck",
    description: "Legal review backlog causing deal delays and revenue recognition issues"
  },
  {
    id: "hiring-pipeline-screening",
    title: "Hiring Pipeline Screening",
    description: "Resume screening and initial candidate assessment for high-volume roles"
  },
  {
    id: "competitive-intelligence",
    title: "Competitive Intelligence Gathering",
    description: "Monitoring competitor moves and synthesizing strategic insights"
  },
  {
    id: "financial-close-process",
    title: "Financial Close Process",
    description: "Month-end/quarter-end close with manual reconciliation and reporting"
  },
  {
    id: "sales-forecast-chaos",
    title: "Sales Forecast Chaos",
    description: "Aggregating pipeline data from reps and creating accurate forecasts"
  }
];

export const getSimulationById = (id: string): Simulation | undefined => {
  return SIMULATIONS.find(sim => sim.id === id);
};

export const getDisplayTitle = (simId: string): string => {
  const simInfo = getSimulationById(simId);
  if (simInfo?.title) return simInfo.title;
  
  // Defensive fallback: format the ID nicely
  return simId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
