/* flippermizer_task_explanations.js
 * Per-check "How to Achieve" guidance used by the overlay check hover cards.
 */
(function(root){
  "use strict";

  function normalizeTaskKey(value){
    return String(value || "")
      .toLowerCase()
      .replace(/[\u2012\u2013\u2014]/g, "-")
      .replace(/[^a-z0-9%+ ]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function makeHowTo(description){
    const body = String(description || "").trim();
    return body ? ("How to Achieve: " + body) : "";
  }

  const EXACT = Object.freeze({
    "boss victory": "Reduce Boss HP to 0%. Keep completing boss-damage checks until the boss life bar is empty, then clear the Boss Victory check.",
    "destroy the castle gate": "Shoot the castle repeatedly until the gate is destroyed (typically 3 clean castle hits).",
    "advance warp factor to 9": "Shoot lit shots that advance Warp Factor until it reaches 9, then collect/confirm the advance on the table.",
    "defeat k a r r mode": "Start K.A.R.R. mode, then complete the required lit K.A.R.R. shots before the mode times out.",
    "advance the metamorphosis steps once": "Shoot the lit Bride face/body shots to advance metamorphosis progress by one step.",
    "complete a face part eyes ears etc": "Complete one full face part by finishing the required lit part shots (for example eyes or ears).",
    "complete the bride finish metamorphosis": "Finish all metamorphosis parts so Bride is completed on the table progression.",
    "perform a picard maneuver combo": "Make the Picard Maneuver as a fast combo sequence (usually a quick left-to-right/right-to-left ramp-orbit chain).",
    "start klingon multiball": "Light and lock the required balls for Klingon Multiball, then shoot the start shot to begin it.",
    "start borg multiball and collect a jackpot": "Start Borg Multiball, then shoot the currently lit jackpot shot before multiball ends.",
    "start castle multiball and collect a jackpot": "Start Castle Multiball by qualifying and locking balls, then hit a lit jackpot shot.",
    "start martian multiball": "Lock/qualify Martian Multiball and shoot the start shot when lit to launch it.",
    "collect a super jackpot in martian multiball": "During Martian Multiball, complete the jackpot build sequence and then hit the lit Super Jackpot shot.",
    "start a martian attack any saucer mode": "Shoot a saucer when Martian Attack is available to start any Martian saucer mode.",
    "start k i t t ramp mode": "Shoot the K.I.T.T. ramp when mode start is lit to begin the ramp mode sequence.",
    "start super pursuit multiball": "Advance pursuit progression and lock/start conditions until Super Pursuit Multiball is lit, then start it.",
    "start 3 ball multiball tnt box": "Complete the TNT box lock/start requirements, then shoot the lit start to launch 3-ball multiball.",
    "complete dolly parton once": "Finish the full DOLLY PARTON letter/objective sequence one time.",
    "complete g l o b e": "Complete all letters in G-L-O-B-E by hitting each required lit lane/target.",
    "complete green yellow red targets": "Hit the GREEN, YELLOW, and RED target set until all are completed.",
    "complete green yellow red to light lock": "Finish the GREEN-YELLOW-RED set to light ball lock, then confirm lock is lit.",
    "complete inlane drop targets for 5x bonus": "Complete the inlane drop targets until 5x bonus is lit/awarded.",
    "light jackpot 7 bank completions and collect it at the center ramp": "Complete the required bank seven times to light jackpot, then shoot the center ramp to collect it.",
    "hit the genie to start a tale mode": "Shoot the Genie when lit to start a Tale mode.",
    "collect 1 tale and light lock": "Complete one Tale mode objective and continue until lock becomes lit.",
    "collect a bonus build at a drop target": "Build bonus at the table's drop target bank, then collect the lit bonus increase from a qualifying drop target hit.",
    "complete the catapult 3 hits": "Shoot the catapult shot three times to complete the catapult objective.",
    "lock 2 balls and start multiball at the genie": "Light and lock two balls, then shoot Genie start to begin multiball.",
    "pick up 1 passenger": "Shoot the lit pickup/passenger shot once to load a passenger.",
    "score 1 goal": "Shoot the lit soccer goal/goal mouth shot and register one goal.",
    "relight laser kick kickback": "Hit the relight target/lane for Laser Kick until kickback is active again."
  });

  const RULES = [
    {
      re: /^start any multiball$/,
      desc: "Qualify any multiball available on that table, then shoot the lit start shot."
    },
    {
      re: /^start multiball$/,
      desc: "Light and lock the required balls, then start multiball at the lit start shot."
    },
    {
      re: /^start multiball lock balls$/,
      desc: "Lock the required balls for that table's multiball and trigger the lit start."
    },
    {
      re: /^start multiball and collect a jackpot$/,
      desc: "Start multiball first, then shoot any currently lit jackpot shot before the mode ends."
    },
    {
      re: /^start multiball and collect a jackpot at the upper loop$/,
      desc: "Start multiball, then prioritize the upper loop when jackpot is lit there."
    },
    {
      re: /^start any multiball and collect a super jackpot$/,
      desc: "Start any multiball, build toward super jackpot, then hit the lit Super Jackpot collect shot."
    },
    {
      re: /^start multiball at the tv saucer$/,
      desc: "Qualify multiball and shoot the TV saucer when it is lit as the start shot."
    },
    {
      re: /^collect any jackpot$/,
      desc: "Play any active jackpot phase and hit one lit jackpot collect shot."
    },
    {
      re: /^collect any super jackpot$/,
      desc: "During an eligible multiball, complete the build requirements and collect one Super Jackpot."
    },
    {
      re: /^collect a jackpot in multiball$/,
      desc: "Start multiball, then hit a lit jackpot shot before ball count drops."
    },
    {
      re: /^collect a super jackpot in multiball$/,
      desc: "In multiball, complete jackpot build steps and shoot the lit Super Jackpot lane/ramp."
    },
    {
      re: /^lock a ball$/,
      desc: "Shoot any currently lit lock shot and confirm one ball is locked."
    },
    {
      re: /^lock 1 ball/,
      desc: "Shoot the lit lock shot once to secure one ball for multiball progress."
    },
    {
      re: /^light and lock 1 ball at the scoop$/,
      desc: "Complete the lock-lighting requirements, then shoot the scoop to lock one ball."
    },
    {
      re: /^light and collect a saucer award$/,
      desc: "Light a saucer award through required targets/lanes, then shoot the saucer to collect it."
    },
    {
      re: /^light and collect a tv award$/,
      desc: "Light the TV award, then shoot the TV shot/saucer while it is lit."
    },
    {
      re: /^light or collect extra ball$/,
      desc: "Either light Extra Ball or fully collect it, depending on current table state."
    },
    {
      re: /^start any timed mode$/,
      desc: "Begin any countdown/timed feature by shooting its lit mode-start shot."
    },
    {
      re: /^start any mission$/,
      desc: "Qualify and start any mission from that table's mission start shot."
    },
    {
      re: /^complete any main mission$/,
      desc: "Start a main mission and finish all lit mission shots within the mode."
    },
    {
      re: /^start any map mode objective$/,
      desc: "Begin any objective tied to the map/mode layer by shooting the lit start shot."
    },
    {
      re: /^start any main mission at the van$/,
      desc: "Advance enough progression to light the van, then shoot it to start a main mission."
    },
    {
      re: /^start a major shot mode$/,
      desc: "Light and start a primary mode that requires completing a sequence of lit major shots."
    },
    {
      re: /^start a mode feature/,
      desc: "Advance feature prerequisites, then start the lit mode/feature entry shot."
    },
    {
      re: /^start a mode/,
      desc: "Complete the qualify steps, then shoot the lit mode start to begin that mode."
    },
    {
      re: /^start an item mode/,
      desc: "Light an item mode and shoot the lit item shot to start it."
    },
    {
      re: /^complete a mode collect its shots$/,
      desc: "Start the mode and complete all required lit mode shots before timeout."
    },
    {
      re: /^complete any lit objective$/,
      desc: "Shoot the currently lit objective shots until one objective is completed."
    },
    {
      re: /^complete a drop target bank$/,
      desc: "Knock down every target in one drop-target bank in a single completion."
    },
    {
      re: /^complete 1 bank of targets$/,
      desc: "Finish one full target bank by clearing all required targets."
    },
    {
      re: /^complete a standup target bank$/,
      desc: "Hit each standup in the bank until all are registered complete."
    },
    {
      re: /^complete either drop target bank birds or milk$/,
      desc: "Choose either the Birds or Milk bank and complete all targets in that bank."
    },
    {
      re: /^clear inline drop targets$/,
      desc: "Drop all inline targets in that bank so the bank fully resets/completes."
    },
    {
      re: /^complete top lanes$/,
      desc: "Roll through all required top lanes to complete the full lane set."
    },
    {
      re: /^complete 1 2 3 top lanes$/,
      desc: "Complete lanes 1, 2, and 3 by lane change control and/or accurate lane feeds."
    },
    {
      re: /^shoot to access the upper playfield$/,
      desc: "Hit the shot that feeds the upper playfield and confirm entry."
    },
    {
      re: /^complete 1 upper playfield objective$/,
      desc: "Enter the upper playfield and finish one lit upper-playfield objective."
    },
    {
      re: /^shoot left orbit loop lane$/,
      desc: "Make one clean left orbit/loop/lane shot."
    },
    {
      re: /^shoot right orbit loop lane$/,
      desc: "Make one clean right orbit/loop/lane shot."
    },
    {
      re: /^shoot any ramp$/,
      desc: "Make any successful ramp shot from either flipper."
    },
    {
      re: /^make 1 left ramp shot$/,
      desc: "Shoot and complete the left ramp once."
    },
    {
      re: /^shoot the left ramp to start an objective$/,
      desc: "Advance objective qualifiers, then shoot left ramp when objective start is lit."
    },
    {
      re: /^hit any scoop or saucer$/,
      desc: "Shoot any scoop/saucer entry and hold for the award/start sequence."
    },
    {
      re: /^hit captive ball or bash toy$/,
      desc: "Hit the captive ball or bash toy hard enough to register a valid hit."
    },
    {
      re: /^hit pop bumpers (\d+) times$/,
      desc: function(match){
        const count = String(match[1] || "").trim();
        return "Feed the pop bumper area and accumulate at least " + count + " pop hits.";
      }
    },
    {
      re: /^light and rip the spinner$/,
      desc: "Light spinner value first, then send the ball through for a sustained spinner rip."
    },
    {
      re: /^light the spinner and score spinner rips$/,
      desc: "Light the spinner, then repeatedly shoot it while lit to accumulate rip scoring."
    },
    {
      re: /^light the spinner at the right standup target$/,
      desc: "Hit the right standup target to light spinner, then keep spinner lit/active."
    },
    {
      re: /^light the spinner to 2 000 and rip it$/,
      desc: "Build spinner value to 2,000, then send a strong shot through spinner for a rip."
    },
    {
      re: /^rip a spinner$/,
      desc: "Shoot the spinner cleanly with enough speed to generate multiple rapid spinner switches."
    },
    {
      re: /^make a (\d+) shot combo$/,
      desc: function(match){
        const count = String(match[1] || "").trim();
        return "Hit " + count + " qualifying shots back-to-back within the combo timer window.";
      }
    },
    {
      re: /^raise bonus multiplier$/,
      desc: "Complete the table's bonus-X qualifiers until the multiplier increases."
    },
    {
      re: /^reach 4x bonus multiplier$/,
      desc: "Continue bonus-X progression until 4x bonus is lit/awarded."
    },
    {
      re: /^reach a high bonus and collect end of ball bonus$/,
      desc: "Build bonus value and multiplier during play, then end the ball to collect the high end-of-ball bonus."
    }
  ];

  function resolveTaskExplanation(taskName){
    const rawTask = String(taskName || "").trim();
    if(!rawTask) return "";
    const key = normalizeTaskKey(rawTask);

    if(EXACT[key]) return makeHowTo(EXACT[key]);

    const rawScoreMatch = rawTask.match(/^(easy|medium|hard)\s+score\s*\(([^)]+)\)\s*$/i);
    if(rawScoreMatch){
      const tier = String(rawScoreMatch[1] || "").toLowerCase();
      const target = String(rawScoreMatch[2] || "").trim().replace(/\+$/, "") + "+";
      const tierHint = tier === "easy"
        ? "Use safer repeatable shots and bonus building."
        : (tier === "medium"
          ? "Blend safe feeds with mode progress and controlled risk."
          : "Stack multipliers, modes, and multiball scoring before cashing out.");
      return makeHowTo("Reach at least " + target + " points in a valid game on that table. " + tierHint);
    }

    for(let i = 0; i < RULES.length; i++){
      const rule = RULES[i];
      const match = key.match(rule.re);
      if(!match) continue;
      const out = (typeof rule.desc === "function")
        ? rule.desc(match, rawTask, key)
        : rule.desc;
      if(out) return makeHowTo(out);
    }

    if(key.startsWith("complete ")){
      return makeHowTo("Finish this objective once by completing all currently required lit shots/targets for it.");
    }
    if(key.startsWith("start ")){
      return makeHowTo("Qualify this feature, then shoot the lit start shot once to begin it.");
    }
    if(key.startsWith("collect ")){
      return makeHowTo("Play until this collect is lit, then shoot the collect shot while it is active.");
    }
    if(key.startsWith("shoot ")){
      return makeHowTo("Make the named shot cleanly and confirm it registers on the table display.");
    }
    if(key.startsWith("hit ")){
      return makeHowTo("Hit the named feature enough times for one valid completion.");
    }
    if(key.startsWith("lock ")){
      return makeHowTo("Shoot the currently lit lock shot and confirm the lock is counted.");
    }
    if(key.startsWith("light ")){
      return makeHowTo("Complete prerequisite shots to light this feature, then collect/confirm it while lit.");
    }
    if(key.startsWith("make ")){
      return makeHowTo("Execute the required shot sequence cleanly within the timing window.");
    }
    if(key.startsWith("reach ") || key.startsWith("raise ")){
      return makeHowTo("Build progression on the relevant table feature until this threshold is met.");
    }

    return makeHowTo("Complete this objective exactly as written one time on the table.");
  }

  root.FLPR_TASK_EXPLANATIONS = Object.freeze({
    normalizeTaskKey: normalizeTaskKey,
    resolveTaskExplanation: resolveTaskExplanation
  });
  root.flprGetTaskExplanation = resolveTaskExplanation;
})(window);
