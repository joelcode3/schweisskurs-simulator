// Test-Zugang für den Betreiber: Adresse mit "?test" (z. B. .../schweisskurs-simulator/?test) zeigt rechts ein kleines Menü,
// mit dem man Ereignisse und Minispiele sofort auslösen kann, ohne zu warten. Für normale Spieler unsichtbar.
// Neue Ereignisse bekommen hier immer einen eigenen Knopf.
export function testMenueAktiv() {
  return new URLSearchParams(location.search).has('test');
}

export function baueTestMenue({ spiel, welt, kamera, fahrten }) {
  if (!testMenueAktiv() || document.getElementById('testmenue')) return;
  const t = spiel.test;
  const z = t.z;
  const el = document.createElement('div');
  el.id = 'testmenue';
  el.innerHTML = '<div class="tm-kopf">Testmenü <button type="button" data-k="zu">einklappen</button></div><div class="tm-knoepfe"></div>';
  document.body.appendChild(el);
  const box = el.querySelector('.tm-knoepfe');
  const knopf = (text, tun) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = text;
    b.addEventListener('click', (e) => { e.stopPropagation(); try { tun(); } catch (err) { console.error('[testmenue]', err); } b.blur(); });
    box.appendChild(b);
  };
  const frei = () => { z.beschaeftigt = false; };
  knopf('Klo verstopfen', () => { frei(); z.verstopft = null; t.kloVerstopft(); });
  knopf('Torben-Unfall (Träger, Finger)', () => {
    frei();
    if (t.TU.zustand && t.TU.zustand !== 'fertig') return;
    t.TU.zustand = null;
    if (fahrten?.zustand?.torben) fahrten.zustand.torben.unterwegs = false;
    t.torbenUnfall();
  });
  knopf('Spanngurte hinwerfen', () => {
    frei();
    z.gurte = null;
    if (!t.spanngurtEreignis()) { z.gurte = 'kommt'; t.gurteHinwerfen(t.jz.da ? 'jonny' : 'waldo'); }
  });
  knopf('Spanngurte-Minispiel', () => {
    frei();
    welt.objekte.gurteBoden.visible = true;
    z.gurte = 'boden'; z.gurteSeit = 1e9;
    t.gurteAufrollen();
  });
  knopf('Waldo sucht die Kackepumpe', () => { frei(); t.wz.beschaeftigt = false; t.kackePumpe(); });
  knopf('Waldo bringt Pumpe dreckig zurück', () => { frei(); t.wz.beschaeftigt = false; t.waldoPumpeZurueck(); });
  knopf('Feuer', () => { frei(); t.feuerStart(); });
  knopf('Wasserrohrbruch', () => { frei(); t.leckStart(); });
  knopf('Leere Bierflaschen hinlegen', () => {
    const p = kamera.position;
    for (let i = 0; i < 3; i++) welt.leereFlasche(p.x + Math.sin(i * 2.1) * 0.9, p.z + Math.cos(i * 2.1) * 0.9);
  });
  knopf('Klo-Pause von Dennis', () => { frei(); t.kloPause(); });
  for (const w of [0, 50, 90]) knopf(`Wut auf ${w}`, () => t.setzeWut(w));
  el.querySelector('[data-k="zu"]').addEventListener('click', (e) => {
    e.stopPropagation();
    const zu = box.classList.toggle('versteckt');
    e.target.textContent = zu ? 'aufklappen' : 'einklappen';
  });
}
