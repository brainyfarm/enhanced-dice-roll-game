class DiceRoller {
  constructor() {
    this.dice1 = document.getElementById('dice1');
    this.dice2 = document.getElementById('dice2');
    this.rollButton = document.getElementById('rollButton');
    this.rollHistory = document.getElementById('rollHistory');
    this.totalRolls = document.getElementById('totalRolls');
    this.averageRoll = document.getElementById('averageRoll');
    this.isRolling = false;
    this.history = [];
    this.stats = {
      total: 0,
      count: 0
    };
    
    this.setupDiceFaces();
    this.setupEventListeners();
    this.addKeyboardSupport();
    this.resetDicePositions();
  }

  setupDiceFaces() {
    const dotConfigurations = {
      1: [[2, 2]],
      2: [[1, 1], [3, 3]],
      3: [[1, 1], [2, 2], [3, 3]],
      4: [[1, 1], [1, 3], [3, 1], [3, 3]],
      5: [[1, 1], [1, 3], [2, 2], [3, 1], [3, 3]],
      6: [[1, 1], [1, 2], [1, 3], [3, 1], [3, 2], [3, 3]]
    };

    [this.dice1, this.dice2].forEach(dice => {
      // Set up each face with its dots
      const faces = dice.querySelectorAll('.face');
      faces.forEach((face, index) => {
        const dotsContainer = face.querySelector('.dots-container');
        const value = index === 0 ? 1 : // front
                     index === 1 ? 6 : // back
                     index === 2 ? 2 : // top
                     index === 3 ? 5 : // bottom
                     index === 4 ? 3 : // right
                     4;                 // left
        
        dotConfigurations[value].forEach(([row, col]) => {
          const dot = document.createElement('div');
          dot.className = 'dot';
          dot.style.gridRow = row;
          dot.style.gridColumn = col;
          dotsContainer.appendChild(dot);
        });
      });
    });
  }

  resetDicePositions() {
    [this.dice1, this.dice2].forEach(dice => {
      dice.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
      dice.style.transform = 'rotateX(0) rotateY(0) rotateZ(0)';
    });
  }

  updateStats(roll1, roll2) {
    this.stats.count++;
    this.stats.total += (roll1 + roll2);
    
    this.totalRolls.textContent = this.stats.count;
    this.averageRoll.textContent = (this.stats.total / (this.stats.count * 2)).toFixed(1);
  }

  setupEventListeners() {
    this.rollButton.addEventListener('click', () => this.roll());
    
    [this.dice1, this.dice2].forEach(dice => {
      dice.addEventListener('mouseover', () => {
        if (!this.isRolling) {
          this.animateHover(dice, true);
        }
      });
      
      dice.addEventListener('mouseout', () => {
        if (!this.isRolling) {
          this.animateHover(dice, false);
        }
      });
    });

    window.addEventListener('resize', () => this.handleResize());
  }

  handleResize() {
    if (!this.isRolling) {
      this.resetDicePositions();
    }
  }

  animateHover(dice, isHover) {
    if (this.isRolling) return;
    
    dice.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    if (isHover) {
      const randomX = (Math.random() - 0.5) * 15;
      const randomY = (Math.random() - 0.5) * 15;
      dice.style.transform = `scale(1.1) rotateX(${randomX}deg) rotateY(${randomY}deg)`;
    } else {
      dice.style.transform = 'scale(1) rotateX(0) rotateY(0)';
    }
  }

  addKeyboardSupport() {
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && !this.isRolling) {
        e.preventDefault();
        this.roll();
        this.rollButton.classList.add('active');
      }
    });
    
    document.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        this.rollButton.classList.remove('active');
      }
    });
  }

  getRandomRotations(value) {
    // Precise rotations for each face to ensure correct orientation
    const faceRotations = {
      1: { x: 0, y: 0, z: 0 },          // Front face (default)
      2: { x: 270, y: 0, z: 0 },        // Top face
      3: { x: 0, y: 270, z: 0 },        // Right face
      4: { x: 0, y: 90, z: 0 },         // Left face
      5: { x: 90, y: 0, z: 0 },         // Bottom face
      6: { x: 180, y: 0, z: 0 }         // Back face
    };

    const targetRotation = faceRotations[value];
    const spins = Math.floor(Math.random() * 2) + 2; // 2-3 full spins

    return {
      x: targetRotation.x + (spins * 360),
      y: targetRotation.y + (spins * 360),
      z: 0 // Keep z rotation 0 to maintain orientation
    };
  }

  animateDice(dice, value) {
    return new Promise(resolve => {
      const rotations = this.getRandomRotations(value);
      const duration = 2000;
      const jumpHeight = 50;

      // Initial position
      dice.style.transition = 'none';
      dice.style.transform = 'translateY(0) rotateX(0) rotateY(0) rotateZ(0)';
      dice.offsetHeight;

      // Jump up
      dice.style.transition = 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)';
      dice.style.transform = `translateY(-${jumpHeight}px)`;

      setTimeout(() => {
        // Spin and fall
        dice.style.transition = `all ${duration}ms cubic-bezier(0.2, 0.8, 0.3, 1)`;
        const spinTransform = `translateY(0) rotateX(${rotations.x}deg) rotateY(${rotations.y}deg)`;
        dice.style.transform = spinTransform;

        // Add shake effect
        this.shakeAnimation(dice, duration, spinTransform);

        // Land on correct face
        setTimeout(() => {
          const finalRotation = this.getFinalRotation(value);
          dice.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
          dice.style.transform = finalRotation;
          resolve();
        }, duration);
      }, 200);
    });
  }

  getFinalRotation(value) {
    // Direct mapping to ensure correct face shows
    const finalRotations = {
      1: 'rotateX(0deg) rotateY(0deg) rotateZ(0deg)',
      2: 'rotateX(270deg) rotateY(0deg) rotateZ(0deg)',
      3: 'rotateX(0deg) rotateY(270deg) rotateZ(0deg)',
      4: 'rotateX(0deg) rotateY(90deg) rotateZ(0deg)',
      5: 'rotateX(90deg) rotateY(0deg) rotateZ(0deg)',
      6: 'rotateX(180deg) rotateY(0deg) rotateZ(0deg)'
    };
    
    return finalRotations[value];
  }

  shakeAnimation(dice, duration, baseTransform) {
    let start = performance.now();
    
    const shake = () => {
      const elapsed = performance.now() - start;
      if (elapsed < duration) {
        const progress = elapsed / duration;
        const decay = Math.pow(1 - progress, 2);
        const offsetX = (Math.random() - 0.5) * 8 * decay;
        const offsetY = (Math.random() - 0.5) * 8 * decay;
        
        dice.style.transform = `${baseTransform} translate(${offsetX}px, ${offsetY}px)`;
        requestAnimationFrame(shake);
      }
    };
    requestAnimationFrame(shake);
  }

  async roll() {
    if (this.isRolling) return;
    this.isRolling = true;

    this.rollButton.disabled = true;
    this.rollButton.style.opacity = '0.7';
    this.rollButton.style.transform = 'scale(0.95)';
    document.body.style.cursor = 'wait';

    const roll1 = Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / (0xffffffff / 6)) + 1;
    const roll2 = Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / (0xffffffff / 6)) + 1;

    try {
      await Promise.all([
        this.animateDice(this.dice1, roll1),
        this.animateDice(this.dice2, roll2)
      ]);

      this.updateStats(roll1, roll2);
      this.addToHistory(roll1, roll2);
    } catch (error) {
      console.error('Error during dice roll:', error);
    } finally {
      this.rollButton.disabled = false;
      this.rollButton.style.opacity = '1';
      this.rollButton.style.transform = 'scale(1)';
      document.body.style.cursor = 'default';
      this.isRolling = false;
    }
  }

  resetDiceToValue(dice, value) {
    dice.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    dice.style.transform = this.getFinalRotation(value);
  }

  addToHistory(roll1, roll2) {
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    
    const timestamp = new Date().toLocaleTimeString();
    historyItem.innerHTML = `
      <span class="roll-timestamp">${timestamp}</span>
      <span class="roll-numbers">
        <span class="dice-result">${roll1}</span> + 
        <span class="dice-result">${roll2}</span> = 
        <span class="total-result">${roll1 + roll2}</span>
      </span>
    `;
    
    // Set initial state for animation
    historyItem.style.opacity = '0';
    historyItem.style.transform = 'translateY(-20px) scale(0.9)';
    
    // Insert at the beginning
    if (this.rollHistory.firstChild) {
      this.rollHistory.insertBefore(historyItem, this.rollHistory.firstChild);
    } else {
      this.rollHistory.appendChild(historyItem);
    }
    
    // Force reflow
    historyItem.offsetHeight;
    
    // Animate entrance
    historyItem.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    historyItem.style.opacity = '1';
    historyItem.style.transform = 'translateY(0) scale(1)';
    
    // Manage history limit
    this.history.unshift({ roll1, roll2, timestamp: Date.now() });
    
    while (this.rollHistory.children.length > 10) {
      const lastChild = this.rollHistory.lastChild;
      lastChild.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      lastChild.style.opacity = '0';
      lastChild.style.transform = 'translateY(20px) scale(0.8)';
      
      setTimeout(() => {
        lastChild.remove();
      }, 300);
      
      this.history.pop();
    }
  }
}

// Initialize the game
const diceGame = new DiceRoller();
  