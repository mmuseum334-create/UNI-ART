import { sileo } from 'sileo';

// sileo expects an object: { title, description }
// We accept either a string (becomes title) or { title, description }
const toOpts = (msg, desc) => {
  if (typeof msg === 'object' && msg !== null) return msg;
  return { title: msg, ...(desc ? { description: desc } : {}) };
};

export const toast = {
  success: (msg, desc) => sileo.success(toOpts(msg, desc)),
  error:   (msg, desc) => sileo.error(toOpts(msg, desc)),
  warning: (msg, desc) => sileo.warning(toOpts(msg, desc)),
  info:    (msg, desc) => sileo.info(toOpts(msg, desc)),
  loading: (msg, desc) => sileo.show({ ...toOpts(msg, desc), type: 'loading' }),
  promise: (p, msgs)   => sileo.promise(p, msgs),
  dismiss: ()          => sileo.dismiss(),
};
