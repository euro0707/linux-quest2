import { useState, useEffect } from 'react';

export default function ProgressStats() {
  const [stats, setStats] = useState({
    totalAttempts: 0,
    totalMistakes: 0,
    completedDays: 0,
    accuracy: 100
  });

  useEffect(() => {
    const mistakes = JSON.parse(localStorage.getItem('linuxQuest_mistakes') || '[]');
    const currentDay = parseInt(localStorage.getItem('linuxQuest_currentDay') || '0');
    
    const totalMistakes = mistakes.reduce((sum, m) => sum + m.attempts, 0);
    const totalAttempts = totalMistakes + Math.max(currentDay, 1);
    const accuracy = totalAttempts > 0 ? Math.round(((totalAttempts - totalMistakes) / totalAttempts) * 100) : 100;
    
    setStats({
      totalAttempts,
      totalMistakes,
      completedDays: currentDay,
      accuracy
    });
  }, []);

  return (
    <div className="bg-gray-800 rounded-lg p-4 mt-6">
      <h3 className="text-lg font-semibold text-white mb-3">📊 学習統計</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">{stats.completedDays}</div>
          <div className="text-xs text-gray-400">完了Days</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{stats.accuracy}%</div>
          <div className="text-xs text-gray-400">正答率</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">{stats.totalAttempts}</div>
          <div className="text-xs text-gray-400">総試行数</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-400">{stats.totalMistakes}</div>
          <div className="text-xs text-gray-400">ミス回数</div>
        </div>
      </div>
    </div>
  );
}