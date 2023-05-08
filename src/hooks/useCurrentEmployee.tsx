import { useState } from 'react';

export const useCurrentEmployee = () => {
  const [currentEmployee, setCurrentEmployee] = useState<string | null>(null);

  return {
    currentEmployee,
    setCurrentEmployee,
  };
};
