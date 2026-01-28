export default function getErrorMessage(code: string | undefined) {
    switch (code) {
        case "INVALID_EMAIL_OR_PASSWORD":
            return "Invalid email or password";
        case "USER_ALREADY_EXISTS":
            return "This email is already registered";
        case "INTERNAL_SERVER_ERROR":
            return "Internal server error. Please try again later";
        case "INVALID_TOKEN":
            return "This password reset link is invalid. Please request a new one"
        default:
            return "An unexpected error occurred. Please try again";
  }
};
