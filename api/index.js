// ════════════════════════════════════════════════
//  FactCheck — 事実確認チェッカー
//  Vercel Serverless Function (単一ファイル構成)
// ════════════════════════════════════════════════

const WEEKDAYS = ['日','月','火','水','木','金','土'];

// サーバー側で正確な今日の日付を生成
function getToday() {
  const d = new Date();
  return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日（${WEEKDAYS[d.getDay()]}）`;
}

// テキスト内の日付を抽出し、正しい曜日をサーバーで計算
function calcWeekdays(text) {
  const year = new Date().getFullYear();
  const results = [];
  const seen = new Set();
  const re = /(\d{1,2})月(\d{1,2})日（([日月火水木金土])）/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const key = `${m[1]}/${m[2]}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const correct = WEEKDAYS[new Date(year, m[1]-1, m[2]).getDay()];
    const wrong = m[3] !== correct;
    results.push({ expr: m[0], month: m[1], day: m[2], written: m[3], correct, wrong });
  }
  return results;
}

// AIに渡す曜日の事前計算テキストを生成
function buildDateContext(text) {
  const checks = calcWeekdays(text);
  if (!checks.length) return '';
  const year = new Date().getFullYear();
  let ctx = `\n\n【曜日の事前計算（Dateオブジェクトによる正確な値）】\n`;
  ctx += `以下はテキスト内の日付について、サーバーが計算した正しい曜日です。曜日の判定はこの値だけを使い、AIが独自に計算することを禁止します：\n`;
  for (const c of checks) {
    ctx += `・${year}年${c.month}月${c.day}日 → 正しい曜日：（${c.correct}）`;
    if (c.wrong) ctx += ` ⚠️ テキストに「（${c.written}）」とあるが誤り`;
    ctx += `\n`;
  }
  return ctx;
}

// URLの実アクセスチェック
async function pingUrl(url) {
  const opts = { redirect:'follow', headers:{'User-Agent':'Mozilla/5.0 (compatible; FactChecker/1.0)'} };
  for (const method of ['HEAD','GET']) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 8000);
      const r = await fetch(url, { ...opts, method, signal: ctrl.signal });
      clearTimeout(timer);
      return { status: r.status, redirected: r.redirected, finalUrl: r.url };
    } catch(e) {
      if (e.name !== 'AbortError' && method === 'HEAD') continue;
      return { status: 0, error: e.name === 'AbortError' ? 'タイムアウト' : e.message };
    }
  }
  return { status: 0, error: '接続失敗' };
}

// ── HTML ──────────────────────────────────────────────────────
function buildHtml(today) {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>FactCheck — 事実確認チェッカー</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
:root{
  --ink:#0f0e0c;--ink2:#3a3830;--ink3:#6b6860;--ink4:#a8a59f;
  --paper:#faf8f4;--paper2:#f2efe8;--paper3:#e8e4da;
  --gold:#c9a84c;
  --ok:#2d6e3e;--ok-bg:#e8f5ec;--ok-bd:#b6dfc3;
  --warn:#8a5a00;--warn-bg:#fdf3e3;--warn-bd:#f0cc88;
  --err:#a32020;--err-bg:#fdecea;--err-bd:#f0aaaa;
  --info:#1a4fa0;--info-bg:#e8f0fb;
  --r:8px;--rlg:14px;--rxl:20px;
  --sh:0 2px 12px rgba(15,14,12,.08),0 1px 3px rgba(15,14,12,.06);
  --shlg:0 8px 40px rgba(15,14,12,.12),0 2px 8px rgba(15,14,12,.08);
}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Noto Sans JP',sans-serif;background:var(--paper);color:var(--ink);min-height:100vh;background-image:radial-gradient(ellipse 80% 50% at 50% -10%,rgba(201,168,76,.08) 0%,transparent 60%);}

/* HEADER */
header{position:sticky;top:0;z-index:100;background:rgba(250,248,244,.95);backdrop-filter:blur(12px);border-bottom:1px solid var(--paper3);padding:0 1.5rem;display:flex;align-items:center;justify-content:space-between;height:58px;}
.logo-main{font-family:'DM Serif Display',serif;font-size:20px;}
.logo-sub{font-size:10px;font-weight:500;color:var(--ink4);letter-spacing:.12em;text-transform:uppercase;margin-left:8px;}
.hdr-right{display:flex;align-items:center;gap:10px;}
.today-tag{font-size:11px;color:var(--ink4);}
.live{display:flex;align-items:center;gap:5px;font-size:11px;color:var(--ink3);border:1px solid var(--paper3);border-radius:99px;padding:4px 12px;}
.live::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--ok);animation:blink 2s infinite;}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}

/* HERO */
.hero{text-align:center;padding:3rem 1.5rem 2rem;max-width:640px;margin:0 auto;}
.eyebrow{font-size:10px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--gold);margin-bottom:12px;}
.hero h1{font-family:'DM Serif Display',serif;font-size:clamp(1.8rem,5vw,2.8rem);line-height:1.2;margin-bottom:12px;}
.hero h1 em{font-style:italic;color:var(--gold);}
.hero p{font-size:14px;color:var(--ink3);line-height:1.7;font-weight:300;}

/* URL INPUT CARD */
.url-wrap{max-width:700px;margin:0 auto 2.5rem;padding:0 1.5rem;}
.url-card{background:#fff;border:1.5px solid var(--paper3);border-radius:var(--rxl);padding:1.25rem;box-shadow:var(--shlg);transition:border-color .2s;}
.url-card:focus-within{border-color:var(--gold);}
.url-lbl{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--ink4);margin-bottom:8px;}
.url-row{display:flex;gap:8px;}
.url-inp{flex:1;border:1px solid var(--paper3);border-radius:var(--rlg);padding:11px 14px;font-size:14px;font-family:'JetBrains Mono',monospace;color:var(--ink);background:var(--paper2);outline:none;transition:all .2s;}
.url-inp:focus{border-color:var(--gold);background:#fff;box-shadow:0 0 0 3px rgba(201,168,76,.1);}
.url-inp::placeholder{color:var(--ink4);font-family:'Noto Sans JP',sans-serif;}
.btn-go{padding:11px 22px;border-radius:var(--rlg);border:none;background:var(--ink);color:#fff;font-size:14px;font-family:'Noto Sans JP',sans-serif;font-weight:700;cursor:pointer;white-space:nowrap;transition:all .2s;}
.btn-go:hover{opacity:.85;transform:translateY(-1px);box-shadow:var(--sh);}
.btn-go:disabled{opacity:.45;cursor:not-allowed;transform:none;}

/* DIVIDER */
.div{display:flex;align-items:center;gap:14px;max-width:700px;margin:0 auto 1.5rem;padding:0 1.5rem;color:var(--ink4);font-size:10px;letter-spacing:.08em;text-transform:uppercase;}
.div::before,.div::after{content:'';flex:1;height:1px;background:var(--paper3);}

/* TABS */
.tabs-wrap{max-width:700px;margin:0 auto 1.25rem;padding:0 1.5rem;}
.tabs{display:flex;border-bottom:2px solid var(--paper3);}
.tab{padding:10px 16px;border:none;background:transparent;cursor:pointer;font-size:13px;font-weight:500;font-family:'Noto Sans JP',sans-serif;color:var(--ink4);position:relative;transition:color .2s;}
.tab::after{content:'';position:absolute;bottom:-2px;left:0;right:0;height:2px;background:var(--ink);transform:scaleX(0);transition:transform .2s;}
.tab.active{color:var(--ink);}
.tab.active::after{transform:scaleX(1);}
.tab:hover:not(.active){color:var(--ink2);}

/* PANELS */
.panels-wrap{max-width:700px;margin:0 auto;padding:0 1.5rem 4rem;}
.panel{display:none;}
.panel.active{display:block;animation:fadeIn .2s;}
@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}

.field{margin-bottom:.875rem;}
.flbl{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--ink4);margin-bottom:5px;display:block;}
textarea,input[type=text]{width:100%;border:1.5px solid var(--paper3);border-radius:var(--rlg);padding:11px 13px;font-size:14px;font-family:'Noto Sans JP',sans-serif;color:var(--ink);background:#fff;outline:none;transition:border-color .2s,box-shadow .2s;}
textarea{resize:vertical;min-height:140px;line-height:1.7;}
textarea:focus,input[type=text]:focus{border-color:var(--gold);box-shadow:0 0 0 3px rgba(201,168,76,.1);}
.btn-check{width:100%;padding:13px;border-radius:var(--rlg);border:none;background:var(--ink);color:#fff;font-size:14px;font-family:'Noto Sans JP',sans-serif;font-weight:700;cursor:pointer;transition:all .2s;}
.btn-check:hover{opacity:.85;transform:translateY(-1px);box-shadow:var(--shlg);}
.btn-check:disabled{opacity:.45;cursor:not-allowed;transform:none;box-shadow:none;}
.btn-add{padding:11px 16px;border-radius:var(--rlg);border:1.5px solid var(--paper3);background:#fff;color:var(--ink);font-size:14px;font-family:'Noto Sans JP',sans-serif;cursor:pointer;flex-shrink:0;font-weight:500;transition:all .15s;}
.btn-add:hover{border-color:var(--gold);color:var(--gold);}
.row{display:flex;gap:8px;}
.chips{display:flex;flex-direction:column;gap:5px;margin-top:8px;}
.chip{display:flex;align-items:center;padding:7px 12px;border-radius:var(--r);border:1px solid var(--paper3);background:var(--paper2);}
.chip-t{font-size:12px;font-family:'JetBrains Mono',monospace;color:var(--ink2);word-break:break-all;flex:1;}
.chip-x{background:none;border:none;cursor:pointer;color:var(--ink4);font-size:17px;padding:0 0 0 8px;line-height:1;}
.chip-x:hover{color:var(--err);}
.hint{font-size:11px;color:var(--ink4);margin-top:4px;}

/* RESULTS */
.result{margin-top:1.25rem;}

/* サマリーバー */
.sum-bar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:13px 16px;background:#fff;border:1px solid var(--paper3);border-radius:var(--rlg);margin-bottom:10px;box-shadow:var(--sh);animation:slideUp .3s;}
@keyframes slideUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.verdict{font-size:11px;font-weight:700;padding:4px 12px;border-radius:99px;flex-shrink:0;}
.v-ok{background:var(--ok-bg);color:var(--ok);border:1px solid var(--ok-bd);}
.v-warn{background:var(--warn-bg);color:var(--warn);border:1px solid var(--warn-bd);}
.v-err{background:var(--err-bg);color:var(--err);border:1px solid var(--err-bd);}
.v-info{background:var(--info-bg);color:var(--info);}
.sum-txt{font-size:13px;color:var(--ink2);flex:1;line-height:1.5;min-width:120px;}
.counts{display:flex;gap:5px;flex-shrink:0;}
.cp{font-size:11px;font-weight:700;padding:3px 9px;border-radius:99px;}
.cp-e{background:var(--err-bg);color:var(--err);}
.cp-w{background:var(--warn-bg);color:var(--warn);}
.cp-o{background:var(--ok-bg);color:var(--ok);}

/* 指摘カード */
.issues{display:flex;flex-direction:column;gap:7px;animation:slideUp .3s;}
.icard{background:#fff;border:1px solid var(--paper3);border-radius:var(--rlg);overflow:hidden;transition:box-shadow .2s;}
.icard:hover{box-shadow:var(--sh);}
.icard.e{border-left:3px solid var(--err);}
.icard.w{border-left:3px solid var(--warn);}
.icard.o{border-left:3px solid var(--ok);}
.ihead{display:flex;align-items:center;gap:9px;padding:11px 14px;cursor:pointer;user-select:none;transition:background .15s;}
.ihead:hover{background:var(--paper2);}
.ico{font-size:14px;flex-shrink:0;}
.ilbl{font-size:13px;font-weight:500;color:var(--ink);flex:1;line-height:1.4;}
.itag{font-size:10px;font-weight:700;padding:2px 7px;border-radius:99px;flex-shrink:0;}
.t-e{background:var(--err-bg);color:var(--err);}
.t-w{background:var(--warn-bg);color:var(--warn);}
.t-o{background:var(--ok-bg);color:var(--ok);}
.arr{font-size:10px;color:var(--ink4);transition:transform .2s;flex-shrink:0;}
.icard.open .arr{transform:rotate(180deg);}
.ibody{display:none;padding:11px 14px 13px;border-top:1px solid var(--paper2);background:var(--paper2);}
.icard.open .ibody{display:block;}
.dlbl{font-size:10px;font-weight:700;color:var(--ink4);letter-spacing:.08em;text-transform:uppercase;margin-bottom:4px;margin-top:10px;}
.dlbl:first-child{margin-top:0;}
.dcode{font-family:'JetBrains Mono',monospace;font-size:12px;background:var(--ink);color:#e8e4da;border-radius:var(--r);padding:8px 12px;line-height:1.8;white-space:pre-wrap;}
.dsug{font-size:13px;font-weight:500;padding:7px 10px;border-radius:var(--r);}
.dsug-e{background:var(--err-bg);color:var(--err);}
.dsug-o{background:var(--ok-bg);color:var(--ok);}

/* diff */
.diff{margin-top:8px;border:1px solid var(--paper3);border-radius:var(--rlg);overflow:hidden;}
.diff-hd{display:flex;border-bottom:1px solid var(--paper3);}
.dh{flex:1;padding:6px 12px;font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;}
.dh.del{color:var(--err);background:#fff5f5;}
.dh.add{color:var(--ok);background:#f4fff6;}
.diff-bd{display:flex;}
.dc{flex:1;padding:9px 12px;font-size:13px;line-height:1.8;}
.dc.del{background:#fffafa;border-right:1px solid var(--paper3);}
.dc.add{background:#f6fff8;}
mark.del{background:rgba(163,32,32,.15);color:var(--err);border-radius:2px;padding:0 2px;text-decoration:line-through;}
mark.add{background:rgba(45,110,62,.18);color:var(--ok);border-radius:2px;padding:0 2px;font-weight:600;}

/* refs */
.refs{margin-top:8px;}
.refs-lbl{font-size:10px;font-weight:700;color:var(--ink4);letter-spacing:.08em;text-transform:uppercase;margin-bottom:4px;}
.ref{display:inline-flex;align-items:center;gap:3px;font-size:12px;color:var(--info);background:var(--info-bg);border:1px solid #c8dcf8;border-radius:var(--r);padding:3px 9px;margin:0 4px 4px 0;text-decoration:none;transition:background .15s;}
.ref:hover{background:#d0e4fc;}
.ref-s{font-size:10px;opacity:.7;}

/* URLチェック結果 */
.ui{background:#fff;border:1px solid var(--paper3);border-radius:var(--rlg);padding:11px 14px;margin-bottom:7px;}
.ui-top{display:flex;align-items:flex-start;gap:9px;}
.dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:5px;}
.dok{background:var(--ok)}.dwarn{background:var(--warn)}.derr{background:var(--err)}
.ui-addr{font-size:12px;font-family:'JetBrains Mono',monospace;color:var(--ink2);word-break:break-all;}
.ui-rsn{font-size:12px;color:var(--ink3);margin-top:2px;}
.htag{display:inline;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;padding:1px 6px;border-radius:4px;margin-left:5px;}
.hok{background:var(--ok-bg);color:var(--ok);}
.hwarn{background:var(--warn-bg);color:var(--warn);}
.herr{background:var(--err-bg);color:var(--err);}
.ui-det{margin-top:7px;padding-top:7px;border-top:1px solid var(--paper2);font-size:13px;color:var(--ink2);line-height:1.6;}

.spinner{display:inline-block;width:13px;height:13px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;vertical-align:middle;margin-right:5px;}
@keyframes spin{to{transform:rotate(360deg)}}
footer{text-align:center;padding:1.5rem;font-size:11px;color:var(--ink4);border-top:1px solid var(--paper3);}
@media(max-width:560px){.url-row{flex-direction:column;}.tabs{overflow-x:auto;}.tab{white-space:nowrap;}header{padding:0 1rem;}.today-tag{display:none;}.counts{display:none;}}
</style>
</head>
<body>

<header>
  <div>
    <span class="logo-main">FactCheck</span>
    <span class="logo-sub">事実確認チェッカー</span>
  </div>
  <div class="hdr-right">
    <span class="today-tag">本日 ${today}</span>
    <div class="live">AI 稼働中</div>
  </div>
</header>

<div class="hero">
  <div class="eyebrow">Powered by Claude AI</div>
  <h1>サイト運用の<br><em>ミスをゼロに。</em></h1>
  <p>URLを貼り付けるか、テキストを入力するだけで<br>事実・数値・リンクをAIが自動チェックします。</p>
</div>

<div class="url-wrap">
  <div class="url-card">
    <div class="url-lbl">🔗 URLを貼り付けてまとめてチェック</div>
    <div class="url-row">
      <input class="url-inp" id="main-url" type="text" placeholder="https://www.f-marinos.com/news/goods/10006" onkeydown="if(event.key==='Enter')go()">
      <button class="btn-go" id="btn-go" onclick="go()">チェック開始</button>
    </div>
  </div>
  <div id="r-main"></div>
</div>

<div class="div">または手動でテキストを入力</div>

<div class="tabs-wrap">
  <div class="tabs">
    <button class="tab active" onclick="sw('text')">テキスト事実確認</button>
    <button class="tab" onclick="sw('url')">URLリンク切れチェック</button>
    <button class="tab" onclick="sw('data')">数値・データ整合性</button>
    <button class="tab" onclick="sw('cl')">✅ 公開前チェックリスト</button>
  </div>
</div>

<div class="panels-wrap">
  <div class="panel active" id="p-text">
    <div class="field">
      <label class="flbl">チェックしたいテキスト・文章</label>
      <textarea id="t-text" placeholder="例：5月2日（日）水戸ホーリーホック戦では..."></textarea>
    </div>
    <div class="field">
      <label class="flbl">チェックの観点（任意）</label>
      <input type="text" id="t-focus" placeholder="例：曜日の正確性、数値の矛盾、選手情報など">
    </div>
    <button class="btn-check" id="btn-text" onclick="chkText()">AIでチェックする（根拠＋参照リンク付き）</button>
    <div class="result" id="r-text"></div>
    <div id="pdf-text-bar" style="display:none;justify-content:flex-end;margin-top:10px;"><button onclick="exportPdf('r-text','テキスト事実確認')" style="display:inline-flex;align-items:center;gap:6px;padding:7px 16px;border-radius:10px;border:1.5px solid #e8e4da;background:#fff;color:#6b6860;font-size:12px;font-weight:500;cursor:pointer;font-family:Noto Sans JP,sans-serif;">📄 PDFで出力する</button></div>
  </div>

  <div class="panel" id="p-url">
    <div class="field">
      <label class="flbl">チェックしたいURLを追加（サーバーから実アクセスして確認）</label>
      <div class="row">
        <input type="text" id="t-url" placeholder="https://example.com/page" onkeydown="if(event.key==='Enter')addUrl()">
        <button class="btn-add" onclick="addUrl()">追加</button>
      </div>
      <p class="hint">改行区切りで複数まとめて貼り付けも可</p>
      <div id="chips" class="chips"></div>
    </div>
    <button class="btn-check" id="btn-url" onclick="chkUrl()">実アクセスで確認する</button>
    <div class="result" id="r-url"></div>
    <div id="pdf-url-bar" style="display:none;justify-content:flex-end;margin-top:10px;"><button onclick="exportPdf('r-url','URLリンク切れチェック')" style="display:inline-flex;align-items:center;gap:6px;padding:7px 16px;border-radius:10px;border:1.5px solid #e8e4da;background:#fff;color:#6b6860;font-size:12px;font-weight:500;cursor:pointer;font-family:Noto Sans JP,sans-serif;">📄 PDFで出力する</button></div>
  </div>

  <div class="panel" id="p-data">
    <div class="field">
      <label class="flbl">チェックしたいデータ・数値を含む文章</label>
      <textarea id="t-data" placeholder="例：全36種（33選手＋マリノス君・マリノスケ・マリン）&#10;封入割合：特賞2%、A賞15%、B賞21%、C賞25%、D賞37%"></textarea>
    </div>
    <div class="field">
      <label class="flbl">チェックの観点（任意）</label>
      <input type="text" id="d-focus" placeholder="例：合計値の整合性、割合の正確さなど">
    </div>
    <button class="btn-check" id="btn-data" onclick="chkData()">AIで整合性チェック（根拠＋参照リンク付き）</button>
    <div class="result" id="r-data"></div>
    <div id="pdf-data-bar" style="display:none;justify-content:flex-end;margin-top:10px;"><button onclick="exportPdf('r-data','数値・データ整合性チェック')" style="display:inline-flex;align-items:center;gap:6px;padding:7px 16px;border-radius:10px;border:1.5px solid #e8e4da;background:#fff;color:#6b6860;font-size:12px;font-weight:500;cursor:pointer;font-family:Noto Sans JP,sans-serif;">📄 PDFで出力する</button></div>
  </div>

  <div class="panel" id="p-cl">
    <div style="background:#fff;border:1.5px solid #e8e4da;border-radius:20px;padding:1.25rem;box-shadow:0 2px 12px rgba(15,14,12,.08);">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem;">
        <div style="font-size:14px;font-weight:700;">📋 公開前チェックリスト</div>
        <div style="font-size:12px;color:#a8a59f;" id="cl-prog-txt">0 / 0 完了</div>
      </div>
      <div style="height:5px;background:#e8e4da;border-radius:99px;margin-bottom:1rem;overflow:hidden;">
        <div id="cl-prog-fill" style="height:100%;background:#2d6e3e;border-radius:99px;transition:width .4s;width:0%"></div>
      </div>
      <div id="cl-groups"></div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:12px;padding-top:12px;border-top:1px solid #e8e4da;gap:8px;flex-wrap:wrap;">
        <button onclick="resetCl()" style="background:none;border:1px solid #e8e4da;border-radius:6px;padding:5px 12px;font-size:12px;color:#a8a59f;cursor:pointer;font-family:Noto Sans JP,sans-serif;">リセット</button>
        <div id="cl-status" style="font-size:12px;font-weight:700;flex:1;text-align:center;color:#a8a59f;">未完了の項目があります</div>
        <button onclick="exportClPdf()" style="display:inline-flex;align-items:center;gap:6px;padding:7px 16px;border-radius:10px;border:1.5px solid #e8e4da;background:#fff;color:#6b6860;font-size:12px;font-weight:500;cursor:pointer;font-family:Noto Sans JP,sans-serif;">📄 PDFで出力</button>
      </div>
    </div>
  </div>
</div>

<footer>FactCheck — Powered by Anthropic Claude API | 横浜F・マリノス 運用チーム | 本日：${today}</footer>

<script>
// サーバー側で埋め込まれた今日の日付
const TODAY = '${today}';
const urls = [];

function sw(id) {
  ['text','url','data','cl'].forEach((t,i) => document.querySelectorAll('.tab')[i].classList.toggle('active', t===id));
  ['text','url','data','cl'].forEach(t => document.getElementById('p-'+t).classList.remove('active'));
  document.getElementById('p-'+id).classList.add('active');
}

function addUrl() {
  const inp = document.getElementById('t-url'), v = inp.value.trim(); if(!v) return;
  v.split(/[\\n,]/).map(u=>u.trim()).filter(Boolean).forEach(u => { if(!urls.includes(u)) urls.push(u); });
  inp.value=''; renderChips();
}
function renderChips() {
  document.getElementById('chips').innerHTML = urls.map((u,i) =>
    \`<div class="chip"><span class="chip-t">\${x(u)}</span><button class="chip-x" onclick="delUrl(\${i})">×</button></div>\`
  ).join('');
}
function delUrl(i) { urls.splice(i,1); renderChips(); }

function loading(id, on, lbl) {
  const b = document.getElementById(id); b.disabled = on;
  b.innerHTML = on ? '<span class="spinner"></span>チェック中...' : lbl;
}

// ── 唯一のAPI呼び出し ──
async function api(body) {
  const r = await fetch('/api', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}

// ── AIチェック ──
async function aiCheck(system, user) {
  const data = await api({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    system,
    messages: [{ role:'user', content: user }],
    tools: [{ type:'web_search_20250305', name:'web_search' }]
  });
  return (data.content||[]).map(b => b.type==='text' ? b.text : '').join('');
}

// ── URLチェック（サーバー側で実アクセス）──
async function urlCheck(urlList) {
  const data = await api({ _urlcheck: true, urls: urlList });
  return data;
}

// ── 結果レンダリング ──
function bar(verdict, summary, issues) {
  const e=(issues||[]).filter(i=>i.s==='e').length;
  const w=(issues||[]).filter(i=>i.s==='w').length;
  const o=(issues||[]).filter(i=>i.s==='o').length;
  const vc = (verdict.includes('問題あり')||verdict.includes('エラー')) ? 'v-err' : verdict.includes('注意')||verdict.includes('確認') ? 'v-warn' : 'v-ok';
  return \`<div class="sum-bar">
    <span class="verdict \${vc}">\${x(verdict)}</span>
    <span class="sum-txt">\${x(summary||'')}</span>
    <div class="counts">
      \${e?\`<span class="cp cp-e">🔴 \${e}件</span>\`:''}
      \${w?\`<span class="cp cp-w">🟡 \${w}件</span>\`:''}
      \${o?\`<span class="cp cp-o">✅ \${o}件</span>\`:''}
    </div>
  </div>\`;
}

function cards(issues, px) {
  if (!issues||!issues.length)
    return '<div style="text-align:center;padding:1.5rem;font-size:14px;color:var(--ok);">✅ 問題は検出されませんでした。</div>';
  return \`<div class="issues">\${issues.map((it,i) => {
    const s = it.s||'w';
    const icon = s==='e'?'🔴':s==='o'?'✅':'🟡';
    const tcls = s==='e'?'t-e':s==='o'?'t-o':'t-w';
    const ttxt = s==='e'?'要修正':s==='o'?'問題なし':'要確認';
    const rcls = s==='e'?'e':s==='o'?'o':'w';
    const scls = (it.sg||'').includes('不要')||(it.sg||'').includes('問題なし')?'dsug-o':'dsug-e';
    const diff = (it.ot||it.ft) ? \`<div class="diff">
      <div class="diff-hd"><div class="dh del">修正前</div><div class="dh add">修正後</div></div>
      <div class="diff-bd">
        <div class="dc del">\${hl(it.ot||'', it.ep||'', 'del')}</div>
        <div class="dc add">\${hl(it.ft||'', it.fp||'', 'add')}</div>
      </div>
    </div>\` : '';
    const refs = (it.refs&&it.refs.length) ? \`<div class="refs"><div class="refs-lbl">参照・確認先</div>\${it.refs.map(r=>\`<a class="ref" href="\${x(r.url)}" target="_blank" rel="noopener">\${x(r.label)}<span class="ref-s"> — \${x(r.source)}</span></a>\`).join('')}</div>\` : '';
    return \`<div class="icard \${rcls}" id="\${px}\${i}">
      <div class="ihead" onclick="tog('\${px}\${i}')">
        <span class="ico">\${icon}</span>
        <span class="ilbl">\${x(it.p||'')}</span>
        <span class="itag \${tcls}">\${ttxt}</span>
        <span class="arr">▼</span>
      </div>
      <div class="ibody">
        <div class="dlbl">根拠・計算</div>
        <div class="dcode">\${x(it.ev||'')}\${it.cv?\`\\n現在：\${x(String(it.ov||''))} → 正：\${x(String(it.cv||''))}\`:''}</div>
        <div class="dlbl">修正提案</div>
        <div class="dsug \${scls}">\${x(it.sg||'')}</div>
        \${diff}
        \${refs}
      </div>
    </div>\`;
  }).join('')}</div>\`;
}

function hl(text, part, cls) {
  if (!part||!text) return x(text);
  return x(text).replace(x(part), \`<mark class="\${cls}">\${x(part)}</mark>\`);
}
function tog(id) { document.getElementById(id).classList.toggle('open'); }
function x(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function parse(raw) {
  try { return JSON.parse(raw.replace(/\`\`\`json|\`\`\`/g,'').trim()); }
  catch { return null; }
}

// ── URLまとめチェック ──
async function go() {
  const url = document.getElementById('main-url').value.trim(); if(!url) return;
  const btn = document.getElementById('btn-go');
  btn.disabled=true; btn.textContent='取得中...';
  document.getElementById('r-main').innerHTML='';
  try {
    const sys = \`あなたはサイト運用の事実確認専門家です。
重要：今日の日付は\${TODAY}です。
曜日の判定はweb_searchで確認してから行ってください。AIが独自に計算することを禁止します。
指摘ごとにot(修正前文),ep(問題部分),ft(修正後文),fp(修正後部分)を付けてください。JSON形式のみ。\`;
    const prompt = \`URLを調査してチェックしてください：\${url}
本日：\${TODAY}

JSON形式のみ（他のテキスト不要）:
{"title":"タイトル","verdict":"問題なし|要注意|問題あり","summary":"全体評価2〜3文","issues":[{"s":"e|w|o","p":"指摘内容","ev":"根拠","sg":"修正提案","ot":"修正前の該当一文","ep":"問題部分","ft":"修正後の一文","fp":"修正後部分","refs":[{"label":"ページ名","url":"https://...","source":"運営元"}]}]}\`;
    const raw = await aiCheck(sys, prompt);
    const p = parse(raw) || {title:url,verdict:'要注意',summary:raw,issues:[]};
    document.getElementById('r-main').innerHTML = \`<div style="margin-top:1.25rem;">\${bar(p.verdict,p.summary,p.issues)}\${cards(p.issues,'m')}</div>\`;
  } catch(e) {
    document.getElementById('r-main').innerHTML = \`<div style="margin-top:1rem;padding:14px;background:#fff;border:1px solid var(--paper3);border-radius:var(--rlg);color:var(--err);font-size:14px;">エラー：\${x(e.message)}</div>\`;
  }
  btn.disabled=false; btn.textContent='チェック開始';
}

// ── テキストチェック ──
async function chkText() {
  const text = document.getElementById('t-text').value.trim(); if(!text) return;
  const focus = document.getElementById('t-focus').value.trim();
  const lbl = 'AIでチェックする（根拠＋参照リンク付き）';
  loading('btn-text',true,lbl);
  document.getElementById('r-text').innerHTML='';
  try {
    // サーバー側で計算した曜日コンテキストを取得
    const wdData = await api({ _weekday: true, text });
    const wdCtx = wdData.context || '';

    const sys = \`あなたはサイト運用の事実確認専門家です。
今日の日付：\${TODAY}
\${wdCtx}
【最重要】曜日の正誤はAI自身が計算することを禁止します。必ず上記の事前計算結果だけを使ってください。
指摘ごとにot,ep,ft,fpを付けてください。JSON形式のみ。\`;
    const prompt = \`チェック観点：\${focus||'曜日・日付の正確性（上記事前計算を参照）、数値の矛盾、選手情報、誇張表現'}
本日：\${TODAY}

テキスト：
\${text}

JSON形式のみ：
{"verdict":"問題なし|要注意|問題あり","summary":"全体評価1〜2文","issues":[{"s":"e|w|o","p":"指摘内容","ev":"根拠","sg":"修正提案","ot":"修正前の該当一文","ep":"問題部分","ft":"修正後の一文","fp":"修正後部分","refs":[{"label":"ページ名","url":"https://...","source":"運営元"}]}]}\`;
    const raw = await aiCheck(sys, prompt);
    const p = parse(raw) || {verdict:'要注意',summary:raw,issues:[]};
    document.getElementById('r-text').innerHTML = bar(p.verdict,p.summary,p.issues) + cards(p.issues,'t');
    document.getElementById('pdf-text-bar').style.display='flex';
  } catch(e) {
    document.getElementById('r-text').innerHTML = \`<div style="padding:14px;background:#fff;border:1px solid var(--paper3);border-radius:var(--rlg);color:var(--err);font-size:14px;">エラー：\${x(e.message)}</div>\`;
  }
  loading('btn-text',false,lbl);
}

// ── URLリンク切れチェック ──
async function chkUrl() {
  if(!urls.length) return;
  const lbl = '実アクセスで確認する';
  loading('btn-url',true,lbl);
  document.getElementById('r-url').innerHTML='';
  try {
    const results = await urlCheck(urls);
    const e=results.filter(r=>r.st==='e').length, w=results.filter(r=>r.st==='w').length;
    const vc = e>0?'v-err':w>0?'v-warn':'v-ok';
    const vt = e>0?'問題あり':w>0?'要注意':'問題なし';
    const b = \`<div class="sum-bar"><span class="verdict \${vc}">\${vt}</span><span class="sum-txt">\${results.length}件を実アクセスで確認しました</span><div class="counts">\${e?\`<span class="cp cp-e">エラー \${e}件</span>\`:''}\${w?\`<span class="cp cp-w">要注意 \${w}件</span>\`:''}</div></div>\`;
    const items = results.map(r => {
      const dc = r.st==='ok'?'dok':r.st==='e'?'derr':'dwarn';
      const hc = (r.hs>=200&&r.hs<300)?'hok':(r.hs>=300&&r.hs<400)?'hwarn':'herr';
      return \`<div class="ui">
        <div class="ui-top">
          <div class="dot \${dc}"></div>
          <div>
            <div class="ui-addr">\${x(r.url)}\${r.hs?\`<span class="htag \${hc}">HTTP \${r.hs}</span>\`:''}</div>
            <div class="ui-rsn">\${x(r.reason||'')}</div>
          </div>
        </div>
        \${r.detail?\`<div class="ui-det">\${x(r.detail)}</div>\`:''}
        \${r.redir?\`<div class="ui-det" style="color:var(--warn)">⚠️ リダイレクト先：\${x(r.final||'')}</div>\`:''}
      </div>\`;
    }).join('');
    document.getElementById('r-url').innerHTML = b + `<div class="issues">${items}</div>`;
    document.getElementById('pdf-url-bar').style.display='flex';
  } catch(e) {
    document.getElementById('r-url').innerHTML = \`<div style="padding:14px;background:#fff;border:1px solid var(--paper3);border-radius:var(--rlg);color:var(--err);font-size:14px;">エラー：\${x(e.message)}</div>\`;
  }
  loading('btn-url',false,lbl);
}

// ── データ整合性チェック ──
async function chkData() {
  const text = document.getElementById('t-data').value.trim(); if(!text) return;
  const focus = document.getElementById('d-focus').value.trim();
  const lbl = 'AIで整合性チェック（根拠＋参照リンク付き）';
  loading('btn-data',true,lbl);
  document.getElementById('r-data').innerHTML='';
  try {
    const wdData = await api({ _weekday: true, text });
    const wdCtx = wdData.context || '';

    const sys = \`数値・データの整合性チェック専門家です。
今日の日付：\${TODAY}
\${wdCtx}
曜日の判定はAI自身で計算せず、上記の事前計算結果のみを使用してください。
計算式・正しい値・参照先を必ず示してください。指摘ごとにot,ep,ft,fpを付けてください。JSON形式のみ。\`;
    const prompt = \`チェック観点：\${focus||'合計値の整合性、割合の正確さ、前後比較の矛盾、単位の一貫性'}
本日：\${TODAY}

データ：
\${text}

JSON形式のみ：
{"verdict":"整合性OK|要確認|整合性エラーあり","summary":"全体評価1〜2文","issues":[{"s":"e|w|o","p":"指摘内容","ev":"計算式","sg":"修正提案","ov":"現在の値","cv":"正しい値","ot":"修正前の該当一文","ep":"問題部分","ft":"修正後の一文","fp":"修正後部分","refs":[{"label":"サイト名","url":"https://...","source":"運営元"}]}]}\`;
    const raw = await aiCheck(sys, prompt);
    const p = parse(raw) || {verdict:'要確認',summary:raw,issues:[]};
    document.getElementById('r-data').innerHTML = bar(p.verdict,p.summary,p.issues) + cards(p.issues,'d');
    document.getElementById('pdf-data-bar').style.display='flex';
  } catch(e) {
    document.getElementById('r-data').innerHTML = \`<div style="padding:14px;background:#fff;border:1px solid var(--paper3);border-radius:var(--rlg);color:var(--err);font-size:14px;">エラー：\${x(e.message)}</div>\`;
  }
  loading('btn-data',false,lbl);
}

// ════ チェックリスト ════
const CL_DATA = [
  { group:'📅 日付・曜日', items:['試合日の曜日が正しい（例：5月2日（土））','発売日・受注日の曜日が正しい','受注終了日の曜日が正しい','年度が正しい（2024・2025年になっていない）'] },
  { group:'💰 価格・数値', items:['全ての価格に「（税込）」の記載がある','価格の数値が正しい','商品種類数の内訳合計が一致している（例：33+3=36）','サイズ表の数値に矛盾がない','割合・パーセントの合計が100%になっている'] },
  { group:'📝 テキスト・表記', items:['選手名の漢字・表記が正しい','選手の背番号が正しい','対戦相手チーム名が正しい','商品名・グッズ名の表記が正しい','誇張表現・断定表現がない','注意書き・免責事項の記載がある'] },
  { group:'🔗 リンク・URL', items:['購入ページのURLにアクセスできる','お問合せフォームのURLが正しい','記事内リンクが正しいページに飛ぶ','画像のaltテキストが設定されている'] },
  { group:'🗓️ 販売情報', items:['販売開始日時が正しい','受注終了日時が正しい','販売店舗の記載が正しい','営業時間の記載が正しい','WEB SHOP限定・会場限定の区別が明記されている','数量限定の場合その旨が記載されている'] },
  { group:'🔍 最終確認', items:['ステージング環境で表示を確認した','画像が正しく表示されている','スマートフォンでの表示を確認した','担当者・上長の確認を得た'] }
];
let clState = {};
function clKey(){return 'fc_cl_'+new Date().toDateString();}
function loadCl(){try{clState=JSON.parse(localStorage.getItem(clKey())||'{}');}catch{clState={};}}
function saveCl(){try{localStorage.setItem(clKey(),JSON.stringify(clState));}catch{}}
function clEsc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function renderCl(){
  loadCl(); let total=0,done=0;
  const html=CL_DATA.map(function(g,gi){
    const items=g.items.map(function(item,ii){
      const key=gi+'_'+ii; const chk=!!clState[key]; total++; if(chk)done++;
      return '<div onclick="toggleCl(\''+key+'\')" style="display:flex;align-items:flex-start;gap:10px;padding:8px 10px;border-radius:6px;border:1px solid '+(chk?'#b6dfc3':'#e8e4da')+';cursor:pointer;margin-bottom:4px;background:'+(chk?'#e8f5ec':'#fff')+';user-select:none;">'
        +'<div style="width:16px;height:16px;border-radius:4px;border:1.5px solid '+(chk?'#2d6e3e':'#e8e4da')+';flex-shrink:0;display:flex;align-items:center;justify-content:center;margin-top:1px;font-size:11px;font-weight:700;background:'+(chk?'#2d6e3e':'transparent')+';color:#fff;">'+(chk?'✓':'')+'</div>'
        +'<div style="font-size:13px;color:'+(chk?'#6b6860':'#3a3830')+';line-height:1.4;'+(chk?'text-decoration:line-through;':'')+'">'+clEsc(item)+'</div></div>';
    }).join('');
    return '<div style="margin-bottom:14px;"><div style="font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#a8a59f;margin-bottom:6px;">'+clEsc(g.group)+'</div>'+items+'</div>';
  }).join('');
  document.getElementById('cl-groups').innerHTML=html;
  const pct=total?Math.round(done/total*100):0;
  document.getElementById('cl-prog-fill').style.width=pct+'%';
  document.getElementById('cl-prog-txt').textContent=done+' / '+total+' 完了 ('+pct+'%)';
  const st=document.getElementById('cl-status');
  if(done===total){st.textContent='✅ すべてのチェック完了！';st.style.color='#2d6e3e';}
  else{st.textContent='未完了の項目があります';st.style.color='#a8a59f';}
}
function toggleCl(key){loadCl();clState[key]=!clState[key];saveCl();renderCl();}
function resetCl(){if(!confirm('チェックリストをリセットしますか？'))return;clState={};saveCl();renderCl();}
renderCl();

// ════ PDF出力 ════
const PDF_GF='<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">';
const PDF_CSS='body{font-family:"Noto Sans JP",sans-serif;background:#fff;color:#0f0e0c;padding:2rem;max-width:800px;margin:0 auto;font-size:13px;line-height:1.6;}h1{font-size:20px;font-weight:700;margin-bottom:4px;}.meta{font-size:11px;color:#6b6860;margin-bottom:1.5rem;padding-bottom:1rem;border-bottom:2px solid #0f0e0c;}.sum-bar{display:flex;align-items:center;gap:8px;padding:10px 14px;border:1px solid #e8e4da;border-radius:8px;margin-bottom:12px;background:#f2efe8;flex-wrap:wrap;}.verdict{font-size:11px;font-weight:700;padding:3px 10px;border-radius:99px;}.v-ok{background:#e8f5ec;color:#2d6e3e;border:1px solid #b6dfc3;}.v-warn{background:#fdf3e3;color:#8a5a00;border:1px solid #f0cc88;}.v-err{background:#fdecea;color:#a32020;border:1px solid #f0aaaa;}.sum-txt{flex:1;font-size:13px;color:#3a3830;}.counts{display:flex;gap:5px;}.cp{font-size:11px;font-weight:700;padding:2px 8px;border-radius:99px;}.cp-e{background:#fdecea;color:#a32020;}.cp-w{background:#fdf3e3;color:#8a5a00;}.cp-o{background:#e8f5ec;color:#2d6e3e;}.issues{display:flex;flex-direction:column;gap:6px;}.icard{border:1px solid #e8e4da;border-radius:10px;overflow:hidden;page-break-inside:avoid;}.icard.e{border-left:3px solid #a32020;}.icard.w{border-left:3px solid #8a5a00;}.icard.o{border-left:3px solid #2d6e3e;}.ihead{display:flex;align-items:center;gap:8px;padding:10px 14px;background:#faf8f4;}.ico{font-size:13px;}.ilbl{font-size:13px;font-weight:500;flex:1;}.itag{font-size:10px;font-weight:700;padding:2px 7px;border-radius:99px;}.arr{display:none!important;}.t-e{background:#fdecea;color:#a32020;}.t-w{background:#fdf3e3;color:#8a5a00;}.t-o{background:#e8f5ec;color:#2d6e3e;}.ibody{display:block!important;padding:10px 14px;background:#f9f7f3;border-top:1px solid #e8e4da;}.dlbl{font-size:9px;font-weight:700;color:#a8a59f;letter-spacing:.08em;text-transform:uppercase;margin-bottom:3px;margin-top:8px;}.dlbl:first-child{margin-top:0;}.dcode{font-family:"JetBrains Mono",monospace;font-size:11px;background:#0f0e0c;color:#e8e4da;border-radius:5px;padding:6px 10px;line-height:1.7;white-space:pre-wrap;}.dsug{font-size:12px;font-weight:500;padding:6px 10px;border-radius:5px;margin-bottom:6px;}.dsug-e{background:#fdecea;color:#a32020;}.dsug-o{background:#e8f5ec;color:#2d6e3e;}.diff{border:1px solid #e8e4da;border-radius:8px;overflow:hidden;margin:6px 0;}.diff-hd{display:flex;border-bottom:1px solid #e8e4da;}.dh{flex:1;padding:5px 10px;font-size:9px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;}.dh.del{color:#a32020;background:#fff5f5;}.dh.add{color:#2d6e3e;background:#f4fff6;}.diff-bd{display:flex;}.dc{flex:1;padding:8px 10px;font-size:12px;line-height:1.7;}.dc.del{background:#fffafa;border-right:1px solid #e8e4da;}.dc.add{background:#f6fff8;}mark.del{background:rgba(163,32,32,.15);color:#a32020;border-radius:2px;padding:0 2px;text-decoration:line-through;}mark.add{background:rgba(45,110,62,.18);color:#2d6e3e;border-radius:2px;padding:0 2px;font-weight:600;}.refs{margin-top:6px;}.refs-lbl{font-size:9px;font-weight:700;color:#a8a59f;letter-spacing:.08em;text-transform:uppercase;margin-bottom:3px;}.ref{display:inline-block;font-size:11px;color:#1a4fa0;background:#e8f0fb;border:1px solid #c8dcf8;border-radius:4px;padding:2px 8px;margin:0 3px 3px 0;text-decoration:none;}.ui{border:1px solid #e8e4da;border-radius:8px;padding:10px 12px;margin-bottom:6px;}@media print{body{padding:1rem;}@page{margin:1.5cm;}}';

function exportPdf(resultId, title){
  const el=document.getElementById(resultId);
  if(!el||!el.innerHTML.trim())return;
  el.querySelectorAll('.icard').forEach(function(c){c.classList.add('open');});
  const w=window.open('','_blank');
  w.document.write('<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><title>'+title+'</title>'+PDF_GF+'<style>'+PDF_CSS+'</style></head><body><h1>📋 '+title+' レポート</h1><div class="meta">FactCheck — 横浜F・マリノス 運用チーム | 実施日：'+TODAY+'</div>'+el.innerHTML+'</body></html>');
  w.document.close();
  setTimeout(function(){w.print();},800);
}

function exportClPdf(){
  loadCl(); let total=0,done=0;
  const gHtml=CL_DATA.map(function(g,gi){
    const items=g.items.map(function(item,ii){
      const key=gi+'_'+ii; const chk=!!clState[key]; total++; if(chk)done++;
      return '<div style="display:flex;align-items:flex-start;gap:10px;padding:8px 10px;border:1px solid '+(chk?'#b6dfc3':'#e8e4da')+';border-radius:6px;margin-bottom:4px;background:'+(chk?'#e8f5ec':'#fff')+';">'
        +'<div style="width:16px;height:16px;border-radius:4px;border:1.5px solid '+(chk?'#2d6e3e':'#e8e4da')+';flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;background:'+(chk?'#2d6e3e':'transparent')+';color:#fff;">'+(chk?'✓':'')+'</div>'
        +'<div style="font-size:13px;color:'+(chk?'#6b6860':'#3a3830')+';'+(chk?'text-decoration:line-through;':'')+'">'+clEsc(item)+'</div></div>';
    }).join('');
    return '<div style="margin-bottom:16px;page-break-inside:avoid;"><div style="font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#a8a59f;margin-bottom:6px;">'+clEsc(g.group)+'</div>'+items+'</div>';
  }).join('');
  const CSS='body{font-family:"Noto Sans JP",sans-serif;background:#fff;color:#0f0e0c;padding:2rem;max-width:700px;margin:0 auto;}h1{font-size:20px;font-weight:700;margin-bottom:4px;}.meta{font-size:11px;color:#6b6860;margin-bottom:1.5rem;padding-bottom:1rem;border-bottom:2px solid #0f0e0c;}@media print{body{padding:1rem;}@page{margin:1.5cm;}}';
  const w=window.open('','_blank');
  w.document.write('<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><title>公開前チェックリスト</title><link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet"><style>'+CSS+'</style></head><body><h1>✅ 公開前チェックリスト</h1><div class="meta">FactCheck — 横浜F・マリノス 運用チーム | 実施日：'+TODAY+' | 完了：'+done+'/'+total+'</div>'+gHtml+'</body></html>');
  w.document.close();
  setTimeout(function(){w.print();},800);
}
</script>
</body>
</html>`;
}

// ════════════════════════════════════════════════
//  Vercel ハンドラー（単一エントリーポイント）
// ════════════════════════════════════════════════
export default async function handler(req, res) {

  // ── GET → HTML を返す ──
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(buildHtml(getToday()));
  }

  // ── POST ──
  if (req.method === 'POST') {
    const body = req.body || {};

    // 1) 曜日の事前計算
    if (body._weekday) {
      const context = buildDateContext(body.text || '');
      return res.status(200).json({ context });
    }

    // 2) URLの実アクセスチェック
    if (body._urlcheck) {
      const urlList = body.urls || [];
      const results = await Promise.all(urlList.map(async (u) => {
        const r = await pingUrl(u);
        let st='ok', reason='', detail='';
        if (r.error) {
          st='e'; reason='アクセス不可'; detail=`接続エラー：${r.error}`;
        } else if (r.status===200) {
          st='ok'; reason='正常'; detail=`HTTP ${r.status} — 正常に応答しています。`;
        } else if (r.status>=300&&r.status<400) {
          st='w'; reason=`リダイレクト (${r.status})`; detail=`HTTP ${r.status} — 別のURLにリダイレクトされています。`;
        } else if (r.status===401||r.status===403) {
          st='w'; reason=`認証が必要 (${r.status})`; detail=`HTTP ${r.status} — アクセスに認証が必要です（ステージング環境等）。`;
        } else if (r.status===404) {
          st='e'; reason='ページが見つからない (404)'; detail=`HTTP ${r.status} — ページが存在しません。`;
        } else if (r.status>=500) {
          st='e'; reason=`サーバーエラー (${r.status})`; detail=`HTTP ${r.status} — サーバー側でエラーが発生しています。`;
        } else {
          st='w'; reason=`HTTP ${r.status}`; detail='通常とは異なるレスポンスです。';
        }
        return { url:u, st, reason, detail, hs:r.status||null, redir:r.redirected||false, final:r.finalUrl||null };
      }));
      return res.status(200).json(results);
    }

    // 3) Anthropic API への転送
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY が未設定です' });
    // 内部フラグを除去してから送信
    const { _weekday, _urlcheck, ...apiBody } = body;
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-beta': 'web-search-2025-03-05'
        },
        body: JSON.stringify(apiBody)
      });
      const data = await r.json();
      return res.status(r.status).json(data);
    } catch(e) {
      return res.status(500).json({ error: 'APIリクエスト失敗', detail: e.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
