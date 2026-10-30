import {dayKey} from './training-state.mjs';
/** Known help remains associated with a carried draft until a later fresh start. */
export function javaDraftAssistance(training,id,today=dayKey()){
  const key='java:'+id,fresh=training.fresh[key]||'';let mode='independent';
  for(const [record,value] of Object.entries(training.help)){
    const date=record.slice(0,10);
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||date>today||!record.endsWith(':'+key)||fresh>date)continue;
    if(value==='solution')return 'solution';if(value==='hint')mode='hint';
  }
  return mode;
}
