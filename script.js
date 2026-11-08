/**
 * FEDERICO DUMAGPI — SITE INTERACTION SYSTEM v5
 * Vanilla JavaScript (zero external dependencies).
 * 
 * 1. Mobile Drawer Navigation
 * 2. Header State & Scroll Progress Bar
 * 3. Live Dubai GST Clock
 * 4. Attendance Verification Simulator (Hero)
 * 5. Process Timeline (Roving Tabindex + Arrow Keys)
 * 6. Capabilities Explorer Accordions & Topic Filter
 * 7. Store Category Navigation & Accordions
 * 8. Form Submission Feedback Toast
 */

document.addEventListener("DOMContentLoaded", () => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ==========================================================================
     1. MOBILE DRAWER NAVIGATION
     ========================================================================== */
  const menuBtn = document.getElementById("mobile-menu-btn");
  const drawer = document.getElementById("mobile-menu");

  function setMenu(open, returnFocus = false) {
    if (!menuBtn || !drawer) return;
    drawer.hidden = !open;
    menuBtn.setAttribute("aria-expanded", String(open));
    const icon = menuBtn.querySelector("i");
    if (icon) {
      icon.classList.toggle("fa-bars", !open);
      icon.classList.toggle("fa-xmark", open);
    }
    if (!open && returnFocus) menuBtn.focus();
  }

  if (menuBtn && drawer) {
    menuBtn.addEventListener("click", () => setMenu(drawer.hidden));
    drawer.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenu(false));
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !drawer.hidden) {
        setMenu(false, true);
      }
    });
    window.matchMedia("(min-width: 1024px)").addEventListener("change", (e) => {
      if (e.matches) setMenu(false);
    });
  }

  /* ==========================================================================
     2. SCROLL PROGRESS & HEADER STATE
     ========================================================================== */
  const progressBar = document.querySelector("#scroll-progress span");
  const header = document.querySelector(".site-header");
  let ticking = false;

  function onScroll() {
    const top = document.documentElement.scrollTop || document.body.scrollTop;
    const max = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (progressBar) {
      progressBar.style.width = (max > 0 ? (top / max) * 100 : 0) + "%";
    }
    if (header) {
      header.classList.toggle("is-scrolled", top > 8);
    }
    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  onScroll();

  /* ==========================================================================
     3. LIVE DUBAI GST CLOCK (UTC+4)
     ========================================================================== */
  const clock = document.getElementById("dubai-clock");
  if (clock) {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Dubai",
    });
    const tick = () => {
      try {
        clock.textContent = `${fmt.format(new Date())} GST`;
      } catch (err) {
        clock.textContent = "12:00 GST";
      }
    };
    tick();
    setInterval(tick, 10000);
  }

  /* ==========================================================================
     4. ATTENDANCE VERIFICATION SIMULATOR (Hero)
     ========================================================================== */
  const consoleEl = document.getElementById("pipeline-console");
  if (consoleEl) {
    const range = document.getElementById("hc-range");
    const hcOut = document.getElementById("hc-value");
    const manualEl = document.getElementById("manual-hours");
    const annualEl = document.getElementById("annual-hours");
    const autoEl = document.getElementById("auto-time");
    const stateText = document.getElementById("console-state");
    const bar = document.getElementById("run-progress");
    const logRows = Array.from(consoleEl.querySelectorAll(".log-row"));
    const runBtn = document.getElementById("run-pipeline");
    const HOURS_PER_EMPLOYEE = 48 / 4800; // 0.01h per employee
    let timers = [];

    const renderModel = () => {
      if (!range || !hcOut) return;
      const headcount = Number(range.value);
      const hours = headcount * HOURS_PER_EMPLOYEE;
      hcOut.textContent = headcount.toLocaleString("en-US");
      if (manualEl) manualEl.textContent = `${hours.toFixed(1)} hrs`;
      if (annualEl) annualEl.textContent = `${Math.round(hours * 12).toLocaleString("en-US")} hrs`;
      
      const min = Number(range.min);
      const max = Number(range.max);
      range.style.setProperty("--fill", `${((headcount - min) / (max - min)) * 100}%`);
    };

    const setState = (state, text) => {
      consoleEl.dataset.state = state;
      if (stateText) stateText.textContent = text;
    };

    const clearTimers = () => {
      timers.forEach(clearTimeout);
      timers = [];
    };

    const finish = () => {
      logRows.forEach((row) => row.classList.add("is-shown"));
      if (bar) bar.style.width = "100%";
      if (autoEl) autoEl.textContent = "0.00 min";
      setState("done", "VERIFIED");
      if (runBtn) runBtn.disabled = false;
    };

    const run = () => {
      clearTimers();
      logRows.forEach((row) => row.classList.remove("is-shown"));
      if (bar) bar.style.width = "0%";
      if (autoEl) autoEl.textContent = "Verifying...";
      
      if (reducedMotion) {
        finish();
        return;
      }
      
      if (runBtn) runBtn.disabled = true;
      setState("running", "CHECKING");
      
      logRows.forEach((row, i) => {
        timers.push(
          setTimeout(() => {
            row.classList.add("is-shown");
            if (bar) bar.style.width = `${((i + 1) / logRows.length) * 100}%`;
            if (i === logRows.length - 1) finish();
          }, 350 * (i + 1))
        );
      });
    };

    range.addEventListener("input", renderModel);
    if (runBtn) runBtn.addEventListener("click", run);
    renderModel();
    setState("idle", "READY");
    // Initial run
    timers.push(setTimeout(run, reducedMotion ? 0 : 500));
  }

  /* ==========================================================================
     5. PROCESS TIMELINE (Roving Tabindex + Arrow Keys)
     ========================================================================== */
  const timeline = document.querySelector(".timeline");
  if (timeline) {
    const tabs = Array.from(timeline.querySelectorAll('[role="tab"]'));
    const panels = tabs.map((tab) => document.getElementById(tab.getAttribute("aria-controls")));

    const selectTab = (index, focus = false) => {
      tabs.forEach((tab, i) => {
        const active = i === index;
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
        if (panels[i]) {
          panels[i].hidden = !active;
        }
      });
      const ratio = tabs.length > 1 ? index / (tabs.length - 1) : 0;
      timeline.style.setProperty("--progress-ratio", String(ratio));
      if (focus && tabs[index]) tabs[index].focus();
    };

    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => selectTab(i));
      tab.addEventListener("keydown", (e) => {
        const last = tabs.length - 1;
        let next = null;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          next = i === last ? 0 : i + 1;
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          next = i === 0 ? last : i - 1;
        } else if (e.key === "Home") {
          next = 0;
        } else if (e.key === "End") {
          next = last;
        }
        if (next !== null) {
          e.preventDefault();
          selectTab(next, true);
        }
      });
    });

    selectTab(0);
  }

  /* ==========================================================================
     6. CAPABILITIES EXPLORER ACCORDIONS & TOPIC FILTER
     ========================================================================== */
  const capFilters = document.querySelectorAll("[data-cap-filter]");
  const capRows = document.querySelectorAll(".cap-row");

  if (capFilters.length && capRows.length) {
    capFilters.forEach((btn) => {
      btn.addEventListener("click", () => {
        const filter = btn.getAttribute("data-cap-filter");
        capFilters.forEach((b) => {
          const active = b === btn;
          b.setAttribute("aria-pressed", String(active));
        });

        capRows.forEach((row) => {
          const domain = row.getAttribute("data-domain");
          const matches = filter === "all" || domain === filter;
          row.hidden = !matches;
        });
      });
    });

    capRows.forEach((row) => {
      const toggle = row.querySelector(".cap-toggle");
      const panel = row.querySelector(".cap-panel");
      if (!toggle || !panel) return;

      toggle.addEventListener("click", () => {
        const expanded = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!expanded));
        panel.hidden = expanded;
        const icon = toggle.querySelector(".cap-icon");
        if (icon) {
          icon.textContent = expanded ? "+" : "−";
        }
      });
    });
  }

  /* ==========================================================================
     7. STORE CATEGORY NAVIGATION & PRODUCT ACCORDIONS
     ========================================================================== */
  const catNavTabs = document.querySelectorAll("[data-cat-tab]");
  const productItems = document.querySelectorAll(".sku");
  const jumpLists = {
    all: document.getElementById("jumpList-all"),
    spreadsheets: document.getElementById("jumpList-spreadsheets"),
    "ai-prompts": document.getElementById("jumpList-ai-prompts"),
    software: document.getElementById("jumpList-software")
  };
  const storeStatus = document.getElementById("storeStatus");
  const catJumpCount = document.getElementById("catJumpCount");

  if (catNavTabs.length && productItems.length) {
    catNavTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const selectedCat = tab.getAttribute("data-cat-tab");

        catNavTabs.forEach((t) => {
          const active = t === tab;
          t.classList.toggle("active", active);
          t.setAttribute("aria-selected", String(active));
        });

        // Toggle jump lists
        Object.keys(jumpLists).forEach((key) => {
          if (jumpLists[key]) {
            jumpLists[key].hidden = key !== selectedCat;
          }
        });

        // Filter products list
        let count = 0;
        productItems.forEach((item) => {
          const itemCat = item.getAttribute("data-category");
          const show = selectedCat === "all" || itemCat === selectedCat;
          item.hidden = !show;
          if (show) count++;
        });

        if (storeStatus) {
          storeStatus.textContent = selectedCat === "all" 
            ? `Showing all ${count} ready digital products & templates` 
            : `Showing ${count} products in ${tab.innerText.replace(/[0-9]/g, '').trim()}`;
        }
        if (catJumpCount) {
          catJumpCount.textContent = `Showing ${count} products`;
        }
      });
    });

    // Product Included Files Accordion Toggles
    productItems.forEach((item) => {
      const toggle = item.querySelector(".sku-toggle");
      const specs = item.querySelector(".sku-specs");
      if (!toggle || !specs) return;

      toggle.addEventListener("click", () => {
        const open = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!open));
        specs.hidden = open;
        item.classList.toggle("is-open", !open);
      });
    });

    // Hash jump handler
    if (window.location.hash) {
      const targetSlug = window.location.hash.replace("#", "");
      const targetEl = document.getElementById(targetSlug);
      if (targetEl) {
        setTimeout(() => {
          targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
          const toggle = targetEl.querySelector(".sku-toggle");
          if (toggle && toggle.getAttribute("aria-expanded") === "false") {
            toggle.click();
          }
        }, 300);
      }
    }
  }

  /* ==========================================================================
     8. FORM SUBMISSION FEEDBACK TOAST
     ========================================================================== */
  const toast = document.getElementById("toast");
  const contactForm = document.getElementById("contact-form");
  if (contactForm && toast) {
    contactForm.addEventListener("submit", () => {
      setTimeout(() => {
        toast.classList.add("is-active");
        setTimeout(() => toast.classList.remove("is-active"), 5000);
      }, 400);
    });
  }
});
