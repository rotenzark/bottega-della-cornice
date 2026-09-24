/* PLUMBING_V 4 — Bespoke Studio · meccanica invisibile canonica.
   ────────────────────────────────────────────────────────────────
   CONFINE (inviolabile): questo file contiene SOLO plumbing — la meccanica
   che il visitatore non percepisce come design. NIENTE markup di sezioni,
   NIENTE stile, NIENTE struttura: concept, griglia, tipografia, hero e
   animazioni-firma si progettano DA ZERO per ogni cliente (GATE #3).
   Se qui dentro scivola del layout, questo diventa il nuovo scheletro
   condiviso — cioè il difetto "copia-incolla" che il metodo combatte.

   Come si usa: si COPIA nella cartella js/ del sito e si adatta la sola
   costante SITE. Le animazioni-firma del sito si scrivono nel proprio
   main.js DOPO questo file (o in coda a questo file, sotto il marcatore).
   Ogni bug nuovo si corregge QUI (bump PLUMBING_V + changelog nel README)
   e poi nel sito: mai il contrario.

   Fix già incorporati (non rimuovere):
   - ScrollTrigger registrato SUBITO allo script load, MAI dentro l'intro
     o un setTimeout (bug APF #5 del 16/7: race col watchdog → sezioni
     che sparivano allo scroll).
   - Reveal con once:true (niente re-animazioni da zero ri-scorrendo).
   - Watchdog 1,5s che forza visibile e UCCIDE i trigger non scattati.
   - Lightbox su [hidden] + override CSS !important (bug: display:flex
     batteva [hidden] e la lightbox restava visibile).
   - Foto-contenuto MAI lazy (regola workflow §8): il plumbing non tocca
     il loading, ma il lint lo verifica.
   - Orari Europe/Rome con finestre multiple e scavalco di mezzanotte
     (pattern Il Cavallante 18:00–00:30). */

(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) root.classList.add('reduced-motion');

  /* ══════════ CONFIG PER-SITO — l'unica parte da adattare ══════════ */
  var SITE = {
    slug: 'bottega-della-cornice',    // usato per localStorage lang
    whatsapp: {
      number: '',                     // '39xxxxxxxxxx' — vuoto = niente wiring
      message: 'Ciao! Vorrei informazioni.',
      ids: ['ctaPrenota', 'heroWhatsapp', 'doveWhatsapp', 'barWhatsapp'],
    },
    /* orari: per giorno (0=domenica) un array di finestre [inizio, fine]
       in minuti-stringa 'HH:MM'. Fine oltre '24:00' = scavalca mezzanotte
       (es. ['18:00','24:30'] = apre alle 18, chiude alle 00:30 del giorno
       dopo). Giorno chiuso = []. */
    /* Scheda Google (24/9/2026): lun–ven 08:30–13:00 e 14:00–18:00, sabato 08:30–13:00, domenica chiuso. */
    hours: {
      0: [],
      1: [['08:30', '13:00'], ['14:00', '18:00']],
      2: [['08:30', '13:00'], ['14:00', '18:00']],
      3: [['08:30', '13:00'], ['14:00', '18:00']],
      4: [['08:30', '13:00'], ['14:00', '18:00']],
      5: [['08:30', '13:00'], ['14:00', '18:00']],
      6: [['08:30', '13:00']],
    },
    hoursStatusId: 'orarioStato',     // elemento testo stato
    hoursTableSelector: '[data-day]', // righe/li con data-day da evidenziare
    todayClass: 'is-today',
    introId: 'intro',
    introDuration: 1800,
    revealSelector: '.reveal',
    inViewClass: 'in-view',
    breakpointMenu: 960,
    /* dizionario EN: SOLO overlay — l'HTML è la versione italiana.
       Forma storica a due lingue, resta valida e invariata. */
    EN: {
      "intro.skip": "skip",
      "nav.home": "La Bottega della Cornice, back to top",
      "nav.apri": "Open the menu",
      "marchio.s": "Ditta D'Urso · Via Asiago 4, Milan",
      "nav.cose": "What to bring",
      "nav.come": "How it works",
      "nav.voci": "Reviews",
      "nav.dove": "Where & hours",
      "cta.chiama": "Call",
      "cta.chiama2": "Call +39 02 257 0385",
      "h.kicker": "Picture framer · Via Asiago 4, Gorla, Milan",
      "h.h1": "The right corner.",
      "h.sub": "For a degree certificate, a print, a puzzle, a mirror, an old frame that needs mending. <em>You choose together from the wall of corner samples</em>: the moulding, the mat, the glass. Then in the workshop it is cut at forty-five degrees and joined.",
      "h.cta1": "Call +39 02 257 0385",
      "h.cta2": "What to bring",
      "camp.t": "<b>The wall of corner samples:</b> walnut, gold, silver, black, white, natural wood. The frame is chosen from here.",
      "c.k": "what comes into the workshop",
      "c.h": "Eight things customers bring here.",
      "c.p": "They are the ones they describe in their reviews: <em>each has its own frame</em>, and for each there is advice on model and colour, if you want it.",
      "c1.t": "Degrees and diplomas",
      "c1.d": "To frame, and to unframe if you have to take them away. In a hurry? Let us know beforehand.",
      "c2.t": "Prints and photographs",
      "c2.d": "With the right mat. Japanese prints and textiles too.",
      "c3.t": "Paintings and artworks",
      "c3.d": "For those who paint, those who collect, those who exhibit.",
      "c4.t": "Children's drawings",
      "c4.d": "Worth a real frame, like a painting.",
      "c5.t": "The finished puzzle",
      "c5.d": "Fixed and framed, so it stays as it is.",
      "c6.t": "The made-to-measure mirror",
      "c6.d": "With a classic frame, in gold or silver leaf.",
      "c7.t": "The old frame",
      "c7.d": "Broken, chipped, in need of mending: it gets restored, with a quote first.",
      "c8.t": "For the office and the gallery",
      "c8.d": "Series of paintings for a company, works for an exhibition: with a quote.",
      "k.k": "how it works",
      "k.h": "Four cuts, four steps.",
      "k.p": "A frame is four mouldings cut at forty-five degrees and joined at the corners. <em>The work is done this way, and it is done here</em>, in the workshop behind the windows.",
      "s1.t": "Bring the work",
      "s1.d": "Or the measurements, if you don't have it yet: you look together at what it deserves, and how.",
      "s2.t": "Choose from the corner",
      "s2.d": "The moulding from the sample wall, the mat, the glass. With a suggestion on models and colours, if you ask.",
      "s3.t": "Cut and joined in the workshop",
      "s3.d": "Four cuts at forty-five degrees, the corners joined, the glass cleaned, the back closed.",
      "s4.t": "Pick it up",
      "s4.d": "With the hanger already fitted and the workshop's plaque on the back: street and phone number, for next time.",
      "k.nota": "<b>For those who work with art.</b> Galleries, artists, photographers, offices: mats and boards cut from vector files too, a quote for series and installations.",
      "k.a1": "The white back of a frame with the brass hanger and the workshop's engraved plaque: Via Asiago 4, Milan, and the phone number",
      "k.c1": "The back: the hanger and the workshop's plaque",
      "k.a2": "A print framed in light wood, photographed by a customer",
      "k.c2": "A print in light wood, photographed by the person who picked it up",
      "v.k": "the reviews",
      "v.h": "What people write.",
      "v.p": "In the 42 Google reviews with a text, <em>30 talk about professionalism, 13 about advice on the choice, 12 about honest prices</em>. Among those who write there is a critic and gallery owner, someone who had the company's paintings framed, someone who brought in a broken old frame. The owner replies to 47 reviews out of 63, almost always with two words: thank you.",
      "v.badge": "63 reviews on Google",
      "v.cit": "«one of the few artisan framers still around in Milan»",
      "v.citda": "From a Google review (translated)",
      "v.btn": "Read the reviews on Google",
      "d.k": "where and when",
      "d.h": "Via Asiago 4, Gorla.",
      "d.p": "A short walk from the Martesana canal: two windows with the red sign, <em>the workshop behind</em>.",
      "d.n1": "<b>Saturday</b> mornings only; closed from 1 to 2 pm on the other days.",
      "d.n2": "<b>In a hurry?</b> Phone before coming by.",
      "d.n3": "<b>Large jobs or series</b>: agreed with a quote.",
      "d.tel": "Call +39 02 257 0385",
      "d.strada": "Directions",
      "o.cap": "Opening hours",
      "g.lun": "Monday",
      "g.mar": "Tuesday",
      "g.mer": "Wednesday",
      "g.gio": "Thursday",
      "g.ven": "Friday",
      "g.sab": "Saturday",
      "g.dom": "Sunday",
      "g.chiuso": "closed",
      "d.mappa": "Map: La Bottega della Cornice, Via Asiago 4, Milan",
      "d.alt": "The two windows of the shop on Via Asiago with the red sign «La Bottega della Cornice» and the frames on display",
      "d.cap": "The two windows at Via Asiago 4",
      "do.h": "The questions we get asked.",
      "qa.1": "Do you make custom frames?",
      "ra.1": "Yes: you choose together the moulding from the wall of corner samples, the mat and the glass, then in the workshop it is cut at forty-five degrees and joined. For paintings, prints, photographs, degrees, puzzles and drawings.",
      "qa.2": "Do you restore old frames?",
      "ra.2": "Yes: old frames that are broken or chipped are mended in the workshop, with a quote before starting.",
      "qa.3": "Do you make mirrors to measure?",
      "ra.3": "Yes: made-to-measure mirrors with the frame you prefer, classic ones in gold or silver leaf too.",
      "qa.4": "Do you frame puzzles?",
      "ra.4": "Yes: the finished puzzle is fixed and framed, so it stays as it is.",
      "qa.5": "How long does it take?",
      "ra.5": "It depends on the job and on how many are in the queue: it is agreed when you bring the work. In a hurry? Let us know beforehand with a phone call: +39 02 257 0385.",
      "qa.6": "What are your hours?",
      "ra.6": "Monday to Friday from 8.30 am to 1 pm and from 2 to 6 pm; Saturday from 8.30 am to 1 pm. Closed on Sunday.",
      "piede.s": "picture framer · custom frames · mirrors · restoration · Milan, Gorla",
      "piede.d": "Ditta D'Urso di Fazzello Paolo e Blanco Salvatore &amp; C. S.n.c. · Via Asiago 4, 20128 Milan · <a href='tel:+39022570385'>+39 02 257 0385</a>",
      "piede.o": "<b>Hours</b>Monday–Friday 8.30–1 and 2–6 pm · Saturday 8.30–1 · Sunday closed",
      "piede.b": "Demo website made by <a href='https://bespokestud.io' target='_blank' rel='noopener'>Bespoke Studio</a> · texts, hours and services from the business's public sources; photographs published on the business's Google listing.",
      "b.chiama": "Call",
      "b.cose": "Bring",
      "b.orari": "Hours",
      "b.mappa": "Map",
      "lb.chiudi": "Close",
    },
    /* MULTILINGUA (V4) — per i siti con più di due lingue, al posto di EN:
         LANGS: { en: {chiave:'...'}, ar: {chiave:'...'} }
       L'italiano resta SEMPRE la lingua del DOM e non ha dizionario.
       Se si valorizza EN e non LANGS, il comportamento è identico a prima. */
    LANGS: null,
    RTL: ['ar', 'he', 'fa', 'ur'],   // lingue che ribaltano dir=rtl
    /* etichette dello stato orari per lingua non-IT; l'IT è nel codice.
       Chiave mancante = fallback all'inglese, poi all'italiano. */
    HOURS_I18N: null,
  };
  /* normalizzazione: EN storico -> LANGS */
  if (!SITE.LANGS) SITE.LANGS = SITE.EN && Object.keys(SITE.EN).length ? { en: SITE.EN } : {};
  var LANG_CODES = Object.keys(SITE.LANGS);   // senza 'it', che è il DOM
  /* ═════════════════════════════════════════════════════════════════ */

  /* ---------- WhatsApp wiring ---------- */
  if (SITE.whatsapp.number) {
    var waHref = 'https://wa.me/' + SITE.whatsapp.number + '?text=' +
      encodeURIComponent(SITE.whatsapp.message);
    SITE.whatsapp.ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.href = waHref; el.target = '_blank'; el.rel = 'noopener'; }
    });
  }

  /* ---------- GSAP: registrazione IMMEDIATA + reveal + watchdog ---------- */
  var hasGsap = typeof gsap !== 'undefined';
  var hasST = hasGsap && typeof ScrollTrigger !== 'undefined';
  if (hasST) gsap.registerPlugin(ScrollTrigger);

  function showAllReveals() {
    var els = document.querySelectorAll(SITE.revealSelector);
    els.forEach(function (el) { el.classList.add(SITE.inViewClass); });
    if (hasGsap) {
      if (hasST) {
        els.forEach(function (el) {
          ScrollTrigger.getAll().forEach(function (st) {
            if (st.trigger === el && !st.progress) st.kill();
          });
        });
      }
      gsap.set(els, { opacity: 1, y: 0, x: 0 });
    }
  }
  // FIX FOUC (18/7): il watchdog è SOLO un fallback se GSAP non c'è (o reduced-motion).
  // Rivelare in anticipo tutti i .reveal mentre gli scroll-trigger sono attivi causava il
  // flash (scompaiono/ricompaiono) sotto la piega. Con GSAP attivo, rivelano gli ScrollTrigger.
  setTimeout(function () { if (!hasGsap || reducedMotion) showAllReveals(); }, 1500);

  if (hasGsap && !reducedMotion) {
    // reveal generico: le animazioni-FIRMA del sito vanno oltre questo,
    // ma si registrano ANCHE LORO subito, mai dopo l'intro.
    // ⚠️ REGOLA ANTI-FLASH (18/7): un elemento .reveal deve avere UNA SOLA animazione che
    // ne porta l'opacità a 1. Se un elemento ha una FIRMA che ne anima l'opacità (stagger,
    // timeline, ecc.), ESCLUDILO da qui via SITE.revealSelector (es. '.reveal:not(.mondo)'),
    // altrimenti il reveal generico + la firma si sovrappongono e l'elemento FLASHA.
    // immediateRender:false → lo stato "from" (opacity:0) NON viene ri-applicato ad ogni
    // ScrollTrigger.refresh() (che scatta al window.load mentre scrolli) → niente flash su refresh.
    gsap.utils.toArray(SITE.revealSelector).forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, y: 28 }, {
        opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });
  } else {
    // fallback senza GSAP: IntersectionObserver + classe
    if ('IntersectionObserver' in window && !reducedMotion) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add(SITE.inViewClass); io.unobserve(e.target); }
        });
      }, { threshold: 0.12 });
      document.querySelectorAll(SITE.revealSelector).forEach(function (el) { io.observe(el); });
    } else {
      showAllReveals();
    }
  }

  /* ---------- intro skippabile (NON gate-a nulla) ---------- */
  var intro = document.getElementById(SITE.introId);
  /* ⚠️ L'hook si legge AL MOMENTO DELLA CHIAMATA, mai catturato per valore
     qui. Il codice-firma vive sotto il marcatore di fine plumbing — cioè
     gira DOPO questa riga — quindi `window.bespokeHeroEntrance ||
     function(){}` congelava la funzione vuota e l'entrata dell'hero non
     partiva più: titolo a opacity 0 per sempre, hero vuota sul live.
     (20/7/2026, riprodotto a schermo su Benessere Futuro #159.) */
  function heroEntrance() {
    if (typeof window.bespokeHeroEntrance === 'function') window.bespokeHeroEntrance();
  }
  function hideIntro() {
    if (!intro) return;
    var el = intro; intro = null;
    el.classList.add('hide');
    setTimeout(function () { el.remove(); }, 700);
    heroEntrance();
  }
  // rimozione IMMEDIATA (niente fade): serve quando qualcosa deve stare sopra
  // l'intro subito, es. l'apertura del menu. Durante il fade l'intro resta
  // hit-testable e i link del drawer non sono cliccabili.
  function killIntroNow() {
    if (!intro) return;
    var el = intro; intro = null;
    el.remove();
    heroEntrance();
  }
  if (reducedMotion || !intro) {
    if (intro) { intro.remove(); intro = null; }
    /* ⚠️ setTimeout 0 NON è decorativo: senza intro questo ramo gira in modo
       SINCRONO, cioè PRIMA che il codice-firma — che sta sotto il marcatore
       di fine plumbing, dentro questa stessa IIFE — abbia assegnato
       `window.bespokeHeroEntrance`. Il risultato è un'entrata dell'hero MUTA:
       nessun errore, elementi visibili, animazione semplicemente mai partita.
       Rimandando di un tick la IIFE è conclusa e l'hook esiste.
       (14/8/2026, A.S.FA. Sicilia: misurato h1 a opacity 1 già al load.)
       Cugino del bug `hero-hook-congelato` del 20/7: lì l'hook era catturato
       troppo presto, qui è CHIAMATO troppo presto. */
    setTimeout(heroEntrance, 0);
  } else {
    setTimeout(hideIntro, SITE.introDuration);
    setTimeout(hideIntro, 6000); // safety net: l'intro non può incastrarsi
    intro.addEventListener('click', hideIntro);
  }

  /* ---------- burger menu (inert + focus + Escape + resize) ---------- */
  var burger = document.getElementById('burger');
  /* 26/7/2026 (Il Papiro #168) — IL PANNELLO SI RISOLVE DA `aria-controls`.
     Il canone apriva sempre `#mainNav`, dando per scontato che la nav
     desktop FOSSE anche il drawer. Molti siti invece hanno un drawer
     separato (`#mobile-menu`) con `hidden`, mentre `#mainNav` su mobile è
     `display:none`: il burger aggiungeva `nav-open` a un elemento nascosto
     e il menu non si apriva. È la stessa decisione già presa il 20/7 per
     qa-motion — «è lì che il markup accessibile dice qual è il pannello» —
     che però non era mai rientrata qui. */
  var nav = (function () {
    var byAria = burger && burger.getAttribute('aria-controls');
    return (byAria && document.getElementById(byAria)) || document.getElementById('mainNav');
  })();
  if (burger && nav) {
    var navUsaHidden = nav.hasAttribute('hidden');
    var lastFocus = null;
    var closeNav = function () {
      nav.classList.remove('nav-open');
      if (navUsaHidden) nav.hidden = true;
      burger.setAttribute('aria-expanded', 'false');
      if (lastFocus) { lastFocus.focus(); lastFocus = null; }
    };
    var openNav = function () {
      // L'intro ha z-index alto ed è figlia del body: se è ancora a schermo
      // copre il drawer (che vive nello stacking context dell'header) e i link
      // risultano non cliccabili. Aprire il menu chiude l'intro.
      // (bug trovato da qa-motion su Linea Uomo, 19/7/2026 → PLUMBING_V 2)
      if (typeof killIntroNow === 'function') killIntroNow();
      lastFocus = document.activeElement;
      if (navUsaHidden) nav.hidden = false;
      nav.classList.add('nav-open');
      burger.setAttribute('aria-expanded', 'true');
      var first = nav.querySelector('a, button');
      if (first) first.focus();
    };
    burger.addEventListener('click', function () {
      nav.classList.contains('nav-open') ? closeNav() : openNav();
    });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeNav); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('nav-open')) closeNav();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > SITE.breakpointMenu) closeNav();
    });
  }

  /* ---------- lightbox accessibile ---------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxClose = document.getElementById('lightboxClose');
  if (lightbox && lightboxImg) {
    var opener = null;
    var openLb = function (src, alt) {
      lightboxImg.src = src; lightboxImg.alt = alt || '';
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      if (lightboxClose) lightboxClose.focus();
    };
    var closeLb = function () {
      lightbox.hidden = true; lightboxImg.src = '';
      document.body.style.overflow = '';
      if (opener) { opener.focus(); opener = null; }
    };
    document.querySelectorAll('[data-full]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        opener = btn;
        var img = btn.querySelector('img');
        openLb(btn.getAttribute('data-full'), img ? img.alt : '');
      });
    });
    if (lightboxClose) lightboxClose.addEventListener('click', closeLb);
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !lightbox.hidden) closeLb();
    });
  }

  /* ---------- orari dinamici Europe/Rome (finestre multiple + scavalco) ---------- */
  function romeNow() {
    try {
      var f = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Rome', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
      });
      var p = f.formatToParts(new Date());
      var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      var get = function (t) { return p.find(function (x) { return x.type === t; }).value; };
      return { day: map[get('weekday')], mins: parseInt(get('hour'), 10) * 60 + parseInt(get('minute'), 10) };
    } catch (e) {
      var d = new Date();
      return { day: d.getDay(), mins: d.getHours() * 60 + d.getMinutes() };
    }
  }
  var toMin = function (hm) {
    var a = hm.split(':');
    return parseInt(a[0], 10) * 60 + parseInt(a[1], 10);
  };
  var fmt = function (m) {
    m = m % 1440;
    return ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + (m % 60)).slice(-2);
  };
  var DAYS_IT = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  var DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var HOURS_BASE = {
    it: { open: 'Aperto ora', closesAt: 'chiude alle ', opensToday: 'Chiuso · apre oggi alle ',
          opensOn: 'Chiuso · apre {day} alle ', closed: 'Chiuso', days: DAYS_IT },
    en: { open: 'Open now', closesAt: 'closes at ', opensToday: 'Closed · opens today at ',
          opensOn: 'Closed · opens {day} at ', closed: 'Closed', days: DAYS_EN },
  };
  /* risolve le etichette orari per la lingua richiesta, con fallback en -> it */
  function strings(lang) {
    var custom = (SITE.HOURS_I18N && SITE.HOURS_I18N[lang]) || null;
    var base = HOURS_BASE[lang] || HOURS_BASE.en;
    if (!custom) return base;
    var outp = {};
    Object.keys(HOURS_BASE.it).forEach(function (k) {
      outp[k] = custom[k] !== undefined ? custom[k] : base[k];
    });
    return outp;
  }

  function hoursState() {
    var now = romeNow();
    // finestra del giorno corrente
    var wins = SITE.hours[now.day] || [];
    for (var i = 0; i < wins.length; i++) {
      var s = toMin(wins[i][0]), e = toMin(wins[i][1]);
      if (now.mins >= s && now.mins < Math.min(e, 1440)) {
        return { open: true, day: now.day, closesAt: fmt(e) };
      }
    }
    // coda dopo mezzanotte della sera PRIMA
    var prev = (now.day + 6) % 7;
    var pw = SITE.hours[prev] || [];
    for (var j = 0; j < pw.length; j++) {
      var pe = toMin(pw[j][1]);
      if (pe > 1440 && now.mins < pe - 1440) {
        return { open: true, day: prev, closesAt: fmt(pe) };
      }
    }
    // chiuso: prossima apertura (oggi o nei prossimi 7 giorni)
    for (var k = 0; k < wins.length; k++) {
      if (now.mins < toMin(wins[k][0])) {
        return { open: false, day: now.day, opensToday: fmt(toMin(wins[k][0])) };
      }
    }
    for (var d = 1; d <= 7; d++) {
      var nd = (now.day + d) % 7;
      var nw = SITE.hours[nd] || [];
      if (nw.length) return { open: false, day: now.day, opensDay: nd, opensAt: fmt(toMin(nw[0][0])) };
    }
    return { open: false, day: now.day };
  }

  function renderHours() {
    var el = document.getElementById(SITE.hoursStatusId);
    var st = hoursState();
    document.querySelectorAll(SITE.hoursTableSelector).forEach(function (row) {
      row.classList.toggle(SITE.todayClass,
        parseInt(row.getAttribute('data-day'), 10) === st.day);
    });
    if (!el) return;
    /* V4: le etichette si risolvono per lingua corrente, non con un booleano
       en/it. Fallback a catena lingua -> en -> it, così un sito con AR o FR
       che non traduce lo stato orari resta comunque leggibile. */
    var L = strings(root.lang);
    var txt;
    if (st.open) {
      txt = L.open + ' · ' + L.closesAt + st.closesAt;
    } else if (st.opensToday) {
      txt = L.opensToday + st.opensToday;
    } else if (st.opensAt !== undefined) {
      txt = L.opensOn.replace('{day}', L.days[st.opensDay]) + st.opensAt;
    } else {
      txt = L.closed;
    }
    el.textContent = txt;
  }
  renderHours();
  setInterval(renderHours, 60000);

  /* ---------- i18n overlay (EN sopra l'IT del DOM) ---------- */
  var originals = {}; // attr -> key -> testo IT
  var I18N_ATTRS = [
    ['data-i18n', null],
    ['data-i18n-aria', 'aria-label'],
    ['data-i18n-alt', 'alt'],
    ['data-i18n-placeholder', 'placeholder'],
    ['data-i18n-title', 'title'],
  ];
  function setLang(lang) {
    /* V4: qualunque lingua dichiarata in SITE.LANGS, non più solo 'en'.
       'it' resta la lingua del DOM: nessun dizionario, nessuna sostituzione.
       Una lingua sconosciuta ricade su 'it' invece di rompere la pagina. */
    root.lang = (lang === 'it' || LANG_CODES.indexOf(lang) !== -1) ? lang : 'it';
    root.dir = SITE.RTL.indexOf(root.lang) !== -1 ? 'rtl' : 'ltr';
    var dict = SITE.LANGS[root.lang] || null;
    I18N_ATTRS.forEach(function (pair) {
      var dattr = pair[0], target = pair[1];
      if (!originals[dattr]) originals[dattr] = {};
      document.querySelectorAll('[' + dattr + ']').forEach(function (el) {
        var key = el.getAttribute(dattr);
        var store = originals[dattr];
        /* innerHTML, NON textContent: gli elementi tradotti contengono
           quasi sempre markup (<strong>, <br>) e con textContent il primo
           passaggio a EN lo appiattisce — tornando in italiano il grassetto
           non torna più. I valori del dizionario sono statici e scritti da
           noi. (20/7/2026: la flotta era già così, il boilerplate no.) */
        if (!(key in store)) store[key] = target ? el.getAttribute(target) : el.innerHTML;
        var val = dict && dict[key] !== undefined ? dict[key] : store[key];
        if (target) el.setAttribute(target, val); else el.innerHTML = val;
      });
    });
    renderHours();
    /* stato visivo della coppia di bottoni lingua, se il sito la usa */
    document.querySelectorAll('[data-lang]').forEach(function (b) {
      var on = b.getAttribute('data-lang') === root.lang;
      b.classList.toggle('is-on', on);
      if (b.tagName === 'BUTTON') b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    try { localStorage.setItem(SITE.slug + '-lang', lang); } catch (e) {}
  }
  /* 26/7/2026 (Il Papiro #168) — SI CABLANO ENTRAMBE LE FORME DI SELETTORE.
     Il canone conosceva solo il toggle singolo `#langToggle`, ma nella
     flotta esiste da tempo anche la COPPIA di bottoni `[data-lang]`
     (Warsa, Mido…): `i18n-roundtrip` era già stato insegnato a riconoscerle
     il 20/7, il plumbing no. Chi copiava il boilerplate e usava la coppia
     si ritrovava il cambio lingua MORTO, e nessun lint statico se ne
     accorgeva (lo becca solo qa-motion, a runtime). */
  var langToggle = document.getElementById('langToggle');
  if (langToggle) {
    /* V4: il toggle singolo CICLA sull'anello ['it', ...LANG_CODES].
       Con due lingue il comportamento è identico a prima (it <-> en). */
    var RING = ['it'].concat(LANG_CODES);
    langToggle.addEventListener('click', function () {
      var i = RING.indexOf(root.lang);
      setLang(RING[(i + 1) % RING.length]);
    });
  }
  document.querySelectorAll('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
  });
  try {
    var saved = localStorage.getItem(SITE.slug + '-lang');
    if (saved && saved !== 'it' && LANG_CODES.indexOf(saved) !== -1) setLang(saved);
  } catch (e) {}

  /* ---------- action-bar mobile (opzionale: #actionBar) ---------- */
  var actionBar = document.getElementById('actionBar');
  if (actionBar) {
    var onScroll = function () {
      actionBar.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ══════════ FINE PLUMBING — da qui in giù SOLO il codice-firma
     del sito (animazioni e interazioni uniche del cliente), che si
     registra comunque SUBITO, mai dentro setTimeout/intro. ══════════ */
  /* ═══ FIRMA · La Bottega della Cornice — «L'angolo giusto.» ═══
     La cornice che si monta: le quattro aste (.asta) entrano dai quattro bordi e si fermano sugli angoli,
     dove i tagli a 45° sono già disegnati dal clip-path. L'hero si monta all'entrata, le altre cornici
     [data-monta] quando entrano in vista (once). I campioni d'angolo oscillano piano. Regole: nessuna
     asta è nascosta dal CSS; senza GSAP o con motion ridotto le cornici sono già montate. */

  var cornici = Array.prototype.slice.call(document.querySelectorAll('.cornice[data-monta]'));
  var montaVivo = hasGsap && hasST && !reducedMotion;
  var FUORI = { top: { y: '-130%' }, bottom: { y: '130%' }, left: { x: '-130%' }, right: { x: '130%' } };
  function aste(c) {
    return { top: c.querySelector('.asta--top'), right: c.querySelector('.asta--right'), bottom: c.querySelector('.asta--bottom'), left: c.querySelector('.asta--left') };
  }
  cornici.forEach(function (c) { c.setAttribute('data-stato', montaVivo ? 'smontata' : 'montata'); });
  var montaHero = null;
  if (montaVivo) {
    cornici.forEach(function (c) {
      var a = aste(c);
      Object.keys(a).forEach(function (k) { if (a[k]) gsap.set(a[k], FUORI[k]); });
      var monta = function () {
        if (c.getAttribute('data-stato') !== 'smontata') return;
        c.setAttribute('data-stato', 'in-montaggio');
        var tl = gsap.timeline({ defaults: { duration: .8, ease: 'power3.out' }, onComplete: function () { c.setAttribute('data-stato', 'montata'); } });
        tl.to(a.top, { y: '0%' }, 0).to(a.bottom, { y: '0%' }, .08).to(a.left, { x: '0%' }, .16).to(a.right, { x: '0%' }, .24);
      };
      if (c.id === 'corniceHero') { montaHero = monta; }
      else ScrollTrigger.create({ trigger: c, start: 'top 88%', once: true, onEnter: monta });
    });
    /* rete di sicurezza: la cornice dell'hero è comunque montata entro 6 s */
    setTimeout(function () { if (montaHero) montaHero(); }, 6000);
    /* i campioni d'angolo pendono dal chiodo e oscillano appena */
    gsap.utils.toArray('.campione').forEach(function (el, i) {
      gsap.fromTo(el, { rotation: -2 + (i % 2) * 4 }, { rotation: 2 - (i % 2) * 4, duration: 2.6 + i * .35, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    });
  }

  /* entrata: chiamata dal plumbing a fine intro. La cornice grande si monta attorno alle parole. */
  window.bespokeHeroEntrance = function () {
    if (!hasGsap || reducedMotion) return;
    if (montaHero) montaHero();
    gsap.from('.apertura__dentro > *', { y: 16, opacity: 0, duration: .6, stagger: .08, ease: 'power3.out', delay: .35 });
    gsap.from('.campione', { y: -18, opacity: 0, duration: .5, stagger: .07, ease: 'back.out(1.6)', delay: .9 });
  };
})();
