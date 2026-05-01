import { Game } from "./core/Game.js";
import { createItems } from "./data/items.js";
import { ShopUI } from "./ui/ShopUI.js";

const data = createItems();
const game = new Game(data);

const ui = new ShopUI(game, {
    shop: document.getElementById("shop")
});

ui.render();

// ✅ AQUÍ YA FUNCIONA
document.getElementById("mari-image").onclick = () => {
    game.click();
    ui.render();
};

// loop
setInterval(() => {
    game.tick();
    ui.render();
}, 1000);