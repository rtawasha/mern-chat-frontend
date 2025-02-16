import {Box, VStack, Text, Input, Button, Flex, Icon, Avatar, InputGroup, InputRightElement, useToast} from "@chakra-ui/react";
import { FiSend, FiInfo, FiMessageCircle } from "react-icons/fi";
import UsersList from "./UsersList";
import { useRef, useState, useEffect } from "react";
import axios  from "axios";
import apiURL from "../../utils";

//! this Component is used in Chat.jsx - search for it!!!!

//! START: ChatArea
const ChatArea = ({ selectedGroup, socket, setSelectedGroup }) => {
  console.log("\n\nchatArea - selectedGroup?._id ==================>", selectedGroup?._id);  

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set()); //! unique values: unique set of users who are typing: no dups
  // useRef() is used to store a mutable value that persists across re-renders
  // useRef() stores a reference to a DOM element
  // useRef() stores previous values that persist across re-renders: avoiding unnecessary re-renders for performance optimization, i.e.:
  // sending real-time messages, typing messages in 'input' field doesn't cause re-renders
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const toast = useToast();

  //? Retrieve logged-in user info from localStorage:
  const currentUser = JSON.parse(localStorage.getItem("userInfo") || {});   
  console.log("currentUser 1 *================>", currentUser);

  //! GET messages from the backend using Axios & updates the state 'setMessages' with the response
  //! GET messages by group ID:
  const fetchMessages = async () => {
    const currentUser = JSON.parse(localStorage.getItem("userInfo") || {});  //! Retrieve "userInfo" from localStorage
    const token = currentUser?.token; //! Extract authentication token
    try {
      //! get messages by group ID by a User who is logged-in/authorized(token...)
      const { data } = await axios.get(
            `http://localhost:3000/api/messages/${selectedGroup?._id}`, 
            {headers: { Authorization: `Bearer ${token}` }}             //! as I did in Postman request
            // `${apiURL}/api/messages/${selectedGroup?._id/group}`, {headers: { Authorization: `Bearer ${token}` }, } 
      );
      setMessages(data);
    } catch (error) {
      console.log(error);
    }
  };    //! END: fetchMessages()

  //! socket is an External system!
  //! useEffect at the top level of your component - can be called multiple times
  useEffect(() => {
    if (selectedGroup && socket) {
      //fetchMessages by Group function defined below: line 84
      fetchMessages();
      socket.emit("join room", selectedGroup?._id);    //? listens "join room" Event emitted by server
      socket.on("message received", (newMessage) => {  //? listens "message received" Event sent by socket.js
        setMessages((prev) => [...prev, newMessage]);  //! Updates the state by ADDING the new message to the existing list (prev)
      });                                              //! spread operator (...prev) ADDS...

      socket.on("users in room", (users) => {         //? listens "users in room" Event Object   
        setConnectedUsers(users);                     //! get all users in the room
      });

      socket.on("user joined", (user) => {             //! NEW 'user' joined the room  -> "user joined" Event
        setConnectedUsers((prev) => [...prev, user]);  //! Updates the state by adding the new user to the existing list (prev)
      });

      socket.on("user left", (userId) => {            //? listens "user left" Event Object 
        setConnectedUsers((prev) =>
          prev.filter((user) => user?._id !== userId)  //! Updates the state by excluding the user who left from the existing list (prev)
        );
      });

      socket.on("notification", (notification) => {   //? listens to "notification" Event Object 
        // displays a pop-up notification:
        toast({ 
          // if notification type is 'USER_JOINED', notification title: 'New User' else 'Notification'
          description: notification.message,   //! see message in backend 
          title: notification?.type === "USER_JOINED" ? "New User" : "Notification",   
          status: "info",    //! Sets the notification color to blue
          duration: 3000,    //! Auto-closes after 3 seconds
          isClosable: true,  //! Allows manual closing
          position: "top-right", //! Displays notification in the top-right corner
        });
      });

      // Listens for the "user typing" event (emitted by the Socket.IO server)
      socket.on("user typing", ({ username }) => {  //? expects a username object
        setTypingUsers((prev) => new Set(prev).add(username));   //! Updates the state by adding the user who is typing to the existing set
      });               //! used 'Set' (not 'Array') to store unique user to ensure uniqueness so a user is NOT added more than once 

      // removing the user who stopped typing
      socket.on("user stop typing", ({ username }) => {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(username);
          return newSet;
        });
      });
      
      //! useEffect returns "clean up function" to remove event listeners
      return () => {
        socket.emit("leave room", selectedGroup?._id);  //? undoes socket.emit("join room"),...)
        socket.off("message received");                 //? removes socket.on("message received")
        socket.off("users in room");
        socket.off("user joined");
        socket.off("user left");
        socket.off("notification");
        socket.off("user typing");
        socket.off("user stop typing");
      };
    }
  }, [selectedGroup, socket, toast]);   //! END: useEffect()
  
  
  //! POST - send message - START sendMessage
  const sendMessage = async () => {
    if (!newMessage.trim()) {
      return;
    }
    try {                                   
      const token = currentUser.token;
      // const { data } = await axios.post(`${apiURL}/api/messages`, 
      const { data } = await axios.post('http://localhost:3000/api/messages', 
        { content: newMessage, groupId: selectedGroup?._id, },
        { headers: { Authorization: `Bearer ${token}` },  }   //! as I did in Postman
      );
      socket.emit("new message", {
        ...data,                          //? Spread operator ...data (copies data) to include all details Dynamically (e.g., content, sender)
        groupId: selectedGroup?._id, });    

      setMessages([...messages, data]);   //? Updates the 'messages' state by adding new 'data' to existing 'messages' list 
      setNewMessage("");                  //? Clear input field after sending
    } catch (error) {
      toast({                             //? pop-up notification
        title: "Error sending message",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };      //! END: sendMessage

  //! handleTyping
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    //* isTyping must be false to start typing, otherwise duplicate typing indicator will be displayed
    //* also, selectedGroup must be truthy to start typing, if falsy, typing indicator will not be displayed: backend function won't emit an Event
    // check backend --> //! 5- Typing Indicator
    if (!isTyping && selectedGroup) {   //? if isTyping is false, set isTyping to true
      setIsTyping(true);
      socket.emit("typing", { groupId: selectedGroup?._id, username: currentUser.username, }); 
    }
    //clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    //set new timeout
    //! setTimeout() is used to schedule a function to be executed after a specified delay:
    //! if typing doesn't start in 2 seconds, setIsTyping = false
    typingTimeoutRef.current = setTimeout(() => {
      if (selectedGroup) {
        socket.emit("stop typing", {groupId: selectedGroup?._id, });  
      }
      setIsTyping(false);
    }, 2000);
  };     //! END: handleTyping

  //! format time
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };    //! END: formatTime

  //! render typing indicator 
  const renderTypingIndicator = () => {
    if (typingUsers.size === 0) 
      {
        return null; 
      } 
    //! convert typingUsers SET to an Array
    const typingUsersArray = Array.from(typingUsers);
    return typingUsersArray?.map((username) => (
      <Box key={username} alignSelf={username === currentUser?.username ? "flex-start" : "flex-end"} maxW="70%" >
        <Flex align="center" bg={username === currentUser?.username ? "blue.50" : "gray.50"} p={2} borderRadius="lg" gap={2} >
          {/* current user (You) -left side */}
          {username === currentUser?.username ? (
            <>
              <Avatar size="xs" name={username} />
              <Flex align="center" gap={1}>
                <Text fontSize="sm" color="gray.500" fontStyle="italic">
                  You are typing
                </Text>
                <Flex gap={1}>
                  {[1, 2, 3].map((dot) => (
                    <Box key={dot} w="3px" h="3px" borderRadius="full" bg="gray.500" />
                  ))}
                </Flex>
              </Flex>
            </>   
            // ????????????
          ) : (
            <>
              <Flex align="center" gap={1}>
                <Text fontSize="sm" color="gray.500" fontStyle="italic">
                  {username} is typing
                </Text>
                <Flex gap={1}>
                  {[1, 2, 3].map((dot) => (
                    <Box key={dot} w="3px" h="3px" borderRadius="full" bg="gray.500" />
                  ))}
                </Flex>
              </Flex>
              <Avatar size="xs" name={username} />
            </>
          )}
        </Flex>
      </Box>
    ));
  };

  //! Sample data for demonstration
  const sampleMessages = [
    { id: 1,
      content: "Hey team! Just pushed the new updates to staging.",
      sender: { username: "Sarah Chen" },
      createdAt: "10:30 AM",
      isCurrentUser: false,  },
    { id: 2,
      content: "Great work! The new features look amazing 🚀",
      sender: { username: "Alex Thompson" },
      createdAt: "10:31 AM",
      isCurrentUser: false,  },
    { id: 3,
      content: "Thanks! Let's review it in our next standup.",
      sender: { username: "You" },
      createdAt: "10:32 AM",
      isCurrentUser: true,  },
  ];
  //* main return / render
  return (
    <Flex
      h="100%"
      position="relative"
      direction={{ base: "column", lg: "row" }}
    >
      <Box
        flex="1"
        display="flex"
        flexDirection="column"
        bg="gray.50"
        maxW={{ base: "100%", lg: `calc(100% - 260px)` }}
      >
        {/* Chat Header */}
        {selectedGroup ? (
          <>
            <Flex
              px={6}
              py={4}
              bg="white"
              borderBottom="1px solid"
              borderColor="gray.200"
              align="center"
              boxShadow="sm"
            >
              <Button
                display={{ base: "inline-flex", md: "none" }}
                variant="ghost"
                mr={2}
                onClick={() => setSelectedGroup(null)}
              >
                ←
              </Button>
              <Icon
                as={FiMessageCircle}
                fontSize="24px"
                color="blue.500"
                mr={3}
              />
              <Box flex="1">
                <Text fontSize="lg" fontWeight="bold" color="gray.800">
                  {selectedGroup.name}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {selectedGroup.description}
                </Text>
              </Box>
              <Icon
                as={FiInfo}
                fontSize="20px"
                color="gray.400"
                cursor="pointer"
                _hover={{ color: "blue.500" }}
              />
            </Flex>

            {/* Messages Area */}
            <VStack
              flex="1"
              overflowY="auto"
              spacing={4}
              align="stretch"
              px={6}
              py={4}
              position="relative"
              sx={{
                "&::-webkit-scrollbar": {
                  width: "8px",
                },
                "&::-webkit-scrollbar-track": {
                  width: "10px",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "gray.200",
                  borderRadius: "24px",
                },
              }}
            >
              {/* each message sits in the Box in which it was created */}
              {messages.map((message) => (
                <Box
                  key={message._id}
                  alignSelf={
                    message.sender._id === currentUser?._id
                      ? "flex-start"
                      : "flex-end"
                  }
                  maxW="70%"
                >
                  <Flex direction="column" gap={1}>
                    <Flex
                      align="center"
                      mb={1}
                      justifyContent={
                        message.sender._id === currentUser?._id
                          ? "flex-start"
                          : "flex-end"
                      }
                      gap={2}
                    >
                      {/* if the message is sent by the current user ? blablabla : blablabla */}
                      {message.sender._id === currentUser?._id ? (
                        <>
                          <Avatar size="xs" name={message.sender.username} />
                          <Text fontSize="xs" color="gray.500">
                            You • {formatTime(message.createdAt)}
                          </Text>
                        </>
                        // else:
                      ) : (
                        <>
                          <Text fontSize="xs" color="gray.500">
                            {message.sender.username} •{" "}
                            {formatTime(message.createdAt)}
                          </Text>
                          <Avatar size="xs" name={message.sender.username} />
                        </>
                      )}
                    </Flex>

                    <Box
                      bg={
                        message?.sender._id === currentUser?._id
                          ? "blue.500"
                          : "white"
                      }
                      color={
                        message?.sender._id === currentUser?._id
                          ? "white"
                          : "gray.800"
                      }
                      p={3}
                      borderRadius="lg"
                      boxShadow="sm"
                    >
                      <Text>
                        {message.content}
                      </Text>
                    </Box>
                  </Flex>
                </Box>
              ))}
              {renderTypingIndicator()}
              <div ref={messagesEndRef} />
            </VStack>

            {/* Message Input */}
            <Box
              p={4}
              bg="white"
              borderTop="1px solid"
              borderColor="gray.200"
              position="relative"
              zIndex="1"
            >
              <InputGroup size="lg">
                <Input
                  value={newMessage}
                  onChange={handleTyping}
                  placeholder="Type your message..."
                  pr="4.5rem"
                  bg="gray.50"
                  border="none"
                  _focus={{
                    boxShadow: "none",
                    bg: "gray.100",
                  }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      sendMessage();
                    }
                  }}
                />
                <InputRightElement width="4.5rem">
                  <Button
                    h="1.75rem"
                    size="sm"
                    colorScheme="blue"
                    borderRadius="full"
                    _hover={{
                      transform: "translateY(-1px)",
                    }}
                    transition="all 0.2s"
                    onClick={sendMessage}
                  >
                    <Icon as={FiSend} />
                  </Button>
                </InputRightElement>
              </InputGroup>
            </Box>
          </>
        ) : (
          <>
            <Flex
              h="100%"
              direction="column"
              align="center"
              justify="center"
              p={8}
              textAlign="center"
            >
              <Icon
                as={FiMessageCircle}
                fontSize="64px"
                color="gray.300"
                mb={4}
              />
              <Text fontSize="xl" fontWeight="medium" color="gray.500" mb={2}>
                Welcome to the Chat
              </Text>
              <Text color="gray.500" mb={2}>
                Select a group from the sidebar to start chatting
              </Text>
            </Flex>
          </>
        )}
      </Box>

      {/* UsersList with responsive width */}
      <Box
        width={{ base: "100%", lg: "260px" }}
        position={{ base: "static", lg: "sticky" }}
        right={0}
        top={0}
        height={{ base: "auto", lg: "100%" }}
        flexShrink={0}
        display={{ base: "none", lg: "block" }}
      >
        {selectedGroup && <UsersList users={connectedUsers} />}
      </Box>
    </Flex>
  );
};

export default ChatArea;