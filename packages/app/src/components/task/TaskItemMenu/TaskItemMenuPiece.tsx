export default function TaskItemMenuPiece(props) {
  let { text, color } = props;

  return (
    <div
      className={`flex justify-center items-center w-full h-full rounded-lg px-4 py-2 text-accent-white ${color}`}
      {...props}
    >
      <a className="">{text}</a>
    </div>
  );
}
