const { prisma } = require('../db/client');

const followUser = async ({ followerId, userId }) => {
    return await prisma.user_follows.create({
        data: {
            followerId,
            userId,
        }
    })
}

const unfollowUser = async ({ followerId, userId }) => {
    return await prisma.user_follows.deleteMany({
        where: {
            followerId,
            userId,
        }
    })
}

const followPost = async ({ followerId, postId }) => {
    return await prisma.post_follows.create({
        data: {
            followerId,
            postId,
        }
    })
}

const unfollowPost = async ({ followerId, postId }) => {
    return await prisma.post_follows.deleteMany({
        where: {
            followerId,
            postId,
        }
    })
}

const getUserFollowers = async ({ userId }) => {
    return await prisma.user_follows.findMany({
        where: { userId },
    });
}

const getPostFollowers = async ({ postId }) => {
    return await prisma.post_follows.findMany({
        where: { postId },
    });
}

const getUserFollowersCount = async (userId) => {
    const count = await prisma.user_follows.count({
        where: { userId }
    });
    return count;
}

const getPostFollowersCount = async (postId) => {
    const count = await prisma.post_follows.count({
        where: { postId }
    });
    return count;
}

const isUserFollowed = async ({ followerId, userId }) => {
    const follow = await prisma.user_follows.findFirst({
        where: {
            followerId,
            userId,
        }
    });
    return !!follow;
}

const isPostFollowed = async ({ followerId, postId }) => {
    const follow = await prisma.post_follows.findFirst({
        where: {
            followerId,
            postId,
        }
    });
    return !!follow;
}

module.exports = {
  followUser,
  unfollowUser,
  followPost,
  unfollowPost,
  getUserFollowersCount,
  getPostFollowersCount,
  isUserFollowed,
  isPostFollowed,
  getUserFollowers,
  getPostFollowers,
}