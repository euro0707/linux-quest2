import { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';

export default function SlideScreen({ day, onComplete, onBack }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { slides } = day;

  // キーボードナビゲーション
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'Escape') {
        onBack();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      // 最後のスライドでゲーム画面へ
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const slide = slides[currentSlide];

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
      {/* プログレスバー */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">
            Day {day.day} スライド {currentSlide + 1} / {slides.length}
          </span>
          <button 
            onClick={onBack}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            ← 戻る
          </button>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
          />
        </div>
      </div>

      {/* スライドコンテンツ */}
      <div className="bg-gray-900 rounded-lg p-6 sm:p-8 text-white shadow-xl min-h-[600px] flex flex-col">
        {/* タイトル */}
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
          {slide.title}
        </h1>

        {/* ハイライトメッセージ */}
        {slide.highlight && (
          <div className="bg-blue-900 border border-blue-600 rounded-lg p-4 mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-blue-100">
              {slide.highlight}
            </h2>
          </div>
        )}

        {/* コンテンツセクション */}
        <div className="flex-1 space-y-6">
          {slide.sections.map((section, index) => (
            <div key={index} className="content-section">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 flex items-center">
                {section.icon && <span className="mr-2">{section.icon}</span>}
                {section.title}
              </h3>
              
              {section.type === 'list' && (
                <ul className="space-y-2 ml-4">
                  {section.items.map((item, idx) => (
                    <li key={idx} className="text-gray-200 flex items-start">
                      <span className="text-blue-400 mr-2">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              {section.type === 'commands' && (
                <div className="space-y-3">
                  {section.commands.map((cmd, idx) => (
                    <div key={idx} className="bg-gray-800 rounded p-3 border-l-4 border-green-500">
                      <div className="font-mono text-green-400 mb-1">
                        <code>{cmd.command}</code>
                      </div>
                      <div className="text-gray-300 text-sm">
                        → {cmd.description}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {section.type === 'text' && (
                <p className="text-gray-200 leading-relaxed">
                  {section.content}
                </p>
              )}

              {section.type === 'examples' && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold mb-3 text-yellow-400">実際の使用例：</h4>
                  <div className="space-y-3">
                    {section.examples.map((example, idx) => (
                      <div key={idx} className="font-mono text-sm">
                        <div className="text-green-400">$ {example.command}</div>
                        {example.output && (
                          <div className="text-gray-300 ml-2 mt-1 whitespace-pre-wrap">
                            {example.output}
                          </div>
                        )}
                        {example.note && (
                          <div className="text-blue-300 text-xs mt-2">
                            💡 {example.note}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ナビゲーション */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-700">
          <button
            onClick={handlePrevious}
            disabled={currentSlide === 0}
            className={`px-4 py-2 rounded transition-colors ${
              currentSlide === 0
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gray-600 hover:bg-gray-500 text-white'
            }`}
          >
            ← 前へ
          </button>

          {/* スライドインジケーター */}
          <div className="flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-blue-500' : 'bg-gray-600 hover:bg-gray-500'
                }`}
                aria-label={`スライド ${index + 1} に移動`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className={`px-4 py-2 rounded transition-colors ${
              currentSlide === slides.length - 1
                ? 'bg-green-600 hover:bg-green-700 text-white font-semibold'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {currentSlide === slides.length - 1 ? '実践開始! →' : '次へ →'}
          </button>
        </div>
      </div>

      {/* キーボードショートカット案内 */}
      <div className="mt-4 text-center text-xs text-gray-500">
        ⌨️ キーボード操作: [←][→] スライド移動 | [ESC] 戻る | [SPACE] 次へ
      </div>
    </div>
  );
}