(function(){
  "use strict";

  try{
    window.__flprHomeEdition = true;
    const now = Date.now();
    const muteUntil = now + 5000;
    window.__flprBossHitAudioMuteUntil = Math.max(
      Number(window.__flprBossHitAudioMuteUntil || 0),
      muteUntil
    );
    window.__flprStandaloneBossAudioMuteUntil = Math.max(
      Number(window.__flprStandaloneBossAudioMuteUntil || 0),
      muteUntil
    );
  }catch(_){}

  const SETTINGS_KEY = "flpr_standalone_original_controls_v1";
  const STANDALONE_AP_LOG_KEY = "flpr_standalone_ap_text_log_v1";
  const STANDALONE_SENT_ITEMS_KEY = "flpr_standalone_ap_sent_items_v1";
  const STANDALONE_ITEM_LOG_SOUND_KEY = "flpr_standalone_item_log_sound_muted_v1";
  const STANDALONE_AP_LOG_CLICK_SOUND_KEY = "flpr_standalone_ap_log_click_sound_muted_v1";
  const STANDALONE_AP_REWARD_STATE_KEY = "flpr_standalone_ap_reward_state_v1";
  const STANDALONE_BOSS_INCOMING_SEEN_KEY = "flpr_standalone_boss_incoming_seen_v1";
  const STANDALONE_BOSS_VICTORY_AUTO_CHECKS_KEY = "flpr_standalone_boss_victory_auto_checks_v1";
  const STANDALONE_PROFILE_STATE_KEY = "flpr_standalone_home_profiles_v1";
  const STANDALONE_SEED_SAVES_KEY = "flpr_standalone_singleplayer_seed_saves_v1";
  const STANDALONE_ACHIEVEMENT_LS_KEY = "flpr_achievements_v1";
  const STANDALONE_ACHIEVEMENT_UI_LS_KEY = "flpr_achievements_ui_v1";
  const STANDALONE_EPISODE_LS_KEY = "flpr_episode_v1";
  const STANDALONE_QUICK_START_SEEN_LS_KEY = "flpr_home_quick_start_seen_v1";
  const STANDALONE_QUICK_START_VERSION = "home-feedback-onboarding-2026-05";
  const STANDALONE_DEFAULT_SWAP_SECONDS = 60;
  const STANDALONE_SWAP_DEFAULT_VERSION = 2;
  const STANDALONE_RANDOMIZER_OPEN_SCENARIO = "randomizer_open";
  const STANDALONE_FLIPPERMIZER_GAME_NAME = "FlippermizerWorldsofPinball";
  const STANDALONE_FLIPPERMIZER_HOME_PLAYER = "FlippermizerWorldsofPinball";
  const STANDALONE_FLIPPERMIZER_STREAM_PLAYER = "Flippermizer";
  const STANDALONE_FLIPPERMIZER_LEGACY_PLAYER_NAMES = new Set(["Ashodin", "Ashodin_BaseGame", "AshodinNoTrap", "FlippermizerWorldsofPinball"]);
  const STANDALONE_FLIPPERMIZER_LEGACY_GAME_NAMES = new Set([
    "Manual_FlippermizerBaseGame",
    "Manual_FlippermizerBaseGame_Ashodin",
    "Manual_Flippermizer_Ashodin",
    "Flippermizer",
    "FlippermizerBaseGame"
  ]);
  const STANDALONE_PACKAGED_LOGO_POSITION = Object.freeze({ x: 1057, y: 11 });
  const STANDALONE_KNOWN_AP_ITEM_NAMES = Object.freeze({
    "370001": "Ethereal Crossbow",
    "heretic|370001": "Ethereal Crossbow"
  });
  const STANDALONE_OVERLAY_SETTINGS_KEY = "flpr_settings_v1";
  const STANDALONE_OVERLAY_LEGACY_SETTINGS_KEYS = Object.freeze(["flpr_settings_v2", "flpr_settings_v21", "flpr_settings_v20", "flpr_settings_v19"]);
  const STANDALONE_CHECKS_BG_OPTIONS = Object.freeze([
    { value:"classic", label:"CLASSIC CHECKS", className:"" },
    { value:"circuit", label:"CIRCUIT RED/BLUE", className:"checksBgCircuit" },
    { value:"lattice", label:"NEON LATTICE", className:"checksBgNeonLattice" },
    { value:"blueprint", label:"BLUEPRINT GRID", className:"checksBgBlueprint" },
    { value:"stars", label:"VECTOR STARS", className:"checksBgVectorStars" },
    { value:"radar", label:"RADAR SWEEP", className:"checksBgRadar" }
  ]);
  const STANDALONE_PROFILE_EMOJI_CODES = Object.freeze([
    0x1F3B1, 0x1F3AF, 0x1F579, 0x1F3AE, 0x1F4AB, 0x1F680, 0x26A1, 0x1F52E,
    0x1F48E, 0x1F3C6, 0x1F3B2, 0x1F3B5, 0x1F525, 0x1F308, 0x1F31F, 0x1F9E9,
    0x1F6F8, 0x1F3A8, 0x1F5A5, 0x1F4BE, 0x1F9FF, 0x1FA99, 0x1F451, 0x2728,
    0x1F916, 0x1F47E, 0x1F47D, 0x1F9D9, 0x1F9DB, 0x1F9DD, 0x1F977, 0x1F60E,
    0x1F920, 0x1F9E0, 0x1F4A0, 0x1F52B, 0x1F6E1, 0x2694, 0x1F5E1, 0x1F3F9,
    0x1F3CE, 0x1F3CD, 0x1F6F5, 0x1F697, 0x1F681, 0x1F6A8, 0x1F3B8, 0x1F941,
    0x1F3A4, 0x1F3A7, 0x1F39B, 0x1F3AC, 0x1F4FA, 0x1F4F7, 0x1F52D, 0x1F9EA,
    0x1F9EC, 0x1F489, 0x1F48A, 0x1F9F2, 0x1F9FF, 0x1F570, 0x1F5DD, 0x1F511,
    0x1F381, 0x1F3F0, 0x1F3D9, 0x1F30C, 0x1F319, 0x2600, 0x1F30A, 0x1F32A,
    0x1F98A, 0x1F43A, 0x1F42F, 0x1F409, 0x1F984, 0x1F985, 0x1F987, 0x1F419,
    0x1F41D, 0x1F577, 0x1F33F, 0x1F340, 0x1F344, 0x1F33A, 0x1F335, 0x1F347,
    0x1F353, 0x1F355, 0x1F36A, 0x2615, 0x1F9CB, 0x1F37F, 0x1F36D, 0x1F36B
  ]);
  const DEFAULT_SETTINGS = {
    controlsOffset: 0,
    logoX: STANDALONE_PACKAGED_LOGO_POSITION.x,
    logoY: STANDALONE_PACKAGED_LOGO_POSITION.y,
    logoLocked: true
  };

  function standaloneIsStreamEditionRuntime(){
    try{
      if(window.__flprStreamEdition === true) return true;
      if(typeof isStreamEditionRuntime === "function" && isStreamEditionRuntime()) return true;
      const params = new URLSearchParams(window.location.search || "");
      return params.get("flprStreamEdition") === "1";
    }catch(_){
      return false;
    }
  }

  function standaloneNormalizeApCfg(cfg){
    const next = { server:"", player:standaloneApDefaultPlayer(), game:STANDALONE_FLIPPERMIZER_GAME_NAME, pass:"", ...(cfg && typeof cfg === "object" ? cfg : {}) };
    const game = String(next.game || "").trim();
    if(!game || STANDALONE_FLIPPERMIZER_LEGACY_GAME_NAMES.has(game)) next.game = STANDALONE_FLIPPERMIZER_GAME_NAME;
    if(standaloneIsStreamEditionRuntime()){
      const player = String(next.player || "").trim();
      if(!player || STANDALONE_FLIPPERMIZER_LEGACY_PLAYER_NAMES.has(player)) next.player = STANDALONE_FLIPPERMIZER_STREAM_PLAYER;
    }else{
      const player = String(next.player || "").trim();
      if(!player || STANDALONE_FLIPPERMIZER_LEGACY_PLAYER_NAMES.has(player)) next.player = STANDALONE_FLIPPERMIZER_HOME_PLAYER;
    }
    return next;
  }

  function standaloneApDefaultPlayer(){
    return standaloneIsStreamEditionRuntime() ? STANDALONE_FLIPPERMIZER_STREAM_PLAYER : STANDALONE_FLIPPERMIZER_HOME_PLAYER;
  }

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
  const standaloneRendererControls = {
    loaded: false,
    response: null,
    saveTimer: null
  };
  const standalonePerformanceRuntime = {
    lastSeedSaveSig: "",
    lastSeedSaveAt: 0,
    pendingSeedSaveTimer: 0,
    lastProfileUiSig: "",
    lastProfileUiAt: 0,
    pendingHudPositionTimer: 0,
    lastCounterSig: "",
    lastCounterAt: 0,
    lastGateSeedSaveAt: 0
  };
  try{ window.__flprStandalonePerformanceRuntime = standalonePerformanceRuntime; }catch(_){}
  const standaloneProfileRuntime = {
    selectedMode: "",
    switchingMode: false,
    randomizerReady: false,
    randomizerStarted: false,
    randomizerReason: "",
    gateTimer: null,
    profileRestoring: false,
    achievementSaveWrapped: false,
    profileGateMode: "choose",
    profileGateManualOpen: false,
    activeSeedLoadConfirmId: ""
  };
  try{ window.__flprStandaloneProfileRuntime = standaloneProfileRuntime; }catch(_){}
  try{ window.__flprStandaloneRollExplicitFillerJunk = true; }catch(_){}
  const standaloneSlotTaskPayload = {
    byLocation: new Map(),
    byLocationNormalized: new Map(),
    bySlot: new Map()
  };
  const standaloneApPlayerMeta = {
    nameById: new Map(),
    gameById: new Map(),
    gameByName: new Map()
  };
  const standaloneFlprBotSyncDisableRuntime = {
    timer: 0,
    ticks: 0
  };

  function standaloneMarkNoFlprBotFunction(fn, role){
    try{ Object.defineProperty(fn, "__flprStandaloneNoFlprBotSync", { value:String(role || "noop"), configurable:true }); }catch(_){}
    return fn;
  }

  const standaloneNoFlprBotFalse = standaloneMarkNoFlprBotFunction(function standaloneNoFlprBotFalse(){ return false; }, "false");
  const standaloneNoFlprBotEmpty = standaloneMarkNoFlprBotFunction(function standaloneNoFlprBotEmpty(){ return ""; }, "empty");
  const standaloneNoFlprBotNull = standaloneMarkNoFlprBotFunction(function standaloneNoFlprBotNull(){ return null; }, "null");
  const standaloneNoFlprBotVoid = standaloneMarkNoFlprBotFunction(function standaloneNoFlprBotVoid(){ return undefined; }, "void");
  const standaloneNoFlprBotPost = standaloneMarkNoFlprBotFunction(async function standaloneNoFlprBotPost(){ return false; }, "post");
  const standaloneNoFlprBotGet = standaloneMarkNoFlprBotFunction(async function standaloneNoFlprBotGet(){ return null; }, "get");

  function standaloneAssignNoFlprBotGlobal(name, fn){
    try{ window[name] = fn; }catch(_){}
    try{
      switch(name){
        case "flprBotSyncEnabled": flprBotSyncEnabled = fn; break;
        case "flprBotSyncBaseUrl": flprBotSyncBaseUrl = fn; break;
        case "flprBotSyncToken": flprBotSyncToken = fn; break;
        case "flprBotSyncReportError": flprBotSyncReportError = fn; break;
        case "postFlprBotSync": postFlprBotSync = fn; break;
        case "getFlprBotSync": getFlprBotSync = fn; break;
        case "syncFlprBotTableFromNowPlaying": syncFlprBotTableFromNowPlaying = fn; break;
        case "getFlprBotNowPlayingCandidateForWorld": getFlprBotNowPlayingCandidateForWorld = fn; break;
        case "syncFlprBotCurrentTableSnapshot": syncFlprBotCurrentTableSnapshot = fn; break;
        case "syncFlprBotCurrentTable": syncFlprBotCurrentTable = fn; break;
        case "syncFlprBotBossKeys": syncFlprBotBossKeys = fn; break;
        case "getFlprBotBossStatusSnapshot": getFlprBotBossStatusSnapshot = fn; break;
        case "syncFlprBotBossStatus": syncFlprBotBossStatus = fn; break;
        case "getFlprBotEpisodeSnapshot": getFlprBotEpisodeSnapshot = fn; break;
        case "syncFlprBotEpisodeState": syncFlprBotEpisodeState = fn; break;
        case "hintPostHangmanBotState": hintPostHangmanBotState = fn; break;
        case "hintStartFlprBotHangmanPoll": hintStartFlprBotHangmanPoll = fn; break;
        case "hintStopFlprBotHangmanPoll": hintStopFlprBotHangmanPoll = fn; break;
        case "hintAnnounceHangmanCorrect": hintAnnounceHangmanCorrect = fn; break;
        case "ensureFlprBotUtilityControl": ensureFlprBotUtilityControl = fn; break;
        default: break;
      }
    }catch(_){}
  }

  function standaloneRemoveFlprBotUtilityControl(){
    try{
      document.querySelectorAll("#flprBotRunUtilityWrap, #flprBotRunUtilityBtn, #flprBotRunUtilityStatus").forEach((node)=>{
        const wrap = node.closest?.("#flprBotRunUtilityWrap") || node;
        try{ wrap.remove(); }catch(_){}
      });
    }catch(_){}
  }

  function disableStandaloneFlprBotSync(){
    try{ window.__flprStandaloneFlprBotSyncDisabled = true; }catch(_){}
    try{ window.__flprStandaloneFlprBotSyncDisabledAt = Date.now(); }catch(_){}
    try{ window.FLPR_BOT_SYNC_ENABLED = false; }catch(_){}
    try{ window.FLPR_BOT_SYNC_URL = ""; }catch(_){}
    try{ window.FLPR_BOT_SYNC_TOKEN = ""; }catch(_){}
    try{ localStorage.setItem("flpr_bot_sync_cfg_v1", JSON.stringify({ enabled:false, url:"http://127.0.0.1:8787", token:"change_me" })); }catch(_){}
    standaloneAssignNoFlprBotGlobal("flprBotSyncEnabled", standaloneNoFlprBotFalse);
    standaloneAssignNoFlprBotGlobal("flprBotSyncBaseUrl", standaloneNoFlprBotEmpty);
    standaloneAssignNoFlprBotGlobal("flprBotSyncToken", standaloneNoFlprBotEmpty);
    standaloneAssignNoFlprBotGlobal("flprBotSyncReportError", standaloneNoFlprBotVoid);
    standaloneAssignNoFlprBotGlobal("postFlprBotSync", standaloneNoFlprBotPost);
    standaloneAssignNoFlprBotGlobal("getFlprBotSync", standaloneNoFlprBotGet);
    standaloneAssignNoFlprBotGlobal("syncFlprBotTableFromNowPlaying", standaloneNoFlprBotVoid);
    standaloneAssignNoFlprBotGlobal("getFlprBotNowPlayingCandidateForWorld", standaloneNoFlprBotNull);
    standaloneAssignNoFlprBotGlobal("syncFlprBotCurrentTableSnapshot", standaloneNoFlprBotNull);
    standaloneAssignNoFlprBotGlobal("syncFlprBotCurrentTable", standaloneNoFlprBotVoid);
    standaloneAssignNoFlprBotGlobal("syncFlprBotBossKeys", standaloneNoFlprBotVoid);
    standaloneAssignNoFlprBotGlobal("getFlprBotBossStatusSnapshot", standaloneNoFlprBotNull);
    standaloneAssignNoFlprBotGlobal("syncFlprBotBossStatus", standaloneNoFlprBotVoid);
    standaloneAssignNoFlprBotGlobal("getFlprBotEpisodeSnapshot", standaloneNoFlprBotNull);
    standaloneAssignNoFlprBotGlobal("syncFlprBotEpisodeState", standaloneNoFlprBotVoid);
    standaloneAssignNoFlprBotGlobal("hintPostHangmanBotState", standaloneNoFlprBotVoid);
    standaloneAssignNoFlprBotGlobal("hintStartFlprBotHangmanPoll", standaloneNoFlprBotVoid);
    standaloneAssignNoFlprBotGlobal("hintStopFlprBotHangmanPoll", standaloneNoFlprBotVoid);
    standaloneAssignNoFlprBotGlobal("hintAnnounceHangmanCorrect", standaloneNoFlprBotVoid);
    standaloneAssignNoFlprBotGlobal("ensureFlprBotUtilityControl", standaloneMarkNoFlprBotFunction(function standaloneNoFlprBotUtilityControl(){
      standaloneRemoveFlprBotUtilityControl();
      return null;
    }, "utility"));
    standaloneRemoveFlprBotUtilityControl();
  }

  function installStandaloneNoFlprBotSyncBridge(){
    disableStandaloneFlprBotSync();
    try{
      if(standaloneFlprBotSyncDisableRuntime.timer) return;
      standaloneFlprBotSyncDisableRuntime.ticks = 0;
      standaloneFlprBotSyncDisableRuntime.timer = setInterval(()=>{
        try{ disableStandaloneFlprBotSync(); }catch(_){}
        standaloneFlprBotSyncDisableRuntime.ticks += 1;
        if(standaloneFlprBotSyncDisableRuntime.ticks >= 32){
          try{ clearInterval(standaloneFlprBotSyncDisableRuntime.timer); }catch(_){}
          standaloneFlprBotSyncDisableRuntime.timer = 0;
        }
      }, 250);
    }catch(_){}
  }

  const standaloneNoEpisodeRuntime = {
    timer: 0,
    ticks: 0
  };

  function standaloneDisabledEpisodeState(){
    return { version:1, status:"disabled", startedAt:0, endedAt:0, pausedAt:0, seedName:"", reason:"home-edition", runId:"" };
  }

  function standaloneMarkNoEpisodeFunction(fn, role){
    try{ Object.defineProperty(fn, "__flprStandaloneNoEpisode", { value:String(role || "noop"), configurable:true }); }catch(_){}
    return fn;
  }

  const standaloneNoEpisodeFalse = standaloneMarkNoEpisodeFunction(function standaloneNoEpisodeFalse(){ return false; }, "false");
  const standaloneNoEpisodeTrue = standaloneMarkNoEpisodeFunction(function standaloneNoEpisodeTrue(){ return true; }, "true");
  const standaloneNoEpisodeState = standaloneMarkNoEpisodeFunction(function standaloneNoEpisodeState(){ return standaloneDisabledEpisodeState(); }, "state");
  const standaloneNoEpisodeSave = standaloneMarkNoEpisodeFunction(function standaloneNoEpisodeSave(){ return false; }, "save");

  function standaloneAssignNoEpisodeGlobal(name, fn){
    try{ window[name] = fn; }catch(_){}
    try{
      switch(name){
        case "episodeFreshState": episodeFreshState = fn; break;
        case "episodeLoadState": episodeLoadState = fn; break;
        case "episodeSaveState": episodeSaveState = fn; break;
        case "episodeCanTrack": episodeCanTrack = fn; break;
        case "episodeSetStatus": episodeSetStatus = fn; break;
        case "episodeStartOrResume": episodeStartOrResume = fn; break;
        case "episodeEndEarly": episodeEndEarly = fn; break;
        case "episodeMarkBossComplete": episodeMarkBossComplete = fn; break;
        case "episodeNeedsManualStartGate": episodeNeedsManualStartGate = fn; break;
        case "updateEpisodeControlsUi": updateEpisodeControlsUi = fn; break;
        default: break;
      }
    }catch(_){}
  }

  function standaloneScrubEpisodeUi(){
    try{ document.body.classList.add("flprStandaloneNoEpisode"); }catch(_){}
    try{
      document.querySelectorAll("#episodeSectionTitle, #episodeCtlRow, #episodeStateTxt").forEach((node)=>{
        try{ node.remove(); }catch(_){}
      });
    }catch(_){}
    try{
      document.querySelectorAll(".connectPanelSection").forEach((section)=>{
        const title = String(section.querySelector(".connectPanelSectionTitle")?.innerText || section.innerText || "");
        if(/episode\s+tracking/i.test(title)) section.remove();
      });
    }catch(_){}
  }

  function disableStandaloneEpisodeFeatures(){
    try{ window.__flprStandaloneEpisodeDisabled = true; }catch(_){}
    try{ window.__flprStandaloneEpisodeDisabledAt = Date.now(); }catch(_){}
    try{ localStorage.removeItem(STANDALONE_EPISODE_LS_KEY); }catch(_){}
    try{ episodeState = standaloneDisabledEpisodeState(); }catch(_){}
    try{ window.episodeState = standaloneDisabledEpisodeState(); }catch(_){}
    standaloneAssignNoEpisodeGlobal("episodeFreshState", standaloneNoEpisodeState);
    standaloneAssignNoEpisodeGlobal("episodeLoadState", standaloneNoEpisodeState);
    standaloneAssignNoEpisodeGlobal("episodeSaveState", standaloneNoEpisodeSave);
    standaloneAssignNoEpisodeGlobal("episodeCanTrack", standaloneNoEpisodeTrue);
    standaloneAssignNoEpisodeGlobal("episodeSetStatus", standaloneNoEpisodeFalse);
    standaloneAssignNoEpisodeGlobal("episodeStartOrResume", standaloneNoEpisodeFalse);
    standaloneAssignNoEpisodeGlobal("episodeEndEarly", standaloneNoEpisodeFalse);
    standaloneAssignNoEpisodeGlobal("episodeMarkBossComplete", standaloneNoEpisodeFalse);
    standaloneAssignNoEpisodeGlobal("episodeNeedsManualStartGate", standaloneNoEpisodeFalse);
    standaloneAssignNoEpisodeGlobal("updateEpisodeControlsUi", standaloneMarkNoEpisodeFunction(function standaloneNoEpisodeUpdateUi(){
      standaloneScrubEpisodeUi();
      return false;
    }, "ui"));
    standaloneScrubEpisodeUi();
  }

  function installStandaloneNoEpisodeBridge(){
    disableStandaloneEpisodeFeatures();
    try{
      if(standaloneNoEpisodeRuntime.timer) return;
      standaloneNoEpisodeRuntime.ticks = 0;
      standaloneNoEpisodeRuntime.timer = setInterval(()=>{
        try{ disableStandaloneEpisodeFeatures(); }catch(_){}
        standaloneNoEpisodeRuntime.ticks += 1;
        if(standaloneNoEpisodeRuntime.ticks >= 32){
          try{ clearInterval(standaloneNoEpisodeRuntime.timer); }catch(_){}
          standaloneNoEpisodeRuntime.timer = 0;
        }
      }, 250);
    }catch(_){}
  }

  function installStandaloneNoChatHangmanBridge(){
    try{ window.FLPR_STANDALONE_CHAT_HANGMAN_DISABLED = true; }catch(_){}
    try{
      if(typeof hintCancelHangman === "function") hintCancelHangman();
      else if(typeof hintState !== "undefined" && hintState) hintState.hangman = null;
    }catch(_){}
    try{ if(typeof hintStopHangmanCooldownTimer === "function") hintStopHangmanCooldownTimer(); }catch(_){}
    try{ if(typeof hintStopFlprBotHangmanPoll === "function") hintStopFlprBotHangmanPoll(); }catch(_){}

    try{
      if(typeof hintCanStartHangman === "function" && hintCanStartHangman.__flprStandaloneNoChatHangman !== true){
        const original = hintCanStartHangman;
        const disabled = function standaloneNoChatHangmanCanStart(){
          return false;
        };
        disabled.__flprStandaloneNoChatHangman = true;
        disabled.__flprStandaloneOriginalHintCanStartHangman = original;
        hintCanStartHangman = disabled;
        window.hintCanStartHangman = disabled;
      }
    }catch(_){}
    try{
      if(typeof hintStartHangman === "function" && hintStartHangman.__flprStandaloneNoChatHangman !== true){
        const original = hintStartHangman;
        const disabled = function standaloneNoChatHangmanStart(){
          try{ if(typeof hintCancelHangman === "function") hintCancelHangman(); }catch(_){}
          return false;
        };
        disabled.__flprStandaloneNoChatHangman = true;
        disabled.__flprStandaloneOriginalHintStartHangman = original;
        hintStartHangman = disabled;
        window.hintStartHangman = disabled;
      }
    }catch(_){}
    try{
      if(typeof hintStartTestHangman === "function" && hintStartTestHangman.__flprStandaloneNoChatHangman !== true){
        const original = hintStartTestHangman;
        const disabled = function standaloneNoChatHangmanTest(){
          try{ if(typeof hintLog === "function") hintLog("[Home Edition] Chat Hangman is disabled."); }catch(_){}
          try{ if(typeof toast === "function") toast("info", "HOME EDITION", "Chat Hangman is disabled in Home Edition.", 2200); }catch(_){}
          return false;
        };
        disabled.__flprStandaloneNoChatHangman = true;
        disabled.__flprStandaloneOriginalHintStartTestHangman = original;
        hintStartTestHangman = disabled;
        window.hintStartTestHangman = disabled;
      }
    }catch(_){}
    try{
      if(typeof hintHandleHangmanGuess === "function" && hintHandleHangmanGuess.__flprStandaloneNoChatHangman !== true){
        const original = hintHandleHangmanGuess;
        const disabled = function standaloneNoChatHangmanGuess(){
          return false;
        };
        disabled.__flprStandaloneNoChatHangman = true;
        disabled.__flprStandaloneOriginalHintHandleHangmanGuess = original;
        hintHandleHangmanGuess = disabled;
        window.hintHandleHangmanGuess = disabled;
      }
    }catch(_){}
    try{
      if(typeof hintStartFlprBotHangmanPoll === "function" && hintStartFlprBotHangmanPoll.__flprStandaloneNoChatHangman !== true){
        const original = hintStartFlprBotHangmanPoll;
        const disabled = function standaloneNoChatHangmanPoll(){
          return false;
        };
        disabled.__flprStandaloneNoChatHangman = true;
        disabled.__flprStandaloneOriginalHintStartFlprBotHangmanPoll = original;
        hintStartFlprBotHangmanPoll = disabled;
        window.hintStartFlprBotHangmanPoll = disabled;
      }
    }catch(_){}

    try{
      document.querySelectorAll("#hintTestHangmanBtn, #testHangmanBtn, [data-testtag='Hangman']").forEach((node)=>{
        node.hidden = true;
        node.style.display = "none";
        node.setAttribute("aria-hidden", "true");
      });
      document.querySelectorAll(".hintHangmanCard, .hintHangmanCooldowns, .hintHangmanChat").forEach((node)=>{
        node.remove();
      });
      const box = document.getElementById("hintRevealBox");
      if(box) box.classList.remove("hangman");
      document.querySelectorAll(".hintMeta").forEach((node)=>{
        const text = String(node.textContent || "");
        if(/hangman/i.test(text)){
          node.textContent = "Hints are generated as Home Edition boss-key clues.";
        }
      });
    }catch(_){}
  }

  function standaloneClearMusicScenario(name, opts){
    const key = String(name || "").trim();
    if(!key) return false;
    const options = opts || {};
    let changed = false;
    try{
      const refs = (typeof musicGetRefs === "function") ? musicGetRefs() : (state?.musicRefs || null);
      if(refs && typeof refs === "object" && String(refs[key] || "").trim()){
        refs[key] = "";
        changed = true;
      }
    }catch(_){}
    try{
      const meta = (typeof musicGetMeta === "function") ? musicGetMeta() : (state?.musicMeta || null);
      if(meta && typeof meta === "object" && Object.prototype.hasOwnProperty.call(meta, key)){
        delete meta[key];
        changed = true;
      }
    }catch(_){}
    try{
      const modes = (typeof musicGetModes === "function") ? musicGetModes() : (state?.musicModes || null);
      if(modes && typeof modes === "object" && Object.prototype.hasOwnProperty.call(modes, key)){
        delete modes[key];
        changed = true;
      }
    }catch(_){}
    try{
      const volumes = (typeof musicGetVolumes === "function") ? musicGetVolumes() : (state?.musicVolumes || null);
      if(volumes && typeof volumes === "object" && Object.prototype.hasOwnProperty.call(volumes, key)){
        delete volumes[key];
        changed = true;
      }
    }catch(_){}
    try{
      const mgr = (typeof musicEnsureManager === "function") ? musicEnsureManager() : (window.__flprMusic || null);
      if(mgr && (String(mgr.current || "") === key || String(mgr.preview || "") === key)){
        if(typeof musicStop === "function") musicStop({ clearSrc:false });
      }
    }catch(_){}
    if(changed && !options.skipSave){
      try{ if(typeof saveState === "function") saveState(); }catch(_){}
    }
    try{
      const metaNode = document.getElementById(`musicMeta_${key}`);
      if(metaNode) metaNode.textContent = "No track loaded.";
    }catch(_){}
    return changed;
  }

  function installStandaloneRandomizerOpenMusicBridge(){
    standaloneClearMusicScenario(STANDALONE_RANDOMIZER_OPEN_SCENARIO);

    try{
      if(typeof applyBundledMusicScenarioDefaults === "function" && applyBundledMusicScenarioDefaults.__flprStandaloneNoRandomizerOpen !== true){
        const original = applyBundledMusicScenarioDefaults;
        const bridged = function standaloneApplyBundledMusicScenarioDefaults(targetState){
          const changed = !!original.apply(this, arguments);
          let removed = false;
          try{
            if(targetState && typeof targetState === "object"){
              if(targetState.musicRefs && String(targetState.musicRefs[STANDALONE_RANDOMIZER_OPEN_SCENARIO] || "").trim()){
                targetState.musicRefs[STANDALONE_RANDOMIZER_OPEN_SCENARIO] = "";
                removed = true;
              }
              if(targetState.musicMeta && Object.prototype.hasOwnProperty.call(targetState.musicMeta, STANDALONE_RANDOMIZER_OPEN_SCENARIO)){
                delete targetState.musicMeta[STANDALONE_RANDOMIZER_OPEN_SCENARIO];
                removed = true;
              }
            }
          }catch(_){}
          standaloneClearMusicScenario(STANDALONE_RANDOMIZER_OPEN_SCENARIO, { skipSave:true });
          return changed || removed;
        };
        bridged.__flprStandaloneNoRandomizerOpen = true;
        bridged.__flprStandaloneOriginal = original;
        applyBundledMusicScenarioDefaults = bridged;
        window.applyBundledMusicScenarioDefaults = bridged;
      }
    }catch(_){}

    try{
      if(typeof musicSetScenarioRef === "function" && musicSetScenarioRef.__flprStandaloneNoRandomizerOpen !== true){
        const original = musicSetScenarioRef;
        const bridged = function standaloneMusicSetScenarioRef(name, ref, meta){
          if(String(name || "").trim() === STANDALONE_RANDOMIZER_OPEN_SCENARIO){
            standaloneClearMusicScenario(STANDALONE_RANDOMIZER_OPEN_SCENARIO);
            try{ if(typeof renderMusicScenarioCard === "function") renderMusicScenarioCard(); }catch(_){}
            return false;
          }
          return original.apply(this, arguments);
        };
        bridged.__flprStandaloneNoRandomizerOpen = true;
        bridged.__flprStandaloneOriginal = original;
        musicSetScenarioRef = bridged;
        window.musicSetScenarioRef = bridged;
      }
    }catch(_){}

    try{
      if(typeof musicPlayScenario === "function" && musicPlayScenario.__flprStandaloneNoRandomizerOpen !== true){
        const original = musicPlayScenario;
        const bridged = function standaloneMusicPlayScenario(name, opts){
          if(String(name || "").trim() === STANDALONE_RANDOMIZER_OPEN_SCENARIO){
            standaloneClearMusicScenario(STANDALONE_RANDOMIZER_OPEN_SCENARIO);
            try{ if(opts?.forceStopIfMissing && typeof musicStop === "function") musicStop({ clearSrc:false }); }catch(_){}
            return false;
          }
          return original.apply(this, arguments);
        };
        bridged.__flprStandaloneNoRandomizerOpen = true;
        bridged.__flprStandaloneOriginal = original;
        musicPlayScenario = bridged;
        window.musicPlayScenario = bridged;
      }
    }catch(_){}

    try{
      if(typeof musicLockScenario === "function" && musicLockScenario.__flprStandaloneNoRandomizerOpen !== true){
        const original = musicLockScenario;
        const bridged = function standaloneMusicLockScenario(name, lockMs){
          if(String(name || "").trim() === STANDALONE_RANDOMIZER_OPEN_SCENARIO){
            standaloneClearMusicScenario(STANDALONE_RANDOMIZER_OPEN_SCENARIO);
            return false;
          }
          return original.apply(this, arguments);
        };
        bridged.__flprStandaloneNoRandomizerOpen = true;
        bridged.__flprStandaloneOriginal = original;
        musicLockScenario = bridged;
        window.musicLockScenario = bridged;
      }
    }catch(_){}

    standaloneClearMusicScenario(STANDALONE_RANDOMIZER_OPEN_SCENARIO);
  }

  installStandaloneNoFlprBotSyncBridge();
  installStandaloneNoEpisodeBridge();

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
        width:max(calc(var(--captureW) + var(--bonusLeaderboardW) + var(--controlsW) + var(--gutter) + 32px), 100vw) !important;
        height:max(var(--captureH), 100vh) !important;
        overflow:hidden !important;
      }
      html.flprStandaloneWindowClient.flprStandaloneVerticalViewport,
      html.flprStandaloneWindowClient.flprStandaloneVerticalViewport body{
        width:100vw !important;
        max-width:100vw !important;
        height:100vh !important;
        min-width:0 !important;
        min-height:0 !important;
        overflow:hidden !important;
      }
      body.flprStandaloneOriginalClient{
        position:relative !important;
        background:linear-gradient(180deg,var(--bg1),var(--bg2)) !important;
      }
      body.flprStandaloneOriginalClient.flprStandaloneVerticalViewport{
        --captureW:910px !important;
        --captureH:1258px !important;
        --controlsW:1032px !important;
        --bonusLeaderboardW:0px !important;
        --gutter:13px !important;
        --flprStandaloneViewportH:948px !important;
        --flprStandaloneControlsH:518px !important;
        --flprStandalonePortraitPadX:24px !important;
        --flprStandalonePortraitPadTop:111px !important;
        --flprStandalonePortraitPadBottom:20px !important;
      }
      body.flprStandaloneOriginalClient .stage{
        width:max(calc(var(--captureW) + var(--bonusLeaderboardW) + var(--controlsW) + var(--gutter) + 32px), 100vw) !important;
        height:max(var(--captureH), 100vh) !important;
        min-width:calc(var(--captureW) + var(--bonusLeaderboardW) + var(--controlsW) + var(--gutter) + 32px) !important;
        min-height:var(--captureH) !important;
        justify-content:flex-start !important;
        align-items:flex-start !important;
        transform:none !important;
        transform-origin:top left !important;
        transition:filter .24s ease, opacity .24s ease !important;
      }
      body.flprStandaloneOriginalClient:not(.flprStandaloneVerticalViewport) .stage{
        width:max(calc(var(--captureW) + var(--bonusLeaderboardW) + var(--controlsW) + var(--gutter) + 32px), 100vw) !important;
        height:100vh !important;
        min-width:0 !important;
        min-height:0 !important;
      }
      body.flprStandaloneOriginalClient.flprStandaloneVerticalViewport .stage{
        width:100vw !important;
        max-width:100vw !important;
        height:100vh !important;
        min-width:0 !important;
        min-height:0 !important;
        display:grid !important;
        grid-template-columns:1fr !important;
        grid-template-rows:minmax(0, var(--captureH)) minmax(0, var(--flprStandaloneControlsH)) !important;
        gap:var(--gutter) !important;
        padding:var(--flprStandalonePortraitPadTop) var(--flprStandalonePortraitPadX) var(--flprStandalonePortraitPadBottom) !important;
        align-content:start !important;
        justify-items:center !important;
        justify-content:initial !important;
        align-items:initial !important;
        overflow:hidden !important;
        background:
          radial-gradient(96% 50% at 50% 12%, rgba(0,217,255,.16), transparent 60%),
          repeating-linear-gradient(45deg, rgba(0,255,213,.10) 0 2px, transparent 2px 28px),
          repeating-linear-gradient(-45deg, rgba(255,86,214,.08) 0 2px, transparent 2px 34px),
          linear-gradient(180deg, rgba(0,18,31,.96), rgba(0,6,16,.98)) !important;
        background-size:100% 100%, 112px 112px, 136px 136px, 100% 100% !important;
      }
      body.flprStandaloneOriginalClient.flprStandaloneNeedsProfile .stage,
      body.flprStandaloneOriginalClient.flprStandaloneModePicking .stage{
        filter:brightness(.42) saturate(.76) !important;
      }
      body.flprStandaloneOriginalClient.flprStandaloneNeedsProfile .controlsShell,
      body.flprStandaloneOriginalClient.flprStandaloneNeedsProfile .controls,
      body.flprStandaloneOriginalClient.flprStandaloneNeedsProfile .controlsBody{
        filter:brightness(.54) saturate(.82) !important;
      }
      body.flprStandaloneOriginalClient.flprStandaloneModePicking .controlsShell,
      body.flprStandaloneOriginalClient.flprStandaloneModePicking .controls,
      body.flprStandaloneOriginalClient.flprStandaloneModePicking .controlsBody{
        filter:brightness(.42) saturate(.76) !important;
      }
      body.flprStandaloneOriginalClient.flprStandaloneModePicking .controlsBody{
        box-shadow:
          0 0 0 1px rgba(0,255,213,.16) inset,
          0 0 24px rgba(0,217,255,.18) !important;
      }
      body.flprStandaloneOriginalClient.flprStandaloneModePicking .controlsPanels::after{
        content:"" !important;
        position:absolute !important;
        inset:0 !important;
        z-index:75 !important;
        display:block !important;
        pointer-events:auto !important;
        border:1px solid rgba(0,255,213,.24) !important;
        border-radius:12px !important;
        background:linear-gradient(180deg, rgba(0,6,14,.58), rgba(0,2,8,.78)) !important;
      }
      body.flprStandaloneOriginalClient .standaloneProfileGate{
        position:fixed !important;
        inset:0 !important;
        z-index:2147483646 !important;
        display:flex !important;
        align-items:center !important;
        justify-content:center !important;
        padding:28px !important;
        background:
          radial-gradient(circle at 52% 28%, rgba(0,217,255,.16), transparent 38%),
          linear-gradient(180deg, rgba(0,6,14,.80), rgba(0,2,8,.92)) !important;
        pointer-events:auto !important;
      }
      body.flprStandaloneOriginalClient .standaloneProfileGate[hidden]{
        display:none !important;
      }
      body.flprStandaloneOriginalClient .standaloneModeGate{
        position:fixed !important;
        inset:0 !important;
        z-index:2147483645 !important;
        display:flex !important;
        align-items:center !important;
        justify-content:center !important;
        padding:24px !important;
        background:
          radial-gradient(circle at 50% 30%, rgba(0,217,255,.16), transparent 34%),
          linear-gradient(180deg, rgba(0,6,14,.74), rgba(0,2,8,.90)) !important;
        pointer-events:auto !important;
      }
      body.flprStandaloneOriginalClient .standaloneModeGate[hidden]{
        display:none !important;
      }
      body.flprStandaloneOriginalClient .flprQuickStartOverlay{
        position:fixed !important;
        inset:0 !important;
        z-index:2147483644 !important;
        display:flex !important;
        align-items:center !important;
        justify-content:center !important;
        padding:24px !important;
        background:
          radial-gradient(circle at 50% 24%, rgba(0,217,255,.18), transparent 36%),
          linear-gradient(180deg, rgba(0,6,14,.74), rgba(0,2,8,.92)) !important;
        pointer-events:auto !important;
      }
      body.flprStandaloneOriginalClient .flprQuickStartOverlay[hidden]{
        display:none !important;
      }
      body.flprStandaloneOriginalClient .flprQuickStartCard{
        width:min(1560px, calc(100vw - 48px)) !important;
        max-height:calc(100vh - 48px) !important;
        display:grid !important;
        grid-template-rows:auto auto minmax(0, 1fr) auto !important;
        gap:18px !important;
        border:1px solid rgba(0,255,213,.72) !important;
        border-radius:16px !important;
        padding:28px !important;
        background:
          radial-gradient(100% 120% at 50% 0%, rgba(0,217,255,.15), transparent 56%),
          linear-gradient(180deg, rgba(4,24,39,.98), rgba(0,8,18,.98)) !important;
        box-shadow:
          0 0 0 1px rgba(0,217,255,.18) inset,
          0 24px 58px rgba(0,0,0,.58),
          0 0 34px rgba(0,217,255,.22) !important;
        overflow:hidden !important;
      }
      body.flprStandaloneOriginalClient .flprQuickStartHead{
        display:flex !important;
        justify-content:space-between !important;
        align-items:flex-start !important;
        gap:18px !important;
        position:relative !important;
        z-index:3 !important;
      }
      body.flprStandaloneOriginalClient .flprQuickStartHeadActions{
        display:flex !important;
        align-items:flex-start !important;
        justify-content:flex-end !important;
        gap:10px !important;
        flex-wrap:wrap !important;
        min-width:340px !important;
      }
      body.flprStandaloneOriginalClient .flprQuickStartModeSwitch{
        display:flex !important;
        gap:8px !important;
        flex-wrap:wrap !important;
        justify-content:flex-end !important;
      }
      body.flprStandaloneOriginalClient .flprQuickStartModeBtn{
        border:1px solid rgba(0,166,255,.62) !important;
        border-radius:10px !important;
        background:linear-gradient(180deg, rgba(7,26,44,.94), rgba(3,16,26,.94)) !important;
        color:rgba(232,250,255,.88) !important;
        padding:12px 14px !important;
        min-height:42px !important;
        font-family:var(--flprUiFontFamily, var(--mono, monospace)) !important;
        font-size:14px !important;
        line-height:1.1 !important;
        cursor:pointer !important;
      }
      body.flprStandaloneOriginalClient .flprQuickStartModeBtn.active{
        border-color:rgba(34,255,136,.92) !important;
        color:rgba(34,255,136,.98) !important;
        box-shadow:0 0 18px rgba(34,255,136,.18) !important;
      }
      body.flprStandaloneOriginalClient .flprQuickStartCloseX{
        width:58px !important;
        min-width:58px !important;
        height:58px !important;
        padding:0 !important;
        border-radius:14px !important;
        display:inline-flex !important;
        align-items:center !important;
        justify-content:center !important;
        font-family:var(--flprTitleFontFamily, var(--flprUiFontFamily)) !important;
        font-size:28px !important;
        line-height:1 !important;
      }
      body.flprStandaloneOriginalClient .flprQuickStartTitle{
        font-family:var(--flprTitleFontFamily, var(--flprUiFontFamily)) !important;
        font-size:56px !important;
        line-height:1.05 !important;
        color:rgba(238,255,252,.98) !important;
        text-shadow:0 0 14px rgba(0,217,255,.35) !important;
      }
      body.flprStandaloneOriginalClient .flprQuickStartSub{
        margin-top:10px !important;
        font-size:20px !important;
        line-height:1.45 !important;
        color:rgba(190,226,238,.82) !important;
      }
      body.flprStandaloneOriginalClient .flprQuickStartTabs{
        display:flex !important;
        flex-wrap:wrap !important;
        gap:8px !important;
        position:relative !important;
        z-index:3 !important;
      }
      body.flprStandaloneOriginalClient .flprQuickStartTab{
        border:1px solid rgba(0,166,255,.62) !important;
        border-radius:10px !important;
        background:linear-gradient(180deg, rgba(7,26,44,.94), rgba(3,16,26,.94)) !important;
        color:rgba(232,250,255,.88) !important;
        padding:12px 16px !important;
        font-family:var(--flprUiFontFamily, var(--mono, monospace)) !important;
        font-size:16px !important;
        line-height:1.1 !important;
        cursor:pointer !important;
      }
      body.flprStandaloneOriginalClient .flprQuickStartTab.active{
        border-color:rgba(34,255,136,.92) !important;
        color:rgba(34,255,136,.98) !important;
        box-shadow:0 0 18px rgba(34,255,136,.18) !important;
      }
      body.flprStandaloneOriginalClient .flprQuickStartBody{
        min-height:0 !important;
        overflow:auto !important;
        border:1px solid rgba(0,166,255,.34) !important;
        border-radius:12px !important;
        padding:20px !important;
        background:linear-gradient(180deg, rgba(0,21,36,.72), rgba(0,8,18,.80)) !important;
        position:relative !important;
        z-index:1 !important;
      }
      body.flprStandaloneOriginalClient .flprQuickStartGrid{
        display:grid !important;
        grid-template-columns:repeat(2, minmax(0, 1fr)) !important;
        gap:14px !important;
      }
      body.flprStandaloneOriginalClient .flprQuickStartPanel{
        border:1px solid rgba(0,166,255,.38) !important;
        border-radius:10px !important;
        padding:18px !important;
        background:linear-gradient(180deg, rgba(0,34,62,.72), rgba(0,12,24,.84)) !important;
      }
      body.flprStandaloneOriginalClient .flprQuickStartPanel.wide{
        grid-column:1 / -1 !important;
      }
      body.flprStandaloneOriginalClient .flprQuickStartPanel strong,
      body.flprStandaloneOriginalClient .flprQuickStartListTitle{
        display:block !important;
        color:rgba(34,255,136,.98) !important;
        font-size:18px !important;
        line-height:1.25 !important;
        margin-bottom:10px !important;
      }
      body.flprStandaloneOriginalClient .flprQuickStartPanel span,
      body.flprStandaloneOriginalClient .flprQuickStartPanel li,
      body.flprStandaloneOriginalClient .flprQuickStartPanel p{
        color:rgba(232,250,255,.82) !important;
        font-size:17px !important;
        line-height:1.55 !important;
      }
      body.flprStandaloneOriginalClient .flprQuickStartPanel ul,
      body.flprStandaloneOriginalClient .flprQuickStartPanel ol{
        margin:0 !important;
        padding-left:18px !important;
      }
      body.flprStandaloneOriginalClient .flprQuickStartTableList{
        display:grid !important;
        grid-template-columns:repeat(2, minmax(0, 1fr)) !important;
        gap:10px !important;
      }
      body.flprStandaloneOriginalClient .flprQuickStartTableRow{
        display:grid !important;
        grid-template-columns:1fr auto !important;
        gap:12px !important;
        align-items:center !important;
        border:1px solid rgba(0,166,255,.28) !important;
        border-radius:8px !important;
        padding:12px !important;
        background:rgba(0,12,24,.64) !important;
        color:inherit !important;
        text-decoration:none !important;
      }
      body.flprStandaloneOriginalClient .flprQuickStartTableRow .name{
        color:rgba(232,250,255,.90) !important;
        font-size:15px !important;
        line-height:1.3 !important;
      }
      body.flprStandaloneOriginalClient .flprQuickStartTableRow .meta{
        color:rgba(255,214,122,.88) !important;
        font-size:13px !important;
        white-space:nowrap !important;
      }
      body.flprStandaloneOriginalClient .flprQuickStartTableRow:hover{
        border-color:rgba(34,255,136,.66) !important;
        box-shadow:0 0 18px rgba(34,255,136,.12) !important;
      }
      body.flprStandaloneOriginalClient .flprQuickGuideSwitch{
        display:flex !important;
        gap:10px !important;
        flex-wrap:wrap !important;
        margin-bottom:14px !important;
      }
      body.flprStandaloneOriginalClient .flprQuickGuideSwitch button{
        border:1px solid rgba(0,166,255,.62) !important;
        border-radius:10px !important;
        background:linear-gradient(180deg, rgba(7,26,44,.94), rgba(3,16,26,.94)) !important;
        color:rgba(232,250,255,.88) !important;
        padding:12px 16px !important;
        font-family:var(--flprUiFontFamily, var(--mono, monospace)) !important;
        font-size:16px !important;
        cursor:pointer !important;
      }
      body.flprStandaloneOriginalClient .flprQuickGuideSwitch button.active{
        border-color:rgba(34,255,136,.92) !important;
        color:rgba(34,255,136,.98) !important;
        box-shadow:0 0 18px rgba(34,255,136,.18) !important;
      }
      body.flprStandaloneOriginalClient .flprQuickGuideGrid{
        display:grid !important;
        grid-template-columns:repeat(3, minmax(0, 1fr)) !important;
        gap:14px !important;
      }
      body.flprStandaloneOriginalClient .flprQuickGuideItem{
        border:1px solid rgba(0,166,255,.34) !important;
        border-radius:10px !important;
        padding:16px !important;
        background:linear-gradient(180deg, rgba(0,34,62,.70), rgba(0,10,22,.88)) !important;
      }
      body.flprStandaloneOriginalClient .flprQuickGuideItem .tag{
        display:inline-flex !important;
        align-items:center !important;
        min-height:24px !important;
        padding:4px 8px !important;
        border:1px solid rgba(255,214,122,.44) !important;
        border-radius:999px !important;
        color:rgba(255,224,146,.96) !important;
        font-size:13px !important;
        margin-bottom:10px !important;
      }
      body.flprStandaloneOriginalClient .flprQuickGuideItem strong{
        display:block !important;
        color:rgba(34,255,136,.98) !important;
        font-size:17px !important;
        line-height:1.25 !important;
        margin-bottom:8px !important;
      }
      body.flprStandaloneOriginalClient .flprQuickGuideItem span{
        color:rgba(232,250,255,.82) !important;
        font-size:15px !important;
        line-height:1.45 !important;
      }
      body.flprStandaloneOriginalClient .flprQuickStartFooter{
        display:flex !important;
        align-items:center !important;
        justify-content:space-between !important;
        gap:14px !important;
      }
      body.flprStandaloneOriginalClient .flprQuickStartDontShow{
        display:flex !important;
        align-items:center !important;
        gap:8px !important;
        color:rgba(232,250,255,.74) !important;
        font-size:15px !important;
      }
      body.flprStandaloneOriginalClient .flprQuickStartActions{
        display:flex !important;
        flex-wrap:wrap !important;
        justify-content:flex-end !important;
        gap:8px !important;
      }
      @media (max-width:980px){
        body.flprStandaloneOriginalClient .flprQuickStartCard{ padding:18px !important; }
        body.flprStandaloneOriginalClient .flprQuickStartTitle{ font-size:38px !important; }
        body.flprStandaloneOriginalClient .flprQuickStartSub{ font-size:16px !important; }
        body.flprStandaloneOriginalClient .flprQuickStartGrid,
        body.flprStandaloneOriginalClient .flprQuickStartTableList,
        body.flprStandaloneOriginalClient .flprQuickGuideGrid{ grid-template-columns:1fr !important; }
        body.flprStandaloneOriginalClient .flprQuickStartHead,
        body.flprStandaloneOriginalClient .flprQuickStartFooter{ flex-direction:column !important; align-items:stretch !important; }
        body.flprStandaloneOriginalClient .flprQuickStartHeadActions{ min-width:0 !important; justify-content:flex-start !important; }
        body.flprStandaloneOriginalClient .flprQuickStartModeSwitch{ justify-content:flex-start !important; }
      }
      body.flprStandaloneOriginalClient .standaloneModeCard{
        width:min(1160px, calc(100vw - 48px)) !important;
        border:1px solid rgba(0,255,213,.70) !important;
        border-radius:18px !important;
        padding:34px !important;
        background:
          radial-gradient(100% 120% at 50% 0%, rgba(0,217,255,.16), transparent 54%),
          linear-gradient(180deg, rgba(4,24,39,.98), rgba(0,8,18,.98)) !important;
        box-shadow:
          0 0 0 1px rgba(0,217,255,.18) inset,
          0 26px 58px rgba(0,0,0,.58),
          0 0 32px rgba(0,217,255,.24) !important;
      }
      body.flprStandaloneOriginalClient .standaloneModeTitle{
        font-size:30px !important;
        line-height:1.12 !important;
        color:rgba(238,255,252,.98) !important;
        margin-bottom:22px !important;
      }
      body.flprStandaloneOriginalClient .standaloneModeSub{
        font-size:14px !important;
        line-height:1.45 !important;
        color:rgba(190,226,238,.80) !important;
        margin-bottom:20px !important;
      }
      body.flprStandaloneOriginalClient .standaloneModeChoices{
        display:grid !important;
        grid-template-columns:repeat(2, minmax(0, 1fr)) !important;
        gap:16px !important;
      }
      body.flprStandaloneOriginalClient .standaloneModeChoice{
        position:relative !important;
        min-height:270px !important;
        display:flex !important;
        flex-direction:column !important;
        align-items:flex-start !important;
        justify-content:flex-start !important;
        gap:16px !important;
        padding:24px !important;
        border:1px solid rgba(0,166,255,.50) !important;
        border-radius:14px !important;
        background:
          radial-gradient(90% 110% at 20% 0%, rgba(0,217,255,.14), transparent 56%),
          linear-gradient(180deg, rgba(0,34,62,.88), rgba(0,12,24,.94)) !important;
        color:rgba(232,250,255,.96) !important;
        box-shadow:0 0 0 1px rgba(0,217,255,.10) inset !important;
        overflow:hidden !important;
        transform:translateY(0) scale(1) !important;
        transition:transform .18s ease, border-color .18s ease, box-shadow .18s ease, filter .18s ease, opacity .18s ease !important;
        text-align:left !important;
        font-family:var(--flprUiFontFamily, var(--mono, monospace)) !important;
      }
      body.flprStandaloneOriginalClient .standaloneModeChoice:hover,
      body.flprStandaloneOriginalClient .standaloneModeChoice:focus-visible{
        transform:translateY(-4px) scale(1.015) !important;
        border-color:rgba(0,255,213,.96) !important;
        box-shadow:
          0 0 0 1px rgba(0,255,213,.18) inset,
          0 0 24px rgba(0,217,255,.36),
          0 0 38px rgba(255,214,122,.14) !important;
        filter:saturate(1.18) brightness(1.08) !important;
      }
      body.flprStandaloneOriginalClient .standaloneModeChoiceIcon{
        font-size:46px !important;
        line-height:1 !important;
      }
      body.flprStandaloneOriginalClient .standaloneModeChoiceTitle{
        font-size:28px !important;
        line-height:1.12 !important;
        color:rgba(238,255,252,.98) !important;
        font-family:var(--flprUiFontFamily, var(--mono, monospace)) !important;
      }
      body.flprStandaloneOriginalClient .standaloneModeChoiceText{
        font-size:17px !important;
        line-height:1.38 !important;
        color:rgba(190,226,238,.84) !important;
        font-family:var(--flprUiFontFamily, var(--mono, monospace)) !important;
      }
      body.flprStandaloneOriginalClient #viewChecks #checksCountersDock:not(.expanded) .counterDrawer:not(.open):not(.autoOpen){
        opacity:1 !important;
        border-color:rgba(0,210,255,.18) !important;
        background:
          radial-gradient(120% 110% at 10% 0%, rgba(0,255,213,.055), rgba(0,0,0,0) 62%),
          linear-gradient(180deg, rgba(6,22,36,.30), rgba(3,12,22,.25)) !important;
        box-shadow:
          0 8px 18px rgba(0,0,0,.18),
          0 0 14px rgba(0,180,255,.055),
          inset 0 0 0 1px rgba(255,255,255,.025) !important;
      }
      body.flprStandaloneOriginalClient #viewChecks #checksCountersDock:not(.expanded) .counterDrawer:not(.open):not(.autoOpen)::before{
        opacity:.06 !important;
      }
      body.flprStandaloneOriginalClient #viewChecks #checksCountersDock:not(.expanded) .counterDrawer:not(.open):not(.autoOpen) .counterDrawerHead,
      body.flprStandaloneOriginalClient #viewChecks #checksCountersDock:not(.expanded) .counterDrawer:not(.open):not(.autoOpen) .counterDrawerBody{
        opacity:.34 !important;
      }
      body.flprStandaloneOriginalClient #viewChecks #checksCountersDock:not(.expanded) .counterDrawer.flprStandaloneHasCollapsedRedeems:not(.open):not(.autoOpen){
        opacity:1 !important;
        filter:saturate(1.18) brightness(1.06) !important;
      }
      body.flprStandaloneOriginalClient #viewChecks #checksCountersDock:not(.expanded) .counterDrawer:not(.open):not(.autoOpen):hover,
      body.flprStandaloneOriginalClient #viewChecks #checksCountersDock:not(.expanded) .counterDrawer:not(.open):not(.autoOpen):focus-within{
        opacity:1 !important;
      }
      body.flprStandaloneOriginalClient #viewChecks #checksCountersDock:not(.expanded) .counterDrawer:not(.open):not(.autoOpen):hover .counterDrawerHead,
      body.flprStandaloneOriginalClient #viewChecks #checksCountersDock:not(.expanded) .counterDrawer:not(.open):not(.autoOpen):focus-within .counterDrawerHead,
      body.flprStandaloneOriginalClient #viewChecks #checksCountersDock:not(.expanded) .counterDrawer:not(.open):not(.autoOpen):hover .counterDrawerBody,
      body.flprStandaloneOriginalClient #viewChecks #checksCountersDock:not(.expanded) .counterDrawer:not(.open):not(.autoOpen):focus-within .counterDrawerBody{
        opacity:.92 !important;
      }
      body.flprStandaloneOriginalClient #viewChecks #checksCountersDock:not(.expanded) .counterDrawer.hasReady:not(.open):not(.autoOpen) .counterDrawerReadyBadge{
        opacity:1 !important;
        filter:saturate(1.12) brightness(1.08) !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneCollapsedRedeemCounter{
        display:none !important;
      }
      body.flprStandaloneOriginalClient #viewChecks #checksCountersDock:not(.expanded) .counterDrawer:not(.open):not(.autoOpen) .flprStandaloneCollapsedRedeemCounter{
        position:absolute !important;
        left:-76px !important;
        top:50% !important;
        z-index:8 !important;
        display:grid !important;
        grid-template-columns:auto auto !important;
        align-items:center !important;
        justify-content:center !important;
        gap:4px !important;
        min-width:56px !important;
        min-height:22px !important;
        padding:4px 6px !important;
        transform:translateY(-50%) !important;
        pointer-events:none !important;
        border-radius:999px !important;
        border:1px solid rgba(126,220,255,.54) !important;
        background:linear-gradient(180deg, rgba(8,30,50,.94), rgba(2,10,18,.96)) !important;
        box-shadow:0 0 10px rgba(0,217,255,.20), inset 0 0 0 1px rgba(255,255,255,.08) !important;
        color:rgba(207,235,246,.72) !important;
        opacity:1 !important;
        font-family:var(--flprUiFontFamily, var(--mono, monospace)) !important;
        font-size:7px !important;
        line-height:1 !important;
        letter-spacing:0 !important;
        text-shadow:0 0 8px rgba(0,217,255,.18) !important;
      }
      body.flprStandaloneOriginalClient #viewChecks #checksCountersDock:not(.expanded) .counterDrawer.flprStandaloneHasCollapsedRedeems:not(.open):not(.autoOpen) .flprStandaloneCollapsedRedeemCounter{
        border-color:rgba(34,255,136,.78) !important;
        color:rgba(224,255,238,.98) !important;
        background:
          radial-gradient(120% 130% at 18% 0%, rgba(34,255,136,.24), rgba(0,0,0,0) 58%),
          linear-gradient(180deg, rgba(8,42,34,.98), rgba(2,14,20,.98)) !important;
        box-shadow:0 0 14px rgba(34,255,136,.32), inset 0 0 0 1px rgba(255,255,255,.10) !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneCollapsedRedeemCounter .flprStandaloneCollapsedRedeemLabel{
        color:rgba(126,220,255,.78) !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneHasCollapsedRedeems .flprStandaloneCollapsedRedeemCounter .flprStandaloneCollapsedRedeemLabel{
        color:rgba(168,255,214,.96) !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneCollapsedRedeemCounter .flprStandaloneCollapsedRedeemValue{
        min-width:9px !important;
        color:rgba(245,252,255,.98) !important;
        text-align:right !important;
      }
      body.flprStandaloneOriginalClient .standaloneModeChoiceCue{
        margin-top:auto !important;
        font-size:14px !important;
        line-height:1.24 !important;
        color:rgba(255,224,122,.92) !important;
        font-family:var(--flprUiFontFamily, var(--mono, monospace)) !important;
      }
      body.flprStandaloneOriginalClient .standaloneModeGate.choosing .standaloneModeChoice:not(.selected){
        opacity:.28 !important;
        transform:scale(.96) !important;
        filter:saturate(.70) brightness(.78) !important;
      }
      body.flprStandaloneOriginalClient .standaloneModeGate.choosing .standaloneModeChoice.selected{
        animation:standaloneModeFlourish 640ms ease both !important;
        border-color:rgba(255,224,122,.98) !important;
      }
      @keyframes standaloneModeFlourish{
        0%{ transform:translateY(-4px) scale(1.015); box-shadow:0 0 18px rgba(0,217,255,.32); }
        45%{ transform:translateY(-9px) scale(1.045); box-shadow:0 0 28px rgba(0,255,213,.50), 0 0 54px rgba(255,224,122,.26); }
        100%{ transform:translateY(0) scale(1); box-shadow:0 0 22px rgba(0,217,255,.34), 0 0 42px rgba(255,224,122,.20); }
      }
      body.flprStandaloneOriginalClient.flprStandaloneNoEpisode #episodeSectionTitle,
      body.flprStandaloneOriginalClient.flprStandaloneNoEpisode #episodeCtlRow,
      body.flprStandaloneOriginalClient.flprStandaloneNoEpisode #episodeStateTxt{
        display:none !important;
      }
      body.flprStandaloneOriginalClient .standaloneProfileCard{
        width:min(1120px, calc(100vw - 48px)) !important;
        min-height:min(640px, calc(100vh - 48px)) !important;
        border:1px solid rgba(0,255,213,.74) !important;
        border-radius:16px !important;
        background:
          radial-gradient(110% 140% at 20% 0%, rgba(0,217,255,.16), transparent 54%),
          linear-gradient(180deg, rgba(4,24,39,.98), rgba(0,8,18,.98)) !important;
        box-shadow:
          0 0 0 1px rgba(0,217,255,.18) inset,
          0 26px 58px rgba(0,0,0,.58),
          0 0 28px rgba(0,217,255,.24) !important;
        color:rgba(235,252,255,.98) !important;
        padding:28px !important;
      }
      body.flprStandaloneOriginalClient .standaloneProfileTitle{
        font-size:30px !important;
        line-height:1.15 !important;
        margin-bottom:10px !important;
        color:rgba(238,255,252,.98) !important;
      }
      body.flprStandaloneOriginalClient .standaloneProfileSub,
      body.flprStandaloneOriginalClient .standaloneProfileHint{
        font-size:15px !important;
        line-height:1.45 !important;
        color:rgba(190,226,238,.78) !important;
      }
      body.flprStandaloneOriginalClient .standaloneProfileForm{
        display:grid !important;
        grid-template-columns:minmax(260px, 1fr) minmax(260px, .9fr) 140px !important;
        gap:16px !important;
        margin-top:22px !important;
      }
      body.flprStandaloneOriginalClient .standaloneProfileForm label{
        display:flex !important;
        flex-direction:column !important;
        gap:5px !important;
        min-width:0 !important;
      }
      body.flprStandaloneOriginalClient .standaloneEmojiPicker{
        position:relative !important;
        min-width:0 !important;
      }
      body.flprStandaloneOriginalClient .standaloneEmojiPickerButton{
        width:100% !important;
        min-height:48px !important;
        display:flex !important;
        align-items:center !important;
        justify-content:center !important;
        border:1px solid rgba(0,217,255,.62) !important;
        border-radius:10px !important;
        background:linear-gradient(180deg, rgba(0,34,62,.88), rgba(0,12,24,.94)) !important;
        color:rgba(238,255,252,.98) !important;
        font-size:28px !important;
        box-shadow:0 0 0 1px rgba(0,217,255,.12) inset !important;
      }
      body.flprStandaloneOriginalClient .standaloneEmojiGrid{
        display:grid !important;
        grid-template-columns:repeat(8, minmax(0, 1fr)) !important;
        gap:8px !important;
        margin-top:8px !important;
        padding:10px !important;
        border:1px solid rgba(0,255,213,.24) !important;
        border-radius:12px !important;
        background:rgba(0,10,18,.74) !important;
        max-height:204px !important;
        overflow:auto !important;
        scrollbar-width:thin !important;
        scrollbar-color:rgba(0,217,255,.78) rgba(0,18,31,.96) !important;
      }
      body.flprStandaloneOriginalClient .standaloneEmojiGrid[hidden]{
        display:none !important;
      }
      body.flprStandaloneOriginalClient .standaloneEmojiChoice{
        min-width:0 !important;
        min-height:38px !important;
        border:1px solid rgba(0,166,255,.38) !important;
        border-radius:9px !important;
        background:rgba(0,38,60,.74) !important;
        color:rgba(238,255,252,.98) !important;
        font-size:22px !important;
        line-height:1 !important;
      }
      body.flprStandaloneOriginalClient .standaloneEmojiChoice.active{
        border-color:rgba(0,255,213,.96) !important;
        box-shadow:0 0 14px rgba(0,217,255,.32) !important;
      }
      body.flprStandaloneOriginalClient .standaloneProfileExisting{
        display:flex !important;
        flex-wrap:wrap !important;
        gap:8px !important;
        margin-top:18px !important;
        max-height:162px !important;
        overflow:auto !important;
        scrollbar-width:thin !important;
        scrollbar-color:rgba(0,217,255,.78) rgba(0,18,31,.96) !important;
      }
      body.flprStandaloneOriginalClient .standaloneProfilePick{
        border:1px solid rgba(0,217,255,.46) !important;
        border-radius:12px !important;
        background:rgba(0,40,72,.56) !important;
        color:rgba(232,250,255,.94) !important;
        padding:7px 9px !important;
        display:flex !important;
        align-items:center !important;
        gap:8px !important;
      }
      body.flprStandaloneOriginalClient .standaloneProfileActions{
        display:flex !important;
        justify-content:flex-end !important;
        gap:8px !important;
        margin-top:14px !important;
      }
      body.flprStandaloneOriginalClient .standaloneProfileCard{
        position:relative !important;
        width:min(1240px, calc(100vw - 40px)) !important;
        min-height:min(740px, calc(100vh - 40px)) !important;
        display:flex !important;
        flex-direction:column !important;
        gap:18px !important;
        padding:34px !important;
        overflow:hidden !important;
        background:
          linear-gradient(90deg, rgba(0,217,255,.08) 1px, transparent 1px),
          linear-gradient(180deg, rgba(0,217,255,.055) 1px, transparent 1px),
          radial-gradient(80% 120% at 8% -10%, rgba(0,255,213,.22), transparent 50%),
          radial-gradient(88% 100% at 92% 0%, rgba(255,86,214,.14), transparent 56%),
          linear-gradient(180deg, rgba(4,26,42,.99), rgba(0,8,18,.99)) !important;
        background-size:auto, 32px 32px, auto, auto, auto !important;
        box-shadow:
          0 0 0 1px rgba(0,255,213,.20) inset,
          0 0 0 6px rgba(0,217,255,.035) inset,
          0 30px 68px rgba(0,0,0,.68),
          0 0 44px rgba(0,217,255,.28) !important;
      }
      body.flprStandaloneOriginalClient .standaloneProfileCard::before{
        content:"" !important;
        position:absolute !important;
        inset:0 !important;
        pointer-events:none !important;
        background:
          linear-gradient(90deg, transparent, rgba(0,255,213,.13), transparent),
          radial-gradient(circle at 0 0, rgba(255,224,122,.16), transparent 28%) !important;
        opacity:.72 !important;
        mix-blend-mode:screen !important;
      }
      body.flprStandaloneOriginalClient .standaloneProfileHeader{
        position:relative !important;
        display:grid !important;
        grid-template-columns:minmax(0, 1fr) minmax(360px, 460px) !important;
        gap:20px !important;
        align-items:stretch !important;
        z-index:1 !important;
      }
      body.flprStandaloneOriginalClient .standaloneProfileTitleBlock{
        min-width:0 !important;
        padding:2px 0 4px !important;
      }
      body.flprStandaloneOriginalClient .standaloneProfileTitle{
        font-size:36px !important;
        line-height:1.12 !important;
        margin:0 0 12px !important;
        text-shadow:0 0 18px rgba(0,217,255,.26) !important;
      }
      body.flprStandaloneOriginalClient .standaloneProfileSub{
        max-width:760px !important;
        font-size:16px !important;
        line-height:1.5 !important;
        color:rgba(202,235,244,.86) !important;
      }
      body.flprStandaloneOriginalClient .standaloneProfilePreview{
        position:relative !important;
        display:grid !important;
        grid-template-columns:auto minmax(0, 1fr) !important;
        gap:16px !important;
        align-items:center !important;
        min-height:142px !important;
        padding:18px !important;
        border:1px solid color-mix(in srgb, var(--profileColor, #00ffd5) 62%, #00d9ff 38%) !important;
        border-radius:18px !important;
        background:
          radial-gradient(circle at 16% 12%, color-mix(in srgb, var(--profileColor, #00ffd5) 22%, transparent), transparent 48%),
          linear-gradient(180deg, rgba(0,34,62,.74), rgba(0,10,22,.92)) !important;
        box-shadow:
          0 0 0 1px rgba(255,255,255,.05) inset,
          0 0 24px color-mix(in srgb, var(--profileColor, #00ffd5) 30%, transparent) !important;
        overflow:hidden !important;
      }
      body.flprStandaloneOriginalClient .standaloneProfilePreview::after{
        content:"HOME EDITION" !important;
        position:absolute !important;
        right:14px !important;
        bottom:12px !important;
        color:rgba(232,250,255,.18) !important;
        font-size:10px !important;
        letter-spacing:0 !important;
      }
      body.flprStandaloneOriginalClient .standaloneProfilePreviewAvatar{
        width:86px !important;
        height:86px !important;
        display:grid !important;
        place-items:center !important;
        border:2px solid color-mix(in srgb, var(--profileColor, #00ffd5) 72%, #ffffff 28%) !important;
        border-radius:50% !important;
        background:
          radial-gradient(circle at 38% 28%, rgba(255,255,255,.16), transparent 34%),
          linear-gradient(180deg, color-mix(in srgb, var(--profileColor, #00ffd5) 38%, #00263c 62%), rgba(0,10,18,.94)) !important;
        font-size:44px !important;
        line-height:1 !important;
        box-shadow:0 0 20px color-mix(in srgb, var(--profileColor, #00ffd5) 34%, transparent) !important;
      }
      body.flprStandaloneOriginalClient .standaloneProfilePreviewText{
        min-width:0 !important;
        display:flex !important;
        flex-direction:column !important;
        gap:9px !important;
      }
      body.flprStandaloneOriginalClient .standaloneProfilePreviewKicker{
        color:rgba(255,224,122,.88) !important;
        font-size:10px !important;
        line-height:1 !important;
      }
      body.flprStandaloneOriginalClient .standaloneProfilePreviewName{
        color:rgba(238,255,252,.98) !important;
        font-size:19px !important;
        line-height:1.22 !important;
        overflow:hidden !important;
        text-overflow:ellipsis !important;
        white-space:nowrap !important;
      }
      body.flprStandaloneOriginalClient .standaloneProfilePreviewMeta{
        color:rgba(169,214,229,.78) !important;
        font-size:10px !important;
        line-height:1.3 !important;
      }
      body.flprStandaloneOriginalClient .standaloneProfileExistingWrap{
        position:relative !important;
        z-index:1 !important;
        padding:14px !important;
        border:1px solid rgba(0,217,255,.22) !important;
        border-radius:14px !important;
        background:linear-gradient(180deg, rgba(0,22,36,.76), rgba(0,8,18,.76)) !important;
      }
      body.flprStandaloneOriginalClient .standaloneProfileSectionTitle{
        margin:0 0 10px !important;
        color:rgba(0,255,213,.94) !important;
        font-size:12px !important;
        line-height:1.2 !important;
      }
      body.flprStandaloneOriginalClient .standaloneProfileExisting{
        display:grid !important;
        grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)) !important;
        gap:10px !important;
        margin-top:0 !important;
        max-height:156px !important;
        padding:2px 4px 4px 2px !important;
      }
      body.flprStandaloneOriginalClient .standaloneProfilePick{
        width:100% !important;
        min-height:66px !important;
        gap:12px !important;
        padding:10px 12px !important;
        text-align:left !important;
        background:
          radial-gradient(circle at 0% 0%, color-mix(in srgb, var(--profileColor, #00ffd5) 20%, transparent), transparent 50%),
          linear-gradient(180deg, rgba(0,40,72,.72), rgba(0,12,24,.92)) !important;
      }
      body.flprStandaloneOriginalClient .standaloneProfilePickName{
        min-width:0 !important;
        overflow:hidden !important;
        text-overflow:ellipsis !important;
        white-space:nowrap !important;
        font-size:11px !important;
        line-height:1.2 !important;
      }
      body.flprStandaloneOriginalClient .standaloneProfileForm{
        position:relative !important;
        z-index:1 !important;
        grid-template-columns:minmax(420px, 1.1fr) minmax(420px, 1fr) 172px !important;
        gap:20px !important;
        margin-top:0 !important;
        padding:18px !important;
        border:1px solid rgba(0,217,255,.24) !important;
        border-radius:16px !important;
        background:linear-gradient(180deg, rgba(0,20,34,.76), rgba(0,8,18,.82)) !important;
      }
      body.flprStandaloneOriginalClient .standaloneProfileForm label{
        gap:9px !important;
      }
      body.flprStandaloneOriginalClient .standaloneProfileForm .cLabel{
        color:rgba(232,250,255,.92) !important;
        font-size:14px !important;
      }
      body.flprStandaloneOriginalClient #standaloneProfileNameInput{
        width:100% !important;
        min-width:0 !important;
        min-height:64px !important;
        padding:12px 14px !important;
        font-size:18px !important;
        line-height:1.25 !important;
        border-radius:12px !important;
        text-overflow:ellipsis !important;
      }
      body.flprStandaloneOriginalClient .standaloneEmojiPickerButton{
        min-height:64px !important;
        justify-content:flex-start !important;
        padding:8px 18px !important;
        font-size:36px !important;
      }
      body.flprStandaloneOriginalClient .standaloneEmojiGrid{
        grid-template-columns:repeat(12, minmax(42px, 1fr)) !important;
        gap:9px !important;
        max-height:286px !important;
        padding:12px !important;
        border-color:rgba(0,255,213,.36) !important;
        box-shadow:0 16px 34px rgba(0,0,0,.42), 0 0 22px rgba(0,217,255,.16) inset !important;
      }
      body.flprStandaloneOriginalClient .standaloneEmojiChoice{
        min-height:44px !important;
        font-size:24px !important;
        border-radius:10px !important;
        transition:transform .12s ease, border-color .12s ease, box-shadow .12s ease, background .12s ease !important;
      }
      body.flprStandaloneOriginalClient .standaloneEmojiChoice:hover,
      body.flprStandaloneOriginalClient .standaloneEmojiChoice:focus-visible{
        transform:translateY(-2px) !important;
        border-color:rgba(255,224,122,.92) !important;
        box-shadow:0 0 18px rgba(0,217,255,.30) !important;
      }
      body.flprStandaloneOriginalClient #standaloneProfileColorInput{
        width:100% !important;
        height:64px !important;
        min-height:64px !important;
        padding:7px !important;
        border-radius:12px !important;
      }
      body.flprStandaloneOriginalClient .standaloneProfileHint{
        position:relative !important;
        z-index:1 !important;
        padding:12px 14px !important;
        border-left:3px solid rgba(255,224,122,.72) !important;
        border-radius:12px !important;
        background:rgba(0,20,34,.58) !important;
        font-size:13px !important;
      }
      body.flprStandaloneOriginalClient .standaloneProfileActions{
        position:relative !important;
        z-index:1 !important;
        margin-top:auto !important;
        gap:12px !important;
      }
      body.flprStandaloneOriginalClient .standaloneProfileActions .cBtn{
        min-width:166px !important;
        min-height:52px !important;
      }
      @media (max-width: 980px){
        body.flprStandaloneOriginalClient .standaloneProfileHeader,
        body.flprStandaloneOriginalClient .standaloneProfileForm{
          grid-template-columns:1fr !important;
        }
        body.flprStandaloneOriginalClient .standaloneProfileCard{
          overflow:auto !important;
        }
        body.flprStandaloneOriginalClient .standaloneEmojiGrid{
          grid-template-columns:repeat(8, minmax(40px, 1fr)) !important;
        }
      }
      body.flprStandaloneOriginalClient .standaloneProfileBar{
        grid-column:1 / -1 !important;
        grid-row:1 !important;
        display:flex !important;
        align-items:center !important;
        justify-content:space-between !important;
        gap:8px !important;
        border:1px solid rgba(0,255,213,.28) !important;
        border-radius:12px !important;
        padding:6px 8px !important;
        background:linear-gradient(90deg, rgba(0,217,255,.12), rgba(0,18,32,.88)) !important;
      }
      body.flprStandaloneOriginalClient .standaloneProfileIdentity{
        display:flex !important;
        align-items:center !important;
        gap:8px !important;
        min-width:0 !important;
      }
      body.flprStandaloneOriginalClient .standaloneProfileAvatar{
        width:28px !important;
        height:28px !important;
        display:grid !important;
        place-items:center !important;
        border-radius:50% !important;
        border:1px solid rgba(255,255,255,.42) !important;
        background:var(--profileColor, rgba(0,217,255,.42)) !important;
        font-size:17px !important;
      }
      body.flprStandaloneOriginalClient .standaloneProfileName{
        min-width:0 !important;
        overflow:hidden !important;
        text-overflow:ellipsis !important;
        white-space:nowrap !important;
        font-size:10px !important;
        color:rgba(238,255,252,.98) !important;
      }
      body.flprStandaloneOriginalClient .standaloneProfileSwapBtn{
        flex:0 0 auto !important;
        min-height:24px !important;
        padding:4px 8px !important;
        font-size:7px !important;
      }
      body.flprStandaloneOriginalClient .standaloneProfileHud{
        position:fixed !important;
        top:10px !important;
        right:18px !important;
        z-index:2147483644 !important;
        display:flex !important;
        align-items:center !important;
        gap:14px !important;
        max-width:min(640px, calc(100vw - 36px)) !important;
        pointer-events:auto !important;
        font-family:var(--pixelFont, inherit) !important;
      }
      body.flprStandaloneOriginalClient .standaloneProfilePointsWrap{
        position:relative !important;
        flex:0 0 auto !important;
      }
      body.flprStandaloneOriginalClient .standaloneProfilePoints{
        flex:0 0 auto !important;
        border:1px solid rgba(255,224,122,.62) !important;
        border-radius:999px !important;
        padding:10px 18px !important;
        background:rgba(18,12,0,.70) !important;
        color:rgba(255,238,178,.98) !important;
        font-size:18px !important;
        line-height:1 !important;
        box-shadow:0 0 12px rgba(255,224,122,.18) !important;
      }
      body.flprStandaloneOriginalClient .standaloneProfilePointsTooltip{
        position:absolute !important;
        top:calc(100% + 10px) !important;
        right:0 !important;
        width:360px !important;
        max-width:calc(100vw - 36px) !important;
        padding:12px 14px !important;
        border:1px solid rgba(255,224,122,.58) !important;
        border-radius:12px !important;
        background:linear-gradient(180deg, rgba(26,18,0,.98), rgba(0,10,18,.98)) !important;
        color:rgba(255,244,190,.96) !important;
        font-size:12px !important;
        line-height:1.35 !important;
        box-shadow:0 18px 36px rgba(0,0,0,.46), 0 0 18px rgba(255,224,122,.18) !important;
        opacity:0 !important;
        transform:translateY(-4px) !important;
        transition:opacity 140ms ease, transform 140ms ease !important;
        pointer-events:none !important;
        z-index:2147483647 !important;
      }
      body.flprStandaloneOriginalClient .standaloneProfilePointsWrap:hover .standaloneProfilePointsTooltip,
      body.flprStandaloneOriginalClient .standaloneProfilePointsWrap:focus-within .standaloneProfilePointsTooltip{
        opacity:1 !important;
        transform:translateY(0) !important;
      }
      body.flprStandaloneOriginalClient .standaloneProfileHudWrap{
        position:relative !important;
        min-width:0 !important;
      }
      body.flprStandaloneOriginalClient .standaloneProfileHudBtn{
        min-height:64px !important;
        display:flex !important;
        align-items:center !important;
        gap:12px !important;
        border:1px solid rgba(0,255,213,.42) !important;
        border-radius:999px !important;
        padding:8px 18px 8px 8px !important;
        background:linear-gradient(90deg, rgba(0,217,255,.16), rgba(0,18,32,.88)) !important;
        color:rgba(238,255,252,.98) !important;
        box-shadow:0 0 12px rgba(0,217,255,.16) !important;
      }
      body.flprStandaloneOriginalClient .standaloneProfileHudBtn .standaloneProfileAvatar{
        width:48px !important;
        height:48px !important;
        font-size:30px !important;
      }
      body.flprStandaloneOriginalClient .standaloneProfileHudBtn .standaloneProfileName{
        font-size:20px !important;
      }
      body.flprStandaloneOriginalClient .standaloneModeHud{
        position:fixed !important;
        top:42px !important;
        left:calc(var(--captureW) + var(--bonusLeaderboardW) + var(--gutter) + 16px) !important;
        z-index:2147483644 !important;
        display:flex !important;
        align-items:center !important;
        gap:0 !important;
        max-width:min(640px, calc(100vw - 36px)) !important;
        pointer-events:auto !important;
        font-family:var(--pixelFont, inherit) !important;
        touch-action:none !important;
      }
      body.flprStandaloneOriginalClient .standaloneModeHud[hidden]{
        display:none !important;
      }
      body.flprStandaloneOriginalClient .standaloneModeHud.logoUnlocked{
        cursor:grab !important;
      }
      body.flprStandaloneOriginalClient .standaloneModeHud.logoDragging{
        cursor:grabbing !important;
      }
      body.flprStandaloneOriginalClient .standaloneModeHudLogo{
        width:min(600px, 46vw) !important;
        height:128px !important;
        flex:0 0 min(600px, 46vw) !important;
        display:block !important;
        object-fit:contain !important;
        object-position:left center !important;
        image-rendering:auto !important;
        filter:drop-shadow(0 0 12px rgba(0,217,255,.42)) drop-shadow(0 0 6px rgba(255,86,214,.26)) !important;
      }
      body.flprStandaloneOriginalClient.flprStandaloneVerticalViewport .standaloneModeHud{
        left:var(--flprStandalonePortraitPadX, 24px) !important;
        top:18px !important;
        max-width:clamp(260px, 31vw, 330px) !important;
      }
      body.flprStandaloneOriginalClient.flprStandaloneVerticalViewport .standaloneModeHudLogo{
        width:clamp(250px, 30vw, 330px) !important;
        height:72px !important;
        flex:0 0 clamp(250px, 30vw, 330px) !important;
        object-position:left center !important;
      }
      body.flprStandaloneOriginalClient .standaloneModeSwitchHud{
        position:fixed !important;
        top:10px !important;
        left:auto !important;
        right:clamp(360px, 30vw, 560px) !important;
        transform:none !important;
        z-index:2147483644 !important;
        display:flex !important;
        align-items:center !important;
        gap:12px !important;
        padding:6px !important;
        border:1px solid rgba(0,255,213,.28) !important;
        border-radius:999px !important;
        background:linear-gradient(90deg, rgba(0,10,18,.86), rgba(0,28,46,.88)) !important;
        box-shadow:0 0 16px rgba(0,217,255,.14) !important;
        pointer-events:auto !important;
        font-family:var(--pixelFont, inherit) !important;
      }
      body.flprStandaloneOriginalClient .standaloneModeHudBtn.houseBtn{
        min-width:126px !important;
      }
      body.flprStandaloneOriginalClient.flprStandaloneVerticalViewport .standaloneModeSwitchHud{
        left:50% !important;
        right:auto !important;
        top:22px !important;
        transform:translateX(-50%) !important;
        gap:6px !important;
        padding:4px !important;
        max-width:calc(100vw - var(--flprStandalonePortraitPadX, 24px) - var(--flprStandalonePortraitPadX, 24px)) !important;
      }
      body.flprStandaloneOriginalClient.flprStandaloneVerticalViewport .standaloneModeHudBtn{
        min-width:58px !important;
        min-height:38px !important;
        padding:6px 10px !important;
        font-size:13px !important;
      }
      body.flprStandaloneOriginalClient.flprStandaloneVerticalViewport .standaloneModeHudBtn.houseBtn{
        min-width:86px !important;
      }
      body.flprStandaloneOriginalClient.flprStandaloneVerticalViewport .standaloneProfileHud{
        top:17px !important;
        right:var(--flprStandalonePortraitPadX, 24px) !important;
        gap:8px !important;
        transform:none !important;
        transform-origin:top right !important;
      }
      body.flprStandaloneOriginalClient.flprStandaloneVerticalViewport .standaloneProfilePoints{
        padding:7px 12px !important;
        font-size:13px !important;
      }
      body.flprStandaloneOriginalClient.flprStandaloneVerticalViewport .standaloneProfileHudBtn{
        min-height:42px !important;
        gap:8px !important;
        padding:6px 12px 6px 6px !important;
      }
      body.flprStandaloneOriginalClient.flprStandaloneVerticalViewport .standaloneProfileHudBtn .standaloneProfileAvatar{
        width:32px !important;
        height:32px !important;
        font-size:20px !important;
      }
      body.flprStandaloneOriginalClient.flprStandaloneVerticalViewport .standaloneProfileHudBtn .standaloneProfileName{
        max-width:96px !important;
        font-size:13px !important;
      }
      body.flprStandaloneOriginalClient .standaloneModeSwitchHud[hidden]{
        display:none !important;
      }
      body.flprStandaloneOriginalClient .standaloneModeHudBtn{
        min-width:86px !important;
        min-height:54px !important;
        display:grid !important;
        place-items:center !important;
        border:1px solid rgba(0,166,255,.48) !important;
        border-radius:999px !important;
        padding:8px 14px !important;
        background:linear-gradient(180deg, rgba(0,39,64,.88), rgba(0,12,24,.94)) !important;
        color:rgba(190,226,238,.88) !important;
        font-size:19px !important;
        line-height:1 !important;
        letter-spacing:0 !important;
        box-shadow:0 0 10px rgba(0,166,255,.12) !important;
      }
      body.flprStandaloneOriginalClient .standaloneModeHudBtn:hover,
      body.flprStandaloneOriginalClient .standaloneModeHudBtn:focus-visible{
        border-color:rgba(0,255,213,.88) !important;
        color:rgba(238,255,252,.98) !important;
        box-shadow:0 0 18px rgba(0,217,255,.26), 0 0 0 1px rgba(0,255,213,.20) inset !important;
      }
      body.flprStandaloneOriginalClient .standaloneModeHudBtn.active{
        border-color:rgba(0,255,213,.96) !important;
        background:linear-gradient(180deg, rgba(0,135,146,.86), rgba(0,38,58,.96)) !important;
        color:rgba(238,255,252,.98) !important;
        text-shadow:0 0 10px rgba(0,255,213,.42) !important;
        box-shadow:0 0 20px rgba(0,255,213,.26), 0 0 0 1px rgba(0,255,213,.22) inset !important;
      }
      body.flprStandaloneOriginalClient .standaloneModeHudBtn.houseBtn.active{
        border-color:rgba(255,224,122,.98) !important;
        background:linear-gradient(180deg, rgba(114,58,0,.9), rgba(52,14,48,.96)) !important;
        color:rgba(255,246,196,.98) !important;
        text-shadow:0 0 10px rgba(255,224,122,.46) !important;
        box-shadow:0 0 22px rgba(255,224,122,.26), 0 0 18px rgba(255,86,214,.18) !important;
      }
      body.flprStandaloneOriginalClient .controlsBody.standaloneHouseTakeover .controlsTabs{
        display:none !important;
      }
      body.flprStandaloneOriginalClient .controlsBody.standaloneHouseTakeover .controlsPanels{
        height:100% !important;
      }
      body.flprStandaloneOriginalClient .standaloneProfileMenu{
        position:absolute !important;
        right:0 !important;
        top:calc(100% + 10px) !important;
        width:440px !important;
        display:flex !important;
        flex-direction:column !important;
        gap:10px !important;
        padding:14px !important;
        border:1px solid rgba(0,255,213,.42) !important;
        border-radius:12px !important;
        background:linear-gradient(180deg, rgba(3,24,38,.98), rgba(0,8,18,.98)) !important;
        box-shadow:0 18px 36px rgba(0,0,0,.46), 0 0 16px rgba(0,217,255,.20) !important;
      }
      body.flprStandaloneOriginalClient .standaloneProfileMenu[hidden]{
        display:none !important;
      }
      body.flprStandaloneOriginalClient .standaloneProfileMenu button{
        width:100% !important;
        text-align:left !important;
        justify-content:flex-start !important;
        min-height:42px !important;
        font-size:14px !important;
      }
      body.flprStandaloneOriginalClient .standaloneSeedSavePanel{
        border:1px solid rgba(0,255,213,.22) !important;
        border-radius:12px !important;
        padding:12px !important;
        background:rgba(0,17,29,.58) !important;
        min-height:0 !important;
        display:flex !important;
        flex-direction:column !important;
      }
      body.flprStandaloneOriginalClient .standaloneSeedSaveTitle{
        display:flex !important;
        justify-content:space-between !important;
        gap:8px !important;
        color:rgba(230,248,255,.96) !important;
        font-size:14px !important;
        margin-bottom:10px !important;
      }
      body.flprStandaloneOriginalClient .standaloneSeedSaveList{
        flex:1 1 auto !important;
        min-height:0 !important;
        display:flex !important;
        flex-direction:column !important;
        gap:10px !important;
        max-height:min(360px, 42vh) !important;
        overflow:auto !important;
        scrollbar-width:thin !important;
        scrollbar-color:rgba(0,217,255,.78) rgba(0,18,31,.96) !important;
      }
      body.flprStandaloneOriginalClient .standaloneSeedSaveList::-webkit-scrollbar{
        width:12px !important;
      }
      body.flprStandaloneOriginalClient .standaloneSeedSaveList::-webkit-scrollbar-track{
        border:1px solid rgba(0,166,255,.22) !important;
        border-radius:999px !important;
        background:rgba(0,10,20,.86) !important;
      }
      body.flprStandaloneOriginalClient .standaloneSeedSaveList::-webkit-scrollbar-thumb{
        border:2px solid rgba(0,10,20,.86) !important;
        border-radius:999px !important;
        background:linear-gradient(180deg, rgba(0,217,255,.95), rgba(0,255,213,.70)) !important;
        box-shadow:0 0 10px rgba(0,217,255,.24) !important;
      }
      body.flprStandaloneOriginalClient .standaloneSeedSaveRow{
        position:relative !important;
        border:1px solid rgba(0,166,255,.26) !important;
        border-radius:10px !important;
        padding:12px !important;
        background:rgba(0,33,52,.46) !important;
        cursor:pointer !important;
        overflow:hidden !important;
        min-height:96px !important;
      }
      body.flprStandaloneOriginalClient .standaloneSeedSaveRowHd{
        display:flex !important;
        justify-content:space-between !important;
        gap:8px !important;
        font-size:16px !important;
        color:rgba(238,255,252,.98) !important;
      }
      body.flprStandaloneOriginalClient .standaloneSeedSaveMeta{
        margin-top:8px !important;
        font-size:12px !important;
        line-height:1.35 !important;
        color:rgba(190,226,238,.78) !important;
      }
      body.flprStandaloneOriginalClient .standaloneSeedProgressTrack{
        margin-top:6px !important;
        height:7px !important;
        border:1px solid rgba(0,217,255,.36) !important;
        border-radius:999px !important;
        background:rgba(0,8,14,.92) !important;
        overflow:hidden !important;
      }
      body.flprStandaloneOriginalClient .standaloneSeedProgressFill{
        height:100% !important;
        width:var(--seedProgress, 0%) !important;
        background:linear-gradient(90deg, rgba(0,217,255,.95), rgba(0,255,213,.92), rgba(255,224,122,.88)) !important;
        box-shadow:0 0 10px rgba(0,217,255,.34) !important;
      }
      body.flprStandaloneOriginalClient .standaloneSeedLoadPrompt{
        position:absolute !important;
        inset:0 !important;
        display:none !important;
        align-items:center !important;
        justify-content:center !important;
        background:linear-gradient(180deg, rgba(0,8,16,.78), rgba(0,2,8,.90)) !important;
        backdrop-filter:blur(2px) !important;
      }
      body.flprStandaloneOriginalClient .standaloneSeedSaveRow.pendingLoad .standaloneSeedLoadPrompt{
        display:flex !important;
      }
      body.flprStandaloneOriginalClient .standaloneSeedLoadBtn{
        min-width:170px !important;
        min-height:46px !important;
        border:1px solid rgba(255,224,122,.88) !important;
        border-radius:999px !important;
        background:linear-gradient(180deg, rgba(80,52,0,.92), rgba(16,10,0,.96)) !important;
        color:rgba(255,244,212,.98) !important;
        font-size:18px !important;
        box-shadow:0 0 22px rgba(255,224,122,.24) !important;
      }
      body.flprStandaloneOriginalClient .standaloneNextAchievementCard{
        width:100% !important;
        min-height:132px !important;
        display:flex !important;
        flex-direction:column !important;
        gap:8px !important;
        align-items:stretch !important;
        justify-content:center !important;
        border:1px solid rgba(0,217,255,.38) !important;
        border-radius:12px !important;
        padding:14px !important;
        background:
          linear-gradient(180deg, rgba(0,52,74,.72), rgba(0,16,28,.94)),
          radial-gradient(circle at 10% 0%, rgba(0,255,213,.18), transparent 46%) !important;
        color:rgba(238,255,252,.96) !important;
        text-align:left !important;
        box-shadow:0 0 0 1px rgba(0,255,213,.12) inset, 0 0 18px rgba(0,217,255,.12) !important;
      }
      body.flprStandaloneOriginalClient .standaloneNextAchievementCard:hover{
        border-color:rgba(0,255,213,.86) !important;
        box-shadow:0 0 18px rgba(0,217,255,.28), 0 0 0 1px rgba(0,255,213,.20) inset !important;
      }
      body.flprStandaloneOriginalClient .standaloneNextAchievementCard[disabled]{
        opacity:.62 !important;
        cursor:default !important;
      }
      body.flprStandaloneOriginalClient .standaloneNextAchievementEyebrow{
        font-size:12px !important;
        color:rgba(0,255,213,.88) !important;
      }
      body.flprStandaloneOriginalClient .standaloneNextAchievementTitle{
        font-size:18px !important;
        line-height:1.16 !important;
        color:rgba(255,244,212,.98) !important;
      }
      body.flprStandaloneOriginalClient .standaloneNextAchievementMeta,
      body.flprStandaloneOriginalClient .standaloneNextAchievementDesc{
        font-size:12px !important;
        line-height:1.35 !important;
        color:rgba(190,226,238,.82) !important;
      }
      body.flprStandaloneOriginalClient .standaloneNextAchievementBar{
        height:9px !important;
        border:1px solid rgba(0,217,255,.42) !important;
        border-radius:999px !important;
        overflow:hidden !important;
        background:rgba(0,8,14,.92) !important;
      }
      body.flprStandaloneOriginalClient .standaloneNextAchievementBar span{
        display:block !important;
        height:100% !important;
        width:var(--nextAchProgress, 0%) !important;
        background:linear-gradient(90deg, rgba(0,217,255,.95), rgba(0,255,213,.92), rgba(255,224,122,.90)) !important;
      }
      body.flprStandaloneOriginalClient .standaloneSingleplayerIdeaGrid{
        display:grid !important;
        grid-template-columns:repeat(2, minmax(0, 1fr)) !important;
        gap:10px !important;
      }
      body.flprStandaloneOriginalClient .standaloneSingleplayerIdea{
        border:1px solid rgba(0,166,255,.22) !important;
        border-radius:10px !important;
        padding:10px !important;
        background:rgba(0,20,34,.54) !important;
        color:rgba(208,238,248,.88) !important;
        font-size:12px !important;
        line-height:1.35 !important;
      }
      body.flprStandaloneOriginalClient .standaloneSingleplayerIdea strong{
        display:block !important;
        margin-bottom:4px !important;
        color:rgba(0,255,213,.88) !important;
        font-size:13px !important;
      }
      body.flprStandaloneOriginalClient .standaloneSingleplayerIdea span{
        display:block !important;
        color:rgba(238,255,252,.94) !important;
        overflow-wrap:anywhere !important;
      }
      body.flprStandaloneOriginalClient .achCtlItem.standaloneAchFocusPulse{
        outline:2px solid rgba(255,224,122,.95) !important;
        box-shadow:0 0 22px rgba(255,224,122,.34), 0 0 0 1px rgba(255,244,212,.18) inset !important;
      }
      body.flprStandaloneOriginalClient .randomizerIntro.flprStandaloneClosed .randomizerIntroStartBtn{
        opacity:.52 !important;
        filter:saturate(.62) !important;
        cursor:not-allowed !important;
      }
      body.flprStandaloneOriginalClient .randomizerIntro.flprStandaloneClosed .randomizerIntroSign{
        color:rgba(190,226,238,.92) !important;
        text-shadow:0 0 12px rgba(0,217,255,.26) !important;
      }
      body.flprStandaloneOriginalClient .achievementToast{
        position:relative !important;
        padding-right:38px !important;
      }
      body.flprStandaloneOriginalClient .achievementToastClose,
      body.flprStandaloneOriginalClient .achievementModalClose{
        position:absolute !important;
        top:7px !important;
        right:7px !important;
        width:22px !important;
        height:22px !important;
        border:1px solid rgba(255,244,208,.82) !important;
        border-radius:50% !important;
        background:rgba(20,10,0,.66) !important;
        color:rgba(255,248,224,.98) !important;
        font-size:11px !important;
        line-height:20px !important;
        padding:0 !important;
        text-align:center !important;
        cursor:pointer !important;
        z-index:3 !important;
      }
      body.flprStandaloneOriginalClient .achievementModalCard{
        position:relative !important;
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
      body.flprStandaloneOriginalClient .controls{
        box-sizing:border-box !important;
        align-self:flex-start !important;
        flex:0 0 auto !important;
        margin-top:84px !important;
        padding-top:0 !important;
        top:0 !important;
        transform:none !important;
        height:var(--flprStandaloneControlsH, calc(var(--captureH) - 110px)) !important;
        max-height:var(--flprStandaloneControlsH, calc(var(--captureH) - 110px)) !important;
      }
      body.flprStandaloneOriginalClient .capture{
        gap:6px !important;
        padding-bottom:8px !important;
      }
      body.flprStandaloneOriginalClient:not(.flprStandaloneVerticalViewport) .capture{
        flex:0 0 var(--captureW) !important;
        width:var(--captureW) !important;
        height:var(--captureH) !important;
        max-height:var(--captureH) !important;
      }
      body.flprStandaloneOriginalClient.flprStandaloneVerticalViewport .capture{
        grid-column:1 !important;
        grid-row:1 !important;
        justify-self:center !important;
        align-self:start !important;
        width:min(var(--captureW), calc(100vw - var(--flprStandalonePortraitPadX, 24px) - var(--flprStandalonePortraitPadX, 24px))) !important;
        max-width:calc(100vw - var(--flprStandalonePortraitPadX, 24px) - var(--flprStandalonePortraitPadX, 24px)) !important;
        min-width:0 !important;
        height:var(--captureH) !important;
        max-height:var(--captureH) !important;
        overflow:hidden !important;
      }
      body.flprStandaloneOriginalClient.flprStandaloneVerticalViewport .controls{
        grid-column:1 !important;
        grid-row:2 !important;
        justify-self:center !important;
        align-self:start !important;
        width:min(var(--controlsW), calc(100vw - var(--flprStandalonePortraitPadX, 24px) - var(--flprStandalonePortraitPadX, 24px))) !important;
        max-width:calc(100vw - var(--flprStandalonePortraitPadX, 24px) - var(--flprStandalonePortraitPadX, 24px)) !important;
        min-width:0 !important;
        height:var(--flprStandaloneControlsH) !important;
        max-height:var(--flprStandaloneControlsH) !important;
        margin:0 !important;
        flex:0 0 var(--flprStandaloneControlsH) !important;
      }
      body.flprStandaloneOriginalClient .viewport{
        flex:0 0 var(--flprStandaloneViewportH, calc(var(--captureH) - 75px - 14px - 22px - 198px)) !important;
        height:var(--flprStandaloneViewportH, calc(var(--captureH) - 75px - 14px - 22px - 198px)) !important;
        max-height:var(--flprStandaloneViewportH, calc(var(--captureH) - 75px - 14px - 22px - 198px)) !important;
        margin-bottom:0 !important;
      }
      body.flprStandaloneOriginalClient:not(.flprStandaloneVerticalViewport) #viewOverview #grid{
        grid-template-columns:repeat(5, minmax(0, 1fr)) !important;
        grid-template-rows:repeat(5, minmax(0, 1fr)) !important;
        grid-auto-rows:minmax(150px, 1fr) !important;
        align-content:stretch !important;
      }
      body.flprStandaloneOriginalClient .randomizerIntro{
        top:81px !important;
        height:var(--flprStandaloneViewportH, calc(var(--captureH) - 75px - 14px - 22px - 198px)) !important;
        bottom:auto !important;
      }
      body.flprStandaloneOriginalClient .bossDock{
        flex:0 0 auto !important;
      }
      body.flprStandaloneOriginalClient .controlsBody{
        height:100% !important;
        min-height:0 !important;
        display:flex !important;
        flex-direction:column !important;
        overflow:hidden !important;
        pointer-events:auto !important;
        position:relative !important;
        z-index:20 !important;
      }
      body.flprStandaloneOriginalClient .controlsPanels{
        flex:1 1 auto !important;
        height:100% !important;
        min-height:0 !important;
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
        height:100% !important;
      }
      body.flprStandaloneOriginalClient .controlsTabPanel[data-ctrl-panel="testing"]{
        display:none !important;
      }
      body.flprStandaloneOriginalClient #hintBallLocationBtn,
      body.flprStandaloneOriginalClient .hintPoolItem:has(#hintPoolBall){
        display:none !important;
      }
      body.flprStandaloneOriginalClient #hintTestHangmanBtn,
      body.flprStandaloneOriginalClient #testHangmanBtn,
      body.flprStandaloneOriginalClient [data-testtag="Hangman"],
      body.flprStandaloneOriginalClient .hintHangmanCard,
      body.flprStandaloneOriginalClient .hintHangmanCooldowns,
      body.flprStandaloneOriginalClient .hintHangmanChat{
        display:none !important;
      }
      body.flprStandaloneOriginalClient #viewChecks .checksBody:not(.bossMode) .tableBlock.nowPlayingChecks{
        animation:none !important;
      }
      body.flprStandaloneOriginalClient #viewChecks #checksBody .tableBlock.bossChecksBig .nodeCell.flprStandaloneBossVictoryHidden,
      body.flprStandaloneOriginalClient #viewChecks .checksBody.bossMode .tableBlock.bossChecksBig .nodeCell.flprStandaloneBossVictoryHidden{
        display:none !important;
      }
      body.flprStandaloneOriginalClient #viewChecks #checksBody .tableBlock.bossChecksBig .nodeBtn.bossNode.flprStandaloneBossCard,
      body.flprStandaloneOriginalClient #viewChecks .checksBody.bossMode .tableBlock.bossChecksBig .nodeBtn.bossNode.flprStandaloneBossCard{
        padding-left:66px !important;
      }
      body.flprStandaloneOriginalClient #viewChecks #checksBody .tableBlock.bossChecksBig .nodeBtn.bossNode.flprStandaloneBossCard .tierBadge,
      body.flprStandaloneOriginalClient #viewChecks .checksBody.bossMode .tableBlock.bossChecksBig .nodeBtn.bossNode.flprStandaloneBossCard .tierBadge{
        left:12px !important;
        top:12px !important;
        height:20px !important;
        min-width:42px !important;
      }
      body.flprStandaloneOriginalClient #viewChecks #checksBody .tableBlock.bossChecksBig .nodeBtn.bossNode.flprStandaloneBossCard .flprStandaloneBossAttackSubtag,
      body.flprStandaloneOriginalClient #viewChecks .checksBody.bossMode .tableBlock.bossChecksBig .nodeBtn.bossNode.flprStandaloneBossCard .flprStandaloneBossAttackSubtag{
        position:absolute !important;
        left:12px !important;
        top:38px !important;
        width:42px !important;
        min-height:30px !important;
        box-sizing:border-box !important;
        display:flex !important;
        align-items:center !important;
        justify-content:center !important;
        padding:3px 2px !important;
        border:1px solid rgba(255,118,86,.48) !important;
        border-radius:8px !important;
        background:linear-gradient(180deg, rgba(255,118,86,.18), rgba(255,77,109,.09)) !important;
        color:rgba(255,226,205,.96) !important;
        font-family:var(--flprUiFontFamily) !important;
        font-size:5.2px !important;
        line-height:1.35 !important;
        text-align:center !important;
        text-transform:uppercase !important;
        pointer-events:none !important;
        text-shadow:0 0 8px rgba(255,118,86,.28) !important;
      }
      body.flprStandaloneOriginalClient #viewChecks #checksBody .tableBlock.bossChecksBig .nodeBtn.bossNode.flprStandaloneBossCard .nodeTitle,
      body.flprStandaloneOriginalClient #viewChecks .checksBody.bossMode .tableBlock.bossChecksBig .nodeBtn.bossNode.flprStandaloneBossCard .nodeTitle{
        margin-top:0 !important;
        font-size:16px !important;
        line-height:1.24 !important;
        color:rgba(245,252,255,.98) !important;
        text-shadow:0 0 13px rgba(0,217,255,.24) !important;
      }
      body.flprStandaloneOriginalClient #viewChecks #checksBody .tableBlock.bossChecksBig .nodeBtn.bossNode.flprStandaloneBossCard.scoreNode .nodeTitle .scoreLead,
      body.flprStandaloneOriginalClient #viewChecks .checksBody.bossMode .tableBlock.bossChecksBig .nodeBtn.bossNode.flprStandaloneBossCard.scoreNode .nodeTitle .scoreLead{
        font-size:8px !important;
        color:rgba(0,255,213,.84) !important;
        letter-spacing:0 !important;
      }
      body.flprStandaloneOriginalClient #viewChecks #checksBody .tableBlock.bossChecksBig .nodeBtn.bossNode.flprStandaloneBossCard.scoreNode .nodeTitle .scoreValue,
      body.flprStandaloneOriginalClient #viewChecks .checksBody.bossMode .tableBlock.bossChecksBig .nodeBtn.bossNode.flprStandaloneBossCard.scoreNode .nodeTitle .scoreValue{
        font-size:20px !important;
        line-height:1.05 !important;
      }
      body.flprStandaloneOriginalClient #viewChecks #checksBody .tableBlock.bossChecksBig .nodeBtn.bossNode.flprStandaloneBossCard .small,
      body.flprStandaloneOriginalClient #viewChecks .checksBody.bossMode .tableBlock.bossChecksBig .nodeBtn.bossNode.flprStandaloneBossCard .small{
        color:rgba(255,226,205,.88) !important;
      }
      body.flprStandaloneOriginalClient #viewChecks .checksFancyDivider.snapFx,
      body.flprStandaloneOriginalClient #viewChecks .checksFancyDivider.tableGlowFx{
        animation:none !important;
      }
      body.flprStandaloneOriginalClient.checksBgNeonLattice #viewChecks .checksWrap:not(.bossBannerMode)::before{
        opacity:.52 !important;
        background:
          repeating-linear-gradient(45deg, rgba(0,255,213,.16) 0 2px, transparent 2px 24px),
          repeating-linear-gradient(-45deg, rgba(255,86,214,.13) 0 2px, transparent 2px 28px),
          linear-gradient(90deg, rgba(0,217,255,.09) 1px, transparent 1px),
          linear-gradient(180deg, rgba(255,224,122,.07) 1px, transparent 1px),
          radial-gradient(110% 90% at 50% 18%, rgba(0,166,255,.20), rgba(0,0,0,.74)) !important;
        background-size:96px 96px, 112px 112px, 48px 48px, 48px 48px, 100% 100% !important;
        animation:none !important;
      }
      body.flprStandaloneOriginalClient.checksBgNeonLattice #viewChecks .checksWrap:not(.bossBannerMode)::after{
        opacity:.22 !important;
        background:
          linear-gradient(90deg, transparent, rgba(0,255,213,.24), transparent),
          repeating-linear-gradient(90deg, rgba(255,86,214,.11) 0 1px, transparent 1px 18px) !important;
        background-size:180px 100%, 72px 72px !important;
        mix-blend-mode:screen !important;
        animation:none !important;
      }
      body.flprStandaloneOriginalClient.checksBgBlueprint #viewChecks .checksWrap:not(.bossBannerMode)::before{
        opacity:.58 !important;
        background:
          linear-gradient(90deg, rgba(128,214,255,.16) 1px, transparent 1px),
          linear-gradient(180deg, rgba(128,214,255,.13) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,224,122,.08) 1px, transparent 1px),
          linear-gradient(180deg, rgba(255,224,122,.07) 1px, transparent 1px),
          linear-gradient(180deg, rgba(4,32,58,.92), rgba(2,10,24,.92)) !important;
        background-size:34px 34px, 34px 34px, 170px 170px, 170px 170px, 100% 100% !important;
        animation:none !important;
      }
      body.flprStandaloneOriginalClient.checksBgBlueprint #viewChecks .checksWrap:not(.bossBannerMode)::after{
        opacity:.18 !important;
        background:
          repeating-linear-gradient(135deg, rgba(0,255,213,.12) 0 1px, transparent 1px 32px),
          linear-gradient(120deg, transparent 0 42%, rgba(255,224,122,.16) 48%, transparent 54%) !important;
        background-size:120px 120px, 100% 100% !important;
        mix-blend-mode:screen !important;
        animation:none !important;
      }
      body.flprStandaloneOriginalClient.checksBgVectorStars #viewChecks .checksWrap:not(.bossBannerMode)::before{
        opacity:.62 !important;
        background:
          radial-gradient(circle at 12% 18%, rgba(235,250,255,.80) 0 1px, transparent 2.4px),
          radial-gradient(circle at 74% 28%, rgba(0,255,213,.72) 0 1px, transparent 2.8px),
          radial-gradient(circle at 34% 72%, rgba(255,224,122,.70) 0 1px, transparent 2.6px),
          radial-gradient(circle at 88% 84%, rgba(95,183,255,.74) 0 1px, transparent 2.8px),
          linear-gradient(180deg, rgba(4,10,24,.96), rgba(0,0,0,.88)) !important;
        background-size:170px 150px, 220px 190px, 190px 180px, 250px 220px, 100% 100% !important;
        animation:none !important;
      }
      body.flprStandaloneOriginalClient.checksBgVectorStars #viewChecks .checksWrap:not(.bossBannerMode)::after{
        opacity:.20 !important;
        background:
          linear-gradient(26deg, transparent 0 48%, rgba(0,217,255,.18) 49%, transparent 51%),
          linear-gradient(-34deg, transparent 0 49%, rgba(255,224,122,.13) 50%, transparent 52%) !important;
        background-size:180px 160px, 240px 220px !important;
        mix-blend-mode:screen !important;
        animation:none !important;
      }
      body.flprStandaloneOriginalClient.checksBgRadar #viewChecks .checksWrap:not(.bossBannerMode)::before{
        opacity:.56 !important;
        background:
          repeating-radial-gradient(circle at 50% 50%, rgba(0,255,153,.11) 0 2px, transparent 2px 42px),
          conic-gradient(from 260deg at 50% 50%, transparent 0 74%, rgba(0,255,153,.18) 82%, transparent 90% 100%),
          linear-gradient(90deg, rgba(0,217,255,.10) 1px, transparent 1px),
          linear-gradient(180deg, rgba(255,224,122,.07) 1px, transparent 1px),
          radial-gradient(120% 100% at 50% 50%, rgba(0,80,58,.38), rgba(0,0,0,.86)) !important;
        background-size:100% 100%, 100% 100%, 52px 52px, 52px 52px, 100% 100% !important;
        animation:none !important;
      }
      body.flprStandaloneOriginalClient.checksBgRadar #viewChecks .checksWrap:not(.bossBannerMode)::after{
        opacity:.18 !important;
        background:
          linear-gradient(90deg, transparent 0 49%, rgba(0,255,153,.22) 50%, transparent 51%),
          linear-gradient(180deg, transparent 0 49%, rgba(0,217,255,.16) 50%, transparent 51%) !important;
        background-size:100% 100%, 100% 100% !important;
        mix-blend-mode:screen !important;
        animation:none !important;
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
        position:relative !important;
        z-index:45 !important;
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
      body.flprStandaloneOriginalClient .standaloneSingleplayerLayout{
        height:100% !important;
        min-height:0 !important;
        display:grid !important;
        grid-template-columns:minmax(360px, .9fr) minmax(340px, 1.1fr) !important;
        grid-template-rows:auto minmax(220px, .82fr) minmax(160px, .55fr) !important;
        gap:10px !important;
      }
      body.flprStandaloneOriginalClient.flprStandaloneVerticalViewport .connectCompactLayout,
      body.flprStandaloneOriginalClient.flprStandaloneVerticalViewport .standaloneSingleplayerLayout{
        grid-template-columns:1fr !important;
        grid-template-rows:auto auto minmax(180px, .72fr) minmax(160px, .54fr) !important;
        align-content:start !important;
        overflow:auto !important;
      }
      body.flprStandaloneOriginalClient.flprStandaloneVerticalViewport .visualsCompactLayout,
      body.flprStandaloneOriginalClient.flprStandaloneVerticalViewport .testingCompactLayout{
        grid-template-columns:1fr !important;
        grid-template-rows:auto auto !important;
        height:auto !important;
        min-height:100% !important;
        align-content:start !important;
        overflow:auto !important;
      }
      body.flprStandaloneOriginalClient.flprStandaloneVerticalViewport .visualsCol,
      body.flprStandaloneOriginalClient.flprStandaloneVerticalViewport .testingCol{
        grid-column:1 !important;
        grid-row:auto !important;
        min-height:0 !important;
        max-height:none !important;
        overflow:visible !important;
      }
      body.flprStandaloneOriginalClient.flprStandaloneVerticalViewport .standaloneSingleplayerSection,
      body.flprStandaloneOriginalClient.flprStandaloneVerticalViewport .standaloneSingleplayerToolsSection,
      body.flprStandaloneOriginalClient.flprStandaloneVerticalViewport .standaloneSingleplayerSaveStack,
      body.flprStandaloneOriginalClient.flprStandaloneVerticalViewport .standaloneSingleplayerInfoStack,
      body.flprStandaloneOriginalClient.flprStandaloneVerticalViewport .standaloneArchipelagoSection,
      body.flprStandaloneOriginalClient.flprStandaloneVerticalViewport .standaloneConnectionModeShell,
      body.flprStandaloneOriginalClient.flprStandaloneVerticalViewport .standaloneSecondaryStack,
      body.flprStandaloneOriginalClient.flprStandaloneVerticalViewport .standaloneLogStack{
        grid-column:1 !important;
        grid-row:auto !important;
      }
      body.flprStandaloneOriginalClient.flprStandaloneVerticalViewport .standaloneConnectionModeTabs,
      body.flprStandaloneOriginalClient.flprStandaloneVerticalViewport .standaloneArchipelagoButtons,
      body.flprStandaloneOriginalClient.flprStandaloneVerticalViewport .connectActionRow{
        grid-template-columns:1fr !important;
      }
      body.flprStandaloneOriginalClient.flprStandaloneVerticalViewport .standaloneArchipelagoSection .apSettingsGrid{
        grid-template-columns:1fr !important;
      }
      body.flprStandaloneOriginalClient.flprStandaloneVerticalViewport .standaloneSaveApCfgBtn{
        align-self:stretch !important;
        width:100% !important;
      }
      body.flprStandaloneOriginalClient.flprStandaloneVerticalViewport .standaloneSecondaryStack,
      body.flprStandaloneOriginalClient.flprStandaloneVerticalViewport .standaloneLogStack,
      body.flprStandaloneOriginalClient.flprStandaloneVerticalViewport .standaloneSingleplayerSaveStack,
      body.flprStandaloneOriginalClient.flprStandaloneVerticalViewport .standaloneSingleplayerInfoStack{
        overflow:visible !important;
      }
      body.flprStandaloneOriginalClient.flprStandaloneVerticalViewport .recvWrap,
      body.flprStandaloneOriginalClient.flprStandaloneVerticalViewport .apConnLogBody{
        min-height:180px !important;
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
      body.flprStandaloneOriginalClient .standaloneConnectionModeShell{
        grid-column:1 / -1 !important;
        grid-row:2 !important;
        display:flex !important;
        flex-direction:column !important;
        gap:calc(5px * var(--flprStandaloneControlFontScale)) !important;
        min-width:0 !important;
        pointer-events:auto !important;
        position:relative !important;
        z-index:36 !important;
      }
      body.flprStandaloneOriginalClient .standaloneConnectionModeTabs{
        display:grid !important;
        grid-template-columns:repeat(2, minmax(0, 1fr)) !important;
        gap:calc(4px * var(--flprStandaloneControlFontScale)) !important;
      }
      body.flprStandaloneOriginalClient .standaloneConnectionModeTab{
        min-height:calc(26px * var(--flprStandaloneControlFontScale)) !important;
        border:1px solid rgba(0,166,255,.42) !important;
        border-radius:8px !important;
        background:linear-gradient(180deg, rgba(0,34,62,.88), rgba(0,12,24,.94)) !important;
        color:rgba(222,246,255,.78) !important;
        box-shadow:0 0 0 1px rgba(0,217,255,.10) inset !important;
        font-size:calc(7.5px * var(--flprStandaloneControlFontScale)) !important;
        line-height:1.18 !important;
        white-space:normal !important;
      }
      body.flprStandaloneOriginalClient .standaloneConnectionModeTab.active{
        border-color:rgba(0,255,213,.92) !important;
        color:rgba(238,255,252,.98) !important;
        background:linear-gradient(180deg, rgba(0,92,118,.94), rgba(0,25,46,.96)) !important;
        box-shadow:
          0 0 calc(8px * var(--flprStandaloneControlFontScale)) rgba(0,217,255,.26),
          0 0 0 1px rgba(0,255,213,.18) inset !important;
      }
      body.flprStandaloneOriginalClient .standaloneConnectionModePanels{
        min-width:0 !important;
      }
      body.flprStandaloneOriginalClient .standaloneConnectionModePanel{
        display:none !important;
      }
      body.flprStandaloneOriginalClient .standaloneConnectionModePanel.active{
        display:block !important;
      }
      body.flprStandaloneOriginalClient .standaloneConnectionModePanel .standaloneControlSection{
        margin-bottom:0 !important;
      }
      body.flprStandaloneOriginalClient .standaloneArchipelagoSection .apSettingsGrid{
        grid-template-columns:minmax(220px, 1.25fr) minmax(160px, .8fr) minmax(220px, 1fr) minmax(160px, .8fr) !important;
      }
      body.flprStandaloneOriginalClient .standaloneArchipelagoFooter{
        display:flex !important;
        flex-direction:column !important;
        gap:calc(4px * var(--flprStandaloneControlFontScale)) !important;
        align-items:stretch !important;
      }
      body.flprStandaloneOriginalClient .standaloneArchipelagoButtons{
        display:grid !important;
        grid-template-columns:repeat(2, minmax(0, 1fr)) !important;
        gap:calc(4px * var(--flprStandaloneControlFontScale)) !important;
        width:100% !important;
      }
      body.flprStandaloneOriginalClient .standaloneArchipelagoButtons .cBtn{
        width:100% !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneConnectLayout .cBtn{
        min-height:calc(22px * var(--flprStandaloneControlFontScale)) !important;
        padding:calc(3px * var(--flprStandaloneControlFontScale)) calc(5px * var(--flprStandaloneControlFontScale)) !important;
      }
      body.flprStandaloneOriginalClient .standaloneSaveApCfgBtn{
        align-self:flex-end !important;
        width:min(220px, 100%) !important;
      }
      body.flprStandaloneOriginalClient .standaloneSecondaryStack,
      body.flprStandaloneOriginalClient .standaloneLogStack{
        grid-row:2 !important;
        gap:10px !important;
        overflow:hidden !important;
        min-height:0 !important;
        display:flex !important;
        flex-direction:column !important;
      }
      body.flprStandaloneOriginalClient .standaloneSingleplayerSaveStack,
      body.flprStandaloneOriginalClient .standaloneSingleplayerInfoStack{
        min-height:0 !important;
        overflow:hidden !important;
        display:flex !important;
        flex-direction:column !important;
        gap:10px !important;
      }
      body.flprStandaloneOriginalClient .standaloneSingleplayerSection{
        grid-column:1 !important;
        grid-row:1 !important;
      }
      body.flprStandaloneOriginalClient .standaloneSingleplayerToolsSection{
        grid-column:2 !important;
        grid-row:1 !important;
      }
      body.flprStandaloneOriginalClient .standaloneSingleplayerSaveStack{
        grid-column:1 / -1 !important;
        grid-row:2 !important;
      }
      body.flprStandaloneOriginalClient .standaloneSingleplayerInfoStack{
        grid-column:1 / -1 !important;
        grid-row:3 !important;
        overflow:auto !important;
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
      body.flprStandaloneOriginalClient .standaloneSecondaryStack .standaloneControlSection.grow{
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
      body.flprStandaloneOriginalClient .standaloneDockTitleText{
        min-width:0 !important;
      }
      body.flprStandaloneOriginalClient .standaloneDockCollapseBtn{
        flex:0 0 auto !important;
        min-height:calc(12px * var(--flprStandaloneControlFontScale)) !important;
        padding:0 calc(4px * var(--flprStandaloneControlFontScale)) !important;
        border:1px solid rgba(160,214,255,.30) !important;
        border-radius:8px !important;
        background:rgba(0,18,31,.72) !important;
        color:rgba(230,248,255,.88) !important;
        font-family:var(--flprUiFontFamily) !important;
        font-size:calc(4px * var(--flprStandaloneControlFontScale)) !important;
        line-height:1 !important;
        cursor:pointer !important;
      }
      body.flprStandaloneOriginalClient .standaloneDockCollapseBtn:hover{
        filter:brightness(1.12) !important;
      }
      body.flprStandaloneOriginalClient .standaloneControlSection.is-standalone-collapsed{
        flex:0 0 auto !important;
      }
      body.flprStandaloneOriginalClient .standaloneControlSection.is-standalone-collapsed > :not(.standaloneSectionTitle){
        display:none !important;
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
      body.flprStandaloneOriginalClient .recvWrap{
        display:flex !important;
        flex-direction:column !important;
        height:100% !important;
        min-height:0 !important;
      }
      body.flprStandaloneOriginalClient .apConnLog{
        display:flex !important;
        flex-direction:column !important;
        height:100% !important;
        min-height:0 !important;
      }
      body.flprStandaloneOriginalClient .recvBody,
      body.flprStandaloneOriginalClient #apConnLogBody{
        max-height:none !important;
        min-height:160px !important;
        scrollbar-gutter:stable !important;
        scrollbar-width:thin !important;
        scrollbar-color:rgba(0,217,255,.84) rgba(0,18,31,.96) !important;
      }
      body.flprStandaloneOriginalClient .recvBody::-webkit-scrollbar,
      body.flprStandaloneOriginalClient #apConnLogBody::-webkit-scrollbar,
      body.flprStandaloneOriginalClient .connectCol::-webkit-scrollbar,
      body.flprStandaloneOriginalClient .controlsTabPanel::-webkit-scrollbar{
        width:calc(4px * var(--flprStandaloneControlFontScale)) !important;
        height:calc(4px * var(--flprStandaloneControlFontScale)) !important;
      }
      body.flprStandaloneOriginalClient .recvBody::-webkit-scrollbar-track,
      body.flprStandaloneOriginalClient #apConnLogBody::-webkit-scrollbar-track,
      body.flprStandaloneOriginalClient .connectCol::-webkit-scrollbar-track,
      body.flprStandaloneOriginalClient .controlsTabPanel::-webkit-scrollbar-track{
        background:
          linear-gradient(180deg, rgba(0,18,31,.98), rgba(0,6,12,.98)) !important;
        border-left:1px solid rgba(0,217,255,.18) !important;
        box-shadow:inset 0 0 calc(6px * var(--flprStandaloneControlFontScale)) rgba(0,0,0,.62) !important;
      }
      body.flprStandaloneOriginalClient .recvBody::-webkit-scrollbar-thumb,
      body.flprStandaloneOriginalClient #apConnLogBody::-webkit-scrollbar-thumb,
      body.flprStandaloneOriginalClient .connectCol::-webkit-scrollbar-thumb,
      body.flprStandaloneOriginalClient .controlsTabPanel::-webkit-scrollbar-thumb{
        border-radius:0 !important;
        border:1px solid rgba(150,248,255,.72) !important;
        background:
          linear-gradient(180deg, rgba(132,248,255,.96), rgba(0,166,255,.92) 52%, rgba(0,255,213,.78)) !important;
        box-shadow:
          0 0 calc(6px * var(--flprStandaloneControlFontScale)) rgba(0,217,255,.42),
          inset 0 0 calc(3px * var(--flprStandaloneControlFontScale)) rgba(255,255,255,.22) !important;
      }
      body.flprStandaloneOriginalClient .recvBody::-webkit-scrollbar-corner,
      body.flprStandaloneOriginalClient #apConnLogBody::-webkit-scrollbar-corner,
      body.flprStandaloneOriginalClient .connectCol::-webkit-scrollbar-corner,
      body.flprStandaloneOriginalClient .controlsTabPanel::-webkit-scrollbar-corner{
        background:rgba(0,8,16,.98) !important;
      }
      body.flprStandaloneOriginalClient .recvBody{
        display:flex !important;
        flex-direction:column !important;
        gap:12px !important;
        flex:1 1 auto !important;
        min-height:0 !important;
        overflow-y:scroll !important;
        overflow-x:hidden !important;
        padding:12px !important;
        font-size:15px !important;
        line-height:1.42 !important;
      }
      body.flprStandaloneOriginalClient .recvBody .recvRow,
      body.flprStandaloneOriginalClient .recvBody .recvText,
      body.flprStandaloneOriginalClient .recvBody .recvTime{
        font-size:inherit !important;
        line-height:1.42 !important;
      }
      body.flprStandaloneOriginalClient .recvBody .recvBadge{
        width:max-content !important;
        max-width:100% !important;
        display:inline-flex !important;
        align-items:center !important;
        min-height:18px !important;
        padding:1px 6px 0 !important;
        border:1px solid currentColor !important;
        border-radius:3px !important;
        font-size:12px !important;
        line-height:1.15 !important;
        vertical-align:baseline !important;
      }
      body.flprStandaloneOriginalClient .standalonePanelSoundBtn{
        position:relative !important;
        top:auto !important;
        right:auto !important;
        z-index:120 !important;
        width:34px !important;
        min-width:34px !important;
        height:34px !important;
        min-height:34px !important;
        display:grid !important;
        place-items:center !important;
        padding:0 !important;
        border:1px solid rgba(34,255,136,.82) !important;
        border-radius:999px !important;
        background:linear-gradient(180deg, rgba(10,76,38,.88), rgba(0,18,31,.94)) !important;
        color:rgba(34,255,136,.98) !important;
        font-family:"Segoe UI Symbol","Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",var(--flprUiFontFamily) !important;
        font-size:21px !important;
        line-height:1 !important;
        filter:none !important;
        text-shadow:0 0 7px rgba(34,255,136,.68) !important;
        box-shadow:0 0 14px rgba(34,255,136,.26), inset 0 0 0 1px rgba(255,255,255,.06) !important;
        cursor:pointer !important;
      }
      body.flprStandaloneOriginalClient .standalonePanelSoundBtn.is-muted{
        border-color:rgba(112,126,134,.52) !important;
        color:rgba(112,126,134,.82) !important;
        background:linear-gradient(180deg, rgba(42,48,52,.82), rgba(0,10,18,.94)) !important;
        filter:none !important;
        text-shadow:none !important;
        box-shadow:inset 0 0 0 1px rgba(255,255,255,.04) !important;
      }
      body.flprStandaloneOriginalClient .standaloneSectionTitle .standalonePanelSoundBtn{
        margin-left:auto !important;
        transform:translateY(-2px) !important;
      }
      body.flprStandaloneOriginalClient .apConnLogHead .standalonePanelSoundBtn{
        margin-left:auto !important;
      }
      body.flprStandaloneOriginalClient .standaloneItemTabs{
        display:grid !important;
        grid-template-columns:repeat(2, minmax(0, 1fr)) !important;
        gap:calc(3px * var(--flprStandaloneControlFontScale)) !important;
        margin:0 !important;
      }
      body.flprStandaloneOriginalClient .standaloneItemTab{
        min-height:calc(20px * var(--flprStandaloneControlFontScale)) !important;
        border:1px solid rgba(0,166,255,.55) !important;
        border-radius:8px !important;
        background:linear-gradient(180deg, rgba(0,40,72,.86), rgba(0,16,30,.92)) !important;
        color:rgba(222,246,255,.86) !important;
        box-shadow:0 0 0 1px rgba(0,217,255,.12) inset !important;
        cursor:pointer !important;
      }
      body.flprStandaloneOriginalClient .standaloneItemTab.active{
        border-color:rgba(0,255,213,.92) !important;
        color:rgba(238,255,252,.98) !important;
        background:linear-gradient(180deg, rgba(0,107,128,.92), rgba(0,34,54,.96)) !important;
        box-shadow:
          0 0 calc(8px * var(--flprStandaloneControlFontScale)) rgba(0,217,255,.28),
          0 0 0 1px rgba(0,255,213,.18) inset !important;
      }
      body.flprStandaloneOriginalClient .recvBody .recvRow{
        flex:0 0 auto !important;
        box-sizing:border-box !important;
        cursor:pointer !important;
        display:grid !important;
        grid-template-columns:124px minmax(0, 1fr) !important;
        align-items:start !important;
        gap:8px !important;
        min-height:116px !important;
        border:1px solid rgba(199,125,255,.46) !important;
        border-radius:6px !important;
        padding:11px 12px 10px !important;
        margin-bottom:0 !important;
        background:
          linear-gradient(180deg, rgba(4,16,25,.94), rgba(2,9,16,.96)),
          radial-gradient(circle at 0% 0%, rgba(0,217,255,.12), transparent 48%) !important;
        user-select:text !important;
        position:relative !important;
        overflow:hidden !important;
        box-shadow:inset 6px 0 0 rgba(199,125,255,.86), inset 0 0 0 1px rgba(255,255,255,.035) !important;
      }
      body.flprStandaloneOriginalClient .recvBody .recvRow:hover{
        border-color:rgba(0,217,255,.48) !important;
        background:rgba(0,50,82,.48) !important;
      }
      body.flprStandaloneOriginalClient .recvBody .recvRow.is-selected{
        border-color:rgba(255,224,122,.96) !important;
        background:
          linear-gradient(180deg, rgba(58,48,0,.62), rgba(0,33,48,.72)) !important;
        box-shadow:
          0 0 calc(10px * var(--flprStandaloneControlFontScale)) rgba(255,224,122,.26),
          0 0 0 1px rgba(255,247,184,.18) inset !important;
      }
      body.flprStandaloneOriginalClient .recvBody .recvRow.apItem-progression{
        border-color:rgba(199,125,255,.56) !important;
        box-shadow:inset 6px 0 0 rgba(199,125,255,.92), inset 0 0 0 1px rgba(255,255,255,.04) !important;
      }
      body.flprStandaloneOriginalClient .recvBody .recvRow.is-new-progression{
        animation:flprStandaloneItemSlotIn 520ms cubic-bezier(.18,.82,.22,1) both !important;
        border-color:rgba(255,224,122,.96) !important;
        box-shadow:
          inset calc(3px * var(--flprStandaloneControlFontScale)) 0 0 rgba(255,154,24,.94),
          0 0 calc(22px * var(--flprStandaloneControlFontScale)) rgba(255,224,122,.34),
          0 0 calc(42px * var(--flprStandaloneControlFontScale)) rgba(199,125,255,.22) !important;
      }
      body.flprStandaloneOriginalClient .recvBody .recvRow.is-new-progression::after{
        content:"" !important;
        position:absolute !important;
        inset:calc(-7px * var(--flprStandaloneControlFontScale)) !important;
        border-radius:inherit !important;
        pointer-events:none !important;
        background:
          radial-gradient(circle at 20% 50%, rgba(255,224,122,.34), transparent 46%),
          radial-gradient(circle at 78% 22%, rgba(199,125,255,.30), transparent 42%),
          linear-gradient(90deg, transparent, rgba(255,255,255,.18), transparent) !important;
        mix-blend-mode:screen !important;
        animation:flprStandaloneItemHalo 2600ms ease-out both !important;
      }
      @keyframes flprStandaloneItemSlotIn{
        0%{ opacity:0; transform:translateY(calc(-22px * var(--flprStandaloneControlFontScale))) scale(.985); }
        58%{ opacity:1; transform:translateY(calc(3px * var(--flprStandaloneControlFontScale))) scale(1.004); }
        100%{ opacity:1; transform:translateY(0) scale(1); }
      }
      @keyframes flprStandaloneItemHalo{
        0%{ opacity:.92; transform:scale(.92); }
        42%{ opacity:.70; transform:scale(1.02); }
        100%{ opacity:0; transform:scale(1.22); }
      }
      body.flprStandaloneOriginalClient .recvBody .recvRow.apItem-useful{
        border-color:rgba(83,183,255,.42) !important;
        box-shadow:inset 6px 0 0 rgba(83,183,255,.82), inset 0 0 0 1px rgba(255,255,255,.035) !important;
      }
      body.flprStandaloneOriginalClient .recvBody .recvRow.apItem-trap{
        border-color:rgba(255,77,109,.50) !important;
        box-shadow:inset 6px 0 0 rgba(255,77,109,.84), inset 0 0 0 1px rgba(255,255,255,.035) !important;
      }
      body.flprStandaloneOriginalClient .recvBody .recvRow.apItem-filler{
        border-color:rgba(199,208,216,.40) !important;
        box-shadow:inset 6px 0 0 rgba(151,166,174,.76), inset 0 0 0 1px rgba(255,255,255,.035) !important;
      }
      body.flprStandaloneOriginalClient .recvBody .recvTime{
        min-width:0 !important;
        max-width:100% !important;
        overflow:hidden !important;
        text-overflow:clip !important;
        white-space:nowrap !important;
        font-variant-numeric:tabular-nums !important;
        font-size:15px !important;
        line-height:1.2 !important;
        color:rgba(135,220,255,.76) !important;
      }
      body.flprStandaloneOriginalClient .recvBody .recvText{
        min-width:0 !important;
        display:block !important;
        white-space:normal !important;
        overflow-wrap:anywhere !important;
      }
      body.flprStandaloneOriginalClient .recvBody .recvLabel{
        color:rgba(188,212,224,.72) !important;
      }
      body.flprStandaloneOriginalClient .recvBody .recvItem{
        color:rgba(255,177,66,.98) !important;
      }
      body.flprStandaloneOriginalClient .recvBody .recvItem.apItem-progression{
        color:rgba(255,154,24,.98) !important;
      }
      body.flprStandaloneOriginalClient .recvBody .recvItem.apItem-useful{
        color:rgba(0,148,255,.98) !important;
      }
      body.flprStandaloneOriginalClient .recvBody .recvItem.apItem-trap{
        color:rgba(255,75,118,.98) !important;
      }
      body.flprStandaloneOriginalClient .recvBody .recvItem.apItem-filler{
        color:rgba(228,240,246,.90) !important;
      }
      body.flprStandaloneOriginalClient .recvBody .recvLocation{
        color:rgba(0,255,153,.96) !important;
      }
      body.flprStandaloneOriginalClient .recvBody .recvPlayer{
        color:rgba(0,217,255,.96) !important;
      }
      body.flprStandaloneOriginalClient .recvBody .recvMeta{
        color:rgba(188,212,224,.68) !important;
      }
      body.flprStandaloneOriginalClient .standaloneItemCopyMenu{
        position:fixed !important;
        z-index:2147483647 !important;
        pointer-events:auto !important;
        min-width:calc(68px * var(--flprStandaloneControlFontScale)) !important;
        border:1px solid rgba(0,217,255,.72) !important;
        border-radius:8px !important;
        padding:calc(3px * var(--flprStandaloneControlFontScale)) !important;
        background:
          linear-gradient(180deg, rgba(0,32,52,.98), rgba(0,8,16,.98)) !important;
        box-shadow:
          0 0 calc(14px * var(--flprStandaloneControlFontScale)) rgba(0,217,255,.24),
          0 12px 24px rgba(0,0,0,.48) !important;
      }
      body.flprStandaloneOriginalClient .standaloneItemCopyMenu button{
        width:100% !important;
        border:1px solid rgba(0,255,213,.55) !important;
        border-radius:6px !important;
        background:rgba(0,166,255,.14) !important;
        color:rgba(235,255,252,.96) !important;
        padding:calc(4px * var(--flprStandaloneControlFontScale)) calc(6px * var(--flprStandaloneControlFontScale)) !important;
        cursor:pointer !important;
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
        min-height:calc(22px * var(--flprStandaloneControlFontScale)) !important;
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
        padding:calc(3px * var(--flprStandaloneControlFontScale)) !important;
      }
      body.flprStandaloneOriginalClient .apClientSayInput{
        position:relative !important;
        z-index:90 !important;
        pointer-events:auto !important;
        width:100% !important;
        min-width:0 !important;
        min-height:calc(22px * var(--flprStandaloneControlFontScale)) !important;
      }
      body.flprStandaloneOriginalClient .apClientSayBtn{
        position:relative !important;
        z-index:100 !important;
        pointer-events:auto !important;
        min-width:calc(70px * var(--flprStandaloneControlFontScale)) !important;
        white-space:nowrap !important;
      }
      body.flprStandaloneOriginalClient .apClientSayHint{
        padding:0 calc(3px * var(--flprStandaloneControlFontScale)) calc(3px * var(--flprStandaloneControlFontScale)) !important;
        font-size:calc(4.2px * var(--flprStandaloneControlFontScale)) !important;
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
        overflow-y:scroll !important;
        overflow-x:hidden !important;
        padding:calc(5px * var(--flprStandaloneControlFontScale)) !important;
        font-size:calc(5.6px * var(--flprStandaloneControlFontScale)) !important;
        line-height:1.45 !important;
      }
      body.flprStandaloneOriginalClient #apConnLogBody .apLogLine{
        display:block !important;
        padding:calc(1px * var(--flprStandaloneControlFontScale)) 0 !important;
        color:rgba(235,248,255,.94) !important;
        cursor:pointer !important;
      }
      body.flprStandaloneOriginalClient #apConnLogBody .apLogLine + .apLogLine{
        border-top:1px solid rgba(0,217,255,.08) !important;
      }
      body.flprStandaloneOriginalClient #apConnLogBody .apHintCard{
        display:grid !important;
        grid-template-columns:auto minmax(0, 1fr) !important;
        gap:calc(6px * var(--flprStandaloneControlFontScale)) !important;
        align-items:start !important;
        margin:calc(4px * var(--flprStandaloneControlFontScale)) 0 !important;
        padding:calc(5px * var(--flprStandaloneControlFontScale)) !important;
        border:1px solid rgba(255,142,255,.36) !important;
        border-left-width:calc(2px * var(--flprStandaloneControlFontScale)) !important;
        border-radius:8px !important;
        background:linear-gradient(90deg, rgba(126,58,255,.14), rgba(0,18,31,.54)) !important;
        box-shadow:0 0 16px rgba(255,142,255,.10) inset !important;
      }
      body.flprStandaloneOriginalClient #apConnLogBody .apHintCard .apHintTime{
        color:rgba(135,220,255,.72) !important;
        white-space:nowrap !important;
      }
      body.flprStandaloneOriginalClient #apConnLogBody .apHintCard .apHintText{
        min-width:0 !important;
      }
      body.flprStandaloneOriginalClient #apConnLogBody .apServerHintSection{
        display:grid !important;
        gap:calc(5px * var(--flprStandaloneControlFontScale)) !important;
        margin:0 0 calc(8px * var(--flprStandaloneControlFontScale)) !important;
        padding:0 0 calc(8px * var(--flprStandaloneControlFontScale)) !important;
        border-bottom:1px solid rgba(0,217,255,.16) !important;
      }
      body.flprStandaloneOriginalClient #apConnLogBody .apServerHintHeader{
        display:flex !important;
        justify-content:space-between !important;
        align-items:center !important;
        gap:calc(6px * var(--flprStandaloneControlFontScale)) !important;
        color:rgba(0,255,238,.98) !important;
        text-transform:uppercase !important;
        letter-spacing:0 !important;
      }
      body.flprStandaloneOriginalClient #apConnLogBody .apServerHintHeader small{
        color:rgba(188,212,224,.72) !important;
        font-size:.76em !important;
      }
      body.flprStandaloneOriginalClient #apConnLogBody .apServerHintCard{
        display:grid !important;
        gap:calc(3px * var(--flprStandaloneControlFontScale)) !important;
        margin:calc(4px * var(--flprStandaloneControlFontScale)) 0 !important;
        padding:calc(6px * var(--flprStandaloneControlFontScale)) !important;
        border:1px solid rgba(0,217,255,.26) !important;
        border-left-width:calc(2px * var(--flprStandaloneControlFontScale)) !important;
        border-radius:8px !important;
        background:linear-gradient(90deg, rgba(0,217,255,.10), rgba(0,18,31,.54)) !important;
        box-shadow:0 0 14px rgba(0,217,255,.08) inset !important;
      }
      body.flprStandaloneOriginalClient #apConnLogBody .apServerHintCard.priority-progression{
        border-left-color:rgba(255,154,24,.95) !important;
        background:linear-gradient(90deg, rgba(255,154,24,.16), rgba(0,18,31,.56)) !important;
      }
      body.flprStandaloneOriginalClient #apConnLogBody .apServerHintCard.priority-useful{
        border-left-color:rgba(0,148,255,.95) !important;
      }
      body.flprStandaloneOriginalClient #apConnLogBody .apServerHintCard.priority-trap{
        border-left-color:rgba(255,75,118,.95) !important;
      }
      body.flprStandaloneOriginalClient #apConnLogBody .apServerHintMeta{
        display:flex !important;
        flex-wrap:wrap !important;
        gap:calc(4px * var(--flprStandaloneControlFontScale)) !important;
        align-items:center !important;
        color:rgba(188,212,224,.74) !important;
      }
      body.flprStandaloneOriginalClient #apConnLogBody .apServerHintBadge{
        display:inline-flex !important;
        align-items:center !important;
        min-height:calc(9px * var(--flprStandaloneControlFontScale)) !important;
        padding:0 calc(3px * var(--flprStandaloneControlFontScale)) !important;
        border:1px solid rgba(0,217,255,.45) !important;
        border-radius:5px !important;
        color:rgba(232,250,255,.90) !important;
        background:rgba(0,18,31,.70) !important;
      }
      body.flprStandaloneOriginalClient #apConnLogBody .apServerHintStatus.found{
        border-color:rgba(0,255,153,.72) !important;
        color:rgba(0,255,153,.98) !important;
      }
      body.flprStandaloneOriginalClient #apConnLogBody .apServerHintStatus.uncollected{
        border-color:rgba(255,231,126,.70) !important;
        color:rgba(255,231,126,.98) !important;
      }
      body.flprStandaloneOriginalClient #apConnLogBody .apServerHintLine{
        color:rgba(232,250,255,.94) !important;
      }
      body.flprStandaloneOriginalClient #apConnLogBody .apLogEmpty{
        color:rgba(232,250,255,.64) !important;
      }
      body.flprStandaloneOriginalClient #apConnLogBody .apLogTimestamp{
        color:rgba(135,220,255,.72) !important;
      }
      body.flprStandaloneOriginalClient #apConnLogBody .apLogSource{
        color:rgba(118,248,255,.98) !important;
      }
      body.flprStandaloneOriginalClient #apConnLogBody .apLogPlayer{
        color:rgba(0,217,255,.98) !important;
        cursor:pointer !important;
      }
      body.flprStandaloneOriginalClient #apConnLogBody .apLogItem{
        color:rgba(255,177,66,.98) !important;
        cursor:help !important;
        border-bottom:1px dotted rgba(255,177,66,.58) !important;
      }
      body.flprStandaloneOriginalClient #apConnLogBody .apLogItem.apItem-progression{
        color:rgba(255,154,24,.98) !important;
        border-bottom-color:rgba(255,154,24,.70) !important;
      }
      body.flprStandaloneOriginalClient #apConnLogBody .apLogItem.apItem-useful{
        color:rgba(0,148,255,.98) !important;
        border-bottom-color:rgba(0,148,255,.70) !important;
      }
      body.flprStandaloneOriginalClient #apConnLogBody .apLogItem.apItem-trap{
        color:rgba(255,75,118,.98) !important;
        border-bottom-color:rgba(255,75,118,.74) !important;
      }
      body.flprStandaloneOriginalClient #apConnLogBody .apLogItem.apItem-filler{
        color:rgba(228,240,246,.9) !important;
        border-bottom-color:rgba(228,240,246,.42) !important;
      }
      body.flprStandaloneOriginalClient #apConnLogBody .apLogLocation{
        color:rgba(0,255,153,.98) !important;
      }
      body.flprStandaloneOriginalClient #apConnLogBody .apLogEvent{
        color:rgba(255,231,126,.96) !important;
      }
      body.flprStandaloneOriginalClient #apConnLogBody .apLogHint{
        color:rgba(255,142,255,.98) !important;
      }
      body.flprStandaloneOriginalClient #apConnLogBody .apLogMuted{
        color:rgba(188,212,224,.68) !important;
      }
      body.flprStandaloneOriginalClient .standaloneApItemHoverTip{
        position:fixed !important;
        z-index:2147483647 !important;
        pointer-events:none !important;
        opacity:0 !important;
        transform:translate(-50%, calc(-100% - 12px)) scale(.98) !important;
        transition:opacity 90ms ease, transform 90ms ease !important;
        max-width:calc(220px * var(--flprStandaloneControlFontScale)) !important;
        padding:calc(5px * var(--flprStandaloneControlFontScale)) calc(8px * var(--flprStandaloneControlFontScale)) !important;
        border:1px solid rgba(0,217,255,.78) !important;
        border-radius:7px !important;
        background:
          linear-gradient(180deg, rgba(0,36,56,.98), rgba(0,8,18,.98)) !important;
        box-shadow:
          0 0 calc(14px * var(--flprStandaloneControlFontScale)) rgba(0,217,255,.30),
          0 calc(10px * var(--flprStandaloneControlFontScale)) calc(22px * var(--flprStandaloneControlFontScale)) rgba(0,0,0,.52) !important;
        color:rgba(232,250,255,.94) !important;
        font-family:inherit !important;
        font-size:calc(10px * var(--flprStandaloneControlFontScale)) !important;
        line-height:1.1 !important;
        text-transform:uppercase !important;
        white-space:nowrap !important;
      }
      body.flprStandaloneOriginalClient .standaloneApItemHoverTip.visible{
        opacity:1 !important;
        transform:translate(-50%, calc(-100% - 14px)) scale(1) !important;
      }
      body.flprStandaloneOriginalClient .standaloneApItemHoverTip.apItem-progression{
        border-color:rgba(199,125,255,.92) !important;
        color:rgba(255,194,82,.98) !important;
        box-shadow:0 0 calc(16px * var(--flprStandaloneControlFontScale)) rgba(199,125,255,.34), 0 calc(10px * var(--flprStandaloneControlFontScale)) calc(22px * var(--flprStandaloneControlFontScale)) rgba(0,0,0,.52) !important;
      }
      body.flprStandaloneOriginalClient .standaloneApItemHoverTip.apItem-useful{
        border-color:rgba(83,183,255,.92) !important;
        color:rgba(126,216,255,.98) !important;
      }
      body.flprStandaloneOriginalClient .standaloneApItemHoverTip.apItem-trap{
        border-color:rgba(255,75,118,.92) !important;
        color:rgba(255,154,180,.98) !important;
        box-shadow:0 0 calc(16px * var(--flprStandaloneControlFontScale)) rgba(255,75,118,.34), 0 calc(10px * var(--flprStandaloneControlFontScale)) calc(22px * var(--flprStandaloneControlFontScale)) rgba(0,0,0,.52) !important;
      }
      body.flprStandaloneOriginalClient .standaloneApItemHoverTip.apItem-filler{
        border-color:rgba(228,240,246,.56) !important;
        color:rgba(228,240,246,.94) !important;
      }
      body.flprStandaloneOriginalClient .ovModalCard.flprStandaloneSentItemModal{
        border-color:rgba(0,217,255,.74) !important;
      }
      body.flprStandaloneOriginalClient .ovModalCard.flprStandaloneSentItemModal.apItem-progression{
        border-color:rgba(199,125,255,.92) !important;
        box-shadow:0 22px 70px rgba(0,0,0,.62), 0 0 52px rgba(199,125,255,.18) !important;
      }
      body.flprStandaloneOriginalClient .ovModalCard.flprStandaloneSentItemModal.apItem-useful{
        border-color:rgba(83,183,255,.92) !important;
        box-shadow:0 22px 70px rgba(0,0,0,.62), 0 0 52px rgba(83,183,255,.18) !important;
      }
      body.flprStandaloneOriginalClient .ovModalCard.flprStandaloneSentItemModal.apItem-filler{
        border-color:rgba(199,208,216,.72) !important;
      }
      body.flprStandaloneOriginalClient .ovModalCard.flprStandaloneSentItemModal.apItem-trap{
        border-color:rgba(255,77,109,.92) !important;
        box-shadow:0 22px 70px rgba(0,0,0,.62), 0 0 52px rgba(255,77,109,.18) !important;
      }
      body.flprStandaloneOriginalClient .ovModalCard.flprStandaloneSentItemModal .ovModalBig.apLogItem.apItem-progression{
        color:rgba(255,154,24,.98) !important;
      }
      body.flprStandaloneOriginalClient .ovModalCard.flprStandaloneSentItemModal .ovModalBig.apLogItem.apItem-useful{
        color:rgba(0,148,255,.98) !important;
      }
      body.flprStandaloneOriginalClient .ovModalCard.flprStandaloneSentItemModal .ovModalBig.apLogItem.apItem-filler{
        color:rgba(228,240,246,.92) !important;
      }
      body.flprStandaloneOriginalClient .ovModalCard.flprStandaloneSentItemModal .ovModalBig.apLogItem.apItem-trap{
        color:rgba(255,75,118,.98) !important;
      }
      body.flprStandaloneOriginalClient .ovModalCard.flprStandaloneSentItemModal .apLogPlayer{
        color:rgba(0,217,255,.98) !important;
      }
      body.flprStandaloneOriginalClient .ovModalCard.flprStandaloneSentItemModal .apLogLocation{
        color:rgba(0,255,153,.98) !important;
      }
      body.flprStandaloneOriginalClient .ovModalCard.flprStandaloneSentItemModal .apLogSource{
        color:rgba(118,248,255,.94) !important;
      }
      body.flprStandaloneOriginalClient .ovModalCard.flprStandaloneSiegeQueued{
        overflow:visible !important;
        position:relative !important;
        border-color:rgba(255,224,122,.90) !important;
        box-shadow:
          0 22px 70px rgba(0,0,0,.62),
          0 0 44px rgba(255,224,122,.20),
          0 0 78px rgba(255,77,109,.15) !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeIncoming{
        position:absolute !important;
        left:50% !important;
        top:-42px !important;
        transform:translateX(-50%) !important;
        z-index:5 !important;
        pointer-events:none !important;
        white-space:nowrap !important;
        font-family:var(--flprUiFontFamily) !important;
        font-size:20px !important;
        line-height:1 !important;
        letter-spacing:0 !important;
        color:rgba(255,238,129,.98) !important;
        text-shadow:
          0 0 8px rgba(255,224,122,.95),
          0 0 18px rgba(255,77,109,.65),
          0 0 34px rgba(0,217,255,.42) !important;
        animation:flprStandaloneSiegeIncomingPulse .78s ease-in-out infinite alternate !important;
      }
      @keyframes flprStandaloneSiegeIncomingPulse{
        from{
          opacity:.82;
          filter:drop-shadow(0 0 6px rgba(255,224,122,.55));
          transform:translateX(-50%) translateY(2px) scale(.985);
        }
        to{
          opacity:1;
          filter:drop-shadow(0 0 18px rgba(255,77,109,.76));
          transform:translateX(-50%) translateY(-2px) scale(1.015);
        }
      }
      body.flprStandaloneOriginalClient.flprStandaloneSiegeIntroActive #selectedBody .pentaCard{
        transition:
          opacity 980ms ease,
          filter 980ms ease,
          scale 980ms cubic-bezier(.18,.86,.18,1),
          translate 980ms cubic-bezier(.18,.86,.18,1) !important;
      }
      body.flprStandaloneOriginalClient.flprStandaloneSiegeIntroActive #selectedBody .pentaCard:not(.flprStandaloneSiegeIntroTarget){
        opacity:.025 !important;
        scale:.54 !important;
        filter:grayscale(.86) brightness(.22) saturate(.42) blur(.8px) !important;
        pointer-events:none !important;
      }
      body.flprStandaloneOriginalClient.flprStandaloneSiegeIntroActive #selectedBody .pentaCard.flprStandaloneSiegeIntroTarget{
        z-index:1600 !important;
        will-change:translate, scale, filter, opacity !important;
        pointer-events:none !important;
        transform-origin:center center !important;
      }
      body.flprStandaloneOriginalClient.flprStandaloneSiegeIntroActive #selectedBody .pentaCard.flprStandaloneSiegeIntroTarget.flprStandaloneSiegeIntroFallback{
        translate:var(--flpr-siege-intro-dx, 0px) var(--flpr-siege-intro-dy, 0px) !important;
        scale:var(--flpr-siege-intro-sx, .56) var(--flpr-siege-intro-sy, .40) !important;
        animation:flprStandaloneSiegeTargetMorphFallback var(--flpr-siege-intro-ms, 1450ms) cubic-bezier(.16,.92,.16,1) forwards !important;
      }
      body.flprStandaloneOriginalClient.flprStandaloneSiegeIntroActive #selectedBody .pentaCard.flprStandaloneSiegeIntroTarget.flprStandaloneSiegeIntroReady{
        pointer-events:auto !important;
      }
      body.flprStandaloneOriginalClient.flprStandaloneSiegeIntroActive .flprStandaloneSiegeIntroTarget .besiegedCastleAura,
      body.flprStandaloneOriginalClient.flprStandaloneSiegeIntroActive .flprStandaloneSiegeIntroTarget .besiegedCastleKeep,
      body.flprStandaloneOriginalClient.flprStandaloneSiegeIntroActive .flprStandaloneSiegeIntroTarget .besiegedCastleCrown,
      body.flprStandaloneOriginalClient.flprStandaloneSiegeIntroActive .flprStandaloneSiegeIntroTarget .besiegedCastleGate,
      body.flprStandaloneOriginalClient.flprStandaloneSiegeIntroActive .flprStandaloneSiegeIntroTarget .besiegedCastleTower,
      body.flprStandaloneOriginalClient.flprStandaloneSiegeIntroActive .flprStandaloneSiegeIntroTarget .besiegedCastleFlag,
      body.flprStandaloneOriginalClient.flprStandaloneSiegeIntroActive .flprStandaloneSiegeIntroTarget .besiegedCastleWindows{
        opacity:0 !important;
        translate:0 -24px !important;
        scale:.92 !important;
        filter:brightness(.58) saturate(.82) !important;
      }
      body.flprStandaloneOriginalClient.flprStandaloneSiegeIntroActive .flprStandaloneSiegeIntroTarget .besiegedArmyBadge,
      body.flprStandaloneOriginalClient.flprStandaloneSiegeIntroActive .flprStandaloneSiegeIntroTarget .besiegedStory,
      body.flprStandaloneOriginalClient.flprStandaloneSiegeIntroActive .flprStandaloneSiegeIntroTarget .besiegedArmyField,
      body.flprStandaloneOriginalClient.flprStandaloneSiegeIntroActive .flprStandaloneSiegeIntroTarget .besiegedAttackerBanner{
        opacity:0 !important;
        translate:0 58px !important;
        scale:.78 !important;
        filter:brightness(.48) saturate(.58) blur(.6px) !important;
      }
      body.flprStandaloneOriginalClient.flprStandaloneSiegeIntroActive .flprStandaloneSiegeIntroTarget .besiegedSiegeFx,
      body.flprStandaloneOriginalClient.flprStandaloneSiegeIntroActive .flprStandaloneSiegeIntroTarget .besiegedStatusRail,
      body.flprStandaloneOriginalClient.flprStandaloneSiegeIntroActive .flprStandaloneSiegeIntroTarget .besiegedDamageFx,
      body.flprStandaloneOriginalClient.flprStandaloneSiegeIntroActive .flprStandaloneSiegeIntroTarget .besiegedRubbleFx{
        opacity:0 !important;
        translate:0 22px !important;
        scale:.90 !important;
        filter:brightness(.56) saturate(.68) !important;
      }
      body.flprStandaloneOriginalClient.flprStandaloneSiegeIntroActive .flprStandaloneSiegeIntroTarget.flprStandaloneSiegeIntroArmy .besiegedArmyBadge,
      body.flprStandaloneOriginalClient.flprStandaloneSiegeIntroActive .flprStandaloneSiegeIntroTarget.flprStandaloneSiegeIntroArmy .besiegedStory,
      body.flprStandaloneOriginalClient.flprStandaloneSiegeIntroActive .flprStandaloneSiegeIntroTarget.flprStandaloneSiegeIntroArmy .besiegedArmyField,
      body.flprStandaloneOriginalClient.flprStandaloneSiegeIntroActive .flprStandaloneSiegeIntroTarget.flprStandaloneSiegeIntroArmy .besiegedAttackerBanner{
        animation:flprStandaloneSiegeArmyIntro 980ms cubic-bezier(.12,.9,.16,1) forwards !important;
      }
      body.flprStandaloneOriginalClient.flprStandaloneSiegeIntroActive .flprStandaloneSiegeIntroTarget.flprStandaloneSiegeIntroCastle .besiegedCastleAura,
      body.flprStandaloneOriginalClient.flprStandaloneSiegeIntroActive .flprStandaloneSiegeIntroTarget.flprStandaloneSiegeIntroCastle .besiegedCastleKeep,
      body.flprStandaloneOriginalClient.flprStandaloneSiegeIntroActive .flprStandaloneSiegeIntroTarget.flprStandaloneSiegeIntroCastle .besiegedCastleCrown,
      body.flprStandaloneOriginalClient.flprStandaloneSiegeIntroActive .flprStandaloneSiegeIntroTarget.flprStandaloneSiegeIntroCastle .besiegedCastleGate,
      body.flprStandaloneOriginalClient.flprStandaloneSiegeIntroActive .flprStandaloneSiegeIntroTarget.flprStandaloneSiegeIntroCastle .besiegedCastleTower,
      body.flprStandaloneOriginalClient.flprStandaloneSiegeIntroActive .flprStandaloneSiegeIntroTarget.flprStandaloneSiegeIntroCastle .besiegedCastleFlag,
      body.flprStandaloneOriginalClient.flprStandaloneSiegeIntroActive .flprStandaloneSiegeIntroTarget.flprStandaloneSiegeIntroCastle .besiegedCastleWindows,
      body.flprStandaloneOriginalClient.flprStandaloneSiegeIntroActive .flprStandaloneSiegeIntroTarget.flprStandaloneSiegeIntroCastle .besiegedSiegeFx,
      body.flprStandaloneOriginalClient.flprStandaloneSiegeIntroActive .flprStandaloneSiegeIntroTarget.flprStandaloneSiegeIntroCastle .besiegedStatusRail,
      body.flprStandaloneOriginalClient.flprStandaloneSiegeIntroActive .flprStandaloneSiegeIntroTarget.flprStandaloneSiegeIntroCastle .besiegedDamageFx,
      body.flprStandaloneOriginalClient.flprStandaloneSiegeIntroActive .flprStandaloneSiegeIntroTarget.flprStandaloneSiegeIntroCastle .besiegedRubbleFx{
        animation:flprStandaloneSiegeCastleIntro 980ms cubic-bezier(.16,.9,.18,1) forwards !important;
      }
      body.flprStandaloneOriginalClient.flprStandaloneSiegeIntroActive .flprStandaloneSiegeIntroTarget .besiegedDefenseHud,
      body.flprStandaloneOriginalClient.flprStandaloneSiegeIntroActive .flprStandaloneSiegeIntroTarget .besiegedTargetBtn{
        opacity:0 !important;
        pointer-events:none !important;
      }
      body.flprStandaloneOriginalClient.flprStandaloneSiegeIntroActive .flprStandaloneSiegeIntroTarget.flprStandaloneSiegeIntroReady .besiegedDefenseHud,
      body.flprStandaloneOriginalClient.flprStandaloneSiegeIntroActive .flprStandaloneSiegeIntroTarget.flprStandaloneSiegeIntroReady .besiegedTargetBtn{
        animation:flprStandaloneSiegeControlsIntro 720ms ease-out forwards !important;
      }
      body.flprStandaloneOriginalClient.flprStandaloneSiegeIntroActive .flprStandaloneSiegeIntroTarget.flprStandaloneSiegeIntroReady .besiegedTargetBtn{
        pointer-events:auto !important;
      }
      @keyframes flprStandaloneSiegeTargetMorphFallback{
        0%{
          translate:var(--flpr-siege-intro-dx, 0px) var(--flpr-siege-intro-dy, 0px);
          scale:var(--flpr-siege-intro-sx, .56) var(--flpr-siege-intro-sy, .40);
          opacity:.88;
          filter:brightness(.72) saturate(.74);
        }
        62%{
          translate:calc(var(--flpr-siege-intro-dx, 0px) * -.018) calc(var(--flpr-siege-intro-dy, 0px) * -.018);
          scale:1.035 1.025;
          opacity:1;
          filter:brightness(1.14) saturate(1.18);
        }
        100%{
          translate:0 0;
          scale:1 1;
          opacity:1;
          filter:brightness(1) saturate(1);
        }
      }
      @keyframes flprStandaloneSiegeCastleIntro{
        0%{ opacity:0; translate:0 -24px; scale:.92; filter:brightness(.58) saturate(.82); }
        54%{ opacity:1; translate:0 6px; scale:1.035; filter:brightness(1.24) saturate(1.18); }
        100%{ opacity:1; translate:0 0; scale:1; filter:brightness(1) saturate(1); }
      }
      @keyframes flprStandaloneSiegeArmyIntro{
        0%{ opacity:0; translate:0 72px; scale:.72; filter:brightness(.42) saturate(.52) blur(.8px); }
        28%{ opacity:.96; translate:0 34px; scale:.88; filter:brightness(.72) saturate(.88) blur(.2px); }
        70%{ opacity:1; translate:0 -4px; scale:1.045; filter:brightness(1.22) saturate(1.18); }
        100%{ opacity:1; translate:0 0; scale:1; filter:brightness(1) saturate(1); }
      }
      @keyframes flprStandaloneSiegeControlsIntro{
        from{ opacity:0; filter:brightness(.55); }
        to{ opacity:1; filter:brightness(1); }
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryOverlay{
        position:absolute !important;
        inset:0 !important;
        z-index:2147483647 !important;
        pointer-events:auto !important;
        overflow:hidden !important;
        display:flex !important;
        align-items:center !important;
        justify-content:center !important;
        isolation:isolate !important;
        background:
          radial-gradient(circle at 50% 42%, rgba(255,224,122,.24), rgba(0,217,255,.15) 26%, transparent 48%),
          radial-gradient(circle at 50% 100%, rgba(34,255,136,.20), transparent 48%),
          linear-gradient(180deg, rgba(0,6,14,.80), rgba(0,0,0,.92)) !important;
        backdrop-filter:blur(3px) saturate(1.12) !important;
        opacity:0 !important;
        animation:flprStandaloneSiegeVictoryIn 260ms ease-out forwards !important;
      }
      body.flprStandaloneOriginalClient .viewport.flprStandaloneSiegeCinematicHost{
        position:relative !important;
        overflow:hidden !important;
        isolation:isolate !important;
      }
      body.flprStandaloneOriginalClient #viewOverview.flprStandaloneSiegeCinematicHost{
        position:absolute !important;
        overflow:hidden !important;
        isolation:isolate !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryOverlay.leaving{
        animation:flprStandaloneSiegeVictoryOut 680ms ease-in forwards !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryOverlay::before,
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryOverlay::after{
        content:"" !important;
        position:absolute !important;
        top:-32% !important;
        width:260px !important;
        height:170% !important;
        pointer-events:none !important;
        opacity:.36 !important;
        background:linear-gradient(180deg, rgba(255,247,190,.58), rgba(0,217,255,.16) 44%, transparent 78%) !important;
        mix-blend-mode:screen !important;
        animation:flprStandaloneSiegeVictorySpotlight 2300ms ease-in-out infinite !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryOverlay::before{
        left:9% !important;
        transform-origin:50% 4% !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryOverlay::after{
        right:9% !important;
        transform-origin:50% 4% !important;
        animation-delay:260ms !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryBattle{
        position:absolute !important;
        inset:0 !important;
        z-index:2 !important;
        pointer-events:none !important;
        overflow:hidden !important;
        perspective:1100px !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictorySky{
        position:absolute !important;
        inset:0 !important;
        background:
          radial-gradient(circle at 50% 29%, rgba(255,224,122,.18), transparent 17%),
          radial-gradient(circle at 50% 44%, rgba(0,217,255,.26), transparent 34%),
          linear-gradient(180deg, rgba(7,18,33,.82), rgba(3,7,15,.90) 62%, rgba(0,0,0,.96)) !important;
        opacity:.94 !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryGround{
        position:absolute !important;
        left:-8% !important;
        right:-8% !important;
        bottom:-8% !important;
        height:38% !important;
        background:
          radial-gradient(ellipse at 50% 0%, rgba(34,255,136,.22), transparent 48%),
          repeating-linear-gradient(90deg, rgba(0,217,255,.13) 0 2px, transparent 2px 56px),
          linear-gradient(180deg, rgba(0,217,255,.10), rgba(0,0,0,.84)) !important;
        transform:rotateX(63deg) translateY(32px) !important;
        transform-origin:50% 100% !important;
        box-shadow:0 -26px 120px rgba(0,217,255,.16) !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryCastle{
        --castle-damage:0;
        --siege-castle-top:rgba(185,219,226,.92);
        --siege-castle-mid:rgba(86,124,139,.96);
        --siege-castle-low:rgba(34,52,68,.98);
        --siege-castle-accent:rgba(255,184,92,.96);
        --siege-castle-gate:rgba(120,67,45,.98);
        --siege-castle-gate-dark:rgba(44,20,14,.98);
        position:absolute !important;
        left:50% !important;
        bottom:20% !important;
        width:min(560px, 42%) !important;
        height:330px !important;
        transform:translateX(-50%) translateY(22px) scale(.78) !important;
        transform-origin:50% 100% !important;
        filter:drop-shadow(0 22px 34px rgba(0,0,0,.72)) drop-shadow(0 0 26px rgba(0,217,255,.20)) !important;
        animation:flprStandaloneSiegeVictoryCastleRecover 1350ms cubic-bezier(.16,.95,.15,1) forwards !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryCastle.damage1{ --castle-damage:.25; }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryCastle.damage2{ --castle-damage:.52; }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryCastle.damage3{ --castle-damage:.78; }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryCastle.damage4{ --castle-damage:1; }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryTower,
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryKeep{
        position:absolute !important;
        bottom:0 !important;
        border:3px solid color-mix(in srgb, var(--siege-castle-accent) 58%, rgba(0,217,255,.88)) !important;
        background:
          linear-gradient(135deg, rgba(255,255,255,.13), transparent 30%),
          linear-gradient(180deg, color-mix(in srgb, var(--siege-castle-top) 90%, white 10%), var(--siege-castle-mid) 48%, var(--siege-castle-low)) !important;
        box-shadow:
          0 0 0 2px rgba(255,224,122,.14) inset,
          0 0 28px color-mix(in srgb, var(--siege-castle-accent) 24%, transparent) !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryTower{
        width:24% !important;
        height:72% !important;
        border-radius:14px 14px 5px 5px !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryTower.left{
        left:4% !important;
        transform:rotate(calc(var(--castle-damage) * -3deg)) !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryTower.right{
        right:4% !important;
        transform:rotate(calc(var(--castle-damage) * 3deg)) !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryKeep{
        left:22% !important;
        width:56% !important;
        height:88% !important;
        border-radius:18px 18px 6px 6px !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryCrown{
        position:absolute !important;
        left:50% !important;
        top:-42px !important;
        width:44% !important;
        height:58px !important;
        transform:translateX(-50%) !important;
        background:
          linear-gradient(135deg, transparent 0 19%, color-mix(in srgb, var(--siege-castle-accent) 88%, white 12%) 20% 39%, transparent 40% 59%, color-mix(in srgb, var(--siege-castle-accent) 88%, white 12%) 60% 79%, transparent 80%),
          linear-gradient(180deg, color-mix(in srgb, var(--siege-castle-accent) 78%, white 22%), color-mix(in srgb, var(--siege-castle-accent) 62%, black 38%)) !important;
        clip-path:polygon(0 100%, 12% 42%, 25% 100%, 50% 6%, 75% 100%, 88% 42%, 100% 100%) !important;
        filter:drop-shadow(0 0 14px color-mix(in srgb, var(--siege-castle-accent) 58%, transparent)) !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryGate{
        position:absolute !important;
        left:50% !important;
        bottom:0 !important;
        width:22% !important;
        height:36% !important;
        transform:translateX(-50%) skewX(calc(var(--castle-damage) * -2deg)) !important;
        border:3px solid rgba(255,224,122,.64) !important;
        border-bottom:0 !important;
        border-radius:28px 28px 0 0 !important;
        background:
          repeating-linear-gradient(90deg, color-mix(in srgb, var(--siege-castle-gate) 64%, transparent) 0 3px, transparent 3px 17px),
          linear-gradient(180deg, var(--siege-castle-gate), var(--siege-castle-gate-dark)) !important;
        box-shadow:0 0 26px color-mix(in srgb, var(--siege-castle-accent) 24%, transparent) inset !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryWindow{
        position:absolute !important;
        width:26px !important;
        height:38px !important;
        border:2px solid rgba(0,217,255,.72) !important;
        border-radius:14px 14px 4px 4px !important;
        background:rgba(255,224,122,.82) !important;
        box-shadow:0 0 18px rgba(255,224,122,.70) !important;
        opacity:calc(.88 - (var(--castle-damage) * .42)) !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryWindow.w1{ left:31%; top:30%; }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryWindow.w2{ right:31%; top:30%; }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryWindow.w3{ left:15%; top:38%; }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryWindow.w4{ right:15%; top:38%; }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryCrack{
        position:absolute !important;
        width:4px !important;
        height:112px !important;
        top:26% !important;
        left:58% !important;
        background:linear-gradient(180deg, rgba(0,0,0,.0), rgba(0,0,0,.88), rgba(255,77,109,.42), rgba(0,0,0,.70)) !important;
        box-shadow:0 0 12px rgba(255,77,109,.32) !important;
        opacity:calc(.18 + var(--castle-damage) * .82) !important;
        transform:rotate(15deg) scaleY(calc(.45 + var(--castle-damage) * .55)) !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryCrack.c2{
        left:40% !important;
        top:42% !important;
        height:86px !important;
        transform:rotate(-21deg) scaleY(calc(.35 + var(--castle-damage) * .55)) !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictorySmoke,
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryFlame{
        position:absolute !important;
        pointer-events:none !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictorySmoke{
        width:78px !important;
        height:78px !important;
        border-radius:999px !important;
        background:radial-gradient(circle, rgba(174,206,214,.42), transparent 68%) !important;
        filter:blur(8px) !important;
        opacity:calc(.08 + var(--castle-damage) * .60) !important;
        animation:flprStandaloneSiegeVictorySmoke 2100ms ease-in-out infinite !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictorySmoke.s1{ left:18%; top:2%; }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictorySmoke.s2{ right:15%; top:13%; animation-delay:-620ms !important; }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictorySmoke.s3{ left:48%; top:-4%; animation-delay:-1180ms !important; }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryFlame{
        width:28px !important;
        height:48px !important;
        border-radius:50% 50% 46% 46% !important;
        background:radial-gradient(circle at 50% 72%, rgba(255,242,157,.95), rgba(255,119,40,.84) 46%, transparent 72%) !important;
        opacity:calc(var(--castle-damage) * .78) !important;
        filter:drop-shadow(0 0 14px rgba(255,88,43,.76)) !important;
        animation:flprStandaloneSiegeVictoryFlame .48s ease-in-out infinite alternate !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryFlame.f1{ left:25%; bottom:30%; }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryFlame.f2{ right:24%; bottom:42%; animation-delay:-180ms !important; }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryCastle .flprStandaloneSiegeVictoryFlame{
        animation:flprStandaloneSiegeVictoryFlameDoused 2400ms ease-out forwards !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryCastle .flprStandaloneSiegeVictoryFlame.f2{
        animation-delay:160ms !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryRubble{
        position:absolute !important;
        left:50% !important;
        bottom:-16px !important;
        width:64% !important;
        height:30px !important;
        transform:translateX(-50%) !important;
        background:
          radial-gradient(circle at 8% 60%, rgba(124,165,178,.85) 0 7px, transparent 8px),
          radial-gradient(circle at 25% 50%, rgba(75,114,136,.85) 0 10px, transparent 11px),
          radial-gradient(circle at 46% 66%, rgba(151,177,180,.78) 0 8px, transparent 9px),
          radial-gradient(circle at 70% 54%, rgba(93,132,150,.84) 0 11px, transparent 12px),
          radial-gradient(circle at 91% 62%, rgba(138,168,176,.80) 0 7px, transparent 8px) !important;
        opacity:calc(.26 + var(--castle-damage) * .62) !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryDefenders{
        position:absolute !important;
        left:50% !important;
        bottom:30% !important;
        width:min(720px, 62%) !important;
        height:210px !important;
        transform:translateX(-50%) !important;
        z-index:2 !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryShield{
        position:absolute !important;
        left:50% !important;
        bottom:2% !important;
        width:92px !important;
        height:92px !important;
        border:3px solid rgba(34,255,136,.88) !important;
        border-radius:999px !important;
        transform:translateX(-50%) scale(.2) !important;
        opacity:0 !important;
        box-shadow:0 0 28px rgba(34,255,136,.48), 0 0 74px rgba(0,217,255,.24) inset !important;
        animation:flprStandaloneSiegeVictoryShield 1500ms ease-out 160ms forwards !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryBeam{
        position:absolute !important;
        bottom:34% !important;
        left:50% !important;
        width:46% !important;
        height:5px !important;
        border-radius:999px !important;
        background:linear-gradient(90deg, transparent, rgba(34,255,136,.95), rgba(255,224,122,.90), transparent) !important;
        box-shadow:0 0 18px rgba(34,255,136,.66) !important;
        transform-origin:0 50% !important;
        opacity:0 !important;
        animation:flprStandaloneSiegeVictoryBeam 960ms ease-out 300ms forwards !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryBeam.left{ transform:rotate(157deg) scaleX(.2); }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryBeam.right{ transform:rotate(23deg) scaleX(.2); }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryHelpers{
        position:absolute !important;
        inset:0 !important;
        z-index:5 !important;
        pointer-events:none !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryHelper{
        position:absolute !important;
        left:var(--helper-left, 50%) !important;
        bottom:var(--helper-bottom, 26%) !important;
        width:54px !important;
        height:70px !important;
        transform:translateX(-50%) scale(var(--helper-scale, 1)) !important;
        transform-origin:50% 100% !important;
        filter:drop-shadow(0 0 12px rgba(0,217,255,.28)) !important;
        animation:flprStandaloneSiegeVictoryHelperWork 820ms ease-in-out infinite !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryHelper.h1{
        --helper-left:26%;
        --helper-bottom:42%;
        --helper-scale:.92;
        --water-rot:-28deg;
        --water-x:18px;
        --water-y:-20px;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryHelper.h2{
        --helper-left:73%;
        --helper-bottom:51%;
        --helper-scale:.86;
        --water-rot:205deg;
        --water-x:-98px;
        --water-y:-16px;
        animation-delay:-360ms !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryHelperHead,
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryHelperBody,
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryHelperBucket,
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryHelperWater,
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryHelperSplash{
        position:absolute !important;
        pointer-events:none !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryHelperHead{
        left:21px !important;
        top:5px !important;
        width:15px !important;
        height:15px !important;
        border-radius:999px !important;
        background:linear-gradient(180deg, rgba(232,250,255,.98), rgba(83,183,255,.86)) !important;
        box-shadow:0 0 12px rgba(0,217,255,.44) !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryHelperBody{
        left:15px !important;
        top:22px !important;
        width:27px !important;
        height:33px !important;
        border:2px solid rgba(34,255,136,.72) !important;
        border-radius:10px 10px 7px 7px !important;
        background:linear-gradient(180deg, rgba(0,217,255,.72), rgba(7,28,44,.92)) !important;
        box-shadow:0 0 12px rgba(34,255,136,.28) inset !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryHelperBody::before,
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryHelperBody::after{
        content:"" !important;
        position:absolute !important;
        bottom:-12px !important;
        width:8px !important;
        height:16px !important;
        border-radius:999px !important;
        background:rgba(232,250,255,.82) !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryHelperBody::before{ left:3px !important; transform:rotate(8deg) !important; }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryHelperBody::after{ right:3px !important; transform:rotate(-8deg) !important; }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryHelperBucket{
        left:34px !important;
        top:24px !important;
        width:20px !important;
        height:17px !important;
        border:2px solid rgba(255,224,122,.92) !important;
        border-top:0 !important;
        border-radius:3px 3px 8px 8px !important;
        background:linear-gradient(180deg, rgba(255,224,122,.24), rgba(0,217,255,.30)) !important;
        transform:rotate(-18deg) !important;
        animation:flprStandaloneSiegeVictoryBucketTip 1180ms ease-in-out infinite !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryHelperWater{
        left:35px !important;
        top:27px !important;
        width:112px !important;
        height:9px !important;
        border-radius:999px !important;
        transform:translate(var(--water-x, 12px), var(--water-y, -14px)) rotate(var(--water-rot, -24deg)) !important;
        transform-origin:0 50% !important;
        background:
          repeating-linear-gradient(90deg, rgba(232,250,255,.95) 0 8px, rgba(0,217,255,.76) 8px 16px, rgba(232,250,255,.66) 16px 24px) !important;
        box-shadow:0 0 16px rgba(0,217,255,.64) !important;
        opacity:0 !important;
        animation:flprStandaloneSiegeVictoryWaterStream 1180ms ease-in-out infinite !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryHelperSplash{
        left:var(--splash-left, 116px) !important;
        top:var(--splash-top, 1px) !important;
        width:42px !important;
        height:42px !important;
        border-radius:999px !important;
        background:
          radial-gradient(circle at 50% 50%, rgba(232,250,255,.96) 0 4px, rgba(0,217,255,.46) 5px 13px, transparent 14px),
          radial-gradient(circle at 24% 30%, rgba(232,250,255,.80) 0 3px, transparent 4px),
          radial-gradient(circle at 78% 62%, rgba(232,250,255,.78) 0 3px, transparent 4px) !important;
        filter:drop-shadow(0 0 14px rgba(0,217,255,.52)) !important;
        opacity:0 !important;
        animation:flprStandaloneSiegeVictoryWaterSplash 1180ms ease-in-out infinite !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryHelper.h2 .flprStandaloneSiegeVictoryHelperBucket{
        left:0 !important;
        transform:rotate(18deg) !important;
        animation-name:flprStandaloneSiegeVictoryBucketTipReverse !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryHelper.h2 .flprStandaloneSiegeVictoryHelperWater{
        left:-78px !important;
        transform-origin:100% 50% !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryHelper.h2 .flprStandaloneSiegeVictoryHelperSplash{
        --splash-left:-112px;
        --splash-top:4px;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryArmy{
        position:absolute !important;
        left:50% !important;
        bottom:12% !important;
        z-index:2 !important;
        width:min(980px, 84%) !important;
        height:146px !important;
        transform:translateX(-50%) !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryTroop{
        position:absolute !important;
        left:var(--left, 50%) !important;
        bottom:var(--base, 0px) !important;
        font-size:var(--size, 28px) !important;
        line-height:1 !important;
        filter:drop-shadow(0 0 10px rgba(255,77,109,.48)) !important;
        opacity:0 !important;
        transform:translate3d(0,0,0) scale(1) !important;
        animation:flprStandaloneSiegeVictoryTroopRetreat 2050ms cubic-bezier(.2,.8,.18,1) var(--delay, 0ms) forwards !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryArmyLabel{
        position:absolute !important;
        left:50% !important;
        bottom:10% !important;
        z-index:3 !important;
        transform:translateX(-50%) !important;
        padding:9px 18px !important;
        border:1px solid rgba(255,77,109,.52) !important;
        border-radius:999px !important;
        color:rgba(255,224,122,.96) !important;
        background:rgba(24,7,18,.72) !important;
        box-shadow:0 0 20px rgba(255,77,109,.22) !important;
        font-size:15px !important;
        letter-spacing:0 !important;
        opacity:0 !important;
        animation:flprStandaloneSiegeVictoryArmyLabel 1800ms ease-out 260ms forwards !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryStatus{
        position:absolute !important;
        top:92px !important;
        left:50% !important;
        z-index:5 !important;
        transform:translateX(-50%) !important;
        padding:10px 18px !important;
        border:2px solid rgba(255,224,122,.62) !important;
        border-radius:999px !important;
        color:rgba(232,250,255,.94) !important;
        background:rgba(0,10,18,.76) !important;
        box-shadow:0 0 24px rgba(255,224,122,.16), 0 0 18px rgba(0,217,255,.16) inset !important;
        font-size:16px !important;
        text-align:center !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeTableReveal{
        position:absolute !important;
        left:50% !important;
        top:72px !important;
        z-index:6 !important;
        width:min(840px, 86%) !important;
        transform:translateX(-50%) !important;
        display:flex !important;
        flex-direction:column !important;
        align-items:center !important;
        gap:8px !important;
        text-align:center !important;
        pointer-events:none !important;
        text-transform:uppercase !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeTableRevealKicker{
        color:rgba(255,224,122,.84) !important;
        font-size:10px !important;
        line-height:1 !important;
        letter-spacing:0 !important;
        text-shadow:0 0 10px rgba(255,224,122,.34) !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeTableRevealName{
        display:flex !important;
        justify-content:center !important;
        align-items:center !important;
        flex-wrap:wrap !important;
        gap:0 4px !important;
        color:rgba(232,250,255,.98) !important;
        font-size:clamp(15px, 2.2vw, 28px) !important;
        line-height:1.22 !important;
        letter-spacing:0 !important;
        text-shadow:
          0 0 12px color-mix(in srgb, var(--siege-castle-accent, rgba(255,224,122,.96)) 62%, transparent),
          0 3px 0 rgba(0,0,0,.52) !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeTableRevealName span{
        opacity:0 !important;
        transform:translateY(9px) scale(.86) !important;
        filter:blur(5px) !important;
        animation:flprStandaloneSiegeTableNameRevealChar 120ms cubic-bezier(.18,.9,.18,1) calc(260ms + (var(--i, 0) * 38ms)) forwards !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryCard{
        position:absolute !important;
        left:50% !important;
        bottom:34px !important;
        z-index:6 !important;
        width:min(1040px, calc(100% - 48px)) !important;
        min-height:154px !important;
        padding:26px 36px 24px !important;
        border:3px solid rgba(255,224,122,.92) !important;
        border-radius:18px !important;
        background:
          radial-gradient(circle at 50% 0%, rgba(255,224,122,.20), transparent 40%),
          radial-gradient(circle at 16% 100%, rgba(0,255,213,.16), transparent 46%),
          linear-gradient(180deg, rgba(5,32,44,.92), rgba(2,9,18,.88)) !important;
        box-shadow:
          0 28px 84px rgba(0,0,0,.66),
          0 0 52px rgba(255,224,122,.24),
          0 0 90px rgba(0,217,255,.18),
          0 0 0 2px rgba(255,255,255,.08) inset !important;
        text-align:center !important;
        transform:translateX(-50%) translateY(18px) scale(.96) !important;
        animation:flprStandaloneSiegeVictoryCardIn 420ms cubic-bezier(.18,.9,.18,1) forwards !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryKicker{
        font-size:18px !important;
        line-height:1.25 !important;
        color:rgba(255,224,122,.98) !important;
        text-shadow:
          0 0 10px rgba(255,224,122,.82),
          0 0 22px rgba(255,77,109,.38) !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryTable{
        margin-top:16px !important;
        font-size:36px !important;
        line-height:1.18 !important;
        color:rgba(232,250,255,.98) !important;
        text-shadow:
          0 0 12px rgba(0,217,255,.62),
          0 0 26px rgba(0,217,255,.30) !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryEnemy{
        margin-top:14px !important;
        font-size:24px !important;
        line-height:1.26 !important;
        color:rgba(34,255,136,.98) !important;
        text-shadow:
          0 0 10px rgba(34,255,136,.70),
          0 0 24px rgba(0,217,255,.34) !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryFireworks{
        position:absolute !important;
        inset:0 !important;
        z-index:1 !important;
        pointer-events:none !important;
        overflow:hidden !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeFirework{
        position:absolute !important;
        width:0 !important;
        height:0 !important;
        left:50% !important;
        top:50% !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeFirework::before{
        content:"" !important;
        position:absolute !important;
        width:14px !important;
        height:14px !important;
        left:-7px !important;
        top:-7px !important;
        border:2px solid var(--fw-color, rgba(255,224,122,.95)) !important;
        border-radius:999px !important;
        box-shadow:0 0 24px var(--fw-color, rgba(255,224,122,.95)) !important;
        animation:flprStandaloneSiegeFireworkRing 760ms ease-out forwards !important;
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeSpark{
        position:absolute !important;
        left:-3px !important;
        top:-3px !important;
        width:6px !important;
        height:6px !important;
        border-radius:999px !important;
        background:var(--fw-color, rgba(255,224,122,.95)) !important;
        box-shadow:0 0 12px var(--fw-color, rgba(255,224,122,.95)) !important;
        transform:translate(0,0) scale(1) !important;
        animation:flprStandaloneSiegeSpark 860ms ease-out forwards !important;
      }
      @keyframes flprStandaloneSiegeVictoryIn{
        from{ opacity:0; }
        to{ opacity:1; }
      }
      @keyframes flprStandaloneSiegeVictoryOut{
        from{ opacity:1; }
        to{ opacity:0; }
      }
      @keyframes flprStandaloneSiegeVictoryCardIn{
        to{ transform:translateX(-50%) translateY(0) scale(1); }
      }
      @keyframes flprStandaloneSiegeTableNameRevealChar{
        0%{ opacity:0; transform:translateY(9px) scale(.86); filter:blur(5px); }
        100%{ opacity:1; transform:translateY(0) scale(1); filter:blur(0); }
      }
      @keyframes flprStandaloneSiegeVictorySpotlight{
        0%,100%{ transform:rotate(-18deg) scaleX(1); opacity:.26; }
        50%{ transform:rotate(18deg) scaleX(1.08); opacity:.54; }
      }
      @keyframes flprStandaloneSiegeFireworkRing{
        0%{ opacity:1; transform:scale(.25); }
        100%{ opacity:0; transform:scale(5.8); }
      }
      @keyframes flprStandaloneSiegeSpark{
        0%{ opacity:1; transform:translate(0,0) scale(1); }
        100%{ opacity:0; transform:translate(var(--dx), var(--dy)) scale(.18); }
      }
      @keyframes flprStandaloneSiegeVictoryCastleRecover{
        0%{ opacity:0; transform:translateX(-50%) translateY(72px) scale(.66) rotateX(12deg); filter:brightness(.52) saturate(.86) drop-shadow(0 30px 42px rgba(0,0,0,.78)); }
        28%{ opacity:1; transform:translateX(-50%) translateY(22px) scale(.88) rotateX(0deg); filter:brightness(.86) saturate(.96) drop-shadow(0 22px 34px rgba(0,0,0,.72)); }
        58%{ transform:translateX(-50%) translateY(2px) scale(1.035); filter:brightness(1.2) saturate(1.18) drop-shadow(0 0 38px rgba(34,255,136,.30)); }
        100%{ opacity:1; transform:translateX(-50%) translateY(0) scale(1); filter:brightness(1) saturate(1) drop-shadow(0 22px 34px rgba(0,0,0,.70)) drop-shadow(0 0 26px rgba(0,217,255,.20)); }
      }
      @keyframes flprStandaloneSiegeVictorySmoke{
        0%,100%{ transform:translateY(0) scale(.86); opacity:calc(.08 + var(--castle-damage) * .54); }
        50%{ transform:translateY(-28px) scale(1.18); opacity:calc(.10 + var(--castle-damage) * .68); }
      }
      @keyframes flprStandaloneSiegeVictoryFlame{
        from{ transform:scaleY(.80) rotate(-3deg); }
        to{ transform:scaleY(1.12) rotate(4deg); }
      }
      @keyframes flprStandaloneSiegeVictoryFlameDoused{
        0%,18%{ opacity:calc(var(--castle-damage) * .78); transform:scaleY(1.08) rotate(-3deg); filter:drop-shadow(0 0 16px rgba(255,88,43,.78)); }
        42%{ opacity:calc(var(--castle-damage) * .56); transform:scale(.82) rotate(3deg); filter:drop-shadow(0 0 18px rgba(0,217,255,.62)); }
        72%{ opacity:calc(var(--castle-damage) * .22); transform:scale(.46) translateY(10px); filter:drop-shadow(0 0 18px rgba(232,250,255,.50)); }
        100%{ opacity:0; transform:scale(.12) translateY(18px); filter:drop-shadow(0 0 4px rgba(0,217,255,.22)); }
      }
      @keyframes flprStandaloneSiegeVictoryHelperWork{
        0%,100%{ transform:translateX(-50%) translateY(0) scale(var(--helper-scale, 1)); }
        50%{ transform:translateX(-50%) translateY(-5px) scale(var(--helper-scale, 1)); }
      }
      @keyframes flprStandaloneSiegeVictoryBucketTip{
        0%,100%{ transform:rotate(-18deg); }
        42%,64%{ transform:rotate(-42deg); }
      }
      @keyframes flprStandaloneSiegeVictoryBucketTipReverse{
        0%,100%{ transform:rotate(18deg); }
        42%,64%{ transform:rotate(42deg); }
      }
      @keyframes flprStandaloneSiegeVictoryWaterStream{
        0%,18%,100%{ opacity:0; clip-path:inset(0 100% 0 0); }
        30%,72%{ opacity:.95; clip-path:inset(0 0 0 0); }
        84%{ opacity:.20; clip-path:inset(0 0 0 64%); }
      }
      @keyframes flprStandaloneSiegeVictoryWaterSplash{
        0%,24%,100%{ opacity:0; transform:scale(.38); }
        42%,66%{ opacity:.95; transform:scale(1); }
        82%{ opacity:.18; transform:scale(1.34); }
      }
      @keyframes flprStandaloneSiegeVictoryShield{
        0%{ opacity:0; transform:translateX(-50%) scale(.2); }
        22%{ opacity:.98; transform:translateX(-50%) scale(1.18); }
        100%{ opacity:.12; transform:translateX(-50%) scale(4.8); }
      }
      @keyframes flprStandaloneSiegeVictoryBeam{
        0%{ opacity:0; transform:rotate(var(--beam-rot, 23deg)) scaleX(.08); }
        22%{ opacity:1; }
        100%{ opacity:0; transform:rotate(var(--beam-rot, 23deg)) scaleX(1.2); }
      }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryBeam.left{ --beam-rot:157deg; }
      body.flprStandaloneOriginalClient .flprStandaloneSiegeVictoryBeam.right{ --beam-rot:23deg; }
      @keyframes flprStandaloneSiegeVictoryTroopRetreat{
        0%{ opacity:.95; transform:translate3d(0,0,0) scale(1); }
        18%{ opacity:1; transform:translate3d(calc(var(--retreat-x, 160px) * -.08), -18px, 0) scale(1.08); filter:drop-shadow(0 0 18px rgba(255,224,122,.48)); }
        100%{ opacity:0; transform:translate3d(var(--retreat-x, 160px), var(--retreat-y, 72px), 0) scale(.58) rotate(var(--retreat-rot, 10deg)); }
      }
      @keyframes flprStandaloneSiegeVictoryArmyLabel{
        0%,12%{ opacity:0; transform:translateX(-50%) translateY(8px); }
        28%,72%{ opacity:1; transform:translateX(-50%) translateY(0); }
        100%{ opacity:0; transform:translateX(-50%) translateY(18px); }
      }
      body.flprStandaloneOriginalClient .standaloneRendererDock{
        margin:10px 2px 0 !important;
        padding:10px !important;
        gap:8px !important;
        border-radius:14px !important;
        background:
          linear-gradient(180deg, rgba(5,18,32,.98), rgba(3,10,18,.98)),
          radial-gradient(circle at 0% 0%, rgba(255,224,122,.12), transparent 46%) !important;
        box-shadow:0 0 0 1px rgba(255,224,122,.16) inset !important;
      }
      body.flprStandaloneOriginalClient .standaloneRendererGrid{
        display:grid !important;
        grid-template-columns:repeat(2, minmax(0, 1fr)) !important;
        gap:calc(5px * var(--flprStandaloneControlFontScale)) !important;
      }
      body.flprStandaloneOriginalClient .standaloneRendererRow{
        display:grid !important;
        grid-template-columns:auto minmax(0, 1fr) !important;
        gap:calc(5px * var(--flprStandaloneControlFontScale)) !important;
        align-items:center !important;
        padding:calc(5px * var(--flprStandaloneControlFontScale)) !important;
        border:1px solid rgba(0,217,255,.18) !important;
        border-radius:10px !important;
        background:rgba(0,18,31,.42) !important;
      }
      body.flprStandaloneOriginalClient .standaloneRendererRow input[type="checkbox"]{
        width:calc(14px * var(--flprStandaloneControlFontScale)) !important;
        height:calc(14px * var(--flprStandaloneControlFontScale)) !important;
        min-height:0 !important;
        accent-color:rgba(0,255,213,.95) !important;
      }
      body.flprStandaloneOriginalClient .standaloneRendererRow select{
        width:100% !important;
      }
      body.flprStandaloneOriginalClient .standaloneRendererActions{
        display:grid !important;
        grid-template-columns:repeat(2, minmax(0, 1fr)) !important;
        gap:calc(5px * var(--flprStandaloneControlFontScale)) !important;
      }
      body.flprStandaloneOriginalClient .standaloneRendererStatus{
        min-height:calc(18px * var(--flprStandaloneControlFontScale)) !important;
        color:rgba(232,250,255,.72) !important;
        line-height:1.35 !important;
      }
      body.flprStandaloneOriginalClient .standaloneRendererStatus.restartRequired{
        color:rgba(255,224,122,.95) !important;
      }
      body.flprStandaloneOriginalClient .apConnLog *,
      body.flprStandaloneOriginalClient .standaloneLogStack *,
      body.flprStandaloneOriginalClient .standaloneArchipelagoSection *,
      body.flprStandaloneOriginalClient .standaloneConnectionModeShell *,
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
      body.flprStandaloneOriginalClient .standaloneLogoDock{
        flex:0 0 auto !important;
        gap:10px !important;
        margin:0 0 12px !important;
        padding:10px !important;
        border-radius:14px !important;
        background:
          linear-gradient(180deg, rgba(5,18,32,.98), rgba(3,10,18,.98)),
          radial-gradient(circle at 0% 0%, rgba(255,224,122,.12), transparent 46%) !important;
        box-shadow:0 0 0 1px rgba(255,224,122,.14) inset !important;
      }
      body.flprStandaloneOriginalClient .standaloneLogoCardTitle{
        display:flex !important;
        align-items:center !important;
        justify-content:space-between !important;
        gap:8px !important;
        margin-bottom:8px !important;
      }
      body.flprStandaloneOriginalClient .standaloneLogoCardTitle .cSectionTitle{
        margin:0 !important;
      }
      body.flprStandaloneOriginalClient .standaloneLogoCardTitle .mini{
        color:rgba(188,220,236,.72) !important;
        font-size:7px !important;
        line-height:1.2 !important;
      }
      body.flprStandaloneOriginalClient .standaloneLogoActions{
        display:grid !important;
        grid-template-columns:minmax(0, 1fr) auto !important;
        gap:8px !important;
        align-items:center !important;
      }
      body.flprStandaloneOriginalClient .standaloneLogoLockRow{
        display:flex !important;
        align-items:center !important;
        gap:10px !important;
        min-height:40px !important;
        padding:8px 10px !important;
        border:1px solid rgba(0,217,255,.22) !important;
        border-radius:12px !important;
        background:rgba(0,18,31,.42) !important;
        color:rgba(232,250,255,.92) !important;
        font-size:9px !important;
      }
      body.flprStandaloneOriginalClient .standaloneLogoDevPanel[hidden]{
        display:none !important;
      }
      body.flprStandaloneOriginalClient .standaloneLogoDevPanel{
        display:flex !important;
        flex-direction:column !important;
        gap:10px !important;
        margin-top:10px !important;
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
      body.flprStandaloneOriginalClient .checkTaskHoverCard{
        white-space:normal !important;
      }
      body.flprStandaloneOriginalClient .checkTaskHoverCard .standaloneStrategyGuideHeader{
        color:rgba(255,224,122,.98) !important;
        margin-bottom:calc(4px * var(--flprStandaloneControlFontScale)) !important;
        padding-bottom:calc(3px * var(--flprStandaloneControlFontScale)) !important;
        border-bottom:1px solid rgba(255,224,122,.38) !important;
        text-shadow:0 0 calc(8px * var(--flprStandaloneControlFontScale)) rgba(255,224,122,.28) !important;
      }
      body.flprStandaloneOriginalClient .checkTaskHoverCard .standaloneStrategyGuideBody{
        color:rgba(232,250,255,.98) !important;
        white-space:pre-line !important;
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
    let gutter = readRootPx("--gutter", 16);
    const viewportW = window.innerWidth || document.documentElement.clientWidth || 0;
    const viewportH = window.innerHeight || document.documentElement.clientHeight || 0;
    const isVerticalViewport = standaloneIsVerticalViewport();
    const setLayoutVar = (name, value)=>{
      root.style.setProperty(name, value);
      try{ document.body?.style?.setProperty(name, value, "important"); }catch(_){}
    };
    const clearBodyLayoutVars = ()=>{
      try{
        [
          "--captureW",
          "--captureH",
          "--controlsW",
          "--gutter",
          "--flprStandaloneControlsH",
          "--flprStandaloneViewportH",
          "--flprStandalonePortraitPadX",
          "--flprStandalonePortraitPadTop",
          "--flprStandalonePortraitPadBottom"
        ].forEach((name)=>document.body?.style?.removeProperty(name));
      }catch(_){}
    };
    if(isVerticalViewport){
      const electronViewport = window.__flprElectronViewportMode && typeof window.__flprElectronViewportMode === "object"
        ? window.__flprElectronViewportMode
        : null;
      const layoutW = Math.max(360, Math.round(Number(electronViewport?.width || 0) || viewportW || 1080));
      const layoutH = Math.max(640, Math.round(Number(electronViewport?.height || 0) || viewportH || 1920));
      const portraitPadX = clamp(Math.round(layoutW * 0.022), 14, 28);
      const portraitPadTop = clamp(Math.round(layoutH * 0.058), 74, 112);
      const portraitPadBottom = clamp(Math.round(layoutH * 0.01), 10, 22);
      const portraitGap = clamp(Math.round(layoutH * 0.007), 8, 14);
      const availableW = Math.max(300, Math.round(layoutW - (portraitPadX * 2)));
      const controlsW = Math.min(1110, availableW);
      const captureW = Math.min(910, controlsW);
      const availableH = Math.max(360, Math.round(layoutH - portraitPadTop - portraitPadBottom - portraitGap));
      const controlsMinH = layoutH < 900 ? 220 : (layoutH < 1500 ? 320 : 430);
      const controlsMaxH = layoutH < 1500 ? 450 : 540;
      let controlsH = clamp(Math.round(availableH * 0.31), controlsMinH, controlsMaxH);
      const minCaptureH = clamp(Math.round(availableH * 0.52), 300, 720);
      let captureH = Math.round(availableH - controlsH);
      if(captureH < minCaptureH){
        controlsH = Math.max(220, Math.round(availableH - minCaptureH));
        captureH = Math.round(availableH - controlsH);
      }
      captureH = Math.max(240, Math.min(1700, captureH));
      const headerH = 75;
      const bossH = layoutH < 1050 ? 140 : 170;
      const viewportReserve = layoutH < 1200 ? 32 : 48;
      setLayoutVar("--captureW", `${captureW}px`);
      setLayoutVar("--captureH", `${captureH}px`);
      setLayoutVar("--controlsW", `${controlsW}px`);
      setLayoutVar("--gutter", `${portraitGap}px`);
      setLayoutVar("--flprStandaloneControlsH", `${controlsH}px`);
      setLayoutVar("--flprStandaloneViewportH", `${Math.max(220, Math.round(captureH - headerH - bossH - viewportReserve))}px`);
      setLayoutVar("--flprStandalonePortraitPadX", `${portraitPadX}px`);
      setLayoutVar("--flprStandalonePortraitPadTop", `${portraitPadTop}px`);
      setLayoutVar("--flprStandalonePortraitPadBottom", `${portraitPadBottom}px`);
      root.style.removeProperty("--flprStandaloneBaseW");
      root.style.removeProperty("--flprStandaloneWindowScale");
      try{ standaloneRenderModeHud(); }catch(_){}
      return;
    }
    clearBodyLayoutVars();
    gutter = 16;
    root.style.setProperty("--gutter", "16px");
    root.style.removeProperty("--flprStandalonePortraitPadX");
    root.style.removeProperty("--flprStandalonePortraitPadTop");
    root.style.removeProperty("--flprStandalonePortraitPadBottom");
    const stagePadX = 32;
    const stagePadY = 32;
    const minCaptureW = 910;
    const maxCaptureW = 1180;
    const minControlsW = 1280;
    const minCaptureH = 1180;
    const minLayoutW = minCaptureW + minControlsW + gutter + stagePadX;
    const layoutW = Math.max(minLayoutW, Math.round(viewportW || minLayoutW));
    const contentW = Math.max(minCaptureW + minControlsW + gutter, layoutW - stagePadX);
    const extraW = Math.max(0, contentW - (minCaptureW + minControlsW + gutter));
    const captureW = Math.min(maxCaptureW, minCaptureW + Math.round(extraW * 0.38));
    const controlsW = Math.max(minControlsW, Math.round(contentW - captureW - gutter));
    const layoutH = Math.max(minCaptureH + stagePadY, Math.round(viewportH || (1450 + stagePadY)));
    const captureH = Math.max(minCaptureH, layoutH - stagePadY);
    root.style.setProperty("--captureW", `${captureW}px`);
    root.style.setProperty("--captureH", `${captureH}px`);
    root.style.setProperty("--controlsW", `${controlsW}px`);
    root.style.setProperty("--flprStandaloneControlsH", `${Math.max(900, Math.round(captureH - 84))}px`);
    try{
      const header = document.querySelector(".capture > .header");
      const bossDock = document.getElementById("bossDock");
      const headerH = Math.max(60, Math.round(Number(header?.getBoundingClientRect?.().height || 75)));
      const bossH = Math.max(130, Math.round(Number(bossDock?.getBoundingClientRect?.().height || 170)));
      const gapTotal = 12;
      const bottomPad = 8;
      const headerReserve = 28;
      const nextViewportH = Math.max(830, Math.round(captureH - headerH - bossH - gapTotal - bottomPad - headerReserve));
      root.style.setProperty("--flprStandaloneViewportH", `${nextViewportH}px`);
    }catch(_){
      root.style.setProperty("--flprStandaloneViewportH", `${Math.max(830, Math.round(captureH - 293))}px`);
    }
    root.style.removeProperty("--flprStandaloneBaseW");
    root.style.removeProperty("--flprStandaloneWindowScale");
    try{ standaloneRenderModeHud(); }catch(_){}
  }

  function activeControlTab(){
    const activePanel = document.querySelector(".controlsTabPanel.active")?.dataset?.ctrlPanel || "";
    if(activePanel === "singleplayer" || activePanel === "multiplayer" || activePanel === "house" || activePanel === "visuals" || activePanel === "achievements") return activePanel;
    return document.querySelector(".controlsTabBtn.active")?.dataset?.ctrlTab || "multiplayer";
  }

  function setControlTab(key){
    const raw = String(key || "").trim().toLowerCase();
    const wanted = raw === "singleplayer"
      ? "singleplayer"
      : (raw === "house" || raw === "visuals" || raw === "achievements" ? raw : "multiplayer");
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
    try{
      const body = document.querySelector(".controlsBody");
      if(body) body.classList.toggle("standaloneHouseTakeover", wanted === "house");
      document.body.classList.toggle("flprStandaloneHouseActive", wanted === "house");
    }catch(_){}
    try{ localStorage.setItem("flpr_controls_tab_v1", wanted); }catch(_){}
    try{ standaloneRenderMenuTabs(wanted); }catch(_){}
    try{ standaloneRenderModeSwitchHud(standaloneCurrentMenuMode()); }catch(_){}
  }
  try{ window.flprStandaloneSetControlTab = setControlTab; }catch(_){}

  function standaloneCurrentMenuMode(){
    const raw = String(standaloneProfileRuntime.selectedMode || "").trim().toLowerCase();
    return raw === "singleplayer" ? "singleplayer" : "archipelago";
  }

  function standaloneIsVerticalViewport(){
    try{
      if(window.__flprElectronViewportMode?.vertical) return true;
      return document.documentElement?.classList?.contains("flprStandaloneVerticalViewport")
        || document.body?.classList?.contains("flprStandaloneVerticalViewport");
    }catch(_){
      return false;
    }
  }

  function standalonePrimaryTabForMode(mode){
    return standaloneConnectionModeName(mode) === "singleplayer"
      ? { key:"singleplayer", label:"RUN" }
      : { key:"multiplayer", label:"CONNECT" };
  }

  function standaloneRenderMenuTabs(activeKey){
    const tabs = document.querySelector(".controlsBody .controlsTabs");
    if(!tabs) return;
    const mode = standaloneCurrentMenuMode();
    const primary = standalonePrimaryTabForMode(mode);
    const current = String(activeKey || activeControlTab() || primary.key);
    const wanted = current === "visuals" || current === "achievements" ? current : primary.key;
    const signature = `${mode}|${wanted}`;
    if(tabs.dataset.flprStandaloneModeTabs === signature && tabs.querySelector(`[data-ctrl-tab="${wanted}"]`)) return;
    tabs.dataset.flprStandaloneTabs = "1";
    tabs.dataset.flprStandaloneModeTabs = signature;
    tabs.innerHTML = `
      <button class="controlsTabBtn${wanted === primary.key ? " active" : ""}" data-ctrl-tab="${primary.key}" type="button">${primary.label}</button>
      <button class="controlsTabBtn${wanted === "visuals" ? " active" : ""}" data-ctrl-tab="visuals" type="button">VISUALS / MUSIC</button>
      <button class="controlsTabBtn${wanted === "achievements" ? " active" : ""}" data-ctrl-tab="achievements" type="button">ACHIEVEMENTS</button>
    `;
    if(tabs.__flprStandaloneModeTabsBound !== true){
      tabs.__flprStandaloneModeTabsBound = true;
      tabs.addEventListener("click", (event)=>{
        const btn = event.target.closest(".controlsTabBtn");
        if(!btn || !tabs.contains(btn)) return;
        playClick();
        const tab = btn.dataset.ctrlTab || primary.key;
        if(tab === "singleplayer") standaloneSetSelectedMode("singleplayer");
        else if(tab === "multiplayer") standaloneSetSelectedMode("archipelago");
        setControlTab(tab);
      }, true);
    }
  }

  function apCfg(){
    try{
      if(typeof loadApCfg === "function") return standaloneNormalizeApCfg(loadApCfg());
    }catch(_){}
    try{
      if(typeof ap !== "undefined" && ap?.cfg) return standaloneNormalizeApCfg(ap.cfg);
    }catch(_){}
    return standaloneNormalizeApCfg({ server:"", player:standaloneApDefaultPlayer(), game:STANDALONE_FLIPPERMIZER_GAME_NAME, pass:"" });
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

  function standaloneStrategyKey(value){
    return String(value || "")
      .toLowerCase()
      .replace(/[\u2012\u2013\u2014]/g, "-")
      .replace(/[^a-z0-9%+ ]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  const STANDALONE_PIXEL_TASK_GUIDES = Object.freeze({
    "super mario bros": Object.freeze({
      "spell s u p e r once": "Hit the S-U-P-E-R letter targets/lanes until all five letters are complete. Use controlled shots to the lit letters and let the table confirm the full SUPER spelling.",
      "light the key": "Build shell/key progress until the Key insert is lit. Focus the key/shell lane sequence, then verify the Key light is active before taking the check.",
      "start any bonus round": "Qualify a bonus round through the lit key/shell or castle feature path, then shoot the lit bonus-round start shot once it appears.",
      "shoot the castle once": "Aim for the castle entrance and land one clean castle hit. A single registered castle shot is enough for this objective.",
      "light 1 2 3 4 for multiball": "Complete the numbered 1-2-3-4 sequence to qualify multiball. Watch the inserts and keep shooting whichever number is currently unlit.",
      "start multiball": "Finish the numbered multiball qualifier, then shoot the lit multiball start/lock shot to put multiball into play.",
      "destroy 1 castle": "Keep shooting the castle entrance until the castle destruction sequence completes once. Count only a full castle clear, not a single castle hit.",
      "complete one bonus round": "Light and start a bonus round, then finish its required lit shots before the round ends. The objective clears when the bonus round completion is awarded.",
      "collect a castle jackpot": "Start castle or castle-related multiball, then shoot the lit castle jackpot shot while jackpot is active.",
      "complete video mode": "Qualify and start video mode, then play it through to a successful completion rather than only starting it.",
      "start 3 ball multiball": "Qualify the full multiball path and start it with three balls available. If only a smaller multiball starts, rebuild the lock/numbered progress.",
      "destroy 2 castles in one game": "Destroy the first castle, then rebuild castle progress and destroy a second one before the game ends.",
      "complete 2 bonus rounds in one game": "Complete one bonus round, then relight/start another and finish it before game over.",
      "collect three castle jackpots": "Start castle jackpot play and collect three lit jackpot awards total. If multiball ends early, requalify and continue in the same game.",
      "complete video mode for 30 000 000": "Qualify video mode and finish the high-value route worth 30,000,000. Do not count a partial or failed video mode."
    }),
    "street fighter ii": Object.freeze({
      "defeat 1 opponent": "Start an opponent battle and finish the required lit shots until one opponent is defeated.",
      "light a multiball start": "Advance lock/multiball qualification until the start shot is lit. Confirm the start insert before taking the check.",
      "collect a car crash award": "Shoot into the car-crash award path when it is lit and collect the award from the table.",
      "spell t o r p e d o once": "Hit TORPEDO letter shots until the full word is completed once.",
      "collect a 10 000 000+ hurry up or mode award": "Start a hurry-up or mode, then cash a lit award while its value is at least 10,000,000.",
      "start 2 ball multiball": "Qualify the two-ball multiball and shoot the lit start shot once it is ready.",
      "defeat 3 opponents": "Start and complete three separate opponent battles in the same game.",
      "spell torpedo completely": "Complete every TORPEDO letter in the sequence and let the table award the full completion.",
      "collect a multiball jackpot": "Start multiball, then shoot any lit jackpot shot before multiball ends.",
      "collect two mystery awards": "Light and collect two separate Mystery awards from the lit award shot.",
      "defeat 6 opponents": "Keep cycling opponent battles and defeat six total before game over.",
      "collect 3 multiball jackpots": "Start multiball and collect three lit jackpot shots total.",
      "start both multiballs in one game": "Qualify and start each available multiball type before the game ends.",
      "collect a super jackpot": "Build through regular jackpot progress until Super Jackpot lights, then shoot the flashing Super Jackpot shot.",
      "score 100 000 000+ in torpedo multiball": "Start TORPEDO Multiball and prioritize jackpot/super-jackpot shots until the mode total reaches 100,000,000."
    }),
    "q bert s quest": Object.freeze({
      "add 1 qube to the pyramid": "Build the pyramid by completing one Qube. A pyramid is made from six Qubes, so focus the lit pyramid/Qube rollover or target path until one cube is added and confirmed.",
      "complete one 2 target drop bank": "Pick either two-target drop bank and clear both targets in that bank. Stay controlled after the second drop because the rebounds can be rude on this layout.",
      "stop 1 villain": "Watch the active villain lamp, then use the stop-villain route before it reaches the pyramid. The figure-eight rollunder sequence is the key route: three rollunders in order erases the attacking villain.",
      "make a 3 rollunder loop sequence": "Shoot the figure-eight/rollunder path and complete three rollunders in sequence. This is the core loop route and also feeds villain control, so keep repeating the loop while it is lit.",
      "score the top rollover pyramid award": "Aim for the top rollover lanes when the pyramid award is available. Use nudging or lane-change timing if available to line up the lit rollover and collect the pyramid award.",
      "complete 1 pyramid": "Add all six Qubes to finish one full pyramid. Keep villains pushed back or stopped so they do not steal pyramid progress while you build.",
      "stop all 3 villains once": "Stop each villain type once. Cycle the active villain, use the figure-eight rollunder sequence to erase it, then repeat until all three villain lamps have been handled.",
      "add 3 qubes in one ball": "Stay on pyramid-building shots for one ball and add three Qubes before draining. Use villain-control shots only when a villain is threatening to remove progress.",
      "complete both drop banks": "Clear one two-target drop bank, regain control, then clear the other bank. Treat this as a precision target task instead of a scoring race.",
      "collect a 100 000+ end of ball bonus": "Build pyramid progress, stop villains, and collect drop-bank/loop progress before draining. Preserve the ball until the displayed end-of-ball bonus is at least 100,000.",
      "complete 2 pyramids": "Finish one six-Qube pyramid, then immediately rebuild the next pyramid. Prioritize safe Qube-building shots and keep villains from undoing the pyramid.",
      "complete 3 pyramids": "Complete three six-Qube pyramids in one game. This is a long-route objective: build Qubes first, use rollunder villain stops when threatened, and avoid risky drop-bank rebounds unless needed.",
      "light extra ball from villain lamps": "Light the villain lamps toward Extra Ball by stopping villains, especially through the three-rollunder figure-eight route. Once the villain lamp progress is complete, confirm Extra Ball is lit.",
      "collect a 200 000+ end of ball bonus": "Stack pyramid completion, villain stops, and controlled feature progress until the end-of-ball bonus reaches 200,000 or more. Do not drain early just after lighting progress.",
      "stop 5 villains in one game": "Keep cycling villain attacks and stop five total before game over. The repeatable route is to shoot the figure-eight rollunder sequence whenever a villain advances."
    }),
    "mr mrs pac man": Object.freeze({
      "collect 5 pac maze moves": "Collect five maze-move awards from lit lanes, saucers, or target progress.",
      "enter the pac maze": "Light Pac-Maze entry, then shoot the entry/start shot to enter the maze.",
      "complete one drop target bank": "Clear one full drop target bank and let it register as completed.",
      "collect a saucer award": "Shoot a lit saucer and take the award shown by the table.",
      "light one pac man grid row or column": "Advance grid inserts until any complete row or column is lit.",
      "complete 1 pac maze": "Enter Pac-Maze and finish the maze objective successfully.",
      "enter aggressive mode": "Build maze/grid progress until Aggressive mode is available, then start it.",
      "collect 10 pac maze moves": "Keep collecting maze-move awards until the total reaches ten.",
      "complete two target banks": "Clear two target banks in one game.",
      "score a completed maze end bonus": "Complete a Pac-Maze, then preserve the bonus through the ball drain so it is paid.",
      "complete 2 pac mazes": "Finish two Pac-Maze runs before game over.",
      "complete a pac maze in aggressive mode": "Enter Aggressive mode, then complete the Pac-Maze during that mode.",
      "collect 20 pac maze moves": "Collect twenty total maze-move awards in the same game.",
      "complete 3 target banks in one game": "Clear three target-bank completions before the game ends.",
      "score 250 000+ maze bonus": "Build maze bonus through completed Pac-Maze progress until the bonus is worth at least 250,000."
    }),
    "space invaders": Object.freeze({
      "light the right spinner": "Complete the spinner qualifier so the right spinner is lit for value.",
      "hit the captive ball 3 times": "Shoot the captive ball three times hard enough for each hit to register.",
      "complete the three top blue invaders": "Hit or roll through the top blue invader targets until all three are complete.",
      "knock down the right side drop target": "Hit the right-side drop target and confirm it drops/registers.",
      "collect a 50 000 right side drop award": "Build the right-side drop award to 50,000, then knock the drop target down to collect it.",
      "max the captive ball value": "Keep hitting the captive ball until its value reaches the maximum.",
      "complete all five blue invaders": "Complete the full five-invader blue target set.",
      "collect bonus through the right side gap": "Light the bonus collect, then send the ball through the right-side gap to collect it.",
      "reach 3x bonus multiplier": "Advance bonus multiplier through lanes/targets until 3X is lit.",
      "collect the clone chamber value": "Light or build Clone Chamber, then shoot the collect path while the value is active.",
      "collect bonus at 3x or better": "Raise bonus multiplier to at least 3X, light bonus collect, then collect it.",
      "collect a 50 000 clone chamber value": "Build Clone Chamber to 50,000 and collect it before it changes or times out.",
      "reach 5x bonus multiplier": "Continue advancing bonus multiplier until 5X is reached.",
      "light both return lane extra balls": "Advance return-lane awards until both extra-ball lights are active.",
      "score a 300 000+ bonus collect": "Build base bonus and multiplier, then collect the bonus when its value is at least 300,000."
    })
  });

  function standaloneSourceTableForTask(tableName, entry, node){
    return String(
      entry?.source_table ||
      entry?.sourceTable ||
      entry?.target_table ||
      entry?.targetTable ||
      entry?.table ||
      node?.source_table ||
      node?.sourceTable ||
      node?.target_table ||
      node?.targetTable ||
      node?.tableName ||
      node?.table ||
      tableName ||
      ""
    ).trim();
  }

  function standaloneStripGuidePrefix(value){
    return String(value || "")
      .replace(/^strategy\s+guide\s*:?\s*/i, "")
      .replace(/^how\s+to\s+achieve\s*:?\s*/i, "")
      .replace(/^guide\s*:?\s*/i, "")
      .replace(/^table\s+note\s*:?\s*/i, "")
      .replace(/^note\s*:?\s*/i, "")
      .replace(/^extra\s*:?\s*/i, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function standaloneStripStrategyGuideHeader(value){
    return String(value || "")
      .replace(/^strategy\s+guide\s*:?\s*/i, "")
      .trim();
  }

  function standaloneFormatStrategyGuideBody(value){
    let body = standaloneStripStrategyGuideHeader(value);
    if(!body) return "";
    body = body.replace(/^how\s+to\s+achieve\s*:?\s*/i, "GUIDE: ");
    body = body.replace(/^table\s+note\s*:?\s*/i, "NOTE: ");
    body = body.replace(/^extra\s*:?\s*/i, "NOTE: ");
    body = body.replace(/^guide\s*:?\s*/i, "GUIDE: ");
    body = body.replace(/^note\s*:?\s*/i, "NOTE: ");
    if(!/^(GUIDE|NOTE)\s*:/i.test(body)){
      body = `GUIDE: ${body}`;
    }
    return body.trim();
  }

  function standaloneIsGenericStrategyText(value, tableName){
    const text = standaloneStripGuidePrefix(value);
    if(!text) return true;
    if(/^generic ap summary\b/i.test(text)) return true;
    if(/^build score to at least [\d,]+\+?\s+before drain\.?\s+focus lit modes, jackpots, and bonus multipliers\.?$/i.test(text)) return true;
    if(/^reach at least [\d,]+\+?\s+points in a valid game on that table\.\s+(use safer repeatable shots|blend safe feeds|stack multipliers)/i.test(text)) return true;
    if(/these are table-specific .* objectives/i.test(text)) return true;
    if(/^complete the table'?s lock or numbered qualifier,?\s+then shoot the lit multiball start shot once it is ready\.?$/i.test(text)) return true;
    if(standaloneStrategyKey(tableName) === "party zone"){
      const key = standaloneStrategyKey(text);
      if(key === "light the dance contest mode and shoot the start shot to begin it") return true;
      if(key === "start way out of control and finish its required lit shots before the timer expires") return true;
    }
    if(/^use .* progress\.$/i.test(text) && text.length < 120) return true;
    if(tableName && new RegExp(`^use .+ ${String(tableName).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} objectives\\.?$`, "i").test(text)) return true;
    return false;
  }

  function standaloneFormatStrategyGuide(value){
    if(!standaloneStripGuidePrefix(value)) return "";
    const body = standaloneFormatStrategyGuideBody(value);
    if(!body) return "";
    return `Strategy Guide\n${body}`;
  }

  function standaloneStrategyTableKeys(tableName){
    const out = [];
    const push = (value)=>{
      const key = standaloneStrategyKey(value);
      if(key && !out.includes(key)) out.push(key);
    };
    const raw = String(tableName || "").trim();
    push(raw);
    try{ push(getRepoCanonicalTableName(raw)); }catch(_){}
    try{ push(achResolveTableName(raw, "")); }catch(_){}
    const compact = raw.toLowerCase().replace(/[^a-z0-9]+/g, "");
    if(compact === "qbertsquest" || compact === "qbertquest" || compact === "qbert" || compact === "qbertstable" || compact.includes("qbertsquest") || compact.includes("qbertquest")){
      push("Q*bert's Quest");
      push("Qberts Quest");
      push("Q Bert's Quest");
    }
    if(/\bq\s*bert\b/i.test(raw) || /q\W*bert/i.test(raw) || compact.includes("qbertsquest") || compact.includes("qbertquest")){
      push("Q*bert's Quest");
    }
    return out;
  }

  function standaloneExactStrategyGuide(tableName, taskName){
    const taskKey = standaloneStrategyKey(taskName);
    for(const tableKey of standaloneStrategyTableKeys(tableName)){
      const guide = STANDALONE_PIXEL_TASK_GUIDES[tableKey]?.[taskKey];
      if(guide) return guide;
    }
    return "";
  }

  function standaloneScoreTaskMatch(taskName){
    const raw = String(taskName || "").trim();
    if(!raw) return null;
    let match = raw.match(/^(easy|medium|hard)\s+score\s*\(([^)]+)\)\s*$/i);
    if(match){
      return {
        tier: String(match[1] || "").toLowerCase(),
        target: String(match[2] || "").trim().replace(/\+$/, "") + "+"
      };
    }
    match = raw.match(/(?:score(?: target)?(?: of)?|score)\s*\(?([\d,]+\+?)\)?/i);
    if(match){
      return {
        tier: "",
        target: String(match[1] || "").trim().replace(/\+$/, "") + "+"
      };
    }
    return null;
  }

  function standaloneHumanizeStrategyKey(key){
    const lowerWords = new Set(["a", "an", "and", "at", "for", "in", "of", "on", "or", "the", "to", "toward", "with"]);
    return String(key || "").trim().split(/\s+/).map((word, index)=>{
      const clean = String(word || "");
      if(!clean) return "";
      const lower = clean.toLowerCase();
      if(index > 0 && lowerWords.has(lower)) return lower;
      if(/^\d+[xkmb]?$/i.test(clean)) return clean.toUpperCase();
      if(["tv", "tnt", "ufo", "vuk", "karr", "kitt"].includes(lower)) return clean.toUpperCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    }).join(" ");
  }

  function standaloneCompactStrategyText(value, maxChars){
    const clean = String(value || "").replace(/\s+/g, " ").trim();
    const max = Math.max(80, Number(maxChars || 180) || 180);
    if(clean.length <= max) return clean;
    const cut = clean.slice(0, max + 1);
    const boundaries = [cut.lastIndexOf(". "), cut.lastIndexOf("; "), cut.lastIndexOf(", "), cut.lastIndexOf(" ")]
      .filter((index)=>index >= Math.floor(max * 0.55));
    const end = boundaries.length ? Math.max.apply(Math, boundaries) : max;
    const out = cut.slice(0, end).replace(/[;,:,.]\s*$/, "").trim();
    return out ? (/[.!?]$/.test(out) ? out : `${out}.`) : clean.slice(0, max).trim();
  }

  function standaloneScoreImportantSummary(label, guideText){
    const clean = String(guideText || "").replace(/\s+/g, " ").trim();
    if(!clean) return "";
    const body = clean.replace(/^([^.!?]{3,72})\s+-\s+/i, "");
    const sentences = body
      .split(/(?<=[.!?])\s+(?=[A-Z0-9("])/)
      .map((part)=>part.trim())
      .filter(Boolean);
    const parts = sentences.length ? sentences : [body];
    const ranked = parts.map((part, index)=>{
      const raw = `${label || ""} ${part || ""}`;
      let score = Math.max(0, 8 - index);
      if(/\b(2x|3x|double scoring|double|triple|playfield multiplier|multiplier|bonus x)\b/i.test(raw)) score += 34;
      if(/\b(multiball|lock|jackpot|super jackpot|mega jackpot|wizard|final|video)\b/i.test(raw)) score += 28;
      if(/\b(hurry[- ]?up|quick score|collect bonus|bonus collect|mode|mission|award)\b/i.test(raw)) score += 18;
      if(/\b(shoot|hit|complete|spell|light|lock|start|collect|qualif|cash|score)\b/i.test(raw)) score += 12;
      if(String(part || "").length > 170) score -= 8;
      return { part, index, score };
    }).sort((a, b)=>b.score - a.score || a.index - b.index);
    return standaloneCompactStrategyText(ranked[0]?.part || body, 86);
  }

  function standaloneScoreGuideBucket(label, guideText){
    const text = standaloneStrategyKey(`${label || ""} ${guideText || ""}`);
    if(/\b(2x|3x|double|triple|multiplier|playfield multiplier|bonus x)\b/.test(text)) return "multiplier";
    if(/\b(super jackpot|mega jackpot|wizard|final)\b/.test(text)) return "super";
    if(/\b(multiball|lock)\b/.test(text)) return "multiball";
    if(/\b(jackpot)\b/.test(text)) return "jackpot";
    if(/\b(hurry up|hurryup)\b/.test(text)) return "hurry";
    if(/\b(bonus|collect bonus|bonus collect|end of ball)\b/.test(text)) return "bonus";
    if(/\b(mode|mission|battle|race|song|tale|video)\b/.test(text)) return "mode";
    if(/\b(spinner|loop|ramp|orbit|scoop|saucer|castle)\b/.test(text)) return "shot";
    if(/\b(target|bank|drop)\b/.test(text)) return "target";
    return "other";
  }

  function standaloneScoreGuideValue(label, guideText, tier){
    const raw = `${label || ""} ${guideText || ""}`;
    if(!String(raw || "").trim()) return -999;
    let score = 0;
    if(/\b(no multiball|no jackpot|not a strong strategy|forgettable)\b/i.test(raw)) score -= 90;
    if(/\b(points?|score|worth|value|bonus)\b/i.test(raw)) score += 12;
    if(/\b(2x|3x|double scoring|double|triple|playfield multiplier|multiplier)\b/i.test(raw)) score += 52;
    if(/\b(super jackpot|mega jackpot|wizard|rule the universe|final match|final draw)\b/i.test(raw)) score += 48;
    if(/\b(multiball|lock)\b/i.test(raw)) score += 40;
    if(/\b(jackpot)\b/i.test(raw)) score += 38;
    if(/\b(hurry[- ]?up|quick score)\b/i.test(raw)) score += 30;
    if(/\b(collect bonus|bonus collect|bonus multiplier|end of ball bonus|bonus x)\b/i.test(raw)) score += 28;
    if(/\b(mode|mission|battle|race|song|tale|video|award)\b/i.test(raw)) score += 18;
    if(/\b(spinner|loop|ramp|orbit|scoop|saucer|target bank|drop target|castle)\b/i.test(raw)) score += 14;
    if(/\b(shoot|hit|complete|spell|light|lock|start|collect|qualif|cash|score)\b/i.test(raw)) score += 10;
    const key = String(tier || "").toLowerCase();
    if(key === "easy" && /\b(spinner|bonus|target|ramp|orbit|safe|repeatable)\b/i.test(raw)) score += 12;
    if(key === "medium" && /\b(mode|hurry|bonus|multiball|jackpot)\b/i.test(raw)) score += 12;
    if(key === "hard" && /\b(multiball|super jackpot|jackpot|2x|3x|wizard|final|video)\b/i.test(raw)) score += 14;
    return score;
  }

  function standalonePixelScoreStrategyGuide(tableName, taskName){
    const score = standaloneScoreTaskMatch(taskName);
    if(!score) return "";
    let tableGuides = null;
    for(const tableKey of standaloneStrategyTableKeys(tableName)){
      if(STANDALONE_PIXEL_TASK_GUIDES[tableKey]){
        tableGuides = STANDALONE_PIXEL_TASK_GUIDES[tableKey];
        break;
      }
    }
    if(!tableGuides) return "";
    const tableLabel = String(tableName || "this table").trim() || "this table";
    const base = `Score ${score.target} on ${tableLabel}.`;
    const candidates = Object.entries(tableGuides).map(([guideKey, guideText], index)=>{
      const label = standaloneHumanizeStrategyKey(guideKey);
      return {
        label,
        guideText: String(guideText || "").trim(),
        index,
        bucket: standaloneScoreGuideBucket(label, guideText),
        score: standaloneScoreGuideValue(label, guideText, score.tier)
      };
    }).filter((candidate)=>candidate.guideText && candidate.score >= 22)
      .sort((a, b)=>b.score - a.score || a.index - b.index);
    const maxRoutes = 2;
    const chosen = [];
    const usedBuckets = new Set();
    const usedSummaries = new Set();
    candidates.forEach((candidate)=>{
      if(chosen.length >= maxRoutes) return;
      const summary = standaloneScoreImportantSummary(candidate.label, candidate.guideText);
      const key = standaloneStrategyKey(summary);
      if(!summary || usedSummaries.has(key)) return;
      if(usedBuckets.has(candidate.bucket) && candidates.some((other)=>other.bucket !== candidate.bucket && other.score >= candidate.score - 16 && !usedBuckets.has(other.bucket))) return;
      chosen.push({ label: candidate.label, summary });
      usedBuckets.add(candidate.bucket);
      usedSummaries.add(key);
    });
    if(!chosen.length) return "";
    const routes = chosen.map((route)=>`${route.label}: ${route.summary}`).join(" ");
    return standaloneCompactStrategyText(`${base} Best scoring from the guide: ${routes}`, 340);
  }

  function standalonePatternStrategyGuide(tableName, taskName){
    const task = String(taskName || "").trim();
    const key = standaloneStrategyKey(task);
    if(!key) return "";
    const score = task.match(/(?:score(?: target)?(?: of)?|score)\s*\(?([\d,]+\+?)\)?/i);
    if(score) return `Build score to at least ${score[1]} before draining. Prioritize safe repeatable scoring, lit modes, jackpots, and bonus multiplier progress on ${tableName || "this table"}.`;
    const count = key.match(/\b(\d+)\b/);
    const countText = count ? count[1] : "";
    if(/\bcastle jackpots?\b/.test(key)) return `${countText ? `Collect ${countText} castle jackpots` : "Collect the castle jackpot"} by starting the castle jackpot mode or multiball, then shooting the lit castle jackpot shot while it is active.`;
    if(/\bdestroy\b.*\bcastles?\b/.test(key)) return `${countText ? `Destroy ${countText} castles` : "Destroy the castle"} by repeatedly shooting the castle entrance until each full castle-destruction sequence completes.`;
    if(/\bbonus rounds?\b/.test(key)) return `${countText ? `Complete ${countText} bonus rounds` : "Complete the bonus round"} by lighting and starting the bonus-round feature, then finishing its lit shots before the timer or mode ends.`;
    if(/\bvideo mode\b/.test(key)) return "Qualify and start Video Mode, then complete its full objective successfully. For score-specific video tasks, keep the mode alive until the required value is awarded.";
    if(/\bmultiball\b/.test(key) && /\bjackpot\b/.test(key)) return "Start the relevant multiball first, then shoot the flashing jackpot shot before multiball ends.";
    if(/\bmultiball\b/.test(key)) return "Complete the table's lock or numbered qualifier, then shoot the lit multiball start shot once it is ready.";
    if(/^spell\b/.test(key)) return "Hit the named letter lanes or targets until the whole word is complete, using lane changes where the table allows it.";
    if(/^light\b/.test(key)) return "Advance the named feature through its specific lanes, targets, or awards until its insert is visibly lit, then confirm the table has registered it.";
    if(/^start\b/.test(key)) return "Qualify the named feature first, then shoot the lit start shot once to begin it.";
    if(/^complete\b/.test(key)) return "Follow the table's lit shots for this objective until the table awards the full completion, not just the start.";
    if(/^collect\b/.test(key)) return "Light the named award, then shoot its collect shot while the award is active.";
    if(/^shoot\b/.test(key) || /^hit\b/.test(key)) return "Make the named shot cleanly enough for the switch or feature to register on the table.";
    if(/^reach\b/.test(key) || /^advance\b/.test(key)) return "Keep building the named feature one step at a time until the requested threshold is shown or awarded.";
    return "Complete the objective as written, using the lit inserts and table display to confirm each required step registers.";
  }

  function standaloneTaskStrategyGuide(tableName, taskName, entry, node){
    const targetTable = standaloneSourceTableForTask(tableName, entry, node);
    try{
      const repoTooltip = window.flprTaskRepositoryTooltipForTask?.(targetTable || tableName, taskName, entry, node);
      if(String(repoTooltip || "").trim()) return String(repoTooltip || "").trim();
    }catch(_){}
    const exact = standaloneExactStrategyGuide(targetTable, taskName) || standaloneExactStrategyGuide(tableName, taskName);
    if(exact) return exact;
    const pixelScore = standalonePixelScoreStrategyGuide(targetTable || tableName, taskName);
    if(pixelScore) return pixelScore;
    const sourceExplanation = String(entry?.strategy_guide || entry?.strategyGuide || entry?.standalone_source_explanation || entry?.explanation || "").trim();
    if(sourceExplanation && !standaloneIsGenericStrategyText(sourceExplanation, targetTable)){
      return sourceExplanation;
    }
    try{
      const getter = window.flprGetTaskExplanationMeta || window.FLPR_TASK_EXPLANATIONS?.resolveTaskExplanationMeta;
      if(typeof getter === "function"){
        const meta = getter(taskName, node || standaloneTaskTooltipNode(targetTable, taskName, entry));
        const text = String(meta?.text || "").trim();
        if(text && !standaloneIsGenericStrategyText(text, targetTable)){
          return text;
        }
      }
    }catch(_){}
    return standalonePatternStrategyGuide(targetTable || tableName, taskName);
  }

  function standaloneTaskExplanationFor(tableName, objective){
    const taskName = String(objective || "").trim();
    const targetTable = String(tableName || "").trim();
    if(!taskName) return "";
    const node = {
      tableName: targetTable,
      table: targetTable,
      target_table: targetTable,
      full: targetTable ? `${targetTable} - ${taskName}` : taskName,
      location: targetTable ? `${targetTable} - ${taskName}` : taskName
    };
    return standaloneFormatStrategyGuide(standaloneTaskStrategyGuide(targetTable, taskName, null, node));
  }

  function standaloneTaskTooltipNode(tableName, objective, entry){
    const taskName = String(objective || entry?.objective || entry?.display_name || entry?.title || "").trim();
    const targetTable = String(
      tableName ||
      entry?.source_table ||
      entry?.sourceTable ||
      entry?.target_table ||
      entry?.table ||
      ""
    ).trim();
    const locationName = String(
      entry?.source_location ||
      entry?.sourceLocation ||
      entry?.location ||
      (targetTable && taskName ? `${targetTable} - ${taskName}` : taskName)
    ).trim();
    const cleanEntry = entry && typeof entry === "object" ? standaloneSanitizeTaskEntry(entry) : null;
    return {
      id: Number(entry?.id || entry?.location_id || entry?.locationId || 0) || 0,
      full: locationName || (targetTable && taskName ? `${targetTable} - ${taskName}` : taskName),
      short: taskName,
      baseShort: taskName,
      location: locationName,
      locationName,
      tableName: targetTable,
      table: targetTable,
      target_table: targetTable,
      source_table: String(entry?.source_table || entry?.sourceTable || targetTable || "").trim(),
      source_location: locationName,
      taskShuffleEntry: cleanEntry,
      genericEntry: cleanEntry
    };
  }

  function standaloneResolveTaskTooltip(tableName, objective, entry){
    const taskName = String(objective || entry?.objective || entry?.display_name || entry?.title || "").trim();
    if(!taskName) return "";
    const node = standaloneTaskTooltipNode(tableName, taskName, entry);
    return standaloneFormatStrategyGuide(standaloneTaskStrategyGuide(tableName, taskName, entry, node));
  }

  function standaloneSanitizeTaskEntry(entry){
    if(!entry || typeof entry !== "object") return entry;
    const copy = { ...entry };
    const originalExplanation = String(copy.explanation || "").trim();
    if(originalExplanation && !copy.standalone_source_explanation){
      copy.standalone_source_explanation = originalExplanation;
    }
    delete copy.explanation;
    return copy;
  }

  function standaloneSanitizeByLocation(byLocation){
    if(!byLocation || typeof byLocation !== "object" || Array.isArray(byLocation)) return byLocation;
    const out = {};
    Object.entries(byLocation).forEach(([locationName, entry])=>{
      out[locationName] = standaloneSanitizeTaskEntry(entry);
    });
    return out;
  }

  function standaloneSanitizeTaskPayload(payload){
    if(!payload || typeof payload !== "object") return payload;
    const out = { ...payload };
    if(Array.isArray(payload.entries)){
      out.entries = payload.entries.map((entry)=>standaloneSanitizeTaskEntry(entry));
    }else if(payload.entries && typeof payload.entries === "object"){
      out.entries = {};
      Object.entries(payload.entries).forEach(([key, entry])=>{
        out.entries[key] = standaloneSanitizeTaskEntry(entry);
      });
    }
    if(payload.by_location && typeof payload.by_location === "object"){
      out.by_location = standaloneSanitizeByLocation(payload.by_location);
    }
    return out;
  }

  function standaloneSanitizeSlotTaskExplanations(slotData){
    if(!slotData || typeof slotData !== "object") return slotData;
    const out = { ...slotData };
    out.generic_checks = standaloneSanitizeTaskPayload(slotData.generic_checks);
    out.task_shuffle = standaloneSanitizeTaskPayload(slotData.task_shuffle);
    return out;
  }

  function standaloneNormalizeTaskLocationKey(value){
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[\u2012\u2013\u2014]/g, "-")
      .replace(/\s+/g, " ");
  }

  function standaloneTaskLookupTableKey(value){
    try{
      if(typeof canonicalTableMapKey === "function") return String(canonicalTableMapKey(value) || "").trim();
    }catch(_){}
    return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
  }

  function standaloneTaskEntryObjective(entry){
    return String(entry?.objective || entry?.display_name || entry?.displayName || entry?.title || entry?.task_name || "").trim();
  }

  function standaloneTaskEntrySlotKey(entry, locationName){
    const split = standaloneSplitLocationName(locationName || entry?.location || entry?.source_location || "");
    const tableName = String(entry?.target_table || entry?.targetTable || entry?.table || split.table || "").trim();
    const difficulty = String(entry?.difficulty || split.rest?.match?.(/^(easy|medium|hard)\s+/i)?.[1] || "").trim().toLowerCase();
    const kind = String(entry?.kind || entry?.task_type || entry?.taskType || entry?.type || (/\bscore\b/i.test(split.rest || "") ? "score" : "task")).trim().toLowerCase();
    const tableKey = standaloneTaskLookupTableKey(tableName);
    if(!tableKey || !difficulty || !kind) return "";
    return `${tableKey}|${difficulty}|${kind}`;
  }

  function standaloneRememberSlotTaskEntry(locationName, entry){
    if(!entry || typeof entry !== "object") return;
    const objective = standaloneTaskEntryObjective(entry);
    if(!objective || standaloneIsGenericSlotTaskName(objective)) return;
    const loc = String(locationName || entry.location || entry.source_location || entry.sourceLocation || "").trim();
    if(loc){
      standaloneSlotTaskPayload.byLocation.set(loc, entry);
      standaloneSlotTaskPayload.byLocationNormalized.set(standaloneNormalizeTaskLocationKey(loc), entry);
    }
    const slotKey = standaloneTaskEntrySlotKey(entry, loc);
    if(slotKey) standaloneSlotTaskPayload.bySlot.set(slotKey, entry);
  }

  function standaloneRememberSlotTaskPayload(slotData){
    standaloneSlotTaskPayload.byLocation.clear();
    standaloneSlotTaskPayload.byLocationNormalized.clear();
    standaloneSlotTaskPayload.bySlot.clear();
    const src = (slotData && typeof slotData === "object") ? slotData : {};
    [src.generic_checks, src.task_shuffle].forEach((payload)=>{
      if(!payload || typeof payload !== "object") return;
      const byLoc = payload.by_location || payload.byLocation || {};
      if(byLoc && typeof byLoc === "object" && !Array.isArray(byLoc)){
        Object.entries(byLoc).forEach(([locationName, entry])=>standaloneRememberSlotTaskEntry(locationName, entry));
      }
      const entries = Array.isArray(payload.entries)
        ? payload.entries
        : (payload.entries && typeof payload.entries === "object" ? Object.values(payload.entries) : []);
      entries.forEach((entry)=>standaloneRememberSlotTaskEntry(entry?.location || entry?.source_location || "", entry));
    });
  }

  function standaloneSlotTaskEntryForLocation(locationName){
    const raw = String(locationName || "").trim();
    if(!raw) return null;
    const exact = standaloneSlotTaskPayload.byLocation.get(raw)
      || standaloneSlotTaskPayload.byLocationNormalized.get(standaloneNormalizeTaskLocationKey(raw));
    if(exact) return exact;
    const slotKey = standaloneTaskEntrySlotKey({}, raw);
    return slotKey ? (standaloneSlotTaskPayload.bySlot.get(slotKey) || null) : null;
  }

  function standaloneScrubLiveGenericTaskExplanations(){
    try{
      ["genericChecks", "taskShuffle"].forEach((bucketName)=>{
        const bucket = ap?.[bucketName];
        if(!bucket || typeof bucket !== "object") return;
        if(Array.isArray(bucket.entries)){
          bucket.entries = bucket.entries.map((entry)=>standaloneSanitizeTaskEntry(entry));
        }
        ["byLocation", "byLocationNormalized", "bySlot"].forEach((mapName)=>{
          const map = bucket[mapName];
          if(!(map instanceof Map)) return;
          for(const [key, value] of map.entries()){
            map.set(key, standaloneSanitizeTaskEntry(value));
          }
        });
      });
      if(typeof applyGenericCheckPayloadToLocations === "function") applyGenericCheckPayloadToLocations();
    }catch(_){}
  }

  function installStandaloneTaskTooltipBridge(){
    try{
      window.flprStandaloneTaskTooltip = standaloneResolveTaskTooltip;
      window.flprStandaloneTaskTooltipForTest = standaloneResolveTaskTooltip;
      window.flprStandaloneTaskTooltipForNodeForTest = standaloneResolveTaskTooltipForNode;
      window.__flprStandaloneSanitizeSlotDataForTest = standaloneSanitizeSlotTaskExplanations;
    }catch(_){}
    let original = null;
    try{
      original = window.setGenericCheckPayload || (typeof setGenericCheckPayload === "function" ? setGenericCheckPayload : null);
    }catch(_){}
    if(!original || original.__flprStandaloneTaskTooltipBridge){
      try{ standaloneRememberSlotTaskPayload(ap?.slotData); }catch(_){}
      standaloneScrubLiveGenericTaskExplanations();
      return;
    }
    const bridged = function(slotData){
      standaloneRememberSlotTaskPayload(slotData);
      const sanitized = standaloneSanitizeSlotTaskExplanations(slotData);
      const result = original.call(this, sanitized);
      standaloneScrubLiveGenericTaskExplanations();
      return result;
    };
    bridged.__flprStandaloneTaskTooltipBridge = true;
    bridged.__flprStandaloneOriginalSetGenericCheckPayload = original;
    try{ window.setGenericCheckPayload = bridged; }catch(_){}
    try{ setGenericCheckPayload = bridged; }catch(_){}
    standaloneScrubLiveGenericTaskExplanations();
  }

  function standaloneTaskNameFromNode(node){
    try{
      if(typeof getTaskNameFromLocationNode === "function"){
        const resolved = String(getTaskNameFromLocationNode(node) || "").trim();
        if(resolved) return resolved;
      }
    }catch(_){}
    return String(
      node?.taskShuffleEntry?.objective ||
      node?.taskShuffleEntry?.display_name ||
      node?.taskShuffleEntry?.title ||
      node?.genericEntry?.objective ||
      node?.genericEntry?.display_name ||
      node?.genericEntry?.title ||
      node?.short ||
      node?.full ||
      ""
    ).trim();
  }

  function standaloneResolveTaskTooltipForNode(node){
    const taskName = standaloneTaskNameFromNode(node);
    if(!taskName) return "";
    const entry = node?.taskShuffleEntry || node?.genericEntry || null;
    const tableName = standaloneSourceTableForTask(node?.tableName || node?.table || "", entry, node);
    return standaloneFormatStrategyGuide(standaloneTaskStrategyGuide(tableName, taskName, entry, node));
  }

  function standaloneRenderStrategyTooltipCard(card, text){
    if(!card) return;
    const raw = String(text || "").trim();
    const body = standaloneStripStrategyGuideHeader(raw);
    card.innerHTML = "";
    const header = document.createElement("div");
    header.className = "standaloneStrategyGuideHeader";
    header.textContent = "Strategy Guide";
    const content = document.createElement("div");
    content.className = "standaloneStrategyGuideBody";
    content.textContent = body || raw;
    card.appendChild(header);
    card.appendChild(content);
  }

  const standaloneStrategyHoverRuntime = {
    pointerX: NaN,
    pointerY: NaN,
    pointerAt: 0,
    activeBtn: null,
    activeTip: "",
    hideTimer: 0,
    bound: false
  };

  function standaloneStrategyHoverTipForButton(btn, fallback){
    return String(btn?.__flprStandaloneStrategyTip || fallback || "").trim();
  }

  function standaloneStrategyHoverButtonAtPointer(){
    try{
      const x = Number(standaloneStrategyHoverRuntime.pointerX);
      const y = Number(standaloneStrategyHoverRuntime.pointerY);
      if(!Number.isFinite(x) || !Number.isFinite(y)) return null;
      if(Date.now() - Number(standaloneStrategyHoverRuntime.pointerAt || 0) > 5000) return null;
      return document.elementFromPoint(x, y)?.closest?.(".nodeBtn") || null;
    }catch(_){
      return null;
    }
  }

  function standaloneReanchorStrategyHover(reason){
    const tip = String(
      standaloneStrategyHoverRuntime.activeTip ||
      (typeof checkTaskHoverActiveText !== "undefined" ? checkTaskHoverActiveText : "") ||
      ""
    ).trim();
    if(!tip) return false;
    const btn = standaloneStrategyHoverButtonAtPointer();
    if(!btn || !document.body.contains(btn)) return false;
    const nextTip = standaloneStrategyHoverTipForButton(btn, tip);
    if(!nextTip) return false;
    standaloneShowCheckTaskHoverCard(btn, nextTip);
    try{ btn.__flprStandaloneStrategyHoverReanchored = String(reason || "reanchor"); }catch(_){}
    return true;
  }

  function standaloneScheduleStrategyHoverReanchor(reason){
    const run = ()=>{ try{ standaloneReanchorStrategyHover(reason); }catch(_){} };
    try{
      if(typeof requestAnimationFrame === "function") requestAnimationFrame(run);
    }catch(_){}
    try{ setTimeout(run, 0); }catch(_){}
    try{ setTimeout(run, 80); }catch(_){}
  }

  function standaloneScheduleStrategyHoverHide(btn, tip){
    try{
      if(standaloneStrategyHoverRuntime.hideTimer) clearTimeout(standaloneStrategyHoverRuntime.hideTimer);
    }catch(_){}
    standaloneStrategyHoverRuntime.hideTimer = setTimeout(()=>{
      standaloneStrategyHoverRuntime.hideTimer = 0;
      if(standaloneReanchorStrategyHover("delayed-hide")) return;
      try{
        if((typeof checkTaskHoverActiveBtn === "undefined" || checkTaskHoverActiveBtn === btn) && typeof hideCheckTaskHoverCard === "function"){
          hideCheckTaskHoverCard();
        }
      }catch(_){}
      if(standaloneStrategyHoverRuntime.activeBtn === btn){
        standaloneStrategyHoverRuntime.activeBtn = null;
        standaloneStrategyHoverRuntime.activeTip = "";
      }
    }, 180);
  }

  function standaloneEnsureStrategyHoverPointerBridge(){
    if(standaloneStrategyHoverRuntime.bound) return;
    standaloneStrategyHoverRuntime.bound = true;
    try{
      document.addEventListener("pointermove", (event)=>{
        standaloneStrategyHoverRuntime.pointerX = Number(event.clientX);
        standaloneStrategyHoverRuntime.pointerY = Number(event.clientY);
        standaloneStrategyHoverRuntime.pointerAt = Date.now();
        if(standaloneStrategyHoverRuntime.activeTip && !document.body.contains(standaloneStrategyHoverRuntime.activeBtn)){
          standaloneScheduleStrategyHoverReanchor("pointermove");
        }
      }, true);
    }catch(_){}
  }

  function standaloneShowCheckTaskHoverCard(btn, text){
    const tip = String(text || "").trim();
    if(!btn || !tip) return;
    try{ if(typeof clearCheckTaskHoverTimer === "function") clearCheckTaskHoverTimer(); }catch(_){}
    try{
      if(standaloneStrategyHoverRuntime.hideTimer) clearTimeout(standaloneStrategyHoverRuntime.hideTimer);
      standaloneStrategyHoverRuntime.hideTimer = 0;
      standaloneStrategyHoverRuntime.activeBtn = btn;
      standaloneStrategyHoverRuntime.activeTip = tip;
    }catch(_){}
    let card = null;
    try{ card = (typeof ensureCheckTaskHoverCard === "function") ? ensureCheckTaskHoverCard() : null; }catch(_){}
    if(!card) return;
    try{ checkTaskHoverActiveBtn = btn; }catch(_){}
    try{ checkTaskHoverActiveText = tip; }catch(_){}
    standaloneRenderStrategyTooltipCard(card, tip);
    card.classList.add("visible");
    try{ if(typeof positionCheckTaskHoverCard === "function") positionCheckTaskHoverCard(btn, card); }catch(_){}
  }

  function standaloneScheduleCheckTaskHoverCard(btn, text){
    const tip = String(text || "").trim();
    if(!btn || !tip) return;
    try{ if(typeof clearCheckTaskHoverTimer === "function") clearCheckTaskHoverTimer(); }catch(_){}
    try{ checkTaskHoverPendingBtn = btn; }catch(_){}
    try{ checkTaskHoverPendingText = tip; }catch(_){}
    try{
      checkTaskHoverShowTimer = setTimeout(()=>{
        try{ checkTaskHoverShowTimer = 0; }catch(_){}
        const pendingBtn = (()=>{ try{ return checkTaskHoverPendingBtn; }catch(_){ return btn; } })();
        const pendingTip = (()=>{ try{ return checkTaskHoverPendingText; }catch(_){ return tip; } })();
        try{ checkTaskHoverPendingBtn = null; }catch(_){}
        try{ checkTaskHoverPendingText = ""; }catch(_){}
        if(!pendingBtn || !pendingTip) return;
        if(!document.body.contains(pendingBtn)) return;
        standaloneShowCheckTaskHoverCard(pendingBtn, pendingTip);
      }, Math.max(80, Number((typeof CHECK_TASK_HOVER_DELAY_MS !== "undefined" ? CHECK_TASK_HOVER_DELAY_MS : 1000)) || 1000));
    }catch(_){}
  }

  function installStandaloneStrategyTooltipBridge(){
    standaloneEnsureStrategyHoverPointerBridge();
    try{
      window.flprStandaloneTaskTooltip = standaloneResolveTaskTooltip;
      window.flprStandaloneTaskTooltipForTest = standaloneResolveTaskTooltip;
      window.flprStandaloneTaskTooltipForNodeForTest = standaloneResolveTaskTooltipForNode;
      window.flprStandaloneReanchorStrategyHoverForTest = standaloneReanchorStrategyHover;
    }catch(_){}
    try{
      const originalGet = window.getTaskExplanationForNode || (typeof getTaskExplanationForNode === "function" ? getTaskExplanationForNode : null);
      if(originalGet && !originalGet.__flprStandaloneStrategyGuideBridge){
        const bridgedGet = function standaloneGetTaskExplanationForNodeBridge(node){
          const tip = standaloneResolveTaskTooltipForNode(node);
          if(tip) return tip;
          try{ return originalGet.apply(this, arguments); }catch(_){ return ""; }
        };
        bridgedGet.__flprStandaloneStrategyGuideBridge = true;
        bridgedGet.__flprStandaloneOriginalGetTaskExplanationForNode = originalGet;
        try{ window.getTaskExplanationForNode = bridgedGet; }catch(_){}
        try{ getTaskExplanationForNode = bridgedGet; }catch(_){}
      }
    }catch(_){}
    try{
      const originalBind = window.bindCheckTaskHover || (typeof bindCheckTaskHover === "function" ? bindCheckTaskHover : null);
      if(originalBind && !originalBind.__flprStandaloneStrategyGuideBridge){
        const bridgedBind = function standaloneBindCheckTaskHoverBridge(btn, text){
          const tip = standaloneFormatStrategyGuide(text);
          if(!btn || !tip) return;
          if(btn.__flprStandaloneStrategyHoverBound === tip) return;
          btn.__flprStandaloneStrategyHoverBound = tip;
          btn.__flprStandaloneStrategyTip = tip;
          const hoverShow = ()=>standaloneScheduleCheckTaskHoverCard(btn, tip);
          const focusShow = ()=>standaloneShowCheckTaskHoverCard(btn, tip);
          const hide = ()=>{
            try{ if(typeof clearCheckTaskHoverTimer === "function") clearCheckTaskHoverTimer(); }catch(_){}
            standaloneScheduleStrategyHoverHide(btn, tip);
          };
          btn.addEventListener("mouseenter", hoverShow);
          btn.addEventListener("pointermove", (event)=>{
            standaloneStrategyHoverRuntime.pointerX = Number(event.clientX);
            standaloneStrategyHoverRuntime.pointerY = Number(event.clientY);
            standaloneStrategyHoverRuntime.pointerAt = Date.now();
          }, true);
          btn.addEventListener("focus", focusShow);
          btn.addEventListener("mouseleave", hide);
          btn.addEventListener("blur", hide);
          btn.addEventListener("click", hide);
        };
        bridgedBind.__flprStandaloneStrategyGuideBridge = true;
        bridgedBind.__flprStandaloneOriginalBindCheckTaskHover = originalBind;
        try{ window.bindCheckTaskHover = bridgedBind; }catch(_){}
        try{ bindCheckTaskHover = bridgedBind; }catch(_){}
      }
    }catch(_){}
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

  function standaloneStreamTrapsEnabled(){
    return !!standaloneIsStreamEditionRuntime();
  }

  function standaloneRewardFor(tableIndex, taskIndex, tableName, tables){
    const next = tables.length ? String(tables[(tableIndex + 1) % tables.length]?.tableName || tableName || "").trim() : String(tableName || "").trim();
    if(standaloneStreamTrapsEnabled()){
      if(taskIndex === 5 && tableIndex % 4 === 0) return "Filter Mode Trap";
      if(taskIndex === 3 && tableIndex % 9 === 4) return "Filter Mode Trap";
    }
    if(taskIndex === 0) return `Progressive Ball - ${next}`;
    if(taskIndex === 1) return "Easy Junk Item";
    if(taskIndex === 2) return ([4, 12, 20].includes(tableIndex)) ? "Boss Key" : (([1, 9, 17].includes(tableIndex)) ? "Hint: Boss Key" : "Medium Junk Item");
    if(taskIndex === 3) return (tableIndex % 5 === 2) ? "Pinball Fragment" : "Easy Junk Item";
    if(taskIndex === 4) return (tableIndex % 7 === 3) ? "Boss Key" : `Progressive Ball - ${tableName}`;
    return (tableIndex % 6 === 0) ? "Medium Junk Item" : "Easy Junk Item";
  }

  function buildStandaloneSingleplayerSeedFixture(seedName){
    const activeSeedName = String(seedName || STANDALONE_SEED_NAME || "").trim() || STANDALONE_SEED_NAME;
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
      locationItemByLocId[locId] = { itemId, itemName, flags: standaloneIsTrapRewardName(itemName, 0) ? 4 : 0 };
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
      const damagePct = standaloneBossDamagePctForSpec("Boss Table", task, taskIndex, task.name);
      const itemName = task.name === "Boss Victory" ? "Victory" : `Boss Damage ${damagePct}%`;
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
        seed_name: activeSeedName,
        boss_keys_required: 3,
        boss_keys_total: 3,
        traps_enabled: standaloneStreamTrapsEnabled(),
        filter_mode_trap_enabled: standaloneStreamTrapsEnabled(),
        filler_traps: standaloneStreamTrapsEnabled() ? 16 : 0,
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

  async function loadStandaloneSingleplayerSeed(opts){
    opts = opts || {};
    const seedName = String(opts.seedName || standaloneNewSingleplayerSeedName()).trim() || STANDALONE_SEED_NAME;
    const fixture = buildStandaloneSingleplayerSeedFixture(seedName);
    try{ if(typeof apDisconnect === "function") apDisconnect({ manual:false }); }catch(_){}
    window.__manualDisconnect = true;
    ap.inherentSeedActive = true;
    ap.connected = true;
    ap.seedName = seedName;
    ap.cfg = { ...(ap.cfg || {}), player: ap.cfg?.player || standaloneApDefaultPlayer(), game: STANDALONE_FLIPPERMIZER_GAME_NAME };
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
    state.bossTableSeed = seedName;
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
    try{ if(typeof relicBeginRun === "function") relicBeginRun(seedName, "standalone-singleplayer"); }catch(_){}
    try{ if(typeof syncTableBannerCodeMapFromSlots === "function") syncTableBannerCodeMapFromSlots(state); if(typeof hydrateTableBannerSlotsFromCodeMap === "function") hydrateTableBannerSlotsFromCodeMap(state, { overwrite:true }); }catch(_){}
    try{ if(typeof saveState === "function") saveState(); }catch(_){}
    try{ if(typeof setApIndicator === "function") setApIndicator("green", "SINGLEPLAYER SEED"); }catch(_){}
    const hEl = document.getElementById("apConnectedHost");
    if(hEl) hEl.textContent = `SINGLEPLAYER; ${seedName}`;
    try{ if(typeof updateApConnectButtons === "function") updateApConnectButtons("connected"); }catch(_){}
    try{ if(typeof flprStatsStartRun === "function") flprStatsStartRun(seedName, "standalone-singleplayer"); }catch(_){}
    try{ if(typeof achBuildTableCatalogFromAp === "function") achBuildTableCatalogFromAp(); if(typeof achRecomputeProgress === "function") achRecomputeProgress(); if(typeof achSaveStore === "function") achSaveStore(); if(typeof renderAchievementsControlsPanel === "function") renderAchievementsControlsPanel(); }catch(_){}
    try{ if(typeof hintApplySpoilerText === "function") await hintApplySpoilerText(fixture.spoilerText, STANDALONE_SPOILER_SOURCE, { persist:true }); }catch(err){ try{ if(typeof hintLog === "function") hintLog(`Standalone spoiler load failed: ${err?.message || err}`); }catch(_){} }
    const startNames = (fixture.startingTables || []).map((table)=>table.tableName).join(", ");
    try{ if(typeof apLog === "function") apLog(`Standalone seed loaded; starts=${startNames || "none"}; locations=${Object.keys(fixture.locNameToId).length}; bundled task catalog=yes`); }catch(_){}
    try{ if(typeof renderAll === "function") renderAll(); if(typeof renderChecksWorldTabs === "function") renderChecksWorldTabs(); if(typeof renderChecks === "function") renderChecks(); if(typeof updateCountCheckUI === "function") updateCountCheckUI(); }catch(_){}
    try{ if(typeof showView === "function") showView("checks"); }catch(_){}
    if(!opts.fromSave){
      try{ if(typeof toast === "function") toast("good", "SINGLEPLAYER SEED", `Loaded bundled tasks and scores for ${Math.max(0, fixture.tables.length)} tables.`, 4200); }catch(_){}
    }
    standaloneUpsertCurrentSeedSave({ createdAt:Date.now(), reason:"seed-start" });
    standaloneMarkRandomizerReady("singleplayer");
    return true;
  }

  function standaloneSingleplayerPanelHtml(){
    return `
      <div class="standaloneSingleplayerLayout flprStandaloneSingleplayerLayout">
        <section class="standaloneControlSection standaloneSingleplayerSection" data-accent="green">
          <div class="standaloneSectionTitle">SINGLEPLAYER <span class="mini">local seed</span></div>
          <div class="cRow connectActionRow">
            <button class="cBtn" id="standaloneStartSeedBtn" type="button">START SINGLEPLAYER SEED</button>
            <button class="cBtn gray" id="standaloneQuickStartBtn" type="button">QUICK START</button>
            <button class="cBtn gray" id="standaloneGuideBtn" type="button">GUIDE</button>
            <button class="cBtn gray" id="standaloneTableListBtn" type="button">TABLE LIST</button>
            <button class="cBtn danger" id="standaloneResetSeedBtn" type="button">RESET LOCAL RUN</button>
          </div>
          <div class="apHint">Start or continue a local Home Edition seed. Use Quick Start for rules, Ball 1 expectations, worlds, checks, sieges, and table requirements.</div>
        </section>

        <section class="standaloneControlSection standaloneSingleplayerToolsSection" data-accent="blue">
          <div class="standaloneSectionTitle">LOCAL RUN TOOLS <span class="mini">profile goals</span></div>
          <button class="standaloneNextAchievementCard" id="standaloneNextAchievementBtn" type="button" disabled>
            <div class="standaloneNextAchievementEyebrow">NEXT CLOSEST ACHIEVEMENT</div>
            <div class="standaloneNextAchievementTitle">Load a profile goal</div>
            <div class="standaloneNextAchievementDesc">Start or continue a seed to compare current progress against the achievement list.</div>
          </button>
        </section>

        <div class="standaloneSingleplayerSaveStack">
          <section class="standaloneControlSection grow" data-accent="gold">
            <div class="standaloneSectionTitle">SAVE FILES <span class="mini">profile progress</span></div>
            <div class="standaloneSeedSavePanel" id="standaloneSeedSavePanel">
              <div class="standaloneSeedSaveTitle"><span>LOCAL SEEDS</span><span id="standaloneSeedSaveCount">0 saves</span></div>
              <div class="standaloneSeedSaveList" id="standaloneSeedSaveList"></div>
            </div>
          </section>
        </div>

        <div class="standaloneSingleplayerInfoStack">
          <section class="standaloneControlSection grow" data-accent="green">
            <div class="standaloneSectionTitle">RUN BRIEFING <span class="mini">local state</span></div>
            <div class="standaloneSingleplayerIdeaGrid">
              <div class="standaloneSingleplayerIdea"><strong>SEED</strong><span id="standaloneRunSeedSummary">No seed loaded</span></div>
              <div class="standaloneSingleplayerIdea"><strong>CHECKS</strong><span id="standaloneRunCheckSummary">0 / 0</span></div>
              <div class="standaloneSingleplayerIdea"><strong>BOSS KEYS</strong><span id="standaloneRunBossKeySummary">Searching</span></div>
              <div class="standaloneSingleplayerIdea"><strong>RESOURCES</strong><span id="standaloneRunResourceSummary">Fragments 0 | EB 0</span></div>
            </div>
          </section>
        </div>
      </div>
    `;
  }

  function connectPanelHtml(cfg){
    return `
      <div class="connectCompactLayout flprStandaloneConnectLayout">
        <section class="standaloneControlSection standaloneArchipelagoSection" data-accent="gold">
          <div class="standaloneSectionTitle">ARCHIPELAGO CONNECTIONS <span class="mini">multiworld</span></div>
          <div class="apSettingsGrid">
            <div>
              <div class="cLabel">SERVER</div>
              <input class="cInput" id="apServer" autocomplete="off" placeholder="archipelago.gg:38281" value="${escapeAttr(cfg.server || "")}">
            </div>
            <div>
              <div class="cLabel">PLAYER</div>
              <input class="cInput" id="apPlayer" autocomplete="off" placeholder="Slot name" value="${escapeAttr(cfg.player || standaloneApDefaultPlayer())}">
            </div>
            <div>
              <div class="cLabel">GAME</div>
              <input class="cInput" id="apGame" autocomplete="off" placeholder="FlippermizerWorldsofPinball" value="${escapeAttr(cfg.game || STANDALONE_FLIPPERMIZER_GAME_NAME)}">
            </div>
            <div>
              <div class="cLabel">PASSWORD</div>
              <input class="cInput" id="apPass" type="password" autocomplete="off" placeholder="Optional" value="${escapeAttr(cfg.pass || "")}">
            </div>
          </div>
          <div class="standaloneArchipelagoFooter">
            <div class="apHint" id="apConnectedHost">CONNECTED; -</div>
            <div class="standaloneArchipelagoButtons">
              <button class="cBtn" id="apConnectBtn" type="button">CONNECT</button>
              <button class="cBtn danger" id="apDisconnectBtn" type="button">DISCONNECT</button>
              <button class="cBtn gray" id="standaloneGuideMpBtn" type="button">GUIDE</button>
            </div>
            <button class="cBtn standaloneSaveApCfgBtn" id="saveApCfgBtn" type="button">SAVE AP CFG</button>
          </div>
        </section>

        <div class="connectCol connectColLeft standaloneSecondaryStack">
          <section class="standaloneControlSection grow" data-accent="gold">
            <div class="standaloneSectionTitle" id="receivedHdr">
              <span class="standaloneSectionTitleText">ITEM LOG</span>
              <button class="standalonePanelSoundBtn" id="standaloneItemLogSoundBtn" type="button" title="Toggle item log arrival sound" aria-label="Toggle item log arrival sound">&#128266;&#65038;</button>
            </div>
            <div class="cRow">
              <button class="cBtn" id="apSyncReceivedBtn" type="button" onclick="return window.flprStandaloneSyncReceived ? window.flprStandaloneSyncReceived(event) : false;">SYNC RECEIVED</button>
              <button class="cBtn danger" id="apClearReceivedBtn" type="button">CLEAR LIST</button>
            </div>
            <div class="standaloneItemTabs" id="standaloneItemTabs">
              <button class="standaloneItemTab active" type="button" data-standalone-item-tab="received">RECEIVED</button>
              <button class="standaloneItemTab" type="button" data-standalone-item-tab="sent">SENT</button>
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
                  <button class="apLogTab active" type="button" data-aplog-tab="status" onclick="return window.flprStandaloneTextClientSetTab ? window.flprStandaloneTextClientSetTab('status', event) : false;">STATUS</button>
                  <button class="apLogTab" type="button" data-aplog-tab="hints" onclick="return window.flprStandaloneTextClientSetTab ? window.flprStandaloneTextClientSetTab('hints', event) : false;">HINTS</button>
                  <button class="apLogTab" type="button" data-aplog-tab="errors" onclick="return window.flprStandaloneTextClientSetTab ? window.flprStandaloneTextClientSetTab('errors', event) : false;">ERRORS</button>
                </div>
                <button class="standalonePanelSoundBtn" id="standaloneApLogClickSoundBtn" type="button" title="Toggle AP log click sound" aria-label="Toggle AP log click sound">&#128266;&#65038;</button>
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

  function standaloneEscapeHtml(value){
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function standaloneQuickStartTables(){
    try{
      const repo = window.FLPR_TABLE_REPO;
      const tables = Array.isArray(repo?.tables) ? repo.tables : [];
      return tables
        .filter((table)=>String(table?.code || "") !== "BOSS_TABLE")
        .map((table)=>{
          const code = String(table?.code || "").trim();
          const meta = (repo && typeof repo.getTableMeta === "function") ? repo.getTableMeta(code) : null;
          const name = String(meta?.displayName || table?.displayName || table?.name || code).trim();
          const searchName = String(meta?.name || table?.name || name).replace(/\s*\([^)]*\)\s*$/g, "").trim() || name;
          const manufacturer = String(meta?.manufacturer || table?.manufacturer || "").trim();
          const year = Number.isFinite(Number(meta?.year ?? table?.year)) ? String(Number(meta?.year ?? table?.year)) : "";
          return { code, name, searchName, manufacturer, year };
        })
        .sort((a, b)=>a.name.localeCompare(b.name));
    }catch(_){}
    return [];
  }

  function standaloneVpsTableSearchUrl(row){
    const query = String(row?.searchName || row?.name || "").trim();
    return `https://virtualpinballspreadsheet.github.io/games?search=${encodeURIComponent(query)}`;
  }

  function standaloneQuickStartTableListMarkup(){
    const rows = standaloneQuickStartTables();
    if(!rows.length){
      return `<div class="flprQuickStartPanel wide"><strong>TABLE LIST</strong><span>Table catalog is still loading. Open this again after the overlay finishes booting.</span></div>`;
    }
    return `
      <div class="flprQuickStartPanel wide">
        <strong>EXPECTED TABLE LIST (${rows.length})</strong>
        <p>Each row opens a Virtual Pinball Spreadsheet search for that table. Use the spreadsheet to find current VPX releases, backglass/ROM notes, and update history.</p>
        <div class="flprQuickStartTableList">
          ${rows.map((row)=>`
            <a class="flprQuickStartTableRow" href="${standaloneEscapeHtml(standaloneVpsTableSearchUrl(row))}" target="_blank" rel="noopener noreferrer">
              <span class="name">${standaloneEscapeHtml(row.name)}</span>
              <span class="meta">${standaloneEscapeHtml([row.manufacturer, row.year].filter(Boolean).join(" "))}</span>
            </a>
          `).join("")}
        </div>
      </div>
    `;
  }

  function standaloneQuickGuideMode(){
    try{
      const overlay = document.getElementById("flprQuickStartOverlay");
      const mode = String(overlay?.dataset?.quickGuideMode || "").trim().toLowerCase();
      if(mode === "mp" || mode === "sp") return mode;
    }catch(_){}
    try{ return standaloneCurrentMenuMode() === "archipelago" ? "mp" : "sp"; }catch(_){}
    return "sp";
  }

  function standaloneQuickGuideItem(tag, title, body){
    return `
      <div class="flprQuickGuideItem">
        <div class="tag">${standaloneEscapeHtml(tag)}</div>
        <strong>${standaloneEscapeHtml(title)}</strong>
        <span>${standaloneEscapeHtml(body)}</span>
      </div>
    `;
  }

  function standaloneQuickGuideMarkup(){
    const mode = standaloneQuickGuideMode();
    const items = mode === "mp"
      ? [
          ["CONNECT", "AP Server Fields", "Server, player, game, and password identify the Archipelago room and the Flippermizer slot you are joining."],
          ["CONNECT", "Connect / Disconnect", "Connect starts the AP client. Disconnect closes the socket and preserves the current local view until you reconnect."],
          ["ITEM LOG", "Received And Sent", "Received is the authoritative item inventory from AP. Sent records what your completed checks gave other players."],
          ["SYNC", "Sync Received", "Requests a fresh ReceivedItems snapshot from the server and rebuilds the world state from that inventory."],
          ["SYNC", "Clear List", "Clears the local item log, then syncs again from AP. Starting tables are restored from the connected seed data."],
          ["LOG", "AP Connection Log", "Status, hint, and error tabs show useful AP traffic without letting chat noise take over the play view."],
          ["CHECKS", "Checks Page", "Redeem completed goals here. Score checks can be entered manually and rewards should return you to this page."],
          ["HINTS", "Mystery Hints", "AP location data powers focused hint records and boss-key route signals when the server has the information."],
          ["STATE", "World State", "Tables, balls, boss keys, and boss access are rebuilt from AP slot data plus authoritative ReceivedItems."],
        ]
      : [
          ["PROFILE", "Profile Picker", "Choose or create the local Home Edition profile that owns saves, achievements, and run history."],
          ["SEED", "Start Singleplayer Seed", "Starts or resumes the local seed and opens the randomizer route for the selected profile."],
          ["TOOLS", "Quick Start / Table List", "Quick Start explains rules. Table List shows the current catalog with Virtual Pinball Spreadsheet links."],
          ["CHECKS", "Checks Page", "Use this as your main play loop: pick a table, complete the goal, enter scores, and redeem checks."],
          ["BALLS", "Ball Buttons", "The numbered ball buttons show which balls are legal for the current table. Default expectation is Ball 1."],
          ["MAP", "Overview", "The overview summarizes worlds, unlocked tables, boss keys, item counters, and current route pressure."],
          ["RELICS", "Relics", "Relics are run modifiers and guidance tools. Equip or inspect them from the Relics button when available."],
          ["EVENT", "Sieges", "Sieges are surprise defense events. They can now be disabled in generated Home Edition YAML options."],
          ["SCORE", "Manual Score Entry", "Enter a score on the active Checks card and matching score thresholds will redeem in order."],
        ];
    return `
      <div class="flprQuickStartPanel wide">
        <strong>UI GUIDE</strong>
        <p>Use the Singleplayer / Multiplayer buttons in the top-right of this window to switch which UI responsibilities are explained here.</p>
        <div class="flprQuickGuideGrid">
          ${items.map((item)=>standaloneQuickGuideItem(item[0], item[1], item[2])).join("")}
        </div>
      </div>
    `;
  }

  function standaloneSyncQuickStartModeButtons(overlay){
    const root = overlay || document.getElementById("flprQuickStartOverlay");
    if(!root) return;
    const mode = standaloneQuickGuideMode();
    root.querySelectorAll("[data-quick-guide-mode]").forEach((btn)=>{
      btn.classList.toggle("active", String(btn.dataset.quickGuideMode || "") === mode);
    });
  }

  function standaloneBindQuickStartControls(overlay){
    if(!overlay) return;
    overlay.querySelectorAll("[data-quick-start-tab]").forEach((btn)=>{
      if(btn.__flprQuickStartBound) return;
      btn.__flprQuickStartBound = true;
      btn.addEventListener("click", (event)=>{
        event.preventDefault();
        event.stopPropagation();
        playClick();
        standaloneSetQuickStartTab(btn.dataset.quickStartTab || "start");
      }, true);
    });
    overlay.querySelectorAll("[data-quick-guide-mode]").forEach((btn)=>{
      if(btn.__flprQuickGuideModeBound) return;
      btn.__flprQuickGuideModeBound = true;
      btn.addEventListener("click", (event)=>{
        event.preventDefault();
        event.stopPropagation();
        playClick();
        overlay.dataset.quickGuideMode = String(btn.dataset.quickGuideMode || "sp");
        standaloneSetQuickStartTab("guide");
      }, true);
    });
    overlay.querySelectorAll("[data-quick-start-close]").forEach((btn)=>{
      if(btn.__flprQuickCloseBound) return;
      btn.__flprQuickCloseBound = true;
      btn.addEventListener("click", (event)=>{
        event.preventDefault();
        event.stopPropagation();
        standaloneCloseQuickStart({ markSeen:true });
      }, true);
    });
    const tableBtn = overlay.querySelector("#flprQuickStartTablesBtn");
    if(tableBtn && !tableBtn.__flprQuickTablesBound){
      tableBtn.__flprQuickTablesBound = true;
      tableBtn.addEventListener("click", (event)=>{
        event.preventDefault();
        event.stopPropagation();
        playClick();
        standaloneSetQuickStartTab("tables");
      }, true);
    }
    standaloneSyncQuickStartModeButtons(overlay);
  }

  function standaloneQuickStartTabMarkup(tab){
    const key = String(tab || "start").trim().toLowerCase();
    if(key === "guide") return standaloneQuickGuideMarkup();
    if(key === "worlds"){
      return `
        <div class="flprQuickStartGrid">
          <div class="flprQuickStartPanel wide"><strong>SAMPLE WORLDS AND PROGRESSION</strong><span>These are sample worlds used to teach the structure: a world is a five-table route, World 1 starts open, Progression Ball items open more balls or new tables, and Boss Keys move you toward the boss path.</span></div>
          <div class="flprQuickStartPanel"><strong>SAMPLE WORLD 1; RAMPS RUMPUS</strong><span>Ramp-friendly early route. Learn how checks, score targets, and table unlocks behave here.</span></div>
          <div class="flprQuickStartPanel"><strong>SAMPLE WORLD 2; MALT DESNIY WORLD</strong><span>A curated route with stronger table identity and more varied mechanical asks.</span></div>
          <div class="flprQuickStartPanel"><strong>SAMPLE WORLD 3; VINTAGE TELEVISION</strong><span>TV and pop-culture tables. Expect more table-specific objectives once opened.</span></div>
          <div class="flprQuickStartPanel"><strong>SAMPLE WORLD 4; SPINNER SPARRING</strong><span>Early solid-state and spinner-heavy pressure. Siege targets are scaled down here.</span></div>
          <div class="flprQuickStartPanel"><strong>SAMPLE WORLD 5; FEATURED DESIGNER</strong><span>A designer-focused set. The route teaches the design language through goals.</span></div>
          <div class="flprQuickStartPanel"><strong>BOSS WORLD</strong><span>Boss access is gated by Boss Keys. Once opened, boss checks and the final objective are separated from regular table progression.</span></div>
        </div>
      `;
    }
    if(key === "checks"){
      return `
        <div class="flprQuickStartGrid">
          <div class="flprQuickStartPanel"><strong>CHECKS</strong><span>Checks are goals. When you complete one in VPX, mark it in Flippermizer. Score checks can also be redeemed from the SCORE entry field when your entered score meets thresholds.</span></div>
          <div class="flprQuickStartPanel"><strong>BALL 1 RULE</strong><span>Unless the app has unlocked another ball for that table, play from Ball 1 only. Restart the VPX table/run when needed so the attempt stays legitimate.</span></div>
          <div class="flprQuickStartPanel"><strong>AFTER A CHECK</strong><span>The reward animation may briefly show the Overview, then Home Edition returns you to Checks so you can keep working the same route.</span></div>
          <div class="flprQuickStartPanel"><strong>MANUAL VS AUTO</strong><span>Home Edition is mostly manual: you choose the VPX table, play the objective, enter scores when useful, and mark completed checks. AP-connected runs receive item data from the server.</span></div>
          <div class="flprQuickStartPanel wide"><strong>SIEGES</strong><span>A siege is a surprise defense event. Start Defense on the besieged table, play up to three balls, and hit the posted score within five minutes. Players who do not want surprise sieges can disable them in the YAML options builder.</span></div>
        </div>
      `;
    }
    if(key === "tables"){
      return standaloneQuickStartTableListMarkup();
    }
    if(key === "vpx"){
      return `
        <div class="flprQuickStartGrid">
          <div class="flprQuickStartPanel"><strong>TABLE SWITCHING</strong><span>Use whatever VPX frontend or folder workflow is fastest for you. Flippermizer does not launch VPX tables directly yet.</span></div>
          <div class="flprQuickStartPanel"><strong>RESETTING</strong><span>If F3 causes trough/ball issues on a table, fully restart that VPX table before the next Ball 1 attempt.</span></div>
          <div class="flprQuickStartPanel"><strong>SCORES</strong><span>Manual score entry is supported on the Checks card. Score-reading/capture tooling is not bundled yet, but this is a future workflow target.</span></div>
          <div class="flprQuickStartPanel"><strong>COMPATIBILITY</strong><span>The Flippermizer Current Catalog of tables are based on real pinball machines plus curated Original VPX entries. It will prefer complete, stable VPX releases along with working scoring and rules.</span></div>
        </div>
      `;
    }
    return `
      <div class="flprQuickStartGrid">
        <div class="flprQuickStartPanel wide"><strong>FAST START</strong><span>Create or choose a profile, start a Singleplayer seed or connect to AP, pick one of the unlocked tables, play only the unlocked ball for that table, then mark checks as you complete them.</span></div>
        <div class="flprQuickStartPanel"><strong>WHAT IS A SEED?</strong><span>A seed is a generated route of worlds, tables, checks, item rewards, boss keys, and surprises. Local seeds save to your active profile.</span></div>
        <div class="flprQuickStartPanel"><strong>WHAT AM I TRYING TO DO?</strong><span>Complete checks to earn progression. Progression opens tables/balls, Boss Keys open the boss path, and resources help with longer-term runs.</span></div>
        <div class="flprQuickStartPanel"><strong>WHAT ARE WORLDS?</strong><span>Worlds are five-table groups. The Worlds tab shows sample worlds and explains how unlocking routes works.</span></div>
        <div class="flprQuickStartPanel"><strong>WHAT DO I DO AFTER A CHECK?</strong><span>Mark it in Checks or enter your score. The app grants the reward, then returns you to Checks so you can continue from there.</span></div>
      </div>
    `;
  }

  function standaloneSetQuickStartTab(tab){
    const overlay = document.getElementById("flprQuickStartOverlay");
    if(!overlay) return false;
    const key = ["start","guide","checks","worlds","tables","vpx"].includes(String(tab || "").trim().toLowerCase())
      ? String(tab || "").trim().toLowerCase()
      : "start";
    overlay.dataset.quickStartTab = key;
    overlay.querySelectorAll("[data-quick-start-tab]").forEach((btn)=>{
      btn.classList.toggle("active", String(btn.dataset.quickStartTab || "") === key);
    });
    const body = overlay.querySelector("#flprQuickStartBody");
    if(body) body.innerHTML = standaloneQuickStartTabMarkup(key);
    standaloneBindQuickStartControls(overlay);
    return true;
  }

  function standaloneEnsureQuickStartOverlay(){
    let overlay = document.getElementById("flprQuickStartOverlay");
    if(overlay){
      standaloneBindQuickStartControls(overlay);
      return overlay;
    }
    overlay = document.createElement("div");
    overlay.id = "flprQuickStartOverlay";
    overlay.className = "flprQuickStartOverlay";
    overlay.hidden = true;
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = `
      <div class="flprQuickStartCard" role="dialog" aria-modal="true" aria-labelledby="flprQuickStartTitle">
        <div class="flprQuickStartHead">
          <div>
            <div class="flprQuickStartTitle" id="flprQuickStartTitle">Getting Started</div>
            <div class="flprQuickStartSub">A readable guide for Home Edition: seeds, worlds, checks, Ball 1, UI parts, sieges, VPX workflow, and the table catalog.</div>
          </div>
          <div class="flprQuickStartHeadActions">
            <div class="flprQuickStartModeSwitch" aria-label="Guide mode">
              <button class="flprQuickStartModeBtn" type="button" data-quick-guide-mode="sp">SINGLEPLAYER</button>
              <button class="flprQuickStartModeBtn" type="button" data-quick-guide-mode="mp">MULTIPLAYER</button>
            </div>
            <button class="cBtn flprQuickStartCloseX" id="flprQuickStartCloseTop" type="button" data-quick-start-close aria-label="Close Getting Started">X</button>
          </div>
        </div>
        <div class="flprQuickStartTabs" role="tablist">
          <button class="flprQuickStartTab active" type="button" data-quick-start-tab="start">START</button>
          <button class="flprQuickStartTab" type="button" data-quick-start-tab="guide">GUIDE</button>
          <button class="flprQuickStartTab" type="button" data-quick-start-tab="checks">CHECKS</button>
          <button class="flprQuickStartTab" type="button" data-quick-start-tab="worlds">WORLDS</button>
          <button class="flprQuickStartTab" type="button" data-quick-start-tab="tables">TABLES</button>
          <button class="flprQuickStartTab" type="button" data-quick-start-tab="vpx">VPX FLOW</button>
        </div>
        <div class="flprQuickStartBody" id="flprQuickStartBody"></div>
        <div class="flprQuickStartFooter">
          <label class="flprQuickStartDontShow">
            <input id="flprQuickStartDontShow" type="checkbox">
            <span>Don't show this automatically again</span>
          </label>
          <div class="flprQuickStartActions">
            <button class="cBtn gray" id="flprQuickStartTablesBtn" type="button">TABLE LIST</button>
            <button class="cBtn" id="flprQuickStartClose" type="button" data-quick-start-close>CLOSE</button>
          </div>
        </div>
      </div>
    `;
    overlay.addEventListener("click", (event)=>{
      if(event.target === overlay) standaloneCloseQuickStart({ markSeen:true });
      const tabBtn = event.target.closest?.("[data-quick-start-tab]");
      if(tabBtn && overlay.contains(tabBtn)){
        playClick();
        standaloneSetQuickStartTab(tabBtn.dataset.quickStartTab || "start");
      }
      const guideBtn = event.target.closest?.("[data-quick-guide-mode]");
      if(guideBtn && overlay.contains(guideBtn)){
        playClick();
        overlay.dataset.quickGuideMode = String(guideBtn.dataset.quickGuideMode || "sp");
        standaloneSetQuickStartTab("guide");
      }
    });
    document.body.appendChild(overlay);
    standaloneBindQuickStartControls(overlay);
    standaloneSetQuickStartTab("start");
    return overlay;
  }

  function standaloneOpenQuickStart(tab, opts){
    opts = opts || {};
    const overlay = standaloneEnsureQuickStartOverlay();
    standaloneBindQuickStartControls(overlay);
    standaloneSetQuickStartTab(tab || "start");
    const dontShow = overlay.querySelector("#flprQuickStartDontShow");
    if(dontShow) dontShow.checked = !!opts.auto;
    overlay.hidden = false;
    overlay.setAttribute("aria-hidden", "false");
    overlay.dataset.auto = opts.auto ? "1" : "0";
    setTimeout(()=>{ try{ overlay.querySelector("#flprQuickStartCloseTop")?.focus?.(); }catch(_){} }, 0);
    return true;
  }

  function standaloneCloseQuickStart(opts){
    opts = opts || {};
    const overlay = document.getElementById("flprQuickStartOverlay");
    if(!overlay) return false;
    if(opts.forceSeen === true || overlay.querySelector("#flprQuickStartDontShow")?.checked){
      try{ localStorage.setItem(STANDALONE_QUICK_START_SEEN_LS_KEY, STANDALONE_QUICK_START_VERSION); }catch(_){}
    }
    overlay.hidden = true;
    overlay.setAttribute("aria-hidden", "true");
    return true;
  }

  function standaloneMaybeShowQuickStart(){
    try{
      if(localStorage.getItem(STANDALONE_QUICK_START_SEEN_LS_KEY) === STANDALONE_QUICK_START_VERSION) return false;
      const existing = document.getElementById("flprQuickStartOverlay");
      if(existing && existing.hidden === false) return false;
      if(document.querySelector(".standaloneProfileGate:not([hidden]), .standaloneModeGate:not([hidden])")){
        setTimeout(standaloneMaybeShowQuickStart, 900);
        return false;
      }
      return standaloneOpenQuickStart("start", { auto:true });
    }catch(_){}
    return false;
  }

  function standaloneCloneJson(value, fallback){
    try{
      if(value == null) return fallback;
      return JSON.parse(JSON.stringify(value));
    }catch(_){
      return fallback;
    }
  }

  function standaloneLocalStorageJson(key, fallback){
    try{
      const raw = localStorage.getItem(key);
      if(!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed == null ? fallback : parsed;
    }catch(_){
      return fallback;
    }
  }

  function standaloneWriteLocalStorageJson(key, value){
    try{ localStorage.setItem(key, JSON.stringify(value)); }catch(_){}
  }

  function standaloneFreshProfileState(){
    return { version:1, activeProfileId:"", profiles:[] };
  }

  function standaloneNormalizeProfileColor(value){
    const raw = String(value || "").trim();
    return /^#[0-9a-f]{6}$/i.test(raw) ? raw : "#00ffd5";
  }

  function standaloneDefaultProfileAvatar(){
    return String.fromCodePoint(0x1F3B1);
  }

  function standaloneProfileEmojiList(){
    return STANDALONE_PROFILE_EMOJI_CODES.map((code)=>String.fromCodePoint(code));
  }

  function standaloneSanitizeProfileAvatar(value){
    const text = String(value || "").trim();
    return text ? Array.from(text).slice(0, 2).join("") : standaloneDefaultProfileAvatar();
  }

  function standaloneSanitizeProfileName(value){
    return String(value || "").replace(/\s+/g, " ").trim().slice(0, 40) || "Player";
  }

  function standaloneProfileState(){
    const raw = standaloneLocalStorageJson(STANDALONE_PROFILE_STATE_KEY, null);
    const state = (raw && typeof raw === "object") ? raw : standaloneFreshProfileState();
    const profiles = Array.isArray(state.profiles) ? state.profiles : [];
    const normalized = profiles.map((profile)=>{
      const id = String(profile?.id || "").trim();
      if(!id) return null;
      return {
        id,
        name: standaloneSanitizeProfileName(profile?.name || "Player"),
        avatar: standaloneSanitizeProfileAvatar(profile?.avatar || ""),
        color: standaloneNormalizeProfileColor(profile?.color),
        createdAt: Math.max(0, Number(profile?.createdAt || Date.now())),
        updatedAt: Math.max(0, Number(profile?.updatedAt || profile?.createdAt || Date.now())),
        achievementStore: (profile?.achievementStore && typeof profile.achievementStore === "object") ? profile.achievementStore : null,
        achievementUi: (profile?.achievementUi && typeof profile.achievementUi === "object") ? profile.achievementUi : null,
        relics: (profile?.relics && typeof profile.relics === "object") ? profile.relics : null,
        seedSaves: Array.isArray(profile?.seedSaves) ? profile.seedSaves : [],
        multiplayerSnapshot: (profile?.multiplayerSnapshot && typeof profile.multiplayerSnapshot === "object") ? profile.multiplayerSnapshot : null,
        extensions: (profile?.extensions && typeof profile.extensions === "object") ? profile.extensions : {}
      };
    }).filter(Boolean);
    let activeProfileId = String(state.activeProfileId || "").trim();
    if(activeProfileId && !profiles.some((profile)=>String(profile?.id || "") === activeProfileId)) activeProfileId = "";
    return { version:1, activeProfileId, profiles:normalized };
  }

  function standaloneSaveProfileState(next){
    const state = next && typeof next === "object" ? next : standaloneProfileState();
    standaloneWriteLocalStorageJson(STANDALONE_PROFILE_STATE_KEY, {
      version:1,
      activeProfileId:String(state.activeProfileId || ""),
      profiles:Array.isArray(state.profiles) ? state.profiles : []
    });
  }

  function standaloneActiveProfile(stateOverride){
    const state = stateOverride || standaloneProfileState();
    const id = String(state.activeProfileId || "").trim();
    return (state.profiles || []).find((profile)=>String(profile?.id || "") === id) || null;
  }

  function installStandaloneProfileExtensionBridge(){
    try{
      window.flprStandaloneProfileExtensions = {
        hasActiveProfile(){
          return !!standaloneActiveProfile();
        },
        activeProfileId(){
          const data = standaloneProfileState();
          return String(data.activeProfileId || "");
        },
        get(namespace, fallback){
          const key = String(namespace || "").trim();
          if(!key) return fallback;
          const data = standaloneProfileState();
          const active = standaloneActiveProfile(data);
          if(!active || !active.extensions || typeof active.extensions !== "object") return fallback;
          return Object.prototype.hasOwnProperty.call(active.extensions, key) ? standaloneCloneJson(active.extensions[key], fallback) : fallback;
        },
        set(namespace, value){
          const key = String(namespace || "").trim();
          if(!key) return false;
          const data = standaloneProfileState();
          const active = standaloneActiveProfile(data);
          if(!active) return false;
          active.extensions = (active.extensions && typeof active.extensions === "object") ? active.extensions : {};
          active.extensions[key] = standaloneCloneJson(value, value);
          active.updatedAt = Date.now();
          standaloneSaveProfileState(data);
          return true;
        }
      };
    }catch(_){}
  }
  installStandaloneProfileExtensionBridge();

  function standaloneProfilePoints(profile){
    const store = profile?.achievementStore && typeof profile.achievementStore === "object"
      ? profile.achievementStore
      : standaloneCurrentAchievementStoreSnapshot();
    const earned = Number(store?.pointsEarned ?? store?.points ?? 0);
    return Number.isFinite(earned) ? Math.max(0, Math.round(earned)) : 0;
  }

  function standaloneProfileId(){
    return `home_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function standaloneFreshAchievementStore(){
    try{ if(typeof achCreateFreshStore === "function") return achCreateFreshStore(); }catch(_){}
    return {
      version:2,
      updatedAt:Date.now(),
      unlocked:{},
      order:[],
      catalog:{ tables:{}, randomizer:[] },
      pointsEarned:0,
      pointsSpent:0,
      justCompleted:[],
      descOverrides:{},
      sortPrefs:{ achievements:"default", achPanel:"trophies", customizationType:"all" },
      shop:{ owned:{}, equipped:{ border:"", sparks:"", cursor:"", title:"" } },
      interaction:{ panelClicks:{}, tableSequence:[], panelSequence:[] },
      progress:{ totalChecks:0, multiballChecks:0, tableChecks:{}, tableTotals:{} }
    };
  }

  function standaloneCurrentAchievementStoreSnapshot(){
    try{ if(typeof achStore !== "undefined" && achStore && typeof achStore === "object") return standaloneCloneJson(achStore, null); }catch(_){}
    try{ if(window.flprAchievementStore && typeof window.flprAchievementStore === "object") return standaloneCloneJson(window.flprAchievementStore, null); }catch(_){}
    return standaloneLocalStorageJson(STANDALONE_ACHIEVEMENT_LS_KEY, standaloneFreshAchievementStore());
  }

  function standaloneCurrentAchievementUiSnapshot(){
    return standaloneLocalStorageJson(STANDALONE_ACHIEVEMENT_UI_LS_KEY, null);
  }

  function standaloneCurrentRelicsSnapshot(){
    try{ if(state?.relics && typeof state.relics === "object") return standaloneCloneJson(state.relics, null); }catch(_){}
    return null;
  }

  function standaloneCaptureActiveProfileSnapshots(opts){
    opts = opts || {};
    if(standaloneProfileRuntime.profileRestoring && opts.force !== true) return;
    const stateData = standaloneProfileState();
    const active = standaloneActiveProfile(stateData);
    if(!active) return;
    active.achievementStore = standaloneCurrentAchievementStoreSnapshot() || standaloneFreshAchievementStore();
    active.achievementUi = standaloneCurrentAchievementUiSnapshot();
    active.relics = standaloneCurrentRelicsSnapshot();
    active.updatedAt = Date.now();
    standaloneSaveProfileState(stateData);
  }

  function standaloneApplyProfileSnapshots(profile){
    if(!profile) return;
    standaloneProfileRuntime.profileRestoring = true;
    try{
      const achievementStore = standaloneCloneJson(profile.achievementStore, null) || standaloneFreshAchievementStore();
      standaloneWriteLocalStorageJson(STANDALONE_ACHIEVEMENT_LS_KEY, achievementStore);
      try{
        achStore = (typeof achLoadStore === "function") ? achLoadStore() : achievementStore;
        if(typeof achEnsureExtendedStore === "function") achEnsureExtendedStore();
        window.flprAchievementStore = achStore;
      }catch(_){}
      if(profile.achievementUi){
        standaloneWriteLocalStorageJson(STANDALONE_ACHIEVEMENT_UI_LS_KEY, standaloneCloneJson(profile.achievementUi, profile.achievementUi));
      }
      try{ installStandaloneNoEpisodeBridge(); }catch(_){}
      try{
        if(profile.relics && state && typeof state === "object"){
          state.relics = typeof relicNormalizeState === "function"
            ? relicNormalizeState(standaloneCloneJson(profile.relics, {}))
            : standaloneCloneJson(profile.relics, {});
        }
      }catch(_){}
      try{ if(typeof achApplyShopCustomizationClasses === "function") achApplyShopCustomizationClasses(); }catch(_){}
      try{ if(typeof achBuildTableCatalogFromAp === "function") achBuildTableCatalogFromAp(); }catch(_){}
      try{ if(typeof achRecomputeProgress === "function") achRecomputeProgress(); }catch(_){}
      try{ if(typeof achSaveStore === "function") achSaveStore(); }catch(_){}
      try{ if(typeof renderAchievementsControlsPanel === "function") renderAchievementsControlsPanel(); }catch(_){}
      try{ if(typeof renderHeaderTitleBadge === "function") renderHeaderTitleBadge(); }catch(_){}
      try{ if(typeof saveState === "function") saveState(); }catch(_){}
    }finally{
      standaloneProfileRuntime.profileRestoring = false;
    }
  }

  function standaloneCreateProfile(data){
    const stateData = standaloneProfileState();
    const now = Date.now();
    const importExisting = !stateData.profiles.length;
    const profile = {
      id: standaloneProfileId(),
      name: standaloneSanitizeProfileName(data?.name || ""),
      avatar: standaloneSanitizeProfileAvatar(data?.avatar || ""),
      color: standaloneNormalizeProfileColor(data?.color),
      createdAt: now,
      updatedAt: now,
      achievementStore: importExisting ? (standaloneCurrentAchievementStoreSnapshot() || standaloneFreshAchievementStore()) : standaloneFreshAchievementStore(),
      achievementUi: importExisting ? standaloneCurrentAchievementUiSnapshot() : null,
      relics: importExisting ? standaloneCurrentRelicsSnapshot() : null,
      seedSaves: [],
      multiplayerSnapshot: null,
      extensions: {}
    };
    stateData.profiles.push(profile);
    stateData.activeProfileId = profile.id;
    standaloneSaveProfileState(stateData);
    standaloneProfileRuntime.appliedProfileId = profile.id;
    standaloneProfileRuntime.profileGateManualOpen = false;
    standaloneApplyProfileSnapshots(profile);
    standaloneRefreshProfileUi();
    return profile;
  }

  function standaloneUpdateActiveProfile(data){
    const stateData = standaloneProfileState();
    const active = standaloneActiveProfile(stateData);
    if(!active) return null;
    active.name = standaloneSanitizeProfileName(data?.name || active.name || "");
    active.avatar = standaloneSanitizeProfileAvatar(data?.avatar || active.avatar || "");
    active.color = standaloneNormalizeProfileColor(data?.color || active.color);
    active.updatedAt = Date.now();
    standaloneSaveProfileState(stateData);
    standaloneProfileRuntime.profileGateManualOpen = false;
    standaloneCloseProfileGate({ force:true });
    standaloneRefreshProfileUi();
    return active;
  }

  function standaloneSignOutProfile(){
    try{ if(standaloneCurrentMenuMode() === "archipelago" || (ap?.connected && !ap?.inherentSeedActive)) standaloneCaptureMultiplayerSnapshot("profile-signout"); }catch(_){}
    standaloneCaptureActiveProfileSnapshots({ force:true });
    const stateData = standaloneProfileState();
    stateData.activeProfileId = "";
    standaloneSaveProfileState(stateData);
    standaloneProfileRuntime.appliedProfileId = "";
    standaloneProfileRuntime.selectedMode = "";
    standaloneMarkRandomizerClosed();
    standaloneOpenProfileGate(true, "choose");
  }

  function standaloneSwitchProfile(profileId){
    try{ if(standaloneCurrentMenuMode() === "archipelago" || (ap?.connected && !ap?.inherentSeedActive)) standaloneCaptureMultiplayerSnapshot("profile-switch"); }catch(_){}
    standaloneCaptureActiveProfileSnapshots({ force:true });
    const stateData = standaloneProfileState();
    const id = String(profileId || "").trim();
    const profile = stateData.profiles.find((entry)=>String(entry?.id || "") === id);
    if(!profile) return false;
    stateData.activeProfileId = id;
    standaloneSaveProfileState(stateData);
    standaloneProfileRuntime.appliedProfileId = id;
    standaloneProfileRuntime.randomizerStarted = false;
    standaloneProfileRuntime.randomizerReady = false;
    standaloneProfileRuntime.selectedMode = "";
    standaloneProfileRuntime.profileGateManualOpen = false;
    standaloneApplyProfileSnapshots(profile);
    standaloneRefreshProfileUi();
    return true;
  }

  function standaloneFormatShortTime(ts){
    try{
      const d = new Date(Number(ts) || Date.now());
      return d.toLocaleString([], { month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" });
    }catch(_){
      return "now";
    }
  }

  function standaloneSeedWord(seedName){
    try{ if(typeof flprSeedWord === "function") return String(flprSeedWord(seedName) || "").trim(); }catch(_){}
    const raw = String(seedName || "").trim();
    return raw ? raw.replace(/^FLPR[_-]?/i, "").replace(/[_-]+/g, " ").slice(0, 28) : "Local Seed";
  }

  function standaloneNewSingleplayerSeedName(){
    const code = Date.now().toString(36).toUpperCase();
    const salt = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `FLPR_HOME_${code}_${salt}`;
  }

  function standaloneSeedProgressSnapshot(){
    let total = 0;
    let checked = 0;
    try{
      const valid = ap?.validCheckLocIds instanceof Set ? Array.from(ap.validCheckLocIds) : [];
      const locIds = valid.length
        ? valid
        : (ap?.locById instanceof Map ? Array.from(ap.locById.keys()) : []);
      const unique = new Set(locIds.map(Number).filter((id)=>Number.isFinite(id) && id > 0));
      total = unique.size;
      const checkedSet = ap?.checked instanceof Set ? ap.checked : new Set();
      checked = Array.from(unique).reduce((n, id)=> n + (checkedSet.has(id) ? 1 : 0), 0);
    }catch(_){}
    const pct = total > 0 ? Math.max(0, Math.min(100, (checked / total) * 100)) : 0;
    return { checked, total, pct };
  }

  function standaloneSeedSaveId(seedName){
    const raw = String(seedName || "").trim() || "singleplayer";
    let h = 5381;
    for(let i = 0; i < raw.length; i++) h = ((h << 5) + h) + raw.charCodeAt(i);
    return `seed_${(h >>> 0).toString(36)}`;
  }

  function standaloneCurrentSingleplayerSeedSavePatch(extra){
    const seedName = String(ap?.seedName || state?.bossTableSeed || "").trim();
    if(!seedName || !ap?.inherentSeedActive) return null;
    const progress = standaloneSeedProgressSnapshot();
    return {
      id: standaloneSeedSaveId(seedName),
      mode: "singleplayer",
      seedName,
      seedWord: standaloneSeedWord(seedName),
      updatedAt: Date.now(),
      checked: progress.checked,
      total: progress.total,
      pct: progress.pct,
      checkedLocIds: (()=>{ try{ return Array.from(ap.checked || []).map(Number).filter((id)=>Number.isFinite(id) && id > 0); }catch(_){ return []; } })(),
      stateSnapshot: (()=>{ try{ return standaloneCloneJson(state, null); }catch(_){ return null; } })(),
      ...(extra || {})
    };
  }

  function standaloneSeedSaveSignature(patch){
    try{
      if(!patch) return "";
      const checkedIds = Array.isArray(patch.checkedLocIds) ? patch.checkedLocIds.slice().map(Number).filter(Number.isFinite).sort((a, b)=>a - b) : [];
      const balls = [];
      const worlds = [];
      const snapshot = patch.stateSnapshot || {};
      Object.entries(snapshot?.balls || {}).forEach(([key, value])=>{
        if(value) balls.push(String(key));
      });
      Object.entries(snapshot?.worlds || {}).forEach(([key, world])=>{
        worlds.push(`${key}:${world?.locked === true ? "1" : "0"}:${Array.isArray(world?.tables) ? world.tables.join(",") : ""}`);
      });
      balls.sort();
      worlds.sort();
      return JSON.stringify({
        seedName: patch.seedName,
        checked: checkedIds,
        balls,
        worlds,
        bossTable: snapshot?.bossTable || "",
        selected: snapshot?.selected || "",
        highScores: snapshot?.tableHighScores || {},
        extraBallTokens: snapshot?.extraBallTokens || 0,
        extraBallAssignments: snapshot?.extraBallAssignments || {},
        junkRedeems: snapshot?.junkRedeems || {}
      });
    }catch(_){
      return `${patch?.seedName || ""}|${patch?.checked || 0}|${patch?.total || 0}`;
    }
  }

  function standaloneUpsertCurrentSeedSave(extra){
    if(standaloneProfileRuntime.activeSeedLoadConfirmId && extra?.reason !== "seed-load" && extra?.force !== true) return null;
    const activeState = standaloneProfileState();
    const active = standaloneActiveProfile(activeState);
    if(!active) return null;
    const patch = standaloneCurrentSingleplayerSeedSavePatch(extra);
    if(!patch) return null;
    const force = extra?.force === true || extra?.reason === "seed-load" || extra?.createdAt;
    const sig = standaloneSeedSaveSignature(patch);
    const now = Date.now();
    if(!force && sig && sig === standalonePerformanceRuntime.lastSeedSaveSig && (now - standalonePerformanceRuntime.lastSeedSaveAt) < 15000){
      return null;
    }
    standalonePerformanceRuntime.lastSeedSaveSig = sig;
    standalonePerformanceRuntime.lastSeedSaveAt = now;
    const list = Array.isArray(active.seedSaves) ? active.seedSaves.slice() : [];
    const idx = list.findIndex((entry)=>String(entry?.id || "") === patch.id);
    const previous = idx >= 0 ? list[idx] : null;
    const next = {
      ...(previous || {}),
      ...patch,
      createdAt: Number(previous?.createdAt || patch.createdAt || Date.now())
    };
    if(idx >= 0) list[idx] = next;
    else list.unshift(next);
    active.seedSaves = list
      .filter((entry)=>entry && String(entry.mode || "") === "singleplayer")
      .sort((a, b)=>Number(b?.updatedAt || 0) - Number(a?.updatedAt || 0))
      .slice(0, 18);
    active.updatedAt = Date.now();
    standaloneSaveProfileState(activeState);
    standaloneWriteLocalStorageJson(STANDALONE_SEED_SAVES_KEY, active.seedSaves);
    standaloneRenderSeedSaveList();
    standaloneRenderRunBriefing();
    standaloneRenderNextAchievement();
    return next;
  }

  function standaloneScheduleSeedSave(extra, delayMs){
    try{
      const ms = Math.max(0, Number(delayMs) || 0);
      if(standalonePerformanceRuntime.pendingSeedSaveTimer) clearTimeout(standalonePerformanceRuntime.pendingSeedSaveTimer);
      standalonePerformanceRuntime.pendingSeedSaveTimer = setTimeout(()=>{
        standalonePerformanceRuntime.pendingSeedSaveTimer = 0;
        standaloneUpsertCurrentSeedSave(extra || {});
      }, ms);
    }catch(_){}
  }

  function standaloneSavedSeedById(seedId){
    const active = standaloneActiveProfile();
    const id = String(seedId || "").trim();
    return (active?.seedSaves || []).find((entry)=>String(entry?.id || "") === id) || null;
  }

  function standaloneSetSeedLoadConfirm(seedId){
    const id = String(seedId || "").trim();
    standaloneProfileRuntime.activeSeedLoadConfirmId = id;
    document.querySelectorAll("#standaloneSeedSaveList .standaloneSeedSaveRow").forEach((row)=>{
      row.classList.toggle("pendingLoad", !!id && String(row.dataset.seedSaveId || "") === id);
    });
  }

  function standaloneClearSeedLoadConfirm(){
    if(!standaloneProfileRuntime.activeSeedLoadConfirmId) return;
    standaloneProfileRuntime.activeSeedLoadConfirmId = "";
    document.querySelectorAll("#standaloneSeedSaveList .standaloneSeedSaveRow.pendingLoad").forEach((row)=>{
      row.classList.remove("pendingLoad");
    });
  }

  async function standaloneLoadSavedSingleplayerSeed(seedId){
    const save = standaloneCloneJson(standaloneSavedSeedById(seedId), null);
    if(!save || String(save.mode || "") !== "singleplayer" || !String(save.seedName || "").trim()) return false;
    standaloneClearSeedLoadConfirm();
    standaloneSetSelectedMode("singleplayer");
    const seedName = String(save.seedName || "").trim();
    await loadStandaloneSingleplayerSeed({ seedName, fromSave:true });
    const snapshot = standaloneCloneJson(save.stateSnapshot, null);
    let restoredSelected = "";
    let restoredLastSelected = "";
    if(snapshot && snapshot.worlds && snapshot.selected){
      restoredSelected = String(snapshot.selected || "");
      restoredLastSelected = String(snapshot.lastSelected || restoredSelected || "");
      try{
        state = snapshot;
        if(typeof window !== "undefined") window.state = state;
        if(typeof saveState === "function") saveState();
        if(typeof loadState === "function") state = loadState();
      }catch(_){}
    }
    try{
      ap.inherentSeedActive = true;
      ap.connected = true;
      ap.seedName = seedName;
      ap.checked = new Set((Array.isArray(save.checkedLocIds) ? save.checkedLocIds : []).map(Number).filter((id)=>Number.isFinite(id) && id > 0));
    }catch(_){}
    try{
      if(restoredSelected){
        if(typeof standaloneClearChecksSelectionPin === "function") standaloneClearChecksSelectionPin("save-load");
        if(typeof standaloneClearChecksWorldPin === "function") standaloneClearChecksWorldPin("save-load");
        if(typeof standaloneRememberChecksWorldSelection === "function") standaloneRememberChecksWorldSelection(restoredSelected, "save-load");
        ap.currentWorld = restoredSelected;
      }
    }catch(_){}
    try{ if(typeof saveState === "function") saveState(); }catch(_){}
    try{ if(typeof setApIndicator === "function") setApIndicator("green", "SINGLEPLAYER SEED"); }catch(_){}
    const hEl = document.getElementById("apConnectedHost");
    if(hEl) hEl.textContent = `SINGLEPLAYER; ${seedName}`;
    try{ if(typeof updateApConnectButtons === "function") updateApConnectButtons("connected"); }catch(_){}
    try{ if(typeof achBuildTableCatalogFromAp === "function") achBuildTableCatalogFromAp(); if(typeof achRecomputeProgress === "function") achRecomputeProgress(); if(typeof achSaveStore === "function") achSaveStore(); if(typeof renderAchievementsControlsPanel === "function") renderAchievementsControlsPanel(); }catch(_){}
    try{ if(typeof renderAll === "function") renderAll(); if(typeof renderChecksWorldTabs === "function") renderChecksWorldTabs(); if(typeof renderChecks === "function") renderChecks(); if(typeof updateCountCheckUI === "function") updateCountCheckUI(); }catch(_){}
    try{ if(typeof showView === "function") showView("checks"); }catch(_){}
    try{
      if(restoredSelected && state?.worlds?.[restoredSelected]){
        if(typeof standaloneRememberChecksWorldSelection === "function") standaloneRememberChecksWorldSelection(restoredSelected, "save-load");
        ap.currentWorld = restoredSelected;
        state.selected = restoredSelected;
        state.lastSelected = restoredLastSelected || restoredSelected;
        if(typeof saveState === "function") saveState();
        if(typeof renderChecksWorldTabs === "function") renderChecksWorldTabs();
        if(typeof renderChecks === "function") renderChecks();
        if(typeof updateCountCheckUI === "function") updateCountCheckUI();
      }
    }catch(_){}
    standaloneUpsertCurrentSeedSave({ createdAt:save.createdAt || Date.now(), reason:"seed-load" });
    standaloneMarkRandomizerReady("singleplayer");
    standaloneRefreshProfileUi();
    try{
      window.__flprStandaloneLastSeedLoad = {
        id:String(save.id || ""),
        seedName,
        restoredSelected,
        selected:String(state?.selected || ""),
        ts:Date.now()
      };
    }catch(_){}
    try{ if(typeof toast === "function") toast("good", "SAVE LOADED", `${save.seedWord || standaloneSeedWord(seedName)} restored.`, 3000); }catch(_){}
    return true;
  }

  function standaloneHandleSeedLoadActivation(event, seedId){
    if(event?.__flprStandaloneSeedLoadHandled) return;
    if(event) event.__flprStandaloneSeedLoadHandled = true;
    if(event?.preventDefault) event.preventDefault();
    if(event?.stopPropagation) event.stopPropagation();
    try{ playClick(); }catch(_){}
    standaloneLoadSavedSingleplayerSeed(seedId).catch((err)=>{ try{ console.error(err); }catch(_){} });
  }

  function standaloneHandleSeedSaveActivation(event, row){
    if(event?.target?.closest?.("[data-seed-load-id]")) return;
    if(event?.preventDefault) event.preventDefault();
    try{ playClick(); }catch(_){}
    standaloneSetSeedLoadConfirm(row?.dataset?.seedSaveId || "");
  }

  function standaloneRenderSeedSaveList(){
    const list = document.getElementById("standaloneSeedSaveList");
    const count = document.getElementById("standaloneSeedSaveCount");
    if(!list) return;
    const active = standaloneActiveProfile();
    const saves = (active?.seedSaves || []).filter((entry)=>String(entry?.mode || "") === "singleplayer");
    if(count) count.textContent = `${saves.length} save${saves.length === 1 ? "" : "s"}`;
    if(!saves.length){
      list.innerHTML = `<div class="standaloneProfileHint">No local seeds saved yet. Start a Singleplayer seed to create a save file.</div>`;
      return;
    }
    list.innerHTML = saves.map((save)=>{
      const pct = Math.max(0, Math.min(100, Number(save?.pct || 0)));
      const checked = Math.max(0, Math.round(Number(save?.checked || 0)));
      const total = Math.max(0, Math.round(Number(save?.total || 0)));
      const pending = String(standaloneProfileRuntime.activeSeedLoadConfirmId || "") === String(save?.id || "");
      return `
        <div class="standaloneSeedSaveRow${pending ? " pendingLoad" : ""}" data-seed-save-id="${escapeAttr(save?.id || "")}" role="button" tabindex="0" aria-label="Load ${escapeAttr(save?.seedWord || "local seed")}">
          <div class="standaloneSeedSaveRowHd">
            <span>${standaloneEscapeHtml(save?.seedWord || "Local Seed")}</span>
            <span>${pct.toFixed(1)}%</span>
          </div>
          <div class="standaloneSeedSaveMeta">${checked}/${total || "?"} checks | ${standaloneEscapeHtml(save?.seedName || "")} | ${standaloneEscapeHtml(standaloneFormatShortTime(save?.updatedAt))}</div>
          <div class="standaloneSeedProgressTrack"><div class="standaloneSeedProgressFill" style="--seedProgress:${pct.toFixed(2)}%"></div></div>
          <div class="standaloneSeedLoadPrompt" aria-hidden="${pending ? "false" : "true"}">
            <button class="standaloneSeedLoadBtn" type="button" data-seed-load-id="${escapeAttr(save?.id || "")}">LOAD?</button>
          </div>
        </div>
      `;
    }).join("");
    list.querySelectorAll("[data-seed-load-id]").forEach((btn)=>{
      btn.onclick = (event)=>standaloneHandleSeedLoadActivation(event, btn.dataset.seedLoadId || "");
    });
    list.querySelectorAll("[data-seed-save-id]").forEach((row)=>{
      row.onclick = (event)=>standaloneHandleSeedSaveActivation(event, row);
      row.onkeydown = (event)=>{
        if(event.key !== "Enter" && event.key !== " ") return;
        standaloneHandleSeedSaveActivation(event, row);
      };
    });
  }

  function standaloneAllAchievementDefs(){
    try{
      if(typeof achEnsureExtendedStore === "function") achEnsureExtendedStore();
      const defs = typeof achBuildAllDefs === "function" ? achBuildAllDefs() : null;
      return (defs?.tableDefs || []).concat(defs?.randomDefs || []).filter((def)=>String(def?.id || "").trim());
    }catch(_){}
    return [];
  }

  function standaloneAchievementById(achievementId){
    const id = String(achievementId || "").trim();
    if(!id) return null;
    return standaloneAllAchievementDefs().find((def)=>String(def?.id || "") === id) || null;
  }

  function standaloneNextClosestAchievement(){
    try{
      const allDefs = standaloneAllAchievementDefs();
      const rows = allDefs
        .filter((def)=>!achStore?.unlocked?.[String(def?.id || "")])
        .map((def)=>{
          const pr = typeof achDefProgress === "function" ? achDefProgress(def) : { cur:0, goal:1, pct:0 };
          const goal = Math.max(1, Number(pr?.goal || 1));
          const cur = Math.max(0, Math.min(goal, Number(pr?.cur || 0)));
          const pct = Math.max(0, Math.min(1, Number(pr?.pct ?? (cur / goal)) || 0));
          return { def, pr:{ cur, goal, pct } };
        });
      rows.sort((a, b)=>{
        const aStarted = a.pr.pct > 0 ? 1 : 0;
        const bStarted = b.pr.pct > 0 ? 1 : 0;
        return (bStarted - aStarted)
          || (b.pr.pct - a.pr.pct)
          || ((b.pr.cur || 0) - (a.pr.cur || 0))
          || ((a.pr.goal - a.pr.cur) - (b.pr.goal - b.pr.cur))
          || String(a.def?.title || "").localeCompare(String(b.def?.title || ""));
      });
      return rows[0] || null;
    }catch(_){}
    return null;
  }

  function standaloneRenderNextAchievement(){
    const btn = document.getElementById("standaloneNextAchievementBtn");
    if(!btn) return;
    const next = standaloneNextClosestAchievement();
    if(!next?.def){
      btn.disabled = true;
      btn.onclick = null;
      btn.removeAttribute("data-achievement-id");
      btn.innerHTML = `
        <div class="standaloneNextAchievementEyebrow">NEXT CLOSEST ACHIEVEMENT</div>
        <div class="standaloneNextAchievementTitle">All caught up</div>
        <div class="standaloneNextAchievementDesc">No locked achievements are available for the current profile catalog.</div>
      `;
      return;
    }
    const def = next.def;
    const id = String(def?.id || "");
    const title = String(def?.title || id || "Achievement");
    const desc = (()=>{ try{ return achGetDisplayDesc(def); }catch(_){ return String(def?.desc || ""); } })();
    const pct = Math.max(0, Math.min(100, Math.round(next.pr.pct * 100)));
    const points = (()=>{ try{ return Math.max(0, Number(achPointsForPayload(def) || 0)); }catch(_){ return 0; } })();
    btn.disabled = false;
    btn.onclick = (event)=>standaloneHandleNextAchievementClick(event, btn);
    btn.dataset.achievementId = id;
    btn.dataset.achievementTitle = title;
    btn.innerHTML = `
      <div class="standaloneNextAchievementEyebrow">NEXT CLOSEST ACHIEVEMENT</div>
      <div class="standaloneNextAchievementTitle">${standaloneEscapeHtml(title)}</div>
      <div class="standaloneNextAchievementMeta">PROGRESS; ${standaloneEscapeHtml(String(next.pr.cur))}/${standaloneEscapeHtml(String(next.pr.goal))} | REWARD; +${points} FLPRP</div>
      <div class="standaloneNextAchievementBar"><span style="--nextAchProgress:${pct}%"></span></div>
      <div class="standaloneNextAchievementDesc">${standaloneEscapeHtml(desc || "Open the Achievements panel to view this goal.")}</div>
    `;
  }

  function standaloneFindAchievementElement(achievementId, title){
    const panel = document.getElementById("achievementsControlsPanel");
    if(!panel) return null;
    const wantedTitle = String(title || "").trim();
    const def = standaloneAchievementById(achievementId);
    const derivedTitle = wantedTitle || String(def?.title || "").trim();
    const items = Array.from(panel.querySelectorAll(".achCtlItem"));
    if(!items.length) return null;
    if(derivedTitle){
      const exact = items.find((item)=>String(item.querySelector(".n")?.textContent || "").trim().includes(derivedTitle));
      if(exact) return exact;
      const loose = items.find((item)=>String(item.textContent || "").includes(derivedTitle));
      if(loose) return loose;
    }
    return panel.querySelector(".achClosestItem") || items[0] || null;
  }

  function standaloneOpenAchievementFromSingleplayer(achievementId){
    const def = standaloneAchievementById(achievementId) || standaloneNextClosestAchievement()?.def || null;
    const id = String(def?.id || achievementId || "");
    const title = String(def?.title || "");
    try{
      if(typeof achEnsureExtendedStore === "function") achEnsureExtendedStore();
      achStore.sortPrefs = achStore.sortPrefs && typeof achStore.sortPrefs === "object" ? achStore.sortPrefs : {};
      achStore.sortPrefs.achPanel = "trophies";
      achStore.sortPrefs.achievements = "progress";
      if(typeof achSaveStore === "function") achSaveStore();
      if(typeof renderAchievementsControlsPanel === "function") renderAchievementsControlsPanel();
    }catch(_){}
    try{ setControlTab("achievements"); }catch(_){}
    try{
      const panel = document.querySelector('.controlsTabPanel[data-ctrl-panel="achievements"]');
      window.__flprStandaloneLastAchievementOpen = {
        id,
        title,
        panelActive:!!panel?.classList?.contains("active"),
        panelDisplay:panel ? getComputedStyle(panel).display : "",
        ts:Date.now()
      };
    }catch(_){}
    window.setTimeout(()=>{
      try{
        if(typeof renderAchievementsControlsPanel === "function") renderAchievementsControlsPanel();
        const item = standaloneFindAchievementElement(id, title);
        if(item){
          item.classList.add("standaloneAchFocusPulse");
          item.scrollIntoView({ block:"center", inline:"nearest", behavior:"smooth" });
          window.setTimeout(()=>{ try{ item.classList.remove("standaloneAchFocusPulse"); }catch(_){} }, 3600);
        }
      }catch(_){}
    }, 90);
  }

  function standaloneHandleNextAchievementClick(event, btn){
    if(event?.__flprStandaloneNextAchievementHandled) return;
    if(event) event.__flprStandaloneNextAchievementHandled = true;
    if(event?.preventDefault) event.preventDefault();
    const target = btn || document.getElementById("standaloneNextAchievementBtn");
    if(!target || target.disabled) return;
    try{ playClick(); }catch(_){}
    standaloneOpenAchievementFromSingleplayer(target.dataset.achievementId || "");
  }

  function standaloneRenderRunBriefing(){
    const seedEl = document.getElementById("standaloneRunSeedSummary");
    const checkEl = document.getElementById("standaloneRunCheckSummary");
    const keyEl = document.getElementById("standaloneRunBossKeySummary");
    const resourceEl = document.getElementById("standaloneRunResourceSummary");
    if(!seedEl && !checkEl && !keyEl && !resourceEl) return;
    const progress = standaloneSeedProgressSnapshot();
    const seedName = String(ap?.seedName || state?.bossTableSeed || "").trim();
    if(seedEl) seedEl.textContent = ap?.inherentSeedActive && seedName ? `${standaloneSeedWord(seedName)} | ${seedName}` : "No seed loaded";
    if(checkEl) checkEl.textContent = `${Math.max(0, Number(progress.checked || 0))} / ${Math.max(0, Number(progress.total || 0))} (${Math.round(Number(progress.pct || 0))}%)`;
    if(keyEl){
      let got = 0;
      let total = 3;
      try{
        if(Array.isArray(bossKeysState)){
          total = Math.max(1, bossKeysState.length || total);
          got = bossKeysState.reduce((n, key)=> n + (key?.acquired ? 1 : 0), 0);
        }else{
          got = Math.max(0, Math.round(Number(window.__apBossKeyCount || 0)));
          const totalRaw = Number(ap?.slotData?.boss_keys_total ?? ap?.slotData?.boss_keys_required_for_boss_table_open ?? ap?.slotData?.boss_keys_required ?? 3);
          total = Math.max(1, Math.round(Number.isFinite(totalRaw) ? (totalRaw <= 0 ? 1 : totalRaw) : 3));
        }
      }catch(_){}
      keyEl.textContent = ap?.inherentSeedActive || ap?.connected ? `${got} / ${total}` : "Searching";
    }
    if(resourceEl){
      let fragments = 0;
      let extraBalls = 0;
      try{ fragments = Math.max(0, Math.round(Number(standaloneLoadRewardState()?.currentFragments || 0))); }catch(_){}
      try{ extraBalls = Math.max(0, Math.round(Number(state?.extraBallTokens || 0))); }catch(_){}
      resourceEl.textContent = `Fragments ${fragments}/5 | EB ${extraBalls}`;
    }
  }

  function standaloneEnsureProfileHud(){
    let hud = document.getElementById("standaloneProfileHud");
    if(!hud){
      hud = document.createElement("div");
      hud.id = "standaloneProfileHud";
      hud.className = "standaloneProfileHud";
      document.body.appendChild(hud);
    }
    if(hud.__flprStandaloneProfileHudBound !== true){
      hud.__flprStandaloneProfileHudBound = true;
      hud.addEventListener("click", (event)=>{
        const btn = event.target.closest?.("#standaloneProfileHudBtn");
        if(btn){
          event.preventDefault();
          event.stopPropagation();
          try{ event.stopImmediatePropagation(); }catch(_){}
          try{ playClick(); }catch(_){}
          const menu = document.getElementById("standaloneProfileMenu");
          if(menu) menu.hidden = !menu.hidden;
          return;
        }
        const action = event.target.closest?.("[data-profile-menu-action]");
        if(action){
          event.preventDefault();
          event.stopPropagation();
          try{ event.stopImmediatePropagation(); }catch(_){}
          try{ playClick(); }catch(_){}
          const menu = document.getElementById("standaloneProfileMenu");
          if(menu) menu.hidden = true;
          const name = String(action.dataset.profileMenuAction || "");
          if(name === "change") standaloneOpenProfileGate(true, "choose");
          else if(name === "edit") standaloneOpenProfileGate(true, "edit");
          else if(name === "signout") standaloneSignOutProfile();
        }
      }, true);
      document.addEventListener("click", (event)=>{
        if(hud.contains(event.target)) return;
        const menu = document.getElementById("standaloneProfileMenu");
        if(menu) menu.hidden = true;
      }, true);
    }
    return hud;
  }

  function standaloneEnsureModeHud(){
    let hud = document.getElementById("standaloneModeHud");
    if(!hud){
      hud = document.createElement("div");
      hud.id = "standaloneModeHud";
      hud.className = "standaloneModeHud";
      document.body.appendChild(hud);
    }
    if(hud.__flprStandaloneModeHudBound !== true){
      hud.__flprStandaloneModeHudBound = true;
      hud.addEventListener("pointerdown", (event)=>{
        if(standaloneSettings.logoLocked !== false) return;
        const logo = event.target.closest?.(".standaloneModeHudLogo");
        if(!logo || !hud.contains(logo)) return;
        if(Number(event.button || 0) !== 0) return;
        event.preventDefault();
        event.stopPropagation();
        try{ event.stopImmediatePropagation(); }catch(_){}
        const startX = Number(event.clientX || 0);
        const startY = Number(event.clientY || 0);
        const rect = hud.getBoundingClientRect();
        const startLeft = Number(rect?.left || 0);
        const startTop = Number(rect?.top || 0);
        hud.classList.add("logoDragging");
        try{ hud.setPointerCapture(event.pointerId); }catch(_){}
        const move = (moveEvent)=>{
          const nextX = startLeft + (Number(moveEvent.clientX || 0) - startX);
          const nextY = startTop + (Number(moveEvent.clientY || 0) - startY);
          standaloneSetLogoPosition(nextX, nextY, { save:false });
        };
        const up = (upEvent)=>{
          document.removeEventListener("pointermove", move, true);
          document.removeEventListener("pointerup", up, true);
          document.removeEventListener("pointercancel", up, true);
          hud.classList.remove("logoDragging");
          try{ hud.releasePointerCapture(upEvent.pointerId); }catch(_){}
          const finalRect = hud.getBoundingClientRect();
          standaloneSettings.logoX = Math.round(Number(finalRect?.left || 0));
          standaloneSettings.logoY = Math.round(Number(finalRect?.top || 0));
          saveSettings(standaloneSettings);
          standaloneSyncLogoControls();
        };
        document.addEventListener("pointermove", move, true);
        document.addEventListener("pointerup", up, true);
        document.addEventListener("pointercancel", up, true);
      }, true);
    }
    return hud;
  }

  function standaloneEnsureModeSwitchHud(){
    let hud = document.getElementById("standaloneModeSwitchHud");
    if(!hud){
      hud = document.createElement("div");
      hud.id = "standaloneModeSwitchHud";
      hud.className = "standaloneModeSwitchHud";
      document.body.appendChild(hud);
    }
    if(hud.__flprStandaloneModeSwitchBound !== true){
      hud.__flprStandaloneModeSwitchBound = true;
      hud.addEventListener("click", (event)=>{
        const btn = event.target.closest?.("[data-standalone-mode-toggle]");
        if(!btn || !hud.contains(btn)) return;
        event.preventDefault();
        event.stopPropagation();
        try{ event.stopImmediatePropagation(); }catch(_){}
        try{ playClick(); }catch(_){}
        const target = String(btn.dataset.standaloneModeToggle || "archipelago");
        if(target === "house"){
          try{ setControlTab("house"); }catch(_){}
          standaloneRenderModeSwitchHud(standaloneCurrentMenuMode());
          return;
        }
        standaloneSwitchHomeMode(target);
      }, true);
    }
    return hud;
  }

  function standaloneDefaultLogoPosition(){
    if(standaloneIsVerticalViewport()){
      return { x:Math.round(readRootPx("--flprStandalonePortraitPadX", 24)), y:18 };
    }
    try{
      const viewportW = window.innerWidth || document.documentElement.clientWidth || 1280;
      return {
        x: clamp(STANDALONE_PACKAGED_LOGO_POSITION.x, 8, Math.max(8, viewportW - 220)),
        y: Math.max(8, STANDALONE_PACKAGED_LOGO_POSITION.y)
      };
    }catch(_){}
    try{
      const controls = document.querySelector(".controls") || document.querySelector(".controlsHead, .controlsHeadTitle") || document.querySelector(".controlsBody");
      const rect = controls?.getBoundingClientRect?.();
      if(rect && Number.isFinite(rect.left) && rect.left > 0){
        return { x:Math.max(8, Math.round(rect.left)), y:42 };
      }
    }catch(_){}
    return { x:Math.max(8, Math.round(readRootPx("--captureW", 910) + readRootPx("--gutter", 16) + 16)), y:42 };
  }

  function standaloneSetLogoPosition(x, y, opts){
    opts = opts || {};
    const hud = document.getElementById("standaloneModeHud");
    if(!hud) return;
    const rect = hud.getBoundingClientRect?.();
    const width = Math.max(120, Number(rect?.width || 600));
    const height = Math.max(60, Number(rect?.height || 128));
    const maxX = Math.max(8, (window.innerWidth || document.documentElement.clientWidth || 1280) - Math.min(width, 220));
    const maxY = Math.max(8, (window.innerHeight || document.documentElement.clientHeight || 720) - Math.min(height, 60));
    const left = clamp(Number(x), 0, maxX);
    const top = clamp(Number(y), 0, maxY);
    hud.style.setProperty("left", `${Math.round(left)}px`, "important");
    hud.style.setProperty("top", `${Math.round(top)}px`, "important");
    if(opts.save !== false){
      standaloneSettings.logoX = Math.round(left);
      standaloneSettings.logoY = Math.round(top);
      saveSettings(standaloneSettings);
    }
  }

  function standalonePositionModeHud(){
    try{
      const hud = document.getElementById("standaloneModeHud");
      if(!hud) return;
      const hasSavedPosition = standaloneSettings.logoX != null && standaloneSettings.logoY != null && String(standaloneSettings.logoX) !== "" && String(standaloneSettings.logoY) !== "";
      const savedX = Number(standaloneSettings.logoX);
      const savedY = Number(standaloneSettings.logoY);
      const pos = standaloneDefaultLogoPosition();
      if(standaloneIsVerticalViewport()){
        standaloneSetLogoPosition(pos.x, pos.y, { save:false });
        hud.classList.toggle("logoUnlocked", standaloneSettings.logoLocked === false);
        return;
      }
      const savedInMenuLane = hasSavedPosition &&
        Number.isFinite(savedX) &&
        Number.isFinite(savedY) &&
        Math.abs(savedX - Number(pos.x || 0)) < 42 &&
        Math.abs(savedY - Number(pos.y || 0)) < 96;
      if(savedInMenuLane){
        standaloneSetLogoPosition(savedX, savedY, { save:false });
      }else{
        standaloneSetLogoPosition(pos.x, pos.y, { save:false });
      }
      hud.classList.toggle("logoUnlocked", standaloneSettings.logoLocked === false);
    }catch(_){}
  }

  function standalonePositionModeSwitchHud(){
    try{
      const hud = document.getElementById("standaloneModeSwitchHud");
      if(!hud) return;
      const profile = document.getElementById("standaloneProfileHud");
      const viewportW = window.innerWidth || document.documentElement.clientWidth || 1280;
      const hudRect = hud.getBoundingClientRect?.();
      if(standaloneIsVerticalViewport()){
        hud.style.setProperty("left", "50%", "important");
        hud.style.setProperty("right", "auto", "important");
        hud.style.setProperty("top", "22px", "important");
        hud.style.setProperty("transform", "translateX(-50%)", "important");
        return;
      }
      const profileRect = profile?.getBoundingClientRect?.();
      const width = Math.max(260, Number(hudRect?.width || 360));
      const profileLeft = Number(profileRect?.left || viewportW);
      const profileOffset = Number.isFinite(profileLeft) && profileLeft > 0
        ? Math.max(18, Math.round(viewportW - profileLeft + 18))
        : Math.max(360, Math.round(viewportW * 0.3));
      const maxRight = Math.max(18, Math.round(viewportW - width - 8));
      const right = clamp(profileOffset, 18, maxRight);
      hud.style.setProperty("left", "auto", "important");
      hud.style.setProperty("right", `${right}px`, "important");
      hud.style.setProperty("top", "10px", "important");
      hud.style.setProperty("transform", "none", "important");
    }catch(_){}
  }

  function standaloneRenderModeHud(){
    const hud = standaloneEnsureModeHud();
    if(!hud) return;
    const hasProfile = !!standaloneActiveProfile();
    hud.hidden = !hasProfile;
    const mode = standaloneCurrentMenuMode();
    const sig = hasProfile ? `logo|${mode}|${standaloneSettings.logoLocked !== false ? "locked" : "unlocked"}` : "hidden";
    if(hud.dataset.renderSig !== sig){
      hud.dataset.renderSig = sig;
      hud.innerHTML = `
        <img class="standaloneModeHudLogo" src="Flippermizer Images/FlippermizerLogo.png" alt="Flippermizer">
      `;
    }
    standalonePositionModeHud();
    try{
      if(!standalonePerformanceRuntime.pendingHudPositionTimer){
        standalonePerformanceRuntime.pendingHudPositionTimer = setTimeout(()=>{
          standalonePerformanceRuntime.pendingHudPositionTimer = 0;
          try{ standalonePositionModeHud(); standalonePositionModeSwitchHud(); }catch(_){}
        }, 180);
      }
      requestAnimationFrame(()=>standalonePositionModeHud());
    }catch(_){}
    [80, 240, 520, 960].forEach((delay)=>setTimeout(()=>{
      try{ standalonePositionModeHud(); standalonePositionModeSwitchHud(); }catch(_){}
    }, delay));
    standaloneRenderModeSwitchHud(mode);
  }

  function standaloneRenderModeSwitchHud(modeOverride){
    const hud = standaloneEnsureModeSwitchHud();
    if(!hud) return;
    const hasProfile = !!standaloneActiveProfile();
    hud.hidden = !hasProfile;
    const mode = modeOverride || standaloneCurrentMenuMode();
    const houseActive = activeControlTab() === "house";
    const sig = `${mode}|${houseActive ? "house" : "main"}`;
    if(hud.dataset.renderSig !== sig){
      hud.dataset.renderSig = sig;
      hud.innerHTML = `
        <button class="standaloneModeHudBtn${!houseActive && mode === "singleplayer" ? " active" : ""}" data-standalone-mode-toggle="singleplayer" type="button" aria-pressed="${!houseActive && mode === "singleplayer" ? "true" : "false"}">SP</button>
        <button class="standaloneModeHudBtn${!houseActive && mode === "archipelago" ? " active" : ""}" data-standalone-mode-toggle="archipelago" type="button" aria-pressed="${!houseActive && mode === "archipelago" ? "true" : "false"}">MP</button>
        <button class="standaloneModeHudBtn houseBtn${houseActive ? " active" : ""}" data-standalone-mode-toggle="house" type="button" aria-pressed="${houseActive ? "true" : "false"}">HOUSE</button>
      `;
    }
    standalonePositionModeSwitchHud();
    [80, 240, 520].forEach((delay)=>setTimeout(()=>{
      try{ standalonePositionModeSwitchHud(); }catch(_){}
    }, delay));
  }

  function standaloneRenderProfileHud(){
    const bar = standaloneEnsureProfileHud();
    if(!bar) return;
    const active = standaloneActiveProfile();
    const keepMenuOpen = !!bar.querySelector("#standaloneProfileMenu:not([hidden])");
    if(!active){
      bar.innerHTML = `
        <div class="standaloneProfilePointsWrap" tabindex="0">
          <div class="standaloneProfilePoints" aria-describedby="standaloneProfilePointsTip">FLPRP 0</div>
          <div class="standaloneProfilePointsTooltip" id="standaloneProfilePointsTip">FLPRP are profile points earned from Home Edition achievements. They track long-term profile progress across saved seeds.</div>
        </div>
        <div class="standaloneProfileHudWrap">
          <button class="standaloneProfileHudBtn" id="standaloneProfileHudBtn" type="button">
            <span class="standaloneProfileAvatar">${standaloneEscapeHtml(standaloneDefaultProfileAvatar())}</span>
            <span class="standaloneProfileName">No Profile</span>
          </button>
          <div class="standaloneProfileMenu" id="standaloneProfileMenu" hidden>
            <button class="cBtn" type="button" data-profile-menu-action="change">CREATE / CHOOSE PROFILE</button>
          </div>
        </div>
      `;
      if(keepMenuOpen){
        const menu = document.getElementById("standaloneProfileMenu");
        if(menu) menu.hidden = false;
      }
      standalonePositionModeSwitchHud();
      return;
    }
    bar.style.setProperty("--profileColor", standaloneNormalizeProfileColor(active.color));
    bar.innerHTML = `
      <div class="standaloneProfilePointsWrap" tabindex="0">
        <div class="standaloneProfilePoints" aria-describedby="standaloneProfilePointsTip">FLPRP ${standaloneProfilePoints(active)}</div>
        <div class="standaloneProfilePointsTooltip" id="standaloneProfilePointsTip">FLPRP are profile points earned from Home Edition achievements. They track long-term profile progress across saved seeds.</div>
      </div>
      <div class="standaloneProfileHudWrap">
        <button class="standaloneProfileHudBtn" id="standaloneProfileHudBtn" type="button" style="--profileColor:${escapeAttr(standaloneNormalizeProfileColor(active.color))}">
          <span class="standaloneProfileAvatar">${standaloneEscapeHtml(active.avatar || standaloneDefaultProfileAvatar())}</span>
          <span class="standaloneProfileName">${standaloneEscapeHtml(active.name || "Player")}</span>
        </button>
        <div class="standaloneProfileMenu" id="standaloneProfileMenu" hidden>
          <button class="cBtn" type="button" data-profile-menu-action="change">CHANGE PROFILE</button>
          <button class="cBtn" type="button" data-profile-menu-action="edit">CHANGE NAME / EMOJI</button>
          <button class="cBtn danger" type="button" data-profile-menu-action="signout">SIGN OUT</button>
        </div>
      </div>
    `;
    if(keepMenuOpen){
      const menu = document.getElementById("standaloneProfileMenu");
      if(menu) menu.hidden = false;
    }
    standalonePositionModeSwitchHud();
  }

  function standaloneProfileGateHtml(){
    const stateData = standaloneProfileState();
    const profiles = stateData.profiles || [];
    const active = standaloneActiveProfile(stateData);
    const mode = standaloneProfileRuntime.profileGateMode === "edit" && active ? "edit" : "choose";
    const avatar = mode === "edit" ? (active?.avatar || standaloneDefaultProfileAvatar()) : standaloneDefaultProfileAvatar();
    const color = mode === "edit" ? standaloneNormalizeProfileColor(active?.color) : "#00ffd5";
    const name = mode === "edit" ? standaloneSanitizeProfileName(active?.name || "Player") : "";
    const previewName = name || "New Home Player";
    const previewPoints = active ? standaloneProfilePoints(active) : 0;
    const emojis = standaloneProfileEmojiList();
    const emojiGrid = emojis.map((emoji)=>`
      <button class="standaloneEmojiChoice${emoji === avatar ? " active" : ""}" type="button" data-profile-emoji="${escapeAttr(emoji)}" aria-label="Use ${escapeAttr(emoji)} avatar">${standaloneEscapeHtml(emoji)}</button>
    `).join("");
    const existing = mode !== "edit" && profiles.length
      ? `<div class="standaloneProfileExistingWrap">
          <div class="standaloneProfileSectionTitle">SAVED PROFILES</div>
          <div class="standaloneProfileExisting">${profiles.map((profile)=>`
          <button class="standaloneProfilePick" type="button" data-profile-id="${escapeAttr(profile.id)}" style="--profileColor:${escapeAttr(standaloneNormalizeProfileColor(profile.color))}">
            <span class="standaloneProfileAvatar">${standaloneEscapeHtml(profile.avatar || standaloneDefaultProfileAvatar())}</span>
            <span class="standaloneProfilePickName">${standaloneEscapeHtml(profile.name || "Player")}</span>
          </button>
        `).join("")}</div>
        </div>`
      : "";
    return `
      <div class="standaloneProfileCard" role="dialog" aria-modal="true" aria-labelledby="standaloneProfileTitle" style="--profileColor:${escapeAttr(color)}">
        <div class="standaloneProfileHeader">
          <div class="standaloneProfileTitleBlock">
            <div class="standaloneProfileTitle" id="standaloneProfileTitle">${mode === "edit" ? "Edit Home Profile" : "Home Profile"}</div>
            <div class="standaloneProfileSub">${mode === "edit" ? "Update the profile name, emoji, or color shown in the Home Edition HUD." : "Create or choose a profile before opening the randomizer. Achievements, FLPRP, relic progress, and local seed saves are kept on this profile."}</div>
          </div>
          <div class="standaloneProfilePreview" id="standaloneProfilePreview" style="--profileColor:${escapeAttr(color)}">
            <div class="standaloneProfilePreviewAvatar" id="standaloneProfilePreviewAvatar">${standaloneEscapeHtml(avatar)}</div>
            <div class="standaloneProfilePreviewText">
              <div class="standaloneProfilePreviewKicker">ACTIVE PROFILE CARD</div>
              <div class="standaloneProfilePreviewName" id="standaloneProfilePreviewName">${standaloneEscapeHtml(previewName)}</div>
              <div class="standaloneProfilePreviewMeta">FLPRP ${previewPoints} | Saves and achievements bind here</div>
            </div>
          </div>
        </div>
        ${existing}
        <form class="standaloneProfileForm" id="standaloneProfileForm">
          <label>
            <span class="cLabel">NAME</span>
            <input class="cInput" id="standaloneProfileNameInput" type="text" maxlength="40" autocomplete="off" placeholder="Profile name" value="${escapeAttr(name)}">
          </label>
          <label class="standaloneEmojiPicker">
            <span class="cLabel">AVATAR</span>
            <input id="standaloneProfileAvatarInput" type="hidden" value="${escapeAttr(avatar)}" aria-label="Emoji avatar">
            <button class="standaloneEmojiPickerButton" id="standaloneEmojiPickerButton" type="button" aria-expanded="false">${standaloneEscapeHtml(avatar)}</button>
            <div class="standaloneEmojiGrid" id="standaloneEmojiGrid" hidden>${emojiGrid}</div>
          </label>
          <label>
            <span class="cLabel">COLOR</span>
            <input class="cInput" id="standaloneProfileColorInput" type="color" value="${escapeAttr(color)}" aria-label="Profile color">
          </label>
        </form>
        <div class="standaloneProfileHint">Pick an emoji avatar and color so save files and achievement progress feel like yours.</div>
        <div class="standaloneProfileActions">
          ${active ? `<button class="cBtn danger" id="standaloneProfileCloseBtn" type="button">CLOSE</button>` : ""}
          <button class="cBtn" id="standaloneProfileCreateBtn" type="button">${mode === "edit" ? "SAVE CHANGES" : "SAVE PROFILE"}</button>
        </div>
      </div>
    `;
  }

  function standaloneUpdateProfilePreviewFromInputs(){
    try{
      const card = document.querySelector(".standaloneProfileCard");
      const preview = document.getElementById("standaloneProfilePreview");
      const nameInput = document.getElementById("standaloneProfileNameInput");
      const avatarInput = document.getElementById("standaloneProfileAvatarInput");
      const colorInput = document.getElementById("standaloneProfileColorInput");
      const nameNode = document.getElementById("standaloneProfilePreviewName");
      const avatarNode = document.getElementById("standaloneProfilePreviewAvatar");
      const name = standaloneSanitizeProfileName(nameInput?.value || "New Home Player");
      const avatar = standaloneSanitizeProfileAvatar(avatarInput?.value || "");
      const color = standaloneNormalizeProfileColor(colorInput?.value || "");
      if(nameNode) nameNode.textContent = name;
      if(avatarNode) avatarNode.textContent = avatar;
      if(preview) preview.style.setProperty("--profileColor", color);
      if(card) card.style.setProperty("--profileColor", color);
    }catch(_){}
  }

  function standaloneEnsureProfileGate(){
    let gate = document.getElementById("standaloneProfileGate");
    if(!gate){
      gate = document.createElement("div");
      gate.id = "standaloneProfileGate";
      gate.className = "standaloneProfileGate";
      document.body.appendChild(gate);
    }
    if(gate.dataset.rendered !== "1"){
      gate.innerHTML = standaloneProfileGateHtml();
      gate.dataset.rendered = "1";
    }
    if(gate.__flprStandaloneBound !== true){
      gate.__flprStandaloneBound = true;
      gate.addEventListener("click", (event)=>{
        const emojiToggle = event.target.closest?.("#standaloneEmojiPickerButton");
        if(emojiToggle){
          event.preventDefault();
          try{ playClick(); }catch(_){}
          const grid = document.getElementById("standaloneEmojiGrid");
          if(grid){
            grid.hidden = !grid.hidden;
            emojiToggle.setAttribute("aria-expanded", grid.hidden ? "false" : "true");
          }
          return;
        }
        const emojiChoice = event.target.closest?.("[data-profile-emoji]");
        if(emojiChoice){
          event.preventDefault();
          try{ playClick(); }catch(_){}
          const emoji = standaloneSanitizeProfileAvatar(emojiChoice.dataset.profileEmoji || "");
          const input = document.getElementById("standaloneProfileAvatarInput");
          const button = document.getElementById("standaloneEmojiPickerButton");
          const grid = document.getElementById("standaloneEmojiGrid");
          if(input) input.value = emoji;
          if(button){
            button.textContent = emoji;
            button.setAttribute("aria-expanded", "false");
          }
          document.querySelectorAll(".standaloneEmojiChoice").forEach((choice)=>{
            choice.classList.toggle("active", choice === emojiChoice);
          });
          if(grid) grid.hidden = true;
          standaloneUpdateProfilePreviewFromInputs();
          return;
        }
        const pick = event.target.closest?.("[data-profile-id]");
        if(pick){
          event.preventDefault();
          try{ playClick(); }catch(_){}
          standaloneSwitchProfile(pick.dataset.profileId || "");
          return;
        }
        if(event.target.closest?.("#standaloneProfileCreateBtn")){
          event.preventDefault();
          try{ playClick(); }catch(_){}
          const data = {
            name: document.getElementById("standaloneProfileNameInput")?.value || "",
            avatar: document.getElementById("standaloneProfileAvatarInput")?.value || "",
            color: document.getElementById("standaloneProfileColorInput")?.value || ""
          };
          if(standaloneProfileRuntime.profileGateMode === "edit" && standaloneActiveProfile()){
            standaloneUpdateActiveProfile(data);
          }else{
            standaloneCreateProfile(data);
          }
          return;
        }
        if(event.target.closest?.("#standaloneProfileCloseBtn")){
          event.preventDefault();
          try{ playClick(); }catch(_){}
          standaloneCloseProfileGate({ force:true });
          standaloneRefreshProfileUi();
        }
      }, true);
      gate.addEventListener("input", (event)=>{
        try{
          if(event.target?.closest?.("#standaloneProfileForm")) standaloneUpdateProfilePreviewFromInputs();
        }catch(_){}
      }, true);
      gate.addEventListener("change", (event)=>{
        try{
          if(event.target?.closest?.("#standaloneProfileForm")) standaloneUpdateProfilePreviewFromInputs();
        }catch(_){}
      }, true);
    }
    return gate;
  }

  function standaloneOpenProfileGate(forceRender, mode){
    standaloneProfileRuntime.profileGateMode = String(mode || "choose") === "edit" ? "edit" : "choose";
    if(forceRender || mode || !standaloneActiveProfile()) standaloneProfileRuntime.profileGateManualOpen = true;
    const gate = standaloneEnsureProfileGate();
    if(forceRender){
      gate.dataset.rendered = "0";
      gate.innerHTML = standaloneProfileGateHtml();
      gate.dataset.rendered = "1";
    }
    gate.hidden = false;
    try{
      const input = document.getElementById("standaloneProfileNameInput");
      if(input) setTimeout(()=>input.focus({ preventScroll:true }), 60);
    }catch(_){}
  }

  function standaloneCloseProfileGate(opts){
    opts = opts || {};
    if(opts.auto && standaloneProfileRuntime.profileGateManualOpen) return;
    const gate = standaloneEnsureProfileGate();
    gate.hidden = true;
    standaloneProfileRuntime.profileGateManualOpen = false;
    standaloneProfileRuntime.profileGateMode = "choose";
  }

  function standaloneModeGateHtml(){
    return `
      <div class="standaloneModeCard" role="dialog" aria-modal="true" aria-labelledby="standaloneModeTitle">
        <div class="standaloneModeTitle" id="standaloneModeTitle">Choose Your Home Edition Mode</div>
        <div class="standaloneModeChoices">
          <button class="standaloneModeChoice" type="button" data-standalone-mode-choice="singleplayer">
            <span class="standaloneModeChoiceIcon">${standaloneEscapeHtml(String.fromCodePoint(0x1F3B2))}</span>
            <span class="standaloneModeChoiceTitle">Singleplayer</span>
            <span class="standaloneModeChoiceText">Create or continue a local Home Edition seed, save progress to this profile, and play without AP chat or item logs.</span>
            <span class="standaloneModeChoiceCue">Local seed and profile progression</span>
          </button>
          <button class="standaloneModeChoice" type="button" data-standalone-mode-choice="archipelago">
            <span class="standaloneModeChoiceIcon">${standaloneEscapeHtml(String.fromCodePoint(0x1F310))}</span>
            <span class="standaloneModeChoiceTitle">Multiplayer</span>
            <span class="standaloneModeChoiceText">Connect to an Archipelago multiworld, use the AP text log, and track received and sent items from the server.</span>
            <span class="standaloneModeChoiceCue">AP connection, item log, and server text</span>
          </button>
        </div>
      </div>
    `;
  }

  function standaloneEnsureModeGate(){
    let gate = document.getElementById("standaloneModeGate");
    if(!gate){
      gate = document.createElement("div");
      gate.id = "standaloneModeGate";
      gate.className = "standaloneModeGate";
      document.body.appendChild(gate);
    }
    if(gate.dataset.rendered !== "1"){
      gate.innerHTML = standaloneModeGateHtml();
      gate.dataset.rendered = "1";
    }
    if(gate.__flprStandaloneBound !== true){
      gate.__flprStandaloneBound = true;
      gate.addEventListener("click", (event)=>{
        const btn = event.target.closest?.("[data-standalone-mode-choice]");
        if(!btn || !gate.contains(btn)) return;
        event.preventDefault();
        standaloneChooseMode(btn.dataset.standaloneModeChoice || "archipelago", event);
      }, true);
    }
    return gate;
  }

  function standaloneOpenModeGate(forceRender){
    const gate = standaloneEnsureModeGate();
    if(forceRender && !gate.classList.contains("choosing")){
      gate.dataset.rendered = "0";
      gate.innerHTML = standaloneModeGateHtml();
      gate.dataset.rendered = "1";
    }
    gate.hidden = false;
    try{
      const first = gate.querySelector("[data-standalone-mode-choice]");
      if(first && document.activeElement === document.body) setTimeout(()=>first.focus({ preventScroll:true }), 60);
    }catch(_){}
  }

  function standaloneCloseModeGate(){
    const gate = standaloneEnsureModeGate();
    gate.hidden = true;
    gate.classList.remove("choosing");
    gate.querySelectorAll(".standaloneModeChoice").forEach((btn)=>{
      btn.classList.remove("selected");
      btn.disabled = false;
    });
  }

  function standaloneCaptureMultiplayerSnapshot(reason){
    const stateData = standaloneProfileState();
    const active = standaloneActiveProfile(stateData);
    if(!active) return null;
    let receivedAll = [];
    let sent = [];
    try{
      receivedAll = Array.isArray(ap?.receivedAll)
        ? standaloneCloneJson(ap.receivedAll, [])
        : (typeof loadReceivedList === "function" ? standaloneCloneJson(loadReceivedList() || [], []) : []);
    }catch(_){
      receivedAll = [];
    }
    try{
      standaloneLoadSentItems();
      standaloneSaveSentItems();
      sent = standaloneCloneJson(standaloneItemPanel.sent || [], []);
    }catch(_){
      sent = [];
    }
    try{ if(Array.isArray(ap?.receivedAll) && typeof saveReceivedList === "function") saveReceivedList(ap.receivedAll); }catch(_){}
    const snapshot = {
      version: 1,
      updatedAt: Date.now(),
      reason: String(reason || "mode-switch"),
      cfg: standaloneCloneJson(apCfg(), {}),
      receivedAll,
      sent,
      lastReceivedIndex: Math.max(0, Math.round(Number(ap?.lastReceivedIndex || 0)) || 0)
    };
    active.multiplayerSnapshot = snapshot;
    active.updatedAt = Date.now();
    standaloneSaveProfileState(stateData);
    return snapshot;
  }

  function standaloneApplyMultiplayerSnapshot(profile){
    const active = profile || standaloneActiveProfile();
    const snapshot = active?.multiplayerSnapshot && typeof active.multiplayerSnapshot === "object"
      ? active.multiplayerSnapshot
      : null;
    if(!snapshot) return false;
    try{
      const cfg = snapshot.cfg && typeof snapshot.cfg === "object" ? snapshot.cfg : null;
      if(cfg && typeof ap !== "undefined" && ap?.cfg){
        ["server", "player", "game", "pass"].forEach((key)=>{
          if(cfg[key] != null) ap.cfg[key] = String(cfg[key] || "");
        });
        try{ if(typeof saveApCfg === "function") saveApCfg(ap.cfg); }catch(_){}
        standaloneControlAll("#apServer").forEach((node)=>{ node.value = ap.cfg.server || ""; });
        standaloneControlAll("#apPlayer").forEach((node)=>{ node.value = ap.cfg.player || standaloneApDefaultPlayer(); });
        standaloneControlAll("#apGame").forEach((node)=>{ node.value = ap.cfg.game || STANDALONE_FLIPPERMIZER_GAME_NAME; });
        standaloneControlAll("#apPass").forEach((node)=>{ node.value = ap.cfg.pass || ""; });
      }
    }catch(_){}
    try{
      if(Array.isArray(snapshot.receivedAll) && (!ap?.connected || ap?.inherentSeedActive)){
        ap.receivedAll = standaloneCloneJson(snapshot.receivedAll, []);
        if(typeof saveReceivedList === "function") saveReceivedList(ap.receivedAll);
      }
    }catch(_){}
    try{
      if(Array.isArray(snapshot.sent)){
        standaloneItemPanel.sent = standaloneCloneJson(snapshot.sent, []).slice(-standaloneItemPanel.maxSent);
        standaloneItemPanel.sentLoaded = true;
        standaloneSaveSentItems();
      }
    }catch(_){}
    try{
      const lastIndex = Math.max(0, Math.round(Number(snapshot.lastReceivedIndex || 0)) || 0);
      if(lastIndex){
        ap.lastReceivedIndex = Math.max(Number(ap?.lastReceivedIndex || 0) || 0, lastIndex);
        localStorage.setItem("flpr_ap_last_received_index", String(ap.lastReceivedIndex));
      }
    }catch(_){}
    try{ standaloneRenderItemPanel(); }catch(_){}
    return true;
  }

  function standaloneDisconnectForModeSwitch(){
    try{ standaloneCaptureMultiplayerSnapshot("mode-switch-mp-to-sp"); }catch(_){}
    try{
      if(typeof apDisconnect === "function" && ap?.connected && !ap?.inherentSeedActive){
        apDisconnect({ manual:true });
      }
    }catch(err){ try{ console.error(err); }catch(_){} }
    try{
      if(typeof ap !== "undefined" && ap){
        ap.connected = false;
        ap.inherentSeedActive = false;
      }
    }catch(_){}
    try{ if(typeof updateApConnectButtons === "function") updateApConnectButtons("offline"); }catch(_){}
  }

  function standaloneSwitchHomeMode(mode, opts){
    opts = opts || {};
    const wanted = standaloneConnectionModeName(mode);
    const current = standaloneCurrentMenuMode();
    const hadSelectedMode = !!String(standaloneProfileRuntime.selectedMode || "").trim();
    if(current === wanted && hadSelectedMode){
      setControlTab(wanted === "singleplayer" ? "singleplayer" : "multiplayer");
      standaloneRenderModeHud();
      return true;
    }
    if(standaloneProfileRuntime.switchingMode) return false;
    standaloneProfileRuntime.switchingMode = true;
    try{
      if(current === "singleplayer" && wanted === "archipelago"){
        try{ standaloneUpsertCurrentSeedSave({ reason:"mode-switch-sp-to-mp" }); }catch(_){}
        try{
          if(ap?.inherentSeedActive){
            ap.inherentSeedActive = false;
            ap.connected = false;
            if(typeof setApIndicator === "function") setApIndicator("red", "OFFLINE");
            const host = document.getElementById("apConnectedHost");
            if(host) host.textContent = "DISCONNECTED";
            if(typeof updateApConnectButtons === "function") updateApConnectButtons("offline");
          }
        }catch(_){}
      }else if(current === "archipelago" && wanted === "singleplayer" && (hadSelectedMode || ap?.connected)){
        standaloneDisconnectForModeSwitch();
      }

      standaloneSetSelectedMode(wanted);
      setControlTab(wanted === "singleplayer" ? "singleplayer" : "multiplayer");

      if(wanted === "archipelago"){
        standaloneApplyMultiplayerSnapshot();
        if(!ap?.connected && !ap?.inherentSeedActive) standaloneMarkRandomizerClosed();
      }else if(!ap?.inherentSeedActive){
        standaloneMarkRandomizerClosed();
      }
      try{
        window.__flprStandaloneLastModeSwitch = {
          from: current,
          to: wanted,
          ts: Date.now(),
          selectedBefore: hadSelectedMode
        };
      }catch(_){}
      return true;
    }finally{
      standaloneProfileRuntime.switchingMode = false;
      try{ standaloneRenderModeHud(); }catch(_){}
    }
  }
  try{ window.flprStandaloneSwitchHomeMode = standaloneSwitchHomeMode; }catch(_){}

  function standaloneChooseMode(mode, event){
    if(event){
      event.preventDefault();
      event.stopPropagation();
      try{ event.stopImmediatePropagation(); }catch(_){}
    }
    const wanted = standaloneConnectionModeName(mode);
    const gate = standaloneEnsureModeGate();
    if(gate.classList.contains("choosing")) return false;
    try{ playClick(); }catch(_){}
    gate.classList.add("choosing");
    gate.querySelectorAll(".standaloneModeChoice").forEach((btn)=>{
      const active = standaloneConnectionModeName(btn.dataset.standaloneModeChoice || "") === wanted;
      btn.classList.toggle("selected", active);
      btn.disabled = true;
    });
    setTimeout(()=>{
      try{
        standaloneSwitchHomeMode(wanted, { fromGate:true });
        standaloneCloseModeGate();
      }catch(_){}
    }, 620);
    return false;
  }

  function standaloneSetSelectedMode(mode){
    standaloneProfileRuntime.selectedMode = standaloneConnectionModeName(mode);
    standaloneRenderMenuTabs(activeControlTab());
    standaloneRenderModeHud();
    standaloneRefreshProfileUi();
  }
  try{ window.flprStandaloneSetHomeMode = standaloneSwitchHomeMode; }catch(_){}

  function standaloneRandomizerReadyKey(){
    try{
      if(!standaloneProfileRuntime.randomizerReady) return "";
      return `${standaloneProfileRuntime.randomizerReason || "ready"}|${standaloneRewardSeedKey()}`;
    }catch(_){
      return standaloneProfileRuntime.randomizerReady ? "ready" : "";
    }
  }

  function standaloneShowClosedRandomizerDoor(message){
    try{
      const wrap = document.getElementById("randomizerIntro");
      const sign = document.getElementById("randomizerIntroSign");
      const btn = document.getElementById("randomizerIntroStartBtn");
      if(!wrap || !btn) return;
      wrap.classList.add("show", "flprStandaloneClosed");
      wrap.classList.remove("opening", "closing");
      wrap.setAttribute("aria-hidden", "false");
      if(sign) sign.textContent = message || "RANDOMIZER CLOSED";
      btn.disabled = true;
      btn.style.display = "";
      btn.textContent = "START!";
      try{
        const openingState = typeof getOpeningRandomizerPersistState === "function" ? getOpeningRandomizerPersistState() : null;
        if(openingState){
          openingState.visible = false;
          openingState.shownForSpoiler = false;
        }
      }catch(_){}
    }catch(_){}
  }

  function standaloneShowReadyRandomizerDoor(){
    if(standaloneProfileRuntime.randomizerStarted) return;
    try{
      const wrap = document.getElementById("randomizerIntro");
      const btn = document.getElementById("randomizerIntroStartBtn");
      if(wrap) wrap.classList.remove("flprStandaloneClosed");
      if(btn) btn.disabled = false;
      if(typeof showOpeningRandomizerIntro === "function"){
        const fx = window.__openingRandomizerFx || {};
        const key = standaloneRandomizerReadyKey();
        if(standaloneProfileRuntime.readyDoorKey === key && (fx.active || wrap?.classList?.contains("show"))) return;
        standaloneProfileRuntime.readyDoorKey = key;
        showOpeningRandomizerIntro({ reason:"standalone-home-ready", playSound:false });
      }
    }catch(_){}
  }

  function standaloneMarkRandomizerReady(reason){
    const active = standaloneActiveProfile();
    if(!active) return;
    const nextReason = String(reason || standaloneProfileRuntime.selectedMode || "ready");
    const wasReady = !!standaloneProfileRuntime.randomizerReady;
    const reasonChanged = String(standaloneProfileRuntime.randomizerReason || "") !== nextReason;
    standaloneProfileRuntime.randomizerReady = true;
    if(!wasReady || reasonChanged) standaloneProfileRuntime.randomizerStarted = false;
    standaloneProfileRuntime.randomizerReason = nextReason;
    standaloneShowReadyRandomizerDoor();
    standaloneRefreshProfileUi();
  }

  function standaloneRandomizerDoorIsOpen(){
    try{
      if(!standaloneProfileRuntime.randomizerReady || !standaloneProfileRuntime.randomizerStarted) return false;
      const fx = window.__openingRandomizerFx || {};
      if(fx.active || fx.opening || fx.closing) return false;
      const wrap = document.getElementById("randomizerIntro");
      if(wrap && (wrap.classList.contains("show") || wrap.classList.contains("opening") || wrap.classList.contains("closing"))) return false;
      return true;
    }catch(_){
      return !!standaloneProfileRuntime.randomizerStarted;
    }
  }

  function standaloneSetBossIncomingGateState(patch){
    try{
      window.__flprStandaloneBossIncomingGateState = {
        pending:!!standaloneBossIncomingGate.pending,
        ms:Number(standaloneBossIncomingGate.ms || 0),
        reason:String(standaloneBossIncomingGate.reason || ""),
        ts:Number(standaloneBossIncomingGate.ts || 0),
        doorOpen:standaloneRandomizerDoorIsOpen(),
        seedKey:standaloneBossIncomingSeedKey(),
        seen:standaloneBossIncomingHasPlayed(),
        ...patch
      };
    }catch(_){}
  }

  function standaloneSuppressBossIncomingIfSeen(reason){
    try{
      const seen = standaloneBossIncomingSeenRecord();
      if(!seen) return false;
      standaloneBossIncomingGate.pending = false;
      standaloneBossIncomingGate.ms = 0;
      standaloneBossIncomingGate.reason = "already-played";
      standaloneBossIncomingGate.lastSuppressedAt = Date.now();
      standaloneBossIncomingGate.lastSuppressedReason = String(reason || "already-played");
      standaloneSetBossIncomingGateState({
        pending:false,
        suppressedSeen:true,
        seen:true,
        record:seen.record,
        reason:String(reason || "already-played"),
        ts:Date.now()
      });
      try{ updateBossThreatIndicators(); }catch(_){}
      return true;
    }catch(_){
      return false;
    }
  }

  function standaloneEnsureBossIncomingThreatDelay(ms){
    try{
      try{
        state.bossOpen = true;
        const bossWorldKey = typeof getBossWorldKey === "function" ? String(getBossWorldKey() || "boss") : "boss";
        state.worlds = state.worlds || {};
        state.worlds[bossWorldKey] = state.worlds[bossWorldKey] || { tables:["Boss Table"] };
        state.worlds[bossWorldKey].locked = false;
      }catch(_){}
      const duration = Math.max(1800, Number(ms) || 4800);
      const current = Number(window.__bossThreatDelayUntil || 0);
      const wanted = Date.now() + duration + 980;
      if(!Number.isFinite(current) || current < wanted - 240){
        window.__bossThreatDelayUntil = wanted;
      }
    }catch(_){}
  }

  function standaloneQueueBossIncomingAlert(ms, reason){
    if(standaloneSuppressBossIncomingIfSeen(reason || "queue-already-played")) return false;
    standaloneBossIncomingGate.pending = true;
    standaloneBossIncomingGate.ms = Math.max(Number(standaloneBossIncomingGate.ms || 0) || 0, Number(ms || 0) || 0);
    standaloneBossIncomingGate.ts = Date.now();
    standaloneBossIncomingGate.reason = String(reason || "randomizer-door-closed");
    standaloneSetBossIncomingGateState({ pending:true, doorOpen:false });
    return false;
  }

  function standaloneFlushBossIncomingAlertIfReady(reason){
    try{
      if(!standaloneBossIncomingGate.pending) return false;
      if(!standaloneRandomizerDoorIsOpen()) return false;
      if(standaloneSuppressBossIncomingIfSeen(reason || "flush-already-played")) return false;
      const original = standaloneBossIncomingGate.original || window.startBossIncomingAlert;
      if(typeof original !== "function" || original.__flprStandaloneBossIncomingGateBridge) return false;
      const ms = standaloneBossIncomingGate.ms || 5200;
      standaloneBossIncomingGate.pending = false;
      standaloneBossIncomingGate.ms = 0;
      standaloneBossIncomingGate.reason = "";
      original.call(window, ms);
      standaloneEnsureBossIncomingThreatDelay(ms);
      standaloneMarkBossIncomingPlayed(reason || "door-open");
      standaloneSetBossIncomingGateState({
        pending:false,
        flushed:true,
        ms,
        reason:String(reason || "door-open"),
        ts:Date.now(),
        doorOpen:true,
        seen:true
      });
      return true;
    }catch(_){
      return false;
    }
  }

  function standaloneScheduleBossIncomingGateFlush(reason){
    try{
      (standaloneBossIncomingGate.flushTimers || []).forEach((timer)=>clearTimeout(timer));
      standaloneBossIncomingGate.flushTimers = [];
    }catch(_){}
    [0, 120, 720, 1560, 2380, 3060].forEach((delay)=>{
      const timer = setTimeout(()=>{
        try{
          standaloneBossIncomingGate.flushTimers = standaloneBossIncomingGate.flushTimers.filter((item)=>item !== timer);
        }catch(_){}
        standaloneFlushBossIncomingAlertIfReady(reason || "scheduled");
      }, delay);
      standaloneBossIncomingGate.flushTimers.push(timer);
    });
  }

  function installStandaloneBossIncomingGateBridge(){
    try{
      const original = window.startBossIncomingAlert || (typeof startBossIncomingAlert === "function" ? startBossIncomingAlert : null);
      if(!original){
        setTimeout(installStandaloneBossIncomingGateBridge, 120);
        return;
      }
      if(original.__flprStandaloneBossIncomingGateBridge) return;
      standaloneBossIncomingGate.original = original;
      const bridged = function standaloneStartBossIncomingAlertGateBridge(ms){
        if(standaloneSuppressBossIncomingIfSeen("direct-already-played")) return false;
        if(!standaloneRandomizerDoorIsOpen()){
          standaloneQueueBossIncomingAlert(ms, "boss-incoming-before-door-open");
          standaloneScheduleBossIncomingGateFlush("boss-incoming-queued");
          return false;
        }
        const result = original.apply(this, arguments);
        standaloneEnsureBossIncomingThreatDelay(ms);
        standaloneMarkBossIncomingPlayed("direct");
        standaloneSetBossIncomingGateState({
          pending:false,
          played:true,
          ms:Number(ms || 0),
          reason:"direct",
          ts:Date.now(),
          doorOpen:true,
          seen:true
        });
        return result;
      };
      bridged.__flprStandaloneBossIncomingGateBridge = true;
      bridged.__flprStandaloneOriginalStartBossIncomingAlert = original;
      window.startBossIncomingAlert = bridged;
      try{ startBossIncomingAlert = bridged; }catch(_){}
      try{
        window.flprStandaloneBossIncomingGateState = function(){
          return {
            pending:!!standaloneBossIncomingGate.pending,
            ms:Number(standaloneBossIncomingGate.ms || 0),
            reason:String(standaloneBossIncomingGate.reason || ""),
            doorOpen:standaloneRandomizerDoorIsOpen(),
            randomizerReady:!!standaloneProfileRuntime.randomizerReady,
            randomizerStarted:!!standaloneProfileRuntime.randomizerStarted,
            introActive:!!window.__openingRandomizerFx?.active,
            introOpening:!!window.__openingRandomizerFx?.opening,
            seedKey:standaloneBossIncomingSeedKey(),
            seen:standaloneBossIncomingHasPlayed(),
            suppressedSeen:!!standaloneBossIncomingGate.lastSuppressedAt,
            lastSuppressedAt:Number(standaloneBossIncomingGate.lastSuppressedAt || 0),
            lastSuppressedReason:String(standaloneBossIncomingGate.lastSuppressedReason || "")
          };
        };
        window.flprStandaloneFlushBossIncomingGateForTest = standaloneFlushBossIncomingAlertIfReady;
        window.flprStandaloneClearBossIncomingSeenForTest = standaloneClearBossIncomingSeenForTest;
        window.flprStandaloneMarkBossIncomingSeenForTest = standaloneMarkBossIncomingPlayed;
      }catch(_){}
    }catch(_){}
  }

  function standaloneMarkRandomizerClosed(){
    standaloneProfileRuntime.randomizerReady = false;
    standaloneProfileRuntime.randomizerStarted = false;
    standaloneProfileRuntime.randomizerReason = "";
    standaloneProfileRuntime.readyDoorKey = "";
    standaloneBossIncomingGate.pending = false;
    standaloneBossIncomingGate.ms = 0;
    standaloneBossIncomingGate.reason = "";
    try{
      (standaloneBossIncomingGate.flushTimers || []).forEach((timer)=>clearTimeout(timer));
      standaloneBossIncomingGate.flushTimers = [];
    }catch(_){}
    standaloneRefreshProfileUi();
  }

  function standaloneRefreshRandomizerGate(){
    const active = standaloneActiveProfile();
    const body = document.body;
    if(!body) return;
    const hasProfile = !!active;
    const modePicked = !!standaloneProfileRuntime.selectedMode;
    body.classList.toggle("flprStandaloneNeedsProfile", !hasProfile);
    body.classList.toggle("flprStandaloneModePicking", hasProfile && !modePicked && !standaloneProfileRuntime.randomizerReady);
    body.classList.toggle("flprStandaloneRandomizerClosed", hasProfile && !standaloneProfileRuntime.randomizerReady);
    body.classList.toggle("flprStandaloneRandomizerReady", hasProfile && standaloneProfileRuntime.randomizerReady);
    standaloneFlushBossKeysIfNoLoadedSeed();
    if(!hasProfile){
      standaloneShowClosedRandomizerDoor("CREATE HOME PROFILE");
      standaloneCloseModeGate();
      standaloneOpenProfileGate(false);
      return;
    }
    standaloneCloseProfileGate({ auto:true });
    if(!standaloneProfileRuntime.randomizerReady){
      const message = modePicked
        ? (standaloneProfileRuntime.selectedMode === "singleplayer" ? "START A LOCAL SEED" : "CONNECT TO ARCHIPELAGO")
        : "CHOOSE A MODE";
      standaloneShowClosedRandomizerDoor(message);
      if(!modePicked) standaloneOpenModeGate(false);
      else standaloneCloseModeGate();
    }else{
      standaloneCloseModeGate();
      standaloneShowReadyRandomizerDoor();
    }
  }

  function standaloneRefreshProfileUi(){
    let sig = "";
    try{
      const active = standaloneActiveProfile();
      sig = JSON.stringify({
        profile: active?.id || "",
        mode: standaloneProfileRuntime.selectedMode || "",
        ready: !!standaloneProfileRuntime.randomizerReady,
        started: !!standaloneProfileRuntime.randomizerStarted,
        reason: standaloneProfileRuntime.randomizerReason || "",
        seed: ap?.seedName || "",
        checked: ap?.checked?.size || 0,
        connected: !!ap?.connected,
        inherent: !!ap?.inherentSeedActive,
        activeTab: document.querySelector(".controlsTabBtn.active")?.dataset?.ctrlTab || ""
      });
      const now = Date.now();
      if(sig === standalonePerformanceRuntime.lastProfileUiSig && (now - standalonePerformanceRuntime.lastProfileUiAt) < 1500){
        standaloneRefreshRandomizerGate();
        try{ standalonePositionModeHud(); standalonePositionModeSwitchHud(); }catch(_){}
        return;
      }
      standalonePerformanceRuntime.lastProfileUiSig = sig;
      standalonePerformanceRuntime.lastProfileUiAt = now;
    }catch(_){}
    standaloneRenderProfileHud();
    standaloneRenderModeHud();
    standaloneRenderSeedSaveList();
    standaloneRenderNextAchievement();
    standaloneRenderRunBriefing();
    standaloneRefreshRandomizerGate();
  }

  function standaloneEnsureActiveProfileApplied(){
    const active = standaloneActiveProfile();
    if(!active){
      standaloneProfileRuntime.appliedProfileId = "";
      return;
    }
    if(standaloneProfileRuntime.appliedProfileId === active.id) return;
    standaloneProfileRuntime.appliedProfileId = active.id;
    standaloneApplyProfileSnapshots(active);
  }

  function installStandaloneAchievementProfileBridge(){
    try{
      if(typeof achSaveStore === "function" && achSaveStore.__flprStandaloneProfileBridge !== true){
        const original = achSaveStore;
        const bridged = function standaloneAchSaveStoreBridge(){
          const result = original.apply(this, arguments);
          try{ standaloneCaptureActiveProfileSnapshots(); }catch(_){}
          try{ standaloneRenderNextAchievement(); }catch(_){}
          try{ standaloneRenderRunBriefing(); }catch(_){}
          return result;
        };
        bridged.__flprStandaloneProfileBridge = true;
        bridged.__flprStandaloneOriginalAchSaveStore = original;
        achSaveStore = bridged;
        try{ window.achSaveStore = bridged; }catch(_){}
      }
    }catch(_){}
    try{
      if(typeof renderAchievementsControlsPanel === "function" && renderAchievementsControlsPanel.__flprStandaloneProfileBridge !== true){
        const originalRenderAchievements = renderAchievementsControlsPanel;
        const bridgedRenderAchievements = function standaloneRenderAchievementsControlsPanelBridge(){
          const result = originalRenderAchievements.apply(this, arguments);
          try{ standaloneRenderNextAchievement(); }catch(_){}
          return result;
        };
        bridgedRenderAchievements.__flprStandaloneProfileBridge = true;
        bridgedRenderAchievements.__flprStandaloneOriginalRenderAchievementsControlsPanel = originalRenderAchievements;
        renderAchievementsControlsPanel = bridgedRenderAchievements;
        try{ window.renderAchievementsControlsPanel = bridgedRenderAchievements; }catch(_){}
      }
    }catch(_){}
    try{
      if(!window.__flprStandaloneEpisodeDisabled && typeof episodeSaveState === "function" && episodeSaveState.__flprStandaloneProfileBridge !== true){
        const originalEpisodeSave = episodeSaveState;
        const bridgedEpisodeSave = function standaloneEpisodeSaveStateBridge(){
          const result = originalEpisodeSave.apply(this, arguments);
          try{ standaloneCaptureActiveProfileSnapshots(); }catch(_){}
          return result;
        };
        bridgedEpisodeSave.__flprStandaloneProfileBridge = true;
        bridgedEpisodeSave.__flprStandaloneOriginalEpisodeSaveState = originalEpisodeSave;
        episodeSaveState = bridgedEpisodeSave;
        try{ window.episodeSaveState = bridgedEpisodeSave; }catch(_){}
      }
    }catch(_){}
    try{
      if(typeof handleCheckedLocations === "function" && handleCheckedLocations.__flprStandaloneSeedSaveBridge !== true){
        const originalChecked = handleCheckedLocations;
        const bridgedChecked = function standaloneHandleCheckedLocationsBridge(){
          const result = originalChecked.apply(this, arguments);
          try{ standaloneUpsertCurrentSeedSave({ reason:"checked" }); }catch(_){}
          try{ standaloneRenderNextAchievement(); }catch(_){}
          try{ standaloneRenderRunBriefing(); }catch(_){}
          return result;
        };
        bridgedChecked.__flprStandaloneSeedSaveBridge = true;
        bridgedChecked.__flprStandaloneOriginalHandleCheckedLocations = originalChecked;
        handleCheckedLocations = bridgedChecked;
        try{ window.handleCheckedLocations = bridgedChecked; }catch(_){}
      }
    }catch(_){}
  }

  function installStandaloneBossVictoryAwardFilterBridge(){
    let installedAny = false;
    let installedHandle = false;

    try{
      const original = window.flprStatsRecordCheckClearedByLocId || (typeof flprStatsRecordCheckClearedByLocId === "function" ? flprStatsRecordCheckClearedByLocId : null);
      if(original && !original.__flprStandaloneBossVictoryAwardFilter){
        const bridged = function standaloneFlprStatsRecordCheckClearedBossVictoryFilter(locId){
          if(standaloneIsBossVictoryAutoCheckId(locId)){
            try{
              window.__flprStandaloneLastBossVictoryAwardSkip = {
                kind:"stats",
                locId:Number(locId),
                ts:Date.now()
              };
            }catch(_){}
            return false;
          }
          return original.apply(this, arguments);
        };
        bridged.__flprStandaloneBossVictoryAwardFilter = true;
        bridged.__flprStandaloneOriginalFlprStatsRecordCheckClearedByLocId = original;
        flprStatsRecordCheckClearedByLocId = bridged;
        try{ window.flprStatsRecordCheckClearedByLocId = bridged; }catch(_){}
      }
      if(window.flprStatsRecordCheckClearedByLocId || typeof flprStatsRecordCheckClearedByLocId === "function") installedAny = true;
    }catch(_){}

    try{
      const original = window.achGetContextForLocId || (typeof achGetContextForLocId === "function" ? achGetContextForLocId : null);
      if(original && !original.__flprStandaloneBossVictoryAwardFilter){
        const bridged = function standaloneAchGetContextBossVictoryFilter(locId){
          if(standaloneIsBossVictoryAutoCheckId(locId)){
            try{
              window.__flprStandaloneLastBossVictoryAwardSkip = {
                kind:"achievement-context",
                locId:Number(locId),
                ts:Date.now()
              };
            }catch(_){}
            return null;
          }
          return original.apply(this, arguments);
        };
        bridged.__flprStandaloneBossVictoryAwardFilter = true;
        bridged.__flprStandaloneOriginalAchGetContextForLocId = original;
        achGetContextForLocId = bridged;
        try{ window.achGetContextForLocId = bridged; }catch(_){}
      }
      if(window.achGetContextForLocId || typeof achGetContextForLocId === "function") installedAny = true;
    }catch(_){}

    try{
      const original = window.achHandleCheckCleared || (typeof achHandleCheckCleared === "function" ? achHandleCheckCleared : null);
      if(original && !original.__flprStandaloneBossVictoryAwardFilter){
        const bridged = function standaloneAchHandleCheckClearedBossVictoryFilter(locId){
          if(standaloneIsBossVictoryAutoCheckId(locId)){
            try{
              window.__flprStandaloneLastBossVictoryAwardSkip = {
                kind:"achievement-handle",
                locId:Number(locId),
                ts:Date.now()
              };
            }catch(_){}
            return false;
          }
          return original.apply(this, arguments);
        };
        bridged.__flprStandaloneBossVictoryAwardFilter = true;
        bridged.__flprStandaloneOriginalAchHandleCheckCleared = original;
        achHandleCheckCleared = bridged;
        try{ window.achHandleCheckCleared = bridged; }catch(_){}
      }
      if(window.achHandleCheckCleared || typeof achHandleCheckCleared === "function") installedAny = true;
    }catch(_){}

    try{
      const original = window.handleCheckedLocations || (typeof handleCheckedLocations === "function" ? handleCheckedLocations : null);
      if(original && !original.__flprStandaloneBossVictoryAwardFilter){
        const bridged = function standaloneHandleCheckedLocationsBossVictoryFilter(list, opts){
          const autoIds = standaloneBossVictoryAutoIdsFromCheckedList(list, opts || {});
          if(!autoIds.length) return original.apply(this, arguments);
          standaloneMarkBossVictoryAutoCheckIds(autoIds, String(opts?.source || "checked-locations"));
          const autoSet = new Set(autoIds.map((id)=>Number(id)));
          const qualified = [];
          const autoOnly = [];
          (Array.isArray(list) ? list : []).forEach((rawId)=>{
            const id = Number(rawId);
            if(autoSet.has(id)) autoOnly.push(rawId);
            else qualified.push(rawId);
          });
          let changed = false;
          if(qualified.length){
            changed = !!original.call(this, qualified, opts || {});
          }
          if(autoOnly.length){
            changed = !!original.call(this, autoOnly, {
              ...(opts || {}),
              awardAchievements:false,
              source:`${String(opts?.source || "checked-locations")}:boss-victory-auto`,
              __flprStandaloneBossVictoryAuto:true
            }) || changed;
          }
          try{
            window.__flprStandaloneLastBossVictoryAutoSplit = {
              autoIds,
              qualified:qualified.map((id)=>Number(id)).filter((id)=>Number.isFinite(id)),
              source:String(opts?.source || ""),
              ts:Date.now()
            };
          }catch(_){}
          return changed;
        };
        bridged.__flprStandaloneBossVictoryAwardFilter = true;
        bridged.__flprStandaloneOriginalHandleCheckedLocations = original;
        handleCheckedLocations = bridged;
        try{ window.handleCheckedLocations = bridged; }catch(_){}
      }
      const activeHandle = window.handleCheckedLocations || (typeof handleCheckedLocations === "function" ? handleCheckedLocations : null);
      if(activeHandle) installedAny = true;
      if(activeHandle && activeHandle.__flprStandaloneBossVictoryAwardFilter === true) installedHandle = true;
    }catch(_){}

    try{
      window.flprStandaloneBossVictoryAutoCheckState = function(){
        const set = standaloneBossVictoryAutoCheckIds();
        return {
          seedKey:standaloneRewardSeedKey(),
          ids:Array.from(set).sort((a, b)=>a - b),
          lastSplit:window.__flprStandaloneLastBossVictoryAutoSplit || null,
          lastSkip:window.__flprStandaloneLastBossVictoryAwardSkip || null
        };
      };
      window.flprStandaloneClearBossVictoryAutoChecksForTest = function(){
        const saved = standaloneSaveBossVictoryAutoCheckState({ ids:[] });
        return saved;
      };
      window.flprStandaloneDetectBossVictoryAutoIdsForTest = function(list, opts){
        return standaloneBossVictoryAutoIdsFromCheckedList(list, opts || {});
      };
      window.flprStandaloneBossVictoryAutoDebugForTest = function(list, opts){
        const ids = (Array.isArray(list) ? list : []).map((id)=>Number(id)).filter((id)=>Number.isFinite(id) && id > 0);
        return {
          ids: ids.map((id)=>{
            const node = standaloneBossNodeForLocationId(id);
            return {
              id,
              node: node ? { full:String(node.full || ""), short:String(node.short || ""), tableName:String(node.tableName || ""), standaloneBossCheck:!!node.standaloneBossCheck } : null,
              victory:standaloneIsBossVictoryLocationId(id),
              bossNonVictory:standaloneIsBossNonVictoryLocationId(id),
              pending:standaloneIsDirectPendingLocationId(id),
              checked:!!ap?.checked?.has?.(id),
              auto:standaloneIsBossVictoryAutoCheckId(id)
            };
          }),
          victoryAlreadyComplete:standaloneBossVictoryAlreadyComplete(),
          detected:standaloneBossVictoryAutoIdsFromCheckedList(list, opts || {})
        };
      };
    }catch(_){}

    if(!installedAny || !installedHandle) setTimeout(installStandaloneBossVictoryAwardFilterBridge, 120);
  }

  function installStandaloneAchievementDismissBridge(){
    const decorateToast = (node)=>{
      try{
        if(!node || node.nodeType !== 1 || !node.classList?.contains("achievementToast")) return;
        if(node.querySelector(".achievementToastClose")) return;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "achievementToastClose";
        btn.setAttribute("aria-label", "Dismiss achievement notification");
        btn.textContent = "X";
        btn.addEventListener("click", (event)=>{
          event.preventDefault();
          event.stopPropagation();
          try{ if(typeof achDismissActiveToast === "function") achDismissActiveToast(); else node.remove(); }catch(_){ try{ node.remove(); }catch(__){} }
          try{ if(typeof achPumpQueue === "function") achPumpQueue(); }catch(_){}
        }, true);
        node.appendChild(btn);
      }catch(_){}
    };
    const decorateModal = ()=>{
      try{
        const card = document.querySelector("#achievementModal .achievementModalCard");
        if(!card || card.querySelector(".achievementModalClose")) return;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "achievementModalClose";
        btn.setAttribute("aria-label", "Dismiss achievement details");
        btn.textContent = "X";
        btn.addEventListener("click", (event)=>{
          event.preventDefault();
          event.stopPropagation();
          try{ if(typeof achHideModal === "function") achHideModal(); else document.getElementById("achievementModal")?.classList.add("hidden"); }catch(_){}
        }, true);
        card.appendChild(btn);
      }catch(_){}
    };
    try{ document.querySelectorAll(".achievementToast").forEach(decorateToast); }catch(_){}
    decorateModal();
    const stack = document.getElementById("achievementStack");
    if(stack && stack.__flprStandaloneDismissObserver !== true){
      stack.__flprStandaloneDismissObserver = true;
      const obs = new MutationObserver((mutations)=>{
        mutations.forEach((mutation)=>{
          Array.from(mutation.addedNodes || []).forEach(decorateToast);
        });
      });
      obs.observe(stack, { childList:true });
    }
  }

  function installStandaloneRandomizerConnectionBridge(){
    try{
      if(typeof updateApConnectButtons === "function" && updateApConnectButtons.__flprStandaloneRandomizerGateBridge !== true){
        const original = updateApConnectButtons;
        const bridged = function standaloneUpdateApConnectButtonsBridge(stateName){
          const result = original.apply(this, arguments);
          try{
            const status = String(stateName || "").toLowerCase();
            if(status === "connected"){
              if(!standaloneProfileRuntime.selectedMode) standaloneProfileRuntime.selectedMode = ap?.inherentSeedActive ? "singleplayer" : "archipelago";
              standaloneMarkRandomizerReady(ap?.inherentSeedActive ? "singleplayer" : "archipelago");
            }else if(status === "offline" || status === "disconnected"){
              if(!ap?.inherentSeedActive) standaloneMarkRandomizerClosed();
            }
          }catch(_){}
          return result;
        };
        bridged.__flprStandaloneRandomizerGateBridge = true;
        bridged.__flprStandaloneOriginalUpdateApConnectButtons = original;
        updateApConnectButtons = bridged;
        try{ window.updateApConnectButtons = bridged; }catch(_){}
      }
    }catch(_){}
    if(!standaloneProfileRuntime.gateTimer){
      standaloneProfileRuntime.gateTimer = setInterval(()=>{
        try{
          if(ap?.connected || ap?.inherentSeedActive){
            if(ap?.inherentSeedActive || standaloneProfileRuntime.selectedMode === "archipelago"){
              standaloneMarkRandomizerReady(ap?.inherentSeedActive ? "singleplayer" : "archipelago");
            }
          }else if(standaloneProfileRuntime.randomizerReady && !ap?.connected && !ap?.inherentSeedActive){
            standaloneMarkRandomizerClosed();
          }else{
            standaloneRefreshProfileUi();
          }
          const now = Date.now();
          if(!standalonePerformanceRuntime.pendingSeedSaveTimer && (now - Number(standalonePerformanceRuntime.lastGateSeedSaveAt || 0)) >= 15000){
            standalonePerformanceRuntime.lastGateSeedSaveAt = now;
            standaloneScheduleSeedSave({ reason:"poll" }, 900);
          }
        }catch(_){}
      }, 2500);
    }
    if(!window.__flprStandaloneRandomizerStartGateBound){
      window.__flprStandaloneRandomizerStartGateBound = true;
      document.addEventListener("click", (event)=>{
        const start = event.target.closest?.("#randomizerIntroStartBtn");
        if(!start) return;
        const hasProfile = !!standaloneActiveProfile();
        if(!hasProfile || !standaloneProfileRuntime.randomizerReady){
          event.preventDefault();
          event.stopPropagation();
          try{ event.stopImmediatePropagation(); }catch(_){}
          try{ if(typeof toast === "function") toast("warn", "RANDOMIZER CLOSED", hasProfile ? "Connect to Archipelago or start a local seed first." : "Create a Home profile first.", 2500); }catch(_){}
          return;
        }
        standaloneProfileRuntime.randomizerStarted = true;
        standaloneRefreshProfileUi();
        standaloneScheduleBossIncomingGateFlush("randomizer-door-started");
      }, true);
    }
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

  function buildStandaloneLogoDock(){
    const dock = document.createElement("section");
    dock.id = "standaloneLogoDock";
    dock.className = "standaloneLogoDock ctrlCard";
    dock.dataset.accent = "gold";
    dock.innerHTML = `
      <div class="standaloneLogoCardTitle">
        <div class="cSectionTitle">ADVANCED LAYOUT</div>
        <span class="mini">logo position</span>
      </div>
      <button class="cBtn" id="standaloneLogoDevToggle" type="button">LOGO POSITION</button>
      <div class="standaloneLogoDevPanel" id="standaloneLogoDevPanel" hidden>
        <div class="standaloneLogoActions">
          <label class="standaloneLogoLockRow">
            <input id="standaloneLogoLockToggle" type="checkbox">
            <span class="cLabel">LOCK LOGO IN PLACE</span>
          </label>
          <button class="cBtn" id="standaloneLogoResetBtn" type="button">RESET</button>
        </div>
        <div class="apHint" id="standaloneLogoStatus">Unlock, drag the Flippermizer logo, then lock it where you want it.</div>
      </div>
    `;
    return dock;
  }

  function buildStandaloneRendererDock(){
    const dock = document.createElement("section");
    dock.id = "standaloneRendererDock";
    dock.className = "standaloneRendererDock standaloneControlSection";
    dock.dataset.accent = "gold";
    dock.innerHTML = `
      <div class="standaloneSectionTitle">
        <span class="standaloneDockTitleText">RENDERER <span class="mini">restart required</span></span>
        <button class="standaloneDockCollapseBtn" id="standaloneRendererDockCollapseBtn" type="button">HIDE</button>
      </div>
      <div class="standaloneRendererGrid">
        <label class="standaloneRendererRow">
          <input id="standaloneHardwareAccelToggle" type="checkbox" checked>
          <span class="cLabel">HARDWARE ACCELERATION</span>
        </label>
        <label class="standaloneRendererRow">
          <span class="cLabel">BACKEND</span>
          <select id="standaloneRendererBackend" class="cInput">
            <option value="default">AUTO / DIRECT3D</option>
            <option value="vulkan">VULKAN / ANGLE</option>
          </select>
        </label>
      </div>
      <div class="apHint standaloneRendererStatus" id="standaloneRendererStatus">Renderer settings loading.</div>
      <div class="standaloneRendererActions">
        <button class="cBtn" id="standaloneRendererSaveBtn" type="button">SAVE RENDERER SETTINGS</button>
        <button class="cBtn danger" id="standaloneRendererRelaunchBtn" type="button">RELAUNCH APP</button>
      </div>
    `;
    return dock;
  }

  function standaloneDockCollapseStorageKey(dock){
    const id = String(dock?.id || "").trim();
    return id ? `flpr_standalone_${id}_collapsed_v1` : "";
  }

  function standaloneSetDockCollapsed(dock, collapsed, opts){
    if(!dock) return;
    const next = !!collapsed;
    dock.classList.toggle("is-standalone-collapsed", next);
    dock.setAttribute("aria-expanded", next ? "false" : "true");
    const btn = dock.querySelector(":scope > .standaloneSectionTitle .standaloneDockCollapseBtn");
    if(btn){
      btn.textContent = next ? "SHOW" : "HIDE";
      btn.title = next ? "Show this panel" : "Hide this panel";
      btn.setAttribute("aria-pressed", next ? "true" : "false");
    }
    const key = standaloneDockCollapseStorageKey(dock);
    if(key && (!opts || opts.persist !== false)){
      try{ localStorage.setItem(key, next ? "1" : "0"); }catch(_){}
    }
  }

  function standaloneBindDockCollapse(dock, defaultCollapsed){
    if(!dock) return;
    const key = standaloneDockCollapseStorageKey(dock);
    let collapsed = !!defaultCollapsed;
    try{
      const saved = key ? localStorage.getItem(key) : null;
      if(saved === "1" || saved === "0") collapsed = saved === "1";
    }catch(_){}
    standaloneSetDockCollapsed(dock, collapsed, { persist:false });
    const btn = dock.querySelector(":scope > .standaloneSectionTitle .standaloneDockCollapseBtn");
    if(btn && !btn.__flprStandaloneDockCollapseBound){
      btn.__flprStandaloneDockCollapseBound = true;
      btn.addEventListener("click", (event)=>{
        event.preventDefault();
        event.stopPropagation();
        try{ playClick(); }catch(_){}
        standaloneSetDockCollapsed(dock, !dock.classList.contains("is-standalone-collapsed"));
      });
    }
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

  function ensureStandaloneRendererControls(panel){
    if(!panel) return;
    try{
      document.querySelectorAll("#standaloneRendererDock").forEach((dock)=>{
        if(panel.contains(dock)) return;
        dock.remove();
      });
      let dock = panel.querySelector("#standaloneRendererDock");
      panel.querySelectorAll("#standaloneRendererDock").forEach((node, index)=>{
        if(index === 0) dock = node;
        else node.remove();
      });
      if(!dock) dock = buildStandaloneRendererDock();
      const stack = panel.querySelector(":scope > .tabSectionStack") || panel;
      if(dock.parentElement !== stack) stack.appendChild(dock);
      else stack.insertBefore(dock, stack.firstChild || null);
      standaloneBindDockCollapse(dock, false);
    }catch(_){}
  }

  function ensureStandaloneLogoControls(panel){
    if(!panel) return;
    try{
      document.querySelectorAll("#standaloneLogoDock").forEach((dock)=>{
        if(panel.contains(dock)) return;
        dock.remove();
      });
      let dock = panel.querySelector("#standaloneLogoDock");
      panel.querySelectorAll("#standaloneLogoDock").forEach((node, index)=>{
        if(index === 0) dock = node;
        else node.remove();
      });
      if(!dock) dock = buildStandaloneLogoDock();
      const devTools = panel.querySelector('.connectPanelSection[data-panel-key="visual-dev-tools"]');
      const stack = devTools || panel.querySelector(":scope > .tabSectionStack") || panel;
      if(dock.parentElement !== stack) stack.appendChild(dock);
      else stack.appendChild(dock);
      if(devTools && typeof ensureDevToolsPasswordGate === "function") ensureDevToolsPasswordGate(devTools);
      standaloneSyncLogoControls();
    }catch(_){}
  }

  function standaloneSyncLogoControls(){
    try{
      const toggle = document.getElementById("standaloneLogoLockToggle");
      if(toggle) toggle.checked = standaloneSettings.logoLocked !== false;
      const status = document.getElementById("standaloneLogoStatus");
      if(status){
        status.textContent = standaloneSettings.logoLocked === false
          ? "Logo unlocked. Drag it into place, then turn the lock back on."
          : "Logo locked. Unlock to drag the Flippermizer logo.";
      }
      standalonePositionModeHud();
    }catch(_){}
  }

  function bindStandaloneLogoControls(){
    const devToggle = document.getElementById("standaloneLogoDevToggle");
    const devPanel = document.getElementById("standaloneLogoDevPanel");
    const toggle = document.getElementById("standaloneLogoLockToggle");
    const reset = document.getElementById("standaloneLogoResetBtn");
    if(devToggle && devPanel && !devToggle.__flprStandaloneLogoBound){
      devToggle.__flprStandaloneLogoBound = true;
      devToggle.addEventListener("click", (event)=>{
        event.preventDefault();
        devPanel.hidden = !devPanel.hidden;
        devToggle.classList.toggle("active", !devPanel.hidden);
        devToggle.setAttribute("aria-expanded", devPanel.hidden ? "false" : "true");
        if(!devPanel.hidden) standaloneSyncLogoControls();
        try{ playClick(); }catch(_){}
      });
      devToggle.setAttribute("aria-expanded", devPanel.hidden ? "false" : "true");
    }
    if(toggle && !toggle.__flprStandaloneLogoBound){
      toggle.__flprStandaloneLogoBound = true;
      toggle.addEventListener("change", ()=>{
        standaloneSettings.logoLocked = !!toggle.checked;
        saveSettings(standaloneSettings);
        standaloneSyncLogoControls();
        try{ playClick(); }catch(_){}
      });
    }
    if(reset && !reset.__flprStandaloneLogoBound){
      reset.__flprStandaloneLogoBound = true;
      reset.addEventListener("click", (event)=>{
        event.preventDefault();
        standaloneSettings.logoX = null;
        standaloneSettings.logoY = null;
        saveSettings(standaloneSettings);
        standalonePositionModeHud();
        standaloneSyncLogoControls();
        try{ playClick(); }catch(_){}
      });
    }
    standaloneSyncLogoControls();
  }

  function standaloneRendererApi(){
    try{
      const api = window.flprStandaloneElectron;
      if(api && typeof api.getRendererSettings === "function" && typeof api.setRendererSettings === "function") return api;
    }catch(_){}
    return null;
  }

  function standaloneRendererFormValues(){
    const hardware = document.getElementById("standaloneHardwareAccelToggle");
    const backend = document.getElementById("standaloneRendererBackend");
    return {
      hardwareAcceleration: hardware ? !!hardware.checked : true,
      renderer: String(backend?.value || "default") === "vulkan" ? "vulkan" : "default"
    };
  }

  function standaloneSetRendererStatus(message, restartRequired){
    const status = document.getElementById("standaloneRendererStatus");
    if(!status) return;
    status.textContent = String(message || "");
    status.classList.toggle("restartRequired", !!restartRequired);
  }

  function standaloneApplyRendererResponse(response){
    standaloneRendererControls.loaded = true;
    standaloneRendererControls.response = response || null;
    const settings = response?.settings || {};
    const applied = response?.applied || settings;
    const hardware = document.getElementById("standaloneHardwareAccelToggle");
    const backend = document.getElementById("standaloneRendererBackend");
    if(hardware) hardware.checked = settings.hardwareAcceleration !== false;
    if(backend) backend.value = String(settings.renderer || "default") === "vulkan" ? "vulkan" : "default";
    try{ document.getElementById("standaloneRendererDock")?.setAttribute("data-renderer-loaded", "1"); }catch(_){}
    const appliedAccel = applied.hardwareAcceleration === false ? "GPU OFF" : "GPU ON";
    const appliedRenderer = applied.renderer === "vulkan" ? "VULKAN" : "AUTO";
    const pending = !!response?.restartRequired;
    standaloneSetRendererStatus(
      pending
        ? `Restart required. Active now: ${appliedAccel}, ${appliedRenderer}.`
        : `Active now: ${appliedAccel}, ${appliedRenderer}.`,
      pending
    );
  }

  function standaloneMarkRendererDirty(){
    const values = standaloneRendererFormValues();
    const applied = standaloneRendererControls.response?.applied || standaloneRendererControls.response?.settings || {};
    const pending = (
      values.hardwareAcceleration !== (applied.hardwareAcceleration !== false) ||
      values.renderer !== (String(applied.renderer || "default") === "vulkan" ? "vulkan" : "default")
    );
    standaloneSetRendererStatus(
      pending
        ? "Unsaved renderer change. Save, then relaunch to apply."
        : "Renderer settings match the active launch.",
      pending
    );
  }

  function standaloneLoadRendererSettings(){
    const api = standaloneRendererApi();
    if(!api){
      standaloneSetRendererStatus("Renderer controls are available in the Electron launcher only.", false);
      return;
    }
    api.getRendererSettings()
      .then((response)=>standaloneApplyRendererResponse(response))
      .catch((err)=>{
        standaloneSetRendererStatus("Renderer settings unavailable: " + (err?.message || err), false);
      });
  }

  function standaloneSaveRendererSettings(){
    const api = standaloneRendererApi();
    if(!api){
      standaloneSetRendererStatus("Renderer controls are available in the Electron launcher only.", false);
      return;
    }
    const values = standaloneRendererFormValues();
    api.setRendererSettings(values)
      .then((response)=>{
        standaloneApplyRendererResponse(response);
        try{ if(typeof toast === "function") toast("good", "RENDERER SAVED", response?.restartRequired ? "Relaunch to apply renderer settings." : "Renderer settings already active.", 2200); }catch(_){}
      })
      .catch((err)=>{
        standaloneSetRendererStatus("Renderer save failed: " + (err?.message || err), false);
        try{ if(typeof toast === "function") toast("bad", "RENDERER SAVE FAILED", String(err?.message || err), 2600); }catch(_){}
      });
  }

  function standaloneRelaunchForRendererSettings(){
    const api = standaloneRendererApi();
    if(!api || typeof api.relaunch !== "function"){
      standaloneSetRendererStatus("Relaunch from the app menu or restart manually.", true);
      return;
    }
    standaloneSetRendererStatus("Relaunching with saved renderer settings.", true);
    api.relaunch().catch((err)=>{
      standaloneSetRendererStatus("Relaunch failed: " + (err?.message || err), true);
    });
  }

  function bindStandaloneRendererControls(){
    const hardware = document.getElementById("standaloneHardwareAccelToggle");
    const backend = document.getElementById("standaloneRendererBackend");
    const save = document.getElementById("standaloneRendererSaveBtn");
    const relaunch = document.getElementById("standaloneRendererRelaunchBtn");
    if(hardware && !hardware.__flprStandaloneRendererBound){
      hardware.__flprStandaloneRendererBound = true;
      hardware.addEventListener("change", ()=>{
        try{ playClick(); }catch(_){}
        standaloneMarkRendererDirty();
      });
    }
    if(backend && !backend.__flprStandaloneRendererBound){
      backend.__flprStandaloneRendererBound = true;
      backend.addEventListener("change", ()=>{
        try{ playClick(); }catch(_){}
        standaloneMarkRendererDirty();
      });
    }
    if(save && !save.__flprStandaloneRendererBound){
      save.__flprStandaloneRendererBound = true;
      save.addEventListener("click", (event)=>{
        event.preventDefault();
        try{ playClick(); }catch(_){}
        standaloneSaveRendererSettings();
      });
    }
    if(relaunch && !relaunch.__flprStandaloneRendererBound){
      relaunch.__flprStandaloneRendererBound = true;
      relaunch.addEventListener("click", (event)=>{
        event.preventDefault();
        try{ playClick(); }catch(_){}
        standaloneRelaunchForRendererSettings();
      });
    }
    const dock = document.getElementById("standaloneRendererDock");
    if(standaloneRendererControls.loaded && standaloneRendererControls.response && dock?.dataset?.rendererLoaded !== "1"){
      standaloneApplyRendererResponse(standaloneRendererControls.response);
    }else if(!standaloneRendererControls.loaded){
      standaloneLoadRendererSettings();
    }
  }

  function standaloneNormalizeChecksBgMode(mode){
    const value = String(mode || "").trim().toLowerCase();
    return STANDALONE_CHECKS_BG_OPTIONS.some((opt)=>opt.value === value) ? value : "classic";
  }

  function standaloneChecksBgClassNames(){
    return STANDALONE_CHECKS_BG_OPTIONS.map((opt)=>opt.className).filter(Boolean);
  }

  function standaloneReadOverlaySettings(){
    try{
      if(typeof window.loadSettings === "function"){
        const loaded = window.loadSettings();
        if(loaded && typeof loaded === "object") return loaded;
      }
    }catch(_){}
    const keys = [STANDALONE_OVERLAY_SETTINGS_KEY].concat(Array.from(STANDALONE_OVERLAY_LEGACY_SETTINGS_KEYS || []));
    for(const key of keys){
      try{
        const raw = localStorage.getItem(key);
        if(raw) return JSON.parse(raw) || {};
      }catch(_){}
    }
    return {};
  }

  function standaloneSaveOverlaySettings(patch){
    const nextPatch = (patch && typeof patch === "object") ? patch : {};
    try{
      if(typeof window.saveSettings === "function"){
        window.saveSettings(nextPatch);
      }
    }catch(_){}
    try{
      const cur = JSON.parse(localStorage.getItem(STANDALONE_OVERLAY_SETTINGS_KEY) || "{}") || {};
      localStorage.setItem(STANDALONE_OVERLAY_SETTINGS_KEY, JSON.stringify({ ...cur, ...nextPatch }));
    }catch(_){}
  }

  function standaloneEnsureAutoSwapDefault(){
    try{
      const settings = standaloneReadOverlaySettings() || {};
      const saved = Number(settings.swapSeconds);
      const migrated = Number(settings.homeEditionSwapDefaultVersion || 0) >= STANDALONE_SWAP_DEFAULT_VERSION;
      if(Number.isFinite(saved) && (migrated || saved !== 6)) return false;
      const nextSeconds = STANDALONE_DEFAULT_SWAP_SECONDS;
      standaloneSaveOverlaySettings({
        swapSeconds: nextSeconds,
        homeEditionSwapDefaultVersion: STANDALONE_SWAP_DEFAULT_VERSION
      });
      const input = document.getElementById("swapSeconds");
      if(input) input.value = String(nextSeconds);
      try{ if(typeof restartTimer === "function") restartTimer(); }catch(_){}
      try{ window.__flprStandaloneAutoSwapDefault = { seconds:nextSeconds, migratedFrom:Number.isFinite(saved) ? saved : null, ts:Date.now() }; }catch(_){}
      return true;
    }catch(_){
      return false;
    }
  }

  function standaloneEnsureChecksBgOptions(){
    const select = document.getElementById("checksBgMode");
    if(!select) return null;
    try{
      const wantedValues = new Set(STANDALONE_CHECKS_BG_OPTIONS.map((opt)=>opt.value));
      Array.from(select.options || []).forEach((option)=>{
        if(!wantedValues.has(String(option.value || ""))) option.remove();
      });
      STANDALONE_CHECKS_BG_OPTIONS.forEach((opt, index)=>{
        let option = Array.from(select.options || []).find((node)=>String(node.value || "") === opt.value);
        if(!option){
          option = document.createElement("option");
          option.value = opt.value;
        }
        option.textContent = opt.label;
        const currentAtIndex = select.options[index] || null;
        if(option !== currentAtIndex) select.insertBefore(option, currentAtIndex);
      });
      const note = document.getElementById("checksBgNote");
      if(note) note.textContent = "Choose the Checks-page background style. Saved choices persist between Home Edition launches.";
    }catch(_){}
    return select;
  }

  function standaloneApplyChecksBgMode(mode, opts){
    opts = opts || {};
    const value = standaloneNormalizeChecksBgMode(mode);
    const selected = STANDALONE_CHECKS_BG_OPTIONS.find((opt)=>opt.value === value) || STANDALONE_CHECKS_BG_OPTIONS[0];
    try{
      const original = window.applyChecksBgMode?.__flprStandaloneOriginalApplyChecksBgMode || null;
      if(original){
        original.call(window, value === "circuit" ? "circuit" : "classic", { save:false });
      }
    }catch(_){}
    try{
      document.body.classList.remove(...standaloneChecksBgClassNames());
      if(selected.className) document.body.classList.add(selected.className);
    }catch(_){}
    try{
      const select = standaloneEnsureChecksBgOptions();
      if(select && select.value !== value) select.value = value;
    }catch(_){}
    if(opts.save !== false) standaloneSaveOverlaySettings({ checksBgMode:value });
    return value;
  }

  function installStandaloneChecksBackgroundBridge(){
    try{
      const original = window.applyChecksBgMode || (typeof applyChecksBgMode === "function" ? applyChecksBgMode : null);
      if(original && !original.__flprStandaloneChecksBackgroundBridge){
        const bridged = function standaloneApplyChecksBgModeBridge(mode, opts){
          return standaloneApplyChecksBgMode(mode, opts);
        };
        bridged.__flprStandaloneChecksBackgroundBridge = true;
        bridged.__flprStandaloneOriginalApplyChecksBgMode = original;
        window.applyChecksBgMode = bridged;
        try{ applyChecksBgMode = bridged; }catch(_){}
      }
    }catch(_){}

    try{
      const select = standaloneEnsureChecksBgOptions();
      if(select && select.__flprStandaloneChecksBgBound !== true){
        select.__flprStandaloneChecksBgBound = true;
        select.addEventListener("change", (event)=>{
          event.preventDefault();
          standaloneApplyChecksBgMode(select.value, { save:true });
          try{ playClick(); }catch(_){}
        }, true);
      }
    }catch(_){}

    try{
      const saved = standaloneNormalizeChecksBgMode(standaloneReadOverlaySettings().checksBgMode || "classic");
      standaloneApplyChecksBgMode(saved, { save:false });
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
      panel.querySelectorAll("#flprBotRunUtilityWrap, #flprBotRunUtilityBtn, #flprBotRunUtilityStatus").forEach((node)=>{
        const wrap = node.closest?.("#flprBotRunUtilityWrap") || node;
        wrap.remove();
      });
    }catch(_){}
    try{
      standaloneClearMusicScenario(STANDALONE_RANDOMIZER_OPEN_SCENARIO);
      panel.querySelectorAll([
        '[data-music-scenario="bonus_pinball"]',
        '[data-music-preview="bonus_pinball"]',
        '[data-music-clear="bonus_pinball"]',
        '[data-music-mode="bonus_pinball"]',
        '[data-music-volume="bonus_pinball"]',
        '[data-music-scenario="randomizer_open"]',
        '[data-music-preview="randomizer_open"]',
        '[data-music-clear="randomizer_open"]',
        '[data-music-mode="randomizer_open"]',
        '[data-music-volume="randomizer_open"]'
      ].join(", ")).forEach((node)=>{
        const row = node.closest?.(".musicScenarioRow") || node.closest?.(".musicScenarioModeRow") || node.closest?.(".musicScenarioVolumeRow") || node;
        row.remove();
      });
    }catch(_){}
    ensureStandaloneRendererControls(panel);
    ensureStandaloneLogoControls(panel);
    ensureStandaloneTextSizeSlider(panel);
    installStandaloneChecksBackgroundBridge();
  }

  function standaloneConnectionModeName(value){
    const mode = String(value || "").trim().toLowerCase();
    return mode === "singleplayer" ? "singleplayer" : "archipelago";
  }

  function setStandaloneConnectionMode(mode, event){
    if(event){
      event.preventDefault();
      event.stopPropagation();
      try{ event.stopImmediatePropagation(); }catch(_){}
    }
    const wanted = standaloneConnectionModeName(mode);
    const shell = document.querySelector(".flprStandaloneConnectLayout .standaloneConnectionModeShell");
    if(shell) shell.dataset.standaloneConnectionMode = wanted;
    document.querySelectorAll(".flprStandaloneConnectLayout .standaloneConnectionModeTab").forEach((btn)=>{
      const active = standaloneConnectionModeName(btn.dataset.standaloneModeTab) === wanted;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
    document.querySelectorAll(".flprStandaloneConnectLayout .standaloneConnectionModePanel").forEach((panel)=>{
      const active = standaloneConnectionModeName(panel.dataset.standaloneModePanel) === wanted;
      panel.classList.toggle("active", active);
      panel.setAttribute("aria-hidden", active ? "false" : "true");
    });
    try{ window.__flprStandaloneConnectionMode = wanted; }catch(_){}
    if(event) standaloneSetSelectedMode(wanted);
    return false;
  }

  function bindStandaloneConnectionModeTabs(){
    const shell = document.querySelector(".flprStandaloneConnectLayout .standaloneConnectionModeShell");
    if(!shell) return;
    if(shell.__flprStandaloneConnectionTabsBound !== true){
      shell.__flprStandaloneConnectionTabsBound = true;
      shell.addEventListener("click", (event)=>{
        const btn = event.target.closest?.(".standaloneConnectionModeTab");
        if(!btn || !shell.contains(btn)) return;
        playClick();
        setStandaloneConnectionMode(btn.dataset.standaloneModeTab || "archipelago", event);
      }, true);
    }
    setStandaloneConnectionMode(shell.dataset.standaloneConnectionMode || "archipelago");
  }

  function bindStandaloneControls(){
    bindStandaloneConnectionModeTabs();
    const start = document.getElementById("standaloneStartSeedBtn");
    if(start && !start.__flprStandaloneBound){
      start.__flprStandaloneBound = true;
      start.onclick = async ()=>{
        playClick();
        standaloneSetSelectedMode("singleplayer");
        try{
          await loadStandaloneSingleplayerSeed();
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
        standaloneMarkRandomizerClosed();
        try{ if(typeof apDisconnect === "function") apDisconnect(); }catch(_){}
        try{ if(typeof loadState === "function"){ state = loadState(); } }catch(_){}
        try{ if(typeof renderAll === "function") renderAll(); }catch(_){}
        standaloneRefreshProfileUi();
      };
    }
    const quickStart = document.getElementById("standaloneQuickStartBtn");
    if(quickStart && !quickStart.__flprStandaloneBound){
      quickStart.__flprStandaloneBound = true;
      quickStart.onclick = (event)=>{
        try{ event.preventDefault(); event.stopPropagation(); }catch(_){}
        playClick();
        standaloneOpenQuickStart("start", { auto:false });
      };
    }
    const guideBtn = document.getElementById("standaloneGuideBtn");
    if(guideBtn && !guideBtn.__flprStandaloneBound){
      guideBtn.__flprStandaloneBound = true;
      guideBtn.onclick = (event)=>{
        try{ event.preventDefault(); event.stopPropagation(); }catch(_){}
        playClick();
        const overlay = standaloneEnsureQuickStartOverlay();
        overlay.dataset.quickGuideMode = "sp";
        standaloneOpenQuickStart("guide", { auto:false });
      };
    }
    const guideMpBtn = document.getElementById("standaloneGuideMpBtn");
    if(guideMpBtn && !guideMpBtn.__flprStandaloneBound){
      guideMpBtn.__flprStandaloneBound = true;
      guideMpBtn.onclick = (event)=>{
        try{ event.preventDefault(); event.stopPropagation(); }catch(_){}
        playClick();
        const overlay = standaloneEnsureQuickStartOverlay();
        overlay.dataset.quickGuideMode = "mp";
        standaloneOpenQuickStart("guide", { auto:false });
      };
    }
    const tableList = document.getElementById("standaloneTableListBtn");
    if(tableList && !tableList.__flprStandaloneBound){
      tableList.__flprStandaloneBound = true;
      tableList.onclick = (event)=>{
        try{ event.preventDefault(); event.stopPropagation(); }catch(_){}
        playClick();
        standaloneOpenQuickStart("tables", { auto:false });
      };
    }
    const saveList = document.getElementById("standaloneSeedSaveList");
    if(saveList && !saveList.__flprStandaloneBound){
      saveList.__flprStandaloneBound = true;
      saveList.addEventListener("click", async (event)=>{
        const load = event.target.closest?.("[data-seed-load-id]");
        if(load){
          standaloneHandleSeedLoadActivation(event, load.dataset.seedLoadId || "");
          return;
        }
        const row = event.target.closest?.("[data-seed-save-id]");
        if(row && saveList.contains(row)){
          standaloneHandleSeedSaveActivation(event, row);
        }
      }, true);
      saveList.addEventListener("keydown", (event)=>{
        const row = event.target.closest?.("[data-seed-save-id]");
        if(!row || !saveList.contains(row)) return;
        if(event.key !== "Enter" && event.key !== " ") return;
        standaloneHandleSeedSaveActivation(event, row);
      }, true);
      document.addEventListener("pointerdown", (event)=>{
        if(saveList.contains(event.target)) return;
        standaloneClearSeedLoadConfirm();
      }, true);
    }
    const nextAchievement = document.getElementById("standaloneNextAchievementBtn");
    if(nextAchievement && !nextAchievement.__flprStandaloneBound){
      nextAchievement.__flprStandaloneBound = true;
      nextAchievement.addEventListener("click", (event)=>{
        standaloneHandleNextAchievementClick(event, nextAchievement);
      }, true);
    }
    const profileBtn = document.getElementById("standaloneProfileManageBtn");
    if(profileBtn && !profileBtn.__flprStandaloneBound){
      profileBtn.__flprStandaloneBound = true;
      profileBtn.onclick = (event)=>{
        event.preventDefault();
        playClick();
        standaloneOpenProfileGate(true);
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
    bindStandaloneRendererControls();
    bindStandaloneLogoControls();
    bindStandaloneApControls();
    renderStandaloneCounters();
    try{ if(typeof renderReceivedList === "function") renderReceivedList(); }catch(_){}
    try{ if(typeof updateCountCheckUI === "function") updateCountCheckUI(); }catch(_){}
    standaloneRenderNextAchievement();
    standaloneRenderRunBriefing();
  }

  function renderStandaloneCounters(){
    try{
      const sig = [
        ap?.junk?.easy || 0,
        ap?.junk?.med || 0,
        ap?.junk?.frag || 0,
        ap?.junk?.easyTotal || 0,
        ap?.junk?.medTotal || 0,
        ap?.junk?.fragTotal || 0,
        state?.extraBallTokens || 0,
        ap?.checked?.size || 0,
        ap?.receivedByIndex?.size || 0
      ].join("|");
      const now = Date.now();
      if(sig === standalonePerformanceRuntime.lastCounterSig && (now - standalonePerformanceRuntime.lastCounterAt) < 2500) return;
      standalonePerformanceRuntime.lastCounterSig = sig;
      standalonePerformanceRuntime.lastCounterAt = now;
      if(typeof updateCounterBars === "function") updateCounterBars();
      if(typeof updateCountCheckUI === "function") updateCountCheckUI();
    }catch(_){}
  }

  const standaloneTextClient = {
    activeTab: "status",
    logs: { status: [], hints: [], errors: [] },
    itemLogMeta: new Map(),
    serverHints: new Map(),
    serverHintFetchTimer: null,
    serverHintFetchSig: "",
    serverHintFetchAt: 0,
    maxLines: 900,
    loaded: false,
    wrapped: false,
    originalApLog: null,
    originalRenderApLogTab: null,
    renderTimer: 0,
    renderRaf: 0,
    sessionReset: false
  };

  const standaloneItemPanel = {
    activeTab: "received",
    selectedKey: "",
    selectedText: "",
    sent: [],
    sentLoaded: false,
    maxSent: 500,
    sentModalSeen: new Set(),
    sentLogSeen: new Set(),
    sentServerMeta: new Map(),
    pendingSentModals: new Map(),
    selfProgressiveSeen: new Set(),
    progressiveReceiveSeen: new Set(),
    bossKeyReceiveSeen: new Set(),
    counterRewardModalSeen: new Set(),
    itemLogSoundMuted: false,
    apLogClickSoundMuted: false,
    knownReceivedKeys: new Set(),
    newReceivedKeys: new Set(),
    newestReceivedKey: "",
    soundPrefsLoaded: false,
    lastItemLogSoundAt: 0
  };

  const standaloneReceivedRefreshState = {
    lastSig: "",
    lastAt: 0,
    timers: [],
    lastPacketSig: "",
    lastPacketAt: 0,
    blockedPackets: 0
  };

  const standaloneBossIncomingGate = {
    original: null,
    pending: false,
    ms: 0,
    ts: 0,
    reason: "",
    lastSuppressedAt: 0,
    lastSuppressedReason: "",
    flushTimers: []
  };

  function standaloneReadJson(key, fallback){
    try{
      const parsed = JSON.parse(localStorage.getItem(key) || "");
      return parsed == null ? fallback : parsed;
    }catch(_){
      return fallback;
    }
  }

  function standaloneWriteJson(key, value){
    try{ localStorage.setItem(key, JSON.stringify(value)); }catch(_){}
  }

  function standaloneLoadPanelSoundPrefs(){
    if(standaloneItemPanel.soundPrefsLoaded) return;
    standaloneItemPanel.soundPrefsLoaded = true;
    try{ standaloneItemPanel.itemLogSoundMuted = localStorage.getItem(STANDALONE_ITEM_LOG_SOUND_KEY) === "1"; }catch(_){}
    try{ standaloneItemPanel.apLogClickSoundMuted = localStorage.getItem(STANDALONE_AP_LOG_CLICK_SOUND_KEY) === "1"; }catch(_){}
  }

  function standalonePersistPanelSoundPref(key, muted){
    try{ localStorage.setItem(key, muted ? "1" : "0"); }catch(_){}
  }

  function standalonePlayItemLogChink(){
    standaloneLoadPanelSoundPrefs();
    if(standaloneItemPanel.itemLogSoundMuted) return;
    const now = Date.now();
    if(now - Number(standaloneItemPanel.lastItemLogSoundAt || 0) < 180) return;
    standaloneItemPanel.lastItemLogSoundAt = now;
    try{
      if(typeof playTone === "function"){
        playTone({ freq:760, dur:0.045, type:"triangle", gain:0.06, sweepTo:1080, sweepDur:0.04 });
        setTimeout(()=>playTone({ freq:1460, dur:0.075, type:"sine", gain:0.055, sweepTo:1760, sweepDur:0.06 }), 38);
      }else if(typeof playSfx === "function"){
        playSfx("receive");
      }
    }catch(_){}
  }

  function standalonePlayApLogClick(){
    standaloneLoadPanelSoundPrefs();
    if(standaloneItemPanel.apLogClickSoundMuted) return;
    try{ playClick(); }catch(_){}
  }

  function standaloneUpdatePanelSoundButtons(){
    standaloneLoadPanelSoundPrefs();
    try{
      const speakerGlyph = (String.fromCodePoint ? String.fromCodePoint(0x1F50A) : "\uD83D\uDD0A") + "\uFE0E";
      document.querySelectorAll("#standaloneItemLogSoundBtn").forEach((btn)=>{
        btn.textContent = speakerGlyph;
        btn.classList.toggle("is-muted", !!standaloneItemPanel.itemLogSoundMuted);
        btn.title = standaloneItemPanel.itemLogSoundMuted ? "Turn item log arrival sound on" : "Turn item log arrival sound off";
        btn.setAttribute("aria-label", btn.title || "Toggle item log arrival sound");
        btn.setAttribute("aria-pressed", standaloneItemPanel.itemLogSoundMuted ? "false" : "true");
      });
      document.querySelectorAll("#standaloneApLogClickSoundBtn").forEach((btn)=>{
        btn.textContent = speakerGlyph;
        btn.classList.toggle("is-muted", !!standaloneItemPanel.apLogClickSoundMuted);
        btn.title = standaloneItemPanel.apLogClickSoundMuted ? "Turn AP log click sound on" : "Turn AP log click sound off";
        btn.setAttribute("aria-label", btn.title || "Toggle AP log click sound");
        btn.setAttribute("aria-pressed", standaloneItemPanel.apLogClickSoundMuted ? "false" : "true");
      });
    }catch(_){}
  }

  function standaloneToggleItemLogSound(event){
    if(event){
      event.preventDefault();
      event.stopPropagation();
      try{ event.stopImmediatePropagation(); }catch(_){}
    }
    standaloneLoadPanelSoundPrefs();
    standaloneItemPanel.itemLogSoundMuted = !standaloneItemPanel.itemLogSoundMuted;
    standalonePersistPanelSoundPref(STANDALONE_ITEM_LOG_SOUND_KEY, standaloneItemPanel.itemLogSoundMuted);
    try{ if(!standaloneItemPanel.itemLogSoundMuted) standalonePlayItemLogChink(); }catch(_){}
    standaloneUpdatePanelSoundButtons();
    return false;
  }

  function standaloneToggleApLogClickSound(event){
    if(event){
      event.preventDefault();
      event.stopPropagation();
      try{ event.stopImmediatePropagation(); }catch(_){}
    }
    standaloneLoadPanelSoundPrefs();
    standaloneItemPanel.apLogClickSoundMuted = !standaloneItemPanel.apLogClickSoundMuted;
    standalonePersistPanelSoundPref(STANDALONE_AP_LOG_CLICK_SOUND_KEY, standaloneItemPanel.apLogClickSoundMuted);
    try{ if(!standaloneItemPanel.apLogClickSoundMuted) playClick(); }catch(_){}
    standaloneUpdatePanelSoundButtons();
    return false;
  }

  function standaloneBossIncomingSeedKey(){
    try{
      const mode = standaloneConnectionModeName(
        standaloneProfileRuntime?.randomizerReason ||
        standaloneProfileRuntime?.selectedMode ||
        (ap?.inherentSeedActive ? "singleplayer" : (ap?.connected ? "archipelago" : "home"))
      );
      const server = mode === "archipelago"
        ? String(ap?.cfg?.server || ap?.server || "").trim()
        : "local";
      const team = mode === "archipelago"
        ? String(ap?.team ?? "").trim()
        : "";
      const game = mode === "archipelago"
        ? String(ap?.cfg?.game || ap?.game || "").trim()
        : "";
      const seedKey = standaloneRewardSeedKey();
      return [
        "boss-incoming",
        mode || "home",
        server || "local",
        game || "game",
        team || "team",
        seedKey || "unseeded|slot"
      ].join("|");
    }catch(_){
      return `boss-incoming|home|local|game|team|${standaloneRewardSeedKey()}`;
    }
  }

  function standaloneLoadBossIncomingSeen(){
    const raw = standaloneReadJson(STANDALONE_BOSS_INCOMING_SEEN_KEY, {});
    return (raw && typeof raw === "object" && !Array.isArray(raw)) ? raw : {};
  }

  function standaloneBossIncomingSeenRecord(){
    try{
      const key = standaloneBossIncomingSeedKey();
      const seen = standaloneLoadBossIncomingSeen();
      return seen[key] ? { key, record:seen[key] } : null;
    }catch(_){
      return null;
    }
  }

  function standaloneBossIncomingHasPlayed(){
    return !!standaloneBossIncomingSeenRecord();
  }

  function standaloneMarkBossIncomingPlayed(reason){
    try{
      const key = standaloneBossIncomingSeedKey();
      const seen = standaloneLoadBossIncomingSeen();
      seen[key] = {
        playedAt: Date.now(),
        reason:String(reason || "played"),
        seedKey:standaloneRewardSeedKey(),
        bossName:(()=>{
          try{ return String(getUnifiedBossTableName({ includePlaceholder:false }) || state?.bossTable || "").trim(); }catch(_){}
          return "";
        })()
      };
      const entries = Object.entries(seen);
      if(entries.length > 240){
        entries
          .sort((a, b)=> Number(a[1]?.playedAt || 0) - Number(b[1]?.playedAt || 0))
          .slice(0, entries.length - 220)
          .forEach(([oldKey])=>{ delete seen[oldKey]; });
      }
      standaloneWriteJson(STANDALONE_BOSS_INCOMING_SEEN_KEY, seen);
      try{
        standaloneBossIncomingGate.lastSuppressedAt = 0;
        standaloneBossIncomingGate.lastSuppressedReason = "";
      }catch(_){}
      return true;
    }catch(_){
      return false;
    }
  }

  function standaloneClearBossIncomingSeenForTest(key){
    try{
      const targetKey = String(key || standaloneBossIncomingSeedKey() || "");
      const seen = standaloneLoadBossIncomingSeen();
      if(targetKey) delete seen[targetKey];
      standaloneWriteJson(STANDALONE_BOSS_INCOMING_SEEN_KEY, seen);
      try{
        standaloneBossIncomingGate.lastSuppressedAt = 0;
        standaloneBossIncomingGate.lastSuppressedReason = "";
      }catch(_){}
      return targetKey;
    }catch(_){
      return "";
    }
  }

  function standaloneRewardSeedKey(){
    try{
      const seed = String(ap?.seedName || state?.relics?.run?.seedSig || state?.bossTableSeed || "").trim();
      const slot = String(ap?.slot || ap?.cfg?.player || "").trim();
      return `${seed || "unseeded"}|${slot || "slot"}`;
    }catch(_){
      return "unseeded|slot";
    }
  }

  function standaloneLoadBossVictoryAutoCheckState(){
    const seedKey = standaloneRewardSeedKey();
    const raw = standaloneReadJson(STANDALONE_BOSS_VICTORY_AUTO_CHECKS_KEY, {});
    const saved = (raw && typeof raw === "object" && String(raw.seedKey || "") === seedKey) ? raw : {};
    const ids = Array.isArray(saved.ids)
      ? saved.ids.map((id)=>Number(id)).filter((id)=>Number.isFinite(id) && id > 0)
      : [];
    return {
      seedKey,
      ids:Array.from(new Set(ids)),
      updatedAt:Math.max(0, Number(saved.updatedAt || 0))
    };
  }

  function standaloneSaveBossVictoryAutoCheckState(record){
    const seedKey = standaloneRewardSeedKey();
    const ids = Array.isArray(record?.ids)
      ? record.ids.map((id)=>Number(id)).filter((id)=>Number.isFinite(id) && id > 0)
      : [];
    const next = {
      seedKey,
      ids:Array.from(new Set(ids)).sort((a, b)=>a - b),
      updatedAt:Date.now()
    };
    standaloneWriteJson(STANDALONE_BOSS_VICTORY_AUTO_CHECKS_KEY, next);
    try{ window.__flprStandaloneBossVictoryAutoChecks = new Set(next.ids); }catch(_){}
    return next;
  }

  function standaloneBossVictoryAutoCheckIds(){
    try{
      const current = window.__flprStandaloneBossVictoryAutoChecks;
      if(current instanceof Set) return current;
    }catch(_){}
    const rec = standaloneLoadBossVictoryAutoCheckState();
    const set = new Set(rec.ids);
    try{ window.__flprStandaloneBossVictoryAutoChecks = set; }catch(_){}
    return set;
  }

  function standaloneMarkBossVictoryAutoCheckIds(ids, reason){
    const incoming = (Array.isArray(ids) ? ids : [])
      .map((id)=>Number(id))
      .filter((id)=>Number.isFinite(id) && id > 0);
    if(!incoming.length) return [];
    const set = standaloneBossVictoryAutoCheckIds();
    let changed = false;
    incoming.forEach((id)=>{
      if(set.has(id)) return;
      set.add(id);
      changed = true;
    });
    if(changed){
      const saved = standaloneSaveBossVictoryAutoCheckState({ ids:Array.from(set) });
      try{
        window.__flprStandaloneLastBossVictoryAutoChecks = {
          reason:String(reason || ""),
          ids:incoming,
          allIds:saved.ids,
          seedKey:saved.seedKey,
          ts:Date.now()
        };
      }catch(_){}
    }
    return incoming;
  }

  function standaloneIsBossVictoryAutoCheckId(locId){
    const id = Number(locId);
    if(!Number.isFinite(id) || id <= 0) return false;
    try{ return standaloneBossVictoryAutoCheckIds().has(id); }catch(_){}
    return false;
  }

  function standaloneBossNodeForLocationId(locId){
    const id = Number(locId);
    if(!Number.isFinite(id) || id <= 0) return null;
    try{
      const direct = ap?.locById?.get?.(id) || null;
      if(direct && standaloneIsExplicitBossCheckNode(direct)) return direct;
    }catch(_){}
    try{
      const nodes = typeof resolveBossChecksNodes === "function" ? resolveBossChecksNodes() : [];
      const found = (Array.isArray(nodes) ? nodes : []).find((node)=>Number(node?.id) === id);
      if(found) return found;
    }catch(_){}
    try{
      for(const list of (ap?.locsByTableKey?.values?.() || [])){
        const found = (Array.isArray(list) ? list : []).find((node)=>Number(node?.id) === id && standaloneIsExplicitBossCheckNode(node));
        if(found) return found;
      }
    }catch(_){}
    return null;
  }

  function standaloneIsBossVictoryLocationId(locId){
    const node = standaloneBossNodeForLocationId(locId);
    if(!node) return false;
    try{ return !!bossIsVictoryLocationNode(node); }catch(_){}
    return /victory|final\s*blow|boss\s*defeat|boss\s*clear|boss\s*victor/i.test(`${String(node.full || "")} ${String(node.short || "")}`);
  }

  function standaloneIsBossNonVictoryLocationId(locId){
    const node = standaloneBossNodeForLocationId(locId);
    if(!node) return false;
    return !standaloneIsBossVictoryLocationId(locId);
  }

  function standaloneIsDirectPendingLocationId(locId){
    const id = Number(locId);
    if(!Number.isFinite(id) || id <= 0) return false;
    try{ if(ap?.pendingByLoc?.has?.(id)) return true; }catch(_){}
    try{
      if(Array.isArray(ap?.pendingQueue) && ap.pendingQueue.some((entry)=>Number(entry?.id) === id)) return true;
    }catch(_){}
    return false;
  }

  function standaloneBossVictoryAlreadyComplete(){
    try{ if(state?.bossVictoryFinalizing || state?.bossVictorySent) return true; }catch(_){}
    try{ if(typeof bossIsSeedComplete === "function" && bossIsSeedComplete()) return true; }catch(_){}
    try{
      const nodes = typeof resolveBossChecksNodes === "function" ? resolveBossChecksNodes() : [];
      return (Array.isArray(nodes) ? nodes : []).some((node)=>standaloneIsBossVictoryLocationId(node?.id) && ap?.checked?.has?.(Number(node?.id)));
    }catch(_){}
    return false;
  }

  function standaloneBossVictoryAutoIdsFromCheckedList(list, opts){
    opts = opts || {};
    if(!Array.isArray(list) || !list.length) return [];
    const ids = list.map((id)=>Number(id)).filter((id)=>Number.isFinite(id) && id > 0);
    if(!ids.length) return [];
    const knownAuto = ids.filter((id)=>standaloneIsBossVictoryAutoCheckId(id));
    const canMark = opts.awardAchievements !== false;
    if(!canMark) return knownAuto;
    const victoryInList = ids.some((id)=>standaloneIsBossVictoryLocationId(id));
    const victoryAlreadyComplete = standaloneBossVictoryAlreadyComplete();
    if(!victoryInList && !victoryAlreadyComplete) return knownAuto;
    const autoIds = [];
    ids.forEach((id)=>{
      if(standaloneIsBossVictoryAutoCheckId(id)){
        autoIds.push(id);
        return;
      }
      if(ap?.checked?.has?.(id)) return;
      if(!standaloneIsBossNonVictoryLocationId(id)) return;
      if(standaloneIsDirectPendingLocationId(id)) return;
      autoIds.push(id);
    });
    return Array.from(new Set(autoIds));
  }

  function standaloneLoadRewardState(){
    const seedKey = standaloneRewardSeedKey();
    const raw = standaloneReadJson(STANDALONE_AP_REWARD_STATE_KEY, {});
    const saved = (raw && typeof raw === "object" && String(raw.seedKey || "") === seedKey) ? raw : {};
    return {
      seedKey,
      easyRedeemsEarned: Math.max(0, Math.round(Number(saved.easyRedeemsEarned || 0))),
      mediumRedeemsEarned: Math.max(0, Math.round(Number(saved.mediumRedeemsEarned || 0))),
      fragmentTokensEarned: Math.max(0, Math.round(Number(saved.fragmentTokensEarned || 0))),
      totalFragments: Math.max(0, Math.round(Number(saved.totalFragments || 0))),
      currentFragments: Math.max(0, Math.round(Number(saved.currentFragments || 0))),
      updatedAt: Math.max(0, Number(saved.updatedAt || 0))
    };
  }

  function standaloneSaveRewardState(rewardState){
    const seedKey = standaloneRewardSeedKey();
    const next = {
      seedKey,
      easyRedeemsEarned: Math.max(0, Math.round(Number(rewardState?.easyRedeemsEarned || 0))),
      mediumRedeemsEarned: Math.max(0, Math.round(Number(rewardState?.mediumRedeemsEarned || 0))),
      fragmentTokensEarned: Math.max(0, Math.round(Number(rewardState?.fragmentTokensEarned || 0))),
      totalFragments: Math.max(0, Math.round(Number(rewardState?.totalFragments || 0))),
      currentFragments: Math.max(0, Math.round(Number(rewardState?.currentFragments || 0))),
      updatedAt: Date.now()
    };
    standaloneWriteJson(STANDALONE_AP_REWARD_STATE_KEY, next);
    try{
      state.standaloneApRewardState = {
        seedKey: next.seedKey,
        junkRedeemsEarned: {
          easy: next.easyRedeemsEarned,
          medium: next.mediumRedeemsEarned
        },
        fragments: {
          total: next.totalFragments,
          current: next.currentFragments,
          earnedExtraBalls: next.fragmentTokensEarned
        },
        updatedAt: next.updatedAt
      };
    }catch(_){}
    return next;
  }

  function standaloneItemNameIsEasyJunk(name){
    try{ if(typeof isEasyJunkName === "function") return !!isEasyJunkName(name); }catch(_){}
    return /\beasy\b/i.test(String(name || "")) && /\bjunk\b/i.test(String(name || ""));
  }

  function standaloneItemNameIsMediumJunk(name){
    try{ if(typeof isMediumJunkName === "function") return !!isMediumJunkName(name); }catch(_){}
    return /\b(?:medium|med)\b/i.test(String(name || "")) && /\bjunk\b/i.test(String(name || ""));
  }

  function standaloneItemNameIsGenericJunk(name){
    try{ if(typeof isGenericJunkName === "function") return !!isGenericJunkName(name); }catch(_){}
    const text = String(name || "");
    return /\bjunk\b/i.test(text) && !standaloneItemNameIsEasyJunk(text) && !standaloneItemNameIsMediumJunk(text);
  }

  function standaloneItemNameIsFragment(name){
    try{ if(typeof isPinballFragmentItem === "function") return !!isPinballFragmentItem(name); }catch(_){}
    const text = String(name || "").toLowerCase();
    return /\bpinball\s*fragment\b/.test(text) || /\bfragment\s*pinball\b/.test(text) || /^pinball\s*frag/.test(text);
  }

  function standaloneResolveGenericJunkTier(row){
    try{
      if(typeof resolveGenericJunkTier === "function"){
        return resolveGenericJunkTier(row?.recvIndex, row?.locId, row?.locationName || "");
      }
    }catch(_){}
    const seed = `${row?.recvIndex ?? ""}|${row?.locId ?? ""}|${String(row?.locationName || "")}`;
    let h = 5381;
    for(let i = 0; i < seed.length; i++) h = ((h << 5) + h) + seed.charCodeAt(i);
    return ((h >>> 0) % 2) === 0 ? "easy" : "medium";
  }

  function standaloneReceivedInventoryRows(){
    let list = [];
    try{ list = Array.isArray(ap?.receivedAll) ? ap.receivedAll : []; }catch(_){}
    if(!list.length){
      try{ if(typeof loadReceivedList === "function") list = loadReceivedList() || []; }catch(_){}
    }
    return Array.isArray(list) ? list : [];
  }

  function standaloneRewardInventorySummary(){
    const seen = new Set();
    let easy = 0;
    let medium = 0;
    let fragments = 0;
    standaloneReceivedInventoryRows().forEach((row, index)=>{
      const locId = Number(row?.locId ?? row?.location ?? row?.location_id ?? row?.loc);
      const itemId = Number(row?.itemId ?? row?.item);
      const sourceId = Number(row?.sourcePlayerId ?? row?.player ?? row?.player_id ?? 0) || 0;
      const name = String(row?.itemName || row?.baseItemName || "");
      const key = Number.isFinite(locId) && locId > 0
        ? `loc:${locId}|item:${Number.isFinite(itemId) ? itemId : standaloneNormalizeLoose(name)}|source:${sourceId}`
        : (row?.recvIndex != null
          ? `idx:${row.recvIndex}`
          : `${name}|${row?.locationName || ""}|${index}`);
      if(seen.has(key)) return;
      seen.add(key);
      if(standaloneItemNameIsGenericJunk(name)){
        const tier = standaloneResolveGenericJunkTier(row);
        if(tier === "medium") medium++;
        else easy++;
      }else if(standaloneItemNameIsEasyJunk(name)){
        easy++;
      }else if(standaloneItemNameIsMediumJunk(name)){
        medium++;
      }else if(standaloneItemNameIsFragment(name)){
        fragments++;
      }
    });
    return {
      easyPieces: easy,
      mediumPieces: medium,
      fragments,
      easyRedeemsEarned: Math.floor(easy / 3),
      mediumRedeemsEarned: Math.floor(medium / 3),
      currentEasyPieces: easy % 3,
      currentMediumPieces: medium % 3,
      currentFragments: fragments % 5,
      fragmentTokensEarned: Math.floor(fragments / 5)
    };
  }

  function standaloneEnsureJunkRedeemState(){
    try{
      if(typeof ensureJunkRedeemState === "function") return ensureJunkRedeemState();
    }catch(_){}
    try{
      state.junkRedeems = state.junkRedeems && typeof state.junkRedeems === "object" ? state.junkRedeems : { easy:0, medium:0 };
      state.junkRedeems.easy = Math.max(0, Math.round(Number(state.junkRedeems.easy || 0)));
      state.junkRedeems.medium = Math.max(0, Math.round(Number(state.junkRedeems.medium || 0)));
      return state.junkRedeems;
    }catch(_){
      return { easy:0, medium:0 };
    }
  }

  function standaloneExtraBallAssignedCount(){
    try{
      if(typeof getExtraBallAssignmentCount === "function"){
        return Math.max(0, Math.round(Number(getExtraBallAssignmentCount()) || 0));
      }
    }catch(_){}
    try{
      const assignments = state?.extraBallAssignments || {};
      if(!assignments || typeof assignments !== "object") return 0;
      return Object.values(assignments).reduce((total, value)=>{
        const num = Math.round(Number(value));
        if(Number.isFinite(num) && num > 0) return total + num;
        return total + (value ? 1 : 0);
      }, 0);
    }catch(_){}
    return 0;
  }

  function standaloneClampRewardInventoryBalances(summary){
    let changed = false;
    if(standaloneIsStreamEditionRuntime()){
      try{
        const currentExtraBalls = Math.max(0, Math.round(Number(state?.extraBallTokens || 0)));
        if(currentExtraBalls !== 0){
          state.extraBallTokens = 0;
          changed = true;
        }
        if(state?.extraBallAssignments && Object.keys(state.extraBallAssignments || {}).length){
          state.extraBallAssignments = {};
          changed = true;
        }
      }catch(_){}
      try{
        const redeems = standaloneEnsureJunkRedeemState();
        if(Math.max(0, Math.round(Number(redeems.easy || 0))) !== 0){
          redeems.easy = 0;
          changed = true;
        }
        if(Math.max(0, Math.round(Number(redeems.medium || 0))) !== 0){
          redeems.medium = 0;
          changed = true;
        }
      }catch(_){}
      if(changed){
        try{ saveState(); }catch(_){}
      }
      return changed;
    }
    try{
      const earnedExtraBalls = Math.max(0, Math.round(Number(summary?.fragmentTokensEarned || 0)));
      const assignedExtraBalls = standaloneExtraBallAssignedCount();
      const maxBankedExtraBalls = Math.max(0, earnedExtraBalls - assignedExtraBalls);
      const currentExtraBalls = Math.max(0, Math.round(Number(state?.extraBallTokens || 0)));
      if(currentExtraBalls !== maxBankedExtraBalls){
        state.extraBallTokens = maxBankedExtraBalls;
        changed = true;
      }
    }catch(_){}
    try{
      const redeems = standaloneEnsureJunkRedeemState();
      const maxEasy = Math.max(0, Math.round(Number(summary?.easyRedeemsEarned || 0)));
      const maxMedium = Math.max(0, Math.round(Number(summary?.mediumRedeemsEarned || 0)));
      const currentEasy = Math.max(0, Math.round(Number(redeems.easy || 0)));
      const currentMedium = Math.max(0, Math.round(Number(redeems.medium || 0)));
      if(currentEasy > maxEasy){
        redeems.easy = maxEasy;
        changed = true;
      }
      if(currentMedium > maxMedium){
        redeems.medium = maxMedium;
        changed = true;
      }
    }catch(_){}
    if(changed){
      try{ saveState(); }catch(_){}
    }
    return changed;
  }

  function standaloneCounterSnapshotFromAp(){
    try{
      return {
        inited:true,
        e: Number(ap?.junk?.easy || 0) || 0,
        m: Number(ap?.junk?.med || 0) || 0,
        f: Number(ap?.junk?.frag || 0) || 0,
        et: Number(ap?.junk?.easyTotal || 0) || 0,
        mt: Number(ap?.junk?.medTotal || 0) || 0,
        ft: Number(ap?.junk?.fragTotal || 0) || 0
      };
    }catch(_){
      return { inited:true, e:0, m:0, f:0, et:0, mt:0, ft:0 };
    }
  }

  function standaloneCollapsedCounterReadyCount(key){
    const k = String(key || "").trim().toLowerCase();
    try{
      if(k === "frag") return Math.max(0, Math.round(Number(state?.extraBallTokens || 0)));
      const redeems = standaloneEnsureJunkRedeemState();
      if(k === "med") return Math.max(0, Math.round(Number(redeems.medium || 0)));
      if(k === "easy") return Math.max(0, Math.round(Number(redeems.easy || 0)));
    }catch(_){}
    return 0;
  }

  function standaloneSyncCollapsedCounterRedeemBadges(){
    try{
      const drawers = Array.from(document.querySelectorAll("#checksCountersDock .counterDrawer[data-counter]"));
      drawers.forEach((drawer)=>{
        const key = String(drawer?.dataset?.counter || "").trim().toLowerCase();
        if(key !== "easy" && key !== "med" && key !== "frag") return;
        const ready = standaloneCollapsedCounterReadyCount(key);
        const label = key === "frag" ? "EB" : "RDY";
        let chip = drawer.querySelector(":scope > .flprStandaloneCollapsedRedeemCounter");
        if(!chip){
          chip = document.createElement("span");
          chip.className = "flprStandaloneCollapsedRedeemCounter";
          chip.setAttribute("aria-hidden", "true");
          chip.innerHTML = '<span class="flprStandaloneCollapsedRedeemLabel"></span><span class="flprStandaloneCollapsedRedeemValue"></span>';
          drawer.appendChild(chip);
        }
        const labelEl = chip.querySelector(".flprStandaloneCollapsedRedeemLabel");
        const valueEl = chip.querySelector(".flprStandaloneCollapsedRedeemValue");
        if(labelEl) labelEl.textContent = label;
        if(valueEl) valueEl.textContent = String(ready);
        chip.dataset.count = String(ready);
        chip.dataset.label = label;
        drawer.classList.toggle("flprStandaloneHasCollapsedRedeems", ready > 0);
      });
    }catch(_){}
  }

  function standalonePrimeCounterDrawerPrev(){
    try{ window.__counterDrawerPrev = standaloneCounterSnapshotFromAp(); }catch(_){}
    standaloneSyncCollapsedCounterRedeemBadges();
  }

  function standaloneCloseAutoCounterDrawers(){
    try{
      const dock = document.getElementById("checksCountersDock");
      if(!dock) return;
      dock.querySelectorAll(".counterDrawer.autoOpen, .counterDrawer.pulse, .counterDrawer.redeemFx").forEach((drawer)=>{
        try{
          const wasAuto = drawer.classList.contains("autoOpen");
          if(drawer.__autoTimer) clearTimeout(drawer.__autoTimer);
          drawer.classList.remove("autoOpen", "pulse", "redeemFx");
          if(wasAuto) drawer.classList.remove("open");
        }catch(_){}
      });
      if(!dock.querySelector(".counterDrawer.open")){
        dock.classList.remove("expanded", "active", "retreating", "showRetreatBar");
        dock.__hoverExpanded = false;
      }
    }catch(_){}
  }

  function standaloneWithCounterDrawerFxSuppressed(fn){
    try{ window.__flprStandaloneSuppressCounterDrawerFx = true; }catch(_){}
    standalonePrimeCounterDrawerPrev();
    try{
      return typeof fn === "function" ? fn() : undefined;
    }finally{
      standalonePrimeCounterDrawerPrev();
      standaloneCloseAutoCounterDrawers();
      try{ window.__flprStandaloneSuppressCounterDrawerFx = false; }catch(_){}
    }
  }

  function installStandaloneCounterDrawerSuppressionBridge(){
    let originalUpdate = null;
    try{ originalUpdate = (typeof updateCounterBars === "function") ? updateCounterBars : null; }catch(_){}
    if(!originalUpdate){
      setTimeout(installStandaloneCounterDrawerSuppressionBridge, 120);
      return;
    }
    if(!originalUpdate.__flprStandaloneCounterSuppressBridge){
      const bridgedUpdate = function standaloneUpdateCounterBarsBridge(){
        if(window.__flprStandaloneSuppressCounterDrawerFx){
          standalonePrimeCounterDrawerPrev();
          const result = originalUpdate.apply(this, arguments);
          standalonePrimeCounterDrawerPrev();
          standaloneCloseAutoCounterDrawers();
          standaloneSyncCollapsedCounterRedeemBadges();
          return result;
        }
        const result = originalUpdate.apply(this, arguments);
        standaloneSyncCollapsedCounterRedeemBadges();
        return result;
      };
      bridgedUpdate.__flprStandaloneCounterSuppressBridge = true;
      bridgedUpdate.__flprStandaloneOriginalUpdateCounterBars = originalUpdate;
      try{ window.updateCounterBars = bridgedUpdate; }catch(_){}
      try{ updateCounterBars = bridgedUpdate; }catch(_){}
    }

    let originalReconcile = null;
    try{ originalReconcile = (typeof apReconcileWorldStateFromReceived === "function") ? apReconcileWorldStateFromReceived : null; }catch(_){}
    if(originalReconcile && !originalReconcile.__flprStandaloneCounterSuppressBridge){
      const bridgedReconcile = function standaloneReconcileCounterSuppressBridge(){
        const args = arguments;
        return standaloneWithCounterDrawerFxSuppressed(()=>originalReconcile.apply(this, args));
      };
      bridgedReconcile.__flprStandaloneCounterSuppressBridge = true;
      bridgedReconcile.__flprStandaloneOriginalReconcile = originalReconcile;
      try{ window.apReconcileWorldStateFromReceived = bridgedReconcile; }catch(_){}
      try{ apReconcileWorldStateFromReceived = bridgedReconcile; }catch(_){}
    }
    try{ standaloneSyncCollapsedCounterRedeemBadges(); }catch(_){}
  }

  function standaloneApplyRewardInventoryState(opts){
    opts = opts || {};
    const summary = standaloneRewardInventorySummary();
    const previous = standaloneLoadRewardState();
    const easyBaseline = Math.min(previous.easyRedeemsEarned, summary.easyRedeemsEarned);
    const mediumBaseline = Math.min(previous.mediumRedeemsEarned, summary.mediumRedeemsEarned);
    const easyDelta = opts.applyNewRewards === false ? 0 : Math.max(0, summary.easyRedeemsEarned - easyBaseline);
    const mediumDelta = opts.applyNewRewards === false ? 0 : Math.max(0, summary.mediumRedeemsEarned - mediumBaseline);

    try{
      ap.junk = ap.junk || { easy:0, med:0, frag:0, easyTotal:0, medTotal:0, fragTotal:0 };
      ap.junk.easy = summary.currentEasyPieces;
      ap.junk.med = summary.currentMediumPieces;
      ap.junk.frag = summary.currentFragments;
      ap.junk.easyTotal = summary.easyRedeemsEarned;
      ap.junk.medTotal = summary.mediumRedeemsEarned;
      ap.junk.fragTotal = summary.fragments;
    }catch(_){}

    try{
      const redeems = standaloneEnsureJunkRedeemState();
      if(!standaloneIsStreamEditionRuntime()){
        if(easyDelta) redeems.easy = Math.max(0, Math.round(Number(redeems.easy || 0)) + easyDelta);
        if(mediumDelta) redeems.medium = Math.max(0, Math.round(Number(redeems.medium || 0)) + mediumDelta);
        if(easyDelta || mediumDelta) try{ saveState(); }catch(_){}
      }
    }catch(_){}

    standaloneClampRewardInventoryBalances(summary);
    standaloneSaveRewardState({
      easyRedeemsEarned: summary.easyRedeemsEarned,
      mediumRedeemsEarned: summary.mediumRedeemsEarned,
      fragmentTokensEarned: summary.fragmentTokensEarned,
      totalFragments: summary.fragments,
      currentFragments: summary.currentFragments
    });
    standaloneWithCounterDrawerFxSuppressed(()=>{ try{ updateCounterBars(); }catch(_){} });
    try{ renderExtraBallNotices(); }catch(_){}
    return summary;
  }

  function standaloneReceivedItemName(it){
    try{
      const id = it?.item;
      const self = standaloneSelfSlotId();
      const ownGame = standaloneSelfGameName();
      const fallback = standaloneOwnPackageItemName(id) || "";
      const resolved = standaloneResolveApItemName(id, self, fallback, ownGame);
      return standaloneLooksUnresolvedItemName(resolved, id) ? "" : resolved;
    }catch(_){
      return "";
    }
  }

  function standaloneReceivedRowItemName(row){
    try{
      const itemId = row?.itemId ?? row?.item ?? null;
      const fallback = String(row?.itemName || row?.baseItemName || standaloneOwnPackageItemName(itemId) || "Unknown Item");
      const self = standaloneSelfSlotId();
      const ownGame = standaloneSelfGameName();
      const resolved = standaloneResolveApItemName(itemId, self, fallback, ownGame);
      return standaloneLooksUnresolvedItemName(resolved, itemId) ? fallback : resolved;
    }catch(_){
      return String(row?.itemName || row?.baseItemName || "Unknown Item");
    }
  }

  function standaloneLooksUnresolvedItemName(name, itemId){
    const text = String(name || "").trim();
    const idText = String(itemId ?? "").trim();
    if(!text) return true;
    if(/^item\s*#?\s*\d+$/i.test(text)) return true;
    if(idText && text === idText) return true;
    return /^\d{4,}$/.test(text);
  }

  function standaloneBossBucketKey(){
    try{ return String(normKey("Boss Table") || "bosstable"); }catch(_){ return "bosstable"; }
  }

  function standaloneCanonicalTableKey(value){
    try{ return String(canonicalTableMapKey(value) || "").trim(); }catch(_){}
    try{ return standaloneNormalizeLoose(value); }catch(_){}
    return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
  }

  function standaloneWorldKeyIsBoss(worldKey){
    const wk = String(worldKey || "").trim();
    if(!wk) return false;
    try{ if(typeof isBossWorldId === "function") return !!isBossWorldId(wk, state); }catch(_){}
    try{ if(typeof getBossWorldKey === "function" && wk === String(getBossWorldKey() || "")) return true; }catch(_){}
    return wk.toLowerCase() === "boss";
  }

  function standaloneIsExplicitBossCheckNode(node){
    try{
      if(!node) return false;
      if(node.standaloneBossCheck === true) return true;
      const full = String(node.full || node.locationName || node.checkName || "");
      const short = String(node.short || "");
      const split = standaloneSplitLocationName(full);
      const table = String(node.tableName || node.table || split.table || "").trim();
      const tableKey = standaloneCanonicalTableKey(table);
      if(tableKey === "boss" || tableKey === "bosstable") return true;
      const raw = `${full} ${short}`.toLowerCase();
      if(/\bboss\s*(?:damage|hp|health|segment|moment|phase|victory|defeat|clear|hit|attack)\b/.test(raw)) return true;
      if(/\b(?:final\s*blow|boss\s*table)\b/.test(raw)) return true;
    }catch(_){}
    return false;
  }

  function standaloneDedupeSortLocationNodes(nodes){
    const out = [];
    const seen = new Set();
    (Array.isArray(nodes) ? nodes : []).forEach((node, index)=>{
      const id = Number(node?.id);
      const key = Number.isFinite(id) && id > 0
        ? `id:${id}`
        : `node:${String(node?.full || node?.short || "")}|${index}`;
      if(seen.has(key)) return;
      seen.add(key);
      out.push(node);
    });
    out.sort((a, b)=>{
      const ai = Number(a?.id);
      const bi = Number(b?.id);
      if(Number.isFinite(ai) && Number.isFinite(bi) && ai !== bi) return ai - bi;
      return String(a?.full || a?.short || "").localeCompare(String(b?.full || b?.short || ""));
    });
    return out;
  }

  function standaloneBossChosenTableName(){
    try{
      return String(
        getUnifiedBossTableName({ includePlaceholder:false }) ||
        state?.bossTable ||
        state?.bossHpLive?.name ||
        state?.bossHpTest?.name ||
        ""
      ).trim();
    }catch(_){
      return "";
    }
  }

  function standaloneTableIndexForBossSpecs(tableName){
    try{
      const tableKey = String(getTableKeyForName(tableName) || "").trim();
      const idx = Number(String(tableKey).split("|")[1]);
      if(Number.isFinite(idx) && idx >= 0) return idx;
    }catch(_){}
    try{
      const catalog = standaloneBundledTaskCatalog();
      const key = standaloneNormalizeTableKey(tableName);
      const idx = (catalog?.tables || []).findIndex((entry)=> standaloneNormalizeTableKey(entry?.tableName || entry?.tableKey || "") === key);
      if(idx >= 0) return idx;
    }catch(_){}
    return 0;
  }

  function standaloneBossSpecKey(name){
    try{ return standaloneNormalizeLoose(name); }catch(_){}
    return String(name || "").toLowerCase().replace(/[^a-z0-9%+]+/g, " ").replace(/\s+/g, " ").trim();
  }

  function standaloneBossSpecFromTask(tableName, name, difficulty, kind, explanation){
    const taskName = String(name || "").trim();
    if(!taskName) return null;
    return {
      name: taskName,
      difficulty: String(difficulty || "").trim().toLowerCase() || "medium",
      kind: String(kind || (/\bscore\b/i.test(taskName) ? "score" : "task")).trim().toLowerCase() || "task",
      explanation: String(explanation || standaloneTaskExplanationFor(tableName, taskName) || "").trim()
    };
  }

  function standaloneBossSpecFromNode(tableName, node, fallbackDifficulty){
    if(!node) return null;
    const entry = node.taskShuffleEntry || node.genericEntry || {};
    const taskName = String(
      (()=>{ try{ return getTaskNameFromLocationNode(node); }catch(_){ return ""; } })() ||
      node.short ||
      node.full ||
      ""
    ).trim();
    if(!taskName) return null;
    const difficulty = String(
      node.genericDifficulty ||
      entry.difficulty ||
      (()=>{ try{ return inferLocationDifficulty(node); }catch(_){ return ""; } })() ||
      fallbackDifficulty ||
      ""
    ).trim().toLowerCase();
    const kind = String(entry.kind || entry.task_type || entry.type || (/\bscore\b/i.test(taskName) ? "score" : "task")).trim().toLowerCase();
    const explanation = String(entry.explanation || standaloneTaskExplanationFor(tableName, taskName) || "").trim();
    return standaloneBossSpecFromTask(tableName, taskName, difficulty, kind, explanation);
  }

  function standaloneScoreNumber(value){
    const text = String(value || "");
    const match = text.match(/(\d[\d,]*)\s*\+?/);
    if(!match) return 0;
    const n = Number(String(match[1] || "").replace(/,/g, ""));
    return Number.isFinite(n) && n > 0 ? Math.round(n) : 0;
  }

  function standaloneScoreThresholdsForDifficulty(scores, fallbackScores, difficulty){
    const source = []
      .concat(Array.isArray(scores?.[difficulty]) ? scores[difficulty] : [])
      .concat(Array.isArray(fallbackScores?.[difficulty]) ? fallbackScores[difficulty] : []);
    const nums = [];
    const seen = new Set();
    source.forEach((value)=>{
      const n = standaloneScoreNumber(value);
      if(n <= 0 || seen.has(n)) return;
      seen.add(n);
      nums.push(n);
    });
    nums.sort((a, b)=>a - b);
    if(nums.length < 2){
      const base = nums[0] || standaloneScoreNumber(Array.isArray(fallbackScores?.[difficulty]) ? fallbackScores[difficulty][0] : "");
      const scale = difficulty === "hard" ? 1.48 : (difficulty === "medium" ? 1.42 : 1.36);
      const next = Math.max(base + 1, Math.round(base * scale));
      if(base > 0 && !seen.has(next)) nums.push(next);
    }
    return nums.slice(0, 2).map(standaloneFormatScore);
  }

  function standaloneBossScoreSpec(tableName, difficulty, threshold){
    const label = String(threshold || "").trim();
    if(!label) return null;
    const diff = String(difficulty || "medium").toLowerCase();
    return standaloneBossSpecFromTask(tableName, `Obtain a score of ${label}`, diff, "score");
  }

  function standaloneBossSpecIsScore(spec){
    const kind = String(spec?.kind || "").toLowerCase();
    const name = String(spec?.name || "");
    return kind === "score" || /\bscore\b/i.test(name);
  }

  function standaloneBossDifficulty(spec, fallback){
    const raw = String(spec?.difficulty || fallback || "").trim().toLowerCase();
    if(raw === "easy" || raw === "medium" || raw === "hard") return raw;
    const name = String(spec?.name || "");
    if(/\beasy\b/i.test(name)) return "easy";
    if(/\bmedium\b|\bmed\b/i.test(name)) return "medium";
    if(/\bhard\b/i.test(name)) return "hard";
    return String(fallback || "medium").toLowerCase();
  }

  function standaloneStableHash(value){
    const text = String(value || "");
    let h = 2166136261 >>> 0;
    for(let i = 0; i < text.length; i += 1){
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }

  function standaloneBossDamagePool(difficulty){
    const diff = standaloneBossDifficulty({ difficulty }, "medium");
    if(diff === "easy") return [7, 8, 8, 9, 9, 10, 11, 12];
    if(diff === "hard") return [14, 15, 16, 17, 18, 19, 20, 22];
    return [10, 11, 12, 12, 13, 14, 15, 16];
  }

  function standaloneBossDamagePctForSpec(tableName, spec, index, sourceFull){
    const pool = standaloneBossDamagePool(spec?.difficulty);
    const key = [
      (()=>{ try{ return standaloneRewardSeedKey(); }catch(_){ return ""; } })(),
      String(tableName || ""),
      String(spec?.name || ""),
      String(spec?.difficulty || ""),
      String(sourceFull || ""),
      Number(index || 0)
    ].join("|");
    return pool[standaloneStableHash(key) % pool.length] || 12;
  }

  function standaloneRegularNodesForBossTable(tableName){
    const out = [];
    const seen = new Set();
    try{
      const map = ap?.locsByTableKey;
      if(!(map instanceof Map)) return out;
      const targetKey = standaloneCanonicalTableKey(tableName);
      const pushNode = (node)=>{
        const id = Number(node?.id);
        const key = Number.isFinite(id) && id > 0 ? `id:${id}` : `txt:${String(node?.full || node?.short || "")}`;
        if(seen.has(key)) return;
        seen.add(key);
        out.push(node);
      };
      const direct = targetKey ? (map.get(targetKey) || []) : [];
      direct.forEach((node)=>{ if(!standaloneIsExplicitBossCheckNode(node)) pushNode(node); });
      for(const list of map.values()){
        for(const node of (Array.isArray(list) ? list : [])){
          if(standaloneIsExplicitBossCheckNode(node)) continue;
          const nodeKey = standaloneCanonicalTableKey(node?.tableName || (()=>{ try{ return splitLocName(node?.full || "").table; }catch(_){ return ""; } })());
          if(targetKey && nodeKey === targetKey) pushNode(node);
        }
      }
    }catch(_){}
    return standaloneDedupeSortLocationNodes(out);
  }

  function standaloneCatalogBossSpecsForTable(tableName){
    const tableIndex = standaloneTableIndexForBossSpecs(tableName);
    const entry = standaloneCatalogEntryForTable(tableName);
    const tasks = entry?.tasksByDifficulty || {};
    const scores = entry?.scoreTargets || standaloneFallbackScores(tableIndex);
    const fallback = standaloneFallbackScores(tableIndex);
    const out = [];
    const pushTask = (difficulty, name, kind)=>{
      const spec = standaloneBossSpecFromTask(tableName, name, difficulty, kind);
      if(spec) out.push(spec);
    };
    const pushTasks = (difficulty, count)=>{
      const pool = Array.isArray(tasks[difficulty]) ? tasks[difficulty] : [];
      pool.map((value)=>String(value || "").trim()).filter(Boolean).slice(0, count).forEach((name)=>pushTask(difficulty, name, "task"));
    };
    pushTasks("easy", 2);
    standaloneScoreThresholdsForDifficulty(scores, fallback, "easy").forEach((threshold)=>pushTask("easy", `Obtain a score of ${threshold}`, "score"));
    pushTasks("medium", 3);
    standaloneScoreThresholdsForDifficulty(scores, fallback, "medium").forEach((threshold)=>pushTask("medium", `Obtain a score of ${threshold}`, "score"));
    pushTasks("hard", 2);
    standaloneScoreThresholdsForDifficulty(scores, fallback, "hard").forEach((threshold)=>pushTask("hard", `Obtain a score of ${threshold}`, "score"));
    if(out.length < 10){
      standaloneTaskSpecs(tableName, tableIndex).forEach((spec)=>pushTask(spec.difficulty, spec.name, spec.kind));
    }
    return out;
  }

  function standaloneBossRepresentativeSpecs(tableName){
    const seen = new Set();
    const tasks = [];
    const scores = { easy:[], medium:[], hard:[] };
    const pushCandidate = (spec)=>{
      if(!spec || !String(spec.name || "").trim()) return;
      const key = standaloneBossSpecKey(spec.name);
      if(!key || seen.has(key)) return;
      seen.add(key);
      const diff = standaloneBossDifficulty(spec, "medium");
      const normalized = { ...spec, difficulty: diff };
      if(standaloneBossSpecIsScore(normalized)){
        scores[diff].push(normalized);
      }else{
        tasks.push(normalized);
      }
    };
    const regularNodes = standaloneRegularNodesForBossTable(tableName);
    regularNodes.forEach((node, index)=>{
      const fallbackDifficulty = index < 2 ? "easy" : (index < 4 ? "medium" : "hard");
      pushCandidate(standaloneBossSpecFromNode(tableName, node, fallbackDifficulty));
    });
    standaloneCatalogBossSpecsForTable(tableName).forEach(pushCandidate);
    standaloneBossTaskSpecs().forEach((spec)=>{
      if(spec.name === "Boss Victory") return;
      pushCandidate(spec);
    });
    Object.keys(scores).forEach((diff)=>{
      scores[diff].sort((a, b)=>standaloneScoreNumber(a.name) - standaloneScoreNumber(b.name));
    });
    const takeTask = (difficulty)=>{
      const diff = String(difficulty || "").toLowerCase();
      const idx = tasks.findIndex((spec)=>standaloneBossDifficulty(spec, "medium") === diff);
      if(idx >= 0) return tasks.splice(idx, 1)[0];
      return tasks.shift() || null;
    };
    const takeScore = (difficulty)=>{
      const diff = String(difficulty || "medium").toLowerCase();
      return scores[diff]?.shift?.() || null;
    };
    const ordered = [];
    const pushOrdered = (spec)=>{ if(spec) ordered.push(spec); };
    pushOrdered(takeTask("easy"));
    pushOrdered(takeScore("easy"));
    pushOrdered(takeScore("easy"));
    pushOrdered(takeTask("medium"));
    pushOrdered(takeScore("medium"));
    pushOrdered(takeScore("medium"));
    pushOrdered(takeTask("hard"));
    pushOrdered(takeScore("hard"));
    pushOrdered(takeScore("hard"));
    pushOrdered(takeTask("hard") || takeTask("medium") || takeTask("easy"));
    ["easy", "medium", "hard"].forEach((diff)=>{
      while(ordered.length < 10 && scores[diff]?.length) pushOrdered(takeScore(diff));
    });
    while(ordered.length < 10 && tasks.length) pushOrdered(tasks.shift());
    return ordered.slice(0, 10);
  }

  function standaloneDeriveBossCheckNode(baseNode, spec, tableName, index){
    const sourceFull = String(baseNode?.full || baseNode?.short || "").trim();
    const taskName = String(spec?.name || `Boss Attack ${Number(index || 0) + 1}`).trim();
    const difficulty = String(spec?.difficulty || (index < 3 ? "easy" : (index < 7 ? "medium" : "hard"))).trim().toLowerCase();
    const kind = String(spec?.kind || (/\bscore\b/i.test(taskName) ? "score" : "task")).trim().toLowerCase();
    const full = `${tableName || "Boss Table"} - ${taskName}`;
    const damagePct = standaloneBossDamagePctForSpec(tableName, spec, index, sourceFull);
    const entry = {
      location: sourceFull || full,
      source_location: full,
      table: tableName || "Boss Table",
      target_table: tableName || "Boss Table",
      source_table: tableName || "Boss Table",
      difficulty,
      kind,
      task_type: kind,
      display_name: taskName,
      objective: taskName,
      title: taskName,
      explanation: String(spec?.explanation || standaloneTaskExplanationFor(tableName, taskName) || "").trim(),
      randomized: true,
      boss_table_specific: true
    };
    return {
      ...(baseNode || {}),
      full,
      short: taskName,
      tableName: tableName || "Boss Table",
      tableKey: standaloneBossBucketKey(),
      baseShort: taskName,
      taskShuffleEntry: entry,
      genericEntry: entry,
      genericDifficulty: difficulty,
      genericTaskType: kind,
      standaloneBossCheck: true,
      standaloneBossDerived: true,
      standaloneBossIndex: Number(index || 0),
      standaloneBossSourceLocation: sourceFull,
      standaloneBossDamagePct: damagePct,
      bossDamagePct: damagePct,
      bossDamageItemName: `Boss Damage ${damagePct}%`,
      standaloneBossAttackTitle: (()=>{ try{ return bossAttackTitleForCategory(achClassifyTaskName(taskName), taskName); }catch(_){ return "Attack the Boss!"; } })()
    };
  }

  function standaloneDeriveBossVictoryNode(baseNode, tableName){
    const full = `${tableName || "Boss Table"} - Boss Victory`;
    const entry = {
      location: String(baseNode?.full || baseNode?.short || full),
      source_location: full,
      table: tableName || "Boss Table",
      target_table: tableName || "Boss Table",
      source_table: tableName || "Boss Table",
      difficulty: "hard",
      kind: "victory",
      task_type: "victory",
      display_name: "Boss Victory",
      objective: "Boss Victory",
      title: "Boss Victory",
      explanation: "Reduce Boss HP to 0%, then redeem this final Boss Victory check.",
      randomized: true,
      boss_table_specific: true
    };
    return {
      ...(baseNode || {}),
      full,
      short: "Boss Victory",
      tableName: tableName || "Boss Table",
      tableKey: standaloneBossBucketKey(),
      baseShort: "Boss Victory",
      taskShuffleEntry: entry,
      genericEntry: entry,
      genericDifficulty: "hard",
      genericTaskType: "victory",
      standaloneBossCheck: true,
      standaloneBossDerived: true,
      standaloneBossVictory: true
    };
  }

  function standaloneBossSpecificChecksAreAllowed(){
    try{
      if(!standaloneBossChosenTableName()) return false;
      if(typeof isBossTableRevealReady === "function" && isBossTableRevealReady()) return true;
      const bossUnlocked = typeof isBossUnlocked === "function"
        ? !!isBossUnlocked()
        : !!(state?.bossOpen || state?.worlds?.boss?.locked === false);
      if(!bossUnlocked) return false;
      if(standaloneProfileRuntime?.randomizerReady || standaloneProfileRuntime?.randomizerStarted) return true;
      if(ap?.connected || ap?.inherentSeedActive) return true;
      return !!state?.bossOpen;
    }catch(_){
      return false;
    }
  }

  function standaloneBossCheckSourceNodesFallback(){
    const out = [];
    const seen = new Set();
    try{
      if(!standaloneBossSpecificChecksAreAllowed()) return out;
      const map = ap?.locsByTableKey;
      if(!(map instanceof Map) || !map.size) return out;
      const keys = [
        standaloneBossBucketKey(),
        (()=>{ try{ return String(normKey("(Boss Table)") || ""); }catch(_){ return ""; } })(),
        (()=>{ try{ return String(normKey("Boss") || ""); }catch(_){ return ""; } })(),
        "boss",
        "bosstable"
      ].filter(Boolean);
      const push = (node)=>{
        if(!standaloneIsExplicitBossCheckNode(node)) return;
        const id = Number(node?.id);
        const key = Number.isFinite(id) && id > 0 ? `id:${id}` : `txt:${String(node?.full || node?.short || "")}`;
        if(seen.has(key)) return;
        seen.add(key);
        out.push(node);
      };
      keys.forEach((key)=>{
        const list = map.get(key);
        if(Array.isArray(list)) list.forEach(push);
      });
      if(!out.length){
        for(const list of map.values()){
          if(Array.isArray(list)) list.forEach(push);
        }
      }
    }catch(_){}
    return standaloneDedupeSortLocationNodes(out);
  }

  function standaloneBuildBossSpecificCheckNodes(nodes){
    try{
      let source = standaloneDedupeSortLocationNodes((Array.isArray(nodes) ? nodes : []).filter(standaloneIsExplicitBossCheckNode));
      if(!source.length) source = standaloneBossCheckSourceNodesFallback();
      const tableName = standaloneBossChosenTableName();
      if(!source.length || !tableName) return source;
      const victory = source.find((node)=> {
        try{ return !!bossIsVictoryLocationNode(node); }catch(_){ return false; }
      }) || null;
      const damageNodes = source.filter((node)=>{
        if(node === victory) return false;
        try{ if(bossIsVictoryLocationNode(node)) return false; }catch(_){}
        return true;
      }).slice(0, 10);
      const specs = standaloneBossRepresentativeSpecs(tableName);
      const derived = damageNodes.map((node, index)=>standaloneDeriveBossCheckNode(node, specs[index], tableName, index));
      if(victory) derived.push(standaloneDeriveBossVictoryNode(victory, tableName));
      try{
        window.__flprStandaloneBossSpecificChecks = {
          tableName,
          count: derived.length,
          attackCount: damageNodes.length,
          labels: derived.map((node)=>String(node.short || "")),
          sourceCount: source.length
        };
      }catch(_){}
      return derived;
    }catch(_){}
    return Array.isArray(nodes) ? nodes : [];
  }

  function standaloneBossCheckNodeByLocId(locId){
    const id = Number(locId);
    if(!Number.isFinite(id) || id <= 0) return null;
    try{
      const nodes = typeof resolveBossChecksNodes === "function" ? resolveBossChecksNodes() : [];
      return (Array.isArray(nodes) ? nodes : []).find((node)=>Number(node?.id) === id) || null;
    }catch(_){}
    return null;
  }

  function standaloneBossVisibleTaskName(node){
    try{
      const value = String(getTaskNameFromLocationNode(node) || node?.short || node?.full || "").trim();
      if(value) return value;
    }catch(_){}
    return String(node?.short || node?.full || "Boss Attack").trim() || "Boss Attack";
  }

  function standaloneBossAttackTitleForNode(node, taskName){
    const stored = String(node?.standaloneBossAttackTitle || "").trim();
    if(stored) return stored;
    try{ return bossAttackTitleForCategory(achClassifyTaskName(taskName), taskName); }catch(_){}
    return "Attack the Boss!";
  }

  function standaloneBossDamagePctForNode(node){
    const stored = Number(node?.standaloneBossDamagePct || node?.bossDamagePct);
    if(Number.isFinite(stored) && stored > 0) return Math.max(1, Math.round(stored));
    try{
      return standaloneBossDamagePctForSpec(
        node?.tableName || standaloneBossChosenTableName(),
        node?.taskShuffleEntry || node?.genericEntry || { name:standaloneBossVisibleTaskName(node), difficulty:node?.genericDifficulty },
        Number(node?.standaloneBossIndex || 0),
        node?.standaloneBossSourceLocation || node?.full || node?.short || ""
      );
    }catch(_){}
    return 12;
  }

  function standaloneSetBossNodeTitle(title, btn, taskName){
    if(!title) return;
    while(title.firstChild) title.removeChild(title.firstChild);
    const match = String(taskName || "").match(/^(?:obtain a )?score(?: target)?(?: of)?\s+(.+)$/i);
    if(match){
      btn.classList.add("scoreNode");
      btn.classList.remove("taskNode");
      const lead = document.createElement("span");
      lead.className = "scoreLead";
      lead.textContent = "SCORE TARGET";
      const value = document.createElement("span");
      value.className = "scoreValue";
      value.textContent = String(match[1] || "").trim();
      title.appendChild(lead);
      title.appendChild(value);
      return;
    }
    btn.classList.add("taskNode");
    btn.classList.remove("scoreNode");
    title.textContent = String(taskName || "Boss Attack").trim() || "Boss Attack";
  }

  function standaloneApplyBossCardPresentation(){
    try{
      const cards = document.querySelectorAll("#viewChecks #checksBody .tableBlock.bossChecksBig .nodeBtn.bossNode[data-locid], #viewChecks .checksBody.bossMode .nodeBtn.bossNode[data-locid]");
      cards.forEach((btn)=>{
        const locId = Number(btn.dataset.locid || 0);
        const node = standaloneBossCheckNodeByLocId(locId);
        const isVictory = (()=>{ try{ return !!bossIsVictoryLocationNode(node); }catch(_){ return false; } })();
        const cell = btn.closest?.(".nodeCell");
        if(isVictory){
          if(cell) cell.classList.add("flprStandaloneBossVictoryHidden");
          btn.setAttribute("aria-hidden", "true");
          btn.tabIndex = -1;
          return;
        }
        if(cell) cell.classList.remove("flprStandaloneBossVictoryHidden");
        btn.classList.add("flprStandaloneBossCard");
        const taskName = standaloneBossVisibleTaskName(node);
        const attackTitle = standaloneBossAttackTitleForNode(node, taskName);
        const tierBadge = btn.querySelector(".tierBadge");
        if(tierBadge){
          tierBadge.textContent = "B";
          tierBadge.dataset.full = "Boss";
        }
        let subtag = btn.querySelector(".flprStandaloneBossAttackSubtag");
        if(!subtag){
          subtag = document.createElement("div");
          subtag.className = "flprStandaloneBossAttackSubtag";
          if(tierBadge && tierBadge.parentNode === btn){
            tierBadge.insertAdjacentElement("afterend", subtag);
          }else{
            btn.insertBefore(subtag, btn.firstChild);
          }
        }
        subtag.textContent = attackTitle;
        subtag.title = attackTitle;
        standaloneSetBossNodeTitle(btn.querySelector(".nodeTitle"), btn, taskName);
        const small = btn.querySelector(".small");
        const damagePct = standaloneBossDamagePctForNode(node);
        if(small){
          const checked = btn.classList.contains("checked");
          const pending = btn.classList.contains("pending");
          small.textContent = `DAMAGE; ${damagePct}%${checked ? " ; CHECKED" : (pending ? " ; PENDING" : "")}`;
        }
        btn.dataset.bossDamage = String(damagePct);
      });
    }catch(_){}
  }
  try{ window.__flprStandaloneApplyBossCardPresentationForTest = standaloneApplyBossCardPresentation; }catch(_){}

  function standaloneRepairBossCheckNodeBuckets(){
    try{
      const map = ap?.locsByTableKey;
      if(!(map instanceof Map) || !map.size) return false;
      const bossKeys = new Set([
        "boss",
        "bosstable",
        standaloneBossBucketKey(),
        (()=>{ try{ return String(normKey("(Boss Table)") || ""); }catch(_){ return ""; } })()
      ].filter(Boolean));
      const bossBucketKey = standaloneBossBucketKey();
      const bossNodes = [];
      let changed = false;
      for(const [key, list] of Array.from(map.entries())){
        if(!Array.isArray(list)) continue;
        const keyText = String(key || "");
        const keyIsBoss = bossKeys.has(keyText);
        const keep = [];
        list.forEach((node)=>{
          if(standaloneIsExplicitBossCheckNode(node)){
            const bossNode = {
              ...node,
              tableName: "Boss Table",
              tableKey: bossBucketKey,
              standaloneBossCheck: true
            };
            bossNodes.push(bossNode);
            if(keyIsBoss) keep.push(bossNode);
            else changed = true;
          }else{
            keep.push(node);
          }
        });
        const next = standaloneDedupeSortLocationNodes(keep);
        if(next.length !== list.length || next.some((node, index)=>node !== list[index])){
          map.set(key, next);
          changed = true;
        }
      }
      if(bossNodes.length){
        const existing = Array.isArray(map.get(bossBucketKey)) ? map.get(bossBucketKey) : [];
        const merged = standaloneDedupeSortLocationNodes(existing.concat(bossNodes));
        map.set(bossBucketKey, merged);
        try{
          const altKey = String(normKey("(Boss Table)") || "");
          if(altKey && altKey !== bossBucketKey) map.set(altKey, merged);
        }catch(_){}
        changed = true;
      }
      return changed;
    }catch(_){
      return false;
    }
  }

  function standaloneFilterNonBossCheckNodes(nodes, opts){
    if(!Array.isArray(nodes)) return nodes;
    const tableKey = String(opts?.tableKey || "");
    if(tableKey.startsWith("boss|")) return nodes;
    const filtered = nodes.filter((node)=>!standaloneIsExplicitBossCheckNode(node));
    return filtered.length === nodes.length ? nodes : filtered;
  }

  function standaloneKnownApItemName(itemId, playerId, gameHint){
    const id = Number(itemId);
    if(!Number.isFinite(id)) return "";
    const idKey = String(Math.round(id));
    const game = String(gameHint || (()=>{ try{ return typeof apPlayerGame === "function" ? apPlayerGame(playerId, "") : ""; }catch(_){ return ""; } })() || "").trim().toLowerCase();
    const exact = game ? STANDALONE_KNOWN_AP_ITEM_NAMES[`${game}|${idKey}`] : "";
    return String(exact || STANDALONE_KNOWN_AP_ITEM_NAMES[idKey] || "").trim();
  }

  function standaloneResolveApItemName(itemId, playerId, fallback, gameHint, opts){
    opts = opts || {};
    const id = Number(itemId);
    const fb = String(fallback || "").trim();
    try{
      if(Number.isFinite(id)){
        const self = standaloneSelfSlotId();
        const targetPlayerId = Number(playerId);
        const targetIsOtherPlayer = !!self && Number.isFinite(targetPlayerId) && targetPlayerId > 0 && targetPlayerId !== self;
        const playerGame = String(gameHint || standaloneGameForPlayer(playerId, "", "") || (typeof apPlayerGame === "function" ? apPlayerGame(playerId, "") : "") || "").trim();
        const ownGame = standaloneSelfGameName();
        const crossGame = !!playerGame && !!ownGame && !standaloneGamesMatch(playerGame, ownGame);
        const pkgName = playerGame && typeof apDataPackageForGame === "function"
          ? String(apDataPackageForGame(playerGame)?.itemNameById?.get?.(id) || "").trim()
          : "";
        if(pkgName && !standaloneLooksUnresolvedItemName(pkgName, id)) return pkgName;
        const known = standaloneKnownApItemName(id, playerId, playerGame || gameHint);
        if(known) return known;
        if(targetIsOtherPlayer && (crossGame || opts.preferServerForCrossGame === true)){
          if(fb && !standaloneLooksUnresolvedItemName(fb, id)) return fb;
          return Number.isFinite(id) ? `Item #${id}` : (fb || "Unknown Item");
        }
        try{
          if(typeof apItemNameFor === "function"){
            const resolved = String(apItemNameFor(id, playerId, "") || "").trim();
            if(resolved && !standaloneLooksUnresolvedItemName(resolved, id)) return resolved;
          }
        }catch(_){}
        const ownName = String(ap?.itemNameById?.get?.(id) || "").trim();
        if(ownName && !standaloneLooksUnresolvedItemName(ownName, id)) return ownName;
        try{
          const packages = ap?.gameDataPackages;
          const values = packages && typeof packages.values === "function" ? Array.from(packages.values()) : [];
          for(const pkg of values){
            const name = String(pkg?.itemNameById?.get?.(id) || "").trim();
            if(name && !standaloneLooksUnresolvedItemName(name, id)) return name;
          }
        }catch(_){}
      }
    }catch(_){}
    const known = standaloneKnownApItemName(id, playerId, gameHint);
    if(known) return known;
    return fb || (Number.isFinite(id) ? `Item #${id}` : "Unknown Item");
  }

  function standaloneResolveApLocationName(locId, playerId, fallback){
    const id = Number(locId);
    const fb = String(fallback || "").trim();
    try{
      if(Number.isFinite(id) && id > 0 && typeof apLocationNameFor === "function"){
        const resolved = String(apLocationNameFor(id, playerId, "") || "").trim();
        if(resolved && !/^location\s*#?\s*\d+$/i.test(resolved)) return resolved;
      }
    }catch(_){}
    return fb || (Number.isFinite(id) && id > 0 ? `Location #${id}` : "");
  }

  function standaloneNormalizeLoose(value){
    return String(value || "")
      .toLowerCase()
      .replace(/[\u2012\u2013\u2014]/g, "-")
      .replace(/[_:|]+/g, " ")
      .replace(/\s*-\s*/g, " - ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function standaloneSelfSlotId(){
    try{ return Number(ap?.slot || 0) || 0; }catch(_){ return 0; }
  }

  function standaloneSelfPlayerName(){
    const self = standaloneSelfSlotId();
    try{ if(typeof apPlayerName === "function") return apPlayerName(self, ap?.cfg?.player || ""); }catch(_){}
    try{ return String(ap?.cfg?.player || "Player"); }catch(_){ return "Player"; }
  }

  function standaloneSelfGameName(){
    const self = standaloneSelfSlotId();
    try{ if(typeof apPlayerGame === "function") return apPlayerGame(self, ap?.cfg?.game || ""); }catch(_){}
    try{ return String(ap?.cfg?.game || ""); }catch(_){ return ""; }
  }

  function standaloneGamesMatch(a, b){
    const aa = standaloneNormalizeLoose(a);
    const bb = standaloneNormalizeLoose(b);
    return !!aa && !!bb && aa === bb;
  }

  function standaloneRememberPlayerMeta(id, name, game){
    const slotId = Number(id);
    if(!Number.isFinite(slotId) || slotId <= 0) return false;
    const playerName = String(name || "").trim();
    const gameName = String(game || "").trim();
    let changed = false;
    if(playerName){
      standaloneApPlayerMeta.nameById.set(slotId, playerName);
      try{ ap.playerNameById = ap.playerNameById || new Map(); ap.playerNameById.set(slotId, playerName); }catch(_){}
    }
    if(gameName){
      const prev = String(standaloneApPlayerMeta.gameById.get(slotId) || "").trim();
      standaloneApPlayerMeta.gameById.set(slotId, gameName);
      if(playerName) standaloneApPlayerMeta.gameByName.set(standaloneNormalizeLoose(playerName), gameName);
      try{ ap.gameByPlayerId = ap.gameByPlayerId || new Map(); ap.gameByPlayerId.set(slotId, gameName); }catch(_){}
      try{
        ap.slotInfoById = ap.slotInfoById || new Map();
        const prevInfo = ap.slotInfoById.get(slotId) || {};
        ap.slotInfoById.set(slotId, { ...prevInfo, id:slotId, name:playerName || prevInfo.name || "", game:gameName });
      }catch(_){}
      changed = prev !== gameName;
    }
    return changed;
  }

  function standaloneNetworkPlayerId(p){
    const src = (p && typeof p === "object") ? p : {};
    const raw = Array.isArray(p) ? p[1] : (src.slot ?? src.slot_id ?? src.id ?? src.player);
    const id = Number(raw);
    return Number.isFinite(id) && id > 0 ? id : 0;
  }

  function standaloneNetworkPlayerName(p){
    const src = (p && typeof p === "object") ? p : {};
    return String(Array.isArray(p) ? (p[2] ?? p[3] ?? "") : (src.alias ?? src.name ?? src.player_name ?? "")).trim();
  }

  function standaloneNetworkPlayerGame(p){
    const src = (p && typeof p === "object") ? p : {};
    return String(Array.isArray(p) ? "" : (src.game ?? src.game_name ?? src.slot_game ?? src.world ?? src.world_name ?? "")).trim();
  }

  function standaloneRememberSlotInfo(slotInfo){
    let changed = false;
    try{
      const src = (slotInfo && typeof slotInfo === "object") ? slotInfo : {};
      Object.entries(src).forEach(([slot, info])=>{
        const id = Number(slot);
        if(!Number.isFinite(id) || id <= 0) return;
        const rec = (info && typeof info === "object") ? info : {};
        const name = String(rec.name ?? rec.alias ?? "").trim();
        const game = String(rec.game ?? rec.game_name ?? rec.slot_game ?? "").trim();
        if(standaloneRememberPlayerMeta(id, name, game)) changed = true;
      });
    }catch(_){}
    return changed;
  }

  function standaloneRememberPlayers(players){
    let changed = false;
    try{
      if(!Array.isArray(players)) return false;
      players.forEach((player)=>{
        const id = standaloneNetworkPlayerId(player);
        if(!id) return;
        const name = standaloneNetworkPlayerName(player);
        const game = standaloneNetworkPlayerGame(player);
        if(standaloneRememberPlayerMeta(id, name, game)) changed = true;
      });
    }catch(_){}
    return changed;
  }

  function standaloneRememberApPacketPlayerMeta(pkt){
    let changed = false;
    try{
      const cmd = String(pkt?.cmd || "");
      if(cmd === "RoomInfo"){
        changed = standaloneRememberSlotInfo(pkt.slot_info || pkt.slotInfo || {}) || changed;
        if(Array.isArray(pkt.players)) changed = standaloneRememberPlayers(pkt.players) || changed;
      }
      if(cmd === "Connected" || cmd === "RoomUpdate"){
        changed = standaloneRememberSlotInfo(pkt.slot_info || pkt.slotInfo || {}) || changed;
        changed = standaloneRememberPlayers(pkt.players || []) || changed;
      }
    }catch(_){}
    return changed;
  }

  function standaloneGameForPlayer(playerId, fallbackName, fallbackGame){
    const id = Number(playerId);
    const fb = String(fallbackGame || "").trim();
    if(Number.isFinite(id) && id > 0){
      try{
        const direct = String(ap?.gameByPlayerId?.get?.(id) || "").trim();
        if(direct) return direct;
      }catch(_){}
      try{
        const slotGame = String(ap?.slotInfoById?.get?.(id)?.game || "").trim();
        if(slotGame) return slotGame;
      }catch(_){}
      const cached = String(standaloneApPlayerMeta.gameById.get(id) || "").trim();
      if(cached) return cached;
    }
    const nameKey = standaloneNormalizeLoose(fallbackName);
    if(nameKey){
      const cachedNameGame = String(standaloneApPlayerMeta.gameByName.get(nameKey) || "").trim();
      if(cachedNameGame) return cachedNameGame;
    }
    if(fb) return fb;
    try{
      if(typeof apPlayerGame === "function"){
        const game = String(apPlayerGame(id, "") || "").trim();
        if(game) return game;
      }
    }catch(_){}
    return "";
  }

  function standaloneRequestMissingGamePackages(source){
    try{
      if(typeof apSend !== "function") return false;
      const games = new Set();
      standaloneApPlayerMeta.gameById.forEach((game)=>{ if(game) games.add(String(game)); });
      try{ if(ap?.cfg?.game) games.add(String(ap.cfg.game)); }catch(_){}
      try{ (ap?.roomGames || []).forEach((game)=>{ if(game) games.add(String(game)); }); }catch(_){}
      const missing = Array.from(games).map((game)=>String(game || "").trim()).filter((game)=>{
        if(!game || game === "Archipelago") return false;
        try{ return !(typeof apDataPackageForGame === "function" && apDataPackageForGame(game)); }catch(_){ return true; }
      });
      if(!missing.length) return false;
      setTimeout(()=>{
        try{ apSend({ cmd:"GetDataPackage", games:missing }); }catch(_){}
      }, 0);
      return true;
    }catch(_){
      return false;
    }
  }

  function standalonePackageItemName(gameName, itemId){
    const id = Number(itemId);
    if(!Number.isFinite(id)) return "";
    try{
      const game = String(gameName || "").trim();
      if(game && typeof apDataPackageForGame === "function"){
        const name = String(apDataPackageForGame(game)?.itemNameById?.get?.(id) || "").trim();
        if(name && !standaloneLooksUnresolvedItemName(name, id)) return name;
      }
    }catch(_){}
    return "";
  }

  function standaloneOwnPackageItemName(itemId){
    const id = Number(itemId);
    if(!Number.isFinite(id)) return "";
    const ownGame = standaloneSelfGameName();
    const pkgName = standalonePackageItemName(ownGame, id);
    if(pkgName) return pkgName;
    try{
      const ownName = String(ap?.itemNameById?.get?.(id) || "").trim();
      if(ownName && !standaloneLooksUnresolvedItemName(ownName, id)) return ownName;
    }catch(_){}
    return "";
  }

  function standaloneProgressiveBallTarget(itemName){
    try{
      if(typeof parseProgressiveBallTarget === "function"){
        const parsed = String(parseProgressiveBallTarget(itemName) || "").trim();
        if(parsed) return parsed;
      }
    }catch(_){}
    const text = String(itemName || "").trim();
    const match = text.match(/^progressive\s*ball(?:\s*(?:-|:|\||for|to))\s*(.+)$/i)
      || text.match(/^progressive\s*ball\s+(.+)$/i);
    return match ? String(match[1] || "").trim() : "";
  }

  function standaloneTableCode(value){
    const raw = String(value || "").trim();
    if(!raw) return "";
    try{
      const code = String(getRepoCanonicalTableCode(raw) || "").trim();
      if(code) return code;
    }catch(_){}
    try{
      const name = String(getRepoCanonicalTableName(raw) || "").trim();
      const code = String(name ? (getRepoCanonicalTableCode(name) || "") : "").trim();
      if(code) return code;
    }catch(_){}
    try{
      const code = String(achResolveTableCode(raw) || "").trim();
      if(code) return code;
    }catch(_){}
    return "";
  }

  function standaloneSameProgressiveTarget(a, b){
    const at = String(a || "").trim();
    const bt = String(b || "").trim();
    if(!at || !bt) return false;
    try{
      const ac = standaloneTableCode(at);
      const bc = standaloneTableCode(bt);
      if(ac && bc) return ac === bc;
    }catch(_){}
    return standaloneNormalizeLoose(at) === standaloneNormalizeLoose(bt);
  }

  function standaloneTableNameKeys(value){
    const keys = new Set();
    const add = (v)=>{
      const loose = standaloneNormalizeLoose(v);
      if(loose) keys.add(loose);
      try{
        const canon = standaloneNormalizeLoose(getRepoCanonicalTableName(v));
        if(canon) keys.add(canon);
      }catch(_){}
      try{
        const display = standaloneNormalizeLoose(getRepoDisplayTableName(v));
        if(display) keys.add(display);
      }catch(_){}
    };
    add(value);
    return keys;
  }

  function standaloneFindActiveTableKey(tableName, directLookup){
    const raw = String(tableName || "").trim();
    if(!raw) return "";
    const lookup = typeof directLookup === "function" ? directLookup : null;
    const directCandidates = [raw];
    try{
      const canonicalName = String(getRepoCanonicalTableName(raw) || "").trim();
      if(canonicalName && !directCandidates.includes(canonicalName)) directCandidates.push(canonicalName);
    }catch(_){}
    for(const candidate of directCandidates){
      if(!candidate) continue;
      try{
        const key = lookup ? lookup(candidate) : (typeof getTableKeyForName === "function" ? getTableKeyForName(candidate) : "");
        if(key) return String(key);
      }catch(_){}
    }

    const wantedCode = standaloneTableCode(raw);
    const wantedKeys = standaloneTableNameKeys(raw);
    try{
      for(const [worldId, world] of Object.entries(state?.worlds || {})){
        const tables = Array.isArray(world?.tables) ? world.tables : [];
        for(let index = 0; index < tables.length; index++){
          const slotName = String(tables[index] || "").trim();
          if(!slotName) continue;
          const slotCode = standaloneTableCode(slotName);
          if(wantedCode && slotCode && slotCode === wantedCode) return `${worldId}|${index}`;
          const slotKeys = standaloneTableNameKeys(slotName);
          for(const key of wantedKeys){
            if(slotKeys.has(key)) return `${worldId}|${index}`;
          }
        }
      }
    }catch(_){}
    return "";
  }

  function standaloneFlagsForItem(flags, itemName){
    let f = Number(flags || 0) || 0;
    const name = String(itemName || "");
    if(!(f & 0b100) && standaloneProgressiveBallTarget(name)) f |= 0b001;
    try{ if(!(f & 0b100) && typeof isBossKeyItemName === "function" && isBossKeyItemName(name)) f |= 0b001; }catch(_){}
    return f;
  }

  function standaloneIsActiveSeedTableName(tableName){
    try{ if(typeof isActiveSeedTableName === "function") return !!isActiveSeedTableName(tableName); }catch(_){}
    try{ if(typeof getTableKeyForName === "function") return !!getTableKeyForName(tableName); }catch(_){}
    return !!standaloneFindActiveTableKey(tableName);
  }

  function standaloneShouldTreatSentMetaAsOwnProgressive(meta, itemName){
    const self = standaloneSelfSlotId();
    if(!self || !meta) return false;
    const resolvedName = String(itemName || meta.itemName || "").trim();
    const serverName = String(meta.serverItemName || standaloneCachedServerSentMeta(meta)?.serverItemName || "").trim();
    if(serverName && !standaloneProgressiveBallTarget(serverName)) return false;
    const target = standaloneProgressiveBallTarget(resolvedName);
    if(!target) return false;
    const receiverId = Number(meta.receiverId || 0) || 0;
    if(receiverId === self) return true;
    if(receiverId && receiverId !== self) return false;
    const receiverName = standaloneNormalizeLoose(meta.receiverPlayer);
    const selfName = standaloneNormalizeLoose(standaloneSelfPlayerName());
    return !!receiverName && !!selfName && receiverName === selfName;
  }

  function standaloneCoerceOwnProgressiveSentMeta(meta){
    if(!meta || typeof meta !== "object") return meta;
    const itemName = String(meta.itemName || "").trim();
    if(!standaloneShouldTreatSentMetaAsOwnProgressive(meta, itemName)) return meta;
    const self = standaloneSelfSlotId();
    const ownGame = standaloneSelfGameName();
    return {
      ...meta,
      receiverId: self,
      receiverPlayer: standaloneSelfPlayerName(),
      receiverGame: ownGame,
      itemName: standaloneResolveApItemName(meta.itemId, self, itemName || standaloneOwnPackageItemName(meta.itemId) || "Unknown Item", ownGame),
      flags: standaloneFlagsForItem(meta.flags, itemName)
    };
  }

  function standaloneSplitLocationName(value){
    try{
      if(typeof splitLocName === "function") return splitLocName(value);
    }catch(_){}
    const raw = String(value || "").trim();
    const parts = raw.split(/\s+[\u2012\u2013\u2014-]\s+/);
    return parts.length > 1 ? { table:parts[0].trim(), rest:parts.slice(1).join(" - ").trim() } : { table:"", rest:raw };
  }

  function standaloneIsGenericSlotTaskName(value){
    return /^(easy|medium|hard)\s+task$/i.test(String(value || "").trim());
  }

  function standaloneNodeForLocation(locId, locationName){
    const id = Number(locId);
    try{
      if(Number.isFinite(id) && id > 0 && ap?.locById?.get){
        const node = ap.locById.get(id);
        if(node) return node;
      }
    }catch(_){}
    const raw = String(locationName || "").trim();
    if(!raw) return null;
    try{
      if(ap?.locById?.values){
        for(const node of ap.locById.values()){
          if(String(node?.full || "").trim() === raw || String(node?.baseShort || node?.short || "").trim() === raw) return node;
        }
      }
    }catch(_){}
    return null;
  }

  function standaloneLocationDisplayName(locationName, locId){
    const raw = String(locationName || "").trim();
    let display = raw;
    try{
      if(typeof getDisplayedLocationName === "function"){
        display = String(getDisplayedLocationName(raw) || raw).trim();
      }
    }catch(_){}
    const scoreDisplay = standaloneScoreSlotDisplayName(raw, display, locId);
    if(scoreDisplay) return scoreDisplay;
    const split = standaloneSplitLocationName(display || raw);
    if(!standaloneIsGenericSlotTaskName(split.rest)) return display || raw;

    try{
      const node = standaloneNodeForLocation(locId, raw || display);
      if(node){
        let taskName = "";
        try{ if(typeof getTaskNameFromLocationNode === "function") taskName = String(getTaskNameFromLocationNode(node) || "").trim(); }catch(_){}
        if(taskName && !standaloneIsGenericSlotTaskName(taskName)){
          const tableName = String(node.tableName || node.table || split.table || "").trim();
          return tableName ? `${tableName} - ${taskName}` : taskName;
        }
      }
    }catch(_){}

    try{
      const cached = standaloneSlotTaskEntryForLocation(raw || display);
      const taskName = standaloneTaskEntryObjective(cached);
      if(taskName && !standaloneIsGenericSlotTaskName(taskName)){
        const tableName = String(cached?.target_table || cached?.targetTable || cached?.table || split.table || standaloneSplitLocationName(raw).table || "").trim();
        return tableName ? `${tableName} - ${taskName}` : taskName;
      }
    }catch(_){}

    try{
      const entry = (typeof getTaskShuffleEntryForLocationName === "function" ? getTaskShuffleEntryForLocationName(raw) : null)
        || (typeof getGenericCheckEntryForLocationName === "function" ? getGenericCheckEntryForLocationName(raw) : null);
      const taskName = String(entry?.objective || entry?.display_name || entry?.title || "").trim();
      if(taskName && !standaloneIsGenericSlotTaskName(taskName)){
        const tableName = String(entry?.target_table || entry?.table || split.table || standaloneSplitLocationName(raw).table || "").trim();
        return tableName ? `${tableName} - ${taskName}` : taskName;
      }
    }catch(_){}

    return display || raw;
  }

  function standaloneScoreSlotDisplayName(rawName, displayName, locId){
    const titleDifficulty = (value)=>{
      const diff = String(value || "").trim().toLowerCase();
      if(diff === "easy") return "Easy";
      if(diff === "medium") return "Medium";
      if(diff === "hard") return "Hard";
      return "";
    };
    const directCandidates = [rawName, displayName].map((value)=>String(value || "").trim()).filter(Boolean);
    for(const candidate of directCandidates){
      const split = standaloneSplitLocationName(candidate);
      const match = String(split.rest || "").match(/^(easy|medium|hard)\s+score\s*\(([^)]+)\)$/i);
      if(match && split.table){
        return `${split.table} - ${titleDifficulty(match[1])} Score (${String(match[2] || "").trim()})`;
      }
    }
    for(const candidate of directCandidates){
      const split = standaloneSplitLocationName(candidate);
      const match = String(split.rest || "").match(/^obtain\s+a\s+score\s+of\s+(.+)$/i);
      if(!match || !split.table) continue;
      let difficulty = "";
      try{
        const entry = standaloneSlotTaskEntryForLocation(rawName) || standaloneSlotTaskEntryForLocation(displayName);
        difficulty = String(entry?.difficulty || "").trim().toLowerCase();
      }catch(_){}
      if(!difficulty){
        for(const direct of directCandidates){
          const directSplit = standaloneSplitLocationName(direct);
          const directMatch = String(directSplit.rest || "").match(/^(easy|medium|hard)\s+score\b/i);
          if(directMatch){ difficulty = String(directMatch[1] || "").toLowerCase(); break; }
        }
      }
      const label = titleDifficulty(difficulty);
      if(label) return `${split.table} - ${label} Score (${String(match[1] || "").trim()})`;
    }
    return "";
  }

  function standaloneFormatItemSendLogLine(meta){
    const next = standaloneResolveSentMeta(meta);
    if(!next) return "";
    const sender = String(next.senderPlayer || "Unknown Player").trim();
    const receiver = String(next.receiverPlayer || "Unknown Player").trim();
    const item = String(next.itemName || "Unknown Item").trim();
    const loc = standaloneLocationDisplayName(next.locationName || "", next.locId);
    const location = loc ? ` (${loc})` : "";
    const samePlayer = Number(next.senderId || 0) === Number(next.receiverId || 0)
      || (!!sender && !!receiver && sender.toLowerCase() === receiver.toLowerCase());
    if(samePlayer) return `${sender} has found their own ${item}${location}`;
    return `${sender} sent ${item} to ${receiver}${location}`;
  }

  function standaloneReceivedItemTouchesRewardCounters(it){
    const name = standaloneReceivedItemName(it);
    return !!(name && (
      standaloneItemNameIsEasyJunk(name)
      || standaloneItemNameIsMediumJunk(name)
      || standaloneItemNameIsGenericJunk(name)
      || standaloneItemNameIsFragment(name)
    ));
  }

  function standaloneCounterRewardModalKey(it, itemIndex, locId, itemName){
    try{
      const idx = Number(itemIndex);
      if(Number.isFinite(idx) && idx >= 0) return `idx:${idx}`;
      const itemId = Number(it?.item);
      const loc = Number(locId ?? it?.location ?? it?.location_id ?? it?.loc);
      const player = Number(it?.player ?? it?.player_id ?? it?.source_player ?? it?.sender ?? 0) || 0;
      return `fallback:${Number.isFinite(itemId) ? itemId : standaloneNormalizeLoose(itemName)}|${Number.isFinite(loc) ? loc : ""}|${player}`;
    }catch(_){
      return `fallback:${standaloneNormalizeLoose(itemName)}|${Date.now()}`;
    }
  }

  function standaloneShouldShowCounterRewardModal(receivedName, it, opts, isolateReplay, quietSingleplayerNotice){
    try{
      if(!isolateReplay) return false;
      if(quietSingleplayerNotice) return false;
      if(opts?.noPopup === true || opts?.isFlush === true) return false;
      if(!String(receivedName || "").trim()) return false;
      return standaloneReceivedItemTouchesRewardCounters(it);
    }catch(_){
      return false;
    }
  }

  const standaloneBossHintScout = {
    missingIds: new Set(),
    infoByLocation: new Map(),
    lastScoutSig: "",
    lastApplySig: "",
    timer: null,
    focusPending: false
  };

  function standaloneQueueBossHintFocus(){
    try{ standaloneBossHintScout.focusPending = true; }catch(_){}
  }

  function standaloneConsumeBossHintFocus(){
    try{
      const shouldFocus = !!standaloneBossHintScout.focusPending;
      standaloneBossHintScout.focusPending = false;
      return shouldFocus;
    }catch(_){
      return false;
    }
  }

  function standaloneIsBossKeyRewardName(itemName){
    const text = String(itemName || "").trim();
    if(!text) return false;
    try{ if(typeof isBossKeyItemName === "function") return !!isBossKeyItemName(text); }catch(_){}
    return /\bboss\s*key\b/i.test(text) && !/\bhint\b/i.test(text);
  }

  function standaloneIsBallHintRewardName(itemName){
    const text = String(itemName || "").trim();
    if(!text) return false;
    return /\bhint\b/i.test(text) && /\bball\b/i.test(text) && !/\bboss\s*key\b/i.test(text);
  }

  function standaloneIsBossSegmentRewardName(itemName){
    try{ if(typeof isBossSegmentItemName === "function") return !!isBossSegmentItemName(itemName); }catch(_){}
    return /\bboss\s*(?:damage|segment|attack|hp)\b/i.test(String(itemName || ""));
  }

  function standaloneIsTrapRewardName(itemName, flags){
    if(Number(flags || 0) & 0b100) return true;
    try{ if(typeof isTrapItem === "function") return !!isTrapItem(itemName); }catch(_){}
    return /\btrap\b/i.test(String(itemName || ""));
  }

  function standaloneStripBallHintPools(pools){
    const p = pools && typeof pools === "object" ? pools : {};
    p.ball1 = [];
    p.ball2 = [];
    p.ball3 = [];
    p.ballProgressive = [];
    return p;
  }

  function standaloneZeroBallHintState(){
    try{
      if(typeof hintState === "undefined" || !hintState) return;
      hintState.pending = hintState.pending || {};
      hintState.pending.ball = 0;
      hintState.pools = standaloneStripBallHintPools(hintState.pools || {});
      if(typeof hintTargetedEntries === "function") hintState.all = hintTargetedEntries(hintState.pools);
    }catch(_){}
  }

  function standaloneRefreshBossHintUi(){
    try{
      const ballBtn = document.getElementById("hintBallLocationBtn");
      if(ballBtn){
        ballBtn.disabled = true;
        ballBtn.style.display = "none";
        ballBtn.setAttribute("aria-hidden", "true");
      }
      const pool = document.getElementById("hintPoolBall");
      if(pool){
        pool.textContent = "AP !HINT";
        const row = pool.closest(".hintPoolItem");
        if(row) row.style.display = "none";
      }
      const bossBtn = document.getElementById("hintBossKeyBtn");
      if(bossBtn && String(bossBtn.textContent || "").trim().toUpperCase() !== "HINT: BOSS KEY"){
        bossBtn.textContent = "HINT: BOSS KEY";
      }
    }catch(_){}
  }

  function standaloneResetBossHintsForConnection(){
    try{
      standaloneBossHintScout.missingIds = new Set();
      standaloneBossHintScout.infoByLocation = new Map();
      standaloneBossHintScout.lastScoutSig = "";
      standaloneBossHintScout.lastApplySig = "";
      standaloneBossHintScout.focusPending = false;
      if(standaloneBossHintScout.timer) clearTimeout(standaloneBossHintScout.timer);
      standaloneBossHintScout.timer = null;
    }catch(_){}
    try{
      if(typeof hintState !== "undefined" && hintState){
        hintState.pending = hintState.pending || {};
        hintState.pending.ball = 0;
        hintState.pools = { ball1: [], ball2: [], ball3: [], ballProgressive: [], boss: [] };
        hintState.all = [];
        hintState.rewardEntries = [];
        hintState.loaded = false;
        hintState.loadedMeta = null;
        hintState.activeTarget = null;
        hintState.history = [];
        try{ if(typeof hintSetHintopediaOpen === "function") hintSetHintopediaOpen(false); }catch(_){}
        try{ if(typeof hintSetStatus === "function") hintSetStatus("Waiting for AP boss key scout"); }catch(_){}
        try{ if(typeof hintUpdateUi === "function") hintUpdateUi(); }catch(_){}
      }
    }catch(_){}
    standaloneRefreshBossHintUi();
  }

  function standaloneRememberMissingLocationsForHints(pkt){
    try{
      const cmd = String(pkt?.cmd || "");
      if(cmd === "Connected"){
        standaloneResetBossHintsForConnection();
        standaloneResetServerHintsForConnection();
      }
      const missing = Array.isArray(pkt?.missing_locations) ? pkt.missing_locations : (Array.isArray(pkt?.missingLocations) ? pkt.missingLocations : null);
      if(missing){
        if(cmd === "Connected") standaloneBossHintScout.missingIds = new Set();
        missing.forEach((value)=>{
          const id = Number(value);
          if(Number.isFinite(id) && id > 0) standaloneBossHintScout.missingIds.add(id);
        });
      }
      const checked = Array.isArray(pkt?.checked_locations) ? pkt.checked_locations : (Array.isArray(pkt?.checkedLocations) ? pkt.checkedLocations : null);
      if(checked){
        checked.forEach((value)=>{
          const id = Number(value);
          if(Number.isFinite(id) && id > 0){
            standaloneBossHintScout.missingIds.delete(id);
            standaloneBossHintScout.infoByLocation.delete(id);
          }
        });
      }
      if(missing || checked) standaloneScheduleBossKeyScout("location-set");
      if(missing || checked) standaloneRefreshServerHintFoundStates();
      if(cmd === "Connected" || cmd === "RoomUpdate") standaloneScheduleServerHintRequest(cmd, { force:cmd === "Connected" });
    }catch(_){}
  }

  function standaloneLocationInfoItems(pkt){
    const items = Array.isArray(pkt?.locations) ? pkt.locations
      : (Array.isArray(pkt?.items) ? pkt.items
      : (Array.isArray(pkt?.data?.locations) ? pkt.data.locations : []));
    return items.map((entry)=>{
      if(Array.isArray(entry)){
        return { item:entry[0], location:entry[1], player:entry[2], flags:entry[3] };
      }
      return entry && typeof entry === "object" ? entry : null;
    }).filter(Boolean);
  }

  function standaloneBuildBossHintEntryFromLocationInfo(info){
    try{
      const locId = Number(info?.location);
      if(!Number.isFinite(locId) || locId <= 0) return null;
      const itemPlayer = Number(info?.player || 0) || standaloneSelfSlotId();
      const self = standaloneSelfSlotId();
      if(self && itemPlayer && itemPlayer !== self) return null;
      const game = standaloneGameForPlayer(itemPlayer || self, "", standaloneSelfGameName());
      const itemName = standaloneResolveApItemName(info?.item, itemPlayer || self, "", game);
      if(!standaloneIsBossKeyRewardName(itemName)) return null;
      const rawLoc = standaloneResolveApLocationName(locId, self, "");
      const displayLoc = standaloneLocationDisplayName(rawLoc, locId) || rawLoc;
      const split = standaloneSplitLocationName(displayLoc);
      const tableName = String(split.table || "").trim();
      const locationShort = String(split.rest || displayLoc || "").trim();
      if(!tableName || !locationShort) return null;
      let knownOwnLocation = false;
      try{ knownOwnLocation = !!(ap?.locNameById?.has?.(locId) || ap?.locById?.has?.(locId)); }catch(_){}
      if(!knownOwnLocation && !standaloneIsActiveSeedTableName(tableName)) return null;
      return {
        locId,
        tableName,
        locationName: `${tableName} - ${locationShort}`,
        locationShort,
        rawLine: `${tableName} - ${locationShort}: Boss Key`,
        itemName: "Boss Key",
        source: "AP LocationScouts"
      };
    }catch(_){
      return null;
    }
  }

  function standaloneApplyBossHintLocationInfo(source, opts){
    opts = opts || {};
    try{
      standaloneZeroBallHintState();
      if(typeof hintState === "undefined" || !hintState) return false;
      const entries = [];
      const seen = new Set();
      standaloneBossHintScout.infoByLocation.forEach((info)=>{
        const entry = standaloneBuildBossHintEntryFromLocationInfo(info);
        if(!entry) return;
        const key = `loc:${entry.locId || ""}|${standaloneNormalizeLoose(entry.locationName)}`;
        if(seen.has(key)) return;
        seen.add(key);
        entries.push(entry);
      });
      entries.sort((a, b)=>String(a.locationName || "").localeCompare(String(b.locationName || "")));
      const sig = entries.map((entry)=>`${entry.locId}:${entry.locationName}`).join("|");
      if(!opts.force && sig === standaloneBossHintScout.lastApplySig){
        standaloneRefreshBossHintUi();
        return true;
      }
      standaloneBossHintScout.lastApplySig = sig;
      const hasScoutInfo = standaloneBossHintScout.infoByLocation.size > 0;
      hintState.pools = standaloneStripBallHintPools(hintState.pools || {});
      hintState.pools.boss = entries;
      hintState.rewardEntries = [];
      hintState.all = (typeof hintTargetedEntries === "function") ? hintTargetedEntries(hintState.pools) : entries.slice();
      hintState.loaded = entries.length > 0 || hasScoutInfo;
      hintState.loadedMeta = {
        ...(typeof hintBuildSeedMeta === "function" ? hintBuildSeedMeta() : {}),
        sourceLabel: "AP LocationScouts",
        apBossScout: true
      };
      if(typeof hintSetStatus === "function"){
        hintSetStatus(entries.length ? `AP Boss Key scouts: ${entries.length}` : (hasScoutInfo ? "No local Boss Key hints" : "Waiting for AP boss key scout"));
      }
      if((entries.length || hasScoutInfo) && typeof hintLog === "function"){
        hintLog(`[AP] Boss Key hints refreshed from server: ${entries.length}.`);
      }
      if(typeof hintUpdateUi === "function") hintUpdateUi();
      if(entries.length && typeof hintConsumePendingTriggers === "function"){
        const shouldFocusHints = standaloneConsumeBossHintFocus();
        hintConsumePendingTriggers({ focusHintsTab:shouldFocusHints });
      }
      standaloneRefreshBossHintUi();
      try{
        window.__flprStandaloneBossHintScout = {
          entries: entries.map((entry)=>({ locId:entry.locId, locationName:entry.locationName, itemName:entry.itemName })),
          missing: Array.from(standaloneBossHintScout.missingIds),
          lastSource: source || ""
        };
      }catch(_){}
      return true;
    }catch(_){
      return false;
    }
  }

  function standaloneHandleLocationInfoForHints(pkt){
    try{
      let changed = false;
      standaloneLocationInfoItems(pkt).forEach((info)=>{
        const locId = Number(info?.location);
        if(!Number.isFinite(locId) || locId <= 0) return;
        standaloneBossHintScout.infoByLocation.set(locId, { ...info });
        changed = true;
      });
      if(changed) standaloneApplyBossHintLocationInfo("LocationInfo", { force:true });
    }catch(_){}
  }

  function standaloneKnownPlayerSlotsForHints(){
    const slots = new Set();
    try{ if(standaloneSelfSlotId()) slots.add(standaloneSelfSlotId()); }catch(_){}
    try{
      if(ap?.slotInfoById?.keys){
        for(const id of ap.slotInfoById.keys()){
          const n = Number(id);
          if(Number.isFinite(n) && n > 0) slots.add(n);
        }
      }
    }catch(_){}
    try{
      if(ap?.playerNameById?.keys){
        for(const id of ap.playerNameById.keys()){
          const n = Number(id);
          if(Number.isFinite(n) && n > 0) slots.add(n);
        }
      }
    }catch(_){}
    try{
      standaloneApPlayerMeta.gameById.forEach((_, id)=>{
        const n = Number(id);
        if(Number.isFinite(n) && n > 0) slots.add(n);
      });
    }catch(_){}
    return Array.from(slots).sort((a, b)=>a - b);
  }

  function standaloneServerHintFetchKeys(){
    const team = Math.max(0, Number(ap?.team ?? 0) || 0);
    return standaloneKnownPlayerSlotsForHints().map((slot)=>`_read_hints_${team}_${slot}`);
  }

  function standaloneResetServerHintsForConnection(){
    try{ standaloneTextClient.serverHints.clear(); }catch(_){}
    try{
      if(standaloneTextClient.serverHintFetchTimer) clearTimeout(standaloneTextClient.serverHintFetchTimer);
      standaloneTextClient.serverHintFetchTimer = null;
      standaloneTextClient.serverHintFetchSig = "";
      standaloneTextClient.serverHintFetchAt = 0;
    }catch(_){}
  }

  function standaloneServerHintPriority(flags, itemName){
    const f = standaloneFlagsForItem(flags, itemName);
    let cls = null;
    try{ cls = standaloneItemClass(f, itemName); }catch(_){}
    let key = String(cls?.key || "").trim().toLowerCase();
    if(!key || key === "normal") key = "filler";
    const rank = key === "progression" ? 0
      : key === "useful" ? 1
      : key === "filler" ? 2
      : key === "trap" ? 3
      : 4;
    const label = key === "progression" ? "PROGRESSION"
      : key === "useful" ? "USEFUL"
      : key === "trap" ? "TRAP"
      : "FILLER";
    return {
      key,
      rank,
      label,
      title: String(cls?.title || `${label} ITEM`).trim()
    };
  }

  function standaloneServerHintLocationFound(locId, locationName, explicitFound){
    if(explicitFound === true) return true;
    const id = Number(locId);
    try{
      if(Number.isFinite(id) && id > 0 && ap?.checked instanceof Set && ap.checked.has(id)) return true;
    }catch(_){}
    try{ if(standaloneLocationMatchesOutgoingSent(locId, locationName)) return true; }catch(_){}
    return false;
  }

  function standaloneServerHintKey(hint){
    return [
      Number(hint?.finderId || 0) || 0,
      Number(hint?.receiverId || 0) || 0,
      Number(hint?.locId || 0) || 0,
      Number(hint?.itemId || 0) || 0
    ].join("|");
  }

  function standaloneHydrateServerHintRecord(record){
    try{
      const rec = record && typeof record === "object" ? record : {};
      const receiverId = Number(rec.receiverId || 0) || 0;
      const finderId = Number(rec.finderId || 0) || standaloneSelfSlotId();
      const receiverPlayer = String(rec.receiverPlayer || (()=>{ try{ return apPlayerName(receiverId, ""); }catch(_){ return ""; } })() || `Player ${receiverId || "?"}`).trim();
      const finderPlayer = String(rec.finderPlayer || (()=>{ try{ return apPlayerName(finderId, ""); }catch(_){ return ""; } })() || standaloneSelfPlayerName()).trim();
      const receiverGame = standaloneGameForPlayer(receiverId, receiverPlayer, rec.receiverGame || "");
      const finderGame = standaloneGameForPlayer(finderId, finderPlayer, rec.finderGame || standaloneSelfGameName());
      const itemName = standaloneResolveApItemName(rec.itemId, receiverId, rec.itemName || rec.serverItemName || "", receiverGame, { preferServerForCrossGame:true });
      const rawLoc = standaloneResolveApLocationName(rec.locId, finderId, rec.locationName || rec.serverLocationName || "");
      const locationName = standaloneLocationDisplayName(rawLoc, rec.locId) || rawLoc || (rec.locId ? `Location #${rec.locId}` : "Unknown Location");
      const flags = standaloneFlagsForItem(rec.flags ?? rec.itemFlags ?? 0, itemName);
      const priority = standaloneServerHintPriority(flags, itemName);
      const found = standaloneServerHintLocationFound(rec.locId, locationName, rec.found);
      return {
        ...rec,
        finderId,
        receiverId,
        finderPlayer,
        finderGame,
        receiverPlayer,
        receiverGame,
        itemName,
        locationName,
        flags,
        found,
        priority
      };
    }catch(_){
      return record || null;
    }
  }

  function standaloneRememberServerHint(hint, source){
    try{
      const self = standaloneSelfSlotId();
      if(!self || !hint || typeof hint !== "object") return false;
      const finderId = Number(hint.finding_player ?? hint.findingPlayer ?? hint.finderId ?? hint.finder ?? hint.player ?? hint.sourcePlayerId ?? 0) || 0;
      const receiverId = Number(hint.receiving_player ?? hint.receivingPlayer ?? hint.receiverId ?? hint.receiving ?? hint.receiver ?? 0) || 0;
      if(finderId !== self || !receiverId || receiverId === self) return false;
      const locId = Number(hint.location ?? hint.locId ?? hint.location_id ?? hint.loc ?? 0);
      const itemId = Number(hint.item ?? hint.itemId ?? hint.item_id ?? 0);
      if(!Number.isFinite(locId) || locId <= 0 || !Number.isFinite(itemId)) return false;
      const flags = Number(hint.item_flags ?? hint.itemFlags ?? hint.flags ?? 0) || 0;
      const found = hint.found === true || Number(hint.status || 0) >= 40;
      const base = {
        finderId,
        receiverId,
        locId,
        itemId,
        flags,
        found,
        entrance: String(hint.entrance || ""),
        source: String(source || hint.source || "AP hints"),
        serverItemName: String(hint.item_name || hint.itemName || hint.serverItemName || ""),
        serverLocationName: String(hint.location_name || hint.locationName || hint.serverLocationName || ""),
        firstAt: Date.now(),
        updatedAt: Date.now()
      };
      const key = standaloneServerHintKey(base);
      const prev = standaloneTextClient.serverHints.get(key);
      const hydrated = standaloneHydrateServerHintRecord({
        ...(prev || {}),
        ...base,
        found: found || !!prev?.found,
        firstAt: prev?.firstAt || base.firstAt
      });
      standaloneTextClient.serverHints.set(key, hydrated);
      if(standaloneTextClient.serverHints.size > 300){
        const entries = Array.from(standaloneTextClient.serverHints.entries());
        entries.slice(0, Math.max(0, entries.length - 220)).forEach(([oldKey])=>standaloneTextClient.serverHints.delete(oldKey));
      }
      return true;
    }catch(_){
      return false;
    }
  }

  function standaloneHandleRetrievedServerHints(pkt){
    try{
      const keys = pkt?.keys && typeof pkt.keys === "object" ? pkt.keys : {};
      let changed = false;
      Object.entries(keys).forEach(([key, value])=>{
        if(!/^_read_hints_\d+_\d+$/i.test(String(key || ""))) return;
        const list = Array.isArray(value) ? value : (value && typeof value === "object" ? Object.values(value) : []);
        list.forEach((hint)=>{
          changed = standaloneRememberServerHint(hint, "AP server hints") || changed;
        });
      });
      if(changed) standaloneScheduleTextRender("server-hints");
      return changed;
    }catch(_){
      return false;
    }
  }

  function standaloneHandlePrintJsonServerHint(pkt){
    try{
      if(String(pkt?.type || "").toLowerCase() !== "hint") return false;
      const item = pkt?.item && typeof pkt.item === "object" ? pkt.item : {};
      const locPart = standaloneFirstJsonPart(pkt, "location_id");
      const itemPart = standaloneFirstJsonPart(pkt, "item_id");
      const hint = {
        finding_player: Number(item.player ?? item.finding_player ?? item.findingPlayer ?? locPart?.player ?? locPart?.owner ?? 0) || 0,
        receiving_player: Number(pkt?.receiving ?? pkt?.receiver ?? item.receiving_player ?? item.receivingPlayer ?? itemPart?.player ?? itemPart?.receiving_player ?? 0) || 0,
        location: Number(item.location ?? locPart?.location ?? locPart?.location_id ?? 0),
        item: Number(item.item ?? itemPart?.item ?? itemPart?.item_id ?? 0),
        item_flags: Number(item.flags ?? item.item_flags ?? itemPart?.flags ?? itemPart?.item_flags ?? 0) || 0,
        found: pkt?.found === true,
        itemName: standalonePartFallbackText(itemPart),
        locationName: standalonePartFallbackText(locPart)
      };
      const changed = standaloneRememberServerHint(hint, "AP hint broadcast");
      if(changed) standaloneScheduleTextRender("server-hint-broadcast");
      return changed;
    }catch(_){
      return false;
    }
  }

  function standaloneRefreshServerHintFoundStates(){
    try{
      let changed = false;
      standaloneTextClient.serverHints.forEach((hint, key)=>{
        const next = standaloneHydrateServerHintRecord(hint);
        if(!next) return;
        const prevFound = !!hint.found;
        const nextFound = !!next.found;
        if(prevFound !== nextFound || next.itemName !== hint.itemName || next.locationName !== hint.locationName){
          standaloneTextClient.serverHints.set(key, next);
          changed = true;
        }
      });
      if(changed) standaloneScheduleTextRender("server-hint-found-state");
      return changed;
    }catch(_){
      return false;
    }
  }

  function standaloneRequestServerHints(source, opts){
    opts = opts || {};
    try{
      if(ap?.inherentSeedActive) return false;
      const wsOpen = !!(ap?.ws && Number(ap.ws.readyState) === 1);
      if(!wsOpen || typeof apSend !== "function") return false;
      const keys = standaloneServerHintFetchKeys();
      if(!keys.length) return false;
      const sig = keys.join("|");
      const now = Date.now();
      if(!opts.force && sig === standaloneTextClient.serverHintFetchSig && now - Number(standaloneTextClient.serverHintFetchAt || 0) < 12000) return false;
      const sent = !!apSend({ cmd:"Get", keys, flpr:"server_hints", source:String(source || "") });
      if(sent){
        standaloneTextClient.serverHintFetchSig = sig;
        standaloneTextClient.serverHintFetchAt = now;
        try{ window.__flprStandaloneServerHintRequest = { source:String(source || ""), keys:keys.slice(), at:now }; }catch(_){}
      }
      return sent;
    }catch(_){
      return false;
    }
  }

  function standaloneScheduleServerHintRequest(source, opts){
    opts = opts || {};
    try{
      if(standaloneTextClient.serverHintFetchTimer) clearTimeout(standaloneTextClient.serverHintFetchTimer);
      standaloneTextClient.serverHintFetchTimer = setTimeout(()=>{
        standaloneTextClient.serverHintFetchTimer = null;
        standaloneRequestServerHints(source, opts);
      }, Math.max(0, Number(opts.delayMs ?? 220)));
    }catch(_){}
  }

  function standaloneScheduleBossKeyScout(source){
    try{
      if(standaloneBossHintScout.timer) clearTimeout(standaloneBossHintScout.timer);
      standaloneBossHintScout.timer = setTimeout(()=>{
        standaloneBossHintScout.timer = null;
        try{
          standaloneZeroBallHintState();
          standaloneRefreshBossHintUi();
          const ids = Array.from(standaloneBossHintScout.missingIds)
            .map(Number)
            .filter((id)=>Number.isFinite(id) && id > 0)
            .sort((a, b)=>a - b);
          if(!ids.length) return;
          const sig = ids.join(",");
          if(sig === standaloneBossHintScout.lastScoutSig) return;
          const wsOpen = !!(ap?.ws && Number(ap.ws.readyState) === 1);
          if(!wsOpen || typeof apSend !== "function") return;
          let sentAny = false;
          for(let i = 0; i < ids.length; i += 200){
            const locations = ids.slice(i, i + 200);
            if(apSend({ cmd:"LocationScouts", locations, create_as_hint:0 })) sentAny = true;
          }
          if(sentAny){
            standaloneBossHintScout.lastScoutSig = sig;
            try{ window.__flprStandaloneBossHintScoutRequest = { source:source || "", locations:ids.slice() }; }catch(_){}
          }
        }catch(_){}
      }, 120);
    }catch(_){}
  }

  function standaloneRestoreChecksViewForReward(){
    const work = ()=>{
      try{
        if(typeof showView === "function") showView("checks");
        else{
          activeView = "checks";
          try{ setTabUI(); }catch(_){}
        }
      }catch(_){
        try{
          activeView = "checks";
          if(typeof setTabUI === "function") setTabUI();
        }catch(__){}
      }
      try{ if(typeof renderChecksWorldTabs === "function") renderChecksWorldTabs(); }catch(_){}
      try{ if(typeof renderChecks === "function") renderChecks(); }catch(_){}
      try{ if(typeof updateCounterBars === "function") updateCounterBars(); }catch(_){}
      try{ if(typeof updateCountCheckUI === "function") updateCountCheckUI(); }catch(_){}
    };
    try{
      if(typeof standalonePreserveChecksSelectionDuring === "function"){
        return standalonePreserveChecksSelectionDuring(work, "restore-checks");
      }
    }catch(_){}
    return work();
  }

  function standaloneShouldRestoreChecksAfterReward(itemName, it, opts){
    try{
      if(opts?.isSnapshot || opts?.isFlush || opts?.noPopup === true) return false;
      if(String(activeView || "") !== "checks") return false;
      const name = String(itemName || "").trim();
      if(!name) return false;
      if(standaloneProgressiveBallTarget(name)) return false;
      if(standaloneIsTrapRewardName(name, it?.flags)) return false;
      if(standaloneIsBossKeyRewardName(name)) return false;
      if(standaloneIsBossSegmentRewardName(name)) return false;
      if(standaloneReceivedItemTouchesRewardCounters(it)) return false;
      return true;
    }catch(_){
      return false;
    }
  }

  function standaloneShouldQuietSingleplayerReceivedNotification(itemName, it, opts){
    try{
      if(!ap?.inherentSeedActive) return false;
      if(opts?.isSnapshot || opts?.isFlush || opts?.noPopup === true) return false;
      const name = String(itemName || "").trim();
      if(!name) return false;
      if(standaloneProgressiveBallTarget(name)) return false;
      if(standaloneIsBossKeyRewardName(name)) return false;
      if(standaloneIsBossSegmentRewardName(name)) return false;
      if(standaloneIsTrapRewardName(name, it?.flags)) return false;
      if(standaloneIsBallHintRewardName(name)) return false;
      return true;
    }catch(_){
      return false;
    }
  }
  try{ window.flprStandaloneShouldQuietSingleplayerReceivedItem = standaloneShouldQuietSingleplayerReceivedNotification; }catch(_){}

  function standaloneScheduleChecksRestoreAfterReward(opts){
    const holdMs = Math.max(0, Number(opts?.holdMs || 3200) || 3200);
    const delays = [
      Math.max(720, holdMs + 260),
      Math.max(980, holdMs + 760),
      Math.max(1320, holdMs + 1400),
      Math.max(1800, holdMs + 2200)
    ];
    delays.forEach((delay)=>{
      setTimeout(()=>standaloneRestoreChecksViewForReward(), delay);
    });
  }

  function standaloneCaptureChecksSelectionForReward(reason){
    try{
      if(!standaloneChecksViewActive()) return "";
      const key = standaloneCurrentChecksSelectionCandidate() || standalonePinnedChecksTableKey();
      const parsed = standaloneParseTableKey(key);
      if(!parsed) return "";
      standaloneRememberChecksWorldSelection(parsed.worldKey, reason || "reward-capture");
      standaloneChecksSelection.key = parsed.key;
      standaloneChecksSelection.ts = Date.now();
      standaloneChecksSelection.source = String(reason || "reward-capture");
      return parsed.key;
    }catch(_){
      return "";
    }
  }

  function standaloneRestoreChecksSelectionKey(tableKey, reason){
    const parsed = standaloneParseTableKey(tableKey);
    if(!parsed || !standaloneChecksTableExists(parsed.key)) return false;
    try{
      if(standaloneQueuedSiegeWaiting() || standaloneBesiegedTarget()) return false;
    }catch(_){}
    try{ standaloneRememberChecksWorldSelection(parsed.worldKey, reason || "reward-return"); }catch(_){}
    standaloneChecksSelection.key = parsed.key;
    standaloneChecksSelection.ts = Date.now();
    standaloneChecksSelection.source = String(reason || "reward-return");
    const work = ()=>{
      try{ if(typeof showView === "function") showView("checks"); else activeView = "checks"; }catch(_){}
      try{ standaloneRememberChecksWorldSelection(parsed.worldKey, reason || "reward-return"); }catch(_){}
      try{
        ap.currentWorld = parsed.worldKey;
        state.nowPlaying = state.nowPlaying || {};
        state.nowPlaying[parsed.worldKey] = parsed.idx;
      }catch(_){}
      standaloneChecksSelection.key = parsed.key;
      standaloneChecksSelection.ts = Date.now();
      standaloneChecksSelection.source = String(reason || "reward-return");
      try{ if(typeof renderChecksWorldTabs === "function") renderChecksWorldTabs(); }catch(_){}
      try{ if(typeof renderChecks === "function") renderChecks(); }catch(_){}
      try{ if(typeof updateCounterBars === "function") updateCounterBars(); }catch(_){}
      try{ if(typeof updateCountCheckUI === "function") updateCountCheckUI(); }catch(_){}
      try{ standaloneEnforceChecksWorldSelection(reason || "reward-return", { save:false }); }catch(_){}
      try{ standaloneEnforceChecksSelectionPin(reason || "reward-return", { save:false }); }catch(_){}
      try{ standaloneDirectChecksHighlightPinned(); }catch(_){}
      return true;
    };
    try{ return standalonePreserveChecksSelectionDuring(work, reason || "reward-return"); }catch(_){}
    try{ return work(); }catch(_){}
    return false;
  }

  function standaloneScheduleProgressiveReturnToRedeemedCheck(tableKey, reason, durationMs, opts){
    opts = opts || {};
    const parsed = standaloneParseTableKey(tableKey);
    if(!parsed) return false;
    const ms = Math.max(0, Number(durationMs || 0) || 0);
    const returnWindow = [];
    if(ms > 0){
      for(let offset = -900; offset <= 760; offset += 220){
        returnWindow.push(ms + offset);
      }
    }
    const delays = opts.immediate === false
      ? [Math.max(420, ms - 1400), ...returnWindow, ms + 1240, ms + 2200]
      : [0, 160, 520, 1180, 2280, 3880, 5600, 7600, 9400];
    if(ms > 0) delays.push(Math.max(0, ms - 900), Math.max(0, ms - 120), ms + 420, ms + 1240);
    Array.from(new Set(delays.map((delay)=>Math.max(0, Math.round(delay))))).sort((a, b)=>a-b).forEach((delay)=>{
      setTimeout(()=>standaloneRestoreChecksSelectionKey(parsed.key, reason || "progressive-return"), delay);
    });
    try{ standaloneScheduleChecksSelectionHold(reason || "progressive-return", Math.max(ms + 1400, 8800)); }catch(_){}
    return true;
  }

  function installStandaloneBossHintBridge(){
    let ready = false;
    try{
      const original = window.hintBuildPools || (typeof hintBuildPools === "function" ? hintBuildPools : null);
      if(original){
        ready = true;
        if(!original.__flprStandaloneBossOnlyBridge){
          const bridged = function standaloneHintBuildPoolsBossOnlyBridge(entries){
            const pools = original.call(this, entries);
            return standaloneStripBallHintPools(pools);
          };
          bridged.__flprStandaloneBossOnlyBridge = true;
          bridged.__flprStandaloneOriginalHintBuildPools = original;
          window.hintBuildPools = bridged;
          try{ hintBuildPools = bridged; }catch(_){}
        }
      }
    }catch(_){}
    try{
      const original = window.hintBuildRewardEntries || (typeof hintBuildRewardEntries === "function" ? hintBuildRewardEntries : null);
      if(original){
        ready = true;
        if(!original.__flprStandaloneBossOnlyBridge){
          const bridged = function standaloneHintBuildRewardEntriesBossOnlyBridge(entries){
            return (original.call(this, entries) || []).filter((entry)=>/boss\s*key/i.test(String(entry?.itemName || "")));
          };
          bridged.__flprStandaloneBossOnlyBridge = true;
          bridged.__flprStandaloneOriginalHintBuildRewardEntries = original;
          window.hintBuildRewardEntries = bridged;
          try{ hintBuildRewardEntries = bridged; }catch(_){}
        }
      }
    }catch(_){}
    try{
      const original = window.isHintBallItemName || (typeof isHintBallItemName === "function" ? isHintBallItemName : null);
      if(original){
        ready = true;
        if(!original.__flprStandaloneBossOnlyBridge){
          const bridged = function standaloneIsHintBallItemNameBridge(){
            return false;
          };
          bridged.__flprStandaloneBossOnlyBridge = true;
          bridged.__flprStandaloneOriginalIsHintBallItemName = original;
          window.isHintBallItemName = bridged;
          try{ isHintBallItemName = bridged; }catch(_){}
        }
      }
    }catch(_){}
    try{
      const original = window.isHintRewardItemName || (typeof isHintRewardItemName === "function" ? isHintRewardItemName : null);
      if(original){
        ready = true;
        if(!original.__flprStandaloneBossOnlyBridge){
          const bridged = function standaloneIsHintRewardItemNameBossOnlyBridge(itemName){
            try{ if(typeof isHintBossKeyItemName === "function") return !!isHintBossKeyItemName(itemName); }catch(_){}
            return /hint\s*:?\s*boss\s*key/i.test(String(itemName || ""));
          };
          bridged.__flprStandaloneBossOnlyBridge = true;
          bridged.__flprStandaloneOriginalIsHintRewardItemName = original;
          window.isHintRewardItemName = bridged;
          try{ isHintRewardItemName = bridged; }catch(_){}
        }
      }
    }catch(_){}
    try{
      const original = window.hintCandidatesForPool || (typeof hintCandidatesForPool === "function" ? hintCandidatesForPool : null);
      if(original){
        ready = true;
        if(!original.__flprStandaloneBossOnlyBridge){
          const bridged = function standaloneHintCandidatesForPoolBossOnlyBridge(poolName){
            const pool = String(poolName || "").trim().toLowerCase();
            if(pool && pool !== "boss") return [];
            return original.apply(this, arguments);
          };
          bridged.__flprStandaloneBossOnlyBridge = true;
          bridged.__flprStandaloneOriginalHintCandidatesForPool = original;
          window.hintCandidatesForPool = bridged;
          try{ hintCandidatesForPool = bridged; }catch(_){}
        }
      }
    }catch(_){}
    try{
      const original = window.hintUpdateUi || (typeof hintUpdateUi === "function" ? hintUpdateUi : null);
      if(original){
        ready = true;
        if(!original.__flprStandaloneBossOnlyBridge){
          const bridged = function standaloneHintUpdateUiBossOnlyBridge(){
            standaloneZeroBallHintState();
            const result = original.apply(this, arguments);
            standaloneZeroBallHintState();
            standaloneRefreshBossHintUi();
            return result;
          };
          bridged.__flprStandaloneBossOnlyBridge = true;
          bridged.__flprStandaloneOriginalHintUpdateUi = original;
          window.hintUpdateUi = bridged;
          try{ hintUpdateUi = bridged; }catch(_){}
        }
      }
    }catch(_){}
    try{
      const original = window.hintConsumePendingTriggers || (typeof hintConsumePendingTriggers === "function" ? hintConsumePendingTriggers : null);
      if(original){
        ready = true;
        if(!original.__flprStandaloneBossOnlyBridge){
          const bridged = function standaloneHintConsumePendingTriggersBossOnlyBridge(opts){
            standaloneZeroBallHintState();
            const nextOpts = { ...(opts || {}) };
            if(nextOpts.focusHintsTab == null && standaloneBossHintScout.focusPending){
              nextOpts.focusHintsTab = true;
            }
            const result = original.call(this, nextOpts);
            if(nextOpts.focusHintsTab) standaloneBossHintScout.focusPending = false;
            return result;
          };
          bridged.__flprStandaloneBossOnlyBridge = true;
          bridged.__flprStandaloneOriginalHintConsumePendingTriggers = original;
          window.hintConsumePendingTriggers = bridged;
          try{ hintConsumePendingTriggers = bridged; }catch(_){}
        }
      }
    }catch(_){}
    try{
      const original = window.hintHandleReceivedHintItem || (typeof hintHandleReceivedHintItem === "function" ? hintHandleReceivedHintItem : null);
      if(original){
        ready = true;
        if(!original.__flprStandaloneBossOnlyBridge){
          const bridged = function standaloneHintHandleReceivedHintItemBossOnlyBridge(itemName){
            const text = String(itemName || "");
            let isBoss = false;
            try{ isBoss = typeof isHintBossKeyItemName === "function" ? !!isHintBossKeyItemName(text) : /hint\s*:?\s*boss\s*key/i.test(text); }catch(_){ isBoss = /hint\s*:?\s*boss\s*key/i.test(text); }
            if(!isBoss){
              if(/hint\s*:?\s*ball|ball\s*location/i.test(text)){
                standaloneZeroBallHintState();
                try{ if(typeof hintLog === "function") hintLog("[AP] Ball-location hint item ignored; use AP !hint for Progressive Balls."); }catch(_){}
                try{ if(typeof hintUpdateUi === "function") hintUpdateUi(); }catch(_){}
                return true;
              }
              return original.apply(this, arguments);
            }
            try{
              hintState.pending = hintState.pending || {};
              hintState.pending.ball = 0;
              hintState.pending.boss = (hintState.pending.boss || 0) + 1;
              standaloneQueueBossHintFocus();
              try{
                if(typeof showView === "function") showView("hints");
                else if(typeof activeView !== "undefined"){
                  activeView = "hints";
                  if(typeof setTabUI === "function") setTabUI();
                }
              }catch(_){}
              if(typeof hintLog === "function") hintLog(`[AP] Hint: Boss Key received; queued (${hintState.pending.boss}).`);
              standaloneScheduleBossKeyScout("hint-item");
              if(hintState.loaded && typeof hintRemainingCount === "function" && hintRemainingCount("boss") > 0){
                if(typeof hintLog === "function") hintLog("[AP] Auto-redeeming Hint: Boss Key token.");
                if(typeof hintRedeemPendingToken === "function"){
                  const ok = hintRedeemPendingToken("boss", "Boss Key", { focusHintsTab:true, typewrite:true, silent:true });
                  if(ok) standaloneBossHintScout.focusPending = false;
                  if(!ok && typeof hintLog === "function") hintLog("[AP] Auto-redeem failed; token remains banked.");
                }
              }else if(typeof hintSetStatus === "function"){
                hintSetStatus("Boss Key hint banked; waiting for AP scout.");
              }
              if(typeof hintUpdateUi === "function") hintUpdateUi();
              standaloneRefreshBossHintUi();
            }catch(_){}
            return true;
          };
          bridged.__flprStandaloneBossOnlyBridge = true;
          bridged.__flprStandaloneOriginalHintHandleReceivedHintItem = original;
          window.hintHandleReceivedHintItem = bridged;
          try{ hintHandleReceivedHintItem = bridged; }catch(_){}
        }
      }
    }catch(_){}
    standaloneZeroBallHintState();
    standaloneRefreshBossHintUi();
    standaloneScheduleBossKeyScout("hint-bridge");
    if(!ready) setTimeout(installStandaloneBossHintBridge, 120);
  }

  function standaloneSnapshotRewardCounters(){
    let apJunk = null;
    let extraBallTokens = 0;
    let junkRedeems = null;
    try{ apJunk = ap?.junk ? { ...ap.junk } : null; }catch(_){}
    try{ extraBallTokens = Math.max(0, Math.round(Number(state?.extraBallTokens || 0))); }catch(_){}
    try{ junkRedeems = state?.junkRedeems ? { ...state.junkRedeems } : null; }catch(_){}
    return { apJunk, extraBallTokens, junkRedeems };
  }

  function standaloneRestoreRewardCounters(snapshot){
    if(!snapshot) return;
    try{ if(snapshot.apJunk) ap.junk = { ...snapshot.apJunk }; }catch(_){}
    try{ state.extraBallTokens = snapshot.extraBallTokens; }catch(_){}
    try{ if(snapshot.junkRedeems) state.junkRedeems = { ...snapshot.junkRedeems }; }catch(_){}
  }

  function standaloneShouldIsolateReceivedReplay(it, opts){
    if(!(opts?.isSnapshot || opts?.noPopup === true)) return false;
    return standaloneReceivedItemTouchesRewardCounters(it);
  }

  function standaloneRewardItemKey(it, itemIndex, locId){
    const idx = Number(itemIndex);
    if(Number.isFinite(idx) && idx >= 0) return `idx:${idx}`;
    const itemId = Number(it?.item);
    const loc = Number(locId ?? it?.location ?? it?.location_id ?? it?.loc);
    return `fallback:${Number.isFinite(itemId) ? itemId : ""}|${Number.isFinite(loc) ? loc : ""}|${Number(it?.player ?? it?.player_id ?? 0) || 0}`;
  }

  function standaloneProgressiveRewardKey(it, itemIndex, locId, itemName){
    const name = standaloneNormalizeLoose(itemName || "");
    const loc = Number(locId ?? it?.location ?? it?.location_id ?? it?.loc);
    const itemId = Number(it?.item);
    const source = Number(it?.player ?? it?.player_id ?? it?.source_player ?? it?.sender ?? 0) || 0;
    if(Number.isFinite(loc) && loc > 0){
      return [
        "progressive",
        "loc:" + loc,
        "item:" + (Number.isFinite(itemId) ? itemId : ""),
        "source:" + source,
        "name:" + name
      ].join("|");
    }
    const idx = Number(itemIndex);
    if(Number.isFinite(idx) && idx >= 0){
      return [
        "progressive",
        "idx:" + idx,
        "item:" + (Number.isFinite(itemId) ? itemId : ""),
        "source:" + source,
        "name:" + name
      ].join("|");
    }
    return [
      "progressive",
      "fallback",
      "item:" + (Number.isFinite(itemId) ? itemId : ""),
      "source:" + source,
      "name:" + name
    ].join("|");
  }

  function standaloneRememberProgressiveRewardKey(key){
    if(!key) return;
    try{
      standaloneItemPanel.progressiveReceiveSeen.add(key);
      if(standaloneItemPanel.progressiveReceiveSeen.size > 900) standaloneItemPanel.progressiveReceiveSeen.clear();
    }catch(_){}
  }

  function standaloneBossKeyMaxCount(){
    try{
      const max = Number(typeof BOSS_KEYS_COUNT !== "undefined" ? BOSS_KEYS_COUNT : 3);
      return Number.isFinite(max) && max > 0 ? Math.round(max) : 3;
    }catch(_){
      return 3;
    }
  }

  function standaloneCurrentBossKeyCount(){
    let count = 0;
    try{
      if(typeof getBossKeyRedeemedCount === "function"){
        const value = Number(getBossKeyRedeemedCount());
        if(Number.isFinite(value)) count = Math.max(count, value);
      }
    }catch(_){}
    try{
      if(typeof getBossKeysAcquiredCount === "function"){
        const value = Number(getBossKeysAcquiredCount());
        if(Number.isFinite(value)) count = Math.max(count, value);
      }
    }catch(_){}
    try{
      const value = Number(window.__apBossKeyCount);
      if(Number.isFinite(value)) count = Math.max(count, value);
    }catch(_){}
    const max = standaloneBossKeyMaxCount();
    return Math.max(0, Math.min(max, Math.round(count)));
  }

  function standaloneForceBossKeyCount(count){
    const max = standaloneBossKeyMaxCount();
    const c = Math.max(0, Math.min(max, Math.round(Number(count) || 0)));
    try{
      if(typeof bossKeysApplyAcquiredCount === "function"){
        bossKeysApplyAcquiredCount(c, {
          animate:false,
          updateApCount:true,
          source:"standalone-live-boss-key-force"
        });
      }
    }catch(_){}
    try{
      if(Array.isArray(bossKeysState)){
        for(let i = 0; i < bossKeysState.length; i++){
          if(bossKeysState[i]) bossKeysState[i].acquired = i < c;
        }
      }
    }catch(_){}
    try{ if(typeof bossKeysSyncLegacyMirror === "function") bossKeysSyncLegacyMirror(c); }catch(_){}
    try{ window.__apBossKeyCount = c; }catch(_){}
    try{ window.__prevApBossKeyCount = Math.max(Number(window.__prevApBossKeyCount || 0), c); }catch(_){}
    try{ if(typeof bossKeysSave === "function") bossKeysSave(); }catch(_){}
    try{ if(typeof bossKeysRender === "function") bossKeysRender(); }catch(_){}
    return standaloneCurrentBossKeyCount();
  }

  function standaloneHasLoadedSeedOrApConnection(){
    try{
      if(ap?.connected || ap?.inherentSeedActive) return true;
    }catch(_){}
    return !!standaloneProfileRuntime.randomizerReady;
  }

  function standaloneFlushBossKeysIfNoLoadedSeed(){
    if(standaloneHasLoadedSeedOrApConnection()) return false;
    try{
      const replay = window.__flprStandaloneBossKeyLiveRewardAnimation;
      if(replay && (Date.now() - Number(replay.ts || 0)) < 8500) return false;
    }catch(_){}
    try{
      const fx = window.__bossKeyCinematicFx;
      if(fx && fx.active) return false;
    }catch(_){}
    const hadBossKeys = (() => {
      try{ if(standaloneCurrentBossKeyCount() > 0) return true; }catch(_){}
      try{ if(Array.isArray(bossKeysState) && bossKeysState.some((key)=>!!key?.acquired)) return true; }catch(_){}
      return false;
    })();
    if(!hadBossKeys) return false;
    try{
      if(Array.isArray(bossKeysState)){
        bossKeysState.forEach((key)=>{
          if(key) key.acquired = false;
        });
      }
    }catch(_){}
    try{ if(typeof bossKeysSyncLegacyMirror === "function") bossKeysSyncLegacyMirror(0); }catch(_){}
    try{ window.__apBossKeyCount = 0; }catch(_){}
    try{ window.__prevApBossKeyCount = 0; }catch(_){}
    try{ if(typeof bossKeysSave === "function") bossKeysSave(); }catch(_){}
    try{ if(typeof bossKeysRender === "function") bossKeysRender(); }catch(_){}
    return true;
  }

  function standaloneBossKeyRewardKey(it, itemIndex, locId, itemName){
    const name = standaloneNormalizeLoose(itemName || "");
    const loc = Number(locId ?? it?.location ?? it?.location_id ?? it?.loc);
    const itemId = Number(it?.item);
    const source = Number(it?.player ?? it?.player_id ?? it?.source_player ?? it?.sender ?? 0) || 0;
    if(Number.isFinite(loc) && loc > 0){
      return [
        "boss-key",
        "seed:" + standaloneRewardSeedKey(),
        "loc:" + loc,
        "item:" + (Number.isFinite(itemId) ? itemId : ""),
        "source:" + source,
        "name:" + name
      ].join("|");
    }
    const idx = Number(itemIndex);
    if(Number.isFinite(idx) && idx >= 0){
      return [
        "boss-key",
        "seed:" + standaloneRewardSeedKey(),
        "idx:" + idx,
        "item:" + (Number.isFinite(itemId) ? itemId : ""),
        "source:" + source,
        "name:" + name
      ].join("|");
    }
    return [
      "boss-key",
      "seed:" + standaloneRewardSeedKey(),
      "fallback",
      "item:" + (Number.isFinite(itemId) ? itemId : ""),
      "source:" + source,
      "name:" + name
    ].join("|");
  }

  function standaloneShouldReplayLiveBossKeyReward(itemName, opts){
    try{
      if(!standaloneIsBossKeyRewardName(itemName)) return false;
      if(opts?.noPopup === true) return false;
      return !!(opts?.isSnapshot || opts?.isFlush);
    }catch(_){
      return false;
    }
  }

  function standaloneScheduleLiveBossKeyRewardAnimation(it, itemIndex, locId, itemName, previousCount, rewardKey){
    try{
      const key = rewardKey || standaloneBossKeyRewardKey(it, itemIndex, locId, itemName);
      if(!key) return;
      if(standaloneItemPanel.bossKeyReceiveSeen.has(key)) return;
      standaloneItemPanel.bossKeyReceiveSeen.add(key);
      if(standaloneItemPanel.bossKeyReceiveSeen.size > 500) standaloneItemPanel.bossKeyReceiveSeen.clear();
      const from = Math.max(0, Math.min(standaloneBossKeyMaxCount(), Math.round(Number(previousCount) || 0)));
      setTimeout(()=>{
        try{
          const max = standaloneBossKeyMaxCount();
          let current = standaloneCurrentBossKeyCount();
          let to = Math.max(current, Math.min(max, from + 1));
          if(current < to){
            current = standaloneForceBossKeyCount(to);
            to = Math.max(to, current);
          }
          if(to <= from && current > 0){
            to = current;
          }
          if(to <= from && current >= max && max > 0){
            to = current;
          }
          if(typeof bossKeysRunRedeemSequence === "function"){
            if(to > from){
              bossKeysRunRedeemSequence(from, to, { force:true });
            }else if(current > 0){
              bossKeysRunRedeemSequence(Math.max(0, current - 1), current, { force:true });
            }
          }
          window.__flprStandaloneBossKeyLiveRewardAnimation = {
            key,
            itemName:String(itemName || ""),
            itemIndex:Number(itemIndex),
            locId:Number(locId ?? it?.location ?? it?.location_id ?? it?.loc ?? 0),
            from,
            to:Math.max(to, current),
            ts:Date.now()
          };
          const keepTo = Math.max(to, current);
          if(keepTo > from){
            [320, 780, 1380, 2400].forEach((delay)=>{
              setTimeout(()=>{
                try{
                  const replay = window.__flprStandaloneBossKeyLiveRewardAnimation;
                  if(!replay || replay.key !== key) return;
                  if((Date.now() - Number(replay.ts || 0)) > 8500) return;
                  if(standaloneCurrentBossKeyCount() < keepTo){
                    standaloneForceBossKeyCount(keepTo);
                  }
                }catch(_){}
              }, delay);
            });
          }
        }catch(_){}
      }, 220);
    }catch(_){}
  }

  function standaloneReceivedListHasProgressiveReceipt(it, itemIndex, locId, itemName){
    try{
      const list = Array.isArray(ap?.receivedAll) ? ap.receivedAll : [];
      if(!list.length) return false;
      const idx = Number(itemIndex);
      const loc = Number(locId ?? it?.location ?? it?.location_id ?? it?.loc);
      const itemId = Number(it?.item);
      const source = Number(it?.player ?? it?.player_id ?? it?.source_player ?? it?.sender ?? 0) || 0;
      const wantName = standaloneNormalizeLoose(itemName || "");
      return list.some((row)=>{
        const rowIdx = Number(row?.recvIndex);
        if(Number.isFinite(idx) && idx >= 0 && Number.isFinite(rowIdx) && rowIdx === idx) return true;
        const rowLoc = Number(row?.locId ?? row?.location ?? 0);
        if(Number.isFinite(loc) && loc > 0 && Number.isFinite(rowLoc) && rowLoc > 0 && rowLoc !== loc) return false;
        const rowItem = Number(row?.itemId ?? row?.item);
        if(Number.isFinite(itemId) && Number.isFinite(rowItem) && rowItem !== itemId) return false;
        const rowSource = Number(row?.sourcePlayerId ?? row?.player ?? 0) || 0;
        if(source && rowSource && rowSource !== source) return false;
        const rowName = standaloneNormalizeLoose(row?.itemName || row?.baseItemName || "");
        return !wantName || !rowName || rowName === wantName;
      });
    }catch(_){
      return false;
    }
  }

  function standaloneProgressiveReceiptMayAnimate(opts, locId){
    try{
      if(opts?.isSnapshot || opts?.isFlush) return false;
      if(opts?.noPopup !== true) return true;
      if(opts?.pairedOverride) return true;
      const loc = Number(locId);
      return Number.isFinite(loc) && loc > 0;
    }catch(_){
      return true;
    }
  }

  function standaloneEnhanceReceivedEntry(it, itemIndex, locId){
    try{
      const list = Array.isArray(ap?.receivedAll) ? ap.receivedAll : [];
      if(!list.length) return;
      const idx = Number(itemIndex);
      const row = list.find((entry)=>Number(entry?.recvIndex) === idx) || list[list.length - 1];
      if(!row) return;
      const itemId = Number(it?.item);
      if(Number.isFinite(itemId)) row.itemId = itemId;
      const sourcePlayerId = Number(it?.player ?? it?.player_id ?? it?.source_player ?? it?.sender ?? row.sourcePlayerId ?? ap?.slot ?? 0);
      if(Number.isFinite(sourcePlayerId)) row.sourcePlayerId = sourcePlayerId;
      const loc = Number(locId ?? it?.location ?? it?.location_id ?? it?.loc ?? row.locId);
      if(Number.isFinite(loc)) row.locId = loc;
      const resolved = standaloneReceivedRowItemName(row);
      if(resolved && !standaloneLooksUnresolvedItemName(resolved, row.itemId)){
        const currentProgressiveTarget = standaloneProgressiveBallTarget(row.itemName || "");
        const resolvedProgressiveTarget = standaloneProgressiveBallTarget(resolved || "");
        if(currentProgressiveTarget && resolvedProgressiveTarget && !standaloneSameProgressiveTarget(currentProgressiveTarget, resolvedProgressiveTarget)){
          row.baseItemName = resolved;
        }else{
          row.itemName = resolved;
          row.baseItemName = resolved;
        }
      }
      try{
        const next = standaloneDedupeReceivedRowsList(list);
        if(ap && Array.isArray(next)) ap.receivedAll = next;
        standaloneRebuildReceivedKeySet();
        if(typeof saveReceivedList === "function") saveReceivedList(next);
      }catch(_){}
    }catch(_){}
  }

  function installStandaloneReceivedAddBridge(){
    let original = null;
    try{ original = (typeof addReceivedToList === "function") ? addReceivedToList : null; }catch(_){}
    if(!original){
      setTimeout(installStandaloneReceivedAddBridge, 120);
      return;
    }
    if(original.__flprStandaloneReceivedAddBridge) return;
    const sameReceivedEntry = (row, itemName, locationName, locId, meta)=>{
      try{
        const rowItem = standaloneNormalizeLoose(row?.itemName || row?.baseItemName || "");
        const wantItem = standaloneNormalizeLoose(itemName || "");
        if(rowItem && wantItem && rowItem !== wantItem) return false;
        const rowLocId = Number(row?.locId ?? row?.location ?? 0);
        const wantLocId = Number(locId);
        if(Number.isFinite(rowLocId) && rowLocId > 0 && Number.isFinite(wantLocId) && wantLocId > 0){
          return rowLocId === wantLocId;
        }
        const rowLoc = standaloneSentLocationComparable(row?.locationName || row?.checkName || "");
        const wantLoc = standaloneSentLocationComparable(locationName || "");
        if(rowLoc && wantLoc && rowLoc !== wantLoc) return false;
        const rowSource = Number(row?.sourcePlayerId ?? row?.player ?? 0) || 0;
        const wantSource = Number(meta?.sourcePlayerId ?? meta?.player ?? 0) || 0;
        if(rowSource && wantSource && rowSource !== wantSource) return false;
        return true;
      }catch(_){
        return false;
      }
    };
    const bridged = function standaloneAddReceivedToListBridge(itemName, locationName, checkName, recvIndex, flags, locId, baseItemName, meta){
      let nextIndex = recvIndex;
      try{
        if(recvIndex != null){
          const list = Array.isArray(ap?.receivedAll) ? ap.receivedAll : [];
          const existing = list.find((row)=>Number(row?.recvIndex) === Number(recvIndex));
          if(existing && !sameReceivedEntry(existing, itemName, locationName, locId, meta)){
            nextIndex = null;
          }
        }
      }catch(_){}
      return original.call(this, itemName, locationName, checkName, nextIndex, flags, locId, baseItemName, meta);
    };
    bridged.__flprStandaloneReceivedAddBridge = true;
    bridged.__flprStandaloneOriginalAddReceivedToList = original;
    try{ window.addReceivedToList = bridged; }catch(_){}
    try{ addReceivedToList = bridged; }catch(_){}
  }

  function installStandaloneReceivedRewardBridge(){
    let original = null;
    try{ original = (typeof processReceivedItem === "function") ? processReceivedItem : null; }catch(_){}
    if(!original){
      setTimeout(installStandaloneReceivedRewardBridge, 120);
      return;
    }
    if(original.__flprStandaloneRewardBridge){
      try{ standaloneApplyRewardInventoryState({ applyNewRewards:false }); }catch(_){}
      return;
    }
    const bridged = function standaloneProcessReceivedItemBridge(it, itemIndex, locId, opts){
      opts = opts || {};
      let receivedName = "";
      let progressiveKey = "";
      let replayBossKeyReward = false;
      let bossKeyRewardKey = "";
      let bossKeyPreviousCount = 0;
      let duplicateProgressive = false;
      let restoreChecksAfterReward = false;
      let quietSingleplayerNotice = false;
      try{
        receivedName = standaloneReceivedItemName(it);
        if(receivedName && standaloneProgressiveBallTarget(receivedName) && ap?.connected && !opts?.isSnapshot && !opts?.isFlush && !standaloneAuthoritativeReceivedMatches(itemIndex, it, locId)){
          const sourceId = Number(it?.player ?? it?.player_id ?? it?.source_player ?? it?.sender ?? 0) || 0;
          if(sourceId && sourceId === standaloneSelfSlotId()){
            try{ if(typeof apLog === "function") apLog(`Ignoring unconfirmed local received item until AP ReceivedItems confirms it: ${receivedName}`, { tab:"status" }); }catch(_){}
            try{ standalonePruneUnauthoritativeReceivedRows(); }catch(_){}
            return false;
          }
        }
        if(standaloneIsBallHintRewardName(receivedName)){
          standaloneZeroBallHintState();
          try{ if(typeof hintLog === "function") hintLog("[AP] Ball-location hint item suppressed; use AP !hint for Progressive Balls."); }catch(_){}
          try{ if(typeof hintUpdateUi === "function") hintUpdateUi(); }catch(_){}
          return false;
        }
        restoreChecksAfterReward = standaloneShouldRestoreChecksAfterReward(receivedName, it, opts);
        if(receivedName && standaloneProgressiveBallTarget(receivedName)){
          progressiveKey = standaloneProgressiveRewardKey(it, itemIndex, locId, receivedName);
          duplicateProgressive = !!(
            progressiveKey &&
            standaloneItemPanel.progressiveReceiveSeen.has(progressiveKey) &&
            standaloneProgressiveReceiptMayAnimate(opts, locId) &&
            standaloneReceivedListHasProgressiveReceipt(it, itemIndex, locId, receivedName)
          );
          standaloneRememberProgressiveRewardKey(progressiveKey);
        }
        replayBossKeyReward = standaloneShouldReplayLiveBossKeyReward(receivedName, opts);
        if(replayBossKeyReward){
          bossKeyRewardKey = standaloneBossKeyRewardKey(it, itemIndex, locId, receivedName);
          bossKeyPreviousCount = standaloneCurrentBossKeyCount();
        }
        quietSingleplayerNotice = standaloneShouldQuietSingleplayerReceivedNotification(receivedName, it, opts);
      }catch(_){}
      if(duplicateProgressive){
        try{ window.__flprStandaloneProgressiveDuplicateSuppressed = Number(window.__flprStandaloneProgressiveDuplicateSuppressed || 0) + 1; }catch(_){}
        try{ standaloneForceProgressiveUnlockFromInventory(receivedName, { animate:false, quiet:true }); }catch(_){}
        try{ standaloneScheduleTextRender("duplicate-progressive-receipt"); }catch(_){}
        return false;
      }
      const isolateReplay = standaloneShouldIsolateReceivedReplay(it, opts);
      const touchesReward = isolateReplay || standaloneReceivedItemTouchesRewardCounters(it);
      const showCounterRewardModal = standaloneShouldShowCounterRewardModal(receivedName, it, opts, isolateReplay, quietSingleplayerNotice);
      const snapshot = isolateReplay ? standaloneSnapshotRewardCounters() : null;
      const callOpts = isolateReplay
        ? { ...opts, noPopup:true, noFeed:true }
        : (quietSingleplayerNotice ? { ...opts, noPopup:true, noFeed:true } : opts);
      const result = isolateReplay
        ? standaloneWithCounterDrawerFxSuppressed(()=>original.call(this, it, itemIndex, locId, callOpts))
        : original.call(this, it, itemIndex, locId, callOpts);
      try{
        standaloneEnhanceReceivedEntry(it, itemIndex, locId);
        receivedName = receivedName || standaloneReceivedItemName(it);
        if(receivedName && standaloneProgressiveBallTarget(receivedName)){
          standaloneRememberProgressiveRewardKey(progressiveKey || standaloneProgressiveRewardKey(it, itemIndex, locId, receivedName));
          standaloneRememberProgressiveRewardKey(standaloneRewardItemKey(it, itemIndex, locId));
          if(opts?.isSnapshot || opts?.isFlush || opts?.noPopup === true){
            standaloneForceProgressiveUnlockFromInventory(receivedName, { animate:false, quiet:true });
          }else{
            setTimeout(()=>standaloneForceProgressiveUnlockFromInventory(receivedName, { animate:false, quiet:true }), 4600);
          }
        }
        if(isolateReplay){
          standaloneRestoreRewardCounters(snapshot);
          standaloneApplyRewardInventoryState({ applyNewRewards:true });
        }else if(touchesReward){
          standaloneApplyRewardInventoryState({ applyNewRewards:false });
        }
        if(showCounterRewardModal){
          standaloneShowReceivedCounterRewardModal(it, itemIndex, locId, receivedName, opts);
        }
        if(restoreChecksAfterReward){
          standaloneScheduleChecksRestoreAfterReward();
        }
        if(replayBossKeyReward){
          standaloneScheduleLiveBossKeyRewardAnimation(it, itemIndex, locId, receivedName, bossKeyPreviousCount, bossKeyRewardKey);
        }
      }catch(_){}
      return result;
    };
    bridged.__flprStandaloneRewardBridge = true;
    bridged.__flprStandaloneOriginalProcessReceivedItem = original;
    try{ window.processReceivedItem = bridged; }catch(_){}
    try{ processReceivedItem = bridged; }catch(_){}
    setTimeout(()=>{ try{ standaloneApplyRewardInventoryState({ applyNewRewards:false }); }catch(_){} }, 0);
  }

  function standaloneLogDisplayText(line){
    return String(line || "")
      .replace(/^\[[^\]]+\]:?\s*/, "")
      .replace(/^\d{1,2}:\d{2}:\d{2}\s*/, "")
      .trim();
  }

  function standaloneShouldShowLogLine(line){
    const text = String(line || "");
    const msg = standaloneLogDisplayText(text);
    if(!text.trim()) return false;
    if(/^(?:New Check:|FLIPPERMIZER CHECK;|Check metadata sent;|CHECK SENT;|CHECK STATE;)/i.test(msg)) return false;
    if(/^BOUNCED(?:\b|;|$)/i.test(msg)) return false;
    if(/FLPR-Bot sync/i.test(msg)) return false;
    if(/\bIgnoring\s+(?:off-seed|pseudo location)/i.test(msg)) return false;
    if(/\bIgnoring\s+.*\bProgressive Ball\b/i.test(msg)) return false;
    if(/^(?:AP Text Client ready|CONNECT clicked|Runtime;|Warning: overlay is running|AP endpoints:|Connecting to |WebSocket open;)/i.test(msg)) return false;
    if(/^(?:RoomInfo confirmed|UI relic run reset|ROOM INFO;|ROOM SLOTS;|RoomUpdate;|connected$|Server state:|Generic task payload;)/i.test(msg)) return false;
    if(/^SERVER\s+Retrieved\b/i.test(msg)) return false;
    if(/^(?:SERVER\s+)?(?:LocationInfo|LocationScouts);/i.test(msg)) return false;
    if(/^(?:OUT\b|SAY SENT TO AP SERVER|SYNC RECEIVED|ReceivedItems snapshot|RECEIVED ITEMS(?: SNAPSHOT)?;|DATAPACKAGE;)/i.test(msg)) return false;
    if(/^(?:Standalone ReceivedItems flushed|Deferred ReceivedItems flushed|World state|Progressive unlock correction|Progressive Ball applied to|Table unlocked by Progressive Ball|Table unlock intro triggered|False self-progression suppressed|settings saved|settings loaded)/i.test(msg)) return false;
    if(/^(?:SENT .+ to .+|RECEIVED .+ from .+)/i.test(msg)) return false;
    if(/\b(?:sent|has\s+found\s+their\s+own|found\s+their\s+own|found their)\s+(?:Item\s*#?\s*)?\d{4,}\b/i.test(msg)) return false;
    if(/^>\s+/.test(msg)) return false;
    return true;
  }

  function standaloneIsHintLogLine(line){
    const msg = standaloneLogDisplayText(line);
    if(!msg.trim()) return false;
    return /^\[hint\]:/i.test(msg)
      || /^HINT REQUEST;/i.test(msg)
      || /\b(?:hinted|is hinted|contains .+ for .+)\b/i.test(msg);
  }

  function standaloneLogDedupeKey(line){
    const msg = standaloneLogDisplayText(line)
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
    if(/^new check:/.test(msg)) return msg;
    if(/^client\(/.test(msg)) return msg;
    if(/\bhas (?:joined|left)\b/.test(msg)) return msg;
    if(/\b(?:sent|has found their own|found their own|found their)\b/.test(msg)) return msg;
    if(/^\[hint\]:/.test(msg)) return msg;
    return msg || String(line || "").trim().toLowerCase();
  }

  function standaloneTrimLogBuffer(buf){
    const max = Math.max(120, Number(standaloneTextClient.maxLines || 900) || 900);
    if(!Array.isArray(buf)) return [];
    const filtered = [];
    const seen = new Set();
    buf.map((line)=>String(line || "")).filter(standaloneShouldShowLogLine).forEach((line)=>{
      const key = standaloneLogDedupeKey(line);
      if(seen.has(key)) return;
      seen.add(key);
      filtered.push(line);
    });
    return filtered.length > max ? filtered.slice(filtered.length - max) : filtered;
  }

  function standaloneResetTextLogsForNewSession(){
    if(standaloneTextClient.sessionReset) return;
    standaloneTextClient.sessionReset = true;
    standaloneTextClient.loaded = true;
    standaloneTextClient.logs.status = [];
    standaloneTextClient.logs.hints = [];
    standaloneTextClient.logs.errors = [];
    try{ standaloneTextClient.itemLogMeta.clear(); }catch(_){}
    try{ standaloneTextClient.serverHints.clear(); }catch(_){}
    try{ localStorage.removeItem(STANDALONE_AP_LOG_KEY); }catch(_){}
  }

  function standaloneLoadPersistedTextLogs(){
    standaloneResetTextLogsForNewSession();
    if(standaloneTextClient.loaded) return;
    standaloneTextClient.loaded = true;
    const saved = standaloneReadJson(STANDALONE_AP_LOG_KEY, null);
    if(!saved || typeof saved !== "object") return;
    standaloneTextClient.logs.status = standaloneTrimLogBuffer([]
      .concat(saved.status || [])
      .concat(saved.chat || [])
      .concat(saved.generic || []));
    standaloneTextClient.logs.hints = standaloneTrimLogBuffer(saved.hints || []);
    standaloneTextClient.logs.errors = standaloneTrimLogBuffer(saved.errors || []);
  }

  function standaloneSavePersistedTextLogs(){
    standaloneWriteJson(STANDALONE_AP_LOG_KEY, {
      status: standaloneTrimLogBuffer(standaloneTextClient.logs.status || []),
      hints: standaloneTrimLogBuffer(standaloneTextClient.logs.hints || []),
      errors: standaloneTrimLogBuffer(standaloneTextClient.logs.errors || [])
    });
  }

  function standaloneAppendPersistedLogLine(tab, line){
    const t = standaloneTextNormalizeTab(tab);
    const text = String(line || "");
    if(!standaloneShouldShowLogLine(text)) return;
    const buf = standaloneTextClient.logs[t] || (standaloneTextClient.logs[t] = []);
    const key = standaloneLogDedupeKey(text);
    if(!buf.some((existing)=>standaloneLogDedupeKey(existing) === key)) buf.push(text);
    standaloneTextClient.logs[t] = standaloneTrimLogBuffer(buf);
  }

  function standalonePersistNativeLogBuffers(){
    standaloneLoadPersistedTextLogs();
    try{
      if(typeof apLogBuffers === "undefined" || !apLogBuffers) return;
      const map = { status:"status", generic:"status", chat:"status", errors:"errors" };
      Object.entries(map).forEach(([bucket, tab])=>{
        const native = apLogBuffers[bucket];
        if(!Array.isArray(native)) return;
        native.forEach((line)=>{
          standaloneAppendPersistedLogLine(tab, line);
          if(standaloneIsHintLogLine(line)) standaloneAppendPersistedLogLine("hints", line);
        });
      });
      standaloneSavePersistedTextLogs();
    }catch(_){}
  }

  function standaloneLoadSentItems(){
    if(standaloneItemPanel.sentLoaded) return;
    standaloneItemPanel.sentLoaded = true;
    const saved = standaloneReadJson(STANDALONE_SENT_ITEMS_KEY, []);
    standaloneItemPanel.sent = Array.isArray(saved) ? saved.slice(-standaloneItemPanel.maxSent) : [];
  }

  function standaloneSaveSentItems(){
    standaloneItemPanel.sent = Array.isArray(standaloneItemPanel.sent)
      ? standaloneItemPanel.sent.slice(-standaloneItemPanel.maxSent)
      : [];
    standaloneWriteJson(STANDALONE_SENT_ITEMS_KEY, standaloneItemPanel.sent);
  }

  function standaloneSentLocationComparable(value){
    const split = standaloneSplitLocationName(value);
    const table = standaloneNormalizeLoose(split.table || "");
    let rest = String(split.rest || value || "").trim();
    const obtain = rest.match(/^obtain\s+a\s+score\s+of\s+(.+)$/i);
    const score = rest.match(/^(?:easy|medium|hard)\s+score\s*\(([^)]+)\)$/i);
    if(obtain) rest = `score ${obtain[1]}`;
    else if(score) rest = `score ${score[1]}`;
    return `${table}|${standaloneNormalizeLoose(rest)}`;
  }

  function standaloneSentCorrectionKey(sender, receiver, locationName){
    return [
      standaloneNormalizeLoose(sender),
      standaloneNormalizeLoose(receiver),
      standaloneSentLocationComparable(locationName)
    ].join("|");
  }

  function standaloneParseSentLogLine(line){
    const text = standaloneLogDisplayText(line);
    const m = text.match(/^(.+?)\s+sent\s+(.+?)\s+to\s+(.+?)(?:\s+\((.*)\))?\.?$/i);
    if(!m) return null;
    return {
      sender: String(m[1] || "").trim(),
      itemName: String(m[2] || "").trim(),
      receiver: String(m[3] || "").trim(),
      locationName: String(m[4] || "").trim()
    };
  }

  function standaloneParseOwnFoundLogLine(line){
    const text = standaloneLogDisplayText(line);
    const m = text.match(/^(.+?)\s+(?:has\s+found\s+their\s+own|found\s+their\s+own|found\s+their)\s+(.+?)(?:\s+\((.*)\))?\.?$/i);
    if(!m) return null;
    return {
      player: String(m[1] || "").trim(),
      itemName: String(m[2] || "").trim(),
      locationName: String(m[3] || "").trim()
    };
  }

  function standaloneReplaceLogMessage(line, message){
    const prefix = String(line || "").match(/^(\[[^\]]+\]:?\s*)/)?.[1] || "";
    return `${prefix}${message}`;
  }

  function standaloneOutgoingSentEntry(entry){
    const self = standaloneSelfSlotId();
    const senderId = Number(entry?.senderId || 0) || 0;
    const receiverId = Number(entry?.receiverId || 0) || 0;
    if(!self || senderId !== self || !receiverId || receiverId === self) return false;
    return true;
  }

  function standaloneRepairSentItemsFromReceiverPackages(){
    standaloneLoadSentItems();
    let changed = false;
    (standaloneItemPanel.sent || []).forEach((entry)=>{
      changed = standaloneHydrateSentEntryFromKey(entry) || changed;
      const resolved = standaloneResolveSentMeta(entry);
      if(!resolved) return;
      const updates = {
        itemName: resolved.itemName,
        locationName: standaloneLocationDisplayName(resolved.locationName || "", resolved.locId),
        receiverPlayer: resolved.receiverPlayer,
        receiverGame: resolved.receiverGame,
        senderPlayer: resolved.senderPlayer,
        senderGame: resolved.senderGame,
        flags: standaloneFlagsForItem(resolved.flags, resolved.itemName)
      };
      Object.entries(updates).forEach(([key, value])=>{
        const text = String(value ?? "").trim();
        if(!text) return;
        if(key === "itemName" && standaloneLooksUnresolvedItemName(text, entry.itemId)) return;
        if(String(entry[key] ?? "").trim() !== text){
          entry[key] = key === "flags" ? Number(value || 0) : text;
          changed = true;
        }
      });
    });
    if(changed) standaloneSaveSentItems();
    return changed;
  }

  function standaloneBuildSentCorrections(){
    standaloneRepairSentItemsFromReceiverPackages();
    const corrections = new Map();
    try{
      (standaloneItemPanel.sent || []).forEach((entry)=>{
        if(!standaloneOutgoingSentEntry(entry)) return;
        const resolved = standaloneResolveSentMeta(entry);
        if(!resolved || standaloneLooksUnresolvedItemName(resolved.itemName, resolved.itemId)) return;
        const sender = String(resolved.senderPlayer || entry.senderPlayer || standaloneSelfPlayerName() || "").trim();
        const receiver = String(resolved.receiverPlayer || entry.receiverPlayer || "").trim();
        const locRaw = String(resolved.locationName || entry.locationName || "").trim();
        const locDisplay = standaloneLocationDisplayName(locRaw, resolved.locId || entry.locId);
        [locRaw, locDisplay].filter(Boolean).forEach((loc)=>{
          corrections.set(standaloneSentCorrectionKey(sender, receiver, loc), { ...resolved, locationName:locDisplay || locRaw });
        });
      });
    }catch(_){}
    return corrections;
  }

  function standaloneRepairLogBufferWithSentCorrections(buf, corrections){
    if(!Array.isArray(buf)) return { changed:false, lines:buf };
    const outgoing = standaloneOutgoingSentLocations();
    let changed = false;
    const lines = [];
    buf.forEach((line)=>{
      const found = standaloneParseOwnFoundLogLine(line);
      if(
        found &&
        standaloneProgressiveBallTarget(found.itemName) &&
        standaloneNormalizeLoose(found.player) === standaloneNormalizeLoose(standaloneSelfPlayerName()) &&
        found.locationName &&
        outgoing.locKeys.has(standaloneSentLocationComparable(found.locationName))
      ){
        changed = true;
        return;
      }
      if(!corrections || !corrections.size){
        lines.push(line);
        return;
      }
      const parsed = standaloneParseSentLogLine(line);
      if(!parsed || !parsed.locationName){
        lines.push(line);
        return;
      }
      const correction = corrections.get(standaloneSentCorrectionKey(parsed.sender, parsed.receiver, parsed.locationName));
      if(!correction){
        lines.push(line);
        return;
      }
      const fixedMessage = standaloneFormatItemSendLogLine(correction);
      if(!fixedMessage){
        lines.push(line);
        return;
      }
      const fixedLine = standaloneReplaceLogMessage(line, fixedMessage);
      if(fixedLine !== line) changed = true;
      lines.push(fixedLine);
    });
    return { changed, lines };
  }

  function standaloneRepairTextLogsFromSentItems(){
    const corrections = standaloneBuildSentCorrections();
    let changed = false;
    standaloneLoadPersistedTextLogs();
    ["status", "errors"].forEach((tab)=>{
      const repaired = standaloneRepairLogBufferWithSentCorrections(standaloneTextClient.logs[tab] || [], corrections);
      if(repaired.changed){
        standaloneTextClient.logs[tab] = standaloneTrimLogBuffer(repaired.lines);
        changed = true;
      }
    });
    try{
      if(typeof apLogBuffers !== "undefined" && apLogBuffers){
        Object.keys(apLogBuffers).forEach((bucket)=>{
          const repaired = standaloneRepairLogBufferWithSentCorrections(apLogBuffers[bucket] || [], corrections);
          if(repaired.changed){
            apLogBuffers[bucket] = repaired.lines;
            changed = true;
          }
        });
      }
    }catch(_){}
    if(changed) standaloneSavePersistedTextLogs();
    try{
      corrections.forEach((meta)=>{
        standaloneRememberItemSendLogMeta(meta, standaloneFormatItemSendLogLine(meta));
      });
    }catch(_){}
    return changed;
  }

  function standaloneReceivedKeyForRow(row){
    const idx = (row?.recvIndex != null) ? `idx:${row.recvIndex}` : "";
    return idx || `${row?.itemName || ""}|${row?.locationName || ""}`;
  }

  function standaloneRebuildReceivedKeySet(){
    try{
      ap.receivedKeySet = new Set((ap.receivedAll || []).map((row)=>standaloneReceivedKeyForRow(row)));
      ap.receivedSemanticKeySet = new Set((ap.receivedAll || []).map((row)=>standaloneReceivedSemanticKey(row)).filter(Boolean));
    }catch(_){}
  }

  function standaloneOutgoingSentLocations(){
    standaloneLoadSentItems();
    const locIds = new Set();
    const locKeys = new Set();
    try{
      (standaloneItemPanel.sent || []).forEach((entry)=>{
        if(!standaloneOutgoingSentEntry(entry)) return;
        const resolved = standaloneResolveSentMeta(entry) || entry;
        const locId = Number(resolved.locId ?? entry.locId);
        if(Number.isFinite(locId) && locId > 0) locIds.add(locId);
        [resolved.locationName, entry.locationName, standaloneLocationDisplayName(resolved.locationName || entry.locationName || "", locId)]
          .filter(Boolean)
          .forEach((loc)=>locKeys.add(standaloneSentLocationComparable(loc)));
      });
      standaloneLoadPersistedTextLogs();
      const allLogs = []
        .concat(standaloneTextClient.logs.status || [])
        .concat(standaloneTextClient.logs.errors || []);
      allLogs.forEach((line)=>{
        const parsed = standaloneParseSentLogLine(line);
        if(!parsed || !standaloneProgressiveBallTarget(parsed.itemName)) return;
        if(standaloneNormalizeLoose(parsed.sender) !== standaloneNormalizeLoose(standaloneSelfPlayerName())) return;
        if(standaloneNormalizeLoose(parsed.receiver) === standaloneNormalizeLoose(standaloneSelfPlayerName())) return;
        if(parsed.locationName) locKeys.add(standaloneSentLocationComparable(parsed.locationName));
      });
    }catch(_){}
    return { locIds, locKeys };
  }

  function standaloneLocationMatchesOutgoingSent(locId, locationName){
    const outgoing = standaloneOutgoingSentLocations();
    const id = Number(locId);
    if(Number.isFinite(id) && id > 0 && outgoing.locIds.has(id)) return true;
    const key = standaloneSentLocationComparable(locationName || "");
    return !!key && outgoing.locKeys.has(key);
  }

  function standaloneRepairFalseOwnProgressiveReceipts(){
    const self = standaloneSelfSlotId();
    if(!self) return false;
    const outgoing = standaloneOutgoingSentLocations();
    if(!outgoing.locIds.size && !outgoing.locKeys.size) return false;
    let list = [];
    try{ list = Array.isArray(ap?.receivedAll) && ap.receivedAll.length ? ap.receivedAll : (typeof loadReceivedList === "function" ? loadReceivedList() : []); }catch(_){}
    if(!Array.isArray(list) || !list.length) return false;
    let changed = false;
    const next = list.filter((row)=>{
      const itemName = String(row?.itemName || row?.baseItemName || "").trim();
      if(!standaloneProgressiveBallTarget(itemName)) return true;
      const sourceId = Number(row?.sourcePlayerId ?? row?.player ?? self) || self;
      if(sourceId !== self) return true;
      const locId = Number(row?.locId ?? row?.location ?? 0) || 0;
      const locKey = standaloneSentLocationComparable(row?.locationName || row?.checkName || "");
      const remove = (locId && outgoing.locIds.has(locId)) || (locKey && outgoing.locKeys.has(locKey));
      if(remove) changed = true;
      return !remove;
    });
    if(!changed) return false;
    try{ ap.receivedAll = next; }catch(_){}
    standaloneRebuildReceivedKeySet();
    try{ if(typeof saveReceivedList === "function") saveReceivedList(next); }catch(_){}
    try{ standaloneWithCounterDrawerFxSuppressed(()=>{ if(typeof apReconcileWorldStateFromReceived === "function") apReconcileWorldStateFromReceived(); }); }catch(_){}
    try{ if(typeof renderReceivedList === "function") renderReceivedList(); }catch(_){}
    try{ if(typeof updateCountCheckUI === "function") updateCountCheckUI(); }catch(_){}
    return true;
  }

  function standaloneRepairPersistedApState(){
    let changed = false;
    try{ changed = standaloneRepairSentItemsFromReceiverPackages() || changed; }catch(_){}
    try{ changed = standaloneRepairTextLogsFromSentItems() || changed; }catch(_){}
    try{ changed = standaloneRepairFalseOwnProgressiveReceipts() || changed; }catch(_){}
    try{ changed = standalonePruneUnauthoritativeReceivedRows() || changed; }catch(_){}
    if(changed){
      try{ standaloneScheduleTextRender("repair-state"); }catch(_){}
      try{ standaloneRenderItemPanel(); }catch(_){}
    }
    return changed;
  }

  function standaloneTextTimestamp(){
    const d = new Date();
    const pad = (n, l=2)=>String(n).padStart(l, "0");
    return `[${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}]`;
  }

  function standaloneTextNormalizeTab(tab){
    const t = String(tab || "").toLowerCase();
    if(t === "error" || t === "errors") return "errors";
    if(t === "hint" || t === "hints") return "hints";
    return "status";
  }

  function standaloneControlAll(selector){
    try{
      const nodes = Array.from(document.querySelectorAll(selector));
      const standalone = [];
      const other = [];
      nodes.forEach((node)=>{
        if(node && node.closest && node.closest(".flprStandaloneConnectLayout")) standalone.push(node);
        else other.push(node);
      });
      return standalone.concat(other);
    }catch(_){
      return [];
    }
  }

  function standalonePrimaryControl(selector){
    const nodes = standaloneControlAll(selector);
    return nodes.length ? nodes[0] : null;
  }

  function standaloneApPartNumber(part, keys){
    if(!part || typeof part !== "object") return NaN;
    for(const key of keys || []){
      const num = Number(part[key]);
      if(Number.isFinite(num)) return num;
    }
    return NaN;
  }

  function standaloneFirstFiniteNumber(){
    for(let i = 0; i < arguments.length; i++){
      const n = Number(arguments[i]);
      if(Number.isFinite(n)) return n;
    }
    return NaN;
  }

  function standaloneApJsonParts(pkt){
    return Array.isArray(pkt?.data) ? pkt.data.filter((part)=>part && typeof part === "object") : [];
  }

  function standaloneFirstJsonPart(pkt, type){
    const want = String(type || "").toLowerCase();
    return standaloneApJsonParts(pkt).find((part)=>String(part.type || "").toLowerCase() === want) || null;
  }

  function standaloneJsonPartsOfType(pkt, type){
    const want = String(type || "").toLowerCase();
    return standaloneApJsonParts(pkt).filter((part)=>String(part.type || "").toLowerCase() === want);
  }

  function standalonePartFallbackText(part){
    return String(part?.text ?? part?.name ?? part?.value ?? "").trim();
  }

  function standaloneSentMetaCacheKeys(meta){
    if(!meta) return [];
    const sender = Number(meta.senderId || 0) || 0;
    const receiver = Number(meta.receiverId || 0) || 0;
    const item = meta.itemId ?? "";
    const loc = meta.locId ?? "";
    const flags = meta.flags ?? 0;
    return [
      `${sender}|${receiver}|${item}|${loc}|${flags}`,
      `${sender}|${receiver}|${item}|${loc}`,
      `${sender}|${receiver}|${item}`,
      `${sender}|${item}|${loc}`,
      `${item}|${loc}`
    ];
  }

  function standaloneRememberServerSentMeta(meta){
    try{
      const serverItemName = String(meta?.serverItemName || "").trim();
      if(!serverItemName || standaloneLooksUnresolvedItemName(serverItemName, meta?.itemId)) return;
      const value = {
        serverItemName,
        receiverGame: String(meta?.receiverGame || ""),
        receiverId: Number(meta?.receiverId || 0) || 0,
        flags: meta?.flags ?? 0,
        at: Date.now()
      };
      standaloneSentMetaCacheKeys(meta).forEach((key)=>{
        if(key) standaloneItemPanel.sentServerMeta.set(key, value);
      });
      if(standaloneItemPanel.sentServerMeta.size > 900){
        const keys = Array.from(standaloneItemPanel.sentServerMeta.keys());
        keys.slice(0, Math.max(0, keys.length - 600)).forEach((key)=>standaloneItemPanel.sentServerMeta.delete(key));
      }
    }catch(_){}
  }

  function standaloneCachedServerSentMeta(meta){
    try{
      for(const key of standaloneSentMetaCacheKeys(meta)){
        const cached = standaloneItemPanel.sentServerMeta.get(key);
        if(cached) return cached;
      }
    }catch(_){}
    return null;
  }

  function standaloneExtractItemSendMeta(pkt){
    try{
      const type = String(pkt?.type || "").trim().toLowerCase();
      if(type !== "itemsend" && type !== "item_send") return null;
      const netItem = (pkt?.item && typeof pkt.item === "object") ? pkt.item : {};
      const itemPart = standaloneFirstJsonPart(pkt, "item_id");
      const locPart = standaloneFirstJsonPart(pkt, "location_id");
      const players = standaloneJsonPartsOfType(pkt, "player_id");
      let base = null;
      try{ if(typeof extractApItemSendMeta === "function") base = extractApItemSendMeta(pkt); }catch(_){}
      if(!base) base = {};
      const firstPlayerId = players.length ? standaloneApPartNumber(players[0], ["player", "player_id", "id"]) : NaN;
      const lastPlayerId = players.length ? standaloneApPartNumber(players[players.length - 1], ["player", "player_id", "id"]) : NaN;
      const itemId = standaloneFirstFiniteNumber(
        standaloneApPartNumber(itemPart, ["item", "item_id", "id"]),
        netItem.item,
        pkt?.item_id,
        (pkt?.item && typeof pkt.item !== "object") ? pkt.item : NaN,
        base.itemId
      );
      const locId = standaloneFirstFiniteNumber(
        standaloneApPartNumber(locPart, ["location", "location_id", "id"]),
        netItem.location,
        pkt?.location,
        pkt?.location_id,
        base.locId
      );
      const receiverId = standaloneFirstFiniteNumber(
        pkt?.receiving,
        pkt?.receiver,
        pkt?.target,
        pkt?.player_received,
        standaloneApPartNumber(itemPart, ["player", "player_id", "owner", "receiving_player"]),
        players.length > 1 ? lastPlayerId : NaN,
        base.receiverId
      );
      const senderId = standaloneFirstFiniteNumber(
        pkt?.player,
        pkt?.sender,
        pkt?.finder,
        netItem.player,
        standaloneApPartNumber(locPart, ["player", "player_id", "owner"]),
        firstPlayerId,
        base.senderId
      );
      const flags = Number(itemPart?.flags ?? itemPart?.item_flags ?? netItem.flags ?? pkt?.flags ?? base.flags ?? 0) || 0;
      const serverItemName = standalonePartFallbackText(itemPart);
      const serverLocationName = standalonePartFallbackText(locPart);
      const senderPlayer = String(base.senderPlayer || (()=>{ try{ return typeof apPlayerName === "function" ? apPlayerName(senderId, players[0] ? standalonePartFallbackText(players[0]) : "") : ""; }catch(_){ return ""; } })() || "");
      const receiverPlayer = String(base.receiverPlayer || (()=>{ try{ return typeof apPlayerName === "function" ? apPlayerName(receiverId, players.length ? standalonePartFallbackText(players[players.length - 1]) : "") : ""; }catch(_){ return ""; } })() || "");
      const receiverGame = standaloneGameForPlayer(receiverId, receiverPlayer, base.receiverGame);
      const senderGame = standaloneGameForPlayer(senderId, senderPlayer, base.senderGame);
      const meta = {
        ...base,
        senderId: Number.isFinite(senderId) ? senderId : Number(base.senderId || 0) || 0,
        receiverId: Number.isFinite(receiverId) ? receiverId : Number(base.receiverId || 0) || 0,
        itemId: Number.isFinite(itemId) ? itemId : (base.itemId ?? null),
        locId: Number.isFinite(locId) ? locId : (base.locId ?? null),
        flags,
        serverItemName,
        serverLocationName,
        senderPlayer,
        senderGame,
        receiverPlayer,
        receiverGame
      };
      meta.itemName = standaloneResolveApItemName(meta.itemId, meta.receiverId, serverItemName || base.itemName || "Unknown Item", meta.receiverGame, { preferServerForCrossGame:true });
      meta.locationName = standaloneResolveApLocationName(meta.locId, meta.senderId, serverLocationName || base.locationName || "");
      standaloneRememberServerSentMeta(meta);
      return meta;
    }catch(_){
      try{ return (typeof extractApItemSendMeta === "function") ? extractApItemSendMeta(pkt) : null; }catch(__){ return null; }
    }
  }

  function standaloneApJsonPartText(part){
    if(part == null) return "";
    if(typeof part === "string" || typeof part === "number" || typeof part === "boolean") return String(part);
    if(typeof part !== "object") return "";
    const type = String(part.type || "").toLowerCase();
    const rawText = String(part.text ?? part.name ?? part.value ?? "");
    const fallback = rawText.trim();
    if(type === "text") return rawText;
    if(type === "player_id"){
      const id = standaloneApPartNumber(part, ["player", "player_id", "id", "text"]);
      try{ if(typeof apPlayerName === "function") return apPlayerName(id, fallback); }catch(_){}
      return fallback || (Number.isFinite(id) ? `Player ${id}` : "");
    }
    if(type === "item_id"){
      const id = standaloneApPartNumber(part, ["item", "item_id", "id", "text"]);
      const playerId = standaloneApPartNumber(part, ["player", "player_id", "owner", "receiving_player"]);
      try{ return standaloneResolveApItemName(id, playerId, fallback); }catch(_){}
      return fallback || (Number.isFinite(id) ? `Item #${id}` : "");
    }
    if(type === "location_id"){
      const id = standaloneApPartNumber(part, ["location", "location_id", "id", "text"]);
      const playerId = standaloneApPartNumber(part, ["player", "player_id", "owner"]);
      try{ if(typeof apLocationNameFor === "function") return apLocationNameFor(id, playerId, fallback); }catch(_){}
      return fallback || (Number.isFinite(id) ? `Location #${id}` : "");
    }
    return fallback;
  }

  function standaloneFormatApJsonMessage(pkt){
    const type = String(pkt?.type || "").toLowerCase();
    if(type === "itemsend" || type === "item_send"){
      try{
        const meta = standaloneExtractItemSendMeta(pkt);
        const line = standaloneFormatItemSendLogLine(meta);
        if(line) return line;
      }catch(_){}
    }
    const data = Array.isArray(pkt?.data) ? pkt.data : [];
    let msg = data.map(standaloneApJsonPartText).join("");
    if(!msg.trim()) msg = String(pkt?.text ?? pkt?.message ?? "");
    return String(msg || "").replace(/\r\n/g, "\n").trim();
  }

  function installStandaloneApTextFormatter(){
    try{
      window.formatApJsonMessage = standaloneFormatApJsonMessage;
      formatApJsonMessage = standaloneFormatApJsonMessage;
      window.formatApItemSendLogLine = standaloneFormatItemSendLogLine;
      formatApItemSendLogLine = standaloneFormatItemSendLogLine;
    }catch(_){}
  }

  function standaloneNativeLogLines(tab){
    try{
      if(typeof apLogBuffers === "undefined" || !apLogBuffers) return [];
      const nativeTab = standaloneTextNormalizeTab(tab);
      const buckets = nativeTab === "hints"
        ? ["chat", "generic", "status"]
        : nativeTab === "errors"
        ? ["errors"]
        : ["chat", "generic", "status"];
      const lines = [];
      const seen = new Set();
      buckets.forEach((bucket)=>{
        const buf = apLogBuffers[bucket];
        if(!Array.isArray(buf)) return;
        buf.forEach((line)=>{
          const key = String(line);
          if(!standaloneShouldShowLogLine(key)) return;
          if(nativeTab === "hints" && !standaloneIsHintLogLine(key)) return;
          const dedupeKey = standaloneLogDedupeKey(key);
          if(seen.has(dedupeKey)) return;
          seen.add(dedupeKey);
          lines.push(line);
        });
      });
      return lines.sort((a, b)=>String(a).localeCompare(String(b)));
    }catch(_){
      return [];
    }
  }

  function standaloneVisibleLogLines(tab){
    standaloneLoadPersistedTextLogs();
    const nativeLines = standaloneNativeLogLines(tab);
    const persisted = standaloneTextClient.logs[standaloneTextNormalizeTab(tab)] || [];
    const lines = [];
    const seen = new Set();
    persisted.concat(nativeLines).forEach((line)=>{
      const text = String(line || "");
      if(!standaloneShouldShowLogLine(text)) return;
      const key = standaloneLogDedupeKey(text);
      if(seen.has(key)) return;
      seen.add(key);
      lines.push(text);
    });
    return standaloneTrimLogBuffer(lines);
  }

  function standaloneApItemTooltipMeta(cls){
    const text = String(cls || "");
    if(/\bapItem-progression\b/.test(text)) return { key:"progression", label:"Progression Item" };
    if(/\bapItem-useful\b/.test(text)) return { key:"useful", label:"Useful Item" };
    if(/\bapItem-trap\b/.test(text)) return { key:"trap", label:"Trap Item" };
    if(/\bapItem-filler\b/.test(text)) return { key:"filler", label:"Filler Item" };
    return null;
  }

  function standaloneDecorateApItemTooltip(span, cls){
    try{
      if(!span || !/\bapLogItem\b/.test(String(cls || ""))) return;
      const meta = standaloneApItemTooltipMeta(cls);
      if(!meta) return;
      span.removeAttribute("title");
      span.setAttribute("aria-label", meta.label);
      span.dataset.apItemTooltip = meta.label;
      span.dataset.apItemType = meta.key;
    }catch(_){}
  }

  function standaloneEnsureApLogItemTooltip(){
    if(window.__flprStandaloneApItemTooltipBound) return;
    window.__flprStandaloneApItemTooltipBound = true;
    let tip = null;
    let activeClass = "";
    const ensureTip = ()=>{
      if(tip && tip.isConnected) return tip;
      tip = document.createElement("div");
      tip.id = "standaloneApItemHoverTip";
      tip.className = "standaloneApItemHoverTip";
      tip.setAttribute("role", "tooltip");
      document.body.appendChild(tip);
      return tip;
    };
    const positionTip = (event)=>{
      const node = ensureTip();
      const pad = 12;
      const vw = Math.max(320, Number(window.innerWidth || 0) || 0);
      const vh = Math.max(240, Number(window.innerHeight || 0) || 0);
      const x = Math.min(vw - pad, Math.max(pad, Number(event?.clientX || 0)));
      const y = Math.min(vh - pad, Math.max(pad, Number(event?.clientY || 0)));
      node.style.left = `${x}px`;
      node.style.top = `${y}px`;
    };
    const showTip = (target, event)=>{
      const text = String(target?.dataset?.apItemTooltip || target?.title || "").trim();
      if(!text) return;
      const node = ensureTip();
      if(activeClass) node.classList.remove(activeClass);
      activeClass = target?.dataset?.apItemType ? `apItem-${target.dataset.apItemType}` : "";
      if(activeClass) node.classList.add(activeClass);
      node.textContent = text;
      positionTip(event || {});
      node.classList.add("visible");
    };
    const hideTip = ()=>{
      if(!tip) return;
      tip.classList.remove("visible");
    };
    document.addEventListener("pointerover", (event)=>{
      const target = event.target?.closest?.(".flprStandaloneConnectLayout #apConnLogBody .apLogItem[data-ap-item-tooltip]");
      if(!target) return;
      showTip(target, event);
    }, true);
    document.addEventListener("pointermove", (event)=>{
      const target = event.target?.closest?.(".flprStandaloneConnectLayout #apConnLogBody .apLogItem[data-ap-item-tooltip]");
      if(!target) return;
      positionTip(event);
    }, true);
    document.addEventListener("pointerout", (event)=>{
      const target = event.target?.closest?.(".flprStandaloneConnectLayout #apConnLogBody .apLogItem[data-ap-item-tooltip]");
      if(!target) return;
      const next = event.relatedTarget?.closest?.(".flprStandaloneConnectLayout #apConnLogBody .apLogItem[data-ap-item-tooltip]");
      if(next === target) return;
      hideTip();
    }, true);
    document.addEventListener("scroll", hideTip, true);
    window.addEventListener("blur", hideTip);
  }

  function standaloneAppendLogSpan(parent, text, cls){
    if(text == null || text === "") return;
    const span = document.createElement("span");
    if(cls) span.className = cls;
    standaloneDecorateApItemTooltip(span, cls);
    span.textContent = String(text);
    parent.appendChild(span);
  }

  function standaloneAppendLogText(parent, text){
    if(text == null || text === "") return;
    parent.appendChild(document.createTextNode(String(text)));
  }

  function standaloneItemLogKey(line, itemName){
    const msg = standaloneLogDisplayText(line).replace(/\s+/g, " ").trim().toLowerCase();
    const item = String(itemName || "").replace(/\s+/g, " ").trim().toLowerCase();
    return item ? `${msg}|${item}` : msg;
  }

  function standaloneRememberItemLogMeta(line, itemName, flags, itemId){
    const msg = String(line || "").trim();
    const item = String(itemName || "").trim();
    if(!msg || !item) return;
    const meta = {
      flags: standaloneFlagsForItem(flags, item),
      itemId: itemId ?? null,
      itemName: item
    };
    standaloneTextClient.itemLogMeta.set(standaloneItemLogKey(msg, item), meta);
    standaloneTextClient.itemLogMeta.set(standaloneItemLogKey(msg, ""), meta);
    if(standaloneTextClient.itemLogMeta.size > 700){
      const keys = Array.from(standaloneTextClient.itemLogMeta.keys());
      keys.slice(0, Math.max(0, keys.length - 500)).forEach((key)=>standaloneTextClient.itemLogMeta.delete(key));
    }
  }

  function standaloneRememberItemSendLogMeta(meta, lineOverride){
    try{
      const next = standaloneResolveSentMeta(meta);
      if(!next || standaloneLooksUnresolvedItemName(next.itemName, next.itemId)) return;
      let line = String(lineOverride || "").trim();
      if(!line){
        line = standaloneFormatItemSendLogLine(next);
      }
      if(!line){
        const sender = String(next.senderPlayer || "Unknown Player").trim();
        const receiver = String(next.receiverPlayer || "Unknown Player").trim();
        const loc = standaloneLocationDisplayName(next.locationName || "", next.locId);
        line = `${sender} sent ${next.itemName} to ${receiver}${loc ? ` (${loc})` : ""}`;
      }
      standaloneRememberItemLogMeta(line, next.itemName, next.flags, next.itemId);
    }catch(_){}
  }

  function standaloneRememberJsonItemLogMeta(pkt){
    try{
      const data = Array.isArray(pkt?.data) ? pkt.data : [];
      if(!data.length) return;
      const line = standaloneFormatApJsonMessage(pkt);
      if(!line) return;
      data.forEach((part)=>{
        if(!part || typeof part !== "object" || String(part.type || "").toLowerCase() !== "item_id") return;
        const itemId = standaloneApPartNumber(part, ["item", "item_id", "id", "text"]);
        const playerId = standaloneApPartNumber(part, ["player", "player_id", "owner", "receiving_player"]);
        const itemName = standaloneResolveApItemName(itemId, playerId, String(part.text ?? part.name ?? part.value ?? ""));
        if(standaloneLooksUnresolvedItemName(itemName, itemId)) return;
        standaloneRememberItemLogMeta(line, itemName, part.flags ?? part.item_flags ?? 0, itemId);
      });
    }catch(_){}
  }

  function standaloneItemLogClass(line, itemName){
    const meta = standaloneTextClient.itemLogMeta.get(standaloneItemLogKey(line, itemName))
      || standaloneTextClient.itemLogMeta.get(standaloneItemLogKey(line, ""));
    if(!meta) return "apLogItem";
    const cls = standaloneItemClass(meta.flags, itemName || meta.itemName);
    return `apLogItem apItem-${cls.key}`;
  }

  function standaloneRenderSendLine(parent, msg){
    let m = String(msg || "").match(/^(.+?)\s+sent\s+(.+?)\s+to\s+(.+?)(\s+\(.+\))?\.?$/i);
    if(!m) return false;
    standaloneAppendLogSpan(parent, m[1], "apLogPlayer");
    standaloneAppendLogText(parent, " sent ");
    standaloneAppendLogSpan(parent, m[2], standaloneItemLogClass(msg, m[2]));
    standaloneAppendLogText(parent, " to ");
    standaloneAppendLogSpan(parent, m[3], "apLogPlayer");
    if(m[4]) standaloneAppendLogSpan(parent, m[4], "apLogLocation");
    return true;
  }

  function standaloneRenderFoundLine(parent, msg){
    const m = String(msg || "").match(/^(.+?)\s+(has\s+found\s+their\s+own|found\s+their\s+own|found\s+their)\s+(.+?)(\s+\(.+\))?\.?$/i);
    if(!m) return false;
    standaloneAppendLogSpan(parent, m[1], "apLogPlayer");
    standaloneAppendLogText(parent, ` ${m[2]} `);
    standaloneAppendLogSpan(parent, m[3], standaloneItemLogClass(msg, m[3]));
    if(m[4]) standaloneAppendLogSpan(parent, m[4], "apLogLocation");
    return true;
  }

  function standaloneRenderPresenceLine(parent, msg){
    let m = String(msg || "").match(/^(.+?)\s+(\(Team\s+#?\d+\))\s+playing\s+(.+?)\s+has\s+joined\.\s*(.*)$/i);
    if(m){
      standaloneAppendLogSpan(parent, m[1], "apLogPlayer");
      standaloneAppendLogText(parent, " ");
      standaloneAppendLogSpan(parent, m[2], "apLogMuted");
      standaloneAppendLogText(parent, " playing ");
      standaloneAppendLogSpan(parent, m[3], "apLogLocation");
      standaloneAppendLogText(parent, " has ");
      standaloneAppendLogSpan(parent, "joined", "apLogEvent");
      standaloneAppendLogText(parent, ".");
      if(m[4]) standaloneAppendLogSpan(parent, " " + m[4], "apLogMuted");
      return true;
    }
    m = String(msg || "").match(/^(.+?)\s+(\(Team\s+#?\d+\))\s+has\s+left( the game)?\.\s*(.*)$/i);
    if(m){
      standaloneAppendLogSpan(parent, m[1], "apLogPlayer");
      standaloneAppendLogText(parent, " ");
      standaloneAppendLogSpan(parent, m[2], "apLogMuted");
      standaloneAppendLogText(parent, " has ");
      standaloneAppendLogSpan(parent, "left", "apLogEvent");
      standaloneAppendLogText(parent, (m[3] || "") + ".");
      if(m[4]) standaloneAppendLogSpan(parent, " " + m[4], "apLogMuted");
      return true;
    }
    return false;
  }

  function standaloneRenderNewCheckLine(parent, msg){
    const m = String(msg || "").match(/^(New Check:\s*)(.+?)(\s+\(\d+\/\d+\))?$/i);
    if(!m) return false;
    standaloneAppendLogSpan(parent, m[1], "apLogEvent");
    standaloneAppendLogSpan(parent, m[2], "apLogLocation");
    if(m[3]) standaloneAppendLogSpan(parent, m[3], "apLogMuted");
    return true;
  }

  function standaloneRenderHintLine(parent, msg){
    const m = String(msg || "").match(/^(\[Hint\]:\s*)(.+?)\s+contains\s+(.+?)\s+for\s+(.+?)\.?$/i);
    if(!m) return false;
    standaloneAppendLogSpan(parent, m[1], "apLogHint");
    standaloneAppendLogSpan(parent, m[2], "apLogLocation");
    standaloneAppendLogText(parent, " contains ");
    standaloneAppendLogSpan(parent, m[3], standaloneItemLogClass(msg, m[3]));
    standaloneAppendLogText(parent, " for ");
    standaloneAppendLogSpan(parent, m[4].replace(/\.$/, ""), "apLogPlayer");
    if(/\.$/.test(String(msg || ""))) standaloneAppendLogText(parent, ".");
    return true;
  }

  function standaloneRenderChatLine(parent, msg){
    const m = String(msg || "").match(/^([^:]{1,80}):\s+(.+)$/);
    if(!m) return false;
    standaloneAppendLogSpan(parent, m[1], "apLogPlayer");
    standaloneAppendLogText(parent, ": ");
    standaloneAppendLogSpan(parent, m[2], /^!/.test(m[2]) ? "apLogHint" : "");
    return true;
  }

  function standaloneRenderClientLine(parent, msg){
    if(!/^Client\(/i.test(String(msg || ""))) return false;
    standaloneAppendLogSpan(parent, msg, "apLogSource");
    return true;
  }

  function standaloneRenderLogMessage(parent, msg){
    const text = String(msg || "");
    if(standaloneRenderClientLine(parent, text)) return;
    if(standaloneRenderNewCheckLine(parent, text)) return;
    if(standaloneRenderHintLine(parent, text)) return;
    if(standaloneRenderPresenceLine(parent, text)) return;
    if(standaloneRenderSendLine(parent, text)) return;
    if(standaloneRenderFoundLine(parent, text)) return;
    if(standaloneRenderChatLine(parent, text)) return;
    standaloneAppendLogSpan(parent, text, "apLogSource");
  }

  function standaloneBuildLogLine(line){
    const row = document.createElement("div");
    row.className = "apLogLine";
    const text = String(line || "");
    const m = text.match(/^(\[[^\]]+\]:?\s*)(.*)$/);
    if(m){
      standaloneAppendLogSpan(row, m[1], "apLogTimestamp");
      standaloneRenderLogMessage(row, m[2]);
    }else{
      standaloneRenderLogMessage(row, text);
    }
    return row;
  }

  function standaloneBuildHintLogRow(line){
    const row = document.createElement("div");
    row.className = "apHintCard";
    const text = String(line || "");
    const m = text.match(/^(\[[^\]]+\]:?\s*|\d{1,2}:\d{2}:\d{2}\s*)?(.*)$/);
    const timeText = String(m?.[1] || "").trim();
    const msg = String(m?.[2] || text).trim();
    const time = document.createElement("div");
    time.className = "apHintTime";
    time.textContent = timeText || "HINT";
    const body = document.createElement("div");
    body.className = "apHintText";
    standaloneRenderLogMessage(body, msg);
    row.appendChild(time);
    row.appendChild(body);
    return row;
  }

  function standaloneVisibleServerHints(){
    try{
      const rows = [];
      standaloneTextClient.serverHints.forEach((hint, key)=>{
        const next = standaloneHydrateServerHintRecord(hint);
        if(!next) return;
        standaloneTextClient.serverHints.set(key, next);
        rows.push(next);
      });
      rows.sort((a, b)=>{
        const ap = Number(a?.priority?.rank ?? 9);
        const bp = Number(b?.priority?.rank ?? 9);
        if(ap !== bp) return ap - bp;
        if(!!a?.found !== !!b?.found) return a?.found ? 1 : -1;
        return String(a?.locationName || "").localeCompare(String(b?.locationName || ""));
      });
      return rows;
    }catch(_){
      return [];
    }
  }

  function standaloneBuildServerHintCard(hint){
    const row = document.createElement("div");
    const priority = hint?.priority || standaloneServerHintPriority(hint?.flags, hint?.itemName);
    row.className = `apServerHintCard priority-${String(priority.key || "filler")}`;

    const meta = document.createElement("div");
    meta.className = "apServerHintMeta";
    const priorityBadge = document.createElement("span");
    priorityBadge.className = "apServerHintBadge";
    priorityBadge.textContent = `PRIORITY; ${String(priority.label || "FILLER")}`;
    meta.appendChild(priorityBadge);
    const statusBadge = document.createElement("span");
    statusBadge.className = `apServerHintBadge apServerHintStatus ${hint?.found ? "found" : "uncollected"}`;
    statusBadge.textContent = hint?.found ? "FOUND" : "UNCOLLECTED";
    meta.appendChild(statusBadge);
    row.appendChild(meta);

    const itemLine = document.createElement("div");
    itemLine.className = "apServerHintLine";
    standaloneAppendLogSpan(itemLine, "ITEM; ", "apLogMuted");
    standaloneAppendLogSpan(itemLine, String(hint?.itemName || "Unknown Item"), `apLogItem apItem-${String(priority.key || "filler")}`);
    row.appendChild(itemLine);

    const locLine = document.createElement("div");
    locLine.className = "apServerHintLine";
    standaloneAppendLogSpan(locLine, "LOCATION; ", "apLogMuted");
    standaloneAppendLogSpan(locLine, String(hint?.locationName || "Unknown Location"), "apLogLocation");
    row.appendChild(locLine);

    const forLine = document.createElement("div");
    forLine.className = "apServerHintLine";
    standaloneAppendLogSpan(forLine, "FOR; ", "apLogMuted");
    standaloneAppendLogSpan(forLine, String(hint?.receiverPlayer || "Unknown Player"), "apLogPlayer");
    const game = String(hint?.receiverGame || "").trim();
    if(game) standaloneAppendLogSpan(forLine, ` (${game})`, "apLogMuted");
    row.appendChild(forLine);

    return row;
  }

  function standaloneBuildServerHintSection(serverHints){
    const wrap = document.createElement("div");
    wrap.className = "apServerHintSection";
    const head = document.createElement("div");
    head.className = "apServerHintHeader";
    const title = document.createElement("span");
    title.textContent = "SERVER HINTS FOR OUR CHECKS";
    head.appendChild(title);
    const meta = document.createElement("small");
    const count = Array.isArray(serverHints) ? serverHints.length : 0;
    meta.textContent = count ? `${count} hinted item${count === 1 ? "" : "s"}` : "none yet";
    head.appendChild(meta);
    wrap.appendChild(head);
    if(count){
      serverHints.forEach((hint)=>wrap.appendChild(standaloneBuildServerHintCard(hint)));
    }else{
      const d = document.createElement("div");
      d.className = "apLogEmpty";
      d.textContent = "No server hints where your world is holding another player's item yet.";
      wrap.appendChild(d);
    }
    return wrap;
  }

  function standaloneScheduleTextRender(reason){
    try{ standaloneTextClient.lastRenderReason = String(reason || ""); }catch(_){}
    if(standaloneTextClient.renderTimer || standaloneTextClient.renderRaf) return;
    const run = ()=>{
      standaloneTextClient.renderTimer = 0;
      standaloneTextClient.renderRaf = 0;
      try{ standaloneTextRender(); }catch(_){}
    };
    try{
      if(typeof requestAnimationFrame === "function"){
        standaloneTextClient.renderRaf = requestAnimationFrame(run);
        return;
      }
    }catch(_){}
    standaloneTextClient.renderTimer = setTimeout(run, 16);
  }

  function standaloneCaptureScrollState(node){
    if(!node) return null;
    try{
      const top = Number(node.scrollTop || 0) || 0;
      const height = Number(node.scrollHeight || 0) || 0;
      const client = Number(node.clientHeight || 0) || 0;
      return {
        top,
        height,
        client,
        atStart: top <= 24,
        atEnd: Math.abs((height - client) - top) < 28
      };
    }catch(_){
      return null;
    }
  }

  function standaloneRestoreScrollState(node, snap, opts){
    if(!node || !snap) return;
    opts = opts || {};
    try{
      if(opts.followEnd && snap.atEnd){
        node.scrollTop = node.scrollHeight;
        return;
      }
      if(opts.preservePrepended && !snap.atStart){
        node.scrollTop = Math.max(0, snap.top + ((Number(node.scrollHeight || 0) || 0) - snap.height));
        return;
      }
      node.scrollTop = Math.max(0, snap.top);
    }catch(_){}
  }

  function standaloneItemPanelBodies(){
    return standaloneControlAll("#receivedBody").filter((body)=>body && body.closest && body.closest(".flprStandaloneConnectLayout"));
  }

  function standaloneCaptureItemPanelScrollSnapshots(){
    const snaps = new Map();
    standaloneItemPanelBodies().forEach((body)=>{
      const snap = standaloneCaptureScrollState(body);
      snaps.set(body, snap);
      try{ body.__flprStandaloneLastItemScrollSnap = snap; }catch(_){}
    });
    return snaps;
  }

  function standaloneRestoreItemPanelScrollSnapshots(snaps, opts){
    if(!snaps || typeof snaps.forEach !== "function") return;
    snaps.forEach((snap, body)=>{
      standaloneRestoreScrollState(body, snap, opts || { preservePrepended:true });
      try{ body.__flprStandaloneLastItemScrollSnap = standaloneCaptureScrollState(body) || snap; }catch(_){}
    });
  }

  function standaloneScheduleItemPanelScrollRestore(snaps, opts){
    if(!snaps || typeof snaps.forEach !== "function") return;
    let shouldRestore = false;
    try{
      snaps.forEach((snap)=>{
        if(snap && !snap.atStart && Number(snap.top || 0) > 24) shouldRestore = true;
      });
    }catch(_){}
    if(!shouldRestore) return;
    const restore = ()=>standaloneRestoreItemPanelScrollSnapshots(snaps, opts || { preservePrepended:true });
    try{
      if(typeof requestAnimationFrame === "function") requestAnimationFrame(restore);
    }catch(_){}
    try{ setTimeout(restore, 0); }catch(_){}
    try{ setTimeout(restore, 40); }catch(_){}
  }

  function standaloneTextRender(){
    const bodies = standaloneControlAll("#apConnLogBody");
    if(!bodies.length) return;
    standaloneUpdatePanelSoundButtons();
    const tab = standaloneTextNormalizeTab(standaloneTextClient.activeTab);
    standaloneControlAll("#apLogTabs .apLogTab").forEach((btn)=>{
      btn.classList.toggle("active", standaloneTextNormalizeTab(btn.dataset.aplogTab || "") === tab);
    });
    const lines = standaloneVisibleLogLines(tab);
    const serverHints = tab === "hints" ? standaloneVisibleServerHints() : [];
    const empty = tab === "errors"
      ? "No AP errors yet."
      : (tab === "hints" ? "No AP hints yet. Send a !hint request to collect hint responses here." : "AP Text Client ready. Connect to a server, then type chat or !hint commands here.");
    const serverHintSig = serverHints.map((hint)=>[
      hint.locId,
      hint.itemId,
      hint.receiverId,
      hint.found ? 1 : 0,
      hint.itemName,
      hint.locationName,
      hint.priority?.key || ""
    ].join(":")).join("|");
    const renderKey = JSON.stringify({ tab, lines, empty, serverHintSig });
    bodies.forEach((body)=>{
      if(body.__flprStandaloneLogRenderKey === renderKey && body.childNodes.length){
        return;
      }
      const scrollSnap = standaloneCaptureScrollState(body);
      const frag = document.createDocumentFragment();
      if(tab === "hints") frag.appendChild(standaloneBuildServerHintSection(serverHints));
      if(lines.length){
        lines.forEach((line)=>frag.appendChild(tab === "hints" ? standaloneBuildHintLogRow(line) : standaloneBuildLogLine(line)));
      }else{
        if(tab !== "hints" || !serverHints.length){
          const d = document.createElement("div");
          d.className = "apLogEmpty";
          d.textContent = empty;
          frag.appendChild(d);
        }
      }
      body.replaceChildren(frag);
      body.__flprStandaloneLogRenderKey = renderKey;
      standaloneRestoreScrollState(body, scrollSnap, { followEnd:true });
    });
  }

  function standaloneMirrorReceivedList(opts){
    standaloneRenderItemPanel(opts);
  }

  function standaloneItemTabName(tab){
    return String(tab || "").toLowerCase() === "sent" ? "sent" : "received";
  }

  function standaloneItemCount(tab){
    standaloneLoadSentItems();
    if(standaloneItemTabName(tab) === "sent"){
      standalonePruneOwnProgressiveSentItems();
      return standaloneItemPanel.sent.length;
    }
    try{ return standaloneApplyReceivedDedupe().length; }catch(_){ return 0; }
  }

  function standaloneItemClass(flags, itemName){
    try{
      if(typeof apItemClassFromFlags === "function") return apItemClassFromFlags(standaloneFlagsForItem(flags, itemName), itemName);
    }catch(_){}
    return { key:"normal", label:"ITEM", title:"ITEM" };
  }

  function standaloneReceivedRowIsProgression(row){
    try{
      const cls = standaloneItemClass(row?.flags ?? 0, row?.itemName || "");
      if(String(cls?.key || "") === "progression") return true;
      const name = String(row?.itemName || "");
      return !!standaloneProgressiveBallTarget(name) || /boss\s*key|progressive\s*ball/i.test(name);
    }catch(_){
      return false;
    }
  }

  function standaloneMarkNewReceivedRows(rows, opts){
    const list = Array.isArray(rows) ? rows : [];
    if(!list.length) return list;
    const keys = new Set(list.map((row)=>String(row?.key || "")).filter(Boolean));
    if(!standaloneItemPanel.knownReceivedKeys.size){
      standaloneItemPanel.knownReceivedKeys = keys;
      return list;
    }
    const incoming = list.filter((row)=>{
      const key = String(row?.key || "");
      return key && !standaloneItemPanel.knownReceivedKeys.has(key) && standaloneReceivedRowIsProgression(row);
    });
    standaloneItemPanel.knownReceivedKeys = new Set([].concat(Array.from(standaloneItemPanel.knownReceivedKeys), Array.from(keys)).slice(-700));
    if(incoming.length){
      standaloneItemPanel.newReceivedKeys = new Set(incoming.map((row)=>String(row.key || "")).filter(Boolean));
      standaloneItemPanel.newestReceivedKey = String(incoming[0]?.key || "");
      if(!opts?.silent) standalonePlayItemLogChink();
      try{
        setTimeout(()=>{
          try{
            incoming.forEach((row)=>standaloneItemPanel.newReceivedKeys.delete(String(row?.key || "")));
            if(incoming.some((row)=>String(row?.key || "") === standaloneItemPanel.newestReceivedKey)) standaloneItemPanel.newestReceivedKey = "";
          }catch(_){}
        }, 3200);
      }catch(_){}
    }
    list.forEach((row)=>{
      const key = String(row?.key || "");
      row.isNewProgression = key && standaloneItemPanel.newReceivedKeys.has(key);
      row.isNewestProgression = key && key === standaloneItemPanel.newestReceivedKey;
    });
    return list;
  }

  function standaloneReceivedIndexKey(row){
    const idx = Number(row?.recvIndex);
    return Number.isFinite(idx) && idx >= 0 ? `idx:${Math.round(idx)}` : "";
  }

  function standaloneReceivedSemanticKey(row){
    try{
      const itemId = Number(row?.itemId ?? row?.item);
      const itemName = standaloneNormalizeLoose(row?.itemName || row?.baseItemName || "");
      const itemKey = Number.isFinite(itemId) ? `item:${Math.round(itemId)}` : (itemName ? `item-name:${itemName}` : "");
      const locId = Number(row?.locId ?? row?.location);
      const locName = standaloneNormalizeLoose(row?.locationName || row?.checkName || "");
      const locKey = Number.isFinite(locId) && locId > 0 ? `loc:${Math.round(locId)}` : (locName ? `loc-name:${locName}` : "");
      if(!itemKey || !locKey) return "";
      const sourceId = Number(row?.sourcePlayerId ?? row?.player ?? row?.player_id ?? row?.source_player ?? row?.sender);
      const sourceName = standaloneNormalizeLoose(row?.sourcePlayerName || "");
      const sourceGame = standaloneNormalizeLoose(row?.sourceGame || "");
      const sourceKey = Number.isFinite(sourceId) && sourceId > 0
        ? `src:${Math.round(sourceId)}`
        : `src-name:${sourceName}|game:${sourceGame}`;
      return `${itemKey}|${locKey}|${sourceKey}`;
    }catch(_){
      return "";
    }
  }

  function standaloneMergeReceivedRows(existing, incoming){
    const next = { ...(existing || {}), ...(incoming || {}) };
    if(existing && incoming){
      if(existing.itemId != null && incoming.itemId == null) next.itemId = existing.itemId;
      if(existing.locId != null && incoming.locId == null) next.locId = existing.locId;
      if(existing.recvIndex != null && incoming.recvIndex == null) next.recvIndex = existing.recvIndex;
      if(existing.sourcePlayerId != null && incoming.sourcePlayerId == null) next.sourcePlayerId = existing.sourcePlayerId;
      if(existing.bossPct != null && incoming.bossPct == null) next.bossPct = existing.bossPct;
    }
    return next;
  }

  function standaloneDedupeReceivedRowsList(list){
    const source = Array.isArray(list) ? list : [];
    const out = [];
    const byIndex = new Map();
    const bySemantic = new Map();
    source.forEach((row)=>{
      if(!row || typeof row !== "object") return;
      const indexKey = standaloneReceivedIndexKey(row);
      const semanticKey = standaloneReceivedSemanticKey(row);
      let existingIndex = -1;
      if(indexKey && byIndex.has(indexKey)) existingIndex = byIndex.get(indexKey);
      else if(semanticKey && bySemantic.has(semanticKey)) existingIndex = bySemantic.get(semanticKey);
      if(existingIndex >= 0){
        out[existingIndex] = standaloneMergeReceivedRows(out[existingIndex], row);
      }else{
        existingIndex = out.push(row) - 1;
      }
      if(indexKey) byIndex.set(indexKey, existingIndex);
      if(semanticKey) bySemantic.set(semanticKey, existingIndex);
    });
    return out;
  }

  function standaloneApplyReceivedDedupe(){
    let list = [];
    try{ list = Array.isArray(ap?.receivedAll) ? ap.receivedAll : []; }catch(_){}
    if(!list.length){
      try{ if(typeof loadReceivedList === "function") list = loadReceivedList() || []; }catch(_){}
    }
    const next = standaloneDedupeReceivedRowsList(list);
    try{ if(ap && Array.isArray(next)) ap.receivedAll = next; }catch(_){}
    if(Array.isArray(list) && next.length !== list.length){
      try{ standaloneRebuildReceivedKeySet(); }catch(_){}
      try{ if(typeof saveReceivedList === "function") saveReceivedList(next); }catch(_){}
    }
    return next;
  }

  function standaloneReceivedRows(){
    const list = standaloneApplyReceivedDedupe();
    return (Array.isArray(list) ? list : []).slice(-120).reverse().map((r, index)=>{
      const itemId = r?.itemId ?? r?.item ?? null;
      const itemName = standaloneReceivedRowItemName(r);
      const locName = String(r?.locationName || r?.checkName || "").trim();
      const player = String(r?.sourcePlayerName || "").trim();
      const game = String(r?.sourceGame || "").trim();
      const source = player || game ? `FROM; ${player || "Unknown Player"}${game ? ` (${game})` : ""}` : "";
      const checkName = standaloneLocationDisplayName(locName, r?.locId);
      const check = locName ? `CHECK; ${checkName}` : "CHECK; -";
      const text = [String(r?.time || ""), check, `ITEM; ${itemName}`, source].filter(Boolean).join("\n");
      const semanticKey = standaloneReceivedSemanticKey(r);
      return {
        key: semanticKey ? `received|${semanticKey}` : `received|${r?.recvIndex ?? index}|${itemName}|${locName}`,
        semanticKey,
        time: String(r?.time || ""),
        flags: standaloneFlagsForItem(r?.flags ?? 0, itemName),
        itemName,
        lineA: check,
        lineB: `ITEM; ${itemName}`,
        lineC: source,
        text
      };
    });
  }

  function standaloneSentRows(){
    standaloneLoadSentItems();
    standalonePruneOwnProgressiveSentItems();
    let changed = false;
    const rows = standaloneItemPanel.sent.slice(-120).reverse().map((r, index)=>{
      changed = standaloneHydrateSentEntryFromKey(r) || changed;
      const resolved = standaloneResolveSentMeta(r) || r;
      const itemName = String(resolved?.itemName || standaloneResolveApItemName(r?.itemId, r?.receiverId, r?.itemName || "Unknown Item", r?.receiverGame || ""));
      const locName = String(resolved?.locationName || standaloneResolveApLocationName(r?.locId, r?.senderId, r?.locationName || ""));
      const resolvedFlags = standaloneFlagsForItem(resolved?.flags ?? r?.flags ?? 0, itemName);
      if(itemName && itemName !== r?.itemName && !standaloneLooksUnresolvedItemName(itemName, r?.itemId)){
        r.itemName = itemName;
        changed = true;
      }
      if(locName && locName !== r?.locationName && !/^location\s*#?\s*\d+$/i.test(locName)){
        r.locationName = locName;
        changed = true;
      }
      [
        ["receiverPlayer", resolved?.receiverPlayer],
        ["receiverGame", resolved?.receiverGame],
        ["senderPlayer", resolved?.senderPlayer],
        ["senderGame", resolved?.senderGame]
      ].forEach(([key, value])=>{
        const text = String(value ?? "").trim();
        if(text && String(r?.[key] ?? "").trim() !== text){
          r[key] = text;
          changed = true;
        }
      });
      if(Number(r?.flags ?? 0) !== resolvedFlags){
        r.flags = resolvedFlags;
        changed = true;
      }
      const target = String(resolved?.receiverPlayer || r?.receiverPlayer || "").trim();
      const game = String(resolved?.receiverGame || r?.receiverGame || "").trim();
      const to = `TO; ${target || "Unknown Player"}${game ? ` (${game})` : ""}`;
      const checkName = standaloneLocationDisplayName(locName, r?.locId);
      const check = locName ? `CHECK; ${checkName}` : "";
      const text = [String(r?.time || ""), `ITEM; ${itemName}`, to, check].filter(Boolean).join("\n");
      return {
        key: String(r?.key || `sent|${index}|${itemName}|${target}|${locName}`),
        time: String(r?.time || ""),
        flags: resolvedFlags,
        itemName,
        lineA: `ITEM; ${itemName}`,
        lineB: to,
        lineC: check,
        text
      };
    });
    if(changed) standaloneSaveSentItems();
    return rows;
  }

  function standaloneSetSelectedItem(key, text){
    standaloneItemPanel.selectedKey = String(key || "");
    standaloneItemPanel.selectedText = String(text || "");
    standaloneControlAll("#receivedBody .recvRow").forEach((row)=>{
      row.classList.toggle("is-selected", String(row.dataset.standaloneItemKey || "") === standaloneItemPanel.selectedKey);
    });
  }

  function standaloneAppendItemSpan(parent, text, cls){
    if(text == null || text === "") return;
    const span = document.createElement("span");
    if(cls) span.className = cls;
    span.textContent = String(text);
    parent.appendChild(span);
  }

  function standaloneAppendItemDetailLine(parent, line, itemCls){
    const raw = String(line || "").trim();
    if(!raw) return;
    parent.appendChild(document.createElement("br"));
    let m = raw.match(/^(CHECK;\s*)(.+)$/i);
    if(m){
      standaloneAppendItemSpan(parent, "CHECK: ", "recvLabel");
      standaloneAppendItemSpan(parent, m[2], "recvLocation");
      return;
    }
    m = raw.match(/^(ITEM;\s*)(.+)$/i);
    if(m){
      standaloneAppendItemSpan(parent, "ITEM: ", "recvLabel");
      standaloneAppendItemSpan(parent, m[2], `recvItem apLogItem ${itemCls}`);
      return;
    }
    m = raw.match(/^((?:FROM|TO);\s*)(.+?)(\s+\(.+\))?$/i);
    if(m){
      standaloneAppendItemSpan(parent, `${String(m[1] || "").replace(";", ":").toUpperCase()}`, "recvLabel");
      standaloneAppendItemSpan(parent, m[2], "recvPlayer");
      if(m[3]) standaloneAppendItemSpan(parent, m[3], "recvMeta");
      return;
    }
    m = raw.match(/^([^;]+;\s*)(.+)$/);
    if(m){
      standaloneAppendItemSpan(parent, `${String(m[1] || "").replace(";", ":")}`, "recvLabel");
      standaloneAppendItemSpan(parent, m[2], "recvMeta");
      return;
    }
    standaloneAppendItemSpan(parent, raw, "recvMeta");
  }

  function standaloneAppendItemRow(body, rowData){
    const cls = standaloneItemClass(rowData.flags, rowData.itemName);
    const itemCls = `apItem-${cls.key}`;
    const row = document.createElement("div");
    row.className = `recvRow ${itemCls}`;
    row.tabIndex = 0;
    row.dataset.standaloneItemKey = rowData.key;
    row.dataset.copyText = rowData.text;
    if(rowData.key === standaloneItemPanel.selectedKey) row.classList.add("is-selected");
    if(rowData.isNewProgression) row.classList.add("is-new-progression");
    if(rowData.isNewestProgression) row.classList.add("is-newest-progression");

    const time = document.createElement("div");
    time.className = "recvTime";
    time.textContent = rowData.time || "";
    const txt = document.createElement("div");
    txt.className = "recvText";
    const badge = document.createElement("span");
    badge.className = `recvBadge ${itemCls}`;
    badge.textContent = cls.label || "ITEM";
    txt.appendChild(badge);
    [rowData.lineA, rowData.lineB, rowData.lineC].filter(Boolean).forEach((line)=>{
      standaloneAppendItemDetailLine(txt, line, itemCls);
    });
    row.appendChild(time);
    row.appendChild(txt);
    row.addEventListener("click", ()=>standaloneSetSelectedItem(rowData.key, rowData.text));
    row.addEventListener("focus", ()=>standaloneSetSelectedItem(rowData.key, rowData.text));
    row.addEventListener("contextmenu", (event)=>{
      event.preventDefault();
      standaloneSetSelectedItem(rowData.key, rowData.text);
      standaloneShowItemCopyMenu(event.clientX, event.clientY);
    });
    body.appendChild(row);
  }

  function standaloneRenderItemPanel(opts){
    opts = opts || {};
    standaloneUpdatePanelSoundButtons();
    standaloneLoadSentItems();
    const bodies = standaloneItemPanelBodies();
    if(!bodies.length) return;
    const tab = standaloneItemTabName(standaloneItemPanel.activeTab);
    const receivedCount = standaloneItemCount("received");
    const sentCount = standaloneItemCount("sent");
    standaloneControlAll("#standaloneItemTabs .standaloneItemTab").forEach((btn)=>{
      btn.classList.toggle("active", standaloneItemTabName(btn.dataset.standaloneItemTab) === tab);
    });
    standaloneControlAll("#receivedHdr").forEach((hdr)=>{
      const title = `ITEM LOG (${receivedCount} RECEIVED / ${sentCount} SENT)`;
      const label = hdr.querySelector(".standaloneSectionTitleText");
      if(label){
        label.textContent = title;
      }else{
        hdr.textContent = title;
      }
    });
    const rows = tab === "sent" ? standaloneSentRows() : standaloneMarkNewReceivedRows(standaloneReceivedRows(), opts);
    const emptyText = tab === "sent" ? "No sent items recorded yet." : "No received items yet; click SYNC RECEIVED after connecting.";
    const renderKey = JSON.stringify({
      tab,
      rows: rows.map((row)=>({
        key: row.key,
        time: row.time,
        flags: row.flags,
        itemName: row.itemName,
        lineA: row.lineA,
        lineB: row.lineB,
        lineC: row.lineC
      })),
      emptyText
    });
    bodies.forEach((body)=>{
      if(!body.closest(".flprStandaloneConnectLayout")) return;
      if(!opts.force && body.__flprStandaloneItemRenderKey === renderKey && body.childNodes.length) return;
      let scrollSnap = opts.scrollSnaps && typeof opts.scrollSnaps.get === "function"
        ? (opts.scrollSnaps.get(body) || standaloneCaptureScrollState(body))
        : standaloneCaptureScrollState(body);
      try{
        const remembered = body.__flprStandaloneLastItemScrollSnap;
        if(
          (!opts.scrollSnaps || typeof opts.scrollSnaps.get !== "function") &&
          scrollSnap && scrollSnap.atStart &&
          remembered && !remembered.atStart &&
          Number(remembered.top || 0) > 24
        ){
          scrollSnap = remembered;
        }
      }catch(_){}
      body.innerHTML = "";
      if(!rows.length){
        const d = document.createElement("div");
        d.style.color = "rgba(232,250,255,0.65)";
        d.style.fontSize = "inherit";
        d.textContent = emptyText;
        body.appendChild(d);
        body.__flprStandaloneItemRenderKey = renderKey;
        standaloneRestoreScrollState(body, scrollSnap, { preservePrepended:true });
        return;
      }
      rows.forEach((row)=>standaloneAppendItemRow(body, row));
      body.__flprStandaloneItemRenderKey = renderKey;
      standaloneRestoreScrollState(body, scrollSnap, { preservePrepended:true });
      try{ body.__flprStandaloneLastItemScrollSnap = standaloneCaptureScrollState(body) || scrollSnap; }catch(_){}
    });
  }

  function activateStandaloneItemTab(tab, event){
    if(event){
      event.preventDefault();
      event.stopPropagation();
      try{ event.stopImmediatePropagation(); }catch(_){}
    }
    standaloneItemPanel.activeTab = standaloneItemTabName(tab);
    standaloneItemPanel.selectedKey = "";
    standaloneItemPanel.selectedText = "";
    try{ playClick(); }catch(_){}
    standaloneHideItemCopyMenu();
    standaloneRenderItemPanel();
    return false;
  }
  try{
    window.flprStandaloneRenderItemPanel = standaloneRenderItemPanel;
    window.flprStandaloneSetItemTab = (tab)=>activateStandaloneItemTab(tab);
    Object.defineProperty(window, "__flprStandaloneItemTabName", {
      configurable:true,
      get:()=>standaloneItemTabName(standaloneItemPanel.activeTab)
    });
  }catch(_){}

  function standaloneCopyTextFallback(text){
    try{
      const ta = document.createElement("textarea");
      ta.value = String(text || "");
      ta.setAttribute("readonly", "readonly");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      ta.style.top = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    }catch(_){
      return false;
    }
  }

  function standaloneCopyText(text){
    const value = String(text || standaloneItemPanel.selectedText || "");
    if(!value) return false;
    try{
      if(navigator?.clipboard?.writeText){
        navigator.clipboard.writeText(value).catch(()=>standaloneCopyTextFallback(value));
      }else{
        standaloneCopyTextFallback(value);
      }
      try{ if(typeof toast === "function") toast("good", "COPIED", "Item text copied.", 1200); }catch(_){}
      return true;
    }catch(_){
      return standaloneCopyTextFallback(value);
    }
  }

  function standaloneHideItemCopyMenu(){
    try{ document.getElementById("standaloneItemCopyMenu")?.remove(); }catch(_){}
  }

  function standaloneShowItemCopyMenu(x, y){
    standaloneHideItemCopyMenu();
    const menu = document.createElement("div");
    menu.id = "standaloneItemCopyMenu";
    menu.className = "standaloneItemCopyMenu";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = "COPY TEXT";
    btn.addEventListener("click", (event)=>{
      event.preventDefault();
      event.stopPropagation();
      standaloneCopyText(standaloneItemPanel.selectedText);
      standaloneHideItemCopyMenu();
    });
    menu.appendChild(btn);
    const host = document.querySelector(".stage") || document.body;
    host.appendChild(menu);
    const rect = menu.getBoundingClientRect();
    const left = Math.max(4, Math.min(Number(x || 0), (window.innerWidth || 0) - rect.width - 4));
    const top = Math.max(4, Math.min(Number(y || 0), (window.innerHeight || 0) - rect.height - 4));
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
  }

  function standaloneColorizeSentItemModal(meta, cls, holdMs){
    const item = String(meta?.itemName || "Unknown Item");
    const targetGame = standaloneGameForPlayer(meta?.receiverId, meta?.receiverPlayer, meta?.receiverGame);
    const targetPlayer = String(meta?.receiverPlayer || "Unknown Player");
    const locName = String(meta?.locationName || "").trim();
    const key = String(cls?.key || "filler").trim() || "filler";
    const apply = ()=>{
      try{
        const card = document.getElementById("ovModalCard");
        const title = document.getElementById("ovModalTitle");
        const big = document.getElementById("ovModalBig");
        const sub = document.getElementById("ovModalSub");
        const modalMeta = document.getElementById("ovModalMeta");
        if(!card || !big || String(big.textContent || "").trim() !== item) return;
        if(title && !/\bSENT\b/i.test(String(title.textContent || ""))) return;
        card.classList.remove("apItem-progression", "apItem-useful", "apItem-filler", "apItem-trap");
        card.classList.add("flprStandaloneSentItemModal", `apItem-${key}`);
        big.className = `ovModalBig apLogItem apItem-${key}`;
        if(sub){
          sub.innerHTML = `TO; <span class="apLogPlayer">${standaloneEscapeHtml(targetPlayer)}</span>${targetGame ? ` <span class="apLogSource">(${standaloneEscapeHtml(targetGame)})</span>` : ""}`;
        }
        if(modalMeta){
          modalMeta.innerHTML = locName ? `CHECK; <span class="apLogLocation">${standaloneEscapeHtml(standaloneLocationDisplayName(locName, meta?.locId))}</span>` : "";
        }
      }catch(_){}
    };
    [0, 120, 620, 780].forEach((delay)=>setTimeout(apply, delay));
    setTimeout(()=>{
      try{
        const card = document.getElementById("ovModalCard");
        const big = document.getElementById("ovModalBig");
        if(card) card.classList.remove("flprStandaloneSentItemModal", "apItem-progression", "apItem-useful", "apItem-filler", "apItem-trap");
        if(big) big.className = "ovModalBig";
      }catch(_){}
    }, Math.max(1200, Number(holdMs || 4200) + 900));
  }

  function standaloneColorizeReceivedItemModal(meta, cls, holdMs){
    const item = String(meta?.itemName || "Unknown Item");
    const sourcePlayer = String(meta?.sourcePlayer || "Unknown Player");
    const sourceGame = String(meta?.sourceGame || "");
    const locName = String(meta?.locationName || "").trim();
    const key = String(cls?.key || "filler").trim() || "filler";
    const apply = ()=>{
      try{
        const card = document.getElementById("ovModalCard");
        const title = document.getElementById("ovModalTitle");
        const tag = document.getElementById("ovModalTag");
        const big = document.getElementById("ovModalBig");
        const sub = document.getElementById("ovModalSub");
        const modalMeta = document.getElementById("ovModalMeta");
        if(!card || !big || String(big.textContent || "").trim() !== item) return;
        if(title && !/\bRECEIVED\b/i.test(String(title.textContent || ""))) return;
        card.classList.remove("apItem-progression", "apItem-useful", "apItem-filler", "apItem-trap");
        card.classList.add("flprStandaloneSentItemModal", `apItem-${key}`);
        if(tag) tag.className = `ovModalTag apLogBadge apItem-${key}`;
        big.className = `ovModalBig apLogItem apItem-${key}`;
        if(sub){
          sub.innerHTML = `FROM; <span class="apLogPlayer">${standaloneEscapeHtml(sourcePlayer)}</span>${sourceGame ? ` <span class="apLogSource">(${standaloneEscapeHtml(sourceGame)})</span>` : ""}`;
        }
        if(modalMeta){
          modalMeta.innerHTML = locName ? `CHECK; <span class="apLogLocation">${standaloneEscapeHtml(standaloneLocationDisplayName(locName, meta?.locId))}</span>` : "";
        }
      }catch(_){}
    };
    [0, 120, 620, 780].forEach((delay)=>setTimeout(apply, delay));
    setTimeout(()=>{
      try{
        const card = document.getElementById("ovModalCard");
        const tag = document.getElementById("ovModalTag");
        const big = document.getElementById("ovModalBig");
        if(card) card.classList.remove("flprStandaloneSentItemModal", "apItem-progression", "apItem-useful", "apItem-filler", "apItem-trap");
        if(tag) tag.className = "ovModalTag";
        if(big) big.className = "ovModalBig";
      }catch(_){}
    }, Math.max(1200, Number(holdMs || 3400) + 900));
  }

  function standaloneShowReceivedCounterRewardModal(it, itemIndex, locId, itemName, opts){
    try{
      const item = String(itemName || standaloneReceivedItemName(it) || "Unknown Item").trim();
      if(!item) return false;
      const key = standaloneCounterRewardModalKey(it, itemIndex, locId, item);
      if(standaloneItemPanel.counterRewardModalSeen.has(key)) return false;
      standaloneItemPanel.counterRewardModalSeen.add(key);
      if(standaloneItemPanel.counterRewardModalSeen.size > 500) standaloneItemPanel.counterRewardModalSeen.clear();
      const flags = standaloneFlagsForItem(it?.flags ?? 0, item);
      const cls = standaloneItemClass(flags, item) || { key:"filler", label:"FILLER", title:"FILLER ITEM" };
      let source = null;
      try{ if(typeof apReceivedSourceMeta === "function") source = apReceivedSourceMeta(it || {}); }catch(_){}
      const sourcePlayerId = Number(source?.sourcePlayerId ?? it?.player ?? it?.player_id ?? it?.source_player ?? it?.sender ?? ap?.slot ?? 0) || 0;
      const sourcePlayer = String(source?.player || (()=>{ try{ return apPlayerName(sourcePlayerId, ap?.cfg?.player || "Player"); }catch(_){ return ""; } })() || "Unknown Player").trim();
      const sourceGame = String(source?.game || standaloneGameForPlayer(sourcePlayerId, sourcePlayer, ap?.cfg?.game || "") || "").trim();
      const rawLoc = Number(locId) > 0 ? standaloneResolveApLocationName(locId, sourcePlayerId, "") : "";
      const locName = standaloneLocationDisplayName(rawLoc, locId) || rawLoc;
      const holdMs = Math.max(2800, Number(opts?.holdMs || 3400) || 3400);
      const isJunkCounter = standaloneItemNameIsEasyJunk(item) || standaloneItemNameIsMediumJunk(item) || standaloneItemNameIsGenericJunk(item);
      const isFragmentCounter = standaloneItemNameIsFragment(item);
      const checksKeyBeforeModal = standaloneChecksViewActive()
        ? (standaloneCurrentChecksSelectionCandidate() || standalonePinnedChecksTableKey())
        : "";
      if(checksKeyBeforeModal){
        try{ standaloneRememberChecksSelection(checksKeyBeforeModal, "counter-reward-modal"); }catch(_){}
      }
      try{ standaloneEnsureOverviewModalVisibleHost(); }catch(_){}
      try{ if(typeof pauseAutoSwap === "function") pauseAutoSwap(holdMs + 1800); }catch(_){}
      const modalArgs = {
        tag: isJunkCounter ? "JUNK" : (isFragmentCounter ? "FRAG" : (cls.label || "FILLER")),
        title: isJunkCounter ? "JUNK ITEM RECEIVED" : (isFragmentCounter ? "PINBALL FRAGMENT RECEIVED" : `${cls.title || "FILLER ITEM"} RECEIVED`),
        big: item,
        sub: `FROM; ${sourcePlayer}${sourceGame ? ` (${sourceGame})` : ""}`,
        meta: locName ? `CHECK; ${locName}` : "",
        isTrap: false,
        holdMs
      };
      if(typeof showOverviewModalNow === "function"){
        showOverviewModalNow(modalArgs);
      }else if(typeof showOverviewModal === "function"){
        showOverviewModal(modalArgs);
      }else if(typeof toast === "function"){
        toast("good", modalArgs.title, item, holdMs);
      }
      standaloneColorizeReceivedItemModal({
        itemName:item,
        sourcePlayer,
        sourceGame,
        locationName:locName,
        locId
      }, cls, holdMs);
      if(checksKeyBeforeModal){
        standaloneScheduleChecksRestoreAfterReward({ holdMs });
        standaloneScheduleChecksSelectionHold("counter-reward-modal", holdMs + 1400);
      }
      return true;
    }catch(_){}
    return false;
  }

  function standaloneEnsureOverviewModalVisibleHost(){
    try{
      const modal = document.getElementById("ovModal");
      const viewport = document.querySelector(".viewport");
      if(!modal || !viewport) return false;
      if(modal.parentElement !== viewport) viewport.appendChild(modal);
      return modal.parentElement === viewport;
    }catch(_){}
    return false;
  }

  function standaloneSentMetaKey(meta){
    return `${Number(meta?.senderId || 0)}|${Number(meta?.receiverId || 0)}|${meta?.itemId ?? ""}|${meta?.locId ?? ""}|${meta?.flags ?? 0}`;
  }

  function standaloneSentEntryKeyFlags(entry){
    if(!entry || typeof entry !== "object" || typeof entry.key !== "string") return NaN;
    const parts = String(entry.key || "").split("|");
    if(parts[0] !== "sent") return NaN;
    const flags = Number(parts[5]);
    return Number.isFinite(flags) ? flags : NaN;
  }

  function standaloneResolveSentMeta(meta){
    if(!meta || typeof meta !== "object") return null;
    const next = { ...meta };
    const keyFlags = standaloneSentEntryKeyFlags(next);
    if(Number.isFinite(keyFlags)) next.flags = keyFlags;
    const cached = standaloneCachedServerSentMeta(next);
    if(cached){
      if(cached.serverItemName) next.serverItemName = cached.serverItemName;
      if(cached.receiverGame && !next.receiverGame) next.receiverGame = cached.receiverGame;
      if(cached.receiverId && !Number(next.receiverId || 0)) next.receiverId = cached.receiverId;
      if(cached.flags != null) next.flags = cached.flags;
    }
    next.receiverGame = standaloneGameForPlayer(next.receiverId, next.receiverPlayer, next.receiverGame);
    next.senderGame = standaloneGameForPlayer(next.senderId, next.senderPlayer, next.senderGame);
    const self = standaloneSelfSlotId();
    const receiverId = Number(next.receiverId || 0) || 0;
    const sentToOther = !!self && !!receiverId && receiverId !== self;
    const serverItemName = String(next.serverItemName || "").trim();
    const existingItemName = String(next.itemName || "").trim();
    const fallbackItemName = serverItemName
      || (sentToOther && standaloneProgressiveBallTarget(existingItemName) ? "" : existingItemName)
      || "Unknown Item";
    next.itemName = standaloneResolveApItemName(next.itemId, next.receiverId, fallbackItemName, next.receiverGame || "", { preferServerForCrossGame:true });
    next.locationName = standaloneResolveApLocationName(next.locId, next.senderId, next.locationName || "");
    const coerced = standaloneCoerceOwnProgressiveSentMeta(next);
    coerced.locationName = standaloneResolveApLocationName(coerced.locId, coerced.senderId, coerced.locationName || "");
    coerced.flags = standaloneFlagsForItem(coerced.flags, coerced.itemName);
    return coerced;
  }

  function standaloneHydrateSentEntryFromKey(entry){
    if(!entry || typeof entry !== "object") return false;
    if(typeof entry.key !== "string") return false;
    const parts = String(entry.key || "").split("|");
    if(parts[0] !== "sent") return false;
    let changed = false;
    if(entry.senderId == null && Number.isFinite(Number(parts[1]))){ entry.senderId = Number(parts[1]); changed = true; }
    if(entry.receiverId == null && Number.isFinite(Number(parts[2]))){ entry.receiverId = Number(parts[2]); changed = true; }
    if(entry.itemId == null && Number.isFinite(Number(parts[3]))){ entry.itemId = Number(parts[3]); changed = true; }
    if(entry.locId == null && Number.isFinite(Number(parts[4]))){ entry.locId = Number(parts[4]); changed = true; }
    const keyFlags = Number(parts[5]);
    if(Number.isFinite(keyFlags)){
      const cached = standaloneCachedServerSentMeta({ ...entry, flags:keyFlags }) || standaloneCachedServerSentMeta(entry);
      const wantedFlags = Number(cached?.flags ?? keyFlags);
      if(Number.isFinite(wantedFlags) && Number(entry.flags ?? 0) !== wantedFlags){
        entry.flags = wantedFlags;
        changed = true;
      }
    }
    return changed;
  }

  function standaloneResolvedMetaIsOwnProgressive(meta){
    const self = standaloneSelfSlotId();
    if(!self || !meta) return false;
    if(Number(meta.receiverId || 0) !== self) return false;
    return !!standaloneProgressiveBallTarget(meta.itemName || "");
  }

  function standalonePruneOwnProgressiveSentItems(){
    standaloneLoadSentItems();
    let changed = false;
    const nextRows = [];
    (standaloneItemPanel.sent || []).forEach((entry)=>{
      changed = standaloneHydrateSentEntryFromKey(entry) || changed;
      const resolved = standaloneResolveSentMeta(entry);
      if(standaloneResolvedMetaIsOwnProgressive(resolved)){
        changed = true;
        return;
      }
      nextRows.push(entry);
    });
    if(changed || nextRows.length !== standaloneItemPanel.sent.length){
      standaloneItemPanel.sent = nextRows.slice(-standaloneItemPanel.maxSent);
      standaloneSaveSentItems();
    }
  }

  function standaloneBuildPairedMetaForSentCheck(meta){
    const locName = standaloneLocationDisplayName(meta?.locationName || "", meta?.locId);
    const split = standaloneSplitLocationName(locName || meta?.locationName || "");
    const rawTableName = String(split.table || "").trim();
    const tableName = standaloneIsActiveSeedTableName(rawTableName) ? rawTableName : "";
    return {
      id: Number(meta?.locId || 0) || null,
      locId: Number(meta?.locId || 0) || null,
      full: String(meta?.locationName || locName || ""),
      short: String(split.rest || locName || meta?.locationName || ""),
      locationName: locName || String(meta?.locationName || ""),
      checkName: locName || String(meta?.locationName || ""),
      tableName,
      table: tableName
    };
  }

  function standaloneEnsureOwnProgressiveReceivedRow(meta, itemIndex){
    try{
      if(!meta || !standaloneResolvedMetaIsOwnProgressive(meta)){
        try{ window.__flprStandaloneLastOwnProgressiveRow = { ok:false, reason:"not-own-progressive", meta:{ ...(meta || {}) }, itemIndex, ts:Date.now() }; }catch(_){}
        return false;
      }
      const itemId = Number(meta.itemId);
      if(!Number.isFinite(itemId)){
        try{ window.__flprStandaloneLastOwnProgressiveRow = { ok:false, reason:"bad-item-id", meta:{ ...(meta || {}) }, itemIndex, ts:Date.now() }; }catch(_){}
        return false;
      }
      const locId = Number(meta.locId);
      const sourceId = Number(meta.senderId || standaloneSelfSlotId() || 0) || 0;
      const locName = standaloneLocationDisplayName(meta.locationName || "", locId);
      const itemName = String(meta.itemName || standaloneResolveApItemName(itemId, standaloneSelfSlotId(), "", standaloneSelfGameName()) || "").trim();
      if(!itemName){
        try{ window.__flprStandaloneLastOwnProgressiveRow = { ok:false, reason:"missing-item-name", meta:{ ...(meta || {}) }, itemIndex, ts:Date.now() }; }catch(_){}
        return false;
      }
      ap.receivedAll = Array.isArray(ap?.receivedAll) ? ap.receivedAll : [];
      const idx = Number(itemIndex);
      const exists = ap.receivedAll.some((row)=>{
        const rowIdx = Number(row?.recvIndex);
        if(Number.isFinite(idx) && idx >= 0 && Number.isFinite(rowIdx) && rowIdx === idx) return true;
        const rowLoc = Number(row?.locId ?? row?.location ?? 0);
        const rowItem = Number(row?.itemId ?? row?.item ?? 0);
        const rowSource = Number(row?.sourcePlayerId ?? row?.player ?? 0) || 0;
        return Number.isFinite(locId) && locId > 0 && rowLoc === locId && rowItem === itemId && (!sourceId || !rowSource || rowSource === sourceId);
      });
      if(exists){
        try{ window.__flprStandaloneLastOwnProgressiveRow = { ok:true, existed:true, itemName, itemId, locId, itemIndex, count:ap.receivedAll.length, ts:Date.now() }; }catch(_){}
        return false;
      }
      const row = {
        time: (typeof fmtTime === "function") ? fmtTime() : standaloneTextTimestamp().replace(/^\[|\]$/g, ""),
        ts: Date.now(),
        itemName,
        baseItemName: itemName,
        itemId,
        locationName: locName || (Number.isFinite(locId) && locId > 0 ? `Location #${locId}` : ""),
        checkName: locName || (Number.isFinite(locId) && locId > 0 ? `Location #${locId}` : ""),
        sourcePlayerId: sourceId || standaloneSelfSlotId() || null,
        sourcePlayerName: String(meta.senderPlayer || standaloneSelfPlayerName() || ""),
        sourceGame: String(meta.senderGame || standaloneSelfGameName() || ""),
        recvIndex: Number.isFinite(idx) && idx >= 0 ? idx : null,
        locId: Number.isFinite(locId) ? locId : null,
        flags: standaloneFlagsForItem(meta.flags || 0, itemName),
        bossPct: null
      };
      ap.receivedAll.push(row);
      if(ap.receivedAll.length > 500) ap.receivedAll.splice(0, ap.receivedAll.length - 500);
      try{
        ap.receivedKeySet = ap.receivedKeySet || new Set();
        if(row.recvIndex != null) ap.receivedKeySet.add(`idx:${row.recvIndex}`);
        else ap.receivedKeySet.add(`${row.itemName || ""}|${row.locationName || ""}`);
      }catch(_){}
      try{ if(typeof saveReceivedList === "function") saveReceivedList(ap.receivedAll); }catch(_){}
      try{ if(typeof renderReceivedList === "function") renderReceivedList(); }catch(_){}
      try{ window.__flprStandaloneLastOwnProgressiveRow = { ok:true, added:true, itemName, itemId, locId, itemIndex:row.recvIndex, count:ap.receivedAll.length, ts:Date.now() }; }catch(_){}
      return true;
    }catch(_){}
    try{ window.__flprStandaloneLastOwnProgressiveRow = { ok:false, reason:"exception", itemIndex, ts:Date.now() }; }catch(_){}
    return false;
  }

  function standaloneWithUnlockFxSuppressed(fn, holdMs){
    const prev = !!window.__flprStandaloneSuppressUnlockFx;
    window.__flprStandaloneSuppressUnlockFx = true;
    try{
      return fn();
    }finally{
      setTimeout(()=>{
        try{ window.__flprStandaloneSuppressUnlockFx = prev; }catch(_){}
      }, Math.max(120, Number(holdMs) || 900));
    }
  }

  function standaloneForceProgressiveUnlockFromInventory(itemName, opts){
    opts = opts || {};
    const target = standaloneProgressiveBallTarget(itemName);
    if(!target || !standaloneIsActiveSeedTableName(target)) return false;
    const run = (fn)=> opts.animate === false
      ? standaloneWithUnlockFxSuppressed(()=>standaloneWithCounterDrawerFxSuppressed(fn), 900)
      : standaloneWithCounterDrawerFxSuppressed(fn);
    try{
      if(typeof apReconcileWorldStateFromReceived === "function"){
        run(()=>apReconcileWorldStateFromReceived());
        return true;
      }
    }catch(_){}
    try{
      if(typeof forceUnlockTablesFromProgressiveInventory === "function"){
        run(()=>forceUnlockTablesFromProgressiveInventory({ render:true, animate:opts.animate !== false, quiet:opts.quiet !== false }));
        return true;
      }
    }catch(_){}
    return false;
  }

  function installStandaloneTableLookupBridge(){
    let installedAny = false;
    let originalGet = null;
    try{ originalGet = (typeof getTableKeyForName === "function") ? getTableKeyForName : null; }catch(_){}
    if(originalGet && !originalGet.__flprStandaloneTableLookupBridge){
      const bridgedGet = function standaloneGetTableKeyForNameBridge(tableName){
        try{
          const direct = originalGet.apply(this, arguments);
          if(direct) return direct;
        }catch(_){}
        return standaloneFindActiveTableKey(tableName, (name)=>originalGet.call(this, name)) || null;
      };
      bridgedGet.__flprStandaloneTableLookupBridge = true;
      bridgedGet.__flprStandaloneOriginalGetTableKeyForName = originalGet;
      try{ window.getTableKeyForName = bridgedGet; }catch(_){}
      try{ getTableKeyForName = bridgedGet; }catch(_){}
      originalGet = bridgedGet.__flprStandaloneOriginalGetTableKeyForName;
      installedAny = true;
    }else if(originalGet){
      installedAny = true;
    }

    try{
      const originalFind = (typeof findTableKeyByCanonicalCode === "function") ? findTableKeyByCanonicalCode : null;
      if(originalFind && !originalFind.__flprStandaloneTableLookupBridge){
        const bridgedFind = function standaloneFindTableKeyByCanonicalCodeBridge(tableCode){
          try{
            const direct = originalFind.apply(this, arguments);
            if(direct) return direct;
          }catch(_){}
          const want = String(tableCode || "").trim();
          if(!want) return null;
          try{
            for(const [worldId, world] of Object.entries(state?.worlds || {})){
              const tables = Array.isArray(world?.tables) ? world.tables : [];
              for(let index = 0; index < tables.length; index++){
                if(standaloneTableCode(tables[index]) === want) return `${worldId}|${index}`;
              }
            }
          }catch(_){}
          return null;
        };
        bridgedFind.__flprStandaloneTableLookupBridge = true;
        bridgedFind.__flprStandaloneOriginalFindTableKeyByCanonicalCode = originalFind;
        try{ window.findTableKeyByCanonicalCode = bridgedFind; }catch(_){}
        try{ findTableKeyByCanonicalCode = bridgedFind; }catch(_){}
        installedAny = true;
      }else if(originalFind){
        installedAny = true;
      }
    }catch(_){}

    try{
      const originalActive = (typeof isActiveSeedTableName === "function") ? isActiveSeedTableName : null;
      if(originalActive && !originalActive.__flprStandaloneTableLookupBridge){
        const direct = originalGet && originalGet.__flprStandaloneOriginalGetTableKeyForName
          ? originalGet.__flprStandaloneOriginalGetTableKeyForName
          : originalGet;
        const bridgedActive = function standaloneIsActiveSeedTableNameBridge(tableName){
          try{ if(originalActive.apply(this, arguments)) return true; }catch(_){}
          const raw = String(tableName || "").trim();
          if(!raw) return false;
          if(/boss table/i.test(raw)) return true;
          return !!standaloneFindActiveTableKey(raw, direct ? ((name)=>direct.call(this, name)) : null);
        };
        bridgedActive.__flprStandaloneTableLookupBridge = true;
        bridgedActive.__flprStandaloneOriginalIsActiveSeedTableName = originalActive;
        try{ window.isActiveSeedTableName = bridgedActive; }catch(_){}
        try{ isActiveSeedTableName = bridgedActive; }catch(_){}
        installedAny = true;
      }else if(originalActive){
        installedAny = true;
      }
    }catch(_){}

    if(!installedAny) setTimeout(installStandaloneTableLookupBridge, 120);
  }

  function installStandaloneUnlockFxBridge(){
    let original = null;
    try{ original = (typeof triggerTableFirstUnlockFx === "function") ? triggerTableFirstUnlockFx : null; }catch(_){}
    if(!original){
      setTimeout(installStandaloneUnlockFxBridge, 120);
      return;
    }
    if(original.__flprStandaloneUnlockFxBridge) return;
    const lastByTable = new Map();
    const bridged = function standaloneTriggerTableFirstUnlockFxBridge(tableKey){
      const key = String(tableKey || "").trim();
      if(!key) return;
      if(window.__flprStandaloneSuppressUnlockFx){
        try{ if(typeof markUnlockFxPlayed === "function") markUnlockFxPlayed(key); }catch(_){}
        return;
      }
      const now = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
      const last = Number(lastByTable.get(key) || 0);
      try{
        if(typeof hasUnlockFxPlayed === "function" && hasUnlockFxPlayed(key)) return;
      }catch(_){}
      if(last && now - last < 1400) return;
      lastByTable.set(key, now);
      if(lastByTable.size > 200){
        Array.from(lastByTable.keys()).slice(0, 80).forEach((k)=>lastByTable.delete(k));
      }
      return original.apply(this, arguments);
    };
    bridged.__flprStandaloneUnlockFxBridge = true;
    bridged.__flprStandaloneOriginalTriggerTableFirstUnlockFx = original;
    try{ window.triggerTableFirstUnlockFx = bridged; }catch(_){}
    try{ triggerTableFirstUnlockFx = bridged; }catch(_){}
  }

  function installStandaloneSfxDedupeBridge(){
    let original = null;
    try{ original = (typeof playSfx === "function") ? playSfx : null; }catch(_){}
    if(!original){
      setTimeout(installStandaloneSfxDedupeBridge, 120);
      return;
    }
    if(original.__flprStandaloneSfxDedupeBridge) return;
    const watched = new Set(["receive", "ball", "zoomIn", "ballDrop", "ballSlot", "zoomOut", "popup", "unlock"]);
    const lastByKind = new Map();
    const bridged = function standalonePlaySfxDedupeBridge(kind){
      const key = String(kind || "");
      if(watched.has(key)){
        const now = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
        const last = Number(lastByKind.get(key) || 0);
        if(last && now - last < 120){
          window.__flprStandaloneSfxDedupeSuppressed = Number(window.__flprStandaloneSfxDedupeSuppressed || 0) + 1;
          return;
        }
        lastByKind.set(key, now);
        if(lastByKind.size > 40){
          Array.from(lastByKind.keys()).slice(0, 10).forEach((k)=>lastByKind.delete(k));
        }
      }
      return original.apply(this, arguments);
    };
    bridged.__flprStandaloneSfxDedupeBridge = true;
    bridged.__flprStandaloneOriginalPlaySfx = original;
    try{ window.playSfx = bridged; }catch(_){}
    try{ playSfx = bridged; }catch(_){}
  }

  function standaloneBesiegedTarget(){
    try{
      const live = (typeof besiegedGetState === "function")
        ? besiegedGetState()
        : (state && state.besiegedEvent ? state.besiegedEvent : null);
      if(!live || !live.active) return null;
      const worldKey = String(live.worldKey || "").trim();
      const tableKey = String(live.tableKey || "").trim();
      const parts = tableKey.split("|");
      const idx = Math.max(0, Number(parts[1] || 0) || 0);
      if(!worldKey || !tableKey || !state?.worlds?.[worldKey]) return null;
      return {
        worldKey,
        tableKey,
        idx,
        tableName: String(live.tableName || state?.worlds?.[worldKey]?.tables?.[idx] || "Besieged table")
      };
    }catch(_){}
    return null;
  }

  function standaloneEnforceBesiegedTarget(reason, opts){
    opts = opts || {};
    const target = standaloneBesiegedTarget();
    if(!target) return false;
    let changed = false;
    try{
      state.nowPlaying = state.nowPlaying || {};
      if(state.nowPlaying[target.worldKey] !== target.idx){
        state.nowPlaying[target.worldKey] = target.idx;
        changed = true;
      }
      if(String(state.selected || "") !== target.worldKey){
        state.lastSelected = state.selected;
        state.selected = target.worldKey;
        changed = true;
      }
      if(String(ap?.currentWorld || "") !== target.worldKey){
        ap.currentWorld = target.worldKey;
        changed = true;
      }
      if(state && typeof getWorldPageForWorldKey === "function"){
        const nextPage = getWorldPageForWorldKey(target.worldKey, state, ap?.slotData);
        if(Number.isFinite(nextPage) && state.worldPage !== nextPage){
          state.worldPage = nextPage;
          changed = true;
        }
      }
      if(changed && opts.save !== false){
        try{ saveState(); }catch(_){}
      }
      if(opts.log && reason){
        try{ apLog(`Besieged table kept selected; ${reason}.`); }catch(_){}
      }
    }catch(_){}
    return changed;
  }

  function standaloneRenderAfterBesiegedSelection(){
    try{ setHeader(); }catch(_){}
    try{ renderWorldButtons(); }catch(_){}
    try{ renderSelected(); }catch(_){}
    try{ renderOverviewGrid(); }catch(_){}
    try{ renderOverviewFeed(); }catch(_){}
    try{ renderChecksWorldTabs(); }catch(_){}
    try{ if(typeof activeView !== "undefined" && activeView === "checks") renderChecks(); }catch(_){}
    try{ requestAnimationFrame(updateClimber); }catch(_){}
  }

  function standaloneBesiegedKeyFromArgs(worldKey, idx){
    const wk = String(worldKey || "").trim();
    const n = Number(idx);
    if(!wk || !Number.isFinite(n) || n < 0) return "";
    return `${wk}|${Math.max(0, Math.round(n))}`;
  }

  function standaloneResolveBesiegedActivationTarget(argsLike){
    try{
      const args = Array.prototype.slice.call(argsLike || []);
      const opts = args[0] && typeof args[0] === "object" ? args[0] : {};
      const raw = opts.target && typeof opts.target === "object" ? opts.target : null;
      if(!raw) return null;
      const tableKey = String(raw.tableKey || "").trim();
      const keyParts = tableKey.split("|");
      const worldKey = String(raw.worldKey || keyParts[0] || "").trim();
      const idx = Math.max(0, Math.round(Number(keyParts[1] ?? raw.idx ?? 0) || 0));
      if(!worldKey || !tableKey || !Number.isFinite(idx)) return null;
      return {
        worldKey,
        tableKey,
        idx,
        tableName: String(raw.tableName || state?.worlds?.[worldKey]?.tables?.[idx] || "Besieged table")
      };
    }catch(_){}
    return null;
  }

  function standaloneCaptureSiegeIntroStart(argsLike){
    const target = standaloneResolveBesiegedActivationTarget(argsLike);
    if(!target || !state?.worlds?.[target.worldKey]) return null;
    const previous = {
      selected: String(state?.selected || ""),
      currentWorld: String(ap?.currentWorld || ""),
      nowPlaying: state?.nowPlaying ? { ...state.nowPlaying } : null
    };
    try{
      state.nowPlaying = state.nowPlaying || {};
      state.selected = target.worldKey;
      state.nowPlaying[target.worldKey] = target.idx;
      try{ if(ap) ap.currentWorld = target.worldKey; }catch(_){}
      try{ if(typeof renderSelected === "function") renderSelected(); }catch(_){}
      const card = standaloneFindCurrentSiegeTargetCard({
        active:true,
        tableKey:target.tableKey,
        worldKey:target.worldKey,
        tableName:target.tableName
      });
      const rect = card ? card.getBoundingClientRect() : null;
      if(!rect || rect.width <= 0 || rect.height <= 0) return { target, previous, rect:null };
      return {
        target,
        previous,
        rect:{
          left:rect.left,
          top:rect.top,
          width:rect.width,
          height:rect.height,
          centerX:rect.left + rect.width / 2,
          centerY:rect.top + rect.height / 2
        }
      };
    }catch(_){
      return { target, previous, rect:null };
    }
  }

  function standaloneRestoreSiegeIntroStartCapture(capture){
    try{
      const prev = capture?.previous;
      if(!prev) return false;
      if(prev.nowPlaying && typeof prev.nowPlaying === "object") state.nowPlaying = { ...prev.nowPlaying };
      state.selected = String(prev.selected || state?.selected || "");
      try{ if(ap) ap.currentWorld = String(prev.currentWorld || ap.currentWorld || ""); }catch(_){}
      try{ if(typeof renderSelected === "function") renderSelected(); }catch(_){}
      return true;
    }catch(_){}
    return false;
  }

  const standaloneSiegeNotificationQueue = {
    pending: null,
    timer: null,
    pendingShowUntil: 0,
    expectedHideUntil: 0,
    sequenceHoldUntil: 0,
    introTimer: null,
    introPhaseTimers: [],
    introSig: "",
    introAnimating: false,
    flushing: false,
    lastIntroMorph: null
  };

  function standaloneSiegeSequenceHoldActive(){
    return Date.now() < Number(standaloneSiegeNotificationQueue.sequenceHoldUntil || 0);
  }

  function standaloneMarkSiegeSequenceHold(holdMs, reason){
    const now = Date.now();
    const hold = Math.max(0, Number(holdMs || 0) || 0);
    const until = now + hold;
    standaloneSiegeNotificationQueue.sequenceHoldUntil = Math.max(
      Number(standaloneSiegeNotificationQueue.sequenceHoldUntil || 0),
      until
    );
    standaloneSiegeNotificationQueue.expectedHideUntil = Math.max(
      Number(standaloneSiegeNotificationQueue.expectedHideUntil || 0),
      until
    );
    try{
      window.__flprStandaloneSiegeSequenceHold = {
        until: Number(standaloneSiegeNotificationQueue.sequenceHoldUntil || until),
        reason: String(reason || ""),
        ts: now
      };
    }catch(_){}
    if(standaloneSiegeNotificationQueue.pending) standaloneScheduleQueuedBesiegedActivation();
    return Number(standaloneSiegeNotificationQueue.sequenceHoldUntil || until);
  }

  function standaloneQueuedSiegeWaiting(){
    return !!standaloneSiegeNotificationQueue.pending;
  }

  function standaloneOverviewModalVisible(){
    try{
      const modal = document.getElementById("ovModal");
      if(!modal || modal.classList.contains("hidden")) return false;
      const style = getComputedStyle(modal);
      return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
    }catch(_){}
    return false;
  }

  function standaloneClearSiegeIncomingNotice(){
    try{
      document.querySelectorAll(".flprStandaloneSiegeIncoming").forEach((node)=>node.remove());
      document.querySelectorAll(".flprStandaloneSiegeQueued").forEach((node)=>node.classList.remove("flprStandaloneSiegeQueued"));
    }catch(_){}
  }

  function standaloneShowSiegeIncomingNotice(){
    try{
      const modal = document.getElementById("ovModal");
      const card = document.getElementById("ovModalCard");
      if(!modal || !card || modal.classList.contains("hidden")) return false;
      card.classList.add("flprStandaloneSiegeQueued");
      let notice = card.querySelector(".flprStandaloneSiegeIncoming");
      if(!notice){
        notice = document.createElement("div");
        notice.className = "flprStandaloneSiegeIncoming";
        card.appendChild(notice);
      }
      notice.textContent = "SIEGE INCOMING!";
      return true;
    }catch(_){}
    return false;
  }

  function standaloneMarkOverviewNotificationWindow(holdMs, showDelayMs){
    const now = Date.now();
    const hold = Math.max(600, Number(holdMs || 2800) || 2800);
    const delay = Math.max(0, Number(showDelayMs || 0) || 0);
    standaloneSiegeNotificationQueue.pendingShowUntil = Math.max(
      Number(standaloneSiegeNotificationQueue.pendingShowUntil || 0),
      now + delay + 520
    );
    standaloneSiegeNotificationQueue.expectedHideUntil = Math.max(
      Number(standaloneSiegeNotificationQueue.expectedHideUntil || 0),
      now + delay + hold + 1200
    );
    if(standaloneSiegeNotificationQueue.pending){
      setTimeout(()=>standaloneShowSiegeIncomingNotice(), delay + 40);
      standaloneScheduleQueuedBesiegedActivation();
    }
  }

  function standaloneShouldQueueBesiegedActivation(){
    if(standaloneSiegeNotificationQueue.flushing) return false;
    if(standaloneBesiegedTarget()) return false;
    if(standaloneOverviewModalVisible()) return true;
    if(standaloneSiegeSequenceHoldActive()) return true;
    return Date.now() < Number(standaloneSiegeNotificationQueue.pendingShowUntil || 0);
  }

  function standaloneFlushQueuedBesiegedActivation(){
    const pending = standaloneSiegeNotificationQueue.pending;
    if(!pending) return false;
    standaloneSiegeNotificationQueue.pending = null;
    try{
      if(standaloneSiegeNotificationQueue.timer) clearTimeout(standaloneSiegeNotificationQueue.timer);
    }catch(_){}
    standaloneSiegeNotificationQueue.timer = null;
    standaloneSiegeNotificationQueue.pendingShowUntil = 0;
    standaloneSiegeNotificationQueue.expectedHideUntil = 0;
    standaloneSiegeNotificationQueue.sequenceHoldUntil = 0;
    standaloneClearSiegeIncomingNotice();
    standaloneSiegeNotificationQueue.flushing = true;
    const introStart = standaloneCaptureSiegeIntroStart(pending.args);
    try{
      const result = pending.original.apply(pending.thisArg, pending.args);
      if(result === false){
        standaloneRestoreSiegeIntroStartCapture(introStart);
        return result;
      }
      try{ standaloneEnforceBesiegedTarget("queued activation", { save:true }); }catch(_){}
      try{ standaloneRunSiegeActivationIntroForCurrent("queued activation", introStart); }catch(_){}
      return result;
    }finally{
      standaloneSiegeNotificationQueue.flushing = false;
    }
  }

  function standaloneScheduleQueuedBesiegedActivation(){
    if(!standaloneSiegeNotificationQueue.pending) return;
    if(standaloneSiegeNotificationQueue.timer) return;
    const poll = ()=>{
      standaloneSiegeNotificationQueue.timer = null;
      const pending = standaloneSiegeNotificationQueue.pending;
      if(!pending){
        standaloneClearSiegeIncomingNotice();
        return;
      }
      if(standaloneOverviewModalVisible()){
        pending.sawModal = true;
        standaloneShowSiegeIncomingNotice();
        standaloneSiegeNotificationQueue.timer = setTimeout(poll, 120);
        return;
      }
      const now = Date.now();
      if(now < Number(standaloneSiegeNotificationQueue.sequenceHoldUntil || 0)){
        if(pending.sawModal) standaloneShowSiegeIncomingNotice();
        standaloneSiegeNotificationQueue.timer = setTimeout(poll, 140);
        return;
      }
      const waitForDelayedModal = !pending.sawModal && now < Math.min(
        Number(standaloneSiegeNotificationQueue.expectedHideUntil || 0) || now,
        Number(pending.queuedAt || now) + 1800
      );
      if(waitForDelayedModal){
        standaloneSiegeNotificationQueue.timer = setTimeout(poll, 90);
        return;
      }
      setTimeout(()=>standaloneFlushQueuedBesiegedActivation(), 160);
    };
    standaloneSiegeNotificationQueue.timer = setTimeout(poll, 40);
  }

  function standaloneQueueBesiegedActivation(original, thisArg, argsLike){
    if(!standaloneShouldQueueBesiegedActivation()) return false;
    standaloneSiegeNotificationQueue.pending = {
      original,
      thisArg,
      args: Array.prototype.slice.call(argsLike || []),
      queuedAt: Date.now(),
      sawModal: standaloneOverviewModalVisible()
    };
    standaloneShowSiegeIncomingNotice();
    standaloneScheduleQueuedBesiegedActivation();
    return true;
  }

  function standaloneClearSiegeIntroClasses(){
    try{
      if(standaloneSiegeNotificationQueue.introTimer) clearTimeout(standaloneSiegeNotificationQueue.introTimer);
    }catch(_){}
    try{
      standaloneSiegeNotificationQueue.introPhaseTimers.forEach((timer)=>clearTimeout(timer));
    }catch(_){}
    standaloneSiegeNotificationQueue.introTimer = null;
    standaloneSiegeNotificationQueue.introPhaseTimers = [];
    standaloneSiegeNotificationQueue.introAnimating = false;
    try{ document.body.classList.remove("flprStandaloneSiegeIntroActive"); }catch(_){}
    try{
      document.querySelectorAll(".flprStandaloneSiegeIntroTarget").forEach((node)=>{
        node.classList.remove("flprStandaloneSiegeIntroTarget", "flprStandaloneSiegeIntroArmy", "flprStandaloneSiegeIntroCastle", "flprStandaloneSiegeIntroReady", "flprStandaloneSiegeIntroFallback");
        try{
          node.getAnimations?.().forEach((animation)=>{
            try{ if(animation.id === "flprStandaloneSiegeTargetMorph") animation.cancel(); }catch(_){}
          });
        }catch(_){}
        try{
          node.style.removeProperty("--flpr-siege-intro-dx");
          node.style.removeProperty("--flpr-siege-intro-dy");
          node.style.removeProperty("--flpr-siege-intro-sx");
          node.style.removeProperty("--flpr-siege-intro-sy");
          node.style.removeProperty("--flpr-siege-intro-ms");
        }catch(_){}
      });
    }catch(_){}
  }

  function standaloneFindCurrentSiegeTargetCard(live){
    try{
      if(!live?.active) return null;
      const targetKey = String(live.tableKey || "").trim();
      const selectedWorld = String(state?.selected || "");
      const targetWorld = String(live.worldKey || "");
      const targetIdx = Number(String(targetKey).split("|")[1]);
      let card = document.querySelector("#selectedBody .pentaCard.besiegedTarget");
      if(card) return card;
      const wrap = document.querySelector("#selectedBody .pentagonWrap");
      const cards = wrap && Array.isArray(wrap.__pentaCards) ? wrap.__pentaCards : null;
      if(cards && selectedWorld === targetWorld && Number.isFinite(targetIdx) && cards[targetIdx]) return cards[targetIdx];
    }catch(_){}
    return null;
  }

  function standalonePlaySiegeIntroSound(){
    try{ if(typeof playSfx === "function") playSfx("bossKeyTravelSizzle"); }catch(_){}
    try{
      if(typeof playTone === "function"){
        [
          { delay:0, freq:72, sweepTo:46, gain:.080 },
          { delay:90, freq:82, sweepTo:52, gain:.070 },
          { delay:190, freq:66, sweepTo:42, gain:.075 },
          { delay:320, freq:92, sweepTo:58, gain:.060 }
        ].forEach((tone)=>{
          const timer = setTimeout(()=>{
            try{ playTone({ freq:tone.freq, dur:.30, type:"sawtooth", gain:tone.gain, sweepTo:tone.sweepTo, sweepDur:.24 }); }catch(_){}
          }, tone.delay);
          standaloneSiegeNotificationQueue.introPhaseTimers.push(timer);
        });
      }
    }catch(_){}
  }

  function standaloneRunSiegeActivationIntroForCurrent(reason, introStart){
    try{
      const live = (typeof besiegedGetState === "function")
        ? (besiegedGetState() || {})
        : (state?.besiegedEvent || {});
      if(!live?.active) return false;
      const sig = [
        String(live.tableKey || ""),
        String(live.activatedAt || ""),
        String(reason || "")
      ].join("|");
      if(sig && String(standaloneSiegeNotificationQueue.introSig || "") === sig) return false;
      standaloneClearSiegeIntroClasses();
      standaloneSiegeNotificationQueue.introSig = sig;
      const holdMs = Math.max(900, Number(window.__flprStandaloneSiegeIntroMs || 3600) || 3600);
      const morphMs = Math.max(520, Math.min(1660, Math.round(holdMs * 0.58)));
      const clampPhase = (value, min, max)=>Math.max(min, Math.min(max, Math.round(Number(value || 0) || 0)));
      const armyAt = clampPhase(holdMs * 0.18, 120, Math.max(140, Math.min(760, holdMs - 620)));
      const castleAt = clampPhase(holdMs * 0.42, armyAt + 220, Math.max(armyAt + 240, Math.min(1580, holdMs - 360)));
      const readyAt = clampPhase(holdMs * 0.72, castleAt + 260, Math.max(castleAt + 280, holdMs - 220));
      try{
        if(String(state?.selected || "") !== String(live.worldKey || "")) state.selected = String(live.worldKey || state?.selected || "");
      }catch(_){}
      try{ if(typeof showView === "function") showView("tower"); else { activeView = "tower"; try{ setTabUI(); }catch(__){} } }catch(_){}
      try{ renderAll(); }catch(_){}
      const apply = ()=>{
        const card = standaloneFindCurrentSiegeTargetCard(live);
        if(!card){
          standaloneSiegeNotificationQueue.introAnimating = false;
          return;
        }
        standaloneSiegeNotificationQueue.introAnimating = true;
        let morph = null;
        try{
          const finalRect = card.getBoundingClientRect();
          const startRect = (introStart && String(introStart?.target?.tableKey || "") === String(live.tableKey || ""))
            ? introStart.rect
            : null;
          if(startRect && finalRect.width > 0 && finalRect.height > 0){
            const finalCenterX = finalRect.left + finalRect.width / 2;
            const finalCenterY = finalRect.top + finalRect.height / 2;
            const startCenterX = Number(startRect.centerX ?? (Number(startRect.left || 0) + Number(startRect.width || 0) / 2));
            const startCenterY = Number(startRect.centerY ?? (Number(startRect.top || 0) + Number(startRect.height || 0) / 2));
            morph = {
              dx: startCenterX - finalCenterX,
              dy: startCenterY - finalCenterY,
              sx: Math.max(.18, Math.min(1.15, Number(startRect.width || 0) / finalRect.width)),
              sy: Math.max(.18, Math.min(1.15, Number(startRect.height || 0) / finalRect.height)),
              durationMs:morphMs,
              startRect:{ ...startRect },
              finalRect:{
                left:finalRect.left,
                top:finalRect.top,
                width:finalRect.width,
                height:finalRect.height
              }
            };
          }else if(finalRect.width > 0 && finalRect.height > 0){
            morph = {
              dx:0,
              dy:-122,
              sx:.56,
              sy:.40,
              durationMs:morphMs,
              startRect:null,
              finalRect:{
                left:finalRect.left,
                top:finalRect.top,
                width:finalRect.width,
                height:finalRect.height
              },
              fallback:true
            };
          }
        }catch(_){}
        if(!morph) morph = { dx:0, dy:-122, sx:.56, sy:.40, durationMs:morphMs, fallback:true };
        standaloneSiegeNotificationQueue.lastIntroMorph = morph;
        try{
          card.style.setProperty("--flpr-siege-intro-dx", `${Math.round(Number(morph.dx || 0))}px`);
          card.style.setProperty("--flpr-siege-intro-dy", `${Math.round(Number(morph.dy || 0))}px`);
          card.style.setProperty("--flpr-siege-intro-sx", String(Number(morph.sx || .56).toFixed(4)));
          card.style.setProperty("--flpr-siege-intro-sy", String(Number(morph.sy || .40).toFixed(4)));
          card.style.setProperty("--flpr-siege-intro-ms", `${Math.round(Number(morph.durationMs || morphMs))}ms`);
        }catch(_){}
        try{ document.body.classList.add("flprStandaloneSiegeIntroActive"); }catch(_){}
        try{ card.classList.add("flprStandaloneSiegeIntroTarget"); }catch(_){}
        try{
          if(card.animate){
            card.classList.remove("flprStandaloneSiegeIntroFallback");
            const animation = card.animate([
              {
                translate:`${Number(morph.dx || 0)}px ${Number(morph.dy || 0)}px`,
                scale:`${Number(morph.sx || .56)} ${Number(morph.sy || .40)}`,
                opacity:.88,
                filter:"brightness(.72) saturate(.74)"
              },
              {
                offset:.62,
                translate:`${Number(morph.dx || 0) * -0.018}px ${Number(morph.dy || 0) * -0.018}px`,
                scale:"1.035 1.025",
                opacity:1,
                filter:"brightness(1.14) saturate(1.18)"
              },
              {
                translate:"0px 0px",
                scale:"1 1",
                opacity:1,
                filter:"brightness(1) saturate(1)"
              }
            ], {
              duration:Math.round(Number(morph.durationMs || morphMs)),
              easing:"cubic-bezier(.16,.92,.16,1)",
              fill:"both"
            });
            try{ animation.id = "flprStandaloneSiegeTargetMorph"; }catch(_){}
            animation.onfinish = ()=>{
              try{ animation.cancel(); }catch(_){}
            };
          }else{
            card.classList.add("flprStandaloneSiegeIntroFallback");
          }
        }catch(_){
          try{ card.classList.add("flprStandaloneSiegeIntroFallback"); }catch(__){}
        }
        let fadedSiblingCount = 0;
        try{
          fadedSiblingCount = Array.from(document.querySelectorAll("#selectedBody .pentaCard"))
            .filter((node)=>node !== card).length;
        }catch(_){}
        const markPhase = (phase)=>{
          try{
            const rec = window.__flprStandaloneLastSiegeIntro;
            if(rec && rec.completed === false){
              rec.phaseOrder = Array.isArray(rec.phaseOrder) ? rec.phaseOrder : [];
              if(!rec.phaseOrder.includes(phase)) rec.phaseOrder.push(phase);
              rec.lastPhase = phase;
              rec.lastPhaseAt = Date.now();
            }
          }catch(_){}
        };
        try{
          window.__flprStandaloneLastSiegeIntro = {
            tableKey: String(live.tableKey || ""),
            tableName: String(live.tableName || ""),
            reason: String(reason || ""),
            completed:false,
            morph,
            fadedSiblingCount,
            phaseOrder: [],
            phaseTimings: { armyAt, castleAt, readyAt, holdMs },
            ts:Date.now()
          };
        }catch(_){}
        standaloneSiegeNotificationQueue.introPhaseTimers.push(setTimeout(()=>{ try{ card.classList.add("flprStandaloneSiegeIntroArmy"); markPhase("army"); standalonePlaySiegeIntroSound(); }catch(_){} }, armyAt));
        standaloneSiegeNotificationQueue.introPhaseTimers.push(setTimeout(()=>{ try{ card.classList.add("flprStandaloneSiegeIntroCastle"); markPhase("castle"); }catch(_){} }, castleAt));
        standaloneSiegeNotificationQueue.introPhaseTimers.push(setTimeout(()=>{ try{ card.classList.add("flprStandaloneSiegeIntroReady"); markPhase("ready"); }catch(_){} }, readyAt));
        standaloneSiegeNotificationQueue.introTimer = setTimeout(()=>{
          standaloneSiegeNotificationQueue.introTimer = null;
          standaloneSiegeNotificationQueue.introPhaseTimers = [];
          standaloneSiegeNotificationQueue.introAnimating = false;
          try{ document.body.classList.remove("flprStandaloneSiegeIntroActive"); }catch(_){}
          try{
            card.getAnimations?.().forEach((animation)=>{
              try{ if(animation.id === "flprStandaloneSiegeTargetMorph") animation.cancel(); }catch(_){}
            });
          }catch(_){}
          try{
            card.classList.remove("flprStandaloneSiegeIntroTarget", "flprStandaloneSiegeIntroArmy", "flprStandaloneSiegeIntroCastle", "flprStandaloneSiegeIntroReady", "flprStandaloneSiegeIntroFallback");
            card.style.removeProperty("--flpr-siege-intro-dx");
            card.style.removeProperty("--flpr-siege-intro-dy");
            card.style.removeProperty("--flpr-siege-intro-sx");
            card.style.removeProperty("--flpr-siege-intro-sy");
            card.style.removeProperty("--flpr-siege-intro-ms");
          }catch(_){}
          try{
            window.__flprStandaloneLastSiegeIntro = {
              tableKey: String(live.tableKey || ""),
              tableName: String(live.tableName || ""),
              reason: String(reason || ""),
              completed:true,
              morph:standaloneSiegeNotificationQueue.lastIntroMorph || morph,
              phaseOrder: Array.isArray(window.__flprStandaloneLastSiegeIntro?.phaseOrder) ? window.__flprStandaloneLastSiegeIntro.phaseOrder.slice() : [],
              phaseTimings: { armyAt, castleAt, readyAt, holdMs },
              ts:Date.now()
            };
          }catch(_){}
        }, holdMs);
      };
      apply();
      return true;
    }catch(_){}
    return false;
  }

  const standaloneSiegeVictoryOverlay = {
    hideTimer: null,
    removeTimer: null,
    fireworkTimer: null,
    soundTimers: []
  };

  function standaloneShowOverviewForSiegeVictory(){
    try{
      if(typeof showView === "function") showView("overview");
      else { activeView = "overview"; try{ setTabUI(); }catch(__){} }
    }catch(_){}
    try{ if(typeof renderOverviewGrid === "function") renderOverviewGrid(); }catch(_){}
  }

  function standaloneSiegeCinematicHost(kind){
    const isVictory = String(kind || "").trim().toLowerCase() === "victory";
    const host = isVictory
      ? (document.getElementById("viewOverview") || document.querySelector(".viewport") || document.body)
      : (document.querySelector(".viewport") || document.getElementById("viewOverview") || document.body);
    try{ host.classList.add("flprStandaloneSiegeCinematicHost"); }catch(_){}
    try{
      const computed = window.getComputedStyle(host);
      if(computed && computed.position === "static") host.style.position = "relative";
    }catch(_){}
    return host;
  }

  function standaloneAppendSiegeCinematicOverlay(overlay, kind){
    const host = standaloneSiegeCinematicHost(kind);
    try{ overlay.classList.add("flprStandaloneSiegeCinematicScoped"); }catch(_){}
    host.appendChild(overlay);
    try{
      const rect = overlay.getBoundingClientRect();
      const hostRect = host.getBoundingClientRect();
      overlay.dataset.cinematicHost = host.id || (host.classList && Array.from(host.classList).join(" ")) || host.tagName || "";
      overlay.__flprCinematicHostRect = {
        left:hostRect.left,
        top:hostRect.top,
        width:hostRect.width,
        height:hostRect.height
      };
      overlay.__flprCinematicOverlayRect = {
        left:rect.left,
        top:rect.top,
        width:rect.width,
        height:rect.height
      };
    }catch(_){}
    return host;
  }

  function standaloneClearSiegeVictoryOverlay(){
    try{ if(standaloneSiegeVictoryOverlay.hideTimer) clearTimeout(standaloneSiegeVictoryOverlay.hideTimer); }catch(_){}
    try{ if(standaloneSiegeVictoryOverlay.removeTimer) clearTimeout(standaloneSiegeVictoryOverlay.removeTimer); }catch(_){}
    try{ if(standaloneSiegeVictoryOverlay.fireworkTimer) clearInterval(standaloneSiegeVictoryOverlay.fireworkTimer); }catch(_){}
    standaloneSiegeVictoryOverlay.hideTimer = null;
    standaloneSiegeVictoryOverlay.removeTimer = null;
    standaloneSiegeVictoryOverlay.fireworkTimer = null;
    try{
      standaloneSiegeVictoryOverlay.soundTimers.forEach((timer)=>clearTimeout(timer));
    }catch(_){}
    standaloneSiegeVictoryOverlay.soundTimers = [];
    try{ document.getElementById("flprStandaloneSiegeVictoryOverlay")?.remove(); }catch(_){}
    try{ document.querySelector(".stage")?.classList?.remove("victoryGroove"); }catch(_){}
  }

  function standaloneSiegeEnemyName(raw){
    let name = String(raw || "").trim();
    if(!name) name = "siege army";
    name = name.replace(/^the\s+/i, "");
    return name;
  }

  function standaloneSiegeVictoryDamageLevel(live){
    try{
      let level = NaN;
      try{
        if(typeof besiegedGetDefenseDamageLevel === "function") level = Number(besiegedGetDefenseDamageLevel(live));
      }catch(_){}
      if(!Number.isFinite(level) || level <= 0){
        const failedAt = Number(live?.defenseFailedAt || 0) || 0;
        if(failedAt > 0) level = 4;
      }
      if(!Number.isFinite(level) || level <= 0){
        const startedAt = Number(live?.defenseStartedAt || 0) || 0;
        const deadlineAt = Number(live?.defenseDeadlineAt || 0) || 0;
        const totalMs = Math.max(1, Number((typeof BESIEGED_DEFENSE_MS !== "undefined" && BESIEGED_DEFENSE_MS) || 300000) || 300000);
        if(startedAt > 0 && deadlineAt > startedAt){
          const leftMs = Math.max(0, deadlineAt - Date.now());
          const elapsedPct = Math.max(0, Math.min(1, 1 - (leftMs / totalMs)));
          if(elapsedPct >= .86) level = 4;
          else if(elapsedPct >= .68) level = 3;
          else if(elapsedPct >= .46) level = 2;
          else if(elapsedPct >= .24) level = 1;
        }
      }
      if(!Number.isFinite(level) || level <= 0) level = live?.active ? 3 : 2;
      return Math.max(1, Math.min(4, Math.round(level)));
    }catch(_){}
    return 3;
  }

  function standaloneSiegeVictoryDamageText(level){
    const l = Math.max(1, Math.min(4, Math.round(Number(level || 0) || 0)));
    if(l >= 4) return "CRITICAL";
    if(l >= 3) return "BREACHED";
    if(l >= 2) return "BATTERED";
    return "SCARRED";
  }

  function standaloneSiegeVictoryArmyConfig(live){
    try{
      if(typeof besiegedGetArmyConfig === "function"){
        const cfg = besiegedGetArmyConfig(live?.armyType || "");
        if(cfg) return cfg;
      }
    }catch(_){}
    return {
      label: String(live?.armyLabel || "Siege army"),
      troops:["\u{2694}\u{FE0F}", "\u{1F6E1}\u{FE0F}", "\u{1F3F9}", "\u{1F4A3}", "\u{2694}\u{FE0F}", "\u{1F6E1}\u{FE0F}", "\u{27B6}", "\u{1F525}", "\u{2694}\u{FE0F}", "\u{1F3F9}"]
    };
  }

  function standaloneBuildSiegeVictoryTroops(troops){
    try{
      const source = Array.isArray(troops) && troops.length ? troops : ["\u{2694}\u{FE0F}", "\u{1F6E1}\u{FE0F}", "\u{1F3F9}", "\u{27B6}"];
      const count = Math.max(10, Math.min(16, source.length + 4));
      const html = [];
      for(let i = 0; i < count; i++){
        const troop = String(source[i % source.length] || "\u{2694}\u{FE0F}");
        const left = 6 + ((88 / Math.max(1, count - 1)) * i);
        const side = left < 50 ? -1 : 1;
        const distance = Math.round((180 + (i % 5) * 36 + Math.abs(left - 50) * 4) * side);
        const drop = Math.round(32 + (i % 4) * 18);
        const size = Math.round(22 + (i % 4) * 4);
        const base = Math.round((i % 3) * 18);
        const delay = Math.round(80 + i * 46);
        const rot = Math.round(side * (10 + (i % 4) * 8));
        html.push(`<span class="flprStandaloneSiegeVictoryTroop" style="--left:${left.toFixed(2)}%;--base:${base}px;--size:${size}px;--delay:${delay}ms;--retreat-x:${distance}px;--retreat-y:${drop}px;--retreat-rot:${rot}deg;">${standaloneEscapeHtml(troop)}</span>`);
      }
      return html.join("");
    }catch(_){}
    return "";
  }

  function standaloneGetSiegeTableBanner(live, tableName){
    try{
      const key = String(live?.tableKey || "").trim();
      const worldKey = String(live?.worldKey || key.split("|")[0] || (typeof state !== "undefined" ? (state?.selected || state?.currentWorld || "") : "") || "").trim();
      const name = String(tableName || live?.tableName || "").trim();
      return String(
        (worldKey && name && typeof getTableBannerUrl === "function" ? getTableBannerUrl(worldKey, name) : "")
        || (worldKey && typeof getWorldBannerUrl === "function" ? getWorldBannerUrl(worldKey) : "")
        || ""
      ).trim();
    }catch(_){}
    return "";
  }

  function standaloneApplySiegeCastlePalette(overlay, live, tableName){
    const bannerUrl = standaloneGetSiegeTableBanner(live, tableName);
    try{
      if(typeof besiegedApplyCastlePaletteFromBanner === "function"){
        besiegedApplyCastlePaletteFromBanner(overlay, bannerUrl, tableName || live?.tableName || "Besieged table");
      }
    }catch(_){}
    return bannerUrl;
  }

  function standaloneBuildSiegeTableReveal(tableName){
    const name = String(tableName || "Besieged table").trim() || "Besieged table";
    const chars = Array.from(name).slice(0, 54);
    return `
      <div class="flprStandaloneSiegeTableReveal" aria-label="${standaloneEscapeHtml(name)}">
        <div class="flprStandaloneSiegeTableRevealKicker">TABLE FREED</div>
        <div class="flprStandaloneSiegeTableRevealName">${chars.map((ch, i)=>`<span style="--i:${i}">${ch === " " ? "&nbsp;" : standaloneEscapeHtml(ch)}</span>`).join("")}</div>
      </div>
    `;
  }

  function standaloneScheduleSiegeVictorySound(delay, fn){
    const timer = setTimeout(()=>{
      try{ fn(); }catch(_){}
    }, Math.max(0, Number(delay || 0) || 0));
    standaloneSiegeVictoryOverlay.soundTimers.push(timer);
  }

  function standaloneFadeOutSiegeVictoryMusic(name, fadeMs){
    try{
      if(typeof musicFadeOutCurrentScenario === "function") return !!musicFadeOutCurrentScenario(name, fadeMs, { refresh:true });
    }catch(_){}
    try{
      const mgr = window.__flprMusic;
      const audio = mgr?.audio;
      if(!audio || audio.paused || String(mgr.current || "") !== String(name || "")) return false;
      const startVolume = Math.max(0, Math.min(1, Number(audio.volume) || 0));
      const durationMs = Math.max(120, Number(fadeMs || 900) || 900);
      const startedAt = Date.now();
      const timer = setInterval(()=>{
        try{
          const raw = Math.max(0, Math.min(1, (Date.now() - startedAt) / durationMs));
          const eased = raw * raw * (3 - (2 * raw));
          audio.volume = Math.max(0, startVolume * (1 - eased));
          if(raw < 1) return;
          clearInterval(timer);
          if(window.__flprMusic?.audio === audio && String(window.__flprMusic?.current || "") === String(name || "")){
            try{ audio.pause(); }catch(_){}
            window.__flprMusic.current = "";
            window.__flprMusic.currentUrl = "";
            window.__flprMusic.lockedUntil = 0;
            try{ if(typeof musicRefreshScenario === "function") musicRefreshScenario(); }catch(_){}
          }
        }catch(_){
          try{ clearInterval(timer); }catch(__){}
        }
      }, 40);
      return true;
    }catch(_){}
    return false;
  }

  function standalonePlaySiegeVictoryCheer(holdMs){
    const totalMs = Math.max(800, Number(holdMs || 4200) || 4200) + 760;
    const fadeMs = Math.max(420, Math.min(1200, Math.round(totalMs * 0.22)));
    let musicStarted = false;
    try{
      if(typeof musicLockScenarioForDuration === "function") musicStarted = !!musicLockScenarioForDuration("randomizer_win", totalMs, { fadeMs, fadeLeadMs:80 });
      else if(typeof musicLockScenario === "function"){
        musicStarted = !!musicLockScenario("randomizer_win", Math.max(0, totalMs - fadeMs));
        setTimeout(()=>standaloneFadeOutSiegeVictoryMusic("randomizer_win", fadeMs), Math.max(0, totalMs - fadeMs - 80));
      }
    }catch(_){}
    standaloneScheduleSiegeVictorySound(0, ()=>{
      try{ if(typeof playSfx === "function") playSfx("tada"); }catch(_){}
      try{ if(typeof playSfx === "function") playSfx("introBurst"); }catch(_){}
    });
    standaloneScheduleSiegeVictorySound(360, ()=>{ try{ if(typeof playSfx === "function") playSfx("chaching"); }catch(_){} });
    standaloneScheduleSiegeVictorySound(760, ()=>{ try{ if(typeof playSfx === "function") playSfx("key"); }catch(_){} });
    standaloneScheduleSiegeVictorySound(1160, ()=>{
      try{ if(typeof playSfx === "function") playSfx("introBurst"); }catch(_){}
      try{ if(typeof playTone === "function") playTone({ freq:1318, dur:0.18, type:"sine", gain:0.12, sweepTo:1760, sweepDur:0.16 }); }catch(_){}
    });
    return { started:musicStarted, durationMs:totalMs, fadeMs, fadeLeadMs:80 };
  }

  function standaloneSpawnSiegeFirework(layer, opts){
    try{
      if(!layer) return;
      const fw = document.createElement("div");
      fw.className = "flprStandaloneSiegeFirework";
      const rect = layer.getBoundingClientRect ? layer.getBoundingClientRect() : null;
      const w = Math.max(1, Number(rect?.width || 0) || window.innerWidth || document.documentElement.clientWidth || 1600);
      const h = Math.max(1, Number(rect?.height || 0) || window.innerHeight || document.documentElement.clientHeight || 900);
      const left = opts?.left != null ? Number(opts.left) : Math.round(w * (0.18 + Math.random() * 0.64));
      const top = opts?.top != null ? Number(opts.top) : Math.round(h * (0.16 + Math.random() * 0.38));
      const palette = ["#00ffd5", "#00a6ff", "#22ff88", "#ffe66d", "#ff4d6d", "#ffffff"];
      const color = String(opts?.color || palette[Math.floor(Math.random() * palette.length)] || "#ffe66d");
      fw.style.left = `${Math.max(20, Math.min(w - 20, left))}px`;
      fw.style.top = `${Math.max(20, Math.min(h - 20, top))}px`;
      fw.style.setProperty("--fw-color", color);
      const sparks = Math.max(12, Math.round(Number(opts?.sparks || 18) || 18));
      for(let i = 0; i < sparks; i++){
        const spark = document.createElement("div");
        spark.className = "flprStandaloneSiegeSpark";
        const angle = ((Math.PI * 2) / sparks) * i + (Math.random() * 0.22);
        const dist = 72 + Math.random() * 110;
        spark.style.setProperty("--dx", `${Math.round(Math.cos(angle) * dist)}px`);
        spark.style.setProperty("--dy", `${Math.round(Math.sin(angle) * dist)}px`);
        spark.style.setProperty("--fw-color", color);
        fw.appendChild(spark);
      }
      layer.appendChild(fw);
      setTimeout(()=>{ try{ fw.remove(); }catch(_){} }, 1250);
    }catch(_){}
  }

  function standaloneStartSiegeVictoryFireworks(layer, holdMs){
    try{
      if(!layer) return;
      [0, 180, 360, 620].forEach((delay)=>setTimeout(()=>standaloneSpawnSiegeFirework(layer), delay));
      standaloneSiegeVictoryOverlay.fireworkTimer = setInterval(()=>standaloneSpawnSiegeFirework(layer), 260);
      setTimeout(()=>{
        try{
          if(standaloneSiegeVictoryOverlay.fireworkTimer){
            clearInterval(standaloneSiegeVictoryOverlay.fireworkTimer);
            standaloneSiegeVictoryOverlay.fireworkTimer = null;
          }
        }catch(_){}
      }, Math.max(700, Number(holdMs || 4200) - 450));
    }catch(_){}
  }

  function standaloneShowSiegeVictoryOverlay(live, reason){
    try{
      if(!live || !standaloneShouldShowSiegeVictoryOverlay(live, reason)) return false;
      const tableName = String(live.tableName || "Besieged table").trim() || "Besieged table";
      const enemy = standaloneSiegeEnemyName(live.armyLabel || live.armyType || "siege army");
      const damageLevel = standaloneSiegeVictoryDamageLevel(live);
      const damageText = standaloneSiegeVictoryDamageText(damageLevel);
      const armyConfig = standaloneSiegeVictoryArmyConfig(live);
      const armyLabel = String(armyConfig?.label || enemy || "Siege army").trim();
      const troopHtml = standaloneBuildSiegeVictoryTroops(armyConfig?.troops);
      const holdMs = Math.max(800, Number(window.__flprStandaloneSiegeVictoryHoldMs || 4200) || 4200);
      standaloneClearSiegeVictoryOverlay();
      standaloneShowOverviewForSiegeVictory();
      const overlay = document.createElement("div");
      overlay.id = "flprStandaloneSiegeVictoryOverlay";
      overlay.className = "flprStandaloneSiegeVictoryOverlay";
      overlay.dataset.damageLevel = String(damageLevel);
      overlay.setAttribute("aria-hidden", "true");
      overlay.addEventListener("click", (ev)=>{
        try{ ev.preventDefault(); ev.stopPropagation(); }catch(_){}
      }, true);
      const paletteBannerUrl = standaloneApplySiegeCastlePalette(overlay, live, tableName);
      overlay.innerHTML = `
        <div class="flprStandaloneSiegeVictoryFireworks" aria-hidden="true"></div>
        <div class="flprStandaloneSiegeVictoryBattle" data-damage-level="${damageLevel}" aria-hidden="true">
          <div class="flprStandaloneSiegeVictorySky"></div>
          <div class="flprStandaloneSiegeVictoryGround"></div>
          <div class="flprStandaloneSiegeVictoryStatus">CASTLE STATUS; ${standaloneEscapeHtml(damageText)}</div>
          ${standaloneBuildSiegeTableReveal(tableName)}
          <div class="flprStandaloneSiegeVictoryCastle damage${damageLevel}">
            <div class="flprStandaloneSiegeVictoryTower left"></div>
            <div class="flprStandaloneSiegeVictoryTower right"></div>
            <div class="flprStandaloneSiegeVictoryKeep">
              <div class="flprStandaloneSiegeVictoryCrown"></div>
              <span class="flprStandaloneSiegeVictoryWindow w1"></span>
              <span class="flprStandaloneSiegeVictoryWindow w2"></span>
              <span class="flprStandaloneSiegeVictoryWindow w3"></span>
              <span class="flprStandaloneSiegeVictoryWindow w4"></span>
              <span class="flprStandaloneSiegeVictoryGate"></span>
              <span class="flprStandaloneSiegeVictoryCrack c1"></span>
              <span class="flprStandaloneSiegeVictoryCrack c2"></span>
              <span class="flprStandaloneSiegeVictorySmoke s1"></span>
              <span class="flprStandaloneSiegeVictorySmoke s2"></span>
              <span class="flprStandaloneSiegeVictorySmoke s3"></span>
              <span class="flprStandaloneSiegeVictoryFlame f1"></span>
              <span class="flprStandaloneSiegeVictoryFlame f2"></span>
              <span class="flprStandaloneSiegeVictoryRubble"></span>
            </div>
            <div class="flprStandaloneSiegeVictoryHelpers" aria-hidden="true">
              <span class="flprStandaloneSiegeVictoryHelper h1">
                <span class="flprStandaloneSiegeVictoryHelperHead"></span>
                <span class="flprStandaloneSiegeVictoryHelperBody"></span>
                <span class="flprStandaloneSiegeVictoryHelperBucket"></span>
                <span class="flprStandaloneSiegeVictoryHelperWater"></span>
                <span class="flprStandaloneSiegeVictoryHelperSplash"></span>
              </span>
              <span class="flprStandaloneSiegeVictoryHelper h2">
                <span class="flprStandaloneSiegeVictoryHelperHead"></span>
                <span class="flprStandaloneSiegeVictoryHelperBody"></span>
                <span class="flprStandaloneSiegeVictoryHelperBucket"></span>
                <span class="flprStandaloneSiegeVictoryHelperWater"></span>
                <span class="flprStandaloneSiegeVictoryHelperSplash"></span>
              </span>
            </div>
          </div>
          <div class="flprStandaloneSiegeVictoryDefenders">
            <span class="flprStandaloneSiegeVictoryShield"></span>
            <span class="flprStandaloneSiegeVictoryBeam left"></span>
            <span class="flprStandaloneSiegeVictoryBeam right"></span>
          </div>
          <div class="flprStandaloneSiegeVictoryArmy">${troopHtml}</div>
          <div class="flprStandaloneSiegeVictoryArmyLabel">${standaloneEscapeHtml(armyLabel)} driven off</div>
        </div>
        <div class="flprStandaloneSiegeVictoryCard">
          <div class="flprStandaloneSiegeVictoryKicker">SIEGE BROKEN</div>
          <div class="flprStandaloneSiegeVictoryTable">${standaloneEscapeHtml(tableName)} is free!</div>
          <div class="flprStandaloneSiegeVictoryEnemy">The ${standaloneEscapeHtml(enemy)} is defeated!</div>
        </div>
      `;
      const cinematicHost = standaloneAppendSiegeCinematicOverlay(overlay, "victory");
      const music = standalonePlaySiegeVictoryCheer(holdMs);
      standaloneStartSiegeVictoryFireworks(overlay.querySelector(".flprStandaloneSiegeVictoryFireworks"), holdMs);
      try{
        window.__flprStandaloneLastSiegeVictoryOverlayScope = {
          host:String(overlay.dataset.cinematicHost || ""),
          scopedToViewport:!!cinematicHost?.classList?.contains("viewport"),
          scopedToOverview:String(cinematicHost?.id || "") === "viewOverview",
          hostRect:overlay.__flprCinematicHostRect || null,
          overlayRect:overlay.__flprCinematicOverlayRect || null,
          paletteBannerUrl,
          tableRevealText:tableName,
          tableRevealChars:overlay.querySelectorAll(".flprStandaloneSiegeTableRevealName span").length,
          helperCount:overlay.querySelectorAll(".flprStandaloneSiegeVictoryHelper").length,
          waterStreamCount:overlay.querySelectorAll(".flprStandaloneSiegeVictoryHelperWater").length,
          dousedFlameCount:overlay.querySelectorAll(".flprStandaloneSiegeVictoryCastle .flprStandaloneSiegeVictoryFlame").length,
          fireworksBackground: Number(getComputedStyle(overlay.querySelector(".flprStandaloneSiegeVictoryFireworks"))?.zIndex || 0) < Number(getComputedStyle(overlay.querySelector(".flprStandaloneSiegeVictoryBattle"))?.zIndex || 0),
          music,
          ts:Date.now()
        };
      }catch(_){}
      standaloneSiegeVictoryOverlay.hideTimer = setTimeout(()=>{
        try{ overlay.classList.add("leaving"); }catch(_){}
      }, holdMs);
      standaloneSiegeVictoryOverlay.removeTimer = setTimeout(()=>standaloneClearSiegeVictoryOverlay(), holdMs + 760);
      return true;
    }catch(_){}
    return false;
  }

  function standaloneSiegeVictoryReasonIsSuppressed(reason){
    const raw = String(reason || "").trim().toLowerCase();
    if(!raw) return false;
    if(raw === "test-reset") return true;
    if(/^test-(?!siege-victory)/.test(raw)) return true;
    return /\b(reset|cancel|abort|load|sync|startup|failed|penalty)\b/.test(raw);
  }

  function standaloneShouldShowSiegeVictoryOverlay(live, reason){
    if(!live || !live.active) return false;
    if(standaloneSiegeVictoryReasonIsSuppressed(reason)) return false;
    return true;
  }

  function standaloneSiegeVictorySignature(live, reason){
    return [
      String(live?.worldKey || ""),
      String(live?.tableKey || ""),
      String(live?.tableName || ""),
      String(live?.armyType || ""),
      String(live?.armyLabel || ""),
      String(reason || "")
    ].join("|");
  }

  function standaloneMaybeShowSiegeVictoryOverlay(live, reason){
    try{
      if(!standaloneShouldShowSiegeVictoryOverlay(live, reason)) return false;
      const sig = standaloneSiegeVictorySignature(live, reason);
      const now = Date.now();
      const last = standaloneSiegeVictoryOverlay.last || null;
      if(last && last.sig === sig && (now - Number(last.at || 0)) < 1400) return false;
      if(document.getElementById("flprStandaloneSiegeVictoryOverlay")) return false;
      const shown = standaloneShowSiegeVictoryOverlay(live, reason);
      if(shown) standaloneSiegeVictoryOverlay.last = { sig, at:now };
      return shown;
    }catch(_){}
    return false;
  }

  try{
    window.flprStandaloneShowSiegeVictoryOverlay = function(live, reason){
      return standaloneMaybeShowSiegeVictoryOverlay(live, reason || "external");
    };
  }catch(_){}

  function standaloneInstallSiegeVictoryClickBridge(){
    try{
      if(window.__flprStandaloneSiegeVictoryClickBridge) return true;
      window.__flprStandaloneSiegeVictoryClickBridge = true;
      document.addEventListener("click", (ev)=>{
        try{
          const btn = ev?.target?.closest?.(".besiegedTargetBtn");
          if(!btn) return;
          const live = (typeof besiegedGetState === "function")
            ? { ...(besiegedGetState() || {}) }
            : { ...(state?.besiegedEvent || {}) };
          if(!standaloneShouldShowSiegeVictoryOverlay(live, "button-clear")) return;
          const wasRunning = (typeof besiegedIsDefenseRunning === "function")
            ? !!besiegedIsDefenseRunning(live)
            : !!(Number(live?.defenseStartedAt || 0) > 0 && Number(live?.defenseDeadlineAt || 0) > Date.now());
          if(!wasRunning) return;
          setTimeout(()=>{
            try{
              const stillActive = (typeof besiegedIsActive === "function")
                ? !!besiegedIsActive()
                : !!state?.besiegedEvent?.active;
              if(!stillActive) standaloneMaybeShowSiegeVictoryOverlay(live, "button-clear");
            }catch(_){}
          }, 0);
          setTimeout(()=>{
            try{
              const stillActive = (typeof besiegedIsActive === "function")
                ? !!besiegedIsActive()
                : !!state?.besiegedEvent?.active;
              if(!stillActive) standaloneMaybeShowSiegeVictoryOverlay(live, "button-clear");
            }catch(_){}
          }, 90);
        }catch(_){}
      }, true);
      return true;
    }catch(_){}
    return false;
  }

  function installStandaloneSiegeNotificationQueueBridge(){
    let installedAny = false;
    try{
      const original = window.showOverviewModalNow || (typeof showOverviewModalNow === "function" ? showOverviewModalNow : null);
      if(original && !original.__flprStandaloneSiegeQueueBridge){
        const bridged = function standaloneShowOverviewModalNowSiegeQueueBridge(args){
          const holdMs = Number(args?.holdMs || 2800) || 2800;
          standaloneMarkOverviewNotificationWindow(holdMs, 0);
          const result = original.apply(this, arguments);
          if(standaloneSiegeNotificationQueue.pending) standaloneShowSiegeIncomingNotice();
          return result;
        };
        bridged.__flprStandaloneSiegeQueueBridge = true;
        bridged.__flprStandaloneOriginalShowOverviewModalNow = original;
        window.showOverviewModalNow = bridged;
        try{ showOverviewModalNow = bridged; }catch(_){}
      }
      if(window.showOverviewModalNow || typeof showOverviewModalNow === "function") installedAny = true;
    }catch(_){}

    try{
      const original = window.showOverviewModal || (typeof showOverviewModal === "function" ? showOverviewModal : null);
      if(original && !original.__flprStandaloneSiegeQueueBridge){
        const bridged = function standaloneShowOverviewModalSiegeQueueBridge(args){
          const holdMs = Number(args?.holdMs || 2800) || 2800;
          standaloneMarkOverviewNotificationWindow(holdMs, 620);
          const result = original.apply(this, arguments);
          const delay = Number(result || 0);
          if(Number.isFinite(delay) && delay >= 0) standaloneMarkOverviewNotificationWindow(holdMs, delay);
          if(standaloneSiegeNotificationQueue.pending) setTimeout(()=>standaloneShowSiegeIncomingNotice(), Math.max(0, delay || 0) + 40);
          return result;
        };
        bridged.__flprStandaloneSiegeQueueBridge = true;
        bridged.__flprStandaloneOriginalShowOverviewModal = original;
        window.showOverviewModal = bridged;
        try{ showOverviewModal = bridged; }catch(_){}
      }
      if(window.showOverviewModal || typeof showOverviewModal === "function") installedAny = true;
    }catch(_){}

    try{
      window.flprStandaloneSiegeQueueState = function(){
        return {
          pending: !!standaloneSiegeNotificationQueue.pending,
          sawModal: !!standaloneSiegeNotificationQueue.pending?.sawModal,
          modalVisible: standaloneOverviewModalVisible(),
          pendingShowUntil: Number(standaloneSiegeNotificationQueue.pendingShowUntil || 0),
          expectedHideUntil: Number(standaloneSiegeNotificationQueue.expectedHideUntil || 0),
          sequenceHoldUntil: Number(standaloneSiegeNotificationQueue.sequenceHoldUntil || 0),
          sequenceHoldActive: standaloneSiegeSequenceHoldActive(),
          introAnimating: !!standaloneSiegeNotificationQueue.introAnimating,
          hasNotice: !!document.querySelector(".flprStandaloneSiegeIncoming")
        };
      };
    }catch(_){}

    if(!installedAny) setTimeout(installStandaloneSiegeNotificationQueueBridge, 120);
  }

  function installStandaloneBesiegedSelectionBridge(){
    let installedAny = false;

    try{
      const original = window.besiegedActivate || (typeof besiegedActivate === "function" ? besiegedActivate : null);
      if(original && !original.__flprStandaloneBesiegedSelectionBridge){
        const bridged = function standaloneBesiegedActivateBridge(){
          if(standaloneQueueBesiegedActivation(original, this, arguments)) return true;
          const introStart = standaloneCaptureSiegeIntroStart(arguments);
          const result = original.apply(this, arguments);
          if(result === false){
            standaloneRestoreSiegeIntroStartCapture(introStart);
            return result;
          }
          try{ standaloneEnforceBesiegedTarget("activation", { save:true }); }catch(_){}
          try{ standaloneRunSiegeActivationIntroForCurrent("activation", introStart); }catch(_){}
          return result;
        };
        bridged.__flprStandaloneBesiegedSelectionBridge = true;
        bridged.__flprStandaloneOriginalBesiegedActivate = original;
        window.besiegedActivate = bridged;
        try{ besiegedActivate = bridged; }catch(_){}
      }
      if(window.besiegedActivate || typeof besiegedActivate === "function") installedAny = true;
    }catch(_){}

    try{
      const original = window.besiegedClear || (typeof besiegedClear === "function" ? besiegedClear : null);
      if(original && !original.__flprStandaloneBesiegedSelectionBridge){
        const bridged = function standaloneBesiegedClearBridge(reason){
          let live = null;
          try{
            live = (typeof besiegedGetState === "function")
              ? { ...(besiegedGetState() || {}) }
              : { ...(state?.besiegedEvent || {}) };
          }catch(_){}
          const result = original.apply(this, arguments);
          try{ standaloneClearSiegeIntroClasses(); }catch(_){}
          if(result !== false && live?.active){
            try{ standaloneMaybeShowSiegeVictoryOverlay(live, reason || "clear"); }catch(_){}
          }
          return result;
        };
        bridged.__flprStandaloneBesiegedSelectionBridge = true;
        bridged.__flprStandaloneOriginalBesiegedClear = original;
        window.besiegedClear = bridged;
        try{ besiegedClear = bridged; }catch(_){}
      }
      if(window.besiegedClear || typeof besiegedClear === "function") installedAny = true;
    }catch(_){}

    try{
      const original = window.besiegedSyncContext || (typeof besiegedSyncContext === "function" ? besiegedSyncContext : null);
      if(original && !original.__flprStandaloneBesiegedSelectionBridge){
        const bridged = function standaloneBesiegedSyncContextBridge(opts){
          const result = original.apply(this, arguments);
          try{ standaloneEnforceBesiegedTarget("context sync", { save: !!(opts && opts.save) }); }catch(_){}
          return result;
        };
        bridged.__flprStandaloneBesiegedSelectionBridge = true;
        bridged.__flprStandaloneOriginalBesiegedSyncContext = original;
        window.besiegedSyncContext = bridged;
        try{ besiegedSyncContext = bridged; }catch(_){}
      }
      if(window.besiegedSyncContext || typeof besiegedSyncContext === "function") installedAny = true;
    }catch(_){}

    try{
      const original = window.setNowPlayingIndex || (typeof setNowPlayingIndex === "function" ? setNowPlayingIndex : null);
      if(original && !original.__flprStandaloneBesiegedSelectionBridge){
        const bridged = function standaloneSetNowPlayingIndexBesiegedBridge(worldKey, idx, opts){
          const target = standaloneBesiegedTarget();
          if(target){
            const nextKey = standaloneBesiegedKeyFromArgs(worldKey, idx);
            if(nextKey && nextKey !== target.tableKey){
              standaloneEnforceBesiegedTarget("blocked now-playing switch", { save:true });
              return false;
            }
            standaloneEnforceBesiegedTarget("target now-playing refresh", { save:true });
            try{ applyOverviewNowPlayingHighlight(); }catch(_){}
            try{ applyChecksNowPlayingHighlight(); }catch(_){}
            try{ flprStatsRefreshNowPlayingTracker(); }catch(_){}
            return true;
          }
          return original.apply(this, arguments);
        };
        bridged.__flprStandaloneBesiegedSelectionBridge = true;
        bridged.__flprStandaloneOriginalSetNowPlayingIndex = original;
        window.setNowPlayingIndex = bridged;
        try{ setNowPlayingIndex = bridged; }catch(_){}
      }
      if(window.setNowPlayingIndex || typeof setNowPlayingIndex === "function") installedAny = true;
    }catch(_){}

    try{
      const original = window.setNowPlayingFromTableKey || (typeof setNowPlayingFromTableKey === "function" ? setNowPlayingFromTableKey : null);
      if(original && !original.__flprStandaloneBesiegedSelectionBridge){
        const bridged = function standaloneSetNowPlayingFromTableKeyBesiegedBridge(tableKey, opts){
          const target = standaloneBesiegedTarget();
          if(target){
            const nextKey = String(tableKey || "").trim();
            if(nextKey && nextKey !== target.tableKey){
              standaloneEnforceBesiegedTarget("blocked table switch", { save:true });
              return false;
            }
            standaloneEnforceBesiegedTarget("target table refresh", { save:true });
            return true;
          }
          return original.apply(this, arguments);
        };
        bridged.__flprStandaloneBesiegedSelectionBridge = true;
        bridged.__flprStandaloneOriginalSetNowPlayingFromTableKey = original;
        window.setNowPlayingFromTableKey = bridged;
        try{ setNowPlayingFromTableKey = bridged; }catch(_){}
      }
      if(window.setNowPlayingFromTableKey || typeof setNowPlayingFromTableKey === "function") installedAny = true;
    }catch(_){}

    try{
      const original = window.syncTowerSelectionToWorld || (typeof syncTowerSelectionToWorld === "function" ? syncTowerSelectionToWorld : null);
      if(original && !original.__flprStandaloneBesiegedSelectionBridge){
        const bridged = function standaloneSyncTowerSelectionToWorldBesiegedBridge(worldKey){
          const target = standaloneBesiegedTarget();
          if(target){
            standaloneEnforceBesiegedTarget("blocked tower world sync", { save:true });
            return target.worldKey;
          }
          return original.apply(this, arguments);
        };
        bridged.__flprStandaloneBesiegedSelectionBridge = true;
        bridged.__flprStandaloneOriginalSyncTowerSelectionToWorld = original;
        window.syncTowerSelectionToWorld = bridged;
        try{ syncTowerSelectionToWorld = bridged; }catch(_){}
      }
      if(window.syncTowerSelectionToWorld || typeof syncTowerSelectionToWorld === "function") installedAny = true;
    }catch(_){}

    try{
      const original = window.syncTowerSelectionToBossWorld || (typeof syncTowerSelectionToBossWorld === "function" ? syncTowerSelectionToBossWorld : null);
      if(original && !original.__flprStandaloneBesiegedSelectionBridge){
        const bridged = function standaloneSyncTowerSelectionToBossWorldBesiegedBridge(){
          const target = standaloneBesiegedTarget();
          if(target){
            standaloneEnforceBesiegedTarget("blocked boss tower sync", { save:true });
            return target.worldKey;
          }
          return original.apply(this, arguments);
        };
        bridged.__flprStandaloneBesiegedSelectionBridge = true;
        bridged.__flprStandaloneOriginalSyncTowerSelectionToBossWorld = original;
        window.syncTowerSelectionToBossWorld = bridged;
        try{ syncTowerSelectionToBossWorld = bridged; }catch(_){}
      }
      if(window.syncTowerSelectionToBossWorld || typeof syncTowerSelectionToBossWorld === "function") installedAny = true;
    }catch(_){}

    try{
      const original = window.syncChecksWorldFromTowerContext || (typeof syncChecksWorldFromTowerContext === "function" ? syncChecksWorldFromTowerContext : null);
      if(original && !original.__flprStandaloneBesiegedSelectionBridge){
        const bridged = function standaloneSyncChecksWorldFromTowerContextBesiegedBridge(){
          const target = standaloneBesiegedTarget();
          if(target){
            standaloneEnforceBesiegedTarget("blocked checks world sync", { save:true });
            return target.worldKey;
          }
          return original.apply(this, arguments);
        };
        bridged.__flprStandaloneBesiegedSelectionBridge = true;
        bridged.__flprStandaloneOriginalSyncChecksWorldFromTowerContext = original;
        window.syncChecksWorldFromTowerContext = bridged;
        try{ syncChecksWorldFromTowerContext = bridged; }catch(_){}
      }
      if(window.syncChecksWorldFromTowerContext || typeof syncChecksWorldFromTowerContext === "function") installedAny = true;
    }catch(_){}

    try{
      const original = window.syncNowPlayingIndexesToUnlockedTables || (typeof syncNowPlayingIndexesToUnlockedTables === "function" ? syncNowPlayingIndexesToUnlockedTables : null);
      if(original && !original.__flprStandaloneBesiegedSelectionBridge){
        let inBridge = false;
        const bridged = function standaloneSyncNowPlayingIndexesBesiegedBridge(opts){
          const target = standaloneBesiegedTarget();
          if(!target || inBridge) return original.apply(this, arguments);
          inBridge = true;
          let changed = false;
          try{
            changed = !!standaloneEnforceBesiegedTarget("blocked unlocked-table sync", { save: opts?.save !== false });
            if(opts && opts.render) standaloneRenderAfterBesiegedSelection();
            return changed;
          }finally{
            inBridge = false;
          }
        };
        bridged.__flprStandaloneBesiegedSelectionBridge = true;
        bridged.__flprStandaloneOriginalSyncNowPlayingIndexesToUnlockedTables = original;
        window.syncNowPlayingIndexesToUnlockedTables = bridged;
        try{ syncNowPlayingIndexesToUnlockedTables = bridged; }catch(_){}
      }
      if(window.syncNowPlayingIndexesToUnlockedTables || typeof syncNowPlayingIndexesToUnlockedTables === "function") installedAny = true;
    }catch(_){}

    try{
      const original = window.setWorldPage || (typeof setWorldPage === "function" ? setWorldPage : null);
      if(original && !original.__flprStandaloneBesiegedSelectionBridge){
        const bridged = function standaloneSetWorldPageBesiegedBridge(pageIdx, opts){
          const target = standaloneBesiegedTarget();
          if(target){
            standaloneEnforceBesiegedTarget("blocked world page switch", { save: opts?.save !== false });
            if(opts?.render !== false) standaloneRenderAfterBesiegedSelection();
            return false;
          }
          return original.apply(this, arguments);
        };
        bridged.__flprStandaloneBesiegedSelectionBridge = true;
        bridged.__flprStandaloneOriginalSetWorldPage = original;
        window.setWorldPage = bridged;
        try{ setWorldPage = bridged; }catch(_){}
      }
      if(window.setWorldPage || typeof setWorldPage === "function") installedAny = true;
    }catch(_){}

    try{
      const original = window.ensureBossTableSelectionForUnlock || (typeof ensureBossTableSelectionForUnlock === "function" ? ensureBossTableSelectionForUnlock : null);
      if(original && !original.__flprStandaloneBesiegedSelectionBridge){
        const bridged = function standaloneEnsureBossTableSelectionForUnlockBesiegedBridge(opts){
          const target = standaloneBesiegedTarget();
          if(target){
            const nextOpts = { ...(opts || {}), selectInTower:false, render:false };
            const result = original.call(this, nextOpts);
            standaloneEnforceBesiegedTarget("blocked boss selection", { save:true });
            if(opts && opts.render) standaloneRenderAfterBesiegedSelection();
            return result;
          }
          return original.apply(this, arguments);
        };
        bridged.__flprStandaloneBesiegedSelectionBridge = true;
        bridged.__flprStandaloneOriginalEnsureBossTableSelectionForUnlock = original;
        window.ensureBossTableSelectionForUnlock = bridged;
        try{ ensureBossTableSelectionForUnlock = bridged; }catch(_){}
      }
      if(window.ensureBossTableSelectionForUnlock || typeof ensureBossTableSelectionForUnlock === "function") installedAny = true;
    }catch(_){}

    try{
      const original = window.bossFocusVictoryChecksView || (typeof bossFocusVictoryChecksView === "function" ? bossFocusVictoryChecksView : null);
      if(original && !original.__flprStandaloneBesiegedSelectionBridge){
        const bridged = function standaloneBossFocusVictoryChecksViewBesiegedBridge(opts){
          const target = standaloneBesiegedTarget();
          if(target){
            standaloneEnforceBesiegedTarget("blocked boss focus", { save:true });
            try{ if(typeof showView === "function") showView("tower"); }catch(_){}
            if(opts && opts.render) standaloneRenderAfterBesiegedSelection();
            return false;
          }
          return original.apply(this, arguments);
        };
        bridged.__flprStandaloneBesiegedSelectionBridge = true;
        bridged.__flprStandaloneOriginalBossFocusVictoryChecksView = original;
        window.bossFocusVictoryChecksView = bridged;
        try{ bossFocusVictoryChecksView = bridged; }catch(_){}
      }
      if(window.bossFocusVictoryChecksView || typeof bossFocusVictoryChecksView === "function") installedAny = true;
    }catch(_){}

    try{
      window.flprStandaloneBesiegedSelectionBridgeState = function(){
        const target = standaloneBesiegedTarget();
        return {
          installed: true,
          active: !!target,
          target,
          selected: String(state?.selected || ""),
          currentWorld: String(ap?.currentWorld || ""),
          nowPlaying: target ? Number(state?.nowPlaying?.[target.worldKey]) : null
        };
      };
    }catch(_){}

    if(!installedAny) setTimeout(installStandaloneBesiegedSelectionBridge, 120);
  }

  const standaloneChecksSelection = {
    key: "",
    ts: 0,
    source: "",
    applying: false,
    timer: null,
    applyTimers: [],
    applyToken: 0,
    holdTimers: [],
    holdToken: 0,
    holdUntil: 0
  };
  const standaloneChecksWorldSelection = {
    key: "",
    ts: 0,
    source: "",
    applying: false,
    manualUntil: 0
  };
  const standaloneChecksRenderState = {
    lastSig: "",
    lastAt: 0,
    rendered: 0,
    skipped: 0
  };
  const standaloneNowPlayingGuard = {
    proxy: null,
    target: null
  };

  function standaloneParseTableKey(tableKey){
    const key = String(tableKey || "").trim();
    if(!key || key.startsWith("boss|")) return null;
    const parts = key.split("|");
    if(parts.length < 2) return null;
    const worldKey = String(parts[0] || "").trim();
    const idx = Number(parts[1]);
    if(!worldKey || !Number.isFinite(idx) || idx < 0) return null;
    return { key, worldKey, idx:Math.max(0, Math.round(idx)) };
  }

  function standaloneChecksViewActive(){
    try{ return String(activeView || "") === "checks"; }catch(_){}
    return false;
  }

  function standaloneChecksTableDisplayLevel(tableKey){
    const parsed = standaloneParseTableKey(tableKey);
    if(!parsed) return 0;
    try{
      if(typeof getDisplayBallStateForTableKey === "function"){
        const displayLevel = Number(getDisplayBallStateForTableKey(parsed.key)?.level || 0);
        if(displayLevel > 0) return displayLevel;
      }
    }catch(_){}
    try{
      if(typeof getBallLevelByTableKey === "function"){
        const baseLevel = Number(getBallLevelByTableKey(parsed.key) || 0);
        if(baseLevel > 0) return baseLevel;
      }
    }catch(_){}
    try{
      return (
        state?.balls?.[`${parsed.key}|3`] ? 3 :
        state?.balls?.[`${parsed.key}|2`] ? 2 :
        state?.balls?.[`${parsed.key}|1`] ? 1 : 0
      );
    }catch(_){}
    return 0;
  }

  function standaloneChecksTableRenderedOpen(tableKey){
    const parsed = standaloneParseTableKey(tableKey);
    if(!parsed) return false;
    try{
      const keyEsc = (typeof CSS !== "undefined" && CSS && CSS.escape) ? CSS.escape(parsed.key) : parsed.key;
      const block = document.querySelector(`#checksBody .tableBlock[data-tablekey="${keyEsc}"]`);
      return !!(block && !block.classList.contains("lockedTable"));
    }catch(_){}
    return false;
  }

  function standaloneRecordChecksSelectionTrace(event, data){
    try{
      const trace = Array.isArray(window.__flprStandaloneChecksSelectionTrace)
        ? window.__flprStandaloneChecksSelectionTrace
        : [];
      trace.push({
        event:String(event || ""),
        ts:Date.now(),
        ...(data && typeof data === "object" ? data : {})
      });
      window.__flprStandaloneChecksSelectionTrace = trace.slice(-80);
    }catch(_){}
  }

  function standaloneShouldBlockNowPlayingWrite(worldKey, nextIdx, source){
    try{
      if(!standaloneChecksViewActive()) return false;
      if(standaloneChecksSelection.applying || standaloneChecksWorldSelection.applying) return false;
      const wk = String(worldKey || "").trim();
      if(!wk || wk === "boss") return false;
      const parsed = standaloneParseTableKey(standaloneChecksSelection.key);
      if(!parsed || parsed.worldKey !== wk) return false;
      const pinned = standalonePinnedChecksTableKey();
      if(!pinned || pinned !== parsed.key) return false;
      const next = Math.max(0, Math.round(Number(nextIdx)));
      if(!Number.isFinite(next) || next === parsed.idx) return false;
      const renderedKey = (()=> {
        try{ return document.querySelector("#checksBody .tableBlock.nowPlayingChecks[data-tablekey]")?.getAttribute("data-tablekey") || ""; }catch(_){}
        return "";
      })();
      standaloneRecordChecksSelectionTrace("blocked-nowplaying-write", {
        worldKey:wk,
        requestedIdx:next,
        pinned:parsed.key,
        source:String(source || "direct"),
        renderedKey,
        currentWorld:String(ap?.currentWorld || ""),
        selected:String(state?.selected || "")
      });
      return true;
    }catch(_){}
    return false;
  }

  function standaloneEnsureNowPlayingGuard(reason){
    try{
      if(!state || typeof state !== "object") return false;
      const current = (state.nowPlaying && typeof state.nowPlaying === "object") ? state.nowPlaying : {};
      if(current === standaloneNowPlayingGuard.proxy) return true;
      if(current.__flprStandaloneNowPlayingGuardProxy === true) return true;
      const target = current.__flprStandaloneNowPlayingGuardTarget || current;
      const proxy = new Proxy(target, {
        set(obj, prop, value, receiver){
          if(typeof prop === "string" && standaloneShouldBlockNowPlayingWrite(prop, value, "proxy-set")){
            return true;
          }
          return Reflect.set(obj, prop, value, receiver);
        },
        defineProperty(obj, prop, descriptor){
          if(typeof prop === "string" && descriptor && Object.prototype.hasOwnProperty.call(descriptor, "value") && standaloneShouldBlockNowPlayingWrite(prop, descriptor.value, "proxy-define")){
            return true;
          }
          return Reflect.defineProperty(obj, prop, descriptor);
        }
      });
      try{ Object.defineProperty(proxy, "__flprStandaloneNowPlayingGuardProxy", { value:true, configurable:true }); }catch(_){}
      try{ Object.defineProperty(proxy, "__flprStandaloneNowPlayingGuardTarget", { value:target, configurable:true }); }catch(_){}
      standaloneNowPlayingGuard.proxy = proxy;
      standaloneNowPlayingGuard.target = target;
      state.nowPlaying = proxy;
      standaloneRecordChecksSelectionTrace("install-nowplaying-guard", { reason:String(reason || "") });
      return true;
    }catch(_){}
    return false;
  }

  function standaloneChecksTableSelectable(tableKey){
    const parsed = standaloneParseTableKey(tableKey);
    if(!parsed) return false;
    try{
      const world = state?.worlds?.[parsed.worldKey];
      if(!world || !Array.isArray(world.tables) || !world.tables[parsed.idx]) return false;
      if(standaloneChecksTableDisplayLevel(parsed.key) > 0) return true;
      return standaloneChecksTableRenderedOpen(parsed.key);
    }catch(_){}
    return false;
  }

  function standaloneChecksTableExists(tableKey){
    const parsed = standaloneParseTableKey(tableKey);
    if(!parsed) return false;
    try{
      const world = state?.worlds?.[parsed.worldKey];
      return !!(world && Array.isArray(world.tables) && world.tables[parsed.idx]);
    }catch(_){}
    return false;
  }

  function standaloneChecksWorldExists(worldKey){
    const wk = String(worldKey || "").trim();
    if(!wk) return false;
    try{
      if(wk === "boss"){
        if(typeof isBossUnlocked === "function" && !isBossUnlocked()) return false;
        return !!(state?.worlds?.boss || (typeof getBossWorldKey === "function" && state?.worlds?.[getBossWorldKey()]));
      }
      return !!state?.worlds?.[wk];
    }catch(_){}
    return false;
  }

  function standaloneClearChecksSelectionPin(reason){
    standaloneChecksSelection.key = "";
    standaloneChecksSelection.ts = 0;
    standaloneChecksSelection.source = String(reason || "");
    try{
      if(standaloneChecksSelection.timer) clearTimeout(standaloneChecksSelection.timer);
      standaloneChecksSelection.timer = null;
    }catch(_){}
    try{
      (standaloneChecksSelection.applyTimers || []).forEach((timer)=>clearTimeout(timer));
      standaloneChecksSelection.applyTimers = [];
      standaloneChecksSelection.applyToken += 1;
    }catch(_){}
    try{
      (standaloneChecksSelection.holdTimers || []).forEach((timer)=>clearTimeout(timer));
      standaloneChecksSelection.holdTimers = [];
      standaloneChecksSelection.holdToken += 1;
      standaloneChecksSelection.holdUntil = 0;
    }catch(_){}
  }

  function standaloneClearChecksWorldPin(reason){
    standaloneChecksWorldSelection.key = "";
    standaloneChecksWorldSelection.ts = 0;
    standaloneChecksWorldSelection.source = String(reason || "");
    standaloneChecksWorldSelection.manualUntil = 0;
  }

  function standaloneRememberChecksWorldSelection(worldKey, source){
    const wk = String(worldKey || "").trim();
    if(!wk || !standaloneChecksWorldExists(wk)) return false;
    const reason = String(source || "checks-world");
    standaloneChecksWorldSelection.key = wk;
    standaloneChecksWorldSelection.ts = Date.now();
    standaloneChecksWorldSelection.source = reason;
    if(/^checks-world-tab/i.test(reason)){
      standaloneChecksWorldSelection.manualUntil = Date.now() + 5200;
    }
    return true;
  }

  function standaloneRecentManualChecksWorldKey(){
    try{
      const wk = String(standaloneChecksWorldSelection.key || "").trim();
      if(!wk) return "";
      if(Number(standaloneChecksWorldSelection.manualUntil || 0) <= Date.now()) return "";
      if(!standaloneChecksWorldExists(wk)) return "";
      return wk;
    }catch(_){
      return "";
    }
  }

  function standalonePinnedChecksWorldKey(){
    const wk = String(standaloneChecksWorldSelection.key || "").trim();
    if(!wk) return "";
    try{
      if(
        wk !== "boss" &&
        standaloneChecksViewActive() &&
        String(ap?.currentWorld || "") === "boss" &&
        standaloneChecksWorldExists("boss")
      ){
        standaloneClearChecksSelectionPin("boss-world-current");
        standaloneClearChecksWorldPin("boss-world-current");
        return "";
      }
    }catch(_){}
    const manual = standaloneRecentManualChecksWorldKey();
    if(manual) return manual;
    if(standaloneBesiegedTarget()) return "";
    if(!standaloneChecksViewActive()){
      if(Date.now() - Number(standaloneChecksWorldSelection.ts || 0) > 1200){
        standaloneClearChecksWorldPin("left-checks");
        return "";
      }
      return wk;
    }
    if(!standaloneChecksWorldExists(wk)){
      standaloneClearChecksWorldPin("missing-world");
      return "";
    }
    if(Number(standaloneChecksWorldSelection.manualUntil || 0) > Date.now()){
      return wk;
    }
    return wk;
  }

  function standaloneEnforceChecksWorldSelection(reason, opts){
    opts = opts || {};
    const wk = standalonePinnedChecksWorldKey();
    if(!wk || standaloneChecksWorldSelection.applying) return false;
    let changed = false;
    standaloneChecksWorldSelection.applying = true;
    try{
      if(String(ap?.currentWorld || "") !== wk){
        ap.currentWorld = wk;
        changed = true;
      }
      if(opts.syncTowerSelection !== false && wk !== "boss" && state?.worlds?.[wk] && String(state?.selected || "") !== wk){
        state.lastSelected = state.selected;
        state.selected = wk;
        changed = true;
      }
      if(changed && opts.save !== false){
        try{ saveState(); }catch(_){}
      }
    }catch(_){
    }finally{
      standaloneChecksWorldSelection.applying = false;
    }
    return changed;
  }

  function standaloneClearChecksSelectionPinForWorldSwitch(worldKey, reason){
    const wk = String(worldKey || "").trim();
    if(!wk) return false;
    standaloneRememberChecksWorldSelection(wk, reason || "checks-world-switch");
    const pinned = standaloneParseTableKey(standaloneChecksSelection.key);
    if(pinned && pinned.worldKey === wk) return false;
    standaloneClearChecksSelectionPin(reason || "checks-world-switch");
    try{
      window.__flprStandaloneLastChecksWorldSwitch = {
        worldKey:wk,
        reason:String(reason || "checks-world-switch"),
        ts:Date.now()
      };
    }catch(_){}
    return true;
  }

  function standalonePinnedChecksTableKey(){
    const key = String(standaloneChecksSelection.key || "").trim();
    if(!key) return "";
    if(standaloneBesiegedTarget()) return "";
    const pinnedWorld = standalonePinnedChecksWorldKey();
    const parsedKey = standaloneParseTableKey(key);
    if(pinnedWorld && parsedKey && parsedKey.worldKey !== pinnedWorld){
      standaloneClearChecksSelectionPin("world-pin-mismatch");
      return "";
    }
    if(!standaloneChecksViewActive()){
      if(Date.now() - Number(standaloneChecksSelection.ts || 0) > 1200){
        standaloneClearChecksSelectionPin("left-checks");
        return "";
      }
      return key;
    }
    if(!standaloneChecksTableSelectable(key)){
      if(standaloneChecksTableExists(key) && (Date.now() - Number(standaloneChecksSelection.ts || 0)) < 9000){
        return key;
      }
      standaloneClearChecksSelectionPin("unselectable");
      return "";
    }
    return key;
  }

  function standaloneRememberChecksSelection(tableKey, source){
    const parsed = standaloneParseTableKey(tableKey);
    if(!parsed || !standaloneChecksTableSelectable(parsed.key)) return false;
    standaloneChecksSelection.key = parsed.key;
    standaloneChecksSelection.ts = Date.now();
    standaloneChecksSelection.source = String(source || "checks-click");
    standaloneRememberChecksWorldSelection(parsed.worldKey, source || "checks-click");
    standaloneScheduleChecksSelectionApply("pin");
    return true;
  }

  function standalonePrimeChecksSelectionFromRenderedTable(tableKey, source){
    const parsed = standaloneParseTableKey(tableKey);
    if(!parsed || !standaloneChecksTableExists(parsed.key)) return false;
    if(!standaloneChecksTableSelectable(parsed.key) && !standaloneChecksTableRenderedOpen(parsed.key)) return false;
    standaloneChecksSelection.key = parsed.key;
    standaloneChecksSelection.ts = Date.now();
    standaloneChecksSelection.source = String(source || "checks-table");
    standaloneRememberChecksWorldSelection(parsed.worldKey, source || "checks-table");
    try{ standaloneEnforceChecksSelectionPin(source || "checks-table", { save:false }); }catch(_){}
    try{ standaloneDirectChecksHighlightPinned(); }catch(_){}
    standaloneScheduleChecksSelectionHold(source || "checks-table", 14000);
    try{
      window.__flprStandaloneLastChecksTablePrime = {
        key: parsed.key,
        source: String(source || "checks-table"),
        displayLevel: standaloneChecksTableDisplayLevel(parsed.key),
        renderedOpen: standaloneChecksTableRenderedOpen(parsed.key),
        ts: Date.now()
      };
    }catch(_){}
    return true;
  }

  function standaloneCandidateFromTowerSelection(){
    try{
      const wk = String(state?.selected || "").trim();
      if(!wk || wk === "boss" || !state?.worlds?.[wk]) return "";
      const tables = Array.isArray(state?.worlds?.[wk]?.tables) ? state.worlds[wk].tables : [];
      if(!tables.length) return "";
      const idxRaw = (typeof getNowPlayingIndex === "function") ? Number(getNowPlayingIndex(wk)) : Number(state?.nowPlaying?.[wk]);
      const idx = Math.max(0, Math.min(tables.length - 1, Number.isFinite(idxRaw) ? Math.round(idxRaw) : 0));
      return standaloneParseTableKey(`${wk}|${idx}`)?.key || "";
    }catch(_){}
    return "";
  }

  function standaloneAdoptRenderedChecksSelection(reason, opts){
    opts = opts || {};
    if(!standaloneChecksViewActive()) return "";
    if(!opts.force){
      const existing = standalonePinnedChecksTableKey();
      if(existing) return existing;
    }
    try{
      const active = document.querySelector("#checksBody .tableBlock.nowPlayingChecks[data-tablekey]");
      const key = String(active?.getAttribute?.("data-tablekey") || "").trim();
      const parsed = standaloneParseTableKey(key);
      if(!parsed || active?.classList?.contains("lockedTable")) return "";
      const pinnedWorld = standalonePinnedChecksWorldKey();
      if(pinnedWorld && parsed.worldKey !== pinnedWorld && opts.allowCrossWorld !== true){
        standaloneRecordChecksSelectionTrace("skip-adopt-rendered-world-mismatch", {
          key: parsed.key,
          pinnedWorld,
          reason:String(reason || "")
        });
        return "";
      }
      if(!standaloneChecksTableSelectable(parsed.key) && !standaloneChecksTableRenderedOpen(parsed.key)) return "";
      standaloneChecksSelection.key = parsed.key;
      standaloneChecksSelection.ts = Date.now();
      standaloneChecksSelection.source = String(reason || "rendered-active");
      standaloneRememberChecksWorldSelection(parsed.worldKey, reason || "rendered-active");
      standaloneRecordChecksSelectionTrace("adopt-rendered", {
        key: parsed.key,
        reason:String(reason || ""),
        displayLevel:standaloneChecksTableDisplayLevel(parsed.key),
        renderedOpen:standaloneChecksTableRenderedOpen(parsed.key),
        nowPlaying:Number(state?.nowPlaying?.[parsed.worldKey])
      });
      return parsed.key;
    }catch(_){}
    return "";
  }

  function standalonePrimeChecksSelectionFromTower(reason){
    const key = standaloneCandidateFromTowerSelection();
    const parsed = standaloneParseTableKey(key);
    if(!parsed || !standaloneChecksTableExists(parsed.key)) return "";
    standaloneChecksSelection.key = parsed.key;
    standaloneChecksSelection.ts = Date.now();
    standaloneChecksSelection.source = String(reason || "tower-selection");
    standaloneRememberChecksWorldSelection(parsed.worldKey, reason || "tower-selection");
    standaloneRecordChecksSelectionTrace("prime-tower", {
      key: parsed.key,
      reason:String(reason || ""),
      displayLevel:standaloneChecksTableDisplayLevel(parsed.key),
      nowPlaying:Number(state?.nowPlaying?.[parsed.worldKey])
    });
    return parsed.key;
  }

  function standaloneCurrentChecksSelectionCandidate(){
    try{
      const active = document.querySelector("#checksBody .tableBlock.nowPlayingChecks")?.getAttribute("data-tablekey") || "";
      if(standaloneParseTableKey(active)) return active;
    }catch(_){}
    try{
      if(typeof getChecksNowPlayingTableKey === "function"){
        const key = String(getChecksNowPlayingTableKey() || "").trim();
        if(standaloneParseTableKey(key)) return key;
      }
    }catch(_){}
    try{
      const wk = String(ap?.currentWorld || "").trim();
      const idx = Number(state?.nowPlaying?.[wk]);
      const key = standaloneBesiegedKeyFromArgs(wk, idx);
      if(standaloneParseTableKey(key)) return key;
    }catch(_){}
    return "";
  }

  function standaloneChecksRenderSignature(){
    try{
      const wk = String(ap?.currentWorld || "");
      const selected = String(state?.selected || "");
      const world = wk === "boss" && !state?.worlds?.[wk]
        ? state?.worlds?.[(typeof getBossWorldKey === "function" ? getBossWorldKey() : "boss")]
        : state?.worlds?.[wk];
      const tables = Array.isArray(world?.tables) ? world.tables : [];
      const tableSig = tables.map((name, idx)=>{
        const tableKey = `${wk}|${idx}`;
        const ballSig = [1, 2, 3].map((ball)=> state?.balls?.[`${tableKey}|${ball}`] ? "1" : "0").join("");
        let locCount = 0;
        try{
          const mapKey = typeof canonicalTableMapKey === "function" ? canonicalTableMapKey(name) : String(name || "");
          locCount = Number(ap?.locsByTableKey?.get?.(mapKey)?.length || 0);
        }catch(_){}
        const displaySig = (()=> {
          try{
            const display = typeof getDisplayBallStateForTableKey === "function" ? getDisplayBallStateForTableKey(tableKey) : null;
            if(display && typeof display === "object"){
              return [
                display.b1 ? 1 : 0,
                display.b2 ? 1 : 0,
                display.b3 ? 1 : 0,
                display.b1Eb ? 1 : 0,
                display.b2Eb ? 1 : 0,
                display.b3Eb ? 1 : 0,
                Number(display.level || 0)
              ].join("");
            }
          }catch(_){}
          return "";
        })();
        return `${idx}:${String(name || "")}:${ballSig}:${displaySig}:${locCount}`;
      }).join(";");
      const checkedSig = (()=> {
        try{ return Array.from(ap?.checked || []).map(Number).filter(Number.isFinite).sort((a,b)=>a-b).join(","); }catch(_){}
        return "";
      })();
      const pendingSig = (()=> {
        try{ return Array.from(ap?.pendingByLoc?.keys?.() || []).map(Number).filter(Number.isFinite).sort((a,b)=>a-b).join(","); }catch(_){}
        return "";
      })();
      const hintSig = (()=> {
        try{
          if(typeof relicGetCombinedHintTargets !== "function") return "";
          return relicGetCombinedHintTargets().map((target)=>[
            target?.tableKey || "",
            target?.locationName || target?.locName || "",
            target?.typeLabel || ""
          ].join(":")).sort().join(",");
        }catch(_){}
        return "";
      })();
      const lockSig = [
        (()=>{ try{ return isTrapCheckLockActive() ? "trap" : ""; }catch(_){ return ""; } })(),
        (()=>{ try{ return isBossPhase2RedeemPauseActive() ? "phase2" : ""; }catch(_){ return ""; } })(),
        (()=>{ try{ return isBossUnlocked() ? "boss-open" : "boss-closed"; }catch(_){ return ""; } })()
      ].join(",");
      return [
        String(activeView || ""),
        wk,
        selected,
        String(state?.worldPage ?? ""),
        String(state?.nowPlaying?.[wk] ?? ""),
        tableSig,
        checkedSig,
        pendingSig,
        hintSig,
        lockSig
      ].join("||");
    }catch(_){}
    return "";
  }

  function standaloneChecksBodyMatchesWorld(worldKey){
    try{
      const wk = String(worldKey || "");
      const body = document.getElementById("checksBody");
      if(!body || body.__checksSwapAnimating) return false;
      const blocks = Array.from(body.querySelectorAll(".tableBlock[data-tablekey]"));
      if(!blocks.length) return false;
      if(wk === "boss") return blocks.some((block)=>String(block.getAttribute("data-tablekey") || "").startsWith("boss|"));
      return blocks.every((block)=>String(block.getAttribute("data-tablekey") || "").startsWith(`${wk}|`));
    }catch(_){}
    return false;
  }

  function standalonePreserveChecksSelectionDuring(fn, reason){
    const pinnedWorld = standalonePinnedChecksWorldKey();
    const candidate = standaloneCurrentChecksSelectionCandidate();
    const parsedCandidate = standaloneParseTableKey(candidate);
    const key = standalonePinnedChecksTableKey()
      || (parsedCandidate && (!pinnedWorld || parsedCandidate.worldKey === pinnedWorld) ? parsedCandidate.key : "");
    if(pinnedWorld){
      standaloneRememberChecksWorldSelection(pinnedWorld, reason || "preserve-world");
      standaloneEnforceChecksWorldSelection(reason || "preserve-world", { save:false });
    }
    if(key && standaloneChecksTableExists(key)){
      standaloneChecksSelection.key = key;
      standaloneChecksSelection.ts = Date.now();
      standaloneChecksSelection.source = String(reason || "preserve");
    }
    let result;
    try{
      result = fn();
    }finally{
      if(pinnedWorld){
        standaloneRememberChecksWorldSelection(pinnedWorld, reason || "preserve-world");
        try{ standaloneEnforceChecksWorldSelection(reason || "preserve-world", { save:false }); }catch(_){}
      }
      if(key && standaloneChecksTableExists(key)){
        standaloneChecksSelection.key = key;
        standaloneChecksSelection.ts = Date.now();
        standaloneChecksSelection.source = String(reason || "preserve");
        try{ standaloneEnforceChecksSelectionPin(reason || "preserve", { save:false }); }catch(_){}
        try{ standaloneScheduleChecksSelectionApply(reason || "preserve"); }catch(_){}
      }
    }
    return result;
  }

  function standaloneEnforceChecksSelectionPin(reason, opts){
    opts = opts || {};
    const parsed = standaloneParseTableKey(standalonePinnedChecksTableKey());
    if(!parsed || standaloneChecksSelection.applying) return false;
    let changed = false;
    standaloneChecksSelection.applying = true;
    try{
      state.nowPlaying = state.nowPlaying || {};
      if(Number(state.nowPlaying[parsed.worldKey]) !== parsed.idx){
        state.nowPlaying[parsed.worldKey] = parsed.idx;
        changed = true;
      }
      try{
        if(String(ap?.currentWorld || "") !== parsed.worldKey){
          ap.currentWorld = parsed.worldKey;
          changed = true;
        }
      }catch(_){}
      try{
        if(opts.syncTowerSelection && String(state?.selected || "") !== parsed.worldKey){
          state.lastSelected = state.selected;
          state.selected = parsed.worldKey;
          changed = true;
        }
      }catch(_){}
      if(changed && opts.save !== false){
        try{ saveState(); }catch(_){}
      }
    }catch(_){
    }finally{
      standaloneChecksSelection.applying = false;
    }
    return changed;
  }

  function standaloneRestoreCapturedChecksSelection(tableKey, reason, opts){
    opts = opts || {};
    const parsed = standaloneParseTableKey(tableKey);
    if(!parsed || !standaloneChecksTableExists(parsed.key)) return false;
    if(standaloneBesiegedTarget()) return false;
    let changed = false;
    const prevSelectionApplying = !!standaloneChecksSelection.applying;
    const prevWorldApplying = !!standaloneChecksWorldSelection.applying;
    standaloneChecksSelection.applying = true;
    standaloneChecksWorldSelection.applying = true;
    try{
      standaloneChecksSelection.key = parsed.key;
      standaloneChecksSelection.ts = Date.now();
      standaloneChecksSelection.source = String(reason || "restore-captured");
      standaloneChecksWorldSelection.key = parsed.worldKey;
      standaloneChecksWorldSelection.ts = Date.now();
      standaloneChecksWorldSelection.source = String(reason || "restore-captured");
      state.nowPlaying = state.nowPlaying || {};
      if(Number(state.nowPlaying[parsed.worldKey]) !== parsed.idx){
        state.nowPlaying[parsed.worldKey] = parsed.idx;
        changed = true;
      }
      try{
        if(String(ap?.currentWorld || "") !== parsed.worldKey){
          ap.currentWorld = parsed.worldKey;
          changed = true;
        }
      }catch(_){}
      try{
        if(opts.syncTowerSelection !== false && parsed.worldKey !== "boss" && state?.worlds?.[parsed.worldKey] && String(state?.selected || "") !== parsed.worldKey){
          state.lastSelected = state.selected;
          state.selected = parsed.worldKey;
          changed = true;
        }
      }catch(_){}
      if(changed && opts.save !== false){
        try{ saveState(); }catch(_){}
      }
    }catch(_){
    }finally{
      standaloneChecksSelection.applying = prevSelectionApplying;
      standaloneChecksWorldSelection.applying = prevWorldApplying;
    }
    return changed;
  }

  function standaloneDirectChecksHighlightPinned(){
    const key = standalonePinnedChecksTableKey();
    if(!key) return false;
    try{
      const body = document.getElementById("checksBody");
      try{ standaloneCancelChecksSwapAnimation(); }catch(_){}
      if(!body) return false;
      const keyEsc = (typeof CSS !== "undefined" && CSS && CSS.escape) ? CSS.escape(key) : key;
      const target = body.querySelector(`.tableBlock[data-tablekey="${keyEsc}"]`);
      if(!target || target.classList.contains("lockedTable")) return false;
      body.querySelectorAll(".tableBlock.nowPlayingChecks").forEach((el)=>el.classList.remove("nowPlayingChecks"));
      target.classList.add("nowPlayingChecks");
      return true;
    }catch(_){}
    return false;
  }

  function standaloneCancelChecksSwapAnimation(){
    try{
      document.querySelectorAll(".checksSwapGhost").forEach((node)=>{
        try{ node.remove(); }catch(_){}
      });
      const body = document.getElementById("checksBody");
      if(body){
        body.__checksSwapAnimating = false;
        body.classList.remove("checksDrawerAnim");
        body.querySelectorAll(".checksDrawerClosing, .checksDrawerClosed, .checksDrawerOpening, .checksDrawerReady, .checksSwapIn").forEach((el)=>{
          try{
            el.classList.remove("checksDrawerClosing", "checksDrawerClosed", "checksDrawerOpening", "checksDrawerReady", "checksSwapIn");
            el.style.removeProperty("height");
            el.style.removeProperty("min-height");
            el.style.removeProperty("transition");
            el.style.removeProperty("opacity");
          }catch(_){}
        });
      }
    }catch(_){}
  }

  function standaloneScheduleChecksSelectionApply(reason){
    try{
      if(standaloneChecksSelection.timer) clearTimeout(standaloneChecksSelection.timer);
      standaloneChecksSelection.timer = null;
    }catch(_){}
    try{
      (standaloneChecksSelection.applyTimers || []).forEach((timer)=>clearTimeout(timer));
      standaloneChecksSelection.applyTimers = [];
    }catch(_){}
    const token = Number(standaloneChecksSelection.applyToken || 0) + 1;
    standaloneChecksSelection.applyToken = token;
    const applySoon = (delay)=>{
      const timer = setTimeout(()=>{
        if(Number(standaloneChecksSelection.applyToken || 0) !== token) return;
        try{
          standaloneEnforceChecksSelectionPin(reason, { save:false });
          standaloneDirectChecksHighlightPinned();
        }catch(_){}
      }, delay);
      standaloneChecksSelection.applyTimers.push(timer);
    };
    [0, 60, 220, 520, 940, 1260].forEach(applySoon);
    try{
      window.__flprStandaloneChecksSelectionSchedulerStats = {
        ...(window.__flprStandaloneChecksSelectionSchedulerStats || {}),
        applyToken: token,
        applyTimers: standaloneChecksSelection.applyTimers.length,
        lastApplyReason: String(reason || ""),
        lastApplyAt: Date.now()
      };
    }catch(_){}
  }

  function standaloneScheduleChecksSelectionHold(reason, durationMs){
    const ms = Math.max(0, Number(durationMs || 0) || 0);
    const now = Date.now();
    const until = now + ms;
    if(Number(standaloneChecksSelection.holdUntil || 0) >= until - 80){
      try{
        window.__flprStandaloneChecksSelectionSchedulerStats = {
          ...(window.__flprStandaloneChecksSelectionSchedulerStats || {}),
          skippedHoldReason: String(reason || ""),
          skippedHoldAt: now
        };
      }catch(_){}
      return;
    }
    try{
      (standaloneChecksSelection.holdTimers || []).forEach((timer)=>clearTimeout(timer));
      standaloneChecksSelection.holdTimers = [];
    }catch(_){}
    const token = Number(standaloneChecksSelection.holdToken || 0) + 1;
    standaloneChecksSelection.holdToken = token;
    standaloneChecksSelection.holdUntil = until;
    const delays = [0, 60, 220, 520, 940, 1260];
    if(ms > 1400){
      delays.push(Math.max(0, ms - 700), Math.max(0, ms - 120), ms + 180, ms + 760, ms + 1420);
    }
    Array.from(new Set(delays.map((delay)=>Math.max(0, Math.round(delay))))).sort((a, b)=>a-b).forEach((delay)=>{
      const timer = setTimeout(()=>{
        if(Number(standaloneChecksSelection.holdToken || 0) !== token) return;
        try{
          standaloneEnforceChecksWorldSelection(reason || "hold", { save:false });
          standaloneEnforceChecksSelectionPin(reason || "hold", { save:false });
          standaloneDirectChecksHighlightPinned();
          standaloneGuardChecksNodeInteractions();
        }catch(_){}
      }, delay);
      standaloneChecksSelection.holdTimers.push(timer);
    });
    try{
      window.__flprStandaloneChecksSelectionSchedulerStats = {
        ...(window.__flprStandaloneChecksSelectionSchedulerStats || {}),
        holdToken: token,
        holdTimers: standaloneChecksSelection.holdTimers.length,
        holdUntil: standaloneChecksSelection.holdUntil,
        lastHoldReason: String(reason || ""),
        lastHoldAt: now
      };
    }catch(_){}
  }

  function standaloneReassertChecksWorldPin(reason, opts){
    opts = opts || {};
    const wk = standalonePinnedChecksWorldKey() || standaloneRecentManualChecksWorldKey();
    if(!wk) return "";
    standaloneRememberChecksWorldSelection(wk, reason || "world-pin");
    standaloneEnforceChecksWorldSelection(reason || "world-pin", {
      save: opts.save !== false,
      syncTowerSelection: opts.syncTowerSelection !== false
    });
    try{ if(standaloneChecksViewActive() && opts.renderTabs) renderChecksWorldTabs(); }catch(_){}
    return wk;
  }

  function standaloneGuardChecksNodeInteractions(){
    try{
      const body = document.getElementById("checksBody");
      if(!body) return;
      body.querySelectorAll(".nodeCell, .nodeCounterBar").forEach((node)=>{
        if(node.__flprStandaloneNodeGuardBound) return;
        node.__flprStandaloneNodeGuardBound = true;
        const guard = (event)=>{
          try{
            const block = event?.target?.closest?.(".tableBlock[data-tablekey]");
            const key = String(block?.getAttribute?.("data-tablekey") || "").trim();
            if(key && !block.classList.contains("lockedTable")){
              standaloneRememberChecksSelection(key, "node-interaction");
              standaloneScheduleChecksSelectionHold("node-interaction", 1800);
            }
            event.stopPropagation();
          }catch(_){}
        };
        node.addEventListener("pointerdown", guard, false);
        node.addEventListener("mousedown", guard, false);
        node.addEventListener("click", guard, false);
      });
    }catch(_){}
  }

  function installStandaloneChecksSelectionBridge(){
    let installedAny = false;
    try{ standaloneEnsureNowPlayingGuard("checks-selection-install"); }catch(_){}

    try{
      if(!window.__flprStandaloneChecksWorldTabPinClearBound){
        window.__flprStandaloneChecksWorldTabPinClearBound = true;
        document.addEventListener("pointerdown", (event)=>{
          try{
            const tab = event.target?.closest?.("#checksWorldTabs .wTab[data-world-tab]");
            if(!tab || tab.disabled) return;
            const wk = String(tab.dataset.worldTab || "").trim();
            if(wk && wk !== String(ap?.currentWorld || "")){
              standaloneClearChecksSelectionPinForWorldSwitch(wk, "checks-world-tab-pointer");
            }
          }catch(_){}
        }, true);
        document.addEventListener("click", (event)=>{
          try{
            const tab = event.target?.closest?.("#checksWorldTabs .wTab[data-world-tab]");
            if(!tab || tab.disabled) return;
            const wk = String(tab.dataset.worldTab || "").trim();
            if(wk && wk !== String(ap?.currentWorld || "")){
              standaloneClearChecksSelectionPinForWorldSwitch(wk, "checks-world-tab-click");
            }
          }catch(_){}
        }, true);
      }
    }catch(_){}

    try{
      if(!window.__flprStandaloneChecksTablePrimeBound){
        window.__flprStandaloneChecksTablePrimeBound = true;
        const primeFromEvent = (event, source)=>{
          try{
            const target = event?.target;
            const block = target?.closest?.("#checksBody .tableBlock[data-tablekey]");
            if(!block || block.classList.contains("lockedTable")) return;
            if(target?.closest?.(".extraBallTableBtn")) return;
            const key = String(block.getAttribute("data-tablekey") || "").trim();
            if(!key) return;
            standalonePrimeChecksSelectionFromRenderedTable(key, source);
          }catch(_){}
        };
        document.addEventListener("pointerdown", (event)=>primeFromEvent(event, "checks-table-pointer"), true);
        document.addEventListener("mousedown", (event)=>primeFromEvent(event, "checks-table-mouse"), true);
        document.addEventListener("click", (event)=>primeFromEvent(event, "checks-table-click"), true);
      }
    }catch(_){}

    try{
      const original = window.syncChecksWorldFromTowerContext || (typeof syncChecksWorldFromTowerContext === "function" ? syncChecksWorldFromTowerContext : null);
      if(original && !original.__flprStandaloneChecksSelectionBridge){
        const bridged = function standaloneSyncChecksWorldFromTowerContextChecksBridge(){
          standaloneEnsureNowPlayingGuard("pre-checks-world-context");
          standaloneAdoptRenderedChecksSelection("pre-checks-world-context-adopt");
          const pinned = standalonePinnedChecksWorldKey() || standaloneRecentManualChecksWorldKey();
          if(pinned && !standaloneChecksWorldSelection.applying){
            standaloneReassertChecksWorldPin("blocked-checks-world-context", { save:false, syncTowerSelection:true });
            return pinned;
          }
          const result = original.apply(this, arguments);
          standaloneReassertChecksWorldPin("post-checks-world-context", { save:false, syncTowerSelection:true });
          return standalonePinnedChecksWorldKey() || result;
        };
        bridged.__flprStandaloneChecksSelectionBridge = true;
        bridged.__flprStandaloneOriginalSyncChecksWorldFromTowerContext = original;
        window.syncChecksWorldFromTowerContext = bridged;
        try{ syncChecksWorldFromTowerContext = bridged; }catch(_){}
      }
      if(window.syncChecksWorldFromTowerContext || typeof syncChecksWorldFromTowerContext === "function") installedAny = true;
    }catch(_){}

    try{
      const original = window.syncTowerSelectionToWorld || (typeof syncTowerSelectionToWorld === "function" ? syncTowerSelectionToWorld : null);
      if(original && !original.__flprStandaloneChecksSelectionBridge){
        const bridged = function standaloneSyncTowerSelectionToWorldChecksBridge(worldKey){
          const requested = String(worldKey || "").trim();
          const manualPinned = standaloneRecentManualChecksWorldKey();
          const pinned = standalonePinnedChecksWorldKey() || manualPinned;
          const shouldHonorChecksTabPin = standaloneChecksViewActive() || !!manualPinned;
          if(pinned && requested && requested !== pinned && shouldHonorChecksTabPin && !standaloneChecksWorldSelection.applying){
            standaloneReassertChecksWorldPin(`blocked-tower-world-sync:${requested}`, { save:true, syncTowerSelection:true });
            return pinned;
          }
          const result = original.apply(this, arguments);
          standaloneReassertChecksWorldPin("post-tower-world-sync", { save:false, syncTowerSelection:true });
          return result;
        };
        bridged.__flprStandaloneChecksSelectionBridge = true;
        bridged.__flprStandaloneOriginalSyncTowerSelectionToWorld = original;
        window.syncTowerSelectionToWorld = bridged;
        try{ syncTowerSelectionToWorld = bridged; }catch(_){}
      }
      if(window.syncTowerSelectionToWorld || typeof syncTowerSelectionToWorld === "function") installedAny = true;
    }catch(_){}

    try{
      const original = window.syncTowerSelectionToBossWorld || (typeof syncTowerSelectionToBossWorld === "function" ? syncTowerSelectionToBossWorld : null);
      if(original && !original.__flprStandaloneChecksSelectionBridge){
        const bridged = function standaloneSyncTowerSelectionToBossWorldChecksBridge(){
          const pinned = standalonePinnedChecksWorldKey() || standaloneRecentManualChecksWorldKey();
          if(pinned && pinned !== "boss" && String(ap?.currentWorld || "") !== "boss" && standaloneChecksViewActive() && !standaloneChecksWorldSelection.applying){
            standaloneReassertChecksWorldPin("blocked-boss-world-sync", { save:true, syncTowerSelection:true });
            return pinned;
          }
          const result = original.apply(this, arguments);
          standaloneReassertChecksWorldPin("post-boss-world-sync", { save:false, syncTowerSelection:true });
          return result;
        };
        bridged.__flprStandaloneChecksSelectionBridge = true;
        bridged.__flprStandaloneOriginalSyncTowerSelectionToBossWorld = original;
        window.syncTowerSelectionToBossWorld = bridged;
        try{ syncTowerSelectionToBossWorld = bridged; }catch(_){}
      }
      if(window.syncTowerSelectionToBossWorld || typeof syncTowerSelectionToBossWorld === "function") installedAny = true;
    }catch(_){}

    try{
      const original = window.showView || (typeof showView === "function" ? showView : null);
      if(original && !original.__flprStandaloneChecksSelectionBridge){
        const bridged = function standaloneShowViewChecksSelectionBridge(next, opts){
          const targetView = String(next || "");
          if(targetView === "checks"){
            standalonePrimeChecksSelectionFromTower("show-checks-before");
          }
          const result = original.apply(this, arguments);
          if(targetView === "checks"){
            standaloneAdoptRenderedChecksSelection("show-checks-after", { force:false });
            try{ standaloneEnforceChecksWorldSelection("show-checks-after-world", { save:false }); }catch(_){}
            try{ standaloneEnforceChecksSelectionPin("show-checks-after", { save:false }); }catch(_){}
            try{ standaloneScheduleChecksSelectionApply("show-checks-after"); }catch(_){}
          }
          return result;
        };
        bridged.__flprStandaloneChecksSelectionBridge = true;
        bridged.__flprStandaloneOriginalShowView = original;
        window.showView = bridged;
        try{ showView = bridged; }catch(_){}
      }
      if(window.showView || typeof showView === "function") installedAny = true;
    }catch(_){}

    try{
      const original = window.animateChecksSwapCards || (typeof animateChecksSwapCards === "function" ? animateChecksSwapCards : null);
      if(original && !original.__flprStandaloneChecksSelectionBridge){
        const bridged = function standaloneAnimateChecksSwapCardsBridge(){
          try{ standaloneCancelChecksSwapAnimation(); }catch(_){}
          return false;
        };
        bridged.__flprStandaloneChecksSelectionBridge = true;
        bridged.__flprStandaloneOriginalAnimateChecksSwapCards = original;
        window.animateChecksSwapCards = bridged;
        try{ animateChecksSwapCards = bridged; }catch(_){}
      }
      if(window.animateChecksSwapCards || typeof animateChecksSwapCards === "function") installedAny = true;
    }catch(_){}

    try{
      const original = window.setNowPlayingFromTableKey || (typeof setNowPlayingFromTableKey === "function" ? setNowPlayingFromTableKey : null);
      if(original && !original.__flprStandaloneChecksSelectionBridge){
        const bridged = function standaloneSetNowPlayingFromTableKeyChecksBridge(tableKey, opts){
          standaloneEnsureNowPlayingGuard("set-table-key");
          opts = opts || {};
          const key = String(tableKey || "").trim();
          const source = String(opts.source || "");
          const fromChecks = source === "checks-click" || source === "checks-table-pointer" || source === "checks-table-click";
          if(!fromChecks && standaloneChecksSelection.key && key && key !== standaloneChecksSelection.key && !standaloneChecksSelection.applying){
            if(standaloneChecksViewActive() && standalonePinnedChecksTableKey()){
              standaloneRecordChecksSelectionTrace("blocked-table-key", {
                requested:key,
                pinned:standaloneChecksSelection.key,
                source:source || "external"
              });
              standaloneEnforceChecksSelectionPin(`blocked-table-key:${source || "external"}`, { save:true });
              standaloneScheduleChecksSelectionApply("blocked-table-key");
              return false;
            }
            standaloneClearChecksSelectionPin(`external:${source || "table-key"}`);
          }
          const callOpts = (fromChecks && key && standaloneChecksTableSelectable(key) && opts.allowLocked !== true)
            ? { ...opts, allowLocked:true }
            : opts;
          const result = original.call(this, tableKey, callOpts);
          if(result !== false && fromChecks && !standaloneBesiegedTarget()){
            standaloneRememberChecksSelection(key, source || "checks-click");
            standaloneEnforceChecksSelectionPin("table-key", { save:true, syncTowerSelection:true });
            standaloneScheduleChecksSelectionApply("table-key");
          }
          return result;
        };
        bridged.__flprStandaloneChecksSelectionBridge = true;
        bridged.__flprStandaloneOriginalSetNowPlayingFromTableKey = original;
        window.setNowPlayingFromTableKey = bridged;
        try{ setNowPlayingFromTableKey = bridged; }catch(_){}
      }
      if(window.setNowPlayingFromTableKey || typeof setNowPlayingFromTableKey === "function") installedAny = true;
    }catch(_){}

    try{
      const original = window.setNowPlayingIndex || (typeof setNowPlayingIndex === "function" ? setNowPlayingIndex : null);
      if(original && !original.__flprStandaloneChecksSelectionBridge){
        const bridged = function standaloneSetNowPlayingIndexChecksBridge(worldKey, idx, opts){
          standaloneEnsureNowPlayingGuard("set-index");
          opts = opts || {};
          const key = standaloneBesiegedKeyFromArgs(worldKey, idx);
          const source = String(opts.source || "");
          const fromChecks = source === "checks-click" || source === "checks-table-pointer" || source === "checks-table-click" || source === "standalone-checks-pin";
          const fromOverview = source === "overview-click";
          if(!fromChecks && standaloneChecksSelection.key && key && key !== standaloneChecksSelection.key && !standaloneChecksSelection.applying){
            if(standaloneChecksViewActive() && standalonePinnedChecksTableKey()){
              standaloneRecordChecksSelectionTrace("blocked-index", {
                requested:key,
                pinned:standaloneChecksSelection.key,
                source:source || "external"
              });
              standaloneEnforceChecksSelectionPin(`blocked-index:${source || "external"}`, { save:true });
              standaloneScheduleChecksSelectionApply("blocked-index");
              return false;
            }
            standaloneClearChecksSelectionPin(`external:${source || "index"}`);
            if(fromOverview) standaloneClearChecksWorldPin("external:overview-click");
          }
          const result = original.apply(this, arguments);
          if(result !== false && fromOverview && !standaloneBesiegedTarget()){
            standaloneRememberChecksWorldSelection(String(worldKey || ""), "overview-click");
            standaloneChecksSelection.key = key;
            standaloneChecksSelection.ts = Date.now();
            standaloneChecksSelection.source = "overview-click";
            try{
              if(String(ap?.currentWorld || "") !== String(worldKey || "")){
                ap.currentWorld = String(worldKey || "");
              }
            }catch(_){}
            standaloneScheduleChecksSelectionHold("overview-click", 3600);
          }
          if(result !== false && fromChecks && !standaloneBesiegedTarget()){
            standaloneRememberChecksSelection(key, source || "checks-click");
            standaloneEnforceChecksSelectionPin("index", { save:true });
            standaloneScheduleChecksSelectionApply("index");
          }
          return result;
        };
        bridged.__flprStandaloneChecksSelectionBridge = true;
        bridged.__flprStandaloneOriginalSetNowPlayingIndex = original;
        window.setNowPlayingIndex = bridged;
        try{ setNowPlayingIndex = bridged; }catch(_){}
      }
      if(window.setNowPlayingIndex || typeof setNowPlayingIndex === "function") installedAny = true;
    }catch(_){}

    try{
      const original = window.syncNowPlayingIndexesToUnlockedTables || (typeof syncNowPlayingIndexesToUnlockedTables === "function" ? syncNowPlayingIndexesToUnlockedTables : null);
      if(original && !original.__flprStandaloneChecksSelectionBridge){
        const bridged = function standaloneSyncNowPlayingIndexesChecksBridge(opts){
          standaloneEnsureNowPlayingGuard("pre-unlocked-sync");
          standaloneAdoptRenderedChecksSelection("pre-unlocked-sync-adopt");
          const pinnedWorld = standalonePinnedChecksWorldKey();
          const pinnedTable = standalonePinnedChecksTableKey();
          const suppressPinnedChecksSignal = !!(pinnedWorld && pinnedTable && standaloneChecksViewActive());
          const nextOpts = pinnedWorld ? { ...(opts || {}), render:false } : opts;
          const preWorldChanged = standaloneEnforceChecksWorldSelection("pre-unlocked-sync-world", { save:false });
          const preChanged = standaloneEnforceChecksSelectionPin("pre-unlocked-sync", { save:false });
          const result = pinnedWorld ? original.call(this, nextOpts) : original.apply(this, arguments);
          const postWorldChanged = standaloneEnforceChecksWorldSelection("post-unlocked-sync-world", { save: opts?.save !== false });
          const postChanged = standaloneEnforceChecksSelectionPin("post-unlocked-sync", { save: opts?.save !== false });
          const capturedChanged = suppressPinnedChecksSignal
            ? standaloneRestoreCapturedChecksSelection(pinnedTable, "post-unlocked-sync-captured", { save: opts?.save !== false })
            : false;
          if(pinnedWorld && opts?.render){
            try{
              if(standaloneChecksViewActive()){
                renderChecksWorldTabs();
                renderChecks();
              }else{
                applyChecksNowPlayingHighlight();
              }
            }catch(_){}
          }else if((postChanged || postWorldChanged) && opts?.render){
            try{ if(standaloneChecksViewActive()) renderChecks(); else applyChecksNowPlayingHighlight(); }catch(_){}
          }
          if(suppressPinnedChecksSignal){
            try{ standaloneDirectChecksHighlightPinned(); }catch(_){}
            standaloneRecordChecksSelectionTrace("suppressed-unlocked-sync-signal", {
              pinned:pinnedTable,
              pinnedWorld,
              result:!!result,
              preChanged:!!preChanged,
              postChanged:!!postChanged,
              preWorldChanged:!!preWorldChanged,
              postWorldChanged:!!postWorldChanged,
              capturedChanged:!!capturedChanged
            });
          }
          standaloneScheduleChecksSelectionApply("unlocked-sync");
          if(suppressPinnedChecksSignal) return false;
          return !!result || preChanged || postChanged || preWorldChanged || postWorldChanged || capturedChanged;
        };
        bridged.__flprStandaloneChecksSelectionBridge = true;
        bridged.__flprStandaloneOriginalSyncNowPlayingIndexesToUnlockedTables = original;
        window.syncNowPlayingIndexesToUnlockedTables = bridged;
        try{ syncNowPlayingIndexesToUnlockedTables = bridged; }catch(_){}
      }
      if(window.syncNowPlayingIndexesToUnlockedTables || typeof syncNowPlayingIndexesToUnlockedTables === "function") installedAny = true;
    }catch(_){}

    try{
      const original = window.renderChecks || (typeof renderChecks === "function" ? renderChecks : null);
      if(original && !original.__flprStandaloneChecksSelectionBridge){
        const bridged = function standaloneRenderChecksSelectionBridge(){
          standaloneEnsureNowPlayingGuard("render-checks");
          standaloneCancelChecksSwapAnimation();
          standaloneAdoptRenderedChecksSelection("pre-render-adopt");
          standaloneEnforceChecksWorldSelection("pre-render-world", { save:false });
          standaloneEnforceChecksSelectionPin("pre-render", { save:false });
          const sigBefore = standaloneChecksRenderSignature();
          const currentWorld = String(ap?.currentWorld || "");
          if(
            sigBefore &&
            sigBefore === standaloneChecksRenderState.lastSig &&
            standaloneChecksBodyMatchesWorld(currentWorld)
          ){
            standaloneChecksRenderState.skipped = Number(standaloneChecksRenderState.skipped || 0) + 1;
            standaloneChecksRenderState.lastAt = Date.now();
            try{ applyChecksNowPlayingHighlight(); }catch(_){}
            try{ standaloneDirectChecksHighlightPinned(); }catch(_){}
            try{ standaloneGuardChecksNodeInteractions(); }catch(_){}
            standaloneScheduleStrategyHoverReanchor("render-skip");
            return undefined;
          }
          const result = original.apply(this, arguments);
          standaloneAdoptRenderedChecksSelection("post-render-adopt");
          standaloneEnforceChecksWorldSelection("post-render-world", { save:false });
          standaloneEnforceChecksSelectionPin("post-render", { save:false });
          standaloneChecksRenderState.lastSig = standaloneChecksRenderSignature() || sigBefore;
          standaloneChecksRenderState.lastAt = Date.now();
          standaloneChecksRenderState.rendered = Number(standaloneChecksRenderState.rendered || 0) + 1;
          standaloneGuardChecksNodeInteractions();
          standaloneScheduleStrategyHoverReanchor("render");
          standaloneScheduleChecksSelectionApply("render");
          return result;
        };
        bridged.__flprStandaloneChecksSelectionBridge = true;
        bridged.__flprStandaloneOriginalRenderChecks = original;
        window.renderChecks = bridged;
        try{ renderChecks = bridged; }catch(_){}
      }
      if(window.renderChecks || typeof renderChecks === "function") installedAny = true;
    }catch(_){}

    try{
      const original = window.applyChecksNowPlayingHighlight || (typeof applyChecksNowPlayingHighlight === "function" ? applyChecksNowPlayingHighlight : null);
      if(original && !original.__flprStandaloneChecksSelectionBridge){
        const bridged = function standaloneApplyChecksNowPlayingHighlightBridge(){
          standaloneEnsureNowPlayingGuard("highlight");
          standaloneCancelChecksSwapAnimation();
          standaloneAdoptRenderedChecksSelection("pre-highlight-adopt");
          standaloneEnforceChecksSelectionPin("highlight", { save:false });
          const result = original.apply(this, arguments);
          standaloneCancelChecksSwapAnimation();
          standaloneDirectChecksHighlightPinned();
          standaloneGuardChecksNodeInteractions();
          return result;
        };
        bridged.__flprStandaloneChecksSelectionBridge = true;
        bridged.__flprStandaloneOriginalApplyChecksNowPlayingHighlight = original;
        window.applyChecksNowPlayingHighlight = bridged;
        try{ applyChecksNowPlayingHighlight = bridged; }catch(_){}
      }
      if(window.applyChecksNowPlayingHighlight || typeof applyChecksNowPlayingHighlight === "function") installedAny = true;
    }catch(_){}

    try{
      window.flprStandaloneChecksSelectionBridgeState = function(){
        const key = String(standaloneChecksSelection.key || "");
        const parsed = standaloneParseTableKey(key);
        return {
          installed: true,
          key,
          worldKey: String(standaloneChecksWorldSelection.key || ""),
          worldActive: !!standalonePinnedChecksWorldKey(),
          worldSource: standaloneChecksWorldSelection.source,
          worldAgeMs: standaloneChecksWorldSelection.ts ? Date.now() - standaloneChecksWorldSelection.ts : null,
          renderState: { ...standaloneChecksRenderState },
          active: !!standalonePinnedChecksTableKey(),
          source: standaloneChecksSelection.source,
          ageMs: standaloneChecksSelection.ts ? Date.now() - standaloneChecksSelection.ts : null,
          currentWorld: String(ap?.currentWorld || ""),
          selected: String(state?.selected || ""),
          nowPlaying: parsed ? Number(state?.nowPlaying?.[parsed.worldKey]) : null,
          activeCard: document.querySelector("#checksBody .tableBlock.nowPlayingChecks")?.getAttribute("data-tablekey") || ""
        };
      };
    }catch(_){}

    if(!installedAny) setTimeout(installStandaloneChecksSelectionBridge, 120);
  }

  function standaloneApplyOwnProgressiveItemSend(meta, opts){
    opts = opts || {};
    const next = standaloneResolveSentMeta(meta);
    if(!standaloneResolvedMetaIsOwnProgressive(next)){
      try{ window.__flprStandaloneLastSelfProgressiveApply = { ok:false, reason:"not-own-progressive", meta:{ ...(meta || {}) }, resolved:{ ...(next || {}) }, ts:Date.now() }; }catch(_){}
      return false;
    }
    const self = standaloneSelfSlotId();
    const itemId = Number(next.itemId);
    const locId = Number(next.locId);
    if(!self || !Number.isFinite(itemId)){
      try{ window.__flprStandaloneLastSelfProgressiveApply = { ok:false, reason:"missing-self-or-item", self, itemId, resolved:{ ...(next || {}) }, ts:Date.now() }; }catch(_){}
      return false;
    }
    const targetTable = standaloneProgressiveBallTarget(next.itemName);
    if(!targetTable || !standaloneIsActiveSeedTableName(targetTable)){
      try{ window.__flprStandaloneLastSelfProgressiveApply = { ok:false, reason:"inactive-target", targetTable, resolved:{ ...(next || {}) }, ts:Date.now() }; }catch(_){}
      return false;
    }
    const targetLevel = ()=>{
      try{
        const key = (typeof getTableKeyForName === "function") ? String(getTableKeyForName(targetTable) || "") : "";
        if(!key) return 0;
        if(typeof getBallLevelByTableKey === "function") return Math.max(0, Math.min(3, Number(getBallLevelByTableKey(key) || 0)));
        return state?.balls?.[`${key}|3`] ? 3 : (state?.balls?.[`${key}|2`] ? 2 : (state?.balls?.[`${key}|1`] ? 1 : 0));
      }catch(_){}
      return 0;
    };
    const levelBeforeApply = targetLevel();
    const applyDirectIfNeeded = (reason)=>{
      try{
        const current = targetLevel();
        if(current > levelBeforeApply || current >= 3) return false;
        if(typeof applyProgressiveBallToTower !== "function") return false;
        standaloneWithUnlockFxSuppressed(()=>{
          standaloneWithCounterDrawerFxSuppressed(()=>applyProgressiveBallToTower(targetTable));
        }, 1200);
        try{
          window.__flprStandaloneLastSelfProgressiveDirectApply = {
            itemName:String(next.itemName || ""),
            targetTable,
            reason:String(reason || ""),
            from:current,
            to:targetLevel(),
            ts:Date.now()
          };
        }catch(_){}
        return true;
      }catch(_){}
      return false;
    };
    if(standaloneLocationMatchesOutgoingSent(next.locId, next.locationName)){
      try{ if(typeof apLog === "function") apLog(`False self-progression suppressed; ${next.itemName} belongs to an outgoing AP item at ${standaloneLocationDisplayName(next.locationName || "", next.locId)}.`, { tab:"status" }); }catch(_){}
      try{ window.__flprStandaloneLastSelfProgressiveApply = { ok:false, reason:"outgoing-location", resolved:{ ...(next || {}) }, ts:Date.now() }; }catch(_){}
      return false;
    }
    if(!standaloneAuthoritativeMetaExists(next)){
      try{ if(typeof apLog === "function") apLog(`Awaiting AP ReceivedItems confirmation before applying local item log: ${next.itemName}`, { tab:"status" }); }catch(_){}
      try{ window.__flprStandaloneLastSelfProgressiveApply = { ok:false, reason:"awaiting-authoritative-receiveditems", resolved:{ ...(next || {}) }, ts:Date.now() }; }catch(_){}
      return false;
    }
    const key = `self-progressive|${itemId}|${Number.isFinite(locId) ? locId : ""}|${Number(next.senderId || 0) || self}|${standaloneNormalizeLoose(next.itemName)}`;
    if(standaloneItemPanel.selfProgressiveSeen.has(key)){
      try{ window.__flprStandaloneLastSelfProgressiveApply = { ok:true, duplicate:true, key, resolved:{ ...(next || {}) }, ts:Date.now() }; }catch(_){}
      return true;
    }
    standaloneItemPanel.selfProgressiveSeen.add(key);
    if(standaloneItemPanel.selfProgressiveSeen.size > 500) standaloneItemPanel.selfProgressiveSeen.clear();

    try{
      if(!ap.itemNameById) ap.itemNameById = new Map();
      ap.itemNameById.set(itemId, String(next.itemName || ""));
    }catch(_){}

    let itemIndex = Math.max(0, Number(ap?.lastReceivedIndex || 0) || 0);
    try{
      ap.receivedSeen = ap.receivedSeen || new Set();
      ap.receivedKeySet = ap.receivedKeySet || new Set();
      const receivedAll = Array.isArray(ap?.receivedAll) ? ap.receivedAll : [];
      const indexTaken = (idx)=> {
        const key = `idx:${idx}`;
        if(ap.receivedSeen.has(key)) return true;
        if(ap.receivedKeySet.has(key)) return true;
        return receivedAll.some((row)=>Number(row?.recvIndex) === Number(idx));
      };
      while(indexTaken(itemIndex)) itemIndex++;
      ap.receivedSeen.add(`idx:${itemIndex}`);
      ap.receivedByIndex = ap.receivedByIndex || new Map();
      ap.receivedByIndex.set(itemIndex, {
        item: itemId,
        location: Number.isFinite(locId) ? locId : null,
        player: Number(next.senderId || self) || self,
        flags: standaloneFlagsForItem(next.flags || 0, next.itemName)
      });
      ap.lastReceivedIndex = Math.max(Number(ap.lastReceivedIndex || 0) || 0, itemIndex + 1);
      try{ localStorage.setItem("flpr_ap_last_received_index", String(ap.lastReceivedIndex)); }catch(_){}
    }catch(_){}

    let ensuredRow = false;
    try{ ensuredRow = standaloneEnsureOwnProgressiveReceivedRow(next, itemIndex); }catch(_){}

    try{
      if(typeof processReceivedItem === "function"){
        processReceivedItem(
          { item:itemId, location:Number.isFinite(locId) ? locId : null, player:Number(next.senderId || self) || self, flags:standaloneFlagsForItem(next.flags || 0, next.itemName) },
          itemIndex,
          Number.isFinite(locId) ? locId : null,
          {
            noPopup: opts.noPopup === true,
            noFeed: opts.noFeed === true,
            isSnapshot: false,
            pairedOverride: standaloneBuildPairedMetaForSentCheck(next)
          }
        );
      }
    }catch(err){
      try{ if(typeof apLog === "function") apLog("Self Progressive Ball application failed; " + (err?.message || err), { tab:"errors" }); }catch(_){}
    }

    try{ standaloneRenderItemPanel(); }catch(_){}
    if(opts.noPopup === true || opts.forceQuietUnlock === true){
      try{
        standaloneForceProgressiveUnlockFromInventory(next.itemName, { animate:false, quiet:true });
        applyDirectIfNeeded("quiet-immediate");
      }catch(_){}
      setTimeout(()=>{
        try{
          standaloneForceProgressiveUnlockFromInventory(next.itemName, { animate:false, quiet:true });
          applyDirectIfNeeded("quiet-followup");
        }catch(_){}
      }, 360);
    }else{
      setTimeout(()=>{
        try{
          standaloneForceProgressiveUnlockFromInventory(next.itemName, { animate:false, quiet:true });
          applyDirectIfNeeded("animated-before-socket");
        }catch(_){}
      }, 5400);
      setTimeout(()=>{
        try{
          standaloneForceProgressiveUnlockFromInventory(next.itemName, { animate:false, quiet:true });
          applyDirectIfNeeded("animated-final");
        }catch(_){}
      }, 8200);
    }
    try{ window.__flprStandaloneLastSelfProgressiveApply = { ok:true, key, itemIndex, ensuredRow, noPopup:opts.noPopup === true, levelBefore:levelBeforeApply, resolved:{ ...(next || {}) }, ts:Date.now() }; }catch(_){}
    return true;
  }

  function standaloneQueueSentItemModal(meta){
    const key = standaloneSentMetaKey(meta);
    if(!key) return;
    standaloneItemPanel.pendingSentModals.set(key, { ...meta, queuedAt:Date.now() });
  }

  function standaloneShowSentItemModal(meta, opts){
    opts = opts || {};
    let next = standaloneResolveSentMeta(meta);
    if(!next) return false;
    const self = standaloneSelfSlotId();
    if(!self || Number(next.senderId || 0) !== self || Number(next.receiverId || 0) === self) return false;
    const key = standaloneSentMetaKey(next);
    if(standaloneItemPanel.sentModalSeen.has(key)) return false;
    if(standaloneLooksUnresolvedItemName(next.itemName, next.itemId) && opts.deferUnresolved !== false){
      standaloneQueueSentItemModal(next);
      return false;
    }
    standaloneItemPanel.sentModalSeen.add(key);
    if(standaloneItemPanel.sentModalSeen.size > 500) standaloneItemPanel.sentModalSeen.clear();
    standaloneItemPanel.pendingSentModals.delete(key);
    const item = String(next.itemName || "Unknown Item");
    const flags = standaloneFlagsForItem(next.flags, item);
    const cls = (()=>{ try{ return apItemClassFromFlags(flags, item); }catch(_){ return { label:"ITEM", title:"ITEM" }; } })();
    const targetGame = standaloneGameForPlayer(next.receiverId, next.receiverPlayer, next.receiverGame);
    const targetPlayer = String(next.receiverPlayer || "Unknown Player");
    const locName = String(next.locationName || "").trim();
    const holdMs = Math.max(3000, Number(opts.holdMs || 4200) || 4200);
    let restoreChecksAfterSentModal = false;
    try{ restoreChecksAfterSentModal = String(activeView || "") === "checks"; }catch(_){}
    const checksKeyBeforeModal = restoreChecksAfterSentModal
      ? (standaloneCurrentChecksSelectionCandidate() || standalonePinnedChecksTableKey())
      : "";
    if(checksKeyBeforeModal){
      try{ standaloneRememberChecksSelection(checksKeyBeforeModal, "sent-item-modal"); }catch(_){}
    }
    try{
      standaloneEnsureOverviewModalVisibleHost();
      const modalArgs = {
          tag: cls.label || "ITEM",
          title: `${cls.title || "ITEM"} SENT`,
          big: item,
          sub: `TO; ${targetPlayer}${targetGame ? ` (${targetGame})` : ""}`,
          meta: locName ? `CHECK; ${locName}` : "",
          isTrap: false,
          holdMs
      };
      if(restoreChecksAfterSentModal && typeof showOverviewModalNow === "function"){
        standalonePreserveChecksSelectionDuring(()=>standaloneRestoreChecksViewForReward(), "sent-item-modal");
        try{ if(typeof pauseAutoSwap === "function") pauseAutoSwap(holdMs + 2200); }catch(_){}
        showOverviewModalNow(modalArgs);
        standaloneColorizeSentItemModal(next, cls, holdMs);
        standaloneScheduleChecksSelectionHold("sent-item-modal", holdMs + 1800);
      }else if(typeof showOverviewModal === "function"){
        showOverviewModal(modalArgs);
        standaloneColorizeSentItemModal(next, cls, holdMs);
        if(restoreChecksAfterSentModal){
          standaloneScheduleChecksRestoreAfterReward({ holdMs });
          standaloneScheduleChecksSelectionHold("sent-item-modal", holdMs + 1800);
        }
      }else if(typeof toast === "function"){
        toast("good", `${cls.title || "ITEM"} SENT`, `${item} -> ${targetPlayer}`, 4200);
      }
    }catch(_){}
    return true;
  }

  function standaloneColorizeReceivedProgressiveModal(itemName, holdMs){
    const apply = ()=>{
      try{
        const card = document.getElementById("ovModalCard");
        const tag = document.getElementById("ovModalTag");
        const big = document.getElementById("ovModalBig");
        const meta = document.getElementById("ovModalMeta");
        if(!card || !big) return;
        card.classList.add("flprStandaloneSentItemModal", "apItem-progression");
        if(tag) tag.className = "ovModalTag apLogBadge apItem-progression";
        big.className = "ovModalBig apLogItem apItem-progression";
        if(meta && meta.textContent){
          meta.innerHTML = `CHECK; <span class="apLogLocation">${standaloneEscapeHtml(meta.textContent.replace(/^CHECK;\s*/i, ""))}</span>`;
        }
      }catch(_){}
    };
    [0, 120, 520].forEach((delay)=>setTimeout(apply, delay));
    setTimeout(()=>{
      try{
        const card = document.getElementById("ovModalCard");
        const tag = document.getElementById("ovModalTag");
        const big = document.getElementById("ovModalBig");
        if(card) card.classList.remove("flprStandaloneSentItemModal", "apItem-progression", "apItem-useful", "apItem-filler", "apItem-trap");
        if(tag) tag.className = "ovModalTag";
        if(big) big.className = "ovModalBig";
      }catch(_){}
    }, Math.max(1200, Number(holdMs || 3200) + 900));
  }

  function standaloneProgressiveSiegeSequenceMs(tableName, holdMs){
    let unlockLead = 0;
    try{
      const key = (typeof getTableKeyForName === "function") ? String(getTableKeyForName(tableName) || "") : "";
      const level = key && typeof getBallLevelByTableKey === "function" ? Number(getBallLevelByTableKey(key) || 0) : 1;
      if(key && Number.isFinite(level) && level <= 0) unlockLead = 1120;
    }catch(_){}
    return Math.max(
      6800,
      580 + Math.max(1800, Number(holdMs || 2600) || 2600) + 90 + unlockLead + 3500 + 1060
    );
  }

  function installStandaloneProgressiveChecksRewardBridge(){
    let original = null;
    try{ original = (typeof runProgressiveBallFlow === "function") ? runProgressiveBallFlow : null; }catch(_){}
    if(!original){
      setTimeout(installStandaloneProgressiveChecksRewardBridge, 120);
      return;
    }
    if(original.__flprStandaloneProgressiveChecksBridge) return;
    const bridged = function standaloneRunProgressiveBallFlowChecksBridge(table, opts){
      opts = opts || {};
      const tableName = String(table || "").trim();
      const explicitStayOnChecks = opts.standaloneStayOnChecks === true;
      const coordinateFromChecks = !!(
        tableName &&
        !opts.isTest &&
        opts.standaloneAllowOverview !== true &&
        standaloneChecksViewActive()
      );
      if(!coordinateFromChecks) return original.apply(this, arguments);
      const itemName = /^progressive\s+ball\s*-/i.test(tableName) ? tableName : `Progressive Ball - ${tableName}`;
      const holdMs = Math.max(2200, Number(opts.holdMs || 3200) || 3200);
      const modalMeta = String(opts.modalMeta || "").trim();
      const thisArg = this;
      const checksReturnKey = standaloneCaptureChecksSelectionForReward("progressive-reward-before")
        || standalonePinnedChecksTableKey();
      const targetTableKey = (()=> {
        try{ return tableName && typeof getTableKeyForName === "function" ? String(getTableKeyForName(tableName) || "") : ""; }catch(_){}
        return "";
      })();
      const focusTableKey = standaloneParseTableKey(checksReturnKey) ? checksReturnKey : targetTableKey;
      if(focusTableKey && standaloneChecksTableExists(focusTableKey)){
        const parsedTarget = standaloneParseTableKey(focusTableKey);
        standaloneChecksSelection.key = focusTableKey;
        standaloneChecksSelection.ts = Date.now();
        standaloneChecksSelection.source = checksReturnKey ? "progressive-reward-return" : "progressive-reward";
        if(parsedTarget) standaloneRememberChecksWorldSelection(parsedTarget.worldKey, standaloneChecksSelection.source);
        try{ standaloneEnforceChecksSelectionPin(standaloneChecksSelection.source, { save:false }); }catch(_){}
        standaloneScheduleChecksSelectionHold(standaloneChecksSelection.source, holdMs + 6800);
      }
      const runOverviewReward = ()=>{
        const nextOpts = {
          ...opts,
          holdMs,
          standaloneAllowOverview:true
        };
        try{ if(typeof pauseAutoSwap === "function") pauseAutoSwap(holdMs + 5600); }catch(_){}
        try{
          window.__flprStandaloneProgressiveChecksReward = {
            tableName,
            itemName,
            activeView:String(activeView || ""),
            stayedOnChecks:false,
            yieldedToSiege:false,
            ts:Date.now()
          };
        }catch(_){}
        const result = original.call(thisArg, table, nextOpts);
        try{ standaloneColorizeReceivedProgressiveModal(itemName, holdMs); }catch(_){}
        if(checksReturnKey) standaloneScheduleProgressiveReturnToRedeemedCheck(checksReturnKey, "progressive-overview-return", holdMs + 5600, { immediate:false });
        return result;
      };
      const runOverviewPipelineForQueuedSiege = ()=>{
        const sequenceMs = standaloneProgressiveSiegeSequenceMs(tableName, holdMs);
        const sequenceHoldUntil = standaloneMarkSiegeSequenceHold(sequenceMs, "progressive-ball-siege-sequence");
        try{ if(typeof pauseAutoSwap === "function") pauseAutoSwap(sequenceMs + 1400); }catch(_){}
        const nextOpts = {
          ...opts,
          holdMs,
          returnView:"",
          standaloneAllowOverview:true
        };
        try{
          window.__flprStandaloneProgressiveChecksReward = {
            tableName,
            itemName,
            activeView:String(activeView || ""),
            stayedOnChecks:false,
            yieldedToSiege:true,
            sequenceHoldUntil,
            ts:Date.now()
          };
        }catch(_){}
        const result = original.call(thisArg, table, nextOpts);
        try{ standaloneColorizeReceivedProgressiveModal(itemName, holdMs); }catch(_){}
        if(standaloneSiegeNotificationQueue.pending){
          setTimeout(()=>standaloneShowSiegeIncomingNotice(), 720);
          standaloneScheduleQueuedBesiegedActivation();
        }
        return result;
      };
      const runChecksReward = ()=>{
        return standalonePreserveChecksSelectionDuring(()=>{
        try{ if(typeof pauseAutoSwap === "function") pauseAutoSwap(holdMs + 1200); }catch(_){}
        try{ standaloneEnsureOverviewModalVisibleHost(); }catch(_){}
        try{
          if(typeof showOverviewModalNow === "function"){
            showOverviewModalNow({
              tag:"REWARD",
              title:"ITEM RECEIVED",
              big:itemName,
              sub:tableName,
              meta:modalMeta,
              isTrap:false,
              holdMs
            });
            standaloneColorizeReceivedProgressiveModal(itemName, holdMs);
          }else if(typeof toast === "function"){
            toast("good", "ITEM RECEIVED", itemName, holdMs);
          }
        }catch(_){}
        try{
          standaloneWithUnlockFxSuppressed(()=>{
            standaloneForceProgressiveUnlockFromInventory(itemName, { animate:false, quiet:true });
          }, holdMs + 600);
        }catch(_){}
        const renderStableChecks = ()=>{
          try{
            if(!standaloneChecksViewActive()) return;
            standalonePreserveChecksSelectionDuring(()=>{
              try{ if(typeof renderChecksWorldTabs === "function") renderChecksWorldTabs(); }catch(_){}
              try{ if(typeof renderChecks === "function") renderChecks(); }catch(_){}
              try{ if(typeof updateCounterBars === "function") updateCounterBars(); }catch(_){}
            }, "progressive-checks-render");
          }catch(_){}
        };
        setTimeout(renderStableChecks, 90);
        setTimeout(()=>{
          try{
            standaloneEnforceChecksSelectionPin("progressive-checks-final", { save:false });
            standaloneDirectChecksHighlightPinned();
          }catch(_){}
        }, holdMs + 180);
        if(checksReturnKey) standaloneScheduleProgressiveReturnToRedeemedCheck(checksReturnKey, "progressive-checks-return", holdMs + 900);
        try{
          window.__flprStandaloneProgressiveChecksReward = {
            tableName,
            itemName,
            activeView:String(activeView || ""),
            stayedOnChecks:true,
            ts:Date.now()
          };
        }catch(_){}
        return undefined;
        }, "progressive-checks-reward");
      };
      standaloneMarkSiegeSequenceHold(620, "progressive-reward-decision");
      setTimeout(()=>{
        try{
          if(standaloneQueuedSiegeWaiting()) runOverviewPipelineForQueuedSiege();
          else if(!explicitStayOnChecks) runOverviewReward();
          else runChecksReward();
        }catch(_){
          try{ explicitStayOnChecks ? runChecksReward() : runOverviewReward(); }catch(__){}
        }
      }, 140);
      return undefined;
    };
    bridged.__flprStandaloneProgressiveChecksBridge = true;
    bridged.__flprStandaloneOriginalRunProgressiveBallFlow = original;
    try{ window.runProgressiveBallFlow = bridged; }catch(_){}
    try{ runProgressiveBallFlow = bridged; }catch(_){}
  }

  function standaloneAppendResolvedSentLog(meta){
    try{
      const next = standaloneResolveSentMeta(meta);
      if(!next || standaloneLooksUnresolvedItemName(next.itemName, next.itemId)) return false;
      const key = standaloneSentMetaKey(next);
      if(standaloneItemPanel.sentLogSeen.has(key)) return false;
      standaloneItemPanel.sentLogSeen.add(key);
      if(standaloneItemPanel.sentLogSeen.size > 500) standaloneItemPanel.sentLogSeen.clear();
      let line = standaloneFormatItemSendLogLine(next);
      if(!line){
        const sender = String(next.senderPlayer || "Unknown Player").trim();
        const receiver = String(next.receiverPlayer || "Unknown Player").trim();
        const item = String(next.itemName || "Unknown Item").trim();
        const loc = standaloneLocationDisplayName(next.locationName || "", next.locId);
        line = `${sender} sent ${item} to ${receiver}${loc ? ` (${loc})` : ""}`;
      }
      standaloneRememberItemSendLogMeta(next, line);
      if(line && typeof apLog === "function") apLog(line, { tab:"chat", mirrorTabs:["status"] });
      return !!line;
    }catch(_){
      return false;
    }
  }

  function standaloneFlushPendingSentItemModals(){
    try{
      Array.from(standaloneItemPanel.pendingSentModals.values()).forEach((meta)=>{
        const next = standaloneResolveSentMeta(meta);
        standaloneAppendResolvedSentLog(next);
        standaloneShowSentItemModal(next, { deferUnresolved:false });
      });
    }catch(_){}
  }

  function installStandaloneSentItemNotificationBridge(){
    let original = null;
    try{ original = (typeof showApSentItemToast === "function") ? showApSentItemToast : null; }catch(_){}
    if(!original){
      setTimeout(installStandaloneSentItemNotificationBridge, 120);
      return;
    }
    if(original.__flprStandaloneSentModalBridge) return;
    const bridged = function standaloneShowApSentItemModalBridge(meta, opts){
      try{
        const next = standaloneResolveSentMeta(meta);
        const cached = standaloneCachedServerSentMeta(next || meta);
        if(!cached && Number((next || meta)?.receiverId || 0) !== standaloneSelfSlotId() && standaloneProgressiveBallTarget((next || meta)?.itemName || "")){
          return;
        }
        if(standaloneResolvedMetaIsOwnProgressive(next)){
          standaloneApplyOwnProgressiveItemSend(next, { noPopup:false, noFeed:true });
          return;
        }
        const key = standaloneSentMetaKey(next || meta);
        if(standaloneItemPanel.sentModalSeen.has(key) || standaloneItemPanel.pendingSentModals.has(key)) return;
        if(standaloneShowSentItemModal(next || meta, { ...(opts || {}), deferUnresolved:true })) return;
        if(standaloneLooksUnresolvedItemName((next || meta)?.itemName, (next || meta)?.itemId)) return;
      }catch(_){}
      try{ return original.apply(this, arguments); }catch(_){}
    };
    bridged.__flprStandaloneSentModalBridge = true;
    bridged.__flprStandaloneOriginalSentToast = original;
    try{ window.showApSentItemToast = bridged; }catch(_){}
    try{ showApSentItemToast = bridged; }catch(_){}
  }

  function standaloneRecordSentItemFromPacket(pkt){
    try{
      const type = String(pkt?.type || "").toLowerCase();
      if(type !== "itemsend" && type !== "item_send") return false;
      const rawMeta = standaloneExtractItemSendMeta(pkt);
      const meta = standaloneResolveSentMeta(rawMeta);
      if(!meta) return false;
      const self = Number(ap?.slot || 0);
      if(!self || Number(meta.senderId || 0) !== self) return false;
      if(standaloneResolvedMetaIsOwnProgressive(meta)){
        standaloneApplyOwnProgressiveItemSend(meta);
        return false;
      }
      if(Number(meta.receiverId || 0) === self) return false;
      standaloneLoadSentItems();
      const key = `sent|${meta.senderId || 0}|${meta.receiverId || 0}|${meta.itemId ?? ""}|${meta.locId ?? ""}|${meta.flags ?? 0}`;
      const entry = {
        key,
        ts: Date.now(),
        time: (typeof fmtTime === "function") ? fmtTime() : standaloneTextTimestamp().replace(/^\[|\]$/g, ""),
        itemId: meta.itemId ?? null,
        locId: meta.locId ?? null,
        senderId: meta.senderId ?? null,
        receiverId: meta.receiverId ?? null,
        itemName: meta.itemName || standaloneResolveApItemName(meta.itemId, meta.receiverId, meta.itemName || "Unknown Item", meta.receiverGame || ""),
        locationName: meta.locationName || standaloneResolveApLocationName(meta.locId, meta.senderId, meta.locationName || ""),
        receiverPlayer: String(meta.receiverPlayer || "Unknown Player"),
        receiverGame: String(meta.receiverGame || ""),
        senderPlayer: String(meta.senderPlayer || ""),
        senderGame: String(meta.senderGame || ""),
        flags: standaloneFlagsForItem(meta.flags ?? 0, meta.itemName)
      };
      const existing = standaloneItemPanel.sent.find((row)=>String(row?.key || "") === key);
      if(existing){
        Object.assign(existing, entry, { ts:existing.ts || entry.ts, time:existing.time || entry.time });
      }else{
        standaloneItemPanel.sent.push(entry);
      }
      standaloneSaveSentItems();
      standaloneRepairPersistedApState();
      standaloneRenderItemPanel();
      standaloneShowSentItemModal(meta, { deferUnresolved:false });
      return true;
    }catch(_){
      return false;
    }
  }

  function installStandaloneReceivedListBridge(){
    let original = null;
    try{ original = (typeof renderReceivedList === "function") ? renderReceivedList : null; }catch(_){}
    if(!original){
      setTimeout(installStandaloneReceivedListBridge, 120);
      return;
    }
    if(original.__flprStandaloneReceivedBridge){
      try{ standaloneMirrorReceivedList(); }catch(_){}
      return;
    }
    const bridged = function standaloneRenderReceivedListBridge(){
      const scrollSnaps = standaloneCaptureItemPanelScrollSnapshots();
      const result = original.apply(this, arguments);
      try{ standaloneMirrorReceivedList({ scrollSnaps, force:true }); }catch(_){}
      try{ standaloneRestoreItemPanelScrollSnapshots(scrollSnaps, { preservePrepended:true }); }catch(_){}
      try{ standaloneScheduleItemPanelScrollRestore(scrollSnaps, { preservePrepended:true }); }catch(_){}
      return result;
    };
    bridged.__flprStandaloneReceivedBridge = true;
    bridged.__flprStandaloneOriginalRenderReceivedList = original;
    try{ window.renderReceivedList = bridged; }catch(_){}
    try{ renderReceivedList = bridged; }catch(_){}
    setTimeout(()=>{ try{ standaloneMirrorReceivedList(); }catch(_){} }, 0);
  }

  function standaloneTextMirrorLog(message, opts){
    standaloneLoadPersistedTextLogs();
    const msg = String(message ?? "").trim();
    if(!msg) return;
    if(!standaloneShouldShowLogLine(msg)) return;
    const forced = opts && Object.prototype.hasOwnProperty.call(opts, "tab") ? String(opts.tab || "") : "";
    const lower = msg.toLowerCase();
    const inferred = lower.includes("error") || lower.includes("failed") || lower.includes("refused") || lower.includes("blocked") || lower.includes("timeout")
      ? "errors"
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
    if(standaloneIsHintLogLine(msg) && !targets.includes("hints")) targets.push("hints");
    if(tab !== "errors" && (lower.includes("error") || lower.includes("failed") || lower.includes("refused") || lower.includes("blocked") || lower.includes("timeout"))){
      if(!targets.includes("errors")) targets.push("errors");
    }
    targets.forEach((t)=>{
      const buf = standaloneTextClient.logs[t] || (standaloneTextClient.logs[t] = []);
      buf.push(line);
      standaloneTextClient.logs[t] = standaloneTrimLogBuffer(buf);
    });
    standaloneSavePersistedTextLogs();
    standaloneScheduleTextRender("mirror-log");
  }

  function installStandaloneNativeLogRenderBridge(){
    try{
      const original = window.renderApLogTab || (typeof renderApLogTab === "function" ? renderApLogTab : null);
      if(!original || original.__flprStandaloneNativeLogRenderBridge) return;
      standaloneTextClient.originalRenderApLogTab = original;
      const bridged = function standaloneRenderApLogTabBridge(){
        standaloneScheduleTextRender("native-renderApLogTab");
      };
      bridged.__flprStandaloneNativeLogRenderBridge = true;
      bridged.__flprStandaloneOriginalRenderApLogTab = original;
      window.renderApLogTab = bridged;
      try{ renderApLogTab = bridged; }catch(_){}
    }catch(_){}
  }

  function installStandaloneTextLogBridge(){
    if(standaloneTextClient.wrapped) return;
    standaloneResetTextLogsForNewSession();
    standaloneTextClient.wrapped = true;
    installStandaloneNativeLogRenderBridge();
    standaloneTextClient.originalApLog = (typeof window.apLog === "function") ? window.apLog : null;
    if(standaloneTextClient.originalApLog){
      window.apLog = function standaloneApLogBridge(message, opts){
        try{ standaloneTextClient.originalApLog.call(window, message, opts); }catch(_){}
        try{ standalonePersistNativeLogBuffers(); }catch(_){}
        try{ standaloneScheduleTextRender("apLog"); }catch(_){}
      };
    }else{
      window.apLog = function standaloneApLogBridgeFallback(message, opts){
        try{ standaloneTextMirrorLog(message, opts); }catch(_){}
      };
    }
    try{ standaloneTextRender(); }catch(_){}
  }

  let standaloneSayLastSubmit = { text:"", at:0 };
  function standaloneSendApSayPacket(text){
    const msg = String(text || "").trim();
    if(!msg) return false;
    const isHintRequest = /^!hint(?:\s|$)/i.test(msg);
    const ws = (typeof ap !== "undefined" && ap) ? ap.ws : null;
    const wsOpen = !!(ws && Number(ws.readyState) === 1);
    if(!wsOpen){
      const stateText = `readyState=${ws ? ws.readyState : "none"} connected=${!!(typeof ap !== "undefined" && ap?.connected)} singleplayer=${!!(typeof ap !== "undefined" && ap?.inherentSeedActive)}`;
      try{ window.apLog ? window.apLog("AP chat blocked; socket is not connected (" + stateText + ").", { tab:"errors" }) : standaloneTextMirrorLog("AP chat blocked; socket is not connected (" + stateText + ").", { tab:"errors" }); }catch(_){}
      return false;
    }
    try{ window.apLog ? window.apLog("> " + msg, { tab:"chat", mirrorTabs:["status"] }) : standaloneTextMirrorLog("> " + msg, { tab:"chat", mirrorTabs:["status"] }); }catch(_){}
    try{
      const pkt = { cmd:"Say", text:msg };
      ws.send(JSON.stringify([pkt]));
      try{ ap.lastSaySentAt = Date.now(); }catch(_){}
      if(isHintRequest){
        try{
          standaloneAppendPersistedLogLine("hints", `${standaloneTextTimestamp()} HINT REQUEST; ${msg}`);
          standaloneSavePersistedTextLogs();
        }catch(_){}
      }
      try{
        if(typeof apLog === "function"){
          apLog("OUT Say " + JSON.stringify(pkt), { tab:"status", mirrorTabs:["chat"] });
          apLog("SAY SENT TO AP SERVER; " + msg, { tab:"status", mirrorTabs:["chat"] });
        }else{
          standaloneTextMirrorLog("OUT Say " + JSON.stringify(pkt), { tab:"status", mirrorTabs:["chat"] });
          standaloneTextMirrorLog("SAY SENT TO AP SERVER; " + msg, { tab:"status", mirrorTabs:["chat"] });
        }
      }catch(_){}
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
    const sayInput = standalonePrimaryControl("#apClientSayInput");
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
      const nextTab = /^!hint(?:\s|$)/i.test(text) ? "hints" : "status";
      try{ if(nextTab === "status" && typeof setApLogTab === "function") setApLogTab("status"); }catch(_){}
      standaloneTextClient.activeTab = nextTab;
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
    try{ if(tab !== "hints" && typeof setApLogTab === "function") setApLogTab(tab); }catch(_){}
    if(tab === "hints") standaloneScheduleServerHintRequest("hints-tab", { delayMs:40 });
    standaloneTextRender();
    return false;
  }

  function activateStandaloneTextClientTabByName(tab, event){
    const wanted = standaloneTextNormalizeTab(tab);
    const btn = standaloneControlAll("#apLogTabs .apLogTab").find((node)=>standaloneTextNormalizeTab(node.dataset.aplogTab || "") === wanted);
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
    try{ standaloneScheduleReceivedRefresh("Sync button"); }catch(_){}
    if(sent){
      try{ window.apLog ? window.apLog("SYNC RECEIVED requested from AP server.", { tab:"status", mirrorTabs:["chat"] }) : standaloneTextMirrorLog("SYNC RECEIVED requested from AP server.", { tab:"status", mirrorTabs:["chat"] }); }catch(_){}
    }else{
      try{ window.apLog ? window.apLog("SYNC RECEIVED blocked; connect to AP first.", { tab:"errors" }) : standaloneTextMirrorLog("SYNC RECEIVED blocked; connect to AP first.", { tab:"errors" }); }catch(_){}
    }
    return false;
  }

  function standaloneSendRedeemMetadataBounce(meta){
    if(!meta || !ap?.connected) return false;
    try{
      const games = [String(ap?.cfg?.game || "")].filter(Boolean);
      return !!apSend({
        cmd: "Bounce",
        games,
        data: {
          type: "flippermizer_check_redeemed",
          meta
        }
      });
    }catch(_){
      return false;
    }
  }

  function installStandaloneLocationCheckBridge(){
    let original = null;
    try{
      original = window.apSendLocationCheckWithMetadata || (typeof apSendLocationCheckWithMetadata === "function" ? apSendLocationCheckWithMetadata : null);
    }catch(_){}
    if(!original){
      setTimeout(installStandaloneLocationCheckBridge, 120);
      return;
    }
    if(original.__flprStandaloneLocationCheckBridge) return;
    const bridged = function standaloneApSendLocationCheckWithMetadata(locId, meta){
      const id = Number(locId);
      if(!Number.isFinite(id) || id <= 0) return false;
      try{
        if(typeof apSend !== "function") return original.call(this, locId, meta);
        const sent = !!apSend({
          cmd: "LocationChecks",
          locations: [id]
        });
        if(sent && meta) standaloneSendRedeemMetadataBounce(meta);
        return sent;
      }catch(_){
        try{ return original.call(this, locId, meta); }catch(__){ return false; }
      }
    };
    bridged.__flprStandaloneLocationCheckBridge = true;
    bridged.__flprStandaloneOriginalLocationCheck = original;
    try{ window.apSendLocationCheckWithMetadata = bridged; }catch(_){}
    try{ apSendLocationCheckWithMetadata = bridged; }catch(_){}
  }

  function standaloneBossHpPct(){
    try{
      const max = Math.max(1, Number(state?.bossHpLive?.max || state?.bossHpTest?.max || 100));
      const cur = Math.max(0, Math.min(max, Number(state?.bossHpLive?.cur ?? state?.bossHpTest?.cur ?? max)));
      return Math.max(0, Math.min(100, Math.round((cur / max) * 100)));
    }catch(_){
      return 100;
    }
  }

  function standaloneBossTableIsUp(){
    try{
      if(typeof isBossUnlocked === "function" && !isBossUnlocked()) return false;
      if(typeof isBossDefeated === "function" && isBossDefeated()) return false;
      return !!(state?.bossHpLive?.inited || state?.bossHpTest?.show || standaloneBossChosenTableName());
    }catch(_){
      return false;
    }
  }

  function standaloneEnsureBossPhase2Music(reason){
    const pct = standaloneBossHpPct();
    const stateRec = {
      reason:String(reason || ""),
      pct,
      attemptedAt:Date.now(),
      bossUp:standaloneBossTableIsUp(),
      crossed:false,
      refreshed:false,
      skipped:""
    };
    try{
      if(!stateRec.bossUp){
        stateRec.skipped = "boss-not-up";
        window.__flprStandaloneBossPhase2MusicState = stateRec;
        return false;
      }
      if(!(pct > 0 && pct <= 50)){
        stateRec.skipped = "hp-above-phase2";
        window.__flprStandaloneBossPhase2MusicState = stateRec;
        return false;
      }
      const hasPhase2 = typeof musicHasExactScenarioTrack === "function" ? !!musicHasExactScenarioTrack("boss_battle_phase2") : false;
      if(!hasPhase2){
        stateRec.skipped = "missing-phase2-track";
        window.__flprStandaloneBossPhase2MusicState = stateRec;
        return false;
      }
      const mgr = typeof musicEnsureManager === "function" ? musicEnsureManager() : (window.__flprMusic || {});
      stateRec.current = String(mgr?.current || "");
      stateRec.crossfadeTarget = String(mgr?.crossfadeTarget || "");
      if(stateRec.current === "boss_battle_phase2" || stateRec.crossfadeTarget === "boss_battle_phase2"){
        stateRec.crossed = true;
        stateRec.skipped = "already-phase2";
        window.__flprStandaloneBossPhase2MusicState = stateRec;
        return true;
      }
      if(
        stateRec.current === "boss_battle_beginning" &&
        mgr?.audio &&
        !mgr.audio.paused &&
        typeof musicCrossfadeToScenario === "function"
      ){
        const crossed = !!musicCrossfadeToScenario("boss_battle_phase2", {
          force:true,
          forceStopIfMissing:true,
          durationMs:3200
        });
        stateRec.crossed = crossed;
        stateRec.skipped = crossed ? "" : "crossfade-failed";
        window.__flprStandaloneBossPhase2MusicState = stateRec;
        return crossed;
      }
      if(typeof musicRefreshScenario === "function"){
        musicRefreshScenario();
        stateRec.refreshed = true;
        const liveMgr = typeof musicEnsureManager === "function" ? musicEnsureManager() : (window.__flprMusic || {});
        stateRec.currentAfter = String(liveMgr?.current || "");
        stateRec.crossfadeTargetAfter = String(liveMgr?.crossfadeTarget || "");
        stateRec.crossed = stateRec.currentAfter === "boss_battle_phase2" || stateRec.crossfadeTargetAfter === "boss_battle_phase2";
        window.__flprStandaloneBossPhase2MusicState = stateRec;
        return stateRec.crossed;
      }
      stateRec.skipped = "music-refresh-unavailable";
      window.__flprStandaloneBossPhase2MusicState = stateRec;
      return false;
    }catch(err){
      stateRec.skipped = "error";
      stateRec.error = String(err?.message || err || "");
      try{ window.__flprStandaloneBossPhase2MusicState = stateRec; }catch(_){}
      return false;
    }
  }

  function installStandaloneBossPhaseMusicBridge(){
    let installedAny = false;
    try{
      const original = window.bossApplyDamagePct || (typeof bossApplyDamagePct === "function" ? bossApplyDamagePct : null);
      if(original && !original.__flprStandaloneBossPhaseMusicBridge){
        const bridged = function standaloneBossApplyDamagePhaseMusicBridge(pct, sourceKey, opts){
          const beforePct = standaloneBossHpPct();
          const result = original.apply(this, arguments);
          const afterPct = standaloneBossHpPct();
          if(beforePct > 50 && afterPct <= 50 && afterPct > 0){
            setTimeout(()=>standaloneEnsureBossPhase2Music("boss-damage-threshold"), 0);
          }else if(afterPct <= 50 && afterPct > 0 && opts?.fromCheck){
            setTimeout(()=>standaloneEnsureBossPhase2Music("boss-check-redeemed"), 0);
          }
          return result;
        };
        bridged.__flprStandaloneBossPhaseMusicBridge = true;
        bridged.__flprStandaloneOriginalBossApplyDamagePct = original;
        window.bossApplyDamagePct = bridged;
        try{ bossApplyDamagePct = bridged; }catch(_){}
      }
      if(window.bossApplyDamagePct || typeof bossApplyDamagePct === "function") installedAny = true;
    }catch(_){}
    try{ window.flprStandaloneEnsureBossPhase2MusicForTest = standaloneEnsureBossPhase2Music; }catch(_){}
    if(!installedAny) setTimeout(installStandaloneBossPhaseMusicBridge, 120);
  }

  function installStandaloneBossDamageBridge(){
    let installedAny = false;
    try{
      const original = window.bossResolveSegmentDamagePct || (typeof bossResolveSegmentDamagePct === "function" ? bossResolveSegmentDamagePct : null);
      if(original && !original.__flprStandaloneBossDamageBridge){
        const bridged = function standaloneBossResolveSegmentDamagePctBridge(opts){
          try{
            const locId = Number(opts?.locId);
            const node = standaloneBossCheckNodeByLocId(locId);
            const pct = standaloneBossDamagePctForNode(node);
            if(node && Number.isFinite(pct) && pct > 0){
              return pct;
            }
          }catch(_){}
          return original.apply(this, arguments);
        };
        bridged.__flprStandaloneBossDamageBridge = true;
        bridged.__flprStandaloneOriginalBossResolveSegmentDamagePct = original;
        window.bossResolveSegmentDamagePct = bridged;
        try{ bossResolveSegmentDamagePct = bridged; }catch(_){}
      }
      if(window.bossResolveSegmentDamagePct || typeof bossResolveSegmentDamagePct === "function") installedAny = true;
    }catch(_){}
    if(!installedAny) setTimeout(installStandaloneBossDamageBridge, 120);
  }

  function installStandaloneBossCheckRoutingBridge(){
    let installedAny = false;

    try{
      const original = window.renderTableBlock || (typeof renderTableBlock === "function" ? renderTableBlock : null);
      if(original && !original.__flprStandaloneBossCheckRoutingBridge){
        const bridged = function standaloneRenderTableBlockBossRouting(parent, tableName, nodes, opts){
          try{ standaloneRepairBossCheckNodeBuckets(); }catch(_){}
          const block = original.call(this, parent, tableName, standaloneFilterNonBossCheckNodes(nodes, opts), opts);
          try{
            if(String(opts?.tableKey || "").startsWith("boss|")){
              standaloneApplyBossCardPresentation();
              setTimeout(standaloneApplyBossCardPresentation, 0);
            }
          }catch(_){}
          return block;
        };
        bridged.__flprStandaloneBossCheckRoutingBridge = true;
        bridged.__flprStandaloneOriginalRenderTableBlock = original;
        window.renderTableBlock = bridged;
        try{ renderTableBlock = bridged; }catch(_){}
      }
      if(window.renderTableBlock || typeof renderTableBlock === "function") installedAny = true;
    }catch(_){}

    try{
      const original = window.resolveBossChecksNodes || (typeof resolveBossChecksNodes === "function" ? resolveBossChecksNodes : null);
      if(original && !original.__flprStandaloneBossCheckRoutingBridge){
        const bridged = function standaloneResolveBossChecksNodesBridge(){
          try{ standaloneRepairBossCheckNodeBuckets(); }catch(_){}
          const nodes = original.apply(this, arguments);
          return standaloneBuildBossSpecificCheckNodes(nodes);
        };
        bridged.__flprStandaloneBossCheckRoutingBridge = true;
        bridged.__flprStandaloneOriginalResolveBossChecksNodes = original;
        window.resolveBossChecksNodes = bridged;
        try{ resolveBossChecksNodes = bridged; }catch(_){}
      }
      if(window.resolveBossChecksNodes || typeof resolveBossChecksNodes === "function") installedAny = true;
    }catch(_){}

    try{
      const original = window.getTableCheckNodesForVisualComplete || (typeof getTableCheckNodesForVisualComplete === "function" ? getTableCheckNodesForVisualComplete : null);
      if(original && !original.__flprStandaloneBossCheckRoutingBridge){
        const bridged = function standaloneGetTableCheckNodesForVisualCompleteBridge(tableName, tableKey){
          try{ standaloneRepairBossCheckNodeBuckets(); }catch(_){}
          const nodes = original.apply(this, arguments);
          return standaloneFilterNonBossCheckNodes(Array.isArray(nodes) ? nodes : [], { tableKey });
        };
        bridged.__flprStandaloneBossCheckRoutingBridge = true;
        bridged.__flprStandaloneOriginalGetTableCheckNodesForVisualComplete = original;
        window.getTableCheckNodesForVisualComplete = bridged;
        try{ getTableCheckNodesForVisualComplete = bridged; }catch(_){}
      }
      if(window.getTableCheckNodesForVisualComplete || typeof getTableCheckNodesForVisualComplete === "function") installedAny = true;
    }catch(_){}

    try{
      const original = window.renderChecks || (typeof renderChecks === "function" ? renderChecks : null);
      if(original && !original.__flprStandaloneBossCheckRoutingBridge){
        const bridged = function standaloneRenderChecksBossRoutingBridge(){
          try{ standaloneRepairBossCheckNodeBuckets(); }catch(_){}
          const result = original.apply(this, arguments);
          standaloneApplyBossCardPresentation();
          setTimeout(standaloneApplyBossCardPresentation, 0);
          return result;
        };
        bridged.__flprStandaloneBossCheckRoutingBridge = true;
        bridged.__flprStandaloneOriginalRenderChecks = original;
        window.renderChecks = bridged;
        try{ renderChecks = bridged; }catch(_){}
      }
      if(window.renderChecks || typeof renderChecks === "function") installedAny = true;
    }catch(_){}

    try{
      const original = window.renderOverviewGrid || (typeof renderOverviewGrid === "function" ? renderOverviewGrid : null);
      if(original && !original.__flprStandaloneBossCheckRoutingBridge){
        const bridged = function standaloneRenderOverviewGridBossRoutingBridge(){
          try{ standaloneRepairBossCheckNodeBuckets(); }catch(_){}
          return original.apply(this, arguments);
        };
        bridged.__flprStandaloneBossCheckRoutingBridge = true;
        bridged.__flprStandaloneOriginalRenderOverviewGrid = original;
        window.renderOverviewGrid = bridged;
        try{ renderOverviewGrid = bridged; }catch(_){}
      }
      if(window.renderOverviewGrid || typeof renderOverviewGrid === "function") installedAny = true;
    }catch(_){}

    try{
      const original = window.tileEl || (typeof tileEl === "function" ? tileEl : null);
      if(original && !original.__flprStandaloneBossCheckRoutingBridge){
        const bridged = function standaloneTileElBossRoutingBridge(opts){
          let next = opts;
          try{
            if(opts && opts.isBossTable && !standaloneWorldKeyIsBoss(opts.worldKey)){
              next = { ...opts, isBossTable:false };
            }
          }catch(_){}
          return original.call(this, next);
        };
        bridged.__flprStandaloneBossCheckRoutingBridge = true;
        bridged.__flprStandaloneOriginalTileEl = original;
        window.tileEl = bridged;
        try{ tileEl = bridged; }catch(_){}
      }
      if(window.tileEl || typeof tileEl === "function") installedAny = true;
    }catch(_){}

    try{ window.flprStandaloneRepairBossCheckNodeBuckets = standaloneRepairBossCheckNodeBuckets; }catch(_){}
    try{ window.flprStandaloneIsExplicitBossCheckNode = standaloneIsExplicitBossCheckNode; }catch(_){}
    try{ standaloneRepairBossCheckNodeBuckets(); }catch(_){}
    if(!installedAny) setTimeout(installStandaloneBossCheckRoutingBridge, 120);
  }

  const standaloneApPacketBridge = {
    installed: false,
    nativeWebSocket: null,
    authoritativeReceived: new Map()
  };

  function standaloneReceivedAuthorityKey(itemIndex){
    const idx = Number(itemIndex);
    return Number.isFinite(idx) && idx >= 0 ? `idx:${Math.round(idx)}` : "";
  }

  function standaloneRememberAuthoritativeReceivedItemsPacket(pkt){
    try{
      if(String(pkt?.cmd || "") !== "ReceivedItems") return false;
      const items = Array.isArray(pkt.items) ? pkt.items : [];
      const baseIndex = Number.isFinite(Number(pkt.index)) ? Math.max(0, Math.round(Number(pkt.index))) : Math.max(0, Math.round(Number(ap?.lastReceivedIndex || 0)) || 0);
      if(baseIndex === 0) standaloneApPacketBridge.authoritativeReceived.clear();
      items.forEach((it, i)=>{
        const itemIndex = baseIndex + i;
        const key = standaloneReceivedAuthorityKey(itemIndex);
        if(!key) return;
        standaloneApPacketBridge.authoritativeReceived.set(key, {
          item:Number.isFinite(Number(it?.item)) ? Math.round(Number(it.item)) : null,
          location:standaloneReceivedPacketLocation(it),
          player:Number.isFinite(Number(it?.player)) ? Math.round(Number(it.player)) : null,
          flags:Number.isFinite(Number(it?.flags)) ? Math.round(Number(it.flags)) : 0,
          ts:Date.now()
        });
      });
      if(standaloneApPacketBridge.authoritativeReceived.size > 1200){
        const entries = Array.from(standaloneApPacketBridge.authoritativeReceived.entries()).slice(-800);
        standaloneApPacketBridge.authoritativeReceived = new Map(entries);
      }
      return true;
    }catch(_){}
    return false;
  }

  function standaloneAuthoritativeReceivedMatches(itemIndex, it, locId){
    try{
      const key = standaloneReceivedAuthorityKey(itemIndex);
      if(!key) return false;
      const rec = standaloneApPacketBridge.authoritativeReceived.get(key);
      if(!rec) return false;
      const itemId = Number(it?.item);
      if(Number.isFinite(itemId) && rec.item != null && Number(rec.item) !== Math.round(itemId)) return false;
      const loc = Number(locId ?? it?.location ?? it?.location_id ?? it?.loc);
      if(Number.isFinite(loc) && rec.location != null && Number(rec.location) !== Math.round(loc)) return false;
      const player = Number(it?.player ?? it?.player_id ?? it?.source_player ?? it?.sender);
      if(Number.isFinite(player) && rec.player != null && Number(rec.player) !== Math.round(player)) return false;
      return true;
    }catch(_){}
    return false;
  }

  function standaloneAuthoritativeMetaExists(meta){
    try{
      if(!meta || !standaloneApPacketBridge.authoritativeReceived.size) return false;
      const itemId = Number(meta.itemId);
      const locId = Number(meta.locId);
      const playerId = Number(meta.senderId || standaloneSelfSlotId() || 0) || 0;
      for(const rec of standaloneApPacketBridge.authoritativeReceived.values()){
        if(Number.isFinite(itemId) && rec.item != null && Number(rec.item) !== Math.round(itemId)) continue;
        if(Number.isFinite(locId) && locId > 0 && rec.location != null && Number(rec.location) !== Math.round(locId)) continue;
        if(playerId && rec.player != null && Number(rec.player) !== playerId) continue;
        return true;
      }
    }catch(_){}
    return false;
  }

  function standalonePruneUnauthoritativeReceivedRows(){
    try{
      const self = standaloneSelfSlotId();
      let list = Array.isArray(ap?.receivedAll) ? ap.receivedAll : (typeof loadReceivedList === "function" ? loadReceivedList() : []);
      if(!Array.isArray(list) || !list.length) return false;
      const deduped = standaloneDedupeReceivedRowsList(list);
      let changed = deduped.length !== list.length;
      list = deduped;
      if(!standaloneApPacketBridge.authoritativeReceived.size){
        if(!changed) return false;
        ap.receivedAll = list;
        standaloneRebuildReceivedKeySet();
        try{ if(typeof saveReceivedList === "function") saveReceivedList(list); }catch(_){}
        try{ if(typeof renderReceivedList === "function") renderReceivedList(list); }catch(_){}
        return true;
      }
      const seen = new Set();
      const next = [];
      for(const row of list){
        const itemName = String(row?.itemName || row?.baseItemName || "").trim();
        const isProgressive = !!standaloneProgressiveBallTarget(itemName);
        const sourceId = Number(row?.sourcePlayerId ?? row?.player ?? 0) || 0;
        const idx = Number(row?.recvIndex);
        const itemId = Number(row?.itemId ?? row?.item);
        const locId = Number(row?.locId ?? row?.location);
        const rowKey = standaloneReceivedSemanticKey(row) || [Number.isFinite(itemId) ? Math.round(itemId) : itemName, Number.isFinite(locId) ? Math.round(locId) : "", sourceId || self || ""].join("|");
        const authoritative = standaloneAuthoritativeReceivedMatches(idx, { item:itemId, player:sourceId || self }, locId);
        if(isProgressive && self && sourceId === self && !authoritative){
          changed = true;
          continue;
        }
        if(rowKey){
          if(seen.has(rowKey)){
            changed = true;
            continue;
          }
          seen.add(rowKey);
        }
        next.push(row);
      }
      if(!changed) return false;
      ap.receivedAll = next;
      standaloneRebuildReceivedKeySet();
      try{ if(typeof saveReceivedList === "function") saveReceivedList(next); }catch(_){}
      try{ if(typeof renderReceivedList === "function") renderReceivedList(next); }catch(_){}
      try{ if(typeof apLog === "function") apLog("Removed unconfirmed local received item(s); AP ReceivedItems remains authoritative.", { tab:"status" }); }catch(_){}
      return true;
    }catch(_){}
    return false;
  }

  function standaloneDeferredItemHasName(it){
    const itemIdNum = Number(it?.item);
    try{
      if(ap?.itemNameById?.get?.(it?.item)) return true;
    }catch(_){}
    try{
      if(Number.isFinite(itemIdNum) && typeof apDataPackageForGame === "function"){
        return !!apDataPackageForGame(ap?.cfg?.game)?.itemNameById?.get?.(itemIdNum);
      }
    }catch(_){}
    return false;
  }

  function standaloneFlushDeferredReceived(source){
    let flushed = 0;
    try{
      if(!ap || !Array.isArray(ap.receivedDeferred) || !ap.receivedDeferred.length) return 0;
      if(typeof processReceivedItem !== "function") return 0;
      const stillDeferred = [];
      for(const d of ap.receivedDeferred){
        const it = d?.it || {};
        if(!standaloneDeferredItemHasName(it)){
          stillDeferred.push(d);
          continue;
        }
        const itemIndex = d.itemIndex;
        const locId = (d.locId != null) ? d.locId : (d.paired && d.paired.locId != null ? d.paired.locId : null);
        processReceivedItem(it, itemIndex, locId, {
          noPopup: (d.noPopup ?? true),
          noFeed: (d.noFeed ?? true),
          isFlush: true,
          isSnapshot: !!d.isSnapshot,
          pairedOverride: d.paired || null
        });
        flushed++;
      }
      ap.receivedDeferred = stillDeferred;
      if(flushed && typeof apLog === "function"){
        apLog(`Standalone ReceivedItems flushed after ${source || "AP packet"}: ${flushed} (remaining ${ap.receivedDeferred.length})`, { tab:"status" });
      }
    }catch(err){
      try{ if(typeof apLog === "function") apLog("Standalone ReceivedItems flush failed; " + (err?.message || err), { tab:"errors" }); }catch(_){}
    }
    return flushed;
  }

  function standaloneReceivedInventorySignature(){
    try{
      const list = Array.isArray(ap?.receivedAll)
        ? ap.receivedAll
        : (typeof loadReceivedList === "function" ? loadReceivedList() : []);
      return standaloneDedupeReceivedRowsList(Array.isArray(list) ? list : []).map((row)=>{
        const idx = row?.recvIndex ?? "";
        const item = row?.itemId ?? row?.item ?? "";
        const loc = row?.locId ?? row?.location ?? "";
        const src = row?.sourcePlayerId ?? row?.player ?? "";
        const name = standaloneNormalizeLoose(row?.itemName || row?.baseItemName || "");
        return `${idx}:${item}:${loc}:${src}:${name}`;
      }).join("|");
    }catch(_){
      return "";
    }
  }

  function standaloneReceivedPacketLocation(it){
    const raw = it?.location ?? it?.location_id ?? it?.loc ?? null;
    const num = Number(raw);
    return Number.isFinite(num) ? num : null;
  }

  function standaloneReceivedItemsPacketSignature(pkt){
    try{
      const items = Array.isArray(pkt?.items) ? pkt.items : [];
      const baseIndex = Number.isFinite(Number(pkt?.index)) ? Math.max(0, Math.round(Number(pkt.index))) : Math.max(0, Math.round(Number(ap?.lastReceivedIndex || 0)) || 0);
      return `${baseIndex}:${items.length}:` + items.map((it, i)=>{
        const itemIndex = baseIndex + i;
        const itemId = Number.isFinite(Number(it?.item)) ? Math.round(Number(it.item)) : "";
        const locId = standaloneReceivedPacketLocation(it);
        const player = Number.isFinite(Number(it?.player)) ? Math.round(Number(it.player)) : "";
        const flags = Number.isFinite(Number(it?.flags)) ? Math.round(Number(it.flags)) : 0;
        return `${itemIndex}:${itemId}:${locId ?? ""}:${player}:${flags}`;
      }).join("|");
    }catch(_){
      return "";
    }
  }

  function standaloneReceivedInventoryCoversPacket(pkt){
    try{
      const items = Array.isArray(pkt?.items) ? pkt.items : [];
      const baseIndex = Number.isFinite(Number(pkt?.index)) ? Math.max(0, Math.round(Number(pkt.index))) : Math.max(0, Math.round(Number(ap?.lastReceivedIndex || 0)) || 0);
      const byIndex = ap?.receivedByIndex instanceof Map ? ap.receivedByIndex : new Map();
      if(items.length === 0) return byIndex.size === 0 || Number(ap?.lastReceivedIndex || 0) >= baseIndex;
      for(let i = 0; i < items.length; i++){
        const itemIndex = baseIndex + i;
        const incoming = items[i] || {};
        const existing = byIndex.get(itemIndex);
        if(!existing) return false;
        const incomingItem = Number(incoming.item);
        if(Number.isFinite(incomingItem) && Number(existing.item) !== incomingItem) return false;
        const incomingLoc = standaloneReceivedPacketLocation(incoming);
        const existingLoc = standaloneReceivedPacketLocation(existing);
        if(incomingLoc !== existingLoc) return false;
        const incomingPlayer = Number(incoming.player);
        if(Number.isFinite(incomingPlayer) && Number(existing.player) !== incomingPlayer) return false;
        const incomingFlags = Number(incoming.flags);
        if(Number.isFinite(incomingFlags) && Number(existing.flags || 0) !== incomingFlags) return false;
      }
      return true;
    }catch(_){
      return false;
    }
  }

  function standaloneShouldSuppressReceivedItemsPacket(pkt){
    try{
      if(String(pkt?.cmd || "") !== "ReceivedItems") return false;
      if(Array.isArray(ap?.receivedDeferred) && ap.receivedDeferred.length) return false;
      const sig = standaloneReceivedItemsPacketSignature(pkt);
      if(!sig) return false;
      const duplicatePacket = sig === standaloneReceivedRefreshState.lastPacketSig;
      const inventoryAlreadyMatches = standaloneReceivedInventoryCoversPacket(pkt);
      if(duplicatePacket && inventoryAlreadyMatches){
        standaloneReceivedRefreshState.blockedPackets = Number(standaloneReceivedRefreshState.blockedPackets || 0) + 1;
        try{
          const stats = window.__flprStandaloneReceivedRefreshStats || {
            total:0,
            rendered:0,
            reconciled:0,
            noops:0,
            lastSource:"",
            lastSig:""
          };
          stats.total = Number(stats.total || 0) + 1;
          stats.noops = Number(stats.noops || 0) + 1;
          stats.lastSource = "ReceivedItems-duplicate-packet";
          stats.lastSig = standaloneReceivedInventorySignature();
          stats.blockedPackets = Number(standaloneReceivedRefreshState.blockedPackets || 0);
          window.__flprStandaloneReceivedRefreshStats = stats;
        }catch(_){}
        return true;
      }
      standaloneReceivedRefreshState.lastPacketSig = sig;
      standaloneReceivedRefreshState.lastPacketAt = Date.now();
    }catch(_){}
    return false;
  }

  try{
    window.flprStandaloneShouldSuppressReceivedItemsPacketForTest = standaloneShouldSuppressReceivedItemsPacket;
    window.flprStandaloneReceivedPacketGateState = function(){
      return {
        lastPacketSig: String(standaloneReceivedRefreshState.lastPacketSig || ""),
        lastPacketAt: Number(standaloneReceivedRefreshState.lastPacketAt || 0),
        blockedPackets: Number(standaloneReceivedRefreshState.blockedPackets || 0),
        lastInventorySig: String(standaloneReceivedRefreshState.lastSig || "")
      };
    };
  }catch(_){}

  function standaloneRefreshReceivedFromServer(source){
    standaloneWithCounterDrawerFxSuppressed(()=>{
      const beforeSig = standaloneReceivedInventorySignature();
      const deferredBefore = Array.isArray(ap?.receivedDeferred) ? ap.receivedDeferred.length : 0;
      const flushWork = ()=>{
        try{ standaloneFlushDeferredReceived(source); }catch(_){}
        try{ if(typeof flushDeferredReceived === "function") flushDeferredReceived(); }catch(_){}
      };
      if(deferredBefore > 0){
        standalonePreserveChecksSelectionDuring(flushWork, `received-flush:${source || ""}`);
      }else{
        flushWork();
      }
      const afterSig = standaloneReceivedInventorySignature();
      const deferredAfter = Array.isArray(ap?.receivedDeferred) ? ap.receivedDeferred.length : 0;
      const now = Date.now();
      const changed = beforeSig !== afterSig || deferredBefore !== deferredAfter;
      const signatureChanged = afterSig !== standaloneReceivedRefreshState.lastSig;
      const shouldReconcile = changed || signatureChanged;
      try{
        const stats = window.__flprStandaloneReceivedRefreshStats || {
          total:0,
          rendered:0,
          reconciled:0,
          noops:0,
          lastSource:"",
          lastSig:""
        };
        stats.total = Number(stats.total || 0) + 1;
        stats.lastSource = String(source || "");
        stats.lastSig = afterSig;
        window.__flprStandaloneReceivedRefreshStats = stats;
      }catch(_){}
      if(shouldReconcile){
        standaloneReceivedRefreshState.lastSig = afterSig;
        standaloneReceivedRefreshState.lastAt = now;
        standalonePreserveChecksSelectionDuring(()=>{
          try{ if(typeof renderReceivedList === "function") renderReceivedList(); }catch(_){}
          try{ standaloneMirrorReceivedList(); }catch(_){}
          try{ if(typeof apReconcileWorldStateFromReceived === "function") apReconcileWorldStateFromReceived(); }catch(_){}
        }, `received-refresh:${source || ""}`);
        try{
          const stats = window.__flprStandaloneReceivedRefreshStats;
          if(stats){
            stats.rendered = Number(stats.rendered || 0) + 1;
            stats.reconciled = Number(stats.reconciled || 0) + 1;
          }
        }catch(_){}
      }else{
        standaloneReceivedRefreshState.lastAt = now;
        try{
          const stats = window.__flprStandaloneReceivedRefreshStats;
          if(stats) stats.noops = Number(stats.noops || 0) + 1;
        }catch(_){}
      }
      if(shouldReconcile){
        try{ if(typeof updateCountCheckUI === "function") updateCountCheckUI(); }catch(_){}
        try{ standaloneScheduleTextRender("received-refresh"); }catch(_){}
      }
    });
  }

  function standaloneScheduleReceivedRefresh(source){
    try{
      standaloneReceivedRefreshState.timers.forEach((timer)=>clearTimeout(timer));
    }catch(_){}
    standaloneReceivedRefreshState.timers = [];
    const delays = source === "DataPackage" ? [40, 420] : [30, 360];
    delays.forEach((delay)=>{
      const timer = setTimeout(()=>{
        try{
          standaloneReceivedRefreshState.timers = standaloneReceivedRefreshState.timers.filter((item)=>item !== timer);
        }catch(_){}
        standaloneRefreshReceivedFromServer(source);
      }, delay);
      standaloneReceivedRefreshState.timers.push(timer);
    });
  }

  function standaloneAttachApSocket(ws){
    if(!ws || ws.__flprStandaloneApPacketBridge) return ws;
    ws.__flprStandaloneApPacketBridge = true;
    try{
      ws.addEventListener("message", (event)=>{
        let arr;
        try{ arr = JSON.parse(event.data); }catch(_){ return; }
        if(!Array.isArray(arr)) arr = [arr];
        try{
          arr.forEach((pkt)=>{ if(String(pkt?.cmd || "") === "ReceivedItems") standaloneRememberAuthoritativeReceivedItemsPacket(pkt); });
          if(arr.length && arr.every((pkt)=>String(pkt?.cmd || "") === "ReceivedItems")){
            let suppressAll = true;
            for(const pkt of arr){
              if(!standaloneShouldSuppressReceivedItemsPacket(pkt)){
                suppressAll = false;
                break;
              }
            }
            if(suppressAll){
              try{ event.stopImmediatePropagation(); }catch(_){}
              try{ event.preventDefault(); }catch(_){}
              return;
            }
          }
        }catch(_){}
        const cmds = new Set(arr.map((pkt)=>String(pkt?.cmd || "")));
        let playerMetaChanged = false;
        arr.forEach((pkt)=>{
          playerMetaChanged = standaloneRememberApPacketPlayerMeta(pkt) || playerMetaChanged;
          const cmd = String(pkt?.cmd || "");
          if(cmd === "Connected" || cmd === "RoomUpdate") standaloneRememberMissingLocationsForHints(pkt);
          if(cmd === "LocationInfo") standaloneHandleLocationInfoForHints(pkt);
          if(cmd === "Retrieved") standaloneHandleRetrievedServerHints(pkt);
        });
        if(playerMetaChanged){
          try{ standaloneRequestMissingGamePackages("AP player metadata"); }catch(_){}
          setTimeout(()=>{
            try{ standaloneRepairBossCheckNodeBuckets(); }catch(_){}
            try{ standaloneRepairPersistedApState(); }catch(_){}
            try{ standaloneFlushPendingSentItemModals(); }catch(_){}
            try{ standaloneRenderItemPanel(); }catch(_){}
          }, 0);
        }
        arr.forEach((pkt)=>{
          if(String(pkt?.cmd || "") === "PrintJSON"){
            standaloneRememberJsonItemLogMeta(pkt);
            try{ standaloneHandlePrintJsonServerHint(pkt); }catch(_){}
            try{
              const meta = standaloneExtractItemSendMeta(pkt);
              if(meta) standaloneRememberItemSendLogMeta(meta);
            }catch(_){}
            standaloneRecordSentItemFromPacket(pkt);
          }
        });
        if(cmds.has("DataPackage")){
          standaloneScheduleReceivedRefresh("DataPackage");
          setTimeout(()=>{
            try{ standaloneRepairBossCheckNodeBuckets(); }catch(_){}
            try{ standaloneRepairPersistedApState(); }catch(_){}
            try{ standaloneApplyBossHintLocationInfo("DataPackage", { force:true }); }catch(_){}
            try{ standaloneScheduleBossKeyScout("DataPackage"); }catch(_){}
            try{ standaloneRefreshServerHintFoundStates(); }catch(_){}
            try{ standaloneScheduleServerHintRequest("DataPackage"); }catch(_){}
            try{ standaloneFlushPendingSentItemModals(); }catch(_){}
            try{ standaloneRenderItemPanel(); }catch(_){}
          }, 0);
        }
        if(cmds.has("ReceivedItems")) standaloneScheduleReceivedRefresh("ReceivedItems");
        if(cmds.has("Print") || cmds.has("PrintJSON") || cmds.has("RoomUpdate") || cmds.has("Connected")){
          setTimeout(()=>{
            try{ standaloneRepairBossCheckNodeBuckets(); }catch(_){}
            try{ standaloneRepairPersistedApState(); }catch(_){}
            try{ standaloneRefreshServerHintFoundStates(); }catch(_){}
            try{ standalonePersistNativeLogBuffers(); }catch(_){}
            try{ standaloneScheduleTextRender("packet-burst"); }catch(_){}
            try{ standaloneRenderItemPanel(); }catch(_){}
          }, 0);
        }
      });
    }catch(_){}
    return ws;
  }

  function installStandaloneApPacketBridge(){
    if(standaloneApPacketBridge.installed) return;
    standaloneApPacketBridge.installed = true;
    try{
      const NativeWebSocket = window.WebSocket;
      if(typeof NativeWebSocket !== "function") return;
      standaloneApPacketBridge.nativeWebSocket = NativeWebSocket;
      function StandaloneWebSocket(){
        const ws = new NativeWebSocket(...arguments);
        return standaloneAttachApSocket(ws);
      }
      try{ Object.setPrototypeOf(StandaloneWebSocket, NativeWebSocket); }catch(_){}
      try{ StandaloneWebSocket.prototype = NativeWebSocket.prototype; }catch(_){}
      try{
        Object.getOwnPropertyNames(NativeWebSocket).forEach((key)=>{
          if(key in StandaloneWebSocket) return;
          const desc = Object.getOwnPropertyDescriptor(NativeWebSocket, key);
          if(desc) Object.defineProperty(StandaloneWebSocket, key, desc);
        });
      }catch(_){}
      window.WebSocket = StandaloneWebSocket;
    }catch(err){
      try{ if(typeof apLog === "function") apLog("Standalone AP packet bridge failed; " + (err?.message || err), { tab:"errors" }); }catch(_){}
    }
  }

  function installStandaloneTextClientDelegates(){
    installStandaloneNoFlprBotSyncBridge();
    installStandaloneApTextFormatter();
    installStandaloneApPacketBridge();
    installStandaloneTableLookupBridge();
    installStandaloneUnlockFxBridge();
    installStandaloneSfxDedupeBridge();
    installStandaloneBossIncomingGateBridge();
    installStandaloneSiegeNotificationQueueBridge();
    installStandaloneBesiegedSelectionBridge();
    standaloneInstallSiegeVictoryClickBridge();
    installStandaloneChecksSelectionBridge();
    installStandaloneProgressiveChecksRewardBridge();
    installStandaloneChecksBackgroundBridge();
    installStandaloneLocationCheckBridge();
    installStandaloneBossPhaseMusicBridge();
    installStandaloneBossDamageBridge();
    installStandaloneBossCheckRoutingBridge();
    installStandaloneBossVictoryAwardFilterBridge();
    installStandaloneBossHintBridge();
    standaloneResetTextLogsForNewSession();
    installStandaloneTextLogBridge();
    installStandaloneReceivedListBridge();
    installStandaloneReceivedAddBridge();
    installStandaloneReceivedRewardBridge();
    installStandaloneCounterDrawerSuppressionBridge();
    installStandaloneSentItemNotificationBridge();
    window.flprStandaloneTextClientSend = submitStandaloneTextClientSay;
    window.flprStandaloneTextClientSetTab = activateStandaloneTextClientTabByName;
    window.flprStandaloneItemTab = activateStandaloneItemTab;
    window.flprStandaloneSyncReceived = syncStandaloneReceived;
    window.flprStandaloneTextClientRender = standaloneTextRender;
    window.flprStandaloneRefreshReceivedFromServer = standaloneRefreshReceivedFromServer;
    window.flprStandaloneScheduleReceivedRefresh = standaloneScheduleReceivedRefresh;
    window.flprStandaloneRepairPersistedApState = ()=>{
      try{ standaloneItemPanel.sentLoaded = false; }catch(_){}
      try{ standaloneTextClient.loaded = false; }catch(_){}
      try{ standaloneRepairBossCheckNodeBuckets(); }catch(_){}
      return standaloneRepairPersistedApState();
    };
    window.flprStandaloneCopySelectedItemText = ()=>standaloneCopyText(standaloneItemPanel.selectedText);
    if(window.__flprStandaloneTextClientDelegates === true) return;
    window.__flprStandaloneTextClientDelegates = true;
    const isTextClientTarget = (target)=>!!(target && target.closest && target.closest(".apConnLog"));
    const isEditableTarget = (target)=>{
      const tag = String(target?.tagName || "").toLowerCase();
      return tag === "input" || tag === "textarea" || tag === "select" || !!target?.isContentEditable;
    };
    document.addEventListener("submit", (event)=>{
      if(event.target && event.target.id === "apClientSayForm"){
        submitStandaloneTextClientSay(event);
      }
    }, true);
    document.addEventListener("keydown", (event)=>{
      const target = event.target;
      if(target && target.id === "apClientSayInput" && event.key === "Enter" && !event.shiftKey){
        submitStandaloneTextClientSay(event);
        return;
      }
      if((event.ctrlKey || event.metaKey) && String(event.key || "").toLowerCase() === "c" && !isEditableTarget(target) && standaloneItemPanel.selectedText){
        event.preventDefault();
        standaloneCopyText(standaloneItemPanel.selectedText);
      }
    }, true);
    document.addEventListener("pointerdown", (event)=>{
      if(!event.target.closest?.(".standaloneItemCopyMenu")) standaloneHideItemCopyMenu();
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
      const itemSound = event.target.closest?.("#standaloneItemLogSoundBtn");
      if(itemSound){
        standaloneToggleItemLogSound(event);
        return;
      }
      const itemTab = event.target.closest?.(".standaloneItemTab");
      if(itemTab){
        activateStandaloneItemTab(itemTab.dataset.standaloneItemTab, event);
        return;
      }
      if(!isTextClientTarget(event.target)) return;
      const apLogSound = event.target.closest("#standaloneApLogClickSoundBtn");
      if(apLogSound){
        standaloneToggleApLogClickSound(event);
        return;
      }
      const send = event.target.closest("#apClientSayBtn");
      if(send){
        submitStandaloneTextClientSay(event);
        return;
      }
      const tab = event.target.closest(".apLogTab");
      if(tab){
        activateStandaloneTextClientTab(tab, event);
        return;
      }
      const clickText = event.target.closest(".apLogPlayer, .apLogLine");
      if(clickText){
        standalonePlayApLogClick();
      }
    }, true);
    setTimeout(()=>{
      try{
        window.apLog ? window.apLog("AP Text Client ready; connect to a server, then type chat or !hint commands here.", { tab:"chat", mirrorTabs:["status"] }) : standaloneTextMirrorLog("AP Text Client ready; connect to a server, then type chat or !hint commands here.", { tab:"chat", mirrorTabs:["status"] });
      }catch(_){}
      standaloneRepairPersistedApState();
      standaloneScheduleTextRender("delegates-ready");
      standaloneRenderItemPanel();
    }, 0);
  }

  function bindStandaloneApControls(){
    installStandaloneTextClientDelegates();
    const s = standalonePrimaryControl("#apServer");
    const p = standalonePrimaryControl("#apPlayer");
    const g = standalonePrimaryControl("#apGame");
    const pw = standalonePrimaryControl("#apPass");
    const btnC = standalonePrimaryControl("#apConnectBtn");
    const btnD = standalonePrimaryControl("#apDisconnectBtn");
    const btnSaveAp = standalonePrimaryControl("#saveApCfgBtn");
    const cfg = apCfg();
    const syncApFieldsFromStandalone = ()=>{
      const next = {
        server: (s?.value || "").trim(),
        player: (p?.value || standaloneApDefaultPlayer()).trim(),
        game: (g?.value || STANDALONE_FLIPPERMIZER_GAME_NAME).trim(),
        pass: (pw?.value || "")
      };
      try{ standaloneControlAll("#apServer").forEach((node)=>{ node.value = next.server; }); }catch(_){}
      try{ standaloneControlAll("#apPlayer").forEach((node)=>{ node.value = next.player; }); }catch(_){}
      try{ standaloneControlAll("#apGame").forEach((node)=>{ node.value = next.game; }); }catch(_){}
      try{ standaloneControlAll("#apPass").forEach((node)=>{ node.value = next.pass; }); }catch(_){}
      try{
        if(typeof ap !== "undefined" && ap?.cfg){
          ap.cfg.server = next.server;
          ap.cfg.player = next.player;
          ap.cfg.game = next.game;
          ap.cfg.pass = next.pass;
        }
      }catch(_){}
      return next;
    };
    const saveApFieldsFromStandalone = ()=>{
      const next = syncApFieldsFromStandalone();
      try{
        if(typeof saveApCfg === "function") saveApCfg(next);
      }catch(_){}
      try{
        if(typeof ap !== "undefined" && ap?.cfg && typeof saveApCfg === "function") saveApCfg(ap.cfg);
      }catch(_){}
      return next;
    };

    if(s && !s.__flprStandaloneValueLoaded){ s.value = cfg.server || ""; s.__flprStandaloneValueLoaded = true; }
    if(p && !p.__flprStandaloneValueLoaded){ p.value = cfg.player || standaloneApDefaultPlayer(); p.__flprStandaloneValueLoaded = true; }
    if(g && !g.__flprStandaloneValueLoaded){ g.value = cfg.game || STANDALONE_FLIPPERMIZER_GAME_NAME; g.__flprStandaloneValueLoaded = true; }
    if(pw && !pw.__flprStandaloneValueLoaded){ pw.value = cfg.pass || ""; pw.__flprStandaloneValueLoaded = true; }

    try{
      if(typeof updateApConnectButtons === "function" && typeof ap !== "undefined"){
        updateApConnectButtons(ap.connected ? "connected" : "offline");
      }
    }catch(_){}

    if(btnC) btnC.onclick = ()=>{
      playClick();
      standaloneSetSelectedMode("archipelago");
      saveApFieldsFromStandalone();
      try{ if(typeof safeApConnect === "function") safeApConnect(); }catch(err){ try{ console.error(err); }catch(_){} }
    };
    if(btnD) btnD.onclick = ()=>{
      playClick();
      try{ standaloneCaptureMultiplayerSnapshot("manual-disconnect"); }catch(_){}
      try{ if(typeof apDisconnect === "function") apDisconnect(); }catch(err){ try{ console.error(err); }catch(_){} }
      standaloneMarkRandomizerClosed();
    };
    if(btnSaveAp) btnSaveAp.onclick = ()=>{
      playClick();
      try{
        const next = saveApFieldsFromStandalone();
        if(typeof apLog === "function") apLog("AP settings saved");
        if(typeof toast === "function") toast("good", "AP SETTINGS SAVED", next.server || "server not set", 1800);
      }catch(err){ try{ console.error(err); }catch(_){} }
    };

    const btnSR = standalonePrimaryControl("#apSyncReceivedBtn");
    const btnCR = standalonePrimaryControl("#apClearReceivedBtn");
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
      if(standaloneItemTabName(standaloneItemPanel.activeTab) === "sent"){
        standaloneItemPanel.sent = [];
        standaloneItemPanel.selectedKey = "";
        standaloneItemPanel.selectedText = "";
        standaloneSaveSentItems();
        standaloneRenderItemPanel();
        return;
      }
      try{ if(typeof rememberApStartBaselineFromSlotData === "function") rememberApStartBaselineFromSlotData(ap?.slotData, state?.worlds || {}); }catch(_){}
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
      try{
        standaloneItemPanel.knownReceivedKeys.clear();
        standaloneItemPanel.newReceivedKeys.clear();
        standaloneItemPanel.newestReceivedKey = "";
      }catch(_){}
      try{ standaloneApPacketBridge.authoritativeReceived.clear(); }catch(_){}
      try{ localStorage.setItem("flpr_ap_last_received_index", "0"); }catch(_){}
      try{ if(typeof saveReceivedList === "function") saveReceivedList([]); }catch(_){}
      try{
        if(typeof seedApStartBaseline === "function"){
          seedApStartBaseline(state, ap?.slotData || {});
          if(typeof saveState === "function") saveState();
        }
      }catch(_){}
      try{ if(typeof apReconcileWorldStateFromReceived === "function") standaloneWithCounterDrawerFxSuppressed(()=>apReconcileWorldStateFromReceived()); }catch(_){}
      try{ if(typeof renderReceivedList === "function") renderReceivedList([]); }catch(_){}
      try{ standaloneRenderItemPanel(); }catch(_){}
      try{ if(typeof renderAll === "function") renderAll(); }catch(_){}
      try{ if(typeof updateCountCheckUI === "function") updateCountCheckUI(); }catch(_){}
      try{ if(typeof forceReceivedSync === "function") forceReceivedSync(true); }catch(_){}
    };

    const logTabs = standalonePrimaryControl("#apLogTabs");
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
      standaloneControlAll("#apLogTabs .apLogTab").forEach((btn)=>{
        if(btn.__flprStandaloneDirectBound === true) return;
        btn.__flprStandaloneDirectBound = true;
        btn.addEventListener("pointerup", (event)=>activateLogTab(btn, event), true);
        btn.addEventListener("click", (event)=>activateLogTab(btn, event), true);
      });
    }catch(_){}
    const submitStandaloneSay = (event)=>submitStandaloneTextClientSay(event);
    try{
      if(typeof bindApSayControls === "function"){
        bindApSayControls();
      }else{
        const sayForm = standalonePrimaryControl("#apClientSayForm");
        const sayInput = standalonePrimaryControl("#apClientSayInput");
        if(sayForm && sayInput && sayForm.__flprStandaloneBound !== true){
          sayForm.__flprStandaloneBound = true;
          sayForm.addEventListener("submit", (event)=>{
            submitStandaloneSay(event);
          });
        }
      }
    }catch(_){}
    try{
      const sayBtn = standalonePrimaryControl("#apClientSayBtn");
      if(sayBtn && sayBtn.__flprStandaloneDirectBound !== true){
        sayBtn.__flprStandaloneDirectBound = true;
        try{ sayBtn.type = "button"; }catch(_){}
        sayBtn.addEventListener("pointerup", submitStandaloneSay, true);
        sayBtn.addEventListener("click", submitStandaloneSay, true);
      }
    }catch(_){}
    try{
      const sayForm = standalonePrimaryControl("#apClientSayForm");
      if(sayForm && sayForm.__flprStandaloneDirectSubmitBound !== true){
        sayForm.__flprStandaloneDirectSubmitBound = true;
        sayForm.addEventListener("submit", submitStandaloneSay, true);
      }
      const sayInput = standalonePrimaryControl("#apClientSayInput");
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
      try{ saveApFieldsFromStandalone(); }catch(_){}
    };
    if(p) p.onchange = ()=>{
      try{ saveApFieldsFromStandalone(); }catch(_){}
    };
    if(g) g.onchange = ()=>{
      try{ saveApFieldsFromStandalone(); }catch(_){}
    };
    if(pw) pw.onchange = ()=>{
      try{ saveApFieldsFromStandalone(); }catch(_){}
    };
  }

  function rebuildStandaloneControls(){
    const body = document.querySelector(".controlsBody");
    if(!body) return false;
    const tabs = body.querySelector(".controlsTabs");
    const panels = body.querySelector(".controlsPanels");
    if(!tabs || !panels) return false;

    const firstStandalonePass = !document.body.classList.contains("flprStandaloneOriginalClient");
    let current = firstStandalonePass ? (localStorage.getItem("flpr_controls_tab_v1") || "multiplayer") : activeControlTab();
    if(current === "connect" || current === "archipelago") current = "multiplayer";
    if(current !== "singleplayer" && current !== "multiplayer" && current !== "house" && current !== "visuals" && current !== "achievements") current = "multiplayer";
    document.body.classList.add("flprStandaloneOriginalClient");
    injectStandaloneStyles();
    installStandaloneNoEpisodeBridge();
    installStandaloneBossVictoryAwardFilterBridge();
    installStandaloneAchievementProfileBridge();
    installStandaloneAchievementDismissBridge();
    installStandaloneRandomizerConnectionBridge();
    standaloneEnsureActiveProfileApplied();
    applyStandaloneWindowScale();
    standaloneEnsureAutoSwapDefault();
    standaloneEnsureApLogItemTooltip();

    const controlsHead = document.querySelector(".controlsHead, .controlsHeadTitle");
    if(controlsHead) controlsHead.textContent = "MENU";

    const needsTabs =
      tabs.dataset.flprStandaloneTabs !== "1" ||
      !tabs.querySelector('[data-ctrl-tab="visuals"]') ||
      !tabs.querySelector('[data-ctrl-tab="achievements"]') ||
      !tabs.querySelector('[data-ctrl-tab="singleplayer"], [data-ctrl-tab="multiplayer"]') ||
      tabs.querySelector('[data-ctrl-tab="house"]') ||
      tabs.querySelector('[data-ctrl-tab="connect"]') ||
      tabs.querySelector('[data-ctrl-tab="testing"]');

    if(needsTabs){
      tabs.dataset.flprStandaloneModeTabs = "";
    }
    standaloneRenderMenuTabs(current);

    const singleplayer = ensurePanel(panels, "singleplayer");
    const multiplayer = ensurePanel(panels, "multiplayer");
    const house = ensurePanel(panels, "house");
    const visuals = ensurePanel(panels, "visuals");
    const achievements = ensurePanel(panels, "achievements");
    if(!achievements.id) achievements.id = "achievementsControlsPanel";

    try{
      if(typeof compactVisualsControlsLayout === "function") compactVisualsControlsLayout(visuals);
      if(typeof ensureMusicScenarioControls === "function") ensureMusicScenarioControls();
      if(typeof wireTableBannerGalleryControls === "function") wireTableBannerGalleryControls();
      prepareStandaloneVisualsPanel(visuals);
        installStandaloneChecksBackgroundBridge();
        installStandaloneNoEpisodeBridge();
    }catch(_){}

    if(
      singleplayer.dataset.flprStandaloneSingleplayer !== "1" ||
      !singleplayer.querySelector("#standaloneStartSeedBtn") ||
      !singleplayer.querySelector("#standaloneSeedSaveList")
    ){
      singleplayer.dataset.flprStandaloneSingleplayer = "1";
      singleplayer.innerHTML = standaloneSingleplayerPanelHtml();
    }

    if(
      multiplayer.dataset.flprStandaloneConnect !== "1" ||
      !multiplayer.querySelector(".standaloneArchipelagoSection") ||
      !multiplayer.querySelector("#receivedBody") ||
      multiplayer.querySelector(".standaloneConnectionModeShell")
    ){
      multiplayer.dataset.flprStandaloneConnect = "1";
      multiplayer.innerHTML = connectPanelHtml(apCfg());
    }

    if(
      house.dataset.flprStandaloneGiftHouseTest !== "1" ||
      !house.querySelector("#giftHouseTest")
    ){
      house.dataset.flprStandaloneGiftHouseTest = "1";
      if(window.flprStandaloneGiftHouseTest && typeof window.flprStandaloneGiftHouseTest.mountPanel === "function"){
        window.flprStandaloneGiftHouseTest.mountPanel(house);
      }else{
        house.innerHTML = `
          <div class="standaloneControlSection" data-accent="gold">
            <div class="standaloneSectionTitle">GIFT HOUSE <span class="mini">test module loading</span></div>
            <div class="apHint">Gift House Test will mount here when its standalone module loads.</div>
          </div>
        `;
      }
    }else if(window.flprStandaloneGiftHouseTest && typeof window.flprStandaloneGiftHouseTest.mountPanel === "function"){
      window.flprStandaloneGiftHouseTest.mountPanel(house);
    }

    Array.from(panels.children).forEach((panel)=>{
      if(panel === singleplayer || panel === multiplayer || panel === house || panel === visuals || panel === achievements) return;
      panel.style.display = "none";
      panel.classList.remove("active");
    });
    panels.appendChild(singleplayer);
    panels.appendChild(multiplayer);
    panels.appendChild(house);
    panels.appendChild(visuals);
    panels.appendChild(achievements);

    try{ if(typeof renderAchievementsControlsPanel === "function") renderAchievementsControlsPanel(); }catch(_){}
    bindStandaloneControls();
    standaloneRefreshProfileUi();
    applyControlFontScale();
    setControlTab(current);
    try{
      if(!window.__flprStandaloneQuickStartScheduled){
        window.__flprStandaloneQuickStartScheduled = true;
        setTimeout(standaloneMaybeShowQuickStart, 1400);
      }
    }catch(_){}
    try{
      standaloneRenderModeHud();
      standaloneRenderModeSwitchHud(standaloneCurrentMenuMode());
      standalonePositionModeHud();
      standalonePositionModeSwitchHud();
      [80, 240, 520].forEach((delay)=>setTimeout(()=>{
        try{ standalonePositionModeHud(); standalonePositionModeSwitchHud(); }catch(_){}
      }, delay));
    }catch(_){}
    return true;
  }
  try{ window.flprStandaloneRebuildControls = rebuildStandaloneControls; }catch(_){}

  function bootStandaloneBridge(){
    const attempt = ()=>{
      try{
        installStandaloneTaskTooltipBridge();
        installStandaloneStrategyTooltipBridge();
        standaloneEnsureOverviewModalVisibleHost();
        installStandaloneTableLookupBridge();
        installStandaloneUnlockFxBridge();
        installStandaloneSfxDedupeBridge();
        installStandaloneBossIncomingGateBridge();
        installStandaloneSiegeNotificationQueueBridge();
        installStandaloneBesiegedSelectionBridge();
        standaloneInstallSiegeVictoryClickBridge();
        installStandaloneChecksSelectionBridge();
        installStandaloneProgressiveChecksRewardBridge();
        installStandaloneChecksBackgroundBridge();
        installStandaloneNoEpisodeBridge();
        installStandaloneBossVictoryAwardFilterBridge();
        installStandaloneAchievementProfileBridge();
        installStandaloneAchievementDismissBridge();
        installStandaloneRandomizerConnectionBridge();
        installStandaloneRandomizerOpenMusicBridge();
        installStandaloneNoEpisodeBridge();
        installStandaloneNoChatHangmanBridge();
        installStandaloneLocationCheckBridge();
        standaloneEnsureApLogItemTooltip();
        installStandaloneBossPhaseMusicBridge();
        installStandaloneBossDamageBridge();
        installStandaloneBossCheckRoutingBridge();
        installStandaloneBossHintBridge();
        installStandaloneReceivedAddBridge();
        rebuildStandaloneControls();
        standaloneRefreshProfileUi();
        installStandaloneNoChatHangmanBridge();
        installStandaloneNoEpisodeBridge();
        applyStandaloneWindowScale();
      }catch(err){ try{ console.error(err); }catch(_){} }
    };
    if(!window.__flprStandaloneResizeBound){
      window.__flprStandaloneResizeBound = true;
      window.addEventListener("resize", applyStandaloneWindowScale, { passive:true });
    }
    if(!window.__flprStandaloneCounterTimer){
      window.__flprStandaloneCounterTimer = setInterval(renderStandaloneCounters, 1000);
      try{
        window.addEventListener("beforeunload", ()=>{
          try{ clearInterval(window.__flprStandaloneCounterTimer); }catch(_){}
          window.__flprStandaloneCounterTimer = 0;
        }, { once:true });
      }catch(_){}
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
