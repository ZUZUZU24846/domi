document.addEventListener('DOMContentLoaded', function() {
    loadExpansions();
    loadUnusedCards();
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
                expansionDiv.classList.add('expansion-section');
                const expansionTitle = document.createElement('strong');
                expansionTitle.innerText = expansion.name;
                expansionDiv.appendChild(expansionTitle);
                expansion.cards.forEach(card => {
                    const label = document.createElement('label');
                    label.innerHTML = `<input type="checkbox" id="unused-${card.name}" onchange="toggleUnusedCard('${expansion.name}', '${card.name}')"> ${card.name}`;
                    label.classList.add('card-item');
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
            const selectedCardsArray = selectRandomCards(cards, 10);
            selectedCardsArray.forEach(card => {
                addCardToList(cardListDiv, card);
            });
        });
}

function selectReroll() {
    const cardListDiv = document.getElementById('cardList');
    const selectedDivs = cardListDiv.getElementsByClassName('selected-card');
    const selectedCardNames = [];
    while (selectedDivs.length > 0) {
        const div = selectedDivs[0];
        const cardText = div.innerText;
        const cardName = cardText.match(/\d\) (.*?) /)[1];
        selectedCardNames.push(cardName);
        selectedCards.delete(cardName);
        cardListDiv.removeChild(div);
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
            const newSelectedCards = selectRandomCards(cards, selectedCardNames.length);
            newSelectedCards.forEach(card => {
                addCardToList(cardListDiv, card);
            });
        });
}

function selectRandomCards(cards, count) {
    const selectedCardsArray = [];
    while (selectedCardsArray.length < count && cards.length > 0) {
        const randomIndex = Math.floor(Math.random() * cards.length);
        const selectedCard = cards.splice(randomIndex, 1)[0];
        if (!selectedCards.has(selectedCard.name)) {
            selectedCards.add(selectedCard.name);
            selectedCardsArray.push(selectedCard);
        }
    }
    return selectedCardsArray.sort((a, b) => {
        const aCost = parseCost(a.cost);
        const bCost = parseCost(b.cost);
        return aCost - bCost || (a.cost > b.cost ? 1 : -1);
    });
}

function parseCost(cost) {
    return parseInt(cost.replace(/\D/g, ''), 10) || 0;
}

function addCardToList(cardListDiv, card) {
    const cardDiv = document.createElement('div');
    cardDiv.innerHTML = `(${card.cost}) ${card.name} ${card.expansion}`;
    cardDiv.classList.add('card-item');
    cardDiv.addEventListener('click', () => {
        cardDiv.classList.toggle('selected-card');
    });
    cardListDiv.appendChild(cardDiv);
}

function toggleUnusedCards() {
    const unusedCardsDiv = document.getElementById('unusedCards');
    if (unusedCardsDiv.style.display === 'none') {
        unusedCardsDiv.style.display = 'block';
    } else {
        unusedCardsDiv.style.display = 'none';
    }
}
