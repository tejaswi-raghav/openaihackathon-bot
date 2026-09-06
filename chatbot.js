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

// Predefined chip prompts and single-language canned answers for languages
// the widget doesn't otherwise translate its chrome into. These are the
// "default automated answers" for that language's own FAQ buttons; free
// typed text always gets the bilingual English+Hindi treatment below,
// since matching arbitrary free text reliably across this many scripts
// isn't something an offline keyword matcher can do well, and Gemini's
// own fluency varies more by language than by topic.
const OTHER_PROMPTS = {
  bn: [
    { key: "file", label: "আবেদন কীভাবে করব?", answer: "'RTI আবেদন শুরু করুন'-এ ট্যাপ করুন, কেন্দ্রীয় বা রাজ্য বেছে নিন, সমস্যা লিখুন এবং সেভ করার আগে দেখে নিন।" },
    { key: "fee", label: "খরচ কত?", answer: "ফি ₹10, বৈধ BPL প্রমাণ থাকলে বিনামূল্যে।" },
    { key: "time", label: "উত্তর পেতে কত দিন?", answer: "কর্তৃপক্ষকে 30 দিনের মধ্যে উত্তর দিতে হয়।" },
    { key: "route", label: "কেন্দ্রীয় নাকি রাজ্য?", answer: "রেল, আয়কর, পাসপোর্ট কেন্দ্রীয় বিভাগে আসে। স্থানীয় অফিস ও প্রকল্প রাজ্য বিভাগে আসে।" },
    { key: "track", label: "আবেদন ট্র্যাক করুন", answer: "'আবেদন ট্র্যাক করুন'-এ গিয়ে সরকারি নিবন্ধন নম্বর লিখুন।" },
    { key: "ask", label: "আমি কী জিজ্ঞাসা করতে পারি?", answer: "বিদ্যমান রেকর্ড, রিপোর্ট বা কোনো পদক্ষেপের অবস্থা জিজ্ঞাসা করা যায়।" },
  ],
  ta: [
    { key: "file", label: "எப்படி விண்ணப்பிப்பது?", answer: "'RTI கோரிக்கையைத் தொடங்குங்கள்' என்பதைத் தட்டி, மத்திய அல்லது மாநிலம் தேர்ந்தெடுத்து, சிக்கலை விவரித்து, சேமிக்கும் முன் சரிபார்க்கவும்." },
    { key: "fee", label: "கட்டணம் எவ்வளவு?", answer: "கட்டணம் ₹10, செல்லுபடியான BPL சான்று இருந்தால் இலவசம்." },
    { key: "time", label: "பதிலுக்கு எவ்வளவு நாள்?", answer: "அதிகாரம் 30 நாட்களுக்குள் பதிலளிக்க வேண்டும்." },
    { key: "route", label: "மத்தியமா, மாநிலமா?", answer: "ரயில்வே, வருமான வரி, பாஸ்போர்ட் மத்தியப் பிரிவு. உள்ளூர் அலுவலகங்களும் திட்டங்களும் மாநிலப் பிரிவு." },
    { key: "track", label: "கோரிக்கையைக் கண்காணிக்க", answer: "'கோரிக்கையைக் கண்காணிக்க' திறந்து அரசு பதிவு எண்ணை உள்ளிடவும்." },
    { key: "ask", label: "நான் என்ன கேட்கலாம்?", answer: "இருக்கும் ஆவணங்கள், அறிக்கைகள் அல்லது ஒரு நடவடிக்கையின் நிலையைக் கேட்கலாம்." },
  ],
  te: [
    { key: "file", label: "ఎలా దరఖాస్తు చేయాలి?", answer: "'RTI అభ్యర్థన ప్రారంభించండి' నొక్కి, కేంద్రం లేదా రాష్ట్రం ఎంచుకుని, సమస్యను వివరించి, సేవ్ చేసే ముందు సమీక్షించండి." },
    { key: "fee", label: "ఖర్చు ఎంత?", answer: "రుసుము ₹10, చెల్లుబాటు అయ్యే BPL ఆధారం ఉంటే ఉచితం." },
    { key: "time", label: "సమాధానానికి ఎన్ని రోజులు?", answer: "అధికారి 30 రోజుల్లో సమాధానం ఇవ్వాలి." },
    { key: "route", label: "కేంద్రమా, రాష్ట్రమా?", answer: "రైల్వే, ఆదాయపు పన్ను, పాస్‌పోర్ట్ కేంద్రం కిందకు వస్తాయి. స్థానిక కార్యాలయాలు, పథకాలు రాష్ట్రం కిందకు వస్తాయి." },
    { key: "track", label: "అభ్యర్థనను ట్రాక్ చేయండి", answer: "'అభ్యర్థనను ట్రాక్ చేయండి' తెరిచి మీ అధికారిక నమోదు సంఖ్యను నమోదు చేయండి." },
    { key: "ask", label: "నేను ఏమి అడగవచ్చు?", answer: "ఉన్న రికార్డులు, నివేదికలు లేదా ఒక చర్య స్థితిని అడగవచ్చు." },
  ],
  mr: [
    { key: "file", label: "अर्ज कसा करावा?", answer: "'RTI अर्ज सुरू करा' वर टॅप करा, केंद्र किंवा राज्य निवडा, समस्या लिहा आणि जतन करण्यापूर्वी तपासा." },
    { key: "fee", label: "खर्च किती?", answer: "शुल्क ₹10 आहे, वैध BPL पुरावा असल्यास मोफत." },
    { key: "time", label: "उत्तरासाठी किती वेळ?", answer: "प्राधिकरणाला 30 दिवसांत उत्तर द्यावे लागते." },
    { key: "route", label: "केंद्र की राज्य?", answer: "रेल्वे, आयकर, पासपोर्ट केंद्र विभागात येतात. स्थानिक कार्यालये व योजना राज्य विभागात येतात." },
    { key: "track", label: "अर्जाचा मागोवा घ्या", answer: "'अर्जाचा मागोवा घ्या' उघडून अधिकृत नोंदणी क्रमांक टाका." },
    { key: "ask", label: "मी काय विचारू शकतो?", answer: "अस्तित्वात असलेले रेकॉर्ड, अहवाल किंवा एखाद्या कृतीची स्थिती विचारता येते." },
  ],
  gu: [
    { key: "file", label: "અરજી કેવી રીતે કરવી?", answer: "'RTI અરજી શરૂ કરો' પર ટૅપ કરો, કેન્દ્ર કે રાજ્ય પસંદ કરો, સમસ્યા લખો અને સેવ કરતાં પહેલાં તપાસો." },
    { key: "fee", label: "ખર્ચ કેટલો?", answer: "ફી ₹10 છે, માન્ય BPL પુરાવો હોય તો મફત." },
    { key: "time", label: "જવાબમાં કેટલા દિવસ?", answer: "અધિકારીએ 30 દિવસમાં જવાબ આપવો પડે છે." },
    { key: "route", label: "કેન્દ્ર કે રાજ્ય?", answer: "રેલવે, આવકવેરો, પાસપોર્ટ કેન્દ્ર હેઠળ આવે છે. સ્થાનિક કચેરીઓ અને યોજનાઓ રાજ્ય હેઠળ આવે છે." },
    { key: "track", label: "અરજી ટ્રૅક કરો", answer: "'અરજી ટ્રૅક કરો' ખોલીને સત્તાવાર નોંધણી નંબર દાખલ કરો." },
    { key: "ask", label: "હું શું પૂછી શકું?", answer: "હાલના રેકોર્ડ, અહેવાલો અથવા કોઈ પગલાની સ્થિતિ પૂછી શકાય." },
  ],
  kn: [
    { key: "file", label: "ಹೇಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸುವುದು?", answer: "'RTI ವಿನಂತಿ ಪ್ರಾರಂಭಿಸಿ' ಒತ್ತಿ, ಕೇಂದ್ರ ಅಥವಾ ರಾಜ್ಯ ಆಯ್ಕೆಮಾಡಿ, ಸಮಸ್ಯೆ ಬರೆದು, ಉಳಿಸುವ ಮೊದಲು ಪರಿಶೀಲಿಸಿ." },
    { key: "fee", label: "ಎಷ್ಟು ವೆಚ್ಚ?", answer: "ಶುಲ್ಕ ₹10, ಮಾನ್ಯ BPL ಪುರಾವೆ ಇದ್ದರೆ ಉಚಿತ." },
    { key: "time", label: "ಉತ್ತರಕ್ಕೆ ಎಷ್ಟು ದಿನ?", answer: "ಅಧಿಕಾರಿ 30 ದಿನಗಳಲ್ಲಿ ಉತ್ತರಿಸಬೇಕು." },
    { key: "route", label: "ಕೇಂದ್ರವೋ, ರಾಜ್ಯವೋ?", answer: "ರೈಲ್ವೆ, ಆದಾಯ ತೆರಿಗೆ, ಪಾಸ್‌ಪೋರ್ಟ್ ಕೇಂದ್ರಕ್ಕೆ ಸೇರುತ್ತವೆ. ಸ್ಥಳೀಯ ಕಚೇರಿಗಳು ಮತ್ತು ಯೋಜನೆಗಳು ರಾಜ್ಯಕ್ಕೆ ಸೇರುತ್ತವೆ." },
    { key: "track", label: "ವಿನಂತಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ", answer: "'ವಿನಂತಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ' ತೆರೆದು ಅಧಿಕೃತ ನೋಂದಣಿ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ." },
    { key: "ask", label: "ನಾನು ಏನು ಕೇಳಬಹುದು?", answer: "ಇರುವ ದಾಖಲೆಗಳು, ವರದಿಗಳು ಅಥವಾ ಕ್ರಮದ ಸ್ಥಿತಿಯನ್ನು ಕೇಳಬಹುದು." },
  ],
  ml: [
    { key: "file", label: "എങ്ങനെ അപേക്ഷിക്കാം?", answer: "'RTI അപേക്ഷ ആരംഭിക്കുക' ടാപ്പ് ചെയ്ത്, കേന്ദ്രം അല്ലെങ്കിൽ സംസ്ഥാനം തിരഞ്ഞെടുത്ത്, പ്രശ്നം എഴുതി, സേവ് ചെയ്യുന്നതിന് മുമ്പ് പരിശോധിക്കുക." },
    { key: "fee", label: "ചെലവ് എത്ര?", answer: "ഫീസ് ₹10, സാധുവായ BPL തെളിവ് ഉണ്ടെങ്കിൽ സൗജന്യം." },
    { key: "time", label: "മറുപടിക്ക് എത്ര ദിവസം?", answer: "അധികാരി 30 ദിവസത്തിനകം മറുപടി നൽകണം." },
    { key: "route", label: "കേന്ദ്രമോ, സംസ്ഥാനമോ?", answer: "റെയിൽവേ, ആദായനികുതി, പാസ്‌പോർട്ട് കേന്ദ്രത്തിന് കീഴിൽ വരും. പ്രാദേശിക ഓഫീസുകളും പദ്ധതികളും സംസ്ഥാനത്തിന് കീഴിൽ വരും." },
    { key: "track", label: "അപേക്ഷ ട്രാക്ക് ചെയ്യുക", answer: "'അപേക്ഷ ട്രാക്ക് ചെയ്യുക' തുറന്ന് ഔദ്യോഗിക രജിസ്ട്രേഷൻ നമ്പർ നൽകുക." },
    { key: "ask", label: "എനിക്ക് എന്ത് ചോദിക്കാം?", answer: "നിലവിലുള്ള രേഖകൾ, റിപ്പോർട്ടുകൾ അല്ലെങ്കിൽ ഒരു നടപടിയുടെ നില ചോദിക്കാം." },
  ],
  pa: [
    { key: "file", label: "ਬੇਨਤੀ ਕਿਵੇਂ ਕਰੀਏ?", answer: "'RTI ਬੇਨਤੀ ਸ਼ੁਰੂ ਕਰੋ' 'ਤੇ ਟੈਪ ਕਰੋ, ਕੇਂਦਰ ਜਾਂ ਰਾਜ ਚੁਣੋ, ਸਮੱਸਿਆ ਲਿਖੋ ਅਤੇ ਸੇਵ ਕਰਨ ਤੋਂ ਪਹਿਲਾਂ ਜਾਂਚ ਲਓ।" },
    { key: "fee", label: "ਖਰਚਾ ਕਿੰਨਾ?", answer: "ਫੀਸ ₹10 ਹੈ, ਵੈਧ BPL ਸਬੂਤ ਹੋਣ 'ਤੇ ਮੁਫ਼ਤ।" },
    { key: "time", label: "ਜਵਾਬ ਲਈ ਕਿੰਨੇ ਦਿਨ?", answer: "ਅਧਿਕਾਰੀ ਨੂੰ 30 ਦਿਨਾਂ ਵਿੱਚ ਜਵਾਬ ਦੇਣਾ ਪੈਂਦਾ ਹੈ।" },
    { key: "route", label: "ਕੇਂਦਰ ਜਾਂ ਰਾਜ?", answer: "ਰੇਲਵੇ, ਆਮਦਨ ਟੈਕਸ, ਪਾਸਪੋਰਟ ਕੇਂਦਰ ਅਧੀਨ ਆਉਂਦੇ ਹਨ। ਸਥਾਨਕ ਦਫ਼ਤਰ ਅਤੇ ਸਕੀਮਾਂ ਰਾਜ ਅਧੀਨ ਆਉਂਦੀਆਂ ਹਨ।" },
    { key: "track", label: "ਬੇਨਤੀ ਟਰੈਕ ਕਰੋ", answer: "'ਬੇਨਤੀ ਟਰੈਕ ਕਰੋ' ਖੋਲ੍ਹੋ ਅਤੇ ਸਰਕਾਰੀ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਨੰਬਰ ਦਰਜ ਕਰੋ।" },
    { key: "ask", label: "ਮੈਂ ਕੀ ਪੁੱਛ ਸਕਦਾ ਹਾਂ?", answer: "ਮੌਜੂਦਾ ਰਿਕਾਰਡ, ਰਿਪੋਰਟਾਂ ਜਾਂ ਕਿਸੇ ਕਾਰਵਾਈ ਦੀ ਸਥਿਤੀ ਪੁੱਛੀ ਜਾ ਸਕਦੀ ਹੈ।" },
  ],
  ur: [
    { key: "file", label: "درخواست کیسے دیں؟", answer: "'RTI درخواست شروع کریں' پر ٹیپ کریں، مرکزی یا ریاستی منتخب کریں، مسئلہ لکھیں اور محفوظ کرنے سے پہلے جائزہ لیں۔" },
    { key: "fee", label: "خرچ کتنا ہے؟", answer: "فیس ₹10 ہے، درست BPL ثبوت ہونے پر مفت۔" },
    { key: "time", label: "جواب میں کتنے دن؟", answer: "ادارے کو 30 دن میں جواب دینا ہوتا ہے۔" },
    { key: "route", label: "مرکزی یا ریاستی؟", answer: "ریلوے، انکم ٹیکس، پاسپورٹ مرکزی زمرے میں آتے ہیں۔ مقامی دفاتر اور اسکیمیں ریاستی زمرے میں آتی ہیں۔" },
    { key: "track", label: "درخواست ٹریک کریں", answer: "'درخواست ٹریک کریں' کھولیں اور سرکاری رجسٹریشن نمبر درج کریں۔" },
    { key: "ask", label: "میں کیا پوچھ سکتا ہوں؟", answer: "موجودہ ریکارڈ، رپورٹس یا کسی کارروائی کی صورتحال پوچھی جا سکتی ہے۔" },
  ],
  or: [
    { key: "file", label: "କିପରି ଆବେଦନ କରିବେ?", answer: "'RTI ଅନୁରୋଧ ଆରମ୍ଭ କରନ୍ତୁ'କୁ ଟାପ୍ କରନ୍ତୁ, କେନ୍ଦ୍ର କିମ୍ବା ରାଜ୍ୟ ବାଛନ୍ତୁ, ସମସ୍ୟା ଲେଖନ୍ତୁ ଏବଂ ସେଭ୍ କରିବା ପୂର୍ବରୁ ଯାଞ୍ଚ କରନ୍ତୁ।" },
    { key: "fee", label: "ଖର୍ଚ୍ଚ କେତେ?", answer: "ଫି ₹10, ବୈଧ BPL ପ୍ରମାଣ ଥିଲେ ମାଗଣା।" },
    { key: "time", label: "ଉତ୍ତର ପାଇଁ କେତେ ଦିନ?", answer: "ପ୍ରାଧିକରଣ 30 ଦିନ ମଧ୍ୟରେ ଉତ୍ତର ଦେବା ଆବଶ୍ୟକ।" },
    { key: "route", label: "କେନ୍ଦ୍ର ନା ରାଜ୍ୟ?", answer: "ରେଳ, ଆୟକର, ପାସପୋର୍ଟ କେନ୍ଦ୍ର ଅଧୀନରେ ଆସେ। ସ୍ଥାନୀୟ କାର୍ଯ୍ୟାଳୟ ଓ ଯୋଜନା ରାଜ୍ୟ ଅଧୀନରେ ଆସେ।" },
    { key: "track", label: "ଅନୁରୋଧ ଟ୍ରାକ୍ କରନ୍ତୁ", answer: "'ଅନୁରୋଧ ଟ୍ରାକ୍ କରନ୍ତୁ' ଖୋଲି ସରକାରୀ ପଞ୍ଜୀକରଣ ନମ୍ବର ଦିଅନ୍ତୁ।" },
    { key: "ask", label: "ମୁଁ କଣ ପଚାରି ପାରିବି?", answer: "ବିଦ୍ୟମାନ ରେକର୍ଡ, ରିପୋର୍ଟ କିମ୍ବା କୌଣସି କାର୍ଯ୍ୟର ସ୍ଥିତି ପଚାରି ପାରିବେ।" },
  ],
  as: [
    { key: "file", label: "কেনেকৈ আবেদন কৰিব?", answer: "'RTI আবেদন কৰক'ত টিপক, কেন্দ্ৰীয় বা ৰাজ্যিক বাছক, সমস্যা লিখক আৰু ছেভ কৰাৰ আগতে পৰীক্ষা কৰক।" },
    { key: "fee", label: "খৰচ কিমান?", answer: "মাচুল ₹10, বৈধ BPL প্ৰমাণ থাকিলে বিনামূলীয়া।" },
    { key: "time", label: "উত্তৰলৈ কিমান দিন?", answer: "কৰ্তৃপক্ষই 30 দিনৰ ভিতৰত উত্তৰ দিব লাগে।" },
    { key: "route", label: "কেন্দ্ৰীয় নে ৰাজ্যিক?", answer: "ৰেল, আয়কৰ, পাছপৰ্ট কেন্দ্ৰীয় বিভাগত পৰে। স্থানীয় কাৰ্যালয় আৰু আঁচনি ৰাজ্যিক বিভাগত পৰে।" },
    { key: "track", label: "আবেদন অনুসৰণ কৰক", answer: "'আবেদন অনুসৰণ কৰক' খুলি চৰকাৰী পঞ্জীয়ন নম্বৰ দিয়ক।" },
    { key: "ask", label: "মই কি সুধিব পাৰোঁ?", answer: "থকা নথি, প্ৰতিবেদন বা কোনো পদক্ষেপৰ অৱস্থা সুধিব পাৰি।" },
  ],
};

const SPEECH_LOCALE = {
  en: "en-IN", hi: "hi-IN", ta: "ta-IN", te: "te-IN", kn: "kn-IN", ml: "ml-IN",
  bn: "bn-IN", mr: "mr-IN", gu: "gu-IN", pa: "pa-IN", ur: "ur-IN", or: "or-IN", as: "as-IN",
};

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
const micBtn = $("#chatMicButton");
const agentBtn = $("#chatAgentButton");
const kicker = $("#chatKicker");
const title = $("#chatTitle");
const intro = $("#chatIntro");
const note = $("#chatNote span:last-child");
const statusEl = $("#chatStatus");

// The sidebar's theme now follows the site's own theme toggle (app.js
// dispatches rti-saathi:theme) rather than keeping an independent one, so
// there's a single control instead of two that could disagree.
function readSiteTheme() {
  try { return localStorage.getItem("rti-theme") === "dark" ? "dark" : "light"; } catch { return "light"; }
}
function applyChatTheme(theme) {
  sidebar.dataset.theme = theme;
}
applyChatTheme(readSiteTheme());
window.addEventListener("rti-saathi:theme", (event) => {
  applyChatTheme((event.detail && event.detail.theme) === "dark" ? "dark" : "light");
});

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
  const native = OTHER_PROMPTS[siteLang];
  const list = native || strings().quickPrompts;
  list.forEach((item) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chat-chip";
    chip.textContent = item.label;
    chip.addEventListener("click", () => sendMessage(item.prompt || item.label, item, Boolean(native)));
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

function appendMessage(role, text, tag) {
  const row = document.createElement("div");
  row.className = "chat-msg-row" + (role === "user" ? " is-user" : "");

  if (role === "bot" && tag) {
    const tagEl = document.createElement("span");
    tagEl.className = "chat-tag";
    tagEl.textContent = tag === true ? strings().offline : tag;
    row.appendChild(tagEl);
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

function pickVoice(langCode) {
  if (!("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const exact = voices.find((v) => v.lang && v.lang.toLowerCase() === langCode.toLowerCase());
  if (exact) return exact;
  const prefix = langCode.split("-")[0].toLowerCase();
  return voices.find((v) => v.lang && v.lang.toLowerCase().startsWith(prefix)) || null;
}

function speechLanguage(text) {
  // English and Hindi are the two fully supported assistant languages. When
  // a bilingual answer contains a Hindi line, choose the Hindi voice for that
  // line instead of relying on the page language alone.
  return /[\u0900-\u097F]/.test(text) ? "hi-IN" : "en-IN";
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
    const lines = String(text).split(/\n+/).map((line) => line.trim()).filter(Boolean);
    let index = 0;
    const speakLine = () => {
      const line = lines[index];
      if (!line) return resetListenButton(btn);
      const targetLang = speechLanguage(line);
      const voice = pickVoice(targetLang);
      const utter = new SpeechSynthesisUtterance(line);
      utter.lang = voice ? voice.lang : targetLang;
      if (voice) utter.voice = voice;
      utter.rate = 1;
      utter.onend = () => { index += 1; index < lines.length ? speakLine() : resetListenButton(btn); };
      utter.onerror = () => resetListenButton(btn);
      window.speechSynthesis.speak(utter);
    };
    speakLine();
    btn.classList.add("is-active");
    btn.textContent = strings().stop;
    speaking = btn;
  };

  // Give Chrome's cancel() a beat to actually take effect before speaking.
  if (hadSpeech) setTimeout(speakNow, 60);
  else speakNow();
}

// ---------- offline fallback ----------
// Keyword matching is only ever run against the fixed English keyword set
// below, regardless of the visitor's language: it's approximate by design,
// used only to pick which canned topic to answer with when free-typed text
// can't be sent to the model.
function matchKey(rawText) {
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
  return bestKey;
}
function answerForKey(langCode, key) {
  const list = (STRINGS[langCode] || STRINGS.en).quickPrompts;
  const found = list.find((q) => q.key === key);
  return (found || list.find((q) => q.key === "ask")).answer;
}

// ---------- send / receive ----------
async function sendMessage(text, matchedPrompt, isNativeAnswer) {
  const trimmed = (text || "").trim();
  if (!trimmed) return;
  appendMessage("user", trimmed);
  history.push({ role: "user", content: trimmed });
  input.value = "";

  // A predefined native-language chip is authoritative on its own: skip the
  // model entirely and show the curated answer directly, instantly.
  if (matchedPrompt && isNativeAnswer) {
    appendMessage("bot", matchedPrompt.answer);
    history.push({ role: "assistant", content: matchedPrompt.answer });
    return;
  }

  const typing = appendTyping();

  // Anything else - free-typed text in any language, or a chip click in a
  // language we don't have curated native answers for - always answers in
  // English followed by Hindi when working offline, since matching or
  // composing reliably in this many scripts isn't something a keyword
  // matcher can do, but English-then-Hindi reaches almost every visitor.
  const fallBack = () => {
    typing.remove();
    const key = matchedPrompt ? matchedPrompt.key : (matchKey(trimmed) || "ask");
    const answer = (siteLang === "en" || siteLang === "hi")
      ? answerForKey(siteLang, key)
      : answerForKey("en", key) + "\n\n" + answerForKey("hi", key);
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

// ---------- connect with an agent (demo hand-off, no real human involved) ----------
const AGENT_NAMES = ["Priya", "Arjun", "Meera", "Rohit", "Ananya"];
agentBtn.addEventListener("click", () => {
  const name = AGENT_NAMES[Math.floor(Math.random() * AGENT_NAMES.length)];
  const reply = `I am ${name}, your Saathi. How can I help you?`;
  appendMessage("bot", reply, "Connect with an agent \u00b7 Demo");
  history.push({ role: "assistant", content: reply });
});

// ---------- voice message (demo placeholder, no real speech recognition yet) ----------
const VOICE_REPLIES = [
  "Thanks for the voice message. Voice understanding is a demo for now \u2014 could you type your question above?",
  "Got your voice note. This feature is still a prototype, so please type it out and I'll answer right away.",
  "I heard something, but I can't understand voice messages yet. Type your question and I'll help.",
];
micBtn.addEventListener("click", () => {
  if (micBtn.classList.contains("is-recording")) return;
  micBtn.classList.add("is-recording");
  appendMessage("user", "\ud83c\udfa4 Voice message");
  history.push({ role: "user", content: "(voice message)" });
  setTimeout(() => {
    micBtn.classList.remove("is-recording");
    const reply = VOICE_REPLIES[Math.floor(Math.random() * VOICE_REPLIES.length)];
    appendMessage("bot", reply, "Voice reply \u00b7 Demo");
    history.push({ role: "assistant", content: reply });
  }, 700);
});

applyChrome();
checkAssistantStatus();
