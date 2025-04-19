import { TaskInfoMenuDelete } from "./Shared/TaskInfoMenuDelete";

export default function MenuEdit({ type, appData, tempData, isDeleting, setIsDeleting, setIsOpen }) {
    const closeMenu = (e?: React.MouseEvent<any>) => {
        if (e) e.stopPropagation();

        setIsOpen(false);
    };

    return (
        <>
            {type == "edit" && (
                <div className="">
                    <TaskInfoMenuDelete
                        parent={appData.activeParent}
                        task={tempData}
                        closeMenu={closeMenu}
                        isDeleting={isDeleting}
                        setIsDeleting={setIsDeleting}
                    />
                </div>
            )}
        </>

    )
}