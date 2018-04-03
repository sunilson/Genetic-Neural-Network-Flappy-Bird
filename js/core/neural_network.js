class NeuralNetwork {
    constructor(nodes) {
        this.weights = []
        this.nodes = nodes

        for (let i = 1; i < nodes.length; i++) {
            this.weights.push(math.zeros([nodes[i], nodes[i - 1]]))
        }

        const chance = new Chance()
        this.weights = this.weights.map(weight => {
            return weight.map(row => {
                return row.map(val => {
                    return chance.floating({
                        min: -1,
                        max: 1,
                        fixed: 10
                    })
                })
            })
        })
    }

    query(inputs) {
        inputs = math.transpose(math.matrix([inputs]))
        for (let i = 0; i < this.nodes.length - 1; i++) {
            inputs = math.map(math.multiply(this.weights[i], inputs), (value) => {
                return 1 / (1 + Math.exp(value))
            });
        }

        let returnValue = 0
        math.forEach(inputs, value => {
            returnValue = value
        })
        return returnValue
    }
}