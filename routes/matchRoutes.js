const express = require("express");
const { userAuth } = require("../middlewares/auth");
const Match = require("../models/Match");
const User = require("../models/User");

const matchRoutes = express.Router();

// Ruta para dar like
matchRoutes.post("/like", userAuth, async (req, res) => {
  try {
    const { userId, likedUserId } = req.body;

    // Buscar los usuarios
    const user = await User.findById(userId);
    const likedUser = await User.findById(likedUserId);

    if (!user || !likedUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Añadir likedUserId a likedUsers si no está ya
    let isNewLike = false;
    if (!user.likedUsers.includes(likedUserId)) {
      user.likedUsers.push(likedUserId);
      await user.save();
      isNewLike = true;
    }

    // Verificar si ya existe un match en la dirección opuesta (match mutuo)
    const existingMatch = await Match.findOne({
      user1: likedUserId,
      user2: userId,
    });

    let isMutualMatch = false;
    if (existingMatch) {
      isMutualMatch = true; // Ya había un like del otro usuario
    } else if (isNewLike) {
      // Si es un like nuevo y no hay match mutuo, crear el match unilateral
      const newMatch = new Match({
        user1: userId,
        user2: likedUserId,
      });
      await newMatch.save();
    }

    // Responder al frontend
    res.json({
      message: isMutualMatch ? "¡Es un match mutuo!" : "Like registrado",
      success: true,
      isMutualMatch: isMutualMatch, // Bandera para indicar match mutuo
    });
  } catch (error) {
    console.error("Error en /like:", error.stack);
    res.status(500).json({ message: error.message, success: false });
  }
});

// Ruta para obtener los matches del usuario
matchRoutes.get("/user/:userId", userAuth, async (req, res) => {
  const { userId } = req.params;

  try {
    const matches = await Match.find({
      $or: [{ user1: userId }, { user2: userId }],
    }).populate("user1 user2");

    // Formatear los datos para Connections.js
    const formattedMatches = matches.map((match) => {
      const otherUser = match.user1._id.toString() === userId ? match.user2 : match.user1;
      return {
        _id: otherUser._id,
        firstName: otherUser.firstName,
        lastName: otherUser.lastName,
        photoUrl: otherUser.photoUrl,
        age: otherUser.age,
        gender: otherUser.gender,
        about: otherUser.about,
      };
    });

    res.status(200).json({ data: formattedMatches });
  } catch (error) {
    console.error("Error en getUserMatches:", error.stack);
    res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
});

// Ruta para eliminar un match
matchRoutes.delete("/:userId/:matchUserId", userAuth, async (req, res) => {
  const { userId, matchUserId } = req.params;

  try {
    // Buscar y eliminar el match en ambas direcciones
    const deletedMatch = await Match.findOneAndDelete({
      $or: [
        { user1: userId, user2: matchUserId },
        { user1: matchUserId, user2: userId }
      ]
    });

    if (!deletedMatch) {
      return res.status(404).json({ message: "Match no encontrado", success: false });
    }

    // Actualizar los likedUsers de ambos usuarios
    await User.findByIdAndUpdate(userId, {
      $pull: { likedUsers: matchUserId }
    });

    await User.findByIdAndUpdate(matchUserId, {
      $pull: { likedUsers: userId }
    });

    res.json({ message: "Match eliminado correctamente", success: true });
  } catch (error) {
    console.error("Error al eliminar match:", error.stack);
    res.status(500).json({ message: error.message, success: false });
  }
});

module.exports = matchRoutes;