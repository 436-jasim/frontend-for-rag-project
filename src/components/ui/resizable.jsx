import * as ResizablePrimitive from "react-resizable-panels";

const cn = (...classes) => classes.filter(Boolean).join(" ");

function ResizablePanelGroup({ className, ...props }) {
  return (
    <ResizablePrimitive.Group
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full overflow-hidden aria-[orientation=vertical]:flex-col",
        className
      )}
      {...props}
    />
  );
}

function ResizablePanel({ className, ...props }) {
  return (
    <ResizablePrimitive.Panel
      data-slot="resizable-panel"
      className={cn("min-h-0 min-w-0", className)}
      {...props}
    />
  );
}

function ResizableHandle({ withHandle, className, ...props }) {
  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      className={cn(
        "group/handle relative flex w-[10px] shrink-0 cursor-col-resize items-center justify-center bg-[#282a2c] transition-colors hover:bg-blue-500 focus-visible:outline-none data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="z-10 flex h-10 w-1 shrink-0 rounded-full bg-[#80868b] transition-colors group-hover/handle:bg-white" />
      )}
    </ResizablePrimitive.Separator>
  );
}

export { ResizableHandle, ResizablePanel, ResizablePanelGroup };