export interface BookingPayload {
  tourSlug: string;
  tourTitle: string;
  travelersCount: number;
  travelDate: string;
  pricePerPerson: number;
  totalPrice: number;
  currency: 'USD' | 'EUR';
  primaryTraveler: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    nationality?: string;
    specialRequests?: string;
  };
  locale: string;
}

export interface BookingResult {
  bookingRef: string;
  status: 'confirmed' | 'pending';
  message: string;
}

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface EmailPort {
  send(message: EmailMessage): Promise<void>;
}
