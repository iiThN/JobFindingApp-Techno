// Built-in administrator accounts.
// These are seeded into AuthContext at startup, so admins never register –
// they log in on the normal Login screen and are sent to the admin dashboard.
//
// NOTE: credentials live in the app bundle, which is fine for this prototype
// (all data is in-memory). Before going to production, move admin auth to a
// backend and store hashed passwords there.

export const ADMIN_ROLE = "Admin";

export const BUILT_IN_ADMINS = [
  { name: "Capuras",   email: "capuras.anthony2003@gmail.com", password: "admin_01" },
  { name: "Diaz",   email: "diaz.joshua.11162004@gmail.com", password: "admin_02" },
  { name: "Digang", email: "digang.jaysonrey123@gmail.com", password: "admin_03" },
  { name: "Jamisola",  email: "jamisolaalchrisjune@gmail.com", password: "admin_04" },
  { name: "Paculanan",  email: "paculanan.john123@gmail.com", password: "admin_05" },
].map((admin) => ({
  ...admin,
  role: ADMIN_ROLE,
  status: "active",
  builtIn: true,
}));
