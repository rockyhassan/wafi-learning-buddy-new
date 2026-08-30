export type LessonDetail = {
  title: { en: string; bn: string };
  lessonText: { en: string; bn?: string };
  banglaExplanation: string;
  easyEnglish: string;
  pronunciation: Array<{ word: string; ipa: string }>;
  vocabulary?: Array<{ word: string; meaning: string }>;
  importantNotes?: string[];
};

const getFallbackLesson = (lessonId: string): LessonDetail => {
  const [subject, chapter, lesson] = lessonId.split("-");
  return {
    title: {
      en: `Lesson ${lesson}`,
      bn: `লেসন ${lesson}`,
    },
    lessonText: {
      en: "Lesson content is being prepared. Please check back later.",
      bn: "লেসনের বিষয়বস্তু প্রস্তুত করা হচ্ছে। পরে আবার দেখুন।",
    },
    banglaExplanation: "এই লেসনের বিস্তারিত ব্যাখ্যা শীঘ্রই যোগ করা হবে।",
    easyEnglish: "Lesson content coming soon.",
    pronunciation: [],
    vocabulary: [],
    importantNotes: [],
  };
};

export const lessonContentMap: Record<string, LessonDetail> = {
  "science-1-1": {
    title: {
      en: "Plants",
      bn: "উদ্ভিদ",
    },
    lessonText: {
      en: "Plants are living things. They need water, sunlight, and soil to grow. Plants have roots, stems, leaves, and flowers. Roots absorb water and nutrients from the soil. The stem supports the plant and carries water to the leaves. Leaves make food for the plant using sunlight.",
      bn: "উদ্ভিদ জীবিত প্রাণী। এদের বৃদ্ধির জন্য পানি, সূর্যালোক এবং মাটি প্রয়োজন। উদ্ভিদের শিকড়, কান্ড, পাতা এবং ফুল থাকে। শিকড় মাটি থেকে পানি এবং পুষ্টি শোষণ করে। কান্ড উদ্ভিদকে সমর্থন করে এবং পানি পাতায় বহন করে। পাতা সূর্যালোক ব্যবহার করে উদ্ভিদের জন্য খাবার তৈরি করে।",
    },
    banglaExplanation: "উদ্ভিদরা জীবিত প্রাণী যারা আলো, পানি এবং মাটি থেকে নিজেদের খাবার তৈরি করতে পারে। সবুজ উদ্ভিদের পাতায় ক্লোরোফিল থাকে যা সূর্যালোক শোষণ করে।",
    easyEnglish: "Plants need sun, water, and soil. They make their own food.",
    pronunciation: [
      { word: "plant", ipa: "/plɑːnt/" },
      { word: "root", ipa: "/ruːt/" },
      { word: "stem", ipa: "/stem/" },
      { word: "leaf", ipa: "/liːf/" },
      { word: "flower", ipa: "/ˈflaʊər/" },
      { word: "sunlight", ipa: "/ˈsʌnlaɪt/" },
      { word: "soil", ipa: "/sɔɪl/" },
    ],
    vocabulary: [
      { word: "living things", meaning: "জীবিত প্রাণী" },
      { word: "roots", meaning: "শিকড়" },
      { word: "stem", meaning: "কান্ড" },
      { word: "leaves", meaning: "পাতা" },
      { word: "absorb", meaning: "শোষণ করা" },
      { word: "nutrients", meaning: "পুষ্টি" },
      { word: "support", meaning: "সমর্থন করা" },
    ],
    importantNotes: [
      "Plants make their own food through photosynthesis",
      "Roots anchor the plant in the soil",
      "Leaves contain chlorophyll (green pigment)",
      "Most plants need water every day",
    ],
  },
  "science-1-2": {
    title: {
      en: "Animals",
      bn: "প্রাণী",
    },
    lessonText: {
      en: "Animals are living things that cannot make their own food. They eat plants or other animals. Animals move from place to place. They have different shapes and sizes. Some animals live on land, some in water, and some can fly in the air.",
      bn: "প্রাণীরা জীবিত প্রাণী যারা নিজেদের খাবার তৈরি করতে পারে না। তারা উদ্ভিদ বা অন্য প্রাণী খায়। প্রাণীরা এক স্থান থেকে অন্য স্থানে চলাচল করে। তাদের বিভিন্ন আকার এবং আকৃতি আছে। কিছু প্রাণী স্থলে বাস করে, কিছু পানিতে, এবং কিছু আকাশে উড়তে পারে।",
    },
    banglaExplanation: "প্রাণীরা নিজেরা খাবার তৈরি করতে পারে না, তাই তাদের অন্য প্রাণী বা উদ্ভিদ খেতে হয়। তাদের অনেকের পা আছে যা দিয়ে তারা চলাচল করে।",
    easyEnglish: "Animals eat plants or other animals. They can move around.",
    pronunciation: [
      { word: "animal", ipa: "/ˈænɪml/" },
      { word: "food", ipa: "/fuːd/" },
      { word: "move", ipa: "/muːv/" },
      { word: "land", ipa: "/lænd/" },
      { word: "water", ipa: "/ˈwɔːtər/" },
      { word: "fly", ipa: "/flaɪ/" },
    ],
    vocabulary: [
      { word: "living things", meaning: "জীবিত প্রাণী" },
      { word: "move", meaning: "চলাচল করা" },
      { word: "shapes", meaning: "আকার" },
      { word: "sizes", meaning: "আকৃতি" },
      { word: "land", meaning: "স্থল" },
      { word: "water", meaning: "পানি" },
    ],
    importantNotes: [
      "Animals depend on plants or other animals for food",
      "Different animals live in different habitats",
      "Animals can move on their own",
      "Some animals are herbivores (plant-eaters)",
      "Some animals are carnivores (meat-eaters)",
    ],
  },
  "english-1-1": {
    title: {
      en: "Present Simple",
      bn: "সাধারণ বর্তমান কাল",
    },
    lessonText: {
      en: "We use the present simple to talk about things we do every day. For example: 'I go to school at eight o'clock.' 'Wafi plays football on Friday.'",
      bn: "যেসব কাজ আমরা প্রতিদিন করি, সেগুলো বোঝাতে Present Simple ব্যবহার করি। যেমন — 'আমি আটটায় স্কুলে যাই।'",
    },
    banglaExplanation: "যেসব কাজ আমরা প্রতিদিন করি, সেগুলো বোঝাতে Present Simple ব্যবহার করি। যেমন — 'আমি আটটায় স্কুলে যাই।' মনে রেখো: He / She / It এর পরে ক্রিয়ার শেষে s বসে।",
    easyEnglish: "Every day = present simple. Add -s for he, she, it. That's all!",
    pronunciation: [
      { word: "school", ipa: "/skuːl/" },
      { word: "o'clock", ipa: "/əˈklɒk/" },
      { word: "Friday", ipa: "/ˈfraɪdeɪ/" },
    ],
    vocabulary: [
      { word: "every day", meaning: "প্রতিদিন" },
      { word: "always", meaning: "সবসময়" },
      { word: "sometimes", meaning: "কখনও কখনও" },
    ],
    importantNotes: [
      "He / She / It + verb + s",
      "I / We / You / They + verb",
      "Negative: do not / does not + verb",
    ],
  },
  "math-1-1": {
    title: {
      en: "Numbers",
      bn: "সংখ্যা",
    },
    lessonText: {
      en: "Numbers help us count things. We use numbers every day. We can count fingers, toys, books, and many other things. The numbers from 1 to 10 are: one, two, three, four, five, six, seven, eight, nine, ten.",
      bn: "সংখ্যা আমাদের জিনিস গণনা করতে সাহায্য করে। আমরা প্রতিদিন সংখ্যা ব্যবহার করি। আমরা আঙুল, খেলনা, বই এবং অন্যান্য অনেক জিনিস গণনা করতে পারি। ১ থেকে ১০ পর্যন্ত সংখ্যাগুলো হলো: এক, দুই, তিন, চার, পাঁচ, ছয়, সাত, আট, নয়, দশ।",
    },
    banglaExplanation: "সংখ্যা আমাদের জীবনে খুব গুরুত্বপূর্ণ। আমরা সংখ্যা দিয়ে সবকিছু গণনা করি। সংখ্যা দিয়ে আমরা সময়, দিন, মাস বোঝি।",
    easyEnglish: "Numbers help us count. 1, 2, 3, 4, 5, 6, 7, 8, 9, 10.",
    pronunciation: [
      { word: "one", ipa: "/wʌn/" },
      { word: "two", ipa: "/tuː/" },
      { word: "three", ipa: "/θriː/" },
      { word: "four", ipa: "/fɔːr/" },
      { word: "five", ipa: "/faɪv/" },
      { word: "six", ipa: "/sɪks/" },
      { word: "seven", ipa: "/ˈsevn/" },
      { word: "eight", ipa: "/eɪt/" },
      { word: "nine", ipa: "/naɪn/" },
      { word: "ten", ipa: "/ten/" },
    ],
    vocabulary: [
      { word: "count", meaning: "গণনা করা" },
      { word: "number", meaning: "সংখ্যা" },
      { word: "how many", meaning: "কতগুলো" },
    ],
    importantNotes: [
      "Numbers are used for counting objects",
      "We use numbers to tell time",
      "Numbers help us understand quantity",
    ],
  },
};

import { getEditedLesson } from "./lesson-storage";

export const getLessonContent = (lessonId: string): LessonDetail => {
  // Check for edited version first
  const edited = getEditedLesson(lessonId);
  if (edited) return edited;
  
  // Fall back to static content
  return lessonContentMap[lessonId] || getFallbackLesson(lessonId);
};
