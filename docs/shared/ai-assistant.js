// shared/ai-assistant.js
//
// DeepSeek 客服 + 助教 抽屉式 AI 对话。
//
// 职责：
//   - 抽屉打开/关闭（toggleAssistant）
//   - 消息历史 localStorage 持久化（最近 30 条）
//   - 发送消息到 Supabase Edge Function /functions/v1/deepseek-chat
//   - 渲染消息气泡 + 输入区自增高 + 滚到底
//
// 依赖（必须先加载）：
//   - shared/cloud.js（window.cloud, window._sb, window.SUPABASE_URL）
//   - shared/utils.js（window.escapeHtml）
//
// 题型侧（index.html）必须提供：
//   - HTML 结构：#assistantPanel / #assistantMsgs / #assistantInput / #assistantSendBtn
//                 + .assistant-backdrop
//   - dock 中的 AI 图标（onclick="toggleAssistant()"）
//   - CSS（先留在 index.html，后续可抽到 shared/styles/ai-assistant.css）

/* eslint-disable */
(function(){
  var ASSISTANT_HISTORY_KEY = 'grammar-assistant-history';
  var assistantHistory = [];
  var assistantBusy = false;

  function loadAssistantHistory() {
    try {
      assistantHistory = JSON.parse(localStorage.getItem(ASSISTANT_HISTORY_KEY) || '[]');
    } catch (e) { assistantHistory = []; }
  }
  function saveAssistantHistory() {
    try {
      // 仅保存最近 30 条避免无限增长
      localStorage.setItem(ASSISTANT_HISTORY_KEY, JSON.stringify(assistantHistory.slice(-30)));
    } catch(e) {}
  }
  function clearAssistantHistory() {
    if (!confirm('清空对话历史？')) return;
    assistantHistory = [];
    saveAssistantHistory();
    renderAssistantMsgs();
  }

  function toggleAssistant(force) {
    var panel = document.getElementById('assistantPanel');
    var bg = document.querySelector('.assistant-backdrop');
    var shouldOpen = (typeof force === 'boolean') ? force : !panel.classList.contains('open');
    if (shouldOpen) {
      panel.classList.add('open');
      bg.classList.add('show');
      setTimeout(function(){
        document.getElementById('assistantInput').focus();
        scrollAssistantToBottom();
      }, 50);
    } else {
      panel.classList.remove('open');
      bg.classList.remove('show');
    }
  }

  function renderAssistantMsgs() {
    var el = document.getElementById('assistantMsgs');
    if (!el) return;
    if (assistantHistory.length === 0) {
      el.innerHTML = '<div class="assistant-empty">'
        + '<h4>嗨 👋 我能帮你做两件事</h4>'
        + '<div>1. <b>这个网站怎么用</b> · 答疑、操作指引<br>'
        + '2. <b>语法填空相关</b> · 解题思路、考点解释</div>'
        + '<div class="hint-grp">'
        +   '<div class="hint-chip" onclick="fillAndSendAssistant(\'怎么把 Word 里的几道题导入到错题本？\')">怎么把 Word 里的几道题导入到错题本？</div>'
        +   '<div class="hint-chip" onclick="fillAndSendAssistant(\'迁移训练里「我的错题」和「真题库」有什么区别？\')">迁移训练里「我的错题」和「真题库」有什么区别？</div>'
        +   '<div class="hint-chip" onclick="fillAndSendAssistant(\'whose 和 which 用在定语从句里时怎么区分？\')">whose 和 which 怎么区分？</div>'
        +   '<div class="hint-chip" onclick="fillAndSendAssistant(\'非谓语动词 doing / done / to do 怎么选？\')">非谓语 doing / done / to do 怎么选？</div>'
        + '</div>'
        + '</div>';
      return;
    }
    var html = '';
    assistantHistory.forEach(function(m) {
      html += '<div class="assistant-msg ' + m.role + '">'
        + '<div class="bubble">' + window.escapeHtml(m.content) + '</div>'
        + '</div>';
    });
    if (assistantBusy) {
      html += '<div class="assistant-msg assistant"><div class="bubble">'
        + '<span class="assistant-typing"><span></span><span></span><span></span></span>'
        + '</div></div>';
    }
    el.innerHTML = html;
    scrollAssistantToBottom();
  }

  function scrollAssistantToBottom() {
    var el = document.getElementById('assistantMsgs');
    if (el) el.scrollTop = el.scrollHeight;
  }

  function autoGrowAssistantInput(ta) {
    ta.style.height = 'auto';
    ta.style.height = Math.min(120, ta.scrollHeight) + 'px';
  }

  function fillAndSendAssistant(text) {
    document.getElementById('assistantInput').value = text;
    sendAssistantMsg();
  }

  async function sendAssistantMsg() {
    if (assistantBusy) return;
    var ta = document.getElementById('assistantInput');
    var text = ta.value.trim();
    if (!text) return;

    // 登录检查
    if (!window.cloud || !window.cloud.state || !window.cloud.state.user) {
      alert('请先登录后再使用 AI 助手。');
      return;
    }

    ta.value = '';
    autoGrowAssistantInput(ta);

    assistantHistory.push({ role: 'user', content: text });
    saveAssistantHistory();
    assistantBusy = true;
    document.getElementById('assistantSendBtn').disabled = true;
    renderAssistantMsgs();

    try {
      var sess = await window._sb.auth.getSession();
      if (!sess || !sess.data.session) throw new Error('未登录');
      var token = sess.data.session.access_token;

      var res = await fetch(window.SUPABASE_URL + '/functions/v1/deepseek-chat', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages: assistantHistory })
      });

      if (!res.ok) {
        var errData;
        try { errData = await res.json(); } catch(e) { errData = {}; }
        var errMsg = errData.error || ('AI 服务错误 ' + res.status);
        if (errData.detail) errMsg += ' [' + errData.detail + ']';
        throw new Error(errMsg);
      }
      var data = await res.json();
      var content = data.content || '(空回复)';
      assistantHistory.push({ role: 'assistant', content: content });
      saveAssistantHistory();
    } catch (e) {
      assistantHistory.push({
        role: 'assistant',
        content: '⚠ 出错了：' + (e.message || String(e)) + '\n\n稍后再试，或者点垃圾桶清空对话重新开。'
      });
      saveAssistantHistory();
    } finally {
      assistantBusy = false;
      document.getElementById('assistantSendBtn').disabled = false;
      renderAssistantMsgs();
    }
  }

  // 暴露到 window（HTML 内联 onclick 调用）
  window.toggleAssistant = toggleAssistant;
  window.sendAssistantMsg = sendAssistantMsg;
  window.fillAndSendAssistant = fillAndSendAssistant;
  window.clearAssistantHistory = clearAssistantHistory;
  window.autoGrowAssistantInput = autoGrowAssistantInput;

  // 启动钩子（页面解析末尾会触发一次 init，但 AI 助手历史可独立加载）
  window.__bootAssistant = function() {
    loadAssistantHistory();
    renderAssistantMsgs();
  };
})();
