// --------------------------------------------------
// IMPORTS
// --------------------------------------------------

// Ce fichier sert à remplir MongoDB avec mes 3 presets officiels.

const mongoose = require("mongoose");

const Preset = require("./models/Preset");

// --------------------------------------------------
// CONFIGURATION
// --------------------------------------------------

const mongoUrl =
  "mongodb://127.0.0.1:27017/astraya";

// --------------------------------------------------
// PRESETS OFFICIELS ASTRAYA
// --------------------------------------------------
//
// Ce sont exactement les presets
// qui étaient auparavant écrits en dur
// dans SoundCarousel.jsx.

const presets = [
  {
    slug: "airy-birds",

    name: "Airy Birds",

    description:
      "Bright ambience with forest and birds",

    image:
      "images/ambiant-images/astraya-background-1.png",

    audioConfig: {
      pitch: "bright",

      atmosphere: "airy",

      atmosphereEnabled: true,

      musicalThemeEnabled: false,

      natureVolumes: {
        rain: 0,
        forest: 25,
        birds: 80,
        river: 0,
        waves: 0,
      },
    },
  },

  {
    slug: "soft-strings",

    name: "Soft Strings",

    description:
      "Gentle strings with a calm natural atmosphere",

    image:
      "images/ambiant-images/astraya-background-3.png",

    audioConfig: {
      pitch: "natural",

      atmosphere: "airy",

      atmosphereEnabled: true,

      musicalThemeEnabled: true,

      natureVolumes: {
        rain: 10,
        forest: 20,
        birds: 20,
        river: 0,
        waves: 0,
      },
    },
  },

  {
    slug: "deep-forest",

    name: "Deep Forest",

    description:
      "Dark forest ambience with river and distant birds",

    image:
      "images/ambiant-images/astraya-background-2.png",

    audioConfig: {
      pitch: "dark",

      atmosphere: "deep",

      atmosphereEnabled: true,

      musicalThemeEnabled: false,

      natureVolumes: {
        rain: 0,
        forest: 70,
        birds: 20,
        river: 45,
        waves: 0,
      },
    },
  },
];

// --------------------------------------------------
// SEED
// --------------------------------------------------

const seedPresets = async () => {
  try {
    // Connexion à MongoDB.
    await mongoose.connect(
      mongoUrl
    );

    console.log(
      "Connected to MongoDB"
    );

    // Supprime les anciens presets
    // pour éviter les doublons
    // si le script est lancé plusieurs fois.
    await Preset.deleteMany({});

    // Insère les trois presets officiels.
    await Preset.insertMany(
      presets
    );

    console.log(
      "Astraya presets inserted successfully"
    );
  } catch (error) {
    console.error(
      "Preset seed error:",
      error
    );
  } finally {
    // Ferme la connexion MongoDB
    // une fois le travail terminé.
    await mongoose.connection.close();

    console.log(
      "MongoDB connection closed"
    );
  }
};

seedPresets();