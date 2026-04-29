
//IMPORTS
import { suffixes } from "./suffixes.js";

// ELEMENTOS DEL DOM
const clicker = document.getElementById("mari-image");
const MariDisplay = document.getElementById("maris-counter");
const tooltip = document.getElementById("tooltip");
const shop = document.getElementById("shop");
const ownedBox = document.getElementById("owned-upgrades");

//Mari Imgs
const Maris = 6;

class ShopItem {
    constructor({
        name,
        cost,
        value,
        image,
        bg,
        growth = 1.15,
        requirement = () => true,
        requirementText = ""
    }) {
        Object.assign(this, {
            name,
            cost,
            value,
            image,
            bg,
            growth,
            requirement,
            requirementText
        });

        this.owned = 0;
        this.purchased = false;
    }

    canBuy(game) {
        return game.maris >= this.cost;
    }

    buy(game) {
        if (!this.canBuy(game)) return false;

        game.maris -= this.cost;
        this.owned++;

        this.onBuy(game);

        this.cost = Math.ceil(this.cost * this.growth);

        game.checkRequirement();

        return true;
    }

    onBuy() { }

    apply() { }

    visible(game) {
        return this.requirement(game);
    }

    getEffectText() {
        return "";
    }
}

class Student extends ShopItem { }
class Building extends ShopItem { }
class Upgrade extends ShopItem { }

class GenMult extends Upgrade {
    apply(data) {
        data.mult *= Math.pow(this.value, this.owned);
    }

    getEffectText() {
        return `x${this.value} Mari pasivamente`;
    }
}

class GenPlus extends Building {
    apply(data) {
        data.base += this.value * this.owned;
    }

    getEffectText() {
        return `+${this.value} Mari pasivamente`;
    }
}

class ClickPlus extends Student {
    apply(data) {
        data.base += this.value * this.owned;
    }

    getEffectText() {
        return `+${this.value} Mari por click`;
    }
}

class ClickMult extends Upgrade {
    apply(data) {
        data.mult *= Math.pow(this.value, this.owned);
    }

    getEffectText() {
        return `x${this.value} Mari por click`;
    }
}

class Interval extends Upgrade {
    onBuy(game) {
        game.loopTime = Math.max(50, game.loopTime * this.value);
        game.loop();
    }

    getEffectText() {
        return `x${1 / this.value} velocidad pasiva`;
    }
}

// ============================
// JUEGO
// ============================
class Game {
    constructor() {
        this.maris = 2000;
        this.clicks = 0;
        this.loopTime = 1000;

        this.mariClick = 1;
        this.mariPerSecond = 0;

        this.activeUpgrades = [];

        this.students = {};
        this.buildings = {};
        this.upgrades = {};

        this.shopCards = {};
        this.studentsCards = {};
        this.buildingCards = {};

        this.initData();
        this.renderShop();
        this.update();

        this.loopId = null;
        this.loop();

        this.fastInterval = null;
        this.fastTimeout = null;
        this.fastCard = null;
    }

    // ========================================
    // DATA
    // ========================================
    initData() {

        this.students.mari = new ClickPlus({
            name: "Mari",
            cost: 10,
            value: 1,
            image: "src/imgs/icons/Mari-icon.png",
            bg: "src/imgs/bgs/trinity.png"
        });

        this.buildings.library = new GenPlus({
            name: "Library",
            cost: 50,
            value: 1,
            image: "src/imgs/icons/Mari-icon.png",
            bg: "src/imgs/bgs/trinity.png"
        });

        this.buildings.plaza = new GenMult({
            name: "Trinity Plaza",
            cost: 300,
            value: 2,
            image: "src/imgs/icons/Mari-icon.png",
            bg: "src/imgs/bgs/trinity.png",
            requirement: g => g.buildings.library.owned >= 1,
            requirementText: "Requires Library"
        });

        this.upgrades.piety = new ClickPlus({
            name: "Piety",
            cost: 100,
            value: 3,
            image: "src/imgs/objs/Piety.png",
            bg: "src/imgs/bgs/trinity.png"
        });

        this.upgrades.corsage = new ClickMult({
            name: "Corsage",
            cost: 500,
            value: 1.5,
            image: "src/imgs/objs/Corsage.png",
            bg: "src/imgs/bgs/trinity.png"
        });

        this.upgrades.tracksuit = new Interval({
            name: "Interval",
            cost: 2000,
            value: 0.5,
            image: "src/imgs/Mari/Tracksuit.png",
            bg: "src/imgs/bgs/trinity.png"
        });
    }

    // ========================================
    // ECONOMÍA
    // ========================================
    calcClick() {
        let data = { base: 1, mult: 1 };

        for (const key in this.students)
            this.students[key].apply(data);

        for (const up of this.activeUpgrades)
            up.apply(data);

        this.mariClick = Math.floor(data.base * data.mult);
    }

    calcGen() {
        let data = { base: 0, mult: 1 };

        for (const key in this.buildings)
            this.buildings[key].apply(data);

        this.mariPerSecond = Math.floor(data.base * data.mult);
    }

    click() {
        this.clicks++;

        this.calcClick();

        this.maris += this.mariClick;

        this.update();

        this.checkRequirement();

        if (this.clicks % 10 === 0) {
            this.AudioPlay("Mari", 0.3);
            this.spawnMari();
        }
        if (this.clicks == 1) {
            this.AudioPlay("Dolce_Bilblioteca", 0.5, true);
        }
    }

    tick() {
        this.calcGen();

        this.maris += this.mariPerSecond;

        this.checkRequirement();

        this.update();
    }

    // ========================================
    // UI
    // ========================================
    update() {
        MariDisplay.innerHTML = `
        Mari's: ${this.format(this.maris)}<br>
        Mari/click: ${this.format(this.mariClick)}<br>
        Mari/sec: ${this.format(this.mariPerSecond)}
        `;

        this.updateShop();
    }

    updateShop() {
        const all = [
            this.shopCards,
            this.studentsCards,
            this.buildingCards
        ];

        for (const storage of all) {
            for (const key in storage) {
                const card = storage[key];
                const item = card.item;

                card.querySelector(".upgrade-cost").textContent =
                    this.format(item.cost) + "$";

                card.querySelector(".upgrade-owned").textContent =
                    "x" + item.owned;
            }
        }
    }

    renderShop() {
        this.stopFastPurchase();
        shop.innerHTML = "";

        this.renderCategory("Students", this.students, this.studentsCards);
        this.renderCategory("Buildings", this.buildings, this.buildingCards);
        this.renderCategory("Upgrades", this.upgrades, this.shopCards, true);
    }

    renderCategory(title, source, storage, single = false) {
        const h = document.createElement("h2");
        h.textContent = title;
        shop.appendChild(h);

        for (const key in source) {
            const item = source[key];

            if (!item.visible(this)) {
                shop.appendChild(this.lockedCard(item));
                continue;
            }

            const card = this.createCard(item, () => {

                if (single) {
                    if (item.purchased) return;

                    if (item.buy(this)) {
                        item.purchased = true;
                        this.activeUpgrades.push(item);
                        delete source[key];
                        this.calcClick();
                        this.calcGen();

                        this.renderOwned();
                        this.renderShop();
                        this.update();
                    }

                    return;
                }

                if (item.buy(this)) {
                    this.calcClick();
                    this.calcGen();
                    this.update();
                }
            });

            card.item = item;
            storage[key] = card;

            shop.appendChild(card);
        }
    }

    stopFastPurchase() {
        clearInterval(this.fastInterval);
        clearTimeout(this.fastTimeout);

        this.fastInterval = null;
        this.fastTimeout = null;

        if (this.fastCard)
            this.fastCard.style.transform = "scale(1)";

        this.fastCard = null;
    }

    createCard(item, buyFn) {
        const card = document.createElement("div");

        card.className = "upgrade-card";
        card.style.backgroundImage = `url(${item.bg})`;

        const hasIcon = !(item instanceof Building);

        if (!hasIcon) card.classList.add("no-icon");

        card.innerHTML = `
        ${hasIcon ? `<img src="${item.image}" class="upgrade-icon">` : ""}
        <div class="upgrade-name">${item.name}</div>
        <div class="upgrade-cost">${item.cost}$</div>
        <div class="upgrade-owned">x${item.owned}</div>
        `;
        // BUY FUNCTION
        card.addEventListener("mousedown", (e) => {
            e.preventDefault();

            this.stopFastPurchase();

            this.fastCard = card;

            card.style.transform = "scale(0.98)";

            buyFn();

            this.fastTimeout = setTimeout(() => {
                this.fastInterval = setInterval(() => {
                    buyFn();
                }, 60);
            }, 220);
        });

        card.addEventListener("mouseup", () => {
            this.stopFastPurchase();
            card.style.transform = "scale(1.02)";
        });

        card.addEventListener("mouseleave", () => {
            this.stopFastPurchase();
            card.style.transform = "scale(1)";
        });

        card.addEventListener("mouseenter", () => {
            card.style.transform = "scale(1.02)";
        });

        // Tooltip
        this.tooltip(card, item);

        return card;
    }

    lockedCard(item) {
        const div = document.createElement("div");
        div.className = "locked-card";

        div.innerHTML = `
        <div>???</div>
        <small>${item.requirementText}</small>
        `;

        return div;
    }

    renderOwned() {
        ownedBox.innerHTML = "";

        for (const up of this.activeUpgrades) {
            const img = document.createElement("img");
            img.src = up.image;
            img.title = up.name;
            this.tooltip(img, up);

            ownedBox.appendChild(img);
        }
    }

    tooltip(card, item) {
        card.addEventListener("mouseenter", () => {
            tooltip.textContent = item.getEffectText();
            tooltip.style.opacity = 1;
        });

        card.addEventListener("mouseleave", () => {
            tooltip.style.opacity = 0;
        });

        card.addEventListener("mousemove", (e) => {
            tooltip.style.left = e.clientX + 15 + "px";
            tooltip.style.top = e.clientY + 15 + "px";
        });

        if (item instanceof Upgrade) {
            card.addEventListener("click", () => {
                tooltip.style.opacity = 0;
            });
        }
    }

    checkRequirement() {
        const sources = [
            this.students,
            this.buildings,
            this.upgrades
        ];

        for (const group of sources) {
            for (const key in group) {
                const item = group[key];

                if (item.visible(this) && !item.unlocked) {
                    item.unlocked = true;
                    this.renderShop();
                    this.update();
                    return;
                }
            }
        }
    }
    // ========================================
    // FX
    // ========================================
    spawnMari() {
        if (!this.mariPool) this.mariPool = [];
        if (this.mariIndex === undefined) this.mariIndex = 0;

        let img;

        // Reusar imagen existente si hay pool
        if (this.mariPool.length < 100) {
            img = document.createElement("img");
            img.className = "RanMari";

            img.style.position = "fixed";
            img.style.pointerEvents = "none";
            img.style.willChange = "transform, opacity";
            img.style.transition = "opacity 0.5s ease";

            document.body.appendChild(img);
            this.mariPool.push(img);
        }

        img = this.mariPool[this.mariIndex];
        this.mariIndex = (this.mariIndex + 1) % this.mariPool.length;

        // Reset rápido
        img.style.transition = "none";
        img.style.opacity = "1";

        img.src = `src/imgs/Chibi/Mari-${(Math.random() * Maris) | 0}.png`;

        // 50% probabilidad de espejear horizontalmente
        img.style.transform = Math.random() < 0.5
            ? "scaleX(-1)"
            : "scaleX(1)";

        const x = Math.random() * (window.innerWidth - 100);
        const y = Math.random() * (window.innerHeight - 100);

        img.style.left = x + "px";
        img.style.top = y + "px";

        // Forzar repaint limpio
        img.offsetHeight;

        img.style.transition = "opacity 0.5s ease";

        setTimeout(() => {
            img.style.opacity = "0";
        }, 750);
    }

    AudioPlay(audio, volume = 0.5, loop = false) {
        let audioElement = document.createElement("audio");
        audioElement.src = `src/aud/${audio}.ogg`;
        audioElement.volume = volume;
        audioElement.loop = loop;
        audioElement.play();
    }

    // ========================================
    // LOOP
    // ========================================
    loop() {
        clearInterval(this.loopId);

        this.loopId = setInterval(() => {
            this.tick();
        }, this.loopTime);
    }

    // ========================================
    // FORMAT
    // ========================================
    format(number) {
        if (number < 1000)
            return Math.floor(number);

        if (number === Infinity || number > Number.MAX_VALUE)
            return "∞";

        let tier = Math.floor(Math.log10(number) / 3) - 1;
        tier = Math.min(tier, suffixes.length - 1);

        const scale = 10 ** ((tier + 1) * 3);
        const value = number / scale;

        return value.toFixed(2).replace(/\.00$/, "") + suffixes[tier];
    }
}


// ============================
// INSTANCIA
// ============================
const game = new Game();
const Bgs = 2

document.body.style.backgroundImage = `url('src/imgs/bgs/bg${Math.floor(Math.random() * Bgs) + 1}.png')`;

// ============================
// EVENTOS Y ANIMACIONES
// ============================
clicker.onclick = () => game.click();
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
