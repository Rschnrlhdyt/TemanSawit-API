import model from '../../models/index.js';
import bycrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const controller = {};

// Login Functions
controller.Login = async (req, res) => {
  const username = req.body.username;
  if (!username) {
    return res.status(400).json({
      status: 'fail',
      message: 'Mohon masukkan username anda',
    });
  }
  try {
    const user = await model.Users.findAll({
      where: {
        username: username,
      },
    });
    if (!user || user.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Username tidak ditemukan',
      });
    }
    const match = await bycrypt.compare(req.body.password, user[0].password);
    if (!match)
      return res.status(400).json({
        status: 'fail',
        message: 'Password yang anda masukkan salah',
      });
    const userId = user[0].userId;
    const name = user[0].username;
    const email = user[0].email;
    const accessToken = jwt.sign({ userId, name, email }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '24h',
    });
    const refreshToken = jwt.sign({ userId, name, email }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: '24h',
    });
    await model.Users.update(
      { refresh_token: refreshToken },
      {
        where: {
          userId: userId,
        },
      }
    );
    res.json({ accessToken: accessToken, refreshToken: refreshToken, userId: userId, name: name, email: email });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan saat memproses permintaan Anda',
    });
  }
};

// Logout function
controller.Logout = async (req, res) => {
  const refreshToken = req.headers['authorization'];
  if (!refreshToken) return res.status(401).json({ error: 'Unauthorized' });
  await model.Users.update(
    { refresh_token: null },
    {
      where: {
        refresh_token: refreshToken,
      },
    }
  );
  return res.status(200).json({
    status: 'success',
    message: 'Logout berhasil',
  });
};

export default controller;
