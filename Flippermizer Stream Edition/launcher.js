const FLPR_BOT_BUTTON_LABEL = "Start FLPR-Bot";

function setFlprBotStatus(message, state) {
  const flprBotStatus = document.getElementById("flprBotStatus");
  if (!flprBotStatus) return;
  flprBotStatus.textContent = message;
  flprBotStatus.classList.toggle("missing", state === "missing" || state === "error");
}

async function boot() {
  const api = window.flprLauncher;
  const data = api?.getData ? await api.getData() : {};

  const heroLogo = document.getElementById("heroLogo");
  if (heroLogo && data.logoUrl) heroLogo.src = data.logoUrl;

  const buildMode = document.getElementById("buildMode");
  if (buildMode) {
    if (!api?.getData) {
      buildMode.innerHTML = `<span class="statusWarn">Launcher API unavailable.</span>`;
    } else {
      const modeLabel = data.packaged ? "Packaged build" : "Workspace build";
      const hzLabel = Number(data.displayFrequency) > 0 ? ` - ${Math.round(Number(data.displayFrequency))} Hz display` : "";
      const graphicsLabel = data.graphicsModeLabel ? ` - ${data.graphicsModeLabel}` : "";
      buildMode.innerHTML = `<span class="statusGood">v${data.appVersion}</span> <span>(${modeLabel}${hzLabel}${graphicsLabel})</span>`;
    }
  }
  const flprBotStatus = document.getElementById("flprBotStatus");
  const runFlprBotBtn = document.getElementById("runFlprBotBtn");
  const canRunFlprBot = typeof api?.runFlprBot === "function";
  if (flprBotStatus) {
    if (!api?.getData) {
      setFlprBotStatus("Launcher API unavailable. Restart the Electron launcher or check preload/main wiring.", "error");
    } else if (!canRunFlprBot) {
      setFlprBotStatus("FLPR-Bot start API unavailable. runFlprBot is not exposed by preload.", "error");
    } else {
      setFlprBotStatus(
        data.flprBotExists ? `Ready: ${data.flprBotPath}` : `Missing: ${data.flprBotPath || "FLPR-Bot.exe"}`,
        data.flprBotExists ? "ready" : "missing"
      );
    }
  }
  if (runFlprBotBtn) {
    runFlprBotBtn.disabled = !data.flprBotExists || !canRunFlprBot;
    runFlprBotBtn.addEventListener("click", async () => {
      if (!canRunFlprBot) {
        setFlprBotStatus("FLPR-Bot start API unavailable. runFlprBot is not exposed by preload.", "error");
        return;
      }
      runFlprBotBtn.disabled = true;
      runFlprBotBtn.textContent = "Starting...";
      setFlprBotStatus("Starting FLPR-Bot...", "ready");
      try {
        const result = await api.runFlprBot();
        setFlprBotStatus(
          result?.ok ? `Started: ${result.path || data.flprBotPath || "FLPR-Bot.exe"}` : `Could not start: ${result?.path || data.flprBotPath || "FLPR-Bot.exe"}`,
          result?.ok ? "ready" : "error"
        );
      } catch (err) {
        console.error(err);
        setFlprBotStatus(`Could not start FLPR-Bot: ${err?.message || err}`, "error");
      } finally {
        runFlprBotBtn.disabled = !data.flprBotExists || !canRunFlprBot;
        runFlprBotBtn.textContent = FLPR_BOT_BUTTON_LABEL;
      }
    });
  }
  if (!api?.getData) return;

  const graphicsModeSelect = document.getElementById("graphicsModeSelect");
  const applyGraphicsModeBtn = document.getElementById("applyGraphicsModeBtn");
  if (graphicsModeSelect && Array.isArray(data.graphicsModes)) {
    graphicsModeSelect.innerHTML = data.graphicsModes
      .map((mode) => `<option value="${mode.value}">${mode.label}</option>`)
      .join("");
    graphicsModeSelect.value = data.graphicsMode || "";
  }
  applyGraphicsModeBtn?.addEventListener("click", async () => {
    const nextMode = graphicsModeSelect?.value || "";
    if (!nextMode || nextMode === data.graphicsMode) return;
    applyGraphicsModeBtn.disabled = true;
    applyGraphicsModeBtn.textContent = "Applying And Relaunching...";
    try {
      await api.setGraphicsMode(nextMode);
    } catch (err) {
      console.error(err);
      applyGraphicsModeBtn.disabled = false;
      applyGraphicsModeBtn.textContent = "Apply Renderer Mode";
    }
  });

  document.querySelectorAll("[data-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const kind = btn.getAttribute("data-page");
      api.openPage(kind);
    });
  });

  document.querySelectorAll("[data-guide]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const kind = btn.getAttribute("data-guide");
      api.openPage(kind, { tutorial: true });
    });
  });

  document.getElementById("showApworldBtn")?.addEventListener("click", () => {
    api.showApworld();
  });
  document.getElementById("openApworldFolderBtn")?.addEventListener("click", () => {
    api.openApworldFolder();
  });
  document.getElementById("openAppFolderBtn")?.addEventListener("click", () => {
    api.openAppFolder();
  });

}

boot().catch((err) => {
  console.error(err);
});
