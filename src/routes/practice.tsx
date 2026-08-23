import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Volume2,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Sparkles,
  Trophy,
  Mic,
  ArrowLeft,
  Flame,
  HelpCircle,
  Clock,
  Check,
  ChevronRight,
} from "lucide-react";
import { PageShell, Pill, SectionCard } from "@/components/app-shell";
import { useApp } from "@/lib/app-state";
import { gameAudio } from "@/lib/game-audio";
import { student } from "@/lib/mock-data";
import {
  PRACTICE_MODES,
  getQuestionsForMode,
  type PracticeModeId,
  type PracticeQuestion,
  type McqQuestion,
  type TrueFalseQuestion,
  type FillBlankQuestion,
  type MatchingQuestion,
  type SpeakingQuestion,
  type ListeningQuestion,
} from "@/lib/practice-data";

export const Route = createFileRoute("/practice")({
  head: () => ({
    meta: [
      { title: "Practice — Wafi" },
      {
        name: "description",
        content:
          "Quizzes, MCQ, true/false, fill in the blanks, matching, speaking and listening practice.",
      },
      { property: "og:title", content: "Practice — Wafi" },
      { property: "og:description", content: "Daily practice in every question format." },
    ],
  }),
  component: Practice,
});

export default function Practice() {
  const { t, lang } = useApp();
  const [activeMode, setActiveMode] = useState<PracticeModeId | null>(null);
  const [coins, setCoins] = useState(student.coins);

  // Load coins from localStorage
  useEffect(() => {
    try {
      const savedCoins = window.localStorage.getItem("wafi.coins");
      if (savedCoins) {
        const parsed = parseInt(savedCoins, 10);
        if (!isNaN(parsed)) setCoins(parsed);
      }
    } catch {
      // Ignore
    }
  }, []);

  // Listen for Escape key to close active practice view
  useEffect(() => {
    if (!activeMode) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveMode(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeMode]);

  const handleFinishSession = (earnedCoins: number) => {
    if (earnedCoins > 0) {
      setCoins((prev) => {
        const next = prev + earnedCoins;
        window.localStorage.setItem("wafi.coins", String(next));
        return next;
      });
    }
  };

  const getModeTitle = (modeId: PracticeModeId) => {
    if (modeId === "todays-set") {
      return {
        title: t("Today's Science Set", "আজকের বিজ্ঞান সেট"),
        desc: t("Science · Chapter 3 · 10 Questions", "বিজ্ঞান · অধ্যায় ৩ · ১০টি প্রশ্ন"),
        emoji: "🧪",
      };
    }
    const m = PRACTICE_MODES.find((item) => item.id === modeId);
    return {
      title: m ? t(m.labelEn, m.labelBn) : t("Practice", "অনুশীলন"),
      desc: m ? t(m.descEn, m.descBn) : "",
      emoji: m ? m.emoji : "🎯",
    };
  };

  return (
    <PageShell
      title={t("Practice", "অনুশীলন")}
      subtitle={t("Pick a mode to start practicing", "অনুশীলন শুরু করতে একটি ধরন বেছে নাও")}
      action={<Pill tone="accent">🪙 {coins}</Pill>}
    >
      {/* Today's Recommended Set */}
      <SectionCard
        title={t("Today's Set", "আজকের সেট")}
        hint={<Pill tone="primary">{t("Daily Mix", "দৈনিক মিক্স")}</Pill>}
        className="gradient-card border-primary/30 shadow-soft"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">🧪</span>
              <p className="text-base font-extrabold text-foreground">
                {t("Science & Living Things", "বিজ্ঞান ও জীবজগৎ")}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("Chapter 3 · 10 questions · Mixed formats", "অধ্যায় ৩ · ১০টি প্রশ্ন · মিশ্র ধরন")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveMode("todays-set")}
            className="tap flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-soft hover:bg-primary/90 transition-all sm:w-auto w-full"
          >
            <Play className="size-4 fill-current" />
            <span>{t("Start Now", "এখনই শুরু")}</span>
          </button>
        </div>
      </SectionCard>

      {/* Mode Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        {PRACTICE_MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => setActiveMode(mode.id)}
            className="tap flex items-center gap-3.5 rounded-3xl border border-border bg-card/90 p-4 text-left shadow-soft hover:border-primary/50 hover:shadow-lift transition-all group active:scale-[0.98]"
          >
            <span
              className={`grid size-12 place-items-center rounded-2xl bg-gradient-to-br ${mode.accentColor} text-2xl shadow-xs group-hover:scale-105 transition-transform shrink-0`}
            >
              {mode.emoji}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <p className="text-sm font-bold text-foreground truncate">
                  {t(mode.labelEn, mode.labelBn)}
                </p>
                <span className="shrink-0 text-[11px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {t(mode.subEn, mode.subBn)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                {t(mode.descEn, mode.descBn)}
              </p>
            </div>
            <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
          </button>
        ))}
      </div>

      {/* Active Practice Session Runner */}
      {activeMode && (
        <PracticeSessionRunner
          modeId={activeMode}
          meta={getModeTitle(activeMode)}
          onClose={() => setActiveMode(null)}
          onFinish={handleFinishSession}
          coins={coins}
          lang={lang}
        />
      )}
    </PageShell>
  );
}

// -----------------------------------------------------------------------------
// Interactive Practice Session Runner Component
// -----------------------------------------------------------------------------

function PracticeSessionRunner({
  modeId,
  meta,
  onClose,
  onFinish,
  coins,
  lang,
}: {
  modeId: PracticeModeId;
  meta: { title: string; desc: string; emoji: string };
  onClose: () => void;
  onFinish: (earnedCoins: number) => void;
  coins: number;
  lang: "en" | "bn";
}) {
  const { t } = useApp();
  const [questions, setQuestions] = useState<PracticeQuestion[]>(() =>
    getQuestionsForMode(modeId),
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<any>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Timer for Quiz mode
  const [timeLeft, setTimeLeft] = useState(15);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQ = questions[currentIndex];
  const totalQuestions = questions.length;
  const progressPercent = Math.round((currentIndex / totalQuestions) * 100);

  // Reset or initialize question state
  const resetQuestionState = useCallback(() => {
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
    setIsCorrect(null);
    setTimeLeft(15);
  }, []);

  // Timer for Quiz mode
  useEffect(() => {
    if (modeId !== "quiz" || isAnswerChecked || isCompleted) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [modeId, currentIndex, isAnswerChecked, isCompleted]);

  const handleTimeOut = () => {
    if (isAnswerChecked || isCompleted) return;
    gameAudio.playWrong();
    setIsAnswerChecked(true);
    setIsCorrect(false);
    setStreak(0);
  };

  // Check answer function
  const handleCheckAnswer = (answer: any, correct: boolean) => {
    if (isAnswerChecked || isCompleted) return;

    setSelectedAnswer(answer);
    setIsAnswerChecked(true);
    setIsCorrect(correct);

    if (timerRef.current) clearInterval(timerRef.current);

    if (correct) {
      gameAudio.playCorrect();
      const currentStreak = streak + 1;
      setStreak(currentStreak);
      if (currentStreak > bestStreak) setBestStreak(currentStreak);

      const streakBonus = currentStreak >= 3 ? 20 : 0;
      const points = 100 + streakBonus;
      setScore((s) => s + points);

      const coinReward = currentStreak % 3 === 0 ? 5 : 2;
      setCoinsEarned((c) => c + coinReward);
      gameAudio.playCoin();
      setCorrectCount((cc) => cc + 1);
    } else {
      gameAudio.playWrong();
      setStreak(0);
    }
  };

  // Next question / Finish
  const handleNext = () => {
    if (currentIndex + 1 >= totalQuestions) {
      gameAudio.playWin();
      setIsCompleted(true);
      onFinish(coinsEarned);
    } else {
      setCurrentIndex((idx) => idx + 1);
      resetQuestionState();
    }
  };

  const handleRestart = () => {
    setQuestions(getQuestionsForMode(modeId));
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setCoinsEarned(0);
    setCorrectCount(0);
    setIsCompleted(false);
    resetQuestionState();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#F8FAFC] dark:bg-background max-w-[800px] mx-auto overflow-y-auto animate-in fade-in duration-200">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-card/95 px-4 py-3 sm:px-6 backdrop-blur shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onClose}
            className="tap grid size-10 shrink-0 place-items-center rounded-2xl border border-border bg-card text-foreground shadow-soft hover:bg-accent/40 transition-colors"
            aria-label={t("Back to practice modes", "অনুশীলনে ফিরে যান")}
          >
            <ArrowLeft className="size-5" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xl shrink-0">{meta.emoji}</span>
              <h1 className="text-base font-black text-foreground truncate">{meta.title}</h1>
            </div>
            <p className="text-xs text-muted-foreground truncate hidden xs:block">{meta.desc}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {streak >= 2 && (
            <span className="flex items-center gap-1 text-xs font-extrabold text-orange-500 bg-orange-500/10 px-2.5 py-1 rounded-full animate-bounce">
              <Flame className="size-3.5 fill-current" />
              {streak}x
            </span>
          )}
          <Pill tone="accent">🪙 {coins + coinsEarned}</Pill>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-xl mx-auto px-4 py-5 sm:px-6 pb-16">
        {!isCompleted ? (
          <div className="space-y-4">
            {/* Progress Bar & Question Counter */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                <span>
                  {t("Question", "প্রশ্ন")} {currentIndex + 1} / {totalQuestions}
                </span>
                <div className="flex items-center gap-3">
                  {modeId === "quiz" && (
                    <span
                      className={`flex items-center gap-1 font-mono ${
                        timeLeft <= 5 ? "text-destructive font-black animate-pulse" : "text-primary"
                      }`}
                    >
                      <Clock className="size-3.5" />
                      {timeLeft}s
                    </span>
                  )}
                  <span>
                    {t("Score", "স্কোর")}: {score}
                  </span>
                </div>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                  style={{
                    width: `${((currentIndex + (isAnswerChecked ? 1 : 0)) / totalQuestions) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Render Specific Question Component */}
            {currentQ && (
              <QuestionRenderer
                question={currentQ}
                lang={lang}
                isAnswerChecked={isAnswerChecked}
                selectedAnswer={selectedAnswer}
                isCorrect={isCorrect}
                onSelectAnswer={handleCheckAnswer}
              />
            )}

            {/* Answer Feedback & Explanation Card */}
            {isAnswerChecked && (
              <div
                className={`rounded-3xl p-4 sm:p-5 border transition-all animate-in fade-in slide-in-from-bottom-3 ${
                  isCorrect
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200"
                    : "bg-destructive/10 border-destructive/30 text-destructive-950 dark:text-rose-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <CheckCircle2 className="size-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="size-6 text-destructive shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-extrabold">
                      {isCorrect
                        ? t("Awesome! That's correct.", "চমৎকার! উত্তরটি সঠিক হয়েছে।")
                        : t("Not quite right!", "উত্তরটি সঠিক হয়নি!")}
                    </p>
                    {currentQ && (currentQ.explanationEn || currentQ.explanationBn) && (
                      <p className="text-xs leading-relaxed opacity-90">
                        {lang === "bn"
                          ? currentQ.explanationBn || currentQ.explanationEn
                          : currentQ.explanationEn || currentQ.explanationBn}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="tap mt-4 w-full flex items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-soft hover:bg-primary/90 transition-all"
                >
                  <span>
                    {currentIndex + 1 >= totalQuestions
                      ? t("View Results", "ফলাফল দেখুন")
                      : t("Next Question", "পরবর্তী প্রশ্ন")}
                  </span>
                  <ChevronRight className="size-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Completion Screen */
          <div className="py-6 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="mx-auto grid size-20 place-items-center rounded-3xl gradient-hero text-white shadow-lift text-4xl">
              <Trophy className="size-10 text-amber-300" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-foreground">
                {t("Practice Complete!", "অনুশীলন সম্পন্ন হয়েছে!")}
              </h2>
              <p className="text-xs text-muted-foreground">
                {t(
                  "Great job keeping your mind sharp and active today.",
                  "আজ চমৎকারভাবে অনুশীলন শেষ করেছো। চালিয়ে যাও!",
                )}
              </p>
            </div>

            {/* Stats Summary Grid */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="rounded-2xl border border-border bg-card p-3 shadow-soft">
                <p className="text-[11px] font-semibold text-muted-foreground">
                  {t("Score", "স্কোর")}
                </p>
                <p className="text-lg font-black text-primary mt-0.5">{score}</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-3 shadow-soft">
                <p className="text-[11px] font-semibold text-muted-foreground">
                  {t("Accuracy", "সঠিকতা")}
                </p>
                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {Math.round((correctCount / totalQuestions) * 100)}%
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-3 shadow-soft">
                <p className="text-[11px] font-semibold text-muted-foreground">
                  {t("Coins Won", "অর্জিত কয়েন")}
                </p>
                <p className="text-lg font-black text-amber-500 mt-0.5 flex items-center justify-center gap-1">
                  <span>+{coinsEarned}</span>
                  <span className="text-sm">🪙</span>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleRestart}
                className="tap w-full flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-soft hover:bg-primary/90 transition-all"
              >
                <RotateCcw className="size-4" />
                <span>{t("Practice Again", "আবার অনুশীলন করো")}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="tap w-full rounded-2xl border border-border bg-card py-3 text-sm font-bold text-foreground hover:bg-accent/30 transition-all"
              >
                {t("Back to Practice Menu", "অনুশীলন মেনুতে ফিরে যান")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Specialized Question Type Renderers
// -----------------------------------------------------------------------------

function QuestionRenderer({
  question,
  lang,
  isAnswerChecked,
  selectedAnswer,
  isCorrect,
  onSelectAnswer,
}: {
  question: PracticeQuestion;
  lang: "en" | "bn";
  isAnswerChecked: boolean;
  selectedAnswer: any;
  isCorrect: boolean | null;
  onSelectAnswer: (answer: any, correct: boolean) => void;
}) {
  const { t } = useApp();

  // MCQ / Listening / General Option Renderer
  if (question.type === "mcq" || question.type === "listening") {
    const q = question as McqQuestion | ListeningQuestion;
    const options = lang === "bn" ? q.optionsBn : q.optionsEn;

    return (
      <div className="space-y-4">
        {/* Listening Audio Cue */}
        {question.type === "listening" && (
          <div className="rounded-3xl border border-primary/30 bg-primary/5 p-4 text-center space-y-3">
            <p className="text-xs font-semibold text-primary">
              {t("Tap to hear the audio cue:", "অডিও শুনতে বোতামে চাপ দাও:")}
            </p>
            <button
              type="button"
              onClick={() => gameAudio.speak(question.audioText)}
              className="tap mx-auto flex items-center gap-2 rounded-full gradient-hero px-6 py-3 text-sm font-bold text-primary-foreground shadow-lift"
            >
              <Volume2 className="size-5" />
              <span>{t("Play Audio", "অডিও শুনুন")}</span>
            </button>
          </div>
        )}

        {/* Question Title */}
        <SectionCard className="border-border">
          <p className="text-xs font-bold uppercase text-primary tracking-wider">
            {question.type === "listening" ? t("Audio Question", "শোনা ও বোঝা") : t("Question", "প্রশ্ন")}
          </p>
          <h2 className="mt-1 text-base sm:text-lg font-bold text-foreground leading-snug">
            {lang === "bn" ? q.questionBn : q.questionEn}
          </h2>
        </SectionCard>

        {/* Options List */}
        <div className="grid grid-cols-1 gap-2.5">
          {options.map((opt, idx) => {
            const isSelected = selectedAnswer === idx;
            const isThisCorrect = idx === q.correctIndex;

            let buttonStyle = "border-border bg-card hover:border-primary/40";
            if (isAnswerChecked) {
              if (isThisCorrect) {
                buttonStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold";
              } else if (isSelected && !isThisCorrect) {
                buttonStyle = "border-destructive bg-destructive/10 text-destructive line-through";
              } else {
                buttonStyle = "border-border bg-card/60 opacity-60";
              }
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={isAnswerChecked}
                onClick={() => onSelectAnswer(idx, idx === q.correctIndex)}
                className={`tap flex items-center justify-between rounded-2xl border p-3.5 text-left text-sm font-semibold transition-all shadow-xs ${buttonStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-7 place-items-center rounded-xl bg-muted text-xs font-bold text-muted-foreground">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{opt}</span>
                </div>
                {isAnswerChecked && isThisCorrect && (
                  <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
                )}
                {isAnswerChecked && isSelected && !isThisCorrect && (
                  <XCircle className="size-5 text-destructive shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // True / False Renderer
  if (question.type === "true-false") {
    const q = question as TrueFalseQuestion;

    return (
      <div className="space-y-4">
        <SectionCard className="border-border">
          <p className="text-xs font-bold uppercase text-primary tracking-wider">
            {t("True or False", "সত্য নাকি মিথ্যা")}
          </p>
          <h2 className="mt-1 text-base sm:text-lg font-bold text-foreground leading-snug">
            {lang === "bn" ? q.questionBn : q.questionEn}
          </h2>
        </SectionCard>

        <div className="grid grid-cols-2 gap-3">
          {[
            { value: true, labelEn: "True", labelBn: "সত্য", icon: "✔️", color: "emerald" },
            { value: false, labelEn: "False", labelBn: "মিথ্যা", icon: "❌", color: "rose" },
          ].map((item) => {
            const isSelected = selectedAnswer === item.value;
            const isThisCorrect = item.value === q.isTrue;

            let style = "border-border bg-card hover:border-primary/50";
            if (isAnswerChecked) {
              if (isThisCorrect) {
                style = "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-extrabold";
              } else if (isSelected && !isThisCorrect) {
                style = "border-destructive bg-destructive/15 text-destructive";
              } else {
                style = "border-border bg-card/60 opacity-50";
              }
            }

            return (
              <button
                key={String(item.value)}
                type="button"
                disabled={isAnswerChecked}
                onClick={() => onSelectAnswer(item.value, item.value === q.isTrue)}
                className={`tap flex flex-col items-center justify-center gap-2 rounded-3xl border p-5 text-center transition-all shadow-soft ${style}`}
              >
                <span className="text-3xl">{item.icon}</span>
                <span className="text-base font-extrabold">{t(item.labelEn, item.labelBn)}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Fill in the Blank Renderer
  if (question.type === "fill-blank") {
    const q = question as FillBlankQuestion;
    const sentence = lang === "bn" ? q.sentenceBn : q.sentenceEn;
    const parts = sentence.split("___");
    const options = lang === "bn" ? q.optionsBn : q.optionsEn;
    const correctWord = lang === "bn" ? q.correctWordBn : q.correctWordEn;

    return (
      <div className="space-y-4">
        <SectionCard className="border-border">
          <p className="text-xs font-bold uppercase text-primary tracking-wider">
            {t("Fill in the blank", "শূন্যস্থান পূরণ")}
          </p>
          <div className="mt-3 rounded-2xl bg-muted/60 p-4 text-base font-bold leading-relaxed">
            {parts[0]}
            <span
              className={`inline-block mx-1 px-3 py-1 rounded-xl border font-black transition-all ${
                selectedAnswer !== null
                  ? isAnswerChecked
                    ? isCorrect
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300"
                      : "bg-destructive/20 border-destructive text-destructive"
                    : "bg-primary/20 border-primary text-primary"
                  : "bg-background border-dashed border-primary/60 text-muted-foreground"
              }`}
            >
              {selectedAnswer || "______"}
            </span>
            {parts[1]}
          </div>
        </SectionCard>

        {/* Word Options */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-muted-foreground">
            {t("Choose the correct word:", "সঠিক শব্দটি নির্বাচন করো:")}
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {options.map((opt, idx) => {
              const isSelected = selectedAnswer === opt;
              const isThisCorrect = opt === correctWord;

              let style = "border-border bg-card hover:border-primary/50";
              if (isAnswerChecked) {
                if (isThisCorrect) {
                  style = "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold";
                } else if (isSelected && !isThisCorrect) {
                  style = "border-destructive bg-destructive/15 text-destructive";
                } else {
                  style = "border-border bg-card/60 opacity-60";
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isAnswerChecked}
                  onClick={() => onSelectAnswer(opt, opt === correctWord)}
                  className={`tap rounded-2xl border p-3 text-center text-sm font-bold shadow-xs transition-all ${style}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Matching Pairs Renderer
  if (question.type === "matching") {
    return <MatchingQuestionView question={question} lang={lang} onFinish={onSelectAnswer} isAnswerChecked={isAnswerChecked} />;
  }

  // Speaking Pronunciation Practice Renderer
  if (question.type === "speaking") {
    return (
      <SpeakingQuestionView
        question={question}
        lang={lang}
        isAnswerChecked={isAnswerChecked}
        onSelectAnswer={onSelectAnswer}
      />
    );
  }

  return null;
}

// -----------------------------------------------------------------------------
// Interactive Matching Question Component
// -----------------------------------------------------------------------------

function MatchingQuestionView({
  question,
  lang,
  onFinish,
  isAnswerChecked,
}: {
  question: MatchingQuestion;
  lang: "en" | "bn";
  onFinish: (ans: any, correct: boolean) => void;
  isAnswerChecked: boolean;
}) {
  const { t } = useApp();
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<{ [leftIdx: number]: number }>({});
  const [rightItems, setRightItems] = useState<{ text: string; origIdx: number }[]>([]);

  // Shuffle right side on question load
  useEffect(() => {
    const shuffled = question.pairs
      .map((p, idx) => ({
        text: lang === "bn" ? p.right.bn : p.right.en,
        origIdx: idx,
      }))
      .sort(() => Math.random() - 0.5);
    setRightItems(shuffled);
    setMatchedPairs({});
    setSelectedLeft(null);
  }, [question, lang]);

  const handleLeftClick = (idx: number) => {
    if (isAnswerChecked || matchedPairs[idx] !== undefined) return;
    gameAudio.playTap();
    setSelectedLeft(idx);
  };

  const handleRightClick = (rightIdx: number, origIdx: number) => {
    if (isAnswerChecked || selectedLeft === null) return;

    if (selectedLeft === origIdx) {
      gameAudio.playCorrect();
      const nextMatched = { ...matchedPairs, [selectedLeft]: origIdx };
      setMatchedPairs(nextMatched);
      setSelectedLeft(null);

      // Check if all pairs matched
      if (Object.keys(nextMatched).length === question.pairs.length) {
        onFinish(nextMatched, true);
      }
    } else {
      gameAudio.playWrong();
      setSelectedLeft(null);
    }
  };

  return (
    <div className="space-y-4">
      <SectionCard className="border-border">
        <p className="text-xs font-bold uppercase text-primary tracking-wider">
          {t("Match the pairs", "জোড়া মিল করো")}
        </p>
        <p className="text-sm font-bold text-foreground mt-1">
          {lang === "bn" ? question.questionBn : question.questionEn}
        </p>
      </SectionCard>

      <div className="grid grid-cols-2 gap-3">
        {/* Left Column */}
        <div className="space-y-2">
          {question.pairs.map((p, idx) => {
            const isMatched = matchedPairs[idx] !== undefined;
            const isSelected = selectedLeft === idx;

            return (
              <button
                key={idx}
                type="button"
                disabled={isMatched || isAnswerChecked}
                onClick={() => handleLeftClick(idx)}
                className={`tap w-full rounded-2xl border p-3 text-left text-xs font-bold transition-all shadow-xs ${
                  isMatched
                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
                    : isSelected
                      ? "bg-primary/20 border-primary text-primary"
                      : "bg-card border-border hover:border-primary/50"
                }`}
              >
                {lang === "bn" ? p.left.bn : p.left.en}
              </button>
            );
          })}
        </div>

        {/* Right Column */}
        <div className="space-y-2">
          {rightItems.map((item, idx) => {
            const isMatched = Object.values(matchedPairs).includes(item.origIdx);

            return (
              <button
                key={idx}
                type="button"
                disabled={isMatched || isAnswerChecked}
                onClick={() => handleRightClick(idx, item.origIdx)}
                className={`tap w-full rounded-2xl border p-3 text-left text-xs font-bold transition-all shadow-xs ${
                  isMatched
                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
                    : selectedLeft !== null
                      ? "bg-primary/5 border-primary/30 hover:border-primary"
                      : "bg-card border-border"
                }`}
              >
                {item.text}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Interactive Speaking / Pronunciation Question Component
// -----------------------------------------------------------------------------

function SpeakingQuestionView({
  question,
  lang,
  isAnswerChecked,
  onSelectAnswer,
}: {
  question: SpeakingQuestion;
  lang: "en" | "bn";
  isAnswerChecked: boolean;
  onSelectAnswer: (ans: any, correct: boolean) => void;
}) {
  const { t } = useApp();
  const [isRecording, setIsRecording] = useState(false);
  const [aiScore, setAiScore] = useState<number | null>(null);

  const handleListenPrompt = () => {
    gameAudio.speak(question.targetPhraseEn);
  };

  const handleRecordMic = () => {
    if (isAnswerChecked || isRecording) return;
    setIsRecording(true);
    gameAudio.playTap();

    // Simulate AI speech recognition & scoring
    setTimeout(() => {
      setIsRecording(false);
      const generatedScore = Math.floor(Math.random() * 15) + 85; // 85% to 99%
      setAiScore(generatedScore);
      onSelectAnswer(generatedScore, generatedScore >= 80);
    }, 2000);
  };

  return (
    <div className="space-y-4">
      <SectionCard className="border-border text-center space-y-3">
        <p className="text-xs font-bold uppercase text-primary tracking-wider">
          {t("Speaking Practice", "উচ্চারণ ও কথা বলার অনুশীলন")}
        </p>

        <div className="py-2">
          <h2 className="text-xl sm:text-2xl font-black text-foreground">
            "{question.targetPhraseEn}"
          </h2>
          {question.ipa && <p className="text-xs text-muted-foreground mt-1">{question.ipa}</p>}
          <p className="text-xs font-semibold text-primary/80 mt-1">{question.targetPhraseBn}</p>
        </div>

        {/* Listen Audio Button */}
        <div className="flex justify-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleListenPrompt}
            className="tap flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/20 transition-all"
          >
            <Volume2 className="size-4" />
            <span>{t("Listen Pronunciation", "উচ্চারণ শোনো")}</span>
          </button>
        </div>
      </SectionCard>

      {/* Mic Action Section */}
      <div className="rounded-3xl border border-border bg-card p-6 text-center space-y-3 shadow-soft">
        <p className="text-xs text-muted-foreground">
          {isRecording
            ? t("Listening... Say the sentence now!", "শুনছি... এখন বাক্যটি মুখে বলো!")
            : t("Tap the mic and speak clearly:", "মাইকে ট্যাপ করে স্পষ্টভাবে বলো:")}
        </p>

        <div className="flex justify-center py-2">
          <button
            type="button"
            disabled={isAnswerChecked || isRecording}
            onClick={handleRecordMic}
            className={`tap grid size-20 place-items-center rounded-full shadow-lift transition-all ${
              isRecording
                ? "animate-pulse bg-destructive text-white scale-110"
                : isAnswerChecked
                  ? "bg-emerald-500 text-white"
                  : "gradient-sun text-accent-foreground hover:scale-105"
            }`}
          >
            <Mic className="size-8" />
          </button>
        </div>

        {aiScore && (
          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
              <Sparkles className="size-4" />
              {t("AI Pronunciation Score", "এআই স্কোর")}: {aiScore}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}