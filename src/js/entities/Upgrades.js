import { ShopItem } from "./ShopItem.js";

export class Upgrade extends ShopItem { }

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
        return `x${1 / this.value} velocidad pasiva`;
    }
}