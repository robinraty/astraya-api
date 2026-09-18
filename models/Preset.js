// --------------------------------------------------
// IMPORT
// --------------------------------------------------

const mongoose = require("mongoose");

// --------------------------------------------------
// SCHEMA PRESET
// --------------------------------------------------
//
// Un Preset est une méditation officielle Astraya.
//
// Contrairement à Creation :
// - il n'appartient pas à un utilisateur
// - il possède une description officielle
// - il est disponible pour tout le monde

const presetSchema = new mongoose.Schema(
  {
    // Identifiant lisible utilisé côté frontend.
    //
    // Exemple :
    // airy-birds
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // Nom affiché.
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Description affichée dans le carousel.
    description: {
      type: String,
      required: true,
      trim: true,
    },

    // Chemin relatif vers l'artwork.
    //
    // Exemple :
    // images/ambiant-images/astraya-background-1.png
    image: {
      type: String,
      required: true,
    },

    // Configuration audio complète du preset.
    audioConfig: {
      pitch: {
        type: String,
        required: true,
      },

      atmosphere: {
        type: String,
        required: true,
      },

      atmosphereEnabled: {
        type: Boolean,
        required: true,
      },

      musicalThemeEnabled: {
        type: Boolean,
        required: true,
      },

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
    timestamps: true,
  }
);

const Preset = mongoose.model(
  "Preset",
  presetSchema
);

module.exports = Preset;
