import model from '../../models/index.js';
import bcrypt from 'bcrypt';
const controller = {};

// Get Users
controller.getUsers = async (req, res) => {
  try {
    const users = await model.Users.findAll({
      attributes: ['userId', 'username', 'email'],
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: 'Gagal mendapatkan user',
    });
  }
};

// Update users password
controller.updatePassword = async (req, res) => {
  const userId = req.userId;
  let { password, newPassword, confPassword } = req.body;
  try {
    const user = await model.Users.findOne({
      id: userId,
    });
    // Cek current password is match
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({
        status: 'fail',
        message: 'Password yang anda masukkan salah',
      });
    }

    // Cek updated password match with confirm password
    if (newPassword !== confPassword) {
      return res.status(400).json({
        status: 'fail',
        message: 'Password tidak cocok, silahkan masukkan kembali password anda',
      });
    }
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(newPassword, salt);

    await model.Users.update(
      { password: hashPassword },
      {
        where: {
          userId: userId,
        },
      }
    );
    await user.save();
    return res.status(200).json({
      status: 'success',
      message: 'Update password berhasil',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'fail',
      message: 'Terjadi kesalahan saat update password',
    });
  }
};

// Update users profile
controller.updateProfile = async (req, res) => {
  const userId = req.userId;
  const { fullName, phoneNumber, birthDate, gender } = req.body;
  try {
    const user = await model.Users.findOne({
      userId: userId,
    });
    await model.Users.update(
      {
        fullName: fullName,
        phoneNumber: phoneNumber,
        birthDate: birthDate,
        gender: gender,
      },
      {
        where: {
          userId: userId,
        },
      }
    );
    await user.save();
    return res.status(200).json({
      status: 'success',
      message: 'Update profile berhasil',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'fail',
      message: 'Terjadi kesalahan saat update profile',
    });
  }
};

controller.forgotPassword = async (req, res) => {
  const { username, newPassword, confPassword } = req.body;
  const user = await model.Users.findOne({
    where: {
      username: username,
    },
  });
  // Check if username exists
  if (!username) {
    return res.status(401).json({
      status: 'fail',
      message: 'Username tidak ditemukan',
    });
  }
  try {
    // Cek updated password match with confirm password
    if (newPassword !== confPassword)
      return res.status(400).json({
        status: 'fail',
        message: 'Password tidak cocok, silahkan masukkan kembali password anda',
      });
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(newPassword, salt);
    await model.Users.update(
      { password: hashPassword },
      {
        where: {
          username: username,
        },
      }
    );
    await user.save();
    return res.status(200).json({
      status: 'success',
      message: 'Update password berhasil',
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: 'Terjadi kesalahan saat update password',
    });
    console.log(error);
  }
};

// Get user profile from databases
controller.getUserProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const profileImage = req.body.image;
    const img = await model.Users.findOne({
      image: profileImage,
      attributes: ['userId', 'username', 'fullName', 'email', 'image', 'phoneNumber', 'birthDate', 'gender'],
      where: {
        userId: userId,
      },
    });
    res.status(200).json(img);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: 'fail',
      message: 'User tidak ditemukan',
    });
  }
};

export default controller;
