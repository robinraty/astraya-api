// Importe Mongoose.
// Mongoose est une librairie qui simplifie la communication entre Node/Express et MongoDB.
// Elle permet notamment de définir la structure des données avec des schemas.
const mongoose = require("mongoose");

// Ce schema décrit la forme que doit avoir une création Astraya.
// On peut le voir comme le "modèle de données" d'une création utilisateur.
//
// Quand on voudra sauvegarder une création dans MongoDB,
// Mongoose vérifiera qu'elle respecte cette structure.
const creationSchema = new mongoose.Schema(
  {
    // Nom donné par l'utilisateur à sa création.
    // Exemple : "My Forest", "Deep Sleep", etc.
    name: {
      // Le nom doit être du texte.
      type: String,

      // Le nom est obligatoire pour pouvoir sauvegarder la création.
      required: true,
    },

    // Contient toute la configuration sonore de la création.
    // Cette structure correspond directement à l'audioConfig
    // déjà utilisé dans le frontend Astraya.
    audioConfig: {
      // Variante de pitch sélectionnée.
      // Exemple : "dark", "natural" ou "bright".
      pitch: {
        type: String,
        required: true,
      },

      // Type d'atmosphère sélectionné.
      // Exemple : "airy" ou "deep".
      atmosphere: {
        type: String,
        required: true,
      },

      // Indique si l'atmosphère est activée ou non.
      // true = activée
      // false = désactivée
      atmosphereEnabled: {
        type: Boolean,
        required: true,
      },

      // Indique si le thème musical est activé ou non.
      musicalThemeEnabled: {
        type: Boolean,
        required: true,
      },

      // Contient les volumes des différents sons de nature.
      // Chaque valeur sera un nombre, par exemple entre 0 et 100.
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
    // Demande à Mongoose d'ajouter automatiquement deux dates :
    // createdAt = date de création
    // updatedAt = date de dernière modification
    timestamps: true,
  }
);

// Transforme le schema en modèle utilisable.
//
// Creation sera l'objet qu'on utilisera plus tard pour :
// - créer une nouvelle création
// - récupérer les créations
// - modifier une création
// - supprimer une création
//
// MongoDB créera automatiquement une collection appelée "creations".
const Creation = mongoose.model("Creation", creationSchema);

// Rend le modèle Creation disponible dans les autres fichiers du backend.
module.exports = Creation;