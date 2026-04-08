class ChromaCascade {
    constructor() {
        this.level = 1;
        this.score = 0;
        this.timeLeft = 60;
        this.timer = null;
        this.activeColor = null;
        this.mixedColor = null;
        this.targetHarmony = [];
        this.canvasColors = [];
        this.harmonies = [
            {
                name: "Monochromatic",
                colors: 3,
                generator: this.generateMonochromatic.bind(this)
            },
            {
                name: "Analogous",
                colors: 4,
                generator: this.generateAnalogous.bind(this)
            },
            {
                name: "Complementary",
                colors: 3,
                generator: this.generateComplementary.bind(this)
            },
            {
                name: "Triadic",
                colors: 5,
                generator: this.generateTriadic.bind(this)
            },
            {
                name: "Tetradic",
                colors: 6,
                generator: this.generateTetradic.bind(this)
            }
        ];

        this.initializeGame();
        this.setupEventListeners();
    }

    initializeGame() {
        this.updateDisplay();
        this.generateTargetHarmony();
        this.createColorPalette();
        this.generateNewDroplet();
        this.startTimer();
    }

    generateTargetHarmony() {
        const harmonyType = this.harmonies[Math.min(this.level - 1, this.harmonies.length - 1)];
        this.targetHarmony = harmonyType.generator();

        const targetColorsElement = document.getElementById('targetColors');
        const harmonyNameElement = document.getElementById('harmonyName');

        targetColorsElement.innerHTML = '';
        harmonyNameElement.textContent = harmonyType.name;

        this.targetHarmony.forEach(color => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = color;
            targetColorsElement.appendChild(swatch);
        });

        const artCanvas = document.getElementById('artCanvas');
        artCanvas.innerHTML = '';
        const slotCount = Math.max(harmonyType.colors, this.targetHarmony.length);
        this.canvasColors = new Array(slotCount).fill(null);

        for (let i = 0; i < slotCount; i++) {
            const slot = document.createElement('div');
            slot.className = 'canvas-slot';
            slot.dataset.index = i;
            artCanvas.appendChild(slot);
        }
    }

    generateMonochromatic() {
        const baseHue = Math.random() * 360;
        const colors = [];
        
        for (let i = 0; i < 3; i++) {
            const saturation = 70 + Math.random() * 20;
            const lightness = 30 + (i * 20);
            colors.push(`hsl(${baseHue}, ${saturation}%, ${lightness}%)`);
        }
        
        return colors;
    }

    generateAnalogous() {
        const baseHue = Math.random() * 360;
        const colors = [];
        const hues = [baseHue - 30, baseHue - 15, baseHue, baseHue + 15];
        
        hues.forEach(hue => {
            const normalizedHue = (hue + 360) % 360;
            colors.push(`hsl(${normalizedHue}, 70%, 50%)`);
        });
        
        return colors;
    }

    generateComplementary() {
        const baseHue = Math.random() * 360;
        const complementaryHue = (baseHue + 180) % 360;
        
        return [
            `hsl(${baseHue}, 80%, 50%)`,
            `hsl(${complementaryHue}, 80%, 50%)`,
            `hsl(${baseHue}, 60%, 70%)`
        ];
    }

    generateTriadic() {
        const baseHue = Math.random() * 360;
        const hues = [baseHue, (baseHue + 120) % 360, (baseHue + 240) % 360];
        const colors = [];
        
        hues.forEach(hue => {
            colors.push(`hsl(${hue}, 80%, 50%)`);
        });
        
    colors.push(`hsl(${baseHue}, 60%, 70%)`);
    colors.push(`hsl(${(baseHue + 120) % 360}, 60%, 70%)`);
        
        return colors;
    }

    generateTetradic() {
        const baseHue = Math.random() * 360;
        const hues = [
            baseHue,
            (baseHue + 90) % 360,
            (baseHue + 180) % 360,
            (baseHue + 270) % 360
        ];
        const colors = [];
        
        hues.forEach(hue => {
            colors.push(`hsl(${hue}, 80%, 50%)`);
            colors.push(`hsl(${hue}, 60%, 65%)`);
        });
        
        return colors.slice(0, 6);
    }

    createColorPalette() {
        const palette = document.getElementById('colorPalette');
        palette.innerHTML = '';
        
        const baseColors = [
            'hsl(0, 100%, 50%)',
            'hsl(120, 100%, 50%)',
            'hsl(240, 100%, 50%)',
            'hsl(60, 100%, 50%)',
            'hsl(300, 100%, 50%)'
        ];
        
        baseColors.forEach(color => {
            const colorElement = document.createElement('div');
            colorElement.className = 'palette-color';
            colorElement.style.backgroundColor = color;
            colorElement.addEventListener('click', () => this.selectColor(color));
            palette.appendChild(colorElement);
        });
    }

    selectColor(color) {
        this.activeColor = color;
        const activeDroplet = document.getElementById('activeDroplet');
        activeDroplet.style.backgroundColor = color;
        
        activeDroplet.classList.remove('new');
        void activeDroplet.offsetWidth;
        activeDroplet.classList.add('new');
    }

    generateNewDroplet() {
        const hue = Math.random() * 360;
        const color = `hsl(${hue}, 80%, 50%)`;
        this.selectColor(color);
    }

    mixColors(color1, color2) {
        const rgb1 = this.hslToRgb(color1);
        const rgb2 = this.hslToRgb(color2);
        
        const mixedRgb = [
            Math.round((rgb1[0] + rgb2[0]) / 2),
            Math.round((rgb1[1] + rgb2[1]) / 2),
            Math.round((rgb1[2] + rgb2[2]) / 2)
        ];
        
        return this.rgbToHsl(...mixedRgb);
    }

    hslToRgb(hsl) {
        const match = hsl.match(/hsl\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)%,\s*(\d+(?:\.\d+)?)%\)/);
        if (!match) return [0, 0, 0];
        const h = parseFloat(match[1]) / 360;
        const s = parseFloat(match[2]) / 100;
        const l = parseFloat(match[3]) / 100;
        
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            
            h /= 6;
        }
        
        return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
    }

    addToCanvas() {
        if (!this.mixedColor) {
            if (this.activeColor) {
                this.mixedColor = this.activeColor;
            } else {
                return;
            }
        }
        let emptySlot = document.querySelector('.canvas-slot:not(.filled)');
        const artCanvas = document.getElementById('artCanvas');
        if (!emptySlot) {
            const newIndex = this.canvasColors.length;
            const slot = document.createElement('div');
            slot.className = 'canvas-slot';
            slot.dataset.index = newIndex;
            artCanvas.appendChild(slot);
            this.canvasColors.push(null);
            emptySlot = slot;
        }

        if (emptySlot) {
            emptySlot.style.backgroundColor = this.mixedColor;
            emptySlot.classList.add('filled');

            const index = Number(emptySlot.dataset.index);
            if (!Number.isNaN(index)) {
                this.canvasColors[index] = this.mixedColor;
            }

            this.checkCompletion();
            this.mixedColor = null;
            const resultColorEl = document.querySelector('.result-color');
            if (resultColorEl) resultColorEl.style.backgroundColor = '';
        }
    }

    checkCompletion() {
        let matches = 0;
    const tolerance = 30;
        
        this.canvasColors.forEach((color, index) => {
            if (color && this.targetHarmony[index]) {
                if (this.colorsMatch(color, this.targetHarmony[index], tolerance)) {
                    matches++;
                }
            }
        });
        
        if (matches === this.targetHarmony.length) {
            this.levelComplete();
        }
    }

    colorsMatch(color1, color2, tolerance) {
        const hsl1 = this.parseHsl(color1);
        const hsl2 = this.parseHsl(color2);
        
        return (
            Math.abs(hsl1.h - hsl2.h) <= tolerance &&
            Math.abs(hsl1.s - hsl2.s) <= 20 &&
            Math.abs(hsl1.l - hsl2.l) <= 20
        );
    }

    parseHsl(hsl) {
        const match = hsl.match(/hsl\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)%,\s*(\d+(?:\.\d+)?)%\)/);
        if (!match) return { h: 0, s: 0, l: 0 };
        return {
            h: parseFloat(match[1]),
            s: parseFloat(match[2]),
            l: parseFloat(match[3])
        };
    }

    levelComplete() {
        clearInterval(this.timer);
        
        const timeBonus = Math.floor(this.timeLeft * 2);
        const levelBonus = this.level * 100;
        const totalScore = this.score + timeBonus + levelBonus;
        
        document.getElementById('finalScore').textContent = totalScore;
        document.getElementById('colorsMatched').textContent = this.targetHarmony.length;
        
        this.showGameOver();
    }

    showGameOver() {
        document.getElementById('gameOver').classList.add('active');
    }

    nextLevel() {
        this.level++;
        this.timeLeft = 60 + (this.level * 5);
        this.score += 100 * this.level;
        
        document.getElementById('gameOver').classList.remove('active');
        this.initializeGame();
    }

    startTimer() {
        clearInterval(this.timer);
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            
            if (this.timeLeft <= 10) {
                document.getElementById('timer').classList.add('timer-warning');
            }
            
            if (this.timeLeft <= 0) {
                clearInterval(this.timer);
                this.gameOver();
            }
        }, 1000);
    }

    gameOver() {
        alert('Time\'s up! Try again.');
        this.initializeGame();
    }

    updateDisplay() {
        document.getElementById('level').textContent = this.level;
        document.getElementById('score').textContent = this.score;
        document.getElementById('timer').textContent = this.timeLeft;
    }

    setupEventListeners() {
    const mixingArea = document.querySelector('.color-dropper');
        const resultArea = document.querySelector('.mix-result');
        
        mixingArea.addEventListener('dragover', (e) => e.preventDefault());
        mixingArea.addEventListener('drop', (e) => {
            e.preventDefault();
            if (this.activeColor) {
                this.mixedColor = this.activeColor;
                document.querySelector('.result-color').style.backgroundColor = this.mixedColor;
            }
        });

        resultArea.addEventListener('dragover', (e) => e.preventDefault());
        resultArea.addEventListener('drop', (e) => {
            e.preventDefault();
            if (this.activeColor && this.mixedColor) {
                const newColor = this.mixColors(this.activeColor, this.mixedColor);
                this.mixedColor = newColor;
                document.querySelector('.result-color').style.backgroundColor = newColor;
            }
        });

        document.getElementById('newDroplet').addEventListener('click', () => {
            this.generateNewDroplet();
        });

        document.getElementById('addToCanvas').addEventListener('click', () => {
            this.addToCanvas();
        });

        document.getElementById('clearCanvas').addEventListener('click', () => {
            this.canvasColors = [];
            document.querySelectorAll('.canvas-slot').forEach(slot => {
                slot.style.backgroundColor = '';
                slot.classList.remove('filled');
            });
        });

        document.getElementById('hint').addEventListener('click', () => {
            const emptySlot = document.querySelector('.canvas-slot:not(.filled)');
            if (emptySlot) {
                const index = parseInt(emptySlot.dataset.index);
                emptySlot.style.backgroundColor = this.targetHarmony[index];
                emptySlot.classList.add('filled');
                this.canvasColors[index] = this.targetHarmony[index];
                this.score = Math.max(0, this.score - 50);
                this.updateDisplay();
                this.checkCompletion();
            }
        });

        document.getElementById('continue').addEventListener('click', () => {
            this.nextLevel();
        });

    const activeDroplet = document.getElementById('activeDroplet');
        activeDroplet.setAttribute('draggable', 'true');
        
        activeDroplet.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', 'color');
            activeDroplet.classList.add('dragging');
        });
        
        activeDroplet.addEventListener('dragend', () => {
            activeDroplet.classList.remove('dragging');
        });
    }
}

window.addEventListener('load', () => {
    new ChromaCascade();
});