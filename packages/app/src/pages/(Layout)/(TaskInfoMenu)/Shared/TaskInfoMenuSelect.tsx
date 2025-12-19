import { ChangeEventHandler } from "react";

export interface TaskInfoSelect {
    name: string;
    value: string | number;
    onChange: ChangeEventHandler;
    options: TaskInfoSelectOption[];
}

export interface TaskInfoSelectOption {
    name: string;
    value: string;
}

export default function TaskInfoMenuSelect({ name, value, onChange, options }: TaskInfoSelect){
    return (
        <div className="flex flex-col gap-2">
          <label className="text-lg text-primary">{name}</label>
          <select
            className="appearance-none w-full h-full text-base px-2 py-2 bg-white border border-accent-black-500 rounded-md text-primary overflow-x-hidden overflow-y-scroll hover:bg-accent-black-600 dark:bg-[rgba(15,23,42,0.7)]"
            value={value}
            onChange={onChange}
          >
            {options.map((option: TaskInfoSelectOption, key: number) => (
              <option key={key} value={option.value}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
      );
}
