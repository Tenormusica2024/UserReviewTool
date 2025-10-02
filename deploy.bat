@echo off
REM UserReviewTool Firebase Hosting デプロイスクリプト（Windows）

cd /d "%~dp0"

echo === Firebase プロジェクト設定 ===
call npx firebase use yt-transcript-demo-2025

echo.
echo === Firestore ルール・インデックス デプロイ ===
call npx firebase deploy --only firestore:rules,firestore:indexes --project yt-transcript-demo-2025

echo.
echo === Firebase Hosting デプロイ（nova-reviews） ===
call npx firebase deploy --only hosting:nova-reviews --project yt-transcript-demo-2025

echo.
echo === デプロイ完了 ===
echo URL: https://nova-reviews.web.app
echo.

pause
