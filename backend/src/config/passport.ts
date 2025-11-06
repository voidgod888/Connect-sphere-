import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { UserModel } from '../models/User.js';

export function setupPassport(userModel: UserModel) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback',
      },
      (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
        try {
          const user = userModel.createOrUpdateUser(
            profile.id,
            profile.displayName || 'Unknown User',
            profile.emails?.[0]?.value || ''
          );
          return done(null, user);
        } catch (error) {
          return done(error as Error);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id: string, done) => {
    const user = userModel.getUserById(id);
    done(null, user || null);
  });
}
