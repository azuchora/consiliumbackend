const { prisma } = require('../db/client');

const usersSelect = {
    id: true,
    username: true,
    surname: true,
    name: true,
    id: true,
    username: true,
    surname: true,
    name: true,
}

const filesSelect = {
    id: true,
    filename: true,
    createdAt: true,
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
            post_votes: {
                select: {
                    userId: true,
                    value: true,
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
                ...usersSelect,
                files: {
                    select: filesSelect,
                },
                },
            },
            files: {
                select: filesSelect,
            },
            post_votes: {
                select: {
                    userId: true,
                    value: true,
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
    return prisma.posts.updateMany({
        where: filters,
        data: updatedData,
    });
};

const deletePost = (filters = {}) => {
    return prisma.posts.deleteMany({
        where: filters,
    });
    return prisma.posts.deleteMany({
        where: filters,
    });
};

const createPost = async ({ userId, title, description, age, gender, postStatusId }) => {
    if(!userId || !title || !description){
        throw new Error('Missing required post fields.');
    }

  return await prisma.posts.create({
    data: {
        userId,
        title,
        description,
        age: age ? Number(age) : null,
        gender,
        postStatusId : postStatusId ? Number(postStatusId) : 1,
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

const getPaginatedPosts = async ({ limit, timestamp, postStatusId, search, categoryId, age, gender, username }) => {
    return await prisma.posts.findMany({
        where: {
            ...(postStatusId && { postStatusId: Number(postStatusId) }),
            ...(categoryId && { categoryId: Number(categoryId) }),
            ...(age && { age: Number(age) }),
            ...(gender && { gender: { equals: gender, mode: 'insensitive' } }),
            ...(username && {
                users: {
                username: {
                    equals: username,
                    mode: 'insensitive',
                },
                },
            }),
            ...(search && {
                OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                {
                    users: {
                    username: {
                        contains: search,
                        mode: 'insensitive',
                    },
                    },
                },
                ],
            }),
            ...(timestamp && { createdAt: { lt: timestamp } }),
        },
        orderBy: {
            createdAt: 'desc',
        },
        take: Number(limit),
            include: {
                postStatuses: true,
                files: {
                    select: filesSelect,
                },
                users: {
                    select: {
                        ...usersSelect,
                        files: {
                            select: filesSelect,
                        },
                    },
                },
                post_votes: {
                    select: {
                        userId: true,
                        value: true,
                    },
                },
        },
    });
};

const upsertPostVote = async ({ userId, postId, value }) => {
    return await prisma.post_votes.upsert({
        where: {
            userId_postId: {
                userId,
                postId
            }
        },
        update: {
            value
        },
        create: {
            userId,
            postId,
            value
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
  upsertPostVote,
};
