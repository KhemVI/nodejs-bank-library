CREATE TABLE IF NOT EXISTS books (
  book_id VARCHAR(36) DEFAULT (UUID()) PRIMARY KEY,
  title VARCHAR(511) NOT NULL,
  author VARCHAR(511),
  isbn VARCHAR(20),
  category_id VARCHAR(36),
  publish_year SMALLINT UNSIGNED,
  status ENUM('active', 'suspended') DEFAULT 'active',
  employee_id_created_by VARCHAR(36) NOT NULL,
  employee_id_updated_by VARCHAR(36) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  INDEX idx_title(title),
  INDEX idx_isbn(isbn),
  FOREIGN KEY (employee_id_created_by) REFERENCES employees (employee_id) ON UPDATE CASCADE,
  FOREIGN KEY (employee_id_updated_by) REFERENCES employees (employee_id) ON UPDATE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(category_id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
