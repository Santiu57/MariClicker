import { ShopItem } from "./ShopItem.js";

export class Building extends ShopItem { }

export class GenPlus extends Building {
    apply(data) {
        data.mult += this.value * this.owned;
    }

    getEffectText() {
        return `+${this.value} Mari por segundo`;
    }
}