export enum ResponseMessages {
  // Generic Messages =========================================
  InternalServerError = "An internal server error occured",
  BadRequest = "Invalid parameters passed",
  UnauthenticatedAction = "Action requires authentication",
  UnauthorizedAction = "Action not authorized",
  ForbiddenAction = "Action is forbidden",
  // End Generic Messages =====================================

  // User Service ===================================
  PasswordsDontMatch = "Passwords do not match.",
  UnableToFindUser = "Unable to login with that email and password combination",
  WeakPassword = "Password is too weak",
  UniqueEmailOnly = "A user with that email already exists. Please try a different email.",
  // End User Service ===============================
}
