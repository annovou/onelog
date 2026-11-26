/* ===========================================================
   一天 · 生活记录 —— 原型逻辑
   纯前端 / localStorage / 无依赖
   =========================================================== */
(function () {
  'use strict';

  /* ---------------------------------------------------------
     常量
     --------------------------------------------------------- */
  const KEY = 'onelog.v1';
  const WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const WD = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const WD_CHAR = ['一', '二', '三', '四', '五', '六', '日'];

  const DEFAULT_SETTINGS = {
    sleepGoal: 8, exerciseGoal: 30, studyGoal: 60, waterGoal: 8, mealGoal: 3, theme: 'light',
    ai: null
  };

  const TYPES = {
    sleep:    { name: '睡眠', icon: '🌙', color: 'var(--sleep)' },
    meal:     { name: '饮食', icon: '🍜', color: 'var(--meal)' },
    exercise: { name: '运动', icon: '🏃', color: 'var(--exercise)' },
    study:    { name: '学习', icon: '📖', color: 'var(--study)' },
    mood:     { name: '心情', icon: '💗', color: 'var(--mood)' },
    water:    { name: '喝水', icon: '💧', color: 'var(--water)' },
    body:     { name: '身体', icon: '⚖️', color: 'var(--body)' },
    note:     { name: '日记', icon: '📝', color: 'var(--note)' },
    habit:    { name: '习惯', icon: '✅', color: 'var(--habit)' },
    activity: { name: '活动', icon: '👟', color: 'var(--activity)' }
  };

  const MEAL_TIME = { 早餐: '08:10', 午餐: '12:30', 晚餐: '18:40', 加餐: '15:30', 咖啡: '10:00', 酒: '21:30' };

  const FORMS = {
    sleep: {
      title: '记录睡眠', icon: '🌙',
      fields: [
        { k: 'bed', label: '入睡时间', type: 'time', def: '23:30' },
        { k: 'wake', label: '起床时间', type: 'time', def: '07:00' },
        { k: 'quality', label: '睡眠质量', type: 'range', min: 1, max: 5, def: 4, fmt: v => v + '/5' },
        { k: 'wakeups', label: '夜醒次数', type: 'range', min: 0, max: 5, def: 0, fmt: v => v + ' 次' }
      ]
    },
    meal: {
      title: '记录饮食', icon: '🍜',
      fields: [
        { k: 'meal', label: '餐次', type: 'chips', options: ['早餐', '午餐', '晚餐', '加餐', '咖啡', '酒'], def: '午餐' },
        { k: 'food', label: '吃了什么', type: 'text', wide: true, ph: '牛肉面 + 一份青菜' },
        { k: 'fullness', label: '饱腹感', type: 'range', min: 1, max: 5, def: 4, fmt: v => v + '/5' },
        { k: 'where', label: '来源', type: 'chips', options: ['自炊', '外食', '外卖'], def: '自炊' }
      ]
    },
    exercise: {
      title: '记录运动', icon: '🏃',
      fields: [
        { k: 'kind', label: '类型', type: 'chips', options: ['跑步', '力量', '骑行', '游泳', '瑜伽', '散步', '球类'], def: '跑步' },
        { k: 'minutes', label: '时长', type: 'number', min: 1, max: 600, def: 30, fmt: v => v + ' 分钟' },
        { k: 'distance', label: '距离', type: 'number', min: 0, max: 200, step: 0.1, def: 5, fmt: v => v + ' km' },
        { k: 'rpe', label: '强度', type: 'range', min: 1, max: 10, def: 6, fmt: v => v + '/10' }
      ]
    },
    study: {
      title: '记录学习', icon: '📖',
      fields: [
        { k: 'subject', label: '科目', type: 'text', def: '英语' },
        { k: 'minutes', label: '时长', type: 'number', min: 1, max: 600, def: 45, fmt: v => v + ' 分钟' },
        { k: 'focus', label: '专注度', type: 'range', min: 1, max: 5, def: 4, fmt: v => v + '/5' },
        { k: 'method', label: '方式', type: 'chips', options: ['阅读', '听课', '练习', '写作', '背诵'], def: '阅读' }
      ]
    },
    mood: {
      title: '记录心情', icon: '💗',
      fields: [
        { k: 'score', label: '此刻心情', type: 'mood', def: 4 },
        { k: 'tags', label: '感受', type: 'chips', options: ['平静', '开心', '焦虑', '疲惫', '烦躁', '满足'], def: '平静', multi: true },
        { k: 'trigger', label: '因为', type: 'text', wide: true, ph: '发生了什么' },
        { k: 'energy', label: '精力', type: 'range', min: 1, max: 5, def: 3, fmt: v => v + '/5' }
      ]
    },
    water: {
      title: '记录喝水', icon: '💧',
      fields: [{ k: 'cups', label: '杯数', type: 'number', min: 1, max: 20, def: 1, fmt: v => v + ' 杯' }]
    },
    body: {
      title: '记录身体', icon: '⚖️',
      fields: [
        { k: 'weight', label: '体重', type: 'number', min: 30, max: 200, step: 0.1, def: 68, fmt: v => v + ' kg' },
        { k: 'restingHr', label: '静息心率', type: 'number', min: 30, max: 150, def: 62, fmt: v => v + ' bpm' }
      ]
    },
    note: {
      title: '写点东西', icon: '📝',
      fields: [{ k: 'text', label: '今天', type: 'textarea', wide: true, ph: '想到什么写什么…' }]
    },
    habit: {
      title: '习惯打卡', icon: '✅',
      fields: [
        { k: 'name', label: '做什么', type: 'text', wide: true, def: '冥想 10 分钟' },
        { k: 'done', label: '状态', type: 'chips', options: ['完成', '没做'], def: '完成' }
      ]
    },
    activity: {
      title: '记录日常活动', icon: '👟',
      fields: [
        { k: 'steps', label: '步数', type: 'number', min: 0, max: 100000, def: 6000, fmt: v => v + ' 步' },
        { k: 'activeMin', label: '活动时长', type: 'number', min: 0, max: 600, def: 30, fmt: v => v + ' 分钟' }
      ]
    }
  };

  const AI_DEFAULT = {
    enabled: false,
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
    apiKey: ''
  };

  /* ---------------------------------------------------------
     状态
     --------------------------------------------------------- */
  let state = { events: [], todos: [], settings: Object.assign({}, DEFAULT_SETTINGS) };
  const ui = { tab: 'today', filter: 'all', addDay: 'today', parsed: null, imp: null, editId: null, wd: 'sleep', tlLimit: 14, insCache: null, tcx: null };

  /* dayStats 缓存：任何一次 save() 都会让版本号 +1，从而整体失效 */
  let cacheVer = 0;
  const statsCache = {};

  /* ---------------------------------------------------------
     工具函数
     --------------------------------------------------------- */
  const $ = s => document.querySelector(s);
  const pad = n => (n < 10 ? '0' : '') + n;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function dateKey(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function todayKey() { return dateKey(new Date()); }
  function shiftDay(n) { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + n); return d; }
  function nowHHMM() { const d = new Date(); return pad(d.getHours()) + ':' + pad(d.getMinutes()); }

  function dayFromUI() {
    const off = ui.addDay === 'yesterday' ? -1 : ui.addDay === 'before' ? -2 : 0;
    return dateKey(shiftDay(off));
  }

  function fmtHM(mins) {
    mins = Math.round(mins);
    const h = Math.floor(mins / 60), r = mins % 60;
    if (h && r) return h + ' 小时 ' + r + ' 分';
    if (h) return h + ' 小时';
    return r + ' 分钟';
  }

  function hoursBetween(bed, wake) {
    const b = String(bed).split(':').map(Number);
    const w = String(wake).split(':').map(Number);
    let m = (w[0] * 60 + w[1]) - (b[0] * 60 + b[1]);
    if (m <= 0) m += 1440;
    return Math.round(m / 6) / 10;
  }

  function uid(t) { return t + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  function mkEvent(type, data, dayStr, hhmm, source) {
    return {
      id: uid(type), type: type,
      ts: dayStr + 'T' + (hhmm || nowHHMM()) + ':00',
      data: data, note: '', source: source || 'manual',
      createdAt: new Date().toISOString()
    };
  }

  /* ---------------------------------------------------------
     存储
     --------------------------------------------------------- */
  function save() {
    cacheVer++;
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) { toast('存储空间不足'); }
  }

  function load() {
    let raw = null;
    try { raw = localStorage.getItem(KEY); } catch (e) { raw = null; }
    if (raw) {
      try {
        const p = JSON.parse(raw);
        state.events = Array.isArray(p.events) ? p.events : [];
        state.todos = Array.isArray(p.todos) ? p.todos : [];
        state.settings = Object.assign({}, DEFAULT_SETTINGS, p.settings || {});
        state.settings.ai = Object.assign({}, AI_DEFAULT, (p.settings && p.settings.ai) || {});
        return;
      } catch (e) { /* 数据坏了就走种子 */ }
    }
    seedDemo(21);
    state.settings.ai = Object.assign({}, AI_DEFAULT);
    save();
  }

  /* ---------------------------------------------------------
     示例数据
     --------------------------------------------------------- */
  function seedDemo(days) {
    const evs = [];
    const foods = {
      早餐: ['豆浆油条', '鸡蛋三明治', '燕麦牛奶', '包子 + 豆浆', '全麦面包 + 咖啡'],
      午餐: ['牛肉面', '鸡胸肉沙拉', '番茄炒蛋盖饭', '日式咖喱', '食堂三菜一汤', '麻辣烫'],
      晚餐: ['清蒸鱼 + 青菜', '火锅', '意面', '饺子', '烧烤', '蔬菜汤 + 鸡胸'],
      加餐: ['酸奶', '坚果', '水果', '一块蛋糕']
    };
    const subjects = ['英语', '算法', '读书', '吉他', '产品设计', '数据结构'];
    const kinds = ['跑步', '力量', '骑行', '散步', '瑜伽'];
    const moodTags = ['平静', '开心', '疲惫', '满足', '焦虑'];
    const notes = ['今天效率还行，晚上有点走神。', '和很久没见的朋友吃了饭。', '天气很好，出门走了一圈。', '加班到很晚，没怎么运动。'];

    let prevEx = false;
    const start = days - 1;

    for (let i = start; i >= 0; i--) {
      const d = shiftDay(-i);
      const k = dateKey(d);
      const R = Math.random;

      /* 运动 */
      const hasEx = R() < 0.55;
      let exMin = 0;
      if (hasEx) {
        exMin = 20 + Math.round(R() * 40);
        const kind = kinds[Math.floor(R() * kinds.length)];
        evs.push(mkEvent('exercise', {
          kind: kind, minutes: exMin, distance: kind === '跑步' ? Math.round(exMin / 6 * 10) / 10 : 0, rpe: 4 + Math.floor(R() * 5)
        }, k, '19:10', 'seed'));
      }

      /* 睡眠 */
      const base = 6.2 + R() * 1.5 + (prevEx ? 0.55 : 0);
      const hours = Math.round(clamp(base, 5.3, 8.6) * 10) / 10;
      const bedMin = (22 * 60 + 40) + Math.round((R() * 130 - 20));
      let wakeMin = bedMin + Math.round(hours * 60);
      if (wakeMin >= 1440) wakeMin -= 1440;
      const bedH = Math.floor(bedMin / 60) % 24, bedM = bedMin % 60;
      const wakeH = Math.floor(wakeMin / 60) % 24, wakeM = wakeMin % 60;
      const bed = pad(bedH) + ':' + pad(bedM);
      const wake = pad(wakeH) + ':' + pad(wakeM);
      const quality = clamp(Math.round(2 + (hours - 5.5) * 0.9), 1, 5);
      evs.push(mkEvent('sleep', { bed: bed, wake: wake, hours: hours, quality: quality, wakeups: Math.floor(R() * 3) }, k, wake, 'seed'));

      /* 学习 */
      const studyMin = hours >= 7 ? Math.round(45 + R() * 65) : Math.round(8 + R() * 38);
      if (studyMin > 12 && R() < 0.85) {
        evs.push(mkEvent('study', {
          subject: subjects[Math.floor(R() * subjects.length)],
          minutes: studyMin,
          focus: clamp(Math.round(1.6 + (hours - 5.5) * 0.7), 1, 5),
          method: ['阅读', '听课', '练习'][Math.floor(R() * 3)]
        }, k, '20:40', 'seed'));
      }

      /* 三餐 */
      ['早餐', '午餐', '晚餐'].forEach(m => {
        const list = foods[m];
        evs.push(mkEvent('meal', {
          meal: m,
          food: list[Math.floor(R() * list.length)],
          fullness: 3 + Math.floor(R() * 3),
          where: ['自炊', '外食', '外卖'][Math.floor(R() * 3)]
        }, k, MEAL_TIME[m], 'seed'));
      });
      if (R() < 0.35) {
        const list = foods['加餐'];
        evs.push(mkEvent('meal', { meal: '加餐', food: list[Math.floor(R() * list.length)], fullness: 3, where: '外食' }, k, MEAL_TIME['加餐'], 'seed'));
      }
      if (R() < 0.4) {
        evs.push(mkEvent('meal', { meal: '咖啡', food: '美式', fullness: 1, where: '外食' }, k, '10:20', 'seed'));
      }

      /* 喝水 */
      evs.push(mkEvent('water', { cups: 3 + Math.floor(R() * 6) }, k, '16:00', 'seed'));

      /* 心情 */
      const moodScore = clamp(Math.round(2.4 + (hours - 6.6) * 0.8 + (hasEx ? 0.7 : 0) + (R() - 0.5) * 1.1), 1, 5);
      evs.push(mkEvent('mood', {
        score: moodScore,
        tags: [moodTags[Math.floor(R() * moodTags.length)]],
        trigger: '',
        energy: clamp(moodScore, 1, 5)
      }, k, '21:40', 'seed'));

      /* 身体 */
      if (i % 3 === 0) {
        evs.push(mkEvent('body', { weight: Math.round((68.9 - (start - i) * 0.05 + (R() - 0.5) * 0.4) * 10) / 10, restingHr: 58 + Math.floor(R() * 8) }, k, '07:20', 'seed'));
      }

      /* 日记 */
      if (R() < 0.2) {
        evs.push(mkEvent('note', { text: notes[Math.floor(R() * notes.length)] }, k, '22:30', 'seed'));
      }

      prevEx = hasEx;
    }

    state.events = evs;
    const tk = todayKey();
    state.todos = [
      { id: uid('t'), text: '把原型跑一遍，看看手感', done: false, date: tk },
      { id: uid('t'), text: '晚上 11 点前放下手机', done: false, date: tk }
    ];
  }

  /* ---------------------------------------------------------
     统计
     --------------------------------------------------------- */
  function eventsOf(dayKey) {
    return state.events.filter(e => e.ts.slice(0, 10) === dayKey);
  }

  function dayStats(dayKey) {
    const hit = statsCache[dayKey];
    if (hit && hit.v === cacheVer) return hit.s;
    const evs = eventsOf(dayKey);
    const sum = (t, f) => evs.filter(e => e.type === t).reduce((a, e) => a + (f(e.data || {}) || 0), 0);
    const sleepEv = evs.find(e => e.type === 'sleep' && e.data);
    const moodEv = evs.filter(e => e.type === 'mood' && e.data).slice(-1)[0];
    const res = {
      key: dayKey,
      recorded: evs.length,
      sleep: sum('sleep', d => d.hours),
      sleepQ: sleepEv ? (sleepEv.data.quality || 0) : 0,
      meals: evs.filter(e => e.type === 'meal' && d_notDrink(e)).length,
      exercise: sum('exercise', d => d.minutes),
      exerciseN: evs.filter(e => e.type === 'exercise').length,
      study: sum('study', d => d.minutes),
      water: sum('water', d => d.cups),
      mood: moodEv ? (moodEv.data.score || 0) : 0,
      steps: sum('activity', d => d.steps),
      events: evs
    };
    statsCache[dayKey] = { v: cacheVer, s: res };
    return res;
  }

  function d_notDrink(e) { return e.data && e.data.meal && e.data.meal !== '咖啡' && e.data.meal !== '酒'; }

  function lastNKeys(n, offset) {
    offset = offset || 0;
    const out = [];
    for (let i = n - 1; i >= 0; i--) out.push(dateKey(shiftDay(-i - n * offset)));
    return out;
  }

  function weekSummary(offset) {
    const keys = lastNKeys(7, offset || 0);
    const S = keys.map(dayStats);
    const withSleep = S.filter(s => s.sleep > 0);
    const sum = (arr, f) => arr.reduce((a, x) => a + f(x), 0);
    return {
      recordDays: S.filter(s => s.recorded > 0).length,
      sleepAvg: withSleep.length ? sum(withSleep, s => s.sleep) / withSleep.length : 0,
      exerciseN: sum(S, s => s.exerciseN),
      exerciseMin: sum(S, s => s.exercise),
      studyMin: sum(S, s => s.study),
      waterAvg: S.length ? sum(S, s => s.water) / S.length : 0,
      moodAvg: (function () {
        const m = S.filter(s => s.mood > 0);
        return m.length ? sum(m, s => s.mood) / m.length : 0;
      })()
    };
  }

  function calcStreak() {
    let n = 0;
    let d = shiftDay(0);
    if (dayStats(dateKey(d)).recorded === 0) d = shiftDay(-1);
    while (dayStats(dateKey(d)).recorded > 0) {
      n++;
      d = new Date(d.getTime() - 86400000);
      if (n > 999) break;
    }
    return n;
  }

  /* ---------------------------------------------------------
     星期维度
     --------------------------------------------------------- */

  /* 0 = 周一 … 6 = 周日 */
  function weekdayOf(dayKey) {
    const d = new Date(dayKey + 'T00:00:00');
    return (d.getDay() + 6) % 7;
  }

  /* 按星期几分桶，返回 7 个 {w, sum, n, avg} */
  function weekdayBuckets(metric, days) {
    const out = [];
    for (let i = 0; i < 7; i++) out.push({ w: i, sum: 0, n: 0, avg: 0 });
    lastNKeys(days || 28).forEach(function (k) {
      const v = dayStats(k)[metric] || 0;
      if (!v) return;
      const b = out[weekdayOf(k)];
      b.sum += v;
      b.n += 1;
    });
    out.forEach(function (b) { b.avg = b.n ? b.sum / b.n : 0; });
    return out;
  }

  /* 睡眠时长的标准差（小时），样本不足返回 null */
  function sleepRegularity(days) {
    const vals = lastNKeys(days || 28).map(k => dayStats(k).sleep).filter(v => v > 0);
    if (vals.length < 5) return null;
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const varr = vals.reduce((a, b) => a + (b - mean) * (b - mean), 0) / vals.length;
    return Math.sqrt(varr);
  }

  /* 入睡时刻换算成「分钟」，凌晨算作 24 点之后，便于求平均 */
  function bedMinutes(bed) {
    const p = String(bed || '').split(':').map(Number);
    if (p.length !== 2 || isNaN(p[0]) || isNaN(p[1])) return null;
    return (p[0] < 12 ? p[0] + 24 : p[0]) * 60 + p[1];
  }

  const WD_META = {
    sleep: { label: '睡眠', unit: 'h', color: '#4A5B8C', fix: 1 },
    mood: { label: '情绪', unit: '分', color: '#E8697D', fix: 1 },
    study: { label: '学习', unit: 'min', color: '#8B5CF6', fix: 0 },
    exercise: { label: '运动', unit: 'min', color: '#3E9B6B', fix: 0 }
  };

  function weekdayCard() {
    const m = ui.wd || 'sleep';
    const meta = WD_META[m];
    const b = weekdayBuckets(m, 28);
    const max = Math.max.apply(null, b.map(x => x.avg).concat([0]));
    const has = max > 0;

    const tabs = Object.keys(WD_META).map(function (k) {
      return '<button class="fchip' + (k === m ? ' on' : '') + '" data-act="wd" data-m="' + k + '">' +
        WD_META[k].label + '</button>';
    }).join('');

    let body = '';
    if (!has) {
      body = '<div class="empty" style="padding:24px 0">这 28 天还没有足够的数据</div>';
    } else {
      body = '<div class="bars">' + b.map(function (x) {
        const pct = x.avg ? clamp(x.avg / max * 100, 5, 100) : 0;
        const isMax = x.avg > 0 && x.avg === max;
        return '<div class="bar-col">' +
          '<div class="bar-val">' + (x.avg ? x.avg.toFixed(meta.fix) : '') + '</div>' +
          '<div class="bar-track"><div class="bar" style="height:' + pct + '%;background:' + meta.color +
            ';opacity:' + (isMax ? 1 : .5) + '"></div></div>' +
          '<div class="bar-lbl">' + WD_CHAR[x.w] + '</div>' +
        '</div>';
      }).join('') + '</div>';
    }

    let note = '';
    if (has) {
      const valid = b.filter(x => x.avg > 0);
      const sorted = valid.slice().sort((x, y) => x.avg - y.avg);
      const bad = sorted[0], good = sorted[sorted.length - 1];
      if (valid.length >= 2 && good.avg - bad.avg > 0.05) {
        note = '周' + WD_CHAR[good.w] + '最好（平均 <b>' + good.avg.toFixed(meta.fix) + ' ' + meta.unit +
          '</b>），周' + WD_CHAR[bad.w] + '最差（<b>' + bad.avg.toFixed(meta.fix) + ' ' + meta.unit + '</b>）。';
      } else {
        note = '这几天差不多，没什么明显的节奏。';
      }
      if (m === 'sleep') {
        const sd = sleepRegularity(28);
        if (sd != null) note += '　作息波动 <b>±' + Math.round(sd * 60) + '</b> 分钟。';
      }
    }

    return '<div class="chart-card">' +
      '<div class="chart-head"><span class="chart-title">一周节奏</span>' +
        '<span class="chart-legend">最近 28 天</span></div>' +
      '<div class="filters inline">' + tabs + '</div>' +
      body +
      (note ? '<div class="chart-note">' + note + '</div>' : '') +
    '</div>';
  }

  /* ---------------------------------------------------------
     文案生成
     --------------------------------------------------------- */
  function describe(e) {
    const d = e.data || {};
    switch (e.type) {
      case 'sleep':
        return {
          t: '睡了 ' + fmtHM((d.hours || 0) * 60),
          m: (d.bed || '--:--') + ' – ' + (d.wake || '--:--') + ' · 质量 ' + (d.quality || '-') + '/5'
        };
      case 'meal':
        return {
          t: (d.meal || '饮食') + '：' + (d.food || '—'),
          m: [d.where, d.fullness ? '饱腹 ' + d.fullness + '/5' : ''].filter(Boolean).join(' · ')
        };
      case 'exercise': {
        const parts = [fmtHM(d.minutes || 0)];
        if (d.distance) parts.push(d.distance + ' km');
        if (d.rpe) parts.push('强度 ' + d.rpe + '/10');
        if (d.elevGain) parts.push('爬升 ' + d.elevGain + ' m');
        if (d.avgHr) parts.push('均心率 ' + d.avgHr);
        return { t: (d.kind || '运动'), m: parts.join(' · ') };
      }
      case 'study':
        return {
          t: '学习 · ' + (d.subject || '未命名'),
          m: [fmtHM(d.minutes || 0), d.method, d.focus ? '专注 ' + d.focus + '/5' : ''].filter(Boolean).join(' · ')
        };
      case 'mood': {
        const emo = ['😞', '😕', '😐', '🙂', '😄'][clamp((d.score || 3) - 1, 0, 4)];
        return {
          t: '心情 ' + emo + ' ' + (d.score || '') + '/5',
          m: [].concat(d.tags || []).filter(Boolean).join('、') + (d.trigger ? ' · ' + d.trigger : '')
        };
      }
      case 'water':
        return { t: '喝水 ' + (d.cups || 1) + ' 杯', m: '' };
      case 'body':
        return { t: '体重 ' + (d.weight || '—') + ' kg', m: d.restingHr ? '静息心率 ' + d.restingHr + ' bpm' : '' };
      case 'note':
        return { t: '日记', m: (d.text || '').slice(0, 40) };
      case 'habit':
        return { t: (d.done === '没做' ? '未完成 ' : '完成 ') + (d.name || ''), m: '' };
      case 'activity':
        return {
          t: '走了 ' + Number(d.steps || 0).toLocaleString('zh-CN') + ' 步',
          m: d.activeMin ? '活动 ' + fmtHM(d.activeMin) : ''
        };
      default:
        return { t: e.type, m: '' };
    }
  }

  function greeting() {
    const h = new Date().getHours();
    if (h < 5) return '还没睡？';
    if (h < 9) return '早上好';
    if (h < 12) return '上午好';
    if (h < 14) return '中午好';
    if (h < 18) return '下午好';
    if (h < 23) return '晚上好';
    return '夜深了';
  }

  /* ---------------------------------------------------------
     今日一句
     --------------------------------------------------------- */
  function todayQuote() {
    const s = dayStats(todayKey());
    const keys = lastNKeys(7);
    const S = keys.map(dayStats);
    const withSleep = S.filter(x => x.sleep > 0);
    const avgSleep = withSleep.length ? withSleep.reduce((a, x) => a + x.sleep, 0) / withSleep.length : 0;

    if (s.exercise > 0) {
      const maxEx = Math.max.apply(null, S.map(x => x.exercise).concat([0]));
      if (s.exercise >= maxEx) return '今天动了 ' + s.exercise + ' 分钟，是最近一周最多的一天。';
      return '今天动了 ' + s.exercise + ' 分钟。身体会记住这件事。';
    }
    if (s.sleep > 0 && avgSleep > 0) {
      const diff = Math.round((s.sleep - avgSleep) * 60);
      if (Math.abs(diff) >= 15) {
        return '昨晚睡了 ' + s.sleep.toFixed(1) + ' 小时，比最近一周平均' + (diff > 0 ? '多 ' : '少 ') + Math.abs(diff) + ' 分钟。';
      }
      return '昨晚睡了 ' + s.sleep.toFixed(1) + ' 小时，和最近一周的平均水平差不多。';
    }
    if (s.study > 0) return '今天学了 ' + fmtHM(s.study) + '，专注的这段时间是你自己的。';
    if (s.recorded >= 3) return '今天已经记了 ' + s.recorded + ' 条，晚上再补一句就完整了。';
    if (s.recorded === 0) {
      const b = weekdayBuckets('sleep', 28).filter(x => x.n >= 4 && x.avg > 0);
      if (b.length >= 5) {
        const sorted = b.slice().sort((x, y) => x.avg - y.avg);
        const worst = sorted[0], best = sorted[sorted.length - 1];
        if (worst.w === weekdayOf(todayKey()) && best.avg - worst.avg >= 0.5) {
          return '周' + WD_CHAR[worst.w] + '你历来睡得最少（平均 ' + worst.avg.toFixed(1) + ' 小时）。今晚早点躺下吧。';
        }
      }
      return '今天还是空白的。想记点什么？';
    }
    return '记录本身就是一种看见。今天过得怎么样？';
  }

  /* ---------------------------------------------------------
     洞察计算
     --------------------------------------------------------- */
  function computeInsights() {
    const S = lastNKeys(28).map(dayStats);
    const out = [];
    const avg = a => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
    const r0 = n => Math.round(n);

    /* R1 睡眠 → 学习 */
    (function () {
      const hi = [], lo = [], rows = [];
      S.forEach(function (s) {
        if (!s.sleep) return;
        (s.sleep >= 7 ? hi : lo).push(s.study);
        rows.push({ d: s.key, a: s.sleep, b: s.study });
      });
      if (hi.length >= 3 && lo.length >= 3) {
        const a = avg(hi), b = avg(lo);
        if (Math.abs(a - b) >= 10) {
          out.push({
            ico: '📖', t: '睡眠 × 学习', cols: ['睡眠 (h)', '学习 (min)'],
            rows: rows.slice(-14).reverse(),
            x: '睡满 7 小时的 <b>' + hi.length + '</b> 天，你平均学习 <b>' + r0(a) + '</b> 分钟；不足 7 小时的 <b>' + lo.length + '</b> 天只有 <b>' + r0(b) + '</b> 分钟。'
          });
        }
      }
    })();

    /* R2 睡眠 → 情绪 */
    (function () {
      const hi = [], lo = [], rows = [];
      S.forEach(function (s) {
        if (!s.sleep || !s.mood) return;
        (s.sleep >= 7 ? hi : lo).push(s.mood);
        rows.push({ d: s.key, a: s.sleep, b: s.mood });
      });
      if (hi.length >= 3 && lo.length >= 3) {
        const a = avg(hi), b = avg(lo);
        if (Math.abs(a - b) >= 0.4) {
          out.push({
            ico: '💗', t: '睡眠 × 情绪', cols: ['睡眠 (h)', '情绪 (1-5)'],
            rows: rows.slice(-14).reverse(),
            x: '睡饱的日子情绪平均 <b>' + a.toFixed(1) + '</b> 分，睡眠不足时 <b>' + b.toFixed(1) + '</b> 分，差 <b>' + Math.abs(a - b).toFixed(1) + '</b> 分。'
          });
        }
      }
    })();

    /* R3 运动 → 当晚睡眠 */
    (function () {
      const ex = [], no = [], rows = [];
      for (let i = 0; i < S.length - 1; i++) {
        const next = S[i + 1];
        if (!next.sleep) continue;
        rows.push({ d: S[i].key, a: S[i].exercise, b: next.sleep });
        if (S[i].exercise > 0) ex.push(next.sleep);
        else if (S[i].recorded > 0) no.push(next.sleep);
      }
      if (ex.length >= 3 && no.length >= 3) {
        const a = avg(ex), b = avg(no);
        const diff = Math.round((a - b) * 60);
        if (Math.abs(diff) >= 15) {
          out.push({
            ico: '🌙', t: '运动 × 睡眠', cols: ['当天运动 (min)', '当晚睡眠 (h)'],
            rows: rows.filter(r => r.a > 0).slice(-14).reverse(),
            x: '运动的那天，你当晚平均' + (diff > 0 ? '多睡 ' : '少睡 ') + '<b>' + Math.abs(diff) + '</b> 分钟（<b>' + ex.length + '</b> 天 vs <b>' + no.length + '</b> 天）。'
          });
        }
      }
    })();

    /* R6 星期几效应 */
    (function () {
      const b = weekdayBuckets('sleep', 28).filter(x => x.n >= 3 && x.avg > 0);
      if (b.length < 5) return;
      const sorted = b.slice().sort((x, y) => x.avg - y.avg);
      const bad = sorted[0], good = sorted[sorted.length - 1];
      const gap = good.avg - bad.avg;
      if (gap < 0.5) return;
      out.push({
        ico: '📅', t: '星期几效应', cols: ['平均睡眠 (h)', '样本天数'],
        rows: b.map(x => ({ d: WD[x.w], a: x.avg, b: x.n })),
        x: '你' + WD[bad.w] + '平均只睡 <b>' + bad.avg.toFixed(1) + '</b> 小时，' + WD[good.w] +
           '能睡 <b>' + good.avg.toFixed(1) + '</b> 小时，差 <b>' + gap.toFixed(1) + '</b> 小时。'
      });
    })();

    /* R7 社交时差 */
    (function () {
      const byDay = {};
      state.events.forEach(function (e) {
        if (e.type === 'sleep' && e.data && /^\d{2}:\d{2}$/.test(e.data.bed || '')) byDay[e.ts.slice(0, 10)] = e;
      });
      const wk = [], we = [];
      lastNKeys(28).forEach(function (k) {
        if (!byDay[k]) return;
        const m = bedMinutes(byDay[k].data.bed);
        if (m == null) return;
        (weekdayOf(k) >= 5 ? we : wk).push(m);
      });
      if (wk.length < 5 || we.length < 4) return;
      const a = wk.reduce((x, y) => x + y, 0) / wk.length;
      const b2 = we.reduce((x, y) => x + y, 0) / we.length;
      const diff = Math.round(b2 - a);
      if (Math.abs(diff) < 20) return;
      out.push({
        ico: '🌗', t: '社交时差',
        x: '周末你平均比工作日' + (diff > 0 ? '晚睡 ' : '早睡 ') + '<b>' + Math.abs(diff) + '</b> 分钟（' +
           wk.length + ' 个工作日 / ' + we.length + ' 个周末）。'
      });
    })();

    /* R5 周对比 */
    (function () {
      const cur = weekSummary(0), prev = weekSummary(1);
      if (cur.sleepAvg > 0 && prev.sleepAvg > 0) {
        const diff = Math.round((cur.sleepAvg - prev.sleepAvg) * 60);
        if (Math.abs(diff) >= 10) {
          out.push({
            ico: '📊', t: '本周 vs 上周',
            x: '本周平均睡眠 <b>' + cur.sleepAvg.toFixed(1) + '</b> 小时，比上周' + (diff > 0 ? '多 ' : '少 ') + '<b>' + Math.abs(diff) + '</b> 分钟。'
          });
        }
      }
    })();

    /* R4 记录坚持 */
    (function () {
      const n = S.filter(s => s.recorded > 0).length;
      if (n >= 7) {
        out.push({
          ico: '✍️', t: '记录习惯',
          x: '最近 28 天里你记录了 <b>' + n + '</b> 天，<b>' + Math.round(n / 28 * 100) + '%</b> 的日子留下了痕迹。'
        });
      }
    })();

    return out;
  }

  /* ---------------------------------------------------------
     渲染：骨架
     --------------------------------------------------------- */
  function render() {
    document.documentElement.dataset.theme = state.settings.theme;
    renderTopbar();
    renderMain();
    renderTabbar();
  }

  function renderTopbar() {
    const tb = $('#topbar');
    const now = new Date();
    if (ui.tab === 'today') {
      tb.innerHTML =
        '<div><h1 class="tb-title">' + (now.getMonth() + 1) + '月' + now.getDate() + '日 ' +
        '<span style="font-weight:500;color:var(--ink3);font-size:15px">' + WEEK[now.getDay()] + '</span></h1>' +
        '<div class="tb-sub">' + greeting() + ' · 今天记了 ' + eventsOf(todayKey()).length + ' 条</div></div>' +
        '<div class="streak">🔥 <b>' + calcStreak() + '</b> 天</div>';
    } else if (ui.tab === 'timeline') {
      tb.innerHTML =
        '<div><h1 class="tb-title">时间轴</h1><div class="tb-sub">共 ' + state.events.length + ' 条记录</div></div>';
    } else if (ui.tab === 'insights') {
      tb.innerHTML =
        '<div><h1 class="tb-title">洞察</h1><div class="tb-sub">最近 7 天 · 关联分析用 28 天</div></div>';
    } else {
      tb.innerHTML =
        '<div><h1 class="tb-title">我的</h1><div class="tb-sub">本地存储 · 不上传任何数据</div></div>';
    }
  }

  function renderTabbar() {
    const items = [
      { k: 'today', label: '今天', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="8.2"/><path d="M12 7.5v5l3 1.8"/></svg>' },
      { k: 'timeline', label: '时间轴', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h11M4 17h7"/></svg>' },
      null,
      { k: 'insights', label: '洞察', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M5 19V11M12 19V5M19 19v-5"/></svg>' },
      { k: 'me', label: '我的', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="8.5" r="3.6"/><path d="M5 20c.8-3.4 3.6-5.4 7-5.4s6.2 2 7 5.4"/></svg>' }
    ];
    $('#tabbar').innerHTML = items.map(function (it) {
      if (!it) return '<button class="tab-add" data-act="add" aria-label="记录">＋</button>';
      return '<button class="tab' + (ui.tab === it.k ? ' on' : '') + '" data-act="tab" data-tab="' + it.k + '">' +
        it.icon + '<span>' + it.label + '</span></button>';
    }).join('');
  }

  function renderMain(keepScroll) {
    const m = $('#main');
    const sc = m.scrollTop;
    if (ui.tab === 'today') m.innerHTML = viewToday();
    else if (ui.tab === 'timeline') m.innerHTML = viewTimeline();
    else if (ui.tab === 'insights') m.innerHTML = viewInsights();
    else m.innerHTML = viewMe();
    m.scrollTop = keepScroll ? sc : 0;
  }

  /* ---------------------------------------------------------
     渲染：今天
     --------------------------------------------------------- */
  function viewToday() {
    const s = dayStats(todayKey());
    const st = state.settings;

    const cards = [
      { type: 'sleep', ico: '🌙', name: '睡眠', val: s.sleep ? s.sleep.toFixed(1) : '—', unit: 'h', pct: s.sleep / st.sleepGoal, goal: '目标 ' + st.sleepGoal + 'h' },
      { type: 'meal', ico: '🍜', name: '饮食', val: s.meals || '—', unit: '餐', pct: s.meals / st.mealGoal, goal: '目标 ' + st.mealGoal + ' 餐' },
      { type: 'exercise', ico: '🏃', name: '运动', val: s.exercise || '—', unit: 'min', pct: s.exercise / st.exerciseGoal, goal: '目标 ' + st.exerciseGoal + 'min' },
      { type: 'study', ico: '📖', name: '学习', val: s.study || '—', unit: 'min', pct: s.study / st.studyGoal, goal: '目标 ' + st.studyGoal + 'min' }
    ];

    const cardsHtml = cards.map(c =>
      '<button class="mcard" data-act="form" data-type="' + c.type + '">' +
        '<div class="mcard-top"><span class="mcard-ico">' + c.ico + '</span><span class="mcard-name">' + c.name + '</span></div>' +
        '<div class="mcard-val">' + c.val + '<span>' + c.unit + '</span></div>' +
        '<div class="mcard-sub">' + c.goal + '</div>' +
        '<div class="mbar"><i style="width:' + clamp(Math.round(c.pct * 100), 0, 100) + '%;background:' + TYPES[c.type].color + '"></i></div>' +
      '</button>'
    ).join('');

    const todos = state.todos.filter(t => t.date === todayKey());
    const todoHtml = todos.length
      ? todos.map(t =>
          '<div class="todo' + (t.done ? ' done' : '') + '">' +
            '<button class="check' + (t.done ? ' on' : '') + '" data-act="todo-toggle" data-id="' + t.id + '"></button>' +
            '<span class="todo-text">' + esc(t.text) + '</span>' +
            '<button class="todo-del" data-act="todo-del" data-id="' + t.id + '">✕</button>' +
          '</div>').join('')
      : '<div class="todo"><span class="todo-text" style="color:var(--ink3)">今天还没有安排，加一件最重要的事</span></div>';

    const quick = [
      { q: 'water', ico: '💧', label: '喝水' },
      { q: 'coffee', ico: '☕', label: '咖啡' },
      { q: 'run', ico: '🏃', label: '跑步' },
      { q: 'read', ico: '📖', label: '读书' },
      { q: 'mood', ico: '💗', label: '心情' },
      { q: 'weight', ico: '⚖️', label: '体重' },
      { q: 'note', ico: '📝', label: '日记' }
    ].map(x => '<button class="qbtn" data-act="quick" data-q="' + x.q + '"><span>' + x.ico + '</span>' + x.label + '</button>').join('');

    const todayEvs = eventsOf(todayKey()).slice().sort((a, b) => b.ts.localeCompare(a.ts));
    const preview = todayEvs.slice(0, 5).map(rowHtml).join('') ||
      '<div class="empty"><span class="empty-ico">🌤</span>今天还是空白的<br>点下面的 ＋ 记下第一件事' +
      '<div style="margin-top:14px"><button class="btn btn-ghost" data-act="add-yesterday">补记昨天</button></div></div>';

    return '<div class="page">' +
      '<div class="quote"><span class="quote-k">今日一句</span>' + esc(todayQuote()) + '</div>' +
      '<div class="grid2">' + cardsHtml + '</div>' +
      '<div class="section">' +
        '<div class="section-head"><span class="section-title">今日三件事</span></div>' +
        '<div class="card">' + todoHtml +
          '<div class="todo-add">' +
            '<input id="todoInput" type="text" placeholder="添加一件…" maxlength="60">' +
            '<button data-act="todo-add">添加</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="section">' +
        '<div class="section-head"><span class="section-title">快捷记录</span></div>' +
        '<div class="quick">' + quick + '</div>' +
      '</div>' +
      '<div class="section">' +
        '<div class="section-head"><span class="section-title">今天的记录</span>' +
          (todayEvs.length > 5 ? '<button class="section-more" data-act="tab" data-tab="timeline">全部 ' + todayEvs.length + ' 条 →</button>' : '') +
        '</div>' + preview +
      '</div>' +
    '</div>';
  }

  function rowHtml(e) {
    const d = describe(e);
    const c = TYPES[e.type] ? TYPES[e.type].color : 'var(--ink3)';
    return '<div class="trow" data-act="row-open" data-id="' + e.id + '">' +
      '<div class="ttime">' + e.ts.slice(11, 16) + '</div>' +
      '<div class="tdot" style="background:' + c + '"></div>' +
      '<div class="tbody"><div class="ttitle">' + esc(d.t) + '</div>' +
      (d.m ? '<div class="tmeta">' + esc(d.m) + '</div>' : '') + '</div>' +
      '</div>';
  }

  /* ---------------------------------------------------------
     渲染：时间轴
     --------------------------------------------------------- */
  function viewTimeline() {
    const filters = [['all', '全部']].concat(Object.keys(TYPES).map(k => [k, TYPES[k].name]));
    const fHtml = filters.map(f =>
      '<button class="fchip' + (ui.filter === f[0] ? ' on' : '') + '" data-act="filter" data-f="' + f[0] + '">' + f[1] + '</button>'
    ).join('');

    let evs = state.events.slice();
    if (ui.filter !== 'all') evs = evs.filter(e => e.type === ui.filter);

    if (!evs.length) {
      return '<div class="page"><div class="filters">' + fHtml + '</div>' +
        '<div class="empty" style="padding-top:60px"><span class="empty-ico">🗂</span>还没有记录<br>点下面的 ＋ 开始</div></div>';
    }

    const groups = {};
    evs.forEach(e => {
      const k = e.ts.slice(0, 10);
      (groups[k] = groups[k] || []).push(e);
    });
    const keys = Object.keys(groups).sort().reverse();
    const tk = todayKey(), yk = dateKey(shiftDay(-1));

    /* 长期使用后一天天数以千计，只渲染最近若干天，其余按需加载 */
    const limit = ui.tlLimit || 14;
    const shown = keys.slice(0, limit);
    const rest = keys.length - shown.length;

    const body = shown.map(k => {
      const list = groups[k].slice().sort((a, b) => b.ts.localeCompare(a.ts));
      const d = new Date(k + 'T00:00:00');
      const badge = k === tk ? '<span class="tl-today">今天</span>' : k === yk ? '<span class="tl-today" style="background:var(--ink3)">昨天</span>' : '';
      return '<div class="tl-group">' +
        '<div class="tl-head"><span class="tl-date">' + (d.getMonth() + 1) + '月' + d.getDate() + '日</span>' +
        '<span class="tl-wd">' + WEEK[d.getDay()] + ' · ' + list.length + ' 条</span>' + badge + '</div>' +
        list.map(rowHtml).join('') +
      '</div>';
    }).join('');

    const more = rest > 0
      ? '<button class="btn btn-ghost btn-block" data-act="tl-more" style="margin-top:10px">' +
        '加载更早的 ' + Math.min(rest, 14) + ' 天 · 还有 ' + rest + ' 天</button>'
      : '';

    return '<div class="page"><div class="filters">' + fHtml + '</div>' + body + more + '</div>';
  }

  /* ---------------------------------------------------------
     渲染：洞察
     --------------------------------------------------------- */
  function viewInsights() {
    const cur = weekSummary(0), prev = weekSummary(1);
    const keys = lastNKeys(7);
    const S = keys.map(dayStats);

    const stat = (k, v, unit, dcur, dprev, invert) => {
      let dh = '';
      if (dprev > 0 && dcur !== dprev) {
        const pct = Math.round((dcur - dprev) / dprev * 100);
        if (isFinite(pct) && pct !== 0) {
          const up = pct > 0;
          const good = invert ? !up : up;
          dh = '<div class="delta ' + (good ? 'up' : 'down') + '">' + (up ? '↑' : '↓') + ' ' + Math.abs(pct) + '% 较上周</div>';
        }
      }
      return '<div class="stat"><div class="stat-k">' + k + '</div>' +
        '<div class="stat-v">' + v + '<em>' + unit + '</em></div>' + dh + '</div>';
    };

    const statsHtml =
      stat('记录天数', cur.recordDays, '天', cur.recordDays, prev.recordDays, false) +
      stat('平均睡眠', cur.sleepAvg ? cur.sleepAvg.toFixed(1) : '—', 'h', cur.sleepAvg, prev.sleepAvg, false) +
      stat('运动次数', cur.exerciseN, '次', cur.exerciseN, prev.exerciseN, false) +
      stat('学习时长', Math.round(cur.studyMin), 'min', cur.studyMin, prev.studyMin, false);

    /* 睡眠柱图 */
    const sleepVals = S.map(s => s.sleep);
    const sleepMax = Math.max(state.settings.sleepGoal + 0.5, Math.max.apply(null, sleepVals.concat([0])) + 0.3);
    const barsHtml = S.map((s, i) => {
      const d = new Date(keys[i] + 'T00:00:00');
      const pct = s.sleep ? clamp(s.sleep / sleepMax * 100, 4, 100) : 0;
      return '<div class="bar-col">' +
        '<div class="bar-val">' + (s.sleep ? s.sleep.toFixed(1) : '') + '</div>' +
        '<div class="bar-track">' +
          '<div class="bar-goal" style="bottom:' + (state.settings.sleepGoal / sleepMax * 100) + '%"></div>' +
          '<div class="bar" style="height:' + pct + '%;background:var(--sleep)"></div>' +
        '</div>' +
        '<div class="bar-lbl">' + (d.getMonth() + 1) + '/' + d.getDate() + '</div>' +
      '</div>';
    }).join('');

    /* 情绪折线 */
    const moodVals = S.map(s => s.mood);
    const lineHtml = lineChart(moodVals, 5, '#E8697D');

    /* 洞察卡 */
    const ins = computeInsights();
    ui.insCache = ins;
    const insHtml = ins.length
      ? ins.map(function (i, idx) {
          const tap = i.rows && i.rows.length;
          return '<div class="insight' + (tap ? ' tap' : '') + '"' +
            (tap ? ' data-act="insp" data-i="' + idx + '"' : '') + '>' +
            '<div class="insight-ico">' + i.ico + '</div>' +
            '<div class="insight-body"><div class="insight-t">' + i.t + '</div>' +
            '<div class="insight-x">' + i.x + '</div></div>' +
            (tap ? '<div class="insight-more">›</div>' : '') +
          '</div>';
        }).join('')
      : '<div class="empty"><span class="empty-ico">🔍</span>数据还太少，再记几天就能看到规律了</div>';

    return '<div class="page">' +
      '<div class="stat-grid">' + statsHtml + '</div>' +

      '<div class="section">' +
        '<div class="section-head"><span class="section-title">睡眠 7 日</span><span class="chart-legend">虚线 = 目标</span></div>' +
        '<div class="chart-card"><div class="bars">' + barsHtml + '</div></div>' +
      '</div>' +

      '<div class="section">' +
        '<div class="section-head"><span class="section-title">情绪 7 日</span></div>' +
        '<div class="chart-card">' + lineHtml + '</div>' +
      '</div>' +

      '<div class="section">' + weekdayCard() + '</div>' +

      '<div class="section">' +
        '<div class="section-head"><span class="section-title">发现</span></div>' + insHtml +
        '<div class="disclaimer">以上是相关性，不是因果。你的身体只有你自己最清楚。</div>' +
      '</div>' +

      '<div class="section">' +
        '<button class="btn btn-primary btn-block" data-act="report">查看本周周报 →</button>' +
      '</div>' +
    '</div>';
  }

  function lineChart(vals, max, color) {
    const w = 300, h = 80;
    const pts = vals.map(function (v, i) {
      if (!v) return null;
      return [vals.length === 1 ? w / 2 : i / (vals.length - 1) * w, h - (v / max) * (h - 12) - 6];
    });
    const valid = pts.filter(Boolean);
    if (valid.length < 2) {
      return '<div class="empty" style="padding:20px 0">这周还没记心情</div>';
    }
    const path = valid.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    const area = path + ' L' + valid[valid.length - 1][0].toFixed(1) + ' ' + h + ' L' + valid[0][0].toFixed(1) + ' ' + h + ' Z';
    const dots = valid.map(p => '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="3" fill="' + color + '"/>').join('');
    const grid = [0.25, 0.5, 0.75].map(function (g) {
      return '<line x1="0" y1="' + (h * g).toFixed(1) + '" x2="' + w + '" y2="' + (h * g).toFixed(1) + '" stroke="var(--line)" stroke-width="1" stroke-dasharray="3 3"/>';
    }).join('');

    return '<svg viewBox="0 0 ' + w + ' ' + h + '">' +
      '<defs><linearGradient id="mg" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="' + color + '" stop-opacity=".22"/>' +
      '<stop offset="100%" stop-color="' + color + '" stop-opacity="0"/></linearGradient></defs>' +
      grid +
      '<path d="' + area + '" fill="url(#mg)"/>' +
      '<path d="' + path + '" fill="none" stroke="' + color + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>' +
      dots + '</svg>';
  }

  /* ---------------------------------------------------------
     渲染：我的
     --------------------------------------------------------- */
  function viewMe() {
    const st = state.settings;
    const step = (k, label, unit, min, max, delta, desc) =>
      '<div class="set-row"><div><div class="set-label">' + label + '</div>' +
      (desc ? '<div class="set-desc">' + desc + '</div>' : '') + '</div>' +
      '<div class="stepper"><button data-act="goal" data-k="' + k + '" data-d="' + (-delta) + '">−</button>' +
      '<span>' + st[k] + ' ' + unit + '</span>' +
      '<button data-act="goal" data-k="' + k + '" data-d="' + delta + '">+</button></div></div>';

    return '<div class="page">' +

      '<div class="set-group-title">目标</div>' +
      '<div class="set-group">' +
        step('sleepGoal', '睡眠', 'h', 4, 12, 0.5) +
        step('exerciseGoal', '运动', 'min', 5, 180, 5) +
        step('studyGoal', '学习', 'min', 10, 300, 10) +
        step('waterGoal', '喝水', '杯', 1, 16, 1) +
        step('mealGoal', '三餐', '餐', 1, 6, 1) +
      '</div>' +

      '<div class="set-group-title">外观</div>' +
      '<div class="set-group"><div class="set-row">' +
        '<div><div class="set-label">主题</div><div class="set-desc">晚上用深色更舒服</div></div>' +
        '<div class="seg">' +
          '<button class="' + (st.theme === 'light' ? 'on' : '') + '" data-act="theme" data-v="light">浅色</button>' +
          '<button class="' + (st.theme === 'dark' ? 'on' : '') + '" data-act="theme" data-v="dark">深色</button>' +
        '</div>' +
      '</div></div>' +

      '<div class="set-group-title">智能解析</div>' +
      '<div class="set-group">' +
        '<div class="set-row"><div><div class="set-label">AI 造句解析</div>' +
          '<div class="set-desc">' + (aiReady() ? '已开启 · ' + esc(state.settings.ai.model) : '未配置 · 使用本地规则') + '</div></div>' +
          '<button class="link-btn" data-act="ai-settings">设置</button></div>' +
      '</div>' +

      '<div class="set-group-title">手表数据</div>' +
      '<div class="set-group">' +
        '<div class="set-row"><div><div class="set-label">导入手表 / 健康数据</div>' +
          '<div class="set-desc">TCX 轨迹、CSV、JSON、ZIP 都行</div></div>' +
          '<button class="link-btn" data-act="imp-open">导入</button></div>' +
        '<div class="set-row"><div><div class="set-label">Health Connect 自动同步</div>' +
          '<div class="set-desc">' + esc(healthDesc()) + '</div></div>' +
          '<button class="link-btn" data-act="hc-sync">同步</button></div>' +
      '</div>' +

      '<div class="set-group-title">数据</div>' +
      '<div class="set-group">' +
        '<div class="set-row"><div><div class="set-label">导出备份</div><div class="set-desc">JSON 格式，可随时导入回来</div></div>' +
          '<button class="link-btn" data-act="export">导出</button></div>' +
        '<div class="set-row"><div><div class="set-label">导入备份</div><div class="set-desc">会覆盖当前全部数据</div></div>' +
          '<button class="link-btn" data-act="import">选择文件</button></div>' +
        '<div class="set-row"><div><div class="set-label">重新生成示例数据</div><div class="set-desc">用来体验完整效果</div></div>' +
          '<button class="link-btn" data-act="seed">生成</button></div>' +
        '<div class="set-row"><div><div class="set-label">清空全部数据</div><div class="set-desc">不可恢复</div></div>' +
          '<button class="link-btn danger" data-act="clear">清空</button></div>' +
      '</div>' +

      '<div class="set-group-title">关于</div>' +
      '<div class="set-group">' +
        '<div class="set-row"><span class="set-label">版本</span><span class="set-desc" style="margin:0">v1.9 · 原型</span></div>' +
        '<div class="set-row"><span class="set-label">存储</span><span class="set-desc" style="margin:0">仅本机 localStorage</span></div>' +
      '</div>' +

      '<div class="disclaimer" style="margin-top:24px">数据只存在这台设备的浏览器里。<br>清理浏览器数据会丢失，记得定期导出备份。</div>' +
    '</div>';
  }

  /* ---------------------------------------------------------
     浮层
     --------------------------------------------------------- */
  function closeOverlay() {
    $('#overlay').innerHTML = '';
    ui.parsed = null;
    ui.editId = null;
    pendingSleep = null;
    ui.tcx = null;
  }

  function openAdd(day) {
    ui.addDay = day || 'today';
    const grid = Object.keys(TYPES).map(k =>
      '<button class="type-btn" data-act="form" data-type="' + k + '">' +
        '<span>' + TYPES[k].icon + '</span><span>' + TYPES[k].name + '</span></button>'
    ).join('');

    const dayBtn = (d, label) =>
      '<button data-act="day" data-d="' + d + '"' + (ui.addDay === d ? ' class="on"' : '') + '>' + label + '</button>';

    $('#overlay').innerHTML =
      '<div class="mask" data-act="close"></div>' +
      '<div class="sheet">' +
        '<div class="sheet-grab"></div>' +
        '<div class="sheet-head"><div class="sheet-title">记录</div>' +
          '<button class="sheet-close" data-act="close">✕</button></div>' +
        '<div class="sheet-body">' +
          '<div class="date-seg">' +
            dayBtn('today', '今天') + dayBtn('yesterday', '昨天') + dayBtn('before', '前天') +
          '</div>' +
          '<div class="ai-box">' +
            '<textarea id="aiInput" placeholder="用一句话记下来，例如：&#10;昨晚12点睡，中午吃了牛肉面，&#10;下午跑了5公里，晚上学了1小时英语"></textarea>' +
            '<div class="ai-foot"><span class="ai-hint">' +
              (aiReady() ? 'AI 解析 · ' + esc(state.settings.ai.model) : '自动拆成多条 · 本地规则') +
              '</span>' +
              '<button class="btn btn-primary" data-act="ai-parse">' + (aiReady() ? 'AI 解析' : '解析') + '</button></div>' +
          '</div>' +
          '<div class="divider">或手动记录</div>' +
          '<div class="type-grid">' + grid + '</div>' +
        '</div>' +
      '</div>';
  }

  function renderField(fd, vals) {
    const has = vals && vals[fd.k] !== undefined && vals[fd.k] !== null && vals[fd.k] !== '';
    let cur = has ? vals[fd.k] : fd.def;
    let ctl = '';

    if (fd.type === 'time') {
      const v = /^\d{2}:\d{2}$/.test(cur) ? cur : fd.def;
      ctl = '<input class="field-input" type="time" data-f="' + fd.k + '" value="' + v + '">';
    } else if (fd.type === 'text') {
      ctl = '<input class="field-input" type="text" data-f="' + fd.k + '" value="' + esc(cur || '') + '" placeholder="' + (fd.ph || '') + '" maxlength="100">';
    } else if (fd.type === 'number') {
      let v = Number(cur);
      if (!isFinite(v)) v = fd.def;
      v = clamp(v, fd.min, fd.max);
      ctl = '<input class="field-input" type="number" data-f="' + fd.k + '" value="' + v + '" min="' + fd.min + '" max="' + fd.max + '" step="' + (fd.step || 1) + '" style="max-width:110px">';
    } else if (fd.type === 'range') {
      let v = Number(cur);
      if (!isFinite(v)) v = fd.def;
      v = clamp(v, fd.min, fd.max);
      ctl = '<input type="range" data-f="' + fd.k + '" min="' + fd.min + '" max="' + fd.max + '" step="' + (fd.step || 1) + '" value="' + v + '">' +
            '<span class="range-val" id="rv_' + fd.k + '">' + fd.fmt(v) + '</span>';
    } else if (fd.type === 'chips') {
      const arr = Array.isArray(cur) ? cur.map(String) : [String(cur)];
      ctl = '<div class="chip-row" data-f="' + fd.k + '"' + (fd.multi ? ' data-multi="1"' : '') + '>' +
        fd.options.map(o => '<button type="button" class="chip' + (arr.indexOf(o) >= 0 ? ' sel' : '') + '" data-val="' + o + '">' + o + '</button>').join('') +
        '</div>';
    } else if (fd.type === 'mood') {
      let v = Number(cur);
      if (!isFinite(v) || v < 1) v = fd.def;
      ctl = '<div class="mood-row" data-f="' + fd.k + '">' +
        ['😞', '😕', '😐', '🙂', '😄'].map((e, i) =>
          '<button type="button" class="mood-btn' + (i + 1 === v ? ' sel' : '') + '" data-val="' + (i + 1) + '">' + e + '</button>').join('') +
        '</div>';
    } else if (fd.type === 'textarea') {
      ctl = '<textarea class="field-input" data-f="' + fd.k + '" rows="4" placeholder="' + (fd.ph || '') + '" style="text-align:left;max-width:none;resize:none;line-height:1.6">' + esc(cur || '') + '</textarea>';
    }

    if (fd.type === 'text' || fd.type === 'textarea') {
      return '<div class="field-block"><div class="field-label">' + fd.label + '</div>' + ctl + '</div>';
    }
    return '<div class="field"><span class="field-label">' + fd.label + '</span>' +
      '<div class="field-ctl">' + ctl + '</div></div>';
  }

  function openForm(type, ev) {
    const f = FORMS[type];
    if (!f) return;
    const vals = ev ? (ev.data || {}) : null;
    ui.editId = ev ? ev.id : null;

    const fields = f.fields.map(fd => renderField(fd, vals)).join('');

    const dateRow = ev
      ? '<div class="field"><span class="field-label">日期</span><div class="field-ctl">' +
        '<input class="field-input" type="date" data-f="__date" value="' + ev.ts.slice(0, 10) + '" style="max-width:150px">' +
        '</div></div>'
      : '';

    /* 只有编辑时才能换类型 */
    const typeRow = ev
      ? '<div class="retype-row">' + Object.keys(TYPES).map(function (k) {
          return '<button class="rchip' + (k === type ? ' on' : '') + '" data-act="retype" data-type="' + k + '">' +
            TYPES[k].icon + ' ' + TYPES[k].name + '</button>';
        }).join('') + '</div>'
      : '';

    const total = type === 'sleep'
      ? '<div class="sleep-total">共 <b id="sleepTotal">7.5</b> 小时</div>'
      : '';

    $('#overlay').innerHTML =
      '<div class="mask" data-act="close"></div>' +
      '<div class="sheet">' +
        '<div class="sheet-grab"></div>' +
        '<div class="sheet-head"><div class="sheet-title">' + f.icon + ' ' +
          (ev ? '编辑 · ' + TYPES[type].name : f.title) + '</div>' +
          '<button class="sheet-close" data-act="close">✕</button></div>' +
        '<div class="sheet-body">' + typeRow + dateRow + fields + total + '</div>' +
        '<div class="sheet-foot">' +
          '<button class="btn btn-primary btn-block" data-act="save" data-type="' + type + '">' +
          (ev ? '保存修改' : '保存') + '</button>' +
        '</div>' +
      '</div>';

    if (type === 'sleep') updateSleepTotal();
  }

  function updateSleepTotal() {
    const bed = document.querySelector('[data-f="bed"]');
    const wake = document.querySelector('[data-f="wake"]');
    const out = document.getElementById('sleepTotal');
    if (bed && wake && out) out.textContent = hoursBetween(bed.value, wake.value).toFixed(1);
  }

  function collect() {
    const data = {};
    document.querySelectorAll('#overlay input[data-f], #overlay textarea[data-f], #overlay select[data-f]').forEach(function (inp) {
      const k = inp.dataset.f;
      if (inp.type === 'number' || inp.type === 'range') data[k] = Number(inp.value);
      else data[k] = inp.value;
    });
    document.querySelectorAll('#overlay .chip-row[data-f], #overlay .mood-row[data-f]').forEach(function (row) {
      const k = row.dataset.f;
      const sels = Array.prototype.map.call(row.querySelectorAll('.sel'), b => b.dataset.val);
      data[k] = row.dataset.multi === '1' ? sels : (sels[0] || '');
    });
    return data;
  }

  /* ---------------------------------------------------------
     保存记录
     --------------------------------------------------------- */
  function saveForm(type) {
    const data = collect();
    const editingId = ui.editId;
    const pickedDay = data.__date;
    delete data.__date;

    let hhmm = nowHHMM();
    if (type === 'sleep') {
      data.hours = hoursBetween(data.bed, data.wake);
      hhmm = data.wake;
    } else if (type === 'meal') {
      hhmm = MEAL_TIME[data.meal] || nowHHMM();
    } else if (type === 'study' && !String(data.subject || '').trim()) {
      data.subject = '未命名';
    } else if (type === 'note' && !String(data.text || '').trim()) {
      toast('写点什么再保存吧');
      return;
    }

    /* 编辑已有记录 */
    if (editingId) {
      const ev = state.events.find(e => e.id === editingId);
      if (!ev) { closeOverlay(); render(); toast('这条记录已经不在了'); return; }

      /* 存一份改之前的快照，用于撤销 */
      const before = {
        type: ev.type,
        data: JSON.parse(JSON.stringify(ev.data || {})),
        ts: ev.ts,
        editedAt: ev.editedAt
      };
      const typeChanged = ev.type !== type;

      const day = pickedDay || ev.ts.slice(0, 10);
      const time = (type === 'sleep' || type === 'meal') ? hhmm : ev.ts.slice(11, 16);

      ev.type = type;
      /* 保留表单覆盖不到的字段（比如 TCX 导入的爬升、心率） */
      ev.data = Object.assign({}, before.data, data);
      ev.ts = day + 'T' + time + ':00';
      ev.editedAt = new Date().toISOString();

      pushUndo(typeChanged ? '转换类型' : '编辑', function () {
        ev.type = before.type;
        ev.data = before.data;
        ev.ts = before.ts;
        ev.editedAt = before.editedAt;
      });

      save();
      closeOverlay();
      render();
      toast(typeChanged ? '已转为 · ' + TYPES[type].name : '已更新', { label: '撤销' });
      return;
    }

    const day = pickedDay || dayFromUI();

    /* 同一天已有睡眠记录时，别默默叠加成 15 小时 */
    if (type === 'sleep') {
      const dup = state.events.find(e => e.type === 'sleep' && e.ts.slice(0, 10) === day && e.data);
      if (dup) { openSleepConflict(dup, data, day, hhmm); return; }
    }

    const created = mkEvent(type, data, day, hhmm, 'manual');
    state.events.push(created);
    pushUndo('新增', function () { removeEvents([created.id]); });

    save();
    closeOverlay();
    render();
    toast('已记录 · ' + TYPES[type].name, { label: '撤销' });
  }

  /* ---------------------------------------------------------
     自然语言解析
     --------------------------------------------------------- */
  function parseText(text) {
    const parts = String(text).split(/[，,。；;、\n]+|然后|还有|以及/).map(s => s.trim()).filter(Boolean);
    const out = [];
    parts.forEach(function (p) {
      const r = parseClause(p);
      if (r) out.push(r);
    });
    return out;
  }

  function parseClause(p) {
    const day = dayFromUI();

    /* 睡眠：说了总时长 */
    let m = p.match(/(?:睡|睡眠)了?\s*(\d+(?:\.\d+)?)\s*个?\s*(?:小时|h|钟头)/);
    if (m) {
      const h = clamp(parseFloat(m[1]), 0.5, 16);
      const bedMin = 23 * 60 + 30;
      let wakeMin = bedMin + Math.round(h * 60);
      if (wakeMin >= 1440) wakeMin -= 1440;
      const bed = pad(Math.floor(bedMin / 60)) + ':30';
      const wake = pad(Math.floor(wakeMin / 60)) + ':' + pad(wakeMin % 60);
      return mkEvent('sleep', { bed: bed, wake: wake, hours: Math.round(h * 10) / 10, quality: 4, wakeups: 0 }, day, wake, 'ai');
    }

    /* 睡眠：说了入睡/起床时间 */
    const bedM = p.match(/(\d{1,2})\s*[:：点]\s*(\d{1,2})?\s*(?:睡|入睡|上床)/);
    const wakeM = p.match(/(\d{1,2})\s*[:：点]\s*(\d{1,2})?\s*(?:起|醒)/);
    if (bedM || wakeM) {
      let bed = bedM ? normTime(bedM[1], bedM[2], 'bed') : '';
      let wake = wakeM ? normTime(wakeM[1], wakeM[2], 'wake') : '';
      if (!bed && wake) bed = shiftTime(wake, -Math.round(7.5 * 60));
      if (!wake && bed) wake = shiftTime(bed, Math.round(7.5 * 60));
      return mkEvent('sleep', { bed: bed, wake: wake, hours: hoursBetween(bed, wake), quality: 4, wakeups: 0 }, day, wake, 'ai');
    }

    /* 学习 */
    m = p.match(/(?:学习|学|看书|读书|背单词|写代码|听课|复习|练琴|上课)了?\s*(\d+(?:\.\d+)?)\s*(分钟|min|小时|h)\s*(.*)$/);
    if (m) {
      let mins = parseFloat(m[1]);
      if (/小时|h/.test(m[2])) mins *= 60;
      const subject = (m[3] || '').replace(/[的了]/g, '').trim().slice(0, 12) || guessSubject(p);
      return mkEvent('study', { subject: subject, minutes: Math.round(mins), focus: 4, method: '阅读' }, day, '20:40', 'ai');
    }

    /* 运动 */
    m = p.match(/(跑|走|骑|游|练|瑜伽|散步|球|健身)[了]?\s*(\d+(?:\.\d+)?)\s*(公里|km|分钟|min|小时|h)/);
    if (m) {
      const kindMap = { 跑: '跑步', 走: '散步', 骑: '骑行', 游: '游泳', 瑜伽: '瑜伽', 散步: '散步', 球: '球类', 练: '力量', 健身: '力量' };
      const v = parseFloat(m[2]);
      const unit = m[3];
      let km = 0, mins = 0;
      if (/公里|km/.test(unit)) { km = v; mins = Math.round(v * 6); }
      else if (/小时|h/.test(unit)) { mins = Math.round(v * 60); }
      else { mins = Math.round(v); }
      return mkEvent('exercise', { kind: kindMap[m[1]] || '运动', minutes: mins, distance: km, rpe: 6 }, day, '19:10', 'ai');
    }

    /* 喝水 */
    if (/喝水|一杯水|两杯水|三杯水|杯水/.test(p)) {
      const n = p.match(/([一二三四五六七八九十\d]+)\s*杯/);
      const map = { 一: 1, 两: 2, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6 };
      const cups = n ? (map[n[1]] || parseInt(n[1], 10) || 1) : 1;
      return mkEvent('water', { cups: cups }, day, nowHHMM(), 'ai');
    }

    /* 咖啡 */
    if (/咖啡|拿铁|美式|latte/i.test(p)) {
      return mkEvent('meal', { meal: '咖啡', food: '咖啡', fullness: 1, where: '外食' }, day, '10:20', 'ai');
    }

    /* 饮食 */
    m = p.match(/(早上|上午|中午|下午|晚上|早餐|午餐|晚餐|早饭|午饭|晚饭|加餐|夜宵|吃了|喝了)(.*)$/);
    if (m) {
      const map = { 早饭: '早餐', 午饭: '午餐', 晚饭: '晚餐', 夜宵: '加餐', 早上: '早餐', 上午: '早餐', 中午: '午餐', 下午: '加餐', 晚上: '晚餐' };
      let meal = map[m[1]] || m[1];
      let food = (m[2] || '').replace(/^(?:吃了|喝了|吃|喝|了|个)+/, '').trim();
      if (meal === '吃了' || meal === '喝了') {
        meal = guessMeal();
      }
      return mkEvent('meal', { meal: meal, food: food || '—', fullness: 4, where: '自炊' }, day, MEAL_TIME[meal] || nowHHMM(), 'ai');
    }

    /* 体重 */
    m = p.match(/(\d{2,3}(?:\.\d)?)\s*(公斤|kg|斤)/i);
    if (m) {
      let w = parseFloat(m[1]);
      if (m[2] === '斤') w = Math.round(w / 2 * 10) / 10;
      return mkEvent('body', { weight: w, restingHr: 0 }, day, nowHHMM(), 'ai');
    }

    /* 心情 */
    const moodMap = { 开心: 5, 兴奋: 5, 高兴: 5, 平静: 4, 满足: 4, 一般: 3, 还行: 3, 疲惫: 2, 累: 2, 烦躁: 2, 难过: 1, 焦虑: 1, 低落: 1, 崩溃: 1 };
    for (const k in moodMap) {
      if (p.indexOf(k) >= 0) {
        return mkEvent('mood', { score: moodMap[k], tags: [k], trigger: '', energy: moodMap[k] }, day, nowHHMM(), 'ai');
      }
    }

    return null;
  }

  function normTime(h, m, kind) {
    let hh = parseInt(h, 10), mm = m ? parseInt(m, 10) : 0;
    hh = clamp(hh, 0, 24) % 24;
    mm = clamp(mm, 0, 59);
    /* 口语里的"11点睡"= 23:00，"12点睡"= 00:00 */
    if (kind === 'bed' && hh >= 6 && hh < 13) hh = (hh + 12) % 24;
    return pad(hh) + ':' + pad(mm);
  }

  function shiftTime(t, deltaMin) {
    const p = t.split(':').map(Number);
    let m = p[0] * 60 + p[1] + deltaMin;
    m = ((m % 1440) + 1440) % 1440;
    return pad(Math.floor(m / 60)) + ':' + pad(m % 60);
  }

  function guessMeal() {
    const h = new Date().getHours();
    if (h < 10) return '早餐';
    if (h < 15) return '午餐';
    if (h < 21) return '晚餐';
    return '加餐';
  }

  function guessSubject(p) {
    if (/英语|单词|雅思|托福/.test(p)) return '英语';
    if (/代码|编程|算法|数据结构/.test(p)) return '编程';
    if (/书|阅读/.test(p)) return '读书';
    if (/琴|吉他|钢琴/.test(p)) return '乐器';
    return '学习';
  }

  /* ---------------------------------------------------------
     解析结果预览
     --------------------------------------------------------- */
  function showPreview(items) {
    ui.parsed = items.map(e => ({ ev: e, on: true }));
    const list = ui.parsed.map(function (it, i) {
      const d = describe(it.ev);
      const c = TYPES[it.ev.type];
      return '<div class="preview-item" data-act="pv-toggle" data-i="' + i + '">' +
        '<div class="preview-ico">' + c.icon + '</div>' +
        '<div class="preview-body"><div class="preview-t">' + esc(d.t) + '</div>' +
        '<div class="preview-m">' + esc(d.m || c.name) + ' · ' + it.ev.ts.slice(11, 16) + '</div></div>' +
        '<div style="font-size:15px;color:var(--ink3)">' + (it.on ? '✓' : '') + '</div>' +
      '</div>';
    }).join('');

    $('#overlay').innerHTML =
      '<div class="mask" data-act="close"></div>' +
      '<div class="sheet">' +
        '<div class="sheet-grab"></div>' +
        '<div class="sheet-head"><div class="sheet-title">识别到 ' + items.length + ' 条</div>' +
          '<button class="sheet-close" data-act="close">✕</button></div>' +
        '<div class="sheet-body">' +
          '<div style="font-size:11.5px;color:var(--ink3);margin-bottom:10px">点一下可以取消某条</div>' +
          list +
        '</div>' +
        '<div class="sheet-foot" style="display:flex;gap:10px">' +
          '<button class="btn btn-ghost" data-act="pv-back" style="flex:0 0 96px">重来</button>' +
          '<button class="btn btn-primary" data-act="pv-confirm" style="flex:1">确认添加</button>' +
        '</div>' +
      '</div>';
  }

  function togglePreview(i) {
    if (!ui.parsed || !ui.parsed[i]) return;
    ui.parsed[i].on = !ui.parsed[i].on;
    const el = document.querySelector('.preview-item[data-i="' + i + '"]');
    if (el) {
      el.classList.toggle('off', !ui.parsed[i].on);
      el.lastElementChild.textContent = ui.parsed[i].on ? '✓' : '';
    }
  }

  function confirmPreview() {
    const chosen = (ui.parsed || []).filter(x => x.on).map(x => x.ev);
    if (!chosen.length) { toast('没有选中任何一条'); return; }
    chosen.forEach(e => state.events.push(e));
    const ids = chosen.map(e => e.id);
    pushUndo('新增', function () { removeEvents(ids); });
    save();
    closeOverlay();
    render();
    toast('已添加 ' + chosen.length + ' 条记录', { label: '撤销' });
  }

  /* ---------------------------------------------------------
     周报
     --------------------------------------------------------- */
  function openReport() {
    const cur = weekSummary(0);
    const keys = lastNKeys(7);
    const S = keys.map(dayStats);

    /* 过去 4 周（不含本周）的基线 */
    const olds = [1, 2, 3, 4].map(o => weekSummary(o));
    const avgOf = function (arr) {
      const v = arr.filter(x => x > 0);
      return v.length ? v.reduce((x, y) => x + y, 0) / v.length : 0;
    };
    const base = {
      sleep: avgOf(olds.map(w => w.sleepAvg)),
      exercise: avgOf(olds.map(w => w.exerciseMin)),
      study: avgOf(olds.map(w => w.studyMin)),
      days: avgOf(olds.map(w => w.recordDays))
    };

    const num = function (k, v, unit, baseV, fix) {
      let d = '&nbsp;';
      if (baseV) {
        const diff = Number(v) - baseV;
        if (!isFinite(diff)) d = '&nbsp;';
        else if (Math.abs(diff) < 0.05) d = '与 4 周均值持平';
        else d = '4 周均值 ' + baseV.toFixed(fix) + ' ' + unit +
          ' <span class="' + (diff > 0 ? 'up' : 'down') + '">' + (diff > 0 ? '↑' : '↓') +
          Math.abs(diff).toFixed(fix) + '</span>';
      }
      return '<div class="rn"><div class="rn-k">' + k + '</div>' +
        '<div class="rn-v">' + v + '<em>' + unit + '</em></div>' +
        '<div class="rn-d">' + d + '</div></div>';
    };

    /* 近 5 周睡眠趋势 */
    const trend = [4, 3, 2, 1, 0].map(o => weekSummary(o).sleepAvg);
    const trendMax = Math.max(state.settings.sleepGoal, Math.max.apply(null, trend.concat([0]))) + 0.3;
    const trendBars = trend.map(function (v, i) {
      const lbl = ['4周前', '3周前', '2周前', '上周', '本周'][i];
      const pct = v ? clamp(v / trendMax * 100, 5, 100) : 0;
      return '<div class="bar-col">' +
        '<div class="bar-val">' + (v ? v.toFixed(1) : '') + '</div>' +
        '<div class="bar-track"><div class="bar" style="height:' + pct + '%;background:var(--sleep);opacity:' +
          (i === 4 ? 1 : .5) + '"></div></div>' +
        '<div class="bar-lbl">' + lbl + '</div></div>';
    }).join('');

    /* 最佳一天 */
    let best = null, bestScore = -1;
    S.forEach(function (s) {
      if (!s.recorded) return;
      const sc = (s.sleep ? s.sleep / 8 : 0) + (s.exercise ? Math.min(s.exercise / 30, 1.5) : 0) +
                 (s.study ? Math.min(s.study / 60, 1.5) : 0) + (s.mood ? s.mood / 5 : 0);
      if (sc > bestScore) { bestScore = sc; best = s; }
    });

    let bestHtml = '<div class="best-day"><div class="bd-k">本周最佳</div><div class="bd-t">还没有完整的一天</div>' +
      '<div class="bd-s">记录满 3 条就可以评出最佳的一天。</div></div>';
    if (best) {
      const d = new Date(best.key + 'T00:00:00');
      const bits = [];
      if (best.sleep) bits.push('睡了 ' + best.sleep.toFixed(1) + ' 小时');
      if (best.exercise) bits.push('运动 ' + best.exercise + ' 分钟');
      if (best.study) bits.push('学习 ' + fmtHM(best.study));
      if (best.mood) bits.push('心情 ' + best.mood + '/5');
      bestHtml = '<div class="best-day"><div class="bd-k">本周最佳</div>' +
        '<div class="bd-t">' + (d.getMonth() + 1) + '月' + d.getDate() + '日 · ' + WEEK[d.getDay()] + '</div>' +
        '<div class="bd-s">' + (bits.join('，') || '这天你留下了记录') + '。</div></div>';
    }

    /* 建议：优先看趋势，再看单周 */
    let advice;
    const sleepDrop = base.sleep ? (cur.sleepAvg - base.sleep) : 0;
    if (base.sleep && sleepDrop <= -0.3) {
      advice = '这周比过去 4 周平均少睡了 ' + Math.round(-sleepDrop * 60) + ' 分钟。先别加新习惯，把这一项补回来就够了。';
    } else if (cur.sleepAvg && cur.sleepAvg < 7) {
      advice = '这周平均只睡了 ' + cur.sleepAvg.toFixed(1) + ' 小时。下周试试把上床时间提前 30 分钟，只改这一件事，看看情绪会不会不一样。';
    } else if (cur.exerciseN < 3) {
      advice = '这周运动了 ' + cur.exerciseN + ' 次。下周安排 2 次 20 分钟的散步，走的时候不带手机，把它当成给大脑的休息。';
    } else if (cur.studyMin < 120) {
      advice = '这周学习 ' + Math.round(cur.studyMin) + ' 分钟。下周挑一个固定的 30 分钟时段，只做一件事，不切窗口。';
    } else if (cur.recordDays < 5) {
      advice = '这周记了 ' + cur.recordDays + ' 天。下周目标不是记得更全，而是每天至少留下 1 条。';
    } else {
      advice = '这周状态不错。下周保持现在的节奏就好，别加码——能长期做下去比做得更多重要。';
    }

    const range = (function () {
      const a = new Date(keys[0] + 'T00:00:00'), b = new Date(keys[6] + 'T00:00:00');
      return (a.getMonth() + 1) + '月' + a.getDate() + '日 – ' + (b.getMonth() + 1) + '月' + b.getDate() + '日';
    })();

    $('#overlay').innerHTML =
      '<div class="report">' +
        '<div class="report-head"><span class="set-desc" style="margin:0">' + range + '</span>' +
          '<button class="sheet-close" data-act="report-close">✕</button></div>' +
        '<div class="report-body">' +
          '<div class="report-hero">' +
            '<div class="rh-k">WEEKLY REPORT</div>' +
            '<div class="rh-t">这一周，你记了 ' + cur.recordDays + ' 天</div>' +
            '<div class="rh-s">' + esc(todayQuote()) + '</div>' +
          '</div>' +
          '<div class="report-nums">' +
            num('平均睡眠', cur.sleepAvg ? cur.sleepAvg.toFixed(1) : '—', 'h', base.sleep, 1) +
            num('运动', cur.exerciseMin, 'min', base.exercise, 0) +
            num('学习', Math.round(cur.studyMin), 'min', base.study, 0) +
            num('记录天数', cur.recordDays, '天', base.days, 1) +
          '</div>' +
          '<div class="section" style="margin-top:16px">' +
            '<div class="chart-card">' +
              '<div class="chart-head"><span class="chart-title">近 5 周 · 平均睡眠</span>' +
                '<span class="chart-legend">虚线可对照目标</span></div>' +
              '<div class="bars">' + trendBars + '</div>' +
            '</div>' +
          '</div>' +
          bestHtml +
          '<div class="advice"><div class="advice-k">下周可以试一件事</div>' +
            '<div class="advice-t">' + esc(advice) + '</div></div>' +
          '<div class="disclaimer" style="margin-top:22px">周报是自动生成的，只统计你记下来的东西。</div>' +
        '</div>' +
      '</div>';
  }

  /* ---------------------------------------------------------
     洞察下钻
     --------------------------------------------------------- */

  function fmtDayLabel(d) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(d))) return String(d);
    const dt = new Date(d + 'T00:00:00');
    return (dt.getMonth() + 1) + '/' + dt.getDate() + ' ' + WEEK[dt.getDay()];
  }

  function fmtCell(v) {
    if (typeof v !== 'number') return String(v);
    return Math.abs(v - Math.round(v)) < 0.01 ? String(Math.round(v)) : v.toFixed(1);
  }

  function openInsightDetail(idx) {
    const it = (ui.insCache || [])[idx];
    if (!it || !it.rows) return;
    const cols = it.cols || ['数值 A', '数值 B'];
    const rows = it.rows.map(function (r) {
      return '<tr><td>' + esc(fmtDayLabel(r.d)) + '</td>' +
        '<td>' + esc(fmtCell(r.a)) + '</td>' +
        '<td>' + esc(fmtCell(r.b)) + '</td></tr>';
    }).join('');

    $('#overlay').innerHTML =
      '<div class="mask" data-act="close"></div>' +
      '<div class="sheet">' +
        '<div class="sheet-grab"></div>' +
        '<div class="sheet-head"><div class="sheet-title">' + esc(it.t) + '</div>' +
          '<button class="sheet-close" data-act="close">✕</button></div>' +
        '<div class="sheet-body">' +
          '<div class="hint-box">' + String(it.x).replace(/<\/?b>/g, '') + '</div>' +
          '<div class="tbl-wrap"><table class="preview"><thead><tr>' +
            '<th>日期</th><th>' + esc(cols[0]) + '</th><th>' + esc(cols[1]) + '</th>' +
          '</tr></thead><tbody>' + rows + '</tbody></table></div>' +
          '<div class="disclaimer" style="margin-top:10px">最多显示最近 14 条，用来核对结论是怎么来的。</div>' +
        '</div>' +
      '</div>';
  }

  /* 同一天重复记睡眠时的确认 */
  function openSleepConflict(existing, data, day, hhmm) {
    pendingSleep = { data: data, day: day, hhmm: hhmm, existingId: existing.id };
    const d = describe(existing);
    $('#overlay').innerHTML =
      '<div class="mask" data-act="close"></div>' +
      '<div class="sheet">' +
        '<div class="sheet-grab"></div>' +
        '<div class="sheet-body" style="padding-top:10px">' +
          '<div style="font-size:15px;font-weight:700;margin-bottom:8px">这天已经记过睡眠了</div>' +
          '<div style="font-size:12.5px;color:var(--ink2);line-height:1.75;margin-bottom:16px">' +
            esc(day) + ' 已经有一条：' + esc(d.t) + '。<br>' +
            '再记一条会让这天的睡眠时长相加（比如变成 15 小时），统计就歪了。' +
          '</div>' +
          '<button class="btn btn-primary btn-block" data-act="sleep-replace" style="margin-bottom:10px">替换那一条</button>' +
          '<button class="btn btn-ghost btn-block" data-act="sleep-add" style="margin-bottom:10px">再记一条（如午睡）</button>' +
          '<button class="btn btn-ghost btn-block" data-act="close">取消</button>' +
        '</div>' +
      '</div>';
  }

  /* ---------------------------------------------------------
     删除
     --------------------------------------------------------- */
  function openRecordActions(id) {
    const e = state.events.find(x => x.id === id);
    if (!e) return;
    const d = describe(e);
    const c = TYPES[e.type] ? TYPES[e.type].color : 'var(--ink3)';
    const when = e.ts.slice(0, 10) + ' ' + e.ts.slice(11, 16);
    const rich = e.type === 'exercise' && e.data &&
      ((e.data.track && e.data.track.length > 1) || (e.data.splits && e.data.splits.length > 0));

    $('#overlay').innerHTML =
      '<div class="mask" data-act="close"></div>' +
      '<div class="sheet">' +
        '<div class="sheet-grab"></div>' +
        '<div class="sheet-body" style="padding-top:6px">' +
          '<div style="display:flex;gap:11px;align-items:flex-start;padding:0 2px 16px">' +
            '<div class="tdot" style="margin-top:6px;background:' + c + '"></div>' +
            '<div style="min-width:0">' +
              '<div style="font-size:15px;font-weight:700;line-height:1.4">' + esc(d.t) + '</div>' +
              '<div style="font-size:11.5px;color:var(--ink3);margin-top:3px">' +
                (d.m ? esc(d.m) + ' · ' : '') + when + '</div>' +
            '</div>' +
          '</div>' +
          (rich ? '<button class="btn btn-primary btn-block" data-act="detail" data-id="' + id + '" style="margin-bottom:10px">查看详情</button>' : '') +
          '<button class="btn btn-ghost btn-block" data-act="edit" data-id="' + id + '" style="margin-bottom:10px">编辑</button>' +
          '<button class="btn btn-ghost btn-block" data-act="del" data-id="' + id + '" style="margin-bottom:10px;color:#C0503F">删除</button>' +
          '<button class="btn btn-ghost btn-block" data-act="close">取消</button>' +
        '</div>' +
      '</div>';
  }

  /* ---------------------------------------------------------
     Toast
     --------------------------------------------------------- */
  let toastTimer = null;
  function toast(msg, action) {
    const t = $('#toast');
    clearTimeout(toastTimer);
    t.innerHTML = '<span>' + esc(msg) + '</span>' +
      (action ? '<button class="toast-act" data-act="undo">' + esc(action.label || '撤销') + '</button>' : '');
    t.classList.add('show');
    toastTimer = setTimeout(() => t.classList.remove('show'), action ? 5000 : 1800);
  }

  /* ---------- 撤销 ---------- */

  const undoStack = [];
  let pendingSleep = null;

  function pushUndo(label, fn) {
    undoStack.push({ label: label, fn: fn, at: Date.now() });
    if (undoStack.length > 5) undoStack.shift();
  }

  function undoLast() {
    const u = undoStack.pop();
    if (!u) { toast('没有可撤销的操作'); return; }
    u.fn();
    save();
    closeOverlay();
    render();
    toast('已撤销 · ' + u.label);
  }

  function removeEvents(ids) {
    const set = {};
    ids.forEach(id => { set[id] = 1; });
    state.events = state.events.filter(e => !set[e.id]);
  }

  /* ---------------------------------------------------------
     导入 / 导出
     --------------------------------------------------------- */
  function exportData() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const d = new Date();
    a.href = url;
    a.download = 'onelog-backup-' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('已导出备份');
  }

  function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = function () {
      const file = input.files && input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function () {
        try {
          const p = JSON.parse(reader.result);
          if (!p || !Array.isArray(p.events)) throw new Error('bad');
          state.events = p.events;
          state.todos = Array.isArray(p.todos) ? p.todos : [];
          state.settings = Object.assign({}, DEFAULT_SETTINGS, p.settings || {});
          save();
          render();
          toast('已导入 ' + state.events.length + ' 条记录');
        } catch (e) {
          toast('文件格式不对');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  /* ---------------------------------------------------------
     TCX（Garmin 轨迹格式，华为/佳明/颂拓都用它）
     --------------------------------------------------------- */

  function isTcxText(text, name) {
    if (/\.tcx$/i.test(name || '')) return true;
    return /<TrainingCenterDatabase/i.test(String(text).slice(0, 5000));
  }

  function tagNum(block, tag) {
    const m = block.match(new RegExp('<' + tag + '>\\s*([^<]*?)\\s*</' + tag + '>'));
    if (!m) return 0;
    const n = Number(m[1]);
    return isFinite(n) ? n : 0;
  }

  function nestedNum(block, tag) {
    const m = block.match(new RegExp('<' + tag + '>\\s*<Value>\\s*([^<]*?)\\s*</Value>'));
    if (!m) return 0;
    const n = Number(m[1]);
    return isFinite(n) ? n : 0;
  }

  /* 两点间距离（米） */
  function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const rad = Math.PI / 180;
    const dLat = (lat2 - lat1) * rad;
    const dLon = (lon2 - lon1) * rad;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  /* 等间隔抽稀，保留首末点 */
  function downsample(arr, max) {
    if (!arr || arr.length <= max) return arr || [];
    const step = (arr.length - 1) / (max - 1);
    const out = [];
    for (let i = 0; i < max; i++) out.push(arr[Math.round(i * step)]);
    return out;
  }

  function round5(v) { return Math.round(v * 1e5) / 1e5; }

  function parseTCX(xml) {
    const out = [];
    const acts = String(xml).match(/<Activity\b[\s\S]*?<\/Activity>/g) || [];

    acts.forEach(function (block) {
      const sportM = block.match(/<Activity\b[^>]*\bSport="([^"]*)"/);
      const sport = sportM ? sportM[1] : '';

      const idM = block.match(/<Id>\s*([^<]*?)\s*<\/Id>/);
      let startISO = idM ? idM[1] : '';

      /* ---- 逐个轨迹点 ---- */
      const tps = block.match(/<Trackpoint>[\s\S]*?<\/Trackpoint>/g) || [];
      const ts = [], la = [], lo = [], al = [], hb = [], cd = [];

      tps.forEach(function (tp) {
        const tm = tp.match(/<Time>\s*([^<]*?)\s*<\/Time>/);
        if (!tm) return;
        const t = new Date(tm[1]);
        if (isNaN(t)) return;
        ts.push(t);

        const latM = tp.match(/<LatitudeDegrees>\s*([-\d.]+)\s*<\/LatitudeDegrees>/);
        const lonM = tp.match(/<LongitudeDegrees>\s*([-\d.]+)\s*<\/LongitudeDegrees>/);
        la.push(latM ? parseFloat(latM[1]) : NaN);
        lo.push(lonM ? parseFloat(lonM[1]) : NaN);

        const altM = tp.match(/<AltitudeMeters>\s*([-\d.]+)\s*<\/AltitudeMeters>/);
        al.push(altM ? parseFloat(altM[1]) : NaN);

        const hrM = tp.match(/<HeartRateBpm>\s*<Value>\s*(\d+)\s*<\/Value>/);
        hb.push(hrM ? Number(hrM[1]) : NaN);

        const cadM = tp.match(/<Cadence>\s*(\d+)\s*<\/Cadence>/);
        cd.push(cadM ? Number(cadM[1]) : NaN);
      });

      /* ---- 圈数据（先剔掉轨迹点，免得把点里的距离算进圈） ---- */
      const clean = block.replace(/<Trackpoint>[\s\S]*?<\/Trackpoint>/g, '');
      const laps = clean.match(/<Lap\b[\s\S]*?<\/Lap>/g) || [];
      let seconds = 0, meters = 0, calories = 0, avgHr = 0, maxHr = 0, cadLap = 0;
      const lapStart = (laps[0] || '').match(/<Lap\b[^>]*\bStartTime="([^"]*)"/);
      if (!startISO && lapStart) startISO = lapStart[1];

      laps.forEach(function (lap) {
        seconds += tagNum(lap, 'TotalTimeSeconds');
        meters += tagNum(lap, 'DistanceMeters');
        calories += tagNum(lap, 'Calories');
        avgHr = Math.max(avgHr, nestedNum(lap, 'AverageHeartRateBpm'));
        maxHr = Math.max(maxHr, nestedNum(lap, 'MaximumHeartRateBpm'));
        const lc = lap.match(/<Cadence>\s*(\d+)\s*<\/Cadence>/);
        if (lc) cadLap = Math.max(cadLap, Number(lc[1]));
      });

      /* ---- 相对时间轴 ---- */
      const t0 = ts.length ? ts[0].getTime() : 0;
      const rel = ts.map(function (t) { return Math.round((t.getTime() - t0) / 1000); });

      /* ---- 距离累计 ---- */
      let totalM = 0;
      const cum = [0];
      for (let i = 1; i < ts.length; i++) {
        if (isFinite(la[i]) && isFinite(lo[i]) && isFinite(la[i - 1]) && isFinite(lo[i - 1])) {
          totalM += haversine(la[i - 1], lo[i - 1], la[i], lo[i]);
        }
        cum.push(totalM);
      }

      /* ---- 每公里分段（跨公里处线性插值时间） ---- */
      const splits = [];
      let lastT = 0, kmDone = 0;
      for (let i = 1; i < ts.length; i++) {
        while (cum[i] >= (kmDone + 1) * 1000 && kmDone < 500) {
          const seg = cum[i] - cum[i - 1];
          const over = cum[i] - (kmDone + 1) * 1000;
          const frac = seg > 0 ? (seg - over) / seg : 1;
          const tCross = rel[i - 1] + (rel[i] - rel[i - 1]) * frac;
          splits.push({ km: kmDone + 1, sec: Math.max(1, Math.round(tCross - lastT)) });
          lastT = tCross;
          kmDone++;
        }
      }
      if (kmDone > 0 && totalM - kmDone * 1000 > 100) {
        splits.push({
          km: kmDone + 1,
          sec: Math.max(1, Math.round(rel[rel.length - 1] - lastT)),
          partial: Math.round(totalM - kmDone * 1000)
        });
      }

      /* ---- 爬升 / 心率 / 步频 ---- */
      let gain = 0, prevAlt = null;
      al.forEach(function (v) {
        if (!isFinite(v)) return;
        if (prevAlt != null && v > prevAlt) gain += v - prevAlt;
        prevAlt = v;
      });

      const hrs = hb.filter(isFinite);
      if (!avgHr && hrs.length) {
        avgHr = Math.round(hrs.reduce(function (x, y) { return x + y; }, 0) / hrs.length);
        maxHr = Math.max.apply(null, hrs);
      }
      const cds = cd.filter(isFinite);
      const cadence = cds.length
        ? Math.round(cds.reduce(function (x, y) { return x + y; }, 0) / cds.length)
        : cadLap;

      /* ---- 兜底 ---- */
      if (!seconds && rel.length >= 2) seconds = rel[rel.length - 1];
      if (!meters) meters = totalM;

      if (!startISO) return;
      const d = new Date(startISO);
      if (isNaN(d)) return;

      /* ---- 抽稀后的序列 ---- */
      const track = [], altSeries = [], hrSeries = [];
      for (let i = 0; i < ts.length; i++) {
        if (isFinite(la[i]) && isFinite(lo[i])) track.push([round5(la[i]), round5(lo[i]), rel[i]]);
        if (isFinite(al[i])) altSeries.push([rel[i], Math.round(al[i] * 10) / 10]);
        if (isFinite(hb[i])) hrSeries.push([rel[i], hb[i]]);
      }

      out.push({
        sport: sport,
        start: d,
        seconds: Math.round(seconds),
        meters: Math.round(meters),
        calories: Math.round(calories),
        avgHr: Math.round(avgHr),
        maxHr: Math.round(maxHr),
        points: ts.length,
        gain: Math.round(gain),
        splits: splits,
        cadence: cadence,
        track: downsample(track, 200),
        alt: downsample(altSeries, 110),
        hr: downsample(hrSeries, 140)
      });
    });

    return out;
  }

  function tcxKind(sport) {
    const s = String(sport || '').toLowerCase();
    if (/跑|run|jog|trail/.test(s)) return '跑步';
    if (/骑|单车|自行|bik|cycl/.test(s)) return '骑行';
    if (/游|swim/.test(s)) return '游泳';
    if (/瑜伽|yoga/.test(s)) return '瑜伽';
    if (/走|徒步|walk|hik/.test(s)) return '散步';
    if (/球|ball|tennis|soccer|basket/.test(s)) return '球类';
    if (/力量|健身|器械|strength|weight|gym/.test(s)) return '力量';
    return '其他';
  }

  function tcxToRecords(acts) {
    const out = [];
    (acts || []).forEach(function (a) {
      if (!a.seconds) return;
      const data = {
        kind: tcxKind(a.sport),
        minutes: Math.max(1, Math.round(a.seconds / 60)),
        distance: Math.round(a.meters / 100) / 10,
        rpe: 5
      };
      if (a.gain > 0) data.elevGain = a.gain;
      if (a.avgHr > 0) data.avgHr = a.avgHr;
      if (a.maxHr > 0) data.maxHr = a.maxHr;
      if (a.cadence > 0) data.cadence = a.cadence;
      if (a.splits && a.splits.length) data.splits = a.splits;
      if (a.track && a.track.length > 1) data.track = a.track;
      if (a.alt && a.alt.length > 1) data.alt = a.alt;
      if (a.hr && a.hr.length > 1) data.hr = a.hr;

      out.push({
        type: 'exercise',
        day: dateKey(a.start),
        time: pad(a.start.getHours()) + ':' + pad(a.start.getMinutes()),
        data: data
      });
    });
    return out;
  }

  function fmtPace(seconds, meters) {
    if (!meters || !seconds) return '';
    const secPerKm = seconds / (meters / 1000);
    const m = Math.floor(secPerKm / 60);
    const s = Math.round(secPerKm % 60);
    return m + "'" + (s < 10 ? '0' : '') + s + '"';
  }

  function renderTcxSheet() {
    const t = ui.tcx;
    if (!t) { openImport(); return; }

    const cards = t.acts.map(function (a) {
      const d = a.start;
      const when = (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + WEEK[d.getDay()] + ' ' +
        pad(d.getHours()) + ':' + pad(d.getMinutes());
      const pace = fmtPace(a.seconds, a.meters);
      const parts = [];
      if (a.avgHr) parts.push('均心率 ' + a.avgHr);
      if (a.gain) parts.push('爬升 ' + a.gain + ' m');
      if (a.points) parts.push(a.points + ' 个轨迹点');

      return '<div class="tcx-card">' +
        '<div class="tcx-t">' + esc(a.sport || '运动') + '</div>' +
        '<div class="tcx-sub">' + when + '</div>' +
        '<div class="tcx-stats">' +
          '<div class="tcx-stat"><b>' + fmtHM(a.seconds / 60) + '</b><span>时长</span></div>' +
          '<div class="tcx-stat"><b>' + (a.meters / 1000).toFixed(2) + ' km</b><span>距离</span></div>' +
          (pace ? '<div class="tcx-stat"><b>' + pace + '</b><span>配速 /km</span></div>' : '') +
        '</div>' +
        (parts.length ? '<div class="tcx-sub" style="margin-top:9px">' + parts.join(' · ') + '</div>' : '') +
      '</div>';
    }).join('');

    $('#overlay').innerHTML =
      '<div class="mask" data-act="close"></div>' +
      '<div class="sheet">' +
        '<div class="sheet-grab"></div>' +
        '<div class="sheet-head"><div class="sheet-title">TCX 轨迹</div>' +
          '<button class="sheet-close" data-act="close">✕</button></div>' +
        '<div class="sheet-body">' +
          '<div class="imp-file"><div style="min-width:0">' +
            '<div class="imp-name">' + esc(t.name) + '</div>' +
            '<div class="imp-meta">' + t.acts.length + ' 个活动</div>' +
          '</div><button class="link-btn" data-act="imp-pick">重选</button></div>' +
          cards +
          '<div class="hint-box" style="margin-top:6px">导入后是「运动」记录：类型、时长、距离、爬升、均心率。原始 GPS 轨迹不会存进来。</div>' +
        '</div>' +
        '<div class="sheet-foot">' +
          '<button class="btn btn-primary btn-block" data-act="tcx-do">导入 ' + t.acts.length + ' 条</button>' +
        '</div>' +
      '</div>';
  }

  function doTcxImport() {
    const t = ui.tcx;
    if (!t) return;
    const recs = tcxToRecords(t.acts);
    if (!recs.length) { toast('这些活动没有有效时长'); return; }
    const added = addExternal(recs);
    closeOverlay();
    render();
    toast(added ? '导入了 ' + added + ' 条运动' : '这些记录之前已经导过了');
  }

  /* ---------------------------------------------------------
     运动详情（只有带轨迹 / 分段的记录才有）
     --------------------------------------------------------- */

  let svgSeq = 0;

  function seriesSvg(values, color, h) {
    const H = h || 90, W = 300, pad = 4;
    const n = values.length;
    if (n < 2) return '';
    let min = Math.min.apply(null, values);
    let max = Math.max.apply(null, values);
    if (max - min < 1e-6) max = min + 1;
    const xs = i => pad + i / (n - 1) * (W - 2 * pad);
    const ys = v => H - pad - (v - min) / (max - min) * (H - 2 * pad);
    const pts = values.map((v, i) => [xs(i), ys(v)]);
    const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    const area = line + ' L' + xs(n - 1).toFixed(1) + ' ' + H + ' L' + xs(0).toFixed(1) + ' ' + H + ' Z';
    const gid = 'sg' + (++svgSeq);

    return '<svg viewBox="0 0 ' + W + ' ' + H + '">' +
      '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="' + color + '" stop-opacity=".22"/>' +
      '<stop offset="100%" stop-color="' + color + '" stop-opacity="0"/>' +
      '</linearGradient></defs>' +
      '<path d="' + area + '" fill="url(#' + gid + ')"/>' +
      '<path d="' + line + '" fill="none" stroke="' + color + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>' +
      '</svg>';
  }

  function trackSvg(track) {
    const W = 300, H = 210, pad = 16;
    if (!track || track.length < 2) return '';
    const lats = track.map(p => p[0]);
    const lons = track.map(p => p[1]);
    const minLa = Math.min.apply(null, lats), maxLa = Math.max.apply(null, lats);
    const minLo = Math.min.apply(null, lons), maxLo = Math.max.apply(null, lons);
    const spanLa = Math.max(maxLa - minLa, 1e-6);
    const spanLo = Math.max(maxLo - minLo, 1e-6);
    const s = Math.min((W - 2 * pad) / spanLo, (H - 2 * pad) / spanLa);
    const ox = (W - spanLo * s) / 2;
    const oy = (H - spanLa * s) / 2;
    const px = v => ox + (v - minLo) * s;
    const py = v => H - oy - (v - minLa) * s;

    const d = track.map((p, i) => (i ? 'L' : 'M') + px(p[1]).toFixed(1) + ' ' + py(p[0]).toFixed(1)).join(' ');
    const a = track[0], b = track[track.length - 1];

    return '<svg viewBox="0 0 ' + W + ' ' + H + '">' +
      '<path d="' + d + '" fill="none" stroke="#4A5B8C" stroke-width="2.6" stroke-linecap="round" ' +
        'stroke-linejoin="round" pathLength="1" class="track-path"/>' +
      '<circle cx="' + px(a[1]).toFixed(1) + '" cy="' + py(a[0]).toFixed(1) + '" r="4.5" fill="#3E9B6B"/>' +
      '<circle cx="' + px(b[1]).toFixed(1) + '" cy="' + py(b[0]).toFixed(1) + '" r="4.5" fill="#E8697D"/>' +
      '</svg>';
  }

  /* 某次运动的时间窗口 */
  function exerciseWindow(e) {
    const start = new Date(e.ts);
    const end = new Date(start.getTime() + (e.data && e.data.minutes ? e.data.minutes : 0) * 60000);
    return { start: start, end: end };
  }

  /* 从 Health Connect 把这段时间的心率贴到这次运动上 */
  async function attachHrToExercise(id) {
    const e = state.events.find(x => x.id === id);
    if (!e || e.type !== 'exercise') return;

    const H = healthPlugin();
    if (!H) { toast('这个功能要在安卓 App 里用'); return; }

    try {
      const av = await H.isAvailable();
      if (!av || !av.available) { toast('这台手机没有 Health Connect'); return; }

      await H.requestAuthorization({ read: ['heartRate'], write: [] });

      const w = exerciseWindow(e);
      const res = await H.readSamples({
        dataType: 'heartRate',
        startDate: w.start.toISOString(),
        endDate: w.end.toISOString(),
        limit: 5000
      });

      const samples = (res && res.samples) || [];
      const series = [];
      samples.forEach(function (s) {
        if (!s || !s.startDate) return;
        const t = new Date(s.startDate);
        const v = Math.round(Number(s.value));
        if (isNaN(t) || !isFinite(v) || v < 30 || v > 250) return;
        const sec = Math.round((t.getTime() - w.start.getTime()) / 1000);
        if (sec < 0) return;
        series.push([sec, v]);
      });

      if (series.length < 2) { toast('这段时间里没有心率数据'); return; }
      series.sort(function (a, b) { return a[0] - b[0]; });

      const vals = series.map(function (p) { return p[1]; });
      e.data.hr = downsample(series, 140);
      e.data.avgHr = Math.round(vals.reduce(function (a, b) { return a + b; }, 0) / vals.length);
      e.data.maxHr = Math.max.apply(null, vals);

      save();
      closeOverlay();
      render();
      openExerciseDetail(id);
      toast('补上了 ' + series.length + ' 个心率点');
    } catch (err) {
      console.warn('[hr]', err);
      toast('补心率失败：' + (err && err.message ? err.message : '未知错误'));
    }
  }

  function openExerciseDetail(id) {
    const e = state.events.find(x => x.id === id);
    if (!e || e.type !== 'exercise') return;
    const d = e.data || {};
    const dt = new Date(e.ts);
    const dateStr = (dt.getMonth() + 1) + '月' + dt.getDate() + '日 ' + WEEK[dt.getDay()];
    const timeStr = e.ts.slice(11, 16);
    const totalSec = (d.minutes || 0) * 60;
    const meters = (d.distance || 0) * 1000;
    const pace = fmtPace(totalSec, meters);

    const stat = (k, v) => '<div class="dt-stat"><b>' + v + '</b><span>' + k + '</span></div>';
    const stats = [
      stat('距离', (d.distance || 0).toFixed(2) + ' km'),
      stat('时长', fmtHM(d.minutes || 0)),
      pace ? stat('配速', pace) : '',
      d.elevGain ? stat('爬升', d.elevGain + ' m') : '',
      d.avgHr ? stat('均心率', d.avgHr) : '',
      d.maxHr ? stat('最大心率', d.maxHr) : '',
      d.cadence ? stat('步频', d.cadence) : ''
    ].filter(Boolean).join('');

    /* 每公里配速 */
    let splitHtml = '';
    if (d.splits && d.splits.length) {
      const arr = d.splits.map(s => s.sec / ((s.partial || 1000) / 1000));
      const maxP = Math.max.apply(null, arr);
      const minP = Math.min.apply(null, arr);
      const last = d.splits[d.splits.length - 1];
      splitHtml = '<div class="dt-card"><div class="dt-card-t">每公里配速' +
        '<span class="dt-card-v">最快 ' + fmtPace(minP, 1000) + ' /km</span></div>' +
        d.splits.map(function (s, i) {
          const w = clamp(Math.round(arr[i] / maxP * 100), 10, 100);
          const best = arr[i] === minP;
          return '<div class="split-row">' +
            '<span class="split-km">' + s.km + '</span>' +
            '<span class="split-bar"><i style="width:' + w + '%;background:' +
              (best ? '#3E9B6B' : 'var(--ink3)') + '"></i></span>' +
            '<span class="split-time">' + fmtPace(arr[i], 1000) + '</span>' +
          '</div>';
        }).join('') +
        (last.partial ? '<div class="split-note">最后一段不足 1 公里：' +
          (last.partial / 1000).toFixed(2) + ' km</div>' : '') +
      '</div>';
    }

    /* 心率 */
    const hrVals = (d.hr || []).map(p => p[1]);
    let hrHtml = '';
    if (hrVals.length > 1) {
      hrHtml = '<div class="dt-card"><div class="dt-card-t">心率' +
        '<span class="dt-card-v">' + Math.min.apply(null, hrVals) + '–' +
        Math.max.apply(null, hrVals) + ' bpm</span></div>' +
        '<div class="dt-svg">' + seriesSvg(hrVals, '#E8697D', 78) + '</div></div>';
    }

    /* 海拔 */
    const altVals = (d.alt || []).map(p => p[1]);
    let altHtml = '';
    if (altVals.length > 1) {
      altHtml = '<div class="dt-card"><div class="dt-card-t">海拔' +
        '<span class="dt-card-v">' + Math.round(Math.min.apply(null, altVals)) + '–' +
        Math.round(Math.max.apply(null, altVals)) + ' m</span></div>' +
        '<div class="dt-svg">' + seriesSvg(altVals, '#5E8C7F', 72) + '</div></div>';
    }

    /* 轨迹 */
    let trackHtml = '';
    if (d.track && d.track.length > 1) {
      trackHtml = '<div class="dt-card"><div class="dt-card-t">轨迹' +
        '<span class="dt-card-v">' + d.track.length + ' 个点</span></div>' +
        '<div class="dt-svg">' + trackSvg(d.track) + '</div></div>';
    }

    const missing = [];
    if (!hrVals.length) missing.push('心率');
    if (!d.cadence) missing.push('步频');
    const canAttachHr = !hrVals.length && !!healthPlugin();

    $('#overlay').innerHTML =
      '<div class="report">' +
        '<div class="report-head"><span class="set-desc" style="margin:0">' +
          dateStr + ' ' + timeStr + '</span>' +
          '<button class="sheet-close" data-act="close">✕</button></div>' +
        '<div class="report-body">' +
          '<div class="dt-hero">' +
            '<div class="dt-hero-k">' + esc(d.kind || '运动') + '</div>' +
            '<div class="dt-hero-v">' + (d.distance || 0).toFixed(2) + '<em>km</em></div>' +
            '<div class="dt-hero-s">' + esc(fmtHM(d.minutes || 0)) +
              (pace ? ' · ' + pace + ' /km' : '') + '</div>' +
          '</div>' +
          '<div class="dt-stats">' + stats + '</div>' +
          splitHtml + hrHtml + altHtml + trackHtml +
          (canAttachHr
            ? '<button class="btn btn-primary btn-block" data-act="hc-hr" data-id="' + id +
              '" style="margin-top:16px">从 Health Connect 补心率</button>'
            : '') +
          (missing.length
            ? '<div class="disclaimer">这条数据里没有 ' + missing.join(' 和 ') + '——' +
              (canAttachHr
                ? '导出时没带。如果手表一直在测心率，可以点上面按钮补。'
                : '手表导出时没带这些字段。') + '</div>'
            : '') +
        '</div>' +
      '</div>';
  }

  /* ---------------------------------------------------------
     Health Connect 自动同步（只在 Capacitor 原生壳里可用）
     --------------------------------------------------------- */

  const HC_KEY = 'onelog.hc.last';

  function healthPlugin() {
    const cap = (typeof window !== 'undefined') && window.Capacitor;
    return (cap && cap.Plugins && cap.Plugins.Health) ? cap.Plugins.Health : null;
  }

  function getLastSync() {
    try { return localStorage.getItem(HC_KEY); } catch (e) { return null; }
  }

  function setLastSync(iso) {
    try { localStorage.setItem(HC_KEY, iso); } catch (e) { /* ignore */ }
  }

  function healthDesc() {
    if (!healthPlugin()) return '需要安卓 App，网页版用不了';
    const t = getLastSync();
    if (!t) return '还没同步过';
    const d = new Date(t);
    if (isNaN(d)) return '还没同步过';
    return '上次同步 ' + (d.getMonth() + 1) + '/' + d.getDate() + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  /* 把 Health Connect 的原始样本翻译成我们的事件 */
  function buildHealthRecords(sleepSamples, stepSamples, hrSamples, weightSamples) {
    const out = [];
    const SKIP_STATE = { awake: 1, inBed: 1 };

    /* 睡眠：按「醒来那天」聚合所有睡着片段 */
    const nights = {};
    (sleepSamples || []).forEach(function (s) {
      if (!s || !s.startDate || !s.endDate) return;
      if (s.sleepState && SKIP_STATE[s.sleepState]) return;
      const st = new Date(s.startDate);
      const en = new Date(s.endDate);
      if (isNaN(st) || isNaN(en)) return;
      const k = dateKey(en);
      let mins = Number(s.value);
      if (!isFinite(mins) || mins <= 0) mins = Math.round((en - st) / 60000);
      if (!nights[k]) nights[k] = { mins: 0, bed: st, wake: en };
      nights[k].mins += mins;
      if (st < nights[k].bed) nights[k].bed = st;
      if (en > nights[k].wake) nights[k].wake = en;
    });

    Object.keys(nights).forEach(function (k) {
      const n = nights[k];
      if (n.mins < 30) return;                       // 太短的多半是打盹数据碎片，丢掉
      const hours = Math.round(n.mins / 6) / 10;
      const wake = pad(n.wake.getHours()) + ':' + pad(n.wake.getMinutes());
      const bed = pad(n.bed.getHours()) + ':' + pad(n.bed.getMinutes());
      out.push({ type: 'sleep', day: k, time: wake, data: { bed: bed, wake: wake, hours: hours, quality: 3, wakeups: 0 } });
    });

    /* 步数：按天汇总 */
    (stepSamples || []).forEach(function (s) {
      if (!s || !s.startDate) return;
      const d = new Date(s.startDate);
      if (isNaN(d)) return;
      const n = Math.round(Number(s.value) || 0);
      if (n <= 0) return;
      out.push({ type: 'activity', day: dateKey(d), time: '23:59', data: { steps: n, activeMin: 0 } });
    });

    /* 静息心率 + 体重：合并成每天一条 body，避免同一天两条撞车 */
    const bodies = {};
    (hrSamples || []).forEach(function (s) {
      if (!s || !s.startDate) return;
      const d = new Date(s.startDate);
      if (isNaN(d)) return;
      const v = Math.round(Number(s.value) || 0);
      if (v < 30 || v > 250) return;
      const k = dateKey(d);
      if (!bodies[k]) bodies[k] = { weight: 0, restingHr: 0 };
      bodies[k].restingHr = v;
    });
    (weightSamples || []).forEach(function (s) {
      if (!s || !s.startDate) return;
      const d = new Date(s.startDate);
      if (isNaN(d)) return;
      const v = Math.round(Number(s.value) * 10) / 10;
      if (v < 20 || v > 300) return;
      const k = dateKey(d);
      if (!bodies[k]) bodies[k] = { weight: 0, restingHr: 0 };
      bodies[k].weight = v;
    });
    Object.keys(bodies).forEach(function (k) {
      out.push({ type: 'body', day: k, time: '07:20', data: bodies[k] });
    });

    return out;
  }

  /* 外部来源写入：按 类型+分钟 去重 */
  function addExternal(list) {
    const seen = {};
    state.events.forEach(e => { seen[e.type + '|' + e.ts.slice(0, 16)] = 1; });
    let added = 0;
    (list || []).forEach(function (r) {
      if (!r || !TYPES[r.type] || !r.day) return;
      const ev = mkEvent(r.type, r.data || {}, r.day, r.time, 'auto');
      const k = ev.type + '|' + ev.ts.slice(0, 16);
      if (seen[k]) return;
      seen[k] = 1;
      state.events.push(ev);
      added++;
    });
    if (added) { save(); render(); }
    return added;
  }

  async function syncHealth(days) {
    const H = healthPlugin();
    if (!H) { toast('这个功能要在安卓 App 里用'); return; }
    days = days || 7;

    try {
      const av = await H.isAvailable();
      if (!av || !av.available) {
        toast('这台手机没有 Health Connect');
        return;
      }

      await H.requestAuthorization({
        read: ['sleep', 'steps', 'restingHeartRate', 'weight'],
        write: []
      });

      const startDate = new Date(Date.now() - days * 86400000).toISOString();
      const endDate = new Date().toISOString();
      const range = { startDate: startDate, endDate: endDate, limit: 1000 };

      const sleep = await H.readSamples(Object.assign({ dataType: 'sleep' }, range));
      const steps = await H.queryAggregated({
        dataType: 'steps', startDate: startDate, endDate: endDate, bucket: 'day', aggregation: 'sum'
      });
      const hr = await H.readSamples(Object.assign({ dataType: 'restingHeartRate' }, range));
      const weight = await H.readSamples(Object.assign({ dataType: 'weight' }, range));

      const recs = buildHealthRecords(
        sleep && sleep.samples, steps && steps.samples, hr && hr.samples, weight && weight.samples
      );
      const added = addExternal(recs);
      setLastSync(new Date().toISOString());
      render();
      toast(added ? '同步了 ' + added + ' 条' : '没有新数据');
    } catch (e) {
      console.warn('[health]', e);
      toast('同步失败：' + (e && e.message ? e.message : '未知错误'));
    }
  }

  /* ---------------------------------------------------------
     AI 解析（OpenAI 兼容接口）
     --------------------------------------------------------- */

  function aiCfg() {
    if (!state.settings.ai) state.settings.ai = Object.assign({}, AI_DEFAULT);
    return state.settings.ai;
  }

  function aiReady() {
    const c = aiCfg();
    return !!(c.enabled && c.baseUrl && c.model && c.apiKey);
  }

  const AI_SYSTEM_PROMPT = [
    '你是一个生活记录解析器。把用户的一句话拆成结构化记录。',
    '只输出 JSON，格式：{"events":[{"type":"sleep","date":"2026-11-25","time":"07:30","data":{...}}]}',
    'type 只能是：sleep, meal, exercise, study, mood, water, body, activity, note, habit',
    '各类型的 data 字段：',
    'sleep: {bed:"HH:mm", wake:"HH:mm", hours:数字(小时), quality:1-5}',
    'meal: {meal:"早餐|午餐|晚餐|加餐|咖啡|酒", food:"字符串", fullness:1-5, where:"自炊|外食|外卖"}',
    'exercise: {kind:"跑步|力量|骑行|游泳|瑜伽|散步|球类|其他", minutes:数字, distance:数字(公里), rpe:1-10}',
    'study: {subject:"字符串", minutes:数字, focus:1-5, method:"阅读|听课|练习|写作|背诵"}',
    'mood: {score:1-5, tags:["字符串"], trigger:"字符串", energy:1-5}',
    'water: {cups:数字}',
    'body: {weight:数字(kg), restingHr:数字}',
    'activity: {steps:数字, activeMin:数字}',
    'note: {text:"字符串"}',
    'habit: {name:"字符串", done:"完成|没做"}',
    '规则：',
    '1. 时间用 24 小时制 HH:mm。"11点睡"=23:00，"12点睡"=00:00。',
    '2. 只输出用户确实提到的内容，绝不编造。没说 quality 就填 3。',
    '3. 换算：跑步 5 公里≈30 分钟；1 小时=60 分钟。',
    '4. 日期用 YYYY-MM-DD；没提就用用户给的今天。',
    '5. 一句话里有多件事就输出多条。',
    '6. 完全无法理解就输出 {"events":[]}。'
  ].join('\n');

  function defaultData(type) {
    return {
      sleep: { bed: '23:30', wake: '07:00', hours: 7.5, quality: 3, wakeups: 0 },
      meal: { meal: '午餐', food: '', fullness: 3, where: '自炊' },
      exercise: { kind: '跑步', minutes: 30, distance: 0, rpe: 5 },
      study: { subject: '学习', minutes: 30, focus: 3, method: '阅读' },
      mood: { score: 3, tags: [], trigger: '', energy: 3 },
      water: { cups: 1 },
      body: { weight: 0, restingHr: 0 },
      activity: { steps: 0, activeMin: 0 },
      note: { text: '' },
      habit: { name: '', done: '完成' }
    }[type] || {};
  }

  function defaultTime(type) {
    return { sleep: '07:00', meal: '12:30', exercise: '19:00', study: '20:30', mood: '21:30',
             water: nowHHMM(), body: '07:20', activity: '23:59', note: '22:30', habit: '21:00' }[type] || nowHHMM();
  }

  /* 换类型时，只保留两边都有的字段 */
  function pickOverlap(vals, defs) {
    const out = {};
    Object.keys(defs).forEach(function (k) {
      const v = vals[k];
      if (v === undefined || v === null || v === '') return;
      if (Array.isArray(v) && !v.length) return;
      out[k] = v;
    });
    return out;
  }

  /* 把模型返回的一条 item 规范化成事件 */
  function buildAIEvent(it) {
    if (!it || !TYPES[it.type]) return null;
    const type = it.type;
    const raw = it.data || {};
    const d = Object.assign(defaultData(type), raw);

    if (type === 'sleep') {
      /* 有起止时间就以时间为准，别被默认的 hours 盖掉 */
      if (/^\d{2}:\d{2}$/.test(d.bed || '') && /^\d{2}:\d{2}$/.test(d.wake || '')) {
        d.hours = hoursBetween(d.bed, d.wake);
      } else {
        d.hours = clamp(Number(d.hours) || 0, 0, 16);
        if (!d.bed) d.bed = shiftTime(d.wake || '07:00', -Math.round(d.hours * 60));
        if (!d.wake) d.wake = shiftTime(d.bed, Math.round(d.hours * 60));
      }
      d.quality = clamp(Math.round(Number(d.quality) || 3), 1, 5);
    } else if (type === 'exercise') {
      d.minutes = clamp(Math.round(Number(d.minutes) || 0), 0, 600);
      if (!d.minutes && d.distance) d.minutes = Math.round(Number(d.distance) * 6);
      d.distance = clamp(Number(d.distance) || 0, 0, 300);
      d.rpe = clamp(Math.round(Number(d.rpe) || 5), 1, 10);
      if (!d.minutes) return null;
    } else if (type === 'study') {
      d.minutes = clamp(Math.round(Number(d.minutes) || 0), 0, 600);
      if (!d.minutes) return null;
      d.subject = String(d.subject || '学习').slice(0, 40);
      d.focus = clamp(Math.round(Number(d.focus) || 3), 1, 5);
    } else if (type === 'meal') {
      d.food = String(d.food || '—').slice(0, 100);
      d.fullness = clamp(Math.round(Number(d.fullness) || 3), 1, 5);
    } else if (type === 'mood') {
      d.score = clamp(Math.round(Number(d.score) || 3), 1, 5);
      d.tags = Array.isArray(d.tags) ? d.tags.slice(0, 5).map(String) : [];
      d.energy = clamp(Math.round(Number(d.energy) || d.score), 1, 5);
    } else if (type === 'water') {
      d.cups = clamp(Math.round(Number(d.cups) || 1), 1, 20);
    } else if (type === 'body') {
      d.weight = clamp(Number(d.weight) || 0, 0, 300);
      d.restingHr = clamp(Math.round(Number(d.restingHr) || 0), 0, 250);
      if (!d.weight && !d.restingHr) return null;
    } else if (type === 'activity') {
      d.steps = clamp(Math.round(Number(d.steps) || 0), 0, 100000);
      d.activeMin = clamp(Math.round(Number(d.activeMin) || 0), 0, 1440);
      if (!d.steps && !d.activeMin) return null;
    }

    const time = /^\d{2}:\d{2}$/.test(it.time || '') ? it.time : defaultTime(type);
    const day = /^\d{4}-\d{2}-\d{2}$/.test(it.date || '') ? it.date : dayFromUI();
    return mkEvent(type, d, day, time, 'ai');
  }

  async function aiParse(text) {
    const cfg = aiCfg();
    const url = String(cfg.baseUrl).replace(/\/+$/, '') + '/chat/completions';
    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 30000);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + cfg.apiKey
        },
        body: JSON.stringify({
          model: cfg.model,
          temperature: 0,
          max_tokens: 800,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: AI_SYSTEM_PROMPT },
            { role: 'user', content: '今天日期：' + dayFromUI() + '\n用户说：' + text }
          ]
        }),
        signal: ctrl ? ctrl.signal : undefined
      });
      clearTimeout(timer);
      if (!res.ok) throw new Error('HTTP ' + res.status + (res.status === 401 ? '（密钥不对）' : ''));
      const j = await res.json();
      const content = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
      if (!content) throw new Error('响应为空');

      let obj;
      try { obj = JSON.parse(content); }
      catch (e) {
        const mm = content.match(/\{[\s\S]*\}/);
        if (!mm) throw new Error('返回的不是 JSON');
        obj = JSON.parse(mm[0]);
      }
      const list = Array.isArray(obj) ? obj : (obj.events || []);
      return list.map(buildAIEvent).filter(Boolean);
    } catch (err) {
      clearTimeout(timer);
      console.warn('[AI]', err);
      toast('AI 解析失败，已改用本地规则');
      return null;
    }
  }

  async function doParse(text) {
    if (aiReady()) {
      const items = await aiParse(text);
      if (items && items.length) { showPreview(items); return; }
      if (items && !items.length) { toast('模型没听懂，换个说法'); return; }
    }
    const items = parseText(text);
    if (!items.length) { toast('没听懂，换个说法或者手动记'); return; }
    showPreview(items);
  }

  function openAISettings() {
    const c = aiCfg();
    $('#overlay').innerHTML =
      '<div class="mask" data-act="close"></div>' +
      '<div class="sheet">' +
        '<div class="sheet-grab"></div>' +
        '<div class="sheet-head"><div class="sheet-title">AI 解析设置</div>' +
          '<button class="sheet-close" data-act="close">✕</button></div>' +
        '<div class="sheet-body">' +
          '<div class="hint-box">兼容任何 OpenAI 格式的接口：DeepSeek、OpenAI、硅基流动、OpenRouter、本机 Ollama 都可以。' +
          '<br><b>密钥只存在这台设备的浏览器里</b>，不会上传到别处；但你要记的那句话会发给这个服务商。</div>' +
          '<div class="field"><span class="field-label">状态</span><div class="field-ctl">' +
            '<div class="chip-row" id="aiEnabled">' +
              '<button class="chip' + (c.enabled ? ' sel' : '') + '" data-val="1">开启</button>' +
              '<button class="chip' + (c.enabled ? '' : ' sel') + '" data-val="0">关闭</button>' +
            '</div></div></div>' +
          '<div class="field-block"><div class="field-label">接口地址</div>' +
            '<input class="field-input" id="aiBase" value="' + esc(c.baseUrl) + '" placeholder="https://api.deepseek.com/v1"></div>' +
          '<div class="field-block"><div class="field-label">模型名</div>' +
            '<input class="field-input" id="aiModel" value="' + esc(c.model) + '" placeholder="deepseek-chat"></div>' +
          '<div class="field-block"><div class="field-label">API Key</div>' +
            '<input class="field-input" id="aiKey" type="password" value="' + esc(c.apiKey) + '" placeholder="sk-…"></div>' +
          '<div class="mt14" style="display:flex;gap:10px">' +
            '<button class="btn btn-ghost" data-act="ai-test" style="flex:0 0 110px">测试连接</button>' +
            '<button class="btn btn-primary" data-act="ai-save" style="flex:1">保存</button>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function readAIFields() {
    const val = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
    const en = document.querySelector('#aiEnabled .sel');
    return {
      enabled: en ? en.dataset.val === '1' : false,
      baseUrl: val('aiBase') || AI_DEFAULT.baseUrl,
      model: val('aiModel') || AI_DEFAULT.model,
      apiKey: val('aiKey')
    };
  }

  function saveAISettings() {
    state.settings.ai = readAIFields();
    save();
    closeOverlay();
    render();
    toast(state.settings.ai.enabled && state.settings.ai.apiKey ? 'AI 解析已开启' : '已保存');
  }

  async function testAI() {
    const c = readAIFields();
    if (!c.apiKey) { toast('先填 API Key'); return; }
    toast('测试中…');
    try {
      const res = await fetch(String(c.baseUrl).replace(/\/+$/, '') + '/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + c.apiKey },
        body: JSON.stringify({ model: c.model, messages: [{ role: 'user', content: 'hi' }], max_tokens: 5 })
      });
      if (res.ok) toast('连接成功 ✓');
      else toast('失败：HTTP ' + res.status);
    } catch (e) {
      toast('失败：' + e.message);
    }
  }

  /* ---------------------------------------------------------
     手表数据导入：CSV / JSON / ZIP
     --------------------------------------------------------- */

  function decodeText(u8) {
    let s = new TextDecoder('utf-8').decode(u8);
    if (s.indexOf('\uFFFD') >= 0) {
      try { s = new TextDecoder('gbk').decode(u8); } catch (e) { /* 环境不支持 gbk 就保持 utf-8 */ }
    }
    return s;
  }

  function parseCSV(text) {
    text = text.replace(/^\uFEFF/, '');
    const nl = text.indexOf('\n');
    const first = nl >= 0 ? text.slice(0, nl) : text;
    const count = ch => first.split(ch).length;
    let delim = ',';
    if (count('\t') > count(',')) delim = '\t';
    else if (count(';') > count(',')) delim = ';';

    const rows = [];
    let row = [], cur = '', q = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (q) {
        if (ch === '"') {
          if (text[i + 1] === '"') { cur += '"'; i++; }
          else q = false;
        } else cur += ch;
      } else if (ch === '"') q = true;
      else if (ch === delim) { row.push(cur); cur = ''; }
      else if (ch === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; }
      else if (ch !== '\r') cur += ch;
    }
    if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
    return rows.filter(r => r.some(x => String(x).trim() !== ''));
  }

  function rowsFromJSON(obj) {
    let arr = null;
    if (Array.isArray(obj)) arr = obj;
    else if (obj && typeof obj === 'object') {
      for (const k in obj) {
        if (Array.isArray(obj[k]) && obj[k].length && typeof obj[k][0] === 'object') { arr = obj[k]; break; }
      }
    }
    if (!arr || !arr.length) return null;
    arr = arr.slice(0, 20000);

    const keys = [];
    arr.slice(0, 50).forEach(o => {
      if (o && typeof o === 'object') Object.keys(o).forEach(k => { if (keys.indexOf(k) < 0) keys.push(k); });
    });
    if (!keys.length) return null;

    const rows = [keys];
    arr.forEach(o => rows.push(keys.map(k => {
      const v = o ? o[k] : '';
      if (v == null) return '';
      return typeof v === 'object' ? JSON.stringify(v) : String(v);
    })));
    return rows;
  }

  function rowsFromBuffer(u8, name) {
    const text = decodeText(u8);
    const looksJson = /\.json$/i.test(name) || /^\s*[\[{]/.test(text.slice(0, 300));
    if (looksJson) {
      let obj;
      try { obj = JSON.parse(text); } catch (e) { throw new Error('JSON 格式有误'); }
      const rows = rowsFromJSON(obj);
      if (!rows) throw new Error('JSON 里没找到表格数据');
      return rows;
    }
    return parseCSV(text);
  }

  /* 解析 zip 中央目录，返回 [{name, method, raw}] */
  function unzip(buf) {
    const dv = new DataView(buf);
    const len = buf.byteLength;
    let eocd = -1;
    const stop = Math.max(0, len - 65557);
    for (let i = len - 22; i >= stop; i--) {
      if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    }
    if (eocd < 0) throw new Error('不是有效的 zip');

    const total = dv.getUint16(eocd + 10, true);
    let off = dv.getUint32(eocd + 16, true);
    const out = [];
    for (let n = 0; n < total; n++) {
      if (off + 46 > len || dv.getUint32(off, true) !== 0x02014b50) break;
      const method = dv.getUint16(off + 10, true);
      const csize = dv.getUint32(off + 20, true);
      const nameLen = dv.getUint16(off + 28, true);
      const extraLen = dv.getUint16(off + 30, true);
      const cmtLen = dv.getUint16(off + 32, true);
      const lho = dv.getUint32(off + 42, true);
      const name = decodeText(new Uint8Array(buf, off + 46, nameLen));
      if (lho + 30 <= len && !/\/$/.test(name)) {
        const lNameLen = dv.getUint16(lho + 26, true);
        const lExtraLen = dv.getUint16(lho + 28, true);
        const start = lho + 30 + lNameLen + lExtraLen;
        if (start + csize <= len) out.push({ name: name, method: method, raw: new Uint8Array(buf, start, csize) });
      }
      off += 46 + nameLen + extraLen + cmtLen;
    }
    return out;
  }

  async function inflateRaw(u8) {
    if (typeof DecompressionStream === 'undefined') throw new Error('这个浏览器不支持解压，请先手动解压 zip');
    const ds = new DecompressionStream('deflate-raw');
    const stream = new Blob([u8]).stream().pipeThrough(ds);
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }

  function openImport() {
    $('#overlay').innerHTML =
      '<div class="mask" data-act="close"></div>' +
      '<div class="sheet">' +
        '<div class="sheet-grab"></div>' +
        '<div class="sheet-head"><div class="sheet-title">导入手表数据</div>' +
          '<button class="sheet-close" data-act="close">✕</button></div>' +
        '<div class="sheet-body">' +
          '<div class="drop" data-act="imp-pick"><span class="drop-ico">📥</span>点这里选择文件' +
            '<br>支持 .tcx / .csv / .json / .zip</div>' +
          '<div class="hint-box">' +
            '<b>华为：</b>运动健康 App → 我的 → 隐私中心 / 数据管理 → 导出数据，会得到一个 zip，可以直接选，也可以解压后挑里面的 csv / tcx。<br>' +
            '<b>TCX 轨迹：</b>跑步、骑行这种带 GPS 的活动，直接丢 .tcx 进来，会自动算出时长、距离、配速、爬升。<br>' +
            '<b>其他：</b>Garmin Connect、Zepp、Samsung Health 导出的 CSV 也能用。<br>' +
            '列名对不上没关系，下一步可以手动指定哪一列是时间、哪一列是数值。' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function guessCols(headers, name) {
    const find = (re, def) => {
      for (let i = 0; i < headers.length; i++) if (re.test(headers[i])) return i;
      return def;
    };
    let type = 'activity';
    if (/sleep|睡眠|sleeping/i.test(name)) type = 'sleep';
    else if (/step|步/i.test(name)) type = 'activity';
    else if (/heart|hr|心率/i.test(name)) type = 'hr';
    else if (/weight|体重|body/i.test(name)) type = 'weight';
    else if (/exercise|workout|sport|运动|training/i.test(name)) type = 'exercise';

    const timeCol = find(/time|date|日期|时间|开始|start|begin/i, 0);
    const valueCol = find(/value|时长|duration|分钟|hour|steps|步数|heart|心率|weight|体重|睡眠|sleep|count|total/i, Math.min(1, headers.length - 1));
    const head = headers[valueCol] || '';
    let unit = 'min';
    if (/hour|小时/i.test(head)) unit = 'hour';
    if (type === 'weight') unit = 'kg';
    return { type: type, timeCol: timeCol, valueCol: valueCol, unit: unit };
  }

  function initImport(name, rows) {
    const headers = rows[0].map(h => String(h || '').trim());
    const g = guessCols(headers, name);
    ui.imp = {
      name: name, rows: rows, headers: headers,
      type: g.type, timeCol: String(g.timeCol), valueCol: String(g.valueCol),
      unit: g.unit, kind: '跑步'
    };
    renderImportSheet();
  }

  function renderImportSheet() {
    const im = ui.imp;
    if (!im) { openImport(); return; }

    const typeOpts = [['sleep', '睡眠时长'], ['exercise', '运动时长'], ['activity', '步数'], ['hr', '静息心率'], ['weight', '体重']]
      .map(o => '<option value="' + o[0] + '"' + (im.type === o[0] ? ' selected' : '') + '>' + o[1] + '</option>').join('');

    const colOpts = im.headers.map((h, i) =>
      '<option value="' + i + '"' + (String(i) === String(im.timeCol) ? ' selected' : '') + '>' + esc(h || ('第 ' + (i + 1) + ' 列')) + '</option>').join('');
    const valOpts = im.headers.map((h, i) =>
      '<option value="' + i + '"' + (String(i) === String(im.valueCol) ? ' selected' : '') + '>' + esc(h || ('第 ' + (i + 1) + ' 列')) + '</option>').join('');

    let unitRow = '';
    if (im.type === 'sleep' || im.type === 'exercise') {
      unitRow = '<div class="field"><span class="field-label">数值单位</span><div class="field-ctl">' +
        '<select class="field-input" data-imp="unit">' +
          '<option value="min"' + (im.unit === 'min' ? ' selected' : '') + '>分钟</option>' +
          '<option value="hour"' + (im.unit === 'hour' ? ' selected' : '') + '>小时</option>' +
        '</select></div></div>';
    } else if (im.type === 'weight') {
      unitRow = '<div class="field"><span class="field-label">数值单位</span><div class="field-ctl">' +
        '<select class="field-input" data-imp="unit">' +
          '<option value="kg"' + (im.unit === 'kg' ? ' selected' : '') + '>公斤</option>' +
          '<option value="jin"' + (im.unit === 'jin' ? ' selected' : '') + '>斤</option>' +
        '</select></div></div>';
    }

    const kindRow = im.type === 'exercise'
      ? '<div class="field"><span class="field-label">运动类型</span><div class="field-ctl">' +
        '<input class="field-input" data-imp="kind" value="' + esc(im.kind) + '" maxlength="10">' +
        '</div></div>' : '';

    const previewHead = im.headers.slice(0, 6).map(h => '<th>' + esc(h || '—') + '</th>').join('');
    const previewBody = im.rows.slice(1, 6).map(r =>
      '<tr>' + im.headers.slice(0, 6).map((_, i) => '<td>' + esc(r[i] == null ? '' : r[i]) + '</td>').join('') + '</tr>').join('');

    $('#overlay').innerHTML =
      '<div class="mask" data-act="close"></div>' +
      '<div class="sheet">' +
        '<div class="sheet-grab"></div>' +
        '<div class="sheet-head"><div class="sheet-title">导入数据</div>' +
          '<button class="sheet-close" data-act="close">✕</button></div>' +
        '<div class="sheet-body">' +
          '<div class="imp-file"><div style="min-width:0">' +
            '<div class="imp-name">' + esc(im.name) + '</div>' +
            '<div class="imp-meta">' + (im.rows.length - 1) + ' 行 · ' + im.headers.length + ' 列</div>' +
          '</div><button class="link-btn" data-act="imp-pick">重选</button></div>' +

          '<div class="tbl-wrap"><table class="preview"><thead><tr>' + previewHead + '</tr></thead>' +
            '<tbody>' + previewBody + '</tbody></table></div>' +

          '<div class="field"><span class="field-label">这是什么数据</span><div class="field-ctl">' +
            '<select class="field-input" data-imp="type">' + typeOpts + '</select></div></div>' +
          '<div class="field"><span class="field-label">时间列</span><div class="field-ctl">' +
            '<select class="field-input" data-imp="timeCol">' + colOpts + '</select></div></div>' +
          '<div class="field"><span class="field-label">数值列</span><div class="field-ctl">' +
            '<select class="field-input" data-imp="valueCol">' + valOpts + '</select></div></div>' +
          unitRow + kindRow +

          '<div class="imp-run mt14">按当前设置会导入 <b id="impCount">—</b> 条</div>' +
        '</div>' +
        '<div class="sheet-foot">' +
          '<button class="btn btn-primary btn-block" data-act="imp-do">导入</button>' +
        '</div>' +
      '</div>';

    const cnt = document.getElementById('impCount');
    if (cnt) cnt.textContent = countImportable();
  }

  function toNumber(v) {
    if (v == null) return NaN;
    const s = String(v).replace(/,/g, '').replace(/[^\d.\-]/g, '');
    if (!s || s === '-' || s === '.') return NaN;
    return parseFloat(s);
  }

  function parseDateTime(v) {
    const s = String(v == null ? '' : v).trim();
    if (!s) return null;

    if (/^\d{10}$/.test(s)) {
      const d = new Date(parseInt(s, 10) * 1000);
      return { day: dateKey(d), time: pad(d.getHours()) + ':' + pad(d.getMinutes()) };
    }
    if (/^\d{13}$/.test(s)) {
      const d = new Date(parseInt(s, 10));
      return { day: dateKey(d), time: pad(d.getHours()) + ':' + pad(d.getMinutes()) };
    }

    let m = s.match(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:[ T](\d{1,2}):(\d{2}))?/);
    if (m) {
      return {
        day: m[1] + '-' + pad(+m[2]) + '-' + pad(+m[3]),
        time: m[4] != null ? pad(+m[4]) + ':' + m[5] : '07:00'
      };
    }
    m = s.match(/(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})(?:[ T](\d{1,2}):(\d{2}))?/);
    if (m) {
      return {
        day: m[3] + '-' + pad(+m[1]) + '-' + pad(+m[2]),
        time: m[4] != null ? pad(+m[4]) + ':' + m[5] : '07:00'
      };
    }
    m = s.match(/^(\d{1,2}):(\d{2})$/);
    if (m) return { day: todayKey(), time: pad(+m[1]) + ':' + m[2] };

    const d = new Date(s);
    if (!isNaN(d.getTime())) return { day: dateKey(d), time: pad(d.getHours()) + ':' + pad(d.getMinutes()) };
    return null;
  }

  function buildImportEvent(type, dt, num, unit, kind) {
    const day = dt.day, time = dt.time || '07:00';
    if (type === 'sleep') {
      let h = unit === 'hour' ? num : num / 60;
      h = Math.round(clamp(h, 0.2, 16) * 10) / 10;
      const wake = time;
      const bed = shiftTime(wake, -Math.round(h * 60));
      return mkEvent('sleep', { bed: bed, wake: wake, hours: h, quality: 3, wakeups: 0 }, day, wake, 'auto');
    }
    if (type === 'exercise') {
      const mins = Math.round(unit === 'hour' ? num * 60 : num);
      if (mins <= 0 || mins > 600) return null;
      return mkEvent('exercise', { kind: kind || '运动', minutes: mins, distance: 0, rpe: 5 }, day, time, 'auto');
    }
    if (type === 'activity') {
      const steps = Math.round(num);
      if (steps <= 0 || steps > 100000) return null;
      return mkEvent('activity', { steps: steps, activeMin: 0 }, day, '23:59', 'auto');
    }
    if (type === 'hr') {
      const hr = Math.round(num);
      if (hr < 30 || hr > 250) return null;
      return mkEvent('body', { weight: 0, restingHr: hr }, day, time, 'auto');
    }
    if (type === 'weight') {
      const w = unit === 'jin' ? Math.round(num / 2 * 10) / 10 : Math.round(num * 10) / 10;
      if (w < 20 || w > 300) return null;
      return mkEvent('body', { weight: w, restingHr: 0 }, day, time, 'auto');
    }
    return null;
  }

  function buildImportEvents() {
    const im = ui.imp;
    const ti = Number(im.timeCol), vi = Number(im.valueCol);
    const out = [];
    const seen = {};
    state.events.forEach(e => { seen[e.type + '|' + e.ts.slice(0, 16)] = 1; });

    let skipped = 0, dup = 0;
    for (let r = 1; r < im.rows.length; r++) {
      const row = im.rows[r];
      if (!row || !row.length) continue;
      const dt = parseDateTime(row[ti]);
      const num = toNumber(row[vi]);
      if (!dt || !isFinite(num)) { skipped++; continue; }
      const ev = buildImportEvent(im.type, dt, num, im.unit, im.kind);
      if (!ev) { skipped++; continue; }
      const key = ev.type + '|' + ev.ts.slice(0, 16);
      if (seen[key]) { dup++; continue; }
      seen[key] = 1;
      out.push(ev);
    }
    return { events: out, skipped: skipped, dup: dup };
  }

  function countImportable() {
    try { return buildImportEvents().events.length; } catch (e) { return 0; }
  }

  function doImport() {
    const r = buildImportEvents();
    if (!r.events.length) { toast('没有可导入的数据，检查一下列的对应关系'); return; }
    r.events.forEach(e => state.events.push(e));
    const ids = r.events.map(e => e.id);
    pushUndo('导入', function () { removeEvents(ids); });
    save();
    closeOverlay();
    render();
    toast('导入 ' + r.events.length + ' 条' + (r.dup ? '，跳过 ' + r.dup + ' 条重复' : ''), { label: '撤销' });
  }

  function pickImportFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.tsv,.txt,.json,.zip,.tcx';
    input.onchange = async function () {
      const f = input.files && input.files[0];
      if (!f) return;
      if (f.size > 30 * 1024 * 1024) { toast('文件太大了（超过 30MB）'); return; }
      try {
        const buf = await f.arrayBuffer();
        let u8 = new Uint8Array(buf);
        let name = f.name;

        if (/\.zip$/i.test(f.name)) {
          const entries = unzip(buf).filter(e => /\.(csv|tsv|txt|json|tcx)$/i.test(e.name));
          if (!entries.length) throw new Error('zip 里没有 csv / json / tcx');
          entries.sort((a, b) => b.raw.length - a.raw.length);
          const pick = entries[0];
          u8 = pick.method === 0 ? pick.raw : await inflateRaw(pick.raw);
          name = pick.name;
        }

        /* TCX 走专用解析，不进列映射 */
        const text = decodeText(u8);
        if (isTcxText(text, name)) {
          const acts = parseTCX(text);
          if (!acts.length) throw new Error('TCX 里没有可导入的活动');
          ui.tcx = { acts: acts, name: name };
          renderTcxSheet();
          return;
        }

        const rows = rowsFromBuffer(u8, name);
        if (!rows || rows.length < 2) throw new Error('文件里没有可用的表格数据');
        initImport(name, rows);
      } catch (err) {
        console.warn(err);
        toast('读取失败：' + err.message);
      }
    };
    input.click();
  }

  /* ---------------------------------------------------------
     事件
     --------------------------------------------------------- */
  document.addEventListener('click', async function (e) {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const act = el.dataset.act;

    /* 浮层内点击遮罩关闭 */
    if (act === 'close') { closeOverlay(); return; }

    if (act === 'undo') { undoLast(); return; }

    /* 编辑时切换记录类型 */
    if (act === 'retype') {
      const newType = el.dataset.type;
      const cur = state.events.find(x => x.id === ui.editId);
      if (!cur || cur.type === newType) return;
      const vals = collect();
      delete vals.__date;
      const dateEl = document.querySelector('[data-f="__date"]');
      const day = dateEl && dateEl.value ? dateEl.value : cur.ts.slice(0, 10);
      const merged = Object.assign({}, defaultData(newType), pickOverlap(vals, defaultData(newType)));
      openForm(newType, {
        id: cur.id,
        type: newType,
        ts: day + 'T' + cur.ts.slice(11, 16) + ':00',
        data: merged
      });
      return;
    }

    if (act === 'tab') {
      ui.tab = el.dataset.tab;
      closeOverlay();
      render();
      return;
    }

    if (act === 'add') { openAdd(); return; }

    if (act === 'add-yesterday') { openAdd('yesterday'); return; }

    if (act === 'form') {
      const wasSheet = $('#overlay').children.length > 0;
      if (!wasSheet) ui.addDay = 'today';
      openForm(el.dataset.type);
      return;
    }

    if (act === 'day') {
      ui.addDay = el.dataset.d;
      Array.prototype.forEach.call(document.querySelectorAll('.date-seg button'), b => {
        b.classList.toggle('on', b.dataset.d === ui.addDay);
      });
      return;
    }

    if (act === 'ai-parse') {
      const ta = document.getElementById('aiInput');
      const text = ta ? ta.value.trim() : '';
      if (!text) { toast('先写点什么'); return; }
      const usingAI = aiReady();
      const label = el.textContent;
      el.textContent = usingAI ? 'AI 解析中…' : '解析中…';
      el.disabled = true;
      await doParse(text);
      /* 如果没被预览页替换掉，就把按钮还原 */
      el.textContent = label;
      el.disabled = false;
      return;
    }

    if (act === 'pv-toggle') { togglePreview(Number(el.dataset.i)); return; }
    if (act === 'pv-confirm') { confirmPreview(); return; }
    if (act === 'pv-back') { openAdd(); return; }

    if (act === 'save') { saveForm(el.dataset.type); return; }

    if (act === 'quick') {
      const q = el.dataset.q;
      if (q === 'water') {
        const ev = mkEvent('water', { cups: 1 }, todayKey(), nowHHMM(), 'manual');
        state.events.push(ev);
        pushUndo('喝水', function () { removeEvents([ev.id]); });
        save(); render(); toast('💧 记了一杯水', { label: '撤销' });
      } else if (q === 'coffee') {
        const ev = mkEvent('meal', { meal: '咖啡', food: '咖啡', fullness: 1, where: '外食' }, todayKey(), nowHHMM(), 'manual');
        state.events.push(ev);
        pushUndo('咖啡', function () { removeEvents([ev.id]); });
        save(); render(); toast('☕ 记了一杯咖啡', { label: '撤销' });
      } else if (q === 'run') { openForm('exercise'); }
      else if (q === 'read') { openForm('study'); }
      else if (q === 'mood') { openForm('mood'); }
      else if (q === 'weight') { openForm('body'); }
      else if (q === 'note') { openForm('note'); }
      return;
    }

    if (act === 'todo-add') {
      const inp = document.getElementById('todoInput');
      const text = inp ? inp.value.trim() : '';
      if (!text) return;
      state.todos.push({ id: uid('t'), text: text, done: false, date: todayKey() });
      save(); render();
      const ni = document.getElementById('todoInput');
      if (ni) ni.focus();
      return;
    }

    if (act === 'todo-toggle') {
      const t = state.todos.find(x => x.id === el.dataset.id);
      if (t) { t.done = !t.done; save(); render(); }
      return;
    }

    if (act === 'todo-del') {
      state.todos = state.todos.filter(x => x.id !== el.dataset.id);
      save(); render();
      return;
    }

    if (act === 'filter') {
      ui.filter = el.dataset.f;
      ui.tlLimit = 14;
      renderMain();
      return;
    }

    if (act === 'tl-more') {
      ui.tlLimit = (ui.tlLimit || 14) + 14;
      renderMain(true);
      return;
    }

    if (act === 'wd') {
      ui.wd = el.dataset.m;
      renderMain(true);
      return;
    }

    if (act === 'insp') {
      openInsightDetail(Number(el.dataset.i));
      return;
    }

    if (act === 'sleep-replace' || act === 'sleep-add') {
      if (!pendingSleep) { closeOverlay(); return; }
      const p = pendingSleep;
      pendingSleep = null;
      const created = mkEvent('sleep', p.data, p.day, p.hhmm, 'manual');

      if (act === 'sleep-replace') {
        const idx = state.events.findIndex(e => e.id === p.existingId);
        const old = idx >= 0 ? state.events[idx] : null;
        if (old) state.events.splice(idx, 1);
        state.events.push(created);
        pushUndo('替换睡眠', function () {
          removeEvents([created.id]);
          if (old) state.events.splice(Math.min(idx, state.events.length), 0, old);
        });
        save(); closeOverlay(); render();
        toast('已替换', { label: '撤销' });
      } else {
        state.events.push(created);
        pushUndo('新增', function () { removeEvents([created.id]); });
        save(); closeOverlay(); render();
        toast('已记录 · 睡眠', { label: '撤销' });
      }
      return;
    }

    if (act === 'row-open') { openRecordActions(el.dataset.id); return; }
    if (act === 'detail') { openExerciseDetail(el.dataset.id); return; }
    if (act === 'hc-hr') { attachHrToExercise(el.dataset.id); return; }
    if (act === 'edit') {
      const ev = state.events.find(x => x.id === el.dataset.id);
      if (ev) openForm(ev.type, ev);
      return;
    }
    if (act === 'del') {
      const id = el.dataset.id;
      const idx = state.events.findIndex(x => x.id === id);
      if (idx < 0) { closeOverlay(); toast('这条记录已经不在了'); return; }
      const removed = state.events[idx];
      state.events.splice(idx, 1);
      pushUndo('删除', function () {
        state.events.splice(Math.min(idx, state.events.length), 0, removed);
      });
      save(); closeOverlay(); render();
      toast('已删除', { label: '撤销' });
      return;
    }

    if (act === 'goal') {
      const k = el.dataset.k;
      const d = Number(el.dataset.d);
      const limits = { sleepGoal: [4, 12], exerciseGoal: [5, 180], studyGoal: [10, 300], waterGoal: [1, 16], mealGoal: [1, 6] };
      const lim = limits[k] || [0, 999];
      state.settings[k] = clamp(Math.round((state.settings[k] + d) * 10) / 10, lim[0], lim[1]);
      save(); renderMain();
      return;
    }

    if (act === 'theme') {
      state.settings.theme = el.dataset.v;
      save(); render();
      return;
    }

    if (act === 'ai-settings') { openAISettings(); return; }
    if (act === 'ai-save') { saveAISettings(); return; }
    if (act === 'ai-test') { testAI(); return; }
    if (act === 'imp-open') { openImport(); return; }
    if (act === 'imp-pick') { pickImportFile(); return; }
    if (act === 'imp-do') { doImport(); return; }
    if (act === 'tcx-do') { doTcxImport(); return; }
    if (act === 'hc-sync') { syncHealth(7); return; }

    if (act === 'export') { exportData(); return; }
    if (act === 'import') { importData(); return; }
    if (act === 'seed') {
      const snap = { events: state.events.slice(), todos: state.todos.slice() };
      seedDemo(21);
      pushUndo('生成示例', function () { state.events = snap.events; state.todos = snap.todos; });
      save(); closeOverlay(); render();
      toast('已生成示例数据', { label: '撤销' });
      return;
    }
    if (act === 'clear') {
      const snap = { events: state.events.slice(), todos: state.todos.slice() };
      state.events = []; state.todos = [];
      pushUndo('清空', function () { state.events = snap.events; state.todos = snap.todos; });
      save(); closeOverlay(); render();
      toast('已清空', { label: '撤销' });
      return;
    }

    if (act === 'report') { openReport(); return; }
    if (act === 'report-close') { closeOverlay(); return; }
  });

  /* 芯片 / 心情按钮 */
  document.addEventListener('click', function (e) {
    const chip = e.target.closest('.chip');
    if (chip) {
      const row = chip.parentElement;
      if (row.dataset.multi === '1') chip.classList.toggle('sel');
      else {
        Array.prototype.forEach.call(row.children, b => b.classList.remove('sel'));
        chip.classList.add('sel');
      }
      return;
    }
    const mb = e.target.closest('.mood-btn');
    if (mb) {
      const row = mb.parentElement;
      Array.prototype.forEach.call(row.children, b => b.classList.remove('sel'));
      mb.classList.add('sel');
    }
  });

  /* 滑块 / 时间实时反馈 */
  document.addEventListener('input', function (e) {
    const t = e.target;
    if (t.matches('input[type="range"]')) {
      const k = t.dataset.f;
      const out = document.getElementById('rv_' + k);
      if (out) {
        const fd = findField(k);
        out.textContent = fd && fd.fmt ? fd.fmt(t.value) : t.value;
      }
    }
    if (t.dataset.f === 'bed' || t.dataset.f === 'wake') updateSleepTotal();
  });

  function findField(k) {
    for (const t in FORMS) {
      const f = FORMS[t].fields.find(x => x.k === k);
      if (f) return f;
    }
    return null;
  }

  /* 导入面板的下拉选择 */
  document.addEventListener('change', function (e) {
    const sel = e.target.closest('[data-imp]');
    if (!sel || !ui.imp) return;
    ui.imp[sel.dataset.imp] = sel.value;
    renderImportSheet();
  });

  /* 回车添加待办 */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target.id === 'todoInput') {
      e.preventDefault();
      const btn = document.querySelector('[data-act="todo-add"]');
      if (btn) btn.click();
    }
  });

  /* ---------------------------------------------------------
     启动
     --------------------------------------------------------- */
  load();
  render();

  /* 调试出口（控制台可用 __onelog 查看数据） */
  if (typeof window !== 'undefined') {
    window.__onelog = {
      state: state, ui: ui, render: render, dayStats: dayStats, computeInsights: computeInsights,
      parseText: parseText, weekSummary: weekSummary, todayQuote: todayQuote, seed: seedDemo, save: save,
      openAdd: openAdd, openForm: openForm, openReport: openReport, openRecordActions: openRecordActions, showPreview: showPreview,
      saveForm: saveForm, collect: collect, undoLast: undoLast, pickOverlap: pickOverlap,
      /* v2：AI 解析 */
      aiParse: aiParse, doParse: doParse, buildAIEvent: buildAIEvent, aiReady: aiReady,
      openAISettings: openAISettings, AI_SYSTEM_PROMPT: AI_SYSTEM_PROMPT,
      /* v2：数据导入 */
      parseCSV: parseCSV, unzip: unzip, rowsFromJSON: rowsFromJSON, parseDateTime: parseDateTime,
      buildImportEvent: buildImportEvent, guessCols: guessCols, initImport: initImport,
      buildImportEvents: buildImportEvents, renderImportSheet: renderImportSheet, openImport: openImport,
      /* v1.4：星期维度 */
      weekdayOf: weekdayOf, weekdayBuckets: weekdayBuckets, sleepRegularity: sleepRegularity,
      bedMinutes: bedMinutes, weekdayCard: weekdayCard, cacheVer: function () { return cacheVer; },
      /* v1.5：下钻 / 重复睡眠保护 */
      openInsightDetail: openInsightDetail, openSleepConflict: openSleepConflict,
      /* v1.6：Health Connect 同步 */
      syncHealth: syncHealth, addExternal: addExternal, buildHealthRecords: buildHealthRecords,
      healthPlugin: healthPlugin, healthDesc: healthDesc,
      /* v1.7：TCX 轨迹 */
      parseTCX: parseTCX, tcxToRecords: tcxToRecords, isTcxText: isTcxText,
      renderTcxSheet: renderTcxSheet, fmtPace: fmtPace,
      openExerciseDetail: openExerciseDetail, seriesSvg: seriesSvg, trackSvg: trackSvg,
      attachHrToExercise: attachHrToExercise, exerciseWindow: exerciseWindow
    };
  }

})();
