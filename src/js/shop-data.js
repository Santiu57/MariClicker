import { ITEM_CONFIG, PATHS, SHOP_BALANCE } from "./constants.js";
import {
    ClickMult,
    ClickPlus,
    GenPlus,
    Idol,
    Interval,
    Tracksuit,
} from "./shop-items.js";

const SHOP_ASSETS = {
    trinityBg: PATHS.TRINITY_BG,
    mariIcon: `${PATHS.ICONS}/Mari.png`,
    piety: `${PATHS.OBJECTS}/Piety.png`,
    corsage: `${PATHS.OBJECTS}/Corsage.png`,
    tracksuit: `${PATHS.MARI}/Tracksuit.png`,
    idolCostume: `${PATHS.ICONS}/idol-costume.png`,
};

export function createShopData() {
    const students = createStudents();
    const buildings = createBuildings();
    const upgrades = createUpgrades(students);

    wireBuildingRequirements(buildings);
    wireUpgradeRequirements(upgrades, students);

    return { students, buildings, upgrades };
}

function createStudents() {
    return {
        mari: new ClickPlus({
            name: "Mari",
            id: "mari",
            cost: SHOP_BALANCE.MARI.COST,
            value: SHOP_BALANCE.MARI.VALUE,
            image: SHOP_ASSETS.mariIcon,
            bg: SHOP_ASSETS.trinityBg,
        }),
    };
}

function createBuildings() {
    return {
        library: new GenPlus({
            name: "Library",
            id: "library",
            cost: SHOP_BALANCE.LIBRARY.COST,
            value: SHOP_BALANCE.LIBRARY.VALUE,
            bg: SHOP_ASSETS.trinityBg,
        }),
        plaza: new GenPlus({
            name: "Trinity Plaza",
            id: "plaza",
            cost: SHOP_BALANCE.PLAZA.COST,
            value: SHOP_BALANCE.PLAZA.VALUE,
            bg: SHOP_ASSETS.trinityBg,
            growth: ITEM_CONFIG.PLAZA_GROWTH,
        }),
    };
}

function createUpgrades(students) {
    const upgrades = {
        piety: new ClickMult({
            name: "Piety",
            id: "piety",
            cost: SHOP_BALANCE.PIETY.COST,
            value: SHOP_BALANCE.PIETY.VALUE,
            image: SHOP_ASSETS.piety,
            bg: SHOP_ASSETS.trinityBg,
            requirement: game => game.students.mari.owned >= ITEM_CONFIG.REQUIRED_OWNED_COUNT,
            requirementchild: students.mari,
        }),
        corsage: new ClickMult({
            name: "Innocent Corsage",
            id: "corsage",
            cost: SHOP_BALANCE.CORSAGE.COST,
            value: SHOP_BALANCE.CORSAGE.VALUE,
            image: SHOP_ASSETS.corsage,
            bg: SHOP_ASSETS.trinityBg,
        }),
        tracksuit: new Tracksuit({
            name: "Tracksuit",
            id: "tracksuit",
            cost: SHOP_BALANCE.TRACKSUIT.COST,
            value: SHOP_BALANCE.TRACKSUIT.VALUE,
            image: SHOP_ASSETS.tracksuit,
            bg: SHOP_ASSETS.trinityBg,
        }),
        idol: new Idol({
            name: "Idol Costume",
            id: "idol",
            cost: SHOP_BALANCE.IDOL.COST,
            value: SHOP_BALANCE.IDOL.VALUE,
            image: SHOP_ASSETS.idolCostume,
            bg: SHOP_ASSETS.trinityBg,
        }),
    };
    return upgrades;
}

function wireBuildingRequirements(buildings) {
    buildings.plaza.requirement = game => game.buildings.library.owned >= ITEM_CONFIG.REQUIRED_OWNED_COUNT;
    buildings.plaza.requirementchild = buildings.library;
}

function wireUpgradeRequirements(upgrades, students) {
    upgrades.piety.requirementchild = students.mari;

    upgrades.corsage.requirement = game => game.activeUpgrades.some(upgrade => upgrade.id === "piety");
    upgrades.corsage.requirementchild = upgrades.piety;
}