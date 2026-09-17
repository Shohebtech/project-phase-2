/* ==========================================================================
   VERIFACE AI - MAIN APPLICATION CONTROLLER & ROUTER
   ========================================================================== */

class AppController {
  constructor() {
    this.currentTab = 'auth';
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
    document.querySelectorAll('.step-btn').forEach((btn, idx) => {
      btn.classList.remove('active');
    });

    const stepMap = { 'auth': 1, 'setup': 2, 'interview': 3, 'analytics': 4, 'candidates': 5 };
    const stepNum = stepMap[tabId] || 1;
    document.getElementById(`nav-step-${stepNum}`)?.classList.add('active');

    // Update Tab Panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.remove('active');
    });
    document.getElementById(`tab-${tabId}`)?.classList.add('active');

    if (tabId === 'candidates') {
      this.renderCandidateHub();
    }

    // Re-initialize icons
    if (window.lucide) {
      lucide.createIcons();
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  currentPdfResume = null;

  async handlePdfResumeUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const statusBadge = document.getElementById('pdf-resume-status-badge');
    if (statusBadge) {
      statusBadge.innerHTML = `<span class="text-cyan"><i data-lucide="loader" class="spin"></i> Parsing PDF Resume text & metadata...</span>`;
      if (window.lucide) lucide.createIcons();
    }

    try {
      const parsed = await resumeParser.parsePdfResume(file);
      this.currentPdfResume = parsed;

      // Auto-fill Name & ID
      if (parsed.name && parsed.name !== 'Candidate') {
        document.getElementById('candidate-name').value = parsed.name;
      }
      if (!document.getElementById('candidate-id').value || document.getElementById('candidate-id').value === 'CAND-89420-US') {
        document.getElementById('candidate-id').value = 'CAND-' + Math.floor(Math.random() * 89999 + 10000) + '-US';
      }

      if (statusBadge) {
        statusBadge.innerHTML = `
          <span class="text-emerald font-bold">
            <i data-lucide="check-circle"></i> Attached PDF: ${file.name}
          </span>
          <br>
          <span class="text-muted" style="font-size:0.75rem;">Skills Detected: ${parsed.skills.join(', ') || 'General Engineering'}</span>
        `;
        if (window.lucide) lucide.createIcons();
      }

      // Attach to current faceEngine enroled template if exists
      if (window.faceEngine) {
        faceEngine.enroledTemplate = faceEngine.enroledTemplate || {};
        faceEngine.enroledTemplate.name = parsed.name || faceEngine.enroledTemplate.name;
        faceEngine.enroledTemplate.resumePdfDataUrl = parsed.dataUrl;
        faceEngine.enroledTemplate.resumeSkills = parsed.skills;
        faceEngine.enroledTemplate.resumeText = parsed.summary;
      }
    } catch (err) {
      console.error('PDF parsing error:', err);
      if (statusBadge) {
        statusBadge.innerHTML = `<span class="text-amber"><i data-lucide="alert-triangle"></i> Failed to parse PDF text. Document attached as raw PDF.</span>`;
        if (window.lucide) lucide.createIcons();
      }
    }
  }

  activeGradeFilter = 'all';

  setGradeFilter(grade, btnEl) {
    this.activeGradeFilter = grade;
    document.querySelectorAll('.chip-filter-row .chip').forEach(c => c.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    this.filterCandidates();
  }

  filterCandidates() {
    this.renderCandidateHub();
  }

  renderCandidateHub() {
    const container = document.getElementById('candidate-grid-container');
    if (!container || !window.candidateStore) return;

    const query = (document.getElementById('cand-search-input')?.value || '').toLowerCase();
    const roleFilter = document.getElementById('cand-role-select')?.value || 'all';

    let list = candidateStore.getAllCandidates();

    // Filter by query
    if (query) {
      list = list.filter(c => (c.name || '').toLowerCase().includes(query) || (c.id || '').toLowerCase().includes(query));
    }

    // Filter by role
    if (roleFilter !== 'all') {
      list = list.filter(c => c.roleKey === roleFilter);
    }

    // Filter by grade
    if (this.activeGradeFilter !== 'all') {
      list = list.filter(c => c.recommendation === this.activeGradeFilter);
    }

    container.innerHTML = '';

    if (list.length === 0) {
      container.innerHTML = `
        <div class="card glass-card empty-cand-card text-center">
          <i data-lucide="user-x" class="empty-icon text-muted"></i>
          <h4>No Candidate Records Found</h4>
          <p class="subtitle">Complete an interview session or click "Import JSON" to populate candidate records.</p>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    list.forEach(c => {
      const card = document.createElement('div');
      card.className = 'card glass-card cand-card';
      
      const badgeClass = c.recommendation === 'STRONG HIRE' ? 'badge-success' :
                        (c.recommendation === 'HIRE' ? 'badge-cyan' :
                        (c.recommendation === 'NEUTRAL' ? 'badge-warning' : 'badge-rose'));

      const avatar = c.avatarSnapshot || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80';
      const score = (c.scores && c.scores.overallScore) ? c.scores.overallScore : 88;
      const faceMatch = (c.biometrics && c.biometrics.faceMatchScore) ? c.biometrics.faceMatchScore : '98.4%';
      const lipSync = (c.scores && c.scores.lipSyncMatchScore) ? c.scores.lipSyncMatchScore : '99.4%';

      card.innerHTML = `
        <div class="cand-card-header">
          <img src="${avatar}" alt="${c.name}" class="cand-avatar">
          <div class="cand-info">
            <h4>${c.name}</h4>
            <span class="cand-id font-mono">${c.id}</span>
            <span class="cand-role badge badge-secondary">${c.roleTitle || 'Software Engineer'}</span>
          </div>
          <span class="badge ${badgeClass} cand-rec-badge">${c.recommendation}</span>
        </div>

        <div class="cand-card-body">
          <div class="cand-stat-pill">
            <span class="lbl">AI SCORE</span>
            <span class="val text-cyan font-bold">${score}/100</span>
          </div>
          <div class="cand-stat-pill">
            <span class="lbl">FACE MATCH</span>
            <span class="val text-emerald font-bold">${faceMatch}</span>
          </div>
          <div class="cand-stat-pill">
            <span class="lbl">LIP SYNC</span>
            <span class="val text-purple font-bold">${lipSync}%</span>
          </div>
        </div>

        <div class="cand-card-footer flex-between">
          <span class="cand-date text-muted"><i data-lucide="clock"></i> ${new Date(c.timestamp).toLocaleDateString()}</span>
          <div class="card-btn-group">
            <button class="btn btn-secondary btn-sm" onclick="app.openCandidateModal('${c.id}')">
              <i data-lucide="eye"></i> View Report
            </button>
            <button class="btn btn-danger-icon btn-sm" onclick="candidateStore.deleteCandidate('${c.id}')" title="Delete Candidate">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        </div>
      `;
      container.appendChild(card);
    });

    if (window.lucide) lucide.createIcons();
  }

  openCandidateModal(candId) {
    const candidate = candidateStore.getCandidateById(candId);
    if (!candidate) return;

    document.getElementById('modal-cand-name').textContent = candidate.name;
    document.getElementById('modal-cand-meta').textContent = `${candidate.roleTitle} | ID: ${candidate.id} | Date: ${new Date(candidate.timestamp).toLocaleString()}`;

    const body = document.getElementById('modal-cand-body');
    if (!body) return;

    const answersHtml = (candidate.answers || []).map((q, idx) => `
      <div class="q-eval-item" style="margin-bottom: 0.75rem;">
        <div class="q-eval-header">
          <div class="q-eval-title">Q${idx + 1}: ${q.title}</div>
          <div class="q-eval-scores">
            <span class="badge ${q.score > 80 ? 'badge-success' : 'badge-warning'}">Score: ${q.score}%</span>
          </div>
        </div>
        <div class="q-eval-body">
          <p><strong>Candidate Transcript:</strong> "${q.responseText}"</p>
        </div>
      </div>
    `).join('');

    const auditHtml = (candidate.auditLogs || []).map(log => `
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.8rem;">
        <td class="font-mono text-cyan" style="padding: 0.4rem;">${log.time}</td>
        <td style="padding: 0.4rem;"><span class="badge ${log.severity === 'CRITICAL' ? 'badge-rose' : 'badge-warning'}">${log.severity}</span></td>
        <td style="padding: 0.4rem;">${log.msg}</td>
      </tr>
    `).join('');

    let pdfSectionHtml = '';
    if (candidate.resumePdfDataUrl) {
      pdfSectionHtml = `
        <h4 style="margin-top: 1.25rem; margin-bottom: 0.75rem; color: var(--accent-cyan);">
          <i data-lucide="file-text"></i> Attached PDF Candidate Resume
        </h4>
        <div style="background: rgba(0,0,0,0.4); padding: 1rem; border-radius: 12px; border: 1px solid var(--bg-card-border);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <span style="font-size: 0.85rem; color: var(--text-secondary);"><i data-lucide="check-circle" class="text-emerald"></i> PDF Document Embedded</span>
            <a href="${candidate.resumePdfDataUrl}" download="${candidate.name.replace(/\s+/g, '_')}_Resume.pdf" class="btn btn-accent btn-sm">
              <i data-lucide="download"></i> Download PDF Resume
            </a>
          </div>
          <iframe src="${candidate.resumePdfDataUrl}" style="width: 100%; height: 260px; border: none; border-radius: 8px;"></iframe>
        </div>
      `;
    }

    body.innerHTML = `
      <div class="modal-detail-grid" style="display: grid; grid-template-columns: 220px 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
        <div class="cand-snapshot-col text-center">
          <img src="${candidate.avatarSnapshot}" style="width: 100%; height: 180px; object-fit: cover; border-radius: 12px; border: 2px solid var(--accent-cyan-glow);">
          <div style="margin-top: 0.75rem;">
            <span class="badge ${candidate.recommendation === 'STRONG HIRE' ? 'badge-success' : 'badge-cyan'}">${candidate.recommendation}</span>
          </div>
        </div>

        <div class="cand-metrics-col">
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-bottom: 1rem;">
            <div class="card glass-card" style="padding: 0.75rem; text-align: center;">
              <span style="font-size: 0.7rem; color: var(--text-muted);">OVERALL SCORE</span>
              <div style="font-size: 1.4rem; font-weight: 800; color: var(--accent-cyan);">${candidate.scores.overallScore}/100</div>
            </div>
            <div class="card glass-card" style="padding: 0.75rem; text-align: center;">
              <span style="font-size: 0.7rem; color: var(--text-muted);">TECH COMPETENCY</span>
              <div style="font-size: 1.4rem; font-weight: 800; color: var(--accent-emerald);">${candidate.scores.technicalScore}%</div>
            </div>
            <div class="card glass-card" style="padding: 0.75rem; text-align: center;">
              <span style="font-size: 0.7rem; color: var(--text-muted);">LIP SYNC MATCH</span>
              <div style="font-size: 1.4rem; font-weight: 800; color: var(--accent-purple);">${candidate.scores.lipSyncMatchScore}%</div>
            </div>
          </div>

          <div class="bio-vector-stats">
            <div class="bio-row"><span class="bio-label">Face Contour Hash:</span><span class="bio-val font-mono">${candidate.biometrics.contourHash || '--'}</span></div>
            <div class="bio-row"><span class="bio-label">Eye Distance Ratio:</span><span class="bio-val font-mono">${candidate.biometrics.eyeDistRatio || '--'}</span></div>
            <div class="bio-row"><span class="bio-label">Symmetry Score:</span><span class="bio-val font-mono">${candidate.biometrics.symmetryScore || '--'}</span></div>
          </div>
        </div>
      </div>

      ${pdfSectionHtml}

      <h4 style="margin-top: 1.25rem; margin-bottom: 0.75rem; color: var(--accent-cyan);"><i data-lucide="list-checks"></i> Question Responses & Transcripts</h4>
      <div>${answersHtml || '<p class="text-muted">No answers recorded.</p>'}</div>

      <h4 style="margin-top: 1.25rem; margin-bottom: 0.75rem; color: var(--accent-purple);"><i data-lucide="shield"></i> Biometric Integrity & Audit Incidents</h4>
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="color: var(--text-muted); font-size: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1);">
            <th style="padding: 0.4rem;">Timestamp</th>
            <th style="padding: 0.4rem;">Severity</th>
            <th style="padding: 0.4rem;">Incident Flag</th>
          </tr>
        </thead>
        <tbody>
          ${auditHtml || '<tr><td colspan="3" class="text-muted" style="padding: 0.5rem;">No security violations detected. Clean exam session.</td></tr>'}
        </tbody>
      </table>
    `;

    document.getElementById('candidate-detail-modal')?.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
  }

  closeCandidateModal() {
    document.getElementById('candidate-detail-modal')?.classList.add('hidden');
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
    enroledImg.src = profile.avatar;
    enroledImg.classList.remove('hidden');
    document.querySelector('.no-snapshot')?.classList.add('hidden');

    // Populate vector data
    document.getElementById('bio-hash').textContent = profile.faceMetrics.contourHash;
    document.getElementById('bio-eye-dist').textContent = profile.faceMetrics.eyeDistRatio;
    document.getElementById('bio-symmetry').textContent = profile.faceMetrics.symmetryScore;

    const badge = document.getElementById('bio-liveness-badge');
    badge.className = "badge badge-success";
    badge.textContent = profile.faceMetrics.livenessStatus;

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

    document.getElementById('btn-verify-face').disabled = false;
    document.getElementById('hud-liveness').textContent = "ENROLED";
    document.getElementById('hud-liveness').style.color = "#10b981";

    faceEngine.verifyFaceIdentity();
  }

  proceedToSetup() {
    if (!faceEngine.verifiedIdentity) {
      alert("Please verify identity match first.");
      return;
    }
    this.switchTab('setup');
  }

  selectRole(roleKey, cardEl) {
    document.querySelectorAll('.role-card').forEach(card => card.classList.remove('active'));
    cardEl.classList.add('active');

    interviewEngine.setRole(roleKey);

    const roleNames = {
      'fullstack': 'Senior Full-Stack Engineer',
      'ai_engineer': 'AI / ML Systems Engineer',
      'product_mgr': 'Technical Product Manager',
      'devops': 'Cloud & DevOps Architect'
    };

    document.getElementById('live-role-badge').textContent = roleNames[roleKey] || 'Software Engineer';
  }
}

// Global App Instance
const app = new AppController();

document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
