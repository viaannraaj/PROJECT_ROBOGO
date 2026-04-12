(function () {
  const LS_SUBSCRIBERS = "roblognext_waitlist_subscribers_v1";
  const SS_PENDING = "roblognext_waitlist_otp_pending_v1";

  const form = document.getElementById("waitlist-form");
  if (!form) return;

  const cfg = function () {
    return window.RoblogNextWaitlistConfig || {};
  };

  const success = document.getElementById("form-success");
  const noticeDup = document.getElementById("notice-duplicate");
  const subtitle = document.getElementById("waitlist-subtitle");
  const demoOtpBanner = document.getElementById("demo-otp-banner");
  const demoOtpCode = document.getElementById("demo-otp-code");

  const errRequired = document.getElementById("err-required");
  const errEmail = document.getElementById("err-email");
  const errGame = document.getElementById("err-game");
  const errGameOther = document.getElementById("err-game-other");
  const errGdpr = document.getElementById("err-gdpr");
  const errSend = document.getElementById("err-send");
  const errOtp = document.getElementById("err-otp");

  const gameGuide = form.querySelector("#gameGuide");
  const gameOtherWrap = document.getElementById("game-other-wrap");
  const gameOther = form.querySelector("#gameOther");

  const stepOtp = document.getElementById("waitlist-step-otp");
  const otpEmailDisplay = document.getElementById("otp-email-display");
  const otpInput = document.getElementById("otp-input");
  const btnSendCode = document.getElementById("btn-send-code");
  const btnVerifyOtp = document.getElementById("btn-verify-otp");
  const btnResendOtp = document.getElementById("btn-resend-otp");
  const btnBackForm = document.getElementById("btn-back-form");

  function show(el, visible) {
    if (!el) return;
    el.classList.toggle("visible", !!visible);
  }

  function validEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function normalizeEmail(v) {
    return String(v || "")
      .trim()
      .toLowerCase();
  }

  function loadSubscribers() {
    try {
      const raw = localStorage.getItem(LS_SUBSCRIBERS);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }

  function isSubscribed(email) {
    const n = normalizeEmail(email);
    return loadSubscribers().some(function (r) {
      return r.emailNormalized === n;
    });
  }

  function saveSubscriber(record) {
    const list = loadSubscribers();
    list.push(record);
    localStorage.setItem(LS_SUBSCRIBERS, JSON.stringify(list));
    console.info("[RoblogNext waitlist] New subscriber stored locally:", {
      count: list.length,
      latest: {
        email: record.email,
        firstName: record.firstName,
        lastName: record.lastName,
        gameInterest: record.gameInterest,
        joinedAt: record.joinedAt,
      },
    });
    console.info(
      "[RoblogNext waitlist] Full list (demo export):",
      JSON.stringify(list, null, 2)
    );
  }

  function readPending() {
    try {
      const raw = sessionStorage.getItem(SS_PENDING);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function writePending(obj) {
    sessionStorage.setItem(SS_PENDING, JSON.stringify(obj));
  }

  function clearPending() {
    sessionStorage.removeItem(SS_PENDING);
  }

  function generateOtp() {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  function collectDraft() {
    const first = form.firstName.value.trim();
    const last = form.lastName.value.trim();
    const email = form.email.value.trim();
    const guideChoice = gameGuide ? gameGuide.value : "";
    const otherName = gameOther ? gameOther.value.trim() : "";
    const gameInterest = guideChoice === "other" ? otherName : guideChoice;
    return {
      firstName: first,
      lastName: last,
      email: email,
      emailNormalized: normalizeEmail(email),
      gameGuideChoice: guideChoice,
      gameInterest: gameInterest,
      marketingOptIn: form.marketingOptIn ? form.marketingOptIn.checked : false,
    };
  }

  function validateStep1() {
    show(errRequired, false);
    show(errEmail, false);
    show(errGame, false);
    show(errGameOther, false);
    show(errGdpr, false);
    show(errSend, false);

    const first = form.firstName.value.trim();
    const last = form.lastName.value.trim();
    const email = form.email.value.trim();
    const guideChoice = gameGuide ? gameGuide.value : "";
    const otherName = gameOther ? gameOther.value.trim() : "";
    const consent = form.consentProcessing.checked;
    const age = form.confirmAge.checked;

    let ok = true;
    if (!first || !last) {
      show(errRequired, true);
      ok = false;
    }
    if (!email || !validEmail(email)) {
      show(errEmail, true);
      ok = false;
    }
    if (!guideChoice) {
      show(errGame, true);
      ok = false;
    }
    if (guideChoice === "other" && !otherName) {
      show(errGameOther, true);
      ok = false;
    }
    if (!consent || !age) {
      show(errGdpr, true);
      ok = false;
    }
    return ok;
  }

  function updateGameOtherUI() {
    if (!gameGuide || !gameOtherWrap || !gameOther) return;
    const isOther = gameGuide.value === "other";
    gameOtherWrap.hidden = !isOther;
    if (!isOther) {
      gameOther.value = "";
      gameOther.removeAttribute("aria-required");
    } else {
      gameOther.setAttribute("aria-required", "true");
    }
  }

  if (gameGuide) {
    gameGuide.addEventListener("change", function () {
      updateGameOtherUI();
      if (gameGuide.value === "other" && gameOther) {
        gameOther.focus();
      }
    });
    updateGameOtherUI();
  }

  function applyQueryGame() {
    const params = new URLSearchParams(window.location.search);
    const g = params.get("game");
    if (!g || !gameGuide) return;
    const opts = gameGuide.querySelectorAll("option");
    for (let i = 0; i < opts.length; i++) {
      if (opts[i].value === g) {
        gameGuide.value = g;
        updateGameOtherUI();
        break;
      }
    }
  }

  applyQueryGame();

  function showOtpStep(emailDisplay) {
    form.classList.add("is-hidden");
    if (subtitle) subtitle.hidden = true;
    stepOtp.hidden = false;
    otpEmailDisplay.textContent = emailDisplay;
    otpInput.value = "";
    show(errOtp, false);
    otpInput.focus();
  }

  function hideOtpStep() {
    stepOtp.hidden = true;
    form.classList.remove("is-hidden");
    if (subtitle) subtitle.hidden = false;
  }

  function showFinalSuccess() {
    hideOtpStep();
    form.classList.add("is-hidden");
    if (subtitle) subtitle.hidden = true;
    show(success, true);
    success.focus();
  }

  function showDuplicate() {
    show(noticeDup, true);
    noticeDup.focus();
  }

  async function requestOtp(draft) {
    const c = cfg();
    if (c.requestOtpUrl) {
      const res = await fetch(c.requestOtpUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: draft.emailNormalized,
          firstName: draft.firstName,
          lastName: draft.lastName,
          gameGuideChoice: draft.gameGuideChoice,
          gameInterest: draft.gameInterest,
          marketingOptIn: draft.marketingOptIn,
        }),
      });
      if (!res.ok) throw new Error("request failed");
      writePending({
        email: draft.emailNormalized,
        expires: Date.now() + 10 * 60 * 1000,
        draft: draft,
        mode: "server",
      });
      return { mode: "server" };
    }

    const otp = generateOtp();
    writePending({
      email: draft.emailNormalized,
      otp: otp,
      expires: Date.now() + 10 * 60 * 1000,
      draft: draft,
      mode: "demo",
    });
    return { mode: "demo", otp: otp };
  }

  async function verifyOtpCode(email, code) {
    const pending = readPending();
    if (!pending || normalizeEmail(email) !== pending.email) return false;
    if (Date.now() > pending.expires) return false;

    const c = cfg();
    if (pending.mode === "server" && c.verifyOtpUrl) {
      const res = await fetch(c.verifyOtpUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizeEmail(email),
          code: String(code).trim(),
        }),
      });
      if (!res.ok) return false;
      const data = await res.json().catch(function () {
        return {};
      });
      return !!data.ok;
    }

    return String(code).trim() === String(pending.otp);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    show(noticeDup, false);
    show(success, false);

    if (!validateStep1()) return;

    const draft = collectDraft();
    if (isSubscribed(draft.email)) {
      showDuplicate();
      return;
    }

    btnSendCode.disabled = true;
    requestOtp(draft)
      .then(function (result) {
        showOtpStep(draft.email);
        if (result.mode === "demo" && cfg().demoRevealOtp !== false) {
          demoOtpCode.textContent = result.otp;
          show(demoOtpBanner, true);
        } else {
          show(demoOtpBanner, false);
        }
      })
      .catch(function () {
        show(errSend, true);
      })
      .then(function () {
        btnSendCode.disabled = false;
      });
  });

  btnVerifyOtp.addEventListener("click", function () {
    show(errOtp, false);
    const pending = readPending();
    const email = pending ? pending.email : normalizeEmail(form.email.value);
    const code = otpInput.value.trim();

    if (!/^\d{6}$/.test(code)) {
      show(errOtp, true);
      return;
    }

    btnVerifyOtp.disabled = true;
    Promise.resolve(verifyOtpCode(email, code))
      .then(function (ok) {
        if (!ok) {
          show(errOtp, true);
          return;
        }
        const p = readPending();
        if (!p || !p.draft) return;
        const d = p.draft;
        saveSubscriber({
          emailNormalized: d.emailNormalized,
          email: d.email,
          firstName: d.firstName,
          lastName: d.lastName,
          gameGuideChoice: d.gameGuideChoice,
          gameInterest: d.gameInterest,
          marketingOptIn: d.marketingOptIn,
          joinedAt: new Date().toISOString(),
        });
        clearPending();
        show(demoOtpBanner, false);
        showFinalSuccess();
      })
      .finally(function () {
        btnVerifyOtp.disabled = false;
      });
  });

  btnBackForm.addEventListener("click", function () {
    clearPending();
    show(demoOtpBanner, false);
    hideOtpStep();
    otpInput.value = "";
  });

  otpInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      btnVerifyOtp.click();
    }
  });

  btnResendOtp.addEventListener("click", function () {
    if (!validateStep1()) {
      hideOtpStep();
      return;
    }
    const draft = collectDraft();
    if (isSubscribed(draft.email)) {
      hideOtpStep();
      showDuplicate();
      return;
    }
    btnResendOtp.disabled = true;
    requestOtp(draft)
      .then(function (result) {
        if (result.mode === "demo" && cfg().demoRevealOtp !== false) {
          demoOtpCode.textContent = result.otp;
          show(demoOtpBanner, true);
        }
        otpInput.value = "";
        show(errOtp, false);
      })
      .catch(function () {
        show(errSend, true);
      })
      .then(function () {
        btnResendOtp.disabled = false;
      });
  });

  window.RoblogNextExportWaitlist = function () {
    try {
      return JSON.parse(localStorage.getItem(LS_SUBSCRIBERS) || "[]");
    } catch (e) {
      return [];
    }
  };
})();

