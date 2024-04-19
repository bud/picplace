import React from 'react';

function useFetchye(url, options, deps) {
  const [response, setResponse] = React.useState({ error: null, loading: true, data: null, response: null });

  React.useLayoutEffect(() => {
    let good = true;
    setResponse({ error: null, loading: true, data: null, response: null });
    void (async () => {
      const response = await fetch(url, options);
      try {
        if (!response.ok) {
          const error = JSON.parse(await response.text());
          if (good) setResponse({ error, loading: false, data: null, response });
        } else {
          const data = await response.json();
          if (good) setResponse({ error: null, loading: false, data, response });
        }
      } catch (error) {
        setResponse({ error, loading: false, data: null, response });
      }
    })();

    return () => { good = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return response;
}

export default useFetchye;