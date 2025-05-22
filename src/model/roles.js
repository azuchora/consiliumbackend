const { prisma } = require('../db/client');

const getRole = (filters = {}) => {
  return prisma.user_roles.findFirst({
    where: filters,
    include: {
      roles: true,
      users: true,
    },
  });
};

const getRoles = (filters = {}) => {
  return prisma.user_roles.findMany({
    where: filters,
    include: {
      roles: true,
      users: true,
    },
  });
};

const assignRole = async ({ userId, roleId }) => {
  if(!userId || !roleId){
    throw new Error('Missing required fields.');
  }

  const existing = await prisma.user_roles.findFirst({
    where: {
      userId,
      roleId,
    },
  });

  if(existing){
    throw new Error('User already has this role.');
  }

  return await prisma.user_roles.create({
    data: {
      userId,
      roleId,
    },
    include: {
      roles: true,
      users: true,
    },
  });
};

const revokeRole = async ({ userId, roleId }) => {
  if(!userId || !roleId){
    throw new Error('Missing required fields.');
  }

  return await prisma.user_roles.deleteMany({
    where: {
      userId,
      roleId,
    },
  });
};

module.exports = {
  getRole,
  getRoles,
  assignRole,
  revokeRole,
};
