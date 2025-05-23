const { prisma } = require('../db/client');

const usersSelect = {
  id: true,
  username: true,
  surname: true,
  name: true,
}

const filesSelect = {
  id: true,
  filename: true,
  createdAt: true,
}

const getPost = (filters = {}) => {
  return prisma.posts.findFirst({
    where: filters,
    include: {
      users: {
        select: {
          ...usersSelect,
          files: {
            select: filesSelect,
          },
        },
      },
      files: {
        select: filesSelect,
      },
    },
  });
};

const getPosts = (filters = {}) => {
  return prisma.posts.findMany({
    where: filters,
    include: {
      users: {
        select: {
          ...usersSelect,
          files: {
            select: filesSelect,
          },
        },
      },
      files: {
        select: filesSelect,
      },
    },
  });
};

const updatePost = (filters = {}, updatedData = {}) => {
  return prisma.posts.updateMany({
    where: filters,
    data: updatedData,
  });
};

const deletePost = (filters = {}) => {
  return prisma.posts.deleteMany({
    where: filters,
  });
};

const createPost = async ({ userId, title, description }) => {
  if(!userId || !title || !description){
    throw new Error('Missing required post fields.');
  }

  return await prisma.posts.create({
    data: {
      userId,
      title,
      description,
    },
    include: {
      users: {
        select: {
          ...usersSelect,
          files: {
            select: filesSelect,
          },
        },
      },
      files: {
        select: filesSelect,
      },
    },
  });
};

const getPaginatedPosts = async ({ limit, timestamp, filters = {} }) => {
  if(!limit){
    throw new Error('Missing required fields');
  }

  const where = {
    ...filters,
    ...(timestamp ? { createdAt: { lt: new Date(timestamp) } } : {}),
  };

  return await prisma.posts.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      users: {
        select: {
          ...usersSelect,
          files: {
            select: filesSelect,
          },
        },
      },
      files: {
        select: filesSelect
      },
    },
  });
};

module.exports = {
  getPost,
  getPosts,
  updatePost,
  deletePost,
  createPost,
  getPaginatedPosts,
};
