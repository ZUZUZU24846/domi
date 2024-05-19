document.addEventListener('DOMContentLoaded', function() {
    loadExpansions();
    loadUnusedCards();
    document.getElementById('saveSelection').addEventListener('change', saveSelections);
});

let selectedExpansions = [];
let unusedCards = {};
let selectedCards = new Set();

function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablink");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

function loadExpansions() {
    fetch('cards.json')
        .then(response => response.json())
        .then(data => {
            const expansionList = document.getElementById('expansionList');
            data.forEach(expansion => {
                const label = document.createElement('label');
                label.innerHTML = `<input type="checkbox" id="expansion-${expansion.name}" onchange="toggleExpansion('${expansion.name}')"> ${expansion.name}`;
                expansionList.appendChild(label);
            });
        });
}

function toggleExpansion(expansionName) {
    const checkbox = document.getElementById(`expansion-${expansionName}`);
    if (checkbox.checked) {
        selectedExpansions.push(expansionName);
    } else {
        selectedExpansions = selectedExpansions.filter(name => name !== expansionName);
    }
}

function loadUnusedCards() {
    fetch('cards.json')
        .then(response => response.json())
        .then(data => {
            const unusedCardsDiv = document.getElementById('unusedCards');
            data.forEach(expansion => {
                const expansionDiv = document.createElement('div');
                expansionDiv.innerHTML = `<strong>${expansion.name}</strong>`;
                expansion.cards.forEach(card => {
                    const label = document.createElement('label');
                    label.innerHTML = `<input type="checkbox" id="unused-${card.name}" onchange="toggleUnusedCard('${expansion.name}', '${card.name}')"> ${card.name}`;
                    expansionDiv.appendChild(label);
                });
                unusedCardsDiv.appendChild(expansionDiv);
            });
        });
}

function toggleUnusedCard(expansionName, cardName) {
    if (!unusedCards[expansionName]) {
        unusedCards[expansionName] = [];
    }
    const index = unusedCards[expansionName].indexOf(cardName);
    if (index === -1) {
        unusedCards[expansionName].push(cardName);
    } else {
        unusedCards[expansionName].splice(index, 1);
    }
}

function reroll() {
    selectedCards.clear();
    const cardListDiv = document.getElementById('cardList');
    cardListDiv.innerHTML = '';
    fetch('cards.json')
        .then(response => response.json())
        .then(data => {
            const cards = [];
            data.forEach(expansion => {
                if (selectedExpansions.includes(expansion.name)) {
                    expansion.cards.forEach(card => {
                        if (!unusedCards[expansion.name] || !unusedCards[expansion.name].includes(card.name)) {
                            cards.push(card);
                        }
                    });
                }
            });
            cards.sort((a, b) => a.cost - b.cost);
            const selectedCardsArray = [];
            while (selectedCardsArray.length < 10 && cards.length > 0) {
                const randomIndex = Math.floor(Math.random() * cards.length);
                const selectedCard = cards.splice(randomIndex, 1)[0];
                if (!selectedCards.has(selectedCard.name)) {
                    selectedCards.add(selectedCard.name);
                    selectedCardsArray.push(selectedCard);
                }
            }
            selectedCardsArray.forEach(card => {
                const cardDiv = document.createElement('div');
                cardDiv.innerHTML = `(${card.cost}) ${card.name} ${card.expansion}`;
                cardDiv.classList.add('card-item');
                cardDiv.addEventListener('click', () => {
                    cardDiv.classList.toggle('selected-card');
                });
                cardListDiv.appendChild(cardDiv);
            });
        });
}

function selectReroll() {
    const cardListDiv = document.getElementById('cardList');
    const selectedDivs = cardListDiv.getElementsByClassName('selected-card');
    const selectedCardNames = [];
    for (let div of selectedDivs) {
        const cardText = div.innerText;
        const cardName = cardText.match(/\d\) (.*?) /)[1];
        selectedCardNames.push(cardName);
        selectedCards.delete(cardName);
    }

    fetch('cards.json')
        .then(response => response.json())
        .then(data => {
            const cards = [];
            data.forEach(expansion => {
                if (selectedExpansions.includes(expansion.name)) {
                    expansion.cards.forEach(card => {
                        if (!unusedCards[expansion.name] || !unusedCards[expansion.name].includes(card.name)) {
                            cards.push(card);
                        }
                    });
                }
            });
            cards.sort((a, b) => a.cost - b.cost);
            const newSelectedCards = [];
            selectedCardNames.forEach(cardName => {
                let newCard;
                do {
                    const randomIndex = Math.floor(Math.random() * cards.length);
                    newCard = cards[randomIndex];
                } while (selectedCards.has(newCard.name) || selectedCardNames.includes(newCard.name));
                selectedCards.add(newCard.name);
                newSelectedCards.push(newCard);
            });
            for (let div of selectedDivs) {
                cardListDiv.removeChild(div);
            }
            newSelectedCards.forEach(card => {
                const cardDiv = document.createElement('div');
                cardDiv.innerHTML = `(${card.cost}) ${card.name} ${card.expansion}`;
                cardDiv.classList.add('card-item');
                cardDiv.addEventListener('click', () => {
                    cardDiv.classList.toggle('selected-card');
                });
                cardListDiv.appendChild(cardDiv);
            });
        });
}

function toggleUnusedCards() {
    const unusedCardsDiv = document.getElementById('unusedCards');
    if (unusedCardsDiv.style.display === 'none') {
        unusedCardsDiv.style.display = 'block';
    } else {
        unusedCardsDiv.style.display = 'none';
    }
}
