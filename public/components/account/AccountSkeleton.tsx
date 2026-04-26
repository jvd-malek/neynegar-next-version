export const BookmarkArticleSectionSkeleton = () => (
    <div className="mt-10 animate-pulse">
        <div className="h-14 w-full bg-gray-300 rounded mb-4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
        </div>
    </div>
)

export const BookmarkProductSectionSkeleton = () => (
    <div className="mt-10 animate-pulse">
        <div className="h-14 w-full bg-gray-300 rounded mb-4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
        </div>
    </div>
)

export const CourseListSectionSkeleton = () => (
    <div className="mt-10 animate-pulse">
        <div className="h-14 w-full bg-gray-300 rounded mb-4"></div>
        <div className="h-30 bg-gray-200 rounded"></div>
    </div>
)