from __future__ import annotations

import argparse
import json
import re
import zipfile
from pathlib import Path


DEFAULT_ZIP = Path(r"C:\ProgramData\Archipelago\YAMLs.zip")
DEFAULT_OUTPUT_DIR = Path("yaml_options_pages")


def count_indent(line: str) -> int:
    return len(line) - len(line.lstrip(" "))


def strip_inline_comment(value: str) -> tuple[str, str]:
    in_single = False
    in_double = False
    escaped = False

    for index, char in enumerate(value):
        if in_double:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == '"':
                in_double = False
            continue

        if in_single:
            if char == "'":
                if index + 1 < len(value) and value[index + 1] == "'":
                    continue
                in_single = False
            continue

        if char == "'":
            in_single = True
            continue
        if char == '"':
            in_double = True
            continue
        if char == "#" and (index == 0 or value[index - 1].isspace()):
            return value[:index].rstrip(), value[index + 1 :].strip()

    return value.rstrip(), ""


def unquote_yaml(value: str) -> str:
    value = value.strip()
    if len(value) >= 2 and value[0] == "'" and value[-1] == "'":
        return value[1:-1].replace("''", "'")
    if len(value) >= 2 and value[0] == '"' and value[-1] == '"':
        try:
            return json.loads(value)
        except json.JSONDecodeError:
            return value[1:-1]
    return value


def split_yaml_key_value(content: str) -> tuple[str, str] | None:
    content = content.strip()
    if not content or content.startswith("#"):
        return None

    if content[0] == "'":
        pieces: list[str] = []
        index = 1
        while index < len(content):
            char = content[index]
            if char == "'":
                if index + 1 < len(content) and content[index + 1] == "'":
                    pieces.append("'")
                    index += 2
                    continue
                break
            pieces.append(char)
            index += 1
        if index >= len(content):
            return None
        rest = content[index + 1 :].lstrip()
        if not rest.startswith(":"):
            return None
        return "".join(pieces), rest[1:].strip()

    if content[0] == '"':
        pieces = ['"']
        index = 1
        escaped = False
        while index < len(content):
            char = content[index]
            pieces.append(char)
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == '"':
                break
            index += 1
        if index >= len(content):
            return None
        rest = content[index + 1 :].lstrip()
        if not rest.startswith(":"):
            return None
        return unquote_yaml("".join(pieces)), rest[1:].strip()

    colon = content.find(":")
    if colon < 0:
        return None
    key = content[:colon].strip()
    if not key:
        return None
    return unquote_yaml(key), content[colon + 1 :].strip()


def parse_scalar(value: str) -> str:
    clean, _comment = strip_inline_comment(value)
    return unquote_yaml(clean.strip())


def extract_group_title(line: str) -> str | None:
    stripped = line.strip()
    if not stripped.startswith("#"):
        return None
    title = stripped.strip("#").strip()
    if not title:
        return None
    if set(title) <= {"#", "-", "=", " "}:
        return None
    if len(title) > 80:
        return None
    return title


def cleanup_comment_lines(lines: list[str]) -> str:
    while lines and not lines[0].strip():
        lines.pop(0)
    while lines and not lines[-1].strip():
        lines.pop()

    cleaned: list[str] = []
    previous_blank = False
    for line in lines:
        text = line.rstrip()
        if not text:
            if not previous_blank and cleaned:
                cleaned.append("")
            previous_blank = True
            continue
        cleaned.append(text)
        previous_blank = False
    return "\n".join(cleaned)


def dedent_data_lines(lines: list[str], base_indent: int = 4) -> str:
    relevant = [line for line in lines if line.strip()]
    if not relevant:
        return ""
    min_indent = min(max(base_indent, count_indent(line)) for line in relevant)
    return "\n".join(line[min_indent:] if len(line) >= min_indent else line.strip() for line in relevant).strip()


def parse_option_body(key: str, body_lines: list[str], group: str) -> dict:
    comment_lines: list[str] = []
    significant: list[str] = []
    before_data = True

    for line in body_lines:
        stripped = line.strip()
        if not stripped:
            if before_data:
                comment_lines.append("")
            continue

        indent = count_indent(line)
        content = line[indent:]
        if indent >= 4 and content.lstrip().startswith("#"):
            if before_data:
                comment = content.lstrip()[1:].strip()
                comment_lines.append(comment)
            continue

        if indent >= 4:
            before_data = False
            significant.append(line.rstrip())

    description = cleanup_comment_lines(comment_lines)
    range_min = None
    range_max = None
    min_match = re.search(r"Minimum value is\s+(-?\d+)", description)
    max_match = re.search(r"Maximum value is\s+(-?\d+)", description)
    if min_match:
        range_min = int(min_match.group(1))
    if max_match:
        range_max = int(max_match.group(1))

    entries: list[dict] = []
    flat_map = bool(significant)
    for line in significant:
        if count_indent(line) != 4:
            flat_map = False
            break
        parsed = split_yaml_key_value(line[4:])
        if not parsed:
            flat_map = False
            break
        entry_key, raw_value = parsed
        clean_value, inline_comment = strip_inline_comment(raw_value)
        if not clean_value.strip():
            flat_map = False
            break
        entries.append(
            {
                "key": entry_key,
                "value": clean_value.strip(),
                "note": inline_comment,
            }
        )

    option = {
        "key": key,
        "label": humanize_key(key),
        "group": group,
        "description": description,
        "rangeMin": range_min,
        "rangeMax": range_max,
    }

    if flat_map and entries:
        option["kind"] = "entries"
        option["entries"] = entries
        option["control"] = infer_entry_control(entries, range_min, range_max)
    else:
        option["kind"] = "raw"
        option["raw"] = dedent_data_lines(significant)
        option["control"] = "raw"

    return option


def infer_entry_control(entries: list[dict], range_min: int | None, range_max: int | None) -> str:
    values = [entry["value"] for entry in entries]
    numeric_values = all(re.fullmatch(r"-?\d+(?:\.\d+)?", value or "") for value in values)
    template_weights = numeric_values and all(float(value) in (0, 50) for value in values)
    keys = {entry["key"].strip().lower() for entry in entries}

    if template_weights and keys == {"false", "true"}:
        return "toggle"
    if template_weights and range_min is not None and range_max is not None:
        return "range"
    if template_weights:
        return "choice"
    return "map"


def humanize_key(key: str) -> str:
    return re.sub(r"\s+", " ", key.replace("_", " ").replace("-", " ")).strip().title()


def parse_yaml_template(source_name: str, text: str) -> dict:
    lines = text.replace("\r\n", "\n").replace("\r", "\n").split("\n")
    name = "Player{number}"
    description = ""
    game = ""
    requires_version = ""
    world_version = ""

    for line in lines:
        if count_indent(line) != 0:
            continue
        parsed = split_yaml_key_value(line)
        if not parsed:
            continue
        key, value = parsed
        if key == "name":
            name = parse_scalar(value)
        elif key == "description":
            description = parse_scalar(value)
        elif key == "game":
            game = parse_scalar(value)

    in_requires = False
    in_requires_game = False
    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        indent = count_indent(line)
        parsed = split_yaml_key_value(line[indent:])
        if indent == 0:
            in_requires = parsed is not None and parsed[0] == "requires"
            in_requires_game = False
            continue
        if not in_requires or not parsed:
            continue
        key, value = parsed
        if indent == 2 and key == "version":
            requires_version = parse_scalar(value)
        elif indent == 2 and key == "game":
            in_requires_game = True
        elif indent <= 2:
            in_requires_game = False
        elif in_requires_game and indent == 4 and key == game:
            world_version = parse_scalar(value)

    game_block_start = None
    for index, line in enumerate(lines):
        if count_indent(line) != 0:
            continue
        parsed = split_yaml_key_value(line)
        if parsed and parsed[0] == game and parsed[1] == "":
            game_block_start = index
            break

    options: list[dict] = []
    if game_block_start is not None:
        group = "Options"
        index = game_block_start + 1
        while index < len(lines):
            line = lines[index]
            stripped = line.strip()
            if stripped and count_indent(line) == 0:
                break
            if not stripped:
                index += 1
                continue

            indent = count_indent(line)
            if indent == 2 and stripped.startswith("#"):
                title = extract_group_title(stripped)
                if title:
                    group = title
                index += 1
                continue

            if indent == 2:
                parsed = split_yaml_key_value(line[2:])
                if parsed and parsed[1] == "":
                    option_key = parsed[0]
                    body: list[str] = []
                    index += 1
                    while index < len(lines):
                        next_line = lines[index]
                        next_stripped = next_line.strip()
                        next_indent = count_indent(next_line)
                        if next_stripped and next_indent == 0:
                            break
                        if next_stripped and next_indent == 2:
                            next_parsed = split_yaml_key_value(next_line[2:])
                            if next_parsed and next_parsed[1] == "":
                                break
                            if next_stripped.startswith("#"):
                                break
                        body.append(next_line)
                        index += 1
                    options.append(parse_option_body(option_key, body, group))
                    continue

            index += 1

    return {
        "sourceName": source_name,
        "fileName": slugify(game or Path(source_name).stem) + "_yaml_options.html",
        "slug": slugify(game or Path(source_name).stem),
        "templateName": name,
        "templateDescription": description,
        "game": game,
        "requiresVersion": requires_version,
        "worldVersion": world_version,
        "options": options,
    }


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "_", value.lower()).strip("_")
    return slug or "yaml"


def build_html(data: dict) -> str:
    data_json = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    title = html_escape(f"{data['game']} YAML Options")
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<style>
:root{{
  --bg:#101418;
  --bg2:#171d23;
  --panel:#f7f8f9;
  --panel2:#eef2f4;
  --ink:#162027;
  --muted:#5c6870;
  --line:#cbd5dc;
  --lineDark:#82919b;
  --accent:#0f766e;
  --accent2:#2563eb;
  --gold:#b7791f;
  --danger:#b42318;
  --shadow:rgba(5,10,15,.24);
  --mono:Consolas, "Courier New", monospace;
  --ui:system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}}
*{{box-sizing:border-box}}
html,body{{min-height:100%;margin:0}}
body{{
  color:var(--ink);
  font-family:var(--ui);
  background:
    linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px),
    linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px),
    linear-gradient(135deg, var(--bg), #1a2a2b 54%, #24212a);
  background-size:32px 32px,32px 32px,auto;
}}
button,input,select,textarea{{font:inherit}}
button{{cursor:pointer}}
button:disabled{{cursor:not-allowed;opacity:.55}}
.app{{width:min(1680px, calc(100vw - 28px));margin:0 auto;padding:16px 0 22px}}
.topbar{{
  display:grid;
  grid-template-columns:minmax(0,1fr) auto;
  gap:14px;
  align-items:start;
  padding:16px;
  color:#f8fafc;
  border:1px solid rgba(255,255,255,.18);
  border-radius:8px;
  background:linear-gradient(135deg, rgba(15,118,110,.88), rgba(37,99,235,.62) 62%, rgba(183,121,31,.54));
  box-shadow:0 14px 32px var(--shadow);
}}
h1{{margin:0;font-size:clamp(24px,3vw,38px);line-height:1.08;letter-spacing:0}}
.meta{{margin-top:8px;display:flex;flex-wrap:wrap;gap:8px;color:#e9f2f7;font-size:13px}}
.pill{{display:inline-flex;align-items:center;min-height:30px;padding:5px 9px;border:1px solid rgba(255,255,255,.28);border-radius:8px;background:rgba(0,0,0,.2);font-family:var(--mono)}}
.actions{{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end}}
.button{{
  min-height:38px;
  border:1px solid rgba(255,255,255,.34);
  border-radius:8px;
  padding:8px 12px;
  color:#fff;
  background:rgba(12,18,24,.32);
  font-weight:700;
}}
.button.primary{{background:rgba(15,118,110,.96)}}
.button.gold{{background:rgba(183,121,31,.96)}}
.workspace{{display:grid;grid-template-columns:minmax(360px,.9fr) minmax(460px,1fr);gap:14px;align-items:start;margin-top:14px}}
.panel{{
  min-width:0;
  overflow:hidden;
  border:1px solid var(--lineDark);
  border-radius:8px;
  background:linear-gradient(180deg,var(--panel),var(--panel2));
  box-shadow:0 12px 28px var(--shadow);
}}
.panelHeader{{
  display:flex;
  justify-content:space-between;
  gap:12px;
  align-items:center;
  min-height:54px;
  padding:12px 14px;
  color:#fff;
  background:linear-gradient(90deg,#24323a,#0f766e);
}}
.panelHeader h2{{margin:0;font-size:17px;line-height:1.2;letter-spacing:0}}
.panelKicker{{font-family:var(--mono);font-size:12px;color:#dce8ed;white-space:nowrap}}
.panelBody{{padding:14px}}
.fieldGrid{{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-bottom:12px}}
.field{{display:grid;gap:6px}}
.field.full{{grid-column:1/-1}}
.field label,.optionCode,.entryKeyLabel{{font-family:var(--mono);font-size:12px;font-weight:700;color:#33424b}}
input,select,textarea{{
  width:100%;
  min-width:0;
  border:1px solid #aab7bf;
  border-radius:8px;
  padding:9px 10px;
  color:var(--ink);
  background:#fff;
}}
textarea{{resize:vertical}}
.toolbar{{display:grid;grid-template-columns:minmax(0,1fr) minmax(160px,240px);gap:10px;margin-bottom:12px}}
.groupSection{{margin-bottom:14px}}
.groupSection:last-child{{margin-bottom:0}}
.groupTitle{{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:10px;
  margin-bottom:8px;
  padding-bottom:7px;
  border-bottom:1px solid var(--line);
}}
.groupTitle h3{{margin:0;font-size:16px;line-height:1.2}}
.optionBlock{{
  display:grid;
  gap:10px;
  margin-bottom:10px;
  padding:12px;
  border:1px solid var(--line);
  border-radius:8px;
  background:rgba(255,255,255,.62);
}}
.optionBlock:last-child{{margin-bottom:0}}
.optionHead{{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:start}}
.optionTitle{{margin:0;font-size:15px;line-height:1.25}}
.optionCode{{padding:3px 7px;border:1px solid var(--line);border-radius:8px;background:#f8fafc;white-space:nowrap}}
.optionDesc{{margin:0;color:var(--muted);font-size:13px;line-height:1.45;white-space:pre-line}}
.rangeNote{{display:flex;gap:8px;flex-wrap:wrap;margin-top:-2px}}
.rangeNote span{{font-family:var(--mono);font-size:11px;color:#fff;padding:3px 7px;border-radius:8px;background:#50616b}}
.directControl{{display:grid;gap:9px}}
.choiceControl{{display:grid;grid-template-columns:minmax(180px,280px) minmax(0,1fr);gap:9px;align-items:center}}
.choiceNote{{min-height:36px;display:flex;align-items:center;color:var(--muted);font-size:12px;line-height:1.3}}
.toggleControl{{display:flex;align-items:center;gap:10px;width:max-content;max-width:100%}}
.toggleControl input{{position:absolute;width:auto;opacity:0;pointer-events:none}}
.switchRail{{
  position:relative;
  width:54px;
  height:30px;
  flex:0 0 auto;
  border:1px solid #8fa0aa;
  border-radius:999px;
  background:#d8e1e6;
  transition:background .16s ease,border-color .16s ease;
}}
.switchRail::after{{
  content:"";
  position:absolute;
  top:3px;
  left:3px;
  width:22px;
  height:22px;
  border-radius:999px;
  background:#fff;
  box-shadow:0 2px 7px rgba(0,0,0,.22);
  transition:transform .16s ease;
}}
.toggleControl input:checked + .switchRail{{background:var(--accent);border-color:var(--accent)}}
.toggleControl input:checked + .switchRail::after{{transform:translateX(24px)}}
.switchText{{font-weight:800;color:#27343c}}
.rangeControl{{display:grid;gap:9px}}
.rangeModeRow{{display:grid;grid-template-columns:minmax(180px,280px) minmax(0,1fr);gap:9px;align-items:center}}
.rangeValueRow{{display:grid;grid-template-columns:minmax(0,1fr) 96px;gap:9px;align-items:center}}
.rangeValueRow input[type="range"]{{padding:0}}
.rangeValueRow input:disabled{{opacity:.58}}
.rangeValueRow.hidden{{display:none}}
.entryList{{display:grid;gap:7px}}
.entryRow{{display:grid;grid-template-columns:minmax(120px,.9fr) minmax(90px,.45fr) minmax(130px,1fr) 34px;gap:7px;align-items:start}}
.entryRow input{{min-height:36px;padding:7px 8px;font-family:var(--mono);font-size:13px}}
.entryNote{{min-height:36px;display:flex;align-items:center;color:var(--muted);font-size:12px;line-height:1.25}}
.miniButton{{
  min-height:34px;
  border:1px solid var(--lineDark);
  border-radius:8px;
  padding:6px 9px;
  color:var(--ink);
  background:#fff;
  font-weight:700;
}}
.miniButton.add{{width:max-content;color:#fff;background:var(--accent);border-color:var(--accent)}}
.miniButton.remove{{padding:0;color:#fff;background:var(--danger);border-color:var(--danger)}}
.rawInput{{min-height:90px;font-family:var(--mono);font-size:13px;line-height:1.45}}
.yamlOutput{{min-height:calc(100vh - 206px);font-family:var(--mono);font-size:13px;line-height:1.45;white-space:pre;tab-size:2}}
.status{{margin-top:10px;color:var(--muted);font-size:13px;line-height:1.4}}
.hidden{{display:none}}
@media (max-width:980px){{
  .topbar,.workspace{{grid-template-columns:1fr}}
  .actions{{justify-content:flex-start}}
  .fieldGrid,.toolbar,.choiceControl,.rangeModeRow{{grid-template-columns:1fr}}
  .entryRow{{grid-template-columns:1fr 120px 1fr 34px}}
  .yamlOutput{{min-height:420px}}
}}
@media (max-width:620px){{
  .app{{width:min(100% - 18px,1680px);padding-top:9px}}
  .topbar,.panelBody{{padding:12px}}
  .entryRow{{grid-template-columns:1fr}}
  .miniButton.remove{{width:42px;min-height:34px}}
}}
</style>
</head>
<body>
<div class="app">
  <header class="topbar">
    <div>
      <h1>{title}</h1>
      <div class="meta">
        <span class="pill" id="sourcePill"></span>
        <span class="pill" id="versionPill"></span>
        <span class="pill" id="countPill"></span>
      </div>
    </div>
    <div class="actions">
      <button class="button primary" type="button" id="copyBtn">Copy YAML</button>
      <button class="button gold" type="button" id="downloadBtn">Download</button>
    </div>
  </header>

  <main class="workspace">
    <section class="panel">
      <div class="panelHeader">
        <h2>Options</h2>
        <span class="panelKicker" id="visibleCount"></span>
      </div>
      <div class="panelBody">
        <div class="fieldGrid">
          <div class="field">
            <label for="playerName">Player Name</label>
            <input id="playerName" type="text" maxlength="64">
          </div>
          <div class="field">
            <label for="requiresVersion">AP Version</label>
            <input id="requiresVersion" type="text">
          </div>
          <div class="field full">
            <label for="description">Description</label>
            <input id="description" type="text">
          </div>
        </div>
        <div class="toolbar">
          <input id="searchBox" type="search" placeholder="Search options">
          <select id="groupFilter" aria-label="Group filter"></select>
        </div>
        <div id="optionsMount"></div>
      </div>
    </section>

    <section class="panel">
      <div class="panelHeader">
        <h2>YAML Output</h2>
        <span class="panelKicker" id="yamlStatus">Ready</span>
      </div>
      <div class="panelBody">
        <textarea class="yamlOutput" id="yamlOutput" spellcheck="false" readonly></textarea>
        <div class="status" id="statusLine"></div>
      </div>
    </section>
  </main>
</div>

<script>
const PAGE_DATA = {data_json};
const els = {{}};

function init(){{
  ["sourcePill","versionPill","countPill","visibleCount","copyBtn","downloadBtn","playerName","requiresVersion","description","searchBox","groupFilter","optionsMount","yamlOutput","yamlStatus","statusLine"].forEach((id) => {{
    els[id] = document.getElementById(id);
  }});

  els.playerName.value = PAGE_DATA.templateName || "Player";
  els.description.value = PAGE_DATA.templateDescription || "";
  els.requiresVersion.value = PAGE_DATA.requiresVersion || "";
  els.sourcePill.textContent = PAGE_DATA.sourceName;
  els.versionPill.textContent = PAGE_DATA.worldVersion ? `World ${{PAGE_DATA.worldVersion}}` : "World version unset";
  els.countPill.textContent = `${{PAGE_DATA.options.length}} options`;

  renderGroupFilter();
  renderOptions();
  bindEvents();
  updateAll();
}}

function renderGroupFilter(){{
  const groups = [...new Set(PAGE_DATA.options.map((option) => option.group || "Options"))];
  els.groupFilter.innerHTML = "";
  const all = document.createElement("option");
  all.value = "";
  all.textContent = "All groups";
  els.groupFilter.appendChild(all);
  groups.forEach((group) => {{
    const option = document.createElement("option");
    option.value = group;
    option.textContent = group;
    els.groupFilter.appendChild(option);
  }});
}}

function renderOptions(){{
  els.optionsMount.innerHTML = "";
  const groups = [...new Set(PAGE_DATA.options.map((option) => option.group || "Options"))];
  groups.forEach((groupName) => {{
    const groupOptions = PAGE_DATA.options.filter((option) => (option.group || "Options") === groupName);
    const section = document.createElement("section");
    section.className = "groupSection";
    section.dataset.group = groupName;
    section.innerHTML = `
      <div class="groupTitle">
        <h3>${{escapeHtml(groupName)}}</h3>
        <span class="panelKicker">${{groupOptions.length}} option${{groupOptions.length === 1 ? "" : "s"}}</span>
      </div>
      <div class="groupOptions"></div>
    `;
    const mount = section.querySelector(".groupOptions");
    groupOptions.forEach((option) => mount.appendChild(renderOption(option)));
    els.optionsMount.appendChild(section);
  }});
}}

function renderOption(option){{
  const block = document.createElement("article");
  block.className = "optionBlock";
  block.dataset.optionKey = option.key;
  block.dataset.group = option.group || "Options";
  block.dataset.search = `${{option.key}} ${{option.label}} ${{option.description || ""}} ${{option.group || ""}}`.toLowerCase();
  block.innerHTML = `
    <div class="optionHead">
      <div>
        <h4 class="optionTitle">${{escapeHtml(option.label)}}</h4>
      </div>
      <span class="optionCode">${{escapeHtml(option.key)}}</span>
    </div>
  `;

  if(option.description){{
    const desc = document.createElement("p");
    desc.className = "optionDesc";
    desc.textContent = option.description;
    block.appendChild(desc);
  }}

  if(option.rangeMin !== null || option.rangeMax !== null){{
    const range = document.createElement("div");
    range.className = "rangeNote";
    if(option.rangeMin !== null) range.innerHTML += `<span>Min ${{option.rangeMin}}</span>`;
    if(option.rangeMax !== null) range.innerHTML += `<span>Max ${{option.rangeMax}}</span>`;
    block.appendChild(range);
  }}

  if(option.control === "toggle") block.appendChild(renderToggleControl(option));
  else if(option.control === "range") block.appendChild(renderRangeControl(option));
  else if(option.control === "choice") block.appendChild(renderChoiceControl(option));
  else if(option.control === "map") block.appendChild(renderMapControl(option));
  else block.appendChild(renderRawControl(option));

  return block;
}}

function renderToggleControl(option){{
  const selected = selectedEntry(option);
  const checked = normalizeBooleanKey(selected.key) === "true";
  const label = document.createElement("label");
  label.className = "toggleControl directControl";
  label.dataset.control = "toggle";
  label.innerHTML = `
    <input class="weightedToggle" type="checkbox" ${{checked ? "checked" : ""}}>
    <span class="switchRail" aria-hidden="true"></span>
    <span class="switchText"></span>
  `;
  const input = label.querySelector("input");
  const text = label.querySelector(".switchText");
  const sync = () => {{
    text.textContent = input.checked ? "True" : "False";
  }};
  input.addEventListener("change", () => {{
    sync();
    updateAll();
  }});
  sync();
  return label;
}}

function renderChoiceControl(option){{
  const wrap = document.createElement("div");
  wrap.className = "choiceControl directControl";
  wrap.dataset.control = "choice";

  const select = document.createElement("select");
  select.className = "choiceSelect";
  const selected = selectedEntry(option);
  option.entries.forEach((entry) => {{
    const choice = document.createElement("option");
    choice.value = entry.key;
    choice.textContent = humanizeValue(entry.key);
    choice.dataset.note = entry.note || "";
    select.appendChild(choice);
  }});
  select.value = selected.key || option.entries[0]?.key || "";

  const note = document.createElement("div");
  note.className = "choiceNote";
  const sync = () => {{
    const selectedOption = select.selectedOptions[0];
    note.textContent = selectedOption ? selectedOption.dataset.note || "" : "";
  }};
  select.addEventListener("change", () => {{
    sync();
    updateAll();
  }});
  wrap.appendChild(select);
  wrap.appendChild(note);
  sync();
  return wrap;
}}

function renderRangeControl(option){{
  const wrap = document.createElement("div");
  wrap.className = "rangeControl directControl";
  wrap.dataset.control = "range";

  const selected = selectedEntry(option);
  const selectedIsNumber = isNumericText(selected.key);
  const customValue = selectedIsNumber ? Number(selected.key) : defaultRangeValue(option, selected);
  const min = Number.isFinite(Number(option.rangeMin)) ? Number(option.rangeMin) : 0;
  const max = Number.isFinite(Number(option.rangeMax)) ? Number(option.rangeMax) : Math.max(99, customValue);
  const clampedValue = clamp(customValue, min, max);

  const modeRow = document.createElement("div");
  modeRow.className = "rangeModeRow";
  const mode = document.createElement("select");
  mode.className = "rangeMode";
  mode.innerHTML = `<option value="__custom__">Custom value</option>`;
  option.entries.filter((entry) => !isNumericText(entry.key)).forEach((entry) => {{
    const choice = document.createElement("option");
    choice.value = entry.key;
    choice.textContent = humanizeValue(entry.key);
    choice.dataset.note = entry.note || "";
    mode.appendChild(choice);
  }});
  mode.value = selectedIsNumber ? "__custom__" : selected.key;

  const note = document.createElement("div");
  note.className = "choiceNote";
  modeRow.appendChild(mode);
  modeRow.appendChild(note);

  const valueRow = document.createElement("div");
  valueRow.className = "rangeValueRow";
  const slider = document.createElement("input");
  slider.className = "rangeSlider";
  slider.type = "range";
  slider.min = String(min);
  slider.max = String(max);
  slider.step = "1";
  slider.value = String(clampedValue);
  const number = document.createElement("input");
  number.className = "rangeNumber";
  number.type = "number";
  number.min = String(min);
  number.max = String(max);
  number.step = "1";
  number.value = String(clampedValue);
  valueRow.appendChild(slider);
  valueRow.appendChild(number);

  const syncValue = (source) => {{
    const value = clamp(Number(source.value || min), min, max);
    slider.value = String(value);
    number.value = String(value);
  }};
  const syncMode = () => {{
    const custom = mode.value === "__custom__";
    const selectedOption = mode.selectedOptions[0];
    if(!custom){{
      const selectedRangeEntry = (option.entries || []).find((entry) => entry.key === mode.value);
      const equivalent = selectedRangeEntry ? equivalentValue(selectedRangeEntry.note) : null;
      if(equivalent !== null) syncValue({{value: equivalent}});
    }}
    slider.disabled = !custom;
    number.disabled = !custom;
    note.textContent = custom ? `Value ${{number.value}}` : selectedOption ? selectedOption.dataset.note || "" : "";
  }};
  slider.addEventListener("input", () => {{
    syncValue(slider);
    syncMode();
    updateAll();
  }});
  number.addEventListener("input", () => {{
    syncValue(number);
    syncMode();
    updateAll();
  }});
  mode.addEventListener("change", () => {{
    syncMode();
    updateAll();
  }});

  wrap.appendChild(modeRow);
  wrap.appendChild(valueRow);
  syncMode();
  return wrap;
}}

function renderMapControl(option){{
  const wrap = document.createElement("div");
  wrap.className = "directControl";
  wrap.dataset.control = "map";
  const list = document.createElement("div");
  list.className = "entryList";
  list.dataset.entryList = option.key;
  option.entries.forEach((entry) => list.appendChild(renderEntryRow(entry)));
  wrap.appendChild(list);
  const add = document.createElement("button");
  add.type = "button";
  add.className = "miniButton add";
  add.textContent = "Add Entry";
  add.addEventListener("click", () => {{
    list.appendChild(renderEntryRow({{key:"", value:"0", note:""}}));
    updateAll();
  }});
  wrap.appendChild(add);
  return wrap;
}}

function renderRawControl(option){{
  const textarea = document.createElement("textarea");
  textarea.className = "rawInput";
  textarea.spellcheck = false;
  textarea.dataset.control = "raw";
  textarea.dataset.rawOption = option.key;
  textarea.value = option.raw || "";
  textarea.addEventListener("input", updateAll);
  return textarea;
}}

function renderEntryRow(entry){{
  const row = document.createElement("div");
  row.className = "entryRow";

  const keyInput = document.createElement("input");
  keyInput.className = "entryKey";
  keyInput.type = "text";
  keyInput.value = entry.key || "";
  keyInput.setAttribute("aria-label", "Entry key");
  keyInput.addEventListener("input", updateAll);

  const valueInput = document.createElement("input");
  valueInput.className = "entryValue";
  valueInput.type = isNumericText(entry.value) ? "number" : "text";
  if(valueInput.type === "number"){{
    valueInput.min = "0";
    valueInput.step = "1";
  }}
  valueInput.value = entry.value || "0";
  valueInput.setAttribute("aria-label", "Entry value");
  valueInput.addEventListener("input", updateAll);

  const note = document.createElement("div");
  note.className = "entryNote";
  note.textContent = entry.note || "";

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "miniButton remove";
  remove.textContent = "X";
  remove.setAttribute("aria-label", "Remove entry");
  remove.addEventListener("click", () => {{
    row.remove();
    updateAll();
  }});

  row.appendChild(keyInput);
  row.appendChild(valueInput);
  row.appendChild(note);
  row.appendChild(remove);
  return row;
}}

function selectedEntry(option){{
  return (option.entries || []).find((entry) => Number(entry.value) > 0) || (option.entries || [])[0] || {{key:"", value:"0", note:""}};
}}

function normalizeBooleanKey(value){{
  return String(value || "").trim().toLowerCase();
}}

function defaultRangeValue(option, selected){{
  if(selected && isNumericText(selected.key)) return Number(selected.key);
  const equivalent = selected ? equivalentValue(selected.note) : null;
  if(equivalent !== null) return equivalent;
  const normal = (option.entries || []).find((entry) => entry.key === "normal");
  const normalEquivalent = normal ? equivalentValue(normal.note) : null;
  if(normalEquivalent !== null) return normalEquivalent;
  const numeric = (option.entries || []).find((entry) => isNumericText(entry.key));
  if(numeric) return Number(numeric.key);
  const min = Number(option.rangeMin);
  const max = Number(option.rangeMax);
  if(Number.isFinite(min) && Number.isFinite(max)) return Math.round((min + max) / 2);
  return Number.isFinite(min) ? min : 0;
}}

function equivalentValue(note){{
  const match = String(note || "").match(/equivalent to\\s+(-?\\d+)/i);
  return match ? Number(match[1]) : null;
}}

function humanizeValue(value){{
  const text = String(value ?? "");
  if(text === "__custom__") return "Custom value";
  return text.replace(/^['"]|['"]$/g, "").replace(/[_-]+/g, " ").replace(/\\b\\w/g, (char) => char.toUpperCase());
}}

function clamp(value, min, max){{
  const safe = Number.isFinite(value) ? value : min;
  return Math.max(min, Math.min(max, safe));
}}

function bindEvents(){{
  els.playerName.addEventListener("input", updateAll);
  els.description.addEventListener("input", updateAll);
  els.requiresVersion.addEventListener("input", updateAll);
  els.searchBox.addEventListener("input", filterOptions);
  els.groupFilter.addEventListener("change", filterOptions);
  els.copyBtn.addEventListener("click", copyYaml);
  els.downloadBtn.addEventListener("click", downloadYaml);
}}

function updateAll(){{
  els.yamlOutput.value = buildYaml();
  els.yamlStatus.textContent = validateState();
  els.statusLine.textContent = `${{els.yamlOutput.value.split("\\n").length - 1}} YAML lines generated`;
  filterOptions();
}}

function filterOptions(){{
  const query = (els.searchBox.value || "").trim().toLowerCase();
  const group = els.groupFilter.value;
  let visible = 0;
  document.querySelectorAll(".groupSection").forEach((section) => {{
    let sectionVisible = 0;
    section.querySelectorAll(".optionBlock").forEach((block) => {{
      const matchesGroup = !group || block.dataset.group === group;
      const matchesQuery = !query || block.dataset.search.includes(query);
      const show = matchesGroup && matchesQuery;
      block.classList.toggle("hidden", !show);
      if(show){{
        visible += 1;
        sectionVisible += 1;
      }}
    }});
    section.classList.toggle("hidden", sectionVisible === 0);
  }});
  els.visibleCount.textContent = `${{visible}} visible`;
}}

function validateState(){{
  if(!(els.playerName.value || "").trim()) return "Needs Name";
  if(!PAGE_DATA.options.length) return "No Options";
  return "Ready";
}}

function buildYaml(){{
  const lines = [];
  lines.push(`# Generated by ${{PAGE_DATA.fileName}}`);
  lines.push(`# Source: ${{PAGE_DATA.sourceName}}`);
  lines.push(`name: ${{yamlScalar((els.playerName.value || "").trim() || "Player")}}`);
  lines.push(`description: ${{yamlScalar((els.description.value || "").trim() || `${{PAGE_DATA.game}} player options.`, true)}}`);
  lines.push(`game: ${{yamlScalar(PAGE_DATA.game, true)}}`);

  const version = (els.requiresVersion.value || "").trim();
  if(version || PAGE_DATA.worldVersion){{
    lines.push("requires:");
    if(version) lines.push(`  version: ${{yamlScalar(version)}}`);
    if(PAGE_DATA.worldVersion){{
      lines.push("  game:");
      lines.push(`    ${{yamlKey(PAGE_DATA.game)}}: ${{yamlScalar(PAGE_DATA.worldVersion)}}`);
    }}
  }}

  lines.push("");
  lines.push(`${{yamlKey(PAGE_DATA.game)}}:`);

  PAGE_DATA.options.forEach((option) => {{
    const block = document.querySelector(`[data-option-key="${{cssEscape(option.key)}}"]`);
    if(!block) return;
    if(option.control === "toggle"){{
      const checked = block.querySelector(".weightedToggle").checked;
      appendWeightedSelection(lines, option, checked ? "true" : "false");
    }}else if(option.control === "choice"){{
      const selected = block.querySelector(".choiceSelect").value;
      appendWeightedSelection(lines, option, selected);
    }}else if(option.control === "range"){{
      const mode = block.querySelector(".rangeMode").value;
      if(mode === "__custom__"){{
        appendWeightedRangeSelection(lines, option, block.querySelector(".rangeNumber").value);
      }}else{{
        appendWeightedSelection(lines, option, mode);
      }}
    }}else if(option.control === "map"){{
      appendMapEntries(lines, option, block);
    }}else{{
      const raw = block.querySelector(".rawInput").value;
      appendRawOption(lines, option.key, raw);
    }}
  }});

  return lines.join("\\n") + "\\n";
}}

function appendWeightedSelection(lines, option, selectedKey){{
  lines.push(`  ${{yamlKey(option.key)}}:`);
  let found = false;
  (option.entries || []).forEach((entry) => {{
    const selected = String(entry.key) === String(selectedKey);
    if(selected) found = true;
    lines.push(`    ${{yamlKey(entry.key)}}: ${{selected ? 50 : 0}}`);
  }});
  if(!found && selectedKey){{
    lines.push(`    ${{yamlKey(selectedKey)}}: 50`);
  }}
}}

function appendWeightedRangeSelection(lines, option, rawValue){{
  const min = Number.isFinite(Number(option.rangeMin)) ? Number(option.rangeMin) : 0;
  const max = Number.isFinite(Number(option.rangeMax)) ? Number(option.rangeMax) : 99;
  const selectedKey = String(clamp(Math.round(Number(rawValue || min)), min, max));
  lines.push(`  ${{yamlKey(option.key)}}:`);
  let found = false;
  (option.entries || []).forEach((entry) => {{
    const selected = String(entry.key) === selectedKey;
    if(selected) found = true;
    lines.push(`    ${{yamlKey(entry.key)}}: ${{selected ? 50 : 0}}`);
  }});
  if(!found){{
    lines.splice(lines.length - (option.entries || []).length, 0, `    ${{yamlKey(selectedKey)}}: 50`);
  }}
}}

function appendMapEntries(lines, option, block){{
  const rows = [...block.querySelectorAll(".entryRow")].map((row) => {{
    const key = row.querySelector(".entryKey").value.trim();
    const value = row.querySelector(".entryValue").value.trim();
    return {{key, value}};
  }}).filter((entry) => entry.key);
  if(!rows.length){{
    lines.push(`  ${{yamlKey(option.key)}}: {{}}`);
    return;
  }}
  lines.push(`  ${{yamlKey(option.key)}}:`);
  rows.forEach((entry) => {{
    lines.push(`    ${{yamlKey(entry.key)}}: ${{yamlValue(entry.value || "0")}}`);
  }});
}}

function appendRawOption(lines, key, raw){{
  const text = String(raw || "").trim();
  if(!text){{
    lines.push(`  ${{yamlKey(key)}}: []`);
    return;
  }}
  if(!text.includes("\\n")){{
    lines.push(`  ${{yamlKey(key)}}: ${{text}}`);
    return;
  }}
  lines.push(`  ${{yamlKey(key)}}:`);
  const rawLines = text.replace(/\\s+$/g, "").split("\\n");
  const filled = rawLines.filter((line) => line.trim());
  const minIndent = filled.reduce((min, line) => Math.min(min, line.match(/^\\s*/)[0].length), Infinity);
  rawLines.forEach((line) => {{
    lines.push(line.trim() ? "    " + line.slice(minIndent) : "");
  }});
}}

async function copyYaml(){{
  const text = els.yamlOutput.value;
  try{{
    if(navigator.clipboard && window.isSecureContext){{
      await navigator.clipboard.writeText(text);
    }}else{{
      els.yamlOutput.focus();
      els.yamlOutput.select();
      document.execCommand("copy");
      els.yamlOutput.setSelectionRange(0, 0);
    }}
    flashStatus("Copied");
  }}catch(_){{
    els.yamlOutput.focus();
    els.yamlOutput.select();
    flashStatus("Selected");
  }}
}}

function downloadYaml(){{
  const name = sanitizeFileName((els.playerName.value || "").trim() || PAGE_DATA.slug || "Player");
  const blob = new Blob([els.yamlOutput.value], {{type:"text/yaml;charset=utf-8"}});
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${{name}}.yaml`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
  flashStatus("Downloaded");
}}

function flashStatus(text){{
  els.yamlStatus.textContent = text;
  clearTimeout(flashStatus.timer);
  flashStatus.timer = setTimeout(updateAll, 900);
}}

function yamlScalar(value, forceQuote = false){{
  const text = String(value ?? "");
  if(!forceQuote && /^-?\\d+(\\.\\d+)?$/.test(text)) return text;
  if(!forceQuote && /^[A-Za-z0-9_./-]+$/.test(text) && !isYamlKeyword(text)) return text;
  return `"${{text.replace(/\\\\/g, "\\\\\\\\").replace(/"/g, '\\\\"')}}"`;
}}

function yamlKey(value){{
  const text = String(value ?? "");
  if(/^-?\\d+(\\.\\d+)?$/.test(text)) return text;
  if(/^[A-Za-z0-9_./-]+$/.test(text) && !isYamlKeyword(text)) return text;
  return `'${{text.replace(/'/g, "''")}}'`;
}}

function yamlValue(value){{
  const text = String(value ?? "").trim();
  if(!text) return "0";
  if(/^-?\\d+(\\.\\d+)?$/.test(text)) return text;
  if(/^(true|false|null)$/i.test(text)) return text.toLowerCase();
  if(/^(\\[|\\{{|'|"|>|\\||!|&|\\*)/.test(text)) return text;
  return yamlScalar(text, true);
}}

function isYamlKeyword(value){{
  return /^(true|false|null|yes|no|on|off|y|n)$/i.test(String(value));
}}

function isNumericText(value){{
  return /^-?\\d+(\\.\\d+)?$/.test(String(value || "").trim());
}}

function sanitizeFileName(value){{
  return String(value || "Player").replace(/[^A-Za-z0-9_.-]+/g, "_").replace(/^_+|_+$/g, "") || "Player";
}}

function cssEscape(value){{
  if(window.CSS && CSS.escape) return CSS.escape(value);
  return String(value).replace(/["\\\\]/g, "\\\\$&");
}}

function escapeHtml(value){{
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({{
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#39;"
  }})[char]);
}}

document.addEventListener("DOMContentLoaded", init);
</script>
</body>
</html>
"""


def html_escape(value: str) -> str:
    return (
        value.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&#39;")
    )


def build_index(pages: list[dict]) -> str:
    links = "\n".join(
        f'      <a class="link" href="{html_escape(page["fileName"])}">{html_escape(page["game"])}<span>{len(page["options"])} options</span></a>'
        for page in pages
    )
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>YAML Options Pages</title>
<style>
body{{margin:0;min-height:100vh;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#172027;background:linear-gradient(135deg,#101418,#1a2a2b 54%,#24212a)}}
.wrap{{width:min(900px,calc(100vw - 28px));margin:0 auto;padding:24px 0}}
h1{{margin:0 0 14px;color:#f8fafc;font-size:32px;letter-spacing:0}}
.list{{display:grid;gap:10px}}
.link{{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:14px 16px;border:1px solid #82919b;border-radius:8px;background:#f7f8f9;color:#172027;text-decoration:none;font-weight:800}}
.link span{{font-family:Consolas,"Courier New",monospace;font-size:12px;color:#5c6870;font-weight:700}}
</style>
</head>
<body>
<main class="wrap">
  <h1>YAML Options Pages</h1>
  <div class="list">
{links}
  </div>
</main>
</body>
</html>
"""


def build_pages(zip_path: Path, output_dir: Path) -> list[dict]:
    output_dir.mkdir(parents=True, exist_ok=True)
    pages: list[dict] = []
    with zipfile.ZipFile(zip_path) as archive:
        for source_name in archive.namelist():
            if not source_name.lower().endswith((".yaml", ".yml")):
                continue
            text = archive.read(source_name).decode("utf-8-sig", errors="replace")
            data = parse_yaml_template(source_name, text)
            target = output_dir / data["fileName"]
            target.write_text(build_html(data), encoding="utf-8", newline="\n")
            pages.append(data)

    pages.sort(key=lambda page: page["game"].lower())
    (output_dir / "index.html").write_text(build_index(pages), encoding="utf-8", newline="\n")
    return pages


def main() -> None:
    parser = argparse.ArgumentParser(description="Build basic HTML option pages from Archipelago YAML templates.")
    parser.add_argument("--zip", type=Path, default=DEFAULT_ZIP, help="Path to YAMLs.zip")
    parser.add_argument("--out", type=Path, default=DEFAULT_OUTPUT_DIR, help="Output directory for generated pages")
    args = parser.parse_args()

    pages = build_pages(args.zip, args.out)
    for page in pages:
        print(f"{page['fileName']}: {page['game']} ({len(page['options'])} options)")


if __name__ == "__main__":
    main()
