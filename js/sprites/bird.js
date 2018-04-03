class Bird extends Phaser.Sprite {
    constructor(game, x, y, id, weights) {
        super(game, x, y, 'bird');
        this.anchor.setTo(-0.2, 0.5);
        this.scale.setTo(2, 2);
        this.color = Math.random() * 0xffffff;
        this.tint = this.color;

        this.game.add.existing(this);
        this.game.physics.arcade.enable(this);
        this.body.gravity.y = 1000;

        this.fitness = 0;
        this.nextPassing = null
        this.id = id

        this.nn = new NeuralNetwork([2, 6, 1])
        if (weights) {
            this.nn.weights = weights
        }
    }

    update() {
        if (this.angle < 20) this.angle += 1;
    }

    flap(x, y) {
        if (!this.alive)
            return;

        const nnResult = this.nn.query([x, y])

        if (nnResult > 0.5) {
            this.body.velocity.y = -350;
            game.add.tween(this).to({
                angle: -20
            }, 100).start();
        }
    }

    distanceToPassing() {
        if (this.nextPassing) {
            return -Phaser.Math.distance(this.body.x, this.body.y, this.nextPassing.body.x, this.nextPassing.body.y)
        }

        return 0
    }

    hitPipe() {
        this.body.velocity.x = -200;
        this.increaseFitness(this.distanceToPassing())
    }

    increaseFitness(val) {
        this.fitness += val
    }
}