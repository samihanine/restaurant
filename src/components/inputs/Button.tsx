import { LoadingSpinner } from '../icons/LoadingSpinner';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'red' | 'secondary';
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  children: React.ReactNode;
  loading?: boolean;
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export const Button: React.FC<ButtonProps> = ({
  loading,
  variant,
  children,
  className = '',
  onClick,
  disabled,
  ...props
}) => (
  <button
    onClick={(e) => (disabled || loading ? e.preventDefault() : onClick?.(e))}
    className={classNames(
      'inline-flex w-fit items-center justify-center rounded-md border-2 border-transparent bg-primary px-4 py-2 text-lg font-medium leading-4 text-white shadow-sm hover:grayscale-[25%] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
      variant === 'secondary' ? 'bg-gray-400 text-gray-700 hover:bg-gray-500' : '',
      variant === 'red' ? '!border-2 !border-rose-500 bg-white !text-rose-500 hover:bg-rose-500 hover:!text-white' : '',
      `${disabled || loading ? '!border-transparent !bg-gray-300 !text-white' : ''}`,
      className
    )}
    disabled={disabled || loading}
    {...props}
  >
    <span className="flex items-center gap-3">
      {loading && <LoadingSpinner />}
      {children}
    </span>
  </button>
);
