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

const getPaginatedPosts = async ({ limit, timestamp, postStatusId, search, categoryId, age, gender }) => {
  return await prisma.posts.findMany({
    where: {
        ...(postStatusId && { postStatusId: Number(postStatusId) }),
        ...(categoryId && { categoryId: Number(categoryId) }),
        ...(age && { age: Number(age) }),
        ...(gender && { gender: { equals: gender, mode: 'insensitive' } }),
        ...(search && {
            OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
            ]
        }),
        ...(timestamp && { createdAt: { lt: new Date(timestamp) } }),
    },
    orderBy: {
        createdAt: 'desc',
    },
    take: Number(limit),
    include: {
        postStatuses: true,
        files: true,
        users: true,
        }
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
