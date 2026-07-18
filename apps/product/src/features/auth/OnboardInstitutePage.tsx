import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { onboardInstituteSchema, type OnboardInstituteInput } from "@edusaas/shared";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function OnboardInstitutePage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OnboardInstituteInput>({ resolver: zodResolver(onboardInstituteSchema) });

  const onSubmit = async (values: OnboardInstituteInput) => {
    const { data, error } = await supabase.functions.invoke("onboard-institute", { body: values });
    if (error) {
      toast.error(error.message ?? "Could not create your institute");
      return;
    }
    if ((data as { error?: string })?.error) {
      toast.error((data as { error: string }).error);
      return;
    }
    toast.success("Your institute is ready — sign in to get started.");
    navigate(`/login?tenant=${values.slug}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create your institute</CardTitle>
          <CardDescription>Set up your branded learning platform in a couple of minutes.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="instituteName">Institute name</Label>
              <Input id="instituteName" {...register("instituteName")} />
              {errors.instituteName && <p className="text-xs text-destructive">{errors.instituteName.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="slug">Subdomain</Label>
              <div className="flex items-center gap-1">
                <Input id="slug" placeholder="my-institute" {...register("slug")} />
                <span className="text-sm text-muted-foreground">.edusaas.app</span>
              </div>
              {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Select id="category" {...register("category")}>
                <option value="">Select a category</option>
                <option value="k12">K-12</option>
                <option value="competitive_exam">Competitive exam</option>
                <option value="skill">Skill / vocational</option>
                <option value="professional">Professional</option>
              </Select>
              {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
            </div>

            <hr className="border-border" />

            <div className="space-y-1.5">
              <Label htmlFor="adminName">Your name</Label>
              <Input id="adminName" {...register("adminName")} />
              {errors.adminName && <p className="text-xs text-destructive">{errors.adminName.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="adminEmail">Your email</Label>
              <Input id="adminEmail" type="email" {...register("adminEmail")} />
              {errors.adminEmail && <p className="text-xs text-destructive">{errors.adminEmail.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="adminPassword">Password</Label>
              <Input id="adminPassword" type="password" {...register("adminPassword")} />
              {errors.adminPassword && <p className="text-xs text-destructive">{errors.adminPassword.message}</p>}
            </div>

            <Button type="submit" variant="brand" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating your institute…" : "Create institute"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
