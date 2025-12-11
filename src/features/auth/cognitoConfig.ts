export const COGNITO_REGION = process.env.REACT_APP_COGNITO_REGION || "us-east-1";
export const COGNITO_USER_POOL_ID = process.env.REACT_APP_COGNITO_USER_POOL_ID || "";
export const COGNITO_CLIENT_ID = process.env.REACT_APP_COGNITO_CLIENT_ID || "";

export const USE_COGNITO =
  Boolean(COGNITO_USER_POOL_ID) && Boolean(COGNITO_CLIENT_ID);
