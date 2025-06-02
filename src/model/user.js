const { prisma } = require('../db/client');

const getUser = (filters = {}) => {
  return prisma.users.findFirst({
    where: filters,
    include: {
      files: true,
      userRoles: true,
      refreshTokens: true,
    },
  });
};

const getUsers = (filters = {}) => {
  return prisma.users.findMany({
    where: filters,
    include: {
      files: true,
      userRoles: true,
      refreshTokens: true,
    },
  });
};

const updateUser = (filters = {}, updatedData = {}) => {
  return prisma.users.updateMany({
    where: filters,
    data: updatedData,
  });
};

const createUser = async ({ username, hashedPassword, email }) => {
  if (!username || !hashedPassword || !email) {
    throw new Error('Missing required user fields.');
  }

  return await prisma.users.create({
    data: {
      username,
      hashedPassword,
      email,
    },
    include: {
      files: true,
      userRoles: true,
      refreshTokens: true,
    },
  });
};

const clearRefreshTokens = async (userId) => {
    return await prisma.refresh_tokens.deleteMany({
        where: { userId },
    });
};

module.exports = {
  getUser,
  getUsers,
  updateUser,
  createUser,
  clearRefreshTokens,
};
