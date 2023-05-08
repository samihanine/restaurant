import { Label } from './Label';

export type InputSelectProps = React.DetailedHTMLProps<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  HTMLSelectElement
> & {
  label: string;
  id: string;
};

export const InputSelect = ({ label, id, children, ...props }: InputSelectProps) => (
  <div className="flex flex-1 flex-col gap-2">
    <Label id={id} label={label} />
    <select id={id} className="w-full rounded-sm border border-gray-400 bg-white p-2" {...props}>
      {children}
    </select>
  </div>
);
