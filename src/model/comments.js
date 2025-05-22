const { prisma } = require('../db/client');

const getComment = (filters = {}) => {
  return prisma.comments.findFirst({
    where: filters,
    include: {
      users: true,
      files: true,
    },
  });
};

const getComments = (filters = {}) => {
  return prisma.comments.findMany({
    where: filters,
    include: {
      users: true,
      files: true,
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
      users: true,
      files: true,
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
      users: true,
      files: true,
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
      users: true,
      files: true,
    },
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
};
