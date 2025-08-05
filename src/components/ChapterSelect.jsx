import data from "../data/linux_quest_data.json";

export default function ChapterSelect({ currentDay, onSelectDay }) {
  return (
    <div className="w-full max-w-md sm:max-w-xl mx-auto p-4 sm:p-6 bg-gray-900 text-white rounded shadow-md">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">📘 Linux Quest チャプター選択</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {data.map((day, idx) => {
          const unlocked = idx <= currentDay;
          return (
            <button
              key={idx}
              onClick={() => unlocked && onSelectDay(idx)}
              className={`w-full p-3 rounded border text-sm sm:text-base ${
                unlocked
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
            >
              {unlocked ? `Day${day.day}: ${day.title}` : `🔒 Day${day.day}`}
            </button>
          );
        })}
      </div>
    </div>
  );
}