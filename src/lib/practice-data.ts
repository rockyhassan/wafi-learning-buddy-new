export type PracticeModeId =
  | "todays-set"
  | "quiz"
  | "mcq"
  | "true-false"
  | "fill-blank"
  | "matching"
  | "speaking"
  | "listening";

export type BaseQuestion = {
  id: string;
  type: "mcq" | "true-false" | "fill-blank" | "matching" | "speaking" | "listening";
  questionEn: string;
  questionBn: string;
  explanationEn?: string;
  explanationBn?: string;
  hintEn?: string;
  hintBn?: string;
};

export type McqQuestion = BaseQuestion & {
  type: "mcq";
  optionsEn: string[];
  optionsBn: string[];
  correctIndex: number;
};

export type TrueFalseQuestion = BaseQuestion & {
  type: "true-false";
  isTrue: boolean;
};

export type FillBlankQuestion = BaseQuestion & {
  type: "fill-blank";
  sentenceEn: string; // e.g. "Water turns into ___ when heated."
  sentenceBn: string; // e.g. "উত্তপ্ত হলে পানি ___ পরিণত হয়।"
  correctWordEn: string;
  correctWordBn: string;
  optionsEn: string[]; // 4 options
  optionsBn: string[];
};

export type MatchingPair = {
  left: { en: string; bn: string };
  right: { en: string; bn: string };
};

export type MatchingQuestion = BaseQuestion & {
  type: "matching";
  pairs: MatchingPair[];
};

export type SpeakingQuestion = BaseQuestion & {
  type: "speaking";
  targetPhraseEn: string;
  targetPhraseBn: string;
  ipa?: string;
  phonemes?: string[];
  tipsEn?: string;
  tipsBn?: string;
};

export type ListeningQuestion = BaseQuestion & {
  type: "listening";
  audioText: string; // What speech synthesis will say aloud
  audioSpeed?: number;
  optionsEn: string[];
  optionsBn: string[];
  correctIndex: number;
};

export type PracticeQuestion =
  | McqQuestion
  | TrueFalseQuestion
  | FillBlankQuestion
  | MatchingQuestion
  | SpeakingQuestion
  | ListeningQuestion;

export type PracticeModeMeta = {
  id: PracticeModeId;
  emoji: string;
  labelEn: string;
  labelBn: string;
  descEn: string;
  descBn: string;
  subEn: string;
  subBn: string;
  badgeEn?: string;
  badgeBn?: string;
  accentColor: string;
};

export const PRACTICE_MODES: PracticeModeMeta[] = [
  {
    id: "quiz",
    emoji: "🎯",
    labelEn: "Quiz",
    labelBn: "কুইজ",
    descEn: "Rapid-fire mixed challenges with timer and streak bonuses",
    descBn: "টাইমার এবং স্ট্রিক বোনাসসহ দ্রুতগতির মিশ্র কুইজ চ্যালেঞ্জ",
    subEn: "10 Q",
    subBn: "১০টি প্রশ্ন",
    badgeEn: "Speed Sprint",
    badgeBn: "দ্রুত কুইজ",
    accentColor: "from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400",
  },
  {
    id: "mcq",
    emoji: "🔘",
    labelEn: "MCQ",
    labelBn: "এমসিকিউ",
    descEn: "Multiple choice questions with 4 options & instant explanations",
    descBn: "৪টি বিকল্প ও তাৎক্ষণিক ব্যাখ্যাসহ বহু নির্বাচনী প্রশ্ন",
    subEn: "20 Q",
    subBn: "২০টি প্রশ্ন",
    badgeEn: "Concept Test",
    badgeBn: "ধারণা পরীক্ষা",
    accentColor: "from-blue-500/20 to-indigo-500/20 text-blue-600 dark:text-blue-400",
  },
  {
    id: "true-false",
    emoji: "✔️",
    labelEn: "True / False",
    labelBn: "সত্য / মিথ্যা",
    descEn: "Fast-paced binary statements to test facts & quick thinking",
    descBn: "তথ্য ও দ্রুত চিন্তা যাচাই করার সহজ সত্য/মিথ্যা যাচাই",
    subEn: "15 Q",
    subBn: "১৫টি প্রশ্ন",
    badgeEn: "Quick Fact",
    badgeBn: "দ্রুত তথ্য",
    accentColor: "from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "fill-blank",
    emoji: "✏️",
    labelEn: "Fill Blank",
    labelBn: "শূন্যস্থান",
    descEn: "Complete key sentences using smart word bank chips",
    descBn: "শব্দ ব্যাংক থেকে সঠিক শব্দ বেছে নিয়ে বাক্য পূরণ করো",
    subEn: "12 Q",
    subBn: "১২টি প্রশ্ন",
    badgeEn: "Sentence Master",
    badgeBn: "বাক্য পূরণ",
    accentColor: "from-purple-500/20 to-pink-500/20 text-purple-600 dark:text-purple-400",
  },
  {
    id: "matching",
    emoji: "🔗",
    labelEn: "Matching",
    labelBn: "মিলকরণ",
    descEn: "Pair up words with meanings, terms, or science concepts",
    descBn: "শব্দের সাথে অর্থ বা বৈজ্ঞানিক ধারণার সঠিক জোড়া মেলাও",
    subEn: "8 Q",
    subBn: "৮টি সেট",
    badgeEn: "Connect Pairs",
    badgeBn: "জোড়া মেলাও",
    accentColor: "from-cyan-500/20 to-blue-500/20 text-cyan-600 dark:text-cyan-400",
  },
  {
    id: "speaking",
    emoji: "🗣️",
    labelEn: "Speaking",
    labelBn: "বলা",
    descEn: "Listen, repeat sentences aloud & get real-time AI pronunciation score",
    descBn: "উচ্চারণ শোনো, মুখে বলো এবং রিয়েল-টাইম এআই স্কোর পাও",
    subEn: "5 Q",
    subBn: "৫টি অনুশীলন",
    badgeEn: "Voice AI",
    badgeBn: "ভয়েস এআই",
    accentColor: "from-rose-500/20 to-red-500/20 text-rose-600 dark:text-rose-400",
  },
  {
    id: "listening",
    emoji: "🎧",
    labelEn: "Listening",
    labelBn: "শোনা",
    descEn: "Listen carefully to audio cues and select the accurate answer",
    descBn: "মন দিয়ে অডিও শুনে সঠিক উত্তরটি নির্বাচন করো",
    subEn: "6 Q",
    subBn: "৬টি প্রশ্ন",
    badgeEn: "Audio Quiz",
    badgeBn: "অডিও কুইজ",
    accentColor: "from-violet-500/20 to-fuchsia-500/20 text-violet-600 dark:text-violet-400",
  },
];

// Today's Set: 10 curated questions from Science Chapter 3 & core subjects
export const TODAYS_SET_QUESTIONS: PracticeQuestion[] = [
  {
    id: "today-1",
    type: "mcq",
    questionEn: "What happens to liquid water when it is heated to 100°C?",
    questionBn: "পানিকে ১০০ ডিগ্রি সেলসিয়াস তাপমাত্রায় গরম করলে কী ঘটে?",
    optionsEn: ["It turns into water vapour", "It turns into ice", "It becomes solid", "It loses weight"],
    optionsBn: ["এটি জলীয় বাষ্পে পরিণত হয়", "এটি বরফে পরিণত হয়", "এটি কঠিন হয়ে যায়", "এর ওজন কমে যায়"],
    correctIndex: 0,
    explanationEn: "Heating water to boiling point (100°C) causes evaporation into gas/vapour.",
    explanationBn: "পানিকে স্ফুটনাঙ্কে (১০০°সে) উত্তপ্ত করলে তা বাষ্পে পরিণত হয়।",
  },
  {
    id: "today-2",
    type: "true-false",
    questionEn: "Plants make their own food through photosynthesis using sunlight.",
    questionBn: "উদ্ভিদ সূর্যালোক ব্যবহার করে সালোকসংশ্লেষণ প্রক্রিয়ায় নিজের খাদ্য নিজে তৈরি করে।",
    isTrue: true,
    explanationEn: "Green plants use chlorophyll, water, and sunlight to produce glucose and oxygen.",
    explanationBn: "সবুজ উদ্ভিদ ক্লোরোফিল, পানি ও সূর্যের আলো দিয়ে খাদ্য তৈরি করে।",
  },
  {
    id: "today-3",
    type: "fill-blank",
    questionEn: "Complete the sentence about the water cycle:",
    questionBn: "পানিচক্র সম্পর্কিত বাক্যটি পূরণ করো:",
    sentenceEn: "Water droplets in the sky join together to form ___.",
    sentenceBn: "আকাশে পানির কণাগুলো একত্রিত হয়ে ___ তৈরি করে।",
    correctWordEn: "clouds",
    correctWordBn: "মেঘ",
    optionsEn: ["clouds", "rivers", "stones", "smoke"],
    optionsBn: ["মেঘ", "নদী", "পাথর", "ধোঁয়া"],
    explanationEn: "Condensation turns water vapour into tiny droplets that cluster as clouds.",
    explanationBn: "ঘনীভবনের ফলে বাষ্প ছোট ছোট কণায় পরিণত হয়ে মেঘ তৈরি করে।",
  },
  {
    id: "today-4",
    type: "mcq",
    questionEn: "Which organ pumps blood throughout the human body?",
    questionBn: "মানবদেহে কোন অঙ্গটি সারা শরীরে রক্ত পাম্প করে?",
    optionsEn: ["Heart", "Lungs", "Stomach", "Kidney"],
    optionsBn: ["হৃদপিণ্ড (Heart)", "ফুসফুস (Lungs)", "পাকস্থলী (Stomach)", "বৃক্ক (Kidney)"],
    correctIndex: 0,
    explanationEn: "The heart pumps oxygen-rich blood through veins and arteries.",
    explanationBn: "হৃদপিণ্ড শিরা ও ধমনীর মাধ্যমে রক্ত সারা শরীরে প্রবাহিত করে।",
  },
  {
    id: "today-5",
    type: "true-false",
    questionEn: "Air has mass and occupies space.",
    questionBn: "বায়ুর নির্দিষ্ট ভর আছে এবং এটি স্থান দখল করে।",
    isTrue: true,
    explanationEn: "Air is matter, so it has mass, exerts pressure, and occupies volume.",
    explanationBn: "বায়ু একটি পদার্থ, তাই এর ভর আছে এবং স্থান দখল করে।",
  },
  {
    id: "today-6",
    type: "fill-blank",
    questionEn: "Fill in the blank with the correct English helping verb:",
    questionBn: "সঠিক সাহায্যকারী ক্রিয়া দিয়ে শূন্যস্থান পূরণ করো:",
    sentenceEn: "She ___ reading an interesting science book now.",
    sentenceBn: "সে এখন একটি মজার বিজ্ঞানের বই পড়ছে (She ___ reading...)।",
    correctWordEn: "is",
    correctWordBn: "is",
    optionsEn: ["is", "are", "were", "am"],
    optionsBn: ["is", "are", "were", "am"],
    explanationEn: "Singular subject 'She' in present continuous takes 'is'.",
    explanationBn: "একবচন কর্তার (She) সাথে Present Continuous-এ 'is' বসে।",
  },
  {
    id: "today-7",
    type: "mcq",
    questionEn: "What is the result of 15 × 6?",
    questionBn: "১৫ × ৬ এর গুণফল কত?",
    optionsEn: ["90", "80", "95", "100"],
    optionsBn: ["৯০", "৮০", "৯৫", "১০০"],
    correctIndex: 0,
    explanationEn: "15 multiplied by 6 equals 90.",
    explanationBn: "১৫ গুণ ৬ = ৯০।",
  },
  {
    id: "today-8",
    type: "listening",
    questionEn: "Listen carefully to the word and choose its Bengali meaning:",
    questionBn: "শব্দটি মনোযোগ দিয়ে শোনো এবং এর সঠিক বাংলা অর্থটি নির্বাচন করো:",
    audioText: "Precipitation",
    optionsEn: ["Rainfall / Precipitation", "Evaporation", "Freezing", "Wind"],
    optionsBn: ["বৃষ্টিপাত (Precipitation)", "বাষ্পীভবন", "হিমাঙ্ক", "বাতাস"],
    correctIndex: 0,
    explanationEn: "Precipitation means water falling from clouds as rain, snow, or hail.",
    explanationBn: "Precipitation মানে বৃষ্টিপাত বা মেঘ থেকে বৃষ্টিরূপে পানি পড়া।",
  },
  {
    id: "today-9",
    type: "speaking",
    questionEn: "Say this sentence clearly into the microphone:",
    questionBn: "বাক্যটি স্পষ্টভাবে মুখে বলো:",
    targetPhraseEn: "Plants absorb water through roots.",
    targetPhraseBn: "উদ্ভিদ মূল বা শিকড়ের সাহায্যে পানি শোষণ করে।",
    ipa: "/plɑːnts əbˈzɔːb ˈwɔːtər θruː ruːts/",
    phonemes: ["plants", "absorb", "water", "roots"],
    tipsEn: "Focus on the 'b' in absorb and the long 'oo' in roots.",
    tipsBn: "'absorb' এবং 'roots' শব্দ দুটি স্পষ্ট করে উচ্চারণ করো।",
  },
  {
    id: "today-10",
    type: "mcq",
    questionEn: "Which of the following is a non-renewable source of energy?",
    questionBn: "নিচের কোনটি অনবায়নযোগ্য শক্তির উৎস?",
    optionsEn: ["Coal and Petroleum", "Solar power", "Wind energy", "Hydroelectric power"],
    optionsBn: ["কয়লা ও পেট্রোলিয়াম", "সৌরশক্তি", "বায়ু শক্তি", "জলবিদ্যুৎ"],
    correctIndex: 0,
    explanationEn: "Fossil fuels like coal and petroleum cannot be renewed quickly once depleted.",
    explanationBn: "কয়লা ও পেট্রোলিয়াম জীবাশ্ম জ্বালানি, যা একবার শেষ হলে সহজে তৈরি হয় না।",
  },
];

// MCQ Mode Questions (20 questions)
export const MCQ_QUESTIONS: McqQuestion[] = [
  {
    id: "mcq-1",
    type: "mcq",
    questionEn: "What is the primary gas produced by plants during photosynthesis?",
    questionBn: "সালোকসংশ্লেষণের সময় উদ্ভিদ প্রধানত কোন গ্যাস তৈরি করে?",
    optionsEn: ["Oxygen (O₂)", "Carbon Dioxide (CO₂)", "Nitrogen (N₂)", "Hydrogen (H₂)"],
    optionsBn: ["অক্সিজেন (O₂)", "কার্বন ডাই অক্সাইড (CO₂)", "নাইট্রোজেন (N₂)", "হাইড্রোজেন (H₂)"],
    correctIndex: 0,
    explanationEn: "Plants take in carbon dioxide and release oxygen during daylight photosynthesis.",
    explanationBn: "উদ্ভিদ দিনের বেলায় কার্বন ডাই অক্সাইড গ্রহণ করে এবং অক্সিজেন ত্যাগ করে।",
  },
  {
    id: "mcq-2",
    type: "mcq",
    questionEn: "How many bones are there in an adult human skeleton?",
    questionBn: "একজন প্রাপ্তবয়স্ক মানুষের কঙ্কালে মোট কতটি হাড় থাকে?",
    optionsEn: ["206", "300", "180", "250"],
    optionsBn: ["২০৬টি", "৩০০টি", "১৮০টি", "২৫০টি"],
    correctIndex: 0,
    explanationEn: "Adult humans have 206 distinct bones after infant bone fusion.",
    explanationBn: "প্রাপ্তবয়স্ক মানবদেহে ২০৬টি হাড় থাকে।",
  },
  {
    id: "mcq-3",
    type: "mcq",
    questionEn: "Which planet in our solar system is known as the Red Planet?",
    questionBn: "সৌরজগতের কোন গ্রহকে 'লাল গ্রহ' বলা হয়?",
    optionsEn: ["Mars", "Venus", "Jupiter", "Mercury"],
    optionsBn: ["মঙ্গল (Mars)", "শুক্র (Venus)", "বৃহস্পতি (Jupiter)", "বুধ (Mercury)"],
    correctIndex: 0,
    explanationEn: "Mars appears reddish due to abundant iron oxide (rust) on its surface.",
    explanationBn: "মঙ্গল গ্রহের পৃষ্ঠে প্রচুর আয়রন অক্সাইড থাকায় এটি লাল দেখায়।",
  },
  {
    id: "mcq-4",
    type: "mcq",
    questionEn: "What is the chemical formula of pure water?",
    questionBn: "বিশুদ্ধ পানির রাসায়নিক সংকেত কোনটি?",
    optionsEn: ["H₂O", "CO₂", "NaCl", "O₂"],
    optionsBn: ["H₂O", "CO₂", "NaCl", "O₂"],
    correctIndex: 0,
    explanationEn: "Water is composed of two hydrogen atoms bonded to one oxygen atom.",
    explanationBn: "পানির অণু দুটি হাইড্রোজেন এবং একটি অক্সিজেন পরমাণু দিয়ে গঠিত।",
  },
  {
    id: "mcq-5",
    type: "mcq",
    questionEn: "Which part of speech describes a noun (e.g., 'blue sky', 'tall tree')?",
    questionBn: "কোন Part of Speech বিশেষ্যের দোষ, গুণ বা অবস্থা প্রকাশ করে?",
    optionsEn: ["Adjective", "Adverb", "Preposition", "Conjunction"],
    optionsBn: ["Adjective (বিশেষণ)", "Adverb (ক্রিয়া বিশেষণ)", "Preposition", "Conjunction"],
    correctIndex: 0,
    explanationEn: "Adjectives modify and describe nouns or pronouns.",
    explanationBn: "Adjective বিশেষ্যের দোষ, গুণ, সংখ্যা বা অবস্থা বর্ণনা করে।",
  },
  {
    id: "mcq-6",
    type: "mcq",
    questionEn: "What is 12 × 12?",
    questionBn: "১২ × ১২ এর মান কত?",
    optionsEn: ["144", "124", "132", "154"],
    optionsBn: ["১৪৪", "১২৪", "১৩২", "১৫৪"],
    correctIndex: 0,
    explanationEn: "12 squared is 144.",
    explanationBn: "১২ × ১২ = ১৪৪।",
  },
  {
    id: "mcq-7",
    type: "mcq",
    questionEn: "What is the freezing point of water in Celsius?",
    questionBn: "সেলসিয়াস স্কেলে পানির হিমাঙ্ক কত?",
    optionsEn: ["0°C", "100°C", "-10°C", "32°C"],
    optionsBn: ["০° সেলসিয়াস", "১০০° সেলসিয়াস", "-১০° সেলসিয়াস", "৩২° সেলসিয়াস"],
    correctIndex: 0,
    explanationEn: "Water freezes into ice at 0°C under normal atmospheric pressure.",
    explanationBn: "স্বাভাবিক চাপে ০° সেলসিয়াস তাপমাত্রায় পানি বরফে পরিণত হয়।",
  },
  {
    id: "mcq-8",
    type: "mcq",
    questionEn: "Which organ in the human body filters waste from the blood?",
    questionBn: "মানবদেহের কোন অঙ্গ রক্ত থেকে বর্জ্য পদার্থ ছেঁকে বের করে?",
    optionsEn: ["Kidneys", "Heart", "Stomach", "Brain"],
    optionsBn: ["বৃক্ক / কিডনি (Kidneys)", "হৃদপিণ্ড (Heart)", "পাকস্থলী", "মস্তিষ্ক"],
    correctIndex: 0,
    explanationEn: "The kidneys filter blood to remove waste products and excess fluid as urine.",
    explanationBn: "কিডনি রক্ত পরিশোধিত করে প্রস্রাবের মাধ্যমে বর্জ্য বের করে দেয়।",
  },
  {
    id: "mcq-9",
    type: "mcq",
    questionEn: "Choose the correct past tense of the verb 'run':",
    questionBn: "'run' ক্রিয়াপদের সঠিক Past Tense কোনটি?",
    optionsEn: ["ran", "runned", "running", "runs"],
    optionsBn: ["ran", "runned", "running", "runs"],
    correctIndex: 0,
    explanationEn: "'Run' is an irregular verb with past tense form 'ran'.",
    explanationBn: "'Run' এর Past form হলো 'ran'।",
  },
  {
    id: "mcq-10",
    type: "mcq",
    questionEn: "Which geometric shape has 3 sides and 3 angles?",
    questionBn: "কোন জ্যামিতিক চিত্রের ৩টি বাহু ও ৩টি কোণ থাকে?",
    optionsEn: ["Triangle", "Square", "Pentagon", "Circle"],
    optionsBn: ["ত্রিভুজ (Triangle)", "বর্গক্ষেত্র (Square)", "পঞ্চভুজ (Pentagon)", "বৃত্ত (Circle)"],
    correctIndex: 0,
    explanationEn: "A polygon with three straight sides and three interior angles is a triangle.",
    explanationBn: "তিনটি বাহু দ্বারা সীমাবদ্ধ ক্ষেত্রকে ত্রিভুজ বলে।",
  },
];

// True/False Questions (15 questions)
export const TRUE_FALSE_QUESTIONS: TrueFalseQuestion[] = [
  {
    id: "tf-1",
    type: "true-false",
    questionEn: "Sound travels faster in solids than in air.",
    questionBn: "বায়ুর তুলনায় কঠিন মাধ্যমে শব্দ দ্রুত চলে।",
    isTrue: true,
    explanationEn: "Molecules in solids are packed tightly, transferring vibrations much faster than in gases.",
    explanationBn: "কঠিন মাধ্যমে অণুগুলো খুব কাছাকাছি থাকে, তাই শব্দ দ্রুত প্রবাহিত হয়।",
  },
  {
    id: "tf-2",
    type: "true-false",
    questionEn: "The sun revolves around the Earth.",
    questionBn: "সূর্য পৃথিবীর চারদিকে ঘোরে।",
    isTrue: false,
    explanationEn: "The Earth and other planets revolve around the Sun.",
    explanationBn: "পৃথিবী এবং অন্যান্য গ্রহ সূর্যের চারদিকে ঘোরে।",
  },
  {
    id: "tf-3",
    type: "true-false",
    questionEn: "Mammals give birth to live young and nurse them with milk.",
    questionBn: "স্তন্যপায়ী প্রাণীরা বাচ্চা প্রসব করে এবং মাতৃদুগ্ধ পান করায়।",
    isTrue: true,
    explanationEn: "Giving birth to live young and producing milk are defining characteristics of mammals.",
    explanationBn: "বাচ্চা প্রসব করা এবং দুধ পান করানো স্তন্যপায়ী প্রাণীর প্রধান বৈশিষ্ট্য।",
  },
  {
    id: "tf-4",
    type: "true-false",
    questionEn: "A right angle measures 180 degrees.",
    questionBn: "এক সমকোণের পরিমাপ ১৮০ ডিগ্রি।",
    isTrue: false,
    explanationEn: "A right angle measures 90 degrees; 180 degrees is a straight angle.",
    explanationBn: "এক সমকোণ = ৯০ ডিগ্রি। ১৮০ ডিগ্রি হলো সরলকোণ।",
  },
  {
    id: "tf-5",
    type: "true-false",
    questionEn: "The capital of Bangladesh is Dhaka.",
    questionBn: "বাংলাদেশের রাজধানী ঢাকা।",
    isTrue: true,
    explanationEn: "Dhaka is the capital and largest city of Bangladesh.",
    explanationBn: "ঢাকা বাংলাদেশের রাজধানী ও বৃহত্তম শহর।",
  },
  {
    id: "tf-6",
    type: "true-false",
    questionEn: "Spiders are insects with six legs.",
    questionBn: "মাকড়সা একটি ৬ পা বিশিষ্ট পতঙ্গ বা কীট।",
    isTrue: false,
    explanationEn: "Spiders are arachnids and have eight legs, whereas insects have six legs.",
    explanationBn: "মাকড়সার ৮টি পা থাকে এবং এটি অ্যারাকনিড (Arachnid) শ্রেণির প্রাণী।",
  },
  {
    id: "tf-7",
    type: "true-false",
    questionEn: "Water expands when it freezes into ice.",
    questionBn: "পানি যখন জমে বরফ হয় তখন এর আয়তন বৃদ্ধি পায়।",
    isTrue: true,
    explanationEn: "Unlike most substances, water forms a crystalline structure when freezing, causing expansion.",
    explanationBn: "পানি বরফ হলে অণুগুলোর ফাঁকা স্থান বৃদ্ধি পেয়ে আয়তন বেড়ে যায়।",
  },
  {
    id: "tf-8",
    type: "true-false",
    questionEn: "Every triangle has sum of internal angles equal to 180°.",
    questionBn: "যেকোনো ত্রিভুজের তিন কোণের সমষ্টি ১৮০°।",
    isTrue: true,
    explanationEn: "The sum of interior angles in any planar triangle is always 180 degrees.",
    explanationBn: "সমতলীয় যেকোনো ত্রিভুজের তিন কোণের সমষ্টি সর্বদা ১৮০°।",
  },
];

// Fill in the Blank Questions (12 questions)
export const FILL_BLANK_QUESTIONS: FillBlankQuestion[] = [
  {
    id: "fb-1",
    type: "fill-blank",
    questionEn: "Choose the correct word to complete the scientific statement:",
    questionBn: "বিজ্ঞান সম্পর্কিত বাক্যটি পূরণ করতে সঠিক শব্দটি বাছাই করো:",
    sentenceEn: "The process of green plants making food using sunlight is called ___.",
    sentenceBn: "সূর্যালোকের সাহায্যে সবুজ উদ্ভিদের খাদ্য তৈরির প্রক্রিয়াকে ___ বলে।",
    correctWordEn: "photosynthesis",
    correctWordBn: "সালোকসংশ্লেষণ",
    optionsEn: ["photosynthesis", "respiration", "digestion", "evaporation"],
    optionsBn: ["সালোকসংশ্লেষণ", "শ্বসন", "পরিপাক", "বাষ্পীভবন"],
    explanationEn: "Photosynthesis is the synthesis of chemical compounds with the aid of light.",
    explanationBn: "আলোর উপস্থিতিতে খাদ্য তৈরির প্রক্রিয়াকে সালোকসংশ্লেষণ বলে।",
  },
  {
    id: "fb-2",
    type: "fill-blank",
    questionEn: "Complete the English sentence with the appropriate preposition:",
    questionBn: "সঠিক Preposition দিয়ে ইংরেজি বাক্যটি পূরণ করো:",
    sentenceEn: "The book is ___ the wooden table.",
    sentenceBn: "বইটি কাঠের টেবিলের ___ আছে (The book is ___ the wooden table)।",
    correctWordEn: "on",
    correctWordBn: "on",
    optionsEn: ["on", "under", "in", "between"],
    optionsBn: ["on (উপরে)", "under (নিচে)", "in (ভিতরে)", "between (মাঝখানে)"],
    explanationEn: "'On' indicates placement atop a surface.",
    explanationBn: "কোনো কিছুর উপরিভাগে স্পর্শ করে থাকলে 'on' বসে।",
  },
  {
    id: "fb-3",
    type: "fill-blank",
    questionEn: "Fill in the blank with the fundamental unit of life:",
    questionBn: "জীবদেহের গঠন ও কাজের মৌলিক একক দিয়ে শূন্যস্থান পূরণ করো:",
    sentenceEn: "The basic structural and functional unit of all living organisms is the ___.",
    sentenceBn: "সকল জীবের গঠন ও কাজের মৌলিক একক হলো ___।",
    correctWordEn: "cell",
    correctWordBn: "কোষ",
    optionsEn: ["cell", "tissue", "organ", "atom"],
    optionsBn: ["কোষ (Cell)", "কলা (Tissue)", "অঙ্গ (Organ)", "পরমাণু (Atom)"],
    explanationEn: "Cells are the smallest units capable of performing all life processes.",
    explanationBn: "কোষ হলো জীবদেহের গঠন ও কাজের প্রধান মৌলিক একক।",
  },
  {
    id: "fb-4",
    type: "fill-blank",
    questionEn: "Complete the math statement:",
    questionBn: "গাণিতিক বাক্যটি সম্পূর্ণ করো:",
    sentenceEn: "A century has ___ years.",
    sentenceBn: "এক শতাব্দীতে ___ বছর হয়।",
    correctWordEn: "100",
    correctWordBn: "১০০",
    optionsEn: ["100", "10", "50", "1000"],
    optionsBn: ["১০০", "১০", "৫০", "১০০০"],
    explanationEn: "A century is a period of 100 years.",
    explanationBn: "১০০ বছরের সময়কালকে এক শতাব্দী বলা হয়।",
  },
  {
    id: "fb-5",
    type: "fill-blank",
    questionEn: "Complete the astronomy fact:",
    questionBn: "মহাকাশ সম্পর্কিত তথ্যটি সম্পূর্ণ করো:",
    sentenceEn: "The Earth completes one full orbit around the sun in ___ days.",
    sentenceBn: "পৃথিবী সূর্যের চারদিকে একবার ঘুরে আসতে ___ দিন সময় নেয়।",
    correctWordEn: "365",
    correctWordBn: "৩৬৫",
    optionsEn: ["365", "300", "24", "180"],
    optionsBn: ["৩৬৫", "৩০০", "২৪", "১৮০"],
    explanationEn: "Earth takes approximately 365.25 days to complete one revolution around the Sun.",
    explanationBn: "পৃথিবীর সূর্যকে একবার প্রদক্ষিণ করতে প্রায় ৩৬৫ দিন সময় লাগে।",
  },
];

// Matching Questions (8 question sets)
export const MATCHING_QUESTIONS: MatchingQuestion[] = [
  {
    id: "match-1",
    type: "matching",
    questionEn: "Match each English word with its correct Bengali meaning:",
    questionBn: "প্রতিটি ইংরেজি শব্দের সাথে সঠিক বাংলা অর্থ মিল করো:",
    pairs: [
      { left: { en: "Brave", bn: "Brave" }, right: { en: "সাহসী", bn: "সাহসী" } },
      { left: { en: "Curious", bn: "Curious" }, right: { en: "কৌতূহলী", bn: "কৌতূহলী" } },
      { left: { en: "Harvest", bn: "Harvest" }, right: { en: "ফসল কাটা", bn: "ফসল কাটা" } },
      { left: { en: "Discover", bn: "Discover" }, right: { en: "আবিষ্কার করা", bn: "আবিষ্কার করা" } },
    ],
    explanationEn: "Brave = সাহসী, Curious = কৌতূহলী, Harvest = ফসল কাটা, Discover = আবিষ্কার করা.",
    explanationBn: "শব্দগুলোর সঠিক বাংলা প্রতিশব্দ মনে রাখো।",
  },
  {
    id: "match-2",
    type: "matching",
    questionEn: "Match each Science term with its definition:",
    questionBn: "বিজ্ঞানের পরিভাষার সাথে সঠিক সংজ্ঞা মিল করো:",
    pairs: [
      { left: { en: "Evaporation", bn: "বাষ্পীভবন" }, right: { en: "Liquid to gas", bn: "তরল থেকে বাষ্প" } },
      { left: { en: "Condensation", bn: "ঘনীভবন" }, right: { en: "Gas to liquid", bn: "বাষ্প থেকে তরল" } },
      { left: { en: "Freezing", bn: "হিমায়ন" }, right: { en: "Liquid to solid", bn: "তরল থেকে বরফ" } },
      { left: { en: "Melting", bn: "গলন" }, right: { en: "Solid to liquid", bn: "কঠিন থেকে তরল" } },
    ],
    explanationEn: "States of matter transformation terms correctly paired.",
    explanationBn: "পদার্থের অবস্থার পরিবর্তনের বিভিন্ন প্রক্রিয়ার সঠিক মিল।",
  },
  {
    id: "match-3",
    type: "matching",
    questionEn: "Match animal classifications with their example:",
    questionBn: "প্রাণীর শ্রেণির সাথে সঠিক উদাহরণ মিল করো:",
    pairs: [
      { left: { en: "Mammal", bn: "স্তন্যপায়ী" }, right: { en: "Dolphin / Cow", bn: "ডলফিন / গরু" } },
      { left: { en: "Amphibian", bn: "উভচর" }, right: { en: "Frog", bn: "ব্যাঙ" } },
      { left: { en: "Reptile", bn: "সরীসৃপ" }, right: { en: "Lizard / Snake", bn: "টিকটিকি / সাপ" } },
      { left: { en: "Bird", bn: "পাখি" }, right: { en: "Eagle / Pigeon", bn: "ঈগল / কবুতর" } },
    ],
    explanationEn: "Vertebrates grouped into major animal classes.",
    explanationBn: "মেরুদণ্ডী প্রাণীদের প্রধান শ্রেণিবিভাগ।",
  },
];

// Speaking Questions (5 questions)
export const SPEAKING_QUESTIONS: SpeakingQuestion[] = [
  {
    id: "speak-1",
    type: "speaking",
    questionEn: "Listen, tap the mic, and say the sentence aloud:",
    questionBn: "মনোযোগ দিয়ে শোনো, মাইকে ট্যাপ করো এবং বাক্যটি মুখে বলো:",
    targetPhraseEn: "I brush my teeth twice every day.",
    targetPhraseBn: "আমি প্রতিদিন দুইবার দাঁত ব্রাশ করি।",
    ipa: "/aɪ brʌʃ maɪ tiːθ twaɪs ˈevri deɪ/",
    phonemes: ["brush", "teeth", "twice", "every", "day"],
    tipsEn: "Pronounce 'teeth' with a soft 'th' sound and 'twice' clearly.",
    tipsBn: "'teeth' এবং 'twice' শব্দ দুটি স্পষ্ট করে উচ্চারণ করো।",
  },
  {
    id: "speak-2",
    type: "speaking",
    questionEn: "Practice your English pronunciation:",
    questionBn: "ইংরেজি উচ্চারণ অনুশীলন করো:",
    targetPhraseEn: "The solar system has eight planets.",
    targetPhraseBn: "সৌরজগতে আটটি গ্রহ আছে।",
    ipa: "/ðə ˈsoʊlər ˈsɪstəm hæz eɪt ˈplænɪts/",
    phonemes: ["solar", "system", "eight", "planets"],
    tipsEn: "Stress the first syllables of 'solar' and 'planets'.",
    tipsBn: "'solar' এবং 'planets' শব্দের প্রথম অংশে জোর দাও।",
  },
  {
    id: "speak-3",
    type: "speaking",
    questionEn: "Read this science fact aloud:",
    questionBn: "এই বিজ্ঞানের তথ্যটি জোরে পড়ো:",
    targetPhraseEn: "Water boils at one hundred degrees Celsius.",
    targetPhraseBn: "পানি ১০০ ডিগ্রি সেলসিয়াস তাপমাত্রায় ফোটে।",
    ipa: "/ˈwɔːtər bɔɪlz æt wʌn ˈhʌndrəd dɪˈɡriːz ˈselsiəs/",
    phonemes: ["boils", "hundred", "degrees", "celsius"],
    tipsEn: "Pronounce 'Celsius' as /ˈselsiəs/.",
    tipsBn: "'Celsius' শব্দটি সেলসিয়াস হিসেবে পরিষ্কার করে বলো।",
  },
  {
    id: "speak-4",
    type: "speaking",
    questionEn: "Speak this motivational sentence:",
    questionBn: "এই অনুপ্রেরণামূলক বাক্যটি মুখে বলো:",
    targetPhraseEn: "Every mistake helps us learn and grow.",
    targetPhraseBn: "প্রতিটি ভুল আমাদের শিখতে এবং বড় হতে সাহায্য করে।",
    ipa: "/ˈevri mɪˈsteɪk helps ʌs lɜːn ænd ɡroʊ/",
    phonemes: ["mistake", "learn", "grow"],
    tipsEn: "Keep a natural rhythm and smile while speaking.",
    tipsBn: "স্বাভাবিক গতিতে এবং স্পষ্ট উচ্চারণে বলো।",
  },
  {
    id: "speak-5",
    type: "speaking",
    questionEn: "Say this vocabulary sentence aloud:",
    questionBn: "এই বাক্যটি জোরে বলো:",
    targetPhraseEn: "Curiosity opens the door to knowledge.",
    targetPhraseBn: "কৌতূহল জ্ঞানের দ্বার উন্মোচন করে।",
    ipa: "/ˌkjʊəriˈɒsəti ˈoʊpənz ðə dɔːr tuː ˈnɒlɪdʒ/",
    phonemes: ["curiosity", "opens", "knowledge"],
    tipsEn: "Pronounce 'knowledge' as /ˈnɒlɪdʒ/ (silent 'k').",
    tipsBn: "'knowledge' শব্দের শুরুতে 'k' অনুচ্চারিত থাকে।",
  },
];

// Listening Questions (6 questions)
export const LISTENING_QUESTIONS: ListeningQuestion[] = [
  {
    id: "listen-1",
    type: "listening",
    questionEn: "Listen to the audio sentence and choose what was said:",
    questionBn: "অডিও বাক্যটি মনোযোগ দিয়ে শোনো এবং কী বলা হয়েছে তা বেছে নাও:",
    audioText: "The sun rises in the east and sets in the west.",
    optionsEn: [
      "The sun rises in the east and sets in the west.",
      "The sun rises in the west and sets in the east.",
      "The moon rises in the east and sets in the west.",
      "The stars shine brightly in the deep sky.",
    ],
    optionsBn: [
      "সূর্য পূর্ব দিকে ওঠে এবং পশ্চিম দিকে অস্ত যায়।",
      "সূর্য পশ্চিম দিকে ওঠে এবং পূর্ব দিকে অস্ত যায়।",
      "চাঁদ পূর্ব দিকে ওঠে এবং পশ্চিম দিকে অস্ত যায়।",
      "তারাগুলো রাতের আকাশে উজ্জ্বলভাবে জ্বলে।",
    ],
    correctIndex: 0,
    explanationEn: "The speaker said: 'The sun rises in the east and sets in the west.'",
    explanationBn: "সঠিক বাক্য: সূর্য পূর্ব দিকে ওঠে এবং পশ্চিম দিকে অস্ত যায়।",
  },
  {
    id: "listen-2",
    type: "listening",
    questionEn: "Listen to the word and choose its correct spelling:",
    questionBn: "শব্দটি শুনে সঠিক বানানটি নির্বাচন করো:",
    audioText: "Photosynthesis",
    optionsEn: ["Photosynthesis", "Photosinthesis", "Photocynthesis", "Photothinthesis"],
    optionsBn: ["Photosynthesis (সঠিক)", "Photosinthesis", "Photocynthesis", "Photothinthesis"],
    correctIndex: 0,
    explanationEn: "Correct spelling is P-H-O-T-O-S-Y-N-T-H-E-S-I-S.",
    explanationBn: "সঠিক বানান Photosynthesis।",
  },
  {
    id: "listen-3",
    type: "listening",
    questionEn: "Listen to the question and select the logical answer:",
    questionBn: "প্রশ্নটি শুনে যৌক্তিক উত্তরটি নির্বাচন করো:",
    audioText: "What do bees collect from flowers to make sweet honey?",
    optionsEn: ["Nectar", "Leaves", "Soil", "Sand"],
    optionsBn: ["ফুলের মিষ্টি রস (Nectar)", "গাছের পাতা (Leaves)", "মাটি (Soil)", "বালু (Sand)"],
    correctIndex: 0,
    explanationEn: "Bees collect floral nectar to convert into honey.",
    explanationBn: "মৌমাছি ফুল থেকে নেকটার বা রস সংগ্রহ করে মধু তৈরি করে।",
  },
  {
    id: "listen-4",
    type: "listening",
    questionEn: "Listen to the sentence and choose what you heard:",
    questionBn: "বাক্যটি শুনে সঠিক উক্তিটি চিহ্নিত করো:",
    audioText: "We need clean drinking water every day.",
    optionsEn: [
      "We need clean drinking water every day.",
      "We need warm water for cooking every day.",
      "We drink cold soda during hot summer days.",
      "Clean water flows through mountains and rivers.",
    ],
    optionsBn: [
      "আমাদের প্রতিদিন বিশুদ্ধ পানীয় জল প্রয়োজন।",
      "আমাদের রান্নার জন্য প্রতিদিন গরম পানি দরকার।",
      "আমরা গরমের দিনে ঠান্ডা পানীয় পান করি।",
      "পাহাড় ও নদী দিয়ে বিশুদ্ধ পানি প্রবাহিত হয়।",
    ],
    correctIndex: 0,
    explanationEn: "The spoken sentence was: 'We need clean drinking water every day.'",
    explanationBn: "বলা হয়েছে: আমাদের প্রতিদিন বিশুদ্ধ পানীয় জল প্রয়োজন।",
  },
  {
    id: "listen-5",
    type: "listening",
    questionEn: "Listen to the calculation problem and pick the answer:",
    questionBn: "হিসাবটি শুনে সঠিক ফলাফলটি বেছে নাও:",
    audioText: "Twenty five plus thirty five equals what number?",
    optionsEn: ["60", "50", "70", "55"],
    optionsBn: ["৬০ (60)", "৫০ (50)", "৭০ (70)", "৫৫ (55)"],
    correctIndex: 0,
    explanationEn: "25 + 35 = 60.",
    explanationBn: "২৫ + ৩৫ = ৬০।",
  },
];

// Helper to retrieve questions for a mode
export function getQuestionsForMode(modeId: PracticeModeId): PracticeQuestion[] {
  switch (modeId) {
    case "todays-set":
      return [...TODAYS_SET_QUESTIONS];
    case "quiz": {
      // Mixed sprint: pick a blend of MCQ, True/False, and Fill in the blank
      const mixed: PracticeQuestion[] = [
        ...MCQ_QUESTIONS.slice(0, 4),
        ...TRUE_FALSE_QUESTIONS.slice(0, 3),
        ...FILL_BLANK_QUESTIONS.slice(0, 3),
      ];
      return mixed.sort(() => Math.random() - 0.5);
    }
    case "mcq":
      return [...MCQ_QUESTIONS];
    case "true-false":
      return [...TRUE_FALSE_QUESTIONS];
    case "fill-blank":
      return [...FILL_BLANK_QUESTIONS];
    case "matching":
      return [...MATCHING_QUESTIONS];
    case "speaking":
      return [...SPEAKING_QUESTIONS];
    case "listening":
      return [...LISTENING_QUESTIONS];
    default:
      return [...TODAYS_SET_QUESTIONS];
  }
}
