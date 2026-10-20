export function validateLogin(email, password) {
  if (!email || !password) {
    return "Please fill in all fields.";
  }

  if (!email.includes("@")) {
    return "Please enter a valid email.";
  }

  if (password.length < 6) {
    return "Password must be at least 6 characters.";
  }

  return "";
}

export function validateRegister(
  name,
  email,
  password,
  confirmPassword
) {
  if (!name || !email || !password || !confirmPassword) {
    return "Please fill in all fields.";
  }

  if (!email.includes("@")) {
    return "Please enter a valid email.";
  }

  if (password.length < 6) {
    return "Password must be at least 6 characters.";
  }

  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }

  return "";
}

export function validateGetVerified(
  companyName, companyLoc, selectedFiles
) {
  if (!companyName || !companyLoc){
    return "Please fill all the requirements"
  }

  if (selectedFiles.length === 0){
    return "Please upload at least one verification document"
  }
  
}