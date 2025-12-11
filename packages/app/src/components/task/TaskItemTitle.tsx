export default function TaskItemTitle({ text }) {
  return (
    <div
      className="w-full text-lg mx-3 ml-2 mr-6 whitespace-normal break-words"
      title={text || "No Title"}
    >
      {text || "No Title"}
    </div>
  );
}
