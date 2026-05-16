import { ITEM_CONFIG, PATHS, SHOP_BALANCE } from "./constants.js";
import {
    ClickMult,
    ClickPlus,
    GenPlus,
    Idol,
    PlusValueMult,
    Tracksuit,
} from "./shop-items.js";

const SHOP_ASSETS = {
    // Backgrounds
    cathedral: { image: `${PATHS.BACKGROUNDS}/cathedral.png`, background: "#efbf9bb8", border: "2px solid #F8BF94" },
    trinity: { image: `${PATHS.BACKGROUNDS}/trinity.png`, background: "#9befecb8", border: "2px solid #94d7f8" },
    infirmary: { image: `${PATHS.BACKGROUNDS}/infirmary.png`, background: "#f0f0f0", border: "2px solid #ccc" },
    old_library: { image: `${PATHS.BACKGROUNDS}/old-library.png`, background: "#d9c9b8", border: "2px solid #c0a080" },

    // Objects
    piety: `${PATHS.OBJECTS}/Piety.png`,
    corsage: `${PATHS.OBJECTS}/Corsage.png`,
    idolCostume: `${PATHS.ICONS}/idol-costume.png`,
    tracksuit: `${PATHS.MARI}/Tracksuit.png`,

    //Students
    mari: `${PATHS.ICONS}/Mari.png`,
    sakurako: `${PATHS.ICONS}/Sakurako.png`,
    hinata: `${PATHS.ICONS}/Hinata.png`,
    serina: `${PATHS.ICONS}/Serina.png`,
    hanae: `${PATHS.ICONS}/Hanae.png`,
    Mine: `${PATHS.ICONS}/Mine.png`,
};

export function createShopData() {
    const students = createStudents();
    const buildings = createBuildings();
    const upgrades = createUpgrades(students);

    wireBuildingRequirements(buildings);
    wireUpgradeRequirements(upgrades, students);
    wireStudentRequirements(students);

    return { students, buildings, upgrades };
}

function createStudents() {
    return {
        mari: new ClickPlus({
            name: "Mari",
            id: "mari",
            cost: SHOP_BALANCE.MARI.COST,
            value: SHOP_BALANCE.MARI.VALUE,
            image: SHOP_ASSETS.mari,
            bg: SHOP_ASSETS.cathedral,
        }),
        hinata: new ClickPlus({
            name: "Hinata",
            id: "hinata",
            cost: SHOP_BALANCE.HINATA.COST,
            value: SHOP_BALANCE.HINATA.VALUE,
            image: SHOP_ASSETS.hinata,
            bg: SHOP_ASSETS.cathedral,
        }),
        sakurako: new ClickPlus({
            name: "Sakurako",
            id: "sakurako",
            cost: SHOP_BALANCE.SAKURAKO.COST,
            value: SHOP_BALANCE.SAKURAKO.VALUE,
            image: SHOP_ASSETS.sakurako,
            bg: SHOP_ASSETS.cathedral,
        }),
        serina: new PlusValueMult({
            name: "Serina",
            id: "serina",
            cost: SHOP_BALANCE.SERINA.COST,
            value: SHOP_BALANCE.SERINA.VALUE,
            image: SHOP_ASSETS.serina,
            bg: SHOP_ASSETS.infirmary,
            growth: SHOP_BALANCE.SERINA.GROWTH,
        }),
        hanae: new PlusValueMult({
            name: "Hanae",
            id: "hanae",
            cost: SHOP_BALANCE.HANAE.COST,
            value: SHOP_BALANCE.HANAE.VALUE,
            image: SHOP_ASSETS.hanae,
            bg: SHOP_ASSETS.infirmary,
            growth: SHOP_BALANCE.HANAE.GROWTH,
        }),
        Mine: new PlusValueMult({
            name: "Mine",
            id: "Mine",
            cost: SHOP_BALANCE.MINE.COST,
            value: SHOP_BALANCE.MINE.VALUE,
            image: SHOP_ASSETS.Mine,
            bg: SHOP_ASSETS.infirmary,
            growth: SHOP_BALANCE.MINE.GROWTH,
        }),
    };
}

function createBuildings() {
    return {
        library: new GenPlus({
            name: "Old Library",
            id: "library",
            cost: SHOP_BALANCE.LIBRARY.COST,
            value: SHOP_BALANCE.LIBRARY.VALUE,
            bg: SHOP_ASSETS.old_library,
        }),
        plaza: new GenPlus({
            name: "Trinity Plaza",
            id: "plaza",
            cost: SHOP_BALANCE.PLAZA.COST,
            value: SHOP_BALANCE.PLAZA.VALUE,
            bg: SHOP_ASSETS.trinity,
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
            bg: SHOP_ASSETS.trinity,
            requirement: game => game.students.mari.owned >= ITEM_CONFIG.REQUIRED_OWNED_COUNT,
            requirementchild: students.mari,
        }),
        corsage: new ClickMult({
            name: "Innocent Corsage",
            id: "corsage",
            cost: SHOP_BALANCE.CORSAGE.COST,
            value: SHOP_BALANCE.CORSAGE.VALUE,
            image: SHOP_ASSETS.corsage,
            bg: SHOP_ASSETS.trinity,
        }),
        tracksuit: new Tracksuit({
            name: "Tracksuit",
            id: "tracksuit",
            cost: SHOP_BALANCE.TRACKSUIT.COST,
            value: SHOP_BALANCE.TRACKSUIT.VALUE,
            image: SHOP_ASSETS.tracksuit,
            bg: SHOP_ASSETS.trinity,
        }),
        idol: new Idol({
            name: "Idol Costume",
            id: "idol",
            cost: SHOP_BALANCE.IDOL.COST,
            value: SHOP_BALANCE.IDOL.VALUE,
            image: SHOP_ASSETS.idolCostume,
            bg: SHOP_ASSETS.trinity,
        }),
    };
    return upgrades;
}

function wireBuildingRequirements(buildings) {
    buildings.plaza.requirement = game => game.buildings.library.owned >= ITEM_CONFIG.REQUIRED_OWNED_COUNT;
    buildings.plaza.requirementchild = buildings.library;
}

function wireStudentRequirements(students) {
    students.hinata.requirement = game => game.students.mari.owned >= ITEM_CONFIG.REQUIRED_OWNED_COUNT;
    students.hinata.requirementchild = students.mari;

    students.sakurako.requirement = game => game.students.hinata.owned >= ITEM_CONFIG.REQUIRED_OWNED_COUNT;
    students.sakurako.requirementchild = students.hinata;

    students.serina.requirement = game => game.students.sakurako.owned >= ITEM_CONFIG.REQUIRED_OWNED_COUNT;
    students.serina.requirementchild = students.sakurako;
    students.serina.showRequirement = game => game.students.mari.owned >= ITEM_CONFIG.REQUIRED_OWNED_COUNT;
    students.serina.childEffect = students.mari;

    students.hanae.requirement = game => game.students.serina.owned >= ITEM_CONFIG.REQUIRED_OWNED_COUNT;
    students.hanae.requirementchild = students.serina;
    students.hanae.showRequirement = game => game.students.hinata.owned >= ITEM_CONFIG.REQUIRED_OWNED_COUNT;
    students.hanae.childEffect = students.hinata;

    students.Mine.requirement = game => game.students.hanae.owned >= ITEM_CONFIG.REQUIRED_OWNED_COUNT;
    students.Mine.requirementchild = students.sakurako;
    students.Mine.showRequirement = game => game.students.sakurako.owned >= ITEM_CONFIG.REQUIRED_OWNED_COUNT;
    students.Mine.childEffect = students.sakurako;
}

function wireUpgradeRequirements(upgrades, students) {
    upgrades.piety.requirementchild = students.mari;

    upgrades.corsage.requirement = game => game.activeUpgrades.some(upgrade => upgrade.id === "piety");
    upgrades.corsage.requirementchild = upgrades.piety;

    upgrades.tracksuit.requirement = game => game.activeUpgrades.some(upgrade => upgrade.id === "piety");
    upgrades.tracksuit.requirementchild = upgrades.piety;

    upgrades.idol.requirement = game => game.activeUpgrades.some(upgrade => upgrade.id === "piety");
    upgrades.idol.requirementchild = upgrades.piety;
}
