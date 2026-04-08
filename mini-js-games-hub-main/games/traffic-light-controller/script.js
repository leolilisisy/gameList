/* Traffic Light Controller — advanced demo
   Place under games/traffic-light-controller/script.js
   Uses online sounds and an advanced car-spawn + movement + collision system.
*/

(() => {
  // ---- Config & assets (online) ----
  const SOUND_CLICK = "https://www.soundjay.com/button/sounds/button-16.mp3";
  const SOUND_HORN = "https://www.soundjay.com/transportation/sounds/car-horn-1.mp3";
  const SOUND_CRASH = "https://www.soundjay.com/transportation/sounds/car-crash-1.mp3";

  // DOM
  const startBtn = document.getElementById("startBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const restartBtn = document.getElementById("restartBtn");
  const addCarBtn = document.getElementById("addCar");
  const muteBtn = document.getElementById("muteBtn");
  const helpBtn = document.getElementById("helpBtn");

  const speedRange = document.getElementById("speedRange");
  const difficultySelect = document.getElementById("difficulty");

  const scoreEl = document.getElementById("score");
  const collisionsEl = document.getElementById("collisions");
  const carsContainer = document.getElementById("cars");

  const overlay = document.getElementById("overlay");
  const overlayTitle = document.getElementById("overlayTitle");
  const overlayText = document.getElementById("overlayText");
  const overlayClose = document.getElementById("overlayClose");

  const tlVertical = document.querySelector(".tl-vertical");
  const tlHorizontal = document.querySelector(".tl-horizontal");

  // State
  let running = false;
  let paused = false;
  let lastTimestamp = 0;
  let spawnTimer = 0;
  let spawnInterval = 1500; // ms
  let gameSpeed = 1;
  let difficulty = "normal";
  let muted = false;

  // Logical representation of lights
  // 0 = red, 1 = green, 2 = yellow
  const lights = {
    vertical: 1,   // initial green vertical
    horizontal: 0, // initial red horizontal
  };

  // game stats
  let score = 0;
  let collisions = 0;

  // car list
  const cars = [];

  // helper audio
  function playSound(url, vol = 0.9) {
    if (muted) return;
    const a = new Audio(url);
    a.volume = vol;
    a.play().catch(() => {});
  }

  // Setup initial lights UI
  function updateLightsUI() {
    // vertical
    const v = lights.vertical;
    const h = lights.horizontal;

    // helper to set classes
    const setBulbs = (el, state) => {
      el.querySelectorAll(".bulb").forEach(b => b.classList.remove("on"));
      if (state === 0) el.querySelector(".bulb.red").classList.add("on");
      if (state === 1) el.querySelector(".bulb.green").classList.add("on");
      if (state === 2) el.querySelector(".bulb.yellow").classList.add("on");
    };

    setBulbs(tlVertical, v);
    setBulbs(tlHorizontal, h);
  }

  // Cycle a light (click handler). Also auto-set opposite (mutually exclusive) when green is set.
  function cycleLight(orientation) {
    playSound(SOUND_CLICK, 0.5);
    lights[orientation] = (lights[orientation] + 1) % 3;
    // safety: if set green, opposite must be red (no crossing green)
    if (lights[orientation] === 1) {
      const opp = orientation === "vertical" ? "horizontal" : "vertical";
      lights[opp] = 0;
    }
    updateLightsUI();
  }

  // add click listeners on lights (user can click)
  tlVertical.addEventListener("click", () => cycleLight("vertical"));
  tlHorizontal.addEventListener("click", () => cycleLight("horizontal"));

  // Car generation: cars have direction, position, speed, and DOM element
  // Directions: 'down' (from top to center), 'up' (from bottom), 'right' (from left), 'left' (from right)
  const spawnPositions = {
    down: { x: "calc(50% - 26px)", y: "-60px", vx: 0, vy: 1, rotate: 0 },
    up: { x: "calc(50% - 26px)", y: "calc(100% + 60px)", vx: 0, vy: -1, rotate: 180 },
    right: { x: "-80px", y: "calc(50% - 15px)", vx: 1, vy: 0, rotate: 90 },
    left: { x: "calc(100% + 80px)", y: "calc(50% - 15px)", vx: -1, vy: 0, rotate: -90 }
  };
  const directions = Object.keys(spawnPositions);

  function randomChoice(arr) { return arr[Math.floor(Math.random()*arr.length)]; }
  function randomInt(min, max) { return Math.floor(Math.random()*(max-min+1))+min; }

  function createCar(manualDir) {
    const dir = manualDir || randomChoice(directions);
    const pos = spawnPositions[dir];

    const carEl = document.createElement("div");
    carEl.className = "car type-" + randomChoice(["a","b","c","d"]);
    carEl.style.left = pos.x;
    carEl.style.top = pos.y;
    carEl.style.transform = `rotate(${pos.rotate}deg)`;
    carEl.innerHTML = `<div style="opacity:.9">${randomInt(1,99)}</div>
      <div class="wheel"></div><div class="wheel r"></div>`;

    carsContainer.appendChild(carEl);

    // compute numeric position (pixels)
    const rect = carsContainer.getBoundingClientRect();
    let x = 0, y = 0;
    // parse positions: better to set based on viewport dims
    if (dir === "down") { x = rect.width/2 - 26; y = -80; }
    if (dir === "up") { x = rect.width/2 - 26; y = rect.height + 80; }
    if (dir === "right") { x = -100; y = rect.height/2 - 15; }
    if (dir === "left") { x = rect.width + 100; y = rect.height/2 - 15; }

    // base speed depends on difficulty
    let base = { easy: 80, normal: 120, hard: 170 }[difficulty];
    base *= (1 + (Math.random()*0.25 - 0.12)); // slight variation

    const car = {
      el: carEl,
      dir,
      x, y,
      vx: pos.vx,
      vy: pos.vy,
      speed: base * gameSpeed,
      width: 52,
      height: 30,
      state: "moving", // 'moving', 'stopped', 'crossing'
      id: Date.now() + Math.random()
    };
    cars.push(car);
  }

  // remove car
  function removeCar(car) {
    try { car.el.remove(); } catch(e){}
    const i = cars.indexOf(car);
    if (i >= 0) cars.splice(i,1);
  }

  // check if a car should stop before intersection based on lights and orientation
  function shouldStop(car) {
    // define a region near center where cars must stop if light is red or yellow
    // We'll compute distance from center depending on dir
    const rect = carsContainer.getBoundingClientRect();
    const cx = rect.width/2, cy = rect.height/2;
    const margin = 120 + (car.speed / 30); // stopping margin adjusts with speed

    if (car.dir === "down") {
      // vertical green controls down/up
      if (lights.vertical === 1) return false;
      // if red or yellow, stop before center y - margin
      if (car.y + car.height >= cy - margin && car.y < cy + margin) return true;
    }
    if (car.dir === "up") {
      if (lights.vertical === 1) return false;
      if (car.y <= cy + margin && car.y > cy - margin) return true;
    }
    if (car.dir === "right") {
      if (lights.horizontal === 1) return false;
      if (car.x + car.width >= cx - margin && car.x < cx + margin) return true;
    }
    if (car.dir === "left") {
      if (lights.horizontal === 1) return false;
      if (car.x <= cx + margin && car.x > cx - margin) return true;
    }
    return false;
  }

  // collision detection between cars (simple AABB)
  function detectCollisions() {
    for (let i=0;i<cars.length;i++){
      for (let j=i+1;j<cars.length;j++){
        const a = cars[i], b = cars[j];
        if (!a || !b) continue;
        if (a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y) {
          // collision!
          handleCollision(a,b);
        }
      }
    }
  }

  function handleCollision(a,b) {
    // remove both cars with crash effect
    playSound(SOUND_CRASH, 0.6);
    collisions++;
    collisionsEl.textContent = collisions;
    // visual flash
    [a,b].forEach(c => {
      if (!c) return;
      c.el.style.transition = "transform .2s ease-out, opacity .4s";
      c.el.style.transform += " scale(.2) rotate(20deg)";
      c.el.style.opacity = 0;
      setTimeout(()=> removeCar(c), 420);
    });
    // small penalty to score
    score = Math.max(0, score - 20);
    scoreEl.textContent = score;
  }

  // main loop
  function tick(ts) {
    if (!running || paused) { lastTimestamp = ts; requestAnimationFrame(tick); return; }
    if(!lastTimestamp) lastTimestamp = ts;
    const dt = (ts - lastTimestamp) / 1000; // seconds
    lastTimestamp = ts;

    // spawn cars
    spawnTimer += (ts - (lastTimestamp - dt*1000));
    // simplified spawn: use spawnInterval adjusted by difficulty & speed
    spawnInterval = Math.max(700, 1500 / gameSpeed * (difficulty === "hard" ? 0.7 : difficulty === "easy" ? 1.3 : 1));
    if (Math.random() < (dt * (1.2 * gameSpeed)) * (difficulty === "hard" ? 1.5 : difficulty === "easy" ? 0.7 : 1)) {
      createCar();
    }

    // update cars
    const rect = carsContainer.getBoundingClientRect();
    const cx = rect.width/2, cy = rect.height/2;

    for (let i=cars.length-1;i>=0;i--){
      const car = cars[i];
      // update car speed (sync with slider & difficulty)
      car.speed = (car.speed / gameSpeed) * gameSpeed; // keep base but mod by gameSpeed (no-op but safe)
      // decide if should stop
      const stop = shouldStop(car);
      if (stop && car.state !== "stopped") {
        car.state = "stopped";
        car.el.style.opacity = 0.9;
      } else if (!stop && car.state === "stopped") {
        // begin crossing
        car.state = "crossing";
        playSound(SOUND_HORN, 0.12);
      } else if (car.state === "crossing") {
        // if crossing area passed, revert to moving
        // crossing threshold depending on dir
        if (car.dir === "down" && car.y > cy + 90) car.state = "moving";
        if (car.dir === "up" && car.y < cy - 90) car.state = "moving";
        if (car.dir === "right" && car.x > cx + 90) car.state = "moving";
        if (car.dir === "left" && car.x < cx - 90) car.state = "moving";
      }

      if (car.state !== "stopped") {
        // velocity scaled by dt and gameSpeed
        const spd = (car.speed / 100) * (gameSpeed);
        car.x += car.vx * spd * dt * 60;
        car.y += car.vy * spd * dt * 60;
      }

      // update DOM
      car.el.style.left = car.x + "px";
      car.el.style.top = car.y + "px";

      // off-screen remove and reward
      if (car.x < -160 || car.x > rect.width + 160 || car.y < -160 || car.y > rect.height + 160) {
        // successful pass without collision -> +points
        score += 10;
        scoreEl.textContent = score;
        removeCar(car);
      }
    }

    // collisions
    detectCollisions();

    requestAnimationFrame(tick);
  }

  // ---- Controls ----
  startBtn.addEventListener("click", () => {
    if (!running) {
      running = true; paused = false; lastTimestamp = 0;
      overlay.classList.add("hidden");
      startBtn.textContent = "Running";
      startBtn.classList.add("primary");
      requestAnimationFrame(tick);
    } else if (paused) {
      paused = false; overlay.classList.add("hidden");
    }
  });

  pauseBtn.addEventListener("click", () => {
    paused = !paused;
    overlay.classList.toggle("hidden", !paused);
    overlayTitle.textContent = paused ? "Paused" : "Running";
    overlayText.textContent = paused ? "Game is paused. Click Start to resume." : "Running";
  });

  restartBtn.addEventListener("click", () => {
    playSound(SOUND_CLICK, 0.6);
    // clear cars
    cars.slice().forEach(c => removeCar(c));
    score = 0; collisions = 0;
    scoreEl.textContent = score; collisionsEl.textContent = collisions;
    running = false; paused = false; lastTimestamp = 0;
    startBtn.textContent = "Start"; startBtn.classList.remove("primary");
    // reset lights
    lights.vertical = 1; lights.horizontal = 0; updateLightsUI();
    overlay.classList.remove("hidden"); overlayTitle.textContent = "Restarted"; overlayText.textContent = "Press Start to begin a fresh session";
  });

  addCarBtn.addEventListener("click", () => {
    createCar(); playSound(SOUND_HORN, 0.12);
  });

  muteBtn.addEventListener("click", () => {
    muted = !muted;
    muteBtn.textContent = muted ? "🔇 Muted" : "🔊 Mute";
  });

  helpBtn.addEventListener("click", () => {
    overlay.classList.remove("hidden");
    overlayTitle.textContent = "How to Play";
    overlayText.textContent = "Click on either traffic light to cycle it. Green lets the traffic through. Use timing to prevent jams and collisions. Use Speed & Difficulty to tune the challenge.";
  });

  overlayClose.addEventListener("click", () => {
    overlay.classList.add("hidden");
  });

  speedRange.addEventListener("input", (e) => {
    gameSpeed = parseFloat(e.target.value);
  });

  difficultySelect.addEventListener("change", (e) => {
    difficulty = e.target.value;
  });

  // save plays for Pro Badges when user hits Play (this page is the game; main hub tracks .play-button clicks)
  // but we can also push an event to localStorage for tracking
  function trackPlay() {
    try {
      const playData = JSON.parse(localStorage.getItem("gamePlays") || "{}");
      const name = "Traffic Light Controller";
      if (!playData[name]) playData[name] = { plays: 0, success: 0 };
      playData[name].plays += 1;
      localStorage.setItem("gamePlays", JSON.stringify(playData));
    } catch (e) {}
  }

  // start auto (for quick demo) track play
  trackPlay();

  // initialize UI
  updateLightsUI();
  overlay.classList.remove("hidden");
  overlayTitle.textContent = "Welcome";
  overlayText.textContent = "Press Start to run the simulation. Tip: vertical starts green.";

  // initial spawn to show some activity
  for(let i=0;i<2;i++) createCar();

})();
