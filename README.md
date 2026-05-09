# 連打 vs

チーム対抗の連打競争 Web アプリ。150 人規模の同時参加を想定し、Firebase Realtime Database でリアルタイム集計、GitHub Pages で無料ホスティングできる静的 SPA です。

## 機能

- メインページ（プレイヤー）: チーム選択 → ゲーム開始の 5 秒カウントダウン → 制限時間内の連打 → 結果待ち
- ホストページ（パスワード認証）: チーム作成、制限時間設定、開始/結果発表/リセット、ライブスコア表示
- 終盤 5 秒間はホスト画面でもスコアを隠し、結果発表ボタンでカウントアップアニメーション
- スペース・Enter 等のキー入力は受け付けない（pointerdown 専用）
- 自動クリッカー検知（毎秒 20 クリック超でロック）

## セットアップ

### 1. Firebase プロジェクトを準備

1. [Firebase Console](https://console.firebase.google.com/) で新規プロジェクトを作成
2. **プランは Blaze（従量課金）必須** — 無料 Spark プランは同時接続 100 上限のため、150 人規模には不足
3. プロジェクトに Web アプリを追加し、設定値を取得
4. Authentication で「匿名認証」を有効化
5. Realtime Database を作成（リージョン任意、セキュリティルールは後述のものを適用）

### 2. ホストパスワードを生成

```sh
npm install
npm run hash-password -- "your-secret-password"
```

出力された `VITE_HOST_PASSWORD_SALT` と `VITE_HOST_PASSWORD_HASH` を控えます。

### 3. `.env.local` を作成

```sh
cp .env.example .env.local
```

Firebase Console から取得した値とパスワードハッシュを記入します。

### 4. 開発サーバーを起動

```sh
npm run dev
```

`http://localhost:5173/renda-vs/` でプレイヤー画面、`http://localhost:5173/renda-vs/#/host` でホスト画面にアクセスできます。

### 5. (任意) Firebase Emulator を使う

本番 DB を汚さずローカルで検証する場合:

```sh
npm install -g firebase-tools
npm run emulators
```

別ターミナルで `VITE_USE_EMULATOR=true` を `.env.local` に追加して `npm run dev` 起動。

### 6. RTDB セキュリティルールをデプロイ

```sh
firebase deploy --only database
```

または Firebase Console の Realtime Database > ルール画面に `database.rules.json` の内容を貼り付け。

## GitHub Pages へのデプロイ

1. リポジトリの **Settings > Pages** で Source を「GitHub Actions」に設定
2. **Settings > Secrets and variables > Actions** に以下のシークレットを登録:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_DATABASE_URL`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_HOST_PASSWORD_SALT`
   - `VITE_HOST_PASSWORD_HASH`
3. `main` ブランチに push すると `.github/workflows/deploy.yml` が起動して自動デプロイ
4. デプロイ後、`https://<user>.github.io/renda-vs/` でアクセス可能

リポジトリ名が `renda-vs` 以外の場合は、`vite.config.ts` の `base` を一致させてください。

## 構成

| パス | 役割 |
|---|---|
| `src/pages/PlayerPage.tsx` | プレイヤー画面（待機・カウントダウン・ゲーム中・終了） |
| `src/pages/HostPage.tsx` | ホスト画面（認証 → ダッシュボード） |
| `src/lib/click-tracker.ts` | 1 秒バッチでの連打集計と自動クリッカー検知 |
| `src/lib/host-auth.ts` | パスワードハッシュ照合と匿名サインイン |
| `src/lib/game-state.ts` | RTDB のゲーム設定操作 |
| `src/lib/teams.ts` | チーム CRUD |
| `database.rules.json` | RTDB セキュリティルール |

## 設計上の注意

- **プレイヤーは Firebase Auth しません**: 会場 NAT 配下で 150 名が同時 anonymous sign-in すると IP ベースのレートリミットに抵触する可能性があるため、`localStorage` の UUID で識別します。
- **書き込み制約は RTDB ルールで担保**: 1 秒あたりの delta 上限 25、累計上限 5000、`state === 'running'` かつ `now >= startAt` のときのみ加算許可。
- **ホストパスワード**: バンドルにハッシュが埋め込まれます。総当たり攻撃を防ぐため、長く推測されにくいパスワード（16 文字以上）を設定してください。最終防衛は RTDB ルールの `hostUid` 一致チェックです。
- **同時開催は不可**: `gameId='main'` 固定です。

## ライセンス

MIT
