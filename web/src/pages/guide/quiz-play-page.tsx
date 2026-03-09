import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/* ─── Types & Mock Data ─── */

interface Question {
  id: number;
  text: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "건축허가를 받기 위해 가장 먼저 해야 하는 것은?",
    choices: [
      "시공사 선정",
      "건축설계 및 도면 작성",
      "인테리어 디자인 확정",
      "입주자 모집",
    ],
    correctIndex: 1,
    explanation:
      "건축허가 신청 전에 건축사를 통해 설계도면을 작성해야 합니다. 이 도면이 허가 심사의 핵심 자료가 됩니다.",
  },
  {
    id: 2,
    text: "건폐율이란 무엇을 의미하나요?",
    choices: [
      "건물 높이 대비 토지 면적의 비율",
      "대지면적 대비 건축면적의 비율",
      "총 세대수 대비 주차 대수의 비율",
      "건물 전체 면적 대비 녹지 면적의 비율",
    ],
    correctIndex: 1,
    explanation:
      "건폐율은 대지면적에 대한 건축면적(바닥면적)의 비율입니다. 토지를 얼마나 넓게 건물로 덮을 수 있는지를 나타냅니다.",
  },
  {
    id: 3,
    text: "다음 중 건축비에 포함되지 않는 항목은?",
    choices: [
      "설계비",
      "감리비",
      "토지 매입비",
      "시공비",
    ],
    correctIndex: 2,
    explanation:
      "토지 매입비는 건축비와 별도로 산정됩니다. 건축비에는 설계비, 감리비, 시공비, 인허가 비용 등이 포함됩니다.",
  },
  {
    id: 4,
    text: "용적률이 높을수록 어떤 영향이 있나요?",
    choices: [
      "건물을 더 넓게 지을 수 있다",
      "건물을 더 높게 지을 수 있다",
      "주차 공간이 더 넓어진다",
      "건물 외관이 더 아름다워진다",
    ],
    correctIndex: 1,
    explanation:
      "용적률은 대지면적 대비 건물 연면적의 비율입니다. 용적률이 높을수록 더 많은 층을 쌓아 건물을 높게 지을 수 있습니다.",
  },
  {
    id: 5,
    text: "건축 감리의 주요 역할은?",
    choices: [
      "건축 디자인 결정",
      "시공 과정의 품질 및 안전 관리",
      "건축 자재 직접 구매",
      "입주자 선정 및 관리",
    ],
    correctIndex: 1,
    explanation:
      "건축 감리는 설계도대로 시공이 이루어지는지 확인하고, 품질과 안전을 관리하는 역할을 합니다.",
  },
];

const TOTAL_TIME = 60;
const PASS_SCORE = 60;

/* ─── Page ─── */

export default function QuizPlayPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(QUESTIONS.length).fill(null)
  );
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [isAnswered, setIsAnswered] = useState(false);

  const question = QUESTIONS[currentQuestion];
  const isLast = currentQuestion === QUESTIONS.length - 1;

  // Timer
  useEffect(() => {
    if (showResult) return;
    if (timeLeft <= 0) {
      handleTimeUp();
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, showResult]);

  const handleTimeUp = useCallback(() => {
    if (!isAnswered) {
      setIsAnswered(true);
    }
  }, [isAnswered]);

  function handleSelect(index: number) {
    if (isAnswered) return;
    setSelectedAnswer(index);
    setIsAnswered(true);
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = index;
    setAnswers(newAnswers);
  }

  function handleNext() {
    if (isLast) {
      setShowResult(true);
      return;
    }
    setCurrentQuestion((q) => q + 1);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setTimeLeft(TOTAL_TIME);
  }

  // Scoring
  const correctCount = answers.filter(
    (a, i) => a === QUESTIONS[i].correctIndex
  ).length;
  const score = Math.round((correctCount / QUESTIONS.length) * 100);
  const passed = score >= PASS_SCORE;

  // Timer bar colors
  const timerPercent = (timeLeft / TOTAL_TIME) * 100;
  const timerColor =
    timeLeft <= 5
      ? "bg-red-500"
      : timeLeft <= 15
        ? "bg-orange-400"
        : "bg-primary";

  if (showResult) {
    return (
      <div className="min-h-svh bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-card rounded-2xl ring-1 ring-black/[0.08] shadow-sm p-8 text-center space-y-6">
          <div
            className={`mx-auto flex size-20 items-center justify-center rounded-full text-3xl font-bold text-white ${
              passed ? "bg-emerald-500" : "bg-red-500"
            }`}
          >
            {score}
          </div>
          <div>
            <h2 className="text-xl font-bold mb-1">
              {passed ? "축하합니다! 통과!" : "아쉬워요, 다시 도전!"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {QUESTIONS.length}문제 중 {correctCount}문제 정답 ({score}점)
            </p>
          </div>
          <div className="space-y-3">
            {QUESTIONS.map((q, i) => (
              <div
                key={q.id}
                className="flex items-center gap-3 text-sm text-left"
              >
                {answers[i] === q.correctIndex ? (
                  <Check className="size-4 text-emerald-500 shrink-0" />
                ) : (
                  <X className="size-4 text-red-500 shrink-0" />
                )}
                <span className="text-muted-foreground truncate">
                  Q{i + 1}. {q.text}
                </span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1 rounded-xl" asChild>
              <Link to="/guide/quiz">스테이지 맵으로</Link>
            </Button>
            {passed && (
              <Button className="flex-1 rounded-xl" asChild>
                <Link to="/guide/quiz">다음 단계로</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-background">
      {/* ── Timer Bar ── */}
      <div className="sticky top-0 z-50 bg-card shadow-xs">
        <div className="h-1.5 w-full bg-muted">
          <div
            className={`h-full transition-all duration-1000 ease-linear ${timerColor}`}
            style={{ width: `${timerPercent}%` }}
          />
        </div>
        <div className="mx-auto flex max-w-[1120px] items-center justify-between px-6 py-3">
          <Link
            to="/guide/quiz"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            그만두기
          </Link>
          <span className="text-sm font-medium tabular-nums">
            {timeLeft}초
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-[640px] px-6 py-8">
        {/* ── Question Indicator Dots ── */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {QUESTIONS.map((_, i) => (
            <div
              key={i}
              className={`size-2.5 rounded-full transition-all ${
                i === currentQuestion
                  ? "bg-primary scale-125"
                  : i < currentQuestion
                    ? "bg-emerald-500"
                    : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* ── Question Card ── */}
        <div className="bg-card rounded-2xl ring-1 ring-black/[0.08] shadow-sm p-6 mb-6">
          <p className="text-xs text-muted-foreground mb-2">
            Q{currentQuestion + 1}. / {QUESTIONS.length}문제
          </p>
          <h2 className="text-lg font-bold leading-relaxed mb-6">
            {question.text}
          </h2>

          <div className="space-y-3">
            {question.choices.map((choice, i) => {
              const isCorrect = i === question.correctIndex;
              const isSelected = selectedAnswer === i;
              let choiceStyle =
                "ring-1 ring-black/[0.08] rounded-xl p-4 cursor-pointer hover:bg-muted/50 transition-all";

              if (isAnswered) {
                if (isCorrect) {
                  choiceStyle =
                    "ring-2 ring-emerald-500 bg-emerald-50 rounded-xl p-4";
                } else if (isSelected && !isCorrect) {
                  choiceStyle =
                    "ring-2 ring-red-500 bg-red-50 rounded-xl p-4";
                } else {
                  choiceStyle =
                    "ring-1 ring-black/[0.08] rounded-xl p-4 opacity-50";
                }
              }

              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={isAnswered}
                  className={`w-full text-left flex items-center gap-3 ${choiceStyle}`}
                >
                  <span
                    className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      isAnswered && isCorrect
                        ? "bg-emerald-500 text-white"
                        : isAnswered && isSelected && !isCorrect
                          ? "bg-red-500 text-white"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isAnswered && isCorrect ? (
                      <Check className="size-3.5" />
                    ) : isAnswered && isSelected && !isCorrect ? (
                      <X className="size-3.5" />
                    ) : (
                      String.fromCharCode(65 + i)
                    )}
                  </span>
                  <span className="text-sm font-medium">{choice}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Explanation ── */}
        {isAnswered && (
          <div className="bg-card rounded-2xl ring-1 ring-black/[0.08] shadow-sm p-6 mb-6">
            <p className="text-xs font-semibold text-primary mb-2">해설</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {question.explanation}
            </p>
          </div>
        )}

        {/* ── Next Button ── */}
        {isAnswered && (
          <Button onClick={handleNext} className="w-full rounded-xl" size="lg">
            {isLast ? "결과 보기" : "다음 문제"}
          </Button>
        )}
      </div>
    </div>
  );
}
