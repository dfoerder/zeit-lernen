const numberWords = [
  'null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs',
  'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwölf'
];

const ITEM_HEIGHT = 38;

const examplesData = {
  '24h': {
    title: '24-Stunden-Format',
    desc: 'Wandle zwischen 12-Stunden- und 24-Stunden-Format um – in beide Richtungen.',
    rows: [
      ['3:00 morgens', '3:00'],
      ['10:30 vormittags', '10:30'],
      ['12:00 mittags', '12:00'],
      ['3:00 nachmittags', '15:00'],
      ['9:45 abends', '21:45'],
      ['12:00 nachts', '0:00'],
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
    desc: 'Wandle zwischen Uhrzeit und Alltagssprache um – in beide Richtungen.',
    rows: [
      ['3:00 nachmittags', 'drei Uhr'],
      ['3:15 nachmittags', 'viertel nach drei'],
      ['3:30 nachmittags', 'halb vier'],
      ['3:45 nachmittags', 'viertel vor vier'],
      ['3:10 nachmittags', 'zehn nach drei'],
      ['3:50 nachmittags', 'zehn vor vier'],
    ]
  }
};

const pickerConfigs = {
  '24h': {
    wheels: [
      { items: Array.from({length: 24}, (_, i) => ({ label: String(i), value: String(i) })) },
      { separator: ':' },
      { items: [0,5,10,15,20,25,30,35,40,45,50,55].map(m => ({ label: String(m).padStart(2,'0'), value: String(m).padStart(2,'0') })) }
    ],
    getAnswer(values) { return `${values[0]}:${values[1]}`; }
  },
  tageszeit: {
    wheels: [
      { items: ['morgens','vormittags','mittags','nachmittags','abends','nachts'].map(t => ({ label: t, value: t })) }
    ],
    getAnswer(values) { return values[0]; }
  },
  umgangssprache: {
    wheels: [
      { items: [
        { label: 'fünf nach', value: 'fünf nach' },
        { label: 'zehn nach', value: 'zehn nach' },
        { label: 'viertel nach', value: 'viertel nach' },
        { label: 'zwanzig nach', value: 'zwanzig nach' },
        { label: 'fünf vor halb', value: 'fünf vor halb' },
        { label: 'halb', value: 'halb' },
        { label: 'fünf nach halb', value: 'fünf nach halb' },
        { label: 'zwanzig vor', value: 'zwanzig vor' },
        { label: 'viertel vor', value: 'viertel vor' },
        { label: 'zehn vor', value: 'zehn vor' },
        { label: 'fünf vor', value: 'fünf vor' },
      ]},
      { items: numberWords.slice(1).map(w => ({ label: w, value: w })) }
    ],
    getAnswer(values) {
      return `${values[0]} ${values[1]}`;
    }
  }
};

const minuteItems = [0,5,10,15,20,25,30,35,40,45,50,55].map(m => ({
  label: String(m).padStart(2,'0'), value: String(m).padStart(2,'0')
}));

const reversePickerConfigs = {
  '24h': {
    wheels: [
      { items: Array.from({length: 12}, (_, i) => ({ label: String(i+1), value: String(i+1) })) },
      { separator: ':' },
      { items: minuteItems },
      { items: ['morgens','vormittags','mittags','nachmittags','abends','nachts'].map(t => ({ label: t, value: t })) }
    ],
    getAnswer(values) { return `${values[0]}:${values[1]} ${values[2]}`; }
  },
  umgangssprache: {
    wheels: [
      { items: Array.from({length: 12}, (_, i) => ({ label: String(i+1), value: String(i+1) })) },
      { separator: ':' },
      { items: minuteItems }
    ],
    getAnswer(values) { return `${values[0]}:${values[1]}`; }
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
  showingExamples: true,
  questionCount: 0,
  useTyping: false,
  reverse: false,
  wheels: []
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

function format24h(h, m) {
  return `${h}:${m.toString().padStart(2, '0')}`;
}

function format12hTageszeit(h, m) {
  const h12 = h % 12 || 12;
  const mStr = m.toString().padStart(2, '0');
  const tz = getTageszeit(h);
  return `${h12}:${mStr} ${tz}`;
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

function getTageszeit12hAnswers(h, m) {
  const answers = [];
  const h12 = h % 12 || 12;
  const mStr = m.toString().padStart(2, '0');

  const tageszeiten = [getTageszeit(h)];
  if (h === 4) tageszeiten.push('morgens');
  if (h === 9) tageszeiten.push('vormittags');
  if (h === 13) tageszeiten.push('nachmittags');
  if (h === 17) tageszeiten.push('abends');
  if (h === 21) tageszeiten.push('nachts');

  for (const tz of tageszeiten) {
    answers.push(`${h12}:${mStr} ${tz}`);
    answers.push(`${h12}.${mStr} ${tz}`);
    if (m === 0) {
      answers.push(`${h12} ${tz}`);
      answers.push(`${h12}:00 ${tz}`);
    }
  }
  return answers;
}

function get12hAnswers(h, m) {
  const answers = [];
  const h12 = h % 12 || 12;
  const mStr = m.toString().padStart(2, '0');

  answers.push(`${h12}:${mStr}`);
  answers.push(`${h12}.${mStr}`);
  if (m === 0) {
    answers.push(`${h12}:00`);
    answers.push(`${h12}`);
  }
  return answers;
}

function getValidAnswers() {
  const { hour, minute, mode, reverse } = state;
  if (mode === '24h') return reverse ? getTageszeit12hAnswers(hour, minute) : get24hAnswers(hour, minute);
  if (mode === 'tageszeit') return getTageszeitAnswers(hour);
  return reverse ? get12hAnswers(hour, minute) : getColloquialAnswers(hour, minute);
}

function getDisplayAnswers() {
  const { hour, minute, mode, reverse } = state;
  if (mode === '24h') {
    if (reverse) {
      return [format12hTageszeit(hour, minute)];
    }
    const mStr = minute.toString().padStart(2, '0');
    return [`${hour}:${mStr}`, `${hour} Uhr ${mStr}`];
  }
  if (mode === 'tageszeit') {
    return [getTageszeit(hour)];
  }
  if (reverse) {
    const h12 = hour % 12 || 12;
    const mStr = minute.toString().padStart(2, '0');
    return [`${h12}:${mStr}`];
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

// --- Picker ---

function createWheel(items) {
  const container = document.createElement('div');
  container.className = 'picker-wheel';

  const topPad = document.createElement('div');
  topPad.className = 'picker-pad';
  container.appendChild(topPad);

  items.forEach((item, i) => {
    const el = document.createElement('div');
    el.className = 'picker-item';
    el.textContent = item.label;
    el.dataset.index = i;
    container.appendChild(el);
  });

  const bottomPad = document.createElement('div');
  bottomPad.className = 'picker-pad';
  container.appendChild(bottomPad);

  const highlight = document.createElement('div');
  highlight.className = 'picker-highlight';
  container.appendChild(highlight);

  function getSelectedIndex() {
    return Math.round(container.scrollTop / ITEM_HEIGHT);
  }

  function updateSelected() {
    const idx = getSelectedIndex();
    container.querySelectorAll('.picker-item').forEach((el, i) => {
      el.classList.toggle('selected', i === idx);
    });
  }

  container.addEventListener('scroll', updateSelected, { passive: true });

  const wheel = {
    element: container,
    items,
    getValue() {
      const idx = Math.min(getSelectedIndex(), items.length - 1);
      return items[Math.max(0, idx)].value;
    },
    scrollTo(idx) {
      container.scrollTop = idx * ITEM_HEIGHT;
      updateSelected();
    }
  };

  return wheel;
}

function getActivePickerConfig() {
  if (state.reverse && reversePickerConfigs[state.mode]) {
    return reversePickerConfigs[state.mode];
  }
  return pickerConfigs[state.mode];
}

function buildPicker() {
  const area = document.getElementById('picker-area');
  area.innerHTML = '';
  state.wheels = [];

  const config = getActivePickerConfig();
  const picker = document.createElement('div');
  picker.className = 'picker';

  config.wheels.forEach(wc => {
    if (wc.separator) {
      const sep = document.createElement('div');
      sep.className = 'picker-separator';
      sep.textContent = wc.separator;
      picker.appendChild(sep);
      return;
    }

    const wheel = createWheel(wc.items);
    picker.appendChild(wheel.element);
    state.wheels.push(wheel);
  });

  area.appendChild(picker);

  requestAnimationFrame(() => {
    state.wheels.forEach(w => {
      const idx = Math.floor(Math.random() * w.items.length);
      w.scrollTo(idx);
    });
  });
}

function getPickerAnswer() {
  const config = getActivePickerConfig();
  const values = state.wheels.map(w => w.getValue());
  return config.getAnswer(values);
}

// --- Clock ---

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

// --- UI ---

function updatePrompt() {
  const { hour, minute, mode, reverse } = state;
  const prompt = document.getElementById('prompt');

  if (mode === '24h') {
    prompt.textContent = reverse ? format24h(hour, minute) : format12hTageszeit(hour, minute);
  } else if (mode === 'tageszeit') {
    prompt.textContent = format24h(hour, minute);
  } else {
    if (reverse) {
      const answers = getColloquialAnswers(hour, minute);
      const text = answers.length > 0 ? answers[0] : '';
      prompt.textContent = text.charAt(0).toUpperCase() + text.slice(1);
    } else {
      prompt.textContent = format12hTageszeit(hour, minute);
    }
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
  state.questionCount++;
  state.reverse = (state.mode !== 'tageszeit') && Math.random() < 0.5;
  state.useTyping = state.questionCount % 20 === 0;

  let { hour, minute } = randomTime();
  if (state.mode === 'umgangssprache' && !state.useTyping && !state.reverse && minute === 0) {
    minute = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55][Math.floor(Math.random() * 11)];
  }
  state.hour = hour;
  state.minute = minute;
  state.answered = false;

  // Uhr bei Umgangssprache-Reverse verstecken (verrät die Antwort)
  const clockEl = document.getElementById('clock-container');
  if (state.mode === 'umgangssprache' && state.reverse) {
    clockEl.classList.add('hidden');
  } else {
    clockEl.classList.remove('hidden');
    drawClock(hour, minute);
  }

  updatePrompt();

  // Placeholder je nach Richtung anpassen
  const input = document.getElementById('answer');
  if (state.reverse) {
    input.placeholder = state.mode === '24h' ? '3:00 nachmittags' : '3:30';
  } else {
    if (state.mode === '24h') input.placeholder = '16:30';
    else if (state.mode === 'tageszeit') input.placeholder = 'nachmittags';
    else input.placeholder = 'halb fünf';
  }

  document.getElementById('feedback').classList.add('hidden');
  document.getElementById('valid-answers').classList.add('hidden');
  document.getElementById('check-btn').textContent = 'Prüfen';
  document.getElementById('skip-btn').classList.remove('hidden');

  if (state.useTyping) {
    document.getElementById('picker-area').classList.add('hidden');
    document.getElementById('input-area').classList.remove('hidden');
    input.value = '';
    input.focus();
  } else {
    document.getElementById('input-area').classList.add('hidden');
    document.getElementById('picker-area').classList.remove('hidden');
    buildPicker();
  }
}

function getCurrentAnswer() {
  if (state.useTyping) {
    return document.getElementById('answer').value.trim();
  }
  return getPickerAnswer();
}

function handleCheck() {
  const btn = document.getElementById('check-btn');

  if (state.answered) {
    nextRound();
    return;
  }

  const value = getCurrentAnswer();
  if (state.useTyping && !value) {
    const input = document.getElementById('answer');
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
  document.getElementById('skip-btn').classList.add('hidden');
  if (state.useTyping) document.getElementById('answer').blur();
}

function handleSkip() {
  if (state.answered) return;
  nextRound();
}

// --- Examples & Modes ---

function showExamples() {
  const data = examplesData[state.mode];
  document.getElementById('examples-title').textContent = data.title;
  document.getElementById('examples-desc').textContent = data.desc;

  const table = document.getElementById('examples-table');
  const arrow = (state.mode === '24h' || state.mode === 'umgangssprache') ? '⟷' : '⟶';
  table.innerHTML = data.rows.map(([from, to]) => {
    const parts = from.match(/^([\d:]+)\s*(.*)$/);
    if (parts && parts[2]) {
      return `<tr><td class="ex-time">${parts[1]}</td><td class="ex-label">${parts[2]}</td><td class="arrow">${arrow}</td><td class="ex-right">${to}</td></tr>`;
    }
    return `<tr><td colspan="2">${from}</td><td class="arrow">${arrow}</td><td class="ex-right">${to}</td></tr>`;
  }).join('');

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
  state.questionCount = 0;
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('active', t.dataset.mode === mode);
  });

  const input = document.getElementById('answer');
  if (mode === '24h') input.placeholder = '16:30';
  else if (mode === 'tageszeit') input.placeholder = 'nachmittags';
  else input.placeholder = 'halb fünf';

  showExamples();
}

// --- Events ---

document.getElementById('check-btn').addEventListener('click', handleCheck);
document.getElementById('skip-btn').addEventListener('click', handleSkip);
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
setMode('tageszeit');

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}
