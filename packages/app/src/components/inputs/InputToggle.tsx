import { Switch } from "@headlessui/react";
import { useEffect, useState } from "react";

export default function InputToggle({ title, defaultValue, onChange }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(defaultValue);
  });

  const HandleChange = () => {
    setEnabled(!enabled);
    onChange(!enabled);
  };

  return (
    <div className="flex flex-col justify-between gap-1">
      <label className="text-lg">{title}</label>
      <Switch
        checked={enabled || false}
        onChange={() => HandleChange()}
        className="group inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition data-[checked]:bg-blue-600"
      >
        <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-[checked]:translate-x-6" />
      </Switch>
    </div>
  );
}
