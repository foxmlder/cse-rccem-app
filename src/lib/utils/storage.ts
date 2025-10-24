/**
 * Local storage utilities with TypeScript support
 */

const STORAGE_PREFIX = 'cse-rccem-';

/**
 * Set item in localStorage
 */
export function setLocalStorage<T>(key: string, value: T): void {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(STORAGE_PREFIX + key, serialized);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

/**
 * Get item from localStorage
 */
export function getLocalStorage<T>(key: string, defaultValue?: T): T | null {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    if (!item) return defaultValue || null;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue || null;
  }
}

/**
 * Remove item from localStorage
 */
export function removeLocalStorage(key: string): void {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
}

/**
 * Clear all app data from localStorage
 */
export function clearLocalStorage(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}

/**
 * Check if localStorage is available
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get localStorage size in bytes
 */
export function getLocalStorageSize(): number {
  let total = 0;
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  return total;
}

/**
 * Set item with expiration
 */
export function setWithExpiry<T>(key: string, value: T, ttlMs: number): void {
  const now = new Date();
  const item = {
    value,
    expiry: now.getTime() + ttlMs,
  };
  setLocalStorage(key, item);
}

/**
 * Get item with expiration check
 */
export function getWithExpiry<T>(key: string): T | null {
  const itemStr = getLocalStorage<{ value: T; expiry: number }>(key);

  if (!itemStr) {
    return null;
  }

  const now = new Date();

  if (now.getTime() > itemStr.expiry) {
    removeLocalStorage(key);
    return null;
  }

  return itemStr.value;
}

/**
 * Session storage utilities
 */
export const sessionStorage = {
  set<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value);
      window.sessionStorage.setItem(STORAGE_PREFIX + key, serialized);
    } catch (error) {
      console.error('Error saving to sessionStorage:', error);
    }
  },

  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = window.sessionStorage.getItem(STORAGE_PREFIX + key);
      if (!item) return defaultValue || null;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error('Error reading from sessionStorage:', error);
      return defaultValue || null;
    }
  },

  remove(key: string): void {
    try {
      window.sessionStorage.removeItem(STORAGE_PREFIX + key);
    } catch (error) {
      console.error('Error removing from sessionStorage:', error);
    }
  },

  clear(): void {
    try {
      const keys = Object.keys(window.sessionStorage);
      keys.forEach((key) => {
        if (key.startsWith(STORAGE_PREFIX)) {
          window.sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing sessionStorage:', error);
    }
  },
};

/**
 * Cookie utilities
 */
export const cookies = {
  set(name: string, value: string, days: number = 7): void {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${STORAGE_PREFIX}${name}=${value};expires=${expires.toUTCString()};path=/`;
  },

  get(name: string): string | null {
    const nameEQ = `${STORAGE_PREFIX}${name}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  },

  remove(name: string): void {
    document.cookie = `${STORAGE_PREFIX}${name}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/`;
  },
};

/**
 * Store form data temporarily (useful for multi-step forms)
 */
export function saveFormData(formId: string, data: Record<string, any>): void {
  setLocalStorage(`form-${formId}`, data);
}

/**
 * Retrieve form data
 */
export function getFormData<T = Record<string, any>>(formId: string): T | null {
  return getLocalStorage<T>(`form-${formId}`);
}

/**
 * Clear form data
 */
export function clearFormData(formId: string): void {
  removeLocalStorage(`form-${formId}`);
}

/**
 * Save user preferences
 */
export function savePreferences(preferences: Record<string, any>): void {
  setLocalStorage('user-preferences', preferences);
}

/**
 * Get user preferences
 */
export function getPreferences<T = Record<string, any>>(): T | null {
  return getLocalStorage<T>('user-preferences');
}

/**
 * Store recently viewed items
 */
export function addToRecentlyViewed(
  category: string,
  item: { id: string; [key: string]: any },
  maxItems: number = 10
): void {
  const key = `recently-viewed-${category}`;
  const items = getLocalStorage<any[]>(key) || [];

  // Remove if already exists
  const filtered = items.filter((i) => i.id !== item.id);

  // Add to beginning
  filtered.unshift(item);

  // Keep only maxItems
  const trimmed = filtered.slice(0, maxItems);

  setLocalStorage(key, trimmed);
}

/**
 * Get recently viewed items
 */
export function getRecentlyViewed<T>(category: string): T[] {
  const key = `recently-viewed-${category}`;
  return getLocalStorage<T[]>(key) || [];
}
