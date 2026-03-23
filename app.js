(function () {
  const diagram = document.getElementById("diagram");
  if (!diagram) return;

  const devStack = document.getElementById("devStack");
  const bridgeArrows = document.getElementById("bridgeArrows");
  const teamsCol = document.getElementById("teamsCol");
  const topPath = diagram.querySelector(".loop--top");
  const bottomPath = diagram.querySelector(".loop--bottom");

  let feedbackLoopsAnimated = false;
  let lastRowCount = 0;

  function computeRowCount() {
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const headerReserve = vw <= 900 ? 100 : 72;
    const usable = Math.max(280, vh - headerReserve);
    const perRowBudget = vw <= 900 ? 34 : 26;
    const n = Math.floor(usable / perRowBudget);
    return Math.min(40, Math.max(14, n));
  }

  function devLabel(i, n) {
    if (i === 1) return "Developer1";
    if (i === 2) return "Developer2";
    if (i === 3) return "Developer3";
    if (i === 4) return "Developer4";
    if (i === n - 1) return "Developer(n-1)";
    if (i === n) return "Developer(n)";
    return "Developer";
  }

  function buildTeamRow(i, n) {
    const row = document.createElement("div");
    row.className = "team-row";

    const pair = document.createElement("div");
    pair.className = "pair";

    const cellPm = document.createElement("div");
    cellPm.className = "pair__cell";
    const cellUs = document.createElement("div");
    cellUs.className = "pair__cell";

    if (i === 1) {
      const c1 = document.createElement("div");
      c1.className = "callout";
      c1.innerHTML =
        '<span class="callout__arrow" aria-hidden="true"></span><span class="callout__label">Me</span>';
      const c2 = document.createElement("div");
      c2.className = "callout";
      c2.innerHTML =
        '<span class="callout__arrow" aria-hidden="true"></span><span class="callout__label">You</span>';

      const pm = document.createElement("div");
      pm.className = "box box--pm box--highlight";
      pm.textContent = "Project Manager1 (HR1)";
      const us = document.createElement("div");
      us.className = "box box--us box--highlight";
      us.textContent = "US representative1 (Fractional PM1)";

      cellPm.append(c1, pm);
      cellUs.append(c2, us);
    } else {
      const pm = document.createElement("div");
      pm.className = "box box--pm";
      pm.textContent = `Project Manager${i} (HR${i})`;
      const us = document.createElement("div");
      us.className = "box box--us";
      us.textContent = `US representative${i} (Fractional PM${i})`;
      cellPm.append(pm);
      cellUs.append(us);
    }

    const plus = document.createElement("span");
    plus.className = "plus";
    plus.setAttribute("aria-hidden", "true");
    plus.textContent = "+";

    pair.append(cellPm, plus, cellUs);

    const out = document.createElement("span");
    out.className = "block-arrow block-arrow--out";
    out.setAttribute("aria-hidden", "true");
    out.textContent = "➡";

    row.append(pair, out);
    return row;
  }

  function buildDiagram() {
    const n = computeRowCount();
    if (n === lastRowCount && devStack.childElementCount === n) return;
    lastRowCount = n;

    devStack.replaceChildren();
    bridgeArrows.replaceChildren();
    teamsCol.replaceChildren();

    for (let i = 1; i <= n; i += 1) {
      const dev = document.createElement("div");
      dev.className = "box box--dev";
      dev.textContent = devLabel(i, n);
      devStack.append(dev);

      const slot = document.createElement("div");
      slot.className = "bridge__slot";
      const arr = document.createElement("span");
      arr.className = "block-arrow";
      arr.textContent = "➡";
      slot.append(arr);
      bridgeArrows.append(slot);

      teamsCol.append(buildTeamRow(i, n));
    }

    wireBoxes();
    feedbackLoopsAnimated = false;
    requestAnimationFrame(updateFeedbackLoops);
  }

  function wireBoxes() {
    diagram.querySelectorAll(".box").forEach((box) => {
      if (box.dataset.wired === "1") return;
      box.dataset.wired = "1";
      box.setAttribute("tabindex", "0");
      box.addEventListener("keydown", onBoxKeydown);
    });
  }

  function onBoxKeydown(e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    if (!e.target.classList.contains("box")) return;
    e.preventDefault();
    e.target.classList.toggle("is-active");
  }

  function updateFeedbackLoops() {
    const inner = diagram.querySelector(".diagram__inner");
    if (!inner || !topPath || !bottomPath) return;

    const rect = diagram.getBoundingClientRect();
    const innerRect = inner.getBoundingClientRect();
    if (rect.width < 40 || rect.height < 40) return;

    const pad = 14;
    const x0 = innerRect.left - rect.left;
    const y0 = innerRect.top - rect.top;
    const w = innerRect.width;
    const h = innerRect.height;

    const upworkEl = diagram.querySelector(".box--upwork");
    const devStackEl = diagram.querySelector(".dev-stack");
    if (!upworkEl || !devStackEl) return;

    const up = upworkEl.getBoundingClientRect();
    const dev = devStackEl.getBoundingClientRect();

    const upTop = {
      x: up.left - rect.left + up.width * 0.5,
      y: up.top - rect.top,
    };
    const upBottom = {
      x: up.left - rect.left + up.width * 0.5,
      y: up.bottom - rect.top,
    };
    const devTop = {
      x: dev.left - rect.left + dev.width * 0.5,
      y: dev.top - rect.top,
    };
    const devBottom = {
      x: dev.left - rect.left + dev.width * 0.5,
      y: dev.bottom - rect.top,
    };

    const lift = Math.min(48, h * 0.12);
    const spread = Math.max(80, w * 0.35);

    const topY = y0 - pad;
    const bottomY = y0 + h + pad;

    const dTop = [
      `M ${upTop.x} ${upTop.y}`,
      `C ${upTop.x + spread} ${upTop.y - lift}, ${devTop.x + spread} ${topY}, ${devTop.x} ${devTop.y}`,
    ].join(" ");

    const dBottom = [
      `M ${upBottom.x} ${upBottom.y}`,
      `C ${upBottom.x + spread} ${upBottom.y + lift}, ${devBottom.x + spread} ${bottomY}, ${devBottom.x} ${devBottom.y}`,
    ].join(" ");

    topPath.setAttribute("d", dTop);
    bottomPath.setAttribute("d", dBottom);

    if (
      !feedbackLoopsAnimated &&
      typeof topPath.getTotalLength === "function" &&
      topPath.getTotalLength() >= 24
    ) {
      feedbackLoopsAnimated = true;
      [topPath, bottomPath].forEach((path) => {
        if (!path || typeof path.getTotalLength !== "function") return;
        const len = path.getTotalLength();
        if (len < 2) return;
        path.style.strokeDasharray = String(len);
        path.style.strokeDashoffset = String(len);
        path.style.transition = "none";
        path.getBoundingClientRect();
        path.style.transition = "stroke-dashoffset 1s ease-out";
        requestAnimationFrame(() => {
          path.style.strokeDashoffset = "0";
        });
      });
      window.setTimeout(() => {
        [topPath, bottomPath].forEach((path) => {
          if (!path) return;
          path.style.strokeDasharray = "";
          path.style.strokeDashoffset = "";
          path.style.transition = "";
        });
      }, 1050);
    }
  }

  let ro;
  if (typeof ResizeObserver !== "undefined") {
    ro = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        buildDiagram();
        updateFeedbackLoops();
      });
    });
    ro.observe(diagram);
  }

  let resizeT;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeT);
    resizeT = window.setTimeout(() => {
      buildDiagram();
      requestAnimationFrame(updateFeedbackLoops);
    }, 120);
  });

  window.addEventListener("load", () => {
    buildDiagram();
    requestAnimationFrame(updateFeedbackLoops);
  });

  buildDiagram();
  requestAnimationFrame(updateFeedbackLoops);
})();
