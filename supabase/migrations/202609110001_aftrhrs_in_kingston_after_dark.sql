-- AftrHrs is a Moment in Kingston After Dark, not a parallel scene.
INSERT INTO public.moment_scene_links (moment_id, scene_id, relationship)
SELECT '00000000-0000-0000-0002-000000000080'::uuid, s.id, 'featured'
FROM public.scenes s
WHERE s.slug = 'kingston-after-dark'
ON CONFLICT (moment_id, scene_id, relationship) DO NOTHING;
