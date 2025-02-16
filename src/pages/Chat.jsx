import { Box, Flex } from "@chakra-ui/react";
import io from "socket.io-client";
import Sidebar from  "../components/Sidebar";
import ChatArea from "../components/ChatArea";  
import apiURL from   "../../utils";
import { useEffect, useState } from "react";
// backend endpoint:
const ENDPOINT = "http://localhost:3000/";

const Chat = () => {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [socket, setSocket] = useState(null);

  //* socket-related:
  useEffect(() => {
    //! user must be logged-in (has a token) to use this App
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || {});
    const newSocket = io(ENDPOINT, {auth: { user: userInfo }, });
    setSocket(newSocket);
    return () => {
      if (newSocket) {
        newSocket.disconnect();  
      }
    };
  }, []);
  return (
    <Flex h="100vh" direction={{ base: "column", md: "row" }}>
      {/* Horizontal Flex: Sidebar in Box 1 sits NEXT to ChatArea in Box 2 */}

      {/* Box 1 - Sidebar({setSelectedGroup}) component  */}
      <Box
        w={{ base: "100%", md: "300px" }}
        h={{ base: "auto", md: "100vh" }}
        borderRight="1px solid"
        borderColor="gray.200"
        display={{ base: selectedGroup ? "none" : "block",  md: "block" }}
      >
        <Sidebar setSelectedGroup={setSelectedGroup} />
      </Box>

      {/* Box 2 - ChatArea(selectedGroup, socket, setSelectedGroup) component */}
      <Box
        flex="1"
        display={{ 
          base: selectedGroup ? "block" : "none", md: "block" 
        }}
        >
        {socket && (
          <ChatArea
            selectedGroup={selectedGroup}
            socket={socket}
            setSelectedGroup={setSelectedGroup}
          />
        )}
      </Box>
    </Flex>
  );
};

export default Chat;
