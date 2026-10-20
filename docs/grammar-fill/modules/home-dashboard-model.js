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
    if (action.type === 'open-textbook-unit') {
      // 课本线整体归首页：直接在当前页渲染讲解页（openTextbookNote 自己负责切到首页）。
      return {
        action: action,
        immediateSteps: [
          { kind: 'open-textbook-note', key: action.value, delayMs: 0 }
        ],
        delayedSteps: []
      };
    }
    if (action.type === 'open-knowledge-category') {
      // 先切到「书本速查」让侧栏可见，再选中目标类目。
      return {
        action: action,
        immediateSteps: [
          { kind: 'switch-page', page: 'knowledge' },
          { kind: 'set-knowledge-view', view: 'book' }
        ],
        delayedSteps: [
          { kind: 'select-knowledge-category', category: action.value, delayMs: 0 }
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
    return {
      action: action,
      immediateSteps: [],
      delayedSteps: []
    };
  }

  // 首页 = 语法主阵地：hero 讲定位，下面三段是 ①课本语法 ②教辅语法 ③工具。
  function getHeroModel(activity) {
    activity = activity || getUserActivityState({});
    var identity = {
      kickerText: '👋 欢迎来到 Seeklume',
      titleText: '课本语法 + 教辅语法',
      bodyParts: [
        { text: '这里是语法主阵地：' },
        { text: '课本语法', strong: true },
        { text: ' 按人教版单元同步讲，' },
        { text: '教辅语法', strong: true },
        { text: ' 按《语法通霸》考点速查。语法填空只保留为一项练习工具，收在下面的工具区。' }
      ]
    };
    if (activity.isNewUser) return identity;
    return {
      kickerText: '👋 ' + activity.greeting,
      titleText: identity.titleText,
      bodyParts: [{ text: '你已攒下 ' }, { text: activity.statusText, strong: true }, { text: '。' }]
        .concat(identity.bodyParts)
    };
  }

  // 工具区：语法填空练习（唯一练习入口）+ 速查 + 教学工具。
  function getToolGroups(activity) {
    activity = activity || getUserActivityState({});
    return [
      {
        key: 'drill', titleText: '练习',
        items: [
          {
            key: 'grammar-fill', icon: '✏️', label: '语法填空 · 练习',
            subtitleText: '真题 + 模拟 · 直接开做', tone: 'accent', count: null,
            action: buildAction('navigate-home', 'exams')
          }
        ]
      },
      {
        key: 'reference', titleText: '速查',
        items: [
          {
            key: 'knowledge', icon: '📖', label: '知识库',
            subtitleText: '全部考点 · 全量速查', tone: 'purple', count: null,
            action: buildAction('switch-page', 'knowledge')
          }
        ]
      },
      {
        key: 'teaching', titleText: '教学工具',
        items: [
          {
            key: 'upload-word', icon: '📤', label: '导入试题',
            subtitleText: 'Word → AI 解析入库', tone: 'accent', count: null,
            action: buildAction('upload-word', 'lesson-prep')
          },
          {
            key: 'my-papers', icon: '📁', label: '我做过的题',
            subtitleText: activity.prepCount + ' 套已入库', tone: 'accent', count: activity.prepCount,
            action: buildAction('switch-page', 'lesson-prep')
          },
          {
            key: 'error-import', icon: '📥', label: '导入成绩',
            subtitleText: '传网阅成绩 → 算考点画像', tone: 'accent', count: null,
            action: buildAction('switch-page', 'error-import')
          },
          {
            key: 'error-profile', icon: '📊', label: '考点画像',
            subtitleText: '历次卷子 · 班级考点画像', tone: 'accent', count: null,
            action: buildAction('switch-page', 'error-profile')
          }
        ]
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

  // ─── 段落 ①：课本语法（人教版 7 册单元网格）───
  function textbookUnitKey(book, unit) {
    return String(book || '') + '|' + String(unit || '');
  }

  function buildTextbookUnitModel(unit, noteIndex) {
    unit = unit || {};
    var key = textbookUnitKey(unit.book, unit.unit);
    return {
      key: key,
      unitLabelText: unit.unit || '',
      topicText: unit.topic || '',
      grammarText: unit.grammar_zh || unit.grammar_en || '',
      ready: !!noteIndex[key],
      statusText: noteIndex[key] ? '📖 已有讲解' : '整理中',
      action: buildAction('open-textbook-unit', key)
    };
  }

  function buildTextbookGrammarSectionModel(textbookUnits, noteIndex) {
    var units = Array.isArray(textbookUnits) ? textbookUnits : [];
    noteIndex = noteIndex || {};
    var byBook = {};
    units.forEach(function(unit) {
      var book = (unit && unit.book) || '其他';
      (byBook[book] = byBook[book] || []).push(unit);
    });
    var books = BOOK_ORDER.filter(function(book) { return byBook[book] && byBook[book].length; });
    Object.keys(byBook).forEach(function(book) {
      if (books.indexOf(book) === -1) books.push(book);
    });
    var readyTotal = 0;
    var bookModels = books.map(function(book) {
      var unitModels = byBook[book].map(function(unit) {
        return buildTextbookUnitModel(unit, noteIndex);
      });
      var readyCount = unitModels.filter(function(item) { return item.ready; }).length;
      readyTotal += readyCount;
      return {
        book: book,
        labelText: book,
        cover: COVER_MAP[book] || '',
        metaText: unitModels.length + ' 单元 · ' + readyCount + ' 单元有讲解',
        units: unitModels
      };
    });
    return {
      visible: bookModels.length > 0,
      titleText: '📚 课本语法 · 人教版',
      statusText: units.length + ' 单元 · ' + readyTotal + ' 已有讲解',
      descriptionText: '按 7 册同步校内进度：点封面进这册的单元页，点单元进讲解页（课本原书截图 + 教辅深化）。目前只有必修一 U3 开放，其余标「待开放」。',
      books: bookModels
    };
  }

  // ─── 段落 ②：教辅语法（《语法通霸》13 类考点索引）───
  function buildGrammarIndexSectionModel(fineTags) {
    fineTags = fineTags || {};
    var categories = fineTags.categories || {};
    var tagsByCategory = fineTags.tags_by_category || {};
    var tagTotal = 0;
    var items = Object.keys(categories).map(function(key) {
      var category = categories[key] || {};
      var count = (tagsByCategory[key] || []).length;
      tagTotal += count;
      return {
        key: key,
        labelText: category.name || key,
        sourceText: category.source || '',
        countText: count + ' 考点',
        action: buildAction('open-knowledge-category', key)
      };
    });
    return {
      visible: items.length > 0,
      titleText: '📖 教辅语法 · 《语法通霸》',
      statusText: items.length + ' 类 · ' + tagTotal + ' 考点',
      descriptionText: '按《语法通霸》章节分类的应试口径：点类目看该类的考点、陷阱与例句题库。',
      categories: items
    };
  }

  function buildDashboardModel(values) {
    values = values || {};
    var activity = getUserActivityState(values);
    return {
      activity: activity,
      hero: getHeroModel(activity),
      textbookSection: buildTextbookGrammarSectionModel(values.textbookUnits, values.textbookNotes),
      indexSection: buildGrammarIndexSectionModel(values.fineTags),
      toolSection: {
        visible: true,
        titleText: '🧰 工具',
        groups: getToolGroups(activity).map(function(group) {
          return {
            key: group.key,
            titleText: group.titleText,
            items: group.items.map(buildDashboardActionButtonModel)
          };
        })
      }
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
    buildTextbookGrammarSectionModel: buildTextbookGrammarSectionModel,
    buildGrammarIndexSectionModel: buildGrammarIndexSectionModel,
    getToolGroups: getToolGroups,
    buildDashboardModel: buildDashboardModel
  };
})();
