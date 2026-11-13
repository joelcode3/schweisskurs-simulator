// Test-Zugang für den Betreiber: Adresse mit "?test" (z. B. https://joelcode3.github.io/schweisskurs-simulator/?test) zeigt rechts
// ein kleines Menü, mit dem man Minispiele, Nebenaufgaben und Ereignisse sofort auslösen kann, ohne zu warten.
// Für normale Spieler unsichtbar. Neue Minispiele und Ereignisse bekommen hier IMMER einen eigenen Knopf.
import * as M from './minispiele.js';
import * as ui from './ui.js';
import { TORBEN } from './texte.js';
const sag = (liste) => (Array.isArray(liste) ? liste[Math.floor(Math.random() * liste.length)] : liste);

export function testMenueAktiv() {
  return new URLSearchParams(location.search).has('test');
}

export function baueTestMenue({ spiel, welt, kamera, steuerung, fahrten, fz }) {
  if (!testMenueAktiv() || document.getElementById('testmenue')) return;
  const t = spiel.test;
  const z = t.z;
  const ft = fahrten?.test || {};
  const el = document.createElement('div');
  el.id = 'testmenue';
  el.innerHTML = '<div class="tm-kopf"><b>Testmenü</b><button type="button" data-k="zu">einklappen</button></div><div class="tm-inhalt"></div>';
  document.body.appendChild(el);
  const inhalt = el.querySelector('.tm-inhalt');
  let gruppe = null;
  const ueberschrift = (text) => {
    const d = document.createElement('details');
    d.innerHTML = `<summary>${text}</summary><div class="tm-knoepfe"></div>`;
    inhalt.appendChild(d);
    gruppe = d.querySelector('.tm-knoepfe');
  };
  // jede Zeile hat eine FESTE Nummer (T01 …); Nummern verschieben sich nie, neue Einträge bekommen die nächste freie Nummer.
  // opt.laeuft(): läuft gerade (grün). opt.sperre(): Text, warum es gerade nicht geht (grau, Knopf aus).
  // opt.reset(): einmaliges Ereignis wieder freigeben (Knopf „zurücksetzen“ erscheint, solange gesperrt).
  // opt.resetNoetig(): nur dann „zurücksetzen“ zeigen (wenn die Sperre auch andere Gründe haben kann).
  // Zusätzlich gilt alles als laufend, solange das vom Knopf gestartete Ereignis (Promise) noch nicht fertig ist.
  const zeilen = [];
  const knopf = (nr, text, tun, opt = {}) => {
    const zeile = document.createElement('div');
    zeile.className = 'tm-zeile';
    const b = document.createElement('button');
    b.type = 'button';
    b.innerHTML = `<span class="tm-nr">${nr}</span> ${text}`;
    const grund = document.createElement('div');
    grund.className = 'tm-grund';
    const eintrag = { b, grund, opt, offen: 0, zeile, reset: null };
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      if (b.disabled) return;
      try {
        const r = tun();
        if (r && typeof r.then === 'function') { eintrag.offen++; r.finally(() => { eintrag.offen--; }); }
      } catch (err) { console.error('[testmenue]', text, err); }
      b.blur();
      setTimeout(status, 50);
    });
    zeile.append(b, grund);
    if (opt.reset) {
      const r = document.createElement('button');
      r.type = 'button';
      r.className = 'tm-reset';
      r.textContent = 'zurücksetzen';
      r.addEventListener('click', (e) => { e.stopPropagation(); try { opt.reset(); } catch (err) { console.error('[testmenue] reset', text, err); } r.blur(); setTimeout(status, 50); });
      zeile.appendChild(r);
      eintrag.reset = r;
    }
    gruppe.appendChild(zeile);
    zeilen.push(eintrag);
  };
  // Minispiel läuft, wenn das Minispiel-Fenster offen ist und der Titel passt
  const miniTitel = () => {
    const el = document.getElementById('minispiel');
    if (!el || el.classList.contains('versteckt')) return '';
    return el.querySelector('#minispiel-oben h3')?.textContent || '';
  };
  const titelEnthaelt = (...teile) => () => { const tt = miniTitel(); return !!tt && teile.some((x) => tt.includes(x)); };
  function status() {
    for (const e of zeilen) {
      let sperre = null, laeuft = false;
      try { laeuft = e.offen > 0 || !!e.opt.laeuft?.(); } catch { /* egal */ }
      try { sperre = laeuft ? null : e.opt.sperre?.() || null; } catch { /* egal */ }
      e.zeile.classList.toggle('tm-laeuft', laeuft);
      e.zeile.classList.toggle('tm-gesperrt', !!sperre);
      e.b.disabled = !!sperre;
      const hinweis = laeuft ? 'läuft gerade' : sperre || '';
      e.b.title = hinweis;
      e.grund.textContent = hinweis;
      if (e.reset) e.reset.hidden = !sperre || (e.opt.resetNoetig ? !e.opt.resetNoetig() : false);
    }
  }
  const frei = () => { z.beschaeftigt = false; };
  const mini = (f) => () => { frei(); f(); };

  ueberschrift('Minispiele (direkt)');
  knopf('T01', 'Anzeichnen', mini(() => M.anzeichnenSpiel()), { laeuft: titelEnthaelt('Ofentür anzeichnen') });
  knopf('T02', 'Schneiden (Flex)', mini(() => M.pfadSpiel({ art: 'schneiden', form: 'rechteck', titel: 'Tür ausschneiden', text: 'Testlauf.' })), { laeuft: titelEnthaelt('ausschneiden') });
  knopf('T03', 'Schweißen', mini(() => M.pfadSpiel({ art: 'schweissen', form: 'linie', titel: 'Naht schweißen', text: 'Testlauf.', strom: 80, helm: true })), { laeuft: titelEnthaelt('anschweißen', 'Naht schweißen') });
  knopf('T04', 'Schlacke klopfen', mini(() => M.schlackeSpiel()), { laeuft: titelEnthaelt('Schlacke') });
  knopf('T05', 'Lackieren', mini(() => M.lackierSpiel()), { laeuft: titelEnthaelt('lackieren') });
  knopf('T06', 'Restgas ablassen (Ventil)', mini(() => M.ventilSpiel()), { laeuft: titelEnthaelt('Restgas') });
  knopf('T07', 'Flasche spülen', mini(() => M.spuelSpiel()), { laeuft: titelEnthaelt('Flasche spülen') });
  knopf('T08', 'Bitsatz sortieren', mini(() => M.bitsatzSpiel()), { laeuft: titelEnthaelt('Bitsatz') });
  knopf('T09', 'Akkuschrauber reparieren', mini(() => M.akkuschrauberSpiel()), { laeuft: titelEnthaelt('Akkuschrauber') });
  knopf('T10', 'Flusensieb ausblasen', mini(() => M.siebSpiel()), { laeuft: titelEnthaelt('Flusensieb') });
  knopf('T11', 'Kaffee kochen', mini(() => M.kaffeeSpiel()), { laeuft: titelEnthaelt('Kaffee kochen') });
  knopf('T12', 'Rohrbruch reparieren', mini(() => M.rohrSpiel()), { laeuft: titelEnthaelt('Rohr abdichten') });
  knopf('T13', 'Räuberleiter (Jonnys Leiter)', mini(() => M.leiterSpiel()), { laeuft: titelEnthaelt('Räuberleiter') });
  knopf('T14', 'Hula-Hoop', mini(() => M.hulaSpiel()), { laeuft: titelEnthaelt('Hula-Hoop') });
  knopf('T15', 'Kackepumpe putzen', mini(() => M.pumpeSpiel()), { laeuft: titelEnthaelt('Kackepumpe') });
  knopf('T16', 'Spanngurte entknoten', mini(() => M.spanngurtSpiel({ verknotet: true })), { laeuft: titelEnthaelt('Spanngurte') });
  if (M.poempelSpiel) knopf('T17', 'Klo pömpeln', mini(() => M.poempelSpiel()), { laeuft: titelEnthaelt('Klo pömpeln') });
  knopf('T18', 'Finger verarzten (Torben)', mini(() => M.fingerSpiel()), { laeuft: titelEnthaelt('Finger verarzten') });

  ueberschrift('Ofen-Bau: Stand springen');
  // springt auf den Stand VOR dem Schritt (alles davor erledigt, Flasche am richtigen Platz); den Schritt dann normal im Spiel machen
  t.OFEN_SCHRITTE.forEach((name, i) => knopf(`T${62 + i}`, `Schritt ${i + 1}: ${name}`, () => { frei(); t.ofenStand(i + 1); }));
  knopf('T77', 'Schutzausrüstung anziehen (alles)', () => t.schutzAn());

  ueberschrift('Nebenaufgaben');
  knopf('T19', 'Klo verstopft', () => { frei(); z.verstopft = null; t.kloVerstopft(); }, { laeuft: () => z.verstopft === 'ja' || z.verstopft === 'dennis' });
  knopf('T20', 'Feuer', () => { frei(); t.feuerStart(); }, { laeuft: () => z.feuer === 'brennt' });
  knopf('T21', 'Wasserrohrbruch', () => { frei(); t.leckStart(); }, { laeuft: () => z.leck === 'spritzt' });
  knopf('T22', 'Wäsche übernehmen', () => { frei(); return t.waescheUebernehmen(); }, {
    laeuft: () => z.waesche !== 'nie' && z.waesche !== 'erledigt',
    sperre: () => (z.waesche === 'erledigt' ? 'Wäsche ist schon erledigt' : null),
    reset: () => { z.waesche = 'nie'; },
  });
  knopf('T23', 'Akkuschrauber (Waldo bringt ihn)', () => { frei(); t.wz.beschaeftigt = false; return t.waldoAkkuschrauber(); });
  knopf('T24', 'Bitsatz sortieren', () => { frei(); return t.bitsatzSortieren(); }, {
    sperre: () => (z.bitsatz === 'sortiert' ? 'Bitsatz ist schon sortiert' : null),
    reset: () => { z.bitsatz = null; },
  });
  knopf('T25', 'Tassen verteilen', () => { welt.tassenVerteilen(6); });
  knopf('T26', 'Spüldienst (Kumpel-Besuch)', () => { frei(); return t.kumpelBesuch(); }, {
    laeuft: () => t.sd.kumpelDa, sperre: () => (t.sd.kumpelDa ? 'Kumpel ist schon da' : null),
  });
  knopf('T27', 'Kackepumpe (Waldo sucht sie)', () => { frei(); t.wz.beschaeftigt = false; return t.kackePumpe(); }, { laeuft: () => t.wz.pumpe === 'weg' || t.wz.pumpe === 'imWeg' || t.wz.pumpe === 'sauber' });
  knopf('T28', 'Kackepumpe dreckig zurück', () => { frei(); t.wz.beschaeftigt = false; return t.waldoPumpeZurueck(); });
  knopf('T29', 'Mülltonnen umfahren', () => { ft.tonnenUm?.(); });
  knopf('T30', 'Grill umfahren', () => { ft.grillUm?.(); });
  knopf('T31', 'Jonnys Leiter', () => { frei(); t.jz.beschaeftigt = false; return t.jonnyLeiterHolen(); }, {
    laeuft: () => t.jz.leiter === 'wartet',
    sperre: () => (!t.jz.da ? 'Jonny ist nicht da (erst T50)' : t.jz.leiter !== 'nie' ? 'War schon (einmal pro Spiel)' : null),
    reset: () => { t.jz.leiter = 'nie'; },
    resetNoetig: () => t.jz.leiter !== 'nie',
  });
  knopf('T32', 'Spanngurte hinwerfen', () => {
    frei();
    z.gurte = null;
    if (!t.spanngurtEreignis()) { z.gurte = 'kommt'; t.gurteHinwerfen(t.jz.da ? 'jonny' : 'waldo'); }
  });
  knopf('T33', 'Spanngurte aufrollen (im Spiel)', () => { frei(); welt.objekte.gurteBoden.visible = true; z.gurte = 'boden'; z.gurteSeit = 1e9; t.gurteAufrollen(); }, { laeuft: () => z.gurte === 'boden' });
  knopf('T34', 'Jonnys Bier (leere Flasche)', () => { frei(); t.jz.beschaeftigt = false; return t.jonnyBier(true); }, {
    sperre: () => (!t.jz.da ? 'Jonny ist nicht da (erst T50)' : t.jz.ersterBesuch ? 'Beim ersten Besuch trinkt Jonny noch nichts' : null),
  });
  knopf('T35', 'Leere Flaschen hinlegen (3)', () => {
    const p = kamera.position;
    for (let i = 0; i < 3; i++) welt.leereFlasche(p.x + Math.sin(i * 2.1) * 0.9, p.z + Math.cos(i * 2.1) * 0.9);
  });
  knopf('T36', 'Ladung fällt vom Jeep', () => { if (fz) ft.ladungFaellt?.(fz.jeep, 'test'); });
  knopf('T37', 'Hofladen: Eier nehmen', () => { frei(); t.einkaufen('eier'); });
  knopf('T38', 'Hofladen: Mettenden nehmen', () => { frei(); t.einkaufen('mettenden'); });
  knopf('T39', 'Torben-Unfall (Träger, Finger)', () => {
    frei();
    if (fahrten?.zustand?.torben) fahrten.zustand.torben.unterwegs = false;
    return t.torbenUnfall();
  }, {
    laeuft: () => !!t.TU.zustand && t.TU.zustand !== 'fertig',
    sperre: () => (t.TU.zustand === 'fertig' ? 'Schon passiert, Torben hat seinen Verband' : null),
    reset: () => { t.TU.zustand = null; },
  });

  ueberschrift('Ereignisse');
  knopf('T40', 'Dennis telefoniert', () => { frei(); return t.dennisTelefoniert(); }, { laeuft: () => !!z.telefon });
  knopf('T41', 'Dennis Klo-Pause', () => { frei(); return t.kloPause(); }, { laeuft: () => !!z.aufKlo });
  knopf('T42', 'Mittagspause', () => { frei(); return t.mittagspause(); }, {
    laeuft: () => z.mittag === 'gerade',
    sperre: () => (z.mittag === 'erledigt' ? 'Mittagspause war schon' : null),
    reset: () => { z.mittag = 'nie'; },
  });
  knopf('T43', 'Hüfte (Dennis liegt)', () => { frei(); return t.hueftePlatt(); }, {
    laeuft: () => z.huefte === 'geht' || z.huefte === 'liegt',
    sperre: () => (z.huefte === 'erledigt' ? 'Hüfte war schon' : null),
    reset: () => { z.huefte = 'nie'; },
  });
  knopf('T44', 'Kaffee kochen (im Spiel)', () => { frei(); return t.kaffeeKochen(); });
  knopf('T45', 'Dennis Hula-Hoop', () => { frei(); return t.hulaHoop(true); }, { laeuft: () => !!z.hula });
  knopf('T46', 'Torben kommt', () => ft.torbenKommt?.(), {
    laeuft: () => !!fahrten?.zustand?.torben?.unterwegs,
    sperre: () => (fahrten?.zustand?.torben?.da ? 'Torben ist schon da' : null),
  });
  knopf('T47', 'Kumpel-Besuch', () => { frei(); return t.kumpelBesuch(); }, {
    laeuft: () => t.sd.kumpelDa, sperre: () => (t.sd.kumpelDa ? 'Kumpel ist schon da' : null),
  });
  knopf('T48', 'Waldo-Besuch', () => { frei(); t.wz.beschaeftigt = false; return t.waldoBesuch(); });
  knopf('T49', 'Sofa-Streit (Waldo)', () => { frei(); return t.sofaStreit(); }, { laeuft: () => !!t.wz.streit });
  knopf('T50', 'Jonny kommt rein', () => { frei(); t.jz.beschaeftigt = false; return t.jonnyRein(); }, {
    sperre: () => (t.jz.da ? 'Jonny ist schon da' : !t.jz.draussen ? 'Jonny ist gerade nicht in der Nähe' : null),
  });
  knopf('T51', 'Jonny geht raus', () => { frei(); t.jz.beschaeftigt = false; return t.jonnyRaus(); }, { sperre: () => (!t.jz.da ? 'Jonny ist nicht da (erst T50)' : null) });
  knopf('T52', 'Jonny kitzelt Dennis', () => { frei(); t.jz.beschaeftigt = false; return t.jonnyKitzelt(); }, { sperre: () => (!t.jz.da ? 'Jonny ist nicht da (erst T50)' : null) });
  knopf('T53', 'Jonny stört', () => { frei(); t.jz.beschaeftigt = false; return t.jonnyStoert(); }, { sperre: () => (!t.jz.da ? 'Jonny ist nicht da (erst T50)' : null) });
  knopf('T54', 'Jonny Sodbrennen', () => { frei(); t.jz.beschaeftigt = false; return t.jonnySodbrennen(); }, { sperre: () => (!t.jz.da ? 'Jonny ist nicht da (erst T50)' : null) });
  knopf('T55', 'Kiwi essen', () => { frei(); return t.kiwiEssen(); }, {
    sperre: () => (z.kiwisWeg >= 6 ? 'Keine Kiwis mehr da' : null),
    reset: () => { z.kiwisWeg = 0; welt.kiwisZeigen?.(6); },
  });

  // F1: Torben (Choleriker, Spaghetti). Jeder Knopf holt Torben vor den Spieler, falls er nicht da ist.
  const torbenWut = (art) => () => { const w = ft.torbenHerholen?.(); if (!w) return; ft.torbenWuetet?.('test', art); };
  const torbenZeile = (nr, text, art) => knopf(nr, text, torbenWut(art), { laeuft: () => !!ft.torbenIstAm?.('wirft'), sperre: () => (t.TU.zustand && t.TU.zustand !== 'fertig' ? 'Torben ist gerade im Unfall' : null) });
  torbenZeile('T80', 'Torben wütet (wirft zufällig)', null);
  torbenZeile('T81', 'Torben wirft Werkzeug', 'werkzeug');
  torbenZeile('T82', 'Torben wirft Tasse', 'tasse');
  torbenZeile('T83', 'Torben wirft Flasche', 'flasche');
  torbenZeile('T84', 'Torben wirft Spaghetti', 'spaghetti');
  knopf('T85', 'Torben isst Spaghetti', () => { const w = ft.torbenHerholen?.(); if (w) return w.essen(); }, { laeuft: () => !!ft.torbenIstAm?.('isst'), sperre: () => (t.TU.zustand && t.TU.zustand !== 'fertig' ? 'Torben ist gerade im Unfall' : null) });

  // F3: David (Zimmerer) mit Coco. Die Abläufe brauchen David in der Werkstatt: erst T86 oder T87.
  const dvNichtDa = () => (!t.dv.da ? 'David ist nicht da (erst T86 oder T87)' : t.dv.beschaeftigt ? 'David ist gerade beschäftigt' : null);
  knopf('T86', 'David kommt (ohne Coco)', () => { frei(); return t.davidKommt(false); }, { sperre: () => (t.dv.da ? 'David ist schon da' : null) });
  knopf('T87', 'David kommt mit Coco', () => { frei(); return t.davidKommt(true); }, { sperre: () => (t.dv.da ? 'David ist schon da' : null) });
  knopf('T88', 'David nimmt die Rohrzange', () => t.davidRohrzange(), { sperre: dvNichtDa });
  knopf('T89', 'David prüft den Feuerlöscher', () => t.davidLoescher(), { sperre: dvNichtDa });
  knopf('T90', 'David fragt nach Tischgestell', () => t.davidTischgestell(), { sperre: dvNichtDa });
  knopf('T91', 'David raucht mit Jonny', () => t.davidRauchtMitJonny(), { sperre: () => dvNichtDa() || (!t.jz.da ? 'Jonny ist nicht da (erst T50)' : null) });
  knopf('T92', 'David geht mit Coco Gassi', () => t.davidGassi(), { sperre: () => dvNichtDa() || (!t.dv.mitCoco ? 'Coco ist nicht dabei' : null) });
  knopf('T93', 'David geht wieder', () => t.davidGeht(), { sperre: dvNichtDa });

  ueberschrift('Fahrzeuge');
  knopf('T78', 'Jeep entdrosseln (Torben)', () => {
    if (!fz) return;
    fz.entdrosseln();
    ui.torbenSagt(sag(TORBEN.entdrosseln), 6000);
  }, {
    sperre: () => (fz && !fz.jeep.gedrosselt ? 'Jeep ist schon entdrosselt' : null),
    reset: () => { if (fz) fz.jeep.gedrosselt = true; },
  });
  knopf('T79', 'Jeep wieder drosseln', () => { if (fz) fz.jeep.gedrosselt = true; }, {
    sperre: () => (fz && fz.jeep.gedrosselt ? 'Jeep ist schon gedrosselt' : null),
  });

  ueberschrift('E2b Pritsche abschleppen (Joel)');
  const pr = t.pritsche;
  const phase = () => pr?.pz.phase;
  knopf('T95', 'Joel kommt (Pritsche liegt um)', () => pr.joelKommt(), { sperre: () => (phase() !== 'aus' && phase() !== 'fertig' ? 'läuft schon (T100 zurücksetzen)' : null) });
  knopf('T96', 'Im Weidemann an der Pritsche (Joel, Schlupf dabei)', () => pr.test.testAnDiePritsche());
  knopf('T101', 'Joel fällt vom Weidemann (Aufprall)', () => pr.test.joelFaellt());
  knopf('T97', 'Minispiel Pritsche bergen (direkt)', mini(() => M.pritscheSpiel()), { laeuft: titelEnthaelt('Pritsche bergen') });
  knopf('T98', 'Pritsche steht, direkt abschleppen', () => pr.test.testAbschleppen());
  knopf('T99', 'Gespann kurz vor der Bucht PRITSCHE', () => pr.test.testVorDemCarport());
  knopf('T100', 'Pritsche zurücksetzen (liegt wieder um)', () => { if (ft.aussteigen && fahrten?.faehrt) ft.aussteigen(); pr.test.zuruecksetzen(); });

  ueberschrift('E4 Mettenden grillen');
  const gr = t.grillen;
  knopf('T111', '3 Mettenden liegen auf dem Grill (roh)', () => gr.test.testDrauf(3));
  knopf('T112', 'Minispiel Mettenden grillen (direkt)', mini(() => M.grillSpiel({ anzahl: 3 })), { laeuft: titelEnthaelt('Mettenden grillen') });
  knopf('T113', 'Fertig gegrillt: alle kommen und fragen', () => gr.test.testFertig(['gut', 'gut', 'gut', 'verkohlt', 'roh']));
  knopf('T114', 'Grill zurücksetzen (alte Wurst wieder drauf)', () => gr.test.zuruecksetzen());

  ueberschrift('Orte (hinspringen)');
  // Paket E2a: direkt hinter die Werkstatt (vor die Hintertür, Blick auf Schrottplatz und Carport)
  const springen = (pos, blick) => () => { if (steuerung) steuerung.setze([pos[0], kamera.position.y, pos[1]], [blick[0], 1.2, blick[1]]); };
  const nichtBeimFahren = () => (fahrten?.faehrt ? 'Erst aussteigen (E)' : null);
  knopf('T94', 'Platz hinten: vor die Hintertür', springen([-2.9, -5.3], [-3.0, -16.0]), { sperre: nichtBeimFahren });

  ueberschrift('Wut und Zeit');
  knopf('T56', 'Wut auf 0', () => t.setzeWut(0));
  knopf('T57', 'Wut auf 30', () => t.setzeWut(30));
  knopf('T58', 'Wut auf 60', () => t.setzeWut(60));
  knopf('T59', 'Wut auf 90', () => t.setzeWut(90));
  knopf('T60', 'Zeit + 5 Minuten', () => t.zeitVor(300));
  knopf('T61', 'Zeit + 15 Minuten', () => t.zeitVor(900));

  status();
  setInterval(() => { if (!inhalt.classList.contains('versteckt')) status(); }, 500);

  el.querySelector('[data-k="zu"]').addEventListener('click', (e) => {
    e.stopPropagation();
    const zu = inhalt.classList.toggle('versteckt');
    e.target.textContent = zu ? 'aufklappen' : 'einklappen';
  });
}
