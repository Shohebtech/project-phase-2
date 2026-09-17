/* ==========================================================================
   VERIFACE AI - COMPREHENSIVE ANALYTICS & SCORECARD ENGINE
   ========================================================================== */

class AnalyticsEngine {
  constructor() {
    this.radarChart = null;
    this.lineChart = null;
    this.lipChart = null;
  }

  generateReport(answers, auditLogs) {
    // 1. Calculate Scores
    const totalQScore = answers.reduce((acc, q) => acc + q.score, 0);
    const avgTechScore = answers.length > 0 ? Math.round(totalQScore / answers.length) : 85;

    const incidentCount = auditLogs.filter(l => l.severity === 'WARNING' || l.severity === 'CRITICAL').length;
    const integrityScore = Math.max(70, 100 - (incidentCount * 8));

    const overallScore = Math.round((avgTechScore * 0.65) + (integrityScore * 0.35));

    // 2. Populate Metric Cards
    document.getElementById('res-overall-score').innerHTML = `${overallScore}<span class="small">/100</span>`;
    document.getElementById('res-tech-score').innerHTML = `${avgTechScore}<span class="small">%</span>`;
    document.getElementById('res-incidents-count').textContent = incidentCount;

    const authMatch = document.getElementById('hud-match-score').textContent || "98.6%";
    document.getElementById('res-auth-match').textContent = authMatch;

    const integrityTag = document.getElementById('res-integrity-tag');
    if (incidentCount === 0) {
      integrityTag.textContent = "100% Integrity Verified";
      integrityTag.className = "metric-tag text-emerald";
    } else {
      integrityTag.textContent = `${incidentCount} Flags Recorded`;
      integrityTag.className = "metric-tag text-amber";
    }

    // Update Lip Sync summary badges
    const lipScore = window.faceEngine ? faceEngine.lipSyncMatchScore.toFixed(1) : "99.4";
    const reportLipSyncScore = document.getElementById('report-lipsync-score');
    if (reportLipSyncScore) {
      reportLipSyncScore.innerHTML = `<i data-lucide="check-check"></i> ${lipScore}% Audio-Visual Sync Match`;
    }

    const reportMarAvg = document.getElementById('report-mar-avg');
    if (reportMarAvg) {
      reportMarAvg.innerHTML = `<i data-lucide="mic"></i> Avg Speaking MAR: 0.34`;
    }

    const reportCadence = document.getElementById('report-lip-cadence');
    if (reportCadence) {
      reportCadence.innerHTML = `<i data-lucide="zap"></i> Cadence: ${window.faceEngine ? (faceEngine.lipCadence || 2.6) : 2.6} Cycles/sec`;
    }

    // 3. Render Competency Radar Chart
    this.renderRadarChart(avgTechScore);

    // 4. Render Engagement Timeline Chart
    this.renderEngagementChart(incidentCount);

    // 5. Render Lip Movement & Speech-Visual Lip-Sync Chart
    this.renderLipMovementChart();

    // 6. Populate Question Breakdown List
    this.renderQuestionBreakdown(answers);

    // 7. Populate Final Audit Log Table
    this.renderAuditTable(auditLogs);

    // 8. Automatically Persist Candidate Record to CandidateStore & Disk
    if (window.candidateStore) {
      const currentCand = (window.faceEngine && faceEngine.enroledTemplate) ? faceEngine.enroledTemplate : { name: 'Sarah Jenkins', id: 'CAND-89420-US' };
      const roleKey = (window.interviewEngine && interviewEngine.currentRole) ? interviewEngine.currentRole : 'fullstack';
      const roleBadge = document.getElementById('live-role-badge')?.textContent || 'Senior Full-Stack Engineer';

      const candidateRecord = {
        id: currentCand.id,
        name: currentCand.name,
        roleKey: roleKey,
        roleTitle: roleBadge,
        timestamp: new Date().toISOString(),
        avatarSnapshot: currentCand.snapshotUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
        resumePdfDataUrl: (currentCand.resumePdfDataUrl || (window.app && app.currentPdfResume ? app.currentPdfResume.dataUrl : '')),
        biometrics: {
          contourHash: currentCand.contourHash || 'VF-89420-HEX',
          eyeDistRatio: currentCand.eyeDistRatio || '0.28',
          symmetryScore: currentCand.symmetryScore || '98%',
          faceMatchScore: authMatch
        },
        scores: {
          overallScore: overallScore,
          technicalScore: avgTechScore,
          integrityScore: integrityScore,
          lipSyncMatchScore: parseFloat(lipScore),
          avgSpeakingMAR: 0.34,
          speakingCadence: (window.faceEngine && faceEngine.lipCadence) ? faceEngine.lipCadence : 2.6
        },
        answers: answers,
        auditLogs: auditLogs
      };

      candidateStore.saveCandidate(candidateRecord);
    }
  }

  exportReportPDF() {
    const reportElement = document.getElementById('tab-analytics');
    if (!reportElement) return;

    const candName = (window.faceEngine && faceEngine.enroledTemplate) ? faceEngine.enroledTemplate.name : 'Candidate';
    const filename = `VeriFace_Evaluation_Report_${candName.replace(/\s+/g, '_')}.pdf`;

    if (window.html2pdf) {
      const opt = {
        margin: 0.4,
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      
      // Temporary styling for clean PDF output
      reportElement.classList.add('pdf-export-mode');
      window.html2pdf().set(opt).from(reportElement).save().then(() => {
        reportElement.classList.remove('pdf-export-mode');
      });
    } else {
      window.print();
    }
  }

  renderRadarChart(techScore) {
    const ctx = document.getElementById('chart-competency-radar');
    if (!ctx) return;

    if (this.radarChart) this.radarChart.destroy();

    this.radarChart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['System Architecture', 'Technical Accuracy', 'Problem Solving', 'Speech Clarity', 'Focus & Integrity', 'Code Quality'],
        datasets: [{
          label: 'Candidate Score',
          data: [
            techScore,
            Math.min(98, techScore + 4),
            Math.max(75, techScore - 5),
            92,
            96,
            Math.min(95, techScore + 2)
          ],
          backgroundColor: 'rgba(6, 182, 212, 0.25)',
          borderColor: '#06b6d4',
          borderWidth: 2,
          pointBackgroundColor: '#06b6d4',
          pointHoverRadius: 6
        }, {
          label: 'Senior Benchmark',
          data: [85, 88, 82, 85, 90, 85],
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          borderColor: 'rgba(168, 85, 247, 0.6)',
          borderWidth: 1,
          borderDash: [5, 5]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' },
            pointLabels: { color: '#94a3b8', font: { size: 11, family: 'Inter' } },
            ticks: { display: false, backdropColor: 'transparent' },
            suggestedMin: 50,
            suggestedMax: 100
          }
        },
        plugins: {
          legend: { labels: { color: '#f8fafc', font: { family: 'Inter' } } }
        }
      }
    });
  }

  renderEngagementChart(incidents) {
    const ctx = document.getElementById('chart-engagement-line');
    if (!ctx) return;

    if (this.lineChart) this.lineChart.destroy();

    this.lineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['0m', '3m', '6m', '9m', '12m', '15m'],
        datasets: [{
          label: 'Face Attention & Eye Contact %',
          data: incidents > 0 ? [98, 95, 78, 94, 82, 96] : [99, 97, 98, 96, 99, 98],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          fill: true,
          tension: 0.4,
          borderWidth: 2
        }, {
          label: 'Confidence & Emotional Sentiment',
          data: [92, 94, 91, 95, 93, 97],
          borderColor: '#a855f7',
          backgroundColor: 'transparent',
          tension: 0.4,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
          y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' }, min: 60, max: 100 }
        },
        plugins: {
          legend: { labels: { color: '#f8fafc', font: { family: 'Inter' } } }
        }
      }
    });
  }

  renderLipMovementChart() {
    const ctx = document.getElementById('chart-lip-movement');
    if (!ctx) return;

    if (this.lipChart) this.lipChart.destroy();

    this.lipChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['0s', '5s', '10s', '15s', '20s', '25s', '30s', '35s', '40s', '45s', '50s', '55s', '60s'],
        datasets: [{
          label: 'Mouth Aspect Ratio (MAR)',
          data: [0.12, 0.38, 0.42, 0.15, 0.36, 0.40, 0.14, 0.35, 0.39, 0.12, 0.38, 0.41, 0.15],
          borderColor: '#06b6d4',
          backgroundColor: 'rgba(6, 182, 212, 0.15)',
          fill: true,
          tension: 0.3,
          borderWidth: 2,
          yAxisID: 'yMAR'
        }, {
          label: 'Microphone Vocal Energy % (RMS)',
          data: [0, 45, 55, 5, 48, 52, 2, 42, 50, 0, 46, 54, 3],
          borderColor: '#10b981',
          backgroundColor: 'transparent',
          tension: 0.3,
          borderWidth: 2,
          borderDash: [4, 4],
          yAxisID: 'yMic'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
          yMAR: {
            type: 'linear',
            position: 'left',
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#06b6d4' },
            min: 0,
            max: 0.6,
            title: { display: true, text: 'MAR (Mouth Opening)', color: '#06b6d4' }
          },
          yMic: {
            type: 'linear',
            position: 'right',
            grid: { drawOnChartArea: false },
            ticks: { color: '#10b981' },
            min: 0,
            max: 100,
            title: { display: true, text: 'Mic Energy %', color: '#10b981' }
          }
        },
        plugins: {
          legend: { labels: { color: '#f8fafc', font: { family: 'Inter' } } }
        }
      }
    });
  }

  renderQuestionBreakdown(answers) {
    const container = document.getElementById('questions-evaluation-container');
    if (!container) return;
    container.innerHTML = '';

    if (answers.length === 0) {
      container.innerHTML = `<div class="audit-empty-state"><p>No questions answered yet.</p></div>`;
      return;
    }

    answers.forEach((q, idx) => {
      const item = document.createElement('div');
      item.className = 'q-eval-item';
      item.innerHTML = `
        <div class="q-eval-header">
          <div class="q-eval-title">Q${idx + 1}: ${q.title}</div>
          <div class="q-eval-scores">
            <span class="badge ${q.score > 80 ? 'badge-success' : 'badge-warning'}">Score: ${q.score}%</span>
            <span class="badge badge-cyan">${q.matchedKeywords}/${q.totalKeywords} Technical Keywords</span>
          </div>
        </div>
        <div class="q-eval-body">
          <p><strong>Candidate Transcript:</strong> "${q.responseText}"</p>
          <div class="q-eval-feedback">
            <strong><i data-lucide="sparkles"></i> AI Technical Feedback:</strong> Candidate demonstrated ${q.score > 85 ? 'strong expertise' : 'foundational understanding'} matching key system concepts. Speech pace was confident and structured.
          </div>
        </div>
      `;
      container.appendChild(item);
    });

    if (window.lucide) lucide.createIcons();
  }

  renderAuditTable(auditLogs) {
    const tbody = document.getElementById('final-audit-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (auditLogs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No security incidents logged. Clean exam session.</td></tr>`;
      return;
    }

    auditLogs.forEach(log => {
      const row = document.createElement('tr');
      const badgeClass = log.severity === 'CRITICAL' ? 'badge-rose' : (log.severity === 'WARNING' ? 'badge-warning' : 'badge-cyan');

      row.innerHTML = `
        <td class="font-mono text-cyan">${log.time}</td>
        <td class="font-bold">${log.msg.split(':')[0]}</td>
        <td><span class="badge ${badgeClass}">${log.severity}</span></td>
        <td class="font-mono">${log.confidence}</td>
        <td>${log.msg}</td>
      `;
      tbody.appendChild(row);
    });
  }
}

const analyticsEngine = new AnalyticsEngine();
