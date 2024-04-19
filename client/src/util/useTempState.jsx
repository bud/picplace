import React from 'react';

function useTempState(defaultValue) {
  const state = React.useState(defaultValue);

  React.useEffect(() => {
    state[1](defaultValue);
  }, [defaultValue, state]);

  return state;
}

export default useTempState;