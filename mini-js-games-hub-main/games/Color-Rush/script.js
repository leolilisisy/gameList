// Game elements
    const gameArea = document.getElementById("gameArea");
    const basket = document.getElementById("basket");
    const scoreDisplay = document.getElementById("score");
    const targetColorDisplay = document.getElementById("targetColor");
    const targetSwatch = document.getElementById("targetSwatch");
    const basketGlow = document.querySelector(".basket-glow");

    // Game state
    const originalColors = [
      { name: "Red", color: "#e53935" },
      { name: "Blue", color: "#1e88e5" },
      { name: "Green", color: "#43a047" },
      { name: "Yellow", color: "#fdd835" },
      { name: "Purple", color: "#8e24aa" },
      { name: "Orange", color: "#fb8c00" }
    ];
    
    let targetColor = "Blue";
    let score = 0;
    let caughtCount = 0;
    const gameDuration = 60;
    let timerRemaining = gameDuration;
    let timerId = null;
    let isRunning = false;
    let inputEnabled = false;
  // Prevent target-colored balls from spawning consecutively: set the earliest allowed time
  // for the next target spawn. When a target ball is spawned we'll set this to now + 2-3s.
  let nextTargetAllowedAt = 0;

    // Basket movement
    let gameWidth = gameArea.clientWidth;
    let maxRight = gameWidth - basket.offsetWidth;
    let basketX = gameWidth / 2 - basket.offsetWidth / 2;
    basket.style.transform = `translateX(${basketX}px)`;
    
  const basketSpeed = 20;
    let leftPressed = false;
    let rightPressed = false;

    // Update game area dimensions on resize
    function updateSizes() {
      gameWidth = gameArea.clientWidth;
      maxRight = Math.max(0, gameWidth - basket.offsetWidth);
      if (basketX > maxRight) {
        basketX = maxRight;
        basket.style.transform = `translateX(${basketX}px)`;
      }
    }
    window.addEventListener("resize", updateSizes);

    // Keyboard controls
    document.addEventListener("keydown", (e) => {
      if (e.key === "p" || e.key === "P") {
        const pb = document.getElementById("pauseBtn");
        if (pb) pb.click();
        return;
      }
      if (!inputEnabled) return;
      if (e.key === "ArrowLeft") leftPressed = true;
      if (e.key === "ArrowRight") rightPressed = true;
    });
    
    document.addEventListener("keyup", (e) => {
      if (!inputEnabled) return;
      if (e.key === "ArrowLeft") leftPressed = false;
      if (e.key === "ArrowRight") rightPressed = false;
    });

    // Basket movement loop
    function gameLoop() {
      let moved = false;
      if (leftPressed) {
        basketX -= basketSpeed;
        moved = true;
      }
      if (rightPressed) {
        basketX += basketSpeed;
        moved = true;
      }
      if (moved) {
        basketX = Math.max(0, Math.min(basketX, maxRight));
        basket.style.transform = `translateX(${basketX}px)`;
        basketGlow.style.transform = `translateX(${basketX}px)`;
      }
      requestAnimationFrame(gameLoop);
    }
    requestAnimationFrame(gameLoop);

    // Pointer/touch controls
    gameArea.addEventListener("pointermove", (e) => {
      if (!inputEnabled || e.isPrimary === false) return;
      const rect = gameArea.getBoundingClientRect();
      const x = e.clientX - rect.left - basket.offsetWidth / 2;
      basketX = Math.min(Math.max(0, x), maxRight);
      basket.style.transform = `translateX(${basketX}px)`;
      basketGlow.style.transform = `translateX(${basketX}px)`;
    });

    // Target color rotation
    function changeTargetColor() {
      const obj = originalColors[Math.floor(Math.random() * originalColors.length)];
      targetColor = obj.name;
      targetColorDisplay.textContent = obj.name;
      targetSwatch.style.background = obj.color;
      
      // Add animation to swatch
      targetSwatch.style.animation = "pulse 1s ease-out";
      setTimeout(() => {
        targetSwatch.style.animation = "";
      }, 1000);
    }
    setInterval(changeTargetColor, 5000);
    changeTargetColor();

    // Create falling balls
    function createBall() {
      const ball = document.createElement("div");
      ball.classList.add("ball");
      
      // Slight bias toward the current target color so players see a few more desired balls
      // Compute a subtle bias relative to the uniform baseline so the increase is small
      const baseline = 1 / originalColors.length; // uniform probability
      const biasIncrease = 0.12; // add ~12 percentage points over uniform (tweakable)
      const biasToTarget = Math.min(0.6, baseline + biasIncrease);

      let colorObj;
      const now = Date.now();
      // Only choose the target color if we're past the cooldown window
      const chooseTarget = Math.random() < biasToTarget && now >= nextTargetAllowedAt;
      if (chooseTarget) {
        // pick the target color (fallback to a random color if not found)
        colorObj = originalColors.find((c) => c.name === targetColor) || originalColors[Math.floor(Math.random() * originalColors.length)];
        // set a cooldown so the target color doesn't appear again immediately
        const cooldownMs = 2000 + Math.random() * 1000; // 2-3 seconds
        nextTargetAllowedAt = now + cooldownMs;
      } else {
        // pick a non-target color
        const others = originalColors.filter((c) => c.name !== targetColor);
        colorObj = others.length ? others[Math.floor(Math.random() * others.length)] : originalColors[Math.floor(Math.random() * originalColors.length)];
      }
      ball.style.background = colorObj.color;
      ball.dataset.colorName = colorObj.name;
      
      // Position the ball
      const spawnBandWidth = gameArea.offsetWidth * 0.7;
      const spawnStart = (gameArea.offsetWidth - spawnBandWidth) / 2;
      const leftPos = spawnStart + Math.random() * Math.max(0, spawnBandWidth - 36);
      ball.style.left = leftPos + "px";
      ball.style.animation = "none";
      
      gameArea.appendChild(ball);

      // Ball animation and collision
      const fallSpeed = 2;
      let topPos = 0;

      ball._tick = function () {
        topPos += fallSpeed;
        ball._topPos = topPos;
        ball.style.top = topPos + "px";

        const ballRect = ball.getBoundingClientRect();
        const basketRect = basket.getBoundingClientRect();

        // Collision detection
        if (
          ballRect.bottom >= basketRect.top &&
          ballRect.left < basketRect.right &&
          ballRect.right > basketRect.left
        ) {
          const ballName = ball.dataset.colorName || "";
          
          // Visual feedback for catching
          basketGlow.style.opacity = "1";
          setTimeout(() => {
            basketGlow.style.opacity = "0";
          }, 300);
          
          // Create particles
          createParticles(ballRect.left + ballRect.width/2, ballRect.top + ballRect.height/2, ball.style.background);
          
          if (ballName === targetColor) {
            score += 10;
          } else {
            score -= 5;
          }
          
          scoreDisplay.textContent = score;
          caughtCount += 1;
          document.getElementById("caught").textContent = caughtCount;
          
          if (ball._fallInterval) {
            clearInterval(ball._fallInterval);
            ball._fallInterval = null;
          }
          ball.remove();
          return;
        }

        // Remove ball if off-screen
        if (topPos > gameArea.offsetHeight) {
          if (ball._fallInterval) {
            clearInterval(ball._fallInterval);
            ball._fallInterval = null;
          }
          ball.remove();
        }
      };

      // Start the ball falling
      const fallInterval = setInterval(ball._tick, 20);
      ball._fallInterval = fallInterval;
      ball._fallSpeed = fallSpeed;
    }

    // Create particles for visual effect
    function createParticles(x, y, color) {
      for (let i = 0; i < 8; i++) {
        const particle = document.createElement("div");
        particle.classList.add("particle");
        particle.style.background = color;
        particle.style.left = x + "px";
        particle.style.top = y + "px";
        
        const angle = Math.random() * Math.PI * 2;
        const velocity = 2 + Math.random() * 3;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        gameArea.appendChild(particle);
        
        let opacity = 1;
        const particleInterval = setInterval(() => {
          const left = parseFloat(particle.style.left) + vx;
          const top = parseFloat(particle.style.top) + vy;
          opacity -= 0.03;
          
          particle.style.left = left + "px";
          particle.style.top = top + "px";
          particle.style.opacity = opacity;
          
          if (opacity <= 0) {
            clearInterval(particleInterval);
            particle.remove();
          }
        }, 30);
      }
    }

    // Game control functions
    let spawnIntervalId = null;
    
    function startSpawning() {
      if (spawnIntervalId) return;
      spawnIntervalId = setInterval(createBall, 1000);
    }

    function stopSpawning() {
      if (!spawnIntervalId) return;
      clearInterval(spawnIntervalId);
      spawnIntervalId = null;
    }

    // Timer functions
    function startTimer() {
      if (timerId) return;
      timerId = setInterval(() => {
        timerRemaining -= 1;
        updateTimerDisplay();
        if (timerRemaining <= 0) {
          endGame();
        }
      }, 1000);
    }

    function pauseTimer() {
      if (!timerId) return;
      clearInterval(timerId);
      timerId = null;
    }

    function resumeTimer() {
      if (timerId) return;
      startTimer();
    }

    function resetTimer() {
      pauseTimer();
      timerRemaining = gameDuration;
      updateTimerDisplay();
    }

    function updateTimerDisplay() {
      const el = document.getElementById("timer");
      if (!el) return;
      const mm = String(Math.floor(timerRemaining / 60)).padStart(2, "0");
      const ss = String(timerRemaining % 60).padStart(2, "0");
      el.textContent = `${mm}:${ss}`;
      
      // Change color when time is running out
      if (timerRemaining <= 10) {
        el.style.color = "#FF4081";
        el.style.animation = "pulse 1s infinite";
      } else {
        el.style.color = "";
        el.style.animation = "";
      }
    }

    // Ball control functions
    function pauseAllBalls() {
      const balls = document.querySelectorAll(".ball");
      balls.forEach((b) => {
        if (b._fallInterval) {
          clearInterval(b._fallInterval);
          b._fallInterval = null;
        }
      });
    }

    function resumeAllBalls() {
      const balls = document.querySelectorAll(".ball");
      balls.forEach((b) => {
        if (b._fallInterval) return;
        if (typeof b._tick === "function") {
          b._fallInterval = setInterval(b._tick, 20);
        }
      });
    }

    function removeAllBalls() {
      const balls = document.querySelectorAll(".ball");
      balls.forEach((b) => {
        if (b._fallInterval) clearInterval(b._fallInterval);
        b.remove();
      });
    }

    // Game state functions
    function resetGame() {
      stopSpawning();
      pauseTimer();
      removeAllBalls();
      score = 0;
      caughtCount = 0;
      scoreDisplay.textContent = score;
      document.getElementById("caught").textContent = caughtCount;
      resetTimer();
      isRunning = false;
      
      const modal = document.getElementById("modalOverlay");
      if (modal) modal.classList.add("hidden");
      
      const po = document.getElementById("pauseOverlay");
      if (po) po.classList.add("hidden");
      
      inputEnabled = false;
      document.getElementById("pauseBtn").textContent = "Pause";
      document.getElementById("startBtn").innerHTML = "<span>▶️</span> Start Game";
    }

    function startGame() {
      resetGame();
      score = 0;
      caughtCount = 0;
      scoreDisplay.textContent = score;
      document.getElementById("caught").textContent = caughtCount;
      
      startSpawning();
      startTimer();
      isRunning = true;
      inputEnabled = true;
      document.getElementById("startBtn").innerHTML = "<span>🔄</span> Restart";
    }

    function endGame() {
      stopSpawning();
      pauseTimer();
      isRunning = false;
      inputEnabled = false;
      
      const modal = document.getElementById("modalOverlay");
      const modalCaught = document.getElementById("modalCaught");
      const modalScore = document.getElementById("modalScore");
      
      if (modal && modalCaught && modalScore) {
        modalCaught.textContent = caughtCount;
        modalScore.textContent = score;
        modal.classList.remove("hidden");
      }
      
      document.getElementById("startBtn").innerHTML = "<span>🔄</span> Restart";
    }

    // Button event listeners
    document.getElementById("startBtn").addEventListener("click", () => {
      if (isRunning) {
        resetGame();
        startGame();
      } else {
        startGame();
      }
    });

    document.getElementById("pauseBtn").addEventListener("click", () => {
      if (!isRunning) return;
      
      if (spawnIntervalId) {
        // Pause
        stopSpawning();
        pauseTimer();
        pauseAllBalls();
        
        document.getElementById("pauseOverlay").classList.remove("hidden");
        document.getElementById("pauseBtn").innerHTML = "<span>▶️</span> Resume";
      } else {
        // Resume
        startSpawning();
        resumeTimer();
        resumeAllBalls();
        
        document.getElementById("pauseOverlay").classList.add("hidden");
        document.getElementById("pauseBtn").innerHTML = "<span>⏸️</span> Pause";
        inputEnabled = true;
      }
    });

    // On-screen touch arrow buttons removed; mobile users can drag inside the play area.

    // Modal buttons
    document.getElementById("modalRestart").addEventListener("click", () => {
      document.getElementById("modalOverlay").classList.add("hidden");
      startGame();
    });
    
    document.getElementById("modalClose").addEventListener("click", () => {
      document.getElementById("modalOverlay").classList.add("hidden");
    });

    // Allow clicking the pause overlay to immediately restart the game
    const pauseOverlayEl = document.getElementById("pauseOverlay");
    if (pauseOverlayEl) {
      pauseOverlayEl.addEventListener("click", (e) => {
        // only act if the overlay is visible (i.e. paused)
        if (pauseOverlayEl.classList.contains("hidden")) return;
        // Restart the game from pause
        pauseOverlayEl.classList.add("hidden");
        resetGame();
        startGame();
      });
    }
    // Initialize
    updateTimerDisplay();
 