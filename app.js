/* ============================================================
   LANCER TRACKER v2 — ENGINE
   Features: Terminal Preloader, Live Search/Filter, Markdown Export
   ============================================================ */
(function () {
  'use strict';

  var sessions = JSON.parse(localStorage.getItem('lancer_v2')) || [];
  var theme    = localStorage.getItem('lancer_theme') || 'abyss';
  var current  = null, editor = null;
  var timerIv  = null, timerSec = 0, timerOn = false;
  var choice   = 'live', activeTab = 'notes';

  var LANG = {
    python:'python',py:'python',
    javascript:'javascript',js:'javascript',
    java:'text/x-java',c:'text/x-csrc',
    'c++':'text/x-c++src',cpp:'text/x-c++src',
    html:'xml',css:'css'
  };
  var CM_THEME = {
    abyss:'material-palenight', dark:'material-palenight',
    dim:'tomorrow-night-eighties', light:'eclipse', white:'eclipse'
  };

  function $ (id) { return document.getElementById(id); }

  /* ============================================================
     BOOT
  ============================================================ */
  window.onload = function () {
    applyTheme(theme, false);
    preloaderSequence();
    initEditor();
    wireEvents();
    renderDashboard();
  };

  /* ============================================================
     PRELOADER — Code Terminal Typing
  ============================================================ */
  var CODE_SCRIPTS = [
    [
      { t:'keyword', tx:'import' },
      { t:'', tx:' lancer' },
      { t:'comment', tx:'  # initializing tracker...' },
      { t:'fn', tx:'lancer.boot()' },
      { t:'string', tx:'"Loading workspace..."' },
      { t:'output', tx:'→ Sessions loaded ✓' },
      { t:'output', tx:'→ Editor engine ready ✓' },
      { t:'output', tx:'→ Themes applied ✓' },
      { t:'string', tx:'"Welcome back. Let\'s learn."' }
    ],
    [
      { t:'comment', tx:'// Starting Lancer Tracker v2' },
      { t:'keyword', tx:'const' },
      { t:'', tx:' app = new LancerTracker()' },
      { t:'fn', tx:'app.init()' },
      { t:'output', tx:'> Loading sessions... done' },
      { t:'output', tx:'> Setting up editor... done' },
      { t:'fn', tx:'app.render()' },
      { t:'string', tx:'"Ready to track your progress."' }
    ],
    [
      { t:'comment', tx:'/* lancer_boot.py */' },
      { t:'keyword', tx:'def' },
      { t:'fn', tx:' init_tracker():' },
      { t:'', tx:'    sessions = load_local()' },
      { t:'', tx:'    editor   = build_editor()' },
      { t:'', tx:'    apply_theme(saved_theme)' },
      { t:'output', tx:'✓ Tracker initialized' },
      { t:'string', tx:'"Happy coding! 🚀"' }
    ]
  ];

  function preloaderSequence() {
    var body    = $('pre-term-body');
    var bar     = $('pre-bar');
    var pctEl   = $('pre-pct');
    var preEl   = $('preloader');
    var script  = CODE_SCRIPTS[Math.floor(Math.random() * CODE_SCRIPTS.length)];
    var lineIdx = 0;
    var prog    = 0;

    // Typing cursor
    var cursor = document.createElement('span');
    cursor.className = 'pre-cursor';
    body.appendChild(cursor);

    function addLine() {
      if (lineIdx >= script.length) return;
      var item = script[lineIdx++];
      var span = document.createElement('span');
      span.className = 'pre-line' + (item.t ? ' ' + item.t : '') + (item.t === 'prompt' ? ' prompt' : '');
      span.textContent = item.tx;
      body.insertBefore(span, cursor);
      // Scroll to bottom
      body.scrollTop = body.scrollHeight;
    }

    // Type lines at intervals tied to progress
    var lineIv = setInterval(function () {
      if (lineIdx < script.length) addLine();
      else clearInterval(lineIv);
    }, 500);

    // Progress bar
    var barIv = setInterval(function () {
      prog += Math.random() * 4 + 1.5;
      if (prog >= 100) {
        prog = 100;
        clearInterval(barIv);
        clearInterval(lineIv);
        // Show remaining lines instantly
        while (lineIdx < script.length) addLine();
        bar.style.width  = '100%';
        pctEl.textContent = '100%';
        bar.style.boxShadow = '0 0 18px #6c7eea, 0 0 40px #8b9cf7';

        setTimeout(function () {
          preEl.classList.add('exit');
          setTimeout(function () { preEl.style.display = 'none'; }, 750);
        }, 700);
        return;
      }
      bar.style.width   = prog + '%';
      pctEl.textContent = Math.round(prog) + '%';
    }, 160);
  }

  /* ============================================================
     THEME ENGINE
  ============================================================ */
  function applyTheme(t) {
    theme = t;
    document.body.setAttribute('data-theme', t);
    localStorage.setItem('lancer_theme', t);
    document.querySelectorAll('.theme-dot').forEach(function (d) {
      d.classList.toggle('active', d.dataset.theme === t);
    });
    if (editor) editor.setOption('theme', CM_THEME[t] || 'material-palenight');
  }

  /* ============================================================
     CODE MIRROR
  ============================================================ */
  function initEditor() {
    editor = CodeMirror.fromTextArea($('editor-main'), {
      lineNumbers:true, mode:'python', theme:CM_THEME[theme] || 'material-palenight',
      lineWrapping:true, tabSize:4, indentUnit:4,
      extraKeys:{
        'Ctrl-Space':'autocomplete',
        'Tab':function(cm){cm.replaceSelection('    ');}
      }
    });
    editor.on('change', autoSave);
    editor.on('inputRead', function(cm, ch){
      if (ch.origin !== '+input') return;
      CodeMirror.commands.autocomplete(cm, null, {completeSingle:false});
    });
  }

  /* ============================================================
     NAVIGATION
  ============================================================ */
  function showView(id) {
    document.querySelectorAll('.view').forEach(function(v){ v.classList.remove('active'); });
    $(id).classList.add('active');
    if (id === 'view-work') setTimeout(function(){ editor.refresh(); }, 20);
  }

  function switchTab(name) {
    if (current) {
      if (activeTab === 'learned') current.learned   = $('learned-text').value;
      if (activeTab === 'next')    current.nextGoals  = $('next-text').value;
    }
    activeTab = name;
    document.querySelectorAll('.tab-btn').forEach(function(b){ b.classList.remove('active'); });
    document.querySelectorAll('.tab-panel').forEach(function(p){ p.classList.remove('active'); });
    document.querySelector('[data-tab="'+name+'"]').classList.add('active');
    $('tab-'+name).classList.add('active');
    if (name === 'notes') setTimeout(function(){ editor.refresh(); }, 20);
  }

  /* ============================================================
     DASHBOARD + SEARCH / FILTER
  ============================================================ */
  function renderDashboard() {
    rebuildFilters();
    applyFilters();
    updateStats();
  }

  function rebuildFilters() {
    var topics = {}, langs = {};
    sessions.forEach(function(s){
      if (s.topic) topics[s.topic.toLowerCase()] = s.topic;
      if (s.lang)  langs[s.lang.toLowerCase()]   = s.lang;
    });

    var fTopic = $('filter-topic');
    var fLang  = $('filter-lang');
    var selT   = fTopic.value, selL = fLang.value;

    fTopic.innerHTML = '<option value="">All Topics</option>';
    Object.values(topics).sort().forEach(function(t){
      var o = document.createElement('option');
      o.value = t; o.textContent = t;
      if (t === selT) o.selected = true;
      fTopic.appendChild(o);
    });

    fLang.innerHTML = '<option value="">All Languages</option>';
    Object.values(langs).sort().forEach(function(l){
      var o = document.createElement('option');
      o.value = l; o.textContent = l;
      if (l === selL) o.selected = true;
      fLang.appendChild(o);
    });
  }

  function applyFilters() {
    var query = ($('search-input').value || '').trim().toLowerCase();
    var topic = ($('filter-topic').value || '').toLowerCase();
    var lang  = ($('filter-lang').value  || '').toLowerCase();
    var days  = parseInt($('filter-date').value) || 0;
    var now   = Date.now();

    /* Toggle clear button */
    var clearBtn = $('btn-clear-search');
    clearBtn.classList.toggle('visible', query.length > 0);

    var filtered = sessions.filter(function(s){
      if (query && !(s.title.toLowerCase().includes(query) || (s.topic||'').toLowerCase().includes(query))) return false;
      if (topic  && (s.topic||'').toLowerCase() !== topic) return false;
      if (lang   && (s.lang||'').toLowerCase()  !== lang)  return false;
      if (days) {
        var cutoff = now - days * 86400000;
        // Parse d/m/yyyy
        var parts = (s.date || '').split('/');
        var sDate = parts.length === 3 ? new Date(parts[2], parts[1]-1, parts[0]).getTime() : 0;
        if (sDate < cutoff) return false;
      }
      return true;
    });

    var tl = $('timeline');
    tl.innerHTML = '';
    var count = $('filter-count');

    if (filtered.length === 0) {
      count.textContent = '0 sessions';
      tl.innerHTML = '<div class="empty-state">No sessions match your filters.</div>';
      return;
    }

    var hasFilters = query || topic || lang || days;
    count.textContent = hasFilters ? filtered.length + ' / ' + sessions.length + ' sessions' : '';

    filtered.slice().reverse().forEach(function(s, idx){
      var card = document.createElement('div');
      card.className = 'tl-card';
      card.style.animationDelay = (idx * 0.04) + 's';
      card.innerHTML =
        '<div class="tl-date">' + s.date + '</div>' +
        '<div class="tl-body"><div class="tl-title">' + esc(s.title) + '</div>' +
          '<div class="tl-badges"><span class="badge badge-topic">' + esc(s.topic) + '</span> <span class="badge badge-lang">' + esc(s.lang) + '</span></div>' +
        '</div>' +
        '<div class="tl-right">' +
          '<div class="tl-time">' + fmtTime(s.minutes||0) + '</div>' +
          '<div class="tl-counts">' +
            '<span class="tl-count">💻 <span>'+(s.snippets||[]).length+'</span></span>' +
            '<span class="tl-count">⚠️ <span>'+(s.errors||[]).length+'</span></span>' +
            '<span class="tl-count">💡 <span>'+(s.tips||[]).length+'</span></span>' +
          '</div>' +
        '</div>';
      card.onclick = function(){ openSession(s); };
      tl.appendChild(card);
    });

    // If blank state
    if (sessions.length === 0) {
      count.textContent = '';
      tl.innerHTML = '<div class="empty-state">No sessions yet.<br>Click <strong>+ New Session</strong> to start tracking.</div>';
    }
  }

  function updateStats() {
    var totalMins = 0, totalSnip = 0, totalErr = 0;
    sessions.forEach(function(s){
      totalMins += s.minutes || 0;
      totalSnip += (s.snippets||[]).length;
      totalErr  += (s.errors||[]).length;
    });
    $('stat-hours').textContent    = (totalMins / 60).toFixed(1) + 'h';
    $('stat-sessions').textContent = sessions.length;
    $('stat-snippets').textContent = totalSnip;
    $('stat-errors').textContent   = totalErr;
  }

  function fmtTime(mins) {
    if (mins >= 60) return (mins / 60).toFixed(1) + 'h';
    return mins + 'm';
  }

  /* ============================================================
     SESSION MANAGEMENT
  ============================================================ */
  function openModal() {
    $('f-title').value = ''; $('f-topic').value = ''; $('f-lang').value = ''; $('f-mins').value = '60';
    setChoice('live');
    $('modal').classList.add('open');
    setTimeout(function(){ $('f-title').focus(); }, 200);
  }

  function createSession() {
    var title = $('f-title').value.trim();
    var topic = $('f-topic').value.trim() || 'General';
    var lang  = $('f-lang').value.trim()  || 'Python';
    var mins  = parseInt($('f-mins').value) || 60;
    if (!title) { toast('⚠ Enter a session title.', true); return; }

    current = {
      id:Date.now(), title:title, topic:topic, lang:lang,
      date:new Date().toLocaleDateString('en-GB'),
      minutes: choice === 'manual' ? mins : 0,
      notes:'', snippets:[], errors:[], tips:[], learned:'', nextGoals:'', todos:[]
    };
    sessions.push(current);
    save();
    $('modal').classList.remove('open');
    loadWorkspace();

    if (choice === 'live') {
      $('timer-btns').style.display = 'flex';
      $('btn-resume').style.display = 'none';
      $('btn-pause').style.display  = 'inline-block';
      startTimer();
    } else {
      $('timer-val').textContent    = mins + 'm ✓';
      $('timer-btns').style.display = 'none';
    }
  }

  function openSession(sess) {
    current = sess;
    loadWorkspace();
    $('timer-val').textContent    = fmtTime(sess.minutes||0) + ' logged';
    $('timer-btns').style.display = 'none';
  }

  function loadWorkspace() {
    $('ws-title').textContent = current.title;
    $('ws-topic').textContent = current.topic;
    $('ws-lang').textContent  = current.lang;
    var mode = LANG[current.lang.toLowerCase()] || 'python';
    editor.setOption('mode', mode);
    editor.setValue(current.notes || '');
    $('learned-text').value = current.learned   || '';
    $('next-text').value    = current.nextGoals  || '';
    renderSnippets(); renderErrors(); renderTips(); renderTodos();
    updateCounts();
    hideForm('snippet-form'); hideForm('error-form'); hideForm('tip-form');
    switchTab('notes');
    showView('view-work');
  }

  function autoSave() {
    if (!current) return;
    current.notes = editor.getValue();
    syncTxt(); save();
  }

  function syncTxt() {
    if (!current) return;
    current.learned   = $('learned-text').value;
    current.nextGoals = $('next-text').value;
    var idx = sessions.findIndex(function(s){ return s.id === current.id; });
    if (idx !== -1) sessions[idx] = current;
  }

  function save() { localStorage.setItem('lancer_v2', JSON.stringify(sessions)); }

  function updateCounts() {
    if (!current) return;
    $('tc-snippets').textContent = (current.snippets||[]).length;
    $('tc-errors').textContent   = (current.errors||[]).length;
    $('tc-tips').textContent     = (current.tips||[]).length;
    $('tc-todos').textContent    = (current.todos||[]).filter(function(t){return !t.done;}).length;
  }

  /* ============================================================
     TIMER
  ============================================================ */
  function startTimer() {
    timerOn = true;
    $('timer-val').classList.remove('paused');
    timerIv = setInterval(function(){
      timerSec++;
      var h = Math.floor(timerSec/3600), m = Math.floor((timerSec%3600)/60), s = timerSec%60;
      $('timer-val').textContent =
        (h>0?(h<10?'0'+h:h)+':':'')+
        (m<10?'0'+m:m)+':'+(s<10?'0'+s:s);
    }, 1000);
  }

  function pauseTimer() {
    clearInterval(timerIv); timerOn = false;
    $('timer-val').classList.add('paused');
    $('btn-pause').style.display  = 'none';
    $('btn-resume').style.display = 'inline-block';
  }

  function finishSession() {
    clearInterval(timerIv);
    if (current && timerOn) current.minutes = Math.max(1, Math.round(timerSec/60));
    timerSec = 0; timerOn = false;
    syncTxt(); save();
    toast('✅ Session saved!');
    showView('view-dash');
    renderDashboard();
  }

  /* ============================================================
     SNIPPETS
  ============================================================ */
  function renderSnippets() {
    var list = $('snippets-list'); list.innerHTML = '';
    if (!(current.snippets||[]).length) {
      list.innerHTML = '<div class="empty-state" style="padding:28px 0">No snippets yet. Save code examples from the lecture.</div>'; return;
    }
    current.snippets.forEach(function(s,i){
      var d = document.createElement('div'); d.className='snippet-card'; d.style.animationDelay=(i*0.04)+'s';
      d.innerHTML='<div class="card-header"><span class="card-label">💻 '+esc(s.label)+'</span>'+
        '<div class="card-actions">'+
          '<button class="btn-card-action" onclick="window._L.copySnip('+i+')">📋 Copy</button>'+
          '<button class="btn-card-action btn-card-delete" onclick="window._L.delSnip('+i+')">🗑</button>'+
        '</div></div><pre class="card-code">'+esc(s.code)+'</pre>';
      list.appendChild(d);
    });
    updateCounts();
  }

  function saveSnippet() {
    var label = $('snip-label').value.trim()||'Snippet', code = $('snip-code').value.trim();
    if (!code){ toast('⚠ Paste some code first.',true); return; }
    current.snippets.push({label:label,lang:$('snip-lang').value,code:code});
    $('snip-label').value=''; $('snip-code').value='';
    hideForm('snippet-form'); syncTxt(); save(); renderSnippets(); toast('💻 Snippet saved!');
  }

  /* ============================================================
     ERRORS
  ============================================================ */
  function renderErrors() {
    var list = $('errors-list'); list.innerHTML = '';
    if (!(current.errors||[]).length) {
      list.innerHTML = '<div class="empty-state" style="padding:28px 0">No errors logged. Every bug is a lesson!</div>'; return;
    }
    current.errors.forEach(function(e,i){
      var d = document.createElement('div'); d.className='error-card'; d.style.animationDelay=(i*0.04)+'s';
      d.innerHTML='<div style="display:flex;justify-content:space-between;align-items:flex-start">'+
        '<div class="error-problem">⚠ '+esc(e.problem)+'</div>'+
        '<button class="btn-card-action btn-card-delete" onclick="window._L.delErr('+i+')">🗑</button></div>'+
        (e.solution?'<div class="error-solution">✔ '+esc(e.solution)+'</div>':'');
      list.appendChild(d);
    });
    updateCounts();
  }

  function saveError() {
    var p = $('err-problem').value.trim(), s = $('err-solution').value.trim();
    if (!p){ toast('⚠ Describe the error.',true); return; }
    current.errors.push({problem:p,solution:s});
    $('err-problem').value=''; $('err-solution').value='';
    hideForm('error-form'); syncTxt(); save(); renderErrors(); toast('⚠️ Error logged!');
  }

  /* ============================================================
     TIPS
  ============================================================ */
  function renderTips() {
    var list = $('tips-list'); list.innerHTML = '';
    if (!(current.tips||[]).length) {
      list.innerHTML = '<div class="empty-state" style="padding:28px 0">No tips saved. Write down important patterns!</div>'; return;
    }
    current.tips.forEach(function(t,i){
      var d = document.createElement('div'); d.className='tip-card'; d.style.animationDelay=(i*0.04)+'s';
      d.innerHTML='<div class="card-top"><div class="tip-text">💡 '+esc(t.text)+'</div>'+
        '<button class="btn-card-action btn-card-delete" onclick="window._L.delTip('+i+')">🗑</button></div>';
      list.appendChild(d);
    });
    updateCounts();
  }

  function saveTip() {
    var text = $('tip-text').value.trim();
    if (!text){ toast('⚠ Write a tip first.',true); return; }
    current.tips.push({text:text});
    $('tip-text').value='';
    hideForm('tip-form'); syncTxt(); save(); renderTips(); toast('💡 Tip saved!');
  }

  /* ============================================================
     TODOS
  ============================================================ */
  function renderTodos() {
    var list = $('todo-list'); list.innerHTML = '';
    if (!(current.todos||[]).length) return;
    current.todos.forEach(function(t,i){
      var li = document.createElement('li');
      li.className = 'todo-item'+(t.done?' done':'');
      li.innerHTML = '<input type="checkbox"'+(t.done?' checked':'')+'>'+
        '<span>'+esc(t.text)+'</span><button class="todo-del">×</button>';
      li.querySelector('input').onchange = function(e){
        current.todos[i].done = e.target.checked;
        li.className = 'todo-item'+(e.target.checked?' done':'');
        syncTxt(); save(); updateCounts();
      };
      li.querySelector('.todo-del').onclick = function(){
        current.todos.splice(i,1); syncTxt(); save(); renderTodos(); updateCounts();
      };
      list.appendChild(li);
    });
    updateCounts();
  }

  function addTodo() {
    var val = $('todo-input').value.trim();
    if (!val || !current) return;
    current.todos.push({text:val,done:false});
    $('todo-input').value = '';
    syncTxt(); save(); renderTodos(); toast('✅ Goal added!');
  }

  /* ============================================================
     MARKDOWN EXPORT (Bonus Feature)
  ============================================================ */
  function exportMarkdown() {
    if (!current) return;
    syncTxt();

    var D   = '\n\n---\n\n'; // Section divider
    var now = new Date();
    var exportDate = now.toLocaleDateString('en-GB') + ' at ' + now.toLocaleTimeString('en-GB', {hour:'2-digit',minute:'2-digit'});
    var parts = [];

    /* ── HEADER ── */
    parts.push(
      '# 🎯 ' + current.title + '\n' +
      '> *Exported from Lancer Tracker · ' + exportDate + '*\n\n' +
      '| 📅 Date | 🏷 Topic | 💻 Language | ⏱ Duration |\n' +
      '|:---:|:---:|:---:|:---:|\n' +
      '| ' + current.date + ' | ' + current.topic + ' | ' + current.lang + ' | ' + fmtTime(current.minutes) + ' |'
    );

    /* ── QUICK SUMMARY ROW ── */
    var snipCount  = (current.snippets||[]).length;
    var errCount   = (current.errors||[]).length;
    var tipCount   = (current.tips||[]).length;
    var todoCount  = (current.todos||[]).length;
    var doneTodos  = (current.todos||[]).filter(function(t){ return t.done; }).length;
    parts.push(
      '## 📊 Session Summary\n\n' +
      '| Item | Count |\n' +
      '|:---|:---:|\n' +
      '| 💻 Code Snippets | ' + snipCount + ' |\n' +
      '| ⚠️ Errors Logged | ' + errCount + ' |\n' +
      '| 💡 Tips Saved | ' + tipCount + ' |\n' +
      '| ✅ To-Do Items | ' + doneTodos + ' / ' + todoCount + ' done |'
    );

    /* ── NOTES ── */
    if (current.notes && current.notes.trim()) {
      parts.push(
        '## 📝 Lecture Notes\n\n' +
        current.notes.trim()
      );
    }

    /* ── SNIPPETS ── */
    if (snipCount) {
      var snipLines = ['## 💻 Code Snippets\n'];
      current.snippets.forEach(function(s, i){
        var langId = (s.lang||'').replace('text/x-','').replace('text/x-c++src','cpp').replace('xml','html');
        snipLines.push(
          '### ' + (i+1) + '. ' + s.label + '\n\n' +
          '```' + langId + '\n' +
          s.code.trim() + '\n' +
          '```'
        );
      });
      parts.push(snipLines.join('\n\n'));
    }

    /* ── ERRORS ── */
    if (errCount) {
      var errLines = ['## ⚠️ Errors & Fixes\n'];
      current.errors.forEach(function(e, i){
        errLines.push(
          '### Error ' + (i+1) + ': ' + e.problem + '\n\n' +
          (e.solution
            ? '> **✔ Fix:** ' + e.solution
            : '> *No fix noted yet.*')
        );
      });
      parts.push(errLines.join('\n\n'));
    }

    /* ── TIPS ── */
    if (tipCount) {
      var tipLines = ['## 💡 Tips & Tricks\n'];
      current.tips.forEach(function(t, i){
        tipLines.push((i+1) + '. ' + t.text);
      });
      parts.push(tipLines.join('\n'));
    }

    /* ── WHAT I LEARNED ── */
    if (current.learned && current.learned.trim()) {
      parts.push(
        '## 📌 What I Learned\n\n' +
        current.learned.trim()
      );
    }

    /* ── NEXT GOALS ── */
    if (current.nextGoals && current.nextGoals.trim()) {
      parts.push(
        '## 🔜 Next Goals\n\n' +
        current.nextGoals.trim()
      );
    }

    /* ── TODOS ── */
    if (todoCount) {
      var todoLines = ['## ✅ Session To-Do List\n'];
      var pending = current.todos.filter(function(t){ return !t.done; });
      var done    = current.todos.filter(function(t){ return t.done; });
      if (pending.length) {
        todoLines.push('**Pending:**');
        pending.forEach(function(t){ todoLines.push('- [ ] ' + t.text); });
      }
      if (done.length) {
        if (pending.length) todoLines.push('');
        todoLines.push('**Completed:**');
        done.forEach(function(t){ todoLines.push('- [x] ' + t.text); });
      }
      parts.push(todoLines.join('\n'));
    }

    /* ── FOOTER ── */
    parts.push(
      '*Generated by [Lancer Tracker](https://github.com/lancer) · Keep learning. Keep building. 🚀*'
    );

    var md   = parts.join(D);
    var blob = new Blob([md], {type:'text/markdown;charset=utf-8'});
    var url  = URL.createObjectURL(blob);
    var a    = document.createElement('a');
    a.href   = url;
    a.download = current.title.replace(/[^a-z0-9]/gi,'_').toLowerCase() + '_' +
                 current.date.replace(/\//g,'-') + '.md';
    a.click();
    URL.revokeObjectURL(url);
    toast('⬇ Exported: ' + a.download);
  }

  /* ============================================================
     UTILITIES
  ============================================================ */
  function setChoice(c) {
    choice = c;
    document.querySelectorAll('.choice-btn').forEach(function(b){ b.classList.remove('active'); });
    $(c==='live'?'choice-live':'choice-manual').classList.add('active');
    $('manual-wrap').style.display = c==='manual'?'block':'none';
  }

  function hideForm(id){ $(id).classList.add('hidden'); }
  function showForm(id){ $(id).classList.remove('hidden'); }

  function esc(s) {
    return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  function toast(msg, isDanger) {
    var t = document.createElement('div');
    t.className = 'toast'+(isDanger?' toast-danger':'');
    t.textContent = msg;
    $('toasts').appendChild(t);
    setTimeout(function(){
      t.classList.add('toast-out');
      setTimeout(function(){ t.remove(); }, 260);
    }, 2800);
  }

  /* Global helpers for inline onclick */
  window._L = {
    copySnip: function(i){ navigator.clipboard.writeText(current.snippets[i].code).then(function(){ toast('📋 Copied!'); }); },
    delSnip:  function(i){ current.snippets.splice(i,1); syncTxt(); save(); renderSnippets(); },
    delErr:   function(i){ current.errors.splice(i,1);   syncTxt(); save(); renderErrors();   },
    delTip:   function(i){ current.tips.splice(i,1);     syncTxt(); save(); renderTips();     }
  };

  /* ============================================================
     EVENT WIRING
  ============================================================ */
  function wireEvents() {
    /* Theme */
    document.querySelectorAll('.theme-dot').forEach(function(d){
      d.onclick = function(){ applyTheme(d.dataset.theme); toast('Theme: '+d.title.split('(')[0].trim()); };
    });

    /* Dashboard */
    $('btn-new').onclick     = openModal;
    $('btn-cancel').onclick  = function(){ $('modal').classList.remove('open'); };
    $('modal-close').onclick = function(){ $('modal').classList.remove('open'); };
    $('btn-start').onclick   = createSession;
    $('f-title').onkeydown   = function(e){ if(e.key==='Enter') createSession(); };

    /* Search & Filter — all live */
    $('search-input').addEventListener('input', applyFilters);
    $('filter-topic').addEventListener('change', applyFilters);
    $('filter-lang').addEventListener('change', applyFilters);
    $('filter-date').addEventListener('change', applyFilters);
    $('btn-clear-search').onclick = function(){
      $('search-input').value = '';
      applyFilters();
    };

    /* Timer mode */
    $('choice-live').onclick   = function(){ setChoice('live');   };
    $('choice-manual').onclick = function(){ setChoice('manual'); };

    /* Workspace */
    $('btn-back').onclick = function(){
      if (timerOn) { if (confirm('Timer running. Stop and save?')) finishSession(); }
      else { syncTxt(); save(); showView('view-dash'); renderDashboard(); }
    };
    $('btn-finish').onclick  = finishSession;
    $('btn-pause').onclick   = pauseTimer;
    $('btn-resume').onclick  = function(){ startTimer(); $('btn-resume').style.display='none'; $('btn-pause').style.display='inline-block'; };
    $('btn-export').onclick  = exportMarkdown;

    /* Tabs */
    document.querySelectorAll('.tab-btn').forEach(function(b){
      b.onclick = function(){ switchTab(b.dataset.tab); };
    });

    /* Notes */
    $('btn-copy-notes').onclick = function(){
      navigator.clipboard.writeText(editor.getValue()).then(function(){ toast('📋 Notes copied!'); });
    };

    /* Snippets */
    $('btn-add-snippet').onclick  = function(){ showForm('snippet-form'); };
    $('btn-save-snip').onclick    = saveSnippet;
    $('btn-cancel-snip').onclick  = function(){ hideForm('snippet-form'); };

    /* Errors */
    $('btn-add-error').onclick    = function(){ showForm('error-form'); };
    $('btn-save-error').onclick   = saveError;
    $('btn-cancel-error').onclick = function(){ hideForm('error-form'); };

    /* Tips */
    $('btn-add-tip').onclick      = function(){ showForm('tip-form'); };
    $('btn-save-tip').onclick     = saveTip;
    $('btn-cancel-tip').onclick   = function(){ hideForm('tip-form'); };

    /* Todos */
    $('btn-add-todo').onclick = addTodo;
    $('todo-input').onkeydown = function(e){ if(e.key==='Enter') addTodo(); };

    /* Auto-save text areas */
    $('learned-text').addEventListener('input', function(){ if(current){current.learned=this.value; syncTxt(); save();} });
    $('next-text').addEventListener('input',    function(){ if(current){current.nextGoals=this.value; syncTxt(); save();} });

    /* Escape closes modal */
    window.addEventListener('keydown', function(e){ if(e.key==='Escape') $('modal').classList.remove('open'); });
  }

})();
