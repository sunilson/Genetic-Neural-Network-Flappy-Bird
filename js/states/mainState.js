let previousPopulationWinners = null
let generationCount = 1

class MainState extends Phaser.State {
    preload() {
        // Load the bird sprite
        this.game.load.image('bird', 'assets/Flappy_Bird.png')
        this.game.load.image('pipe', 'assets/pipe2.png')
        this.game.load.image('bg', 'assets/bg.png')
    }

    create() {
        //this.game.stage.backgroundColor = '#71c5cf';
        this.game.physics.startSystem(Phaser.Physics.ARCADE)
        this.drawOrderGroup = this.game.add.group()

        //Add boundaries
        const invisWallTop = this.game.add.sprite(0, -50)
        invisWallTop.scale.x = this.game.world.width
        invisWallTop.height = 50
        const invisWallBottom = this.game.add.sprite(0, 490)
        invisWallBottom.scale.x = this.game.world.width
        invisWallBottom.height = 50
        this.game.physics.arcade.enable(invisWallTop)
        this.game.physics.arcade.enable(invisWallBottom)
        invisWallBottom.checkWorldBounds = true
        invisWallTop.checkWorldBounds = true

        //Pipes group
        this.pipes = this.game.add.group()
        this.pipesPassings = this.game.add.group()
        this.pipes.add(invisWallTop)
        this.pipes.add(invisWallBottom)
        this.birds = this.game.add.group()
        this.addPipeRow()
        this.timer = this.game.time.events.loop(1500, this.addPipeRow, this)

        //Background
        this.backgrounds = []
        this.backgroundsGroup = this.game.add.group()
        this.updateBackgrounds()

        this.startNewRun(10)
        this.showSideMenu()
        this.drawOrderGroup.addChild(this.backgroundsGroup)
        this.drawOrderGroup.addChild(this.pipes)
        this.drawOrderGroup.addChild(this.sideMenu)
    }

    update() {
        this.updateBackgrounds()
        this.birds.forEach(bird => {
            if (bird.alive) {
                this.birdTexts[bird.id].text = "Bird " + bird.id + ": " + Math.round(bird.fitness + bird.distanceToPassing())
                let horizontalDifference = null
                let verticalDifference = null

                this.pipesPassings.forEach(passing => {
                    let difference = passing.body.x - bird.body.x
                    if (difference >= 0 && (!bird.nextPassing || (bird.nextPassing.body.x - bird.body.x) < 0 || difference < Math.abs((bird.nextPassing.body.x - bird.body.x)))) {
                        if (bird.nextPassing != passing && bird.nextPassing) {
                            bird.increaseFitness(1000)
                        }
                        bird.nextPassing = passing
                    }
                    if (bird.nextPassing) {
                        horizontalDifference = bird.nextPassing.body.x - bird.body.x
                        verticalDifference = bird.nextPassing.body.y - bird.body.y
                        bird.flap(horizontalDifference, verticalDifference)
                    }
                })
            }
        })

        this.game.physics.arcade.overlap(this.birds, this.pipes, this.hitPipe, null, this);
    }
    updateBackgrounds() {
        let background = null
        if (this.backgrounds.length == 0) {
            background = this.game.add.sprite(0, -50, 'bg')
        } else if (this.backgrounds[this.backgrounds.length - 1].body.x + this.backgrounds[this.backgrounds.length - 1].width <= 500) {
            background = this.game.add.sprite(500, -50, 'bg')
        }
        if (background) {
            background.scale.setTo(0.5, 0.5)
            this.game.physics.arcade.enable(background)
            background.body.velocity.x = -150;
            background.checkWorldBounds = true;
            background.outOfBoundsKill = true;
            this.backgrounds.push(background)
            this.backgroundsGroup.addChild(background)
        }
    }
    addPipeRow() {
        const upperY = util.getRandomInt(50, 340)
        const pipeUpper = this.game.add.sprite(520, upperY, 'pipe');
        const pipeLower = this.game.add.sprite(520, upperY + 100, 'pipe');

        pipeLower.scale.setTo(0.2, 0.2)
        pipeUpper.scale.setTo(0.2, -0.2)

        this.game.physics.arcade.enable(pipeUpper);
        this.game.physics.arcade.enable(pipeLower);

        this.pipes.add(pipeUpper);
        this.pipes.add(pipeLower);

        /*
        const graphics = this.game.add.graphics(0, 0);
        graphics.beginFill(0xFF700B, 1);
        graphics.lineStyle(5, 0xffd900, 1);
        graphics.moveTo(-5, -5)
        graphics.lineTo(5, -5)
        graphics.lineTo(5, 5)
        graphics.lineTo(-5, 5)
        graphics.endFill()
        graphics.boundsPadding = 0;
        */

        const passingPoint = this.game.add.sprite(568.6, upperY + 50)
        //passingPoint.addChild(graphics)
        this.game.physics.arcade.enable(passingPoint)
        this.pipesPassings.add(passingPoint)

        pipeLower.body.velocity.x = -200;
        pipeUpper.body.velocity.x = -200;
        passingPoint.body.velocity.x = -200;

        pipeLower.checkWorldBounds = true;
        pipeUpper.checkWorldBounds = true;
        passingPoint.checkWorldBounds = true;

        pipeLower.outOfBoundsKill = true;
        pipeUpper.outOfBoundsKill = true;
        passingPoint.outOfBoundsKill = true;
        passingPoint.events.onOutOfBounds.add(function (point) {
            point.destroy()
        });
    }
    removePassingPoint(point) {
        this.pipesPassings.remove(point)
    }
    hitPipe(bird, pipe) {
        bird.kill()
        bird.alive = false;
        bird.hitPipe()
        this.alive -= 1
        if (this.alive == 0) this.applyGenetics()
        this.headline.text = "Birds alive: " + this.alive
    }
    startNewRun(birdAmount) {
        for (let i = 0; i < birdAmount; i++) {
            if (previousPopulationWinners && previousPopulationWinners.length > 0) {
                this.birds.add(new Bird(this.game, 100, 245, i, previousPopulationWinners.pop()))
            } else {
                this.birds.add(new Bird(this.game, 100, 245, i))
            }
        }
        this.alive = birdAmount;
        this.generationNumber = this.game.add.text(5, 470, "Generation: " + generationCount, {
            font: "13px Arial",
            fill: "#ffffff"
        });
    }
    showSideMenu() {
        this.sideMenu = this.game.add.sprite(400, 0)
        const background = this.game.add.graphics(0, 0);
        background.beginFill(0xE91E63, 1);
        background.moveTo(0, 0)
        background.lineTo(200, 0)
        background.lineTo(200, 490)
        background.lineTo(0, 490)
        background.endFill()
        background.boundsPadding = 0;
        this.sideMenu.addChild(background)

        const style = {
            font: "14px Arial",
            fill: "#fff",
            boundsAlignH: "right",
            boundsAlignV: "middle"
        };
        const styleHeadline = {
            font: "18px Arial",
            fill: "#fff",
            boundsAlignH: "right",
            boundsAlignV: "middle"
        };

        this.headline = this.game.add.text(0, 0, "Birds alive: " + 10, styleHeadline)
        this.headline.setTextBounds(400, 0, 180, 50)
        this.birdTexts = []
        for (let i = 1; i <= 10; i++) {
            const line = this.game.add.text(0, 0, "Bird " + i + ": 0", style);
            this.birdTexts.push(line)
            line.setTextBounds(400, 44 * i, 180, 50)
            const sprite = game.add.sprite(420, 44 * i + 8, this.birds.getAt(i - 1).generateTexture())
            sprite.scale.setTo(1.7, 1.7)
        }
    }
    render() {
        this.birdTexts.forEach(text => {
            //this.game.debug.geom(text.textBounds);
        })
    }
    /*
    checkWinState(bird) {
        if (bird.fitness > 10000) this.game.state.start('won');
    }
    */
    applyGenetics() {
        const ga = new GeneticAlgorithm(this.birds, 0.05, CROSSOVERTYPE.randomCrossOver, POOLTYPE.ordinal)
        previousPopulationWinners = ga.apply()
        generationCount += 1
        this.game.state.start('main');
    }
}