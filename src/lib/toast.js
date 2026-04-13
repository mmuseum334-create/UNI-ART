import { sileo } from 'sileo';

// Fill actual — se actualiza sincrónicamente desde ThemedToaster al cambiar el tema
let _fill = '#eeeeee';
export const setToastFill = (fill) => { _fill = fill; };

const toOpts = (msg, desc) => {
  const base = typeof msg === 'object' && msg !== null
    ? msg
    : { title: msg, ...(desc ? { description: desc } : {}) };
  base.fill = _fill;
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

  confirm: (title, description, onConfirm) =>
    sileo.action({
      title,
      description,
      fill: _fill,
      duration: 5000,
      autopilot: { expand: 0, collapse: 4000 },
      button: { title: 'Eliminar', onClick: onConfirm },
    }),
};
