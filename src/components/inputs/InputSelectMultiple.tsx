import { useEffect, useState } from 'react';
import { Label } from './Label';
import Select from 'react-select';

export type InputSelectProps = React.DetailedHTMLProps<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  HTMLSelectElement
> & {
  label: string;
  id: string;
  options: {
    value: string;
    label: string;
  }[];
  setValue?: (value: string) => void;
};

export const InputSelectMultiple = ({
  defaultValue,
  options,
  value,
  label,
  id,
  name,
  setValue,
  ...props
}: InputSelectProps) => {
  const [selectValues, setSelectValues] = useState('');

  useEffect(() => {
    setSelectValues((defaultValue as string) || '');
  }, [defaultValue]);

  useEffect(() => {
    if (selectValues && setValue) {
      setValue(selectValues);
    }
  }, [selectValues, setValue]);

  console.log(selectValues);
  return (
    <div className="flex flex-1 flex-col gap-2">
      <Label id={id} label={label} />
      <Select
        closeMenuOnSelect={false}
        onChange={(newValue) => setSelectValues(newValue.map((item) => item.value).join(','))}
        value={value}
        defaultValue={[]}
        isMulti
        options={options}
        className="z-100 relative w-full rounded-sm border border-gray-400 bg-white"
      />

      <input
        id={id}
        name={name}
        value={selectValues}
        className="hidden w-full rounded-sm !border border-gray-400 bg-white p-2"
      />
    </div>
  );
};
