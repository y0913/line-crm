"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus, X } from "lucide-react";
import type { Tag } from "@/lib/supabase";

const TAG_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#3b82f6", "#8b5cf6", "#ec4899", "#6b7280",
];

type TagManagerProps = {
  lineUserId: string;
  assignedTags: Tag[];
};

export function TagManager({ lineUserId, assignedTags }: TagManagerProps) {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[4]);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/tags")
      .then((res) => res.json())
      .then((data) => setAllTags(data));
  }, [open]);

  const assignedTagIds = new Set(assignedTags.map((t) => t.id));
  const unassignedTags = allTags.filter((t) => !assignedTagIds.has(t.id));

  async function addTag(tagId: string) {
    await fetch("/api/users/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lineUserId, tagId }),
    });
    router.refresh();
  }

  async function removeTag(tagId: string) {
    await fetch("/api/users/tags", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lineUserId, tagId }),
    });
    router.refresh();
  }

  async function createAndAddTag() {
    if (!newTagName.trim()) return;
    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTagName.trim(), color: selectedColor }),
    });
    if (res.ok) {
      const tag = await res.json();
      setNewTagName("");
      await addTag(tag.id);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {assignedTags.map((tag) => (
          <Badge
            key={tag.id}
            style={{ backgroundColor: tag.color }}
            className="text-white gap-1 pr-1"
          >
            {tag.name}
            <button
              onClick={() => removeTag(tag.id)}
              className="ml-1 rounded-full hover:bg-white/20 p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger className="inline-flex items-center justify-center gap-1 rounded-md border border-input bg-background px-2 h-6 text-xs font-medium hover:bg-accent hover:text-accent-foreground">
            <Plus className="h-3 w-3" />
            タグ追加
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3 space-y-3">
            {unassignedTags.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">既存のタグ</p>
                <div className="flex flex-wrap gap-1">
                  {unassignedTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      style={{ backgroundColor: tag.color }}
                      className="text-white cursor-pointer hover:opacity-80"
                      onClick={() => {
                        addTag(tag.id);
                        setOpen(false);
                      }}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">新しいタグを作成</p>
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="タグ名"
                className="h-8 text-sm"
              />
              <div className="flex gap-1">
                {TAG_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`h-6 w-6 rounded-full border-2 ${
                      selectedColor === color
                        ? "border-zinc-900 dark:border-white"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <Button
                onClick={() => {
                  createAndAddTag();
                  setOpen(false);
                }}
                disabled={!newTagName.trim()}
                size="sm"
                className="w-full"
              >
                作成して追加
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
