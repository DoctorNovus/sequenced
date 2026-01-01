interface PopupMenuProps {
  id: string;
  className: string;
}

export default function PopupMenu({ id, className, children }: React.PropsWithChildren<PopupMenuProps>) {
  return (
    <div id={id} className={`w-full h-full absolute top-0 left-0 z-10 bg-accent-black ${className}`}>
      <div className="w-full h-full flex justify-center items-center z-20">{children}</div>
    </div>
  );
}
