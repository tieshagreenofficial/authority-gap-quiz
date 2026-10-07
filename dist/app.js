// Authority Gap Quiz — UI and state machine.
// No analytics, no cookies, no pixels. Current answers live only in memory
// and clear on refresh, per the locked spec.

(function () {
  "use strict";

  var answers = [null, null, null, null, null, null];
  var currentQ = 0;
  var evalResult = null;
  var reviewBuilt = false;

  var els = {
    progressFill: document.getElementById("quizProgressFill"),
    startBtn: document.getElementById("startBtn"),
    qCount: document.getElementById("qCount"),
    qPrompt: document.getElementById("qPrompt"),
    qLegend: document.getElementById("qLegend"),
    qAnswers: document.getElementById("qAnswers"),
    qBack: document.getElementById("qBack"),
    qNext: document.getElementById("qNext"),
    tieOptions: document.getElementById("tieOptions"),
    tieBack: document.getElementById("tieBack"),
    gateForm: document.getElementById("gateForm"),
    gateEmail: document.getElementById("gateEmail"),
    gateError: document.getElementById("gateError"),
    gateSubmit: document.getElementById("gateSubmit"),
    privacyLink: document.getElementById("privacyLink"),
    resultPill: document.getElementById("resultPill"),
    resultTitle: document.getElementById("resultTitle"),
    resultBody: document.getElementById("resultBody"),
    resultUnderneathBlock: document.getElementById("resultUnderneathBlock"),
    resultUnderneath: document.getElementById("resultUnderneath"),
    resultFirstMove: document.getElementById("resultFirstMove"),
    resultNoticeBlock: document.getElementById("resultNoticeBlock"),
    resultNotice: document.getElementById("resultNotice"),
    resultNote: document.getElementById("resultNote"),
    resultBridge: document.getElementById("resultBridge"),
    challengeBtn: document.getElementById("challengeBtn"),
    reviewToggle: document.getElementById("reviewToggle"),
    reviewPanel: document.getElementById("reviewPanel"),
    startOverBtn: document.getElementById("startOverBtn"),
    year: document.getElementById("year")
  };

  function showScreen(name) {
    document.querySelectorAll(".screen").forEach(function (s) {
      s.hidden = s.getAttribute("data-screen") !== name;
    });
    var active = document.querySelector('.screen[data-screen="' + name + '"]');
    var heading = active.querySelector("h1,h2");
    if (heading) {
      heading.setAttribute("tabindex", "-1");
      heading.focus();
    }
    updateProgress(name);
  }

  function updateProgress(name) {
    var pct = 0;
    if (name === "welcome") pct = 0;
    else if (name === "question") pct = (currentQ / 6) * 85;
    else if (name === "tie") pct = 88;
    else if (name === "gate") pct = 94;
    else if (name === "result") pct = 100;
    els.progressFill.style.width = pct + "%";
  }

  function renderQuestion(i) {
    var q = window.QUIZ_QUESTIONS[i];
    els.qCount.textContent = "Question " + (i + 1) + " of 6";
    els.qPrompt.textContent = q.prompt;
    els.qLegend.textContent = q.prompt;
    els.qAnswers.innerHTML = "";

    q.answers.forEach(function (a, idx) {
      var id = "q" + i + "_a" + idx;
      var wrap = document.createElement("div");
      wrap.className = "answer-option";

      var input = document.createElement("input");
      input.type = "radio";
      input.name = "q" + i;
      input.id = id;
      input.value = String(idx);
      if (answers[i] === idx) input.checked = true;

      var label = document.createElement("label");
      label.setAttribute("for", id);
      var dot = document.createElement("span");
      dot.className = "dot";
      dot.setAttribute("aria-hidden", "true");
      var span = document.createElement("span");
      span.textContent = a.text;
      label.appendChild(dot);
      label.appendChild(span);

      wrap.appendChild(input);
      wrap.appendChild(label);
      els.qAnswers.appendChild(wrap);
    });

    els.qBack.style.visibility = i === 0 ? "hidden" : "visible";
    updateNextState();
  }

  function updateNextState() {
    els.qNext.disabled = answers[currentQ] === null;
  }

  els.qAnswers.addEventListener("change", function (e) {
    if (e.target && e.target.name === "q" + currentQ) {
      answers[currentQ] = parseInt(e.target.value, 10);
      updateNextState();
    }
  });

  els.startBtn.addEventListener("click", function () {
    currentQ = 0;
    renderQuestion(0);
    showScreen("question");
  });

  els.qBack.addEventListener("click", function () {
    if (currentQ === 0) {
      showScreen("welcome");
      return;
    }
    currentQ -= 1;
    renderQuestion(currentQ);
    showScreen("question");
  });

  els.qNext.addEventListener("click", function () {
    if (answers[currentQ] === null) return;
    if (currentQ < 5) {
      currentQ += 1;
      renderQuestion(currentQ);
      showScreen("question");
    } else {
      finishQuestions();
    }
  });

  function finishQuestions() {
    try {
      evalResult = window.evaluateQuiz(answers);
    } catch (err) {
      return;
    }
    if (evalResult.resultKey === null) {
      renderTie(evalResult.tiedProfiles);
      showScreen("tie");
    } else {
      showScreen("gate");
    }
  }

  function renderTie(tiedProfiles) {
    els.tieOptions.innerHTML = "";
    tiedProfiles.forEach(function (key) {
      var profile = window.QUIZ_PROFILES[key];
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tie-option";

      var title = document.createElement("span");
      title.className = "tie-title";
      title.textContent = profile.title;

      var sub = document.createElement("span");
      sub.className = "tie-sub";
      sub.textContent = profile.shortStart || "";

      btn.appendChild(title);
      btn.appendChild(sub);
      btn.addEventListener("click", function () {
        evalResult = window.evaluateQuiz(answers, key);
        showScreen("gate");
      });
      els.tieOptions.appendChild(btn);
    });
  }

  els.tieBack.addEventListener("click", function () {
    currentQ = 5;
    renderQuestion(5);
    showScreen("question");
  });

  els.gateForm.addEventListener("submit", function (e) {
    e.preventDefault();
    els.gateError.classList.remove("is-visible");

    var email = els.gateEmail.value.trim();
    if (!email || !els.gateEmail.checkValidity()) {
      els.gateEmail.reportValidity();
      return;
    }
    if (!evalResult || !evalResult.resultKey) return;

    els.gateSubmit.disabled = true;

    var payload = {
      email: email,
      profile: evalResult.resultKey,
      highestTotal: evalResult.highestTotal,
      isTie: evalResult.tiedProfiles.length > 1,
      source: window.location.hostname
    };

    fetch(window.QUIZ_CONFIG.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        if (!res.ok) throw new Error("bad response");
        renderResult(evalResult);
        showScreen("result");
      })
      .catch(function () {
        els.gateSubmit.disabled = false;
        els.gateError.classList.add("is-visible");
      });
  });

  function renderResult(result) {
    var profile = window.QUIZ_PROFILES[result.resultKey];

    els.resultTitle.textContent = profile.title;
    els.resultBody.textContent = profile.body;
    els.resultFirstMove.textContent = profile.firstMove;
    els.resultBridge.textContent = profile.bridge;
    els.challengeBtn.href = window.QUIZ_CONFIG.challengeUrl;

    if (profile.underneath) {
      els.resultUnderneath.textContent = profile.underneath;
      els.resultUnderneathBlock.hidden = false;
    } else {
      els.resultUnderneathBlock.hidden = true;
    }

    if (profile.notice) {
      els.resultNotice.textContent = profile.notice;
      els.resultNoticeBlock.hidden = false;
    } else {
      els.resultNoticeBlock.hidden = true;
    }

    if (result.resultKey === "foundations") {
      els.resultPill.hidden = true;
      els.resultNote.textContent = "This is a reflection of your answers, not a complete picture of your business.";
    } else {
      els.resultPill.hidden = false;
      if (result.highestTotal === 1) {
        els.resultPill.textContent = "A pattern to explore";
        els.resultNote.textContent = "One answer pointed here. Treat this as something to explore, not a label you have to accept.";
      } else {
        els.resultPill.textContent = "Your authority gap";
        els.resultNote.textContent = "This reflects the behaviors you selected. The reason underneath is yours to explore, not something a quiz can decide for you.";
      }
    }

    reviewBuilt = false;
    els.reviewPanel.hidden = true;
    els.reviewPanel.innerHTML = "";
  }

  els.reviewToggle.addEventListener("click", function () {
    if (!reviewBuilt) buildReview();
    els.reviewPanel.hidden = !els.reviewPanel.hidden;
  });

  function buildReview() {
    window.QUIZ_QUESTIONS.forEach(function (q, i) {
      var row = document.createElement("div");
      row.className = "review-row";
      var q4 = document.createElement("b");
      q4.textContent = q.prompt;
      var a = document.createElement("span");
      a.textContent = answers[i] !== null ? q.answers[answers[i]].text : "";
      row.appendChild(q4);
      row.appendChild(a);
      els.reviewPanel.appendChild(row);
    });
    reviewBuilt = true;
  }

  els.startOverBtn.addEventListener("click", resetQuiz);

  function resetQuiz() {
    answers = [null, null, null, null, null, null];
    currentQ = 0;
    evalResult = null;
    els.gateForm.reset();
    els.gateError.classList.remove("is-visible");
    els.gateSubmit.disabled = false;
    showScreen("welcome");
  }

  els.privacyLink.href = window.QUIZ_CONFIG.privacyUrl;
  if (els.year) els.year.textContent = new Date().getFullYear();
})();
