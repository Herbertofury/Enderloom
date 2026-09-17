import { useEffect, useRef, useState, type CSSProperties } from "react";
import { api } from "../lib/api";
import { cn } from "../lib/cn";

const cache = new Map<string, { at: number; value: Promise<string | null> }>();
const queue: (() => void)[] = [];
let active = 0;
function resolveIcon(provider: string, projectId: string) {
  const key = `${provider}:${projectId}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.at < 60_000) return cached.value;
  const value = new Promise<string | null>((resolve) => {
    const run = () => {
      active++;
      void api
        .getProjectDetails(provider, projectId)
        .then(
          (project) => resolve(project.icon_url || null),
          () => resolve(null),
        )
        .finally(() => {
          active--;
          queue.shift()?.();
        });
    };
    if (active < 4) run();
    else queue.push(run);
  });
  cache.set(key, { at: Date.now(), value });
  return value;
}

/** Keeps a visible, sized identity while artwork loads or is unavailable. */
export function ContentIcon({
  src,
  title,
  provider,
  projectId,
  className,
  style,
}: {
  src?: string | null;
  title: string;
  provider?: string | null;
  projectId?: string | null;
  className?: string;
  style?: CSSProperties;
}) {
  const target = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);
  const [resolved, setResolved] = useState<{
    key: string;
    url: string | null;
  } | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<string | null>(null);
  const key = `${provider}:${projectId}:${src ?? ""}`;
  const url = resolved?.key === key ? resolved.url || src : src;
  useEffect(() => {
    const element = target.current;
    if (!element) return;
    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (
      !visible ||
      (src && failed !== src) ||
      !projectId ||
      !["modrinth", "curseforge"].includes(provider ?? "")
    )
      return;
    let current = true;
    void resolveIcon(provider!, projectId).then((url) => {
      if (current) setResolved({ key, url });
    });
    return () => {
      current = false;
    };
  }, [visible, provider, projectId, src, failed, key]);
  let hash = 0;
  for (const letter of title)
    hash = ((hash << 5) - hash + letter.charCodeAt(0)) | 0;
  const hue = Math.abs(hash) % 360;
  const words = title
    .replace(/\.(jar|zip)(\.disabled)?$/i, "")
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
  const initials = (
    words.length > 1 ? words[0][0] + words[1][0] : words[0]?.slice(0, 2) || "M"
  ).toUpperCase();
  const hasImage = !!url && failed !== url && loaded === url;
  return (
    <span
      ref={target}
      className={cn(
        "relative inline-grid shrink-0 place-items-center overflow-hidden rounded-xl",
        className,
      )}
      role="img"
      aria-label={`${title} icon`}
      data-content-icon
      data-icon-state={hasImage ? "loaded" : "fallback"}
      title={hasImage ? title : `${title} · artwork unavailable or loading`}
      style={{
        background: `linear-gradient(145deg, hsl(${hue} 42% 33%), hsl(${(hue + 40) % 360} 35% 16%))`,
        ...style,
      }}
    >
      <span
        aria-hidden="true"
        className="font-display font-bold tracking-tight text-white/90"
        style={{ fontSize: "clamp(12px, 1.2em, 28px)" }}
      >
        {initials}
      </span>
      {visible && url && failed !== url && (
        <img
          key={url}
          src={url}
          alt=""
          decoding="async"
          draggable={false}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            border: 0,
            borderRadius: "inherit",
            opacity: hasImage ? 1 : 0,
          }}
          onLoad={() => setLoaded(url)}
          onError={() => setFailed(url)}
        />
      )}
    </span>
  );
}
