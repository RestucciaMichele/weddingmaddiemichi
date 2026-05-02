export interface RSVPData {
  email: string;
  nome: string;
  adulti: number;
  bambiniRidotti: number;
  bambiniGratuiti: number;
  note: string;
}

export interface RsvpDocument extends RSVPData {
  id: string;
}
