export interface Payload {
  xsrf?: string;
}

export const isPayload = (val: unknown): val is Payload => {
  return true;
};
