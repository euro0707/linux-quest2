// ローカルストレージの安全な操作を提供するユーティリティ

/**
 * ローカルストレージから値を安全に取得
 * @param {string} key - ストレージキー
 * @param {any} defaultValue - デフォルト値
 * @returns {any} 取得した値またはデフォルト値
 */
export function getFromStorage(key, defaultValue = null) {
  try {
    if (typeof Storage === 'undefined') {
      console.warn('LocalStorage is not available');
      return defaultValue;
    }
    
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    
    // JSON形式の文字列の場合はパース
    if (item.startsWith('{') || item.startsWith('[')) {
      return JSON.parse(item);
    }
    
    return item;
  } catch (error) {
    console.error(`Error reading from storage (key: ${key}):`, error);
    return defaultValue;
  }
}

/**
 * ローカルストレージに値を安全に保存
 * @param {string} key - ストレージキー
 * @param {any} value - 保存する値
 * @returns {boolean} 保存成功フラグ
 */
export function setToStorage(key, value) {
  try {
    if (typeof Storage === 'undefined') {
      console.warn('LocalStorage is not available');
      return false;
    }
    
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, stringValue);
    return true;
  } catch (error) {
    console.error(`Error writing to storage (key: ${key}):`, error);
    
    // ストレージ容量不足の場合の処理
    if (error.name === 'QuotaExceededError') {
      console.warn('Storage quota exceeded. Attempting to clear old data...');
      clearOldData();
      
      // 再試行
      try {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        localStorage.setItem(key, stringValue);
        return true;
      } catch (retryError) {
        console.error('Retry failed:', retryError);
        return false;
      }
    }
    
    return false;
  }
}

/**
 * ローカルストレージから値を安全に削除
 * @param {string} key - 削除するキー
 * @returns {boolean} 削除成功フラグ
 */
export function removeFromStorage(key) {
  try {
    if (typeof Storage === 'undefined') {
      console.warn('LocalStorage is not available');
      return false;
    }
    
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from storage (key: ${key}):`, error);
    return false;
  }
}

/**
 * 古いデータをクリア（容量不足時の対応）
 */
function clearOldData() {
  try {
    // Linux Quest以外のデータを優先的に削除
    const keysToRemove = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !key.startsWith('linuxQuest_')) {
        keysToRemove.push(key);
      }
    }
    
    // 古いデータから削除
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error(`Failed to remove key: ${key}`, error);
      }
    });
    
    console.log(`Cleared ${keysToRemove.length} old storage items`);
  } catch (error) {
    console.error('Error clearing old data:', error);
  }
}

/**
 * ストレージの使用状況を取得
 * @returns {Object} 使用状況情報
 */
export function getStorageInfo() {
  try {
    if (typeof Storage === 'undefined') {
      return { available: false };
    }
    
    let used = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }
    
    return {
      available: true,
      used,
      usedMB: (used / 1024 / 1024).toFixed(2)
    };
  } catch (error) {
    console.error('Error getting storage info:', error);
    return { available: false, error: error.message };
  }
}