import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full rounded-base border-2 border-black bg-secondary-background selection:bg-main selection:text-main-foreground px-3 py-2 text-sm font-base text-slate-950 file:border-0 file:bg-transparent file:text-sm file:font-heading placeholder:text-slate-950/50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:text-slate-50 dark:placeholder:text-slate-50/50",
        className,
      )}
      {...props}
    />
  )
}

export { Input }
