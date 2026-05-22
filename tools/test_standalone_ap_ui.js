const { _electron: electron } = require("playwright");
const crypto = require("crypto");
const fs = require("fs");
const net = require("net");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const APP_ROOT = process.env.FLPR_TEST_APP_ROOT
  ? path.resolve(process.env.FLPR_TEST_APP_ROOT)
  : ROOT;
const PORT = 36391;
const OUT_DIR = path.join(ROOT, "build", "test-output");
const SCREENSHOT = path.join(OUT_DIR, "standalone-ap-ui-test.png");
const USER_DATA = path.join(OUT_DIR, "electron-user-data");
const ELECTRON_EXE = require("electron");
const HOME_EDITION_TITLE = "Flippermizer! Pinball Randomized! | Home Edition";

const GAME = "Manual_FlippermizerBaseGame_Ashodin";
const BONUS_ROUND_LOCATION = "Super Mario Bros. - Medium Task";
const BONUS_ROUND_DISPLAY_LOCATION = "Super Mario Bros. - Complete one bonus round";
const HARD_SCORE_LOCATION = "Super Mario Bros. - Hard Score (69,593,091+)";
const RUPEE_SCORE_LOCATION = "Super Mario Bros. - Medium Score (24,925,639+)";
const BOSS_ROUTING_TABLE = "Vector Test Table";
const BOSS_ROUTING_REGULAR_LOCATION = "Vector Test Table - Skill Shot";
const BOSS_ROUTING_REGULAR_LOCATION_2 = "Vector Test Table - Loop Champ";
const BOSS_ROUTING_BOSS_LOCATION = "Vector Test Table - Boss Damage 16%";
const BOSS_ROUTING_VICTORY_LOCATION = "Vector Test Table - Boss Victory";
const BONUS_ROUND_ENTRY = {
  location: BONUS_ROUND_LOCATION,
  table: "Super Mario Bros.",
  target_table: "Super Mario Bros.",
  source_table: "Super Mario Bros.",
  source_location: BONUS_ROUND_DISPLAY_LOCATION,
  difficulty: "medium",
  kind: "task",
  task_type: "task",
  objective: "Complete one bonus round",
  display_name: "Complete one bonus round",
  title: "Complete one bonus round",
  explanation: "Use castle, shell/key, numbered multiball, and bonus-round progress. These are table-specific Super Mario Bros. objectives."
};
const PLAYERS = [
  { team: 0, slot: 1, alias: "AshodinNoTrap", name: "AshodinNoTrap", game: GAME, tags: ["AP"], version: { major: 0, minor: 6, build: 2 } },
  { team: 0, slot: 2, alias: "ALTTPP3", name: "ALTTPP3", game: "A Link to the Past", tags: ["AP"], version: { major: 0, minor: 5, build: 1 } },
  { team: 0, slot: 3, alias: "HereticP2", name: "HereticP2", game: "Heretic", tags: ["AP"], version: { major: 0, minor: 6, build: 2 } }
];

const dataPackage = {
  cmd: "DataPackage",
  data: {
    games: {
      [GAME]: {
        item_name_to_id: {
          "Progressive Ball - Dirty Harry": 1001,
          "Arrows (10)": 1002,
          "Tome of Power": 1003,
          "The Citadel (E1M5)": 1004,
          "Pinball Fragment": 1005,
          "Easy Junk Item": 1006,
          "Progressive Ball - Police Force": 1007,
          "Progressive Ball - Corvette": 1008,
          "Boss Key": 1009,
          "Hint: Boss Key": 1010,
          "Hint: Ball Location": 1011,
          "Progressive Ball - Skateball": 4004,
          "Progressive Ball - Cyclone": 4005
        },
        location_name_to_id: {
          "Dirty Harry - Skill Shot": 3001,
          "Medieval Madness - Castle Gate": 3002,
          "Medieval Madness - Fragment Lane": 3003,
          "Medieval Madness - Troll Hit 1": 3004,
          "Medieval Madness - Troll Hit 2": 3005,
          "Medieval Madness - Merlin Saucer": 3006,
          "Dirty Harry - Junk Lane 1": 3007,
          "Dirty Harry - Junk Lane 2": 3008,
          "Dirty Harry - Junk Lane 3": 3009,
          [BONUS_ROUND_LOCATION]: 3010,
          [HARD_SCORE_LOCATION]: 3011,
          [RUPEE_SCORE_LOCATION]: 3012,
          "Super Mario Bros. - Boss Key Vault": 3013,
          [BOSS_ROUTING_REGULAR_LOCATION]: 3020,
          [BOSS_ROUTING_REGULAR_LOCATION_2]: 3021,
          [BOSS_ROUTING_BOSS_LOCATION]: 3901,
          [BOSS_ROUTING_VICTORY_LOCATION]: 3902
        }
      },
      "A Link to the Past": {
        item_name_to_id: {
          "Bow": 4001,
          "Bug-Catching Net": 4002,
          "Rupees (50)": 4003,
          "Pegasus Boots": 4004,
          "Rupees (300)": 4005
        },
        location_name_to_id: {
          "Link's Uncle": 2001,
          "Secret Passage": 2002,
          "Sunken Treasure": 2004
        }
      },
      Heretic: {
        item_name_to_id: {},
        location_name_to_id: {
          "Floodgate Chest": 2003
        }
      }
    }
  }
};

const receivedItems = {
  cmd: "ReceivedItems",
  index: 0,
  items: [
    { item: 1001, location: 2001, player: 2, flags: 1 },
    { item: 1008, location: 2004, player: 2, flags: 1 },
    { item: 1002, location: 2002, player: 2, flags: 2 },
    { item: 1003, location: 2003, player: 3, flags: 1 },
    { item: 1005, location: 3002, player: 1, flags: 0 },
    { item: 1006, location: 3007, player: 1, flags: 0 },
    { item: 1006, location: 3008, player: 1, flags: 0 },
    { item: 1006, location: 3009, player: 1, flags: 0 }
  ]
};

const serverHintsForOtherPlayers = [
  {
    receiving_player: 2,
    finding_player: 1,
    location: 3020,
    item: 4004,
    item_flags: 1,
    found: false,
    entrance: "Vanilla"
  },
  {
    receiving_player: 2,
    finding_player: 1,
    location: 3012,
    item: 4005,
    item_flags: 0,
    found: true,
    entrance: "Vanilla"
  }
];

function makeRetrievedHintPacket(keys) {
  const values = {};
  (Array.isArray(keys) ? keys : []).forEach((key) => {
    if(/^_read_hints_0_2$/.test(String(key || ""))) {
      values[key] = serverHintsForOtherPlayers.map((hint) => ({ ...hint }));
    } else if(/^_read_hints_\d+_\d+$/.test(String(key || ""))) {
      values[key] = [];
    }
  });
  return { cmd: "Retrieved", keys: values };
}

function encodeFrame(text) {
  const payload = Buffer.from(text, "utf8");
  let header;
  if (payload.length < 126) {
    header = Buffer.from([0x81, payload.length]);
  } else if (payload.length < 65536) {
    header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 126;
    header.writeUInt16BE(payload.length, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x81;
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(payload.length), 2);
  }
  return Buffer.concat([header, payload]);
}

function decodeFrames(state, chunk, onText) {
  state.buffer = Buffer.concat([state.buffer, chunk]);
  while (state.buffer.length >= 2) {
    const first = state.buffer[0];
    const second = state.buffer[1];
    const opcode = first & 0x0f;
    const masked = !!(second & 0x80);
    let len = second & 0x7f;
    let offset = 2;
    if (len === 126) {
      if (state.buffer.length < 4) return;
      len = state.buffer.readUInt16BE(2);
      offset = 4;
    } else if (len === 127) {
      if (state.buffer.length < 10) return;
      len = Number(state.buffer.readBigUInt64BE(2));
      offset = 10;
    }
    const maskOffset = offset;
    if (masked) offset += 4;
    if (state.buffer.length < offset + len) return;
    let payload = state.buffer.slice(offset, offset + len);
    if (masked) {
      const mask = state.buffer.slice(maskOffset, maskOffset + 4);
      payload = Buffer.from(payload.map((byte, index) => byte ^ mask[index % 4]));
    }
    state.buffer = state.buffer.slice(offset + len);
    if (opcode === 0x8) return;
    if (opcode === 0x1) onText(payload.toString("utf8"));
  }
}

function makeItemSendPacket() {
  return {
    cmd: "PrintJSON",
    type: "ItemSend",
    receiving: 1,
    player: 2,
    item: { item: 1001, location: 2001, player: 2, flags: 1 },
    data: [
      { type: "player_id", text: "ALTTPP3", player: 2 },
      { type: "text", text: " sent " },
      { type: "item_id", text: "Progressive Ball - Dirty Harry", item: 1001, player: 1, flags: 1 },
      { type: "text", text: " to " },
      { type: "player_id", text: "AshodinNoTrap", player: 1 },
      { type: "text", text: " (" },
      { type: "location_id", text: "Link's Uncle", location: 2001, player: 2 },
      { type: "text", text: ")" }
    ]
  };
}

function makeSelfSentItemPacket() {
  return {
    cmd: "PrintJSON",
    type: "ItemSend",
    receiving: 3,
    player: 1,
    item: { item: 370001, location: 3001, player: 1, flags: 1 },
    data: [
      { type: "player_id", text: "AshodinNoTrap", player: 1 },
      { type: "text", text: " sent " },
      { type: "item_id", text: "370001", item: 370001, player: 3, flags: 1 },
      { type: "text", text: " to " },
      { type: "player_id", text: "HereticP2", player: 3 },
      { type: "text", text: " (" },
      { type: "location_id", text: "Dirty Harry - Skill Shot", location: 3001, player: 1 },
      { type: "text", text: ")" }
    ]
  };
}

function makeBugNetSentPacket() {
  return {
    cmd: "PrintJSON",
    type: "ItemSend",
    receiving: 2,
    player: 1,
    item: { item: 4002, location: 3010, player: 1, flags: 2 },
    data: [
      { type: "player_id", text: "AshodinNoTrap", player: 1 },
      { type: "text", text: " sent " },
      { type: "item_id", text: "Bug-Catching Net", item: 4002, player: 2, flags: 2 },
      { type: "text", text: " to " },
      { type: "player_id", text: "ALTTPP3", player: 2 },
      { type: "text", text: " (" },
      { type: "location_id", text: BONUS_ROUND_LOCATION, location: 3010, player: 1 },
      { type: "text", text: ")" }
    ]
  };
}

function makeRupeesSentPacket() {
  return {
    cmd: "PrintJSON",
    type: "ItemSend",
    receiving: 2,
    player: 1,
    item: { item: 4005, location: 3012, player: 1, flags: 0 },
    data: [
      { type: "player_id", text: "AshodinNoTrap", player: 1 },
      { type: "text", text: " sent " },
      { type: "item_id", text: "Rupees (300)", item: 4005, player: 2, flags: 0 },
      { type: "text", text: " to " },
      { type: "player_id", text: "ALTTPP3", player: 2 },
      { type: "text", text: " (" },
      { type: "location_id", text: RUPEE_SCORE_LOCATION, location: 3012, player: 1 },
      { type: "text", text: ")" }
    ]
  };
}

function makeOwnFoundPoliceForcePacket() {
  return {
    cmd: "PrintJSON",
    type: "ItemSend",
    receiving: 1,
    player: 1,
    item: { item: 1007, location: 3010, player: 1, flags: 1 },
    data: [
      { type: "player_id", text: "AshodinNoTrap", player: 1 },
      { type: "text", text: " sent " },
      { type: "item_id", text: "Progressive Ball - Police Force", item: 1007, player: 1, flags: 1 },
      { type: "text", text: " to " },
      { type: "player_id", text: "AshodinNoTrap", player: 1 },
      { type: "text", text: " (" },
      { type: "location_id", text: BONUS_ROUND_LOCATION, location: 3010, player: 1 },
      { type: "text", text: ")" }
    ]
  };
}

function makeFlippermizerCheckBouncePacket() {
  return {
    cmd: "Bounced",
    data: {
      type: "flippermizer_check_redeemed",
      meta: {
        table_name: "Dirty Harry",
        task_name: "Skill Shot",
        displayed_location_name: "Dirty Harry - Skill Shot",
        location_name: "Dirty Harry - Skill Shot",
        difficulty: "easy",
        task_type: "task",
        source: "test"
      }
    }
  };
}

function makeGenericBouncePacket() {
  return {
    cmd: "Bounced",
    tags: ["AP"],
    data: {
      type: "debug_echo",
      message: "This generic bounce should not be visible in the Home Edition text log."
    }
  };
}

function createApTestServer() {
  const clients = new Set();
  const received = [];
  const receivedItemsSnapshot = () => ({
    ...receivedItems,
    items: receivedItems.items.slice()
  });
  const server = net.createServer((socket) => {
    const state = { handshaken: false, buffer: Buffer.alloc(0) };
    const send = (packets) => {
      const arr = Array.isArray(packets) ? packets : [packets];
      socket.write(encodeFrame(JSON.stringify(arr)));
    };
    clients.add({ socket, send });
    socket.on("close", () => {
      for (const client of clients) {
        if (client.socket === socket) clients.delete(client);
      }
    });
    socket.on("data", (chunk) => {
      if (!state.handshaken) {
        const text = chunk.toString("utf8");
        const end = text.indexOf("\r\n\r\n");
        if (end === -1) return;
        const headers = Object.fromEntries(text.slice(0, end).split(/\r\n/).slice(1).map((line) => {
          const idx = line.indexOf(":");
          return idx === -1 ? ["", ""] : [line.slice(0, idx).toLowerCase(), line.slice(idx + 1).trim()];
        }));
        const accept = crypto
          .createHash("sha1")
          .update(headers["sec-websocket-key"] + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11")
          .digest("base64");
        const protocol = headers["sec-websocket-protocol"];
        const responseHeaders = [
          "HTTP/1.1 101 Switching Protocols",
          "Upgrade: websocket",
          "Connection: Upgrade",
          `Sec-WebSocket-Accept: ${accept}`
        ];
        if (protocol) responseHeaders.push(`Sec-WebSocket-Protocol: ${protocol.split(",")[0].trim()}`);
        socket.write(responseHeaders.join("\r\n") + "\r\n\r\n");
        state.handshaken = true;
        setTimeout(() => send({
          cmd: "RoomInfo",
          seed_name: "standalone-ui-test-36391",
          games: [GAME, "A Link to the Past", "Heretic"],
          slot_info: {
            1: { name: "AshodinNoTrap", game: GAME, type: 1 },
            2: { name: "ALTTPP3", game: "A Link to the Past", type: 1 },
            3: { name: "HereticP2", type: 1 }
          }
        }), 60);
        const rest = chunk.slice(Buffer.byteLength(text.slice(0, end + 4)));
        if (rest.length) decodeFrames(state, rest, handleText);
        return;
      }
      decodeFrames(state, chunk, handleText);
    });

    function handleText(text) {
      received.push(text);
      let packets = [];
      try { packets = JSON.parse(text); } catch (_) { return; }
      if (!Array.isArray(packets)) packets = [packets];
      for (const pkt of packets) {
        if (pkt.cmd === "Connect") {
          send({
            cmd: "Connected",
            team: 0,
            slot: 1,
            players: PLAYERS,
            checked_locations: [],
            missing_locations: [3010, 3011, 3012, 3013, 3020, 3021],
            slot_data: {
              generic_checks: {
                enabled: true,
                entries: [BONUS_ROUND_ENTRY],
                by_location: { [BONUS_ROUND_LOCATION]: BONUS_ROUND_ENTRY }
              },
              task_shuffle: {
                enabled: true,
                entries: [BONUS_ROUND_ENTRY],
                by_location: { [BONUS_ROUND_LOCATION]: BONUS_ROUND_ENTRY }
              }
            }
          });
          setTimeout(() => send({ cmd: "Print", text: "AP test server says hello from port 36391." }), 120);
        }
        if (pkt.cmd === "GetDataPackage") {
          setTimeout(() => send(makeSelfSentItemPacket()), 220);
          setTimeout(() => send(makeRupeesSentPacket()), 300);
          setTimeout(() => send(dataPackage), 650);
          setTimeout(() => send(makeFlippermizerCheckBouncePacket()), 760);
          setTimeout(() => send({ cmd: "RoomUpdate", players: PLAYERS, checked_locations: [3001], missing_locations: [3010, 3011, 3012, 3013, 3020, 3021] }), 850);
          setTimeout(() => send(makeItemSendPacket()), 1050);
          setTimeout(() => send(makeGenericBouncePacket()), 1120);
        }
        if (pkt.cmd === "Sync") {
          setTimeout(() => send(receivedItemsSnapshot()), 120);
        }
        if (pkt.cmd === "Get") {
          const keys = Array.isArray(pkt.keys) ? pkt.keys : [];
          const response = makeRetrievedHintPacket(keys);
          if(Object.keys(response.keys || {}).length) {
            setTimeout(() => send(response), 70);
          }
        }
        if (pkt.cmd === "LocationChecks") {
          const locs = Array.isArray(pkt.locations) ? pkt.locations.map(Number) : [];
          if (locs.includes(3010)) {
            setTimeout(() => send(makeBugNetSentPacket()), 80);
            setTimeout(() => send({ cmd: "RoomUpdate", players: PLAYERS, checked_locations: [3001, 3010], missing_locations: [3011, 3012, 3013, 3020, 3021] }), 240);
          }
        }
        if (pkt.cmd === "LocationScouts") {
          const locs = Array.isArray(pkt.locations) ? pkt.locations.map(Number) : [];
          const locations = [];
          if (locs.includes(3013)) locations.push({ item: 1009, location: 3013, player: 1, flags: 1 });
          if (locs.includes(3011)) locations.push({ item: 4004, location: 3011, player: 2, flags: 1 });
          if (locations.length) {
            setTimeout(() => send({ cmd: "LocationInfo", locations }), 80);
          }
        }
        if (pkt.cmd === "Say") {
          send({ cmd: "Print", text: `AshodinNoTrap: ${pkt.text}` });
          send({
            cmd: "PrintJSON",
            type: "Hint",
            data: [
              { type: "text", text: "[Hint]: " },
              { type: "location_id", text: "Secret Passage", location: 2002, player: 2 },
              { type: "text", text: " contains " },
              { type: "item_id", text: "Arrows (10)", item: 1002, player: 1, flags: 2 },
              { type: "text", text: " for AshodinNoTrap." }
            ]
          });
        }
      }
    }
  });
  return {
    received,
    listen: () => new Promise((resolve, reject) => {
      server.once("error", reject);
      server.listen(PORT, "127.0.0.1", resolve);
    }),
    close: () => new Promise((resolve) => server.close(resolve))
  };
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitFor(page, predicateSource, timeoutMs = 15000) {
  const start = Date.now();
  let last = null;
  while (Date.now() - start < timeoutMs) {
    try {
      const result = await page.evaluate(`(() => { ${predicateSource} })()`);
      if (result) return result;
      last = result;
    } catch (err) {
      last = err && err.message;
    }
    await delay(100);
  }
  let rendererState = null;
  try {
    rendererState = await page.evaluate(`(() => ({
      bodyClass: document.body?.className || "",
      profileGateHidden: !!document.querySelector('#standaloneProfileGate[hidden]'),
      profileGateVisible: !!document.querySelector('#standaloneProfileGate:not([hidden])'),
      modeGateHidden: !!document.querySelector('#standaloneModeGate[hidden]'),
      modeGateVisible: !!document.querySelector('#standaloneModeGate:not([hidden])'),
      profileHud: document.querySelector('#standaloneProfileHud')?.innerText || "",
      profileRuntime: window.__flprStandaloneProfileRuntime ? {
        selectedMode: window.__flprStandaloneProfileRuntime.selectedMode || "",
        randomizerReady: !!window.__flprStandaloneProfileRuntime.randomizerReady,
        randomizerStarted: !!window.__flprStandaloneProfileRuntime.randomizerStarted,
        appliedProfileId: window.__flprStandaloneProfileRuntime.appliedProfileId || ""
      } : null
    }))()`);
  } catch (_) {}
  throw new Error(`Timed out waiting for renderer condition; last=${last}; state=${JSON.stringify(rendererState)}`);
}

async function run() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.rmSync(USER_DATA, { recursive: true, force: true });
  fs.mkdirSync(USER_DATA, { recursive: true });
  const apServer = createApTestServer();
  let electronApp = null;
  try {
  await apServer.listen();

  const env = { ...process.env };
  delete env.ELECTRON_RUN_AS_NODE;
  electronApp = await electron.launch({
    executablePath: ELECTRON_EXE,
    cwd: APP_ROOT,
    args: [
      "--disable-gpu",
      "--disable-gpu-sandbox",
      "--no-sandbox",
      `--user-data-dir=${USER_DATA}`,
      APP_ROOT
    ],
    env
  });
  const page = await electronApp.firstWindow();
  await page.setViewportSize({ width: 1400, height: 900 });
  await waitFor(page, `
    return !!(
      document.body.classList.contains('flprStandaloneOriginalClient') &&
      document.querySelector('.flprStandaloneSingleplayerLayout #standaloneStartSeedBtn') &&
      document.querySelector('.flprStandaloneConnectLayout #apConnectBtn') &&
      window.flprStandaloneTextClientSend &&
      window.flprStandaloneTaskTooltipForTest
    );
  `, 30000);

  const titleProbe = await electronApp.evaluate(({ app, BrowserWindow }) => {
    const win = BrowserWindow.getAllWindows()[0] || null;
    return {
      appName: app.getName(),
      windowTitle: win ? win.getTitle() : ""
    };
  });
  const pageTitle = await page.title();
  if(titleProbe.appName !== HOME_EDITION_TITLE || titleProbe.windowTitle !== HOME_EDITION_TITLE || pageTitle !== HOME_EDITION_TITLE){
    throw new Error(`Home Edition title was not applied: ${JSON.stringify({ titleProbe, pageTitle })}`);
  }

  const bridgeProbe = await page.evaluate(`(() => ({
    tableLookup: !!(typeof getTableKeyForName === "function" && getTableKeyForName.__flprStandaloneTableLookupBridge),
    unlockFx: !!(typeof triggerTableFirstUnlockFx === "function" && triggerTableFirstUnlockFx.__flprStandaloneUnlockFxBridge),
    sfxDedupe: !!(typeof playSfx === "function" && playSfx.__flprStandaloneSfxDedupeBridge)
  }))()`);
  if(!bridgeProbe.tableLookup || !bridgeProbe.unlockFx || !bridgeProbe.sfxDedupe){
    throw new Error(`Standalone AP receive/audio bridges were not installed: ${JSON.stringify(bridgeProbe)}`);
  }

  const patchNotesHomeProbe = await waitFor(page, `
    const overlay = document.getElementById("flprPatchNotesOverlay");
    if(!overlay || overlay.classList.contains("hidden")) return false;
    return {
      visible: true,
      title: document.getElementById("flprPatchNotesTitle")?.textContent || "",
      sub: document.getElementById("flprPatchNotesSub")?.textContent || "",
      body: document.getElementById("flprPatchNotesBody")?.innerText || "",
      itemCount: document.querySelectorAll("#flprPatchNotesBody .flprPatchNotesItem").length,
      firstItem: document.querySelector("#flprPatchNotesBody .flprPatchNotesItem")?.innerText || "",
      dontShow: !!document.getElementById("flprPatchNotesDontShow"),
      dontShowText: document.querySelector(".flprPatchNotesDontShow")?.innerText || "",
      storageKey: window.FLPR_PATCH_NOTES_SEEN_LS_KEY || ""
    };
  `, 6000);
  if(
    !patchNotesHomeProbe.visible ||
    !/PATCH NOTES/i.test(patchNotesHomeProbe.title || "") ||
    !/Home Edition/i.test(patchNotesHomeProbe.sub || "") ||
    patchNotesHomeProbe.itemCount !== 3 ||
    !/Checks header layout/i.test(patchNotesHomeProbe.firstItem || "") ||
    !/Stream header polish/i.test(patchNotesHomeProbe.body || "") ||
    !/Score modifier/i.test(patchNotesHomeProbe.body || "") ||
    /Patch notes control|Relics button|Score entry\nManual score entry/i.test(patchNotesHomeProbe.body || "") ||
    !patchNotesHomeProbe.dontShow ||
    !/Don'?t Show Next Time/i.test(patchNotesHomeProbe.dontShowText || "")
  ){
    throw new Error(`Home Edition patch notes did not appear on first launch: ${JSON.stringify(patchNotesHomeProbe)}`);
  }

  const patchNotesOnceProbe = await page.evaluate(async () => {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const key = window.FLPR_PATCH_NOTES_SEEN_LS_KEY || "flpr_changelog_patch_notes_seen_v1";
    const suppressKey = window.FLPR_PATCH_NOTES_SUPPRESS_LS_KEY || "flpr_changelog_patch_notes_suppress_v1";
    const checkbox = document.getElementById("flprPatchNotesDontShow");
    if(checkbox){
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event("change", { bubbles:true }));
    }
    try{ flprDismissPatchNotes(); }catch(_){}
    await delay(80);
    const stored = localStorage.getItem(key) || "";
    const suppressed = localStorage.getItem(suppressKey) || "";
    const reshow = typeof flprMaybeShowPatchNotes === "function" ? flprMaybeShowPatchNotes({ delayMs:0 }) : null;
    await delay(80);
    const overlay = document.getElementById("flprPatchNotesOverlay");
    return {
      stored,
      suppressed,
      reshow,
      hiddenAfterReshow: !overlay || overlay.classList.contains("hidden"),
      aria: overlay?.getAttribute("aria-hidden") || ""
    };
  });
  if(
    !/Home Edition::/.test(patchNotesOnceProbe.stored || "") ||
    !/Home Edition::/.test(patchNotesOnceProbe.suppressed || "") ||
    patchNotesOnceProbe.reshow !== false ||
    !patchNotesOnceProbe.hiddenAfterReshow ||
    patchNotesOnceProbe.aria !== "true"
  ){
    throw new Error(`Patch notes were not remembered after Home Edition dismissal: ${JSON.stringify(patchNotesOnceProbe)}`);
  }

  const patchNotesStreamProbe = await page.evaluate(async () => {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const key = window.FLPR_PATCH_NOTES_SEEN_LS_KEY || "flpr_changelog_patch_notes_seen_v1";
    const suppressKey = window.FLPR_PATCH_NOTES_SUPPRESS_LS_KEY || "flpr_changelog_patch_notes_suppress_v1";
    const previous = {
      bodyClass: document.body.className,
      launcher: window.flprLauncher,
      stored: localStorage.getItem(key),
      suppressed: localStorage.getItem(suppressKey)
    };
    try{
      localStorage.removeItem(key);
      localStorage.removeItem(suppressKey);
      document.body.classList.remove("flprStandaloneOriginalClient");
      window.flprLauncher = { openPage(){ return Promise.resolve(); } };
      const shown = typeof flprMaybeShowPatchNotes === "function" ? flprMaybeShowPatchNotes({ delayMs:0 }) : false;
      await delay(80);
      const overlay = document.getElementById("flprPatchNotesOverlay");
      const sub = document.getElementById("flprPatchNotesSub")?.textContent || "";
      const visible = !!overlay && !overlay.classList.contains("hidden");
      try{ flprDismissPatchNotes(); }catch(_){}
      const stored = localStorage.getItem(key) || "";
      return {
        shown,
        visible,
        sub,
        stored,
        hiddenAfterDismiss: !overlay || overlay.classList.contains("hidden")
      };
    }finally{
      try{ document.body.className = previous.bodyClass; }catch(_){}
      try{
        if(previous.launcher === undefined) delete window.flprLauncher;
        else window.flprLauncher = previous.launcher;
      }catch(_){}
      try{
        if(previous.stored == null) localStorage.removeItem(key);
        else localStorage.setItem(key, previous.stored);
      }catch(_){}
      try{
        if(previous.suppressed == null) localStorage.removeItem(suppressKey);
        else localStorage.setItem(suppressKey, previous.suppressed);
      }catch(_){}
    }
  });
  if(
    patchNotesStreamProbe.shown !== true ||
    !patchNotesStreamProbe.visible ||
    !/Stream Edition/i.test(patchNotesStreamProbe.sub || "") ||
    !/Stream Edition::/.test(patchNotesStreamProbe.stored || "") ||
    !patchNotesStreamProbe.hiddenAfterDismiss
  ){
    throw new Error(`Stream Edition patch notes did not use a separate once-per-version key: ${JSON.stringify(patchNotesStreamProbe)}`);
  }

  const scoreAutoRedeemProbe = await page.evaluate(async () => {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const worldKey = (typeof getFirstPlayableWorldKey === "function" ? getFirstPlayableWorldKey() : "w1") || "w1";
    const tableKey = `${worldKey}|0`;
    const tableName = String(state?.worlds?.[worldKey]?.tables?.[0] || "Score Test Table");
    const ids = [910001, 910002, 910003];
    const nodes = [
      { id:ids[0], full:`${tableName} - Easy Score (1,000+)`, short:"Easy Score (1,000+)", genericDifficulty:"easy" },
      { id:ids[1], full:`${tableName} - Medium Score (2,000+)`, short:"Medium Score (2,000+)", genericDifficulty:"medium" },
      { id:ids[2], full:`${tableName} - Hard Score (3,000+)`, short:"Hard Score (3,000+)", genericDifficulty:"hard" }
    ];
    const previous = {
      connected: !!ap?.connected,
      apSend: typeof apSend === "function" ? apSend : null,
      balls: {
        b1: state?.balls?.[`${tableKey}|1`],
        b2: state?.balls?.[`${tableKey}|2`],
        b3: state?.balls?.[`${tableKey}|3`]
      },
      checked: ids.map((id)=>[id, !!ap?.checked?.has?.(id)]),
      pending: ids.map((id)=>[id, ap?.pendingByLoc?.get?.(id)]),
      highScores: (()=>{ try{ return JSON.stringify(state?.tableHighScores || {}); }catch(_){ return "{}"; } })(),
      profileRuntime: window.__flprStandaloneProfileRuntime ? {
        selectedMode: window.__flprStandaloneProfileRuntime.selectedMode || "",
        randomizerReady: !!window.__flprStandaloneProfileRuntime.randomizerReady,
        randomizerStarted: !!window.__flprStandaloneProfileRuntime.randomizerStarted,
        randomizerReason: window.__flprStandaloneProfileRuntime.randomizerReason || "",
        readyDoorKey: window.__flprStandaloneProfileRuntime.readyDoorKey || ""
      } : null
    };
    const packets = [];
    const parent = document.createElement("div");
    parent.style.cssText = "position:absolute;left:-10000px;top:-10000px;width:1000px;height:700px;";
    try{
      document.body.appendChild(parent);
      state.balls = state.balls || {};
      state.balls[`${tableKey}|1`] = true;
      delete state.balls[`${tableKey}|2`];
      delete state.balls[`${tableKey}|3`];
      ap.connected = true;
      ap.pendingByLoc = ap.pendingByLoc || new Map();
      ids.forEach((id)=>{
        ap.checked.delete(id);
        ap.pendingByLoc.delete(id);
      });
      apSend = (packet) => {
        packets.push(packet);
        return true;
      };
      if(typeof renderTableBlock !== "function") return { missingRender:true };
      renderTableBlock(parent, tableName, nodes, { tableKey });
      const modBtn = parent.querySelector(".checksScoreModBtn");
      const form = parent.querySelector(".checksScorePanel");
      const input = parent.querySelector(".checksScoreInput");
      if(!form || !input) return { missingScorePanel:true, html:parent.innerHTML.slice(0, 300) };
      input.value = "3,250";
      form.dispatchEvent(new Event("submit", { bubbles:true, cancelable:true }));
      await delay(1900);
      const locationPackets = packets.filter((pkt)=>String(pkt?.cmd || "") === "LocationChecks");
      const sentIds = locationPackets.flatMap((pkt)=>Array.isArray(pkt?.locations) ? pkt.locations : []);
      return {
        missingRender:false,
        missingScorePanel:false,
        modText: modBtn?.textContent || "",
        sentIds,
        pendingIds: ids.filter((id)=>ap.pendingByLoc.has(id)),
        highScore: typeof getTableHighScoreValue === "function" ? getTableHighScoreValue(tableKey, tableName) : 0
      };
    }finally{
      try{ parent.remove(); }catch(_){}
      try{
        ap.connected = previous.connected;
        if(previous.apSend) apSend = previous.apSend;
        state.balls = state.balls || {};
        if(previous.balls.b1 === undefined) delete state.balls[`${tableKey}|1`]; else state.balls[`${tableKey}|1`] = previous.balls.b1;
        if(previous.balls.b2 === undefined) delete state.balls[`${tableKey}|2`]; else state.balls[`${tableKey}|2`] = previous.balls.b2;
        if(previous.balls.b3 === undefined) delete state.balls[`${tableKey}|3`]; else state.balls[`${tableKey}|3`] = previous.balls.b3;
        previous.checked.forEach(([id, wasChecked])=> wasChecked ? ap.checked.add(id) : ap.checked.delete(id));
        previous.pending.forEach(([id, pending])=> pending ? ap.pendingByLoc.set(id, pending) : ap.pendingByLoc.delete(id));
        ap.pendingQueue = Array.isArray(ap.pendingQueue) ? ap.pendingQueue.filter((entry)=>!ids.includes(Number(entry?.id))) : [];
        state.tableHighScores = JSON.parse(previous.highScores || "{}");
        if(previous.profileRuntime && window.__flprStandaloneProfileRuntime){
          window.__flprStandaloneProfileRuntime.selectedMode = previous.profileRuntime.selectedMode || "";
          window.__flprStandaloneProfileRuntime.randomizerReady = !!previous.profileRuntime.randomizerReady;
          window.__flprStandaloneProfileRuntime.randomizerStarted = !!previous.profileRuntime.randomizerStarted;
          window.__flprStandaloneProfileRuntime.randomizerReason = previous.profileRuntime.randomizerReason || "";
          window.__flprStandaloneProfileRuntime.readyDoorKey = previous.profileRuntime.readyDoorKey || "";
          try{ if(typeof standaloneRefreshProfileUi === "function") standaloneRefreshProfileUi(); }catch(_){}
        }
      }catch(_){}
    }
  });
  if(
    scoreAutoRedeemProbe.missingRender ||
    scoreAutoRedeemProbe.missingScorePanel ||
    scoreAutoRedeemProbe.modText !== "1X" ||
    ![910001, 910002, 910003].every((id)=>scoreAutoRedeemProbe.sentIds.includes(id)) ||
    scoreAutoRedeemProbe.highScore !== 3250
  ){
    throw new Error(`Score entry did not auto-redeem beaten score thresholds: ${JSON.stringify(scoreAutoRedeemProbe)}`);
  }

  const profileGateInitialProbe = await page.evaluate(`(() => ({
    needsProfile: document.body.classList.contains('flprStandaloneNeedsProfile'),
    gateVisible: !!document.querySelector('#standaloneProfileGate:not([hidden])'),
    startDisabled: !!document.querySelector('#randomizerIntroStartBtn')?.disabled,
    sign: document.querySelector('#randomizerIntroSign')?.textContent || ''
  }))()`);
  if(!profileGateInitialProbe.needsProfile || !profileGateInitialProbe.gateVisible || !profileGateInitialProbe.startDisabled){
    throw new Error(`Home profile gate was not blocking a fresh Home Edition launch: ${JSON.stringify(profileGateInitialProbe)}`);
  }
  const profileGateVisualProbe = await page.evaluate(`(() => {
    const card = document.querySelector('.standaloneProfileCard');
    const preview = document.querySelector('#standaloneProfilePreview');
    const nameInput = document.querySelector('#standaloneProfileNameInput');
    const emojiChoices = document.querySelectorAll('.standaloneEmojiChoice');
    const cardRect = card?.getBoundingClientRect?.();
    const nameRect = nameInput?.getBoundingClientRect?.();
    return {
      hasPreview: !!preview,
      emojiCount: emojiChoices.length,
      nameMaxLength: Number(nameInput?.getAttribute('maxlength') || 0),
      cardWidth: cardRect ? Math.round(cardRect.width) : 0,
      cardHeight: cardRect ? Math.round(cardRect.height) : 0,
      nameWidth: nameRect ? Math.round(nameRect.width) : 0,
      nameHeight: nameRect ? Math.round(nameRect.height) : 0
    };
  })()`);
  if(!profileGateVisualProbe.hasPreview || profileGateVisualProbe.emojiCount < 80 || profileGateVisualProbe.nameMaxLength < 40 || profileGateVisualProbe.cardWidth < 1160 || profileGateVisualProbe.cardHeight < 680 || profileGateVisualProbe.nameWidth < 360 || profileGateVisualProbe.nameHeight < 58){
    throw new Error(`Home profile gate was not enlarged/snazzed up enough: ${JSON.stringify(profileGateVisualProbe)}`);
  }
  await page.locator("#standaloneProfileNameInput").fill("Playwright Home");
  await page.locator("#standaloneEmojiPickerButton").click();
  await page.locator(".standaloneEmojiChoice").filter({ hasText: String.fromCodePoint(0x1F3AF) }).first().click();
  await page.locator("#standaloneProfileColorInput").evaluate((input) => { input.value = "#00ffd5"; input.dispatchEvent(new Event("input", { bubbles: true })); });
  await page.locator("#standaloneProfileCreateBtn").click();
  await waitFor(page, `
    return !!(
      !document.body.classList.contains('flprStandaloneNeedsProfile') &&
      document.body.classList.contains('flprStandaloneModePicking') &&
      document.querySelector('#standaloneProfileGate[hidden]') &&
      document.querySelector('#standaloneModeGate:not([hidden])') &&
      /Playwright Home/.test(document.querySelector('#standaloneProfileHud')?.innerText || '') &&
      /FLPRP/.test(document.querySelector('#standaloneProfileHud')?.innerText || '')
    );
  `, 8000);

  const modeGateInitialProbe = await page.evaluate(`(() => {
    const gate = document.querySelector('#standaloneModeGate:not([hidden])');
    const choices = Array.from(document.querySelectorAll('#standaloneModeGate [data-standalone-mode-choice]')).map((btn) => ({
      mode: btn.getAttribute('data-standalone-mode-choice') || '',
      text: btn.innerText || '',
      titleFont: parseFloat(getComputedStyle(btn.querySelector('.standaloneModeChoiceTitle')).fontSize || '0'),
      textFont: parseFloat(getComputedStyle(btn.querySelector('.standaloneModeChoiceText')).fontSize || '0'),
      textFamily: getComputedStyle(btn.querySelector('.standaloneModeChoiceText')).fontFamily || ''
    }));
    return {
      visible: !!gate,
      choices,
      removedOldSubcopy: !/pick how this profile is playing today/i.test(gate?.innerText || ''),
      controlsDimmed: document.body.classList.contains('flprStandaloneModePicking')
    };
  })()`);
  if(
    !modeGateInitialProbe.visible ||
    !modeGateInitialProbe.removedOldSubcopy ||
    !modeGateInitialProbe.controlsDimmed ||
    !modeGateInitialProbe.choices.some((choice) => choice.mode === "singleplayer" && /local home edition seed/i.test(choice.text)) ||
    !modeGateInitialProbe.choices.some((choice) => choice.mode === "archipelago" && /archipelago multiworld/i.test(choice.text)) ||
    !modeGateInitialProbe.choices.every((choice) => choice.titleFont >= 24 && choice.textFont >= 15 && /pixel|press|start/i.test(choice.textFamily))
  ){
    throw new Error(`Home Edition mode choice gate did not render correctly: ${JSON.stringify(modeGateInitialProbe)}`);
  }
  await page.locator("#standaloneModeGate [data-standalone-mode-choice='singleplayer']").hover();
  await page.locator("#standaloneModeGate [data-standalone-mode-choice='archipelago']").click();
  await waitFor(page, `
    return !!(
      document.querySelector('#standaloneModeGate[hidden]') &&
      !document.body.classList.contains('flprStandaloneModePicking') &&
      document.querySelector('.controlsTabBtn.active')?.dataset?.ctrlTab === 'multiplayer' &&
      document.querySelector('.controlsTabPanel.active')?.dataset?.ctrlPanel === 'multiplayer' &&
      /CONNECT/.test(Array.from(document.querySelectorAll('.controlsTabBtn')).map((btn)=>btn.innerText || '').join('|')) &&
      /VISUALS \\/ MUSIC/.test(Array.from(document.querySelectorAll('.controlsTabBtn')).map((btn)=>btn.innerText || '').join('|')) &&
      /ACHIEVEMENTS/.test(Array.from(document.querySelectorAll('.controlsTabBtn')).map((btn)=>btn.innerText || '').join('|'))
    );
  `, 8000);

  await page.locator("#standaloneProfileHudBtn").click();
  await delay(1300);
  const profileMenuStickyProbe = await page.evaluate(`(() => {
    const menu = document.querySelector('#standaloneProfileMenu');
    return {
      visible: !!menu && !menu.hidden && getComputedStyle(menu).display !== 'none',
      text: menu?.innerText || ''
    };
  })()`);
  if(!profileMenuStickyProbe.visible || !/CHANGE NAME/i.test(profileMenuStickyProbe.text)){
    throw new Error(`Home profile menu did not stay open across refresh: ${JSON.stringify(profileMenuStickyProbe)}`);
  }
  await page.locator("[data-profile-menu-action='edit']").click();
  await delay(1300);
  const profileEditStickyProbe = await page.evaluate(`(() => {
    const gate = document.querySelector('#standaloneProfileGate');
    return {
      visible: !!gate && !gate.hidden && getComputedStyle(gate).display !== 'none',
      title: document.querySelector('#standaloneProfileTitle')?.innerText || '',
      nameValue: document.querySelector('#standaloneProfileNameInput')?.value || ''
    };
  })()`);
  if(!profileEditStickyProbe.visible || !/Edit Home Profile/i.test(profileEditStickyProbe.title)){
    throw new Error(`Home profile edit dialog did not stay open across refresh: ${JSON.stringify(profileEditStickyProbe)}`);
  }
  await page.locator("#standaloneProfileNameInput").fill("Playwright Edited");
  await page.locator("#standaloneProfileCreateBtn").click();
  await waitFor(page, `
    return !!(
      document.querySelector('#standaloneProfileGate[hidden]') &&
      /Playwright Edited/.test(document.querySelector('#standaloneProfileHud')?.innerText || '')
    );
  `, 8000);

  const noHangmanProbe = await page.evaluate(`(() => {
    const visible = (node) => {
      if(!node) return false;
      const style = getComputedStyle(node);
      return style.display !== "none" && style.visibility !== "hidden" && node.hidden !== true;
    };
    const buttons = Array.from(document.querySelectorAll('#hintTestHangmanBtn, #testHangmanBtn, [data-testtag="Hangman"]'));
    const metaText = Array.from(document.querySelectorAll('.hintMeta')).map((node) => node.textContent || '').join("\\n");
    let canStart = null;
    try{
      canStart = typeof hintCanStartHangman === "function"
        ? hintCanStartHangman({ target:{ tableName:"Corvette" }, text:"Probe" }, { forceHangman:true })
        : null;
    }catch(err){
      canStart = String(err?.message || err);
    }
    return {
      flag: window.FLPR_STANDALONE_CHAT_HANGMAN_DISABLED,
      canStart,
      visibleButtons: buttons.filter(visible).map((node) => node.id || node.getAttribute("data-testtag") || node.textContent || ""),
      metaHasHangman: /hangman/i.test(metaText),
      revealHasHangman: !!document.querySelector('#hintRevealBox.hangman, .hintHangmanCard')
    };
  })()`);
  if(noHangmanProbe.flag !== true || noHangmanProbe.canStart !== false || noHangmanProbe.visibleButtons.length || noHangmanProbe.metaHasHangman || noHangmanProbe.revealHasHangman){
    throw new Error(`Home Edition still exposes Chat Stream Hangman: ${JSON.stringify(noHangmanProbe)}`);
  }

  const noEpisodeProbe = await page.evaluate(`(() => {
    const toastCalls = [];
    const originalToast = window.toast;
    try{
      window.toast = function(type, title, message){
        toastCalls.push({ type:String(type || ""), title:String(title || ""), message:String(message || "") });
        return null;
      };
      let startResult = null;
      let endResult = null;
      let markResult = null;
      let gateResult = null;
      let canTrack = null;
      try{ startResult = typeof episodeStartOrResume === "function" ? episodeStartOrResume() : "missing"; }catch(err){ startResult = String(err?.message || err); }
      try{ endResult = typeof episodeEndEarly === "function" ? episodeEndEarly() : "missing"; }catch(err){ endResult = String(err?.message || err); }
      try{ markResult = typeof episodeMarkBossComplete === "function" ? episodeMarkBossComplete() : "missing"; }catch(err){ markResult = String(err?.message || err); }
      try{ gateResult = typeof episodeNeedsManualStartGate === "function" ? episodeNeedsManualStartGate() : "missing"; }catch(err){ gateResult = String(err?.message || err); }
      try{ canTrack = typeof episodeCanTrack === "function" ? episodeCanTrack() : "missing"; }catch(err){ canTrack = String(err?.message || err); }
      try{ if(typeof updateEpisodeControlsUi === "function") updateEpisodeControlsUi(); }catch(_){}
      const profileRaw = localStorage.getItem("flpr_standalone_home_profiles_v1") || "";
      return {
        disabled: window.__flprStandaloneEpisodeDisabled,
        canTrack,
        startResult,
        endResult,
        markResult,
        gateResult,
        storage: localStorage.getItem("flpr_episode_v1"),
        toastCalls,
        uiCount: document.querySelectorAll("#episodeSectionTitle, #episodeCtlRow, #episodeStateTxt").length,
        sectionText: Array.from(document.querySelectorAll(".connectPanelSection")).map((node)=>node.innerText || "").join("\\n"),
        markers: {
          start: window.episodeStartOrResume?.__flprStandaloneNoEpisode || "",
          canTrack: window.episodeCanTrack?.__flprStandaloneNoEpisode || "",
          gate: window.episodeNeedsManualStartGate?.__flprStandaloneNoEpisode || "",
          ui: window.updateEpisodeControlsUi?.__flprStandaloneNoEpisode || ""
        },
        profileHasEpisodeState: /episodeState/i.test(profileRaw)
      };
    }finally{
      try{ window.toast = originalToast; }catch(_){}
    }
  })()`);
  if(
    noEpisodeProbe.disabled !== true ||
    noEpisodeProbe.canTrack !== true ||
    noEpisodeProbe.startResult !== false ||
    noEpisodeProbe.endResult !== false ||
    noEpisodeProbe.markResult !== false ||
    noEpisodeProbe.gateResult !== false ||
    noEpisodeProbe.storage !== null ||
    noEpisodeProbe.toastCalls.length ||
    noEpisodeProbe.uiCount !== 0 ||
    /episode\s+tracking/i.test(noEpisodeProbe.sectionText || "") ||
    Object.values(noEpisodeProbe.markers || {}).some((marker) => !marker) ||
    noEpisodeProbe.profileHasEpisodeState
  ){
    throw new Error(`Home Edition still exposes Episode flow: ${JSON.stringify(noEpisodeProbe)}`);
  }

  const achievementDismissProbe = await page.evaluate(`(() => {
    try {
      achQueueToast({ title:"Dismiss Test", desc:"Profile toast dismiss test.", unlockedAt:Date.now(), points:0 });
    } catch (_) {}
    return {
      hasBridge: !!document.body.classList.contains('flprStandaloneOriginalClient')
    };
  })()`);
  if(!achievementDismissProbe.hasBridge){
    throw new Error(`Standalone achievement dismiss bridge could not run: ${JSON.stringify(achievementDismissProbe)}`);
  }
  await waitFor(page, `return !!document.querySelector('.achievementToast .achievementToastClose');`, 5000);
  await page.locator(".achievementToast .achievementToastClose").click();
  await waitFor(page, `return !document.querySelector('.achievementToast');`, 5000);

  const receivedIndexCollisionProbe = await page.evaluate(`(() => {
    const index = 991100;
    const locA = 991101;
    const locB = 991102;
    try {
      addReceivedToList("Easy Junk Item", "Collision Test - Lane 1", "Collision Test - Lane 1", index, 0, locA, "Easy Junk Item", { sourcePlayerId:1, sourcePlayerName:"AshodinNoTrap", sourceGame:"Manual_FlippermizerBaseGame_Ashodin" });
      addReceivedToList("Easy Junk Item", "Collision Test - Lane 2", "Collision Test - Lane 2", index, 0, locB, "Easy Junk Item", { sourcePlayerId:1, sourcePlayerName:"AshodinNoTrap", sourceGame:"Manual_FlippermizerBaseGame_Ashodin" });
      const rows = (ap.receivedAll || []).filter((row) => Number(row?.locId) === locA || Number(row?.locId) === locB);
      return {
        bridge: !!(typeof addReceivedToList === "function" && addReceivedToList.__flprStandaloneReceivedAddBridge),
        rows: rows.map((row) => ({ locId: Number(row?.locId || 0), recvIndex: row?.recvIndex ?? null, itemName: row?.itemName || "", locationName: row?.locationName || "" }))
      };
    } finally {
      try {
        const list = (ap.receivedAll || []).filter((row) => Number(row?.locId) !== locA && Number(row?.locId) !== locB);
        ap.receivedAll = list;
        ap.receivedKeySet = new Set(list.map((row) => row?.recvIndex != null ? ("idx:" + row.recvIndex) : ((row?.itemName || "") + "|" + (row?.locationName || ""))));
        saveReceivedList(list);
        renderReceivedList(list);
      } catch (_) {}
    }
  })()`);
  if(!receivedIndexCollisionProbe.bridge || receivedIndexCollisionProbe.rows.length !== 2){
    throw new Error(`Standalone received list collapsed distinct rows with the same AP index: ${JSON.stringify(receivedIndexCollisionProbe)}`);
  }

  const progressiveAnimationDedupe = await page.evaluate(`(() => {
    const originalFlow = runProgressiveBallFlow;
    const locId = 987654;
    let calls = 0;
    let snapshotRows = 0;
    try {
      ap.itemNameById = ap.itemNameById || new Map();
      ap.itemNameById.set(1008, "Progressive Ball - Corvette");
      const world = state.worlds?.w1 || (state.worlds.w1 = { label:"World 1", locked:false, tables:[] });
      if(!Array.isArray(world.tables)) world.tables = [];
      let corvetteIndex = world.tables.findIndex((name) => String(name || "").toLowerCase() === "corvette");
      if(corvetteIndex < 0){
        world.tables.push("Corvette");
        corvetteIndex = world.tables.length - 1;
      }
      world.locked = false;
      state.balls = state.balls || {};
      delete state.balls["w1|" + corvetteIndex + "|1"];
      delete state.balls["w1|" + corvetteIndex + "|2"];
      delete state.balls["w1|" + corvetteIndex + "|3"];
      saveState();
      window.runProgressiveBallFlow = function() {
        calls += 1;
        return 0;
      };
      runProgressiveBallFlow = window.runProgressiveBallFlow;
      processReceivedItem({ item:1008, location:locId, player:2, flags:1 }, 8801, locId, { noPopup:false, noFeed:true, isSnapshot:false });
      processReceivedItem({ item:1008, location:locId, player:2, flags:1 }, 8802, locId, { noPopup:false, noFeed:true, isSnapshot:false });
      ap.receivedAll = (ap.receivedAll || []).filter((row) => Number(row?.locId) !== locId);
      ap.receivedKeySet = new Set((ap.receivedAll || []).map((row) => row?.recvIndex != null ? ("idx:" + row.recvIndex) : ((row?.itemName || "") + "|" + (row?.locationName || ""))));
      saveReceivedList(ap.receivedAll);
      processReceivedItem({ item:1008, location:locId, player:2, flags:1 }, 8801, locId, { noPopup:true, noFeed:true, isSnapshot:true });
      snapshotRows = (ap.receivedAll || []).filter((row) => Number(row?.locId) === locId).length;
    } finally {
      window.runProgressiveBallFlow = originalFlow;
      runProgressiveBallFlow = originalFlow;
      try {
        const list = (typeof loadReceivedList === "function" ? loadReceivedList() : (ap.receivedAll || [])).filter((row) => Number(row?.locId) !== locId);
        ap.receivedAll = list;
        ap.receivedKeySet = new Set(list.map((row) => row?.recvIndex != null ? ("idx:" + row.recvIndex) : ((row?.itemName || "") + "|" + (row?.locationName || ""))));
        saveReceivedList(list);
        renderReceivedList(list);
      } catch (_) {}
      try {
        const key = typeof getTableKeyForName === "function" ? getTableKeyForName("Corvette") : "";
        if(key){
          delete state.balls[key + "|1"];
          delete state.balls[key + "|2"];
          delete state.balls[key + "|3"];
          saveState();
        }
      } catch (_) {}
    }
    return {
      calls,
      snapshotRows,
      suppressed: Number(window.__flprStandaloneProgressiveDuplicateSuppressed || 0)
    };
  })()`);
  if(progressiveAnimationDedupe.calls !== 1 || progressiveAnimationDedupe.suppressed < 1 || progressiveAnimationDedupe.snapshotRows !== 1){
    throw new Error(`Duplicate Progressive Ball receipt was not animation-deduped: ${JSON.stringify(progressiveAnimationDedupe)}`);
  }

  await page.evaluate(({ game, hardScoreLocation, rupeeScoreLocation, bonusRoundLocation }) => {
    const staleSent = [
      {
        key: "sent|1|2|4004|3011|1",
        ts: Date.now() - 300000,
        time: "17:24:04",
        itemId: 4004,
        locId: 3011,
        senderId: 1,
        receiverId: 2,
        itemName: "Progressive Ball - Skateball",
        locationName: hardScoreLocation,
        receiverPlayer: "ALTTPP3",
        receiverGame: "",
        senderPlayer: "AshodinNoTrap",
        senderGame: game,
        flags: 1
      },
      {
        key: "sent|1|2|4005|3012|0",
        ts: Date.now() - 240000,
        time: "17:25:04",
        itemId: 4005,
        locId: 3012,
        senderId: 1,
        receiverId: 2,
        itemName: "Progressive Ball - Cyclone",
        locationName: rupeeScoreLocation,
        receiverPlayer: "ALTTPP3",
        receiverGame: "",
        senderPlayer: "AshodinNoTrap",
        senderGame: game,
        flags: 0
      },
      {
        key: "sent|1|2|4002|3010|2",
        ts: Date.now() - 180000,
        time: "17:26:04",
        itemId: 4002,
        locId: 3010,
        senderId: 1,
        receiverId: 2,
        itemName: "Progressive Ball - Cyclone",
        locationName: bonusRoundLocation,
        receiverPlayer: "ALTTPP3",
        receiverGame: "",
        senderPlayer: "AshodinNoTrap",
        senderGame: game,
        flags: 2
      }
    ];
    localStorage.setItem("flpr_standalone_ap_sent_items_v1", JSON.stringify(staleSent));
    localStorage.setItem("flpr_ap_received_v1", JSON.stringify([
      {
        time: "17:24:04",
        ts: Date.now() - 300000,
        itemName: "Progressive Ball - Skateball",
        baseItemName: "Progressive Ball - Skateball",
        locationName: hardScoreLocation,
        checkName: hardScoreLocation,
        sourcePlayerId: 1,
        sourcePlayerName: "AshodinNoTrap",
        sourceGame: game,
        recvIndex: 92,
        locId: 3011,
        flags: 1,
        bossPct: null
      },
      {
        time: "17:26:04",
        ts: Date.now() - 180000,
        itemName: "Progressive Ball - Police Force",
        baseItemName: "Progressive Ball - Police Force",
        locationName: bonusRoundLocation,
        checkName: bonusRoundLocation,
        sourcePlayerId: 1,
        sourcePlayerName: "AshodinNoTrap",
        sourceGame: game,
        recvIndex: 93,
        locId: 3010,
        flags: 1,
        bossPct: null
      }
    ]));
    try {
      state.extraBallTokens = 9;
      state.extraBallAssignments = {};
      const world = state.worlds?.w1 || (state.worlds.w1 = { label: "World 1", locked: false, tables: [] });
      if(!Array.isArray(world.tables)) world.tables = [];
      let corvetteIndex = world.tables.findIndex((name) => String(name || "").toLowerCase() === "corvette");
      if(corvetteIndex < 0){
        world.tables.push("Corvette");
        corvetteIndex = world.tables.length - 1;
      }
      world.locked = false;
      state.balls = state.balls || {};
      delete state.balls[`w1|${corvetteIndex}|1`];
      delete state.balls[`w1|${corvetteIndex}|2`];
      delete state.balls[`w1|${corvetteIndex}|3`];
      saveState();
    } catch (_) {}
    if (typeof window.flprStandaloneRepairPersistedApState === "function") {
      window.flprStandaloneRepairPersistedApState();
    }
  }, {
    game: GAME,
    hardScoreLocation: HARD_SCORE_LOCATION,
    rupeeScoreLocation: RUPEE_SCORE_LOCATION,
    bonusRoundLocation: BONUS_ROUND_LOCATION
  });
  await waitFor(page, `
    return !!(
      document.body.classList.contains('flprStandaloneOriginalClient') &&
      document.querySelector('.flprStandaloneSingleplayerLayout #standaloneStartSeedBtn') &&
      document.querySelector('.flprStandaloneConnectLayout #apConnectBtn') &&
      window.flprStandaloneTextClientSend &&
      window.flprStandaloneTaskTooltipForTest
    );
  `, 30000);

  const connectionModeDefaultProbe = await page.evaluate(`
    (() => {
      const activeTab = document.querySelector('.controlsTabBtn.active')?.dataset?.ctrlTab || '';
      const activePanel = document.querySelector('.controlsTabPanel.active')?.dataset?.ctrlPanel || '';
      const apButton = document.querySelector('.flprStandaloneConnectLayout #apConnectBtn');
      const startButton = document.querySelector('.flprStandaloneSingleplayerLayout #standaloneStartSeedBtn');
      const apVisible = !!apButton && getComputedStyle(apButton.closest('.controlsTabPanel')).display !== 'none';
      const singleVisible = !!startButton && getComputedStyle(startButton.closest('.controlsTabPanel')).display !== 'none';
      return {
        activeTab,
        activePanel,
        apVisible,
        singleVisible,
        tabText: Array.from(document.querySelectorAll('.controlsTabBtn')).map((btn) => btn.innerText || ''),
        hasInnerModeTabs: !!document.querySelector('.flprStandaloneConnectLayout .standaloneConnectionModeTab')
      };
    })()
  `);
  if(
    connectionModeDefaultProbe.activeTab !== "multiplayer" ||
    connectionModeDefaultProbe.activePanel !== "multiplayer" ||
    !connectionModeDefaultProbe.apVisible ||
    connectionModeDefaultProbe.singleVisible ||
    !connectionModeDefaultProbe.tabText.some((text) => String(text || "").includes("CONNECT")) ||
    !connectionModeDefaultProbe.tabText.some((text) => String(text || "").includes("VISUALS / MUSIC")) ||
    !connectionModeDefaultProbe.tabText.some((text) => String(text || "").includes("ACHIEVEMENTS")) ||
    connectionModeDefaultProbe.tabText.some((text) => /SINGLEPLAYER|MULTIPLAYER/.test(String(text || ""))) ||
    connectionModeDefaultProbe.hasInnerModeTabs
  ){
    throw new Error(`Standalone Menu tabs did not default to Multiplayer with AP controls isolated: ${JSON.stringify(connectionModeDefaultProbe)}`);
  }
  const modeToggleProbe = await page.evaluate(`
    (() => {
      const hud = document.querySelector('#standaloneModeHud');
      const switchHud = document.querySelector('#standaloneModeSwitchHud');
      const logo = document.querySelector('#standaloneModeHud .standaloneModeHudLogo');
      const buttons = Array.from(document.querySelectorAll('#standaloneModeSwitchHud [data-standalone-mode-toggle]'));
      const logoButtons = Array.from(document.querySelectorAll('#standaloneModeHud [data-standalone-mode-toggle]'));
      const controls = document.querySelector('.controls') || document.querySelector('.controlsBody');
      const rect = hud?.getBoundingClientRect?.();
      const switchRect = switchHud?.getBoundingClientRect?.();
      const logoRect = logo?.getBoundingClientRect?.();
      const controlsRect = controls?.getBoundingClientRect?.();
      const profileRect = document.querySelector('#standaloneProfileHud')?.getBoundingClientRect?.();
      const pointsRect = document.querySelector('#standaloneProfileHud .standaloneProfilePoints')?.getBoundingClientRect?.();
      const visualsRect = document.querySelector('.controlsTabBtn[data-ctrl-tab="visuals"]')?.getBoundingClientRect?.();
      return {
        exists: !!hud,
        switchExists: !!switchHud,
        hidden: !!hud?.hidden,
        switchHidden: !!switchHud?.hidden,
        logoSrc: logo?.getAttribute('src') || '',
        logoAlt: logo?.getAttribute('alt') || '',
        logoSize: logoRect ? Math.round(Math.min(logoRect.width, logoRect.height)) : 0,
        logoWidth: logoRect ? Math.round(logoRect.width) : 0,
        logoHeight: logoRect ? Math.round(logoRect.height) : 0,
        text: buttons.map((btn) => btn.innerText || ''),
        logoButtonCount: logoButtons.length,
        active: buttons.find((btn) => btn.classList.contains('active'))?.dataset?.standaloneModeToggle || '',
        left: rect ? Math.round(rect.left) : null,
        right: rect ? Math.round(rect.right) : null,
        switchCenter: switchRect ? Math.round((switchRect.left + switchRect.right) / 2) : null,
        switchRight: switchRect ? Math.round(switchRect.right) : null,
        profileLeft: profileRect ? Math.round(profileRect.left) : null,
        windowCenter: Math.round(window.innerWidth / 2),
        visualsCenter: visualsRect ? Math.round((visualsRect.left + visualsRect.right) / 2) : null,
        sameRowAsPoints: !!(switchRect && pointsRect && Math.abs(((switchRect.top + switchRect.bottom) / 2) - ((pointsRect.top + pointsRect.bottom) / 2)) < 28),
        separatedFromProfile: !!(switchRect && profileRect && switchRect.right <= profileRect.left - 8),
        controlsLeft: controlsRect ? Math.round(controlsRect.left) : null,
        controlsRight: controlsRect ? Math.round(controlsRect.right) : null,
        overhangsMenu: !!(rect && controlsRect && rect.top < controlsRect.top && rect.bottom > controlsRect.top + 8),
        leftAligned: !!(rect && controlsRect && Math.abs(rect.left - controlsRect.left) < 42)
      };
    })()
  `);
  if(!modeToggleProbe.exists || !modeToggleProbe.switchExists || modeToggleProbe.hidden || modeToggleProbe.switchHidden || !/FlippermizerLogo\.png/i.test(modeToggleProbe.logoSrc) || !/Flippermizer/i.test(modeToggleProbe.logoAlt) || modeToggleProbe.logoWidth < 520 || modeToggleProbe.logoHeight < 110 || modeToggleProbe.logoButtonCount !== 0 || !modeToggleProbe.text.includes("SP") || !modeToggleProbe.text.includes("MP") || !modeToggleProbe.text.includes("HOUSE") || modeToggleProbe.active !== "archipelago" || !modeToggleProbe.overhangsMenu || !modeToggleProbe.leftAligned || !modeToggleProbe.separatedFromProfile || !modeToggleProbe.sameRowAsPoints){
    throw new Error(`Standalone logo and shifted SP/MP/HOUSE mode toggle were not positioned correctly above Menu: ${JSON.stringify(modeToggleProbe)}`);
  }
  const autoSwapDefaultProbe = await page.evaluate(`(() => ({
    inputValue: document.getElementById("swapSeconds")?.value || "",
    saved: JSON.parse(localStorage.getItem("flpr_settings_v1") || "{}")
  }))()`);
  if(Number(autoSwapDefaultProbe.inputValue) !== 60 || Number(autoSwapDefaultProbe.saved?.swapSeconds) !== 60){
    throw new Error(`Home Edition auto-swap default was not migrated to 60 seconds: ${JSON.stringify(autoSwapDefaultProbe)}`);
  }
  await page.evaluate(`(() => {
    window.flprStandaloneSetHomeMode && window.flprStandaloneSetHomeMode("singleplayer");
    window.flprStandaloneSetControlTab && window.flprStandaloneSetControlTab("singleplayer");
  })()`);
  const singleplayerModeProbe = await page.evaluate(`
    (() => {
      const activeTab = document.querySelector('.controlsTabBtn.active')?.dataset?.ctrlTab || '';
      const activePanel = document.querySelector('.controlsTabPanel.active')?.dataset?.ctrlPanel || '';
      const apButton = document.querySelector('.flprStandaloneConnectLayout #apConnectBtn');
      const startButton = document.querySelector('.flprStandaloneSingleplayerLayout #standaloneStartSeedBtn');
      return {
        activeTab,
        activePanel,
        apVisible: !!apButton && getComputedStyle(apButton.closest('.controlsTabPanel')).display !== 'none',
        singleVisible: !!startButton && getComputedStyle(startButton.closest('.controlsTabPanel')).display !== 'none',
        modePicking: document.body.classList.contains('flprStandaloneModePicking'),
        tabText: Array.from(document.querySelectorAll('.controlsTabBtn')).map((btn) => btn.innerText || '')
      };
    })()
  `);
  if(singleplayerModeProbe.activeTab !== "singleplayer" || singleplayerModeProbe.activePanel !== "singleplayer" || singleplayerModeProbe.apVisible || !singleplayerModeProbe.singleVisible || singleplayerModeProbe.modePicking || !singleplayerModeProbe.tabText.some((text) => String(text || "").includes("RUN")) || !singleplayerModeProbe.tabText.some((text) => String(text || "").includes("VISUALS / MUSIC")) || !singleplayerModeProbe.tabText.some((text) => String(text || "").includes("ACHIEVEMENTS"))){
    throw new Error(`Standalone Singleplayer tab did not isolate local seed controls: ${JSON.stringify(singleplayerModeProbe)}`);
  }
  const quietSingleplayerProbe = await page.evaluate(`
    (() => {
      ap.inherentSeedActive = true;
      return {
        filler: window.flprStandaloneShouldQuietSingleplayerReceivedItem && window.flprStandaloneShouldQuietSingleplayerReceivedItem("Easy Junk Item", { flags:0 }, {}),
        fragment: window.flprStandaloneShouldQuietSingleplayerReceivedItem && window.flprStandaloneShouldQuietSingleplayerReceivedItem("Pinball Fragment", { flags:0 }, {}),
        progressive: window.flprStandaloneShouldQuietSingleplayerReceivedItem && window.flprStandaloneShouldQuietSingleplayerReceivedItem("Progressive Ball - Corvette", { flags:1 }, {}),
        bossKey: window.flprStandaloneShouldQuietSingleplayerReceivedItem && window.flprStandaloneShouldQuietSingleplayerReceivedItem("Boss Key", { flags:1 }, {})
      };
    })()
  `);
  if(!quietSingleplayerProbe.filler || !quietSingleplayerProbe.fragment || quietSingleplayerProbe.progressive || quietSingleplayerProbe.bossKey){
    throw new Error(`Standalone Singleplayer received-item notification quieting is wrong: ${JSON.stringify(quietSingleplayerProbe)}`);
  }
  await page.locator(".flprStandaloneSingleplayerLayout #standaloneStartSeedBtn").click();
  const seedSaveProbe = await waitFor(page, `
    const state = JSON.parse(localStorage.getItem('flpr_standalone_home_profiles_v1') || '{}');
    const profile = (state.profiles || []).find((p) => p && p.id === state.activeProfileId);
    const saves = profile && Array.isArray(profile.seedSaves) ? profile.seedSaves : [];
    const first = saves[0] || null;
    const row = document.querySelector('#standaloneSeedSaveList .standaloneSeedSaveRow');
    if(first && row && document.body.classList.contains('flprStandaloneRandomizerReady')){
      return {
        seedName: first.seedName || '',
        seedWord: first.seedWord || '',
        checked: first.checked,
        total: first.total,
        pct: first.pct,
        rowText: row.innerText || '',
        startDisabled: !!document.querySelector('#randomizerIntroStartBtn')?.disabled
      };
    }
    return false;
  `, 12000);
  if(!seedSaveProbe.seedName || !seedSaveProbe.seedWord || !(Number(seedSaveProbe.total) > 0) || seedSaveProbe.startDisabled){
    throw new Error(`Standalone Singleplayer seed save was not recorded or did not open the randomizer gate: ${JSON.stringify(seedSaveProbe)}`);
  }
  const bossIncomingDoorGateProbe = await page.evaluate(async () => {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const runtime = window.__flprStandaloneProfileRuntime || {};
    const wrap = document.getElementById("randomizerIntro");
    const fx = window.__openingRandomizerFx || {};
    const previous = {
      ready: !!runtime.randomizerReady,
      started: !!runtime.randomizerStarted,
      reason: runtime.randomizerReason || "",
      wrapClass: wrap ? wrap.className : "",
      wrapHidden: wrap ? wrap.getAttribute("aria-hidden") : null,
      fxActive: !!fx.active,
      fxOpening: !!fx.opening,
      threatDelay: Number(window.__bossThreatDelayUntil || 0),
      apBossKeyCount: window.__apBossKeyCount,
      prevApBossKeyCount: window.__prevApBossKeyCount,
      bossKeys: Array.isArray(window.bossKeysState || bossKeysState)
        ? (window.bossKeysState || bossKeysState).map((key) => key ? { ...key } : key)
        : null
    };
    try{
      if(typeof stopBossIncomingAlert === "function") stopBossIncomingAlert();
      const bossRequired = typeof getBossKeysRequiredForOpen === "function" ? Number(getBossKeysRequiredForOpen()) || 3 : 3;
      window.__apBossKeyCount = bossRequired;
      window.__prevApBossKeyCount = bossRequired;
      try{
        const keys = window.bossKeysState || bossKeysState;
        if(Array.isArray(keys)){
          keys.forEach((key, keyIndex) => {
            if(key) key.acquired = keyIndex < bossRequired;
          });
        }
        if(typeof bossKeysSyncLegacyMirror === "function") bossKeysSyncLegacyMirror(bossRequired);
      }catch(_){}
      const clearedSeenKey = typeof window.flprStandaloneClearBossIncomingSeenForTest === "function"
        ? window.flprStandaloneClearBossIncomingSeenForTest()
        : "";
      runtime.randomizerReady = true;
      runtime.randomizerStarted = false;
      runtime.randomizerReason = ap?.inherentSeedActive ? "singleplayer" : (ap?.connected ? "archipelago" : "test");
      if(wrap){
        wrap.classList.add("show");
        wrap.classList.remove("opening", "closing");
        wrap.setAttribute("aria-hidden", "false");
      }
      if(window.__openingRandomizerFx){
        window.__openingRandomizerFx.active = true;
        window.__openingRandomizerFx.opening = false;
        window.__openingRandomizerFx.closing = false;
      }
      const beforeThreat = Number(window.__bossThreatDelayUntil || 0);
      if(typeof startBossIncomingAlert === "function") startBossIncomingAlert(1900);
      await delay(80);
      const queued = typeof window.flprStandaloneBossIncomingGateState === "function"
        ? window.flprStandaloneBossIncomingGateState()
        : null;
      const threatAfterQueue = Number(window.__bossThreatDelayUntil || 0);
      runtime.randomizerStarted = true;
      if(wrap){
        wrap.classList.remove("show", "opening", "closing");
        wrap.setAttribute("aria-hidden", "true");
      }
      if(window.__openingRandomizerFx){
        window.__openingRandomizerFx.active = false;
        window.__openingRandomizerFx.opening = false;
        window.__openingRandomizerFx.closing = false;
      }
      const flushed = typeof window.flprStandaloneFlushBossIncomingGateForTest === "function"
        ? window.flprStandaloneFlushBossIncomingGateForTest("test-door-open")
        : false;
      await delay(80);
      const after = typeof window.flprStandaloneBossIncomingGateState === "function"
        ? window.flprStandaloneBossIncomingGateState()
        : null;
      const threatAfterFlush = Number(window.__bossThreatDelayUntil || 0);
      const seenAfterFlush = typeof window.flprStandaloneBossIncomingGateState === "function"
        ? window.flprStandaloneBossIncomingGateState()
        : null;
      try{ if(typeof stopBossIncomingAlert === "function") stopBossIncomingAlert(); }catch(_){}
      window.__bossThreatDelayUntil = 0;
      const beforeRepeatThreat = Number(window.__bossThreatDelayUntil || 0);
      const repeatResult = typeof startBossIncomingAlert === "function"
        ? startBossIncomingAlert(1900)
        : null;
      await delay(80);
      const repeatState = typeof window.flprStandaloneBossIncomingGateState === "function"
        ? window.flprStandaloneBossIncomingGateState()
        : null;
      const threatAfterRepeat = Number(window.__bossThreatDelayUntil || 0);
      return {
        queued,
        after,
        flushed,
        clearedSeenKey,
        seenAfterFlush,
        repeatResult,
        repeatState,
        beforeThreat,
        threatAfterQueue,
        threatAfterFlush,
        beforeRepeatThreat,
        threatAfterRepeat
      };
    }finally{
      try{ if(typeof stopBossIncomingAlert === "function") stopBossIncomingAlert(); }catch(_){}
      try{ if(typeof window.flprStandaloneClearBossIncomingSeenForTest === "function") window.flprStandaloneClearBossIncomingSeenForTest(); }catch(_){}
      runtime.randomizerReady = previous.ready;
      runtime.randomizerStarted = previous.started;
      runtime.randomizerReason = previous.reason;
      if(wrap){
        wrap.className = previous.wrapClass;
        if(previous.wrapHidden == null) wrap.removeAttribute("aria-hidden");
        else wrap.setAttribute("aria-hidden", previous.wrapHidden);
      }
      if(window.__openingRandomizerFx){
        window.__openingRandomizerFx.active = previous.fxActive;
        window.__openingRandomizerFx.opening = previous.fxOpening;
      }
      window.__bossThreatDelayUntil = previous.threatDelay;
      window.__apBossKeyCount = previous.apBossKeyCount;
      window.__prevApBossKeyCount = previous.prevApBossKeyCount;
      try{
        const keys = window.bossKeysState || bossKeysState;
        if(Array.isArray(keys) && Array.isArray(previous.bossKeys)){
          keys.forEach((key, keyIndex) => {
            if(key && previous.bossKeys[keyIndex]) Object.assign(key, previous.bossKeys[keyIndex]);
          });
        }
      }catch(_){}
      try{ if(typeof standaloneRefreshProfileUi === "function") standaloneRefreshProfileUi(); }catch(_){}
    }
  });
  if(
    !bossIncomingDoorGateProbe.queued?.pending ||
    bossIncomingDoorGateProbe.queued?.doorOpen ||
    bossIncomingDoorGateProbe.threatAfterQueue !== bossIncomingDoorGateProbe.beforeThreat ||
    !bossIncomingDoorGateProbe.flushed ||
    bossIncomingDoorGateProbe.after?.pending ||
    !bossIncomingDoorGateProbe.after?.doorOpen ||
    !(bossIncomingDoorGateProbe.threatAfterFlush > bossIncomingDoorGateProbe.beforeThreat) ||
    !bossIncomingDoorGateProbe.seenAfterFlush?.seen ||
    bossIncomingDoorGateProbe.repeatResult !== false ||
    !bossIncomingDoorGateProbe.repeatState?.suppressedSeen ||
    bossIncomingDoorGateProbe.threatAfterRepeat !== bossIncomingDoorGateProbe.beforeRepeatThreat
  ){
    throw new Error(`Boss table incoming alert was not gated behind the randomizer door: ${JSON.stringify(bossIncomingDoorGateProbe)}`);
  }
  await page.locator("#standaloneSeedSaveList .standaloneSeedSaveRow").first().click();
  const savePromptProbe = await page.evaluate(`
    (() => {
      const row = document.querySelector('#standaloneSeedSaveList .standaloneSeedSaveRow');
      const prompt = row?.querySelector('.standaloneSeedLoadPrompt');
      const loadBtn = row?.querySelector('[data-seed-load-id]');
      const list = document.querySelector('#standaloneSeedSaveList');
      const hud = document.querySelector('#standaloneProfileHud');
      const controls = document.querySelector('.controls');
      const stage = document.querySelector('.stage');
      const rowStyle = row ? getComputedStyle(row) : null;
      const listStyle = list ? getComputedStyle(list) : null;
      const hudStyle = hud ? getComputedStyle(hud) : null;
      const controlsStyle = controls ? getComputedStyle(controls) : null;
      const controlsRect = controls ? controls.getBoundingClientRect() : null;
      const stageRect = stage ? stage.getBoundingClientRect() : null;
      const capture = document.querySelector('.capture');
      const viewport = document.querySelector('.viewport');
      const bossDock = document.querySelector('#bossDock');
      const captureRect = capture ? capture.getBoundingClientRect() : null;
      const viewportRect = viewport ? viewport.getBoundingClientRect() : null;
      const bossRect = bossDock ? bossDock.getBoundingClientRect() : null;
      const captureH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--captureH')) || 0;
      return {
        pending: !!row?.classList.contains('pendingLoad'),
        promptDisplay: prompt ? getComputedStyle(prompt).display : '',
        loadText: loadBtn?.innerText || '',
        rowFont: rowStyle ? parseFloat(rowStyle.fontSize) : 0,
        rowMinHeight: rowStyle ? parseFloat(rowStyle.minHeight) : 0,
        listOverflow: listStyle?.overflowY || '',
        hudZ: hudStyle ? Number(hudStyle.zIndex) : 0,
        controlsZ: controlsStyle ? Number(controlsStyle.zIndex) : 0,
        controlsPaddingTop: controlsStyle ? parseFloat(controlsStyle.paddingTop) : 0,
        controlsMarginTop: controlsStyle ? parseFloat(controlsStyle.marginTop) : 0,
        controlsHeight: controlsRect ? controlsRect.height : 0,
        controlsBottomGap: (controlsRect && stageRect) ? Math.round(stageRect.bottom - controlsRect.bottom) : null,
        viewportHeight: viewportRect ? Math.round(viewportRect.height) : 0,
        captureBottomGap: (captureRect && bossRect) ? Math.round(captureRect.bottom - bossRect.bottom) : null,
        captureH,
        anchoredInStage: !!(controlsRect && stageRect && controlsRect.top >= stageRect.top - 1 && controlsRect.bottom <= stageRect.bottom + 1)
      };
    })()
  `);
  if(!savePromptProbe.pending || savePromptProbe.promptDisplay === "none" || !/LOAD\\?/i.test(savePromptProbe.loadText) || savePromptProbe.rowFont < 12 || savePromptProbe.rowMinHeight < 80 || !/auto|scroll/i.test(savePromptProbe.listOverflow) || !(savePromptProbe.hudZ > savePromptProbe.controlsZ) || savePromptProbe.controlsPaddingTop > 2 || savePromptProbe.controlsMarginTop < 70 || !savePromptProbe.anchoredInStage || !(savePromptProbe.controlsHeight >= savePromptProbe.captureH - 130) || !(savePromptProbe.controlsHeight <= savePromptProbe.captureH - 80) || !(savePromptProbe.controlsBottomGap <= 24) || !(savePromptProbe.viewportHeight >= 1120) || !(savePromptProbe.captureBottomGap <= 40)){
    throw new Error(`Standalone save files/profile HUD were not readable/loadable: ${JSON.stringify(savePromptProbe)}`);
  }
  const saveRestoreSetup = await page.evaluate(`
    (() => {
      const stateData = JSON.parse(localStorage.getItem('flpr_standalone_home_profiles_v1') || '{}');
      const profile = (stateData.profiles || []).find((p) => p && p.id === stateData.activeProfileId);
      const save = profile?.seedSaves?.[0] || {};
      const savedSnapshot = save?.stateSnapshot ? JSON.parse(JSON.stringify(save.stateSnapshot)) : null;
      const expected = save?.stateSnapshot?.selected || state.selected || '';
      const keys = Object.keys(state.worlds || {});
      const other = keys.find((key) => key !== expected) || expected;
      window.__flprExpectedSaveSelected = expected;
      if(other && other !== expected){
        state.selected = other;
        state.lastSelected = other;
        try { if(typeof saveState === "function") saveState(); } catch (_) {}
      }
      if(profile && profile.seedSaves && profile.seedSaves[0] && savedSnapshot){
        profile.seedSaves[0].stateSnapshot = savedSnapshot;
        profile.seedSaves[0].updatedAt = Date.now();
        localStorage.setItem('flpr_standalone_home_profiles_v1', JSON.stringify(stateData));
      }
      return { expected, other, changed: other !== expected };
    })()
  `);
  await page.evaluate(`(() => { window.__flprSeedLoadClickBefore = Date.now(); })()`);
  await page.locator("#standaloneSeedSaveList [data-seed-load-id]").first().click();
  const saveLoadProbe = await waitFor(page, `
    const expected = window.__flprExpectedSaveSelected || "";
    const marker = window.__flprStandaloneLastSeedLoad || null;
    if(marker && Number(marker.ts || 0) >= Number(window.__flprSeedLoadClickBefore || 0) && document.body.classList.contains('flprStandaloneRandomizerReady')){
      const h = document.getElementById('apConnectedHost')?.textContent || "";
      return {
        expected,
        selected: state.selected,
        marker,
        inherent: !!ap.inherentSeedActive,
        connected: !!ap.connected,
        host: h,
        saveCount: (JSON.parse(localStorage.getItem('flpr_standalone_home_profiles_v1') || '{}').profiles || [])
          .find((p) => p && p.id === JSON.parse(localStorage.getItem('flpr_standalone_home_profiles_v1') || '{}').activeProfileId)?.seedSaves?.length || 0
      };
    }
    return false;
  `, 12000);
  if(!saveLoadProbe.inherent || !saveLoadProbe.connected || !/SINGLEPLAYER/i.test(saveLoadProbe.host) || (saveLoadProbe.expected && saveLoadProbe.selected !== saveLoadProbe.expected)){
    throw new Error(`Standalone save file did not restore as a local seed: ${JSON.stringify({ saveRestoreSetup, saveLoadProbe })}`);
  }
  const nextAchievementProbe = await page.evaluate(`
    (() => {
      const btn = document.getElementById('standaloneNextAchievementBtn');
      return {
        disabled: !!btn?.disabled,
        text: btn?.innerText || '',
        id: btn?.dataset?.achievementId || '',
        runSeed: document.getElementById('standaloneRunSeedSummary')?.innerText || '',
        runChecks: document.getElementById('standaloneRunCheckSummary')?.innerText || ''
      };
    })()
  `);
  if(nextAchievementProbe.disabled || !nextAchievementProbe.id || !/NEXT CLOSEST ACHIEVEMENT/i.test(nextAchievementProbe.text) || !nextAchievementProbe.runSeed || !/\d+\s*\/\s*\d+/.test(nextAchievementProbe.runChecks)){
    throw new Error(`Standalone Local Run Tools did not expose the next closest achievement: ${JSON.stringify(nextAchievementProbe)}`);
  }
  await page.locator("#standaloneNextAchievementBtn").click();
  const achievementOpenProbe = await waitFor(page, `
    const panel = document.querySelector('.controlsTabPanel[data-ctrl-panel="achievements"]');
    const marker = window.__flprStandaloneLastAchievementOpen || null;
    if(marker){
      return {
        active: !!panel?.classList.contains('active'),
        display: panel ? getComputedStyle(panel).display : '',
        marker,
        hasFocused: !!panel?.querySelector('.standaloneAchFocusPulse'),
        text: panel ? panel.innerText.slice(0, 200) : ''
      };
    }
    return false;
  `, 8000);
  if(!achievementOpenProbe.active || achievementOpenProbe.display === "none" || !/ACHIEVEMENTS|TROPHIES/i.test(achievementOpenProbe.text)){
    throw new Error(`Standalone next achievement did not open the achievements panel: ${JSON.stringify(achievementOpenProbe)}`);
  }
  await page.evaluate(`(() => {
    window.flprStandaloneSetHomeMode && window.flprStandaloneSetHomeMode("singleplayer");
    window.flprStandaloneSetControlTab && window.flprStandaloneSetControlTab("singleplayer");
  })()`);
  await page.evaluate(`(() => {
    try { if(typeof apDisconnect === "function") apDisconnect({ manual:false }); } catch (_) {}
    try { ap.inherentSeedActive = false; ap.connected = false; } catch (_) {}
    try { if(typeof updateApConnectButtons === "function") updateApConnectButtons("offline"); } catch (_) {}
    try {
      const world = state.worlds?.w1 || (state.worlds.w1 = { label:"World 1", locked:false, tables:[] });
      if(!Array.isArray(world.tables)) world.tables = [];
      let corvetteIndex = world.tables.findIndex((name) => String(name || "").toLowerCase() === "corvette");
      if(corvetteIndex < 0){
        world.tables.push("Corvette");
        corvetteIndex = world.tables.length - 1;
      }
      world.locked = false;
      state.balls = state.balls || {};
      delete state.balls["w1|" + corvetteIndex + "|1"];
      delete state.balls["w1|" + corvetteIndex + "|2"];
      delete state.balls["w1|" + corvetteIndex + "|3"];
      if(typeof saveState === "function") saveState();
    } catch (_) {}
    try {
      const intro = document.getElementById("randomizerIntro");
      if(intro) intro.classList.remove("show", "opening", "flprStandaloneClosed");
    } catch (_) {}
  })()`);
  await page.evaluate(`(() => {
    window.flprStandaloneSetHomeMode && window.flprStandaloneSetHomeMode("archipelago");
    window.flprStandaloneSetControlTab && window.flprStandaloneSetControlTab("multiplayer");
  })()`);

  const tooltipProbe = await page.evaluate(`
    (() => {
      const location = "Medieval Madness - Easy Task";
      const entry = {
        location,
        table: "Medieval Madness",
        target_table: "Medieval Madness",
        source_table: "Medieval Madness",
        source_location: "Medieval Madness - Beat 3 Trolls",
        difficulty: "easy",
        kind: "task",
        task_type: "task",
        objective: "Beat 3 Trolls",
        display_name: "Beat 3 Trolls",
        title: "Beat 3 Trolls",
        explanation: "Generic AP summary: complete this task exactly as written."
      };
      setGenericCheckPayload({
        generic_checks: { enabled:true, entries:[entry], by_location:{ [location]:entry } },
        task_shuffle: { enabled:true, entries:[entry], by_location:{ [location]:entry } }
      });
      const node = {
        id: 999123,
        full: location,
        short: "Easy Task",
        tableName: "Medieval Madness",
        table: "Medieval Madness"
      };
      applyGenericCheckEntryToNode(node);
      const marioGeneric = "Use castle, shell/key, numbered multiball, and bonus-round progress. These are table-specific Super Mario Bros. objectives.";
      const marioEntry = {
        location: "Super Mario Bros. - Easy Task",
        table: "Super Mario Bros.",
        target_table: "Super Mario Bros.",
        source_table: "Super Mario Bros.",
        source_location: "Light the Key",
        difficulty: "easy",
        kind: "task",
        task_type: "task",
        objective: "Light the Key",
        display_name: "Light the Key",
        title: "Light the Key",
        explanation: marioGeneric
      };
      const marioNode = {
        id: 999124,
        full: "Super Mario Bros. - Easy Task",
        short: "Light the Key",
        tableName: "Super Mario Bros.",
        table: "Super Mario Bros.",
        genericEntry: marioEntry,
        taskShuffleEntry: marioEntry
      };
      const hoverButton = document.createElement("button");
      hoverButton.type = "button";
      hoverButton.textContent = "Hover probe";
      document.body.appendChild(hoverButton);
      const hoverTip = window.flprStandaloneTaskTooltipForNodeForTest(marioNode);
      bindCheckTaskHover(hoverButton, hoverTip);
      hoverButton.focus();
      const card = document.getElementById("checkTaskHoverCard");
      const initialHoverHeader = card?.querySelector(".standaloneStrategyGuideHeader")?.innerText || "";
      const initialHoverBody = card?.querySelector(".standaloneStrategyGuideBody")?.innerText || "";
      const rollingTargetTip = window.flprStandaloneTaskTooltipForTest("Rolling Stones", "Complete one target bank", {
        table: "Rolling Stones",
        target_table: "Rolling Stones",
        source_table: "Rolling Stones",
        source_location: "Complete one target bank",
        objective: "Complete one target bank",
        display_name: "Complete one target bank",
        title: "Complete one target bank"
      });
      const marioScoreTip = window.flprStandaloneTaskTooltipForTest("Super Mario Bros.", "Hard Score (69,593,091+)", {
        table: "Super Mario Bros.",
        target_table: "Super Mario Bros.",
        source_table: "Super Mario Bros.",
        source_location: "Super Mario Bros. - Hard Score (69,593,091+)",
        objective: "Hard Score (69,593,091+)",
        display_name: "Hard Score (69,593,091+)",
        title: "Hard Score (69,593,091+)",
        explanation: "Build score to at least 69,593,091 before drain. Focus lit modes, jackpots, and bonus multipliers."
      });
      const rollingScoreTip = window.flprStandaloneTaskTooltipForTest("Rolling Stones", "Medium Score (104,843+)", {
        table: "Rolling Stones",
        target_table: "Rolling Stones",
        source_table: "Rolling Stones",
        source_location: "Rolling Stones - Medium Score (104,843+)",
        objective: "Medium Score (104,843+)",
        display_name: "Medium Score (104,843+)",
        title: "Medium Score (104,843+)",
        explanation: "Build score to at least 104,843 before drain. Focus lit modes, jackpots, and bonus multipliers."
      });
      const attackScoreMeta = window.FLPR_TASK_EXPLANATIONS?.resolveTaskExplanationMeta?.("Hard Score (1,794,034,514+)", {
        tableName: "Attack from Mars",
        table: "Attack from Mars",
        target_table: "Attack from Mars",
        full: "Attack from Mars - Hard Score (1,794,034,514+)",
        location: "Attack from Mars - Hard Score (1,794,034,514+)"
      }) || null;
      const partyDanceTip = window.flprStandaloneTaskTooltipForTest("Party Zone", "Start Dance Contest", {
        table: "Party Zone",
        target_table: "Party Zone",
        source_table: "Party Zone",
        source_location: "Start Dance Contest",
        objective: "Start Dance Contest",
        display_name: "Start Dance Contest",
        title: "Start Dance Contest",
        explanation: "Light the Dance Contest mode and shoot the start shot to begin it."
      });
      const partyWayOutTip = window.flprStandaloneTaskTooltipForTest("Party Zone", "Complete Way Out Of Control", {
        table: "Party Zone",
        target_table: "Party Zone",
        source_table: "Party Zone",
        source_location: "Complete Way Out Of Control",
        objective: "Complete Way Out Of Control",
        display_name: "Complete Way Out Of Control",
        title: "Complete Way Out Of Control",
        explanation: "Start Way Out Of Control and finish its required lit shots before the timer expires."
      });
      const partyMultiballTip = window.flprStandaloneTaskTooltipForTest("Party Zone", "Start multiball", {
        table: "Party Zone",
        target_table: "Party Zone",
        source_table: "Party Zone",
        source_location: "Start multiball",
        objective: "Start multiball",
        display_name: "Start multiball",
        title: "Start multiball",
        explanation: "Complete the table's lock or numbered qualifier, then shoot the lit multiball start shot once it is ready."
      });
      const stickyHover = (() => {
        try{
          const host = document.createElement("div");
          host.style.position = "fixed";
          host.style.left = "64px";
          host.style.top = "64px";
          host.style.zIndex = "2147483647";
          const first = document.createElement("button");
          first.type = "button";
          first.className = "nodeBtn taskNode";
          first.style.width = "180px";
          first.style.height = "64px";
          first.textContent = "Sticky hover probe";
          host.appendChild(first);
          document.body.appendChild(host);
          bindCheckTaskHover(first, rollingTargetTip);
          const moveEvent = typeof PointerEvent === "function"
            ? new PointerEvent("pointermove", { clientX: 84, clientY: 84, bubbles: true })
            : new MouseEvent("pointermove", { clientX: 84, clientY: 84, bubbles: true });
          document.dispatchEvent(moveEvent);
          first.focus();
          const replacement = first.cloneNode(true);
          bindCheckTaskHover(replacement, rollingTargetTip);
          host.replaceChild(replacement, first);
          const kept = !!window.flprStandaloneReanchorStrategyHoverForTest?.("test-repaint");
          const repaintCard = document.getElementById("checkTaskHoverCard");
          const visible = !!repaintCard?.classList?.contains("visible");
          const body = repaintCard?.querySelector(".standaloneStrategyGuideBody")?.innerText || repaintCard?.innerText || "";
          host.remove();
          try{ if(typeof hideCheckTaskHoverCard === "function") hideCheckTaskHoverCard(); }catch(_){}
          return {
            kept,
            visible,
            body,
            anchorStillOld: document.body.contains(first)
          };
        }catch(err){
          return { error: String(err?.message || err) };
        }
      })();
      return {
        short: node.short,
        tip: getTaskExplanationForNode(node),
        directTip: window.flprStandaloneTaskTooltipForTest("Medieval Madness", "Beat 3 Trolls", entry),
        marioTip: window.flprStandaloneTaskTooltipForTest("Super Mario Bros.", "Light the Key", marioEntry),
        marioBonusTip: window.flprStandaloneTaskTooltipForTest("Super Mario Bros.", "Complete one bonus round", {
          ...marioEntry,
          objective: "Complete one bonus round",
          display_name: "Complete one bonus round",
          title: "Complete one bonus round",
          source_location: "Complete one bonus round"
        }),
        qbertCodeTip: window.flprStandaloneTaskTooltipForTest("QbertsQuest", "Stop 1 villain", {
          table: "QbertsQuest",
          target_table: "QbertsQuest",
          source_table: "QbertsQuest",
          source_location: "Stop 1 villain",
          objective: "Stop 1 villain",
          display_name: "Stop 1 villain",
          title: "Stop 1 villain",
          explanation: "Use Qube, pyramid, villain, drop-bank, and figure-eight loop progress."
        }),
        qbertDisplayTip: window.flprStandaloneTaskTooltipForTest("Q*bert's Quest (Gottlieb 1983)", "Light extra ball from villain lamps", {
          table: "Q*bert's Quest (Gottlieb 1983)",
          target_table: "Q*bert's Quest (Gottlieb 1983)",
          source_table: "Q*bert's Quest (Gottlieb 1983)",
          source_location: "Light extra ball from villain lamps",
          objective: "Light extra ball from villain lamps",
          display_name: "Light extra ball from villain lamps",
          title: "Light extra ball from villain lamps",
          explanation: "Use Qube, pyramid, villain, drop-bank, and figure-eight loop progress."
        }),
        rollingCatalog: (() => {
          const entry = window.flprGetBundledTaskCatalog?.()?.byTable?.["rolling stones"];
          return entry?.tasksByDifficulty || {};
        })(),
        grandLizardCatalog: (() => {
          const entry = window.flprGetBundledTaskCatalog?.()?.byTable?.["grand lizard"];
          return entry?.tasksByDifficulty || {};
        })(),
        grandLizardPickedSets: (() => {
          const entry = window.flprGetBundledTaskCatalog?.()?.byTable?.["grand lizard"];
          const tasks = entry?.tasksByDifficulty || {};
          const pick = (list, tableIndex, offset) => {
            const pool = Array.isArray(list) ? list.map((value) => String(value || "").trim()).filter(Boolean) : [];
            if(!pool.length) return "";
            const idx = Math.abs((Math.max(0, Number(tableIndex) || 0) * 7) + Number(offset || 0)) % pool.length;
            return pool[idx] || "";
          };
          return Array.from({ length: 8 }, (_, tableIndex) => [
            pick(tasks.easy, tableIndex, 0),
            pick(tasks.medium, tableIndex, 2),
            pick(tasks.hard, tableIndex, 4)
          ]);
        })(),
        grandLizardMediumTip: window.flprStandaloneTaskTooltipForTest("Grand Lizard", "Shoot the Upper Playfield Twice", {
          table: "Grand Lizard",
          target_table: "Grand Lizard",
          source_table: "Grand Lizard",
          source_location: "Shoot the Upper Playfield Twice",
          objective: "Shoot the Upper Playfield Twice",
          display_name: "Shoot the Upper Playfield Twice",
          title: "Shoot the Upper Playfield Twice"
        }),
        grandLizardHardTip: window.flprStandaloneTaskTooltipForTest("Grand Lizard", "Collect a Multiball Jackpot", {
          table: "Grand Lizard",
          target_table: "Grand Lizard",
          source_table: "Grand Lizard",
          source_location: "Collect a Multiball Jackpot",
          objective: "Collect a Multiball Jackpot",
          display_name: "Collect a Multiball Jackpot",
          title: "Collect a Multiball Jackpot"
        }),
        rollingMediumTip: window.flprStandaloneTaskTooltipForTest("Rolling Stones", "Collect Bonus", {
          table: "Rolling Stones",
          target_table: "Rolling Stones",
          source_table: "Rolling Stones",
          source_location: "Collect Bonus",
          objective: "Collect Bonus",
          display_name: "Collect Bonus",
          title: "Collect Bonus"
        }),
        rollingHardTip: window.flprStandaloneTaskTooltipForTest("Rolling Stones", "Collect 20-40-60 Bonus", {
          table: "Rolling Stones",
          target_table: "Rolling Stones",
          source_table: "Rolling Stones",
          source_location: "Collect 20-40-60 Bonus",
          objective: "Collect 20-40-60 Bonus",
          display_name: "Collect 20-40-60 Bonus",
          title: "Collect 20-40-60 Bonus"
        }),
        rollingTargetTip,
        marioScoreTip,
        rollingScoreTip,
        attackScoreMeta,
        partyDanceTip,
        partyWayOutTip,
        partyMultiballTip,
        stickyHover,
        marioNodeTip: getTaskExplanationForNode(marioNode),
        hoverHeader: initialHoverHeader,
        hoverBody: initialHoverBody,
        genericExplanation: node.genericEntry?.explanation || "",
        shuffledExplanation: node.taskShuffleEntry?.explanation || "",
        preservedSource: node.taskShuffleEntry?.standalone_source_explanation || node.genericEntry?.standalone_source_explanation || ""
      };
    })()
  `);
  if(
    tooltipProbe.short !== "Beat 3 Trolls" ||
    !String(tooltipProbe.tip || "").startsWith("Strategy Guide") ||
    !String(tooltipProbe.tip || "").includes("Raise the trolls") ||
    String(tooltipProbe.tip || "").includes("Generic AP summary") ||
    !String(tooltipProbe.directTip || "").startsWith("Strategy Guide") ||
    !String(tooltipProbe.directTip || "").includes("Raise the trolls") ||
    !String(tooltipProbe.marioTip || "").startsWith("Strategy Guide") ||
    !String(tooltipProbe.marioTip || "").includes("Build shell/key progress") ||
    String(tooltipProbe.marioTip || "").includes("These are table-specific") ||
    !String(tooltipProbe.marioBonusTip || "").includes("Light and start a bonus round") ||
    String(tooltipProbe.marioBonusTip || "").includes("These are table-specific") ||
    !String(tooltipProbe.marioNodeTip || "").includes("Build shell/key progress") ||
    !String(tooltipProbe.qbertCodeTip || "").includes("figure-eight rollunder sequence") ||
    String(tooltipProbe.qbertCodeTip || "").includes("Use Qube, pyramid") ||
    !String(tooltipProbe.qbertDisplayTip || "").includes("villain lamps toward Extra Ball") ||
    String(tooltipProbe.qbertDisplayTip || "").includes("Use Qube, pyramid") ||
    !Array.isArray(tooltipProbe.rollingCatalog?.medium) ||
    tooltipProbe.rollingCatalog.medium.join("|") !== "Collect Bonus" ||
    !Array.isArray(tooltipProbe.rollingCatalog?.hard) ||
    tooltipProbe.rollingCatalog.hard.join("|") !== "Collect 20-40-60 Bonus" ||
    /multiball|jackpot/i.test([...(tooltipProbe.rollingCatalog?.medium || []), ...(tooltipProbe.rollingCatalog?.hard || [])].join("|")) ||
    !Array.isArray(tooltipProbe.grandLizardCatalog?.easy) ||
    tooltipProbe.grandLizardCatalog.easy.join("|") !== "Shoot to Access the Upper Playfield|Complete 1 Upper Playfield Lane Set" ||
    !Array.isArray(tooltipProbe.grandLizardCatalog?.medium) ||
    tooltipProbe.grandLizardCatalog.medium.join("|") !== "Shoot the Upper Playfield Twice|Start Multiball (Lock Balls)" ||
    !Array.isArray(tooltipProbe.grandLizardCatalog?.hard) ||
    tooltipProbe.grandLizardCatalog.hard.join("|") !== "Collect a Multiball Jackpot|Complete 2 Upper Playfield Objectives" ||
    !Array.isArray(tooltipProbe.grandLizardPickedSets) ||
    tooltipProbe.grandLizardPickedSets.some((set) => !Array.isArray(set) || set.length !== 3 || new Set(set).size !== 3 || set.some((value) => !value)) ||
    !String(tooltipProbe.grandLizardMediumTip || "").includes("Reach the upper playfield twice") ||
    !String(tooltipProbe.grandLizardHardTip || "").includes("Start Multiball from locked balls") ||
    !String(tooltipProbe.rollingMediumTip || "").includes("Remove the Collect Bonus target") ||
    !String(tooltipProbe.rollingHardTip || "").includes("Collect 1-5 targets") ||
    !String(tooltipProbe.rollingTargetTip || "").includes("upper-right drop target bank") ||
    !String(tooltipProbe.marioScoreTip || "").includes("Best scoring from the guide") ||
    !/castle|multiball/i.test(String(tooltipProbe.marioScoreTip || "")) ||
    String(tooltipProbe.marioScoreTip || "").length > 420 ||
    /Focus lit modes, jackpots, and bonus multipliers/i.test(String(tooltipProbe.marioScoreTip || "")) ||
    !String(tooltipProbe.rollingScoreTip || "").includes("Collect Bonus") ||
    String(tooltipProbe.rollingScoreTip || "").length > 300 ||
    /Rolling Stones[\s\S]*(Score routes|Best scoring)[\s\S]*(Encore Multiball|super jackpot target)/i.test(String(tooltipProbe.rollingScoreTip || "")) ||
    !String(tooltipProbe.attackScoreMeta?.text || "").includes("Best scoring from the guide") ||
    !/saucer|multiball|jackpot/i.test(String(tooltipProbe.attackScoreMeta?.text || "")) ||
    String(tooltipProbe.attackScoreMeta?.text || "").length > 380 ||
    !String(tooltipProbe.partyDanceTip || "").includes("B-O-P top rollover lanes") ||
    !String(tooltipProbe.partyDanceTip || "").includes("Back-2-Bop") ||
    String(tooltipProbe.partyDanceTip || "").includes("Light the Dance Contest mode") ||
    !String(tooltipProbe.partyWayOutTip || "").includes("W-O-O-C standup targets") ||
    !String(tooltipProbe.partyWayOutTip || "").includes("PayOff lane") ||
    String(tooltipProbe.partyWayOutTip || "").includes("finish its required lit shots") ||
    !String(tooltipProbe.partyMultiballTip || "").includes("Cosmic Cottage") ||
    !String(tooltipProbe.partyMultiballTip || "").includes("Party Animals") ||
    !/Comic[\s\S]*Surprise/i.test(String(tooltipProbe.partyMultiballTip || "")) ||
    String(tooltipProbe.partyMultiballTip || "").includes("numbered qualifier") ||
    !tooltipProbe.stickyHover?.kept ||
    !tooltipProbe.stickyHover?.visible ||
    !String(tooltipProbe.stickyHover?.body || "").toLowerCase().includes("upper-right drop target bank") ||
    tooltipProbe.stickyHover?.anchorStillOld ||
    String(tooltipProbe.hoverHeader || "").toLowerCase() !== "strategy guide" ||
    !String(tooltipProbe.hoverBody || "").toLowerCase().includes("build shell/key progress") ||
    tooltipProbe.genericExplanation ||
    tooltipProbe.shuffledExplanation ||
    !String(tooltipProbe.preservedSource || "").includes("Generic AP summary")
  ){
    throw new Error(`Standalone task tooltip did not prefer per-task guidance: ${JSON.stringify(tooltipProbe)}`);
  }

  await page.locator(".flprStandaloneConnectLayout #apServer").fill(`ws://127.0.0.1:${PORT}`);
  await page.locator(".flprStandaloneConnectLayout #apPlayer").fill("AshodinNoTrap");
  await page.locator(".flprStandaloneConnectLayout #apGame").fill(GAME);
  await page.locator(".flprStandaloneConnectLayout #apPass").fill("");
  await page.locator(".flprStandaloneConnectLayout .apLogTab[data-aplog-tab='status']").click();
  const archLayout = await page.evaluate(`
    (() => {
      const host = document.querySelector('.flprStandaloneConnectLayout #apConnectedHost')?.getBoundingClientRect();
      const connect = document.querySelector('.flprStandaloneConnectLayout #apConnectBtn')?.getBoundingClientRect();
      const disconnect = document.querySelector('.flprStandaloneConnectLayout #apDisconnectBtn')?.getBoundingClientRect();
      if(!host || !connect || !disconnect) return null;
      return {
        host: { x:host.x, y:host.y, width:host.width, height:host.height, bottom:host.bottom },
        connect: { x:connect.x, y:connect.y, width:connect.width, height:connect.height, bottom:connect.bottom, right:connect.right },
        disconnect: { x:disconnect.x, y:disconnect.y, width:disconnect.width, height:disconnect.height, bottom:disconnect.bottom, right:disconnect.right }
      };
    })()
  `);
  if(!archLayout || archLayout.connect.y < archLayout.host.bottom - 2 || Math.abs(archLayout.connect.y - archLayout.disconnect.y) > 3 || archLayout.disconnect.x <= archLayout.connect.x){
    throw new Error(`Archipelago buttons are not side-by-side under server info: ${JSON.stringify(archLayout)}`);
  }
  const textPaneStyle = await page.evaluate(`
    (() => {
      const log = document.querySelector('.flprStandaloneConnectLayout #apConnLogBody');
      const received = document.querySelector('.flprStandaloneConnectLayout #receivedBody');
      const logStyle = log ? getComputedStyle(log) : null;
      const recvStyle = received ? getComputedStyle(received) : null;
      return {
        logFont: logStyle ? parseFloat(logStyle.fontSize) : 0,
        receivedFont: recvStyle ? parseFloat(recvStyle.fontSize) : 0,
        logOverflowY: logStyle ? logStyle.overflowY : '',
        receivedOverflowY: recvStyle ? recvStyle.overflowY : '',
        logScrollbarWidth: logStyle ? logStyle.scrollbarWidth : '',
        receivedScrollbarWidth: recvStyle ? recvStyle.scrollbarWidth : ''
      };
    })()
  `);
  if(textPaneStyle.logFont < 15 || textPaneStyle.receivedFont < 15 || textPaneStyle.logOverflowY !== "scroll" || textPaneStyle.receivedOverflowY !== "scroll"){
    throw new Error(`Readable scroll pane styles not applied: ${JSON.stringify(textPaneStyle)}`);
  }
  await page.evaluate(`window.flprStandaloneSetControlTab("visuals")`);
  await waitFor(page, `
    return !!(
      document.querySelector('#standaloneRendererDock') &&
      document.querySelector('#standaloneHardwareAccelToggle') &&
      document.querySelector('#standaloneRendererBackend') &&
      window.flprStandaloneElectron
    );
  `, 10000);
  const rendererInitial = await page.evaluate(`
    (async () => {
      const options = Array.from(document.querySelectorAll('#standaloneRendererBackend option')).map((option) => option.value);
      const response = await window.flprStandaloneElectron.getRendererSettings();
      return {
        hasVulkan: options.includes('vulkan'),
        checked: !!document.querySelector('#standaloneHardwareAccelToggle')?.checked,
        response
      };
    })()
  `);
  if(!rendererInitial.hasVulkan || typeof rendererInitial.response?.settings?.hardwareAcceleration !== "boolean" || typeof rendererInitial.response?.applied?.hardwareAcceleration !== "boolean"){
    throw new Error(`Standalone renderer controls did not initialize correctly: ${JSON.stringify(rendererInitial)}`);
  }
  const logoAndMusicProbe = await page.evaluate(`
    (() => {
      const row = document.querySelector('[data-music-scenario="randomizer_open"], [data-music-preview="randomizer_open"], [data-music-clear="randomizer_open"], [data-music-mode="randomizer_open"], [data-music-volume="randomizer_open"]');
      const toggle = document.getElementById('standaloneLogoDevToggle');
      const panel = document.getElementById('standaloneLogoDevPanel');
      const beforeHidden = panel ? !!panel.hidden : null;
      if(toggle) toggle.click();
      const afterHidden = panel ? !!panel.hidden : null;
      const lock = document.getElementById('standaloneLogoLockToggle');
      try{
        if(typeof musicGetRefs === 'function') musicGetRefs().randomizer_open = 'sounds/randomizer-open.mp3';
      }catch(_){}
      let setResult = null;
      try{
        setResult = (typeof musicSetScenarioRef === 'function') ? musicSetScenarioRef('randomizer_open', 'sounds/test.mp3', { fileName:'test.mp3', sourcePath:'sounds/test.mp3' }) : null;
      }catch(err){
        setResult = 'error:' + err.message;
      }
      let playResult = null;
      let lockResult = null;
      try{ playResult = (typeof musicPlayScenario === 'function') ? musicPlayScenario('randomizer_open', { force:true, forceStopIfMissing:true }) : null; }catch(err){ playResult = 'error:' + err.message; }
      try{ lockResult = (typeof musicLockScenario === 'function') ? musicLockScenario('randomizer_open', 1000) : null; }catch(err){ lockResult = 'error:' + err.message; }
      const refAfterSet = (() => {
        try{ return typeof musicGetRawScenarioRef === 'function' ? musicGetRawScenarioRef('randomizer_open') : String(state?.musicRefs?.randomizer_open || ''); }catch(_){ return ''; }
      })();
      const metaAfterSet = (() => {
        try{ return typeof musicGetRawScenarioMeta === 'function' ? musicGetRawScenarioMeta('randomizer_open') : (state?.musicMeta?.randomizer_open || null); }catch(_){ return null; }
      })();
      const mgr = (() => {
        try{ return typeof musicEnsureManager === 'function' ? musicEnsureManager() : window.__flprMusic; }catch(_){ return null; }
      })();
      return {
        hasRandomizerOpenControls: !!row,
        hasDevToggle: !!toggle,
        beforeHidden,
        afterHidden,
        hasLockAfterOpen: !!lock,
        setResult,
        playResult,
        lockResult,
        refAfterSet,
        metaAfterSet,
        current: mgr?.current || ''
      };
    })()
  `);
  if(
    logoAndMusicProbe.hasRandomizerOpenControls ||
    !logoAndMusicProbe.hasDevToggle ||
    logoAndMusicProbe.beforeHidden !== true ||
    logoAndMusicProbe.afterHidden !== false ||
    !logoAndMusicProbe.hasLockAfterOpen ||
    logoAndMusicProbe.setResult !== false ||
    logoAndMusicProbe.playResult !== false ||
    logoAndMusicProbe.lockResult !== false ||
    logoAndMusicProbe.refAfterSet ||
    logoAndMusicProbe.metaAfterSet ||
    logoAndMusicProbe.current === "randomizer_open"
  ){
    throw new Error(`Standalone logo dev tools or randomizer-open music suppression failed: ${JSON.stringify(logoAndMusicProbe)}`);
  }
  const checksBgProbe = await page.evaluate(() => {
    const select = document.querySelector("#checksBgMode");
    const previous = select?.value || "classic";
    const previousSettings = JSON.parse(localStorage.getItem("flpr_settings_v1") || "{}") || {};
    let result = null;
    try {
      const options = Array.from(select?.options || []).map((option) => ({ value: option.value, label: option.textContent || "" }));
      if(!select) throw new Error("Checks background selector missing");
      select.value = "blueprint";
      select.dispatchEvent(new Event("change", { bubbles: true }));
      if(typeof rebuildStandaloneControls === "function") rebuildStandaloneControls();
      result = {
        options,
        selectedAfterChange: document.querySelector("#checksBgMode")?.value || "",
        storedAfterChange: JSON.parse(localStorage.getItem("flpr_settings_v1") || "{}")?.checksBgMode || "",
        hasBlueprintClass: document.body.classList.contains("checksBgBlueprint"),
        hasUnexpectedCircuitClass: document.body.classList.contains("checksBgCircuit"),
        note: document.querySelector("#checksBgNote")?.textContent || ""
      };
    } finally {
      try {
        localStorage.setItem("flpr_settings_v1", JSON.stringify({ ...previousSettings, checksBgMode: previous }));
        if(typeof applyChecksBgMode === "function") applyChecksBgMode(previous, { save:false });
        if(typeof rebuildStandaloneControls === "function") rebuildStandaloneControls();
      } catch (_) {}
    }
    return result;
  });
  if(
    !checksBgProbe?.options?.some((option) => option.value === "lattice") ||
    !checksBgProbe?.options?.some((option) => option.value === "blueprint") ||
    !checksBgProbe?.options?.some((option) => option.value === "stars") ||
    !checksBgProbe?.options?.some((option) => option.value === "radar") ||
    checksBgProbe.selectedAfterChange !== "blueprint" ||
    checksBgProbe.storedAfterChange !== "blueprint" ||
    !checksBgProbe.hasBlueprintClass ||
    checksBgProbe.hasUnexpectedCircuitClass ||
    !/persist/i.test(checksBgProbe.note)
  ){
    throw new Error(`Standalone Checks background choices did not persist/apply: ${JSON.stringify(checksBgProbe)}`);
  }
  const targetHardwareAcceleration = rendererInitial.response.applied.hardwareAcceleration === false;
  const initialRendererBackend = String(rendererInitial.response.applied.renderer || rendererInitial.response.settings.renderer || "default") === "vulkan" ? "vulkan" : "default";
  const rendererSaved = await page.evaluate(({ target, backend }) => {
    const input = document.querySelector("#standaloneHardwareAccelToggle");
    if(!input) throw new Error("Renderer hardware toggle missing");
    input.checked = target;
    input.dispatchEvent(new Event("change", { bubbles: true }));
    return window.flprStandaloneElectron
      .setRendererSettings({
        hardwareAcceleration: target,
        renderer: backend
      })
      .then(() => window.flprStandaloneElectron.getRendererSettings());
  }, { target: targetHardwareAcceleration, backend: initialRendererBackend });
  if(
    rendererSaved?.settings?.hardwareAcceleration !== targetHardwareAcceleration ||
    rendererSaved?.applied?.hardwareAcceleration === targetHardwareAcceleration ||
    rendererSaved?.restartRequired !== true
  ){
    throw new Error(`Standalone renderer settings did not persist pending hardware acceleration change: ${JSON.stringify(rendererSaved)}`);
  }
  await page.evaluate(`
    window.flprStandaloneElectron.setRendererSettings({
      hardwareAcceleration: ${rendererInitial.response.applied.hardwareAcceleration ? "true" : "false"},
      renderer: ${JSON.stringify(initialRendererBackend)}
    })
  `);
  await page.evaluate(`(() => {
    window.flprStandaloneSetHomeMode && window.flprStandaloneSetHomeMode("archipelago");
    window.flprStandaloneSetControlTab && window.flprStandaloneSetControlTab("multiplayer");
  })()`);
  const botSyncDisabled = await page.evaluate(`
    (() => {
      const names = [
        "flprBotSyncEnabled",
        "flprBotSyncBaseUrl",
        "flprBotSyncToken",
        "postFlprBotSync",
        "getFlprBotSync",
        "syncFlprBotTableFromNowPlaying",
        "getFlprBotNowPlayingCandidateForWorld",
        "syncFlprBotCurrentTableSnapshot",
        "syncFlprBotCurrentTable",
        "syncFlprBotBossKeys",
        "syncFlprBotBossStatus",
        "syncFlprBotEpisodeState",
        "ensureFlprBotUtilityControl"
      ];
      const markers = {};
      names.forEach((name) => {
        markers[name] = window[name]?.__flprStandaloneNoFlprBotSync || "";
      });
      const previous = {
        selected: String(state?.selected || ""),
        currentWorld: String(state?.currentWorld || ""),
        currentTable: String(state?.currentTable || "")
      };
      const candidate = Object.entries(state?.worlds || {}).find(([wk, world]) => {
        return wk !== "boss" && Array.isArray(world?.tables) && world.tables.length > 1;
      });
      const targetWorld = candidate ? candidate[0] : previous.selected;
      const targetIdx = candidate ? 1 : 0;
      state.nowPlaying = state.nowPlaying || {};
      const previousNowPlaying = targetWorld ? state.nowPlaying[targetWorld] : undefined;
      const beforeCalls = {
        selected: String(state?.selected || ""),
        currentWorld: String(state?.currentWorld || ""),
        currentTable: String(state?.currentTable || ""),
        nowPlaying: targetWorld ? Number(state.nowPlaying[targetWorld]) : null
      };
      const fetchCalls = [];
      const nativeFetch = window.fetch;
      try{
        window.fetch = function(){
          fetchCalls.push(String(arguments[0] || ""));
          return Promise.resolve({ ok:true, json:async()=>({}) });
        };
        if(targetWorld) state.nowPlaying[targetWorld] = 0;
        const results = {
          table: typeof syncFlprBotTableFromNowPlaying === "function" ? syncFlprBotTableFromNowPlaying(targetWorld, targetIdx, true) : "missing",
          candidate: typeof getFlprBotNowPlayingCandidateForWorld === "function" ? getFlprBotNowPlayingCandidateForWorld(targetWorld) : "missing",
          snapshot: typeof syncFlprBotCurrentTableSnapshot === "function" ? syncFlprBotCurrentTableSnapshot() : "missing",
          current: typeof syncFlprBotCurrentTable === "function" ? syncFlprBotCurrentTable(true) : "missing",
          bossKeys: typeof syncFlprBotBossKeys === "function" ? syncFlprBotBossKeys(true) : "missing",
          bossStatus: typeof syncFlprBotBossStatus === "function" ? syncFlprBotBossStatus(true) : "missing",
          episode: typeof syncFlprBotEpisodeState === "function" ? syncFlprBotEpisodeState(true) : "missing"
        };
        const afterCalls = {
          selected: String(state?.selected || ""),
          currentWorld: String(state?.currentWorld || ""),
          currentTable: String(state?.currentTable || ""),
          nowPlaying: targetWorld ? Number(state.nowPlaying[targetWorld]) : null
        };
        return {
          flag: window.FLPR_BOT_SYNC_ENABLED,
          bridgeFlag: window.__flprStandaloneFlprBotSyncDisabled,
          enabled: typeof flprBotSyncEnabled === 'function' ? flprBotSyncEnabled() : null,
          baseUrl: typeof flprBotSyncBaseUrl === 'function' ? flprBotSyncBaseUrl() : null,
          token: typeof flprBotSyncToken === 'function' ? flprBotSyncToken() : null,
          cfg: localStorage.getItem('flpr_bot_sync_cfg_v1') || '',
          utilityVisible: !!document.querySelector('#flprBotRunUtilityWrap'),
          markers,
          targetWorld,
          beforeCalls,
          afterCalls,
          results,
          fetchCalls
        };
      }finally{
        try{ window.fetch = nativeFetch; }catch(_){}
        try{
          state.selected = previous.selected;
          state.currentWorld = previous.currentWorld;
          state.currentTable = previous.currentTable;
          if(targetWorld){
            if(previousNowPlaying === undefined) delete state.nowPlaying[targetWorld];
            else state.nowPlaying[targetWorld] = previousNowPlaying;
          }
        }catch(_){}
      }
    })()
  `);
  if(
    botSyncDisabled.flag !== false ||
    botSyncDisabled.bridgeFlag !== true ||
    botSyncDisabled.enabled !== false ||
    botSyncDisabled.baseUrl ||
    botSyncDisabled.token ||
    botSyncDisabled.utilityVisible ||
    !botSyncDisabled.cfg.includes('"enabled":false') ||
    Object.values(botSyncDisabled.markers || {}).some((marker) => !marker) ||
    (botSyncDisabled.fetchCalls || []).length ||
    botSyncDisabled.results?.candidate !== null ||
    botSyncDisabled.results?.snapshot !== null ||
    botSyncDisabled.afterCalls?.selected !== botSyncDisabled.beforeCalls?.selected ||
    botSyncDisabled.afterCalls?.currentWorld !== botSyncDisabled.beforeCalls?.currentWorld ||
    botSyncDisabled.afterCalls?.currentTable !== botSyncDisabled.beforeCalls?.currentTable
  ){
    throw new Error(`FLPR-Bot sync is still enabled in standalone: ${JSON.stringify(botSyncDisabled)}`);
  }
  await page.locator(".flprStandaloneConnectLayout #apConnectBtn").click();
  const savedApCfgProbe = await page.evaluate(`(() => {
    const raw = localStorage.getItem('flpr_ap_cfg_v1') || '';
    let parsed = null;
    try{ parsed = JSON.parse(raw || '{}'); }catch(_){}
    return { raw, parsed };
  })()`);
  if(
    savedApCfgProbe.parsed?.server !== `ws://127.0.0.1:${PORT}` ||
    savedApCfgProbe.parsed?.player !== "AshodinNoTrap" ||
    savedApCfgProbe.parsed?.game !== GAME ||
    savedApCfgProbe.parsed?.pass !== ""
  ){
    throw new Error(`AP CFG was not saved as soon as the standalone client connected: ${JSON.stringify(savedApCfgProbe)}`);
  }

  try {
    await waitFor(page, `
      const log = document.querySelector('.flprStandaloneConnectLayout #apConnLogBody')?.innerText || '';
      const received = document.querySelector('.flprStandaloneConnectLayout #receivedBody')?.innerText || '';
      return log.includes('AP test server says hello') && log.includes('ALTTPP3 sent Progressive Ball - Dirty Harry') && received.includes('Arrows (10)');
    `, 20000);
  } catch (err) {
    const state = await page.evaluate(`
      (() => ({
        connectedHost: document.querySelector('.flprStandaloneConnectLayout #apConnectedHost')?.innerText || document.getElementById('apConnectedHost')?.innerText || '',
        activeTab: Array.from(document.querySelectorAll('.flprStandaloneConnectLayout #apLogTabs .apLogTab, #apLogTabs .apLogTab')).find((btn) => btn.classList.contains('active'))?.innerText || '',
        logText: Array.from(document.querySelectorAll('#apConnLogBody')).map((node, index) => '--- log ' + index + ' ---\\n' + (node.innerText || '')).join('\\n'),
        receivedHeader: document.querySelector('.flprStandaloneConnectLayout #receivedHdr')?.innerText || document.getElementById('receivedHdr')?.innerText || '',
        receivedText: document.querySelector('.flprStandaloneConnectLayout #receivedBody')?.innerText || document.getElementById('receivedBody')?.innerText || '',
        idCounts: {
          apServer: document.querySelectorAll('#apServer').length,
          apConnectBtn: document.querySelectorAll('#apConnectBtn').length,
          apConnLogBody: document.querySelectorAll('#apConnLogBody').length,
          receivedBody: document.querySelectorAll('#receivedBody').length,
          standaloneLayouts: document.querySelectorAll('.flprStandaloneConnectLayout').length
        },
        deferredCount: Array.isArray(ap?.receivedDeferred) ? ap.receivedDeferred.length : null,
        receivedCount: Array.isArray(ap?.receivedAll) ? ap.receivedAll.length : null,
        itemNames: ap?.itemNameById ? Array.from(ap.itemNameById.entries()).slice(0, 12) : [],
        apConnected: !!ap?.connected,
        wsState: ap?.ws ? { readyState: ap.ws.readyState, url: ap.ws.url || '' } : null,
        connectSeed: ap?.connectSeed || '',
        candidateIndex: ap?.connectCandidateIndex ?? null,
        candidates: Array.isArray(ap?.connectCandidates) ? ap.connectCandidates.map((p) => p.url + ' [' + p.label + ']') : []
      }))()
    `);
    console.log(JSON.stringify({ ok: false, phase: "post-connect", serverReceivedPackets: apServer.received, state }, null, 2));
    throw err;
  }

  const bossHintProbe = await waitFor(page, `
    const req = window.__flprStandaloneBossHintScoutRequest || null;
    const scout = window.__flprStandaloneBossHintScout || null;
    const pool = hintState?.pools || {};
    const ballBtn = document.querySelector('#hintBallLocationBtn');
    const ballPoolRow = document.querySelector('#hintPoolBall')?.closest('.hintPoolItem');
    if(req && scout && (pool.boss || []).some((entry) => String(entry?.locationName || '').includes('Boss Key Vault'))){
      return {
        requestLocations: req.locations || [],
        bossPool: (pool.boss || []).map((entry) => entry.locationName || ''),
        ballCounts: {
          b1: (pool.ball1 || []).length,
          b2: (pool.ball2 || []).length,
          b3: (pool.ball3 || []).length,
          prog: (pool.ballProgressive || []).length,
          candidates: typeof hintCandidatesForPool === 'function' ? hintCandidatesForPool('ball').length : -1
        },
        ballButtonHidden: !ballBtn || getComputedStyle(ballBtn).display === 'none',
        ballPoolHidden: !ballPoolRow || getComputedStyle(ballPoolRow).display === 'none'
      };
    }
    return false;
  `, 12000);
  if(
    !bossHintProbe.requestLocations.includes(3013) ||
    bossHintProbe.ballCounts.b1 !== 0 ||
    bossHintProbe.ballCounts.b2 !== 0 ||
    bossHintProbe.ballCounts.b3 !== 0 ||
    bossHintProbe.ballCounts.prog !== 0 ||
    bossHintProbe.ballCounts.candidates !== 0 ||
    !bossHintProbe.ballButtonHidden ||
    !bossHintProbe.ballPoolHidden
  ){
    throw new Error(`Standalone boss-key hint scout did not produce a boss-only pool: ${JSON.stringify(bossHintProbe)}`);
  }
  const locationScoutPackets = apServer.received.flatMap((text) => {
    try { return JSON.parse(text); } catch (_) { return []; }
  }).filter((pkt) => pkt && pkt.cmd === "LocationScouts");
  if(!locationScoutPackets.some((pkt) => Array.isArray(pkt.locations) && pkt.locations.map(Number).includes(3013) && Number(pkt.create_as_hint || 0) === 0)){
    throw new Error(`Standalone client did not request AP LocationScouts for boss-key hints: ${JSON.stringify(locationScoutPackets)}`);
  }

  const bossHintFireProbe = await page.evaluate(async () => {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    try{
      if(typeof showView === "function") showView("checks");
      else { activeView = "checks"; if(typeof setTabUI === "function") setTabUI(); }
    }catch(_){}
    const beforeHistory = Array.isArray(hintState?.history) ? hintState.history.length : 0;
    const beforeUsed = hintState?.used instanceof Set ? hintState.used.size : -1;
    let ok = false;
    try{
      ok = !!hintHandleReceivedHintItem("Hint: Boss Key");
    }catch(err){
      return { error: String(err?.message || err) };
    }
    await delay(220);
    const latest = Array.isArray(hintState?.history) ? hintState.history[hintState.history.length - 1] : null;
    return {
      ok,
      activeView: String(activeView || ""),
      beforeHistory,
      historyLength: Array.isArray(hintState?.history) ? hintState.history.length : -1,
      beforeUsed,
      usedSize: hintState?.used instanceof Set ? hintState.used.size : -1,
      pendingBoss: Number(hintState?.pending?.boss || 0),
      poolBossLeft: typeof hintRemainingCount === "function" ? hintRemainingCount("boss") : -1,
      latestType: String(latest?.type || ""),
      latestText: String(latest?.text || ""),
      latestTarget: latest?.target || null,
      revealText: document.getElementById("hintRevealText")?.innerText || "",
      revealMeta: document.getElementById("hintRevealMeta")?.innerText || ""
    };
  });
  if(
    bossHintFireProbe.error ||
    !bossHintFireProbe.ok ||
    bossHintFireProbe.activeView !== "hints" ||
    bossHintFireProbe.historyLength <= bossHintFireProbe.beforeHistory ||
    bossHintFireProbe.pendingBoss !== 0 ||
    bossHintFireProbe.poolBossLeft !== 0 ||
    !/Boss Key/i.test(bossHintFireProbe.latestType || "") ||
    !/Boss Key Vault/i.test(String(bossHintFireProbe.latestTarget?.locationShort || bossHintFireProbe.latestTarget?.locationFull || "")) ||
    !/Boss key clue online/i.test(bossHintFireProbe.latestText || "")
  ){
    throw new Error(`Standalone Boss Key hint did not fire and move to the Hints panel: ${JSON.stringify(bossHintFireProbe)}`);
  }

  const canonicalHintNameProbe = await page.evaluate(() => {
    const tables = [
      { tableName:"Fathom" },
      { tableName:"Corvette" },
      { tableName:"Vector Test Table" }
    ];
    const ballRecognizer = (() => {
      try{
        if(typeof isHintBallItemName === "function" && typeof isHintBallItemName.__flprStandaloneOriginalIsHintBallItemName === "function"){
          return isHintBallItemName.__flprStandaloneOriginalIsHintBallItemName;
        }
      }catch(_){}
      return (typeof isHintBallItemName === "function") ? isHintBallItemName : null;
    })();
    return {
      ballButtonText: document.getElementById("hintBallLocationBtn")?.textContent || "",
      bossButtonText: document.getElementById("hintBossKeyBtn")?.textContent || "",
      generatedBall: typeof inherentRewardFor === "function" ? inherentRewardFor(0, 1, "Fathom", tables) : "",
      generatedBoss: typeof inherentRewardFor === "function" ? inherentRewardFor(1, 2, "Corvette", tables) : "",
      canonicalBallRecognized: ballRecognizer ? ballRecognizer("Hint: Ball Location") : false,
      canonicalBossRecognized: typeof isHintBossKeyItemName === "function" ? isHintBossKeyItemName("Hint: Boss Key") : false,
      legacyBallRecognized: ballRecognizer ? ballRecognizer("Hint Ball Location") : false,
      legacyBossRecognized: typeof isHintBossKeyItemName === "function" ? isHintBossKeyItemName("Hint Boss Key") : false
    };
  });
  if(
    String(canonicalHintNameProbe.ballButtonText || "").trim() !== "HINT: BALL LOCATION" ||
    String(canonicalHintNameProbe.bossButtonText || "").trim() !== "HINT: BOSS KEY" ||
    canonicalHintNameProbe.generatedBall !== "Hint: Ball Location" ||
    canonicalHintNameProbe.generatedBoss !== "Hint: Boss Key" ||
    !canonicalHintNameProbe.canonicalBallRecognized ||
    !canonicalHintNameProbe.canonicalBossRecognized ||
    !canonicalHintNameProbe.legacyBallRecognized ||
    !canonicalHintNameProbe.legacyBossRecognized
  ){
    throw new Error(`Hint item names were not canonicalized with colon labels: ${JSON.stringify(canonicalHintNameProbe)}`);
  }

  const corvetteUnlockProbe = await waitFor(page, `
    const key = typeof getTableKeyForName === 'function' ? (getTableKeyForName('Corvette') || '') : '';
    const level = key ? (
      state?.balls?.[key + '|3'] ? 3 :
      state?.balls?.[key + '|2'] ? 2 :
      state?.balls?.[key + '|1'] ? 1 : 0
    ) : 0;
    const stored = JSON.stringify(typeof loadReceivedList === 'function' ? loadReceivedList() : (ap?.receivedAll || []));
    if(key && level >= 1 && stored.includes('Progressive Ball - Corvette')) return { key, level, storedHasCorvette:true };
    return false;
  `, 15000);
  if(!corvetteUnlockProbe || corvetteUnlockProbe.level < 1){
    throw new Error(`Incoming cross-game Progressive Ball did not unlock Corvette: ${JSON.stringify(corvetteUnlockProbe)}`);
  }

  const checksNodeRedeemSelectionProbe = await page.evaluate(async () => {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const targetKey = typeof getTableKeyForName === "function" ? (getTableKeyForName("Super Mario Bros.") || "") : "";
    const parts = String(targetKey || "").split("|");
    const targetWorld = String(parts[0] || "");
    const targetIdx = Number(parts[1]);
    if(!targetWorld || !Number.isFinite(targetIdx)) return { skipped:true, reason:"missing-super-mario-key", targetKey };
    const previous = {
      selected: String(state?.selected || ""),
      currentWorld: String(ap?.currentWorld || ""),
      nowPlaying: Number(state?.nowPlaying?.[targetWorld]),
      activeView: String(activeView || ""),
      checked3010: !!ap?.checked?.has?.(3010),
      pending3010: !!ap?.pendingByLoc?.has?.(3010)
    };
    try{
      state.balls = state.balls || {};
      state.nowPlaying = state.nowPlaying || {};
      state.worlds[targetWorld].locked = false;
      state.balls[`${targetKey}|1`] = true;
      const otherIdx = (Array.isArray(state.worlds[targetWorld].tables) ? state.worlds[targetWorld].tables : [])
        .findIndex((_, idx) => idx !== targetIdx);
      const otherKey = otherIdx >= 0 ? `${targetWorld}|${otherIdx}` : "";
      if(otherKey){
        state.balls[`${otherKey}|1`] = true;
        const otherName = state.worlds[targetWorld].tables[otherIdx] || "";
        const otherMapKey = typeof canonicalTableMapKey === "function" ? canonicalTableMapKey(otherName) : String(otherName || "");
        Array.from(ap?.locsByTableKey?.get?.(otherMapKey) || []).forEach((node) => {
          const id = Number(node?.id);
          if(Number.isFinite(id) && id > 0) ap.checked.add(id);
        });
      }
      try{ ap.checked.delete(3010); }catch(_){}
      try{ ap.pendingByLoc.delete(3010); }catch(_){}
      state.selected = targetWorld;
      ap.currentWorld = targetWorld;
      state.nowPlaying[targetWorld] = targetIdx;
      if(typeof showView === "function") showView("checks");
      else { activeView = "checks"; if(typeof setTabUI === "function") setTabUI(); }
      if(typeof renderChecksWorldTabs === "function") renderChecksWorldTabs();
      if(typeof renderChecks === "function") renderChecks();
      await delay(140);
      const before = document.querySelector("#checksBody .tableBlock.nowPlayingChecks")?.getAttribute("data-tablekey") || "";
      const node = document.querySelector(`#checksBody .tableBlock[data-tablekey="${CSS.escape(targetKey)}"] .nodeBtn[data-locid="3010"]`);
      node?.click();
      await delay(260);
      const afterClick = document.querySelector("#checksBody .tableBlock.nowPlayingChecks")?.getAttribute("data-tablekey") || "";
      await delay(5700);
      const afterModal = document.querySelector("#checksBody .tableBlock.nowPlayingChecks")?.getAttribute("data-tablekey") || "";
      const bridgeAfter = typeof window.flprStandaloneChecksSelectionBridgeState === "function"
        ? window.flprStandaloneChecksSelectionBridgeState()
        : null;
      return {
        skipped:false,
        targetKey,
        otherKey,
        nodeFound: !!node,
        before,
        afterClick,
        afterModal,
        currentWorld: String(ap?.currentWorld || ""),
        selected: String(state?.selected || ""),
        nowPlaying: Number(state?.nowPlaying?.[targetWorld]),
        bridgeAfter,
        modalHidden: document.querySelector("#ovModal")?.classList.contains("hidden") !== false,
        bodyText: (document.querySelector("#checksBody")?.innerText || "").slice(0, 700)
      };
    }finally{
      try{
        if(!previous.checked3010) ap.checked.delete(3010);
        if(previous.pending3010) ap.pendingByLoc.set(3010, ap.pendingByLoc.get(3010) || {});
        if(Number.isFinite(previous.nowPlaying)) state.nowPlaying[targetWorld] = previous.nowPlaying;
        state.selected = previous.selected;
        ap.currentWorld = previous.currentWorld;
        if(typeof showView === "function") showView(previous.activeView || "checks");
        if(typeof renderChecksWorldTabs === "function") renderChecksWorldTabs();
        if(typeof renderChecks === "function") renderChecks();
      }catch(_){}
    }
  });
  if(
    !checksNodeRedeemSelectionProbe.skipped &&
    (
      !checksNodeRedeemSelectionProbe.nodeFound ||
      checksNodeRedeemSelectionProbe.before !== checksNodeRedeemSelectionProbe.targetKey ||
      checksNodeRedeemSelectionProbe.afterClick !== checksNodeRedeemSelectionProbe.targetKey ||
      checksNodeRedeemSelectionProbe.afterModal !== checksNodeRedeemSelectionProbe.targetKey ||
      checksNodeRedeemSelectionProbe.currentWorld !== String(checksNodeRedeemSelectionProbe.targetKey || "").split("|")[0] ||
      checksNodeRedeemSelectionProbe.nowPlaying !== Number(String(checksNodeRedeemSelectionProbe.targetKey || "").split("|")[1])
    )
  ){
    throw new Error(`Redeeming a Checks node allowed another table to steal selection: ${JSON.stringify(checksNodeRedeemSelectionProbe)}`);
  }

  const overviewToChecksSelectionProbe = await page.evaluate(async () => {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const worlds = Object.keys(state?.worlds || {}).filter((wk) => {
      try { return wk !== "boss" && !isBossWorldId(wk, state) && Array.isArray(state.worlds[wk]?.tables) && state.worlds[wk].tables.length >= 1; } catch (_) { return false; }
    });
    const fromWorld = worlds[0] || "";
    const toWorld = worlds.find((wk) => wk !== fromWorld && (state.worlds[wk]?.tables || []).length >= 2) ||
      worlds.find((wk) => wk !== fromWorld) ||
      "";
    if(!fromWorld || !toWorld) return { skipped:true, worlds };
    const toTables = Array.isArray(state.worlds[toWorld].tables) ? state.worlds[toWorld].tables : [];
    const targetIdx = Math.min(Math.max(0, toTables.length - 1), 1);
    const targetKey = `${toWorld}|${targetIdx}`;
    const staleKey = `${fromWorld}|0`;
    const previous = {
      selected: String(state?.selected || ""),
      currentWorld: String(ap?.currentWorld || ""),
      fromLocked: !!state.worlds[fromWorld].locked,
      toLocked: !!state.worlds[toWorld].locked,
      fromNow: Number(state?.nowPlaying?.[fromWorld]),
      toNow: Number(state?.nowPlaying?.[toWorld]),
      activeView: String(activeView || "")
    };
    const touchedBalls = [];
    const rememberBall = (key) => {
      if(touchedBalls.some((entry) => entry.key === key)) return;
      touchedBalls.push({
        key,
        had: Object.prototype.hasOwnProperty.call(state.balls || {}, key),
        value: state.balls?.[key]
      });
    };
    try{
      try{ if(typeof besiegedClear === "function") besiegedClear("test-checks-world-tab-switch"); }catch(_){}
      state.balls = state.balls || {};
      state.nowPlaying = state.nowPlaying || {};
      state.worlds[fromWorld].locked = false;
      state.worlds[toWorld].locked = false;
      [staleKey, targetKey].forEach((base) => {
        rememberBall(`${base}|1`);
        state.balls[`${base}|1`] = true;
      });
      state.nowPlaying[fromWorld] = 0;
      state.nowPlaying[toWorld] = 0;
      state.selected = fromWorld;
      ap.currentWorld = fromWorld;
      try{ if(typeof saveState === "function") saveState(); }catch(_){}
      if(typeof showView === "function") showView("checks");
      else { activeView = "checks"; if(typeof setTabUI === "function") setTabUI(); }
      if(typeof renderChecksWorldTabs === "function") renderChecksWorldTabs();
      if(typeof renderChecks === "function") renderChecks();
      await delay(120);
      document.querySelector(`#checksBody .tableBlock[data-tablekey="${CSS.escape(staleKey)}"]`)?.click();
      await delay(120);
      const pinnedBefore = typeof window.flprStandaloneChecksSelectionBridgeState === "function"
        ? window.flprStandaloneChecksSelectionBridgeState()
        : null;
      if(typeof showView === "function") showView("overview");
      else { activeView = "overview"; if(typeof setTabUI === "function") setTabUI(); if(typeof renderOverviewGrid === "function") renderOverviewGrid(); }
      if(typeof renderOverviewGrid === "function") renderOverviewGrid();
      await delay(120);
      const tile = document.querySelector(`#grid .tile[data-tablekey="${CSS.escape(targetKey)}"]`);
      tile?.click();
      await delay(180);
      const overviewActive = document.querySelector("#grid .tile.nowPlayingOverview")?.getAttribute("data-tablekey") || "";
      state.worlds[toWorld].locked = false;
      state.balls[`${targetKey}|1`] = true;
      state.nowPlaying[toWorld] = targetIdx;
      state.selected = toWorld;
      ap.currentWorld = toWorld;
      try{ if(typeof saveState === "function") saveState(); }catch(_){}
      if(typeof showView === "function") showView("checks");
      else { activeView = "checks"; if(typeof setTabUI === "function") setTabUI(); }
      await delay(180);
      if(typeof renderChecksWorldTabs === "function") renderChecksWorldTabs();
      if(typeof renderChecks === "function") renderChecks();
      await delay(180);
      const activeKey = document.querySelector("#checksBody .tableBlock.nowPlayingChecks")?.getAttribute("data-tablekey") || "";
      const bridgeAfter = typeof window.flprStandaloneChecksSelectionBridgeState === "function"
        ? window.flprStandaloneChecksSelectionBridgeState()
        : null;
      return {
        skipped:false,
        fromWorld,
        toWorld,
        staleKey,
        targetKey,
        tileFound: !!tile,
        pinnedBefore,
        overviewActive,
        activeKey,
        currentWorld: String(ap?.currentWorld || ""),
        selected: String(state?.selected || ""),
        targetNowPlaying: Number(state?.nowPlaying?.[toWorld]),
        bridgeAfter,
        bodyText: (document.querySelector("#checksBody")?.innerText || "").slice(0, 700)
      };
    }finally{
      try{
        touchedBalls.reverse().forEach((entry) => {
          if(entry.had) state.balls[entry.key] = entry.value;
          else delete state.balls[entry.key];
        });
        state.worlds[fromWorld].locked = previous.fromLocked;
        state.worlds[toWorld].locked = previous.toLocked;
        if(Number.isFinite(previous.fromNow)) state.nowPlaying[fromWorld] = previous.fromNow;
        if(Number.isFinite(previous.toNow)) state.nowPlaying[toWorld] = previous.toNow;
        state.selected = previous.selected;
        ap.currentWorld = previous.currentWorld;
        if(typeof showView === "function") showView("checks");
        else { activeView = "checks"; if(typeof setTabUI === "function") setTabUI(); }
        if(typeof renderOverviewGrid === "function") renderOverviewGrid();
        if(typeof renderChecksWorldTabs === "function") renderChecksWorldTabs();
        if(typeof renderChecks === "function") renderChecks();
        await delay(80);
        const restoreTab = document.querySelector(`#checksWorldTabs .wTab[data-world-tab="${CSS.escape(previous.currentWorld || previous.selected || "")}"]`);
        restoreTab?.click();
        await delay(80);
        state.selected = previous.selected;
        ap.currentWorld = previous.currentWorld;
        if(typeof showView === "function") showView(previous.activeView || "checks");
        else { activeView = previous.activeView || "checks"; if(typeof setTabUI === "function") setTabUI(); }
        if(typeof renderOverviewGrid === "function") renderOverviewGrid();
        if(typeof renderChecksWorldTabs === "function") renderChecksWorldTabs();
        if(typeof renderChecks === "function") renderChecks();
      }catch(_){}
    }
  });
  if(
    !overviewToChecksSelectionProbe.skipped &&
    (
      !overviewToChecksSelectionProbe.tileFound ||
      overviewToChecksSelectionProbe.overviewActive !== overviewToChecksSelectionProbe.targetKey ||
      overviewToChecksSelectionProbe.activeKey !== overviewToChecksSelectionProbe.targetKey ||
      overviewToChecksSelectionProbe.currentWorld !== overviewToChecksSelectionProbe.toWorld ||
      overviewToChecksSelectionProbe.targetNowPlaying !== Number(String(overviewToChecksSelectionProbe.targetKey || "").split("|")[1]) ||
      (overviewToChecksSelectionProbe.bridgeAfter?.key || "") !== overviewToChecksSelectionProbe.targetKey
    )
  ){
    throw new Error(`Overview table selection did not become the Checks table: ${JSON.stringify(overviewToChecksSelectionProbe)}`);
  }

  const checksSelectionProbe = await page.evaluate(async () => {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const targetKey = typeof getTableKeyForName === "function" ? (getTableKeyForName("Corvette") || "") : "";
    const parts = String(targetKey || "").split("|");
    const testWorldKey = String(parts[0] || "");
    const targetIdx = Number(parts[1]);
    const oldSelected = String(state?.selected || "");
    const oldCurrentWorld = String(ap?.currentWorld || "");
    const oldNowPlaying = Number(state?.nowPlaying?.[testWorldKey]);
    const oldActiveView = String(activeView || "");
    let result = null;
    try {
      if(!testWorldKey || !Number.isFinite(targetIdx) || targetIdx < 0) throw new Error(`Missing Corvette table key: ${targetKey}`);
      state.nowPlaying = state.nowPlaying || {};
      state.balls = state.balls || {};
      const staleIdx = targetIdx === 0 ? 1 : 0;
      if(!state?.worlds?.[testWorldKey]?.tables?.[staleIdx]) throw new Error(`Missing stale table in ${testWorldKey}: ${staleIdx}`);
      state.nowPlaying[testWorldKey] = staleIdx;
      state.balls[`${testWorldKey}|${targetIdx}|1`] = true;
      state.balls[`${testWorldKey}|${staleIdx}|1`] = true;
      const dirtyMapKey = (() => {
        try { return canonicalTableMapKey(state.worlds[testWorldKey].tables[staleIdx]); } catch (_) { return ""; }
      })();
      const dirtyNodes = Array.from(ap?.locsByTableKey?.get?.(dirtyMapKey) || []);
      ap.checked = ap.checked || new Set();
      dirtyNodes.forEach((node) => {
        const id = Number(node?.id);
        if(Number.isFinite(id) && id > 0) ap.checked.add(id);
      });
      state.selected = testWorldKey;
      ap.currentWorld = testWorldKey;
      if(typeof showView === "function") showView("checks");
      else { activeView = "checks"; if(typeof setTabUI === "function") setTabUI(); }
      if(typeof renderChecksWorldTabs === "function") renderChecksWorldTabs();
      if(typeof renderChecks === "function") renderChecks();
      await delay(80);
      const before = document.querySelector("#checksBody .tableBlock.nowPlayingChecks")?.getAttribute("data-tablekey") || "";
      const beforeOrder = Array.from(document.querySelectorAll("#checksBody .tableBlock")).map((node) => node.getAttribute("data-tablekey") || "");
      const targetBlock = document.querySelector(`#checksBody .tableBlock[data-tablekey="${CSS.escape(targetKey)}"]`);
      if(targetBlock) targetBlock.click();
      await delay(120);
      const afterOrder = Array.from(document.querySelectorAll("#checksBody .tableBlock")).map((node) => node.getAttribute("data-tablekey") || "");
      const afterClick = document.querySelector("#checksBody .tableBlock.nowPlayingChecks")?.getAttribute("data-tablekey") || "";
      const clicked = afterClick === targetKey;
      const animationAfterClick = !!document.querySelector("#checksBody.checksDrawerAnim, .checksSwapGhost");
      if(typeof setNowPlayingIndex === "function") setNowPlayingIndex(testWorldKey, staleIdx, { source:"auto-swap-test", countView:true });
      if(typeof setNowPlayingFromTableKey === "function") setNowPlayingFromTableKey(`${testWorldKey}|${staleIdx}`, {
        allowLocked: true,
        syncChecksWorld: true,
        countView: true,
        source: "tower-click"
      });
      await delay(80);
      const afterExternal = document.querySelector("#checksBody .tableBlock.nowPlayingChecks")?.getAttribute("data-tablekey") || "";
      state.nowPlaying[testWorldKey] = staleIdx;
      if(typeof applyChecksNowPlayingHighlight === "function") applyChecksNowPlayingHighlight();
      if(typeof renderChecks === "function") renderChecks();
      if(typeof syncNowPlayingIndexesToUnlockedTables === "function") syncNowPlayingIndexesToUnlockedTables({ render:true, save:false });
      await delay(1450);
      if(typeof renderChecks === "function") renderChecks();
      await delay(140);
      const active = document.querySelector("#checksBody .tableBlock.nowPlayingChecks")?.getAttribute("data-tablekey") || "";
      const finalOrder = Array.from(document.querySelectorAll("#checksBody .tableBlock")).map((node) => node.getAttribute("data-tablekey") || "");
      result = {
        clicked,
        before,
        beforeOrder,
        afterOrder,
        afterClick,
        afterExternal,
        animationAfterClick,
        active,
        finalOrder,
        animationFinal: !!document.querySelector("#checksBody.checksDrawerAnim, .checksSwapGhost"),
        nowPlaying: Number(state?.nowPlaying?.[testWorldKey]),
        currentWorld: String(ap?.currentWorld || ""),
        targetKey,
        staleKey: `${testWorldKey}|${staleIdx}`,
        bridge: typeof window.flprStandaloneChecksSelectionBridgeState === "function"
          ? window.flprStandaloneChecksSelectionBridgeState()
          : null,
        dirtyNodeCount: dirtyNodes.length,
        bodyText: (document.querySelector("#checksBody")?.innerText || "").slice(0, 900)
      };
    } finally {
      try {
        if(Number.isFinite(oldNowPlaying)) state.nowPlaying[testWorldKey] = oldNowPlaying;
        else if(state?.nowPlaying) delete state.nowPlaying[testWorldKey];
        state.selected = oldSelected;
        ap.currentWorld = oldCurrentWorld;
        if(typeof showView === "function") showView(oldActiveView || "checks");
        if(typeof renderChecksWorldTabs === "function") renderChecksWorldTabs();
        if(typeof renderChecks === "function") renderChecks();
      } catch (_) {}
    }
    return result;
  });
  if(
    !checksSelectionProbe?.clicked ||
    checksSelectionProbe.active !== checksSelectionProbe.targetKey ||
    checksSelectionProbe.afterExternal !== checksSelectionProbe.targetKey ||
    checksSelectionProbe.nowPlaying !== Number(String(checksSelectionProbe.targetKey || "").split("|")[1]) ||
    checksSelectionProbe.currentWorld !== String(checksSelectionProbe.targetKey || "").split("|")[0] ||
    checksSelectionProbe.animationAfterClick ||
    checksSelectionProbe.animationFinal ||
    checksSelectionProbe.beforeOrder?.join("|") !== checksSelectionProbe.afterOrder?.join("|") ||
    checksSelectionProbe.beforeOrder?.join("|") !== checksSelectionProbe.finalOrder?.join("|") ||
    !checksSelectionProbe.bridge?.installed
  ){
    throw new Error(`Checks page manual table selection was not pinned through refresh churn: ${JSON.stringify(checksSelectionProbe)}`);
  }

  const toccataChecksSelectionProbe = await page.evaluate(async () => {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const worldKey = "w1";
    const phantomKey = `${worldKey}|1`;
    const hauntedKey = `${worldKey}|2`;
    const previous = {
      selected: String(state?.selected || ""),
      currentWorld: String(ap?.currentWorld || ""),
      activeView: String(activeView || ""),
      world: state?.worlds?.[worldKey] ? JSON.parse(JSON.stringify(state.worlds[worldKey])) : null,
      nowPlaying: state?.nowPlaying ? state.nowPlaying[worldKey] : undefined,
      balls: state?.balls ? { ...state.balls } : {}
    };
    try{
      state.worlds = state.worlds || {};
      state.worlds[worldKey] = {
        ...(state.worlds[worldKey] || {}),
        label: "World 1; Toccata Terror Test",
        locked: false,
        tables: ["Genesis", "Phantom of the Opera", "Haunted House", "The Incredible Hulk", "Theatre of Magic"]
      };
      state.balls = state.balls || {};
      state.balls[`${phantomKey}|1`] = true;
      state.balls[`${hauntedKey}|1`] = true;
      state.nowPlaying = state.nowPlaying || {};
      state.nowPlaying[worldKey] = 2;
      state.selected = worldKey;
      ap.currentWorld = worldKey;
      if(typeof showView === "function") showView("checks");
      else { activeView = "checks"; if(typeof setTabUI === "function") setTabUI(); }
      if(typeof renderChecksWorldTabs === "function") renderChecksWorldTabs();
      if(typeof renderChecks === "function") renderChecks();
      await delay(100);
      const beforeActive = document.querySelector("#checksBody .tableBlock.nowPlayingChecks")?.getAttribute("data-tablekey") || "";
      const beforeOrder = Array.from(document.querySelectorAll("#checksBody .tableBlock")).map((node) => node.getAttribute("data-tablekey") || "");
      document.querySelector(`#checksBody .tableBlock[data-tablekey="${CSS.escape(phantomKey)}"]`)?.click();
      await delay(180);
      const afterActive = document.querySelector("#checksBody .tableBlock.nowPlayingChecks")?.getAttribute("data-tablekey") || "";
      const afterOrder = Array.from(document.querySelectorAll("#checksBody .tableBlock")).map((node) => node.getAttribute("data-tablekey") || "");
      return {
        beforeActive,
        afterActive,
        beforeOrder,
        afterOrder,
        nowPlaying: Number(state?.nowPlaying?.[worldKey]),
        currentWorld: String(ap?.currentWorld || ""),
        animation: !!document.querySelector("#checksBody.checksDrawerAnim, .checksSwapGhost"),
        phantomText: document.querySelector(`#checksBody .tableBlock[data-tablekey="${CSS.escape(phantomKey)}"]`)?.innerText || "",
        hauntedText: document.querySelector(`#checksBody .tableBlock[data-tablekey="${CSS.escape(hauntedKey)}"]`)?.innerText || ""
      };
    }finally{
      try{
        if(previous.world) state.worlds[worldKey] = previous.world;
        if(previous.nowPlaying === undefined) delete state.nowPlaying[worldKey];
        else state.nowPlaying[worldKey] = previous.nowPlaying;
        state.balls = { ...previous.balls };
        state.selected = previous.selected;
        ap.currentWorld = previous.currentWorld;
        if(typeof showView === "function") showView(previous.activeView || "checks");
        if(typeof renderChecksWorldTabs === "function") renderChecksWorldTabs();
        if(typeof renderChecks === "function") renderChecks();
      }catch(_){}
    }
  });
  if(
    toccataChecksSelectionProbe.beforeActive !== "w1|2" ||
    toccataChecksSelectionProbe.afterActive !== "w1|1" ||
    toccataChecksSelectionProbe.nowPlaying !== 1 ||
    toccataChecksSelectionProbe.currentWorld !== "w1" ||
    toccataChecksSelectionProbe.animation ||
    toccataChecksSelectionProbe.beforeOrder?.join("|") !== toccataChecksSelectionProbe.afterOrder?.join("|")
  ){
    throw new Error(`Phantom of the Opera selection drifted back to Haunted House or moved table order: ${JSON.stringify(toccataChecksSelectionProbe)}`);
  }

  const checksWorldTabSwitchProbe = await page.evaluate(async () => {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const worlds = Object.keys(state?.worlds || {}).filter((wk) => {
      try { return wk !== "boss" && !isBossWorldId(wk, state) && Array.isArray(state.worlds[wk]?.tables) && state.worlds[wk].tables.length >= 1; } catch (_) { return false; }
    });
    const fromWorld = worlds[0] || "";
    const toWorld = worlds.find((wk) => wk !== fromWorld) || "";
    if(!fromWorld || !toWorld) return { skipped:true, worlds };
    const previous = {
      selected: String(state?.selected || ""),
      currentWorld: String(ap?.currentWorld || ""),
      fromLocked: !!state.worlds[fromWorld].locked,
      toLocked: !!state.worlds[toWorld].locked,
      fromNow: Number(state?.nowPlaying?.[fromWorld]),
      toNow: Number(state?.nowPlaying?.[toWorld])
    };
    try{
      state.balls = state.balls || {};
      state.nowPlaying = state.nowPlaying || {};
      state.worlds[fromWorld].locked = false;
      state.worlds[toWorld].locked = false;
      state.balls[`${fromWorld}|0|1`] = true;
      state.balls[`${toWorld}|0|1`] = true;
      state.nowPlaying[fromWorld] = 0;
      state.nowPlaying[toWorld] = 0;
      state.selected = fromWorld;
      ap.currentWorld = fromWorld;
      if(typeof showView === "function") showView("checks");
      else { activeView = "checks"; if(typeof setTabUI === "function") setTabUI(); }
      if(typeof renderChecksWorldTabs === "function") renderChecksWorldTabs();
      if(typeof renderChecks === "function") renderChecks();
      await delay(100);
      document.querySelector(`#checksBody .tableBlock[data-tablekey="${CSS.escape(`${fromWorld}|0`)}"]`)?.click();
      await delay(120);
      const pinnedBefore = typeof window.flprStandaloneChecksSelectionBridgeState === "function"
        ? window.flprStandaloneChecksSelectionBridgeState()
        : null;
      const tab = document.querySelector(`#checksWorldTabs .wTab[data-world-tab="${CSS.escape(toWorld)}"]`);
      tab?.click();
      await delay(260);
      if(typeof syncTowerSelectionToWorld === "function") syncTowerSelectionToWorld(fromWorld);
      if(typeof syncChecksWorldFromTowerContext === "function") syncChecksWorldFromTowerContext();
      if(typeof renderChecksWorldTabs === "function") renderChecksWorldTabs();
      if(typeof renderChecks === "function") renderChecks();
      await delay(90);
      const bodyKeys = Array.from(document.querySelectorAll("#checksBody .tableBlock")).map((node) => node.getAttribute("data-tablekey") || "");
      const activeKey = document.querySelector("#checksBody .tableBlock.nowPlayingChecks")?.getAttribute("data-tablekey") || "";
      const bridgeAfter = typeof window.flprStandaloneChecksSelectionBridgeState === "function"
        ? window.flprStandaloneChecksSelectionBridgeState()
        : null;
      return {
        skipped:false,
        fromWorld,
        toWorld,
        tabFound: !!tab,
        currentWorld: String(ap?.currentWorld || ""),
        selected: String(state?.selected || ""),
        activeKey,
        bodyKeys,
        delayedPullBackWorld: fromWorld,
        pinnedBefore,
        bridgeAfter,
        lastSwitch: window.__flprStandaloneLastChecksWorldSwitch || null,
        bodyText: (document.querySelector("#checksBody")?.innerText || "").slice(0, 600)
      };
    }finally{
      try{
        state.worlds[fromWorld].locked = previous.fromLocked;
        state.worlds[toWorld].locked = previous.toLocked;
        if(Number.isFinite(previous.fromNow)) state.nowPlaying[fromWorld] = previous.fromNow;
        if(Number.isFinite(previous.toNow)) state.nowPlaying[toWorld] = previous.toNow;
        state.selected = previous.selected;
        ap.currentWorld = previous.currentWorld;
        if(typeof renderChecksWorldTabs === "function") renderChecksWorldTabs();
        if(typeof renderChecks === "function") renderChecks();
      }catch(_){}
    }
  });
  if(
    !checksWorldTabSwitchProbe.skipped &&
    (
      !checksWorldTabSwitchProbe.tabFound ||
      checksWorldTabSwitchProbe.currentWorld !== checksWorldTabSwitchProbe.toWorld ||
      checksWorldTabSwitchProbe.selected !== checksWorldTabSwitchProbe.toWorld ||
      !checksWorldTabSwitchProbe.activeKey.startsWith(`${checksWorldTabSwitchProbe.toWorld}|`) ||
      !checksWorldTabSwitchProbe.bodyKeys.length ||
      !checksWorldTabSwitchProbe.bodyKeys.every((key) => key.startsWith(`${checksWorldTabSwitchProbe.toWorld}|`)) ||
      (checksWorldTabSwitchProbe.bridgeAfter?.key || "").startsWith(`${checksWorldTabSwitchProbe.fromWorld}|`)
    )
  ){
    throw new Error(`Checks world tab switch was blocked by the table pin: ${JSON.stringify(checksWorldTabSwitchProbe)}`);
  }

  const checksWorldTabLockedBackProbe = await page.evaluate(async () => {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const worlds = Object.keys(state?.worlds || {}).filter((wk) => {
      try { return wk !== "boss" && !isBossWorldId(wk, state) && Array.isArray(state.worlds[wk]?.tables) && state.worlds[wk].tables.length >= 1; } catch (_) { return false; }
    });
    const toWorld = worlds.includes("w1") ? "w1" : (worlds[0] || "");
    const fromWorld = worlds.find((wk) => wk !== toWorld && wk === "w2") || worlds.find((wk) => wk !== toWorld) || "";
    if(!fromWorld || !toWorld) return { skipped:true, worlds };
    const previous = {
      selected: String(state?.selected || ""),
      currentWorld: String(ap?.currentWorld || ""),
      fromLocked: !!state.worlds[fromWorld].locked,
      toLocked: !!state.worlds[toWorld].locked,
      fromNow: Number(state?.nowPlaying?.[fromWorld]),
      toNow: Number(state?.nowPlaying?.[toWorld])
    };
    const touchedBalls = [];
    const rememberBall = (key) => {
      if(touchedBalls.some((entry) => entry.key === key)) return;
      touchedBalls.push({
        key,
        had: Object.prototype.hasOwnProperty.call(state.balls || {}, key),
        value: state.balls?.[key]
      });
    };
    try{
      try{ if(typeof besiegedClear === "function") besiegedClear("test-checks-world-tab-locked-back"); }catch(_){}
      state.balls = state.balls || {};
      state.nowPlaying = state.nowPlaying || {};
      state.worlds[fromWorld].locked = false;
      state.worlds[toWorld].locked = false;
      const fromTables = Array.isArray(state.worlds[fromWorld].tables) ? state.worlds[fromWorld].tables : [];
      const toTables = Array.isArray(state.worlds[toWorld].tables) ? state.worlds[toWorld].tables : [];
      rememberBall(`${fromWorld}|0|1`);
      state.balls[`${fromWorld}|0|1`] = true;
      for(let idx = 0; idx < toTables.length; idx++){
        for(let ball = 1; ball <= 3; ball++){
          const key = `${toWorld}|${idx}|${ball}`;
          rememberBall(key);
          delete state.balls[key];
        }
      }
      state.nowPlaying[fromWorld] = 0;
      state.nowPlaying[toWorld] = 0;
      state.selected = fromWorld;
      ap.currentWorld = fromWorld;
      if(typeof showView === "function") showView("checks");
      else { activeView = "checks"; if(typeof setTabUI === "function") setTabUI(); }
      if(typeof renderChecksWorldTabs === "function") renderChecksWorldTabs();
      if(typeof renderChecks === "function") renderChecks();
      await delay(100);
      document.querySelector(`#checksBody .tableBlock[data-tablekey="${CSS.escape(`${fromWorld}|0`)}"]`)?.click();
      await delay(120);
      const tab = document.querySelector(`#checksWorldTabs .wTab[data-world-tab="${CSS.escape(toWorld)}"]`);
      tab?.click();
      await delay(120);
      if(typeof syncTowerSelectionToWorld === "function") syncTowerSelectionToWorld(fromWorld);
      if(typeof syncChecksWorldFromTowerContext === "function") syncChecksWorldFromTowerContext();
      if(typeof syncNowPlayingIndexesToUnlockedTables === "function") syncNowPlayingIndexesToUnlockedTables({ render:true, save:false });
      await delay(420);
      const bodyKeys = Array.from(document.querySelectorAll("#checksBody .tableBlock")).map((node) => node.getAttribute("data-tablekey") || "");
      const activeKey = document.querySelector("#checksBody .tableBlock.nowPlayingChecks")?.getAttribute("data-tablekey") || "";
      const bridgeAfter = typeof window.flprStandaloneChecksSelectionBridgeState === "function"
        ? window.flprStandaloneChecksSelectionBridgeState()
        : null;
      return {
        skipped:false,
        fromWorld,
        toWorld,
        tabFound: !!tab,
        currentWorld: String(ap?.currentWorld || ""),
        selected: String(state?.selected || ""),
        activeKey,
        bodyKeys,
        bridgeAfter,
        toTableCount: toTables.length,
        fromTableCount: fromTables.length,
        bodyText: (document.querySelector("#checksBody")?.innerText || "").slice(0, 600)
      };
    }finally{
      try{
        touchedBalls.reverse().forEach((entry) => {
          if(entry.had) state.balls[entry.key] = entry.value;
          else delete state.balls[entry.key];
        });
        state.worlds[fromWorld].locked = previous.fromLocked;
        state.worlds[toWorld].locked = previous.toLocked;
        if(Number.isFinite(previous.fromNow)) state.nowPlaying[fromWorld] = previous.fromNow;
        if(Number.isFinite(previous.toNow)) state.nowPlaying[toWorld] = previous.toNow;
        state.selected = previous.selected;
        ap.currentWorld = previous.currentWorld;
        if(typeof renderChecksWorldTabs === "function") renderChecksWorldTabs();
        if(typeof renderChecks === "function") renderChecks();
      }catch(_){}
    }
  });
  if(
    !checksWorldTabLockedBackProbe.skipped &&
    (
      !checksWorldTabLockedBackProbe.tabFound ||
      checksWorldTabLockedBackProbe.currentWorld !== checksWorldTabLockedBackProbe.toWorld ||
      checksWorldTabLockedBackProbe.selected !== checksWorldTabLockedBackProbe.toWorld ||
      !checksWorldTabLockedBackProbe.bodyKeys.length ||
      !checksWorldTabLockedBackProbe.bodyKeys.every((key) => key.startsWith(`${checksWorldTabLockedBackProbe.toWorld}|`)) ||
      checksWorldTabLockedBackProbe.bridgeAfter?.worldKey !== checksWorldTabLockedBackProbe.toWorld
    )
  ){
    throw new Error(`Checks world tab switch fell back to the previously playable world: ${JSON.stringify(checksWorldTabLockedBackProbe)}`);
  }

  const receivedRefreshNoopProbe = await page.evaluate(async () => {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    if(typeof window.flprStandaloneRefreshReceivedFromServer !== "function") return { missing:true };
    window.flprStandaloneRefreshReceivedFromServer("noop-prime");
    await delay(80);
    const midStats = { ...(window.__flprStandaloneReceivedRefreshStats || {}) };
    const midHtml = document.querySelector("#checksBody")?.innerHTML || "";
    window.flprStandaloneRefreshReceivedFromServer("noop-second");
    await delay(80);
    const afterStats = { ...(window.__flprStandaloneReceivedRefreshStats || {}) };
    const afterHtml = document.querySelector("#checksBody")?.innerHTML || "";
    return {
      missing:false,
      midStats,
      afterStats,
      bodyHtmlStable: midHtml === afterHtml
    };
  });
  if(
    receivedRefreshNoopProbe.missing ||
    Number(receivedRefreshNoopProbe.afterStats?.rendered || 0) !== Number(receivedRefreshNoopProbe.midStats?.rendered || 0) ||
    Number(receivedRefreshNoopProbe.afterStats?.reconciled || 0) !== Number(receivedRefreshNoopProbe.midStats?.reconciled || 0) ||
    Number(receivedRefreshNoopProbe.afterStats?.noops || 0) <= Number(receivedRefreshNoopProbe.midStats?.noops || 0) ||
    !receivedRefreshNoopProbe.bodyHtmlStable
  ){
    throw new Error(`No-op ReceivedItems refresh still re-rendered Checks: ${JSON.stringify(receivedRefreshNoopProbe)}`);
  }

  const duplicateReceivedPacketProbe = await page.evaluate((pkt) => {
    const beforeStats = { ...(window.__flprStandaloneReceivedRefreshStats || {}) };
    const beforeGate = typeof window.flprStandaloneReceivedPacketGateState === "function"
      ? window.flprStandaloneReceivedPacketGateState()
      : null;
    const beforeHtml = document.querySelector("#checksBody")?.innerHTML || "";
    const suppressed = typeof window.flprStandaloneShouldSuppressReceivedItemsPacketForTest === "function"
      ? window.flprStandaloneShouldSuppressReceivedItemsPacketForTest(pkt)
      : false;
    const afterStats = { ...(window.__flprStandaloneReceivedRefreshStats || {}) };
    const afterGate = typeof window.flprStandaloneReceivedPacketGateState === "function"
      ? window.flprStandaloneReceivedPacketGateState()
      : null;
    const afterHtml = document.querySelector("#checksBody")?.innerHTML || "";
    return {
      suppressed,
      beforeStats,
      afterStats,
      beforeGate,
      afterGate,
      bodyHtmlStable: beforeHtml === afterHtml
    };
  }, receivedItems);
  if(
    !duplicateReceivedPacketProbe.suppressed ||
    Number(duplicateReceivedPacketProbe.afterGate?.blockedPackets || 0) <= Number(duplicateReceivedPacketProbe.beforeGate?.blockedPackets || 0) ||
    Number(duplicateReceivedPacketProbe.afterStats?.rendered || 0) !== Number(duplicateReceivedPacketProbe.beforeStats?.rendered || 0) ||
    Number(duplicateReceivedPacketProbe.afterStats?.reconciled || 0) !== Number(duplicateReceivedPacketProbe.beforeStats?.reconciled || 0) ||
    Number(duplicateReceivedPacketProbe.afterStats?.noops || 0) <= Number(duplicateReceivedPacketProbe.beforeStats?.noops || 0) ||
    !duplicateReceivedPacketProbe.bodyHtmlStable
  ){
    throw new Error(`Duplicate ReceivedItems packet was not suppressed before replay: ${JSON.stringify(duplicateReceivedPacketProbe)}`);
  }

  const bossKeyGateProbe = await page.evaluate(() => {
    const previous = {
      apBossKeyCount: window.__apBossKeyCount,
      prevApBossKeyCount: window.__prevApBossKeyCount,
      bossOpen: state?.bossOpen,
      bossWorldLocked: state?.worlds?.boss?.locked,
      selected: state?.selected,
      currentWorld: ap?.currentWorld,
      bossKeys: Array.isArray(window.bossKeysState || bossKeysState)
        ? (window.bossKeysState || bossKeysState).map((key) => key ? { ...key } : key)
        : null
    };
    try{
      const keys = window.bossKeysState || bossKeysState;
      if(Array.isArray(keys)) keys.forEach((key) => { if(key) key.acquired = false; });
      window.__apBossKeyCount = 0;
      window.__prevApBossKeyCount = 0;
      if(typeof bossKeysSyncLegacyMirror === "function") bossKeysSyncLegacyMirror(0);
      if(state?.worlds?.boss) state.worlds.boss.locked = false;
      state.bossOpen = true;
      if(typeof bossKeysRender === "function") bossKeysRender();
      const forceResult = typeof forceBossWorldUnlocked === "function" ? forceBossWorldUnlocked("stale-open-regression") : null;
      return {
        forceResult,
        unlocked: typeof isBossUnlocked === "function" ? isBossUnlocked() : null,
        revealReady: typeof isBossTableRevealReady === "function" ? isBossTableRevealReady() : null,
        bossOpen: !!state?.bossOpen,
        bossLocked: !!state?.worlds?.boss?.locked,
        dockOpen: !!document.getElementById("bossDock")?.classList.contains("bossOpen")
      };
    }finally{
      window.__apBossKeyCount = previous.apBossKeyCount;
      window.__prevApBossKeyCount = previous.prevApBossKeyCount;
      state.bossOpen = previous.bossOpen;
      if(state?.worlds?.boss) state.worlds.boss.locked = previous.bossWorldLocked;
      state.selected = previous.selected;
      ap.currentWorld = previous.currentWorld;
      try{
        const keys = window.bossKeysState || bossKeysState;
        if(Array.isArray(keys) && Array.isArray(previous.bossKeys)){
          keys.forEach((key, keyIndex) => {
            if(key && previous.bossKeys[keyIndex]) Object.assign(key, previous.bossKeys[keyIndex]);
          });
        }
      }catch(_){}
      try{ if(typeof bossKeysRender === "function") bossKeysRender(); }catch(_){}
    }
  });
  if(
    bossKeyGateProbe.forceResult !== false ||
    bossKeyGateProbe.unlocked ||
    bossKeyGateProbe.revealReady ||
    bossKeyGateProbe.bossOpen ||
    !bossKeyGateProbe.bossLocked ||
    bossKeyGateProbe.dockOpen
  ){
    throw new Error(`Boss opened without required Boss Keys: ${JSON.stringify(bossKeyGateProbe)}`);
  }

  const bossRoutingProbe = await page.evaluate((params) => {
    const {
      tableName,
      regularLocation,
      regularLocation2,
      bossLocation,
      victoryLocation
    } = params;
    if (typeof window.flprStandaloneRepairBossCheckNodeBuckets === "function") {
      window.flprStandaloneRepairBossCheckNodeBuckets();
    }
    const normalKey = (() => {
      try { return canonicalTableMapKey(tableName); } catch (_) { return String(tableName || "").toLowerCase().replace(/[^a-z0-9]+/g, ""); }
    })();
    const bossKey = (() => {
      try { return normKey("Boss Table"); } catch (_) { return "boss"; }
    })();
    const previousBossReveal = {
      apBossKeyCount: window.__apBossKeyCount,
      prevApBossKeyCount: window.__prevApBossKeyCount,
      selected: state.selected,
      bossKeys: Array.isArray(window.bossKeysState || bossKeysState)
        ? (window.bossKeysState || bossKeysState).map((key) => key ? { ...key } : key)
        : null
    };
    const addBossSlot = (full, id) => {
      const parts = String(full || "").split(" - ");
      const short = parts.slice(1).join(" - ") || full;
      const node = {
        id,
        full,
        short,
        tableName: "Boss Table",
        tableCode: "BOSS_TABLE",
        tableKey: bossKey,
        standaloneBossCheck: true
      };
      ap.locNameById.set(id, full);
      ap.locById.set(id, node);
      if(!ap.locsByTableKey.has(bossKey)) ap.locsByTableKey.set(bossKey, []);
      const list = ap.locsByTableKey.get(bossKey);
      if(!list.some((existing) => Number(existing?.id) === id)) list.push(node);
    };
    for(let i = 0; i < 10; i += 1){
      addBossSlot(`Boss Table - Generic Boss Slot ${i + 1}`, 3910 + i);
    }
    addBossSlot("Boss Table - Boss Victory", 3925);
    const worldKey = "w1";
    const world = state.worlds[worldKey] || (state.worlds[worldKey] = { tables: [] });
    if (!Array.isArray(world.tables)) world.tables = [];
    let idx = world.tables.findIndex((name) => String(name || "").toLowerCase() === String(tableName || "").toLowerCase());
    if (idx < 0) {
      world.tables.push(tableName);
      idx = world.tables.length - 1;
    }
    state.balls = state.balls || {};
    state.balls[`${worldKey}|${idx}|1`] = true;
    state.balls[`${worldKey}|${idx}|2`] = true;
    state.balls[`${worldKey}|${idx}|3`] = true;
    state.balls["boss|0|1"] = true;
    state.balls["boss|0|2"] = true;
    state.balls["boss|0|3"] = true;
    state.bossTable = tableName;
    state.bossHpLive = { max:100, cur:100, name:tableName, inited:true };
    state.bossHpTest = { ...(state.bossHpTest || {}), show:true, name:tableName, max:100, cur:100, forceShowCard:false };
    const bossRequired = typeof getBossKeysRequiredForOpen === "function" ? Number(getBossKeysRequiredForOpen()) || 3 : 3;
    window.__apBossKeyCount = bossRequired;
    window.__prevApBossKeyCount = bossRequired;
    try{
      const keys = window.bossKeysState || bossKeysState;
      if(Array.isArray(keys)){
        keys.forEach((key, keyIndex) => {
          if(key) key.acquired = keyIndex < bossRequired;
        });
      }
      if(typeof bossKeysSyncLegacyMirror === "function") bossKeysSyncLegacyMirror(bossRequired);
    }catch(_){}
    if(state.worlds.boss){
      state.worlds.boss.locked = false;
      state.worlds.boss.tables = [tableName];
    }
    ap.currentWorld = worldKey;
    saveState();
    renderChecksWorldTabs();
    renderChecks();
    const block = document.querySelector(`#checksBody .tableBlock[data-tablekey="${worldKey}|${idx}"]`);
    try{ if(typeof showView === "function") showView("checks"); else activeView = "checks"; }catch(_){}
    try{
      state.worldPage = typeof getWorldPageForWorldKey === "function" ? getWorldPageForWorldKey("boss") : state.worldPage;
    }catch(_){}
    ap.currentWorld = "boss";
    renderChecksWorldTabs();
    const bossTabBeforeClick = document.querySelector('#checksWorldTabs .wTab[data-world-tab="boss"]');
    try{
      const bossTab = bossTabBeforeClick;
      if(bossTab){
        bossTab.dispatchEvent(new PointerEvent("pointerdown", { bubbles:true, pointerId:73 }));
        bossTab.click();
      }
    }catch(_){}
    ap.currentWorld = "boss";
    renderChecks();
    try{ if(typeof window.__flprStandaloneApplyBossCardPresentationForTest === "function") window.__flprStandaloneApplyBossCardPresentationForTest(); }catch(_){}
    const bossDerivedNodes = typeof resolveBossChecksNodes === "function" ? resolveBossChecksNodes() : [];
    const bossDerivedLabels = bossDerivedNodes.map((node) => String(node.short || node.full || ""));
    const bossCards = Array.from(document.querySelectorAll("#checksBody .nodeBtn.bossNode")).map((btn) => ({
      hidden: !!btn.closest(".nodeCell")?.classList.contains("flprStandaloneBossVictoryHidden"),
      subtag: btn.querySelector(".flprStandaloneBossAttackSubtag")?.textContent || "",
      title: btn.querySelector(".nodeTitle")?.innerText || "",
      small: btn.querySelector(".small")?.textContent || "",
      damage: Number(btn.dataset.bossDamage || 0) || 0,
      isVictory: /boss victory/i.test(btn.querySelector(".nodeTitle")?.innerText || "")
    }));
    const bossBlock = document.querySelector('#checksBody .tableBlock[data-tablekey="boss|0"]');
    const normalBucket = (ap.locsByTableKey?.get?.(normalKey) || []).map((node) => node.full || node.short || "");
    const bossBucket = (ap.locsByTableKey?.get?.(bossKey) || []).map((node) => node.full || node.short || "");
    const result = {
      normalBucket,
      bossBucket,
      blockText: block?.innerText || "",
      bossBlockText: bossBlock?.innerText || "",
      bossDerivedCount: bossDerivedNodes.length,
      bossDerivedAttackCount: bossDerivedNodes.filter((node) => !/victory/i.test(String(node.short || node.full || ""))).length,
      bossDerivedHasVictory: bossDerivedLabels.some((label) => /boss victory/i.test(label)),
      bossDamageValues: bossDerivedNodes.filter((node) => !/victory/i.test(String(node.short || node.full || ""))).map((node) => Number(node.standaloneBossDamagePct || node.bossDamagePct || 0) || 0),
      bossDerivedLabels,
      bossCards,
      bossSpecificState: window.__flprStandaloneBossSpecificChecks || null,
      currentWorldAfterBossRender: ap.currentWorld,
      selectedAfterBossRender: state.selected,
      bossUnlocked: typeof isBossUnlocked === "function" ? !!isBossUnlocked() : null,
      bossRevealReady: typeof isBossTableRevealReady === "function" ? !!isBossTableRevealReady() : null,
      bossTabFound: !!bossTabBeforeClick,
      worldPage: state.worldPage,
      checksWorldOrder: typeof getChecksWorldOrder === "function" ? getChecksWorldOrder() : [],
      bridgeState: typeof window.flprStandaloneChecksSelectionBridgeState === "function" ? window.flprStandaloneChecksSelectionBridgeState() : null,
      tableBlockKeys: Array.from(document.querySelectorAll("#checksBody .tableBlock")).map((node) => node.getAttribute("data-tablekey") || ""),
      checksBodyText: document.querySelector("#checksBody")?.innerText || "",
      normalExplicitBossCount: (ap.locsByTableKey?.get?.(normalKey) || []).filter((node) => window.flprStandaloneIsExplicitBossCheckNode?.(node)).length,
      regularPresent: normalBucket.some((name) => String(name).includes(regularLocation)),
      regular2Present: normalBucket.some((name) => String(name).includes(regularLocation2)),
      bossPresentInRegularBucket: normalBucket.some((name) => String(name).includes(bossLocation) || String(name).includes(victoryLocation)),
      bossPresentInNormal: (block?.innerText || "").includes(bossLocation.replace(/^.+? - /, "")) || (block?.innerText || "").includes(victoryLocation.replace(/^.+? - /, "")),
      bossBucketHasBoss: bossBucket.some((name) => String(name).includes(bossLocation)) && bossBucket.some((name) => String(name).includes(victoryLocation))
    };
    try{
      window.__apBossKeyCount = previousBossReveal.apBossKeyCount;
      window.__prevApBossKeyCount = previousBossReveal.prevApBossKeyCount;
      state.selected = previousBossReveal.selected;
      const keys = window.bossKeysState || bossKeysState;
      if(Array.isArray(keys) && Array.isArray(previousBossReveal.bossKeys)){
        keys.forEach((key, keyIndex) => {
          if(key && previousBossReveal.bossKeys[keyIndex]){
            Object.assign(key, previousBossReveal.bossKeys[keyIndex]);
          }
        });
      }
    }catch(_){}
    return result;
  }, {
    tableName: BOSS_ROUTING_TABLE,
    regularLocation: BOSS_ROUTING_REGULAR_LOCATION,
    regularLocation2: BOSS_ROUTING_REGULAR_LOCATION_2,
    bossLocation: BOSS_ROUTING_BOSS_LOCATION,
    victoryLocation: BOSS_ROUTING_VICTORY_LOCATION
  });
  if(
    bossRoutingProbe.normalExplicitBossCount !== 0 ||
    !bossRoutingProbe.regularPresent ||
    !bossRoutingProbe.regular2Present ||
    bossRoutingProbe.bossPresentInRegularBucket ||
    bossRoutingProbe.bossPresentInNormal ||
    !bossRoutingProbe.bossBucketHasBoss ||
    bossRoutingProbe.bossDerivedAttackCount !== 10 ||
    !bossRoutingProbe.bossDerivedHasVictory ||
    !bossRoutingProbe.bossDerivedLabels.some((label) => /Skill Shot/i.test(label)) ||
    bossRoutingProbe.bossDerivedLabels.filter((label) => /score/i.test(label)).length < 6 ||
    !bossRoutingProbe.bossDamageValues.every((value) => value >= 7 && value <= 22) ||
    new Set(bossRoutingProbe.bossDamageValues).size < 2 ||
    bossRoutingProbe.bossCards.filter((card) => !card.hidden).length !== 10 ||
    !bossRoutingProbe.bossCards.filter((card) => !card.hidden).every((card) => card.subtag && /DAMAGE; \d+%/.test(card.small)) ||
    !bossRoutingProbe.bossCards.some((card) => card.hidden && card.isVictory) ||
    bossRoutingProbe.bossDerivedLabels.some((label) => /Generic Boss Slot|Boss Damage 16%/i.test(label)) ||
    !/Skill Shot/i.test(bossRoutingProbe.bossBlockText || "")
  ){
    throw new Error(`Boss-table checks leaked into regular table checks: ${JSON.stringify(bossRoutingProbe)}`);
  }

  const bossPhase2MusicProbe = await page.evaluate(async () => {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const previous = {
      bossTable: state.bossTable,
      bossHpLive: { ...(state.bossHpLive || {}) },
      bossHpTest: { ...(state.bossHpTest || {}) },
      bossWorldLocked: state.worlds?.boss?.locked,
      bossBalls: [state.balls?.["boss|0|1"], state.balls?.["boss|0|2"], state.balls?.["boss|0|3"]],
      musicRefs: { ...(state.musicRefs || {}) },
      musicRefreshScenario: typeof musicRefreshScenario === "function" ? musicRefreshScenario : null,
      musicCrossfadeToScenario: typeof musicCrossfadeToScenario === "function" ? musicCrossfadeToScenario : null,
      damageSeen: window.__bossDamageSeen instanceof Set ? new Set(window.__bossDamageSeen) : null,
      apBossKeyCount: window.__apBossKeyCount,
      prevApBossKeyCount: window.__prevApBossKeyCount,
      bossKeys: Array.isArray(window.bossKeysState || bossKeysState)
        ? (window.bossKeysState || bossKeysState).map((key) => key ? { ...key } : key)
        : null
    };
    const calls = [];
    try{
      state.bossTable = "Vector Test Table";
      if(state.worlds?.boss) state.worlds.boss.locked = false;
      const bossRequired = typeof getBossKeysRequiredForOpen === "function" ? Number(getBossKeysRequiredForOpen()) || 3 : 3;
      window.__apBossKeyCount = bossRequired;
      window.__prevApBossKeyCount = bossRequired;
      try{
        const keys = window.bossKeysState || bossKeysState;
        if(Array.isArray(keys)){
          keys.forEach((key, keyIndex) => {
            if(key) key.acquired = keyIndex < bossRequired;
          });
        }
        if(typeof bossKeysSyncLegacyMirror === "function") bossKeysSyncLegacyMirror(bossRequired);
      }catch(_){}
      state.balls = state.balls || {};
      state.balls["boss|0|1"] = true;
      state.balls["boss|0|2"] = true;
      state.balls["boss|0|3"] = true;
      state.bossHpLive = { max:100, cur:60, name:"Vector Test Table", inited:true };
      state.bossHpTest = { ...(state.bossHpTest || {}), show:true, max:100, cur:60, name:"Vector Test Table", forceShowCard:false };
      state.musicRefs = { ...(state.musicRefs || {}), boss_battle_beginning:"data:audio/mp3;base64,AA==", boss_battle_phase2:"data:audio/mp3;base64,AA==" };
      const mgr = typeof musicEnsureManager === "function" ? musicEnsureManager() : (window.__flprMusic ||= {});
      mgr.current = "boss_battle_beginning";
      mgr.currentUrl = "phase1-test";
      mgr.crossfadeTarget = "";
      mgr.audio = { paused:false, volume:1, pause(){ this.paused = true; } };
      musicRefreshScenario = function standalonePhaseMusicRefreshProbe(){};
      window.musicRefreshScenario = musicRefreshScenario;
      musicCrossfadeToScenario = function standalonePhaseMusicCrossfadeProbe(name, opts){
        calls.push({ name, durationMs: opts?.durationMs || 0, force: !!opts?.force });
        mgr.crossfadeTarget = name;
        return true;
      };
      window.musicCrossfadeToScenario = musicCrossfadeToScenario;
      if(window.__bossDamageSeen instanceof Set) window.__bossDamageSeen.delete("standalone-phase2-music-test");
      if(typeof bossApplyDamagePct === "function"){
        bossApplyDamagePct(20, "standalone-phase2-music-test", { fromCheck:true, sourceLabel:"Phase Music Test" });
      }
      await delay(80);
      return {
        hpPct: Math.round((Number(state.bossHpLive.cur || 0) / Math.max(1, Number(state.bossHpLive.max || 100))) * 100),
        calls,
        phaseState: window.__flprStandaloneBossPhase2MusicState || null
      };
    }finally{
      state.bossTable = previous.bossTable;
      state.bossHpLive = previous.bossHpLive;
      state.bossHpTest = previous.bossHpTest;
      if(state.worlds?.boss) state.worlds.boss.locked = previous.bossWorldLocked;
      if(previous.bossBalls[0] === undefined) delete state.balls["boss|0|1"]; else state.balls["boss|0|1"] = previous.bossBalls[0];
      if(previous.bossBalls[1] === undefined) delete state.balls["boss|0|2"]; else state.balls["boss|0|2"] = previous.bossBalls[1];
      if(previous.bossBalls[2] === undefined) delete state.balls["boss|0|3"]; else state.balls["boss|0|3"] = previous.bossBalls[2];
      state.musicRefs = previous.musicRefs;
      if(previous.musicRefreshScenario) { musicRefreshScenario = previous.musicRefreshScenario; window.musicRefreshScenario = previous.musicRefreshScenario; }
      if(previous.musicCrossfadeToScenario) { musicCrossfadeToScenario = previous.musicCrossfadeToScenario; window.musicCrossfadeToScenario = previous.musicCrossfadeToScenario; }
      if(previous.damageSeen) window.__bossDamageSeen = previous.damageSeen;
      window.__apBossKeyCount = previous.apBossKeyCount;
      window.__prevApBossKeyCount = previous.prevApBossKeyCount;
      try{
        const keys = window.bossKeysState || bossKeysState;
        if(Array.isArray(keys) && Array.isArray(previous.bossKeys)){
          keys.forEach((key, keyIndex) => {
            if(key && previous.bossKeys[keyIndex]){
              Object.assign(key, previous.bossKeys[keyIndex]);
            }
          });
        }
      }catch(_){}
    }
  });
  if(
    bossPhase2MusicProbe.hpPct !== 40 ||
    !bossPhase2MusicProbe.calls.some((call) => call.name === "boss_battle_phase2" && call.durationMs >= 3000 && call.force) ||
    !bossPhase2MusicProbe.phaseState?.crossed ||
    bossPhase2MusicProbe.phaseState?.pct !== 40
  ){
    throw new Error(`Boss phase 2 music did not crossfade after boss damage crossed 50%: ${JSON.stringify(bossPhase2MusicProbe)}`);
  }

  const lockedBossMusicSuppressionProbe = await page.evaluate(() => {
    const previous = {
      activeView: String(activeView || ""),
      selected: state?.selected,
      currentWorld: ap?.currentWorld,
      bossTable: state?.bossTable,
      bossOpen: state?.bossOpen,
      bossHpLive: { ...(state.bossHpLive || {}) },
      bossHpTest: { ...(state.bossHpTest || {}) },
      bossWorldLocked: state.worlds?.boss?.locked,
      musicRefs: { ...(state.musicRefs || {}) },
      musicPlayScenario: typeof musicPlayScenario === "function" ? musicPlayScenario : null,
      musicStop: typeof musicStop === "function" ? musicStop : null,
      apBossKeyCount: window.__apBossKeyCount,
      prevApBossKeyCount: window.__prevApBossKeyCount,
      bossKeys: Array.isArray(window.bossKeysState || bossKeysState)
        ? (window.bossKeysState || bossKeysState).map((key) => key ? { ...key } : key)
        : null
    };
    const calls = [];
    const stops = [];
    try{
      activeView = "tower";
      state.selected = "w1";
      ap.currentWorld = "w1";
      state.bossTable = "Vector Test Table";
      state.bossOpen = false;
      if(state.worlds?.boss) state.worlds.boss.locked = true;
      window.__apBossKeyCount = 0;
      window.__prevApBossKeyCount = 0;
      try{
        const keys = window.bossKeysState || bossKeysState;
        if(Array.isArray(keys)){
          keys.forEach((key) => { if(key) key.acquired = false; });
        }
        if(typeof bossKeysSyncLegacyMirror === "function") bossKeysSyncLegacyMirror(0);
      }catch(_){}
      state.bossHpLive = { max:100, cur:40, name:"Vector Test Table", inited:true };
      state.bossHpTest = { ...(state.bossHpTest || {}), show:false, max:100, cur:40, name:"Vector Test Table", forceShowCard:false };
      state.musicRefs = { ...(state.musicRefs || {}), boss_battle_beginning:"data:audio/mp3;base64,AA==", boss_battle_phase2:"data:audio/mp3;base64,AA==" };
      const mgr = typeof musicEnsureManager === "function" ? musicEnsureManager() : (window.__flprMusic ||= {});
      mgr.lockedUntil = 0;
      mgr.current = "boss_battle_beginning";
      mgr.currentUrl = "locked-boss-test";
      mgr.crossfadeTarget = "";
      mgr.crossfadeAudio = null;
      mgr.audio = { paused:false, volume:1, pause(){ this.paused = true; }, removeAttribute(){}, load(){} };
      musicPlayScenario = function lockedBossMusicPlayProbe(name, opts){
        calls.push({ name, forceStopIfMissing: !!opts?.forceStopIfMissing });
        mgr.current = String(name || "");
        mgr.currentUrl = `${String(name || "")}-locked-boss-test`;
        return true;
      };
      window.musicPlayScenario = musicPlayScenario;
      musicStop = function lockedBossMusicStopProbe(opts){
        stops.push({ clearSrc: !!opts?.clearSrc });
        mgr.current = "";
        mgr.currentUrl = "";
        if(mgr.audio) mgr.audio.paused = true;
      };
      window.musicStop = musicStop;
      if(typeof musicRefreshScenario === "function") musicRefreshScenario();
      return {
        calls,
        stops,
        current: String(mgr.current || ""),
        bossOpen: typeof musicIsBossTableOpenForPlayback === "function" ? !!musicIsBossTableOpenForPlayback() : null,
        shouldPlayBoss: typeof musicShouldPlayBossBattle === "function" ? !!musicShouldPlayBossBattle(40) : null
      };
    }finally{
      activeView = previous.activeView;
      state.selected = previous.selected;
      ap.currentWorld = previous.currentWorld;
      state.bossTable = previous.bossTable;
      state.bossOpen = previous.bossOpen;
      state.bossHpLive = previous.bossHpLive;
      state.bossHpTest = previous.bossHpTest;
      if(state.worlds?.boss) state.worlds.boss.locked = previous.bossWorldLocked;
      state.musicRefs = previous.musicRefs;
      if(previous.musicPlayScenario) { musicPlayScenario = previous.musicPlayScenario; window.musicPlayScenario = previous.musicPlayScenario; }
      if(previous.musicStop) { musicStop = previous.musicStop; window.musicStop = previous.musicStop; }
      window.__apBossKeyCount = previous.apBossKeyCount;
      window.__prevApBossKeyCount = previous.prevApBossKeyCount;
      try{
        const keys = window.bossKeysState || bossKeysState;
        if(Array.isArray(keys) && Array.isArray(previous.bossKeys)){
          keys.forEach((key, keyIndex) => {
            if(key && previous.bossKeys[keyIndex]) Object.assign(key, previous.bossKeys[keyIndex]);
          });
        }
      }catch(_){}
    }
  });
  if(
    lockedBossMusicSuppressionProbe.bossOpen !== false ||
    lockedBossMusicSuppressionProbe.shouldPlayBoss !== false ||
    lockedBossMusicSuppressionProbe.calls.some((call) => /^boss_battle/.test(String(call.name || ""))) ||
    /^boss_battle/.test(String(lockedBossMusicSuppressionProbe.current || ""))
  ){
    throw new Error(`Locked boss HP still triggered boss battle music: ${JSON.stringify(lockedBossMusicSuppressionProbe)}`);
  }

  const bossVictoryAutoAwardProbe = await page.evaluate((params) => {
    const tableName = params.tableName || "Vector Test Table";
    const directId = 3931;
    const autoId = 3932;
    const victoryId = 3939;
    const storeKey = "flpr_standalone_boss_victory_auto_checks_v1";
    const previous = {
      checked: [directId, autoId, victoryId].map((id) => [id, !!ap?.checked?.has?.(id)]),
      pending: [directId, autoId, victoryId].map((id) => [id, ap?.pendingByLoc?.get?.(id)]),
      locById: [directId, autoId, victoryId].map((id) => [id, ap?.locById?.get?.(id)]),
      locNameById: [directId, autoId, victoryId].map((id) => [id, ap?.locNameById?.get?.(id)]),
      autoStoreRaw: localStorage.getItem(storeKey),
      achievementStore: (() => { try { return JSON.stringify(achStore || {}); } catch (_) { return ""; } })(),
      flprRun: (() => { try { return JSON.stringify(flprStats?.currentRun || null); } catch (_) { return ""; } })(),
      bossVictorySent: !!state?.bossVictorySent,
      bossVictoryPending: !!state?.bossVictoryPending,
      bossVictoryFinalizing: !!state?.bossVictoryFinalizing,
      bossTable: state?.bossTable
    };
    const bossKey = (() => {
      try { return normKey("Boss Table"); } catch (_) { return "bosstable"; }
    })();
    const makeNode = (id, full, short) => ({
      id,
      full,
      short,
      tableName: "Boss Table",
      tableCode: "BOSS_TABLE",
      tableKey: bossKey,
      standaloneBossCheck: true
    });
    const directNode = makeNode(directId, `Boss Table - ${tableName} Direct Pending Hit`, `${tableName} Direct Pending Hit`);
    const autoNode = makeNode(autoId, `Boss Table - ${tableName} Cleanup Hit`, `${tableName} Cleanup Hit`);
    const victoryNode = makeNode(victoryId, "Boss Table - Boss Victory", "Boss Victory");
    const upsertNode = (node) => {
      ap.locById.set(node.id, node);
      ap.locNameById.set(node.id, node.full);
      if(!ap.locsByTableKey.has(bossKey)) ap.locsByTableKey.set(bossKey, []);
      const list = ap.locsByTableKey.get(bossKey);
      const idx = list.findIndex((existing) => Number(existing?.id) === Number(node.id));
      if(idx >= 0) list[idx] = node;
      else list.push(node);
    };
    const restore = () => {
      try{
        [directId, autoId, victoryId].forEach((id) => {
          const checked = previous.checked.find((entry) => entry[0] === id)?.[1];
          if(checked) ap.checked.add(id);
          else ap.checked.delete(id);
          const pendingEntry = previous.pending.find((entry) => entry[0] === id);
          if(pendingEntry && pendingEntry[1]) ap.pendingByLoc.set(id, pendingEntry[1]);
          else ap.pendingByLoc.delete(id);
          const locEntry = previous.locById.find((entry) => entry[0] === id);
          if(locEntry && locEntry[1]) ap.locById.set(id, locEntry[1]);
          else ap.locById.delete(id);
          const nameEntry = previous.locNameById.find((entry) => entry[0] === id);
          if(nameEntry && nameEntry[1]) ap.locNameById.set(id, nameEntry[1]);
          else ap.locNameById.delete(id);
        });
        const list = ap.locsByTableKey.get(bossKey);
        if(Array.isArray(list)){
          ap.locsByTableKey.set(bossKey, list.filter((node) => ![directId, autoId, victoryId].includes(Number(node?.id))));
          previous.locById.forEach(([id, node]) => {
            if(node && String(node.tableKey || "") === bossKey){
              const current = ap.locsByTableKey.get(bossKey) || [];
              if(!current.some((existing) => Number(existing?.id) === Number(id))) current.push(node);
              ap.locsByTableKey.set(bossKey, current);
            }
          });
        }
        if(previous.autoStoreRaw == null) localStorage.removeItem(storeKey);
        else localStorage.setItem(storeKey, previous.autoStoreRaw);
        window.__flprStandaloneBossVictoryAutoChecks = null;
        if(previous.achievementStore){
          const restoredAch = JSON.parse(previous.achievementStore);
          achStore = restoredAch;
          window.flprAchievementStore = restoredAch;
          localStorage.setItem("flpr_achievements_v1", previous.achievementStore);
        }
        if(previous.flprRun && typeof flprStats === "object" && flprStats){
          flprStats.currentRun = JSON.parse(previous.flprRun);
        }
        state.bossVictorySent = previous.bossVictorySent;
        state.bossVictoryPending = previous.bossVictoryPending;
        state.bossVictoryFinalizing = previous.bossVictoryFinalizing;
        state.bossTable = previous.bossTable;
      }catch(_){}
    };
    try{
      if(typeof window.flprStandaloneClearBossVictoryAutoChecksForTest === "function"){
        window.flprStandaloneClearBossVictoryAutoChecksForTest();
      }
      [directId, autoId, victoryId].forEach((id) => {
        ap.checked.delete(id);
        ap.pendingByLoc?.delete?.(id);
      });
      upsertNode(directNode);
      upsertNode(autoNode);
      upsertNode(victoryNode);
      state.bossTable = tableName;
      state.bossVictorySent = false;
      state.bossVictoryPending = false;
      state.bossVictoryFinalizing = false;
      ap.pendingByLoc = ap.pendingByLoc || new Map();
      ap.pendingQueue = Array.isArray(ap.pendingQueue) ? ap.pendingQueue : [];
      ap.pendingByLoc.set(directId, { id:directId, sentAt:Date.now(), isBossCheck:true, locationName:directNode.full });
      ap.pendingQueue.push({ id:directId, sentAt:Date.now(), isBossCheck:true, locationName:directNode.full });
      const preDetect = typeof window.flprStandaloneDetectBossVictoryAutoIdsForTest === "function"
        ? window.flprStandaloneDetectBossVictoryAutoIdsForTest([victoryId, directId, autoId], { awardAchievements:true, source:"room-update" })
        : null;
      const preDebug = typeof window.flprStandaloneBossVictoryAutoDebugForTest === "function"
        ? window.flprStandaloneBossVictoryAutoDebugForTest([victoryId, directId, autoId], { awardAchievements:true, source:"room-update" })
        : null;
      if(typeof handleCheckedLocations === "function"){
        handleCheckedLocations([victoryId, directId, autoId], { awardAchievements:true, source:"room-update" });
      }
      const autoState = typeof window.flprStandaloneBossVictoryAutoCheckState === "function"
        ? window.flprStandaloneBossVictoryAutoCheckState()
        : null;
      const checkedLocMap = flprStats?.currentRun?.checkedLocMap || {};
      const directContext = typeof achGetContextForLocId === "function" ? achGetContextForLocId(directId) : null;
      const autoContext = typeof achGetContextForLocId === "function" ? achGetContextForLocId(autoId) : null;
      const result = {
        preDetect,
        preDebug,
        handleFilter: !!(handleCheckedLocations && handleCheckedLocations.__flprStandaloneBossVictoryAwardFilter),
        statsFilter: !!(flprStatsRecordCheckClearedByLocId && flprStatsRecordCheckClearedByLocId.__flprStandaloneBossVictoryAwardFilter),
        achContextFilter: !!(achGetContextForLocId && achGetContextForLocId.__flprStandaloneBossVictoryAwardFilter),
        autoDetect: typeof window.flprStandaloneDetectBossVictoryAutoIdsForTest === "function"
          ? window.flprStandaloneDetectBossVictoryAutoIdsForTest([victoryId, directId, autoId], { awardAchievements:true, source:"room-update" })
          : null,
        checkedDirect: !!ap.checked.has(directId),
        checkedAuto: !!ap.checked.has(autoId),
        checkedVictory: !!ap.checked.has(victoryId),
        autoIds: autoState?.ids || [],
        split: autoState?.lastSplit || null,
        checkedLocDirect: !!checkedLocMap[directId],
        checkedLocAuto: !!checkedLocMap[autoId],
        directContext: !!directContext,
        autoContext: !!autoContext,
        lastSkip: autoState?.lastSkip || null
      };
      restore();
      return result;
    }catch(err){
      const result = { error:String(err?.message || err) };
      restore();
      return result;
    }
  }, { tableName: BOSS_ROUTING_TABLE });
  if(
    bossVictoryAutoAwardProbe.error ||
    !bossVictoryAutoAwardProbe.checkedDirect ||
    !bossVictoryAutoAwardProbe.checkedAuto ||
    !bossVictoryAutoAwardProbe.checkedVictory ||
    !bossVictoryAutoAwardProbe.autoIds.includes(3932) ||
    bossVictoryAutoAwardProbe.autoIds.includes(3931) ||
    bossVictoryAutoAwardProbe.autoIds.includes(3939) ||
    !bossVictoryAutoAwardProbe.checkedLocDirect ||
    bossVictoryAutoAwardProbe.checkedLocAuto ||
    !bossVictoryAutoAwardProbe.directContext ||
    bossVictoryAutoAwardProbe.autoContext
  ){
    throw new Error(`Boss victory auto-completed checks still qualified for stats/achievements: ${JSON.stringify(bossVictoryAutoAwardProbe)}`);
  }

  await page.evaluate(() => {
    if(typeof showApSentItemToast === "function"){
      showApSentItemToast({
        key: "test-first-sent-modal-fresh",
        ts: Date.now(),
        time: "TEST",
        itemId: 370001,
        locId: 3021,
        senderId: 1,
        receiverId: 3,
        itemName: "Ethereal Crossbow",
        serverItemName: "Ethereal Crossbow",
        locationName: "Vector Test Table - Loop Champ",
        receiverPlayer: "HereticP2",
        receiverGame: "Heretic",
        senderPlayer: "AshodinNoTrap",
        senderGame: "Manual_FlippermizerBaseGame_Ashodin",
        flags: 1
      }, { holdMs: 3200 });
    }
  });
  await waitFor(page, `
    const title = document.querySelector('#ovModal:not(.hidden) #ovModalTitle')?.innerText || '';
    const sentCornerToast = Array.from(document.querySelectorAll('#toastWrap .apItemToast')).some((node) => /SENT/.test(node.innerText || ''));
    return /SENT/.test(title) && !sentCornerToast;
  `, 7000);
  const firstSentModalProbe = await page.evaluate(`
    (() => ({
      item: document.querySelector('#ovModal:not(.hidden) #ovModalBig')?.innerText || '',
      target: document.querySelector('#ovModal:not(.hidden) #ovModalSub')?.innerText || ''
    }))()
  `);
  if(firstSentModalProbe.target.includes("Unknown Game") || (firstSentModalProbe.item.includes("Ethereal Crossbow") && !firstSentModalProbe.target.includes("HereticP2 (Heretic)"))){
    throw new Error(`Sent item modal target did not include game metadata: ${JSON.stringify(firstSentModalProbe)}`);
  }
  const progressiveChecksRewardProbe = await page.evaluate(async () => {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const targetKey = typeof getTableKeyForName === "function" ? (getTableKeyForName("Corvette") || "") : "";
    const parts = String(targetKey || "").split("|");
    const worldKey = String(parts[0] || "");
    const idx = Number(parts[1]);
    if(typeof closeOverviewModal === "function") closeOverviewModal();
    if(!worldKey || !Number.isFinite(idx)) return { missingTarget:true, targetKey };
    state.balls = state.balls || {};
    state.nowPlaying = state.nowPlaying || {};
    state.balls[`${targetKey}|1`] = true;
    state.nowPlaying[worldKey] = idx;
    state.selected = worldKey;
    ap.currentWorld = worldKey;
    if(typeof showView === "function") showView("checks");
    else { activeView = "checks"; if(typeof setTabUI === "function") setTabUI(); }
    if(typeof renderChecksWorldTabs === "function") renderChecksWorldTabs();
    if(typeof renderChecks === "function") renderChecks();
    await delay(100);
    const before = {
      activeView: String(activeView || ""),
      activeKey: document.querySelector("#checksBody .tableBlock.nowPlayingChecks")?.getAttribute("data-tablekey") || "",
      order: Array.from(document.querySelectorAll("#checksBody .tableBlock")).map((node) => node.getAttribute("data-tablekey") || "")
    };
    if(typeof runProgressiveBallFlow === "function"){
      runProgressiveBallFlow("Corvette", {
        holdMs: 900,
        modalMeta: "CHECK; Corvette - Easy Score (55,946,756+)"
      });
    }
    await delay(920);
    const during = {
      activeView: String(activeView || ""),
      activeKey: document.querySelector("#checksBody .tableBlock.nowPlayingChecks")?.getAttribute("data-tablekey") || "",
      modalTitle: document.querySelector("#ovModal:not(.hidden) #ovModalTitle")?.innerText || "",
      modalBig: document.querySelector("#ovModal:not(.hidden) #ovModalBig")?.innerText || "",
      overviewCard: !!document.querySelector("#pballCenterAnim, .pballZoomCard"),
      swapGhost: !!document.querySelector("#checksBody.checksDrawerAnim, .checksSwapGhost"),
      bridge: window.__flprStandaloneProgressiveChecksReward || null
    };
    await delay(2600);
    const card = {
      activeView: String(activeView || ""),
      visible: !!document.querySelector("#pballCenterAnim, .pballZoomCard"),
      text: document.querySelector("#pballCenterAnim, .pballZoomCard")?.innerText || ""
    };
    await delay(4000);
    const after = {
      activeView: String(activeView || ""),
      activeKey: document.querySelector("#checksBody .tableBlock.nowPlayingChecks")?.getAttribute("data-tablekey") || "",
      order: Array.from(document.querySelectorAll("#checksBody .tableBlock")).map((node) => node.getAttribute("data-tablekey") || ""),
      overviewCard: !!document.querySelector("#pballCenterAnim, .pballZoomCard"),
      swapGhost: !!document.querySelector("#checksBody.checksDrawerAnim, .checksSwapGhost")
    };
    if(typeof closeOverviewModal === "function") closeOverviewModal();
    return { targetKey, before, during, card, after };
  });
  if(
    progressiveChecksRewardProbe.missingTarget ||
    !progressiveChecksRewardProbe.before?.activeKey ||
    progressiveChecksRewardProbe.during?.activeView !== "overview" ||
    progressiveChecksRewardProbe.card?.activeView !== "overview" ||
    progressiveChecksRewardProbe.after?.activeView !== "checks" ||
    progressiveChecksRewardProbe.during?.activeKey !== progressiveChecksRewardProbe.before?.activeKey ||
    progressiveChecksRewardProbe.after?.activeKey !== progressiveChecksRewardProbe.before?.activeKey ||
    !/ITEM RECEIVED/i.test(progressiveChecksRewardProbe.during?.modalTitle || "") ||
    !/Progressive Ball - Corvette/i.test(progressiveChecksRewardProbe.during?.modalBig || "") ||
    progressiveChecksRewardProbe.during?.overviewCard ||
    !progressiveChecksRewardProbe.card?.visible ||
    !/Corvette/i.test(progressiveChecksRewardProbe.card?.text || "") ||
    progressiveChecksRewardProbe.after?.overviewCard ||
    progressiveChecksRewardProbe.during?.swapGhost ||
    progressiveChecksRewardProbe.after?.swapGhost ||
    progressiveChecksRewardProbe.before?.order?.join("|") !== progressiveChecksRewardProbe.after?.order?.join("|") ||
    progressiveChecksRewardProbe.during?.bridge?.stayedOnChecks !== false
  ){
    throw new Error(`Own Progressive Ball reward did not run the Overview collection animation and return to Checks: ${JSON.stringify(progressiveChecksRewardProbe)}`);
  }

  const selfItemSendProgressiveProbe = await page.evaluate(async () => {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const targetKey = typeof getTableKeyForName === "function" ? (getTableKeyForName("Corvette") || "") : "";
    const parts = String(targetKey || "").split("|");
    const worldKey = String(parts[0] || "");
    const idx = Number(parts[1]);
    const self = Number(ap?.slot || 1) || 1;
    const locId = 987654321;
    const touched = [];
    const rememberBall = (key) => {
      if(touched.some((entry) => entry.key === key)) return;
      touched.push({
        key,
        had: Object.prototype.hasOwnProperty.call(state.balls || {}, key),
        value: state.balls?.[key]
      });
    };
    const levelFor = () => targetKey ? (
      state?.balls?.[`${targetKey}|3`] ? 3 :
      state?.balls?.[`${targetKey}|2`] ? 2 :
      state?.balls?.[`${targetKey}|1`] ? 1 : 0
    ) : 0;
    if(!targetKey || !worldKey || !Number.isFinite(idx)) return { missingTarget:true, targetKey };
    let result = null;
    try{
      state.balls = state.balls || {};
      state.nowPlaying = state.nowPlaying || {};
      [1, 2, 3].forEach((ball) => rememberBall(`${targetKey}|${ball}`));
      const beforeLevel = levelFor();
      state.nowPlaying[worldKey] = idx;
      state.selected = worldKey;
      ap.currentWorld = worldKey;
      if(typeof closeOverviewModal === "function") closeOverviewModal();
      if(typeof showView === "function") showView("checks");
      else { activeView = "checks"; if(typeof setTabUI === "function") setTabUI(); }
      if(typeof renderChecksWorldTabs === "function") renderChecksWorldTabs();
      if(typeof renderChecks === "function") renderChecks();
      await delay(120);
      const beforeKey = document.querySelector("#checksBody .tableBlock.nowPlayingChecks")?.getAttribute("data-tablekey") || "";
      if(typeof showApSentItemToast === "function"){
        showApSentItemToast({
          senderId:self,
          receiverId:self,
          itemId:1008,
          locId,
          flags:1,
          itemName:"Progressive Ball - Corvette",
          locationName:"Self Progressive Ball Test",
          senderPlayer: typeof apPlayerName === "function" ? apPlayerName(self, "AshodinNoTrap") : "AshodinNoTrap",
          receiverPlayer: typeof apPlayerName === "function" ? apPlayerName(self, "AshodinNoTrap") : "AshodinNoTrap",
          senderGame: typeof apPlayerGame === "function" ? apPlayerGame(self, "Manual_FlippermizerBaseGame_Ashodin") : "Manual_FlippermizerBaseGame_Ashodin",
          receiverGame: typeof apPlayerGame === "function" ? apPlayerGame(self, "Manual_FlippermizerBaseGame_Ashodin") : "Manual_FlippermizerBaseGame_Ashodin"
        });
      }
      await delay(920);
      const during = {
        activeView: String(activeView || ""),
        title: document.querySelector("#ovModal:not(.hidden) #ovModalTitle")?.innerText || "",
        big: document.querySelector("#ovModal:not(.hidden) #ovModalBig")?.innerText || ""
      };
      await delay(3400);
      const card = {
        activeView: String(activeView || ""),
        visible: !!document.querySelector("#pballCenterAnim, .pballZoomCard"),
        text: document.querySelector("#pballCenterAnim, .pballZoomCard")?.innerText || ""
      };
      await delay(4200);
      result = {
        missingTarget:false,
        targetKey,
        beforeKey,
        beforeLevel,
        afterLevel: levelFor(),
        activeView: String(activeView || ""),
        activeKey: document.querySelector("#checksBody .tableBlock.nowPlayingChecks")?.getAttribute("data-tablekey") || "",
        during,
        card,
        receivedStored: (ap?.receivedAll || []).some((row) => Number(row?.locId) === locId),
        selfApplyDebug: window.__flprStandaloneLastSelfProgressiveApply || null,
        directApplyDebug: window.__flprStandaloneLastSelfProgressiveDirectApply || null,
        rowDebug: window.__flprStandaloneLastOwnProgressiveRow || null,
        receivedTail: (ap?.receivedAll || []).slice(-4)
      };
    }finally{
      try{
        touched.reverse().forEach((entry) => {
          if(entry.had) state.balls[entry.key] = entry.value;
          else delete state.balls[entry.key];
        });
        const list = (ap.receivedAll || []).filter((row) => Number(row?.locId) !== locId);
        ap.receivedAll = list;
        ap.receivedKeySet = new Set(list.map((row) => row?.recvIndex != null ? ("idx:" + row.recvIndex) : ((row?.itemName || "") + "|" + (row?.locationName || ""))));
        saveReceivedList(list);
        renderReceivedList(list);
        if(typeof closeOverviewModal === "function") closeOverviewModal();
        if(typeof renderChecksWorldTabs === "function") renderChecksWorldTabs();
        if(typeof renderChecks === "function") renderChecks();
      }catch(_){}
    }
    return result;
  });
  if(
    selfItemSendProgressiveProbe.missingTarget ||
    !["overview", "checks"].includes(String(selfItemSendProgressiveProbe.during?.activeView || "")) ||
    !/ITEM RECEIVED/i.test(selfItemSendProgressiveProbe.during?.title || "") ||
    !/Progressive Ball - Corvette/i.test(selfItemSendProgressiveProbe.during?.big || "") ||
    selfItemSendProgressiveProbe.card?.activeView !== "overview" ||
    !selfItemSendProgressiveProbe.card?.visible ||
    !/Corvette/i.test(selfItemSendProgressiveProbe.card?.text || "") ||
    selfItemSendProgressiveProbe.activeView !== "checks" ||
    selfItemSendProgressiveProbe.activeKey !== (selfItemSendProgressiveProbe.beforeKey || selfItemSendProgressiveProbe.targetKey) ||
    Number(selfItemSendProgressiveProbe.afterLevel || 0) < Math.min(3, Number(selfItemSendProgressiveProbe.beforeLevel || 0) + 1) ||
    !selfItemSendProgressiveProbe.selfApplyDebug?.ensuredRow
  ){
    throw new Error(`Self ItemSend Progressive Ball did not use the normal Overview collection pipeline: ${JSON.stringify(selfItemSendProgressiveProbe)}`);
  }

  const progressiveSiegePipelineProbe = await page.evaluate(async () => {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const previousIntroMs = window.__flprStandaloneSiegeIntroMs;
    window.__flprStandaloneSiegeIntroMs = 1600;
    if(typeof besiegedClear === "function") besiegedClear("test-reset");
    window.__flprLastSiegeStartCinematic = null;
    if(typeof closeOverviewModal === "function") closeOverviewModal();
    const targetKey = typeof getTableKeyForName === "function" ? (getTableKeyForName("Corvette") || "") : "";
    const parts = String(targetKey || "").split("|");
    const worldKey = String(parts[0] || "");
    const idx = Number(parts[1]);
    const nonBossWorlds = Object.keys(state?.worlds || {}).filter((wk) => {
      try { return !isBossWorldId(wk, state) && Array.isArray(state.worlds[wk]?.tables) && state.worlds[wk].tables.length !== 0; } catch (_) { return false; }
    });
    const siegeWorld = nonBossWorlds[0] || worldKey || "w1";
    const siegeIdx = 0;
    const siegeKey = `${siegeWorld}|${siegeIdx}`;
    const siegeName = String(state?.worlds?.[siegeWorld]?.tables?.[siegeIdx] || "Queued Progressive Siege");
    if(!worldKey || !Number.isFinite(idx)) return { missingTarget:true, targetKey };
    state.balls = state.balls || {};
    state.nowPlaying = state.nowPlaying || {};
    state.balls[`${targetKey}|1`] = true;
    state.balls[`${siegeKey}|1`] = true;
    state.nowPlaying[worldKey] = idx;
    state.nowPlaying[siegeWorld] = siegeIdx;
    state.selected = worldKey;
    ap.currentWorld = worldKey;
    if(typeof showView === "function") showView("checks");
    else { activeView = "checks"; if(typeof setTabUI === "function") setTabUI(); }
    if(typeof renderChecksWorldTabs === "function") renderChecksWorldTabs();
    if(typeof renderChecks === "function") renderChecks();
    await delay(80);
    if(typeof runProgressiveBallFlow === "function"){
      runProgressiveBallFlow("Corvette", {
        holdMs: 1800,
        modalMeta: "CHECK; Progressive siege pipeline test"
      });
    }
    const queued = typeof besiegedActivate === "function" && besiegedActivate({
      force: true,
      target: {
        worldKey: siegeWorld,
        tableKey: siegeKey,
        tableName: siegeName
      }
    });
    await delay(260);
    const early = {
      queued: !!queued,
      active: typeof besiegedIsActive === "function" ? !!besiegedIsActive() : !!state?.besiegedEvent?.active,
      activeView: String(activeView || ""),
      queueState: typeof window.flprStandaloneSiegeQueueState === "function" ? window.flprStandaloneSiegeQueueState() : null,
      bridge: window.__flprStandaloneProgressiveChecksReward || null
    };
    await delay(900);
    const modal = {
      activeView: String(activeView || ""),
      title: document.querySelector("#ovModal:not(.hidden) #ovModalTitle")?.innerText || "",
      big: document.querySelector("#ovModal:not(.hidden) #ovModalBig")?.innerText || "",
      notice: document.querySelector(".flprStandaloneSiegeIncoming")?.textContent || "",
      queueState: typeof window.flprStandaloneSiegeQueueState === "function" ? window.flprStandaloneSiegeQueueState() : null
    };
    const deadline = Date.now() + 8200;
    let intro = null;
    const phaseOrder = [];
    const phaseSamples = [];
    const rectInfo = (node) => {
      if(!node) return null;
      const r = node.getBoundingClientRect();
      return { left:r.left, top:r.top, right:r.right, bottom:r.bottom, width:r.width, height:r.height };
    };
    const scopedToViewport = (node) => {
      const viewport = document.querySelector(".viewport");
      if(!node || !viewport || node.parentElement !== viewport) return false;
      const r = node.getBoundingClientRect();
      const v = viewport.getBoundingClientRect();
      return r.width > 0 && r.height > 0 &&
        r.left >= v.left - 2 &&
        r.top >= v.top - 2 &&
        r.right <= v.right + 2 &&
        r.bottom <= v.bottom + 2;
    };
    while(Date.now() < deadline){
      await delay(80);
      const live = typeof besiegedGetState === "function" ? besiegedGetState() : state?.besiegedEvent;
      const activeIntro = !!document.body.classList.contains("flprStandaloneSiegeIntroActive");
      const lastIntro = window.__flprStandaloneLastSiegeIntro || null;
      if(activeIntro || (lastIntro && lastIntro.completed === false)){
        const targetCard = document.querySelector("#selectedBody .pentaCard.besiegedTarget");
        const startOverlay = document.getElementById("flprSiegeStartOverlay");
        const nonTargets = Array.from(document.querySelectorAll("#selectedBody .pentaCard:not(.besiegedTarget)"));
        const targetClass = targetCard?.className || "";
        const hasArmy = /\bflprStandaloneSiegeIntroArmy\b/.test(targetClass);
        const hasCastle = /\bflprStandaloneSiegeIntroCastle\b/.test(targetClass);
        const hasReady = /\bflprStandaloneSiegeIntroReady\b/.test(targetClass);
        [["army", hasArmy], ["castle", hasCastle], ["ready", hasReady]].forEach(([phase, on]) => {
          if(on && !phaseOrder.includes(phase)) phaseOrder.push(phase);
        });
        phaseSamples.push({
          targetClass,
          hasArmy,
          hasCastle,
          hasReady,
          lastIntroPhase: lastIntro?.lastPhase || "",
          lastIntroOrder: Array.isArray(lastIntro?.phaseOrder) ? lastIntro.phaseOrder.slice() : []
        });
        intro = {
          activeIntro,
          activeView: String(activeView || ""),
          tableKey: String(live?.tableKey || ""),
          worldKey: String(live?.worldKey || ""),
          queueState: typeof window.flprStandaloneSiegeQueueState === "function" ? window.flprStandaloneSiegeQueueState() : null,
          targetClass,
          morphAnimations: targetCard?.getAnimations?.().map((animation) => animation.id || animation.animationName || "") || [],
          fadedSiblingCount: nonTargets.filter((node) => Number.parseFloat(getComputedStyle(node).opacity || "1") < 0.16).length,
          phaseOrder: phaseOrder.slice(),
          phaseSamples: phaseSamples.slice(-12),
          startCinematic: window.__flprLastSiegeStartCinematic || null,
          startOverlayVisible: !!startOverlay,
          startOverlayScoped: scopedToViewport(startOverlay),
          startOverlayParent: startOverlay?.parentElement?.className || "",
          startOverlayRect: rectInfo(startOverlay),
          viewportRect: rectInfo(document.querySelector(".viewport")),
          lastIntro
        };
        if(hasCastle || phaseSamples.length >= 16) break;
      }
    }
    await delay(1120);
    const liveAfter = typeof besiegedGetState === "function" ? besiegedGetState() : state?.besiegedEvent;
    const btn = document.querySelector("#selectedBody .pentaCard.besiegedTarget .besiegedTargetBtn");
    const after = {
      active: typeof besiegedIsActive === "function" ? !!besiegedIsActive() : !!liveAfter?.active,
      activeView: String(activeView || ""),
      tableKey: String(liveAfter?.tableKey || ""),
      worldKey: String(liveAfter?.worldKey || ""),
      introActive: !!document.body.classList.contains("flprStandaloneSiegeIntroActive"),
      buttonPointer: btn ? getComputedStyle(btn).pointerEvents : "",
      queueState: typeof window.flprStandaloneSiegeQueueState === "function" ? window.flprStandaloneSiegeQueueState() : null
    };
    if(typeof besiegedClear === "function") besiegedClear("test-reset");
    if(typeof closeOverviewModal === "function") closeOverviewModal();
    if(previousIntroMs == null) delete window.__flprStandaloneSiegeIntroMs;
    else window.__flprStandaloneSiegeIntroMs = previousIntroMs;
    return { targetKey, siegeWorld, siegeKey, early, modal, intro, after };
  });
  if(
    progressiveSiegePipelineProbe.missingTarget ||
    !progressiveSiegePipelineProbe.early?.queued ||
    progressiveSiegePipelineProbe.early?.active ||
    progressiveSiegePipelineProbe.early?.queueState?.pending !== true ||
    progressiveSiegePipelineProbe.early?.bridge?.yieldedToSiege !== true ||
    progressiveSiegePipelineProbe.modal?.activeView !== "overview" ||
    !/ITEM RECEIVED/i.test(progressiveSiegePipelineProbe.modal?.title || "") ||
    !/Progressive Ball - Corvette/i.test(progressiveSiegePipelineProbe.modal?.big || "") ||
    !String(progressiveSiegePipelineProbe.modal?.notice || "").includes("SIEGE INCOMING!") ||
    !progressiveSiegePipelineProbe.intro ||
    progressiveSiegePipelineProbe.intro.tableKey !== progressiveSiegePipelineProbe.siegeKey ||
    progressiveSiegePipelineProbe.intro.activeView !== "tower" ||
    !progressiveSiegePipelineProbe.intro.morphAnimations?.includes("flprStandaloneSiegeTargetMorph") ||
    Number(progressiveSiegePipelineProbe.intro.fadedSiblingCount || 0) < 4 ||
    !progressiveSiegePipelineProbe.intro.lastIntro?.morph ||
    Number(progressiveSiegePipelineProbe.intro.lastIntro?.morph?.sx || 1) >= 0.92 ||
    Number(progressiveSiegePipelineProbe.intro.lastIntro?.morph?.sy || 1) >= 0.92 ||
    !progressiveSiegePipelineProbe.intro.phaseOrder?.includes("army") ||
    !progressiveSiegePipelineProbe.intro.phaseOrder?.includes("castle") ||
    progressiveSiegePipelineProbe.intro.phaseOrder.indexOf("army") > progressiveSiegePipelineProbe.intro.phaseOrder.indexOf("castle") ||
    !progressiveSiegePipelineProbe.intro.startCinematic?.shown ||
    !progressiveSiegePipelineProbe.intro.startOverlayScoped ||
    progressiveSiegePipelineProbe.intro.startCinematic?.tableKey !== progressiveSiegePipelineProbe.siegeKey ||
    Number(progressiveSiegePipelineProbe.intro.startCinematic?.troopCount || 0) < 10 ||
    Number(progressiveSiegePipelineProbe.intro.startCinematic?.projectileCount || 0) < 6 ||
    !(Number(progressiveSiegePipelineProbe.intro.lastIntro?.phaseTimings?.armyAt || 0) < Number(progressiveSiegePipelineProbe.intro.lastIntro?.phaseTimings?.castleAt || 0)) ||
    progressiveSiegePipelineProbe.after?.tableKey !== progressiveSiegePipelineProbe.siegeKey ||
    progressiveSiegePipelineProbe.after?.worldKey !== progressiveSiegePipelineProbe.siegeWorld ||
    progressiveSiegePipelineProbe.after?.activeView !== "tower" ||
    progressiveSiegePipelineProbe.after?.introActive ||
    progressiveSiegePipelineProbe.after?.buttonPointer === "none" ||
    progressiveSiegePipelineProbe.after?.queueState?.pending
  ){
    throw new Error(`Progressive Ball plus queued siege did not play the overview pipeline before siege intro: ${JSON.stringify(progressiveSiegePipelineProbe)}`);
  }

  const besiegedSelectionProbe = await page.evaluate(async () => {
    if(typeof closeOverviewModal === "function") closeOverviewModal();
    await new Promise((resolve) => setTimeout(resolve, 140));
    const nonBossWorlds = Object.keys(state?.worlds || {}).filter((wk) => {
      try { return !isBossWorldId(wk, state) && Array.isArray(state.worlds[wk]?.tables) && state.worlds[wk].tables.length; } catch (_) { return false; }
    });
    const targetWorld = nonBossWorlds[0] || "w1";
    const targetIdx = 0;
    const targetKey = `${targetWorld}|${targetIdx}`;
    const targetName = String(state?.worlds?.[targetWorld]?.tables?.[targetIdx] || "Besieged Test Table");
    let otherWorld = nonBossWorlds.find((wk) => wk !== targetWorld && Array.isArray(state.worlds[wk]?.tables) && state.worlds[wk].tables.length) || targetWorld;
    let otherIdx = otherWorld === targetWorld ? 1 : 0;
    if(!state.worlds[otherWorld]?.tables?.[otherIdx]){
      if(!Array.isArray(state.worlds[otherWorld].tables)) state.worlds[otherWorld].tables = [];
      state.worlds[otherWorld].tables[otherIdx] = "Besieged Drift Decoy";
    }
    const otherKey = `${otherWorld}|${otherIdx}`;
    state.balls = state.balls || {};
    state.balls[`${targetKey}|1`] = true;
    state.balls[`${otherKey}|1`] = true;
    state.nowPlaying = state.nowPlaying || {};
    state.nowPlaying[targetWorld] = targetIdx;
    state.nowPlaying[otherWorld] = otherIdx;
    if(typeof besiegedClear === "function") besiegedClear("test-reset");
    const activated = typeof besiegedActivate === "function" && besiegedActivate({
      force: true,
      target: {
        worldKey: targetWorld,
        tableKey: targetKey,
        tableName: targetName
      }
    });
    await new Promise((resolve) => setTimeout(resolve, 80));
    if(typeof setNowPlayingFromTableKey === "function") setNowPlayingFromTableKey(otherKey, { allowLocked:true, syncChecksWorld:true, syncTowerSelection:true, source:"besieged-test" });
    if(typeof setNowPlayingIndex === "function") setNowPlayingIndex(otherWorld, otherIdx, { countView:true, source:"besieged-test" });
    if(typeof syncTowerSelectionToWorld === "function") syncTowerSelectionToWorld(otherWorld);
    if(typeof syncTowerSelectionToBossWorld === "function") syncTowerSelectionToBossWorld();
    if(typeof syncChecksWorldFromTowerContext === "function") syncChecksWorldFromTowerContext();
    if(typeof syncNowPlayingIndexesToUnlockedTables === "function") syncNowPlayingIndexesToUnlockedTables({ render:true, save:false });
    if(typeof ensureBossTableSelectionForUnlock === "function") ensureBossTableSelectionForUnlock({ allowBeforeKeys:true, selectInTower:true, render:true, forceRoll:true });
    if(typeof setWorldPage === "function") setWorldPage(99, { render:true, save:false });
    if(typeof bossFocusVictoryChecksView === "function") bossFocusVictoryChecksView({ render:true, showView:true });
    if(typeof showView === "function") showView("overview");
    await new Promise((resolve) => setTimeout(resolve, 120));
    const bridgeState = typeof window.flprStandaloneBesiegedSelectionBridgeState === "function"
      ? window.flprStandaloneBesiegedSelectionBridgeState()
      : null;
    const result = {
      activated: !!activated,
      targetWorld,
      targetIdx,
      targetKey,
      otherWorld,
      otherIdx,
      otherKey,
      selected: String(state?.selected || ""),
      currentWorld: String(ap?.currentWorld || ""),
      targetNowPlaying: Number(state?.nowPlaying?.[targetWorld]),
      activeView: String(activeView || ""),
      bridgeState,
      selectedTitle: document.querySelector("#selectedTitle")?.innerText || "",
      selectedBody: (document.querySelector("#selectedBody")?.innerText || "").slice(0, 700)
    };
    if(typeof besiegedClear === "function") besiegedClear("test-reset");
    return result;
  });
  if(
    !besiegedSelectionProbe.activated ||
    besiegedSelectionProbe.selected !== besiegedSelectionProbe.targetWorld ||
    besiegedSelectionProbe.currentWorld !== besiegedSelectionProbe.targetWorld ||
    besiegedSelectionProbe.targetNowPlaying !== besiegedSelectionProbe.targetIdx ||
    besiegedSelectionProbe.activeView !== "tower" ||
    !besiegedSelectionProbe.bridgeState?.installed ||
    besiegedSelectionProbe.bridgeState?.target?.tableKey !== besiegedSelectionProbe.targetKey
  ){
    throw new Error(`Besieged Table selection was not pinned to the active siege target: ${JSON.stringify(besiegedSelectionProbe)}`);
  }

  const sentProgressionCheckFlowProbe = await page.evaluate(async () => {
    try {
      if(typeof showView === "function") showView("checks");
      else { activeView = "checks"; if(typeof setTabUI === "function") setTabUI(); }
      showApSentItemToast({
        key: "test-sent-progression-checks-flow",
        ts: Date.now(),
        time: "TEST",
        itemId: 370001,
        locId: 3020,
        senderId: 1,
        receiverId: 3,
        itemName: "Ethereal Crossbow",
        serverItemName: "Ethereal Crossbow",
        locationName: "Vector Test Table - Skill Shot",
        receiverPlayer: "HereticP2",
        receiverGame: "Heretic",
        senderPlayer: "AshodinNoTrap",
        senderGame: "Manual_FlippermizerBaseGame_Ashodin",
        flags: 1
      }, { holdMs: 3200 });
      await new Promise((resolve) => setTimeout(resolve, 1450));
      return {
        activeView: String(activeView || ""),
        modalVisible: !document.querySelector("#ovModal")?.classList.contains("hidden"),
        modalVisibleOnActiveView: (() => {
          const modal = document.querySelector("#ovModal:not(.hidden)");
          if(!modal) return false;
          const rect = modal.getBoundingClientRect();
          const style = getComputedStyle(modal);
          return rect.width > 100 &&
            rect.height > 100 &&
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            style.opacity !== "0" &&
            !modal.closest(".view:not(.active)") &&
            modal.parentElement?.classList?.contains("viewport");
        })(),
        modalParentId: document.querySelector("#ovModal")?.parentElement?.id || "",
        modalParentClass: document.querySelector("#ovModal")?.parentElement?.className || "",
        modalTitle: document.querySelector("#ovModalTitle")?.innerText || "",
        modalBig: document.querySelector("#ovModalBig")?.innerText || "",
        modalSub: document.querySelector("#ovModalSub")?.innerText || ""
      };
    } finally {
      try {
        const key = "test-sent-progression-checks-flow";
        const sent = JSON.parse(localStorage.getItem("flpr_standalone_ap_sent_items_v1") || "[]").filter((row) => row?.key !== key);
        localStorage.setItem("flpr_standalone_ap_sent_items_v1", JSON.stringify(sent));
      } catch (_) {}
    }
  });
  if(
    sentProgressionCheckFlowProbe.activeView !== "checks" ||
    !sentProgressionCheckFlowProbe.modalVisible ||
    !sentProgressionCheckFlowProbe.modalVisibleOnActiveView ||
    !/SENT/.test(sentProgressionCheckFlowProbe.modalTitle) ||
    !sentProgressionCheckFlowProbe.modalBig.includes("Ethereal Crossbow") ||
    !sentProgressionCheckFlowProbe.modalSub.includes("HereticP2")
  ){
    throw new Error(`Progression item sent to another player did not keep the Checks page active: ${JSON.stringify(sentProgressionCheckFlowProbe)}`);
  }

  const nonProgressiveCheckFlowProbe = await page.evaluate(async () => {
    const locId = 3012;
    const itemIndex = 887766;
    try {
      if(typeof showView === "function") showView("checks");
      else { activeView = "checks"; if(typeof setTabUI === "function") setTabUI(); }
      processReceivedItem({ item:1002, location:locId, player:1, flags:2 }, itemIndex, locId, { noPopup:false, noFeed:true, isSnapshot:false });
      await new Promise((resolve) => setTimeout(resolve, 1450));
      return {
        activeView: String(activeView || ""),
        modalVisible: !document.querySelector("#ovModal")?.classList.contains("hidden"),
        modalTitle: document.querySelector("#ovModalTitle")?.innerText || "",
        modalBig: document.querySelector("#ovModalBig")?.innerText || ""
      };
    } finally {
      try {
        const list = (ap.receivedAll || []).filter((row) => Number(row?.recvIndex) !== itemIndex && Number(row?.locId) !== locId);
        ap.receivedAll = list;
        ap.receivedKeySet = new Set(list.map((row) => row?.recvIndex != null ? ("idx:" + row.recvIndex) : ((row?.itemName || "") + "|" + (row?.locationName || ""))));
        saveReceivedList(list);
        renderReceivedList(list);
      } catch (_) {}
    }
  });
  if(nonProgressiveCheckFlowProbe.activeView !== "checks" || !nonProgressiveCheckFlowProbe.modalVisible || !nonProgressiveCheckFlowProbe.modalBig.includes("Arrows (10)")){
    throw new Error(`Non-progressive received checks did not keep the Checks page active under the popup: ${JSON.stringify(nonProgressiveCheckFlowProbe)}`);
  }

  await page.locator(".flprStandaloneConnectLayout .standaloneItemTab[data-standalone-item-tab='sent']").click();
  await waitFor(page, `
    const body = document.querySelector('.flprStandaloneConnectLayout #receivedBody')?.innerText || '';
    return body.includes('ITEM; Ethereal Crossbow') && body.includes('TO; HereticP2 (Heretic)') && !body.includes('ITEM; 370001');
  `, 10000);
  await waitFor(page, `
    const body = document.querySelector('.flprStandaloneConnectLayout #receivedBody')?.innerText || '';
    const log = document.querySelector('.flprStandaloneConnectLayout #apConnLogBody')?.innerText || '';
    return body.includes('ITEM; Pegasus Boots') &&
      body.includes('ITEM; Rupees (300)') &&
      body.includes('ITEM; Bug-Catching Net') &&
      !body.includes('ITEM; Progressive Ball - Skateball') &&
      !body.includes('ITEM; Progressive Ball - Cyclone') &&
      !log.includes('sent Progressive Ball - Skateball to ALTTPP3');
  `, 10000);
  await page.locator(".flprStandaloneConnectLayout .standaloneItemTab[data-standalone-item-tab='received']").click();
  const repairedReceivedProbe = await page.evaluate(`
    (() => {
      const body = document.querySelector('.flprStandaloneConnectLayout #receivedBody')?.innerText || '';
      const stored = JSON.parse(localStorage.getItem('flpr_ap_received_v1') || '[]');
      const skateKey = (() => { try { return getTableKeyForName('Skateball') || ''; } catch (_) { return ''; } })();
      return {
        body,
        stored,
        skateKey,
        skateBallLevel: skateKey ? (
          state?.balls?.[skateKey + '|3'] ? 3 :
          state?.balls?.[skateKey + '|2'] ? 2 :
          state?.balls?.[skateKey + '|1'] ? 1 : 0
        ) : 0
      };
    })()
  `);
  if(
    repairedReceivedProbe.body.includes("Progressive Ball - Skateball") ||
    JSON.stringify(repairedReceivedProbe.stored).includes("Progressive Ball - Skateball") ||
    repairedReceivedProbe.skateBallLevel !== 0
  ){
    throw new Error(`False Skateball receipt was not repaired: ${JSON.stringify(repairedReceivedProbe)}`);
  }
  const receivedItemLogColorProbe = await page.evaluate(`(() => ({
    rows: Array.from(document.querySelectorAll('.flprStandaloneConnectLayout #receivedBody .recvRow')).map((row) => ({
      text: row.innerText || '',
      rowCls: row.className || '',
      itemSpans: Array.from(row.querySelectorAll('.recvItem')).map((node) => ({ text: node.innerText || '', cls: node.className || '' })),
      players: Array.from(row.querySelectorAll('.recvPlayer')).map((node) => node.innerText || ''),
      locations: Array.from(row.querySelectorAll('.recvLocation')).map((node) => node.innerText || '')
    }))
  }))()`);
  if(
    !receivedItemLogColorProbe.rows.some((row) => row.text.includes('Arrows (10)') && row.rowCls.includes('apItem-useful') && row.itemSpans.some((span) => span.cls.includes('apItem-useful'))) ||
    !receivedItemLogColorProbe.rows.some((row) => row.text.includes('Tome of Power') && row.rowCls.includes('apItem-progression') && row.itemSpans.some((span) => span.cls.includes('apItem-progression'))) ||
    !receivedItemLogColorProbe.rows.some((row) => row.text.includes('Easy Junk Item') && row.rowCls.includes('apItem-filler') && row.itemSpans.some((span) => span.cls.includes('apItem-filler'))) ||
    !receivedItemLogColorProbe.rows.some((row) => row.players.some((text) => text.includes('ALTTPP3')) && row.locations.some((text) => text.includes('Secret Passage')))
  ){
    throw new Error(`Received Item Log did not color-code item/player/location spans: ${JSON.stringify(receivedItemLogColorProbe)}`);
  }
  await page.locator(".flprStandaloneConnectLayout .standaloneItemTab[data-standalone-item-tab='sent']").click();
  await waitFor(page, `
    const body = document.querySelector('.flprStandaloneConnectLayout #receivedBody')?.innerText || '';
    return body.includes('ITEM; Ethereal Crossbow') && body.includes('ITEM; Bug-Catching Net') && body.includes('ITEM; Rupees (300)');
  `, 5000);
  const sentItemLogColorProbe = await page.evaluate(`(() => ({
    rows: Array.from(document.querySelectorAll('.flprStandaloneConnectLayout #receivedBody .recvRow')).map((row) => ({
      text: row.innerText || '',
      rowCls: row.className || '',
      itemSpans: Array.from(row.querySelectorAll('.recvItem')).map((node) => ({ text: node.innerText || '', cls: node.className || '' })),
      players: Array.from(row.querySelectorAll('.recvPlayer')).map((node) => node.innerText || ''),
      locations: Array.from(row.querySelectorAll('.recvLocation')).map((node) => node.innerText || '')
    }))
  }))()`);
  if(
    !sentItemLogColorProbe.rows.some((row) => row.text.includes('Ethereal Crossbow') && row.rowCls.includes('apItem-progression') && row.itemSpans.some((span) => span.cls.includes('apItem-progression'))) ||
    !sentItemLogColorProbe.rows.some((row) => row.text.includes('Bug-Catching Net') && row.rowCls.includes('apItem-useful') && row.itemSpans.some((span) => span.cls.includes('apItem-useful'))) ||
    !sentItemLogColorProbe.rows.some((row) => row.text.includes('Rupees (300)') && row.rowCls.includes('apItem-filler') && row.itemSpans.some((span) => span.cls.includes('apItem-filler'))) ||
    !sentItemLogColorProbe.rows.some((row) => row.players.some((text) => text.includes('HereticP2')) && row.locations.some((text) => text.includes('Dirty Harry')))
  ){
    throw new Error(`Sent Item Log did not color-code item/player/location spans: ${JSON.stringify(sentItemLogColorProbe)}`);
  }
  const sentRow = page.locator(".flprStandaloneConnectLayout #receivedBody .recvRow").filter({ hasText: "Ethereal Crossbow" }).first();
  await sentRow.click();
  const selectedSent = await page.evaluate(`
    (() => {
      const row = document.querySelector('.flprStandaloneConnectLayout #receivedBody .recvRow.is-selected');
      return row ? { text: row.dataset.copyText || row.innerText || '', selected: row.classList.contains('is-selected') } : null;
    })()
  `);
  if(!selectedSent || !selectedSent.selected || !selectedSent.text.includes("ITEM; Ethereal Crossbow")){
    throw new Error(`Sent item row did not select with copy text: ${JSON.stringify(selectedSent)}`);
  }
  await sentRow.click({ button: "right" });
  await waitFor(page, `return !!document.querySelector('#standaloneItemCopyMenu button');`, 5000);
  await page.locator("#standaloneItemCopyMenu button").click();
  const copyResult = await page.evaluate("window.flprStandaloneCopySelectedItemText && window.flprStandaloneCopySelectedItemText()");
  if(!copyResult) throw new Error("Selected item copy helper returned false");

  const redeemProbe = await page.evaluate(`(() => {
    const node = ap?.locById?.get?.(3010) || {
      id: 3010,
      full: ${JSON.stringify(BONUS_ROUND_LOCATION)},
      short: "Medium Task",
      tableName: "Super Mario Bros.",
      table: "Super Mario Bros."
    };
    let meta = null;
    if (typeof buildCheckRedeemMetadata === "function") {
      meta = buildCheckRedeemMetadata(node, {
        source: "manual",
        sourceType: "manual",
        tableName: "Super Mario Bros.",
        difficulty: "medium"
      });
    }
    if (!meta) {
      meta = {
        table_name: "Super Mario Bros.",
        task_name: "Complete one bonus round",
        displayed_location_name: ${JSON.stringify(BONUS_ROUND_DISPLAY_LOCATION)},
        location_name: ${JSON.stringify(BONUS_ROUND_LOCATION)},
        difficulty: "medium",
        task_type: "task",
        source: "manual"
      };
    }
    apLog("CHECK SENT; 3010; manual; task; Complete one bonus round", { tab: "chat", mirrorTabs: ["status"] });
    return {
      sent: !!apSendLocationCheckWithMetadata(3010, meta),
      nodeFull: node.full || "",
      nodeShort: node.short || "",
      meta
    };
  })()`);
  if(!redeemProbe.sent) throw new Error(`Standalone AP location check probe did not send: ${JSON.stringify(redeemProbe)}`);

  try {
    await waitFor(page, `
      const card = document.querySelector('#ovModal:not(.hidden) #ovModalCard');
      const title = document.querySelector('#ovModal:not(.hidden) #ovModalTitle')?.innerText || '';
      const big = document.querySelector('#ovModal:not(.hidden) #ovModalBig')?.innerText || '';
      const sub = document.querySelector('#ovModal:not(.hidden) #ovModalSub')?.innerText || '';
      const meta = document.querySelector('#ovModal:not(.hidden) #ovModalMeta')?.innerText || '';
      const modal = document.querySelector('#ovModal:not(.hidden)');
      const rect = modal ? modal.getBoundingClientRect() : null;
      const style = modal ? getComputedStyle(modal) : null;
      const visibleOnChecks = !!(modal &&
        rect &&
        rect.width > 100 &&
        rect.height > 100 &&
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        style.opacity !== '0' &&
        !modal.closest('.view:not(.active)') &&
        modal.parentElement?.classList?.contains('viewport'));
      return card &&
        String(activeView || '') === 'checks' &&
        visibleOnChecks &&
        card.classList.contains('flprStandaloneSentItemModal') &&
        card.classList.contains('apItem-useful') &&
        /SENT/.test(title) &&
        big.includes('Bug-Catching Net') &&
        sub.includes('ALTTPP3') &&
        meta.includes('${BONUS_ROUND_DISPLAY_LOCATION}') &&
        !!document.querySelector('#ovModal:not(.hidden) #ovModalSub .apLogPlayer') &&
        !!document.querySelector('#ovModal:not(.hidden) #ovModalMeta .apLogLocation');
    `, 7000);
  } catch (err) {
    const state = await page.evaluate(`
      (() => ({
        modalHidden: document.querySelector('#ovModal')?.className || '',
        cardClass: document.querySelector('#ovModalCard')?.className || '',
        title: document.querySelector('#ovModalTitle')?.innerText || '',
        big: document.querySelector('#ovModalBig')?.innerText || '',
        sub: document.querySelector('#ovModalSub')?.innerText || '',
        meta: document.querySelector('#ovModalMeta')?.innerText || '',
        modalParentId: document.querySelector('#ovModal')?.parentElement?.id || '',
        modalParentClass: document.querySelector('#ovModal')?.parentElement?.className || '',
        modalInactiveAncestor: document.querySelector('#ovModal')?.closest?.('.view:not(.active)')?.id || '',
        modalRect: (() => {
          const modal = document.querySelector('#ovModal');
          const rect = modal ? modal.getBoundingClientRect() : null;
          return rect ? { width: rect.width, height: rect.height, left: rect.left, top: rect.top } : null;
        })(),
        sentStorage: localStorage.getItem('flpr_standalone_ap_sent_items_v1') || '',
        log: document.querySelector('.flprStandaloneConnectLayout #apConnLogBody')?.innerText || '',
        playerGames: {
          gameById: ap?.gameByPlayerId ? Array.from(ap.gameByPlayerId.entries()) : [],
          slots: ap?.slotInfoById ? Array.from(ap.slotInfoById.entries()) : []
        }
      }))()
    `);
    console.log(JSON.stringify({ ok: false, phase: "sent-modal-bugnet", state }, null, 2));
    throw err;
  }

  try {
    await waitFor(page, `
      const log = document.querySelector('.flprStandaloneConnectLayout #apConnLogBody')?.innerText || '';
      return (
        log.includes('AshodinNoTrap sent Bug-Catching Net to ALTTPP3 (${BONUS_ROUND_DISPLAY_LOCATION})') &&
        !log.includes('AshodinNoTrap has found their own Progressive Ball - Police Force') &&
        !log.includes('AshodinNoTrap sent Progressive Ball - Police Force to ALTTPP3') &&
        !log.includes('AshodinNoTrap sent Progressive Ball - Cyclone to ALTTPP3') &&
        !log.includes('CHECK SENT; 3010') &&
        !log.includes('AshodinNoTrapsent') &&
        !log.includes('${BONUS_ROUND_LOCATION}')
      );
    `, 10000);
  } catch (err) {
    const state = await page.evaluate(`
      (() => ({
        logText: document.querySelector('.flprStandaloneConnectLayout #apConnLogBody')?.innerText || '',
        sentText: document.querySelector('.flprStandaloneConnectLayout #receivedBody')?.innerText || '',
        activeTab: Array.from(document.querySelectorAll('.flprStandaloneConnectLayout .standaloneItemTab')).find((btn) => btn.classList.contains('active'))?.innerText || '',
        apCleanSend: typeof apSendLocationCheckWithMetadata === 'function' ? String(apSendLocationCheckWithMetadata.__flprStandaloneLocationCheckBridge || false) : 'missing',
        locName: typeof standaloneLocationDisplayName === 'function' ? standaloneLocationDisplayName('${BONUS_ROUND_LOCATION}', 3010) : 'missing'
      }))()
    `);
    console.log(JSON.stringify({ ok: false, phase: "location-check-log", redeemProbe, serverReceivedPackets: apServer.received, state }, null, 2));
    throw err;
  }

  const locationCheckPackets = apServer.received.flatMap((text) => {
    try { return JSON.parse(text); } catch (_) { return []; }
  }).filter((pkt) => pkt && pkt.cmd === "LocationChecks" && Array.isArray(pkt.locations) && pkt.locations.map(Number).includes(3010));
  if(!locationCheckPackets.some((pkt) => !Object.prototype.hasOwnProperty.call(pkt, "flippermizer_redeem"))){
    throw new Error(`Standalone location check did not send an AP-clean packet: ${JSON.stringify(locationCheckPackets)}`);
  }
  if(locationCheckPackets.some((pkt) => Object.prototype.hasOwnProperty.call(pkt, "flippermizer_redeem"))){
    throw new Error(`Standalone location check leaked Flippermizer metadata on the AP packet: ${JSON.stringify(locationCheckPackets)}`);
  }

  await page.locator(".flprStandaloneConnectLayout .standaloneItemTab[data-standalone-item-tab='sent']").click();
  try {
    await waitFor(page, `
      const body = document.querySelector('.flprStandaloneConnectLayout #receivedBody')?.innerText || '';
      return body.includes('ITEM; Ethereal Crossbow') &&
        body.includes('ITEM; Bug-Catching Net') &&
        body.includes('TO; ALTTPP3 (A Link to the Past)') &&
        !body.includes('ITEM; Progressive Ball - Police Force') &&
        !body.includes('ITEM; Progressive Ball - Cyclone');
    `, 10000);
  } catch (err) {
    const state = await page.evaluate(`
      (() => ({
        activeItemTab: Array.from(document.querySelectorAll('.flprStandaloneConnectLayout .standaloneItemTab')).map((btn) => ({ text: btn.innerText || '', active: btn.classList.contains('active') })),
        body: document.querySelector('.flprStandaloneConnectLayout #receivedBody')?.innerText || '',
        sentStorage: localStorage.getItem('flpr_standalone_ap_sent_items_v1') || '',
        receivedStorage: localStorage.getItem('flpr_ap_received_v1') || '',
        log: document.querySelector('.flprStandaloneConnectLayout #apConnLogBody')?.innerText || ''
      }))()
    `);
    console.log(JSON.stringify({ ok: false, phase: "sent-self-progressive-prune", state }, null, 2));
    throw err;
  }

  await page.locator(".flprStandaloneConnectLayout .standaloneItemTab[data-standalone-item-tab='received']").click();
  try {
    await waitFor(page, `
      const body = document.querySelector('.flprStandaloneConnectLayout #receivedBody')?.innerText || '';
      return body.includes('ITEM; Arrows (10)') &&
        !body.includes('ITEM; Progressive Ball - Police Force') &&
        !body.includes('CHECK; ${BONUS_ROUND_LOCATION}');
    `, 5000);
  } catch (err) {
    const state = await page.evaluate(`
      (() => ({
        body: document.querySelector('.flprStandaloneConnectLayout #receivedBody')?.innerText || '',
        receivedStorage: localStorage.getItem('flpr_ap_received_v1') || '',
        sentStorage: localStorage.getItem('flpr_standalone_ap_sent_items_v1') || '',
        log: document.querySelector('.flprStandaloneConnectLayout #apConnLogBody')?.innerText || '',
        activeItemTab: Array.from(document.querySelectorAll('.flprStandaloneConnectLayout .standaloneItemTab')).map((btn) => ({ text: btn.innerText || '', active: btn.classList.contains('active') }))
      }))()
    `);
    console.log(JSON.stringify({ ok: false, phase: "received-false-progressive-prune", state }, null, 2));
    throw err;
  }

  const rewardStateBeforeResync = await page.evaluate(`
    (() => {
      const raw = localStorage.getItem('flpr_standalone_ap_reward_state_v1') || '{}';
      let persisted = {};
      try { persisted = JSON.parse(raw); } catch (_) {}
      return {
        extraBallTokens: Number(state?.extraBallTokens || 0),
        easyRedeems: Number(state?.junkRedeems?.easy || 0),
        mediumRedeems: Number(state?.junkRedeems?.medium || 0),
        junk: {
          easy: Number(ap?.junk?.easy || 0),
          med: Number(ap?.junk?.med || 0),
          frag: Number(ap?.junk?.frag || 0),
          easyTotal: Number(ap?.junk?.easyTotal || 0),
          medTotal: Number(ap?.junk?.medTotal || 0),
          fragTotal: Number(ap?.junk?.fragTotal || 0)
        },
        standalone: state?.standaloneApRewardState || null,
        persisted
      };
    })()
  `);
  if(
    rewardStateBeforeResync.extraBallTokens !== 0 ||
    rewardStateBeforeResync.easyRedeems !== 1 ||
    rewardStateBeforeResync.junk.frag !== 1 ||
    rewardStateBeforeResync.junk.fragTotal !== 1 ||
    rewardStateBeforeResync.junk.easy !== 0 ||
    rewardStateBeforeResync.junk.easyTotal !== 1 ||
    Number(rewardStateBeforeResync.persisted.fragmentTokensEarned || 0) !== 0 ||
    Number(rewardStateBeforeResync.persisted.currentFragments || 0) !== 1 ||
    Number(rewardStateBeforeResync.persisted.totalFragments || 0) !== 1
  ){
    throw new Error(`Standalone reward inventory state did not initialize from received snapshot: ${JSON.stringify(rewardStateBeforeResync)}`);
  }

  await page.locator(".flprStandaloneConnectLayout #apSyncReceivedBtn").click();
  await delay(900);
  await page.locator(".flprStandaloneConnectLayout #apSyncReceivedBtn").click();
  await delay(1200);
  const rewardStateAfterResync = await page.evaluate(`
    (() => {
      const raw = localStorage.getItem('flpr_standalone_ap_reward_state_v1') || '{}';
      let persisted = {};
      try { persisted = JSON.parse(raw); } catch (_) {}
      return {
        extraBallTokens: Number(state?.extraBallTokens || 0),
        easyRedeems: Number(state?.junkRedeems?.easy || 0),
        mediumRedeems: Number(state?.junkRedeems?.medium || 0),
        junk: {
          easy: Number(ap?.junk?.easy || 0),
          med: Number(ap?.junk?.med || 0),
          frag: Number(ap?.junk?.frag || 0),
          easyTotal: Number(ap?.junk?.easyTotal || 0),
          medTotal: Number(ap?.junk?.medTotal || 0),
          fragTotal: Number(ap?.junk?.fragTotal || 0)
        },
        persisted,
        drawerFx: Array.from(document.querySelectorAll('#checksCountersDock .counterDrawer')).map((node) => ({
          counter: node.dataset.counter || '',
          cls: node.className || ''
        }))
      };
    })()
  `);
  if(
    rewardStateAfterResync.extraBallTokens !== rewardStateBeforeResync.extraBallTokens ||
    rewardStateAfterResync.easyRedeems !== rewardStateBeforeResync.easyRedeems ||
    rewardStateAfterResync.mediumRedeems !== rewardStateBeforeResync.mediumRedeems ||
    rewardStateAfterResync.junk.frag !== 1 ||
    rewardStateAfterResync.junk.fragTotal !== 1 ||
    rewardStateAfterResync.junk.easy !== 0 ||
    rewardStateAfterResync.junk.easyTotal !== 1 ||
    Number(rewardStateAfterResync.persisted.fragmentTokensEarned || 0) !== 0 ||
    Number(rewardStateAfterResync.persisted.currentFragments || 0) !== 1 ||
    Number(rewardStateAfterResync.persisted.totalFragments || 0) !== 1
  ){
    throw new Error(`Repeated Sync re-awarded junk/fragments: before=${JSON.stringify(rewardStateBeforeResync)} after=${JSON.stringify(rewardStateAfterResync)}`);
  }
  const activeDrawerFx = (rewardStateAfterResync.drawerFx || []).filter((entry) => /\b(autoOpen|pulse|redeemFx)\b/.test(entry.cls || ""));
  if(activeDrawerFx.length){
    throw new Error(`Repeated Sync triggered counter drawer animation: ${JSON.stringify(activeDrawerFx)}`);
  }

  const junkCounterDrawerProbe = await page.evaluate(() => {
    const previous = {
      activeView: String(activeView || ""),
      apJunk: ap?.junk ? { ...ap.junk } : null,
      extraBallTokens: Number(state?.extraBallTokens || 0),
      junkRedeems: state?.junkRedeems ? { ...state.junkRedeems } : { easy:0, medium:0 }
    };
    const forceCollapsed = () => {
      const dock = document.querySelector('#checksCountersDock');
      if(dock) dock.classList.remove('expanded', 'active', 'retreating', 'showRetreatBar');
      document.querySelectorAll('#checksCountersDock .counterDrawer').forEach((drawer) => {
        drawer.classList.remove('open', 'autoOpen', 'pulse', 'redeemFx');
      });
    };
    const readDrawers = () => {
      forceCollapsed();
      return Array.from(document.querySelectorAll('#checksCountersDock .counterDrawer')).map((drawer) => {
        const chip = drawer.querySelector('.flprStandaloneCollapsedRedeemCounter');
        const chipStyle = chip ? getComputedStyle(chip) : null;
        const drawerStyle = getComputedStyle(drawer);
        const head = drawer.querySelector('.counterDrawerHead');
        const headStyle = head ? getComputedStyle(head) : null;
        const badge = drawer.querySelector('.counterDrawerReadyBadge');
        const badgeStyle = badge ? getComputedStyle(badge) : null;
        return {
          key: drawer.dataset.counter || "",
          text: drawer.innerText || drawer.textContent || "",
          badge: drawer.querySelector('.counterDrawerReadyBadge')?.textContent || "",
          badgeOpacity: badgeStyle?.opacity || "",
          progress: drawer.querySelector('.drawerVal')?.textContent || "",
          readyLine: drawer.querySelector('.counterReadyLine')?.textContent || "",
          drawerOpacity: drawerStyle?.opacity || "",
          headOpacity: headStyle?.opacity || "",
          collapsed: chip?.innerText || chip?.textContent || "",
          collapsedCount: chip?.dataset?.count || "",
          collapsedLabel: chip?.dataset?.label || "",
          collapsedDisplay: chipStyle?.display || "",
          collapsedOpacity: chipStyle?.opacity || ""
        };
      });
    };
    try{
      if(typeof showView === "function") showView("checks");
      state.junkRedeems = { easy:2, medium:1 };
      state.extraBallTokens = 3;
      ap.junk = { ...(ap.junk || {}), easy:1, med:2, frag:4, easyTotal:9, medTotal:8, fragTotal:19 };
      if(typeof initCounterDrawers === "function") initCounterDrawers();
      if(typeof updateCounterBars === "function") updateCounterBars();
      const before = readDrawers();
      const beforeText = before.map((entry) => entry.text).join("\\n");
      const oldWords = /\\b(Banked|Redeems|Redeemed|Collected|Total gained)\\b/i.test(beforeText);
      const consumed = typeof consumeJunkRedeemBalance === "function" ? consumeJunkRedeemBalance("easy", 1) : false;
      if(typeof updateCounterBars === "function") updateCounterBars();
      const after = readDrawers();
      return { before, after, oldWords, consumed };
    }finally{
      try{ if(previous.apJunk) ap.junk = { ...previous.apJunk }; }catch(_){}
      try{ state.extraBallTokens = previous.extraBallTokens; }catch(_){}
      try{ state.junkRedeems = { ...previous.junkRedeems }; }catch(_){}
      try{ if(typeof saveState === "function") saveState(); }catch(_){}
      try{ if(typeof updateCounterBars === "function") updateCounterBars(); }catch(_){}
      try{ if(typeof showView === "function") showView(previous.activeView || "checks"); }catch(_){}
    }
  });
  const drawerByKeyBefore = Object.fromEntries((junkCounterDrawerProbe.before || []).map((entry) => [entry.key, entry]));
  const drawerByKeyAfter = Object.fromEntries((junkCounterDrawerProbe.after || []).map((entry) => [entry.key, entry]));
  if(
    junkCounterDrawerProbe.oldWords ||
    drawerByKeyBefore.easy?.progress !== "1/3" ||
    drawerByKeyBefore.easy?.badge !== "2" ||
    drawerByKeyBefore.easy?.readyLine !== "READY: 2" ||
    drawerByKeyBefore.med?.progress !== "2/3" ||
    drawerByKeyBefore.med?.badge !== "1" ||
    drawerByKeyBefore.med?.readyLine !== "READY: 1" ||
    drawerByKeyBefore.frag?.progress !== "4/5" ||
    drawerByKeyBefore.frag?.badge !== "3" ||
    drawerByKeyBefore.frag?.readyLine !== "READY: 3" ||
    drawerByKeyBefore.easy?.collapsedCount !== "2" ||
    drawerByKeyBefore.easy?.collapsedLabel !== "RDY" ||
    drawerByKeyBefore.easy?.collapsedDisplay === "none" ||
    Number(drawerByKeyBefore.easy?.drawerOpacity || 0) !== 1 ||
    Number(drawerByKeyBefore.easy?.badgeOpacity || 0) !== 1 ||
    Number(drawerByKeyBefore.easy?.collapsedOpacity || 0) !== 1 ||
    Number(drawerByKeyBefore.easy?.headOpacity || 1) >= 0.6 ||
    drawerByKeyBefore.med?.collapsedCount !== "1" ||
    drawerByKeyBefore.med?.collapsedLabel !== "RDY" ||
    drawerByKeyBefore.frag?.collapsedCount !== "3" ||
    drawerByKeyBefore.frag?.collapsedLabel !== "EB" ||
    !junkCounterDrawerProbe.consumed ||
    drawerByKeyAfter.easy?.badge !== "1" ||
    drawerByKeyAfter.easy?.readyLine !== "READY: 1" ||
    drawerByKeyAfter.easy?.collapsedCount !== "1"
  ){
    throw new Error(`Junk counter drawer UI did not simplify ready/progress display: ${JSON.stringify(junkCounterDrawerProbe)}`);
  }

  const scoutHeaderMarkerProbe = await page.evaluate(() => {
    const previous = {
      activeView: String(activeView || ""),
      marks: (() => {
        try{ return JSON.parse(JSON.stringify(relicGetSimpleRunState()?.scoutTableMarks || {})); }catch(_){ return null; }
      })(),
      ball: !!state?.balls?.["w1|0|1"]
    };
    const host = document.createElement("div");
    host.id = "scoutHeaderMarkerProbeHost";
    host.style.position = "absolute";
    host.style.left = "0";
    host.style.top = "0";
    host.style.width = "720px";
    host.style.visibility = "hidden";
    (document.querySelector("#viewChecks") || document.body).appendChild(host);
    try{
      if(typeof showView === "function") showView("checks");
      state.balls = state.balls || {};
      state.balls["w1|0|1"] = true;
      if(typeof relicClearScoutTableMarks === "function") relicClearScoutTableMarks();
      if(typeof relicSetScoutTableMark === "function") relicSetScoutTableMark("w1|0", "progress", "");
      if(typeof renderTableBlock !== "function") return { missing:true };
      renderTableBlock(host, "Fathom", [], { tableKey:"w1|0" });
      const block = host.querySelector(".tableBlock");
      const head = host.querySelector(".tableHead");
      const tag = host.querySelector(".tableBlock > .relicMarkerHeaderTag");
      const blockRect = block?.getBoundingClientRect();
      const tagRect = tag?.getBoundingClientRect();
      return {
        missing:false,
        blockClass: block?.className || "",
        headClass: head?.className || "",
        markerParent: tag?.parentElement?.className || "",
        markerAfterHead: !!(tag && head && tag.previousElementSibling === head),
        tagText: tag?.textContent || "",
        parens: /[()]/.test(tag?.textContent || ""),
        tagWidth: tagRect?.width || 0,
        blockWidth: blockRect?.width || 0
      };
    }finally{
      try{ host.remove(); }catch(_){}
      try{
        const runSimple = relicGetSimpleRunState();
        runSimple.scoutTableMarks = previous.marks || {};
      }catch(_){}
      try{
        if(previous.ball) state.balls["w1|0|1"] = true;
        else delete state.balls["w1|0|1"];
      }catch(_){}
      try{ if(typeof showView === "function") showView(previous.activeView || "checks"); }catch(_){}
    }
  });
  if(
    scoutHeaderMarkerProbe.missing ||
    scoutHeaderMarkerProbe.tagText !== "PROGRESSION STILL HERE" ||
    scoutHeaderMarkerProbe.parens ||
    !/\bhasRelicHeaderMarker\b/.test(scoutHeaderMarkerProbe.blockClass || "") ||
    !/\bhasRelicHeaderMarker\b/.test(scoutHeaderMarkerProbe.headClass || "") ||
    !/\btableBlock\b/.test(scoutHeaderMarkerProbe.markerParent || "") ||
    !scoutHeaderMarkerProbe.markerAfterHead ||
    scoutHeaderMarkerProbe.tagWidth < Math.max(400, (scoutHeaderMarkerProbe.blockWidth || 0) * 0.82)
  ){
    throw new Error(`Scout Hint table marker did not become a full-width readable header tag: ${JSON.stringify(scoutHeaderMarkerProbe)}`);
  }

  const relicLazySusanLayoutProbe = await page.evaluate(async () => {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const previous = {
      detailOpen: !!relicUiState?.detailOpen,
      detailId: String(relicUiState?.detailId || ""),
      susanAngle: relicUiState?.susanAngle,
      hidden: document.getElementById("relicsOverlay")?.classList.contains("hidden"),
      aria: document.getElementById("relicsOverlay")?.getAttribute("aria-hidden")
    };
    try{
      if(typeof openRelicsOverlay !== "function") return { missing:true };
      relicUiState.detailOpen = false;
      openRelicsOverlay();
      await delay(120);
      const body = document.getElementById("relicsBody");
      const pane = body?.querySelector(".relicCarouselWidePane");
      const shell = body?.querySelector(".relicArchiveShell");
      const side = body?.querySelector(".relicDetailSide");
      const susan = body?.querySelector("#relicLazySusan");
      const oldDossier = body?.querySelector(".relicDossierPane");
      const detailLayer = document.getElementById("relicDetailLayer");
      const card = body?.querySelector(".relicCarouselCard[data-relic-id]:not(.isLocked)") || body?.querySelector(".relicCarouselCard[data-relic-id]");
      const bodyRect = body?.getBoundingClientRect();
      const paneRect = pane?.getBoundingClientRect();
      const susanRect = susan?.getBoundingClientRect();
      const compactBefore = !!side?.classList.contains("isCompact");
      if(card) card.click();
      await delay(140);
      const popup = detailLayer?.querySelector(".relicDetailPopup");
      const shade = detailLayer?.querySelector(".relicDetailPopupShade");
      const expandedSide = body?.querySelector(".relicDetailSide.isExpanded");
      const closeBtn = detailLayer?.querySelector("[data-relic-detail-close]");
      if(closeBtn) closeBtn.click();
      await delay(100);
      const compactAfter = !!body?.querySelector(".relicDetailSide.isCompact");
      const popupAfter = detailLayer?.querySelector(".relicDetailPopup");
      return {
        missing:false,
        hasWidePane: !!pane,
        hasShell: !!shell,
        hasDetailLayer: !!detailLayer,
        oldDossier: !!oldDossier,
        compactBefore,
        popupAfterClick: !!popup,
        shadeAfterClick: !!shade,
        expandedAfterClick: !!expandedSide,
        compactAfter,
        popupClosed: !popupAfter,
        bodyWidth: bodyRect?.width || 0,
        paneWidth: paneRect?.width || 0,
        susanWidth: susanRect?.width || 0
      };
    }finally{
      try{ relicUiState.detailOpen = previous.detailOpen; }catch(_){}
      try{ relicUiState.detailId = previous.detailId; }catch(_){}
      try{ relicUiState.susanAngle = previous.susanAngle; }catch(_){}
      try{
        const overlay = document.getElementById("relicsOverlay");
        if(previous.hidden) {
          if(typeof closeRelicsOverlay === "function") closeRelicsOverlay({ silent:true });
          else overlay?.classList.add("hidden");
        }else{
          overlay?.classList.remove("hidden");
          if(previous.aria != null) overlay?.setAttribute("aria-hidden", previous.aria);
        }
      }catch(_){}
    }
  });
  if(
    relicLazySusanLayoutProbe.missing ||
    !relicLazySusanLayoutProbe.hasWidePane ||
    !relicLazySusanLayoutProbe.hasShell ||
    !relicLazySusanLayoutProbe.hasDetailLayer ||
    relicLazySusanLayoutProbe.oldDossier ||
    !relicLazySusanLayoutProbe.compactBefore ||
    !relicLazySusanLayoutProbe.popupAfterClick ||
    !relicLazySusanLayoutProbe.shadeAfterClick ||
    relicLazySusanLayoutProbe.expandedAfterClick ||
    !relicLazySusanLayoutProbe.compactAfter ||
    !relicLazySusanLayoutProbe.popupClosed ||
    relicLazySusanLayoutProbe.paneWidth < (relicLazySusanLayoutProbe.bodyWidth * 0.92) ||
    relicLazySusanLayoutProbe.susanWidth < 430
  ){
    throw new Error(`Relic Lazy Susan layout/detail popup did not open and close correctly: ${JSON.stringify(relicLazySusanLayoutProbe)}`);
  }

  const streamCounterRewardSuppressionProbe = await page.evaluate(() => {
    const previous = {
      activeView: String(activeView || ""),
      bodyClass: document.body.className,
      launcher: window.flprLauncher,
      apJunk: ap?.junk ? { ...ap.junk } : null,
      extraBallTokens: Number(state?.extraBallTokens || 0),
      extraBallAssignments: state?.extraBallAssignments ? { ...state.extraBallAssignments } : null,
      junkRedeems: state?.junkRedeems ? { ...state.junkRedeems } : { easy:0, medium:0 }
    };
    const read = () => ({
      disabled: typeof counterRewardRedemptionsDisabled === "function" ? counterRewardRedemptionsDisabled() : null,
      easyBalance: typeof getJunkRedeemBalance === "function" ? getJunkRedeemBalance("easy") : null,
      mediumBalance: typeof getJunkRedeemBalance === "function" ? getJunkRedeemBalance("medium") : null,
      apJunk: ap?.junk ? { ...ap.junk } : null,
      extraBallTokens: Number(state?.extraBallTokens || 0),
      extraBallAssignments: state?.extraBallAssignments ? { ...state.extraBallAssignments } : null,
      junkRedeems: state?.junkRedeems ? { ...state.junkRedeems } : null,
      drawers: Array.from(document.querySelectorAll('#checksCountersDock .counterDrawer')).map((drawer) => ({
        key: drawer.dataset.counter || "",
        progress: drawer.querySelector('.drawerVal')?.textContent || "",
        badge: drawer.querySelector('.counterDrawerReadyBadge')?.textContent || "",
        readyLine: drawer.querySelector('.counterReadyLine')?.textContent || "",
        canRedeem: drawer.classList.contains("canRedeem"),
        targetArmed: drawer.classList.contains("targetArmed"),
        tip: drawer.querySelector('.counterDrawerHead')?.getAttribute("data-tip") || ""
      }))
    });
    try{
      if(typeof showView === "function") showView("checks");
      document.body.classList.remove("flprStandaloneOriginalClient");
      window.flprLauncher = { openPage(){ return Promise.resolve(); } };
      ap.junk = { easy:2, med:2, frag:4, easyTotal:17, medTotal:17, fragTotal:9 };
      state.junkRedeems = { easy:17, medium:17 };
      state.extraBallTokens = 2;
      state.extraBallAssignments = { "w1|0":1 };
      if(typeof updateCounterBarsQuietly === "function") updateCounterBarsQuietly();
      else if(typeof updateCounterBars === "function") updateCounterBars();
      const afterReset = read();
      const addResult = typeof addJunkRedeemBalance === "function" ? addJunkRedeemBalance("medium", 1) : null;
      const consumeResult = typeof consumeJunkRedeemBalance === "function" ? consumeJunkRedeemBalance("easy", 1) : null;
      const armResult = typeof armJunkRedeemTargetMode === "function" ? armJunkRedeemTargetMode("easy") : null;
      if(typeof updateCounterBarsQuietly === "function") updateCounterBarsQuietly();
      else if(typeof updateCounterBars === "function") updateCounterBars();
      const afterBlocked = read();
      return { afterReset, afterBlocked, addResult, consumeResult, armResult };
    }finally{
      try{ document.body.className = previous.bodyClass; }catch(_){}
      try{
        if(previous.launcher === undefined) delete window.flprLauncher;
        else window.flprLauncher = previous.launcher;
      }catch(_){}
      try{ if(previous.apJunk) ap.junk = { ...previous.apJunk }; }catch(_){}
      try{ state.extraBallTokens = previous.extraBallTokens; }catch(_){}
      try{
        if(previous.extraBallAssignments) state.extraBallAssignments = { ...previous.extraBallAssignments };
        else delete state.extraBallAssignments;
      }catch(_){}
      try{ state.junkRedeems = { ...previous.junkRedeems }; }catch(_){}
      try{ if(typeof saveState === "function") saveState(); }catch(_){}
      try{
        if(typeof updateCounterBarsQuietly === "function") updateCounterBarsQuietly();
        else if(typeof updateCounterBars === "function") updateCounterBars();
      }catch(_){}
      try{ if(typeof showView === "function") showView(previous.activeView || "checks"); }catch(_){}
    }
  });
  const streamDrawers = Object.fromEntries((streamCounterRewardSuppressionProbe.afterBlocked?.drawers || []).map((entry) => [entry.key, entry]));
  if(
    streamCounterRewardSuppressionProbe.afterReset?.disabled !== true ||
    streamCounterRewardSuppressionProbe.afterBlocked?.easyBalance !== 0 ||
    streamCounterRewardSuppressionProbe.afterBlocked?.mediumBalance !== 0 ||
    streamCounterRewardSuppressionProbe.afterBlocked?.apJunk?.easy !== 2 ||
    streamCounterRewardSuppressionProbe.afterBlocked?.apJunk?.med !== 2 ||
    streamCounterRewardSuppressionProbe.afterBlocked?.apJunk?.frag !== 4 ||
    streamCounterRewardSuppressionProbe.afterBlocked?.apJunk?.easyTotal !== 17 ||
    streamCounterRewardSuppressionProbe.afterBlocked?.apJunk?.medTotal !== 17 ||
    streamCounterRewardSuppressionProbe.afterBlocked?.apJunk?.fragTotal !== 9 ||
    streamCounterRewardSuppressionProbe.afterBlocked?.extraBallTokens !== 0 ||
    Object.keys(streamCounterRewardSuppressionProbe.afterBlocked?.extraBallAssignments || {}).length !== 0 ||
    streamCounterRewardSuppressionProbe.afterBlocked?.junkRedeems?.easy !== 0 ||
    streamCounterRewardSuppressionProbe.afterBlocked?.junkRedeems?.medium !== 0 ||
    streamCounterRewardSuppressionProbe.addResult !== 0 ||
    streamCounterRewardSuppressionProbe.consumeResult !== false ||
    streamCounterRewardSuppressionProbe.armResult !== false ||
    streamDrawers.easy?.progress !== "2/3" ||
    streamDrawers.med?.progress !== "2/3" ||
    streamDrawers.frag?.progress !== "4/5" ||
    streamDrawers.easy?.badge !== "" ||
    streamDrawers.med?.badge !== "" ||
    streamDrawers.frag?.badge !== "" ||
    streamDrawers.easy?.canRedeem ||
    streamDrawers.med?.canRedeem ||
    streamDrawers.frag?.canRedeem ||
    !/display-only/i.test(streamDrawers.easy?.tip || "") ||
    !/display-only/i.test(streamDrawers.frag?.tip || "")
  ){
    throw new Error(`Stream Edition counter rewards were not suppressed: ${JSON.stringify(streamCounterRewardSuppressionProbe)}`);
  }

  const streamCheckSentNotificationProbe = await page.evaluate(() => {
    const worldKey = "__stream_toast_probe";
    const tableName = "Stream Toast Probe";
    const locs = [
      { id:990091, full:`${tableName} - Easy: Light lane`, short:"Light lane", genericDifficulty:"easy" },
      { id:990092, full:`${tableName} - Easy: Orbit shot`, short:"Orbit shot", genericDifficulty:"easy" }
    ];
    const previous = {
      activeView: String(activeView || ""),
      bodyClass: document.body.className,
      launcher: window.flprLauncher,
      streamFlagHad: Object.prototype.hasOwnProperty.call(window, "__flprStreamEdition"),
      streamFlag: window.__flprStreamEdition,
      connected: !!ap?.connected,
      ws: ap?.ws,
      checkSyncTimer: ap?.checkSyncTimer || null,
      lastCheckTriggeredSyncAt: Number(ap?.lastCheckTriggeredSyncAt || 0),
      currentWorld: String(ap?.currentWorld || ""),
      pendingQueue: Array.isArray(ap?.pendingQueue) ? ap.pendingQueue.map((row) => ({ ...row })) : [],
      pendingByLoc: ap?.pendingByLoc instanceof Map ? new Map(ap.pendingByLoc) : new Map(),
      checked: ap?.checked instanceof Set ? new Set(ap.checked) : new Set(),
      validCheckLocIds: ap?.validCheckLocIds instanceof Set ? new Set(ap.validCheckLocIds) : new Set(),
      locById: ap?.locById instanceof Map ? new Map(ap.locById) : new Map(),
      balls: state?.balls ? { ...state.balls } : {},
      worldHad: !!(state?.worlds && Object.prototype.hasOwnProperty.call(state.worlds, worldKey)),
      world: state?.worlds?.[worldKey] ? { ...state.worlds[worldKey] } : null,
      selected: String(state?.selected || ""),
      nowPlaying: state?.nowPlaying ? { ...state.nowPlaying } : null,
      toast: typeof toast === "function" ? toast : null,
      windowToast: window.toast,
      playSfx: typeof playSfx === "function" ? playSfx : null,
      apLog: typeof apLog === "function" ? apLog : null
    };
    const toastCalls = [];
    const packets = [];
    const configureRuntime = (stream) => {
      if(stream){
        window.__flprStreamEdition = true;
        document.body.classList.remove("flprStandaloneOriginalClient");
        window.flprLauncher = { openPage(){ return Promise.resolve(); } };
      }else{
        window.__flprStreamEdition = false;
        document.body.classList.add("flprStandaloneOriginalClient");
        try{ delete window.flprLauncher; }catch(_){ window.flprLauncher = undefined; }
      }
    };
    const runClick = (stream, node) => {
      configureRuntime(stream);
      const before = toastCalls.length;
      const parent = document.createElement("div");
      parent.style.display = "none";
      document.body.appendChild(parent);
      try{
        renderTableBlock(parent, tableName, [node], { tableKey:`${worldKey}|0` });
        const btn = parent.querySelector(".nodeBtn");
        const helperValue = typeof shouldShowCheckSentNotification === "function" ? shouldShowCheckSentNotification() : null;
        if(!btn) return { stream, helperValue, missingButton:true };
        btn.click();
        return {
          stream,
          helperValue,
          missingButton:false,
          checkSentTitles: toastCalls.slice(before).filter((call) => String(call.title || "") === "CHECK SENT").length,
          allTitles: toastCalls.slice(before).map((call) => String(call.title || "")),
          pending: !!ap?.pendingByLoc?.has?.(node.id)
        };
      }finally{
        try{ parent.remove(); }catch(_){}
      }
    };
    try{
      if(!state.worlds || typeof state.worlds !== "object") state.worlds = {};
      if(!state.balls || typeof state.balls !== "object") state.balls = {};
      state.worlds[worldKey] = { label:tableName, tables:[tableName], locked:false };
      state.balls[`${worldKey}|0|1`] = true;
      ap.connected = true;
      ap.ws = { readyState:WebSocket.OPEN, send(text){ packets.push(String(text || "")); } };
      ap.currentWorld = worldKey;
      ap.pendingQueue = [];
      ap.pendingByLoc = new Map();
      ap.checked = new Set(previous.checked);
      locs.forEach((node) => {
        ap.checked.delete(node.id);
        try{ ap.validCheckLocIds.add(node.id); }catch(_){}
        try{ ap.locById.set(node.id, node); }catch(_){}
      });
      window.toast = function(kind, title, value, ms){
        toastCalls.push({ kind:String(kind || ""), title:String(title || ""), value:String(value || ""), ms:Number(ms || 0) });
        return null;
      };
      toast = window.toast;
      if(typeof playSfx === "function") playSfx = function(){ return null; };
      if(typeof apLog === "function") apLog = function(){ return null; };
      const originalClient = runClick(false, locs[0]);
      const streamClient = runClick(true, locs[1]);
      return { originalClient, streamClient, packets:packets.length, toastCalls };
    }finally{
      try{ document.body.className = previous.bodyClass; }catch(_){}
      try{
        if(previous.launcher === undefined) delete window.flprLauncher;
        else window.flprLauncher = previous.launcher;
      }catch(_){}
      try{
        if(previous.streamFlagHad) window.__flprStreamEdition = previous.streamFlag;
        else delete window.__flprStreamEdition;
      }catch(_){}
      try{ ap.connected = previous.connected; }catch(_){}
      try{ ap.ws = previous.ws; }catch(_){}
      try{
        if(ap.checkSyncTimer && ap.checkSyncTimer !== previous.checkSyncTimer) clearTimeout(ap.checkSyncTimer);
        ap.checkSyncTimer = previous.checkSyncTimer;
        ap.lastCheckTriggeredSyncAt = previous.lastCheckTriggeredSyncAt;
      }catch(_){}
      try{ ap.currentWorld = previous.currentWorld; }catch(_){}
      try{ ap.pendingQueue = previous.pendingQueue.map((row) => ({ ...row })); }catch(_){}
      try{ ap.pendingByLoc = new Map(previous.pendingByLoc); }catch(_){}
      try{ ap.checked = new Set(previous.checked); }catch(_){}
      try{ ap.validCheckLocIds = new Set(previous.validCheckLocIds); }catch(_){}
      try{ ap.locById = new Map(previous.locById); }catch(_){}
      try{ state.balls = { ...previous.balls }; }catch(_){}
      try{
        if(previous.worldHad) state.worlds[worldKey] = previous.world;
        else delete state.worlds[worldKey];
      }catch(_){}
      try{ state.selected = previous.selected; }catch(_){}
      try{
        if(previous.nowPlaying) state.nowPlaying = { ...previous.nowPlaying };
        else delete state.nowPlaying;
      }catch(_){}
      try{
        if(previous.toast){
          window.toast = previous.windowToast || previous.toast;
          toast = previous.toast;
        }
      }catch(_){}
      try{ if(previous.playSfx) playSfx = previous.playSfx; }catch(_){}
      try{ if(previous.apLog) apLog = previous.apLog; }catch(_){}
      try{ if(typeof saveState === "function") saveState(); }catch(_){}
      try{ if(typeof showView === "function") showView(previous.activeView || "checks"); }catch(_){}
    }
  });
  if(
    streamCheckSentNotificationProbe.originalClient?.missingButton ||
    streamCheckSentNotificationProbe.streamClient?.missingButton ||
    streamCheckSentNotificationProbe.originalClient?.helperValue !== true ||
    streamCheckSentNotificationProbe.streamClient?.helperValue !== false ||
    streamCheckSentNotificationProbe.originalClient?.checkSentTitles !== 1 ||
    streamCheckSentNotificationProbe.streamClient?.checkSentTitles !== 0 ||
    !streamCheckSentNotificationProbe.originalClient?.pending ||
    !streamCheckSentNotificationProbe.streamClient?.pending
  ){
    throw new Error(`Stream Edition Check Sent notification suppression failed: ${JSON.stringify(streamCheckSentNotificationProbe)}`);
  }

  const streamCounterReceivedFlowProbe = await page.evaluate(async () => {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const previous = {
      activeView: String(activeView || ""),
      bodyClass: document.body.className,
      launcher: window.flprLauncher,
      apJunk: ap?.junk ? { ...ap.junk } : null,
      extraBallTokens: Number(state?.extraBallTokens || 0),
      extraBallAssignments: state?.extraBallAssignments ? { ...state.extraBallAssignments } : null,
      junkRedeems: state?.junkRedeems ? { ...state.junkRedeems } : { easy:0, medium:0 },
      receivedAll: Array.isArray(ap?.receivedAll) ? ap.receivedAll.map((row) => ({ ...row })) : null,
      receivedKeySet: ap?.receivedKeySet instanceof Set ? Array.from(ap.receivedKeySet) : null,
      receivedSeen: ap?.receivedSeen instanceof Set ? Array.from(ap.receivedSeen) : null,
      receivedByIndex: ap?.receivedByIndex instanceof Map ? Array.from(ap.receivedByIndex.entries()).map(([key, value]) => [key, { ...value }]) : null,
      rewardState: localStorage.getItem("flpr_standalone_ap_reward_state_v1"),
      itemNames: [191006, 191007, 1005].map((id) => ({ id, had: !!ap?.itemNameById?.has?.(id), name: ap?.itemNameById?.get?.(id) || "" }))
    };
    let originalShowOverviewModal = null;
    let originalShowView = null;
    let checksCalls = 0;
    const modalArgs = [];
    const runtimeErrors = [];
    const onError = (event) => runtimeErrors.push(String(event?.message || event?.error?.message || event || ""));
    const onReject = (event) => runtimeErrors.push(String(event?.reason?.message || event?.reason || event || ""));
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onReject);
    try{
      document.body.classList.remove("flprStandaloneOriginalClient");
      window.flprLauncher = { openPage(){ return Promise.resolve(); } };
      if(typeof processReceivedItem !== "function") return { missingProcess:true };
      originalShowView = showView;
      window.showView = function(next, opts){
        if(String(next || "") === "checks") checksCalls += 1;
        return originalShowView.apply(this, arguments);
      };
      showView = window.showView;
      originalShowOverviewModal = showOverviewModal;
      window.showOverviewModal = function(args){
        modalArgs.push({ ...(args || {}) });
        try{ if(typeof showOverviewModalNow === "function") showOverviewModalNow(args || {}); }catch(_){}
        return 580;
      };
      showOverviewModal = window.showOverviewModal;
      try{ if(typeof showView === "function") showView("overview"); }catch(_){}
      document.querySelectorAll("#toastWrap .apItemToast").forEach((node) => node.remove());
      try{ document.getElementById("ovModal")?.classList.add("hidden"); }catch(_){}
      if(!ap.itemNameById) ap.itemNameById = new Map();
      ap.itemNameById.set(191006, "Easy Junk Item");
      ap.itemNameById.set(191007, "Medium Junk Item");
      ap.itemNameById.set(1005, "Pinball Fragment");
      ap.junk = { easy:0, med:0, frag:0, easyTotal:0, medTotal:0, fragTotal:0 };
      state.junkRedeems = { easy:0, medium:0 };
      state.extraBallTokens = 0;
      state.extraBallAssignments = {};
      ap.receivedAll = [];
      ap.receivedKeySet = new Set();
      ap.receivedSeen = new Set();
      ap.receivedByIndex = new Map();
      localStorage.removeItem("flpr_standalone_ap_reward_state_v1");
      if(typeof updateCounterBarsQuietly === "function") updateCounterBarsQuietly();
      else if(typeof updateCounterBars === "function") updateCounterBars();
      processReceivedItem({ item:191006, location:3007, player:1, flags:0 }, 991006, 3007, { noPopup:false, noFeed:true, isSnapshot:false });
      processReceivedItem({ item:191007, location:3008, player:1, flags:0 }, 991007, 3008, { noPopup:false, noFeed:true, isSnapshot:false });
      processReceivedItem({ item:1005, location:3009, player:1, flags:0 }, 991005, 3009, { noPopup:false, noFeed:true, isSnapshot:false });
      await delay(4550);
      const drawers = Object.fromEntries(Array.from(document.querySelectorAll('#checksCountersDock .counterDrawer')).map((drawer) => [drawer.dataset.counter || "", {
        progress: drawer.querySelector('.drawerVal')?.textContent || "",
        badge: drawer.querySelector('.counterDrawerReadyBadge')?.textContent || "",
        canRedeem: drawer.classList.contains("canRedeem"),
        targetArmed: drawer.classList.contains("targetArmed"),
        open: drawer.classList.contains("open"),
        autoOpen: drawer.classList.contains("autoOpen"),
        pulse: drawer.classList.contains("pulse"),
        redeemFx: drawer.classList.contains("redeemFx")
      }]));
      return {
        missingProcess:false,
        disabled: typeof counterRewardRedemptionsDisabled === "function" ? counterRewardRedemptionsDisabled() : null,
        checksCalls,
        activeView: String(activeView || ""),
        modalTitles: modalArgs.map((args) => String(args.title || "")),
        modalTags: modalArgs.map((args) => String(args.tag || "")),
        topRightText: Array.from(document.querySelectorAll("#toastWrap .apItemToast")).map((node) => node.innerText || "").join("\n"),
        apJunk: ap?.junk ? { ...ap.junk } : null,
        junkRedeems: state?.junkRedeems ? { ...state.junkRedeems } : null,
        extraBallTokens: Number(state?.extraBallTokens || 0),
        extraBallAssignments: state?.extraBallAssignments ? { ...state.extraBallAssignments } : null,
        drawers,
        errors: runtimeErrors.slice()
      };
    }finally{
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onReject);
      try{
        if(originalShowOverviewModal){
          window.showOverviewModal = originalShowOverviewModal;
          showOverviewModal = originalShowOverviewModal;
        }
      }catch(_){}
      try{
        if(originalShowView){
          window.showView = originalShowView;
          showView = originalShowView;
        }
      }catch(_){}
      try{ document.body.className = previous.bodyClass; }catch(_){}
      try{
        if(previous.launcher === undefined) delete window.flprLauncher;
        else window.flprLauncher = previous.launcher;
      }catch(_){}
      try{
        for(const item of previous.itemNames || []){
          if(item.had) ap.itemNameById.set(item.id, item.name);
          else ap.itemNameById.delete(item.id);
        }
      }catch(_){}
      try{ if(previous.apJunk) ap.junk = { ...previous.apJunk }; }catch(_){}
      try{ state.extraBallTokens = previous.extraBallTokens; }catch(_){}
      try{
        if(previous.extraBallAssignments) state.extraBallAssignments = { ...previous.extraBallAssignments };
        else delete state.extraBallAssignments;
      }catch(_){}
      try{ state.junkRedeems = { ...previous.junkRedeems }; }catch(_){}
      try{ if(previous.receivedAll) ap.receivedAll = previous.receivedAll.map((row) => ({ ...row })); }catch(_){}
      try{ ap.receivedKeySet = new Set(previous.receivedKeySet || []); }catch(_){}
      try{ ap.receivedSeen = new Set(previous.receivedSeen || []); }catch(_){}
      try{ ap.receivedByIndex = new Map((previous.receivedByIndex || []).map(([key, value]) => [key, { ...value }])); }catch(_){}
      try{
        if(previous.rewardState == null) localStorage.removeItem("flpr_standalone_ap_reward_state_v1");
        else localStorage.setItem("flpr_standalone_ap_reward_state_v1", previous.rewardState);
      }catch(_){}
      try{ document.querySelectorAll("#toastWrap .apItemToast").forEach((node) => node.remove()); }catch(_){}
      try{ document.getElementById("ovModal")?.classList.add("hidden"); }catch(_){}
      try{ if(typeof saveReceivedList === "function") saveReceivedList(ap.receivedAll || []); }catch(_){}
      try{ if(typeof saveState === "function") saveState(); }catch(_){}
      try{
        if(typeof updateCounterBarsQuietly === "function") updateCounterBarsQuietly();
        else if(typeof updateCounterBars === "function") updateCounterBars();
      }catch(_){}
      try{ if(typeof renderReceivedList === "function") renderReceivedList(); }catch(_){}
      try{ if(typeof showView === "function") showView(previous.activeView || "checks"); }catch(_){}
    }
  });
  if(
    streamCounterReceivedFlowProbe.missingProcess ||
    streamCounterReceivedFlowProbe.disabled !== true ||
    streamCounterReceivedFlowProbe.activeView !== "checks" ||
    streamCounterReceivedFlowProbe.checksCalls < 1 ||
    !streamCounterReceivedFlowProbe.modalTitles.includes("JUNK ITEM RECEIVED") ||
    !streamCounterReceivedFlowProbe.modalTitles.includes("PINBALL FRAGMENT RECEIVED") ||
    !streamCounterReceivedFlowProbe.modalTags.includes("JUNK") ||
    !streamCounterReceivedFlowProbe.modalTags.includes("FRAG") ||
    /FILLER ITEM RECEIVED/i.test(streamCounterReceivedFlowProbe.topRightText || "") ||
    streamCounterReceivedFlowProbe.apJunk?.easy !== 1 ||
    streamCounterReceivedFlowProbe.apJunk?.med !== 1 ||
    streamCounterReceivedFlowProbe.apJunk?.frag !== 1 ||
    streamCounterReceivedFlowProbe.junkRedeems?.easy !== 0 ||
    streamCounterReceivedFlowProbe.junkRedeems?.medium !== 0 ||
    streamCounterReceivedFlowProbe.extraBallTokens !== 0 ||
    Object.keys(streamCounterReceivedFlowProbe.extraBallAssignments || {}).length !== 0 ||
    streamCounterReceivedFlowProbe.drawers?.easy?.progress !== "1/3" ||
    streamCounterReceivedFlowProbe.drawers?.med?.progress !== "1/3" ||
    streamCounterReceivedFlowProbe.drawers?.frag?.progress !== "1/5" ||
    streamCounterReceivedFlowProbe.drawers?.easy?.canRedeem ||
    streamCounterReceivedFlowProbe.drawers?.med?.canRedeem ||
    streamCounterReceivedFlowProbe.drawers?.frag?.canRedeem ||
    !streamCounterReceivedFlowProbe.drawers?.easy?.open ||
    !streamCounterReceivedFlowProbe.drawers?.med?.open ||
    !streamCounterReceivedFlowProbe.drawers?.frag?.open ||
    !streamCounterReceivedFlowProbe.drawers?.easy?.pulse ||
    !streamCounterReceivedFlowProbe.drawers?.med?.pulse ||
    !streamCounterReceivedFlowProbe.drawers?.frag?.pulse ||
    streamCounterReceivedFlowProbe.errors.length
  ){
    throw new Error(`Stream Edition counter received flow did not stay display-only with the right modal flow: ${JSON.stringify(streamCounterReceivedFlowProbe)}`);
  }

  const twitchLiveRefreshProbe = await page.evaluate(() => {
    if(typeof twitchVideoCanAutoRefresh !== "function") return { missing:true };
    const previous = {
      live: flprTwitchChat.streamLive,
      blockedAt: flprTwitchChat.videoAutoRefreshBlockedAt
    };
    try{
      flprTwitchChat.streamLive = true;
      flprTwitchChat.videoAutoRefreshBlockedAt = 0;
      const autoWhileLive = twitchVideoCanAutoRefresh("stream live", { force:true, allowWhileLive:true });
      const normalWhileLive = twitchVideoCanAutoRefresh("watchdog", { force:true });
      const manualWhileLive = twitchVideoCanAutoRefresh("manual", { force:true, manual:true });
      return { autoWhileLive, normalWhileLive, manualWhileLive };
    }finally{
      try{ flprTwitchChat.streamLive = previous.live; }catch(_){}
      try{ flprTwitchChat.videoAutoRefreshBlockedAt = previous.blockedAt; }catch(_){}
    }
  });
  if(
    twitchLiveRefreshProbe.missing ||
    twitchLiveRefreshProbe.autoWhileLive !== false ||
    twitchLiveRefreshProbe.normalWhileLive !== false ||
    twitchLiveRefreshProbe.manualWhileLive !== true
  ){
    throw new Error(`Twitch video auto-refresh was not paused while live: ${JSON.stringify(twitchLiveRefreshProbe)}`);
  }

  const explicitFillerJunkRollProbe = await page.evaluate(async () => {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const previous = {
      junk: ap?.junk ? { ...ap.junk } : null,
      junkRedeems: state?.junkRedeems ? { ...state.junkRedeems } : null,
      receivedAll: Array.isArray(ap?.receivedAll) ? ap.receivedAll.map((row) => ({ ...row })) : null,
      receivedKeySet: ap?.receivedKeySet instanceof Set ? Array.from(ap.receivedKeySet) : null,
      receivedSeen: ap?.receivedSeen instanceof Set ? Array.from(ap.receivedSeen) : null,
      receivedByIndex: ap?.receivedByIndex instanceof Map ? Array.from(ap.receivedByIndex.entries()).map(([key, value]) => [key, { ...value }]) : null,
      rewardState: localStorage.getItem("flpr_standalone_ap_reward_state_v1"),
      activeView: String(activeView || ""),
      selected: String(state?.selected || ""),
      currentWorld: String(ap?.currentWorld || ""),
      itemNameHad: !!ap?.itemNameById?.has?.(1006),
      itemName: ap?.itemNameById?.get?.(1006)
    };
    const runtimeErrors = [];
    const onError = (event) => runtimeErrors.push(String(event?.message || event?.error?.message || event || ""));
    const onReject = (event) => runtimeErrors.push(String(event?.reason?.message || event?.reason || event || ""));
    let originalShowView = null;
    let checksCalls = 0;
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onReject);
    try{
      document.querySelectorAll(".junkRollOverlay").forEach((node) => node.remove());
      if(typeof processReceivedItem !== "function") return { missingProcess:true };
      try{ if(typeof besiegedClear === "function") besiegedClear("test-explicit-filler-junk"); }catch(_){}
      try{ if(typeof showView === "function") showView("overview"); }catch(_){}
      originalShowView = showView;
      window.showView = function(next, opts){
        if(String(next || "") === "checks") checksCalls += 1;
        return originalShowView.apply(this, arguments);
      };
      showView = window.showView;
      ap.junk = { easy:2, med:0, frag:0, easyTotal:0, medTotal:0, fragTotal:0 };
      state.junkRedeems = { easy:0, medium:0 };
      if(!ap.itemNameById) ap.itemNameById = new Map();
      ap.itemNameById.set(1006, "Easy Junk Item");
      ap.receivedAll = [];
      ap.receivedKeySet = new Set();
      ap.receivedSeen = new Set();
      ap.receivedByIndex = new Map();
      localStorage.removeItem("flpr_standalone_ap_reward_state_v1");
      if(typeof updateCounterBarsQuietly === "function") updateCounterBarsQuietly();
      else if(typeof updateCounterBars === "function") updateCounterBars();
      processReceivedItem({ item:1006, location:3008, player:1, flags:0 }, 880001, 3008, { noPopup:false, noFeed:true });
      await delay(3980);
      const overlayDuring = !!document.querySelector(".junkRollOverlay");
      const dieDuring = document.querySelector(".junkRollDie")?.textContent || "";
      await delay(2820);
      const overlayAfter = !!document.querySelector(".junkRollOverlay");
      const easyDrawer = document.querySelector('#checksCountersDock .counterDrawer[data-counter="easy"]');
      const dock = document.querySelector('#checksCountersDock');
      return {
        flag: !!window.__flprStandaloneRollExplicitFillerJunk,
        overlayDuring,
        dieDuring,
        overlayAfter,
        checksCalls,
        activeView: String(activeView || ""),
        easyRedeems: Number(state?.junkRedeems?.easy || 0),
        junk: ap?.junk ? { ...ap.junk } : null,
        easyDrawerClass: easyDrawer?.className || "",
        dockClass: dock?.className || "",
        errors: runtimeErrors.slice()
      };
    }finally{
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onReject);
      try{
        if(originalShowView){
          window.showView = originalShowView;
          showView = originalShowView;
        }
      }catch(_){}
      try{ document.querySelectorAll(".junkRollOverlay").forEach((node) => node.remove()); }catch(_){}
      try{
        if(previous.itemNameHad) ap.itemNameById.set(1006, previous.itemName);
        else ap.itemNameById.delete(1006);
      }catch(_){}
      try{ if(previous.junk) ap.junk = { ...previous.junk }; }catch(_){}
      try{
        if(previous.junkRedeems) state.junkRedeems = { ...previous.junkRedeems };
        else delete state.junkRedeems;
      }catch(_){}
      try{ if(previous.receivedAll) ap.receivedAll = previous.receivedAll.map((row) => ({ ...row })); }catch(_){}
      try{ ap.receivedKeySet = new Set(previous.receivedKeySet || []); }catch(_){}
      try{ ap.receivedSeen = new Set(previous.receivedSeen || []); }catch(_){}
      try{ ap.receivedByIndex = new Map((previous.receivedByIndex || []).map(([key, value]) => [key, { ...value }])); }catch(_){}
      try{
        if(previous.rewardState == null) localStorage.removeItem("flpr_standalone_ap_reward_state_v1");
        else localStorage.setItem("flpr_standalone_ap_reward_state_v1", previous.rewardState);
      }catch(_){}
      try{ if(typeof saveReceivedList === "function") saveReceivedList(ap.receivedAll || []); }catch(_){}
      try{ state.selected = previous.selected; ap.currentWorld = previous.currentWorld; }catch(_){}
      try{ if(typeof showView === "function") showView(previous.activeView || "checks"); }catch(_){}
      try{ if(typeof renderReceivedList === "function") renderReceivedList(); }catch(_){}
      try{ if(typeof updateCounterBars === "function") updateCounterBars(); }catch(_){}
      try{ if(typeof renderChecksWorldTabs === "function") renderChecksWorldTabs(); }catch(_){}
      try{ if(typeof renderChecks === "function") renderChecks(); }catch(_){}
    }
  });
  if(
    !explicitFillerJunkRollProbe.flag ||
    explicitFillerJunkRollProbe.missingProcess ||
    !explicitFillerJunkRollProbe.overlayDuring ||
    explicitFillerJunkRollProbe.overlayAfter ||
    explicitFillerJunkRollProbe.checksCalls !== 0 ||
    explicitFillerJunkRollProbe.activeView !== "overview" ||
    /\b(?:open|autoOpen|pulse|redeemFx)\b/.test(explicitFillerJunkRollProbe.easyDrawerClass || "") ||
    /\b(?:expanded|active|showRetreatBar)\b/.test(explicitFillerJunkRollProbe.dockClass || "") ||
    explicitFillerJunkRollProbe.errors.length
  ){
    throw new Error(`Home Edition explicit filler junk did not stay on Overview without drawer animation: ${JSON.stringify(explicitFillerJunkRollProbe)}`);
  }

  const junkChecksFireOnceProbe = await page.evaluate(async () => {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const previous = {
      activeView: String(activeView || ""),
      apJunk: ap?.junk ? { ...ap.junk } : null,
      extraBallTokens: Number(state?.extraBallTokens || 0),
      junkRedeems: state?.junkRedeems ? { ...state.junkRedeems } : null,
      receivedAll: Array.isArray(ap?.receivedAll) ? ap.receivedAll.map((row) => ({ ...row })) : null,
      receivedKeySet: ap?.receivedKeySet instanceof Set ? Array.from(ap.receivedKeySet) : null,
      receivedSeen: ap?.receivedSeen instanceof Set ? Array.from(ap.receivedSeen) : null,
      receivedByIndex: ap?.receivedByIndex instanceof Map ? Array.from(ap.receivedByIndex.entries()).map(([key, value]) => [key, { ...value }]) : null,
      rewardState: localStorage.getItem("flpr_standalone_ap_reward_state_v1"),
      rollFlag: window.__flprStandaloneRollExplicitFillerJunk,
      itemNameHad: !!ap?.itemNameById?.has?.(1006),
      itemName: ap?.itemNameById?.get?.(1006)
    };
    const runtimeErrors = [];
    const onError = (event) => runtimeErrors.push(String(event?.message || event?.error?.message || event || ""));
    const onReject = (event) => runtimeErrors.push(String(event?.reason?.message || event?.reason || event || ""));
    let originalShowView = null;
    let checksCalls = 0;
    try{
      window.addEventListener("error", onError);
      window.addEventListener("unhandledrejection", onReject);
      originalShowView = showView;
      if(typeof showView === "function") showView("checks");
      else { activeView = "checks"; if(typeof setTabUI === "function") setTabUI(); }
      window.showView = function(next, opts){
        if(String(next || "") === "checks") checksCalls += 1;
        return originalShowView.apply(this, arguments);
      };
      showView = window.showView;
      window.__flprStandaloneRollExplicitFillerJunk = false;
      if(!ap.itemNameById) ap.itemNameById = new Map();
      ap.itemNameById.set(1006, "Easy Junk Item");
      ap.junk = { easy:0, med:0, frag:0, easyTotal:0, medTotal:0, fragTotal:0 };
      state.junkRedeems = { easy:0, medium:0 };
      state.extraBallTokens = 0;
      ap.receivedAll = [];
      ap.receivedKeySet = new Set();
      ap.receivedSeen = new Set();
      ap.receivedByIndex = new Map();
      localStorage.removeItem("flpr_standalone_ap_reward_state_v1");
      try{ document.getElementById("ovModal")?.classList.add("hidden"); }catch(_){}
      for(let i = 0; i < 3; i++){
        const locId = 889101 + i;
        const itemIndex = 889101 + i;
        processReceivedItem({ item:1006, location:locId, player:1, flags:0 }, itemIndex, locId, {
          noPopup:false,
          noFeed:true,
          isSnapshot:false
        });
      }
      await delay(4400);
      const easyDrawer = document.querySelector('#checksCountersDock .counterDrawer[data-counter="easy"]');
      const dock = document.querySelector('#checksCountersDock');
      return {
        checksCalls,
        activeView: String(activeView || ""),
        easyRedeems: Number(state?.junkRedeems?.easy || 0),
        mediumRedeems: Number(state?.junkRedeems?.medium || 0),
        junk: ap?.junk ? { ...ap.junk } : null,
        easyDrawerClass: easyDrawer?.className || "",
        dockClass: dock?.className || "",
        errors: runtimeErrors.slice()
      };
    }finally{
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onReject);
      try{
        if(originalShowView){
          window.showView = originalShowView;
          showView = originalShowView;
        }
      }catch(_){}
      try{ window.__flprStandaloneRollExplicitFillerJunk = previous.rollFlag; }catch(_){}
      try{
        if(previous.itemNameHad) ap.itemNameById.set(1006, previous.itemName);
        else ap.itemNameById.delete(1006);
      }catch(_){}
      try{ if(previous.apJunk) ap.junk = { ...previous.apJunk }; }catch(_){}
      try{ state.extraBallTokens = previous.extraBallTokens; }catch(_){}
      try{
        if(previous.junkRedeems) state.junkRedeems = { ...previous.junkRedeems };
        else delete state.junkRedeems;
      }catch(_){}
      try{ if(previous.receivedAll) ap.receivedAll = previous.receivedAll.map((row) => ({ ...row })); }catch(_){}
      try{ ap.receivedKeySet = new Set(previous.receivedKeySet || []); }catch(_){}
      try{ ap.receivedSeen = new Set(previous.receivedSeen || []); }catch(_){}
      try{ ap.receivedByIndex = new Map((previous.receivedByIndex || []).map(([key, value]) => [key, { ...value }])); }catch(_){}
      try{
        if(previous.rewardState == null) localStorage.removeItem("flpr_standalone_ap_reward_state_v1");
        else localStorage.setItem("flpr_standalone_ap_reward_state_v1", previous.rewardState);
      }catch(_){}
      try{ document.querySelectorAll(".junkRollOverlay").forEach((node) => node.remove()); }catch(_){}
      try{ document.getElementById("ovModal")?.classList.add("hidden"); }catch(_){}
      try{ if(typeof saveReceivedList === "function") saveReceivedList(ap.receivedAll || []); }catch(_){}
      try{ if(typeof saveState === "function") saveState(); }catch(_){}
      try{ if(typeof renderReceivedList === "function") renderReceivedList(ap.receivedAll || []); }catch(_){}
      try{ if(typeof updateCounterBars === "function") updateCounterBars(); }catch(_){}
      try{ if(typeof showView === "function") showView(previous.activeView || "checks"); }catch(_){}
    }
  });
  if(
    junkChecksFireOnceProbe.errors.length ||
    junkChecksFireOnceProbe.checksCalls !== 0 ||
    junkChecksFireOnceProbe.activeView !== "overview" ||
    junkChecksFireOnceProbe.easyRedeems !== 1 ||
    junkChecksFireOnceProbe.mediumRedeems !== 0 ||
    !junkChecksFireOnceProbe.junk ||
    junkChecksFireOnceProbe.junk.easy !== 0 ||
    junkChecksFireOnceProbe.junk.easyTotal !== 1 ||
    /\b(?:open|autoOpen|pulse|redeemFx)\b/.test(junkChecksFireOnceProbe.easyDrawerClass || "") ||
    /\b(?:expanded|active|showRetreatBar)\b/.test(junkChecksFireOnceProbe.dockClass || "")
  ){
    throw new Error(`Live junk set moved to Checks, animated the drawer, or failed to bank once: ${JSON.stringify(junkChecksFireOnceProbe)}`);
  }

  const completedCounterNormalizerProbe = await page.evaluate(() => {
    const previous = {
      activeView: String(activeView || ""),
      apJunk: ap?.junk ? { ...ap.junk } : null,
      extraBallTokens: Number(state?.extraBallTokens || 0),
      extraBallAssignments: state?.extraBallAssignments ? { ...state.extraBallAssignments } : null,
      junkRedeems: state?.junkRedeems ? { ...state.junkRedeems } : { easy:0, medium:0 },
      standaloneApRewardState: state?.standaloneApRewardState ? JSON.parse(JSON.stringify(state.standaloneApRewardState)) : null,
      rewardState: localStorage.getItem("flpr_standalone_ap_reward_state_v1")
    };
    try{
      if(typeof showView === "function") showView("checks");
      localStorage.removeItem("flpr_standalone_ap_reward_state_v1");
      ap.junk = { easy:3, med:3, frag:5, easyTotal:0, medTotal:0, fragTotal:5 };
      state.junkRedeems = { easy:0, medium:0 };
      state.extraBallTokens = 0;
      state.extraBallAssignments = {};
      if(typeof updateCounterBarsQuietly === "function") updateCounterBarsQuietly();
      else if(typeof updateCounterBars === "function") updateCounterBars();
      const afterCompleted = {
        junk: ap?.junk ? { ...ap.junk } : null,
        junkRedeems: state?.junkRedeems ? { ...state.junkRedeems } : null,
        extraBallTokens: Number(state?.extraBallTokens || 0),
        easyDrawerCanRedeem: !!document.querySelector('#checksCountersDock .counterDrawer[data-counter="easy"]')?.classList.contains("canRedeem"),
        medDrawerCanRedeem: !!document.querySelector('#checksCountersDock .counterDrawer[data-counter="med"]')?.classList.contains("canRedeem")
      };
      localStorage.removeItem("flpr_standalone_ap_reward_state_v1");
      try{ delete state.standaloneApRewardState; }catch(_){ state.standaloneApRewardState = null; }
      ap.junk = { easy:0, med:0, frag:0, easyTotal:2, medTotal:1, fragTotal:0 };
      state.junkRedeems = { easy:0, medium:0 };
      const firstDelta = typeof bankCounterRewardEarnedDeltasFromTotals === "function"
        ? bankCounterRewardEarnedDeltasFromTotals("test-delta")
        : false;
      const afterFirstDelta = state?.junkRedeems ? { ...state.junkRedeems } : null;
      const secondDelta = typeof bankCounterRewardEarnedDeltasFromTotals === "function"
        ? bankCounterRewardEarnedDeltasFromTotals("test-delta-again")
        : false;
      const afterSecondDelta = state?.junkRedeems ? { ...state.junkRedeems } : null;
      return { afterCompleted, firstDelta, afterFirstDelta, secondDelta, afterSecondDelta };
    }finally{
      try{ if(previous.apJunk) ap.junk = { ...previous.apJunk }; }catch(_){}
      try{ state.extraBallTokens = previous.extraBallTokens; }catch(_){}
      try{
        if(previous.extraBallAssignments) state.extraBallAssignments = { ...previous.extraBallAssignments };
        else delete state.extraBallAssignments;
      }catch(_){}
      try{ state.junkRedeems = { ...previous.junkRedeems }; }catch(_){}
      try{
        if(previous.standaloneApRewardState) state.standaloneApRewardState = previous.standaloneApRewardState;
        else delete state.standaloneApRewardState;
      }catch(_){}
      try{
        if(previous.rewardState == null) localStorage.removeItem("flpr_standalone_ap_reward_state_v1");
        else localStorage.setItem("flpr_standalone_ap_reward_state_v1", previous.rewardState);
      }catch(_){}
      try{ if(typeof saveState === "function") saveState(); }catch(_){}
      try{ if(typeof updateCounterBarsQuietly === "function") updateCounterBarsQuietly(); else if(typeof updateCounterBars === "function") updateCounterBars(); }catch(_){}
      try{ if(typeof showView === "function") showView(previous.activeView || "checks"); }catch(_){}
    }
  });
  if(
    completedCounterNormalizerProbe.afterCompleted?.junk?.easy !== 0 ||
    completedCounterNormalizerProbe.afterCompleted?.junk?.med !== 0 ||
    completedCounterNormalizerProbe.afterCompleted?.junk?.frag !== 0 ||
    completedCounterNormalizerProbe.afterCompleted?.junk?.easyTotal !== 1 ||
    completedCounterNormalizerProbe.afterCompleted?.junk?.medTotal !== 1 ||
    completedCounterNormalizerProbe.afterCompleted?.junkRedeems?.easy !== 1 ||
    completedCounterNormalizerProbe.afterCompleted?.junkRedeems?.medium !== 1 ||
    completedCounterNormalizerProbe.afterCompleted?.extraBallTokens !== 1 ||
    !completedCounterNormalizerProbe.afterCompleted?.easyDrawerCanRedeem ||
    !completedCounterNormalizerProbe.afterCompleted?.medDrawerCanRedeem ||
    completedCounterNormalizerProbe.firstDelta !== true ||
    completedCounterNormalizerProbe.afterFirstDelta?.easy !== 2 ||
    completedCounterNormalizerProbe.afterFirstDelta?.medium !== 1 ||
    completedCounterNormalizerProbe.secondDelta !== false ||
    completedCounterNormalizerProbe.afterSecondDelta?.easy !== 2 ||
    completedCounterNormalizerProbe.afterSecondDelta?.medium !== 1
  ){
    throw new Error(`Completed junk counters did not bank once or inventory deltas re-added: ${JSON.stringify(completedCounterNormalizerProbe)}`);
  }

  const counterRewardModalProbe = await page.evaluate(async () => {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const previous = {
      activeView: String(activeView || ""),
      junk: ap?.junk ? { ...ap.junk } : null,
      extraBallTokens: Number(state?.extraBallTokens || 0),
      junkRedeems: state?.junkRedeems ? { ...state.junkRedeems } : { easy:0, medium:0 },
      receivedAll: Array.isArray(ap?.receivedAll) ? ap.receivedAll.map((row) => ({ ...row })) : null,
      receivedKeySet: ap?.receivedKeySet instanceof Set ? Array.from(ap.receivedKeySet) : null,
      rewardState: localStorage.getItem("flpr_standalone_ap_reward_state_v1")
    };
    const runtimeErrors = [];
    const onError = (event) => runtimeErrors.push(String(event?.message || event?.error?.message || event || ""));
    const onReject = (event) => runtimeErrors.push(String(event?.reason?.message || event?.reason || event || ""));
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onReject);
    try{
      try{ document.getElementById("ovModal")?.classList.add("hidden"); }catch(_){}
      try{ standaloneItemPanel?.counterRewardModalSeen?.clear?.(); }catch(_){}
      try{ if(typeof showView === "function") showView("overview"); }catch(_){}
      await delay(40);
      if(typeof processReceivedItem !== "function") return { missingProcess:true };
      processReceivedItem({ item:1005, location:3009, player:1, flags:0 }, 881005, 3009, {
        noPopup:false,
        noFeed:true,
        isSnapshot:true
      });
      await delay(320);
      const modal = document.getElementById("ovModal");
      const card = document.getElementById("ovModalCard");
      const big = document.getElementById("ovModalBig");
      return {
        missingProcess:false,
        visible: !!modal && !modal.classList.contains("hidden"),
        title: document.getElementById("ovModalTitle")?.textContent || "",
        tag: document.getElementById("ovModalTag")?.textContent || "",
        big: big?.textContent || "",
        sub: document.getElementById("ovModalSub")?.textContent || "",
        meta: document.getElementById("ovModalMeta")?.textContent || "",
        cardCls: card?.className || "",
        bigCls: big?.className || "",
        activeView: String(activeView || ""),
        errors: runtimeErrors.slice()
      };
    }finally{
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onReject);
      try{ document.getElementById("ovModal")?.classList.add("hidden"); }catch(_){}
      try{ if(previous.junk) ap.junk = { ...previous.junk }; }catch(_){}
      try{ state.extraBallTokens = previous.extraBallTokens; }catch(_){}
      try{ state.junkRedeems = { ...previous.junkRedeems }; }catch(_){}
      try{ if(previous.receivedAll) ap.receivedAll = previous.receivedAll.map((row) => ({ ...row })); }catch(_){}
      try{ ap.receivedKeySet = new Set(previous.receivedKeySet || []); }catch(_){}
      try{
        if(previous.rewardState == null) localStorage.removeItem("flpr_standalone_ap_reward_state_v1");
        else localStorage.setItem("flpr_standalone_ap_reward_state_v1", previous.rewardState);
      }catch(_){}
      try{ if(typeof saveReceivedList === "function") saveReceivedList(ap.receivedAll || []); }catch(_){}
      try{ if(typeof saveState === "function") saveState(); }catch(_){}
      try{ if(typeof renderReceivedList === "function") renderReceivedList(); }catch(_){}
      try{ if(typeof updateCounterBars === "function") updateCounterBars(); }catch(_){}
      try{ if(typeof showView === "function") showView(previous.activeView || "checks"); }catch(_){}
    }
  });
  if(
    counterRewardModalProbe.missingProcess ||
    !counterRewardModalProbe.visible ||
    !/PINBALL FRAGMENT RECEIVED/i.test(counterRewardModalProbe.title || "") ||
    !/FRAG/i.test(counterRewardModalProbe.tag || "") ||
    !/Pinball Fragment/i.test(counterRewardModalProbe.big || "") ||
    !/FROM; AshodinNoTrap/i.test(counterRewardModalProbe.sub || "") ||
    !/Dirty Harry - Junk Lane 3/i.test(counterRewardModalProbe.meta || "") ||
    !/\bapItem-filler\b/.test(counterRewardModalProbe.cardCls || "") ||
    !/\bapItem-filler\b/.test(counterRewardModalProbe.bigCls || "") ||
    counterRewardModalProbe.errors.length
  ){
    throw new Error(`Counter reward snapshot item did not show the full received modal: ${JSON.stringify(counterRewardModalProbe)}`);
  }

  const junkTaskRedeemProbe = await page.evaluate(async () => {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const runtimeErrors = [];
    const onError = (event) => runtimeErrors.push(String(event?.message || event?.error?.message || event || ""));
    const onReject = (event) => runtimeErrors.push(String(event?.reason?.message || event?.reason || event || ""));
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onReject);
    const previous = {
      selected: String(state?.selected || ""),
      currentWorld: String(ap?.currentWorld || ""),
      activeView: String(activeView || ""),
      easyRedeems: Number(state?.junkRedeems?.easy || 0),
      mediumRedeems: Number(state?.junkRedeems?.medium || 0),
      checked3001: !!ap?.checked?.has?.(3001),
      checked3010: !!ap?.checked?.has?.(3010),
      pending3001: ap?.pendingByLoc?.get?.(3001) || null,
      pending3010: ap?.pendingByLoc?.get?.(3010) || null,
      junkTarget: ap?.junkRedeemTarget ? { ...ap.junkRedeemTarget } : null
    };
    let originalApSend = null;
    const sentPackets = [];
    try{
      originalApSend = apSend;
      apSend = (packet) => {
        try{ sentPackets.push(JSON.parse(JSON.stringify(packet))); }catch(_){ sentPackets.push(packet); }
        return true;
      };
      window.apSend = apSend;
    }catch(_){}
    const result = {
      easy:{},
      medium:{},
      errors: runtimeErrors,
      sentPackets
    };
    const syntheticLocs = [];
    const makeSyntheticTaskCandidate = (diff) => {
      const worlds = Object.keys(state?.worlds || {}).filter((wk) => {
        try { return wk !== "boss" && !isBossWorldId(wk, state) && Array.isArray(state.worlds[wk]?.tables) && state.worlds[wk].tables.length; } catch (_) { return false; }
      });
      const world = worlds[0] || "";
      const idx = 0;
      const tableName = String(state?.worlds?.[world]?.tables?.[idx] || "").trim();
      if(!world || !tableName) return null;
      const tableKey = `${world}|${idx}`;
      const mapKey = typeof canonicalTableMapKey === "function" ? canonicalTableMapKey(tableName) : tableName.toLowerCase();
      const locId = diff === "medium" ? 399902 : 399901;
      const label = diff === "medium" ? "Medium Synthetic Task" : "Easy Synthetic Task";
      const node = {
        id: locId,
        full: `${tableName} - ${label}`,
        short: label,
        tableName,
        tableKey: mapKey,
        genericDifficulty: diff,
        genericTaskType: "task",
        taskShuffleEntry: {
          location: `${tableName} - ${label}`,
          table: tableName,
          target_table: tableName,
          source_table: tableName,
          difficulty: diff,
          kind: "task",
          task_type: "task",
          objective: label,
          display_name: label,
          title: label,
          explanation: `Synthetic ${diff} task used by the Home Edition junk redeem crash regression.`
        }
      };
      const previousList = ap.locsByTableKey.get(mapKey) || [];
      if(!previousList.some((entry) => Number(entry?.id) === locId)){
        ap.locsByTableKey.set(mapKey, previousList.concat(node).sort((a, b) => Number(a?.id || 0) - Number(b?.id || 0)));
      }
      ap.locById.set(locId, node);
      ap.locNameById.set(locId, node.full);
      syntheticLocs.push({ mapKey, locId });
      return { tableKey, world, idx, tableName, locId, taskName:label, node, synthetic:true };
    };
    const findTaskCandidate = (diff) => {
      const want = String(diff || "").toLowerCase();
      for(const [tableKey, list] of (ap?.locsByTableKey || new Map()).entries()){
        const parts = String(tableKey || "").split("|");
        const world = String(parts[0] || "");
        const idx = Number(parts[1]);
        if(!tableKey || !world || !Number.isFinite(idx)) continue;
        const tableName = String(state?.worlds?.[world]?.tables?.[idx] || "").trim();
        (list || []);
        for(let nodeIdx = 0; nodeIdx < (list || []).length; nodeIdx++){
          const n = list[nodeIdx];
          if(!n) continue;
          const difficulty = String(n.genericDifficulty || inferLocationDifficulty(n) || inferLocationDifficultyByIndex(nodeIdx) || "").toLowerCase();
          if(difficulty !== want) continue;
          const taskName = String(typeof getTaskNameFromLocationNode === "function" ? getTaskNameFromLocationNode(n) : (n.short || n.full || "")).trim();
          if(!taskName || /\bscore\b/i.test(taskName)) continue;
          return { tableKey, world, idx, tableName, locId:Number(n.id), taskName, node:n };
        }
      }
      return makeSyntheticTaskCandidate(want);
    };
    const unlockTable = (key, ballLevel) => {
      const parts = String(key || "").split("|");
      const world = String(parts[0] || "");
      const idx = Number(parts[1]);
      if(!key || !world || !Number.isFinite(idx)) return { key, world, idx, ok:false };
      state.worlds[world].locked = false;
      state.balls = state.balls || {};
      for(let ball = 1; ball <= Math.max(1, Number(ballLevel) || 1); ball++) state.balls[`${key}|${ball}`] = true;
      state.selected = world;
      ap.currentWorld = world;
      state.nowPlaying = state.nowPlaying || {};
      state.nowPlaying[world] = idx;
      return { key, world, idx, ok:true };
    };
    const redeemViaDrawer = async (diff, ballLevel) => {
      const candidate = findTaskCandidate(diff);
      const prep = unlockTable(candidate?.tableKey || "", ballLevel);
      const locId = Number(candidate?.locId || 0);
      if(locId){
        ap.checked.delete(locId);
        ap.pendingByLoc.delete(locId);
      }
      state.junkRedeems = state.junkRedeems || { easy:0, medium:0 };
      state.junkRedeems[diff] = 1;
      ap.junkRedeemTarget = ap.junkRedeemTarget || { active:false, difficulty:"" };
      ap.junkRedeemTarget.active = false;
      ap.junkRedeemTarget.difficulty = "";
      if(typeof showView === "function") showView("checks");
      else { activeView = "checks"; if(typeof setTabUI === "function") setTabUI(); }
      if(typeof renderChecksWorldTabs === "function") renderChecksWorldTabs();
      if(typeof renderChecks === "function") renderChecks();
      if(typeof updateCounterBars === "function") updateCounterBars();
      await delay(80);
      const armed = typeof armJunkRedeemTargetMode === "function" ? !!armJunkRedeemTargetMode(diff) : false;
      const afterArmActive = !!ap?.junkRedeemTarget?.active;
      if(armed && !afterArmActive){
        ap.junkRedeemTarget.active = true;
        ap.junkRedeemTarget.difficulty = diff;
      }
      await delay(120);
      const node = document.querySelector(`#checksBody .tableBlock[data-tablekey="${CSS.escape(prep.key)}"] .nodeBtn[data-locid="${Number(locId)}"]`);
      const beforeBalance = Number(state?.junkRedeems?.[diff] || 0);
      if(node) node.click();
      await delay(420);
      return {
        candidate: candidate ? { tableKey:candidate.tableKey, locId:candidate.locId, taskName:candidate.taskName, tableName:candidate.tableName } : null,
        prep,
        armed,
        afterArmActive,
        nodeFound: !!node,
        nodeClass: node?.className || "",
        beforeBalance,
        afterBalance: Number(state?.junkRedeems?.[diff] || 0),
        pending: !!ap?.pendingByLoc?.has?.(locId),
        checked: !!ap?.checked?.has?.(locId),
        activeView: String(activeView || ""),
        targetActive: !!ap?.junkRedeemTarget?.active,
        bodyHasTable: !!candidate?.tableName && (document.querySelector("#checksBody")?.innerText || "").includes(candidate.tableName)
      };
    };
    try{
      result.easy = await redeemViaDrawer("easy", 1);
      result.medium = await redeemViaDrawer("medium", 2);
      await delay(250);
      result.errors = runtimeErrors.slice();
      result.alive = !!document.body && document.body.classList.contains("flprStandaloneOriginalClient");
      result.connected = !!ap?.connected;
      return result;
    }finally{
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onReject);
      try{
        if(previous.checked3001) ap.checked.add(3001); else ap.checked.delete(3001);
        if(previous.checked3010) ap.checked.add(3010); else ap.checked.delete(3010);
        if(previous.pending3001) ap.pendingByLoc.set(3001, previous.pending3001); else ap.pendingByLoc.delete(3001);
        if(previous.pending3010) ap.pendingByLoc.set(3010, previous.pending3010); else ap.pendingByLoc.delete(3010);
        state.junkRedeems.easy = previous.easyRedeems;
        state.junkRedeems.medium = previous.mediumRedeems;
        if(previous.junkTarget) ap.junkRedeemTarget = previous.junkTarget;
        if(originalApSend){
          apSend = originalApSend;
          window.apSend = originalApSend;
        }
        syntheticLocs.forEach(({ mapKey, locId }) => {
          try{
            const list = ap.locsByTableKey.get(mapKey) || [];
            ap.locsByTableKey.set(mapKey, list.filter((entry) => Number(entry?.id) !== Number(locId)));
            ap.locById.delete(locId);
            ap.locNameById.delete(locId);
          }catch(_){}
        });
        state.selected = previous.selected;
        ap.currentWorld = previous.currentWorld;
        if(typeof showView === "function") showView(previous.activeView || "checks");
        if(typeof renderChecksWorldTabs === "function") renderChecksWorldTabs();
        if(typeof renderChecks === "function") renderChecks();
        if(typeof updateCounterBars === "function") updateCounterBars();
      }catch(_){}
    }
  });
  if(
    !junkTaskRedeemProbe.alive ||
    junkTaskRedeemProbe.errors.length ||
    !junkTaskRedeemProbe.easy.armed ||
    !junkTaskRedeemProbe.easy.nodeFound ||
    !junkTaskRedeemProbe.easy.pending ||
    junkTaskRedeemProbe.easy.afterBalance !== 0 ||
    !junkTaskRedeemProbe.medium.armed ||
    !junkTaskRedeemProbe.medium.nodeFound ||
    !junkTaskRedeemProbe.medium.pending ||
    junkTaskRedeemProbe.medium.afterBalance !== 0
  ){
    throw new Error(`Easy/Medium task junk redeem flow crashed or failed: ${JSON.stringify(junkTaskRedeemProbe)}`);
  }

  const checksVisibleOpenTableProbe = await page.evaluate(async () => {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const worldKey = Object.keys(state?.worlds || {}).find((wk) => {
      if(!wk || wk === "boss") return false;
      return Array.isArray(state.worlds[wk]?.tables) && state.worlds[wk].tables.length >= 2;
    });
    if(!worldKey) return { missingWorld:true };
    const firstKey = `${worldKey}|0`;
    const targetKey = `${worldKey}|1`;
    const ballKeys = [1, 2, 3].flatMap((ball) => [`${firstKey}|${ball}`, `${targetKey}|${ball}`]);
    const previous = {
      selected: state.selected,
      currentWorld: ap.currentWorld,
      nowPlaying: state.nowPlaying ? state.nowPlaying[worldKey] : undefined,
      activeView: typeof activeView !== "undefined" ? activeView : "",
      extraBallAssignments: { ...(state.extraBallAssignments || {}) },
      balls: Object.fromEntries(ballKeys.map((key) => [key, state.balls ? state.balls[key] : undefined]))
    };
    const restoreBall = (key, value) => {
      state.balls = state.balls || {};
      if(value === undefined) delete state.balls[key];
      else state.balls[key] = value;
    };
    try{
      if(typeof showView === "function") showView("tower");
      await delay(60);
      state.balls = state.balls || {};
      state.extraBallAssignments = state.extraBallAssignments || {};
      state.nowPlaying = state.nowPlaying || {};
      [1, 2, 3].forEach((ball) => {
        state.balls[`${firstKey}|${ball}`] = ball === 1;
        delete state.balls[`${targetKey}|${ball}`];
      });
      state.extraBallAssignments[targetKey] = 1;
      state.selected = worldKey;
      ap.currentWorld = worldKey;
      state.nowPlaying[worldKey] = 0;
      if(typeof showView === "function") showView("checks");
      if(typeof renderChecksWorldTabs === "function") renderChecksWorldTabs();
      if(typeof renderChecks === "function") renderChecks();
      await delay(60);
      const keyEsc = CSS && CSS.escape ? CSS.escape(targetKey) : targetKey;
      const target = document.querySelector(`#checksBody .tableBlock[data-tablekey="${keyEsc}"]`);
      const before = {
        targetExists: !!target,
        targetLocked: !!target?.classList?.contains("lockedTable"),
        baseLevel: typeof getBallLevelByTableKey === "function" ? Number(getBallLevelByTableKey(targetKey) || 0) : null,
        displayLevel: typeof getDisplayBallStateForTableKey === "function" ? Number(getDisplayBallStateForTableKey(targetKey)?.level || 0) : null,
        nowPlaying: Number(state.nowPlaying[worldKey])
      };
      if(!target) return { before, missingTarget:true, worldKey, targetKey };
      target.dispatchEvent(new PointerEvent("pointerdown", { bubbles:true, button:0, pointerId:9 }));
      target.dispatchEvent(new MouseEvent("mousedown", { bubbles:true, button:0 }));
      target.dispatchEvent(new MouseEvent("click", { bubbles:true, button:0 }));
      for(let n = 0; n < 8; n++){
        target.dispatchEvent(new PointerEvent("pointerdown", { bubbles:true, button:0, pointerId:19 + n }));
        target.dispatchEvent(new MouseEvent("mousedown", { bubbles:true, button:0 }));
        target.dispatchEvent(new MouseEvent("click", { bubbles:true, button:0 }));
      }
      await delay(120);
      const syncResult = (typeof syncNowPlayingIndexesToUnlockedTables === "function")
        ? syncNowPlayingIndexesToUnlockedTables({ save:false, render:true })
        : null;
      if(typeof renderChecksWorldTabs === "function") renderChecksWorldTabs();
      if(typeof renderChecks === "function") renderChecks();
      await delay(260);
      const activeCard = document.querySelector("#checksBody .tableBlock.nowPlayingChecks")?.getAttribute("data-tablekey") || "";
      const bridge = typeof window.flprStandaloneChecksSelectionBridgeState === "function"
        ? window.flprStandaloneChecksSelectionBridgeState()
        : null;
      return {
        worldKey,
        targetKey,
        targetName: state.worlds[worldKey]?.tables?.[1] || "",
        before,
        syncResult,
        afterNowPlaying: Number(state.nowPlaying[worldKey]),
        activeCard,
        bridge,
        schedulerStats: { ...(window.__flprStandaloneChecksSelectionSchedulerStats || {}) },
        lastPrime: window.__flprStandaloneLastChecksTablePrime || null
      };
    }finally{
      try{
        if(typeof showView === "function") showView("tower");
        await delay(60);
        ballKeys.forEach((key) => restoreBall(key, previous.balls[key]));
        state.extraBallAssignments = previous.extraBallAssignments;
        state.selected = previous.selected;
        ap.currentWorld = previous.currentWorld;
        if(previous.nowPlaying === undefined) delete state.nowPlaying[worldKey];
        else state.nowPlaying[worldKey] = previous.nowPlaying;
        if(typeof showView === "function") showView(previous.activeView || "checks");
        if(typeof renderChecksWorldTabs === "function") renderChecksWorldTabs();
        if(typeof renderChecks === "function") renderChecks();
      }catch(_){}
    }
  });
  if(
    checksVisibleOpenTableProbe.missingWorld ||
    checksVisibleOpenTableProbe.missingTarget ||
    checksVisibleOpenTableProbe.before?.targetLocked ||
    checksVisibleOpenTableProbe.before?.baseLevel !== 0 ||
    !(checksVisibleOpenTableProbe.before?.displayLevel > 0) ||
    checksVisibleOpenTableProbe.syncResult !== false ||
    checksVisibleOpenTableProbe.afterNowPlaying !== 1 ||
    checksVisibleOpenTableProbe.activeCard !== checksVisibleOpenTableProbe.targetKey ||
    Number(checksVisibleOpenTableProbe.schedulerStats?.applyTimers || 0) > 6 ||
    Number(checksVisibleOpenTableProbe.schedulerStats?.holdTimers || 0) > 11 ||
    checksVisibleOpenTableProbe.bridge?.key !== checksVisibleOpenTableProbe.targetKey
  ){
    throw new Error(`Checks visible-open table selection did not stick: ${JSON.stringify(checksVisibleOpenTableProbe)}`);
  }

  const checksTowerSelectionSyncProbe = await page.evaluate(async () => {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const worldKey = Object.keys(state?.worlds || {}).find((wk) => {
      if(!wk || wk === "boss") return false;
      return Array.isArray(state.worlds[wk]?.tables) && state.worlds[wk].tables.length >= 2;
    });
    if(!worldKey) return { missingWorld:true };
    const targetKey = `${worldKey}|0`;
    const fallbackKey = `${worldKey}|1`;
    const ballKeys = [1, 2, 3].flatMap((ball) => [`${targetKey}|${ball}`, `${fallbackKey}|${ball}`]);
    const previous = {
      selected: state.selected,
      currentWorld: ap.currentWorld,
      nowPlaying: state.nowPlaying ? state.nowPlaying[worldKey] : undefined,
      activeView: typeof activeView !== "undefined" ? activeView : "",
      extraBallAssignments: { ...(state.extraBallAssignments || {}) },
      balls: Object.fromEntries(ballKeys.map((key) => [key, state.balls ? state.balls[key] : undefined]))
    };
    const restoreBall = (key, value) => {
      state.balls = state.balls || {};
      if(value === undefined) delete state.balls[key];
      else state.balls[key] = value;
    };
    try{
      if(typeof showView === "function") showView("tower");
      await delay(60);
      state.balls = state.balls || {};
      state.extraBallAssignments = state.extraBallAssignments || {};
      state.nowPlaying = state.nowPlaying || {};
      [1, 2, 3].forEach((ball) => {
        delete state.balls[`${targetKey}|${ball}`];
        state.balls[`${fallbackKey}|${ball}`] = ball === 1;
      });
      state.extraBallAssignments[targetKey] = 1;
      delete state.extraBallAssignments[fallbackKey];
      state.selected = worldKey;
      ap.currentWorld = worldKey;
      state.nowPlaying[worldKey] = 0;
      if(typeof showView === "function") showView("tower");
      if(typeof showView === "function") showView("checks");
      if(typeof renderChecksWorldTabs === "function") renderChecksWorldTabs();
      if(typeof renderChecks === "function") renderChecks();
      await delay(120);
      const beforeActive = document.querySelector("#checksBody .tableBlock.nowPlayingChecks")?.getAttribute("data-tablekey") || "";
      const beforeBridge = typeof window.flprStandaloneChecksSelectionBridgeState === "function"
        ? window.flprStandaloneChecksSelectionBridgeState()
        : null;
      const syncResult = (typeof syncNowPlayingIndexesToUnlockedTables === "function")
        ? syncNowPlayingIndexesToUnlockedTables({ save:false, render:true })
        : null;
      if(typeof renderChecksWorldTabs === "function") renderChecksWorldTabs();
      if(typeof renderChecks === "function") renderChecks();
      await delay(420);
      const afterActive = document.querySelector("#checksBody .tableBlock.nowPlayingChecks")?.getAttribute("data-tablekey") || "";
      await delay(10500);
      const syncAfterTenSecondsResult = (typeof syncNowPlayingIndexesToUnlockedTables === "function")
        ? syncNowPlayingIndexesToUnlockedTables({ save:false, render:true })
        : null;
      if(typeof renderChecksWorldTabs === "function") renderChecksWorldTabs();
      if(typeof renderChecks === "function") renderChecks();
      await delay(160);
      const afterTenSecondsActive = document.querySelector("#checksBody .tableBlock.nowPlayingChecks")?.getAttribute("data-tablekey") || "";
      const logTextBeforeReconcile = Object.values(apLogBuffers || {}).flat().join("\\n");
      const resyncLogCountBefore = (logTextBeforeReconcile.match(/Now Playing resynced to currently open table\\(s\\)\\./g) || []).length;
      if(typeof apReconcileWorldStateFromReceived === "function") apReconcileWorldStateFromReceived();
      await delay(260);
      const afterReconcileActive = document.querySelector("#checksBody .tableBlock.nowPlayingChecks")?.getAttribute("data-tablekey") || "";
      const logTextAfterReconcile = Object.values(apLogBuffers || {}).flat().join("\\n");
      const resyncLogCountAfter = (logTextAfterReconcile.match(/Now Playing resynced to currently open table\\(s\\)\\./g) || []).length;
      const directWriteBefore = Number(state.nowPlaying[worldKey]);
      state.nowPlaying[worldKey] = 1;
      if(typeof renderChecksWorldTabs === "function") renderChecksWorldTabs();
      if(typeof renderChecks === "function") renderChecks();
      await delay(120);
      const afterDirectWriteActive = document.querySelector("#checksBody .tableBlock.nowPlayingChecks")?.getAttribute("data-tablekey") || "";
      const afterBridge = typeof window.flprStandaloneChecksSelectionBridgeState === "function"
        ? window.flprStandaloneChecksSelectionBridgeState()
        : null;
      return {
        worldKey,
        targetKey,
        fallbackKey,
        beforeActive,
        syncResult,
        afterActive,
        syncAfterTenSecondsResult,
        afterTenSecondsActive,
        afterReconcileActive,
        resyncLogCountBefore,
        resyncLogCountAfter,
        afterDirectWriteActive,
        directWriteBefore,
        nowPlaying: Number(state.nowPlaying[worldKey]),
        beforeBridge,
        afterBridge,
        trace: Array.isArray(window.__flprStandaloneChecksSelectionTrace) ? window.__flprStandaloneChecksSelectionTrace.slice(-12) : []
      };
    }finally{
      try{
        if(typeof showView === "function") showView("tower");
        await delay(60);
        ballKeys.forEach((key) => restoreBall(key, previous.balls[key]));
        state.extraBallAssignments = previous.extraBallAssignments;
        state.selected = previous.selected;
        ap.currentWorld = previous.currentWorld;
        if(previous.nowPlaying === undefined) delete state.nowPlaying[worldKey];
        else state.nowPlaying[worldKey] = previous.nowPlaying;
        if(typeof showView === "function") showView(previous.activeView || "checks");
        if(typeof renderChecksWorldTabs === "function") renderChecksWorldTabs();
        if(typeof renderChecks === "function") renderChecks();
      }catch(_){}
    }
  });
  if(
    checksTowerSelectionSyncProbe.missingWorld ||
    checksTowerSelectionSyncProbe.beforeActive !== checksTowerSelectionSyncProbe.targetKey ||
    checksTowerSelectionSyncProbe.syncResult !== false ||
    checksTowerSelectionSyncProbe.afterActive !== checksTowerSelectionSyncProbe.targetKey ||
    checksTowerSelectionSyncProbe.syncAfterTenSecondsResult !== false ||
    checksTowerSelectionSyncProbe.afterTenSecondsActive !== checksTowerSelectionSyncProbe.targetKey ||
    checksTowerSelectionSyncProbe.afterReconcileActive !== checksTowerSelectionSyncProbe.targetKey ||
    checksTowerSelectionSyncProbe.resyncLogCountAfter !== checksTowerSelectionSyncProbe.resyncLogCountBefore ||
    checksTowerSelectionSyncProbe.afterDirectWriteActive !== checksTowerSelectionSyncProbe.targetKey ||
    checksTowerSelectionSyncProbe.directWriteBefore !== 0 ||
    checksTowerSelectionSyncProbe.nowPlaying !== 0 ||
    checksTowerSelectionSyncProbe.afterBridge?.key !== checksTowerSelectionSyncProbe.targetKey
  ){
    throw new Error(`Checks view-open table selection was still overwritten by sync: ${JSON.stringify(checksTowerSelectionSyncProbe)}`);
  }

  await page.locator(".flprStandaloneConnectLayout #apClientSayInput").fill("!hint Secret Passage");
  await page.locator(".flprStandaloneConnectLayout #apClientSayBtn").click();

  try {
    await waitFor(page, `
      const log = document.querySelector('.flprStandaloneConnectLayout #apConnLogBody')?.innerText || '';
      return log.includes('!hint Secret Passage') && log.includes('[Hint]: Secret Passage contains Arrows (10) for AshodinNoTrap.');
    `, 10000);
  } catch (err) {
    const state = await page.evaluate(`
      (() => ({
        logText: Array.from(document.querySelectorAll('#apConnLogBody')).map((node, index) => '--- log ' + index + ' ---\\n' + (node.innerText || '')).join('\\n'),
        inputValue: (document.querySelector('.flprStandaloneConnectLayout #apClientSayInput') || document.getElementById('apClientSayInput'))?.value || '',
        wsState: ap?.ws ? { readyState: ap.ws.readyState, url: ap.ws.url || '' } : null
      }))()
    `);
    console.log(JSON.stringify({ ok: false, phase: "after-say", serverReceivedPackets: apServer.received, state }, null, 2));
    throw err;
  }

  const hintTabProbe = await page.evaluate(`(() => ({
    activeTab: Array.from(document.querySelectorAll('.flprStandaloneConnectLayout #apLogTabs .apLogTab')).find((btn) => btn.classList.contains('active'))?.dataset?.aplogTab || '',
    hintCards: document.querySelectorAll('.flprStandaloneConnectLayout #apConnLogBody .apHintCard').length,
    serverHintCards: document.querySelectorAll('.flprStandaloneConnectLayout #apConnLogBody .apServerHintCard').length,
    text: document.querySelector('.flprStandaloneConnectLayout #apConnLogBody')?.innerText || ''
  }))()`);
  if(
    hintTabProbe.activeTab !== "hints" ||
    hintTabProbe.hintCards < 1 ||
    hintTabProbe.serverHintCards < 2 ||
    !hintTabProbe.text.includes("[Hint]: Secret Passage contains Arrows (10) for AshodinNoTrap.") ||
    !hintTabProbe.text.includes("SERVER HINTS FOR OUR CHECKS") ||
    !hintTabProbe.text.includes("Pegasus Boots") ||
    !hintTabProbe.text.includes("Vector Test Table - Skill Shot") ||
    !hintTabProbe.text.includes("UNCOLLECTED") ||
    !hintTabProbe.text.includes("PRIORITY; PROGRESSION") ||
    !hintTabProbe.text.includes("Rupees (300)") ||
    !hintTabProbe.text.includes("FOUND") ||
    !hintTabProbe.text.includes("PRIORITY; FILLER") ||
    !hintTabProbe.text.includes("ALTTPP3")
  ){
    throw new Error(`AP Hint tab did not capture the hint request/response: ${JSON.stringify(hintTabProbe)}`);
  }
  await page.locator(".flprStandaloneConnectLayout .apLogTab[data-aplog-tab='status']").click();

  const logColorStats = await page.evaluate(`
    (() => ({
      timestamps: document.querySelectorAll('.flprStandaloneConnectLayout #apConnLogBody .apLogTimestamp').length,
      players: Array.from(document.querySelectorAll('.flprStandaloneConnectLayout #apConnLogBody .apLogPlayer')).map((node) => node.innerText),
      items: Array.from(document.querySelectorAll('.flprStandaloneConnectLayout #apConnLogBody .apLogItem')).map((node) => ({
        text: node.innerText,
        cls: node.className,
        title: node.getAttribute('title') || '',
        tip: node.getAttribute('data-ap-item-tooltip') || '',
        type: node.getAttribute('data-ap-item-type') || ''
      })),
      locations: Array.from(document.querySelectorAll('.flprStandaloneConnectLayout #apConnLogBody .apLogLocation')).map((node) => node.innerText),
      hints: Array.from(document.querySelectorAll('.flprStandaloneConnectLayout #apConnLogBody .apLogHint')).map((node) => node.innerText)
    }))()
  `);
  if(
    logColorStats.timestamps < 3 ||
    !logColorStats.players.some((text) => text.includes("ALTTPP3")) ||
    !logColorStats.items.some((item) => item.text.includes("Ethereal Crossbow") && item.cls.includes("apItem-progression")) ||
    !logColorStats.items.some((item) => item.text.includes("Bug-Catching Net") && item.cls.includes("apItem-useful")) ||
    !logColorStats.items.some((item) => item.text.includes("Progressive Ball") && item.cls.includes("apItem-progression")) ||
    !logColorStats.items.some((item) => item.text.includes("Arrows (10)") && item.cls.includes("apItem-useful")) ||
    !logColorStats.items.some((item) => item.text.includes("Ethereal Crossbow") && item.title === "" && item.tip === "Progression Item" && item.type === "progression") ||
    !logColorStats.items.some((item) => item.text.includes("Bug-Catching Net") && item.title === "" && item.tip === "Useful Item" && item.type === "useful") ||
    !logColorStats.items.some((item) => item.text.includes("Rupees (300)") && item.title === "" && item.tip === "Filler Item" && item.type === "filler") ||
    !logColorStats.locations.some((text) => text.includes("Link's Uncle")) ||
    !logColorStats.hints.some((text) => text.includes("[Hint]") || text.includes("!hint"))
  ){
    throw new Error(`AP log color coding did not render expected spans: ${JSON.stringify(logColorStats)}`);
  }

  const logItemTooltipProbe = await page.evaluate(`
    (() => {
      const item = Array.from(document.querySelectorAll('.flprStandaloneConnectLayout #apConnLogBody .apLogItem[data-ap-item-tooltip]'))
        .find((node) => (node.innerText || '').includes('Bug-Catching Net'));
      if(!item) return { missing:true };
      const rect = item.getBoundingClientRect();
      const x = rect.left + Math.max(2, rect.width / 2);
      const y = rect.top + Math.max(2, rect.height / 2);
      item.dispatchEvent(new PointerEvent('pointerover', { bubbles:true, clientX:x, clientY:y, pointerId:42 }));
      item.dispatchEvent(new PointerEvent('pointermove', { bubbles:true, clientX:x + 6, clientY:y + 4, pointerId:42 }));
      const tip = document.getElementById('standaloneApItemHoverTip');
      const result = {
        missing:false,
        itemTitle: item.getAttribute('title') || '',
        itemTip: item.getAttribute('data-ap-item-tooltip') || '',
        itemType: item.getAttribute('data-ap-item-type') || '',
        visible: !!tip?.classList?.contains('visible'),
        text: tip?.innerText || '',
        cls: tip?.className || '',
        left: tip?.style?.left || '',
        top: tip?.style?.top || ''
      };
      item.dispatchEvent(new PointerEvent('pointerout', { bubbles:true, clientX:x + 6, clientY:y + 4, pointerId:42, relatedTarget:null }));
      return result;
    })()
  `);
  if(
    logItemTooltipProbe.missing ||
    logItemTooltipProbe.itemTitle !== "" ||
    logItemTooltipProbe.itemTip !== "Useful Item" ||
    logItemTooltipProbe.itemType !== "useful" ||
    !logItemTooltipProbe.visible ||
    !/^useful item$/i.test(String(logItemTooltipProbe.text || "")) ||
    !logItemTooltipProbe.cls.includes("apItem-useful") ||
    !logItemTooltipProbe.left ||
    !logItemTooltipProbe.top
  ){
    throw new Error(`AP log item hover tooltip did not render: ${JSON.stringify(logItemTooltipProbe)}`);
  }

  const logRenderStability = await page.evaluate(async () => {
    const body = document.querySelector(".flprStandaloneConnectLayout #apConnLogBody");
    if(!body) return { missing:true };
    if(typeof window.flprStandaloneTextClientRender === "function") window.flprStandaloneTextClientRender();
    const beforeFirst = body.querySelector(".apLogLine");
    const beforeHtml = body.innerHTML;
    const beforeChildCount = body.childElementCount;
    if(typeof renderApLogTab === "function") renderApLogTab();
    const immediateFirst = body.querySelector(".apLogLine");
    const immediateHtml = body.innerHTML;
    await new Promise((resolve) => {
      const raf = window.requestAnimationFrame || ((cb) => setTimeout(cb, 16));
      raf(() => raf(resolve));
    });
    const afterNativeFirst = body.querySelector(".apLogLine");
    const afterNativeHtml = body.innerHTML;
    if(typeof window.flprStandaloneTextClientRender === "function") window.flprStandaloneTextClientRender();
    const afterDirectFirst = body.querySelector(".apLogLine");
    return {
      missing:false,
      beforeChildCount,
      immediateChildCount: body.childElementCount,
      hadRichRows: !!beforeFirst,
      nativeKeptRichRows: !!immediateFirst,
      sameAfterNativeCall: beforeFirst === immediateFirst,
      sameAfterNativeSchedule: beforeFirst === afterNativeFirst,
      sameAfterDirectRender: afterNativeFirst === afterDirectFirst,
      immediateHtmlSame: beforeHtml === immediateHtml,
      afterNativeHtmlSame: beforeHtml === afterNativeHtml
    };
  });
  if(
    logRenderStability.missing ||
    !logRenderStability.hadRichRows ||
    !logRenderStability.nativeKeptRichRows ||
    !logRenderStability.sameAfterNativeCall ||
    !logRenderStability.sameAfterNativeSchedule ||
    !logRenderStability.sameAfterDirectRender ||
    !logRenderStability.immediateHtmlSame ||
    !logRenderStability.afterNativeHtmlSame
  ){
    throw new Error(`AP log render path still rewrites stable log DOM: ${JSON.stringify(logRenderStability)}`);
  }

  const liveScrollProbe = await page.evaluate(async () => {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const logBody = document.querySelector(".flprStandaloneConnectLayout #apConnLogBody");
    const logWrap = document.querySelector(".flprStandaloneConnectLayout .apConnLog");
    const sayWrap = document.querySelector(".flprStandaloneConnectLayout .apClientSayWrap");
    const controls = document.querySelector(".controls");
    const stage = document.querySelector(".stage");
    const receivedBody = document.querySelector(".flprStandaloneConnectLayout #receivedBody");
    const logStyle = logWrap ? getComputedStyle(logWrap) : null;
    const logRect = logWrap?.getBoundingClientRect?.();
    const bodyRect = logBody?.getBoundingClientRect?.();
    const sayRect = sayWrap?.getBoundingClientRect?.();
    const controlsRect = controls?.getBoundingClientRect?.();
    const stageRect = stage?.getBoundingClientRect?.();
    const itemBodyRect = receivedBody?.getBoundingClientRect?.();
    const logLayout = {
      missing: !logBody || !logWrap,
      display: logStyle?.display || "",
      flexDirection: logStyle?.flexDirection || "",
      logHeight: logRect ? Math.round(logRect.height) : 0,
      bodyHeight: bodyRect ? Math.round(bodyRect.height) : 0,
      itemBodyHeight: itemBodyRect ? Math.round(itemBodyRect.height) : 0,
      controlsBottomGap: (controlsRect && stageRect) ? Math.round(stageRect.bottom - controlsRect.bottom) : null,
      sayTop: sayRect ? Math.round(sayRect.top) : 0,
      sayBottom: sayRect ? Math.round(sayRect.bottom) : 0,
      logBottom: logRect ? Math.round(logRect.bottom) : 0,
      bodyBottom: bodyRect ? Math.round(bodyRect.bottom) : 0
    };
    if(logBody){
      for(let i = 0; i < 48; i++){
        if(typeof apLog === "function") apLog(`ALTTPP3: scroll retention ${i}`, { tab:"status", mirrorTabs:["chat"] });
      }
      if(typeof window.flprStandaloneTextClientRender === "function") window.flprStandaloneTextClientRender();
      logBody.scrollTop = Math.max(32, Math.floor(logBody.scrollHeight / 3));
    }
    const logBefore = logBody ? logBody.scrollTop : 0;
    if(typeof apLog === "function") apLog(`ALTTPP3: scroll retention new ${Date.now()}`, { tab:"status", mirrorTabs:["chat"] });
    await delay(80);
    const logAfter = logBody ? logBody.scrollTop : 0;

    const oldReceived = Array.isArray(ap?.receivedAll) ? ap.receivedAll.map((row) => ({ ...row })) : [];
    const oldTab = window.__flprStandaloneItemTabName || "";
    let itemBefore = 0;
    let itemAfter = 0;
    try{
      if(window.flprStandaloneSetItemTab) window.flprStandaloneSetItemTab("received");
      ap.receivedAll = Array.from({ length: 60 }, (_, index) => ({
        recvIndex:index,
        time:"12:00:00",
        itemName:`Easy Junk Item ${index}`,
        baseItemName:`Easy Junk Item ${index}`,
        locationName:`Scroll Test - Location ${index}`,
        checkName:`Scroll Test - Location ${index}`,
        sourcePlayerName:"ALTTPP3",
        sourceGame:"A Link to the Past",
        flags:0,
        itemId:900000 + index,
        locId:800000 + index
      }));
      if(typeof renderReceivedList === "function") renderReceivedList(ap.receivedAll);
      if(typeof window.flprStandaloneRenderItemPanel === "function") window.flprStandaloneRenderItemPanel();
      await delay(30);
      if(receivedBody) receivedBody.scrollTop = Math.max(48, Math.floor(receivedBody.scrollHeight / 3));
      itemBefore = receivedBody ? receivedBody.scrollTop : 0;
      ap.receivedAll.push({
        recvIndex:99,
        time:"12:00:01",
        itemName:"Rupees (20)",
        baseItemName:"Rupees (20)",
        locationName:"Scroll Test - Newest",
        checkName:"Scroll Test - Newest",
        sourcePlayerName:"ALTTPP3",
        sourceGame:"A Link to the Past",
        flags:0,
        itemId:900099,
        locId:800099
      });
      if(typeof renderReceivedList === "function") renderReceivedList(ap.receivedAll);
      if(typeof window.flprStandaloneRenderItemPanel === "function") window.flprStandaloneRenderItemPanel();
      await delay(30);
      itemAfter = receivedBody ? receivedBody.scrollTop : 0;
    }finally{
      try{
        ap.receivedAll = oldReceived;
        if(typeof saveReceivedList === "function") saveReceivedList(oldReceived);
        if(typeof renderReceivedList === "function") renderReceivedList(oldReceived);
        if(typeof window.flprStandaloneRenderItemPanel === "function") window.flprStandaloneRenderItemPanel();
        if(oldTab && window.flprStandaloneSetItemTab) window.flprStandaloneSetItemTab(oldTab);
      }catch(_){}
    }
    return {
      logLayout,
      logBefore,
      logAfter,
      itemBefore,
      itemAfter,
      logScrollHeight: logBody ? logBody.scrollHeight : 0,
      itemScrollHeight: receivedBody ? receivedBody.scrollHeight : 0
    };
  });
  if(
    liveScrollProbe.logLayout.missing ||
    liveScrollProbe.logLayout.display !== "flex" ||
    liveScrollProbe.logLayout.flexDirection !== "column" ||
    liveScrollProbe.logLayout.logHeight < 500 ||
    liveScrollProbe.logLayout.bodyHeight < 200 ||
    liveScrollProbe.logLayout.itemBodyHeight < 200 ||
    liveScrollProbe.logLayout.controlsBottomGap > 24 ||
    liveScrollProbe.logLayout.bodyBottom > liveScrollProbe.logLayout.sayTop + 4 ||
    Math.abs(liveScrollProbe.logLayout.logBottom - liveScrollProbe.logLayout.sayBottom) > 8 ||
    Math.abs(liveScrollProbe.logAfter - liveScrollProbe.logBefore) > 12 ||
    liveScrollProbe.itemBefore < 24 ||
    liveScrollProbe.itemAfter < liveScrollProbe.itemBefore - 12
  ){
    throw new Error(`Connected AP log/item scroll space or scroll retention failed: ${JSON.stringify(liveScrollProbe)}`);
  }

  const bossKeyLiveSnapshotProbe = await page.evaluate(async () => {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const previous = {
      apBossKeyCount: Number.isFinite(Number(window.__apBossKeyCount)) ? Number(window.__apBossKeyCount) : 0,
      prevApBossKeyCount: Number.isFinite(Number(window.__prevApBossKeyCount)) ? Number(window.__prevApBossKeyCount) : 0,
      bossKeys: Array.isArray(bossKeysState) ? bossKeysState.map((key) => ({ ...key })) : [],
      stateBossKeys: Array.isArray(state?.bossKeys) ? state.bossKeys.slice() : [],
      receivedAll: Array.isArray(ap?.receivedAll) ? ap.receivedAll.map((row) => ({ ...row })) : [],
      receivedSeen: ap?.receivedSeen instanceof Set ? Array.from(ap.receivedSeen) : [],
      receivedKeySet: ap?.receivedKeySet instanceof Set ? Array.from(ap.receivedKeySet) : [],
      receivedByIndex: ap?.receivedByIndex instanceof Map ? Array.from(ap.receivedByIndex.entries()).map(([key, value]) => [key, { ...value }]) : [],
      pendingByLoc: ap?.pendingByLoc instanceof Map ? Array.from(ap.pendingByLoc.entries()).map(([key, value]) => [key, { ...value }]) : [],
      lastPopup: localStorage.getItem("flpr_ap_last_popup_index"),
      apConnected: !!ap?.connected,
      apInherentSeedActive: !!ap?.inherentSeedActive,
      randomizerReady: !!window.__flprStandaloneProfileRuntime?.randomizerReady
    };
    const restore = () => {
      try{ if(typeof bossKeyClearCinematic === "function") bossKeyClearCinematic(); }catch(_){}
      try{ window.__bossKeyCinematicNextAt = 0; }catch(_){}
      try{ ap.connected = previous.apConnected; }catch(_){}
      try{ ap.inherentSeedActive = previous.apInherentSeedActive; }catch(_){}
      try{ if(window.__flprStandaloneProfileRuntime) window.__flprStandaloneProfileRuntime.randomizerReady = previous.randomizerReady; }catch(_){}
      try{
        if(Array.isArray(bossKeysState)){
          for(let i = 0; i < bossKeysState.length; i++){
            bossKeysState[i] = { ...(previous.bossKeys[i] || { acquired:false, img:null }) };
          }
        }
      }catch(_){}
      try{ state.bossKeys = previous.stateBossKeys.slice(); }catch(_){}
      try{ window.__apBossKeyCount = previous.apBossKeyCount; }catch(_){}
      try{ window.__prevApBossKeyCount = previous.prevApBossKeyCount; }catch(_){}
      try{ if(typeof bossKeysSave === "function") bossKeysSave(); }catch(_){}
      try{ if(typeof bossKeysRender === "function") bossKeysRender(); }catch(_){}
      try{ ap.receivedAll = previous.receivedAll.map((row) => ({ ...row })); }catch(_){}
      try{ ap.receivedSeen = new Set(previous.receivedSeen); }catch(_){}
      try{ ap.receivedKeySet = new Set(previous.receivedKeySet); }catch(_){}
      try{ ap.receivedByIndex = new Map(previous.receivedByIndex.map(([key, value]) => [key, { ...value }])); }catch(_){}
      try{ ap.pendingByLoc = new Map(previous.pendingByLoc.map(([key, value]) => [key, { ...value }])); }catch(_){}
      try{ if(typeof saveReceivedList === "function") saveReceivedList(ap.receivedAll || []); }catch(_){}
      try{ if(typeof renderReceivedList === "function") renderReceivedList(ap.receivedAll || []); }catch(_){}
      try{ if(typeof closeOverviewModal === "function") closeOverviewModal(); }catch(_){}
      try{
        if(previous.lastPopup == null) localStorage.removeItem("flpr_ap_last_popup_index");
        else localStorage.setItem("flpr_ap_last_popup_index", previous.lastPopup);
      }catch(_){}
    };
    try{
      if(typeof bossKeysApplyAcquiredCount === "function"){
        bossKeysApplyAcquiredCount(0, { animate:false, updateApCount:true });
      }else if(typeof applyBossKeysCount === "function"){
        applyBossKeysCount(0);
      }
      window.__apBossKeyCount = 0;
      window.__prevApBossKeyCount = 0;
      ap.connected = true;
      ap.inherentSeedActive = false;
      if(window.__flprStandaloneProfileRuntime) window.__flprStandaloneProfileRuntime.randomizerReady = true;
      window.__flprStandaloneBossKeyLiveRewardAnimation = null;
      ap.pendingByLoc = ap.pendingByLoc || new Map();
      ap.pendingByLoc.set(3013, {
        locId: 3013,
        locationName: "Super Mario Bros. - Boss Key Vault",
        tableName: "Super Mario Bros.",
        sentAt: Date.now()
      });
      processReceivedItem({ item:1009, location:3013, player:1, flags:1 }, 991013, 3013, {
        noPopup:false,
        noFeed:true,
        isSnapshot:true
      });
      await delay(850);
      const cinematic = document.querySelector(".bossKeyCinematic");
      const receivingSlot = document.querySelector(".bossKeyReceivingSlot, .bossKeyAwaitingSlam, .bossKeyImpact");
      const result = {
        count: Number(window.__apBossKeyCount || 0),
        acquired: typeof getBossKeysAcquiredCount === "function" ? getBossKeysAcquiredCount() : null,
        cinematicVisible: !!cinematic,
        cinematicText: cinematic?.innerText || "",
        receivingSlot: !!receivingSlot,
        dockRedeemPeek: !!document.getElementById("bossDock")?.classList.contains("redeemPeek"),
        replay: window.__flprStandaloneBossKeyLiveRewardAnimation || null
      };
      restore();
      return result;
    }catch(err){
      restore();
      return { error: String(err?.message || err) };
    }
  });
  if(
    bossKeyLiveSnapshotProbe.error ||
    bossKeyLiveSnapshotProbe.count < 1 ||
    bossKeyLiveSnapshotProbe.acquired < 1 ||
    !bossKeyLiveSnapshotProbe.cinematicVisible ||
    !/BOSS KEY/i.test(bossKeyLiveSnapshotProbe.cinematicText || "") ||
    (!bossKeyLiveSnapshotProbe.receivingSlot && !bossKeyLiveSnapshotProbe.dockRedeemPeek) ||
    !bossKeyLiveSnapshotProbe.replay ||
    bossKeyLiveSnapshotProbe.replay.from !== 0 ||
    bossKeyLiveSnapshotProbe.replay.to < 1
  ){
    throw new Error(`Live Boss Key reward in a ReceivedItems snapshot did not play the Boss Key animation: ${JSON.stringify(bossKeyLiveSnapshotProbe)}`);
  }

  const siegeQueueProbe = await page.evaluate(async () => {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const nonBossWorlds = Object.keys(state?.worlds || {}).filter((wk) => {
      try { return !isBossWorldId(wk, state) && Array.isArray(state.worlds[wk]?.tables) && state.worlds[wk].tables.length; } catch (_) { return false; }
    });
    const targetWorld = nonBossWorlds[0] || "w1";
    const targetIdx = 0;
    const targetKey = `${targetWorld}|${targetIdx}`;
    const targetName = String(state?.worlds?.[targetWorld]?.tables?.[targetIdx] || "Queued Siege Test Table");
    if(typeof besiegedClear === "function") besiegedClear("test-reset");
    if(typeof closeOverviewModal === "function") closeOverviewModal();
    state.balls = state.balls || {};
    state.balls[`${targetKey}|1`] = true;
    try{
      if(typeof showView === "function") showView("checks");
      else { activeView = "checks"; if(typeof setTabUI === "function") setTabUI(); }
    }catch(_){}
    if(typeof showOverviewModalNow === "function"){
      showOverviewModalNow({
        tag: "USEFUL",
        title: "ITEM SENT",
        big: "Quartz Flask",
        sub: "TO; HereticP2",
        meta: "CHECK; Queued siege test",
        holdMs: 760
      });
    }
    const activated = typeof besiegedActivate === "function" && besiegedActivate({
      force: true,
      target: {
        worldKey: targetWorld,
        tableKey: targetKey,
        tableName: targetName
      }
    });
    await delay(140);
    const immediate = {
      activated: !!activated,
      active: typeof besiegedIsActive === "function" ? !!besiegedIsActive() : !!state?.besiegedEvent?.active,
      activeView: String(activeView || ""),
      banner: document.querySelector(".flprStandaloneSiegeIncoming")?.textContent || "",
      cardClass: document.getElementById("ovModalCard")?.className || "",
      queueState: typeof window.flprStandaloneSiegeQueueState === "function" ? window.flprStandaloneSiegeQueueState() : null
    };
    await delay(1250);
    const live = typeof besiegedGetState === "function" ? besiegedGetState() : state?.besiegedEvent;
    const after = {
      active: typeof besiegedIsActive === "function" ? !!besiegedIsActive() : !!live?.active,
      activeView: String(activeView || ""),
      tableKey: String(live?.tableKey || ""),
      worldKey: String(live?.worldKey || ""),
      queueState: typeof window.flprStandaloneSiegeQueueState === "function" ? window.flprStandaloneSiegeQueueState() : null,
      banner: document.querySelector(".flprStandaloneSiegeIncoming")?.textContent || ""
    };
    if(typeof besiegedClear === "function") besiegedClear("test-reset");
    if(typeof closeOverviewModal === "function") closeOverviewModal();
    return { targetWorld, targetKey, immediate, after };
  });
  if(
    !siegeQueueProbe.immediate.activated ||
    siegeQueueProbe.immediate.active ||
    !String(siegeQueueProbe.immediate.banner || "").includes("SIEGE INCOMING!") ||
    !String(siegeQueueProbe.immediate.cardClass || "").includes("flprStandaloneSiegeQueued") ||
    !siegeQueueProbe.immediate.queueState?.pending ||
    !siegeQueueProbe.after.active ||
    siegeQueueProbe.after.tableKey !== siegeQueueProbe.targetKey ||
    siegeQueueProbe.after.worldKey !== siegeQueueProbe.targetWorld ||
    siegeQueueProbe.after.activeView !== "tower" ||
    siegeQueueProbe.after.queueState?.pending ||
    siegeQueueProbe.after.banner
  ){
    throw new Error(`Siege did not queue behind the active reward notification: ${JSON.stringify(siegeQueueProbe)}`);
  }

  const siegeClearVictoryProbe = await page.evaluate(async () => {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const previousHold = window.__flprStandaloneSiegeVictoryHoldMs;
    const previousExtraBalls = Number(state?.extraBallTokens || 0);
    const previousMusicLockForDuration = window.musicLockScenarioForDuration;
    const previousMusicLock = window.musicLockScenario;
    const musicCalls = [];
    window.__flprStandaloneSiegeVictoryHoldMs = 900;
    window.__flprLastSiegeVictoryCinematic = null;
    try{
      window.musicLockScenarioForDuration = function(name, durationMs, opts){
        musicCalls.push({ name:String(name || ""), durationMs:Number(durationMs || 0), fadeMs:Number(opts?.fadeMs || 0), fadeLeadMs:Number(opts?.fadeLeadMs || 0) });
        return true;
      };
      musicLockScenarioForDuration = window.musicLockScenarioForDuration;
      window.musicLockScenario = function(name, lockMs){
        musicCalls.push({ fallback:true, name:String(name || ""), durationMs:Number(lockMs || 0) });
        return true;
      };
      musicLockScenario = window.musicLockScenario;
    }catch(_){}
    const nonBossWorlds = Object.keys(state?.worlds || {}).filter((wk) => {
      try { return !isBossWorldId(wk, state) && Array.isArray(state.worlds[wk]?.tables) && state.worlds[wk].tables.length; } catch (_) { return false; }
    });
    const targetWorld = nonBossWorlds[0] || "w1";
    const targetIdx = 0;
    const targetKey = `${targetWorld}|${targetIdx}`;
    const targetName = "Victory Siege Test Table";
    try{ if(typeof closeOverviewModal === "function") closeOverviewModal(); }catch(_){}
    try{ if(typeof besiegedClear === "function") besiegedClear("test-reset"); }catch(_){}
    state.balls = state.balls || {};
    state.balls[`${targetKey}|1`] = true;
    let activated = false;
    try{
      activated = !!besiegedActivate({
        force: true,
        target: {
          worldKey: targetWorld,
          tableKey: targetKey,
          tableName: targetName
        }
      });
    }catch(_){}
    await delay(90);
    try{
      if(typeof besiegedStartDefense === "function") besiegedStartDefense();
      if(state?.besiegedEvent?.active){
        const now = Date.now();
        state.besiegedEvent.defenseStartedAt = now - 260000;
        state.besiegedEvent.defenseDeadlineAt = now + 40000;
      }
    }catch(_){}
    await delay(40);
    const liveBefore = typeof besiegedGetState === "function" ? besiegedGetState() : state?.besiegedEvent;
    const defenseBtn = document.querySelector(".pentaCard.besiegedTarget .besiegedTargetBtn");
    const buttonText = defenseBtn?.innerText || "";
    if(defenseBtn) defenseBtn.click();
    await delay(220);
    const cleared = !(typeof besiegedIsActive === "function" ? !!besiegedIsActive() : !!state?.besiegedEvent?.active);
    const overlay = document.getElementById("flprStandaloneSiegeVictoryOverlay");
    const overview = document.getElementById("viewOverview");
    const rectInfo = (node) => {
      if(!node) return null;
      const r = node.getBoundingClientRect();
      return { left:r.left, top:r.top, right:r.right, bottom:r.bottom, width:r.width, height:r.height };
    };
    const overlayRect = rectInfo(overlay);
    const overviewRect = rectInfo(overview);
    const overlayScoped = !!(overlay && overview && overlay.parentElement === overview && overlayRect && overviewRect &&
      overlayRect.width > 0 && overlayRect.height > 0 &&
      overlayRect.left >= overviewRect.left - 2 &&
      overlayRect.top >= overviewRect.top - 2 &&
      overlayRect.right <= overviewRect.right + 2 &&
      overlayRect.bottom <= overviewRect.bottom + 2);
    const immediate = {
      activated,
      activeView: String(activeView || ""),
      activeBefore: !!liveBefore?.active,
      buttonExists: !!defenseBtn,
      buttonText,
      cleared: !!cleared,
      overlayVisible: !!overlay,
      overlayScoped,
      overlayParent: overlay?.parentElement?.className || "",
      overlayRect,
      overviewRect,
      text: overlay?.innerText || "",
      card: !!overlay?.querySelector(".flprStandaloneSiegeVictoryCard"),
      battle: !!overlay?.querySelector(".flprStandaloneSiegeVictoryBattle"),
      castle: !!overlay?.querySelector(".flprStandaloneSiegeVictoryCastle"),
      damagedCastle: !!overlay?.querySelector(".flprStandaloneSiegeVictoryCastle.damage3, .flprStandaloneSiegeVictoryCastle.damage4"),
      retreatingTroops: overlay?.querySelectorAll(".flprStandaloneSiegeVictoryTroop").length || 0,
      helpers: overlay?.querySelectorAll(".flprStandaloneSiegeVictoryHelper").length || 0,
      waterStreams: overlay?.querySelectorAll(".flprStandaloneSiegeVictoryHelperWater").length || 0,
      dousedFlames: overlay?.querySelectorAll(".flprStandaloneSiegeVictoryCastle .flprStandaloneSiegeVictoryFlame").length || 0,
      fireworksBackground: (() => {
        const fw = overlay?.querySelector(".flprStandaloneSiegeVictoryFireworks");
        const battle = overlay?.querySelector(".flprStandaloneSiegeVictoryBattle");
        if(!fw || !battle) return false;
        return Number(getComputedStyle(fw).zIndex || 0) < Number(getComputedStyle(battle).zIndex || 0);
      })(),
      damageLevel: Number(overlay?.dataset?.damageLevel || 0) || 0,
      fireworks: overlay?.querySelectorAll(".flprStandaloneSiegeFirework").length || 0,
      lastVictory: window.__flprLastSiegeVictoryCinematic || null,
      musicCalls: musicCalls.slice(),
      groove: !!document.querySelector(".stage")?.classList?.contains("victoryGroove")
    };
    await delay(1650);
    const after = {
      overlayVisible: !!document.getElementById("flprStandaloneSiegeVictoryOverlay"),
      groove: !!document.querySelector(".stage")?.classList?.contains("victoryGroove"),
      active: typeof besiegedIsActive === "function" ? !!besiegedIsActive() : !!state?.besiegedEvent?.active
    };
    state.extraBallTokens = previousExtraBalls;
    if(previousHold == null) delete window.__flprStandaloneSiegeVictoryHoldMs;
    else window.__flprStandaloneSiegeVictoryHoldMs = previousHold;
    try{
      if(previousMusicLockForDuration === undefined) delete window.musicLockScenarioForDuration;
      else window.musicLockScenarioForDuration = previousMusicLockForDuration;
      musicLockScenarioForDuration = window.musicLockScenarioForDuration;
    }catch(_){}
    try{
      if(previousMusicLock === undefined) delete window.musicLockScenario;
      else window.musicLockScenario = previousMusicLock;
      musicLockScenario = window.musicLockScenario;
    }catch(_){}
    try{ saveState(); }catch(_){}
    return { targetName, immediate, after };
  });
  if(
    !siegeClearVictoryProbe.immediate.activated ||
    !siegeClearVictoryProbe.immediate.activeBefore ||
    !siegeClearVictoryProbe.immediate.buttonExists ||
    !siegeClearVictoryProbe.immediate.cleared ||
    siegeClearVictoryProbe.immediate.activeView !== "overview" ||
    !siegeClearVictoryProbe.immediate.overlayVisible ||
    !siegeClearVictoryProbe.immediate.overlayScoped ||
    !siegeClearVictoryProbe.immediate.card ||
    !siegeClearVictoryProbe.immediate.battle ||
    !siegeClearVictoryProbe.immediate.castle ||
    !siegeClearVictoryProbe.immediate.damagedCastle ||
    siegeClearVictoryProbe.immediate.damageLevel < 3 ||
    siegeClearVictoryProbe.immediate.retreatingTroops < 8 ||
    siegeClearVictoryProbe.immediate.helpers < 2 ||
    siegeClearVictoryProbe.immediate.waterStreams < 2 ||
    siegeClearVictoryProbe.immediate.dousedFlames < 2 ||
    !siegeClearVictoryProbe.immediate.fireworksBackground ||
    !siegeClearVictoryProbe.immediate.lastVictory?.shown ||
    !siegeClearVictoryProbe.immediate.lastVictory?.scopedToOverview ||
    siegeClearVictoryProbe.immediate.lastVictory?.helperCount < 2 ||
    siegeClearVictoryProbe.immediate.lastVictory?.waterStreamCount < 2 ||
    siegeClearVictoryProbe.immediate.lastVictory?.dousedFlameCount < 2 ||
    siegeClearVictoryProbe.immediate.lastVictory?.fireworksBackground !== true ||
    siegeClearVictoryProbe.immediate.lastVictory?.tableName !== siegeClearVictoryProbe.targetName ||
    siegeClearVictoryProbe.immediate.lastVictory?.music?.durationMs !== 1660 ||
    siegeClearVictoryProbe.immediate.lastVictory?.music?.fadeMs < 420 ||
    siegeClearVictoryProbe.immediate.musicCalls?.[0]?.name !== "randomizer_win" ||
    siegeClearVictoryProbe.immediate.musicCalls?.[0]?.durationMs !== 1660 ||
    siegeClearVictoryProbe.immediate.musicCalls?.[0]?.fadeMs < 420 ||
    !siegeClearVictoryProbe.immediate.text.includes(`${siegeClearVictoryProbe.targetName} is free!`) ||
    !/The .+ is defeated!/.test(siegeClearVictoryProbe.immediate.text || "") ||
    siegeClearVictoryProbe.immediate.fireworks < 1 ||
    siegeClearVictoryProbe.immediate.groove ||
    siegeClearVictoryProbe.after.overlayVisible ||
    siegeClearVictoryProbe.after.groove ||
    siegeClearVictoryProbe.after.active
  ){
    throw new Error(`Siege clear victory overlay did not play and fade correctly: ${JSON.stringify(siegeClearVictoryProbe)}`);
  }

  await page.screenshot({ path: SCREENSHOT, fullPage: false });

  const result = await page.evaluate(`
    (() => ({
      bodyClass: document.body.className,
      controlsBodies: Array.from(document.querySelectorAll('.controlsBody')).map((body, index) => ({
        index,
        hasStandalone: !!body.querySelector('.flprStandaloneConnectLayout'),
        text: (body.innerText || '').slice(0, 900),
        rect: (() => {
          const r = body.getBoundingClientRect();
          return { x: r.x, y: r.y, width: r.width, height: r.height };
        })()
      })),
      standaloneRect: (() => {
        const node = document.querySelector('.flprStandaloneConnectLayout');
        if (!node) return null;
        const r = node.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height, text: (node.innerText || '').slice(0, 900) };
      })(),
      connectedHost: document.querySelector('.flprStandaloneConnectLayout #apConnectedHost')?.innerText || document.getElementById('apConnectedHost')?.innerText || '',
      logText: document.querySelector('.flprStandaloneConnectLayout #apConnLogBody')?.innerText || '',
      receivedHeader: document.querySelector('.flprStandaloneConnectLayout #receivedHdr')?.innerText || document.getElementById('receivedHdr')?.innerText || '',
      receivedText: document.querySelector('.flprStandaloneConnectLayout #receivedBody')?.innerText || document.getElementById('receivedBody')?.innerText || '',
      activeTab: Array.from(document.querySelectorAll('.flprStandaloneConnectLayout #apLogTabs .apLogTab, #apLogTabs .apLogTab')).find((btn) => btn.classList.contains('active'))?.innerText || ''
    }))()
  `);
  if(String(result.logText || "").includes("FLPR-Bot sync warning")){
    throw new Error("FLPR-Bot sync warning still appeared in standalone AP log");
  }
  if(!String(result.logText || "").includes("AshodinNoTrap sent Ethereal Crossbow to HereticP2 (Dirty Harry - Skill Shot)")){
    throw new Error(`Standalone AP log did not show the resolved sent-item check line: ${result.logText}`);
  }
  if(!String(result.logText || "").includes(`AshodinNoTrap sent Bug-Catching Net to ALTTPP3 (${BONUS_ROUND_DISPLAY_LOCATION})`)){
    throw new Error(`Standalone AP log did not show the server-provided cross-game sent item line: ${result.logText}`);
  }
  if(String(result.logText || "").includes(`AshodinNoTrap has found their own Progressive Ball - Police Force`)){
    throw new Error(`Standalone AP log still showed the false Police Force self-progression line: ${result.logText}`);
  }
  if(String(result.logText || "").includes(`AshodinNoTrap sent Progressive Ball - Police Force to ALTTPP3`)){
    throw new Error(`Standalone AP log still treated the self-owned Progressive Ball as sent to ALTTPP3: ${result.logText}`);
  }
  if(String(result.logText || "").includes(`AshodinNoTrap sent Progressive Ball - Cyclone to ALTTPP3`)){
    throw new Error(`Standalone AP log still projected a Flippermizer Progressive Ball onto an ALTTP item: ${result.logText}`);
  }
  const hiddenNoise = [
    "New Check:",
    "FLIPPERMIZER CHECK;",
    "Check metadata sent;",
    "CHECK SENT;",
    "CHECK STATE;",
    "BOUNCED",
    "ReceivedItems snapshot",
    "RECEIVED ITEMS SNAPSHOT",
    "DATAPACKAGE;",
    "LocationInfo;",
    "LocationScouts;",
    "OUT Say",
    "SAY SENT TO AP SERVER",
    "Runtime;",
    "AP endpoints:",
    "WebSocket open;",
    "Standalone ReceivedItems flushed",
    "Ignoring off-seed",
    "RoomUpdate;",
    "> !hint",
    "sent 370001",
    "AshodinNoTrapsent",
    BONUS_ROUND_LOCATION,
    "ITEM; 370001"
  ].filter((needle) => String(result.logText || "").includes(needle));
  if(hiddenNoise.length){
    throw new Error(`Standalone AP log still contains non-text-client noise: ${hiddenNoise.join(", ")}`);
  }
  const persistedLog = await page.evaluate(`
    (() => {
      const raw = localStorage.getItem('flpr_standalone_ap_text_log_v1') || '';
      return {
        hasHint: raw.includes('!hint Secret Passage'),
        hasIgnore: raw.includes('Ignoring off-seed'),
        hasSnapshot: raw.includes('RECEIVED ITEMS SNAPSHOT') || raw.includes('ReceivedItems snapshot'),
        hasOutSay: raw.includes('OUT Say') || raw.includes('SAY SENT TO AP SERVER'),
        hasCheckSent: raw.includes('CHECK SENT;'),
        rawLength: raw.length
      };
    })()
  `);
  if(!persistedLog.hasHint || persistedLog.hasIgnore || persistedLog.hasSnapshot || persistedLog.hasOutSay || persistedLog.hasCheckSent){
    throw new Error(`Persistent log did not keep clean AP text history: ${JSON.stringify(persistedLog)}`);
  }
  await page.reload();
  await waitFor(page, `
    const log = document.querySelector('.flprStandaloneConnectLayout #apConnLogBody')?.innerText || '';
    return !log.includes('!hint Secret Passage') &&
      !log.includes('AP test server says hello') &&
      !log.includes('Pegasus Boots') &&
      !log.includes('Bug-Catching Net') &&
      !log.includes('Ignoring off-seed') &&
      !log.includes('ReceivedItems snapshot') &&
      !log.includes('OUT Say') &&
      !log.includes('CHECK SENT;');
  `, 15000);
  console.log(JSON.stringify({
    ok: true,
    appRoot: APP_ROOT,
    screenshot: SCREENSHOT,
    serverReceivedPackets: apServer.received.map((text) => {
      try { return JSON.parse(text).map((pkt) => pkt.cmd).join(","); } catch (_) { return text; }
    }),
    result
  }, null, 2));

  } finally {
    if(electronApp) await electronApp.close().catch(()=>{});
    await apServer.close().catch(()=>{});
  }
}

run().catch(async (err) => {
  console.error(err && err.stack ? err.stack : err);
  process.exitCode = 1;
});
