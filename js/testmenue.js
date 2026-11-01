// Test-Zugang für den Betreiber: Adresse mit "?test" (z. B. https://joelcode3.github.io/schweisskurs-simulator/?test) zeigt rechts
// ein kleines Menü, mit dem man Minispiele, Nebenaufgaben und Ereignisse sofort auslösen kann, ohne zu warten.
// Für normale Spieler unsichtbar. Neue Minispiele und Ereignisse bekommen hier IMMER einen eigenen Knopf.
import * as M from './minispiele.js';

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
  const knopf = (text, tun) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = text;
    b.addEventListener('click', (e) => { e.stopPropagation(); try { tun(); } catch (err) { console.error('[testmenue]', text, err); } b.blur(); });
    gruppe.appendChild(b);
  };
  const frei = () => { z.beschaeftigt = false; };
  const mini = (f) => () => { frei(); f(); };

  ueberschrift('Minispiele (direkt)');
  knopf('Anzeichnen', mini(() => M.anzeichnenSpiel()));
  knopf('Schneiden (Flex)', mini(() => M.pfadSpiel({ art: 'schneiden', form: 'rechteck', titel: 'Tür ausschneiden', text: 'Testlauf.' })));
  knopf('Schweißen', mini(() => M.pfadSpiel({ art: 'schweissen', form: 'linie', titel: 'Naht schweißen', text: 'Testlauf.', strom: 80, helm: true })));
  knopf('Schlacke klopfen', mini(() => M.schlackeSpiel()));
  knopf('Lackieren', mini(() => M.lackierSpiel()));
  knopf('Restgas ablassen (Ventil)', mini(() => M.ventilSpiel()));
  knopf('Flasche spülen', mini(() => M.spuelSpiel()));
  knopf('Bitsatz sortieren', mini(() => M.bitsatzSpiel()));
  knopf('Akkuschrauber reparieren', mini(() => M.akkuschrauberSpiel()));
  knopf('Flusensieb ausblasen', mini(() => M.siebSpiel()));
  knopf('Kaffee kochen', mini(() => M.kaffeeSpiel()));
  knopf('Rohrbruch reparieren', mini(() => M.rohrSpiel()));
  knopf('Räuberleiter (Jonnys Leiter)', mini(() => M.leiterSpiel()));
  knopf('Hula-Hoop', mini(() => M.hulaSpiel()));
  knopf('Kackepumpe putzen', mini(() => M.pumpeSpiel()));
  knopf('Spanngurte entknoten', mini(() => M.spanngurtSpiel({ verknotet: true })));
  if (M.poempelSpiel) knopf('Klo pömpeln', mini(() => M.poempelSpiel()));
  knopf('Finger verarzten (Torben)', mini(() => M.fingerSpiel()));

  ueberschrift('Nebenaufgaben');
  knopf('Klo verstopft', () => { frei(); z.verstopft = null; t.kloVerstopft(); });
  knopf('Feuer', () => { frei(); t.feuerStart(); });
  knopf('Wasserrohrbruch', () => { frei(); t.leckStart(); });
  knopf('Wäsche übernehmen', () => { frei(); z.waesche = 'nie'; t.waescheUebernehmen(); });
  knopf('Akkuschrauber (Waldo bringt ihn)', () => { frei(); t.wz.beschaeftigt = false; t.waldoAkkuschrauber(); });
  knopf('Bitsatz sortieren', () => { frei(); z.bitsatz = null; t.bitsatzSortieren(); });
  knopf('Tassen verteilen', () => { welt.tassenVerteilen(6); });
  knopf('Spüldienst (Kumpel-Besuch)', () => { frei(); t.kumpelBesuch(); });
  knopf('Kackepumpe (Waldo sucht sie)', () => { frei(); t.wz.beschaeftigt = false; t.kackePumpe(); });
  knopf('Kackepumpe dreckig zurück', () => { frei(); t.wz.beschaeftigt = false; t.waldoPumpeZurueck(); });
  knopf('Mülltonnen umfahren', () => { ft.tonnenUm?.(); });
  knopf('Grill umfahren', () => { ft.grillUm?.(); });
  knopf('Jonnys Leiter', () => { frei(); t.jz.beschaeftigt = false; t.jonnyLeiterHolen(); });
  knopf('Spanngurte hinwerfen', () => {
    frei();
    z.gurte = null;
    if (!t.spanngurtEreignis()) { z.gurte = 'kommt'; t.gurteHinwerfen(t.jz.da ? 'jonny' : 'waldo'); }
  });
  knopf('Spanngurte aufrollen (im Spiel)', () => { frei(); welt.objekte.gurteBoden.visible = true; z.gurte = 'boden'; z.gurteSeit = 1e9; t.gurteAufrollen(); });
  knopf('Jonnys Bier (leere Flasche)', () => { frei(); t.jz.beschaeftigt = false; t.jonnyBier(true); });
  knopf('Leere Flaschen hinlegen (3)', () => {
    const p = kamera.position;
    for (let i = 0; i < 3; i++) welt.leereFlasche(p.x + Math.sin(i * 2.1) * 0.9, p.z + Math.cos(i * 2.1) * 0.9);
  });
  knopf('Ladung fällt vom Jeep', () => { if (fz) ft.ladungFaellt?.(fz.jeep, 'test'); });
  knopf('Hofladen: Eier nehmen', () => { frei(); t.einkaufen('eier'); });
  knopf('Hofladen: Mettenden nehmen', () => { frei(); t.einkaufen('mettenden'); });
  knopf('Torben-Unfall (Träger, Finger)', () => {
    frei();
    if (t.TU.zustand && t.TU.zustand !== 'fertig') return;
    t.TU.zustand = null;
    if (fahrten?.zustand?.torben) fahrten.zustand.torben.unterwegs = false;
    t.torbenUnfall();
  });

  ueberschrift('Ereignisse');
  knopf('Dennis telefoniert', () => { frei(); t.dennisTelefoniert(); });
  knopf('Dennis Klo-Pause', () => { frei(); t.kloPause(); });
  knopf('Mittagspause', () => { frei(); z.mittag = 'nie'; t.mittagspause(); });
  knopf('Hüfte (Dennis liegt)', () => { frei(); z.huefte = 'nie'; t.hueftePlatt(); });
  knopf('Kaffee kochen (im Spiel)', () => { frei(); t.kaffeeKochen(); });
  knopf('Dennis Hula-Hoop', () => { frei(); z.hula = false; t.hulaHoop(true); });
  knopf('Torben kommt', () => { ft.torbenKommt?.(); });
  knopf('Kumpel-Besuch', () => { frei(); t.kumpelBesuch(); });
  knopf('Waldo-Besuch', () => { frei(); t.wz.beschaeftigt = false; t.waldoBesuch(); });
  knopf('Sofa-Streit (Waldo)', () => { frei(); t.sofaStreit(); });
  knopf('Jonny kommt rein', () => { frei(); t.jz.beschaeftigt = false; t.jonnyRein(); });
  knopf('Jonny geht raus', () => { frei(); t.jz.beschaeftigt = false; t.jonnyRaus(); });
  knopf('Jonny kitzelt Dennis', () => { frei(); t.jz.beschaeftigt = false; t.jonnyKitzelt(); });
  knopf('Jonny stört', () => { frei(); t.jz.beschaeftigt = false; t.jonnyStoert(); });
  knopf('Jonny Sodbrennen', () => { frei(); t.jz.beschaeftigt = false; t.jonnySodbrennen(); });
  knopf('Kiwi essen', () => { frei(); t.kiwiEssen(); });

  ueberschrift('Wut und Zeit');
  for (const w of [0, 30, 60, 90]) knopf(`Wut auf ${w}`, () => t.setzeWut(w));
  knopf('Zeit + 5 Minuten', () => t.zeitVor(300));
  knopf('Zeit + 15 Minuten', () => t.zeitVor(900));

  el.querySelector('[data-k="zu"]').addEventListener('click', (e) => {
    e.stopPropagation();
    const zu = inhalt.classList.toggle('versteckt');
    e.target.textContent = zu ? 'aufklappen' : 'einklappen';
  });
}
