import type { Metadata } from "next";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <h1 className="text-3xl font-semibold">Get in touch</h1>
      <p className="mt-2 text-muted-foreground">Have a question about a course? Send us a message and we'll get back to you.</p>
      <div className="mt-8">
        <ContactForm />
      </div>
    </div>
  );
}
