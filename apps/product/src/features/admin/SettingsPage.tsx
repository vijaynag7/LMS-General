import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { tenantBrandingSchema, type TenantBrandingInput } from "@edusaas/shared";
import { useTenant } from "@/hooks/useTenant";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SettingsPage() {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const branding = (tenant?.branding ?? {}) as { logoUrl?: string; brandColor?: string };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TenantBrandingInput>({
    resolver: zodResolver(tenantBrandingSchema),
    defaultValues: {
      logoUrl: branding.logoUrl ?? "",
      brandColor: branding.brandColor ?? "#6D28D9",
      gstin: tenant?.gstin ?? "",
    },
  });

  const onSubmit = async (values: TenantBrandingInput) => {
    if (!tenant) return;
    const { error } = await supabase
      .from("tenants")
      .update({
        branding: { logoUrl: values.logoUrl || "", brandColor: values.brandColor },
        gstin: values.gstin || null,
      })
      .eq("id", tenant.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Branding updated");
    queryClient.invalidateQueries({ queryKey: ["tenant"] });
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Institute settings</h1>
        <p className="text-muted-foreground">Branding shown to your students.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Branding</CardTitle>
          <CardDescription>Applied instantly to your storefront and dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input id="logoUrl" placeholder="https://…" {...register("logoUrl")} />
              {errors.logoUrl && <p className="text-xs text-destructive">{errors.logoUrl.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="brandColor">Brand color</Label>
              <div className="flex items-center gap-2">
                <Input id="brandColor" type="color" className="h-9 w-16 p-1" {...register("brandColor")} />
                <span className="text-sm text-muted-foreground">{branding.brandColor}</span>
              </div>
              {errors.brandColor && <p className="text-xs text-destructive">{errors.brandColor.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gstin">GSTIN (for invoicing)</Label>
              <Input id="gstin" {...register("gstin")} />
            </div>
            <Button type="submit" variant="brand" disabled={isSubmitting}>
              Save
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
