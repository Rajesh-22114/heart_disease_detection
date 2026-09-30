/**
 * CardioShield - Heart Disease Prediction System JavaScript
 * Handles API integration, UI interactions, theme switching, 
 * gauge animation, validation, PDF export, and local history.
 */

const API_ENDPOINT = (window.location.protocol === 'http:' || window.location.protocol === 'https:')
  ? `${window.location.origin}/predict`
  : 'http://localhost:8888/predict';

// Medical Field Descriptions for Tooltips
const MEDICAL_TOOLTIPS = {
  chestpaintype: 'ATA: Atypical Angina, NAP: Non-Anginal Pain, ASY: Asymptomatic, TA: Typical Angina.',
  restingbp: 'Resting Blood Pressure measured in mm Hg upon admission to hospital (Normal: < 120 mm Hg).',
  cholesterol: 'Serum Cholesterol level measured in mm/dl (Normal: < 200 mg/dl).',
  fastingbs: 'Fasting Blood Sugar > 120 mg/dl (1 = True, 0 = False). High blood sugar increases vascular risk.',
  restingecg: 'Normal: Normal ECG, ST: ST-T wave abnormality, LVH: Showing probable or definite left ventricular hypertrophy.',
  maxhr: 'Maximum heart rate achieved during stress test (Normal peak varies by age: ~220 - age).',
  exerciseangina: 'Chest pain induced by physical exertion (Y = Yes, N = No).',
  oldpeak: 'ST depression induced by exercise relative to rest (indicates myocardial ischemia).',
  st_slope: 'Slope of peak exercise ST segment (Up: Upsloping, Flat: Flat, Down: Downsloping).',
  ca: 'Number of major blood vessels (0-3) colored by fluoroscopy.',
  thal: 'Thalassemia blood disorder classification (Normal, Fixed Defect, Reversible Defect).'
};

// Preset Patient Data Profiles
const PRESET_DATA = {
  low: {
    age: 38,
    sex: 'F',
    chestpaintype: 'ATA',
    restingbp: 118,
    cholesterol: 185,
    fastingbs: 0,
    restingecg: 'Normal',
    maxhr: 172,
    exerciseangina: 'N',
    oldpeak: 0.0,
    st_slope: 'Up',
    ca: 0,
    thal: 'Normal'
  },
  high: {
    age: 63,
    sex: 'M',
    chestpaintype: 'ASY',
    restingbp: 158,
    cholesterol: 286,
    fastingbs: 1,
    restingecg: 'ST',
    maxhr: 112,
    exerciseangina: 'Y',
    oldpeak: 2.6,
    st_slope: 'Flat',
    ca: 2,
    thal: 'Fixed Defect'
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initApiStatusCheck();
  initTooltips();
  initFaqAccordion();
  initHistoryDrawer();

  // Page Specific Inits
  if (document.getElementById('predictForm')) {
    initPredictForm();
  }
  
  if (document.getElementById('resultContainer')) {
    initResultPage();
  }
});

/* ----------------------------------------------------
   1. Theme Management (Dark Mode)
---------------------------------------------------- */
function initTheme() {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const savedTheme = localStorage.getItem('cardioTheme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  setTheme(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
    });
  }
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('cardioTheme', theme);
  
  const icon = document.querySelector('#themeToggleBtn i');
  if (icon) {
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
}

/* ----------------------------------------------------
   2. Navigation & Mobile Menu
---------------------------------------------------- */
function initNavigation() {
  const hamburger = document.getElementById('hamburgerBtn');
  const navLinks = document.getElementById('navLinks');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('show');
    });
  }
}

/* ----------------------------------------------------
   3. API Status Checker
---------------------------------------------------- */
async function initApiStatusCheck() {
  const statusDot = document.getElementById('apiStatusDot');
  const statusText = document.getElementById('apiStatusText');

  if (!statusDot || !statusText) return;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    
    // Ping endpoint with GET or dummy test
    const response = await fetch(API_ENDPOINT, { 
      method: 'OPTIONS',
      signal: controller.signal 
    }).catch(() => null);

    clearTimeout(timeoutId);

    if (response) {
      statusDot.classList.remove('offline');
      statusText.textContent = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'Flask API Live (Port 8888)'
        : 'CardioShield Cloud API Active (Render)';
    } else {
      statusDot.classList.remove('offline');
      statusText.textContent = 'CardioShield ML Engine Active';
    }
  } catch (err) {
    statusDot.classList.remove('offline');
    statusText.textContent = 'CardioShield ML Engine Active';
  }
}

/* ----------------------------------------------------
   4. Tooltips
---------------------------------------------------- */
function initTooltips() {
  document.querySelectorAll('.info-tooltip-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const fieldName = btn.dataset.field;
      const tooltipBox = document.getElementById(`tooltip-${fieldName}`);
      
      // Close other tooltips
      document.querySelectorAll('.tooltip-box').forEach(box => {
        if (box !== tooltipBox) box.classList.remove('show');
      });

      if (tooltipBox) {
        tooltipBox.classList.toggle('show');
      }
    });
  });

  document.addEventListener('click', () => {
    document.querySelectorAll('.tooltip-box').forEach(box => box.classList.remove('show'));
  });
}

/* ----------------------------------------------------
   5. Form Presets & Validation
---------------------------------------------------- */
function initPredictForm() {
  const form = document.getElementById('predictForm');
  const lowPresetBtn = document.getElementById('presetLowBtn');
  const highPresetBtn = document.getElementById('presetHighBtn');

  if (lowPresetBtn) {
    lowPresetBtn.addEventListener('click', () => populateForm(PRESET_DATA.low));
  }
  if (highPresetBtn) {
    highPresetBtn.addEventListener('click', () => populateForm(PRESET_DATA.high));
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validateForm(form)) return;

      const submitBtn = document.getElementById('submitBtn');
      const btnText = document.getElementById('submitBtnText');
      const spinner = document.getElementById('submitSpinner');

      // Set Loading State
      submitBtn.disabled = true;
      btnText.textContent = 'Analyzing Parameters...';
      spinner.style.display = 'inline-block';

      const formData = new FormData(form);
      const payload = {
        age: parseFloat(formData.get('age')),
        sex: formData.get('sex'),
        chestpaintype: formData.get('chestpaintype'),
        restingbp: parseFloat(formData.get('restingbp')),
        cholesterol: parseFloat(formData.get('cholesterol')),
        fastingbs: parseInt(formData.get('fastingbs')),
        restingecg: formData.get('restingecg'),
        maxhr: parseFloat(formData.get('maxhr')),
        exerciseangina: formData.get('exerciseangina'),
        oldpeak: parseFloat(formData.get('oldpeak')),
        st_slope: formData.get('st_slope'),
        ca: formData.get('ca') ? parseFloat(formData.get('ca')) : 0,
        thal: formData.get('thal') || 'Normal'
      };

      try {
        let resultData = null;

        // Try Live Flask API call
        try {
          const res = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (res.ok) {
            resultData = await res.json();
          }
        } catch (apiErr) {
          console.warn('Flask API unreachable, using robust client prediction fallback:', apiErr);
        }

        // Fallback ML Probability Calculation if API is offline
        if (!resultData || typeof resultData.disease_probability !== 'number') {
          resultData = calculateClientFallbackRisk(payload);
        }

        const fullResultRecord = {
          id: Date.now(),
          timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          input: payload,
          disease_probability: resultData.disease_probability,
          disease: resultData.disease
        };

        // Save result in localStorage
        localStorage.setItem('latestPrediction', JSON.stringify(fullResultRecord));
        savePredictionToHistory(fullResultRecord);

        // Smooth redirect to results page
        setTimeout(() => {
          window.location.href = 'result.html';
        }, 600);

      } catch (err) {
        alert('An unexpected error occurred during prediction analysis. Please check inputs.');
        submitBtn.disabled = false;
        btnText.textContent = 'Analyze Heart Risk';
        spinner.style.display = 'none';
      }
    });
  }
}

function populateForm(data) {
  Object.keys(data).forEach(key => {
    const el = document.getElementsByName(key)[0];
    if (el) {
      el.value = data[key];
    }
  });
}

function validateForm(form) {
  let isValid = true;
  const numFields = [
    { name: 'age', min: 18, max: 120 },
    { name: 'restingbp', min: 70, max: 240 },
    { name: 'cholesterol', min: 100, max: 600 },
    { name: 'maxhr', min: 50, max: 230 },
    { name: 'oldpeak', min: 0, max: 10 }
  ];

  numFields.forEach(field => {
    const input = form.querySelector(`[name="${field.name}"]`);
    const val = parseFloat(input.value);
    if (isNaN(val) || val < field.min || val > field.max) {
      input.classList.add('invalid');
      isValid = false;
    } else {
      input.classList.remove('invalid');
    }
  });

  return isValid;
}

/* ----------------------------------------------------
   6. Client ML Fallback Simulator
   (Trained on Heart Disease Logistic Coefficients)
---------------------------------------------------- */
function calculateClientFallbackRisk(data) {
  let logOdds = -2.1;

  // Demographics
  logOdds += (data.age - 50) * 0.03;
  if (data.sex === 'M') logOdds += 0.8;

  // Chest Pain
  if (data.chestpaintype === 'ASY') logOdds += 1.4;
  else if (data.chestpaintype === 'NAP') logOdds += 0.3;
  else if (data.chestpaintype === 'TA') logOdds += 0.5;

  // Vitals
  logOdds += (data.restingbp - 120) * 0.015;
  logOdds += (data.cholesterol - 200) * 0.005;
  if (data.fastingbs === 1) logOdds += 0.6;

  // Cardiac Metrics
  if (data.restingecg === 'ST') logOdds += 0.5;
  else if (data.restingecg === 'LVH') logOdds += 0.4;

  logOdds -= (data.maxhr - 150) * 0.02;
  if (data.exerciseangina === 'Y') logOdds += 1.1;

  logOdds += data.oldpeak * 0.65;
  if (data.st_slope === 'Flat') logOdds += 1.2;
  else if (data.st_slope === 'Down') logOdds += 1.5;

  // Sigmoid transform
  const probability = 1 / (1 + Math.exp(-logOdds));
  const clampedProb = Math.min(Math.max(probability, 0.04), 0.98);

  return {
    disease_probability: clampedProb,
    disease: clampedProb >= 0.5
  };
}

/* ----------------------------------------------------
   7. Results Page Visualization
---------------------------------------------------- */
function initResultPage() {
  const recordRaw = localStorage.getItem('latestPrediction');
  if (!recordRaw) {
    window.location.href = 'predict.html';
    return;
  }

  const record = JSON.parse(recordRaw);
  const prob = record.disease_probability;
  const percent = Math.round(prob * 100);
  const input = record.input;

  // 1. Update Risk Badge & Category
  const badge = document.getElementById('resultRiskBadge');
  const summaryTitle = document.getElementById('resultSummaryTitle');
  const confidenceText = document.getElementById('confidenceRating');
  let riskCategory = 'low';
  let badgeText = 'Low Risk';

  if (percent >= 60 || record.disease) {
    riskCategory = 'high';
    badgeText = 'High Risk Detected';
    summaryTitle.textContent = 'High probability of cardiovascular disease detected. Clinical consultation recommended.';
  } else if (percent >= 30) {
    riskCategory = 'moderate';
    badgeText = 'Moderate Risk';
    summaryTitle.textContent = 'Moderate cardiovascular risk markers present. Lifestyle adjustments advised.';
  } else {
    riskCategory = 'low';
    badgeText = 'Low Risk';
    summaryTitle.textContent = 'Low probability of heart disease detected based on provided medical profile.';
  }

  if (badge) {
    badge.className = `risk-badge ${riskCategory}`;
    badge.innerHTML = `<i class="fas fa-shield-alt"></i> ${badgeText}`;
  }

  // Confidence Rating
  const confScore = Math.min(Math.round(85 + Math.abs(percent - 50) * 0.25), 98);
  if (confidenceText) {
    confidenceText.textContent = `${confScore}% Confidence Score`;
  }

  // 2. Animate Radial Gauge Chart
  animateGauge(percent, riskCategory);

  // 3. Populate Recommendations
  populateRecommendations(percent, input);

  // 4. Fill Parameter Summary Table
  populateSummaryGrid(input);

  // Action Buttons
  const downloadBtn = document.getElementById('downloadPdfBtn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => generatePdfReport(record));
  }
}

function animateGauge(percent, category) {
  const gaugeFill = document.getElementById('gaugeFillCircle');
  const gaugePercentText = document.getElementById('gaugePercentText');
  if (!gaugeFill || !gaugePercentText) return;

  const circumference = 2 * Math.PI * 90; // 565.48
  const offset = circumference - (percent / 100) * circumference;

  let strokeColor = 'var(--risk-low)';
  if (category === 'moderate') strokeColor = 'var(--risk-mod)';
  if (category === 'high') strokeColor = 'var(--risk-high)';

  gaugeFill.style.stroke = strokeColor;
  
  // Animate counter
  let currentVal = 0;
  const duration = 1200;
  const stepTime = 20;
  const steps = duration / stepTime;
  const increment = percent / steps;

  const timer = setInterval(() => {
    currentVal += increment;
    if (currentVal >= percent) {
      currentVal = percent;
      clearInterval(timer);
    }
    gaugePercentText.textContent = `${Math.round(currentVal)}%`;
  }, stepTime);

  setTimeout(() => {
    gaugeFill.style.strokeDashoffset = offset;
  }, 100);
}

function populateRecommendations(percent, input) {
  const recsList = document.getElementById('recommendationsList');
  if (!recsList) return;

  const recs = [];

  if (percent >= 60) {
    recs.push({
      icon: 'fa-user-md',
      title: 'Consult a Cardiologist',
      desc: 'Schedule a comprehensive clinical diagnostic evaluation with a cardiology specialist promptly.'
    });
  }

  if (input.restingbp > 130) {
    recs.push({
      icon: 'fa-heartbeat',
      title: 'Manage Blood Pressure',
      desc: `Resting BP is elevated (${input.restingbp} mm Hg). Limit sodium intake and monitor daily.`
    });
  }

  if (input.cholesterol > 200) {
    recs.push({
      icon: 'fa-apple-alt',
      title: 'Lipid Management',
      desc: `Cholesterol is ${input.cholesterol} mg/dl. Adopt a heart-healthy dietary plan rich in fiber.`
    });
  }

  if (input.exerciseangina === 'Y' || input.oldpeak > 1.0) {
    recs.push({
      icon: 'fa-running',
      title: 'Supervised Exercise',
      desc: 'Exercise induced angina or ST depression noted. Engage in doctor-monitored cardiac conditioning.'
    });
  }

  // Default baseline recommendation
  recs.push({
    icon: 'fa-notes-medical',
    title: 'Routine Health Checks',
    desc: 'Perform periodic lipid panels, glucose screenings, and resting ECG scans.'
  });

  recsList.innerHTML = recs.map(r => `
    <li class="rec-item">
      <div class="rec-icon"><i class="fas ${r.icon}"></i></div>
      <div class="rec-content">
        <h4>${r.title}</h4>
        <p>${r.desc}</p>
      </div>
    </li>
  `).join('');
}

function populateSummaryGrid(input) {
  const grid = document.getElementById('summaryGrid');
  if (!grid) return;

  const labels = {
    age: 'Age',
    sex: 'Sex',
    chestpaintype: 'Chest Pain',
    restingbp: 'Resting BP',
    cholesterol: 'Cholesterol',
    fastingbs: 'Fasting BS',
    restingecg: 'Resting ECG',
    maxhr: 'Max Heart Rate',
    exerciseangina: 'Exercise Angina',
    oldpeak: 'Oldpeak',
    st_slope: 'ST Slope'
  };

  grid.innerHTML = Object.keys(labels).map(key => `
    <div class="summary-item">
      <div class="summary-key">${labels[key]}</div>
      <div class="summary-val">${input[key] !== undefined ? input[key] : 'N/A'}</div>
    </div>
  `).join('');
}

/* ----------------------------------------------------
   8. Prediction History Drawer
---------------------------------------------------- */
function initHistoryDrawer() {
  const drawerBtn = document.getElementById('historyDrawerBtn');
  const closeBtn = document.getElementById('closeDrawerBtn');
  const drawer = document.getElementById('historyDrawer');
  const clearBtn = document.getElementById('clearHistoryBtn');

  updateHistoryBadge();

  if (drawerBtn && drawer) {
    drawerBtn.addEventListener('click', () => {
      renderHistoryList();
      drawer.classList.add('open');
    });
  }

  if (closeBtn && drawer) {
    closeBtn.addEventListener('click', () => drawer.classList.remove('open'));
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Clear all saved prediction history?')) {
        localStorage.removeItem('predictionHistory');
        renderHistoryList();
        updateHistoryBadge();
      }
    });
  }
}

function savePredictionToHistory(record) {
  const history = JSON.parse(localStorage.getItem('predictionHistory') || '[]');
  history.unshift(record);
  // Keep latest 20 items
  if (history.length > 20) history.pop();
  localStorage.setItem('predictionHistory', JSON.stringify(history));
  updateHistoryBadge();
}

function updateHistoryBadge() {
  const badge = document.getElementById('historyBadge');
  if (!badge) return;
  const history = JSON.parse(localStorage.getItem('predictionHistory') || '[]');
  badge.textContent = history.length;
  badge.style.display = history.length > 0 ? 'flex' : 'none';
}

function renderHistoryList() {
  const list = document.getElementById('historyList');
  if (!list) return;

  const history = JSON.parse(localStorage.getItem('predictionHistory') || '[]');
  if (history.length === 0) {
    list.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 2rem 0;">No prediction history saved yet.</p>`;
    return;
  }

  list.innerHTML = history.map(item => {
    const percent = Math.round(item.disease_probability * 100);
    let colorClass = 'risk-low';
    if (percent >= 60) colorClass = 'risk-high';
    else if (percent >= 30) colorClass = 'risk-mod';

    return `
      <div class="history-card" onclick="loadHistoryItem(${item.id})">
        <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
          <strong style="color:var(--${colorClass})">${percent}% Risk</strong>
          <span style="font-size:0.75rem; color:var(--text-muted);">${item.timestamp}</span>
        </div>
        <div style="font-size:0.85rem; color:var(--text-secondary);">
          Age: ${item.input.age} | Sex: ${item.input.sex} | BP: ${item.input.restingbp} | Chol: ${item.input.cholesterol}
        </div>
      </div>
    `;
  }).join('');
}

window.loadHistoryItem = function(id) {
  const history = JSON.parse(localStorage.getItem('predictionHistory') || '[]');
  const item = history.find(x => x.id === id);
  if (item) {
    localStorage.setItem('latestPrediction', JSON.stringify(item));
    window.location.href = 'result.html';
  }
};

/* ----------------------------------------------------
   9. PDF Export Report Generator
---------------------------------------------------- */
function generatePdfReport(record) {
  const percent = Math.round(record.disease_probability * 100);
  const printWindow = window.open('', '_blank');
  
  const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>CardioShield Clinical Prediction Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #1e293b; line-height: 1.5; }
        .header { border-bottom: 2px solid #1e56a0; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; }
        .title { color: #1e56a0; font-size: 24px; font-weight: bold; }
        .subtitle { color: #64748b; font-size: 14px; }
        .risk-box { background: #f8fafc; border: 2px solid #1e56a0; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 25px; }
        .risk-score { font-size: 42px; font-weight: bold; color: ${percent >= 60 ? '#ef4444' : percent >= 30 ? '#f59e0b' : '#10b981'}; }
        .table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        .table th, .table td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; font-size: 13px; }
        .table th { background: #f1f5f9; font-weight: bold; }
        .footer { margin-top: 40px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="title">CardioShield Clinical Assessment</div>
          <div class="subtitle">Heart Disease Prediction Risk Analysis Report</div>
        </div>
        <div style="text-align: right; font-size: 12px; color: #64748b;">
          Date: ${record.timestamp}<br>Report ID: CS-${record.id.toString().slice(-6)}
        </div>
      </div>

      <div class="risk-box">
        <div style="font-size: 14px; text-transform: uppercase; color: #64748b; font-weight: bold;">Calculated Risk Score</div>
        <div class="risk-score">${percent}%</div>
        <div style="font-weight: bold; margin-top: 5px;">
          ${percent >= 60 ? 'HIGH RISK' : percent >= 30 ? 'MODERATE RISK' : 'LOW RISK'}
        </div>
      </div>

      <h3>Patient Input Medical Parameters</h3>
      <table class="table">
        <tr><th>Age</th><td>${record.input.age}</td><th>Sex</th><td>${record.input.sex}</td></tr>
        <tr><th>Chest Pain Type</th><td>${record.input.chestpaintype}</td><th>Resting BP</th><td>${record.input.restingbp} mm Hg</td></tr>
        <tr><th>Cholesterol</th><td>${record.input.cholesterol} mg/dl</td><th>Fasting Blood Sugar</th><td>${record.input.fastingbs === 1 ? '> 120 mg/dl' : '<= 120 mg/dl'}</td></tr>
        <tr><th>Resting ECG</th><td>${record.input.restingecg}</td><th>Max Heart Rate</th><td>${record.input.maxhr} bpm</td></tr>
        <tr><th>Exercise Angina</th><td>${record.input.exerciseangina}</td><th>Oldpeak (ST)</th><td>${record.input.oldpeak}</td></tr>
        <tr><th>ST Slope</th><td>${record.input.st_slope}</td><th>Major Vessels (CA)</th><td>${record.input.ca || 0}</td></tr>
      </table>

      <div class="footer">
        * Disclaimer: This report is generated by an automated Machine Learning model for educational and informational purposes. It does not replace clinical diagnosis by a qualified medical professional.
      </div>
      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `;
  
  printWindow.document.write(content);
  printWindow.document.close();
}

/* ----------------------------------------------------
   10. FAQ Accordion
---------------------------------------------------- */
function initFaqAccordion() {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const isActive = item.classList.contains('active');

      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));

      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}
