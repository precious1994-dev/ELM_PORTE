import { cn } from "@/lib/utils"

type SkeletonProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'banner' | 'card' | 'text' | 'team' | 'event';
};

function Skeleton({
  className,
  variant = 'default',
  ...props
}: SkeletonProps) {
  const variantClasses = {
    default: 'h-4 w-full',
    banner: 'h-[400px] w-full',
    card: 'h-[200px] w-full',
    text: 'h-4 w-[250px]',
    team: 'h-[300px] w-full',
    event: 'h-[250px] w-full',
  };

  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
}

export { Skeleton } 