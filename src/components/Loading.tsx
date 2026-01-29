import { Spinner } from "~/components/ui/spinner";
import { Skeleton } from "~/components/ui/skeleton";

export const Loading = ({ size }: { size?: number }) => {
  return <Spinner width={size ?? 40} height={size ?? 40} />;
};

const LoadingPage = () => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Loading />
    </div>
  );
};

export const PostSkeleton = () => {
  return (
    <div className="flex gap-4 p-8">
      <Skeleton className="h-14 w-14 rounded-full" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-5 w-full" />
      </div>
    </div>
  );
};

export default LoadingPage;
