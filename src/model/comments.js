const { prisma } = require('../db/client');

const userSelect = {
    createdAt: true,
    username: true,
    name: true,
    surname: true,
    files: true,
};

const getComment = (filters = {}) => {
    return prisma.comments.findFirst({
        where: filters,
        include: {
        files: true,
        users: {
            select: userSelect,
        },
        comment_votes: {
            select: {
            userId: true,
            value: true,
            },
        },
        },
    });
};

const getComments = (filters = {}) => {
    return prisma.comments.findMany({
        where: filters,
        include: {
        files: true,
        users: {
            select: userSelect,
        },
        },
    });
};

const updateComment = (filters = {}, updatedData = {}) => {
    return prisma.comments.updateMany({
        where: filters,
        data: updatedData,
    });
};

const deleteComment = (filters = {}) => {
    return prisma.comments.deleteMany({
        where: filters,
    });
};

const createComment = async ({ postId, userId, content, parentCommentId = null }) => {
    if(!userId || !content || !postId){
        throw new Error('Missing required comment fields.');
    }

    return await prisma.comments.create({
        data: {
            postId: postId,
            userId: userId,
            content: content,
            commentId: parentCommentId,
        },
        include: {
            files: true,
            users: {
                select: userSelect,
            },
            posts: {
                select: {
                    userId: true,
                },
            },
        },
    });
};

const getPaginatedParentComments = async ({ postId, limit, timestamp }) => {
    if(!postId || !limit){
        throw new Error('Missing required comment fields');
    }

    const where = {
        postId: postId,
        commentId: null,
        ...(timestamp && { createdAt: { lt: new Date(timestamp) } }),
    };

    return await prisma.comments.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
        files: true,
        users: {
            select: userSelect,
        },
        comment_votes: {
            select: {
                userId: true,
                value: true,
            },
        },
        posts: {
            select: {
                userId: true,
            },
        },
    },
    });
};

const getPaginatedChildComments = async ({ parentId, limit, timestamp }) => {
    if(!parentId || !limit){
        throw new Error('Missing required comment fields');
    }

    const where = {
        commentId: parentId,
        ...(timestamp && { createdAt: { lt: new Date(timestamp) } }),
    };

    return await prisma.comments.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
            files: true,
            users: {
            select: userSelect,
            },
            comment_votes: {
                select: {
                    userId: true,
                    value: true,
                },
            },
            posts: {
                select: {
                    userId: true,
                },
            },
        },
    });
};

const upsertCommentVote = async ({ userId, commentId, value }) => {
    return await prisma.comment_votes.upsert({
        where: {
            userId_commentId: {
                userId,
                commentId
            }
        },
        update: {
            value
        },
        create: {
            userId,
            commentId,
            value
        }
    });
};

const deleteCommentVote = async ({ userId, commentId }) => {
    return await prisma.comment_votes.delete({
        where: {
            userId_commentId: {
                userId,
                commentId
            }
        }
    });
}

const markCommentHelpful = async ({ commentId, isHelpful }) => {
    return await prisma.comments.update({
        where: { id: commentId },
        data: { isHelpful }
    });
};

module.exports = {
  getComment,
  getComments,
  updateComment,
  deleteComment,
  createComment,
  getPaginatedParentComments,
  getPaginatedChildComments,
  upsertCommentVote,
  deleteCommentVote,
  markCommentHelpful,
};
