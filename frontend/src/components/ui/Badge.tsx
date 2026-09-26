type BadgeProps = {
  label: string;
  variant?: "neutral" | "success" | "warning" | "danger";
};

export const Badge = ({ label, variant = "neutral" }: BadgeProps) => {
  const styles = {
    neutral: "bg-slate-100 text-slate-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
  };

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles[variant]}`}>{label}</span>;
};
