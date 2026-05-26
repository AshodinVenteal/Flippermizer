(function(){
  "use strict";

  const HOUSE_NAMESPACE = "giftHouseTest";
  const HOUSE_FALLBACK_LS = "flpr_standalone_gift_house_test_v1";
  const HOUSE_STYLE_ID = "flprStandaloneGiftHouseTestStyles";
  const HOUSE_PANEL_ID = "giftHouseTest";

  const manualGiftThemes = Object.freeze({
    MM: { giftName:"Castle Crown", emoji:"🏰⚔️👑", houseEmoji:["👑","⚔️"] },
    AFM: { giftName:"Martian Saucer Trophy", emoji:"🛸👽💥", houseEmoji:["👽","🛸"] },
    WCS: { giftName:"Striker Cup", emoji:"⚽🏆💫", houseEmoji:["⚽","🏆"] },
    GET: { giftName:"Pursuit Badge", emoji:"🚓💨🏁", houseEmoji:["🚓","🏁"] },
    ST13: { giftName:"Starfleet Relic", emoji:"🚀🖖🌌", houseEmoji:["🚀","🖖"] },
    TOTAN: { giftName:"Arabian Night Lamp", emoji:"🪔✨🌙", houseEmoji:["🌙","✨"] },
    FATH: { giftName:"Deepwater Idol", emoji:"🌊🔱💎", houseEmoji:["🌊","💎"] },
    HOOK: { giftName:"Neverland Hook", emoji:"🪝🏴‍☠️✨", houseEmoji:["🪝","✨"] },
    CONGO: { giftName:"Volcano Map", emoji:"🗺️🌋💎", houseEmoji:["🌋","💎"] },
    ATEAM: { giftName:"Battle Van Mini", emoji:"🚐💥⭐", houseEmoji:["🚐","⭐"] },
    BAT66: { giftName:"Neon Bat Signal", emoji:"🦇📺💡", houseEmoji:["🦇","💡"] },
    BAYW: { giftName:"Lifeguard Tower", emoji:"🌊🛟🏖️", houseEmoji:["🛟","🌊"] },
    STTNG: { giftName:"Bridge Console", emoji:"🖖🛸💫", houseEmoji:["🖖","💫"] },
    MET: { giftName:"Meteor Shard", emoji:"☄️🔥🪨", houseEmoji:["☄️","🔥"] },
    HGT: { giftName:"Court Souvenir", emoji:"🏀🌍🎟️", houseEmoji:["🏀","🎟️"] },
    DP: { giftName:"Jukebox Bloom", emoji:"🎤🌸🎵", houseEmoji:["🎤","🌸"] },
    PARA: { giftName:"Paragon Relic", emoji:"🛡️🐉💎", houseEmoji:["🛡️","💎"] },
    ROBO: { giftName:"Cyber Badge", emoji:"🤖🚔⚡", houseEmoji:["🤖","⚡"] },
    GLIZ: { giftName:"Lizard Crest", emoji:"🦎👑🌿", houseEmoji:["🦎","👑"] },
    JOK: { giftName:"Joker Cabinet", emoji:"🃏🎰✨", houseEmoji:["🃏","🎰"] },
    BCAT: { giftName:"Alley Jackpot", emoji:"🐈🎲💰", houseEmoji:["🐈","💰"] },
    TAXI: { giftName:"Fare Meter", emoji:"🚕💡🧳", houseEmoji:["🚕","💡"] },
    BOP: { giftName:"Bride Core", emoji:"🤖💍💡", houseEmoji:["🤖","💍"] },
    WW: { giftName:"Rapids Souvenir", emoji:"🌊🛶⛰️", houseEmoji:["🛶","⛰️"] },
    HSPD: { giftName:"Highway Medal", emoji:"🏎️🚦🔥", houseEmoji:["🏎️","🚦"] },
    NFEAR: { giftName:"Stunt Helmet", emoji:"🏂⚡🏆", houseEmoji:["🏂","⚡"] },
    SMVE: { giftName:"Webbed Emblem", emoji:"🕸️🦸💥", houseEmoji:["🕸️","💥"] },
    IMVE: { giftName:"Arc Reactor Trophy", emoji:"🦾⚙️💥", houseEmoji:["⚙️","💥"] },
    ACDC: { giftName:"Thunder Amp", emoji:"🎸⚡🔊", houseEmoji:["🎸","⚡"] },
    MBASH: { giftName:"Monster Stage Amp", emoji:"🎸🧟🎤", houseEmoji:["🎸","🎤"] },
    TOM: { giftName:"Magic Cabinet", emoji:"🎩✨🎭", houseEmoji:["🎩","✨"] },
    CFTBL: { giftName:"Lagoon Reel", emoji:"🎞️🌊🫧", houseEmoji:["🎞️","🌊"] },
    TAF: { giftName:"Gothic Doorbell", emoji:"🖤🏚️🛎️", houseEmoji:["🏚️","🛎️"] },
    SMB: { giftName:"Plumber Bonus Block", emoji:"🍄🧱⭐", houseEmoji:["🍄","⭐"] },
    SF2: { giftName:"World Warrior Token", emoji:"🥋🔥🕹️", houseEmoji:["🥋","🔥"] },
    QBERT: { giftName:"Pyramid Pixel", emoji:"🔶🕹️💬", houseEmoji:["🔶","🕹️"] },
    MMPAC: { giftName:"Maze Heart", emoji:"🟡💗🕹️", houseEmoji:["🟡","💗"] },
    SINV: { giftName:"Invader Cabinet", emoji:"👾🚀🕹️", houseEmoji:["👾","🚀"] },
    MONOP: { giftName:"Boardwalk Deed", emoji:"🎩🏦💵", houseEmoji:["🎩","💵"] },
    DND: { giftName:"Dungeon Trophy", emoji:"🐉🎲🗝️", houseEmoji:["🎲","🗝️"] },
    WPT: { giftName:"Final Table Chip", emoji:"♠️🎲🏆", houseEmoji:["♠️","🏆"] },
    HRC: { giftName:"Neon Casino Chip", emoji:"🎰💎🃏", houseEmoji:["🎰","💎"] },
    WHOD: { giftName:"Detective File", emoji:"🕵️📁💡", houseEmoji:["🕵️","💡"] },
    BOSS_TABLE: { giftName:"Boss Aether Key", emoji:"🗝️💀⚡", houseEmoji:["🗝️","⚡"] }
  });

  const fallbackThemes = Object.freeze([
    { suffix:"Neon Trophy", emoji:"🏆✨🎱", houseEmoji:["🏆","✨"] },
    { suffix:"Arcade Relic", emoji:"🕹️💎⚡", houseEmoji:["🕹️","💎"] },
    { suffix:"City Souvenir", emoji:"🌃🎟️💡", houseEmoji:["🌃","💡"] },
    { suffix:"Pinball Charm", emoji:"🎱🔔✨", houseEmoji:["🎱","🔔"] },
    { suffix:"Cabinet Prize", emoji:"🎁🕹️⭐", houseEmoji:["🎁","⭐"] },
    { suffix:"Score Plaque", emoji:"📟🏆💫", houseEmoji:["📟","💫"] }
  ]);

  const runtime = {
    panel: null,
    scene: null,
    selectedInstanceId: "",
    search: "",
    drag: null,
    docBound: false,
    resizeBound: false,
    catalogCache: null
  };

  function escapeHtml(value){
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function clamp(value, min, max){
    const n = Number(value);
    if(!Number.isFinite(n)) return min;
    return Math.max(min, Math.min(max, n));
  }

  function cloneJson(value, fallback){
    try{ return JSON.parse(JSON.stringify(value)); }catch(_){ return fallback; }
  }

  function giftIdForCode(code){
    return `table:${String(code || "UNKNOWN").trim() || "UNKNOWN"}`;
  }

  function normalizeGiftCode(table, index){
    const raw = String(table?.code || table?.slug || table?.name || `table_${index + 1}`).trim();
    return raw.toUpperCase().replace(/[^A-Z0-9_]+/g, "_").replace(/^_+|_+$/g, "") || `TABLE_${index + 1}`;
  }

  function getTableRepoTables(){
    try{
      const repo = window.FLPR_TABLE_REPO;
      if(repo && typeof repo.getAllTables === "function"){
        const tables = repo.getAllTables();
        if(Array.isArray(tables) && tables.length) return tables;
      }
    }catch(_){}
    return [
      { code:"MM", name:"Medieval Madness" },
      { code:"AFM", name:"Attack from Mars" },
      { code:"WCS", name:"World Cup Soccer" },
      { code:"GET", name:"The Getaway" },
      { code:"BOSS_TABLE", name:"Boss Table" }
    ];
  }

  function buildGiftCatalog(){
    const tables = getTableRepoTables();
    return tables.map((table, index)=>{
      const code = normalizeGiftCode(table, index);
      const manual = manualGiftThemes[code] || null;
      const fallback = fallbackThemes[index % fallbackThemes.length];
      const tableName = String(table?.name || table?.displayName || code).trim() || code;
      const worldGroups = Array.isArray(table?.worldGroups) ? table.worldGroups.slice() : [];
      return {
        id: giftIdForCode(code),
        code,
        tableName,
        giftName: manual?.giftName || `${tableName} ${fallback.suffix}`,
        emoji: manual?.emoji || fallback.emoji,
        houseEmoji: Array.isArray(manual?.houseEmoji) ? manual.houseEmoji.slice() : fallback.houseEmoji.slice(),
        worldGroups,
        type: "table",
        rarity: "table"
      };
    });
  }

  function giftCatalog(){
    if(!runtime.catalogCache || !runtime.catalogCache.length) runtime.catalogCache = buildGiftCatalog();
    return runtime.catalogCache;
  }

  function giftById(giftId){
    const id = String(giftId || "");
    return giftCatalog().find((gift)=>gift.id === id) || null;
  }

  function freshHouseState(){
    return {
      version: 1,
      updatedAt: Date.now(),
      inventory: {},
      placements: [],
      selectedRoomId: ""
    };
  }

  function normalizeHouseState(raw){
    const src = raw && typeof raw === "object" ? raw : {};
    const state = freshHouseState();
    state.updatedAt = Math.max(0, Number(src.updatedAt || 0) || 0);
    state.selectedRoomId = String(src.selectedRoomId || "");
    if(src.inventory && typeof src.inventory === "object"){
      Object.entries(src.inventory).forEach(([giftId, entry])=>{
        if(!giftId || !entry || typeof entry !== "object") return;
        state.inventory[giftId] = {
          giftId,
          code: String(entry.code || ""),
          tableName: String(entry.tableName || ""),
          earnedAt: Math.max(0, Number(entry.earnedAt || Date.now()) || Date.now()),
          source: String(entry.source || "gift-house-test"),
          count: Math.max(1, Math.round(Number(entry.count || 1) || 1))
        };
      });
    }
    if(Array.isArray(src.placements)){
      state.placements = src.placements
        .map((placement, index)=>normalizePlacement(placement, index))
        .filter(Boolean);
    }
    return state;
  }

  function normalizePlacement(raw, index){
    if(!raw || typeof raw !== "object") return null;
    const gift = giftById(raw.giftId);
    if(!gift) return null;
    return {
      instanceId: String(raw.instanceId || `gift_${Date.now().toString(36)}_${index}`).trim(),
      giftId: gift.id,
      x: clamp(raw.x, 4, 96),
      y: clamp(raw.y, 6, 94),
      scale: clamp(raw.scale || 1, 0.55, 1.8),
      rotation: clamp(raw.rotation || 0, -18, 18),
      z: Math.max(1, Math.round(Number(raw.z || index + 1) || index + 1)),
      roomId: String(raw.roomId || ""),
      sticker: raw.sticker !== false
    };
  }

  function ensureTestInventory(state){
    const next = normalizeHouseState(state);
    giftCatalog().forEach((gift)=>{
      if(next.inventory[gift.id]) return;
      next.inventory[gift.id] = {
        giftId: gift.id,
        code: gift.code,
        tableName: gift.tableName,
        earnedAt: Date.now(),
        source: "gift-house-test",
        count: 1
      };
    });
    return next;
  }

  function profileExtensions(){
    try{ return window.flprStandaloneProfileExtensions || null; }catch(_){ return null; }
  }

  function readFallbackState(){
    try{
      const raw = localStorage.getItem(HOUSE_FALLBACK_LS);
      return raw ? JSON.parse(raw) : null;
    }catch(_){}
    return null;
  }

  function writeFallbackState(state){
    try{ localStorage.setItem(HOUSE_FALLBACK_LS, JSON.stringify(state)); }catch(_){}
  }

  function loadHouseState(){
    const bridge = profileExtensions();
    if(bridge && typeof bridge.hasActiveProfile === "function" && bridge.hasActiveProfile()){
      let value = null;
      try{ value = bridge.get(HOUSE_NAMESPACE, null); }catch(_){}
      if(!value){
        value = readFallbackState();
        if(value && typeof bridge.set === "function"){
          try{ bridge.set(HOUSE_NAMESPACE, value); }catch(_){}
        }
      }
      return ensureTestInventory(value);
    }
    return ensureTestInventory(readFallbackState());
  }

  function saveHouseState(state){
    const next = ensureTestInventory(state);
    next.updatedAt = Date.now();
    const bridge = profileExtensions();
    if(bridge && typeof bridge.hasActiveProfile === "function" && bridge.hasActiveProfile() && typeof bridge.set === "function"){
      try{
        if(bridge.set(HOUSE_NAMESPACE, next)) return next;
      }catch(_){}
    }
    writeFallbackState(next);
    return next;
  }

  function injectGiftHouseStyles(){
    if(document.getElementById(HOUSE_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = HOUSE_STYLE_ID;
    style.textContent = `
      body.flprStandaloneOriginalClient .controlsTabPanel[data-ctrl-panel="house"]{
        height:100% !important;
        min-height:0 !important;
        overflow:hidden !important;
      }
      body.flprStandaloneOriginalClient #giftHouseTest,
      body.flprStandaloneOriginalClient #giftHouseTest *{
        box-sizing:border-box !important;
      }
      body.flprStandaloneOriginalClient #giftHouseTest{
        --houseCyan:#00d9ff;
        --houseMint:#27ffac;
        --housePink:#ff56d6;
        --houseGold:#ffe07a;
        --houseInk:#06101e;
        height:100% !important;
        min-height:0 !important;
        display:grid !important;
        grid-template-rows:auto minmax(0, 1fr) !important;
        gap:10px !important;
        padding:10px !important;
        color:rgba(232,250,255,.96) !important;
        background:
          linear-gradient(90deg, rgba(0,217,255,.08) 1px, transparent 1px),
          linear-gradient(180deg, rgba(255,86,214,.06) 1px, transparent 1px),
          linear-gradient(180deg, rgba(2,12,26,.98), rgba(0,7,16,.98)) !important;
        background-size:42px 42px, 42px 42px, auto !important;
        overflow:hidden !important;
      }
      body.flprStandaloneOriginalClient .giftHouseTopbar{
        display:grid !important;
        grid-template-columns:minmax(0, 1fr) auto auto !important;
        gap:10px !important;
        align-items:center !important;
        min-height:52px !important;
      }
      body.flprStandaloneOriginalClient .giftHouseTitle{
        min-width:0 !important;
        padding:10px 12px !important;
        border:1px solid rgba(0,217,255,.32) !important;
        background:linear-gradient(180deg, rgba(0,37,60,.74), rgba(0,13,26,.92)) !important;
        box-shadow:0 0 0 1px rgba(255,255,255,.04) inset, 0 0 20px rgba(0,217,255,.12) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseTitleMain{
        font-size:13px !important;
        line-height:1.15 !important;
        color:var(--houseGold) !important;
        text-shadow:0 0 12px rgba(255,224,122,.32) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseTitleSub{
        margin-top:5px !important;
        font-size:8px !important;
        line-height:1.25 !important;
        color:rgba(196,235,246,.78) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseStats{
        display:flex !important;
        gap:8px !important;
        align-items:center !important;
        justify-content:flex-end !important;
        min-width:250px !important;
        font-size:8px !important;
        color:rgba(232,250,255,.86) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseStat{
        padding:8px 9px !important;
        border:1px solid rgba(39,255,172,.26) !important;
        background:rgba(0,28,30,.72) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseLayout{
        min-height:0 !important;
        display:grid !important;
        grid-template-columns:minmax(198px, .72fr) minmax(460px, 1.92fr) minmax(184px, .62fr) !important;
        gap:10px !important;
      }
      body.flprStandaloneOriginalClient .giftHouseCatalog,
      body.flprStandaloneOriginalClient .giftHouseInspector{
        min-height:0 !important;
        display:grid !important;
        grid-template-rows:auto minmax(0, 1fr) !important;
        gap:8px !important;
        border:1px solid rgba(0,217,255,.24) !important;
        background:linear-gradient(180deg, rgba(0,22,38,.88), rgba(0,8,18,.94)) !important;
        overflow:hidden !important;
      }
      body.flprStandaloneOriginalClient .giftHousePaneHead{
        padding:10px 10px 0 !important;
        display:grid !important;
        gap:8px !important;
      }
      body.flprStandaloneOriginalClient .giftHousePaneTitle{
        color:var(--houseMint) !important;
        font-size:9px !important;
        line-height:1.2 !important;
      }
      body.flprStandaloneOriginalClient .giftHouseSearch{
        width:100% !important;
        min-height:34px !important;
        border:1px solid rgba(0,217,255,.34) !important;
        background:rgba(0,10,18,.78) !important;
        color:rgba(238,255,252,.96) !important;
        padding:8px 9px !important;
        font-size:8px !important;
      }
      body.flprStandaloneOriginalClient .giftHouseCatalogList{
        min-height:0 !important;
        overflow:auto !important;
        padding:0 10px 10px !important;
        display:grid !important;
        gap:7px !important;
        align-content:start !important;
        scrollbar-width:thin !important;
        scrollbar-color:rgba(0,217,255,.78) rgba(0,18,31,.96) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseCatalogItem{
        width:100% !important;
        min-width:0 !important;
        min-height:58px !important;
        display:grid !important;
        grid-template-columns:44px minmax(0, 1fr) !important;
        gap:8px !important;
        align-items:center !important;
        border:1px solid rgba(255,224,122,.24) !important;
        background:linear-gradient(180deg, rgba(35,28,14,.78), rgba(0,12,22,.92)) !important;
        color:rgba(232,250,255,.96) !important;
        text-align:left !important;
        padding:7px !important;
        cursor:grab !important;
      }
      body.flprStandaloneOriginalClient .giftHouseCatalogItem:active{
        cursor:grabbing !important;
      }
      body.flprStandaloneOriginalClient .giftHouseGiftEmoji{
        width:42px !important;
        height:42px !important;
        display:grid !important;
        place-items:center !important;
        border:1px solid rgba(0,217,255,.28) !important;
        background:radial-gradient(circle at 50% 40%, rgba(255,224,122,.18), rgba(0,13,26,.92) 72%) !important;
        font-size:23px !important;
        line-height:1 !important;
        overflow:hidden !important;
      }
      body.flprStandaloneOriginalClient .giftHouseGiftText{
        min-width:0 !important;
        display:grid !important;
        gap:4px !important;
      }
      body.flprStandaloneOriginalClient .giftHouseGiftName{
        min-width:0 !important;
        color:rgba(238,255,252,.98) !important;
        font-size:8px !important;
        line-height:1.2 !important;
        white-space:normal !important;
      }
      body.flprStandaloneOriginalClient .giftHouseGiftMeta{
        min-width:0 !important;
        color:rgba(161,220,236,.72) !important;
        font-size:7px !important;
        line-height:1.2 !important;
        white-space:normal !important;
      }
      body.flprStandaloneOriginalClient .giftHouseStageWrap{
        min-width:0 !important;
        min-height:0 !important;
        position:relative !important;
        border:1px solid rgba(255,86,214,.26) !important;
        background:#020813 !important;
        overflow:hidden !important;
      }
      body.flprStandaloneOriginalClient .giftHouseScene{
        position:relative !important;
        width:100% !important;
        height:100% !important;
        min-height:620px !important;
        overflow:hidden !important;
        background:
          linear-gradient(180deg, #061231 0%, #081020 46%, #11081d 72%, #05070f 100%) !important;
        user-select:none !important;
        touch-action:none !important;
      }
      body.flprStandaloneOriginalClient .giftHouseStars{
        position:absolute !important;
        inset:0 !important;
        opacity:.32 !important;
        background:
          radial-gradient(circle at 12% 18%, rgba(255,255,255,.9) 0 1px, transparent 2px),
          radial-gradient(circle at 72% 10%, rgba(255,255,255,.72) 0 1px, transparent 2px),
          radial-gradient(circle at 44% 28%, rgba(0,217,255,.86) 0 1px, transparent 2px),
          radial-gradient(circle at 88% 32%, rgba(255,224,122,.74) 0 1px, transparent 2px) !important;
        background-size:180px 130px, 220px 150px, 260px 190px, 210px 170px !important;
      }
      body.flprStandaloneOriginalClient .giftHouseMoon{
        position:absolute !important;
        right:8% !important;
        top:7% !important;
        width:54px !important;
        height:54px !important;
        border:2px solid rgba(255,224,122,.72) !important;
        background:radial-gradient(circle at 36% 32%, #fff5a6, #ffd45b 58%, rgba(255,224,122,.14) 62%) !important;
        box-shadow:0 0 22px rgba(255,224,122,.42) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseSkyline{
        position:absolute !important;
        left:0 !important;
        right:0 !important;
        bottom:15% !important;
        height:34% !important;
        opacity:.86 !important;
        background:
          linear-gradient(90deg, transparent 0 3%, #050912 3% 10%, transparent 10% 13%, #071020 13% 22%, transparent 22% 26%, #050912 26% 37%, transparent 37% 40%, #071020 40% 53%, transparent 53% 57%, #040811 57% 68%, transparent 68% 72%, #071020 72% 83%, transparent 83% 87%, #050912 87% 96%, transparent 96% 100%) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseSkyline::after{
        content:"" !important;
        position:absolute !important;
        inset:8% 0 0 !important;
        opacity:.5 !important;
        background:
          repeating-linear-gradient(90deg, transparent 0 21px, rgba(0,217,255,.5) 21px 24px, transparent 24px 38px),
          repeating-linear-gradient(180deg, transparent 0 24px, rgba(255,224,122,.32) 24px 27px, transparent 27px 48px) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseTower{
        position:absolute !important;
        left:23% !important;
        top:7% !important;
        width:52% !important;
        height:78% !important;
        border:4px solid rgba(255,86,214,.74) !important;
        border-top-width:8px !important;
        background:rgba(0,4,10,.92) !important;
        box-shadow:0 0 0 3px rgba(0,217,255,.16), 0 0 34px rgba(255,86,214,.24) !important;
        display:grid !important;
        grid-template-rows:48px repeat(3, minmax(0, 1fr)) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseRoof{
        position:relative !important;
        display:flex !important;
        align-items:center !important;
        justify-content:space-between !important;
        padding:0 16px !important;
        color:var(--houseGold) !important;
        border-bottom:3px solid rgba(255,86,214,.55) !important;
        background:linear-gradient(90deg, rgba(60,0,54,.9), rgba(0,32,58,.9)) !important;
        font-size:9px !important;
      }
      body.flprStandaloneOriginalClient .giftHouseRoofSign{
        padding:6px 8px !important;
        border:1px solid rgba(255,224,122,.52) !important;
        background:rgba(0,0,0,.42) !important;
        box-shadow:0 0 14px rgba(255,224,122,.2) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseFloor{
        min-height:0 !important;
        display:grid !important;
        grid-template-columns:1fr 1fr !important;
        border-bottom:3px solid rgba(0,217,255,.28) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseFloor:last-child{
        border-bottom:0 !important;
      }
      body.flprStandaloneOriginalClient .giftHouseRoom{
        position:relative !important;
        min-width:0 !important;
        min-height:0 !important;
        border-right:3px solid rgba(0,217,255,.22) !important;
        background:
          linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px),
          linear-gradient(180deg, rgba(255,255,255,.045) 1px, transparent 1px),
          linear-gradient(180deg, var(--roomA, rgba(0,48,82,.88)), var(--roomB, rgba(18,8,36,.9))) !important;
        background-size:22px 22px, 22px 22px, auto !important;
        overflow:hidden !important;
      }
      body.flprStandaloneOriginalClient .giftHouseRoom:nth-child(2n){
        border-right:0 !important;
      }
      body.flprStandaloneOriginalClient .giftHouseRoom::before{
        content:attr(data-room-label) !important;
        position:absolute !important;
        left:8px !important;
        top:7px !important;
        color:rgba(232,250,255,.28) !important;
        font-size:7px !important;
        line-height:1 !important;
      }
      body.flprStandaloneOriginalClient .giftHouseRoomShelf{
        position:absolute !important;
        left:9% !important;
        right:9% !important;
        bottom:20% !important;
        height:5px !important;
        background:rgba(255,224,122,.48) !important;
        box-shadow:0 7px 0 rgba(0,0,0,.22) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseRoomGlow{
        position:absolute !important;
        right:10% !important;
        top:20% !important;
        width:36px !important;
        height:48px !important;
        border:1px solid rgba(0,217,255,.36) !important;
        background:linear-gradient(180deg, rgba(0,217,255,.2), rgba(255,224,122,.08)) !important;
        box-shadow:0 0 18px rgba(0,217,255,.18) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseStreet{
        position:absolute !important;
        left:0 !important;
        right:0 !important;
        bottom:0 !important;
        height:16% !important;
        border-top:3px solid rgba(39,255,172,.42) !important;
        background:
          repeating-linear-gradient(90deg, transparent 0 64px, rgba(255,224,122,.8) 64px 98px, transparent 98px 160px),
          linear-gradient(180deg, #11151f, #05070d) !important;
        background-size:auto, auto !important;
      }
      body.flprStandaloneOriginalClient .giftHouseCar{
        position:absolute !important;
        bottom:36% !important;
        font-size:24px !important;
        filter:drop-shadow(0 0 8px rgba(0,217,255,.38)) !important;
        animation:giftHouseCarDrive 9s linear infinite !important;
      }
      body.flprStandaloneOriginalClient .giftHouseCar.carTwo{
        bottom:14% !important;
        animation-duration:12s !important;
        animation-delay:-5s !important;
        filter:drop-shadow(0 0 8px rgba(255,86,214,.34)) !important;
      }
      @keyframes giftHouseCarDrive{
        from{ transform:translateX(-90px) scaleX(-1); }
        to{ transform:translateX(calc(100vw + 90px)) scaleX(-1); }
      }
      body.flprStandaloneOriginalClient .giftHousePlacementLayer,
      body.flprStandaloneOriginalClient .giftHouseResidentLayer{
        position:absolute !important;
        inset:0 !important;
        pointer-events:none !important;
      }
      body.flprStandaloneOriginalClient .giftHousePlacementLayer{
        z-index:8 !important;
      }
      body.flprStandaloneOriginalClient .giftHouseResidentLayer{
        z-index:7 !important;
      }
      body.flprStandaloneOriginalClient .giftHouseResident{
        position:absolute !important;
        width:28px !important;
        height:28px !important;
        display:grid !important;
        place-items:center !important;
        font-size:19px !important;
        line-height:1 !important;
        transform:translate(-50%, -50%) !important;
        opacity:.82 !important;
        filter:drop-shadow(0 0 6px rgba(255,224,122,.3)) !important;
      }
      body.flprStandaloneOriginalClient .giftHousePlacedItem{
        position:absolute !important;
        width:52px !important;
        height:52px !important;
        display:grid !important;
        place-items:center !important;
        border:1px solid rgba(255,224,122,.18) !important;
        background:rgba(0,8,18,.18) !important;
        color:white !important;
        font-size:29px !important;
        line-height:1 !important;
        transform:translate(-50%, -50%) scale(var(--giftScale, 1)) rotate(var(--giftRot, 0deg)) !important;
        transform-origin:center center !important;
        cursor:grab !important;
        pointer-events:auto !important;
        touch-action:none !important;
        filter:drop-shadow(0 8px 8px rgba(0,0,0,.42)) drop-shadow(0 0 10px rgba(255,224,122,.2)) !important;
      }
      body.flprStandaloneOriginalClient .giftHousePlacedItem.selected{
        border-color:rgba(0,255,213,.92) !important;
        background:rgba(0,217,255,.1) !important;
        box-shadow:0 0 0 2px rgba(0,255,213,.18), 0 0 16px rgba(0,217,255,.34) !important;
      }
      body.flprStandaloneOriginalClient .giftHousePlacedItem.dragging{
        cursor:grabbing !important;
        opacity:.92 !important;
      }
      body.flprStandaloneOriginalClient .giftHouseHintRibbon{
        position:absolute !important;
        left:12px !important;
        bottom:calc(16% + 12px) !important;
        z-index:9 !important;
        padding:7px 9px !important;
        border:1px solid rgba(0,217,255,.26) !important;
        background:rgba(0,9,18,.72) !important;
        color:rgba(232,250,255,.68) !important;
        font-size:7px !important;
        line-height:1.2 !important;
      }
      body.flprStandaloneOriginalClient .giftHouseInspectorBody{
        min-height:0 !important;
        overflow:auto !important;
        padding:0 10px 10px !important;
        display:grid !important;
        gap:8px !important;
        align-content:start !important;
      }
      body.flprStandaloneOriginalClient .giftHouseSelectedCard{
        display:grid !important;
        gap:8px !important;
        padding:10px !important;
        border:1px solid rgba(255,224,122,.24) !important;
        background:rgba(0,12,22,.74) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseSelectedEmoji{
        width:70px !important;
        height:70px !important;
        display:grid !important;
        place-items:center !important;
        margin:auto !important;
        border:1px solid rgba(0,217,255,.34) !important;
        background:rgba(0,24,42,.74) !important;
        font-size:38px !important;
      }
      body.flprStandaloneOriginalClient .giftHouseSelectedName{
        color:rgba(238,255,252,.98) !important;
        font-size:9px !important;
        line-height:1.25 !important;
        text-align:center !important;
      }
      body.flprStandaloneOriginalClient .giftHouseSelectedMeta{
        color:rgba(196,235,246,.72) !important;
        font-size:7px !important;
        line-height:1.35 !important;
        text-align:center !important;
      }
      body.flprStandaloneOriginalClient .giftHouseActionGrid{
        display:grid !important;
        grid-template-columns:1fr 1fr !important;
        gap:7px !important;
      }
      body.flprStandaloneOriginalClient .giftHouseActionGrid .cBtn{
        min-height:34px !important;
        padding:7px !important;
        font-size:7px !important;
        line-height:1.15 !important;
      }
      body.flprStandaloneOriginalClient .giftHouseEmptyNote{
        padding:10px !important;
        border:1px solid rgba(0,217,255,.18) !important;
        color:rgba(196,235,246,.78) !important;
        font-size:8px !important;
        line-height:1.45 !important;
        background:rgba(0,12,22,.58) !important;
      }
      body.flprStandaloneOriginalClient #giftHouseTest{
        gap:14px !important;
        padding:14px !important;
      }
      body.flprStandaloneOriginalClient .giftHouseTopbar{
        min-height:82px !important;
        grid-template-columns:minmax(0, 1fr) minmax(280px, auto) auto !important;
        gap:14px !important;
      }
      body.flprStandaloneOriginalClient .giftHouseTitle{
        padding:16px 18px !important;
        border-width:2px !important;
        background:
          linear-gradient(90deg, rgba(255,86,214,.11), transparent 42%),
          linear-gradient(180deg, rgba(0,48,78,.84), rgba(0,13,26,.96)) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseTitleMain{
        font-size:22px !important;
      }
      body.flprStandaloneOriginalClient .giftHouseTitleSub{
        font-size:13px !important;
        color:rgba(214,242,250,.86) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseStats{
        min-width:320px !important;
        font-size:13px !important;
        gap:10px !important;
      }
      body.flprStandaloneOriginalClient .giftHouseStat{
        padding:12px 13px !important;
        border-width:2px !important;
      }
      body.flprStandaloneOriginalClient #giftHouseResetBtn{
        min-height:52px !important;
        padding:12px 16px !important;
        font-size:12px !important;
      }
      body.flprStandaloneOriginalClient .giftHouseLayout{
        grid-template-columns:minmax(230px, .5fr) minmax(680px, 2.75fr) minmax(210px, .45fr) !important;
        gap:14px !important;
      }
      body.flprStandaloneOriginalClient .giftHouseCatalog,
      body.flprStandaloneOriginalClient .giftHouseInspector{
        border-width:2px !important;
        gap:12px !important;
      }
      body.flprStandaloneOriginalClient .giftHousePaneHead{
        padding:14px 14px 0 !important;
        gap:12px !important;
      }
      body.flprStandaloneOriginalClient .giftHousePaneTitle{
        font-size:15px !important;
      }
      body.flprStandaloneOriginalClient .giftHouseSearch{
        min-height:48px !important;
        padding:12px 13px !important;
        font-size:13px !important;
        border-width:2px !important;
      }
      body.flprStandaloneOriginalClient .giftHouseCatalogList{
        padding:0 14px 14px !important;
        gap:11px !important;
      }
      body.flprStandaloneOriginalClient .giftHouseCatalogItem{
        min-height:88px !important;
        grid-template-columns:70px minmax(0, 1fr) !important;
        gap:14px !important;
        padding:11px !important;
        border-width:2px !important;
        box-shadow:0 0 18px rgba(255,224,122,.08) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseGiftEmoji{
        width:68px !important;
        height:68px !important;
        font-size:38px !important;
        border-width:2px !important;
      }
      body.flprStandaloneOriginalClient .giftHouseGiftName{
        font-size:14px !important;
      }
      body.flprStandaloneOriginalClient .giftHouseGiftMeta{
        font-size:11px !important;
      }
      body.flprStandaloneOriginalClient .giftHouseStageWrap{
        border-width:2px !important;
        box-shadow:
          0 0 0 1px rgba(255,255,255,.06) inset,
          0 0 36px rgba(0,217,255,.14),
          0 22px 44px rgba(0,0,0,.38) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseScene{
        height:100% !important;
        min-height:0 !important;
        background:
          radial-gradient(80% 50% at 48% 8%, rgba(81,0,114,.38), transparent 68%),
          linear-gradient(180deg, #07143b 0%, #081427 36%, #14071f 69%, #05070f 100%) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseScene::before{
        content:"" !important;
        position:absolute !important;
        inset:0 !important;
        pointer-events:none !important;
        z-index:6 !important;
        background:
          linear-gradient(90deg, transparent, rgba(0,217,255,.12), transparent),
          repeating-linear-gradient(180deg, rgba(255,255,255,.045) 0 1px, transparent 1px 5px) !important;
        mix-blend-mode:screen !important;
        opacity:.44 !important;
      }
      body.flprStandaloneOriginalClient .giftHouseMoon{
        width:78px !important;
        height:78px !important;
        right:7% !important;
        top:5% !important;
      }
      body.flprStandaloneOriginalClient .giftHouseSkylineFar,
      body.flprStandaloneOriginalClient .giftHouseSkylineNear{
        position:absolute !important;
        left:0 !important;
        right:0 !important;
        pointer-events:none !important;
      }
      body.flprStandaloneOriginalClient .giftHouseSkylineFar{
        bottom:34% !important;
        height:34% !important;
        opacity:.46 !important;
        background:
          linear-gradient(90deg, transparent 0 4%, #060d22 4% 9%, transparent 9% 11%, #071635 11% 18%, transparent 18% 21%, #07102a 21% 31%, transparent 31% 34%, #081d3b 34% 44%, transparent 44% 48%, #061022 48% 55%, transparent 55% 58%, #071635 58% 71%, transparent 71% 75%, #060d22 75% 84%, transparent 84% 87%, #081d3b 87% 96%, transparent 96% 100%) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseSkylineNear{
        bottom:16% !important;
        height:44% !important;
        opacity:.82 !important;
        background:
          linear-gradient(90deg, transparent 0 2%, #040712 2% 8%, transparent 8% 10%, #071227 10% 19%, transparent 19% 21%, #050a18 21% 30%, transparent 30% 33%, #071227 33% 45%, transparent 45% 48%, #030610 48% 59%, transparent 59% 62%, #071227 62% 73%, transparent 73% 76%, #040712 76% 86%, transparent 86% 90%, #071227 90% 98%, transparent 98% 100%) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseSkylineFar::after,
      body.flprStandaloneOriginalClient .giftHouseSkylineNear::after{
        content:"" !important;
        position:absolute !important;
        inset:9% 0 0 !important;
        background:
          repeating-linear-gradient(90deg, transparent 0 19px, rgba(0,217,255,.5) 19px 23px, transparent 23px 42px),
          repeating-linear-gradient(180deg, transparent 0 21px, rgba(255,224,122,.38) 21px 25px, transparent 25px 47px) !important;
        mix-blend-mode:screen !important;
      }
      body.flprStandaloneOriginalClient .giftHouseNeonBillboard{
        position:absolute !important;
        left:5% !important;
        top:19% !important;
        z-index:3 !important;
        padding:10px 12px !important;
        border:2px solid rgba(255,86,214,.74) !important;
        background:rgba(20,0,28,.78) !important;
        color:rgba(255,246,196,.96) !important;
        font-size:12px !important;
        box-shadow:0 0 22px rgba(255,86,214,.36), 0 0 18px rgba(0,217,255,.2) inset !important;
      }
      body.flprStandaloneOriginalClient .giftHouseNeonBillboard.alt{
        left:auto !important;
        right:6% !important;
        top:29% !important;
        border-color:rgba(0,255,213,.68) !important;
        color:rgba(210,255,246,.96) !important;
        box-shadow:0 0 22px rgba(0,255,213,.26), 0 0 16px rgba(255,86,214,.16) inset !important;
      }
      body.flprStandaloneOriginalClient .giftHouseTower{
        left:11% !important;
        top:5% !important;
        width:76% !important;
        height:80% !important;
        border-width:6px !important;
        border-top-width:12px !important;
        display:grid !important;
        grid-template-rows:66px 1.08fr .96fr 1.12fr !important;
        background:linear-gradient(90deg, rgba(0,5,12,.98), rgba(0,9,20,.94) 72%, rgba(35,0,44,.92)) !important;
        box-shadow:
          16px 18px 0 rgba(0,0,0,.36),
          28px 28px 0 rgba(0,217,255,.08),
          0 0 0 4px rgba(0,217,255,.16),
          0 0 48px rgba(255,86,214,.30) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseTower::before{
        content:"" !important;
        position:absolute !important;
        left:100% !important;
        top:12px !important;
        width:28px !important;
        height:calc(100% - 4px) !important;
        background:linear-gradient(180deg, rgba(48,0,72,.84), rgba(0,18,40,.92)) !important;
        clip-path:polygon(0 0, 100% 16px, 100% 100%, 0 calc(100% - 16px)) !important;
        border-right:3px solid rgba(0,217,255,.22) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseTower::after{
        content:"" !important;
        position:absolute !important;
        left:4% !important;
        right:8% !important;
        bottom:-18px !important;
        height:18px !important;
        background:linear-gradient(90deg, rgba(255,86,214,.48), rgba(0,217,255,.28)) !important;
        clip-path:polygon(0 0, 100% 0, 94% 100%, 6% 100%) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseRoof{
        padding:0 20px !important;
        font-size:14px !important;
        border-bottom-width:5px !important;
      }
      body.flprStandaloneOriginalClient .giftHouseRoofSign{
        padding:9px 12px !important;
        border-width:2px !important;
      }
      body.flprStandaloneOriginalClient .giftHouseAntenna{
        position:absolute !important;
        right:12% !important;
        top:-54px !important;
        width:8px !important;
        height:54px !important;
        background:rgba(0,217,255,.64) !important;
        box-shadow:0 0 14px rgba(0,217,255,.36) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseAntenna::before,
      body.flprStandaloneOriginalClient .giftHouseAntenna::after{
        content:"" !important;
        position:absolute !important;
        left:50% !important;
        top:12px !important;
        width:50px !important;
        height:4px !important;
        background:rgba(255,86,214,.62) !important;
        transform-origin:left center !important;
      }
      body.flprStandaloneOriginalClient .giftHouseAntenna::before{ transform:rotate(-24deg); }
      body.flprStandaloneOriginalClient .giftHouseAntenna::after{ transform:rotate(24deg); }
      body.flprStandaloneOriginalClient .giftHouseFloor{
        border-bottom-width:5px !important;
        grid-template-columns:1.08fr .92fr !important;
      }
      body.flprStandaloneOriginalClient .giftHouseFloor.altFloor{
        grid-template-columns:.82fr 1.18fr !important;
      }
      body.flprStandaloneOriginalClient .giftHouseRoom{
        border-right-width:5px !important;
        background:
          linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px),
          linear-gradient(180deg, rgba(255,255,255,.052) 1px, transparent 1px),
          radial-gradient(circle at var(--lampX, 78%) var(--lampY, 23%), rgba(255,224,122,.22), transparent 28%),
          linear-gradient(180deg, var(--roomA, rgba(0,48,82,.88)), var(--roomB, rgba(18,8,36,.9))) !important;
        background-size:30px 30px, 30px 30px, auto, auto !important;
      }
      body.flprStandaloneOriginalClient .giftHouseRoom::before{
        left:12px !important;
        top:10px !important;
        font-size:11px !important;
        color:rgba(232,250,255,.38) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseRoom::after{
        content:"" !important;
        position:absolute !important;
        left:10% !important;
        right:14% !important;
        bottom:12% !important;
        height:13px !important;
        background:linear-gradient(90deg, rgba(255,86,214,.26), rgba(0,217,255,.38), rgba(255,224,122,.24)) !important;
        box-shadow:0 8px 0 rgba(0,0,0,.22), 0 0 18px rgba(0,217,255,.18) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseRoomShelf{
        height:8px !important;
        bottom:30% !important;
      }
      body.flprStandaloneOriginalClient .giftHouseRoomGlow{
        width:52px !important;
        height:64px !important;
        border-width:2px !important;
      }
      body.flprStandaloneOriginalClient .giftHouseWindowGrid{
        position:absolute !important;
        right:9% !important;
        top:13% !important;
        width:52px !important;
        height:64px !important;
        display:grid !important;
        grid-template-columns:1fr 1fr !important;
        grid-template-rows:1fr 1fr !important;
        gap:5px !important;
      }
      body.flprStandaloneOriginalClient .giftHouseWindowGrid span{
        border:1px solid rgba(0,217,255,.44) !important;
        background:rgba(0,217,255,.18) !important;
        box-shadow:0 0 10px rgba(0,217,255,.16) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseFurniture{
        position:absolute !important;
        left:10% !important;
        bottom:17% !important;
        min-width:72px !important;
        min-height:38px !important;
        border:2px solid rgba(255,224,122,.30) !important;
        background:linear-gradient(180deg, rgba(255,86,214,.22), rgba(0,16,30,.82)) !important;
        box-shadow:0 9px 0 rgba(0,0,0,.22), 0 0 14px rgba(255,86,214,.15) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseFurniture::before{
        content:attr(data-icon) !important;
        position:absolute !important;
        left:8px !important;
        top:-20px !important;
        font-size:27px !important;
        filter:drop-shadow(0 0 8px rgba(255,224,122,.3)) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseDesk{
        position:absolute !important;
        right:12% !important;
        bottom:18% !important;
        width:72px !important;
        height:34px !important;
        border-top:6px solid rgba(0,217,255,.44) !important;
        background:rgba(0,8,18,.72) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseDesk::before{
        content:"" !important;
        position:absolute !important;
        left:18px !important;
        top:-34px !important;
        width:38px !important;
        height:28px !important;
        border:2px solid rgba(39,255,172,.44) !important;
        background:rgba(39,255,172,.12) !important;
        box-shadow:0 0 12px rgba(39,255,172,.18) !important;
      }
      body.flprStandaloneOriginalClient .giftHousePlant{
        position:absolute !important;
        right:10% !important;
        bottom:12% !important;
        font-size:32px !important;
        filter:drop-shadow(0 0 8px rgba(39,255,172,.22)) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseArcadeCab{
        position:absolute !important;
        left:16% !important;
        bottom:16% !important;
        width:52px !important;
        height:82px !important;
        border:2px solid rgba(255,86,214,.48) !important;
        background:linear-gradient(180deg, rgba(0,217,255,.18) 0 34%, rgba(255,86,214,.24) 34% 100%) !important;
        box-shadow:0 0 16px rgba(255,86,214,.22) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseArcadeCab::before{
        content:"" !important;
        position:absolute !important;
        left:9px !important;
        top:9px !important;
        width:30px !important;
        height:22px !important;
        background:rgba(255,224,122,.36) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseBalcony{
        position:absolute !important;
        left:-5% !important;
        bottom:18% !important;
        width:28% !important;
        height:28px !important;
        border:2px solid rgba(0,217,255,.34) !important;
        background:rgba(0,8,18,.56) !important;
        box-shadow:0 12px 0 rgba(0,0,0,.18) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseStairs{
        position:absolute !important;
        right:5% !important;
        bottom:13% !important;
        width:78px !important;
        height:86px !important;
        background:repeating-linear-gradient(180deg, rgba(232,250,255,.52) 0 7px, rgba(0,8,18,.4) 7px 14px) !important;
        opacity:.52 !important;
        transform:skewX(-10deg) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseStreet{
        height:18% !important;
      }
      body.flprStandaloneOriginalClient .giftHouseCar{
        font-size:36px !important;
      }
      body.flprStandaloneOriginalClient .giftHouseResident{
        width:42px !important;
        height:42px !important;
        font-size:30px !important;
      }
      body.flprStandaloneOriginalClient .giftHousePlacedItem{
        width:72px !important;
        height:72px !important;
        font-size:42px !important;
        border-width:2px !important;
      }
      body.flprStandaloneOriginalClient .giftHouseHintRibbon{
        left:18px !important;
        bottom:calc(18% + 16px) !important;
        padding:11px 13px !important;
        font-size:11px !important;
      }
      body.flprStandaloneOriginalClient .giftHouseInspectorBody{
        padding:0 14px 14px !important;
        gap:12px !important;
      }
      body.flprStandaloneOriginalClient .giftHouseSelectedCard{
        padding:14px !important;
        gap:12px !important;
        border-width:2px !important;
      }
      body.flprStandaloneOriginalClient .giftHouseSelectedEmoji{
        width:100px !important;
        height:100px !important;
        font-size:56px !important;
        border-width:2px !important;
      }
      body.flprStandaloneOriginalClient .giftHouseSelectedName{
        font-size:15px !important;
      }
      body.flprStandaloneOriginalClient .giftHouseSelectedMeta{
        font-size:12px !important;
      }
      body.flprStandaloneOriginalClient .giftHouseActionGrid{
        gap:10px !important;
      }
      body.flprStandaloneOriginalClient .giftHouseActionGrid .cBtn{
        min-height:48px !important;
        padding:10px !important;
        font-size:11px !important;
      }
      body.flprStandaloneOriginalClient .giftHouseEmptyNote{
        padding:14px !important;
        font-size:13px !important;
        line-height:1.5 !important;
        border-width:2px !important;
      }
      body.flprStandaloneOriginalClient .giftHouseTower{
        top:4% !important;
        height:72% !important;
        grid-template-rows:66px repeat(3, minmax(0, 1fr)) !important;
      }
      body.flprStandaloneOriginalClient #giftHouseTest{
        padding:14px clamp(52px, 3.4vw, 68px) 14px 14px !important;
      }
      body.flprStandaloneOriginalClient .giftHouseLayout{
        grid-template-columns:minmax(220px, 250px) minmax(0, 1fr) !important;
        grid-template-rows:minmax(0, 1fr) minmax(168px, .28fr) !important;
        align-items:stretch !important;
        height:var(--giftHouseLayoutH, clamp(620px, calc(100vh - 370px), 980px)) !important;
        min-height:var(--giftHouseLayoutH, 620px) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseCatalog{
        grid-column:1 !important;
        grid-row:1 !important;
      }
      body.flprStandaloneOriginalClient .giftHouseStageWrap{
        grid-column:2 !important;
        grid-row:1 / 3 !important;
        height:100% !important;
      }
      body.flprStandaloneOriginalClient .giftHouseInspector{
        grid-column:1 !important;
        grid-row:2 !important;
      }
      body.flprStandaloneOriginalClient .giftHouseTower::after{
        bottom:-12px !important;
        height:12px !important;
      }
      body.flprStandaloneOriginalClient .giftHouseFloor{
        position:relative !important;
        isolation:isolate !important;
        border-bottom-color:rgba(0,217,255,.36) !important;
        box-shadow:0 -1px 0 rgba(255,86,214,.16) inset !important;
      }
      body.flprStandaloneOriginalClient .giftHouseFloorStairs{
        position:absolute !important;
        left:3.5% !important;
        top:12% !important;
        width:66px !important;
        height:76% !important;
        z-index:4 !important;
        pointer-events:none !important;
        border-left:3px solid rgba(255,224,122,.42) !important;
        border-right:3px solid rgba(0,217,255,.24) !important;
        background:
          repeating-linear-gradient(180deg, rgba(255,224,122,.54) 0 8px, rgba(0,11,22,.62) 8px 16px),
          linear-gradient(90deg, rgba(0,217,255,.16), rgba(255,86,214,.12)) !important;
        transform:skewX(-9deg) !important;
        box-shadow:0 10px 0 rgba(0,0,0,.24), 0 0 18px rgba(255,224,122,.14) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseFloorStairs::before{
        content:"" !important;
        position:absolute !important;
        left:8px !important;
        top:-12px !important;
        width:48px !important;
        height:12px !important;
        background:rgba(0,217,255,.32) !important;
        box-shadow:0 0 12px rgba(0,217,255,.18) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseFloorStairs.floorStairsB{
        left:auto !important;
        right:4.5% !important;
        transform:skewX(9deg) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseFloorStairs.floorStairsC{
        left:5% !important;
        top:10% !important;
        height:82% !important;
      }
      body.flprStandaloneOriginalClient .giftHouseRoom{
        box-shadow:
          0 0 0 2px rgba(255,255,255,.035) inset,
          0 -28px 42px rgba(0,0,0,.14) inset !important;
      }
      body.flprStandaloneOriginalClient .giftHouseRoomFloorPattern{
        position:absolute !important;
        left:0 !important;
        right:0 !important;
        bottom:0 !important;
        height:38% !important;
        z-index:0 !important;
        pointer-events:none !important;
        border-top:2px solid rgba(255,224,122,.24) !important;
        box-shadow:0 -10px 22px rgba(0,0,0,.18) inset !important;
      }
      body.flprStandaloneOriginalClient .giftHouseRoomFloorPattern.floorDiamond{
        background:
          linear-gradient(45deg, rgba(0,217,255,.18) 25%, transparent 25% 75%, rgba(0,217,255,.18) 75%),
          linear-gradient(45deg, rgba(255,86,214,.14) 25%, transparent 25% 75%, rgba(255,86,214,.14) 75%),
          linear-gradient(180deg, rgba(0,16,30,.76), rgba(4,4,18,.92)) !important;
        background-position:0 0, 14px 14px, 0 0 !important;
        background-size:28px 28px, 28px 28px, auto !important;
      }
      body.flprStandaloneOriginalClient .giftHouseRoomFloorPattern.floorGrid{
        background:
          linear-gradient(90deg, rgba(255,224,122,.22) 1px, transparent 1px),
          linear-gradient(180deg, rgba(0,217,255,.24) 1px, transparent 1px),
          linear-gradient(180deg, rgba(18,0,32,.82), rgba(0,12,22,.94)) !important;
        background-size:18px 18px, 18px 18px, auto !important;
      }
      body.flprStandaloneOriginalClient .giftHouseRoomFloorPattern.floorPlanks{
        background:
          repeating-linear-gradient(90deg, rgba(255,224,122,.18) 0 9px, rgba(0,0,0,.08) 9px 11px, rgba(0,217,255,.10) 11px 22px),
          linear-gradient(180deg, rgba(18,35,16,.76), rgba(3,15,20,.94)) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseRoomFloorPattern.floorHazard{
        background:
          repeating-linear-gradient(135deg, rgba(255,224,122,.40) 0 8px, rgba(0,0,0,.18) 8px 16px),
          linear-gradient(180deg, rgba(22,10,16,.86), rgba(2,10,18,.96)) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseRoomFloorPattern.floorConcrete{
        background:
          radial-gradient(circle at 18% 48%, rgba(255,255,255,.14) 0 2px, transparent 3px),
          radial-gradient(circle at 76% 30%, rgba(0,217,255,.12) 0 2px, transparent 3px),
          repeating-linear-gradient(90deg, rgba(255,255,255,.08) 0 2px, transparent 2px 42px),
          linear-gradient(180deg, rgba(45,44,48,.82), rgba(9,12,18,.96)) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseRoomFloorPattern.floorHex{
        background:
          radial-gradient(circle at 50% 50%, rgba(255,224,122,.28) 0 2px, transparent 3px),
          linear-gradient(30deg, rgba(0,217,255,.18) 12%, transparent 12% 88%, rgba(0,217,255,.18) 88%),
          linear-gradient(150deg, rgba(255,86,214,.14) 12%, transparent 12% 88%, rgba(255,86,214,.14) 88%),
          linear-gradient(180deg, rgba(6,10,38,.82), rgba(12,4,26,.96)) !important;
        background-size:38px 32px, 38px 32px, 38px 32px, auto !important;
      }
      body.flprStandaloneOriginalClient .giftHouseDoor{
        position:absolute !important;
        bottom:10% !important;
        width:42px !important;
        height:76px !important;
        z-index:3 !important;
        border:2px solid rgba(255,224,122,.32) !important;
        background:
          linear-gradient(90deg, rgba(0,217,255,.18) 0 5px, transparent 5px 100%),
          linear-gradient(180deg, rgba(0,30,48,.92), rgba(18,6,30,.96)) !important;
        box-shadow:0 8px 0 rgba(0,0,0,.20), 0 0 16px rgba(0,217,255,.14) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseDoor::after{
        content:"" !important;
        position:absolute !important;
        right:7px !important;
        top:36px !important;
        width:5px !important;
        height:5px !important;
        border-radius:50% !important;
        background:rgba(255,224,122,.96) !important;
        box-shadow:0 0 8px rgba(255,224,122,.5) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseDoor.doorLeft{ left:8% !important; }
      body.flprStandaloneOriginalClient .giftHouseDoor.doorRight{ right:9% !important; }
      body.flprStandaloneOriginalClient .giftHouseDoor.vaultDoor{
        width:62px !important;
        border-color:rgba(0,217,255,.44) !important;
        background:
          radial-gradient(circle at 50% 45%, rgba(255,224,122,.30) 0 9px, rgba(0,217,255,.20) 10px 22px, transparent 23px),
          linear-gradient(180deg, rgba(22,28,54,.94), rgba(8,8,26,.98)) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseWallPanel,
      body.flprStandaloneOriginalClient .giftHousePoster,
      body.flprStandaloneOriginalClient .giftHousePipeRun{
        position:absolute !important;
        z-index:2 !important;
        pointer-events:none !important;
      }
      body.flprStandaloneOriginalClient .giftHouseWallPanel{
        left:30% !important;
        top:15% !important;
        width:60px !important;
        height:42px !important;
        border:2px solid rgba(0,217,255,.28) !important;
        background:linear-gradient(135deg, rgba(0,217,255,.12), rgba(255,86,214,.18)) !important;
        box-shadow:0 0 14px rgba(0,217,255,.12) !important;
      }
      body.flprStandaloneOriginalClient .giftHousePoster{
        left:18% !important;
        top:16% !important;
        width:48px !important;
        height:38px !important;
        border:2px solid rgba(255,224,122,.28) !important;
        background:linear-gradient(135deg, rgba(255,86,214,.34), rgba(0,217,255,.16)) !important;
      }
      body.flprStandaloneOriginalClient .giftHousePoster.posterB{
        left:auto !important;
        right:22% !important;
        background:linear-gradient(135deg, rgba(39,255,172,.24), rgba(255,224,122,.20)) !important;
      }
      body.flprStandaloneOriginalClient .giftHousePipeRun{
        left:12% !important;
        right:12% !important;
        top:17% !important;
        height:18px !important;
        border-top:4px solid rgba(0,217,255,.28) !important;
        border-bottom:2px solid rgba(255,86,214,.22) !important;
      }
      body.flprStandaloneOriginalClient .giftHousePipeRun::after{
        content:"" !important;
        position:absolute !important;
        right:18% !important;
        top:-8px !important;
        width:16px !important;
        height:36px !important;
        border-left:4px solid rgba(0,217,255,.26) !important;
        border-bottom:4px solid rgba(0,217,255,.26) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseBed{
        position:absolute !important;
        left:31% !important;
        bottom:16% !important;
        width:100px !important;
        height:52px !important;
        z-index:2 !important;
        border:2px solid rgba(0,217,255,.32) !important;
        background:
          linear-gradient(180deg, rgba(0,217,255,.32) 0 34%, rgba(6,14,32,.92) 34%),
          linear-gradient(90deg, rgba(255,255,255,.25) 0 32%, transparent 32%) !important;
        box-shadow:0 9px 0 rgba(0,0,0,.22), 0 0 16px rgba(0,217,255,.16) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseSofa{
        position:absolute !important;
        left:24% !important;
        bottom:15% !important;
        width:118px !important;
        height:46px !important;
        z-index:2 !important;
        border:2px solid rgba(39,255,172,.30) !important;
        background:
          linear-gradient(180deg, rgba(39,255,172,.30), rgba(10,34,24,.94)) !important;
        box-shadow:0 9px 0 rgba(0,0,0,.22), 0 0 15px rgba(39,255,172,.12) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseSofa::before,
      body.flprStandaloneOriginalClient .giftHouseSofa::after{
        content:"" !important;
        position:absolute !important;
        bottom:7px !important;
        width:28px !important;
        height:28px !important;
        background:rgba(0,8,18,.28) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseSofa::before{ left:10px !important; }
      body.flprStandaloneOriginalClient .giftHouseSofa::after{ right:10px !important; }
      body.flprStandaloneOriginalClient .giftHouseCoffeeTable{
        position:absolute !important;
        left:47% !important;
        bottom:12% !important;
        width:66px !important;
        height:18px !important;
        z-index:3 !important;
        border-top:5px solid rgba(255,224,122,.38) !important;
        background:rgba(0,8,18,.70) !important;
        box-shadow:0 8px 0 rgba(0,0,0,.2) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseGarageDoor{
        position:absolute !important;
        left:27% !important;
        right:9% !important;
        bottom:12% !important;
        height:86px !important;
        z-index:1 !important;
        border:3px solid rgba(0,217,255,.28) !important;
        background:
          repeating-linear-gradient(180deg, rgba(0,217,255,.20) 0 8px, rgba(0,8,18,.50) 8px 16px),
          linear-gradient(180deg, rgba(0,20,34,.86), rgba(0,5,12,.96)) !important;
        box-shadow:0 0 18px rgba(0,217,255,.12) inset !important;
      }
      body.flprStandaloneOriginalClient .giftHouseVaultCore{
        position:absolute !important;
        left:24% !important;
        top:21% !important;
        width:88px !important;
        height:88px !important;
        z-index:2 !important;
        border:3px solid rgba(255,224,122,.34) !important;
        border-radius:50% !important;
        background:
          radial-gradient(circle, rgba(255,224,122,.24) 0 10px, rgba(0,217,255,.16) 11px 32px, rgba(0,8,18,.88) 33px) !important;
        box-shadow:0 0 22px rgba(255,224,122,.16), 0 0 18px rgba(0,217,255,.16) inset !important;
      }
      body.flprStandaloneOriginalClient .giftHouseArcadeCab.cabMini{
        left:42% !important;
        bottom:15% !important;
        width:42px !important;
        height:66px !important;
        filter:hue-rotate(60deg) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseStreet{
        height:24% !important;
        border-top:4px solid rgba(39,255,172,.50) !important;
        background:
          linear-gradient(180deg, rgba(0,217,255,.18) 0 18%, transparent 18% 82%, rgba(255,86,214,.18) 82%),
          linear-gradient(180deg, rgba(6,8,20,.96), rgba(2,5,10,.98)) !important;
        overflow:hidden !important;
        z-index:5 !important;
      }
      body.flprStandaloneOriginalClient .giftHouseRoad{
        position:absolute !important;
        left:0 !important;
        right:0 !important;
        top:25% !important;
        height:50% !important;
        background:
          linear-gradient(180deg, rgba(16,18,28,.98) 0 48%, rgba(255,224,122,.16) 48% 52%, rgba(7,10,18,.98) 52%),
          repeating-linear-gradient(90deg, rgba(255,255,255,.03) 0 5px, transparent 5px 28px) !important;
        border-top:2px solid rgba(0,217,255,.22) !important;
        border-bottom:2px solid rgba(255,86,214,.24) !important;
        box-shadow:0 0 28px rgba(0,0,0,.38) inset !important;
      }
      body.flprStandaloneOriginalClient .giftHouseSidewalk{
        position:absolute !important;
        left:0 !important;
        right:0 !important;
        height:25% !important;
        background:
          repeating-linear-gradient(90deg, rgba(232,250,255,.12) 0 2px, transparent 2px 54px),
          linear-gradient(180deg, rgba(0,40,50,.86), rgba(0,13,24,.94)) !important;
        box-shadow:0 0 18px rgba(0,217,255,.14) inset !important;
      }
      body.flprStandaloneOriginalClient .giftHouseSidewalk.sidewalkTop{
        top:0 !important;
        border-bottom:2px solid rgba(0,217,255,.32) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseSidewalk.sidewalkBottom{
        bottom:0 !important;
        border-top:2px solid rgba(255,86,214,.30) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseLane{
        position:absolute !important;
        left:0 !important;
        right:0 !important;
        height:2px !important;
        background:rgba(0,217,255,.12) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseLane.laneOne{ top:29% !important; }
      body.flprStandaloneOriginalClient .giftHouseLane.laneTwo{ top:72% !important; }
      body.flprStandaloneOriginalClient .giftHouseLaneDash{
        position:absolute !important;
        left:0 !important;
        right:0 !important;
        height:3px !important;
        background:repeating-linear-gradient(90deg, transparent 0 42px, rgba(255,224,122,.72) 42px 76px, transparent 76px 122px) !important;
        opacity:.82 !important;
      }
      body.flprStandaloneOriginalClient .giftHouseLaneDash.dashOne{ top:48% !important; }
      body.flprStandaloneOriginalClient .giftHouseLaneDash.dashTwo{ top:51% !important; opacity:.42 !important; }
      body.flprStandaloneOriginalClient .giftHouseCrosswalk{
        position:absolute !important;
        right:82px !important;
        top:0 !important;
        bottom:0 !important;
        width:54px !important;
        background:repeating-linear-gradient(90deg, rgba(232,250,255,.70) 0 5px, transparent 5px 12px) !important;
        opacity:.62 !important;
      }
      body.flprStandaloneOriginalClient .giftHouseTrafficLight{
        position:absolute !important;
        right:34px !important;
        top:-24px !important;
        width:28px !important;
        height:78px !important;
        z-index:8 !important;
        display:grid !important;
        grid-template-rows:1fr 1fr 1fr !important;
        gap:5px !important;
        padding:6px !important;
        border:2px solid rgba(255,224,122,.36) !important;
        background:rgba(0,7,14,.94) !important;
        box-shadow:0 0 16px rgba(255,224,122,.14), 0 0 12px rgba(0,0,0,.45) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseTrafficLight::after{
        content:"" !important;
        position:absolute !important;
        left:50% !important;
        top:100% !important;
        width:4px !important;
        height:58px !important;
        background:rgba(232,250,255,.42) !important;
        transform:translateX(-50%) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseTrafficLight .light{
        display:block !important;
        border-radius:50% !important;
        opacity:.22 !important;
        box-shadow:0 0 10px currentColor !important;
      }
      body.flprStandaloneOriginalClient .giftHouseTrafficLight .red{
        color:#ff3b58 !important;
        background:#ff3b58 !important;
        animation:giftHouseRedLight 10s linear infinite !important;
      }
      body.flprStandaloneOriginalClient .giftHouseTrafficLight .amber{
        color:#ffe07a !important;
        background:#ffe07a !important;
        animation:giftHouseAmberLight 10s linear infinite !important;
      }
      body.flprStandaloneOriginalClient .giftHouseTrafficLight .green{
        color:#27ffac !important;
        background:#27ffac !important;
        animation:giftHouseGreenLight 10s linear infinite !important;
      }
      body.flprStandaloneOriginalClient .giftHouseCar{
        bottom:auto !important;
        left:-14% !important;
        z-index:7 !important;
        font-size:36px !important;
        line-height:1 !important;
        transform:scaleX(-1) !important;
        animation:giftHouseCarStopGo 10s linear infinite !important;
      }
      body.flprStandaloneOriginalClient .giftHouseCar.carOne{
        top:19% !important;
        animation-delay:-.8s !important;
        filter:drop-shadow(0 0 8px rgba(0,217,255,.46)) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseCar.carTwo{
        top:56% !important;
        bottom:auto !important;
        animation-duration:10s !important;
        animation-delay:-3.2s !important;
        filter:drop-shadow(0 0 8px rgba(255,86,214,.38)) !important;
      }
      body.flprStandaloneOriginalClient .giftHouseCar.carThree{
        top:36% !important;
        font-size:34px !important;
        animation-delay:-6s !important;
        filter:drop-shadow(0 0 8px rgba(255,224,122,.34)) !important;
      }
      body.flprStandaloneOriginalClient .giftHousePedestrian{
        position:absolute !important;
        left:-8% !important;
        top:50% !important;
        z-index:7 !important;
        font-size:27px !important;
        line-height:1 !important;
        transform:translateY(-50%) !important;
        filter:drop-shadow(0 0 7px rgba(0,217,255,.28)) !important;
        animation:giftHousePedestrianWalk 15s linear infinite !important;
      }
      body.flprStandaloneOriginalClient .giftHousePedestrian.pedTwo{
        animation-delay:-7s !important;
        top:48% !important;
      }
      body.flprStandaloneOriginalClient .giftHousePedestrian.pedThree{
        animation-duration:18s !important;
        animation-delay:-4s !important;
        top:47% !important;
      }
      body.flprStandaloneOriginalClient .giftHousePedestrian.pedFour{
        animation-duration:16s !important;
        animation-delay:-11s !important;
        top:52% !important;
      }
      @keyframes giftHouseCarStopGo{
        0%{ left:-14%; transform:scaleX(-1); }
        56%{ left:74%; transform:scaleX(-1); }
        74%{ left:74%; transform:scaleX(-1); }
        100%{ left:114%; transform:scaleX(-1); }
      }
      @keyframes giftHouseRedLight{
        0%,55%{ opacity:.22; }
        56%,74%{ opacity:1; }
        75%,100%{ opacity:.18; }
      }
      @keyframes giftHouseAmberLight{
        0%,50%{ opacity:.18; }
        51%,55%{ opacity:.95; }
        56%,100%{ opacity:.18; }
      }
      @keyframes giftHouseGreenLight{
        0%,74%{ opacity:.18; }
        75%,100%{ opacity:1; }
      }
      @keyframes giftHousePedestrianWalk{
        0%{ left:-8%; transform:translateY(-50%); }
        48%{ transform:translateY(-56%); }
        50%{ transform:translateY(-50%); }
        100%{ left:108%; transform:translateY(-50%); }
      }
      body.flprStandaloneOriginalClient .giftHouseHintRibbon{
        bottom:calc(24% + 16px) !important;
      }
    `;
    document.head.appendChild(style);
  }

  function panelHtml(){
    return `
      <div id="${HOUSE_PANEL_ID}" class="giftHouseTest">
        <div class="giftHouseTopbar">
          <div class="giftHouseTitle">
            <div class="giftHouseTitleMain">GIFT HOUSE TEST</div>
            <div class="giftHouseTitleSub">One table gift each. Drag from the catalog, then drop to sticker it into the apartment.</div>
          </div>
          <div class="giftHouseStats" id="giftHouseStats"></div>
          <button class="cBtn danger" id="giftHouseResetBtn" type="button">RESET PLACEMENTS</button>
        </div>
        <div class="giftHouseLayout">
          <aside class="giftHouseCatalog">
            <div class="giftHousePaneHead">
              <div class="giftHousePaneTitle">EARNED CATALOG</div>
              <input class="giftHouseSearch" id="giftHouseSearch" type="text" autocomplete="off" spellcheck="false" placeholder="Search table or gift">
            </div>
            <div class="giftHouseCatalogList" id="giftHouseCatalogList"></div>
          </aside>
          <main class="giftHouseStageWrap">
            <div class="giftHouseScene" id="giftHouseScene" aria-label="Gift House placement scene">
              <div class="giftHouseStars" aria-hidden="true"></div>
              <div class="giftHouseMoon" aria-hidden="true"></div>
              <div class="giftHouseSkylineFar" aria-hidden="true"></div>
              <div class="giftHouseSkyline" aria-hidden="true"></div>
              <div class="giftHouseSkylineNear" aria-hidden="true"></div>
              <div class="giftHouseNeonBillboard" aria-hidden="true">PIN CITY</div>
              <div class="giftHouseNeonBillboard alt" aria-hidden="true">FLPR 24</div>
              <div class="giftHouseTower" aria-hidden="true">
                <div class="giftHouseAntenna"></div>
                <div class="giftHouseRoof"><span class="giftHouseRoofSign">FLPR HOUSE</span><span>APT // 50HZ</span></div>
                <div class="giftHouseFloor">
                  <span class="giftHouseFloorStairs floorStairsA"></span>
                  <div class="giftHouseRoom" data-room-id="studio" data-room-label="STUDIO" style="--roomA:rgba(0,50,80,.88);--roomB:rgba(14,8,42,.92);--lampX:72%;--lampY:22%;">
                    <span class="giftHouseRoomFloorPattern floorDiamond"></span><span class="giftHouseDoor doorLeft"></span><span class="giftHouseWallPanel"></span>
                    <span class="giftHouseRoomShelf shelfTall"></span><span class="giftHouseRoomGlow"></span>
                    <span class="giftHouseWindowGrid"><span></span><span></span><span></span><span></span></span>
                    <span class="giftHouseBed"></span><span class="giftHouseFurniture" data-icon="&#x1F39B;&#xFE0F;"></span><span class="giftHouseDesk"></span><span class="giftHouseBalcony"></span>
                  </div>
                  <div class="giftHouseRoom" data-room-id="arcade" data-room-label="ARCADE" style="--roomA:rgba(54,8,52,.88);--roomB:rgba(0,24,44,.94);--lampX:30%;--lampY:28%;">
                    <span class="giftHouseRoomFloorPattern floorGrid"></span><span class="giftHouseDoor doorRight"></span><span class="giftHousePoster posterA"></span>
                    <span class="giftHouseRoomShelf shelfNeon"></span><span class="giftHouseRoomGlow"></span>
                    <span class="giftHouseArcadeCab"></span><span class="giftHouseArcadeCab cabMini"></span><span class="giftHouseDesk"></span><span class="giftHousePlant">&#x1FAB4;</span>
                  </div>
                </div>
                <div class="giftHouseFloor altFloor">
                  <span class="giftHouseFloorStairs floorStairsB"></span>
                  <div class="giftHouseRoom" data-room-id="lounge" data-room-label="LOUNGE" style="--roomA:rgba(30,42,7,.86);--roomB:rgba(0,28,38,.94);--lampX:80%;--lampY:18%;">
                    <span class="giftHouseRoomFloorPattern floorPlanks"></span><span class="giftHouseDoor doorLeft"></span><span class="giftHousePoster posterB"></span>
                    <span class="giftHouseRoomShelf"></span><span class="giftHouseRoomGlow"></span>
                    <span class="giftHouseSofa"></span><span class="giftHouseCoffeeTable"></span><span class="giftHouseFurniture" data-icon="&#x1F6CB;&#xFE0F;"></span><span class="giftHousePlant">&#x1F33F;</span>
                  </div>
                  <div class="giftHouseRoom" data-room-id="workshop" data-room-label="WORKSHOP" style="--roomA:rgba(10,38,58,.9);--roomB:rgba(40,12,20,.92);--lampX:66%;--lampY:24%;">
                    <span class="giftHouseRoomFloorPattern floorHazard"></span><span class="giftHouseDoor doorRight"></span><span class="giftHousePipeRun"></span>
                    <span class="giftHouseRoomShelf shelfTall"></span><span class="giftHouseRoomGlow"></span>
                    <span class="giftHouseWindowGrid"><span></span><span></span><span></span><span></span></span>
                    <span class="giftHouseDesk"></span><span class="giftHouseFurniture" data-icon="&#x1F527;"></span><span class="giftHouseStairs"></span>
                  </div>
                </div>
                <div class="giftHouseFloor">
                  <span class="giftHouseFloorStairs floorStairsC"></span>
                  <div class="giftHouseRoom" data-room-id="garage" data-room-label="GARAGE" style="--roomA:rgba(42,24,8,.9);--roomB:rgba(6,16,28,.94);--lampX:24%;--lampY:18%;">
                    <span class="giftHouseRoomFloorPattern floorConcrete"></span><span class="giftHouseDoor doorLeft"></span><span class="giftHouseGarageDoor"></span>
                    <span class="giftHouseRoomShelf"></span><span class="giftHouseRoomGlow"></span>
                    <span class="giftHouseFurniture" data-icon="&#x1F3CD;&#xFE0F;"></span><span class="giftHouseDesk"></span>
                  </div>
                  <div class="giftHouseRoom" data-room-id="vault" data-room-label="VAULT" style="--roomA:rgba(14,20,56,.88);--roomB:rgba(24,8,40,.94);--lampX:72%;--lampY:20%;">
                    <span class="giftHouseRoomFloorPattern floorHex"></span><span class="giftHouseDoor doorRight vaultDoor"></span><span class="giftHouseVaultCore"></span>
                    <span class="giftHouseRoomShelf shelfNeon"></span><span class="giftHouseRoomGlow"></span>
                    <span class="giftHouseWindowGrid"><span></span><span></span><span></span><span></span></span>
                    <span class="giftHouseFurniture" data-icon="&#x1F512;"></span><span class="giftHouseStairs"></span>
                  </div>
                </div>
              </div>
              <div class="giftHouseStreet" aria-hidden="true">
                <div class="giftHouseSidewalk sidewalkTop"><span class="giftHousePedestrian pedOne">&#x1F6B6;&#xFE0F;</span><span class="giftHousePedestrian pedTwo">&#x1F9CD;</span></div>
                <div class="giftHouseRoad">
                  <span class="giftHouseLane laneOne"></span><span class="giftHouseLane laneTwo"></span>
                  <span class="giftHouseLaneDash dashOne"></span><span class="giftHouseLaneDash dashTwo"></span>
                  <span class="giftHouseCrosswalk"></span>
                  <span class="giftHouseCar carOne">&#x1F697;</span><span class="giftHouseCar carTwo">&#x1F3CE;&#xFE0F;</span><span class="giftHouseCar carThree">&#x1F695;</span>
                  <span class="giftHouseTrafficLight"><span class="light red"></span><span class="light amber"></span><span class="light green"></span></span>
                </div>
                <div class="giftHouseSidewalk sidewalkBottom"><span class="giftHousePedestrian pedThree">&#x1F9D1;&#x200D;&#x1F4BB;</span><span class="giftHousePedestrian pedFour">&#x1F6B6;</span></div>
              </div>
              <div class="giftHouseResidentLayer" id="giftHouseResidentLayer"></div>
              <div class="giftHousePlacementLayer" id="giftHousePlacementLayer"></div>
              <div class="giftHouseHintRibbon">CATALOG ITEMS ARE TEST-UNLOCKED FOR THIS SLICE</div>
            </div>
          </main>
          <aside class="giftHouseInspector">
            <div class="giftHousePaneHead">
              <div class="giftHousePaneTitle">PLACEMENT</div>
            </div>
            <div class="giftHouseInspectorBody" id="giftHouseInspectorBody"></div>
          </aside>
        </div>
      </div>
    `;
  }

  function mountPanel(panel){
    if(!panel) return false;
    injectGiftHouseStyles();
    runtime.panel = panel;
    if(!panel.querySelector(`#${HOUSE_PANEL_ID}`)){
      panel.innerHTML = panelHtml();
    }
    runtime.scene = panel.querySelector("#giftHouseScene");
    bindPanel(panel);
    syncGiftHouseLayoutHeight();
    renderAll();
    [0, 80, 240, 520].forEach((delay)=>setTimeout(syncGiftHouseLayoutHeight, delay));
    return true;
  }

  function bindPanel(panel){
    const search = panel.querySelector("#giftHouseSearch");
    if(search && search.dataset.giftHouseBound !== "1"){
      search.dataset.giftHouseBound = "1";
      search.addEventListener("input", ()=>{
        runtime.search = search.value || "";
        renderCatalog();
      });
    }
    const reset = panel.querySelector("#giftHouseResetBtn");
    if(reset && reset.dataset.giftHouseBound !== "1"){
      reset.dataset.giftHouseBound = "1";
      reset.addEventListener("click", ()=>{
        const state = loadHouseState();
        state.placements = [];
        runtime.selectedInstanceId = "";
        saveHouseState(state);
        renderAll();
      });
    }
    const catalog = panel.querySelector("#giftHouseCatalogList");
    if(catalog && catalog.dataset.giftHouseBound !== "1"){
      catalog.dataset.giftHouseBound = "1";
      catalog.addEventListener("pointerdown", (event)=>{
        const item = event.target.closest(".giftHouseCatalogItem");
        if(!item) return;
        beginCatalogDrag(event, item.dataset.giftId || "");
      });
    }
    const placementLayer = panel.querySelector("#giftHousePlacementLayer");
    if(placementLayer && placementLayer.dataset.giftHouseBound !== "1"){
      placementLayer.dataset.giftHouseBound = "1";
      placementLayer.addEventListener("pointerdown", (event)=>{
        const item = event.target.closest(".giftHousePlacedItem");
        if(!item) return;
        beginPlacementDrag(event, item.dataset.instanceId || "");
      });
    }
    const inspector = panel.querySelector("#giftHouseInspectorBody");
    if(inspector && inspector.dataset.giftHouseBound !== "1"){
      inspector.dataset.giftHouseBound = "1";
      inspector.addEventListener("click", (event)=>{
        const action = event.target.closest("[data-house-action]")?.dataset?.houseAction || "";
        if(action) handleInspectorAction(action);
      });
    }
    if(!runtime.docBound){
      runtime.docBound = true;
      document.addEventListener("pointermove", handleDragMove, { passive:false });
      document.addEventListener("pointerup", handleDragEnd, { passive:false });
      document.addEventListener("pointercancel", handleDragCancel, { passive:false });
    }
    if(!runtime.resizeBound){
      runtime.resizeBound = true;
      window.addEventListener("resize", ()=>syncGiftHouseLayoutHeight(), { passive:true });
    }
  }

  function syncGiftHouseLayoutHeight(){
    try{
      const panel = runtime.panel;
      const root = panel?.querySelector(`#${HOUSE_PANEL_ID}`);
      const layout = panel?.querySelector(".giftHouseLayout");
      if(!root || !layout) return;
      const rect = layout.getBoundingClientRect?.();
      const viewportH = window.innerHeight || document.documentElement.clientHeight || 900;
      const top = Number(rect?.top || 0);
      if(!Number.isFinite(top)) return;
      const bottomPad = 14;
      const nextH = clamp(viewportH - Math.max(0, top) - bottomPad, 620, 1280);
      root.style.setProperty("--giftHouseLayoutH", `${Math.round(nextH)}px`);
    }catch(_){}
  }

  function renderAll(){
    syncGiftHouseLayoutHeight();
    renderStats();
    renderCatalog();
    renderResidents();
    renderPlacements();
    renderInspector();
  }

  function renderStats(){
    const host = runtime.panel?.querySelector("#giftHouseStats");
    if(!host) return;
    const state = loadHouseState();
    const earned = Object.keys(state.inventory || {}).length;
    const placed = state.placements.length;
    const bridge = profileExtensions();
    const saveLabel = bridge && typeof bridge.hasActiveProfile === "function" && bridge.hasActiveProfile() ? "PROFILE" : "LOCAL";
    host.innerHTML = `
      <div class="giftHouseStat">GIFTS ${earned}</div>
      <div class="giftHouseStat">PLACED ${placed}</div>
      <div class="giftHouseStat">${escapeHtml(saveLabel)} SAVE</div>
    `;
  }

  function renderCatalog(){
    const host = runtime.panel?.querySelector("#giftHouseCatalogList");
    if(!host) return;
    const state = loadHouseState();
    const query = String(runtime.search || runtime.panel?.querySelector("#giftHouseSearch")?.value || "").trim().toLowerCase();
    const gifts = giftCatalog().filter((gift)=>{
      if(!state.inventory[gift.id]) return false;
      if(!query) return true;
      return `${gift.giftName} ${gift.tableName} ${gift.code}`.toLowerCase().includes(query);
    });
    host.innerHTML = gifts.length ? gifts.map((gift)=>`
      <button class="giftHouseCatalogItem" type="button" data-gift-id="${escapeHtml(gift.id)}" title="${escapeHtml(gift.giftName)}">
        <span class="giftHouseGiftEmoji">${escapeHtml(gift.emoji)}</span>
        <span class="giftHouseGiftText">
          <span class="giftHouseGiftName">${escapeHtml(gift.giftName)}</span>
          <span class="giftHouseGiftMeta">${escapeHtml(gift.tableName)} // ${escapeHtml(gift.code)}</span>
        </span>
      </button>
    `).join("") : `<div class="giftHouseEmptyNote">No matching gifts in the test catalog.</div>`;
  }

  function renderResidents(){
    const host = runtime.panel?.querySelector("#giftHouseResidentLayer");
    if(!host) return;
    const state = loadHouseState();
    const earned = giftCatalog().filter((gift)=>state.inventory[gift.id]).slice(0, 20);
    const residents = earned.map((gift, index)=>{
      const emoji = gift.houseEmoji[index % Math.max(1, gift.houseEmoji.length)] || gift.emoji;
      const col = index % 5;
      const row = Math.floor(index / 5) % 4;
      const x = 28 + col * 11 + ((row % 2) * 4);
      const y = 18 + row * 16 + ((index % 3) * 1.5);
      return `<span class="giftHouseResident" style="left:${x}%;top:${y}%;" title="${escapeHtml(gift.tableName)}">${escapeHtml(emoji)}</span>`;
    });
    host.innerHTML = residents.join("");
  }

  function renderPlacements(){
    const host = runtime.panel?.querySelector("#giftHousePlacementLayer");
    if(!host) return;
    const state = loadHouseState();
    host.innerHTML = state.placements.map((placement)=>{
      const gift = giftById(placement.giftId);
      if(!gift) return "";
      const selected = placement.instanceId === runtime.selectedInstanceId ? " selected" : "";
      return `
        <button class="giftHousePlacedItem${selected}" type="button"
          data-instance-id="${escapeHtml(placement.instanceId)}"
          data-gift-id="${escapeHtml(placement.giftId)}"
          style="left:${placement.x.toFixed(3)}%;top:${placement.y.toFixed(3)}%;z-index:${placement.z};--giftScale:${placement.scale.toFixed(3)};--giftRot:${placement.rotation.toFixed(2)}deg;"
          title="${escapeHtml(gift.giftName)}">${escapeHtml(gift.emoji)}</button>
      `;
    }).join("");
  }

  function renderInspector(){
    const host = runtime.panel?.querySelector("#giftHouseInspectorBody");
    if(!host) return;
    const state = loadHouseState();
    const placement = state.placements.find((entry)=>entry.instanceId === runtime.selectedInstanceId) || null;
    const gift = placement ? giftById(placement.giftId) : null;
    if(!placement || !gift){
      host.innerHTML = `
        <div class="giftHouseEmptyNote">Select a placed gift to resize, rotate, remove, or inspect its source table.</div>
        <div class="giftHouseEmptyNote">Slice 1-3 test status: tab shell, table-gift catalog, and sticky drag placement are active.</div>
      `;
      return;
    }
    host.innerHTML = `
      <div class="giftHouseSelectedCard">
        <div class="giftHouseSelectedEmoji">${escapeHtml(gift.emoji)}</div>
        <div class="giftHouseSelectedName">${escapeHtml(gift.giftName)}</div>
        <div class="giftHouseSelectedMeta">${escapeHtml(gift.tableName)} // ${escapeHtml(gift.code)}<br>ROOM ${escapeHtml(placement.roomId || "free")}</div>
      </div>
      <div class="giftHouseActionGrid">
        <button class="cBtn" type="button" data-house-action="smaller">SMALLER</button>
        <button class="cBtn" type="button" data-house-action="larger">LARGER</button>
        <button class="cBtn" type="button" data-house-action="rotateLeft">ROT -</button>
        <button class="cBtn" type="button" data-house-action="rotateRight">ROT +</button>
        <button class="cBtn" type="button" data-house-action="front">FRONT</button>
        <button class="cBtn danger" type="button" data-house-action="delete">REMOVE</button>
      </div>
    `;
  }

  function makeInstanceId(){
    return `house_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function beginCatalogDrag(event, giftId){
    const gift = giftById(giftId);
    if(!gift) return;
    event.preventDefault();
    try{ event.currentTarget?.setPointerCapture?.(event.pointerId); }catch(_){}
    const state = loadHouseState();
    const point = scenePointFromEvent(event) || { x: 50, y: 50, roomId: "" };
    const placement = {
      instanceId: makeInstanceId(),
      giftId: gift.id,
      x: point.x,
      y: point.y,
      scale: 1,
      rotation: 0,
      z: nextZIndex(state),
      roomId: point.roomId || "",
      sticker: true
    };
    state.placements.push(placement);
    runtime.selectedInstanceId = placement.instanceId;
    runtime.drag = { placement: cloneJson(placement, placement) };
    saveHouseState(state);
    renderAll();
    markDragging(placement.instanceId, true);
  }

  function beginPlacementDrag(event, instanceId){
    const state = loadHouseState();
    const placement = state.placements.find((entry)=>entry.instanceId === instanceId);
    if(!placement) return;
    event.preventDefault();
    try{ event.currentTarget?.setPointerCapture?.(event.pointerId); }catch(_){}
    runtime.selectedInstanceId = instanceId;
    runtime.drag = { placement: cloneJson(placement, placement) };
    renderPlacements();
    renderInspector();
    markDragging(instanceId, true);
  }

  function nextZIndex(state){
    return Math.max(1, ...((state.placements || []).map((entry)=>Math.round(Number(entry.z || 1) || 1)))) + 1;
  }

  function scenePointFromEvent(event){
    const scene = runtime.scene || runtime.panel?.querySelector("#giftHouseScene");
    if(!scene || !event) return null;
    const rect = scene.getBoundingClientRect();
    if(!rect.width || !rect.height) return null;
    const x = clamp(((event.clientX - rect.left) / rect.width) * 100, 3, 97);
    const y = clamp(((event.clientY - rect.top) / rect.height) * 100, 5, 95);
    return { x, y, roomId: roomIdFromPoint(event.clientX, event.clientY) };
  }

  function roomIdFromPoint(clientX, clientY){
    try{
      const rooms = Array.from(runtime.panel?.querySelectorAll(".giftHouseRoom") || []);
      for(const room of rooms){
        const rect = room.getBoundingClientRect();
        if(clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom){
          return String(room.dataset.roomId || "");
        }
      }
    }catch(_){}
    return "";
  }

  function handleDragMove(event){
    if(!runtime.drag || !runtime.drag.placement) return;
    event.preventDefault();
    const point = scenePointFromEvent(event);
    if(!point) return;
    runtime.drag.placement.x = point.x;
    runtime.drag.placement.y = point.y;
    runtime.drag.placement.roomId = point.roomId || "";
    paintPlacement(runtime.drag.placement);
  }

  function handleDragEnd(event){
    if(!runtime.drag || !runtime.drag.placement) return;
    event.preventDefault();
    const placement = normalizePlacement(runtime.drag.placement, 0);
    runtime.drag = null;
    if(!placement) return;
    const state = loadHouseState();
    const idx = state.placements.findIndex((entry)=>entry.instanceId === placement.instanceId);
    if(idx >= 0) state.placements[idx] = placement;
    else state.placements.push(placement);
    runtime.selectedInstanceId = placement.instanceId;
    saveHouseState(state);
    renderAll();
  }

  function handleDragCancel(event){
    if(!runtime.drag) return;
    handleDragEnd(event || {});
  }

  function paintPlacement(placement){
    const el = runtime.panel?.querySelector(`.giftHousePlacedItem[data-instance-id="${placement.instanceId}"]`);
    if(!el) return;
    el.style.left = `${placement.x.toFixed(3)}%`;
    el.style.top = `${placement.y.toFixed(3)}%`;
    el.style.zIndex = String(placement.z);
    el.style.setProperty("--giftScale", placement.scale.toFixed(3));
    el.style.setProperty("--giftRot", `${placement.rotation.toFixed(2)}deg`);
  }

  function markDragging(instanceId, on){
    const el = runtime.panel?.querySelector(`.giftHousePlacedItem[data-instance-id="${instanceId}"]`);
    if(el) el.classList.toggle("dragging", !!on);
  }

  function handleInspectorAction(action){
    const selected = String(runtime.selectedInstanceId || "");
    if(!selected) return;
    const state = loadHouseState();
    const placement = state.placements.find((entry)=>entry.instanceId === selected);
    if(!placement) return;
    if(action === "delete"){
      state.placements = state.placements.filter((entry)=>entry.instanceId !== selected);
      runtime.selectedInstanceId = "";
    }else if(action === "smaller"){
      placement.scale = clamp(placement.scale - 0.1, 0.55, 1.8);
    }else if(action === "larger"){
      placement.scale = clamp(placement.scale + 0.1, 0.55, 1.8);
    }else if(action === "rotateLeft"){
      placement.rotation = clamp(placement.rotation - 6, -18, 18);
    }else if(action === "rotateRight"){
      placement.rotation = clamp(placement.rotation + 6, -18, 18);
    }else if(action === "front"){
      placement.z = nextZIndex(state);
    }
    saveHouseState(state);
    renderAll();
  }

  window.flprStandaloneGiftHouseTest = {
    mountPanel,
    render: renderAll,
    reset(){
      const state = loadHouseState();
      state.placements = [];
      runtime.selectedInstanceId = "";
      saveHouseState(state);
      renderAll();
    },
    catalog: giftCatalog
  };

  function requestBridgeRebuild(){
    try{
      if(typeof window.flprStandaloneRebuildControls === "function"){
        window.flprStandaloneRebuildControls();
        const active = document.querySelector('.controlsTabPanel.active')?.dataset?.ctrlPanel || "";
        if(active === "house") mountPanel(document.querySelector('.controlsTabPanel[data-ctrl-panel="house"]'));
      }
    }catch(_){}
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", requestBridgeRebuild, { once:true });
  }else{
    setTimeout(requestBridgeRebuild, 0);
  }
})();
