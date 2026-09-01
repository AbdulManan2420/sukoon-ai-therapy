import type { MoodKey } from '../types'

export const moods: { key: MoodKey; label: string; face: string; color: string }[] = [
  { key: 'calm', label: 'Calm', face: '◡', color: '#6c9b83' },
  { key: 'okay', label: 'Okay', face: '•‿•', color: '#86a970' },
  { key: 'low', label: 'Low', face: '︶', color: '#8799a8' },
  { key: 'anxious', label: 'Anxious', face: '⌁', color: '#c08d5d' },
  { key: 'heavy', label: 'Heavy', face: '◠', color: '#8d7d95' },
]

export const moodScore: Record<MoodKey, number> = {
  heavy: 1, low: 2, anxious: 2.5, okay: 4, calm: 5,
}

const crisisPattern = /suicide|kill myself|end my life|self[- ]?harm|khudkushi|mar jana|jaan de|apne aap ko mar|خودکشی|مر جانا|جان دے|خود کو مار/i

export type ConversationLanguage = 'en-US' | 'ur-PK' | 'ur-roman' | 'hi-IN' | 'pa-IN'

type ResponseKind = 'crisis' | 'anxious' | 'sad' | 'angry' | 'positive' | 'general'

const responses: Record<ConversationLanguage, Record<ResponseKind, string>> = {
  'en-US': {
    crisis: "I'm really glad you told me. Your safety matters most right now. Please move away from anything you could use to hurt yourself, contact someone you trust, and call your local emergency service now. Are you in immediate danger?",
    anxious: "That sounds exhausting—like your mind has been carrying too much at once. Let's slow it down together. What feels most urgent right now: the thoughts, the feeling in your body, or something that happened?",
    sad: "I hear how heavy this feels. You don't need to make it sound smaller here. If it feels okay, tell me what has been weighing on you most lately.",
    angry: "It makes sense that you're feeling stirred up. Anger often protects something tender underneath. What happened just before it became stronger?",
    positive: "I'm glad there is a little more ease today. What do you think helped create that shift? Noticing it can help you find your way back to it later.",
    general: "I'm here with you, and there's no need to rush. Tell me a little more—what part of this feels hardest to hold on your own?",
  },
  'ur-PK': {
    crisis: 'اچھا ہوا آپ نے مجھے بتا دیا۔ اس وقت سب سے ضروری بات آپ کی حفاظت ہے۔ اپنے آپ کو نقصان پہنچانے والی کسی بھی چیز سے دور ہو جائیں، فوراً کسی اپنے کو اپنے پاس بلائیں، اور مقامی ایمرجنسی سروس سے رابطہ کریں۔ کیا آپ ابھی کسی فوری خطرے میں ہیں؟',
    anxious: 'لگ رہا ہے ذہن پر ایک ساتھ بہت کچھ چل رہا ہے، اور یہ واقعی تھکا دیتا ہے۔ ذرا آہستہ آہستہ بات کرتے ہیں۔ اس وقت زیادہ مشکل کیا لگ رہا ہے—خیالات، جسم کی گھبراہٹ، یا کوئی خاص بات جو ہوئی؟',
    sad: 'میں سن رہا ہوں… دل پر واقعی بہت بوجھ لگ رہا ہے۔ یہاں آپ کو اپنی بات کم کر کے بتانے کی ضرورت نہیں۔ آج کل سب سے زیادہ کون سی بات دل کو دبا رہی ہے؟',
    angry: 'آپ کا غصہ سمجھ میں آ رہا ہے۔ کئی بار غصے کے پیچھے کوئی چوٹ یا دکھ چھپا ہوتا ہے۔ غصہ بڑھنے سے ذرا پہلے کیا ہوا تھا؟',
    positive: 'یہ سن کر اچھا لگا کہ آج دل کچھ ہلکا ہے۔ آپ کو کیا لگتا ہے، کس چیز سے یہ سکون آیا؟ اسے پہچان لیں تو شاید آئندہ بھی یہ سکون ڈھونڈنے میں آسانی ہو۔',
    general: 'میں یہیں ہوں، آپ آرام سے بات کریں۔ ذرا اور بتائیں… اس ساری بات میں سب سے زیادہ مشکل کیا لگ رہا ہے؟',
  },
  'ur-roman': {
    crisis: 'Mujhe khushi hai ke aap ne bataya. Abhi aap ki safety sab se zaroori hai. Nuqsan pohanchane wali cheezon se door ho jayein, kisi bharosay ke shakhs se foran rabta karein aur local emergency service ko call karein. Kya aap is waqt foran khatray mein hain?',
    anxious: 'Yeh bohat thaka dene wala lag raha hai, jaise zehan aik saath bohat kuch utha raha ho. Aao araam se chalte hain. Is waqt sab se mushkil kya hai: khayalat, jism ki feeling, ya koi waqia?',
    sad: 'Main sun raha hoon ke yeh kitna heavy feel ho raha hai. Yahan tumhein apne ehsaas chhote karne ki zaroorat nahi. Aaj kal sab se zyada kis baat ka bojh hai?',
    angry: 'Tumhara gussa samajh aata hai. Aksar gussay ke neeche koi nazuk feeling hoti hai. Is ke barhne se bilkul pehle kya hua tha?',
    positive: 'Yeh sun kar acha laga ke aaj kuch sukoon hai. Tumhare khayal mein kis cheez ne yeh behtari banayi? Isay notice karna dobara sukoon paane mein madad de sakta hai.',
    general: 'Main tumhare saath hoon, jaldi ki koi zaroorat nahi. Thora aur batao—iss mein kaunsi baat akele sambhalna sab se mushkil lag rahi hai?',
  },
  'hi-IN': {
    crisis: 'मुझे खुशी है कि आपने बताया। अभी आपकी सुरक्षा सबसे ज़रूरी है। नुकसान पहुँचाने वाली चीज़ों से दूर हो जाएँ, किसी भरोसेमंद व्यक्ति से तुरंत संपर्क करें और स्थानीय आपातकालीन सेवा को कॉल करें। क्या आप अभी तुरंत खतरे में हैं?',
    anxious: 'यह बहुत थका देने वाला लग रहा है, जैसे मन एक साथ बहुत कुछ उठा रहा हो। आइए धीरे चलते हैं। अभी सबसे मुश्किल क्या है: विचार, शरीर की बेचैनी, या कोई घटना?',
    sad: 'मैं सुन रहा हूँ कि यह कितना भारी लग रहा है। यहाँ आपको अपनी भावना छोटी करके बताने की ज़रूरत नहीं। आजकल सबसे ज़्यादा किस बात का बोझ है?',
    angry: 'आपका गुस्सा समझ में आता है। अक्सर गुस्से के नीचे कोई नाज़ुक भावना होती है। इसके बढ़ने से ठीक पहले क्या हुआ था?',
    positive: 'यह सुनकर अच्छा लगा कि आज कुछ सुकून है। आपके हिसाब से किस चीज़ ने यह बदलाव बनाया? इसे पहचानना दोबारा सुकून पाने में मदद कर सकता है।',
    general: 'मैं आपके साथ हूँ, जल्दी की कोई ज़रूरत नहीं। थोड़ा और बताइए—इसमें कौन सी बात अकेले संभालना सबसे मुश्किल लग रही है?',
  },
  'pa-IN': {
    crisis: 'ਮੈਨੂੰ ਖੁਸ਼ੀ ਹੈ ਕਿ ਤੁਸੀਂ ਦੱਸਿਆ। ਇਸ ਵੇਲੇ ਤੁਹਾਡੀ ਸੁਰੱਖਿਆ ਸਭ ਤੋਂ ਜ਼ਰੂਰੀ ਹੈ। ਨੁਕਸਾਨ ਪਹੁੰਚਾਉਣ ਵਾਲੀਆਂ ਚੀਜ਼ਾਂ ਤੋਂ ਦੂਰ ਹੋਵੋ, ਕਿਸੇ ਭਰੋਸੇਯੋਗ ਵਿਅਕਤੀ ਨਾਲ ਤੁਰੰਤ ਸੰਪਰਕ ਕਰੋ ਅਤੇ ਸਥਾਨਕ ਐਮਰਜੈਂਸੀ ਸੇਵਾ ਨੂੰ ਕਾਲ ਕਰੋ। ਕੀ ਤੁਸੀਂ ਹੁਣ ਤੁਰੰਤ ਖਤਰੇ ਵਿੱਚ ਹੋ?',
    anxious: 'ਇਹ ਬਹੁਤ ਥਕਾਉਣ ਵਾਲਾ ਲੱਗਦਾ ਹੈ, ਜਿਵੇਂ ਮਨ ਇੱਕੋ ਵਾਰ ਬਹੁਤ ਕੁਝ ਚੁੱਕ ਰਿਹਾ ਹੋਵੇ। ਆਓ ਹੌਲੀ ਚੱਲੀਏ। ਹੁਣ ਸਭ ਤੋਂ ਔਖਾ ਕੀ ਹੈ: ਵਿਚਾਰ, ਸਰੀਰ ਦੀ ਬੇਚੈਨੀ, ਜਾਂ ਕੋਈ ਘਟਨਾ?',
    sad: 'ਮੈਂ ਸੁਣ ਰਿਹਾ ਹਾਂ ਕਿ ਇਹ ਕਿੰਨਾ ਭਾਰੀ ਮਹਿਸੂਸ ਹੋ ਰਿਹਾ ਹੈ। ਇੱਥੇ ਤੁਹਾਨੂੰ ਆਪਣੀਆਂ ਭਾਵਨਾਵਾਂ ਛੋਟੀਆਂ ਕਰਕੇ ਦੱਸਣ ਦੀ ਲੋੜ ਨਹੀਂ। ਅੱਜਕੱਲ੍ਹ ਸਭ ਤੋਂ ਵੱਧ ਕਿਸ ਗੱਲ ਦਾ ਬੋਝ ਹੈ?',
    angry: 'ਤੁਹਾਡਾ ਗੁੱਸਾ ਸਮਝ ਆਉਂਦਾ ਹੈ। ਅਕਸਰ ਗੁੱਸੇ ਹੇਠਾਂ ਕੋਈ ਨਾਜ਼ੁਕ ਭਾਵਨਾ ਹੁੰਦੀ ਹੈ। ਇਸ ਦੇ ਵਧਣ ਤੋਂ ਠੀਕ ਪਹਿਲਾਂ ਕੀ ਹੋਇਆ ਸੀ?',
    positive: 'ਇਹ ਸੁਣ ਕੇ ਚੰਗਾ ਲੱਗਿਆ ਕਿ ਅੱਜ ਕੁਝ ਸਕੂਨ ਹੈ। ਤੁਹਾਡੇ ਖਿਆਲ ਵਿੱਚ ਕਿਸ ਚੀਜ਼ ਨੇ ਇਹ ਬਦਲਾਅ ਲਿਆਇਆ? ਇਸ ਨੂੰ ਪਛਾਣਨਾ ਮੁੜ ਸਕੂਨ ਲੱਭਣ ਵਿੱਚ ਮਦਦ ਕਰ ਸਕਦਾ ਹੈ।',
    general: 'ਮੈਂ ਤੁਹਾਡੇ ਨਾਲ ਹਾਂ, ਜਲਦੀ ਦੀ ਕੋਈ ਲੋੜ ਨਹੀਂ। ਥੋੜ੍ਹਾ ਹੋਰ ਦੱਸੋ—ਇਸ ਵਿੱਚ ਕਿਹੜੀ ਗੱਲ ਇਕੱਲੇ ਸੰਭਾਲਣੀ ਸਭ ਤੋਂ ਔਖੀ ਲੱਗ ਰਹੀ ਹੈ?',
  },
}

export function createSupportResponse(message: string, language: ConversationLanguage = 'en-US'): { text: string; crisis: boolean } {
  const languageResponses = responses[language]
  if (crisisPattern.test(message)) {
    return { crisis: true, text: languageResponses.crisis }
  }

  const lower = message.toLowerCase()
  if (/anxious|anxiety|ghabra|panic|tension|stress|گھبرا|پریشان|بے ?چین|تناؤ/.test(lower)) {
    return { crisis: false, text: languageResponses.anxious }
  }
  if (/sad|low|heavy|udaas|dukhi|rona|cry|اداس|دکھی|رونا|بھاری|بوجھ/.test(lower)) {
    return { crisis: false, text: languageResponses.sad }
  }
  if (/angry|gussa|frustrated|annoyed|غصہ|ناراض/.test(lower)) {
    return { crisis: false, text: languageResponses.angry }
  }
  if (/better|good|happy|khush|calm|theek|بہتر|اچھا|خوش|سکون|ٹھیک/.test(lower)) {
    return { crisis: false, text: languageResponses.positive }
  }
  return { crisis: false, text: languageResponses.general }
}

export function buildSessionSummary(messages: { role: string; text: string }[]) {
  const userMessages = messages.filter((item) => item.role === 'user').map((item) => item.text)
  const joined = userMessages.join(' ')
  const themes: string[] = []
  if (/work|job|office|boss|kaam/i.test(joined)) themes.push('work pressure')
  if (/family|mother|father|parents|ghar|ami|abu/i.test(joined)) themes.push('family')
  if (/study|exam|school|university|parhai/i.test(joined)) themes.push('studies')
  if (/sleep|neend|tired/i.test(joined)) themes.push('sleep and energy')
  if (/friend|relationship|partner|love|dost/i.test(joined)) themes.push('relationships')
  return themes.length
    ? `You explored ${themes.join(', ')} and made space for what has been difficult. Keep noticing what gives you even a small sense of relief.`
    : 'You took time to name what you were carrying and reflect without judgment. That pause itself is meaningful progress.'
}
