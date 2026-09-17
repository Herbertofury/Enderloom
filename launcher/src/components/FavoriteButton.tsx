import { useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCreative } from "../creative-store";
import type { FavoriteInput } from "../lib/creative";
import { cn } from "../lib/cn";

export function FavoriteButton({
  favorite,
  label = false,
}: {
  favorite: FavoriteInput;
  label?: boolean;
}) {
  const key = `${favorite.provider}:${favorite.project_id}`;
  const saved = useCreative((s) => !!s.library.favorites[key]);
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      aria-label={`${saved ? "Unfavorite" : "Favorite"} ${favorite.title}`}
      aria-pressed={saved}
      title={saved ? "Remove from Favorites" : "Save to Favorites"}
      disabled={busy}
      onClick={async (e) => {
        e.stopPropagation();
        setBusy(true);
        try {
          await useCreative
            .getState()
            .act(
              saved ? "remove" : "save",
              saved ? { keys: [key] } : { favorite },
            );
        } catch (error) {
          toast.error("Could not save favorite", {
            description: String(error),
          });
        } finally {
          setBusy(false);
        }
      }}
      className={cn(
        "inline-flex h-8 shrink-0 items-center justify-center gap-2 rounded-lg transition-colors hover:bg-rose-400/10",
        label ? "px-3 text-xs font-semibold" : "w-8",
        saved ? "text-rose-400" : "text-content-faint",
      )}
    >
      {busy ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Heart className={cn("size-4", saved && "fill-current")} />
      )}
      {label && (saved ? "Saved to Favorites" : "Save to Favorites")}
    </button>
  );
}
