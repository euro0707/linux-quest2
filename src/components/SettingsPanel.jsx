import { useState } from 'react';
import { getFromStorage, removeFromStorage } from '../utils/storage';

export default function SettingsPanel({ onProgressReset }) {
  const [isOpen, setIsOpen] = useState(false);
  
  // デバッグ用：コンソールに表示確認
  console.log('SettingsPanel rendered');

  const handleResetProgress = () => {
    if (window.confirm('学習進捗をリセットしますか？この操作は元に戻せません。')) {
      // 安全にデータを削除
      removeFromStorage('linuxQuest_currentDay');
      removeFromStorage('linuxQuest_mistakes');
      removeFromStorage('linuxQuest_slideProgress');
      
      // 親コンポーネントのリセット処理を呼び出し
      onProgressReset();
      setIsOpen(false);
      alert('学習進捗がリセットされました！');
    }
  };

  const exportData = () => {
    try {
      const mistakes = getFromStorage('linuxQuest_mistakes', []);
      const currentDay = getFromStorage('linuxQuest_currentDay', '0');
    
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
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('データのエクスポートに失敗しました。');
    }
  };

  try {
    return (
      <div className="mt-4 border border-gray-600 rounded p-2">
        <div className="text-xs text-gray-500 mb-1">設定パネル (テスト表示)</div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-400 hover:text-white text-sm flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
          aria-expanded={isOpen}
          aria-label="設定メニューを開く"
        >
          ⚙️ 設定 {isOpen ? '▼' : '▶'}
        </button>
        
        {isOpen && (
          <div className="mt-2 bg-gray-800 rounded p-3 space-y-2">
            <button
              onClick={exportData}
              className="w-full text-left text-sm text-blue-400 hover:text-blue-300 p-2 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              📥 学習データをエクスポート
            </button>
            <button
              onClick={handleResetProgress}
              className="w-full text-left text-sm text-red-400 hover:text-red-300 p-2 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              🔄 学習進捗をリセット
            </button>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('SettingsPanel render error:', error);
    return (
      <div className="mt-4 bg-red-900 border border-red-600 rounded p-2">
        <div className="text-red-200 text-sm">設定パネルでエラーが発生しました</div>
        <button
          onClick={() => {
            if (window.confirm('学習進捗をリセットしますか？')) {
              onProgressReset();
              alert('リセットしました');
            }
          }}
          className="mt-2 bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded"
        >
          緊急リセット
        </button>
      </div>
    );
  }
}