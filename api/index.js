const HTML = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>事実確認チェッカー</title>
<style>
  :root {
    --bg: #f7f6f3; --surface: #ffffff; --border: #e5e3dc; --border-strong: #c8c5bc;
    --text: #1a1916; --text-muted: #6b6860; --text-faint: #9c9a96; --accent: #1a1916;
    --ok-bg: #eef5e8; --ok-text: #2d6a1f; --warn-bg: #fdf3e3; --warn-text: #8a5a00;
    --err-bg: #fdecea; --err-text: #a32020; --info-bg: #e8f0fb; --info-text: #1a4fa0;
    --ref-bg: #e8f0fb; --ref-border: #b8cef4; --ref-text: #1a4fa0;
    --radius: 8px; --radius-lg: 12px;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; }
  header { background: var(--surface); border-bottom: 1px solid var(--border); padding: 0 2rem; display: flex; align-items: center; height: 56px; }
  .logo { font-size: 15px; font-weight: 700; letter-spacing: -0.02em; }
  .logo span { color: var(--text-muted); font-weight: 400; }
  .main { max-width: 760px; margin: 0 auto; padding: 2rem 1.5rem; }
  .tabs { display: flex; gap: 4px; margin-bottom: 1.5rem; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 4px; }
  .tab { flex: 1; padding: 8px 12px; border-radius: 6px; border: none; background: transparent; cursor: pointer; font-size: 13px; color: var(--text-muted); font-family: inherit; transition: all 0.15s; white-space: nowrap; }
  .tab.active { background: var(--accent); color: #fff; font-weight: 500; }
  .tab:hover:not(.active) { background: var(--bg); color: var(--text); }
  .panel { display: none; } .panel.active { display: block; }
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1.25rem; margin-bottom: 1rem; }
  label { font-size: 12px; font-weight: 600; color: var(--text-muted); letter-spacing: 0.04em; text-transform: uppercase; display: block; margin-bottom: 6px; }
  textarea, input[type="text"] { width: 100%; border: 1px solid var(--border); border-radius: var(--radius); padding: 10px 12px; font-size: 14px; font-family: inherit; color: var(--text); background: var(--bg); outline: none; transition: border-color 0.15s; }
  textarea { resize: vertical; min-height: 120px; line-height: 1.6; }
  textarea:focus, input[type="text"]:focus { border-color: var(--border-strong); background: var(--surface); }
  .hint { font-size: 12px; color: var(--text-faint); margin-top: 5px; }
  .btn-check { width: 100%; padding: 12px; border-radius: var(--radius); border: none; background: var(--accent); color: #fff; font-size: 14px; font-family: inherit; font-weight: 600; cursor: pointer; transition: opacity 0.15s; }
  .btn-check:hover { opacity: 0.85; } .btn-check:disabled { opacity: 0.45; cursor: not-allowed; }
  .btn-add { padding: 10px 16px; border-radius: var(--radius); border: 1px solid var(--border); background: var(--surface); color: var(--text); font-size: 14px; font-family: inherit; cursor: pointer; flex-shrink: 0; }
  .btn-add:hover { background: var(--bg); }
  .row { display: flex; gap: 8px; }
  .chips { display: flex; flex-direction: column; gap: 6px; margin-top: 8px; }
  .chip { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: var(--radius); border: 1px solid var(--border); font-size: 13px; background: var(--bg); }
  .chip-url { color: var(--text); word-break: break-all; flex: 1; }
  .chip-del { background: none; border: none; cursor: pointer; color: var(--text-faint); font-size: 18px; padding: 0 0 0 8px; }
  .result { margin-top: 1.25rem; }
  .result-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1.25rem; }
  .result-head { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
  .badge { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 99px; letter-spacing: 0.02em; }
  .badge-ok { background: var(--ok-bg); color: var(--ok-text); }
  .badge-warn { background: var(--warn-bg); color: var(--warn-text); }
  .badge-err { background: var(--err-bg); color: var(--err-text); }
  .badge-info { background: var(--info-bg); color: var(--info-text); }
  .result-sub { font-size: 13px; color: var(--text-muted); }
  .summary { background: var(--bg); border-radius: var(--radius); padding: 10px 14px; font-size: 14px; line-height: 1.7; margin-bottom: 12px; }
  .issue { border: 1px solid var(--border); border-radius: var(--radius); padding: 12px 14px; margin-bottom: 8px; }
  .issue:last-child { margin-bottom: 0; }
  .issue-title { font-size: 14px; font-weight: 600; margin-bottom: 8px; }
  .ev-label { font-size: 10px; font-weight: 700; color: var(--text-faint); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 4px; }
  .ev-box { font-size: 13px; background: var(--bg); border-radius: var(--radius); padding: 8px 10px; line-height: 1.6; margin-bottom: 8px; }
  .calc { font-family: 'Courier New', monospace; font-size: 12px; background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius); padding: 8px 12px; line-height: 1.8; margin-bottom: 8px; white-space: pre-wrap; }
  .suggest-err { font-size: 13px; color: var(--err-text); font-weight: 500; margin-bottom: 8px; }
  .suggest-ok { font-size: 13px; color: var(--ok-text); font-weight: 500; margin-bottom: 8px; }
  .refs { margin-top: 8px; }
  .refs-label { font-size: 10px; font-weight: 700; color: var(--text-faint); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 6px; }
  .ref-link { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; color: var(--ref-text); background: var(--ref-bg); border: 1px solid var(--ref-border); border-radius: var(--radius); padding: 4px 10px; margin: 0 4px 4px 0; text-decoration: none; transition: background 0.15s; }
  .ref-link:hover { background: var(--ref-border); }
  .ref-source { font-size: 10px; opacity: 0.7; }
  .url-item { border: 1px solid var(--border); border-radius: var(--radius); padding: 10px 12px; margin-bottom: 8px; }
  .url-top { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 6px; }
  .dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
  .dot-ok { background: #3a9a20; } .dot-warn { background: #d4900a; } .dot-err { background: #cc2f2f; }
  .url-text { font-size: 13px; word-break: break-all; flex: 1; }
  .url-reason { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
  .url-ev { margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border); }
  .spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; vertical-align: middle; margin-right: 6px; }
  @keyframes spin { to { transform: rotate(360deg); } }
  footer { text-align: center; padding: 2rem; font-size: 12px; color: var(--text-faint); }
</style>
</head>
<body>
<header><div class="logo">事実確認チェッカー <span>Powered by Claude AI</span></div></header>
<div class="main">
  <div class="tabs">
    <button class="tab active" onclick="switchTab('text')">テキスト事実確認</button>
    <button class="tab" onclick="switchTab('url')">URLリンク切れチェック</button>
    <button class="tab" onclick="switchTab('data')">数値・データ整合性</button>
  </div>

  <div class="panel active" id="panel-text">
    <div class="card">
      <label>チェックしたいテキスト・文章</label>
      <textarea id="text-input" placeholder="例：5月2日（日）水戸ホーリーホック戦では..."></textarea>
      <label style="margin-top:12px;">チェックの観点（任意）</label>
      <input type="text" id="text-focus" placeholder="例：曜日の正確性、数値の矛盾、選手情報など">
    </div>
    <button class="btn-check" id="btn-text" onclick="checkText()">AIでチェックする（根拠＋参照リンク付き）</button>
    <div class="result" id="result-text"></div>
  </div>

  <div class="panel" id="panel-url">
    <div class="card">
      <label>チェックしたいURLを追加</label>
      <div class="row">
        <input type="text" id="url-input" placeholder="https://example.com/page" onkeydown="if(event.key==='Enter')addUrl()">
        <button class="btn-add" onclick="addUrl()">追加</button>
      </div>
      <p class="hint">改行区切りで複数まとめて貼り付けも可</p>
      <div id="url-chips" class="chips"></div>
    </div>
    <button class="btn-check" id="btn-url" onclick="checkUrls()">AIで確認する（根拠＋参照リンク付き）</button>
    <div class="result" id="result-url"></div>
  </div>

  <div class="panel" id="panel-data">
    <div class="card">
      <label>チェックしたいデータ・数値を含む文章</label>
      <textarea id="data-input" placeholder="例：全36種（33選手＋マリノス君・マリノスケ・マリン）&#10;封入割合：特賞2%、A賞15%、B賞21%、C賞25%、D賞37%"></textarea>
      <label style="margin-top:12px;">チェックの観点（任意）</label>
      <input type="text" id="data-focus" placeholder="例：合計値の整合性、割合の正確さなど">
    </div>
    <button class="btn-check" id="btn-data" onclick="checkData()">AIで整合性チェック（根拠＋参照リンク付き）</button>
    <div class="result" id="result-data"></div>
  </div>
</div>
<footer>Powered by Anthropic Claude API</footer>

<script>
const urlList = [];
function switchTab(id) {
  ['text','url','data'].forEach((t,i) => document.querySelectorAll('.tab')[i].classList.toggle('active', t===id));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel-'+id).classList.add('active');
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
  b.innerHTML = on ? '<span class="spinner"></span>チェック中...' : label;
}
async function callAPI(system, user, webSearch) {
  const body = { model: 'claude-sonnet-4-20250514', max_tokens: 1000, system, messages: [{role:'user',content:user}] };
  if (webSearch) body.tools = [{type:'web_search_20250305',name:'web_search'}];
  const res = await fetch('/api', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
  if (!res.ok) throw new Error('API error: ' + res.status);
  const data = await res.json();
  return data.content.map(b => b.type==='text' ? b.text : '').join('');
}
function renderRefs(refs) {
  if (!refs || !refs.length) return '';
  return '<div class="refs"><div class="refs-label">参照・確認先</div><div>'+
    refs.map(r => '<a class="ref-link" href="'+esc(r.url)+'" target="_blank" rel="noopener">'+esc(r.label)+'<span class="ref-source"> — '+esc(r.source)+'</span></a>').join('')+
  '</div></div>';
}
async function checkText() {
  const text = document.getElementById('text-input').value.trim(); if (!text) return;
  const focus = document.getElementById('text-focus').value.trim();
  const label = 'AIでチェックする（根拠＋参照リンク付き）';
  setLoading('btn-text', true, label);
  document.getElementById('result-text').innerHTML = '';
  try {
    const sys = 'あなたはサイト運用の事実確認専門家です。テキストを厳密にチェックし、各指摘に対して根拠・修正提案・社会的信頼性の高い参照リンク（政府機関・公式サイト・業界団体等）をセットで提示してください。JSON形式のみで回答。';
    const prompt = 'チェック観点：'+(focus||'曜日・日付の正確性、数値の矛盾、選手情報、誇張表現、論理的矛盾')+'\n\nテキスト：\n'+text+'\n\n以下のJSON形式のみで回答：\n{"verdict":"問題なし|要注意|問題あり","summary":"全体評価1〜2文","issues":[{"point":"指摘内容","evidence":"根拠","suggestion":"修正提案","refs":[{"label":"ページ名","url":"https://...","source":"運営元"}]}]}';
    const raw = await callAPI(sys, prompt, true);
    let p; try { p = JSON.parse(raw.replace(/\`\`\`json|\`\`\`/g,'').trim()); } catch { p = {verdict:'要注意',summary:raw,issues:[]}; }
    const bc = p.verdict==='問題あり'?'badge-err':p.verdict==='要注意'?'badge-warn':'badge-ok';
    const ih = (p.issues||[]).map(it =>
      '<div class="issue"><div class="issue-title">'+esc(it.point||'')+'</div>'+
      '<div class="ev-label">根拠</div><div class="calc">'+esc(it.evidence||'')+'</div>'+
      '<div class="ev-label">修正提案</div><div class="'+(it.suggestion||'').includes('不要')?'suggest-ok':'suggest-err'+'">'+esc(it.suggestion||'')+'</div>'+
      renderRefs(it.refs)+'</div>').join('');
    document.getElementById('result-text').innerHTML =
      '<div class="result-card"><div class="result-head"><span class="badge '+bc+'">'+esc(p.verdict||'')+'</span><span class="result-sub">テキスト事実確認の結果</span></div>'+
      '<div class="summary">'+esc(p.summary||'')+'</div>'+ih+'</div>';
  } catch(e) {
    document.getElementById('result-text').innerHTML = '<div class="result-card"><p style="color:var(--err-text);font-size:14px;">エラー：'+esc(e.message)+'</p></div>';
  }
  setLoading('btn-text', false, label);
}
async function checkUrls() {
  if (!urlList.length) return;
  const label = 'AIで確認する（根拠＋参照リンク付き）';
  setLoading('btn-url', true, label);
  document.getElementById('result-url').innerHTML = '';
  try {
    const sys = 'URLの状態を分析する専門家です。各URLの判定理由・根拠・推奨対応を日本語で示し、信頼性確認に役立つ公式サイトリンクも提示してください。';
    const prompt = '以下のURLを分析してください：\n'+urlList.map((u,i)=>(i+1)+'. '+u).join('\n')+'\n\nJSON形式のみで回答：\n[{"url":"URL","status":"ok|warn|error","reason":"判定理由30字以内","evidence":"具体的分析","recommendation":"推奨対応","refs":[{"label":"サイト名","url":"https://...","source":"運営元"}]}]';
    const raw = await callAPI(sys, prompt, false);
    let items; try { items = JSON.parse(raw.replace(/\`\`\`json|\`\`\`/g,'').trim()); } catch { items = urlList.map(u=>({url:u,status:'warn',reason:'解析失敗',evidence:'',recommendation:'',refs:[]})); }
    const ec = items.filter(i=>i.status==='error').length, wc = items.filter(i=>i.status==='warn').length;
    document.getElementById('result-url').innerHTML =
      '<div class="result-card"><div class="result-head"><span class="badge badge-info">チェック完了</span><span class="result-sub">'+items.length+'件確認・問題'+ec+'件・要注意'+wc+'件</span></div>'+
      items.map(it =>
        '<div class="url-item"><div class="url-top"><div class="dot dot-'+(it.status==='ok'?'ok':it.status==='error'?'err':'warn')+'"></div>'+
        '<div style="flex:1;"><div class="url-text">'+esc(it.url)+'</div><div class="url-reason">'+esc(it.reason||'')+'</div></div>'+
        '<span class="badge '+(it.status==='ok'?'badge-ok':it.status==='error'?'badge-err':'badge-warn')+'">'+(it.status==='ok'?'正常':it.status==='error'?'問題':'要注意')+'</span></div>'+
        '<div class="url-ev"><div class="ev-label">根拠・分析</div><div class="ev-box">'+esc(it.evidence||'')+'</div>'+
        (it.recommendation?'<div class="ev-label">推奨対応</div><div class="ev-box">'+esc(it.recommendation)+'</div>':'')+
        renderRefs(it.refs)+'</div></div>').join('')+'</div>';
  } catch(e) {
    document.getElementById('result-url').innerHTML = '<div class="result-card"><p style="color:var(--err-text);font-size:14px;">エラー：'+esc(e.message)+'</p></div>';
  }
  setLoading('btn-url', false, label);
}
async function checkData() {
  const text = document.getElementById('data-input').value.trim(); if (!text) return;
  const focus = document.getElementById('data-focus').value.trim();
  const label = 'AIで整合性チェック（根拠＋参照リンク付き）';
  setLoading('btn-data', true, label);
  document.getElementById('result-data').innerHTML = '';
  try {
    const sys = '数値・データの整合性チェック専門家です。問題を指摘する際は実際の計算式・正しい値を示し、裏付けとなる信頼性の高い参照先も提示してください。';
    const prompt = 'チェック観点：'+(focus||'合計値の整合性、割合・パーセントの正確さ、前後比較の矛盾、単位の一貫性')+'\n\nデータ：\n'+text+'\n\nJSON形式のみで回答：\n{"verdict":"整合性OK|要確認|整合性エラーあり","summary":"全体評価1〜2文","issues":[{"point":"指摘内容","calculation":"計算式","correct_value":"正しい値","current_value":"現在の値","suggestion":"修正提案","refs":[{"label":"サイト名","url":"https://...","source":"運営元"}]}]}';
    const raw = await callAPI(sys, prompt, true);
    let p; try { p = JSON.parse(raw.replace(/\`\`\`json|\`\`\`/g,'').trim()); } catch { p = {verdict:'要確認',summary:raw,issues:[]}; }
    const bc = p.verdict==='整合性エラーあり'?'badge-err':p.verdict==='要確認'?'badge-warn':'badge-ok';
    const ih = (p.issues||[]).map(it =>
      '<div class="issue"><div class="issue-title">'+esc(it.point||'')+'</div>'+
      '<div class="ev-label">計算根拠</div><div class="calc">'+esc(it.calculation||'')+'\n現在：'+esc(String(it.current_value||''))+' → 正しい値：'+esc(String(it.correct_value||''))+'</div>'+
      '<div class="ev-label">修正提案</div><div class="'+((it.suggestion||'').includes('不要')||(it.suggestion||'').includes('正確')?'suggest-ok':'suggest-err')+'">'+esc(it.suggestion||'')+'</div>'+
      renderRefs(it.refs)+'</div>').join('');
    document.getElementById('result-data').innerHTML =
      '<div class="result-card"><div class="result-head"><span class="badge '+bc+'">'+esc(p.verdict||'')+'</span><span class="result-sub">数値・データ整合性チェックの結果</span></div>'+
      '<div class="summary">'+esc(p.summary||'')+'</div>'+(ih||'<div style="font-size:13px;color:var(--text-muted);">問題は検出されませんでした。</div>')+'</div>';
  } catch(e) {
    document.getElementById('result-data').innerHTML = '<div class="result-card"><p style="color:var(--err-text);font-size:14px;">エラー：'+esc(e.message)+'</p></div>';
  }
  setLoading('btn-data', false, label);
}
function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
</script>
</body>
</html>`;

export default async function handler(req, res) {
  // GETリクエスト → HTMLを返す
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(HTML);
  }

  // POSTリクエスト → Anthropic APIへ転送
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
