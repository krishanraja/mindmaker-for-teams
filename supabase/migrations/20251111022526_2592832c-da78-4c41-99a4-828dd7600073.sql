-- Clean up orphaned profiles that don't have matching auth.users entries
DELETE FROM public.profiles 
WHERE id NOT IN (SELECT id FROM auth.users);