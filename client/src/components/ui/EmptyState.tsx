// import * as React from "react";
// import { motion } from "framer-motion";
// import { FolderSearch, type LucideIcon } from "lucide-react";
// import { cn } from "@/lib/cn";

// interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
//   icon?: LucideIcon;
//   title: string;
//   description?: string;
//   action?: React.ReactNode;
// }

// export function EmptyState({
//   icon: Icon = FolderSearch,
//   title,
//   description,
//   action,
//   className,
//   ...props
// }: EmptyStateProps) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 10 }}
//       animate={{ opacity: 1, y: 0 }}
//       className={cn(
//         "flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center",
//         className
//       )}
//       {...props}
//     >
//       <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50 mb-6">
//         <Icon className="h-10 w-10 text-muted-foreground" />
//       </div>
//       <h3 className="text-xl font-semibold tracking-tight text-foreground mb-2">
//         {title}
//       </h3>
//       {description && (
//         <p className="text-muted-foreground max-w-sm mb-6">{description}</p>
//       )}
//       {action && <div>{action}</div>}
//     </motion.div>
//   );
// }









"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { FolderSearch, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

interface EmptyStateProps extends HTMLMotionProps<"div"> {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon = FolderSearch,
  title,
  description,
  action,
  className,
  children,
  ...props
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center",
        className
      )}
      {...props}
    >
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted/50">
        <Icon className="h-10 w-10 text-muted-foreground" />
      </div>

      <h3 className="mb-2 text-xl font-semibold tracking-tight text-foreground">
        {title}
      </h3>

      {description && (
        <p className="mb-6 max-w-sm text-muted-foreground">
          {description}
        </p>
      )}

      {action && <div>{action}</div>}

      {children}
    </motion.div>
  );
}

export default EmptyState;