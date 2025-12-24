-- ============================================================
-- SETUP CONTABIRD EN WORDNOTICENTER
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Crear aplicación ContaBird (cambia el owner_id por tu ID de usuario)
INSERT INTO public.applications (name, api_key, owner_id, is_active)
SELECT 
  'ContaBird',
  'ntf_contabird_prod_2024',
  id,
  true
FROM auth.users 
LIMIT 1
ON CONFLICT DO NOTHING;

-- 2. Crear usuario admin para recibir notificaciones
INSERT INTO public.app_users (app_id, external_user_id, email)
SELECT 
  a.id,
  'admin',
  'admin@contabird.com'
FROM public.applications a
WHERE a.name = 'ContaBird'
ON CONFLICT (app_id, external_user_id) DO NOTHING;

-- 3. Ver el API key generado
SELECT 
  '✅ Configuración completada!' as status,
  name,
  api_key as "COPIA_ESTE_API_KEY",
  is_active
FROM public.applications 
WHERE name = 'ContaBird';
