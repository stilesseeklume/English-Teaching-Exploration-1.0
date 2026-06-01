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

  function getModulesGreeting(hour) {
    hour = typeof hour === 'number' ? hour : new Date().getHours();
    if (hour < 6) return '夜深辛苦了';
    if (hour < 11) return '上午好';
    if (hour < 13) return '中午好';
    if (hour < 18) return '下午好';
    if (hour < 22) return '晚上好';
    return '今天也辛苦了';
  }

  function buildModulesGreetingText(displayName, hour) {
    var greeting = getModulesGreeting(hour);
    displayName = displayName || '';
    return displayName ? (greeting + '，' + displayName) : greeting;
  }

  function getUserActivityState(values) {
    values = values || {};
    var prepCount = asCount(values.prepCount);
    var errorCount = asCount(values.errorCount);
    var statusBits = [];
    if (prepCount > 0) statusBits.push(prepCount + ' 套题');
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

  function buildHomeSummaryModel(values) {
    values = values || {};
    var examCount = asCount(values.examCount);
    var questionCount = asCount(values.questionCount);
    var errorCount = asCount(values.errorCount);
    var prepCount = asCount(values.prepCount);
    return {
      examCount: examCount,
      questionCount: questionCount,
      errorCount: errorCount,
      prepCount: prepCount,
      bankStatText: '题库：' + examCount + ' 套卷 · ' + questionCount + ' 题（数据源：data/语法填空库）。',
      errorCountText: errorCount + ' 道错题',
      prepCountText: prepCount + ' 份资料'
    };
  }

  function buildAction(type, value) {
    return {
      type: type || '',
      value: value == null ? '' : String(value)
    };
  }

  function normalizeDashboardAction(action) {
    action = action || {};
    return buildAction(action.type, action.value);
  }

  function buildDashboardActionExecutionPlan(action) {
    action = normalizeDashboardAction(action);
    if (action.type === 'upload-word') {
      return {
        action: action,
        immediateSteps: [
          { kind: 'switch-page', page: action.value || 'lesson-prep' }
        ],
        delayedSteps: [
          { kind: 'click-upload-button', selector: '#page-lesson-prep .docx-upload-btn', delayMs: 120 }
        ]
      };
    }
    if (action.type === 'switch-page') {
      return {
        action: action,
        immediateSteps: [
          { kind: 'switch-page', page: action.value || 'home' }
        ],
        delayedSteps: []
      };
    }
    if (action.type === 'navigate-home') {
      return {
        action: action,
        immediateSteps: [
          { kind: 'navigate-home', view: action.value || 'cards' }
        ],
        delayedSteps: []
      };
    }
    if (action.type === 'open-textbook') {
      return {
        action: action,
        immediateSteps: [
          { kind: 'switch-page', page: 'knowledge' }
        ],
        delayedSteps: [
          { kind: 'set-knowledge-view', view: 'textbook', delayMs: 80 },
          { kind: 'open-textbook-modal', book: action.value || '', delayMs: 130 }
        ]
      };
    }
    return {
      action: action,
      immediateSteps: [],
      delayedSteps: []
    };
  }

  function getHeroModel(activity) {
    activity = activity || getUserActivityState({});
    if (activity.isNewUser) {
      return {
        kickerText: '👋 欢迎来到 Seeklume',
        titleText: '高中英语 · 语法填空讲评工作台',
        bodyParts: [
          { text: '从精选真题 / 模拟直接开讲，或上传你自己的卷子。讲完第一张，系统就开始替你攒考点、攒错题，下次讲新卷自动联动。' }
        ]
      };
    }
    return {
      kickerText: '👋 ' + activity.greeting,
      titleText: '今天讲哪份卷子？',
      bodyParts: [
        { text: '你已攒下 ' },
        { text: activity.statusText, strong: true },
        { text: '。下次讲评，同考点的老题和错题会自动帮你拎出来联动。' }
      ]
    };
  }

  function getDashboardActions(activity) {
    activity = activity || getUserActivityState({});
    return [
      {
        key: 'pick-bank',
        icon: '📚',
        label: '精选题库',
        subtitleText: '真题 + 模拟 · 直接开讲',
        tone: 'primary',
        count: null,
        action: buildAction('navigate-home', 'exams')
      },
      {
        key: 'upload-word',
        icon: '📤',
        label: '上传我的卷子',
        subtitleText: 'AI 自动解析 + 入库',
        tone: 'primary',
        count: null,
        action: buildAction('upload-word', 'lesson-prep')
      },
      {
        key: 'my-papers',
        icon: '📁',
        label: '我做过的题',
        subtitleText: activity.prepCount + ' 套已入库',
        tone: 'accent',
        count: activity.prepCount,
        action: buildAction('switch-page', 'lesson-prep')
      },
      {
        key: 'error-book',
        icon: '🎯',
        label: '错题本',
        subtitleText: activity.errorCount + ' 道待复习',
        tone: 'red',
        count: activity.errorCount,
        action: buildAction('switch-page', 'error-book')
      },
      {
        key: 'points-training',
        icon: '🏷️',
        label: '考点训练',
        subtitleText: '挑考点集中练',
        tone: 'accent',
        count: null,
        action: buildAction('switch-page', 'points-training')
      },
      {
        key: 'knowledge',
        icon: '📖',
        label: '知识库',
        subtitleText: '教材 · 按考点分类',
        tone: 'purple',
        count: null,
        action: buildAction('switch-page', 'knowledge')
      }
    ];
  }

  function getActionButtonChrome(tone) {
    var base = 'padding:14px 16px;border-radius:12px;cursor:pointer;font-size:14px;font-weight:600;font-family:inherit;display:flex;flex-direction:column;align-items:flex-start;gap:4px;transition:all .18s;';
    if (tone === 'primary') {
      return {
        style: 'background:var(--accent);color:#fff;border:none;' + base + 'box-shadow:0 4px 14px rgba(0,113,227,0.2);',
        mouseover: "this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 22px rgba(0,113,227,0.3)'",
        mouseout: "this.style.transform='';this.style.boxShadow='0 4px 14px rgba(0,113,227,0.2)'"
      };
    }
    var hover = {
      accent: { border: 'var(--accent)', background: 'var(--accent-bg)' },
      red: { border: 'var(--red)', background: 'var(--red-bg)' },
      purple: { border: 'var(--purple, #af52de)', background: 'var(--purple-bg, #f6edfb)' }
    }[tone] || { border: 'var(--accent)', background: 'var(--accent-bg)' };
    return {
      style: 'background:var(--surface);color:var(--text);border:1px solid var(--border);' + base,
      mouseover: "this.style.borderColor='" + hover.border + "';this.style.background='" + hover.background + "'",
      mouseout: "this.style.borderColor='var(--border)';this.style.background='var(--surface)'"
    };
  }

  function buildDashboardActionButtonModel(item) {
    item = item || {};
    return Object.assign({}, item, {
      chrome: getActionButtonChrome(item.tone || ''),
      subtitleStyle: item.tone === 'primary'
        ? 'opacity:0.85;'
        : 'color:var(--text-3);'
    });
  }

  function getTextbookGallery(textbookUnits) {
    if (!Array.isArray(textbookUnits) || !textbookUnits.length) return [];
    return BOOK_ORDER.map(function(book, idx) {
      return {
        book: book,
        cover: COVER_MAP[book],
        labelText: book,
        animationDelayMs: idx * 40
      };
    });
  }

  function getTextbookSectionModel(books) {
    books = Array.isArray(books) ? books : [];
    return {
      visible: books.length > 0,
      titleText: '📚 教材覆盖范围',
      statusText: '教材映射重做中',
      descriptionText: '当前仅作封面展示，教材单元映射暂不开放。'
    };
  }

  function buildDashboardModel(values) {
    values = values || {};
    var activity = getUserActivityState(values);
    var books = getTextbookGallery(values.textbookUnits);
    return {
      activity: activity,
      hero: getHeroModel(activity),
      books: books,
      textbookSection: getTextbookSectionModel(books),
      actions: getDashboardActions(activity).map(buildDashboardActionButtonModel)
    };
  }

  window.GrammarHomeDashboardModel = {
    BOOK_ORDER: BOOK_ORDER,
    COVER_MAP: COVER_MAP,
    getGreeting: getGreeting,
    getModulesGreeting: getModulesGreeting,
    buildModulesGreetingText: buildModulesGreetingText,
    getUserActivityState: getUserActivityState,
    buildHomeSummaryModel: buildHomeSummaryModel,
    normalizeDashboardAction: normalizeDashboardAction,
    buildDashboardActionExecutionPlan: buildDashboardActionExecutionPlan,
    getActionButtonChrome: getActionButtonChrome,
    buildDashboardActionButtonModel: buildDashboardActionButtonModel,
    getTextbookGallery: getTextbookGallery,
    buildDashboardModel: buildDashboardModel
  };
})();
