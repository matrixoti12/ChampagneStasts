-- Insert sample players with premium card data
INSERT INTO players (name, team, position, goals, assists, saves, mvp_count, rating, card_style, photo, league_logo_url, team_logo_url) VALUES
('Lionel Messi', 'Inter Miami', 'field', 15, 12, 0, 8, 5, 'cosmic', '/placeholder.svg?height=144&width=144', '/placeholder.svg?height=48&width=48', '/placeholder.svg?height=48&width=48'),
('Cristiano Ronaldo', 'Al Nassr', 'field', 18, 6, 0, 7, 5, 'elite', '/placeholder.svg?height=144&width=144', '/placeholder.svg?height=48&width=48', '/placeholder.svg?height=48&width=48'),
('Kylian Mbappé', 'PSG', 'field', 22, 8, 0, 9, 5, 'fire', '/placeholder.svg?height=144&width=144', '/placeholder.svg?height=48&width=48', '/placeholder.svg?height=48&width=48'),
('Erling Haaland', 'Manchester City', 'field', 25, 4, 0, 6, 5, 'diamond', '/placeholder.svg?height=144&width=144', '/placeholder.svg?height=48&width=48', '/placeholder.svg?height=48&width=48'),
('Thibaut Courtois', 'Real Madrid', 'goalkeeper', 0, 0, 85, 4, 4, 'holographic', '/placeholder.svg?height=144&width=144', '/placeholder.svg?height=48&width=48', '/placeholder.svg?height=48&width=48'),
('Alisson Becker', 'Liverpool', 'goalkeeper', 0, 1, 78, 3, 4, 'glass', '/placeholder.svg?height=144&width=144', '/placeholder.svg?height=48&width=48', '/placeholder.svg?height=48&width=48'),
('Kevin De Bruyne', 'Manchester City', 'field', 8, 16, 0, 5, 5, 'elite', '/placeholder.svg?height=144&width=144', '/placeholder.svg?height=48&width=48', '/placeholder.svg?height=48&width=48'),
('Virgil van Dijk', 'Liverpool', 'field', 3, 2, 0, 4, 4, 'diamond', '/placeholder.svg?height=144&width=144', '/placeholder.svg?height=48&width=48', '/placeholder.svg?height=48&width=48'),
('Tacua', 'Deportivo Saprissa', 'field', 3, 2, 0, 0, 4, 'glass', '/placeholder.svg?height=144&width=144', '/placeholder.svg?height=48&width=48', '/placeholder.svg?height=48&width=48');

-- Keep all other sample data the same
INSERT INTO teams (name, wins, draws, losses, points) VALUES
('Manchester City', 18, 4, 2, 58),
('Liverpool', 16, 6, 2, 54),
('Real Madrid', 17, 3, 4, 54),
('PSG', 19, 2, 3, 59),
('Inter Miami', 12, 8, 4, 44),
('Al Nassr', 15, 5, 4, 50),
('Deportivo Saprissa', 14, 6, 4, 48);

INSERT INTO standings (team_name, played, won, drawn, lost, goals_for, goals_against, goal_difference, points) VALUES
('PSG', 24, 19, 2, 3, 65, 18, 47, 59),
('Manchester City', 24, 18, 4, 2, 72, 22, 50, 58),
('Liverpool', 24, 16, 6, 2, 68, 25, 43, 54),
('Real Madrid', 24, 17, 3, 4, 58, 28, 30, 54),
('Al Nassr', 24, 15, 5, 4, 52, 24, 28, 50),
('Inter Miami', 24, 12, 8, 4, 45, 32, 13, 44),
('Deportivo Saprissa', 24, 14, 6, 4, 48, 28, 20, 48);
