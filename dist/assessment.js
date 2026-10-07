// Authority Gap Quiz — question copy, scoring map, result profiles, evaluate().
// Mirrors the locked spec in "Authority Gap Quiz: developer handoff" (2026-10-05).
// Answer index is zero based. Scoring: one point to the mapped profile per
// chosen answer, never to the answer index. Each profile has exactly three
// scoring opportunities across the six questions (range 0-3).

window.QUIZ_QUESTIONS = [
  {
    prompt: "You have something useful to say. What usually happens next?",
    answers: [
      { text: "I keep it in drafts until I feel ready.", profile: "hidden" },
      { text: "I soften it so nobody takes it the wrong way.", profile: "diluted" },
      { text: "I share it without doing either.", profile: null }
    ]
  },
  {
    prompt: "Someone asks what you do. What sounds most like you?",
    answers: [
      { text: "I give a different answer depending on the day.", profile: "scattered" },
      { text: "I make what I do sound smaller than it is.", profile: "underclaimed" },
      { text: "I give a clear answer that reflects my work.", profile: null }
    ]
  },
  {
    prompt: "It's time to invite people to work with you. What do you do?",
    answers: [
      { text: "Put it off. I want everything ready first.", profile: "hidden" },
      { text: "Add extras or lower the price to feel better asking.", profile: "underclaimed" },
      { text: "Explain the offer and make the invitation.", profile: null }
    ]
  },
  {
    prompt: "You're writing your bio. Where do you get stuck?",
    answers: [
      { text: "I use safe words instead of saying what I really think.", profile: "diluted" },
      { text: "I try to fit everything in. I can't choose what to lead with.", profile: "scattered" },
      { text: "Neither. I can say what I do and why it matters.", profile: null }
    ]
  },
  {
    prompt: "You decide to grow your business or brand. What tends to happen?",
    answers: [
      { text: "I keep preparing instead of putting myself out there.", profile: "hidden" },
      { text: "I switch directions before giving one a real chance.", profile: "scattered" },
      { text: "I choose a direction and take action.", profile: null }
    ]
  },
  {
    prompt: "When you talk about your expertise, what makes you hesitate?",
    answers: [
      { text: "I worry people will judge my point of view.", profile: "diluted" },
      { text: "It feels like bragging to say what I'm good at.", profile: "underclaimed" },
      { text: "Neither. I can own my skills and say what I think.", profile: null }
    ]
  }
];

window.QUIZ_PROFILES = {
  hidden: {
    title: "The Hidden Expert",
    shortStart: "Holding it back until you feel ready.",
    body: "You have something to offer, but your answers point to holding it back until you feel more ready. The drafts, the extra preparation, the delayed invitation. People can't recognize work they haven't had a chance to see.",
    underneath: "Readiness may have become the condition you put on being seen. More preparation can feel easier than letting people respond to your work.",
    firstMove: "Share one useful answer to a question your ideal client asks. Use what you already know. Keep it small enough to share today.",
    notice: "Before you share it, notice what you tell yourself you need first. More preparation? Someone's approval? Proof that nobody will disagree?",
    bridge: "Practice letting your experience be seen before every detail feels perfect."
  },
  diluted: {
    title: "The Diluted Expert",
    shortStart: "Softening what you actually think.",
    body: "Your answers suggest you soften what you think before you say it. You may share useful things, but your actual point of view gets softened. That makes it harder for people to understand what you stand for and why they'd choose you.",
    underneath: "You may be protecting yourself from being misunderstood or judged. When every sentence has to feel safe, the insight that makes your work valuable can disappear.",
    firstMove: "Finish: \"One thing I wish my clients understood is ______.\" Say what you actually mean, then support it with one example from your experience.",
    notice: "As you write, notice which words you want to soften. Are you making the point clearer, or trying to avoid someone disagreeing with you?",
    bridge: "Practice expressing your perspective clearly and backing it with real experience."
  },
  scattered: {
    title: "The Scattered Expert",
    shortStart: "Your message or direction keeps changing.",
    body: "Your answers suggest your message or direction keeps changing. You may have several real strengths, but people have to work too hard to figure out what to come to you for.",
    underneath: "Choosing one direction may feel like leaving parts of yourself behind. Or changing direction may feel easier than giving one message time to be tested.",
    firstMove: "Choose one problem you already know how to help someone solve. For your next three posts, speak to that problem. Give yourself a chance to learn before changing direction.",
    notice: "As you choose, notice what feels hard. Do you need more information, or does choosing one thing feel like giving up the rest?",
    bridge: "Choose a clear direction that draws on your strengths, then practice staying with it."
  },
  underclaimed: {
    title: "The Underclaimed Expert",
    shortStart: "Minimizing what you contribute.",
    body: "Your answers suggest you minimize what you contribute. People may hear what you do without seeing the judgment, skill, and experience behind it. That can make your value harder to recognize.",
    underneath: "Owning your contribution may feel like bragging, or your strengths may feel too natural to count. You don't have to exaggerate to give your work its proper credit.",
    firstMove: "Write down one real client win. Name the problem, what you specifically contributed, and what changed. Use that example when you explain your work.",
    notice: "As you name your contribution, notice what you want to dismiss. Does it feel like bragging? Does the skill come so naturally that you barely count it?",
    bridge: "Recognize your contribution and learn to communicate it with evidence."
  },
  foundations: {
    title: "No clear holding-back pattern",
    shortStart: null,
    body: "Your answers don't point to a clear pattern of hiding, softening, switching direction, or downplaying your contribution. This quiz may not explain why you feel overlooked. Your next step is to look at what happens when your message reaches the people you want to help.",
    underneath: null,
    firstMove: "Ask one person who fits your audience: \"After seeing my bio or recent content, what would you come to me for?\" Compare their answer with what you intended to communicate.",
    notice: null,
    bridge: "Keep strengthening how clearly your experience and value come through."
  }
};

/**
 * evaluate(answerIndices, tieChoice)
 * answerIndices: array of exactly 6 integers, each 0, 1, or 2.
 * tieChoice: optional profile key, required only when a tie is being resolved.
 * Returns { scores, tiedProfiles, resultKey, highestTotal, isWeakEvidence }
 * or throws on invalid input. Never mutates its inputs.
 */
window.evaluateQuiz = function evaluateQuiz(answerIndices, tieChoice) {
  if (!Array.isArray(answerIndices) || answerIndices.length !== 6) {
    throw new Error("Expected exactly six answers.");
  }
  var scores = { hidden: 0, diluted: 0, scattered: 0, underclaimed: 0 };

  for (var i = 0; i < 6; i++) {
    var idx = answerIndices[i];
    if (!Number.isInteger(idx) || idx < 0 || idx > 2) {
      throw new Error("Each answer must be the integer 0, 1, or 2.");
    }
    var profile = window.QUIZ_QUESTIONS[i].answers[idx].profile;
    if (profile) scores[profile] += 1;
  }

  var highest = Math.max(scores.hidden, scores.diluted, scores.scattered, scores.underclaimed);

  if (highest === 0) {
    return { scores: scores, tiedProfiles: [], resultKey: "foundations", highestTotal: 0, isWeakEvidence: false };
  }

  var tiedProfiles = Object.keys(scores).filter(function (k) { return scores[k] === highest; });

  if (tiedProfiles.length > 1) {
    if (!tieChoice || tiedProfiles.indexOf(tieChoice) === -1) {
      return { scores: scores, tiedProfiles: tiedProfiles, resultKey: null, highestTotal: highest, isWeakEvidence: highest === 1 };
    }
    return { scores: scores, tiedProfiles: tiedProfiles, resultKey: tieChoice, highestTotal: highest, isWeakEvidence: highest === 1 };
  }

  return { scores: scores, tiedProfiles: tiedProfiles, resultKey: tiedProfiles[0], highestTotal: highest, isWeakEvidence: highest === 1 };
};
