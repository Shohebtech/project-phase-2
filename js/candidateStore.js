/* ==========================================================================
   VERIFACE AI - PERSISTENT CANDIDATE DATA STORE ENGINE
   ========================================================================== */

class CandidateStore {
  constructor() {
    this.storageKey = 'veriface_candidates_db';
    this.apiEndpoint = '/api/candidates';
    this.candidates = [];
    this.initStore();
  }

  async initStore() {
    // Load local storage first
    try {
      const localData = localStorage.getItem(this.storageKey);
      if (localData) {
        this.candidates = JSON.parse(localData);
      }
    } catch (e) {
      console.warn('LocalStorage candidate load notice:', e);
      this.candidates = [];
    }

    // Try fetching from server API disk storage if available
    try {
      const res = await fetch(this.apiEndpoint);
      if (res.ok) {
        const serverCandidates = await res.json();
        if (Array.isArray(serverCandidates) && serverCandidates.length > 0) {
          this.candidates = serverCandidates;
          this.syncToLocalStorage();
        }
      }
    } catch (e) {
      // Server API offline, fallback to LocalStorage
    }
  }

  syncToLocalStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.candidates));
    } catch (e) {
      console.warn('LocalStorage quota limit warning:', e);
    }
  }

  async saveCandidate(record) {
    if (!record || !record.id) return;

    // Determine Recommendation Grade
    let recommendation = 'HIRE';
    if (record.scores.overallScore >= 88 && (record.auditLogs || []).length === 0) {
      recommendation = 'STRONG HIRE';
    } else if (record.scores.overallScore < 70 || (record.auditLogs || []).filter(l => l.severity === 'CRITICAL').length > 0) {
      recommendation = 'FLAGGED FOR REVIEW';
    } else if (record.scores.overallScore < 80) {
      recommendation = 'NEUTRAL';
    }

    const candidateRecord = {
      id: record.id,
      sessionGuid: record.sessionGuid || ('GUID-' + Date.now() + '-' + Math.floor(Math.random() * 8999 + 1000)),
      name: record.name || 'Candidate',
      roleKey: record.roleKey || 'fullstack',
      roleTitle: record.roleTitle || 'Software Engineer',
      timestamp: record.timestamp || new Date().toISOString(),
      avatarSnapshot: record.avatarSnapshot || '',
      biometrics: record.biometrics || {},
      scores: record.scores || {},
      answers: record.answers || [],
      auditLogs: record.auditLogs || [],
      recommendation: recommendation
    };

    // Replace if existing, or prepend new record
    const idx = this.candidates.findIndex(c => c.id === candidateRecord.id || c.sessionGuid === candidateRecord.sessionGuid);
    if (idx >= 0) {
      this.candidates[idx] = candidateRecord;
    } else {
      this.candidates.unshift(candidateRecord);
    }

    this.syncToLocalStorage();

    // Send to backend disk server
    try {
      await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(candidateRecord)
      });
    } catch (e) {
      // Disk server notice
    }

    if (window.app && app.currentTab === 'candidates') {
      app.renderCandidateHub();
    }

    return candidateRecord;
  }

  getAllCandidates() {
    return this.candidates;
  }

  getCandidateById(id) {
    return this.candidates.find(c => c.id === id || c.sessionGuid === id);
  }

  async deleteCandidate(id) {
    this.candidates = this.candidates.filter(c => c.id !== id && c.sessionGuid !== id);
    this.syncToLocalStorage();

    try {
      await fetch(${this.apiEndpoint}/, { method: 'DELETE' });
    } catch (e) {}

    if (window.app && app.currentTab === 'candidates') {
      app.renderCandidateHub();
    }
  }

  exportAllJSON() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.candidates, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', VeriFace_Candidates_Backup_.json);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  }

  async importJSON(fileEvent) {
    const file = fileEvent.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (Array.isArray(imported)) {
          for (const item of imported) {
            await this.saveCandidate(item);
          }
          alert(Successfully imported  candidate records.);
        } else if (imported && imported.id) {
          await this.saveCandidate(imported);
          alert(Successfully imported candidate: );
        }
      } catch (err) {
        alert('Failed to parse candidate JSON file.');
      }
    };
    reader.readAsText(file);
  }
}

const candidateStore = new CandidateStore();
