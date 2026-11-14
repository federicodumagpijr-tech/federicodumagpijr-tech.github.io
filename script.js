(function () {
  'use strict';

  // Immediately flag JS availability so reveal transitions only gate progressive enhancements.
  document.documentElement.classList.add('has-js');

  var reducedMotionQuery = typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;

  function prefersReducedMotion() {
    return Boolean(reducedMotionQuery && reducedMotionQuery.matches);
  }

  function normalizePath(path) {
    var clean = (path || '/').replace(/\/+$/, '') || '/';
    if (clean === '/index.html') return '/';
    if (clean === '/store.html') return '/store';
    return clean;
  }

  function parseHref(href) {
    if (!href) return { pathname: '', hash: '', search: '' };
    var hashIdx = href.indexOf('#');
    var beforeHash = hashIdx >= 0 ? href.slice(0, hashIdx) : href;
    var hashPart = hashIdx >= 0 ? href.slice(hashIdx) : '';
    var queryIdx = beforeHash.indexOf('?');
    var pathPart = queryIdx >= 0 ? beforeHash.slice(0, queryIdx) : beforeHash;
    var searchPart = queryIdx >= 0 ? beforeHash.slice(queryIdx + 1) : '';
    return {
      pathname: normalizePath(pathPart || window.location.pathname),
      hash: hashPart,
      search: searchPart
    };
  }

  function getCombinedQueryParams() {
    var params = new URLSearchParams(window.location.search || '');
    var hash = window.location.hash || '';
    var queryIdx = hash.indexOf('?');
    if (queryIdx !== -1) {
      var hashParams = new URLSearchParams(hash.slice(queryIdx + 1));
      hashParams.forEach(function (val, key) {
        if (!params.has(key)) {
          params.set(key, val);
        }
      });
    }
    return params;
  }

  function cloneChildNodes(el) {
    return Array.prototype.slice.call(el.childNodes).map(function (node) {
      return node.cloneNode(true);
    });
  }

  function restoreChildNodes(el, savedNodes) {
    el.textContent = '';
    savedNodes.forEach(function (node) {
      el.appendChild(node.cloneNode(true));
    });
  }

  /* ==========================================================================
     1. SCROLL PROGRESS & NAVIGATION ACTIVE STATE
     ========================================================================== */
  function initScrollAndNav() {
    var progressBar = document.getElementById('scroll-progress');
    var header = document.querySelector('.site-header');
    var navLinks = Array.prototype.slice.call(
      document.querySelectorAll('.site-nav a, .drawer-nav a')
    );
    var currentPath = normalizePath(window.location.pathname);
    var sectionIds = ['workflow', 'solutions', 'track-record'];
    var sections = [];
    var intersectingMap = {};
    var activeSectionId = '';
    var rafPending = false;

    sectionIds.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        sections.push({ id: id, el: el });
      }
    });

    function applyNavActiveState() {
      navLinks.forEach(function (link) {
        var parsed = parseHref(link.getAttribute('href'));
        var isMatch = false;

        if (currentPath === '/store') {
          isMatch = parsed.pathname === '/store';
          if (isMatch) {
            link.setAttribute('aria-current', 'page');
          } else {
            link.removeAttribute('aria-current');
          }
        } else if (currentPath === '/') {
          link.removeAttribute('aria-current');
          if (parsed.pathname === '/' && parsed.hash && activeSectionId) {
            isMatch = parsed.hash === '#' + activeSectionId;
          }
        } else {
          link.removeAttribute('aria-current');
        }

        link.classList.toggle('is-active', isMatch);
      });
    }

    function pickActiveSectionFromRects() {
      var viewportH = window.innerHeight || document.documentElement.clientHeight || 800;
      var bestId = '';
      var bestVisible = 0;

      sections.forEach(function (item) {
        var rect = item.el.getBoundingClientRect();
        var top = Math.max(rect.top, 72);
        var bottom = Math.min(rect.bottom, viewportH * 0.85);
        var visible = Math.max(0, bottom - top);
        if (visible > bestVisible) {
          bestVisible = visible;
          bestId = item.id;
        }
      });

      return bestId;
    }

    function updateScrollMetrics() {
      rafPending = false;
      var scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      var maxScroll = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      var scale = maxScroll > 0 ? Math.min(1, Math.max(0, scrollTop / maxScroll)) : 0;

      if (progressBar) {
        var scaleVal = scale === 0 ? '0' : scale === 1 ? '1' : scale.toFixed(4);
        progressBar.style.setProperty('--scroll-scale', scaleVal);
      }

      if (header) {
        header.classList.toggle('is-scrolled', scrollTop > 8);
      }

      if (currentPath === '/' && sections.length && typeof IntersectionObserver === 'undefined') {
        var nextId = pickActiveSectionFromRects();
        if (nextId !== activeSectionId) {
          activeSectionId = nextId;
          applyNavActiveState();
        }
      }
    }

    function scheduleScrollUpdate() {
      if (!rafPending) {
        rafPending = true;
        window.requestAnimationFrame(updateScrollMetrics);
      }
    }

    window.addEventListener('scroll', scheduleScrollUpdate, { passive: true });
    window.addEventListener('resize', scheduleScrollUpdate, { passive: true });

    if (currentPath === '/' && sections.length && typeof IntersectionObserver !== 'undefined') {
      var navObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            intersectingMap[entry.target.id] = entry.isIntersecting
              ? entry.intersectionRatio || 0.01
              : 0;
          });

          var bestId = '';
          var bestRatio = 0;
          sectionIds.forEach(function (id) {
            var ratio = intersectingMap[id] || 0;
            if (ratio > bestRatio) {
              bestRatio = ratio;
              bestId = id;
            }
          });

          if (!bestId) {
            bestId = pickActiveSectionFromRects();
          }

          if (bestId !== activeSectionId) {
            activeSectionId = bestId;
            applyNavActiveState();
          }
        },
        {
          rootMargin: '-72px 0px -25% 0px',
          threshold: [0, 0.1, 0.25, 0.5]
        }
      );

      sections.forEach(function (item) {
        navObserver.observe(item.el);
      });
    }

    if (currentPath === '/' && sections.length) {
      activeSectionId = pickActiveSectionFromRects();
    }

    applyNavActiveState();
    updateScrollMetrics();
  }

  /* ==========================================================================
     2. ACCESSIBLE MOBILE DRAWER
     ========================================================================== */
  function initMobileDrawer() {
    var menuBtn = document.getElementById('mobile-menu-btn');
    var drawer = document.getElementById('mobile-menu');
    if (!menuBtn || !drawer) return;

    var backdrop = document.getElementById('drawer-backdrop');
    var closeBtn = document.getElementById('drawer-close');
    var dismissLinks = drawer.querySelectorAll('.drawer-nav a, .drawer-foot a, .drawer-head a');
    var focusableSelector =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    function getFocusableElements() {
      return Array.prototype.slice
        .call(drawer.querySelectorAll(focusableSelector))
        .filter(function (el) {
          return !el.hasAttribute('hidden') && el.getClientRects().length > 0;
        });
    }

    function openDrawer() {
      if (!drawer.hidden) return;
      drawer.hidden = false;
      menuBtn.setAttribute('aria-expanded', 'true');
      document.body.classList.add('is-drawer-open');
      if (closeBtn) {
        closeBtn.focus();
      } else {
        var focusables = getFocusableElements();
        if (focusables.length) focusables[0].focus();
      }
    }

    function closeDrawer(restoreFocus) {
      if (drawer.hidden) return;
      drawer.hidden = true;
      menuBtn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('is-drawer-open');
      if (restoreFocus) {
        menuBtn.focus();
      }
    }

    menuBtn.addEventListener('click', function () {
      if (drawer.hidden) {
        openDrawer();
      } else {
        closeDrawer(true);
      }
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        closeDrawer(true);
      });
    }

    if (backdrop) {
      backdrop.addEventListener('click', function () {
        closeDrawer(true);
      });
    }

    Array.prototype.forEach.call(dismissLinks, function (link) {
      link.addEventListener('click', function () {
        closeDrawer(false);
      });
    });

    document.addEventListener('keydown', function (e) {
      if (drawer.hidden) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        closeDrawer(true);
        return;
      }

      if (e.key === 'Tab') {
        var focusables = getFocusableElements();
        if (!focusables.length) {
          e.preventDefault();
          return;
        }
        var first = focusables[0];
        var last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first || !drawer.contains(document.activeElement)) {
            e.preventDefault();
            last.focus();
          }
        } else if (document.activeElement === last || !drawer.contains(document.activeElement)) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    if (typeof window.matchMedia === 'function') {
      var desktopMq = window.matchMedia('(min-width: 1024px)');
      var handleDesktopChange = function (e) {
        if (e.matches) {
          closeDrawer(false);
        }
      };
      if (desktopMq.addEventListener) {
        desktopMq.addEventListener('change', handleDesktopChange);
      } else if (desktopMq.addListener) {
        desktopMq.addListener(handleDesktopChange);
      }
    }
  }

  /* ==========================================================================
     3. POWER QUERY WORKFLOW SIMULATOR
     ========================================================================== */
  function initSimulator() {
    var slider = document.getElementById('sim-rows');
    var rowsOutput = document.getElementById('sim-rows-val');
    var manualOutput = document.getElementById('sim-manual-val');
    var autoOutput = document.getElementById('sim-auto-val');
    var runBtn = document.getElementById('sim-run');
    var statusEl = document.getElementById('sim-status');
    var presetBtns = Array.prototype.slice.call(document.querySelectorAll('[data-sim-preset]'));
    var stepEls = Array.prototype.slice.call(document.querySelectorAll('[data-sim-step]'));

    if (!slider || !rowsOutput || !manualOutput || !autoOutput) return;

    var minRows = Number(slider.min) || 10;
    var maxRows = Number(slider.max) || 5000;
    var runBtnOriginalNodes = runBtn ? cloneChildNodes(runBtn) : [];
    var stepTimers = [];

    function clampRows(val) {
      var n = Math.round(Number(val));
      if (!isFinite(n)) return 250;
      return Math.min(maxRows, Math.max(minRows, n));
    }

    function formatManualTime(rows) {
      var mins = Math.round(rows * 0.14 + 25);
      if (mins < 60) {
        return mins + ' min';
      }
      var hours = Math.floor(mins / 60);
      var rem = mins % 60;
      return hours + 'h ' + (rem < 10 ? '0' + rem : rem) + 'm';
    }

    function formatAutoTime(rows) {
      var secs = Math.max(5, Math.round(rows * 0.045 + 5));
      if (secs < 60) {
        return secs + ' sec';
      }
      var mins = Math.floor(secs / 60);
      var rem = secs % 60;
      return mins + 'm ' + (rem < 10 ? '0' + rem : rem) + 's';
    }

    function clearRunTimers() {
      stepTimers.forEach(function (id) {
        clearTimeout(id);
      });
      stepTimers = [];
    }

    function resetSteps() {
      stepEls.forEach(function (step) {
        step.classList.remove('is-active', 'is-done');
      });
    }

    function restoreRunButton() {
      if (!runBtn) return;
      runBtn.disabled = false;
      restoreChildNodes(runBtn, runBtnOriginalNodes);
    }

    function renderEstimate(rowsValue) {
      var rows = clampRows(rowsValue);
      var fillPct = ((rows - minRows) / (maxRows - minRows)) * 100;

      slider.value = String(rows);
      slider.style.setProperty('--fill', fillPct.toFixed(2) + '%');
      rowsOutput.textContent = rows.toLocaleString('en-US') + ' records';
      manualOutput.textContent = formatManualTime(rows);
      autoOutput.textContent = formatAutoTime(rows);

      presetBtns.forEach(function (btn) {
        var presetVal = Number(btn.getAttribute('data-sim-preset'));
        btn.setAttribute('aria-pressed', presetVal === rows ? 'true' : 'false');
      });

      return rows;
    }

    function handleVolumeChange(rowsValue) {
      clearRunTimers();
      resetSteps();
      restoreRunButton();
      renderEstimate(rowsValue);
      if (statusEl) {
        statusEl.textContent = 'Ready — adjust record volume or run a sample ETL pass.';
      }
    }

    function runSamplePass() {
      clearRunTimers();
      resetSteps();

      var rows = renderEstimate(slider.value);
      var formattedRows = rows.toLocaleString('en-US');
      var manualStr = formatManualTime(rows);
      var autoStr = formatAutoTime(rows);
      var doneMessage =
        'Sample ETL pass complete for ' +
        formattedRows +
        ' records: ' +
        autoStr +
        ' automated vs. ' +
        manualStr +
        ' manual.';

      if (prefersReducedMotion() || !stepEls.length) {
        stepEls.forEach(function (step) {
          step.classList.add('is-done');
        });
        restoreRunButton();
        if (statusEl) {
          statusEl.textContent = doneMessage;
        }
        return;
      }

      if (runBtn) {
        runBtn.disabled = true;
        runBtn.textContent = 'Running...';
      }
      if (statusEl) {
        statusEl.textContent = 'Running sample ETL pass for ' + formattedRows + ' records...';
      }

      var orderedSteps = stepEls.slice().sort(function (a, b) {
        return Number(a.getAttribute('data-sim-step')) - Number(b.getAttribute('data-sim-step'));
      });

      orderedSteps[0].classList.add('is-active');

      orderedSteps.forEach(function (step, index) {
        var timerId = setTimeout(function () {
          step.classList.remove('is-active');
          step.classList.add('is-done');

          if (index + 1 < orderedSteps.length) {
            orderedSteps[index + 1].classList.add('is-active');
          } else {
            restoreRunButton();
            if (statusEl) {
              statusEl.textContent = doneMessage;
            }
          }
        }, 220 * (index + 1));

        stepTimers.push(timerId);
      });
    }

    slider.addEventListener('input', function () {
      handleVolumeChange(slider.value);
    });

    slider.addEventListener('change', function () {
      handleVolumeChange(slider.value);
    });

    presetBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        handleVolumeChange(btn.getAttribute('data-sim-preset'));
      });
    });

    if (runBtn) {
      runBtn.addEventListener('click', runSamplePass);
    }

    // Initialize values synchronously without auto-running the step animation.
    renderEstimate(slider.value);
  }

  /* ==========================================================================
     4. PARAMETERIZED TABS CONTROLLER
     ========================================================================== */
  function initTabs(tablist) {
    var tabs = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));
    if (!tabs.length) return;

    var panels = tabs.map(function (tab) {
      var panelId = tab.getAttribute('aria-controls');
      return panelId ? document.getElementById(panelId) : null;
    });

    function selectTab(index, moveFocus) {
      tabs.forEach(function (tab, i) {
        var active = i === index;
        tab.setAttribute('aria-selected', active ? 'true' : 'false');
        tab.setAttribute('tabindex', active ? '0' : '-1');
        if (panels[i]) {
          panels[i].hidden = !active;
        }
      });

      if (tablist.classList.contains('timeline') || (tablist.closest && tablist.closest('.timeline'))) {
        var ratio = tabs.length > 1 ? index / (tabs.length - 1) : 0;
        tablist.style.setProperty('--progress-ratio', String(ratio));
      }

      if (moveFocus && tabs[index]) {
        tabs[index].focus();
      }
    }

    var initialIndex = 0;
    tabs.forEach(function (tab, i) {
      if (tab.getAttribute('aria-selected') === 'true') {
        initialIndex = i;
      }

      tab.addEventListener('click', function () {
        selectTab(i, false);
      });

      tab.addEventListener('keydown', function (e) {
        var last = tabs.length - 1;
        var next = null;

        if (e.key === 'ArrowRight') {
          next = i === last ? 0 : i + 1;
        } else if (e.key === 'ArrowLeft') {
          next = i === 0 ? last : i - 1;
        } else if (e.key === 'Home') {
          next = 0;
        } else if (e.key === 'End') {
          next = last;
        }

        if (next !== null) {
          e.preventDefault();
          selectTab(next, true);
        }
      });
    });

    selectTab(initialIndex, false);
  }

  /* ==========================================================================
     5. CONTACT PRE-FILL & FORMSUBMIT AJAX WITH MAILTO FALLBACK
     ========================================================================== */
  function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    var contactSection = document.getElementById('contact');
    var nameEl = document.getElementById('contact-name');
    var emailEl = document.getElementById('contact-email');
    var topicEl = document.getElementById('topic');
    var messageEl = document.getElementById('message');
    var submitBtn = document.getElementById('contact-submit');
    var statusEl = document.getElementById('form-status');
    var honeyEl = form.querySelector('input[name="_honey"]');
    var subjectEl = form.querySelector('input[name="_subject"]');
    var prefillLinks = Array.prototype.slice.call(document.querySelectorAll('[data-prefill-topic]'));

    var submitBtnOriginalNodes = submitBtn ? cloneChildNodes(submitBtn) : [];
    var isSubmitting = false;
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function setFieldValidity(el, valid) {
      if (!el) return;
      el.setAttribute('aria-invalid', valid ? 'false' : 'true');
    }

    function clearFormStatus() {
      if (!statusEl) return;
      statusEl.textContent = '';
      statusEl.className = 'form-status';
    }

    function setSuccessStatus(text) {
      if (!statusEl) return;
      statusEl.textContent = text;
      statusEl.className = 'form-status is-success';
    }

    function setErrorStatusText(text) {
      if (!statusEl) return;
      statusEl.textContent = text;
      statusEl.className = 'form-status is-error';
    }

    function getTopicLabel(topicValue) {
      if (!topicEl) return topicValue || '';
      for (var i = 0; i < topicEl.options.length; i += 1) {
        if (topicEl.options[i].value === topicValue && topicValue !== '') {
          return topicEl.options[i].textContent.trim();
        }
      }
      return '';
    }

    function applyPrefill(topicValue, itemCode) {
      var matchedTopic = '';
      if (topicEl && topicValue) {
        for (var i = 0; i < topicEl.options.length; i += 1) {
          if (topicEl.options[i].value === topicValue) {
            topicEl.value = topicValue;
            setFieldValidity(topicEl, true);
            matchedTopic = topicValue;
            break;
          }
        }
      }

      if (messageEl && messageEl.value.trim() === '' && itemCode) {
        var topicLabel = getTopicLabel(matchedTopic || (topicEl ? topicEl.value : ''));
        if (itemCode === 'XL-05') {
          messageEl.value =
            'Inquiry for XL-05 (Multi-Branch Payroll Attendance Verification Template + Guided Setup):\n' +
            '- Windows Excel version: \n' +
            '- Branch / employee count: \n' +
            '- Biometric export format & shift rules: ';
        } else if (matchedTopic === 'power-query') {
          messageEl.value =
            'Inquiry for ' +
            itemCode +
            ' (Google Sheets / Mac adaptation or custom build):\n' +
            '- Current OS & spreadsheet app: \n' +
            '- Workflow requirements: ';
        } else {
          messageEl.value =
            'Inquiry regarding ' +
            itemCode +
            (topicLabel ? ' (' + topicLabel + ')' : '') +
            ': ';
        }
      }
    }

    function applyUrlPrefill() {
      var params = getCombinedQueryParams();
      var topicParam = (params.get('topic') || '').trim();
      var itemParam = (params.get('item') || '').trim();
      var submittedParam = (params.get('submitted') || '').trim();

      if (topicParam || itemParam) {
        applyPrefill(topicParam, itemParam);
      }

      if (submittedParam === '1') {
        setSuccessStatus(
          'Thank you — your inquiry was submitted. Federico Dumagpi Jr. will reply by email within 24 hours (Dubai UTC+4).'
        );
      }
    }

    function buildMailtoHref(nameVal, emailVal, topicLabel, messageVal) {
      var subjectText = 'Consulting Inquiry: ' + (topicLabel || 'Project Request');
      var rawBody = [
        'Name: ' + nameVal,
        'Email: ' + emailVal,
        'Topic: ' + topicLabel,
        '',
        'Project Details:',
        messageVal
      ].join('\n');

      var prefix =
        'mailto:federico.dumagpi.jr@gmail.com?subject=' +
        encodeURIComponent(subjectText) +
        '&body=';
      var maxBodyEncoded = Math.max(200, 1800 - prefix.length);
      var encodedBody = encodeURIComponent(rawBody);

      if (encodedBody.length > maxBodyEncoded) {
        var truncated = rawBody.slice(0, 900).replace(/[\uD800-\uDBFF]$/, '');
        var suffix = '\n[Message truncated due to URL length limit]';
        while (
          truncated.length > 0 &&
          encodeURIComponent(truncated + suffix).length > maxBodyEncoded
        ) {
          truncated = truncated
            .slice(0, Math.floor(truncated.length * 0.85))
            .replace(/[\uD800-\uDBFF]$/, '');
        }
        encodedBody = encodeURIComponent(truncated + suffix);
      }

      return prefix + encodedBody;
    }

    function renderMailtoFallback(isTimeout, nameVal, emailVal, topicLabel, messageVal) {
      if (!statusEl) return;
      statusEl.textContent = '';
      statusEl.className = 'form-status is-error';

      var lead = isTimeout
        ? 'The submission timed out after 9 seconds, so your message is preserved above. Please '
        : 'Automatic submission could not be completed, so your message is preserved above. Please ';

      statusEl.appendChild(document.createTextNode(lead));

      var link = document.createElement('a');
      link.href = buildMailtoHref(nameVal, emailVal, topicLabel, messageVal);
      link.textContent = 'send your inquiry via your email app';
      statusEl.appendChild(link);

      statusEl.appendChild(
        document.createTextNode(' or email federico.dumagpi.jr@gmail.com directly.')
      );
    }

    function validateField(el) {
      if (!el) return true;
      var val = el.value.trim();
      if (el === emailEl) return emailPattern.test(val);
      return val.length > 0;
    }

    [nameEl, emailEl, topicEl, messageEl].forEach(function (fieldEl) {
      if (!fieldEl) return;
      var eventName = fieldEl.tagName === 'SELECT' ? 'change' : 'input';
      fieldEl.addEventListener(eventName, function () {
        if (fieldEl.getAttribute('aria-invalid') === 'true' && validateField(fieldEl)) {
          setFieldValidity(fieldEl, true);
        }
      });
    });

    prefillLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
          return;
        }
        e.preventDefault();
        var topicVal = (link.getAttribute('data-prefill-topic') || '').trim();
        var itemVal = (link.getAttribute('data-prefill-item') || '').trim();
        if (!itemVal) {
          var parsed = parseHref(link.getAttribute('href'));
          if (parsed.search) {
            itemVal = (new URLSearchParams(parsed.search).get('item') || '').trim();
          }
        }

        applyPrefill(topicVal, itemVal);

        if (contactSection) {
          contactSection.scrollIntoView({
            behavior: prefersReducedMotion() ? 'auto' : 'smooth',
            block: 'start'
          });
        }

        if (messageEl) {
          try {
            messageEl.focus({ preventScroll: true });
          } catch (err) {
            messageEl.focus();
          }
        }
      });
    });

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      // Silently ignore bot submissions via honeypot field.
      if (honeyEl && honeyEl.value.trim() !== '') {
        return;
      }

      if (isSubmitting) return;

      var nameValid = validateField(nameEl);
      var emailValid = validateField(emailEl);
      var topicValid = validateField(topicEl);
      var messageValid = validateField(messageEl);

      setFieldValidity(nameEl, nameValid);
      setFieldValidity(emailEl, emailValid);
      setFieldValidity(topicEl, topicValid);
      setFieldValidity(messageEl, messageValid);

      var missing = [];
      var firstInvalid = null;

      if (!nameValid) {
        missing.push('your name');
        firstInvalid = firstInvalid || nameEl;
      }
      if (!emailValid) {
        missing.push('a valid email address');
        firstInvalid = firstInvalid || emailEl;
      }
      if (!topicValid) {
        missing.push('a topic of interest');
        firstInvalid = firstInvalid || topicEl;
      }
      if (!messageValid) {
        missing.push('your project details');
        firstInvalid = firstInvalid || messageEl;
      }

      if (firstInvalid) {
        setErrorStatusText('Please provide ' + missing.join(', ') + '.');
        firstInvalid.focus();
        return;
      }

      var nameVal = nameEl.value.trim();
      var emailVal = emailEl.value.trim();
      var topicVal = topicEl.value.trim();
      var topicLabel = getTopicLabel(topicVal) || topicVal;
      var messageVal = messageEl.value.trim();

      isSubmitting = true;
      clearFormStatus();

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }

      var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      var timedOut = false;
      var timeoutId = controller
        ? setTimeout(function () {
            timedOut = true;
            controller.abort();
          }, 9000)
        : null;

      try {
        var response = await fetch('https://formsubmit.co/ajax/federico.dumagpi.jr@gmail.com', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: nameVal,
            email: emailVal,
            topic: topicLabel,
            message: messageVal,
            _subject:
              subjectEl && subjectEl.value
                ? subjectEl.value
                : 'Consulting Inquiry — federico-d.web.app',
            _captcha: 'false',
            _honey: ''
          }),
          signal: controller ? controller.signal : undefined
        });

        var data = null;
        try {
          data = await response.json();
        } catch (jsonErr) {
          data = null;
        }

        if (
          !response.ok ||
          !data ||
          data.success === false ||
          data.success === 'false'
        ) {
          throw new Error('Submission failed');
        }

        form.reset();
        [nameEl, emailEl, topicEl, messageEl].forEach(function (fieldEl) {
          if (fieldEl) fieldEl.removeAttribute('aria-invalid');
        });
        setSuccessStatus(
          'Inquiry received — thank you, ' +
            nameVal +
            '. Federico Dumagpi Jr. will reply to ' +
            emailVal +
            ' within 24 hours (Dubai UTC+4).'
        );
      } catch (err) {
        var isAbort = timedOut || (err && err.name === 'AbortError');
        renderMailtoFallback(isAbort, nameVal, emailVal, topicLabel, messageVal);
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        isSubmitting = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          restoreChildNodes(submitBtn, submitBtnOriginalNodes);
        }
      }
    });

    applyUrlPrefill();
    window.addEventListener('hashchange', applyUrlPrefill);
  }

  /* ==========================================================================
     6. STORE CATALOG FILTERS, DYNAMIC COUNTS & HASH DRAWER EXPANDER
     ========================================================================== */
  function initStoreCatalog() {
    var filterBtns = Array.prototype.slice.call(document.querySelectorAll('.filter-btn[data-filter]'));
    var categoryGroups = Array.prototype.slice.call(
      document.querySelectorAll('.store-category-group[data-category]')
    );
    var skuCards = Array.prototype.slice.call(document.querySelectorAll('[data-sku-card]'));
    var specToggles = Array.prototype.slice.call(document.querySelectorAll('[data-spec-toggle]'));
    var totalCountEl = document.getElementById('store-total-count');

    if (!skuCards.length && !filterBtns.length && !specToggles.length) return;

    var countsByCat = {};
    skuCards.forEach(function (card) {
      var cat = card.getAttribute('data-category');
      if (cat) {
        countsByCat[cat] = (countsByCat[cat] || 0) + 1;
      }
    });

    var totalCount = skuCards.length;
    var validCategories = { all: true };
    categoryGroups.forEach(function (group) {
      var cat = group.getAttribute('data-category');
      if (cat) validCategories[cat] = true;
    });

    filterBtns.forEach(function (btn) {
      var filter = btn.getAttribute('data-filter');
      var countEl = btn.querySelector('.filter-count');
      if (countEl) {
        countEl.textContent = String(
          filter === 'all' ? totalCount : countsByCat[filter] || 0
        );
      }
    });

    function getCategoryLabel(category) {
      for (var i = 0; i < categoryGroups.length; i += 1) {
        if (categoryGroups[i].getAttribute('data-category') === category) {
          var heading = categoryGroups[i].querySelector('h2');
          if (heading) return heading.textContent.trim();
        }
      }
      return category;
    }

    function applyCategoryFilter(rawCategory) {
      var activeCat = validCategories[rawCategory] ? rawCategory : 'all';

      filterBtns.forEach(function (btn) {
        var matches = btn.getAttribute('data-filter') === activeCat;
        btn.setAttribute('aria-pressed', matches ? 'true' : 'false');
      });

      categoryGroups.forEach(function (group) {
        var groupCat = group.getAttribute('data-category');
        group.hidden = activeCat !== 'all' && groupCat !== activeCat;
      });

      var visibleCount = activeCat === 'all' ? totalCount : countsByCat[activeCat] || 0;
      if (totalCountEl) {
        var unit = visibleCount === 1 ? 'toolkit' : 'toolkits';
        totalCountEl.textContent =
          activeCat === 'all'
            ? 'Showing ' + visibleCount + ' ' + unit
            : 'Showing ' + visibleCount + ' ' + unit + ' in ' + getCategoryLabel(activeCat);
      }
    }

    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        applyCategoryFilter(btn.getAttribute('data-filter'));
      });
    });

    function setSpecExpanded(btn, expanded) {
      var targetId = btn.getAttribute('aria-controls');
      var panel = targetId ? document.getElementById(targetId) : null;
      btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      if (panel) {
        panel.hidden = !expanded;
      }
    }

    specToggles.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var currentlyExpanded = btn.getAttribute('aria-expanded') === 'true';
        setSpecExpanded(btn, !currentlyExpanded);
      });
    });

    function openCardFromHash() {
      var rawHash = window.location.hash ? window.location.hash.slice(1) : '';
      var qIdx = rawHash.indexOf('?');
      if (qIdx !== -1) {
        rawHash = rawHash.slice(0, qIdx);
      }
      if (!rawHash) return;

      var slug = rawHash;
      try {
        slug = decodeURIComponent(rawHash);
      } catch (err) {
        slug = rawHash;
      }

      var target = document.getElementById(slug);
      if (!target) return;

      var card = target.hasAttribute('data-sku-card')
        ? target
        : target.closest('[data-sku-card]');
      if (!card) return;

      var parentGroup = card.closest('.store-category-group');
      if (parentGroup && parentGroup.hidden) {
        applyCategoryFilter('all');
      }

      var specsPanel = document.getElementById('specs-' + card.id);
      var toggleBtn = card.querySelector('[data-spec-toggle]');
      if (toggleBtn) {
        setSpecExpanded(toggleBtn, true);
      } else if (specsPanel) {
        specsPanel.hidden = false;
      }

      window.requestAnimationFrame(function () {
        card.scrollIntoView({
          behavior: prefersReducedMotion() ? 'auto' : 'smooth',
          block: 'center'
        });
      });
    }

    var params = getCombinedQueryParams();
    var initialCategory = (params.get('category') || '').trim();
    applyCategoryFilter(initialCategory || 'all');

    openCardFromHash();
    window.addEventListener('hashchange', openCardFromHash);
  }

  /* ==========================================================================
     7. REDUCED-MOTION-SAFE SECTION REVEAL
     ========================================================================== */
  function initScrollReveal() {
    var revealEls = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
    if (!revealEls.length) return;

    function revealAll() {
      revealEls.forEach(function (el) {
        el.classList.add('is-visible');
      });
    }

    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      revealAll();
      return;
    }

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    revealEls.forEach(function (el) {
      observer.observe(el);
    });

    var fallbackTimer = setTimeout(function () {
      revealAll();
      observer.disconnect();
    }, 1500);

    if (reducedMotionQuery) {
      var onMotionChange = function (e) {
        if (e.matches) {
          clearTimeout(fallbackTimer);
          revealAll();
          observer.disconnect();
        }
      };
      if (reducedMotionQuery.addEventListener) {
        reducedMotionQuery.addEventListener('change', onMotionChange);
      } else if (reducedMotionQuery.addListener) {
        reducedMotionQuery.addListener(onMotionChange);
      }
    }
  }

  /* ==========================================================================
     INITIALIZE ALL MODULES
     ========================================================================== */
  function init() {
    initScrollAndNav();
    initMobileDrawer();
    initSimulator();

    Array.prototype.forEach.call(document.querySelectorAll('[role="tablist"]'), function (tablist) {
      initTabs(tablist);
    });

    initContactForm();
    initStoreCatalog();
    initScrollReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
