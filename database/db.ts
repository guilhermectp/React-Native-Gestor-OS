import { type SQLiteDatabase } from "expo-sqlite";

export async function initializeDatabase(database: SQLiteDatabase) {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      telefone TEXT NOT NULL,
      rua TEXT NOT NULL,
      numero TEXT NOT NULL,
      bairro TEXT,
      complemento TEXT
    );

   CREATE TABLE IF NOT EXISTS service_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      numero_os TEXT NOT NULL,
      data_servico TEXT NOT NULL,
      equipamento_tipo TEXT,
      equipamento_marca TEXT,
      equipamento_modelo TEXT,
      equipamento_serie TEXT,
      servicos_realizados TEXT,
      valor_servicos REAL NOT NULL DEFAULT 0,
      desconto REAL NOT NULL DEFAULT 0,
      valor_total REAL NOT NULL DEFAULT 0,
      observacoes TEXT,
      garantia_dias INTEGER DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pendente',
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
    );
    `);
}
