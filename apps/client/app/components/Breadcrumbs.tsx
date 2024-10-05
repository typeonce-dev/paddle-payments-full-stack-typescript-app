import * as Aria from "react-aria-components";
import { cn } from "~/utils";

const Breadcrumbs = <T extends object>({
  className,
  ...props
}: Aria.BreadcrumbsProps<T>) => {
  return (
    <Aria.Breadcrumbs<T>
      {...props}
      className={cn("flex items-center justify-center", className)}
    />
  );
};

const Breadcrumb = ({ ...props }: Aria.BreadcrumbProps) => {
  return (
    <Aria.Breadcrumb
      {...props}
      className="data-[selected=true]:text-blue-500 data-[selected=true]:font-semibold after:content-['/'] [&:not(:last-child)::after]:text-gray-200 [&:last-child::after]:invisible after:px-4"
    />
  );
};

export { Breadcrumb, Breadcrumbs };
