-- Crear el trigger que ejecutará la limpieza de estadísticas semanales
DROP TRIGGER IF EXISTS auto_cleanup_weekly_stats ON players;
CREATE TRIGGER auto_cleanup_weekly_stats
    AFTER UPDATE OF weekly_stats ON players
    FOR EACH STATEMENT
    EXECUTE FUNCTION cleanup_old_weekly_stats();

-- Función para mostrar estadísticas de la semana actual
CREATE OR REPLACE FUNCTION get_current_week_stats(player_id UUID)
RETURNS JSONB AS $$
DECLARE
    current_week TEXT;
BEGIN
    current_week := DATE_TRUNC('week', CURRENT_DATE)::date::text;
    RETURN (
        SELECT COALESCE(
            weekly_stats->current_week,
            jsonb_build_object(
                'goals', 0,
                'assists', 0,
                'saves', 0,
                'matches', 0
            )
        )
        FROM players 
        WHERE id = player_id
    );
END;
$$ LANGUAGE plpgsql;

-- Función para obtener el historial de las últimas dos semanas
CREATE OR REPLACE FUNCTION get_last_two_weeks_stats(player_id UUID)
RETURNS TABLE (
    week_date DATE,
    stats JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        key::date as week_date,
        value as stats
    FROM jsonb_each((
        SELECT weekly_stats 
        FROM players 
        WHERE id = player_id
    ))
    WHERE key::date >= (DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '2 weeks')::date
    ORDER BY week_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener los mejores jugadores de la semana
CREATE OR REPLACE FUNCTION get_top_weekly_players(
    position_filter TEXT DEFAULT NULL,
    limit_count INTEGER DEFAULT 5
)
RETURNS TABLE (
    player_id UUID,
    player_name TEXT,
    player_team TEXT,
    weekly_goals INTEGER,
    weekly_assists INTEGER,
    weekly_saves INTEGER,
    weekly_matches INTEGER
) AS $$
DECLARE 
    current_week TEXT;
BEGIN
    current_week := DATE_TRUNC('week', CURRENT_DATE)::date::text;
    
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.team,
        (COALESCE((p.weekly_stats->current_week->>'goals')::integer, 0)) as weekly_goals,
        (COALESCE((p.weekly_stats->current_week->>'assists')::integer, 0)) as weekly_assists,
        (COALESCE((p.weekly_stats->current_week->>'saves')::integer, 0)) as weekly_saves,
        (COALESCE((p.weekly_stats->current_week->>'matches')::integer, 0)) as weekly_matches
    FROM players p
    WHERE 
        position_filter IS NULL OR p.position = position_filter
    ORDER BY
        CASE 
            WHEN p.position = 'portero' THEN weekly_saves
            ELSE (weekly_goals * 2 + weekly_assists)
        END DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Ejemplo de uso:
-- Obtener estadísticas actuales de un jugador:
-- SELECT get_current_week_stats('player-uuid');

-- Obtener historial de las últimas dos semanas:
-- SELECT * FROM get_last_two_weeks_stats('player-uuid');

-- Obtener top 5 jugadores de la semana:
-- SELECT * FROM get_top_weekly_players();

-- Obtener top 3 porteros de la semana:
-- SELECT * FROM get_top_weekly_players('portero', 3);