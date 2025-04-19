import { Menu } from "@headlessui/react";

export default function TaskMenuItem({ skeleton, children, active, handleClick }) {
  const handleTrueClick = (e) => {
    e.stopPropagation();
    handleClick(e);
  };

  if (skeleton) {
    return (
      <div className="hover:bg-accent-white-50 active:hover:text-accent-blue-700 active:scale-125 text-center select-none px-2 py-1 border border-accent-blue text-accent-blue rounded-md">
        {children}
      </div>
    )
  }

  return (
    <Menu.Item
      onClick={handleTrueClick}
      className={`${active && "bg-accent-blue-600 text-white"
        } hover:bg-accent-white-50 active:hover:text-accent-blue-700 active:scale-125 text-center select-none px-2 py-1 border border-accent-blue text-accent-blue rounded-md `}
    >
      {children}
    </Menu.Item>
  );
}
