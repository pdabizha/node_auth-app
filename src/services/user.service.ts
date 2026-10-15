import { User } from '../models/user.js';

export type NormalizedUser = {
  id: number;
  email: string;
  name: string;
};

function validateName(name: unknown) {
  if (typeof name !== 'string' || !name.trim()) {
    return 'Name is required';
  }
}

function validateEmail(email: string) {
  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!email) {
    return 'Email is required';
  }

  if (!emailPattern.test(email)) {
    return 'Email is not valid';
  }
}

function validatePassword(password: string) {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < 6) {
    return 'At least 6 characters';
  }
}

function normalize({ id, email, name }: User) {
  return { id, email, name };
}

function findByEmail(email: string) {
  return User.findOne({ where: { email } });
}

export const userService = {
  validateName,
  validateEmail,
  validatePassword,
  normalize,
  findByEmail,
};
