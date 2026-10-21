// docs/shared/ui/dock.js
//
// 全站底部 Dock 装配器（经典脚本，非 ESM）。
//
// 用法：页面在 <head> 引 dock.css，在 </body> 前引本文件，然后
//   var dock = SeeklumeDock.mount({
//     back: { label: '返回上一页', onClick: fn },   // 可省略
//     home: '../index.html',                         // 可省略，传字符串即首页地址
//     items: [ { key:'a', icon:'📖', label:'原文', onSelect: fn }, ... ],
//     active: 'a'                                    // 初始高亮，可省略
//   });
//   dock.setActive('b');   // 之后随时切换高亮
//
// 组件只负责渲染与高亮；具体跳转行为由各页传进来的回调决定，
// 因此同一个 Dock 既能当页内面板切换器，也能当跨页导航。
(function () {
  'use strict';

  function makeItem(label) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'sk-dock-item';
    b.setAttribute('data-label', label);
    b.setAttribute('aria-label', label);
    return b;
  }

  function divider() {
    var d = document.createElement('div');
    d.className = 'sk-dock-divider';
    return d;
  }

  function mount(opts) {
    opts = opts || {};

    var prior = document.getElementById('skDock');
    if (prior && prior.parentNode) prior.parentNode.removeChild(prior);

    var root = document.createElement('div');
    root.className = 'sk-dock';
    root.id = 'skDock';
    root.setAttribute('role', 'navigation');
    root.setAttribute('aria-label', '页面快捷导航');

    if (opts.back) {
      var back = makeItem(opts.back.label || '返回上一页');
      back.className += ' sk-dock-back';
      back.textContent = '↩';
      back.addEventListener('click', function () {
        if (typeof opts.back.onClick === 'function') opts.back.onClick();
      });
      root.appendChild(back);
      root.appendChild(divider());
    }

    if (opts.home) {
      var href = typeof opts.home === 'string' ? opts.home : (opts.home.href || '../index.html');
      var hlabel = typeof opts.home === 'string' ? '首页' : (opts.home.label || '首页');
      var home = makeItem(hlabel);
      home.setAttribute('data-key', 'home');
      home.textContent = '🏠';
      home.addEventListener('click', function () { location.href = href; });
      root.appendChild(home);
      root.appendChild(divider());
    }

    (opts.items || []).forEach(function (it) {
      var b = makeItem(it.label || it.key || '');
      b.setAttribute('data-key', it.key || '');
      if (it.text) {
        b.className += ' has-txt';
        // 只给中文标签的项不再塞空图标，避免图标位留出一条空隙
        if (it.icon) {
          var ico = document.createElement('span');
          ico.className = 'sk-dock-ico';
          ico.textContent = it.icon;
          b.appendChild(ico);
        }
        var txt = document.createElement('span');
        txt.className = 'sk-dock-txt';
        txt.textContent = it.text;
        b.appendChild(txt);
      } else {
        b.textContent = it.icon || '';
      }
      b.addEventListener('click', function () {
        if (typeof it.onSelect === 'function') it.onSelect();
      });
      root.appendChild(b);
    });

    document.body.appendChild(root);

    function setActive(key) {
      var items = root.querySelectorAll('.sk-dock-item');
      for (var i = 0; i < items.length; i++) {
        var on = items[i].getAttribute('data-key') === key;
        items[i].classList.toggle('active', on);
      }
    }

    if (opts.active) setActive(opts.active);

    var api = { el: root, setActive: setActive };
    SeeklumeDock.instance = api;
    return api;
  }

  var SeeklumeDock = { mount: mount, instance: null };
  window.SeeklumeDock = SeeklumeDock;
})();
