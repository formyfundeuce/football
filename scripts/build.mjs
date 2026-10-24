import {readFile,mkdir,writeFile,rm} from 'node:fs/promises';
const root=new URL('../',import.meta.url),types={'index.html':'text/html','style.css':'text/css','app.js':'text/javascript','compare.mjs':'text/javascript','data.json':'application/json'},assets={};
for(const [name,type]of Object.entries(types))assets['/'+name]={body:await readFile(new URL('web/'+name,root),'utf8'),type:type+'; charset=utf-8'};
const source=await readFile(new URL('worker/index.js',root),'utf8');
await rm(new URL('dist',root),{recursive:true,force:true});await mkdir(new URL('dist/server',root),{recursive:true});await mkdir(new URL('dist/.openai',root),{recursive:true});
await writeFile(new URL('dist/server/index.js',root),'const ASSETS = '+JSON.stringify(assets)+';\n'+source);
await writeFile(new URL('dist/.openai/hosting.json',root),await readFile(new URL('.openai/hosting.json',root)));
console.log('Built self-contained Worker with embedded website assets.');
