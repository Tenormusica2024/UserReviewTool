// search.js (UTF-8, no BOM). Place this file next to search.html.
"use strict";

(function () {
  // Dummy data: influencers with wiki text (same as index.html/app.js)
  var DUMMY_INFLUENCERS = [
    {
      handle: "ai_influencer",
      display: "AI インフルエンサー研究所",
      platform: "x.com",
      wiki: [
        "== 概要 ==",
        "'''AI インフルエンサー研究所''' は最新のAIトレンド解説とプロンプト共有を中心に活動する情報発信アカウント。",
        "* 主要分野: 生成AI、プロンプト工学、アプリ連携",
        "* 定期企画: #PromptFriday にてコミュニティ投稿を紹介",
        "",
        "== 活動方針 ==",
        "''実用性'' と ''検証'' を重視し、公開情報や論文へのリンクを付して解説するスタイル。",
        "",
        "== リンク ==",
        "[[https://x.com/ai_influencer|x.com プロフィール]]"
      ].join("\n")
    },
    {
      handle: "a1_dev_bot",
      display: "A1 Dev Bot",
      platform: "x.com",
      wiki: [
        "== 概要 ==",
        "'''A1 Dev Bot''' はコードスニペットやデバッグTipsを自動配信する開発者向けボット。",
        "* 主要分野: JavaScript / TypeScript / Node.js / Frontend",
        "* 返信速度: 即時（キュー処理）",
        "",
        "== 使い方 ==",
        "''メンション'' で質問すると、関連するコード例と注意点を返します。",
        "",
        "== リンク ==",
        "[[https://x.com/a1_dev_bot|x.com プロフィール]]"
      ].join("\n")
    },
    {
      handle: "prompt_guru",
      display: "Prompt Guru",
      platform: "x.com",
      wiki: [
        "== 概要 ==",
        "'''Prompt Guru''' は創造的なプロンプトテンプレートとチュートリアルで知られるアカウント。",
        "* 主要分野: 物語生成、画像プロンプト、構成テクニック",
        "* コミュニティ参加: #PromptJam を主催",
        "",
        "== テンプレート例 ==",
        "* 物語生成: 三幕構成、視点切替",
        "* 画像生成: スタイルタグ、照明条件",
        "",
        "== リンク ==",
        "[[https://x.com/prompt_guru|x.com プロフィール]]"
      ].join("\n")
    }
  ];

  function escapeHTML(s) {
    return (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function searchInfluencers(q) {
    var query = (q || "").toLowerCase().trim();
    if (!query) return DUMMY_INFLUENCERS.slice(0, 5);
    return DUMMY_INFLUENCERS.filter(function (inf) {
      return inf.handle.toLowerCase().includes(query) ||
             (inf.display || "").toLowerCase().includes(query);
    }).slice(0, 10);
  }

  function renderSearchResults(items) {
    var container = document.getElementById("search-results");
    if (!container) return;

    if (!items.length) {
      container.innerHTML = '<div class="pv-sub">該当がありません。</div>';
      return;
    }
    var html = items.map(function (inf) {
      var summary = inf.wiki.split("\n").find(function (l) { return l && !/^=+.*=+$/.test(l) && !/^\*/.test(l); }) || "";
      summary = summary.replace(/'{2,3}/g, "");
      return [
        '<div class="result-item">',
          '<div class="avatar" aria-hidden="true"></div>',
          '<div class="info">',
            '<div class="title">',
              '<span>' + escapeHTML(inf.display) + '</span>',
              '<span class="handle-chip"><span style="opacity:0.8">@</span><span>' + escapeHTML(inf.handle) + '</span></span>',
            '</div>',
            '<div class="summary">' + escapeHTML(summary) + '</div>',
            '<div class="actions">',
              '<button class="btn btn-primary go-page" data-handle="' + escapeHTML(inf.handle) + '">ページへ</button>',
            '</div>',
          '</div>',
        '</div>'
      ].join("");
    }).join("");
    container.innerHTML = html;

    Array.prototype.forEach.call(container.querySelectorAll(".go-page"), function (btn) {
      btn.addEventListener("click", function () {
        var h = btn.getAttribute("data-handle");
        // Navigate to the existing influencer page in index.html (SPA route)
        window.location.href = "index.html#/influencer/" + encodeURIComponent(h);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var input = document.getElementById("search-input");
    if (!input) return;

    input.addEventListener("input", function () {
      renderSearchResults(searchInfluencers(input.value));
    });

    // First render
    renderSearchResults(searchInfluencers(""));
    input.focus();
  });
})();
