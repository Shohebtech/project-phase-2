/* ==========================================================================
   VERIFACE AI - PDF RESUME PARSER & TEXT EXTRACTION ENGINE
   ========================================================================== */

class ResumeParser {
  constructor() {
    this.pdfjsLib = window['pdfjs-dist/build/pdf'] || window.pdfjsLib;
    if (this.pdfjsLib) {
      this.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
  }

  async parsePdfResume(file) {
    if (!file || file.type !== 'application/pdf') {
      throw new Error('Selected file is not a valid PDF document.');
    }

    const arrayBuffer = await file.arrayBuffer();
    const dataUrl = await this.fileToDataUrl(file);
    
    let fullText = '';
    
    // Ensure PDF.js worker is ready
    if (window.pdfjsLib) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageItems = textContent.items.map(item => item.str);
        fullText += pageItems.join(' ') + '\n';
      }
    } else {
      fullText = 'PDF Text Extraction Engine active.';
    }

    // Extract Metadata using Pattern Matching
    const extracted = this.extractResumeDetails(fullText, file.name);
    extracted.dataUrl = dataUrl;
    extracted.fileName = file.name;
    extracted.fullText = fullText;

    return extracted;
  }

  fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }

  extractResumeDetails(text, fileName) {
    // Extract Email
    const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/i);
    const email = emailMatch ? emailMatch[1] : '';

    // Extract Name (from first few lines or filename)
    let name = '';
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length > 0 && lines[0].length < 40 && !lines[0].includes('@')) {
      name = lines[0];
    } else {
      name = fileName.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
    }

    // Extract Skills (common tech keywords)
    const knownSkills = ['React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'AWS', 'Docker', 'Kubernetes', 'PyTorch', 'TensorFlow', 'PostgreSQL', 'Redis', 'GraphQL', 'System Design', 'GitOps', 'Agile'];
    const matchedSkills = knownSkills.filter(skill => new RegExp('\\b' + skill + '\\b', 'i').test(text));

    return {
      name: name.replace(/[^a-zA-Z\s]/g, '').trim() || 'Candidate',
      email: email,
      skills: matchedSkills,
      summary: lines.slice(0, 5).join(' ')
    };
  }
}

const resumeParser = new ResumeParser();
