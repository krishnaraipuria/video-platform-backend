import { useCallback, useEffect, useRef, useState } from "react";

export function useFetch(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: "" });
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const run = useCallback(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: "" }));
    fnRef.current()
      .then((data) => !cancelled && setState({ data, loading: false, error: "" }))
      .catch((e) => !cancelled && setState({ data: null, loading: false, error: e.message }));
    return () => { cancelled = true; };
  }, []);

  
  useEffect(run, deps);
  const setData = (updater) =>
    setState((s) => ({ ...s, data: typeof updater === "function" ? updater(s.data) : updater }));
  return { ...state, reload: run, setData };
}
