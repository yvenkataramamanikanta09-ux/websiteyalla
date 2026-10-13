import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os'; import path from 'node:path';
import { validatePortfolio } from '../scripts/validate.mjs';
const root=path.resolve('.');
async function fixture(mutator){const dir=await mkdtemp(path.join(os.tmpdir(),'portfolio-'));await mkdir(path.join(dir,'content'),{recursive:true});await mkdir(path.join(dir,'assets/images'),{recursive:true});for(const f of ['profile-placeholder.svg','project-placeholder.svg'])await writeFile(path.join(dir,'assets/images',f),'x');const data=JSON.parse(await readFile(path.join(root,'content/portfolio.json'),'utf8'));mutator?.(data);const file=path.join(dir,'content/portfolio.json');await writeFile(file,JSON.stringify(data));return {dir,file};}
test('canonical content validates',async()=>assert.deepEqual((await validatePortfolio()).errors,[]));
test('malformed JSON fails clearly',async()=>{const {dir,file}=await fixture();await writeFile(file,'{ nope');assert.match((await validatePortfolio(file,dir)).errors[0],/Invalid JSON/);});
test('duplicate IDs fail',async()=>{const {dir,file}=await fixture(d=>d.education[0].id=d.projects[0].id);assert.ok((await validatePortfolio(file,dir)).errors.some(x=>x.includes('Duplicate ID')));});
test('missing referenced assets fail',async()=>{const {dir,file}=await fixture(d=>d.projects[0].thumbnail='assets/images/missing.png');assert.ok((await validatePortfolio(file,dir)).errors.some(x=>x.includes('missing asset')));});
test('hidden records and ordering are data-controlled',async()=>{const {dir,file}=await fixture(d=>{const base=d.projects[0];d.projects=[{...base,id:'later',visible:true,order:2},{...base,id:'hidden',visible:false,order:0},{...base,id:'earlier',visible:true,order:1}];});const {data,errors}=await validatePortfolio(file,dir);assert.deepEqual(errors,[]);assert.deepEqual(data.projects.filter(x=>x.visible).sort((a,b)=>a.order-b.order).map(x=>x.id),['earlier','later']);});
test('optional links may be empty',async()=>{const {dir,file}=await fixture(d=>{d.projects[0].repositoryUrl='';d.projects[0].demoUrl='';d.projects[0].reportFile='';});assert.deepEqual((await validatePortfolio(file,dir)).errors,[]);});
test('unsafe external URL protocols fail',async()=>{const {dir,file}=await fixture(d=>d.projects[0].demoUrl='javascript:alert(1)');assert.ok((await validatePortfolio(file,dir)).errors.some(x=>x.includes('unsupported URL protocol')));});
