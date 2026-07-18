import type { Metadata } from "next";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <h1 className="text-3xl font-semibold">Get in touch</h1>
      <p className="mt-2 text-muted-foreground">Questions about EduSaaS for your institute? Send us a message.</p>
      <div className="mt-8">
        <ContactForm />
      </div>
    </div>
  );
}
