"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

type MemoEditorProps = {
  lineUserId: string;
  initialMemo: string | null;
};

export function MemoEditor({ lineUserId, initialMemo }: MemoEditorProps) {
  const [memo, setMemo] = useState(initialMemo ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/users/memo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lineUserId, memo }),
      });
      if (res.ok) {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-2">
      <Textarea
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        placeholder="このユーザーに関するメモ..."
        rows={3}
      />
      <div className="flex items-center gap-2">
        <Button onClick={handleSave} disabled={saving} size="sm">
          {saving ? "保存中..." : "メモを保存"}
        </Button>
        {saved && (
          <span className="flex items-center gap-1 text-sm text-green-600">
            <Check className="h-4 w-4" />
            保存しました
          </span>
        )}
      </div>
    </div>
  );
}
