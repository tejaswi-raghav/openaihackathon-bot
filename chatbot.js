const $ = (selector, root = document) => root.querySelector(selector);
const esc = (s) => (s == null ? "" : String(s)).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Minimal, safe markdown: escapes everything first, then re-applies a small
// set of tags on top of the escaped text, so no raw HTML from a reply (or a
// user's own message, in the unlikely case it round-trips) can ever render.
function mdToHtml(text) {
  let t = esc(text);
  t = t.replace(/`([^`]+)`/g, "<code>$1</code>");
  t = t.replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
  const lines = t.split(/\n/);
  let html = "";
  let listTag = null;
  const closeList = () => { if (listTag) { html += `</${listTag}>`; listTag = null; } };
  for (const line of lines) {
    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    const numbered = line.match(/^\s*\d+\.\s+(.*)$/);
    if (bullet) { if (listTag !== "ul") { closeList(); html += "<ul>"; listTag = "ul"; } html += `<li>${bullet[1]}</li>`; continue; }
    if (numbered) { if (listTag !== "ol") { closeList(); html += "<ol>"; listTag = "ol"; } html += `<li>${numbered[1]}</li>`; continue; }
    closeList();
    if (line.trim()) html += `<p>${line}</p>`;
  }
  closeList();
  return html || "<p>\u2026</p>";
}

/**
 * Chrome + canned answers for the languages the assistant fully supports.
 * Any other of the site's 22 languages still gets a best-effort reply from
 * the model itself (see LANG_NAMES in api/chat.js) — only this widget's own
 * chrome and offline fallback stay in English for those.
 */
const STRINGS = {
  en: {
    kicker: "ASK SAATHI",
    title: "What would you like to know?",
    intro: "I can explain how this site works — filing, fees, timelines, or finding the right authority.",
    placeholder: "Type a question…",
    send: "Ask",
    listen: "\ud83d\udd0a Listen",
    stop: "\u23f9 Stop",
    note: "General guidance only, not legal advice — use the official portals linked on this page to file or check status.",
    online: "Assistant online",
    offline: "On-device guide (assistant unavailable)",
    quickPrompts: [
      { key: "file", label: "How do I file a request?", prompt: "In simple steps, how do I file an RTI request on this site?", answer: "Tap “File an RTI request”, choose Central or State, describe what you need, and review before saving — your draft stays on this device until you copy it into the official portal." },
      { key: "fee", label: "What does it cost?", prompt: "What is the fee for an RTI request, and is it ever waived?", answer: "The standard fee is \u20b910. It is waived to \u20b90 for applicants with valid BPL proof." },
      { key: "time", label: "How long for a reply?", prompt: "How long does a public authority have to reply to my RTI request?", answer: "A public authority must reply within 30 days of receiving your request. If there is no reply, this site links you to the official first-appeal process." },
      { key: "route", label: "Central or State?", prompt: "How do I know if my request should go to a Central or a State authority?", answer: "Railways, income tax, passports and national ministries are Central. Panchayats, local police and state schemes are usually State — pick “I’m not sure” in the form if you'd like help deciding." },
      { key: "track", label: "Track my request", prompt: "How do I track a request I already filed?", answer: "Use “Track request” and enter the official registration number from the government portal — this site does not store or submit it." },
      { key: "ask", label: "What can I ask for?", prompt: "What kind of information can I actually request under RTI?", answer: "Ask for existing records, reports, lists, orders or the status of an action — not opinions or explanations that aren't already on file." },
    ],
  },
  hi: {
    kicker: "\u0938\u093e\u0925\u0940 \u0938\u0947 \u092a\u0942\u091b\u0947\u0902",
    title: "\u0906\u092a \u0915\u094d\u092f\u093e \u091c\u093e\u0928\u0928\u093e \u091a\u093e\u0939\u0947\u0902\u0917\u0947?",
    intro: "\u092e\u0948\u0902 \u092c\u0924\u093e \u0938\u0915\u0924\u093e \u0939\u0942\u0902 \u0915\u093f \u092f\u0939 \u0935\u0947\u092c\u0938\u093e\u0907\u091f \u0915\u0948\u0938\u0947 \u0915\u093e\u092e \u0915\u0930\u0924\u0940 \u0939\u0948: \u0906\u0935\u0947\u0926\u0928, \u0936\u0941\u0932\u094d\u0915, \u0938\u092e\u092f-\u0938\u0940\u092e\u093e, \u092f\u093e \u0938\u0939\u0940 \u0935\u093f\u092d\u093e\u0917 \u0916\u094b\u091c\u0928\u093e\u0964",
    placeholder: "\u0905\u092a\u0928\u093e \u0938\u0935\u093e\u0932 \u0932\u093f\u0916\u0947\u0902\u2026",
    send: "\u092a\u0942\u091b\u0947\u0902",
    listen: "\ud83d\udd0a \u0938\u0941\u0928\u0947\u0902",
    stop: "\u23f9 \u0930\u094b\u0915\u0947\u0902",
    note: "\u092f\u0939 \u0938\u093e\u092e\u093e\u0928\u094d\u092f \u092e\u093e\u0930\u094d\u0917\u0926\u0930\u094d\u0936\u0928 \u0939\u0948, \u0915\u093e\u0928\u0942\u0928\u0940 \u0938\u0932\u093e\u0939 \u0928\u0939\u0940\u0902 \u2014 \u0906\u0935\u0947\u0926\u0928 \u092f\u093e \u0938\u094d\u0925\u093f\u0924\u093f \u0915\u0947 \u0932\u093f\u090f \u0907\u0938 \u092a\u0947\u091c \u092a\u0930 \u0926\u093f\u090f \u0917\u090f \u0906\u0927\u093f\u0915\u093e\u0930\u093f\u0915 \u092a\u094b\u0930\u094d\u091f\u0932 \u0909\u092a\u092f\u094b\u0917 \u0915\u0930\u0947\u0902\u0964",
    offlinePrefix: "(\u0921\u093f\u0935\u093e\u0907\u0938 \u092a\u0930 \u092e\u094c\u091c\u0942\u0926 \u0917\u093e\u0907\u0921 \u0938\u0947 \u091c\u0935\u093e\u092c\u0964) ",
    online: "\u0938\u0939\u093e\u092f\u0915 \u0909\u092a\u0932\u092c\u094d\u0927 \u0939\u0948",
    offline: "\u0921\u093f\u0935\u093e\u0907\u0938 \u092a\u0930 \u092e\u094c\u091c\u0942\u0926 \u0917\u093e\u0907\u0921 (\u0938\u0939\u093e\u092f\u0915 \u0905\u092d\u0940 \u0909\u092a\u0932\u092c\u094d\u0927 \u0928\u0939\u0940\u0902)",
    quickPrompts: [
      { key: "file", label: "\u0906\u0935\u0947\u0926\u0928 \u0915\u0948\u0938\u0947 \u0915\u0930\u0947\u0902?", prompt: "\u0907\u0938 \u0935\u0947\u092c\u0938\u093e\u0907\u091f \u092a\u0930 RTI \u0906\u0935\u0947\u0926\u0928 \u0915\u0948\u0938\u0947 \u0915\u0930\u0947\u0902, \u0938\u0930\u0932 \u091a\u0930\u0923\u094b\u0902 \u092e\u0947\u0902 \u092c\u0924\u093e\u0907\u090f\u0964", answer: "\u201cRTI \u0906\u0935\u0947\u0926\u0928 \u0915\u0930\u0947\u0902\u201d \u092a\u0930 \u091f\u0948\u092a \u0915\u0930\u0947\u0902, \u0915\u0947\u0902\u0926\u094d\u0930 \u092f\u093e \u0930\u093e\u091c\u094d\u092f \u091a\u0941\u0928\u0947\u0902, \u0905\u092a\u0928\u0940 \u091c\u0930\u0942\u0930\u0924 \u092c\u0924\u093e\u090f\u0902 \u0914\u0930 \u0938\u0939\u0947\u091c\u0928\u0947 \u0938\u0947 \u092a\u0939\u0932\u0947 \u091c\u093e\u0902\u091a\u0947\u0902 \u2014 \u091c\u092c \u0924\u0915 \u0906\u092a \u0907\u0938\u0947 \u0906\u0927\u093f\u0915\u093e\u0930\u093f\u0915 \u092a\u094b\u0930\u094d\u091f\u0932 \u092a\u0930 \u0928 \u0921\u093e\u0932\u0947\u0902, \u092f\u0939 \u0921\u094d\u0930\u093e\u092b\u094d\u091f \u0907\u0938\u0940 \u0921\u093f\u0935\u093e\u0907\u0938 \u092a\u0930 \u0930\u0939\u0924\u093e \u0939\u0948\u0964" },
      { key: "fee", label: "\u0936\u0941\u0932\u094d\u0915 \u0915\u093f\u0924\u0928\u093e \u0939\u0948?", prompt: "RTI \u0906\u0935\u0947\u0926\u0928 \u0915\u093e \u0936\u0941\u0932\u094d\u0915 \u0915\u093f\u0924\u0928\u093e \u0939\u0948, \u0914\u0930 \u0915\u094d\u092f\u093e \u092f\u0939 \u0915\u092d\u0940 \u092e\u093e\u092b \u0939\u094b\u0924\u093e \u0939\u0948?", answer: "\u092e\u093e\u0928\u0915 \u0936\u0941\u0932\u094d\u0915 \u20b910 \u0939\u0948\u0964 \u0935\u0948\u0927 BPL \u092a\u094d\u0930\u092e\u093e\u0923 \u0935\u093e\u0932\u0947 \u0906\u0935\u0947\u0926\u0915\u094b\u0902 \u0915\u0947 \u0932\u093f\u090f \u092f\u0939 \u20b90 \u0939\u0948\u0964" },
      { key: "time", label: "\u091c\u0935\u093e\u092c \u092e\u0947\u0902 \u0915\u093f\u0924\u0928\u093e \u0938\u092e\u092f?", prompt: "\u0938\u093e\u0930\u094d\u0935\u091c\u0928\u093f\u0915 \u092a\u094d\u0930\u093e\u0927\u093f\u0915\u0930\u0923 \u0915\u094b RTI \u0906\u0935\u0947\u0926\u0928 \u0915\u093e \u091c\u0935\u093e\u092c \u0926\u0947\u0928\u0947 \u092e\u0947\u0902 \u0915\u093f\u0924\u0928\u093e \u0938\u092e\u092f \u0932\u0917\u0924\u093e \u0939\u0948?", answer: "\u0906\u0935\u0947\u0926\u0928 \u092e\u093f\u0932\u0928\u0947 \u0915\u0947 30 \u0926\u093f\u0928 \u0915\u0947 \u0905\u0902\u0926\u0930 \u091c\u0935\u093e\u092c \u0926\u0947\u0928\u093e \u0939\u094b\u0924\u093e \u0939\u0948\u0964 \u091c\u0935\u093e\u092c \u0928 \u092e\u093f\u0932\u0928\u0947 \u092a\u0930 \u092f\u0939 \u0938\u093e\u0907\u091f \u0906\u092a\u0915\u094b \u092a\u0939\u0932\u0940 \u0905\u092a\u0940\u0932 \u0915\u0940 \u0906\u0927\u093f\u0915\u093e\u0930\u093f\u0915 \u092a\u094d\u0930\u0915\u094d\u0930\u093f\u092f\u093e \u0938\u0947 \u091c\u094b\u0921\u093c\u0924\u0940 \u0939\u0948\u0964" },
      { key: "route", label: "\u0915\u0947\u0902\u0926\u094d\u0930\u0940\u092f \u092f\u093e \u0930\u093e\u091c\u094d\u092f?", prompt: "\u092e\u0941\u091d\u0947 \u0915\u0948\u0938\u0947 \u092a\u0924\u093e \u091a\u0932\u0947\u0917\u093e \u0915\u093f \u092e\u0947\u0930\u093e \u0906\u0935\u0947\u0926\u0928 \u0915\u0947\u0902\u0926\u094d\u0930\u0940\u092f \u092f\u093e \u0930\u093e\u091c\u094d\u092f \u092a\u094d\u0930\u093e\u0927\u093f\u0915\u0930\u0923 \u0915\u094b \u091c\u093e\u0928\u093e \u091a\u093e\u0939\u093f\u090f?", answer: "\u0930\u0947\u0932\u0935\u0947, \u0906\u092f\u0915\u0930, \u092a\u093e\u0938\u092a\u094b\u0930\u094d\u091f \u0914\u0930 \u0930\u093e\u0937\u094d\u091f\u094d\u0930\u0940\u092f \u092e\u0902\u0924\u094d\u0930\u093e\u0932\u092f \u0915\u0947\u0902\u0926\u094d\u0930\u0940\u092f \u0939\u0948\u0902\u0964 \u092a\u0902\u091a\u093e\u092f\u0924, \u0938\u094d\u0925\u093e\u0928\u0940\u092f \u092a\u0941\u0932\u093f\u0938 \u0914\u0930 \u0930\u093e\u091c\u094d\u092f \u092f\u094b\u091c\u0928\u093e\u090f\u0902 \u0906\u092e\u0924\u094c\u0930 \u092a\u0930 \u0930\u093e\u091c\u094d\u092f \u0915\u0947 \u0905\u0902\u0924\u0930\u094d\u0917\u0924 \u0906\u0924\u0940 \u0939\u0948\u0902 \u2014 \u0905\u0917\u0930 \u092a\u0915\u094d\u0915\u093e \u0928\u0939\u0940\u0902 \u092a\u0924\u093e \u0924\u094b \u092b\u0949\u0930\u094d\u092e \u092e\u0947\u0902 \u201c\u092e\u0941\u091d\u0947 \u092a\u0915\u094d\u0915\u093e \u0928\u0939\u0940\u0902\u201d \u091a\u0941\u0928\u0947\u0902\u0964" },
      { key: "track", label: "\u0906\u0935\u0947\u0926\u0928 \u091f\u094d\u0930\u0948\u0915 \u0915\u0930\u0947\u0902", prompt: "\u092e\u0948\u0902\u0928\u0947 \u091c\u094b \u0906\u0935\u0947\u0926\u0928 \u092a\u0939\u0932\u0947 \u0938\u0947 \u0926\u093f\u092f\u093e \u0939\u0948, \u0909\u0938\u0947 \u0915\u0948\u0938\u0947 \u091f\u094d\u0930\u0948\u0915 \u0915\u0930\u0942\u0902?", answer: "\u201c\u0906\u0935\u0947\u0926\u0928 \u091f\u094d\u0930\u0948\u0915 \u0915\u0930\u0947\u0902\u201d \u0916\u094b\u0932\u0947\u0902 \u0914\u0930 \u0938\u0930\u0915\u093e\u0930\u0940 \u092a\u094b\u0930\u094d\u091f\u0932 \u0915\u0940 \u0906\u0927\u093f\u0915\u093e\u0930\u093f\u0915 \u092a\u0902\u091c\u0940\u0915\u0930\u0923 \u0938\u0902\u0916\u094d\u092f\u093e \u0921\u093e\u0932\u0947\u0902 \u2014 \u092f\u0939 \u0938\u093e\u0907\u091f \u0907\u0938\u0947 \u0938\u0939\u0947\u091c\u0924\u0940 \u092f\u093e \u0938\u092c\u092e\u093f\u091f \u0928\u0939\u0940\u0902 \u0915\u0930\u0924\u0940\u0964" },
      { key: "ask", label: "\u092e\u0948\u0902 \u0915\u094d\u092f\u093e \u092a\u0942\u091b \u0938\u0915\u0924\u093e \u0939\u0942\u0902?", prompt: "RTI \u0915\u0947 \u0924\u0939\u0924 \u092e\u0948\u0902 \u0935\u093e\u0938\u094d\u0924\u0935 \u092e\u0947\u0902 \u0915\u093f\u0938 \u0924\u0930\u0939 \u0915\u0940 \u091c\u093e\u0928\u0915\u093e\u0930\u0940 \u092e\u093e\u0902\u0917 \u0938\u0915\u0924\u093e \u0939\u0942\u0902?", answer: "\u092e\u094c\u091c\u0942\u0926\u093e \u0930\u093f\u0915\u0949\u0930\u094d\u0921, \u0930\u093f\u092a\u094b\u0930\u094d\u091f, \u0938\u0942\u091a\u0940, \u0906\u0926\u0947\u0936 \u092f\u093e \u0915\u093f\u0938\u0940 \u0915\u093e\u0930\u094d\u0930\u0935\u093e\u0908 \u0915\u0940 \u0938\u094d\u0925\u093f\u0924\u093f \u092e\u093e\u0902\u0917\u0947\u0902 \u2014 \u0910\u0938\u0940 \u0930\u093e\u092f \u092f\u093e \u0935\u094d\u092f\u093e\u0916\u094d\u092f\u093e \u0928 \u092e\u093e\u0902\u0917\u0947\u0902 \u091c\u094b \u0930\u093f\u0915\u0949\u0930\u094d\u0921 \u092e\u0947\u0902 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964" },
    ],
  },
};

const SPEECH_LOCALE = { en: "en-IN", hi: "hi-IN", ta: "ta-IN", te: "te-IN", kn: "kn-IN", ml: "ml-IN" };

function readSiteLang() {
  try { return localStorage.getItem("rti-language") || "en"; } catch { return "en"; }
}

let siteLang = readSiteLang();
let chromeLang = STRINGS[siteLang] ? siteLang : "en";
let speaking = null;
let history = [];
let isOpen = false;
let assistantConfigured = null; // null = unknown, true/false once checked
let lastFocus = null;

function strings() { return STRINGS[chromeLang]; }

const sidebar = $("#chatSidebar");
const scrim = $("#chatScrim");
const messagesBox = $("#chatMessages");
const chipsBox = $("#chatChips");
const form = $("#chatForm");
const input = $("#chatInput");
const sendBtn = $("#chatSend");
const kicker = $("#chatKicker");
const title = $("#chatTitle");
const intro = $("#chatIntro");
const note = $("#chatNote span:last-child");
const statusEl = $("#chatStatus");

function applyChrome() {
  const s = strings();
  kicker.textContent = s.kicker;
  title.textContent = s.title;
  intro.textContent = s.intro;
  input.setAttribute("placeholder", s.placeholder);
  sendBtn.setAttribute("aria-label", s.send);
  if (note) note.textContent = s.note;
  renderChips();
  renderStatus();
}

function renderChips() {
  chipsBox.innerHTML = "";
  strings().quickPrompts.forEach((item) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chat-chip";
    chip.textContent = item.label;
    chip.addEventListener("click", () => sendMessage(item.prompt, item));
    chipsBox.appendChild(chip);
  });
}

function renderStatus() {
  if (assistantConfigured === null) {
    statusEl.hidden = true;
    return;
  }
  const s = strings();
  statusEl.hidden = false;
  statusEl.innerHTML = '<span class="md"></span>' + esc(assistantConfigured ? s.online : s.offline);
  statusEl.classList.toggle("is-online", assistantConfigured);
  statusEl.classList.toggle("is-offline", !assistantConfigured);
}

async function checkAssistantStatus() {
  if (!window.fetch) { assistantConfigured = false; renderStatus(); return; }
  try {
    const res = await fetch("/api/chat", { method: "GET" });
    const data = await res.json().catch(() => ({}));
    assistantConfigured = res.ok && data && data.configured === true;
  } catch {
    assistantConfigured = false;
  }
  renderStatus();
}

// ---------- open / close (self-contained sidebar, no dependency on app.js modals) ----------
function openSidebar() {
  if (isOpen) return;
  isOpen = true;
  lastFocus = document.activeElement;
  sidebar.removeAttribute("inert");
  sidebar.setAttribute("aria-hidden", "false");
  scrim.classList.add("is-open");
  document.querySelectorAll(".chat-launcher").forEach((b) => b.classList.add("is-hidden"));
  sidebar.classList.add("is-open");
  if (assistantConfigured === null) checkAssistantStatus();
  setTimeout(() => input.focus(), 220);
}
function closeSidebar() {
  if (!isOpen) return;
  isOpen = false;
  sidebar.classList.remove("is-open");
  scrim.classList.remove("is-open");
  document.querySelectorAll(".chat-launcher").forEach((b) => b.classList.remove("is-hidden"));
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  setTimeout(() => {
    if (!isOpen) {
      sidebar.setAttribute("aria-hidden", "true");
      sidebar.setAttribute("inert", "");
    }
  }, 300);
  if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
}

document.querySelectorAll('[data-action="chat"]').forEach((b) =>
  b.addEventListener("click", openSidebar)
);
document.querySelectorAll('[data-action="close-chat"]').forEach((b) =>
  b.addEventListener("click", closeSidebar)
);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && isOpen) closeSidebar();
});

window.addEventListener("rti-saathi:language", (event) => {
  siteLang = (event.detail && event.detail.lang) || "en";
  chromeLang = STRINGS[siteLang] ? siteLang : "en";
  applyChrome();
});

// ---------- messages ----------
function scrollToEnd() {
  messagesBox.scrollTop = messagesBox.scrollHeight;
}

function appendMessage(role, text, viaFallback) {
  const row = document.createElement("div");
  row.className = "chat-msg-row" + (role === "user" ? " is-user" : "");

  if (role === "bot" && viaFallback) {
    const tag = document.createElement("span");
    tag.className = "chat-tag";
    tag.textContent = strings().offline;
    row.appendChild(tag);
  }

  const bubble = document.createElement("div");
  bubble.className = "chat-msg " + (role === "user" ? "chat-msg--user" : "chat-msg--bot");
  if (role === "bot") bubble.innerHTML = mdToHtml(text);
  else bubble.textContent = text;
  row.appendChild(bubble);

  if (role === "bot") {
    const listen = document.createElement("button");
    listen.type = "button";
    listen.className = "chat-listen";
    listen.textContent = strings().listen;
    listen.addEventListener("click", () => toggleSpeak(text, listen));
    row.appendChild(listen);
  }

  messagesBox.appendChild(row);
  scrollToEnd();
  return row;
}

const WORK_STEPS = ["Reading your question\u2026", "Checking the site\u2026", "Composing an answer\u2026"];
function appendTyping() {
  const row = document.createElement("div");
  row.className = "chat-work";
  row.innerHTML = '<span class="orb"></span><span class="lbl">' + esc(WORK_STEPS[0]) + "</span>";
  messagesBox.appendChild(row);
  scrollToEnd();
  let i = 0;
  const lbl = row.querySelector(".lbl");
  const timer = setInterval(() => {
    i = (i + 1) % WORK_STEPS.length;
    if (lbl) lbl.textContent = WORK_STEPS[i];
  }, 900);
  const originalRemove = row.remove.bind(row);
  row.remove = () => { clearInterval(timer); originalRemove(); };
  return row;
}

// ---------- read-aloud ----------
// Two real-world Web Speech API gotchas this works around:
// 1. Chrome silently drops speak() calls made immediately after cancel() in
//    the same tick — a short delay lets the cancellation actually land first.
// 2. Voices load asynchronously; speaking before they're ready can fail
//    silently on the first attempt in some browsers.
let voicesReadyPromise = null;
function voicesReady() {
  if (!("speechSynthesis" in window)) return Promise.resolve();
  if (voicesReadyPromise) return voicesReadyPromise;
  voicesReadyPromise = new Promise((resolve) => {
    if (window.speechSynthesis.getVoices().length > 0) return resolve();
    const onChange = () => {
      window.speechSynthesis.removeEventListener("voiceschanged", onChange);
      resolve();
    };
    window.speechSynthesis.addEventListener("voiceschanged", onChange);
    // Fallback: some browsers never fire voiceschanged if voices are already
    // synchronous internally, or if the event just doesn't fire reliably.
    setTimeout(resolve, 500);
  });
  return voicesReadyPromise;
}

function resetListenButton(btn) {
  btn.classList.remove("is-active");
  btn.textContent = strings().listen;
  if (speaking === btn) speaking = null;
}

async function toggleSpeak(text, btn) {
  if (!("speechSynthesis" in window)) {
    btn.textContent = strings().listen;
    btn.disabled = true;
    btn.title = "Read-aloud is not supported in this browser.";
    return;
  }

  const wasActive = btn === speaking;
  const hadSpeech = window.speechSynthesis.speaking || window.speechSynthesis.pending;

  if (speaking) resetListenButton(speaking);
  if (hadSpeech) window.speechSynthesis.cancel();
  if (wasActive) return; // this button's own speech was the one just stopped

  await voicesReady();

  const speakNow = () => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = SPEECH_LOCALE[siteLang] || SPEECH_LOCALE[chromeLang] || "en-IN";
    utter.rate = 1;
    utter.onend = () => resetListenButton(btn);
    utter.onerror = () => resetListenButton(btn);
    window.speechSynthesis.speak(utter);
    btn.classList.add("is-active");
    btn.textContent = strings().stop;
    speaking = btn;
  };

  // Give Chrome's cancel() a beat to actually take effect before speaking.
  if (hadSpeech) setTimeout(speakNow, 60);
  else speakNow();
}

// ---------- offline fallback ----------
function localAnswer(rawText, matchedPrompt) {
  const s = strings();
  if (matchedPrompt) return matchedPrompt.answer;
  const lower = rawText.toLowerCase();
  const keywordMap = {
    file: ["file", "apply", "submit", "start", "draft"],
    fee: ["fee", "cost", "pay", "charge", "rupee", "rs", "\u20b9"],
    time: ["long", "time", "reply", "days", "respond", "wait", "deadline"],
    route: ["central", "state", "which", "authority", "department", "ministry"],
    track: ["track", "status", "registration", "reference"],
    ask: ["ask", "what can", "information", "request for", "allowed"],
  };
  let bestKey = null, bestScore = 0;
  for (const [key, words] of Object.entries(keywordMap)) {
    const score = words.reduce((sum, w) => sum + (lower.includes(w) ? 1 : 0), 0);
    if (score > bestScore) { bestScore = score; bestKey = key; }
  }
  if (bestKey) {
    const found = s.quickPrompts.find((q) => q.key === bestKey);
    if (found) return found.answer;
  }
  return s.quickPrompts.find((q) => q.key === "ask").answer;
}

// ---------- send / receive ----------
async function sendMessage(text, matchedPrompt) {
  const trimmed = (text || "").trim();
  if (!trimmed) return;
  appendMessage("user", trimmed);
  history.push({ role: "user", content: trimmed });
  input.value = "";
  const typing = appendTyping();

  const fallBack = () => {
    typing.remove();
    const answer = localAnswer(trimmed, matchedPrompt);
    appendMessage("bot", answer, true);
    history.push({ role: "assistant", content: answer });
    assistantConfigured = false;
    renderStatus();
  };

  if (!window.fetch || !navigator.onLine) return fallBack();

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: trimmed, lang: siteLang, history: history.slice(-8) }),
    });
    if (!response.ok) return fallBack();
    const data = await response.json();
    const reply = data && data.reply;
    if (!reply) throw new Error("empty reply");
    typing.remove();
    appendMessage("bot", reply);
    history.push({ role: "assistant", content: reply });
    if (assistantConfigured !== true) { assistantConfigured = true; renderStatus(); }
  } catch {
    fallBack();
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  sendMessage(input.value);
});
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage(input.value);
  }
});

applyChrome();
checkAssistantStatus();
