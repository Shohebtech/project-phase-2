/* ==========================================================================
   VERIFACE AI - MAIN APPLICATION CONTROLLER & ROUTER
   ========================================================================== */

class AppController {
  constructor() {
    this.currentTab = 'auth';
    this.activeGradeFilter = 'all';
  }

  init() {
    // Initialize Lucide Icons
    if (window.lucide) {
      lucide.createIcons();
    }

    // Default auto-start scanner loop or load default candidate
    faceEngine.initElements();
    this.loadPresetCandidate('sarah');
  }

  switchTab(tabId) {
    this.currentTab = tabId;

    // Update Nav Step Buttons
    document.querySelectorAll('.step-btn').forEach((btn) => {
      btn.classList.remove('active');
    });

    const stepMap = { 'auth': 1, 'setup': 2, 'interview': 3, 'analytics': 4 };
    const stepNum = stepMap[tabId] || 1;
    document.getElementById(`nav-step-${stepNum}`)?.classList.add('active');

    // Update Tab Panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.remove('active');
    });
    document.getElementById(`tab-${tabId}`)?.classList.add('active');

    // Re-initialize icons
    if (window.lucide) {
      lucide.createIcons();
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  loadPresetCandidate(key) {
    const profile = DEMO_PROFILES[key];
    if (!profile) return;

    document.getElementById('candidate-name').value = profile.name;
    document.getElementById('candidate-id').value = profile.id;

    // Set face demo image
    const demoImg = document.getElementById('demo-avatar-img');
    if (demoImg) {
      demoImg.src = profile.avatar;
    }

    // Set enrolled baseline snapshot
    const enroledImg = document.getElementById('enroled-snapshot-img');
    if (enroledImg) {
      enroledImg.src = profile.avatar;
      enroledImg.classList.remove('hidden');
    }
    document.querySelector('.no-snapshot')?.classList.add('hidden');

    // Populate vector data
    const hashEl = document.getElementById('bio-hash');
    if (hashEl) hashEl.textContent = profile.faceMetrics.contourHash;
    const eyeEl = document.getElementById('bio-eye-dist');
    if (eyeEl) eyeEl.textContent = profile.faceMetrics.eyeDistRatio;
    const symEl = document.getElementById('bio-symmetry');
    if (symEl) symEl.textContent = profile.faceMetrics.symmetryScore;

    const badge = document.getElementById('bio-liveness-badge');
    if (badge) {
      badge.className = 'badge badge-success';
      badge.textContent = profile.faceMetrics.livenessStatus;
    }

    // Auto register template for seamless 1-click test flow
    faceEngine.enroledTemplate = {
      name: profile.name,
      id: profile.id,
      snapshotUrl: profile.avatar,
      contourHash: profile.faceMetrics.contourHash,
      eyeDistRatio: profile.faceMetrics.eyeDistRatio,
      symmetryScore: profile.faceMetrics.symmetryScore,
      enroledAt: new Date().toISOString()
    };

    const verifyBtn = document.getElementById('btn-verify-face');
    if (verifyBtn) verifyBtn.disabled = false;
    const hudLiveness = document.getElementById('hud-liveness');
    if (hudLiveness) {
      hudLiveness.textContent = 'ENROLED';
      hudLiveness.style.color = '#10b981';
    }

    faceEngine.verifyFaceIdentity();
  }

  proceedToSetup() {
    if (!faceEngine.verifiedIdentity) {
      alert('Please verify identity match first.');
      return;
    }
    this.switchTab('setup');
  }

  selectRole(roleKey, cardEl) {
    document.querySelectorAll('.role-card').forEach(card => card.classList.remove('active'));
    if (cardEl) cardEl.classList.add('active');

    if (window.interviewEngine) {
      interviewEngine.setRole(roleKey);
    }

    const roleNames = {
      'fullstack': 'Senior Full-Stack Engineer',
      'ai_engineer': 'AI / ML Systems Engineer',
      'product_mgr': 'Technical Product Manager',
      'devops': 'Cloud & DevOps Architect'
    };

    const roleBadge = document.getElementById('live-role-badge');
    if (roleBadge) {
      roleBadge.textContent = roleNames[roleKey] || 'Software Engineer';
    }
  }
}

// Global App Instance
const app = new AppController();

document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
