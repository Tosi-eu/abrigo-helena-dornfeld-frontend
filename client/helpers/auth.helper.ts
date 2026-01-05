// Using sessionStorage instead of localStorage for better security
// sessionStorage is cleared when browser tab/window is closed, reducing XSS attack window
export const authStorage = {
  getToken: () => sessionStorage.getItem("token"),
  setToken: (token: string) => sessionStorage.setItem("token", token),
  clearToken: () => sessionStorage.removeItem("token"),

  getUser: () => {
    const user = sessionStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
  setUser: (user: any) => sessionStorage.setItem("user", JSON.stringify(user)),
  clearUser: () => sessionStorage.removeItem("user"),

  clearAll: () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
  },
};
