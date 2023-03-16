import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import { generateToken, isAuth } from "../utils.js";

const userRouter = express.Router();

userRouter.post("/signin", async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    if (bcrypt.compareSync(password, user.password)) {
      return res.send({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user),
      });
    }
  }
  return res.status(401).send({ message: "Invalid email or password" });
});
userRouter.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  const check_user = await User.findOne({ email });
  if (check_user) {
    return res.status(400).send({
      message: "Email already exist",
    });
  }
  const newUser = new User({
    name,
    email,
    password: bcrypt.hashSync(password),
    isAdmin: false,
  });
  const user = await newUser.save();
  return res.send({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    token: generateToken(user),
  });
});
userRouter.put("/profile", isAuth, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    const { name, email, password } = req.body;
    user.name = name;
    user.email = email;
    if (password) {
      user.password = bcrypt.hashSync(password, 8);
    }
    const updatedUser = await user.save();
    return res.send({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      token: generateToken(updatedUser),
    });
  } else {
    return res.status(404).send({ message: "User not Found" });
  }
});
export default userRouter;
