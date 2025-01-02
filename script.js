document.getElementById('rollButton').addEventListener('click', function () {
    const dice1Value = rollDice('dice1');
    const dice2Value = rollDice('dice2');
    const total = dice1Value + dice2Value;
  
    let resultText = `You rolled a ${total}! `;
    if (total === 7 || total === 11) {
      resultText += '🎉 You Win! 🎉';
    } else {
      resultText += 'Try Again!';
    }
  
    document.getElementById('result').textContent = resultText;
  });
  
  function rollDice(diceId) {
    const dice = document.getElementById(diceId);
    const value = Math.floor(Math.random() * 6) + 1;
  
    dice.innerHTML = ''; // Clear previous dots
    const dotPositions = [
      [4], // 1
      [0, 8], // 2
      [0, 4, 8], // 3
      [0, 2, 6, 8], // 4
      [0, 2, 4, 6, 8], // 5
      [0, 2, 3, 5, 6, 8], // 6
    ];
  
    dotPositions[value - 1].forEach((pos) => {
      const dot = document.createElement('div');
      dot.className = 'dot';
      dice.appendChild(dot);
    });
  
    return value;
  }
  