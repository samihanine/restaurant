import { useEffect, useState } from 'react';
import { Label } from './Label';

type SwitchProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
};

export const InputSwitch = ({ id, checked, onChange, label, ...props }: SwitchProps) => {
  const [isChecked, setIsChecked] = useState(checked);

  const handleChange = () => {
    const newChecked = !isChecked;
    onChange(newChecked);
  };

  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  return (
    <div className="flex flex-col gap-3">
      <Label id={id} label={label} />
      <label className="relative inline-flex cursor-pointer items-center">
        <input onChange={handleChange} type="checkbox" checked={isChecked} className="peer sr-only" {...props} />
        <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-light"></div>
      </label>
    </div>
  );
};
