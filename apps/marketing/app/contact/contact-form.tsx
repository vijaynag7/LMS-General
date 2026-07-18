"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactInput } from "@/lib/schemas";

export function ContactForm() {
  const [status, setStatus] = React.useState<"idle" | "submitting" | "sent" | "error">("idle");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (values: ContactInput) => {
    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
      reset();
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return <p className="rounded-md border border-border bg-muted p-4 text-sm">Thanks — we'll get back to you shortly.</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          Name
        </label>
        <input id="name" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" {...register("name")} />
        {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
      </div>
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          {...register("email")}
        />
        {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
      </div>
      <div className="space-y-1.5">
        <label htmlFor="instituteName" className="text-sm font-medium">
          Institute name (optional)
        </label>
        <input
          id="instituteName"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          {...register("instituteName")}
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="message" className="text-sm font-medium">
          Message
        </label>
        <textarea
          id="message"
          rows={4}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          {...register("message")}
        />
        {errors.message && <p className="text-xs text-red-600">{errors.message.message}</p>}
      </div>
      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-md bg-brand px-5 py-2 text-sm font-medium text-brand-foreground hover:opacity-90 disabled:opacity-50"
      >
        {status === "submitting" ? "Sending…" : "Send message"}
      </button>
      {status === "error" && <p className="text-xs text-red-600">Something went wrong — please try again.</p>}
    </form>
  );
}
