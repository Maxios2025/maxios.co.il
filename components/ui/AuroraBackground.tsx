
import React, { ReactNode } from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

export const AuroraBackground: React.FC<AuroraBackgroundProps> = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}) => {
  return (
    <div
      className={`relative flex flex-col h-full w-full items-center justify-center bg-black text-white transition-colors overflow-hidden ${className || ""}`}
      {...props}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`
            absolute -inset-[10px] opacity-30
            [--aurora:repeating-linear-gradient(100deg,#f97316_10%,#ea580c_15%,#c2410c_20%,#9a3412_25%,#7c2d12_30%)]
            [background-image:radial-gradient(at_0%_0%,#000000_0px,transparent_50%),var(--aurora)]
            [background-size:300%,_200%]
            [background-position:50%_50%,50%_50%]
            filter blur-[100px]
            after:content-[""] after:absolute after:inset-0 
            after:[background-image:radial-gradient(at_0%_0%,#000000_0px,transparent_50%),var(--aurora)]
            after:[background-size:200%,_100%] 
            after:animate-aurora
            after:[background-attachment:fixed] 
            mix-blend-screen
          `}
          style={{
            maskImage: showRadialGradient ? `radial-gradient(ellipse at 100% 0%, black 10%, transparent 70%)` : undefined,
            WebkitMaskImage: showRadialGradient ? `radial-gradient(ellipse at 100% 0%, black 10%, transparent 70%)` : undefined,
          }}
        ></div>
      </div>
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
};
