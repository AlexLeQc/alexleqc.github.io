// Panneau « En direct du dépôt » de la page SprintYourLife.
// Lit l'API publique de GitHub (sans jeton) : dernière CI sur main et dernières PR fusionnées.
// En cas d'échec (limite de requêtes, hors ligne), le panneau garde des liens vers GitHub.
(() => {
  const REPO = "AlexLeQc/SprintYourLife";
  const API = `https://api.github.com/repos/${REPO}`;
  const ciEl = document.getElementById("live-ci");
  const prsEl = document.getElementById("live-prs");
  if (!ciEl || !prsEl) return;

  let run = null;
  let prs = null;
  let failed = false;

  // Le français est la langue du HTML : ses traductions ne sont chargées qu'après un aller-retour.
  const FR = {
    "syl.live.ok": "Réussie",
    "syl.live.fail": "En échec",
    "syl.live.running": "En cours",
    "syl.live.error": "Impossible de joindre GitHub pour l'instant.",
  };
  const tr = (key) => {
    const v = typeof I18n !== "undefined" ? I18n.t(key) : undefined;
    return typeof v === "string" ? v : FR[key] || key;
  };
  const lang = () => (typeof I18n !== "undefined" ? I18n.current : "fr");

  function ago(iso) {
    const diff = (new Date(iso).getTime() - Date.now()) / 1000;
    const rtf = new Intl.RelativeTimeFormat(lang() === "en" ? "en" : "fr-CA", { numeric: "auto" });
    const units = [["day", 86400], ["hour", 3600], ["minute", 60]];
    for (const [unit, s] of units) {
      if (Math.abs(diff) >= s) return rtf.format(Math.round(diff / s), unit);
    }
    return rtf.format(Math.round(diff), "second");
  }

  function renderCi() {
    const text = ciEl.querySelector(".ci-text");
    const when = ciEl.querySelector(".ci-when");
    text.removeAttribute("data-i18n");
    ciEl.classList.remove("ok", "fail", "running");
    if (failed && !run) {
      text.textContent = tr("syl.live.error");
      when.textContent = "";
      return;
    }
    if (!run) return;
    let state = "running";
    if (run.status === "completed") state = run.conclusion === "success" ? "ok" : "fail";
    ciEl.classList.add(state);
    ciEl.href = run.html_url;
    text.textContent = tr(`syl.live.${state}`);
    when.textContent = `· ${ago(run.updated_at)}`;
  }

  function renderPrs() {
    if (failed && !prs) {
      prsEl.innerHTML = "";
      const li = document.createElement("li");
      li.className = "pr-empty";
      li.textContent = tr("syl.live.error");
      prsEl.append(li);
      return;
    }
    if (!prs) return;
    prsEl.innerHTML = "";
    prs.forEach((pr) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = pr.html_url;
      a.target = "_blank";
      a.rel = "noopener";
      const num = document.createElement("span");
      num.className = "pr-num";
      num.textContent = `#${pr.number}`;
      const title = document.createElement("span");
      title.className = "pr-title";
      title.textContent = pr.title;
      const when = document.createElement("span");
      when.className = "pr-when";
      when.textContent = ago(pr.merged_at);
      a.append(num, title, when);
      li.append(a);
      prsEl.append(li);
    });
  }

  function render() {
    renderCi();
    renderPrs();
  }

  async function getJson(url) {
    const res = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json();
  }

  Promise.allSettled([
    getJson(`${API}/actions/runs?branch=main&per_page=1`).then((d) => {
      run = d.workflow_runs && d.workflow_runs[0];
    }),
    getJson(`${API}/pulls?state=closed&sort=updated&direction=desc&per_page=20`).then((d) => {
      prs = d
        .filter((p) => p.merged_at)
        .sort((a, b) => new Date(b.merged_at) - new Date(a.merged_at))
        .slice(0, 5);
    }),
  ]).then((results) => {
    failed = results.some((r) => r.status === "rejected");
    render();
  });

  // Quand la langue change, i18n.js modifie <html lang> : on réécrit les textes dynamiques.
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
})();
