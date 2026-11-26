/* 原生壳专用：返回键、状态栏、本地提醒。网页版不会加载这个文件。 */
(function () {
  'use strict';

  var Cap = window.Capacitor;
  if (!Cap || !Cap.Plugins) return;   // 浏览器里直接跳过

  var Plugins = Cap.Plugins;

  /* ---------- 安卓返回键 ---------- */
  if (Plugins.App && Plugins.App.addListener) {
    Plugins.App.addListener('backButton', function () {
      var ov = document.getElementById('overlay');
      if (ov && ov.children.length) {
        var mask = ov.querySelector('.mask');
        if (mask) { mask.click(); return; }
      }
      /* 不在首页就先回首页 */
      try {
        if (window.__onelog && window.__onelog.ui.tab !== 'today') {
          var tabBtn = document.querySelector('[data-act="tab"][data-tab="today"]');
          if (tabBtn) { tabBtn.click(); return; }
        }
      } catch (e) { /* ignore */ }
      if (Plugins.App.exitApp) Plugins.App.exitApp();
    });
  }

  /* ---------- 状态栏配色 ---------- */
  if (Plugins.StatusBar) {
    var dark = document.documentElement.dataset.theme === 'dark';
    try {
      Plugins.StatusBar.setStyle({ style: dark ? 'DARK' : 'LIGHT' });
    } catch (e) { /* ignore */ }
  }

  /* ---------- 每天两条提醒（只装一次） ---------- */
  var FLAG = 'onelog.notif.v1';
  if (Plugins.LocalNotifications && !localStorage.getItem(FLAG)) {
    (async function () {
      try {
        var perm = await Plugins.LocalNotifications.requestPermissions();
        if (!perm || perm.display !== 'granted') return;
        await Plugins.LocalNotifications.schedule({
          notifications: [
            {
              id: 1,
              title: '一天',
              body: '今天过得怎么样？花一分钟记下来',
              schedule: { on: { hour: 22, minute: 30 }, repeats: true, allowWhileIdle: true }
            },
            {
              id: 2,
              title: '一天',
              body: '早安，昨晚睡得怎么样？',
              schedule: { on: { hour: 8, minute: 0 }, repeats: true, allowWhileIdle: true }
            }
          ]
        });
        localStorage.setItem(FLAG, '1');
      } catch (e) {
        console.warn('[native] 通知设置失败', e);
      }
    })();
  }
})();
