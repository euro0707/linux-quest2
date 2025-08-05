import { useState, useEffect } from 'react';

export default function CommandHistory({ dayNumber }) {
  const [history, setHistory] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const mistakes = JSON.parse(localStorage.getItem('linuxQuest_mistakes') || '[]');
    const dayMistakes = mistakes.filter(m => m.day === dayNumber);
    setHistory(dayMistakes);
  }, [dayNumber]);

  if (history.length === 0) return null;

  return (
    <div className="mt-4">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="text-gray-400 hover:text-white text-sm flex items-center"
      >
        📝 試行履歴 ({history.length}件) 
        <span className="ml-1">{isVisible ? '▼' : '▶'}</span>
      </button>
      
      {isVisible && (
        <div className="mt-2 bg-gray-800 rounded p-3 max-h-32 overflow-y-auto">
          <div className="text-xs text-gray-400 mb-2">これまでの入力:</div>
          {history.map((item, idx) => (
            <div key={idx} className="text-sm text-gray-300 mb-1 font-mono">
              <span className="text-red-400">$ </span>
              {item.userInput}
              <span className="text-gray-500 ml-2">({item.attempts}回)</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}