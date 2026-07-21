"use client";

import Card from "./Card";
import Shimmer from "./Shimmer";

export default function RecipeCardSkeleton() {
  return (
    <Card variant="interactive" padding="none" className="overflow-hidden">
      <Shimmer className="w-full aspect-[4/3]" />
      <div className="p-4 space-y-3">
        <Shimmer variant="text" width="70%" />
        <Shimmer variant="text" width="100%" />
        <Shimmer variant="text" width="40%" />
        <div className="flex items-center gap-2 pt-2">
          <Shimmer variant="circular" width="24px" height="24px" />
          <Shimmer variant="text" width="80px" />
        </div>
      </div>
    </Card>
  );
}
