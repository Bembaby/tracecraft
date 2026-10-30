export const API_REVISION='2026-10-29.api1';
export const API_SOURCES={
 rest:'https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm',
 http:'https://www.rfc-editor.org/rfc/rfc9110.html',cache:'https://www.rfc-editor.org/rfc/rfc9111.html',
 patch:'https://www.rfc-editor.org/rfc/rfc5789.html',problem:'https://www.rfc-editor.org/rfc/rfc9457.html',
 openapi:'https://spec.openapis.org/oas/latest.html',oauth:'https://www.rfc-editor.org/rfc/rfc9700.html',
 soap:'https://www.w3.org/TR/soap12-part1/',wsdl:'https://www.w3.org/TR/wsdl20-primer/',
 grpc:'https://grpc.io/docs/what-is-grpc/core-concepts/',deadlines:'https://grpc.io/docs/guides/deadlines/',
 protobuf:'https://protobuf.dev/programming-guides/proto3/',encoding:'https://protobuf.dev/programming-guides/encoding/',
 graphql:'https://graphql.org/learn/',gqlresponse:'https://graphql.org/learn/response/',
 gqlsecurity:'https://graphql.org/learn/security/',subscriptions:'https://graphql.org/learn/subscriptions/',
 webhooks:'https://docs.stripe.com/webhooks',hooksecurity:'https://docs.github.com/en/webhooks/using-webhooks/best-practices-for-using-webhooks',
 websocket:'https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API',socketwriting:'https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_client_applications',
 webrtc:'https://webrtc.org/getting-started/peer-connections',turn:'https://webrtc.org/getting-started/turn-server',
 rtcmedia:'https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia',
 rtcdata:'https://developer.mozilla.org/en-US/docs/Web/API/RTCDataChannel',
 sse:'https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events',
 cors:'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS'
};
export function choice(id,prompt,code,options,answer,explanation,hint){
 return {id,kind:'choice',prompt,code,options,answer,explanation,hint,contract:'Choose the single supported claim under the stated example. Leading/trailing whitespace is ignored; spelling and internal content are exact. This is an authored recognition check.',solution:answer,bug:options.find(o=>o!==answer),complexity:'One bounded answer comparison is O(1) in the fixed question size. It is not a network benchmark.',fixtures:[...options.map(value=>({value,passed:value===answer})),{value:'',passed:false},{value:'unsupported claim',passed:false},{value:' '+answer+' ',passed:true}]};
}
export const blank=(...args)=>({...choice(...args),kind:'blank'});
export function lesson(spec){
 const questions=spec.questions.map(q=>({...q,id:spec.id+':'+q.id}));
 return {version:API_REVISION,prerequisites:[],lab:spec.track,...spec,questions};
}
