export class ShopUI {
    constructor(game, elements) {
        this.game = game;
        this.shop = elements.shop;
    }

    render() {
        this.shop.innerHTML = "";

        this.renderCategory(this.game.students);
        this.renderCategory(this.game.buildings);
        this.renderCategory(this.game.upgrades);
    }

    renderCategory(source) {
        for (const key in source) {
            const item = source[key];

            const div = document.createElement("div");
            div.textContent = `${item.name} (${item.cost})`;

            div.onclick = () => {
                if (item.buy(this.game)) {
                    this.render();
                }
            };

            this.shop.appendChild(div);
        }
    }
}