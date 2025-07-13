import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow-sm hover:shadow-md",
  {
    variants: {
      variant: {
        default: "bg-gradient-primary text-white hover:opacity-90 hover:scale-105 shadow-primary/20 border border-primary/20",
        destructive: "bg-gradient-to-r from-red-500 to-red-600 text-white hover:opacity-90 hover:scale-105 shadow-red-500/20 border border-red-500/20",
        outline: "border border-neutral/30 bg-background/80 backdrop-blur-sm hover:bg-accent/80 hover:text-accent-foreground hover:border-accent/50",
        secondary: "bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground hover:opacity-90 hover:scale-105 shadow-secondary/20 border border-secondary/20",
        ghost: "bg-transparent hover:bg-accent/60 hover:text-accent-foreground transition-all duration-200",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80",
        premium: "bg-gradient-to-r from-accent via-accent/90 to-primary text-white hover:opacity-90 hover:scale-105 shadow-accent/30 border border-accent/30",
        soft: "bg-neutral/10 backdrop-blur-sm text-foreground hover:bg-neutral/20 border border-neutral/20",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-11 w-11 rounded-xl",
        xs: "h-7 px-2 text-xs rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
