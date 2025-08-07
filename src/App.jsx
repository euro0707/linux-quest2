import { useState, useEffect } from 'react';
import ChapterSelect from './components/ChapterSelect';
import SlideScreen from './components/SlideScreen';
import DayScreen from './components/DayScreen';
import ProgressStats from './components/ProgressStats';
import SettingsPanel from './components/SettingsPanel';
import SkipLink from './components/SkipLink';
import { getFromStorage, setToStorage, removeFromStorage } from './utils/storage';
import data from './data/integrated_linux_quest_data.json';

function App() {
  const [currentScreen, setCurrentScreen] = useState('select'); // 'select', 'slide', or 'day'
  const [selectedDay, setSelectedDay] = useState(0);
  const [unlockedDays, setUnlockedDays] = useState(0);
  const [slideProgress, setSlideProgress] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // データと進捗の初期化
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setLoading(true);
      setError(null);

      // データの検証
      if (!data || typeof data !== 'object') {
        throw new Error('学習データの読み込みに失敗しました');
      }

      const totalDays = Object.keys(data).length;
      if (totalDays === 0) {
        throw new Error('学習コンテンツが見つかりません');
      }

      // ローカルストレージから進捗を安全に読み込み
      const savedProgress = getFromStorage('linuxQuest_currentDay', '0');
      const savedSlideProgress = getFromStorage('linuxQuest_slideProgress', {});
      
      // 進捗データの検証
      const progress = parseInt(savedProgress);
      if (isNaN(progress) || progress < 0) {
        console.warn('Invalid progress data, resetting to 0');
        setUnlockedDays(0);
      } else {
        setUnlockedDays(Math.min(progress, totalDays - 1));
      }
      
      // スライド進捗の検証
      if (typeof savedSlideProgress === 'object' && savedSlideProgress !== null) {
        setSlideProgress(savedSlideProgress);
      } else {
        console.warn('Invalid slide progress data, resetting');
        setSlideProgress({});
      }

    } catch (err) {
      console.error('App initialization failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDay = (dayIndex) => {
    setSelectedDay(dayIndex);
    // スライドが完了済みの場合は直接ゲーム画面へ、未完了の場合はスライドから開始
    const dayKey = `day${dayIndex + 1}`;
    
    
    if (slideProgress[dayKey]) {
      setCurrentScreen('day');
    } else {
      setCurrentScreen('slide');
    }
  };

  const handleSlideComplete = () => {
    try {
      const dayKey = `day${selectedDay + 1}`;
      const newSlideProgress = { ...slideProgress, [dayKey]: true };
      setSlideProgress(newSlideProgress);
      
      if (!setToStorage('linuxQuest_slideProgress', newSlideProgress)) {
        console.warn('Failed to save slide progress');
      }
      
      // 統計更新のイベントを発火
      window.dispatchEvent(new CustomEvent('linuxQuestDataUpdate'));
      
      setCurrentScreen('day');
    } catch (err) {
      console.error('Error completing slide:', err);
    }
  };

  const handleNext = () => {
    const nextDayIndex = selectedDay + 1;
    if (nextDayIndex < Object.keys(data).length) {
      setUnlockedDays(Math.max(unlockedDays, nextDayIndex));
      setSelectedDay(nextDayIndex);
      // 次のDayのスライドから開始
      setCurrentScreen('slide');
    } else {
      // 全ての日を完了した場合
      setCurrentScreen('select');
    }
  };

  const handleBackToSelect = () => {
    setCurrentScreen('select');
  };

  const handleProgressReset = () => {
    try {
      // 状態を完全にリセット
      setUnlockedDays(0);
      setSelectedDay(0);
      setSlideProgress({});
      
      // ストレージをクリア
      removeFromStorage('linuxQuest_slideProgress');
      removeFromStorage('linuxQuest_currentDay');
      removeFromStorage('linuxQuest_mistakes');
      
      // カスタムイベントを発火して統計表示を更新
      window.dispatchEvent(new CustomEvent('linuxQuestDataUpdate'));
      
      // 選択画面に戻る
      setCurrentScreen('select');
      
    } catch (err) {
      console.error('Error resetting progress:', err);
    }
  };

  // ローディング画面
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Linux Quest を読み込み中...</p>
        </div>
      </div>
    );
  }

  // エラー画面
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4 flex items-center justify-center">
        <div className="bg-red-900 border border-red-600 rounded-lg p-6 max-w-md text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-white text-xl font-bold mb-2">エラーが発生しました</h2>
          <p className="text-red-200 mb-4">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              initializeApp();
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4 flex items-center justify-center">
      <SkipLink targetId="main-content">メインコンテンツにスキップ</SkipLink>
      <div className="w-full max-w-4xl" id="main-content">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            🚀 Linux Quest
          </h1>
          <p className="text-gray-300 text-sm sm:text-base">
            稼げる武器を手に入れる7日間
          </p>
        </div>

        {/* メインコンテンツ */}
        {currentScreen === 'select' ? (
          <div>
            <ChapterSelect 
              currentDay={unlockedDays} 
              onSelectDay={handleSelectDay} 
            />
            
            {/* 進捗表示 */}
            <div className="mt-6 text-center">
              <div className="text-white text-sm sm:text-base mb-2">
                進捗: {unlockedDays + 1} / {Object.keys(data).length} Days
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 max-w-md mx-auto">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((unlockedDays + 1) / Object.keys(data).length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* 詳細統計表示 */}
            <ProgressStats />
            
            {/* 設定パネル */}
            <SettingsPanel onProgressReset={handleProgressReset} />
          </div>
        ) : currentScreen === 'slide' ? (
          <SlideScreen 
            day={data[`day${selectedDay + 1}`]} 
            onComplete={handleSlideComplete}
            onBack={handleBackToSelect}
          />
        ) : (
          <div>
            {/* 戻るボタン */}
            <div className="mb-4">
              <button 
                onClick={handleBackToSelect}
                className="text-gray-400 hover:text-white text-sm flex items-center"
              >
                ← チャプター選択に戻る
              </button>
            </div>
            
            <DayScreen 
              day={data[`day${selectedDay + 1}`]} 
              onNext={handleNext} 
            />
          </div>
        )}

        {/* フッター */}
        <div className="mt-8 text-center text-gray-500 text-xs">
          <p>Linux Quest - Built with React & Tailwind CSS</p>
        </div>
      </div>
    </div>
  );
}

export default App;