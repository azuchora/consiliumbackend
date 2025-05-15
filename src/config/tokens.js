const TOKENS = {
    refresh: {
        expiresIn: '7d',
        maxAge: 24 * 60 * 60 * 1000
    },
    access: {
        expiresIn: '120s'
    }
}

module.exports = TOKENS;
