import {Box,VStack,Text,Button,useDisclosure,Modal,ModalOverlay,ModalContent,ModalHeader,ModalBody,ModalCloseButton,FormControl,
  FormLabel,Input,useToast,Flex,Icon,Badge,Tooltip,  } from "@chakra-ui/react";
import { useEffect, useState }       from "react";
import { FiLogOut, FiPlus, FiUsers } from "react-icons/fi";
import { Link, useNavigate }         from "react-router-dom";
import axios  from "axios";
import apiURL from "../../utils";

//! {setSelectedGroup} is set by clicking the group in sidebar
const Sidebar = ( {setSelectedGroup} ) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groups, setGroups] = useState([]);         //!stores all groups, info about each group: name, description, members as in Database
  const [newGroupName, setNewGroupName] = useState("");  //! use Modal-related properties
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [userGroups, setUserGroups] = useState([]); //!stores an Array of group IDs of which a User is a member
  const [isAdmin, setIsAdmin] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  // run the 2 functions upon load 
  useEffect(() => {
    checkAdminStatus();
    fetchGroups();
    console.log("updating userGroups -------------------------------------->", userGroups); //? chatGPT added - keeps logging(Inspect...)
  }, []);  //? [userGroups] added chatGPT - runs on every re-render

  //Check if login user is an admin //! this should be placed BEFORE useEffect(), same goes for fetchGroups()
  const checkAdminStatus = () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || {});
    //!update admin status
    setIsAdmin(userInfo?.isAdmin || false);
  };

  //GET all groups - any logged in user can do so!
  const fetchGroups = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || {});
      const token = userInfo.token;
      const { data } = await axios.get(`http://localhost:3000/api/groups`, { headers: { Authorization: `Bearer ${token}` } });  //!as I did in Postman
      // const { data } = await axios.get(`${apiURL}/api/groups`, { headers: { Authorization: `Bearer ${token}` }, }); //!as I did in Postman
      
      setGroups(data);
      
      // Extract userGroupIds from updated data (userGroups: groups of which a User is a member)
      const userGroupIds = data?.filter((group) => {
        return group?.members?.some( (member) => member?._id === userInfo?._id );
      }).map((group) => group?._id);   //! returns an Array of group IDs not of GroupObjects

      setUserGroups([...userGroupIds]);  // Force state update - chatGPT
      //setUserGroups(userGroupIds);     //! replaced by the above line

    } catch (error) {
      console.log(error);
    }
  };   //! END fetchGroups

  //CREATE groups - must be an admin 
  const handleCreateGroup = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || {});
      const token = userInfo.token;
      //else: create group
      await axios.post(
        'http://localhost:3000/api/groups', 
        { name: newGroupName, description: newGroupDescription, },
        { headers: { Authorization: `Bearer ${token}`,  }  }    
        // `${apiURL}/api/groups`, ....
      );
      toast({
        title: "Group Created",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
      fetchGroups();
      setNewGroupName("");
      setNewGroupDescription("");
    } catch (error) {
      toast({
        title: "Error Creating Group",
        status: "error",
        duration: 3000,
        isClosable: true,
        description: error?.response?.data?.message || "An error occurred",
      });
    }
  };

  //join group
  const handleJoinGroup = async (groupId) => {     
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || {});
      const token = userInfo.token;
      await axios.post(`http://localhost:3000/api/groups/${groupId}/join`, {}, {headers: { Authorization: `Bearer ${token}` }, })//!as in postman
      // await axios.post(`${apiURL}/api/groups/${groupId}/join`, {}, {headers: { Authorization: `Bearer ${token}` }, })
      await fetchGroups();
      setSelectedGroup(groups.find((g) => g?._id === groupId));   //! groups is a STATE
      toast({
        title: "Joined group successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Error Joining Group",
        status: "error",
        duration: 3000,
        isClosable: true,
        description: error?.response?.data?.message || "An error occurred",
      });
    }
  };
  
  //leave group
  // const handleLeaveGroup = async (groupId = setSelectedGroup._id) => {        
  // const groupId = setSelectedGroup?._id; 
  const handleLeaveGroup = async (groupId) => {      
    console.log("\n\n\n Sidebar - groupId ------------------------------->", groupId); //! debugging
    if (!groupId) {
      console.error("Error: groupId is undefined");
      return;
    }

    try {
      // retrieve logged-in user info from localStorage
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || {});
      console.log("userInfo in handleLeaveGroup ===========================================> ", userInfo);
      const token = userInfo.token;

      await axios.post(`http://localhost:3000/api/groups/${groupId}/leave`, {}, {
          headers: { Authorization: `Bearer ${token}` },          }); //!as I did in postman
        
        await fetchGroups();

        // Remove the groupId from userGroups MANUALLY before state updates - chatGPT
        setUserGroups((prevUserGroups) => prevUserGroups.filter((id) => id !== groupId));  //! TRY commenting out this line

        setSelectedGroup(null);

        toast({
          title: "Left group successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: "Error Leaving Group",
          status: "error",
          duration: 3000,
          isClosable: true,
          description: error?.response?.data?.message || "An error occurred",
        });
      }
    };

    //logout
    const handleLogout = () => {
      localStorage.removeItem("userInfo");
      navigate("/login");
    };

    // Sample groups data

    return (
    <Box
      h={{ base: "calc(100vh - 60px)", md: "100%" }}
      bg="white"
      borderRight="1px"
      borderColor="gray.200"
      width={{ base: "100%", md: "300px" }}
      display="flex"
      flexDirection="column"
    >
      <Flex
        p={4}
        borderBottom="1px solid"
        borderColor="gray.200"
        bg="white"
        position="sticky"
        top={0}
        zIndex={1}
        backdropFilter="blur(8px)"
        align="center"
        justify="space-between"
      >
        <Flex align="center">
          <Icon as={FiUsers} fontSize="24px" color="blue.500" mr={2} />
          <Text fontSize="xl" fontWeight="bold" color="gray.800">
            Groups
          </Text>
        </Flex>
        {isAdmin && (
          <Tooltip label="Create New Group" placement="right">
            <Button
              size="sm"
              colorScheme="blue"
              variant="ghost"
              onClick={onOpen}
              borderRadius="full"
            >
              <Icon as={FiPlus} fontSize="20px" />
            </Button>
          </Tooltip>
        )}
      </Flex>

      <Box flex="1" overflowY="auto" p={4} mb={{ base: 20, md: 16 }}>
        <VStack spacing={3} align="stretch">

          {/* inserted console.log line till line 285 */}
          {groups.map((group) => (
            // console.log("Rendering group:", group._id, "User in group?", userGroups.includes(group._id));
            // return (
              <Box
                key={group._id}
                p={4}
                cursor="pointer"
                borderRadius="lg"
                bg={userGroups.includes(group?._id) ? "blue.50" : "gray.50"}
                borderWidth="1px"
                borderColor={
                  userGroups.includes(group?._id) ? "blue.200" : "gray.200"
                }
                transition="all 0.2s"
                _hover={{
                  transform: "translateY(-2px)",
                  shadow: "md",
                  borderColor: "blue.300",
                }}
              >
                <Flex justify="space-between" align="center">
                  {/* group.name  & group.description BOX */}
                  <Box 
                    onClick={() => setSelectedGroup(group)} flex="1">
                    <Flex align="center" mb={2}>
                      <Text fontWeight="bold" color="gray.800">
                        {group.name}
                      </Text>
                      {userGroups.includes(group?._id) && (
                        <Badge ml={2} colorScheme="blue" variant="subtle">
                          Joined
                        </Badge>
                      )}
                    </Flex>
                    <Text fontSize="sm" color="gray.600" noOfLines={2}>
                      {group.description}
                    </Text>
                  </Box>
                  <Button
                    size="sm"
                    colorScheme={userGroups?.includes(group?._id) ? "red" : "blue"}
                    variant={userGroups?.includes(group?._id) ? "ghost" : "solid"}
                    ml={3}

                    onClick={() => {
                      userGroups?.includes(group?._id) 
                        ? handleLeaveGroup(group?._id) 
                        : handleJoinGroup(group?._id);
                    }}
                    _hover={{
                      transform: group.isJoined ? "scale(1.05)" : "none",
                      bg: group.isJoined ? "red.50" : "blue.600",
                    }}
                    transition="all 0.2s"
                  >
                    {userGroups.includes(group?._id) ? (
                      <Text fontSize="sm" fontWeight="medium">
                        Leave
                      </Text>
                    ) : (
                      "Join"
                    )}
                  </Button>
                </Flex>
              </Box>
              // );
            ))}
          </VStack>
        </Box>   
        {/* END of console.log block at line 212 */}

      <Box
        p={4}
        borderTop="1px solid"
        borderColor="gray.200"
        bg="gray.50"
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        width={{ base: "100%", md: "300px" }}
        zIndex={2}
      >
        <Button
          onClick={handleLogout}
          variant="ghost"
          colorScheme="red"
          leftIcon={<Icon as={FiLogOut} />}
          _hover={{
            bg: "red.50",
            transform: "translateY(-2px)",
            shadow: "md",
          }}
          transition="all 0.2s"
        >
          Logout
        </Button>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent>
          <ModalHeader>Create New Group</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>Group Name</FormLabel>
              <Input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Enter group name"
                focusBorderColor="blue.400"
              />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Description</FormLabel>
              <Input
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                placeholder="Enter group description"
                focusBorderColor="blue.400"
              />
            </FormControl>

            <Button
              colorScheme="blue"
              mr={3}
              mt={4}
              width="full"
              onClick={handleCreateGroup}
            >
              Create Group
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Sidebar;

