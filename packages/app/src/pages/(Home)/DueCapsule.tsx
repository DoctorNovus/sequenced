interface DueCapsule {
    skeleton?: boolean;
    count?: number;
    category?: string;
    onClick?: (e: React.MouseEvent) => void;
}

export default function DueCapsule({ skeleton, count, category, onClick }: DueCapsule) {
    if (skeleton)
        return (
            <div className="relative flex h-full items-center overflow-hidden rounded-2xl surface-card border p-3 shadow-xs ring-1 ring-accent-blue/15">
                <div className="absolute inset-0 inset-shadow-xs" />
                <div className="relative flex w-full flex-row items-center justify-between text-sm font-semibold text-primary">
                    <span className="text-lg text-accent-blue-800">0</span>
                    <span className="text-sm text-muted">Tasks Due {category}</span>
                </div>
            </div>
        )

    return (
        <button
            type="button"
            onClick={onClick}
            className="relative flex h-full items-center overflow-hidden rounded-2xl surface-card border p-3 shadow-xs ring-1 ring-accent-blue/15 text-left transition hover:border-accent-blue/40 hover:ring-accent-blue/30"
        >
            <div className="absolute inset-0 inset-shadow-xs" />
            <div className="relative flex w-full flex-row items-center justify-between text-primary">
                <span className="text-xl font-semibold text-accent-blue-800">{count}</span>
                <span className="text-sm font-semibold text-muted leading-tight text-right">
                    {count != 1 ? "Tasks" : "Task"} due {category}
                </span>
            </div>
        </button>
    )
}
