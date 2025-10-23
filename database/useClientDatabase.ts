import { useSQLiteContext } from "expo-sqlite";

export interface IClientDatabase {
  id: number;
  nome: string;
  telefone: string;
  rua: string;
  numero: string;
  bairro: string;
  complemento: string;
}

// Omit serve para 'remover' uma chave de uma tipagem
export default function useClientDatabase() {
  const database = useSQLiteContext();

  async function create(data: Omit<IClientDatabase, "id">) {
    const statement = await database.prepareAsync(
      "INSERT INTO clients (nome, telefone, rua, numero, bairro, complemento) VALUES ($nome, $telefone, $rua, $numero, $bairro, $complemento)"
    );

    try {
      const result = await statement.executeAsync({
        $nome: data.nome,
        $telefone: data.telefone,
        $rua: data.rua,
        $numero: data.numero,
        $bairro: data.bairro,
        $complemento: data.complemento,
      });

      const insertedRowId = result.lastInsertRowId.toString();

      return { insertedRowId };
    } catch (error) {
      throw error;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async function searchByName(nome: string) {
    const query = "SELECT * FROM clients WHERE nome LIKE ?";

    try {
      const result = await database.getAllAsync<IClientDatabase>(
        query,
        `%${nome}%`
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  async function getById(id: number) {
    const query = "SELECT * FROM clients WHERE id = " + id;

    try {
      const result = await database.getFirstAsync<IClientDatabase>(query);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async function update(data: IClientDatabase) {
    const statement = await database.prepareAsync(
      "UPDATE clients SET nome = $nome, telefone = $telefone, rua = $rua, numero = $numero, bairro = $bairro, complemento = $complemento WHERE id = $id"
    );

    try {
      await statement.executeAsync({
        $id: data.id,
        $nome: data.nome,
        $telefone: data.telefone,
        $rua: data.rua,
        $numero: data.numero,
        $bairro: data.bairro,
        $complemento: data.complemento,
      });
    } catch (error) {
      throw error;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async function remove(id: number) {
    try {
      await database.execAsync("DELETE FROM clients WHERE id = " + id);
    } catch (error) {
      throw error;
    }
  }

  return { create, searchByName, update, remove, getById };
}
