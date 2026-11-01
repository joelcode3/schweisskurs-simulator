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

export function baueTestMenue({ spiel, welt, kamera, fahrten, fz }) {
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
  // jede Zeile hat eine FESTE Nummer (T01 …); Nummern verschieben sich nie, neue Einträge bekommen die nächste freie Nummer
  const knopf = (nr, text, tun) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.innerHTML = `<span class="tm-nr">${nr}</span> ${text}`;
    b.addEventListener('click', (e) => { e.stopPropagation(); try { tun(); } catch (err) { console.error('[testmenue]', text, err); } b.blur(); });
    gruppe.appendChild(b);
  };
  const frei = () => { z.beschaeftigt = false; };
  const mini = (f) => () => { frei(); f(); };

  ueberschrift('Minispiele (direkt)');
  knopf('T01', 'Anzeichnen', mini(() => M.anzeichnenSpiel()));
  knopf('T02', 'Schneiden (Flex)', mini(() => M.pfadSpiel({ art: 'schneiden', form: 'rechteck', titel: 'Tür ausschneiden', text: 'Testlauf.' })));
  knopf('T03', 'Schweißen', mini(() => M.pfadSpiel({ art: 'schweissen', form: 'linie', titel: 'Naht schweißen', text: 'Testlauf.', strom: 80, helm: true })));
  knopf('T04', 'Schlacke klopfen', mini(() => M.schlackeSpiel()));
  knopf('T05', 'Lackieren', mini(() => M.lackierSpiel()));
  knopf('T06', 'Restgas ablassen (Ventil)', mini(() => M.ventilSpiel()));
  knopf('T07', 'Flasche spülen', mini(() => M.spuelSpiel()));
  knopf('T08', 'Bitsatz sortieren', mini(() => M.bitsatzSpiel()));
  knopf('T09', 'Akkuschrauber reparieren', mini(() => M.akkuschrauberSpiel()));
  knopf('T10', 'Flusensieb ausblasen', mini(() => M.siebSpiel()));
  knopf('T11', 'Kaffee kochen', mini(() => M.kaffeeSpiel()));
  knopf('T12', 'Rohrbruch reparieren', mini(() => M.rohrSpiel()));
  knopf('T13', 'Räuberleiter (Jonnys Leiter)', mini(() => M.leiterSpiel()));
  knopf('T14', 'Hula-Hoop', mini(() => M.hulaSpiel()));
  knopf('T15', 'Kackepumpe putzen', mini(() => M.pumpeSpiel()));
  knopf('T16', 'Spanngurte entknoten', mini(() => M.spanngurtSpiel({ verknotet: true })));
  if (M.poempelSpiel) knopf('T17', 'Klo pömpeln', mini(() => M.poempelSpiel()));
  knopf('T18', 'Finger verarzten (Torben)', mini(() => M.fingerSpiel()));

  ueberschrift('Ofen-Bau: Stand springen');
  // springt auf den Stand VOR dem Schritt (alles davor erledigt, Flasche am richtigen Platz); den Schritt dann normal im Spiel machen
  t.OFEN_SCHRITTE.forEach((name, i) => knopf(`T${62 + i}`, `Schritt ${i + 1}: ${name}`, () => { frei(); t.ofenStand(i + 1); }));
  knopf('T77', 'Schutzausrüstung anziehen (alles)', () => t.schutzAn());

  ueberschrift('Nebenaufgaben');
  knopf('T19', 'Klo verstopft', () => { frei(); z.verstopft = null; t.kloVerstopft(); });
  knopf('T20', 'Feuer', () => { frei(); t.feuerStart(); });
  knopf('T21', 'Wasserrohrbruch', () => { frei(); t.leckStart(); });
  knopf('T22', 'Wäsche übernehmen', () => { frei(); z.waesche = 'nie'; t.waescheUebernehmen(); });
  knopf('T23', 'Akkuschrauber (Waldo bringt ihn)', () => { frei(); t.wz.beschaeftigt = false; t.waldoAkkuschrauber(); });
  knopf('T24', 'Bitsatz sortieren', () => { frei(); z.bitsatz = null; t.bitsatzSortieren(); });
  knopf('T25', 'Tassen verteilen', () => { welt.tassenVerteilen(6); });
  knopf('T26', 'Spüldienst (Kumpel-Besuch)', () => { frei(); t.kumpelBesuch(); });
  knopf('T27', 'Kackepumpe (Waldo sucht sie)', () => { frei(); t.wz.beschaeftigt = false; t.kackePumpe(); });
  knopf('T28', 'Kackepumpe dreckig zurück', () => { frei(); t.wz.beschaeftigt = false; t.waldoPumpeZurueck(); });
  knopf('T29', 'Mülltonnen umfahren', () => { ft.tonnenUm?.(); });
  knopf('T30', 'Grill umfahren', () => { ft.grillUm?.(); });
  knopf('T31', 'Jonnys Leiter', () => { frei(); t.jz.beschaeftigt = false; t.jonnyLeiterHolen(); });
  knopf('T32', 'Spanngurte hinwerfen', () => {
    frei();
    z.gurte = null;
    if (!t.spanngurtEreignis()) { z.gurte = 'kommt'; t.gurteHinwerfen(t.jz.da ? 'jonny' : 'waldo'); }
  });
  knopf('T33', 'Spanngurte aufrollen (im Spiel)', () => { frei(); welt.objekte.gurteBoden.visible = true; z.gurte = 'boden'; z.gurteSeit = 1e9; t.gurteAufrollen(); });
  knopf('T34', 'Jonnys Bier (leere Flasche)', () => { frei(); t.jz.beschaeftigt = false; t.jonnyBier(true); });
  knopf('T35', 'Leere Flaschen hinlegen (3)', () => {
    const p = kamera.position;
    for (let i = 0; i < 3; i++) welt.leereFlasche(p.x + Math.sin(i * 2.1) * 0.9, p.z + Math.cos(i * 2.1) * 0.9);
  });
  knopf('T36', 'Ladung fällt vom Jeep', () => { if (fz) ft.ladungFaellt?.(fz.jeep, 'test'); });
  knopf('T37', 'Hofladen: Eier nehmen', () => { frei(); t.einkaufen('eier'); });
  knopf('T38', 'Hofladen: Mettenden nehmen', () => { frei(); t.einkaufen('mettenden'); });
  knopf('T39', 'Torben-Unfall (Träger, Finger)', () => {
    frei();
    if (t.TU.zustand && t.TU.zustand !== 'fertig') return;
    t.TU.zustand = null;
    if (fahrten?.zustand?.torben) fahrten.zustand.torben.unterwegs = false;
    t.torbenUnfall();
  });

  ueberschrift('Ereignisse');
  knopf('T40', 'Dennis telefoniert', () => { frei(); t.dennisTelefoniert(); });
  knopf('T41', 'Dennis Klo-Pause', () => { frei(); t.kloPause(); });
  knopf('T42', 'Mittagspause', () => { frei(); z.mittag = 'nie'; t.mittagspause(); });
  knopf('T43', 'Hüfte (Dennis liegt)', () => { frei(); z.huefte = 'nie'; t.hueftePlatt(); });
  knopf('T44', 'Kaffee kochen (im Spiel)', () => { frei(); t.kaffeeKochen(); });
  knopf('T45', 'Dennis Hula-Hoop', () => { frei(); z.hula = false; t.hulaHoop(true); });
  knopf('T46', 'Torben kommt', () => { ft.torbenKommt?.(); });
  knopf('T47', 'Kumpel-Besuch', () => { frei(); t.kumpelBesuch(); });
  knopf('T48', 'Waldo-Besuch', () => { frei(); t.wz.beschaeftigt = false; t.waldoBesuch(); });
  knopf('T49', 'Sofa-Streit (Waldo)', () => { frei(); t.sofaStreit(); });
  knopf('T50', 'Jonny kommt rein', () => { frei(); t.jz.beschaeftigt = false; t.jonnyRein(); });
  knopf('T51', 'Jonny geht raus', () => { frei(); t.jz.beschaeftigt = false; t.jonnyRaus(); });
  knopf('T52', 'Jonny kitzelt Dennis', () => { frei(); t.jz.beschaeftigt = false; t.jonnyKitzelt(); });
  knopf('T53', 'Jonny stört', () => { frei(); t.jz.beschaeftigt = false; t.jonnyStoert(); });
  knopf('T54', 'Jonny Sodbrennen', () => { frei(); t.jz.beschaeftigt = false; t.jonnySodbrennen(); });
  knopf('T55', 'Kiwi essen', () => { frei(); t.kiwiEssen(); });

  ueberschrift('Fahrzeuge');
  knopf('T78', 'Jeep entdrosseln (Torben)', () => {
    if (!fz) return;
    if (fz.jeep.gedrosselt) { fz.entdrosseln(); ui.torbenSagt(sag(TORBEN.entdrosseln), 6000); }
    else ui.torbenSagt(sag(TORBEN.schonEntdrosselt));
  });
  knopf('T79', 'Jeep wieder drosseln', () => { if (fz) fz.jeep.gedrosselt = true; });

  ueberschrift('Wut und Zeit');
  knopf('T56', 'Wut auf 0', () => t.setzeWut(0));
  knopf('T57', 'Wut auf 30', () => t.setzeWut(30));
  knopf('T58', 'Wut auf 60', () => t.setzeWut(60));
  knopf('T59', 'Wut auf 90', () => t.setzeWut(90));
  knopf('T60', 'Zeit + 5 Minuten', () => t.zeitVor(300));
  knopf('T61', 'Zeit + 15 Minuten', () => t.zeitVor(900));

  el.querySelector('[data-k="zu"]').addEventListener('click', (e) => {
    e.stopPropagation();
    const zu = inhalt.classList.toggle('versteckt');
    e.target.textContent = zu ? 'aufklappen' : 'einklappen';
  });
}
