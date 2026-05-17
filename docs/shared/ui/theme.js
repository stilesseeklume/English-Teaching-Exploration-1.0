// shared/ui/theme.js
//
// 暗黑模式切换。
//
// 注意：本模块只负责"用户点击按钮切换主题"。
// 页面加载时的首屏防闪烁检测必须保留在 <head> 内联同步脚本中，
// 形如：
//   <script>(function(){var t=localStorage.getItem('theme');
//     if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches))
//     {document.documentElement.setAttribute('data-theme','dark');}})();</script>
// 新增任何题型页面（如 docs/cloze-fill/index.html）都要在 <head> 顶部复制这段。

export function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  if (next === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('theme', 'light');
  }
}

// 兼容 HTML 内联 onclick="toggleTheme()" 写法
window.toggleTheme = toggleTheme;
