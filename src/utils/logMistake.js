export function logMistake(userInput, dayNumber, expectedCommands) {
  const mistake = {
    timestamp: new Date().toISOString(),
    day: dayNumber,
    userInput: userInput,
    expectedCommands: expectedCommands,
    attempts: 1
  };
  
  // ローカルストレージから既存のミスログを取得
  const existingMistakes = JSON.parse(localStorage.getItem('linuxQuest_mistakes') || '[]');
  
  // 同じ日の同じ入力があるかチェック
  const existingMistakeIndex = existingMistakes.findIndex(m => 
    m.day === dayNumber && m.userInput === userInput
  );
  
  if (existingMistakeIndex !== -1) {
    // 既存のミスの試行回数を増やす
    existingMistakes[existingMistakeIndex].attempts++;
    existingMistakes[existingMistakeIndex].timestamp = mistake.timestamp;
  } else {
    // 新しいミスとして追加
    existingMistakes.push(mistake);
  }
  
  // ローカルストレージに保存
  localStorage.setItem('linuxQuest_mistakes', JSON.stringify(existingMistakes));
  
  console.log('Mistake logged:', mistake);
}