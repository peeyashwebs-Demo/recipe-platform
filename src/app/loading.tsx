import RecipeCardSkeleton from "@/components/ui/RecipeCardSkeleton";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-10">
      <div className="h-[420px] skeleton rounded-2xl" />
      <section>
        <div className="flex items-center justify-between mb-5">
          <div className="h-8 w-48 skeleton rounded-lg" />
          <div className="h-4 w-16 skeleton rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <RecipeCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
