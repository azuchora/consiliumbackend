const LENGTH_LIMITS = {
    username: {
        min: 3,
        max: 32
    },
    password: {
        min: 8,
        max: 32
    },
    email: {
        min: 3,
        max: 254
    }
}

module.exports = LENGTH_LIMITS;