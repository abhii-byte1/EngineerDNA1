import * as React from "react"
import { SelectPrimitive } from "@radix-ui/react-select"
import * as SelectPrimitiveNamespace from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"

const Select = SelectPrimitiveNamespace.Root
const SelectGroup = SelectPrimitiveNamespace.Group
const SelectValue = SelectPrimitiveNamespace.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitiveNamespace.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitiveNamespace.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitiveNamespace.Trigger
    ref={ref}
    className={cn(
      "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitiveNamespace.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitiveNamespace.Icon>
  </SelectPrimitiveNamespace.Trigger>
))
SelectTrigger.displayName = SelectPrimitiveNamespace.Trigger.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitiveNamespace.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitiveNamespace.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitiveNamespace.Portal>
    <SelectPrimitiveNamespace.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectPrimitiveNamespace.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitiveNamespace.Viewport>
    </SelectPrimitiveNamespace.Content>
  </SelectPrimitiveNamespace.Portal>
))
SelectContent.displayName = SelectPrimitiveNamespace.Content.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitiveNamespace.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitiveNamespace.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitiveNamespace.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitiveNamespace.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitiveNamespace.ItemIndicator>
    </span>
    <SelectPrimitiveNamespace.ItemText>{children}</SelectPrimitiveNamespace.ItemText>
  </SelectPrimitiveNamespace.Item>
))
SelectItem.displayName = SelectPrimitiveNamespace.Item.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
}
