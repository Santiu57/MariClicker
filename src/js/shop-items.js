import { ITEM_CONFIG } from "./constants.js";

export class ShopItem {
    constructor({
        id,
        name,
        cost,
        value,
        image,
        bg,
        valueMult = 1,
        growth = ITEM_CONFIG.DEFAULT_GROWTH,
        requirementchild = null,
        childEffect = null,
        showRequirement = () => true,
        requirement = () => true,
        requirementText = null,
    }) {
        Object.assign(this, {
            id,
            name,
            cost,
            value,
            image,
            bg,
            growth,
            valueMult,
            childEffect,
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

    getRequirementText() {
        return this.requirementText ?? `Requires ${this.requirementchild ? this.requirementchild.name : "???"}`;
    }
}

export class Student extends ShopItem { }
export class Building extends ShopItem { }
export class Upgrade extends ShopItem { }

export class GenMult extends Upgrade {
    apply(data) {
        data.mult *= Math.pow(this.value * this.valueMult, this.owned);
    }

    getEffectText() {
        return `x${(this.value * this.valueMult).toFixed(1)} Mari's by time`;
    }
}

export class GenPlus extends Building {
    apply(data) {
        data.base += (this.value * this.valueMult) * this.owned;
    }

    getEffectText() {
        return `+${(this.value * this.valueMult).toFixed(1)} Mari's by time`;
    }
}

export class ClickPlus extends Student {
    apply(data) {
        data.base += (this.value * this.valueMult) * this.owned;
    }

    getEffectText() {
        return `+${(this.value * this.valueMult).toFixed(1)} Mari's per click`;
    }
}

export class ClickMult extends Upgrade {
    apply(data) {
        data.mult *= Math.pow(this.value * this.valueMult, this.owned);
    }

    getEffectText() {
        return `x${(this.value * this.valueMult).toFixed(1)} Mari's per click`;
    }
}

export class Interval extends Upgrade {
    onBuy(game) {
        game.loopTime = game.loopTime * (this.value / this.valueMult);
        game.loop();
    }

    getEffectText() {
        return `x${(ITEM_CONFIG.SPEED_MULTIPLIER_NUMERATOR / (this.value * this.valueMult)).toFixed(1)} Mari's by time`;
    }
}

export class Tracksuit extends Interval {
    onBuy(game) {
        super.onBuy(game);

        game.unlockOutfit("Tracksuit", "src/imgs/Mari/Tracksuit.png", "src/imgs/icons/Mari-track.png");
    }
}

export class Idol extends ClickMult {
    onBuy(game) {
        super.onBuy(game);

        game.unlockOutfit("Idol", "src/imgs/Mari/Idol.png", "src/imgs/icons/Mari-idol.png");
    }
}

export class PlusValueMult extends Upgrade {
    onBuy() {
        if (!this.childEffect) return;

        this.childEffect.valueMult += this.value * this.valueMult;
    }

    apply() {
    }

    getEffectText() {
        const targetName = this.childEffect ? this.childEffect.name : "???";

        return `+${(this.value * this.valueMult).toFixed(1)}X to ${targetName} values`;
    }
}
