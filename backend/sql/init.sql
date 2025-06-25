-- HabitFlow Database Initialization Script
-- This script will be run when the PostgreSQL container starts

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create habits table
CREATE TABLE IF NOT EXISTS habits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    color VARCHAR(7) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    
    -- Add constraints
    CONSTRAINT habits_name_not_empty CHECK (length(trim(name)) > 0),
    CONSTRAINT habits_category_not_empty CHECK (length(trim(category)) > 0),
    CONSTRAINT habits_color_format CHECK (color ~ '^#[0-9A-Fa-f]{6}$')
);

-- Create habit_entries table
CREATE TABLE IF NOT EXISTS habit_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    habit_id UUID NOT NULL,
    date DATE NOT NULL,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    CONSTRAINT fk_habit_entries_habit_id 
        FOREIGN KEY (habit_id) 
        REFERENCES habits(id) 
        ON DELETE CASCADE,
    
    -- Unique constraint for habit + date combination
    CONSTRAINT uk_habit_entries_habit_date 
        UNIQUE(habit_id, date),
    
    -- Check constraint
    CONSTRAINT habit_entries_valid_date 
        CHECK (date <= CURRENT_DATE)
);

-- Create user_settings table for app preferences
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL DEFAULT 'default_user',
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint for user_id
    CONSTRAINT uk_user_settings_user_id UNIQUE(user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_habits_category ON habits(category);
CREATE INDEX IF NOT EXISTS idx_habits_active ON habits(is_active);
CREATE INDEX IF NOT EXISTS idx_habits_created_at ON habits(created_at);

CREATE INDEX IF NOT EXISTS idx_habit_entries_habit_id ON habit_entries(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_entries_date ON habit_entries(date);
CREATE INDEX IF NOT EXISTS idx_habit_entries_completed ON habit_entries(completed);
CREATE INDEX IF NOT EXISTS idx_habit_entries_habit_date ON habit_entries(habit_id, date);
CREATE INDEX IF NOT EXISTS idx_habit_entries_date_completed ON habit_entries(date, completed);

CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Create function to automatically update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_habits_updated_at ON habits;
CREATE TRIGGER update_habits_updated_at
    BEFORE UPDATE ON habits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_settings_updated_at ON user_settings;
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically set completed_at when completed changes to true
CREATE OR REPLACE FUNCTION set_completed_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.completed = true AND (OLD.completed IS NULL OR OLD.completed = false) THEN
        NEW.completed_at = CURRENT_TIMESTAMP;
    ELSIF NEW.completed = false THEN
        NEW.completed_at = NULL;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for completed_at
DROP TRIGGER IF EXISTS set_habit_entry_completed_at ON habit_entries;
CREATE TRIGGER set_habit_entry_completed_at
    BEFORE INSERT OR UPDATE ON habit_entries
    FOR EACH ROW
    EXECUTE FUNCTION set_completed_at();

-- Insert some sample data (optional)
INSERT INTO habits (name, description, category, color) VALUES
    ('Morning Exercise', 'Start the day with 30 minutes of exercise', 'Health & Fitness', '#FF6B6B'),
    ('Read for 30 minutes', 'Read books or articles to expand knowledge', 'Learning', '#4ECDC4'),
    ('Drink 8 glasses of water', 'Stay hydrated throughout the day', 'Health & Fitness', '#45B7D1'),
    ('Meditate', '10 minutes of mindfulness meditation', 'Mental Health', '#96CEB4'),
    ('Write in journal', 'Reflect on the day and write thoughts', 'Productivity', '#FECA57')
ON CONFLICT DO NOTHING;

-- Insert default user settings
INSERT INTO user_settings (user_id, settings) VALUES
    ('default_user', '{
        "theme": "light",
        "notifications": {
            "enabled": true,
            "time": "09:00",
            "sound": true
        },
        "display": {
            "showCompletionRate": true,
            "showStreaks": true,
            "defaultView": "daily"
        },
        "ai": {
            "enabled": false,
            "autoSuggestions": true,
            "weeklyInsights": true,
            "correlationAnalysis": true,
            "predictionEnabled": true,
            "maxSuggestions": 5
        }
    }')
ON CONFLICT (user_id) DO NOTHING;

-- Create a view for habit analytics
CREATE OR REPLACE VIEW habit_analytics AS
SELECT 
    h.id,
    h.name,
    h.category,
    h.color,
    h.created_at,
    COUNT(he.id) as total_entries,
    COUNT(CASE WHEN he.completed = true THEN 1 END) as completed_entries,
    ROUND(
        COUNT(CASE WHEN he.completed = true THEN 1 END) * 100.0 / 
        NULLIF(COUNT(he.id), 0), 2
    ) as completion_rate,
    MAX(CASE WHEN he.completed = true THEN he.date END) as last_completed_date,
    MIN(he.date) as first_entry_date,
    MAX(he.date) as last_entry_date
FROM habits h
LEFT JOIN habit_entries he ON h.id = he.habit_id
WHERE h.is_active = true
GROUP BY h.id, h.name, h.category, h.color, h.created_at
ORDER BY h.created_at DESC;

-- Create a function to calculate current streak
CREATE OR REPLACE FUNCTION get_current_streak(habit_uuid UUID)
RETURNS INTEGER AS $
DECLARE
    streak_count INTEGER;
BEGIN
    WITH RECURSIVE dates AS (
        SELECT 
            CASE 
                WHEN (SELECT completed FROM habit_entries WHERE habit_id = habit_uuid AND date = CURRENT_DATE) THEN CURRENT_DATE
                ELSE CURRENT_DATE - INTERVAL '1 day'
            END as d
        UNION ALL
        SELECT d - INTERVAL '1 day' FROM dates
        WHERE (SELECT completed FROM habit_entries WHERE habit_id = habit_uuid AND date = d - INTERVAL '1 day')
    )
    SELECT count(*) INTO streak_count FROM dates;
    RETURN streak_count;
END;
$ language 'plpgsql';

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO habitflow_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO habitflow_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO habitflow_user;

-- Create backup user (read-only)
-- CREATE USER habitflow_backup WITH PASSWORD 'backup_password';
-- GRANT CONNECT ON DATABASE habitflow TO habitflow_backup;
-- GRANT USAGE ON SCHEMA public TO habitflow_backup;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO habitflow_backup;

-- Log completion
SELECT 'HabitFlow database initialization completed successfully!' as message; 