"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";

export default function SettingsPage() {
  const [channelSecret, setChannelSecret] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [maskedSecret, setMaskedSecret] = useState("");
  const [maskedToken, setMaskedToken] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Webhook URLを生成
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        setWebhookUrl(`${supabaseUrl}/functions/v1/line-webhook/${user.id}`);
      }
    });

    // 既存設定を取得
    fetch("/api/settings/line")
      .then((res) => res.json())
      .then((data) => {
        if (data.configured) {
          setConfigured(true);
          setMaskedSecret(data.line_channel_secret);
          setMaskedToken(data.line_channel_access_token);
        }
      });
  }, []);

  async function handleSave() {
    if (!channelSecret || !accessToken) return;
    setSaving(true);
    setSaved(false);

    const res = await fetch("/api/settings/line", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        line_channel_secret: channelSecret,
        line_channel_access_token: accessToken,
      }),
    });

    if (res.ok) {
      setSaved(true);
      setConfigured(true);
      setChannelSecret("");
      setAccessToken("");
      // 再取得してマスク表示を更新
      const updated = await fetch("/api/settings/line").then((r) => r.json());
      setMaskedSecret(updated.line_channel_secret);
      setMaskedToken(updated.line_channel_access_token);
      setTimeout(() => setSaved(false), 3000);
    }

    setSaving(false);
  }

  async function handleCopyWebhookUrl() {
    await navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <header className="border-b bg-white dark:bg-zinc-900 px-6 py-4">
        <h1 className="text-xl font-bold">設定</h1>
      </header>

      <main className="p-6 space-y-6 max-w-2xl">
        {/* Webhook URL */}
        <Card>
          <CardHeader>
            <CardTitle>Webhook URL</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              LINE DevelopersコンソールのWebhook URLに以下を設定してください。
            </p>
            {webhookUrl ? (
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-zinc-100 px-3 py-2 text-sm font-mono dark:bg-zinc-800 break-all">
                  {webhookUrl}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyWebhookUrl}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">読み込み中...</p>
            )}
          </CardContent>
        </Card>

        {/* LINE Credentials */}
        <Card>
          <CardHeader>
            <CardTitle>LINE Messaging API設定</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {configured && (
              <div className="rounded border p-3 space-y-1 bg-zinc-50 dark:bg-zinc-800/50">
                <p className="text-xs text-muted-foreground">現在の設定</p>
                <p className="text-sm font-mono">
                  Channel Secret: {maskedSecret}
                </p>
                <p className="text-sm font-mono">
                  Access Token: {maskedToken}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {configured ? "設定を更新する場合は新しい値を入力してください。" : "LINE Developersコンソールから取得した値を入力してください。"}
              </p>
              <div className="space-y-2">
                <label className="text-sm font-medium">Channel Secret</label>
                <Input
                  type="password"
                  value={channelSecret}
                  onChange={(e) => setChannelSecret(e.target.value)}
                  placeholder="Channel Secretを入力"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Channel Access Token
                </label>
                <Input
                  type="password"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="Channel Access Tokenを入力"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleSave}
                  disabled={saving || !channelSecret || !accessToken}
                >
                  {saving ? "保存中..." : "保存"}
                </Button>
                {saved && (
                  <span className="flex items-center gap-1 text-sm text-green-600">
                    <Check className="h-4 w-4" />
                    保存しました
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
