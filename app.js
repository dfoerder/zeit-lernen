const numberWords = [
  'null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs',
  'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwölf'
];

const examplesData = {
  '24h': {
    title: '24-Stunden-Format',
    desc: 'Wandle die angezeigte AM/PM-Zeit in das 24-Stunden-Format um.',
    rows: [
      ['3:00 AM', '3:00'],
      ['8:30 AM', '8:30'],
      ['12:00 PM', '12:00'],
      ['3:00 PM', '15:00'],
      ['9:45 PM', '21:45'],
      ['12:00 AM', '0:00'],
    ]
  },
  tageszeit: {
    title: 'Tageszeit bestimmen',
    desc: 'Ordne der angezeigten Uhrzeit die passende Tageszeit zu.',
    rows: [
      ['2:00', 'nachts'],
      ['7:00', 'morgens'],
      ['11:00', 'vormittags'],
      ['12:30', 'mittags'],
      ['16:00', 'nachmittags'],
      ['20:00', 'abends'],
    ]
  },
  umgangssprache: {
    title: 'Umgangssprache',
    desc: 'Drücke die angezeigte Zeit so aus, wie man sie im Alltag sagen würde.',
    rows: [
      ['3:00 PM', 'drei Uhr'],
      ['3:15 PM', 'viertel nach drei'],
      ['3:30 PM', 'halb vier'],
      ['3:45 PM', 'viertel vor vier'],
      ['3:10 PM', 'zehn nach drei'],
      ['3:50 PM', 'zehn vor vier'],
    ]
  }
};

const state = {
  mode: '24h',
  hour: 0,
  minute: 0,
  correct: 0,
  total: 0,
  streak: 0,
  answered: false,
  showingExamples: true
};

function loadScore() {
  try {
    const saved = JSON.parse(localStorage.getItem('zeit-score'));
    if (saved) {
      state.correct = saved.correct || 0;
      state.total = saved.total || 0;
    }
  } catch {}
}

function saveScore() {
  localStorage.setItem('zeit-score', JSON.stringify({
    correct: state.correct,
    total: state.total
  }));
}

function randomTime() {
  const hour = Math.floor(Math.random() * 24);
  const steps = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  const minute = steps[Math.floor(Math.random() * steps.length)];
  return { hour, minute };
}

function formatAMPM(h, m) {
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${period}`;
}

function format24h(h, m) {
  return `${h}:${m.toString().padStart(2, '0')}`;
}

function getTageszeit(h) {
  if (h >= 0 && h < 5) return 'nachts';
  if (h >= 5 && h < 10) return 'morgens';
  if (h >= 10 && h < 12) return 'vormittags';
  if (h >= 12 && h < 14) return 'mittags';
  if (h >= 14 && h < 18) return 'nachmittags';
  if (h >= 18 && h < 22) return 'abends';
  return 'nachts';
}

function hourWord(h) {
  const h12 = h % 12 || 12;
  return numberWords[h12];
}

function nextHourWord(h) {
  const next = (h % 12) + 1;
  return numberWords[next];
}

function getColloquialAnswers(h, m) {
  const answers = [];
  const hw = hourWord(h);
  const nhw = nextHourWord(h);
  const h12 = h % 12 || 12;
  const nh12 = (h % 12) + 1;

  if (m === 0) {
    answers.push(`${hw} uhr`, `${h12} uhr`);
  } else if (m === 5) {
    answers.push(`fünf nach ${hw}`, `fünf nach ${h12}`);
  } else if (m === 10) {
    answers.push(`zehn nach ${hw}`, `zehn nach ${h12}`);
  } else if (m === 15) {
    answers.push(`viertel nach ${hw}`, `viertel nach ${h12}`);
  } else if (m === 20) {
    answers.push(`zwanzig nach ${hw}`, `zwanzig nach ${h12}`);
    answers.push(`zehn vor halb ${nhw}`, `zehn vor halb ${nh12}`);
  } else if (m === 25) {
    answers.push(`fünf vor halb ${nhw}`, `fünf vor halb ${nh12}`);
    answers.push(`fünfundzwanzig nach ${hw}`, `fünfundzwanzig nach ${h12}`);
  } else if (m === 30) {
    answers.push(`halb ${nhw}`, `halb ${nh12}`);
  } else if (m === 35) {
    answers.push(`fünf nach halb ${nhw}`, `fünf nach halb ${nh12}`);
  } else if (m === 40) {
    answers.push(`zwanzig vor ${nhw}`, `zwanzig vor ${nh12}`);
    answers.push(`zehn nach halb ${nhw}`, `zehn nach halb ${nh12}`);
  } else if (m === 45) {
    answers.push(`viertel vor ${nhw}`, `viertel vor ${nh12}`);
    answers.push(`dreiviertel ${nhw}`, `dreiviertel ${nh12}`);
  } else if (m === 50) {
    answers.push(`zehn vor ${nhw}`, `zehn vor ${nh12}`);
  } else if (m === 55) {
    answers.push(`fünf vor ${nhw}`, `fünf vor ${nh12}`);
  }

  return answers;
}

function get24hAnswers(h, m) {
  const answers = [];
  const mStr = m.toString().padStart(2, '0');
  const hPad = h.toString().padStart(2, '0');

  answers.push(`${h}:${mStr}`);
  if (h < 10) answers.push(`${hPad}:${mStr}`);
  answers.push(`${h}.${mStr}`);
  if (h < 10) answers.push(`${hPad}.${mStr}`);
  answers.push(`${h} uhr ${mStr}`);
  answers.push(`${h}:${mStr} uhr`);

  if (m === 0) {
    answers.push(`${h} uhr`);
    if (h < 10) answers.push(`${hPad} uhr`);
    answers.push(`${hPad}:00`);
    answers.push(`${h}:00`);
  }

  return answers;
}

function getTageszeitAnswers(h) {
  const tz = getTageszeit(h);
  const answers = [tz];
  if (h === 4) answers.push('morgens');
  if (h === 9) answers.push('vormittags');
  if (h === 13) answers.push('nachmittags');
  if (h === 17) answers.push('abends');
  if (h === 21) answers.push('nachts');
  return answers;
}

function getValidAnswers() {
  const { hour, minute, mode } = state;
  if (mode === '24h') return get24hAnswers(hour, minute);
  if (mode === 'tageszeit') return getTageszeitAnswers(hour);
  return getColloquialAnswers(hour, minute);
}

function getDisplayAnswers() {
  const { hour, minute, mode } = state;
  if (mode === '24h') {
    const mStr = minute.toString().padStart(2, '0');
    return [`${hour}:${mStr}`, `${hour} Uhr ${mStr}`];
  }
  if (mode === 'tageszeit') {
    return [getTageszeit(hour)];
  }
  const answers = getColloquialAnswers(hour, minute);
  const unique = [...new Set(answers.filter((_, i) => i % 2 === 0))];
  return unique.slice(0, 3);
}

function normalize(str) {
  return str.trim().toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/ü/g, 'ü')
    .replace(/ö/g, 'ö')
    .replace(/ä/g, 'ä');
}

function checkAnswer(input) {
  const clean = normalize(input);
  const valid = getValidAnswers().map(normalize);
  return valid.includes(clean);
}

function drawClock(h, m) {
  const svg = document.getElementById('clock');
  const cx = 100, cy = 100, r = 88;

  let html = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#f8f9fa" stroke="#2c3e50" stroke-width="3"/>`;

  for (let i = 0; i < 60; i++) {
    const angle = (i * 6 - 90) * Math.PI / 180;
    const isHour = i % 5 === 0;
    const r1 = isHour ? 72 : 78;
    const r2 = 83;
    const w = isHour ? 2.5 : 1;
    html += `<line x1="${cx + r1 * Math.cos(angle)}" y1="${cy + r1 * Math.sin(angle)}"
             x2="${cx + r2 * Math.cos(angle)}" y2="${cy + r2 * Math.sin(angle)}"
             stroke="#2c3e50" stroke-width="${w}" stroke-linecap="round"/>`;
  }

  for (let i = 1; i <= 12; i++) {
    const angle = (i * 30 - 90) * Math.PI / 180;
    const tx = cx + 62 * Math.cos(angle);
    const ty = cy + 62 * Math.sin(angle);
    html += `<text x="${tx}" y="${ty}" text-anchor="middle" dominant-baseline="central"
             font-size="14" font-weight="600" fill="#2c3e50">${i}</text>`;
  }

  const mAngle = (m * 6 - 90) * Math.PI / 180;
  html += `<line x1="${cx}" y1="${cy}"
           x2="${cx + 55 * Math.cos(mAngle)}" y2="${cy + 55 * Math.sin(mAngle)}"
           stroke="#2980b9" stroke-width="3" stroke-linecap="round"/>`;

  const hAngle = ((h % 12) * 30 + m * 0.5 - 90) * Math.PI / 180;
  html += `<line x1="${cx}" y1="${cy}"
           x2="${cx + 38 * Math.cos(hAngle)}" y2="${cy + 38 * Math.sin(hAngle)}"
           stroke="#2c3e50" stroke-width="4.5" stroke-linecap="round"/>`;

  html += `<circle cx="${cx}" cy="${cy}" r="4" fill="#2c3e50"/>`;

  svg.innerHTML = html;
}

function updatePrompt() {
  const { hour, minute, mode } = state;
  const prompt = document.getElementById('prompt');

  if (mode === '24h') {
    prompt.textContent = formatAMPM(hour, minute);
  } else if (mode === 'tageszeit') {
    prompt.textContent = format24h(hour, minute);
  } else {
    prompt.textContent = formatAMPM(hour, minute);
  }
}

function updateScore() {
  document.getElementById('score').textContent = `${state.correct} / ${state.total}`;
  const streakEl = document.getElementById('streak');
  streakEl.textContent = state.streak > 1 ? `Serie: ${state.streak}` : '';
}

function showFeedback(isCorrect) {
  const fb = document.getElementById('feedback');
  const va = document.getElementById('valid-answers');
  fb.classList.remove('hidden', 'correct', 'wrong');
  va.classList.add('hidden');

  if (isCorrect) {
    fb.textContent = 'Richtig!';
    fb.classList.add('correct', 'pop');
  } else {
    fb.textContent = 'Nicht ganz.';
    fb.classList.add('wrong', 'shake');
    const display = getDisplayAnswers();
    va.textContent = `Richtige Antworten: ${display.join(', ')}`;
    va.classList.remove('hidden');
  }

  setTimeout(() => fb.classList.remove('pop', 'shake'), 400);
}

function nextRound() {
  const { hour, minute } = randomTime();
  state.hour = hour;
  state.minute = minute;
  state.answered = false;

  drawClock(hour, minute);
  updatePrompt();

  const fb = document.getElementById('feedback');
  const va = document.getElementById('valid-answers');
  fb.classList.add('hidden');
  va.classList.add('hidden');

  const input = document.getElementById('answer');
  input.value = '';
  input.focus();

  const btn = document.getElementById('check-btn');
  btn.textContent = 'Prüfen';
}

function handleCheck() {
  const input = document.getElementById('answer');
  const btn = document.getElementById('check-btn');

  if (state.answered) {
    nextRound();
    return;
  }

  const value = input.value.trim();
  if (!value) {
    input.classList.add('shake');
    setTimeout(() => input.classList.remove('shake'), 400);
    return;
  }

  const isCorrect = checkAnswer(value);
  state.total++;
  if (isCorrect) {
    state.correct++;
    state.streak++;
  } else {
    state.streak = 0;
  }

  state.answered = true;
  showFeedback(isCorrect);
  updateScore();
  saveScore();

  btn.textContent = 'Weiter';
  input.blur();
}

function showExamples() {
  const data = examplesData[state.mode];
  document.getElementById('examples-title').textContent = data.title;
  document.getElementById('examples-desc').textContent = data.desc;

  const table = document.getElementById('examples-table');
  table.innerHTML = data.rows.map(([from, to]) =>
    `<tr><td>${from}</td><td class="arrow">&rarr;</td><td>${to}</td></tr>`
  ).join('');

  state.showingExamples = true;
  document.getElementById('examples').classList.remove('hidden');
  document.getElementById('training').classList.add('hidden');
}

function startTraining() {
  state.showingExamples = false;
  document.getElementById('examples').classList.add('hidden');
  document.getElementById('training').classList.remove('hidden');
  nextRound();
}

function setMode(mode) {
  state.mode = mode;
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('active', t.dataset.mode === mode);
  });

  const input = document.getElementById('answer');
  if (mode === '24h') input.placeholder = 'z.B. 16:30';
  else if (mode === 'tageszeit') input.placeholder = 'z.B. nachmittags';
  else input.placeholder = 'z.B. halb fünf';

  showExamples();
}

document.getElementById('check-btn').addEventListener('click', handleCheck);
document.getElementById('start-btn').addEventListener('click', startTraining);
document.getElementById('examples-btn').addEventListener('click', showExamples);

document.getElementById('answer').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleCheck();
});

document.getElementById('mode-tabs').addEventListener('click', (e) => {
  if (e.target.classList.contains('tab')) {
    setMode(e.target.dataset.mode);
  }
});

loadScore();
updateScore();
showExamples();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}
