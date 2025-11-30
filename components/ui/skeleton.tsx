export function ApplicationCardSkeleton() {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    {/* Job title skeleton */}
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    {/* Company name skeleton */}
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                {/* Status badge skeleton */}
                <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
            </div>

            {/* Date skeleton */}
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="space-y-4">
            <ApplicationCardSkeleton />
            <ApplicationCardSkeleton />
            <ApplicationCardSkeleton />
        </div>
    );
}
