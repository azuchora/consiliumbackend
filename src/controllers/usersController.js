const { StatusCodes } = require('http-status-codes');
const fileService = require('../services/fileService');
const { createFile, getFile, updateFile } = require('../model/files');
const { getUser, updateUser, clearRefreshTokens } = require('../model/user');
const { sanitizeId } = require('../services/sanitizationService');
const bcrypt = require('bcrypt');
const { followUser, unfollowUser, isUserFollowed, getUserFollowersCount } = require('../model/follows');
const { createPasswordResetToken, getPasswordResetToken, deletePasswordResetToken } = require('../model/resetTokens');
const { sendResetEmail } = require('../services/emailService');
const crypto = require('crypto');

const handleUploadAvatar = async (req, res) => {
    try {
        const userId = sanitizeId(req.params.id);
        
        if(!userId){
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid user ID.' });
        }

        const user = req.user;

        if(user.id != userId){
            return res.sendStatus(StatusCodes.FORBIDDEN);
        }
        
        const avatarFile = Array.isArray(req.files)
            ? req.files[0]
            : Object.values(req.files)[0];

        if(!avatarFile){
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Avatar file is required.' });
        }

        let filename;
        try {
            filename = await fileService.saveFile(avatarFile);
        } catch (error){
            console.error('Saving avatar to disk failed: ', error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to save avatar. '});
        }

        const existingAvatar = await getFile({ userId: userId });

        try {
            if(existingAvatar){
                const oldAvatar = existingAvatar;

                await updateFile({ id: oldAvatar.id }, { filename });
                await fileService.removeFile(oldAvatar.filename);
            } else{
                await createFile({ filename, userId });
            }
        } catch (error){
            await fileService.removeFile(filename);
            console.error('Saving avatar to db failed: ', error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to save avatar.' });
        }

        return res.status(StatusCodes.OK).json({ filename });
    } catch (error){
        console.error('UploadAvatar error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
};

const handleGetAvatar = async (req, res) => {
    try {
        const userId = sanitizeId(req.params.id);
        
        if(!userId){
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid user ID.' });
        }

        const foundAvatar = await getFile({ userId: userId });
        
        return res.status(StatusCodes.OK).json({ avatarFilename: foundAvatar ? foundAvatar.filename : null });
    } catch (error){
        console.error('getAvatar error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
};

const handleGetUser = async (req, res) => {
    try {
        const username = req.params.username;
        
        if(!username){
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid user ID.' });
        }

        const { 
            id, 
            createdAt,
            name,
            surname,
            files,
            userRoles,
        } = await getUser({ username });
        
        const followersCount = await getUserFollowersCount(id); 
        const isFollowed = await isUserFollowed({ followerId: req.user.id, userId: id });

        return res.status(StatusCodes.OK).json({
            user: {
                id,
                username,
                createdAt,
                name,
                surname,
                followersCount,
                isFollowed,
                files: files.map(file => ({ id: file.id, filename: file.filename })),
                roles: userRoles.map(ur => ur.roleId),
            }
         })
    } catch (error){
        console.error('getUser error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
};

const handleFollowUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const followUserId = sanitizeId(req.params.id);

        if(userId === followUserId){
            return res.status(400).json({ message: 'You cannot follow yourself.' });
        }

        await followUser({ followerId: userId, userId: followUserId });
        return res.status(200).json({ message: 'Followed successfully.' });
    } catch (error) {
        console.error('Error following user:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
}

const handleUnfollowUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const unfollowUserId = sanitizeId(req.params.id);

        if(userId === unfollowUserId){
            return res.status(400).json({ message: 'You cannot unfollow yourself.' });
        }

        await unfollowUser({ followerId: userId, userId: unfollowUserId });
        return res.status(200).json({ message: 'Unfollowed successfully.' });
    } catch (error) {
        console.error('Error unfollowing user:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
}

const handleChangePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Old and new password are required.' });
        }

        const user = await getUser({ id: userId });
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found.' });
        }

        const match = await bcrypt.compare(oldPassword, user.hashedPassword);
        if (!match) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Old password is incorrect.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await updateUser({ id: userId }, { hashedPassword });

        res.status(StatusCodes.OK).json({ message: 'Password changed successfully.' });
        await clearRefreshTokens(userId);
    } catch (error) {
        console.error('ChangePassword error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
};

const handleForgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Email is required.' });

        const user = await getUser({ email });
        if (!user) return res.status(StatusCodes.OK).json({ message: 'If the email exists, a reset link was sent.' });

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1h

        await createPasswordResetToken({ userId: user.id, token, expiresAt });

        await sendResetEmail(user.email, token);

        return res.status(StatusCodes.OK).json({ message: 'If the email exists, a reset link was sent.' });
    } catch (error) {
        console.error('ForgotPassword error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
};

const handleResetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Token and new password are required.' });
        }

        const resetToken = await getPasswordResetToken({ token });
        if (!resetToken || resetToken.expiresAt < new Date()) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid or expired token.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await updateUser({ id: resetToken.userId }, { hashedPassword });
        await deletePasswordResetToken({ token });

        res.status(StatusCodes.OK).json({ message: 'Password reset successfully.' });
        await clearRefreshTokens(userId);
    } catch (error) {
        console.error('ResetPassword error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    handleUploadAvatar,
    handleGetAvatar,
    handleGetUser,
    handleFollowUser,
    handleUnfollowUser,
    handleChangePassword,
    handleForgotPassword,
    handleResetPassword,
}
