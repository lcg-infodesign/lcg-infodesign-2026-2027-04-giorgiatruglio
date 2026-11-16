let data;
let maxTotal = 0;      // il numero più alto di medaglie totali 
let numCountries = 0;  // quanti paesi ci sono nel dataset

// Colori
let backgroundColor = '#0F4C5C';
let textColor = '#F2F8F8';
let softColor = '#9CC7CC';
let lineColor = '#2A8795';
let cardColor = '#176B7A';
let goldColor = '#E8B923';
let silverColor = '#B4BDC9';
let bronzeColor = '#C57A3C';
let starColor = '#E8A90B';

// Misure 
let margin = 24;
let cellSize = 116;
let headerHeight = 124;   // spazio in alto per titolo e legenda
let legendY = 56; 
let columns = 1;
let startX = 24;

// Variabili per l'interazione col mouse
let hovered = false;
let hoveredCode = "";
let hoveredName = "";
let hoveredGold = 0;
let hoveredSilver = 0;
let hoveredBronze = 0;
let hoveredTotal = 0;


async function setup() {
  data = await loadTable("assets/MilanoCortina2026.csv", ",", "header");

  // Il CSV ha una riga per ogni coppia paese-disciplina: un paese compare più volte.
  // Le righe dello stesso paese sono consecutive, quindi conto un paese quando il codice cambia.
  let previousCode = "";
  for (let rowNumber = 0; rowNumber < data.getRowCount(); rowNumber++) {
    let code = data.getString(rowNumber, "country_code");
    if (code !== previousCode) {
      previousCode = code;
      numCountries += 1;

      let total = data.getNum(rowNumber, "country_total");
      if (total > maxTotal) {
        maxTotal = total;
      }
    }
  }

  if (windowWidth < 600) {   // Su schermi stretti le celle sono più piccole e la riga di spiegazione può andare a capo.
    cellSize = 92;
    headerHeight = 140;
  }

  // Celle 
  columns = max(1, floor((windowWidth - 2 * margin) / cellSize));
  let rows = ceil(numCountries / columns);
  startX = margin + (windowWidth - 2 * margin - columns * cellSize) / 2;

  createCanvas(windowWidth, headerHeight + rows * cellSize + margin);
}


function draw() {
  background(backgroundColor);
  noStroke();
  textAlign(LEFT, TOP);

  // TITOLO E LEGENDA 
  fill(textColor);
  textSize(24);
  textStyle(BOLD);
  text("Milano Cortina 2026", margin, 16);

  textStyle(NORMAL);
  textSize(13);

  let legendX = margin;
  fill(goldColor);
  circle(legendX + 6, legendY + 8, 12);
  fill(textColor);
  text("Oro", legendX + 16, legendY);

  legendX += 16 + textWidth("Argento") + 18;
  fill(silverColor);
  circle(legendX + 6, legendY + 8, 12);
  fill(textColor);
  text("Argento", legendX + 16, legendY);

  legendX += 16 + textWidth("Bronzo") + 18;
  fill(bronzeColor);
  circle(legendX + 6, legendY + 8, 12);
  fill(textColor);
  text("Bronzo", legendX + 16, legendY);

  fill(softColor);
  text("Dimensione = medaglie totali · Anello = quota di oro, argento e bronzo", margin, legendY + 24, width - 2 * margin);

  // GRIGLIA DEI PAESI 
  hovered = false;
  let previousCode = "";
  let position = 0;                 // numero progressivo del paese (0 = primo in classifica)
  let maxRadius = cellSize * 0.25;  // raggio della medaglia più grande

  for (let rowNumber = 0; rowNumber < data.getRowCount(); rowNumber++) {
    let code = data.getString(rowNumber, "country_code");

    // Disegno il paese solo alla prima riga in cui compare.
    if (code !== previousCode) {
      previousCode = code;

      let gold = data.getNum(rowNumber, "country_gold");
      let silver = data.getNum(rowNumber, "country_silver");
      let bronze = data.getNum(rowNumber, "country_bronze");
      let total = data.getNum(rowNumber, "country_total");

      // Posizione della cella nella griglia.
      let cellX = startX + (position % columns) * cellSize;
      let cellY = headerHeight + floor(position / columns) * cellSize;

      // Verifica se il puntatore si trova dentro la cella 
      if (
        mouseX >= cellX && mouseX <= cellX + cellSize &&
        mouseY >= cellY && mouseY <= cellY + cellSize
      ) {
        hovered = true;
        hoveredCode = code;
        hoveredName = data.getString(rowNumber, "country");
        hoveredGold = gold;
        hoveredSilver = silver;
        hoveredBronze = bronze;
        hoveredTotal = total;

        // Riquadro dietro la medaglia
        fill(cardColor);
        stroke(lineColor);
        rect(cellX + 3, cellY + 2, cellSize - 6, cellSize - 4, 10);
        noStroke();
      }

      let radius = map(sqrt(total), 1, sqrt(maxTotal), 10, maxRadius);
      let centerX = cellX + cellSize / 2;
      let centerY = cellY + 6 + maxRadius;
      drawMedal(centerX, centerY, radius, gold, silver, bronze);

      // Codice del paese sotto la medaglia
      fill(textColor);
      textSize(12);
      textStyle(BOLD);
      textAlign(CENTER, TOP);
      text(code, centerX, centerY + 1.88 * maxRadius + 4);
      textStyle(NORMAL);
      textAlign(LEFT, TOP);

      position += 1;
    }
  }

  // Hover text 
  if (hovered) {
    cursor(HAND);

    let line1 = hoveredName;
    let line2 = hoveredGold + " oro · " + hoveredSilver + " argento · " + hoveredBronze + " bronzo";
    let line3 = hoveredTotal + " medaglie totali";

    textSize(12);
    let tipWidth = max(textWidth(line1), textWidth(line2), textWidth(line3)) + 20;
    let tipHeight = 66;

    // Il riquadro si sposta a sinistra/in alto se uscirebbe dal canvas.
    let tipX = mouseX + 14;
    if (tipX + tipWidth > width - 8) {
      tipX = mouseX - tipWidth - 14;
    }
    let tipY = mouseY + 14;
    if (tipY + tipHeight > height - 8) {
      tipY = mouseY - tipHeight - 14;
    }

    fill(cardColor);
    stroke(lineColor);
    rect(tipX, tipY, tipWidth, tipHeight, 6);

    noStroke();
    fill(textColor);
    textStyle(BOLD);
    text(line1, tipX + 10, tipY + 8);
    textStyle(NORMAL);
    text(line2, tipX + 10, tipY + 26);
    text(line3, tipX + 10, tipY + 44);
  } else {
    cursor(ARROW);
  }
}


// GLIFO MEDAGLIA
function drawMedal(x, y, R, gold, silver, bronze) {  // R il raggio: tutte le misure sono proporzionali a R.
  push();
  translate(x, y);   // da qui in poi (0, 0) è il centro della medaglia
  noStroke();

  // Nastri: uno a sinistra (side = -1) e uno a destra (side = 1), specchiati.
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

  // Anello esterno
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
        circle(0, 0, 1.78 * R);    // un solo tipo di medaglia: anello intero
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


function mousePressed() {
  // Il paese cliccato viene passato alla pagina di dettaglio tramite l'URL.
  if (hovered) {
    let newURL = "detail.html?country=" + hoveredCode;

    console.log(newURL);

    // Apre la pagina di dettaglio nella stessa scheda.
    window.location.href = newURL;
  }
}
