#!/bin/bash
# UserReviewTool Firebase Hosting デプロイスクリプト

# プロジェクト設定
cd "$(dirname "$0")"

# Firebase プロジェクト確認
echo "=== Firebase プロジェクト設定 ==="
npx firebase use yt-transcript-demo-2025

# Firestore ルール・インデックス デプロイ
echo ""
echo "=== Firestore ルール・インデックス デプロイ ==="
npx firebase deploy --only firestore:rules,firestore:indexes --project yt-transcript-demo-2025

# Firebase Hosting デプロイ（nova-reviews サイト）
echo ""
echo "=== Firebase Hosting デプロイ（nova-reviews） ==="
npx firebase deploy --only hosting:nova-reviews --project yt-transcript-demo-2025

echo ""
echo "=== デプロイ完了 ==="
echo "URL: https://nova-reviews.web.app"
echo ""
