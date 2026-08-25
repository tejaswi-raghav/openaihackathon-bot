const $ = (s, r = document) => r.querySelector(s),
  $$ = (s, r = document) => [...r.querySelectorAll(s)];
const translations = {
  en: {},
  hi: {
    brandSub: "सूचना का अधिकार, आसान बनाया",
    navHow: "यह कैसे काम करता है",
    navAsk: "मैं क्या पूछ सकता हूँ?",
    track: "आवेदन ट्रैक करें",
    lite: "लाइट",
    eyebrow: "नागरिक-प्रथम RTI अनुभव",
    heroLine1: "आपका सवाल।",
    heroLine2: "जानना आपका अधिकार।",
    heroIntro:
      "किसी भी केंद्रीय सरकारी लोक प्राधिकरण से अपनी भाषा में, किसी भी फ़ोन से जानकारी माँगें।",
    start: "RTI आवेदन शुरू करें",
    noAccount: "खाता आवश्यक नहीं · ड्राफ्ट इस डिवाइस पर सहेजा जाता है",
    quickGuide: "आपकी आसान मार्गदर्शिका",
    guideTitle: "पहले बताएं, आपका सवाल किसके लिए है",
    guideBody:
      "हम सही सरकारी प्राधिकरण चुनने में मदद करेंगे। विभाग का नाम जानना ज़रूरी नहीं।",
    helpChoose: "चुनने में मदद करें",
    fee: "मानक शुल्क",
    days: "उत्तर के दिन*",
    lowData: "कम डेटा पर चलता है",
    lowDataSub: "भारी चित्र या वीडियो नहीं",
    languages: "22 भारतीय भाषाएँ",
    languagesSub: "अपनी भरोसे की भाषा चुनें",
    accessible: "सभी के लिए सुलभ",
    accessibleSub: "कीबोर्ड, स्क्रीन रीडर और बड़े अक्षर",
    offline: "ऑफलाइन ड्राफ्ट",
    offlineSub: "सिग्नल आने पर जमा करें",
    simpleProcess: "एक सरल प्रक्रिया",
    threeSteps: "सवाल से जवाब तक, तीन स्पष्ट कदम।",
    step1Title: "अपने शब्दों में पूछें",
    step1Body:
      "बताएं कि आपको क्या जानकारी चाहिए। उपयोगी संकेत इसे स्पष्ट RTI में बदलेंगे।",
    step2Title: "सही जगह पहुँचाएँ",
    step2Body: "दो आसान सवालों से सही केंद्रीय या राज्य प्राधिकरण तक पहुँचें।",
    step3Title: "हर अपडेट देखें",
    step3Body: "एक संदर्भ नंबर से उत्तर, अतिरिक्त शुल्क और अपील तिथि देखें।",
    askLabel: "मैं क्या पूछ सकता हूँ?",
    examplesTitle: "सार्वजनिक जानकारी जनता की है।",
    examplesBody:
      "रिकॉर्ड, दस्तावेज़, रिपोर्ट या सरकारी काम की स्थिति माँगें। ऐसे विचार या कारण न पूछें जो रिकॉर्ड में नहीं हैं।",
    tryQuestion: "अपना सवाल आज़माएँ",
    category1: "सार्वजनिक निर्माण",
    category2: "कल्याण योजना",
    category3: "शिकायत की स्थिति",
    readyLabel: "जब आप तैयार हों",
    ctaTitle: "एक सवाल बदलाव शुरू कर सकता है।",
    ctaBody: "जमा करने तक आपका ड्राफ्ट इसी डिवाइस पर रहता है।",
    prototype: "स्वतंत्र हैकाथॉन प्रोटोटाइप। भारत सरकार की आधिकारिक सेवा नहीं।",
    guidedRequest: "निर्देशित आवेदन",
    requestTitle: "आइए सही रास्ता खोजें।",
    levelQuestion:
      "जानकारी केंद्र सरकार के पास है या राज्य/स्थानीय निकाय के पास?",
    levelHelp:
      "उदाहरण: रेलवे और पासपोर्ट केंद्रीय हैं। पंचायत, स्थानीय पुलिस और राज्य बिजली बोर्ड आमतौर पर राज्य के हैं।",
    central: "केंद्र सरकार",
    centralExamples: "रेलवे, आयकर, पासपोर्ट, राष्ट्रीय मंत्रालय",
    state: "राज्य या स्थानीय प्राधिकरण",
    stateExamples: "पंचायत, नगरपालिका, स्थानीय पुलिस, राज्य सेवाएँ",
    unsure: "मुझे पक्का नहीं",
    unsureHelp: "समस्या बताएं, हम रास्ता सुझाएँगे",
    continue: "आगे बढ़ें",
    back: "पीछे",
    saved: "इस डिवाइस पर सहेजा गया",
    topicLabel: "आपका सवाल किस बारे में है?",
    chooseTopic: "विषय चुनें",
    authorityLabel: "संबंधित विभाग या स्थान",
    routeTip:
      "सही अधिकारी का नाम ज़रूरी नहीं। जहाँ लागू हो, प्राधिकरण को आवेदन सही अधिकारी तक भेजना होता है।",
    questionLabel: "आपको कौन-सी जानकारी चाहिए?",
    improve: "इसे स्पष्ट बनाने में मदद करें",
    attach: "सहायक दस्तावेज़ जोड़ें",
    attachSub: "वैकल्पिक · PDF या चित्र · अधिकतम 1 MB",
    reviewTitle: "आपका ड्राफ्ट तैयार है",
    reviewBody:
      "नीचे विवरण जाँचें। यह प्रोटोटाइप डेमो संदर्भ बनाएगा; सरकार को डेटा नहीं भेजेगा।",
    citizenConfirm: "मैं भारतीय नागरिक हूँ और ऊपर की जानकारी सही है।",
    applicationFee: "आवेदन शुल्क",
    bplNote: "वैध BPL प्रमाण वाले आवेदकों के लिए ₹0",
    stateRouteTitle: "इस आवेदन के लिए राज्य RTI पोर्टल चाहिए।",
    stateRouteBody:
      "केंद्रीय पोर्टल की चेतावनी है कि राज्य आवेदन बिना वापसी के लौटाए जा सकते हैं। सही राज्य पोर्टल खोजें।",
    findState: "मेरा राज्य पोर्टल खोजें ↗",
    createDemo: "डेमो आवेदन बनाएँ",
    demoComplete: "डेमो पूरा",
    draftSaved: "आपका RTI ड्राफ्ट सहेजा गया।",
    demoWarning:
      "सरकार को कुछ नहीं भेजा गया। आवेदन के लिए आधिकारिक पोर्टल उपयोग करें।",
    demoReference: "डेमो संदर्भ",
    officialPortal: "आधिकारिक पोर्टल पर जाएँ",
    done: "पूर्ण",
    statusLookup: "स्थिति खोज",
    trackTitle: "अपना आवेदन ट्रैक करें",
    trackHelp:
      "आधिकारिक पंजीकरण संख्या डालें। हम सुरक्षित सरकारी स्थिति पेज खोलेंगे।",
    registrationNo: "पंजीकरण संख्या",
    checkOfficial: "आधिकारिक पोर्टल पर देखें",
    privacy: "यह प्रोटोटाइप आपका नंबर सहेजता या भेजता नहीं।",
    offlineNow: "आप ऑफलाइन हैं",
    offlineNowSub: "लिखते रहें। आपका ड्राफ्ट सुरक्षित है।",
  },
  bn: {
    heroLine1: "আপনার প্রশ্ন।",
    heroLine2: "জানার অধিকার আপনার।",
    heroIntro: "সহজ ভাষায়, যেকোনো ফোন থেকে কেন্দ্রীয় সরকারের কাছে তথ্য চান।",
    start: "RTI আবেদন শুরু করুন",
    track: "আবেদন ট্র্যাক করুন",
    navHow: "কীভাবে কাজ করে",
    navAsk: "কী জানতে পারি?",
    lowData: "কম ডেটায় চলে",
    languages: "২২টি ভারতীয় ভাষা",
    offline: "অফলাইন খসড়া",
    prototype: "স্বাধীন হ্যাকাথন প্রোটোটাইপ। ভারত সরকারের সরকারি পরিষেবা নয়।",
  },
  ta: {
    heroLine1: "உங்கள் கேள்வி.",
    heroLine2: "அறிவது உங்கள் உரிமை.",
    heroIntro:
      "எந்த தொலைபேசியிலிருந்தும் எளிய மொழியில் மத்திய அரசிடம் தகவல் கேளுங்கள்.",
    start: "RTI கோரிக்கையைத் தொடங்குங்கள்",
    track: "கோரிக்கையைக் கண்காணிக்க",
    navHow: "இது எப்படி வேலை செய்கிறது",
    navAsk: "நான் என்ன கேட்கலாம்?",
    lowData: "குறைந்த தரவில் இயங்கும்",
    languages: "22 இந்திய மொழிகள்",
    offline: "ஆஃப்லைன் வரைவு",
    prototype:
      "சுயாதீன ஹேக்கத்தான் முன்மாதிரி. இந்திய அரசின் அதிகாரப்பூர்வ சேவை அல்ல.",
  },
  te: {
    heroLine1: "మీ ప్రశ్న.",
    heroLine2: "తెలుసుకోవడం మీ హక్కు.",
    heroIntro:
      "ఏ ఫోన్ నుంచైనా సరళమైన భాషలో కేంద్ర ప్రభుత్వ సమాచారాన్ని అడగండి.",
    start: "RTI అభ్యర్థన ప్రారంభించండి",
    track: "అభ్యర్థనను ట్రాక్ చేయండి",
    navHow: "ఇది ఎలా పనిచేస్తుంది",
    navAsk: "నేను ఏమి అడగగలను?",
    lowData: "తక్కువ డేటాలో పనిచేస్తుంది",
    languages: "22 భారతీయ భాషలు",
    offline: "ఆఫ్‌లైన్ డ్రాఫ్ట్",
    prototype: "స్వతంత్ర హ్యాకథాన్ నమూనా. భారత ప్రభుత్వ అధికారిక సేవ కాదు.",
  },
  mr: {
    heroLine1: "तुमचा प्रश्न.",
    heroLine2: "जाणून घेणे तुमचा हक्क.",
    heroIntro: "कोणत्याही फोनवरून सोप्या भाषेत केंद्र सरकारकडे माहिती मागा.",
    start: "RTI अर्ज सुरू करा",
    track: "अर्जाचा मागोवा घ्या",
    navHow: "हे कसे चालते",
    navAsk: "मी काय विचारू शकतो?",
    lowData: "कमी डेटावर चालते",
    languages: "२२ भारतीय भाषा",
    offline: "ऑफलाइन मसुदा",
    prototype: "स्वतंत्र हॅकाथॉन नमुना. भारत सरकारची अधिकृत सेवा नाही.",
  },
  gu: {
    heroLine1: "તમારો પ્રશ્ન.",
    heroLine2: "જાણવું તમારો અધિકાર.",
    heroIntro: "કોઈપણ ફોનથી સરળ ભાષામાં કેન્દ્ર સરકાર પાસે માહિતી માંગો.",
    start: "RTI અરજી શરૂ કરો",
    track: "અરજી ટ્રૅક કરો",
    navHow: "કેવી રીતે કામ કરે છે",
    navAsk: "હું શું પૂછી શકું?",
    lowData: "ઓછા ડેટા પર ચાલે છે",
    languages: "22 ભારતીય ભાષાઓ",
    offline: "ઓફલાઇન ડ્રાફ્ટ",
    prototype: "સ્વતંત્ર હેકાથોન પ્રોટોટાઇપ. ભારત સરકારની અધિકૃત સેવા નથી.",
  },
  kn: {
    heroLine1: "ನಿಮ್ಮ ಪ್ರಶ್ನೆ.",
    heroLine2: "ತಿಳಿಯುವುದು ನಿಮ್ಮ ಹಕ್ಕು.",
    heroIntro:
      "ಯಾವುದೇ ಫೋನ್‌ನಿಂದ ಸರಳ ಭಾಷೆಯಲ್ಲಿ ಕೇಂದ್ರ ಸರ್ಕಾರದ ಮಾಹಿತಿಯನ್ನು ಕೇಳಿ.",
    start: "RTI ವಿನಂತಿ ಪ್ರಾರಂಭಿಸಿ",
    track: "ವಿನಂತಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ",
    navHow: "ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ",
    navAsk: "ನಾನು ಏನು ಕೇಳಬಹುದು?",
    lowData: "ಕಡಿಮೆ ಡೇಟಾದಲ್ಲಿ ಕೆಲಸ",
    languages: "22 ಭಾರತೀಯ ಭಾಷೆಗಳು",
    offline: "ಆಫ್‌ಲೈನ್ ಕರಡು",
    prototype: "ಸ್ವತಂತ್ರ ಹ್ಯಾಕಥಾನ್ ಮಾದರಿ. ಭಾರತ ಸರ್ಕಾರದ ಅಧಿಕೃತ ಸೇವೆಯಲ್ಲ.",
  },
  ml: {
    heroLine1: "നിങ്ങളുടെ ചോദ്യം.",
    heroLine2: "അറിയുക നിങ്ങളുടെ അവകാശം.",
    heroIntro:
      "ഏത് ഫോണിൽ നിന്നും ലളിതമായ ഭാഷയിൽ കേന്ദ്ര സർക്കാരിനോട് വിവരങ്ങൾ ചോദിക്കുക.",
    start: "RTI അപേക്ഷ ആരംഭിക്കുക",
    track: "അപേക്ഷ ട്രാക്ക് ചെയ്യുക",
    navHow: "ഇത് എങ്ങനെ പ്രവർത്തിക്കുന്നു",
    navAsk: "എന്ത് ചോദിക്കാം?",
    lowData: "കുറഞ്ഞ ഡാറ്റയിൽ പ്രവർത്തിക്കുന്നു",
    languages: "22 ഇന്ത്യൻ ഭാഷകൾ",
    offline: "ഓഫ്‌ലൈൻ ഡ്രാഫ്റ്റ്",
    prototype:
      "സ്വതന്ത്ര ഹാക്കത്തോൺ മാതൃക. ഇന്ത്യാ സർക്കാരിന്റെ ഔദ്യോഗിക സേവനമല്ല.",
  },
  pa: {
    heroLine1: "ਤੁਹਾਡਾ ਸਵਾਲ।",
    heroLine2: "ਜਾਣਨਾ ਤੁਹਾਡਾ ਹੱਕ।",
    heroIntro: "ਕਿਸੇ ਵੀ ਫ਼ੋਨ ਤੋਂ ਸੌਖੀ ਭਾਸ਼ਾ ਵਿੱਚ ਕੇਂਦਰ ਸਰਕਾਰ ਤੋਂ ਜਾਣਕਾਰੀ ਮੰਗੋ।",
    start: "RTI ਬੇਨਤੀ ਸ਼ੁਰੂ ਕਰੋ",
    track: "ਬੇਨਤੀ ਟਰੈਕ ਕਰੋ",
    navHow: "ਇਹ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ",
    navAsk: "ਮੈਂ ਕੀ ਪੁੱਛ ਸਕਦਾ ਹਾਂ?",
    lowData: "ਘੱਟ ਡੇਟਾ 'ਤੇ ਚੱਲਦਾ ਹੈ",
    languages: "22 ਭਾਰਤੀ ਭਾਸ਼ਾਵਾਂ",
    offline: "ਆਫਲਾਈਨ ਖਰੜਾ",
    prototype: "ਸੁਤੰਤਰ ਹੈਕਾਥਾਨ ਪ੍ਰੋਟੋਟਾਈਪ। ਭਾਰਤ ਸਰਕਾਰ ਦੀ ਅਧਿਕਾਰਤ ਸੇਵਾ ਨਹੀਂ।",
  },
  ur: {
    heroLine1: "آپ کا سوال۔",
    heroLine2: "جاننا آپ کا حق۔",
    heroIntro: "کسی بھی فون سے آسان زبان میں مرکزی حکومت سے معلومات مانگیں۔",
    start: "RTI درخواست شروع کریں",
    track: "درخواست ٹریک کریں",
    navHow: "یہ کیسے کام کرتا ہے",
    navAsk: "میں کیا پوچھ سکتا ہوں؟",
    lowData: "کم ڈیٹا پر کام کرتا ہے",
    languages: "22 بھارتی زبانیں",
    offline: "آف لائن مسودہ",
    prototype: "آزاد ہیکاتھون نمونہ۔ حکومت ہند کی سرکاری سروس نہیں۔",
  },
  or: {
    heroLine1: "ଆପଣଙ୍କ ପ୍ରଶ୍ନ।",
    heroLine2: "ଜାଣିବା ଆପଣଙ୍କ ଅଧିକାର।",
    start: "RTI ଅନୁରୋଧ ଆରମ୍ଭ କରନ୍ତୁ",
    track: "ଅନୁରୋଧ ଟ୍ରାକ୍ କରନ୍ତୁ",
    lowData: "କମ୍ ଡାଟାରେ କାମ କରେ",
    languages: "22 ଭାରତୀୟ ଭାଷା",
    offline: "ଅଫଲାଇନ୍ ଡ୍ରାଫ୍ଟ",
  },
};
const fallbackLanguage = {
  as: "bn",
  sa: "hi",
  ks: "ur",
  ne: "hi",
  sd: "ur",
  kok: "mr",
  mni: "bn",
  brx: "hi",
  doi: "hi",
  sat: "hi",
};
let currentStep = 1,
  lastFocus = null;
const requestModal = $("#requestModal"),
  trackModal = $("#trackModal"),
  form = $("#requestForm");
function applyLanguage(lang) {
  const dict =
    translations[lang] ||
    translations[fallbackLanguage[lang]] ||
    translations.en;
  document.documentElement.lang = lang;
  document.documentElement.dir =
    lang === "ur" || lang === "ks" || lang === "sd" ? "rtl" : "ltr";
  $$("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    const val = dict[key] || translations.en[key];
    if (val) el.textContent = val;
  });
  localStorage.setItem("rti-language", lang);
}
function openModal(modal) {
  lastFocus = document.activeElement;
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  setTimeout(() => $(".close-button", modal)?.focus(), 0);
}
function closeModal(modal) {
  modal.hidden = true;
  document.body.style.overflow = "";
  lastFocus?.focus();
}
function updateStep(n) {
  currentStep = n;
  $$(".form-step").forEach((x) => (x.hidden = +x.dataset.step !== n));
  $("#stateNotice").hidden = true;
  $("#backButton").hidden = n === 1;
  $("#nextButton").hidden = n === 4;
  $("#submitButton").hidden = n !== 4;
  $("#progressText").textContent = `Step ${n} of 4`;
  $("#progressPercent").textContent = `${n * 25}%`;
  $("#progressFill").style.width = `${n * 25}%`;
  if (n === 4) buildReview();
}
function saveDraft() {
  const fd = new FormData(form),
    data = {};
  for (const [k, v] of fd) if (typeof v === "string") data[k] = v;
  localStorage.setItem("rti-saathi-draft", JSON.stringify(data));
  $("#autosaveText").style.opacity = "1";
  setTimeout(() => ($("#autosaveText").style.opacity = ".55"), 900);
}
function loadDraft() {
  try {
    const d = JSON.parse(localStorage.getItem("rti-saathi-draft"));
    if (!d) return;
    Object.entries(d).forEach(([k, v]) => {
      const el = form.elements[k];
      if (!el) return;
      if (el instanceof RadioNodeList) {
        const r = $(`[name="${k}"][value="${v}"]`);
        if (r) r.checked = true;
      } else el.value = v;
    });
    $("#charCount").textContent = $("#question").value.length;
  } catch {}
}
function validateStep() {
  const area = $(`.form-step[data-step="${currentStep}"]`);
  const required = $$("[required]", area);
  for (const el of required) {
    if (el.type === "radio") {
      if (!$(`[name="${el.name}"]:checked`, area)) {
        el.focus();
        return false;
      }
    } else if (!el.value.trim()) {
      el.focus();
      el.reportValidity();
      return false;
    }
  }
  return true;
}
function buildReview() {
  const data = new FormData(form);
  const items = [
    ["Route", data.get("level")],
    ["Topic", data.get("topic")],
    ["Department", data.get("authority") || "Not specified"],
    ["Question", data.get("question")],
  ];
  $("#reviewList").innerHTML = items
    .map(
      ([a, b]) =>
        `<div><dt>${a}</dt><dd>${String(b || "").replace(/[<>]/g, "")}</dd></div>`,
    )
    .join("");
}
$$('[data-action="start"]').forEach((b) =>
  b.addEventListener("click", () => {
    updateStep(1);
    openModal(requestModal);
  }),
);
$$('[data-action="track"]').forEach((b) =>
  b.addEventListener("click", () => openModal(trackModal)),
);
$$('[data-action="close-modal"]').forEach((b) =>
  b.addEventListener("click", () => closeModal(requestModal)),
);
$$('[data-action="close-track"]').forEach((b) =>
  b.addEventListener("click", () => closeModal(trackModal)),
);
$("#nextButton").addEventListener("click", () => {
  if (!validateStep()) return;
  const level = $('[name="level"]:checked')?.value;
  if (currentStep === 1 && level === "state") {
    $("#stateNotice").hidden = false;
    $("#stateNotice").scrollIntoView({ behavior: "smooth", block: "nearest" });
    saveDraft();
    return;
  }
  saveDraft();
  updateStep(Math.min(4, currentStep + 1));
});
$("#backButton").addEventListener("click", () =>
  updateStep(Math.max(1, currentStep - 1)),
);
form.addEventListener("input", (e) => {
  if (e.target.id === "question")
    $("#charCount").textContent = e.target.value.length;
  clearTimeout(window._saveTimer);
  window._saveTimer = setTimeout(saveDraft, 350);
});
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!validateStep()) return;
  $("#requestForm").hidden = true;
  $(".progress-wrap", requestModal).hidden = true;
  $("#successState").hidden = false;
  $("#demoReference").textContent =
    `RTI-DEMO-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  localStorage.removeItem("rti-saathi-draft");
});
$("#promptButton").addEventListener("click", () => {
  const text = $("#question").value.trim();
  const box = $("#promptResult");
  box.hidden = false;
  box.textContent = text
    ? `Tip: Add a date range and ask for “certified copies of records” where useful. Keep each request focused on one subject.`
    : `Start with: “Please provide a certified copy of…” Then add the place, date range, and specific record you need.`;
});
$("#supportingFile").addEventListener("change", (e) => {
  const f = e.target.files[0];
  if (f && f.size > 1048576) {
    alert("Please choose a file smaller than 1 MB.");
    e.target.value = "";
  }
});
$("#languageSelect").addEventListener("change", (e) =>
  applyLanguage(e.target.value),
);
$("#liteToggle").addEventListener("click", (e) => {
  const on = document.documentElement.classList.toggle("lite");
  e.currentTarget.setAttribute("aria-pressed", String(on));
  localStorage.setItem("rti-lite", on ? "1" : "0");
});
$("#menuButton").addEventListener("click", (e) => {
  const open = e.currentTarget.getAttribute("aria-expanded") === "true";
  e.currentTarget.setAttribute("aria-expanded", String(!open));
  $("#mobileMenu").hidden = open;
});
$("#mobileMenu").addEventListener("click", () => {
  $("#mobileMenu").hidden = true;
  $("#menuButton").setAttribute("aria-expanded", "false");
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (!requestModal.hidden) closeModal(requestModal);
    if (!trackModal.hidden) closeModal(trackModal);
  }
});
function networkState() {
  const offline = !navigator.onLine;
  $("#offlineToast").hidden = !offline;
  document.body.classList.toggle("is-offline", offline);
}
addEventListener("online", networkState);
addEventListener("offline", networkState);
networkState();
const savedLang = localStorage.getItem("rti-language") || "en";
$("#languageSelect").value = savedLang;
applyLanguage(savedLang);
loadDraft();
if (
  localStorage.getItem("rti-lite") === "1" ||
  navigator.connection?.saveData
) {
  document.documentElement.classList.add("lite");
  $("#liteToggle").setAttribute("aria-pressed", "true");
}
if ("serviceWorker" in navigator)
  addEventListener("load", () =>
    navigator.serviceWorker.register("/sw.js").catch(() => {}),
  );
