(() => {
  'use strict';
  const app = document.querySelector('#app');
  const nav = document.querySelector('#site-nav');
  const navList = document.querySelector('#nav-list');
  const dialog = document.querySelector('#project-dialog');
  const el = (tag, attrs = {}, children = []) => {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
      if (value === '' || value == null || value === false) continue;
      if (key === 'className') node.className = value;
      else if (key === 'text') node.textContent = value;
      else if (value === true) node.setAttribute(key, '');
      else node.setAttribute(key, value);
    }
    for (const child of [].concat(children)) if (child) node.append(child);
    return node;
  };
  const sortedVisible = items => [...items].filter(x => x.visible !== false).sort((a,b) => (a.order ?? 999) - (b.order ?? 999));
  const safeHref = href => typeof href === 'string' && href.trim() !== '' && (/^(https?:|mailto:|#)/i.test(href) || (!href.includes(':') && !href.startsWith('//')));
  const link = (label, href, className = 'button', download = false) => safeHref(href) ? el('a', { text: label, href, className, ...(download ? { download: true } : {}), ...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {}) }) : null;
  const section = (id, title, children) => el('section', { id, className: 'section' }, [el('h2', { text: title }), ...children]);
  const tags = values => el('div', { className: 'tags' }, values.map(value => el('span', { className: 'tag', text: value })));

  function renderHero(data) {
    const p = data.profile;
    return el('section', { id: 'top', className: 'hero' }, [
      el('div', { className: 'hero-inner' }, [
        p.availability ? el('p', { className: 'hero-kicker', text: p.availability }) : null,
        el('h1', {}, [el('span', { text: "Hi, I'm" }), el('strong', { text: p.name })]),
        el('p', { className: 'headline', text: p.headline }),
        el('p', { className: 'hero-script', text: 'Welcome to my portfolio.' }),
        el('p', { className: 'hero-intro', text: p.introduction }),
        p.photo && !p.photo.includes('placeholder') ? el('img', { className: 'hero-portrait', src: p.photo, alt: p.photoAlt || '', width: '118', height: '118' }) : null,
        el('div', { className: 'actions' }, [
          data.resume.visible && data.resume.file ? link(`View ${data.resume.label}`, data.resume.file) : null,
          data.resume.visible && data.resume.file ? link(`Download ${data.resume.label}`, data.resume.file, 'button secondary', true) : null,
          link('View my projects', '#projects', 'button')
        ])
      ])
    ]);
  }
  function simpleCards(items, title, body) { return el('div', { className: 'grid' }, sortedVisible(items).map(item => el('article', { className: 'card' }, [el('h3', { text: title(item) }), el('p', { className: 'muted', text: body(item) }), item.details ? el('p', { text: item.details }) : null]))); }
  function aboutSection(data) {
    const profile = data.profile;
    const details = [
      [data.labels.languages || 'Languages', profile.languages],
      [data.labels.interests || 'Beyond work', profile.interests]
    ].filter(([, items]) => items?.length).map(([title, items]) => el('div', {}, [
      el('h3', { text: title }), el('p', { text: items.join(' · ') })
    ]));
    return section('about', data.labels.about, [
      el('p', { text: profile.biography }),
      profile.location ? el('p', { className: 'muted', text: profile.location }) : null,
      details.length ? el('div', { className: 'about-details' }, details) : null
    ]);
  }
  function showProject(project, labels) {
    const content = document.querySelector('#dialog-content'); content.replaceChildren();
    content.append(el('h2', { id: 'dialog-title', text: project.title }), el('p', { text: project.description }));
    const dl = el('dl', { className: 'detail-list' });
    [['Problem', project.problem], ['Approach', project.approach], ['My contribution', project.contribution], ['Outcome / limitations', project.outcome], ['Features', project.features?.join(' · ')], ['Technology', project.technologies?.join(' · ')]].forEach(([k,v]) => { if(v) dl.append(el('dt',{text:k}),el('dd',{text:v})); });
    const screenshots=(project.screenshots||[]).filter(s=>s.src).map(s=>el('figure',{},[el('img',{src:s.src,alt:s.alt||'',loading:'lazy'}),s.caption?el('figcaption',{text:s.caption}):null]));
    const actions = [link('Repository', project.repositoryUrl), link('Live demo', project.demoUrl), link('View report', project.reportFile), link('Download report', project.reportFile, 'button secondary', true)].filter(Boolean);
    content.append(dl);
    if (screenshots.length) content.append(el('div', { className: 'grid' }, screenshots));
    if (actions.length) content.append(el('div', { className: 'card-actions' }, actions));
    dialog.showModal();
  }
  function projectsSection(data) {
    const projects = sortedVisible(data.projects); const categories = [...new Set(projects.map(x => x.category).filter(Boolean))].sort();
    const search = el('input', { type: 'search', placeholder: data.labels.searchProjects, 'aria-label': data.labels.searchProjects });
    const allCategories = el('option', { text: data.labels.allCategories }); allCategories.value = '';
    const select = el('select', { 'aria-label': 'Filter projects by category' }, [allCategories, ...categories.map(c => el('option', { value: c, text: c }))]);
    const grid = el('div', { className: 'grid' }); const empty = el('p', { className: 'empty', text: 'No projects match the current filters.' });
    const draw = () => { const q=search.value.trim().toLowerCase(), category=select.value; const matches=projects.filter(p => (!category||p.category===category) && (!q||[p.title,p.summary,p.category,...(p.tags||[]),...(p.technologies||[])].join(' ').toLowerCase().includes(q))); grid.replaceChildren(...matches.map(p => { const button=el('button',{type:'button',text:data.labels.viewDetails}); button.addEventListener('click',()=>showProject(p,data.labels)); return el('article',{className:'card'},[p.thumbnail?el('img',{src:p.thumbnail,alt:p.thumbnailAlt||'',loading:'lazy',width:'1200',height:'675'}):null,el('h3',{text:p.title}),el('p',{text:p.summary}),tags(p.tags||[]),button]); })); empty.hidden=matches.length>0; };
    search.addEventListener('input', draw); select.addEventListener('change', draw); draw();
    return section('projects', data.labels.projects, [el('div',{className:'filters'},[el('label',{},[el('span',{text:data.labels.searchProjects}),search]),el('label',{},[el('span',{text:'Category'}),select])]),grid,empty]);
  }
  function certificationsSection(data) {
    const cards = sortedVisible(data.certifications).map(c => {
      const metadata = [c.issuer, c.issueDate, c.expiryDate ? `Expires ${c.expiryDate}` : ''].filter(Boolean).join(' · ');
      const actions = [link(data.labels.view, c.certificateFile), link(data.labels.download, c.certificateFile, 'button secondary', true), link(data.labels.verify, c.verificationUrl)].filter(Boolean);
      return el('article', { className: 'card' }, [
        c.thumbnail ? el('img', { src: c.thumbnail, alt: c.thumbnailAlt || '', loading: 'lazy' }) : null,
        el('h3', { text: c.title }),
        metadata ? el('p', { className: 'muted', text: metadata }) : null,
        c.credentialId ? el('p', { text: `Credential ID: ${c.credentialId}` }) : null,
        c.skills?.length ? tags(c.skills) : null,
        actions.length ? el('div', { className: 'card-actions' }, actions) : null
      ]);
    });
    return section('certifications',data.labels.certifications,cards.length?[el('div',{className:'grid'},cards)]:[el('p',{className:'empty',text:'No public certifications are listed yet.'})]);
  }
  function contactSection(data) { const items=[]; if(data.contact.email) items.push(link('Email me',`mailto:${data.contact.email}`)); for(const x of sortedVisible(data.contact.links)) if(x.url) items.push(link(x.label,x.url,'button secondary')); return section('contact',data.labels.contact,[el('p',{text:items.length?'Choose the channel that works best for you.':'Add public contact links in content/portfolio.json when you are ready.'}),el('div',{className:'actions'},items)]); }
  function render(data) {
    document.querySelector('#brand').textContent=data.profile.name; nav.setAttribute('aria-label',data.labels.navLabel);
    document.querySelector('#footer-copy').textContent=`© ${new Date().getFullYear()} ${data.profile.name}.`;
    const renderers={about:()=>aboutSection(data),skills:()=>section('skills',data.labels.skills,[el('div',{className:'grid'},sortedVisible(data.skills).map(s=>el('article',{className:'card'},[el('h3',{text:s.category}),el('ul',{className:'skill-list'},s.items.map(item=>el('li',{text:item})))])))]),experience:()=>section('experience',data.labels.experience,[simpleCards(data.experience,x=>x.role,x=>[x.organization,x.startDate&&x.endDate?`${x.startDate}–${x.endDate}`:''].filter(Boolean).join(' · '))]),education:()=>section('education',data.labels.education,[simpleCards(data.education,x=>x.qualification,x=>[x.institution,x.startDate&&x.endDate?`${x.startDate}–${x.endDate}`:''].filter(Boolean).join(' · '))]),projects:()=>projectsSection(data),certifications:()=>certificationsSection(data),contact:()=>contactSection(data)};
    const optional={skills:data.skills,experience:data.experience,education:data.education,projects:data.projects,certifications:data.certifications};
    const ids=data.sectionOrder.filter(id=>data.sectionVisibility[id]&&renderers[id]&&(!optional[id]||sortedVisible(optional[id]).length)); app.replaceChildren(renderHero(data),...ids.map(id=>renderers[id]())); navList.replaceChildren(...ids.map(id=>el('li',{},[el('a',{href:`#${id}`,text:data.labels[id]||id})])));
  }
  document.querySelector('.dialog-close').addEventListener('click',()=>dialog.close()); dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
  document.querySelector('.nav-toggle').addEventListener('click',e=>{const open=nav.classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',String(open));}); nav.addEventListener('click',()=>{nav.classList.remove('open');document.querySelector('.nav-toggle').setAttribute('aria-expanded','false');});
  const themeButton=document.querySelector('.theme-toggle'); const preferred=localStorage.getItem('portfolio-theme'); if(preferred)document.documentElement.dataset.theme=preferred; themeButton.addEventListener('click',()=>{const dark=document.documentElement.dataset.theme==='dark'||(!document.documentElement.dataset.theme&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=dark?'light':'dark';localStorage.setItem('portfolio-theme',document.documentElement.dataset.theme);});
  fetch('content/portfolio.json', { cache: 'no-store' }).then(r=>{if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.json();}).then(render).catch(err=>{app.replaceChildren(el('p',{className:'error',text:`Portfolio content could not be loaded: ${err.message}. Use a local web server rather than opening index.html directly.`}));});
})();
