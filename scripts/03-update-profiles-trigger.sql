-- Actualizar trigger para crear perfiles automáticamente con información del registro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, nombre_completo, email, institucion, cargo, rol)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nombre_completo', ''),
    new.email,
    COALESCE(new.raw_user_meta_data->>'institucion', ''),
    COALESCE(new.raw_user_meta_data->>'cargo', ''),
    'usuario'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recrear el trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
