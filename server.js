// Importe Express.
//
// Express est un framework web pour Node.js.
// Un framework fournit une structure et des outils déjà prêts
// pour construire une application plus facilement.
//
// En très simple :
// - Node.js permet d'exécuter JavaScript côté serveur
// - Express aide à créer le serveur et les routes de l'API
const express = require("express");

// Importe CORS.
// CORS permet à notre frontend React, qui tourne sur un autre port,
// de communiquer avec l'API Express.
const cors = require("cors");

// Importe Mongoose.
//
// Mongoose est une librairie qui facilite la communication avec MongoDB.
// Elle permet notamment de définir des schemas et de manipuler les données.
const mongoose = require("mongoose");

// Importe le modèle Creation.
//
// Ce modèle représente une création Astraya dans la base de données.
// On l'utilisera pour créer, lire, modifier ou supprimer des créations.
const Creation = require("./models/Creation");

// Crée l'application Express.
//
// "app" représente notre serveur backend.
// On va utiliser cet objet pour créer les différentes routes de l'API.
const app = express();

// Port utilisé par le serveur.
const port = 3000;

// Adresse de notre base MongoDB locale.
//
// 127.0.0.1 signifie que MongoDB tourne sur notre propre ordinateur.
// "astraya" est le nom de la base de données.
const mongoUrl = "mongodb://127.0.0.1:27017/astraya";


// Autorise le frontend React à envoyer des requêtes à l'API.
app.use(cors());


// Permet à Express de lire les données JSON reçues.
//
// Plus tard, React enverra par exemple un objet contenant
// le nom d'une création et son audioConfig.
app.use(express.json());

// Connexion à MongoDB avec Mongoose.
mongoose
  .connect(mongoUrl)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

// Route de test.
//
// GET signifie qu'on demande simplement une information au serveur.
app.get("/", (request, response) => {
  response.send("Astraya API is running");
});

// Route permettant de récupérer toutes les créations.
//
// GET /creations demande à MongoDB de renvoyer
// tous les documents présents dans la collection "creations".
app.get("/creations", async (request, response) => {
  try {
    // Cherche toutes les créations enregistrées dans MongoDB.
    const creations = await Creation.find();

    // Renvoie les créations au format JSON.
    response.json(creations);
  } catch (error) {
    // Si la lecture échoue, renvoie une erreur.
    response.status(500).json({
      message: "Impossible de récupérer les créations",
      error: error.message,
    });
  }
});

// Route permettant de créer une nouvelle création Astraya.
//
// POST est utilisé quand on veut envoyer de nouvelles données au serveur.
app.post("/creations", async (request, response) => {
  try {
    // Récupère les données JSON envoyées au serveur.
    const creationData = request.body;

    // Crée un nouvel objet Creation avec les données reçues.
    const creation = new Creation(creationData);

    // Sauvegarde réellement la création dans MongoDB.
    const savedCreation = await creation.save();

    // Renvoie au frontend la création sauvegardée.
    response.status(201).json(savedCreation);
  } catch (error) {
    // Si quelque chose se passe mal, renvoie une erreur.
    response.status(400).json({
      message: "Impossible de sauvegarder la création",
      error: error.message,
    });
  }
});

// Démarre le serveur Express sur le port 3000.
app.listen(port, () => {
  console.log(`Astraya API running on http://localhost:${port}`);
});