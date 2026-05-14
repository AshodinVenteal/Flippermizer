(function(){
  "use strict";

  const SETTINGS_KEY = "flpr_standalone_original_controls_v1";
  const DEFAULT_SETTINGS = {
    controlsOffset: 0
  };

  function readSettings(){
    try{
      return { ...DEFAULT_SETTINGS, ...(JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}") || {}) };
    }catch(_){
      return { ...DEFAULT_SETTINGS };
    }
  }

  function saveSettings(settings){
    try{ localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings || DEFAULT_SETTINGS)); }catch(_){}
  }

  const standaloneSettings = readSettings();

  function clamp(value, min, max){
    const n = Number(value);
    if(!Number.isFinite(n)) return min;
    return Math.max(min, Math.min(max, Math.round(n)));
  }

  function readRootPx(name, fallback){
    try{
      const raw = getComputedStyle(document.documentElement).getPropertyValue(name);
      const value = Number.parseFloat(raw);
      if(Number.isFinite(value) && value > 0) return value;
    }catch(_){}
    return fallback;
  }

  function playClick(){
    try{ if(typeof playSfx === "function") playSfx("click"); }catch(_){}
  }

  function setText(id, text){
    const node = document.getElementById(id);
    if(node) node.textContent = String(text ?? "");
  }

  function injectStandaloneStyles(){
    if(document.getElementById("flprStandaloneOriginalStyles")) return;
    const style = document.createElement("style");
    style.id = "flprStandaloneOriginalStyles";
    style.textContent = `
      html.flprStandaloneWindowClient,
      html.flprStandaloneWindowClient body{
        width:calc(var(--captureW) + var(--bonusLeaderboardW) + var(--controlsW) + var(--gutter) + 32px) !important;
        height:var(--captureH) !important;
        overflow:hidden !important;
      }
      body.flprStandaloneOriginalClient{
        position:relative !important;
        background:linear-gradient(180deg,var(--bg1),var(--bg2)) !important;
      }
      body.flprStandaloneOriginalClient .stage{
        transform:none !important;
        transform-origin:top left !important;
      }
      body.flprStandaloneOriginalClient,
      body.flprStandaloneOriginalClient *{
        cursor:auto !important;
      }
      body.flprStandaloneOriginalClient button,
      body.flprStandaloneOriginalClient label,
      body.flprStandaloneOriginalClient .tab,
      body.flprStandaloneOriginalClient .world,
      body.flprStandaloneOriginalClient .tile,
      body.flprStandaloneOriginalClient .nodeBtn,
      body.flprStandaloneOriginalClient .achTinyBtn{
        cursor:pointer !important;
      }
      body.flprStandaloneOriginalClient .controlsBody{
        overflow:hidden !important;
        pointer-events:auto !important;
        position:relative !important;
        z-index:20 !important;
      }
      body.flprStandaloneOriginalClient .controlsPanels,
      body.flprStandaloneOriginalClient .controlsTabPanel{
        min-height:0 !important;
        pointer-events:auto !important;
        position:relative !important;
        z-index:25 !important;
      }
      body.flprStandaloneOriginalClient .controlsTabPanel.active{
        display:block !important;
      }
      body.flprStandaloneOriginalClient .controlsTabPanel[data-ctrl-panel="testing"]{
        display:none !important;
      }
      body.flprStandaloneOriginalClient .bossDock{
        --bkIdleOpacity:1 !important;
      }
      body.flprStandaloneOriginalClient .bossKeyCard,
      body.flprStandaloneOriginalClient .bossDock.hoverFade .bossKeyCard:not(.fxReveal),
      body.flprStandaloneOriginalClient .bossDock.redeemFade .bossKeyCard:not(.fxReveal){
        opacity:1 !important;
        transition:
          transform .18s ease,
          box-shadow .18s ease,
          border-color .18s ease,
          filter .18s ease !important;
      }
      body.flprStandaloneOriginalClient .controlsTabs{
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
      }
      body.flprStandaloneOriginalClient .controlsHead,
      body.flprStandaloneOriginalClient .controlsHeadTitle{
        font-size:calc(10px * var(--flprStandaloneControlFontScale)) !important;
        line-height:1.15 !important;
      }
      body.flprStandaloneOriginalClient .controlsTabBtn{
        min-height:calc(34px * var(--flprStandaloneControlFontScale)) !important;
        padding:calc(5px * var(--flprStandaloneControlFontScale)) calc(4px * var(--flprStandaloneControlFontScale)) !important;
        font-size:calc(8px * var(--flprStandaloneControlFontScale)) !important;
        line-height:1.18 !important;
        white-space:normal !important;
      }
      body.flprStandaloneOriginalClient .connectCompactLayout{
        height:100% !important;
        min-height:0 !important;
        display:grid !important;
        pointer-events:auto !important;
        position:relative !important;
        z-index:30 !important;
        grid-template-columns:minmax(360px, .92fr) minmax(380px, 1.08fr) !important;
        grid-template-rows:auto minmax(0, 1fr) !important;
        gap:10px !important;
      }
      body.flprStandaloneOriginalClient .connectCol{
        min-height:0 !important;
        overflow:auto !important;
        display:flex !important;
        flex-direction:column !important;
        pointer-events:auto !important;
        position:relative !important;
        z-index:35 !important;
      }
      body.flprStandaloneOriginalClient .controlsLayoutTools,
      body.flprStandaloneOriginalClient .flprControlsWidthHandle,
      body.flprStandaloneOriginalClient .flprControlsColumnHandle,
      body.flprStandaloneOriginalClient .flprControlResizeEdge,
      body.flprStandaloneOriginalClient .bonusPinballGapHandle{
        display:none !important;
        pointer-events:none !important;
      }
      body.flprStandaloneOriginalClient .standaloneArchipelagoSection{
        grid-column:1 / -1 !important;
        margin-bottom:0 !important;
      }
      body.flprStandaloneOriginalClient .standaloneArchipelagoSection .apSettingsGrid{
        grid-template-columns:minmax(220px, 1.25fr) minmax(160px, .8fr) minmax(220px, 1fr) minmax(160px, .8fr) !important;
      }
      body.flprStandaloneOriginalClient .standaloneArchipelagoFooter{
        display:grid !important;
        grid-template-columns:minmax(0, 1fr) auto !important;
        gap:calc(4px * var(--flprStandaloneControlFontScale)) !important;
        align-items:center !important;
      }
      body.flprStandaloneOriginalClient .standaloneArchipelagoFooter .connectActionRow{
        justify-content:flex-end !important;
      }
      body.flprStandaloneOriginalClient .standaloneSecondaryStack,
      body.flprStandaloneOriginalClient .standaloneLogStack{
        gap:10px !important;
      }
      body.flprStandaloneOriginalClient .standaloneSecondaryStack .standaloneControlSection,
      body.flprStandaloneOriginalClient .standaloneLogStack .standaloneControlSection{
        margin-bottom:0 !important;
      }
      body.flprStandaloneOriginalClient .standaloneControlSection.grow{
        flex:1 1 auto !important;
        min-height:0 !important;
      }
      body.flprStandaloneOriginalClient .standaloneLogStack .standaloneControlSection.grow{
        height:100% !important;
      }
      body.flprStandaloneOriginalClient .connectPanelSection,
      body.flprStandaloneOriginalClient .standaloneControlSection{
        display:flex !important;
        flex-direction:column !important;
        gap:calc(4px * var(--flprStandaloneControlFontScale)) !important;
        margin-bottom:10px !important;
        padding:calc(5px * var(--flprStandaloneControlFontScale)) !important;
        border:1px solid rgba(0,166,255,.30) !important;
        border-radius:16px !important;
        background:
          linear-gradient(180deg, rgba(5,18,32,.96), rgba(3,10,18,.95)),
          radial-gradient(circle at 100% 0%, rgba(0,217,255,.08), transparent 48%) !important;
        box-shadow:0 0 0 1px rgba(0,217,255,.10) inset, 0 12px 24px rgba(0,0,0,.26) !important;
      }
      body.flprStandaloneOriginalClient .standaloneControlSection[data-accent="green"]{
        border-color:rgba(34,255,136,.32) !important;
      }
      body.flprStandaloneOriginalClient .standaloneControlSection[data-accent="gold"]{
        border-color:rgba(255,214,122,.34) !important;
      }
      body.flprStandaloneOriginalClient .standaloneControlSection[data-accent="red"]{
        border-color:rgba(255,108,136,.34) !important;
      }
      body.flprStandaloneOriginalClient .connectPanelSectionTitle,
      body.flprStandaloneOriginalClient .cSectionTitle,
      body.flprStandaloneOriginalClient .standaloneSectionTitle{
        display:flex !important;
        align-items:center !important;
        justify-content:space-between !important;
        gap:10px !important;
        margin:0 !important;
        padding-bottom:calc(3px * var(--flprStandaloneControlFontScale)) !important;
        border-bottom:1px solid rgba(160,214,255,.16) !important;
        color:rgba(230,248,255,.96) !important;
        font-size:calc(8px * var(--flprStandaloneControlFontScale)) !important;
        line-height:1.2 !important;
        letter-spacing:.06em !important;
      }
      body.flprStandaloneOriginalClient .standaloneSectionTitle .mini,
      body.flprStandaloneOriginalClient .connectPanelSectionTitle .mini{
        font-size:calc(5px * var(--flprStandaloneControlFontScale)) !important;
        color:rgba(188,220,236,.66) !important;
      }
      body.flprStandaloneOriginalClient .cLabel,
      body.flprStandaloneOriginalClient .cNote,
      body.flprStandaloneOriginalClient .apHint,
      body.flprStandaloneOriginalClient .countLbl,
      body.flprStandaloneOriginalClient .countVal,
      body.flprStandaloneOriginalClient .recvBody,
      body.flprStandaloneOriginalClient .recvRow,
      body.flprStandaloneOriginalClient .recvText,
      body.flprStandaloneOriginalClient .recvTime,
      body.flprStandaloneOriginalClient .apConnLogTitle,
      body.flprStandaloneOriginalClient .apConnLogBody,
      body.flprStandaloneOriginalClient .logRow{
        font-size:calc(7px * var(--flprStandaloneControlFontScale)) !important;
        line-height:1.35 !important;
      }
      body.flprStandaloneOriginalClient .cBtn,
      body.flprStandaloneOriginalClient .cFile,
      body.flprStandaloneOriginalClient .hpBtn,
      body.flprStandaloneOriginalClient .achTinyBtn,
      body.flprStandaloneOriginalClient .apLogTab{
        min-height:calc(28px * var(--flprStandaloneControlFontScale)) !important;
        padding:calc(4px * var(--flprStandaloneControlFontScale)) calc(5px * var(--flprStandaloneControlFontScale)) !important;
        font-size:calc(7px * var(--flprStandaloneControlFontScale)) !important;
        line-height:1.18 !important;
        white-space:normal !important;
      }
      body.flprStandaloneOriginalClient .cInput,
      body.flprStandaloneOriginalClient input,
      body.flprStandaloneOriginalClient select{
        min-height:calc(28px * var(--flprStandaloneControlFontScale)) !important;
        padding:calc(4px * var(--flprStandaloneControlFontScale)) !important;
        font-size:calc(7px * var(--flprStandaloneControlFontScale)) !important;
        line-height:1.2 !important;
      }
      body.flprStandaloneOriginalClient .apSettingsGrid,
      body.flprStandaloneOriginalClient .standaloneSettingsGrid{
        display:grid !important;
        grid-template-columns:repeat(2, minmax(0, 1fr)) !important;
        gap:calc(4px * var(--flprStandaloneControlFontScale)) !important;
      }
      body.flprStandaloneOriginalClient .cRow,
      body.flprStandaloneOriginalClient .connectActionRow{
        gap:calc(4px * var(--flprStandaloneControlFontScale)) !important;
        flex-wrap:wrap !important;
      }
      body.flprStandaloneOriginalClient .recvWrap,
      body.flprStandaloneOriginalClient .apConnLog{
        position:relative !important;
        isolation:isolate !important;
        pointer-events:auto !important;
        z-index:50 !important;
        max-height:none !important;
        min-height:220px !important;
        flex:1 1 auto !important;
        min-width:0 !important;
        overflow:hidden !important;
      }
      body.flprStandaloneOriginalClient .recvBody,
      body.flprStandaloneOriginalClient #apConnLogBody{
        max-height:none !important;
        min-height:160px !important;
      }
      body.flprStandaloneOriginalClient .apConnLogHead{
        position:relative !important;
        z-index:80 !important;
        pointer-events:auto !important;
        min-width:0 !important;
        gap:calc(3px * var(--flprStandaloneControlFontScale)) !important;
        flex-wrap:wrap !important;
        flex:0 0 auto !important;
      }
      body.flprStandaloneOriginalClient .apConnLogTitle,
      body.flprStandaloneOriginalClient .apConnLogTabs{
        min-width:0 !important;
        max-width:100% !important;
      }
      body.flprStandaloneOriginalClient .apConnLogTitle{
        font-size:calc(4.8px * var(--flprStandaloneControlFontScale)) !important;
        line-height:1.25 !important;
        overflow-wrap:anywhere !important;
        word-break:break-word !important;
      }
      body.flprStandaloneOriginalClient .apConnLogTabs{
        position:relative !important;
        z-index:90 !important;
        pointer-events:auto !important;
        display:flex !important;
        flex-wrap:wrap !important;
        gap:calc(2px * var(--flprStandaloneControlFontScale)) !important;
      }
      body.flprStandaloneOriginalClient .apLogTab{
        position:relative !important;
        z-index:100 !important;
        pointer-events:auto !important;
        flex:1 1 92px !important;
        min-width:0 !important;
      }
      body.flprStandaloneOriginalClient .apClientSayWrap{
        position:relative !important;
        z-index:80 !important;
        pointer-events:auto !important;
        flex:0 0 auto !important;
        border-top:1px solid rgba(0,166,255,.28) !important;
        background:rgba(0,166,255,.04) !important;
      }
      body.flprStandaloneOriginalClient .apClientSayRow{
        display:grid !important;
        grid-template-columns:minmax(0, 1fr) auto !important;
        gap:calc(4px * var(--flprStandaloneControlFontScale)) !important;
        align-items:center !important;
        padding:calc(5px * var(--flprStandaloneControlFontScale)) !important;
      }
      body.flprStandaloneOriginalClient .apClientSayInput{
        position:relative !important;
        z-index:90 !important;
        pointer-events:auto !important;
        width:100% !important;
        min-width:0 !important;
      }
      body.flprStandaloneOriginalClient .apClientSayBtn{
        position:relative !important;
        z-index:100 !important;
        pointer-events:auto !important;
        min-width:calc(70px * var(--flprStandaloneControlFontScale)) !important;
        white-space:nowrap !important;
      }
      body.flprStandaloneOriginalClient .apClientSayHint{
        padding:0 calc(5px * var(--flprStandaloneControlFontScale)) calc(5px * var(--flprStandaloneControlFontScale)) !important;
        font-size:calc(4.6px * var(--flprStandaloneControlFontScale)) !important;
        line-height:1.35 !important;
      }
      body.flprStandaloneOriginalClient #apConnLogBody{
        position:relative !important;
        z-index:60 !important;
        flex:1 1 auto !important;
        min-height:0 !important;
        pointer-events:auto !important;
        width:100% !important;
        max-width:100% !important;
        overflow:auto !important;
        white-space:pre-wrap !important;
        overflow-wrap:anywhere !important;
        word-break:break-word !important;
        font-size:calc(4.6px * var(--flprStandaloneControlFontScale)) !important;
        line-height:1.36 !important;
      }
      body.flprStandaloneOriginalClient .apConnLog *,
      body.flprStandaloneOriginalClient .standaloneLogStack *,
      body.flprStandaloneOriginalClient .standaloneArchipelagoSection *,
      body.flprStandaloneOriginalClient .standaloneSecondaryStack *{
        pointer-events:auto !important;
      }
      body.flprStandaloneOriginalClient .standaloneSliderRow{
        display:grid !important;
        grid-template-columns:minmax(0, 1fr) minmax(180px, 1.2fr) auto !important;
        gap:calc(4px * var(--flprStandaloneControlFontScale)) !important;
        align-items:center !important;
        padding:calc(3px * var(--flprStandaloneControlFontScale)) !important;
        border:1px solid rgba(0,217,255,.18) !important;
        border-radius:12px !important;
        background:rgba(0,0,0,.20) !important;
      }
      body.flprStandaloneOriginalClient .standaloneSliderRow input[type="range"]{
        width:100% !important;
        min-height:auto !important;
        accent-color:var(--cyan) !important;
      }
      body.flprStandaloneOriginalClient .standaloneTextSizeDock{
        flex:0 0 auto !important;
        position:sticky !important;
        bottom:0 !important;
        z-index:5 !important;
        gap:8px !important;
        margin:10px 2px 0 !important;
        padding:10px !important;
        border-radius:14px !important;
        background:
          linear-gradient(180deg, rgba(5,18,32,.98), rgba(3,10,18,.98)),
          radial-gradient(circle at 100% 0%, rgba(0,217,255,.12), transparent 48%) !important;
        box-shadow:0 -12px 22px rgba(0,0,0,.24), 0 0 0 1px rgba(0,217,255,.12) inset !important;
      }
      body.flprStandaloneOriginalClient .standaloneTextSizeDock .standaloneSectionTitle{
        gap:8px !important;
        padding-bottom:6px !important;
        font-size:9px !important;
        line-height:1.2 !important;
      }
      body.flprStandaloneOriginalClient .standaloneTextSizeDock .standaloneSectionTitle .mini{
        font-size:7px !important;
        line-height:1.2 !important;
      }
      body.flprStandaloneOriginalClient .standaloneTextSizeDock .standaloneSliderRow{
        grid-template-columns:minmax(100px, .8fr) minmax(180px, 1.4fr) 42px !important;
        gap:8px !important;
        padding:8px !important;
      }
      body.flprStandaloneOriginalClient .standaloneTextSizeDock .cLabel,
      body.flprStandaloneOriginalClient .standaloneTextSizeDock .countVal{
        font-size:8px !important;
        line-height:1.25 !important;
      }
      body.flprStandaloneOriginalClient .standaloneTextSizeDock input[type="range"]{
        min-height:18px !important;
        padding:0 !important;
      }
      body.flprStandaloneOriginalClient .controlsTabPanel[data-ctrl-panel="visuals"]{
        height:100% !important;
        min-height:0 !important;
        overflow:auto !important;
      }
      body.flprStandaloneOriginalClient #achievementsControlsPanel,
      body.flprStandaloneOriginalClient #achievementsControlsPanel *{
        font-size:calc(7px * var(--flprStandaloneControlFontScale)) !important;
        line-height:1.25 !important;
      }
      body.flprStandaloneOriginalClient #achievementsControlsPanel .achCustomName,
      body.flprStandaloneOriginalClient #achievementsControlsPanel .ttl,
      body.flprStandaloneOriginalClient #achievementsControlsPanel .achCtlHd{
        font-size:calc(8px * var(--flprStandaloneControlFontScale)) !important;
      }
    `;
    document.head.appendChild(style);
  }

  function applyControlFontScale(){
    standaloneSettings.controlsOffset = clamp(standaloneSettings.controlsOffset, -50, 50);
    const scale = 3 * (1 + (standaloneSettings.controlsOffset / 100));
    document.body.style.setProperty("--flprStandaloneControlFontScale", scale.toFixed(3));
    const slider = document.getElementById("standaloneControlsFontSlider");
    if(slider) slider.value = String(standaloneSettings.controlsOffset);
    setText("standaloneControlsFontValue", `${standaloneSettings.controlsOffset > 0 ? "+" : ""}${standaloneSettings.controlsOffset}`);
  }

  function applyStandaloneWindowScale(){
    const root = document.documentElement;
    root.classList.add("flprStandaloneWindowClient");
    root.style.setProperty("--bonusLeaderboardW", "0px");
    const captureW = readRootPx("--captureW", 910);
    const gutter = readRootPx("--gutter", 16);
    const viewportW = window.innerWidth || document.documentElement.clientWidth || 0;
    const minControlsW = 880;
    const targetW = Math.max(captureW + minControlsW + gutter + 32, viewportW);
    const controlsW = Math.max(minControlsW, Math.round(targetW - captureW - gutter - 32));
    root.style.setProperty("--controlsW", `${controlsW}px`);
    root.style.removeProperty("--flprStandaloneBaseW");
    root.style.removeProperty("--flprStandaloneWindowScale");
  }

  function activeControlTab(){
    return document.querySelector(".controlsTabBtn.active")?.dataset?.ctrlTab || "connect";
  }

  function setControlTab(key){
    const wanted = key === "achievements" ? "achievements" : (key === "visuals" ? "visuals" : "connect");
    document.querySelectorAll(".controlsTabBtn").forEach((btn)=>{
      btn.classList.toggle("active", btn.dataset.ctrlTab === wanted);
    });
    document.querySelectorAll(".controlsTabPanel").forEach((panel)=>{
      const isWanted = panel.dataset.ctrlPanel === wanted;
      panel.classList.toggle("active", isWanted);
      if(panel.dataset.ctrlPanel === "testing"){
        panel.style.display = "none";
      }else{
        panel.style.display = isWanted ? "" : "none";
      }
    });
    try{ localStorage.setItem("flpr_controls_tab_v1", wanted); }catch(_){}
  }

  function apCfg(){
    try{
      if(typeof loadApCfg === "function") return loadApCfg();
    }catch(_){}
    try{
      if(typeof ap !== "undefined" && ap?.cfg) return ap.cfg;
    }catch(_){}
    return { server:"", player:"Ashodin", game:"", pass:"" };
  }

  const STANDALONE_SEED_NAME = "FLPR_STANDALONE_SINGLEPLAYER_SEED";
  const STANDALONE_SPOILER_SOURCE = "FLPR_Standalone_Singleplayer_Spoiler.txt";

  function standaloneNormalizeTableKey(value){
    try{
      const exp = window.FLPR_TASK_EXPLANATIONS;
      if(exp && typeof exp.normalizeTableKey === "function") return exp.normalizeTableKey(value);
    }catch(_){}
    return String(value || "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
  }

  function standaloneBundledTaskCatalog(){
    try{
      const getter = window.flprGetBundledTaskCatalog || window.FLPR_TASK_EXPLANATIONS?.getBundledTaskCatalog;
      if(typeof getter === "function") return getter();
    }catch(_){}
    return { byTable:{}, tables:[] };
  }

  function standaloneCatalogEntryForTable(tableName){
    const catalog = standaloneBundledTaskCatalog();
    const key = standaloneNormalizeTableKey(tableName);
    if(catalog?.byTable?.[key]) return catalog.byTable[key];
    try{
      const repo = window.FLPR_TABLE_REPO;
      const canonical = repo && typeof repo.getCanonicalTableName === "function" ? repo.getCanonicalTableName(tableName) : "";
      const cKey = standaloneNormalizeTableKey(canonical);
      if(cKey && catalog?.byTable?.[cKey]) return catalog.byTable[cKey];
    }catch(_){}
    return null;
  }

  function standaloneFormatScore(value){
    return `${Math.max(0, Math.round(Number(value) || 0)).toLocaleString("en-US")}+`;
  }

  function standaloneFallbackScores(tableIndex){
    const i = Math.max(0, Number(tableIndex) || 0);
    return {
      easy: [
        standaloneFormatScore(750000 + (i * 250000)),
        standaloneFormatScore(1250000 + (i * 325000))
      ],
      medium: [
        standaloneFormatScore(3500000 + (i * 650000)),
        standaloneFormatScore(6000000 + (i * 850000))
      ],
      hard: [
        standaloneFormatScore(10000000 + (i * 1100000)),
        standaloneFormatScore(18000000 + (i * 1500000))
      ]
    };
  }

  function standalonePick(list, tableIndex, offset, fallback){
    const pool = Array.isArray(list) ? list.map((v)=>String(v || "").trim()).filter(Boolean) : [];
    if(!pool.length) return fallback;
    const idx = Math.abs((Math.max(0, Number(tableIndex) || 0) * 7) + Number(offset || 0)) % pool.length;
    return pool[idx] || fallback;
  }

  function standaloneTaskExplanationFor(tableName, objective){
    const taskName = String(objective || "").trim();
    const targetTable = String(tableName || "").trim();
    if(!taskName) return "";
    try{
      const getter = window.flprGetTaskExplanationMeta || window.FLPR_TASK_EXPLANATIONS?.resolveTaskExplanationMeta;
      if(typeof getter === "function"){
        const meta = getter(taskName, {
          tableName: targetTable,
          table: targetTable,
          target_table: targetTable,
          full: targetTable ? `${targetTable} - ${taskName}` : taskName,
          location: targetTable ? `${targetTable} - ${taskName}` : taskName
        });
        return String(meta?.text || "").trim();
      }
    }catch(_){}
    return "";
  }

  function standaloneTaskSpecs(tableName, tableIndex){
    const entry = standaloneCatalogEntryForTable(tableName);
    const tasks = entry?.tasksByDifficulty || {};
    const scores = entry?.scoreTargets || standaloneFallbackScores(tableIndex);
    return [
      { name:standalonePick(tasks.easy, tableIndex, 0, "Make a Skill Shot"), difficulty:"easy", kind:"task" },
      { name:`Easy Score (${standalonePick(scores.easy, tableIndex, 1, standaloneFallbackScores(tableIndex).easy[0])})`, difficulty:"easy", kind:"score" },
      { name:standalonePick(tasks.medium, tableIndex, 2, "Start Multiball"), difficulty:"medium", kind:"task" },
      { name:`Medium Score (${standalonePick(scores.medium, tableIndex, 3, standaloneFallbackScores(tableIndex).medium[0])})`, difficulty:"medium", kind:"score" },
      { name:standalonePick(tasks.hard, tableIndex, 4, "Collect a Super Jackpot"), difficulty:"hard", kind:"task" },
      { name:`Hard Score (${standalonePick(scores.hard, tableIndex, 5, standaloneFallbackScores(tableIndex).hard[0])})`, difficulty:"hard", kind:"score" }
    ];
  }

  function standaloneBossTaskSpecs(){
    return [
      { name:"Rip a Spinner", difficulty:"easy", kind:"task" },
      { name:"Make a 2-Shot Combo", difficulty:"easy", kind:"task" },
      { name:"Make a 3-Shot Combo", difficulty:"medium", kind:"task" },
      { name:"Shoot Left Orbit/Loop/Lane", difficulty:"medium", kind:"task" },
      { name:"Shoot Right Orbit/Loop/Lane", difficulty:"medium", kind:"task" },
      { name:"Shoot Any Ramp", difficulty:"medium", kind:"task" },
      { name:"Hit Any Scoop or Saucer", difficulty:"hard", kind:"task" },
      { name:"Complete Top Lanes", difficulty:"hard", kind:"task" },
      { name:"Complete a Target Bank", difficulty:"hard", kind:"task" },
      { name:"Start Any Multiball", difficulty:"hard", kind:"task" },
      { name:"Obtain a score of 100,000+", difficulty:"easy", kind:"score" },
      { name:"Obtain a score of 250,000+", difficulty:"easy", kind:"score" },
      { name:"Obtain a score of 500,000+", difficulty:"medium", kind:"score" },
      { name:"Obtain a score of 1,000,000+", difficulty:"medium", kind:"score" },
      { name:"Obtain a score of 2,500,000+", difficulty:"medium", kind:"score" },
      { name:"Obtain a score of 5,000,000+", difficulty:"medium", kind:"score" },
      { name:"Obtain a score of 10,000,000+", difficulty:"hard", kind:"score" },
      { name:"Obtain a score of 25,000,000+", difficulty:"hard", kind:"score" },
      { name:"Obtain a score of 50,000,000+", difficulty:"hard", kind:"score" },
      { name:"Obtain a score of 100,000,000+", difficulty:"hard", kind:"score" },
      { name:"Boss Victory", difficulty:"hard", kind:"task" }
    ];
  }

  function standaloneCloneWorlds(){
    try{ if(typeof inherentCloneWorlds === "function") return inherentCloneWorlds(); }catch(_){}
    try{
      const repo = window.FLPR_TABLE_REPO;
      const worlds = repo && typeof repo.buildDefaultWorldsState === "function" ? JSON.parse(JSON.stringify(repo.buildDefaultWorldsState())) : {};
      Object.entries(worlds || {}).forEach(([wk, world])=>{
        if(!world || typeof world !== "object") return;
        world.locked = (wk === "boss");
        if(wk === "boss") world.tables = ["(Boss Table)"];
      });
      return worlds;
    }catch(_){}
    return {};
  }

  function standaloneSeedTables(worlds){
    try{ if(typeof inherentSeedTables === "function") return inherentSeedTables(worlds); }catch(_){}
    const out = [];
    Object.entries(worlds || {}).forEach(([wk, world])=>{
      if(!wk || wk === "boss") return;
      (Array.isArray(world?.tables) ? world.tables : []).forEach((tableName, idx)=>{
        const name = String(tableName || "").trim();
        if(name) out.push({ worldKey:wk, tableKey:`${wk}|${idx}`, tableName:name, index:out.length });
      });
    });
    return out.slice(0, 25);
  }

  function standalonePickStartingTables(tables, count){
    try{ if(typeof inherentPickStartingTables === "function") return inherentPickStartingTables(tables, count); }catch(_){}
    return (Array.isArray(tables) ? tables : []).filter(Boolean).slice(0, Math.max(1, Number(count) || 5));
  }

  function standaloneRewardFor(tableIndex, taskIndex, tableName, tables){
    const next = tables.length ? String(tables[(tableIndex + 1) % tables.length]?.tableName || tableName || "").trim() : String(tableName || "").trim();
    if(taskIndex === 0) return `Progressive Ball - ${next}`;
    if(taskIndex === 1) return (tableIndex % 3 === 0) ? "Hint Ball Location" : "Easy Junk Item";
    if(taskIndex === 2) return ([4, 12, 20].includes(tableIndex)) ? "Boss Key" : ((tableIndex % 4 === 1) ? "Hint Boss Key" : "Medium Junk Item");
    if(taskIndex === 3) return (tableIndex % 5 === 2) ? "Pinball Fragment" : "Hint Ball Location";
    if(taskIndex === 4) return (tableIndex % 7 === 3) ? "Boss Key" : `Progressive Ball - ${tableName}`;
    return (tableIndex % 6 === 0) ? "Medium Junk Item" : "Easy Junk Item";
  }

  function buildStandaloneSingleplayerSeedFixture(){
    const worlds = standaloneCloneWorlds();
    const tables = standaloneSeedTables(worlds);
    const startingTables = standalonePickStartingTables(tables, 5);
    const itemNameToId = {};
    const locNameToId = {};
    const locationItemByLocId = {};
    const entries = [];
    const byLocation = {};
    const spoilerLines = ["FLPR Standalone Singleplayer Spoiler", "", "Locations:"];
    let nextItemId = 910000;
    let nextLocId = 900000;
    const ensureItem = (name)=>{
      const key = String(name || "").trim() || "Nothing";
      if(!itemNameToId[key]) itemNameToId[key] = nextItemId++;
      return itemNameToId[key];
    };
    const addLocation = (tableName, task, itemName, tableIndex, taskIndex)=>{
      const objective = String(task?.name || "").trim();
      if(!tableName || !objective) return;
      const locationName = `${tableName} - ${objective}`;
      const locId = nextLocId++;
      const itemId = ensureItem(itemName);
      locNameToId[locationName] = locId;
      locationItemByLocId[locId] = { itemId, itemName, flags:0 };
      const entry = {
        location: locationName,
        table: tableName,
        target_table: tableName,
        source_table: tableName,
        source_location: locationName,
        difficulty: String(task?.difficulty || (taskIndex < 2 ? "easy" : (taskIndex < 4 ? "medium" : "hard"))),
        kind: String(task?.kind || (objective.toLowerCase().includes("score") ? "score" : "task")),
        task_type: String(task?.kind || (objective.toLowerCase().includes("score") ? "score" : "task")),
        objective,
        display_name: objective,
        title: objective,
        explanation: standaloneTaskExplanationFor(tableName, objective)
      };
      entries.push(entry);
      byLocation[locationName] = entry;
      spoilerLines.push(`${locationName}: ${itemName}`);
    };

    tables.forEach((table, tableIndex)=>{
      standaloneTaskSpecs(table.tableName, tableIndex).forEach((task, taskIndex)=>{
        addLocation(table.tableName, task, standaloneRewardFor(tableIndex, taskIndex, table.tableName, tables), tableIndex, taskIndex);
      });
    });

    standaloneBossTaskSpecs().forEach((task, taskIndex)=>{
      const itemName = task.name === "Boss Victory" ? "Victory" : "Boss Damage 16%";
      addLocation("Boss Table", task, itemName, tables.length, taskIndex);
    });

    spoilerLines.push("", "Playthrough:", "0: {}");
    return {
      worlds,
      tables,
      startingTables,
      itemNameToId,
      locNameToId,
      locationItemByLocId,
      spoilerText: spoilerLines.join("\n"),
      slotData: {
        seed_name: STANDALONE_SEED_NAME,
        boss_keys_required: 3,
        boss_keys_total: 3,
        traps_enabled: false,
        bonus_pinball_enabled: false,
        progressive_ball_starts: startingTables.map((table)=>({
          table: table.tableName,
          item: `Progressive Ball - ${table.tableName}`,
          count: 1
        })),
        generic_checks: { enabled:true, entries, by_location:byLocation },
        task_shuffle: { enabled:true, entries, by_location:byLocation }
      }
    };
  }

  async function loadStandaloneSingleplayerSeed(){
    const fixture = buildStandaloneSingleplayerSeedFixture();
    try{ if(typeof apDisconnect === "function") apDisconnect({ manual:false }); }catch(_){}
    window.__manualDisconnect = true;
    ap.inherentSeedActive = true;
    ap.connected = true;
    ap.seedName = STANDALONE_SEED_NAME;
    ap.cfg = { ...(ap.cfg || {}), player: ap.cfg?.player || "Ashodin", game: "Manual_FlippermizerBaseGame" };
    ap.checked = new Set();
    ap.pendingByLoc = new Map();
    ap.pendingQueue = [];
    ap.validCheckLocIds = new Set();
    ap.receivedSeen = new Set();
    ap.receivedByIndex = new Map();
    ap.receivedDeferred = [];
    ap.lastReceivedIndex = 0;
    try{ if(typeof clearReceivedFeedHistory === "function") clearReceivedFeedHistory({ render:false }); }catch(_){}

    state.worlds = fixture.worlds;
    state.worldOrder = Object.keys(fixture.worlds || {});
    state.layoutMode = "base";
    state.nowPlaying = {};
    state.balls = {};
    Object.entries(state.worlds || {}).forEach(([worldKey, world])=>{
      if(world && Array.isArray(world.tables) && !(typeof isBossWorldId === "function" && isBossWorldId(worldKey, state))) state.nowPlaying[worldKey] = 0;
    });
    try{ if(typeof seedApStartBaseline === "function") seedApStartBaseline(state, fixture.slotData); }catch(_){}
    (fixture.startingTables || []).forEach((table)=>{
      const idx = Number(String(table.tableKey || "").split("|")[1] || 0);
      if(Number.isFinite(idx)) state.nowPlaying[table.worldKey] = idx;
    });
    const firstStart = (fixture.startingTables || [])[0] || fixture.tables[0] || null;
    state.selected = firstStart?.worldKey || "w1";
    state.lastSelected = state.selected;
    state.bossTable = "";
    state.bossTableSeed = STANDALONE_SEED_NAME;
    state.bossVictorySent = false;
    state.bossVictoryPending = false;
    state.bossVictoryFinalizing = false;
    state.bossHpLive = { max:100, cur:100, name:"Boss Table", inited:false };
    state.bossHpTest = { ...(state.bossHpTest || {}), show:false, name:"Boss Table", cur:100, max:100, _pulse:0, forceShowCard:false };

    try{ if(typeof bossKeysConfigureCount === "function") bossKeysConfigureCount(3, { persist:false, inputs:true, render:false }); }catch(_){}
    try{
      if(Array.isArray(bossKeysState)) bossKeysState.forEach((key)=>{ if(key) key.acquired = false; });
      if(typeof bossKeysSyncLegacyMirror === "function") bossKeysSyncLegacyMirror(0);
      window.__apBossKeyCount = 0;
      window.__prevApBossKeyCount = 0;
      if(typeof bossKeysSave === "function") bossKeysSave();
    }catch(_){}
    try{ if(typeof setGenericCheckPayload === "function") setGenericCheckPayload(fixture.slotData); }catch(_){ ap.slotData = fixture.slotData; }
    try{ if(typeof inherentSeedPopulateLocationMaps === "function") inherentSeedPopulateLocationMaps(fixture); }catch(_){}
    ap.inherentLocationItems = new Map(Object.entries(fixture.locationItemByLocId || {}).map(([locId, reward])=>[Number(locId), reward]));
    try{ if(typeof relicBeginRun === "function") relicBeginRun(STANDALONE_SEED_NAME, "standalone-singleplayer"); }catch(_){}
    try{ if(typeof syncTableBannerCodeMapFromSlots === "function") syncTableBannerCodeMapFromSlots(state); if(typeof hydrateTableBannerSlotsFromCodeMap === "function") hydrateTableBannerSlotsFromCodeMap(state, { overwrite:true }); }catch(_){}
    try{ if(typeof saveState === "function") saveState(); }catch(_){}
    try{ if(typeof setApIndicator === "function") setApIndicator("green", "SINGLEPLAYER SEED"); }catch(_){}
    const hEl = document.getElementById("apConnectedHost");
    if(hEl) hEl.textContent = `SINGLEPLAYER; ${STANDALONE_SEED_NAME}`;
    try{ if(typeof updateApConnectButtons === "function") updateApConnectButtons("connected"); }catch(_){}
    try{ if(typeof flprStatsStartRun === "function") flprStatsStartRun(STANDALONE_SEED_NAME, "standalone-singleplayer"); }catch(_){}
    try{ if(typeof achBuildTableCatalogFromAp === "function") achBuildTableCatalogFromAp(); if(typeof achRecomputeProgress === "function") achRecomputeProgress(); if(typeof achSaveStore === "function") achSaveStore(); if(typeof renderAchievementsControlsPanel === "function") renderAchievementsControlsPanel(); }catch(_){}
    try{ if(typeof hintApplySpoilerText === "function") await hintApplySpoilerText(fixture.spoilerText, STANDALONE_SPOILER_SOURCE, { persist:true }); }catch(err){ try{ if(typeof hintLog === "function") hintLog(`Standalone spoiler load failed: ${err?.message || err}`); }catch(_){} }
    const startNames = (fixture.startingTables || []).map((table)=>table.tableName).join(", ");
    try{ if(typeof apLog === "function") apLog(`Standalone seed loaded; starts=${startNames || "none"}; locations=${Object.keys(fixture.locNameToId).length}; bundled task catalog=yes`); }catch(_){}
    try{ if(typeof renderAll === "function") renderAll(); if(typeof renderChecksWorldTabs === "function") renderChecksWorldTabs(); if(typeof renderChecks === "function") renderChecks(); if(typeof updateCountCheckUI === "function") updateCountCheckUI(); }catch(_){}
    try{ if(typeof showView === "function") showView("checks"); }catch(_){}
    try{ if(typeof toast === "function") toast("good", "SINGLEPLAYER SEED", `Loaded bundled tasks and scores for ${Math.max(0, fixture.tables.length)} tables.`, 4200); }catch(_){}
    return true;
  }

  function connectPanelHtml(cfg){
    return `
      <div class="connectCompactLayout flprStandaloneConnectLayout">
        <section class="standaloneControlSection standaloneArchipelagoSection" data-accent="gold">
          <div class="standaloneSectionTitle">ARCHIPELAGO <span class="mini">multiworld</span></div>
          <div class="apSettingsGrid">
            <div>
              <div class="cLabel">SERVER</div>
              <input class="cInput" id="apServer" autocomplete="off" placeholder="archipelago.gg:38281" value="${escapeAttr(cfg.server || "")}">
            </div>
            <div>
              <div class="cLabel">PLAYER</div>
              <input class="cInput" id="apPlayer" autocomplete="off" placeholder="Slot name" value="${escapeAttr(cfg.player || "Ashodin")}">
            </div>
            <div>
              <div class="cLabel">GAME</div>
              <input class="cInput" id="apGame" autocomplete="off" placeholder="Manual_FlippermizerBaseGame" value="${escapeAttr(cfg.game || "")}">
            </div>
            <div>
              <div class="cLabel">PASSWORD</div>
              <input class="cInput" id="apPass" type="password" autocomplete="off" placeholder="Optional" value="${escapeAttr(cfg.pass || "")}">
            </div>
          </div>
          <div class="standaloneArchipelagoFooter">
            <div class="apHint" id="apConnectedHost">CONNECTED; -</div>
            <div class="cRow connectActionRow">
              <button class="cBtn" id="apConnectBtn" type="button">CONNECT</button>
              <button class="cBtn danger" id="apDisconnectBtn" type="button">DISCONNECT</button>
              <button class="cBtn" id="saveApCfgBtn" type="button">SAVE AP CFG</button>
            </div>
          </div>
        </section>

        <div class="connectCol connectColLeft standaloneSecondaryStack">
          <section class="standaloneControlSection" data-accent="green">
            <div class="standaloneSectionTitle">SINGLEPLAYER <span class="mini">local seed</span></div>
            <div class="cRow connectActionRow">
              <button class="cBtn" id="standaloneStartSeedBtn" type="button">START SINGLEPLAYER SEED</button>
              <button class="cBtn danger" id="standaloneResetSeedBtn" type="button">RESET LOCAL RUN</button>
            </div>
          </section>

          <section class="standaloneControlSection grow" data-accent="gold">
            <div class="standaloneSectionTitle" id="receivedHdr">RECEIVED ITEMS</div>
            <div class="cRow">
              <button class="cBtn" id="apSyncReceivedBtn" type="button" onclick="return window.flprStandaloneSyncReceived ? window.flprStandaloneSyncReceived(event) : false;">SYNC RECEIVED</button>
              <button class="cBtn danger" id="apClearReceivedBtn" type="button">CLEAR LIST</button>
            </div>
            <div class="recvWrap">
              <div class="recvBody" id="receivedBody"></div>
            </div>
          </section>
        </div>

        <div class="connectCol connectColRight standaloneLogStack">
          <section class="standaloneControlSection grow" data-accent="blue">
            <div class="standaloneSectionTitle">CONNECTION LOG <span class="mini">AP chat + checks</span></div>
            <div class="apConnLog">
              <div class="apConnLogHead">
                <div class="apConnLogTitle">AP CONNECTION LOG</div>
                <div class="apConnLogTabs" id="apLogTabs">
                  <button class="apLogTab" type="button" data-aplog-tab="status" onclick="return window.flprStandaloneTextClientSetTab ? window.flprStandaloneTextClientSetTab('status', event) : false;">STATUS</button>
                  <button class="apLogTab active" type="button" data-aplog-tab="chat" onclick="return window.flprStandaloneTextClientSetTab ? window.flprStandaloneTextClientSetTab('chat', event) : false;">SERVER</button>
                  <button class="apLogTab" type="button" data-aplog-tab="errors" onclick="return window.flprStandaloneTextClientSetTab ? window.flprStandaloneTextClientSetTab('errors', event) : false;">ERRORS</button>
                </div>
              </div>
              <div class="apConnLogBody" id="apConnLogBody"></div>
              <div class="apClientSayWrap">
                <div class="apClientSayRow" id="apClientSayForm">
                  <input class="cInput apClientSayInput" id="apClientSayInput" type="text" autocomplete="off" spellcheck="false" placeholder="Type AP chat or !hint request" onkeydown="if(event.key === 'Enter' && !event.shiftKey){ return window.flprStandaloneTextClientSend ? window.flprStandaloneTextClientSend(event) : false; }">
                  <button class="cBtn apClientSayBtn" id="apClientSayBtn" type="button" onclick="return window.flprStandaloneTextClientSend ? window.flprStandaloneTextClientSend(event) : false;">SEND</button>
                </div>
                <div class="apHint apClientSayHint">Sends AP chat commands without changing playable client mode.</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    `;
  }

  function escapeAttr(value){
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function ensurePanel(panels, key){
    let panel = panels.querySelector(`.controlsTabPanel[data-ctrl-panel="${key}"]`);
    if(!panel){
      panel = document.createElement("div");
      panel.className = "controlsTabPanel";
      panel.dataset.ctrlPanel = key;
      panels.appendChild(panel);
    }
    return panel;
  }

  function buildStandaloneTextSizeDock(){
    const dock = document.createElement("section");
    dock.id = "standaloneTextSizeDock";
    dock.className = "standaloneTextSizeDock standaloneControlSection";
    dock.dataset.accent = "blue";
    dock.innerHTML = `
      <div class="standaloneSectionTitle">TEXT SIZE <span class="mini">center is 3x</span></div>
      <label class="standaloneSliderRow">
        <span class="cLabel">CONTROLS TEXT</span>
        <input id="standaloneControlsFontSlider" type="range" min="-50" max="50" step="5" value="0">
        <span class="countVal" id="standaloneControlsFontValue">0</span>
      </label>
    `;
    return dock;
  }

  function ensureStandaloneTextSizeSlider(panel){
    if(!panel) return;
    try{
      document.querySelectorAll("#standaloneControlsFontSlider").forEach((input)=>{
        const dock = input.closest("#standaloneTextSizeDock");
        if(dock && panel.contains(dock)) return;
        const section = input.closest(".standaloneControlSection") || input.closest("label") || input;
        section.remove();
      });

      let dock = panel.querySelector("#standaloneTextSizeDock");
      panel.querySelectorAll("#standaloneTextSizeDock").forEach((node, index)=>{
        if(index === 0) dock = node;
        else node.remove();
      });
      if(!dock) dock = buildStandaloneTextSizeDock();
      const stack = panel.querySelector(":scope > .tabSectionStack") || panel;
      if(dock.parentElement !== stack) stack.appendChild(dock);
      else stack.appendChild(dock);
    }catch(_){}
  }

  function prepareStandaloneVisualsPanel(panel){
    if(!panel) return;
    try{
      panel.querySelectorAll("#saveApCfgBtn").forEach((btn)=>{
        btn.remove();
      });
    }catch(_){}
    try{
      panel.querySelectorAll('[data-music-scenario="bonus_pinball"], [data-music-preview="bonus_pinball"], [data-music-clear="bonus_pinball"], [data-music-mode="bonus_pinball"], [data-music-volume="bonus_pinball"]').forEach((node)=>{
        const row = node.closest?.(".musicScenarioRow") || node.closest?.(".musicScenarioModeRow") || node.closest?.(".musicScenarioVolumeRow") || node;
        row.remove();
      });
    }catch(_){}
    ensureStandaloneTextSizeSlider(panel);
  }

  function bindStandaloneControls(){
    const start = document.getElementById("standaloneStartSeedBtn");
    if(start && !start.__flprStandaloneBound){
      start.__flprStandaloneBound = true;
      start.onclick = ()=>{
        playClick();
        try{
          loadStandaloneSingleplayerSeed();
        }catch(err){
          try{ console.error(err); }catch(_){}
        }
      };
    }
    const reset = document.getElementById("standaloneResetSeedBtn");
    if(reset && !reset.__flprStandaloneBound){
      reset.__flprStandaloneBound = true;
      reset.onclick = ()=>{
        playClick();
        try{ if(typeof apDisconnect === "function") apDisconnect(); }catch(_){}
        try{ if(typeof loadState === "function"){ state = loadState(); } }catch(_){}
        try{ if(typeof renderAll === "function") renderAll(); }catch(_){}
      };
    }
    const slider = document.getElementById("standaloneControlsFontSlider");
    if(slider && !slider.__flprStandaloneBound){
      slider.__flprStandaloneBound = true;
      slider.addEventListener("input", ()=>{
        standaloneSettings.controlsOffset = clamp(slider.value, -50, 50);
        saveSettings(standaloneSettings);
        applyControlFontScale();
      });
      slider.addEventListener("change", playClick);
    }
    bindStandaloneApControls();
    renderStandaloneCounters();
    try{ if(typeof renderReceivedList === "function") renderReceivedList(); }catch(_){}
    try{ if(typeof updateCountCheckUI === "function") updateCountCheckUI(); }catch(_){}
  }

  function renderStandaloneCounters(){
    try{
      if(typeof updateCounterBars === "function") updateCounterBars();
      if(typeof updateCountCheckUI === "function") updateCountCheckUI();
    }catch(_){}
  }

  const standaloneTextClient = {
    activeTab: "chat",
    logs: { status: [], chat: [], errors: [] },
    maxLines: 360,
    wrapped: false,
    originalApLog: null
  };

  function standaloneTextTimestamp(){
    const d = new Date();
    const pad = (n, l=2)=>String(n).padStart(l, "0");
    return `[${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}]`;
  }

  function standaloneTextNormalizeTab(tab){
    const t = String(tab || "").toLowerCase();
    if(t === "chat" || t === "server" || t === "messages" || t === "generic") return "chat";
    if(t === "error" || t === "errors") return "errors";
    return "status";
  }

  function standaloneTextRender(){
    const body = document.getElementById("apConnLogBody");
    if(!body) return;
    const tab = standaloneTextNormalizeTab(standaloneTextClient.activeTab);
    document.querySelectorAll("#apLogTabs .apLogTab").forEach((btn)=>{
      btn.classList.toggle("active", standaloneTextNormalizeTab(btn.dataset.aplogTab || "") === tab);
    });
    const lines = standaloneTextClient.logs[tab] || [];
    const empty = tab === "chat"
      ? "AP Text Client ready. Connect to a server, then type chat or !hint commands here."
      : (tab === "errors" ? "No AP errors yet." : "AP Text Client ready. Connect to a server, then type chat or !hint commands here.");
    body.textContent = lines.length ? lines.join("\n") : empty;
    body.scrollTop = body.scrollHeight;
  }

  function standaloneTextMirrorLog(message, opts){
    const msg = String(message ?? "").trim();
    if(!msg) return;
    const forced = opts && Object.prototype.hasOwnProperty.call(opts, "tab") ? String(opts.tab || "") : "";
    const lower = msg.toLowerCase();
    const inferred = lower.includes("error") || lower.includes("failed") || lower.includes("refused") || lower.includes("blocked") || lower.includes("timeout")
      ? "errors"
      : (lower.includes("server") || lower.includes("received") || lower.includes("sent") || lower.includes("hint") || lower.startsWith(">") || lower.includes("item") || lower.includes("check"))
        ? "chat"
        : "status";
    const tab = standaloneTextNormalizeTab(forced || inferred);
    const line = `${standaloneTextTimestamp()} ${msg}`;
    const targets = [tab];
    if(opts && Array.isArray(opts.mirrorTabs)){
      opts.mirrorTabs.forEach((t)=>{
        const nt = standaloneTextNormalizeTab(t);
        if(!targets.includes(nt)) targets.push(nt);
      });
    }
    if(tab !== "errors" && (lower.includes("error") || lower.includes("failed") || lower.includes("refused") || lower.includes("blocked") || lower.includes("timeout"))){
      if(!targets.includes("errors")) targets.push("errors");
    }
    targets.forEach((t)=>{
      const buf = standaloneTextClient.logs[t] || (standaloneTextClient.logs[t] = []);
      buf.push(line);
      if(buf.length > standaloneTextClient.maxLines) buf.splice(0, buf.length - standaloneTextClient.maxLines);
    });
    standaloneTextRender();
  }

  function installStandaloneTextLogBridge(){
    if(standaloneTextClient.wrapped) return;
    standaloneTextClient.wrapped = true;
    standaloneTextClient.originalApLog = (typeof window.apLog === "function") ? window.apLog : null;
    if(standaloneTextClient.originalApLog){
      window.apLog = function standaloneApLogBridge(message, opts){
        try{ standaloneTextClient.originalApLog.call(window, message, opts); }catch(_){}
        try{ standaloneTextMirrorLog(message, opts); }catch(_){}
      };
    }else{
      window.apLog = function standaloneApLogBridgeFallback(message, opts){
        try{ standaloneTextMirrorLog(message, opts); }catch(_){}
      };
    }
  }

  let standaloneSayLastSubmit = { text:"", at:0 };
  function standaloneSendApSayPacket(text){
    const msg = String(text || "").trim();
    if(!msg) return false;
    const ws = (typeof ap !== "undefined" && ap) ? ap.ws : null;
    const wsOpen = !!(ws && ws.readyState === WebSocket.OPEN);
    if(!wsOpen){
      try{ window.apLog ? window.apLog("AP chat blocked; socket is not connected.", { tab:"errors" }) : standaloneTextMirrorLog("AP chat blocked; socket is not connected.", { tab:"errors" }); }catch(_){}
      return false;
    }
    try{ window.apLog ? window.apLog("> " + msg, { tab:"chat", mirrorTabs:["status"] }) : standaloneTextMirrorLog("> " + msg, { tab:"chat", mirrorTabs:["status"] }); }catch(_){}
    try{
      if(typeof apSend === "function"){
        const ok = !!apSend({ cmd:"Say", text:msg });
        if(ok){
          try{ window.apLog ? window.apLog("SAY SENT TO AP SERVER; " + msg, { tab:"status", mirrorTabs:["chat"] }) : standaloneTextMirrorLog("SAY SENT TO AP SERVER; " + msg, { tab:"status", mirrorTabs:["chat"] }); }catch(_){}
        }
        return ok;
      }
      ws.send(JSON.stringify([{ cmd:"Say", text:msg }]));
      try{ window.apLog ? window.apLog("SAY SENT TO AP SERVER; " + msg, { tab:"status", mirrorTabs:["chat"] }) : standaloneTextMirrorLog("SAY SENT TO AP SERVER; " + msg, { tab:"status", mirrorTabs:["chat"] }); }catch(_){}
      return true;
    }catch(err){
      try{ window.apLog ? window.apLog("AP chat send failed; " + (err?.message || err), { tab:"errors" }) : standaloneTextMirrorLog("AP chat send failed; " + (err?.message || err), { tab:"errors" }); }catch(_){}
      return false;
    }
  }

  function submitStandaloneTextClientSay(event){
    if(event){
      event.preventDefault();
      event.stopPropagation();
      try{ event.stopImmediatePropagation(); }catch(_){}
    }
    const sayInput = document.getElementById("apClientSayInput");
    const text = String(sayInput?.value || "").trim();
    if(!text) return false;
    const now = Date.now();
    if(standaloneSayLastSubmit.text === text && now - standaloneSayLastSubmit.at < 350) return false;
    standaloneSayLastSubmit = { text, at:now };
    let sent = false;
    try{
      sent = standaloneSendApSayPacket(text);
    }catch(err){
      try{ window.apLog ? window.apLog("AP chat failed; " + (err?.message || err), { tab:"errors" }) : standaloneTextMirrorLog("AP chat failed; " + (err?.message || err), { tab:"errors" }); }catch(_){}
    }
    if(sent){
      try{ playClick(); }catch(_){}
      if(sayInput) sayInput.value = "";
      try{ if(typeof setApLogTab === "function") setApLogTab("chat"); }catch(_){}
      standaloneTextClient.activeTab = "chat";
      standaloneTextRender();
    }
    return false;
  }

  function activateStandaloneTextClientTab(btn, event){
    if(!btn) return false;
    if(event){
      event.preventDefault();
      event.stopPropagation();
      try{ event.stopImmediatePropagation(); }catch(_){}
    }
    const now = Date.now();
    if(Number(btn.__flprStandaloneTabAt || 0) && now - Number(btn.__flprStandaloneTabAt || 0) < 160) return false;
    btn.__flprStandaloneTabAt = now;
    playClick();
    const tab = standaloneTextNormalizeTab(btn.dataset.aplogTab || "status");
    standaloneTextClient.activeTab = tab;
    try{ if(typeof setApLogTab === "function") setApLogTab(tab); }catch(_){}
    standaloneTextRender();
    return false;
  }

  function activateStandaloneTextClientTabByName(tab, event){
    const wanted = standaloneTextNormalizeTab(tab);
    const btn = Array.from(document.querySelectorAll("#apLogTabs .apLogTab")).find((node)=>standaloneTextNormalizeTab(node.dataset.aplogTab || "") === wanted);
    return activateStandaloneTextClientTab(btn || { dataset:{ aplogTab:wanted } }, event);
  }

  function syncStandaloneReceived(event){
    if(event){
      event.preventDefault();
      event.stopPropagation();
      try{ event.stopImmediatePropagation(); }catch(_){}
    }
    playClick();
    let sent = false;
    try{
      const wsOpen = !!(typeof ap !== "undefined" && ap?.ws && ap.ws.readyState === WebSocket.OPEN);
      if(typeof forceReceivedSync === "function"){
        forceReceivedSync(true);
        sent = wsOpen;
      }else if(typeof apSend === "function" && wsOpen){
        sent = !!apSend({ cmd:"Sync" });
      }
    }catch(err){
      try{ window.apLog ? window.apLog("SYNC RECEIVED failed; " + (err?.message || err), { tab:"errors" }) : standaloneTextMirrorLog("SYNC RECEIVED failed; " + (err?.message || err), { tab:"errors" }); }catch(_){}
    }
    try{
      if(typeof reconcileWorldStateFromReceivedInventory === "function"){
        setTimeout(()=>reconcileWorldStateFromReceivedInventory("Sync button"), 250);
      }
    }catch(_){}
    [200, 900, 2200].forEach((delay)=>{
      setTimeout(()=>{
        try{ if(typeof renderReceivedList === "function") renderReceivedList(); }catch(_){}
        try{ if(typeof updateCountCheckUI === "function") updateCountCheckUI(); }catch(_){}
      }, delay);
    });
    if(sent){
      try{ window.apLog ? window.apLog("SYNC RECEIVED requested from AP server.", { tab:"status", mirrorTabs:["chat"] }) : standaloneTextMirrorLog("SYNC RECEIVED requested from AP server.", { tab:"status", mirrorTabs:["chat"] }); }catch(_){}
    }else{
      try{ window.apLog ? window.apLog("SYNC RECEIVED blocked; connect to AP first.", { tab:"errors" }) : standaloneTextMirrorLog("SYNC RECEIVED blocked; connect to AP first.", { tab:"errors" }); }catch(_){}
    }
    return false;
  }

  function installStandaloneTextClientDelegates(){
    installStandaloneTextLogBridge();
    window.flprStandaloneTextClientSend = submitStandaloneTextClientSay;
    window.flprStandaloneTextClientSetTab = activateStandaloneTextClientTabByName;
    window.flprStandaloneSyncReceived = syncStandaloneReceived;
    window.flprStandaloneTextClientRender = standaloneTextRender;
    if(window.__flprStandaloneTextClientDelegates === true) return;
    window.__flprStandaloneTextClientDelegates = true;
    const isTextClientTarget = (target)=>!!(target && target.closest && target.closest(".apConnLog"));
    document.addEventListener("submit", (event)=>{
      if(event.target && event.target.id === "apClientSayForm"){
        submitStandaloneTextClientSay(event);
      }
    }, true);
    document.addEventListener("keydown", (event)=>{
      const target = event.target;
      if(target && target.id === "apClientSayInput" && event.key === "Enter" && !event.shiftKey){
        submitStandaloneTextClientSay(event);
      }
    }, true);
    document.addEventListener("pointerdown", (event)=>{
      if(!isTextClientTarget(event.target)) return;
      const input = event.target.closest("#apClientSayInput");
      if(input){
        event.stopPropagation();
        try{ input.focus({ preventScroll:true }); }catch(_){ try{ input.focus(); }catch(__){} }
        return;
      }
      const tab = event.target.closest(".apLogTab");
      if(tab) activateStandaloneTextClientTab(tab, event);
    }, true);
    document.addEventListener("click", (event)=>{
      if(!isTextClientTarget(event.target)) return;
      const send = event.target.closest("#apClientSayBtn");
      if(send){
        submitStandaloneTextClientSay(event);
        return;
      }
      const tab = event.target.closest(".apLogTab");
      if(tab){
        activateStandaloneTextClientTab(tab, event);
      }
    }, true);
    setTimeout(()=>{
      try{
        window.apLog ? window.apLog("AP Text Client ready; connect to a server, then type chat or !hint commands here.", { tab:"chat", mirrorTabs:["status"] }) : standaloneTextMirrorLog("AP Text Client ready; connect to a server, then type chat or !hint commands here.", { tab:"chat", mirrorTabs:["status"] });
      }catch(_){}
      standaloneTextRender();
    }, 0);
  }

  function bindStandaloneApControls(){
    installStandaloneTextClientDelegates();
    const s = document.getElementById("apServer");
    const p = document.getElementById("apPlayer");
    const g = document.getElementById("apGame");
    const pw = document.getElementById("apPass");
    const btnC = document.getElementById("apConnectBtn");
    const btnD = document.getElementById("apDisconnectBtn");
    const btnSaveAp = document.getElementById("saveApCfgBtn");
    const cfg = apCfg();

    if(s && !s.__flprStandaloneValueLoaded){ s.value = cfg.server || ""; s.__flprStandaloneValueLoaded = true; }
    if(p && !p.__flprStandaloneValueLoaded){ p.value = cfg.player || "Ashodin"; p.__flprStandaloneValueLoaded = true; }
    if(g && !g.__flprStandaloneValueLoaded){ g.value = cfg.game || ""; g.__flprStandaloneValueLoaded = true; }
    if(pw && !pw.__flprStandaloneValueLoaded){ pw.value = cfg.pass || ""; pw.__flprStandaloneValueLoaded = true; }

    try{
      if(typeof updateApConnectButtons === "function" && typeof ap !== "undefined"){
        updateApConnectButtons(ap.connected ? "connected" : "offline");
      }
    }catch(_){}

    if(btnC) btnC.onclick = ()=>{
      playClick();
      try{ if(typeof safeApConnect === "function") safeApConnect(); }catch(err){ try{ console.error(err); }catch(_){} }
    };
    if(btnD) btnD.onclick = ()=>{
      playClick();
      try{ if(typeof apDisconnect === "function") apDisconnect(); }catch(err){ try{ console.error(err); }catch(_){} }
    };
    if(btnSaveAp) btnSaveAp.onclick = ()=>{
      playClick();
      try{
        if(typeof ap !== "undefined" && ap?.cfg){
          ap.cfg.server = (s?.value || "").trim();
          ap.cfg.player = (p?.value || "Ashodin").trim();
          ap.cfg.game = (g?.value || "").trim();
          ap.cfg.pass = (pw?.value || "");
          if(typeof saveApCfg === "function") saveApCfg(ap.cfg);
          if(typeof apLog === "function") apLog("AP settings saved");
          if(typeof toast === "function") toast("good", "AP SETTINGS SAVED", ap.cfg.server || "server not set", 1800);
        }
      }catch(err){ try{ console.error(err); }catch(_){} }
    };

    const btnSR = document.getElementById("apSyncReceivedBtn");
    const btnCR = document.getElementById("apClearReceivedBtn");
    if(btnSR) btnSR.onclick = ()=>{
      playClick();
      try{ if(typeof forceReceivedSync === "function") forceReceivedSync(); }catch(_){}
      try{
        if(typeof reconcileWorldStateFromReceivedInventory === "function"){
          setTimeout(()=>reconcileWorldStateFromReceivedInventory("Sync button"), 250);
        }
      }catch(_){}
    };
    if(btnCR) btnCR.onclick = ()=>{
      playClick();
      try{
        if(typeof ap !== "undefined"){
          ap.receivedAll = [];
          ap.receivedSeen = new Set();
          ap.receivedByIndex = new Map();
          ap.receivedDeferred = [];
          ap.receivedKeySet = new Set();
          ap.lastReceivedIndex = 0;
        }
      }catch(_){}
      try{ localStorage.setItem("flpr_ap_last_received_index", "0"); }catch(_){}
      try{ if(typeof saveReceivedList === "function") saveReceivedList([]); }catch(_){}
      try{ if(typeof renderReceivedList === "function") renderReceivedList([]); }catch(_){}
      try{ if(typeof updateCountCheckUI === "function") updateCountCheckUI(); }catch(_){}
      try{ if(typeof forceReceivedSync === "function") forceReceivedSync(true); }catch(_){}
    };

    const logTabs = document.getElementById("apLogTabs");
    const activateLogTab = (btn, event)=>{
      activateStandaloneTextClientTab(btn, event);
    };
    if(logTabs && logTabs.__flprStandaloneBound !== true){
      logTabs.__flprStandaloneBound = true;
      logTabs.addEventListener("click", (event)=>{
        const btn = event.target.closest(".apLogTab");
        if(!btn) return;
        activateLogTab(btn, event);
      });
    }
    try{
      document.querySelectorAll("#apLogTabs .apLogTab").forEach((btn)=>{
        if(btn.__flprStandaloneDirectBound === true) return;
        btn.__flprStandaloneDirectBound = true;
        btn.addEventListener("pointerup", (event)=>activateLogTab(btn, event), true);
        btn.addEventListener("click", (event)=>activateLogTab(btn, event), true);
      });
    }catch(_){}
    const submitStandaloneSay = (event)=>{
      if(typeof apSubmitSayFromControls === "function"){
        if(event){
          event.preventDefault();
          event.stopPropagation();
          try{ event.stopImmediatePropagation(); }catch(_){}
        }
        return !!apSubmitSayFromControls();
      }
      return submitStandaloneTextClientSay(event);
    };
    try{
      if(typeof bindApSayControls === "function"){
        bindApSayControls();
      }else{
        const sayForm = document.getElementById("apClientSayForm");
        const sayInput = document.getElementById("apClientSayInput");
        if(sayForm && sayInput && sayForm.__flprStandaloneBound !== true){
          sayForm.__flprStandaloneBound = true;
          sayForm.addEventListener("submit", (event)=>{
            submitStandaloneSay(event);
          });
        }
      }
    }catch(_){}
    try{
      const sayBtn = document.getElementById("apClientSayBtn");
      if(sayBtn && sayBtn.__flprStandaloneDirectBound !== true){
        sayBtn.__flprStandaloneDirectBound = true;
        try{ sayBtn.type = "button"; }catch(_){}
        sayBtn.addEventListener("pointerup", submitStandaloneSay, true);
        sayBtn.addEventListener("click", submitStandaloneSay, true);
      }
    }catch(_){}
    try{
      const sayForm = document.getElementById("apClientSayForm");
      if(sayForm && sayForm.__flprStandaloneDirectSubmitBound !== true){
        sayForm.__flprStandaloneDirectSubmitBound = true;
        sayForm.addEventListener("submit", submitStandaloneSay, true);
      }
      const sayInput = document.getElementById("apClientSayInput");
      if(sayInput && sayInput.__flprStandaloneEnterBound !== true){
        sayInput.__flprStandaloneEnterBound = true;
        sayInput.addEventListener("keydown", (event)=>{
          if(event.key !== "Enter" || event.shiftKey) return;
          submitStandaloneSay(event);
        }, true);
      }
    }catch(_){}
    try{ if(typeof renderApLogTab === "function") renderApLogTab(); }catch(_){}

    if(s) s.onchange = ()=>{
      try{ if(typeof ap !== "undefined" && ap?.cfg){ ap.cfg.server = s.value.trim(); if(typeof saveApCfg === "function") saveApCfg(ap.cfg); } }catch(_){}
    };
    if(p) p.onchange = ()=>{
      try{ if(typeof ap !== "undefined" && ap?.cfg){ ap.cfg.player = p.value.trim(); if(typeof saveApCfg === "function") saveApCfg(ap.cfg); } }catch(_){}
    };
    if(g) g.onchange = ()=>{
      try{ if(typeof ap !== "undefined" && ap?.cfg){ ap.cfg.game = g.value.trim(); if(typeof saveApCfg === "function") saveApCfg(ap.cfg); } }catch(_){}
    };
    if(pw) pw.onchange = ()=>{
      try{ if(typeof ap !== "undefined" && ap?.cfg){ ap.cfg.pass = pw.value; if(typeof saveApCfg === "function") saveApCfg(ap.cfg); } }catch(_){}
    };
  }

  function rebuildStandaloneControls(){
    const body = document.querySelector(".controlsBody");
    if(!body) return false;
    const tabs = body.querySelector(".controlsTabs");
    const panels = body.querySelector(".controlsPanels");
    if(!tabs || !panels) return false;

    const firstStandalonePass = !document.body.classList.contains("flprStandaloneOriginalClient");
    const current = firstStandalonePass ? "connect" : activeControlTab();
    document.body.classList.add("flprStandaloneOriginalClient");
    injectStandaloneStyles();
    applyStandaloneWindowScale();

    const controlsHead = document.querySelector(".controlsHead, .controlsHeadTitle");
    if(controlsHead) controlsHead.textContent = "CONTROLS";

    const needsTabs =
      tabs.dataset.flprStandaloneTabs !== "1" ||
      !tabs.querySelector('[data-ctrl-tab="connect"]') ||
      !tabs.querySelector('[data-ctrl-tab="visuals"]') ||
      !tabs.querySelector('[data-ctrl-tab="achievements"]') ||
      tabs.querySelector('[data-ctrl-tab="testing"]');

    if(needsTabs){
      tabs.dataset.flprStandaloneTabs = "1";
      tabs.innerHTML = `
        <button class="controlsTabBtn active" data-ctrl-tab="connect" type="button">CONNECT</button>
        <button class="controlsTabBtn" data-ctrl-tab="visuals" type="button">VISUALS / MUSIC</button>
        <button class="controlsTabBtn" data-ctrl-tab="achievements" type="button">ACHIEVEMENTS</button>
      `;
      tabs.addEventListener("click", (event)=>{
        const btn = event.target.closest(".controlsTabBtn");
        if(!btn) return;
        playClick();
        setControlTab(btn.dataset.ctrlTab || "connect");
      });
    }

    const connect = ensurePanel(panels, "connect");
    const visuals = ensurePanel(panels, "visuals");
    const achievements = ensurePanel(panels, "achievements");
    if(!achievements.id) achievements.id = "achievementsControlsPanel";

    try{
      if(typeof compactVisualsControlsLayout === "function") compactVisualsControlsLayout(visuals);
      if(typeof ensureMusicScenarioControls === "function") ensureMusicScenarioControls();
      if(typeof wireTableBannerGalleryControls === "function") wireTableBannerGalleryControls();
      prepareStandaloneVisualsPanel(visuals);
      if(typeof applyChecksBgMode === "function"){
        let savedMode = "classic";
        try{ savedMode = (JSON.parse(localStorage.getItem("flpr_settings_v2") || "{}") || {}).checksBgMode || "classic"; }catch(_){}
        applyChecksBgMode(savedMode, { save:false });
      }
    }catch(_){}

    if(
      connect.dataset.flprStandaloneConnect !== "1" ||
      !connect.querySelector("#standaloneStartSeedBtn") ||
      !connect.querySelector(".standaloneArchipelagoSection") ||
      !connect.querySelector("#receivedBody")
    ){
      connect.dataset.flprStandaloneConnect = "1";
      connect.innerHTML = connectPanelHtml(apCfg());
    }

    Array.from(panels.children).forEach((panel)=>{
      if(panel === connect || panel === visuals || panel === achievements) return;
      panel.style.display = "none";
      panel.classList.remove("active");
    });
    panels.appendChild(connect);
    panels.appendChild(visuals);
    panels.appendChild(achievements);

    try{ if(typeof renderAchievementsControlsPanel === "function") renderAchievementsControlsPanel(); }catch(_){}
    bindStandaloneControls();
    applyControlFontScale();
    setControlTab(current === "achievements" ? "achievements" : (current === "visuals" ? "visuals" : "connect"));
    return true;
  }

  function bootStandaloneBridge(){
    const attempt = ()=>{
      try{ rebuildStandaloneControls(); applyStandaloneWindowScale(); }catch(err){ try{ console.error(err); }catch(_){} }
    };
    if(!window.__flprStandaloneResizeBound){
      window.__flprStandaloneResizeBound = true;
      window.addEventListener("resize", applyStandaloneWindowScale, { passive:true });
    }
    if(!window.__flprStandaloneCounterTimer){
      window.__flprStandaloneCounterTimer = setInterval(renderStandaloneCounters, 500);
    }
    attempt();
    let ticks = 0;
    const timer = setInterval(()=>{
      ticks += 1;
      attempt();
      if(ticks > 20) clearInterval(timer);
    }, 300);
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", bootStandaloneBridge, { once:true });
  }else{
    bootStandaloneBridge();
  }
})();
