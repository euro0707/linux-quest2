import dataObj from "../data/integrated_linux_quest_data.json";

// オブジェクト形式のデータを配列に変換
const data = Object.values(dataObj);

export default function ChapterSelect({ currentDay, onSelectDay }) {
  const totalDays = data.length;
  const unlockedDays = currentDay + 1;

  return (
    <main className="w-full max-w-md sm:max-w-xl mx-auto p-4 sm:p-6 bg-gray-900 text-white rounded shadow-md">
      <header className="mb-4">
        <h1 className="text-xl sm:text-2xl font-bold mb-2">📘 Linux Quest チャプター選択</h1>
        <p className="text-gray-300 text-sm">
          進捗: {unlockedDays} / {totalDays} Days 解放済み
        </p>
      </header>
      
      <section aria-label="チャプター一覧">
        <div 
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          role="grid"
          aria-label="学習チャプターグリッド"
        >
          {data.map((day, idx) => {
            const unlocked = idx <= currentDay;
            const isCompleted = idx < currentDay;
            
            return (
              <div key={idx} role="gridcell">
                <button
                  onClick={() => unlocked && onSelectDay(idx)}
                  disabled={!unlocked}
                  className={`w-full p-3 rounded border text-sm sm:text-base transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                    unlocked
                      ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                      : "bg-gray-700 text-gray-400 cursor-not-allowed focus:ring-gray-500"
                  } ${isCompleted ? "border-green-500" : "border-gray-600"}`}
                  aria-label={
                    unlocked 
                      ? `Day ${day.day}: ${day.title}${isCompleted ? ' - 完了済み' : ''}` 
                      : `Day ${day.day} - ロック中`
                  }
                  aria-describedby={`day-${idx}-status`}
                >
                  <div className="flex items-center justify-between">
                    <span>
                      {unlocked ? `Day${day.day}: ${day.title}` : `🔒 Day${day.day}`}
                    </span>
                    {isCompleted && (
                      <span className="text-green-400 ml-2" aria-hidden="true">✓</span>
                    )}
                  </div>
                </button>
                <span 
                  id={`day-${idx}-status`} 
                  className="sr-only"
                >
                  {unlocked 
                    ? isCompleted 
                      ? "完了済みのチャプター" 
                      : "利用可能なチャプター"
                    : "まだロックされています"
                  }
                </span>
              </div>
            );
          })}
        </div>
      </section>
      
      <footer className="mt-4 text-center text-xs text-gray-500">
        <p>キーボードのTabキーでチャプター間を移動、Enterで選択できます</p>
      </footer>
    </main>
  );
}