// client/src/components/auth/RegisterForm.js
import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  Heading,
  Text,
  useToast,
  Link,
  HStack,
  Card,
  CardBody
} from '@chakra-ui/react';
import axios from 'axios';
import { useRouter } from 'next/router';

const RegisterForm = () => {
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
    <Card maxW="500px" mx="auto" mt={8} mb={8}>
      <CardBody>
        <VStack spacing={6} align="stretch">
          <VStack spacing={2} textAlign="center">
            <Heading size="lg" color="blue.600">
              SLF One Manager
            </Heading>
            <Text color="gray.600">
              Create a new account
            </Text>
          </VStack>

          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Full Name</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Phone Number</FormLabel>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Company</FormLabel>
                <Input
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Enter your company name"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Role</FormLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  placeholder="Select your role"
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
                size="lg"
              >
                Register
              </Button>
            </VStack>
          </form>

          <HStack justify="center">
            <Text color="gray.600">
              Already have an account?{' '}
              <Link color="blue.500" href="/login">
                Login
              </Link>
            </Text>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default RegisterForm;