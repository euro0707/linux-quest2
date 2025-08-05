# Linux Quest - セキュリティ要件定義書

## 📋 概要

個人開発アプリ「Linux Quest」のセキュリティ要件を定義する。  
参考: 『【初心者必読】個人開発アプリを守る6つの必須セキュリティ対策』

---

## 🔥 Lv.1: 基本のキ（必須レベル）

### 1. ✅ HTTPS通信の徹底

**要件**:
- 本番環境では**HTTPS必須**
- 開発環境でも可能な限りHTTPS使用
- 外部リソース（CDN、画像等）もHTTPS

**実装方針**:
```javascript
// 環境別URL管理
const config = {
  apiBase: process.env.NODE_ENV === 'production' 
    ? 'https://linux-quest.vercel.app'
    : 'https://localhost:3000',
  
  // 外部CDNもHTTPS
  cdnBase: 'https://cdn.jsdelivr.net'
};
```

**チェック項目**:
- [ ] ブラウザアドレスバーに🔒表示
- [ ] Developer Tools NetworkタブでHTTPS確認
- [ ] Mixed Content Errorの非発生

### 2. ✅ 機密情報のコード埋め込み禁止

**要件**:
- APIキー、トークンのハードコーディング禁止
- 環境変数（.env）による管理
- .gitignoreでの機密ファイル除外

**実装方針**:
```bash
# .env.example (GitHubに含める)
VITE_APP_TITLE=Linux Quest
VITE_ANALYTICS_ID=your_analytics_id_here

# .env (GitHubに含めない)
VITE_ANALYTICS_ID=G-XXXXXXXXXX
```

```javascript
// 環境変数の使用
const analyticsId = import.meta.env.VITE_ANALYTICS_ID;
```

### 3. ✅ 入力値の適切なバリデーション

**要件**:
- ユーザー入力の全てをサニタイゼーション
- XSS攻撃対策
- コマンドインジェクション対策

**実装方針**:
```javascript
import DOMPurify from 'dompurify';

// ユーザー入力のサニタイゼーション
const sanitizeInput = (input) => {
  return DOMPurify.sanitize(input.trim());
};

// コマンド入力の検証
const validateCommand = (command) => {
  const allowedCommands = ['pwd', 'ls', 'cd', 'touch', 'mkdir', 'cat', 'chmod', 'date'];
  const sanitized = sanitizeInput(command);
  const baseCommand = sanitized.split(' ')[0];
  
  return allowedCommands.includes(baseCommand);
};
```

### 4. ✅ エラーメッセージでの情報漏洩防止

**要件**:
- 技術的詳細をユーザーに露出しない
- ログは開発者のみ確認可能
- 攻撃者にシステム情報を与えない

**実装方針**:
```javascript
const handleError = (error, userFriendlyMessage) => {
  // 開発環境でのみ詳細ログ
  if (process.env.NODE_ENV === 'development') {
    console.error('詳細エラー:', error);
  }
  
  // ユーザーには分かりやすいメッセージのみ
  return {
    message: userFriendlyMessage || 'エラーが発生しました。もう一度お試しください。',
    timestamp: new Date().toISOString()
  };
};
```

### 5. ✅ ブラウザセキュリティヘッダーの設定

**要件**:
- Content Security Policy (CSP) 設定
- X-Frame-Options による clickjacking 対策
- X-Content-Type-Options によるMIME sniffing対策

**実装方針**:
```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self';
  frame-ancestors 'none';
">
<meta http-equiv="X-Frame-Options" content="DENY">
<meta http-equiv="X-Content-Type-Options" content="nosniff">
```

### 6. ✅ 依存関係の脆弱性管理

**要件**:
- 定期的な依存関係の脆弱性チェック
- 最新バージョンへのアップデート
- 不要な依存関係の削除

**実装方針**:
```bash
# 脆弱性チェック
npm audit
npm audit fix

# パッケージ最新化
npm update

# 不要パッケージ削除
npm prune
```

---

## ⚠️ Lv.2: 実践レベル（Linux Quest特有の対策）

### 1. コマンド実行シミュレーションの安全性

**要件**:
- 実際のシステムコマンド実行禁止
- 許可されたコマンドのみ受付
- コマンドインジェクション完全防止

**実装方針**:
```javascript
const SAFE_COMMANDS = {
  'pwd': () => '/home/user',
  'ls': () => 'documents  downloads  projects',
  'date': () => new Date().toString()
};

const executeCommand = (command) => {
  const sanitized = sanitizeInput(command);
  const [cmd, ...args] = sanitized.split(' ');
  
  if (!SAFE_COMMANDS[cmd]) {
    return { error: 'コマンドが見つかりません', suggestion: 'ヒントを確認してください' };
  }
  
  return { output: SAFE_COMMANDS[cmd](args) };
};
```

### 2. ローカルストレージのデータ保護

**要件**:
- 機密性の高いデータは暗号化
- 不正な改ざん検知
- 適切なデータ有効期限設定

**実装方針**:
```javascript
const secureStorage = {
  set: (key, data) => {
    const encrypted = btoa(JSON.stringify({
      data,
      timestamp: Date.now(),
      checksum: btoa(JSON.stringify(data)).slice(-8)
    }));
    localStorage.setItem(`lq_${key}`, encrypted);
  },
  
  get: (key) => {
    try {
      const encrypted = localStorage.getItem(`lq_${key}`);
      if (!encrypted) return null;
      
      const decrypted = JSON.parse(atob(encrypted));
      
      // 改ざんチェック
      const expectedChecksum = btoa(JSON.stringify(decrypted.data)).slice(-8);
      if (decrypted.checksum !== expectedChecksum) {
        console.warn('データの改ざんを検知');
        return null;
      }
      
      return decrypted.data;
    } catch (error) {
      console.warn('ストレージデータの読み込みエラー');
      return null;
    }
  }
};
```

### 3. クライアントサイドでの情報漏洩防止

**要件**:
- DevToolsでの機密情報露出防止
- コンソールログの本番環境での無効化
- ソースコード内の開発用コメント削除

**実装方針**:
```javascript
// 本番環境でのコンソール無効化
if (process.env.NODE_ENV === 'production') {
  console.log = console.warn = console.error = () => {};
}

// Vite設定でのコメント削除
export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      },
      format: {
        comments: false
      }
    }
  }
});
```

---

## 📋 セキュリティチェックリスト

### デプロイ前チェック
- [ ] HTTPS通信の確認
- [ ] 環境変数の適切な設定
- [ ] .envファイルの.gitignore確認
- [ ] 依存関係の脆弱性チェック (`npm audit`)
- [ ] CSPヘッダーの動作確認
- [ ] エラーメッセージの情報漏洩チェック
- [ ] DevToolsでの機密情報露出チェック
- [ ] 不正な入力値での動作確認

### 定期チェック（月1回）
- [ ] 依存関係のアップデート確認
- [ ] セキュリティアドバイザリーの確認
- [ ] アクセスログの異常検知
- [ ] ユーザーフィードバックからの脆弱性発見

---

## 🚨 インシデント対応計画

### 脆弱性発見時の対応
1. **即座の影響範囲調査**
2. **一時的なサービス停止判断**
3. **修正パッチの緊急リリース**
4. **ユーザーへの適切な情報開示**

### 連絡先
- **開発者**: Claude (AI Assistant)
- **緊急時対応**: GitHub Issues
- **ユーザー報告**: アプリ内フィードバック機能

---

**作成日**: 2025年8月4日  
**参考資料**: 『個人開発アプリを守る6つの必須セキュリティ対策』  
**レビュー予定**: 実装完了時・リリース後1ヶ月