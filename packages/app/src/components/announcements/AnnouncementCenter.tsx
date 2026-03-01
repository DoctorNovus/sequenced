import { ReactNode, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "@/hooks/auth";
import {
    Announcement,
    useMarkAnnouncementsRead,
    useTrackAnnouncementClick,
    useTrackAnnouncementView,
    useUnreadAnnouncements
} from "@/hooks/announcements";
import { Logger } from "@/utils/logger";

const SEQUENCED_PREFIX = "sequenced:";
const LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g;

type TextPart = { type: "text"; value: string; key: string };
type LinkPart = { type: "link"; label: string; href: string; key: string };
type BodyPart = TextPart | LinkPart;

export default function AnnouncementCenter() {
    const auth = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const markRead = useMarkAnnouncementsRead();
    const trackView = useTrackAnnouncementView();
    const trackClick = useTrackAnnouncementClick();

    const isAuthRoute = location.pathname.startsWith("/auth");
    const isLoggedIn = auth.isSuccess && (auth.data?.message === "Logged In" || !auth.data?.statusCode);

    const unreadQuery = useUnreadAnnouncements(Boolean(isLoggedIn && !isAuthRoute));
    const [dismissedIds, setDismissedIds] = useState<string[]>([]);
    const [viewTrackedIds, setViewTrackedIds] = useState<string[]>([]);

    const current = useMemo(
        () => {
            const announcements = unreadQuery.data ?? [];
            return announcements.find((announcement) => !dismissedIds.includes(announcement.id));
        },
        [unreadQuery.data, dismissedIds]
    );

    useEffect(() => {
        if (!current?.id || viewTrackedIds.includes(current.id)) return;
        setViewTrackedIds((ids) => ids.includes(current.id) ? ids : [...ids, current.id]);
        trackView.mutate(current.id, {
            onError: (error) => Logger.logWarning(String(error))
        });
    }, [current?.id, viewTrackedIds, trackView]);

    if (!isLoggedIn || isAuthRoute || !current) {
        return null;
    }

    const performAction = (action: string) => {
        const localAction = action.startsWith(SEQUENCED_PREFIX)
            ? action.slice(SEQUENCED_PREFIX.length).trim().toLowerCase()
            : "";

        if (localAction) {
            switch (localAction) {
                case "open-settings":
                    navigate("/settings");
                    return;
                case "open-calendar":
                    navigate("/calendar");
                    return;
                case "open-tasks":
                    navigate("/tasks");
                    return;
                case "refresh":
                    window.location.reload();
                    return;
                default:
                    Logger.logWarning(`Unknown local announcement action: ${localAction}`);
                    return;
            }
        }

        if (action.startsWith("/")) {
            navigate(action);
            return;
        }

        window.open(action, "_blank", "noopener,noreferrer");
    };

    const nextAnnouncement = async (announcement: Announcement) => {
        setDismissedIds((ids) => ids.includes(announcement.id) ? ids : [...ids, announcement.id]);

        try {
            await markRead.mutateAsync([announcement.id]);
        } catch (error) {
            Logger.logWarning(String(error));
        }
    };

    const formattedDate = new Date(current.date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric"
    });

    const renderInline = (text: string, keyPrefix: string) => {
        const parts: BodyPart[] = [];
        let lastIndex = 0;
        let linkIndex = 0;
        LINK_PATTERN.lastIndex = 0;
        let match: RegExpExecArray | null = LINK_PATTERN.exec(text);

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
            match = LINK_PATTERN.exec(text);
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
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    className="font-semibold text-accent-blue underline"
                    onClick={(event) => {
                        if (isInternal) {
                            event.preventDefault();
                            navigate(part.href);
                        }
                    }}
                >
                    {part.label}
                </a>
            );
        });
    };

    const renderBody = (body: string) => {
        const lines = body.split("\n");
        const nodes: ReactNode[] = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            const keyPrefix = `line-${i}`;

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
                    const itemKey = `line-${listIndex}`;
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
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-8"
            onClick={() => {
                if (!markRead.isPending) {
                    void nextAnnouncement(current);
                }
            }}
        >
            <div
                className="w-full max-w-xl rounded-2xl bg-white shadow-xl ring-1 ring-accent-blue/20 dark:bg-slate-900 dark:ring-slate-700"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="border-b border-accent-blue/15 px-5 py-4 dark:border-slate-700">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{current.title}</h2>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formattedDate}</p>
                </div>

                <div className="max-h-[45vh] space-y-2 overflow-y-auto px-5 py-4">
                    {renderBody(current.body)}
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-accent-blue/15 px-5 py-4 dark:border-slate-700">
                    <button
                        type="button"
                        className="rounded-lg border border-accent-blue/30 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-accent-blue-50 dark:text-slate-100 dark:hover:bg-slate-800"
                        onClick={() => nextAnnouncement(current)}
                        disabled={markRead.isPending}
                    >
                        Close
                    </button>
                    {current.ctaTitle && current.ctaAction && (
                        <button
                            type="button"
                            className="rounded-lg bg-accent-blue px-4 py-2 text-sm font-semibold text-white hover:bg-accent-blue-700 disabled:opacity-70"
                            onClick={async () => {
                                performAction(current.ctaAction as string);
                                trackClick.mutate(current.id, {
                                    onError: (error) => Logger.logWarning(String(error))
                                });
                                await nextAnnouncement(current);
                            }}
                            disabled={markRead.isPending}
                        >
                            {current.ctaTitle}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
