import {
    AUDIO_CONFIG,
    CLICKER_SCALE,
    DOM_IDS,
    FAST_PURCHASE_CONFIG,
    FX_CONFIG,
    GAME_CONFIG,
    INITIAL_OUTFIT,
    PATHS,
    UI_CONFIG,
} from "./constants.js";
import { createShopData } from "./shop-data.js";
import { Building, Upgrade } from "./shop-items.js";
import { format } from "./suffixes.js";

const clicker = document.getElementById(DOM_IDS.CLICKER);
const mariDisplay = document.getElementById(DOM_IDS.MARI_DISPLAY);
const tooltip = document.getElementById(DOM_IDS.TOOLTIP);
const shop = document.getElementById(DOM_IDS.SHOP);
const ownedBox = document.getElementById(DOM_IDS.OWNED_UPGRADES);
const outfitsBox = document.getElementById(DOM_IDS.OUTFITS);

class Game {
    constructor() {
        this.maris = GAME_CONFIG.INITIAL_MARIS;
        this.clicks = GAME_CONFIG.INITIAL_CLICKS;
        this.loopTime = GAME_CONFIG.INITIAL_LOOP_TIME_MS;

        this.mariClick = GAME_CONFIG.BASE_CLICK_VALUE;
        this.mariPerSecond = GAME_CONFIG.BASE_GENERATION_VALUE;

        this.activeUpgrades = [];

        this.students = {};
        this.buildings = {};
        this.upgrades = {};

        this.shopCards = {};
        this.studentsCards = {};
        this.buildingCards = {};

        this.loopId = null;
        this.fastInterval = null;
        this.fastTimeout = null;
        this.fastCard = null;

        this.unlockedOutfits = [];
        this.mariPool = [];
        this.mariIndex = FX_CONFIG.INITIAL_POOL_INDEX;

        this.initData();
        this.unlockAvailableItems();
        this.renderShop();
        this.update();
        this.loop();
    }

    initData() {
        const { students, buildings, upgrades } = createShopData();

        this.students = students;
        this.buildings = buildings;
        this.upgrades = upgrades;
    }

    calcClick() {
        const data = {
            base: GAME_CONFIG.BASE_CLICK_VALUE,
            mult: GAME_CONFIG.BASE_MULTIPLIER,
        };

        for (const key in this.students) {
            this.students[key].apply(data);
        }

        for (const upgrade of this.activeUpgrades) {
            upgrade.apply(data);
        }

        this.mariClick = Math.floor(data.base * data.mult);
    }

    calcGen() {
        const data = {
            base: GAME_CONFIG.BASE_GENERATION_VALUE,
            mult: GAME_CONFIG.BASE_MULTIPLIER,
        };

        for (const key in this.buildings) {
            this.buildings[key].apply(data);
        }

        const ticksPerSecond = GAME_CONFIG.SECONDS_IN_MS / this.loopTime;
        this.mariPerSecond = Math.floor(data.base * data.mult * ticksPerSecond);
    }

    click() {
        this.clicks++;
        this.calcClick();

        this.maris += this.mariClick;

        this.update();
        this.checkRequirement();

        if (this.clicks % FX_CONFIG.MARI_SPAWN_EVERY_CLICKS === FX_CONFIG.SPAWN_CLICK_REMAINDER) {
            this.audioPlay("Mari", AUDIO_CONFIG.MARI_VOLUME);
            this.spawnMari();
        }

        if (this.clicks === FX_CONFIG.FIRST_CLICK) {
            this.audioPlay("Dolce_Bilblioteca", AUDIO_CONFIG.MUSIC_VOLUME, true);
        }
    }

    tick() {
        this.calcGen();
        this.maris += this.mariPerSecond;

        this.checkRequirement();
        this.update();
    }

    update() {
        mariDisplay.innerHTML = `
        <div class="mc-main">${format(this.maris)}</div>

        <div class="mc-sub">
            <div>
                <span>Per Click</span>
                <strong>${format(this.mariClick)}</strong>
            </div>
            <div>
                <span>Per Sec</span>
                <strong>${format(this.mariPerSecond)}</strong>
            </div>
        </div>
    `;

        this.updateShop();
    }

    updateShop() {
        const cardGroups = [
            this.shopCards,
            this.studentsCards,
            this.buildingCards,
        ];

        for (const storage of cardGroups) {
            for (const key in storage) {
                const card = storage[key];
                const item = card.item;

                card.querySelector(".upgrade-cost").textContent = `${format(item.cost)}$`;
                card.querySelector(".upgrade-owned").textContent = `x${item.owned}`;
            }
        }
    }

    renderShop() {
        this.stopFastPurchase();
        shop.innerHTML = "";
        this.shopCards = {};
        this.studentsCards = {};
        this.buildingCards = {};

        this.renderCategory("Students", this.students, this.studentsCards);
        this.renderCategory("Buildings", this.buildings, this.buildingCards);
        this.renderCategory("Upgrades", this.upgrades, this.shopCards, true);
    }

    renderCategory(title, source, storage, single = false) {
        const heading = document.createElement("h2");
        heading.textContent = title;
        shop.appendChild(heading);

        for (const key in source) {
            const item = source[key];

            if (!item.canShow(this)) continue;

            if (!item.visible(this)) {
                shop.appendChild(this.createLockedCard(item));
                continue;
            }

            const card = this.createCard(item, () => {
                if (single) {
                    this.buySingleItem(source, key, item);
                    return;
                }

                this.buyRepeatableItem(item);
            });

            card.item = item;
            storage[key] = card;

            shop.appendChild(card);
        }
    }

    buySingleItem(source, key, item) {
        if (item.purchased) return;

        if (!item.buy(this)) return;

        tooltip.style.opacity = UI_CONFIG.HIDDEN_OPACITY;
        item.purchased = true;
        this.activeUpgrades.push(item);
        delete source[key];

        this.recalculateEconomy();
        this.renderOwned();
        this.renderShop();
        this.update();
    }

    buyRepeatableItem(item) {
        if (!item.buy(this)) return;

        this.recalculateEconomy();
        this.update();
    }

    recalculateEconomy() {
        this.calcClick();
        this.calcGen();
    }

    stopFastPurchase() {
        clearInterval(this.fastInterval);
        clearTimeout(this.fastTimeout);

        this.fastInterval = null;
        this.fastTimeout = null;

        if (this.fastCard) {
            this.fastCard.style.transform = FAST_PURCHASE_CONFIG.NORMAL_SCALE;
        }

        this.fastCard = null;
    }

    createLockedCard(item) {
        const card = this.createCard(item, () => { });
        card.classList.add("locked");

        const overlay = document.createElement("div");
        overlay.className = "locked-overlay";

        const showRealRequirement = item.requirementchild
            ? item.requirementchild.unlocked
            : true;

        overlay.innerHTML = `
            <div class="locked-text">
                🔒<br>
                ${showRealRequirement ? item.getRequirementText() : "???"}
            </div>
        `;

        card.appendChild(overlay);

        return card;
    }

    createCard(item, buyFn) {
        const card = document.createElement("div");
        const hasIcon = !(item instanceof Building);
        const isLocked = !item.unlocked;
        const bgImage = item.bg?.image ?? item.bg;
        const labelBackground = item.bg?.background ?? "#efbf9bb8";
        const labelBorder = item.bg?.border ?? "2px solid #F8BF94";

        card.className = "upgrade-card";
        card.style.backgroundImage = `url(${bgImage})`;
        card.style.setProperty("--upgrade-label-bg", labelBackground);
        card.style.setProperty("--upgrade-label-border", labelBorder);
        card.style.border = labelBorder;

        if (!hasIcon) {
            card.classList.add("no-icon");
        }

        card.innerHTML = `
        ${hasIcon ? `<img src="${item.image}" class="upgrade-icon">` : ""}
        <div class="upgrade-name">${isLocked ? "???" : item.name}</div>
        <div class="upgrade-cost">${isLocked ? "???" : `${item.cost}$`}</div>
        <div class="upgrade-owned">${isLocked ? "" : `x${item.owned}`}</div>
        `;

        this.bindPurchaseEvents(card, buyFn);
        this.bindTooltip(card, item);

        return card;
    }

    bindPurchaseEvents(card, buyFn) {
        card.addEventListener("mousedown", (event) => {
            event.preventDefault();

            this.stopFastPurchase();
            this.fastCard = card;

            card.style.transform = FAST_PURCHASE_CONFIG.PRESSED_SCALE;
            buyFn();

            this.fastTimeout = setTimeout(() => {
                this.fastInterval = setInterval(() => {
                    buyFn();
                }, FAST_PURCHASE_CONFIG.INTERVAL_MS);
            }, FAST_PURCHASE_CONFIG.START_DELAY_MS);
        });

        card.addEventListener("mouseup", () => {
            this.stopFastPurchase();
            card.style.transform = FAST_PURCHASE_CONFIG.HOVER_SCALE;
        });

        card.addEventListener("mouseleave", () => {
            this.stopFastPurchase();
            card.style.transform = FAST_PURCHASE_CONFIG.NORMAL_SCALE;
        });

        card.addEventListener("mouseenter", () => {
            card.style.transform = FAST_PURCHASE_CONFIG.HOVER_SCALE;
        });
    }

    renderOwned() {
        ownedBox.innerHTML = "";

        for (const upgrade of this.activeUpgrades) {
            const img = document.createElement("img");
            img.src = upgrade.image;
            img.title = upgrade.name;
            this.bindTooltip(img, upgrade);

            ownedBox.appendChild(img);
        }
    }

    bindTooltip(card, item) {
        card.addEventListener("mouseenter", () => {
            tooltip.textContent = item.getEffectText();
            tooltip.style.opacity = UI_CONFIG.VISIBLE_OPACITY;
        });

        card.addEventListener("mouseleave", () => {
            tooltip.style.opacity = UI_CONFIG.HIDDEN_OPACITY;
        });

        card.addEventListener("mousemove", (event) => {
            tooltip.style.left = `${event.clientX + FX_CONFIG.TOOLTIP_OFFSET_PX}px`;
            tooltip.style.top = `${event.clientY + FX_CONFIG.TOOLTIP_OFFSET_PX}px`;
        });

        if (item instanceof Upgrade) {
            card.addEventListener("click", () => {
                tooltip.style.opacity = UI_CONFIG.HIDDEN_OPACITY;
            });
        }
    }

    checkRequirement() {
        const changed = this.unlockAvailableItems();

        if (changed) {
            this.renderShop();
            this.update();
        }
    }

    unlockAvailableItems() {
        let changed = false;
        const sources = [
            this.students,
            this.buildings,
            this.upgrades,
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

        return changed;
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

    spawnMari() {
        if (this.mariPool.length < FX_CONFIG.MARI_POOL_LIMIT) {
            this.mariPool.push(this.createPooledMariImage());
        }

        const img = this.mariPool[this.mariIndex];
        this.mariIndex = (this.mariIndex + FX_CONFIG.POOL_INDEX_STEP) % this.mariPool.length;

        img.style.transition = "none";
        img.style.opacity = UI_CONFIG.VISIBLE_OPACITY;
        img.src = `${PATHS.CHIBI}/Mari-${this.randomChibiIndex()}.png`;
        img.style.transform = Math.random() < FX_CONFIG.FLIP_CHANCE
            ? FX_CONFIG.FLIPPED_SCALE
            : FX_CONFIG.NORMAL_FLIP_SCALE;

        img.style.left = `${this.randomScreenX()}px`;
        img.style.top = `${this.randomScreenY()}px`;

        img.offsetHeight;
        img.style.transition = `opacity ${FX_CONFIG.CHIBI_FADE_MS}ms ease`;

        setTimeout(() => {
            img.style.opacity = UI_CONFIG.HIDDEN_OPACITY;
        }, FX_CONFIG.CHIBI_VISIBLE_MS);
    }

    createPooledMariImage() {
        const img = document.createElement("img");

        img.className = "RanMari";
        img.style.position = "fixed";
        img.style.pointerEvents = "none";
        img.style.willChange = "transform, opacity";
        img.style.transition = `opacity ${FX_CONFIG.CHIBI_FADE_MS}ms ease`;

        document.body.appendChild(img);

        return img;
    }

    randomChibiIndex() {
        return Math.floor(Math.random() * FX_CONFIG.CHIBI_VARIANTS);
    }

    randomScreenX() {
        return Math.random() * (window.innerWidth - FX_CONFIG.CHIBI_EDGE_PADDING_PX);
    }

    randomScreenY() {
        return Math.random() * (window.innerHeight - FX_CONFIG.CHIBI_EDGE_PADDING_PX);
    }

    audioPlay(audio, volume = AUDIO_CONFIG.MUSIC_VOLUME, loop = false) {
        const audioElement = document.createElement("audio");
        audioElement.src = `${PATHS.AUDIO}/${audio}.ogg`;
        audioElement.volume = volume;
        audioElement.loop = loop;
        audioElement.play();
    }

    loop() {
        clearInterval(this.loopId);

        this.loopId = setInterval(() => {
            this.tick();
        }, this.loopTime);
    }
}

function setRandomBackground() {
    const bgIndex = Math.floor(Math.random() * FX_CONFIG.BACKGROUND_VARIANTS) + FX_CONFIG.BACKGROUND_INDEX_OFFSET;
    document.body.style.backgroundImage = `url('${PATHS.BACKGROUNDS}/bg${bgIndex}.png')`;
}

function bindClickerEvents(game) {
    clicker.draggable = false;
    clicker.addEventListener("dragstart", (event) => {
        event.preventDefault();
    });

    clicker.onclick = () => game.click();

    clicker.addEventListener("mouseleave", () => {
        clicker.style.transform = CLICKER_SCALE.NORMAL;
    });

    clicker.addEventListener("mouseover", () => {
        clicker.style.transform = CLICKER_SCALE.HOVER;
    });

    clicker.addEventListener("mousedown", () => {
        clicker.style.transform = CLICKER_SCALE.PRESSED;
    });

    clicker.addEventListener("mouseup", () => {
        clicker.style.transform = CLICKER_SCALE.NORMAL;
    });
}

const game = new Game();

setRandomBackground();
game.unlockOutfit(INITIAL_OUTFIT.name, INITIAL_OUTFIT.image, INITIAL_OUTFIT.icon);
bindClickerEvents(game);
