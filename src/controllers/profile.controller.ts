import { RequestHandler } from 'express';
import { User } from '../models/user.js';
import { userService } from '../services/user.service.js';

const getCurrentUser = async (userId: number) => User.findByPk(userId);

const get: RequestHandler = async (req, res) => {
  const { id } = res.locals.user as { id: number };
  const user = await getCurrentUser(id);

  if (!user) {
    res.status(404).json({ message: 'User not found' });

    return;
  }

  res.json(userService.normalize(user));
};

const changeName: RequestHandler = async (req, res) => {};
const changePassword: RequestHandler = async (req, res) => {};
const changeEmail: RequestHandler = async (req, res) => {};

export const profileController = {
  get,
  changeName,
  changePassword,
  changeEmail,
};
