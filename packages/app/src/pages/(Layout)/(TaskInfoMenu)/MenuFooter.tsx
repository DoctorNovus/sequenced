export default function MenuFooter({ type, isDeleting, resetForm, submitForm }) {
    return (
        <div
            className={`flex flex-row gap-3 ${isDeleting && "blur-sm"}`}
        >
            <div className="flex grow justify-start">
                <button
                    className="w-full h-11 rounded-xl text-base font-semibold bg-white border border-accent-blue/30 text-accent-blue shadow-sm hover:bg-accent-blue hover:text-white transition"
                    onClick={resetForm}
                >
                    Cancel
                </button>
            </div>

            <div className="flex grow justify-end">
                <button
                    className="w-full h-11 rounded-xl text-base font-semibold bg-gradient-to-r from-accent-blue-700 to-accent-blue-500 text-white shadow-md shadow-accent-blue/25 ring-1 ring-accent-blue/20 transition hover:translate-y-[-1px]"
                    onClick={submitForm}
                >
                    {type == "add" ? "Create" : "Save"}
                </button>
            </div>
        </div>
    )
}
