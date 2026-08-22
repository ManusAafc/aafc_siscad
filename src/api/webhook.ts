import apiClient from './client';

// As chaves sensíveis (EVO_API_KEY, etc.) devem ser gerenciadas no backend
// via Supabase Edge Functions. Este proxy rota as chamadas sem expor chaves.
export const webhookApi = {
  async sendWhatsappList(params: {
    meetingId: number;
    userId: number;
    msg?: string;
  }) {
    const response = await apiClient.post('/rpc/fc_whatsapp_meeting_list', {
      p_meeting_id: params.meetingId,
      p_user_id: params.userId,
      p_msg: params.msg || '',
    });
    return response.data;
  },

  async sendWhatsappPrivate(params: {
    whatsappId: string;
    msg: string;
  }) {
    const response = await apiClient.post('/rpc/fc_whatsapp_private_send', {
      p_whatsapp_id: params.whatsappId,
      p_msg: params.msg,
    });
    return response.data;
  },
};
