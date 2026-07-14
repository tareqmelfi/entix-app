import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

const variants = {
  primary: "bg-violet text-white hover:bg-violet-hover shadow-sm",
  secondary: "bg-navy text-white hover:bg-navy-light shadow-sm",
  outline: "border border-slate-200 bg-white text-slate-700 hover:border-violet hover:text-violet",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  danger: "bg-danger text-white hover:bg-red-600 shadow-sm"
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base"
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "focus-ring inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
