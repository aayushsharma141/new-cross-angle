import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { DecryptedText, GradualBlur } from "@/components/ReactBits";

interface DataLoadingBoundaryProps {
  isLoading: boolean;
  loadingMessage?: string;
  subMessage?: string;
  skeleton?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function DataLoadingBoundary({
  isLoading,
  loadingMessage = "FETCHING DATA...",
  subMessage = "Please wait while we retrieve the latest information",
  skeleton,
  children,
  className
}: DataLoadingBoundaryProps) {
  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <div className={cn("relative w-full rounded-2xl overflow-hidden min-h-[300px]", className)}>
      <div className="absolute inset-0 z-0">
        <div className="opacity-30 blur-[4px] transition-all duration-1000 h-full w-full pointer-events-none flex flex-col gap-[10px]">
          {skeleton}
        </div>
      </div>
      
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-6 bg-background/10 backdrop-blur-[1px]">
         <DecryptedText 
           text={loadingMessage}
           speed={60}
           animateOn="view"
           className="text-xl md:text-2xl font-serif tracking-widest text-primary dark:text-admin-primary"
         />
         <div className="mt-4 max-w-[80%] mx-auto">
           <GradualBlur 
             text={subMessage} 
             className="text-xs md:text-sm text-muted-foreground dark:text-admin-text-subtle tracking-widest uppercase font-sans text-balance" 
             delay={50} 
             duration={1.5} 
           />
         </div>
      </div>
    </div>
  );
}
