// search.js (UTF-8, no BOM). Place this file next to search.html.
"use strict";

(function () {
  function escapeHTML(s) {
    return (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function searchInfluencers(q, callback) {
    var query = (q || "").toLowerCase().trim();
    
    if (!query) {
      // Show all influencers
      db.collection('influencers')
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get()
        .then(function(snapshot) {
          var results = [];
          snapshot.forEach(function(doc) {
            results.push(doc.data());
          });
          callback(results);
        })
        .catch(function(err) {
          console.error("Search error:", err);
          callback([]);
        });
      return;
    }

    // Search by handle or display name
    db.collection('influencers')
      .where('handle', '>=', query)
      .where('handle', '<=', query + '\uf8ff')
      .limit(10)
      .get()
      .then(function(snapshot) {
        var results = [];
        snapshot.forEach(function(doc) {
          results.push(doc.data());
        });
        
        // Also search by display name (client-side filtering)
        if (results.length < 5) {
          return db.collection('influencers')
            .orderBy('createdAt', 'desc')
            .limit(20)
            .get()
            .then(function(allSnapshot) {
              var additionalResults = [];
              allSnapshot.forEach(function(doc) {
                var data = doc.data();
                var displayMatch = (data.displayName || "").toLowerCase().includes(query);
                var alreadyIncluded = results.some(function(r) { return r.handle === data.handle; });
                if (displayMatch && !alreadyIncluded) {
                  additionalResults.push(data);
                }
              });
              callback(results.concat(additionalResults).slice(0, 10));
            });
        }
        
        callback(results);
      })
      .catch(function(err) {
        console.error("Search error:", err);
        callback([]);
      });
  }

  function renderSearchResults(items) {
    var container = document.getElementById("search-results");
    if (!container) return;

    if (!items.length) {
      container.innerHTML = '<div class="pv-sub">該当がありません。インフルエンサーを登録してください。</div>';
      return;
    }
    var html = items.map(function (inf) {
      var avgRating = inf.averageRating || 0;
      var reviewCount = inf.reviewCount || 0;
      var stars = "★".repeat(Math.round(avgRating)) + "☆".repeat(5 - Math.round(avgRating));
      var summary = inf.displayName + " - " + (reviewCount > 0 ? reviewCount + "件のレビュー" : "レビューなし");
      
      return [
        '<div class="result-item">',
          '<div class="avatar" aria-hidden="true"></div>',
          '<div class="info">',
            '<div class="title">',
              '<span>' + escapeHTML(inf.displayName || inf.handle) + '</span>',
              '<span class="handle-chip"><span style="opacity:0.8">@</span><span>' + escapeHTML(inf.handle) + '</span></span>',
            '</div>',
            '<div class="summary">' + escapeHTML(stars + " " + avgRating.toFixed(1) + " / 5.0") + '</div>',
            '<div class="summary">' + escapeHTML(summary) + '</div>',
            '<div class="actions">',
              '<button class="btn btn-primary go-page" data-handle="' + escapeHTML(inf.handle) + '">レビューする</button>',
            '</div>',
          '</div>',
        '</div>'
      ].join("");
    }).join("");
    container.innerHTML = html;

    Array.prototype.forEach.call(container.querySelectorAll(".go-page"), function (btn) {
      btn.addEventListener("click", function () {
        var h = btn.getAttribute("data-handle");
        window.location.href = "index.html?influencer=" + encodeURIComponent(h);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var input = document.getElementById("search-input");
    if (!input) return;

    var searchTimeout;
    input.addEventListener("input", function () {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(function() {
        searchInfluencers(input.value, renderSearchResults);
      }, 300);
    });

    // First render
    searchInfluencers("", renderSearchResults);
    input.focus();
  });
})();
