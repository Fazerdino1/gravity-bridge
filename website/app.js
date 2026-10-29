/* global document, fetch, navigator, setTimeout */
const REPO_URL = 'https://github.com/Fazerdino1/gravity-bridge';
const PAGE_SIZE = 36;

const I18N = {
  fr: {
    navCatalog: 'Catalogue (855)',
    navContributing: 'Contribuer',
    navCoc: 'Code de conduite',
    navFaq: 'FAQ',
    heroTitle: 'Gravity Bridge pour Google Antigravity',
    heroSubtitle:
      "Le hub open source communautaire (licence MIT) regroupant 855 skills, règles et personas d'agents adaptés, vérifiés et attribués pour Google Antigravity.",
    ctaPropose: '+ Proposer une ressource Antigravity',
    ctaProblem: 'Signaler un problème',
    ctaRepo: 'Voir le dépôt GitHub',
    statTotal: 'Ressources',
    statRules: 'Règles (.agents/rules/)',
    catalogTitle: 'Catalogue interactif Antigravity',
    catalogSub: "Recherchez parmi les 855 ressources et copiez le chemin pour votre dossier .agents/.",
    searchLabel: 'Rechercher une ressource',
    searchPlaceholder: 'Rechercher (ex: typescript, commit, docker, security, plan...)',
    filterAll: 'Tous (855)',
    filterRules: 'Règles (193)',
    filterReviewed: 'Vérifiés ★',
    loadMore: 'Afficher plus de résultats',
    resultsShowing: (shown, total) => `${shown} affichés sur ${total} ressources correspondantes`,
    copyCmd: 'Copier chemin',
    copied: 'Copié !',
    viewFile: 'Voir sur GitHub ↗',
    byAuthor: 'Auteur :',
    contribTitle: 'Contribuer & Utiliser avec Google Antigravity',
    contribHtml: `
      <h3>1. Comment installer une ressource dans Google Antigravity</h3>
      <ul>
        <li><strong>Skill ou Persona :</strong> copiez le dossier dans <code>&lt;votre-projet&gt;/.agents/skills/&lt;nom&gt;/SKILL.md</code> (ou globalement dans <code>~/.gemini/skills/</code>). Vous pouvez ensuite l'invoquer avec <code>/&lt;nom&gt;</code>.</li>
        <li><strong>Règle :</strong> copiez le fichier dans <code>&lt;votre-projet&gt;/.agents/rules/&lt;nom&gt;.md</code>.</li>
      </ul>
      <h3>2. Formulaires interactifs GitHub Issues</h3>
      <p>Pour que les menus déroulants et cases à cocher soient cliquables sur GitHub, utilisez ces liens directs vers les formulaires (et non l'aperçu brut du fichier <code>.yml</code> dans le dépôt) :</p>
      <ul>
        <li><a href="${REPO_URL}/issues/new?template=new_resource.yml" target="_blank" rel="noopener">Proposer une nouvelle ressource Antigravity</a></li>
        <li><a href="${REPO_URL}/issues/new?template=conversion_problem.yml" target="_blank" rel="noopener">Signaler un problème de ressource ou de conversion</a></li>
        <li><a href="${REPO_URL}/issues/new?template=bug_report.yml" target="_blank" rel="noopener">Signaler un bug dans les scripts</a></li>
        <li><a href="${REPO_URL}/issues/new?template=license_or_removal_request.yml" target="_blank" rel="noopener">Demande de licence, d'attribution ou de retrait</a></li>
      </ul>
      <h3>3. Convertir ou valider en ligne de commande</h3>
      <pre tabindex="0"><code>npm run convert -- --source &lt;chemin-source&gt; --out . --only &lt;nom&gt; --dry-run
npm run validate</code></pre>
    `,
    cocHeading: 'Code de conduite du Contributor Covenant (v2.1)',
    cocHtml: `
      <h3>Notre engagement</h3>
      <p>En tant que membres, contributeurs et dirigeants, nous nous engageons à faire de la participation à notre communauté une expérience exempte de harcèlement pour tout le monde, quels que soient l'âge, la corpulence, le handicap visible ou invisible, l'appartenance ethnique, les caractéristiques sexuelles, l'identité et l'expression de genre, le niveau d'expérience, l'éducation, le statut socio-économique, la nationalité, l'apparence personnelle, la race, la caste, la couleur de peau, la religion, ou l'identité et l'orientation sexuelles.</p>
      <p>Nous nous engageons à agir et interagir de manière à contribuer à une communauté ouverte, accueillante, diversifiée, inclusive et saine.</p>
      <h3>Nos critères</h3>
      <p><strong>Exemples de comportements positifs :</strong> faire preuve d'empathie et de bienveillance, respecter les opinions divergentes, donner et accepter des critiques constructives, assumer ses responsabilités et se concentrer sur le bien de la communauté.</p>
      <p><strong>Exemples de comportements inacceptables :</strong> langage ou images sexualisés, trolling, commentaires insultants ou péjoratifs, harcèlement public ou privé, publication d'informations privées d'autrui sans autorisation.</p>
      <h3>Application et signalement</h3>
      <p>Tout comportement abusif, harcelant ou inacceptable peut être signalé à <a href="mailto:fazerdinotheck@outlook.fr">fazerdinotheck@outlook.fr</a> ou via le <a href="${REPO_URL}/security/advisories/new" target="_blank" rel="noopener">signalement privé GitHub</a>. Toutes les plaintes sont examinées rapidement, équitablement et en toute confidentialité.</p>
      <h3>Directives d'application (4 niveaux)</h3>
      <ol>
        <li><strong>1. Correction :</strong> avertissement écrit privé et demande d'explication.</li>
        <li><strong>2. Avertissement :</strong> interdiction d'interagir avec les personnes concernées pendant une période donnée.</li>
        <li><strong>3. Bannissement temporaire :</strong> suspension temporaire de toute interaction publique ou privée dans la communauté.</li>
        <li><strong>4. Bannissement permanent :</strong> exclusion définitive en cas de violations graves ou répétées.</li>
      </ol>
      <p>Version intégrale disponible dans le dépôt : <a href="${REPO_URL}/blob/main/CODE_OF_CONDUCT.fr.md" target="_blank" rel="noopener">CODE_OF_CONDUCT.fr.md</a> · <a href="${REPO_URL}/blob/main/CODE_OF_CONDUCT.md" target="_blank" rel="noopener">English</a> · <a href="${REPO_URL}/blob/main/CODE_OF_CONDUCT.es.md" target="_blank" rel="noopener">Español</a> · <a href="${REPO_URL}/blob/main/CODE_OF_CONDUCT.de.md" target="_blank" rel="noopener">Deutsch</a>.</p>
    `,
    faqHeading: 'FAQ — Questions fréquentes',
    faqHtml: `
      <h3>Pourquoi les menus déroulants dans .github/ISSUE_TEMPLATE/*.yml ne sont-ils pas cliquables quand on ouvre le fichier ?</h3>
      <p>Sur GitHub, cliquer sur un fichier <code>.yml</code> dans l'explorateur de code affiche seulement un aperçu statique. Pour utiliser le vrai formulaire interactif, cliquez sur l'onglet <strong>Issues → New issue</strong> ou sur les boutons en haut de ce site.</p>
      <h3>Quelle est la licence des ressources ?</h3>
      <p>Le projet est sous licence MIT et chaque ressource conserve sa licence et son auteur d'origine dans son en-tête et dans <a href="${REPO_URL}/blob/main/NOTICE.md" target="_blank" rel="noopener">NOTICE.md</a>.</p>
      <h3>Comment demander le retrait ou la modification d'une ressource dont je suis l'auteur ?</h3>
      <p>Ouvrez une <a href="${REPO_URL}/issues/new?template=license_or_removal_request.yml" target="_blank" rel="noopener">demande de retrait</a> ou écrivez à <a href="mailto:fazerdinotheck@outlook.fr">fazerdinotheck@outlook.fr</a>. Le retrait est immédiat.</p>
    `,
  },
  en: {
    navCatalog: 'Catalog (855)',
    navContributing: 'Contribute',
    navCoc: 'Code of Conduct',
    navFaq: 'FAQ',
    heroTitle: 'Gravity Bridge for Google Antigravity',
    heroSubtitle:
      'The MIT-licensed open-source community hub hosting 855 skills, rules, and agent personas adapted, validated, and attributed for Google Antigravity.',
    ctaPropose: '+ Propose an Antigravity Resource',
    ctaProblem: 'Report an Issue',
    ctaRepo: 'View GitHub Repository',
    statTotal: 'Resources',
    statRules: 'Rules (.agents/rules/)',
    catalogTitle: 'Interactive Antigravity Catalog',
    catalogSub: 'Search all 855 resources and copy the path for your .agents/ workspace.',
    searchLabel: 'Search resources',
    searchPlaceholder: 'Search (e.g. typescript, commit, docker, security, plan...)',
    filterAll: 'All (855)',
    filterRules: 'Rules (193)',
    filterReviewed: 'Reviewed ★',
    loadMore: 'Load more results',
    resultsShowing: (shown, total) => `Showing ${shown} of ${total} matching resources`,
    copyCmd: 'Copy path',
    copied: 'Copied!',
    viewFile: 'View on GitHub ↗',
    byAuthor: 'Author:',
    contribTitle: 'Contribute & Use with Google Antigravity',
    contribHtml: `
      <h3>1. How to use a resource in Google Antigravity</h3>
      <ul>
        <li><strong>Skill or Persona:</strong> copy the folder into <code>&lt;your-project&gt;/.agents/skills/&lt;name&gt;/SKILL.md</code> (or globally in <code>~/.gemini/skills/</code>) and invoke with <code>/&lt;name&gt;</code>.</li>
        <li><strong>Rule:</strong> copy the file into <code>&lt;your-project&gt;/.agents/rules/&lt;name&gt;.md</code>.</li>
      </ul>
      <h3>2. Interactive GitHub Issue Forms</h3>
      <p>To use clickable dropdowns and checkboxes on GitHub, open the live Issue Forms below (rather than previewing raw <code>.yml</code> files in the repository tree):</p>
      <ul>
        <li><a href="${REPO_URL}/issues/new?template=new_resource.yml" target="_blank" rel="noopener">Propose a New Antigravity Resource</a></li>
        <li><a href="${REPO_URL}/issues/new?template=conversion_problem.yml" target="_blank" rel="noopener">Report a Resource or Conversion Problem</a></li>
        <li><a href="${REPO_URL}/issues/new?template=bug_report.yml" target="_blank" rel="noopener">Report a Tooling Bug</a></li>
        <li><a href="${REPO_URL}/issues/new?template=license_or_removal_request.yml" target="_blank" rel="noopener">License, Attribution, or Removal Request</a></li>
      </ul>
      <h3>3. CLI Converter & Validator</h3>
      <pre tabindex="0"><code>npm run convert -- --source &lt;source-path&gt; --out . --only &lt;name&gt; --dry-run
npm run validate</code></pre>
    `,
    cocHeading: 'Contributor Covenant Code of Conduct (v2.1)',
    cocHtml: `
      <h3>Our Pledge</h3>
      <p>We as members, contributors, and leaders pledge to make participation in our community a harassment-free experience for everyone, regardless of age, body size, visible or invisible disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, caste, color, religion, or sexual identity and orientation.</p>
      <p>We pledge to act and interact in ways that contribute to an open, welcoming, diverse, inclusive, and healthy community.</p>
      <h3>Our Standards</h3>
      <p><strong>Positive behavior includes:</strong> demonstrating empathy and kindness, respecting differing viewpoints, giving and accepting constructive feedback, accepting responsibility, and focusing on what is best for the overall community.</p>
      <p><strong>Unacceptable behavior includes:</strong> sexualized language or imagery, trolling, insulting comments, public or private harassment, and publishing others' private information without permission.</p>
      <h3>Enforcement & Reporting</h3>
      <p>Instances of abusive, harassing, or otherwise unacceptable behavior may be reported to <a href="mailto:fazerdinotheck@outlook.fr">fazerdinotheck@outlook.fr</a> or through <a href="${REPO_URL}/security/advisories/new" target="_blank" rel="noopener">GitHub private reporting</a>. All complaints will be reviewed and investigated promptly, fairly, and confidentially.</p>
      <h3>Enforcement Guidelines (4 Levels)</h3>
      <ol>
        <li><strong>1. Correction:</strong> A private, written warning providing clarity around the violation.</li>
        <li><strong>2. Warning:</strong> A warning with consequences for continued behavior and no interaction for a specified period.</li>
        <li><strong>3. Temporary Ban:</strong> A temporary ban from any interaction or public communication with the community.</li>
        <li><strong>4. Permanent Ban:</strong> A permanent ban from any public interaction within the community.</li>
      </ol>
      <p>Full text in the repository: <a href="${REPO_URL}/blob/main/CODE_OF_CONDUCT.md" target="_blank" rel="noopener">CODE_OF_CONDUCT.md</a> · <a href="${REPO_URL}/blob/main/CODE_OF_CONDUCT.fr.md" target="_blank" rel="noopener">Français</a> · <a href="${REPO_URL}/blob/main/CODE_OF_CONDUCT.es.md" target="_blank" rel="noopener">Español</a> · <a href="${REPO_URL}/blob/main/CODE_OF_CONDUCT.de.md" target="_blank" rel="noopener">Deutsch</a>.</p>
    `,
    faqHeading: 'FAQ — Frequently Asked Questions',
    faqHtml: `
      <h3>Why can't I select options when viewing .github/ISSUE_TEMPLATE/*.yml in the code tree?</h3>
      <p>Viewing a <code>.yml</code> file in GitHub's file browser shows a static preview. Use <strong>Issues → New issue</strong> or the buttons above to open the interactive form.</p>
      <h3>How is attribution handled?</h3>
      <p>Every converted file records its source URL, commit, license, and original author in YAML front matter and in <a href="${REPO_URL}/blob/main/NOTICE.md" target="_blank" rel="noopener">NOTICE.md</a>.</p>
      <h3>How do I request removal of my content?</h3>
      <p>Open a <a href="${REPO_URL}/issues/new?template=license_or_removal_request.yml" target="_blank" rel="noopener">removal request</a> or email <a href="mailto:fazerdinotheck@outlook.fr">fazerdinotheck@outlook.fr</a>.</p>
    `,
  },
  es: {
    navCatalog: 'Catálogo (855)',
    navContributing: 'Contribuir',
    navCoc: 'Código de Conducta',
    navFaq: 'FAQ',
    heroTitle: 'Gravity Bridge para Google Antigravity',
    heroSubtitle:
      'El centro comunitario de código abierto (licencia MIT) con 855 skills, reglas y personas de agentes adaptados, verificados y atribuidos para Google Antigravity.',
    ctaPropose: '+ Proponer un recurso Antigravity',
    ctaProblem: 'Informar de un problema',
    ctaRepo: 'Ver repositorio en GitHub',
    statTotal: 'Recursos',
    statRules: 'Reglas (.agents/rules/)',
    catalogTitle: 'Catálogo interactivo de Antigravity',
    catalogSub: 'Busque entre los 855 recursos y copie la ruta para su carpeta .agents/.',
    searchLabel: 'Buscar recursos',
    searchPlaceholder: 'Buscar (ej: typescript, commit, docker, security, plan...)',
    filterAll: 'Todos (855)',
    filterRules: 'Reglas (193)',
    filterReviewed: 'Revisados ★',
    loadMore: 'Mostrar más resultados',
    resultsShowing: (shown, total) => `Mostrando ${shown} de ${total} recursos`,
    copyCmd: 'Copiar ruta',
    copied: '¡Copiado!',
    viewFile: 'Ver en GitHub ↗',
    byAuthor: 'Autor:',
    contribTitle: 'Contribuir y usar con Google Antigravity',
    contribHtml: `
      <h3>1. Cómo usar un recurso en Google Antigravity</h3>
      <ul>
        <li><strong>Skill o Persona:</strong> copie la carpeta en <code>&lt;su-proyecto&gt;/.agents/skills/&lt;nombre&gt;/SKILL.md</code>.</li>
        <li><strong>Regla:</strong> copie el archivo en <code>&lt;su-proyecto&gt;/.agents/rules/&lt;nombre&gt;.md</code>.</li>
      </ul>
      <h3>2. Formularios interactivos de GitHub Issues</h3>
      <ul>
        <li><a href="${REPO_URL}/issues/new?template=new_resource.yml" target="_blank" rel="noopener">Proponer un nuevo recurso</a></li>
        <li><a href="${REPO_URL}/issues/new?template=conversion_problem.yml" target="_blank" rel="noopener">Informar de un problema de conversión</a></li>
        <li><a href="${REPO_URL}/issues/new?template=license_or_removal_request.yml" target="_blank" rel="noopener">Solicitud de licencia o eliminación</a></li>
      </ul>
    `,
    cocHeading: 'Código de Conducta del Contributor Covenant (v2.1)',
    cocHtml: `
      <p>Nos comprometemos a hacer de la participación en nuestra comunidad una experiencia libre de acoso para todo el mundo, contribuyendo a una comunidad abierta, acogedora, diversa, inclusiva y sana.</p>
      <p>Cualquier comportamiento inaceptable puede reportarse a <a href="mailto:fazerdinotheck@outlook.fr">fazerdinotheck@outlook.fr</a> o mediante el <a href="${REPO_URL}/security/advisories/new" target="_blank" rel="noopener">reporte privado de GitHub</a>.</p>
      <p>Texto completo: <a href="${REPO_URL}/blob/main/CODE_OF_CONDUCT.es.md" target="_blank" rel="noopener">CODE_OF_CONDUCT.es.md</a>.</p>
    `,
    faqHeading: 'FAQ — Preguntas frecuentes',
    faqHtml: `
      <p>Para abrir los formularios interactivos con menús desplegables funcionales, utilice <strong>Issues → New issue</strong> o los enlaces directos de esta página.</p>
    `,
  },
  de: {
    navCatalog: 'Katalog (855)',
    navContributing: 'Mitwirken',
    navCoc: 'Verhaltenskodex',
    navFaq: 'FAQ',
    heroTitle: 'Gravity Bridge für Google Antigravity',
    heroSubtitle:
      'Der Open-Source-Community-Hub (MIT-Lizenz) mit 855 angepassten, geprüften und zugeordneten Skills, Regeln und Agenten-Personas für Google Antigravity.',
    ctaPropose: '+ Antigravity-Ressource vorschlagen',
    ctaProblem: 'Problem melden',
    ctaRepo: 'GitHub-Repository ansehen',
    statTotal: 'Ressourcen',
    statRules: 'Regeln (.agents/rules/)',
    catalogTitle: 'Interaktiver Antigravity-Katalog',
    catalogSub: 'Durchsuchen Sie alle 855 Ressourcen und kopieren Sie den Pfad für Ihren .agents/-Ordner.',
    searchLabel: 'Ressource suchen',
    searchPlaceholder: 'Suchen (z. B. typescript, commit, docker, security, plan...)',
    filterAll: 'Alle (855)',
    filterRules: 'Regeln (193)',
    filterReviewed: 'Geprüft ★',
    loadMore: 'Mehr Ergebnisse laden',
    resultsShowing: (shown, total) => `${shown} von ${total} passenden Ressourcen angezeigt`,
    copyCmd: 'Pfad kopieren',
    copied: 'Kopiert!',
    viewFile: 'Auf GitHub ansehen ↗',
    byAuthor: 'Autor:',
    contribTitle: 'Mitwirken & Nutzung mit Google Antigravity',
    contribHtml: `
      <h3>1. Nutzung in Google Antigravity</h3>
      <ul>
        <li><strong>Skill oder Persona:</strong> Ordner nach <code>&lt;projekt&gt;/.agents/skills/&lt;name&gt;/SKILL.md</code> kopieren.</li>
        <li><strong>Regel:</strong> Datei nach <code>&lt;projekt&gt;/.agents/rules/&lt;name&gt;.md</code> kopieren.</li>
      </ul>
      <h3>2. Interaktive GitHub-Issue-Formulare</h3>
      <ul>
        <li><a href="${REPO_URL}/issues/new?template=new_resource.yml" target="_blank" rel="noopener">Neue Ressource vorschlagen</a></li>
        <li><a href="${REPO_URL}/issues/new?template=conversion_problem.yml" target="_blank" rel="noopener">Konvertierungsproblem melden</a></li>
        <li><a href="${REPO_URL}/issues/new?template=license_or_removal_request.yml" target="_blank" rel="noopener">Lizenz- oder Entfernungsanfrage</a></li>
      </ul>
    `,
    cocHeading: 'Verhaltenskodex des Contributor Covenant (v2.1)',
    cocHtml: `
      <p>Wir verpflichten uns, die Teilnahme an unserer Gemeinschaft zu einer belästigungsfreien Erfahrung für alle zu machen.</p>
      <p>Vorfälle können unter <a href="mailto:fazerdinotheck@outlook.fr">fazerdinotheck@outlook.fr</a> oder über die <a href="${REPO_URL}/security/advisories/new" target="_blank" rel="noopener">private Sicherheitsmeldung auf GitHub</a> gemeldet werden.</p>
      <p>Vollständiger Text: <a href="${REPO_URL}/blob/main/CODE_OF_CONDUCT.de.md" target="_blank" rel="noopener">CODE_OF_CONDUCT.de.md</a>.</p>
    `,
    faqHeading: 'FAQ — Häufig gestellte Fragen',
    faqHtml: `
      <p>Verwenden Sie <strong>Issues → New issue</strong> oder die Schaltflächen oben, um die interaktiven GitHub-Formulare zu öffnen.</p>
    `,
  },
};

let currentLang = 'fr';
let allItems = [];
let activeFilter = 'all';
let visibleLimit = PAGE_SIZE;

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
  renderCatalog();
}

function getFilteredItems() {
  const q = (document.getElementById('search-input')?.value || '').trim().toLowerCase();
  return allItems.filter((item) => {
    if (activeFilter === 'reviewed' && item.status !== 'reviewed') return false;
    if (activeFilter !== 'all' && activeFilter !== 'reviewed' && item.type !== activeFilter) return false;
    if (!q) return true;
    return (
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.author.toLowerCase().includes(q)
    );
  });
}

function renderCatalog() {
  const dict = I18N[currentLang];
  const filtered = getFilteredItems();
  const slice = filtered.slice(0, visibleLimit);
  const grid = document.getElementById('catalog-grid');
  const countEl = document.getElementById('results-count');
  const moreBtn = document.getElementById('load-more-btn');

  countEl.textContent = dict.resultsShowing(slice.length, filtered.length);
  moreBtn.hidden = slice.length >= filtered.length;

  grid.innerHTML = '';
  for (const item of slice) {
    const card = document.createElement('article');
    card.className = 'res-card';

    const top = document.createElement('div');
    top.className = 'res-top';

    const badge = document.createElement('span');
    badge.className = `badge ${item.type}`;
    badge.textContent = item.type;
    top.appendChild(badge);

    if (item.status === 'reviewed') {
      const rev = document.createElement('span');
      rev.className = 'badge reviewed';
      rev.textContent = '★ reviewed';
      top.appendChild(rev);
    }

    const title = document.createElement('h3');
    title.className = 'res-title';
    title.textContent = item.name;

    const desc = document.createElement('p');
    desc.className = 'res-desc';
    desc.textContent = item.description;

    const footer = document.createElement('div');
    footer.className = 'res-footer';

    const authorSpan = document.createElement('span');
    authorSpan.textContent = `${dict.byAuthor} ${item.author}`;

    const actions = document.createElement('div');
    actions.className = 'res-actions';

    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'mini-btn';
    copyBtn.textContent = dict.copyCmd;
    copyBtn.addEventListener('click', () => {
      navigator.clipboard?.writeText(item.path);
      copyBtn.textContent = dict.copied;
      setTimeout(() => {
        copyBtn.textContent = I18N[currentLang].copyCmd;
      }, 1400);
    });

    const link = document.createElement('a');
    link.className = 'mini-btn';
    link.href = `${REPO_URL}/blob/main/${item.path}`;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = dict.viewFile;

    actions.append(copyBtn, link);
    footer.append(authorSpan, actions);
    card.append(top, title, desc, footer);
    grid.appendChild(card);
  }
}

async function init() {
  for (const btn of document.querySelectorAll('.lang-btn')) {
    btn.addEventListener('click', () => applyLanguage(btn.dataset.lang));
  }
  for (const pill of document.querySelectorAll('.pill')) {
    pill.addEventListener('click', () => {
      for (const p of document.querySelectorAll('.pill')) p.classList.remove('active');
      pill.classList.add('active');
      activeFilter = pill.dataset.type;
      visibleLimit = PAGE_SIZE;
      renderCatalog();
    });
  }
  document.getElementById('search-input')?.addEventListener('input', () => {
    visibleLimit = PAGE_SIZE;
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
    allItems.sort((a, b) => (a.status === 'reviewed' ? -1 : 1) - (b.status === 'reviewed' ? -1 : 1) || a.name.localeCompare(b.name));
  } catch {
    allItems = [];
  }
  applyLanguage('fr');
}

init();
