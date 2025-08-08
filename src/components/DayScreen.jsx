import { useState } from "react";
import { validateInput } from "../utils/validateInput";
import { logMistake } from "../utils/logMistake";
import { setToStorage } from "../utils/storage";
import CommandHistory from "./CommandHistory";

export default function DayScreen({ day, onNext }) {
  const [input, setInput] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [hint, setHint] = useState("");

  const checkAnswer = () => {
    try {
      if (!input.trim()) {
        setHint("コマンドを入力してください");
        return;
      }

      const result = validateInput(input, day.expected_commands);
      setIsCorrect(result.match);
      
      if (result.match) {
        // 進捗を安全に保存
        if (!setToStorage("linuxQuest_currentDay", String(day.day))) {
          console.warn("Failed to save progress");
        }
        
        // 統計更新のイベントを発火
        window.dispatchEvent(new CustomEvent('linuxQuestDataUpdate'));
        
        setHint("");
      } else {
        // ミスを記録
        logMistake(input, day.day, day.expected_commands);
        setHint(result.hint);
      }
    } catch (error) {
      console.error("Error checking answer:", error);
      setHint("コマンドの実行でエラーが発生しました。もう一度お試しください。");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isCorrect) {
      checkAnswer();
    }
  };

  return (
    <div className="w-full max-w-md sm:max-w-xl mx-auto p-4 sm:p-6 bg-gray-900 text-white rounded shadow-md">
      <header>
        <h1 className="text-xl sm:text-2xl font-bold mb-2">🧭 Day{day.day}: {day.title}</h1>
        <p className="mb-4 text-green-300 text-sm sm:text-base">{day.story}</p>
      </header>

      {!isCorrect && (
        <main>
          <p className="mb-2 text-yellow-200 text-sm sm:text-base" id="challenge-description">{day.challenge_text}</p>
          <div className="mb-4 p-2 bg-gray-800 rounded border border-gray-600 focus-within:border-blue-500 transition-colors">
            <label className="sr-only" htmlFor="command-input">Linuxコマンド入力欄</label>
            <span className="text-green-400" aria-hidden="true">$ </span>
            <input
              id="command-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="コマンドを入力してEnterキーで実行"
              className="bg-transparent text-white outline-none flex-1 w-full text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
              autoFocus
              aria-describedby="challenge-description hint-text"
              aria-invalid={hint ? "true" : "false"}
            />
          </div>
          <button
            onClick={checkAnswer}
            disabled={!input.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded text-sm sm:text-base transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            aria-describedby="challenge-description"
          >
            実行！
          </button>
          {hint && (
            <div 
              id="hint-text"
              className="mt-2 p-2 bg-yellow-800 text-yellow-100 rounded text-sm sm:text-base"
              role="alert"
              aria-live="polite"
            >
              💡 {hint}
            </div>
          )}
          
          <CommandHistory dayNumber={day.day} />
        </main>
      )}

      {isCorrect && (
        <section className="bg-green-800 mt-6 p-4 rounded shadow text-sm sm:text-base" role="region" aria-labelledby="success-heading">
          <h2 id="success-heading" className="sr-only">学習完了</h2>
          <div role="alert" aria-live="polite">
            <p className="font-semibold text-green-200 mb-2">✅ {day.followup}</p>
          </div>
          <p className="text-green-100">🛠️ この知識でできること：</p>
          <p className="text-green-100 italic mt-1">{day.real_world_use}</p>

          <button
            onClick={onNext}
            className="mt-4 w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm sm:text-base transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-green-800"
            aria-label={day.day === 8 ? "ホームに戻る" : "次のDayに進む"}
          >
            {day.day === 8 ? "🏠 ホームに戻る" : "▶ 次のDayへ"}
          </button>
        </section>
      )}
    </div>
  );
}