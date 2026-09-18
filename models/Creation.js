// Importe Mongoose.
//
// Mongoose facilite la communication entre
// notre backend Node/Express et MongoDB.
const mongoose = require("mongoose");

// --------------------------------------------------
// IMAGES AUTORISEES
// --------------------------------------------------
//
// Une création peut uniquement utiliser
// l'un des 20 backgrounds prévus par Astraya.
//
// Cela évite d'enregistrer n'importe quelle
// chaîne de caractères comme image.
const allowedImages = Array.from(
  { length: 20 },
  (_, index) =>
    `images/ambiant-images/astraya-background-${index + 1}.png`
);

// --------------------------------------------------
// SCHEMA CREATION
// --------------------------------------------------
//
// Ce schema décrit la structure
// d'une création Astraya sauvegardée.
const creationSchema = new mongoose.Schema(
  {
    // Identifiant de l'utilisateur propriétaire.
    //
    // ObjectId est le type d'identifiant
    // utilisé automatiquement par MongoDB.
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

    // Artwork choisi par l'utilisateur.
    //
    // On sauvegarde uniquement le chemin relatif.
    //
    // Exemple :
    // images/ambiant-images/astraya-background-5.png
    image: {
      type: String,

      // Seules nos 20 images officielles
      // sont autorisées.
      enum: allowedImages,

      // Les nouvelles créations utilisent
      // background-3 si aucune image n'est reçue.
      default:
        "images/ambiant-images/astraya-background-3.png",

      required: true,
    },

    // Configuration audio de la création.
    audioConfig: {
      // Pitch :
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

      // Pad Atmosphere actif ou non.
      atmosphereEnabled: {
        type: Boolean,
        required: true,
      },

      // Musical Theme actif ou non.
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
const Creation = mongoose.model(
  "Creation",
  creationSchema
);

// Rend le modèle disponible ailleurs.
module.exports = Creation;