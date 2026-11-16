let data;

// Variabile in cui salvo il codice del paese selezionato
let selectedCode;

// La disciplina con più medaglie del paese selezionato (serve per la scala delle barre)
let maxDisciplineTotal = 0;

// Colori
let backgroundColor = '#0F4C5C';
let textColor = '#F2F8F8';
let softColor = '#9CC7CC';
let goldColor = '#E8B923';
let silverColor = '#B4BDC9';
let bronzeColor = '#C57A3C';
let starColor = '#E8A90B';
let menColor = '#F2F8F8';
let womenColor = '#7FD1C7';

let margin = 24;

// Nomi delle discipline in italiano 
let disciplineNames = {
  'Alpine Skiing': 'Sci alpino',
  'Biathlon': 'Biathlon',
  'Bobsleigh': 'Bob',
  'Cross-Country Skiing': 'Sci di fondo',
  'Curling': 'Curling',
  'Figure Skating': 'Pattinaggio artistico',
  'Freestyle Skiing': 'Freestyle',
  'Ice Hockey': 'Hockey su ghiaccio',
  'Luge': 'Slittino',
  'Nordic Combined': 'Combinata nordica',
  'Short Track Speed Skating': 'Short track',
  'Ski Jumping': 'Salto con gli sci',
  'Ski Mountaineering': 'Sci alpinismo',
  'Skeleton': 'Skeleton',
  'Snowboard': 'Snowboard',
  'Speed Skating': 'Pattinaggio velocità'
};


async function setup() {
  data = await loadTable("assets/MilanoCortina2026.csv", ",", "header");

  // Legge i parametri passati nell'URL 
  let params = getURLParams();

  // Salvo il codice del paese selezionato
  selectedCode = params.country;

  // FILTRO: guardo solo le righe del paese selezionato
  for (let rowNumber = 0; rowNumber < data.getRowCount(); rowNumber++) {
    if (data.getString(rowNumber, "country_code") === selectedCode) {
      let disciplineTotal = data.getNum(rowNumber, "disc_total");
      if (disciplineTotal > maxDisciplineTotal) {
        maxDisciplineTotal = disciplineTotal;
      }
    }
  }

  createCanvas(windowWidth, windowHeight);
}


function draw() {
  background(backgroundColor);
  noStroke();
  textAlign(LEFT, TOP);
  textStyle(NORMAL);

  let narrow = width < 780;   // su schermi stretti le due colonne diventano una

  // La prima riga del paese contiene i dati dell'intero paese (sono ripetuti su ogni riga).
  let countryRow = data.findRow(selectedCode, "country_code");

  if (countryRow) {
    let name = countryRow.get("country");
    let rankGold = int(countryRow.get("rank_gold"));
    let rankTotal = int(countryRow.get("rank_total"));
    let gold = int(countryRow.get("country_gold"));
    let silver = int(countryRow.get("country_silver"));
    let bronze = int(countryRow.get("country_bronze"));
    let total = int(countryRow.get("country_total"));
    let men = int(countryRow.get("country_men_athletes"));
    let women = int(countryRow.get("country_women_athletes"));

    // TITOLO E POSIZIONI IN CLASSIFICA 
    fill(textColor);
    textSize(30);
    textStyle(BOLD);
    text(name + " (" + selectedCode + ")", margin, 48);
    textStyle(NORMAL);
    fill(softColor);
    textSize(14);
    text(rankGold + "° per ori · " + rankTotal + "° per medaglie totali", margin, 90);

    // MEDAGLIA INGRANDITA E NUMERI ESATTI 
    let R = 66;
    let medalX = margin + 1.25 * R;
    let medalY = 128 + R + 6;
    drawMedal(medalX, medalY, R, gold, silver, bronze);

    let numbersX = medalX + 1.25 * R + 22;
    let numbersY = medalY - 44;
    drawCount(numbersX, numbersY, goldColor, gold, "oro");
    drawCount(numbersX, numbersY + 34, silverColor, silver, "argento");
    drawCount(numbersX, numbersY + 68, bronzeColor, bronze, "bronzo");

    // COLONNA SINISTRA: totale e atleti per genere 
    let yLeft = medalY + 1.88 * R + 26;
    fill(textColor);
    textSize(14);
    text(total + " medaglie totali, il " + int(100 * gold / total) + "% sono ori", margin, yLeft);

    yLeft += 40;
    fill(softColor);
    textSize(13);
    text("Atleti medagliati per genere", margin, yLeft);

    yLeft += 22;
    let genderBarWidth = 300;
    if (narrow) {
      genderBarWidth = width - 2 * margin;
    }
    let menWidth = genderBarWidth * men / (men + women);
    fill(menColor);
    rect(margin, yLeft, menWidth, 12, 3);
    fill(womenColor);
    rect(margin + menWidth, yLeft, genderBarWidth - menWidth, 12, 3);

    yLeft += 20;
    fill(menColor);
    text("Uomini " + men, margin, yLeft);
    fill(womenColor);
    textAlign(RIGHT, TOP);
    text("Donne " + women, margin + genderBarWidth, yLeft);
    textAlign(LEFT, TOP);
    yLeft += 30;

    // COLONNA DESTRA: medaglie per disciplina 
    let rightX = margin + 350;
    let yRight = 128;
    if (narrow) {
      rightX = margin;
      yRight = yLeft + 20;
    }
    let rightWidth = width - rightX - margin;

    fill(softColor);
    textSize(13);
    text("Medaglie per disciplina", rightX, yRight);
    yRight += 26;

    let labelWidth = 150;
    if (narrow) {
      labelWidth = 130;
    }
    let barsX = rightX + labelWidth;
    let barsWidth = max(40, rightWidth - labelWidth - 40);
    let unit = barsWidth / maxDisciplineTotal;   // pixel per ogni medaglia

    for (let rowNumber = 0; rowNumber < data.getRowCount(); rowNumber++) {
      // FILTRO: una barra per ogni riga del paese selezionato
      if (data.getString(rowNumber, "country_code") === selectedCode) {
        let disciplineGold = data.getNum(rowNumber, "disc_gold");
        let disciplineSilver = data.getNum(rowNumber, "disc_silver");
        let disciplineBronze = data.getNum(rowNumber, "disc_bronze");
        let english = data.getString(rowNumber, "discipline");
        let disciplineName = disciplineNames[english] || english;

        textSize(12);
        fill(textColor);
        textAlign(LEFT, CENTER);
        text(disciplineName, rightX, yRight + 10);

        // Tre rettangoli affiancati: la larghezza è proporzionale al numero di medaglie.
        let barX = barsX;
        fill(goldColor);
        rect(barX, yRight + 3, disciplineGold * unit, 14, 2);
        barX += disciplineGold * unit;
        fill(silverColor);
        rect(barX, yRight + 3, disciplineSilver * unit, 14, 2);
        barX += disciplineSilver * unit;
        fill(bronzeColor);
        rect(barX, yRight + 3, disciplineBronze * unit, 14, 2);
        barX += disciplineBronze * unit;

        fill(textColor);
        text(disciplineGold + disciplineSilver + disciplineBronze, barX + 6, yRight + 10);

        yRight += 26;
      }
    }
    textAlign(LEFT, TOP);
  } else {
    // Nessun paese con quel codice (o parametro mancante nell'URL)
    fill(textColor);
    textSize(14);
    text("Paese non trovato: torna alla pagina d'insieme e scegline uno.", margin, 52);
  }
}


// Una riga "cerchio colorato + numero + nome": serve per i numeri esatti accanto alla medaglia.
function drawCount(x, y, color, count, label) {
  fill(color);
  circle(x + 6, y + 10, 12);
  fill(textColor);
  textSize(16);
  textStyle(BOLD);
  text(count, x + 20, y);
  textStyle(NORMAL);
  fill(softColor);
  text(label, x + 48, y);
}


// GLIFO MEDAGLIA: uguale a quello della pagina d'insieme.
function drawMedal(x, y, R, gold, silver, bronze) {
  push();
  translate(x, y);
  noStroke();

  for (let side = -1; side <= 1; side += 2) {
    fill('#DE4A55');
    beginShape();
    vertex(side * 0.78 * R, 0.6 * R);
    vertex(side * 0.22 * R, 0.98 * R);
    vertex(side * 0.62 * R, 1.88 * R);
    vertex(side * 0.85 * R, 1.5 * R);
    vertex(side * 1.22 * R, 1.55 * R);
    endShape(CLOSE);
  }

  let total = gold + silver + bronze;
  let counts = [gold, silver, bronze];
  let colors = [goldColor, silverColor, bronzeColor];
  let angle = -HALF_PI;

  noFill();
  strokeCap(SQUARE);
  strokeWeight(0.22 * R);
  for (let i = 0; i < 3; i++) {
    if (counts[i] > 0) {
      let endAngle = angle + TWO_PI * counts[i] / total;
      stroke(colors[i]);
      if (counts[i] === total) {
        circle(0, 0, 1.78 * R);
      } else {
        arc(0, 0, 1.78 * R, 1.78 * R, angle + 0.02, endAngle - 0.02, OPEN);
      }
      angle = endAngle;
    }
  }

  // Stella
  noStroke();
  fill(starColor);
  textAlign(CENTER, CENTER);
  textSize(R);
  text("★", 0, 0);

  pop();
}

