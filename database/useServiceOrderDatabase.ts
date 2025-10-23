import { useSQLiteContext } from "expo-sqlite";

export interface IServiceDatabase {
  id: number;
  client_id: number;
  numero_os: string;
  data_servico: string;
  equipamento_tipo: string;
  equipamento_marca: string;
  equipamento_modelo: string;
  equipamento_serie: string;
  servicos_realizados: string;
  valor_servicos: number;
  desconto: number;
  valor_total: number;
  observacoes: string;
  garantia_dias: number;
  status?: string;
}

export interface IServiceWithClient extends IServiceDatabase {
  client_nome: string;
  client_telefone: string;
  client_rua?: string;
  client_numero?: string;
  client_bairro?: string;
  client_complemento?: string;
}

export interface IServiceUpdate {
  id: number;
  data_servico: string;
  equipamento_tipo: string;
  equipamento_marca: string;
  equipamento_modelo: string;
  equipamento_serie: string;
  servicos_realizados: string;
  valor_servicos: number;
  desconto: number;
  valor_total: number;
  observacoes: string;
  garantia_dias: number;
}

export default function useServiceOrderDatabase() {
  const database = useSQLiteContext();

  async function create(data: Omit<IServiceDatabase, "id">) {
    const statement = await database.prepareAsync(
      "INSERT INTO service_orders (" +
        "client_id, numero_os, data_servico, " +
        "equipamento_tipo, equipamento_marca, equipamento_modelo, equipamento_serie, " +
        "servicos_realizados, valor_servicos, desconto, valor_total, observacoes, garantia_dias) " +
        "VALUES (" +
        "$client_id, $numero_os, $data_servico, " +
        "$equipamento_tipo, $equipamento_marca, $equipamento_modelo, $equipamento_serie, " +
        "$servicos_realizados, $valor_servicos, $desconto, $valor_total, $observacoes, $garantia_dias)"
    );

    try {
      const result = await statement.executeAsync({
        $client_id: data.client_id,
        $numero_os: data.numero_os,
        $data_servico: data.data_servico,
        $equipamento_tipo: data.equipamento_tipo,
        $equipamento_marca: data.equipamento_marca,
        $equipamento_modelo: data.equipamento_modelo,
        $equipamento_serie: data.equipamento_serie,
        $servicos_realizados: data.servicos_realizados,
        $valor_servicos: data.valor_servicos,
        $desconto: data.desconto,
        $valor_total: data.valor_total,
        $observacoes: data.observacoes,
        $garantia_dias: data.garantia_dias,
      });

      const insertedRowId = result.lastInsertRowId.toString();

      return { insertedRowId };
    } catch (error) {
      throw error;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async function searchByStatus(status: string) {
    const query =
      "SELECT " +
      "so.*, " +
      "c.nome as client_nome, " +
      "c.telefone as client_telefone " +
      "FROM service_orders so " +
      "LEFT JOIN clients c ON so.client_id = c.id " +
      "WHERE so.status LIKE ? " +
      "ORDER BY so.data_servico DESC";

    try {
      const result = await database.getAllAsync<IServiceWithClient>(
        query,
        `%${status}%`
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  async function getAll() {
    const query =
      "SELECT " +
      "so.*, " +
      "c.nome as client_nome, " +
      "c.telefone as client_telefone " +
      "FROM service_orders so " +
      "LEFT JOIN clients c ON so.client_id = c.id " +
      "ORDER BY so.data_servico DESC";

    try {
      const result = await database.getAllAsync<IServiceWithClient>(query);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async function getById(id: number) {
    const query =
      "SELECT " +
      "so.*, " +
      "c.nome as client_nome, " +
      "c.telefone as client_telefone, " +
      "c.rua as client_rua, " +
      "c.numero as client_numero, " +
      "c.bairro as client_bairro, " +
      "c.complemento as client_complemento " +
      "FROM service_orders so " +
      "LEFT JOIN clients c ON so.client_id = c.id " +
      "WHERE so.id = ?";

    try {
      const result = await database.getFirstAsync<IServiceWithClient>(
        query,
        id
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  async function update(data: IServiceUpdate) {
    const statement = await database.prepareAsync(
      "UPDATE service_orders SET " +
        "data_servico = $data_servico, " +
        "equipamento_tipo = $equipamento_tipo, " +
        "equipamento_marca = $equipamento_marca, " +
        "equipamento_modelo = $equipamento_modelo, " +
        "equipamento_serie = $equipamento_serie, " +
        "servicos_realizados = $servicos_realizados, " +
        "valor_servicos = $valor_servicos, " +
        "desconto = $desconto, " +
        "valor_total = $valor_total, " +
        "observacoes = $observacoes, " +
        "garantia_dias = $garantia_dias " +
        "WHERE id = $id"
    );

    try {
      await statement.executeAsync({
        $id: data.id,
        $data_servico: data.data_servico,
        $equipamento_tipo: data.equipamento_tipo,
        $equipamento_marca: data.equipamento_marca,
        $equipamento_modelo: data.equipamento_modelo,
        $equipamento_serie: data.equipamento_serie,
        $servicos_realizados: data.servicos_realizados,
        $valor_servicos: data.valor_servicos,
        $desconto: data.desconto,
        $valor_total: data.valor_total,
        $observacoes: data.observacoes,
        $garantia_dias: data.garantia_dias,
      });
    } catch (error) {
      throw error;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async function updateStatus(data: { id: number; status: string }) {
    const statement = await database.prepareAsync(
      "UPDATE service_orders SET " + "status = $status " + "WHERE id = $id"
    );

    try {
      await statement.executeAsync({
        $id: data.id,
        $status: data.status,
      });
    } catch (error) {
      throw error;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async function remove(id: number) {
    try {
      await database.execAsync("DELETE FROM service_orders WHERE id = " + id);
    } catch (error) {
      throw error;
    }
  }

  return {
    create,
    getAll,
    searchByStatus,
    getById,
    update,
    updateStatus,
    remove,
  };
}
