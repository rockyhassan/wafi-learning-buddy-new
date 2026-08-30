export type Chapter = {
  id: number;
  labelType?: 'chapter' | 'part' | 'unit' | 'custom'; // Default: 'chapter'
  customLabel?: string; // e.g. "Part-1", "Unit-A", "Section-2"
  en: string;
  bn: string;
  lessons: string[];
  done: number;
  part?: string; // Deprecated: Use labelType and customLabel instead
};

export type Subject = {
  id: string;
  slug: string;
  en: string;
  bn: string;
  icon: string;
  progress: number;
  chapters: Chapter[];
};

export const student = {
  name: "Muhammad Affan Hassan Wafi",
  nickname: "Wafi",
  className: "Grade-3",
  section: "A",
  roll: "08",
  school: "KCIS",
  board: "NCTB",
  medium: "English",
  birthday: "2016-04-12",
  streak: 12,
  coins: 1240,
  stars: 86,
  level: 7,
};

export const subjects: Subject[] = [
  {
    id: "english-literature",
    slug: "english-lit",
    en: "English Literature",
    bn: "ইংরেজি সাহিত্য",
    icon: "BookOpen",
    progress: 68,
    chapters: [
      {
        id: 1,
        en: "Introduction to Literature",
        bn: "সাহিত্য পরিচয়",
        done: 2,
        lessons: ["Poetry Basics", "Prose Introduction", "Literary Devices"],
      },
      {
        id: 2,
        en: "Famous Poems",
        bn: "বিখ্যাত কবিতা",
        done: 1,
        lessons: ["Poem Analysis", "Understanding Themes", "Practice"],
      },
      {
        id: 3,
        en: "Short Stories",
        bn: "ছোটগল্প",
        done: 0,
        lessons: ["Story Structure", "Character Development", "Reading Comprehension"],
      },
    ],
  },
  {
    id: "english-language",
    slug: "english-lang",
    en: "English Language",
    bn: "ইংরেজি ভাষা",
    icon: "BookMarked",
    progress: 72,
    chapters: [
      {
        id: 1,
        en: "Grammar Basics",
        bn: "ব্যাকরণ মূলনীতি",
        done: 3,
        lessons: ["Parts of Speech", "Sentence Structure", "Tenses"],
      },
      {
        id: 2,
        en: "Vocabulary Building",
        bn: "শব্দভাণ্ডার সম্প্রসারণ",
        done: 2,
        lessons: ["Common Words", "Word Meanings", "Synonyms & Antonyms"],
      },
      {
        id: 3,
        en: "Writing Skills",
        bn: "লেখার দক্ষতা",
        done: 0,
        lessons: ["Sentence Writing", "Paragraph Writing", "Essay Composition"],
      },
    ],
  },
  {
    id: "science",
    slug: "science",
    en: "Science",
    bn: "বিজ্ঞান",
    icon: "Microscope",
    progress: 61,
    chapters: [
      {
        id: 1,
        labelType: "part",
        customLabel: "Part 1",
        en: "Living Things",
        bn: "জীব",
        done: 2,
        lessons: ["Plants", "Animals", "Habitats"],
        part: "Part 1",
      },
      {
        id: 2,
        labelType: "part",
        customLabel: "Part 1",
        en: "Matter & Energy",
        bn: "পদার্থ ও শক্তি",
        done: 1,
        lessons: ["States of Matter", "Energy Types", "Heat & Light"],
        part: "Part 1",
      },
      {
        id: 3,
        labelType: "part",
        customLabel: "Part 2",
        en: "Earth & Space",
        bn: "পৃথিবী ও মহাকাশ",
        done: 0,
        lessons: ["Our Planet", "Weather & Climate", "Universe Basics"],
        part: "Part 2",
      },
      {
        id: 4,
        labelType: "part",
        customLabel: "Part 2",
        en: "Human Body",
        bn: "মানব শরীর",
        done: 0,
        lessons: ["Body Systems", "Health & Hygiene", "Nutrition"],
        part: "Part 2",
      },
    ],
  },
  {
    id: "mathematics",
    slug: "math",
    en: "Mathematics",
    bn: "গণিত",
    icon: "Divide",
    progress: 52,
    chapters: [
      {
        id: 1,
        en: "Number System",
        bn: "সংখ্যা ব্যবস্থা",
        done: 3,
        lessons: ["Whole Numbers", "Integers", "Decimals"],
      },
      {
        id: 2,
        en: "Arithmetic Operations",
        bn: "পাটিগণিত ক্রিয়া",
        done: 1,
        lessons: ["Addition & Subtraction", "Multiplication", "Division"],
      },
      {
        id: 3,
        en: "Fractions & Ratios",
        bn: "ভগ্নাংশ ও অনুপাত",
        done: 0,
        lessons: ["Understanding Fractions", "Comparing Fractions", "Ratios"],
      },
    ],
  },
  {
    id: "social-studies",
    slug: "bgs",
    en: "Social Studies",
    bn: "বাংলাদেশ ও বিশ্বপরিচয়",
    icon: "Globe",
    progress: 44,
    chapters: [
      {
        id: 1,
        en: "Our Country Bangladesh",
        bn: "আমাদের দেশ বাংলাদেশ",
        done: 1,
        lessons: ["Geography", "Divisions", "Famous Places"],
      },
      {
        id: 2,
        en: "Bangladesh History",
        bn: "বাংলাদেশের ইতিহাস",
        done: 0,
        lessons: ["Liberation War", "National Heroes", "Independence"],
      },
      {
        id: 3,
        labelType: "part",
        customLabel: "Part 1",
        en: "Environment & Society",
        bn: "পরিবেশ ও সমাজ",
        done: 0,
        lessons: ["Natural Resources", "Environmental Protection", "Community"],
        part: "Part 1",
      },
      {
        id: 4,
        labelType: "part",
        customLabel: "Part 2",
        en: "Rights & Responsibilities",
        bn: "অধিকার ও দায়িত্ব",
        done: 0,
        lessons: ["Citizen Rights", "Social Duties", "Justice System"],
        part: "Part 2",
      },
    ],
  },
  {
    id: "computer-science",
    slug: "ict",
    en: "Computer Science",
    bn: "তথ্য ও যোগাযোগ প্রযুক্তি",
    icon: "Laptop",
    progress: 39,
    chapters: [
      {
        id: 1,
        en: "Computer Fundamentals",
        bn: "কম্পিউটার পরিচিতি",
        done: 1,
        lessons: ["Hardware Components", "Software Basics", "Computer Care"],
      },
      {
        id: 2,
        en: "Internet & Networks",
        bn: "ইন্টারনেট ও নেটওয়ার্ক",
        done: 0,
        lessons: ["How Internet Works", "Online Safety", "Digital Citizenship"],
      },
    ],
  },
  {
    id: "bangla",
    slug: "bangla",
    en: "Bangla",
    bn: "বাংলা ১ম পত্র",
    icon: "BookOpen",
    progress: 74,
    chapters: [
      {
        id: 1,
        en: "Poetry - Bangla",
        bn: "কবিতা - বাংলা",
        done: 2,
        lessons: ["Poem Reading", "Word Meanings", "Questions & Answers"],
      },
      {
        id: 2,
        en: "Prose - Bangla",
        bn: "গদ্য - বাংলা",
        done: 1,
        lessons: ["Prose Analysis", "Explanation", "Practice"],
      },
      {
        id: 3,
        en: "Bengali Grammar",
        bn: "বাংলা ব্যাকরণ",
        done: 0,
        lessons: ["Sandhi", "Samasa", "Punctuation"],
      },
    ],
  },
  {
    id: "bangla-2nd",
    slug: "bangla-2nd",
    en: "Bangla 2nd Paper",
    bn: "বাংলা ২য় পত্র",
    icon: "PenTool",
    progress: 58,
    chapters: [
      {
        id: 1,
        en: "Writing Skills",
        bn: "লেখার দক্ষতা",
        done: 1,
        lessons: ["Composition Writing", "Letter Writing", "Application Writing"],
      },
      {
        id: 2,
        en: "Reading Comprehension",
        bn: "পাঠ বোধগম্যতা",
        done: 0,
        lessons: ["Passage Reading", "Question Analysis", "Answer Writing"],
      },
      {
        id: 3,
        en: "Listening & Speaking",
        bn: "শ্রবণ ও কথন",
        done: 0,
        lessons: ["Dialogue", "Storytelling", "Discussion"],
      },
    ],
  },
  {
    id: "geography",
    slug: "geography",
    en: "Geography",
    bn: "ভূগোল",
    icon: "Compass",
    progress: 47,
    chapters: [
      {
        id: 1,
        en: "Physical Geography",
        bn: "প্রাকৃতিক ভূগোল",
        done: 1,
        lessons: ["Landforms", "Climate", "Water Bodies"],
      },
      {
        id: 2,
        en: "Human Geography",
        bn: "মানব ভূগোল",
        done: 0,
        lessons: ["Population", "Settlements", "Cultures"],
      },
      {
        id: 3,
        en: "Maps & Mapping",
        bn: "মানচিত্র ও ম্যাপিং",
        done: 0,
        lessons: ["Map Reading", "Directions", "Scale & Distance"],
      },
    ],
  },
  {
    id: "islamic-studies",
    slug: "religion",
    en: "Islamic Studies",
    bn: "ইসলাম শিক্ষা",
    icon: "Building",
    progress: 58,
    chapters: [
      {
        id: 1,
        en: "Islamic Basics",
        bn: "ইসলাম মূলনীতি",
        done: 2,
        lessons: ["Five Pillars", "Shahada", "Prayer"],
      },
      {
        id: 2,
        en: "Islamic Ethics",
        bn: "ইসলামি নৈতিকতা",
        done: 1,
        lessons: ["Good Character", "Honesty", "Kindness"],
      },
      {
        id: 3,
        en: "Quran & Hadith",
        bn: "কোরান ও হাদিস",
        done: 0,
        lessons: ["Surah Reading", "Hadith Study", "Islamic History"],
      },
    ],
  },
  {
    id: "arabic",
    slug: "arabic",
    en: "Arabic",
    bn: "আরবি",
    icon: "Moon",
    progress: 35,
    chapters: [
      {
        id: 1,
        en: "Arabic Alphabet",
        bn: "আরবি বর্ণমালা",
        done: 1,
        lessons: ["Letter Recognition", "Writing", "Pronunciation"],
      },
      {
        id: 2,
        en: "Basic Vocabulary",
        bn: "মৌলিক শব্দভাণ্ডার",
        done: 0,
        lessons: ["Common Words", "Phrases", "Greetings"],
      },
      {
        id: 3,
        en: "Simple Conversations",
        bn: "সাধারণ কথোপকথন",
        done: 0,
        lessons: ["Dialogue Practice", "Listening", "Speaking"],
      },
    ],
  },
  {
    id: "history",
    slug: "history",
    en: "History",
    bn: "ইতিহাস",
    icon: "Landmark",
    progress: 41,
    chapters: [
      {
        id: 1,
        en: "Ancient History",
        bn: "প্রাচীন ইতিহাস",
        done: 1,
        lessons: ["Early Civilizations", "Ancient Empires", "Cultural Development"],
      },
      {
        id: 2,
        en: "Medieval Period",
        bn: "মধ্যযুগ",
        done: 0,
        lessons: ["Kingdom & Sultanate", "Trade Routes", "Cultural Exchange"],
      },
      {
        id: 3,
        en: "Modern History",
        bn: "আধুনিক ইতিহাস",
        done: 0,
        lessons: ["Colonial Period", "Independence Movements", "Nation Building"],
      },
    ],
  },
];

export const routine = [
  { time: "08:00", subject: "Assembly", teacher: "—", room: "Field" },
  { time: "08:30", subject: "English", teacher: "Ms. Nabila", room: "3A" },
  { time: "09:20", subject: "Math", teacher: "Mr. Rafiq", room: "3A" },
  { time: "10:10", subject: "Break", teacher: "—", room: "—" },
  { time: "10:40", subject: "Science", teacher: "Ms. Tania", room: "Lab 1" },
  { time: "11:30", subject: "Bangla", teacher: "Mr. Kamal", room: "3A" },
  { time: "12:20", subject: "ICT", teacher: "Ms. Rumi", room: "Lab 2" },
];

export const exams = [
  { name: "Math Class Test", date: "in 3 days", chapter: "Chapter 3: Fractions", days: 3 },
  { name: "English Mid Term", date: "in 11 days", chapter: "Chapter 1-3", days: 11 },
  { name: "Science Quiz", date: "in 18 days", chapter: "Living Things", days: 18 },
];

export const vocabulary = [
  { word: "Curious", bn: "কৌতূহলী", ipa: "/ˈkjʊəriəs/", example: "Wafi is curious about stars." },
  { word: "Brave", bn: "সাহসী", ipa: "/breɪv/", example: "The brave boy helped his friend." },
  { word: "Harvest", bn: "ফসল কাটা", ipa: "/ˈhɑːvɪst/", example: "Farmers harvest rice in winter." },
  { word: "Journey", bn: "যাত্রা", ipa: "/ˈdʒɜːni/", example: "Our journey to the village was fun." },
  { word: "Gentle", bn: "কোমল", ipa: "/ˈdʒentl/", example: "She has a gentle voice." },
];

export const weeklyProgress = [
  { day: "Sat", minutes: 32, score: 72 },
  { day: "Sun", minutes: 41, score: 78 },
  { day: "Mon", minutes: 25, score: 65 },
  { day: "Tue", minutes: 48, score: 84 },
  { day: "Wed", minutes: 36, score: 80 },
  { day: "Thu", minutes: 52, score: 91 },
  { day: "Fri", minutes: 18, score: 70 },
];

export const monthlyProgress = [
  { week: "W1", score: 68 },
  { week: "W2", score: 74 },
  { week: "W3", score: 71 },
  { week: "W4", score: 83 },
];

export const teachers = [
  { name: "Ms. Nabila Haque", subject: "English", phone: "01700-000001" },
  { name: "Mr. Rafiqul Islam", subject: "Math", phone: "01700-000002" },
  { name: "Ms. Tania Akter", subject: "Science", phone: "01700-000003" },
  { name: "Mr. Kamal Hossain", subject: "Bangla", phone: "01700-000004" },
];

export const aiMemory = [
  { label: "Strong at", labelBn: "ভালো পারে", items: ["Multiplication tables", "Bangla reading", "Drawing"], tone: "success" },
  { label: "Weak at", labelBn: "দুর্বল", items: ["Fractions", "Past tense", "Spelling long words"], tone: "warning" },
  { label: "Pronunciation trouble", labelBn: "উচ্চারণে সমস্যা", items: ["thirsty", "world", "vegetable"], tone: "info" },
  { label: "Forgets often", labelBn: "ভুলে যায়", items: ["Water cycle steps", "Division remainder rule"], tone: "destructive" },
];

export const achievements = [
  { emoji: "🔥", name: "12 Day Streak", nameBn: "১২ দিনের ধারা" },
  { emoji: "📖", name: "Bookworm", nameBn: "বইপোকা" },
  { emoji: "🎯", name: "Quiz Master", nameBn: "কুইজ মাস্টার" },
  { emoji: "🗣️", name: "Clear Speaker", nameBn: "স্পষ্ট উচ্চারণ" },
  { emoji: "⏱️", name: "Early Bird", nameBn: "সকালের পাখি" },
  { emoji: "🏅", name: "Level 7", nameBn: "লেভেল ৭" },
];