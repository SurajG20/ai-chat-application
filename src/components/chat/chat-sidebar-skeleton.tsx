import { Skeleton } from '@/components/ui/skeleton';

export function ChatSidebarSkeleton({ isCollapsed = false }: { isCollapsed?: boolean }) {
  return (
    <div className="p-2 space-y-1">
      {!isCollapsed && (
        <Skeleton className="h-4 w-24 mb-2" />
      )}
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-2 p-2">
          {isCollapsed ? (
            <Skeleton className="w-8 h-8 rounded-full" />
          ) : (
            <>
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
