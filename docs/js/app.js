(function () {

  // ── STARFIELD ──────────────────────────────────────────────────────────────
  var c = document.getElementById('stars-canvas');
  var ctx = c.getContext('2d');
  var W, H, stars = [];

  function resizeStars() {
    W = c.width  = window.innerWidth;
    H = c.height = Math.max(document.body.scrollHeight, window.innerHeight);
  }
  function initStars() {
    resizeStars();
    stars = [];
    for (var i = 0; i < 180; i++) {
      stars.push({
        x:  Math.random() * W,
        y:  Math.random() * H,
        r:  Math.random() * 1.4 + 0.3,
        a:  Math.random(),
        da: (Math.random() - 0.5) * 0.005
      });
    }
  }
  function drawStars() {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      s.a = Math.max(0.08, Math.min(1, s.a + s.da));
      if (s.a <= 0.08 || s.a >= 1) s.da *= -1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(180,200,255,' + s.a + ')';
      ctx.fill();
    }
    requestAnimationFrame(drawStars);
  }
  window.addEventListener('resize', initStars);
  initStars();
  drawStars();

  // ── HERO SCROLL CTA ────────────────────────────────────────────────────────
  var heroCtaBtn = document.getElementById('hero-cta-btn');
  if (heroCtaBtn) {
    heroCtaBtn.addEventListener('click', function () {
      var section = document.getElementById('tracks-section');
      if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // ── NEW-TO-BOB MODAL ───────────────────────────────────────────────────────
  var ntbOverlay = document.getElementById('ntb-overlay');

  function openNtb(startTab) {
    if (!ntbOverlay) return;
    ntbOverlay.classList.add('active');
    if (startTab) ntbSwitchTab(startTab);
    var closeBtn = document.getElementById('ntb-close');
    if (closeBtn) closeBtn.focus();
  }
  function closeNtb() {
    if (ntbOverlay) ntbOverlay.classList.remove('active');
  }
  function ntbSwitchTab(num) {
    var panels = ntbOverlay.querySelectorAll('.ntb-panel');
    var tabs   = ntbOverlay.querySelectorAll('.ntb-tab');
    panels.forEach(function (p) { p.classList.remove('ntb-panel-active'); });
    tabs.forEach(function (t) {
      t.classList.remove('ntb-tab-active');
      t.setAttribute('aria-selected', 'false');
    });
    var activePanel = document.getElementById('ntb-panel-' + num);
    var activeTab   = document.getElementById('ntb-tab-' + num);
    if (activePanel) activePanel.classList.add('ntb-panel-active');
    if (activeTab)   { activeTab.classList.add('ntb-tab-active'); activeTab.setAttribute('aria-selected', 'true'); }
    tabs.forEach(function (t) {
      var n = parseInt(t.getAttribute('data-ntb-tab'), 10);
      if (n < num) t.classList.add('ntb-tab-done');
      else t.classList.remove('ntb-tab-done');
    });
  }

  var ntbBtn = document.getElementById('new-to-bob-btn');
  if (ntbBtn) ntbBtn.addEventListener('click', function () { openNtb(1); });
  if (ntbOverlay) {
    ntbOverlay.addEventListener('click', function (e) {
      var tab = e.target.closest('[data-ntb-tab]');
      if (tab) { ntbSwitchTab(parseInt(tab.getAttribute('data-ntb-tab'), 10)); return; }
      if (e.target.closest('#ntb-next-btn')) { ntbSwitchTab(2); return; }
      if (e.target === ntbOverlay) closeNtb();
    });
    var ntbCloseBtn = document.getElementById('ntb-close');
    if (ntbCloseBtn) ntbCloseBtn.addEventListener('click', closeNtb);
  }

  // ── TRACK PARTIALS LOADER ─────────────────────────────────────────────────
  // Loads track partial HTML files into #tracks-stream.
  //
  // Resolution order for each track slug:
  //   1. Local override: <event-folder>/tracks/<slug>.html
  //      (absolute path derived from window.location so it is not affected
  //       by the <base href="../"> in index.html)
  //   2. Shared fallback: tracks/<slug>.html
  //      (relative — resolves to docs/tracks/ via <base href="../">)
  //   3. Skip with a console warning if both fail.
  //
  // Track list: use config.tracks if provided (exact replacement of the
  // default list — no merging). Otherwise load all 8 default tracks.
  //
  // window.FLIGHT400_TRACK_PREFIX is retained for backwards compatibility
  // but is superseded by the local-override mechanism above.

  var DEFAULT_TRACK_SLUGS = ['setup', 'track-1', 'track-2', 'track-3', 'track-4', 'track-5', 'track-6', 'track-7'];
  var cfgTracks = (window.FLIGHT400_CONFIG || {}).tracks;
  var TRACK_SLUGS = (cfgTracks && cfgTracks.length) ? cfgTracks : DEFAULT_TRACK_SLUGS;

  // Build the absolute base URL for the current event folder so local overrides
  // are not affected by <base href="../">.
  // e.g. https://org.github.io/repo/contoso/ → localBase = '/repo/contoso/'
  var localBase = window.location.pathname.replace(/\/?$/, '/');

  var stream = document.getElementById('tracks-stream');

  function loadTrackSlug(index) {
    if (index >= TRACK_SLUGS.length) {
      initCards();
      return;
    }
    var slug      = TRACK_SLUGS[index];
    var file      = slug + '.html';
    var localUrl  = localBase + 'tracks/' + file;
    var sharedUrl = 'tracks/' + file;   // resolves via <base href="../"> to docs/tracks/

    fetch(localUrl)
      .then(function (r) {
        if (!r.ok) throw new Error('no local override');
        return r.text();
      })
      .catch(function () {
        // No local override — fall back to shared docs/tracks/
        return fetch(sharedUrl).then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status + ' loading shared ' + sharedUrl);
          return r.text();
        });
      })
      .then(function (html) {
        var wrapper = document.createElement('div');
        wrapper.innerHTML = html;
        while (wrapper.firstChild) stream.appendChild(wrapper.firstChild);
        loadTrackSlug(index + 1);
      })
      .catch(function (err) {
        console.warn('[FLIGHT400] Could not load track:', slug, err);
        loadTrackSlug(index + 1);
      });
  }

  if (stream) {
    loadTrackSlug(0);
  }

  // ── CARD INIT (called after all partials are loaded) ──────────────────────
  function initCards() {

    // Inject Box folder link into Setup step 5 sub-step 2 if configured
    var cfg = window.FLIGHT400_CONFIG || {};
    if (cfg.boxFolderUrl) {
      var boxContainer = document.getElementById('box-folder-link-container');
      if (boxContainer) {
        boxContainer.innerHTML = '<a href="' + cfg.boxFolderUrl + '" target="_blank" rel="noopener" style="color:var(--ibm-blue);font-weight:600">this Box folder↗</a>';
      }
    }

    var cards = document.querySelectorAll('.bubble-card');

    // Bubble pop-in via IntersectionObserver
    if ('IntersectionObserver' in window) {
      var cardObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var idx = Array.prototype.indexOf.call(cards, entry.target);
            var delay = Math.min(idx * 60, 420);
            setTimeout(function (t) { t.classList.add('bubble-in'); }, delay, entry.target);
            cardObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.10 });
      cards.forEach(function (card) { cardObserver.observe(card); });
    } else {
      cards.forEach(function (card) { card.classList.add('bubble-in'); });
    }

    // Card toggle: click summary to open/close
    cards.forEach(function (card) {
      var summary = card.querySelector('.card-summary');
      if (!summary) return;
      summary.addEventListener('click', function () {
        var isOpen = card.classList.contains('open');
        cards.forEach(function (c) { c.classList.remove('open'); });
        if (!isOpen) {
          card.classList.add('open');
          setTimeout(function () {
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 100);
        }
      });
    });

    // Use-case accordion inside cards
    document.addEventListener('click', function (e) {
      var header = e.target.closest('.use-case-header');
      if (!header) return;
      var uc = header.closest('.use-case');
      var isOpen = uc.classList.contains('uc-open');
      uc.closest('.use-cases').querySelectorAll('.use-case').forEach(function (s) {
        s.classList.remove('uc-open');
      });
      if (!isOpen) uc.classList.add('uc-open');
    });

    // Copy buttons
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.copy-btn');
      if (!btn) return;
      var box = btn.closest('.step-prompt, .prompt-box, .code-block');
      var pre = box ? box.querySelector('pre') : null;
      var text = pre ? pre.textContent : '';
      if (!text) return;
      fallbackCopy(text, btn);
    });

    // Attendee table row selection
    var attendeeTable = document.getElementById('attendee-table');
    if (attendeeTable) {
      attendeeTable.addEventListener('click', function (e) {
        var row = e.target.closest('tbody tr');
        if (!row) return;
        var num = parseInt(row.cells[0].textContent.trim(), 10);
        // Check if config provides explicit library/port for this student
        var cfg = window.FLIGHT400_CONFIG || {};
        var cfgRow = cfg.attendeeTable && cfg.attendeeTable.find(function (r) { return r.student === num; });
        if (cfgRow) {
          // Parse nn from library name e.g. FLGHT407 → 407
          var libNum = parseInt(cfgRow.library.replace(/[^0-9]/g, ''), 10);
          var port   = cfgRow.devPort;
          var name   = cfgRow.attendeeName || null;
          selectStudentExplicit(num, libNum, port, name);
        } else {
          selectStudent(num);
        }
      });
    }

    // Restore previously selected student on load
    restoreStudentSelection();
  }

  // ── STUDENT SELECTION ────────────────────────────────────────────────────
  var STUDENT_KEY    = 'flight400-student-v1';
  var gfBadgeEl      = document.getElementById('gf-student-badge');
  var gfBadgeNameEl  = document.getElementById('student-badge-name');
  var gfBadgeClearEl = document.getElementById('student-badge-clear');

  function padNum(n) {
    return n < 10 ? '0' + n : '' + n;
  }

  function selectStudent(num) {
    var nn     = padNum(num);
    var libNum = 400 + num;
    var port   = 3000 + num;
    try { localStorage.setItem(STUDENT_KEY, JSON.stringify({ num: num, libNum: libNum, port: port })); } catch (e) {}
    applyStudentReplacements(num, nn, libNum, port);
    highlightSelectedRow(num);
    updateStudentBadge(num, libNum, port, null);
  }

  function selectStudentExplicit(num, libNum, port, name) {
    var nn = padNum(num);
    try { localStorage.setItem(STUDENT_KEY, JSON.stringify({ num: num, libNum: libNum, port: port, name: name })); } catch (e) {}
    applyStudentReplacements(num, nn, libNum, port);
    highlightSelectedRow(num);
    updateStudentBadge(num, libNum, port, name);
  }

  function restoreStudentSelection() {
    var saved;
    try { saved = JSON.parse(localStorage.getItem(STUDENT_KEY) || 'null'); } catch (e) {}
    if (!saved || !saved.num) return;
    var num    = saved.num;
    var libNum = saved.libNum || (400 + num);
    var port   = saved.port   || (3000 + num);
    var name   = saved.name   || null;
    var nn     = padNum(num);
    applyStudentReplacements(num, nn, libNum, port);
    highlightSelectedRow(num);
    updateStudentBadge(num, libNum, port, name);
  }

  function clearStudent() {
    try { localStorage.removeItem(STUDENT_KEY); } catch (e) {}
    // Reload to restore original placeholder text
    window.location.reload();
  }

  // ── ORIGINAL-TEXT CACHE ───────────────────────────────────────────────────
  // We snapshot original text on first replacement so re-selection always
  // starts from the placeholder text, not the already-substituted value.
  var ORIG_ATTR = 'data-orig-text';

  function getOriginal(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (!node[ORIG_ATTR]) node[ORIG_ATTR] = node.textContent;
      return node[ORIG_ATTR];
    }
    // Element (pre, code)
    if (!node.dataset.origText) node.dataset.origText = node.textContent;
    return node.dataset.origText;
  }

  function applyStudentReplacements(num, nn, libNum, port) {
    var root = document.getElementById('tracks-stream') || document.body;

    // Replace text in <pre> elements — always from original
    root.querySelectorAll('pre').forEach(function (pre) {
      pre.textContent = replaceTokens(getOriginal(pre), num, nn, libNum, port);
    });

    // Replace in step descriptions and info boxes (text nodes only — skip code/pre)
    root.querySelectorAll('.step-desc, .uc-desc, .info-box, .warn-box, .detail-intro, .data-table td, .step-screenshot-caption').forEach(function (el) {
      replaceTextNodes(el, num, nn, libNum, port);
    });
  }

  function replaceTokens(text, num, nn, libNum, port) {
    // Order matters: most-specific patterns first
    return text
      .replace(/FLGHTSZ4nn/gi, 'FLGHTSZ' + libNum)
      .replace(/FLIGHT4nn/gi,  'FLIGHT' + libNum)
      .replace(/FLGHT4nn/gi,   'FLGHT' + libNum)
      .replace(/flght4nn/gi,   'flght' + libNum)
      .replace(/flight4nn/gi,  'flight' + libNum)
      .replace(/\b4nn\b/g,     String(libNum))
      .replace(/\b30nn\b/g,    String(port))
      .replace(/(?<![0-9])nn\b/g, nn);
  }

  function replaceTextNodes(el, num, nn, libNum, port) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var tag = node.parentElement && node.parentElement.tagName;
        if (tag === 'PRE' || tag === 'CODE') return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    }, false);
    var node;
    while ((node = walker.nextNode())) {
      var orig = getOriginal(node);
      var replaced = replaceTokens(orig, num, nn, libNum, port);
      if (replaced !== node.textContent) node.textContent = replaced;
    }
    // Also replace inside <code> elements (inline code, not pre>code)
    el.querySelectorAll('code').forEach(function (c) {
      if (c.closest('pre')) return;
      c.textContent = replaceTokens(getOriginal(c), num, nn, libNum, port);
    });
  }

  function highlightSelectedRow(num) {
    var table = document.getElementById('attendee-table');
    if (!table) return;
    table.querySelectorAll('tbody tr').forEach(function (row) {
      row.classList.remove('attendee-selected');
    });
    var rows = table.querySelectorAll('tbody tr');
    var target = rows[num - 1];
    if (target) {
      target.classList.add('attendee-selected');
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function updateStudentBadge(num, libNum, port, name) {
    if (!gfBadgeEl) return;
    if (gfBadgeNameEl) {
      var dot = '<span style="opacity:0.4;margin:0 5px">·</span>';
      var label = name
        ? '<strong>' + name + '</strong>' + dot + 'FLGHT' + libNum
        : '<span style="opacity:0.6;font-weight:500;font-size:0.68rem">Student&nbsp;</span><strong>' + num + '</strong>' + dot + 'FLGHT' + libNum;
      gfBadgeNameEl.innerHTML = label + dot + '<span style="font-family:var(--font-mono)">:' + port + '</span>';
    }
    gfBadgeEl.classList.remove('hidden');
    syncBadgeOffset();
  }

  if (gfBadgeClearEl) {
    gfBadgeClearEl.addEventListener('click', clearStudent);
  }

  function syncBadgeOffset() {
    if (!gfBadgeEl) return;
    gfBadgeEl.style.bottom = '24px';
  }

  // ── COPY HELPER ───────────────────────────────────────────────────────────
  function fallbackCopy(text, btn) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { markCopied(btn); }).catch(function () { legacyCopy(text, btn); });
    } else {
      legacyCopy(text, btn);
    }
  }
  function legacyCopy(text, btn) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); markCopied(btn); } catch (e) {}
    document.body.removeChild(ta);
  }
  function markCopied(btn) {
    btn.textContent = '✓ Copied';
    btn.classList.add('copied');
    setTimeout(function () {
      btn.textContent = 'Copy';
      btn.classList.remove('copied');
    }, 2000);
  }

  // ── ESCAPE KEY ────────────────────────────────────────────────────────────
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeNtb();
  });

})();
