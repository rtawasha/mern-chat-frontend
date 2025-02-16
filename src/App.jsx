import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { Box } from            "@chakra-ui/react";
import Register from    "./pages/Register";
import Login from       "./pages/Login";
import LandingPage from "./pages/LandingPage";
import Chat from        "./pages/Chat";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <ChakraProvider>
      <Box minH="100vh">
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/chat" element={ <PrivateRoute> <Chat/> </PrivateRoute>  }  />
          </Routes>
        </Router>
      </Box>
    </ChakraProvider>
  );
}

export default App;
