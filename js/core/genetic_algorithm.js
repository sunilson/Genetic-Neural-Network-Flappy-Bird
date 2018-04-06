const chance = new Chance()

/**
 * Functions used to do the crossover for all children
 */
const CROSSOVERTYPE = {
    halfwayCrossOver: function (parentPool, childAmount) {
        for (let i = 0; i < childAmount; i++) {
            const parents = selectParents(parentPool)
            //Get middle (not zero or last place)
            const middle = chance.integer({
                min: 1,
                max: parents[0].nn.weights[j].length - 1
            })
            return null
        }
    },
    randomCrossOver: function (parentPool, childAmount) {
        let childs = []
        for (let i = 0; i < childAmount; i++) {
            const parents = selectParents(parentPool)
            const child = JSON.parse(JSON.stringify(parents[0].nn.weights))
            for (let k = 0; k < parents[0].nn.weights.length; k++) {
                for (let j = 0; j < parents[0].nn.weights[k].length; j++) {
                    for (let l = 0; l < parents[0].nn.weights[k][j].length; l++) {
                        if (chance.floating({
                                min: 0,
                                max: 1,
                                fixed: 10
                            }) >= 0.5) {
                            child[k][j][l] = parents[0].nn.weights[k][j][l]
                        } else {
                            child[k][j][l] = parents[1].nn.weights[k][j][l]
                        }
                    }
                }
            }
            childs.push(child)
        }
        return childs
    }
}

/**
 * Functions that define how the parent pool should be created from the dead birds
 */
const POOLTYPE = {
    ordinal: function (birdList) {
        const parentPool = []
        //Apply chances of offspring with ordinals
        for (let i = 0; i < this.birds.length; i++) {
            const ordinal = ((i + 1) / this.birds.length) * 100
            for (let j = 0; j < ordinal; j++) {
                parentPool.push(this.birds[i])
            }
        }
        return parentPool
    },
    performance: function (birdList) {
        const parentPool = []
        birdList.forEach(bird => {
            let n = bird.fitness * 100
            for (let i = 0; i < n; i++) {
                parentPool.push(bird)
            }
        })
        return parentPool
    }
}

/**
 * Extracts two random parents from parent pool
 */
function selectParents(parentPool) {
    const a = chance.integer({
        min: 0,
        max: parentPool.length - 1
    })
    const b = chance.integer({
        min: 0,
        max: parentPool.length - 1
    })
    const parents = []
    parents.push(parentPool[a])
    if (parentPool[b].id !== parentPool[a].id) {
        parents.push(parentPool[b])
    } else {
        for (let i = b; i < parentPool.length; i++) {
            if (parentPool[i].id !== parentPool[a].id) {
                parents.push(parentPool[i])
                i = parentPool.length
            } else if (i == parentPool.length - 1) {
                i = -1
            }
        }
    }
    console.log(parents)
    return parents
}

class GeneticAlgorithm {
    constructor(birds, mutationRate, crossover, pool) {
        this.birds = birds
        this.crossover = crossover
        this.pool = pool
        this.mutationRate = mutationRate
        this.parentPool = []
        this.prepare()
    }

    /**
     * Applies crossover and mutation and returns the generated generation
     */
    apply() {
        let childs = this.crossover(this.parentPool, this.birds.length)
        childs = this.mutate(childs)
        return childs
    }

    /**
     * Prepares the previous generation to be used for crossover
     */
    prepare() {
        const birdList = []
        //Normalize fitness values to 0-1
        let min = null
        let max = null
        this.birds.forEach(bird => {
            birdList.push(bird)
            if (bird.fitness > max || max === null) max = bird.fitness
            if (bird.fitness < min || min === null) min = bird.fitness
        });
        //Use normal js array to store birds so we can use normal js operations
        birdList.forEach(bird => {
            bird.fitness = (bird.fitness - min) / (max - min)
        })
        birdList.sort((a, b) => {
            return a.fitness - b.fitness
        })
        this.birds = birdList

        //Pass on 3 best directly
        let bestThree = []
        for (let i = this.birds.length - 1; i > this.birds.length - 4; i--) {
            bestThree.push(this.birds[i])
        }

        //Generate offsprings for the rest
        this.parentPool = this.pool(this.birds)
        for (let i = 0; i < 3; i++) {
            this.parentPool[i] = bestThree.pop()
        }

        console.log(this.parentPool)
    }

    /**
     * Iterate over every value and with a fixed chance randomly change it
     */
    mutate(children) {
        const chance = new Chance()
        for (let i = 0; i < children.length; i++) {
            for (let k = 0; k < children[i].length; k++) {
                for (let j = 0; j < children[i][k].length; j++) {
                    for (let l = 0; l < children[i][k][j].length; l++) {
                        if (chance.floating({
                                min: 0,
                                max: 1,
                                fixed: 10
                            }) < this.mutationRate) {
                            children[i][k][j][l] = chance.floating({
                                min: -1,
                                max: 1,
                                fixed: 10
                            })
                        }
                    }
                }
            }
        }
        return children
    }
}