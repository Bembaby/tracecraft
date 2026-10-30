import { getHostedRuntime } from '../server/runtime.mjs';
export default { async fetch(request) {
  try{return await getHostedRuntime().handler(request);}
  catch{console.error('TraceCraft account configuration unavailable');return Response.json({error:'Account service is not configured. Local practice remains available.'},{status:503,headers:{'Cache-Control':'no-store'}});}
}};
