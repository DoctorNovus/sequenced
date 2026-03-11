import { formatDateTime } from "@/utils/date";
import TaskInfoMenuItem from "./Shared/TaskInfoMenuItem";
import TaskInfoMenuUser from "./Shared/TaskInfoUser/TaskInfoMenuUser";
import TaskInfoMenuTags from "./Shared/TaskInfoMenuTags";
import TaskInfoMenuSelect from "./Shared/TaskInfoMenuSelect";


interface MenuFieldsProps {
    type: string | undefined;
    isDeleting: boolean;
    tempData: any;
    setTempData: any;
    changeAppDate: any;
    appData: any;
    setAppData: any;
    quickTasksInput: string;
    setQuickTasksInput: any;
    isQuickAdd: boolean;
    setIsQuickAdd: any;
    validationError: string | null;
}

export default function MenuFields({
    type,
    isDeleting,
    tempData,
    setTempData,
    changeAppDate,
    appData,
    setAppData,
    quickTasksInput,
    setQuickTasksInput,
    isQuickAdd,
    setIsQuickAdd,
    validationError
}: MenuFieldsProps) {
    return (
        <div className={`flex flex-col gap-4 ${isDeleting && "blur-xs"}`}>
            {type === "add" && (
                <div className="flex flex-col gap-2 rounded-xl border border-accent-blue/15 bg-accent-blue-50/40 px-3 py-3 dark:bg-[rgba(99,102,241,0.12)]">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-primary">Quick add</span>
                            <span className="text-xs text-muted">Create multiple tasks at once.</span>
                        </div>
                        <label className="flex items-center gap-2 text-xs text-muted">
                            <input
                                type="checkbox"
                                className="h-4 w-4"
                                checked={isQuickAdd}
                                onChange={(e) => {
                                    setIsQuickAdd(e.target.checked);
                                    if (e.target.checked) {
                                        setTempData({ group: "", groupPublic: false });
                                    }
                                }}
                            />
                            Enable
                        </label>
                    </div>
                    {isQuickAdd && (
                        <TaskInfoMenuItem
                            name="Tasks (one per line)"
                            type="textarea"
                            placeholder="Pick up meds&#10;Email client&#10;Water plants"
                            value={quickTasksInput}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setQuickTasksInput(e.target.value)
                            }
                        />
                    )}
                    {isQuickAdd && (
                        <div className="flex flex-col gap-3">
                            {/* Date & Time */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-primary px-1">Date &amp; Time</label>
                                <input
                                    type="datetime-local"
                                    className="text-sm px-3 py-2 rounded-xl border border-accent-blue/30 bg-white text-primary shadow-inner focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/30 focus:outline-hidden dark:bg-[rgba(15,23,42,0.85)] dark:border-accent-blue/40"
                                    value={formatDateTime(tempData.date instanceof Date && tempData.date.getTime() > 0 ? tempData.date : new Date())}
                                    onChange={(e) => setTempData({ date: new Date(e.target.value) })}
                                />
                            </div>

                            {/* Group */}
                            <TaskInfoMenuItem
                                name="Group"
                                value={tempData.group || ""}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    setTempData({ group: e.target.value.toLowerCase() })
                                }
                                placeholder="Optional group label"
                            />

                            {/* Tags */}
                            <TaskInfoMenuTags
                                tags={tempData.tags ?? []}
                                onChange={(tags) => setTempData({ tags })}
                                helperText="Tags will be applied to every task you add."
                            />
                        </div>
                    )}
                    {isQuickAdd && validationError && (
                        <span className="px-1 text-sm font-semibold text-accent-red-500">
                            {validationError}
                        </span>
                    )}
                </div>
            )}
            {!isQuickAdd && (
                <>
                    <TaskInfoMenuItem
                        name="Name"
                        value={tempData?.title}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setTempData({ ...tempData, title: e.target.value })
                        }
                    />
                    <div className="flex flex-col gap-1">
                        <TaskInfoMenuItem
                            name="Group"
                            value={tempData?.group || ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setTempData({ ...tempData, group: e.target.value.toLowerCase() })
                            }
                            placeholder="Optional group label"
                        />
                        {tempData?.group?.trim() && (
                            <label className="flex items-center gap-2 px-1 mt-1 cursor-pointer w-fit">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded"
                                    checked={!!tempData.groupPublic}
                                    onChange={(e) => setTempData({ ...tempData, groupPublic: e.target.checked })}
                                />
                                <span className="text-xs font-semibold text-muted">Team-wide</span>
                            </label>
                        )}
                    </div>
                    {!isQuickAdd && validationError && (
                        <span className="px-1 text-sm font-semibold text-accent-red-500">
                            {validationError}
                        </span>
                    )}

                    <TaskInfoMenuItem
                        name="Description"
                        type="textarea"
                        value={tempData.description}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setTempData({ ...tempData, description: e.target.value })
                        }
                    />

                    <TaskInfoMenuTags
                        tags={tempData.tags ?? []}
                        onChange={(tags) => setTempData({ ...tempData, tags })}
                    />

                    <TaskInfoMenuSelect
                        name="Repeating"
                        value={tempData.repeater}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                            setTempData({ repeater: e.target.value });
                        }}
                        options={[
                            { name: "Do Not Repeat", value: "" },
                            { name: "Every Day", value: "daily" },
                            { name: "Every Week", value: "weekly" },
                            { name: "Every 2 Weeks", value: "bi-weekly" },
                            { name: "Every Month", value: "monthly" },
                        ]}
                    />
                    <span className="text-xs text-muted px-1">
                        Repeating tasks can be completed once per due day; completion is tracked per occurrence.
                    </span>

                    {tempData.date.getTime() > 0 && (
                        <TaskInfoMenuItem
                            name="Due Date"
                            type="datetime-local"
                            value={formatDateTime(tempData.date)}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const newDate = new Date(e.target.value);
                                setTempData({
                                    ...tempData,
                                    date: newDate,
                                });
                            }}
                        />
                    )}

                    {/* TODO: Make Component [DELETE DUE DATE] */}
                    <div className="my-2 flex">
                        <button
                            onClick={() => {
                                const noDate = new Date(0);
                                const isRemoving = tempData.date.getTime() > 0;

                                if (isRemoving) {
                                    setAppData({
                                        ...appData,
                                        storedDate: tempData.date,
                                    });

                                    setTempData({
                                        ...tempData,
                                        date: noDate
                                    });
                                } else {
                                    const restoredDate = appData.storedDate ?? new Date();

                                    setAppData({
                                        ...appData,
                                        activeDate: restoredDate,
                                        storedDate: undefined
                                    });

                                    setTempData({
                                        ...tempData,
                                        date: restoredDate
                                    });
                                }
                            }}
                            className={`w-40 text-center rounded-xl px-3 py-2 text-sm font-semibold shadow-xs transition ${tempData.date.getTime() > 0
                                ? "bg-accent-red-500 text-white hover:-translate-y-px"
                                : "bg-accent-blue text-white hover:-translate-y-px"
                                }`}
                        >
                            {tempData.date.getTime() > 0 && "Remove Due Date"}
                            {tempData.date.getTime() <= 0 && "Add Due Date"}
                        </button>
                    </div>

                    {type == "edit" && <TaskInfoMenuUser data={tempData} />}

                    <div className="flex flex-col gap-2">
                        <span className="text-sm font-semibold text-primary px-1">Priority</span>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { label: "High", value: 3, color: "from-rose-500 to-rose-400" },
                                { label: "Medium", value: 2, color: "from-amber-500 to-amber-400" },
                                { label: "Low", value: 1, color: "from-emerald-500 to-emerald-400" },
                                { label: "None", value: 0, color: "from-slate-400 to-slate-300" },
                            ].map((opt) => {
                                const isActive = Number(tempData.priority ?? 0) === opt.value;
                                return (
                                    <button
                                        key={opt.label}
                                        type="button"
                                            className={`rounded-xl px-3 py-2 text-sm font-semibold shadow-xs ring-1 transition ${
                                                isActive
                                                    ? `bg-linear-to-r ${opt.color} text-white ring-transparent`
                                                : "bg-white text-primary ring-accent-blue/20 hover:ring-accent-blue/40 dark:bg-[rgba(15,23,42,0.7)]"
                                            }`}
                                            onClick={() => setTempData({ ...tempData, priority: opt.value })}
                                        >
                                        {opt.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
