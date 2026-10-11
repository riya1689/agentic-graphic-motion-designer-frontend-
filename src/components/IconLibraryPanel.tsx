import {
  ArrowLeft,
  Download,
  Image as ImageIcon,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  deleteLibraryIcon,
  libraryIconDownloadUrl,
  listLibraryIcons,
  updateLibraryIcon,
  uploadLibraryIcon,
  type IconRecord,
} from "../services/iconLibraryApi";

interface IconLibraryPanelProps {
  onBack: () => void;
}

export default function IconLibraryPanel({ onBack }: IconLibraryPanelProps) {
  const [icons, setIcons] = useState<IconRecord[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<IconRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newIconName, setNewIconName] = useState("");
  const [newIconCategory, setNewIconCategory] = useState("");
  const [newIconTags, setNewIconTags] = useState("");
  const [newIconStyle, setNewIconStyle] = useState("");
  const [newIconDescription, setNewIconDescription] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadIcons = async () => {
    setLoading(true);
    setError(null);
    try {
      const records = await listLibraryIcons({ text: query.trim() });
      setIcons(records);
      setSelected((current) =>
        current ? records.find((item) => item.icon_id === current.icon_id) || null : null,
      );
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not load Icon Library.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadIcons();
    }, 220);
    return () => window.clearTimeout(timer);
  }, [query]);

  const categories = useMemo(
    () => Array.from(new Set(icons.map((icon) => icon.category).filter(Boolean))) as string[],
    [icons],
  );

  const openAddDialog = () => {
    setError(null);
    setSelectedFile(null);
    setNewIconName("");
    setNewIconCategory("");
    setNewIconTags("");
    setNewIconStyle("");
    setNewIconDescription("");
    setAddDialogOpen(true);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Choose an SVG file before adding the icon.");
      return;
    }
    if (!newIconName.trim()) {
      setError("Add a name for the icon.");
      return;
    }
    if (!selectedFile.name.toLowerCase().endsWith(".svg")) {
      setError("Only SVG icons can be added to the library.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const created = await uploadLibraryIcon(selectedFile, {
        name: newIconName.trim(),
        category: newIconCategory.trim() || "custom",
        tags: newIconTags.split(",").map((tag) => tag.trim()).filter(Boolean),
        style: newIconStyle.trim() || undefined,
        description: newIconDescription.trim() || undefined,
      });
      setIcons((current) => [created, ...current]);
      setSelected(created);
      setAddDialogOpen(false);
      setSelectedFile(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not add icon.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!selected || selected.source === "built_in") return;
    if (!window.confirm(`Delete “${selected.name}” from the Icon Library?`)) return;
    try {
      await deleteLibraryIcon(selected.icon_id);
      setIcons((current) => current.filter((icon) => icon.icon_id !== selected.icon_id));
      setSelected(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not delete icon.");
    }
  };

  const openEditDialog = () => {
    if (!selected || selected.source === "built_in") return;
    setNewIconName(selected.name);
    setNewIconCategory(selected.category || "");
    setNewIconTags(selected.tags.join(", "));
    setNewIconStyle(selected.style || "");
    setNewIconDescription(selected.description || "");
    setError(null);
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selected || !newIconName.trim()) {
      setError("Add a name for the icon.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const updated = await updateLibraryIcon(selected.icon_id, {
        name: newIconName.trim(),
        category: newIconCategory.trim() || "custom",
        tags: newIconTags.split(",").map((tag) => tag.trim()).filter(Boolean),
        style: newIconStyle.trim() || null,
        description: newIconDescription.trim() || null,
      });
      setIcons((current) => current.map((icon) => icon.icon_id === updated.icon_id ? updated : icon));
      setSelected(updated);
      setEditDialogOpen(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not update icon metadata.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="icon-library-panel">
      <div className="icon-library-toolbar">
        <button className="settings-back-button" onClick={onBack} type="button">
          <ArrowLeft size={18} />
          <span>Icon Library</span>
        </button>
        <button
          className="settings-add-button"
          onClick={openAddDialog}
          type="button"
          disabled={uploading}
        >
          {uploading ? <Loader2 className="spin" size={16} /> : <Plus size={16} />}
          Add Icon
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/svg+xml,.svg"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              setSelectedFile(file);
              if (!newIconName) {
                setNewIconName(file.name.replace(/\.svg$/i, ""));
              }
            }
            event.target.value = "";
          }}
        />
      </div>

      <div className="icon-library-search">
        <Search size={16} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search icons..."
          aria-label="Search icons"
        />
      </div>

      {categories.length > 0 && (
        <div className="icon-library-categories">
          {categories.map((category) => (
            <span className="icon-library-chip" key={category}>{category}</span>
          ))}
        </div>
      )}

      {error && <div className="icon-library-error">{error}</div>}

      {addDialogOpen && (
        <div className="icon-library-dialog-backdrop" role="presentation">
          <form
            className="icon-library-dialog"
            onSubmit={(event) => {
              event.preventDefault();
              void handleUpload();
            }}
          >
            <div className="icon-library-dialog-header">
              <h2>Add SVG Icon</h2>
              <button type="button" onClick={() => setAddDialogOpen(false)} aria-label="Close add icon dialog">
                <X size={18} />
              </button>
            </div>
            <p className="icon-library-dialog-help">Add the icon file and its searchable library details.</p>
            <button className="icon-library-file-picker" type="button" onClick={() => fileInputRef.current?.click()}>
              <ImageIcon size={18} />
              <span>{selectedFile ? selectedFile.name : "Choose SVG file"}</span>
            </button>
            <label>Name<input value={newIconName} onChange={(event) => setNewIconName(event.target.value)} placeholder="Factory" /></label>
            <label>Category<input value={newIconCategory} onChange={(event) => setNewIconCategory(event.target.value)} placeholder="Industrial" /></label>
            <label>Tags<input value={newIconTags} onChange={(event) => setNewIconTags(event.target.value)} placeholder="factory, automation, industry" /></label>
            <label>Style<input value={newIconStyle} onChange={(event) => setNewIconStyle(event.target.value)} placeholder="Outline" /></label>
            <label>Description<textarea value={newIconDescription} onChange={(event) => setNewIconDescription(event.target.value)} placeholder="Short description" rows={3} /></label>
            <div className="icon-library-dialog-actions">
              <button type="button" className="settings-cancel-button" onClick={() => setAddDialogOpen(false)}>Cancel</button>
              <button type="submit" className="settings-add-button" disabled={uploading}>
                {uploading ? <Loader2 className="spin" size={16} /> : <Plus size={16} />} Add Icon
              </button>
            </div>
          </form>
        </div>
      )}

      {editDialogOpen && selected && (
        <div className="icon-library-dialog-backdrop" role="presentation">
          <form
            className="icon-library-dialog"
            onSubmit={(event) => {
              event.preventDefault();
              void handleUpdate();
            }}
          >
            <div className="icon-library-dialog-header">
              <h2>Edit Icon Metadata</h2>
              <button type="button" onClick={() => setEditDialogOpen(false)} aria-label="Close edit icon dialog">
                <X size={18} />
              </button>
            </div>
            <p className="icon-library-dialog-help">Update how this icon is named and found by search.</p>
            <label>Name<input value={newIconName} onChange={(event) => setNewIconName(event.target.value)} /></label>
            <label>Category<input value={newIconCategory} onChange={(event) => setNewIconCategory(event.target.value)} /></label>
            <label>Tags<input value={newIconTags} onChange={(event) => setNewIconTags(event.target.value)} /></label>
            <label>Style<input value={newIconStyle} onChange={(event) => setNewIconStyle(event.target.value)} /></label>
            <label>Description<textarea value={newIconDescription} onChange={(event) => setNewIconDescription(event.target.value)} rows={3} /></label>
            <div className="icon-library-dialog-actions">
              <button type="button" className="settings-cancel-button" onClick={() => setEditDialogOpen(false)}>Cancel</button>
              <button type="submit" className="settings-add-button" disabled={uploading}>
                {uploading ? <Loader2 className="spin" size={16} /> : null} Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="icon-library-body">
        <div className="icon-library-grid" aria-live="polite">
          {loading ? (
            <div className="icon-library-empty"><Loader2 className="spin" size={22} /> Loading icons...</div>
          ) : icons.length === 0 ? (
            <div className="icon-library-empty"><ImageIcon size={24} /> No icons found.</div>
          ) : icons.map((icon) => (
            <button
              className={`icon-library-card ${selected?.icon_id === icon.icon_id ? "selected" : ""}`}
              key={icon.icon_id}
              onClick={() => setSelected(icon)}
              type="button"
            >
              <img src={libraryIconDownloadUrl(icon.icon_id)} alt={icon.name} />
              <span>{icon.name}</span>
              <small>{icon.source.replace("_", " ")}</small>
            </button>
          ))}
        </div>

        {selected && (
          <aside className="icon-library-details">
            <button className="icon-library-close" onClick={() => setSelected(null)} type="button" aria-label="Close details">
              <X size={16} />
            </button>
            <img src={libraryIconDownloadUrl(selected.icon_id)} alt={selected.name} />
            <h3>{selected.name}</h3>
            <p>{selected.description || "No description"}</p>
            <dl>
              <dt>Category</dt><dd>{selected.category || "—"}</dd>
              <dt>Source</dt><dd>{selected.source.replace("_", " ")}</dd>
              <dt>Style</dt><dd>{selected.style || "—"}</dd>
            </dl>
            <div className="icon-library-detail-actions">
              <a href={libraryIconDownloadUrl(selected.icon_id)} download={`${selected.name}.svg`} className="settings-download-button">
                <Download size={16} /> Download SVG
              </a>
              {selected.source !== "built_in" && (
                <button className="settings-edit-button" onClick={openEditDialog} type="button">
                  Edit Metadata
                </button>
              )}
              {selected.source !== "built_in" && (
                <button className="settings-delete-button" onClick={() => void handleDelete()} type="button">
                  <Trash2 size={16} /> Delete
                </button>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
