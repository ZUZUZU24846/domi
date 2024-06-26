let cards = []; // cards.jsonから読み込んだカードデータ
let selectedCards = []; // 現在選ばれているカード
let expansions = {}; // 拡張セットとそのチェック状態

// DOMが完全に読み込まれた後に実行
document.addEventListener('DOMContentLoaded', () => {
    fetchCards();
});

// cards.jsonをフェッチしてcards変数にデータを保存
function fetchCards() {
    fetch('cards.json')
        .then(response => response.json())
        .then(data => {
            data.forEach(set => {
                expansions[set.expansion] = true;
                set.cards.forEach(card => {
                    cards.push({...card, expansion: set.expansion});
                });
            });
            populateExpansionList();
            selectedCards = getRandomCards(10);
            sortCardsByCost();
            displayCards();
        });
}

// カードリストを表示
function displayCards() {
    const cardList = document.getElementById('cardList');
    cardList.innerHTML = '';
    selectedCards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.textContent = `(${card.cost}) ${card.name} (${card.expansion})`;
        cardElement.className = 'card-item';
        if (card.selected) {
            cardElement.classList.add('selected-card');
        }
        cardElement.onclick = () => toggleCardSelection(card);
        cardList.appendChild(cardElement);
    });
}

// カード選択状態をトグル
function toggleCardSelection(card) {
    card.selected = !card.selected;
    displayCards();
}

// リロールボタンが押された時の処理
function reroll() {
    selectedCards = getRandomCards(10);
    sortCardsByCost();
    displayCards();
}

// 選択リロールボタンが押された時の処理
function selectReroll() {
    const selected = selectedCards.filter(card => card.selected);
    const count = selected.length;
    selectedCards = selectedCards.filter(card => !card.selected);
    const newCards = getRandomCards(count, selectedCards);
    selectedCards.push(...newCards);
    sortCardsByCost();
    displayCards();
}

// ランダムにカードを取得
function getRandomCards(count, exclude = []) {
    const filteredCards = cards.filter(card => !exclude.includes(card) && expansions[card.expansion]);
    const shuffled = filteredCards.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// コスト順にカードをソート
function sortCardsByCost() {
    selectedCards.sort((a, b) => parseCost(a.cost) - parseCost(b.cost));
}

// コストをパース
function parseCost(cost) {
    if (typeof cost === 'number') return cost;
    if (cost.includes('+')) {
        const parts = cost.split('+');
        return parseInt(parts[0]) + parts.length - 1;
    }
    if (cost.includes('*')) {
        return parseInt(cost.replace('*', ''));
    }
    return parseInt(cost.replace('P', ''));
}

// タブの表示を切り替える
function openTab(evt, tabName) {
    const tabcontent = document.getElementsByClassName('tabcontent');
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = 'none';
    }
    const tablinks = document.getElementsByClassName('tablink');
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(' active', '');
    }
    document.getElementById(tabName).style.display = 'block';
    evt.currentTarget.className += ' active';
}

// 拡張セットのチェックボックスを表示
function populateExpansionList() {
    const expansionList = document.getElementById('expansionList');
    for (const [expansion, checked] of Object.entries(expansions)) {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = checked;
        checkbox.onchange = () => toggleExpansion(expansion);
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(expansion));
        expansionList.appendChild(label);
    }
}

// 拡張セットの選択をトグル
function toggleExpansion(expansion) {
    expansions[expansion] = !expansions[expansion];
}
