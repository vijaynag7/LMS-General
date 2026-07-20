"use client";

import * as React from "react";

type Tab = {
  id: string;
  label: string;
  content: React.ReactNode;
};

export function CourseTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = React.useState(tabs[0]?.id);

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto rounded-lg border border-border bg-muted/40 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={`shrink-0 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              active === tab.id
                ? "bg-brand text-brand-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-6">{tabs.find((t) => t.id === active)?.content}</div>
    </div>
  );
}
