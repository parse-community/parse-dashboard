import React, { useState, useRef, useEffect } from 'react';
import { getSavedTheme, setTheme } from 'lib/theme';
import styles from 'components/Sidebar/ThemeSelector.scss';

const THEMES = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'classic', label: 'Classic' },
  { value: 'auto', label: 'Auto' },
];

const ThemeSelector = () => {
  const [current, setCurrent] = useState(getSavedTheme);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Listen for system theme changes when in auto mode
  useEffect(() => {
    if (current !== 'auto' || !window.matchMedia) {
      return;
    }
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setTheme('auto');
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [current]);

  const handleSelect = (value) => {
    setCurrent(value);
    setTheme(value);
    setOpen(false);
  };

  const currentLabel = THEMES.find(t => t.value === current)?.label || 'Light';

  return (
    <div className={styles.themeSelector} ref={ref}>
      <button
        className={styles.trigger}
        onClick={() => setOpen(!open)}
        title="Change theme"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zm11.394-5.834a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591zM18 12a.75.75 0 01.75-.75H21a.75.75 0 010 1.5h-2.25A.75.75 0 0118 12zm-.697 5.303a.75.75 0 00-1.06 1.06l1.59 1.591a.75.75 0 101.061-1.06l-1.59-1.591z" />
        </svg>
        <span>{currentLabel}</span>
      </button>
      {open && (
        <div className={styles.menu}>
          {THEMES.map(({ value, label }) => (
            <button
              key={value}
              className={`${styles.option} ${value === current ? styles.active : ''}`}
              onClick={() => handleSelect(value)}
            >
              {label}
              {value === current && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;
