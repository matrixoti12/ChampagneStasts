-- Función para limpiar comentarios automáticamente cada 2 semanas
CREATE OR REPLACE FUNCTION cleanup_old_comments()
RETURNS void AS $$
BEGIN
  -- Eliminar comentarios más antiguos de 2 semanas
  DELETE FROM comments 
  WHERE created_at < NOW() - INTERVAL '14 days';
  
  -- Log de la limpieza
  INSERT INTO comments (user_name, message, is_processed)
  VALUES ('Sistema', '🧹 Chat limpiado automáticamente - comentarios antiguos eliminados', true);
END;
$$ LANGUAGE plpgsql;

-- Crear tabla para tracking de limpiezas automáticas
CREATE TABLE IF NOT EXISTS auto_cleanups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cleanup_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  comments_deleted INTEGER DEFAULT 0
);
