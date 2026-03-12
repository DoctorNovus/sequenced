interface MenuFooterProps {
    type: string | undefined;
    isDeleting: boolean;
    resetForm: () => void;
    submitForm: () => void;
    isSubmitDisabled?: boolean;
}

export default function MenuFooter({ type, isDeleting, resetForm, submitForm, isSubmitDisabled }: MenuFooterProps) {
    return (
        <div className={`flex gap-3 md:justify-end ${isDeleting && "blur-xs"}`}>
            <button
                className="flex-1 md:flex-none md:w-28 h-10 rounded-lg text-sm font-semibold bg-silver-200 border border-accent-blue/30 text-accent-blue hover:bg-accent-blue hover:text-white transition dark:bg-[#253350]"
                onClick={resetForm}
            >
                Cancel
            </button>
            <button
                className="flex-1 md:flex-none md:w-28 h-10 rounded-lg text-sm font-semibold bg-linear-to-r from-accent-blue-700 to-accent-blue-500 text-white shadow-md shadow-accent-blue/25 ring-1 ring-accent-blue/20 transition hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={submitForm}
                disabled={isSubmitDisabled}
            >
                {type == "add" ? "Create" : "Save"}
            </button>
        </div>
    )
}
