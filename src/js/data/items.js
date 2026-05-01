import { ClickPlus } from "../entities/Students.js";
import { GenPlus } from "../entities/Buildings.js";
import { ClickMult } from "../entities/Upgrades.js";

export function createItems() {
    return {
        students: {
            mari: new ClickPlus({
                id: "mari",
                name: "Mari",
                cost: 10,
                value: 1
            })
        },

        buildings: {
            library: new GenPlus({
                id: "library",
                name: "Library",
                cost: 50,
                value: 1
            })
        },

        upgrades: {
            piety: new ClickMult({
                id: "piety",
                name: "Piety",
                cost: 500,
                value: 1.5
            })
        }
    };
}