import { ChangeEventHandler } from "react";

export interface TaskInfoMenuItemOptions {
  type?: string;
  name: string;
  value: any;
  onChange: ChangeEventHandler<any> | undefined;
  placeholder?: string;
}

export default function TaskInfoMenuItem({
  name,
  type,
  value,
  onChange,
  placeholder,
}: TaskInfoMenuItemOptions) {
  let inputPiece = (
    <input
      id={name.toLowerCase()}
      name={name.toLowerCase()}
      type={type}
      className="text-base px-3 py-2 rounded-xl border border-accent-blue/20 bg-white/90 text-primary shadow-inner focus:border-accent-blue focus:outline-none dark:bg-[rgba(15,23,42,0.7)]"
      placeholder={placeholder ?? `${name}...`}
      value={value as any}
      onChange={onChange}
      autoFocus={false}
    />
  );

  if (type == "textarea") {
    inputPiece = (
      <textarea
        id={name.toLowerCase()}
        name={name.toLowerCase()}
        className="resize-none text-base px-3 py-2 rounded-xl border border-accent-blue/20 bg-white/90 text-primary shadow-inner focus:border-accent-blue focus:outline-none dark:bg-[rgba(15,23,42,0.7)]"
        placeholder={placeholder ?? `${name}...`}
        value={value as any}
        onChange={onChange}
        autoFocus={false}
      ></textarea>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name.toLowerCase()} className="text-sm font-semibold text-primary px-1">
        {name}
      </label>
      {inputPiece}
    </div>
  );
}
