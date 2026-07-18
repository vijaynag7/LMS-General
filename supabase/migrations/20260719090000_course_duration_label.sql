-- Free-text course duration (e.g. "8 weeks", "3 months", "40 hours") for
-- public course listings. Left as free text rather than a fixed unit since
-- institutes span very different course formats (exam prep vs. skill courses).

alter table public.courses add column duration_label text;
