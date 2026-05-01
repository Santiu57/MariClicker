export class ShopItem {
    constructor(config) {
        Object.assign(this, config);

        this.owned = 0;
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