// =============================================
// REVEAL SYSTEM — collapsible content
// =============================================
document.addEventListener('DOMContentLoaded', function() {

  // Collapsibles — toggle open class on .collapsible parent for CSS-driven show/hide
  document.querySelectorAll('.collapsible-trigger').forEach(function(trigger) {
    trigger.addEventListener('click', function() {
      var wrapper = this.parentElement;
      var isOpen = wrapper.classList.contains('open');
      // Close all sibling collapsibles in the same parent
      var parent = wrapper.parentElement;
      parent.querySelectorAll('.collapsible.open').forEach(function(c) {
        c.classList.remove('open');
      });
      if (!isOpen) {
        wrapper.classList.add('open');
      }
    });
  });

  // Reveal-answer boxes
  document.querySelectorAll('.reveal-question').forEach(function(label) {
    label.addEventListener('click', function() {
      var reveal = this.parentElement;
      var answer = reveal.querySelector('.reveal-answer');
      var isOpen = reveal.classList.contains('open');
      if (isOpen) {
        reveal.classList.remove('open');
      } else {
        reveal.classList.add('open');
        if (reveal.classList.contains('open')) playRevealSound();
      }
    });
  });

  // Term cards
  document.querySelectorAll('.term-card .term-label').forEach(function(label) {
    label.addEventListener('click', function() {
      var card = this.closest('.term-card');
      card.classList.toggle('open');
      playRevealSound();
    });
  });

  // Step cards
  document.querySelectorAll('.step-card').forEach(function(step) {
    step.addEventListener('click', function() { step.classList.toggle('open'); playRevealSound(); });
  });

  // Process step cards (scientific method, etc.)
  document.querySelectorAll('.process-step-content').forEach(function(step) {
    step.addEventListener('click', function() { step.classList.toggle('open'); playRevealSound(); });
  });

  // Theory bank concept buttons
  document.querySelectorAll('.concept-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var target = this.getAttribute('data-concept');
      var detail = document.getElementById('concept-' + target);
      var isActive = this.classList.contains('active');
      // Close all concept details
      document.querySelectorAll('.concept-btn').forEach(function(b) { b.classList.remove('active'); });
      document.querySelectorAll('.concept-detail').forEach(function(d) { d.style.display = 'none'; });
      if (!isActive && detail) {
        this.classList.add('active');
        detail.style.display = 'block';
      }
    });
  });

  // Slide navigation
  initSlideNav();
});

function infoTileToggle(el) {
  var detail = el.nextElementSibling;
  var isOpen = detail && detail.classList.contains('visible');
  // Close all info tile details in the same grid
  var grid = el.parentElement;
  grid.querySelectorAll('.info-tile-detail.visible').forEach(function(d) {
    d.classList.remove('visible');
  });
  if (!isOpen && detail && detail.classList.contains('info-tile-detail')) {
    detail.classList.add('visible');
  }
  playRevealSound();
}

// =============================================
// SOUND — subtle pop
// =============================================
function playRevealSound() {
  try {
    var ctx = new (window.AudioContext || window.webkitAudioContext)();
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  } catch(e) {}
}

// =============================================
// SLIDE NAVIGATION
// =============================================
function initSlideNav() {
  var slides = document.querySelectorAll('.slide');
  if (slides.length === 0) return;
  var counter = document.getElementById('slide-counter');
  var prevBtn = document.getElementById('prev-btn');
  var nextBtn = document.getElementById('next-btn');
  var current = 0;
  var total = slides.length;

  // Progress rail scroll via transform (no CSS overflow needed)
  var rail = document.getElementById('progress-rail');
  var railOffset = 0;
  function clampRailScroll() {
    if (!rail) return;
    var railH = rail.scrollHeight || rail.getBoundingClientRect().height;
    var maxOffset = Math.max(0, railH - window.innerHeight * 0.8);
    railOffset = Math.max(0, Math.min(railOffset, maxOffset));
    rail.style.transform = 'translateY(calc(-50% + ' + railOffset + 'px))';
  }
  if (rail) {
    rail.addEventListener('wheel', function(e) {
      e.preventDefault();
      railOffset += e.deltaY * 0.5;
      clampRailScroll();
    }, { passive: false });
  }

  function showSlide(n) {
    slides[current].classList.remove('active');
    current = n;
    slides[current].classList.add('active');
    if (counter) counter.textContent = (current + 1) + ' / ' + total;
    if (prevBtn) prevBtn.classList.toggle('hidden', current === 0);
    if (nextBtn) nextBtn.classList.toggle('hidden', current === total - 1);
    // Update progress rail
    var dots = document.querySelectorAll('.rail-dot');
    dots.forEach(function(dot, i) {
      dot.classList.toggle('active', i === current);
    });
    // Auto-scroll rail to keep active dot visible
    if (rail && dots[current]) {
      var dotEl = dots[current];
      var railRect = rail.getBoundingClientRect();
      var dotRect = dotEl.getBoundingClientRect();
      if (dotRect.top < railRect.top || dotRect.bottom > railRect.bottom) {
        var dotCenter = (dotRect.top + dotRect.bottom) / 2;
        var railCenter = (railRect.top + railRect.bottom) / 2;
        railOffset += dotCenter - railCenter;
        clampRailScroll();
      }
    }
    // Scroll to top of slide
    var container = document.querySelector('.slide-container');
    if (container) container.scrollTop = 0;
  }

  if (prevBtn) prevBtn.addEventListener('click', function() {
    if (current > 0) showSlide(current - 1);
  });
  if (nextBtn) nextBtn.addEventListener('click', function() {
    if (current < total - 1) showSlide(current + 1);
  });

  // Keyboard nav
  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      if (current < total - 1) showSlide(current + 1);
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      if (current > 0) showSlide(current - 1);
    }
  });

  // Progress rail click-to-navigate
  var dots = document.querySelectorAll('.rail-dot');
  dots.forEach(function(dot, i) {
    dot.addEventListener('click', function() { showSlide(i); });
  });

  // Set initial state — check for hash link from index pages
  var hash = window.location.hash;
  if (hash) {
    var slideNum = -1;
    if (hash.indexOf('#slide-') === 0) {
      var targetEl = document.getElementById(hash.slice(1));
      if (targetEl) {
        for (var i = 0; i < slides.length; i++) {
          if (slides[i] === targetEl) {
            slideNum = i;
            break;
          }
        }
      }
    } else if (hash.indexOf('#') === 0) {
      // Activity anchor like #intro-pred-science — find which slide contains it
      var targetEl = document.querySelector(hash);
      if (targetEl) {
        var parentSlide = targetEl.closest('.slide');
        if (parentSlide) {
          for (var i = 0; i < slides.length; i++) {
            if (slides[i] === parentSlide) { slideNum = i; break; }
          }
        }
      }
    }
    if (slideNum >= 0 && slideNum < total) {
      showSlide(slideNum);
    } else {
      showSlide(0);
    }
  } else {
    showSlide(0);
  }
}

// =============================================
// STAGED ACTIVITIES
// =============================================
function advanceStagedActivity(boxId) {
  var box = document.getElementById(boxId);
  if (!box) return;
  var steps = box.querySelectorAll('.activity-step');
  var currentActive = box.querySelector('.activity-step.active');
  var nextStep = currentActive ? currentActive.nextElementSibling : null;
  if (nextStep && nextStep.classList.contains('activity-step')) {
    currentActive.classList.remove('active');
    nextStep.classList.add('active');
    playRevealSound();
  }
}

function activityNext(boxId, currentStep) {
  var box = document.getElementById(boxId);
  if (!box) return;
  var current = box.querySelector('.activity-step[data-step="' + currentStep + '"]');
  if (current) current.classList.remove('active');
  var next = box.querySelector('.activity-step[data-step="' + (currentStep + 1) + '"]');
  if (next) {
    next.classList.add('active');
    playRevealSound();
  }
}

function firstImpressionsChoose(choice) {
  var box = document.getElementById('first-impressions');
  var current = box.querySelector('.activity-step.active');
  if (current) current.classList.remove('active');
  var result = box.querySelector('.activity-step[data-step="7"]');
  result.classList.add('active');
  playRevealSound();
}

function falseMemoryChoose(choice) {
  var box = document.getElementById('false-memory');
  var current = box.querySelector('.activity-step.active');
  if (current) current.classList.remove('active');
  var result = box.querySelector('.activity-step[data-step="4"]');
  result.classList.add('active');
  playRevealSound();
}

function duckRabbitSwitch() {
  var options = document.getElementById('dr-options');
  var reveal = document.getElementById('dr-reveal');
  var content = document.getElementById('dr-reveal-content');
  var duckLabel = document.getElementById('dr-duck-label');
  var rabbitLabel = document.getElementById('dr-rabbit-label');
  var switchBtn = document.getElementById('dr-switch');

  if (duckLabel.getAttribute('opacity') === '1') {
    duckLabel.setAttribute('opacity', '0');
    rabbitLabel.setAttribute('opacity', '1');
    content.innerHTML = '<strong>You see a Rabbit!</strong> Some people see a rabbit looking to the right. The ears are on top, and the small circle is the eye.';
  } else {
    rabbitLabel.setAttribute('opacity', '0');
    duckLabel.setAttribute('opacity', '1');
    content.innerHTML = '<strong>You see a Duck!</strong> Some people see a duck looking to the left. The beak is on the left side, and the bump on top is the head.';
  }
  playRevealSound();
}

// =============================================
// DUCK-RABBIT
// =============================================
function duckRabbitChoose(choice) {
  var options = document.getElementById('dr-options');
  var reveal = document.getElementById('dr-reveal');
  var content = document.getElementById('dr-reveal-content');
  var duckLabel = document.getElementById('dr-duck-label');
  var rabbitLabel = document.getElementById('dr-rabbit-label');

  options.style.display = 'none';
  reveal.classList.add('visible');

  if (choice === 'duck') {
    duckLabel.setAttribute('opacity', '1');
    content.innerHTML = '<strong>You see a Duck!</strong> Some people see a duck looking to the left. The beak is on the left side, and the bump on top is the head.';
  } else {
    rabbitLabel.setAttribute('opacity', '1');
    content.innerHTML = '<strong>You see a Rabbit!</strong> Some people see a rabbit looking to the right. The ears are on top, and the small circle is the eye.';
  }
  playRevealSound();
}

// =============================================
// MULLER-LYER
// =============================================
function mullerLyerReveal() {
  var reveal = document.getElementById('ml-reveal');
  if (reveal) {
    reveal.classList.add('visible');
    playRevealSound();
  }
}

// =============================================
// SCIENTIFIC METHOD — Staged
// =============================================
function sciMethodNext() {
  advanceStagedActivity('sci-method');
}

var sciMethodData = [
  {
    title: 'Observe',
    desc: 'You notice something interesting or puzzling in the world around you.',
    example: 'You notice that students who sleep more often seem more alert and focused during morning classes, while those who stay up late often struggle to concentrate.'
  },
  {
    title: 'Question',
    desc: 'Turn your observation into a clear, testable question.',
    example: 'Does getting more sleep improve students\' attention and focus in class?'
  },
  {
    title: 'Hypothesise',
    desc: 'Make a prediction — an educated guess about what you think will happen.',
    example: 'Students who get 8+ hours of sleep will perform better on an attention task than students who get fewer than 6 hours.'
  },
  {
    title: 'Test',
    desc: 'Design and run an experiment or study to test your hypothesis.',
    example: 'Recruit 40 students. Half sleep 8+ hours for one week; the other half sleep fewer than 6 hours. All students complete the same attention test each morning.'
  },
  {
    title: 'Analyse',
    desc: 'Collect your data and look for patterns or differences between groups.',
    example: 'The well-rested group scored an average of 85% on the attention test, while the sleep-deprived group scored an average of 62%.'
  },
  {
    title: 'Conclude',
    desc: 'Decide whether your results support or refute your hypothesis.',
    example: 'The results support the hypothesis — more sleep appears to improve attention. However, other factors (stress, diet) could also play a role, so further research is needed.'
  }
];

var activeSciStep = -1;

function sciMethodClick(stepIndex) {
  var steps = document.querySelectorAll('.sci-method-step');
  var detail = document.getElementById('sci-method-detail');
  var content = document.getElementById('sci-method-detail-content');

  // Toggle off if clicking same step
  if (activeSciStep === stepIndex) {
    steps[stepIndex].classList.remove('active');
    detail.classList.remove('visible');
    activeSciStep = -1;
    return;
  }

  // Update active step highlight
  steps.forEach(function(s) { s.classList.remove('active'); });
  steps[stepIndex].classList.add('active');
  activeSciStep = stepIndex;

  // Populate detail content
  var data = sciMethodData[stepIndex];
  content.innerHTML =
    '<strong>' + data.title + '</strong><br>' +
    data.desc +
    '<div style="margin-top:.5rem; padding-top:.5rem; border-top:1px solid var(--border);">' +
    '<strong style="color:var(--primary);">Example: </strong>' + data.example +
    '</div>';

  detail.classList.add('visible');
  playRevealSound();
}

// =============================================
// FIRST IMPRESSIONS — Staged
// =============================================
function firstImpressionsNext() {
  advanceStagedActivity('first-impressions');
}

// =============================================
// FALSE MEMORY — Staged
// =============================================
function falseMemoryNext() {
  advanceStagedActivity('false-memory');
}

// =============================================
// GORILLA — Reveal answer
// =============================================
function gorillaReveal() {
  var box = document.getElementById('gorilla-experiment');
  box.querySelector('.activity-step.active').classList.remove('active');
  var result = box.querySelector('.activity-step[data-step="4"]');
  result.classList.add('active');
  playRevealSound();
}

// =============================================
// PAPER CARDS — accordion for exam papers
// =============================================
var activePaper = null;

function togglePaper(paperId) {
  var cards = document.querySelectorAll('.paper-card');
  var details = document.querySelectorAll('.paper-detail');
  var clickedCard = document.querySelector('.paper-card[data-paper="' + paperId + '"]');
  var clickedDetail = document.querySelector('.paper-detail[data-detail="' + paperId + '"]');

  if (activePaper === paperId) {
    clickedCard.classList.remove('active');
    clickedDetail.classList.remove('open');
    activePaper = null;
    return;
  }

  cards.forEach(function(c) { c.classList.remove('active'); });
  details.forEach(function(d) { d.classList.remove('open'); });

  clickedCard.classList.add('active');
  clickedDetail.classList.add('open');
  activePaper = paperId;
}

// =============================================
// IA ASSESSMENT CARDS — accordion
// =============================================
var activeIACard = null;

function toggleIACard(cardId) {
  var cards = document.querySelectorAll('.ia-assessment-card');
  var details = document.querySelectorAll('.ia-assessment-detail');
  var clickedCard = document.querySelector('.ia-assessment-card[data-ia="' + cardId + '"]');
  var clickedDetail = document.querySelector('.ia-assessment-detail[data-ia="' + cardId + '"]');

  if (activeIACard === cardId) {
    clickedCard.classList.remove('active');
    clickedDetail.classList.remove('open');
    activeIACard = null;
    return;
  }

  cards.forEach(function(c) { c.classList.remove('active'); });
  details.forEach(function(d) { d.classList.remove('open'); });

  clickedCard.classList.add('active');
  clickedDetail.classList.add('open');
  activeIACard = cardId;
}

// =============================================
// QUIZ ENGINE — full interactive challenge system
// =============================================
var quizStates = {};
var QUIZ_DATA = {};

function shuffleArray(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

function initQuiz(quizId, questions, shuffle) {
  questions = (questions || []).map(function(q) {
    if (!q) return q;
    if (!q.options && q.opts) {
      return {
        type: q.type || 'mc',
        scenario: q.scenario,
        prompt: q.q,
        options: q.opts,
        correct: (typeof q.a === 'number') ? q.a : (typeof q.correct === 'number' ? q.correct : 0),
        feedback: q.feedback || {
          correct: q.explanation ? 'Correct. ' + q.explanation : 'Correct!',
          incorrect: q.explanation ? 'Not quite. ' + q.explanation : 'Not quite.'
        }
      };
    }
    if (q.type === 'mc' && !q.feedback) {
      q.feedback = { correct: 'Correct!', incorrect: 'Not quite.' };
    }
    return q;
  });
  var qs = shuffle ? shuffleArray(questions) : questions.slice();
  QUIZ_DATA[quizId] = questions;
  quizStates[quizId] = {
    questions: qs,
    original: questions,
    current: 0,
    score: 0,
    answered: false,
    attempts: 0
  };
  renderQuizQuestion(quizId);
}

function renderQuizQuestion(quizId) {
  var state = quizStates[quizId];
  if (!state) return;
  var q = state.questions[state.current];
  var total = state.questions.length;
  var idx = state.current;

  var progressFill = document.getElementById(quizId + '-progress-fill');
  var progressText = document.getElementById(quizId + '-progress-text');
  var scoreText = document.getElementById(quizId + '-score-text');
  var questionArea = document.getElementById(quizId + '-question');
  var resultArea = document.getElementById(quizId + '-result');

  if (progressFill) progressFill.style.width = ((idx / total) * 100) + '%';
  if (progressText) progressText.textContent = 'Challenge ' + (idx + 1) + ' of ' + total;
  if (scoreText) scoreText.textContent = state.score + ' / ' + total;
  if (resultArea) { resultArea.classList.remove('show'); resultArea.style.display = 'none'; }
  if (questionArea) questionArea.style.display = 'block';

  state.answered = false;
  state.attempts = 0;

  if (q.type === 'mc') {
    renderMCQuestion(quizId, q, idx, total);
  } else if (q.type === 'order') {
    renderOrderQuestion(quizId, q, idx, total);
  }
}

function renderMCQuestion(quizId, q, idx, total) {
  var questionArea = document.getElementById(quizId + '-question');
  var colsClass = q.options.length <= 4 ? '' : ' cols-2';
  var html = '';
  if (q.scenario) html += '<div class="quiz-scenario">' + q.scenario + '</div>';
  html += '<div class="quiz-prompt">' + q.prompt + '</div>';
  html += '<div class="quiz-options' + colsClass + '">';
  for (var i = 0; i < q.options.length; i++) {
    html += '<button class="quiz-option" data-quiz="' + quizId + '" data-idx="' + i + '" onclick="quizMCAnswer(\'' + quizId + '\',' + i + ')">' + q.options[i] + '</button>';
  }
  html += '</div>';
  html += '<div class="quiz-feedback" id="' + quizId + '-feedback"></div>';
  html += '<div class="quiz-next-area" id="' + quizId + '-next">';
  if (idx < total - 1) {
    html += '<button class="quiz-btn quiz-btn-primary" onclick="quizNext(\'' + quizId + '\')">Next Challenge →</button>';
  } else {
    html += '<button class="quiz-btn quiz-btn-primary" onclick="quizShowResult(\'' + quizId + '\')">See Results</button>';
  }
  html += '</div>';
  questionArea.innerHTML = html;
}

function renderOrderQuestion(quizId, q, idx, total) {
  var questionArea = document.getElementById(quizId + '-question');
  var items = shuffleArray(q.items);
  var html = '';
  if (q.scenario) html += '<div class="quiz-scenario">' + q.scenario + '</div>';
  html += '<div class="quiz-prompt">' + q.prompt + '</div>';
  html += '<div class="quiz-order-list" id="' + quizId + '-order-list">';
  for (var i = 0; i < items.length; i++) {
    html += '<div class="quiz-order-item" data-value="' + items[i] + '" draggable="true" onclick="quizOrderSelect(this)">';
    html += '<span class="quiz-order-num">' + (i + 1) + '</span>';
    html += '<span class="quiz-order-text">' + items[i] + '</span>';
    html += '</div>';
  }
  html += '</div>';
  html += '<div style="margin-top:.5rem;">';
  html += '<button class="quiz-btn quiz-btn-primary" id="' + quizId + '-check-order" onclick="quizOrderCheck(\'' + quizId + '\')">Check My Order</button>';
  html += '</div>';
  html += '<div class="quiz-feedback" id="' + quizId + '-feedback"></div>';
  html += '<div class="quiz-next-area" id="' + quizId + '-next">';
  if (idx < total - 1) {
    html += '<button class="quiz-btn quiz-btn-primary" onclick="quizNext(\'' + quizId + '\')">Next Challenge →</button>';
  } else {
    html += '<button class="quiz-btn quiz-btn-primary" onclick="quizShowResult(\'' + quizId + '\')">See Results</button>';
  }
  html += '</div>';
  questionArea.innerHTML = html;

  // Enable drag reorder
  enableDragReorder(document.getElementById(quizId + '-order-list'));
}

function enableDragReorder(list) {
  var dragItem = null;
  list.querySelectorAll('.quiz-order-item').forEach(function(item) {
    item.addEventListener('dragstart', function(e) {
      dragItem = this;
      this.style.opacity = '0.4';
      e.dataTransfer.effectAllowed = 'move';
    });
    item.addEventListener('dragend', function() {
      this.style.opacity = '1';
      dragItem = null;
      list.querySelectorAll('.quiz-order-item').forEach(function(i) { i.classList.remove('drag-over'); });
    });
    item.addEventListener('dragover', function(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      this.classList.add('drag-over');
    });
    item.addEventListener('dragleave', function() {
      this.classList.remove('drag-over');
    });
    item.addEventListener('drop', function(e) {
      e.preventDefault();
      this.classList.remove('drag-over');
      if (dragItem !== this) {
        var allItems = Array.from(list.querySelectorAll('.quiz-order-item'));
        var fromIdx = allItems.indexOf(dragItem);
        var toIdx = allItems.indexOf(this);
        if (fromIdx < toIdx) {
          list.insertBefore(dragItem, this.nextSibling);
        } else {
          list.insertBefore(dragItem, this);
        }
        renumberOrderItems(list);
      }
    });
  });
}

function renumberOrderItems(list) {
  list.querySelectorAll('.quiz-order-item').forEach(function(item, i) {
    item.querySelector('.quiz-order-num').textContent = i + 1;
  });
}

var selectedOrderItem = null;

function quizOrderSelect(el) {
  if (el.classList.contains('locked')) return;
  if (selectedOrderItem && selectedOrderItem !== el) {
    // Swap the two items
    var list = el.parentElement;
    var allItems = Array.from(list.querySelectorAll('.quiz-order-item'));
    var fromIdx = allItems.indexOf(selectedOrderItem);
    var toIdx = allItems.indexOf(el);
    if (fromIdx < toIdx) {
      list.insertBefore(selectedOrderItem, el.nextSibling);
    } else {
      list.insertBefore(selectedOrderItem, el);
    }
    renumberOrderItems(list);
    selectedOrderItem.classList.remove('selected');
    selectedOrderItem = null;
  } else if (selectedOrderItem === el) {
    el.classList.remove('selected');
    selectedOrderItem = null;
  } else {
    selectedOrderItem = el;
    el.classList.add('selected');
  }
}

function quizOrderCheck(quizId) {
  var state = quizStates[quizId];
  if (!state || state.answered) return;
  state.answered = true;

  var q = state.questions[state.current];
  var list = document.getElementById(quizId + '-order-list');
  var items = list.querySelectorAll('.quiz-order-item');
  var userOrder = [];
  items.forEach(function(item) { userOrder.push(item.getAttribute('data-value')); });

  var correct = true;
  for (var i = 0; i < q.answer.length; i++) {
    if (userOrder[i] !== q.answer[i]) { correct = false; break; }
  }

  var feedback = document.getElementById(quizId + '-feedback');
  var nextArea = document.getElementById(quizId + '-next');
  var checkBtn = document.getElementById(quizId + '-check-order');

  items.forEach(function(item) { item.classList.add('locked'); });
  if (checkBtn) checkBtn.style.display = 'none';
  selectedOrderItem = null;

  if (correct) {
    state.score++;
    list.querySelectorAll('.quiz-order-item').forEach(function(item) {
      item.style.borderColor = '#38A169';
      item.style.background = '#F0FFF4';
    });
    feedback.className = 'quiz-feedback show correct';
    feedback.innerHTML = '<span class="quiz-feedback-icon">✓</span> ' + q.feedback.correct;
  } else {
    list.querySelectorAll('.quiz-order-item').forEach(function(item, i) {
      if (userOrder[i] === q.answer[i]) {
        item.style.borderColor = '#38A169';
        item.style.background = '#F0FFF4';
      } else {
        item.style.borderColor = '#E53E3E';
        item.style.background = '#FFF5F5';
      }
    });
    feedback.className = 'quiz-feedback show incorrect';
    feedback.innerHTML = '<span class="quiz-feedback-icon">✗</span> ' + q.feedback.incorrect + '<br><br><strong>Correct order:</strong> ' + q.answer.join(' → ');
  }

  var scoreText = document.getElementById(quizId + '-score-text');
  if (scoreText) scoreText.textContent = state.score + ' / ' + state.questions.length;

  if (nextArea) nextArea.classList.add('show');
  playRevealSound();
}

function quizMCAnswer(quizId, chosen) {
  var state = quizStates[quizId];
  if (!state || state.answered) return;
  state.answered = true;

  var q = state.questions[state.current];
  var options = document.querySelectorAll('[data-quiz="' + quizId + '"].quiz-option');
  var feedback = document.getElementById(quizId + '-feedback');
  var nextArea = document.getElementById(quizId + '-next');

  options.forEach(function(opt) { opt.classList.add('disabled'); });

  if (chosen === q.correct) {
    state.score++;
    options[chosen].classList.add('correct');
    feedback.className = 'quiz-feedback show correct';
    feedback.innerHTML = '<span class="quiz-feedback-icon">✓</span> ' + q.feedback.correct;
  } else {
    options[chosen].classList.add('incorrect');
    options[q.correct].classList.add('correct');
    feedback.className = 'quiz-feedback show incorrect';
    feedback.innerHTML = '<span class="quiz-feedback-icon">✗</span> ' + q.feedback.incorrect;
  }

  var scoreText = document.getElementById(quizId + '-score-text');
  if (scoreText) scoreText.textContent = state.score + ' / ' + state.questions.length;

  if (nextArea) nextArea.classList.add('show');
  playRevealSound();
}

function quizNext(quizId) {
  var state = quizStates[quizId];
  if (!state) return;
  state.current++;
  renderQuizQuestion(quizId);
}

function quizShowResult(quizId) {
  var state = quizStates[quizId];
  if (!state) return;
  var questionArea = document.getElementById(quizId + '-question');
  var resultArea = document.getElementById(quizId + '-result');
  var progressFill = document.getElementById(quizId + '-progress-fill');
  var progressText = document.getElementById(quizId + '-progress-text');

  if (questionArea) questionArea.style.display = 'none';
  if (progressFill) progressFill.style.width = '100%';
  if (progressText) progressText.textContent = 'Complete';

  var pct = Math.round((state.score / state.questions.length) * 100);
  var msg = '';
  if (pct === 100) msg = 'Perfect score! You really know your stuff.';
  else if (pct >= 75) msg = 'Great work! A strong understanding of the material.';
  else if (pct >= 50) msg = 'Good effort. Review the sections you missed and try again.';
  else msg = 'Keep practising. Re-read the teaching slides and try again.';

  if (resultArea) {
    resultArea.innerHTML =
      '<div class="quiz-result-score">' + state.score + ' / ' + state.questions.length + '</div>' +
      '<div class="quiz-result-label">' + pct + '% correct</div>' +
      '<div class="quiz-result-message">' + msg + '</div>' +
      '<button class="quiz-btn quiz-btn-secondary" onclick="quizReset(\'' + quizId + '\')">Try Again</button>';
    resultArea.classList.add('show');
    resultArea.style.display = 'block';
  }
}

function quizReset(quizId) {
  if (typeof QUIZ_DATA !== 'undefined' && QUIZ_DATA[quizId]) {
    initQuiz(quizId, QUIZ_DATA[quizId], true);
  }
}

