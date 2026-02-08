let worldData;
let clickedPoints = [];
let socket;

function preload() {
  let url = 'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json';
  worldData = loadJSON(url);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 1);

  socket = io();

  socket.on('initHistory', (data) => {
    clickedPoints = data;
  });

  socket.on('updateMap', (newPoint) => {
    clickedPoints.push(newPoint);
  });
}

function draw() {
  background(210, 80, 15); 

  for (let i = 0; i < worldData.features.length; i++) {
    let country = worldData.features[i];
    stroke(180, 80, 80, 0.6); 
    strokeWeight(1.2);
    fill(200, 70, 25, 0.8);

    if (country.geometry.type === "Polygon") {
      drawShape(country.geometry.coordinates[0]);
    } else if (country.geometry.type === "MultiPolygon") {
      for (let j = 0; j < country.geometry.coordinates.length; j++) {
        drawShape(country.geometry.coordinates[j][0]);
      }
    }
  }

  drawHighlights();
}

function drawShape(points) {
  beginShape();
  for (let i = 0; i < points.length; i++) {
    let x = map(points[i][0], -180, 180, 0, width);
    let y = map(points[i][1], 90, -90, 0, height);
    vertex(x, y);
  }
  endShape(CLOSE);
}

function drawHighlights() {
  push();
  noStroke();
  for (let p of clickedPoints) {
    let pulse = sin(frameCount * 0.1 + p.offset) * 0.4 + 0.6;
    for (let r = 40; r > 0; r -= 5) {
      fill(p.h, p.s, 100, (1 - r/40) * 0.5 * pulse);
      ellipse(p.x, p.y, r, r);
    }
    fill(p.h, 20, 100, 1);
    ellipse(p.x, p.y, 6, 6);
  }
  pop();
}

function mousePressed() {
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    let newPoint = {
      x: mouseX,
      y: mouseY,
      h: random(360),
      s: 90,
      offset: random(TWO_PI)
    };
    // 发送给服务器，让所有人都能看到
    socket.emit('addPoint', newPoint);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}