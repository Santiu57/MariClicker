export const GAME_CONFIG = {
    INITIAL_MARIS: 0,
    INITIAL_CLICKS: 0,
    INITIAL_LOOP_TIME_MS: 1000,
    BASE_CLICK_VALUE: 1,
    BASE_GENERATION_VALUE: 0,
    BASE_MULTIPLIER: 1,
    SECONDS_IN_MS: 1000,
};

export const ITEM_CONFIG = {
    INITIAL_OWNED: 0,
    SPEED_MULTIPLIER_NUMERATOR: 1,
    DEFAULT_GROWTH: 1.5,
    REQUIRED_OWNED_COUNT: 1,
};

export const SHOP_BALANCE = {
    // Students
    MARI: {
        COST: 10,
        VALUE: 1,
    },
    HINATA: {
        COST: 50,
        VALUE: 3,
    },
    SAKURAKO: {
        COST: 200,
        VALUE: 8,
    },
    SERINA: {
        COST: 500,
        VALUE: 0.2,
        GROWTH: 1.8,
    },
    HANAE: {
        COST: 800,
        VALUE: 0.2,
        GROWTH: 1.9,
    },
    MINE: {
        COST: 1200,
        VALUE: 0.2,
        GROWTH: 1.95,
    },
    // Buildings
    LIBRARY: {
        COST: 50,
        VALUE: 1,
    },
    PLAZA: {
        COST: 150,
        VALUE: 3,
    },
    // Upgrades
    PIETY: {
        COST: 500,
        VALUE: 1.5,
    },
    CORSAGE: {
        COST: 1000,
        VALUE: 2,
    },
    TRACKSUIT: {
        COST: 2000,
        VALUE: 0.5,
    },
    IDOL: {
        COST: 5000,
        VALUE: 3,
    },
};

export const FAST_PURCHASE_CONFIG = {
    INTERVAL_MS: 60,
    START_DELAY_MS: 220,
    PRESSED_SCALE: "scale(0.98)",
    HOVER_SCALE: "scale(1.02)",
    NORMAL_SCALE: "scale(1)",
};

export const FX_CONFIG = {
    FIRST_CLICK: 1,
    INITIAL_POOL_INDEX: 0,
    POOL_INDEX_STEP: 1,
    SPAWN_CLICK_REMAINDER: 0,
    BACKGROUND_INDEX_OFFSET: 1,
    CHIBI_VARIANTS: 6,
    BACKGROUND_VARIANTS: 6,
    MARI_POOL_LIMIT: 100,
    MARI_SPAWN_EVERY_CLICKS: 10,
    CHIBI_EDGE_PADDING_PX: 100,
    CHIBI_FADE_MS: 500,
    CHIBI_VISIBLE_MS: 750,
    TOOLTIP_OFFSET_PX: 15,
    FLIP_CHANCE: 0.5,
    FLIPPED_SCALE: "scaleX(-1)",
    NORMAL_FLIP_SCALE: "scaleX(1)",
};

export const UI_CONFIG = {
    HIDDEN_OPACITY: "0",
    VISIBLE_OPACITY: "1",
};

export const AUDIO_CONFIG = {
    MARI_VOLUME: 0.3,
    MUSIC_VOLUME: 0.5,
};

export const CLICKER_SCALE = {
    NORMAL: "scale(1)",
    HOVER: "scale(1.03)",
    PRESSED: "scale(0.95)",
};

export const DOM_IDS = {
    CLICKER: "mari-image",
    MARI_DISPLAY: "maris-counter",
    TOOLTIP: "tooltip",
    SHOP: "shop",
    OWNED_UPGRADES: "owned-upgrades",
    OUTFITS: "outfits",
};

export const PATHS = {
    AUDIO: "src/aud",
    CHIBI: "src/imgs/Chibi",
    BACKGROUNDS: "src/imgs/bgs",
    MARI: "src/imgs/Mari",
    ICONS: "src/imgs/icons",
    OBJECTS: "src/imgs/objs",
    TRINITY_BG: "src/imgs/bgs/",
};

export const INITIAL_OUTFIT = {
    name: "Nun",
    image: `${PATHS.MARI}/Nun.png`,
    icon: `${PATHS.ICONS}/Mari.png`,
};
