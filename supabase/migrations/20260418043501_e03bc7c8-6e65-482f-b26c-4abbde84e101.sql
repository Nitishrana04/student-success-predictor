-- Remove duplicate predictions, keep only the latest one per student
DELETE FROM public.predictions
WHERE id NOT IN (
  SELECT DISTINCT ON (student_id) id
  FROM public.predictions
  ORDER BY student_id, predicted_at DESC NULLS LAST
);

-- Add unique constraint on student_id
ALTER TABLE public.predictions
ADD CONSTRAINT predictions_student_id_unique UNIQUE (student_id);