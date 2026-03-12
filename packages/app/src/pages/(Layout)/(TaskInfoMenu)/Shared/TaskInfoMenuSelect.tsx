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
            className="appearance-none w-full h-full text-base px-2 py-2 bg-silver-200 border border-accent-blue/20 rounded-xl text-primary overflow-x-hidden overflow-y-scroll dark:bg-vulcan-950"
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
