param(
  [string]$OutputPath = (Join-Path (Split-Path -Parent $PSScriptRoot) "Flippermizer Home Edition\docs\deep-run-task-quiz.html")
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$dataRoot = Join-Path $projectRoot "apworld\manual_flippermizerworldsofpinball_base_game\data"
$poolPath = Join-Path $dataRoot "deep_run_task_pools.json"

function Get-NormalizedKey([string]$Value) {
  if ($null -eq $Value) { $Value = "" }
  return ([regex]::Replace($Value.ToLowerInvariant(), "[^a-z0-9]+", "")).Trim()
}

function Get-DuplicateValues([object[]]$Values) {
  return @($Values | Group-Object | Where-Object { $_.Count -gt 1 } | ForEach-Object Name)
}

$taskPools = Get-Content -Raw -LiteralPath $poolPath | ConvertFrom-Json

$difficultyOrder = @("Easy", "Medium", "Hard")
$questionsByTable = @()
foreach ($poolProperty in @($taskPools.PSObject.Properties | Sort-Object Name)) {
  $tableName = [string]$poolProperty.Name

  $tableQuestions = @()
  $taskNumber = 0
  foreach ($difficulty in $difficultyOrder) {
    $tasks = @($poolProperty.Value.PSObject.Properties[$difficulty].Value)
    foreach ($task in $tasks) {
      $taskNumber++
      $tableQuestions += [ordered]@{
        id = "$(Get-NormalizedKey $tableName)-task-$('{0:d2}' -f $taskNumber)"
        type = "task"
        table = $tableName
        order = $taskNumber
        title = [string]$task.title
        explanation = [string]$task.explanation
        sourceLocation = [string]$task.source_location
        objectiveFamily = [string]$task.objective_family
        suggestedDifficulty = $difficulty
        confidence = $task.confidence_score
      }
    }
  }
  if ($taskNumber -ne 10) { throw "'$tableName' has $taskNumber Deep Run tasks; expected 10" }

  $duplicateTitles = Get-DuplicateValues @($tableQuestions | ForEach-Object { Get-NormalizedKey $_.title })
  $duplicateFamilies = Get-DuplicateValues @($tableQuestions | ForEach-Object { Get-NormalizedKey $_.objectiveFamily })
  $questionsByTable += [ordered]@{
    name = $tableName
    questions = $tableQuestions
    audit = [ordered]@{
      taskCount = $tableQuestions.Count
      duplicateTaskTitles = $duplicateTitles
      duplicateObjectiveFamilies = $duplicateFamilies
    }
  }
}

$quizData = [ordered]@{
  format = "flippermizer-deep-run-task-quiz-v1"
  generatedAt = (Get-Date).ToUniversalTime().ToString("o")
  source = [ordered]@{
    taskPools = "apworld/manual_flippermizerworldsofpinball_base_game/data/deep_run_task_pools.json"
  }
  tables = $questionsByTable
}
$quizJson = $quizData | ConvertTo-Json -Depth 12 -Compress
$quizJson = $quizJson.Replace("</", "<\/")

$html = @'
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Flippermizer Deep Run Task Review</title>
<style>
  :root { color-scheme: dark; --bg:#101827; --panel:#1c2940; --line:#405272; --text:#f5f7fb; --muted:#afbdd4; --accent:#63dbb1; --warn:#ffc15c; --bad:#ff8491; }
  * { box-sizing:border-box; } body { margin:0; font:15px/1.45 system-ui,sans-serif; background:var(--bg); color:var(--text); }
  header { padding:20px max(20px,calc((100vw - 1240px)/2)); background:#15233a; border-bottom:1px solid var(--line); } h1 { margin:0; font-size:25px; } p { color:var(--muted); } button,select,input,textarea { font:inherit; } button { cursor:pointer; padding:8px 11px; border:1px solid var(--line); border-radius:7px; color:var(--text); background:#273a58; } button:hover { border-color:var(--accent); } button.primary { background:#17664f; border-color:#3bb88e; } button.active { outline:2px solid var(--accent); } main { display:grid; grid-template-columns:290px minmax(0,1fr); gap:18px; max-width:1240px; margin:0 auto; padding:18px; } aside,.card { background:var(--panel); border:1px solid var(--line); border-radius:10px; } aside { padding:12px; max-height:calc(100vh - 160px); overflow:auto; } .tableButton { display:flex; justify-content:space-between; width:100%; text-align:left; margin:4px 0; } .tableButton .count { color:var(--muted); font-size:12px; } .card { padding:22px; } .toolbar,.choices,.nav { display:flex; flex-wrap:wrap; gap:8px; align-items:center; } .toolbar { margin-top:14px; } .summary { margin:12px 0 0; } .progress { height:9px; border-radius:9px; overflow:hidden; background:#0c1422; margin:12px 0 18px; } .progress > div { height:100%; background:var(--accent); width:0; } .meta { color:var(--muted); font-size:13px; } .questionTitle { font-size:22px; margin:10px 0; } .tag { display:inline-block; padding:3px 7px; margin-right:5px; border:1px solid var(--line); border-radius:999px; color:var(--muted); font-size:12px; } .suggestion { color:var(--warn); } .choiceGroup { margin:20px 0; } .choiceGroup h3 { margin-bottom:8px; } textarea { display:block; width:100%; min-height:90px; resize:vertical; padding:9px; border:1px solid var(--line); border-radius:7px; background:#111c2e; color:var(--text); } .audit { padding:11px; border-left:3px solid var(--accent); background:#14263b; border-radius:4px; color:var(--muted); } .audit.issue { border-color:var(--bad); } .hidden { display:none; } dialog { max-width:760px; max-height:80vh; overflow:auto; color:var(--text); background:var(--panel); border:1px solid var(--line); border-radius:10px; } pre { white-space:pre-wrap; } @media(max-width:800px) { main { grid-template-columns:1fr; } aside { max-height:260px; } }
</style>
</head>
<body>
<header>
  <h1>Deep Run Task Review</h1>
  <p>Review the ten regular Deep Run tasks for every eligible table. Each answer is saved to your chosen local JSON file immediately.</p>
  <div class="toolbar">
    <button id="newFile" class="primary">Choose local review file</button>
    <button id="loadFile">Load review file</button>
    <button id="download">Download snapshot</button>
    <button id="auditButton">View duplicate audit</button>
    <span id="saveState" class="meta">No local review file chosen yet.</span>
  </div>
</header>
<main>
  <aside><strong>Tables</strong><div id="tableList"></div></aside>
  <section class="card">
    <div id="empty">Choose a table to begin.</div>
    <div id="quiz" class="hidden">
      <div id="tableHeading"></div>
      <div class="progress"><div id="progressFill"></div></div>
      <div id="questionMeta" class="meta"></div>
      <div id="questionTitle" class="questionTitle"></div>
      <div id="questionExplanation" class="meta"></div>
      <div id="audit" class="audit"></div>
      <div class="choiceGroup"><h3>Is this task easy, medium, or hard?</h3><div id="difficultyChoices" class="choices"></div></div>
      <div class="choiceGroup"><h3>Is it doable in the supported table?</h3><div id="doableChoices" class="choices"></div></div>
      <div class="choiceGroup"><label for="notes"><h3>Reviewer notes</h3></label><textarea id="notes" placeholder="Add rule, VPX-version, repeat, or feasibility notes."></textarea></div>
      <div class="nav"><button id="previous">Previous</button><button id="next" class="primary">Next</button></div>
    </div>
  </section>
</main>
<dialog id="auditDialog"><button id="closeAudit">Close</button><h2>Duplicate task audit</h2><div id="auditResults"></div></dialog>
<script>
const QUIZ_DATA = __QUIZ_DATA__;
const REVIEW_FORMAT = "flippermizer-deep-run-review-v1";
let review = { format: REVIEW_FORMAT, sourceGeneratedAt: QUIZ_DATA.generatedAt, startedAt: new Date().toISOString(), updatedAt: null, answers: {} };
let fileHandle = null, activeTable = 0, activeQuestion = 0;
const $ = id => document.getElementById(id);
const allQuestions = () => QUIZ_DATA.tables.flatMap(t => t.questions);
const answerFor = q => review.answers[q.id] || {};
function completed(table) { return table.questions.filter(q => { const a = answerFor(q); return a.difficulty && a.doable; }).length; }
function reviewSnapshot() { return JSON.stringify({ ...review, updatedAt: new Date().toISOString(), quiz: { generatedAt: QUIZ_DATA.generatedAt, tableCount: QUIZ_DATA.tables.length, questionCount: allQuestions().length } }, null, 2); }
async function persist() {
  review.updatedAt = new Date().toISOString(); localStorage.setItem(REVIEW_FORMAT, reviewSnapshot());
  if (!fileHandle) { $("saveState").textContent = "Saved in this browser. Choose a local review file for automatic file updates."; return; }
  try { const writable = await fileHandle.createWritable(); await writable.write(reviewSnapshot()); await writable.close(); $("saveState").textContent = `Saved locally at ${new Date().toLocaleTimeString()}.`; }
  catch (error) { $("saveState").textContent = `Local-file save failed: ${error.message}`; }
}
function choose(tableIndex, questionIndex=0) { activeTable=tableIndex; activeQuestion=Math.max(0,Math.min(questionIndex,QUIZ_DATA.tables[tableIndex].questions.length-1)); render(); }
function setAnswer(key,value) { const q=QUIZ_DATA.tables[activeTable].questions[activeQuestion]; const prior=answerFor(q); review.answers[q.id]={...prior,[key]:value,reviewedAt:new Date().toISOString()}; persist(); render(); }
function choiceButtons(container, values, selected, onClick) { container.innerHTML=""; values.forEach(value => { const b=document.createElement("button"); b.textContent=value; b.className=selected===value ? "active" : ""; b.onclick=()=>onClick(value); container.append(b); }); }
function renderTables() { $("tableList").innerHTML=""; QUIZ_DATA.tables.forEach((table,index) => { const b=document.createElement("button"); b.className="tableButton"+(index===activeTable?" active":""); b.innerHTML=`<span>${table.name}</span><span class="count">${completed(table)}/${table.questions.length}</span>`; b.onclick=()=>choose(index); $("tableList").append(b); }); }
function render() {
  renderTables(); $("empty").classList.add("hidden"); $("quiz").classList.remove("hidden");
  const table=QUIZ_DATA.tables[activeTable], q=table.questions[activeQuestion], a=answerFor(q), done=completed(table);
  $("tableHeading").innerHTML=`<strong>${table.name}</strong> <span class="meta">${done}/${table.questions.length} fully reviewed</span>`;
  $("progressFill").style.width=`${(done/table.questions.length)*100}%`;
  $("questionMeta").innerHTML=`<span class="tag">${q.type === "score" ? "Score" : "Task"}</span><span class="tag">${activeQuestion+1} of ${table.questions.length}</span><span class="suggestion">Suggested: ${q.suggestedDifficulty}${q.confidence < 1 ? ` (${Math.round(q.confidence*100)}% confidence)` : ""}</span>`;
  $("questionTitle").textContent=q.title; $("questionExplanation").textContent=q.explanation || "No explanation supplied.";
  const duplicateTitles=Array.isArray(table.audit.duplicateTaskTitles) ? table.audit.duplicateTaskTitles : []; const duplicateFamilies=Array.isArray(table.audit.duplicateObjectiveFamilies) ? table.audit.duplicateObjectiveFamilies : [];
  const duplicateTitle=duplicateTitles.includes((q.title||"").toLowerCase().replace(/[^a-z0-9]+/g,"")); const duplicateFamily=q.type==="task" && duplicateFamilies.includes((q.objectiveFamily||"").toLowerCase().replace(/[^a-z0-9]+/g,""));
  $("audit").className="audit"+(duplicateTitle||duplicateFamily?" issue":""); $("audit").textContent=duplicateTitle||duplicateFamily ? "Duplicate warning: this task shares a title or objective family with another task on this table." : "Duplicate audit: no repeated task title or objective family on this table.";
  choiceButtons($("difficultyChoices"),["Easy","Medium","Hard","Unclear"],a.difficulty,v=>setAnswer("difficulty",v)); choiceButtons($("doableChoices"),["Yes","No","Needs research"],a.doable,v=>setAnswer("doable",v));
  $("notes").value=a.notes||""; $("notes").onchange=e=>setAnswer("notes",e.target.value); $("previous").disabled=activeQuestion===0; $("next").textContent=activeQuestion===table.questions.length-1?"Next table":"Next";
}
$("previous").onclick=()=>choose(activeTable,activeQuestion-1); $("next").onclick=()=> activeQuestion===QUIZ_DATA.tables[activeTable].questions.length-1 ? choose((activeTable+1)%QUIZ_DATA.tables.length,0) : choose(activeTable,activeQuestion+1);
$("newFile").onclick=async()=>{ if(!window.showSaveFilePicker){ $("saveState").textContent="Your browser cannot update a local file directly; use Download snapshot instead."; return; } try { fileHandle=await window.showSaveFilePicker({suggestedName:"flippermizer-deep-run-review.json",types:[{description:"JSON",accept:{"application/json":[".json"]}}]}); await persist(); } catch(error) { if(error.name!=="AbortError") $("saveState").textContent=`Could not choose file: ${error.message}`; } };
$("loadFile").onclick=async()=>{ const input=document.createElement("input"); input.type="file"; input.accept="application/json"; input.onchange=async()=>{ const file=input.files[0]; if(!file)return; try { const loaded=JSON.parse(await file.text()); if(loaded.format!==REVIEW_FORMAT||typeof loaded.answers!=="object") throw new Error("Not a Deep Run review JSON file."); review=loaded; $("saveState").textContent=`Loaded ${file.name}. Choose a local review file to resume automatic updates.`; render(); } catch(error) { $("saveState").textContent=`Could not load file: ${error.message}`; } }; input.click(); };
$("download").onclick=()=>{ const url=URL.createObjectURL(new Blob([reviewSnapshot()],{type:"application/json"})); const a=document.createElement("a"); a.href=url;a.download="flippermizer-deep-run-review.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),0); };
$("auditButton").onclick=()=>{ $("auditResults").innerHTML=QUIZ_DATA.tables.map(t=>{ const titles=Array.isArray(t.audit.duplicateTaskTitles) ? t.audit.duplicateTaskTitles : []; const families=Array.isArray(t.audit.duplicateObjectiveFamilies) ? t.audit.duplicateObjectiveFamilies : []; const issues=[...titles,...families]; return `<p><strong>${t.name}</strong>: ${issues.length ? `needs review — ${issues.join(", ")}` : "no repeated task titles or objective families"}</p>`; }).join(""); $("auditDialog").showModal(); }; $("closeAudit").onclick=()=>$("auditDialog").close();
try { const saved=localStorage.getItem(REVIEW_FORMAT); if(saved){ const loaded=JSON.parse(saved); if(loaded.format===REVIEW_FORMAT) review=loaded; } } catch(_) {} render();
</script>
</body>
</html>
'@

$html = $html.Replace("__QUIZ_DATA__", $quizJson)
[System.IO.File]::WriteAllText($OutputPath, $html, [System.Text.UTF8Encoding]::new($false))
$questionCount = @($questionsByTable | ForEach-Object { $_.questions.Count } | Measure-Object -Sum).Sum
Write-Output "Built $OutputPath with $($questionsByTable.Count) tables and $questionCount review questions."
