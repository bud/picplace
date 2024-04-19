import React from 'react';

function useFetchye(url, options, deps) {
  const [data, setData] = React.useState([]);
  const [error, setError] = React.useState(null);
  const [next, setNext] = React.useState(false);
  const page = React.useRef(0);

  const doNextPage = React.useCallback(async () => {
    const response = await fetch(`${url}&page=${page.current}`, options);
    setNext(false);
    try {
      if (!response.ok) {
        const error = JSON.parse(await response.text());
        setNext(false);
        setError(error);
      } else {
        const succeeding = await response.json();
        page.current++;
        setNext(succeeding.length !== 0);
        setError(null);
        setData(d => [...d, ...succeeding]);
      }
    } catch (error) {
      setNext(false);
      setError(error);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  React.useEffect(() => {
    page.current = 0;
    setNext(false);
    setError(null);
    setData([]);
    doNextPage();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, error, next, doNextPage, page };
}

export default useFetchye;