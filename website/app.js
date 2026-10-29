/* global document, window, localStorage, fetch, navigator, setTimeout, history, URLSearchParams, Blob */
const REPO_URL = 'https://github.com/Fazerdino1/gravity-bridge';
const RAW_BASE = 'https://raw.githubusercontent.com/Fazerdino1/gravity-bridge/main';
const PAGE_SIZE = 36;
const ALL_TAGS = [
  'TypeScript / JS',
  'Python',
  '.NET / C#',
  'Java / Spring',
  'DevOps & Cloud',
  'Security',
  'Testing & QA',
  'AI & Agents',
];

const I18N = {
  fr: {
    navCollections: 'Collections & Plugins (6)',
    navCatalog: 'Catalogue (862)',
    navContributing: 'Contribuer',
    navCoc: 'Code de conduite',
    navFaq: 'FAQ',
    heroTitle: 'Gravity Bridge pour Google Antigravity',
    heroSubtitle:
      "Le hub open source communautaire (licence MIT) regroupant 862 skills, règles, personas d'agents et 6 plugins prêts à l'emploi pour Google Antigravity.",
    ctaPropose: '+ Proposer une ressource Antigravity',
    ctaProblem: 'Signaler un problème',
    ctaRepo: 'Voir le dépôt GitHub',
    statTotal: 'Ressources',
    statRules: 'Règles (<24 Ko)',
    collectionsTitle: 'Collections & Plugins Antigravity (Installation en 1 commande)',
    collectionsSub: 'Installez un pack thématique complet dans .agents/ ou comme plugin Antigravity.',
    catalogTitle: 'Catalogue interactif Antigravity',
    catalogSub: "Recherche multi-mots, filtres technologiques, favoris ⭐ et aperçu complet à la demande.",
    searchLabel: 'Rechercher une ressource',
    searchPlaceholder: 'Rechercher plusieurs mots (ex: python test, typescript security...)',
    sortReviewed: "Tri : Vérifiés ★ d'abord",
    sortAz: 'Tri : Nom (A → Z)',
    sortAuthor: 'Tri : Par auteur',
    resetFilters: 'Réinitialiser',
    filterAll: 'Tous (862)',
    filterRules: 'Règles (193)',
    filterReviewed: 'Vérifiés ★',
    favBtnLabel: (count) => `Mes Favoris ⭐ (${count})`,
    favCliTitle: 'Installer tous vos favoris en 1 commande :',
    loadMore: 'Afficher plus de résultats',
    resultsShowing: (shown, total) => `${shown} affichés sur ${total} ressources correspondantes`,
    previewBtn: 'Aperçu',
    copyCmd: 'Copier CLI',
    copied: 'Copié !',
    downloadFile: 'Télécharger .md ⬇',
    viewFile: 'GitHub ↗',
    loadingPreview: 'Chargement du fichier Markdown complet...',
    byAuthor: 'Auteur :',
    installCliLabel: 'Installation en 1 commande (CLI) :',
    previewHeading: 'Contenu complet de la ressource',
    contribTitle: 'Contribuer & Utiliser avec Google Antigravity',
    contribHtml: `
      <h3>1. Installer en 1 commande avec le CLI Gravity Bridge</h3>
      <pre tabindex="0"><code># Installer un skill, une règle ou une persona dans votre projet (.agents/) :
npx github:Fazerdino1/gravity-bridge add conventional-commit

# Installer toute une collection thématique :
npx github:Fazerdino1/gravity-bridge add --collection fullstack-web-typescript

# Installer un plugin Antigravity complet dans ~/.gemini/config/plugins/ :
npx github:Fazerdino1/gravity-bridge add --plugin git-and-docs-essentials</code></pre>
      <h3>2. Formulaires interactifs GitHub Issues</h3>
      <ul>
        <li><a href="${REPO_URL}/issues/new?template=new_resource.yml" target="_blank" rel="noopener">Proposer une nouvelle ressource Antigravity</a></li>
        <li><a href="${REPO_URL}/issues/new?template=conversion_problem.yml" target="_blank" rel="noopener">Signaler un problème de ressource ou de conversion</a></li>
        <li><a href="${REPO_URL}/issues/new?template=bug_report.yml" target="_blank" rel="noopener">Signaler un bug dans les scripts</a></li>
        <li><a href="${REPO_URL}/issues/new?template=license_or_removal_request.yml" target="_blank" rel="noopener">Demande de licence, d'attribution ou de retrait</a></li>
      </ul>
    `,
    cocHeading: 'Code de conduite du Contributor Covenant (v2.1)',
    cocHtml: `
      <p>Nous nous engageons à faire de la participation à notre communauté une expérience exempte de harcèlement pour tout le monde, en contribuant à une communauté ouverte, accueillante, diversifiée, inclusive et saine.</p>
      <p>Tout comportement inacceptable peut être signalé à <a href="mailto:fazerdinotheck@outlook.fr">fazerdinotheck@outlook.fr</a> ou via le <a href="${REPO_URL}/security/advisories/new" target="_blank" rel="noopener">signalement privé GitHub</a>.</p>
      <p>Texte intégral : <a href="${REPO_URL}/blob/main/CODE_OF_CONDUCT.fr.md" target="_blank" rel="noopener">Français</a> · <a href="${REPO_URL}/blob/main/CODE_OF_CONDUCT.md" target="_blank" rel="noopener">English</a> · <a href="${REPO_URL}/blob/main/CODE_OF_CONDUCT.es.md" target="_blank" rel="noopener">Español</a> · <a href="${REPO_URL}/blob/main/CODE_OF_CONDUCT.de.md" target="_blank" rel="noopener">Deutsch</a>.</p>
    `,
    faqHeading: 'FAQ — Questions fréquentes',
    faqHtml: `
      <h3>Comment les règles de plus de 24 Ko sont-elles gérées ?</h3>
      <p>Antigravity applique une limite de 24 000 octets par fichier de règle. Notre outil <code>npm run sanitize</code> condense automatiquement les règles volumineuses sous 24 Ko et conserve la référence complète dans <code>docs/rule-references/</code>.</p>
      <h3>Les scripts embarqués dans les skills sont-ils audités ?</h3>
      <p>Oui : <code>npm run audit:scripts</code> inspecte les 92 scripts embarqués et publie le rapport dans <a href="${REPO_URL}/blob/main/docs/scripts-security-audit.md" target="_blank" rel="noopener">docs/scripts-security-audit.md</a>.</p>
    `,
  },
  en: {
    navCollections: 'Collections & Plugins (6)',
    navCatalog: 'Catalog (862)',
    navContributing: 'Contribute',
    navCoc: 'Code of Conduct',
    navFaq: 'FAQ',
    heroTitle: 'Gravity Bridge for Google Antigravity',
    heroSubtitle:
      'The MIT-licensed open-source community hub with 862 skills, rules, agent personas, and 6 ready-to-use plugins for Google Antigravity.',
    ctaPropose: '+ Propose an Antigravity Resource',
    ctaProblem: 'Report an Issue',
    ctaRepo: 'View GitHub Repository',
    statTotal: 'Resources',
    statRules: 'Rules (<24 KB)',
    collectionsTitle: 'Antigravity Collections & Plugins (1-Command Install)',
    collectionsSub: 'Install a complete curated bundle into .agents/ or as a global Antigravity plugin.',
    catalogTitle: 'Interactive Antigravity Catalog',
    catalogSub: 'Multi-keyword search, technology tags, favorites ⭐, and on-demand full Markdown preview.',
    searchLabel: 'Search resources',
    searchPlaceholder: 'Multi-word search (e.g. python test, typescript security...)',
    sortReviewed: 'Sort: Reviewed ★ first',
    sortAz: 'Sort: Name (A → Z)',
    sortAuthor: 'Sort: By author',
    resetFilters: 'Reset',
    filterAll: 'All (862)',
    filterRules: 'Rules (193)',
    filterReviewed: 'Reviewed ★',
    favBtnLabel: (count) => `Favorites ⭐ (${count})`,
    favCliTitle: 'Install all your favorites in 1 command:',
    loadMore: 'Load more results',
    resultsShowing: (shown, total) => `Showing ${shown} of ${total} matching resources`,
    previewBtn: 'Preview',
    copyCmd: 'Copy CLI',
    copied: 'Copied!',
    downloadFile: 'Download .md ⬇',
    viewFile: 'GitHub ↗',
    loadingPreview: 'Loading full Markdown file...',
    byAuthor: 'Author:',
    installCliLabel: 'One-Command CLI Install:',
    previewHeading: 'Full Resource Content',
    contribTitle: 'Contribute & Use with Google Antigravity',
    contribHtml: `
      <h3>1. Install in 1 Command with the Gravity Bridge CLI</h3>
      <pre tabindex="0"><code>npx github:Fazerdino1/gravity-bridge add conventional-commit
npx github:Fazerdino1/gravity-bridge add --collection fullstack-web-typescript
npx github:Fazerdino1/gravity-bridge add --plugin git-and-docs-essentials</code></pre>
    `,
    cocHeading: 'Contributor Covenant Code of Conduct (v2.1)',
    cocHtml: `<p>Contact: <a href="mailto:fazerdinotheck@outlook.fr">fazerdinotheck@outlook.fr</a> · <a href="${REPO_URL}/blob/main/CODE_OF_CONDUCT.md" target="_blank" rel="noopener">CODE_OF_CONDUCT.md</a>.</p>`,
    faqHeading: 'FAQ — Frequently Asked Questions',
    faqHtml: `<p>All 193 rules are strictly under Antigravity's 24 KB limit, and all 92 bundled scripts are audited in <a href="${REPO_URL}/blob/main/docs/scripts-security-audit.md" target="_blank" rel="noopener">docs/scripts-security-audit.md</a>.</p>`,
  },
  es: {
    navCollections: 'Colecciones y Plugins (6)',
    navCatalog: 'Catálogo (862)',
    navContributing: 'Contribuir',
    navCoc: 'Código de Conducta',
    navFaq: 'FAQ',
    heroTitle: 'Gravity Bridge para Google Antigravity',
    heroSubtitle:
      'El centro comunitario de código abierto (licencia MIT) con 862 skills, reglas, personas de agentes y 6 plugins para Google Antigravity.',
    ctaPropose: '+ Proponer un recurso Antigravity',
    ctaProblem: 'Informar de un problema',
    ctaRepo: 'Ver repositorio en GitHub',
    statTotal: 'Recursos',
    statRules: 'Reglas (<24 KB)',
    collectionsTitle: 'Colecciones y Plugins de Antigravity',
    collectionsSub: 'Instale un paquete temático completo con un solo comando CLI.',
    catalogTitle: 'Catálogo interactivo de Antigravity',
    catalogSub: 'Búsqueda multipalabra, filtros por tecnología, favoritos ⭐ y vista previa completa.',
    searchLabel: 'Buscar recursos',
    searchPlaceholder: 'Buscar (ej: python test, typescript security...)',
    sortReviewed: 'Orden: Revisados ★ primero',
    sortAz: 'Orden: Nombre (A → Z)',
    sortAuthor: 'Orden: Por autor',
    resetFilters: 'Restablecer',
    filterAll: 'Todos (862)',
    filterRules: 'Reglas (193)',
    filterReviewed: 'Revisados ★',
    favBtnLabel: (count) => `Favoritos ⭐ (${count})`,
    favCliTitle: 'Instalar todos sus favoritos con 1 comando:',
    loadMore: 'Mostrar más resultados',
    resultsShowing: (shown, total) => `Mostrando ${shown} de ${total} recursos`,
    previewBtn: 'Vista previa',
    copyCmd: 'Copiar CLI',
    copied: '¡Copiado!',
    downloadFile: 'Descargar .md ⬇',
    viewFile: 'GitHub ↗',
    loadingPreview: 'Cargando archivo Markdown completo...',
    byAuthor: 'Autor:',
    installCliLabel: 'Instalación con 1 comando (CLI):',
    previewHeading: 'Contenido completo del recurso',
    contribTitle: 'Contribuir y usar con Google Antigravity',
    contribHtml: `<pre tabindex="0"><code>npx github:Fazerdino1/gravity-bridge add conventional-commit</code></pre>`,
    cocHeading: 'Código de Conducta del Contributor Covenant (v2.1)',
    cocHtml: `<p>Contacto: <a href="mailto:fazerdinotheck@outlook.fr">fazerdinotheck@outlook.fr</a> · <a href="${REPO_URL}/blob/main/CODE_OF_CONDUCT.es.md" target="_blank" rel="noopener">CODE_OF_CONDUCT.es.md</a>.</p>`,
    faqHeading: 'FAQ — Preguntas frecuentes',
    faqHtml: `<p>Todas las reglas respetan el límite de 24 KB de Antigravity.</p>`,
  },
  de: {
    navCollections: 'Sammlungen & Plugins (6)',
    navCatalog: 'Katalog (862)',
    navContributing: 'Mitwirken',
    navCoc: 'Verhaltenskodex',
    navFaq: 'FAQ',
    heroTitle: 'Gravity Bridge für Google Antigravity',
    heroSubtitle:
      'Der Open-Source-Community-Hub (MIT-Lizenz) mit 862 Skills, Regeln, Agenten-Personas und 6 Plugins für Google Antigravity.',
    ctaPropose: '+ Antigravity-Ressource vorschlagen',
    ctaProblem: 'Problem melden',
    ctaRepo: 'GitHub-Repository ansehen',
    statTotal: 'Ressourcen',
    statRules: 'Regeln (<24 KB)',
    collectionsTitle: 'Antigravity-Sammlungen & Plugins',
    collectionsSub: 'Installieren Sie ein kuratiertes Paket mit einem einzigen CLI-Befehl.',
    catalogTitle: 'Interaktiver Antigravity-Katalog',
    catalogSub: 'Mehrwortsuche, Technologie-Filter, Favoriten ⭐ und vollständige Vorschau.',
    searchLabel: 'Ressource suchen',
    searchPlaceholder: 'Suchen (z. B. python test, typescript security...)',
    sortReviewed: 'Sortierung: Geprüft ★ zuerst',
    sortAz: 'Sortierung: Name (A → Z)',
    sortAuthor: 'Sortierung: Nach Autor',
    resetFilters: 'Zurücksetzen',
    filterAll: 'Alle (862)',
    filterRules: 'Regeln (193)',
    filterReviewed: 'Geprüft ★',
    favBtnLabel: (count) => `Favoriten ⭐ (${count})`,
    favCliTitle: 'Alle Favoriten mit 1 Befehl installieren:',
    loadMore: 'Mehr Ergebnisse laden',
    resultsShowing: (shown, total) => `${shown} von ${total} passenden Ressourcen angezeigt`,
    previewBtn: 'Vorschau',
    copyCmd: 'CLI kopieren',
    copied: 'Kopiert!',
    downloadFile: 'Download .md ⬇',
    viewFile: 'GitHub ↗',
    loadingPreview: 'Vollständige Markdown-Datei wird geladen...',
    byAuthor: 'Autor:',
    installCliLabel: 'Installation mit 1 Befehl (CLI):',
    previewHeading: 'Vollständiger Inhalt',
    contribTitle: 'Mitwirken & Nutzung mit Google Antigravity',
    contribHtml: `<pre tabindex="0"><code>npx github:Fazerdino1/gravity-bridge add conventional-commit</code></pre>`,
    cocHeading: 'Verhaltenskodex des Contributor Covenant (v2.1)',
    cocHtml: `<p>Kontakt: <a href="mailto:fazerdinotheck@outlook.fr">fazerdinotheck@outlook.fr</a> · <a href="${REPO_URL}/blob/main/CODE_OF_CONDUCT.de.md" target="_blank" rel="noopener">CODE_OF_CONDUCT.de.md</a>.</p>`,
    faqHeading: 'FAQ — Häufig gestellte Fragen',
    faqHtml: `<p>Alle Regeln halten das 24-KB-Limit von Antigravity ein.</p>`,
  },
};

let currentLang = 'fr';
let allItems = [];
let allCollections = [];
let activeFilter = 'all';
let activeTag = '';
let activeSort = 'reviewed';
let visibleLimit = PAGE_SIZE;
let favorites = new Set();

function loadFavorites() {
  try {
    const raw = localStorage.getItem('gb-favorites');
    if (raw) favorites = new Set(JSON.parse(raw));
  } catch { /* ignore */ }
}

function saveFavorites() {
  try {
    localStorage.setItem('gb-favorites', JSON.stringify([...favorites]));
  } catch { /* ignore */ }
  updateFavoritesUi();
}

function updateFavoritesUi() {
  const dict = I18N[currentLang];
  const favPill = document.getElementById('fav-pill');
  if (favPill) favPill.textContent = dict.favBtnLabel(favorites.size);
  const favBar = document.getElementById('fav-cli-bar');
  if (!favBar) return;
  if (activeFilter === 'favorites' && favorites.size > 0) {
    favBar.hidden = false;
    const cmd = [...favorites].map((n) => `npx github:Fazerdino1/gravity-bridge add ${n}`).join(' && ');
    document.getElementById('fav-cli-cmd').textContent = cmd;
    const btn = document.getElementById('copy-fav-cli');
    btn.onclick = () => {
      navigator.clipboard?.writeText(cmd);
      btn.textContent = dict.copied;
      setTimeout(() => { btn.textContent = I18N[currentLang].copyCmd; }, 1400);
    };
  } else {
    favBar.hidden = true;
  }
}

function syncUrlState() {
  const params = new URLSearchParams();
  if (currentLang !== 'fr') params.set('lang', currentLang);
  const q = (document.getElementById('search-input')?.value || '').trim();
  if (q) params.set('q', q);
  if (activeFilter !== 'all') params.set('type', activeFilter);
  if (activeTag) params.set('tag', activeTag);
  if (activeSort !== 'reviewed') params.set('sort', activeSort);
  const qs = params.toString();
  history.replaceState(null, '', qs ? `?${qs}${window.location.hash}` : window.location.pathname + window.location.hash);
}

function loadUrlState() {
  const params = new URLSearchParams(window.location.search);
  const lang = params.get('lang');
  if (lang && I18N[lang]) currentLang = lang;
  const q = params.get('q');
  if (q && document.getElementById('search-input')) document.getElementById('search-input').value = q;
  const type = params.get('type');
  if (type) activeFilter = type;
  const tag = params.get('tag');
  if (tag) activeTag = tag;
  const sort = params.get('sort');
  if (sort && document.getElementById('sort-select')) {
    activeSort = sort;
    document.getElementById('sort-select').value = sort;
  }
}

function setupThemeToggle() {
  const meta = document.querySelector('meta[name="color-scheme"]');
  const btn = document.getElementById('theme-toggle');
  if (!meta || !btn) return;
  btn.addEventListener('click', () => {
    const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const current = meta.content === 'light dark' ? (sysDark ? 'dark' : 'light') : meta.content;
    const target = current === 'dark' ? 'light' : 'dark';
    const sysScheme = sysDark ? 'dark' : 'light';
    if (target === sysScheme) {
      meta.content = 'light dark';
      try { localStorage.removeItem('color-scheme'); } catch { /* ignore */ }
    } else {
      meta.content = target;
      try { localStorage.setItem('color-scheme', target); } catch { /* ignore */ }
    }
  });
}

function renderCollections() {
  const grid = document.getElementById('collections-grid');
  if (!grid) return;
  grid.innerHTML = '';
  const dict = I18N[currentLang];
  for (const col of allCollections) {
    const card = document.createElement('article');
    card.className = 'col-card';
    const cmd = `npx github:Fazerdino1/gravity-bridge add --collection ${col.id}`;
    card.innerHTML = `
      <div>
        <div class="res-top">
          <span class="badge reviewed">Collection (${col.items.length})</span>
          <span class="badge skill">Plugin: ${col.pluginId}</span>
        </div>
        <h3>${col.name}</h3>
        <p>${col.description}</p>
      </div>
      <div>
        <div class="col-cmd">${cmd}</div>
        <div class="res-footer" style="margin-top:0.5rem">
          <span>${col.items.length} items</span>
          <button type="button" class="mini-btn copy-col-btn">${dict.copyCmd}</button>
        </div>
      </div>
    `;
    const copyBtn = card.querySelector('.copy-col-btn');
    copyBtn.addEventListener('click', () => {
      navigator.clipboard?.writeText(cmd);
      copyBtn.textContent = dict.copied;
      setTimeout(() => { copyBtn.textContent = I18N[currentLang].copyCmd; }, 1400);
    });
    grid.appendChild(card);
  }
}

function renderTagPills() {
  const wrap = document.getElementById('tag-pills');
  if (!wrap) return;
  wrap.innerHTML = '';
  for (const tag of ALL_TAGS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `tag-pill${activeTag === tag ? ' active' : ''}`;
    btn.textContent = `# ${tag}`;
    btn.addEventListener('click', () => {
      activeTag = activeTag === tag ? '' : tag;
      visibleLimit = PAGE_SIZE;
      renderTagPills();
      syncUrlState();
      renderCatalog();
    });
    wrap.appendChild(btn);
  }
}

async function openPreviewModal(item) {
  const dialog = document.getElementById('preview-dialog');
  if (!dialog) return;
  const dict = I18N[currentLang];
  document.getElementById('dialog-badge').className = `badge ${item.type}`;
  document.getElementById('dialog-badge').textContent = item.type;
  document.getElementById('dialog-title').textContent = item.name;
  document.getElementById('dialog-desc').textContent = item.description;
  const cliCmd = `npx github:Fazerdino1/gravity-bridge add ${item.name}`;
  document.getElementById('dialog-cli-cmd').textContent = cliCmd;
  const codeEl = document.getElementById('dialog-preview-code');
  codeEl.textContent = dict.loadingPreview;
  document.getElementById('dialog-meta').textContent = `${dict.byAuthor} ${item.author} · License: ${item.license} · Status: ${item.status}`;
  document.getElementById('dialog-gh-link').href = `${REPO_URL}/blob/main/${item.path}`;

  const dlLink = document.getElementById('dialog-dl-link');
  dlLink.download = `${item.name}.md`;
  dlLink.href = `${RAW_BASE}/${item.path}`;

  const copyBtn = document.getElementById('dialog-copy-cli');
  copyBtn.onclick = () => {
    navigator.clipboard?.writeText(cliCmd);
    copyBtn.textContent = dict.copied;
    setTimeout(() => { copyBtn.textContent = I18N[currentLang].copyCmd; }, 1400);
  };
  dialog.showModal();

  try {
    const res = await fetch(`../${item.path}`);
    const fullText = res.ok ? await res.text() : await (await fetch(`${RAW_BASE}/${item.path}`)).text();
    codeEl.textContent = fullText;
    const blob = new Blob([fullText], { type: 'text/markdown;charset=utf-8' });
    dlLink.href = URL.createObjectURL(blob);
  } catch {
    codeEl.textContent = item.description;
  }
}

function applyLanguage(lang) {
  currentLang = I18N[lang] ? lang : 'fr';
  document.documentElement.lang = currentLang;
  const dict = I18N[currentLang];
  for (const el of document.querySelectorAll('[data-i18n]')) {
    const key = el.getAttribute('data-i18n');
    if (typeof dict[key] === 'string') el.textContent = dict[key];
  }
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.placeholder = dict.searchPlaceholder;
  document.getElementById('contrib-content').innerHTML = dict.contribHtml;
  document.getElementById('coc-content').innerHTML = dict.cocHtml;
  document.getElementById('faq-content').innerHTML = dict.faqHtml;

  for (const btn of document.querySelectorAll('.lang-btn')) {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  }
  for (const p of document.querySelectorAll('.pill')) {
    p.classList.toggle('active', p.dataset.type === activeFilter);
  }
  updateFavoritesUi();
  renderCollections();
  renderTagPills();
  renderCatalog();
}

function getFilteredItems() {
  const rawQuery = (document.getElementById('search-input')?.value || '').trim().toLowerCase();
  const terms = rawQuery ? rawQuery.split(/\s+/).filter(Boolean) : [];
  const filtered = allItems.filter((item) => {
    if (activeFilter === 'favorites' && !favorites.has(item.name)) return false;
    if (activeFilter === 'reviewed' && item.status !== 'reviewed') return false;
    if (activeFilter !== 'all' && activeFilter !== 'reviewed' && activeFilter !== 'favorites' && item.type !== activeFilter) {
      return false;
    }
    if (activeTag && !(item.tags || []).includes(activeTag)) return false;
    if (!terms.length) return true;
    const hay = `${item.name} ${item.description} ${item.author} ${(item.tags || []).join(' ')}`.toLowerCase();
    return terms.every((t) => hay.includes(t));
  });

  return filtered.sort((a, b) => {
    if (activeSort === 'az') return a.name.localeCompare(b.name);
    if (activeSort === 'author') return a.author.localeCompare(b.author) || a.name.localeCompare(b.name);
    return (a.status === 'reviewed' ? -1 : 1) - (b.status === 'reviewed' ? -1 : 1) || a.name.localeCompare(b.name);
  });
}

function renderCatalog() {
  const dict = I18N[currentLang];
  const filtered = getFilteredItems();
  const slice = filtered.slice(0, visibleLimit);
  const grid = document.getElementById('catalog-grid');
  const countEl = document.getElementById('results-count');
  const moreBtn = document.getElementById('load-more-btn');

  updateFavoritesUi();
  countEl.textContent = dict.resultsShowing(slice.length, filtered.length);
  moreBtn.hidden = slice.length >= filtered.length;

  grid.innerHTML = '';
  for (const item of slice) {
    const card = document.createElement('article');
    card.className = 'res-card';

    const top = document.createElement('div');
    top.className = 'res-top';

    const leftBadges = document.createElement('div');
    leftBadges.style.display = 'flex';
    leftBadges.style.gap = '0.35rem';

    const badge = document.createElement('span');
    badge.className = `badge ${item.type}`;
    badge.textContent = item.type;
    leftBadges.appendChild(badge);

    if (item.status === 'reviewed') {
      const rev = document.createElement('span');
      rev.className = 'badge reviewed';
      rev.textContent = '★ reviewed';
      leftBadges.appendChild(rev);
    }

    const starBtn = document.createElement('button');
    starBtn.type = 'button';
    starBtn.className = 'mini-btn';
    const isFav = favorites.has(item.name);
    starBtn.textContent = isFav ? '⭐' : '☆';
    starBtn.setAttribute('aria-label', `Favorite ${item.name}`);
    starBtn.addEventListener('click', () => {
      if (favorites.has(item.name)) favorites.delete(item.name);
      else favorites.add(item.name);
      saveFavorites();
      renderCatalog();
    });

    top.append(leftBadges, starBtn);

    const title = document.createElement('h3');
    title.className = 'res-title';
    title.textContent = item.name;

    const desc = document.createElement('p');
    desc.className = 'res-desc';
    desc.textContent = item.description;

    const tagsRow = document.createElement('div');
    tagsRow.className = 'res-tags';
    for (const t of item.tags || []) {
      const tg = document.createElement('span');
      tg.className = 'res-tag';
      tg.textContent = t;
      tagsRow.appendChild(tg);
    }

    const footer = document.createElement('div');
    footer.className = 'res-footer';

    const authorSpan = document.createElement('span');
    authorSpan.textContent = `${dict.byAuthor} ${item.author}`;

    const actions = document.createElement('div');
    actions.className = 'res-actions';

    const previewBtn = document.createElement('button');
    previewBtn.type = 'button';
    previewBtn.className = 'mini-btn';
    previewBtn.textContent = dict.previewBtn;
    previewBtn.addEventListener('click', () => openPreviewModal(item));

    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'mini-btn';
    copyBtn.textContent = dict.copyCmd;
    const cliCmd = `npx github:Fazerdino1/gravity-bridge add ${item.name}`;
    copyBtn.addEventListener('click', () => {
      navigator.clipboard?.writeText(cliCmd);
      copyBtn.textContent = dict.copied;
      setTimeout(() => { copyBtn.textContent = I18N[currentLang].copyCmd; }, 1400);
    });

    const link = document.createElement('a');
    link.className = 'mini-btn';
    link.href = `${REPO_URL}/blob/main/${item.path}`;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = dict.viewFile;

    actions.append(previewBtn, copyBtn, link);
    footer.append(authorSpan, actions);
    card.append(top, title, desc, tagsRow, footer);
    grid.appendChild(card);
  }
}

async function init() {
  loadFavorites();
  loadUrlState();
  setupThemeToggle();

  document.getElementById('copy-hero-cli')?.addEventListener('click', (e) => {
    navigator.clipboard?.writeText('npx github:Fazerdino1/gravity-bridge add conventional-commit');
    e.currentTarget.textContent = I18N[currentLang].copied;
  });

  document.getElementById('reset-filters-btn')?.addEventListener('click', () => {
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';
    activeFilter = 'all';
    activeTag = '';
    activeSort = 'reviewed';
    const sortSel = document.getElementById('sort-select');
    if (sortSel) sortSel.value = 'reviewed';
    visibleLimit = PAGE_SIZE;
    for (const p of document.querySelectorAll('.pill')) p.classList.toggle('active', p.dataset.type === 'all');
    renderTagPills();
    syncUrlState();
    renderCatalog();
  });

  for (const btn of document.querySelectorAll('.lang-btn')) {
    btn.addEventListener('click', () => {
      applyLanguage(btn.dataset.lang);
      syncUrlState();
    });
  }
  for (const pill of document.querySelectorAll('.pill')) {
    pill.addEventListener('click', () => {
      activeFilter = pill.dataset.type;
      visibleLimit = PAGE_SIZE;
      for (const p of document.querySelectorAll('.pill')) p.classList.toggle('active', p.dataset.type === activeFilter);
      syncUrlState();
      renderCatalog();
    });
  }
  document.getElementById('search-input')?.addEventListener('input', () => {
    visibleLimit = PAGE_SIZE;
    syncUrlState();
    renderCatalog();
  });
  document.getElementById('sort-select')?.addEventListener('change', (e) => {
    activeSort = e.target.value;
    syncUrlState();
    renderCatalog();
  });
  document.getElementById('load-more-btn')?.addEventListener('click', () => {
    visibleLimit += PAGE_SIZE;
    renderCatalog();
  });

  try {
    const res = await fetch('./catalog.json');
    const data = await res.json();
    allItems = data.items || [];
    allCollections = data.collections || [];
  } catch {
    allItems = [];
    allCollections = [];
  }
  applyLanguage(currentLang);
}

init();
