import { cp,mkdir,readFile,writeFile,rm } from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});
await mkdir('dist',{recursive:true});
await cp('index.html','dist/index.html');
await cp('src','dist/src',{recursive:true});
await cp('public','dist/public',{recursive:true});
// Workers and WASM need an HTTP(S) origin. Preserve the preview filename as a
// second entry point into the directory build; it is no longer a single-file app.
await cp('index.html','dist/tracecraft-preview.html');
await writeFile('dist/_headers',`/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: no-referrer\n  Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.jsdelivr.net 'wasm-unsafe-eval'; worker-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://cdn.jsdelivr.net; object-src 'none'; base-uri 'self'\n`);
console.log('Built dist/ with local SQLite assets and worker runtimes. Serve the directory over HTTP(S); file:// is unsupported.');
