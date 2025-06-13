-- Agregar la columna partidos a la tabla players si no existe
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS partidos INTEGER DEFAULT 0;

-- Crear índice para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_players_partidos ON players(partidos);

-- Actualizar jugadores existentes con algunos partidos de ejemplo
UPDATE players SET partidos = 
  CASE 
    WHEN goals > 15 THEN 12
    WHEN goals > 10 THEN 8
    WHEN goals > 5 THEN 6
    ELSE 3
  END
WHERE partidos = 0 OR partidos IS NULL;
