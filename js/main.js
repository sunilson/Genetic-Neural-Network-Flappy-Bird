// Create our 'main' state that will contain the game

// Initialize Phaser, and create a 400px by 490px game

class Game extends Phaser.Game {
    constructor() {
        super(600, 490, Phaser.AUTO, 'content', null)
        this.state.add('main', MainState, false);
        this.state.add('menu', MenuState, false);
        this.state.start('menu');
    }
}

var game = new Game();