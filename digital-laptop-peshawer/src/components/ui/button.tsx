import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default:
          "bg-white text-zinc-950 shadow-[0_0_24px_rgba(255,255,255,0.15)] hover:bg-zinc-200",
        accent:
          "bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400 text-white shadow-[0_8px_30px_rgba(59,130,246,0.35)] hover:shadow-[0_8px_44px_rgba(34,211,238,0.45)] hover:brightness-110",
        outline:
          "border border-white/15 bg-white/5 text-zinc-100 backdrop-blur-xl hover:bg-white/10 hover:border-white/25",
        ghost: "text-zinc-300 hover:bg-white/10 hover:text-white",
        destructive:
          "bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/25",
        secondary: "bg-white/10 text-white hover:bg-white/15",
      },
      size: {
        default: "h-10 px-5",
        sm: "h-8 px-3.5 text-xs",
        lg: "h-12 px-7 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { Button, buttonVariants };
