// ============================
// ELEMENTOS DEL DOM
// ============================
const clicker = document.getElementById("mari-image");
const MariDisplay = document.getElementById("maris-counter");

// ============================
// CLASE BASE DE MEJORA
// ============================
class Upgrade {
    constructor(name, cost, value, image, growth = 1.5) {
        this.name = name;
        this.cost = cost;
        this.value = value;
        this.growth = growth;
        this.image = image;
        this.owned = 0;
    }

    canBuy(game) {
        return game.maris >= this.cost;
    }

    buy(game) {
        if (!this.canBuy(game)) return false;

        game.maris -= this.cost;
        this.owned++;
        this.onBuy(game);

        this.cost = Math.floor(this.cost * this.growth);
        return true;
    }

    onBuy(game) {
        // opcional override
    }

    apply(game) {
        // opcional override
    }

    getLabel() {
        return `${this.name} (Cost: ${this.cost}, Owned: ${this.owned})`;
    }
}

// ============================
// SUMA AL CLICK
// ============================
class AddUpgrade extends Upgrade {
    apply(game) {
        game.baseClick += this.value * this.owned;
    }
}

// ============================
// MULTIPLICADOR
// ============================
class MultiplyUpgrade extends Upgrade {
    apply(game) {
        if (this.owned > 0) {
            game.multiplier *= Math.pow(this.value, this.owned);
        }
    }
}

// ============================
// BONUS CRÍTICO
// ============================
class CritUpgrade extends Upgrade {
    apply(game) {
        if (this.owned > 0) {
            const chance = 0.10 * this.owned;

            if (Math.random() < chance) {
                game.baseClick *= 5;
            }
        }
    }
}

// ============================
// JUEGO
// ============================
class Game {
    constructor() {
        this.maris = 0;

        this.upgrades = {
            mari: new AddUpgrade("Mari", 10, 1, "images/Mari-icon.png"),
            piety: new AddUpgrade("Piety", 50, 5, "images/Piety.png"),
            corsage: new MultiplyUpgrade("Corsage", 100, 2, "images/Corsage.png"),
        };
    }

    click() {
        let clickData = {
            baseClick: 1,
            multiplier: 1
        };

        for (let key in this.upgrades) {
            this.upgrades[key].apply(clickData);
        }

        let earned = clickData.baseClick * clickData.multiplier;

        if (earned <= 0) earned = 1;

        this.maris += Math.floor(earned);

        this.updateDisplay();
    }

    buyUpgrade(id) {
        const upgrade = this.upgrades[id];

        if (!upgrade) return;

        if (upgrade.buy(this)) {
            this.updateDisplay();
        }
    }

    updateDisplay() {
        this.renderShop();
        MariDisplay.innerHTML = `Maris: ${this.maris}`;
    }

    renderShop() {
        const shop = document.getElementById("shop");
        shop.innerHTML = "";

        for (let key in this.upgrades) {
            const up = this.upgrades[key];

            const card = document.createElement("div");
            card.className = "upgrade-card";

            card.innerHTML = `
            <img src="${up.image}" class="upgrade-icon">

            <div class="upgrade-name">${up.name}</div>

            <div class="upgrade-cost">💰 ${up.cost}</div>

            <div class="upgrade-owned">x${up.owned}</div>
        `;

            card.addEventListener("click", () => {
                up.buy(this);
                this.updateDisplay();
                card.style.transform = "scale(0.95)";

                setTimeout(() => {
                    card.style.transform = "scale(1)";
                }, 100);
            });

            shop.appendChild(card);
        }
    }
}

// ============================
// INSTANCIA
// ============================
const game = new Game();
game.updateDisplay();

// ============================
// EVENTOS CLICKER
// ============================
clicker.addEventListener("click", () => {
    game.click();
});

clicker.addEventListener("mouseleave", () => {
    clicker.style.transform = "scale(1)";
});

clicker.addEventListener("mouseover", () => {
    clicker.style.transform = "scale(1.03)";
});

clicker.addEventListener("mousedown", () => {
    clicker.style.transform = "scale(0.95)";
});

clicker.addEventListener("mouseup", () => {
    clicker.style.transform = "scale(1)";
});
