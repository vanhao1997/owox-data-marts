import React, { useReducer, useRef } from 'react';
import { initialReportState, reducer } from './reducer.ts';
import { ReportsContext } from './context.ts';

interface ReportsProviderProps {
  children: React.ReactNode;
}

/**
 * Provides a context for reports management, allowing components
 * to access and modify the shared state using a reducer.
 *
 * @param {Object} props The properties passed to the ReportsProvider component.
 * @param {React.ReactNode} props.children The child components that will have access to reports context.
 * @return {JSX.Element} The provider component that wraps the passed children with the report context.
 */
export function ReportsProvider({ children }: ReportsProviderProps) {
  const [state, dispatch] = useReducer(reducer, initialReportState);
  const reportsRequestGenerationRef = useRef(0);
  return (
    <ReportsContext.Provider value={{ state, dispatch, reportsRequestGenerationRef }}>
      {children}
    </ReportsContext.Provider>
  );
}
