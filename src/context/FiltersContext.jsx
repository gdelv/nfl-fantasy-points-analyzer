import React, { createContext, useContext, useState } from 'react';

const FiltersContext = createContext(null);

export function FiltersProvider({ children }) {
  const [posFilter, setPosFilter] = useState('ALL');
  const [mode, setMode] = useState('h');

  return (
    <FiltersContext.Provider value={{ posFilter, setPosFilter, mode, setMode }}>
      {children}
    </FiltersContext.Provider>
  );
}

export function useFilters() {
  return useContext(FiltersContext);
}
