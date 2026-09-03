/* ==========================================================================
   VERIFACE AI - INTERVIEW QUESTION SIMULATOR & SPEECH ENGINE
   ========================================================================== */

const INTERVIEW_QUESTIONS = {
  fullstack: [
    {
      id: 1,
      title: "React Server Components & Micro-Frontends",
      text: "How would you architect a high-traffic micro-frontend application using React Server Components, and what strategies do you employ for state synchronization and bundle optimization across isolated teams?",
      expectedKeywords: ["React Server Components", "hydration", "bundle size", "state management", "micro-frontend", "caching", "streaming SSR"]
    },
    {
      id: 2,
      title: "Database Indexing & Distributed Locks",
      text: "Explain how B-tree and Hash indexing differ under heavy concurrent read/write workloads in PostgreSQL, and how you would prevent race conditions across multi-node services using Redis or Postgres advisory locks.",
      expectedKeywords: ["B-Tree", "Hash index", "concurrency", "advisory lock", "Redis Redlock", "race condition", "ACID"]
    },
    {
      id: 3,
      title: "System Design: Real-time Video Streaming & Security",
      text: "Design a WebRTC-based video streaming system for biometric authentication that can scale to 100,000 concurrent video sessions. How do you manage TURN/STUN fallback and end-to-end media encryption?",
      expectedKeywords: ["WebRTC", "STUN/TURN", "SFU/MCU", "DTLS-SRTP", "latency", "peer-to-peer", "codecs"]
    },
    {
      id: 4,
      title: "Behavioral: System Outage & Stakeholder Management",
      text: "Describe a critical production incident you led resolution for. How did you triage under pressure, communicate with non-technical executive stakeholders, and enforce blameless post-mortems?",
      expectedKeywords: ["root cause", "post-mortem", "communication", "triage", "monitoring", "SLA", "mitigation"]
    }
  ],

  ai_engineer: [
    {
      id: 1,
      title: "LLM Architecture & KV Cache Optimization",
      text: "Explain how Key-Value (KV) caching works in Transformer self-attention mechanisms during LLM inference, and detail how PagedAttention reduces memory fragmentation in serving frameworks like vLLM.",
      expectedKeywords: ["Transformer", "Self-attention", "KV Cache", "vLLM", "PagedAttention", "memory fragmentation", "quantization"]
    },
    {
      id: 2,
      title: "Vector Search & Retrieval Augmented Generation (RAG)",
      text: "Compare HNSW index vs IVF-PQ vector indexing in Milvus/Qdrant. How do you optimize chunking strategies, embedding dimensionality, and re-ranking models for low-latency domain-specific RAG pipelines?",
      expectedKeywords: ["HNSW", "IVF-PQ", "embeddings", "vector index", "re-ranking", "chunking", "cosine similarity"]
    },
    {
      id: 3,
      title: "Fine-Tuning Techniques: LoRA & QLoRA",
      text: "How does Low-Rank Adaptation (LoRA) reduce trainable parameters during LLM fine-tuning? What are the mathematical tradeoffs when decomposing weight matrices into low-rank matrices A and B?",
      expectedKeywords: ["LoRA", "rank decomposition", "trainable parameters", "QLoRA", "gradient descent", "adapters"]
    },
    {
      id: 4,
      title: "AI Ethics, Guardrails & Hallucination Mitigation",
      text: "How do you implement real-time output guardrails to prevent hallucination, prompt injection attacks, and PII leakage in enterprise customer-facing AI agents?",
      expectedKeywords: ["guardrails", "prompt injection", "PII masking", "hallucination", "alignment", "evaluation"]
    }
  ],

  product_mgr: [
    {
      id: 1,
      title: "Product Vision & AI Feature Prioritization",
      text: "How do you evaluate and prioritize introducing generative AI features into an existing SaaS workflow when balancing technical feasibility, token costs, and user retention impact?",
      expectedKeywords: ["prioritization", "ROI", "RICE matrix", "unit economics", "retention", "user friction"]
    },
    {
      id: 2,
      title: "Metrics & A/B Experimentation Strategy",
      text: "When launching an automated face authentication onboarding flow, what North Star metrics, friction indicators, and security drop-off points would you measure during an A/B rollout?",
      expectedKeywords: ["North Star metric", "funnel conversion", "false positive rate", "drop-off", "statistical significance"]
    },
    {
      id: 3,
      title: "Cross-Functional Alignment & Engineering Conflict",
      text: "Describe a scenario where engineering pushed back on a product deadline due to technical debt. How did you negotiate scope reduction while maintaining key customer deliverables?",
      expectedKeywords: ["tradeoff", "technical debt", "scope reduction", "negotiation", "roadmap", "milestone"]
    },
    {
      id: 4,
      title: "Customer Feedback & Enterprise Readiness",
      text: "How do you translate qualitative customer feedback from enterprise security officers into concrete compliance roadmap items like SOC2, GDPR, and biometric data privacy laws?",
      expectedKeywords: ["SOC2", "GDPR", "compliance", "biometric privacy", "enterprise requirements", "roadmap"]
    }
  ],

  devops: [
    {
      id: 1,
      title: "Kubernetes Auto-Scaling & Zero-Downtime Deployments",
      text: "Describe how you configure Horizontal Pod Autoscalers (HPA) using custom Prometheus metrics, and compare Canary vs Blue-Green rollout strategies for zero-downtime microservices.",
      expectedKeywords: ["Kubernetes", "HPA", "Prometheus", "Canary", "Blue-Green", "zero-downtime", "ingress"]
    },
    {
      id: 2,
      title: "Infrastructure as Code & GitOps Pipeline Design",
      text: "How do you structure multi-environment Terraform modules with ArgoCD/Flux for automated GitOps deployments, ensuring secrets management via HashiCorp Vault?",
      expectedKeywords: ["Terraform", "ArgoCD", "GitOps", "HashiCorp Vault", "secrets management", "state lock"]
    },
    {
      id: 3,
      title: "Cloud Security & Zero-Trust Architecture",
      text: "Explain how you enforce Zero-Trust network policy across multi-cloud VPCs using mTLS, Istio service mesh, and AWS IAM role delegation.",
      expectedKeywords: ["Zero-Trust", "mTLS", "Istio", "service mesh", "IAM role", "VPC peering", "least privilege"]
    },
    {
      id: 4,
      title: "Incident Response & Chaos Engineering",
      text: "How do you implement Chaos Mesh or Gremlin experiments to validate cluster resilience against region outages and network latency spikes?",
      expectedKeywords: ["chaos engineering", "resilience", "MTTR", "failover", "latency", "circuit breaker"]
    }
  ]
};

class InterviewEngine {
  constructor() {
    this.selectedRoleKey = 'fullstack';
    this.questions = INTERVIEW_QUESTIONS.fullstack;
    this.currentQIndex = 0;
    this.candidateAnswers = [];
    
    this.timerInterval = null;
    this.elapsedSeconds = 0;

    // Speech Recognition & Synthesis
    this.recognition = null;
    this.isListening = false;
    this.synth = window.speechSynthesis;
  }

  setRole(roleKey) {
    this.selectedRoleKey = roleKey;
    this.questions = INTERVIEW_QUESTIONS[roleKey] || INTERVIEW_QUESTIONS.fullstack;
    this.currentQIndex = 0;
    this.candidateAnswers = [];
  }

  startInterview() {
    if (!faceEngine.enroledTemplate) {
      alert("Face Authentication required before starting live interview. Please register baseline snapshot in Step 01.");
      app.switchTab('auth');
      return;
    }

    app.switchTab('interview');
    this.currentQIndex = 0;
    this.candidateAnswers = [];
    this.elapsedSeconds = 0;

    // Start Timer
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds++;
      const m = String(Math.floor(this.elapsedSeconds / 60)).padStart(2, '0');
      const s = String(this.elapsedSeconds % 60).padStart(2, '0');
      document.getElementById('interview-timer').textContent = `${m}:${s}`;
    }, 1000);

    // Start Live Anti-Cheating Bio Sentinel
    faceEngine.startLiveInterviewMonitoring();

    // Load first question
    this.loadQuestion(0);
    this.initSpeechRecognition();
  }

  loadQuestion(index) {
    if (index >= this.questions.length) {
      this.finishInterview();
      return;
    }

    this.currentQIndex = index;
    const q = this.questions[index];

    document.getElementById('live-q-progress').textContent = `Question ${index + 1} of ${this.questions.length}`;
    document.getElementById('live-question-title').textContent = q.title;
    document.getElementById('live-question-text').textContent = q.text;
    document.getElementById('candidate-response-input').value = '';
    
    this.updateMetrics();

    // AI Voice Readout if enabled
    const ttsEnabled = document.getElementById('chk-enable-tts').checked;
    if (ttsEnabled && this.synth) {
      this.speakText(q.text);
    }
  }

  speakText(text) {
    this.synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const indicator = document.getElementById('tts-active-indicator');
    if (indicator) indicator.classList.remove('hidden');

    utterance.onend = () => {
      if (indicator) indicator.classList.add('hidden');
    };

    this.synth.speak(utterance);
  }

  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        const textarea = document.getElementById('candidate-response-input');
        textarea.value = transcript;
        this.updateMetrics();
      };

      this.recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        this.isListening = false;
        this.updateMicBtn();
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.updateMicBtn();
      };
    }
  }

  toggleMicListening() {
    if (!this.recognition) {
      alert("Speech Recognition API not supported in this browser. You can type your responses directly.");
      return;
    }

    const sttEnabled = document.getElementById('chk-enable-stt').checked;
    if (!sttEnabled) {
      alert("Microphone recording is disabled in setup settings.");
      return;
    }

    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    } else {
      this.recognition.start();
      this.isListening = true;
    }
    this.updateMicBtn();
  }

  updateMicBtn() {
    const btn = document.getElementById('btn-toggle-mic');
    if (this.isListening) {
      btn.className = "btn btn-rose";
      btn.innerHTML = `<i data-lucide="mic-off"></i> Stop Recording`;
    } else {
      btn.className = "btn btn-accent";
      btn.innerHTML = `<i data-lucide="mic"></i> Start Mic Recording`;
    }
    if (window.lucide) lucide.createIcons();
  }

  updateMetrics() {
    const val = document.getElementById('candidate-response-input').value.trim();
    const words = val ? val.split(/\s+/).length : 0;
    document.getElementById('resp-word-count').textContent = words;

    const wpm = words > 0 ? Math.min(180, Math.round(words * 1.8)) : 0;
    document.getElementById('resp-wpm').textContent = wpm;

    const badge = document.getElementById('resp-depth-badge');
    if (words > 40) {
      badge.className = "badge badge-success";
      badge.textContent = "Comprehensive";
    } else if (words > 15) {
      badge.className = "badge badge-cyan";
      badge.textContent = "Moderate";
    } else {
      badge.className = "badge badge-warning";
      badge.textContent = "Brief";
    }
  }

  submitAnswer() {
    const text = document.getElementById('candidate-response-input').value.trim();
    const currentQ = this.questions[this.currentQIndex];

    // Evaluate answer keywords match
    let matchCount = 0;
    currentQ.expectedKeywords.forEach(kw => {
      if (text.toLowerCase().includes(kw.toLowerCase())) matchCount++;
    });

    const keywordScore = currentQ.expectedKeywords.length > 0
      ? Math.round((matchCount / currentQ.expectedKeywords.length) * 100)
      : 85;

    const depthScore = Math.min(100, Math.round((text.length / 250) * 100));
    const score = text.length > 0 ? Math.round((keywordScore * 0.6) + (depthScore * 0.4)) : 40;

    this.candidateAnswers.push({
      questionId: currentQ.id,
      title: currentQ.title,
      questionText: currentQ.text,
      responseText: text || "(No verbal or written response provided)",
      score: Math.max(50, Math.min(98, score)),
      matchedKeywords: matchCount,
      totalKeywords: currentQ.expectedKeywords.length
    });

    if (this.isListening && this.recognition) {
      this.recognition.stop();
    }

    this.loadQuestion(this.currentQIndex + 1);
  }

  skipQuestion() {
    document.getElementById('candidate-response-input').value = 'Skipped by candidate';
    this.submitAnswer();
  }

  finishInterview() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    faceEngine.stopMonitoring();

    faceEngine.logAuditIncident("AI Interview Session Completed Successfully", "SUCCESS", "Match: 98.6%");

    // Generate & Display Final Analytics
    analyticsEngine.generateReport(this.candidateAnswers, faceEngine.auditLogs);
    app.switchTab('analytics');
  }
}

const interviewEngine = new InterviewEngine();
