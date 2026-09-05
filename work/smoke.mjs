import fs from "node:fs";
import { JSDOM } from "jsdom";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const js = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const dom = new JSDOM(html, {
  url: "https://rti-saathi.test/",
  runScripts: "dangerously",
  pretendToBeVisual: true,
});
const { window } = dom;
window.HTMLElement.prototype.scrollIntoView = () => {};
window.eval(js);
const $ = (selector) => window.document.querySelector(selector);
const $$all = (selector) => window.document.querySelectorAll(selector);
const click = (selector) =>
  $(selector).dispatchEvent(new window.MouseEvent("click", { bubbles: true }));

if ($("#languageGate").hidden)
  throw new Error("First-visit language gate did not open");
click('[data-lang="hi"]');
if (!$("#languageGate").hidden || !$("#languageSelect").value.includes("hi"))
  throw new Error("Native-script language onboarding failed");
click('[data-action="start"]');
if ($("#requestModal").hidden) throw new Error("Request modal did not open");
$('[name="level"][value="state"]').checked = true;
click("#nextButton");
if ($("#stateNotice").hidden)
  throw new Error("State portal warning did not appear");
$('[name="level"][value="central"]').checked = true;
click("#nextButton");
if (
  !$('.form-step[data-step="1"]').hidden ||
  $('.form-step[data-step="2"]').hidden
)
  throw new Error("Step 2 navigation failed");
$("#topic").value = "Education";
$("#authority").value = "Ministry of Education";
click("#nextButton");
$("#question").value =
  "Please provide the district-wise number of sanctioned teacher posts for 2024–25.";
$("#question").dispatchEvent(new window.Event("input", { bubbles: true }));
click("#promptButton");
if ($("#promptResult").hidden)
  throw new Error("Writing guidance did not appear");
await Promise.resolve();
await Promise.resolve();
if (
  $("#qualityMeter").hidden ||
  !$("#qualityScore").textContent.includes("/100")
)
  throw new Error("Request quality feedback did not appear");
click("#nextButton");
if ($("#reviewList").children.length !== 4)
  throw new Error("Review summary is incomplete");
$(".check-row input").checked = true;
$("#requestForm").dispatchEvent(
  new window.Event("submit", { bubbles: true, cancelable: true }),
);
if (
  $("#successState").hidden ||
  !$("#demoReference").textContent.startsWith("RTI-DEMO-")
)
  throw new Error("Demo completion failed");
if (!window.localStorage.getItem("rti-saathi-cases"))
  throw new Error("On-device case history was not saved");

// --- Citizen feedback loop ---
if ($("#feedbackButtons").hidden || !$("#feedbackFollowup").hidden)
  throw new Error("Feedback loop did not reset to its initial state after submission");
$("#feedbackButtons").querySelector('[data-feedback="no"]').dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
if ($("#feedbackFollowup").hidden || !$("#feedbackButtons").hidden)
  throw new Error("Choosing \"No\" did not reveal the follow-up reasons");
$("#feedbackFollowup").querySelector('[data-reason="understand"]').dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
if ($("#feedbackThanks").hidden || !$("#feedbackFollowup").hidden)
  throw new Error("Choosing a reason did not show the thank-you message");
const feedbackLog = JSON.parse(window.localStorage.getItem("rti-saathi-feedback") || "[]");
if (!feedbackLog.length || feedbackLog[0].outcome !== "no" || feedbackLog[0].reason !== "understand")
  throw new Error("Feedback was not logged on this device");

// --- Life-event navigation ---
const lifeEventLinks = $$all(".life-event-chip");
if (lifeEventLinks.length !== 10)
  throw new Error("Expected 10 life-event links");
if (![...lifeEventLinks].every((a) => a.getAttribute("href") === "#examples"))
  throw new Error("Life-event links should all point to the What can I ask section");

// --- Offline help near me ---
click('[data-action="offline-help"]');
if ($("#offlineHelpModal").hidden) throw new Error("Offline help modal did not open");
if ($$all(".offline-help-link").length !== 3)
  throw new Error("Offline help modal should list three options");
click('[data-action="close-offline-help"]');
if (!$("#offlineHelpModal").hidden) throw new Error("Offline help modal did not close");

// --- Humanized application tracker ---
window.fetch = async () => ({
  ok: true,
  json: async () => ({
    reference: JSON.parse(window.localStorage.getItem("rti-saathi-cases"))[0].reference,
    status: "Draft prepared",
    governmentSubmission: false,
    nextAction: "Download the filing pack and continue on the correct official RTI portal.",
  }),
});
click('[data-action="track"]');
if (!$("#statusTracker").hidden) throw new Error("Status tracker should start hidden");
$("#trackDemoButton").dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
await new Promise((resolve) => setTimeout(resolve, 0));
await new Promise((resolve) => setTimeout(resolve, 0));
if ($("#statusTracker").hidden || $$all(".tracker-step").length !== 5)
  throw new Error("Status tracker did not render the humanized checklist");
if (!$("#statusTracker").textContent.includes("What happens next?"))
  throw new Error("Status tracker did not explain what happens next");
delete window.fetch;
click('[data-action="close-track"]');
click('[data-action="cases"]');
if (
  $("#casesModal").hidden ||
  !$("#caseList").textContent.includes("RTI-DEMO-")
)
  throw new Error("Case workspace did not render");
click('[data-action="close-cases"]');
click('[data-action="state-directory"]');
if ($("#stateModal").hidden || $("#stateSelect").options.length < 30)
  throw new Error("State directory did not open");
click('[data-action="close-state"]');

$("#languageSelect").value = "hi";
$("#languageSelect").dispatchEvent(
  new window.Event("change", { bubbles: true }),
);
if (!$('[data-i18n="heroLine1"]').textContent.includes("आपका"))
  throw new Error("Language switch failed");
const scheduledLanguages = [
  "hi",
  "bn",
  "ta",
  "te",
  "mr",
  "gu",
  "kn",
  "ml",
  "pa",
  "ur",
  "or",
  "as",
  "sa",
  "ks",
  "ne",
  "sd",
  "kok",
  "mni",
  "brx",
  "doi",
  "sat",
];
for (const lang of scheduledLanguages) {
  $("#languageSelect").value = lang;
  $("#languageSelect").dispatchEvent(
    new window.Event("change", { bubbles: true }),
  );
  const hero = $('[data-i18n="heroLine1"]').textContent.trim();
  const start = $('[data-i18n="start"]').textContent.trim();
  const track = $('[data-i18n="track"]').textContent.trim();
  if (
    window.document.documentElement.lang !== lang ||
    hero === "Your question." ||
    start === "File an RTI request" ||
    track === "Track request"
  ) {
    throw new Error(`Essential translation coverage failed for ${lang}`);
  }
}
for (const rtl of ["ur", "ks", "sd"]) {
  $("#languageSelect").value = rtl;
  $("#languageSelect").dispatchEvent(
    new window.Event("change", { bubbles: true }),
  );
  if (window.document.documentElement.dir !== "rtl")
    throw new Error(`RTL direction failed for ${rtl}`);
}
$("#languageSelect").value = "en";
$("#languageSelect").dispatchEvent(new window.Event("change", { bubbles: true }));
if ($('[data-action="track"] [data-i18n="track"]').textContent.trim() !== "Track request")
  throw new Error("English tracking action was overridden by workspace copy");
if ($("#liteToggle")) throw new Error("Manual Lite control should not exist");

// --- Ask Saathi chat widget ---
const chatbotJs = fs.readFileSync(new URL("../chatbot.js", import.meta.url), "utf8");
window.eval(chatbotJs);

const chatSidebar = $("#chatSidebar");
if (chatSidebar.classList.contains("is-open"))
  throw new Error("Chat sidebar should start closed");

click('[data-action="chat"]');
if (!chatSidebar.classList.contains("is-open")) throw new Error("Chat sidebar did not open");
if ($("#chatChips").children.length !== 6)
  throw new Error("Chat quick prompts did not render");
if ($("#chatKicker").textContent.trim() !== "ASK SAATHI")
  throw new Error("Chat chrome did not default to English");
if ($("#chatStatus").hidden || $("#chatStatus").textContent.trim() === "")
  throw new Error("Chat assistant status did not report a state");
if (!$("#chatSend").querySelector("svg"))
  throw new Error("Chat send button lost its icon (chrome update must not overwrite it with text)");
if (chatSidebar.dataset.theme !== "light")
  throw new Error("Chat sidebar should default to the site's light theme");
$("#themeToggle").dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
if (window.document.documentElement.dataset.theme !== "dark")
  throw new Error("Site theme toggle did not switch to dark");
if (chatSidebar.dataset.theme !== "dark")
  throw new Error("Chat sidebar did not follow the site's theme toggle to dark");
$("#themeToggle").dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
if (window.document.documentElement.dataset.theme !== "light")
  throw new Error("Site theme toggle did not switch back to light");
if (chatSidebar.dataset.theme !== "light")
  throw new Error("Chat sidebar did not follow the site's theme toggle back to light");

click('[data-action="close-chat"]');
if (chatSidebar.classList.contains("is-open")) throw new Error("Chat sidebar did not close");

$("#languageSelect").value = "hi";
$("#languageSelect").dispatchEvent(new window.Event("change", { bubbles: true }));
if ($("#chatKicker").textContent.trim() === "ASK SAATHI")
  throw new Error("Chat widget did not sync with the site's language switcher");
if ($("#chatChips").children[0].textContent.trim() === "How do I file a request?")
  throw new Error("Chat quick prompts did not re-render in Hindi");

click('[data-action="chat"]');
$("#chatChips").children[1].dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
if (!$("#chatMessages").textContent.includes("\u20b910"))
  throw new Error("Offline fallback answer for the fee question did not appear");
if (!$("#chatMessages").querySelector(".chat-msg--user"))
  throw new Error("User message bubble did not render");
if (!$("#chatMessages").querySelector(".chat-tag"))
  throw new Error("Offline fallback answers should be labelled as such");

$("#languageSelect").value = "en";
$("#languageSelect").dispatchEvent(new window.Event("change", { bubbles: true }));

// Bengali is one of the languages with dedicated native predefined prompts:
// clicking a chip should answer instantly, in Bengali only, with no
// fallback tag (it's a curated answer, not a fallback).
$("#languageSelect").value = "bn";
$("#languageSelect").dispatchEvent(new window.Event("change", { bubbles: true }));
click('[data-action="chat"]');
if ($("#chatChips").children[0].textContent.trim() !== "আবেদন কীভাবে করব?")
  throw new Error("Bengali quick prompts did not render natively");
$("#chatChips").children[1].dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
let lastRow = $("#chatMessages").lastElementChild;
if (!lastRow.textContent.includes("বিনামূল্যে"))
  throw new Error("Native Bengali predefined answer did not appear");
if (lastRow.querySelector(".chat-tag"))
  throw new Error("A native predefined answer should not be labelled as an offline fallback");

// Nepali has no dedicated native prompts: chips fall back to English labels,
// but any answer - chip or free-typed - must come back English-then-Hindi,
// never silently English-only or refused.
$("#languageSelect").value = "ne";
$("#languageSelect").dispatchEvent(new window.Event("change", { bubbles: true }));
if ($("#chatChips").children[1].textContent.trim() !== "What does it cost?")
  throw new Error("A language without native prompts should fall back to English chip labels");
$("#chatChips").children[1].dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
lastRow = $("#chatMessages").lastElementChild;
if (!lastRow.textContent.includes("\u20b910") || !lastRow.textContent.includes("\u092e\u093e\u0928\u0915"))
  throw new Error("Answer for an uncovered language did not come back bilingual (English then Hindi)");

$("#languageSelect").value = "en";
$("#languageSelect").dispatchEvent(new window.Event("change", { bubbles: true }));

// --- Connect with an agent (demo hand-off) ---
$("#chatAgentButton").dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
lastRow = $("#chatMessages").lastElementChild;
if (!lastRow.textContent.includes("your Saathi"))
  throw new Error("Connect-with-agent did not produce the expected demo reply");
if (!lastRow.querySelector(".chat-tag") || !lastRow.querySelector(".chat-tag").textContent.includes("agent"))
  throw new Error("Connect-with-agent reply should be labelled as a demo hand-off");

// --- Voice message (demo placeholder) ---
$("#chatMicButton").dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
if (!$("#chatMessages").lastElementChild.classList.contains("is-user"))
  throw new Error("Voice message did not register the user's side of the exchange");
await new Promise((resolve) => setTimeout(resolve, 750));
lastRow = $("#chatMessages").lastElementChild;
if (!lastRow.querySelector(".chat-tag") || !lastRow.querySelector(".chat-tag").textContent.includes("Voice"))
  throw new Error("Voice message did not produce a labelled demo reply");

// --- Feedback loop hands off to the agent for "I need human assistance" ---
$("#feedbackFollowup").querySelector('[data-reason="human"]').dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
if (!chatSidebar.classList.contains("is-open"))
  throw new Error("Choosing \"I need human assistance\" should open the Ask Saathi sidebar");

console.log(
  "Smoke test passed: all 22 language essentials, RTL direction, onboarding, routing, four-step form, review, confirmation, feedback loop, life-event navigation, offline-help modal, humanized status tracker, automatic low-data architecture, and the Ask Saathi chat sidebar (open/close, language sync, status check, offline fallback, connect-with-agent, voice-message demo).",
);
