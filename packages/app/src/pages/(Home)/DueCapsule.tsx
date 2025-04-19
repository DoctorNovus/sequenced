export default function DueCapsule({ skeleton, count, category, important }) {
    if (skeleton)
        return (
            <div className="w-full h-full flex flex-col justify-end py-2 items-center shadow-md border border-accent-blue p-2 relative rounded-md">
                <div className="flex justify-center items-center w-full h-full">
                    <span className={`${important ? "text-5xl" : "text-3xl"} text-accent-blue`}>0</span>
                </div>
                <span className="text-base text-center text-gray-500">Tasks Due {category}</span>
            </div>
        )

    return (
        <div className="w-full h-full flex flex-col justify-end py-2 items-center shadow-md border border-accent-blue p-2 relative rounded-md">
            <div className="flex justify-center items-center w-full h-full">
                <span className={`${important ? "text-5xl" : "text-3xl"} text-accent-blue`}>{count}</span>
            </div>
            <span className="text-base text-center text-gray-500">{count != 1 ? "Tasks" : "Task"} {category}</span>
        </div>
    )
}