// --------------------------------------------------
// IMPORTS
// --------------------------------------------------

// Express est le framework backend utilisé
// pour créer le serveur et les routes de l'API.
const express = require("express");

// CORS permet au frontend React
// de communiquer avec notre backend Express.
const cors = require("cors");

// Mongoose permet de communiquer avec MongoDB.
const mongoose = require("mongoose");

// bcrypt permet de hasher et vérifier
// les mots de passe.
const bcrypt = require("bcryptjs");

// jsonwebtoken permet de créer
// et vérifier les JWT.
const jwt = require("jsonwebtoken");

// Charge les variables du fichier .env.
//
// Cela permet notamment d'utiliser JWT_SECRET
// sans écrire le secret directement dans le code.
require("dotenv").config();

// Modèles MongoDB.
const Creation = require("./models/Creation");
const User = require("./models/User");

// --------------------------------------------------
// CONFIGURATION
// --------------------------------------------------

// Crée l'application Express.
const app = express();

// Port utilisé par l'API.
const port = 3000;

// Base MongoDB locale Astraya.
const mongoUrl =
  "mongodb://127.0.0.1:27017/astraya";

// Autorise le frontend à communiquer avec l'API.
app.use(cors());

// Permet à Express de lire le JSON reçu.
app.use(express.json());

// Connexion à MongoDB.
mongoose
  .connect(mongoUrl)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error(
      "MongoDB connection error:",
      error
    );
  });

// --------------------------------------------------
// MIDDLEWARE D'AUTHENTIFICATION
// --------------------------------------------------
//
// Un middleware est une fonction qui s'exécute
// entre la requête et la route finale.
//
// Ici, son rôle est de vérifier le JWT.
//
// Si le token est valide :
// → la requête continue.
//
// S'il est absent ou invalide :
// → la requête est refusée.
const authenticateUser = (
  request,
  response,
  next
) => {
  // Le frontend enverra le token dans un header :
  //
  // Authorization: Bearer LE_TOKEN
  const authHeader =
    request.headers.authorization;

  // Vérifie que le header existe
  // et commence bien par "Bearer ".
  if (
    !authHeader ||
    !authHeader.startsWith("Bearer ")
  ) {
    return response.status(401).json({
      message: "Authentication required.",
    });
  }

  // Enlève "Bearer " pour garder uniquement
  // le JWT.
  const token = authHeader.split(" ")[1];

  try {
    // Vérifie :
    // - que la signature est correcte
    // - que le token n'est pas expiré
    //
    // Si le token a été modifié,
    // jwt.verify déclenche une erreur.
    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Lors du login, on avait placé userId
    // dans le token.
    //
    // On récupère maintenant cet id
    // et on l'ajoute à la requête.
    request.userId = decodedToken.userId;

    // next() signifie :
    //
    // "Tout est correct,
    // continue vers la route demandée."
    next();
  } catch (error) {
    return response.status(401).json({
      message:
        "Invalid or expired authentication token.",
    });
  }
};

// --------------------------------------------------
// ROUTE DE TEST
// --------------------------------------------------

app.get("/", (request, response) => {
  response.send("Astraya API is running");
});

// --------------------------------------------------
// REGISTER
// --------------------------------------------------

app.post("/register", async (request, response) => {
  try {
    const {
      name,
      email,
      password,
    } = request.body;

    // Tous les champs sont obligatoires.
    if (!name || !email || !password) {
      return response.status(400).json({
        message:
          "Name, email and password are required.",
      });
    }

    // Uniformise l'email.
    const normalizedEmail =
      email.trim().toLowerCase();

    // Vérifie si l'email existe déjà.
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return response.status(409).json({
        message:
          "An account already exists with this email.",
      });
    }

    // Mot de passe minimum 8 caractères.
    if (password.length < 8) {
      return response.status(400).json({
        message:
          "Password must contain at least 8 characters.",
      });
    }

    // Génère un salt bcrypt.
    const salt = await bcrypt.genSalt(12);

    // Transforme le mot de passe en hash.
    const hashedPassword = await bcrypt.hash(
      password,
      salt
    );

    // Crée l'utilisateur.
    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    // Sauvegarde dans MongoDB.
    const savedUser = await user.save();

    // Ne renvoie jamais le mot de passe.
    response.status(201).json({
      message: "Account created successfully.",
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        createdAt: savedUser.createdAt,
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    response.status(500).json({
      message:
        "Unable to create the account.",
    });
  }
});

// --------------------------------------------------
// LOGIN
// --------------------------------------------------

app.post("/login", async (request, response) => {
  try {
    const {
      email,
      password,
    } = request.body;

    // Email + mot de passe obligatoires.
    if (!email || !password) {
      return response.status(400).json({
        message:
          "Email and password are required.",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    // Cherche l'utilisateur.
    const user = await User.findOne({
      email: normalizedEmail,
    });

    // Message volontairement générique.
    //
    // On ne révèle pas si l'email existe.
    if (!user) {
      return response.status(401).json({
        message:
          "Invalid email or password.",
      });
    }

    // Compare le mot de passe reçu
    // avec le hash MongoDB.
    const isPasswordValid =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isPasswordValid) {
      return response.status(401).json({
        message:
          "Invalid email or password.",
      });
    }

    // Génère un JWT signé
    // avec notre secret privé.
    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    // Renvoie le JWT au frontend.
    response.json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    response.status(500).json({
      message: "Unable to log in.",
    });
  }
});

// --------------------------------------------------
// GET /CREATIONS
// ROUTE PROTEGEE
// --------------------------------------------------
//
// authenticateUser s'exécute AVANT la route.
//
// Donc cette route est impossible à utiliser
// sans JWT valide.
app.get(
  "/creations",
  authenticateUser,
  async (request, response) => {
    try {
      // request.userId vient du JWT.
      //
      // On demande uniquement les créations
      // appartenant à cet utilisateur.
      const creations = await Creation.find({
        userId: request.userId,
      });

      response.json(creations);
    } catch (error) {
      console.error(
        "Get creations error:",
        error
      );

      response.status(500).json({
        message:
          "Unable to retrieve creations.",
      });
    }
  }
);

// --------------------------------------------------
// POST /CREATIONS
// ROUTE PROTEGEE
// --------------------------------------------------

app.post(
  "/creations",
  authenticateUser,
  async (request, response) => {
    try {
      // On ne prend PAS le userId envoyé
      // éventuellement par le frontend.
      //
      // Ce serait dangereux car quelqu'un pourrait
      // mettre l'id d'un autre utilisateur.
      //
      // Le vrai userId vient uniquement du JWT validé.
      const creation = new Creation({
        userId: request.userId,
        name: request.body.name,
        audioConfig: request.body.audioConfig,
      });

      // Sauvegarde la création.
      const savedCreation =
        await creation.save();

      response
        .status(201)
        .json(savedCreation);
    } catch (error) {
      console.error(
        "Save creation error:",
        error
      );

      response.status(400).json({
        message:
          "Unable to save the creation.",
      });
    }
  }
);

// --------------------------------------------------
// DEMARRAGE DU SERVEUR
// --------------------------------------------------

app.listen(port, () => {
  console.log(
    `Astraya API running on http://localhost:${port}`
  );
});