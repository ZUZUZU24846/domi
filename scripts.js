document.addEventListener('DOMContentLoaded', () => {
    loadExpansions();
    loadCards();
    loadSavedSelection();
});

let selectedCards = [];
let unusedCards = {};

function openTab(evt, tabName) {
    const tabcontent = document.querySelectorAll('.tabcontent');
    tabcontent.forEach(tab => tab.style.display = 'none');

    const tablinks = document.querySelectorAll('.tablink');
    tablinks.forEach(tab => tab.classList.remove('active'));

    document.getElementById(tabName).style.display = 'block';
    evt.currentTarget.classList.add('active');
}

function loadExpansions() {
    fetch('cards.json')
        .then(response => response.json())
        .then(data => {
            const expansionList = document.getElementById('expansionList');
            const unusedCardsContainer = document.getElementById('unusedCards');
            data.forEach(expansion => {
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `expansion-${expansion.name}`;
                checkbox.value = expansion.name;
                checkbox.onchange = saveSelection;

                const label = document.createElement('label');
                label.htmlFor = `expansion-${expansion.name}`;
                label.textContent = expansion.name;

                const div = document.createElement('div');
                div.appendChild(checkbox);
                div.appendChild(label);

                expansionList.appendChild(div);

                const unusedDiv = document.createElement('div');
                const unusedLabel = document.createElement('label');
                unusedLabel.textContent = expansion.name;
                unusedDiv.appendChild(unusedLabel);

                const cardList = document.createElement('div');
                cardList.id = `unused-cards-${expansion.name}`;
                expansion.cards.forEach(card => {
                    const cardCheckbox = document.createElement('input');
                    cardCheckbox.type = 'checkbox';
                    cardCheckbox.id = `unused-${card.name}`;
                    cardCheckbox.value = card.name;
                    cardCheckbox.onchange = () => toggleUnusedCard(expansion.name, card.name);

                    const cardLabel = document.createElement('label');
                    cardLabel.htmlFor = `unused-${card.name}`;
                    cardLabel.textContent = card.name;

                    const cardDiv = document.createElement('div');
                    cardDiv.appendChild(cardCheckbox);
                    cardDiv.appendChild(cardLabel);

                    cardList.appendChild(cardDiv);
                });

                unusedDiv.appendChild(cardList);
                unusedCardsContainer.appendChild(unusedDiv);
            });
        });
}

function loadCards() {
    reroll();
}

function reroll() {
    fetch('cards.json')
        .then(response => response.json())
        .then(data => {
            const selectedExpansions = Array.from(document.querySelectorAll('#expansionList input:checked')).map(cb => cb.value);
            const cards = data
                .filter(expansion => selectedExpansions.includes(expansion.name))
                .flatMap(expansion => expansion.cards)
                .filter(card => !(unusedCards[card.expansion] && unusedCards[card.expansion].includes(card.name)));

            selectedCards = [];
            while (selectedCards.length < 10 && cards.length > 0) {
                const randomIndex = Math.floor(Math.random() * cards.length);
                const [selectedCard] = cards.splice(randomIndex, 1);
                selectedCards.push(selectedCard);
            }

            selectedCards.sort((a, b) => a.cost - b.cost);

            const cardList = document.getElementById('cardList');
            cardList.innerHTML = '';
            selectedCards.forEach(card => {
                const cardDiv = document.createElement('div');
                cardDiv.textContent = `(${card.cost}) ${card.name}　${card.expansion}`;
                cardDiv.onclick = () => toggleSelectedCard(card.name);
                cardList.appendChild(cardDiv);
            });
        });
}

function selectReroll() {
    const selected = selectedCards.filter(card => card.selected);
    const selectedNames = selected.map(card => card.name);

    fetch('cards.json')
        .then(response => response.json())
        .then(data => {
            const selectedExpansions = Array.from(document.querySelectorAll('#expansionList input:checked')).map(cb => cb.value);
            const cards = data
                .filter(expansion => selectedExpansions.includes(expansion.name))
                .flatMap(expansion => expansion.cards)
                .filter(card => !(unusedCards[card.expansion] && unusedCards[card.expansion].includes(card.name)) && !selectedNames.includes(card.name));

            selected.forEach(card => {
                const randomIndex = Math.floor(Math.random() * cards.length);
                const [newCard] = cards.splice(randomIndex, 1);
                Object.assign(card, newCard);
            });

            selectedCards.sort((a, b) => a.cost - b.cost);

            const cardList = document.getElementById('cardList');
            cardList.innerHTML = '';
            selectedCards.forEach(card => {
                const cardDiv = document.createElement('div');
                cardDiv.textContent = `(${card.cost}) ${card.name}　${card.expansion}`;
                cardDiv.onclick = () => toggleSelectedCard(card.name);
                cardList.appendChild(cardDiv);
            });
        });
}

function toggleSelectedCard(cardName) {
    const card = selectedCards.find(card => card.name === cardName);
    if (card) {
        card.selected = !card.selected;
    }
}

function toggleUnusedCards() {
    const unusedCardsContainer = document.getElementById('unusedCards');
    unusedCardsContainer.style.display = unusedCardsContainer.style.display === 'none' ? 'block' : 'none';
}

function toggleUnusedCard(expansion, cardName) {
    if (!unusedCards[expansion]) {
        unusedCards[expansion] = [];
    }

    const index = unusedCards[expansion].indexOf(cardName);
    if (index === -1) {
        unusedCards[expansion].push(cardName);
    } else {
        unusedCards[expansion].splice(index, 1);
    }
    saveSelection();
}

function saveSelection() {
    if (document.getElementById('saveSelection').checked) {
        const selectedExpansions = Array.from(document.querySelectorAll('#expansionList input:checked')).map(cb => cb.value);
        localStorage.setItem('selectedExpansions', JSON.stringify(selectedExpansions));
        localStorage.setItem('unusedCards', JSON.stringify(unusedCards));
    } else {
        localStorage.removeItem('selectedExpansions');
        localStorage.removeItem('unusedCards');
    }
}

function loadSavedSelection() {
    const savedExpansions = JSON.parse(localStorage.getItem('selectedExpansions'));
    if (savedExpansions) {
        savedExpansions.forEach(expansion => {
            const checkbox = document.getElementById(`expansion-${expansion}`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
    }

    unusedCards = JSON.parse(localStorage.getItem('unusedCards')) || {};
    for (const [expansion, cards] of Object.entries(unusedCards)) {
        cards.forEach(card => {
            const checkbox = document.getElementById(`unused-${card}`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
    }
}
