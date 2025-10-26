-- Таблица пользователей
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица банковских карт
CREATE TABLE cards (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    card_number VARCHAR(19) NOT NULL,
    masked_number VARCHAR(19) NOT NULL,
    card_type VARCHAR(20) NOT NULL CHECK (card_type IN ('virtual', 'physical')),
    balance DECIMAL(15, 2) DEFAULT 0.00,
    color_scheme VARCHAR(50) DEFAULT 'from-purple-500 to-pink-500',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица транзакций
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    card_id INTEGER NOT NULL REFERENCES cards(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('incoming', 'outgoing')),
    amount DECIMAL(15, 2) NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрого поиска
CREATE INDEX idx_cards_user_id ON cards(user_id);
CREATE INDEX idx_transactions_card_id ON transactions(card_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Вставляем тестового админа (пароль: 18181818, хешированный)
INSERT INTO users (username, email, password_hash, full_name, is_admin) 
VALUES ('XeX', 'admin@neobank.com', '18181818', 'Администратор', TRUE);

-- Вставляем тестового пользователя
INSERT INTO users (username, email, password_hash, full_name, is_admin) 
VALUES ('user1', 'user@example.com', 'password123', 'Алексей Иванов', FALSE);

-- Вставляем тестовые карты для пользователя
INSERT INTO cards (user_id, card_number, masked_number, card_type, balance, color_scheme) 
VALUES 
(2, '4532123456788901', '4532 •••• •••• 8901', 'virtual', 125430.50, 'from-purple-500 to-pink-500'),
(2, '5421987654323456', '5421 •••• •••• 3456', 'physical', 48250.00, 'from-blue-500 to-cyan-500');

-- Вставляем тестовые транзакции
INSERT INTO transactions (card_id, user_id, transaction_type, amount, recipient, status) 
VALUES 
(1, 2, 'incoming', 15000.00, 'Мария Петрова', 'completed'),
(1, 2, 'outgoing', 3200.00, 'Ozon', 'completed'),
(1, 2, 'outgoing', 850.00, 'Starbucks', 'completed'),
(2, 2, 'incoming', 52000.00, 'Зарплата', 'completed');
