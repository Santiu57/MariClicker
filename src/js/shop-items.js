import { ITEM_CONFIG } from "./constants.js";

export class ShopItem {
    constructor({
        id,
        name,
        cost,
        value,
        image,
        bg,
        growth = ITEM_CONFIG.DEFAULT_GROWTH,
        requirementchild = null,
        showRequirement = () => true,
        requirement = () => true,
        requirementText = `Requires ${requirementchild ? requirementchild.name : "???"}`,
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
            requirementText,
        });

        this.owned = ITEM_CONFIG.INITIAL_OWNED;
        this.purchased = false;
        this.unlocked = false;
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

export class Student extends ShopItem { }
export class Building extends ShopItem { }
export class Upgrade extends ShopItem { }

export class GenMult extends Upgrade {
    apply(data) {
        data.mult *= Math.pow(this.value, this.owned);
    }

    getEffectText() {
        return `x${this.value} Mari pasivamente`;
    }
}

export class GenPlus extends Building {
    apply(data) {
        data.base += this.value * this.owned;
    }

    getEffectText() {
        return `+${this.value} Mari pasivamente`;
    }
}

export class ClickPlus extends Student {
    apply(data) {
        data.base += this.value * this.owned;
    }

    getEffectText() {
        return `+${this.value} Mari por click`;
    }
}

export class ClickMult extends Upgrade {
    apply(data) {
        data.mult *= Math.pow(this.value, this.owned);
    }

    getEffectText() {
        return `x${this.value} Mari por click`;
    }
}

export class Interval extends Upgrade {
    onBuy(game) {
        game.loopTime = game.loopTime * this.value;
        game.loop();
    }

    getEffectText() {
        return `x${ITEM_CONFIG.SPEED_MULTIPLIER_NUMERATOR / this.value} velocidad pasiva`;
    }
}

export class Tracksuit extends Interval {
    onBuy(game) {
        super.onBuy(game);

        game.unlockOutfit("Tracksuit", "src/imgs/Mari/Tracksuit.png", "src/imgs/icons/Mari-track.png");
    }
}

export class Idol extends Interval {
    onBuy(game) {
        super.onBuy(game);

        game.unlockOutfit("Idol", "src/imgs/Mari/Idol.png", "src/imgs/icons/Mari-idol.png");
    }
}
