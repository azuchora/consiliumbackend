const { prisma } = require('../db/client');

const getFile = (filters = {}) => {
  return prisma.files.findFirst({
    where: filters,
  });
};

const getFiles = (filters = {}) => {
  return prisma.files.findMany({
    where: filters,
  });
};

const updateFile = async (filters = {}, updatedData = {}) => {
  const filterKeys = Object.keys(filters);
  if(filterKeys.length !== 1){
    throw new Error('Exactly one filter is required for update.');
  }

  const where = {};
  where[filterKeys[0]] = filters[filterKeys[0]];

  return prisma.files.update({
    where,
    data: updatedData,
  });
};

const deleteFile = (filters = {}) => {
  const filterKeys = Object.keys(filters);
  if(filterKeys.length !== 1){
    throw new Error('Exactly one filter is required for delete.');
  }

  const where = {};
  where[filterKeys[0]] = filters[filterKeys[0]];

  return prisma.files.delete({
    where,
  });
};

const createFile = async (fileData = {}) => {
  const keys = Object.keys(fileData);

  if(keys.length === 0){
    throw new Error('No file data provided');
  }

  const refKeys = ['userId', 'postId', 'commentId'];
  const refCount = refKeys.filter(key => fileData[key] != null).length;

  if(refCount !== 1){
    throw new Error('Exactly one of userId, postId, or commentId must be provided.');
  }

  if(!fileData.filename){
    throw new Error('Filename is required');
  }

  return prisma.files.create({
    data: fileData,
  });
};

module.exports = {
  getFile,
  getFiles,
  updateFile,
  createFile,
  deleteFile,
};
