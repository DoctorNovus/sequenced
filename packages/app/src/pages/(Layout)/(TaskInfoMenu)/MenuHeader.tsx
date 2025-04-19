import { Description, DialogTitle } from "@headlessui/react";

export default function MenuHeader({ isDeleting, type }) {
    return (
        <div
            className={`${isDeleting && "blur-sm"
                } flex flex-col items-center text-xl py-1 my-1`}
        >
            <DialogTitle>
                {type == "add" ? "New Item" : "Viewing Item"}
            </DialogTitle>
            <hr className="bg-black w-24 h-0.5 my-2" />
            <Description className="flex grow-0 text-center text-base">
                Be able to {type == "add" ? "add" : "edit"} items using the
                provided details
            </Description>
        </div>
    )
}