import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const currentUser = JSON.parse(localStorage.getItem("userInfo") || null);
  //! if token exists, then user is logged in
  const token = currentUser?.token;
  return token ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
