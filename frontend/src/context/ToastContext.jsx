import { createContext, useCallback, useContext, useState } from "react";

const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const show = useCallback((message) => {
    setToast({ message, id: Date.now() });
    setTimeout(() => setToast((t) => (t && Date.now() - t.id >= 2900 ? null : t)), 3000);
  }, []);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {toast && (
        <div role="status" className="fixed bottom-6 left-6 z-[100] max-w-sm rounded bg-[#f1f1f1] px-4 py-3 text-sm text-black shadow-lg">
          {toast.message}
        </div>
      )}
    </ToastCtx.Provider>
  );
}
