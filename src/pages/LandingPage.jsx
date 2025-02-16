import {Box, Button, Container, Heading, Text, Stack, Icon, useColorModeValue, SimpleGrid, Flex, VStack, HStack, Badge,} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import {FiMessageSquare,FiUsers,FiLock,FiLogIn,FiLogOut,FiUserPlus,FiGlobe,FiActivity,FiUserCheck,} from "react-icons/fi";

//! Feature
const Feature = ({ title, text, icon, badges = [] }) => {
  return (
    <Stack
      bg={useColorModeValue("white", "gray.800")}
      rounded="xl"
      p={6}
      spacing={4}
      border="1px solid"
      borderColor={useColorModeValue("gray.100", "gray.700")}
      _hover={{
        transform: "translateY(-5px)",
        boxShadow: "xl",
      }}
      transition="all 0.3s ease"
    >
      <Flex
        align="center" justify="center"
        w={16} h={16} color="white" rounded="full" bg={useColorModeValue("blue.500", "blue.400")}
      >
        {icon}
      </Flex>
      <Box>
        <HStack spacing={2} mb={2}>
          <Text fontWeight={600} fontSize="lg">
            {title}
          </Text>
          {badges.map((badge, index) => (
            <Badge
              key={index}
              colorScheme={badge.color}
              variant="subtle"
              rounded="full"
              px={2}
            >
              {badge.text}
            </Badge>
          ))}
        </HStack>
        <Text color={useColorModeValue("gray.500", "gray.200")}>{text}</Text>
      </Box>
    </Stack>
  );
};

//! ChatMessage
const ChatMessage = ({ message, sender, time, isUser }) => {
  return (
    <Flex justify={isUser ? "flex-end" : "flex-start"} w="100%">
      <Box
        bg={isUser ? "blue.500" : "gray.100"}
        color={isUser ? "white" : "gray.800"}
        borderRadius="lg"
        px={4}
        py={2}
        maxW="80%"
      >
        <Text fontSize="sm" fontWeight="bold" mb={1}>
          {sender}
        </Text>
        <Text>{message}</Text>
        <Text
          fontSize="xs"
          color={isUser ? "whiteAlpha.700" : "gray.500"}
          mt={1}
        >
          {time}
        </Text>
      </Box>
    </Flex>
  );
};

//! Landing Page
export default function LandingPage() {
  return (
    <Box bg={useColorModeValue("gray.50", "gray.900")} minH="100vh">
      {/* Hero Section */}
      <Container maxW="7xl" pt={10}>
        <Stack
          align="center"
          spacing={{ base: 8, md: 10 }}
          py={{ base: 20, md: 28 }}
          direction={{ base: "column", md: "row" }}
        >
          <Stack flex={1} spacing={{ base: 5, md: 10 }}>
            <Heading
              lineHeight={1.1}
              fontWeight={600}
              fontSize={{ base: "3xl", sm: "4xl", lg: "6xl" }}
            >
              <Text
                as="span"
                position="relative"
                _after={{
                  content: "''",
                  width: "full",
                  height: "30%",
                  position: "absolute",
                  bottom: 1,
                  left: 0,
                  bg: "blue.400",
                  zIndex: -1,
                }}
              >
                Chatty
              </Text>
              <br />
              <Text as="span" color="blue.400">
                Chat App
              </Text>
            </Heading>
            <Text color="gray.500" fontSize="xl">
              Experience seamless group communication with our modern chat
              platform. Connect with teams, friends, and communities in
              real-time with advanced features like typing indicators and online
              status.
            </Text>
            <Stack
              spacing={{ base: 4, sm: 6 }}
              direction={{ base: "column", sm: "row" }}
            >
              <Button
                as={RouterLink}
                to="/register"
                rounded="full"
                size="lg"
                fontWeight="normal"
                px={8}
                colorScheme="blue"
                bg="blue.400"
                _hover={{ bg: "blue.500" }}
                leftIcon={<FiUserPlus />}
              >
                Get Started
              </Button>

              {/* sign in */}
              <Button
                as={RouterLink}
                to="/login"
                rounded="full"
                size="lg"
                fontWeight="normal"
                px={8}
                variant="outline"
                colorScheme="blue"
                leftIcon={<FiLogIn />}
              >
                Sign In
              </Button>
            </Stack>
          </Stack>

          {/* Chat Preview */}
          <Flex
            flex={1}
            justify="center"
            align="center"
            position="relative"
            w="full"
          >
            <Box
              position="relative"
              height="500px" rounded="2xl" boxShadow="2xl" borderColor="gray.200"
              width="full" overflow="hidden" bg="white" border="1px"
            >
              {/* 1 - Header */}
              <Box
                position="absolute"
                top={0} left={0} right={0} bg="blue.500" p={4} color="white"
                borderBottom="1px" borderColor="blue.600"
              >
                <HStack justify="space-between">
                  {/* 1st item */}
                  <HStack>
                    <Icon as={FiUsers} />
                    <Text fontWeight="bold">Team MasynTech</Text>
                  </HStack>
                  {/* 3 online */}
                  {/* 2nd item */}
                  <HStack spacing={4}>
                    <Badge colorScheme="green" variant="solid"> 3 online </Badge>
                    <Icon as={FiGlobe} />
                  </HStack>
                </HStack>
              </Box>

              {/* 2 - Chat Messages */}
              <VStack 
                spacing={4} p={4} pt="60px" h="calc(100% - 120px)" overflowY="auto"
              >
                {/* ChatMessage({ message, sender, time, isUser }) */}
                <ChatMessage
                  message="Hey team! Just pushed the new updates to staging."
                  sender="Sarah Chen"
                  time="10:30 AM"
                  // not logged in user
                  isUser={false}
                />
                <ChatMessage
                  message="Great work! The new features look amazing 🚀"
                  sender="Alex Thompson"
                  time="10:31 AM"
                  isUser={false}
                />
                <ChatMessage
                  message="Thanks! Let's review it in our next standup."
                  sender="You"
                  time="10:32 AM"
                  isUser={true}
                />
                <Box w="100%" textAlign="center">
                  <Badge colorScheme="gray" fontSize="xs"> Sarah is typing... </Badge>
                </Box>
              </VStack>
            </Box>
          </Flex>
        </Stack>

        {/* 4 - Features Grid: Powerful Features */}
        <Box py={20}>
          <VStack spacing={2} textAlign="center" mb={12}>
            <Heading fontSize="4xl"> Powerful Features </Heading>
            <Text fontSize="lg" color="gray.500">
              Everything you need for seamless team collaboration
            </Text>
          </VStack>
          {/* 2 rows, 3 items per row */}
          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 3 }}
            spacing={10}
            px={{ base: 4, md: 8 }}
          >
            <Feature
              icon={<Icon as={FiLock} w={10} h={10} />}
              title="Secure Authentication"
              badges={[{ text: "Secure", color: "green" }]}
              text="Register and login securely with email verification and encrypted passwords."
            />
            <Feature
              icon={<Icon as={FiUsers} w={10} h={10} />}
              title="Group Management"
              badges={[{ text: "Real-time", color: "blue" }]}
              text="Create, join, or leave groups easily. Manage multiple conversations in one place."
            />
            <Feature
              icon={<Icon as={FiUserCheck} w={10} h={10} />}
              title="Online Presence"
              badges={[{ text: "Live", color: "green" }]}
              text="See who's currently online and active in your groups in real-time."
            />
            <Feature
              icon={<Icon as={FiActivity} w={10} h={10} />}
              title="Typing Indicators"
              badges={[{ text: "Interactive", color: "purple" }]}
              text="Know when others are typing with real-time typing indicators."
            />
            <Feature
              icon={<Icon as={FiMessageSquare} w={10} h={10} />}
              title="Instant Messaging"
              badges={[{ text: "Fast", color: "orange" }]}
              text="Send and receive messages instantly with real-time delivery and notifications."
            />
            <Feature
              icon={<Icon as={FiGlobe} w={10} h={10} />}
              title="Global Access"
              badges={[{ text: "24/7", color: "blue" }]}
              text="Access your chats from anywhere, anytime with persistent connections."
            />
          </SimpleGrid>
        </Box>

        {/* Call to Action */}
        <Box py={20}>
          <Stack
            direction={{ base: "column", md: "row" }}
            spacing={10}
            align="center"
            justify="center"
            bg={useColorModeValue("blue.50", "blue.900")}
            p={10}
            rounded="xl"
          >
            {/* Ready to get STarted - @ page's very bottom */}
            <VStack align="flex-start" spacing={4}>
              <Heading size="lg">Ready to get started?</Heading>
              <Text color="gray.600" fontSize="lg">
                Join thousands of users already using our platform
              </Text>
            </VStack>
            <Button
              as={RouterLink} to="/register"
              size="lg" colorScheme="blue" rightIcon={<FiUserPlus />}
            >
              Create Free Account
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
