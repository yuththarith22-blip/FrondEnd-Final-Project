import { useState, useEffect, useRef, useCallback } from "react";
import { TIMER_SECS } from "../data/topics";

export function useQuiz(questions) {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECS);
  const [selected, setSelected] = useState(null); // index user picked
  const [timings, setTimings] = useState([]);
  const [results, setResults] = useState([]);
  const [phase, setPhase] = useState("question"); // "question" | "feedback" | "done"

  const timerRef = useRef(null);
  const startRef = useRef(Date.now());

  const stopTimer = useCallback(() => clearInterval(timerRef.current), []);

  const startTimer = useCallback(() => {
    stopTimer();
    setTimeLeft(TIMER_SECS);
    startRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, [stopTimer]);

  // Auto time-up
  useEffect(() => {
    if (timeLeft === 0 && !answered) {
      handleTimeUp();
    }
  }, [timeLeft, answered]);

  const handleTimeUp = useCallback(() => {
    stopTimer();
    setAnswered(true);
    setSelected(null);
    const q = questions[current];
    setTimings((t) => [...t, TIMER_SECS]);
    setResults((r) => [...r, { q: q.q, correct: false, correctAns: q.opts[q.ans], yourAns: "—" }]);
    setPhase("feedback");
  }, [current, questions, stopTimer]);

  const answer = useCallback(
    (idx) => {
      if (answered) return;
      stopTimer();
      setAnswered(true);
      setSelected(idx);
      const elapsed = Math.round((Date.now() - startRef.current) / 1000);
      const q = questions[current];
      const correct = idx === q.ans;
      if (correct) setScore((s) => s + 1);
      setTimings((t) => [...t, elapsed]);
      setResults((r) => [...r, { q: q.q, correct, correctAns: q.opts[q.ans], yourAns: q.opts[idx] }]);
      setPhase("feedback");
    },
    [answered, current, questions, stopTimer]
  );

  const next = useCallback(() => {
    if (current + 1 >= questions.length) {
      setPhase("done");
    } else {
      setCurrent((c) => c + 1);
      setAnswered(false);
      setSelected(null);
      setPhase("question");
    }
  }, [current, questions.length]);

  // Start timer on new question
  useEffect(() => {
    if (phase === "question") startTimer();
    return () => stopTimer();
  }, [current, phase]);

  const avgTime = timings.length ? Math.round(timings.reduce((a, b) => a + b, 0) / timings.length) : 0;
  const pct = Math.round((score / questions.length) * 100);

  return {
    current,
    score,
    answered,
    timeLeft,
    selected,
    results,
    phase,
    avgTime,
    pct,
    answer,
    next,
  };
}
