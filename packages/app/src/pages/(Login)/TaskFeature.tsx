import CheckmarkIcon from "./CheckmarkIcon";

export default function TaskFeature({ children }) {
    return (
        <li className="flex flex-row gap-2 items-center">
            <div className="flex w-4 aspect-square justify-center items-center">
                <CheckmarkIcon />
            </div>
            <span className="text-lg">{children}</span>
        </li>
    )
}