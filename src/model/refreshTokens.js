const { prisma } = require('../db/client');

const getRefreshToken = (filters = {}) => {
  return prisma.refresh_tokens.findFirst({
    where: filters,
    include: {
      users: true,
    },
  });
};

const getRefreshTokens = (filters = {}) => {
  return prisma.refresh_tokens.findMany({
    where: filters,
    include: {
      users: true,
    },
  });
};

const updateRefreshToken = (filters = {}, updatedData = {}) => {
  return prisma.refresh_tokens.updateMany({
    where: filters,
    data: updatedData,
  });
};

const deleteRefreshTokens = (filters = {}) => {
  return prisma.refresh_tokens.deleteMany({
    where: filters,
  });
};

const createRefreshToken = async ({ userId, refreshToken }) => {
  if(!userId || !refreshToken){
    throw new Error('Missing required token fields.');
  }

  return await prisma.refresh_tokens.create({
    data: {
      userId,
      token: refreshToken,
    },
    include: {
      users: true,
    },
  });
};

module.exports = {
  getRefreshToken,
  getRefreshTokens,
  updateRefreshToken,
  deleteRefreshTokens,
  createRefreshToken,
};
