type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

export const ButtonCircle = ({ children, ...props }: ButtonProps) => (
  <button
    {...props}
    className={`aspect-square w-fit items-center justify-center rounded-full border border-primary text-primary ${props.className}`}
  >
    {children}
  </button>
);
