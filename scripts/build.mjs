import {cp,mkdir,readFile,writeFile,rm} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});await mkdir('dist',{recursive:true});
await cp('index.html','dist/index.html');await cp('src','dist/src',{recursive:true});await cp('public','dist/public',{recursive:true});
let html=await readFile('index.html','utf8');const css=await readFile('src/styles.css','utf8');
const modules=await Promise.all(['engine','data','visuals','app'].map(async name=>(await readFile(`src/${name}.mjs`,'utf8')).replace(/^import .* from ['"].*['"];?\s*$/gm,'').replace(/^export \{[^}]*\};?\s*$/gm,'').replace(/\bexport (?=(?:async )?(?:function|const|let|class))/g,'')));
html=html.replace('<link rel="stylesheet" href="src/styles.css">',`<style>${css}</style>`).replace('<script type="module" src="src/app.mjs"></script>',`<script type="module">${modules.join('\n').replace(/<\/script/gi,'<\\/script')}</script>`);
await writeFile('dist/tracecraft-preview.html',html);console.log('Built dist/ and a portable tracecraft-preview.html. No package download required.');
