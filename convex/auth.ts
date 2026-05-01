import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      validatePasswordRequirements(password: string) {
        if (password.length < 12) {
          throw new Error("Password must be at least 12 characters");
        }
      },
    }),
  ],
});
