// --------------------------------------------------
// IMPORTS
// --------------------------------------------------

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const Creation = require("./models/Creation");
const User = require("./models/User");
const Preset = require("./models/Preset");

// --------------------------------------------------
// CONFIGURATION
// --------------------------------------------------

const app = express();

const port = 3000;

const mongoUrl =
  "mongodb://127.0.0.1:27017/astraya";

app.use(cors());

app.use(express.json());

// Connexion à MongoDB.
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

// --------------------------------------------------
// MIDDLEWARE D'AUTHENTIFICATION
// --------------------------------------------------

const authenticateUser = (
  request,
  response,
  next
) => {
  const authHeader =
    request.headers.authorization;

  if (
    !authHeader ||
    !authHeader.startsWith("Bearer ")
  ) {
    return response.status(401).json({
      message:
        "Authentication required.",
    });
  }

  const token =
    authHeader.split(" ")[1];

  try {
    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    request.userId =
      decodedToken.userId;

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
  response.send(
    "Astraya API is running"
  );
});

// --------------------------------------------------
// REGISTER
// --------------------------------------------------

app.post(
  "/register",
  async (request, response) => {
    try {
      const {
        name,
        email,
        password,
      } = request.body;

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

      const normalizedEmail =
        email
          .trim()
          .toLowerCase();

      const existingUser =
        await User.findOne({
          email:
            normalizedEmail,
        });

      if (existingUser) {
        return response
          .status(409)
          .json({
            message:
              "An account already exists with this email.",
          });
      }

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

      const salt =
        await bcrypt.genSalt(
          12
        );

      const hashedPassword =
        await bcrypt.hash(
          password,
          salt
        );

      const user =
        new User({
          name:
            name.trim(),

          email:
            normalizedEmail,

          password:
            hashedPassword,
        });

      const savedUser =
        await user.save();

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

// --------------------------------------------------
// LOGIN
// --------------------------------------------------

app.post(
  "/login",
  async (request, response) => {
    try {
      const {
        email,
        password,
      } = request.body;

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

      const normalizedEmail =
        email
          .trim()
          .toLowerCase();

      const user =
        await User.findOne({
          email:
            normalizedEmail,
        });

      // Message volontairement générique.
      if (!user) {
        return response
          .status(401)
          .json({
            message:
              "Invalid email or password.",
          });
      }

      const isPasswordValid =
        await bcrypt.compare(
          password,
          user.password
        );

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

// --------------------------------------------------
// GET /PRESETS
// ROUTE PUBLIQUE
// --------------------------------------------------
//
// Les presets officiels Astraya
// sont accessibles même sans compte.
//
// Pas besoin de JWT ici.
app.get(
  "/presets",
  async (request, response) => {
    try {
      const presets =
        await Preset.find({});

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

// --------------------------------------------------
// GET /CREATIONS
// --------------------------------------------------

app.get(
  "/creations",
  authenticateUser,
  async (
    request,
    response
  ) => {
    try {
      const creations =
        await Creation.find({
          userId:
            request.userId,
        });

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

// --------------------------------------------------
// POST /CREATIONS
// --------------------------------------------------

app.post(
  "/creations",
  authenticateUser,
  async (
    request,
    response
  ) => {
    try {
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

      const savedCreation =
        await creation.save();

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

// --------------------------------------------------
// DELETE /CREATIONS/:ID
// --------------------------------------------------

app.delete(
  "/creations/:id",
  authenticateUser,
  async (
    request,
    response
  ) => {
    try {
      const creationId =
        request.params.id;

      // On exige à la fois :
      // - le bon _id
      // - le bon propriétaire
      const deletedCreation =
        await Creation.findOneAndDelete({
          _id:
            creationId,

          userId:
            request.userId,
        });

      if (!deletedCreation) {
        return response
          .status(404)
          .json({
            message:
              "Creation not found.",
          });
      }

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

// --------------------------------------------------
// DEMARRAGE DU SERVEUR
// --------------------------------------------------

app.listen(port, () => {
  console.log(
    `Astraya API running on http://localhost:${port}`
  );
});