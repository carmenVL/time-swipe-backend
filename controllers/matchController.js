const User = require("../models/User");
const Match = require("../models/Match");

exports.likeUser = async (req, res) => {
  const { userId, likedUserId } = req.body;

  console.log("Datos recibidos:", { userId, likedUserId }); // Verifica los datos de entrada

  // Validar que los IDs estén presentes
  if (!userId || !likedUserId) {
    return res.status(400).json({ message: "Faltan userId o likedUserId" });
  }

  try {
    // Buscar los usuarios
    const user = await User.findById(userId);
    const likedUser = await User.findById(likedUserId);

    console.log("Usuario actual:", user); // Verifica si se encuentra el usuario
    console.log("Usuario likeado:", likedUser);

    if (!user || !likedUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Añadir likedUserId a likedUsers si no está ya
    if (!user.likedUsers.includes(likedUserId)) {
      user.likedUsers.push(likedUserId);
      await user.save();
      console.log("Usuario actualizado:", await User.findById(userId));
    } else {
      console.log("El usuario ya había dado like a este perfil");
    }

    // Crear un match automáticamente
    const newMatch = new Match({ user1: userId, user2: likedUserId });
    await newMatch.save();
    console.log("Match creado:", await Match.findOne({ user1: userId, user2: likedUserId }));

    res.status(200).json({ message: "Like registrado y match creado" });
  } catch (error) {
    console.error("Error en likeUser:", error.stack); // Muestra el stack trace completo
    res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
};

exports.getUserMatches = async (req, res) => {
  const { userId } = req.params;

  try {
    const matches = await Match.find({
      $or: [{ user1: userId }, { user2: userId }],
    }).populate("user1 user2");

    res.status(200).json(matches);
  } catch (error) {
    console.error("Error en getUserMatches:", error.stack);
    res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
};
