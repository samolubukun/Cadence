const authConfig = {
  providers: [
    {
      domain:
        process.env.CLERK_JWT_ISSUER_DOMAIN ||
        "https://unbiased-egret-4755.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};

export default authConfig;
