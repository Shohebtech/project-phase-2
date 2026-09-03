/* ==========================================================================
   PRESET CANDIDATE DEMO PROFILES & SIMULATED BIOMETRICS
   ========================================================================== */

const DEMO_PROFILES = {
  sarah: {
    id: "CAND-89420-US",
    name: "Sarah Jenkins",
    role: "Senior AI Systems Engineer",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
    faceMetrics: {
      eyeDistRatio: 0.284,
      symmetryScore: 98.4,
      contourHash: "F7A9-33B1-90EE",
      livenessStatus: "Verified Live"
    }
  },
  alex: {
    id: "CAND-41092-UK",
    name: "Alex Chen",
    role: "Full-Stack Tech Lead",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    faceMetrics: {
      eyeDistRatio: 0.291,
      symmetryScore: 97.1,
      contourHash: "E2B8-99C4-11AA",
      livenessStatus: "Verified Live"
    }
  },
  marcus: {
    id: "CAND-66723-CA",
    name: "Marcus Vance",
    role: "Cloud DevOps Architect",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    faceMetrics: {
      eyeDistRatio: 0.278,
      symmetryScore: 96.8,
      contourHash: "A1D4-88E2-44BB",
      livenessStatus: "Verified Live"
    }
  }
};
