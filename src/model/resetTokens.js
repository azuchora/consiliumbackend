const { prisma } = require('../db/client');

const createPasswordResetToken = async ({ userId, token, expiresAt }) => {
    return prisma.reset_tokens.create({
        data: { userId, token, expiresAt }
    });
};

const getPasswordResetToken = async ({ token }) => {
    return prisma.reset_tokens.findUnique({ where: { token } });
};

const deletePasswordResetToken = async ({ token }) => {
    return prisma.reset_tokens.deleteMany({ where: { token } });
};

module.exports = {
    createPasswordResetToken,
    getPasswordResetToken,
    deletePasswordResetToken,
};