// client/src/pages/login.js
import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  useToast,
  Link,
  HStack,
  Card,
  CardBody,
  useBreakpointValue,
  Center
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useRouter } from 'next/router';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password
      });

      // Store token in localStorage
      localStorage.setItem('token', response.data.token);
      
      // Redirect based on role
      const { role } = response.data.user;
      switch (role) {
        case 'superadmin':
          router.push('/dashboard/superadmin');
          break;
        case 'head_consultant':
          router.push('/dashboard/head-consultant');
          break;
        case 'project_lead':
          router.push('/dashboard/project-lead');
          break;
        case 'admin_lead':
          router.push('/dashboard/admin-lead');
          break;
        case 'inspektor':
          router.push('/dashboard/inspector');
          break;
        case 'drafter':
          router.push('/dashboard/drafter');
          break;
        case 'klien':
          router.push('/dashboard/client');
          break;
        default:
          router.push('/dashboard');
      }

      toast({
        title: 'Login successful',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error.response?.data?.error || 'Invalid credentials',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center minH="100vh" bg="gray.50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          maxW={isMobile ? "95vw" : "450px"}
          mx="auto"
          mt={isMobile ? 4 : 8}
          mb={isMobile ? 4 : 8}
          boxShadow="xl"
          borderRadius="xl"
        >
          <CardBody p={6}>
            <VStack spacing={6} align="stretch">
              <VStack spacing={2} textAlign="center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, type: "spring" }}
                >
                  <Heading size={isMobile ? "lg" : "xl"} color="blue.600">
                    SLF One Manager
                  </Heading>
                </motion.div>
                
                <Text color="gray.600" fontSize={isMobile ? "sm" : "md"}>
                  Login to your account
                </Text>
              </VStack>

              <form onSubmit={handleSubmit}>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel fontSize={isMobile ? "sm" : "md"}>Email</FormLabel>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      size={isMobile ? "md" : "lg"}
                      borderRadius="lg"
                      focusBorderColor="blue.500"
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel fontSize={isMobile ? "sm" : "md"}>Password</FormLabel>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      size={isMobile ? "md" : "lg"}
                      borderRadius="lg"
                      focusBorderColor="blue.500"
                    />
                  </FormControl>
                  
                  <Button
                    type="submit"
                    colorScheme="blue"
                    isLoading={loading}
                    loadingText="Logging in"
                    w="100%"
                    size={isMobile ? "md" : "lg"}
                    borderRadius="lg"
                    _hover={{ transform: 'scale(1.02)' }}
                    transition="all 0.2s"
                  >
                    {isMobile ? "Login" : "Login to Account"}
                  </Button>
                </VStack>
              </form>

              <HStack justify="center" pt={2}>
                <Text color="gray.600" fontSize={isMobile ? "xs" : "sm"}>
                  Don't have an account?{' '}
                  <Link 
                    color="blue.500" 
                    href="/register"
                    _hover={{ textDecoration: 'underline' }}
                  >
                    Register
                  </Link>
                </Text>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </motion.div>
    </Center>
  );
};

export default LoginPage;