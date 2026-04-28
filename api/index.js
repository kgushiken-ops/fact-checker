async function checkUrlStatus(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, { method: 'HEAD', signal: controller.signal, redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FactChecker/1.0)' } });
    clearTimeout(timeout);
    return { status: res.status, ok: res.ok, redirected: res.redirected, finalUrl: res.url };
  } catch(e) {
    if (e.name === 'AbortError') return { status: 0, ok: false, error: 'タイムアウト' };
    try {
      const controller2 = new AbortController();
      const timeout2 = setTimeout(() => controller2.abort(), 8000);
      const res2 = await fetch(url, { method: 'GET', signal: controller2.signal, redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FactChecker/1.0)' } });
      clearTimeout(timeout2);
      return { status: res2.status, ok: res2.ok, redirected: res2.redirected, finalUrl: res2.url };
    } catch(e2) { return { status: 0, ok: false, error: e2.message }; }
  }
}

const TODAY = '2026年4月28日（火）';

const HTML = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>FactCheck — 事実確認チェッカー</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
:root {
  --ink:#0f0e0c; --ink-2:#3a3830; --ink-3:#6b6860; --ink-4:#a8a59f;
  --paper:#faf8f4; --paper-2:#f2efe8; --paper-3:#e8e4da;
  --gold:#c9a84c;
  --ok:#2d6e3e; --ok-bg:#e8f5ec; --ok-border:#b6dfc3;
  --warn:#8a5a00; --warn-bg:#fdf3e3; --warn-border:#f0cc88;
  --err:#a32020; --err-bg:#fdecea; --err-border:#f0aaaa;
  --info:#1a4fa0; --info-bg:#e8f0fb;
  --hl-del-bg:#fdecea; --hl-del-text:#a32020;
  --hl-add-bg:#e8f5ec; --hl-add-text:#2d6e3e;
  --radius:6px; --radius-lg:12px; --radius-xl:20px;
  --shadow:0 2px 12px rgba(15,14,12,.08),0 1px 3px rgba(15,14,12,.06);
  --shadow-lg:0 8px 40px rgba(15,14,12,.12),0 2px 8px rgba(15,14,12,.08);
}
*{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;}
body{font-family:'Noto Sans JP',sans-serif;background:var(--paper);color:var(--ink);min-height:100vh;background-image:radial-gradient(ellipse 80% 50% at 50% -10%,rgba(201,168,76,.08) 0%,transparent 60%);}

/* ─ HEADER ─ */
header{position:sticky;top:0;z-index:100;background:rgba(250,248,244,.95);backdrop-filter:blur(12px);border-bottom:1px solid var(--paper-3);padding:0 2rem;display:flex;align-items:center;justify-content:space-between;height:60px;}
.logo{display:flex;align-items:baseline;gap:10px;}
.logo-main{font-family:'DM Serif Display',serif;font-size:22px;color:var(--ink);}
.logo-sub{font-size:11px;font-weight:500;color:var(--ink-4);letter-spacing:.12em;text-transform:uppercase;}
.header-right{display:flex;align-items:center;gap:10px;}
.today-label{font-size:11px;color:var(--ink-4);}
.live-badge{display:flex;align-items:center;gap:5px;font-size:11px;color:var(--ink-3);border:1px solid var(--paper-3);border-radius:99px;padding:4px 12px;}
.live-badge::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--ok);animation:pulse 2s infinite;}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}

/* ─ HERO ─ */
.hero{text-align:center;padding:3.5rem 2rem 2.5rem;max-width:680px;margin:0 auto;}
.hero-eyebrow{font-size:11px;font-weight:500;letter-spacing:.16em;text-transform:uppercase;color:var(--gold);margin-bottom:14px;}
.hero-title{font-family:'DM Serif Display',serif;font-size:clamp(2rem,5vw,3rem);line-height:1.15;margin-bottom:14px;}
.hero-title em{font-style:italic;color:var(--gold);}
.hero-desc{font-size:14px;color:var(--ink-3);line-height:1.7;font-weight:300;}

/* ─ URL INPUT ─ */
.url-hero{max-width:720px;margin:0 auto 2.5rem;padding:0 1.5rem;}
.url-card{background:#fff;border:1.5px solid var(--paper-3);border-radius:var(--radius-xl);padding:1.5rem;box-shadow:var(--shadow-lg);transition:border-color .2s;}
.url-card:focus-within{border-color:var(--gold);}
.url-card-label{font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-4);margin-bottom:10px;display:flex;align-items:center;gap:6px;}
.url-row{display:flex;gap:10px;}
.url-field{flex:1;border:1px solid var(--paper-3);border-radius:var(--radius-lg);padding:12px 16px;font-size:14px;font-family:'JetBrains Mono',monospace;color:var(--ink);background:var(--paper-2);outline:none;transition:all .2s;}
.url-field:focus{border-color:var(--gold);background:#fff;box-shadow:0 0 0 3px rgba(201,168,76,.1);}
.url-field::placeholder{color:var(--ink-4);font-family:'Noto Sans JP',sans-serif;}
.btn-go{padding:12px 24px;border-radius:var(--radius-lg);border:none;background:var(--ink);color:#fff;font-size:14px;font-family:'Noto Sans JP',sans-serif;font-weight:700;cursor:pointer;white-space:nowrap;transition:all .2s;}
.btn-go:hover{background:var(--ink-2);transform:translateY(-1px);box-shadow:var(--shadow);}
.btn-go:disabled{opacity:.5;cursor:not-allowed;transform:none;}
.url-chips-row{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;}
.url-chip{font-size:12px;color:var(--ink-3);background:var(--paper-2);border:1px solid var(--paper-3);border-radius:99px;padding:4px 12px;cursor:pointer;transition:all .15s;}
.url-chip:hover{border-color:var(--gold);color:var(--gold);}

/* ─ DIVIDER ─ */
.divider{display:flex;align-items:center;gap:16px;max-width:720px;margin:0 auto 1.5rem;padding:0 1.5rem;color:var(--ink-4);font-size:11px;letter-spacing:.08em;text-transform:uppercase;}
.divider::before,.divider::after{content:'';flex:1;height:1px;background:var(--paper-3);}

/* ─ TABS ─ */
.tabs-wrap{max-width:720px;margin:0 auto 1.25rem;padding:0 1.5rem;}
.tabs{display:flex;border-bottom:2px solid var(--paper-3);}
.tab{padding:10px 18px;border:none;background:transparent;cursor:pointer;font-size:13px;font-weight:500;font-family:'Noto Sans JP',sans-serif;color:var(--ink-4);position:relative;transition:color .2s;}
.tab::after{content:'';position:absolute;bottom:-2px;left:0;right:0;height:2px;background:var(--ink);transform:scaleX(0);transition:transform .2s;}
.tab.active{color:var(--ink);}
.tab.active::after{transform:scaleX(1);}
.tab:hover:not(.active){color:var(--ink-2);}

/* ─ PANELS ─ */
.panels-wrap{max-width:720px;margin:0 auto;padding:0 1.5rem 4rem;}
.panel{display:none;}
.panel.active{display:block;animation:fadeIn .2s ease;}
@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}

.field-group{margin-bottom:1rem;}
.field-label{font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-4);margin-bottom:6px;display:block;}
textarea,input[type="text"]{width:100%;border:1.5px solid var(--paper-3);border-radius:var(--radius-lg);padding:12px 14px;font-size:14px;font-family:'Noto Sans JP',sans-serif;color:var(--ink);background:#fff;outline:none;transition:border-color .2s,box-shadow .2s;}
textarea{resize:vertical;min-height:150px;line-height:1.7;}
textarea:focus,input[type="text"]:focus{border-color:var(--gold);box-shadow:0 0 0 3px rgba(201,168,76,.1);}

.btn-check{width:100%;padding:13px;border-radius:var(--radius-lg);border:none;background:var(--ink);color:#fff;font-size:14px;font-family:'Noto Sans JP',sans-serif;font-weight:700;cursor:pointer;transition:all .2s;letter-spacing:.02em;}
.btn-check:hover{opacity:.85;transform:translateY(-1px);box-shadow:var(--shadow-lg);}
.btn-check:disabled{opacity:.45;cursor:not-allowed;transform:none;box-shadow:none;}
.btn-add{padding:12px 16px;border-radius:var(--radius-lg);border:1.5px solid var(--paper-3);background:#fff;color:var(--ink);font-size:14px;font-family:'Noto Sans JP',sans-serif;cursor:pointer;flex-shrink:0;transition:all .15s;font-weight:500;}
.btn-add:hover{border-color:var(--gold);color:var(--gold);}
.row{display:flex;gap:8px;}
.chip-list{display:flex;flex-direction:column;gap:6px;margin-top:10px;}
.chip{display:flex;align-items:center;justify-content:space-between;padding:7px 12px;border-radius:var(--radius);border:1px solid var(--paper-3);background:var(--paper-2);}
.chip-text{font-size:12px;font-family:'JetBrains Mono',monospace;color:var(--ink-2);word-break:break-all;flex:1;}
.chip-del{background:none;border:none;cursor:pointer;color:var(--ink-4);font-size:18px;padding:0 0 0 8px;transition:color .15s;line-height:1;}
.chip-del:hover{color:var(--err);}
.hint{font-size:11px;color:var(--ink-4);margin-top:5px;}

/* ════════════════════════════
   RESULT — 新デザイン
════════════════════════════ */
.result{margin-top:1.5rem;}

/* サマリーバー */
.summary-bar{display:flex;align-items:center;gap:8px;padding:14px 18px;background:#fff;border:1px solid var(--paper-3);border-radius:var(--radius-lg);margin-bottom:12px;box-shadow:var(--shadow);animation:slideUp .3s ease;}
@keyframes slideUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.summary-verdict{font-size:12px;font-weight:700;padding:4px 14px;border-radius:99px;letter-spacing:.04em;flex-shrink:0;}
.sv-ok{background:var(--ok-bg);color:var(--ok);border:1px solid var(--ok-border);}
.sv-warn{background:var(--warn-bg);color:var(--warn);border:1px solid var(--warn-border);}
.sv-err{background:var(--err-bg);color:var(--err);border:1px solid var(--err-border);}
.sv-info{background:var(--info-bg);color:var(--info);}
.summary-text{font-size:13px;color:var(--ink-2);flex:1;line-height:1.5;}
.summary-counts{display:flex;gap:6px;flex-shrink:0;}
.count-pill{font-size:11px;font-weight:700;padding:3px 10px;border-radius:99px;}
.cp-err{background:var(--err-bg);color:var(--err);}
.cp-warn{background:var(--warn-bg);color:var(--warn);}
.cp-ok{background:var(--ok-bg);color:var(--ok);}

/* 指摘リスト */
.issues-list{display:flex;flex-direction:column;gap:8px;animation:slideUp .3s ease;}
.issue-row{background:#fff;border:1px solid var(--paper-3);border-radius:var(--radius-lg);overflow:hidden;transition:box-shadow .2s;}
.issue-row:hover{box-shadow:var(--shadow);}
.issue-row.sev-error{border-left:3px solid var(--err);}
.issue-row.sev-warn{border-left:3px solid var(--warn);}
.issue-row.sev-ok{border-left:3px solid var(--ok);}

.issue-summary{display:flex;align-items:center;gap:10px;padding:12px 16px;cursor:pointer;user-select:none;}
.sev-icon{font-size:15px;flex-shrink:0;}
.issue-label{font-size:13px;font-weight:500;color:var(--ink);flex:1;line-height:1.4;}
.issue-type-tag{font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;flex-shrink:0;letter-spacing:.04em;}
.tag-error{background:var(--err-bg);color:var(--err);}
.tag-warn{background:var(--warn-bg);color:var(--warn);}
.tag-ok{background:var(--ok-bg);color:var(--ok);}
.expand-icon{font-size:11px;color:var(--ink-4);flex-shrink:0;transition:transform .2s;}
.issue-row.open .expand-icon{transform:rotate(180deg);}

.issue-detail{display:none;padding:12px 16px 14px;border-top:1px solid var(--paper-2);background:var(--paper-2);}
.issue-row.open .issue-detail{display:block;}
.detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;}
@media(max-width:560px){.detail-grid{grid-template-columns:1fr;}}
.detail-block{}
.detail-block-full{grid-column:1/-1;}
.d-label{font-size:10px;font-weight:700;color:var(--ink-4);letter-spacing:.08em;text-transform:uppercase;margin-bottom:4px;}
.d-text{font-size:13px;color:var(--ink-2);line-height:1.6;}
.d-code{font-family:'JetBrains Mono',monospace;font-size:12px;background:var(--ink);color:#e8e4da;border-radius:var(--radius);padding:8px 12px;line-height:1.8;white-space:pre-wrap;}
.d-suggest{font-size:13px;font-weight:500;padding:7px 11px;border-radius:var(--radius);}
.d-suggest-err{background:var(--err-bg);color:var(--err);}
.d-suggest-ok{background:var(--ok-bg);color:var(--ok);}

/* ── ハイライト比較 ── */
.diff-wrap{margin-top:12px;border:1px solid var(--paper-3);border-radius:var(--radius-lg);overflow:hidden;}
.diff-header{display:flex;border-bottom:1px solid var(--paper-3);}
.diff-col-head{flex:1;padding:8px 14px;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-4);background:var(--paper-2);}
.diff-col-head.del{color:var(--err);background:var(--err-bg);}
.diff-col-head.add{color:var(--ok);background:var(--ok-bg);}
.diff-body{display:flex;gap:0;}
.diff-col{flex:1;padding:12px 14px;font-size:13px;line-height:1.8;min-height:60px;}
.diff-col.del{background:#fffafa;border-right:1px solid var(--paper-3);}
.diff-col.add{background:#f6fff8;}
mark.del{background:rgba(163,32,32,.15);color:var(--err);border-radius:2px;padding:0 2px;text-decoration:line-through;}
mark.add{background:rgba(45,110,62,.15);color:var(--ok);border-radius:2px;padding:0 2px;font-weight:500;}

/* 参照リンク */
.refs-area{margin-top:10px;}
.refs-label{font-size:10px;font-weight:700;color:var(--ink-4);letter-spacing:.08em;text-transform:uppercase;margin-bottom:5px;}
.ref-link{display:inline-flex;align-items:center;gap:3px;font-size:12px;color:var(--info);background:var(--info-bg);border:1px solid #c8dcf8;border-radius:var(--radius);padding:3px 10px;margin:0 4px 4px 0;text-decoration:none;transition:background .15s;}
.ref-link:hover{background:#d0e4fc;}
.ref-src{font-size:10px;opacity:.7;}

/* URLリンクチェック */
.url-result-item{background:#fff;border:1px solid var(--paper-3);border-radius:var(--radius-lg);padding:12px 16px;margin-bottom:8px;transition:box-shadow .2s;}
.url-result-item:hover{box-shadow:var(--shadow);}
.url-result-top{display:flex;align-items:flex-start;gap:10px;}
.status-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:5px;}
.dot-ok{background:var(--ok);} .dot-warn{background:var(--warn);} .dot-err{background:var(--err);}
.url-info{flex:1;}
.url-addr{font-size:12px;font-family:'JetBrains Mono',monospace;color:var(--ink-2);word-break:break-all;}
.url-reason{font-size:12px;color:var(--ink-3);margin-top:2px;}
.http-tag{display:inline;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;padding:1px 7px;border-radius:4px;margin-left:6px;}
.ht-ok{background:var(--ok-bg);color:var(--ok);}
.ht-warn{background:var(--warn-bg);color:var(--warn);}
.ht-err{background:var(--err-bg);color:var(--err);}
.url-detail{margin-top:8px;padding-top:8px;border-top:1px solid var(--paper-2);font-size:13px;color:var(--ink-2);line-height:1.6;}

/* spinner */
.spinner{display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;vertical-align:middle;margin-right:6px;}
@keyframes spin{to{transform:rotate(360deg);}}

/* コピーボタン */
.copy-btn{background:none;border:1px solid var(--paper-3);border-radius:var(--radius);padding:3px 10px;font-size:11px;color:var(--ink-3);cursor:pointer;transition:all .15s;margin-left:auto;flex-shrink:0;}
.copy-btn:hover{border-color:var(--gold);color:var(--gold);}

footer{text-align:center;padding:2rem;font-size:11px;color:var(--ink-4);border-top:1px solid var(--paper-3);}
@media(max-width:600px){
  .url-row{flex-direction:column;}
  .tabs{overflow-x:auto;}
  .tab{white-space:nowrap;}
  header{padding:0 1rem;}
  .today-label{display:none;}
  .summary-counts{display:none;}
}
</style>
</head>
<body>

<header>
  <div class="logo">
    <span class="logo-main">FactCheck</span>
    <span class="logo-sub">事実確認チェッカー</span>
  </div>
  <div class="header-right">
    <span class="today-label">本日 ${TODAY}</span>
    <div class="live-badge">AI 稼働中</div>
  </div>
</header>

<div class="hero">
  <div class="hero-eyebrow">Powered by Claude AI</div>
  <h1 class="hero-title">サイト運用の<br><em>ミスをゼロに。</em></h1>
  <p class="hero-desc">URLを貼り付けるか、テキストを入力するだけで<br>事実・数値・リンクをAIが自動チェックします。</p>
</div>

<div class="url-hero">
  <div class="url-card">
    <div class="url-card-label">🔗 URLを貼り付けてまとめてチェック</div>
    <div class="url-row">
      <input class="url-field" id="main-url" type="text" placeholder="https://www.f-marinos.com/news/goods/10006" onkeydown="if(event.key==='Enter')fetchAndCheck()">
      <button class="btn-go" id="btn-fetch" onclick="fetchAndCheck()">チェック開始</button>
    </div>
    <div class="url-chips-row">
      <span class="url-chip" onclick="setEx('https://www.f-marinos.com/news/goods/10006')">📎 マリノス例文</span>
      <span class="url-chip" onclick="document.getElementById('main-url').value=''">✕ クリア</span>
    </div>
  </div>
  <div id="result-main"></div>
</div>

<div class="divider">または手動でテキストを入力</div>

<div class="tabs-wrap">
  <div class="tabs">
    <button class="tab active" onclick="switchTab('text')">テキスト事実確認</button>
    <button class="tab" onclick="switchTab('url')">URLリンク切れチェック</button>
    <button class="tab" onclick="switchTab('data')">数値・データ整合性</button>
  </div>
</div>

<div class="panels-wrap">
  <div class="panel active" id="panel-text">
    <div class="field-group">
      <label class="field-label">チェックしたいテキスト・文章</label>
      <textarea id="text-input" placeholder="例：5月2日（日）水戸ホーリーホック戦では..."></textarea>
    </div>
    <div class="field-group">
      <label class="field-label">チェックの観点（任意）</label>
      <input type="text" id="text-focus" placeholder="例：曜日の正確性、数値の矛盾、選手情報など">
    </div>
    <button class="btn-check" id="btn-text" onclick="checkText()">AIでチェックする（根拠＋参照リンク付き）</button>
    <div class="result" id="result-text"></div>
  </div>

  <div class="panel" id="panel-url">
    <div class="field-group">
      <label class="field-label">チェックしたいURLを追加（サーバーから実アクセスして確認）</label>
      <div class="row">
        <input type="text" id="url-input" placeholder="https://example.com/page" onkeydown="if(event.key==='Enter')addUrl()">
        <button class="btn-add" onclick="addUrl()">追加</button>
      </div>
      <p class="hint">改行区切りで複数まとめて貼り付けも可</p>
      <div id="url-chips" class="chip-list"></div>
    </div>
    <button class="btn-check" id="btn-url" onclick="checkUrls()">実アクセスで確認する</button>
    <div class="result" id="result-url"></div>
  </div>

  <div class="panel" id="panel-data">
    <div class="field-group">
      <label class="field-label">チェックしたいデータ・数値を含む文章</label>
      <textarea id="data-input" placeholder="例：全36種（33選手＋マリノス君・マリノスケ・マリン）&#10;封入割合：特賞2%、A賞15%、B賞21%、C賞25%、D賞37%"></textarea>
    </div>
    <div class="field-group">
      <label class="field-label">チェックの観点（任意）</label>
      <input type="text" id="data-focus" placeholder="例：合計値の整合性、割合の正確さなど">
    </div>
    <button class="btn-check" id="btn-data" onclick="checkData()">AIで整合性チェック（根拠＋参照リンク付き）</button>
    <div class="result" id="result-data"></div>
  </div>
</div>

<footer>FactCheck — Powered by Anthropic Claude API | 横浜F・マリノス 運用チーム | 本日：${TODAY}</footer>

<script>
const TODAY_STR = '${TODAY}';
const urlList = [];

function switchTab(id) {
  ['text','url','data'].forEach((t,i) => document.querySelectorAll('.tab')[i].classList.toggle('active', t===id));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel-'+id).classList.add('active');
}
function setEx(u) { document.getElementById('main-url').value = u; }
function addUrl() {
  const inp = document.getElementById('url-input'), raw = inp.value.trim(); if (!raw) return;
  raw.split(/[\\n,]/).map(u=>u.trim()).filter(Boolean).forEach(u => { if (!urlList.includes(u)) urlList.push(u); });
  inp.value = ''; renderChips();
}
function renderChips() {
  document.getElementById('url-chips').innerHTML = urlList.map((u,i) =>
    \`<div class="chip"><span class="chip-text">\${esc(u)}</span><button class="chip-del" onclick="removeUrl(\${i})">×</button></div>\`
  ).join('');
}
function removeUrl(i) { urlList.splice(i,1); renderChips(); }
function setLoading(id, on, label) {
  const b = document.getElementById(id); b.disabled = on;
  b.innerHTML = on ? '<span class="spinner"></span>チェック中...' : label;
}
async function callAPI(system, user, webSearch) {
  const body = { model:'claude-sonnet-4-20250514', max_tokens:1500, system, messages:[{role:'user',content:user}] };
  if (webSearch) body.tools = [{type:'web_search_20250305',name:'web_search'}];
  const res = await fetch('/api', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
  if (!res.ok) throw new Error('APIエラー: ' + res.status);
  const data = await res.json();
  return data.content.map(b => b.type==='text' ? b.text : '').join('');
}

// ── サマリーバー生成 ──
function makeSummaryBar(verdict, summary, issues) {
  const errs = (issues||[]).filter(i=>i.severity==='error').length;
  const warns = (issues||[]).filter(i=>i.severity==='warn').length;
  const oks = (issues||[]).filter(i=>i.severity==='ok').length;
  const vcls = verdict==='問題あり'||verdict==='整合性エラーあり' ? 'sv-err' : verdict==='要注意'||verdict==='要確認' ? 'sv-warn' : 'sv-ok';
  return \`<div class="summary-bar">
    <span class="summary-verdict \${vcls}">\${esc(verdict)}</span>
    <span class="summary-text">\${esc(summary||'')}</span>
    <div class="summary-counts">
      \${errs ? \`<span class="count-pill cp-err">🔴 \${errs}件</span>\` : ''}
      \${warns ? \`<span class="count-pill cp-warn">🟡 \${warns}件</span>\` : ''}
      \${oks ? \`<span class="count-pill cp-ok">✅ \${oks}件</span>\` : ''}
    </div>
  </div>\`;
}

// ── 指摘リスト生成（ハイライト比較付き）──
function makeIssuesList(issues, prefix) {
  if (!issues||!issues.length) return \`<div style="text-align:center;padding:1.5rem;font-size:14px;color:var(--ok);">✅ 問題は検出されませんでした。</div>\`;
  return \`<div class="issues-list">\${issues.map((it,i) => {
    const sev = it.severity||'warn';
    const icon = sev==='error'?'🔴':sev==='ok'?'✅':'🟡';
    const tagCls = sev==='error'?'tag-error':sev==='ok'?'tag-ok':'tag-warn';
    const tagText = sev==='error'?'要修正':sev==='ok'?'問題なし':'要確認';
    const rowCls = sev==='error'?'sev-error':sev==='ok'?'sev-ok':'sev-warn';
    const sugCls = (it.suggestion||'').includes('不要')||(it.suggestion||'').includes('問題なし')?'d-suggest-ok':'d-suggest-err';
    const evidKey = it.evidence||it.calculation||'';
    const diffHtml = makeDiff(it);
    return \`<div class="issue-row \${rowCls}" id="\${prefix}-\${i}">
      <div class="issue-summary" onclick="toggleRow('\${prefix}-\${i}')">
        <span class="sev-icon">\${icon}</span>
        <span class="issue-label">\${esc(it.point||'')}</span>
        <span class="issue-type-tag \${tagCls}">\${tagText}</span>
        <span class="expand-icon">▼</span>
      </div>
      <div class="issue-detail">
        <div class="detail-grid">
          <div class="detail-block detail-block-full">
            <div class="d-label">根拠・計算</div>
            <div class="d-code">\${esc(evidKey)}\${it.correct_value?'\\n現在：'+esc(String(it.current_value||''))+' → 正しい値：'+esc(String(it.correct_value||'')):''}
            </div>
          </div>
          <div class="detail-block detail-block-full">
            <div class="d-label">修正提案</div>
            <div class="d-suggest \${sugCls}">\${esc(it.suggestion||'')}</div>
          </div>
        </div>
        \${diffHtml}
        \${renderRefs(it.refs)}
      </div>
    </div>\`;
  }).join('')}</div>\`;
}

// ── ハイライト比較生成 ──
function makeDiff(it) {
  if (!it.original_text && !it.fixed_text) return '';
  return \`<div class="diff-wrap">
    <div class="diff-header">
      <div class="diff-col-head del">修正前</div>
      <div class="diff-col-head add">修正後</div>
    </div>
    <div class="diff-body">
      <div class="diff-col del">\${highlightDel(it.original_text||'', it.error_part||'')}</div>
      <div class="diff-col add">\${highlightAdd(it.fixed_text||'', it.fixed_part||'')}</div>
    </div>
  </div>\`;
}
function highlightDel(text, part) {
  if (!part) return esc(text);
  return esc(text).replace(esc(part), \`<mark class="del">\${esc(part)}</mark>\`);
}
function highlightAdd(text, part) {
  if (!part) return esc(text);
  return esc(text).replace(esc(part), \`<mark class="add">\${esc(part)}</mark>\`);
}

function toggleRow(id) { document.getElementById(id).classList.toggle('open'); }

function renderRefs(refs) {
  if (!refs||!refs.length) return '';
  return \`<div class="refs-area"><div class="refs-label">参照・確認先</div><div>\${refs.map(r=>\`<a class="ref-link" href="\${esc(r.url)}" target="_blank" rel="noopener">\${esc(r.label)}<span class="ref-src"> — \${esc(r.source)}</span></a>\`).join('')}</div></div>\`;
}

// ── URLまとめチェック ──
async function fetchAndCheck() {
  const url = document.getElementById('main-url').value.trim(); if (!url) return;
  const btn = document.getElementById('btn-fetch');
  btn.disabled = true; btn.textContent = '取得中...';
  document.getElementById('result-main').innerHTML = '';
  try {
    const sys = \`あなたはサイト運用の事実確認専門家です。
重要：今日の日付は\${TODAY_STR}です。曜日・年度の判定は必ずこの日付を基準にしてください。
指摘ごとに original_text（修正前の該当箇所の一文）・error_part（問題部分のみ）・fixed_text（修正後の一文）・fixed_part（修正後の部分）を必ず付けてください。JSON形式のみで回答。\`;
    const prompt = \`以下のURLを調査してください：\${url}
本日の日付：\${TODAY_STR}

JSON形式のみで回答：
{"page_title":"タイトル","verdict":"問題なし|要注意|問題あり","summary":"全体評価2〜3文","issues":[{"type":"種別","severity":"error|warn|ok","point":"指摘内容","evidence":"根拠（計算式含む）","suggestion":"修正提案","original_text":"修正前の該当一文","error_part":"問題のある部分のみ","fixed_text":"修正後の一文","fixed_part":"修正後の部分のみ","refs":[{"label":"ページ名","url":"https://...","source":"運営元"}]}]}\`;
    const raw = await callAPI(sys, prompt, true);
    let p; try { p = JSON.parse(raw.replace(/\`\`\`json|\`\`\`/g,'').trim()); } catch { p={page_title:url,verdict:'要注意',summary:raw,issues:[]}; }
    const bar = makeSummaryBar(p.verdict, p.summary, p.issues);
    const list = makeIssuesList(p.issues, 'mi');
    document.getElementById('result-main').innerHTML = \`<div style="margin-top:1.25rem;">\${bar}\${list}</div>\`;
  } catch(e) {
    document.getElementById('result-main').innerHTML = \`<div style="margin-top:1rem;padding:14px 16px;background:#fff;border:1px solid var(--paper-3);border-radius:var(--radius-lg);color:var(--err);font-size:14px;">エラー：\${esc(e.message)}</div>\`;
  }
  btn.disabled = false; btn.textContent = 'チェック開始';
}

// ── テキストチェック ──
async function checkText() {
  const text = document.getElementById('text-input').value.trim(); if (!text) return;
  const focus = document.getElementById('text-focus').value.trim();
  setLoading('btn-text', true, 'AIでチェックする（根拠＋参照リンク付き）');
  document.getElementById('result-text').innerHTML = '';
  try {
    const sys = \`あなたはサイト運用の事実確認専門家です。
重要：今日の日付は\${TODAY_STR}です。曜日・年度の判定は必ずこの日付を基準にしてください。
指摘ごとに original_text・error_part・fixed_text・fixed_part を必ず付けてください。JSON形式のみで回答。\`;
    const prompt = \`チェック観点：\${focus||'曜日・日付の正確性、数値の矛盾、選手情報、誇張表現'}\\n本日の日付：\${TODAY_STR}\\n\\nテキスト：\\n\${text}\\n\\nJSON形式のみで回答：\\n{"verdict":"問題なし|要注意|問題あり","summary":"全体評価1〜2文","issues":[{"severity":"error|warn|ok","point":"指摘内容","evidence":"根拠","suggestion":"修正提案","original_text":"修正前の該当一文","error_part":"問題部分のみ","fixed_text":"修正後の一文","fixed_part":"修正後部分のみ","refs":[{"label":"ページ名","url":"https://...","source":"運営元"}]}]}\`;
    const raw = await callAPI(sys, prompt, true);
    let p; try { p = JSON.parse(raw.replace(/\`\`\`json|\`\`\`/g,'').trim()); } catch { p={verdict:'要注意',summary:raw,issues:[]}; }
    document.getElementById('result-text').innerHTML = makeSummaryBar(p.verdict, p.summary, p.issues) + makeIssuesList(p.issues, 'ti');
  } catch(e) {
    document.getElementById('result-text').innerHTML = \`<div style="padding:14px;background:#fff;border:1px solid var(--paper-3);border-radius:var(--radius-lg);color:var(--err);font-size:14px;">エラー：\${esc(e.message)}</div>\`;
  }
  setLoading('btn-text', false, 'AIでチェックする（根拠＋参照リンク付き）');
}

// ── URLリンク切れチェック ──
async function checkUrls() {
  if (!urlList.length) return;
  setLoading('btn-url', true, '実アクセスで確認する');
  document.getElementById('result-url').innerHTML = '';
  try {
    const res = await fetch('/api/urlcheck', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({urls:urlList}) });
    const results = await res.json();
    const errs = results.filter(r=>r.status==='error').length;
    const warns = results.filter(r=>r.status==='warn').length;
    const vcls = errs>0?'sv-err':warns>0?'sv-warn':'sv-ok';
    const verdict = errs>0?'問題あり':warns>0?'要注意':'問題なし';
    const bar = \`<div class="summary-bar"><span class="summary-verdict \${vcls}">\${verdict}</span><span class="summary-text">\${results.length}件を実アクセスで確認しました</span><div class="summary-counts">\${errs?\`<span class="count-pill cp-err">エラー \${errs}件</span>\`:''}\${warns?\`<span class="count-pill cp-warn">要注意 \${warns}件</span>\`:''}</div></div>\`;
    const itemsHtml = results.map(it => {
      const dc = it.status==='ok'?'dot-ok':it.status==='error'?'dot-err':'dot-warn';
      const hc = (it.httpStatus>=200&&it.httpStatus<300)?'ht-ok':(it.httpStatus>=300&&it.httpStatus<400)?'ht-warn':'ht-err';
      return \`<div class="url-result-item">
        <div class="url-result-top">
          <div class="status-dot \${dc}"></div>
          <div class="url-info">
            <div class="url-addr">\${esc(it.url)}\${it.httpStatus?\`<span class="http-tag \${hc}">HTTP \${it.httpStatus}</span>\`:''}</div>
            <div class="url-reason">\${esc(it.reason||'')}</div>
          </div>
        </div>
        \${it.detail?\`<div class="url-detail">\${esc(it.detail)}</div>\`:''}
        \${it.redirected?\`<div class="url-detail" style="color:var(--warn);">⚠️ リダイレクト先：\${esc(it.finalUrl||'')}</div>\`:''}
      </div>\`;
    }).join('');
    document.getElementById('result-url').innerHTML = bar + \`<div class="issues-list">\${itemsHtml}</div>\`;
  } catch(e) {
    document.getElementById('result-url').innerHTML = \`<div style="padding:14px;background:#fff;border:1px solid var(--paper-3);border-radius:var(--radius-lg);color:var(--err);font-size:14px;">エラー：\${esc(e.message)}</div>\`;
  }
  setLoading('btn-url', false, '実アクセスで確認する');
}

// ── データ整合性チェック ──
async function checkData() {
  const text = document.getElementById('data-input').value.trim(); if (!text) return;
  const focus = document.getElementById('data-focus').value.trim();
  setLoading('btn-data', true, 'AIで整合性チェック（根拠＋参照リンク付き）');
  document.getElementById('result-data').innerHTML = '';
  try {
    const sys = \`数値・データの整合性チェック専門家です。今日の日付は\${TODAY_STR}です。計算式・正しい値・参照先を必ず示してください。指摘ごとに original_text・error_part・fixed_text・fixed_part を付けてください。JSON形式のみで回答。\`;
    const prompt = \`チェック観点：\${focus||'合計値の整合性、割合の正確さ、前後比較の矛盾、単位の一貫性'}\\n本日：\${TODAY_STR}\\n\\nデータ：\\n\${text}\\n\\nJSON形式のみで回答：\\n{"verdict":"整合性OK|要確認|整合性エラーあり","summary":"全体評価1〜2文","issues":[{"severity":"error|warn|ok","point":"指摘内容","calculation":"計算式","correct_value":"正しい値","current_value":"現在の値","suggestion":"修正提案","original_text":"修正前の該当一文","error_part":"問題部分","fixed_text":"修正後の一文","fixed_part":"修正後部分","refs":[{"label":"サイト名","url":"https://...","source":"運営元"}]}]}\`;
    const raw = await callAPI(sys, prompt, true);
    let p; try { p = JSON.parse(raw.replace(/\`\`\`json|\`\`\`/g,'').trim()); } catch { p={verdict:'要確認',summary:raw,issues:[]}; }
    // calculationをevidenceにマッピング
    (p.issues||[]).forEach(it => { if (!it.evidence && it.calculation) it.evidence = it.calculation; });
    document.getElementById('result-data').innerHTML = makeSummaryBar(p.verdict, p.summary, p.issues) + makeIssuesList(p.issues, 'di');
  } catch(e) {
    document.getElementById('result-data').innerHTML = \`<div style="padding:14px;background:#fff;border:1px solid var(--paper-3);border-radius:var(--radius-lg);color:var(--err);font-size:14px;">エラー：\${esc(e.message)}</div>\`;
  }
  setLoading('btn-data', false, 'AIで整合性チェック（根拠＋参照リンク付き）');
}

function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
</script>
</body>
</html>`;

export default async function handler(req, res) {
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(HTML);
  }
  if (req.method === 'POST') {
    const url = new URL(req.url, `https://${req.headers.host}`);

    // URLリンク切れ実アクセスチェック
    if (url.pathname === '/api/urlcheck') {
      const { urls } = req.body;
      if (!Array.isArray(urls)) return res.status(400).json({ error: 'urls required' });
      const results = await Promise.all(urls.map(async (u) => {
        const check = await checkUrlStatus(u);
        let status='ok', reason='', detail='';
        if (check.error) {
          status='error'; reason='アクセス不可'; detail=`接続エラー：${check.error}`;
        } else if (check.status===200) {
          status='ok'; reason='正常'; detail=`HTTP ${check.status} — ページが正常に応答しています。`;
        } else if (check.status>=300&&check.status<400) {
          status='warn'; reason=`リダイレクト (${check.status})`; detail=`HTTP ${check.status} — 別のURLにリダイレクトされています。`;
        } else if (check.status===401||check.status===403) {
          status='warn'; reason=`認証が必要 (${check.status})`; detail=`HTTP ${check.status} — アクセスに認証が必要です（ステージング環境等）。`;
        } else if (check.status===404) {
          status='error'; reason='ページが見つからない (404)'; detail=`HTTP ${check.status} — ページが存在しません。URLを確認してください。`;
        } else if (check.status>=500) {
          status='error'; reason=`サーバーエラー (${check.status})`; detail=`HTTP ${check.status} — サーバー側でエラーが発生しています。`;
        } else {
          status='warn'; reason=`HTTP ${check.status}`; detail=`通常とは異なるレスポンスコードです。`;
        }
        return { url: u, status, reason, detail, httpStatus: check.status||null, redirected: check.redirected||false, finalUrl: check.finalUrl||null };
      }));
      return res.status(200).json(results);
    }

    // Anthropic API転送
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY が未設定です' });
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'x-api-key':apiKey, 'anthropic-version':'2023-06-01', 'anthropic-beta':'web-search-2025-03-05' },
        body: JSON.stringify(req.body)
      });
      const data = await response.json();
      return res.status(response.status).json(data);
    } catch (error) {
      return res.status(500).json({ error:'APIリクエスト失敗', detail:error.message });
    }
  }
  res.status(405).json({ error:'Method not allowed' });
}
