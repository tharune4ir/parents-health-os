export interface WhatsAppTemplate {
  name: string;
  language: "en" | "hi" | "te";
  category: "utility" | "marketing" | "authentication";
  text: string;
}

export const TEMPLATE_REGISTRY: Record<string, WhatsAppTemplate> = {
  // Morning Checkin
  "morning_checkin_en": {
    name: "morning_checkin",
    language: "en",
    category: "utility",
    text: "Namaste {{parentName}}! 🙏 This is Anaya from Parents Health OS. Hope you slept well. Have you taken your morning warm water and medicines? Let me know! 🌟"
  },
  "morning_checkin_hi": {
    name: "morning_checkin",
    language: "hi",
    category: "utility",
    text: "नमस्ते {{parentName}}! 🙏 मैं पेरेंट्स हेल्थ ओएस से अनाया हूँ। आशा है आप अच्छी तरह सोए होंगे। क्या आपने सुबह का गुनगुना पानी और दवाएं ले ली हैं? मुझे बताएं! 🌟"
  },
  "morning_checkin_te": {
    name: "morning_checkin",
    language: "te",
    category: "utility",
    text: "నమస్తే {{parentName}}! 🙏 నేను పేరెంట్స్ హెల్త్ ఓఎస్ నుండి అనయను. మీరు బాగా పడుకున్నారని ఆశిస్తున్నాను. మీ ఉదయం గోరువెచ్చని నీరు మరియు మందులు తీసుకున్నారా? నాకు తెలియజేయండి! 🌟"
  },

  // BP Reminder
  "bp_reminder_en": {
    name: "bp_reminder",
    language: "en",
    category: "utility",
    text: "Hello {{parentName}}, it is time to measure your Blood Pressure today. Please sit comfortably for 5 minutes, take your reading, and reply with the numbers (e.g. 120/80). Thank you! 🩺"
  },
  "bp_reminder_hi": {
    name: "bp_reminder",
    language: "hi",
    category: "utility",
    text: "नमस्ते {{parentName}}, आज ब्लड प्रेशर मापने का समय हो गया है। कृपया 5 मिनट आराम से बैठें, अपनी रीडिंग लें, और नंबरों के साथ जवाब दें (जैसे 120/80)। धन्यवाद! 🩺"
  },
  "bp_reminder_te": {
    name: "bp_reminder",
    language: "te",
    category: "utility",
    text: "హలో {{parentName}}, ఈరోజు మీ రక్తపోటు (Blood Pressure) కొలవడానికి సమయం అయింది. దయచేసి 5 నిమిషాలు హాయిగా కూర్చుని, రీడింగ్ తీసుకుని, ఆ నంబర్లతో సమాధానం ఇవ్వండి (ఉదా. 120/80). ధన్యవాదాలు! 🩺"
  },

  // Medicine Reminder
  "med_reminder_en": {
    name: "med_reminder",
    language: "en",
    category: "utility",
    text: "Hi {{parentName}}! Just a gentle reminder to take your scheduled medications: {{medicationDetails}} ({{timing}}). Please reply 'Taken' once you have had them! 💊"
  },
  "med_reminder_hi": {
    name: "med_reminder",
    language: "hi",
    category: "utility",
    text: "नमस्ते {{parentName}}! आपकी निर्धारित दवाएं लेने का समय आ गया है: {{medicationDetails}} ({{timing}})। कृपया दवा लेने के बाद 'Taken' लिखकर जवाब दें! 💊"
  },
  "med_reminder_te": {
    name: "med_reminder",
    language: "te",
    category: "utility",
    text: "హలా {{parentName}}! మీ మందులు వేసుకునే సమయం అయింది: {{medicationDetails}} ({{timing}}). మీరు వాటిని వేసుకున్న తర్వాత 'Taken' అని సమాధానం ఇవ్వండి! 💊"
  },

  // Weekly Summary
  "weekly_summary_child_en": {
    name: "weekly_summary_child",
    language: "en",
    category: "utility",
    text: "Hello! This is Anaya. Here is a quick weekly update for {{parentName}}'s health metrics: Medicine Adherence was {{adherence}}% and BP/Sugar readings remained stable. Have a blessed week ahead! ❤️"
  },

  // Consent Request
  "consent_request_en": {
    name: "consent_request",
    language: "en",
    category: "utility",
    text: "Namaste {{parentName}}! 🙏 To help your adult child {{childName}} support your health journey, Anaya from Parents Health OS would like to send you daily routine reminders and check-ins via WhatsApp. Reply 'YES' to give your digital consent. You can opt-out anytime. 🛡️"
  },
  "consent_request_hi": {
    name: "consent_request",
    language: "hi",
    category: "utility",
    text: "नमस्ते {{parentName}}! 🙏 आपके बच्चे {{childName}} को आपकी स्वास्थ्य यात्रा में मदद करने के लिए, पेरेंट्स हेल्थ ओएस से अनाया आपको व्हाट्सएप के माध्यम से दैनिक दिनचर्या अनुस्मारक भेजना चाहेगी। सहमति देने के लिए 'YES' उत्तर दें। 🛡️"
  },
  "consent_request_te": {
    name: "consent_request",
    language: "te",
    category: "utility",
    text: "నమస్తే {{parentName}}! 🙏 మీ పిల్లలు {{childName}} మీ ఆరోగ్య ప్రయాణంలో సహాయం చేయడానికి, పేరెంట్స్ హెల్త్ ఓఎస్ నుండి అనయ మీకు వాట్సాప్ ద్వారా రోజువారీ రిమైండర్లను పంపాలనుకుంటున్నారు. సమ్మతి ఇవ్వడానికి 'YES' అని సమాధానం ఇవ్వండి. 🛡️"
  }
};

export const renderTemplate = (
  templateKey: string,
  placeholders: Record<string, string>
): string => {
  const template = TEMPLATE_REGISTRY[templateKey];
  if (!template) {
    return `[Template not found: ${templateKey}]`;
  }
  let rendered = template.text;
  Object.entries(placeholders).forEach(([key, value]) => {
    rendered = rendered.replace(new RegExp(`{{${key}}}`, "g"), value);
  });
  return rendered;
};
