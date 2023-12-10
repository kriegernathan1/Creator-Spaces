export enum ResponseMessages {
  // Generic Messages =========================================
  InternalServerError = "An internal server error occured",
  BadRequest = "Invalid parameters passed",
  UnauthorizedAction = "That action requires propter authentication",
  // End Generic Messages =====================================

  // User Service ===================================
  PasswordsDontMatch = "Passwords do not match.",
  UnableToFindUser = "Unable to find a user with that email or password",
  WeakPassword = "Password is too weak",
  // End User Service ===============================
}
