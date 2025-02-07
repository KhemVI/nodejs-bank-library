CREATE TABLE IF NOT EXISTS books (
  book_id VARCHAR(36) DEFAULT (UUID()) PRIMARY KEY,
  title VARCHAR(511) NOT NULL,
  author VARCHAR(511),
  isbn VARCHAR(20) UNIQUE,
  category_id VARCHAR(36) NOT NULL,
  publish_year SMALLINT UNSIGNED,
  status ENUM('available', 'suspend') DEFAULT 'available',
  employee_id_created_by VARCHAR(36) NOT NULL,
  employee_id_updated_by VARCHAR(36) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  INDEX idx_title(title),
  FOREIGN KEY (category_id) REFERENCES categories (category_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
