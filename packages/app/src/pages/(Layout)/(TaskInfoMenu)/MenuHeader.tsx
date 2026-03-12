import { Description, DialogTitle } from "@headlessui/react";

export default function MenuHeader({ isDeleting, type }: { isDeleting: boolean, type: string }) {
    return (
        <div className={`flex flex-col gap-1 pb-4 border-b border-(--surface-border) ${isDeleting && "blur-xs"}`}>
            <DialogTitle className="text-2xl font-bold text-primary">
                {type == "add" ? "New Task" : "Update Task"}
            </DialogTitle>
            <Description className="text-sm text-muted">
                {type == "add"
                    ? "Capture the essentials and set a reminder."
                    : "Edit details, dates, or reminders, then save."}
            </Description>
        </div>
    )
}
