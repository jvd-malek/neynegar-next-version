export const CoursesSectionSkeleton = () => (
    <div className="container mx-auto px-3 mt-16 animate-pulse">
        <div className="h-12 w-full bg-gray-300 rounded mb-4"></div>
        {[1, 2].map((i) => (
            <div key={i} className="h-64 w-full bg-gray-200 rounded mb-6"></div>
        ))}
    </div>
)

export const ArticlesSectionSkeleton = () => (
    <div className="container mx-auto px-3 mt-16 animate-pulse">
        <div className="h-12 w-full bg-gray-300 rounded mb-4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
        </div>
    </div>
)

export const BooksSectionSkeleton = () => (
    <div className="container mx-auto px-3 mt-16">
        <div className="animate-pulse space-y-4">
            <div className="h-12 w-full bg-gray-300 rounded"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-48 bg-gray-200 rounded"></div>
                ))}
            </div>
        </div>
    </div>
)