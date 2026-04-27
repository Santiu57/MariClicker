// ============================
// ELEMENTOS DEL DOM
// ============================
const clicker = document.getElementById("mari-image");
const MariDisplay = document.getElementById("maris-counter");

//Mari Imgs
const Maris = [
    "Mari-0.png",
];

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
            game.baseClick *= this.value * this.owned;
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
        this.clicks = 0;

        this.upgrades = {
            mari: new AddUpgrade("Mari", 10, 1, "src/imgs/Mari-icon.png"),
            piety: new AddUpgrade("Piety", 50, 5, "src/imgs/Piety.png", 1.7),
            corsage: new MultiplyUpgrade("Innocent Corsage", 100, 1, "src/imgs/Corsage.png", 2.7),
        };
    }

    click() {
        this.clicks++;
        let clickData = {
            baseClick: 1,
            multiplier: 1
        };

        for (let key in this.upgrades) {
            this.upgrades[key].apply(clickData);
        }

        let earned = clickData.baseClick * clickData.multiplier;

        if (this.clicks % 10 === 0) {
            this.AudioPlay("Mari", 0.3);
            this.MariShow();
        }
        if (this.clicks === 1) {
            game.AudioPlay("Dolce_Bilblioteca", 0.3, true);
        }

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

            <div class="upgrade-cost">${up.cost}$</div>

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

    AudioPlay(audio, volume = 0.5, loop = false) {
        let audioElement = document.createElement("audio");
        audioElement.src = `src/aud/${audio}.ogg`;
        audioElement.volume = volume;
        audioElement.loop = loop;
        audioElement.play();
    }

    MariShow() {
        let img = document.createElement("img");
        img.src = `src/imgs/Mari/${Maris[Math.random() * Maris.length | 0]}`;
        img.className = "RanMari";
        img.style.left = Math.random() * (window.innerWidth - 100) + "px";
        img.style.top = Math.random() * (window.innerHeight - 100) + "px";
        document.body.appendChild(img);

        setTimeout(() => {
            img.style.transition = "opacity 0.5s ease";
            img.style.opacity = "0";
        }, 1000);
        setTimeout(() => {
            img.remove();
        }, 1500);

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
