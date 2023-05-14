import { Label } from './Label';

export type InputTextProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  id: string;
};

export const InputText = ({ label, id, className = '', ...props }: InputTextProps) => (
  <div className="flex w-full flex-col gap-2">
    {label && label !== '' && <Label id={id} label={label} />}
    <input
      type="text"
      id={id}
      className={`rounded-sm border border-gray-400 bg-white p-2 outline-none focus:border-gray-700 ${className}`}
      {...props}
    />
  </div>
);
