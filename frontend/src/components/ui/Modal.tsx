type ModalProps = {
  isOpen?: boolean;
  children?: React.ReactNode;
};

export const Modal = ({ isOpen = false, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">{children}</div>
    </div>
  );
};
