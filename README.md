# line-crm

LINE Messaging API + Supabase を使ったシンプルなCRMシステム。

## 技術スタック

- **バックエンド**: Supabase (Database / Edge Functions)
- **ランタイム**: Deno (Edge Functions)
- **外部API**: LINE Messaging API
- **ローカルトンネル**: ngrok

---

## 事前準備

以下をインストールしておく：

```bash
brew install supabase/tap/supabase
brew install ngrok
brew install jq
```

Docker Desktopが起動していることを確認。

---

## 初期セットアップ（初回のみ）

### 1. リポジトリクローン

```bash
git clone git@github.com:yourname/line-crm.git
cd line-crm
```

### 2. 環境変数設定

```bash
cp .env.example .env
# .envを開いて各自のキーを設定
```

### 3. Claude Code .env保護設定

```bash
~/dev-docs/setup-claude-protection.sh
```

### 4. Supabaseローカル起動 & テーブル作成

```bash
supabase start
```

起動後にURLとキーが表示される：

```
API URL:          http://127.0.0.1:54321
Studio URL:       http://127.0.0.1:54323
service_role key: eyJ...
```

Studio ( http://127.0.0.1:54323 ) → SQL Editor で以下を実行：

```sql
-- LINEユーザー管理
create table line_users (
  id uuid primary key default gen_random_uuid(),
  line_user_id text unique not null,
  display_name text,
  picture_url text,
  source_type text,
  followed_at timestamptz default now(),
  created_at timestamptz default now()
);

-- メッセージ履歴
create table messages (
  id uuid primary key default gen_random_uuid(),
  line_user_id text not null references line_users(line_user_id),
  direction text not null check (direction in ('inbound', 'outbound')),
  message_type text not null,
  content text,
  sent_at timestamptz default now()
);
```

### 5. ngrokアカウント設定

1. https://dashboard.ngrok.com/signup でアカウント作成
2. https://dashboard.ngrok.com/get-started/your-authtoken でauthtokenを取得
3. 以下のコマンドで登録（初回のみ）：

```bash
ngrok config add-authtoken 取得したtoken
```

### 6. LINE Developers設定

1. https://developers.line.biz にアクセス
2. プロバイダー作成 → 「LINE公式アカウントを作成する」
3. 作成後、LINE Official Account ManagerでMessaging APIを有効化
4. LINE DevelopersコンソールでChannel SecretとChannel Access Tokenを取得
5. `.env`に記載：

```
LINE_CHANNEL_SECRET=取得したChannel Secret
LINE_CHANNEL_ACCESS_TOKEN=取得したChannel Access Token
```

---

## 開発開始時のコマンド（毎回実行）

**ターミナル1：Supabase起動 + Edge Function起動**

```bash
supabase start
supabase functions serve line-webhook --no-verify-jwt
```

**ターミナル2：ngrok起動**

```bash
ngrok http 54321
```

起動すると以下のようなURLが表示される：

```
Forwarding  https://xxxx.ngrok-free.app -> http://localhost:54321
```

**LINE DevelopersコンソールのWebhook URLを更新**

※ ngrokの無料プランはセッションのたびにURLが変わるため毎回更新が必要

```
https://xxxx.ngrok-free.app/functions/v1/line-webhook
```

LINE Developers → CRMテスト → Messaging API設定 → Webhook URL → 編集 → 検証

---

## 動作確認

### フォローイベントのテスト

```bash
cat > /tmp/test-follow.json << 'EOF'
{
  "events": [{
    "type": "follow",
    "source": {"type": "user", "userId": "U123456"},
    "timestamp": 1711234567000
  }]
}
EOF

curl -X POST http://127.0.0.1:54321/functions/v1/line-webhook \
  -H "Content-Type: application/json" \
  -d @/tmp/test-follow.json
```

### メッセージ受信のテスト

```bash
cat > /tmp/test-message.json << 'EOF'
{
  "events": [{
    "type": "message",
    "source": {"type": "user", "userId": "U123456"},
    "message": {"type": "text", "text": "テストメッセージ"},
    "timestamp": 1711234567000
  }]
}
EOF

curl -X POST http://127.0.0.1:54321/functions/v1/line-webhook \
  -H "Content-Type: application/json" \
  -d @/tmp/test-message.json
```

Studio → Table Editor → `messages` でレコードを確認。

---

## 環境変数一覧

`.env.example` を参考に `.env` を作成：

```
LINE_CHANNEL_SECRET=your_channel_secret
LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token
```

---

## 開発時の注意

- `.env` はGit管理外（`.gitignore`で除外済み）
- Claude Codeは `.env` を読めないようにフック設定済み（`.claude/hooks/protect-env.sh`）
- ngrokの無料プランはセッション切れるたびURLが変わるため、都度LINE DevelopersコンソールのWebhook URLを更新する
