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

  const GUIDE_MATCH_STOP_WORDS = new Set([
    "a", "access", "an", "and", "advance", "any", "at", "ball", "balls", "build", "clear", "collect", "collecting",
    "complete", "completed", "different", "either", "for", "from", "hit", "in", "into", "it", "its", "light", "lit",
    "make", "objective", "objectives", "of", "on", "one", "once", "or", "reach", "score", "shoot", "shot", "shots",
    "spell", "start", "step", "steps", "the", "times", "to", "toward", "towards", "two", "twice", "with"
  ]);

  function normalizeGuideMatchToken(token){
    let clean = String(token || "").trim();
    if(!clean) return "";
    if(clean === "mb") return "multiball";
    if(clean.length > 4 && clean.endsWith("ies")) clean = clean.slice(0, -3) + "y";
    else if(clean.length > 4 && clean.endsWith("es")) clean = clean.slice(0, -2);
    else if(clean.length > 3 && clean.endsWith("s")) clean = clean.slice(0, -1);
    return clean;
  }

  function guideMatchTokens(value){
    const key = normalizeTaskKey(value);
    if(!key) return [];
    const rawTokens = key.split(" ").filter(Boolean);
    const expanded = rawTokens.slice();
    let letterRun = "";
    for(const token of rawTokens){
      if(/^[a-z]$/.test(token)){
        letterRun += token;
      }else{
        if(letterRun.length >= 3) expanded.push(letterRun);
        letterRun = "";
      }
    }
    if(letterRun.length >= 3) expanded.push(letterRun);
    const tokens = expanded
      .map(normalizeGuideMatchToken)
      .filter(token => token && !/^\d+$/.test(token) && !GUIDE_MATCH_STOP_WORDS.has(token));
    return Array.from(new Set(tokens));
  }

  function normalizeTableKey(value){
    return String(value || "")
      .toLowerCase()
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u2012\u2013\u2014]/g, "-")
      .replace(/[^a-z0-9 ]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function makeHowTo(description){
    const body = String(description || "").trim();
    return body ? ("How to Achieve: " + body) : "";
  }

  const TABLE_GUIDE_SUMMARY_MAX_CHARS = 260;
  const TABLE_GUIDE_SUMMARY_SOFT_CHARS = 220;
  const TABLE_GUIDE_SUMMARY_MAX_SENTENCES = 2;
  const TABLE_GUIDE_GENERIC_HEADINGS = new Set([
    "bonus", "bonus and bonus multiplier", "bottom of the table", "quick strategy synopsis", "settings and miscellanea",
    "shots and table features", "video transcription"
  ]);
  const TABLE_GUIDE_ACTION_RE = /\b(shoot\w*|hit\w*|complete\w*|spell\w*|light\w*|lock\w*|start\w*|collect\w*|press\w*|make|plung\w*|roll\w*|feed\w*|qualif\w*|require\w*|rais\w*|drop\w*|bash\w*|spin\w*|rip\w*)\b/i;
  const TABLE_GUIDE_MECHANIC_RE = /\b(ramp|orbit|scoop|saucer|target|lane|drop|bank|spinner|button|flipper|plunger|kickback|hole|loop|toy|cannon|bell|genie|snackbar|lock|multiball|jackpot)\b/i;

  function cleanGuideText(value){
    return String(value || "")
      .replace(/\s+/g, " ")
      .replace(/\s+([,.;:!?])/g, "$1")
      .replace(/^Video Transcription:\s*-\s*/i, "")
      .trim();
  }

  function isLooseGuideText(value){
    return /\b(video transcription|i don'?t know|not sure|as we start off|for the demonstration)\b/i.test(String(value || ""));
  }

  function splitGuideHeading(value){
    const body = cleanGuideText(value);
    const match = body.match(/^([^.!?]{3,72})\s+-\s+(.+)$/);
    if(!match) return { heading:"", body };
    const heading = cleanGuideText(match[1]).replace(/:$/, "");
    const rest = cleanGuideText(match[2]);
    return { heading, body: rest || body };
  }

  function splitGuideSentences(value){
    const body = cleanGuideText(value);
    if(!body) return [];
    return body
      .split(/(?<=[.!?])\s+(?=[A-Z0-9("])/)
      .map(cleanGuideText)
      .filter(Boolean);
  }

  function compactGuideSummary(value, maxChars){
    const body = cleanGuideText(value);
    const max = Number(maxChars || TABLE_GUIDE_SUMMARY_MAX_CHARS);
    if(body.length <= max) return body;
    const cut = body.slice(0, max + 1);
    const boundaries = [
      cut.lastIndexOf(". "),
      cut.lastIndexOf("; "),
      cut.lastIndexOf(", "),
      cut.lastIndexOf(" ")
    ].filter(index => index >= Math.floor(max * 0.56));
    const end = boundaries.length ? Math.max.apply(Math, boundaries) : max;
    const out = cleanGuideText(cut.slice(0, end).replace(/[;,:,.]$/, ""));
    return /[.!?]$/.test(out) ? out : (out + ".");
  }

  function scoreGuideSummarySentence(sentence, taskTokens, index){
    const tokens = guideMatchTokens(sentence);
    const tokenSet = new Set(tokens);
    let score = Math.max(0, 8 - Number(index || 0));
    for(const token of taskTokens){
      if(tokenSet.has(token)) score += token.length >= 4 ? 18 : 10;
    }
    if(TABLE_GUIDE_ACTION_RE.test(sentence)) score += 10;
    if(TABLE_GUIDE_MECHANIC_RE.test(sentence)) score += 7;
    if(/\b(if|when|after|then|once|from here|until)\b/i.test(sentence)) score += 5;
    if(/\b(points?|worth|value|bonus|score[s]?)\b/i.test(sentence) && !TABLE_GUIDE_ACTION_RE.test(sentence)) score -= 10;
    if(/\b(settings?|competition|novelty|default|factory|manual claims|i don'?t know|not sure|disabled)\b/i.test(sentence)) score -= 60;
    if(/^\b(the number of|there are|they are|this is|it is)\b/i.test(sentence) && !TABLE_GUIDE_ACTION_RE.test(sentence)) score -= 14;
    if(String(sentence || "").length > 260) score -= 6;
    return score;
  }

  function splitGuideClauses(sentence){
    const body = cleanGuideText(sentence);
    if(!body) return [];
    return body
      .split(/;\s+|:\s+|,\s+(?=(?:and|but|which|where|while|then|with)\b)/i)
      .map(part => cleanGuideText(part).replace(/^(?:this means|and|but|then)\s+/i, ""))
      .filter(part => part.length >= 18);
  }

  function finishGuideSentence(value){
    const clean = cleanGuideText(value);
    if(!clean) return "";
    const capitalized = clean.charAt(0).toUpperCase() + clean.slice(1);
    return /[.!?]$/.test(capitalized) ? capitalized : (capitalized + ".");
  }

  function compressGuideSentence(sentence, taskTokens, maxChars){
    const body = cleanGuideText(sentence);
    const max = Number(maxChars || 150);
    if(body.length <= max) return body;
    const clauses = splitGuideClauses(body);
    if(clauses.length <= 1) return compactGuideSummary(body, max);

    const ranked = clauses.map((clause, index) => ({
      clause,
      index,
      score: scoreGuideSummarySentence(clause, taskTokens, index)
    })).sort((a, b) => b.score - a.score || a.index - b.index);

    const chosen = [];
    for(const item of ranked){
      if(chosen.length >= 2) break;
      if(item.score < 3 && chosen.length) continue;
      const candidate = finishGuideSentence(item.clause);
      const existingLength = chosen.reduce((sum, value) => sum + value.clause.length + 1, 0);
      if(!chosen.length || existingLength + candidate.length <= max){
        chosen.push({ clause: candidate, index: item.index, score: item.score });
      }
    }
    if(!chosen.length) chosen.push({ clause: compactGuideSummary(clauses[0], max), index: 0, score: 0 });
    chosen.sort((a, b) => a.index - b.index);

    let out = chosen.map(item => item.clause).join(" ");
    out = compactGuideSummary(out, max);
    return finishGuideSentence(out);
  }

  function summarizeTableGuide(taskName, guideText){
    const clean = cleanGuideText(guideText);
    if(!clean) return "";
    if(clean.length <= TABLE_GUIDE_SUMMARY_SOFT_CHARS && splitGuideSentences(clean).length <= TABLE_GUIDE_SUMMARY_MAX_SENTENCES){
      return clean;
    }

    const split = splitGuideHeading(clean);
    const headingKey = normalizeTaskKey(split.heading);
    const keepHeading = split.heading
      && split.heading.length <= 46
      && !TABLE_GUIDE_GENERIC_HEADINGS.has(headingKey);
    const taskTokens = guideMatchTokens(taskName);
    const sentences = splitGuideSentences(split.body);
    if(!sentences.length) return compactGuideSummary(clean, TABLE_GUIDE_SUMMARY_MAX_CHARS);

    const ranked = sentences.map((sentence, index) => ({
      sentence,
      index,
      score: scoreGuideSummarySentence(sentence, taskTokens, index)
    })).sort((a, b) => b.score - a.score || a.index - b.index);

    const chosen = [];
    for(const item of ranked){
      if(chosen.length >= TABLE_GUIDE_SUMMARY_MAX_SENTENCES) break;
      if(item.score < 9 && chosen.length) continue;
      if(item.score < 4) continue;
      if(chosen.some(existing => normalizeTaskKey(existing.sentence) === normalizeTaskKey(item.sentence))) continue;
      chosen.push(item);
    }
    if(!chosen.length){
      for(let i = 0; i < sentences.length && chosen.length < 2; i++){
        if(TABLE_GUIDE_ACTION_RE.test(sentences[i]) || TABLE_GUIDE_MECHANIC_RE.test(sentences[i])){
          chosen.push({ sentence: sentences[i], index: i, score: 0 });
        }
      }
    }
    if(!chosen.length) chosen.push({ sentence: sentences[0], index: 0, score: 0 });

    chosen.sort((a, b) => a.index - b.index);
    const headingBudget = keepHeading ? split.heading.length + 3 : 0;
    const sentenceBudget = Math.max(110, Math.floor((TABLE_GUIDE_SUMMARY_MAX_CHARS - headingBudget) / Math.max(1, chosen.length)) + 22);
    let compressed = chosen.map(item => compressGuideSentence(item.sentence, taskTokens, sentenceBudget));
    let summary = compressed.join(" ");
    while(summary.length + headingBudget > TABLE_GUIDE_SUMMARY_MAX_CHARS && compressed.length > 1){
      compressed.pop();
      summary = compressed.join(" ");
    }
    if(keepHeading && !normalizeTaskKey(summary).includes(headingKey)){
      summary = split.heading + " - " + summary;
    }
    return compactGuideSummary(summary, TABLE_GUIDE_SUMMARY_MAX_CHARS);
  }

  function firstCleanString(values){
    for(let i = 0; i < values.length; i++){
      const value = values[i];
      if(typeof value !== "string") continue;
      const clean = value.trim();
      if(clean) return clean;
    }
    return "";
  }

  function tableNameFromLocationLabel(value){
    const raw = String(value || "").trim();
    if(!raw) return "";
    const parts = raw.split(/\s+[\u2012\u2013\u2014-]\s+/);
    return parts.length > 1 ? String(parts[0] || "").trim() : "";
  }

  function isTaskPlaceholderLabel(value){
    return /^(easy|medium|hard)\s+task$/i.test(String(value || "").trim());
  }

  function firstTaskLabel(values){
    for(let i = 0; i < values.length; i++){
      const value = values[i];
      if(typeof value !== "string") continue;
      const clean = value.trim();
      if(clean && !isTaskPlaceholderLabel(clean)) return clean;
    }
    return "";
  }

  function sourceTableNameFromEntry(entry){
    if(!entry || typeof entry !== "object") return "";
    return firstCleanString([
      entry.source_table,
      entry.sourceTable,
      tableNameFromLocationLabel(entry.source_location),
      tableNameFromLocationLabel(entry.sourceLocation)
    ]);
  }

  function getTableNameFromNode(node){
    if(!node || typeof node !== "object") return "";
    const generic = node.genericEntry || {};
    const shuffled = node.taskShuffleEntry || {};
    const shuffledTask = firstTaskLabel([shuffled.objective, shuffled.display_name, shuffled.title, shuffled.name]);
    const genericTask = firstTaskLabel([generic.objective, generic.display_name, generic.title, generic.name]);
    return firstCleanString([
      shuffledTask ? sourceTableNameFromEntry(shuffled) : "",
      genericTask ? sourceTableNameFromEntry(generic) : "",
      sourceTableNameFromEntry(node),
      node.tableName,
      node.targetTable,
      node.target_table,
      node.table,
      generic.target_table,
      generic.table,
      shuffled.target_table,
      shuffled.table,
      tableNameFromLocationLabel(node.full),
      tableNameFromLocationLabel(node.short),
      tableNameFromLocationLabel(node.locationName),
      tableNameFromLocationLabel(node.location)
    ]);
  }

  function sourceTaskLookupKey(value, tableName){
    const key = normalizeTaskKey(value);
    if(!key) return "";
    const tableKey = normalizeTaskKey(tableName);
    if(tableKey && key.startsWith(tableKey + " ")) return key.slice(tableKey.length).trim();
    return key;
  }

  function getTableTaskLookupKeys(taskName, node, tableName){
    const keys = [];
    const addKey = value => {
      const key = normalizeTaskKey(value);
      if(key && !keys.includes(key)) keys.push(key);
    };
    addKey(taskName);
    const generic = node?.genericEntry || {};
    const shuffled = node?.taskShuffleEntry || {};
    [
      shuffled.objective,
      shuffled.display_name,
      shuffled.title,
      generic.source_location,
      generic.sourceLocation,
      generic.objective,
      generic.display_name,
      generic.title,
      generic.location,
      generic.name,
      shuffled.source_location,
      shuffled.sourceLocation,
      shuffled.location,
      node?.source_location,
      node?.sourceLocation
    ].forEach(value => {
      const key = sourceTaskLookupKey(value, tableName);
      if(key && !keys.includes(key)) keys.push(key);
    });
    return keys;
  }

  const TABLE_TASK_GUIDE_OVERRIDES = Object.freeze({
    "attack from mars": {
      "defeat the forcefield": "Hit the three Forcefield standup targets to drop the forcefield. Once it is down, shoot the saucer/hole behind it to start or finish the saucer attack."
    },
    "ac dc": {
      "start 2x playfield": "Playfield Multipliers - Hit the bell three times to start 2X playfield scoring for 20 seconds. Bell hits during 2X reset the timer, but the bell is a dangerous shot even when made cleanly.",
      "start 3x playfield": "Playfield Multipliers - Hit the bell three times to start 2X playfield scoring, then hit the bell three more times while 2X is running to start 3X playfield for 20 seconds. Any bell hit during 3X resets the timer."
    },
    "bride of pinbot": {
      "advance the metamorphosis steps once": "Bride face/metamorphosis - Shoot the left ramp into the Face structure to advance Bride progress. If the space shuttle is lit the ramp may divert to the PinBot board, but a slightly weaker ramp shot can still fall into the Face and advance the Bride."
    },
    "creature from the black lagoon": {
      "start creature feature": "F-I-L-M and multiball path - Complete F-I-L-M from the Kiss lane, Snackbar targets, Paid lanes, and Slide lane, then lock at either Kiss or Slide. Shoot the side lanes or Snackbar until the Creature is found, then shoot Snackbar to rescue the girl and continue toward Jackpot.",
      "complete creature feature": "F-I-L-M and multiball path - Complete F-I-L-M, lock a ball at Kiss or Slide, find the Creature by shooting side lanes or Snackbar, then shoot Snackbar to rescue the girl. Follow with another Snackbar shot for Jackpot and bumper hits to light Super Jackpot.",
      "complete 2 creature features in one game": "F-I-L-M and multiball path - Repeat the Creature sequence twice: complete F-I-L-M, lock at Kiss or Slide, find the Creature from the side lanes or Snackbar, then rescue the girl at Snackbar. After Jackpot, rebuild the same path for the second completion."
    },
    "grand lizard": {
      "shoot to access the upper playfield": "A-B ramps and upper playfield - Shoot either the A or B ramp all the way to the dragon head so the ball is fed onto the upper playfield. Once there, complete the 4-bank or 3-bank drop targets for the upper-playfield awards.",
      "complete 1 upper playfield objective": "Upper playfield - Get to the upper playfield through the A or B ramp, then finish either drop-target objective: clear the 4-bank before the scan timer ends for its lit value, or clear the 3-bank to build the cave value and collect its award."
    },
    "deadpool": {
      "start any battle mode": "At the start of a ball, or after completing the DEAD targets, shoot the scoop to start a Battle. Hit flashing shots to damage the enemy, then shoot the scoop within 10 seconds after winning to finish them off.",
      "complete 2 battle modes in one game": "Start Battles from the scoop at ball start or after completing DEAD targets. Hit flashing shots to damage each enemy, then shoot the scoop within 10 seconds after each win; do this for two different Battles."
    },
    "iron man vault edition": {
      "reach mark 3": "Earn Marks by starting Iron Man scoring rounds, multiballs, Bogey, or War Machine progress. Collect three Mark awards to reach Mark 3.",
      "reach mark 6": "Earn six Marks by starting Iron Man scoring rounds, multiballs, Bogey, or War Machine progress. Mark 6 lights Jericho at the center spinner lane."
    },
    "jokerz": {
      "start a mode feature jokerz etc": "Drop targets and Million Round - Complete all three drop target banks to turn on the white lights in front of them. When all three lights are on, Million Round starts immediately; during the timed round, clearing a lit bank scores 1,000,000 points."
    },
    "judge dredd": {
      "start air raid": "Shoot the Air Raid side ramp to send the ball to the lower-left kickback. Press the left diamond button to fire it back out, then hit the lit drop target to collect the Air Raid award.",
      "collect an air raid award": "Shoot the Air Raid side ramp to send the ball to the lower-left kickback. Press the left diamond button to fire it back out, then hit the lit drop target to collect the Air Raid award.",
      "start multiball": "Spell JUDGE in order on the center drop targets to light locks, then shoot the left ramp for each lock. The first JUDGE completion lights all three locks; later multiballs need one JUDGE completion per lock."
    },
    "medieval madness": {
      "destroy the castle gate": "Shoot the castle entrance repeatedly until the gate breaks. A normal gate takes three solid castle hits; later castle shots continue the castle-destruction path.",
      "start castle multiball": "Complete a major Madness shot or finish Trolls! to light Multiball Madness at the scoop. Shoot the scoop to start it; the shots you completed before starting become the higher-value jackpot shots.",
      "start castle multiball and collect a jackpot": "Complete a major Madness shot or finish Trolls! to light Multiball Madness at the scoop. Shoot the scoop to start it, then shoot any lit jackpot or super jackpot shot during multiball."
    },
    "taxi": {
      "start multiball": "Shoot the right-side Express Lane/lock shot to lock the first ball, then quickly shoot the left Drac/Express Lane 2 shot to lock the second ball and start multiball.",
      "light and lock 1 ball at the scoop": "Shoot the right-side Express Lane/lock shot when it is lit to lock the first ball toward multiball.",
      "start multiball and collect a jackpot": "Lock both balls through the Express Lane lock sequence, then pick up passengers until Jackpot lights at Gorbie and shoot Gorbie before the timer expires."
    },
    "world cup soccer": {
      "start multiball at the tv saucer": "Shoot Build Lock shots, usually the left orbit, either ramp, or Striker's Hideout, until all soccer-ball qualities are collected. Lock one ball at a lit ramp, then shoot the TV saucer for Final Draw multiball.",
      "light final draw": "Shoot Build Lock shots, usually the left orbit, either ramp, or Striker's Hideout, until all soccer-ball qualities are collected. After the ball is built, lock one ball at a lit ramp to light Final Draw at the TV saucer."
    }
  });

  function scoreGuideTokenMatch(taskTokens, guideTokens){
    if(!taskTokens.length || !guideTokens.length) return 0;
    const guideSet = new Set(guideTokens);
    let overlap = 0;
    for(const token of taskTokens){
      if(guideSet.has(token)) overlap++;
    }
    if(!overlap) return 0;
    const taskCoverage = overlap / taskTokens.length;
    const guideCoverage = overlap / guideTokens.length;
    let score = (taskCoverage * 70) + (guideCoverage * 30);
    if(taskTokens.some(token => token.length >= 4 && guideSet.has(token))) score += 12;
    if(taskTokens.includes("multiball") && guideSet.has("multiball")) score += 18;
    if(taskTokens.includes("jackpot") && guideSet.has("jackpot")) score += 18;
    if(taskTokens.includes("mode") && guideSet.has("mode")) score += 10;
    if(taskTokens.includes("target") && guideSet.has("target")) score += 8;
    return score;
  }

  function scoreGuideKeyMatch(taskKey, guideKey, guideText){
    if(!taskKey || !guideKey || taskKey === guideKey) return 0;
    if(taskKey.includes(guideKey) || guideKey.includes(taskKey)) return 100;
    const taskTokens = guideMatchTokens(taskKey);
    const guideTokens = guideMatchTokens(guideKey);
    const titleScore = scoreGuideTokenMatch(taskTokens, guideTokens);
    const textScore = scoreGuideTokenMatch(taskTokens, guideMatchTokens(guideText)) - 6;
    return Math.max(titleScore, textScore);
  }

  function resolveNearestTableTaskGuide(tableGuides, lookupKeys){
    let bestKey = "";
    let bestScore = 0;
    const guideKeys = Object.keys(tableGuides || {});
    for(const lookupKey of lookupKeys){
      for(const guideKey of guideKeys){
        const score = scoreGuideKeyMatch(lookupKey, guideKey, tableGuides[guideKey]);
        if(score > bestScore){
          bestScore = score;
          bestKey = guideKey;
        }
      }
    }
    if(!bestKey || bestScore < 76) return "";
    return String(tableGuides[bestKey] || "").trim();
  }

  function resolveTableTaskGuide(taskName, node, opts){
    const tableName = getTableNameFromNode(node);
    const tableKey = normalizeTableKey(tableName);
    if(!tableKey) return "";
    const lookupKeys = getTableTaskLookupKeys(taskName, node, tableName);
    if(!lookupKeys.length) return "";
    const overrideGuides = TABLE_TASK_GUIDE_OVERRIDES[tableKey];
    if(overrideGuides){
      for(const taskKey of lookupKeys){
        const exact = String(overrideGuides[taskKey] || "").trim();
        if(exact) return exact;
      }
    }
    if(opts && opts.overridesOnly) return "";
    const tableGuides = TABLE_TASK_GUIDES[tableKey];
    if(!tableGuides) return "";
    for(const taskKey of lookupKeys){
      const exact = String(tableGuides[taskKey] || "").trim();
      if(exact) return exact;
    }
    if(EXACT && EXACT[normalizeTaskKey(taskName)]) return "";
    return resolveNearestTableTaskGuide(tableGuides, lookupKeys);
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
    "relight laser kick kickback": "Hit the relight target/lane for Laser Kick until kickback is active again.",
    "advance 1 raft": "Shoot the lit hazard/raft path enough times to advance raft progress by one step.",
    "complete river once": "Finish one full River progression sequence by collecting the required lit shots.",
    "reach class 6 river": "Advance the White Water river classes until Class 6 is reached.",
    "collect a 1 000 000 right ramp shot": "Light the right ramp for its 1,000,000 award, then shoot it before the light times out.",
    "collect a ferris wheel award": "Light the Ferris Wheel, then shoot the Ferris Wheel shot to cash in one award.",
    "spell palace and collect the jackpot": "Complete P-A-L-A-C-E to light the jackpot, then shoot the lit collect shot before it expires.",
    "light the center ramp": "Complete the qualifier targets so the center ramp becomes lit, then confirm the light is active.",
    "complete the 1986 top lanes": "Roll through the top lanes until the full 1-9-8-6 set is completed.",
    "make 3 consecutive center ramp shots": "Hit the center ramp three times in succession before the sequence times out.",
    "light extra ball at the cycle jump ramp": "Build enough progress on the cycle/jump ramp feature to light an Extra Ball there.",
    "start double scoring": "Complete the required setup so the table enters its double-scoring phase.",
    "complete 1 direction": "Finish one full directional shot set on Whirlwind to complete a single direction.",
    "collect a super cellar award": "Light the Super Cellar, then shoot it while lit to collect the award.",
    "light quick multiball": "Advance multiball qualifiers until Quick Multiball is lit and ready to start.",
    "collect the hideout jackpot": "During High Speed multiball/chase, shoot the hideout when jackpot is lit.",
    "start payback time": "Advance No Fear far enough to light and begin Payback Time.",
    "start no limits": "Complete the required No Fear progression so No Limits becomes available, then start it.",
    "start battle royale": "Complete the villain requirements that light Battle Royale, then start it at the lit shot.",
    "qualify war machine multiball": "Advance Iron Man enough to light War Machine Multiball without needing to start it yet.",
    "reach mark 6 to light jericho": "Build Iron Man armor progress to Mark 6 so Jericho becomes lit.",
    "light do or die hurry up": "Complete the required setup to light the Do or Die hurry-up shot.",
    "collect a door prize": "Shoot the lit Party Animal scoop/award shot to collect one Door Prize.",
    "collect a party animal letter": "Light and collect one PARTY ANIMAL letter award.",
    "collect the party bonus": "Light the Party Bonus, then shoot the collect shot while it is active.",
    "complete bat": "Complete the B-A-T bank/lane sequence once.",
    "spell elvira": "Collect the E-L-V-I-R-A letters until the full name is completed.",
    "bring the mixmaster online": "Advance Dr. Dude enough to power up the Mixmaster feature and bring it online.",
    "complete reflex 1 2 3": "Complete the Reflex 1-2-3 sequence by hitting each required step in order.",
    "start dance contest": "Light the Dance Contest mode and shoot the start shot to begin it.",
    "make a song request": "Shoot the Party Zone request shot when lit to queue one song request.",
    "complete way out of control": "Start Way Out Of Control and finish its required lit shots before the timer expires.",
    "invite 1 party member at the cosmic cottage": "Shoot the Cosmic Cottage when lit to invite one party member.",
    "collect the big bang jackpot": "During Party Zone multiball, build and collect the Big Bang Jackpot at the lit shot.",
    "collect a spider wheel award": "Shoot the Spider Wheel when lit and collect one award from it.",
    "complete return of the dead heads": "Start Return of the Dead Heads and finish the required shot sequence.",
    "light scared stiff": "Progress the main table features until Scared Stiff is lit and ready.",
    "start scared stiff": "Once lit, shoot the start shot to begin Scared Stiff.",
    "complete s k a t e once": "Knock down all five S-K-A-T-E targets one time. Use the lower right flipper when possible because the bank is dangerous from loose shots.",
    "collect a 100 000 right saucer": "Complete S-K-A-T-E twice to advance the right saucer to 100,000, then shoot the saucer before accidentally advancing into reset/extra-ball behavior.",
    "light collect bonus at the right saucer": "Complete the flashing yellow arrows at the upper-left drop bank to light Collect Bonus at the right saucer.",
    "complete the upper left drop target bank": "Clear the upper-left drop target bank once. Completions build bonus and can help light Spot X / Collect Bonus depending on current settings.",
    "complete x y z targets": "Hit X, Y, and Z on Vector. Completing them in order adds the sequence bonus and spots a Defender target.",
    "complete defender drops in order": "Clear the back-left Defender drop targets from left to right while the arrows are flashing to light the Vectorscan ramp for lock immediately.",
    "lock 1 ball on the vectorscan ramp": "Light lock through the Defender drops, then shoot the left Vectorscan ramp so the saucer sends the ball into a lock.",
    "complete h y p e in order": "Hit H-Y-P-E in sequence. Doing it in order advances display bonus multiplier, lights the ramp arrows, and starts multiball if balls are locked.",
    "make 3 vectorscan ramp shots": "Shoot the left Vectorscan ramp three successful times. During multiball, keep feeding the ramp for repeated value.",
    "spell p l a y": "Roll through all four P-L-A-Y top lanes. Use right-flipper lane change to rotate lit lanes.",
    "complete 1 2 3 targets": "Hit Gold Ball's upper-right 1-2-3 standups until all three are lit/completed for the current award step.",
    "light 4 goldball letters": "Use the center standup, star rollovers, spinner, and arrow-advance features to light four letters in GOLDBALL.",
    "complete g o l d b a l l": "Light all eight GOLDBALL letters. This awards the completion value and qualifies the golden-ball extra-ball feature on skill-feature settings.",
    "score a 100 000 1 2 3 award": "Complete the 1-2-3 target set enough times in one ball to reach the repeatable 100,000-point award, then collect it.",
    "spot 5 city slicker letters": "Shoot City Slicker orbits and lit target banks until five total CITY SLICKER letters are spotted.",
    "complete city slicker": "Spot all eleven CITY SLICKER letters. Orbits, side banks, and upper playfield completions all contribute depending on settings.",
    "qualify uptown": "Complete CITY SLICKER or light the four orange dollar buttons above the top saucer to qualify Uptown.",
    "start uptown at the top saucer": "Once Uptown is qualified, shoot the top saucer. Starting it there locks the ball and begins the two-ball sequence after the next switch.",
    "collect an uptown award": "During Uptown, hit the flashing standup targets on the diagonal playfield until all six white dollar symbols are collected.",
    "collect a center saucer bonus": "Shoot the center saucer three times to collect the current City Slicker letter bonus. Be ready for the dangerous automatic flipper return.",
    "defeat 1 ringmaster": "Spell W-O-W to summon the Ringmaster, hit him five times, then shoot under him to finish the defeat.",
    "collect a side show award": "Light Side Show with the Ringmaster-side yellow targets or use the starting Side Show, then shoot the left orbit.",
    "start juggler multiball": "Shoot the left orbit three times to light Juggler, then shoot it three more times to lock/start the Juggler multiball.",
    "start highwire multiball": "Light left-ramp locks with the posts beside the ramp or Side Show, then lock three balls at the left ramp.",
    "start strike an arc multiball": "Shoot the left ramp enough times to qualify Strike an Arc, then make the required ramp shot to begin it.",
    "collect a ringmaster jackpot": "During a non-battle Ringmaster multiball, shoot the hole under the raised Ringmaster for the jackpot.",
    "collect 3 marvels": "Collect any three Cirqus Marvels through Ringmaster, Side Show, Highwire, Juggler, Acrobats, Menagerie, Boom, or Spin progress.",
    "start join the cirqus": "Collect all nine Marvels, wait for active multiballs to finish, then shoot a lit orbit to start Join the Cirqus.",
    "spell t h e a t r e": "Shoot the left orbit while Theatre letters are lit until T-H-E-A-T-R-E is complete.",
    "start an illusion": "Hit the trunk three times to expose the trunk hole, then shoot the hole to start an Illusion.",
    "spell m a g i c": "Shoot lit Spell Magic ramps/loops until M-A-G-I-C is complete and ball lock is qualified.",
    "lock 2 balls behind the trunk": "After spelling MAGIC, shoot the center loop / lock feed twice to lock the first two balls behind the trunk.",
    "start theatre multiball": "With two balls locked, shoot the trunk when the magnetic bullseye is exposed to start Theatre Multiball.",
    "collect a theatre jackpot": "During Theatre Multiball, hit the trunk enough times to light Jackpot, then shoot the trunk hole to collect it.",
    "advance clock to midnight": "Shoot the right orbit and other clock-advance awards until the clock reaches midnight and Midnight Madness begins.",
    "start grand finale": "Finish Theatre, Multiball, Midnight, and all eight Illusions, then shoot the left entrance of the center loop.",
    "spell p h a n t o m": "Shoot the left ramp repeatedly until P-H-A-N-T-O-M is complete.",
    "start unlimited millions": "Spell PHANTOM at the left ramp; once M is awarded, keep shooting the left ramp before the timer expires.",
    "open the organ": "Hit the three Organ standup targets to open the Organ scoop.",
    "start 2 ball organ multiball": "Open the Organ, then shoot the ball into the Organ scoop to begin 2-ball play.",
    "start 3 ball organ multiball": "During 2-ball play, put both balls into the open Organ within the timer to begin 3-ball play.",
    "collect the organ jackpot": "During 3-ball multiball, hit an Organ target to open the scoop, then shoot the Organ before it closes.",
    "raise bonus multiplier to 5x": "Shoot Magic Mirror repeatedly until the bonus multiplier reaches 5x.",
    "relight laser kick": "If the left outlane Laser Kick has been used, shoot the right Trap Door scoop to relight it.",
    "shoot the cd ramp": "Make a clean shot through Al's spinning CD ramp / center ramp feature.",
    "visit the guitar mini playfield": "Shoot the feed that kicks the ball to the elevated guitar mini playfield.",
    "complete m i x rollovers": "Send the ball through the guitar mini-playfield M-I-X rollovers until the set is complete.",
    "start music video mode": "Shoot the center video-mode lane/ramp when the Music Video feature is lit.",
    "shoot a world tour city orbit": "Make a clean orbit/loop shot that advances the World Tour city feature.",
    "hit the feed back kicker": "Shoot or feed the lane that sends the ball through the Feed Back Kicker return.",
    "collect an al s garage band jackpot": "Start Al's multiball, then shoot the lit jackpot path through the spinning CD/ramp area before the value drains away."
  });

  // Table-specific mini-guides generated from the local WorldsofPinballTables rules guide.
  const TABLE_TASK_GUIDES = Object.freeze({
    "medieval madness": {
      "destroy the castle gate": "Castle hurry-ups - A castle hurry-up begins when a shot is completed (joust, catapult, peasant, damsel, or a completion of the Trolls mode) and either: Medieval Madness has not been played yet, but the shot in question was not completed for the first time; or Medieval Madness has been played, but Royal Madness has not.",
      "win 1 joust victory": "Joust orbits - Left and right orbits that count toward a Joust completion together. Shots in a Joust progression are worth 50,000, 75,000, then 100,000. The shot will either go all the way around the table and return down the opposite orbit, or fall into the pop bumpers during a 100,000 point joust completion shot or Super Jets.",
      "complete the catapult 3 hits": "Catapult lane - At the far left of the game, and the hardest major shot to hit. Most of the time, the ball ends up here on a bounce rather than from a shot. Three hits to the catapult completes it. Each catapult hit sends the ball around a long habitrail that ends up in the left in lane. The 3rd Catapult hit, which scores a completion, allows player to use both flippers to launch an object; the object selected is itself cosmetic and provides a certain number of points. There is a standup target in the Catapult lane that registers one free hit to the Catapult if the lane is shot hard enough.",
      "beat 3 trolls": "Trolls - the Trolls! round, which is lit at the scoop after hitting the targets on either side of the castle 8 times.",
      "start castle multiball": "Multiball Madness - When any shot is completed (or a Trolls! mode is finished), an arrow will light at the scoop. This signifies that Multiball Madness is ready. Multiball Madness is a 2, 3, or 4 ball round with more jackpot shots and bigger value if more Madnesses are started at once: this means completing as many shots as possible before shooting the scoop for Multiball Madness. During Multiball Madness, all of the shots that had already been completed are now lit for super jackpots. The value of the jackpots increases the more there are.",
      "start castle multiball and collect a jackpot": "Multiball Madness - When any shot is completed (or a Trolls! mode is finished), an arrow will light at the scoop. This signifies that Multiball Madness is ready. Multiball Madness is a 2, 3, or 4 ball round with more jackpot shots and bigger value if more Madnesses are started at once: this means completing as many shots as possible before shooting the scoop for Multiball Madness. During Multiball Madness, all of the shots that had already been completed are now lit for super jackpots. The value of the jackpots increases the more there are.",
      "complete royal madness": "Royal Madness - Royal Madness is ready at the Everything Scoop when the five lights in front of it are flashing. To do this, make sure that all 5 shots have been completed once and that Multiball Madness has already been played. Royal Madness is a timed round that starts at 20 seconds, but resets whenever a lit shot is hit. The goal is to shoot every major shot twice (catapult, either loop, each ramp, and one hit to each troll). The first hit to a shot is worth 200,000, and the second is worth 1,500,000. Completing the mode earns either an extra ball or 15,000,000 points depending on settings."
    },
    "attack from mars": {
      "start a martian attack any saucer mode": "Saucer and Attack Waves - The first saucer scores 50,000,000 points per target hit, requires 3 hits to expose the Destroy hole, and awards 200,000,000 points for destroying the saucer. Subsequent saucers up to and including the 5th score 10,000,000 more points per target hit, require 3 additional hits to destroy, and give 100,000,000 additional points for destroying. The country being attacked is purely cosmetic: the length and scoring of each saucer round is based solely on how many saucers have been completed. After destroying the 5th saucer, the final round is Attack Mars.",
      "defeat the forcefield": "Settings and miscellanea - The number of Attack Waves (1-5), bottom lane completions (1-20), or forcefield hits during Strobe Multiball (8-12) that are required to light an extra ball each have their own settings, and each of these extra balls can be individually disabled. The Forcefield can require shots to all three targets separately in order to be disabled, or lit targets can spot unlit targets (effectively meaning any 3 forcefield shots is good enough to start a Wave). playing standard multiball, or completing one or more of the four ramps/orbits and collecting the corresponding hurry-up at the Saucer/Forcefield.",
      "start stroke of luck": "Stroke of Luck scoop - At the beginning of the game, and after lighting all 4 in/out lanes, this saucer in the middle-right of the table is lit yellow for Stroke of Luck.",
      "destroy 1 saucer": "Saucer and Attack Waves - The first saucer scores 50,000,000 points per target hit, requires 3 hits to expose the Destroy hole, and awards 200,000,000 points for destroying the saucer. Subsequent saucers up to and including the 5th score 10,000,000 more points per target hit, require 3 additional hits to destroy, and give 100,000,000 additional points for destroying. The country being attacked is purely cosmetic: the length and scoring of each saucer round is based solely on how many saucers have been completed. After destroying the 5th saucer, the final round is Attack Mars.",
      "start martian multiball": "Martian targets and multiball - Martian Multiball is the only multiball that can run alongside another multiball: to stack them, start Martian Attack, then start the other multiball (standard, Strobe, or Total Annihilation), then complete Martian Attack to begin Martian Multiball while the other multiball is still in play. Starting Martian Multiball at least once is the final of the 6 requirements toward Rule the Universe wizard mode.",
      "destroy 2 saucers in one game": "Saucer and Attack Waves - The first saucer scores 50,000,000 points per target hit, requires 3 hits to expose the Destroy hole, and awards 200,000,000 points for destroying the saucer. Subsequent saucers up to and including the 5th score 10,000,000 more points per target hit, require 3 additional hits to destroy, and give 100,000,000 additional points for destroying. The country being attacked is purely cosmetic: the length and scoring of each saucer round is based solely on how many saucers have been completed. After destroying the 5th saucer, the final round is Attack Mars.",
      "light lock": "Award Lock - Multiball (typically only during the final ball of the game if the player hasn't played standard multiball yet, or rarely if 2 balls are locked/multiball is ready at the lock lane)",
      "collect a stroke of luck award": "Stroke of Luck scoop - At the beginning of the game, and after lighting all 4 in/out lanes, this saucer in the middle-right of the table is lit yellow for Stroke of Luck.",
      "complete a 5 way combo": "5-Way Combo - Rule the Universe is a 5-ball multiball with a very long ball save where everything is lit. Total Annihilation's rules are active, with every ramp and orbit being worth a base value of 100,000,000; the moving Super Jackpot is constantly available, worth a multiple of 250,000,000 just like regular multiball; the drop target in the saucer scores 100,000,000; all martian targets score 50,000,000. The goal of Rule the Universe is to score a total of 5,000,000,000 points before draining back to single ball play.",
      "start total annihilation": "Ramps, orbits, and Total Annihilation - The left orbit, left ramp, right ramp, and right orbit are the Capture, Big-O-Beam, Tractor Beam, and Atomic Blaster shots respectively. Making one of these shots scores 20,000,000 the first time, 25,000,000 the second time, and 30,000,000 the third time. Using a Super Skill Shot on any of these four shots also completes it instantly (but does not award the 3 individual shot values, just the Super Skill Shot score). Once a shot is completed, a hurry-up will start at the Saucer.",
      "conquer mars": "playing Total Annihilation, or if you've already completed 4-5 saucers, try to Conquer Mars. focusing on Total Annihilation- playing it several times if necessary- or focusing on Conquer Mars, or even Rule the Universe if you're close to it.",
      "collect a super jackpot in martian multiball": "Standard Multiball - At the beginning of standard Multiball, all four Total Annihilation shots plus the lock shot will be lit for Jackpot. The first jackpot scores 60,000,000 points, with each subsequent jackpot scoring an additional 10,000,000. Making a jackpot unlights it. After collecting all 5 jackpots, one of the lanes will flash for Super Jackpot, which scores 250,000,000 the first time and increases by a further 250,000,000 for each collect up to a maximum of 1,000,000,000 points. The super jackpot light moves every 5 seconds, going back and forth from left to right to left across the table.",
      "start strobe multiball": "Standard Multiball - At the beginning of standard Multiball, all four Total Annihilation shots plus the lock shot will be lit for Jackpot. The first jackpot scores 60,000,000 points, with each subsequent jackpot scoring an additional 10,000,000. Making a jackpot unlights it. After collecting all 5 jackpots, one of the lanes will flash for Super Jackpot, which scores 250,000,000 the first time and increases by a further 250,000,000 for each collect up to a maximum of 1,000,000,000 points. The super jackpot light moves every 5 seconds, going back and forth from left to right to left across the table.",
      "destroy 2 saucers": "Saucer and Attack Waves - The first saucer scores 50,000,000 points per target hit, requires 3 hits to expose the Destroy hole, and awards 200,000,000 points for destroying the saucer. Subsequent saucers up to and including the 5th score 10,000,000 more points per target hit, require 3 additional hits to destroy, and give 100,000,000 additional points for destroying. The country being attacked is purely cosmetic: the length and scoring of each saucer round is based solely on how many saucers have been completed. After destroying the 5th saucer, the final round is Attack Mars."
    },
    "world cup soccer": {
      "score 1 goal": "Goals - The Goal is lit at the start of each ball. Once collected, the Goal must be relit by rolling over all 4 buttons on the way to the goal. Buttons can also be spotted by the small Striker target behind the spinning soccer ball. Making a goal scores 10,000,000 points and increases the goal count. Every goal adds 5,000,000 to the end of ball bonus and starts one of the Ultra modes. Every 4th goal lights the TV saucer for an award. Goals are also very important in multiball as explained below. A small saucer just in front and to the left of the goal is the Assist saucer.",
      "light and collect a tv award": "TV Awards - The TV is lit at the start of each ball, and relit by collecting 4 goals. Shooting the TV when it is lit for TV award (but not if it is lit for Final Draw or Final Match) starts the next mode. TV modes are always 20 seconds long, and always cycle in this order: Big Goal Round: shoot the goal 3 times to spell Big. The first two each score 15,000,000 points, and the third scores 30,000,000 points. Extra Ball Round: an extra ball is lit at Striker's hideout for 20 seconds. If the extra ball is earned, shooting Striker's hideout again within the time scores 50,000,000 points.",
      "score 2 goals": "Goals - The Goal is lit at the start of each ball. Once collected, the Goal must be relit by rolling over all 4 buttons on the way to the goal. Buttons can also be spotted by the small Striker target behind the spinning soccer ball. Making a goal scores 10,000,000 points and increases the goal count. Every goal adds 5,000,000 to the end of ball bonus and starts one of the Ultra modes. Every 4th goal lights the TV saucer for an award. Goals are also very important in multiball as explained below. A small saucer just in front and to the left of the goal is the Assist saucer.",
      "start multiball at the tv saucer": "TV Awards - The TV is lit at the start of each ball, and relit by collecting 4 goals. Shooting the TV when it is lit for TV award (but not if it is lit for Final Draw or Final Match) starts the next mode. TV modes are always 20 seconds long, and always cycle in this order: Big Goal Round: shoot the goal 3 times to spell Big. The first two each score 15,000,000 points, and the third scores 30,000,000 points. Extra Ball Round: an extra ball is lit at Striker's hideout for 20 seconds. If the extra ball is earned, shooting Striker's hideout again within the time scores 50,000,000 points.",
      "light final draw": "TV Awards - The TV is lit at the start of each ball, and relit by collecting 4 goals. Shooting the TV when it is lit for TV award (but not if it is lit for Final Draw or Final Match) starts the next mode. TV modes are always 20 seconds long, and always cycle in this order: Big Goal Round: shoot the goal 3 times to spell Big. The first two each score 15,000,000 points, and the third scores 30,000,000 points.",
      "score 3 goals": "Goals - The Goal is lit at the start of each ball. Once collected, the Goal must be relit by rolling over all 4 buttons on the way to the goal. Buttons can also be spotted by the small Striker target behind the spinning soccer ball. Making a goal scores 10,000,000 points and increases the goal count. Every goal adds 5,000,000 to the end of ball bonus and starts one of the Ultra modes. Every 4th goal lights the TV saucer for an award. Goals are also very important in multiball as explained below. A small saucer just in front and to the left of the goal is the Assist saucer."
    },
    "the getaway": {
      "complete green yellow red to light lock": "Stoplight targets and locks - There are 3 banks of stoplight targets: the lowest one faces the upper right flipper, the middle one faces the lower flippers, and the upper one faces the pop bumpers. The goal is to hit the three targets of the same colour to light a lock. The first lock requires the green targets; the second lock requires the yellows; the third lock, which starts multiball, requires the reds. Multiple locks can be lit at once- for example, by completing the green targets, then completing the yellows before locking ball 1, the first two locks will both be lit- but it is impossible to get credit for a colour before completing the previous one.",
      "lock 1 ball left orbit upper loop": "Stoplight targets and locks - There are 3 banks of stoplight targets: the lowest one faces the upper right flipper, the middle one faces the lower flippers, and the upper one faces the pop bumpers. The goal is to hit the three targets of the same colour to light a lock. The first lock requires the green targets; the second lock requires the yellows; the third lock, which starts multiball, requires the reds. Multiple locks can be lit at once- for example, by completing the green targets, then completing the yellows before locking ball 1, the first two locks will both be lit- but it is impossible to get credit for a colour before completing the previous one.",
      "complete 1 supercharger cycle": "Left ramp: Supercharger - At the beginning of the game, or immediately after completing 1-2-3 targets, the ramp will be lit one time for a Supercharger Boost. This scores 3,000,000 points, plus an additional 1,000,000 for each 1-2-3 standup target hit since the last Boost, up to a maximum of 10,000,000. The ball will be accelerated around the track by a magnet very quickly as this happens, with each loop counting off 1,000,000 at a time. To score the Boost again, a bank of 1-2-3 targets must be completed.",
      "light redline mania": "5th Gear: Light Redline Mania (the wizard mode, explained later) - Playing and completing Redline Mania instantly resets your progress to pre-1st Gear levels. Subsequent runthroughs of the Gears require 1 more RPM shot per Gear than before; for example, on the second time round, 1st Gear requires 2 RPM shots, 2nd Gear requires 3, etc. Going through the left in lane when it is lit for 2x RPM will cause the right orbit shot to count as 2 RPM shots for the purpose of working toward the next Gear if it is hit immediately.",
      "start multiball": "Multiball - Standard Multiball is started by locking 3 balls at the left orbit or upper loop after completing the stoplight targets, or as an immediate award from Burn Rubber. Pretty much the only thing to do in multiball is light and score Jackpots, although the Tunnel saucer will still score Tunnel shots and will hold on to the ball for about 10 seconds before kicking it to the upper flipper for an upper loop/jackpot shot. The game will tell you that jackpot is lit in a certain number of loops. Shooting a ball up the Supercharger Ramp scores 10 loops.",
      "start multiball and collect a jackpot at the upper loop": "Multiball - Standard Multiball is started by locking 3 balls at the left orbit or upper loop after completing the stoplight targets, or as an immediate award from Burn Rubber. Pretty much the only thing to do in multiball is light and score Jackpots, although the Tunnel saucer will still score Tunnel shots and will hold on to the ball for about 10 seconds before kicking it to the upper flipper for an upper loop/jackpot shot. The game will tell you that jackpot is lit in a certain number of loops. Shooting a ball up the Supercharger Ramp scores 10 loops.",
      "collect a super jackpot in multiball": "Multiball - Standard Multiball is started by locking 3 balls at the left orbit or upper loop after completing the stoplight targets, or as an immediate award from Burn Rubber. Pretty much the only thing to do in multiball is light and score Jackpots, although the Tunnel saucer will still score Tunnel shots and will hold on to the ball for about 10 seconds before kicking it to the upper flipper for an upper loop/jackpot shot. The game will tell you that jackpot is lit in a certain number of loops. Shooting a ball up the Supercharger Ramp scores 10 loops.",
      "complete 2 supercharger cycles in one game": "Left ramp: Supercharger - At the beginning of the game, or immediately after completing 1-2-3 targets, the ramp will be lit one time for a Supercharger Boost. This scores 3,000,000 points, plus an additional 1,000,000 for each 1-2-3 standup target hit since the last Boost, up to a maximum of 10,000,000. The ball will be accelerated around the track by a magnet very quickly as this happens, with each loop counting off 1,000,000 at a time. To score the Boost again, a bank of 1-2-3 targets must be completed."
    },
    "star trek stern 2013": {
      "start any mission": "Video Transcription: - Whilst I'm on the way to doing that, actually, let's just talk about how we move from each mode. So let's say I choose prime directive as my first mode, the way to do that is by pressing this button. And then the ball would fire. That would lock in this mode, and then what will happen is there will be a 30 second timer whilst you're playing out mode, and you have to make a series of shots, and you're playing out that mode. At the end of that mode, then what will happen is either this shot here, the mission start shot here, or the away team shot here will light.",
      "light lock for multiball": "Video Transcription: - So, as we start off, you are in control of this grid. So if you flip the flipper, you can choose which one you want to play. So these are little modes. Now I don't, like I said, because it's such a new game, I don't know which ones are the ones where the most points are, but my objective is basically to get through all of the modes, because I know at the end of this, after doing all six of these modes, there's a special multiball at the end. So I'm going to try to get to that point. Whilst I'm on the way to doing that, actually, let's just talk about how we move from each mode.",
      "lock 1 ball for multiball": "Video Transcription: - So, as we start off, you are in control of this grid. So if you flip the flipper, you can choose which one you want to play. So these are little modes. Now I don't, like I said, because it's such a new game, I don't know which ones are the ones where the most points are, but my objective is basically to get through all of the modes, because I know at the end of this, after doing all six of these modes, there's a special multiball at the end. So I'm going to try to get to that point. Whilst I'm on the way to doing that, actually, let's just talk about how we move from each mode.",
      "shoot the center spinner lane 3 times": "Video Transcription: - The other things that I'm going to be concentrating on are these targets here, one, two, three. Those three targets there are like your lock. So as you saw, I hit the one, two, three, and then this lock here, this green lock here, lit and this lock here lit. So then what you're doing then, you're trying to get the ball either there or there, and either there or there. And then that will lock the ball. So then it will say, 'Ball 1 locked', and then your objective is to do that three times in order to get the multiball.",
      "shoot either ramp 3 times": "Video Transcription: - Whilst I'm on the way to doing that, actually, let's just talk about how we move from each mode. So let's say I choose prime directive as my first mode, the way to do that is by pressing this button. And then the ball would fire. That would lock in this mode, and then what will happen is there will be a 30 second timer whilst you're playing out mode, and you have to make a series of shots, and you're playing out that mode. At the end of that mode, then what will happen is either this shot here, the mission start shot here, or the away team shot here will light.",
      "complete any mission": "Video Transcription: - Whilst I'm on the way to doing that, actually, let's just talk about how we move from each mode. So let's say I choose prime directive as my first mode, the way to do that is by pressing this button. And then the ball would fire. That would lock in this mode, and then what will happen is there will be a 30 second timer whilst you're playing out mode, and you have to make a series of shots, and you're playing out that mode. At the end of that mode, then what will happen is either this shot here, the mission start shot here, or the away team shot here will light.",
      "lock 2 balls toward multiball": "Video Transcription: - So, as we start off, you are in control of this grid. So if you flip the flipper, you can choose which one you want to play. So these are little modes. Now I don't, like I said, because it's such a new game, I don't know which ones are the ones where the most points are, but my objective is basically to get through all of the modes, because I know at the end of this, after doing all six of these modes, there's a special multiball at the end. So I'm going to try to get to that point. Whilst I'm on the way to doing that, actually, let's just talk about how we move from each mode.",
      "start any multiball": "Video Transcription: - So, as we start off, you are in control of this grid. So if you flip the flipper, you can choose which one you want to play. So these are little modes. Now I don't, like I said, because it's such a new game, I don't know which ones are the ones where the most points are, but my objective is basically to get through all of the modes, because I know at the end of this, after doing all six of these modes, there's a special multiball at the end. So I'm going to try to get to that point. The other things that I'm going to be concentrating on are these targets here, one, two, three.",
      "start vengeance multiball": "Video Transcription: - So, as we start off, you are in control of this grid. So if you flip the flipper, you can choose which one you want to play. So these are little modes. Now I don't, like I said, because it's such a new game, I don't know which ones are the ones where the most points are, but my objective is basically to get through all of the modes, because I know at the end of this, after doing all six of these modes, there's a special multiball at the end. So I'm going to try to get to that point. The other things that I'm going to be concentrating on are these targets here, one, two, three.",
      "start multiball and collect a jackpot": "Video Transcription: - So, as we start off, you are in control of this grid. So if you flip the flipper, you can choose which one you want to play. So these are little modes. Now I don't, like I said, because it's such a new game, I don't know which ones are the ones where the most points are, but my objective is basically to get through all of the modes, because I know at the end of this, after doing all six of these modes, there's a special multiball at the end. So I'm going to try to get to that point. The other things that I'm going to be concentrating on are these targets here, one, two, three.",
      "complete 2 missions in one game": "Video Transcription: - Okay, anyway. Now we go back to our missions. 2 million, not the best score. We'll go back to our missions. Again, you can see, this is a dangerous shot. But it's important. Right, okay. We're going to go in, there we go. So, you know, obviously, we couldn't do that in a competition, but for the demonstration of this video, it's worth doing. There we go. So now if we choose Prime Directive, then we've got another three in a row, it's going to roll in extra points. So that's worth doing, as well.",
      "collect 2 jackpots in one multiball": "Video Transcription: - So, as we start off, you are in control of this grid. So if you flip the flipper, you can choose which one you want to play. So these are little modes. Now I don't, like I said, because it's such a new game, I don't know which ones are the ones where the most points are, but my objective is basically to get through all of the modes, because I know at the end of this, after doing all six of these modes, there's a special multiball at the end. So I'm going to try to get to that point. The other things that I'm going to be concentrating on are these targets here, one, two, three.",
      "complete 3 missions in one game": "Video Transcription: - Okay, anyway. Now we go back to our missions. 2 million, not the best score. We'll go back to our missions. Again, you can see, this is a dangerous shot. But it's important. Right, okay. We're going to go in, there we go. So, you know, obviously, we couldn't do that in a competition, but for the demonstration of this video, it's worth doing. There we go. So now if we choose Prime Directive, then we've got another three in a row, it's going to roll in extra points. So that's worth doing, as well."
    },
    "tales of the arabian nights": {
      "hit the genie to start a tale mode": "Genie modes (the \"tales\") - Sinbad and the Rocs: the left orbit will send the ball to the bumpers. Hitting even a single bumper completes the mode. Ali Baba: any hit to the lower left standup targets or the targets behind the lamp scores a letter in SESAME. Spell Sesame to complete the mode. Flying Horse: one of the five Golden Symbols holds a prize. Hit the correct one to complete the mode.",
      "collect a jewel award": "Genie modes (the \"tales\") - Forty Thieves: shoot the ramp to complete the mode. A second ramp shot is needed to collect the jewel. Most modes can be completed rather easily and in just a couple shots. However, the reward for completing the mode- a jewel- is not given until the ramp is shot, and a new mode cannot be started until the jewel for the previous one is collected. Jewels can also be awarded from Make A Wish, explained later. Jewels score 100,000 points plus an additional 10,000 for each spin of the Lamp that has occurred since the last Jewel was collected.",
      "collect 1 tale and light lock": "Genie Multiball - Five hits to the Genie spells the word Genie, which lights locks. A ball can then be locked at either orbit. ) For the first multiball, one spelling of Genie lights both locks, but after that, Genie needs to be spelled for each lock. When two balls are locked, shoot the Genie again: his magnet will activate, pulling the ball under the table and starting 3-ball multiball. The first ball is kicked out from the Bazaar, and the other two are released from the lock lane near the Lamp. During multiball, Jackpots are pretty much the only available scoring feature.",
      "light lock at the genie": "Genie modes (the \"tales\") - Sinbad and the Rocs: the left orbit will send the ball to the bumpers. Hitting even a single bumper completes the mode. Ali Baba: any hit to the lower left standup targets or the targets behind the lamp scores a letter in SESAME. Spell Sesame to complete the mode. Flying Horse: one of the five Golden Symbols holds a prize. Hit the correct one to complete the mode.",
      "lock 2 balls and start multiball at the genie": "Genie Multiball - Five hits to the Genie spells the word Genie, which lights locks. A ball can then be locked at either orbit. ) For the first multiball, one spelling of Genie lights both locks, but after that, Genie needs to be spelled for each lock. When two balls are locked, shoot the Genie again: his magnet will activate, pulling the ball under the table and starting 3-ball multiball. The first ball is kicked out from the Bazaar, and the other two are released from the lock lane near the Lamp. During multiball, Jackpots are pretty much the only available scoring feature.",
      "collect a harem multiball jackpot": "Harem multiball can be started in two ways: - Shoot the left orbit when Harem is lit to spot a letter in Harem. Completing the word starts the multiball. This shot will only be lit for Harem if there's nothing else to score here (such as a mode shot, a lock, or a tiger loop). The pop bumpers could bounce the ball left into a secret saucer. This scores 250,000 points and a Harem Sneak-in. Doing this three times starts Harem multiball. Harem Multiball is a three-ball frenzy multiball where every switch in the game scores the Harem value."
    },
    "fathom": {
      "light and rip the spinner": "Spinner, center drop targets, and right standup target - The spinner is worth 500 points per spin. Hitting the right standup target at any time lights the spinner for 5,000 points per spin for the rest of the ball. If the center drop targets are completed in order of 1-2-3, the lit bonus (blue or green) will receive 5 advances, and the right standup target will be lit for extra ball for 6-10 seconds, depending on settings. In competition play, extra ball scores 25,000 points. In addition to the above features, the right standup and each center drop score 1 bonus advance of whichever colour is lit in front of them.",
      "collect spinner value 3 times": "Spinner, center drop targets, and right standup target - The spinner is worth 500 points per spin. Hitting the right standup target at any time lights the spinner for 5,000 points per spin for the rest of the ball. If the center drop targets are completed in order of 1-2-3, the lit bonus (blue or green) will receive 5 advances, and the right standup target will be lit for extra ball for 6-10 seconds, depending on settings. In competition play, extra ball scores 25,000 points. In addition to the above features, the right standup and each center drop score 1 bonus advance of whichever colour is lit in front of them.",
      "lock 1 ball in a saucer": "Lock lanes and multiball - If there is not a ball locked in one lane's saucer, the drop targets will be down. Shooting that saucer will lock a ball. If there is a ball locked in a saucer, the drop targets will be up. The front in line drop target scores 10,000 points, 1 bonus advance of its colour, and lights that colour's 3X bonus.",
      "light a second lock": "Lock lanes and multiball - If there is not a ball locked in one lane's saucer, the drop targets will be down. Shooting that saucer will lock a ball. If there is a ball locked in a saucer, the drop targets will be up. The front in line drop target scores 10,000 points, 1 bonus advance of its colour, and lights that colour's 3X bonus.",
      "start multiball": "Lock lanes and multiball - If there is not a ball locked in one lane's saucer, the drop targets will be down. Shooting that saucer will lock a ball. If there is a ball locked in a saucer, the drop targets will be up. The front in line drop target scores 10,000 points, 1 bonus advance of its colour, and lights that colour's 3X bonus.",
      "collect a multiball jackpot": "Lock lanes and multiball - If there is not a ball locked in one lane's saucer, the drop targets will be down. Shooting that saucer will lock a ball. If there is a ball locked in a saucer, the drop targets will be up. The front in line drop target scores 10,000 points, 1 bonus advance of its colour, and lights that colour's 3X bonus."
    },
    "hook": {
      "shoot the left ramp to start an objective": "Left ramp - The left ramp scores 250,000 points by default. On the standard game code, making the left ramp scores and advances the value. The order of values is 250,000 - 500,000 - 750,000 - 1,000,000 - 2,000,000 - 3,000,000. If about 15 seconds pass without the ramp being hit, the ramp value will decrease one stage, unless the value was maxed out at 3,000,000, in which case the entire value will just reset. On the updated fanmade code with rebalanced scoring, the ramp instead increases in value whenever a left drop target is hit, and the timer is based on how long it has been since that last drop target hit.",
      "hit the right ramp 3 times": "Right ramp - Three shots to the right ramp score AM, then PM, then Shoot Clocks. During Shoot Clocks, the lock shot and the right ramp are both worth 5,000,000 points for about 15 seconds, and you get 5,000,000 points with your end of ball bonus just for starting Shoot Clocks. On updated code, this works a bit differently; once Shoot Clocks starts, the first shot to the lock or right ramp is worth 8,000,000, subsequent shots are worth 3,000,000 more than the previous, and the extra scoring you get during the bonus is equal to the last Clocks value you collected (or 5,000,000 if there was none).",
      "start a mode lost boys jolly roger etc": "Skull shot and modes - There are six \"modes\"; that term is used loosely, as they're actually more like instant awards as seen with the Mirror in Funhouse or the Super Cellar Door in Whirlwind. To light a mode, shoot the skull shot in the center of the table. To start a mode, shoot the scoop in the lower right of the game that's in a similar position as the Swamp kickout on Addams Family. Any shot to this hole or to the skull gets spit out of this hole, pretty quickly. If you shoot the mode start hole when there is no mode ready (flashing), you receive a mystery score, which usually tends to be a multiple of 50,000 points between 250,000 and 500,000.",
      "complete 1 mode objective": "Skull shot and modes - There are six \"modes\"; that term is used loosely, as they're actually more like instant awards as seen with the Mirror in Funhouse or the Super Cellar Door in Whirlwind. To light a mode, shoot the skull shot in the center of the table. To start a mode, shoot the scoop in the lower right of the game that's in a similar position as the Swamp kickout on Addams Family. Any shot to this hole or to the skull gets spit out of this hole, pretty quickly. If you shoot the mode start hole when there is no mode ready (flashing), you receive a mystery score, which usually tends to be a multiple of 50,000 points between 250,000 and 500,000.",
      "start multiball": "Locks and Multiball - A ball will be fed to the plunger for up to two skill shot chances. If you miss the first skill shot, you are not given a second skill shot; 2-ball multiball begins. You must upgrade the multiball to 3 balls before the jackpots become available. To do this, relock one of the two balls in the lock shot, and then shoot either ramp with the other ball within 12 seconds of the relock. If you make the first skill shot but miss the second, standard 3-ball multiball begins.",
      "start multiball and collect a jackpot": "Locks and Multiball - A ball will be fed to the plunger for up to two skill shot chances. If you miss the first skill shot, you are not given a second skill shot; 2-ball multiball begins. You must upgrade the multiball to 3 balls before the jackpots become available. To do this, relock one of the two balls in the lock shot, and then shoot either ramp with the other ball within 12 seconds of the relock. If you make the first skill shot but miss the second, standard 3-ball multiball begins.",
      "lock 2 balls for multiball": "Locks and Multiball - A ball will be fed to the plunger for up to two skill shot chances. If you miss the first skill shot, you are not given a second skill shot; 2-ball multiball begins. You must upgrade the multiball to 3 balls before the jackpots become available. To do this, relock one of the two balls in the lock shot, and then shoot either ramp with the other ball within 12 seconds of the relock. If you make the first skill shot but miss the second, standard 3-ball multiball begins."
    },
    "congo": {
      "start any map mode objective": "Left ramp and Map awards - The left ramp collects letters in the word Map. Collecting the M or A will put the ball on the right flipper for another shot at the left ramp. Collecting the P will light the right saucer for a Map award, and put the ball on the left flipper for a shot at that award. If you collect the 3 map letters in a 3-way combo with no other switch hits in between, you receive a 20,000,000 point combo bonus. The Map awards are always given in the same order, and 27 different awards are well defined before the list resets; however, several are repeats of things earlier in the list, and it's very difficult to see more than about 10 Map awards in a game.",
      "start multiball": "Locks and multiball - Collect 4 Diamonds to light a lock. Locks can be made at the left orbit or the upper flipper shot that goes under the volcano. After making a lock, collect 4 more diamonds to light the next lock. Lock 3 balls, or defeat the second Gray Attack, to instantly start multiball. The jackpot value for multiball is 10,000,000 points plus an additional 500,000 for each diamond collected over the course of the game so far. Jackpots are available at the left and right ramps. You can also repeatedly score Super Jackpots worth double the regular jackpot value by shooting the Super Score lane from the upper flipper multiple times, each within 20 seconds of the previous one.",
      "advance 1 map destination": "Left ramp and Map awards - The left ramp collects letters in the word Map. Collecting the M or A will put the ball on the right flipper for another shot at the left ramp. Collecting the P will light the right saucer for a Map award, and put the ball on the left flipper for a shot at that award. If you collect the 3 map letters in a 3-way combo with no other switch hits in between, you receive a 20,000,000 point combo bonus. The Map awards are always given in the same order, and 27 different awards are well defined before the list resets; however, several are repeats of things earlier in the list, and it's very difficult to see more than about 10 Map awards in a game.",
      "complete gray attack": "Locks and multiball - Collect 4 Diamonds to light a lock. Locks can be made at the left orbit or the upper flipper shot that goes under the volcano. After making a lock, collect 4 more diamonds to light the next lock. Lock 3 balls, or defeat the second Gray Attack, to instantly start multiball. The jackpot value for multiball is 10,000,000 points plus an additional 500,000 for each diamond collected over the course of the game so far. Jackpots are available at the left and right ramps. You can also repeatedly score Super Jackpots worth double the regular jackpot value by shooting the Super Score lane from the upper flipper multiple times, each within 20 seconds of the previous one.",
      "collect a super jackpot in multiball": "Locks and multiball - Collect 4 Diamonds to light a lock. Locks can be made at the left orbit or the upper flipper shot that goes under the volcano. After making a lock, collect 4 more diamonds to light the next lock. Lock 3 balls, or defeat the second Gray Attack, to instantly start multiball. The jackpot value for multiball is 10,000,000 points plus an additional 500,000 for each diamond collected over the course of the game so far. Jackpots are available at the left and right ramps. You can also repeatedly score Super Jackpots worth double the regular jackpot value by shooting the Super Score lane from the upper flipper multiple times, each within 20 seconds of the previous one."
    },
    "mystery castle": {
      "start an item mode": "Item modes - Crystal Ball: lights the right ramp for extra ball. In competition/novelty play, the extra ball scores 10,000,000 points. Bell: pop bumpers score 1,000,000 points each for the rest of the ball. Potion: starts a hurry-up round. Three hurry-ups can be collected in total: the first two are at the Dungeon left orbit and the Catwalk right ramp, worth up to 9,000,000 points each, and the third is at the Bridge left ramp, worth up to 18,000,000 points.",
      "collect 1 item award": "Item modes - Crystal Ball: lights the right ramp for extra ball. In competition/novelty play, the extra ball scores 10,000,000 points. Bell: pop bumpers score 1,000,000 points each for the rest of the ball. Potion: starts a hurry-up round. Three hurry-ups can be collected in total: the first two are at the Dungeon left orbit and the Catwalk right ramp, worth up to 9,000,000 points each, and the third is at the Bridge left ramp, worth up to 18,000,000 points.",
      "complete a mode collect its shots": "Item modes - Potion: starts a hurry-up round. Three hurry-ups can be collected in total: the first two are at the Dungeon left orbit and the Catwalk right ramp, worth up to 9,000,000 points each, and the third is at the Bridge left ramp, worth up to 18,000,000 points. The display will only count down the remaining value 1,000,000 at a time, but the game keeps track of the time remaining more precisely than that, and when you collect each hurry-up, you'll usually receive the number shown on the display plus an extra few hundred thousand points.",
      "light a multiball lock": "Item modes - Jester: a 2-ball quick multiball where all 5 major shots are worth 5,000,000 points. Skull: scores 10,000,000 points and lights the Dungeon left orbit for Doom Mode. If you drain before starting Doom Mode, the chance to play it is lost. Doom Mode is a 2-ball multiball where all 5 major shots are lit for a jackpot worth 50,000,000 points. Collecting all 5 jackpots lights a moving super jackpot worth 200,000,000, and collecting that resets the regular jackpots. Also, from the start of Doom Mode until the end of that ball, all scoring and awarded extra balls are doubled.",
      "start multiball": "Item modes - Jester: a 2-ball quick multiball where all 5 major shots are worth 5,000,000 points. Skull: scores 10,000,000 points and lights the Dungeon left orbit for Doom Mode. If you drain before starting Doom Mode, the chance to play it is lost. Doom Mode is a 2-ball multiball where all 5 major shots are lit for a jackpot worth 50,000,000 points. Collecting all 5 jackpots lights a moving super jackpot worth 200,000,000, and collecting that resets the regular jackpots. Also, from the start of Doom Mode until the end of that ball, all scoring and awarded extra balls are doubled.",
      "complete 2 modes in one game": "Item modes - Crystal Ball: lights the right ramp for extra ball. In competition/novelty play, the extra ball scores 10,000,000 points. Bell: pop bumpers score 1,000,000 points each for the rest of the ball. Potion: starts a hurry-up round. Three hurry-ups can be collected in total: the first two are at the Dungeon left orbit and the Catwalk right ramp, worth up to 9,000,000 points each, and the third is at the Bridge left ramp, worth up to 18,000,000 points.",
      "start an item mode lit item shot": "Item modes - Crystal Ball: lights the right ramp for extra ball. In competition/novelty play, the extra ball scores 10,000,000 points. Bell: pop bumpers score 1,000,000 points each for the rest of the ball. Potion: starts a hurry-up round. Three hurry-ups can be collected in total: the first two are at the Dungeon left orbit and the Catwalk right ramp, worth up to 9,000,000 points each, and the third is at the Bridge left ramp, worth up to 18,000,000 points."
    },
    "the a team": {
      "start any main mission at the van": "SKILLSHOT - Hit first to start and open the door. Hit a second time to start the mission. Before starting the first character, the order for that player is drawn and will be maintained throughout the game. The missions will remain active until they are resolved even if the player loses the ball. The reward for solving each mission is 10 million points. MR LEE: If during an active main mission you put the ball in the van you will be one point closer to contacting Mr Lee and, therefore, hiring the A team.",
      "complete any mission objective": "SKILLSHOT - Hit first to start and open the door. Hit a second time to start the mission. Before starting the first character, the order for that player is drawn and will be maintained throughout the game. The missions will remain active until they are resolved even if the player loses the ball. The reward for solving each mission is 10 million points. MR LEE: If during an active main mission you put the ball in the van you will be one point closer to contacting Mr Lee and, therefore, hiring the A team.",
      "start tnt multiball": "GET MILLIONS - LITTLE MULTIBALL: Shoot the barrel Hole to activate a single multiball.",
      "collect a tnt multiball jackpot": "GET MILLIONS - LITTLE MULTIBALL: Shoot the barrel Hole to activate a single multiball."
    },
    "batman 66": {
      "start any major villain mode": "Major Villains, including Multiball and Villain Escape wizard mode - There are four Major Villains: Catwoman (white), Joker (red), Penguin (purple), and Riddler (green). Each major villain has two separate sets of mode rules you can play through. At the start of a ball if there is not currently a major villain mode running, can toggle between the two rulesets using the right flipper. You only need to defeat each major villain once to progress through the game, but there are different Mode Champion entries on the leaderboard for each variant of the mode rules.",
      "start any minor villain mode": "Minor villains and mini-wizard multiballs - Hit all three TV standup targets in the lower right of the game to light the left orbit for TV. Shooting the back right saucer via the orbit will let you start a Minor Villain mode, which makes other perks available. There are a total of 14 minor villain modes, but only 6 unique minor villains: minor villains always give the same rewards, but different modes featuring the same minor villain may have different shot progressions to complete them. Of the 14 minor villains, 3 are denoted as Season 1; 6 are denoted as Season 2; 5 are denoted as Season 3.",
      "collect a mystery award": "Mystery award - When lit, shoot the left orbit strong enough to get the ball to land in the saucer in the back right of the game for a Mystery award. Complete the lights on the four in/out lanes, which can be rotated with lane change, to light the orbit for a Mystery. Possible awards include Hold Bonus Multiplier, Light Shot Multipliers, More Time, Add a Ball in multiball, +1 Gadget, +2 Bonus Multiplier, 5,000,000 points, Increase Bat Phone Hurry-up, Light Locks, and Award Lock.",
      "qualify a major villain at the bat phone": "Major Villains, including Multiball and Villain Escape wizard mode - There are four Major Villains: Catwoman (white), Joker (red), Penguin (purple), and Riddler (green). Each major villain has two separate sets of mode rules you can play through. At the start of a ball if there is not currently a major villain mode running, can toggle between the two rulesets using the right flipper. You only need to defeat each major villain once to progress through the game, but there are different Mode Champion entries on the leaderboard for each variant of the mode rules.",
      "light one shot multiplier at commissioner gordon": "Scoring multipliers - Shot multipliers: Note the X's near the 5 stopping points of the Penguin crane. These correspond to the shots that they are roughly in line of: from left to right, they are the left ramp, the rotating toy, the center ramp, the scoop, and the right orbit. Hit the Commissioner Gordon target 3 times and all of the shot multipliers will blink together, indicating that a 2x multiplier will be given to the next shot you make out of those five. This shot multiplier affects all scoring earned from that shot and lasts until the end of the ball.",
      "complete any major villain phase": "Major Villains, including Multiball and Villain Escape wizard mode - There are four Major Villains: Catwoman (white), Joker (red), Penguin (purple), and Riddler (green). Each major villain has two separate sets of mode rules you can play through. At the start of a ball if there is not currently a major villain mode running, can toggle between the two rulesets using the right flipper. You only need to defeat each major villain once to progress through the game, but there are different Mode Champion entries on the leaderboard for each variant of the mode rules.",
      "complete any minor villain mode": "Minor villains and mini-wizard multiballs - Hit all three TV standup targets in the lower right of the game to light the left orbit for TV. Shooting the back right saucer via the orbit will let you start a Minor Villain mode, which makes other perks available. There are a total of 14 minor villain modes, but only 6 unique minor villains: minor villains always give the same rewards, but different modes featuring the same minor villain may have different shot progressions to complete them. Of the 14 minor villains, 3 are denoted as Season 1; 6 are denoted as Season 2; 5 are denoted as Season 3.",
      "start villain multiball": "Major Villains, including Multiball and Villain Escape wizard mode - There are four Major Villains: Catwoman (white), Joker (red), Penguin (purple), and Riddler (green). Each major villain has two separate sets of mode rules you can play through. At the start of a ball if there is not currently a major villain mode running, can toggle between the two rulesets using the right flipper. You only need to defeat each major villain once to progress through the game, but there are different Mode Champion entries on the leaderboard for each variant of the mode rules.",
      "complete any king tut mode": "Major Villains, including Multiball and Villain Escape wizard mode - There are four Major Villains: Catwoman (white), Joker (red), Penguin (purple), and Riddler (green). Each major villain has two separate sets of mode rules you can play through. At the start of a ball if there is not currently a major villain mode running, can toggle between the two rulesets using the right flipper. You only need to defeat each major villain once to progress through the game, but there are different Mode Champion entries on the leaderboard for each variant of the mode rules.",
      "collect a super jackpot from a major villain": "Major Villains, including Multiball and Villain Escape wizard mode - There are four Major Villains: Catwoman (white), Joker (red), Penguin (purple), and Riddler (green). Each major villain has two separate sets of mode rules you can play through. At the start of a ball if there is not currently a major villain mode running, can toggle between the two rulesets using the right flipper. You only need to defeat each major villain once to progress through the game, but there are different Mode Champion entries on the leaderboard for each variant of the mode rules.",
      "start villain escape wizard mode": "Major Villains, including Multiball and Villain Escape wizard mode - There are four Major Villains: Catwoman (white), Joker (red), Penguin (purple), and Riddler (green). Each major villain has two separate sets of mode rules you can play through. At the start of a ball if there is not currently a major villain mode running, can toggle between the two rulesets using the right flipper. You only need to defeat each major villain once to progress through the game, but there are different Mode Champion entries on the leaderboard for each variant of the mode rules.",
      "collect a super jackpot in villain multiball": "Major Villains, including Multiball and Villain Escape wizard mode - There are four Major Villains: Catwoman (white), Joker (red), Penguin (purple), and Riddler (green). Each major villain has two separate sets of mode rules you can play through. At the start of a ball if there is not currently a major villain mode running, can toggle between the two rulesets using the right flipper. You only need to defeat each major villain once to progress through the game, but there are different Mode Champion entries on the leaderboard for each variant of the mode rules.",
      "complete mr freeze": "Quick strategy synopsis - Shoot any major shot, then hit the Bat Phone at the rotating toy to start a major villain mode. Follow the lit shots to complete the mode. Major villains have multiple phases; when you complete a phase, you can either shoot the scoop and collect a super jackpot, or turn down the super jackpot and play the next phase with an increased multiplier on that mode's scoring. The TV targets in the lower right light the left orbit for a minor villain mode; complete these modes for big rewards, especially Mr.",
      "light all five shot multipliers": "Major Villains, including Multiball and Villain Escape wizard mode - To qualify a villain, shoot pretty much any shot in the game. Catwoman requires one shot to each ramp; Joker requires the \"villain vision\" targets at the rotating toy until the word Joker is spelled; Penguin requires shooting the scoop from below; and Riddler requires shooting either orbit. Once a villain is qualified, the rotating toy will move to the Bat Phone, and you must hit it as a hurry-up to start that mode. The base value for the Bat Phone hurry-up is 1,500,000 points, plus an additional 250,000 for each major villain you've already completed."
    },
    "hollywood heat": {
      "complete 1 2 3 top lanes": "Advancing bonus multiplier: top lanes and standup targets - Lane change can be used with the right flipper only to rotate the positions of the lit 1-2-3 top lanes. The 1-2-3 lanes also spot letters in the word Pinball: game settings determine whether any lit 1-2-3 top lanes awards a Pinball letter or if you need to complete the 1-2-3 top lanes to spot a Pinball letter instead.",
      "complete either drop target bank": "Drop targets and extra ball - Drop target completion values can be set to carry over from ball to ball. However, if extra balls are on, collecting an extra ball by any means resets the drop target values for your next turn. In multiball, completing either drop target bank increases the completion value for both banks, without the need to complete both banks once to increase the values instead.",
      "lock 1 ball toward multiball": "Drop targets and extra ball - Drop target completion values can be set to carry over from ball to ball. However, if extra balls are on, collecting an extra ball by any means resets the drop target values for your next turn. In multiball, completing either drop target bank increases the completion value for both banks, without the need to complete both banks once to increase the values instead.",
      "lock a second ball for multiball": "Drop targets and extra ball - Drop target completion values can be set to carry over from ball to ball. However, if extra balls are on, collecting an extra ball by any means resets the drop target values for your next turn. In multiball, completing either drop target bank increases the completion value for both banks, without the need to complete both banks once to increase the values instead."
    },
    "baywatch": {
      "relight laser kick kickback": "Bottom of the table - The left out lane has a kickback, called the Laser Kick. It is one time use and can be relit with the boogie board Laser Kick standup targets in the lower right of the game. It can also be upgraded into a Super Laser Kick, which does not unlight until the end of the current ball, with the 2nd Shark award.",
      "start a major shot mode": "Guard shots and modes - The 5 major shots in the game must be made in certain quantities to start modes. Make a shot 3 times to start a mode. As well, make all 5 shots once or twice each to start additional modes. The 7 modes are: CPR: start by shooting the Tower ramp three times. Make three ramps in the game (Tower, back, and right: NOT the side ramp) within 30 seconds. The three ramps score 50,000,000, then 60,000,000, then 70,000,000 points. Completing the mode with all 3 ramps is supposed to award a 50,000,000 bonus, but that bonus is not shown in the mode summary screen and doesn't seem to be added to the score.",
      "complete 3 lit shots in a major mode": "Guard shots and modes - The 5 major shots in the game must be made in certain quantities to start modes. Make a shot 3 times to start a mode. As well, make all 5 shots once or twice each to start additional modes. The 7 modes are: CPR: start by shooting the Tower ramp three times. Make three ramps in the game (Tower, back, and right: NOT the side ramp) within 30 seconds. The three ramps score 50,000,000, then 60,000,000, then 70,000,000 points. Completing the mode with all 3 ramps is supposed to award a 50,000,000 bonus, but that bonus is not shown in the mode summary screen and doesn't seem to be added to the score.",
      "start multiball": "Locks and multiball - Despite only requiring 3 locks, multiball on Baywatch always starts as a 5-ball affair. There are three phases: Level 1: Guard shots The 5 Guard shots are each lit for their own jackpot, and unlit when collected. Jackpots start at 30,000,000 points. The base value can be increased by 5,000,000 points with each completion of the center Light Lock drop targets, up to a base value of 90,000,000. When a jackpot is collected, the remaining jackpots will have their value doubled for about 5 seconds.",
      "start multiball and collect a jackpot": "Locks and multiball - Despite only requiring 3 locks, multiball on Baywatch always starts as a 5-ball affair. There are three phases: Level 1: Guard shots The 5 Guard shots are each lit for their own jackpot, and unlit when collected. Jackpots start at 30,000,000 points. The base value can be increased by 5,000,000 points with each completion of the center Light Lock drop targets, up to a base value of 90,000,000. When a jackpot is collected, the remaining jackpots will have their value doubled for about 5 seconds.",
      "collect a super jackpot": "Locks and multiball - Level 1: Guard shots The 5 Guard shots are each lit for their own jackpot, and unlit when collected. Jackpots start at 30,000,000 points. The base value can be increased by 5,000,000 points with each completion of the center Light Lock drop targets, up to a base value of 90,000,000. When a jackpot is collected, the remaining jackpots will have their value doubled for about 5 seconds. Collect all 5 jackpots to advance. Level 2: Shark Super Jackpot Shoot the left scoop to score a Super Jackpot and advance to level 3."
    },
    "star trek the next generation": {
      "shoot either ramp 3 times": "Command Decision hole and the rest of the right ramp - Every 6th right ramp lights Command Decision at the upper left scoop just above the side ramp. Shooting the ball into Command Decision when lit (and when no other mode is running) lets you choose with the flippers which mode to start. You can even pick a mode that you've already played to rerun it, if you want to (for example) get more points from another time through Q's Challenge or get another chance at the two artifacts in Search the Galaxy. Every 15 right ramps lights an extra ball at the Start Mission hole.",
      "complete 1 skill shot": "Skill shot - The DMD rotates between 5 skill shot options. The lit item will move every couple seconds, or you can force the cursor to move with the flippers. Shoot the gun launcher to collect the currently highlighted option. The five choices are: Start Mission: the ball will be launched into the back hole, and the currently flashing mode will start. If all 7 modes have been played, you can start Final Frontier wizard mode off the plunge with this option. Flipper Skill Shot: the ball will eventually be sent to the left flipper.",
      "advance warp factor to 5": "Warp Factor - At the start of each ball, you will be at Warp 1. The right in lane lights the left orbit/spinner shot for Advance Warp. If you have not yet achieved Warp 9 in the game so far, the side ramp is also a guaranteed Advance Warp. One of the Skill Shot options allows you to start at Warp 4 (or 2) as well. Each warp comes with its own award: Super Jets: 1,000,000 points per bumper for the rest of the ball. Spinner is lit: for 10x value for the rest of the ball, meaning a minimum of 100,000 per spin.",
      "complete a neutral zone award": "Neutral Zone side modes - Hit any Neutral Zone target 3 times, then shoot into the exposed Neutral Zone hole to start one of these modes. They're pretty forgettable and don't fold well into any strong strategy for this game, but here they are anyway: Romulan: a 40 second mode. Shoot the spinner, center ramp, or right ramp to cloak a ship and score 10,000,000 points. A cloaked ship (on the DMD) will uncloak after about 15 seconds. Cloak all three ships at the same time to score 30,000,000 points and end the mode. Hit the yellow standup targets in the lower right for Klingon Assistance, which blocks one of the ships for you.",
      "start borg multiball": "Borg Multiball - Light the lock by shooting the right orbit. Lock a ball at the right orbit or the side ramp when lock is lit. You can also light a lock or lock a ball with a skill shot choice. The third lock must be done at the right orbit specifically. Multiball starts by loading the left probe gun with a ball. You must shoot the ball into the Start Mission hole to increase the jackpot value by 10,000,000 points. After three such shots, or if you miss on any of them, two other balls get kicked out and multiball begins."
    },
    "meteor": {
      "light and rip the spinner": "METEOR letters and spinner - The M and R targets score 6,000 when hit and add 600 points/spin to the spinner value. The E, T, E, and O targets score 2,000 when hit and add 200 points/spin to the spinner value. Completing the bank resets the spinner value to its base of 200/spin and advances the bonus multiplier. Bonus multiplier carries over to the next ball if it is at 5X or less, but resets for the next ball if advanced to 6X or 7X (max).",
      "complete both inline target banks once": "1-2-3 targets and bonus - Hitting any numbered drop target will advance the corresponding bonus, and then score whatever that current bonus is at. The maximum for each bonus is 7,000 points. If the 1 or 3 bonus is empty, the small yellow passive bumpers that read Advance 1 When Lit and Advance 3 When Lit or be turned off, and hitting one is only worth 500 points. However, if the 1 or the 3 bonus is at least 1,000, hitting the corresponding bumper will advance and score a bonus just like a drop target (though it will not actually spot one of the drop targets).",
      "complete 1 bank of targets": "1-2-3 targets and bonus - There are 3 bonuses in this game, fittingly labelled 1, 2, and 3. These bonuses start out empty, at 0 points. Hitting any numbered drop target will advance the corresponding bonus, and then score whatever that current bonus is at. The maximum for each bonus is 7,000 points. If the 1 or 3 bonus is empty, the small yellow passive bumpers that read Advance 1 When Lit and Advance 3 When Lit or be turned off, and hitting one is only worth 500 points. However, if the 1 or the 3 bonus is at least 1,000, hitting the corresponding bumper will advance and score a bonus just like a drop target (though it will not actually spot one of the drop targets).",
      "light special or extra ball": "1-2-3 targets and bonus - End of ball bonus is equal to the sum of the three bonuses times the bonus X. Maximum bonus = (7,000 + 7,000 + 7,000) x7 = 147,000. Not awful, but just focus on the spinner instead. A lit outlane will score the sum of the three bonuses (unmultiplied) before the actual end of ball bonus countdown begins. A Special can be lit in the same places as the WOW mentioned in this section. I've never done it myself nor have I seen it done, and I honestly don't know what triggers it. If I had to guess, it would light if all 3 bonuses are maxed out at 7,000 each AND the bonus multiplier is maxed out at 7X.",
      "reach 4x bonus multiplier": "1-2-3 targets and bonus - There are 3 bonuses in this game, fittingly labelled 1, 2, and 3. These bonuses start out empty, at 0 points. Hitting any numbered drop target will advance the corresponding bonus, and then score whatever that current bonus is at. The maximum for each bonus is 7,000 points. If the 1 or 3 bonus is empty, the small yellow passive bumpers that read Advance 1 When Lit and Advance 3 When Lit or be turned off, and hitting one is only worth 500 points. However, if the 1 or the 3 bonus is at least 1,000, hitting the corresponding bumper will advance and score a bonus just like a drop target (though it will not actually spot one of the drop targets).",
      "reach 5x bonus multiplier": "1-2-3 targets and bonus - There are 3 bonuses in this game, fittingly labelled 1, 2, and 3. These bonuses start out empty, at 0 points. Hitting any numbered drop target will advance the corresponding bonus, and then score whatever that current bonus is at. The maximum for each bonus is 7,000 points. If the 1 or 3 bonus is empty, the small yellow passive bumpers that read Advance 1 When Lit and Advance 3 When Lit or be turned off, and hitting one is only worth 500 points. However, if the 1 or the 3 bonus is at least 1,000, hitting the corresponding bumper will advance and score a bonus just like a drop target (though it will not actually spot one of the drop targets)."
    },
    "harlem globetrotters": {
      "complete inlane drop targets for 5x bonus": "In line drops and saucer - Each individual drop target scores 5,000 points and spots the next letter in G-L-O-B-E. The second, third, and fourth drop targets also light 2X, 3X, and 5X bonus, respectively. When all drop targets are down, the saucer behind them will be lit for 25,000; collecting that will light the saucer for a special, or 50,000 in competition play. A setting in the game determines whether the in line drop targets reset when the saucer award is collected, or only at the end of the ball. If they don't reset mid ball, whack the ball into this saucer repeatedly from either left flipper for big value.",
      "make 3 clean orbit spinner feeds": "Left spinner - Is worth a measly 10 points per spin at the beginning of the ball. Each in line drop target knocked down increases its value for the rest of the ball, to 100, then 200, then 1,000, and finally 2,000 points per spin. When this spinner is lit for maximum value, nothing comes close to being as valuable as a shot, it should be top priority for any ball on the right flipper.",
      "light 5x bonus twice": "Bonus - Bonus is a huge part of Harlem Globetrotters. Take special care not to tilt. The right in lane and top saucer award 3 bonus advance; in line drop targets and 5 spins of the lit center spinner award 1 bonus advance. The game can be set to have a Super Bonus. If the bonus count ever reaches 20, 30, or 40, that number acts as a checkpoint, and all future balls will start with that amount of bonus. Whether or not this is active depends on machine settings; recommended settings in the game's manual list this feature as on for 3 ball play and off for 5 ball play.",
      "light the spinner to 2 000 and rip it": "Left spinner - Is worth a measly 10 points per spin at the beginning of the ball. Each in line drop target knocked down increases its value for the rest of the ball, to 100, then 200, then 1,000, and finally 2,000 points per spin. When this spinner is lit for maximum value, nothing comes close to being as valuable as a shot, it should be top priority for any ball on the right flipper.",
      "collect a lit special award": "Bonus - Bonus is a huge part of Harlem Globetrotters. Take special care not to tilt. The right in lane and top saucer award 3 bonus advance; in line drop targets and 5 spins of the lit center spinner award 1 bonus advance. The game can be set to have a Super Bonus. If the bonus count ever reaches 20, 30, or 40, that number acts as a checkpoint, and all future balls will start with that amount of bonus. Whether or not this is active depends on machine settings; recommended settings in the game's manual list this feature as on for 3 ball play and off for 5 ball play."
    },
    "dolly parton": {
      "clear inline drop targets": "Inline drop targets - The first drop target scores 200 points and lights the spinner. The second scores 400 points and 2x bonus. The third scores 600 points and 3x bonus. The fourth scores 800 points and 5x bonus. Each drop target also spots a letter in Parton. Clearing these 4 drop targets should always be first priority on any ball. The target at the back of the inline drops lane scores extra ball the first time, special the second time, and 20,000 points each time thereafter. The lane is pretty narrow, so only shoot for these awards if you're very confident in your shooting and if the feed from a missed shot is saveable.",
      "rip the spinner 5 times while lit": "Right spinner - Scores 100 points per spin, or 1,000 when lit. Spinner is lit for the remainder of the ball by hitting the first of the inline drop targets.",
      "light the spinner and score spinner rips": "Right spinner - Scores 100 points per spin, or 1,000 when lit. Spinner is lit for the remainder of the ball by hitting the first of the inline drop targets.",
      "complete one dolly lane set": "Settings and miscellanea - The top saucer and in lanes can be lit for 5,000 to begin with, rather than needing to complete Parton once for the saucer and Dolly Parton once for the in lanes. The out lane special from Dolly Parton completions can be on both out lanes or just the left out lane. The inline drop targets can be set to not spot Parton letters.",
      "complete dolly parton once": "Bonus and bonus multiplier - Each letter in Dolly Parton scores 2,000 points in bonus. Spelling Dolly lights the upper left standups for 1,000 points. Spelling Parton lights the top saucer for 5,000 points. Any completion of Dolly Parton unlights all letters to be collected again. The first completion of Dolly Parton lights the 22,000 super bonus and also lights the in lanes for 5,000 points. The second completion of Dolly Parton lights the 44,000 super bonus and lights both out lanes for a special. Completing Dolly Parton a third time decreases the bonus back from 64,000 to 44,000 and awards a special instead.",
      "complete dolly parton twice": "Bonus and bonus multiplier - Each letter in Dolly Parton scores 2,000 points in bonus. Spelling Dolly lights the upper left standups for 1,000 points. Spelling Parton lights the top saucer for 5,000 points. Any completion of Dolly Parton unlights all letters to be collected again. The first completion of Dolly Parton lights the 22,000 super bonus and also lights the in lanes for 5,000 points. The second completion of Dolly Parton lights the 44,000 super bonus and lights both out lanes for a special. Completing Dolly Parton a third time decreases the bonus back from 64,000 to 44,000 and awards a special instead."
    },
    "paragon": {
      "collect a bonus build at a drop target": "Right side drop targets - Completing the 3-bank scores and advances the lit value, as well as advancing the value of the waterfall lane behind the drops. Progress on the drop target award itself is carried from ball to ball. Awards are 10,000-15,000-20,000-25,000-special.",
      "collect 2 saucer awards": "In line drops and back saucer - Each target scores 1,000 points and a bonus advance. The third target in the sequence awards 2X bonus, and the last target awards 3X. After the in lines, the back saucer is available. The first visit to this saucer awards 5X bonus; the second awards an extra ball; the third and on award a special. Landing in this saucer also resets the in line targets on every collect starting with the second (the EB). It's possible to backhand these targets from the lower left flipper, by making a very quick flip just to get the ball rocking a little bit, then quickly doing a full flip and immediately letting go when the ball is halfway or more up the lower left flipper.",
      "light and collect a saucer award": "In line drops and back saucer - Each target scores 1,000 points and a bonus advance. The third target in the sequence awards 2X bonus, and the last target awards 3X. After the in lines, the back saucer is available. The first visit to this saucer awards 5X bonus; the second awards an extra ball; the third and on award a special. Landing in this saucer also resets the in line targets on every collect starting with the second (the EB). It's possible to backhand these targets from the lower left flipper, by making a very quick flip just to get the ball rocking a little bit, then quickly doing a full flip and immediately letting go when the ball is halfway or more up the lower left flipper.",
      "complete either drop target bank twice": "Right side drop targets - Completing the 3-bank scores and advances the lit value, as well as advancing the value of the waterfall lane behind the drops. Progress on the drop target award itself is carried from ball to ball. Awards are 10,000-15,000-20,000-25,000-special.",
      "reach a high bonus and collect end of ball bonus": "Bonus and bonus multiplier - Bonus is advanced at the top star rollover, Paragon saucer, Golden Cliffs saucer (when value is maxed at 20,000 only), spinner (every 5 hits), in line drop targets, and Advance Bonus targets. When the bonus reaches 20, 30, or 40, it is locked in as a Super Bonus to be carried for the rest of the game. Otherwise, bonus is not held from ball to ball. Bonus multiplier is advanced as described in the \"In line drops and back saucer\" section. Maximum bonus is 5x 49,000 = 245,000 points. Bonus is enough of a big deal for scoring in this game that collecting bonus multipliers should always be the first priority on a ball.",
      "collect a huge end of ball bonus": "Bonus and bonus multiplier - Bonus is advanced at the top star rollover, Paragon saucer, Golden Cliffs saucer (when value is maxed at 20,000 only), spinner (every 5 hits), in line drop targets, and Advance Bonus targets. When the bonus reaches 20, 30, or 40, it is locked in as a Super Bonus to be carried for the rest of the game. Otherwise, bonus is not held from ball to ball. Bonus multiplier is advanced as described in the \"In line drops and back saucer\" section. Maximum bonus is 5x 49,000 = 245,000 points. Bonus is enough of a big deal for scoring in this game that collecting bonus multipliers should always be the first priority on a ball."
    },
    "robocop": {
      "complete green yellow red targets": "Green, yellow, red- including Target Practice and locks and multiball - Many of the game's features revolve around the green, yellow, and red targets- 4 green standups on the left, 3 yellow standups in the center, and 1 hit to the captive ball in the lower right of the game. Hit a flashing target to light it. Targets score 5,000 points whether lit, flashing, or unlit. Complete a bank to qualify one of the three criminals. Qualifying the red criminal requires just one hit to the captive ball in the lower right. The top lanes, from left to right, spot one green target, one yellow target, or one captive ball hit.",
      "complete one target bank cycle": "Green, yellow, red- including Target Practice and locks and multiball - Many of the game's features revolve around the green, yellow, and red targets- 4 green standups on the left, 3 yellow standups in the center, and 1 hit to the captive ball in the lower right of the game. Hit a flashing target to light it. Targets score 5,000 points whether lit, flashing, or unlit. Complete a bank to qualify one of the three criminals. Qualifying the red criminal requires just one hit to the captive ball in the lower right. The top lanes, from left to right, spot one green target, one yellow target, or one captive ball hit.",
      "shoot the center ramp 3 times": "Green, yellow, red- including Target Practice and locks and multiball - Many of the game's features revolve around the green, yellow, and red targets- 4 green standups on the left, 3 yellow standups in the center, and 1 hit to the captive ball in the lower right of the game. Hit a flashing target to light it. Targets score 5,000 points whether lit, flashing, or unlit. Complete a bank to qualify one of the three criminals. Qualifying the red criminal requires just one hit to the captive ball in the lower right. The top lanes, from left to right, spot one green target, one yellow target, or one captive ball hit.",
      "collect a lit target bank award": "Green, yellow, red- including Target Practice and locks and multiball - Many of the game's features revolve around the green, yellow, and red targets- 4 green standups on the left, 3 yellow standups in the center, and 1 hit to the captive ball in the lower right of the game. Hit a flashing target to light it. Targets score 5,000 points whether lit, flashing, or unlit. Complete a bank to qualify one of the three criminals. Qualifying the red criminal requires just one hit to the captive ball in the lower right. The top lanes, from left to right, spot one green target, one yellow target, or one captive ball hit.",
      "light multiball": "Green, yellow, red- including Target Practice and locks and multiball - Many of the game's features revolve around the green, yellow, and red targets- 4 green standups on the left, 3 yellow standups in the center, and 1 hit to the captive ball in the lower right of the game. Hit a flashing target to light it. Targets score 5,000 points whether lit, flashing, or unlit. Complete a bank to qualify one of the three criminals. Qualifying the red criminal requires just one hit to the captive ball in the lower right. The top lanes, from left to right, spot one green target, one yellow target, or one captive ball hit.",
      "lock 1 ball for multiball": "Green, yellow, red- including Target Practice and locks and multiball - Many of the game's features revolve around the green, yellow, and red targets- 4 green standups on the left, 3 yellow standups in the center, and 1 hit to the captive ball in the lower right of the game. Hit a flashing target to light it. Targets score 5,000 points whether lit, flashing, or unlit. Complete a bank to qualify one of the three criminals. Qualifying the red criminal requires just one hit to the captive ball in the lower right. The top lanes, from left to right, spot one green target, one yellow target, or one captive ball hit.",
      "start multiball": "Green, yellow, red- including Target Practice and locks and multiball - Many of the game's features revolve around the green, yellow, and red targets- 4 green standups on the left, 3 yellow standups in the center, and 1 hit to the captive ball in the lower right of the game. Hit a flashing target to light it. Targets score 5,000 points whether lit, flashing, or unlit. Complete a bank to qualify one of the three criminals. Qualifying the red criminal requires just one hit to the captive ball in the lower right. The top lanes, from left to right, spot one green target, one yellow target, or one captive ball hit.",
      "complete two target bank cycles": "Green, yellow, red- including Target Practice and locks and multiball - Many of the game's features revolve around the green, yellow, and red targets- 4 green standups on the left, 3 yellow standups in the center, and 1 hit to the captive ball in the lower right of the game. Hit a flashing target to light it. Targets score 5,000 points whether lit, flashing, or unlit. Complete a bank to qualify one of the three criminals. Qualifying the red criminal requires just one hit to the captive ball in the lower right. The top lanes, from left to right, spot one green target, one yellow target, or one captive ball hit.",
      "collect a jackpot in multiball": "Green, yellow, red- including Target Practice and locks and multiball - Many of the game's features revolve around the green, yellow, and red targets- 4 green standups on the left, 3 yellow standups in the center, and 1 hit to the captive ball in the lower right of the game. Hit a flashing target to light it. Targets score 5,000 points whether lit, flashing, or unlit. Complete a bank to qualify one of the three criminals. Qualifying the red criminal requires just one hit to the captive ball in the lower right. The top lanes, from left to right, spot one green target, one yellow target, or one captive ball hit.",
      "score 500 000+ from target bank awards": "Green, yellow, red- including Target Practice and locks and multiball - Many of the game's features revolve around the green, yellow, and red targets- 4 green standups on the left, 3 yellow standups in the center, and 1 hit to the captive ball in the lower right of the game. Hit a flashing target to light it. Targets score 5,000 points whether lit, flashing, or unlit. Complete a bank to qualify one of the three criminals. Qualifying the red criminal requires just one hit to the captive ball in the lower right. The top lanes, from left to right, spot one green target, one yellow target, or one captive ball hit.",
      "collect 2 multiball jackpots": "Green, yellow, red- including Target Practice and locks and multiball - Many of the game's features revolve around the green, yellow, and red targets- 4 green standups on the left, 3 yellow standups in the center, and 1 hit to the captive ball in the lower right of the game. Hit a flashing target to light it. Targets score 5,000 points whether lit, flashing, or unlit. Complete a bank to qualify one of the three criminals. Qualifying the red criminal requires just one hit to the captive ball in the lower right. The top lanes, from left to right, spot one green target, one yellow target, or one captive ball hit.",
      "collect a 1 000 000+ jackpot": "Green, yellow, red- including Target Practice and locks and multiball - Many of the game's features revolve around the green, yellow, and red targets- 4 green standups on the left, 3 yellow standups in the center, and 1 hit to the captive ball in the lower right of the game. Hit a flashing target to light it. Targets score 5,000 points whether lit, flashing, or unlit. Complete a bank to qualify one of the three criminals. Qualifying the red criminal requires just one hit to the captive ball in the lower right. The top lanes, from left to right, spot one green target, one yellow target, or one captive ball hit.",
      "complete three target bank cycles": "Green, yellow, red- including Target Practice and locks and multiball - Many of the game's features revolve around the green, yellow, and red targets- 4 green standups on the left, 3 yellow standups in the center, and 1 hit to the captive ball in the lower right of the game. Hit a flashing target to light it. Targets score 5,000 points whether lit, flashing, or unlit. Complete a bank to qualify one of the three criminals. Qualifying the red criminal requires just one hit to the captive ball in the lower right. The top lanes, from left to right, spot one green target, one yellow target, or one captive ball hit.",
      "start multiball twice in one game": "Green, yellow, red- including Target Practice and locks and multiball - Many of the game's features revolve around the green, yellow, and red targets- 4 green standups on the left, 3 yellow standups in the center, and 1 hit to the captive ball in the lower right of the game. Hit a flashing target to light it. Targets score 5,000 points whether lit, flashing, or unlit. Complete a bank to qualify one of the three criminals. Qualifying the red criminal requires just one hit to the captive ball in the lower right. The top lanes, from left to right, spot one green target, one yellow target, or one captive ball hit.",
      "score 1 000 000+ from target bank awards": "Green, yellow, red- including Target Practice and locks and multiball - Many of the game's features revolve around the green, yellow, and red targets- 4 green standups on the left, 3 yellow standups in the center, and 1 hit to the captive ball in the lower right of the game. Hit a flashing target to light it. Targets score 5,000 points whether lit, flashing, or unlit. Complete a bank to qualify one of the three criminals. Qualifying the red criminal requires just one hit to the captive ball in the lower right. The top lanes, from left to right, spot one green target, one yellow target, or one captive ball hit."
    },
    "grand lizard": {
      "start multiball lock balls": "Settings and miscellanea - In competition/novelty play, specials score 100,000 points. Extra balls are either on or off and cannot be set to a point value. Balls locked for multiball are ALWAYS able to be stolen by other players. Bonus multipliers can be set to carry over from ball to ball. However, even if this setting is on, a 10x bonus multiplier will be cleared between balls.",
      "complete 1 upper playfield lane set": "Settings and miscellanea - In competition/novelty play, specials score 100,000 points. Extra balls are either on or off and cannot be set to a point value. The time limit before the 3-bank and 4-bank of drop targets reset after the first target has been knocked down can be set to between 1 and 9 seconds. The time limit where the mystery award is lit on a ramp after going through an in lane can be set to between 1 and 10 seconds."
    },
    "jokerz": {
      "complete a drop target bank": "Drop targets - All three banks of drop targets follow the same rules. Hitting any target down scores 5,000 points and a bonus advance. Target banks reset immediately once cleared, and there is no point bonus for clearing a bank. When a bank is completed, the white light in front of that bank will turn on. Complete all 3 banks to light all 3 lights and Million Round will instantly begin. During Million Round, the lights in front of all three banks will flash for 12 seconds. Completing any of the three banks during this time limit scores 1,000,000 points.",
      "complete both easy drop banks once": "Drop targets - All three banks of drop targets follow the same rules. Hitting any target down scores 5,000 points and a bonus advance. Target banks reset immediately once cleared, and there is no point bonus for clearing a bank. When a bank is completed, the white light in front of that bank will turn on. Complete all 3 banks to light all 3 lights and Million Round will instantly begin. During Million Round, the lights in front of all three banks will flash for 12 seconds. Completing any of the three banks during this time limit scores 1,000,000 points.",
      "start multiball": "Center ramp: locks and multiball - At the start of the game, the center ramp is down. Hit the center standup target to score 10,000 points and 3 bonus advances, plus raise the ramp. Return feeds from this target are very fast and often send the ball into the center drain from a direct hit or an out lane from a glancing blow, but it is slightly safer to shoot it with the right flipper than the left. When the center ramp is up, shoot it to score 20,000 points and lock a ball. Locking two balls starts multiball. Lock stealing is possible in a multiplayer game.",
      "start multiball and collect a jackpot": "Center ramp: locks and multiball - At the start of the game, the center ramp is down. Hit the center standup target to score 10,000 points and 3 bonus advances, plus raise the ramp. Return feeds from this target are very fast and often send the ball into the center drain from a direct hit or an out lane from a glancing blow, but it is slightly safer to shoot it with the right flipper than the left. When the center ramp is up, shoot it to score 20,000 points and lock a ball. Locking two balls starts multiball. Lock stealing is possible in a multiplayer game.",
      "collect 2 jackpots in multiball": "Center ramp: locks and multiball - At the start of the game, the center ramp is down. Hit the center standup target to score 10,000 points and 3 bonus advances, plus raise the ramp. Return feeds from this target are very fast and often send the ball into the center drain from a direct hit or an out lane from a glancing blow, but it is slightly safer to shoot it with the right flipper than the left. When the center ramp is up, shoot it to score 20,000 points and lock a ball. Locking two balls starts multiball. Lock stealing is possible in a multiplayer game."
    },
    "bad cats": {
      "make 1 left ramp shot": "Left (tiger) ramp - The Tiger Ramp is typically always on, but if it is turned off via something in the game settings, competing the 5-bank of drop targets lights it. This ramp feeds the right in lane. Looping this ramp awards 50,000 - 100,000 - 200,000 - unlimited millions. There isn't technically a time limit on this ramp, so if the feed comes to a trap on the right flipper, take your time to aim the shot: the value of this ramp is only reset by hitting another switch in the game (except for in lanes or slingshots).",
      "make 3 left ramp shots": "Left (tiger) ramp - The Tiger Ramp is typically always on, but if it is turned off via something in the game settings, competing the 5-bank of drop targets lights it. This ramp feeds the right in lane. Looping this ramp awards 50,000 - 100,000 - 200,000 - unlimited millions. There isn't technically a time limit on this ramp, so if the feed comes to a trap on the right flipper, take your time to aim the shot: the value of this ramp is only reset by hitting another switch in the game (except for in lanes or slingshots).",
      "complete either drop target bank birds or milk": "Center (Fishbowl) ramp - By default, the center ramp is lit at the start of each ball. If it is not lit, light it by completing the 3-bank of drop targets. Consecutive shots to the ramp score 30,000 - 50,000 - 100,000 - extra ball. If more than about 5 seconds pass between ramp hits, it will reset to being worth 30,000. Only one extra ball per ball in play can be collected here; the extra ball award will simply be skipped subsequent times. Once an extra ball has been collected from this ramp, it will no longer be lit at the beginning of future balls.",
      "light jackpot 7 bank completions and collect it at the center ramp": "Center (Fishbowl) ramp - By default, the center ramp is lit at the start of each ball. If it is not lit, light it by completing the 3-bank of drop targets. Consecutive shots to the ramp score 30,000 - 50,000 - 100,000 - extra ball. If more than about 5 seconds pass between ramp hits, it will reset to being worth 30,000. Only one extra ball per ball in play can be collected here; the extra ball award will simply be skipped subsequent times. Once an extra ball has been collected from this ramp, it will no longer be lit at the beginning of future balls.",
      "light jackpot and complete center ramp twice": "Center (Fishbowl) ramp - By default, the center ramp is lit at the start of each ball. If it is not lit, light it by completing the 3-bank of drop targets. Consecutive shots to the ramp score 30,000 - 50,000 - 100,000 - extra ball. If more than about 5 seconds pass between ramp hits, it will reset to being worth 30,000. Only one extra ball per ball in play can be collected here; the extra ball award will simply be skipped subsequent times. Once an extra ball has been collected from this ramp, it will no longer be lit at the beginning of future balls."
    },
    "taxi": {
      "pick up 1 passenger": "Jackpot and passengers - For the first jackpot, Gorbie and Pinbot are lit to start, and picking up a lit passenger lights the next in the order Drac, Lola/Marilyn, Santa. There will always be two passengers lit at a time until the first jackpot is collected. When the 5th passenger is collected, jackpot is immediately lit at the Gorbie shot for about 15 seconds. If the jackpot is not collected, Lola/Marilyn will need to be picked up again for another shot at the jackpot. Once the first jackpot is collected, only one passenger will be lit at a time, and the order of passengers will be Santa - Pinbot - Drac - Lola/Marilyn - Gorbie.",
      "pick up 2 passengers": "Jackpot and passengers - For the first jackpot, Gorbie and Pinbot are lit to start, and picking up a lit passenger lights the next in the order Drac, Lola/Marilyn, Santa. There will always be two passengers lit at a time until the first jackpot is collected. When the 5th passenger is collected, jackpot is immediately lit at the Gorbie shot for about 15 seconds. If the jackpot is not collected, Lola/Marilyn will need to be picked up again for another shot at the jackpot. Once the first jackpot is collected, only one passenger will be lit at a time, and the order of passengers will be Santa - Pinbot - Drac - Lola/Marilyn - Gorbie.",
      "light and lock 1 ball at the scoop": "shoot the lock shot on the right; - The only multiball-exclusive scoring feature is the Express Lane. First, lock a ball in Express Lane 1 on the right, then within about 15 seconds, lock the other ball in Express Lane 2 (the Drac shot) on the left. Doing so scores 300,000 points immediately and makes it so all ramps for the rest of multiball are worth 100,000 each. There's no reason not to go for this, so make it first priority in multiball. Passengers and the jackpot can still be collected during multiball, but if you're not confident you can collect the jackpot on the current multiball, leave Drac behind at the left scoop.",
      "start multiball": "shoot the lock shot on the right; - The only multiball-exclusive scoring feature is the Express Lane. First, lock a ball in Express Lane 1 on the right, then within about 15 seconds, lock the other ball in Express Lane 2 (the Drac shot) on the left. Doing so scores 300,000 points immediately and makes it so all ramps for the rest of multiball are worth 100,000 each. There's no reason not to go for this, so make it first priority in multiball. Passengers and the jackpot can still be collected during multiball, but if you're not confident you can collect the jackpot on the current multiball, leave Drac behind at the left scoop.",
      "start multiball and collect a jackpot": "Jackpot and passengers - For the first jackpot, Gorbie and Pinbot are lit to start, and picking up a lit passenger lights the next in the order Drac, Lola/Marilyn, Santa. There will always be two passengers lit at a time until the first jackpot is collected. When the 5th passenger is collected, jackpot is immediately lit at the Gorbie shot for about 15 seconds. If the jackpot is not collected, Lola/Marilyn will need to be picked up again for another shot at the jackpot. Once the first jackpot is collected, only one passenger will be lit at a time, and the order of passengers will be Santa - Pinbot - Drac - Lola/Marilyn - Gorbie.",
      "collect a super jackpot in multiball": "Jackpot and passengers - For the first jackpot, Gorbie and Pinbot are lit to start, and picking up a lit passenger lights the next in the order Drac, Lola/Marilyn, Santa. There will always be two passengers lit at a time until the first jackpot is collected. When the 5th passenger is collected, jackpot is immediately lit at the Gorbie shot for about 15 seconds. If the jackpot is not collected, Lola/Marilyn will need to be picked up again for another shot at the jackpot. Once the first jackpot is collected, only one passenger will be lit at a time, and the order of passengers will be Santa - Pinbot - Drac - Lola/Marilyn - Gorbie.",
      "pick up 3 passengers": "Jackpot and passengers - For the first jackpot, Gorbie and Pinbot are lit to start, and picking up a lit passenger lights the next in the order Drac, Lola/Marilyn, Santa. There will always be two passengers lit at a time until the first jackpot is collected. When the 5th passenger is collected, jackpot is immediately lit at the Gorbie shot for about 15 seconds. If the jackpot is not collected, Lola/Marilyn will need to be picked up again for another shot at the jackpot. Once the first jackpot is collected, only one passenger will be lit at a time, and the order of passengers will be Santa - Pinbot - Drac - Lola/Marilyn - Gorbie."
    },
    "bride of pinbot": {
      "complete a face part eyes ears etc": "Left ramp - If the space shuttle is lit, the left ramp sends the ball into the PinBot Board in the top right of the game. When the ball enters the PinBot Board, the score award is 100,000 the 1st and 4th time, 200,000 the 2nd and 5th time, and 300,000 the 3rd and 6th time. The 7th entrance to the PinBot Board scores 600,000 points and lights an extra ball on one of the in/out lanes. The shuttle is typically lit immediately before activating the Bride's Voice and immediately before the first Optical Link. Even if the shuttle is lit, a slightly weaker than full ramp shot can still fall into the Face structure and advance the Bride's face.",
      "complete 2 face parts": "Left ramp - If the space shuttle is lit, the left ramp sends the ball into the PinBot Board in the top right of the game. When the ball enters the PinBot Board, the score award is 100,000 the 1st and 4th time, 200,000 the 2nd and 5th time, and 300,000 the 3rd and 6th time. The 7th entrance to the PinBot Board scores 600,000 points and lights an extra ball on one of the in/out lanes. The shuttle is typically lit immediately before activating the Bride's Voice and immediately before the first Optical Link. Even if the shuttle is lit, a slightly weaker than full ramp shot can still fall into the Face structure and advance the Bride's face.",
      "complete the bride finish metamorphosis": "Left ramp - If the space shuttle is lit, the left ramp sends the ball into the PinBot Board in the top right of the game. When the ball enters the PinBot Board, the score award is 100,000 the 1st and 4th time, 200,000 the 2nd and 5th time, and 300,000 the 3rd and 6th time. The 7th entrance to the PinBot Board scores 600,000 points and lights an extra ball on one of the in/out lanes. The shuttle is typically lit immediately before activating the Bride's Voice and immediately before the first Optical Link. Even if the shuttle is lit, a slightly weaker than full ramp shot can still fall into the Face structure and advance the Bride's face.",
      "start metamorphosis and complete the bride": "Left ramp - If the space shuttle is lit, the left ramp sends the ball into the PinBot Board in the top right of the game. When the ball enters the PinBot Board, the score award is 100,000 the 1st and 4th time, 200,000 the 2nd and 5th time, and 300,000 the 3rd and 6th time. The 7th entrance to the PinBot Board scores 600,000 points and lights an extra ball on one of the in/out lanes. The shuttle is typically lit immediately before activating the Bride's Voice and immediately before the first Optical Link. Even if the shuttle is lit, a slightly weaker than full ramp shot can still fall into the Face structure and advance the Bride's face."
    },
    "white water": {
      "advance 1 raft": "Whirlpool modes - Man Overboard: a hurry-up mode. The goal is to hit any hazard that is lit orange. The value of the hurry-up starts at 20,000,000 and counts down rather quickly to 3,000,000 before stalling for a couple of seconds, then ending the mode. Man Overboard is considered completed even if the rescue itself was failed. This can be much easier at some times than others depending on what hazards are currently light orange for raft progress. Spotting a hazard from Disaster Drop or the red targets does count as rescuing the Man Overboard.",
      "start any whirlpool mode": "Whirlpool modes - Shooting Insanity Falls when the yellow light on the sign is flashing will in turn light the red light on the sign, allowing a mode to be started at Bigfoot Bluff. There are 6 possible modes: you can see which one you're about to get at the inserts near the pop bumper area (the currently selected mode will be flashing). Pop bumper hits rotate what the currently selected mode is. The modes are: Whirlpool Challenge: a two-ball multiball. The goal is to repeatedly shoot balls into the Whirlpool via Bigfoot Bluff.",
      "light lock for multiball": "Locks and multiball - The main lock saucer is behind the N and T drop targets in the E-N-T bank in the center of the table. If no other multiball is running, shooting a ball into this saucer always scores a lock. The drop targets will re-raise after a lock is made. Locking 3 balls starts multiball. Multiball rules are similar to the jackpot rules of Fish Tales. The first goal of multiball is to collect 3 jackpots. These three jackpots have a base value of 20,000,000, then 25,000,000, then 30,000,000 points. ) The left ramp or lock saucer lights jackpot; the right ramp collects jackpot.",
      "start multiball": "Locks and multiball - The main lock saucer is behind the N and T drop targets in the E-N-T bank in the center of the table. If no other multiball is running, shooting a ball into this saucer always scores a lock. The drop targets will re-raise after a lock is made. Locking 3 balls starts multiball. Multiball rules are similar to the jackpot rules of Fish Tales. The first goal of multiball is to collect 3 jackpots. These three jackpots have a base value of 20,000,000, then 25,000,000, then 30,000,000 points. ) The left ramp or lock saucer lights jackpot; the right ramp collects jackpot.",
      "reach class 6 river": "Bonus and bonus multiplier - The bonus is supposed to be (50,000 points per lit hazard collected) + (75,000 points per raft advanced) + (100,000 points per whirlpool mode started), all multiplied by the River Class. However, for reasons no one really knows, the calculations are almost always incorrect, saying things like \"7 Hazards * 50,000 = 450,000\". Eh well. The bonus is kind of a crapshoot anyway, not making up a significant portion of score even with the Class 6 multiplier. River Class does not carry over from ball to ball, but the components of the base bonus are counted across the entire game."
    },
    "hurricane": {
      "complete the ducks targets": "Left drop targets: \"ducks\" - Each duck target down adds 15,000 points to the Ferris value. Clear all three to light the Ferris wheel and light a lock toward multiball. Clearing the bank itself might score 100,000 points? Each duck target down adds 15,000 points to the Ferris value. Clear all three to light the Ferris wheel and light a lock toward multiball. Clearing the bank itself might score 100,000 points?",
      "collect a 1 000 000 right ramp shot": "Right (Hurricane) ramp - Shooting the ramp when lit starts the Hurricane sequence. At first, the sequence is 200,000, then 225,000, then 1,000,000, then 1,000,000 plus a Palace letter, with the latter repeating until the ramp is missed. If you fail a shot worth less than 1,000,000 points, the ramp will stay lit by its value will reset to 200,000, and you must start the sequence over. If you fail a 1,000,000 point shot, the ramp will unlight when it times out, and must be relit by completing the 4-bank of \"cat\" targets on the right side of the game.",
      "lock 1 ball at the juggler": "Locks and multiball - Completing the ducks targets on the left lights locks at the Juggler lane. For the first multiball, just one target completion lights both locks. After that, each ducks completions lights just one lock at a time. Lock two balls, and multiball will start when a third ball is plunged into play. During multiball, the right ramp will be worth 1,000,000, then 2,000,000, then 5,000,000, cycling back to 1,000,000 and repeating after three shots.",
      "collect a ferris wheel award": "Ferris wheel - Hit the 3 duck targets in the left of the game to light the Ferris wheel. The Ferris bonus is equal to 250,000 points plus 15,000 for each bumper hit since the last time you collected the bonus; it resets between balls and games. Max Ferris bonus is 1,000,000 points. The right in lane lights the Ferris wheel for Quick Score for about 10 seconds. Quick Score is worth 250,000 the first time you collect it, and an additional 100,000 each subsequent time up to a maximum of 750,000. Quick Score and the lit Ferris wheel are entirely separate; you can collect one without the other (in both ways), or you can collect both at once.",
      "start multiball": "Locks and multiball - Completing the ducks targets on the left lights locks at the Juggler lane. For the first multiball, just one target completion lights both locks. After that, each ducks completions lights just one lock at a time. Lock two balls, and multiball will start when a third ball is plunged into play. During multiball, the right ramp will be worth 1,000,000, then 2,000,000, then 5,000,000, cycling back to 1,000,000 and repeating after three shots.",
      "spell palace and collect the jackpot": "Palace jackpot - The Palace jackpot starts at 5,000,000 points and increases by 130,000 points each time a center or right ramp is made. The jackpot cannot exceed 16,000,000 points. To light the jackpot, spell Palace. Palace letters can be earned from the Mystery award, a right ramp combo that collects at least two 1,000,000 point shots, or any right ramp made after completing both the ducks and cats target banks at least once. Completing Palace lights the Juggler's lane for Jackpot for 8 entire seconds, so you have to be quick."
    },
    "comet": {
      "complete the orange standup targets": "Orange and white standup targets - Hitting an unlit target in one of these banks lights that target and adds 2 advances to that colour's bonus. Hitting a lit target in one of these banks is worth 1 advance of that colour. Light all 4 targets in a bank to complete it. Completing the orange bank once lights the corkscrew for orange bonus collect. Completing the white bank once lights the Funhouse for white bonus collect. Completing both sets of targets once lights the center ramp.",
      "complete the white standup targets": "Orange and white standup targets - Hitting an unlit target in one of these banks lights that target and adds 2 advances to that colour's bonus. Hitting a lit target in one of these banks is worth 1 advance of that colour. Light all 4 targets in a bank to complete it. Completing the orange bank once lights the corkscrew for orange bonus collect. Completing the white bank once lights the Funhouse for white bonus collect. Completing both sets of targets once lights the center ramp.",
      "complete the 1986 top lanes": "1986 top lanes - The only way to collect more 1986 lanes after the plunge is to either shoot the corkscrew in the upper left, or have good pop bumper luck (and even the bumpers themselves are kind of in no-man's-land).",
      "light the center ramp": "Center Comet ramp - When not lit, this ramp always scores 10,000 points. When lit, the first ramp shot scores 30,000 points: consecutive center ramp shots, each within 15 seconds of the previous one, score 50,000 points, then 100,000 plus light extra ball, then 100,000 plus light special. If the 15 second timer runs out, the ramp value will be reset to 30,000 for another chance at the combo. If the ball drains or the 100,000 plus light special is collected, the ramp will unlight and its value will reset to 10,000 points until the orange and white standup targets are both completed again.",
      "shoot the cycle jump once": "Cycle jump ramp - After both sets of standup targets have been completed twice, the jump ramp will be lit for an extra ball. The extra ball will be available at the first hole for 8 seconds, then the second hole for 10 seconds, then the top hole for 15 seconds, before repeating until it is collected.",
      "collect the lit center ramp award": "Bonus and bonus multiplier - There are two different bonuses. Only one is collected at the end of the ball, but both can be collected mid-ball. Orange bonus is advanced 1 time by the left in lane or a lit orange standup target, 2 times by an unlit orange standup target, and 3 times by the left out lane, or by shooting the Funhouse. White bonus is advanced 1 time by the left in lane or a lit white standup target, 2 times by an unlit white standup target, or 3 times by the right out lane, or the corkscrew. The jump ramp awards 3, 5, or 10 advances to both bonuses depending on the hole hit.",
      "make 3 consecutive center ramp shots": "Center Comet ramp - When not lit, this ramp always scores 10,000 points. When lit, the first ramp shot scores 30,000 points: consecutive center ramp shots, each within 15 seconds of the previous one, score 50,000 points, then 100,000 plus light extra ball, then 100,000 plus light special. If the 15 second timer runs out, the ramp value will be reset to 30,000 for another chance at the combo. If the ball drains or the 100,000 plus light special is collected, the ramp will unlight and its value will reset to 10,000 points until the orange and white standup targets are both completed again.",
      "light extra ball at the cycle jump ramp": "Cycle jump ramp - After both sets of standup targets have been completed twice, the jump ramp will be lit for an extra ball. The extra ball will be available at the first hole for 8 seconds, then the second hole for 10 seconds, then the top hole for 15 seconds, before repeating until it is collected.",
      "complete both standup banks in one game": "Orange and white standup targets - Hitting an unlit target in one of these banks lights that target and adds 2 advances to that colour's bonus. Hitting a lit target in one of these banks is worth 1 advance of that colour. Light all 4 targets in a bank to complete it. Completing the orange bank once lights the corkscrew for orange bonus collect. Completing the white bank once lights the Funhouse for white bonus collect. Completing both sets of targets once lights the center ramp.",
      "score a 100 000+ center ramp value": "Center Comet ramp - When not lit, this ramp always scores 10,000 points. When lit, the first ramp shot scores 30,000 points: consecutive center ramp shots, each within 15 seconds of the previous one, score 50,000 points, then 100,000 plus light extra ball, then 100,000 plus light special. If the 15 second timer runs out, the ramp value will be reset to 30,000 for another chance at the combo. If the ball drains or the 100,000 plus light special is collected, the ramp will unlight and its value will reset to 10,000 points until the orange and white standup targets are both completed again.",
      "collect the lit cycle jump award": "Cycle jump ramp - After both sets of standup targets have been completed twice, the jump ramp will be lit for an extra ball. The extra ball will be available at the first hole for 8 seconds, then the second hole for 10 seconds, then the top hole for 15 seconds, before repeating until it is collected.",
      "make 5 consecutive center ramp shots": "Center Comet ramp - When not lit, this ramp always scores 10,000 points. When lit, the first ramp shot scores 30,000 points: consecutive center ramp shots, each within 15 seconds of the previous one, score 50,000 points, then 100,000 plus light extra ball, then 100,000 plus light special. If the 15 second timer runs out, the ramp value will be reset to 30,000 for another chance at the combo. If the ball drains or the 100,000 plus light special is collected, the ramp will unlight and its value will reset to 10,000 points until the orange and white standup targets are both completed again.",
      "score 1 000 000+ from ramp progress": "Center Comet ramp - When not lit, this ramp always scores 10,000 points. When lit, the first ramp shot scores 30,000 points: consecutive center ramp shots, each within 15 seconds of the previous one, score 50,000 points, then 100,000 plus light extra ball, then 100,000 plus light special. If the 15 second timer runs out, the ramp value will be reset to 30,000 for another chance at the combo. If the ball drains or the 100,000 plus light special is collected, the ramp will unlight and its value will reset to 10,000 points until the orange and white standup targets are both completed again.",
      "complete the 1986 lanes twice in one game": "1986 top lanes - The only way to collect more 1986 lanes after the plunge is to either shoot the corkscrew in the upper left, or have good pop bumper luck (and even the bumpers themselves are kind of in no-man's-land).",
      "score a 500 000+ end of ball bonus": "Bonus and bonus multiplier - There are two different bonuses. Only one is collected at the end of the ball, but both can be collected mid-ball. Orange bonus is advanced 1 time by the left in lane or a lit orange standup target, 2 times by an unlit orange standup target, and 3 times by the left out lane, or by shooting the Funhouse. White bonus is advanced 1 time by the left in lane or a lit white standup target, 2 times by an unlit white standup target, or 3 times by the right out lane, or the corkscrew. The jump ramp awards 3, 5, or 10 advances to both bonuses depending on the hole hit."
    },
    "cyclone": {
      "complete the shooting gallery targets": "Comet center ramp and Ball Toss left standup targets - After making a shot to the lit Comet ramp, you have about 20 seconds to shoot the ramp again for its next value. The ramp value is 20,000 - 40,000 - 60,000 - 80,000 - 100,000 - 1,000,000. If the ramp times out when it would have been worth 60,000 points or less, the value will go back one level and the ramp will stay lit. If the ramp times out when its value is 80,000 points or more, it will unlight completely and go back to base value. If you collect a 100,000 point Comet ramp, you only have 10 seconds to make the ramp again to collect the 1,000,000 rather than the usual 20.",
      "make 1 comet ramp shot": "Comet center ramp and Ball Toss left standup targets - After making a shot to the lit Comet ramp, you have about 20 seconds to shoot the ramp again for its next value. The ramp value is 20,000 - 40,000 - 60,000 - 80,000 - 100,000 - 1,000,000. If the ramp times out when it would have been worth 60,000 points or less, the value will go back one level and the ramp will stay lit. If the ramp times out when its value is 80,000 points or more, it will unlight completely and go back to base value. If you collect a 100,000 point Comet ramp, you only have 10 seconds to make the ramp again to collect the 1,000,000 rather than the usual 20.",
      "complete the ball toss targets": "Comet center ramp and Ball Toss left standup targets - After making a shot to the lit Comet ramp, you have about 20 seconds to shoot the ramp again for its next value. The ramp value is 20,000 - 40,000 - 60,000 - 80,000 - 100,000 - 1,000,000. If the ramp times out when it would have been worth 60,000 points or less, the value will go back one level and the ramp will stay lit. If the ramp times out when its value is 80,000 points or more, it will unlight completely and go back to base value. If you collect a 100,000 point Comet ramp, you only have 10 seconds to make the ramp again to collect the 1,000,000 rather than the usual 20.",
      "collect a ferris wheel award": "Ferris wheel: leftmost shot - Shooting the Ferris wheel will cause the ball to ride up a rotating toy, then take a habitrail back down to the left in lane. If the Ferris wheel was not lit, this shot scores 25,000 points. Rolling through the right in lane will light the Ferris wheel for 15 seconds. Shooting the Ferris wheel when lit scores the current Ferris Bonus. The Ferris Bonus is equal to 50,000 points plus 3,000 points per bumper hit since it was last collected, and can be doubled during Double Scoring. Each player builds their own Ferris Bonus; it carries over from ball to ball but not from game to game, and resets to 50,000 whenever it is collected.",
      "light the 1 000 000 comet ramp shot": "Comet center ramp and Ball Toss left standup targets - After making a shot to the lit Comet ramp, you have about 20 seconds to shoot the ramp again for its next value. The ramp value is 20,000 - 40,000 - 60,000 - 80,000 - 100,000 - 1,000,000. If the ramp times out when it would have been worth 60,000 points or less, the value will go back one level and the ramp will stay lit. If the ramp times out when its value is 80,000 points or more, it will unlight completely and go back to base value. If you collect a 100,000 point Comet ramp, you only have 10 seconds to make the ramp again to collect the 1,000,000 rather than the usual 20.",
      "start double scoring": "Ferris wheel: leftmost shot - Shooting the Ferris wheel will cause the ball to ride up a rotating toy, then take a habitrail back down to the left in lane. If the Ferris wheel was not lit, this shot scores 25,000 points. Rolling through the right in lane will light the Ferris wheel for 15 seconds. Shooting the Ferris wheel when lit scores the current Ferris Bonus. The Ferris Bonus is equal to 50,000 points plus 3,000 points per bumper hit since it was last collected, and can be doubled during Double Scoring. Each player builds their own Ferris Bonus; it carries over from ball to ball but not from game to game, and resets to 50,000 whenever it is collected."
    },
    "whirlwind": {
      "complete 1 direction": "Directions and locks - Green / SW: the left orbit shot between the cellar doors and lower bumpers, and the upper loop shot. By far the hardest direction to collect. Yellow / NW: the standup target just to the right of the Super Cellar, and the standup target just to the left of the right ramp.",
      "collect a super cellar award": "Super Cellar Door - Upper Jets On: increases the upper pop bumpers to their maximum flashing value of 5,000 per hit.",
      "lock 1 ball": "Directions and locks - For the first multiball, 2 directions will be required, but both will be lit at once, and their targets can be collected in any order. Starting with the second multiball, directions can only be collected one at a time. Starting with lock 2 of the second multiball, 3 directions are required instead of 2; starting with lock 2 of the third multiball, all 4 directions are required instead of 3. Balls are locked at the right ramp. Unless you are in a multiplayer game and there are already balls physically locked in the left of the game, the ramp will always be down when lock is lit.",
      "light quick multiball": "More on multiball - Quick Multiball and standard multiball can be started at the same time and have their rules stacked together by locking 2 balls for regular multiball, then lighting Quick Multiball from the Super Cellar or solo drop target, then shooting the saucer under the right ramp. Doing so will stack together the scoring opportunities at the side ramp: in effect, this means that the first Millions-Plus scores 3,000,000 points, and the maximum Millions-Plus value is 11,000,000. If a standard multiball is played and the game returns to single ball play before any Millions-Plus are collected from the side ramp, the two Cellar saucers will both be lit for Cellar Multiball for 15 seconds.",
      "start multiball": "More on multiball - Quick Multiball and standard multiball can be started at the same time and have their rules stacked together by locking 2 balls for regular multiball, then lighting Quick Multiball from the Super Cellar or solo drop target, then shooting the saucer under the right ramp. Doing so will stack together the scoring opportunities at the side ramp: in effect, this means that the first Millions-Plus scores 3,000,000 points, and the maximum Millions-Plus value is 11,000,000. If a standard multiball is played and the game returns to single ball play before any Millions-Plus are collected from the side ramp, the two Cellar saucers will both be lit for Cellar Multiball for 15 seconds.",
      "collect a millions plus at the side ramp": "Side ramp - During single ball play, the side ramp awards an increasing value from 50,000 to 100,000 points and lights the Super Cellar Door. During single ball play or during Quick Multiball, the side ramp spots one direction target. If the Million shot is lit from the Super Cellar Door, the side ramp scores 1,000,000 points one time."
    },
    "high speed": {
      "complete the green stoplight targets": "Stoplights and multiball progression - Hit a flashing stoplight target to light it and score 1,000 points plus a bonus advance. At first, only the three green lights will be flashing. Make those to light the yellows; make the yellows to light the reds; make the reds to light the side ramp for Run Red Light. You can also have stoplight targets spotted for you by shooting the side ramp or the eject hole just to the left of the right orbit. ) Shoot the side ramp when the red light above it is lit to run the red light and start the Escape.",
      "make 1 freeway": "Freeways - Making an orbit shot lights that orbit for a Freeway for about 9 seconds. Going through an in lane also lights the opposite in lane for a Freeway. Making a full orbit shot when lit for Freeway scores and advances the value shown on the bottom of the table between the flippers: 25,000 - 50,000 - 75,000 - 100,000 - 100,000 and lite extra ball. After lighting the extra ball, further Freeways on the same ball score 100,000 points. Progression through this sequence carries over from ball to ball, until the extra ball has been lit; after that, Freeway progress resets down to 25,000 at the start of each ball.",
      "reach red light": "Stoplights and multiball progression - Hit a flashing stoplight target to light it and score 1,000 points plus a bonus advance. At first, only the three green lights will be flashing. Make those to light the yellows; make the yellows to light the reds; make the reds to light the side ramp for Run Red Light. You can also have stoplight targets spotted for you by shooting the side ramp or the eject hole just to the left of the right orbit. ) Shoot the side ramp when the red light above it is lit to run the red light and start the Escape.",
      "make 3 freeways on one ball": "Stoplights and multiball progression - The side ramp scores the current Ramp Value, which starts at 50,000 points, increases by 25,000 with each lit 1-6 target hit, maxes out at 250,000, and resets to 50,000 once a ramp is made. Side ramps also advance the bonus multiplier toward the maximum of 5x. Making another side ramp after reaching 5x bonus will light hold bonus for the next ball. Shoot the side ramp when the red light above it is lit to run the red light and start the Escape.",
      "start multiball": "Stoplights and multiball progression - Hit a flashing stoplight target to light it and score 1,000 points plus a bonus advance. At first, only the three green lights will be flashing. Make those to light the yellows; make the yellows to light the reds; make the reds to light the side ramp for Run Red Light. You can also have stoplight targets spotted for you by shooting the side ramp or the eject hole just to the left of the right orbit. ) The side ramp scores the current Ramp Value, which starts at 50,000 points, increases by 25,000 with each lit 1-6 target hit, maxes out at 250,000, and resets to 50,000 once a ramp is made.",
      "collect the hideout jackpot": "Stoplights and multiball progression - Shoot the side ramp when the red light above it is lit to run the red light and start the Escape. During Escape, you have two options: start multiball immediately by shooting the side ramp again to get away, or try to complete the nine stoplight targets again in any order to light the eject hole for Escape, which will then give 100,000 points and the multiball start. It's usually less dangerous to just take the multiball start right away. In either case, the first ball will be held for you; you then get to plunge two more balls to the hideout locks on the sides of the game, and they will all kick out to start 3-ball multiball."
    },
    "no fear dangerous sports": {
      "start any minor challenge": "Modes - There are a total of 8 main modes in No Fear. They are subdivided into 5 minor challenges that can be played in any order, followed by 2 major challenges that have a set order, followed by Meet Your Maker wizard mode. The 5 minor modes and the first major mode (No Limits) can be started at the Skull at any time as long as there is not a mode or multiball running. The second major mode (Fear Fest) and Meet Your Maker require making a total of 6 of any major shot to spell No Fear before the Skull will be lit to start the mode.",
      "light lock for multiball": "Locks and multiball - Locks are lit at the Skydive lane just to the right of the left ramp and the Skull. ) If locks are not lit, you must hit a drop target in the Skydive lane to light locks. Locking three balls starts multiball. Multiball is a 3-ball affair. Jackpots are lit one at a time in the following sequence: 50,000,000 points at the Skull, then 100,000,000 at the Skydive lane, then 200,000,000 at the Jump ramp, and repeat. Play through this sequence as many times as possible during the multiball. The left saucer will hold onto a ball for about 15 seconds, letting you continue to play multiball rules with one less ball in the way.",
      "start multiball": "Locks and multiball - Locks are lit at the Skydive lane just to the right of the left ramp and the Skull. ) If locks are not lit, you must hit a drop target in the Skydive lane to light locks. Locking three balls starts multiball. Multiball is a 3-ball affair. Jackpots are lit one at a time in the following sequence: 50,000,000 points at the Skull, then 100,000,000 at the Skydive lane, then 200,000,000 at the Jump ramp, and repeat. Play through this sequence as many times as possible during the multiball. The left saucer will hold onto a ball for about 15 seconds, letting you continue to play multiball rules with one less ball in the way.",
      "start payback time": "Payback Time - Shooting the left and right ramps three times each starts Payback Time. Only the ramps with a flashing orange circle in front of them advance toward Payback Time, which requires you to shoot them evenly and alternate between the two. As soon as the last ramp shot registers, Payback Time starts; every shot in the game is worth 25,000,000 points for 20 seconds. Payback Time can run on top of any mode or any multiball, and it's recommended to try to get Payback Time to be one ramp away from starting before beginning multiball or a major challenge mode.",
      "start no limits": "Modes - There are a total of 8 main modes in No Fear. They are subdivided into 5 minor challenges that can be played in any order, followed by 2 major challenges that have a set order, followed by Meet Your Maker wizard mode. The 5 minor modes and the first major mode (No Limits) can be started at the Skull at any time as long as there is not a mode or multiball running. The second major mode (Fear Fest) and Meet Your Maker require making a total of 6 of any major shot to spell No Fear before the Skull will be lit to start the mode.",
      "complete air challenge": "Modes - Dirt Challenge: 30-second mode. The left and right ramps start at a value of 5,000,000 points. Any shot, including the ramps, increases the ramp value by 5,000,000 points up to a maximum of 20,000,000, but only the ramps score the ramp value. The Jump ramp has its usual scoring, starting at 5,000,000 each time the left ramp is made and increasing to a maximum of 25,000,000 per shot if 5 consecutive Jump ramps are made on the same trip to the skyloop. Asphalt Challenge: 30-second mode. Shoot the Skull, or the Track loop that runs to the immediate side of the Skull, 3 times."
    },
    "spider man vault edition": {
      "start any white mode": "Shot multipliers and white modes - Six shots in the game have white arrow lights: the left orbit, side ramp, left ramp, right ramp, Doc Ock scoop, and right orbit. Make all of the shots with white lights to start a white mode and qualify a shot multiplier. When a shot multiplier is ready, the next white light shot that you make will have a 2x shot multiplier for the rest of the ball. If you complete the mode, you get the chance to place a 3x shot multiplier at any lit white shot, which can be the same shot or a different shot as the 2x you placed at the start of the mode.",
      "light a 2x shot multiplier": "Shot multipliers and white modes - Six shots in the game have white arrow lights: the left orbit, side ramp, left ramp, right ramp, Doc Ock scoop, and right orbit. Make all of the shots with white lights to start a white mode and qualify a shot multiplier. When a shot multiplier is ready, the next white light shot that you make will have a 2x shot multiplier for the rest of the ball. If you complete the mode, you get the chance to place a 3x shot multiplier at any lit white shot, which can be the same shot or a different shot as the 2x you placed at the start of the mode.",
      "start black suit multiball": "Standard multiball: Black Suit - Hit the Web white standup target between the left orbit and the side ramp to increase the spinner value by 2,500 points per spin and make progress toward lighting a lock on either orbit. For the first Black Suit multiball, just one shot to this target is needed per lock, but this increases by 1 shot per lock with each multiball played. You cannot light the next lock until making the previous one. Lock 3 balls to start Black Suit Multiball. During Black Suit multiball, each of the 6 major shots is lit for two jackpots, as shown by the red and white arrows.",
      "complete any level 1 villain mode": "Shot multipliers and white modes - Six shots in the game have white arrow lights: the left orbit, side ramp, left ramp, right ramp, Doc Ock scoop, and right orbit. Make all of the shots with white lights to start a white mode and qualify a shot multiplier. When a shot multiplier is ready, the next white light shot that you make will have a 2x shot multiplier for the rest of the ball. If you complete the mode, you get the chance to place a 3x shot multiplier at any lit white shot, which can be the same shot or a different shot as the 2x you placed at the start of the mode.",
      "start battle royale": "Villain modes, including Battle Royale mini-wizard mode - There are 4 villains, each with three modes always played in the same order. In general, progressing through villain modes requires hitting their corresponding shot quite a few times: the lower left standup targets for Green Goblin, the side ramp for Venom, the center ramp/toy for Sandman, and the scoop for Doc Ock / Doctor Octopus. Villain modes are untimed (with one exception), continue from ball to ball even if you drain, can run concurrently with other villains, and can be started at any time including multiball.",
      "complete any level 2 villain mode": "Shot multipliers and white modes - Six shots in the game have white arrow lights: the left orbit, side ramp, left ramp, right ramp, Doc Ock scoop, and right orbit. Make all of the shots with white lights to start a white mode and qualify a shot multiplier. When a shot multiplier is ready, the next white light shot that you make will have a 2x shot multiplier for the rest of the ball. If you complete the mode, you get the chance to place a 3x shot multiplier at any lit white shot, which can be the same shot or a different shot as the 2x you placed at the start of the mode."
    },
    "iron man vault edition": {
      "complete the iron man targets once": "Iron Man - Ironman Fast Scoring: 40-second frenzy mode. All switches in the game score 10,000 points. Hit any Iron Man standup target to add 1,000 to the frenzy value, up to a maximum of 50,000 points per switch hit. Ironman Scoring: confusingly named, but very different from the 1st scoring mode. The value of hitting any Iron Man standup target starts at 750,000 points, and counts down to 400,000 over about 20 seconds. Hit Iron Man standups repeatedly during this countdown to score whatever is remaining on the hurry-up.",
      "hit 4 lit drone targets": "Drone targets - The Drone character progress is heavily tied to War Machine Multiball progress. Hitting 8 lit Drone targets to light any single War Machine Multiball causes the Drone character to be lit. Qualifying War Machine Multiball for a fourth time is the only way to make the Drone character flash.",
      "hit the whiplash targets 3 times": "Whiplash + multiball - The Whiplash mechanism consists of the two standup targets and magnet positioned between the center spinner lane and the right ramp. Hit either target to score 50,000 points and one shot of credit toward Whiplash multiball. When either target is hit, the magnet is pulsed, which helps send the ball out of control. After 5 hits (for the first Whiplash Multiball) or 10 hits (anytime after that), Whiplash Multiball instantly begins, which comes with the now-standard 250,000 points and one Mark. Whiplash starts as a 2-ball multiball.",
      "collect 3 monger letters": "Iron Monger + multiball - When the Monger is raised, the goal is to hit it 6 times. Be very careful how you go about this; hitting Monger straight-on will trigger the magnet in front of him, putting the ball wildly out of control and at high risk for a center drain. It is preferable to shoot Monger with glancing blows, aiming for the near left corner from the left flipper and near right corner from the right flipper, to avoid activating the magnet in front of him. While the Monger is up, each hit to him scores 100,000 points, plus an additional 7,500 for each spin registered on any spinner since the last Monger hit.",
      "start any iron man scoring mode": "Iron Man - Ironman Fast Scoring: 40-second frenzy mode. All switches in the game score 10,000 points. Hit any Iron Man standup target to add 1,000 to the frenzy value, up to a maximum of 50,000 points per switch hit. Ironman Scoring: confusingly named, but very different from the 1st scoring mode. The value of hitting any Iron Man standup target starts at 750,000 points, and counts down to 400,000 over about 20 seconds. Hit Iron Man standups repeatedly during this countdown to score whatever is remaining on the hurry-up.",
      "qualify war machine multiball": "War Machine + multiball - There are 4 post targets labelled Drone around the game: one next to the left orbit, one next to the right ramp, and one on either side of the center spinner lane. To start, all 4 Drones are lit. Hitting a Drone scores that Drone and unlights it. A total of 8 lit Drones must be scored to qualify War Machine Multiball. For the first War Machine Multiball, the minimum number of lit Drones at any one time is 3; this decreases to 2 for the second multiball and 1 for the third multiball onwards.",
      "start whiplash multiball": "Whiplash + multiball - The Whiplash mechanism consists of the two standup targets and magnet positioned between the center spinner lane and the right ramp. Hit either target to score 50,000 points and one shot of credit toward Whiplash multiball. When either target is hit, the magnet is pulsed, which helps send the ball out of control. After 5 hits (for the first Whiplash Multiball) or 10 hits (anytime after that), Whiplash Multiball instantly begins, which comes with the now-standard 250,000 points and one Mark. Whiplash starts as a 2-ball multiball.",
      "start iron monger multiball": "Iron Monger + multiball - When the Monger is raised, the goal is to hit it 6 times. Be very careful how you go about this; hitting Monger straight-on will trigger the magnet in front of him, putting the ball wildly out of control and at high risk for a center drain. It is preferable to shoot Monger with glancing blows, aiming for the near left corner from the left flipper and near right corner from the right flipper, to avoid activating the magnet in front of him. While the Monger is up, each hit to him scores 100,000 points, plus an additional 7,500 for each spin registered on any spinner since the last Monger hit.",
      "start multiball and collect a jackpot": "War Machine + multiball - There are 4 post targets labelled Drone around the game: one next to the left orbit, one next to the right ramp, and one on either side of the center spinner lane. To start, all 4 Drones are lit. Hitting a Drone scores that Drone and unlights it. A total of 8 lit Drones must be scored to qualify War Machine Multiball. For the first War Machine Multiball, the minimum number of lit Drones at any one time is 3; this decreases to 2 for the second multiball and 1 for the third multiball onwards.",
      "collect a war machine super jackpot": "War Machine + multiball - There are 4 post targets labelled Drone around the game: one next to the left orbit, one next to the right ramp, and one on either side of the center spinner lane. To start, all 4 Drones are lit. Hitting a Drone scores that Drone and unlights it. A total of 8 lit Drones must be scored to qualify War Machine Multiball. For the first War Machine Multiball, the minimum number of lit Drones at any one time is 3; this decreases to 2 for the second multiball and 1 for the third multiball onwards.",
      "collect an iron monger super jackpot": "Iron Monger + multiball - When the Monger is raised, the goal is to hit it 6 times. Be very careful how you go about this; hitting Monger straight-on will trigger the magnet in front of him, putting the ball wildly out of control and at high risk for a center drain. It is preferable to shoot Monger with glancing blows, aiming for the near left corner from the left flipper and near right corner from the right flipper, to avoid activating the magnet in front of him. While the Monger is up, each hit to him scores 100,000 points, plus an additional 7,500 for each spin registered on any spinner since the last Monger hit.",
      "collect a whiplash super jackpot": "Whiplash + multiball - The Whiplash mechanism consists of the two standup targets and magnet positioned between the center spinner lane and the right ramp. Hit either target to score 50,000 points and one shot of credit toward Whiplash multiball. When either target is hit, the magnet is pulsed, which helps send the ball out of control. After 5 hits (for the first Whiplash Multiball) or 10 hits (anytime after that), Whiplash Multiball instantly begins, which comes with the now-standard 250,000 points and one Mark. Whiplash starts as a 2-ball multiball.",
      "reach mark 6 to light jericho": "Jericho Missile Mayhem: mini-wizard mode - Reaching Mark 6 lights the center spinner lane for Jericho, the game's mini-wizard mode. Marks are awarded any time a multiball is started, an Iron Man scoring round is started, Bogey is started (see below), or a War Machine multiball is lit. Also, completing all 6 rollover lanes (the two top lanes and 4 in/out lanes) will award a Mark, but this can only be done once unless Jericho is played.",
      "start do or die hurry up": "Quick strategy synopsis - There are 5 main types of progress in the game: complete the Iron Man targets, hit enough Drone targets to light War Machine Multiball, actually play War Machine Multiball, hit the Whiplash targets and magnet enough to play Whiplash Multiball, and shoot orbits then the Monger toy to play Iron Monger Multiball. Do any of these a total of 6 times to light the Jericho min-wizard mode at the center spinner. Do all of these at least once in a single ball to light the Do or Die Hurry-up at the center spinner, worth up to 35,000,000 points."
    },
    "ac dc": {
      "start any multiball": "There are super jackpots available after collecting twenty jackpots in any given multiball (14 in Album, since that's how many albums there are), which are awarded by a cannon shot to the bell. The super is worth the lump sum of all jackpots scored up to that point, which is great value. Not only that, you keep progress on how many jackpots you've scored during multiballs - which is good to know for what Album or Tour you've made it up to. There's some merit in going for the stacked multiballs in that the points are far more frenetic and plentiful all at once, though it's also argued that playing three single multiballs is better than playing one triple multiball.",
      "collect a song jackpot": "In case you forget which song is which, when selecting your song, the inserts for that song's feature will usually light up to give you a clue as to what you're shooting for. It's also helpful for when the machine's operator has modified the game to have different songs. A modified setlist is purely a cosmetic change; it won't affect the rules of each mode, but it will mean the names of the modes have been changed. After all, the setlist here pretty strongly favors Black Ice (AC/DC's newest album at the time of the table's release), and shamefully omits classics like Dirty Deeds Done Dirt Cheap and Shoot to Thrill.",
      "start a multiball and collect a jackpot": "To score the Song Jackpot, you have to spell F-I-R-E on the inlanes three times, although one shot at the song jackpot is available at game start. When you've completed it, you can then shoot the ball up the right ramp which will feed the cannon. You'll know the cannon is lit by a lit yellow \"cannon\" insert above the flippers. From there, the cannon will rotate out and aim at the AC/DC targets, with one light flashing for the Song Jackpot. Press the Fire button on the lockbar to fire the cannon - hit the blinking target, and you'll get that song jackpot, which will reset it back to 1,000,000."
    },
    "party animal": {
      "complete the jukebox targets": "Jukebox, Dance Value, and Pig-Out/Toadstool awards - The targets on the Jukebox labelled 1-2-3 score 5,000 points when unlit or lit. Hit an unlit target to light it solidly. Light all 3 targets to reset them, change the current background music, and advance the bumper value. The indicator light just left the Jukebox describes the bumper value; 1,000 when not lit, 2,000 when lit (after one Jukebox completion), or 3,000 when flashing (after two Jukebox completions). Pop bumpers also advance the Dance Bonus. The Dance Bonus starts at 5,000 points.",
      "collect the 50000 door prize": "Skill shot: Door Prize - Any plunge on Party Animal ends up in the game's single top lane, which has a constantly rotating lit value of either 5,000, 10,000, 25,000, or 50,000 points. The award that's lit when the ball rolls through the lane is what you get. This roving value is always available, so you'll also get a Door Prize award when you shoot the lower ramp or when plunging balls to start multiball.",
      "complete pig out and collect a toadstool award": "Jukebox, Dance Value, and Pig-Out/Toadstool awards - The targets on the Jukebox labelled 1-2-3 score 5,000 points when unlit or lit. Hit an unlit target to light it solidly. Light all 3 targets to reset them, change the current background music, and advance the bumper value. The indicator light just left the Jukebox describes the bumper value; 1,000 when not lit, 2,000 when lit (after one Jukebox completion), or 3,000 when flashing (after two Jukebox completions). Pop bumpers also advance the Dance Bonus. The Dance Bonus starts at 5,000 points.",
      "collect a party animal letter": "Party Animal! letters and multiball - The 12 letters in Party Animal! (including the exclamation mark as a letter) are shown in a circle near the slingshots. Lighting all 12 letters qualifies multiball. The P, Y, I, and third A are red; light these letters by making the upper right saucer. These are the easiest to get, since any ball that goes through the Door Prize top lane will end up in the upper right saucer. The first A, T, N, and L are yellow; light these letters by making the upper left saucer.",
      "spell party animal and start multiball": "Party Animal! letters and multiball - The 12 letters in Party Animal! (including the exclamation mark as a letter) are shown in a circle near the slingshots. Lighting all 12 letters qualifies multiball. The P, Y, I, and third A are red; light these letters by making the upper right saucer. These are the easiest to get, since any ball that goes through the Door Prize top lane will end up in the upper right saucer. The first A, T, N, and L are yellow; light these letters by making the upper left saucer.",
      "collect the party bonus multiball jackpot": "Party Animal! letters and multiball - The 12 letters in Party Animal! (including the exclamation mark as a letter) are shown in a circle near the slingshots. Lighting all 12 letters qualifies multiball. The P, Y, I, and third A are red; light these letters by making the upper right saucer. These are the easiest to get, since any ball that goes through the Door Prize top lane will end up in the upper right saucer. The first A, T, N, and L are yellow; light these letters by making the upper left saucer."
    },
    "elvira and the party monsters": {
      "complete bat": "Bat top lanes - Roll through a lane to light it. Lit lanes can be rotated with either flipper lane change, but both flippers move the lights in the same direction. Spell Bat to advance the bonus multiplier toward its maximum of 5x, light the left orbit for Lock if it was not already, and light the left ramp for an Elvira letter.",
      "light lock at the left orbit": "Locks and multiball - Lock balls at the left orbit when lit. If the left orbit is not lit, complete the Bat top lanes or the Jam drop targets to light it. Lock 3 balls to start multiball. Your one and only goal in multiball is to hit the two ramps within about 10 seconds of each other to score the Jackpot. If the jackpot is set to progressive, it will start at 1,000,000 points, increase by any non-ramp scoring made during multiball up to 4,000,000, and reset to 1,000,000 when collected. If the jackpot is set to static, it will always be worth the max value of 4,000,000.",
      "lock 1 ball": "Locks and multiball - Lock balls at the left orbit when lit. If the left orbit is not lit, complete the Bat top lanes or the Jam drop targets to light it. Lock 3 balls to start multiball. Your one and only goal in multiball is to hit the two ramps within about 10 seconds of each other to score the Jackpot. If the jackpot is set to progressive, it will start at 1,000,000 points, increase by any non-ramp scoring made during multiball up to 4,000,000, and reset to 1,000,000 when collected. If the jackpot is set to static, it will always be worth the max value of 4,000,000.",
      "spell elvira": "Quick strategy synopsis - Elvira's first pinball table is brutally difficult, with monstrously hungry out lanes and three major shots all designed to center drain you if you don't hit them exactly right. Lock balls at the left orbit; 3 locks starts multiball. If the orbit is not lit for a lock, complete the Bat top lanes or the Jam center drop targets to light it. During multiball, hit one ramp within 15 seconds of the other (either order) to score a jackpot worth up to 4,000,000. Completing Bat, Jam, or all 4 Wake the Dead Heads targets in the lower left lights the left ramp for an Elvira letter: spell Elvira to light the lock shot for 3,000,000 for 20 seconds.",
      "start multiball": "Locks and multiball - Lock balls at the left orbit when lit. If the left orbit is not lit, complete the Bat top lanes or the Jam drop targets to light it. Lock 3 balls to start multiball. Your one and only goal in multiball is to hit the two ramps within about 10 seconds of each other to score the Jackpot. If the jackpot is set to progressive, it will start at 1,000,000 points, increase by any non-ramp scoring made during multiball up to 4,000,000, and reset to 1,000,000 when collected. If the jackpot is set to static, it will always be worth the max value of 4,000,000.",
      "collect the multiball jackpot": "Locks and multiball - Lock balls at the left orbit when lit. If the left orbit is not lit, complete the Bat top lanes or the Jam drop targets to light it. Lock 3 balls to start multiball. Your one and only goal in multiball is to hit the two ramps within about 10 seconds of each other to score the Jackpot. If the jackpot is set to progressive, it will start at 1,000,000 points, increase by any non-ramp scoring made during multiball up to 4,000,000, and reset to 1,000,000 when collected. If the jackpot is set to static, it will always be worth the max value of 4,000,000."
    },
    "dr dude": {
      "complete 1 color shot": "Green, red, and yellow shots - Magnetic Personality is best shot from the right flipper. The feed usually goes just the right speed that it can lead to a trap on the left directly or on the right via a dead bounce. Heart of Rock 'n Roll is best shot as an early backhand from the left flipper. Forehanding this shot frequently leads to center drains or tough slap saves.",
      "complete the r e f l e x targets": "Drop targets - Completing the drop targets advances the bonus multiplier: first to 2X, then 4X, then 6X. Once the bonus booster is at the max of 6X (whether that came from drop targets or a Bag of Tricks mystery award), the next award is Lite Million, the award after that is Lite Extra Ball, and any completions beyond that just give points (no idea how many because it's not worth it to actually go for this many drop targets). Any completion of the drop targets will light the Bag of Tricks mystery at the left saucer.",
      "bring the mixmaster online": "Ramp and Mixmaster - One of the steepest ramps in all of pinball, pretty much impossible to backhand. If there's any chance at all that the ball doesn't make it into the Mixmaster, be ready with a side nudge to ensure the ball hits something other than the trough. If green, red, and yellow have not been completed, every target hit in the Mixmaster scores 1,000 points. Hitting the green, red, or yellow targets within the Mixmaster 10 times each spots one hit of that shot's colour. After green, red, and yellow have been completed (or if the last one of the three gets completed while the ball is in the Mixmaster), the Mixmaster will be \"brought online\".",
      "complete reflex 1 2 3": "R-E-F-L-E-X targets and Reflex 1-2-3 - Be mindful that because of the angle on the R-E-F-L-E-X targets, a ball that hits one on its way out from the bumpers has a high chance of draining SDTM.",
      "start multiball": "Ramp and Mixmaster - After green, red, and yellow have been completed (or if the last one of the three gets completed while the ball is in the Mixmaster), the Mixmaster will be \"brought online\". Now, each target within the Mixmaster is worth 10,000 points, and as soon as the ball gets spit out, multiball will be ready at the left lane. During multiball, hitting the targets a certain number of times scores the Jackpot. The first Jackpot requires 10 hits, and each Jackpot after that (regardless of whether it's on the same multiball or a future one) requires 10 additional hits.",
      "double the jackpot during multiball": "Ramp and Mixmaster - After green, red, and yellow have been completed (or if the last one of the three gets completed while the ball is in the Mixmaster), the Mixmaster will be \"brought online\". Now, each target within the Mixmaster is worth 10,000 points, and as soon as the ball gets spit out, multiball will be ready at the left lane. During multiball, hitting the targets a certain number of times scores the Jackpot. The first Jackpot requires 10 hits, and each Jackpot after that (regardless of whether it's on the same multiball or a future one) requires 10 additional hits."
    },
    "party zone": {
      "start dance contest": "B-O-P top lanes, bumpers, and Dance Contest - Going through one of the top B-O-P lanes lights it. Lit lanes can be rotated via lane change with either flipper, but both flippers move the lit lanes in the same direction. Completing the B-O-P lanes by lighting all three advances the bonus multiplier in the order of 2x-4x-6x-8x, and lights the Back-2-Bop lane for Dance Contest. Shoot the Back-2-Bop lane, which is the lane just to the right of the left ramp, to start Dance Contest. During Dance Contest, all bumpers score 100,000 points; Dance Contest only ends after 5 seconds pass without a pop bumper hit.",
      "make a song request": "Request Time - The targets and saucer in the center of the table operate Request Time. Hit the two standup targets to lit the saucer for a Song Request. Making a song request scores 250,000 points, allows the player to pick a different music track to play during the game, and qualifies one or more of the locks if necessary. At random points throughout the game, the DJ will play 'one of his favorites', which interrupts the hot jams with a mid-century crooner song. If you make a request while this is happening, you earn the Party Saver bonus.",
      "complete way out of control": "Way Out Of Control targets and Payoff side lane - The right side Payoff lane scores Millions-Plus when not lit; the first is worth 1,000,000, increasing 1,000,000 at a time up to a max of 10,000,000.",
      "invite 1 party member at the cosmic cottage": "Cosmic Cottage - The Cosmic Cottage is the purple hut just to the right of the Comic. In reality, this shot leads to the same saucer as the Comic, but the ball will enter the saucer from behind and hit a switch along the way to differentiate. If you have a Pass, shooting the Cosmic Cottage invites a new member to the party, which acts like a lock; otherwise, a bouncer will send the ball back to you and give you nothing. The first pass scores Party Animals; the second scores Party Monsters; the third scores Party Dudes, which starts Happy Hour multiball.",
      "start multiball": "Multiball - Getting Surprise! from the Comic or successfully inviting the Party Dudes to the Cosmic Cottage starts multiball. Multiball is always 2 balls. The Rock-It fuel level will start at 4,000,000 points. Shoot the Rock-It at any time to score those fuel level points. Shoot the Comic saucer or the Back-2-Bop upper left lane to increase the fuel level by 1,000,000. Advancing the fuel level when it is already at 7,000,000 starts the Big Bang Chance. During Big Bang, shoot the left ramp to relock a ball and score 10,000,000 points.",
      "collect the big bang jackpot": "Multiball - Getting Surprise! from the Comic or successfully inviting the Party Dudes to the Cosmic Cottage starts multiball. Multiball is always 2 balls. The Rock-It fuel level will start at 4,000,000 points. Shoot the Rock-It at any time to score those fuel level points. Shoot the Comic saucer or the Back-2-Bop upper left lane to increase the fuel level by 1,000,000. Advancing the fuel level when it is already at 7,000,000 starts the Big Bang Chance. During Big Bang, shoot the left ramp to relock a ball and score 10,000,000 points.",
      "invite 2 party members at the cosmic cottage": "Cosmic Cottage - The Cosmic Cottage is the purple hut just to the right of the Comic. In reality, this shot leads to the same saucer as the Comic, but the ball will enter the saucer from behind and hit a switch along the way to differentiate. If you have a Pass, shooting the Cosmic Cottage invites a new member to the party, which acts like a lock; otherwise, a bouncer will send the ball back to you and give you nothing. The first pass scores Party Animals; the second scores Party Monsters; the third scores Party Dudes, which starts Happy Hour multiball."
    },
    "scared stiff": {
      "complete any tale": "Tales of Terror - The Monster's Lab: hit 20 pop bumpers to complete this Tale. Once this Tale is completed, all pop bumpers score 10,000 points (plus an additional 5,000 points for each time The Monster's Lab has been completed previously within this game). Reaching the pop bumper area can be unintuitive: the best way is usually to complete the Return of the Dead Heads tale, then shoot the left orbit when locks for Coffin Multiball are not lit. This will send the ball all the way around the back of the table from the left orbit, dropping the ball in the pops.",
      "collect a spider wheel award": "Right ramp and the Spider wheel - The right ramp scores 25,000 points. , up to a maximum of 450,000 points. At 3 right ramps, your base bonus is held to the next ball. At 8 and 30 right ramps, extra ball is lit. Shoot the Spider hole just to the right of the right ramp when it is lit to spin the Spider wheel on the backglass. If the Spider hole is not lit, shoot the right ramp to light it: the right ramp will then also score a Web Bonus equal to 50,000 points times the number of Spider wheel awards colelcted so far.",
      "start crate multiball": "Light jackpot: worth 250,000 points on the left ramp, good for one collect only - Scared guy: Beat the Crate mode. The Scared Stiff meter will constantly raise and lower. For 20 seconds, any hit to the Crate scores 25,000 points times whatever number is lit when you hit it. Coffin: this awards lights a Coffin lock on the left orbit, or spots a Coffin lock if it was already lit. Collecting the Coffin also extends Coffin multiball, which means the multiball will restart the first time that single ball play would otherwise resume.",
      "complete return of the dead heads": "Tales of Terror - The Monster's Lab: hit 20 pop bumpers to complete this Tale. Once this Tale is completed, all pop bumpers score 10,000 points (plus an additional 5,000 points for each time The Monster's Lab has been completed previously within this game). Reaching the pop bumper area can be unintuitive: the best way is usually to complete the Return of the Dead Heads tale, then shoot the left orbit when locks for Coffin Multiball are not lit. This will send the ball all the way around the back of the table from the left orbit, dropping the ball in the pops.",
      "light scared stiff": "Tales of Terror - The Stiff in the Coffin: the left ramp lights a lock at the left orbit. Lock three balls to start Coffin Multiball. At first, both ramps are lit for a jackpot. After a jackpot has been collected, only one ramp will be lit at a time, alternating on each jackpot collect. The Coffin Jackpot starts at 500,000 points and increases by 10,000 every time an unlit ramp is hit during the multiball. This Tale ends when single ball plays resumes, unless you have collected the Coffin from the Spider Wheel, in which case the entire multiball will restart one time.",
      "start spider mania": "Right ramp and the Spider wheel - The right ramp scores 25,000 points. , up to a maximum of 450,000 points. At 3 right ramps, your base bonus is held to the next ball. At 8 and 30 right ramps, extra ball is lit. Shoot the Spider hole just to the right of the right ramp when it is lit to spin the Spider wheel on the backglass. If the Spider hole is not lit, shoot the right ramp to light it: the right ramp will then also score a Web Bonus equal to 50,000 points times the number of Spider wheel awards colelcted so far.",
      "start scared stiff": "Tales of Terror - The Stiff in the Coffin: the left ramp lights a lock at the left orbit. Lock three balls to start Coffin Multiball. At first, both ramps are lit for a jackpot. After a jackpot has been collected, only one ramp will be lit at a time, alternating on each jackpot collect. The Coffin Jackpot starts at 500,000 points and increases by 10,000 every time an unlit ramp is hit during the multiball. This Tale ends when single ball plays resumes, unless you have collected the Coffin from the Spider Wheel, in which case the entire multiball will restart one time.",
      "complete 2 tales in one game": "Tales of Terror - The Monster's Lab: hit 20 pop bumpers to complete this Tale. Once this Tale is completed, all pop bumpers score 10,000 points (plus an additional 5,000 points for each time The Monster's Lab has been completed previously within this game). Reaching the pop bumper area can be unintuitive: the best way is usually to complete the Return of the Dead Heads tale, then shoot the left orbit when locks for Coffin Multiball are not lit. This will send the ball all the way around the back of the table from the left orbit, dropping the ball in the pops."
    },
    "bram stoker s dracula": {
      "make 3 left ramp shots": "Quick strategy synopsis - At the beginning of the game, be sure to collect the first Bats award by making 3 left ramps, then hitting any 15 switches during the time limit. After that, always be in multiball. There are 3 multiballs in the game, with their startups and jackpot shots listed below; if 2 or 3 multiballs are running at the same time, all jackpots in all multiballs will be doubled or tripled respectively, which is where the biggest points lie. Coffin Multiball: make 8 right ramp shots (5 to complete the coffin, then 3 more for the 3 locks).",
      "make 3 right ramp shots": "Right ramp and Coffin multiball - It takes 5 shots to the right ramp to qualify Coffin locks. , with the fifth being worth 2,500,000. However, the value of a Coffin shot can be doubled by rolling through the left in lane, and the Coffin ramp itself puts the ball into the left in lane, so you can get more points by comboing the right ramp repeatedly. After completing the Coffin with 5 shots, you can lock balls at the Coffin, which are spit out into the pop bumpers. Locking 3 balls starts Coffin Multiball. The default jackpot value is 20,000,000.",
      "light a castle lock": "as an award from the Mystery at the Tunnel saucer - The left ramp awards are slightly unintuitive. , left ramp bonuses (6, 18, 30, 42... ramps) will always light a Castle lock. The other left ramp bonuses (12, 24, 36, 48... ramps) will try to spot one of the 5 shots to complete the Coffin instead, but if the Coffin is complete and Coffin locks are qualified, these bonuses can still light a Castle lock. Therefore, if you notice that your next left ramp will be a multiple of 12, see if it's reasonable to finish the Coffin first to ensure that the next left ramp gives you the more valuable Castle lock.",
      "light coffin locks": "Right ramp and Coffin multiball - It takes 5 shots to the right ramp to qualify Coffin locks. , with the fifth being worth 2,500,000. However, the value of a Coffin shot can be doubled by rolling through the left in lane, and the Coffin ramp itself puts the ball into the left in lane, so you can get more points by comboing the right ramp repeatedly. After completing the Coffin with 5 shots, you can lock balls at the Coffin, which are spit out into the pop bumpers. Locking 3 balls starts Coffin Multiball. The default jackpot value is 20,000,000.",
      "start bats mode": "), will put the ball into the shooter lane and start Bats. Bats is a quick hurry-up that lasts about 15 seconds. The hurry-up starts at 50,000,000 and counts down to 2,000,000. The hurry-up is collected by hitting any 15 switches in the game, thus scaring off 15 bats (out lanes count as 3 bats). When you complete a Bats round, the score is not given to you immediately; instead, it is added to your Bats Bonus, which is collected at the end of every ball. If you play and complete Bats more than once, all of the completion values are added together to make the Bats Bonus, with no limit that I've ever seen.",
      "lock 1 ball at the left ramp": "as an award from the Mystery at the Tunnel saucer - The left ramp awards are slightly unintuitive. , left ramp bonuses (6, 18, 30, 42... ramps) will always light a Castle lock. The other left ramp bonuses (12, 24, 36, 48... ramps) will try to spot one of the 5 shots to complete the Coffin instead, but if the Coffin is complete and Coffin locks are qualified, these bonuses can still light a Castle lock. Therefore, if you notice that your next left ramp will be a multiple of 12, see if it's reasonable to finish the Coffin first to ensure that the next left ramp gives you the more valuable Castle lock.",
      "start coffin multiball": "Right ramp and Coffin multiball - It takes 5 shots to the right ramp to qualify Coffin locks. , with the fifth being worth 2,500,000. However, the value of a Coffin shot can be doubled by rolling through the left in lane, and the Coffin ramp itself puts the ball into the left in lane, so you can get more points by comboing the right ramp repeatedly. After completing the Coffin with 5 shots, you can lock balls at the Coffin, which are spit out into the pop bumpers. Locking 3 balls starts Coffin Multiball. The default jackpot value is 20,000,000.",
      "start castle multiball": "as an award from the Mystery at the Tunnel saucer - The left ramp awards are slightly unintuitive. , left ramp bonuses (6, 18, 30, 42... ramps) will always light a Castle lock. The other left ramp bonuses (12, 24, 36, 48... ramps) will try to spot one of the 5 shots to complete the Coffin instead, but if the Coffin is complete and Coffin locks are qualified, these bonuses can still light a Castle lock. Therefore, if you notice that your next left ramp will be a multiple of 12, see if it's reasonable to finish the Coffin first to ensure that the next left ramp gives you the more valuable Castle lock.",
      "start mist multiball": "Multi-Multiball - Mist cannot be lit at the Tunnel more than once. If the Mist lit by 5 left ramps still hasn't been collected by the time you get to 14 left ramps, don't go for the 15th ramp: either start Mist (it will be easy to relight, since only 1 left ramp will be needed once it ends), or switch your focus to the Coffin to lock 2 balls so that you have 2 different multiballs that are only 1 lock away from starting. As mentioned in the Castle Multiball section, pay attention to the count of your left ramps, separately from the Mist point above.",
      "collect a jackpot": "as an award from the Mystery at the Tunnel saucer - Castle Multiball works like many other late 80s/early 90s multiballs, most notably Fish Tales. Relock a ball at the left ramp to light the Jackpot for 20 seconds. Jackpot can be collected at the Tunnel saucer, just to the right of the left ramp. ) If three or more balls are in play, you can relock 2 balls at the left ramp; relocking the second ball resets the 20-second timer and increases the jackpot available at the saucer to a Double Jackpot. One would think that if 4 balls were in play, you could relock 3 of them for a triple jackpot chance, but this is not the case.",
      "lock 2 balls toward castle multiball": "as an award from the Mystery at the Tunnel saucer - The left ramp awards are slightly unintuitive. , left ramp bonuses (6, 18, 30, 42... ramps) will always light a Castle lock. The other left ramp bonuses (12, 24, 36, 48... ramps) will try to spot one of the 5 shots to complete the Coffin instead, but if the Coffin is complete and Coffin locks are qualified, these bonuses can still light a Castle lock. Therefore, if you notice that your next left ramp will be a multiple of 12, see if it's reasonable to finish the Coffin first to ensure that the next left ramp gives you the more valuable Castle lock.",
      "start any multiball and collect a jackpot": "Multi-Multiball - Mist cannot be lit at the Tunnel more than once. If the Mist lit by 5 left ramps still hasn't been collected by the time you get to 14 left ramps, don't go for the 15th ramp: either start Mist (it will be easy to relight, since only 1 left ramp will be needed once it ends), or switch your focus to the Coffin to lock 2 balls so that you have 2 different multiballs that are only 1 lock away from starting. As mentioned in the Castle Multiball section, pay attention to the count of your left ramps, separately from the Mist point above.",
      "collect a super jackpot": "as an award from the Mystery at the Tunnel saucer - Castle Multiball works like many other late 80s/early 90s multiballs, most notably Fish Tales. Relock a ball at the left ramp to light the Jackpot for 20 seconds. Jackpot can be collected at the Tunnel saucer, just to the right of the left ramp. ) If three or more balls are in play, you can relock 2 balls at the left ramp; relocking the second ball resets the 20-second timer and increases the jackpot available at the saucer to a Double Jackpot. One would think that if 4 balls were in play, you could relock 3 of them for a triple jackpot chance, but this is not the case.",
      "start 2 multiballs in one game": "Quick strategy synopsis - At the beginning of the game, be sure to collect the first Bats award by making 3 left ramps, then hitting any 15 switches during the time limit. After that, always be in multiball. There are 3 multiballs in the game, with their startups and jackpot shots listed below; if 2 or 3 multiballs are running at the same time, all jackpots in all multiballs will be doubled or tripled respectively, which is where the biggest points lie. Coffin Multiball: make 8 right ramp shots (5 to complete the coffin, then 3 more for the 3 locks).",
      "complete bats mode": "), will put the ball into the shooter lane and start Bats. Bats is a quick hurry-up that lasts about 15 seconds. The hurry-up starts at 50,000,000 and counts down to 2,000,000. The hurry-up is collected by hitting any 15 switches in the game, thus scaring off 15 bats (out lanes count as 3 bats). When you complete a Bats round, the score is not given to you immediately; instead, it is added to your Bats Bonus, which is collected at the end of every ball. If you play and complete Bats more than once, all of the completion values are added together to make the Bats Bonus, with no limit that I've ever seen."
    },
    "creature from the black lagoon": {
      "collect a snack bar award": "Snackbar scoop - If the Snackbar is open, this scoop starts a mystery award, which can light an Extra Ball, award a Special, spot one of the F-I-L-M letters, or give food worth minor points. Shots to the Snackbar after the I in F-I-L-M is lit and the mystery has been redeemed but before multiball is started award Snackbar Score worth 1,100,000 points and increasing by 100,000 each time it is hit. If Snack Attack is started at the right ramp, a hurry-up initially worth 20,000,000 points and decreasing by 100,000 every 1/3 second can be collected at this scoop.",
      "shoot the left ramp 3 times": "Left ramp - During normal single ball gameplay, the left ramp starts or advances the Double Feature Combo. The Double Feature Combo starts at 500,000 points, can be repeatedly doubled up to 1, 2, 4, 8, or 16 million points by comboing the left ramp further, and is collected by shooting the center Move Your Car lane within a few seconds after making the left ramp. If Unlimited Millions is running, the left ramp starts at 3,000,000 points, with its value increasing by an additional 3,000,000 each time it is hit within the 30 second time limit.",
      "light lock for multiball": "Snackbar scoop - Shots to the Snackbar after the I in F-I-L-M is lit and the mystery has been redeemed but before multiball is started award Snackbar Score worth 1,100,000 points and increasing by 100,000 each time it is hit. During multiball, the Snackbar is one of the three locations where the Creature can be hiding. Once the Creature is found, the Girl can be rescued at the Snackbar. Once the Girl is rescued, the Jackpot is scored at the Snackbar. After Jackpot is scored and enough pop bumpers are hit, Super Jackpot is also lit and scored at the Snackbar.",
      "collect a hot shot award": "Center (Move Your Car) lane - In normal gameplay, the center lane counts up toward starting the Move Your Car mode and sends the ball into the Paid lanes. If somehow the ball bounces to the left of the Paid lanes and ends up coming down the left side, a Sneak-In award of 1,000,000 points is given. The DMD will show how many more center shots are required to start Move Your Car. The first Move Your Car takes 5 shots; starting Move Your Car after that requires 8 shots if the center lane was hit at least once in the previous Move Your Car, or 3 shots if not.",
      "lock 1 ball for multiball": "Snackbar scoop - If the Snackbar is not open, hitting this scoop will just make the ball pop out of the return above the right in lane. The Snackbar is lit/opened by hitting the four Snackbar standup targets. A Snackbar target will also be spotted if the player has not collected a Jackpot during the game so far. If the Snackbar is open, this scoop starts a mystery award, which can light an Extra Ball, award a Special, spot one of the F-I-L-M letters, or give food worth minor points. Shots to the Snackbar after the I in F-I-L-M is lit and the mystery has been redeemed but before multiball is started award Snackbar Score worth 1,100,000 points and increasing by 100,000 each time it is hit.",
      "start multiball": "Snackbar scoop - Shots to the Snackbar after the I in F-I-L-M is lit and the mystery has been redeemed but before multiball is started award Snackbar Score worth 1,100,000 points and increasing by 100,000 each time it is hit. During multiball, the Snackbar is one of the three locations where the Creature can be hiding. Once the Creature is found, the Girl can be rescued at the Snackbar. Once the Girl is rescued, the Jackpot is scored at the Snackbar. After Jackpot is scored and enough pop bumpers are hit, Super Jackpot is also lit and scored at the Snackbar.",
      "collect a jackpot": "Pop bumpers - The Jackpot starts at 40,000,000 points, and increases slightly with every pop bumper hit. Collecting a Super Jackpot doubles the value of all regular Jackpots unless the regular Jackpot value is already greater than 500,000,000. Hitting enough pop bumpers also lights the Super Jackpot after the regular Jackpot is collected; the first Super Jackpot is lit by 30 pop bumpers, and each subsequent Super Jackpot takes 30 more pop hits than the previous.",
      "collect 2 snack bar awards in one game": "Snackbar scoop - If Snack Attack is started at the right ramp, a hurry-up initially worth 20,000,000 points and decreasing by 100,000 every 1/3 second can be collected at this scoop. During multiball, the Snackbar is one of the three locations where the Creature can be hiding. Once the Creature is found, the Girl can be rescued at the Snackbar. Once the Girl is rescued, the Jackpot is scored at the Snackbar. After Jackpot is scored and enough pop bumpers are hit, Super Jackpot is also lit and scored at the Snackbar.",
      "lock 2 balls toward multiball": "Snackbar scoop - Shots to the Snackbar after the I in F-I-L-M is lit and the mystery has been redeemed but before multiball is started award Snackbar Score worth 1,100,000 points and increasing by 100,000 each time it is hit. During multiball, the Snackbar is one of the three locations where the Creature can be hiding. Once the Creature is found, the Girl can be rescued at the Snackbar. Once the Girl is rescued, the Jackpot is scored at the Snackbar. After Jackpot is scored and enough pop bumpers are hit, Super Jackpot is also lit and scored at the Snackbar.",
      "start multiball and collect a jackpot": "Snackbar scoop - If the Snackbar is not open, hitting this scoop will just make the ball pop out of the return above the right in lane. The Snackbar is lit/opened by hitting the four Snackbar standup targets. A Snackbar target will also be spotted if the player has not collected a Jackpot during the game so far. Shots to the Snackbar after the I in F-I-L-M is lit and the mystery has been redeemed but before multiball is started award Snackbar Score worth 1,100,000 points and increasing by 100,000 each time it is hit.",
      "collect a super jackpot": "Pop bumpers - The Jackpot starts at 40,000,000 points, and increases slightly with every pop bumper hit. Collecting a Super Jackpot doubles the value of all regular Jackpots unless the regular Jackpot value is already greater than 500,000,000. Hitting enough pop bumpers also lights the Super Jackpot after the regular Jackpot is collected; the first Super Jackpot is lit by 30 pop bumpers, and each subsequent Super Jackpot takes 30 more pop hits than the previous.",
      "start move your car mode": "Center (Move Your Car) lane - In normal gameplay, the center lane counts up toward starting the Move Your Car mode and sends the ball into the Paid lanes. If somehow the ball bounces to the left of the Paid lanes and ends up coming down the left side, a Sneak-In award of 1,000,000 points is given. The DMD will show how many more center shots are required to start Move Your Car. The first Move Your Car takes 5 shots; starting Move Your Car after that requires 8 shots if the center lane was hit at least once in the previous Move Your Car, or 3 shots if not."
    },
    "police force": {
      "jail any criminal": "Jailing Criminals and Jackpot - There are 4 criminals: Loan Shark at the left standup targets, Machine Gun Croc at the back left saucer, Drug Rat at the center drop targets, and Diamond Weasel at the right drop targets. Complete a set of drop targets (or make one shot to the back left saucer via the left lane) to jail that criminal. If lock was not already lit at the right ramp, jailing a criminal will light at least one lock guaranteed. Jailing all 4 criminals in a single ball will light the right ramp for Jackpot for 15 seconds.",
      "complete any drop target bank": "Jailing Criminals and Jackpot - There are 4 criminals: Loan Shark at the left standup targets, Machine Gun Croc at the back left saucer, Drug Rat at the center drop targets, and Diamond Weasel at the right drop targets. Complete a set of drop targets (or make one shot to the back left saucer via the left lane) to jail that criminal. If lock was not already lit at the right ramp, jailing a criminal will light at least one lock guaranteed. Jailing all 4 criminals in a single ball will light the right ramp for Jackpot for 15 seconds.",
      "shoot the center ramp 3 times": "Center ramp - The center ramp can be shot from either flipper, but you must know how to combo it repeatedly from just the right flipper. The ramp starts at 50,000 points; hitting it repeatedly without missing or registering another switch will score 50,000, then 75,000, then 100,000, then 150,000, then unlimited 1,000,000 until you do miss. If you miss before collecting any Millions, the value resets to 50,000. If you do collect any Millions, the ramp value will instead reset to 5,000, and for the rest of the game it will take 8 consecutive ramp shots instead of 5 to reach unlimited millions (5,000 - 10,000 - 20,000 - 50,000 - 75,000 - 100,000 - 150,000 - millions).",
      "light lock for multiball": "Locks and multiball - Lock balls at the right ramp when a green arrow is flashing. If no green arrow is flashing, jail any criminal to light a lock. Lock 2 balls at the right ramp to start multiball. Generally, the two locks for the first multiball are lit for free, but once a multiball is played, jailing a criminal is required to light each lock. There are no multiball-specific scoring features, so use this time to jail more criminals and work toward jackpots with the safety net of a second ball in play. Locks can be stolen in a multiplayer game.",
      "light hotsheet": "Hotsheet - When lit, the saucer in the back left of the game where Croc is jailed includes a mystery award called Hotsheet. Hotsheet is lit by the right in lane and has no time limit that I am aware of. Hotsheet will give one of 5 awards: Hot Score (random points, usually between 50,000 and 250,000), Hot Extra Ball, 5 Free Games, Spot Police Letter, and Hot Multiball. Multiball is only awarded if one ball is locked. I have never actually seen 5 Free Games be awarded.",
      "collect a hotsheet award": "Hotsheet - When lit, the saucer in the back left of the game where Croc is jailed includes a mystery award called Hotsheet. Hotsheet is lit by the right in lane and has no time limit that I am aware of. Hotsheet will give one of 5 awards: Hot Score (random points, usually between 50,000 and 250,000), Hot Extra Ball, 5 Free Games, Spot Police Letter, and Hot Multiball. Multiball is only awarded if one ball is locked. I have never actually seen 5 Free Games be awarded.",
      "lock 1 ball for multiball": "Locks and multiball - Lock balls at the right ramp when a green arrow is flashing. If no green arrow is flashing, jail any criminal to light a lock. Lock 2 balls at the right ramp to start multiball. Generally, the two locks for the first multiball are lit for free, but once a multiball is played, jailing a criminal is required to light each lock. There are no multiball-specific scoring features, so use this time to jail more criminals and work toward jackpots with the safety net of a second ball in play. Locks can be stolen in a multiplayer game.",
      "start multiball": "Locks and multiball - Lock balls at the right ramp when a green arrow is flashing. If no green arrow is flashing, jail any criminal to light a lock. Lock 2 balls at the right ramp to start multiball. Generally, the two locks for the first multiball are lit for free, but once a multiball is played, jailing a criminal is required to light each lock. There are no multiball-specific scoring features, so use this time to jail more criminals and work toward jackpots with the safety net of a second ball in play. Locks can be stolen in a multiplayer game.",
      "collect top cop": "Police letters - There are 3 ways to earn a Police letter: from the 75,000 level of the skill shot, from the Hotsheet, or by shooting the right ramp when it is not lit for any other feature. Collecting 6 letters to spell Police lights the lane that goes to the right of the bumpers for Top Cop, which is always worth 3,000,000 points. Top Cop stays lit until collected or until the ball ends.",
      "collect a jackpot": "Jailing Criminals and Jackpot - There are 4 criminals: Loan Shark at the left standup targets, Machine Gun Croc at the back left saucer, Drug Rat at the center drop targets, and Diamond Weasel at the right drop targets. Complete a set of drop targets (or make one shot to the back left saucer via the left lane) to jail that criminal. If lock was not already lit at the right ramp, jailing a criminal will light at least one lock guaranteed. Jailing all 4 criminals in a single ball will light the right ramp for Jackpot for 15 seconds.",
      "jail all 4 criminals in one ball": "Jailing Criminals and Jackpot - There are 4 criminals: Loan Shark at the left standup targets, Machine Gun Croc at the back left saucer, Drug Rat at the center drop targets, and Diamond Weasel at the right drop targets. Complete a set of drop targets (or make one shot to the back left saucer via the left lane) to jail that criminal. If lock was not already lit at the right ramp, jailing a criminal will light at least one lock guaranteed. Jailing all 4 criminals in a single ball will light the right ramp for Jackpot for 15 seconds.",
      "start multiball and collect a jackpot": "Jailing Criminals and Jackpot - There are 4 criminals: Loan Shark at the left standup targets, Machine Gun Croc at the back left saucer, Drug Rat at the center drop targets, and Diamond Weasel at the right drop targets. Complete a set of drop targets (or make one shot to the back left saucer via the left lane) to jail that criminal. If lock was not already lit at the right ramp, jailing a criminal will light at least one lock guaranteed. Jailing all 4 criminals in a single ball will light the right ramp for Jackpot for 15 seconds.",
      "collect top cop and a jackpot in one game": "Jailing Criminals and Jackpot - There are 4 criminals: Loan Shark at the left standup targets, Machine Gun Croc at the back left saucer, Drug Rat at the center drop targets, and Diamond Weasel at the right drop targets. Complete a set of drop targets (or make one shot to the back left saucer via the left lane) to jail that criminal. If lock was not already lit at the right ramp, jailing a criminal will light at least one lock guaranteed. Jailing all 4 criminals in a single ball will light the right ramp for Jackpot for 15 seconds.",
      "collect 1 000 000 at the center ramp": "Center ramp - The center ramp can be shot from either flipper, but you must know how to combo it repeatedly from just the right flipper. The ramp starts at 50,000 points; hitting it repeatedly without missing or registering another switch will score 50,000, then 75,000, then 100,000, then 150,000, then unlimited 1,000,000 until you do miss. If you miss before collecting any Millions, the value resets to 50,000. If you do collect any Millions, the ramp value will instead reset to 5,000, and for the rest of the game it will take 8 consecutive ramp shots instead of 5 to reach unlimited millions (5,000 - 10,000 - 20,000 - 50,000 - 75,000 - 100,000 - 150,000 - millions).",
      "complete take the highest score": "Take the Highest Score - On the final ball of the game, you are offered the chance to Take the Highest Score at the right ramp. This feature overrides locks or multiball at the ramp, but Jackpot and Police letters can be lit alongside Take the Highest Score. In Take the Highest Score, you are given one attempt to shoot the ramp a consecutive number of times, which can be anywhere between 2 and 8. As soon as you make one full ramp shot, Take the Highest Score begins, and you must continue shoot the ramp consecutively the number of times shown on the display."
    },
    "batman forever": {
      "start any movie mode": "Gotham Events: modes - There are 7 Gotham modes to play. Each bumper hit rotates the flashing mode. Shoot the right orbit when lit to start the flashing mode. If the right orbit is not lit, light it by hitting the 5 ? standup targets throughout the game- one on each side of the left ramp, and three that surround the up-kicker and the right ramp. Pressing the gun trigger ball launcher during gameplay will freeze or unfreeze the mode select; when frozen, bumpers will not rotate the flashing mode. The 7 modes are: Rooftop Chase: a video mode.",
      "light a batcave award": "Bonus and bonus multiplier - Bonus is calculated as 500,000 points times the number of ramp shots on the current ball, plus 2,000,000 points times the number of Cannon shots on the current ball, plus 3,000,000 times the number of Gotham Events completed in the game so far, all multiplied by the bonus multiplier. All components of the bonus calculation except for the number of Events played reset between balls unless the Hold Bonus award was collected by making a Good Face Match. Bonus multiplier is advanced by B-A-T lane completions in the order of 2x-4x-6x-8x-10x, or the bonus multiplier can be overloaded to 20x from a Mr.",
      "complete one riddler target bank": "Two-Face Coin targets - Shoot a flashing Two-Face target to lock in the Good or Bad Face at that bank. Lock in a face at both banks (center and lower right) to receive an award. Matching the Good Faces awards Hold Bonus. Matching the Bad Faces scores 22,000,000 points. Matching one Good Face and one Bad Face scores just 2,000,000 points. Making a match that has already been made relights the left kickback, or awards 10,000,000 points if the kickback was light. Making a Good Face Match and making a Bad Face Match are both requirements for starting Forever wizard mode.",
      "shoot either ramp 3 times": "Multiball - To lock a ball, complete the Cave drop targets in the lower left of the game, then shoot the up-kicker between the right ramp and the back center ramp. Balls can also be locked for free with the respective skill shot award. Lock 3 balls to start Multiball. For the first multiball, completing Cave once will light all three locks; for the second multiball, Cave lights locks 1+2 the first time, and lock 3 the second time; for the third multiball and onward, Cave is needed to light each individual lock. Multiball stage 1: Save Chase and Robin.",
      "light lock for multiball": "Multiball - To lock a ball, complete the Cave drop targets in the lower left of the game, then shoot the up-kicker between the right ramp and the back center ramp. Balls can also be locked for free with the respective skill shot award. Lock 3 balls to start Multiball. For the first multiball, completing Cave once will light all three locks; for the second multiball, Cave lights locks 1+2 the first time, and lock 3 the second time; for the third multiball and onward, Cave is needed to light each individual lock. Multiball stage 1: Save Chase and Robin.",
      "collect a batcave award": "Bonus and bonus multiplier - Bonus is calculated as 500,000 points times the number of ramp shots on the current ball, plus 2,000,000 points times the number of Cannon shots on the current ball, plus 3,000,000 times the number of Gotham Events completed in the game so far, all multiplied by the bonus multiplier. All components of the bonus calculation except for the number of Events played reset between balls unless the Hold Bonus award was collected by making a Good Face Match. Bonus multiplier is advanced by B-A-T lane completions in the order of 2x-4x-6x-8x-10x, or the bonus multiplier can be overloaded to 20x from a Mr.",
      "complete any movie mode": "Gotham Events: modes - There are 7 Gotham modes to play. Each bumper hit rotates the flashing mode. Shoot the right orbit when lit to start the flashing mode. If the right orbit is not lit, light it by hitting the 5 ? standup targets throughout the game- one on each side of the left ramp, and three that surround the up-kicker and the right ramp. Pressing the gun trigger ball launcher during gameplay will freeze or unfreeze the mode select; when frozen, bumpers will not rotate the flashing mode. The 7 modes are: Rooftop Chase: a video mode.",
      "lock 1 ball for multiball": "Multiball - To lock a ball, complete the Cave drop targets in the lower left of the game, then shoot the up-kicker between the right ramp and the back center ramp. Balls can also be locked for free with the respective skill shot award. Lock 3 balls to start Multiball. For the first multiball, completing Cave once will light all three locks; for the second multiball, Cave lights locks 1+2 the first time, and lock 3 the second time; for the third multiball and onward, Cave is needed to light each individual lock. Multiball stage 1: Save Chase and Robin.",
      "start multiball": "Multiball - To lock a ball, complete the Cave drop targets in the lower left of the game, then shoot the up-kicker between the right ramp and the back center ramp. Balls can also be locked for free with the respective skill shot award. Lock 3 balls to start Multiball. For the first multiball, completing Cave once will light all three locks; for the second multiball, Cave lights locks 1+2 the first time, and lock 3 the second time; for the third multiball and onward, Cave is needed to light each individual lock. Multiball stage 1: Save Chase and Robin.",
      "collect a jackpot": "Multiball - Multiball stage 1: Save Chase and Robin. The left and right ramps are each lit for their own jackpot. The ramp jackpot starts at 50,000,000 points. The two jackpots can individually be raised by hitting the ? targets on either side of their ramps. Make both ramp jackpots to advance. Multiball Stage 3: Batwing Super Jackpot. Shoot the left ramp to load the Batwing, then fire the ball from the Batwing to the back center ramp for a 250,000,000 point Super Jackpot. If you miss, you may get one or two chances to reload the Batwing and try again.",
      "lock 2 balls toward multiball": "Multiball - To lock a ball, complete the Cave drop targets in the lower left of the game, then shoot the up-kicker between the right ramp and the back center ramp. Balls can also be locked for free with the respective skill shot award. Lock 3 balls to start Multiball. For the first multiball, completing Cave once will light all three locks; for the second multiball, Cave lights locks 1+2 the first time, and lock 3 the second time; for the third multiball and onward, Cave is needed to light each individual lock. Multiball stage 1: Save Chase and Robin.",
      "start multiball and collect a jackpot": "Multiball - To lock a ball, complete the Cave drop targets in the lower left of the game, then shoot the up-kicker between the right ramp and the back center ramp. Balls can also be locked for free with the respective skill shot award. Lock 3 balls to start Multiball. For the first multiball, completing Cave once will light all three locks; for the second multiball, Cave lights locks 1+2 the first time, and lock 3 the second time; for the third multiball and onward, Cave is needed to light each individual lock. Multiball stage 1: Save Chase and Robin.",
      "complete 2 movie modes in one game": "Gotham Events: modes - There are 7 Gotham modes to play. Each bumper hit rotates the flashing mode. Shoot the right orbit when lit to start the flashing mode. If the right orbit is not lit, light it by hitting the 5 ? standup targets throughout the game- one on each side of the left ramp, and three that surround the up-kicker and the right ramp. Pressing the gun trigger ball launcher during gameplay will freeze or unfreeze the mode select; when frozen, bumpers will not rotate the flashing mode. The 7 modes are: Rooftop Chase: a video mode.",
      "spell batman once": "Batman (Data East, mini-DMD, 1991) - based on the 1989 film - Batman (Stern, DMD, 2008) - based on the film called, and commonly referred to as, Batman: The Dark Knight Batman (Stern, LCD, 2016) - based on the 1966-68 TV series and commonly referred to as Batman '66",
      "collect a super jackpot": "Multiball - Multiball stage 1: Save Chase and Robin. The left and right ramps are each lit for their own jackpot. The ramp jackpot starts at 50,000,000 points. The two jackpots can individually be raised by hitting the ? targets on either side of their ramps. Make both ramp jackpots to advance. Multiball Stage 3: Batwing Super Jackpot. Shoot the left ramp to load the Batwing, then fire the ball from the Batwing to the back center ramp for a 250,000,000 point Super Jackpot. If you miss, you may get one or two chances to reload the Batwing and try again."
    },
    "demolition man": {
      "collect a quick freeze award": "Freezes and multiballs - To light multiballs, you need to collect Freezes, which are basically what this game calls Locks. There are two ways to make freezes: Quick Freeze and Cryo-Claw. To use the Cryo-Claw, first complete the M-T-L top lanes. The easiest way to make it up to the top lanes is via the center shot. Lit M-T-L lanes can be rotated via lane change with either flipper. Completing M-T-L lights the left in lane for Light Cryo-Claw; make the left lane to qualify the Claw at the right ramp. The right ramp shot will trap the ball in the claw in the back left of the game.",
      "light the cryo claw": "Freezes and multiballs - To light multiballs, you need to collect Freezes, which are basically what this game calls Locks. There are two ways to make freezes: Quick Freeze and Cryo-Claw. To use the Cryo-Claw, first complete the M-T-L top lanes. The easiest way to make it up to the top lanes is via the center shot. Lit M-T-L lanes can be rotated via lane change with either flipper. Completing M-T-L lights the left in lane for Light Cryo-Claw; make the left lane to qualify the Claw at the right ramp. The right ramp shot will trap the ball in the claw in the back left of the game.",
      "complete one standup target bank": "Collect Bonus: self explanatory - Collect Standups: awards the value of all lit yellow standup targets and lights the right in lane for Light Quick Freeze",
      "shoot the left ramp 3 times": "Freezes and multiballs - To use the Cryo-Claw, first complete the M-T-L top lanes. The easiest way to make it up to the top lanes is via the center shot. Lit M-T-L lanes can be rotated via lane change with either flipper. Completing M-T-L lights the left in lane for Light Cryo-Claw; make the left lane to qualify the Claw at the right ramp. The right ramp shot will trap the ball in the claw in the back left of the game. Use the triggers on the gun-handles attached to the game to move the Claw, and the button on top to drop the ball.",
      "light lock for multiball": "Freezes and multiballs - To use the Cryo-Claw, first complete the M-T-L top lanes. The easiest way to make it up to the top lanes is via the center shot. Lit M-T-L lanes can be rotated via lane change with either flipper. Completing M-T-L lights the left in lane for Light Cryo-Claw; make the left lane to qualify the Claw at the right ramp. The right ramp shot will trap the ball in the claw in the back left of the game. Use the triggers on the gun-handles attached to the game to move the Claw, and the button on top to drop the ball.",
      "collect a cryo claw award": "The 5 Claw mode awards are: - Start Acmag: shoot the center lane repeatedly to score an award that constantly increases. Over about 20 seconds, the value of the center lane will rise from 5,000,000 to 12,500,000, which can be increased further to 13,500,000 after the first center lane shot. Lock Freeze: discussed in detail in the Freezes and multiball section. Prison Break: an award of 15,000,000 points is offered and the ball is put on the upper left flipper. You get one to chance to shoot the Computer or the side ramp to double or triple that value.",
      "complete any mode": "The 5 Claw mode awards are: - Start Acmag: shoot the center lane repeatedly to score an award that constantly increases. Over about 20 seconds, the value of the center lane will rise from 5,000,000 to 12,500,000, which can be increased further to 13,500,000 after the first center lane shot. Lock Freeze: discussed in detail in the Freezes and multiball section. Prison Break: an award of 15,000,000 points is offered and the ball is put on the upper left flipper. You get one to chance to shoot the Computer or the side ramp to double or triple that value.",
      "lock 1 ball for multiball": "Freezes and multiballs - To use the Cryo-Claw, first complete the M-T-L top lanes. The easiest way to make it up to the top lanes is via the center shot. Lit M-T-L lanes can be rotated via lane change with either flipper. Completing M-T-L lights the left in lane for Light Cryo-Claw; make the left lane to qualify the Claw at the right ramp. The right ramp shot will trap the ball in the claw in the back left of the game. Use the triggers on the gun-handles attached to the game to move the Claw, and the button on top to drop the ball.",
      "start multiball": "Freezes and multiballs - To use the Cryo-Claw, first complete the M-T-L top lanes. The easiest way to make it up to the top lanes is via the center shot. Lit M-T-L lanes can be rotated via lane change with either flipper. Completing M-T-L lights the left in lane for Light Cryo-Claw; make the left lane to qualify the Claw at the right ramp. The right ramp shot will trap the ball in the claw in the back left of the game. Use the triggers on the gun-handles attached to the game to move the Claw, and the button on top to drop the ball.",
      "collect a jackpot": "Freezes and multiballs - There are 4 multiballs in Demolition Man. They are always played in the order listed below. Each multiball has a minimum number of Freezes required to light and start it. However, by taking more Quick Freezes, you can start a multiball with more than the minimum number of balls, up to a maximum of 5. Going beyond the requirements in this way means the base jackpot value for that multiball will be higher once you do start it. Once a multiball is ready, start it by shooting the left orbit (or, alternatively, getting lucky with a strong center lane shot that bounces into the top saucer).",
      "lock 2 balls toward multiball": "Freezes and multiballs - To use the Cryo-Claw, first complete the M-T-L top lanes. The easiest way to make it up to the top lanes is via the center shot. Lit M-T-L lanes can be rotated via lane change with either flipper. Completing M-T-L lights the left in lane for Light Cryo-Claw; make the left lane to qualify the Claw at the right ramp. The right ramp shot will trap the ball in the claw in the back left of the game. Use the triggers on the gun-handles attached to the game to move the Claw, and the button on top to drop the ball.",
      "start multiball and collect a jackpot": "Freezes and multiballs - To use the Cryo-Claw, first complete the M-T-L top lanes. The easiest way to make it up to the top lanes is via the center shot. Lit M-T-L lanes can be rotated via lane change with either flipper. Completing M-T-L lights the left in lane for Light Cryo-Claw; make the left lane to qualify the Claw at the right ramp. The right ramp shot will trap the ball in the claw in the back left of the game. Use the triggers on the gun-handles attached to the game to move the Claw, and the button on top to drop the ball.",
      "collect a super jackpot": "Freezes and multiballs - There are 4 multiballs in Demolition Man. They are always played in the order listed below. Each multiball has a minimum number of Freezes required to light and start it. However, by taking more Quick Freezes, you can start a multiball with more than the minimum number of balls, up to a maximum of 5. Going beyond the requirements in this way means the base jackpot value for that multiball will be higher once you do start it. Once a multiball is ready, start it by shooting the left orbit (or, alternatively, getting lucky with a strong center lane shot that bounces into the top saucer).",
      "complete 2 modes in one game": "Claw modes - The Claw was discussed a bit in the Multiball section above in relation to Lock Freeze. This section discusses the other four Cryo-Claw mode possibilities.",
      "collect 2 cryo claw awards in one game": "The 5 Claw mode awards are: - Start Acmag: shoot the center lane repeatedly to score an award that constantly increases. Over about 20 seconds, the value of the center lane will rise from 5,000,000 to 12,500,000, which can be increased further to 13,500,000 after the first center lane shot. Lock Freeze: discussed in detail in the Freezes and multiball section. Prison Break: an award of 15,000,000 points is offered and the ball is put on the upper left flipper. You get one to chance to shoot the Computer or the side ramp to double or triple that value."
    },
    "goldeneye": {
      "start any encounter mode": "007 Encounters: main modes - In single ball play when no other mode is running, the center scoop starts the currently flashing Encounter mode. Bumpers rotate which Encounter is flashing. Once an Encounter is played, it cannot be replayed that game unless you progress all the way to GoldenEye Multiball wizard mode. The five modes are: Nerve Gas Plant: 30-second mode. Shoot the six green Guard targets. The first scores 25,000,000, the second scores 20,000,000, all others score 15,000,000 each. After making all 6, shoot the center ramp for 30,000,000 points and to finish the mode.",
      "complete one q s pen target bank": "Q's Pen - The two standup targets in the lower right of the game belong to Q. Hitting either of these targets a total of 3 times scores 10,000,000 points and starts the Q's Grenade Pen minor mode. You have 15 seconds to hit either of these target 3 more times, scoring 20,000,000 each. If you hit a Q target with less than 5 seconds on the clock, 5 seconds will be added to the remaining mode timer. Completing- not just starting- a Q's Grenade Pen mode is one of the requirements for qualifying wizard mode, and it is by far the hardest.",
      "start a shootout": "Shootout and Eject or Die - In the lower left of the game is a bank of 4 standup targets: three white, one yellow. Hit the three white targets to light the yellow target for Shootout. You have a few seconds to reach for the physical gun trigger on the game and pull the trigger 6 times to defeat 3 bad guys. If you succeed, you score 30,000,000 points and Eject or Die is lit on the out lanes. Winning one Shootout is one of the requirements toward qualifying wizard mode. Eject or Die is a last chance feature lit at the out lanes.",
      "shoot the satellite ramp 3 times": "GoldenEye backglass letters and GoldenEye Ramps mode - To collect GoldenEye letters on the backglass, shoot multiple ramps consecutively as a combo. For the first spelling, making a single shot to a ramp will give a letter, but for subsequent spellings, only the second consecutive ramp and onward give letters. When you spell GoldenEye, the GoldenEye Ramps mode immediately begins, and you get 10,000,000 points. There are two phases to GoldenEye Ramps. The first is almost identical to Guard Millions from Baywatch: the game's three ramps are lit for a 50,000,000 point jackpot, which decreases by 1,000,000 per second, timing out after reaching 20,000,000.",
      "light lock for multiball": "Locks and multiballs - Shoot the standup target in the back center of the table to light a lock. For the first and second multiball of the game, just one hit to this target is needed per lock, but this increases by one hit per lock after every two plays of multiball. Locks are collected at the center ramp and are entirely virtual. Locks cannot be stacked, so be sure to pick up lock 1 before you try to light lock 2. After locking 2 balls, both of the game's main multiballs are available: Tank Multiball and Satellite Multiball.",
      "complete any encounter mode": "007 Encounters: main modes - In single ball play when no other mode is running, the center scoop starts the currently flashing Encounter mode. Bumpers rotate which Encounter is flashing. Once an Encounter is played, it cannot be replayed that game unless you progress all the way to GoldenEye Multiball wizard mode. The five modes are: Nerve Gas Plant: 30-second mode. Shoot the six green Guard targets. The first scores 25,000,000, the second scores 20,000,000, all others score 15,000,000 each. After making all 6, shoot the center ramp for 30,000,000 points and to finish the mode.",
      "complete a shootout": "Shootout and Eject or Die - In the lower left of the game is a bank of 4 standup targets: three white, one yellow. Hit the three white targets to light the yellow target for Shootout. You have a few seconds to reach for the physical gun trigger on the game and pull the trigger 6 times to defeat 3 bad guys. If you succeed, you score 30,000,000 points and Eject or Die is lit on the out lanes. Winning one Shootout is one of the requirements toward qualifying wizard mode. Eject or Die is a last chance feature lit at the out lanes.",
      "lock 1 ball for multiball": "Locks and multiballs - Shoot the standup target in the back center of the table to light a lock. For the first and second multiball of the game, just one hit to this target is needed per lock, but this increases by one hit per lock after every two plays of multiball. Locks are collected at the center ramp and are entirely virtual. Locks cannot be stacked, so be sure to pick up lock 1 before you try to light lock 2. After locking 2 balls, both of the game's main multiballs are available: Tank Multiball and Satellite Multiball.",
      "start multiball": "Locks and multiballs - Shoot the standup target in the back center of the table to light a lock. For the first and second multiball of the game, just one hit to this target is needed per lock, but this increases by one hit per lock after every two plays of multiball. Locks are collected at the center ramp and are entirely virtual. Locks cannot be stacked, so be sure to pick up lock 1 before you try to light lock 2. After locking 2 balls, both of the game's main multiballs are available: Tank Multiball and Satellite Multiball.",
      "collect a jackpot": "Locks and multiballs - To start Tank Multiball, shoot the right ramp or the center scoop after making 2 locks. If you start Tank Multiball on accident but would still like to play Satellite Multiball instead, you can pull the gun trigger on the game to abort the Tank Multiball start. Tank Multiball is a 3-ball multiball. Jackpots are flashing at all three ramps as well as the mode start scoop between the center ramp and the center standup target. At the beginning of multiball, all jackpots score a measly 10,000,000 points.",
      "complete q s pen mode": "007 Encounters: main modes - In single ball play when no other mode is running, the center scoop starts the currently flashing Encounter mode. Bumpers rotate which Encounter is flashing. Once an Encounter is played, it cannot be replayed that game unless you progress all the way to GoldenEye Multiball wizard mode. The five modes are: Nerve Gas Plant: 30-second mode. Shoot the six green Guard targets. The first scores 25,000,000, the second scores 20,000,000, all others score 15,000,000 each. After making all 6, shoot the center ramp for 30,000,000 points and to finish the mode.",
      "start satellite multiball": "Locks and multiballs - Shoot the standup target in the back center of the table to light a lock. For the first and second multiball of the game, just one hit to this target is needed per lock, but this increases by one hit per lock after every two plays of multiball. Locks are collected at the center ramp and are entirely virtual. Locks cannot be stacked, so be sure to pick up lock 1 before you try to light lock 2. After locking 2 balls, both of the game's main multiballs are available: Tank Multiball and Satellite Multiball.",
      "start multiball and collect a jackpot": "Locks and multiballs - Shoot the standup target in the back center of the table to light a lock. For the first and second multiball of the game, just one hit to this target is needed per lock, but this increases by one hit per lock after every two plays of multiball. Locks are collected at the center ramp and are entirely virtual. Locks cannot be stacked, so be sure to pick up lock 1 before you try to light lock 2. After locking 2 balls, both of the game's main multiballs are available: Tank Multiball and Satellite Multiball.",
      "complete 2 encounter modes in one game": "007 Encounters: main modes - In single ball play when no other mode is running, the center scoop starts the currently flashing Encounter mode. Bumpers rotate which Encounter is flashing. Once an Encounter is played, it cannot be replayed that game unless you progress all the way to GoldenEye Multiball wizard mode. The five modes are: Xenia Extra Ball: shoot the center standup target within 15 seconds for an extra ball. Satellite Hurry-up: a hurry-up worth 90,000,000 points begins, and can only be collected by sticking a ball to the Satellite.",
      "qualify goldeneye multiball": "Locks and multiballs - Shoot the standup target in the back center of the table to light a lock. For the first and second multiball of the game, just one hit to this target is needed per lock, but this increases by one hit per lock after every two plays of multiball. Locks are collected at the center ramp and are entirely virtual. Locks cannot be stacked, so be sure to pick up lock 1 before you try to light lock 2. After locking 2 balls, both of the game's main multiballs are available: Tank Multiball and Satellite Multiball."
    },
    "jurassic park": {
      "start any control room mode": "Control Room modes, including System Failure wizard mode - Modes are started by shooting the Control Room saucer, labelled with the letter A and positioned in roughly the same place as the Electric Chair on Addams Family, when it is lit. Shooting the Power Shed scoop in the upper right lights the Control Room solidly, and it will stay lit until collected. If System Failure wizard mode has not yet been played, the Control Room can also be lit temporarily (about 5 seconds) by rolling through either in lane. For the first set of Control Room modes, you can easily relight and start modes by shooting the right ramp, immediately followed by a very early left flipper shot that backhands the ball into the Control Room.",
      "hit the t rex once": "T-Rex Bounty - When the T-Rex is not lit for anything else, shooting the saucer in front of the T-Rex awards a letter in T-Rex, as indicated on the game apron near the left flipper. Spell T-Rex to earn the T-Rex Bounty, a minor progressive jackpot that seems to start at around 8,000,000 points, increase by about 250,000 points per right ramp shot, reset when collected, and build up across players and games.",
      "complete one dinosaur target bank": "Bottom of the table - Jurassic Park has a conventional in/out lane setup. The left in lane lights the Boat Dock to spot a dinosaur target toward Tri-Ball. The right in lane lights the Bunker scoop to score Park Revenue and lights the left orbit shot through the bumpers to advance the bonus multiplier. Both in lanes temporarily light the Control Room scoop to start a mode, but only if the current player has not played System Failure in this game already. Out lanes deactivate the Smart Missile and can be lit for Special by random Egg Hatch and Mr.",
      "light tri ball": "Tri-Ball standard multiball - Dual Jackpots. There is a ball save at the start of this step. The right ramp is lit for a jackpot that starts at 15,000,000 points, and the upper loop is lit for a jackpot that starts at 30,000,000 points. Hitting any switch in the game adds the value of that switch to both jackpots. Collecting a jackpot unlights it. The Smart Missile will only collect the upper loop's jackpot for you; you still need to get the right ramp jackpot on your own. Spell Chaos. After collecting either one of the two Dual Jackpots, the letters in Chaos start to flash.",
      "collect park revenue at the bunker": "Park Revenue - Park Revenue starts at 500,000 points and increases by 30,000 with each pop bumper hit. Collect the Park Revenue value by shooting the lower left Bunker scoop immediately after rolling through the right in lane.",
      "complete any control room mode": "Control Room modes, including System Failure wizard mode - Modes are started by shooting the Control Room saucer, labelled with the letter A and positioned in roughly the same place as the Electric Chair on Addams Family, when it is lit. Shooting the Power Shed scoop in the upper right lights the Control Room solidly, and it will stay lit until collected. If System Failure wizard mode has not yet been played, the Control Room can also be lit temporarily (about 5 seconds) by rolling through either in lane. For the first set of Control Room modes, you can easily relight and start modes by shooting the right ramp, immediately followed by a very early left flipper shot that backhands the ball into the Control Room.",
      "shoot the t rex 3 times": "T-Rex Bounty - When the T-Rex is not lit for anything else, shooting the saucer in front of the T-Rex awards a letter in T-Rex, as indicated on the game apron near the left flipper. Spell T-Rex to earn the T-Rex Bounty, a minor progressive jackpot that seems to start at around 8,000,000 points, increase by about 250,000 points per right ramp shot, reset when collected, and build up across players and games.",
      "start tri ball": "Tri-Ball standard multiball - Dual Jackpots. There is a ball save at the start of this step. The right ramp is lit for a jackpot that starts at 15,000,000 points, and the upper loop is lit for a jackpot that starts at 30,000,000 points. Hitting any switch in the game adds the value of that switch to both jackpots. Collecting a jackpot unlights it. The Smart Missile will only collect the upper loop's jackpot for you; you still need to get the right ramp jackpot on your own. Spell Chaos. After collecting either one of the two Dual Jackpots, the letters in Chaos start to flash.",
      "collect a jackpot in tri ball": "Tri-Ball standard multiball - Dual Jackpots. There is a ball save at the start of this step. The right ramp is lit for a jackpot that starts at 15,000,000 points, and the upper loop is lit for a jackpot that starts at 30,000,000 points. Hitting any switch in the game adds the value of that switch to both jackpots. Collecting a jackpot unlights it. The Smart Missile will only collect the upper loop's jackpot for you; you still need to get the right ramp jackpot on your own. Spell Chaos. After collecting either one of the two Dual Jackpots, the letters in Chaos start to flash.",
      "complete 2 control room modes in one game": "Control Room modes, including System Failure wizard mode - Modes are started by shooting the Control Room saucer, labelled with the letter A and positioned in roughly the same place as the Electric Chair on Addams Family, when it is lit. Shooting the Power Shed scoop in the upper right lights the Control Room solidly, and it will stay lit until collected. If System Failure wizard mode has not yet been played, the Control Room can also be lit temporarily (about 5 seconds) by rolling through either in lane. For the first set of Control Room modes, you can easily relight and start modes by shooting the right ramp, immediately followed by a very early left flipper shot that backhands the ball into the Control Room.",
      "start tri ball and collect a jackpot": "Tri-Ball standard multiball - Dual Jackpots. There is a ball save at the start of this step. The right ramp is lit for a jackpot that starts at 15,000,000 points, and the upper loop is lit for a jackpot that starts at 30,000,000 points. Hitting any switch in the game adds the value of that switch to both jackpots. Collecting a jackpot unlights it. The Smart Missile will only collect the upper loop's jackpot for you; you still need to get the right ramp jackpot on your own. Spell Chaos. After collecting either one of the two Dual Jackpots, the letters in Chaos start to flash.",
      "start chaos multiball": "Tri-Ball standard multiball - Dual Jackpots. There is a ball save at the start of this step. The right ramp is lit for a jackpot that starts at 15,000,000 points, and the upper loop is lit for a jackpot that starts at 30,000,000 points. Hitting any switch in the game adds the value of that switch to both jackpots. Collecting a jackpot unlights it. The Smart Missile will only collect the upper loop's jackpot for you; you still need to get the right ramp jackpot on your own. Spell Chaos. After collecting either one of the two Dual Jackpots, the letters in Chaos start to flash.",
      "complete system failure": "Control Room modes, including System Failure wizard mode - Modes are started by shooting the Control Room saucer, labelled with the letter A and positioned in roughly the same place as the Electric Chair on Addams Family, when it is lit. Shooting the Power Shed scoop in the upper right lights the Control Room solidly, and it will stay lit until collected. If System Failure wizard mode has not yet been played, the Control Room can also be lit temporarily (about 5 seconds) by rolling through either in lane. For the first set of Control Room modes, you can easily relight and start modes by shooting the right ramp, immediately followed by a very early left flipper shot that backhands the ball into the Control Room.",
      "complete 3 control room modes in one game": "Control Room modes, including System Failure wizard mode - Modes are started by shooting the Control Room saucer, labelled with the letter A and positioned in roughly the same place as the Electric Chair on Addams Family, when it is lit. Shooting the Power Shed scoop in the upper right lights the Control Room solidly, and it will stay lit until collected. If System Failure wizard mode has not yet been played, the Control Room can also be lit temporarily (about 5 seconds) by rolling through either in lane. For the first set of Control Room modes, you can easily relight and start modes by shooting the right ramp, immediately followed by a very early left flipper shot that backhands the ball into the Control Room.",
      "collect a chaos jackpot": "Tri-Ball standard multiball - Dual Jackpots. There is a ball save at the start of this step. The right ramp is lit for a jackpot that starts at 15,000,000 points, and the upper loop is lit for a jackpot that starts at 30,000,000 points. Hitting any switch in the game adds the value of that switch to both jackpots. Collecting a jackpot unlights it. The Smart Missile will only collect the upper loop's jackpot for you; you still need to get the right ramp jackpot on your own. Spell Chaos. After collecting either one of the two Dual Jackpots, the letters in Chaos start to flash."
    },
    "last action hero": {
      "start any feature mode": "Dynamite Features, including LAH 6-Ball mini-wizard mode and World Premiere wizard mode - Dynamite Features are this game's modes, and are started when the center scoop (labelled M-Ball in front of it, because regular multiball is also started here) is lit with a yellow light above it. Shooting the left ramp lights the scoop solidly. Making either in lane lights the scoop very temporarily (only about 2 seconds). In general, Dynamite Feature modes can be stacked, but the mode start scoop will never light yellow if any multiball is running, regardless of whether it's a Feature multiball or part of the M-Ball sequence.",
      "complete one captive ball award": "Dynamite Features, including LAH 6-Ball mini-wizard mode and World Premiere wizard mode - Dynamite Features are this game's modes, and are started when the center scoop (labelled M-Ball in front of it, because regular multiball is also started here) is lit with a yellow light above it. Shooting the left ramp lights the scoop solidly. Making either in lane lights the scoop very temporarily (only about 2 seconds). In general, Dynamite Feature modes can be stacked, but the mode start scoop will never light yellow if any multiball is running, regardless of whether it's a Feature multiball or part of the M-Ball sequence.",
      "light lock for multiball": "Locks and multiball - Hitting either captive ball a certain number of times lights the mode start scoop for M-Ball. The number of hits required is 8 for the first multiball and increases by 4 for each subsequent multiball. You can score 2 hits toward M-Ball with a single shot by hitting a captive ball within about 2 seconds of rolling through an in lane. You can also score 4 hits toward M-Ball with a single shot by making a Crane lane -> ramp -> ramp -> right captive ball 4-way combo. The captive balls cannot be used to advance toward M-Ball if Go to the Movies is running.",
      "collect a ramp hurry up": "Dynamite Features, including LAH 6-Ball mini-wizard mode and World Premiere wizard mode - Dynamite Features are this game's modes, and are started when the center scoop (labelled M-Ball in front of it, because regular multiball is also started here) is lit with a yellow light above it. Shooting the left ramp lights the scoop solidly. Making either in lane lights the scoop very temporarily (only about 2 seconds). In general, Dynamite Feature modes can be stacked, but the mode start scoop will never light yellow if any multiball is running, regardless of whether it's a Feature multiball or part of the M-Ball sequence.",
      "shoot the spinner 20 times": "Dynamite Features, including LAH 6-Ball mini-wizard mode and World Premiere wizard mode - With the exception of Light Extra Ball, all modes have a completion criterium that affects the value of LAH 6-Ball mini-wizard mode and World Premiere wizard mode. These will be listed alongside each mode. During most Dynamite Features, making the left in lane then shooting the lower right scoop within about 5 seconds will score Wildcard, which doubles all scoring for that mode. In any mode with a timer, the left captive ball will reset the mode timer back to 20 seconds one time.",
      "complete any feature mode": "Dynamite Features, including LAH 6-Ball mini-wizard mode and World Premiere wizard mode - Dynamite Features are this game's modes, and are started when the center scoop (labelled M-Ball in front of it, because regular multiball is also started here) is lit with a yellow light above it. Shooting the left ramp lights the scoop solidly. Making either in lane lights the scoop very temporarily (only about 2 seconds). In general, Dynamite Feature modes can be stacked, but the mode start scoop will never light yellow if any multiball is running, regardless of whether it's a Feature multiball or part of the M-Ball sequence.",
      "lock 1 ball for multiball": "Dynamite Features, including LAH 6-Ball mini-wizard mode and World Premiere wizard mode - Dynamite Features are this game's modes, and are started when the center scoop (labelled M-Ball in front of it, because regular multiball is also started here) is lit with a yellow light above it. Shooting the left ramp lights the scoop solidly. Making either in lane lights the scoop very temporarily (only about 2 seconds). In general, Dynamite Feature modes can be stacked, but the mode start scoop will never light yellow if any multiball is running, regardless of whether it's a Feature multiball or part of the M-Ball sequence.",
      "start multiball": "Locks and multiball - Hitting either captive ball a certain number of times lights the mode start scoop for M-Ball. The number of hits required is 8 for the first multiball and increases by 4 for each subsequent multiball. You can score 2 hits toward M-Ball with a single shot by hitting a captive ball within about 2 seconds of rolling through an in lane. You can also score 4 hits toward M-Ball with a single shot by making a Crane lane -> ramp -> ramp -> right captive ball 4-way combo. The captive balls cannot be used to advance toward M-Ball if Go to the Movies is running.",
      "collect a jackpot": "Locks and multiball - M-Ball starts with a jackpot of 15,000,000, 20,000,000, or 25,000,000 depending on if zero, one, or two balls were locked in the Crane. All switches in the game add to the jackpot, usually between 50,000 and 250,000 at a time. Jackpot 1 is collected at the ramp. If Jackpot 1 is not lit to start, shoot the Crane lane to light it. Jackpot 2 is a double jackpot that must be collected at the Crane lane within 10 seconds of scoring Jackpot 1. If you do not collect Jackpot 2 in time, you must recollect Jackpot 1 for another chance.",
      "collect one last action hero word": "Dynamite Features, including LAH 6-Ball mini-wizard mode and World Premiere wizard mode - Find Benedict: a 20-second mode. Benedict is hiding in one of the game's three scoops: the mode start scoop, the Chicken scoop, or the lower right scoop. Which one he is hiding in is random; it will not always be the last one you try. Find Benedict to score 30,000,000 points and complete the mode. If the lower right scoop is not lit for anything else, shooting it when no mode or multiball is running will change the currently flashing mode to one of the words in Last Action Hero that you still need, to help make progress toward LAH 6-Ball.",
      "start lah 6 ball": "Dynamite Features, including LAH 6-Ball mini-wizard mode and World Premiere wizard mode - Dynamite Features are this game's modes, and are started when the center scoop (labelled M-Ball in front of it, because regular multiball is also started here) is lit with a yellow light above it. Shooting the left ramp lights the scoop solidly. Making either in lane lights the scoop very temporarily (only about 2 seconds). In general, Dynamite Feature modes can be stacked, but the mode start scoop will never light yellow if any multiball is running, regardless of whether it's a Feature multiball or part of the M-Ball sequence.",
      "start multiball and collect a jackpot": "Locks and multiball - Hitting either captive ball a certain number of times lights the mode start scoop for M-Ball. The number of hits required is 8 for the first multiball and increases by 4 for each subsequent multiball. You can score 2 hits toward M-Ball with a single shot by hitting a captive ball within about 2 seconds of rolling through an in lane. You can also score 4 hits toward M-Ball with a single shot by making a Crane lane -> ramp -> ramp -> right captive ball 4-way combo. The captive balls cannot be used to advance toward M-Ball if Go to the Movies is running.",
      "complete 2 feature modes in one game": "Dynamite Features, including LAH 6-Ball mini-wizard mode and World Premiere wizard mode - Dynamite Features are this game's modes, and are started when the center scoop (labelled M-Ball in front of it, because regular multiball is also started here) is lit with a yellow light above it. Shooting the left ramp lights the scoop solidly. Making either in lane lights the scoop very temporarily (only about 2 seconds). In general, Dynamite Feature modes can be stacked, but the mode start scoop will never light yellow if any multiball is running, regardless of whether it's a Feature multiball or part of the M-Ball sequence.",
      "collect all 3 last action hero words": "Dynamite Features, including LAH 6-Ball mini-wizard mode and World Premiere wizard mode - With the exception of Light Extra Ball, all modes have a completion criterium that affects the value of LAH 6-Ball mini-wizard mode and World Premiere wizard mode. These will be listed alongside each mode. During most Dynamite Features, making the left in lane then shooting the lower right scoop within about 5 seconds will score Wildcard, which doubles all scoring for that mode. In any mode with a timer, the left captive ball will reset the mode timer back to 20 seconds one time.",
      "collect a super jackpot": "Shoot the four Badges again - Shoot the Ramp for a Super Jackpot worth 50,000,000 points times the number of balls still in play Within 10 seconds of collecting the Super Jackpot, shoot the Crane lane for a Super Double Jackpot, worth 100,000,000 points times the number of balls in play. Regardless of whether this is collected or timed out, the 6-Ball sequence resets back to step 1. If M-Ball ends without Jackpot 1 being collected even a single time, the mode start scoop will be lit for M-Ball Restart for 10 seconds."
    },
    "stargate": {
      "start any pyramid mode": "Main modes, including Eye of Ra wizard mode - When no mode or multiball is running, shoot the Pyramid to start a mode. The currently selected mode is flashing on the amulet near the upper right flipper, and changes each time a slingshot is hit. There are 6 main modes that can be played in any order, followed by Eye of Ra wizard mode, indicated by the eye of horus glyph in the center. Most modes on Stargate are multiball modes, starting with 2 balls in play with more balls being added as mode shots are scored. Up to 4 balls can be in play at any one time.",
      "raise either guardian once": "Main modes, including Eye of Ra wizard mode - Battle: a timed single-ball mode. The Horus value in the game starts at 10,000,000 points, and can be raised outside of this mode by shooting the left upkicker shortly after raising the left guardian through either the right in lane or hitting the guardian target itself. During Battle, both guardians are raised; shoot the left or center lane to score the current Horus value, then add 10,000,000 points to it. This mode starts with 20 seconds on the clock; making a mode shot adds 3 seconds to the timer, which can go up to at least 26 seconds.",
      "collect a sarcophagus award": "Sarcophagus Multiball - Making a Skill Shot awards one Sarcophagus shot. You can also earn a Sarcophagus by knocking down the lone drop target in the right lane, then shooting the upkicker behind it within about 20 seconds. If you do not shoot the right lane within the 20 seconds, the Sarcophagus credit unlights, but the drop target does not reraise; you need to shoot the right lane just to reraise the drop target to earn another chance. If a mode is running, Sarcophagus shots award 5 Quartz. Sarcophagus shots made when no mode or multiball is running alternate between starting Sarcophagus Multiball or scoring 3 Quartz.",
      "light lock for multiball": "Portal segments and Stargate Multiball - The large blue portal near the flippers wants you to complete 7 tasks throughout the game to play Stargate Multiball, a separate wizard mode. These tasks correspond to the 7 previous sections of this guide, starting at the top of the portal and going clockwise. When you see an animation of a rotating stone wheel on the dot display, you've completed one of these tasks. Sarcophagus: make 1 Sarcophagus shot and start multiball. This can be done off any skill shot. Combo: make a 2-way combo (side ramp -> right ramp).",
      "shoot the pyramid 3 times": "White Pyramid sequence - The lower right standup target, all three lanes, both ramps, and the Pyramid all have a white pyramid insert in front of them. Shoot the shot with a flashing white pyramid insert to light it solidly and cause a new shot to flash. Shots start flashing in random order, but the Pyramid is always last. Completing the sequence awards 5 Quartz the first time, 30,000,000 points the second time, Advance Super Jackpot the third time, then repeats.",
      "complete any pyramid mode": "Main modes, including Eye of Ra wizard mode - When no mode or multiball is running, shoot the Pyramid to start a mode. The currently selected mode is flashing on the amulet near the upper right flipper, and changes each time a slingshot is hit. There are 6 main modes that can be played in any order, followed by Eye of Ra wizard mode, indicated by the eye of horus glyph in the center. Most modes on Stargate are multiball modes, starting with 2 balls in play with more balls being added as mode shots are scored. Up to 4 balls can be in play at any one time.",
      "open the stargate once": "Portal segments and Stargate Multiball - The large blue portal near the flippers wants you to complete 7 tasks throughout the game to play Stargate Multiball, a separate wizard mode. These tasks correspond to the 7 previous sections of this guide, starting at the top of the portal and going clockwise. When you see an animation of a rotating stone wheel on the dot display, you've completed one of these tasks. Sarcophagus: make 1 Sarcophagus shot and start multiball. This can be done off any skill shot. Combo: make a 2-way combo (side ramp -> right ramp).",
      "lock 1 ball for multiball": "Portal segments and Stargate Multiball - The large blue portal near the flippers wants you to complete 7 tasks throughout the game to play Stargate Multiball, a separate wizard mode. These tasks correspond to the 7 previous sections of this guide, starting at the top of the portal and going clockwise. When you see an animation of a rotating stone wheel on the dot display, you've completed one of these tasks. Sarcophagus: make 1 Sarcophagus shot and start multiball. This can be done off any skill shot. Combo: make a 2-way combo (side ramp -> right ramp).",
      "start multiball": "Portal segments and Stargate Multiball - The large blue portal near the flippers wants you to complete 7 tasks throughout the game to play Stargate Multiball, a separate wizard mode. These tasks correspond to the 7 previous sections of this guide, starting at the top of the portal and going clockwise. When you see an animation of a rotating stone wheel on the dot display, you've completed one of these tasks. Sarcophagus: make 1 Sarcophagus shot and start multiball. This can be done off any skill shot. Combo: make a 2-way combo (side ramp -> right ramp).",
      "collect a jackpot": "23 or more Quartz: Super Jackpot - You also get 1,000,000 points in end of ball bonus (cannot be multiplied) for each Quartz you have at the end of a ball. Cashing in your Quartz always resets you to 0. There's no reason not to cash in if Super Jackpot is being offered to you. Early in a game, Double Advance Super Jackpot can also be quite valuable, since the Super Jackpot value never resets or decreases over the course of a game.",
      "lock 2 balls toward multiball": "Portal segments and Stargate Multiball - The large blue portal near the flippers wants you to complete 7 tasks throughout the game to play Stargate Multiball, a separate wizard mode. These tasks correspond to the 7 previous sections of this guide, starting at the top of the portal and going clockwise. When you see an animation of a rotating stone wheel on the dot display, you've completed one of these tasks. Sarcophagus: make 1 Sarcophagus shot and start multiball. This can be done off any skill shot. Combo: make a 2-way combo (side ramp -> right ramp).",
      "start multiball and collect a jackpot": "Portal segments and Stargate Multiball - The large blue portal near the flippers wants you to complete 7 tasks throughout the game to play Stargate Multiball, a separate wizard mode. These tasks correspond to the 7 previous sections of this guide, starting at the top of the portal and going clockwise. When you see an animation of a rotating stone wheel on the dot display, you've completed one of these tasks. Sarcophagus: make 1 Sarcophagus shot and start multiball. This can be done off any skill shot. Combo: make a 2-way combo (side ramp -> right ramp).",
      "complete 2 pyramid modes in one game": "Main modes, including Eye of Ra wizard mode - When no mode or multiball is running, shoot the Pyramid to start a mode. The currently selected mode is flashing on the amulet near the upper right flipper, and changes each time a slingshot is hit. There are 6 main modes that can be played in any order, followed by Eye of Ra wizard mode, indicated by the eye of horus glyph in the center. Most modes on Stargate are multiball modes, starting with 2 balls in play with more balls being added as mode shots are scored. Up to 4 balls can be in play at any one time.",
      "collect a super jackpot": "Settings and miscellanea - In the first wave of Sarcophagus Multiball, the game can light either 1, 2, or 3 shots at a time. Default is 3. After a super jackpot is scored, there is always only one at a time. playing Sarcophagus Multiball or building up 20+ Quartz with the goal of earning a Super Jackpot. focusing on building up your Super Jackpot with the respective Transporter, Quartz, or Stargate awards, then collect the Super Jackpot via Sarcophagus Multiball (or Stargate Multiball if you're close to that).",
      "start sarcophagus multiball": "Start Sarcophagus Multiball - 30 seconds of 3x scoring* which applies to literally all scoring anywhere in the game, and the timer pauses during any multiball that is not part of a main mode (Sarcophagus, Eye of Ra, Stargate) From the beginning of the game, only the 4 awards marked with * above can be selected. Once those 4 awards are earned, Sandstorm Multiball is played. After the first Sandstorm award from the Transporter, the pool is reset with all 11 awards (extra ball is not re-added to the pool). Sandstorm Multiball is a 3-ball multiball with a short ball save and no add-a-balls."
    },
    "starship troopers": {
      "start any bug mode": "5 planets: 4 balls, jackpots worth 12,000,000 points - In Planet Multiball, the two orbits, the two ramps, and the Recon scoop are flashing for Nuke jackpots. Shoot a flashing shot to score that jackpot and light it solidly. The Recon scoop scores double the jackpot value. The lower left scoop is lit for Arm Nukes and always spots one jackpot for you, lighting a shot and scoring the associated point value. After collecting all 5 Nukes, shoot the Warrior toy just to the right of the left ramp for a Super Nuke, worth 10x the regular nuke jackpot value.",
      "complete one bug target bank": "Whiplash + multiball - The Whiplash mechanism consists of the two standup targets and magnet positioned between the center spinner lane and the right ramp. Hit either target to score 50,000 points and one shot of credit toward Whiplash multiball. When either target is hit, the magnet is pulsed, which helps send the ball out of control. After 5 hits (for the first Whiplash Multiball) or 10 hits (anytime after that), Whiplash Multiball instantly begins, which comes with the now-standard 250,000 points and one Mark. Whiplash starts as a 2-ball multiball.",
      "shoot either orbit 3 times": "Iron Monger + multiball - When the Monger is raised, the goal is to hit it 6 times. Be very careful how you go about this; hitting Monger straight-on will trigger the magnet in front of him, putting the ball wildly out of control and at high risk for a center drain. It is preferable to shoot Monger with glancing blows, aiming for the near left corner from the left flipper and near right corner from the right flipper, to avoid activating the magnet in front of him. While the Monger is up, each hit to him scores 100,000 points, plus an additional 7,500 for each spin registered on any spinner since the last Monger hit.",
      "light lock for multiball": "War Machine + multiball - There are 4 post targets labelled Drone around the game: one next to the left orbit, one next to the right ramp, and one on either side of the center spinner lane. To start, all 4 Drones are lit. Hitting a Drone scores that Drone and unlights it. A total of 8 lit Drones must be scored to qualify War Machine Multiball. For the first War Machine Multiball, the minimum number of lit Drones at any one time is 3; this decreases to 2 for the second multiball and 1 for the third multiball onwards.",
      "collect a bug kill award": "Shield mystery award - The two top lanes and four in/out lanes form a single set of 6 lanes known as the Shield lanes. Roll through an unlit lane to light it. Lane change is available on both flippers, and can rotate the positions of the lit lanes in either direction. Completing a set of the 6 lanes increases the bonus multiplier by 1x and lights the War Machine kicker for a Shield mystery award. Also, completing the Shield lanes awards a Mark, but this can only be done once unless Jericho is played. The Shield award that is given is not always random: if War Machine or Whiplash multiball is running, the award will usually be add-a-ball.",
      "complete any bug mode": "5 planets: 4 balls, jackpots worth 12,000,000 points - In Planet Multiball, the two orbits, the two ramps, and the Recon scoop are flashing for Nuke jackpots. Shoot a flashing shot to score that jackpot and light it solidly. The Recon scoop scores double the jackpot value. The lower left scoop is lit for Arm Nukes and always spots one jackpot for you, lighting a shot and scoring the associated point value. After collecting all 5 Nukes, shoot the Warrior toy just to the right of the left ramp for a Super Nuke, worth 10x the regular nuke jackpot value.",
      "reach 100 total bug kills": "5 planets: 4 balls, jackpots worth 12,000,000 points - Klendathu wizard mode is started by clearing out all 5 planets, playing Planet Multiball after clearing Planet P, returning to single ball play, then shooting the Recon scoop. Klendathu is a 4-ball multiball. There is unlimited ball save for 45 seconds, but the mode continues for as long as there are at least 2 balls in play. On Klendathu, all 5 nuke shots are lit, and there are 9 of each colour bug to clear out. Nukes are worth 5,000,000 points (or 10,000,000 from the double nuke at the Recon scoop), and all standup targets are lit to score a bug that I believe is worth 1,000,000 points.",
      "lock 1 ball for multiball": "Whiplash + multiball - The Whiplash mechanism consists of the two standup targets and magnet positioned between the center spinner lane and the right ramp. Hit either target to score 50,000 points and one shot of credit toward Whiplash multiball. When either target is hit, the magnet is pulsed, which helps send the ball out of control. After 5 hits (for the first Whiplash Multiball) or 10 hits (anytime after that), Whiplash Multiball instantly begins, which comes with the now-standard 250,000 points and one Mark. Whiplash starts as a 2-ball multiball.",
      "start multiball": "War Machine + multiball - There are 4 post targets labelled Drone around the game: one next to the left orbit, one next to the right ramp, and one on either side of the center spinner lane. To start, all 4 Drones are lit. Hitting a Drone scores that Drone and unlights it. A total of 8 lit Drones must be scored to qualify War Machine Multiball. For the first War Machine Multiball, the minimum number of lit Drones at any one time is 3; this decreases to 2 for the second multiball and 1 for the third multiball onwards.",
      "collect a jackpot": "5 planets: 4 balls, jackpots worth 12,000,000 points - In Planet Multiball, the two orbits, the two ramps, and the Recon scoop are flashing for Nuke jackpots. Shoot a flashing shot to score that jackpot and light it solidly. The Recon scoop scores double the jackpot value. The lower left scoop is lit for Arm Nukes and always spots one jackpot for you, lighting a shot and scoring the associated point value. After collecting all 5 Nukes, shoot the Warrior toy just to the right of the left ramp for a Super Nuke, worth 10x the regular nuke jackpot value.",
      "reach 250 total bug kills": "Zegema Beach, which has 4 yellow Warriors worth 150,000 and 7 green Hoppers worth 250,000 - Dantana, which has 6 yellow Warriors worth 200,000; 5 green Hoppers worth 300,000; and 3 blue Plasmas worth 400,000 Tango Urilla, which has 8 yellow Warriors worth 250,000; 6 green Hoppers worth 350,000; and 5 red Tankers worth 500,000 Planet P, which has 9 yellow Warriors worth 300,000; 5 blue Plasmas worth 500,000; and 7 red Tankers worth 550,000",
      "start multiball and collect a jackpot": "War Machine + multiball - There are 4 post targets labelled Drone around the game: one next to the left orbit, one next to the right ramp, and one on either side of the center spinner lane. To start, all 4 Drones are lit. Hitting a Drone scores that Drone and unlights it. A total of 8 lit Drones must be scored to qualify War Machine Multiball. For the first War Machine Multiball, the minimum number of lit Drones at any one time is 3; this decreases to 2 for the second multiball and 1 for the third multiball onwards.",
      "complete 2 bug modes in one game": "5 planets: 4 balls, jackpots worth 12,000,000 points - Klendathu wizard mode is started by clearing out all 5 planets, playing Planet Multiball after clearing Planet P, returning to single ball play, then shooting the Recon scoop. Klendathu is a 4-ball multiball. There is unlimited ball save for 45 seconds, but the mode continues for as long as there are at least 2 balls in play. On Klendathu, all 5 nuke shots are lit, and there are 9 of each colour bug to clear out. Nukes are worth 5,000,000 points (or 10,000,000 from the double nuke at the Recon scoop), and all standup targets are lit to score a bug that I believe is worth 1,000,000 points.",
      "collect a super jackpot": "Iron Monger + multiball - In multiball, make a full shot to either orbit or the center spinner lane to score 250,000 points and re-raise the Monger. Then, just as before, hit the Monger 6 more times, for another 250,000 points each- these jackpot awards can't be raised. After yet another 6 hits to Monger, he will sink back into the table again, and the center spinner lane will be lit for a 3,000,000 point super jackpot. Collecting this super jackpot resets the whole sequence. Iron Monger jackpot and super jackpot values never increase.",
      "start brain bug multiball": "War Machine + multiball - There are 4 post targets labelled Drone around the game: one next to the left orbit, one next to the right ramp, and one on either side of the center spinner lane. To start, all 4 Drones are lit. Hitting a Drone scores that Drone and unlights it. A total of 8 lit Drones must be scored to qualify War Machine Multiball. For the first War Machine Multiball, the minimum number of lit Drones at any one time is 3; this decreases to 2 for the second multiball and 1 for the third multiball onwards."
    },
    "independence day": {
      "complete one target bank": "F-18 hurry-ups - Hitting all three standup targets that are in the center of the table and face to the right qualifies the F-18 hurry-up. Starting this hurry-up the first time only requires 1 completion of the target bank, while additional hurry-ups require 1 more completion than the previous one each. The starting value of the F-18 hurry-up is 20,000,000 plus the sum of all bumper values scored since the last hurry-up was played. I have seen this hurry-up go as high as 150,000,000 points, but other accounts say it can be more than 500,000,000.",
      "shoot the center scoop 3 times": "Center ramp: aliens - Making the center ramp collects and Alien. 5 Aliens lights the center ramp for extra ball. Every 5th alien starting with the 10th will give an award equal to 1,000,000 points times the number of aliens. It's not really worth trying to go beyond the extra ball with this due to the difficulty of the center ramp and the sheer number of points elsewhere in the game (which is in direct contrast to Data East Star Wars, where a nearly identical center ramp rule was so strong that it was game-breaking).",
      "light lock for multiball": "Upper flipper shots, including Combos and Area 51 Multiball - There are two shots accessible from the upper flipper: the loop shot and a dead-end lane. They are roughly similar in location to the Trainwreck and side ramp shots on Addams Family. The target at the end of the dead-end lane removes one alien from a picture on the display. Removing all of the aliens reveals the text \"50 Million\", and scores that value. Going through an in lane lights the opposite orbit purple for a combo. The first shot in a combo scores 5,000,000 points, then subsequent shots score 6,000,000, then 7,000,000, and so on, up to a max of 10,000,000.",
      "collect a hurry up": "F-18 hurry-ups - Hitting all three standup targets that are in the center of the table and face to the right qualifies the F-18 hurry-up. Starting this hurry-up the first time only requires 1 completion of the target bank, while additional hurry-ups require 1 more completion than the previous one each. The starting value of the F-18 hurry-up is 20,000,000 plus the sum of all bumper values scored since the last hurry-up was played. I have seen this hurry-up go as high as 150,000,000 points, but other accounts say it can be more than 500,000,000.",
      "lock 1 ball for multiball": "Locks and Independence multiball - Shoot the alien head toy in the back center of the table or the lower right scoop to make progress toward locks. Locks are always lit one at a time, and once qualified, shoot the open alien head or the scoop again to lock a ball. For the first multiball, just one shot is required to light each lock, but this increases by one more shot for each subsequent time through multiball. Lock three balls to start multiball. If the final ball of the game begins and you have not played Independence Multiball yet, the alien toy will be open for multiball start straight away.",
      "start multiball": "Upper flipper shots, including Combos and Area 51 Multiball - There are two shots accessible from the upper flipper: the loop shot and a dead-end lane. They are roughly similar in location to the Trainwreck and side ramp shots on Addams Family. The target at the end of the dead-end lane removes one alien from a picture on the display. Removing all of the aliens reveals the text \"50 Million\", and scores that value. Going through an in lane lights the opposite orbit purple for a combo. The first shot in a combo scores 5,000,000 points, then subsequent shots score 6,000,000, then 7,000,000, and so on, up to a max of 10,000,000.",
      "collect a jackpot": "Upper flipper shots, including Combos and Area 51 Multiball - Going through an in lane lights the opposite orbit purple for a combo. The first shot in a combo scores 5,000,000 points, then subsequent shots score 6,000,000, then 7,000,000, and so on, up to a max of 10,000,000. In addition to scoring the combo value at each level, the combo value is added to the combo jackpot (which starts at 10,000,000, maxes out at 99,000,000, and resets between balls). Ending a combo at the dead-end target scores the current combo jackpot and resets that jackpot back to 10,000,000 points.",
      "complete two city mode shots in one mode": "Upper flipper shots, including Combos and Area 51 Multiball - There are two shots accessible from the upper flipper: the loop shot and a dead-end lane. They are roughly similar in location to the Trainwreck and side ramp shots on Addams Family. The target at the end of the dead-end lane removes one alien from a picture on the display. Removing all of the aliens reveals the text \"50 Million\", and scores that value. Going through an in lane lights the opposite orbit purple for a combo. The first shot in a combo scores 5,000,000 points, then subsequent shots score 6,000,000, then 7,000,000, and so on, up to a max of 10,000,000.",
      "lock 2 balls toward multiball": "Upper flipper shots, including Combos and Area 51 Multiball - There are two shots accessible from the upper flipper: the loop shot and a dead-end lane. They are roughly similar in location to the Trainwreck and side ramp shots on Addams Family. The target at the end of the dead-end lane removes one alien from a picture on the display. Removing all of the aliens reveals the text \"50 Million\", and scores that value. Going through an in lane lights the opposite orbit purple for a combo. The first shot in a combo scores 5,000,000 points, then subsequent shots score 6,000,000, then 7,000,000, and so on, up to a max of 10,000,000.",
      "start multiball and collect a jackpot": "Upper flipper shots, including Combos and Area 51 Multiball - There are two shots accessible from the upper flipper: the loop shot and a dead-end lane. They are roughly similar in location to the Trainwreck and side ramp shots on Addams Family. The target at the end of the dead-end lane removes one alien from a picture on the display. Removing all of the aliens reveals the text \"50 Million\", and scores that value. Going through an in lane lights the opposite orbit purple for a combo. The first shot in a combo scores 5,000,000 points, then subsequent shots score 6,000,000, then 7,000,000, and so on, up to a max of 10,000,000.",
      "collect a super jackpot": "Upper flipper shots, including Combos and Area 51 Multiball - Going through an in lane lights the opposite orbit purple for a combo. The first shot in a combo scores 5,000,000 points, then subsequent shots score 6,000,000, then 7,000,000, and so on, up to a max of 10,000,000. In addition to scoring the combo value at each level, the combo value is added to the combo jackpot (which starts at 10,000,000, maxes out at 99,000,000, and resets between balls). Ending a combo at the dead-end target scores the current combo jackpot and resets that jackpot back to 10,000,000 points.",
      "start 6 ball multiball": "Upper flipper shots, including Combos and Area 51 Multiball - There are two shots accessible from the upper flipper: the loop shot and a dead-end lane. They are roughly similar in location to the Trainwreck and side ramp shots on Addams Family. The target at the end of the dead-end lane removes one alien from a picture on the display. Removing all of the aliens reveals the text \"50 Million\", and scores that value. Going through an in lane lights the opposite orbit purple for a combo. The first shot in a combo scores 5,000,000 points, then subsequent shots score 6,000,000, then 7,000,000, and so on, up to a max of 10,000,000."
    },
    "the x files": {
      "start any case mode": "X-File Episode modes, including Blood wizard mode - Shoot the right ramp to earn a letter in F-B-I. After collecting all three, a trapdoor in front of the ramp will open; shoot into it to start an Episode mode. There are 10 modes in total: 8 standard modes, 1 trivia game, and Blood wizard mode. The 8 standard modes and trivia game are played in random order, and there is no way to see during gameplay which ones you have played or which one will be next. The only hint you get for your progress toward Blood wizard mode is the instant info page telling you how many modes there are left before Blood.",
      "shoot the file cabinet 3 times": "File Cabinet Multiball - Start File Cabinet Multiball by bashing on the File Cabinet toy repeatedly. For Mulder's first multiball, it takes just 3 hits; for Scully's first multiball, it takes 6. Each subsequent multiball needs 3 more filing cabinet hits than the last. For the final hit, the cabinet will lower, making it possible to shoot into the hole. File Cabinet Multiball is a 3-ball multiball. Jackpots start at 500,000 points, plus 50,000 for each time you completed the lower right standup targets during single ball play before starting the multiball.",
      "light lock for multiball": "The Truth Multiball - If you are playing as Scully, your first multiball will have 2 shots lit at a time with the ability to temporarily light a third by going through an in lane. Scully's second multiball has 2 lit shots, but no in lane opportunity. Scully's third multiball and onward, as well as any Truth Multiball for Mulder, have just one lit shot and no ability to light additional ones. The base jackpot for Truth Multiball is 200,000 points. Completing the lower left standup targets during single ball play before starting Truth Multiball increases the jackpot by 50,000 points.",
      "shoot the left ramp 3 times": "X-File Episode modes, including Blood wizard mode - Shoot the right ramp to earn a letter in F-B-I. After collecting all three, a trapdoor in front of the ramp will open; shoot into it to start an Episode mode. There are 10 modes in total: 8 standard modes, 1 trivia game, and Blood wizard mode. The 8 standard modes and trivia game are played in random order, and there is no way to see during gameplay which ones you have played or which one will be next. The only hint you get for your progress toward Blood wizard mode is the instant info page telling you how many modes there are left before Blood.",
      "complete any case mode": "X-File Episode modes, including Blood wizard mode - Shoot the right ramp to earn a letter in F-B-I. After collecting all three, a trapdoor in front of the ramp will open; shoot into it to start an Episode mode. There are 10 modes in total: 8 standard modes, 1 trivia game, and Blood wizard mode. The 8 standard modes and trivia game are played in random order, and there is no way to see during gameplay which ones you have played or which one will be next. The only hint you get for your progress toward Blood wizard mode is the instant info page telling you how many modes there are left before Blood.",
      "lock 1 ball for multiball": "The Truth Multiball - If you are playing as Scully, your first multiball will have 2 shots lit at a time with the ability to temporarily light a third by going through an in lane. Scully's second multiball has 2 lit shots, but no in lane opportunity. Scully's third multiball and onward, as well as any Truth Multiball for Mulder, have just one lit shot and no ability to light additional ones. The base jackpot for Truth Multiball is 200,000 points. Completing the lower left standup targets during single ball play before starting Truth Multiball increases the jackpot by 50,000 points.",
      "start multiball": "The Truth Multiball - If you are playing as Scully, your first multiball will have 2 shots lit at a time with the ability to temporarily light a third by going through an in lane. Scully's second multiball has 2 lit shots, but no in lane opportunity. Scully's third multiball and onward, as well as any Truth Multiball for Mulder, have just one lit shot and no ability to light additional ones. The base jackpot for Truth Multiball is 200,000 points. Completing the lower left standup targets during single ball play before starting Truth Multiball increases the jackpot by 50,000 points.",
      "collect a jackpot": "The Truth Multiball - The base jackpot for Truth Multiball is 200,000 points. Completing the lower left standup targets during single ball play before starting Truth Multiball increases the jackpot by 50,000 points. Truth Multiball begins as soon as you collect your last small X, which will almost always be one of the ramp shots. Truth Multiball is a 4-ball multiball. Step 1 is to make all six major shots in the game, which each score a jackpot equal to the starting value (200,000 plus 50,000 per lower left target completion).",
      "start an x file mode": "X-File Episode modes, including Blood wizard mode - Shoot the right ramp to earn a letter in F-B-I. After collecting all three, a trapdoor in front of the ramp will open; shoot into it to start an Episode mode. There are 10 modes in total: 8 standard modes, 1 trivia game, and Blood wizard mode. The 8 standard modes and trivia game are played in random order, and there is no way to see during gameplay which ones you have played or which one will be next. The only hint you get for your progress toward Blood wizard mode is the instant info page telling you how many modes there are left before Blood.",
      "lock 2 balls toward multiball": "The Truth Multiball - If you are playing as Scully, your first multiball will have 2 shots lit at a time with the ability to temporarily light a third by going through an in lane. Scully's second multiball has 2 lit shots, but no in lane opportunity. Scully's third multiball and onward, as well as any Truth Multiball for Mulder, have just one lit shot and no ability to light additional ones. The base jackpot for Truth Multiball is 200,000 points. Completing the lower left standup targets during single ball play before starting Truth Multiball increases the jackpot by 50,000 points.",
      "start multiball and collect a jackpot": "The Truth Multiball - If you are playing as Scully, your first multiball will have 2 shots lit at a time with the ability to temporarily light a third by going through an in lane. Scully's second multiball has 2 lit shots, but no in lane opportunity. Scully's third multiball and onward, as well as any Truth Multiball for Mulder, have just one lit shot and no ability to light additional ones. The base jackpot for Truth Multiball is 200,000 points. Completing the lower left standup targets during single ball play before starting Truth Multiball increases the jackpot by 50,000 points.",
      "complete 2 case modes in one game": "X-File Episode modes, including Blood wizard mode - Shoot the right ramp to earn a letter in F-B-I. After collecting all three, a trapdoor in front of the ramp will open; shoot into it to start an Episode mode. There are 10 modes in total: 8 standard modes, 1 trivia game, and Blood wizard mode. The 8 standard modes and trivia game are played in random order, and there is no way to see during gameplay which ones you have played or which one will be next. The only hint you get for your progress toward Blood wizard mode is the instant info page telling you how many modes there are left before Blood.",
      "collect a super jackpot": "Orbits, including top lanes and Super Pops - When no mode or multiball is running, shooting an orbit increases the value of the pop bumpers. Bumpers start at 1,000 points and increase by 500 with each shot to either orbit. After hitting enough pop bumpers (60 are required the first time, which isn't as hard as it sounds), Super Pops begins, where all bumpers score 20,000 points. Super Pops runs for the entire trip to the pop bumpers where it is started, plus one trip to the bumpers after that. When the ball leaves the pop bumpers that second time, Super Pops ends the bumper value is reset back to 1,000 points.",
      "complete 3 case modes in one game": "X-File Episode modes, including Blood wizard mode - Shoot the right ramp to earn a letter in F-B-I. After collecting all three, a trapdoor in front of the ramp will open; shoot into it to start an Episode mode. There are 10 modes in total: 8 standard modes, 1 trivia game, and Blood wizard mode. The 8 standard modes and trivia game are played in random order, and there is no way to see during gameplay which ones you have played or which one will be next. The only hint you get for your progress toward Blood wizard mode is the instant info page telling you how many modes there are left before Blood."
    },
    "aerosmith": {
      "start any song mode": "The song modes are, from top left to bottom right: - Rats in the Cellar: 8 shots. One shot on the left is lit, then one shot on the right, then two on the left, then two on the right, etc up to a max of 3. Crank it Up adds +1 shot to the selection. Super spinner lights after finishing the mode for 100 spins. Dude Looks Like A Lady: 10 shots. Two shots are lit, the one to the left moves over to the right when a shot is made. Crank it Up lights the three inlanes and left scoop to advance the mode. Super lanes lights after finishing the mode for 10 inlanes.",
      "light the toy box for lock": "Toybox Multiball: - Shoot the toybox to light lock at the lock saucer; you can light up to 6 locks at a time prior to collecting any of them, and subsequent Toybox Multiballs require one more toybox hit to light each lock. Pressing the action button after at least 3 balls have been locked aborts the multiball - this can be very helpful as 6-ball Toybox Multiball has 2x base jackpot values. If the lock saucer fails to eject the ball into the toybox, it will try to reload it; and if balls were already locked there, the ball will hit Jacky in the face instead!",
      "collect a mystery award": "AEROSMITH Mystery: - Complete the AEROSMITH targets to light mystery at the left eject.",
      "complete any song mode": "The song modes are, from top left to bottom right: - Rats in the Cellar: 8 shots. One shot on the left is lit, then one shot on the right, then two on the left, then two on the right, etc up to a max of 3. Crank it Up adds +1 shot to the selection. Super spinner lights after finishing the mode for 100 spins. Dude Looks Like A Lady: 10 shots. Two shots are lit, the one to the left moves over to the right when a shot is made. Crank it Up lights the three inlanes and left scoop to advance the mode. Super lanes lights after finishing the mode for 10 inlanes.",
      "lock 1 ball for multiball": "Medley Multiball: - Medley Multiball is a mini-wizard mode qualified by scoring at least 1 award in all songs. Shooting the left saucer will begin the mode. Before the mode starts, you will be awarded a 10 million point bonus (+10M) for every song you've completed before starting Medley Multiball. For instance, if you've completed 2 songs, then you'll get 10 + 20M for a total of 30M. Completing all songs before starting the mode will score a 200 million \"Perfect Bonus\" and qualify Final Tour after the mode ends. This is a stage-type add-a-ball MB requiring you to complete certain shots corresponding to each song, but only for the songs that you did not complete during regular mode play.",
      "start multiball": "Medley Multiball: - Medley Multiball is a mini-wizard mode qualified by scoring at least 1 award in all songs. Shooting the left saucer will begin the mode. Before the mode starts, you will be awarded a 10 million point bonus (+10M) for every song you've completed before starting Medley Multiball. For instance, if you've completed 2 songs, then you'll get 10 + 20M for a total of 30M. Completing all songs before starting the mode will score a 200 million \"Perfect Bonus\" and qualify Final Tour after the mode ends. This is a stage-type add-a-ball MB requiring you to complete certain shots corresponding to each song, but only for the songs that you did not complete during regular mode play.",
      "collect a jackpot": "Toybox Multiball: - Shoot the toybox to light lock at the lock saucer; you can light up to 6 locks at a time prior to collecting any of them, and subsequent Toybox Multiballs require one more toybox hit to light each lock. Pressing the action button after at least 3 balls have been locked aborts the multiball - this can be very helpful as 6-ball Toybox Multiball has 2x base jackpot values. If the lock saucer fails to eject the ball into the toybox, it will try to reload it; and if balls were already locked there, the ball will hit Jacky in the face instead!",
      "lock 2 balls toward multiball": "Medley Multiball: - Medley Multiball is a mini-wizard mode qualified by scoring at least 1 award in all songs. Shooting the left saucer will begin the mode. Before the mode starts, you will be awarded a 10 million point bonus (+10M) for every song you've completed before starting Medley Multiball. For instance, if you've completed 2 songs, then you'll get 10 + 20M for a total of 30M. Completing all songs before starting the mode will score a 200 million \"Perfect Bonus\" and qualify Final Tour after the mode ends. This is a stage-type add-a-ball MB requiring you to complete certain shots corresponding to each song, but only for the songs that you did not complete during regular mode play.",
      "start multiball and collect a jackpot": "Medley Multiball: - Medley Multiball is a mini-wizard mode qualified by scoring at least 1 award in all songs. Shooting the left saucer will begin the mode. Before the mode starts, you will be awarded a 10 million point bonus (+10M) for every song you've completed before starting Medley Multiball. For instance, if you've completed 2 songs, then you'll get 10 + 20M for a total of 30M. Completing all songs before starting the mode will score a 200 million \"Perfect Bonus\" and qualify Final Tour after the mode ends. This is a stage-type add-a-ball MB requiring you to complete certain shots corresponding to each song, but only for the songs that you did not complete during regular mode play.",
      "complete 2 song modes in one game": "The song modes are, from top left to bottom right: - Rats in the Cellar: 8 shots. One shot on the left is lit, then one shot on the right, then two on the left, then two on the right, etc up to a max of 3. Crank it Up adds +1 shot to the selection. Super spinner lights after finishing the mode for 100 spins. Dude Looks Like A Lady: 10 shots. Two shots are lit, the one to the left moves over to the right when a shot is made. Crank it Up lights the three inlanes and left scoop to advance the mode. Super lanes lights after finishing the mode for 10 inlanes.",
      "collect a super jackpot": "Toybox Multiball: - Shoot the toybox to light lock at the lock saucer; you can light up to 6 locks at a time prior to collecting any of them, and subsequent Toybox Multiballs require one more toybox hit to light each lock. Pressing the action button after at least 3 balls have been locked aborts the multiball - this can be very helpful as 6-ball Toybox Multiball has 2x base jackpot values. If the lock saucer fails to eject the ball into the toybox, it will try to reload it; and if balls were already locked there, the ball will hit Jacky in the face instead!",
      "start love in an elevator multiball": "Elevator Multiball: - Shoot both orbits (and / or the drop target on Prem / LE) to light elevator locks; subsequent Elevator Multiball attempts require multiple shots to both orbits to light each lock. Collecting 3 elevator locks starts Elevator Multiball. During the multiball, all major shots are lit. ). You must repeat this sequence for all major shots, which will then lite Super Jackpot at the Elevator shot. The super jackpot base value is a percentage of the sum total of all jackpots collected - 100% for a perfect attempt, 75% for 2 attempts, or 50% for 3 or more."
    },
    "the beatles": {
      "start any song mode": "Modes: - Modes are lit at the start of a ball and can be changed with the flippers; the goal of each 60-second timed mode is to complete whichever objective is listed above the flippers to advance the level of the mode. The lit mode alternates every 5 seconds. Once a mode has ended (whether by time running out, or by completing it after level 5 has been reached), the next mode can be started by completing F-A-B and F-O-U-R, then shooting the upper magnet. If the mode has been lit during the ball, the pop bumpers will cycle the lit mode.",
      "complete one drop target bank": "\" Progress towards these features do not carry over from ball to ball. ) Complete all 3 drop target banks once each on a single ball to light the extra ball, which alternates between inlanes with slingshot hits. Advance Loops: Completing a drop target bank will light its \"Advance Loops\" insert solid and increase the loop value by that number. The solidly lit blue inserts indicate the loop value.",
      "light lock for multiball": "Razor Crest Multiballs - There are three Razor Crest Multiball modes that can be played throughout the game - they cannot be replayed until This Is The Way has been activated. These three multiball modes are started by shooting the center Razor Crest target with enough strength to register a direct hit enough times; the multiball is determined by the currently flashing numbered green insert, which is changed by hitting the \"BOBA\" and \"FETT\" standup targets when a multiball isn't currently lit, and is started with a shot that heads all the way around the center ramp.",
      "shoot the loop 3 times": "Loop Value: - Completing any drop target bank will advance the loop value by the number on it's Advance Loops insert. Loop shots are worth 2k per lit loop insert. BEATLEMANIA Awards that add multipliers to the loops will reset the loop value.",
      "complete any song mode": "Modes: - Modes are lit at the start of a ball and can be changed with the flippers; the goal of each 60-second timed mode is to complete whichever objective is listed above the flippers to advance the level of the mode. The lit mode alternates every 5 seconds. Once a mode has ended (whether by time running out, or by completing it after level 5 has been reached), the next mode can be started by completing F-A-B and F-O-U-R, then shooting the upper magnet. If the mode has been lit during the ball, the pop bumpers will cycle the lit mode.",
      "lock 1 ball for multiball": "Taxman Multiball: - After reaching level 5 in all 5 modes, a shot to the upper magnet will begin Taxman Multiball. This is a 4-ball Multiball where all four of the single-ball modes described above are active and completing the 4 Beatles standup targets will add a ball. Completing the F-A-B and F-O-U-R drop targets lights jackpot at the top magnet, and completing all three drop target banks (FAB, FOUR, and 1964) lights the super jackpot behind the F-A-B drop targets. Modes then reset when the player drains down to a single ball.",
      "start beatlemania multiball": "Hard Day's Night / Beatlemania! Multiball: - Started by getting to level 2 (3 on Competition Mode) or higher in all 5 modes, this begins with 30 seconds of single-ball play where completing the drop target banks raises the multiball jackpot by 50k per bank completed. Once time runs out or you drain, 4-ball multiball begins. Completing the F-A-B and F-O-U-R drop targets lights the jackpot at the top magnet, which continues to increase with every drop target bank completed and every jackpot collected. Completing all three drop target banks (FAB, FOUR, and 1964) lights super jackpot behind the F-A-B drop targets.",
      "collect a jackpot": "Modes: - All My Loving: 2-Ball Multiball. This untimed mode is added into the mode rotation on ball 3 as a pity multiball, or after the four other modes have been played. Jackpot increases with switch hits, starts at 250k points, and can be collected at the upper magnet. All scoring is doubled while the mode is running and Mystery will award an add-a-ball. Completing any mode will light Super Jackpot at the target behind the F-A-B drop targets for the entire value of the mode that was completed prior. This unlights if the player drains, and if multiple modes are completed on the same ball without scoring the Super Jackpot, the value will be multiplied by however many modes were played beforehand.",
      "collect a bonus multiplier advance": "\" Progress towards these features do not carry over from ball to ball. ) Advance Loops: Completing a drop target bank will light its \"Advance Loops\" insert solid and increase the loop value by that number. The solidly lit blue inserts indicate the loop value. Advance Multipliers: Complete whichever drop target bank has the lit \"Advance Multipliers\"/\"X\" insert to increase the bonus X by +1x, up to 7x. Bonus X carries from ball to ball.",
      "lock 2 balls toward multiball": "Razor Crest Multiballs - There are three Razor Crest Multiball modes that can be played throughout the game - they cannot be replayed until This Is The Way has been activated. These three multiball modes are started by shooting the center Razor Crest target with enough strength to register a direct hit enough times; the multiball is determined by the currently flashing numbered green insert, which is changed by hitting the \"BOBA\" and \"FETT\" standup targets when a multiball isn't currently lit, and is started with a shot that heads all the way around the center ramp.",
      "start multiball and collect a jackpot": "Hard Day's Night / Beatlemania! Multiball: - Started by getting to level 2 (3 on Competition Mode) or higher in all 5 modes, this begins with 30 seconds of single-ball play where completing the drop target banks raises the multiball jackpot by 50k per bank completed. Once time runs out or you drain, 4-ball multiball begins. Completing the F-A-B and F-O-U-R drop targets lights the jackpot at the top magnet, which continues to increase with every drop target bank completed and every jackpot collected. Completing all three drop target banks (FAB, FOUR, and 1964) lights super jackpot behind the F-A-B drop targets.",
      "complete 2 song modes in one game": "Modes: - Modes are lit at the start of a ball and can be changed with the flippers; the goal of each 60-second timed mode is to complete whichever objective is listed above the flippers to advance the level of the mode. The lit mode alternates every 5 seconds. Once a mode has ended (whether by time running out, or by completing it after level 5 has been reached), the next mode can be started by completing F-A-B and F-O-U-R, then shooting the upper magnet. If the mode has been lit during the ball, the pop bumpers will cycle the lit mode.",
      "collect a super jackpot": "Modes: - All My Loving: 2-Ball Multiball. This untimed mode is added into the mode rotation on ball 3 as a pity multiball, or after the four other modes have been played. Jackpot increases with switch hits, starts at 250k points, and can be collected at the upper magnet. All scoring is doubled while the mode is running and Mystery will award an add-a-ball. Ticket to Ride: Super Spinners. Shoot the spinners. 30 spins at either spinner combined advances a level. Each spinner hit awards 10k multiplied by the current level of the mode plus a boosted value per spin.",
      "start a wizard mode": "Modes: - Modes are lit at the start of a ball and can be changed with the flippers; the goal of each 60-second timed mode is to complete whichever objective is listed above the flippers to advance the level of the mode. The lit mode alternates every 5 seconds. Once a mode has ended (whether by time running out, or by completing it after level 5 has been reached), the next mode can be started by completing F-A-B and F-O-U-R, then shooting the upper magnet. If the mode has been lit during the ball, the pop bumpers will cycle the lit mode."
    },
    "elvis": {
      "start any song mode": "yellow lights in front of it. Hit it enough times and you start the Hound Dog frenzy mode - that are angled right towards the rollovers. Hitting all three starts a 20 seconds of double scoringvery useful KING targets: The 4 King stand-ups and angled left and just below TCB. They relight the Scarf target and therefore give semi-random awards.",
      "complete one elvis target bank": "Gifts from Elvis (5 in all): - 1. Flip Flip Dance Dance (Video Mode): There are three difficulty to pick from with the flipper buttons at the start of the mode. Awards are typically 2m+, increasing to around a possible 5- 2.",
      "light lock for multiball": "Heart Break Hotel is a multiball mode. Big points are earned through hitting Graceland for - Jackpot. The problem with this is that it is hard to do. 8m and then back to the start. Jailhouse Rock: A 2 ball MB, although more can and usually will be added.",
      "collect a mystery award": "loop ready for the Blue Suede Shoes mode and inner loop shots. The out-lanes award a 500K - bonus when lit for \"Elvis has left the building\". This seems to be a last ball/end of game award.",
      "shoot the left ramp 3 times": "yellow lights in front of it. Hit it enough times and you start the Hound Dog frenzy mode - that are angled right towards the rollovers. Hitting all three starts a 20 seconds of double scoringvery useful KING targets: The 4 King stand-ups and angled left and just below TCB. They relight the Scarf target and therefore give semi-random awards.",
      "complete any song mode": "yellow lights in front of it. Hit it enough times and you start the Hound Dog frenzy mode - that are angled right towards the rollovers. Hitting all three starts a 20 seconds of double scoringvery useful KING targets: The 4 King stand-ups and angled left and just below TCB. They relight the Scarf target and therefore give semi-random awards.",
      "lock 1 ball for multiball": "Heart Break Hotel is a multiball mode. Big points are earned through hitting Graceland for - Jackpot. The problem with this is that it is hard to do. 8m and then back to the start. Jailhouse Rock: A 2 ball MB, although more can and usually will be added.",
      "start multiball": "Heart Break Hotel is a multiball mode. Big points are earned through hitting Graceland for - Jackpot. The problem with this is that it is hard to do. 8m and then back to the start. Jailhouse Rock: A 2 ball MB, although more can and usually will be added.",
      "start jailhouse multiball": "Heart Break Hotel is a multiball mode. Big points are earned through hitting Graceland for - Jackpot. The problem with this is that it is hard to do. 8m and then back to the start. Jailhouse Rock: A 2 ball MB, although more can and usually will be added.",
      "lock 2 balls toward multiball": "either flipper and can also be accessed by balls draining from the bumpers - right in lane. It has shot indicator panels of a white arrow jackpot/shot indicator, \"Up\" for \"All Shook Up\" and a blue note/top ten count down panel. Right loop: This is actually a partial loop leading to the top saucer.",
      "start multiball and collect a jackpot": "Heart Break Hotel is a multiball mode. Big points are earned through hitting Graceland for - Jackpot. The problem with this is that it is hard to do. 8m and then back to the start. Jailhouse Rock: A 2 ball MB, although more can and usually will be added.",
      "complete 2 song modes in one game": "The 5 modes or \"Feature Hits\" of the game are represented by the yellow Hound Dog, Blue - Suede Shoes, Heart Break Hotel, Jailhouse Rock and All Shook Up light panels."
    },
    "rolling stones": {
      "start any song mode": "Wizard Mode - It's at this point that we give those who prefer to find out these things for themselves a chance to jump past the next section and re-join us immediately after it. If you don't want to know about the wizard mode, just click this and we'll see you after we've spilled the beans on all the cool stuff. The Rolling Stone's wizard mode, Encore, is split into two sections and which parts you get to play depends on how well you've done so far.",
      "complete one target bank": "The super jackpot target - Sounds pretty easy, right? Well, Mick has other ideas and just as he did with the Rock Star super jackpot, he plants himself right in front of the target, blocking your shot. This time you can do something about it though. Hit Mick with the ball and he very briefly moves out of the way to reveal the target before resuming his guard. The length of time he moves aside is too brief to make a second shot with the same ball, so you're going to have to use one ball to move him and another to hit the target.",
      "light lock for multiball": "Encore Multiball - The rules are basically the same as for regular Encore, but this time you've got four balls to play with. The scoring is the same, starting at 500K and increasing by 50K with each successful shot, and the super jackpot builds in the same way. We hinted before how the V-I-P mystery award might not be as much help as you'd hope. That's because with all four balls in play, you can still be awarded...",
      "collect a mystery award": "Bonus multiplier increases +1X - The V-I-P award is pseudo-random because the 'More mode time' and 'Add-a-ball' are context sensitive. If you're playing one of the timed modes such as World Tour, Fast Scoring or any of the record modes, the next V-I-P award will almost certainly extend the time available to complete it. Similarly, the 'Add-a-ball' award is usually given the first time you complete V-I-P during one of the multiball features. But more on those later.",
      "shoot the main ramp 3 times": "The left ramp note is lit - So basically Mick moves between the unlit or flashing arrow positions so you can light all six inserts solidly by hitting him with the ball. You get 20K for the first lit note and an extra 5K for each subsequent one. Depending on how the machine is set up, it might be possible to register a hit if you make one of the orbit shots and Mick him from the back. That's certainly the safest option because hitting him from the front is almost an open invitation for the ball to drain, so you need to be on your guard if you shoot him straight on.",
      "complete any song mode": "Wizard Mode - It's at this point that we give those who prefer to find out these things for themselves a chance to jump past the next section and re-join us immediately after it. If you don't want to know about the wizard mode, just click this and we'll see you after we've spilled the beans on all the cool stuff. The Rolling Stone's wizard mode, Encore, is split into two sections and which parts you get to play depends on how well you've done so far.",
      "lock 1 ball for multiball": "Encore Multiball - The rules are basically the same as for regular Encore, but this time you've got four balls to play with. The scoring is the same, starting at 500K and increasing by 50K with each successful shot, and the super jackpot builds in the same way. We hinted before how the V-I-P mystery award might not be as much help as you'd hope. That's because with all four balls in play, you can still be awarded...",
      "start multiball": "Encore Multiball - The rules are basically the same as for regular Encore, but this time you've got four balls to play with. The scoring is the same, starting at 500K and increasing by 50K with each successful shot, and the super jackpot builds in the same way. We hinted before how the V-I-P mystery award might not be as much help as you'd hope. That's because with all four balls in play, you can still be awarded...",
      "collect a jackpot": "The super jackpot target - Sounds pretty easy, right? Well, Mick has other ideas and just as he did with the Rock Star super jackpot, he plants himself right in front of the target, blocking your shot. This time you can do something about it though. Hit Mick with the ball and he very briefly moves out of the way to reveal the target before resuming his guard. The length of time he moves aside is too brief to make a second shot with the same ball, so you're going to have to use one ball to move him and another to hit the target.",
      "collect a song award": "Bonus multiplier increases +1X - The V-I-P award is pseudo-random because the 'More mode time' and 'Add-a-ball' are context sensitive. If you're playing one of the timed modes such as World Tour, Fast Scoring or any of the record modes, the next V-I-P award will almost certainly extend the time available to complete it. Similarly, the 'Add-a-ball' award is usually given the first time you complete V-I-P during one of the multiball features. But more on those later.",
      "lock 2 balls toward multiball": "Encore Multiball - The rules are basically the same as for regular Encore, but this time you've got four balls to play with. The scoring is the same, starting at 500K and increasing by 50K with each successful shot, and the super jackpot builds in the same way. We hinted before how the V-I-P mystery award might not be as much help as you'd hope. That's because with all four balls in play, you can still be awarded...",
      "start multiball and collect a jackpot": "The super jackpot target - Sounds pretty easy, right? Well, Mick has other ideas and just as he did with the Rock Star super jackpot, he plants himself right in front of the target, blocking your shot. This time you can do something about it though. Hit Mick with the ball and he very briefly moves out of the way to reveal the target before resuming his guard. The length of time he moves aside is too brief to make a second shot with the same ball, so you're going to have to use one ball to move him and another to hit the target.",
      "complete 2 song modes in one game": "Mixed Emotions - All of them are timed modes with the clock being set at 45 seconds on factory settings, though this can be adjusted for each mode through the settings menu. Although the Records modes continue through multiball modes, they cannot be started during a multiball. All four modes are very similar in that they light one or more record inserts on the six major shots and you have to shoot the lit shots to score points. The only variations are in which shots are lit, how they change during the mode, and how many points they score.",
      "collect a super jackpot": "The super jackpot target - Sounds pretty easy, right? Well, Mick has other ideas and just as he did with the Rock Star super jackpot, he plants himself right in front of the target, blocking your shot. This time you can do something about it though. Hit Mick with the ball and he very briefly moves out of the way to reveal the target before resuming his guard. The length of time he moves aside is too brief to make a second shot with the same ball, so you're going to have to use one ball to move him and another to hit the target.",
      "start a wizard mode": "Wizard Mode - It's at this point that we give those who prefer to find out these things for themselves a chance to jump past the next section and re-join us immediately after it. If you don't want to know about the wizard mode, just click this and we'll see you after we've spilled the beans on all the cool stuff. The Rolling Stone's wizard mode, Encore, is split into two sections and which parts you get to play depends on how well you've done so far."
    },
    "freddy a nightmare on elm street": {
      "complete one elm target bank": "TV target - When a Nightmare is not running, hit the TV target in the lower right to start it flashing. It will continue to flash until about 3 seconds pass without the target being hit again. Hitting the target while it is flashing scores 10,000,000 points the first time, increases by 10,000,000 each subsequent time, and maxes out at 60,000,000 before resetting back to 10,000,000 for the 7th hit. If a Nightmare is running, the TV target will always flash, and hitting it scores the current Pop Bonus, equal to 300,000 points per pop bumper hit this ball (flashing bumpers during Nightmare 5 contribute 1,000,000 instead) and maxing out at 96,000,000 points.",
      "collect a dream award": "Dream Warriors can be qualified in two ways: - Collect a Multiball Jackpot (from any Multiball Nightmare), a Freddy Jackpot (from Nightmare 4 or 6), and a Combo Jackpot (any time during single ball, non-Nightmare play), then shoot the Mystery popper in the lower left when no multiball or Nightmare is running Spend Kruegerands to start the mode directly (you may need anywhere from 50 to 90 to be presented the option) Dream Warriors is a 4-ball multiball with generous ball save. Dream Warriors ends when there is only one ball in play.",
      "light lock for multiball": "Being Asleep: Nightmare modes - Nightmares 2, 4, and 6 start out as single-ball Nightmares, though they can be upgraded to Multiball Nightmares by collecting a Freddy's Bones award during Awake phase before starting the Nightmare. Nightmares that are started as single-ball Nightmares are timed to 20 long seconds (it's really closer to 30 real-life seconds). Single-ball Nightmares end when time runs out or when Freddy is grabbed; there is no additional round of Jackpots like there is in Multiball Nightmares. Draining during a single-ball Nightmare ends the Nightmare.",
      "collect a mystery award": "2... Mystery award - Mystery is almost always lit at the lower left popper, even during Nightmares and multiballs.",
      "complete one freddy letter set": "Being Asleep: Nightmare modes - Nightmares 2, 4, and 6 start out as single-ball Nightmares, though they can be upgraded to Multiball Nightmares by collecting a Freddy's Bones award during Awake phase before starting the Nightmare. Nightmares that are started as single-ball Nightmares are timed to 20 long seconds (it's really closer to 30 real-life seconds). Single-ball Nightmares end when time runs out or when Freddy is grabbed; there is no additional round of Jackpots like there is in Multiball Nightmares. Draining during a single-ball Nightmare ends the Nightmare.",
      "lock 1 ball for multiball": "Being Asleep: Nightmare modes - Nightmares 2, 4, and 6 start out as single-ball Nightmares, though they can be upgraded to Multiball Nightmares by collecting a Freddy's Bones award during Awake phase before starting the Nightmare. Nightmares that are started as single-ball Nightmares are timed to 20 long seconds (it's really closer to 30 real-life seconds). Single-ball Nightmares end when time runs out or when Freddy is grabbed; there is no additional round of Jackpots like there is in Multiball Nightmares. Draining during a single-ball Nightmare ends the Nightmare.",
      "start multiball": "Being Asleep: Nightmare modes - Nightmares 2, 4, and 6 start out as single-ball Nightmares, though they can be upgraded to Multiball Nightmares by collecting a Freddy's Bones award during Awake phase before starting the Nightmare. Nightmares that are started as single-ball Nightmares are timed to 20 long seconds (it's really closer to 30 real-life seconds). Single-ball Nightmares end when time runs out or when Freddy is grabbed; there is no additional round of Jackpots like there is in Multiball Nightmares. Draining during a single-ball Nightmare ends the Nightmare.",
      "collect a jackpot": "Being Asleep: Nightmare modes - Nightmare 4: Shoot Roving Jackpot. In addition to the Freddy inserts being lit for the main Nightmare rules, one shot at a time (moving every few seconds) will be lit for Jackpot. Shooting a shot lit for Jackpot scores a Freddy Jackpot, which seems to always be worth 20,000,000 points. Earning a Freddy Jackpot is one of the requirements for the normal method of qualifying Dream Warriors wizard mode. Nightmare 6: Shoot Soul Targets And Roving Jackpot. This combines the rules to the bonus features from Nightmare 3 and Nightmare 4 listed above.",
      "complete any dream mode": "Dream Warriors can be qualified in two ways: - Collect a Multiball Jackpot (from any Multiball Nightmare), a Freddy Jackpot (from Nightmare 4 or 6), and a Combo Jackpot (any time during single ball, non-Nightmare play), then shoot the Mystery popper in the lower left when no multiball or Nightmare is running Spend Kruegerands to start the mode directly (you may need anywhere from 50 to 90 to be presented the option) Dream Warriors is a 4-ball multiball with generous ball save. Dream Warriors ends when there is only one ball in play.",
      "lock 2 balls toward multiball": "Being Asleep: Nightmare modes - Nightmares 2, 4, and 6 start out as single-ball Nightmares, though they can be upgraded to Multiball Nightmares by collecting a Freddy's Bones award during Awake phase before starting the Nightmare. Nightmares that are started as single-ball Nightmares are timed to 20 long seconds (it's really closer to 30 real-life seconds). Single-ball Nightmares end when time runs out or when Freddy is grabbed; there is no additional round of Jackpots like there is in Multiball Nightmares. Draining during a single-ball Nightmare ends the Nightmare.",
      "start multiball and collect a jackpot": "Being Asleep: Nightmare modes - Nightmares 2, 4, and 6 start out as single-ball Nightmares, though they can be upgraded to Multiball Nightmares by collecting a Freddy's Bones award during Awake phase before starting the Nightmare. Nightmares that are started as single-ball Nightmares are timed to 20 long seconds (it's really closer to 30 real-life seconds). Single-ball Nightmares end when time runs out or when Freddy is grabbed; there is no additional round of Jackpots like there is in Multiball Nightmares. Draining during a single-ball Nightmare ends the Nightmare.",
      "collect a super jackpot": "Dream Warriors can be qualified in two ways: - Collect a Multiball Jackpot (from any Multiball Nightmare), a Freddy Jackpot (from Nightmare 4 or 6), and a Combo Jackpot (any time during single ball, non-Nightmare play), then shoot the Mystery popper in the lower left when no multiball or Nightmare is running Dream Warriors is a 4-ball multiball with generous ball save. Dream Warriors ends when there is only one ball in play. During Dream Warriors, one shot at a time is flashing. Make the flashing shot to score a 100,000,000 points Super Jackpot, which lights that shot solidly and causes a new shot to flash.",
      "complete 2 dream modes in one game": "Being Asleep: Nightmare modes - Falling Asleep instantly starts the next Nightmare mode. To fall Asleep, shoot the Boiler Room when it is lit for Fall Asleep (or as part of a skill shot), or play in Awake mode for a while without hitting a Coffee target to cause the light on the Awake meter to fall to the bottom. If the Boiler Room is not lit for Fall Asleep, hitting the wall in front of the Boiler Room will light it. Nightmares 2, 4, and 6 start out as single-ball Nightmares, though they can be upgraded to Multiball Nightmares by collecting a Freddy's Bones award during Awake phase before starting the Nightmare.",
      "spell freddy once": "Being Asleep: Nightmare modes - Nightmares 2, 4, and 6 start out as single-ball Nightmares, though they can be upgraded to Multiball Nightmares by collecting a Freddy's Bones award during Awake phase before starting the Nightmare. Nightmares that are started as single-ball Nightmares are timed to 20 long seconds (it's really closer to 30 real-life seconds). Single-ball Nightmares end when time runs out or when Freddy is grabbed; there is no additional round of Jackpots like there is in Multiball Nightmares. Draining during a single-ball Nightmare ends the Nightmare."
    },
    "monster bash": {
      "start any monster mode": "Monster weapons - Each of the six monsters has their own Weapon, which can be collected either at the skill shot or by making the center lane a multiple of 3 times. Weapons are used during their modes by pressing the Launch button. The Weapons act like smart bombs, and spot one shot toward completing that mode. If you have Weapons for multiple monsters whose modes are running concurrently, the used Weapon will be whichever monster is closer to completing their mode. The weapons are: Creature from the Black Lagoon: spear gun.",
      "collect one monster instrument": "Monster weapons - Each of the six monsters has their own Weapon, which can be collected either at the skill shot or by making the center lane a multiple of 3 times. Weapons are used during their modes by pressing the Launch button. The Weapons act like smart bombs, and spot one shot toward completing that mode. If you have Weapons for multiple monsters whose modes are running concurrently, the used Weapon will be whichever monster is closer to completing their mode. The weapons are: Creature from the Black Lagoon: spear gun.",
      "light mosh pit multiball": "Center spinner lane and Mosh Pit Multiball - The center spinner scores points (I haven't figured out exactly how many, seems to be variable). During single ball play when no mode is running, a shot up the center lane that goes around the back of the game and down the left orbit scores one Mosh Pit. The 6th Mosh Pit, and every 18th after that (24th, 42nd, 60th, etc), lights the scoop for Mosh Pit Multiball. The 12th and 30th Mosh Pits light the scoop for extra ball. All other multiples of 3 Mosh Pits award a random monster weapon.",
      "shoot the center shot 3 times": "Center spinner lane and Mosh Pit Multiball - The center spinner scores points (I haven't figured out exactly how many, seems to be variable). During single ball play when no mode is running, a shot up the center lane that goes around the back of the game and down the left orbit scores one Mosh Pit. The 6th Mosh Pit, and every 18th after that (24th, 42nd, 60th, etc), lights the scoop for Mosh Pit Multiball. The 12th and 30th Mosh Pits light the scoop for extra ball. All other multiples of 3 Mosh Pits award a random monster weapon.",
      "light lock for multiball": "Center spinner lane and Mosh Pit Multiball - The center spinner scores points (I haven't figured out exactly how many, seems to be variable). During single ball play when no mode is running, a shot up the center lane that goes around the back of the game and down the left orbit scores one Mosh Pit. The 6th Mosh Pit, and every 18th after that (24th, 42nd, 60th, etc), lights the scoop for Mosh Pit Multiball. The 12th and 30th Mosh Pits light the scoop for extra ball. All other multiples of 3 Mosh Pits award a random monster weapon.",
      "complete any monster mode": "Monster weapons - Each of the six monsters has their own Weapon, which can be collected either at the skill shot or by making the center lane a multiple of 3 times. Weapons are used during their modes by pressing the Launch button. The Weapons act like smart bombs, and spot one shot toward completing that mode. If you have Weapons for multiple monsters whose modes are running concurrently, the used Weapon will be whichever monster is closer to completing their mode. The weapons are: Creature from the Black Lagoon: spear gun.",
      "start frankenstein multiball": "Center spinner lane and Mosh Pit Multiball - The center spinner scores points (I haven't figured out exactly how many, seems to be variable). During single ball play when no mode is running, a shot up the center lane that goes around the back of the game and down the left orbit scores one Mosh Pit. The 6th Mosh Pit, and every 18th after that (24th, 42nd, 60th, etc), lights the scoop for Mosh Pit Multiball. The 12th and 30th Mosh Pits light the scoop for extra ball. All other multiples of 3 Mosh Pits award a random monster weapon.",
      "collect a jackpot": "Center spinner lane and Mosh Pit Multiball - Mosh Pit Multiball is started at the scoop. Initially, it is a 2-ball multiball, with a jackpot that starts at 750,000 points. ) increases the mosh pit jackpot by 5,000 points. Any major shot in the game (both orbits, both ramps, Creature, center mosh pit lane) scores the mosh pit jackpot, but does not reset its value, unlike the Mummy Jackpot. The center mosh pit lane also adds a ball to the multiball on each of the first two hits, making mosh pit effectively a 4-ball mode.",
      "start mosh pit multiball": "Center spinner lane and Mosh Pit Multiball - The center spinner scores points (I haven't figured out exactly how many, seems to be variable). During single ball play when no mode is running, a shot up the center lane that goes around the back of the game and down the left orbit scores one Mosh Pit. The 6th Mosh Pit, and every 18th after that (24th, 42nd, 60th, etc), lights the scoop for Mosh Pit Multiball. The 12th and 30th Mosh Pits light the scoop for extra ball. All other multiples of 3 Mosh Pits award a random monster weapon.",
      "complete 2 monster instruments": "Monster weapons - Each of the six monsters has their own Weapon, which can be collected either at the skill shot or by making the center lane a multiple of 3 times. Weapons are used during their modes by pressing the Launch button. The Weapons act like smart bombs, and spot one shot toward completing that mode. If you have Weapons for multiple monsters whose modes are running concurrently, the used Weapon will be whichever monster is closer to completing their mode. The weapons are: Creature from the Black Lagoon: spear gun.",
      "start multiball and collect a jackpot": "Center spinner lane and Mosh Pit Multiball - The center spinner scores points (I haven't figured out exactly how many, seems to be variable). During single ball play when no mode is running, a shot up the center lane that goes around the back of the game and down the left orbit scores one Mosh Pit. The 6th Mosh Pit, and every 18th after that (24th, 42nd, 60th, etc), lights the scoop for Mosh Pit Multiball. The 12th and 30th Mosh Pits light the scoop for extra ball. All other multiples of 3 Mosh Pits award a random monster weapon.",
      "collect a super jackpot": "Center spinner lane and Mosh Pit Multiball - Mosh Pit Multiball is started at the scoop. Initially, it is a 2-ball multiball, with a jackpot that starts at 750,000 points. ) increases the mosh pit jackpot by 5,000 points. Any major shot in the game (both orbits, both ramps, Creature, center mosh pit lane) scores the mosh pit jackpot, but does not reset its value, unlike the Mummy Jackpot. The center mosh pit lane also adds a ball to the multiball on each of the first two hits, making mosh pit effectively a 4-ball mode.",
      "complete 2 monster modes in one game": "Monster weapons - Each of the six monsters has their own Weapon, which can be collected either at the skill shot or by making the center lane a multiple of 3 times. Weapons are used during their modes by pressing the Launch button. The Weapons act like smart bombs, and spot one shot toward completing that mode. If you have Weapons for multiple monsters whose modes are running concurrently, the used Weapon will be whichever monster is closer to completing their mode. The weapons are: Creature from the Black Lagoon: spear gun.",
      "start monster bash": "Monster weapons - Each of the six monsters has their own Weapon, which can be collected either at the skill shot or by making the center lane a multiple of 3 times. Weapons are used during their modes by pressing the Launch button. The Weapons act like smart bombs, and spot one shot toward completing that mode. If you have Weapons for multiple monsters whose modes are running concurrently, the used Weapon will be whichever monster is closer to completing their mode. The weapons are: Creature from the Black Lagoon: spear gun.",
      "start both frankenstein and mosh pit multiball in one game": "Center spinner lane and Mosh Pit Multiball - The center spinner scores points (I haven't figured out exactly how many, seems to be variable). During single ball play when no mode is running, a shot up the center lane that goes around the back of the game and down the left orbit scores one Mosh Pit. The 6th Mosh Pit, and every 18th after that (24th, 42nd, 60th, etc), lights the scoop for Mosh Pit Multiball. The 12th and 30th Mosh Pits light the scoop for extra ball. All other multiples of 3 Mosh Pits award a random monster weapon."
    },
    "tales from the crypt": {
      "collect a door prize award": "Starting at the top and going clockwise, the 12 clock modes are the following: - Door Prize: a video mode. Select one of three doors. If the door has points (anywhere from 5,000,000 to 20,000,000), you stay in the game and pick from a new set of doors. If you pick a door with a Zombie behind it, the mode ends. It's completely random where the zombie will be. On some settings, an extra ball or special may be awarded by surviving 3 rounds of the video mode. Frightmare: super spinners. Collect a total of 30 spins to any of the 3 spinners within 25 seconds to score 25,000,000.",
      "complete one keeper target bank": "Starting at the top and going clockwise, the 12 clock modes are the following: - Super Keeper Targets: for 25 seconds, the 6 eyeball standup targets in the lower corners of the game are worth millions-plus. Each one starts at 2,000,000 points: hitting a target increases that specific target's value by 1,000,000 points, up to a maximum of 5,000,000. Supposedly, maxing out all 6 targets at the 5,000,000 value by hitting them 3 times each scores a 99,000,000 point bonus, but I have not seen or done this myself. Super Guillotine Targets: very similar to Super Keeper targets, but deals with the 3-bank of drop targets.",
      "light lock for multiball": "Multiball - Shoot the tombstone between the center scoop and the 3-bank drop targets to earn letters in Crypt. Crypt letters also seem to be able to be spotted by 10 bumper hits. When Crypt is completed, the tombstone will lower; shoot the scoop behind it to start multiball. The tombstone can be a finnicky target, and often doesn't register hits quite as well as, say, the bookcase on Addams Family. The C toward the first multiball is given at the beginning of the game, and two letters are spotted for free at the start of each ball until the first multiball is played, so multiball is guaranteed to be ready to start ball 3 at the very least.",
      "shoot the ramp 3 times": "Ramps and Frenzy modes - If something is flashing in front of the left ramp, shooting the left ramp collects it: Rats, Bats, Ghosts, and Goblins are worth about 3,000,000 each (the exact value is unclear). Shooting the left ramp when nothing is flashing scores about 750,000 points and starts one of the features flashing. Completing the Rats, Bats, Ghosts, and Goblins starts a Frenzy mode if one is flashing at the right ramp, or lights a Frenzy mode if nothing is flashing at the right ramp. There are 4 Frenzy modes in the game: Living Dead, Chainsaw, Grave Digger, and Play the Organ.",
      "collect a mystery award": "Drop target 4-bank - In addition to being used on the skill shot, these targets function similarly to the Keeper targets. Completing the bank advances the bonus multiplier up through the 2x-4x-6x-8x sequence, or each drop target scores 1,000,000 points if bonus multiplier is maxed at 8x. Going through the left in lane then shooting any drop target scores a Door Prize mystery award of between 1,000,000 and 3,000,000 points.",
      "complete any mode": "Starting at the top and going clockwise, the 12 clock modes are the following: - Door Prize: a video mode. Select one of three doors. If the door has points (anywhere from 5,000,000 to 20,000,000), you stay in the game and pick from a new set of doors. If you pick a door with a Zombie behind it, the mode ends. It's completely random where the zombie will be. On some settings, an extra ball or special may be awarded by surviving 3 rounds of the video mode. Electric Chair: a quick 6-ball multiball. Shoot the mode start scoop to score 1,000,000 points times the number of balls in play.",
      "lock 1 ball for multiball": "Multiball - Shoot the tombstone between the center scoop and the 3-bank drop targets to earn letters in Crypt. Crypt letters also seem to be able to be spotted by 10 bumper hits. When Crypt is completed, the tombstone will lower; shoot the scoop behind it to start multiball. The tombstone can be a finnicky target, and often doesn't register hits quite as well as, say, the bookcase on Addams Family. The C toward the first multiball is given at the beginning of the game, and two letters are spotted for free at the start of each ball until the first multiball is played, so multiball is guaranteed to be ready to start ball 3 at the very least.",
      "start multiball": "Multiball - Shoot the tombstone between the center scoop and the 3-bank drop targets to earn letters in Crypt. Crypt letters also seem to be able to be spotted by 10 bumper hits. When Crypt is completed, the tombstone will lower; shoot the scoop behind it to start multiball. The tombstone can be a finnicky target, and often doesn't register hits quite as well as, say, the bookcase on Addams Family. The C toward the first multiball is given at the beginning of the game, and two letters are spotted for free at the start of each ball until the first multiball is played, so multiball is guaranteed to be ready to start ball 3 at the very least.",
      "collect a jackpot": "Multiball - Crypt Multiball begins as a 3-ball multiball. The jackpot starts at 25,000,000 points. Shooting a ball into the Crypt increases the jackpot by 1,000,000 points times the number of balls in play. Shooting any spinner increases the jackpot by 130,000 points per spin. The left ramp scores the first jackpot. The second jackpot is at the right ramp: it starts at 2x the value of the first jackpot, and the spinner/Crypt shots to increase it add double value as well. Up until the double jackpot is collected at the right ramp, hitting the left captive ball adds a ball to the multiball, up to a maximum of 6 balls in play.",
      "collect 2 door prize awards in one game": "Starting at the top and going clockwise, the 12 clock modes are the following: - Door Prize: a video mode. Select one of three doors. If the door has points (anywhere from 5,000,000 to 20,000,000), you stay in the game and pick from a new set of doors. If you pick a door with a Zombie behind it, the mode ends. It's completely random where the zombie will be. On some settings, an extra ball or special may be awarded by surviving 3 rounds of the video mode. Frightmare: super spinners. Collect a total of 30 spins to any of the 3 spinners within 25 seconds to score 25,000,000.",
      "lock 2 balls toward multiball": "Multiball - Shoot the tombstone between the center scoop and the 3-bank drop targets to earn letters in Crypt. Crypt letters also seem to be able to be spotted by 10 bumper hits. When Crypt is completed, the tombstone will lower; shoot the scoop behind it to start multiball. The tombstone can be a finnicky target, and often doesn't register hits quite as well as, say, the bookcase on Addams Family. The C toward the first multiball is given at the beginning of the game, and two letters are spotted for free at the start of each ball until the first multiball is played, so multiball is guaranteed to be ready to start ball 3 at the very least.",
      "start multiball and collect a jackpot": "Multiball - Shoot the tombstone between the center scoop and the 3-bank drop targets to earn letters in Crypt. Crypt letters also seem to be able to be spotted by 10 bumper hits. When Crypt is completed, the tombstone will lower; shoot the scoop behind it to start multiball. The tombstone can be a finnicky target, and often doesn't register hits quite as well as, say, the bookcase on Addams Family. The C toward the first multiball is given at the beginning of the game, and two letters are spotted for free at the start of each ball until the first multiball is played, so multiball is guaranteed to be ready to start ball 3 at the very least.",
      "collect a super jackpot": "Multiball - Crypt Multiball begins as a 3-ball multiball. The jackpot starts at 25,000,000 points. Shooting a ball into the Crypt increases the jackpot by 1,000,000 points times the number of balls in play. Shooting any spinner increases the jackpot by 130,000 points per spin. The left ramp scores the first jackpot. The second jackpot is at the right ramp: it starts at 2x the value of the first jackpot, and the spinner/Crypt shots to increase it add double value as well. Up until the double jackpot is collected at the right ramp, hitting the left captive ball adds a ball to the multiball, up to a maximum of 6 balls in play.",
      "complete 2 modes in one game": "Starting at the top and going clockwise, the 12 clock modes are the following: - Super Keeper Targets: for 25 seconds, the 6 eyeball standup targets in the lower corners of the game are worth millions-plus. Each one starts at 2,000,000 points: hitting a target increases that specific target's value by 1,000,000 points, up to a maximum of 5,000,000. Supposedly, maxing out all 6 targets at the 5,000,000 value by hitting them 3 times each scores a 99,000,000 point bonus, but I have not seen or done this myself. Thunderstorm: shoot as many ramps as possible within 25 seconds.",
      "upgrade the kickback for the rest of the ball": "Multiball - The C toward the first multiball is given at the beginning of the game, and two letters are spotted for free at the start of each ball until the first multiball is played, so multiball is guaranteed to be ready to start ball 3 at the very least. Also for the first multiball only, you can start or restart the multiball at the center spinner just left of the right ramp, in addition to the start at the Crypt. Crypt Multiball begins as a 3-ball multiball. The jackpot starts at 25,000,000 points. Shooting a ball into the Crypt increases the jackpot by 1,000,000 points times the number of balls in play."
    },
    "game of thrones": {
      "start any house mode": "Iron Throne Wizard Mode: - Completing all of the house modes lights the mode start shot for IT wizard mode. Like HOTK, this multiball is is based on completing sets of shots. All of the central house lights that normally signify mode completion turn off at the beginning of the mode. All house shots are lit to start a siege on their castle and light a set of shots.",
      "light lock for multiball": "honestly something that not many players seek, so if anyone has any information on it fill me in here. :sweat_smile: Stark: 1 Advance value (just like a ramp shot). Collecting the castle also lights the targets. Baratheon: Build Baratheon Jackpot. Collecting the castle also lights the targets.",
      "collect a multiplier award": "Targaryen: +500,000 per shot award - Bear in mind that even though Stark, Baratheon and Martell sound undesriable to bring in, they do offer more opportunities for shots that can mitigate what would be an otherwise poor HOTK. HOTK is a mini wizard mode that is completed in \"sets\". Each set starts with four shots to complete (or 7 if Baratheon is brought in).",
      "complete any house mode": "Iron Throne Wizard Mode: - Completing all of the house modes lights the mode start shot for IT wizard mode. Like HOTK, this multiball is is based on completing sets of shots. All of the central house lights that normally signify mode completion turn off at the beginning of the mode. All house shots are lit to start a siege on their castle and light a set of shots.",
      "lock 1 ball for multiball": "honestly something that not many players seek, so if anyone has any information on it fill me in here. :sweat_smile: Stark: 1 Advance value (just like a ramp shot). Collecting the castle also lights the targets. Baratheon: Build Baratheon Jackpot. Collecting the castle also lights the targets.",
      "start multiball": "honestly something that not many players seek, so if anyone has any information on it fill me in here. :sweat_smile: Stark: 1 Advance value (just like a ramp shot). Collecting the castle also lights the targets. Baratheon: Build Baratheon Jackpot. Collecting the castle also lights the targets.",
      "collect a jackpot": "The value collected from shots also adds to the Super Jackpot value - After completing all the shots that are lit, the super jackpot will be lit at the battering ram. The Super is determined through the best four shots made in the set. Collecting the super will complete the set. Completing 3 sets (2 if Greyjoy is brought in) will start an even larger hurry up at the battering ram. Once this is collected or times out, everything starts over. You'll also notice that the inlanes will be flashing yellow. A ball that travels through the inlane will increase the combo value of each of the main shots to the by 1x, and set all shots to the maximum current shot multiplier.",
      "start wall multiball": "honestly something that not many players seek, so if anyone has any information on it fill me in here. :sweat_smile: Stark: 1 Advance value (just like a ramp shot). Collecting the castle also lights the targets. Baratheon: Build Baratheon Jackpot. Collecting the castle also lights the targets.",
      "lock 2 balls toward multiball": "honestly something that not many players seek, so if anyone has any information on it fill me in here. :sweat_smile: Stark: 1 Advance value (just like a ramp shot). Collecting the castle also lights the targets. Baratheon: Build Baratheon Jackpot. Collecting the castle also lights the targets.",
      "start multiball and collect a jackpot": "honestly something that not many players seek, so if anyone has any information on it fill me in here. :sweat_smile: Stark: 1 Advance value (just like a ramp shot). Collecting the castle also lights the targets. Baratheon: Build Baratheon Jackpot. Collecting the castle also lights the targets.",
      "complete 2 house modes in one game": "If only one house is lit the house will start without a prompt during CHOOSE YOUR BATTLE - Flashing effects will be set to the less intense setting. Difficulty, HOME, and Directors Cut INSTALLS will change the setting. Holding the right flipper button for 3 seconds before starting a game will allow the game to start NOT in casual mode if desired. If you are approaching a machine in the wild, it may be wise to quickly flipper through the attract mode. If casual mode is on, one of the screens will be a description of how to enable \"advanced play\".",
      "collect a super jackpot": "The value collected from shots also adds to the Super Jackpot value - After completing all the shots that are lit, the super jackpot will be lit at the battering ram. The Super is determined through the best four shots made in the set. Collecting the super will complete the set. Completing 3 sets (2 if Greyjoy is brought in) will start an even larger hurry up at the battering ram. Once this is collected or times out, everything starts over. You'll also notice that the inlanes will be flashing yellow. A ball that travels through the inlane will increase the combo value of each of the main shots to the by 1x, and set all shots to the maximum current shot multiplier.",
      "start blackwater multiball": "honestly something that not many players seek, so if anyone has any information on it fill me in here. :sweat_smile: Stark: 1 Advance value (just like a ramp shot). Collecting the castle also lights the targets. Baratheon: Build Baratheon Jackpot. Collecting the castle also lights the targets."
    },
    "lord of the rings": {
      "start any ring mode": "Ring modes - There are six Ring modes selectable around the ring display. Use the flippers before starting a mode to change which one is selected. Start the lit mode by shooting the center ring shot. Playing all six modes is part of the long Valinor route and leads toward There and Back Again. For a normal game, modes are still useful because completing modes can award Gifts of the Elves, and War of the Ents is particularly helpful for Return of the King progress.",
      "collect 3 elf rings to light a mode": "Ring systems - Elf rings light Ring modes. Collect three Elf shots to light a mode at the center ring shot. At the start of a game, a mode may already be lit because the game gives enough Elf rings by default. Dwarf rings light mystery / Palantir. Collect all Dwarf rings to make the Palantir mystery award available. Rings of Men qualify Gollum Multiball. When one Man shot is made, other Man shots can flash for short combo opportunities that award more progress. Collect all Rings of Men to light Gollum Multiball at the scoop.",
      "spell keep once": "Quick strategy synopsis - For Two Towers, spell KEEP in the inlanes/outlanes to light lock, then shoot the Aragorn right ramp to lock balls on the sword. Lock enough balls and shoot the lock again to start Two Towers Multiball. If you are new to the game, ignore Valinor at first. Focus on learning the center ring shot, the Legolas left ramp, the Aragorn right ramp, the left orbit / Paths of the Dead feed, and how to spell KEEP.",
      "light lock for multiball": "Return of the King Multiball - Feed the right inlane, then shoot the left orbit so the diverter sends the ball up. Start War of the Ents, then shoot directly through the opened tower diverter. Once enough souls are collected, Return of the King Multiball is qualified. It can start immediately if the ball is already routed into the right place. During the multiball, shoot lit shots to make progress. This is often the hardest of the three main multiballs to qualify because it requires repeated Paths of the Dead trips.",
      "collect a mystery award": "Ring systems - Dwarf rings light mystery / Palantir. Collect all Dwarf rings to make the Palantir mystery award available. Rings of Men qualify Gollum Multiball. When one Man shot is made, other Man shots can flash for short combo opportunities that award more progress. Collect all Rings of Men to light Gollum Multiball at the scoop.",
      "complete any ring mode": "Ring modes - There are six Ring modes selectable around the ring display. Use the flippers before starting a mode to change which one is selected. Start the lit mode by shooting the center ring shot. Playing all six modes is part of the long Valinor route and leads toward There and Back Again. For a normal game, modes are still useful because completing modes can award Gifts of the Elves, and War of the Ents is particularly helpful for Return of the King progress.",
      "lock 1 ball for multiball": "Return of the King Multiball - Feed the right inlane, then shoot the left orbit so the diverter sends the ball up. Start War of the Ents, then shoot directly through the opened tower diverter. Once enough souls are collected, Return of the King Multiball is qualified. It can start immediately if the ball is already routed into the right place. During the multiball, shoot lit shots to make progress. This is often the hardest of the three main multiballs to qualify because it requires repeated Paths of the Dead trips.",
      "start multiball": "Return of the King Multiball - Feed the right inlane, then shoot the left orbit so the diverter sends the ball up. Start War of the Ents, then shoot directly through the opened tower diverter. Once enough souls are collected, Return of the King Multiball is qualified. It can start immediately if the ball is already routed into the right place. During the multiball, shoot lit shots to make progress. This is often the hardest of the three main multiballs to qualify because it requires repeated Paths of the Dead trips.",
      "start fellowship of the ring multiball": "Fellowship of the Ring Multiball - Fellowship is qualified by completing the nine Fellowship member shots:",
      "collect a gift of the elves award": "Gifts of the Elves - Gifts of the Elves are awards earned after completing major objectives such as modes or multiballs. When a Gift is lit, shoot the far-left route / saucer path to collect it. One Gift can light Extra Ball, which is then collected at the Gimli saucer. Collecting all seven Gifts is part of the route to Valinor.",
      "collect 5 000 souls on paths of the dead": "Return of the King Multiball - Once enough souls are collected, Return of the King Multiball is qualified. It can start immediately if the ball is already routed into the right place. During the multiball, shoot lit shots to make progress. This is often the hardest of the three main multiballs to qualify because it requires repeated Paths of the Dead trips.",
      "start return of the king multiball": "Return of the King Multiball - Feed the right inlane, then shoot the left orbit so the diverter sends the ball up. Start War of the Ents, then shoot directly through the opened tower diverter. Once enough souls are collected, Return of the King Multiball is qualified. It can start immediately if the ball is already routed into the right place. During the multiball, shoot lit shots to make progress. This is often the hardest of the three main multiballs to qualify because it requires repeated Paths of the Dead trips.",
      "start destroy the ring": "Destroy the Ring - After the three main multiballs have been started, Destroy the Ring lights at the center ring shot. Shoot the center shot to begin. The ring magnet holds the ball and the music and lighting change. Destroy the Ring requires four lit shots, followed by a final center ring shot. On the final shot, the ball must reach the ring magnet sequence and be knocked off / released to complete the destruction. If you drain during Destroy the Ring, the mode ends, and you must requalify it by starting the three main multiballs again.",
      "destroy the ring": "Destroy the Ring - After the three main multiballs have been started, Destroy the Ring lights at the center ring shot. Shoot the center shot to begin. The ring magnet holds the ball and the music and lighting change. Destroy the Ring requires four lit shots, followed by a final center ring shot. On the final shot, the ball must reach the ring magnet sequence and be knocked off / released to complete the destruction. If you drain during Destroy the Ring, the mode ends, and you must requalify it by starting the three main multiballs again.",
      "start two towers multiball": "Two Towers Multiball - Two Towers is built from KEEP and the Aragorn ramp. Spell KEEP, then shoot the Aragorn right ramp to lock a ball on the sword. Lock the required balls, then shoot the lock again to start Two Towers Multiball. During Two Towers, shoot the red flashing shots. This is one of the three main multiballs required to light Destroy the Ring."
    },
    "the walking dead": {
      "start any prison mode": "Prison Multiball - Prison Multiball is a 3 ball multiball. By default there is a medium length ball save period and no add a ball in Prison Multiball. From Prison Multiball, only Blood Bath multiball can be stacked. During Prison Multiball, hitting the closed doors or a major shot opens the doors to expose the zombie head. Hitting the zombie head closes the doors and relights shots. Rinse and repeat for various jackpots (usually somewhere around 1 million). During the multiball, the value of the prison yard walkers increases each time a prison yard walker is killed while the multiball is running.",
      "collect a supply drop award": "Blood Bath Multiball - Blood Bath multiball is qualified by collecting a full set of supply inserts shown in front of the drop target bank. In single ball play the supply inserts will light in sequence from First aid to Weapons and finally to Food. Whenever any of the drop targets are hit the currently lit supply will be locked in. Once all drops have been completed the lit supply will remain solid to indicate that supply has been collected. Once all supplies have been collected the Blood Bath insert will strobe. Clearing the bank once more will begin blood bath multiball.",
      "shoot the prison shot 3 times": "Prison Multiball - Prison Multiball is a 3 ball multiball. By default there is a medium length ball save period and no add a ball in Prison Multiball. From Prison Multiball, only Blood Bath multiball can be stacked. During Prison Multiball, hitting the closed doors or a major shot opens the doors to expose the zombie head. Hitting the zombie head closes the doors and relights shots. Rinse and repeat for various jackpots (usually somewhere around 1 million). During the multiball, the value of the prison yard walkers increases each time a prison yard walker is killed while the multiball is running.",
      "light lock for multiball": "Prison Multiball - Prison Multiball is a 3 ball multiball. By default there is a medium length ball save period and no add a ball in Prison Multiball. From Prison Multiball, only Blood Bath multiball can be stacked. During Prison Multiball, hitting the closed doors or a major shot opens the doors to expose the zombie head. Hitting the zombie head closes the doors and relights shots. Rinse and repeat for various jackpots (usually somewhere around 1 million). During the multiball, the value of the prison yard walkers increases each time a prison yard walker is killed while the multiball is running.",
      "collect a mystery award": "The Dead Features are: - Tunnel: Started at the Railroad (Tunnel) shot. All shots light for 5M. 5M. Making any non-Tunnel shot locks in the award value and lights the Tunnel shot to complete the mode. 5M to each one. A Multi-Kill is awarded after 2 lit shots are made. Arena: Started at the right ramp. Repeatedly shoot the right ramp to score increasing values starting at a base value of 3M and increasing by 3x, 6x, 9x, etc. If the right ramp is shot out of a repeated combo, the value will be halved. 5M. After any right ramp shot, the Woodbury shot will briefly light to end the mode and collect roughly 20% of the total number of points earned by shooting the ramp.",
      "complete any prison mode": "Prison Multiball - Prison Multiball is a 3 ball multiball. By default there is a medium length ball save period and no add a ball in Prison Multiball. From Prison Multiball, only Blood Bath multiball can be stacked. During Prison Multiball, hitting the closed doors or a major shot opens the doors to expose the zombie head. Hitting the zombie head closes the doors and relights shots. Rinse and repeat for various jackpots (usually somewhere around 1 million). During the multiball, the value of the prison yard walkers increases each time a prison yard walker is killed while the multiball is running.",
      "lock 1 ball for multiball": "Prison Multiball - Prison Multiball is a 3 ball multiball. By default there is a medium length ball save period and no add a ball in Prison Multiball. From Prison Multiball, only Blood Bath multiball can be stacked. During Prison Multiball, hitting the closed doors or a major shot opens the doors to expose the zombie head. Hitting the zombie head closes the doors and relights shots. Rinse and repeat for various jackpots (usually somewhere around 1 million). During the multiball, the value of the prison yard walkers increases each time a prison yard walker is killed while the multiball is running.",
      "start multiball": "Prison Multiball - Prison Multiball is a 3 ball multiball. By default there is a medium length ball save period and no add a ball in Prison Multiball. From Prison Multiball, only Blood Bath multiball can be stacked. During Prison Multiball, hitting the closed doors or a major shot opens the doors to expose the zombie head. Hitting the zombie head closes the doors and relights shots. Rinse and repeat for various jackpots (usually somewhere around 1 million). During the multiball, the value of the prison yard walkers increases each time a prison yard walker is killed while the multiball is running.",
      "collect a jackpot": "During MB: - During phase one of Well Walker multiball, each letter is relit by hitting a certain number of switches. W: 25, E: 30, L: 35, L: 40 (although the previous jackpot also counts so it's really 29, 34, 39). The well walker jackpot continues to build for every switch hit. g. 50k no letters lit, 55k one letter lit up to 75k if all letters were lit. Normally somewhere around 300-350k. Once a letter is completed with the switch hits, the well walker jackpot is lit and hitting the walker collects the current jackpot value and then resets it to zero.",
      "start blood bath": "Blood Bath Multiball - Blood Bath multiball is qualified by collecting a full set of supply inserts shown in front of the drop target bank. In single ball play the supply inserts will light in sequence from First aid to Weapons and finally to Food. Whenever any of the drop targets are hit the currently lit supply will be locked in. Once all drops have been completed the lit supply will remain solid to indicate that supply has been collected. Once all supplies have been collected the Blood Bath insert will strobe. Clearing the bank once more will begin blood bath multiball.",
      "lock 2 balls toward multiball": "Prison Multiball - Prison Multiball is a 3 ball multiball. By default there is a medium length ball save period and no add a ball in Prison Multiball. From Prison Multiball, only Blood Bath multiball can be stacked. During Prison Multiball, hitting the closed doors or a major shot opens the doors to expose the zombie head. Hitting the zombie head closes the doors and relights shots. Rinse and repeat for various jackpots (usually somewhere around 1 million). During the multiball, the value of the prison yard walkers increases each time a prison yard walker is killed while the multiball is running.",
      "start multiball and collect a jackpot": "Prison Multiball - Prison Multiball is a 3 ball multiball. By default there is a medium length ball save period and no add a ball in Prison Multiball. From Prison Multiball, only Blood Bath multiball can be stacked. During Prison Multiball, hitting the closed doors or a major shot opens the doors to expose the zombie head. Hitting the zombie head closes the doors and relights shots. Rinse and repeat for various jackpots (usually somewhere around 1 million). During the multiball, the value of the prison yard walkers increases each time a prison yard walker is killed while the multiball is running.",
      "complete 2 prison modes in one game": "Prison Multiball - Prison Multiball is a 3 ball multiball. By default there is a medium length ball save period and no add a ball in Prison Multiball. From Prison Multiball, only Blood Bath multiball can be stacked. During Prison Multiball, hitting the closed doors or a major shot opens the doors to expose the zombie head. Hitting the zombie head closes the doors and relights shots. Rinse and repeat for various jackpots (usually somewhere around 1 million). During the multiball, the value of the prison yard walkers increases each time a prison yard walker is killed while the multiball is running.",
      "collect a super jackpot": "During MB: - During phase one of Well Walker multiball, each letter is relit by hitting a certain number of switches. W: 25, E: 30, L: 35, L: 40 (although the previous jackpot also counts so it's really 29, 34, 39). The well walker jackpot continues to build for every switch hit. g. 50k no letters lit, 55k one letter lit up to 75k if all letters were lit. Normally somewhere around 300-350k. Once a letter is completed with the switch hits, the well walker jackpot is lit and hitting the walker collects the current jackpot value and then resets it to zero.",
      "complete well walker mode": "During MB: - During phase one of Well Walker multiball, each letter is relit by hitting a certain number of switches. W: 25, E: 30, L: 35, L: 40 (although the previous jackpot also counts so it's really 29, 34, 39). The well walker jackpot continues to build for every switch hit. g. 50k no letters lit, 55k one letter lit up to 75k if all letters were lit. Normally somewhere around 300-350k. Once a letter is completed with the switch hits, the well walker jackpot is lit and hitting the walker collects the current jackpot value and then resets it to zero."
    },
    "corvette": {
      "start any race mode": "Spark Plugs and Race Today - During non-mode/multiball play, most major shots will be lit with an orange arrow. Making any shot lit in this way scores a Spark Plug. Spark Plug awards are given after every 8 Spark Plugs, and they alternate between a Spark Plug Award (20,000,000 points) or lighting Race Today at the right ramp. Race Today is a video mode that can be started at the right ramp during single-ball, non-mode play when Race Today is lit. The mode is set up like a drag race. Hold the left flipper to press the gas pedal, and press the right flipper whenever the displays says SHIFT!",
      "collect a pit stop award": "Route 66 awards: right ramp - Every 2nd shot to the right ramp gives a Route 66 award. ) Awards are always given in the same order every game, and collecting all 13 brings you back to the beginning of the sequence. 1st, 5th, and 10th award: Catch Me If You Can. Make a total of 4 shots in order. You have 20 seconds to make each shot. The order is always right orbit -> side ramp -> engine ramp -> Pit. Completing this mode scores 230,000,000 points and starts Catch Me Multiball, a 2-ball quick multiball where every switch in the game scores 500,000 points.",
      "shoot the right ramp 3 times": "Route 66 awards: right ramp - Every 2nd shot to the right ramp gives a Route 66 award. ) Awards are always given in the same order every game, and collecting all 13 brings you back to the beginning of the sequence. 1st, 5th, and 10th award: Catch Me If You Can. Make a total of 4 shots in order. You have 20 seconds to make each shot. The order is always right orbit -> side ramp -> engine ramp -> Pit. Completing this mode scores 230,000,000 points and starts Catch Me Multiball, a 2-ball quick multiball where every switch in the game scores 500,000 points.",
      "light lock for multiball": "LT-5 Multiball - LT-5 is the game's main multiball, named after the engine ramp on the left that starts it. Lock 3 balls to stat multiball. To light locks, shoot the left orbit. For the first multiball, one orbit shot lights all three locks, and locking each ball also awards a car toward Puzzle Challenge wizard mode. For the second multiball, each lock needs to be lit individually, and cars are no longer awarded for making locks. For the third multiball onwards, each lock must be lit individually, and only stays lit for about 15 seconds once the left orbit is made.",
      "collect a combo": "Track combos - Track combos are a variety of 2- and 3-way combos that are each assigned a famous racetrack. Making a combo collects that racetrack. Each combo is awarded its own value; 2-way combos are worth 6,000,000-12,000,000 points each, while 3-way combos are worth 20,000,000-24,000,000 points each. When you collect a racetrack, you not only earn that combo's value, but you also re-collect the value of all other racetracks you have collected during the current ball in play. Each racetrack collected over the course of the game also scores 4,000,000 points in base end of ball bonus at the end of every ball.",
      "complete any race mode": "Spark Plugs and Race Today - During non-mode/multiball play, most major shots will be lit with an orange arrow. Making any shot lit in this way scores a Spark Plug. Spark Plug awards are given after every 8 Spark Plugs, and they alternate between a Spark Plug Award (20,000,000 points) or lighting Race Today at the right ramp. Race Today is a video mode that can be started at the right ramp during single-ball, non-mode play when Race Today is lit. The mode is set up like a drag race. Hold the left flipper to press the gas pedal, and press the right flipper whenever the displays says SHIFT!",
      "lock 1 ball for multiball": "LT-5 Multiball - LT-5 is the game's main multiball, named after the engine ramp on the left that starts it. Lock 3 balls to stat multiball. To light locks, shoot the left orbit. For the first multiball, one orbit shot lights all three locks, and locking each ball also awards a car toward Puzzle Challenge wizard mode. For the second multiball, each lock needs to be lit individually, and cars are no longer awarded for making locks. For the third multiball onwards, each lock must be lit individually, and only stays lit for about 15 seconds once the left orbit is made.",
      "start multiball": "LT-5 Multiball - LT-5 is the game's main multiball, named after the engine ramp on the left that starts it. Lock 3 balls to stat multiball. To light locks, shoot the left orbit. For the first multiball, one orbit shot lights all three locks, and locking each ball also awards a car toward Puzzle Challenge wizard mode. For the second multiball, each lock needs to be lit individually, and cars are no longer awarded for making locks. For the third multiball onwards, each lock must be lit individually, and only stays lit for about 15 seconds once the left orbit is made.",
      "collect a jackpot": "LT-5 Multiball - Starting Multiball lights the left out lane kickback if it is not lit. In multiball, jackpots are located at the upper loop and side ramp. The upper loop scores a Horsepower Jackpot which starts at 50,000,000 points. The side ramp scores a Torque Jackpot which starts at 30,000,000 points. Making a jackpot unlights it. Collecting both jackpots causes both of them to relight with their values increased by 20,000,000 each. Jackpots max out at 100,000,000 points. Jackpots can be increased by shooting the unlit engine ramp during Catch Me Multiball or during LT-5 Multiball itself.",
      "start corvette challenge": "Corvette Challenge - When the Pit scoop in the center has a green light above it, Corvette Challenge is ready. Corvette Challenge is lit for free at the start of the game. To light Corvette Challenge, make whichever shot in the game has a flashing blue car part to collect that part and qualify the Challenge. If there is no flashing blue car part, which happens after a failed Challenge, simply shooting any major shot will relight Corvette Challenge at the Pit. During Corvette Challenge, the goal is to make enough shots anywhere in the game to win the race.",
      "lock 2 balls toward multiball": "LT-5 Multiball - LT-5 is the game's main multiball, named after the engine ramp on the left that starts it. Lock 3 balls to stat multiball. To light locks, shoot the left orbit. For the first multiball, one orbit shot lights all three locks, and locking each ball also awards a car toward Puzzle Challenge wizard mode. For the second multiball, each lock needs to be lit individually, and cars are no longer awarded for making locks. For the third multiball onwards, each lock must be lit individually, and only stays lit for about 15 seconds once the left orbit is made.",
      "start multiball and collect a jackpot": "LT-5 Multiball - LT-5 is the game's main multiball, named after the engine ramp on the left that starts it. Lock 3 balls to stat multiball. To light locks, shoot the left orbit. For the first multiball, one orbit shot lights all three locks, and locking each ball also awards a car toward Puzzle Challenge wizard mode. For the second multiball, each lock needs to be lit individually, and cars are no longer awarded for making locks. For the third multiball onwards, each lock must be lit individually, and only stays lit for about 15 seconds once the left orbit is made.",
      "complete 2 race modes in one game": "Spark Plugs and Race Today - During non-mode/multiball play, most major shots will be lit with an orange arrow. Making any shot lit in this way scores a Spark Plug. Spark Plug awards are given after every 8 Spark Plugs, and they alternate between a Spark Plug Award (20,000,000 points) or lighting Race Today at the right ramp. Race Today is a video mode that can be started at the right ramp during single-ball, non-mode play when Race Today is lit. The mode is set up like a drag race. Hold the left flipper to press the gas pedal, and press the right flipper whenever the displays says SHIFT!",
      "collect a super jackpot": "LT-5 Multiball - Starting Multiball lights the left out lane kickback if it is not lit. In multiball, jackpots are located at the upper loop and side ramp. The upper loop scores a Horsepower Jackpot which starts at 50,000,000 points. The side ramp scores a Torque Jackpot which starts at 30,000,000 points. Making a jackpot unlights it. Collecting both jackpots causes both of them to relight with their values increased by 20,000,000 each. Jackpots max out at 100,000,000 points. Jackpots can be increased by shooting the unlit engine ramp during Catch Me Multiball or during LT-5 Multiball itself.",
      "complete corvette challenge": "Corvette Challenge - When the Pit scoop in the center has a green light above it, Corvette Challenge is ready. Corvette Challenge is lit for free at the start of the game. To light Corvette Challenge, make whichever shot in the game has a flashing blue car part to collect that part and qualify the Challenge. If there is no flashing blue car part, which happens after a failed Challenge, simply shooting any major shot will relight Corvette Challenge at the Pit. During Corvette Challenge, the goal is to make enough shots anywhere in the game to win the race."
    },
    "dirty harry": {
      "start any criminal mode": "Modes: the Shotgun Shell - Letter Bomb: a frenzy mode, sort of. The timer starts at 25 seconds. The frenzy value, scored by every switch in the game, starts at 100,000 points. Shooting the safe house scores 25,000,000 points and adds 100,000 to the frenzy value. 4 shots to the safe house completes the mode. Stop Scorpio: out of the four ramp and orbit shots, two are lit. They remain lit for about 10 seconds. Making a lit shot unlights it, and lights another shot in turn. Shoot the safe house to add a lit shot. All lit shots score 15,000,000 points.",
      "collect a hurry up": "Safehouse - Bank Robber Hurry-up: a left orbit hurry-up that starts out worth 50,000,000 and times out at 20,000,000. Warehouse Hurry-up: a hurry-up collectible at the Warehouse that starts at 25,000,000 and counts down to 5,000,000. Collecting this hurry-up locks in the value and adds a second ball to play: for the rest of this 2-ball multiball, all shots to the Warehouse score the locked-in value.",
      "shoot the left ramp 3 times": "Modes: the Shotgun Shell - Bar Room Brawl: for 25 seconds, shoot ramps. The base ramp value is 10,000,000 points. The right ramp scores the ramp value, while the side ramp scores double ramp value. Making either ramp increases the base ramp value by 5,000,000. Car Chase: the two orbits and the side ramp are lit. Make a total of 4 shots to any of these three locations within 20 seconds. Successful shots score 10,000,000, then 20,000,000, then 30,000,000, then 50,000,000. Warehouse Raid: shoot the Warehoue as many times as possible in 25 seconds to collect contraband.",
      "light lock for multiball": "Multiball - Hit the 5 badge shots- HQ, side ramp, safe house, Warehouse, and right ramp- at any point during the game to light multiball. Multiball is started at the Warehouse (with a 20,000,000 base jackpot value) or the side ramp (with a 25,000,000 base jackpot value). Right off the bat, one ball will be loaded into the gun, and you get one free shot at either ramp to collect an instant jackpot. Whether you succeed or not, two more balls are thrown into play for a 3-ball multiball. The right ramp scores the jackpot value, and unlights once collected; the Warehouse relights the right ramp.",
      "collect a mystery award": "Pop bumpers, top lanes, and Ransom award - The pop bumper value starts at 100,000 points. Each bumper hit will add this amount to your score and to the Ransom value. The Ransom value starts at 5,000,000 points and maxes out at 50,000,000 points. The first completion of the top lanes near the bumpers increases the bumper value to 250,000 points. The second completion advances the ransom multiplier to 2x. The third completion maxes out the bumper value at 500,000. The fourth completion maxes out the ransom multiplier at 3x.",
      "complete any criminal mode": "Modes: the Shotgun Shell - Letter Bomb: a frenzy mode, sort of. The timer starts at 25 seconds. The frenzy value, scored by every switch in the game, starts at 100,000 points. Shooting the safe house scores 25,000,000 points and adds 100,000 to the frenzy value. 4 shots to the safe house completes the mode. Stop Scorpio: out of the four ramp and orbit shots, two are lit. They remain lit for about 10 seconds. Making a lit shot unlights it, and lights another shot in turn. Shoot the safe house to add a lit shot. All lit shots score 15,000,000 points.",
      "lock 1 ball for multiball": "Multiball - Hit the 5 badge shots- HQ, side ramp, safe house, Warehouse, and right ramp- at any point during the game to light multiball. Multiball is started at the Warehouse (with a 20,000,000 base jackpot value) or the side ramp (with a 25,000,000 base jackpot value). Right off the bat, one ball will be loaded into the gun, and you get one free shot at either ramp to collect an instant jackpot. Whether you succeed or not, two more balls are thrown into play for a 3-ball multiball. The right ramp scores the jackpot value, and unlights once collected; the Warehouse relights the right ramp.",
      "start multiball": "Multiball - Hit the 5 badge shots- HQ, side ramp, safe house, Warehouse, and right ramp- at any point during the game to light multiball. Multiball is started at the Warehouse (with a 20,000,000 base jackpot value) or the side ramp (with a 25,000,000 base jackpot value). Right off the bat, one ball will be loaded into the gun, and you get one free shot at either ramp to collect an instant jackpot. Whether you succeed or not, two more balls are thrown into play for a 3-ball multiball. The right ramp scores the jackpot value, and unlights once collected; the Warehouse relights the right ramp.",
      "collect a jackpot": "Multiball - Hit the 5 badge shots- HQ, side ramp, safe house, Warehouse, and right ramp- at any point during the game to light multiball. Multiball is started at the Warehouse (with a 20,000,000 base jackpot value) or the side ramp (with a 25,000,000 base jackpot value). Right off the bat, one ball will be loaded into the gun, and you get one free shot at either ramp to collect an instant jackpot. Whether you succeed or not, two more balls are thrown into play for a 3-ball multiball. The right ramp scores the jackpot value, and unlights once collected; the Warehouse relights the right ramp.",
      "collect a hurry up at the scoop": "Safehouse - Bank Robber Hurry-up: a left orbit hurry-up that starts out worth 50,000,000 and times out at 20,000,000. Warehouse Hurry-up: a hurry-up collectible at the Warehouse that starts at 25,000,000 and counts down to 5,000,000. Collecting this hurry-up locks in the value and adds a second ball to play: for the rest of this 2-ball multiball, all shots to the Warehouse score the locked-in value.",
      "lock 2 balls toward multiball": "Multiball - Hit the 5 badge shots- HQ, side ramp, safe house, Warehouse, and right ramp- at any point during the game to light multiball. Multiball is started at the Warehouse (with a 20,000,000 base jackpot value) or the side ramp (with a 25,000,000 base jackpot value). Right off the bat, one ball will be loaded into the gun, and you get one free shot at either ramp to collect an instant jackpot. Whether you succeed or not, two more balls are thrown into play for a 3-ball multiball. The right ramp scores the jackpot value, and unlights once collected; the Warehouse relights the right ramp.",
      "start multiball and collect a jackpot": "Multiball - Hit the 5 badge shots- HQ, side ramp, safe house, Warehouse, and right ramp- at any point during the game to light multiball. Multiball is started at the Warehouse (with a 20,000,000 base jackpot value) or the side ramp (with a 25,000,000 base jackpot value). Right off the bat, one ball will be loaded into the gun, and you get one free shot at either ramp to collect an instant jackpot. Whether you succeed or not, two more balls are thrown into play for a 3-ball multiball. The right ramp scores the jackpot value, and unlights once collected; the Warehouse relights the right ramp.",
      "complete 2 criminal modes in one game": "Modes: the Shotgun Shell - Bar Room Brawl: for 25 seconds, shoot ramps. The base ramp value is 10,000,000 points. The right ramp scores the ramp value, while the side ramp scores double ramp value. Making either ramp increases the base ramp value by 5,000,000. Car Chase: the two orbits and the side ramp are lit. Make a total of 4 shots to any of these three locations within 20 seconds. Successful shots score 10,000,000, then 20,000,000, then 30,000,000, then 50,000,000. Warehouse Raid: shoot the Warehoue as many times as possible in 25 seconds to collect contraband.",
      "collect a super jackpot": "Multiball - Hit the 5 badge shots- HQ, side ramp, safe house, Warehouse, and right ramp- at any point during the game to light multiball. Multiball is started at the Warehouse (with a 20,000,000 base jackpot value) or the side ramp (with a 25,000,000 base jackpot value). Right off the bat, one ball will be loaded into the gun, and you get one free shot at either ramp to collect an instant jackpot. Whether you succeed or not, two more balls are thrown into play for a 3-ball multiball. The right ramp scores the jackpot value, and unlights once collected; the Warehouse relights the right ramp.",
      "collect two multiball jackpots in one game": "Multiball - Hit the 5 badge shots- HQ, side ramp, safe house, Warehouse, and right ramp- at any point during the game to light multiball. Multiball is started at the Warehouse (with a 20,000,000 base jackpot value) or the side ramp (with a 25,000,000 base jackpot value). Right off the bat, one ball will be loaded into the gun, and you get one free shot at either ramp to collect an instant jackpot. Whether you succeed or not, two more balls are thrown into play for a 3-ball multiball. The right ramp scores the jackpot value, and unlights once collected; the Warehouse relights the right ramp."
    },
    "judge dredd": {
      "start any chain feature mode": "Chain Link main modes - Shoot the shot lit yellow for \"Build Up Chain Feature\" to start a mode. The game tries to alternate whether the mode start is at the left ramp or the Sniper Tower upkicker in the back right, but if there are any locks lit at the left ramp, the mode start will always be placed at the Sniper Tower. Most modes are timed to 20-25 seconds. You do not need to complete a mode to earn credit for it. Once a mode has been played, it cannot be replayed until all modes have been played. ALL scoring from Chain Link modes, with the sole exception being Black Out, is awarded alongside the end of ball bonus rather than being given immediately.",
      "complete the judge drop targets once": "Locks and multiball - Spell JUDGE in order at the center drop targets to light locks. Drop targets do not reset unless the full bank is completed, so you may need to clear the bank to reset it in order to shoot whichever letter is next. For the first multiball, spelling JUDGE one time lights all 3 locks at once. After that, each spelling of JUDGE only lights one lock. Completing JUDGE when all locks are lit scores 5,000,000 points. All locks are made at the left ramp. On factory copies of the game, locks 1 and 2 are virtual, with the left ramp shot coming back around to the right in lane.",
      "light lock for multiball": "Locks and multiball - Spell JUDGE in order at the center drop targets to light locks. Drop targets do not reset unless the full bank is completed, so you may need to clear the bank to reset it in order to shoot whichever letter is next. For the first multiball, spelling JUDGE one time lights all 3 locks at once. After that, each spelling of JUDGE only lights one lock. Completing JUDGE when all locks are lit scores 5,000,000 points. All locks are made at the left ramp. On factory copies of the game, locks 1 and 2 are virtual, with the left ramp shot coming back around to the right in lane.",
      "shoot the left ramp 3 times": "Chain Link main modes - Shoot the shot lit yellow for \"Build Up Chain Feature\" to start a mode. The game tries to alternate whether the mode start is at the left ramp or the Sniper Tower upkicker in the back right, but if there are any locks lit at the left ramp, the mode start will always be placed at the Sniper Tower. Most modes are timed to 20-25 seconds. You do not need to complete a mode to earn credit for it. Once a mode has been played, it cannot be replayed until all modes have been played. ALL scoring from Chain Link modes, with the sole exception being Black Out, is awarded alongside the end of ball bonus rather than being given immediately.",
      "collect an air raid award": "Lower left kickback and Air Raid ramp - If the ball lands in the lower left kicker lane on its own, it will be automatically returned to play. If the ball is put up the side ramp labelled Air Raid, it will be redirected to the kickback lane; from here, press the diamond button on the left side of the cabinet to fire the ball out of the kickback. If the fired ball hits whichever drop target is lit, you'll score 5,000,000 points.",
      "complete any chain feature mode": "Chain Link main modes - Shoot the shot lit yellow for \"Build Up Chain Feature\" to start a mode. The game tries to alternate whether the mode start is at the left ramp or the Sniper Tower upkicker in the back right, but if there are any locks lit at the left ramp, the mode start will always be placed at the Sniper Tower. Most modes are timed to 20-25 seconds. You do not need to complete a mode to earn credit for it. Once a mode has been played, it cannot be replayed until all modes have been played. ALL scoring from Chain Link modes, with the sole exception being Black Out, is awarded alongside the end of ball bonus rather than being given immediately.",
      "lock 1 ball for multiball": "Locks and multiball - Spell JUDGE in order at the center drop targets to light locks. Drop targets do not reset unless the full bank is completed, so you may need to clear the bank to reset it in order to shoot whichever letter is next. For the first multiball, spelling JUDGE one time lights all 3 locks at once. After that, each spelling of JUDGE only lights one lock. Completing JUDGE when all locks are lit scores 5,000,000 points. All locks are made at the left ramp. On factory copies of the game, locks 1 and 2 are virtual, with the left ramp shot coming back around to the right in lane.",
      "start multiball": "Locks and multiball - Spell JUDGE in order at the center drop targets to light locks. Drop targets do not reset unless the full bank is completed, so you may need to clear the bank to reset it in order to shoot whichever letter is next. For the first multiball, spelling JUDGE one time lights all 3 locks at once. After that, each spelling of JUDGE only lights one lock. Completing JUDGE when all locks are lit scores 5,000,000 points. All locks are made at the left ramp. On factory copies of the game, locks 1 and 2 are virtual, with the left ramp shot coming back around to the right in lane.",
      "collect a jackpot": "Locks and multiball - Multiball always begins with 4 balls in play. The jackpot value starts at 20,000,000 points. Any drop target down adds 1,000,000 points to the jackpot. To light jackpot, shoot the left ramp. To score jackpot, shoot the scoop behind the JUDGE drop targets. Shooting the scoop adds 5,000,000 points to the jackpot, and then scores the new jackpot value. The jackpot does not reset at any point during multiball. The goal of multiball is to collect 4 jackpots in this way- labelled Mortis, Fire, Fear, and Death- by alternating the left ramp and the center scoop.",
      "start air raid": "Lower left kickback and Air Raid ramp - If the ball lands in the lower left kicker lane on its own, it will be automatically returned to play. If the ball is put up the side ramp labelled Air Raid, it will be redirected to the kickback lane; from here, press the diamond button on the left side of the cabinet to fire the ball out of the kickback. If the fired ball hits whichever drop target is lit, you'll score 5,000,000 points.",
      "lock 2 balls toward multiball": "Locks and multiball - Spell JUDGE in order at the center drop targets to light locks. Drop targets do not reset unless the full bank is completed, so you may need to clear the bank to reset it in order to shoot whichever letter is next. For the first multiball, spelling JUDGE one time lights all 3 locks at once. After that, each spelling of JUDGE only lights one lock. Completing JUDGE when all locks are lit scores 5,000,000 points. All locks are made at the left ramp. On factory copies of the game, locks 1 and 2 are virtual, with the left ramp shot coming back around to the right in lane.",
      "start multiball and collect a jackpot": "Locks and multiball - Spell JUDGE in order at the center drop targets to light locks. Drop targets do not reset unless the full bank is completed, so you may need to clear the bank to reset it in order to shoot whichever letter is next. For the first multiball, spelling JUDGE one time lights all 3 locks at once. After that, each spelling of JUDGE only lights one lock. Completing JUDGE when all locks are lit scores 5,000,000 points. All locks are made at the left ramp. On factory copies of the game, locks 1 and 2 are virtual, with the left ramp shot coming back around to the right in lane.",
      "complete 2 chain feature modes in one game": "Chain Link main modes - Shoot the shot lit yellow for \"Build Up Chain Feature\" to start a mode. The game tries to alternate whether the mode start is at the left ramp or the Sniper Tower upkicker in the back right, but if there are any locks lit at the left ramp, the mode start will always be placed at the Sniper Tower. Most modes are timed to 20-25 seconds. You do not need to complete a mode to earn credit for it. Once a mode has been played, it cannot be replayed until all modes have been played. ALL scoring from Chain Link modes, with the sole exception being Black Out, is awarded alongside the end of ball bonus rather than being given immediately.",
      "collect a super jackpot": "Locks and multiball - Multiball always begins with 4 balls in play. The jackpot value starts at 20,000,000 points. Any drop target down adds 1,000,000 points to the jackpot. To light jackpot, shoot the left ramp. To score jackpot, shoot the scoop behind the JUDGE drop targets. Shooting the scoop adds 5,000,000 points to the jackpot, and then scores the new jackpot value. The jackpot does not reset at any point during multiball. The goal of multiball is to collect 4 jackpots in this way- labelled Mortis, Fire, Fear, and Death- by alternating the left ramp and the center scoop.",
      "start ultimate challenge": "Ultimate Challenge wizard mode - Ultimate Challenge is a 4-ball multiball wizard mode that can be accessed by either collecting 4 jackpots within a single multiball, or starting a Chain Link mode after playing all 9 main modes. Ultimate Challenge is a 4-ball multiball where all Crime Scene shots are lit in a rainbow of colours to score 10,000,000 points. This continues until single ball play resumes. It is possible to start regular multiball while Ultimate Challenge is running, if you got your Ultimate Challenge from modes completion rather than multiball itself."
    },
    "deadpool": {
      "start any battle mode": "Battles: - Battle modes can be started at the scoop at the start of each ball, or after completing the DEAD targets. Battle modes are played out like a side scrolling fighter; each flashing shot, including Team-Up shots if applicable, deals damage, and the scoop (within 10 seconds of winning the battle) finishes each enemy off. Deadpool will take damage at certain intervals if lit shots aren't being made. Running out of health or draining during the battle will result in a loss. However, any progress made will be saved with a fresh Deadpool health bar on your next attempt.",
      "collect a chimichanga award": "Chimichangas, Weapons & Ninja Stars: - Chimichangas: Collect Chimichangas by shooting the right orbit to advance the chimichanga truck, then shooting the orange shots (as described in **Quests). Each chimichanga adds 250k to end-of-ball bonus and several Insider achievements require them to be collected. Ninja Stars: Bumper hits light the major shots in blue to collect a ninja star, which increase the jackpot values for Ninja Multiball. 10 Ninja Stars, along with 5 million + 500k per combo, can also be collected at once by scoring the Ninjapocalypse right orbit - right ramp combo.",
      "shoot the scoop 3 times": "Rules Overview: - Start Battles by shooting the scoop (complete DEAD if one isn't currently lit). Shoot the flashing shots to defeat the enemy, then shoot the scoop to finish them off. Complete Team-Up shots to bring allies into the battle, making them easier to complete and potentially scoring more. Start Quests by shooting the right orbit, collecting chimichangas at the orange shots, then shooting the scoop. Follow the instructions marked on the display to win each Quest. Shoot the left spinner enough times for Disco Multiball.",
      "light lock for multiball": "Disco Multiball: - Spin the left spinner 60 times (+60 per activation) to light Disco Multiball. Depending on your machine, it's possible to qualify and start the Disco mode on the same shot if you have a very low number of spins left. Disco modes can only be started if no other modes are currently running. Prem / LE exclusive: Disco Loops, exclusive to the Prem / LE models of this game, is started at 60, 180, 300, etc. spins in place of Disco Multiball. This is a timed single-ball mode with the simple goal of looping the left orbit ramp as many times as possible.",
      "complete one standup target bank": "Lil' Deadpool: - Expose the Lil' Deadpool stand-up target by shooting the OOF drop target bank in front of it, then shoot it 2 times (+1 per mode) to start a Lil' Deadpool mode (indicated by the fully green insert). Hitting the standup when the large insert is green will physically lock the ball behind the drop target bank. After a Lil' Deadpool mode is played, complete a Battle or Quest to qualify the lock procedure for the next Lil' Deadpool mode. Lil' Deadpool Multiball: A new ball is released into the shooter lane and a hurry-up starts counting down from 500k points.",
      "complete any battle mode": "Battles: - Battle modes can be started at the scoop at the start of each ball, or after completing the DEAD targets. Battle modes are played out like a side scrolling fighter; each flashing shot, including Team-Up shots if applicable, deals damage, and the scoop (within 10 seconds of winning the battle) finishes each enemy off. Deadpool will take damage at certain intervals if lit shots aren't being made. Running out of health or draining during the battle will result in a loss. However, any progress made will be saved with a fresh Deadpool health bar on your next attempt.",
      "lock 1 ball for multiball": "Sauron Multiball & Level 2 Battles: - Winning all three battles will light Sauron at the scoop for 3-ball multiball play. Shoot the left ramp and right ramp two times each for Jackpots, then shoot the U-Turn loop to Colossal Jackpot target for a Super Jackpot. Remember that you can collect the initial wave of four Jackpots using the BOOM Button! After playing Sauron Multiball, the three battles must be played again, but this time with some added interference from Sauron. During the battle, Sauron may resurface and prevent the player from defeating their opponent until they shoot both ramps once to deal damage to Sauron.",
      "start multiball": "Disco Multiball: - Spin the left spinner 60 times (+60 per activation) to light Disco Multiball. Depending on your machine, it's possible to qualify and start the Disco mode on the same shot if you have a very low number of spins left. Disco modes can only be started if no other modes are currently running. Prem / LE exclusive: Disco Loops, exclusive to the Prem / LE models of this game, is started at 60, 180, 300, etc. spins in place of Disco Multiball. This is a timed single-ball mode with the simple goal of looping the left orbit ramp as many times as possible.",
      "collect a jackpot": "Mechsuit Multiball: - All shots are lit for a jackpot that starts at 5M and increases by 100K for subsequent jackpots. Collecting a jackpot unlights that shot; collecting a different one unlights that shot and relights the previous shot, etc. After 5 jackpots, a Super Jackpot is lit at the scoop, although the other Jackpots can still be made. Super jackpot is 15 million + ( 250k x number of jackpots collected since multiball started ) and increases the base Jackpot value by 1 million.",
      "start mechsuit multiball": "Mechsuit Multiball: - Cash out 45 weapons by shooting white shots followed by the scoop, then shoot the scoop while no other modes are running to start the 4-ball Mechsuit Multiball. Collecting 150, 250, 350, etc. weapons re-enables Mechsuit Multiball at the scoop. All shots are lit for a jackpot that starts at 5M and increases by 100K for subsequent jackpots. Collecting a jackpot unlights that shot; collecting a different one unlights that shot and relights the previous shot, etc. After 5 jackpots, a Super Jackpot is lit at the scoop, although the other Jackpots can still be made.",
      "lock 2 balls toward multiball": "Disco Multiball: - Spin the left spinner 60 times (+60 per activation) to light Disco Multiball. Depending on your machine, it's possible to qualify and start the Disco mode on the same shot if you have a very low number of spins left. Disco modes can only be started if no other modes are currently running. Prem / LE exclusive: Disco Loops, exclusive to the Prem / LE models of this game, is started at 60, 180, 300, etc. spins in place of Disco Multiball. This is a timed single-ball mode with the simple goal of looping the left orbit ramp as many times as possible.",
      "start multiball and collect a jackpot": "Disco Multiball: - Spin the left spinner 60 times (+60 per activation) to light Disco Multiball. Depending on your machine, it's possible to qualify and start the Disco mode on the same shot if you have a very low number of spins left. Disco modes can only be started if no other modes are currently running. Prem / LE exclusive: Disco Loops, exclusive to the Prem / LE models of this game, is started at 60, 180, 300, etc. spins in place of Disco Multiball. This is a timed single-ball mode with the simple goal of looping the left orbit ramp as many times as possible.",
      "complete 2 battle modes in one game": "Battles: - Battle modes can be started at the scoop at the start of each ball, or after completing the DEAD targets. Battle modes are played out like a side scrolling fighter; each flashing shot, including Team-Up shots if applicable, deals damage, and the scoop (within 10 seconds of winning the battle) finishes each enemy off. Deadpool will take damage at certain intervals if lit shots aren't being made. Running out of health or draining during the battle will result in a loss. However, any progress made will be saved with a fresh Deadpool health bar on your next attempt.",
      "collect a super jackpot": "Mechsuit Multiball: - All shots are lit for a jackpot that starts at 5M and increases by 100K for subsequent jackpots. Collecting a jackpot unlights that shot; collecting a different one unlights that shot and relights the previous shot, etc. After 5 jackpots, a Super Jackpot is lit at the scoop, although the other Jackpots can still be made. Super jackpot is 15 million + ( 250k x number of jackpots collected since multiball started ) and increases the base Jackpot value by 1 million.",
      "start disco multiball": "Disco Multiball: - Spin the left spinner 60 times (+60 per activation) to light Disco Multiball. Depending on your machine, it's possible to qualify and start the Disco mode on the same shot if you have a very low number of spins left. Disco modes can only be started if no other modes are currently running. Prem / LE exclusive: Disco Loops, exclusive to the Prem / LE models of this game, is started at 60, 180, 300, etc. spins in place of Disco Multiball. This is a timed single-ball mode with the simple goal of looping the left orbit ramp as many times as possible."
    },
    "ghostbusters": {
      "start any mode": "(Mini-Wizard Mode) We Came, We Saw, We Kicked It's... - Multiball, with # of balls based on the # of modes in the mode ladder you completed to start it. 25M, increasing by 750k each shot up to a cap of 30M. Making enough shots awards a 100M super jackpot. Hitting a shot will unlight it, and it will re-light after hitting another shot, which itself then goes unlit, etc. Because this mode lights with the completion of any scene ladder, you will play this mode twice as you go through all 9 modes. Once you complete your ninth mode, instead of this mode, you will light...",
      "collect a pke award": "PKE - PKE builds up through bumper awards, bumper lane rollovers, and hitting the left standup targets. PKE fuels your scoring in PKE Frenzy, and is also a minor part of the end of ball bonus.",
      "shoot the left ramp 3 times": ": Shoot flashing shots. The shots in this mode alternate from left to right (i. e. First round = shoot left ramp or left loop, second round = shoot right loop or right ramp). Make 3 shots to end the mode. The Ballroom: Shoot each of the major shots once, then Slimer will come out. Hit him 3 times to light spinner and right ramp. Each Slimer hit will light a Super Jackpot, but collecting it is not required for completion. These Super Jackpots do not stack. Finish Slimer off by shooting the left loop and right ramp in either order for another hurry-up, then the left ramp to complete the mode.",
      "light lock for multiball": "(100) Mass Hysteria Multiball - This mode becomes active after collecting 100 Ghosts. The flippers have been reversed in this Multiball mode! Shoot all the flashing shots for Jackpots; at the start of the mode, the left loop, left ramp, right loop, right ramp, and right scoop are lit, and as each set is completed, the number of lit shots lowers. Hitting the right captive ball will toggle the reversed flippers on/off, complete with a light and sound show to alert you. To increase the jackpot value, you must switch the flipper orientation, collect at least one jackpot, and switch the flipper orientation again.",
      "complete one target bank": "Book Stacks - Light Terror Dog Hurry-Up. Shoot the terror dog target next to the right ramp or the right ramp itself to collect a hurry-up with a base value of 4 million. Increase the hurry up value at any time by shooting the Terror Dog target or the Gozer target. Librarian mini-mode (if you already played Spooked Librarian). Hit the captive ball to build up an award, then shoot the scoop to collect it and end the mini-mode.",
      "complete any mode": "(Mini-Wizard Mode) We Came, We Saw, We Kicked It's... - Multiball, with # of balls based on the # of modes in the mode ladder you completed to start it. 25M, increasing by 750k each shot up to a cap of 30M. Making enough shots awards a 100M super jackpot. Hitting a shot will unlight it, and it will re-light after hitting another shot, which itself then goes unlit, etc. Because this mode lights with the completion of any scene ladder, you will play this mode twice as you go through all 9 modes. Once you complete your ninth mode, instead of this mode, you will light...",
      "lock 1 ball for multiball": "(Mini-Wizard Mode) We Came, We Saw, We Kicked It's... - Multiball, with # of balls based on the # of modes in the mode ladder you completed to start it. 25M, increasing by 750k each shot up to a cap of 30M. Making enough shots awards a 100M super jackpot. Hitting a shot will unlight it, and it will re-light after hitting another shot, which itself then goes unlit, etc. 4-ball Multiball mode. The object is to collect 100 ghosts in 60 seconds. The captive ball can add time to the clock (still not exceeding 60 seconds), but will raise the Scoleri Brothers targets too.",
      "start storage facility multiball": "Storage Facility Multiball - Add-a-Ball: Shoot the captive balls to light Add-a-Ball, then shoot the left scoop to collect it. Or, shoot the pop bumper shot, and get lucky off of the slot pops.",
      "collect a jackpot": "Left Loop (spinner shot) - +5M Super Jackpot - Left Ramp - Start Left Ramp Scene (if scenes are not lit) or Light Super Jackpot (if scenes are lit or ladder complete) Right Loop - Start Right Loop Scene (if scenes are not lit) or Award River of Slime (if scenes are lit or ladder complete) Right Ramp - Start PKE Frenzy or Catch 10 Ghosts (if scene is running or PKE Frenzy is currently lit)",
      "complete a scene mode": "(Mini-Wizard Mode) We Came, We Saw, We Kicked It's... - Multiball, with # of balls based on the # of modes in the mode ladder you completed to start it. 25M, increasing by 750k each shot up to a cap of 30M. Making enough shots awards a 100M super jackpot. Hitting a shot will unlight it, and it will re-light after hitting another shot, which itself then goes unlit, etc. Because this mode lights with the completion of any scene ladder, you will play this mode twice as you go through all 9 modes. Once you complete your ninth mode, instead of this mode, you will light...",
      "lock 2 balls toward multiball": "(100) Mass Hysteria Multiball - This mode becomes active after collecting 100 Ghosts. The flippers have been reversed in this Multiball mode! Shoot all the flashing shots for Jackpots; at the start of the mode, the left loop, left ramp, right loop, right ramp, and right scoop are lit, and as each set is completed, the number of lit shots lowers. Hitting the right captive ball will toggle the reversed flippers on/off, complete with a light and sound show to alert you. To increase the jackpot value, you must switch the flipper orientation, collect at least one jackpot, and switch the flipper orientation again.",
      "start multiball and collect a jackpot": "Left Loop (spinner shot) - +5M Super Jackpot - Left Ramp - Start Left Ramp Scene (if scenes are not lit) or Light Super Jackpot (if scenes are lit or ladder complete) Right Loop - Start Right Loop Scene (if scenes are not lit) or Award River of Slime (if scenes are lit or ladder complete) Right Ramp - Start PKE Frenzy or Catch 10 Ghosts (if scene is running or PKE Frenzy is currently lit)",
      "complete 2 modes in one game": "(40) Video Modes: \"Negative Reinforcement on ESP Ability\"/\"Don't Cross The Streams\" - Video mode is lit at the right scoop after collecting 40 Ghosts. The current code offers two video modes to choose from: Negative Reinforcement on ESP Ability: Similar to the opening of the first movie, you must predict the \"next\" card out of two choices. Use the flipper buttons to select your card or cash out your bank. The bank starts at 250,000, doubles with each successive guess up to 64M, then increases by 25M for each guess after that (89M, 114M, etc).",
      "collect a super jackpot": "Left Loop (spinner shot) - +5M Super Jackpot - Left Ramp - Start Left Ramp Scene (if scenes are not lit) or Light Super Jackpot (if scenes are lit or ladder complete) Right Loop - Start Right Loop Scene (if scenes are not lit) or Award River of Slime (if scenes are lit or ladder complete) Right Ramp - Start PKE Frenzy or Catch 10 Ghosts (if scene is running or PKE Frenzy is currently lit)",
      "start a mini wizard mode": "(Mini-Wizard Mode) We Came, We Saw, We Kicked It's... - Multiball, with # of balls based on the # of modes in the mode ladder you completed to start it. 25M, increasing by 750k each shot up to a cap of 30M. Making enough shots awards a 100M super jackpot. Hitting a shot will unlight it, and it will re-light after hitting another shot, which itself then goes unlit, etc. Because this mode lights with the completion of any scene ladder, you will play this mode twice as you go through all 9 modes. Once you complete your ninth mode, instead of this mode, you will light..."
    },
    "the adventures of rocky and bullwinkle and friends": {
      "start any tv mode": "Puzzle modes - During single ball play, shooting the lower left scoop, or shooting the center lane when Mystery Select is not lit, awards a puzzle piece. Collecting a certain number of puzzle pieces completes a picture, which then starts an animation and a mode. There are 4 puzzles to finish, and each one always corresponds to the same mode; in future versions of the guide, I hope to include pictures of which puzzle corresponds to which mode. The first puzzle needs 3 pieces to finish, with subsequent puzzles requiring one more than the previous, up to a maximum of 6.",
      "collect a dudley do right award": "Wabac ramp modes - The left \"Wabac\" (pronounced Way-Back) ramp starts up to 8 various mini-modes, and playing them all starts Back In Time, which is the closest thing Rocky and Bullwinkle has to a wizard mode. At the start of the ball, one of the 8 award in front of the ramp will be flashing; make the ramp to collect that award. After collecting an award, or if there is nothing flashing in front of the ramp, shoot the center lane or the lower left scoop to make the next Wabac award start flashing. The order that you get Wabac awards is completely random and cannot be changed in any way.",
      "shoot the ramp 3 times": "Wabac ramp modes - The left \"Wabac\" (pronounced Way-Back) ramp starts up to 8 various mini-modes, and playing them all starts Back In Time, which is the closest thing Rocky and Bullwinkle has to a wizard mode. At the start of the ball, one of the 8 award in front of the ramp will be flashing; make the ramp to collect that award. After collecting an award, or if there is nothing flashing in front of the ramp, shoot the center lane or the lower left scoop to make the next Wabac award start flashing. The order that you get Wabac awards is completely random and cannot be changed in any way.",
      "light lock for multiball": "\"Tri-Ball\" (multiball) progression - There are several ways to start Tri-Ball, which is the game's only multiball mode. The standard way involves completing the \"pie wheel\" positioned above the right ramp by hitting the four Bomb post targets: the blue B and yellow O surround the left ramp, while the red M and green B surround the right ramp. For the first multiball, hit the Bomb targets three times each in any order you like.",
      "complete any tv mode": "Puzzle modes - During single ball play, shooting the lower left scoop, or shooting the center lane when Mystery Select is not lit, awards a puzzle piece. Collecting a certain number of puzzle pieces completes a picture, which then starts an animation and a mode. There are 4 puzzles to finish, and each one always corresponds to the same mode; in future versions of the guide, I hope to include pictures of which puzzle corresponds to which mode. The first puzzle needs 3 pieces to finish, with subsequent puzzles requiring one more than the previous, up to a maximum of 6.",
      "lock 1 ball for multiball": "\"Tri-Ball\" (multiball) progression - There are several ways to start Tri-Ball, which is the game's only multiball mode. The standard way involves completing the \"pie wheel\" positioned above the right ramp by hitting the four Bomb post targets: the blue B and yellow O surround the left ramp, while the red M and green B surround the right ramp. For the first multiball, hit the Bomb targets three times each in any order you like.",
      "start multiball": "\"Tri-Ball\" (multiball) progression - There are several ways to start Tri-Ball, which is the game's only multiball mode. The standard way involves completing the \"pie wheel\" positioned above the right ramp by hitting the four Bomb post targets: the blue B and yellow O surround the left ramp, while the red M and green B surround the right ramp. For the first multiball, hit the Bomb targets three times each in any order you like.",
      "collect a jackpot": "\"Tri-Ball\" (multiball) progression - During multiball, you can also make progress on the \"pie wheel\" again by hitting Bomb targets. If you complete the entire wheel with 3 shots to each target during multiball, the right ramp will be lit for Bullwinkle's Treasure for 15 seconds, which is a super jackpot worth 100,000,000 points that cannot be raised or doubled. Progress toward qualifying super jackpot is held in memory across multiballs. If 15 seconds pass without collecting the super jackpot, the opportunity goes away, and you will need to hit each Bomb target one more time to requalify it.",
      "collect a boris and natasha award": "Wabac ramp modes - The left \"Wabac\" (pronounced Way-Back) ramp starts up to 8 various mini-modes, and playing them all starts Back In Time, which is the closest thing Rocky and Bullwinkle has to a wizard mode. At the start of the ball, one of the 8 award in front of the ramp will be flashing; make the ramp to collect that award. After collecting an award, or if there is nothing flashing in front of the ramp, shoot the center lane or the lower left scoop to make the next Wabac award start flashing. The order that you get Wabac awards is completely random and cannot be changed in any way.",
      "lock 2 balls toward multiball": "\"Tri-Ball\" (multiball) progression - There are several ways to start Tri-Ball, which is the game's only multiball mode. The standard way involves completing the \"pie wheel\" positioned above the right ramp by hitting the four Bomb post targets: the blue B and yellow O surround the left ramp, while the red M and green B surround the right ramp. For the first multiball, hit the Bomb targets three times each in any order you like.",
      "start multiball and collect a jackpot": "\"Tri-Ball\" (multiball) progression - There are several ways to start Tri-Ball, which is the game's only multiball mode. The standard way involves completing the \"pie wheel\" positioned above the right ramp by hitting the four Bomb post targets: the blue B and yellow O surround the left ramp, while the red M and green B surround the right ramp. For the first multiball, hit the Bomb targets three times each in any order you like.",
      "complete 2 tv modes in one game": "Wabac ramp modes - The left \"Wabac\" (pronounced Way-Back) ramp starts up to 8 various mini-modes, and playing them all starts Back In Time, which is the closest thing Rocky and Bullwinkle has to a wizard mode. At the start of the ball, one of the 8 award in front of the ramp will be flashing; make the ramp to collect that award. After collecting an award, or if there is nothing flashing in front of the ramp, shoot the center lane or the lower left scoop to make the next Wabac award start flashing. The order that you get Wabac awards is completely random and cannot be changed in any way.",
      "collect a super jackpot": "\"Tri-Ball\" (multiball) progression - During multiball, you can also make progress on the \"pie wheel\" again by hitting Bomb targets. If you complete the entire wheel with 3 shots to each target during multiball, the right ramp will be lit for Bullwinkle's Treasure for 15 seconds, which is a super jackpot worth 100,000,000 points that cannot be raised or doubled. Progress toward qualifying super jackpot is held in memory across multiballs. If 15 seconds pass without collecting the super jackpot, the opportunity goes away, and you will need to hit each Bomb target one more time to requalify it.",
      "complete the rocky and bullwinkle mode ladder": "Wabac ramp modes - The left \"Wabac\" (pronounced Way-Back) ramp starts up to 8 various mini-modes, and playing them all starts Back In Time, which is the closest thing Rocky and Bullwinkle has to a wizard mode. At the start of the ball, one of the 8 award in front of the ramp will be flashing; make the ramp to collect that award. After collecting an award, or if there is nothing flashing in front of the ramp, shoot the center lane or the lower left scoop to make the next Wabac award start flashing. The order that you get Wabac awards is completely random and cannot be changed in any way."
    }
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
      re: /^light lock for multiball$/,
      desc: "Advance the table's lock qualifiers until a ball lock for multiball is lit."
    },
    {
      re: /^start any whirlpool mode$/,
      desc: "Shoot the Whirlpool when a mode is ready so one Whirlpool mode begins."
    },
    {
      re: /^start any ([a-z0-9' ]+) mode$/,
      desc: function(match){
        const label = String(match[1] || "").trim();
        return "Advance the table until a " + label + " mode can be started, then shoot the lit start shot to begin it.";
      }
    },
    {
      re: /^complete any ([a-z0-9' ]+) mode$/,
      desc: function(match){
        const label = String(match[1] || "").trim();
        return "Start a " + label + " mode, then finish its required lit shots or objectives before the mode ends.";
      }
    },
    {
      re: /^complete (\d+) ([a-z0-9' ]+) modes? in one game$/,
      desc: function(match){
        const count = String(match[1] || "").trim();
        const label = String(match[2] || "").trim();
        return "Start and fully finish " + count + " " + label + " mode" + (count === "1" ? "" : "s") + " during the same game.";
      }
    },
    {
      re: /^start ([a-z0-9' ]+) multiball$/,
      desc: function(match){
        const label = String(match[1] || "").trim();
        return "Qualify " + label + " Multiball by completing its lock or feature requirements, then shoot the lit start shot.";
      }
    },
    {
      re: /^qualify ([a-z0-9' ]+) multiball$/,
      desc: function(match){
        const label = String(match[1] || "").trim();
        return "Advance the required features until " + label + " Multiball is lit and ready to start.";
      }
    },
    {
      re: /^lock 1 ball at the juggler$/,
      desc: "Light the Juggler lock and shoot it once to lock a ball."
    },
    {
      re: /^complete one ([a-z0-9' ]+) target bank$/,
      desc: function(match){
        const label = String(match[1] || "").trim();
        return "Hit every target in the " + label + " bank once until the full bank is completed.";
      }
    },
    {
      re: /^complete one standup target bank$/,
      desc: "Hit every lit standup target in that bank once to finish a full completion."
    },
    {
      re: /^collect a ([a-z0-9' ]+) award$/,
      desc: function(match){
        const label = String(match[1] || "").trim();
        return "Light the " + label + " award through that table's feature progression, then shoot the lit collect shot before it times out.";
      }
    },
    {
      re: /^collect a mystery award$/,
      desc: "Light Mystery through the table's normal qualifying path, then shoot the lit Mystery scoop/lane to collect one award."
    },
    {
      re: /^shoot the ([a-z0-9' ]+) shot 3 times$/,
      desc: function(match){
        const label = String(match[1] || "").trim();
        return "Make the " + label + " shot three clean times. Consecutive shots are not usually required unless the table specifies it.";
      }
    },
    {
      re: /^shoot the ([a-z0-9' ]+) ramp 3 times$/,
      desc: function(match){
        const label = String(match[1] || "").trim();
        return "Shoot the " + label + " ramp three times cleanly to finish the check.";
      }
    },
    {
      re: /^complete the ducks targets$/,
      desc: "Knock down/finish the Ducks targets until the full bank is completed."
    },
    {
      re: /^complete the orange standup targets$/,
      desc: "Hit each orange standup target required for one full completion."
    },
    {
      re: /^complete the white standup targets$/,
      desc: "Hit each white standup target required for one full completion."
    },
    {
      re: /^complete the shooting gallery targets$/,
      desc: "Finish the entire Shooting Gallery target bank."
    },
    {
      re: /^complete the ball toss targets$/,
      desc: "Finish the Ball Toss target bank to complete that feature once."
    },
    {
      re: /^make 1 comet ramp shot$/,
      desc: "Shoot the Comet ramp once cleanly."
    },
    {
      re: /^light the 1 000 000 comet ramp shot$/,
      desc: "Complete the needed setup so the Comet ramp is lit for its 1,000,000 award."
    },
    {
      re: /^complete the green stoplight targets$/,
      desc: "Finish the green stoplight target bank to advance the stoplight sequence."
    },
    {
      re: /^make (\d+) freeways?(?: on one ball)?$/,
      desc: function(match){
        const count = String(match[1] || "").trim();
        return "Shoot the lit freeway/orbit enough times to collect " + count + " Freeway award" + (count === "1" ? "" : "s") + (/\bone ball\b/i.test(match.input || "") ? " on the same ball." : ".");
      }
    },
    {
      re: /^reach red light$/,
      desc: "Advance the stoplight progression until Red Light is reached."
    },
    {
      re: /^start any minor challenge$/,
      desc: "Light and start any of No Fear's smaller timed challenge modes."
    },
    {
      re: /^complete air challenge$/,
      desc: "Start Air Challenge and complete its required lit shots before time runs out."
    },
    {
      re: /^start any white mode$/,
      desc: "Shoot the currently lit white insert mode shot to begin any white mode."
    },
    {
      re: /^light a 2x shot multiplier$/,
      desc: "Build the necessary table progress so a 2x shot multiplier becomes lit."
    },
    {
      re: /^start black suit multiball$/,
      desc: "Qualify Black Suit Multiball, then shoot the lit start shot."
    },
    {
      re: /^complete any level (\d+) villain mode$/,
      desc: function(match){
        const level = String(match[1] || "").trim();
        return "Start any Level " + level + " villain mode and finish all lit required shots for that mode.";
      }
    },
    {
      re: /^complete the iron man targets once$/,
      desc: "Finish one full completion of the Iron Man target bank."
    },
    {
      re: /^spell f i r e once$/,
      desc: "Complete the F-I-R-E letter sequence one time."
    },
    {
      re: /^start [23]x playfield$/,
      desc: "Advance the needed shots/features until the playfield multiplier is lit, then start it."
    },
    {
      re: /^collect a song jackpot$/,
      desc: "During a song-based feature, shoot the currently lit jackpot shot to collect it."
    },
    {
      re: /^complete the jukebox targets$/,
      desc: "Finish the full Jukebox target bank."
    },
    {
      re: /^complete pig out and collect a toadstool award$/,
      desc: "Spell/finish PIG-OUT, then shoot the Toadstool while its award is lit."
    },
    {
      re: /^spell party animal and start multiball$/,
      desc: "Collect the PARTY ANIMAL letters and then shoot the lit multiball start."
    },
    {
      re: /^light lock at the left orbit$/,
      desc: "Advance Elvira enough to light the left orbit for a lock."
    },
    {
      re: /^collect the multiball jackpot$/,
      desc: "During multiball, shoot one of the currently lit jackpot shots to collect it."
    },
    {
      re: /^complete 1 color shot$/,
      desc: "Finish one full color-shot objective on Dr. Dude."
    },
    {
      re: /^complete the r e f l e x targets$/,
      desc: "Hit the R-E-F-L-E-X targets until the full sequence is completed."
    },
    {
      re: /^double the jackpot during multiball$/,
      desc: "During multiball, complete the required setup to raise the jackpot to its doubled value."
    },
    {
      re: /^invite (\d+) party member at the cosmic cottage$/,
      desc: function(match){
        const count = String(match[1] || "").trim();
        return "Shoot the Cosmic Cottage while lit to invite " + count + " party member" + (count === "1" ? "" : "s") + ".";
      }
    },
    {
      re: /^complete any tale$/,
      desc: "Start any Tale mode on Scared Stiff and finish it successfully."
    },
    {
      re: /^start crate multiball$/,
      desc: "Qualify Crate Multiball and shoot the lit start shot to begin it."
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

  const COUNTER_EXCLUDES = [
    /^easy score \(/,
    /^medium score \(/,
    /^hard score \(/,
    /^complete 1 2 3 top lanes$/,
    /^complete the 1986 top lanes$/,
    /^complete reflex 1 2 3$/,
    /^complete a 5 way combo$/,
    /^light the 1 000 000 comet ramp shot$/,
    /^collect a 1 000 000 right ramp shot$/,
    /^collect 1 000 000 at the center ramp$/,
    /^advance warp factor to \d+$/,
    /^reach class \d+ river$/,
    /^reach mark \d+(?: to light jericho)?$/,
    /^complete any level \d+ villain mode$/,
    /^start (?:lah )?\d+ ball multiball$/,
    /^start \d+ ball multiball$/,
    /^collect all \d+ last action hero words$/
  ];

  function clampCounterTarget(value){
    const num = Math.max(0, Math.round(Number(value) || 0));
    return num > 0 ? num : 0;
  }

  function normalizeCounterLabel(value){
    return String(value || "")
      .replace(/\s+/g, " ")
      .replace(/\bmultiball jackpots\b/gi, "multiball jackpots")
      .replace(/\bjackpots in multiball\b/gi, "jackpots in multiball")
      .trim();
  }
  function formatCountTimes(value){
    const count = String(value || "").trim();
    if(count === "1") return "once";
    if(count === "2") return "twice";
    return count ? (count + " times") : "the required number of times";
  }
  function formatCounterShotLabel(value){
    const clean = normalizeCounterLabel(value);
    if(/\bshots?$/i.test(clean)) return clean;
    return clean ? (clean + " shots") : "shots";
  }

  function createCounterMeta(rawTask, key, target, label, opts){
    const cleanTarget = clampCounterTarget(target);
    if(!cleanTarget) return null;
    const cleanLabel = normalizeCounterLabel(label);
    const qualifier = String(opts?.qualifier || "").trim();
    const hint = String(opts?.hint || "").trim();
    const autoLabel = cleanLabel || "steps";
    return {
      rawTask,
      key,
      target: cleanTarget,
      label: cleanLabel,
      qualifier,
      hint: hint || ("Track your progress until you reach " + cleanTarget + " " + autoLabel + (qualifier ? " " + qualifier : "") + "."),
      autoComplete: true
    };
  }

  const COUNTER_RULES = [
    {
      re: /^complete the catapult (\d+) hits$/,
      build: (match, rawTask, key)=> createCounterMeta(rawTask, key, match[1], "catapult hits", {
        hint: "Shoot the catapult repeatedly until all required catapult hits are registered."
      })
    },
    {
      re: /^win (\d+) (.+?)$/,
      build: (match, rawTask, key)=> createCounterMeta(rawTask, key, match[1], normalizeCounterLabel(match[2]), {
        hint: "Complete " + normalizeCounterLabel(match[2]) + " successfully " + formatCountTimes(match[1]) + "."
      })
    },
    {
      re: /^rescue (\d+) (.+?)$/,
      build: (match, rawTask, key)=> createCounterMeta(rawTask, key, match[1], normalizeCounterLabel(match[2]), {
        hint: "Rescue the required target the listed number of times."
      })
    },
    {
      re: /^hit (\d+) martians$/,
      build: (match, rawTask, key)=> createCounterMeta(rawTask, key, match[1], "Martian hits", {
        hint: "Reveal and hit Martians until the required total is reached."
      })
    },
    {
      re: /^beat (\d+) trolls$/,
      build: (match, rawTask, key)=> createCounterMeta(rawTask, key, match[1], "trolls defeated", {
        hint: "Raise the trolls through normal table progression and defeat the required number of them."
      })
    },
    {
      re: /^destroy (\d+) saucers?$/,
      build: (match, rawTask, key)=> createCounterMeta(rawTask, key, match[1], "saucers destroyed", {
        hint: "Finish full saucer attack waves until the required number of saucers have been destroyed."
      })
    },
    {
      re: /^score (\d+) goals?$/,
      build: (match, rawTask, key)=> createCounterMeta(rawTask, key, match[1], "goals", {
        hint: "Shoot the goal cleanly each time it is available until you score the required number of goals."
      })
    },
    {
      re: /^collect spinner value (\d+) times$/,
      build: (match, rawTask, key)=> createCounterMeta(rawTask, key, match[1], "spinner value collects", {
        hint: "Light spinner value and collect it the required number of times."
      })
    },
    {
      re: /^make (\d+) spinner rips$/,
      build: (match, rawTask, key)=> createCounterMeta(rawTask, key, match[1], "spinner rips", {
        hint: "Shoot the spinner with enough speed to score a clean rip each time until you reach the target."
      })
    },
    {
      re: /^rip the spinner (\d+) times while lit$/,
      build: (match, rawTask, key)=> createCounterMeta(rawTask, key, match[1], "lit spinner rips", {
        hint: "Light the spinner first, then rip it the required number of times while the feature stays lit."
      })
    },
    {
      re: /^complete (\d+) supercharger cycles?$/,
      build: (match, rawTask, key)=> createCounterMeta(rawTask, key, match[1], "Supercharger cycles", {
        hint: "Keep feeding the Supercharger loop until the required number of full cycles are completed."
      })
    },
    {
      re: /^light (\d+) locks? in one game$/,
      build: (match, rawTask, key)=> createCounterMeta(rawTask, key, match[1], "locks lit", {
        qualifier: "in one game",
        hint: "Advance multiball progress and light the required number of locks before the game ends."
      })
    },
    {
      re: /^light and lock (\d+) balls?(?: .*?)$/,
      build: (match, rawTask, key)=> createCounterMeta(rawTask, key, match[1], "balls lit and locked", {
        hint: "Light the lock first, then shoot the correct lock shot until the required number of locked balls are secured."
      })
    },
    {
      re: /^lock (\d+) balls?(?: .*?)$/,
      build: (match, rawTask, key)=> createCounterMeta(rawTask, key, match[1], "balls locked", {
        hint: "Light the correct lock shot and secure the required number of locks for this objective."
      })
    },
    {
      re: /^lock (\d+) ball$/,
      build: (match, rawTask, key)=> createCounterMeta(rawTask, key, match[1], "balls locked", {
        hint: "Shoot the lit lock shot and register the required number of locks."
      })
    },
    {
      re: /^shoot(?: the)? (.+?) (\d+) times(?: (in one game|in one multiball|on one ball))?$/,
      build: (match, rawTask, key)=> createCounterMeta(rawTask, key, match[2], formatCounterShotLabel(match[1]), {
        qualifier: String(match[3] || "").trim(),
        hint: "Shoot " + formatCounterShotLabel(match[1]) + " cleanly " + formatCountTimes(match[2]) + (match[3] ? " " + String(match[3]).trim() : "") + "."
      })
    },
    {
      re: /^hit(?: the)? (.+?) (\d+) times$/,
      build: (match, rawTask, key)=> createCounterMeta(rawTask, key, match[2], normalizeCounterLabel(match[1]) + " hits", {
        hint: "Hit " + normalizeCounterLabel(match[1]) + " " + String(match[2] || "").trim() + " times until each valid hit registers."
      })
    },
    {
      re: /^hit (\d+) (.+?)$/,
      build: (match, rawTask, key)=> createCounterMeta(rawTask, key, match[1], normalizeCounterLabel(match[2]), {
        hint: "Hit " + normalizeCounterLabel(match[2]) + " until the total reaches " + String(match[1] || "").trim() + "."
      })
    },
    {
      re: /^make (\d+) (.+?)(?: (in one game|on one ball))?$/,
      build: (match, rawTask, key)=> createCounterMeta(rawTask, key, match[1], normalizeCounterLabel(match[2]), {
        qualifier: String(match[3] || "").trim(),
        hint: "Make " + normalizeCounterLabel(match[2]) + " " + formatCountTimes(match[1]) + (match[3] ? " " + String(match[3]).trim() : "") + "."
      })
    },
    {
      re: /^pick up (\d+) passengers?$/,
      build: (match, rawTask, key)=> createCounterMeta(rawTask, key, match[1], "passengers picked up", {
        hint: "Shoot the lit passenger shots until the required number of passengers have been collected."
      })
    },
    {
      re: /^advance (\d+) (map destinations?|metamorphosis steps|rafts?)$/,
      build: (match, rawTask, key)=> createCounterMeta(rawTask, key, match[1], normalizeCounterLabel(match[2]), {
        hint: "Advance that feature one step at a time until the target total is reached."
      })
    },
    {
      re: /^complete (\d+) (.+?) in one game$/,
      build: (match, rawTask, key)=> createCounterMeta(rawTask, key, match[1], normalizeCounterLabel(match[2]), {
        qualifier: "in one game",
        hint: "Complete " + normalizeCounterLabel(match[2]) + " " + formatCountTimes(match[1]) + " during a single game."
      })
    },
    {
      re: /^complete (\d+) (.+?)$/,
      build: (match, rawTask, key)=> createCounterMeta(rawTask, key, match[1], normalizeCounterLabel(match[2]), {
        hint: "Complete " + normalizeCounterLabel(match[2]) + " " + formatCountTimes(match[1]) + "."
      })
    },
    {
      re: /^start any (\d+) multiballs in one game$/,
      build: (match, rawTask, key)=> createCounterMeta(rawTask, key, match[1], "multiballs started", {
        qualifier: "in one game",
        hint: "Qualify and start the required number of multiballs before the game ends."
      })
    },
    {
      re: /^start (\d+) (different missions|features|multiballs) in one game$/,
      build: (match, rawTask, key)=> createCounterMeta(rawTask, key, match[1], normalizeCounterLabel(match[2]), {
        qualifier: "in one game",
        hint: "Start the required number of unique objectives during the same game."
      })
    },
    {
      re: /^start (\d+) different missions$/,
      build: (match, rawTask, key)=> createCounterMeta(rawTask, key, match[1], "different missions started", {
        hint: "Start distinct missions until you have begun the required number of them."
      })
    },
    {
      re: /^collect (\d+) (.+?) in one multiball$/,
      build: (match, rawTask, key)=> createCounterMeta(rawTask, key, match[1], normalizeCounterLabel(match[2]), {
        qualifier: "in one multiball",
        hint: "Start a single multiball and collect the required number of those awards before it ends."
      })
    },
    {
      re: /^collect (\d+) (.+?) in one game$/,
      build: (match, rawTask, key)=> createCounterMeta(rawTask, key, match[1], normalizeCounterLabel(match[2]), {
        qualifier: "in one game",
        hint: "Collect the required number of those awards before the game ends."
      })
    },
    {
      re: /^collect (\d+) (.+?)$/,
      build: (match, rawTask, key)=> createCounterMeta(rawTask, key, match[1], normalizeCounterLabel(match[2]), {
        hint: "Collect that award the required number of times."
      })
    },
    {
      re: /^invite (\d+) party members? at the cosmic cottage$/,
      build: (match, rawTask, key)=> createCounterMeta(rawTask, key, match[1], "party members invited", {
        hint: "Shoot the Cosmic Cottage when lit until the required number of party members have been invited."
      })
    },
    {
      re: /^jail all (\d+) criminals in one ball$/,
      build: (match, rawTask, key)=> createCounterMeta(rawTask, key, match[1], "criminals jailed", {
        qualifier: "on one ball",
        hint: "Catch and jail all required criminals before that ball drains."
      })
    },
    {
      re: /^reach (\d+) total bug kills$/,
      build: (match, rawTask, key)=> createCounterMeta(rawTask, key, match[1], "bug kills", {
        hint: "Keep defeating bugs across qualifying modes until the cumulative kill total reaches the target."
      })
    }
  ];

  function resolveTaskCounterMeta(taskName){
    const rawTask = String(taskName || "").trim();
    if(!rawTask) return null;
    const key = normalizeTaskKey(rawTask);
    if(!key) return null;
    for(let i = 0; i < COUNTER_EXCLUDES.length; i++){
      if(COUNTER_EXCLUDES[i].test(key)) return null;
    }
    for(let i = 0; i < COUNTER_RULES.length; i++){
      const rule = COUNTER_RULES[i];
      const match = key.match(rule.re);
      if(!match) continue;
      const meta = rule.build(match, rawTask, key);
      if(meta && Number(meta.target) > 0) return meta;
    }
    return null;
  }

  function resolveRuleExplanationMeta(rawTask, key){
    for(let i = 0; i < RULES.length; i++){
      const rule = RULES[i];
      const match = key.match(rule.re);
      if(!match) continue;
      const out = (typeof rule.desc === "function")
        ? rule.desc(match, rawTask, key)
        : rule.desc;
      if(out) return { text: makeHowTo(out), kind:"rule", rawTask, key };
    }
    return null;
  }

  function resolveTaskExplanationMeta(taskName, node){
    const rawTask = String(taskName || "").trim();
    if(!rawTask) return { text:"", kind:"none", rawTask:"", key:"" };
    const key = normalizeTaskKey(rawTask);

    const tableOverride = resolveTableTaskGuide(rawTask, node, { overridesOnly:true });
    if(tableOverride) return { text: makeHowTo(summarizeTableGuide(rawTask, tableOverride)), kind:"table", rawTask, key, tableName: getTableNameFromNode(node) };

    if(EXACT[key]) return { text: makeHowTo(EXACT[key]), kind:"exact", rawTask, key };

    const rawScoreMatch = rawTask.match(/^(easy|medium|hard)\s+score\s*\(([^)]+)\)\s*$/i);
    if(rawScoreMatch){
      const tier = String(rawScoreMatch[1] || "").toLowerCase();
      const target = String(rawScoreMatch[2] || "").trim().replace(/\+$/, "") + "+";
      const tierHint = tier === "easy"
        ? "Use safer repeatable shots and bonus building."
        : (tier === "medium"
          ? "Blend safe feeds with mode progress and controlled risk."
          : "Stack multipliers, modes, and multiball scoring before cashing out.");
      return { text: makeHowTo("Reach at least " + target + " points in a valid game on that table. " + tierHint), kind:"score", rawTask, key };
    }

    const counterMeta = resolveTaskCounterMeta(rawTask);
    if(counterMeta){
      return {
        text: makeHowTo(counterMeta.hint),
        kind: "counter",
        rawTask,
        key,
        counterMeta
      };
    }

    const ruleMeta = resolveRuleExplanationMeta(rawTask, key);
    if(ruleMeta && /^(shoot|hit|make)\b/.test(key)) return ruleMeta;

    const tableGuide = resolveTableTaskGuide(rawTask, node);
    if(tableGuide && !(ruleMeta && isLooseGuideText(tableGuide))){
      return { text: makeHowTo(summarizeTableGuide(rawTask, tableGuide)), kind:"table", rawTask, key, tableName: getTableNameFromNode(node) };
    }

    if(ruleMeta) return ruleMeta;
    if(tableGuide) return { text: makeHowTo(summarizeTableGuide(rawTask, tableGuide)), kind:"table", rawTask, key, tableName: getTableNameFromNode(node) };

    if(key.startsWith("complete ")){
      return { text: makeHowTo("Finish this objective once by completing all currently required lit shots/targets for it."), kind:"prefix", rawTask, key };
    }
    if(key.startsWith("start ")){
      return { text: makeHowTo("Qualify this feature, then shoot the lit start shot once to begin it."), kind:"prefix", rawTask, key };
    }
    if(key.startsWith("collect ")){
      return { text: makeHowTo("Play until this collect is lit, then shoot the collect shot while it is active."), kind:"prefix", rawTask, key };
    }
    if(key.startsWith("shoot ")){
      return { text: makeHowTo("Make the named shot cleanly and confirm it registers on the table display."), kind:"prefix", rawTask, key };
    }
    if(key.startsWith("hit ")){
      return { text: makeHowTo("Hit the named feature enough times for one valid completion."), kind:"prefix", rawTask, key };
    }
    if(key.startsWith("lock ")){
      return { text: makeHowTo("Shoot the currently lit lock shot and confirm the lock is counted."), kind:"prefix", rawTask, key };
    }
    if(key.startsWith("light ")){
      return { text: makeHowTo("Complete prerequisite shots to light this feature, then collect/confirm it while lit."), kind:"prefix", rawTask, key };
    }
    if(key.startsWith("make ")){
      return { text: makeHowTo("Execute the required shot sequence cleanly within the timing window."), kind:"prefix", rawTask, key };
    }
    if(key.startsWith("reach ") || key.startsWith("raise ")){
      return { text: makeHowTo("Build progression on the relevant table feature until this threshold is met."), kind:"prefix", rawTask, key };
    }

    return { text: makeHowTo("Complete this objective exactly as written one time on the table."), kind:"fallback", rawTask, key };
  }

  function resolveTaskExplanation(taskName, node){
    return String(resolveTaskExplanationMeta(taskName, node).text || "");
  }

  function humanizeTaskCatalogLabel(value){
    const raw = String(value || "").trim();
    if(!raw) return "";
    const lowerWords = new Set(["a", "an", "and", "at", "for", "in", "of", "on", "or", "the", "to", "toward", "with"]);
    return raw.split(/\s+/).map(function(word, index){
      const clean = String(word || "");
      if(!clean) return "";
      const lower = clean.toLowerCase();
      if(index > 0 && lowerWords.has(lower)) return lower;
      if(/^\d+[xkmb]?$/i.test(clean)) return clean.toUpperCase();
      if(["karr", "kitt", "tv", "tnt", "ufo", "vuk", "lt-5", "g-l-o-b-e", "dolly", "parton"].includes(lower)){
        return clean.toUpperCase();
      }
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    }).join(" ")
      .replace(/\bMultiball\b/g, "Multiball")
      .replace(/\bJackpot\b/g, "Jackpot")
      .replace(/\bSuper Jackpot\b/g, "Super Jackpot")
      .replace(/\bSkill Shot\b/g, "Skill Shot")
      .replace(/\bExtra Ball\b/g, "Extra Ball");
  }

  const HARD_TASK_FORBIDDEN_OBJECTIVE_RE = /\b(wizard|finale|grand\s+finale|wizard\s+mode|final\s+wizard|join\s+the\s+cirqus|rule\s+the\s+universe|lost\s+in\s+the\s+zone|champion\s+challenge|ultimate\s+challenge|final\s+battle)\b/i;

  const HARD_TASK_REPLACEMENTS_BY_TABLE = Object.freeze({
    [normalizeTableKey("Batman 66")]: Object.freeze({
      [normalizeTaskKey("Start Villain Escape Wizard Mode")]: "Complete 2 Major Villain Phases in One Game"
    }),
    [normalizeTableKey("The Beatles")]: Object.freeze({
      [normalizeTaskKey("Start a Wizard Mode")]: "Complete 3 Drop-Target Banks in One Game"
    }),
    [normalizeTableKey("Rolling Stones")]: Object.freeze({
      [normalizeTaskKey("Start a Wizard Mode")]: "Collect 2 Song Awards in One Game"
    }),
    [normalizeTableKey("Judge Dredd")]: Object.freeze({
      [normalizeTaskKey("Start Ultimate Challenge")]: "Complete 3 Chain Feature Modes in One Game"
    }),
    [normalizeTableKey("Ghostbusters")]: Object.freeze({
      [normalizeTaskKey("Start a Mini Wizard Mode")]: "Complete 3 Modes in One Game"
    })
  });

  const HARD_TASK_FALLBACKS_BY_TABLE = Object.freeze({
    [normalizeTableKey("Tales of the Arabian Nights")]: Object.freeze(["Collect a Super Jackpot", "Complete 2 Tales in One Game"]),
    [normalizeTableKey("The A-Team")]: Object.freeze(["Collect a TNT Multiball Jackpot", "Complete 2 Mission Objectives in One Game"]),
    [normalizeTableKey("Hollywood Heat")]: Object.freeze(["Start Multiball", "Complete 2 Drop Target Banks in One Game"]),
    [normalizeTableKey("Grand Lizard")]: Object.freeze(["Start Multiball", "Complete 2 Upper Playfield Objectives"]),
    [normalizeTableKey("Bride of Pinbot")]: Object.freeze(["Complete the Bride", "Advance 3 Metamorphosis Steps"]),
    [normalizeTableKey("AC/DC")]: Object.freeze(["Collect a Super Jackpot", "Collect 2 Song Jackpots in One Game"])
  });

  function isForbiddenHardTaskLabel(label){
    return HARD_TASK_FORBIDDEN_OBJECTIVE_RE.test(String(label || ""));
  }

  function resolveHardTaskReplacement(tableName, label){
    const byTask = HARD_TASK_REPLACEMENTS_BY_TABLE[normalizeTableKey(tableName)];
    if(!byTask) return "";
    return byTask[normalizeTaskKey(label)] || "";
  }

  function fallbackHardTaskCatalog(tableName){
    const specific = HARD_TASK_FALLBACKS_BY_TABLE[normalizeTableKey(tableName)];
    if(specific && specific.length) return specific.slice();
    return ["Collect a Super Jackpot", "Complete 2 Table Objectives in One Game"];
  }

  function inferCatalogDifficulty(taskName, index){
    const key = normalizeTaskKey(taskName);
    if(/\b(super jackpot|wizard|ultimate|final|complete\s+3|collect\s+4|reach\s+wizard)\b/.test(key)) return "hard";
    if(/\b(start multiball and|collect a jackpot|collect two|complete\s+2|score\s+3|lock\s+2|light final|start any criminal|complete any race)\b/.test(key)) return "medium";
    if(/\b(start|light|lock|collect|score|shoot|hit|complete|make|advance|spell|reach)\b/.test(key)){
      const n = Number(index || 0);
      if(n % 5 === 4) return "hard";
      if(n % 3 === 2) return "medium";
      return "easy";
    }
    return Number(index || 0) % 3 === 2 ? "hard" : (Number(index || 0) % 3 === 1 ? "medium" : "easy");
  }

  function resolveCatalogTableName(tableKey){
    const raw = String(tableKey || "").trim();
    if(!raw) return "";
    try{
      const repo = root.FLPR_TABLE_REPO;
      const tables = repo && typeof repo.getAllTables === "function" ? repo.getAllTables() : [];
      for(let i = 0; i < tables.length; i++){
        const table = tables[i] || {};
        const names = [table.name, table.displayName, table.code].concat(Array.isArray(table.aliases) ? table.aliases : []);
        for(let j = 0; j < names.length; j++){
          if(normalizeTableKey(names[j]) === raw) return String(table.name || table.displayName || names[j] || raw).trim();
        }
      }
    }catch(_){}
    return raw.split(/\s+/).map(function(part){
      return part ? part.charAt(0).toUpperCase() + part.slice(1) : "";
    }).join(" ");
  }

  function buildCatalogScoreTargets(tableName, tableIndex){
    let seed = 0;
    const src = String(tableName || "") + ":" + String(tableIndex || 0);
    for(let i = 0; i < src.length; i++) seed = ((seed * 31) + src.charCodeAt(i)) >>> 0;
    const eraBoost = /\b(medieval|attack|mars|monster|sterns?|lord|deadpool|stranger|ghost|walking|game of thrones|aerosmith|beatles|elvis|ac\/dc|iron man|spider)\b/i.test(tableName) ? 1.55 : 1;
    const base = Math.round((900000 + (seed % 900000)) * eraBoost);
    const make = function(multiplier){
      return Math.max(100000, Math.round((base * multiplier) / 50000) * 50000).toLocaleString("en-US") + "+";
    };
    return {
      easy: [make(1), make(1.65)],
      medium: [make(4.25), make(7.25)],
      hard: [make(12.5), make(22)]
    };
  }

  function getBundledTaskCatalog(){
    const byTable = {};
    const tables = [];
    Object.keys(TABLE_TASK_GUIDES || {}).forEach(function(tableKey, tableIndex){
      const tableName = resolveCatalogTableName(tableKey);
      const entry = {
        tableKey: tableKey,
        tableName: tableName,
        tasksByDifficulty: { easy: [], medium: [], hard: [] },
        scoreTargets: buildCatalogScoreTargets(tableName || tableKey, tableIndex)
      };
      Object.keys(TABLE_TASK_GUIDES[tableKey] || {}).forEach(function(taskKey, taskIndex){
        if(/^(easy|medium|hard)\s+score\s*\(/i.test(taskKey)) return;
        let label = humanizeTaskCatalogLabel(taskKey);
        if(!label) return;
        const difficulty = inferCatalogDifficulty(taskKey, taskIndex);
        if(difficulty === "hard" && isForbiddenHardTaskLabel(label)){
          label = resolveHardTaskReplacement(tableName, label);
          if(!label) return;
        }
        const bucket = entry.tasksByDifficulty[difficulty] || entry.tasksByDifficulty.easy;
        if(!bucket.some(function(v){ return normalizeTaskKey(v) === normalizeTaskKey(label); })) bucket.push(label);
      });
      ["easy", "medium", "hard"].forEach(function(difficulty){
        if(!entry.tasksByDifficulty[difficulty].length){
          entry.tasksByDifficulty[difficulty] = difficulty === "easy"
            ? ["Make a Skill Shot", "Complete one lit objective"]
            : (difficulty === "medium"
              ? ["Start Multiball", "Collect a Jackpot"]
              : fallbackHardTaskCatalog(tableName || tableKey));
        }
      });
      byTable[normalizeTableKey(tableName || tableKey)] = entry;
      byTable[tableKey] = entry;
      tables.push(entry);
    });
    return { version: "1.0.0", tables: tables, byTable: byTable };
  }

  root.FLPR_TASK_EXPLANATIONS = Object.freeze({
    normalizeTaskKey: normalizeTaskKey,
    normalizeTableKey: normalizeTableKey,
    resolveTaskExplanation: resolveTaskExplanation,
    resolveTaskExplanationMeta: resolveTaskExplanationMeta,
    resolveTaskCounterMeta: resolveTaskCounterMeta,
    getBundledTaskCatalog: getBundledTaskCatalog
  });
  root.flprGetTaskExplanation = resolveTaskExplanation;
  root.flprGetTaskExplanationMeta = resolveTaskExplanationMeta;
  root.flprGetTaskCounterMeta = resolveTaskCounterMeta;
  root.flprGetBundledTaskCatalog = getBundledTaskCatalog;
})(window);
