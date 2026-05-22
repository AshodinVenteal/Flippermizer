const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const DEFAULT_TARGETS = [
  path.join(ROOT, "ap_multiworld_test", "world_source", "manual_flippermizerworldsofpinball_base_game", "data", "generic_check_pools.json"),
  path.join(ROOT, "ap_multiworld_test", "stream_regular_seed_work", "manual_flippermizerworldsofpinball_base_game", "data", "generic_check_pools.json")
];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const SMALL_WORDS = new Set(["a", "an", "and", "as", "at", "but", "by", "for", "from", "in", "into", "nor", "of", "on", "or", "per", "the", "to", "vs", "via", "with"]);
const PRESERVE_WORD_RE = /^(?:[A-Z0-9]+(?:[-/][A-Z0-9]+)+|[A-Z]{2,}|[a-z]?\d+[a-z%+]*|\d+[a-z%+]*|[A-Z]+!)$/;

function loadExplanations(){
  global.window = global;
  const source = fs.readFileSync(path.join(ROOT, "flippermizer_task_explanations.js"), "utf8");
  vm.runInThisContext(source, { filename: "flippermizer_task_explanations.js" });
  return global.FLPR_TASK_EXPLANATIONS;
}

function titleCaseWord(word, index, words){
  if(!word) return word;
  const lead = (word.match(/^[("'[]+/) || [""])[0];
  const trail = (word.match(/[)"'\],:;!?]+$/) || [""])[0];
  const core = word.slice(lead.length, word.length - trail.length);
  if(!core) return word;
  if(PRESERVE_WORD_RE.test(core)) return lead + core + trail;
  if(core.includes("-")){
    return lead + core.split("-").map((part, partIndex) => titleCaseWord(part, partIndex, [part])).join("-") + trail;
  }
  if(core.includes("/")){
    return lead + core.split("/").map((part, partIndex) => titleCaseWord(part, partIndex, [part])).join("/") + trail;
  }
  const lower = core.toLowerCase();
  if(index > 0 && index < words.length - 1 && SMALL_WORDS.has(lower)) return lead + lower + trail;
  return lead + lower.charAt(0).toUpperCase() + lower.slice(1) + trail;
}

function titleCaseTask(title, type){
  const raw = String(title || "").replace(/\s+/g, " ").trim();
  if(!raw || String(type || "").toLowerCase() === "score") return raw;
  return raw.split(" ").map(titleCaseWord).join(" ")
    .replace(/\b2x\b/g, "2x")
    .replace(/\b3x\b/g, "3x")
    .replace(/\b5x\b/g, "5x")
    .replace(/\bF-i-r-e\b/g, "F-I-R-E")
    .replace(/\bC-o-n-g-o\b/g, "C-O-N-G-O")
    .replace(/\bE-l-v-i-r-a\b/g, "E-L-V-I-R-A")
    .replace(/\bB-a-n-k\b/g, "B-A-N-K")
    .replace(/\bD-o-l-l-y\b/g, "D-O-L-L-Y")
    .replace(/\bA-b-c\b/g, "A-B-C")
    .replace(/\bG-l-o-b-e\b/g, "G-L-O-B-E")
    .replace(/\bT-n-t\b/g, "TNT")
    .replace(/\bTv\b/g, "TV")
    .replace(/\bCpu\b/g, "CPU")
    .replace(/\bUfo\b/g, "UFO")
    .replace(/\bVuk\b/g, "VUK");
}

function cleanTooltip(value){
  return String(value || "")
    .replace(/^How to Achieve:\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function guideTooltip(value){
  const body = cleanTooltip(value).replace(/^GUIDE:\s*/i, "").trim();
  return body ? `GUIDE: ${body}` : "";
}

function extractNoteText(value){
  const raw = String(value || "").trim();
  const match = raw.match(/(?:^|\n+)\s*NOTE:\s*([\s\S]+)$/i);
  if(!match) return "";
  return match[1]
    .replace(/\n\s*GUIDE:\s*[\s\S]*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function appendExistingNote(guide, current){
  const note = extractNoteText(current);
  if(!note) return guide;
  if(!guide) return `NOTE: ${note}`;
  return `${guide}\n\nNOTE: ${note}`;
}

function sourceNode(tableName, task){
  return {
    tableName,
    table: tableName,
    target_table: tableName,
    source_location: task.source_location || task.sourceLocation || "",
    sourceLocation: task.source_location || task.sourceLocation || "",
    full: task.source_location || `${tableName} - ${task.title || ""}`,
    location: task.source_location || `${tableName} - ${task.title || ""}`,
    genericEntry: task
  };
}

function resolveTooltip(exp, tableName, task){
  const title = String(task.title || "").trim();
  const meta = exp.resolveTaskExplanationMeta(title, sourceNode(tableName, task)) || {};
  const text = guideTooltip(meta.text || "");
  return { text, kind: String(meta.kind || "none") };
}

function normalizePools(targetPath, exp, options){
  const pools = JSON.parse(fs.readFileSync(targetPath, "utf8"));
  const stats = {
    titleUpdates: 0,
    tooltipUpdates: 0,
    keptExistingTooltips: 0,
    weakTooltipKinds: {},
    weakEntries: [],
    totalEntries: 0
  };
  for(const [tableName, difficulties] of Object.entries(pools)){
    if(!difficulties || typeof difficulties !== "object") continue;
    for(const difficulty of DIFFICULTIES){
      const entries = Array.isArray(difficulties[difficulty]) ? difficulties[difficulty] : [];
      for(const task of entries){
        if(!task || typeof task !== "object") continue;
        stats.totalEntries += 1;
        const type = String(task.type || "task").trim().toLowerCase();
        const currentTitle = String(task.title || "").trim();
        const nextTitle = titleCaseTask(currentTitle, type);
        if(nextTitle && nextTitle !== currentTitle){
          task.title = nextTitle;
          stats.titleUpdates += 1;
        }
        const previousExplanation = String(task.explanation || "");
        const resolved = resolveTooltip(exp, tableName, task);
        resolved.text = appendExistingNote(resolved.text, previousExplanation);
        if(resolved.kind === "fallback" || resolved.kind === "prefix" || resolved.kind === "none"){
          stats.weakTooltipKinds[resolved.kind] = (stats.weakTooltipKinds[resolved.kind] || 0) + 1;
          stats.weakEntries.push({
            table: tableName,
            difficulty,
            title: task.title || currentTitle,
            sourceLocation: task.source_location || "",
            resolverKind: resolved.kind,
            tooltip: resolved.text
          });
        }
        if(!resolved.text){
          stats.keptExistingTooltips += 1;
          task.explanation = cleanTooltip(task.explanation || "");
          continue;
        }
        const currentTooltip = cleanTooltip(previousExplanation);
        const shouldReplace = options.replaceExisting || !currentTooltip || /^(?:GUIDE|NOTE):/i.test(previousExplanation);
        if(shouldReplace && resolved.text !== currentTooltip){
          task.explanation = resolved.text;
          stats.tooltipUpdates += 1;
        }else if(currentTooltip !== String(task.explanation || "")){
          task.explanation = currentTooltip;
          stats.tooltipUpdates += 1;
        }else{
          stats.keptExistingTooltips += 1;
        }
      }
    }
  }
  fs.writeFileSync(targetPath, JSON.stringify(pools, null, 2) + "\n", "utf8");
  return stats;
}

function parseArgs(argv){
  const args = { targets: [], replaceExisting: true, report: "" };
  for(let i = 2; i < argv.length; i++){
    const arg = argv[i];
    if(arg === "--target"){
      args.targets.push(path.resolve(argv[++i]));
    }else if(arg === "--keep-existing"){
      args.replaceExisting = false;
    }else if(arg === "--replace-existing"){
      args.replaceExisting = true;
    }else if(arg === "--report"){
      args.report = path.resolve(argv[++i]);
    }
  }
  if(!args.targets.length) args.targets = DEFAULT_TARGETS;
  return args;
}

function main(){
  const args = parseArgs(process.argv);
  const exp = loadExplanations();
  const reports = [];
  for(const target of args.targets){
    const stats = normalizePools(target, exp, args);
    reports.push({
      target: path.relative(ROOT, target),
      titleUpdates: stats.titleUpdates,
      tooltipUpdates: stats.tooltipUpdates,
      keptExistingTooltips: stats.keptExistingTooltips,
      weakTooltipKinds: stats.weakTooltipKinds,
      weakEntries: stats.weakEntries
    });
    const rel = path.relative(ROOT, target);
    console.log(`${rel}: ${stats.titleUpdates} title update(s), ${stats.tooltipUpdates} tooltip update(s), ${stats.keptExistingTooltips} kept.`);
    const weak = Object.entries(stats.weakTooltipKinds).map(([key, count]) => `${key}=${count}`).join(", ");
    if(weak) console.log(`${rel}: weak resolver kinds ${weak}.`);
  }
  if(args.report){
    fs.writeFileSync(args.report, JSON.stringify({
      kind: "flippermizer_task_style_normalization_report",
      version: "1.0.0",
      generatedAt: new Date().toISOString(),
      reports
    }, null, 2) + "\n", "utf8");
    console.log(`Wrote ${path.relative(ROOT, args.report)}.`);
  }
}

main();
