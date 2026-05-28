// grammar-fill/modules/home-dashboard-model.js
//
// Pure data helpers for the home dashboard. The legacy page still renders
// markup, while user status and textbook gallery data are testable here.

/* eslint-disable */
(function(){
  var BOOK_ORDER = ['必修一', '必修二', '必修三', '选必一', '选必二', '选必三', '选必四'];
  var COVER_MAP = {
    '必修一': 'images/textbook-covers/bixiu-1.jpg',
    '必修二': 'images/textbook-covers/bixiu-2.jpg',
    '必修三': 'images/textbook-covers/bixiu-3.jpg',
    '选必一': 'images/textbook-covers/xuanbi-1.jpg',
    '选必二': 'images/textbook-covers/xuanbi-2.jpg',
    '选必三': 'images/textbook-covers/xuanbi-3.jpg',
    '选必四': 'images/textbook-covers/xuanbi-4.jpg'
  };

  function asCount(value) {
    return Number(value || 0) || 0;
  }

  function getGreeting(hour) {
    hour = typeof hour === 'number' ? hour : new Date().getHours();
    if (hour < 6) return '深夜好';
    if (hour < 11) return '早上好';
    if (hour < 14) return '中午好';
    if (hour < 18) return '下午好';
    return '晚上好';
  }

  function getUserActivityState(values) {
    values = values || {};
    var prepCount = asCount(values.prepCount);
    var errorCount = asCount(values.errorCount);
    var statusBits = [];
    if (prepCount > 0) statusBits.push(prepCount + ' 份备课');
    if (errorCount > 0) statusBits.push(errorCount + ' 道错题');
    return {
      prepCount: prepCount,
      errorCount: errorCount,
      isNewUser: prepCount === 0 && errorCount === 0,
      greeting: getGreeting(values.hour),
      statusBits: statusBits,
      statusText: statusBits.join(' · ')
    };
  }

  function getTextbookGallery(textbookUnits) {
    if (!Array.isArray(textbookUnits) || !textbookUnits.length) return [];
    return BOOK_ORDER.map(function(book, idx) {
      return {
        book: book,
        cover: COVER_MAP[book],
        animationDelayMs: idx * 40
      };
    });
  }

  function buildDashboardModel(values) {
    values = values || {};
    var activity = getUserActivityState(values);
    return {
      activity: activity,
      books: getTextbookGallery(values.textbookUnits),
      actions: [
        { key: 'upload-word', label: '上传新 Word', count: null },
        { key: 'lesson-prep', label: '继续备课讲题', count: activity.prepCount },
        { key: 'error-book', label: '复习错题', count: activity.errorCount },
        { key: 'knowledge', label: '知识库', count: null }
      ]
    };
  }

  window.GrammarHomeDashboardModel = {
    BOOK_ORDER: BOOK_ORDER,
    COVER_MAP: COVER_MAP,
    getGreeting: getGreeting,
    getUserActivityState: getUserActivityState,
    getTextbookGallery: getTextbookGallery,
    buildDashboardModel: buildDashboardModel
  };
})();
