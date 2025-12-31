export const authStorage = {
  getToken: () => localStorage.getItem("token"),
  setToken: (token: string) => localStorage.setItem("token", token),
  clearToken: () => localStorage.removeItem("token"),

  getUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
  setUser: (user: any) => localStorage.setItem("user", JSON.stringify(user)),
  clearUser: () => localStorage.removeItem("user"),

  clearAll: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};
