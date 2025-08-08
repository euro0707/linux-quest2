/**
 * コマンドヒント設定
 */
const COMMAND_HINTS = {
  pwd: "現在のディレクトリを表示するコマンドを考えてみてください。",
  ls: "ファイル一覧を表示するコマンドを考えてみてください。",
  touch: "新しいファイルを作成するコマンドを考えてみてください。",
  cat: "ファイルの中身を表示するコマンドを考えてみてください。",
  mkdir: "新しいディレクトリを作成するコマンドを考えてみてください。",
  rmdir: "ディレクトリを削除するコマンドを考えてみてください。",
  rm: "ファイルを削除するコマンドを考えてみてください。",
  cp: "ファイルをコピーするコマンドを考えてみてください。",
  mv: "ファイルを移動・リネームするコマンドを考えてみてください。",
  date: "現在の日時を表示するコマンドを考えてみてください。",
  whoami: "現在のユーザー名を表示するコマンドを考えてみてください。",
  which: "コマンドの場所を調べるコマンドを考えてみてください。",
  grep: "テキストを検索するコマンドを考えてみてください。",
  find: "ファイルを検索するコマンドを考えてみてください。",
  head: "ファイルの先頭部分を表示するコマンドを考えてみてください。",
  tail: "ファイルの末尾部分を表示するコマンドを考えてみてください。",
  wc: "ファイルの行数・文字数を数えるコマンドを考えてみてください。",
  sort: "行をソートするコマンドを考えてみてください。",
  uniq: "重複行を除去するコマンドを考えてみてください。",
  chmod: "ファイルの権限を変更するコマンドを考えてみてください。",
  chown: "ファイルの所有者を変更するコマンドを考えてみてください。",
  sudo: "管理者権限でコマンドを実行するコマンドを考えてみてください。",
  apt: "パッケージ管理システムのコマンドを考えてみてください。",
  yum: "パッケージ管理システムのコマンドを考えてみてください。",
  npm: "Node.jsパッケージ管理コマンドを考えてみてください。",
  git: "バージョン管理システムのコマンドを考えてみてください。",
  
  // Day8 複合コマンド用ヒント
  "mkdir project && touch project/README.md && ls -la project && date": "4つのコマンドを && で連携してください：mkdir → touch → ls → date",
  "mkdir project && touch project/README.md && ls -l project && date": "4つのコマンドを && で連携してください：mkdir → touch → ls → date",
  ssh: "リモート接続するコマンドを考えてみてください。",
  scp: "ファイルを安全にコピーするコマンドを考えてみてください。",
  tar: "アーカイブを操作するコマンドを考えてみてください。",
  ps: "プロセス一覧を表示するコマンドを考えてみてください。",
  top: "システム情報をリアルタイムで表示するコマンドを考えてみてください。",
  df: "ディスク使用量を表示するコマンドを考えてみてください。",
  du: "ディレクトリサイズを表示するコマンドを考えてみてください。",
  free: "メモリ使用量を表示するコマンドを考えてみてください。",
  history: "コマンド履歴を表示するコマンドを考えてみてください。",
  man: "コマンドのマニュアルを表示するコマンドを考えてみてください。",
};

/**
 * よくある間違いとその修正案
 */
const COMMON_MISTAKES = {
  'dir': 'ls',
  'cls': 'clear',
  'type': 'cat',
  'copy': 'cp',
  'move': 'mv',
  'del': 'rm',
  'delete': 'rm',
  'md': 'mkdir',
  'rd': 'rmdir',
  'cd..': 'cd ..',
  'cd.': 'cd .',
};

/**
 * 入力の正規化
 */
function normalizeInput(input) {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' '); // 複数のスペースを1つに
}

/**
 * 完全一致をチェック
 */
function checkExactMatch(normalizedInput, expectedCommands) {
  return expectedCommands.some(cmd => 
    normalizedInput === cmd.toLowerCase()
  );
}

/**
 * 部分一致（コマンド名）をチェック
 */
function checkPartialMatch(normalizedInput, expectedCommands) {
  const userCommand = normalizedInput.split(' ')[0];
  
  return expectedCommands.find(cmd => {
    const expectedCommand = cmd.toLowerCase().split(' ')[0];
    return userCommand === expectedCommand;
  });
}

/**
 * よくある間違いをチェック
 */
function checkCommonMistakes(normalizedInput) {
  const userCommand = normalizedInput.split(' ')[0];
  return COMMON_MISTAKES[userCommand];
}

/**
 * 類似コマンドを検索
 */
function findSimilarCommand(normalizedInput, expectedCommands) {
  const userCommand = normalizedInput.split(' ')[0];
  
  // 編集距離で類似コマンドを検索
  let bestMatch = null;
  let minDistance = Infinity;
  
  expectedCommands.forEach(cmd => {
    const expectedCommand = cmd.toLowerCase().split(' ')[0];
    const distance = levenshteinDistance(userCommand, expectedCommand);
    
    if (distance < minDistance && distance <= 2) { // 最大2文字の違いまで
      minDistance = distance;
      bestMatch = cmd;
    }
  });
  
  return bestMatch;
}

/**
 * レーベンシュタイン距離を計算
 */
function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // 置換
          matrix[i][j - 1] + 1,     // 挿入
          matrix[i - 1][j] + 1      // 削除
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * ヒントを生成
 */
function generateHint(normalizedInput, expectedCommands) {
  // よくある間違いをチェック
  const correction = checkCommonMistakes(normalizedInput);
  if (correction) {
    return `Windowsコマンドではなく、Linuxコマンド「${correction}」を試してみてください。`;
  }
  
  // 類似コマンドをチェック
  const similar = findSimilarCommand(normalizedInput, expectedCommands);
  if (similar) {
    return `スペルミスかもしれません。「${similar}」を試してみてください。`;
  }
  
  // 部分一致をチェック
  const partialMatch = checkPartialMatch(normalizedInput, expectedCommands);
  if (partialMatch) {
    return `コマンド名は正しいです！「${partialMatch}」のような形で試してみてください。`;
  }
  
  // 一般的なヒント
  const expectedCommand = expectedCommands[0];
  if (expectedCommand) {
    // 複合コマンド全体をまずチェック
    let hint = COMMAND_HINTS[expectedCommand];
    if (hint) {
      return hint;
    }
    
    // 複合コマンド全体がない場合、最初のコマンドをチェック
    const commandName = expectedCommand.split(' ')[0];
    hint = COMMAND_HINTS[commandName];
    if (hint) {
      return hint;
    }
  }
  
  return "正しいLinuxコマンドを入力してください。";
}

/**
 * ユーザー入力を検証し、ヒントを提供
 * @param {string} userInput - ユーザーの入力
 * @param {string[]} expectedCommands - 期待されるコマンドの配列
 * @returns {Object} { match: boolean, hint: string }
 */
export function validateInput(userInput, expectedCommands) {
  try {
    // 入力の検証
    if (!userInput || typeof userInput !== 'string') {
      return { match: false, hint: "コマンドを入力してください。" };
    }
    
    if (!expectedCommands || !Array.isArray(expectedCommands) || expectedCommands.length === 0) {
      console.error('Invalid expectedCommands:', expectedCommands);
      return { match: false, hint: "設定エラーが発生しました。" };
    }
    
    const normalizedInput = normalizeInput(userInput);
    
    // 空入力チェック
    if (!normalizedInput) {
      return { match: false, hint: "コマンドを入力してください。" };
    }
    
    // 完全一致をチェック
    if (checkExactMatch(normalizedInput, expectedCommands)) {
      return { match: true, hint: "" };
    }
    
    // ヒントを生成
    const hint = generateHint(normalizedInput, expectedCommands);
    
    return { match: false, hint };
    
  } catch (error) {
    console.error('Error in validateInput:', error);
    return { 
      match: false, 
      hint: "入力の検証でエラーが発生しました。もう一度お試しください。" 
    };
  }
}