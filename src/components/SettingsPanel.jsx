import { useState } from 'react';

export default function SettingsPanel({ onProgressReset }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleResetProgress = () => {
    if (window.confirm('学習進捗をリセットしますか？この操作は元に戻せません。')) {
      localStorage.removeItem('linuxQuest_currentDay');
      localStorage.removeItem('linuxQuest_mistakes');
      onProgressReset();
      setIsOpen(false);
      alert('学習進捗がリセットされました！');
    }
  };

  const exportData = () => {
    const mistakes = JSON.parse(localStorage.getItem('linuxQuest_mistakes') || '[]');
    const currentDay = localStorage.getItem('linuxQuest_currentDay') || '0';
    
    const exportData = {
      currentDay: parseInt(currentDay),
      mistakes: mistakes,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `linux-quest-progress-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-400 hover:text-white text-sm flex items-center"
      >
        ⚙️ 設定 {isOpen ? '▼' : '▶'}
      </button>
      
      {isOpen && (
        <div className="mt-2 bg-gray-800 rounded p-3 space-y-2">
          <button
            onClick={exportData}
            className="w-full text-left text-sm text-blue-400 hover:text-blue-300 p-2 rounded hover:bg-gray-700"
          >
            📥 学習データをエクスポート
          </button>
          <button
            onClick={handleResetProgress}
            className="w-full text-left text-sm text-red-400 hover:text-red-300 p-2 rounded hover:bg-gray-700"
          >
            🔄 学習進捗をリセット
          </button>
        </div>
      )}
    </div>
  );
}