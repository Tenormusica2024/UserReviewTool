# NOVA Reviews - UserReviewTool

AIインフルエンサーのユーザー別レビューシステム

## 📋 プロジェクト概要

x.comのAIインフルエンサーにユーザー別レビューを付けるWebアプリケーション。
Firebase Authentication（匿名認証）とFirestoreを使用したデータ永続化を実装。

## 🔑 Firebase設定情報

- **プロジェクトID**: `yt-transcript-demo-2025`
- **Hosting Site**: `nova-reviews`
- **本番URL**: `https://nova-reviews.web.app` (デプロイ後)
- **既存ツールとの分離**: 完全に独立したFirebase Hostingサイトとして動作

## 🚀 デプロイ手順

```bash
# Firebase CLIで認証（必要な場合）
firebase login

# プロジェクト設定確認
firebase use yt-transcript-demo-2025

# Firestore・Hosting デプロイ
firebase deploy --only firestore:rules,firestore:indexes,hosting:nova-reviews
```

## 📁 ファイル構成

```
UserReviewTool/
├── index.html          # メインページ（登録・検索・レビュー）
├── search.html         # 検索専用ページ
├── app.js             # メインロジック（Firebase統合済み）
├── search.js          # 検索ロジック
├── firebase-config.js # Firebase初期化
├── firebase.json      # Firebase Hosting設定
├── .firebaserc        # プロジェクト設定
├── firestore.rules    # Firestoreセキュリティルール
└── firestore.indexes.json # Firestoreインデックス
```

## 🔐 認証方式

**Firebase Anonymous Authentication**を使用:
- 初回アクセス時に匿名ユーザーとして自動認証
- ユーザーIDはFirebase側で自動生成
- レビュー投稿時にユーザーIDを記録

## 💾 データ構造

### Firestore Collections

**users コレクション**
```javascript
{
  handle: "ai_influencer",
  display: "表示名",
  platform: "x.com",
  registeredAt: "2025-01-02T12:34:56.789Z",
  userId: "firebase-uid"
}
```

**influencers コレクション**
```javascript
{
  handle: "ai_influencer",
  display: "AI インフルエンサー研究所",
  platform: "x.com",
  wiki: "== 概要 ==\n...",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**reviews コレクション**
```javascript
{
  influencerHandle: "ai_influencer",
  userId: "firebase-uid",
  rating: 5,
  tags: ["helpful", "accurate"],
  text: "レビュー本文",
  createdAt: Timestamp
}
```

## 🔒 セキュリティルール

- **users**: 読取り全体許可、書込みは本人のみ
- **influencers**: 読取り全体許可、書込みは認証済みユーザー
- **reviews**: 読取り全体許可、作成は認証済み、更新・削除は投稿者のみ

## 🎯 既存ツール（yt-transcript）との分離

**完全に干渉しない設計:**
1. 別のFirebase Hostingサイト（`nova-reviews`）として動作
2. 異なるURL（`nova-reviews.web.app` vs `yt-transcript-ycqe3vmjva-an.a.run.app`）
3. 同一Firebaseプロジェクト内だがコレクション名が異なる
4. Cloud Runサービスとは無関係

## 📝 使用方法

1. index.htmlでアカウント登録（匿名認証で自動ログイン）
2. 検索セクションでインフルエンサーを検索
3. インフルエンサーページでwiki確認＋レビュー投稿
4. 全データはFirestoreに永続化

## 🔄 ローカル開発

```bash
# ローカルサーバー起動
firebase serve --only hosting:nova-reviews

# ブラウザで確認
http://localhost:5000
```

## ⚠️ 注意事項

- **匿名認証のため、ブラウザのデータクリア時にユーザー情報が消失**
- 本番運用では適切な認証方式（Email/Google等）への移行を推奨
- ダミーデータは初期表示用のみ、実際のデータはFirestoreから取得

## 📅 更新履歴

- **2025-01-02**: Firebase統合完了、Firestore・匿名認証実装
