import React from 'react';

const AuthContext = React.createContext([null, () => {}, () => {}, () => {}]);

export function useAuth() {
  return React.useContext(AuthContext);
}

export default AuthContext;