
// =============================================
// ACTIVITY LIBRARY — reusable learning activities
// =============================================
var ACT_DATA = {};
var ACT_STATES = {};

function initActivity(actId, config) {
  ACT_DATA[actId] = config;
  ACT_STATES[actId] = { answered: false, hintsUsed: 0, score: 0 };
  renderActivity(actId, config);
}

function renderActivity(actId, cfg) {
  var el = document.getElementById(actId);
  if (!el) return;
  var html = '';
  html += '<div class="act-header">';
  html += '<div class="act-badge act-badge-' + cfg.type + '">' + cfg.type.charAt(0).toUpperCase() + cfg.type.slice(1).replace(/-/g, ' ') + '</div>';
  html += '<div class="act-title">' + cfg.title + '</div>';
  if (cfg.subtitle) html += '<div class="act-subtitle">' + cfg.subtitle + '</div>';
  html += '</div>';
  html += '<div class="act-body">';
  if (cfg.scenario) html += '<div class="act-scenario">' + cfg.scenario + '</div>';
  if (cfg.prompt) html += '<div class="act-prompt">' + cfg.prompt + '</div>';
  html += renderActivityBody(actId, cfg);
  html += renderHints(actId, cfg);
  html += '<div class="act-feedback" id="' + actId + '-feedback"></div>';
  html += '<div class="act-actions" id="' + actId + '-actions">';
  html += renderActions(actId, cfg);
  html += '</div>';
  html += '</div>';
  el.innerHTML = html;
  bindActivityEvents(actId, cfg);
}

function renderActivityBody(actId, cfg) {
  switch (cfg.type) {
    case 'classification': return renderClassificationBody(actId, cfg);
    case 'short-response': return renderShortResponseBody(actId, cfg);
    case 'scenario-application': return renderScenarioBody(actId, cfg);
    case 'spot-the-problem': return renderSpotProblemBody(actId, cfg);
    case 'compare-contrast': return renderCompareBody(actId, cfg);
    case 'analysis': return renderAnalysisBody(actId, cfg);
    case 'research-design': return renderDesignBuilderBody(actId, cfg);
    case 'sequencing': return renderSequencingBody(actId, cfg);
    case 'fill-blank': return renderFillBlankBody(actId, cfg);
    case 'prediction': return renderPredictionBody(actId, cfg);
    case 'conclude': return renderConcludeBody(actId, cfg);
    case 'identify-ivdv': return renderIdentifyIVDVBody(actId, cfg);
    case 'spot-confound': return renderSpotConfoundBody(actId, cfg);
    case 'operationalise': return renderOperationaliseBody(actId, cfg);
    case 'synthesis': return renderSynthesisBody(actId, cfg);
    default: return '';
  }
}

function renderActions(actId, cfg) {
  var html = '';
  if (cfg.type === 'short-response' || cfg.type === 'analysis' || cfg.type === 'synthesis') {
    html += '<button class="act-btn act-btn-primary" onclick="checkActivity(\'' + actId + '\')">Check Answer</button>';
    html += '<button class="act-btn act-btn-secondary" onclick="showModelAnswer(\'' + actId + '\')">Show Model Answer</button>';
  } else if (cfg.type === 'classification') {
    html += '<button class="act-btn act-btn-primary" id="' + actId + '-check" onclick="checkActivity(\'' + actId + '\')" disabled>Check Placements</button>';
  } else if (cfg.type === 'spot-the-problem' || cfg.type === 'spot-confound') {
    html += '<button class="act-btn act-btn-primary" id="' + actId + '-check" onclick="checkActivity(\'' + actId + '\')">Check Selections</button>';
  } else if (cfg.type === 'scenario-application' || cfg.type === 'prediction' || cfg.type === 'conclude') {
    html += '<button class="act-btn act-btn-primary" id="' + actId + '-check" onclick="checkActivity(\'' + actId + '\')">Check Answers</button>';
  } else if (cfg.type === 'compare-contrast') {
    html += '<button class="act-btn act-btn-primary" onclick="showModelAnswer(\'' + actId + '\')">Show Model Comparison</button>';
  } else if (cfg.type === 'research-design' || cfg.type === 'sequencing') {
    html += '<button class="act-btn act-btn-primary" id="' + actId + '-check" onclick="checkActivity(\'' + actId + '\')">Check</button>';
  } else if (cfg.type === 'fill-blank' || cfg.type === 'identify-ivdv' || cfg.type === 'operationalise') {
    html += '<button class="act-btn act-btn-primary" id="' + actId + '-check" onclick="checkActivity(\'' + actId + '\')">Check Answers</button>';
  }
  html += '<button class="act-btn act-btn-secondary" onclick="resetActivity(\'' + actId + '\')">Try Again</button>';
  return html;
}

// ===== HINT SYSTEM =====
function renderHints(actId, cfg) {
  if (!cfg.hints || cfg.hints.length === 0) return '';
  var state = ACT_STATES[actId];
  var html = '<div class="act-hint-area">';
  for (var i = 0; i < cfg.hints.length; i++) {
    html += '<div>';
    html += '<button class="act-hint-btn" id="' + actId + '-hint-' + i + '" onclick="revealHint(\'' + actId + '\',' + i + ')">Hint ' + (i + 1) + '</button>';
    html += '<div class="act-hint-content" id="' + actId + '-hint-content-' + i + '"><div><div class="act-hint-text">' + cfg.hints[i] + '</div></div></div>';
    html += '</div>';
  }
  html += '</div>';
  return html;
}

function revealHint(actId, idx) {
  var state = ACT_STATES[actId];
  if (!state) return;
  var btn = document.getElementById(actId + '-hint-' + idx);
  var content = document.getElementById(actId + '-hint-content-' + idx);
  if (!btn || !content) return;
  if (content.classList.contains('visible')) return;
  content.classList.add('visible');
  btn.classList.add('revealed');
  btn.textContent = 'Hint ' + (idx + 1) + ' (shown)';
  state.hintsUsed = Math.max(state.hintsUsed || 0, idx + 1);
  playRevealSound();
}

// ===== FEEDBACK =====
function showFeedback(actId, correct, message) {
  var el = document.getElementById(actId + '-feedback');
  if (!el) return;
  var cls = correct ? 'correct' : 'incorrect';
  var icon = correct ? '\u2713' : '\u2717';
  el.innerHTML = '<div class="act-feedback-inner ' + cls + '"><span class="act-feedback-icon">' + icon + '</span> ' + message + '</div>';
  el.classList.add('visible');
  playRevealSound();
}

function showModelAnswer(actId) {
  var cfg = ACT_DATA[actId];
  if (!cfg) return;
  var el = document.getElementById(actId);
  if (!el) return;
  var body = el.querySelector('.act-body');
  if (!body) return;
  var existing = body.querySelector('.act-model-answer');
  if (existing) {
    existing.classList.toggle('visible');
    playRevealSound();
    return;
  }
  var modelDiv = document.createElement('div');
  modelDiv.className = 'act-model-answer visible';
  var inner = '<div class="act-model-answer-inner">';
  inner += '<div class="act-model-answer-label">Model Answer</div>';
  if (cfg.type === 'short-response') {
    inner += '<div class="act-model-answer-text">' + cfg.modelAnswer + '</div>';
    if (cfg.rubric) {
      inner += '<div class="act-rubric"><strong>Marking criteria:</strong><ul>';
      for (var i = 0; i < cfg.rubric.length; i++) {
        inner += '<li>' + cfg.rubric[i] + '</li>';
      }
      inner += '</ul></div>';
    }
  } else if (cfg.type === 'analysis') {
    inner += '<div class="act-model-answer-text">' + cfg.modelAnswer + '</div>';
  } else if (cfg.type === 'compare-contrast') {
    inner += '<div class="act-model-answer-text">' + cfg.modelComparison + '</div>';
  }
  inner += '</div>';
  modelDiv.innerHTML = '<div>' + inner + '</div>';
  body.appendChild(modelDiv);
  playRevealSound();
}

// ===== RESET =====
function resetActivity(actId) {
  var cfg = ACT_DATA[actId];
  if (!cfg) return;
  ACT_STATES[actId] = { answered: false, hintsUsed: 0, score: 0 };
  renderActivity(actId, cfg);
}

// ===== UTILITY =====
function shuffleArrayLocal(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}


// ===== CLASSIFICATION =====
function renderClassificationBody(actId, cfg) {
  var html = '<div class="act-classify-instruction">Select an item below, then click a category bin to place it.</div>';
  var items = shuffleArrayLocal(cfg.items);
  html += '<div class="act-classify-items" id="' + actId + '-pool">';
  for (var i = 0; i < items.length; i++) {
    html += '<div class="act-classify-item" data-act="' + actId + '" data-item="' + items[i].id + '" onclick="clsSelect(this)">' + items[i].text + '</div>';
  }
  html += '</div>';
  html += '<div class="act-classify-bins">';
  for (var b = 0; b < cfg.bins.length; b++) {
    html += '<div class="act-classify-bin" data-act="' + actId + '" data-bin="' + b + '" onclick="clsBinClick(this)">';
    html += '<div class="act-classify-bin-header">' + cfg.bins[b].label + '</div>';
    html += '<div class="act-classify-bin-items" id="' + actId + '-bin-' + b + '"></div>';
    html += '</div>';
  }
  html += '</div>';
  return html;
}

var _clsSel = {};
function clsSelect(el) {
  if (el.classList.contains('placed') || el.classList.contains('locked')) return;
  var actId = el.getAttribute('data-act');
  var pool = el.parentElement.querySelectorAll('.act-classify-item.selected');
  pool.forEach(function(p) { p.classList.remove('selected'); });
  el.classList.add('selected');
  _clsSel[actId] = el.getAttribute('data-item');
}

function clsBinClick(el) {
  var actId = el.getAttribute('data-act');
  if (el.classList.contains('locked')) return;
  var itemId = _clsSel[actId];
  if (!itemId) return;
  var itemEl = document.querySelector('[data-act="' + actId + '"].act-classify-item[data-item="' + itemId + '"]:not(.placed)');
  if (!itemEl) return;
  var binIdx = el.getAttribute('data-bin');
  var binItems = document.getElementById(actId + '-bin-' + binIdx);
  if (!binItems) return;
  var chip = document.createElement('div');
  chip.className = 'act-classify-item';
  chip.setAttribute('data-act', actId);
  chip.setAttribute('data-item', itemId);
  chip.setAttribute('data-bin', binIdx);
  chip.textContent = itemEl.textContent;
  chip.onclick = function() { clsRemove(this); };
  binItems.appendChild(chip);
  itemEl.classList.add('placed');
  itemEl.classList.remove('selected');
  _clsSel[actId] = null;
  playRevealSound();
  clsUpdateCheckBtn(actId);
}

function clsRemove(el) {
  var actId = el.getAttribute('data-act');
  var state = ACT_STATES[actId];
  if (state && state.answered) return;
  var itemId = el.getAttribute('data-item');
  el.remove();
  var poolItem = document.querySelector('[data-act="' + actId + '"].act-classify-item[data-item="' + itemId + '"].placed');
  if (poolItem) poolItem.classList.remove('placed');
  clsUpdateCheckBtn(actId);
}

function clsUpdateCheckBtn(actId) {
  var cfg = ACT_DATA[actId];
  if (!cfg) return;
  var pool = document.getElementById(actId + '-pool');
  if (!pool) return;
  var remaining = pool.querySelectorAll('.act-classify-item:not(.placed)').length;
  var checkBtn = document.getElementById(actId + '-check');
  if (checkBtn) checkBtn.disabled = remaining > 0;
}

// ===== SHORT RESPONSE =====
function renderShortResponseBody(actId, cfg) {
  var html = '';
  if (cfg.scaffolding) {
    html += '<div class="act-scaffolding"><strong>Structure your answer:</strong> ' + cfg.scaffolding + '</div>';
  }
  html += '<textarea class="act-textarea" id="' + actId + '-input" placeholder="' + (cfg.placeholder || 'Type your answer here...') + '" oninput="srWordCount(\'' + actId + '\')"></textarea>';
  html += '<div class="act-word-count" id="' + actId + '-wc">0 words</div>';
  return html;
}

function srWordCount(actId) {
  var ta = document.getElementById(actId + '-input');
  var wc = document.getElementById(actId + '-wc');
  if (!ta || !wc) return;
  var w = ta.value.trim().split(/\s+/).filter(function(x) { return x.length > 0; });
  wc.textContent = w.length + ' word' + (w.length !== 1 ? 's' : '');
}


// ===== SCENARIO APPLICATION =====
function renderScenarioBody(actId, cfg) {
  var html = '<div class="act-scenario-questions">';
  for (var i = 0; i < cfg.questions.length; i++) {
    var q = cfg.questions[i];
    html += '<div class="act-scenario-q" data-act="' + actId + '" data-q="' + i + '">';
    html += '<div class="act-scenario-q-label">' + (i + 1) + '. ' + q.label + '</div>';
    html += '<div class="act-scenario-q-options">';
    for (var o = 0; o < q.options.length; o++) {
      html += '<div class="act-scenario-q-option" data-act="' + actId + '" data-q="' + i + '" data-opt="' + o + '" onclick="scnOptClick(this)">';
      html += '<div class="act-radio-dot"></div><span>' + q.options[o] + '</span></div>';
    }
    html += '</div>';
    html += '<div class="act-scenario-q-feedback" id="' + actId + '-qf-' + i + '"></div>';
    html += '</div>';
  }
  html += '</div>';
  return html;
}

function scnOptClick(el) {
  var actId = el.getAttribute('data-act');
  var qIdx = el.getAttribute('data-q');
  var state = ACT_STATES[actId];
  if (state && state.answered) return;
  var qEl = document.querySelector('[data-act="' + actId + '"].act-scenario-q[data-q="' + qIdx + '"]');
  if (!qEl) return;
  qEl.querySelectorAll('.act-scenario-q-option').forEach(function(o) { o.classList.remove('selected'); });
  el.classList.add('selected');
}

// ===== SPOT THE PROBLEM =====
function renderSpotProblemBody(actId, cfg) {
  var html = '<div class="act-stp-items">';
  for (var i = 0; i < cfg.items.length; i++) {
    var item = cfg.items[i];
    html += '<div class="act-stp-item" data-act="' + actId + '" data-stp="' + i + '" onclick="stpToggle(this)">';
    html += '<div class="act-stp-checkbox"></div>';
    html += '<div class="act-stp-item-text">' + item.text + '</div>';
    html += '</div>';
    html += '<div class="act-stp-explain" id="' + actId + '-stp-ex-' + i + '">' + (item.explain || '') + '</div>';
  }
  html += '</div>';
  return html;
}

function stpToggle(el) {
  var state = ACT_STATES[el.getAttribute('data-act')];
  if (state && state.answered) return;
  el.classList.toggle('selected');
}


// ===== COMPARE & CONTRAST =====
function renderCompareBody(actId, cfg) {
  var html = '';
  if (cfg.prompt) html += '<div class="act-compare-prompt">' + cfg.prompt + '</div>';
  html += '<div class="act-compare">';
  html += '<div class="act-compare-side"><div class="act-compare-label">' + cfg.sideA.label + '</div><ul class="act-compare-points">';
  for (var i = 0; i < cfg.sideA.points.length; i++) html += '<li>' + cfg.sideA.points[i] + '</li>';
  html += '</ul></div>';
  html += '<div class="act-compare-side"><div class="act-compare-label">' + cfg.sideB.label + '</div><ul class="act-compare-points">';
  for (var j = 0; j < cfg.sideB.points.length; j++) html += '<li>' + cfg.sideB.points[j] + '</li>';
  html += '</ul></div>';
  html += '</div>';
  return html;
}

// ===== ANALYSIS SCAFFOLD =====
function renderAnalysisBody(actId, cfg) {
  var html = '<div class="act-analysis-parts">';
  for (var i = 0; i < cfg.parts.length; i++) {
    html += '<div class="act-analysis-part">';
    html += '<div class="act-analysis-label">' + cfg.parts[i].label + '</div>';
    html += '<textarea class="act-analysis-input" id="' + actId + '-part-' + i + '" placeholder="' + (cfg.parts[i].placeholder || 'Your analysis...') + '"></textarea>';
    html += '</div>';
  }
  html += '</div>';
  return html;
}

// ===== RESEARCH DESIGN BUILDER =====
function renderDesignBuilderBody(actId, cfg) {
  var html = '';
  var choices = shuffleArrayLocal(cfg.choices.slice());
  html += '<div class="act-rdb-choices" id="' + actId + '-choices">';
  for (var c = 0; c < choices.length; c++) {
    html += '<div class="act-rdb-choice" data-act="' + actId + '" data-choice="' + choices[c] + '" onclick="rdbSelect(this)">' + choices[c] + '</div>';
  }
  html += '</div>';
  html += '<div class="act-rdb-slots">';
  for (var s = 0; s < cfg.slots.length; s++) {
    html += '<div class="act-rdb-slot" data-act="' + actId + '" data-slot="' + s + '" onclick="rdbSlotClick(this)">';
    html += '<div class="act-rdb-slot-label">' + cfg.slots[s].label + '</div>';
    html += '<div class="act-rdb-slot-empty">Click a choice above, then click here</div>';
    html += '</div>';
  }
  html += '</div>';
  return html;
}

var _rdbSel = {};
function rdbSelect(el) {
  if (el.classList.contains('placed') || el.classList.contains('locked')) return;
  var actId = el.getAttribute('data-act');
  var pool = el.parentElement.querySelectorAll('.act-rdb-choice.selected');
  pool.forEach(function(p) { p.classList.remove('selected'); });
  el.classList.add('selected');
  _rdbSel[actId] = el.getAttribute('data-choice');
}

function rdbSlotClick(el) {
  var actId = el.getAttribute('data-act');
  if (el.classList.contains('locked')) return;
  var choice = _rdbSel[actId];
  if (!choice) return;
  var choiceEl = document.querySelector('[data-act="' + actId + '"].act-rdb-choice[data-choice="' + choice + '"]:not(.placed)');
  if (!choiceEl) return;
  var empty = el.querySelector('.act-rdb-slot-empty');
  var existing = el.querySelector('.act-rdb-slot-value');
  if (existing) rdbSlotRemove(existing, actId);
  if (empty) empty.style.display = 'none';
  var val = document.createElement('div');
  val.className = 'act-rdb-slot-value';
  val.textContent = choice;
  val.setAttribute('data-choice', choice);
  val.onclick = function() { rdbSlotRemove(this, actId); };
  el.appendChild(val);
  el.classList.add('filled');
  choiceEl.classList.add('placed');
  choiceEl.classList.remove('selected');
  _rdbSel[actId] = null;
  playRevealSound();
}

function rdbSlotRemove(el, actId) {
  var state = ACT_STATES[actId];
  if (state && state.answered) return;
  var choice = el.getAttribute('data-choice');
  el.parentElement.classList.remove('filled');
  el.remove();
  var slot = el.parentElement;
  var empty = slot.querySelector('.act-rdb-slot-empty');
  if (empty) empty.style.display = '';
  var choiceEl = document.querySelector('[data-act="' + actId + '"].act-rdb-choice[data-choice="' + choice + '"].placed');
  if (choiceEl) choiceEl.classList.remove('placed');
}


// ===== EVENT BINDING =====
function bindActivityEvents(actId, cfg) {}

// ===== CHECK ACTIVITY (dispatcher) =====
function checkActivity(actId) {
  var cfg = ACT_DATA[actId];
  if (!cfg) return;
  var state = ACT_STATES[actId];
  if (state.answered) return;
  state.answered = true;
  switch (cfg.type) {
    case 'classification': checkClassification(actId, cfg); break;
    case 'scenario-application': checkScenario(actId, cfg); break;
    case 'spot-the-problem': checkSpotProblem(actId, cfg); break;
    case 'spot-confound': checkSpotConfound(actId, cfg); break;
    case 'research-design': checkDesignBuilder(actId, cfg); break;
    case 'sequencing': checkSequencing(actId, cfg); break;
    case 'fill-blank': checkFillBlank(actId, cfg); break;
    case 'prediction': checkPrediction(actId, cfg); break;
    case 'conclude': checkConclude(actId, cfg); break;
    case 'identify-ivdv': checkIdentifyIVDV(actId, cfg); break;
    case 'operationalise': checkOperationalise(actId, cfg); break;
    case 'short-response':
    case 'analysis':
    case 'synthesis':
      showFeedback(actId, true, 'Review your answer against the model answer below.');
      break;
  }
}

// ===== CHECK CLASSIFICATION =====
function checkClassification(actId, cfg) {
  var correct = 0;
  var total = cfg.items.length;
  var bins = document.querySelectorAll('.act-classify-bin[data-act="' + actId + '"]');
  bins.forEach(function(bin) {
    var binIdx = parseInt(bin.getAttribute('data-bin'));
    bin.classList.add('locked');
    bin.querySelectorAll('.act-classify-item').forEach(function(chip) {
      var itemId = chip.getAttribute('data-item');
      var expected = cfg.items.find(function(it) { return it.id === itemId; });
      if (expected && expected.bin === binIdx) {
        chip.classList.add('correct');
        correct++;
      } else {
        chip.classList.add('incorrect');
      }
      chip.classList.add('locked');
    });
  });
  document.querySelectorAll('.act-classify-item[data-act="' + actId + '"]:not(.placed)').forEach(function(item) {
    item.classList.add('locked');
  });
  var msg = correct === total
    ? 'Perfect! All items placed correctly.'
    : correct >= total * 0.7
      ? 'Good effort! ' + correct + ' of ' + total + ' correct. Items highlighted in red are in the wrong bin.'
      : 'You got ' + correct + ' of ' + total + '. Items highlighted in red are misplaced. Click Try Again to redo.';
  showFeedback(actId, correct === total, msg);
  var checkBtn = document.getElementById(actId + '-check');
  if (checkBtn) checkBtn.disabled = true;
}

// ===== CHECK SCENARIO =====
function checkScenario(actId, cfg) {
  var correct = 0;
  var total = cfg.questions.length;
  var allAnswered = true;
  for (var i = 0; i < total; i++) {
    var qEl = document.querySelector('[data-act="' + actId + '"].act-scenario-q[data-q="' + i + '"]');
    var selected = qEl.querySelector('.act-scenario-q-option.selected');
    var fb = document.getElementById(actId + '-qf-' + i);
    if (!selected) { allAnswered = false; continue; }
    var optIdx = parseInt(selected.getAttribute('data-opt'));
    qEl.querySelectorAll('.act-scenario-q-option').forEach(function(o) {
      o.classList.add('disabled');
      o.classList.remove('selected');
    });
    if (optIdx === cfg.questions[i].correct) {
      selected.classList.add('correct');
      correct++;
      if (fb) { fb.className = 'act-scenario-q-feedback show correct'; fb.innerHTML = '<strong>Correct.</strong> ' + cfg.questions[i].feedback.correct; }
    } else {
      selected.classList.add('incorrect');
      var correctOpt = qEl.querySelector('[data-opt="' + cfg.questions[i].correct + '"]');
      if (correctOpt) correctOpt.classList.add('correct');
      if (fb) { fb.className = 'act-scenario-q-feedback show incorrect'; fb.innerHTML = '<strong>Not quite.</strong> ' + cfg.questions[i].feedback.incorrect; }
    }
    if (cfg.questions[i].explain) {
      if (fb) fb.innerHTML += '<div class="act-scenario-q-explain">' + cfg.questions[i].explain + '</div>';
    }
  }
  if (!allAnswered) {
    ACT_STATES[actId].answered = false;
    showFeedback(actId, false, 'Please answer all questions before checking.');
    return;
  }
  var msg = correct === total
    ? 'Perfect score! You applied the concepts correctly.'
    : correct >= total * 0.7
      ? 'Good work! ' + correct + ' of ' + total + ' correct.'
      : 'You got ' + correct + ' of ' + total + '. Review the feedback for each question.';
  showFeedback(actId, correct === total, msg);
  var checkBtn = document.getElementById(actId + '-check');
  if (checkBtn) checkBtn.disabled = true;
}

// ===== CHECK SPOT THE PROBLEM =====
function checkSpotProblem(actId, cfg) {
  var items = cfg.items;
  var selected = [];
  document.querySelectorAll('.act-stp-item[data-act="' + actId + '"].selected').forEach(function(el) {
    selected.push(parseInt(el.getAttribute('data-stp')));
  });
  var correctOnes = [];
  for (var i = 0; i < items.length; i++) {
    if (items[i].isProblem) correctOnes.push(i);
  }
  var score = 0;
  for (var j = 0; j < items.length; j++) {
    var el = document.querySelector('.act-stp-item[data-act="' + actId + '"][data-stp="' + j + '"]');
    var explainEl = document.getElementById(actId + '-stp-ex-' + j);
    el.classList.add('locked');
    el.classList.remove('selected');
    var isProblem = items[j].isProblem;
    var wasSelected = selected.indexOf(j) !== -1;
    if (isProblem && wasSelected) {
      el.classList.add('correct');
      score++;
    } else if (!isProblem && wasSelected) {
      el.classList.add('incorrect');
    } else if (isProblem && !wasSelected) {
      el.classList.add('missed');
    }
    if (explainEl) explainEl.classList.add('show');
  }
  var total = correctOnes.length;
  var msg = score === total && selected.length === total
    ? 'Excellent! You identified all the problems correctly.'
    : 'You identified ' + score + ' of ' + total + ' problems. Review the explanations below.';
  showFeedback(actId, score === total && selected.length === total, msg);
  var checkBtn = document.getElementById(actId + '-check');
  if (checkBtn) checkBtn.disabled = true;
}

// ===== CHECK RESEARCH DESIGN BUILDER =====
function checkDesignBuilder(actId, cfg) {
  var correct = 0;
  var total = cfg.slots.length;
  var slots = document.querySelectorAll('.act-rdb-slot[data-act="' + actId + '"]');
  slots.forEach(function(slot) {
    var slotIdx = parseInt(slot.getAttribute('data-slot'));
    slot.classList.add('locked');
    var val = slot.querySelector('.act-rdb-slot-value');
    if (val) {
      var choice = val.getAttribute('data-choice');
      if (choice === cfg.slots[slotIdx].correct) {
        slot.classList.add('correct');
        correct++;
      } else {
        slot.classList.add('incorrect');
        val.style.textDecoration = 'line-through';
        var correctSpan = document.createElement('div');
        correctSpan.className = 'act-rdb-slot-value';
        correctSpan.style.color = '#276749';
        correctSpan.style.textDecoration = 'none';
        correctSpan.textContent = '\u2192 Correct: ' + cfg.slots[slotIdx].correct;
        slot.appendChild(correctSpan);
      }
    }
  });
  document.querySelectorAll('.act-rdb-choice[data-act="' + actId + '"]').forEach(function(c) { c.classList.add('locked'); c.classList.remove('selected'); });
  var msg = correct === total
    ? 'Perfect design! All components correctly placed.'
    : 'You got ' + correct + ' of ' + total + ' correct. Review the corrections shown.';
  showFeedback(actId, correct === total, msg);
  var checkBtn = document.getElementById(actId + '-check');
  if (checkBtn) checkBtn.disabled = true;
}


// ===== SEQUENCING (ordering) =====
function renderSequencingBody(actId, cfg) {
  var html = '<div class="act-seq-instruction">Click an item, then click a slot to place it in order.</div>';
  var items = shuffleArrayLocal(cfg.items.slice());
  html += '<div class="act-seq-pool" id="' + actId + '-pool">';
  for (var i = 0; i < items.length; i++) {
    html += '<div class="act-seq-item" data-act="' + actId + '" data-item="' + items[i].id + '" onclick="seqSelect(this)">';
    html += '<span class="act-seq-text">' + items[i].text + '</span></div>';
  }
  html += '</div>';
  html += '<div class="act-seq-slots" id="' + actId + '-slots">';
  for (var s = 0; s < cfg.items.length; s++) {
    html += '<div class="act-seq-slot" data-act="' + actId + '" data-slot="' + s + '" onclick="seqSlotClick(this)">';
    html += '<div class="act-seq-slot-num">' + (s + 1) + '</div>';
    html += '<div class="act-seq-slot-empty">Click an item, then click here</div></div>';
  }
  html += '</div>';
  return html;
}
var _seqSel = {};
function seqSelect(el) {
  if (el.classList.contains('placed') || el.classList.contains('locked')) return;
  var actId = el.getAttribute('data-act');
  el.parentElement.querySelectorAll('.act-seq-item.selected').forEach(function(p) { p.classList.remove('selected'); });
  el.classList.add('selected');
  _seqSel[actId] = el.getAttribute('data-item');
}
function seqSlotClick(el) {
  var actId = el.getAttribute('data-act');
  if (el.classList.contains('locked')) return;
  var itemId = _seqSel[actId];
  if (!itemId) return;
  var itemEl = document.querySelector('[data-act="' + actId + '"].act-seq-item[data-item="' + itemId + '"]:not(.placed)');
  if (!itemEl) return;
  var existing = el.querySelector('.act-seq-placed');
  if (existing) seqSlotRemove(existing, actId);
  var empty = el.querySelector('.act-seq-slot-empty');
  if (empty) empty.style.display = 'none';
  var chip = document.createElement('div');
  chip.className = 'act-seq-placed';
  chip.setAttribute('data-act', actId);
  chip.setAttribute('data-item', itemId);
  chip.setAttribute('data-slot', el.getAttribute('data-slot'));
  chip.innerHTML = '<span class="act-seq-text">' + itemEl.textContent + '</span>';
  chip.onclick = function() { seqSlotRemove(this, actId); };
  el.appendChild(chip);
  el.classList.add('filled');
  itemEl.classList.add('placed');
  itemEl.classList.remove('selected');
  _seqSel[actId] = null;
  playRevealSound();
}
function seqSlotRemove(el, actId) {
  var state = ACT_STATES[actId];
  if (state && state.answered) return;
  var itemId = el.getAttribute('data-item');
  var slot = el.parentElement;
  el.remove();
  slot.classList.remove('filled');
  var empty = slot.querySelector('.act-seq-slot-empty');
  if (empty) empty.style.display = '';
  var poolItem = document.querySelector('[data-act="' + actId + '"].act-seq-item[data-item="' + itemId + '"].placed');
  if (poolItem) poolItem.classList.remove('placed');
}
function checkSequencing(actId, cfg) {
  var correct = 0;
  var total = cfg.items.length;
  var slots = document.querySelectorAll('.act-seq-slot[data-act="' + actId + '"]');
  slots.forEach(function(slot) {
    var slotIdx = parseInt(slot.getAttribute('data-slot'));
    slot.classList.add('locked');
    var val = slot.querySelector('.act-seq-placed');
    if (val) {
      var itemId = val.getAttribute('data-item');
      var expected = cfg.items.find(function(it) { return it.id === itemId; });
      if (expected && expected.order === slotIdx) {
        slot.classList.add('correct');
        correct++;
      } else {
        slot.classList.add('incorrect');
      }
    }
  });
  document.querySelectorAll('.act-seq-item[data-act="' + actId + '"]').forEach(function(it) { it.classList.add('locked'); it.classList.remove('selected'); });
  var msg = correct === total
    ? 'Perfect order!'
    : correct >= total * 0.7
      ? 'Good effort! ' + correct + ' of ' + total + ' in the right position.'
      : 'You got ' + correct + ' of ' + total + ' correct.';
  showFeedback(actId, correct === total, msg);
}

// ===== FILL IN THE BLANK (dropdown) =====
function renderFillBlankBody(actId, cfg) {
  var html = '<div class="act-fb-passage">';
  var blanks = cfg.blanks.slice();
  var passage = cfg.passage;
  for (var i = 0; i < blanks.length; i++) {
    var parts2 = passage.split('___BLANK_' + i + '___');
    html += parts2[0];
    html += '<select class="act-fb-select" data-act="' + actId + '" data-blank="' + i + '">';
    html += '<option value="">Choose...</option>';
    var opts = shuffleArrayLocal(blanks[i].options);
    for (var o = 0; o < opts.length; o++) {
      html += '<option value="' + opts[o] + '">' + opts[o] + '</option>';
    }
    html += '</select>';
    passage = parts2[1] || '';
  }
  html += passage;
  html += '</div>';
  return html;
}
function checkFillBlank(actId, cfg) {
  var correct = 0;
  var total = cfg.blanks.length;
  var selects = document.querySelectorAll('.act-fb-select[data-act="' + actId + '"]');
  selects.forEach(function(sel, idx) {
    sel.disabled = true;
    var val = sel.value;
    if (val === cfg.blanks[idx].answer) {
      sel.classList.add('correct');
      correct++;
    } else {
      sel.classList.add('incorrect');
    }
  });
  var msg = correct === total
    ? 'All blanks filled correctly!'
    : 'You got ' + correct + ' of ' + total + ' correct.';
  showFeedback(actId, correct === total, msg);
}
// ===== PREDICTION (predict then reveal) =====
function renderPredictionBody(actId, cfg) {
  var html = '<div class="act-pred-questions">';
  for (var i = 0; i < cfg.questions.length; i++) {
    var q = cfg.questions[i];
    html += '<div class="act-pred-q" data-act="' + actId + '" data-q="' + i + '">';
    html += '<div class="act-pred-q-label">' + (i + 1) + '. ' + q.label + '</div>';
    html += '<div class="act-pred-q-options">';
    for (var o = 0; o < q.options.length; o++) {
      html += '<div class="act-pred-q-option" data-act="' + actId + '" data-q="' + i + '" data-opt="' + o + '" onclick="predOptClick(this)">';
      html += '<div class="act-radio-dot"></div><span>' + q.options[o] + '</span></div>';
    }
    html += '</div>';
    html += '<div class="act-pred-q-reveal" id="' + actId + '-pred-reveal-' + i + '">';
    html += '<div class="act-pred-q-answer">' + q.reveal + '</div></div>';
    html += '<div class="act-pred-q-feedback" id="' + actId + '-pred-fb-' + i + '"></div>';
    html += '</div>';
  }
  html += '</div>';
  return html;
}
function predOptClick(el) {
  var actId = el.getAttribute('data-act');
  var qIdx = el.getAttribute('data-q');
  var state = ACT_STATES[actId];
  if (state && state.answered) return;
  var qEl = document.querySelector('[data-act="' + actId + '"].act-pred-q[data-q="' + qIdx + '"]');
  qEl.querySelectorAll('.act-pred-q-option').forEach(function(o) { o.classList.remove('selected'); });
  el.classList.add('selected');
}
function checkPrediction(actId, cfg) {
  var correct = 0;
  var total = cfg.questions.length;
  var allAnswered = true;
  for (var i = 0; i < total; i++) {
    var qEl = document.querySelector('[data-act="' + actId + '"].act-pred-q[data-q="' + i + '"]');
    var selected = qEl.querySelector('.act-pred-q-option.selected');
    var revealEl = document.getElementById(actId + '-pred-reveal-' + i);
    var fb = document.getElementById(actId + '-pred-fb-' + i);
    if (revealEl) revealEl.classList.add('show');
    if (!selected) { allAnswered = false; continue; }
    var optIdx = parseInt(selected.getAttribute('data-opt'));
    qEl.querySelectorAll('.act-pred-q-option').forEach(function(o) { o.classList.add('disabled'); });
    if (optIdx === cfg.questions[i].correct) {
      selected.classList.add('correct');
      correct++;
      if (fb) { fb.className = 'act-pred-q-feedback show correct'; fb.innerHTML = '<strong>Correct.</strong> ' + (cfg.questions[i].feedbackCorrect || ''); }
    } else {
      selected.classList.add('incorrect');
      var correctOpt = qEl.querySelector('[data-opt="' + cfg.questions[i].correct + '"]');
      if (correctOpt) correctOpt.classList.add('correct');
      if (fb) { fb.className = 'act-pred-q-feedback show incorrect'; fb.innerHTML = '<strong>Not quite.</strong> ' + (cfg.questions[i].feedbackIncorrect || ''); }
    }
  }
  if (!allAnswered) {
    ACT_STATES[actId].answered = false;
    showFeedback(actId, false, 'Please answer all questions first.');
    return;
  }
  var msg = correct === total
    ? 'Perfect prediction!'
    : 'You got ' + correct + ' of ' + total + ' correct. Review the explanations revealed above.';
  showFeedback(actId, correct === total, msg);
}

// ===== CONCLUDE (what can/cannot be concluded) =====
function renderConcludeBody(actId, cfg) {
  var html = '<div class="act-conc-questions">';
  for (var i = 0; i < cfg.questions.length; i++) {
    var q = cfg.questions[i];
    html += '<div class="act-conc-q" data-act="' + actId + '" data-q="' + i + '">';
    html += '<div class="act-conc-q-label">' + (i + 1) + '. ' + q.label + '</div>';
    html += '<div class="act-conc-q-options">';
    for (var o = 0; o < q.options.length; o++) {
      html += '<div class="act-conc-q-option" data-act="' + actId + '" data-q="' + i + '" data-opt="' + o + '" onclick="concOptClick(this)">';
      html += '<div class="act-radio-dot"></div><span>' + q.options[o] + '</span></div>';
    }
    html += '</div>';
    html += '<div class="act-conc-q-feedback" id="' + actId + '-conc-fb-' + i + '"></div>';
    html += '</div>';
  }
  html += '</div>';
  return html;
}
function concOptClick(el) {
  var actId = el.getAttribute('data-act');
  var qIdx = el.getAttribute('data-q');
  var state = ACT_STATES[actId];
  if (state && state.answered) return;
  var qEl = document.querySelector('[data-act="' + actId + '"].act-conc-q[data-q="' + qIdx + '"]');
  qEl.querySelectorAll('.act-conc-q-option').forEach(function(o) { o.classList.remove('selected'); });
  el.classList.add('selected');
}
function checkConclude(actId, cfg) {
  var correct = 0;
  var total = cfg.questions.length;
  var allAnswered = true;
  for (var i = 0; i < total; i++) {
    var qEl = document.querySelector('[data-act="' + actId + '"].act-conc-q[data-q="' + i + '"]');
    var selected = qEl.querySelector('.act-conc-q-option.selected');
    var fb = document.getElementById(actId + '-conc-fb-' + i);
    if (!selected) { allAnswered = false; continue; }
    var optIdx = parseInt(selected.getAttribute('data-opt'));
    qEl.querySelectorAll('.act-conc-q-option').forEach(function(o) { o.classList.add('disabled'); });
    if (optIdx === cfg.questions[i].correct) {
      selected.classList.add('correct');
      correct++;
      if (fb) { fb.className = 'act-conc-q-feedback show correct'; fb.innerHTML = '<strong>Correct.</strong> ' + cfg.questions[i].feedback; }
    } else {
      selected.classList.add('incorrect');
      var correctOpt = qEl.querySelector('[data-opt="' + cfg.questions[i].correct + '"]');
      if (correctOpt) correctOpt.classList.add('correct');
      if (fb) { fb.className = 'act-conc-q-feedback show incorrect'; fb.innerHTML = '<strong>Not quite.</strong> ' + cfg.questions[i].feedback; }
    }
  }
  if (!allAnswered) {
    ACT_STATES[actId].answered = false;
    showFeedback(actId, false, 'Please answer all questions first.');
    return;
  }
  var msg = correct === total
    ? 'Excellent conclusions!'
    : 'You got ' + correct + ' of ' + total + ' correct.';
  showFeedback(actId, correct === total, msg);
}
// ===== IDENTIFY IV/DV =====
function renderIdentifyIVDVBody(actId, cfg) {
  var html = '<div class="act-id-items">';
  for (var i = 0; i < cfg.items.length; i++) {
    var item = cfg.items[i];
    html += '<div class="act-id-item" data-act="' + actId + '" data-item="' + i + '">';
    html += '<div class="act-id-item-text">' + item.text + '</div>';
    html += '<div class="act-id-item-selects">';
    html += '<select class="act-fb-select act-id-select" data-act="' + actId + '" data-item="' + i + '" data-role="role">';
    html += '<option value="">Identify as...</option>';
    html += '<option value="IV">Independent Variable</option>';
    html += '<option value="DV">Dependent Variable</option>';
    html += '<option value="control">Control/Extraneous</option>';
    html += '<option value="other">Other</option>';
    html += '</select>';
    html += '</div></div>';
  }
  html += '</div>';
  return html;
}
function checkIdentifyIVDV(actId, cfg) {
  var correct = 0;
  var total = cfg.items.length;
  var selects = document.querySelectorAll('.act-id-select[data-act="' + actId + '"]');
  selects.forEach(function(sel, idx) {
    sel.disabled = true;
    var val = sel.value;
    if (val === cfg.items[idx].role) {
      sel.classList.add('correct');
      correct++;
    } else {
      sel.classList.add('incorrect');
      var hint = document.createElement('div');
      hint.className = 'act-fb-correct-answer';
      hint.textContent = '\u2192 ' + cfg.items[idx].role + ': ' + (cfg.items[idx].explain || '');
      sel.parentElement.appendChild(hint);
    }
  });
  var msg = correct === total
    ? 'Perfect! All variables correctly identified.'
    : 'You identified ' + correct + ' of ' + total + ' correctly.';
  showFeedback(actId, correct === total, msg);
}

// ===== SPOT CONFOUND =====
function renderSpotConfoundBody(actId, cfg) {
  var html = '<div class="act-stp-items">';
  for (var i = 0; i < cfg.items.length; i++) {
    var item = cfg.items[i];
    html += '<div class="act-stp-item" data-act="' + actId + '" data-stp="' + i + '" onclick="stpToggle(this)">';
    html += '<div class="act-stp-checkbox"></div>';
    html += '<div class="act-stp-item-text">' + item.text + '</div>';
    html += '</div>';
    html += '<div class="act-stp-explain" id="' + actId + '-stp-ex-' + i + '">' + (item.explain || '') + '</div>';
  }
  html += '</div>';
  return html;
}
function checkSpotConfound(actId, cfg) {
  var items = cfg.items;
  var selected = [];
  document.querySelectorAll('.act-stp-item[data-act="' + actId + '"].selected').forEach(function(el) {
    selected.push(parseInt(el.getAttribute('data-stp')));
  });
  var score = 0;
  for (var j = 0; j < items.length; j++) {
    var el = document.querySelector('.act-stp-item[data-act="' + actId + '"][data-stp="' + j + '"]');
    var explainEl = document.getElementById(actId + '-stp-ex-' + j);
    el.classList.add('locked');
    el.classList.remove('selected');
    var isProblem = items[j].isProblem;
    var wasSelected = selected.indexOf(j) !== -1;
    if (isProblem && wasSelected) { el.classList.add('correct'); score++; }
    else if (!isProblem && wasSelected) { el.classList.add('incorrect'); }
    else if (isProblem && !wasSelected) { el.classList.add('missed'); }
    if (explainEl) explainEl.classList.add('show');
  }
  var total = items.filter(function(it) { return it.isProblem; }).length;
  var msg = score === total && selected.length === total
    ? 'Excellent! You identified all the confounds.'
    : 'You identified ' + score + ' of ' + total + ' confounds.';
  showFeedback(actId, score === total && selected.length === total, msg);
}

// ===== OPERATIONALISE (match construct to measure) =====
function renderOperationaliseBody(actId, cfg) {
  var html = '<div class="act-op-items">';
  for (var i = 0; i < cfg.items.length; i++) {
    var item = cfg.items[i];
    html += '<div class="act-op-item" data-act="' + actId + '" data-item="' + i + '">';
    html += '<div class="act-op-construct">' + item.construct + '</div>';
    html += '<div class="act-op-arrow">\u2192</div>';
    html += '<select class="act-fb-select act-op-select" data-act="' + actId + '" data-item="' + i + '">';
    html += '<option value="">Choose an operationalisation...</option>';
    var opts = shuffleArrayLocal(item.options.slice());
    for (var o = 0; o < opts.length; o++) {
      html += '<option value="' + opts[o] + '">' + opts[o] + '</option>';
    }
    html += '</select>';
    html += '</div>';
  }
  html += '</div>';
  return html;
}
function checkOperationalise(actId, cfg) {
  var correct = 0;
  var total = cfg.items.length;
  var selects = document.querySelectorAll('.act-op-select[data-act="' + actId + '"]');
  selects.forEach(function(sel, idx) {
    sel.disabled = true;
    var val = sel.value;
    if (val === cfg.items[idx].correct) {
      sel.classList.add('correct');
      correct++;
    } else {
      sel.classList.add('incorrect');
    }
  });
  var msg = correct === total
    ? 'Perfect! All constructs correctly operationalised.'
    : 'You got ' + correct + ' of ' + total + ' correct.';
  showFeedback(actId, correct === total, msg);
}

// ===== SYNTHESIS (section synthesis challenge) =====
function renderSynthesisBody(actId, cfg) {
  var html = '';
  if (cfg.prompt) html += '<div class="act-prompt">' + cfg.prompt + '</div>';
  if (cfg.scaffolding) {
    html += '<div class="act-scaffolding"><strong>Structure your answer:</strong> ' + cfg.scaffolding + '</div>';
  }
  html += '<textarea class="act-textarea" id="' + actId + '-input" placeholder="' + (cfg.placeholder || 'Write your synthesis here...') + '"></textarea>';
  html += '<div class="act-word-count" id="' + actId + '-wc">0 words</div>';
  return html;
}
