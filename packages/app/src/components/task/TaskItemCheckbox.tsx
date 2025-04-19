export default function TaskItemCheckBox(props) {
  return (
    <div className="w-7 h-7 flex flex-row items-center justify-center border border-accent-black-300 rounded-full px-0.5 py-0.5 hover:bg-accent-blue-700">
      <input
        type="checkbox"
        className="w-6 h-6 bg-transparent appearance-none checked:bg-accent-blue rounded-full"
        {...props}
      />
    </div>
  );
}
