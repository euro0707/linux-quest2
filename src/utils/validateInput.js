export function validateInput(userInput, expectedCommands) {
  const trimmedInput = userInput.trim().toLowerCase();
  
  // 完全一致をチェック
  const exactMatch = expectedCommands.some(cmd => 
    trimmedInput === cmd.toLowerCase()
  );
  
  if (exactMatch) {
    return { match: true, hint: "" };
  }
  
  // 部分一致でヒントを提供
  const partialMatch = expectedCommands.find(cmd => 
    trimmedInput.includes(cmd.toLowerCase().split(' ')[0])
  );
  
  if (partialMatch) {
    return { 
      match: false, 
      hint: `もう少しです！「${partialMatch}」のようなコマンドを試してみてください。` 
    };
  }
  
  // 一般的なヒント
  const hints = {
    pwd: "現在のディレクトリを表示するコマンドを考えてみてください。",
    ls: "ファイル一覧を表示するコマンドを考えてみてください。",
    touch: "新しいファイルを作成するコマンドを考えてみてください。",
    cat: "ファイルの中身を表示するコマンドを考えてみてください。",
    mkdir: "新しいディレクトリを作成するコマンドを考えてみてください。",
    date: "現在の日時を表示するコマンドを考えてみてください。",
    apt: "パッケージ管理システムのコマンドを考えてみてください。"
  };
  
  const hintKey = expectedCommands[0].split(' ')[0];
  return { 
    match: false, 
    hint: hints[hintKey] || "正しいLinuxコマンドを入力してください。" 
  };
}