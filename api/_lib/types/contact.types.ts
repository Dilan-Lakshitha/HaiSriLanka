export interface ContactPayload {
  name: string;
  email: string;
  whatsapp: string;
  message: string;
  locale: string;
}

export interface ContactResult {
  status: 'sent' | 'pending';
  message: string;
}
