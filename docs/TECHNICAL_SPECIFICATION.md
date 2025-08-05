# Linux Quest - 技術仕様書

## 📋 システム概要

### アーキテクチャ概要
```
┌─────────────────────────────────────────┐
│           Browser (Client)              │
├─────────────────────────────────────────┤
│  React App (SPA)                        │
│  ├── Slide Learning Module              │
│  ├── Command Practice Module            │
│  ├── Progress Management                │
│  └── Local Storage (Data Persistence)   │
├─────────────────────────────────────────┤
│  Static Asset Delivery (CDN)            │
└─────────────────────────────────────────┘
```

### 技術スタック詳細
```typescript
interface TechStack {
  frontend: {
    framework: 'React 18.2.0';
    language: 'TypeScript 5.0+';
    styling: 'Tailwind CSS 3.4+';
    buildTool: 'Vite 5.0+';
  };
  security: {
    xssProtection: 'DOMPurify';
    inputValidation: 'Zod';
    csp: 'Built-in Headers';
  };
  deployment: {
    hosting: 'Vercel/Netlify';
    domain: 'HTTPS Required';
    cdn: 'Integrated CDN';
  };
}
```

---

## 🏗️ システム設計

### 1. コンポーネント構成
```
src/
├── App.tsx                 # メインアプリケーション
├── components/
│   ├── SlideScreen.tsx     # スライド学習画面
│   ├── DayScreen.tsx       # コマンド実践画面  
│   ├── ChapterSelect.tsx   # Day選択画面
│   └── shared/
│       ├── ProgressBar.tsx # 進捗表示
│       ├── Navigation.tsx  # ナビゲーション
│       └── ErrorBoundary.tsx # エラー境界
├── hooks/
│   ├── useProgress.ts      # 進捗管理
│   ├── useSlideNavigation.ts # スライド制御
│   └── useLocalStorage.ts  # データ永続化
├── utils/
│   ├── commandValidator.ts # コマンド検証
│   ├── sanitizer.ts        # 入力サニタイゼーション
│   └── secureStorage.ts    # 安全なローカルストレージ
├── data/
│   └── linuxQuestData.ts   # 学習コンテンツ
└── types/
    └── index.ts            # TypeScript型定義
```

### 2. 状態管理設計
```typescript
// アプリケーション状態
interface AppState {
  // 画面制御
  currentScreen: 'select' | 'slide' | 'game';
  selectedDay: number;
  currentSlideIndex: number;
  
  // 進捗管理
  completedDays: number[];
  slideProgress: Record<number, boolean>;
  
  // 学習データ
  mistakes: CommandMistake[];
  achievements: Achievement[];
  
  // UI状態
  isLoading: boolean;
  error: ErrorState | null;
}

// ローカルストレージ構造
interface StorageSchema {
  // 進捗データ
  'lq_progress': {
    completedDays: number[];
    slideProgress: Record<number, boolean>;
    lastAccessed: string;
  };
  
  // 学習統計
  'lq_stats': {
    totalCommands: number;
    correctAnswers: number;
    studyTime: number;
    mistakes: CommandMistake[];
  };
}
```

### 3. データモデル
```typescript
// 学習コンテンツの型定義
interface DayData {
  day: number;
  title: string;
  
  // スライドデータ
  slides: SlideData[];
  
  // ゲームデータ
  story: string;
  challengeText: string;
  expectedCommands: string[];
  hints: string[];
  followup: string;
  realWorldUse: string;
}

interface SlideData {
  title: string;
  highlight?: string; // ハイライトメッセージ
  sections: SlideSection[];
}

interface SlideSection {
  title: string;
  icon?: string;
  type: 'list' | 'commands' | 'text' | 'examples';
  items?: string[]; // type: 'list'の場合
  commands?: CommandExample[]; // type: 'commands'の場合
  content?: string; // type: 'text'の場合
  examples?: CodeExample[]; // type: 'examples'の場合
}

interface CommandExample {
  command: string;
  description: string;
}

interface CodeExample {
  command: string;
  output?: string;
  note?: string;
}

// コマンド実行結果
interface CommandResult {
  success: boolean;
  output?: string;
  error?: string;
  hint?: string;
}

// エラー情報
interface CommandMistake {
  day: number;
  input: string;
  expectedCommands: string[];
  timestamp: Date;
  attempts: number;
}
```

---

## 🎮 機能仕様詳細

### 1. スライド学習機能

#### SlideScreen コンポーネント
```typescript
interface SlideScreenProps {
  day: number;
  slides: SlideData[];
  currentIndex: number;
  onComplete: () => void;
  onNavigate: (index: number) => void;
  onBack: () => void;
}

// 主要機能
const SlideScreen: FC<SlideScreenProps> = ({
  day,
  slides,
  currentIndex,
  onComplete,
  onNavigate,
  onBack
}) => {
  // スライドナビゲーション
  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      onNavigate(currentIndex + 1);
    } else {
      onComplete(); // 最後のスライドでゲーム画面へ
    }
  };
  
  // キーボード操作サポート
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') onBack();
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);
  
  return (
    <div className="slide-container">
      {/* プログレスバー */}
      <ProgressBar 
        current={currentIndex + 1} 
        total={slides.length} 
      />
      
      {/* スライドコンテンツ */}
      <div 
        className="slide-content"
        dangerouslySetInnerHTML={{ 
          __html: DOMPurify.sanitize(slides[currentIndex].content) 
        }}
      />
      
      {/* ナビゲーション */}
      <Navigation
        onPrev={handlePrev}
        onNext={handleNext}
        showPrev={currentIndex > 0}
        nextLabel={currentIndex === slides.length - 1 ? 'ゲーム開始!' : '次へ'}
      />
    </div>
  );
};
```

### 2. コマンド実践機能

#### DayScreen コンポーネント
```typescript
interface DayScreenProps {
  day: DayData;
  onComplete: () => void;
  onBack: () => void;
}

// コマンド検証ロジック
const validateCommand = (input: string, expectedCommands: string[]): CommandResult => {
  // 入力サニタイゼーション
  const sanitized = DOMPurify.sanitize(input.trim());
  
  // 危険なコマンドの除外
  const dangerousPatterns = [
    /sudo/i, /rm\s+-rf/i, /dd\s+if=/i, /mkfs/i,
    />/, /\|/, /&&/, /;/, /`/, /\$/
  ];
  
  if (dangerousPatterns.some(pattern => pattern.test(sanitized))) {
    return {
      success: false,
      error: 'このコマンドは学習環境では使用できません',
      hint: '基本的なLinuxコマンドを入力してください'
    };
  }
  
  // 正解判定
  const isCorrect = expectedCommands.some(cmd => 
    sanitized.toLowerCase() === cmd.toLowerCase()
  );
  
  if (isCorrect) {
    return {
      success: true,
      output: simulateCommandOutput(sanitized)
    };
  }
  
  // ヒント生成
  const hint = generateHint(sanitized, expectedCommands);
  
  return {
    success: false,
    error: 'コマンドが正しくありません',
    hint
  };
};

// コマンド出力シミュレーション
const simulateCommandOutput = (command: string): string => {
  const outputs = {
    'pwd': '/home/user/projects/linux-quest',
    'ls': 'documents  downloads  projects  README.md',
    'date': new Date().toString(),
    'whoami': 'user'
  };
  
  const [cmd] = command.split(' ');
  return outputs[cmd] || `${cmd}: command executed successfully`;
};
```

### 3. 進捗管理機能

#### useProgress カスタムフック
```typescript
const useProgress = () => {
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [slideProgress, setSlideProgress] = useState<Record<number, boolean>>({});
  
  // ローカルストレージからの復元
  useEffect(() => {
    const savedProgress = secureStorage.get('progress');
    if (savedProgress) {
      setCompletedDays(savedProgress.completedDays);
      setSlideProgress(savedProgress.slideProgress);
    }
  }, []);
  
  // 進捗保存
  const saveProgress = useCallback(() => {
    secureStorage.set('progress', {
      completedDays,
      slideProgress,
      lastAccessed: new Date().toISOString()
    });
  }, [completedDays, slideProgress]);
  
  // スライド完了マーク
  const markSlideComplete = useCallback((day: number) => {
    setSlideProgress(prev => ({
      ...prev,
      [day]: true
    }));
  }, []);
  
  // Day完了マーク
  const markDayComplete = useCallback((day: number) => {
    setCompletedDays(prev => 
      prev.includes(day) ? prev : [...prev, day].sort()
    );
  }, []);
  
  return {
    completedDays,
    slideProgress,
    markSlideComplete,
    markDayComplete,
    saveProgress
  };
};
```

---

## 🔒 セキュリティ実装

### 1. 入力サニタイゼーション
```typescript
// utils/sanitizer.ts
import DOMPurify from 'dompurify';

export const sanitizeInput = (input: string): string => {
  // 基本的なサニタイゼーション
  const cleaned = input.trim();
  
  // HTML要素の除去
  const sanitized = DOMPurify.sanitize(cleaned, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
  
  return sanitized;
};

export const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'strong', 'em', 'code', 'pre', 'br', 'div'],
    ALLOWED_ATTR: ['class']
  });
};
```

### 2. 安全なローカルストレージ
```typescript
// utils/secureStorage.ts
class SecureStorage {
  private prefix = 'lq_';
  
  set<T>(key: string, data: T): void {
    try {
      const payload = {
        data,
        timestamp: Date.now(),
        checksum: this.generateChecksum(data)
      };
      
      const encrypted = btoa(JSON.stringify(payload));
      localStorage.setItem(this.prefix + key, encrypted);
    } catch (error) {
      console.warn('ストレージ保存エラー:', error);
    }
  }
  
  get<T>(key: string): T | null {
    try {
      const encrypted = localStorage.getItem(this.prefix + key);
      if (!encrypted) return null;
      
      const payload = JSON.parse(atob(encrypted));
      
      // 改ざんチェック
      if (this.generateChecksum(payload.data) !== payload.checksum) {
        console.warn('データの改ざんを検知');
        this.remove(key);
        return null;
      }
      
      return payload.data;
    } catch (error) {
      console.warn('ストレージ読み込みエラー:', error);
      return null;
    }
  }
  
  private generateChecksum<T>(data: T): string {
    return btoa(JSON.stringify(data)).slice(-8);
  }
  
  remove(key: string): void {
    localStorage.removeItem(this.prefix + key);
  }
}

export const secureStorage = new SecureStorage();
```

### 3. CSP設定
```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https:;
  connect-src 'self';
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'none';
">
```

---

## 📱 レスポンシブ設計

### ブレークポイント定義
```css
/* Tailwind設定拡張 */
module.exports = {
  theme: {
    screens: {
      'xs': '320px',   // スマートフォン（縦）
      'sm': '640px',   // スマートフォン（横）
      'md': '768px',   // タブレット
      'lg': '1024px',  // デスクトップ
      'xl': '1280px',  // 大画面
      '2xl': '1536px'  // 超大画面
    }
  }
}
```

### レスポンシブコンポーネント例
```typescript
const SlideScreen: FC<SlideScreenProps> = () => {
  return (
    <div className="
      container mx-auto px-4
      max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl
      py-4 sm:py-6 md:py-8
    ">
      <div className="
        bg-gray-900 rounded-lg
        p-4 sm:p-6 md:p-8
        text-sm sm:text-base md:text-lg
      ">
        {/* コンテンツ */}
      </div>
    </div>
  );
};
```

---

## ⚡ パフォーマンス要件

### 最適化戦略
```typescript
// 1. コード分割
const SlideScreen = lazy(() => import('./components/SlideScreen'));
const DayScreen = lazy(() => import('./components/DayScreen'));

// 2. メモ化
const ExpensiveComponent = memo(({ data }) => {
  const processedData = useMemo(
    () => processData(data),
    [data]
  );
  
  return <div>{processedData}</div>;
});

// 3. 仮想化（大量データ用）
const VirtualizedList = ({ items }) => {
  return (
    <FixedSizeList
      height={400}
      itemCount={items.length}
      itemSize={50}
    >
      {Row}
    </FixedSizeList>
  );
};
```

### ビルド最適化
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    target: 'es2020',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['dompurify']
        }
      }
    }
  },
  define: {
    __DEV__: process.env.NODE_ENV === 'development'
  }
});
```

---

## 🧪 テスト戦略

### テストピラミッド
```
               ┌─────┐
               │ E2E │ (5%)
               └─────┘
           ┌─────────────┐
           │ Integration │ (15%)
           └─────────────┘
       ┌─────────────────────┐
       │       Unit          │ (80%)
       └─────────────────────┘
```

### 単体テスト例
```typescript
// __tests__/commandValidator.test.ts
describe('commandValidator', () => {
  test('正しいコマンドを受け入れる', () => {
    const result = validateCommand('pwd', ['pwd']);
    expect(result.success).toBe(true);
  });
  
  test('危険なコマンドを拒否する', () => {
    const result = validateCommand('sudo rm -rf /', ['pwd']);
    expect(result.success).toBe(false);
    expect(result.error).toContain('使用できません');
  });
  
  test('XSS攻撃を防ぐ', () => {
    const result = validateCommand('<script>alert("xss")</script>', ['pwd']);
    expect(result.success).toBe(false);
  });
});
```

---

## 🚀 デプロイメント仕様

### CI/CD パイプライン
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Security audit
        run: npm audit --audit-level high
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Vercel
        uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

### 環境設定
```bash
# .env.production
VITE_APP_ENV=production
VITE_APP_VERSION=1.0.0
VITE_ANALYTICS_ID=G-XXXXXXXXXX
```

---

**作成日**: 2025年8月4日  
**バージョン**: 1.0  
**レビュー**: 実装前・実装後