import { useState, useEffect } from 'react';
import { getFromStorage } from '../utils/storage';

export default function CommandHistory({ dayNumber }) {
  const [history, setHistory] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const mistakes = getFromStorage('linuxQuest_mistakes', []);
      
      // データ形式の検証
      if (!Array.isArray(mistakes)) {
        console.warn('Invalid mistakes data in CommandHistory');
        setHistory([]);
        return;
      }
      
      const dayMistakes = mistakes.filter(m => 
        m && typeof m === 'object' && m.day === dayNumber
      );
      
      setHistory(dayMistakes);
      setError(null);
    } catch (err) {
      console.error('Error loading command history:', err);
      setError('履歴の読み込みに失敗しました');
      setHistory([]);
    }
  }, [dayNumber]);

  // エラー表示
  if (error) {
    return (
      <div className="mt-4 p-2 bg-yellow-900 border border-yellow-600 rounded">
        <p className="text-yellow-200 text-sm">⚠️ {error}</p>
      </div>
    );
  }

  if (history.length === 0) return null;

  return (
    <div className="mt-4">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="text-gray-400 hover:text-white text-sm flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
        aria-expanded={isVisible}
        aria-label={`試行履歴を${isVisible ? '隠す' : '表示'}`}
      >
        📝 試行履歴 ({history.length}件) 
        <span className="ml-1" aria-hidden="true">{isVisible ? '▼' : '▶'}</span>
      </button>
      
      {isVisible && (
        <div className="mt-2 bg-gray-800 rounded p-3 max-h-32 overflow-y-auto">
          <div className="text-xs text-gray-400 mb-2">これまでの入力:</div>
          {history.map((item, idx) => (
            <div key={idx} className="text-sm text-gray-300 mb-1 font-mono">
              <span className="text-red-400">$ </span>
              <span className="break-all">{item.userInput || '(不正な入力)'}</span>
              <span className="text-gray-500 ml-2">({item.attempts || 1}回)</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}