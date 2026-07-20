-- Default bucket file_size_limit was left null (falls back to the project's
-- global default, ~50MiB) — nowhere near enough for a real lecture video.
-- 500MiB is a reasonable ceiling for this MVP; revisit if the platform plan
-- itself caps individual file size lower than this.

update storage.buckets set file_size_limit = 524288000 where id = 'lesson-content';
