// client/src/pages/register.js
import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  VStack,
  useToast,
  Link,
  HStack,
  Card,
  CardBody,
  useBreakpointValue,
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useRouter } from 'next/router';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    company: '',
    role: ''
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('/api/auth/register', {
        ...formData,
        password: formData.password // Backend akan hash password
      });

      toast({
        title: 'Registration Successful',
        description: 'Please login with your credentials',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });

      router.push('/login');
    } catch (error) {
      toast({
        title: 'Registration Failed',
        description: error.response?.data?.error || 'Failed to register user',
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
          maxW={isMobile ? "95vw" : "550px"}
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
                  Create a new account
                </Text>
              </VStack>

              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box flex="1">
                  <AlertTitle fontSize={isMobile ? "sm" : "md"}>Perhatian!</AlertTitle>
                  <AlertDescription fontSize={isMobile ? "xs" : "sm"}>
                    Pilih role yang sesuai dengan tanggung jawab Anda dalam sistem SLF One Manager.
                  </AlertDescription>
                </Box>
              </Alert>

              <form onSubmit={handleSubmit}>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel fontSize={isMobile ? "sm" : "md"}>Full Name</FormLabel>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      size={isMobile ? "md" : "lg"}
                      borderRadius="lg"
                      focusBorderColor="blue.500"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontSize={isMobile ? "sm" : "md"}>Email</FormLabel>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
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
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      size={isMobile ? "md" : "lg"}
                      borderRadius="lg"
                      focusBorderColor="blue.500"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontSize={isMobile ? "sm" : "md"}>Confirm Password</FormLabel>
                    <Input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      size={isMobile ? "md" : "lg"}
                      borderRadius="lg"
                      focusBorderColor="blue.500"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize={isMobile ? "sm" : "md"}>Phone Number</FormLabel>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      size={isMobile ? "md" : "lg"}
                      borderRadius="lg"
                      focusBorderColor="blue.500"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize={isMobile ? "sm" : "md"}>Company</FormLabel>
                    <Input
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Enter your company name"
                      size={isMobile ? "md" : "lg"}
                      borderRadius="lg"
                      focusBorderColor="blue.500"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontSize={isMobile ? "sm" : "md"}>Role</FormLabel>
                    <Select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      placeholder="Select your role"
                      size={isMobile ? "md" : "lg"}
                      borderRadius="lg"
                      focusBorderColor="blue.500"
                    >
                      <option value="superadmin">Superadmin</option>
                      <option value="head_consultant">Head Consultant</option>
                      <option value="project_lead">Project Lead</option>
                      <option value="admin_lead">Admin Lead</option>
                      <option value="inspektor">Inspector</option>
                      <option value="drafter">Drafter</option>
                      <option value="klien">Client</option>
                    </Select>
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="blue"
                    isLoading={loading}
                    loadingText="Registering"
                    w="100%"
                    size={isMobile ? "md" : "lg"}
                    borderRadius="lg"
                    _hover={{ transform: 'scale(1.02)' }}
                    transition="all 0.2s"
                  >
                    {isMobile ? "Register" : "Create Account"}
                  </Button>
                </VStack>
              </form>

              <HStack justify="center" pt={2}>
                <Text color="gray.600" fontSize={isMobile ? "xs" : "sm"}>
                  Already have an account?{' '}
                  <Link 
                    color="blue.500" 
                    href="/login"
                    _hover={{ textDecoration: 'underline' }}
                  >
                    Login
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

export default RegisterPage;