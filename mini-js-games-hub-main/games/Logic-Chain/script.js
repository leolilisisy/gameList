    // Enhanced Logic Chain Simulation
    const board = document.getElementById("game-board");
    const startBtn = document.getElementById("start");
    const resetBtn = document.getElementById("reset");
    const clearBtn = document.getElementById("clear");
    const statusEl = document.getElementById("status");
    const progressBar = document.getElementById("progress-bar");
    
    let objects = [];
    let isSimulating = false;
    let objectCount = 0;
    let connections = [];

    // --- Object creation ---
    document.querySelectorAll(".palette-object").forEach(obj => {
      obj.addEventListener("dragstart", dragStart);
    });

    board.addEventListener("dragover", e => e.preventDefault());
    board.addEventListener("drop", drop);

    function dragStart(e) {
      e.dataTransfer.setData("type", e.target.dataset.type);
      e.dataTransfer.setData("source", "palette");
    }

    function drop(e) {
      if (isSimulating) return;
      
      e.preventDefault();
      const type = e.dataTransfer.getData("type");
      const source = e.dataTransfer.getData("source");
      
      if (source === "palette") {
        createObject(type, e.clientX, e.clientY);
      } else {
        // Moving existing object
        const id = e.dataTransfer.getData("id");
        const obj = document.getElementById(id);
        const rect = board.getBoundingClientRect();
        obj.style.left = e.clientX - rect.left - parseInt(obj.style.width || obj.offsetWidth) / 2 + "px";
        obj.style.top = e.clientY - rect.top - parseInt(obj.style.height || obj.offsetHeight) / 2 + "px";
        
        updateConnections();
      }
    }

    function createObject(type, clientX, clientY) {
      const rect = board.getBoundingClientRect();
      const id = `obj-${objectCount++}`;
      const obj = document.createElement("div");
      
      obj.id = id;
      obj.className = `object ${type}`;
      obj.draggable = true;
      obj.dataset.type = type;
      
      // Set position
      const width = type === 'gate' ? 80 : type === 'switch' ? 70 : type === 'connector' ? 20 : 50;
      const height = type === 'gate' ? 30 : type === 'switch' ? 40 : type === 'connector' ? 20 : 50;
      
      obj.style.left = clientX - rect.left - width/2 + "px";
      obj.style.top = clientY - rect.top - height/2 + "px";
      obj.style.width = width + "px";
      obj.style.height = height + "px";
      
      // Add inner content based on type
      if (type === 'switch') {
        const knob = document.createElement("div");
        knob.className = "switch-knob";
        obj.appendChild(knob);
      } else if (type === 'gate') {
        obj.textContent = "CLOSED";
      }
      
      // Add event listeners
      obj.addEventListener("dragstart", function(e) {
        e.dataTransfer.setData("type", type);
        e.dataTransfer.setData("id", id);
        e.dataTransfer.setData("source", "board");
      });
      
      obj.addEventListener("dblclick", function() {
        if (isSimulating) return;
        if (type === 'connector') {
          obj.remove();
          updateConnections();
        }
      });
      
      board.appendChild(obj);
      objects.push({id, type, element: obj});
      updateStatus(`Added ${type} to the board`);
    }

    // --- Connection logic ---
    function updateConnections() {
      // Remove existing connection lines
      document.querySelectorAll('.connector-line').forEach(line => line.remove());
      connections = [];
      
      // Find all connectors
      const connectors = objects.filter(obj => obj.type === 'connector');
      
      connectors.forEach(connector => {
        const connectorEl = connector.element;
        const connectorRect = connectorEl.getBoundingClientRect();
        const connectorX = connectorRect.left + connectorRect.width/2;
        const connectorY = connectorRect.top + connectorRect.height/2;
        
        // Find the closest objects to connect to
        let closestObj1 = null, closestObj2 = null;
        let minDist1 = Infinity, minDist2 = Infinity;
        
        objects.forEach(obj => {
          if (obj.id === connector.id || obj.type === 'connector') return;
          
          const objRect = obj.element.getBoundingClientRect();
          const objX = objRect.left + objRect.width/2;
          const objY = objRect.top + objRect.height/2;
          
          const dist = Math.sqrt((objX - connectorX)**2 + (objY - connectorY)**2);
          
          if (dist < minDist1) {
            minDist2 = minDist1;
            closestObj2 = closestObj1;
            minDist1 = dist;
            closestObj1 = obj;
          } else if (dist < minDist2) {
            minDist2 = dist;
            closestObj2 = obj;
          }
        });
        
        if (closestObj1 && closestObj2) {
          // Create connection line
          const obj1Rect = closestObj1.element.getBoundingClientRect();
          const obj2Rect = closestObj2.element.getBoundingClientRect();
          
          const x1 = obj1Rect.left + obj1Rect.width/2;
          const y1 = obj1Rect.top + obj1Rect.height/2;
          const x2 = obj2Rect.left + obj2Rect.width/2;
          const y2 = obj2Rect.top + obj2Rect.height/2;
          
          const length = Math.sqrt((x2-x1)**2 + (y2-y1)**2);
          const angle = Math.atan2(y2-y1, x2-x1) * 180 / Math.PI;
          
          const line = document.createElement("div");
          line.className = "connector-line";
          line.style.width = length + "px";
          line.style.left = x1 + "px";
          line.style.top = y1 + "px";
          line.style.transform = `rotate(${angle}deg)`;
          
          board.appendChild(line);
          
          // Store connection
          connections.push({
            from: closestObj1.id,
            to: closestObj2.id,
            through: connector.id
          });
        }
      });
    }

    // --- Simulation logic ---
    startBtn.addEventListener("click", runSimulation);
    resetBtn.addEventListener("click", resetGame);
    clearBtn.addEventListener("click", clearBoard);

    function runSimulation() {
      if (isSimulating) return;
      
      isSimulating = true;
      updateStatus("Simulation running...");
      progressBar.style.width = "0%";
      
      // Find the ball, switch and gate
      const ball = objects.find(obj => obj.type === 'ball');
      const sw = objects.find(obj => obj.type === 'switch');
      const gate = objects.find(obj => obj.type === 'gate');
      
      if (!ball || !sw || !gate) {
        updateStatus("❌ You need at least a ball, switch and gate to run the simulation");
        isSimulating = false;
        return;
      }
      
      // Check if they're connected
      const ballToSwitch = connections.find(conn => 
        (conn.from === ball.id && conn.to === sw.id) || 
        (conn.from === sw.id && conn.to === ball.id)
      );
      
      const switchToGate = connections.find(conn => 
        (conn.from === sw.id && conn.to === gate.id) || 
        (conn.from === gate.id && conn.to === sw.id)
      );
      
      if (!ballToSwitch || !switchToGate) {
        updateStatus("❌ Objects need to be connected with connectors");
        isSimulating = false;
        return;
      }
      
      // Start the simulation
      ball.element.classList.add("ball-rolling", "active");
      progressBar.style.width = "33%";
      
      // Simulate ball rolling to switch
      setTimeout(() => {
        ball.element.classList.remove("ball-rolling", "active");
        sw.element.classList.add("active", "pulse");
        progressBar.style.width = "66%";
        updateStatus("Ball reached the switch!");
      }, 1500);
      
      // Switch activates gate
      setTimeout(() => {
        sw.element.classList.remove("pulse");
        const knob = sw.element.querySelector('.switch-knob');
        if (knob) knob.style.transform = "translateX(30px)";
        
        gate.element.classList.add("active", "open");
        gate.element.textContent = "OPEN";
        progressBar.style.width = "100%";
        updateStatus("Switch activated the gate!");
      }, 2500);
      
      // Completion
      setTimeout(() => {
        gate.element.classList.remove("active");
        updateStatus("✅ Chain completed! The gate is open!");
        isSimulating = false;
      }, 3500);
    }

    function resetGame() {
      isSimulating = false;
      
      // Reset all objects
      objects.forEach(obj => {
        const element = obj.element;
        element.classList.remove("active", "ball-rolling", "pulse", "open");
        
        if (obj.type === 'switch') {
          const knob = element.querySelector('.switch-knob');
          if (knob) knob.style.transform = "translateX(0)";
        } else if (obj.type === 'gate') {
          element.textContent = "CLOSED";
        }
      });
      
      progressBar.style.width = "0%";
      updateStatus("Simulation reset. Rearrange objects and try again!");
    }

    function clearBoard() {
      if (isSimulating) return;
      
      // Remove all objects from board
      document.querySelectorAll('.object').forEach(obj => {
        if (!obj.parentElement.isSameNode(document.getElementById('objects-palette'))) {
          obj.remove();
        }
      });
      
      // Remove connection lines
      document.querySelectorAll('.connector-line').forEach(line => line.remove());
      
      objects = [];
      connections = [];
      objectCount = 0;
      updateStatus("Board cleared. Add new objects to create a chain.");
    }

    function updateStatus(message) {
      statusEl.textContent = message;
    }

    // Initialize with some objects
    window.addEventListener('load', () => {
      // Create initial objects
      const rect = board.getBoundingClientRect();
      
      createObject('ball', rect.left + 100, rect.top + 100);
      createObject('switch', rect.left + 300, rect.top + 150);
      createObject('gate', rect.left + 500, rect.top + 100);
      createObject('connector', rect.left + 200, rect.top + 120);
      createObject('connector', rect.left + 400, rect.top + 120);
      
      setTimeout(updateConnections, 100);
    });
