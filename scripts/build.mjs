import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validatePortfolio } from './validate.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'); const out=path.join(root,'dist');
const {data,errors}=await validatePortfolio();
if(errors.length){ console.error(`Build stopped: content validation failed.\n- ${errors.join('\n- ')}`); process.exit(1); }
await rm(out,{recursive:true,force:true}); await mkdir(out,{recursive:true});
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
let html=await readFile(path.join(root,'src/index.html'),'utf8');
const replacements={TITLE:escape(data.site.title),DESCRIPTION:escape(data.site.description),THEME_COLOR:escape(data.site.themeColor),LANG:escape(data.site.language||'en'),OG_URL:data.site.url?`<meta property="og:url" content="${escape(data.site.url)}">`:''};
for(const [key,value] of Object.entries(replacements)) html=html.replaceAll(`{{${key}}}`,value);
await writeFile(path.join(out,'index.html'),html); await cp(path.join(root,'assets'),path.join(out,'assets'),{recursive:true}); await cp(path.join(root,'content'),path.join(out,'content'),{recursive:true});
await writeFile(path.join(out,'.nojekyll'),'');
console.log(`Built ${path.relative(root,out)} successfully.`);
