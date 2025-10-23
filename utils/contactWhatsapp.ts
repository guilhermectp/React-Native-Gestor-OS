import { Alert, Linking } from "react-native";

const getPhoneForWhatsApp = (phone?: string) => {
  if (!phone) return null;

  const cleanPhone = phone.replace(/\D/g, "");

  if (cleanPhone.length === 11) {
    return `+55${cleanPhone}`;
  }

  if (cleanPhone.length === 10) {
    return `+5567${cleanPhone}`;
  }

  return cleanPhone;
};

export const contactWhatsapp = async (data: {
  nome: string;
  telefone: string;
}) => {
  const whatsappPhone = getPhoneForWhatsApp(data.telefone);

  if (!whatsappPhone) {
    Alert.alert("Erro", "Número de telefone não informado");
    return;
  }

  const message = `Olá ${data.nome}! Tudo bem?`;
  const url = `whatsapp://send?phone=${whatsappPhone}&text=${encodeURIComponent(
    message
  )}`;

  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      // Se WhatsApp não estiver instalado, abre no navegador
      const webUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
        message
      )}`;
      await Linking.openURL(webUrl);
    }
  } catch (error) {
    Alert.alert("Erro", "Não foi possível abrir o WhatsApp");
  }
};
