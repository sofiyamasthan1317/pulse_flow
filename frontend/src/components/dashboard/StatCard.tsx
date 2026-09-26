import type { ReactNode } from "react";

type StatCardProps = {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: ReactNode;
  variant?: "default" | "danger" | "primary" | "success";
};

export const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  variant = "default",
}: StatCardProps) => {
  const getCardBorder = () => {
    switch (variant) {
      case "danger":
        return "border-rose-200 hover:border-rose-300";
      case "primary":
        return "border-indigo-200 hover:border-indigo-300";
      case "success":
        return "border-emerald-200 hover:border-emerald-300";
      default:
        return "border-slate-200 hover:border-slate-300";
    }
  };

  const getIconContainerBg = () => {
    switch (variant) {
      case "danger":
        return "bg-rose-50 text-rose-600";
      case "primary":
        return "bg-indigo-50 text-indigo-600";
      case "success":
        return "bg-emerald-50 text-emerald-600";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div
      className={`p-6 rounded-2xl border bg-white text-slate-900 shadow-xs hover:shadow-md transition-all duration-200 ${getCardBorder()}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        {icon && (
          <div className={`p-2 rounded-xl ${getIconContainerBg()}`}>
            {icon}
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold tracking-tight text-slate-900">
          {value}
        </span>
      </div>
      {subtitle && (
        <p className="mt-1.5 text-xs font-medium text-slate-500">
          {subtitle}
        </p>
      )}
    </div>
  );
};

