import {HTTP_LESSONS,REST_LESSONS} from './api-http-content.mjs';
import {PROTOCOL_LESSONS} from './api-protocol-content.mjs';
import {EVENT_LESSONS} from './api-event-content.mjs';
import {REALTIME_LESSONS} from './api-realtime-content.mjs';
export {API_REVISION,API_SOURCES} from './api-content-helpers.mjs';
export const API_VIDEO={url:'https://www.youtube.com/watch?v=pBASqUbZgkY',title:'Every Type of API Simply Explained in 9 Minutes!',channel:'Codist',reviewed:'2026-10-29'};
export const API_TRACKS=[
 {id:'http',title:'HTTP from zero',description:'Read the conversation before choosing an API style.',color:'blue',icon:'code',video:null,checkpoint:'Read a request and response, explain a network failure, and check a permission boundary.'},
 {id:'rest',title:'REST and resource APIs',description:'Build a resource contract you can read, change and debug.',color:'mint',icon:'bag',video:0,checkpoint:'Design owned resources, choose methods, explain retries, revalidation and a stale-write failure.'},
 {id:'soap',title:'SOAP and service contracts',description:'Read envelopes, namespaces and faults without magic guarantees.',color:'gold',icon:'chest',video:86,checkpoint:'Read a SOAP 1.2 message and fault, find the service contract and explain an uncertain outcome.'},
 {id:'grpc',title:'RPC and gRPC',description:'Follow typed remote calls, streams and deadline failures.',color:'blue',icon:'gate',video:173,checkpoint:'Read a .proto method, choose a stream pattern and handle deadline or cancellation outcomes.'},
 {id:'graphql',title:'GraphQL',description:'Select fields, read partial errors and bound expensive work.',color:'pink',icon:'flask',video:275,checkpoint:'Read a schema and query, use variables, handle partial data and explain cost limits.'},
 {id:'webhooks',title:'Webhooks',description:'Receive event callbacks safely through retries and gaps.',color:'orange',icon:'battery',video:371,checkpoint:'Explain raw-body signature verification, atomic deduplication, durable acceptance and reconciliation.'},
 {id:'websockets',title:'WebSockets',description:'Keep a two-way conversation honest when connections drop.',color:'violet',icon:'gate',video:454,checkpoint:'Handle connection state, message validation, backpressure, acknowledgements and reconnect gaps.'},
 {id:'webrtc',title:'WebRTC',description:'Connect media and data through signaling, peers and relays.',color:'gold',icon:'star',video:510,checkpoint:'Separate signaling, ICE, STUN, TURN and SFU roles; handle capture permission and delivery policies.'},
 {id:'sse',title:'SSE and choosing a pattern',description:'Compare a one-way event feed with the other families.',color:'blue',icon:'code',video:null,checkpoint:'Read an SSE event, explain replay retention and defend an API choice from requirements.'}
];
export const API_LESSONS=[...HTTP_LESSONS,...REST_LESSONS,...PROTOCOL_LESSONS,...EVENT_LESSONS,...REALTIME_LESSONS];
for(const track of API_TRACKS){const items=API_LESSONS.filter(l=>l.track===track.id);items.forEach((item,i)=>item.prerequisites=i?[items[i-1].id]:track.id==='http'?[]:[HTTP_LESSONS.at(-1).id]);}
export const API_TRACK_BY_ID=new Map(API_TRACKS.map(t=>[t.id,t]));
export const API_LESSON_BY_ID=new Map(API_LESSONS.map(l=>[l.id,l]));
export const API_QUESTIONS=API_LESSONS.flatMap(l=>l.questions.map(q=>({...q,lesson:l.id,track:l.track})));
export const API_QUESTION_BY_ID=new Map(API_QUESTIONS.map(q=>[q.id,q]));
export const apiLessonsFor=track=>API_LESSONS.filter(l=>l.track===track);
export function apiAnswerMatches(question,input){return typeof input==='string'&&input.length<=300&&input.trim()===question.answer;}
