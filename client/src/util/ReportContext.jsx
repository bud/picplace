import React from 'react';

const ReportContext = React.createContext(() => {});

export function useReport() {
  return React.useContext(ReportContext);
}

export default ReportContext;