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

  // Check if we're on influencer page (query parameter)
  var urlParams = new URLSearchParams(window.location.search);
  var influencerHandle = urlParams.get("influencer");
  
  if (influencerHandle) {
    // Hide register/search sections, show influencer section
    var sectionRegister = document.getElementById("section-register");
    var sectionSearch = document.getElementById("section-search");
    var sectionInfluencer = document.getElementById("section-influencer");
    
    if (sectionRegister) sectionRegister.style.display = "none";
    if (sectionSearch) sectionSearch.style.display = "none";
    if (sectionInfluencer) sectionInfluencer.style.display = "block";
    
    // Load influencer data and reviews
    loadInfluencerPage(influencerHandle);
  } else {
    // Registration form logic
    initializeRegistrationForm();
  }

  function loadInfluencerPage(handle) {
    var wikiContent = document.getElementById("wiki-content");
    var infHandleChip = document.getElementById("inf-handle-chip");
    var tagList = document.getElementById("tag-list");
    var reviewsList = document.getElementById("reviews-list");
    var reviewSubmitBtn = document.getElementById("review-submit");
    var backToSearchBtn = document.getElementById("back-to-search");
    var reviewText = document.getElementById("review-text");
    var reviewSuccess = document.getElementById("review-success");
    var starValue = document.getElementById("star-value");
    
    if (!wikiContent || !infHandleChip) return;
    
    // Set handle chip
    infHandleChip.textContent = "@" + handle;
    
    // Load influencer data from Firestore
    db.collection('influencers').doc(handle).get()
      .then(function(doc) {
        if (!doc.exists) {
          wikiContent.innerHTML = '<p>このインフルエンサーは登録されていません。</p>';
          return;
        }
        
        var data = doc.data();
        var avgRating = data.averageRating || 0;
        var reviewCount = data.reviewCount || 0;
        var params = data.parameters || {};
        
        // Render wiki content
        var stars = "★".repeat(Math.round(avgRating)) + "☆".repeat(5 - Math.round(avgRating));
        var wikiHtml = [
          '<h2>' + (data.displayName || handle) + '</h2>',
          '<p><strong>プラットフォーム:</strong> ' + data.platform + '</p>',
          '<p><strong>プロフィールURL:</strong> <a href="' + data.profileUrl + '" target="_blank" rel="noopener">' + data.profileUrl + '</a></p>',
          '<p><strong>平均評価:</strong> ' + stars + ' ' + avgRating.toFixed(1) + ' / 5.0 (' + reviewCount + '件のレビュー)</p>',
          '<h3>パラメータ評価</h3>',
          '<ul>',
          '<li>技術的正確性: ' + (params.technical_accuracy || 0).toFixed(1) + ' / 5.0</li>',
          '<li>応答速度: ' + (params.response_speed || 0).toFixed(1) + ' / 5.0</li>',
          '<li>使いやすさ: ' + (params.user_friendliness || 0).toFixed(1) + ' / 5.0</li>',
          '<li>創造性: ' + (params.creativity || 0).toFixed(1) + ' / 5.0</li>',
          '<li>信頼性: ' + (params.reliability || 0).toFixed(1) + ' / 5.0</li>',
          '</ul>'
        ].join('');
        
        wikiContent.innerHTML = wikiHtml;
        
        // Initialize rating stars
        initializeStars();
        
        // Initialize tags
        var tags = ['技術サポート', '教育・解説', 'プログラミング', '創造的', 'ビジネス', 'エンタメ'];
        if (tagList) {
          tagList.innerHTML = tags.map(function(tag) {
            return '<div class="tag-chip" data-tag="' + tag + '">' + tag + '</div>';
          }).join('');
          
          // Tag click handlers
          Array.prototype.forEach.call(tagList.querySelectorAll('.tag-chip'), function(chip) {
            chip.addEventListener('click', function() {
              chip.classList.toggle('active');
            });
          });
        }
        
        // Load existing reviews
        loadReviews(handle);
        
        // Review submit handler
        if (reviewSubmitBtn) {
          reviewSubmitBtn.addEventListener('click', function() {
            submitReview(handle, data);
          });
        }
      })
      .catch(function(err) {
        console.error("Error loading influencer:", err);
        wikiContent.innerHTML = '<p>データの読み込みに失敗しました: ' + err.message + '</p>';
      });
    
    // Back to search button
    if (backToSearchBtn) {
      backToSearchBtn.addEventListener('click', function() {
        window.location.href = 'search.html';
      });
    }
  }

  var currentStarRating = 0;
  var currentParameterRatings = {
    technical_accuracy: 0,
    response_speed: 0,
    user_friendliness: 0,
    creativity: 0,
    reliability: 0
  };

  function initializeStars() {
    var stars = document.querySelectorAll('#stars .star');
    var starValue = document.getElementById('star-value');
    
    if (!stars.length || !starValue) return;
    
    Array.prototype.forEach.call(stars, function(star) {
      star.addEventListener('click', function() {
        var value = parseInt(star.getAttribute('data-value'));
        currentStarRating = value;
        
        // Update star display
        Array.prototype.forEach.call(stars, function(s, idx) {
          if (idx < value) {
            s.classList.add('active');
          } else {
            s.classList.remove('active');
          }
        });
        
        starValue.textContent = '評価: ' + value + ' / 5';
      });
    });
  }

  function loadReviews(handle) {
    var reviewsList = document.getElementById('reviews-list');
    if (!reviewsList) return;
    
    reviewsList.innerHTML = '<p class="hint">読み込み中...</p>';
    
    db.collection('reviews')
      .where('influencerHandle', '==', handle)
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get()
      .then(function(snapshot) {
        if (snapshot.empty) {
          reviewsList.innerHTML = '<p class="hint">まだレビューがありません。最初のレビューを投稿しましょう！</p>';
          return;
        }
        
        var html = [];
        snapshot.forEach(function(doc) {
          var review = doc.data();
          var stars = "★".repeat(review.rating || 0) + "☆".repeat(5 - (review.rating || 0));
          var date = review.createdAt ? new Date(review.createdAt.toDate()).toLocaleDateString('ja-JP') : '不明';
          var tags = (review.tags || []).map(function(t) {
            return '<span class="tag-chip" style="cursor:default;">' + t + '</span>';
          }).join(' ');
          
          html.push([
            '<div class="review-item">',
              '<div class="meta">',
                '<span>' + stars + ' ' + (review.rating || 0) + '.0 / 5.0</span>',
                '<span>|</span>',
                '<span>' + date + '</span>',
              '</div>',
              tags ? '<div style="margin-bottom:8px;">' + tags + '</div>' : '',
              '<div>' + (review.comment || '') + '</div>',
            '</div>'
          ].join(''));
        });
        
        reviewsList.innerHTML = html.join('');
      })
      .catch(function(err) {
        console.error("Error loading reviews:", err);
        reviewsList.innerHTML = '<p class="hint">レビューの読み込みに失敗しました。</p>';
      });
  }

  function submitReview(handle, influencerData) {
    var reviewText = document.getElementById('review-text');
    var reviewSuccess = document.getElementById('review-success');
    var tagList = document.getElementById('tag-list');
    var reviewSubmitBtn = document.getElementById('review-submit');
    
    if (!reviewText || !reviewSuccess || !reviewSubmitBtn) return;
    
    var comment = reviewText.value.trim();
    
    if (currentStarRating === 0) {
      alert('評価を選択してください（星1〜5）');
      return;
    }
    
    if (!comment) {
      alert('レビュー本文を入力してください');
      return;
    }
    
    // Get selected tags
    var selectedTags = [];
    if (tagList) {
      Array.prototype.forEach.call(tagList.querySelectorAll('.tag-chip.active'), function(chip) {
        selectedTags.push(chip.getAttribute('data-tag'));
      });
    }
    
    reviewSubmitBtn.disabled = true;
    reviewSubmitBtn.textContent = '投稿中...';
    
    // Create review data
    var reviewData = {
      influencerHandle: handle,
      rating: currentStarRating,
      comment: comment,
      tags: selectedTags,
      parameters: currentParameterRatings,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      userId: 'anonymous' // TODO: implement authentication
    };
    
    // Add review to Firestore
    db.collection('reviews').add(reviewData)
      .then(function(docRef) {
        console.log("Review added:", docRef.id);
        
        // Update influencer aggregate data
        return updateInfluencerAggregates(handle, influencerData);
      })
      .then(function() {
        // Show success message
        reviewSuccess.classList.add('show');
        setTimeout(function() {
          reviewSuccess.classList.remove('show');
        }, 3000);
        
        // Reset form
        reviewText.value = '';
        currentStarRating = 0;
        currentParameterRatings = {
          technical_accuracy: 0,
          response_speed: 0,
          user_friendliness: 0,
          creativity: 0,
          reliability: 0
        };
        
        // Reset stars
        Array.prototype.forEach.call(document.querySelectorAll('#stars .star'), function(s) {
          s.classList.remove('active');
        });
        document.getElementById('star-value').textContent = '評価: 0 / 5';
        
        // Reset tags
        if (tagList) {
          Array.prototype.forEach.call(tagList.querySelectorAll('.tag-chip'), function(chip) {
            chip.classList.remove('active');
          });
        }
        
        reviewSubmitBtn.disabled = false;
        reviewSubmitBtn.textContent = 'レビューを投稿';
        
        // Reload reviews and influencer data
        loadReviews(handle);
        loadInfluencerPage(handle);
      })
      .catch(function(err) {
        console.error("Error submitting review:", err);
        alert('レビューの投稿に失敗しました: ' + err.message);
        reviewSubmitBtn.disabled = false;
        reviewSubmitBtn.textContent = 'レビューを投稿';
      });
  }

  function updateInfluencerAggregates(handle, currentData) {
    // Get all reviews for this influencer
    return db.collection('reviews')
      .where('influencerHandle', '==', handle)
      .get()
      .then(function(snapshot) {
        var totalRating = 0;
        var count = 0;
        var paramTotals = {
          technical_accuracy: 0,
          response_speed: 0,
          user_friendliness: 0,
          creativity: 0,
          reliability: 0
        };
        
        snapshot.forEach(function(doc) {
          var review = doc.data();
          totalRating += review.rating || 0;
          count++;
          
          if (review.parameters) {
            paramTotals.technical_accuracy += review.parameters.technical_accuracy || 0;
            paramTotals.response_speed += review.parameters.response_speed || 0;
            paramTotals.user_friendliness += review.parameters.user_friendliness || 0;
            paramTotals.creativity += review.parameters.creativity || 0;
            paramTotals.reliability += review.parameters.reliability || 0;
          }
        });
        
        var avgRating = count > 0 ? totalRating / count : 0;
        var avgParams = {
          technical_accuracy: count > 0 ? paramTotals.technical_accuracy / count : 0,
          response_speed: count > 0 ? paramTotals.response_speed / count : 0,
          user_friendliness: count > 0 ? paramTotals.user_friendliness / count : 0,
          creativity: count > 0 ? paramTotals.creativity / count : 0,
          reliability: count > 0 ? paramTotals.reliability / count : 0
        };
        
        // Update influencer document
        return db.collection('influencers').doc(handle).update({
          averageRating: avgRating,
          reviewCount: count,
          parameters: avgParams,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      });
  }

  function initializeRegistrationForm() {
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

      submitBtn.disabled = true;
      submitBtn.textContent = "登録中...";

      var displayName = (displayInput.value || "").trim() || currentHandle;
      
      var influencerData = {
        handle: currentHandle,
        displayName: displayName,
        platform: "x.com",
        profileUrl: "https://x.com/" + currentHandle,
        categories: [],
        parameters: {
          technical_accuracy: 0,
          response_speed: 0,
          user_friendliness: 0,
          creativity: 0,
          reliability: 0
        },
        averageRating: 0,
        reviewCount: 0,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      // Check if influencer already exists
      db.collection('influencers').doc(currentHandle).get()
        .then(function(doc) {
          if (doc.exists) {
            success.classList.add("show");
            success.style.background = "linear-gradient(180deg, rgba(255,193,7,0.08), rgba(255,193,7,0.06))";
            successText.textContent = "このインフルエンサーは既に登録されています。検索からレビューできます。";
            submitBtn.disabled = false;
            submitBtn.textContent = "アカウントを登録";
            return;
          }
          
          // Create new influencer
          return db.collection('influencers').doc(currentHandle).set(influencerData)
            .then(function() {
              localStorage.setItem("nova_last_registered", currentHandle);
              success.classList.add("show");
              success.style.background = "linear-gradient(180deg, rgba(0,212,255,0.06), rgba(159,90,224,0.06))";
              successText.textContent = "登録が完了しました。@" + currentHandle + " を検索してレビューを投稿できます。";
              
              handleInput.value = "";
              displayInput.value = "";
              agree.checked = false;
              updatePreview();
              updateValidation();
              submitBtn.disabled = false;
              submitBtn.textContent = "アカウントを登録";
            });
        })
        .catch(function(err) {
          console.error("Registration error:", err);
          success.classList.add("show");
          success.style.background = "linear-gradient(180deg, rgba(255,107,107,0.08), rgba(255,107,107,0.06))";
          successText.textContent = "登録に失敗しました: " + err.message;
          submitBtn.disabled = false;
          submitBtn.textContent = "アカウントを登録";
        });
    });

    // Initialize
    updatePreview();
    updateValidation();
  }
})();
