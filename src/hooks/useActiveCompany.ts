import { useState, useCallback } from 'react';

export interface ActiveCompany {
  id: string;
  name: string;
  logo?: string;
}

export const useActiveCompany = () => {
  const [activeCompany, setActiveCompany] = useState<ActiveCompany | null>(null);

  const setActive = useCallback((company: ActiveCompany | null) => {
    setActiveCompany(company);
  }, []);

  return {
    activeCompany,
    setActive,
  };
};
