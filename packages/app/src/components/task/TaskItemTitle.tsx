export default function TaskItemTitle({ text }) {
  return <div className="w-full text-lg mx-3 truncate ml-2 mr-6">{text || "No Title"}</div>;
}
