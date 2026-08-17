import { useState, useEffect, useMemo } from 'react';
import { SelectAndProcessPDF } from '../bindings/changeme/vocabservice';
import './App.css';

interface WordFreq {
  word: string;
  count: number;
}

interface BookData {
  words: WordFreq[];
  learned: Record<number, boolean>;
}

const translations = {
  en: {
    title: "VocabCore",
    addBtn: "+ Add PDF Book",
    loading: "Extracting...",
    library: "YOUR LIBRARY",
    noBooks: "No books yet.",
    singleMode: "Single Check",
    bulkMode: "Bulk Check",
    totalWords: "Total Words:",
    rank: "Rank",
    word: "Word",
    freq: "Frequency",
    placeholderTitle: "Select a book to start learning",
    placeholderSub: "Your extracted vocabulary will appear here.",
    toggleLang: "فارسی",
    prev: "Previous",
    next: "Next",
    page: "Page",
    of: "of",
    searchPlaceholder: "Search words...",
    noResults: "No words match your search.",
    resultsFound: "results"
  },
  fa: {
    title: "ووکب‌کور",
    addBtn: "+ افزودن کتاب PDF",
    loading: "در حال پردازش...",
    library: "کتابخانه شما",
    noBooks: "هیچ کتابی نیست.",
    singleMode: "تیک تکی",
    bulkMode: "تیک گروهی",
    totalWords: "تعداد کل کلمات:",
    rank: "رتبه",
    word: "کلمه",
    freq: "تکرار",
    placeholderTitle: "برای شروع یک کتاب انتخاب کنید",
    placeholderSub: "کلمات استخراج شده اینجا نمایش داده می‌شوند.",
    toggleLang: "English",
    prev: "قبلی",
    next: "بعدی",
    page: "صفحه",
    of: "از",
    searchPlaceholder: "جستجوی کلمات...",
    noResults: "کلمه‌ای مطابق جستجوی شما یافت نشد.",
    resultsFound: "نتیجه"
  }
};

function App() {
  const [library, setLibrary] = useState<Record<string, BookData>>({});
  const [currentBook, setCurrentBook] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [bulkMode, setBulkMode] = useState<boolean>(false);
  const [lang, setLang] = useState<'en' | 'fa'>('en');
  
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageInput, setPageInput] = useState<string>('1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const itemsPerPage = 100;

  const t = translations[lang];

  useEffect(() => {
    const saved = localStorage.getItem('vocab_library');
    const savedLang = localStorage.getItem('vocab_lang');
    if (saved) {
      try { setLibrary(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
    if (savedLang === 'fa' || savedLang === 'en') {
      setLang(savedLang);
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    setPageInput('1');
    setSearchQuery('');
  }, [currentBook]);

  useEffect(() => {
    setCurrentPage(1);
    setPageInput('1');
  }, [searchQuery]);

  useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  const saveToLibrary = (newLibrary: Record<string, BookData>) => {
    setLibrary(newLibrary);
    localStorage.setItem('vocab_library', JSON.stringify(newLibrary));
  };

  const handleLangToggle = () => {
    const newLang = lang === 'en' ? 'fa' : 'en';
    setLang(newLang);
    localStorage.setItem('vocab_lang', newLang);
  };

  const handleSelectFile = async () => {
    setLoading(true);
    try {
      const result: any = await SelectAndProcessPDF();
      if (result && result.fileName && result.words) {
        const newLib = { ...library };
        if (!newLib[result.fileName]) {
          newLib[result.fileName] = { words: result.words, learned: {} };
        } else {
          newLib[result.fileName].words = result.words;
        }
        saveToLibrary(newLib);
        setCurrentBook(result.fileName);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLearn = (index: number) => {
    if (!currentBook) return;
    const bookData = library[currentBook];
    const newLearned = { ...bookData.learned };
    const isCurrentlyLearned = !!newLearned[index];

    if (bulkMode) {
      if (isCurrentlyLearned) {
        for (let i = index; i < bookData.words.length; i++) {
          newLearned[i] = false;
        }
      } else {
        for (let i = 0; i <= index; i++) {
          newLearned[i] = true;
        }
      }
    } else {
      newLearned[index] = !isCurrentlyLearned;
    }

    saveToLibrary({
      ...library,
      [currentBook]: { ...bookData, learned: newLearned }
    });
  };

  const handleDeleteBook = (e: React.MouseEvent, book: string) => {
    e.stopPropagation();
    const newLib = { ...library };
    delete newLib[book];
    saveToLibrary(newLib);
    if (currentBook === book) setCurrentBook('');
  };

  const activeData = currentBook ? library[currentBook] : null;
  const isRtl = lang === 'fa';

  const filteredWords = useMemo(() => {
    if (!activeData) return [];
    const withIndex = activeData.words.map((w, originalIndex) => ({ ...w, originalIndex }));
    const q = searchQuery.trim().toLowerCase();
    if (!q) return withIndex;
    return withIndex.filter(w => w.word.toLowerCase().includes(q));
  }, [activeData, searchQuery]);

  const isSearching = searchQuery.trim().length > 0;
  const totalPages = filteredWords.length > 0 ? Math.ceil(filteredWords.length / itemsPerPage) : 0;
  
  const handlePageJump = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      let p = parseInt(pageInput);
      if (isNaN(p) || p < 1) p = 1;
      if (p > totalPages) p = totalPages;
      setCurrentPage(p);
      setPageInput(p.toString());
    }
  };

  const handlePageInputBlur = () => {
    let p = parseInt(pageInput);
    if (isNaN(p) || p < 1) p = 1;
    if (p > totalPages) p = totalPages;
    setCurrentPage(p);
    setPageInput(p.toString());
  };

  const currentWords = filteredWords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className={`dashboard ${isRtl ? 'rtl-mode' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="sidebar-header">
            <div className="logo-glow"></div>
            <h2>{t.title}</h2>
          </div>
          <button className="lang-toggle" onClick={handleLangToggle}>
            {t.toggleLang}
          </button>
        </div>

        <button className="primary-btn pulse" onClick={handleSelectFile} disabled={loading}>
          {loading ? (
            <span className="loader-text">{t.loading}</span>
          ) : (
            <span>{t.addBtn}</span>
          )}
        </button>

        <div className="book-list">
          <p className="list-title">{t.library}</p>
          {Object.keys(library).length === 0 && (
            <p className="empty-state">{t.noBooks}</p>
          )}
          {Object.keys(library).map(book => (
            <div 
              key={book} 
              className={`book-item ${currentBook === book ? 'active' : ''}`}
              onClick={() => setCurrentBook(book)}
            >
              <span className="book-icon">📚</span>
              <span className="book-name" title={book}>{book}</span>
              <button 
                className="delete-icon" 
                onClick={(e) => handleDeleteBook(e, book)}
                title="Delete Book"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </aside>

      <main className="main-content">
        {activeData ? (
          <div className="content-wrapper">
            <header className="content-header">
              <div className="title-area">
                <h1 className="current-title" title={currentBook}>{currentBook}</h1>
                <p className="stats-text">
                  {isSearching
                    ? `${filteredWords.length.toLocaleString()} ${t.resultsFound}`
                    : `${t.totalWords} ${activeData.words.length.toLocaleString()}`}
                </p>
              </div>

              <div className="search-bar">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  className="search-input"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  dir="ltr"
                />
                {isSearching && (
                  <button
                    className="clear-search-btn"
                    onClick={() => setSearchQuery('')}
                    title="Clear"
                  >
                    ✕
                  </button>
                )}
              </div>
              
              <div className="mode-toggle">
                <label className={`toggle-btn ${!bulkMode ? 'active' : ''}`}>
                  <input type="radio" checked={!bulkMode} onChange={() => setBulkMode(false)} />
                  {t.singleMode}
                </label>
                <label className={`toggle-btn ${bulkMode ? 'active' : ''}`}>
                  <input type="radio" checked={bulkMode} onChange={() => setBulkMode(true)} />
                  {t.bulkMode}
                </label>
              </div>
            </header>

            <div className="table-container">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th style={{ width: '50px', textAlign: 'center' }}>✔</th>
                    <th style={{ width: '100px' }}>{t.rank}</th>
                    <th>{t.word}</th>
                    <th style={{ width: '120px', textAlign: isRtl ? 'left' : 'right' }}>{t.freq}</th>
                  </tr>
                </thead>
                <tbody>
                  {currentWords.length === 0 && isSearching && (
                    <tr>
                      <td colSpan={4} className="no-results-cell">
                        {t.noResults}
                      </td>
                    </tr>
                  )}
                  {currentWords.map((item) => {
                    const actualIndex = item.originalIndex;
                    const isLearned = !!activeData.learned[actualIndex];
                    
                    return (
                      <tr key={actualIndex} className={isLearned ? 'learned-row' : ''}>
                        <td>
                          <label className="checkbox-wrapper">
                            <input 
                              type="checkbox" 
                              checked={isLearned} 
                              onChange={() => handleToggleLearn(actualIndex)} 
                            />
                            <span className="checkmark"></span>
                          </label>
                        </td>
                        <td className="rank-cell">#{actualIndex + 1}</td>
                        <td className="word-cell" dir="ltr">{item.word}</td>
                        <td style={{ textAlign: isRtl ? 'left' : 'right' }}>
                          <span className="count-badge">{item.count}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 0 && (
              <div className="pagination-container">
                <button 
                  className="page-btn" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                >
                  ◀ {t.prev}
                </button>
                
                <span className="pagination-info">
                  {t.page} 
                  <input 
                    type="number" 
                    className="page-input"
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    onKeyDown={handlePageJump}
                    onBlur={handlePageInputBlur}
                    min={1}
                    max={totalPages}
                  /> 
                  {t.of} {totalPages}
                </span>
                
                <button 
                  className="page-btn" 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                >
                  {t.next} ▶
                </button>
              </div>
            )}

          </div>
        ) : (
          <div className="placeholder-screen">
            <h2>{t.placeholderTitle}</h2>
            <p>{t.placeholderSub}</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;