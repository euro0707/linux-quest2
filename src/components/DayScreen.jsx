import { useState } from "react";
import { validateInput } from "../utils/validateInput";
import { logMistake } from "../utils/logMistake";
import CommandHistory from "./CommandHistory";

export default function DayScreen({ day, onNext }) {
  const [input, setInput] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [hint, setHint] = useState("");

  const checkAnswer = () => {
    const result = validateInput(input, day.expected_commands);
    setIsCorrect(result.match);
    if (result.match) {
      localStorage.setItem("linuxQuest_currentDay", String(day.day));
      setHint("");
    } else {
      logMistake(input, day.day, day.expected_commands);
      setHint(result.hint);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isCorrect) {
      checkAnswer();
    }
  };

  return (
    <div className="w-full max-w-md sm:max-w-xl mx-auto p-4 sm:p-6 bg-gray-900 text-white rounded shadow-md">
      <h1 className="text-xl sm:text-2xl font-bold mb-2">🧭 Day{day.day}: {day.title}</h1>
      <p className="mb-4 text-green-300 text-sm sm:text-base">{day.story}</p>

      {!isCorrect && (
        <>
          <p className="mb-2 text-yellow-200 text-sm sm:text-base">{day.challenge_text}</p>
          <div className="mb-4 p-2 bg-gray-800 rounded border border-gray-600 focus-within:border-blue-500 transition-colors">
            <span className="text-green-400">$ </span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="コマンドを入力してEnterキーで実行"
              className="bg-transparent text-white outline-none flex-1 w-full text-sm sm:text-base"
              autoFocus
              aria-label="Linuxコマンド入力欄"
            />
          </div>
          <button
            onClick={checkAnswer}
            className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm sm:text-base transition-colors"
          >
            実行！
          </button>
          {hint && (
            <div className="mt-2 p-2 bg-yellow-800 text-yellow-100 rounded text-sm sm:text-base">
              💡 {hint}
            </div>
          )}
          
          <CommandHistory dayNumber={day.day} />
        </>
      )}

      {isCorrect && (
        <div className="bg-green-800 mt-6 p-4 rounded shadow text-sm sm:text-base">
          <p className="font-semibold text-green-200 mb-2">✅ {day.followup}</p>
          <p className="text-green-100">🛠️ この知識でできること：</p>
          <p className="text-green-100 italic mt-1">{day.real_world_use}</p>

          <button
            onClick={onNext}
            className="mt-4 w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm sm:text-base transition-colors"
          >
            ▶ 次のDayへ
          </button>
        </div>
      )}
    </div>
  );
}