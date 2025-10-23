import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { IServiceWithClient } from "../database/useServiceOrderDatabase";

export async function generateServicePDF(service: IServiceWithClient) {
  const formatDate = (isoDate: string) => {
    const [year, month, day] = isoDate.split("-");
    return `${day}/${month}/${year}`;
  };

  const formatCurrency = (value: number) => {
    return value.toFixed(2).replace(".", ",");
  };

  const formatAddress = () => {
    const parts = [
      service.client_rua,
      service.client_numero && `nº ${service.client_numero}`,
      service.client_bairro,
    ]
      .filter(Boolean)
      .join(", ");

    return parts || "Endereço não informado";
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
          padding: 40px;
          color: #1F2937;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: end;
          margin-bottom: 20px;
          border-bottom: 3px solid #3b82f6;
          padding: 0 10px 10px 10px;
          border-radius: 20px;
        }

        .header h1 {
          color: #3b82f6;
          font-size: 24px;
        }

        .header .os-number {
          font-size: 18px;
          color: #6b7280;
          font-weight: 600;
        }

        .header .os-date {
          font-size: 18px;
          color: #6b7280;
          font-weight: 600;
        }
        
        .section {
          margin-bottom: 20px;
          padding: 20px;
          background-color: #F9FAFB;
          border-radius: 8px;
          border-left: 4px solid #3B82F6;
        }
        
        .section-title {
          font-size: 18px;
          font-weight: 700;
          color: #1F2937;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
        }
        
        .info-row {
          display: flex;
          margin-bottom: 8px;
          font-size: 14px;
        }
        
        .info-label {
          font-weight: 600;
          color: #6B7280;
          min-width: 120px;
        }
        
        .info-value {
          color: #1F2937;
          flex: 1;
        }
        
        .address-complement {
          margin-left: 120px;
          color: #6B7280;
          font-size: 13px;
          margin-top: -4px;
        }
        
        .description-box {
          background-color: white;
          padding: 15px;
          border-radius: 6px;
          margin-top: 10px;
          border-left: 3px solid #10B981;
        }
        
        .description-label {
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
          font-size: 14px;
        }
        
        .description-text {
          color: #1F2937;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .values-table {
          background-color: white;
          padding: 15px;
          border-radius: 6px;
          margin-top: 10px;
        }
        
        .value-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
        }
        
        .value-row.total {
          border-top: 2px solid #E5E7EB;
          margin-top: 8px;
          padding-top: 12px;
          font-weight: 700;
          font-size: 16px;
        }
        
        .value-row.total .value {
          color: #3B82F6;
          font-size: 18px;
        }
        
        .discount {
          color: #EF4444;
        }
        
        .observations-box {
          background-color: #FEF3C7;
          padding: 15px;
          border-radius: 6px;
          margin-top: 10px;
          border-left: 3px solid #F59E0B;
        }
        
        .observations-label {
          font-weight: 600;
          color: #78350F;
          margin-bottom: 8px;
          font-size: 14px;
        }
        
        .observations-text {
          color: #92400E;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .warranty-box {
          background-color: #D1FAE5;
          padding: 12px 15px;
          border-radius: 6px;
          margin-top: 10px;
          color: #065F46;
          font-weight: 600;
          font-size: 14px;
          border-left: 3px solid #10B981;
        }
        
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #E5E7EB;
          text-align: center;
          color: #9CA3AF;
          font-size: 12px;
        }
        
        .empty-text {
          color: #9CA3AF;
          font-style: italic;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="os-number">OS #${service.numero_os}</div>
        <h1>Ordem de Serviço</h1>
        <div class="os-date">
          ${formatDate(service.data_servico)}
        </div>
      </div>

      <!-- Cliente -->
      <div class="section">
        <div class="section-title">Cliente</div>
        <div class="info-row">
          <span class="info-label">Nome:</span>
          <span class="info-value">${service.client_nome}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Telefone:</span>
          <span class="info-value">${
            service.client_telefone || "Não informado"
          }</span>
        </div>
        <div class="info-row">
          <span class="info-label">Endereço:</span>
          <span class="info-value">${formatAddress()}</span>
        </div>
        ${
          service.client_complemento
            ? `
          <div class="address-complement">${service.client_complemento}</div>
        `
            : ""
        }
      </div>

      <!-- Equipamento -->
      <div class="section">
        <div class="section-title">Equipamento</div>
        ${
          service.equipamento_tipo
            ? `
          <div class="info-row">
            <span class="info-label">Tipo:</span>
            <span class="info-value">${service.equipamento_tipo}</span>
          </div>
        `
            : ""
        }
        ${
          service.equipamento_marca
            ? `
          <div class="info-row">
            <span class="info-label">Marca:</span>
            <span class="info-value">${service.equipamento_marca}</span>
          </div>
        `
            : ""
        }
        ${
          service.equipamento_modelo
            ? `
          <div class="info-row">
            <span class="info-label">Modelo:</span>
            <span class="info-value">${service.equipamento_modelo}</span>
          </div>
        `
            : ""
        }
        ${
          service.equipamento_serie
            ? `
          <div class="info-row">
            <span class="info-label">Série:</span>
            <span class="info-value">${service.equipamento_serie}</span>
          </div>
        `
            : ""
        }
        ${
          !service.equipamento_tipo &&
          !service.equipamento_marca &&
          !service.equipamento_modelo &&
          !service.equipamento_serie
            ? `
          <div class="empty-text">Nenhuma informação de equipamento cadastrada</div>
        `
            : ""
        }
      </div>

      <!-- Serviços -->
      <div class="section">
        <div class="section-title">Serviços Realizados</div>
        <div class="description-box">
          <div class="description-label">Descrição:</div>
          <div class="description-text">
            ${service.servicos_realizados || "Não informado"}
          </div>
        </div>
        
        <div class="values-table">
          <div class="value-row">
            <span>Valor dos Serviços:</span>
            <span>R$ ${formatCurrency(service.valor_servicos)}</span>
          </div>
          ${
            service.desconto > 0
              ? `
            <div class="value-row discount">
              <span>Desconto:</span>
              <span>- R$ ${formatCurrency(service.desconto)}</span>
            </div>
          `
              : ""
          }
          <div class="value-row total">
            <span>Valor Total:</span>
            <span class="value">R$ ${formatCurrency(service.valor_total)}</span>
          </div>
        </div>

        ${
          service.observacoes
            ? `
          <div class="observations-box">
            <div class="observations-label">Observações:</div>
            <div class="observations-text">${service.observacoes}</div>
          </div>
        `
            : ""
        }

        ${
          service.garantia_dias > 0
            ? `
          <div class="warranty-box">
            🛡️ Garantia de ${service.garantia_dias} dias
          </div>
        `
            : ""
        }
      </div>

      <div class="footer">
        Documento gerado automaticamente em ${new Date().toLocaleString(
          "pt-BR"
        )}
      </div>
    </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html });
    return uri;
  } catch (error) {
    throw new Error("Erro ao gerar PDF");
  }
}

export async function shareServicePDF(service: IServiceWithClient) {
  try {
    const pdfUri = await generateServicePDF(service);

    // Verifica se compartilhamento está disponível
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new Error("Compartilhamento não disponível neste dispositivo");
    }

    // Compartilha direto o PDF gerado
    await Sharing.shareAsync(pdfUri, {
      mimeType: "application/pdf",
      dialogTitle: `Ordem de Serviço #${service.numero_os}`,
      UTI: "com.adobe.pdf",
    });
  } catch (error) {
    console.error("Erro ao compartilhar PDF:", error);
    throw error;
  }
}
