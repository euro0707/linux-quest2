export default function OpeningScreen({ onStart }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4 flex items-center justify-center">
      <main className="w-full max-w-lg mx-auto text-center" role="main" aria-labelledby="opening-title">
        {/* メインタイトル */}
        <div className="mb-8 animate-fade-in">
          <h1 
            id="opening-title"
            className="text-4xl sm:text-5xl font-bold text-white mb-2 flex items-center justify-center gap-3"
          >
            <span className="text-5xl sm:text-6xl" aria-hidden="true">💻</span>
            Linux Quest
          </h1>
          
          <div className="flex justify-center mb-6">
            <div className="border-t border-gray-400 w-48" aria-hidden="true"></div>
          </div>
          
          <p className="text-xl sm:text-2xl text-blue-200 font-medium mb-4">
            8日間で黒い画面を制する冒険
          </p>
          
          <p className="text-gray-300 text-sm sm:text-base max-w-md mx-auto">
            実践的なLinuxコマンドを段階的に学習<br/>
            プログラマーへの第一歩を踏み出そう
          </p>
        </div>

        {/* 機能ハイライト */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="text-center p-3 bg-gray-800 bg-opacity-50 rounded-lg">
            <div className="text-2xl mb-1" aria-hidden="true">📚</div>
            <div className="text-gray-300">8つのチャプター</div>
          </div>
          <div className="text-center p-3 bg-gray-800 bg-opacity-50 rounded-lg">
            <div className="text-2xl mb-1" aria-hidden="true">⚡</div>
            <div className="text-gray-300">実践的な学習</div>
          </div>
          <div className="text-center p-3 bg-gray-800 bg-opacity-50 rounded-lg">
            <div className="text-2xl mb-1" aria-hidden="true">🎯</div>
            <div className="text-gray-300">段階的な習得</div>
          </div>
        </div>

        {/* 開始ボタン */}
        <button
          onClick={onStart}
          className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold px-8 py-4 rounded-lg text-lg sm:text-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 shadow-lg hover:shadow-xl"
          aria-label="Linux Quest を開始する"
        >
          🚀 Quest を始める
        </button>

        {/* フッター */}
        <div className="mt-12 text-center text-gray-500 text-xs">
          <p>キーボードのTabキーでナビゲーション、Enterで選択</p>
        </div>
      </main>

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 1s ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}