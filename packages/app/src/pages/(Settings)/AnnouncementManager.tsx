import { FormEvent, ReactNode, useMemo, useState } from "react";
import {
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
  useAllAnnouncements,
  useCreateAnnouncement,
  useDeleteAnnouncement,
  useUpdateAnnouncement
} from "@/hooks/announcements";

const toLocalInputDate = (value?: string | Date) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return "";

  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
};

const formatDate = (value?: string) => {
  if (!value) return "Unknown date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

type TextPart = { type: "text"; value: string; key: string };
type LinkPart = { type: "link"; label: string; href: string; key: string };
type BodyPart = TextPart | LinkPart;
type AnnouncementActor = {
  id: string;
  first: string;
  last: string;
  email: string;
};

export default function AnnouncementManager() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [date, setDate] = useState(toLocalInputDate());
  const [ctaTitle, setCtaTitle] = useState("");
  const [ctaAction, setCtaAction] = useState("");
  const [active, setActive] = useState(true);
  const [status, setStatus] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const createAnnouncement = useCreateAnnouncement();
  const updateAnnouncement = useUpdateAnnouncement();
  const deleteAnnouncement = useDeleteAnnouncement();
  const announcements = useAllAnnouncements(true);

  const sortedAnnouncements = useMemo(
    () => (announcements.data ?? []).slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [announcements.data]
  );

  const getActors = (items: unknown[]): AnnouncementActor[] => {
    const actors: AnnouncementActor[] = [];

    for (const item of items) {
      if (!item || typeof item !== "object") continue;
      const candidate = item as Partial<AnnouncementActor>;
      if (!candidate.id) continue;
      actors.push({
        id: String(candidate.id),
        first: String(candidate.first ?? ""),
        last: String(candidate.last ?? ""),
        email: String(candidate.email ?? "")
      });
    }

    return actors;
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setBody("");
    setDate(toLocalInputDate());
    setCtaTitle("");
    setCtaAction("");
    setActive(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("");

    const commonPayload = {
      title: title.trim(),
      body: body.trim(),
      date: date ? new Date(date).toISOString() : undefined,
      ctaTitle: ctaTitle.trim() || undefined,
      ctaAction: ctaAction.trim() || undefined,
      active
    };

    try {
      if (editingId) {
        const payload: UpdateAnnouncementInput = {
          id: editingId,
          ...commonPayload
        };
        await updateAnnouncement.mutateAsync(payload);
        setStatus("Announcement updated.");
      } else {
        const payload: CreateAnnouncementInput = commonPayload;
        await createAnnouncement.mutateAsync(payload);
        setStatus("Announcement published.");
      }

      resetForm();
    } catch (error: unknown) {
      setStatus(getErrorMessage(error, editingId ? "Unable to update announcement." : "Unable to publish announcement."));
    }
  };

  const startEdit = (id: string) => {
    const selected = sortedAnnouncements.find((item) => item.id === id);
    if (!selected) return;

    setEditingId(selected.id);
    setTitle(selected.title);
    setBody(selected.body);
    setDate(toLocalInputDate(selected.date));
    setCtaTitle(selected.ctaTitle || "");
    setCtaAction(selected.ctaAction || "");
    setActive(Boolean(selected.active));
    setStatus("");
  };

  const handleDelete = async (id: string) => {
    setStatus("");
    try {
      await deleteAnnouncement.mutateAsync(id);
      setStatus("Announcement deleted.");
      if (editingId === id) {
        resetForm();
      }
    } catch (error: unknown) {
      setStatus(getErrorMessage(error, "Unable to delete announcement."));
    }
  };

  const isSubmitting = createAnnouncement.isPending || updateAnnouncement.isPending;
  const previewDate = date ? new Date(date) : new Date();
  const previewDateText = Number.isNaN(previewDate.getTime()) ? "Invalid date" : previewDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  const renderInline = (text: string, keyPrefix: string) => {
    const parts: BodyPart[] = [];
    let lastIndex = 0;
    let linkIndex = 0;
    const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match: RegExpExecArray | null = linkPattern.exec(text);

    while (match) {
      const [fullMatch, label, href] = match;
      const start = match.index;

      if (start > lastIndex) {
        parts.push({
          type: "text",
          value: text.slice(lastIndex, start),
          key: `${keyPrefix}-text-${start}`
        });
      }

      parts.push({
        type: "link",
        label: label.trim() || href.trim(),
        href: href.trim(),
        key: `${keyPrefix}-link-${linkIndex++}`
      });

      lastIndex = start + fullMatch.length;
      match = linkPattern.exec(text);
    }

    if (lastIndex < text.length) {
      parts.push({
        type: "text",
        value: text.slice(lastIndex),
        key: `${keyPrefix}-text-${lastIndex}`
      });
    }

    if (!parts.length) {
      parts.push({ type: "text", value: text, key: `${keyPrefix}-text-empty` });
    }

    return parts.map((part) => {
      if (part.type === "text") {
        return <span key={part.key}>{part.value}</span>;
      }

      const isInternal = part.href.startsWith("/");
      const isExternal = part.href.startsWith("http://") || part.href.startsWith("https://");
      const canOpen = isInternal || isExternal;
      if (!canOpen) {
        return <span key={part.key}>{`[${part.label}](${part.href})`}</span>;
      }

      return (
        <a
          key={part.key}
          href={part.href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-accent-blue underline"
        >
          {part.label}
        </a>
      );
    });
  };

  const renderMarkdownBody = (markdown: string) => {
    const lines = markdown.split("\n");
    const nodes: ReactNode[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      const keyPrefix = `preview-line-${i}`;

      if (!trimmed) {
        nodes.push(<div key={keyPrefix} className="h-2" />);
        continue;
      }

      if (trimmed.startsWith("### ")) {
        nodes.push(
          <h4 key={keyPrefix} className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">
            {renderInline(trimmed.slice(4), keyPrefix)}
          </h4>
        );
        continue;
      }

      if (trimmed.startsWith("## ")) {
        nodes.push(
          <h3 key={keyPrefix} className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
            {renderInline(trimmed.slice(3), keyPrefix)}
          </h3>
        );
        continue;
      }

      if (trimmed.startsWith("# ")) {
        nodes.push(
          <h2 key={keyPrefix} className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">
            {renderInline(trimmed.slice(2), keyPrefix)}
          </h2>
        );
        continue;
      }

      if (trimmed.startsWith("- ")) {
        const items: ReactNode[] = [];
        let listIndex = i;

        while (listIndex < lines.length) {
          const listLine = lines[listIndex].trim();
          if (!listLine.startsWith("- ")) break;
          const itemKey = `preview-line-${listIndex}`;
          items.push(
            <li key={itemKey} className="ml-5 list-disc">
              {renderInline(listLine.slice(2), itemKey)}
            </li>
          );
          listIndex++;
        }

        nodes.push(
          <ul key={keyPrefix} className="space-y-1 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            {items}
          </ul>
        );
        i = listIndex - 1;
        continue;
      }

      nodes.push(
        <p key={keyPrefix} className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
          {renderInline(line, keyPrefix)}
        </p>
      );
    }

    return nodes;
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-primary">Announcements</h3>
        <p className="text-sm text-muted">Create popups shown to users until they read them.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-3">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Title"
          className="rounded-lg border border-accent-blue/20 bg-white px-3 py-2 text-sm"
          required
        />

        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Announcement body"
          className="min-h-24 rounded-lg border border-accent-blue/20 bg-white px-3 py-2 text-sm"
          required
        />

        <input
          type="datetime-local"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="rounded-lg border border-accent-blue/20 bg-white px-3 py-2 text-sm"
        />

        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={ctaTitle}
            onChange={(event) => setCtaTitle(event.target.value)}
            placeholder="CTA title (optional)"
            className="rounded-lg border border-accent-blue/20 bg-white px-3 py-2 text-sm"
          />
          <input
            value={ctaAction}
            onChange={(event) => setCtaAction(event.target.value)}
            placeholder='CTA action (https://... or tidaltask:open-settings)'
            className="rounded-lg border border-accent-blue/20 bg-white px-3 py-2 text-sm"
          />
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-primary">
          <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />
          Active
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="submit"
            className="w-fit rounded-lg bg-accent-blue px-4 py-2 text-sm font-semibold text-white hover:bg-accent-blue-700 disabled:opacity-70"
            disabled={isSubmitting}
          >
            {editingId ? "Save Changes" : "Publish Announcement"}
          </button>
          {editingId && (
            <button
              type="button"
              className="w-fit rounded-lg border border-accent-blue/25 px-4 py-2 text-sm font-semibold text-primary"
              onClick={resetForm}
            >
              Cancel Edit
            </button>
          )}
        </div>

        {status && <p className="text-sm text-muted">{status}</p>}
      </form>

      <div className="space-y-2 border-t border-accent-blue/20 pt-4">
        <h4 className="text-sm font-semibold text-primary">Preview</h4>
        <div className="w-full rounded-2xl bg-white shadow-xl ring-1 ring-accent-blue/20 dark:bg-slate-900 dark:ring-slate-700">
          <div className="border-b border-accent-blue/15 px-5 py-4 dark:border-slate-700">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Announcement</p>
            <h2 className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">{title.trim() || "Untitled announcement"}</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{previewDateText}</p>
          </div>
          <div className="max-h-60 space-y-2 overflow-y-auto px-5 py-4">
            {renderMarkdownBody(body || "Add body text to preview announcement content.")}
          </div>
          {ctaTitle.trim() && ctaAction.trim() && (
            <div className="border-t border-accent-blue/15 px-5 py-4 dark:border-slate-700">
              <button
                type="button"
                className="rounded-lg bg-accent-blue px-4 py-2 text-sm font-semibold text-white"
              >
                {ctaTitle.trim()}
              </button>
              <p className="mt-2 text-xs text-muted">Action: {ctaAction.trim()}</p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2 border-t border-accent-blue/20 pt-4">
        <h4 className="text-sm font-semibold text-primary">Recent announcements</h4>
        <div className="max-h-52 space-y-2 overflow-y-auto pr-2">
          {sortedAnnouncements.length === 0 && <p className="text-sm text-muted">No announcements yet.</p>}
          {sortedAnnouncements.map((item) => (
            <div key={item.id} className="rounded-lg border border-accent-blue/15 bg-white/70 px-3 py-2 text-sm">
              {(() => {
                const viewers = getActors(Array.isArray(item.viewedBy) ? item.viewedBy : []);
                const clickers = getActors(Array.isArray(item.clickedBy) ? item.clickedBy : []);

                return (
                  <>
              <p className="font-semibold text-primary">{item.title}</p>
              <p className="text-xs text-muted">{formatDate(item.date)} {item.active ? "| active" : "| inactive"}</p>
              <p className="mt-1 text-xs text-muted">Viewed: {viewers.length} | CTA clicked: {clickers.length}</p>
              <details className="mt-1">
                <summary className="cursor-pointer text-xs font-semibold text-primary">Viewers</summary>
                <div className="mt-1 space-y-1 text-xs text-muted">
                  {viewers.length === 0 && <p>No viewers yet.</p>}
                  {viewers.map((user) => (
                    <p key={`${item.id}-viewer-${user.id}`}>{`${user.first} ${user.last}`.trim() || user.email} ({user.email})</p>
                  ))}
                </div>
              </details>
              <details className="mt-1">
                <summary className="cursor-pointer text-xs font-semibold text-primary">CTA Clickers</summary>
                <div className="mt-1 space-y-1 text-xs text-muted">
                  {clickers.length === 0 && <p>No CTA clicks yet.</p>}
                  {clickers.map((user) => (
                    <p key={`${item.id}-clicker-${user.id}`}>{`${user.first} ${user.last}`.trim() || user.email} ({user.email})</p>
                  ))}
                </div>
              </details>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  className="rounded-md border border-accent-blue/25 px-2 py-1 text-xs font-semibold text-primary"
                  onClick={() => startEdit(item.id)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="rounded-md border border-red-300 px-2 py-1 text-xs font-semibold text-red-700"
                  onClick={() => handleDelete(item.id)}
                  disabled={deleteAnnouncement.isPending}
                >
                  Delete
                </button>
              </div>
                  </>
                );
              })()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
