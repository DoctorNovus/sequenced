import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import { useAllAnnouncements } from "@/hooks/announcements";
import { useAnnouncementRenderer } from "@/utils/announcementRenderer";

export default function WhatsNew() {
    const { data: announcements, isLoading } = useAllAnnouncements();
    const [openId, setOpenId] = useState<string | null>(null);
    const { renderBody } = useAnnouncementRenderer();

    const sorted = [...(announcements ?? [])].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return (
        <div className="flex flex-col gap-3">
            <div>
                <h2 className="text-lg font-semibold text-primary">What's New</h2>
                <p className="text-sm text-muted">Browse past announcements and updates.</p>
            </div>

            {isLoading && (
                <div className="flex flex-col gap-2">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
                    ))}
                </div>
            )}

            {!isLoading && sorted.length === 0 && (
                <p className="text-sm text-muted px-1">No announcements yet.</p>
            )}

            {sorted.map((announcement) => {
                const isOpen = openId === announcement.id;
                const formattedDate = new Date(announcement.date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                });

                return (
                    <div
                        key={announcement.id}
                        className="rounded-xl border border-accent-blue/15 bg-white/80 dark:bg-slate-800/60 overflow-hidden"
                    >
                        <button
                            type="button"
                            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-accent-blue/5 transition"
                            onClick={() => setOpenId(isOpen ? null : announcement.id)}
                        >
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-semibold text-primary truncate">{announcement.title}</span>
                                <span className="text-xs text-muted">{formattedDate}</span>
                            </div>
                            {isOpen
                                ? <ChevronUpIcon className="h-4 w-4 flex-shrink-0 text-muted" />
                                : <ChevronDownIcon className="h-4 w-4 flex-shrink-0 text-muted" />
                            }
                        </button>

                        {isOpen && (
                            <div className="border-t border-accent-blue/10 px-4 py-4 space-y-2">
                                {renderBody(announcement.body)}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
