import { ShopItem } from "./ShopItem.js";

export class Upgrade extends ShopItem { }

export class ClickPlus extends Upgrade {
    apply(data) {
        data.mult += this.value * this.owned;
    }

    getEffectText() {
        return `+${this.value} Mari por click`;
    }
}