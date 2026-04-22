
document.body.addEventListener("touchmove", function(e) {
  e.preventDefault();
}, { passive: false });

const canvas = document.getElementById('peliAlue');
const ctx = canvas.getContext('2d');

const TEEMA = {
  pelaaja: "#00ffe1",
  vihollinen: "#39ff14",
  ammus: "#ff3df2",
  räjähdys: "#ffb000"
};

let elamat = 3;

let vihollisNopeusKerroin = 1;
let laukaisuNopeusKerroin = 1;

const gameOverRuutu = document.getElementById("gameOverRuutu");
const loppuPisteet = document.getElementById("loppuPisteet");
const uudelleenBtn = document.getElementById("uudelleenBtn");

let kosketusAktiivinen = false;
let kosketusX = 0;
let kosketusAlkuAika = 0;

const vaikeusVali = 30000;
let pelinAlkuAika = Date.now();

  let pisteet = 0;
  let peliKaynnissa = false;

  let rajahdykset = [];

  const pelaaja = {
    x: 175,
    y: 490,
    leveys: 50,
    korkeus: 30,
    nopeus: 5,
    vari: TEEMA.pelaaja
};

  let viholliset = [];
  const nappaimet = {};
  let ammukset = [];
  let viimeLaukaus = 0;
  const laukaisuViive = 400;

  let meteoriitit = [];
  const meteoriMaara = 100;

  canvas.width = 400;
  canvas.height = 600;

  function paivitaVaikeus() {
    const kulunut = Date.now() - pelinAlkuAika;
    const taso = Math.floor(kulunut / vaikeusVali);

    vihollisNopeusKerroin = 1 + taso * 0.25;
    laukaisuNopeusKerroin = 1 + taso * 0.3;
  }

  function luoRajahdys(x, y) {
  rajahdykset.push({
    x: x,
    y: y,
    koko: 10,
    maxKoko: 150,
    elinAika: 60,
    alpha: 1,
  });
  console.log("RÄJÄHDYS LUOTU", x, y);
  }

  function luoMeteoriitit() {
    meteoriitit = [];
    
  for (let i = 0; i < meteoriMaara; i++) {
    meteoriitit.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      koko: Math.random() * 2 + 1,
      nopeus: Math.random() * 0.8 + 0.2
    });
  }
}

  document.addEventListener('keydown', function(e) {
    nappaimet[e.key] = true;
    if (e.key === ' ') {
        e.preventDefault();
        luoAmmus();
    }
});

  document.addEventListener('keyup', function(e) {
    nappaimet[e.key] = false;
});

canvas.addEventListener("touchstart", function(e) {
  e.preventDefault();

  kosketusAktiivinen = true;
  kosketusAlkuAika = Date.now();

  const rect = canvas.getBoundingClientRect();
  kosketusX = e.touches[0].clientX - rect.left;
});

canvas.addEventListener("touchmove", function(e) {
  e.preventDefault();

  const rect = canvas.getBoundingClientRect();
  kosketusX = e.touches[0].clientX - rect.left;
});

canvas.addEventListener("touchend", function(e) {
  e.preventDefault();

  kosketusAktiivinen = false;

  const kesto = Date.now() - kosketusAlkuAika;
  if (kesto < 200) {
    luoAmmus();
  }
});

let viimeVihollisX = null;

  function luoVihollinen() {
    const koko = 32;

    let uusiX;
    let yritykset = 0; 

    do {
        uusiX = Math.random() * (canvas.width - koko);
        yritykset++;
    } while (
        viimeVihollisX !== null &&
        Math.abs(uusiX - viimeVihollisX) < 60 &&
        yritykset < 10
    );

    viimeVihollisX = uusiX;

    const uusiVihollinen = {
      x: Math.random() * (canvas.width - 32),
      y: -32,
      leveys: 32,
      korkeus: 32,
      nopeus: 2 * vihollisNopeusKerroin,
      vari: TEEMA.vihollinen
 };
    viholliset.push(uusiVihollinen);
}
  setInterval(luoVihollinen, 1200);

 function luoAmmus() {
    const nyt = Date.now();
    const nykyinenViive = laukaisuViive / laukaisuNopeusKerroin;
    if (nyt - viimeLaukaus < nykyinenViive) return;

    const ammus = {
        x: pelaaja.x + pelaaja.leveys / 2 - 3,
        y: pelaaja.y,
        leveys: 6,
        korkeus: 12,
        nopeus: 7,
        vari: TEEMA.ammus
    };

    ammukset.push(ammus);
    viimeLaukaus = nyt;
 }

  function tormaavatko(a, b) {
    return (
      a.x < b.x + b.leveys &&
      a.x + a.leveys > b.x &&
      a.y < b.y + b.korkeus &&
      a.y + a.korkeus > b.y
  );
}

  function paivita() {
    paivitaVaikeus();

    if (nappaimet['ArrowLeft'] && pelaaja.x > 0) {
      pelaaja.x -= pelaaja.nopeus;
    }
    if (nappaimet['ArrowRight'] && pelaaja.x + pelaaja.leveys < canvas.width) {
      pelaaja.x += pelaaja.nopeus;
    }

    if (kosketusAktiivinen) {
      pelaaja.x = kosketusX - pelaaja.leveys / 2;

      if (pelaaja.x < 0) pelaaja.x = 0;
      if (pelaaja.x + pelaaja.leveys > canvas.width) {
        pelaaja.x = canvas.width - pelaaja.leveys;
      }
    }

    for (let i = viholliset.length - 1; i >= 0; i--) {
      const v = viholliset[i];
      v.y += v.nopeus;

      if (v.y > canvas.height) {
        viholliset.splice(i, 1);
        continue;
    }
      if (tormaavatko(pelaaja, v)) {
        viholliset.splice(i, 1);
        elamat--;

        luoRajahdys(
          pelaaja.x + pelaaja.leveys / 2,
          pelaaja.y + pelaaja.korkeus / 2
        );

        if (elamat <= 0) {
          peliKaynnissa = false;
          clearInterval(vihollisInterval);

          loppuPisteet.textContent = "Pisteet: " + pisteet;
          gameOverRuutu.style.display = "flex";
        }

      continue;
    }
  }
  for (let a = ammukset.length - 1; a >= 0; a--) {
    const ammus = ammukset[a];
    ammus.y -= ammus.nopeus;
    
    if (ammus.y + ammus.korkeus < 0) {
        ammukset.splice(a, 1);
        continue;
    }

    for (let v = viholliset.length - 1; v >= 0; v--) {
      if (tormaavatko(ammus, viholliset[v])) {

        const osuttuVihollinen = viholliset[v];

        viholliset.splice(v, 1);
        ammukset.splice(a, 1);
        
        luoRajahdys(
        osuttuVihollinen.x + osuttuVihollinen.leveys / 2,
        osuttuVihollinen.y + osuttuVihollinen.korkeus / 2
        );
        pisteet += 100;
        break;
      }
    }
  }

  for (let m of meteoriitit) {
    m.y += m.nopeus;

    if (m.y > canvas.height) {
        m.y = -5;
        m.x = Math.random() * canvas.width;
    }
  }

  for (let i = rajahdykset.length - 1; i >= 0; i--) {
    let r = rajahdykset[i];

    r.koko += 4;
    r.elinAika--;
    r.alpha -= 0.015;

    if (r.elinAika <= 0 || r.alpha <= 0) {
        rajahdykset.splice(i, 1);
    }
  }
 }

 function nollaaPeli() {
  pisteet = 0;
  elamat = 3;

  viholliset = [];
  ammukset = [];
  rajahdykset = [];

  pelaaja.x = 175;
  pelaaja.y = 490;

  vihollisNopeusKerroin = 1;
  laukaisuNopeusKerroin = 1;

  pelinAlkuAika = Date.now();
 }

  function piirrä() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#000011';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    for (let m of meteoriitit) {
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.koko, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = pelaaja.vari;
    ctx.fillRect(pelaaja.x, pelaaja.y, pelaaja.leveys, pelaaja.korkeus);

    for (const v of viholliset) {
      ctx.fillStyle = v.vari;
      ctx.fillRect(v.x, v.y, v.leveys, v.korkeus);
  }

  for (let r of rajahdykset) {
    ctx.save();

    ctx.globalAlpha = r.alpha;

    ctx.beginPath();
    ctx.fillStyle = TEEMA.räjähdys;
    ctx.arc(r.x, r.y, r.koko, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = TEEMA.räjähdys;
    ctx.shadowBlur = 25;

    ctx.restore();
  }

  for (const a of ammukset) {
    ctx.fillStyle = a.vari;
    ctx.fillRect(a.x, a.y, a.leveys, a.korkeus);
  }

    document.getElementById("pisteetNaytto").textContent =
    'PISTEET: ' + pisteet +
    ' | ELÄMÄT: ' + elamat +
    ' | TASO: ' + Math.floor((Date.now() - pelinAlkuAika) / vaikeusVali + 1);
 }

  function pelisilmukka() {
    if (!peliKaynnissa) return;
    paivita();
    piirrä();
    requestAnimationFrame(pelisilmukka);
 }

const aloitusRuutu = document.getElementById("aloitusRuutu");
const aloitaBtn = document.getElementById("aloitaBtn");

let vihollisInterval;

aloitaBtn.addEventListener("click", () => {
  aloitusRuutu.style.display = "none";

  peliKaynnissa = true;
  pelinAlkuAika = Date.now();

  vihollisInterval = setInterval(luoVihollinen, 1200);

  pelisilmukka();
});

uudelleenBtn.addEventListener("click", () => {
  gameOverRuutu.style.display = "none";

  nollaaPeli();

  peliKaynnissa = true;
  vihollisInterval = setInterval(luoVihollinen, 1200);

  pelisilmukka();
});

function paivitaOhjeTeksti() {
  const ohje = document.getElementById("ohjeet");
  if (!ohje) return;

  if (window.innerWidth <= 768) {
  ohje.innerHTML = `
    LIIKU = Sormella hahmon liikuttaminen<br>
    PAINELLUS = Ammu
    `;
  } else {
    
    ohje.innerHTML = `
    ← → liiku &nbsp;|&nbsp; VÄLILYÖNTI ammu
    `;
  }
}

 luoMeteoriitit();

document.addEventListener("DOMContentLoaded", () => {
  paivitaOhjeTeksti();
  window.addEventListener("resize", paivitaOhjeTeksti);
});

