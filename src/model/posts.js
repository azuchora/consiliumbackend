const { prisma } = require('../db/client');

const getPost = (filters = {}) => {
  return prisma.posts.findFirst({
    where: filters,
    include: {
      users: {
        select: {
          id: true,
          username: true,
          surname: true,
          name: true,
          files: {
            select: {
              id: true,
              filename: true,
              createdAt: true,
            },
          },
        },
      },
      files: {
        select: {
          id: true,
          filename: true,
          createdAt: true,
        },
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
          id: true,
          username: true,
          surname: true,
          name: true,
          files: {
            select: {
              id: true,
              filename: true,
              createdAt: true,
            },
          },
        },
      },
      files: {
        select: {
          id: true,
          filename: true,
          createdAt: true,
        },
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
          id: true,
          username: true,
          surname: true,
          name: true,
          files: {
            select: {
              id: true,
              filename: true,
              createdAt: true,
            },
          },
        },
      },
      files: {
        select: {
          id: true,
          filename: true,
          createdAt: true,
        },
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
          id: true,
          username: true,
          surname: true,
          name: true,
          files: {
            select: {
              id: true,
              filename: true,
              createdAt: true,
            },
          },
        },
      },
      files: {
        select: {
          id: true,
          filename: true,
          createdAt: true,
        },
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
