// Importe Mongoose.
//
// Mongoose est une librairie qui facilite la communication
// entre notre backend Node/Express et MongoDB.
//
// Ici, on l'utilise pour définir la structure
// d'un utilisateur dans la base de données.
const mongoose = require("mongoose");

// Ce schema décrit la forme d'un utilisateur Astraya.
//
// On peut le voir comme le "template" des utilisateurs
// qui seront enregistrés dans MongoDB.
const userSchema = new mongoose.Schema(
  {
    // Nom affiché de l'utilisateur.
    //
    // Exemple :
    // "Robin"
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Adresse email utilisée pour se connecter.
    email: {
      type: String,
      required: true,

      // Empêche deux utilisateurs
      // d'avoir exactement le même email.
      unique: true,

      // Supprime les espaces accidentels
      // au début et à la fin.
      trim: true,

      // Stocke toujours l'email en minuscules.
      //
      // Exemple :
      // Test@Email.com devient test@email.com
      lowercase: true,
    },

    // Mot de passe de l'utilisateur.
    //
    // IMPORTANT :
    // on ne stockera jamais le vrai mot de passe ici.
    //
    // Avant la sauvegarde, il sera transformé
    // en hash avec bcrypt.
    password: {
      type: String,
      required: true,

      // Longueur minimale du hash stocké.
      //
      // Ce n'est PAS la longueur minimale
      // du mot de passe entré par l'utilisateur.
      minlength: 6,
    },
  },
  {
    // Ajoute automatiquement :
    // createdAt
    // updatedAt
    timestamps: true,
  }
);

// Transforme le schema en modèle utilisable.
//
// "User" sera l'objet qu'on utilisera plus tard pour :
// - créer un utilisateur
// - chercher un utilisateur par email
// - récupérer un utilisateur par son id
const User = mongoose.model("User", userSchema);

// Rend le modèle disponible
// dans les autres fichiers du backend.
module.exports = User;