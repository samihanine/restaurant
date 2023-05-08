type TagProps = {
  children: React.ReactNode;
  className?: string;
};

export const Tag = ({ children, className = '' }: TagProps) => (
  <div
    className={`flex justify-center rounded-full bg-green-200 px-2 py-1 text-sm font-bold text-green-600 ${className}`}
  >
    {children}
  </div>
);
