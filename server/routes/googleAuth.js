const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Passport configuration - only if credentials are available
if (process.env.CLIENT_ID && process.env.CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://localhost:3001/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
          // Create new user
          user = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            role: 'user'
          });
          await user.save();
        } else {
          // Update existing user with Google ID if not set
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }
        }

        // Store tokens for Gmail API access
        user.googleAccessToken = accessToken;
        user.googleRefreshToken = refreshToken;
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
          { userId: user._id, email: user.email, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        );

        return done(null, { user, token });
      } catch (error) {
        return done(error, null);
      }
    }
  ));

  // Serialize user
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });

  // Routes
  router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.readonly'] })
  );

  router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login` }),
    (req, res) => {
      // Successful authentication, redirect to frontend with token
      const { token } = req.user;
      res.redirect(`${process.env.FRONTEND_URL}/login?token=${token}`);
    }
  );
} else {
  // Google OAuth credentials not configured
  router.get('/google', (req, res) => {
    res.status(503).json({ error: 'Google OAuth is not configured. Please set CLIENT_ID and CLIENT_SECRET in .env' });
  });
}

module.exports = router;

//22.687615364573585, 75.85428651162383