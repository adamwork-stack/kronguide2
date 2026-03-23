(function () {
  const diagram = document.getElementById("diagram");
  if (!diagram) return;

  const topPath = diagram.querySelector(".loop--top");
  const bottomPath = diagram.querySelector(".loop--bottom");
  let feedbackLoopsAnimated = false;

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
    const devStack = diagram.querySelector(".dev-stack");
    if (!upworkEl || !devStack) return;

    const up = upworkEl.getBoundingClientRect();
    const dev = devStack.getBoundingClientRect();

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
      requestAnimationFrame(updateFeedbackLoops);
    });
    ro.observe(diagram);
  }

  window.addEventListener("load", updateFeedbackLoops);
  window.addEventListener("resize", () => requestAnimationFrame(updateFeedbackLoops));
  requestAnimationFrame(updateFeedbackLoops);

  diagram.querySelectorAll(".box").forEach((box) => {
    box.setAttribute("tabindex", "0");
    box.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        box.classList.toggle("is-active");
      }
    });
  });
})();
