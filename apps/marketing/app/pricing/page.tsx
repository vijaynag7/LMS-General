import type { Metadata } from "next";
import { Check } from "lucide-react";

export const metadata: Metadata = { title: "Pricing" };

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:5173";

const PLANS = [
  {
    name: "Trial",
    price: "Free",
    period: "for 30 days",
    description: "Everything you need to launch your first course.",
    features: ["1 course", "Up to 50 students", "Live classes + recordings", "Razorpay payments"],
  },
  {
    name: "Growth",
    price: "₹2,999",
    period: "/month + 5% per sale",
    description: "For institutes actively running batches and live classes.",
    features: ["Unlimited courses", "Unlimited students", "Custom branding", "Analytics dashboard", "Priority support"],
    highlighted: true,
  },
  {
    name: "Scale",
    price: "Custom",
    period: "talk to us",
    description: "For large institutes needing dedicated infrastructure.",
    features: ["Everything in Growth", "White-labeled mobile app", "Dedicated video capacity", "Custom domain"],
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-semibold">Simple pricing for institutes</h1>
        <p className="mt-2 text-muted-foreground">
          A flat monthly fee plus a small commission on sales — no per-minute video charges, ever.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-xl border p-6 ${plan.highlighted ? "border-brand shadow-lg" : "border-border"}`}
          >
            <h2 className="font-semibold">{plan.name}</h2>
            <p className="mt-4 text-3xl font-semibold">{plan.price}</p>
            <p className="text-sm text-muted-foreground">{plan.period}</p>
            <p className="mt-3 text-sm text-muted-foreground">{plan.description}</p>
            <ul className="mt-6 space-y-2 text-sm">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="size-4 text-brand" /> {f}
                </li>
              ))}
            </ul>
            <a
              href={`${APP_URL}/onboard`}
              className={`mt-6 block rounded-md px-4 py-2 text-center text-sm font-medium ${
                plan.highlighted ? "bg-brand text-brand-foreground hover:opacity-90" : "border border-border hover:bg-muted"
              }`}
            >
              Get started
            </a>
          </div>
        ))}
      </div>

      <p className="mt-10 text-center text-xs text-muted-foreground">
        Indicative pricing — final plans are configured by the platform team.
      </p>
    </div>
  );
}
