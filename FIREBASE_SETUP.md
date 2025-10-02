# Firebase Setup Guide

## 必要な設定

### 1. Firebase Authentication設定

Firebaseコンソール（https://console.firebase.google.com/）で以下を実施：

1. プロジェクト: `yt-transcript-demo-2025` を選択
2. **Authentication** → **Sign-in method** を開く
3. **Anonymous** を有効化

### 2. Firestore Database設定

#### データベース作成
1. **Firestore Database** を開く
2. **Create database** をクリック
3. **Start in production mode** を選択
4. リージョン: `asia-northeast1` (Tokyo)

#### セキュリティルール設定
以下のルールを設定（**Rules** タブ）：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anonymous users to read all influencers
    match /influencers/{influencer} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Allow anonymous users to create and read reviews
    match /reviews/{review} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

### 3. Firestore Indexes設定

以下のコンポジットインデックスを作成（**Indexes** タブ）：

#### Index 1: Reviews by influencer and creation time
- Collection ID: `reviews`
- Fields:
  1. `influencerHandle` (Ascending)
  2. `createdAt` (Descending)

#### Index 2: Influencers by creation time
- Collection ID: `influencers`
- Fields:
  1. `createdAt` (Descending)

自動的にインデックスエラーが表示されたら、リンクをクリックして自動作成することも可能です。

## データ構造

### `influencers` コレクション
```javascript
{
  handle: string,              // ユニークID (例: "ai_influencer")
  displayName: string,         // 表示名
  platform: string,            // "x.com"
  profileUrl: string,          // プロフィールURL
  categories: string[],        // カテゴリ
  parameters: {
    technical_accuracy: number,   // 0-5
    response_speed: number,       // 0-5
    user_friendliness: number,    // 0-5
    creativity: number,           // 0-5
    reliability: number           // 0-5
  },
  averageRating: number,       // 平均評価 (0-5)
  reviewCount: number,         // レビュー数
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### `reviews` コレクション
```javascript
{
  influencerHandle: string,    // インフルエンサーのhandle
  rating: number,              // 評価 (1-5)
  comment: string,             // レビュー本文
  tags: string[],              // タグ
  parameters: {
    technical_accuracy: number,
    response_speed: number,
    user_friendliness: number,
    creativity: number,
    reliability: number
  },
  userId: string,              // 'anonymous'
  createdAt: timestamp
}
```

## 確認手順

1. GitHub Pagesにデプロイ後、以下を確認：
   - ブラウザコンソールでエラーなし
   - Anonymous認証が成功（"User signed in: [UID]"）
   - インフルエンサー登録が成功
   - 検索で登録したインフルエンサーが表示
   - レビュー投稿が成功
   - 平均評価が更新される

2. Firestoreコンソールで実際のデータを確認

## 本番URL

https://tenormusica2024.github.io/UserReviewTool/

## 注意事項

- 現在はAnonymous認証を使用（将来的にはGoogle/Twitter認証推奨）
- セキュリティルールは基本的な設定（本番環境では更に厳格化推奨）
- レビューの編集・削除は作成したユーザーのみ可能
