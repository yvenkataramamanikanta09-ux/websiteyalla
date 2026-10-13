import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const requiredTop = ['site','profile','contact','resume','labels','sectionOrder','sectionVisibility','skills','experience','education','projects','certifications'];
const requiredProject = ['id','title','summary','description','problem','approach','features','technologies','contribution','outcome','category','tags','featured','order','visible'];
const requiredCertification = ['id','title','category','skills','order','visible'];

export async function validatePortfolio(file = path.join(root, 'content/portfolio.json'), base = root) {
  const errors=[]; let data;
  try { data=JSON.parse(await readFile(file,'utf8')); } catch (error) { return { data:null, errors:[`Invalid JSON in ${path.relative(base,file)}: ${error.message}`] }; }
  for(const key of requiredTop) if(!(key in data)) errors.push(`Missing required top-level field: ${key}`);
  if(!data.site?.title) errors.push('site.title is required');
  if(!data.site?.description) errors.push('site.description is required');
  for(const key of ['name','headline','introduction','biography']) if(!data.profile?.[key]) errors.push(`profile.${key} is required`);
  for(const key of ['languages','interests']) {
    const items = data.profile?.[key];
    if(items !== undefined && (!Array.isArray(items) || items.some(item => typeof item !== 'string' || !item.trim()))) errors.push(`profile.${key} must be an array of non-empty strings`);
  }
  if(!Array.isArray(data.sectionOrder)||new Set(data.sectionOrder).size!==data.sectionOrder?.length) errors.push('sectionOrder must be an array with unique values');
  for(const collection of ['skills','experience','education','projects','certifications']) if(!Array.isArray(data[collection])) errors.push(`${collection} must be an array`);
  const ids=new Map();
  for(const collection of ['skills','experience','education','projects','certifications']) for(const [index,item] of (data[collection]||[]).entries()) {
    if(!item.id) errors.push(`${collection}[${index}].id is required`);
    else if(ids.has(item.id)) errors.push(`Duplicate ID "${item.id}" in ${collection}; first used in ${ids.get(item.id)}`);
    else ids.set(item.id,`${collection}[${index}]`);
  }
  for(const [i,p] of (data.projects||[]).entries()) for(const key of requiredProject) if(p[key]===undefined||p[key]===null||p[key]==='') errors.push(`projects[${i}].${key} is required`);
  for(const [i,c] of (data.certifications||[]).entries()) for(const key of requiredCertification) if(c[key]===undefined||c[key]===null||c[key]==='') errors.push(`certifications[${i}].${key} is required`);
  for(const [i,c] of (data.certifications||[]).entries()) for(const key of ['issuer','issueDate']) if(c[key] !== undefined && typeof c[key] !== 'string') errors.push(`certifications[${i}].${key} must be a string when provided`);
  const assetFields=[];
  if(data.profile?.photo) assetFields.push(['profile.photo',data.profile.photo]);
  if(data.resume?.visible&&data.resume.file) assetFields.push(['resume.file',data.resume.file]);
  for(const [i,p] of (data.projects||[]).entries()) { if(p.thumbnail)assetFields.push([`projects[${i}].thumbnail`,p.thumbnail]); if(p.reportFile)assetFields.push([`projects[${i}].reportFile`,p.reportFile]); for(const [j,s] of (p.screenshots||[]).entries()) if(s.src)assetFields.push([`projects[${i}].screenshots[${j}].src`,s.src]); }
  for(const [i,c] of (data.certifications||[]).entries()) { if(c.thumbnail)assetFields.push([`certifications[${i}].thumbnail`,c.thumbnail]); if(c.certificateFile)assetFields.push([`certifications[${i}].certificateFile`,c.certificateFile]); }
  for(const [field,relative] of assetFields) {
    if(/^(?:https?:|data:|\/)/i.test(relative)||relative.includes('..')) { errors.push(`${field} must be a safe relative local asset path: ${relative}`); continue; }
    try { await access(path.join(base,relative)); } catch { errors.push(`${field} references missing asset: ${relative}`); }
  }
  const urls=[];
  if(data.site?.url) urls.push(['site.url',data.site.url,['http:','https:']]);
  if(data.contact?.email) urls.push(['contact.email',`mailto:${data.contact.email}`,['mailto:']]);
  for(const [i,x] of (data.contact?.links||[]).entries()) if(x.url) urls.push([`contact.links[${i}].url`,x.url,['http:','https:']]);
  for(const [i,p] of (data.projects||[]).entries()) for(const key of ['repositoryUrl','demoUrl']) if(p[key]) urls.push([`projects[${i}].${key}`,p[key],['http:','https:']]);
  for(const [i,c] of (data.certifications||[]).entries()) if(c.verificationUrl) urls.push([`certifications[${i}].verificationUrl`,c.verificationUrl,['http:','https:']]);
  for(const [field,value,protocols] of urls) { try { const parsed=new URL(value); if(!protocols.includes(parsed.protocol)) errors.push(`${field} uses unsupported URL protocol: ${parsed.protocol}`); } catch { errors.push(`${field} is not a valid URL or email address: ${value}`); } }
  return { data, errors };
}

if(process.argv[1]===fileURLToPath(import.meta.url)) {
  const {errors}=await validatePortfolio();
  if(errors.length){ console.error(`Portfolio validation failed (${errors.length} error${errors.length===1?'':'s'}):\n- ${errors.join('\n- ')}`); process.exitCode=1; }
  else console.log('Portfolio validation passed.');
}
