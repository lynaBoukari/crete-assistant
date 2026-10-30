(function () {
  const CATS = { 0: 'pas de ski de rando', 1: 'Rando découverte', 2: 'Polyvalent', 3: 'Freerando', 4: 'Pente raide' };
  const CATALOGUE = [
    { name: 'Lumen', cat: 1, price: 820, tags: ['balade'], ease: 5, waist: 84, weight: 1450, lengths: [154, 162, 170, 178],
      pitch: 'patin de 84 mm et spatule tolérante : stable et facile en descente, idéal pour débuter', review: 'Les testeurs le jugent rassurant en neige dure comme en neige transformée.' },
    { name: 'Combe', cat: 1, price: 880, tags: ['balade', 'raid'], ease: 4, waist: 86, weight: 1300, lengths: [158, 166, 174, 182],
      pitch: 'un peu plus léger que la moyenne, pour allonger les sorties sans perdre en confort', review: 'Apprécié pour sa légèreté à la montée et ses conversions faciles.' },
    { name: 'Névé', cat: 2, price: 980, tags: ['raid'], ease: 4, waist: 88, weight: 1150, lengths: [160, 168, 176, 184],
      pitch: 'léger pour les longues montées, polyvalent en descente', review: 'Les essais soulignent un excellent rapport poids et accroche en neige dure.' },
    { name: 'Ubac', cat: 2, price: 1140, tags: ['poudreuse', 'balade'], ease: 4, waist: 96, weight: 1400, lengths: [162, 170, 178],
      pitch: 'plus large pour flotter en poudreuse tout en restant facile', review: 'Très joueur en neige fraîche selon les testeurs, un peu moins vif sur neige dure.' },
    { name: 'Cumulus', cat: 3, price: 1240, tags: ['poudreuse', 'raid'], ease: 3, waist: 98, weight: 1350, lengths: [166, 174, 182],
      pitch: 'un freerando léger pour les grandes journées en neige variée', review: 'Bon compromis montée et descente, demande un ski plus engagé.' },
    { name: 'Corniche', cat: 3, price: 1290, tags: ['poudreuse'], ease: 3, waist: 106, weight: 1600, lengths: [168, 176, 184],
      pitch: 'un ski large taillé pour la poudreuse et les pentes ouvertes', review: 'Puissant en descente, plus lourd à la montée.' },
    { name: 'Arête', cat: 4, price: 1380, tags: ['raid'], ease: 2, waist: 82, weight: 1050, lengths: [164, 172, 180],
      pitch: 'un ski technique pour la pente raide et les couloirs', review: 'Précis et très léger, réservé aux skieurs experts.' }
  ];

  const STEPS = [
    { id: 'niveau', q: 'Bonjour ! Je vais vous aider à choisir vos skis de randonnée. Où en êtes-vous en ski de rando ?', opts: [['1', 'Je débute en ski de rando'], ['2', 'J’ai quelques saisons de rando'], ['3', 'Je fais du hors-piste engagé']] },
    { id: 'sorties', q: 'Combien de sorties faites-vous par saison, environ ?', opts: [['lt10', 'Moins de 10'], ['10-25', '10 à 25'], ['gt25', 'Plus de 25']] },
    { id: 'actuel', q: 'Avec quel type de ski partez-vous aujourd’hui ?', opts: [['0', 'Location ou pas encore de ski'], ['1', 'Un ski de rando découverte'], ['2', 'Un ski polyvalent'], ['3', 'Un ski freerando']] },
    { id: 'taille', q: 'Quelle est votre taille ? Elle détermine la longueur de ski conseillée.', opts: [['160', '155 à 165 cm'], ['170', '165 à 175 cm'], ['180', '175 à 185 cm']] },
    { id: 'pratique', q: 'Quel type de sorties visez-vous surtout ?', opts: [['balade', 'Sorties à la journée, pentes douces'], ['raid', 'Longues montées et raids'], ['poudreuse', 'Descentes en poudreuse']] },
    { id: 'objectif', q: 'Avec ces nouveaux skis, vous cherchez plutôt à…', opts: [['securite', 'Progresser en sécurité'], ['engage', 'Skier des pentes plus engagées']] },
    { id: 'budget', q: 'Dernière question : quel budget pour les skis ?', opts: [['900', 'Moins de 900 €'], ['1300', '900 à 1 300 €'], ['99999', 'Pas de limite fixe']] }
  ];
  const SCENARIOS = {
    a: { niveau: '1', sorties: 'lt10', actuel: '0', taille: '170', pratique: 'balade', objectif: 'securite', budget: '900' },
    b: { niveau: '2', sorties: '10-25', actuel: '2', taille: '170', pratique: 'poudreuse', objectif: 'engage', budget: '1300' },
    libre: {}
  };
  const LABELS = { niveau: 'Niveau', sorties: 'Sorties/saison', actuel: 'Ski actuel', taille: 'Taille', pratique: 'Pratique', objectif: 'Objectif', budget: 'Budget' };
  const SLOTS = ['Ven. 6 nov. · 18:00', 'Sam. 7 nov. · 10:30', 'Lun. 9 nov. · 12:20'];

  const log = document.getElementById('log');
  const replies = document.getElementById('replies');
  const trace = document.getElementById('trace');
  const funnel = document.getElementById('funnel');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let scenario = 'a', answers = {}, labels = {}, step = 0, recos = [], run = 0;

  const fmt = n => n.toLocaleString('fr-FR') + ' €';
  const monthly = n => (Math.round(n / 12 * 100) / 100).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €/mois';
  const scroll = () => { log.scrollTop = log.scrollHeight };
  function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e }

  function addTrace(type, text) {
    const empty = trace.querySelector('.empty'); if (empty) empty.remove();
    const li = el('li'); li.append(el('span', 'tag ' + type, { profil: 'Profil', regle: 'Règle', filtre: 'Filtre', ia: 'IA', expert: 'Guide' }[type]), el('span', '', text));
    trace.append(li); trace.scrollTop = trace.scrollHeight;
  }
  function bot(content, then) {
    const id = run;
    const t = el('div', 'msg bot typing', '<i></i><i></i><i></i>'); t.setAttribute('aria-label', 'L’assistant écrit');
    log.append(t); scroll();
    setTimeout(() => {
      if (id !== run) return;
      t.remove();
      log.append(typeof content === 'string' ? el('div', 'msg bot', content) : content);
      scroll(); if (then) then();
    }, reduce ? 150 : 650);
  }
  function user(text) { log.append(el('div', 'msg user', '<p>' + text + '</p>')); scroll() }
  function setOptions(opts, hint) {
    replies.innerHTML = '';
    if (hint) replies.append(el('p', 'hint', hint));
    if (!opts.length) return;
    const box = el('div', 'opts');
    opts.forEach(o => { const b = el('button', 'opt' + (o.suggest ? ' suggest' : ''), o.label); b.type = 'button'; b.addEventListener('click', o.onClick); box.append(b) });
    replies.append(box);
  }

  function ask() {
    const s = STEPS[step], pre = SCENARIOS[scenario][s.id];
    bot('<p>' + s.q + '</p>', () => setOptions(s.opts.map(([v, l]) => ({ label: l, suggest: pre === v, onClick: () => answer(s, v, l) })),
      scenario !== 'libre' ? 'Le choix marqué « démo » suit le scénario. Vous pouvez en choisir un autre.' : null));
  }
  function answer(s, v, l) {
    replies.innerHTML = '';
    answers[s.id] = v; labels[s.id] = l; user(l);
    addTrace('profil', LABELS[s.id] + ' : ' + l);
    step++;
    if (step < STEPS.length) ask(); else decide();
  }

  function lengthFor(w, h) {
    const ok = w.lengths.filter(L => L >= h - 15 && L <= h + 2);
    if (!ok.length) return null;
    return ok.sort((a, b) => Math.abs(a - (h - 5)) - Math.abs(b - (h - 5)))[0];
  }
  function placement(L, h) {
    const d = h - L;
    return d >= 10 ? 'plus court, donc plus maniable dans les conversions' : d >= 4 ? 'le bon compromis entre maniabilité et stabilité' : 'plus long, donc plus stable en neige profonde';
  }

  function decide() {
    const lvl = +answers.niveau, cur = +answers.actuel, h = +answers.taille, budget = +answers.budget;
    const allowed = { 1: 1, 2: 2, 3: 3 }[lvl];
    const target = answers.objectif === 'engage' ? cur + 1 : Math.max(cur, 1);
    let reason = null;
    addTrace('regle', 'Niveau « ' + labels.niveau + ' » : type maximal ' + CATS[allowed] + ' (grille validée par un guide).');
    if (lvl === 1 && cur >= 3) reason = 'Un ski freerando est inhabituel pour débuter la randonnée : un guide doit vérifier votre projet avant tout conseil.';
    else if (target > allowed) reason = 'Passer d’un ski ' + CATS[cur].toLowerCase() + ' à un ski ' + CATS[target].toLowerCase() + ' signifie skier des pentes plus engagées. Ce choix dépend surtout de votre maîtrise du terrain et du risque d’avalanche : il se valide avec un guide.';
    if (reason) addTrace('regle', 'Cible ' + CATS[Math.min(target, 4)] + ' au-dessus du type autorisé : renvoi vers un guide.');

    const showCat = Math.max(1, Math.min(reason ? cur : target, allowed));
    const byCat = CATALOGUE.filter(w => w.cat <= showCat && w.cat >= Math.max(1, showCat - 1));
    const bySize = byCat.filter(w => lengthFor(w, h));
    let byBudget = bySize.filter(w => w.price <= budget), relaxed = false;
    if (!byBudget.length) { byBudget = bySize.slice(); relaxed = true }
    recos = byBudget.map(w => ({ w, score: (w.cat === showCat ? 2 : 0) + (w.tags.includes(answers.pratique) ? 2 : 0) }))
      .sort((a, b) => b.score - a.score || a.w.price - b.w.price).slice(0, 3).map(x => x.w);

    funnel.hidden = false;
    const rows = [['Catalogue', CATALOGUE.length], ['Type compatible', byCat.length], ['Longueur pour ' + labels.taille, bySize.length], ['Dans le budget', relaxed ? 0 : byBudget.length]];
    funnel.innerHTML = rows.map(([l, n]) => '<div><span>' + l + '</span><strong>' + n + '</strong><span class="bar" style="width:' + Math.max(4, n / CATALOGUE.length * 100) + '%"></span></div>').join('');
    addTrace('filtre', CATALOGUE.length + ' skis → ' + byCat.length + ' de type compatible → ' + bySize.length + ' à la bonne longueur → ' + (relaxed ? 'aucun dans le budget, budget élargi' : byBudget.length + ' dans le budget') + '.');
    addTrace('ia', 'Rédige l’explication à partir des fiches produit et des avis sources (simulé dans ce démonstrateur).');

    if (reason) expertFlow(reason, true);
    else bot('<p>Merci ! Voici les skis qui correspondent à votre profil. Chaque information vient de la fiche produit ou d’un essai, cité en bas de carte.</p>' + (relaxed ? '<p>Aucun ski adapté ne rentre dans votre budget : voici les plus proches.</p>' : ''), () => { showRecos(false); followUps() });
  }

  function recoCards(list) {
    const wrap = el('div', 'reco');
    list.forEach((w, i) => {
      const L = lengthFor(w, +answers.taille);
      const c = el('article', 'card' + (i === 0 ? ' top' : ''));
      c.innerHTML =
        '<div class="card-head"><h3>' + w.name + ' <small>' + (i === 0 ? '· le meilleur accord' : '') + '</small></h3>' +
        '<div class="price"><strong>' + fmt(w.price) + '</strong><span>ou ' + monthly(w.price) + ' en 12 fois sans frais</span></div></div>' +
        '<div class="chips"><span class="chip cat">' + CATS[w.cat] + '</span><span class="chip">Longueur ' + L + ' cm</span><span class="chip">Patin ' + w.waist + ' mm</span><span class="chip">' + w.weight.toLocaleString('fr-FR') + ' g/ski</span></div>' +
        '<p class="why"><b>Pourquoi :</b> ' + w.pitch + '. Pour votre taille, la longueur ' + L + ' cm est ' + placement(L, +answers.taille) + '.</p>' +
        '<p class="src"><b>Sources :</b> fiche produit ' + w.name + ' (exemple) · ' + w.review + ' (avis exemple)</p>';
      wrap.append(c);
    });
    wrap.append(el('p', 'safety', '<b>Rappel sécurité :</b> en ski de randonnée, DVA, pelle et sonde sont indispensables, ainsi qu’une formation à leur usage.'));
    return wrap;
  }
  function showRecos(waiting) {
    if (!recos.length) return;
    if (waiting) log.append(el('div', 'msg bot', '<p>En attendant votre échange avec le guide, voici des skis adaptés à votre pratique actuelle :</p>'));
    log.append(recoCards(recos)); scroll();
  }

  function followUps() {
    setOptions([
      { label: 'Lequel est le plus léger à la montée ?', onClick: () => { replies.innerHTML = ''; user('Lequel est le plus léger à la montée ?'); const w = recos.slice().sort((a, b) => a.weight - b.weight)[0]; addTrace('ia', 'Question libre : réponse limitée aux skis proposés, avec source.'); bot('<p>Le plus léger est le <b>' + w.name + '</b> : ' + w.weight.toLocaleString('fr-FR') + ' g par ski. ' + recos.filter(x => x !== w).map(x => x.name + ' : ' + x.weight.toLocaleString('fr-FR') + ' g').join(' · ') + '.</p><p class="src">Source : fiches produit (exemple)</p>', followUps) } },
      { label: 'Et en descente, en neige variée ?', onClick: () => { replies.innerHTML = ''; user('Et en descente, en neige variée ?'); const w = recos.slice().sort((a, b) => b.ease - a.ease || b.waist - a.waist)[0]; addTrace('ia', 'Question libre : réponse limitée aux skis proposés, avec source.'); bot('<p>D’après les essais, le <b>' + w.name + '</b> est le plus facile en neige variée : ' + w.review.charAt(0).toLowerCase() + w.review.slice(1) + '</p><p class="src">Source : avis testeurs ' + w.name + ' (exemple)</p>', followUps) } },
      { label: 'Je préfère parler à un guide', onClick: () => { replies.innerHTML = ''; user('Je préfère parler à un guide'); addTrace('expert', 'Demande du client : renvoi vers un guide.'); expertFlow('Vous souhaitez l’avis d’un guide : c’est la meilleure façon de valider votre choix.', false) } },
      { label: 'Ce conseil m’a aidé', onClick: () => feedback(true) },
      { label: 'Pas vraiment', onClick: () => feedback(false) }
    ], 'Le client peut poser ses questions ou donner son avis.');
  }
  function feedback(ok) {
    replies.innerHTML = '';
    user(ok ? 'Ce conseil m’a aidé' : 'Pas vraiment');
    addTrace('profil', 'Avis client enregistré : ' + (ok ? 'utile' : 'à améliorer') + ' (simulé).');
    bot(ok ? '<p>Merci pour votre retour ! Bonnes sorties.</p>' : '<p>Merci, votre retour aide à améliorer l’assistant. Un guide peut aussi vous conseiller.</p>', () => setOptions([{ label: 'Recommencer la démo', onClick: start }]));
  }

  function expertFlow(reason, withWaiting) {
    const card = el('div', 'expert');
    card.innerHTML =
      '<h3>Votre projet mérite l’avis d’un guide</h3><p>' + reason + '</p>' +
      '<p>Réservez 20 minutes en visio avec un guide de haute montagne. Il recevra ce résumé avant l’échange :</p>' +
      '<dl><dt>Niveau</dt><dd>' + labels.niveau + '</dd><dt>Sorties/saison</dt><dd>' + (labels.sorties || '–') + '</dd><dt>Ski actuel</dt><dd>' + (labels.actuel || '–') + '</dd><dt>Taille</dt><dd>' + (labels.taille || '–') + '</dd><dt>Pratique</dt><dd>' + (labels.pratique || '–') + '</dd><dt>Objectif</dt><dd>' + (labels.objectif || '–') + '</dd>' +
      (recos.length ? '<dt>Skis envisagés</dt><dd>' + recos.map(w => w.name).join(', ') + '</dd>' : '') + '</dl>';
    const slots = el('div', 'slots'); slots.setAttribute('role', 'group'); slots.setAttribute('aria-label', 'Créneaux disponibles (exemple)');
    let picked = null;
    const go = el('button', 'cta', 'Réserver ce créneau'); go.type = 'button'; go.disabled = true;
    SLOTS.forEach(sl => {
      const b = el('button', 'slot', sl); b.type = 'button'; b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => { slots.querySelectorAll('.slot').forEach(x => x.setAttribute('aria-pressed', 'false')); b.setAttribute('aria-pressed', 'true'); picked = sl; go.disabled = false });
      slots.append(b);
    });
    go.addEventListener('click', () => {
      if (!picked) return;
      go.remove(); slots.remove();
      card.append(el('p', 'ok', 'Créneau réservé : ' + picked + ' (simulation). Le guide a reçu votre résumé.'));
      addTrace('expert', 'Créneau ' + picked + ' réservé, résumé envoyé au guide (simulé).');
      scroll();
      setOptions([{ label: 'Ce conseil m’a aidé', onClick: () => feedback(true) }, { label: 'Pas vraiment', onClick: () => feedback(false) }, { label: 'Recommencer la démo', onClick: start }], 'Fin du parcours : le client donne son avis.');
    });
    card.append(slots, go);
    bot(card, () => { if (withWaiting) showRecos(true); setOptions([], 'Choisissez un créneau dans la carte ci-dessus.') });
  }

  function start() {
    run++; answers = {}; labels = {}; step = 0; recos = [];
    log.innerHTML = ''; replies.innerHTML = '';
    trace.innerHTML = '<li class="empty">Les règles et filtres appliqués s’afficheront ici.</li>';
    funnel.hidden = true; funnel.innerHTML = '';
    ask();
  }
  document.querySelectorAll('.scn').forEach(b => b.addEventListener('click', () => {
    scenario = b.dataset.scn;
    document.querySelectorAll('.scn').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    start();
  }));
  document.getElementById('reset').addEventListener('click', start);
  start();
})();
