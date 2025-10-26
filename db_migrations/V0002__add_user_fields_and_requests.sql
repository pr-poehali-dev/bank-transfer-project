-- Добавляем новые поля в таблицу users
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_year INTEGER;

-- Обновляем структуру cards для статусов
ALTER TABLE cards ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'blocked', 'frozen'));
ALTER TABLE cards ADD COLUMN IF NOT EXISTS card_category VARCHAR(20) DEFAULT 'debit' CHECK (card_category IN ('debit', 'credit'));

-- Создаем таблицу заявок на карты
CREATE TABLE IF NOT EXISTS card_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    card_category VARCHAR(20) NOT NULL CHECK (card_category IN ('debit', 'credit')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

-- Создаем индексы
CREATE INDEX IF NOT EXISTS idx_card_requests_user_id ON card_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_card_requests_status ON card_requests(status);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- Обновляем существующих пользователей
UPDATE users SET first_name = 'Администратор', last_name = 'Системы', phone = '+79999999999', birth_year = 1990 WHERE username = 'XeX';
UPDATE users SET first_name = 'Алексей', last_name = 'Иванов', phone = '+79001234567', birth_year = 1995 WHERE username = 'user1';
