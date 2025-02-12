import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label htmlFor={props.id} className="text-sm font-medium text-[#4C9296]">
            {label}
          </label>
        )}
        <textarea
          className={cn(
            "flex w-full rounded-md border bg-background px-3 py-2",
            "text-sm text-black placeholder:text-black/70",
            "focus:outline-none focus:ring-2 focus:ring-[#4C9296] focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error ? "border-red-500" : "border-input",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)

Textarea.displayName = "Textarea"

export { Textarea } 