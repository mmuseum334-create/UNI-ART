import { sileo } from 'sileo';

const toOpts = (msg, desc) => {
  const base = typeof msg === 'object' && msg !== null
    ? msg
    : { title: msg, ...(desc ? { description: desc } : {}) };
  if (base.description) {
    base.autopilot = { expand: 0, collapse: 5500 };
  }
  return base;
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
