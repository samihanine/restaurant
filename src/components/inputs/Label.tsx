export type LabelProps = { label: string; id: string };

export const Label = ({ label, id }: LabelProps) => (
  <label className="text-sm text-gray-700" htmlFor={id}>
    <p className="">{label}</p>
  </label>
);
