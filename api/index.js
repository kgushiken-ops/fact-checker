const HTML = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>FactCheck — 事実確認チェッカー</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
:root {
  --ink: #0f0e0c;
  --ink-2: #3a3830;
  --ink-3: #6b6860;
  --ink-4: #a8a59f;
  --paper: #faf8f4;
  --paper-2: #f2efe8;
  --paper-3: #e8e4da;
  --gold: #c9a84c;
  --gold-light: #f0e4c0;
  --ok: #2d6e3e; --ok-bg: #e8f5ec;
  --warn: #8a5a00; --warn-bg: #fdf3e3;
  --err: #a32020; --err-bg: #fdecea;
  --info: #1a4fa0; --info-bg: #e8f0fb;
  --radius: 6px; --radius-lg: 12px; --radius-xl: 20px;
  --shadow: 0 2px 12px rgba(15,14,12,0.08), 0 1px 3px rgba(15,14,12,0.06);
  --shadow-lg: 0 8px 40px rgba(15,14,12,0.12), 0 2px 8px rgba(15,14,12,0.08);
}
* { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  font-family: 'Noto Sans JP', sans-serif;
  background: var(--paper);
  color: var(--ink);
  min-height: 100vh;
  background-image:
    radial-gradient(ellipse 80% 50% at 50% -10%, rgba(201,168,76,0.08) 0%, transparent 60%);
}

/* ─── HEADER ─── */
header {
  position: sticky; top: 0; z-index: 100;
  background: rgba(250,248,244,0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--paper-3);
  padding: 0 2rem;
  display: flex; align-items: center; justify-content: space-between;
  height: 60px;
}
.logo {
  display: flex; align-items: baseline; gap: 10px;
}
.logo-main {
  font-family: 'DM Serif Display', serif;
  font-size: 22px; letter-spacing: -0.01em;
  color: var(--ink);
}
.logo-sub {
  font-size: 11px; font-weight: 500; color: var(--ink-4);
  letter-spacing: 0.12em; text-transform: uppercase;
}
.header-badge {
  display: flex; align-items: center; gap: 6px;
  font-size: 11px; color: var(--ink-3);
  border: 1px solid var(--paper-3);
  border-radius: 99px; padding: 4px 12px;
}
.header-badge::before {
  content: ''; width: 6px; height: 6px;
  border-radius: 50%; background: var(--ok);
  animation: pulse 2s infinite;
}
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

/* ─── HERO ─── */
.hero {
  text-align: center;
  padding: 4rem 2rem 3rem;
  max-width: 700px; margin: 0 auto;
}
.hero-eyebrow {
  font-size: 11px; font-weight: 500; letter-spacing: 0.16em;
  text-transform: uppercase; color: var(--gold);
  margin-bottom: 16px;
}
.hero-title {
  font-family: 'DM Serif Display', serif;
  font-size: clamp(2rem, 5vw, 3.2rem);
  line-height: 1.15; color: var(--ink);
  margin-bottom: 16px;
}
.hero-title em { font-style: italic; color: var(--gold); }
.hero-desc {
  font-size: 15px; color: var(--ink-3); line-height: 1.7;
  font-weight: 300;
}

/* ─── URL CHECKER (メイン機能) ─── */
.url-hero {
  max-width: 720px; margin: 0 auto 3rem;
  padding: 0 1.5rem;
}
.url-input-card {
  background: var(--paper);
  border: 1.5px solid var(--paper-3);
  border-radius: var(--radius-xl);
  padding: 1.5rem;
  box-shadow: var(--shadow-lg);
  transition: border-color 0.2s;
}
.url-input-card:focus-within {
  border-color: var(--gold);
}
.url-input-label {
  font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--ink-4); margin-bottom: 10px;
  display: flex; align-items: center; gap: 6px;
}
.url-input-label::before { content: '🔗'; }
.url-input-row { display: flex; gap: 10px; }
.url-input-field {
  flex: 1; border: 1px solid var(--paper-3);
  border-radius: var(--radius-lg); padding: 12px 16px;
  font-size: 14px; font-family: 'JetBrains Mono', monospace;
  color: var(--ink); background: var(--paper-2);
  outline: none; transition: all 0.2s;
}
.url-input-field:focus { border-color: var(--gold); background: #fff; box-shadow: 0 0 0 3px rgba(201,168,76,0.1); }
.url-input-field::placeholder { color: var(--ink-4); font-family: 'Noto Sans JP', sans-serif; }
.btn-fetch {
  padding: 12px 24px; border-radius: var(--radius-lg);
  border: none; background: var(--ink); color: #fff;
  font-size: 14px; font-family: 'Noto Sans JP', sans-serif;
  font-weight: 700; cursor: pointer; white-space: nowrap;
  transition: all 0.2s; letter-spacing: 0.02em;
}
.btn-fetch:hover { background: var(--ink-2); transform: translateY(-1px); box-shadow: var(--shadow); }
.btn-fetch:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
.url-options {
  display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap;
}
.url-option {
  font-size: 12px; color: var(--ink-3); background: var(--paper-2);
  border: 1px solid var(--paper-3); border-radius: 99px;
  padding: 4px 12px; cursor: pointer; transition: all 0.15s;
}
.url-option:hover { border-color: var(--gold); color: var(--gold); }

/* ─── DIVIDER ─── */
.divider {
  display: flex; align-items: center; gap: 16px;
  max-width: 720px; margin: 0 auto 2rem; padding: 0 1.5rem;
  color: var(--ink-4); font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;
}
.divider::before, .divider::after {
  content: ''; flex: 1; height: 1px; background: var(--paper-3);
}

/* ─── TABS ─── */
.tabs-wrapper { max-width: 720px; margin: 0 auto 1.5rem; padding: 0 1.5rem; }
.tabs {
  display: flex; gap: 0;
  border-bottom: 2px solid var(--paper-3);
}
.tab {
  padding: 10px 20px; border: none; background: transparent;
  cursor: pointer; font-size: 13px; font-weight: 500;
  font-family: 'Noto Sans JP', sans-serif;
  color: var(--ink-4); position: relative;
  transition: color 0.2s;
}
.tab::after {
  content: ''; position: absolute; bottom: -2px; left: 0; right: 0;
  height: 2px; background: var(--ink); transform: scaleX(0);
  transition: transform 0.2s;
}
.tab.active { color: var(--ink); }
.tab.active::after { transform: scaleX(1); }
.tab:hover:not(.active) { color: var(--ink-2); }

/* ─── PANELS ─── */
.panels-wrapper { max-width: 720px; margin: 0 auto; padding: 0 1.5rem 4rem; }
.panel { display: none; }
.panel.active { display: block; animation: fadeIn 0.2s ease; }
@keyframes fadeIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:none} }

.field-group { margin-bottom: 1rem; }
.field-label {
  font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--ink-4); margin-bottom: 6px; display: block;
}
textarea, input[type="text"] {
  width: 100%; border: 1.5px solid var(--paper-3);
  border-radius: var(--radius-lg); padding: 12px 14px;
  font-size: 14px; font-family: 'Noto Sans JP', sans-serif;
  color: var(--ink); background: #fff; outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
textarea { resize: vertical; min-height: 160px; line-height: 1.7; }
textarea:focus, input[type="text"]:focus {
  border-color: var(--gold); box-shadow: 0 0 0 3px rgba(201,168,76,0.1);
}
.btn-check {
  width: 100%; padding: 14px;
  border-radius: var(--radius-lg); border: none;
  background: linear-gradient(135deg, var(--ink) 0%, var(--ink-2) 100%);
  color: #fff; font-size: 14px; font-family: 'Noto Sans JP', sans-serif;
  font-weight: 700; cursor: pointer; transition: all 0.2s;
  letter-spacing: 0.03em; position: relative; overflow: hidden;
}
.btn-check::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, var(--gold) 0%, #e8c76a 100%);
  opacity: 0; transition: opacity 0.3s;
}
.btn-check:hover::before { opacity: 0.15; }
.btn-check:hover { transform: translateY(-1px); box-shadow: var(--shadow-lg); }
.btn-check:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
.btn-check span { position: relative; z-index: 1; }

.btn-add {
  padding: 12px 18px; border-radius: var(--radius-lg);
  border: 1.5px solid var(--paper-3); background: #fff;
  color: var(--ink); font-size: 14px; font-family: 'Noto Sans JP', sans-serif;
  cursor: pointer; flex-shrink: 0; transition: all 0.15s; font-weight: 500;
}
.btn-add:hover { border-color: var(--gold); color: var(--gold); }
.row { display: flex; gap: 8px; }
.chips { display: flex; flex-direction: column; gap: 6px; margin-top: 10px; }
.chip {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 14px; border-radius: var(--radius);
  border: 1px solid var(--paper-3); font-size: 13px; background: var(--paper-2);
  font-family: 'JetBrains Mono', monospace;
}
.chip-url { color: var(--ink-2); word-break: break-all; flex: 1; font-size: 12px; }
.chip-del { background: none; border: none; cursor: pointer; color: var(--ink-4); font-size: 18px; padding: 0 0 0 8px; line-height: 1; transition: color 0.15s; }
.chip-del:hover { color: var(--err); }
.hint { font-size: 11px; color: var(--ink-4); margin-top: 6px; }

/* ─── RESULTS ─── */
.result { margin-top: 1.5rem; }
.result-card {
  background: #fff; border: 1px solid var(--paper-3);
  border-radius: var(--radius-xl); overflow: hidden;
  box-shadow: var(--shadow);
  animation: slideUp 0.3s ease;
}
@keyframes slideUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }

.result-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--paper-2);
  display: flex; align-items: center; gap: 10px;
  background: var(--paper-2);
}
.verdict-badge {
  font-size: 11px; font-weight: 700; padding: 4px 12px;
  border-radius: 99px; letter-spacing: 0.04em;
}
.badge-ok { background: var(--ok-bg); color: var(--ok); }
.badge-warn { background: var(--warn-bg); color: var(--warn); }
.badge-err { background: var(--err-bg); color: var(--err); }
.badge-info { background: var(--info-bg); color: var(--info); }
.result-header-text { font-size: 13px; color: var(--ink-3); }

.result-body { padding: 1.25rem 1.5rem; }
.result-summary {
  font-size: 14px; line-height: 1.75; color: var(--ink-2);
  padding: 12px 16px; background: var(--paper-2);
  border-radius: var(--radius-lg); margin-bottom: 1.25rem;
  border-left: 3px solid var(--gold);
}

.issue-card {
  border: 1px solid var(--paper-3); border-radius: var(--radius-lg);
  margin-bottom: 10px; overflow: hidden;
  transition: box-shadow 0.2s;
}
.issue-card:hover { box-shadow: var(--shadow); }
.issue-card:last-child { margin-bottom: 0; }

.issue-header {
  padding: 12px 16px;
  display: flex; align-items: flex-start; gap: 10px;
  cursor: pointer; background: #fff;
  transition: background 0.15s;
}
.issue-header:hover { background: var(--paper-2); }
.issue-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
.issue-title { font-size: 14px; font-weight: 500; color: var(--ink); flex: 1; line-height: 1.4; }
.issue-toggle { color: var(--ink-4); font-size: 12px; flex-shrink: 0; margin-top: 2px; transition: transform 0.2s; }
.issue-card.open .issue-toggle { transform: rotate(180deg); }

.issue-body {
  display: none; padding: 0 16px 14px;
  border-top: 1px solid var(--paper-2);
  background: var(--paper-2);
}
.issue-card.open .issue-body { display: block; padding-top: 14px; }

.ev-label {
  font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--ink-4); margin-bottom: 5px;
}
.ev-box {
  font-size: 13px; color: var(--ink-2); line-height: 1.65;
  margin-bottom: 10px;
}
.calc-block {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px; background: var(--ink); color: #e8e4da;
  border-radius: var(--radius); padding: 10px 14px;
  line-height: 1.8; margin-bottom: 10px; white-space: pre-wrap;
}
.suggest {
  font-size: 13px; font-weight: 500; margin-bottom: 10px;
  padding: 8px 12px; border-radius: var(--radius);
}
.suggest-err { background: var(--err-bg); color: var(--err); }
.suggest-ok { background: var(--ok-bg); color: var(--ok); }

.refs-wrap { margin-top: 6px; }
.refs-label { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-4); margin-bottom: 6px; }
.ref-tag {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 12px; color: var(--info);
  background: var(--info-bg); border-radius: var(--radius);
  padding: 4px 10px; margin: 0 4px 4px 0;
  text-decoration: none; transition: background 0.15s; border: 1px solid #c8dcf8;
}
.ref-tag:hover { background: #d0e4fc; }
.ref-source { font-size: 10px; opacity: 0.7; }

/* URL result items */
.url-result-item {
  border: 1px solid var(--paper-3); border-radius: var(--radius-lg);
  padding: 14px 16px; margin-bottom: 8px; background: #fff;
  transition: box-shadow 0.2s;
}
.url-result-item:hover { box-shadow: var(--shadow); }
.url-result-top { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 8px; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; }
.dot-ok { background: var(--ok); } .dot-warn { background: var(--warn); } .dot-err { background: var(--err); }
.url-text { font-size: 13px; word-break: break-all; color: var(--ink-2); flex: 1; font-family: 'JetBrains Mono', monospace; }
.url-reason { font-size: 12px; color: var(--ink-3); margin-top: 2px; }
.url-evidence { padding-top: 10px; border-top: 1px solid var(--paper-2); }

/* ─── SPINNER ─── */
.spinner {
  display: inline-block; width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff; border-radius: 50%;
  animation: spin 0.7s linear infinite; vertical-align: middle; margin-right: 6px;
}
@keyframes spin { to{ transform: rotate(360deg); } }

/* ─── FOOTER ─── */
footer {
  text-align: center; padding: 2rem;
  font-size: 11px; color: var(--ink-4);
  border-top: 1px solid var(--paper-3);
  letter-spacing: 0.04em;
}

/* ─── FETCHED PREVIEW ─── */
.fetched-preview {
  background: var(--paper-2); border: 1px solid var(--paper-3);
  border-radius: var(--radius-lg); padding: 12px 16px; margin-bottom: 12px;
  display: flex; align-items: flex-start; gap: 10px;
}
.fetched-icon { font-size: 18px; flex-shrink: 0; }
.fetched-info { flex: 1; }
.fetched-url { font-size: 11px; font-family: 'JetBrains Mono', monospace; color: var(--ink-4); margin-bottom: 3px; word-break: break-all; }
.fetched-chars { font-size: 12px; color: var(--ink-3); }
.fetched-clear { background: none; border: none; cursor: pointer; color: var(--ink-4); font-size: 16px; padding: 0; transition: color 0.15s; }
.fetched-clear:hover { color: var(--err); }

@media (max-width: 600px) {
  .url-input-row { flex-direction: column; }
  .tabs { overflow-x: auto; }
  .tab { white-space: nowrap; }
  header { padding: 0 1rem; }
}
</style>
</head>
<body>

<header>
  <div class="logo">
    <span class="logo-main">FactCheck</span>
    <span class="logo-sub">事実確認チェッカー</span>
  </div>
  <div class="header-badge">AI稼働中</div>
</header>

<div class="hero">
  <div class="hero-eyebrow">Powered by Claude AI</div>
  <h1 class="hero-title">サイト運用の<br><em>ミスをゼロに。</em></h1>
  <p class="hero-desc">URLを貼り付けるか、テキストを入力するだけで<br>事実・数値・リンクをAIが自動チェックします。</p>
</div>

<!-- URL一発チェック -->
<div class="url-hero">
  <div class="url-input-card">
    <div class="url-input-label">URLを貼り付けてまとめてチェック</div>
    <div class="url-input-row">
      <input type="text" class="url-input-field" id="main-url-input"
        placeholder="https://www.f-marinos.com/news/goods/10006"
        onkeydown="if(event.key==='Enter')fetchAndCheck()">
      <button class="btn-fetch" id="btn-fetch" onclick="fetchAndCheck()">
        チェック開始
      </button>
    </div>
    <div class="url-options">
      <span class="url-option" onclick="setExample('https://www.f-marinos.com/news/goods/10006')">📎 マリノス 例文</span>
      <span class="url-option" onclick="document.getElementById('main-url-input').value=''">✕ クリア</span>
    </div>
  </div>
  <div id="result-url-main"></div>
</div>

<div class="divider">または手動でテキストを入力</div>

<!-- タブ切り替え -->
<div class="tabs-wrapper">
  <div class="tabs">
    <button class="tab active" onclick="switchTab('text')">テキスト事実確認</button>
    <button class="tab" onclick="switchTab('url')">URLリンク切れチェック</button>
    <button class="tab" onclick="switchTab('data')">数値・データ整合性</button>
  </div>
</div>

<div class="panels-wrapper">
  <!-- テキスト -->
  <div class="panel active" id="panel-text">
    <div class="field-group">
      <label class="field-label">チェックしたいテキスト・文章</label>
      <div id="text-fetched-preview"></div>
      <textarea id="text-input" placeholder="例：5月2日（日）水戸ホーリーホック戦では...&#10;ニュース本文をここに貼り付けてください。"></textarea>
    </div>
    <div class="field-group">
      <label class="field-label">チェックの観点（任意）</label>
      <input type="text" id="text-focus" placeholder="例：曜日の正確性、数値の矛盾、選手情報など">
    </div>
    <button class="btn-check" id="btn-text" onclick="checkText()">
      <span>AIでチェックする（根拠＋参照リンク付き）</span>
    </button>
    <div class="result" id="result-text"></div>
  </div>

  <!-- URLリンク切れ -->
  <div class="panel" id="panel-url">
    <div class="field-group">
      <label class="field-label">チェックしたいURLを追加</label>
      <div class="row">
        <input type="text" id="url-input" placeholder="https://example.com/page" onkeydown="if(event.key==='Enter')addUrl()">
        <button class="btn-add" onclick="addUrl()">追加</button>
      </div>
      <p class="hint">改行区切りで複数まとめて貼り付けも可</p>
      <div id="url-chips" class="chips"></div>
    </div>
    <button class="btn-check" id="btn-url" onclick="checkUrls()">
      <span>AIで確認する（根拠＋参照リンク付き）</span>
    </button>
    <div class="result" id="result-url"></div>
  </div>

  <!-- データ整合性 -->
  <div class="panel" id="panel-data">
    <div class="field-group">
      <label class="field-label">チェックしたいデータ・数値を含む文章</label>
      <textarea id="data-input" placeholder="例：全36種（33選手＋マリノス君・マリノスケ・マリン）&#10;封入割合：特賞2%、A賞15%、B賞21%、C賞25%、D賞37%"></textarea>
    </div>
    <div class="field-group">
      <label class="field-label">チェックの観点（任意）</label>
      <input type="text" id="data-focus" placeholder="例：合計値の整合性、割合の正確さなど">
    </div>
    <button class="btn-check" id="btn-data" onclick="checkData()">
      <span>AIで整合性チェック（根拠＋参照リンク付き）</span>
    </button>
    <div class="result" id="result-data"></div>
  </div>
</div>

<footer>FactCheck — Powered by Anthropic Claude API &nbsp;|&nbsp; 横浜F・マリノス 運用チーム</footer>

<script>
const urlList = [];

function switchTab(id) {
  ['text','url','data'].forEach((t,i) => document.querySelectorAll('.tab')[i].classList.toggle('active', t===id));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel-'+id).classList.add('active');
}

function setExample(url) {
  document.getElementById('main-url-input').value = url;
}

function addUrl() {
  const inp = document.getElementById('url-input');
  const raw = inp.value.trim(); if (!raw) return;
  raw.split(/[\\n,]/).map(u=>u.trim()).filter(Boolean).forEach(u => { if (!urlList.includes(u)) urlList.push(u); });
  inp.value = ''; renderChips();
}
function renderChips() {
  document.getElementById('url-chips').innerHTML = urlList.map((u,i) =>
    '<div class="chip"><span class="chip-url">'+esc(u)+'</span><button class="chip-del" onclick="removeUrl('+i+')">×</button></div>'
  ).join('');
}
function removeUrl(i) { urlList.splice(i,1); renderChips(); }

function setLoading(id, on, label) {
  const b = document.getElementById(id); b.disabled = on;
  b.innerHTML = on
    ? '<span class="spinner"></span><span>チェック中...</span>'
    : '<span>'+label+'</span>';
}

async function callAPI(system, user, webSearch) {
  const body = { model: 'claude-sonnet-4-20250514', max_tokens: 1500, system, messages: [{role:'user',content:user}] };
  if (webSearch) body.tools = [{type:'web_search_20250305',name:'web_search'}];
  const res = await fetch('/api', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
  if (!res.ok) throw new Error('APIエラー: ' + res.status);
  const data = await res.json();
  return data.content.map(b => b.type==='text' ? b.text : '').join('');
}

// ── URLからページ取得してチェック ──
async function fetchAndCheck() {
  const url = document.getElementById('main-url-input').value.trim();
  if (!url) return;
  const btn = document.getElementById('btn-fetch');
  btn.disabled = true;
  btn.textContent = '取得中...';
  document.getElementById('result-url-main').innerHTML = '';
  try {
    // AIにURLの内容取得とチェックを依頼
    const sys = \`あなたはサイト運用の事実確認専門家です。
与えられたURLのページ内容をweb_searchツールで取得・調査し、以下の3つを同時にチェックしてください：
1. テキスト・文章の事実確認（日付・曜日・数値・表現の正確性）
2. 数値・データの整合性（合計・割合・内訳の計算チェック）
3. 記載内容の論理的矛盾

各指摘には必ず「根拠」と「社会的信頼性の高い参照リンク」を付けてください。
JSON形式のみで回答。\`;
    const prompt = \`以下のURLのページを調査し、事実確認チェックを行ってください：
\${url}

JSON形式のみで回答：
{
  "page_title": "ページタイトル",
  "verdict": "問題なし|要注意|問題あり",
  "summary": "全体評価を2〜3文で",
  "issues": [
    {
      "type": "事実誤認|数値誤り|曜日誤り|表現問題|その他",
      "severity": "error|warn|ok",
      "point": "指摘内容",
      "evidence": "根拠（計算式・論理的理由を含む）",
      "suggestion": "修正提案",
      "refs": [{"label":"ページ名","url":"https://...","source":"運営元"}]
    }
  ]
}\`;
    const raw = await callAPI(sys, prompt, true);
    let p;
    try { p = JSON.parse(raw.replace(/\`\`\`json|\`\`\`/g,'').trim()); }
    catch { p = {page_title: url, verdict:'要注意', summary: raw, issues:[]}; }
    renderMainResult(p, url);
  } catch(e) {
    document.getElementById('result-url-main').innerHTML =
      '<div class="result-card" style="margin-top:1rem;"><div class="result-body"><p style="color:var(--err);font-size:14px;">エラー：'+esc(e.message)+'</p></div></div>';
  }
  btn.disabled = false;
  btn.textContent = 'チェック開始';
}

function renderMainResult(p, url) {
  const bc = p.verdict==='問題あり'?'badge-err':p.verdict==='要注意'?'badge-warn':'badge-ok';
  const errCount = (p.issues||[]).filter(i=>i.severity==='error').length;
  const warnCount = (p.issues||[]).filter(i=>i.severity==='warn').length;
  const issuesHtml = (p.issues||[]).map((it,i) => {
    const icon = it.severity==='error'?'🔴':it.severity==='warn'?'🟡':'✅';
    const sugClass = (it.suggestion||'').includes('不要')||(it.suggestion||'').includes('問題なし') ? 'suggest-ok' : 'suggest-err';
    return \`<div class="issue-card" id="issue-\${i}">
      <div class="issue-header" onclick="toggleIssue(\${i})">
        <span class="issue-icon">\${icon}</span>
        <span class="issue-title">\${esc(it.point||'')}</span>
        <span class="issue-toggle">▼</span>
      </div>
      <div class="issue-body">
        <div class="ev-label">根拠</div>
        <div class="calc-block">\${esc(it.evidence||'')}</div>
        <div class="ev-label">修正提案</div>
        <div class="suggest \${sugClass}">\${esc(it.suggestion||'')}</div>
        \${renderRefs(it.refs)}
      </div>
    </div>\`;
  }).join('');
  document.getElementById('result-url-main').innerHTML = \`
    <div class="result-card" style="margin-top:1.25rem;">
      <div class="result-header">
        <span class="verdict-badge \${bc}">\${esc(p.verdict||'')}</span>
        <span class="result-header-text">\${esc(p.page_title||url)} — \${(p.issues||[]).length}件確認・問題\${errCount}件・要注意\${warnCount}件</span>
      </div>
      <div class="result-body">
        <div class="result-summary">\${esc(p.summary||'')}</div>
        \${issuesHtml || '<div style="font-size:14px;color:var(--ok);text-align:center;padding:1rem;">✅ 問題は検出されませんでした。</div>'}
      </div>
    </div>\`;
}

function toggleIssue(i) {
  const card = document.getElementById('issue-'+i);
  card.classList.toggle('open');
}

function renderRefs(refs) {
  if (!refs || !refs.length) return '';
  return '<div class="refs-wrap"><div class="refs-label">参照・確認先</div><div>'+
    refs.map(r=>'<a class="ref-tag" href="'+esc(r.url)+'" target="_blank" rel="noopener">'+esc(r.label)+'<span class="ref-source"> — '+esc(r.source)+'</span></a>').join('')+
  '</div></div>';
}

// ── テキストチェック ──
async function checkText() {
  const text = document.getElementById('text-input').value.trim(); if (!text) return;
  const focus = document.getElementById('text-focus').value.trim();
  const label = 'AIでチェックする（根拠＋参照リンク付き）';
  setLoading('btn-text', true, label);
  document.getElementById('result-text').innerHTML = '';
  try {
    const sys = 'あなたはサイト運用の事実確認専門家です。テキストを厳密にチェックし、各指摘に根拠・修正提案・社会的信頼性の高い参照リンクをセットで提示してください。JSON形式のみで回答。';
    const prompt = 'チェック観点：'+(focus||'曜日・日付の正確性、数値の矛盾、選手情報、誇張表現、論理的矛盾')+\`

テキスト：
\${text}

JSON形式のみで回答：
{"verdict":"問題なし|要注意|問題あり","summary":"全体評価1〜2文","issues":[{"severity":"error|warn|ok","point":"指摘内容","evidence":"根拠","suggestion":"修正提案","refs":[{"label":"ページ名","url":"https://...","source":"運営元"}]}]}\`;
    const raw = await callAPI(sys, prompt, true);
    let p; try { p = JSON.parse(raw.replace(/\`\`\`json|\`\`\`/g,'').trim()); } catch { p={verdict:'要注意',summary:raw,issues:[]}; }
    const bc = p.verdict==='問題あり'?'badge-err':p.verdict==='要注意'?'badge-warn':'badge-ok';
    const ih = (p.issues||[]).map((it,i)=>{
      const icon = it.severity==='error'?'🔴':it.severity==='warn'?'🟡':'✅';
      const sc = (it.suggestion||'').includes('不要')||(it.suggestion||'').includes('問題なし')?'suggest-ok':'suggest-err';
      return \`<div class="issue-card" id="ti-\${i}"><div class="issue-header" onclick="toggleTi(\${i})"><span class="issue-icon">\${icon}</span><span class="issue-title">\${esc(it.point||'')}</span><span class="issue-toggle">▼</span></div><div class="issue-body"><div class="ev-label">根拠</div><div class="calc-block">\${esc(it.evidence||'')}</div><div class="ev-label">修正提案</div><div class="suggest \${sc}">\${esc(it.suggestion||'')}</div>\${renderRefs(it.refs)}</div></div>\`;
    }).join('');
    document.getElementById('result-text').innerHTML = \`<div class="result-card"><div class="result-header"><span class="verdict-badge \${bc}">\${esc(p.verdict||'')}</span><span class="result-header-text">テキスト事実確認の結果</span></div><div class="result-body"><div class="result-summary">\${esc(p.summary||'')}</div>\${ih||'<div style="font-size:14px;color:var(--ok);text-align:center;padding:1rem;">✅ 問題は検出されませんでした。</div>'}</div></div>\`;
  } catch(e) {
    document.getElementById('result-text').innerHTML = '<div class="result-card"><div class="result-body"><p style="color:var(--err);font-size:14px;">エラー：'+esc(e.message)+'</p></div></div>';
  }
  setLoading('btn-text', false, label);
}
function toggleTi(i) { document.getElementById('ti-'+i).classList.toggle('open'); }

// ── URLリンクチェック ──
async function checkUrls() {
  if (!urlList.length) return;
  const label = 'AIで確認する（根拠＋参照リンク付き）';
  setLoading('btn-url', true, label);
  document.getElementById('result-url').innerHTML = '';
  try {
    const sys = 'URLの状態を分析する専門家です。各URLの判定・根拠・推奨対応を日本語で示し、信頼性確認に役立つ公式サイトリンクも提示してください。';
    const prompt = '以下のURLを分析してください：\\n'+urlList.map((u,i)=>(i+1)+'. '+u).join('\\n')+'\\n\\nJSON形式のみで回答：\\n[{"url":"URL","status":"ok|warn|error","reason":"30字以内","evidence":"具体的分析","recommendation":"推奨対応","refs":[{"label":"サイト名","url":"https://...","source":"運営元"}]}]';
    const raw = await callAPI(sys, prompt, false);
    let items; try { items = JSON.parse(raw.replace(/\`\`\`json|\`\`\`/g,'').trim()); } catch { items=urlList.map(u=>({url:u,status:'warn',reason:'解析失敗',evidence:'',recommendation:'',refs:[]})); }
    const ec=items.filter(i=>i.status==='error').length, wc=items.filter(i=>i.status==='warn').length;
    document.getElementById('result-url').innerHTML = \`<div class="result-card"><div class="result-header"><span class="verdict-badge badge-info">チェック完了</span><span class="result-header-text">\${items.length}件確認 · 問題\${ec}件 · 要注意\${wc}件</span></div><div class="result-body">\${items.map(it=>\`<div class="url-result-item"><div class="url-result-top"><div class="status-dot dot-\${it.status==='ok'?'ok':it.status==='error'?'err':'warn'}"></div><div style="flex:1;"><div class="url-text">\${esc(it.url)}</div><div class="url-reason">\${esc(it.reason||'')}</div></div><span class="verdict-badge \${it.status==='ok'?'badge-ok':it.status==='error'?'badge-err':'badge-warn'}">\${it.status==='ok'?'正常':it.status==='error'?'問題':'要注意'}</span></div><div class="url-evidence"><div class="ev-label">根拠・分析</div><div class="ev-box">\${esc(it.evidence||'')}</div>\${it.recommendation?'<div class="ev-label">推奨対応</div><div class="ev-box">'+esc(it.recommendation)+'</div>':''}\${renderRefs(it.refs)}</div></div>\`).join('')}</div></div>\`;
  } catch(e) {
    document.getElementById('result-url').innerHTML = '<div class="result-card"><div class="result-body"><p style="color:var(--err);font-size:14px;">エラー：'+esc(e.message)+'</p></div></div>';
  }
  setLoading('btn-url', false, label);
}

// ── データ整合性チェック ──
async function checkData() {
  const text = document.getElementById('data-input').value.trim(); if (!text) return;
  const focus = document.getElementById('data-focus').value.trim();
  const label = 'AIで整合性チェック（根拠＋参照リンク付き）';
  setLoading('btn-data', true, label);
  document.getElementById('result-data').innerHTML = '';
  try {
    const sys = '数値・データの整合性チェック専門家です。問題を指摘する際は実際の計算式・正しい値を示し、裏付けとなる信頼性の高い参照先も提示してください。';
    const prompt = 'チェック観点：'+(focus||'合計値の整合性、割合の正確さ、前後比較の矛盾、単位の一貫性')+\`

データ：
\${text}

JSON形式のみで回答：
{"verdict":"整合性OK|要確認|整合性エラーあり","summary":"全体評価1〜2文","issues":[{"severity":"error|warn|ok","point":"指摘内容","calculation":"計算式","correct_value":"正しい値","current_value":"現在の値","suggestion":"修正提案","refs":[{"label":"サイト名","url":"https://...","source":"運営元"}]}]}\`;
    const raw = await callAPI(sys, prompt, true);
    let p; try { p = JSON.parse(raw.replace(/\`\`\`json|\`\`\`/g,'').trim()); } catch { p={verdict:'要確認',summary:raw,issues:[]}; }
    const bc = p.verdict==='整合性エラーあり'?'badge-err':p.verdict==='要確認'?'badge-warn':'badge-ok';
    const ih = (p.issues||[]).map((it,i)=>{
      const icon = it.severity==='error'?'🔴':it.severity==='warn'?'🟡':'✅';
      const sc = (it.suggestion||'').includes('不要')||(it.suggestion||'').includes('正確')?'suggest-ok':'suggest-err';
      return \`<div class="issue-card" id="di-\${i}"><div class="issue-header" onclick="toggleDi(\${i})"><span class="issue-icon">\${icon}</span><span class="issue-title">\${esc(it.point||'')}</span><span class="issue-toggle">▼</span></div><div class="issue-body"><div class="ev-label">計算根拠</div><div class="calc-block">\${esc(it.calculation||'')}\\n現在：\${esc(String(it.current_value||''))} → 正しい値：\${esc(String(it.correct_value||''))}</div><div class="ev-label">修正提案</div><div class="suggest \${sc}">\${esc(it.suggestion||'')}</div>\${renderRefs(it.refs)}</div></div>\`;
    }).join('');
    document.getElementById('result-data').innerHTML = \`<div class="result-card"><div class="result-header"><span class="verdict-badge \${bc}">\${esc(p.verdict||'')}</span><span class="result-header-text">数値・データ整合性チェックの結果</span></div><div class="result-body"><div class="result-summary">\${esc(p.summary||'')}</div>\${ih||'<div style="font-size:14px;color:var(--ok);text-align:center;padding:1rem;">✅ 問題は検出されませんでした。</div>'}</div></div>\`;
  } catch(e) {
    document.getElementById('result-data').innerHTML = '<div class="result-card"><div class="result-body"><p style="color:var(--err);font-size:14px;">エラー：'+esc(e.message)+'</p></div></div>';
  }
  setLoading('btn-data', false, label);
}
function toggleDi(i) { document.getElementById('di-'+i).classList.toggle('open'); }

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
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY が設定されていません' });
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-beta': 'web-search-2025-03-05'
        },
        body: JSON.stringify(req.body)
      });
      const data = await response.json();
      return res.status(response.status).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'APIリクエスト失敗', detail: error.message });
    }
  }
  res.status(405).json({ error: 'Method not allowed' });
}
