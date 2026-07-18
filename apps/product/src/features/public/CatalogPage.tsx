import { Link } from "react-router-dom";
import { useTenant } from "@/hooks/useTenant";
import { useCatalog } from "@/hooks/data/useCatalog";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function CatalogPage() {
  const { tenant, isLoading: tenantLoading } = useTenant();
  const { data: courses, isLoading: coursesLoading } = useCatalog();

  if (tenantLoading) return null;
  if (!tenant) {
    return (
      <div className="px-6 py-16 text-center text-muted-foreground">
        No institute found for this address. Try adding <code>?tenant=demo</code> to the URL in local dev.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold">{tenant.name}</h1>
        <p className="mt-2 text-muted-foreground">Browse our courses.</p>
      </div>

      {coursesLoading && <p className="text-center text-sm text-muted-foreground">Loading courses…</p>}
      {!coursesLoading && courses?.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">No published courses yet.</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses?.map((course) => (
          <Link key={course.id} to={`/courses/${course.id}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                <CardDescription className="line-clamp-3">{course.description}</CardDescription>
                <p className="pt-2 font-medium text-brand">
                  {course.price === 0 ? "Free" : `${course.currency} ${course.price}`}
                </p>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
