interface DueCapsule {
    skeleton?: boolean;
    count?: number;
    category?: string;
    onClick?: (e: React.MouseEvent) => void;
}

const variants: Record<string, { bg: string; countColor: string; labelColor: string }> = {
    today: {
        bg: "bg-accent-blue-50 dark:bg-[rgba(48,122,207,0.14)]",
        countColor: "text-accent-blue-700 dark:text-accent-blue-300",
        labelColor: "text-accent-blue-600/80 dark:text-accent-blue-300/80",
    },
    tomorrow: {
        bg: "bg-amber-50 dark:bg-[rgba(245,158,11,0.13)]",
        countColor: "text-amber-700 dark:text-amber-300",
        labelColor: "text-amber-600/80 dark:text-amber-300/80",
    },
    "this week": {
        bg: "bg-violet-50 dark:bg-[rgba(139,92,246,0.13)]",
        countColor: "text-violet-700 dark:text-violet-300",
        labelColor: "text-violet-600/80 dark:text-violet-300/80",
    },
};

export default function DueCapsule({ skeleton, count, category, onClick }: DueCapsule) {
    const v = variants[category ?? "today"] ?? variants.today;

    if (skeleton)
        return (
            <div className={`relative flex h-full flex-col gap-0.5 overflow-hidden rounded-2xl ${v.bg} px-4 py-3`}>
                <span className={`text-2xl font-bold ${v.countColor}`}>0</span>
                <span className={`text-xs font-semibold leading-tight ${v.labelColor}`}>
                    Tasks due {category}
                </span>
            </div>
        )

    return (
        <button
            type="button"
            onClick={onClick}
            className={`relative flex h-full w-full flex-col gap-0.5 overflow-hidden rounded-2xl ${v.bg} px-4 py-3 text-left transition hover:brightness-95 dark:hover:brightness-110`}
        >
            <span className={`text-2xl font-bold ${v.countColor}`}>{count}</span>
            <span className={`text-xs font-semibold leading-tight ${v.labelColor}`}>
                {count !== 1 ? "Tasks" : "Task"} due {category}
            </span>
        </button>
    )
}
