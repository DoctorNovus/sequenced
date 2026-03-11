import { useEffect, useMemo, useRef, useState } from "react";
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
import { useAnnouncementRenderer } from "@/utils/announcementRenderer";

const TIDALTASK_PREFIX = "tidaltask:";
const LEGACY_SEQUENCED_PREFIX = "sequenced:";

export default function AnnouncementCenter() {
    const auth = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const { renderBody } = useAnnouncementRenderer();
    const markRead = useMarkAnnouncementsRead();
    const trackView = useTrackAnnouncementView();
    const trackClick = useTrackAnnouncementClick();

    const isAuthRoute = location.pathname.startsWith("/auth");
    const isLoggedIn = auth.isSuccess && (auth.data?.message === "Logged In" || !auth.data?.statusCode);

    const unreadQuery = useUnreadAnnouncements(Boolean(isLoggedIn && !isAuthRoute));
    const [dismissedIds, setDismissedIds] = useState<string[]>([]);
    const viewedIdsRef = useRef<Set<string>>(new Set());

    const current = useMemo(
        () => {
            const announcements = unreadQuery.data ?? [];
            return announcements.find((announcement) => !dismissedIds.includes(announcement.id));
        },
        [unreadQuery.data, dismissedIds]
    );

    useEffect(() => {
        if (!current?.id || viewedIdsRef.current.has(current.id)) return;
        viewedIdsRef.current.add(current.id);
        trackView.mutate(current.id, {
            onError: (error) => Logger.logWarning(String(error))
        });
    }, [current?.id, trackView]);

    if (!isLoggedIn || isAuthRoute || !current) {
        return null;
    }

    const performAction = (action: string) => {
        const localAction = action.startsWith(TIDALTASK_PREFIX)
            ? action.slice(TIDALTASK_PREFIX.length).trim().toLowerCase()
            : action.startsWith(LEGACY_SEQUENCED_PREFIX)
                ? action.slice(LEGACY_SEQUENCED_PREFIX.length).trim().toLowerCase()
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
