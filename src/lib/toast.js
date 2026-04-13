import { sileo } from 'sileo';

export const toast = {
  success: (msg)          => sileo.success(msg),
  error:   (msg)          => sileo.error(msg),
  warning: (msg)          => sileo.warning(msg),
  info:    (msg)          => sileo.info(msg),
  loading: (msg)          => sileo.show(msg),
  promise: (p, msgs)      => sileo.promise(p, msgs),
  dismiss: ()             => sileo.dismiss(),
};
