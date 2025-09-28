import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function StoreSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <Skeleton className="w-3/4 h-6" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-2/3 h-4" />
        </div>
        <div className="flex justify-between">
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="rounded w-6 h-6" />
            ))}
          </div>
          <Skeleton className="w-20 h-9" />
        </div>
        <Skeleton className="w-full h-3" />
      </CardContent>
    </Card>
  );
}
