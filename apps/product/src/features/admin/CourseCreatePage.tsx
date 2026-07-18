import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { courseSchema, type CourseInput } from "@edusaas/shared";
import { useCreateCourse } from "@/hooks/data/useCourses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CourseCreatePage() {
  const createCourse = useCreateCourse();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CourseInput>({
    resolver: zodResolver(courseSchema),
    defaultValues: { currency: "INR", validityDays: 365, status: "draft", price: 0 },
  });

  const onSubmit = async (values: CourseInput) => {
    try {
      const course = await createCourse.mutateAsync(values);
      toast.success("Course created");
      navigate(`/app/admin/courses/${course.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create course");
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold">New course</h1>
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register("title")} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={4} {...register("description")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="durationLabel">Duration</Label>
              <Input id="durationLabel" placeholder="e.g. 8 weeks, 3 months, 40 hours" {...register("durationLabel")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="price">Price</Label>
                <Input id="price" type="number" step="0.01" {...register("price", { valueAsNumber: true })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="currency">Currency</Label>
                <Select id="currency" {...register("currency")}>
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="validityDays">Access validity (days)</Label>
                <Input id="validityDays" type="number" {...register("validityDays", { valueAsNumber: true })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <Select id="status" {...register("status")}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </Select>
              </div>
            </div>
            <Button type="submit" variant="brand" disabled={createCourse.isPending}>
              {createCourse.isPending ? "Creating…" : "Create course"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
