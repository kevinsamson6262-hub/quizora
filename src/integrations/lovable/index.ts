// Legacy Lovable auth compatibility. QUIZORA now uses Firebase Authentication.
export const lovable = {
  auth: {
    async signInWithOAuth() {
      return { error: new Error("Legacy Lovable authentication is disabled. Use Firebase Authentication.") };
    },
  },
};
