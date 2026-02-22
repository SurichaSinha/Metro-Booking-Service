import { createContext, useContext, useReducer } from 'react';

const AdminContext = createContext(null);

const initialState = {
  selectedLine: null,
  importData: null,
  importStatus: 'idle',
  importErrors: [],
};

function adminReducer(state, action) {
  switch (action.type) {
    case 'SELECT_LINE':
      return { ...state, selectedLine: action.payload };
    case 'SET_IMPORT_DATA':
      return { ...state, importData: action.payload };
    case 'SET_IMPORT_STATUS':
      return { ...state, importStatus: action.payload };
    case 'SET_IMPORT_ERRORS':
      return { ...state, importErrors: action.payload };
    case 'RESET_IMPORT':
      return { ...state, importData: null, importStatus: 'idle', importErrors: [] };
    default:
      return state;
  }
}

export function AdminProvider({ children }) {
  const [state, dispatch] = useReducer(adminReducer, initialState);

  const selectLine = (line) => dispatch({ type: 'SELECT_LINE', payload: line });
  const setImportData = (data) => dispatch({ type: 'SET_IMPORT_DATA', payload: data });
  const setImportStatus = (status) => dispatch({ type: 'SET_IMPORT_STATUS', payload: status });
  const setImportErrors = (errors) => dispatch({ type: 'SET_IMPORT_ERRORS', payload: errors });
  const resetImport = () => dispatch({ type: 'RESET_IMPORT' });

  const value = {
    ...state,
    selectLine,
    setImportData,
    setImportStatus,
    setImportErrors,
    resetImport,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
