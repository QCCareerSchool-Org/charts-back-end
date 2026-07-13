export interface Payload {
  xsrf?: string;
}

export const isPayload = (val: unknown): val is Payload => {
  return typeof val === 'object' && val !== null
    && (('xsrf' in val && typeof val.xsrf === 'string') || (!('xsrf' in val)));
};
