import type { RequestHandler, Response as ExpressResponse } from 'express';
import { User } from '../models/user.js';
import { mailer } from '../services/email.service.js';
import { v4 as uuidV4 } from 'uuid';
import bcrypt from 'bcrypt';
import { UniqueConstraintError } from 'sequelize';
import { NormalizedUser, userService } from '../services/user.service.js';
import { jwt } from '../utils/jwt.js';

async function sendAuthentication(res: ExpressResponse, user: User) {
  const userData = userService.normalize(user);
  const accessToken = jwt.generateAccessToken(userData);
  const refreshToken = jwt.generateRefreshToken(userData);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  res.send({
    user: userData,
    accessToken,
  });
}

const register: RequestHandler = async (req, res) => {
  // res.json({ user: null });
  const { email, password, name } = req.body;

  const errors = {
    name: userService.validateName(name),
    email: userService.validateEmail(email),
    password: userService.validatePassword(password),
  };

  if (Object.values(errors).some((error) => error)) {
    res.status(400).json({
      errors,
      ...(errors.password && { passwordRules: userService.passwordRules }),
      message: 'Validation error',
    });

    return;
  }

  const existingUser = await User.findOne({ where: { email } });

  if (existingUser) {
    res.status(409).json({
      errors: { email: 'Email is already taken' },
      message: 'Validation error',
    });

    return;
  }

  const activationToken = uuidV4();
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  try {
    const newUser = await User.create({
      email,
      password: hashedPassword,
      name,
      activationToken,
    });

    await mailer.sendActivationLink(email, activationToken);

    res.status(201).send(userService.normalize(newUser));
  } catch (e) {
    if (e instanceof UniqueConstraintError) {
      res.status(409).json({
        errors: { email: 'Email is already taken' },
        message: 'Validation error',
      });

      return;
    }

    throw e;
  }
};

const activate: RequestHandler = async (req, res) => {
  const { activationToken } = req.params;
  const user = await User.findOne({
    where: { activationToken },
  });

  if (!user) {
    res.sendStatus(404);

    return;
  }
  user.activationToken = null;
  await user.save();
  res.redirect('/profile');
};

const login: RequestHandler = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);
  const isPasswordValid = await bcrypt.compare(password, user?.password || '');

  if (!user || !isPasswordValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (user.activationToken) {
    res.status(403).json({ message: 'Please activate your email' });

    return;
  }

  sendAuthentication(res, user);
  res.redirect('/profile');
};

const logout: RequestHandler = async (req, res) => {
  res.clearCookie('refreshToken');
  res.sendStatus(204);
};

const refresh: RequestHandler = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || '';
  const userData = jwt.validateRefreshToken(refreshToken) as NormalizedUser;

  if (!userData) {
    res.status(401).json({ message: 'Invalid token' });

    return;
  }

  const user = await userService.findByEmail(userData.email);

  if (!user) {
    res.status(401).json({ message: 'Invalid token' });

    return;
  }

  await sendAuthentication(res, user);
};

export const authController = {
  register,
  activate,
  login,
  logout,
  refresh,
};
