import { ContentIcon } from "../components/ContentIcon";
import { AddContentButton } from "../components/AddContentButton";
import { LayoutDensityMenu, TILE_SIZE_STEPS } from "../components/LayoutDensityMenu";
import { useLibraryLayout } from "../lib/library-layout";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpRight,
  Check,
  CheckCheck,
  FolderHeart,
  GripVertical,
  Heart,
  Loader2,
  Package,
  Pin,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { openUrl } from "@tauri-apps/plugin-opener";
import { useCreative } from "../creative-store";
import { useStore } from "../store";
import { FavoriteButton } from "../components/FavoriteButton";
import { GeneratorBadge } from "../components/GeneratorBadge";
import { Modal, ModalHeader } from "../components/Modal";
import { useContentInstaller } from "../components/CurseForgeDownloadModal";
import { api } from "../lib/api";
import { isMCreator, type Favorite } from "../lib/creative";
import type { ContentKind, ProjectVersion, SearchProvider } from "../lib/types";
import "./creative.css";

export function FavoritesView() {
  const library = useCreative((s) => s.library);
  const ready = useCreative((s) => s.ready);
  const error = useCreative((s) => s.error);
  const context = useCreative((s) => s.context);
  const instances = useStore((s) => s.instances);
  const [query, setQuery] = useState("");
  const [collection, setCollection] = useState("all");
  const [kind, setKind] = useState("all");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [detail, setDetail] = useState<string | null>(null);
  const [createName, setCreateName] = useState<string | null>(null);
  const [editingCollection, setEditingCollection] = useState<string | null>(
    null,
  );
  const [install, setInstall] = useState<Favorite[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [contextError, setContextError] = useState<string | null>(null);
  const { layout, setLayout, tileSize, setTileSize } = useLibraryLayout();
  const sort = library.preferences.favorites_sort ?? "custom";
  const all = Object.values(library.favorites);
  const act = async (operation: string, payload: Record<string, unknown>) => {
    try {
      await useCreative.getState().act(operation, payload);
      return true;
    } catch (e) {
      toast.error("Could not update Favorites", { description: String(e) });
      return false;
    }
  };
  const refresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        useCreative.getState().refresh(),
        useCreative.getState().refreshContext(),
      ]);
      setContextError(null);
    } catch (e) {
      setContextError(String(e));
    } finally {
      setRefreshing(false);
    }
  };
  useEffect(() => {
    void refresh();
  }, []);
  const inspections = useMemo(() => {
    const result = new Map<string, import("../lib/creative").ModInspection>();
    for (const [key, installs] of Object.entries(context))
      for (const row of installs) {
        if (row.inspection && (!result.has(key) || isMCreator(row.inspection)))
          result.set(key, row.inspection);
      }
    return result;
  }, [context]);
  const shown = all
    .filter((f) => {
      const matchesCollection =
        collection === "all" ||
        (collection === "pinned"
          ? f.pinned
          : f.collections.includes(collection));
      const installs = context[f.key] ?? [];
      return (
        matchesCollection &&
        (kind === "all" || f.kind === kind) &&
        (status === "all" ||
          (status === "installed" && installs.length > 0) ||
          (status === "uninstalled" && !installs.length) ||
          (status === "updates" && installs.some((i) => i.update)) ||
          (status === "mcreator" && isMCreator(inspections.get(f.key)))) &&
        `${f.title} ${f.author ?? ""} ${f.provider} ${f.description ?? ""} ${f.notes} ${f.tags.join(" ")}`
          .toLowerCase()
          .includes(query.toLowerCase())
      );
    })
    .sort(
      (a, b) =>
        Number(b.pinned) - Number(a.pinned) ||
        (sort === "name"
          ? a.title.localeCompare(b.title)
          : sort === "recent"
            ? b.saved_at - a.saved_at
            : sort === "installed"
              ? (context[b.key]?.length ?? 0) - (context[a.key]?.length ?? 0)
              : sort === "mcreator"
                ? Number(isMCreator(inspections.get(b.key))) -
                  Number(isMCreator(inspections.get(a.key)))
                : a.order - b.order),
    );
  const picked = all.filter((f) => selected.includes(f.key));
  const focused = detail ? library.favorites[detail] : null;
  const addToCollection = async (keys: string[], id: string) => {
    for (const key of keys) {
      const entry = useCreative.getState().library.favorites[key];
      if (entry)
        await act("edit", {
          keys: [key],
          patch: { collections: [...new Set([...entry.collections, id])] },
        });
    }
  };
  const remove = async (entries: Favorite[]) => {
    if (!(await act("remove", { keys: entries.map((f) => f.key) }))) return;
    setSelected([]);
    toast("Removed from Favorites", {
      action: {
        label: "Undo",
        onClick: async () => {
          for (const favorite of entries) {
            await act("save", { favorite });
            await act("edit", {
              keys: [favorite.key],
              patch: {
                notes: favorite.notes,
                collections: favorite.collections,
                tags: favorite.tags,
                pinned: favorite.pinned,
                order: favorite.order,
              },
            });
          }
        },
      },
    });
  };
  return (
    <div className="creative-workspace favorites-workspace">
      <header className="cr-hero">
        <div>
          <span className="cr-eyebrow">
            <Heart size={13} /> YOUR PERSONAL LIBRARY
          </span>
          <h1>Keep the good stuff.</h1>
          <p>
            Every mod you love. Every pack you’re planning. One place that stays
            yours.
          </p>
        </div>
        <div className="cr-hero-count">
          <strong>{all.length.toLocaleString()}</strong>
          <span>saved favorites</span>
          <span className="cr-heart-orbit">
            <Heart />
          </span>
        </div>
      </header>
      <div className="cr-body">
        <aside className="cr-collection-rail">
          <span className="cr-eyebrow">LIBRARY</span>
          <button
            className={collection === "all" ? "active" : ""}
            onClick={() => setCollection("all")}
          >
            <Heart size={16} />
            All favorites<span>{all.length}</span>
          </button>
          <button
            className={collection === "pinned" ? "active" : ""}
            onClick={() => setCollection("pinned")}
          >
            <Pin size={16} />
            Pinned<span>{all.filter((f) => f.pinned).length}</span>
          </button>
          <div className="cr-rail-heading">
            <span className="cr-eyebrow">COLLECTIONS</span>
            <button
              aria-label="New collection"
              onClick={() => {
                setCreateName("");
                setEditingCollection(null);
              }}
            >
              <Plus size={16} />
            </button>
          </div>
          {Object.values(library.collections).map((c) => (
            <button
              key={c.id}
              className={collection === c.id ? "active" : ""}
              onClick={() => setCollection(c.id)}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "copy";
              }}
              onDrop={(e) => {
                e.preventDefault();
                const key = e.dataTransfer.getData("text/enderloom-favorite");
                if (key)
                  void addToCollection(
                    selected.includes(key) ? selected : [key],
                    c.id,
                  );
              }}
            >
              <FolderHeart size={16} />
              <b>{c.name}</b>
              <span>
                {all.filter((f) => f.collections.includes(c.id)).length}
              </span>
            </button>
          ))}
          <button
            className="cr-dashed"
            onClick={() => {
              setCreateName("");
              setEditingCollection(null);
            }}
          >
            <Plus size={15} />
            Create collection
          </button>
          <div className="cr-rail-note">
            <GripVertical size={17} />
            <p>
              Drag favorites into a collection. Arrange your library in Custom
              order.
            </p>
          </div>
          <button
            onClick={() => useStore.getState().openDiscover("mods", null)}
          >
            <ArrowUpRight size={16} />
            Find something new
          </button>
        </aside>
        <main className="cr-library-main">
          <div className="cr-section-heading">
            <div>
              <h2>
                {collection === "all"
                  ? "All favorites"
                  : collection === "pinned"
                    ? "Pinned favorites"
                    : (library.collections[collection]?.name ?? "Collection")}
              </h2>
              <span>
                {shown.length} {shown.length === 1 ? "favorite" : "favorites"} ·
                saved independently of installs
              </span>
            </div>
            {library.collections[collection] && !["following", "testing"].includes(collection) && (
              <>
                <button
                  className="cr-button"
                  onClick={() => {
                    setCreateName(library.collections[collection].name);
                    setEditingCollection(collection);
                  }}
                >
                  Rename
                </button>
                <button
                  className="cr-icon-button"
                  aria-label="Delete collection"
                  title="Delete collection; keep its favorites"
                  onClick={() => {
                    void act("delete_collection", { id: collection });
                    setCollection("all");
                  }}
                >
                  <Trash2 size={15} />
                </button>
              </>
            )}
            <AddContentButton onClick={() => useStore.getState().openDiscover("mods", null)} />
            <button
              className="cr-button"
              disabled={refreshing}
              onClick={refresh}
            >
              {refreshing && <Loader2 className="animate-spin" size={14} />}
              Refresh
            </button>
          </div>
          <div className="cr-toolbar">
            <LayoutDensityMenu layout={layout} onLayoutChange={setLayout} tileSize={tileSize} onTileSizeChange={setTileSize} testIdPrefix="favorites" />
            <label className="cr-search">
              <Search size={16} />
              <input
                aria-label="Search favorites"
                placeholder="Search favorites, tags, notes…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <select
              aria-label="Favorite content type"
              value={kind}
              onChange={(e) => setKind(e.target.value)}
            >
              <option value="all">All content</option>
              {[...new Set(all.map((f) => f.kind))].map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
            <select
              aria-label="Favorite status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">Any status</option>
              <option value="installed">Installed</option>
              <option value="uninstalled">Not installed</option>
              <option value="updates">Update available</option>
              <option value="mcreator">MCreator · Premium</option>
            </select>
            <select
              aria-label="Sort favorites"
              value={sort}
              onChange={(e) =>
                void act("preferences", { favorites_sort: e.target.value })
              }
            >
              <option value="custom">Custom order</option>
              <option value="name">Name</option>
              <option value="recent">Recently saved</option>
              <option value="installed">Most installed</option>
              <option value="mcreator">MCreator first</option>
            </select>

          </div>
          {(error || contextError) && (
            <div className="cr-error" role="alert">
              {error ?? contextError}
              <button onClick={refresh}>Retry</button>
            </div>
          )}
          {picked.length > 0 && (
            <div className="cr-bulk">
              <CheckCheck size={16} />
              <strong>{picked.length} selected</strong>
              <button onClick={() => setSelected(shown.map((f) => f.key))}>
                Select visible
              </button>
              <select
                aria-label="Add selected to collection"
                value=""
                onChange={(e) => void addToCollection(selected, e.target.value)}
              >
                <option value="" disabled>
                  Add to collection…
                </option>
                {Object.values(library.collections).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() =>
                  void act("edit", { keys: selected, patch: { pinned: true } })
                }
              >
                <Pin size={14} />
                Pin
              </button>
              <button
                onClick={() =>
                  setInstall(picked.filter((f) => f.provider !== "local"))
                }
              >
                <ArrowDownToLine size={14} />
                Install
              </button>
              <button onClick={() => void remove(picked)}>
                <Trash2 size={14} />
                Remove
              </button>
              <button
                aria-label="Clear favorite selection"
                onClick={() => setSelected([])}
              >
                <X size={16} />
              </button>
            </div>
          )}
          {!ready ? (
            <div className="cr-empty">
              <Loader2 className="animate-spin" />
              <h3>Opening your library…</h3>
            </div>
          ) : shown.length === 0 ? (
            <div className="cr-empty">
              <FolderHeart size={40} />
              <h3>
                {all.length
                  ? "No favorites match these filters"
                  : "Your next great pack starts here."}
              </h3>
              <p>
                {all.length
                  ? "Try another collection, status or search."
                  : "Tap the heart on a mod or project to keep it here. Organize ideas before you install anything."}
              </p>
              <button
                className="cr-button cr-primary"
                onClick={() => useStore.getState().openDiscover("mods", null)}
              >
                Explore mods <ArrowUpRight size={16} />
              </button>
            </div>
          ) : (
            <div className={`cr-favorites cr-${layout}`} style={{'--tile-width': TILE_SIZE_STEPS[tileSize].widthPx+'px'} as React.CSSProperties}>
              {layout === "table" && (
                <div className="cr-table-head">
                  <span>Project</span>
                  <span>Type / provider</span>
                  <span>Installed in</span>
                  <span>Actions</span>
                </div>
              )}
              {shown.map((f) => {
                const installs = context[f.key] ?? [];
                const inspection = inspections.get(f.key);
                return (
                  <article
                    key={f.key}
                    className={selected.includes(f.key) ? "selected" : ""}
                    draggable
                    onDragStart={(e) =>
                      e.dataTransfer.setData("text/enderloom-favorite", f.key)
                    }
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const key = e.dataTransfer.getData(
                        "text/enderloom-favorite",
                      );
                      if (!library.favorites[key] || key === f.key) return;
                      const ordered = [...all]
                        .sort((a, b) => a.order - b.order)
                        .map((f) => f.key)
                        .filter((k) => k !== key);
                      ordered.splice(ordered.indexOf(f.key), 0, key);
                      void act("reorder", { keys: ordered });
                      void act("preferences", { favorites_sort: "custom" });
                    }}
                  >
                    <div className="cr-card-top">
                      <input
                        type="checkbox"
                        aria-label={`Select ${f.title}`}
                        checked={selected.includes(f.key)}
                        onChange={(e) =>
                          setSelected(
                            e.target.checked
                              ? [...selected, f.key]
                              : selected.filter((key) => key !== f.key),
                          )
                        }
                      />
                      <span className="cr-kind">{f.kind}</span>
                      <button
                        aria-label={`${f.pinned ? "Unpin" : "Pin"} ${f.title}`}
                        className={f.pinned ? "is-pinned" : ""}
                        onClick={() =>
                          void act("edit", {
                            keys: [f.key],
                            patch: { pinned: !f.pinned },
                          })
                        }
                      >
                        <Pin size={14} />
                      </button>
                    </div>
                    <button
                      className="cr-card-title"
                      onClick={() => setDetail(f.key)}
                    >
                      <ContentIcon src={f.icon_url} title={f.title} provider={f.provider} projectId={f.project_id} className="cr-project-icon" />
                      <span>
                        <strong>{f.title}</strong>
                        <small>
                          {f.author ? `by ${f.author}` : f.provider}
                        </small>
                      </span>
                    </button>
                    <div className="cr-card-description">
                      {f.description ||
                        f.notes ||
                        "Saved for your next adventure."}
                    </div>
                    <div className="cr-card-meta">
                      <span>
                        {f.kind} · {f.provider}
                      </span>
                      {f.tags.map((tag) => (
                        <span className="cr-tag" key={tag}>
                          {tag}
                        </span>
                      ))}
                      {inspection && isMCreator(inspection) && (
                        <GeneratorBadge
                          inspection={inspection}
                          title={f.title}
                        />
                      )}
                    </div>
                    <div className="cr-install-context">
                      {installs.length ? (
                        <>
                          <Check size={13} />
                          <span>
                            {installs.length === 1
                              ? installs[0].instance_name
                              : `${installs.length} instances`}
                          </span>
                          {installs.some((i) => i.update) && <b>Update</b>}
                        </>
                      ) : (
                        <>
                          <Plus size={13} />
                          <span>Ready for a new home</span>
                        </>
                      )}
                    </div>
                    <div className="cr-card-actions">
                      <button onClick={() => setDetail(f.key)}>
                        Manage <ArrowUpRight size={13} />
                      </button>
                      <FavoriteButton favorite={f} />
                      {f.provider !== "local" && (
                        <button
                          className="cr-install-button"
                          aria-label={`Install ${f.title}`}
                          onClick={() => setInstall([f])}
                        >
                          <ArrowDownToLine size={15} />
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      </div>
      {createName !== null && (
        <Modal open onClose={() => setCreateName(null)} size="sm">
          <ModalHeader
            title={
              editingCollection ? "Rename collection" : "A home for your ideas"
            }
            onClose={() => setCreateName(null)}
          />
          <form
            className="creative-modal-body"
            onSubmit={async (e) => {
              e.preventDefault();
              await act("collection", {
                name: createName,
                id: editingCollection,
              });
              setCreateName(null);
            }}
          >
            <label>
              Collection name
              <input
                autoFocus
                aria-label="Collection name"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="A cozier overworld"
              />
            </label>
            <button
              className="cr-button cr-primary"
              disabled={!createName.trim()}
            >
              Save collection
            </button>
          </form>
        </Modal>
      )}
      {focused && (
        <FavoriteDetails
          key={focused.key}
          favorite={focused}
          onClose={() => setDetail(null)}
          onInstall={() => setInstall([focused])}
          onRemove={() => {
            void remove([focused]);
            setDetail(null);
          }}
        />
      )}
      {install && (
        <FavoriteInstall
          favorites={install}
          onClose={() => {
            setInstall(null);
            void useCreative.getState().refreshContext();
          }}
        />
      )}
      <div className="cr-footnote">
        {instances.length} local instances · Favorites are stored on this
        computer
      </div>
    </div>
  );
}

function FavoriteDetails({
  favorite: f,
  onClose,
  onInstall,
  onRemove,
}: {
  favorite: Favorite;
  onClose: () => void;
  onInstall: () => void;
  onRemove: () => void;
}) {
  const collections = useCreative((s) => s.library.collections);
  const installs = useCreative((s) => s.context[f.key]) ?? [];
  const [notes, setNotes] = useState(f.notes);
  const [tags, setTags] = useState(f.tags.join(", "));
  const [chosen, setChosen] = useState(f.collections);
  const [busy, setBusy] = useState(false);
  const custom = f.kind === "config" || f.kind === "addons";
  const openCopy = (i: import("../lib/creative").Installation) => {
    if (i.kind === "config" || i.kind === "addons") {
      useCreative.setState({
        workbenchTarget: {
          instanceId: i.instance_id,
          path: i.file_name,
          mode: i.kind,
        },
      });
      useStore.setState({ detailInstanceId: i.instance_id });
      useStore.getState().setView(i.kind);
    } else useStore.getState().openInstance(i.instance_id);
    onClose();
  };
  return (
    <Modal open onClose={onClose} size="lg">
      <ModalHeader
        title={f.title}
        subtitle={`${f.kind} · ${f.provider}`}
        onClose={onClose}
      />
      <div className="creative-modal-body">
        <div className="cr-detail-actions">
          {custom ? (
            <>
              <button
                className="cr-button cr-primary"
                onClick={() => {
                  if (installs[0]) openCopy(installs[0]);
                  else {
                    useStore
                      .getState()
                      .setView(f.kind === "config" ? "config" : "addons");
                    onClose();
                  }
                }}
              >
                Open {f.kind === "config" ? "Config" : "Addons"}{" "}
                <ArrowUpRight size={14} />
              </button>
              {f.source_url && (
                <button
                  className="cr-button"
                  onClick={() =>
                    void openUrl(f.source_url!).catch((e) =>
                      toast.error(String(e)),
                    )
                  }
                >
                  Author’s project page <ArrowUpRight size={14} />
                </button>
              )}
            </>
          ) : (
            f.provider !== "local" && (
              <>
                <button className="cr-button cr-primary" onClick={onInstall}>
                  <ArrowDownToLine size={15} />
                  Install to instances
                </button>
                <button
                  className="cr-button"
                  onClick={() => {
                    useStore
                      .getState()
                      .openProject(
                        f.provider as SearchProvider,
                        f.project_id,
                        f.kind as ContentKind,
                        f.title,
                      );
                    onClose();
                  }}
                >
                  Project & versions <ArrowUpRight size={14} />
                </button>
              </>
            )
          )}
        </div>
        <label>
          Notes
          <textarea
            aria-label="Favorite notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Why you saved it, ideas for your next pack…"
          />
        </label>
        <label>
          Tags
          <input
            aria-label="Favorite tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="cozy, worldgen, try next"
          />
        </label>
        <label>Collections</label>
        <div className="cr-collection-checks">
          {Object.values(collections).map((c) => (
            <label key={c.id}>
              <input
                type="checkbox"
                checked={chosen.includes(c.id)}
                onChange={(e) =>
                  setChosen(
                    e.target.checked
                      ? [...chosen, c.id]
                      : chosen.filter((id) => id !== c.id),
                  )
                }
              />
              {c.name}
            </label>
          ))}
        </div>
        <button
          className="cr-button cr-primary"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await useCreative.getState().act("edit", {
                keys: [f.key],
                patch: {
                  notes,
                  tags: [
                    ...new Set(
                      tags
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    ),
                  ],
                  collections: chosen,
                },
              });
              toast.success("Favorite updated");
              onClose();
            } catch (e) {
              toast.error(String(e));
            } finally {
              setBusy(false);
            }
          }}
        >
          Save details
        </button>
        <h3>Installed copies</h3>
        {installs.length ? (
          installs.map((i) => (
            <button
              className="cr-installed-row"
              key={`${i.instance_id}:${i.file_name}`}
              onClick={() => openCopy(i)}
            >
              <Package size={16} />
              <span>
                <strong>{i.instance_name}</strong>
                <small>
                  {i.version || i.version_id || "Version untracked"} ·{" "}
                  {i.enabled ? "enabled" : "disabled"}
                </small>
              </span>
              {i.update && <b>Update: {i.update.latest_name}</b>}
              <ArrowUpRight size={16} />
            </button>
          ))
        ) : (
          <p>
            This favorite is saved independently of installation. It will stay
            here when you remove a mod or instance.
          </p>
        )}
        <button className="cr-button" onClick={onRemove}>
          <Trash2 size={14} />
          Remove favorite
        </button>
      </div>
    </Modal>
  );
}

function FavoriteInstall({
  favorites,
  onClose,
}: {
  favorites: Favorite[];
  onClose: () => void;
}) {
  const instances = useStore((s) => s.instances);
  const installer = useContentInstaller();
  const [targets, setTargets] = useState<string[]>([]);
  const [versions, setVersions] = useState<Record<string, ProjectVersion[]>>(
    {},
  );
  const [chosenVersions, setChosenVersions] = useState<Record<string, string>>(
    {},
  );
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const stopping = useRef(false);
  const packOnly =
    favorites.length > 0 && favorites.every((f) => f.kind === "modpacks");
  const installable = favorites.filter(
    (f) =>
      !["local"].includes(f.provider) &&
      !["config", "addons", "datapacks", "schematics"].includes(f.kind),
  );
  const selectTarget = async (id: string, checked: boolean) => {
    setTargets((p) => (checked ? [...p, id] : p.filter((v) => v !== id)));
    if (checked && favorites.length === 1 && !versions[id]) {
      const instance = instances.find((i) => i.id === id)!;
      try {
        setVersions((p) => ({ ...p, [id]: [] }));
        const list = await api.listProjectVersions(
          favorites[0].provider as "modrinth" | "curseforge",
          favorites[0].project_id,
          favorites[0].kind,
          instance.version_id,
          instance.loader,
        );
        setVersions((p) => ({ ...p, [id]: list.filter((v) => v.compatible) }));
      } catch (e) {
        setStatuses((p) => ({ ...p, [id]: `Version lookup: ${String(e)}` }));
      }
    }
  };
  const run = async () => {
    setBusy(true);
    stopping.current = false;
    for (const f of installable) {
      if (stopping.current) break;
      if (f.kind === "modpacks") {
        setStatuses((p) => ({ ...p, [f.key]: "Installing new instance…" }));
        try {
          const result = await installer.installLatestPack(
            f.provider as "modrinth" | "curseforge",
            f.project_id,
            f.title,
            f.icon_url ?? null,
          );
          setStatuses((p) => ({
            ...p,
            [f.key]: result ? "Installed" : "Cancelled",
          }));
        } catch (e) {
          setStatuses((p) => ({ ...p, [f.key]: String(e) }));
        }
        continue;
      }
      for (const id of targets) {
        if (stopping.current) break;
        const instance = instances.find((i) => i.id === id)!;
        const key = `${f.key}:${id}`;
        setStatuses((p) => ({
          ...p,
          [key]: "Checking compatibility and dependencies…",
        }));
        try {
          const result = await installer.installContent({
            provider: f.provider as "modrinth" | "curseforge",
            projectId: f.project_id,
            kind: f.kind as ContentKind,
            instanceId: id,
            gameVersion: instance.version_id,
            loader: instance.loader,
            title: f.title,
            iconUrl: f.icon_url ?? null,
            versionId:
              favorites.length === 1
                ? chosenVersions[id] || undefined
                : undefined,
          });
          setStatuses((p) => ({
            ...p,
            [key]: result ? "Installed" : "Cancelled",
          }));
        } catch (e) {
          setStatuses((p) => ({ ...p, [key]: String(e) }));
        }
      }
    }
    setBusy(false);
    void useCreative.getState().refreshContext();
  };
  return (
    <Modal
      open
      onClose={() => {
        if (!busy) onClose();
      }}
      size="lg"
    >
      <ModalHeader
        title="Give your favorites a home"
        subtitle={`${favorites.length} selected · compatible files and dependencies checked for each destination`}
        onClose={busy ? undefined : onClose}
      />
      <div className="creative-modal-body">
        {installable.length !== favorites.length && (
          <p className="cr-warning">
            Local files and custom content use their instance’s Addons or Config
            installer. Datapacks require a world; choose it from the project
            page.
          </p>
        )}
        {packOnly ? (
          <p>Each modpack will be installed into a new instance.</p>
        ) : (
          instances.map((i) => (
            <div className="cr-target-row" key={i.id}>
              <label>
                <input
                  type="checkbox"
                  disabled={busy}
                  checked={targets.includes(i.id)}
                  onChange={(e) => void selectTarget(i.id, e.target.checked)}
                />
                <span>
                  <strong>{i.name}</strong>
                  <small>
                    {i.version_id} · {i.loader ?? "Vanilla"}
                  </small>
                </span>
              </label>
              {targets.includes(i.id) && favorites.length === 1 && (
                <select
                  aria-label={`Version for ${i.name}`}
                  disabled={busy}
                  value={chosenVersions[i.id] ?? ""}
                  onChange={(e) =>
                    setChosenVersions((p) => ({ ...p, [i.id]: e.target.value }))
                  }
                >
                  <option value="">Latest compatible</option>
                  {versions[i.id]?.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))
        )}
        {!instances.length && !packOnly && (
          <p>Create an instance first, then install your saved mods here.</p>
        )}
        {Object.entries(statuses).map(([key, status]) => (
          <p className="cr-install-result" key={key}>
            {favorites.find((f) => key.startsWith(f.key))?.title ??
              instances.find((i) => i.id === key)?.name}{" "}
            · {instances.find((i) => key.endsWith(i.id))?.name}
            <strong>{status}</strong>
          </p>
        ))}
        <div className="cr-detail-actions">
          <button
            className="cr-button cr-primary"
            disabled={
              busy || !installable.length || (!packOnly && !targets.length)
            }
            onClick={run}
          >
            {busy ? (
              <Loader2 className="animate-spin" size={15} />
            ) : (
              <ArrowDownToLine size={15} />
            )}
            Install selected
          </button>
          {busy && (
            <button
              className="cr-button"
              onClick={() => {
                stopping.current = true;
                toast(
                  "Queue stopped; the current install remains in Activity.",
                );
              }}
            >
              Stop after current
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
