const LENGTH_LIMITS = {
    username: {
        min: 3,
        max: 32
    },
    password: {
        min: 8,
        max: 32
    },
    comment: {
        min: 1,
        max: 800
    },
}

module.exports = LENGTH_LIMITS;