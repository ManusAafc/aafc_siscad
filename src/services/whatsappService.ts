import { webhookApi } from '../api/webhook';
import { ENV } from '../config/environment';
import { removeNonNumericChars } from '../utils/formatters';

export const whatsappService = {
  async sendWhatsAppList(
    meetingId: number,
    userId: number,
    msg?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      await webhookApi.sendWhatsappList({
        meetingId,
        userId,
        msg: msg || '',
      });
      return { success: true, message: 'Lista enviada com sucesso' };
    } catch (error) {
      console.error('Erro ao enviar lista WhatsApp:', error);
      return { success: false, message: 'Erro ao enviar lista' };
    }
  },

  async sendWhatsAppPrivate(
    whatsappId: string,
    msg: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      await webhookApi.sendWhatsappPrivate({
        whatsappId,
        msg,
      });
      return { success: true, message: 'Mensagem enviada com sucesso' };
    } catch (error) {
      console.error('Erro ao enviar mensagem WhatsApp:', error);
      return { success: false, message: 'Erro ao enviar mensagem' };
    }
  },

  formatMobileForWhatsApp(mobile: string): string {
    const digits = removeNonNumericChars(mobile);

    if (digits.length === 11) {
      return `55${digits}`;
    }

    if (digits.length === 13 && digits.startsWith('55')) {
      return digits;
    }

    return `55${digits}`;
  },

  formatWhatsappId(mobileMask: string): string {
    const digits = removeNonNumericChars(mobileMask);
    if (digits.length !== 11) return '';
    const withoutFifth = digits.substring(0, 4) + digits.substring(5);
    return `55${withoutFifth}@s.whatsapp.net`;
  },
};
