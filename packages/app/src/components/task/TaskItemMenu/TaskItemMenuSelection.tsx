import { Dialog } from "@headlessui/react";
import TaskItemMenuPiece from "./TaskItemMenuPiece";
import { useUpdateTask } from "@/hooks/tasks";
import { useNavigate } from "react-router-dom";

export default function TaskItemMenuSelection({
  item,
  isManaging,
  setIsManaging,
  setIsDeleting,
}) {
  const navigate = useNavigate();

  const { mutate: updateTask } = useUpdateTask();

  const handleMarkComplete = (e) => {
    e.stopPropagation();
    updateTask({ id: item.id, data: { ...item, done: !item.done } });

    setIsManaging(false);
  };

  const handleInteractive = () => {
    navigate(`/task/view/${item.id}`);
  };

  return (
    <Dialog open={isManaging} onClose={() => setIsManaging(false)}>
      <div className="fixed inset-0 flex w-screen items-center justify-center">
        <Dialog.Panel className="bg-accent-black-700 p-2 rounded-lg border border-accent-white text-white">
          <div className="flex flex-col justify-center items-center gap-2 py-4 px-4">
            <Dialog.Title className="text-lg">Manage Task</Dialog.Title>
            <div className="w-full h-full flex flex-col justify-evenly items-center px-2 py-2 rounded-md gap-2">
              <TaskItemMenuPiece
                text="View/Edit"
                color="bg-accent-blue"
                onClick={handleInteractive}
              />
              <TaskItemMenuPiece
                text="Delete"
                color="bg-accent-red-500"
                onClick={() => setIsDeleting(true)}
              />
              <TaskItemMenuPiece
                text={`Mark ${item.done ? "Incomplete" : "Complete"}`}
                color="bg-accent-purple-400"
                onClick={handleMarkComplete}
              />
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
