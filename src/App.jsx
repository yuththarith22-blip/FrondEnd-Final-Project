import { useState } from "react";
import StartScreen from "./components/StartScreen";
import QuizScreen from "./components/QuizScreen";
import ResultsScreen from "./components/ResultsScreen";
import { topics } from "./data/topics";

const SCREENS = { START: "start", QUIZ: "quiz", RESULTS: "results" };

export default function App() {
  const [screen, setScreen] = useState(SCREENS.START);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [finalStats, setFinalStats] = useState(null);

  const handleStart = (topic) => {
    setSelectedTopic(topic);
    setScreen(SCREENS.QUIZ);
  };

  const handleFinish = (stats) => {
    setFinalStats(stats);
    setScreen(SCREENS.RESULTS);
  };

  const handleRestart = () => {
    setSelectedTopic(null);
    setFinalStats(null);
    setScreen(SCREENS.START);
  };

  return (
    <>
      {screen === SCREENS.START && (
        <StartScreen onStart={handleStart} />
      )}

      {screen === SCREENS.QUIZ && selectedTopic && (
        <QuizScreen
          key={selectedTopic}
          topic={selectedTopic}
          questions={topics[selectedTopic].questions}
          onFinish={handleFinish}
        />
      )}

      {screen === SCREENS.RESULTS && finalStats && (
        <ResultsScreen
          topic={selectedTopic}
          {...finalStats}
          onRestart={handleRestart}
        />
      )}
    </>
  );
}
