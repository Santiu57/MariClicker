export class Game {
    constructor(data) {
        this.maris = 20000;
        this.clicks = 0;
        this.loopTime = 1000;

        this.mariClick = 1;
        this.mariPerSecond = 0;

        this.activeUpgrades = [];

        this.students = data.students;
        this.buildings = data.buildings;
        this.upgrades = data.upgrades;
    }

    // =========================
    // ECONOMÍA
    // =========================
    calcClick() {
        let data = { base: 1, mult: 1 };

        Object.values(this.students).forEach(s => s.apply(data));
        this.activeUpgrades.forEach(u => u.apply(data));

        this.mariClick = Math.floor(data.base * data.mult);
    }

    calcGen() {
        let data = { base: 0, mult: 1 };

        Object.values(this.buildings).forEach(b => b.apply(data));

        this.mariPerSecond = Math.floor(
            (data.base * data.mult) * (1000 / this.loopTime)
        );
    }

    click() {
        this.clicks++;

        this.calcClick();
        this.maris += this.mariClick;
    }

    tick() {
        this.calcGen();
        this.maris += this.mariPerSecond;
    }
}