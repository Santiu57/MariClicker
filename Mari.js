
//IMPORTS
import { suffixes } from "./src/js/utils/suffixes.js";

// ELEMENTOS DEL DOM
const clicker = document.getElementById("mari-image");
const MariDisplay = document.getElementById("maris-counter");
const tooltip = document.getElementById("tooltip");
const shop = document.getElementById("shop");
const ownedBox = document.getElementById("owned-upgrades");
const outfitsBox = document.getElementById("outfits");

//Mari Imgs
const Maris = 6;

class ShopItem {
    constructor({
        id,
        name,
        cost,
        value,
        image,
        bg,
        growth = 1.15,
        requirementchild = null,
        showRequirement = () => true,
        requirement = () => true,
        requirementText = `Requires ${requirementchild ? requirementchild.name : "???"}`
    }) {
        Object.assign(this, {
            id,
            name,
            cost,
            value,
            image,
            bg,
            growth,
            showRequirement,
            requirementchild,
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

    canShow(game) {
        return this.showRequirement(game);
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
        game.loopTime = game.loopTime * this.value;
        game.loop();
    }

    getEffectText() {
        return `x${1 / this.value} velocidad pasiva`;
    }
}

class Tracksuit extends Interval {
    onBuy(game) {
        super.onBuy(game);

        game.unlockOutfit("Tracksuit", "src/imgs/Mari/Tracksuit.png", "src/imgs/icons/Mari-track.png");
    }
}

class Idol extends Interval {
    onBuy(game) {
        super.onBuy(game);

        game.unlockOutfit("Idol", "src/imgs/Mari/Idol.png", "src/imgs/icons/Mari-idol.png");
    }
}

// ============================
// JUEGO
// ============================
class Game {
    constructor() {
        this.maris = 20000;
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

        this.unlockedOutfits = [];
    }

    // ========================================
    // DATA
    // ========================================
    initData() {
        //Students
        this.students.mari = new ClickPlus({
            name: "Mari",
            id: "mari",
            cost: 10,
            value: 1,
            image: "src/imgs/icons/Mari.png",
            bg: "src/imgs/bgs/trinity.png",
        });

        //Buildings
        this.buildings.library = new GenPlus({
            name: "Library",
            id: "library",
            cost: 50,
            value: 1,
            bg: "src/imgs/bgs/trinity.png",
        });

        this.buildings.plaza = new GenPlus({
            name: "Trinity Plaza",
            id: "plaza",
            cost: 150,
            value: 3,
            bg: "src/imgs/bgs/trinity.png",
            requirement: g => g.buildings.library.owned >= 1,
            requirementchild: this.buildings.library,
            growth: 1.2
        });

        //Upgrades
        this.upgrades.piety = new ClickMult({
            name: "Piety",
            id: "piety",
            cost: 500,
            value: 1.5,
            image: "src/imgs/objs/Piety.png",
            bg: "src/imgs/bgs/trinity.png",
            requirement: g => g.students.mari.owned >= 1,
            requirementchild: this.students.mari,
        });

        this.upgrades.corsage = new ClickMult({
            name: "Innocent Corsage",
            id: "corsage",
            cost: 1000,
            value: 2,
            image: "src/imgs/objs/Corsage.png",
            bg: "src/imgs/bgs/trinity.png",
            requirement: g => g.activeUpgrades.some(u => u.id === "piety"),
            requirementchild: this.upgrades.piety,
        });

        this.upgrades.tracksuit = new Tracksuit({
            name: "Tracksuit",
            id: "tracksuit",
            cost: 2000,
            value: 0.2,
            image: "src/imgs/Mari/Tracksuit.png",
            bg: "src/imgs/bgs/trinity.png",
        });

        this.upgrades.idol = new Idol({
            name: "Idol Costume",
            id: "idol",
            cost: 5000,
            value: 0.2,
            image: "src/imgs/icons/idol-costume.png",
            bg: "src/imgs/bgs/trinity.png",
        });

        this.upgrades[`idol0`] = new Interval({
            name: "Idol Costume",
            id: `idol0`,
            cost: 5000,
            value: 0.00000000000001,
            image: "src/imgs/icons/idol-costume.png",
            bg: "src/imgs/bgs/trinity.png",
        });

        this.upgrades[`idol1`] = new Interval({
            name: "Idol Costume",
            id: `idol1`,
            cost: 5000,
            value: 0.00000000000001,
            image: "src/imgs/icons/idol-costume.png",
            bg: "src/imgs/bgs/trinity.png",
        });

        for (let i = 2; i < 30; i++) {
            this.upgrades[`idol${i}`] = new Interval({
                name: "Idol Costume",
                id: `idol${i}`,
                cost: 5000,
                value: 0.00000000000001,
                image: "src/imgs/icons/idol-costume.png",
                bg: "src/imgs/bgs/trinity.png",
                requirement: g => g.activeUpgrades.some(u => u.id === `idol${i - 1}`),
                requirementchild: this.upgrades[`idol${i - 1}`],
                showRequirement: g => g.activeUpgrades.some(u => u.id === `idol${i - 2}`),
            });
        }
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

        this.mariPerSecond = Math.floor((data.base * data.mult) * (1 / this.loopTime * 1000));
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
        <div class="mc-main">${this.format(this.maris)}</div>

        <div class="mc-sub">
            <div>
                <span>Per Click</span>
                <strong>${this.format(this.mariClick)}</strong>
            </div>
            <div>
                <span>Per Sec</span>
                <strong>${this.format(this.mariPerSecond)}</strong>
            </div>
        </div>
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

            if (!item.canShow(this)) continue;

            if (!item.visible(this)) {
                const card = this.createCard(item, () => { });
                card.classList.add("locked");

                const overlay = document.createElement("div");
                overlay.className = "locked-overlay";

                const showRealRequirement = (() => {
                    // Si depende de otro item
                    if (item.requirementchild) {
                        return item.requirementchild.unlocked;
                    }

                    // Si no tiene dependencia explícita, se puede mostrar
                    return true;
                })();

                overlay.innerHTML = `
                    <div class="locked-text">
                        🔒<br>
                        ${showRealRequirement ? item.requirementText : "???"}
                    </div>
                `;

                card.appendChild(overlay);
                shop.appendChild(card);
                continue;
            }

            const card = this.createCard(item, () => {

                if (single) {
                    if (item.purchased) return;

                    if (item.buy(this)) {
                        tooltip.style.opacity = 0;

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

        const isLocked = !item.unlocked;

        card.innerHTML = `
        ${hasIcon ? `<img src="${item.image}" class="upgrade-icon">` : ""}
        <div class="upgrade-name">${isLocked ? "???" : item.name}</div>
        <div class="upgrade-cost">${isLocked ? "???" : item.cost + "$"}</div>
        <div class="upgrade-owned">${isLocked ? "" : "x" + item.owned}</div>
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
        let changed = false;

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
                    changed = true;
                }
            }
        }

        if (changed) {
            this.renderShop();
            this.update();
        }
    }
    unlockOutfit(name, image, icon) {
        this.unlockedOutfits.push({ name, image, icon });
        this.renderOutfits();
    }
    renderOutfits() {
        outfitsBox.innerHTML = "";

        for (const skin of this.unlockedOutfits) {
            const img = document.createElement("img");

            img.src = skin.icon;
            img.title = skin.name;

            img.onclick = () => {
                clicker.src = skin.image;
            };

            outfitsBox.appendChild(img);
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
const Bgs = 6

document.body.style.backgroundImage = `url('src/imgs/bgs/bg${Math.floor(Math.random() * Bgs) + 1}.png')`;

game.unlockOutfit("Nun", "src/imgs/Mari/Nun.png", "src/imgs/icons/Mari.png");
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
