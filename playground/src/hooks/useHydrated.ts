import { useEffect, useState } from "react";

export const useHydrated = (init?: Function) => {
  const [hydrated, setHydrated] = useState<boolean>(false);

  useEffect(() => {
    setHydrated(true);
    init?.();
  }, []);

  return hydrated;
};
