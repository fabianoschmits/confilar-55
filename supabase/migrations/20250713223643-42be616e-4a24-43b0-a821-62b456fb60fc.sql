-- Create the upsert_profile function
CREATE OR REPLACE FUNCTION public.upsert_profile(
  _user_id uuid,
  _full_name text DEFAULT NULL,
  _avatar_url text DEFAULT NULL,
  _bio text DEFAULT NULL,
  _location text DEFAULT NULL,
  _phone text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, avatar_url, bio, location, phone, created_at, updated_at)
  VALUES (_user_id, _full_name, _avatar_url, _bio, _location, _phone, now(), now())
  ON CONFLICT (user_id) 
  DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    bio = COALESCE(EXCLUDED.bio, profiles.bio),
    location = COALESCE(EXCLUDED.location, profiles.location),
    phone = COALESCE(EXCLUDED.phone, profiles.phone),
    updated_at = now();
END;
$$;