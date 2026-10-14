import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateToken } from "../utils/generateToken.js";

const normalizeName = (value = "") => value.replace(/\s+/g, " ").trim();
const normalizeEmail = (value = "") => value.trim().toLowerCase();
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 60;
const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_MAX_LENGTH = 128;

const sanitizeUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const buildAuthResponse = (user) => ({
  token: generateToken(user._id.toString()),
  user: sanitizeUser(user),
});

export const signup = asyncHandler(async (req, res) => {
  const name = normalizeName(req.body.name);
  const email = normalizeEmail(req.body.email);
  const password = typeof req.body.password === "string" ? req.body.password : "";

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email, and password are required.");
  }

  if (!EMAIL_PATTERN.test(email)) {
    res.status(400);
    throw new Error("Please provide a valid email address.");
  }

  if (name.length < NAME_MIN_LENGTH || name.length > NAME_MAX_LENGTH) {
    res.status(400);
    throw new Error(`Name must be between ${NAME_MIN_LENGTH} and ${NAME_MAX_LENGTH} characters.`);
  }

  if (password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
    res.status(400);
    throw new Error(
      `Password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters long.`
    );
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    res.status(409);
    throw new Error("An account with that email already exists.");
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  res.status(201).json(buildAuthResponse(user));
});

export const login = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = typeof req.body.password === "string" ? req.body.password : "";

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required.");
  }

  if (!EMAIL_PATTERN.test(email)) {
    res.status(400);
    throw new Error("Please provide a valid email address.");
  }

  if (password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
    res.status(400);
    throw new Error(
      `Password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters long.`
    );
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password.");
  }

  res.json(buildAuthResponse(user));
});

export const logout = asyncHandler(async (req, res) => {
  res.json({
    message: "Logged out successfully.",
  });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  res.json({
    user: sanitizeUser(req.user),
  });
});
