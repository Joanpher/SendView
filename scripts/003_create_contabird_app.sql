-- ============================================================
-- Script para crear la aplicación ContaBird en WordNotiCenter
-- Ejecutar este script en Supabase SQL Editor de WordNotiCenter
-- ============================================================

-- Primero, obtener el ID del usuario owner (el primer usuario admin)
-- Si no tienes usuarios, primero debes registrarte en WordNotiCenter

DO $$
DECLARE
  v_owner_id UUID;
  v_api_key TEXT := 'ntf_contabird_' || encode(gen_random_bytes(16), 'hex');
  v_app_id UUID;
BEGIN
  -- Obtener el primer usuario como owner (puedes cambiar esto por un ID específico)
  SELECT id INTO v_owner_id FROM auth.users LIMIT 1;
  
  IF v_owner_id IS NULL THEN
    RAISE EXCEPTION 'No hay usuarios registrados. Primero regístrate en WordNotiCenter.';
  END IF;

  -- Verificar si ya existe la aplicación ContaBird
  SELECT id INTO v_app_id FROM public.applications WHERE name = 'ContaBird' LIMIT 1;
  
  IF v_app_id IS NOT NULL THEN
    RAISE NOTICE 'La aplicación ContaBird ya existe con ID: %', v_app_id;
    -- Mostrar el API key existente
    SELECT api_key INTO v_api_key FROM public.applications WHERE id = v_app_id;
    RAISE NOTICE 'API Key existente: %', v_api_key;
  ELSE
    -- Crear la aplicación ContaBird
    INSERT INTO public.applications (name, api_key, owner_id, webhook_url, is_active)
    VALUES ('ContaBird', v_api_key, v_owner_id, NULL, true)
    RETURNING id INTO v_app_id;
    
    RAISE NOTICE '✅ Aplicación ContaBird creada exitosamente!';
    RAISE NOTICE 'App ID: %', v_app_id;
    RAISE NOTICE 'API Key: %', v_api_key;
    RAISE NOTICE '';
    RAISE NOTICE '📋 Agrega esta línea a tu .env.local de ContaBird:';
    RAISE NOTICE 'VITE_NOTI_CENTER_API_KEY=%', v_api_key;
  END IF;

  -- Crear el usuario admin que recibirá las notificaciones
  INSERT INTO public.app_users (app_id, external_user_id, email)
  VALUES (v_app_id, 'admin', 'admin@contabird.com')
  ON CONFLICT (app_id, external_user_id) DO NOTHING;
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ Usuario admin creado para recibir notificaciones';

END $$;

-- Mostrar la aplicación creada
SELECT id, name, api_key, is_active, created_at 
FROM public.applications 
WHERE name = 'ContaBird';
