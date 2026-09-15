// Importe Mongoose.
//
// Mongoose facilite la communication entre
// notre backend Node/Express et MongoDB.
const mongoose = require("mongoose");

// Ce schema décrit la structure
// d'une création Astraya sauvegardée.
const creationSchema = new mongoose.Schema(
  {
    // Identifiant de l'utilisateur propriétaire
    // de cette création.
    //
    // ObjectId est le type d'identifiant
    // utilisé automatiquement par MongoDB.
    //
    // ref: "User" indique que cet identifiant
    // correspond à un document du modèle User.
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Nom choisi par l'utilisateur.
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Configuration audio de la création.
    audioConfig: {
      // Pitch du mix :
      // dark, natural ou bright.
      pitch: {
        type: String,
        required: true,
      },

      // Atmosphère :
      // airy ou deep.
      atmosphere: {
        type: String,
        required: true,
      },

      // Indique si le pad Atmosphere est actif.
      atmosphereEnabled: {
        type: Boolean,
        required: true,
      },

      // Indique si le Musical Theme est actif.
      musicalThemeEnabled: {
        type: Boolean,
        required: true,
      },

      // Volumes des sons de nature.
      natureVolumes: {
        rain: {
          type: Number,
          required: true,
        },

        forest: {
          type: Number,
          required: true,
        },

        birds: {
          type: Number,
          required: true,
        },

        river: {
          type: Number,
          required: true,
        },

        waves: {
          type: Number,
          required: true,
        },
      },
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
// Creation permettra notamment de :
// - sauvegarder une création
// - chercher les créations d'un utilisateur
// - supprimer une création
// - modifier une création
const Creation = mongoose.model(
  "Creation",
  creationSchema
);

// Rend le modèle disponible ailleurs.
module.exports = Creation;