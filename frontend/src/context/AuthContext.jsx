import { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Added loading state

  useEffect(() => {
    const savedUser = localStorage.getItem("userInfo");
    if (savedUser) {
      setUserInfo(JSON.parse(savedUser));
    }
    setIsLoading(false); // Stop loading once checked
  }, []);

  const login = (data) => {
    setUserInfo(data);
    localStorage.setItem("userInfo", JSON.stringify(data));
  };

  // const logout = () => {
  //   localStorage.removeItem("userInfo");
  //   localStorage.removeItem("chatHistory");
  //   setUserInfo(null);
  //   localStorage.removeItem("userInfo");
  //   window.location.href = "/login";
  // };
  const logout = () => {
    // 1. The Nuclear Option: Wipe ALL local storage clean
    localStorage.clear();

    // 2. Clear your React state for this specific file
    setUserInfo(null);

    // 3. Force a hard redirect to the login page (which also refreshes React's memory)
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ userInfo, login, logout, isLoading }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
