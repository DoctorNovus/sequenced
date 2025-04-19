import { Dialog } from "@headlessui/react";
import { useDeleteTask } from "@/hooks/tasks";

export default function TaskItemMenuDeletion({
  item,
  setIsManaging,
  isDeleting,
  setIsDeleting,
}) {
  const { mutate: deleteTask } = useDeleteTask();

  const handleDelete = () => {
    deleteTask(item);

    setIsDeleting(false);
  };

  return (
    <Dialog
      open={isDeleting}
      onClose={() => setIsDeleting(false)}
      className="relative z-50"
    >
      <div className="fixed inset-0 flex w-screen items-center justify-center">
        <Dialog.Panel className="w-3/4 flex flex-col gap-2 p-6 text-black border border-solid shadow-lg rounded-lg items-center">
          <Dialog.Title className="text-xl">
            Delete Task
          </Dialog.Title>

          <div className="my-2 flex flex-col items-center text-center">
            <p className="text-lg mb-4 text-center">
              Are you sure you want to delete this task?
            </p>
            <div className="flex flex-row gap-6 justify-center">
              <button
                onClick={handleDelete}
                className="bg-accent-red-400 px-10 py-2 rounded-lg text-accent-white"
              >
                Yes
              </button>
              <button
                onClick={() => setIsDeleting(false)}
                className="bg-accent-blue-400 px-10 py-2 rounded-lg text-accent-white"
              >
                No
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
