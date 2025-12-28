export default function DueCapsule({ skeleton, count, category, important, onClick }) {
    if (skeleton)
        return (
            <div className="relative flex h-full items-center overflow-hidden rounded-2xl surface-card border p-3 shadow-sm ring-1 ring-accent-blue/15">
                <div className="absolute inset-0 inset-shadow-sm" />
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
            className="relative flex h-full items-center overflow-hidden rounded-2xl surface-card border p-3 shadow-sm ring-1 ring-accent-blue/15 text-left transition hover:-translate-y-px"
        >
            <div className="absolute inset-0 inset-shadow-sm" />
            <div className="relative flex w-full flex-col items-start gap-1 text-primary">
                <span className="text-xl font-semibold text-accent-blue-800">{count}</span>
                <span className="text-sm font-semibold text-muted leading-tight">
                    {count != 1 ? "Tasks" : "Task"} due {category}
                </span>
            </div>
        </button>
    )
}
