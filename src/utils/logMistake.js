import { getFromStorage, setToStorage } from './storage';

export function logMistake(userInput, dayNumber, expectedCommands) {
  try {
    const mistake = {
      timestamp: new Date().toISOString(),
      day: dayNumber,
      userInput: userInput,
      expectedCommands: expectedCommands,
      attempts: 1
    };
    
    // ローカルストレージから既存のミスログを安全に取得
    const existingMistakes = getFromStorage('linuxQuest_mistakes', []);
    
    // データ形式の検証
    if (!Array.isArray(existingMistakes)) {
      console.warn('Invalid mistakes data format, resetting');
      existingMistakes = [];
    }
    
    // 同じ日の同じ入力があるかチェック（大文字小文字を無視）
    const existingMistakeIndex = existingMistakes.findIndex(m => 
      m.day === dayNumber && 
      m.userInput && 
      m.userInput.toLowerCase() === userInput.toLowerCase()
    );
    
    if (existingMistakeIndex !== -1) {
      // 既存のミスの試行回数を増やす
      existingMistakes[existingMistakeIndex].attempts++;
      existingMistakes[existingMistakeIndex].timestamp = mistake.timestamp;
    } else {
      // 新しいミスとして追加
      existingMistakes.push(mistake);
    }
    
    // 古いミスを削除（50件以上は削除）
    if (existingMistakes.length > 50) {
      existingMistakes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      existingMistakes.splice(50);
    }
    
    // ローカルストレージに安全に保存
    if (!setToStorage('linuxQuest_mistakes', existingMistakes)) {
      console.error('Failed to save mistake log');
    } else {
      console.log('Mistake logged:', mistake);
    }
  } catch (error) {
    console.error('Error logging mistake:', error);
  }
}