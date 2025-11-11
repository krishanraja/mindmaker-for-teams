-- Improve handle_new_user_profile function with collision handling
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_base_username text;
  v_username text;
  v_counter int := 0;
BEGIN
  -- Get base username from metadata or email
  v_base_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    SPLIT_PART(NEW.email, '@', 1)
  );
  
  -- Ensure it meets constraints (alphanumeric + underscore, 3-20 chars)
  v_base_username := regexp_replace(v_base_username, '[^a-zA-Z0-9_]', '_', 'g');
  v_base_username := substring(v_base_username, 1, 15); -- Leave room for suffix
  
  -- If too short, pad it
  IF length(v_base_username) < 3 THEN
    v_base_username := v_base_username || '_user';
  END IF;
  
  v_username := v_base_username;
  
  -- Handle collisions by appending a number
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = v_username) LOOP
    v_counter := v_counter + 1;
    v_username := v_base_username || '_' || v_counter;
  END LOOP;
  
  -- Insert profile with collision-safe username
  INSERT INTO public.profiles (id, username, display_name, email)
  VALUES (
    NEW.id,
    v_username,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'username',
      v_base_username
    ),
    NEW.email
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block user creation
    RAISE WARNING 'Error in handle_new_user_profile: %', SQLERRM;
    RETURN NEW;
END;
$function$;