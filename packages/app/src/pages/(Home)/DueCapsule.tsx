export default function DueCapsule({ skeleton, count, category, important }) {
    if (skeleton)
        return (
            <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-b from-white/90 to-accent-blue-50/60 p-4 shadow-lg ring-1 ring-accent-blue/10">
                <div className="absolute inset-0 inset-shadow-sm" />
                <div className="flex justify-between items-start text-xs font-semibold text-accent-blue-700">
                    <span>Tasks</span>
                    <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px]">Syncing</span>
                </div>
                <div className="relative flex flex-col items-start gap-2">
                    <span className={`${important ? "text-5xl" : "text-3xl"} font-semibold text-accent-blue-800`}>0</span>
                    <span className="text-base font-medium text-slate-500">Tasks Due {category}</span>
                </div>
            </div>
        )

    return (
        <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-b from-white/90 to-accent-blue-50/60 p-4 shadow-lg ring-1 ring-accent-blue/10">
            <div className="absolute inset-0 inset-shadow-sm" />
            <div className="flex justify-between items-start text-xs font-semibold text-accent-blue-700">
                <span>Tasks</span>
            </div>
            <div className="relative flex flex-col items-start gap-2">
                <span className={`${important ? "text-5xl" : "text-3xl"} font-semibold text-accent-blue-800`}>{count}</span>
                <span className="text-base font-medium text-slate-500">{count != 1 ? "Tasks" : "Task"} {category}</span>
            </div>
        </div>
    )
}
