class MenuState extends Phaser.State {
    preload() {
        this.game.load.image('play', 'assets/play_button.png');
        this.game.load.image('github', 'assets/github.png');
    }
    create() {
        this.game.stage.backgroundColor = '#fff';
        let button = this.game.add.button(this.game.world.centerX - 60, this.game.world.centerY - 57.6, 'play', this.startGame, this, 2, 1, 0);
        button.scale.setTo(0.4, 0.4)
        let github = this.game.add.button(this.game.world.centerX - 56.25, this.game.world.centerY + 30, 'github', function () {
            window.location.href = "https://github.com/sunilson/genetic_neural_network";
        }, this, 2, 1, 0);
        github.scale.setTo(0.1, 0.1)
        this.text = this.game.add.text(0, 0, "Created by Linus Weiss", {
            font: "13px Arial",
            fill: "#00000",
            boundsAlignH: "center",
            boundsAlignV: "middle"
        });
        this.text.setTextBounds(0, 440, 600, 50)
    }
    startGame() {
        this.state.start('main');
    }
}