type AuthLayoutProps = {
  children?: React.ReactNode;
};

export const AuthLayout = ({ children }: AuthLayoutProps) => (
  <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">{children}</div>
  </div>
);
