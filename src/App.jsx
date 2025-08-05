import { useState, useEffect } from 'react';
import ChapterSelect from './components/ChapterSelect';
import SlideScreen from './components/SlideScreen';
import DayScreen from './components/DayScreen';
import ProgressStats from './components/ProgressStats';
import SettingsPanel from './components/SettingsPanel';
import data from './data/integrated_linux_quest_data.json';

function App() {
  const [currentScreen, setCurrentScreen] = useState('select'); // 'select', 'slide', or 'day'
  const [selectedDay, setSelectedDay] = useState(0);
  const [unlockedDays, setUnlockedDays] = useState(0);
  const [slideProgress, setSlideProgress] = useState({});

  useEffect(() => {
    // ローカルストレージから進捗を読み込み
    const savedProgress = localStorage.getItem('linuxQuest_currentDay');
    const savedSlideProgress = localStorage.getItem('linuxQuest_slideProgress');
    
    if (savedProgress) {
      const progress = parseInt(savedProgress);
      setUnlockedDays(Math.min(progress, Object.keys(data).length - 1));
    }
    
    if (savedSlideProgress) {
      setSlideProgress(JSON.parse(savedSlideProgress));
    }
  }, []);

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
    const dayKey = `day${selectedDay + 1}`;
    const newSlideProgress = { ...slideProgress, [dayKey]: true };
    setSlideProgress(newSlideProgress);
    localStorage.setItem('linuxQuest_slideProgress', JSON.stringify(newSlideProgress));
    setCurrentScreen('day');
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
    setUnlockedDays(0);
    setSelectedDay(0);
    setSlideProgress({});
    localStorage.removeItem('linuxQuest_slideProgress');
    setCurrentScreen('select');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4 flex items-center justify-center">
      <div className="w-full max-w-4xl">
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