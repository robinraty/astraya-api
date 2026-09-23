// --------------------------------------------------
// IMPORTS DES LIBRAIRIES
// --------------------------------------------------
//
// Ce fichier est écrit en JavaScript.
//
// Les différentes fonctions utilisées plus bas
// viennent de plusieurs bibliothèques.
//
// Express : sert à créer l'API et gérer les routes HTTP.
//
// cors : permet au frontend et au backend
// de communiquer même s'ils ne sont pas sur la même origine.
//
// mongoose : sert d'intermédiaire entre le backend
// et la base de données MongoDB.
//
// bcryptjs : sert à hasher les mots de passe
// et à comparer un mot de passe avec son hash.
//
// jsonwebtoken : sert à créer et vérifier des JWT.
//
// dotenv : charge les variables secrètes du fichier .env.

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

require("dotenv").config();


// --------------------------------------------------
// IMPORTS DES MODÈLES MONGOOSE
// --------------------------------------------------
//
// Ces fichiers décrivent la structure
// des différents types de données stockés dans MongoDB.
//
// User : utilisateurs de l'application
//
// Creation : créations personnalisées des utilisateurs
//
// Preset : presets officiels Astraya

const Creation = require("./models/Creation");
const User = require("./models/User");
const Preset = require("./models/Preset");


// ==================================================
// CONFIGURATION GÉNÉRALE DU SERVEUR
// ==================================================


// --------------------------------------------------
// CRÉATION DE L'APPLICATION EXPRESS
// --------------------------------------------------
//
// express() crée l'application serveur.
//
// La variable app représente maintenant notre API.
//
// Grâce à app, on pourra écrire :
//
// app.get(...)
// app.post(...)
// app.delete(...)
// app.listen(...)

const app = express();


// --------------------------------------------------
// PORT DU SERVEUR
// --------------------------------------------------
//
// Le backend écoutera les requêtes
// sur le port 3000.
//
// Donc l'adresse locale de l'API sera :
//
// http://localhost:3000

const port = 3000;


// --------------------------------------------------
// ADRESSE DE LA BASE DE DONNÉES
// --------------------------------------------------
//
// Cette URL indique que MongoDB tourne
// sur la même machine.
//
// 127.0.0.1 représente la machine locale.
//
// 27017 est le port utilisé par MongoDB.
//
// astraya est le nom de la base de données.

const mongoUrl =
  "mongodb://127.0.0.1:27017/astraya";


// --------------------------------------------------
// CORS
// --------------------------------------------------
//
// cors() autorise les requêtes venant
// d'une autre origine.
//
// C'est utile ici car le frontend et le backend
// peuvent tourner sur des ports différents.
//
// Exemple :
//
// frontend : localhost:5173
// backend : localhost:3000
//
// Pour le navigateur,
// ces deux adresses sont deux origines différentes.

app.use(cors());


// --------------------------------------------------
// LECTURE DU JSON
// --------------------------------------------------
//
// express.json() permet à Express
// de comprendre le JSON envoyé par le frontend.
//
// Sans cette ligne,
// request.body ne contiendrait pas correctement
// les données JSON envoyées dans les requêtes POST.

app.use(express.json());


// ==================================================
// CONNEXION À MONGODB
// ==================================================
//
// mongoose.connect() ouvre la connexion
// entre le backend et MongoDB.
//
// Si la connexion réussit,
// le .then() est exécuté.
//
// Si elle échoue,
// le .catch() affiche l'erreur.

mongoose
  .connect(mongoUrl)
  .then(() => {
    console.log(
      "Connected to MongoDB"
    );
  })
  .catch((error) => {
    console.error(
      "MongoDB connection error:",
      error
    );
  });


// ==================================================
// MIDDLEWARE D'AUTHENTIFICATION
// ==================================================
//
// Un middleware est une fonction exécutée
// entre l'arrivée d'une requête
// et l'exécution finale de la route.
//
// Ici, authenticateUser sert à vérifier
// qu'un utilisateur possède un JWT valide.
//
// Certaines routes utiliseront ce middleware,
// par exemple :
//
// GET /creations
// POST /creations
// DELETE /creations/:id
//
// Cela empêche un utilisateur non authentifié
// d'accéder à ces routes.

const authenticateUser = (
  request,
  response,
  next
) => {

  // ------------------------------------------------
  // RÉCUPÉRATION DU HEADER AUTHORIZATION
  // ------------------------------------------------
  //
  // Le frontend envoie le JWT dans un header HTTP.
  //
  // Exemple :
  //
  // Authorization: Bearer eyJhbGciOi...
  //
  // request.headers.authorization
  // récupère cette valeur.

  const authHeader =
    request.headers.authorization;


  // ------------------------------------------------
  // VÉRIFICATION DU FORMAT DU HEADER
  // ------------------------------------------------
  //
  // Si aucun header Authorization n'existe
  // ou s'il ne commence pas par "Bearer ",
  // on refuse immédiatement la requête.
  //
  // HTTP 401 signifie Unauthorized.

  if (
    !authHeader ||
    !authHeader.startsWith("Bearer ")
  ) {
    return response.status(401).json({
      message:
        "Authentication required.",
    });
  }


  // ------------------------------------------------
  // EXTRACTION DU TOKEN
  // ------------------------------------------------
  //
  // authHeader ressemble à :
  //
  // "Bearer abcdef123456"
  //
  // split(" ") le découpe en :
  //
  // ["Bearer", "abcdef123456"]
  //
  // [1] récupère donc uniquement le token.

  const token =
    authHeader.split(" ")[1];


  // ------------------------------------------------
  // VÉRIFICATION DU JWT
  // ------------------------------------------------
  //
  // jwt.verify vérifie deux choses :
  //
  // 1. que le token est bien signé
  //    avec notre secret JWT
  //
  // 2. qu'il n'est pas expiré
  //
  // Le secret vient du fichier .env.

  try {
    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET
    );


    // ------------------------------------------------
    // RÉCUPÉRATION DE L'IDENTIFIANT UTILISATEUR
    // ------------------------------------------------
    //
    // Lors de la création du JWT,
    // on avait placé userId dedans.
    //
    // Après vérification,
    // on récupère donc cet identifiant
    // et on l'ajoute à l'objet request.
    //
    // Les routes suivantes pourront écrire :
    //
    // request.userId

    request.userId =
      decodedToken.userId;


    // ------------------------------------------------
    // CONTINUER VERS LA ROUTE
    // ------------------------------------------------
    //
    // next() signifie :
    //
    // "L'authentification est valide,
    // continue vers la prochaine fonction."
    //
    // Ici, la prochaine fonction
    // sera généralement la vraie logique de la route.

    next();

  } catch (error) {

    // ------------------------------------------------
    // JWT INVALIDE OU EXPIRÉ
    // ------------------------------------------------
    //
    // Si jwt.verify échoue,
    // la requête est refusée.

    return response.status(401).json({
      message:
        "Invalid or expired authentication token.",
    });
  }
};


// ==================================================
// ROUTE DE TEST
// ==================================================
//
// Une route associe :
//
// - une méthode HTTP
// - une URL
// - une fonction
//
// app.get signifie :
// gérer une requête HTTP GET.
//
// Ici :
//
// GET http://localhost:3000/
//
// renvoie simplement un texte.
//
// Cette route permet surtout de vérifier
// rapidement que l'API fonctionne.

app.get("/", (request, response) => {
  response.send(
    "Astraya API is running"
  );
});


// ==================================================
// REGISTER
// ==================================================
//
// Route de création de compte.
//
// Le frontend envoie une requête :
//
// POST /register
//
// avec par exemple :
//
// {
//   "name": "...",
//   "email": "...",
//   "password": "..."
// }
//
// Cette route :
//
// 1. vérifie les données
// 2. vérifie que l'email n'existe pas déjà
// 3. hash le mot de passe
// 4. crée l'utilisateur dans MongoDB
// 5. renvoie les informations non sensibles

app.post(
  "/register",
  async (request, response) => {

    // try/catch permet de gérer
    // une erreur éventuelle proprement.
    try {

      // ------------------------------------------------
      // RÉCUPÉRATION DES DONNÉES
      // ------------------------------------------------
      //
      // request.body contient le JSON
      // envoyé par le frontend.
      //
      // On extrait ici :
      //
      // name
      // email
      // password

      const {
        name,
        email,
        password,
      } = request.body;


      // ------------------------------------------------
      // VÉRIFICATION DES CHAMPS
      // ------------------------------------------------
      //
      // Si un champ manque,
      // on renvoie une erreur HTTP 400.
      //
      // 400 signifie Bad Request.

      if (
        !name ||
        !email ||
        !password
      ) {
        return response
          .status(400)
          .json({
            message:
              "Name, email and password are required.",
          });
      }


      // ------------------------------------------------
      // NORMALISATION DE L'EMAIL
      // ------------------------------------------------
      //
      // trim() retire les espaces inutiles.
      //
      // toLowerCase() transforme l'email en minuscules.
      //
      // Cela évite par exemple de considérer :
      //
      // TEST@mail.com
      //
      // et
      //
      // test@mail.com
      //
      // comme deux comptes différents.

      const normalizedEmail =
        email
          .trim()
          .toLowerCase();


      // ------------------------------------------------
      // RECHERCHE D'UN UTILISATEUR EXISTANT
      // ------------------------------------------------
      //
      // User est un modèle Mongoose.
      //
      // findOne cherche un document
      // dans MongoDB qui correspond au critère.
      //
      // Ici :
      //
      // email === normalizedEmail

      const existingUser =
        await User.findOne({
          email:
            normalizedEmail,
        });


      // ------------------------------------------------
      // EMAIL DÉJÀ UTILISÉ
      // ------------------------------------------------
      //
      // HTTP 409 signifie Conflict.

      if (existingUser) {
        return response
          .status(409)
          .json({
            message:
              "An account already exists with this email.",
          });
      }


      // ------------------------------------------------
      // LONGUEUR DU MOT DE PASSE
      // ------------------------------------------------
      //
      // On impose ici minimum 8 caractères.

      if (
        password.length < 8
      ) {
        return response
          .status(400)
          .json({
            message:
              "Password must contain at least 8 characters.",
          });
      }


      // ------------------------------------------------
      // CRÉATION DU SALT
      // ------------------------------------------------
      //
      // bcrypt utilise un "salt"
      // pour renforcer le hash du mot de passe.
      //
      // Le nombre 12 représente le coût
      // du calcul de hash.
      //
      // Plus il est élevé,
      // plus le calcul est coûteux.

      const salt =
        await bcrypt.genSalt(
          12
        );


      // ------------------------------------------------
      // HASH DU MOT DE PASSE
      // ------------------------------------------------
      //
      // On ne stocke JAMAIS
      // le mot de passe original dans MongoDB.
      //
      // bcrypt.hash transforme le mot de passe
      // en valeur non directement lisible.
      //
      // C'est ce hash qui sera sauvegardé.

      const hashedPassword =
        await bcrypt.hash(
          password,
          salt
        );


      // ------------------------------------------------
      // CRÉATION DU DOCUMENT USER
      // ------------------------------------------------
      //
      // new User(...) crée un document
      // basé sur le modèle Mongoose User.
      //
      // Il n'est pas encore enregistré
      // dans MongoDB à ce stade.

      const user =
        new User({
          name:
            name.trim(),

          email:
            normalizedEmail,

          password:
            hashedPassword,
        });


      // ------------------------------------------------
      // ENREGISTREMENT DANS MONGODB
      // ------------------------------------------------
      //
      // save() passe par Mongoose
      // et enregistre réellement le document
      // dans MongoDB.

      const savedUser =
        await user.save();


      // ------------------------------------------------
      // RÉPONSE AU FRONTEND
      // ------------------------------------------------
      //
      // HTTP 201 signifie Created.
      //
      // On renvoie les informations utiles.
      //
      // IMPORTANT :
      // on ne renvoie jamais le hash du mot de passe.

      response
        .status(201)
        .json({
          message:
            "Account created successfully.",

          user: {
            id:
              savedUser._id,

            name:
              savedUser.name,

            email:
              savedUser.email,

            createdAt:
              savedUser.createdAt,
          },
        });

    } catch (error) {

      // ------------------------------------------------
      // ERREUR SERVEUR
      // ------------------------------------------------
      //
      // HTTP 500 signifie Internal Server Error.

      console.error(
        "Register error:",
        error
      );

      response
        .status(500)
        .json({
          message:
            "Unable to create the account.",
        });
    }
  }
);


// ==================================================
// LOGIN
// ==================================================
//
// Route de connexion.
//
// Le frontend envoie :
//
// POST /login
//
// avec :
//
// email
// password
//
// La route :
//
// 1. cherche l'utilisateur
// 2. compare le mot de passe
// 3. crée un JWT
// 4. renvoie le token au frontend

app.post(
  "/login",
  async (request, response) => {
    try {

      // ------------------------------------------------
      // RÉCUPÉRATION EMAIL + PASSWORD
      // ------------------------------------------------

      const {
        email,
        password,
      } = request.body;


      // ------------------------------------------------
      // VÉRIFICATION DES CHAMPS
      // ------------------------------------------------

      if (
        !email ||
        !password
      ) {
        return response
          .status(400)
          .json({
            message:
              "Email and password are required.",
          });
      }


      // ------------------------------------------------
      // NORMALISATION DE L'EMAIL
      // ------------------------------------------------

      const normalizedEmail =
        email
          .trim()
          .toLowerCase();


      // ------------------------------------------------
      // RECHERCHE DE L'UTILISATEUR
      // ------------------------------------------------
      //
      // Mongoose cherche l'utilisateur
      // correspondant dans MongoDB.

      const user =
        await User.findOne({
          email:
            normalizedEmail,
        });


      // ------------------------------------------------
      // UTILISATEUR INTROUVABLE
      // ------------------------------------------------
      //
      // Le message reste volontairement générique.
      //
      // On ne dit pas :
      //
      // "Cet email n'existe pas."
      //
      // Cela évite de révéler
      // quels emails possèdent un compte.

      if (!user) {
        return response
          .status(401)
          .json({
            message:
              "Invalid email or password.",
          });
      }


      // ------------------------------------------------
      // COMPARAISON DU MOT DE PASSE
      // ------------------------------------------------
      //
      // Le mot de passe stocké est un hash.
      //
      // bcrypt.compare compare :
      //
      // - le mot de passe tapé
      // - le hash enregistré
      //
      // puis renvoie true ou false.

      const isPasswordValid =
        await bcrypt.compare(
          password,
          user.password
        );


      // ------------------------------------------------
      // MOT DE PASSE INCORRECT
      // ------------------------------------------------

      if (
        !isPasswordValid
      ) {
        return response
          .status(401)
          .json({
            message:
              "Invalid email or password.",
          });
      }


      // ------------------------------------------------
      // CRÉATION DU JWT
      // ------------------------------------------------
      //
      // jwt.sign crée un token.
      //
      // On place dedans :
      //
      // userId
      //
      // Le token est signé avec JWT_SECRET,
      // stocké dans le fichier .env.
      //
      // expiresIn: "2h"
      // signifie que le token expire après 2 heures.

      const token =
        jwt.sign(
          {
            userId:
              user._id,
          },

          process.env
            .JWT_SECRET,

          {
            expiresIn: "2h",
          }
        );


      // ------------------------------------------------
      // RÉPONSE AU FRONTEND
      // ------------------------------------------------
      //
      // On renvoie :
      //
      // - le token
      // - les informations utilisateur
      //
      // Le frontend pourra conserver le JWT
      // et l'envoyer dans les futures requêtes protégées.

      response.json({
        message:
          "Login successful.",

        token,

        user: {
          id:
            user._id,

          name:
            user.name,

          email:
            user.email,
        },
      });

    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      response
        .status(500)
        .json({
          message:
            "Unable to log in.",
        });
    }
  }
);


// ==================================================
// GET /PRESETS
// ==================================================
//
// Route publique.
//
// N'importe qui peut récupérer
// les presets officiels Astraya.
//
// Aucun JWT n'est nécessaire.
//
// GET signifie ici :
// récupérer des données.

app.get(
  "/presets",
  async (request, response) => {
    try {

      // ------------------------------------------------
      // RÉCUPÉRATION DE TOUS LES PRESETS
      // ------------------------------------------------
      //
      // Preset.find({})
      //
      // signifie :
      //
      // "récupère tous les documents Preset".
      //
      // {} signifie qu'aucun filtre particulier
      // n'est appliqué.

      const presets =
        await Preset.find({});


      // Renvoie les presets en JSON.
      response.json(
        presets
      );

    } catch (error) {
      console.error(
        "Get presets error:",
        error
      );

      response
        .status(500)
        .json({
          message:
            "Unable to retrieve presets.",
        });
    }
  }
);












// ! ==================================================
// ! GET /CREATIONS
// ! ==================================================
//
// Route protégée.
//
// L'utilisateur doit être authentifié.
//
// La présence de authenticateUser entre l'URL
// et la fonction finale signifie :
//
// 1. vérifier le JWT
// 2. puis seulement exécuter la route
//
// GET signifie :
// récupérer des données.

app.get(
  "/creations",

  // Vérifie le JWT avant de continuer.
  authenticateUser,

  async (
    request,
    response
  ) => {
    try {

      // ------------------------------------------------
      // RÉCUPÉRATION DES CRÉATIONS DU USER
      // ------------------------------------------------
      //
      // request.userId a été ajouté
      // par authenticateUser.
      //
      // On demande donc à Mongoose :
      //
      // "Trouve toutes les créations
      // qui appartiennent à cet utilisateur."

      // ! find est une methode mongoose 


      const creations =
        await Creation.find({
          userId:
            request.userId,
        });


      // Renvoie les créations au frontend.
      response.json(
        creations
      );

    } catch (error) {
      console.error(
        "Get creations error:",
        error
      );

      response
        .status(500)
        .json({
          message:
            "Unable to retrieve creations.",
        });
    }
  }
);



















// ! ==================================================
// ! POST /CREATIONS
// ! ==================================================
//
// Ici, on retrouve la route POST /creations qui reçoit
// la requête envoyée par mon frontend.
//
// Avant d'exécuter la route, le middleware authenticateUser
// vérifie que le JWT est valide et récupère l'identifiant
// de l'utilisateur.

app.post(
  "/creations",

  authenticateUser,

  async (
    request,
    response
  ) => {
    try {

      // Je crée ensuite un nouveau document à partir
      // de mon modèle Mongoose "Creation".
      //
      // L'identifiant de l'utilisateur vient du JWT,
      // et le nom, l'image et l'audioConfig viennent
      // du body de la requête envoyée par mon frontend.

      const creation =
        new Creation({
          userId:
            request.userId,

          name:
            request.body.name,

          image:
            request.body.image,

          audioConfig:
            request.body
              .audioConfig,
        });


      // Une fois le document créé, j'utilise save(),
      // une méthode fournie par Mongoose,
      // pour le sauvegarder dans ma base de données MongoDB.

      const savedCreation =
        await creation.save();


      // Enfin, si la sauvegarde fonctionne,
      // le backend renvoie la création sauvegardée au frontend.

      response
        .status(201)
        .json(
          savedCreation
        );

    } catch (error) {
      console.error(
        "Save creation error:",
        error
      );

      response
        .status(400)
        .json({
          message:
            "Unable to save the creation.",
        });
    }
  }
);














// ==================================================
// DELETE /CREATIONS/:ID
// ==================================================
//
// Route protégée.
//
// Permet de supprimer une création.
//
// :id représente une valeur dynamique.
//
// Exemple :
//
// DELETE /creations/12345
//
// Dans ce cas :
//
// request.params.id
//
// vaudra "12345".

app.delete(
  "/creations/:id",

  // Vérifie d'abord le JWT.
  authenticateUser,

  async (
    request,
    response
  ) => {
    try {

      // ------------------------------------------------
      // RÉCUPÉRATION DE L'ID
      // ------------------------------------------------

      const creationId =
        request.params.id;


      // ------------------------------------------------
      // SUPPRESSION SÉCURISÉE
      // ------------------------------------------------
      //
      // findOneAndDelete cherche
      // puis supprime un document.
      //
      // On exige deux conditions :
      //
      // 1. le bon _id
      // 2. le bon userId
      //
      // Cela empêche un utilisateur
      // de supprimer une création
      // qui appartient à quelqu'un d'autre.

      const deletedCreation =
        await Creation.findOneAndDelete({
          _id:
            creationId,

          userId:
            request.userId,
        });


      // ------------------------------------------------
      // CRÉATION INTROUVABLE
      // ------------------------------------------------
      //
      // Si aucun document ne correspond
      // à la fois à l'id et à l'utilisateur,
      // on renvoie 404.
      //
      // 404 signifie Not Found.

      if (!deletedCreation) {
        return response
          .status(404)
          .json({
            message:
              "Creation not found.",
          });
      }


      // ------------------------------------------------
      // SUPPRESSION RÉUSSIE
      // ------------------------------------------------

      response.json({
        message:
          "Creation deleted successfully.",

        id:
          deletedCreation._id,
      });

    } catch (error) {
      console.error(
        "Delete creation error:",
        error
      );

      response
        .status(400)
        .json({
          message:
            "Unable to delete the creation.",
        });
    }
  }
);


// ==================================================
// DÉMARRAGE DU SERVEUR
// ==================================================
//
// Jusqu'ici,
// on a configuré le serveur et défini ses routes.
//
// app.listen démarre réellement le serveur.
//
// Express commence alors à écouter
// les requêtes HTTP sur le port 3000.
//
// Le backend devient donc accessible sur :
//
// http://localhost:3000

app.listen(port, () => {
  console.log(
    `Astraya API running on http://localhost:${port}`
  );
});