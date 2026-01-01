interface TaskItemMenuPieceProps extends React.ComponentPropsWithoutRef<"div"> {
  text: string;
  color: string;
}

export default function TaskItemMenuPiece({ text, color, ...props }: TaskItemMenuPieceProps) {
  return (
    <div {...props} className={`flex justify-center items-center w-full h-full rounded-lg px-4 py-2 text-accent-white ${color}`}>
      <a>{text}</a>
    </div>
  );
}
