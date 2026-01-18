import { createContext, useState, ReactNode, useContext } from "react";

interface InvalidSessionContextValue {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  triggerInvalidSession: () => void;
}

const InvalidSessionContext = createContext<InvalidSessionContextValue | null>(
  null,
);

export const InvalidSessionProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [showModal, setShowModal] = useState(false);

  const triggerInvalidSession = () => {
    setShowModal(true);
  };

  return (
    <InvalidSessionContext.Provider
      value={{ showModal, setShowModal, triggerInvalidSession }}
    >
      {children}
    </InvalidSessionContext.Provider>
  );
};

export const useInvalidSession = () => {
  const context = useContext(InvalidSessionContext);
  if (!context) {
    throw new Error(
      "useInvalidSession deve ser usado dentro de InvalidSessionProvider",
    );
  }
  return context;
};
