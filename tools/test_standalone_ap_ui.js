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
  throw new Error(`Timed out waiting for renderer condition; last=${last}`);
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

  const profileGateInitialProbe = await page.evaluate(`(() => ({
    needsProfile: document.body.classList.contains('flprStandaloneNeedsProfile'),
    gateVisible: !!document.querySelector('#standaloneProfileGate:not([hidden])'),
    startDisabled: !!document.querySelector('#randomizerIntroStartBtn')?.disabled,
    sign: document.querySelector('#randomizerIntroSign')?.textContent || ''
  }))()`);
  if(!profileGateInitialProbe.needsProfile || !profileGateInitialProbe.gateVisible || !profileGateInitialProbe.startDisabled){
    throw new Error(`Home profile gate was not blocking a fresh Home Edition launch: ${JSON.stringify(profileGateInitialProbe)}`);
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
      const logo = document.querySelector('#standaloneModeHud .standaloneModeHudLogo');
      const buttons = Array.from(document.querySelectorAll('#standaloneModeHud [data-standalone-mode-toggle]'));
      const controls = document.querySelector('.controlsBody') || document.querySelector('.controls');
      const rect = hud?.getBoundingClientRect?.();
      const logoRect = logo?.getBoundingClientRect?.();
      const controlsRect = controls?.getBoundingClientRect?.();
      return {
        exists: !!hud,
        hidden: !!hud?.hidden,
        logoSrc: logo?.getAttribute('src') || '',
        logoAlt: logo?.getAttribute('alt') || '',
        logoSize: logoRect ? Math.round(Math.min(logoRect.width, logoRect.height)) : 0,
        text: buttons.map((btn) => btn.innerText || ''),
        active: buttons.find((btn) => btn.classList.contains('active'))?.dataset?.standaloneModeToggle || '',
        left: rect ? Math.round(rect.left) : null,
        right: rect ? Math.round(rect.right) : null,
        controlsLeft: controlsRect ? Math.round(controlsRect.left) : null,
        controlsRight: controlsRect ? Math.round(controlsRect.right) : null,
        aboveMenu: !!(rect && controlsRect && rect.bottom <= controlsRect.top + 6),
        leftAligned: !!(rect && controlsRect && Math.abs(rect.left - controlsRect.left) < 42)
      };
    })()
  `);
  if(!modeToggleProbe.exists || modeToggleProbe.hidden || !/FlippermizerLogo\.png/i.test(modeToggleProbe.logoSrc) || !/Flippermizer/i.test(modeToggleProbe.logoAlt) || modeToggleProbe.logoSize < 48 || !modeToggleProbe.text.includes("SP") || !modeToggleProbe.text.includes("MP") || modeToggleProbe.active !== "archipelago" || !modeToggleProbe.aboveMenu || !modeToggleProbe.leftAligned){
    throw new Error(`Standalone logo and SP/MP mode toggle were not positioned above Menu: ${JSON.stringify(modeToggleProbe)}`);
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
        captureH,
        anchoredInStage: !!(controlsRect && stageRect && controlsRect.top >= stageRect.top - 1 && controlsRect.bottom <= stageRect.bottom + 1)
      };
    })()
  `);
  if(!savePromptProbe.pending || savePromptProbe.promptDisplay === "none" || !/LOAD\\?/i.test(savePromptProbe.loadText) || savePromptProbe.rowFont < 12 || savePromptProbe.rowMinHeight < 80 || !/auto|scroll/i.test(savePromptProbe.listOverflow) || !(savePromptProbe.hudZ > savePromptProbe.controlsZ) || savePromptProbe.controlsPaddingTop > 2 || savePromptProbe.controlsMarginTop < 70 || !savePromptProbe.anchoredInStage || !(savePromptProbe.controlsHeight <= savePromptProbe.captureH - 180)){
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
        marioNodeTip: getTaskExplanationForNode(marioNode),
        hoverHeader: card?.querySelector(".standaloneStrategyGuideHeader")?.innerText || "",
        hoverBody: card?.querySelector(".standaloneStrategyGuideBody")?.innerText || "",
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
    (() => ({
      flag: window.FLPR_BOT_SYNC_ENABLED,
      enabled: typeof flprBotSyncEnabled === 'function' ? flprBotSyncEnabled() : null,
      cfg: localStorage.getItem('flpr_bot_sync_cfg_v1') || ''
    }))()
  `);
  if(botSyncDisabled.flag !== false || botSyncDisabled.enabled !== false || !botSyncDisabled.cfg.includes('"enabled":false')){
    throw new Error(`FLPR-Bot sync is still enabled in standalone: ${JSON.stringify(botSyncDisabled)}`);
  }
  await page.locator(".flprStandaloneConnectLayout #apConnectBtn").click();

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
    ap.currentWorld = worldKey;
    saveState();
    renderChecksWorldTabs();
    renderChecks();
    const block = document.querySelector(`#checksBody .tableBlock[data-tablekey="${worldKey}|${idx}"]`);
    const normalBucket = (ap.locsByTableKey?.get?.(normalKey) || []).map((node) => node.full || node.short || "");
    const bossBucket = (ap.locsByTableKey?.get?.(bossKey) || []).map((node) => node.full || node.short || "");
    return {
      normalBucket,
      bossBucket,
      blockText: block?.innerText || "",
      normalExplicitBossCount: (ap.locsByTableKey?.get?.(normalKey) || []).filter((node) => window.flprStandaloneIsExplicitBossCheckNode?.(node)).length,
      regularPresent: normalBucket.some((name) => String(name).includes(regularLocation)),
      regular2Present: normalBucket.some((name) => String(name).includes(regularLocation2)),
      bossPresentInRegularBucket: normalBucket.some((name) => String(name).includes(bossLocation) || String(name).includes(victoryLocation)),
      bossPresentInNormal: (block?.innerText || "").includes(bossLocation.replace(/^.+? - /, "")) || (block?.innerText || "").includes(victoryLocation.replace(/^.+? - /, "")),
      bossBucketHasBoss: bossBucket.some((name) => String(name).includes(bossLocation)) && bossBucket.some((name) => String(name).includes(victoryLocation))
    };
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
    !bossRoutingProbe.bossBucketHasBoss
  ){
    throw new Error(`Boss-table checks leaked into regular table checks: ${JSON.stringify(bossRoutingProbe)}`);
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
    window.__flprStandaloneSiegeIntroMs = 900;
    if(typeof besiegedClear === "function") besiegedClear("test-reset");
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
    while(Date.now() < deadline){
      await delay(140);
      const live = typeof besiegedGetState === "function" ? besiegedGetState() : state?.besiegedEvent;
      const activeIntro = !!document.body.classList.contains("flprStandaloneSiegeIntroActive");
      const lastIntro = window.__flprStandaloneLastSiegeIntro || null;
      if(activeIntro || (lastIntro && lastIntro.completed === false)){
        intro = {
          activeIntro,
          activeView: String(activeView || ""),
          tableKey: String(live?.tableKey || ""),
          worldKey: String(live?.worldKey || ""),
          queueState: typeof window.flprStandaloneSiegeQueueState === "function" ? window.flprStandaloneSiegeQueueState() : null,
          targetClass: document.querySelector("#selectedBody .pentaCard.besiegedTarget")?.className || "",
          lastIntro
        };
        break;
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
  await page.locator(".flprStandaloneConnectLayout .standaloneItemTab[data-standalone-item-tab='sent']").click();
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

  const logColorStats = await page.evaluate(`
    (() => ({
      timestamps: document.querySelectorAll('.flprStandaloneConnectLayout #apConnLogBody .apLogTimestamp').length,
      players: Array.from(document.querySelectorAll('.flprStandaloneConnectLayout #apConnLogBody .apLogPlayer')).map((node) => node.innerText),
      items: Array.from(document.querySelectorAll('.flprStandaloneConnectLayout #apConnLogBody .apLogItem')).map((node) => ({ text: node.innerText, cls: node.className })),
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
    !logColorStats.locations.some((text) => text.includes("Link's Uncle")) ||
    !logColorStats.hints.some((text) => text.includes("[Hint]") || text.includes("!hint"))
  ){
    throw new Error(`AP log color coding did not render expected spans: ${JSON.stringify(logColorStats)}`);
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
      lastPopup: localStorage.getItem("flpr_ap_last_popup_index")
    };
    const restore = () => {
      try{ if(typeof bossKeyClearCinematic === "function") bossKeyClearCinematic(); }catch(_){}
      try{ window.__bossKeyCinematicNextAt = 0; }catch(_){}
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
    !bossKeyLiveSnapshotProbe.receivingSlot ||
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
    window.__flprStandaloneSiegeVictoryHoldMs = 900;
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
    const liveBefore = typeof besiegedGetState === "function" ? besiegedGetState() : state?.besiegedEvent;
    const cleared = typeof besiegedClear === "function" && besiegedClear("tower-target");
    await delay(180);
    const overlay = document.getElementById("flprStandaloneSiegeVictoryOverlay");
    const immediate = {
      activated,
      activeBefore: !!liveBefore?.active,
      cleared: !!cleared,
      overlayVisible: !!overlay,
      text: overlay?.innerText || "",
      card: !!overlay?.querySelector(".flprStandaloneSiegeVictoryCard"),
      fireworks: overlay?.querySelectorAll(".flprStandaloneSiegeFirework").length || 0,
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
    try{ saveState(); }catch(_){}
    return { targetName, immediate, after };
  });
  if(
    !siegeClearVictoryProbe.immediate.activated ||
    !siegeClearVictoryProbe.immediate.activeBefore ||
    !siegeClearVictoryProbe.immediate.cleared ||
    !siegeClearVictoryProbe.immediate.overlayVisible ||
    !siegeClearVictoryProbe.immediate.card ||
    !siegeClearVictoryProbe.immediate.text.includes(`${siegeClearVictoryProbe.targetName} is free!`) ||
    !/The .+ is defeated!/.test(siegeClearVictoryProbe.immediate.text || "") ||
    siegeClearVictoryProbe.immediate.fireworks < 1 ||
    !siegeClearVictoryProbe.immediate.groove ||
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
