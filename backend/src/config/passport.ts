import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

console.log('Google Client ID present:', !!process.env.GOOGLE_CLIENT_ID);
console.log('GitHub Client ID present:', !!process.env.GITHUB_CLIENT_ID);
console.log('GitHub Client ID Value:', process.env.GITHUB_CLIENT_ID); // Temporary partial log for debug

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'clipboard-google-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'clipboard-google-secret',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        // Here we would typically find or create the user
        // For now, we will just return the profile to be handled by the controller/callback
        return done(null, profile);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

// GitHub Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID || 'clipboard-github-id',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || 'clipboard-github-secret',
      callbackURL: process.env.GITHUB_CALLBACK_URL || '/api/auth/github/callback',
    },
    async (_accessToken: string, _refreshToken: string, profile: any, done: any) => {
      try {
        return done(null, profile);
      } catch (error) {
        return done(error, undefined);
      }
    }
  )
);

export default passport;
