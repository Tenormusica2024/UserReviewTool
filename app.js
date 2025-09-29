// app.js (UTF-8, no BOM). Place this file next to index.html.
"use strict";

(function () {
  // Utility: Remove leading '@', trim spaces, lower-case
  function sanitizeHandle(raw) {
    var trimmed = (raw || "").replace(/^@+/, "").trim();
    return trimmed.toLowerCase();
  }

  // Allow letters/numbers/underscore, 1-15 chars (lowercase after sanitize)
  function validateHandle(handle) {
    var re = /^[a-z0-9_]{1,15}$/;
    return re.test(handle);
  }

  // Get elements safely
  var handleInput = document.getElementById("handle");
  var displayInput = document.getElementById("display");
  var hint = document.getElementById("handle-hint");
  var agree = document.getElementById("agree");
  var submitBtn = document.getElementById("submit-btn");
  var previewBtn = document.getElementById("preview-btn");
  var pvHandleText = document.getElementById("pv-handle-text");
  var pvDisplay = document.getElementById("pv-display");
  var success = document.getElementById("success");
  var successText = document.getElementById("success-text");
  var form = document.getElementById("register-form");

  // Defensive: if any required element is missing, stop gracefully
  var requiredEls = [
    handleInput, displayInput, hint, agree, submitBtn, previewBtn,
    pvHandleText, pvDisplay, success, successText, form
  ];
  for (var i = 0; i < requiredEls.length; i++) {
    if (!requiredEls[i]) {
      console.error("Initialization error: Missing element(s). Check IDs in index.html.");
      return;
    }
  }

  var currentHandle = "";
  var isHandleValid = false;
  var agreed = false;

  function updatePreview() {
    var raw = handleInput.value;
    var sanitized = sanitizeHandle(raw);
    pvHandleText.textContent = sanitized ? sanitized : "your_handle";

    var displayName = (displayInput.value || "").trim();
    pvDisplay.textContent = "表示名: " + (displayName ? displayName : "未設定");
  }

  function updateValidation() {
    var sanitized = sanitizeHandle(handleInput.value);
    currentHandle = sanitized;
    isHandleValid = validateHandle(sanitized);

    hint.classList.remove("valid");
    hint.classList.remove("error");

    if (!sanitized) {
      hint.textContent = "英数字とアンダースコアのみ、1〜15文字。例: ai_influencer, a1_dev_bot";
    } else if (isHandleValid) {
      hint.textContent = "有効なアカウント名です: @" + sanitized;
      hint.classList.add("valid");
    } else {
      hint.textContent = "無効な形式です。使用可能な文字は英数字とアンダースコア、最大15文字です。";
      hint.classList.add("error");
    }

    submitBtn.disabled = !(isHandleValid && agreed);
  }

  function updateAgreement() {
    agreed = !!agree.checked;
    submitBtn.disabled = !(isHandleValid && agreed);
  }

  // Events
  handleInput.addEventListener("input", function () {
    updateValidation();
    updatePreview();
  });

  displayInput.addEventListener("input", function () {
    updatePreview();
  });

  agree.addEventListener("change", function () {
    updateAgreement();
  });

  previewBtn.addEventListener("click", function () {
    updatePreview();
    success.classList.remove("show");
    success.style.background = "linear-gradient(180deg, rgba(0,212,255,0.06), rgba(159,90,224,0.06))";
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    updateValidation();

    if (!(isHandleValid && agreed)) {
      return;
    }

    var payload = {
      handle: currentHandle,
      display: (displayInput.value || "").trim(),
      platform: "x.com",
      registeredAt: new Date().toISOString()
    };

    try {
      // In production, POST to your backend API.
      // fetch("/api/register", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(payload)
      // }).then(function (res) {
      //   if (!res.ok) throw new Error("Registration failed");
      //   return res.json();
      // }).then(function (data) {
      //   // handle success
      // });

      localStorage.setItem("nova_registered_handle", JSON.stringify(payload));
      success.classList.add("show");
      success.style.background = "linear-gradient(180deg, rgba(0,212,255,0.06), rgba(159,90,224,0.06))";
      successText.textContent = "登録が完了しました。@" + payload.handle + "（" + payload.platform + "）";
    } catch (err) {
      console.error(err);
      success.classList.add("show");
      success.style.background = "linear-gradient(180deg, rgba(255,107,107,0.08), rgba(255,107,107,0.06))";
      successText.textContent = "登録に失敗しました。ネットワークまたは設定を確認してください。";
    }
  });

  // Initialize
  updatePreview();
  updateValidation();
})();
