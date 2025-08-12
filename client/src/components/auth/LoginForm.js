// client/src/components/auth/LoginForm.js
import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
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

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();

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
    <Card maxW="400px" mx="auto" mt={8} mb={8}>
      <CardBody>
        <VStack spacing={6} align="stretch">
          <VStack spacing={2} textAlign="center">
            <Heading size="lg" color="blue.600">
              SLF One Manager
            </Heading>
            <Text color="gray.600">
              Login to your account
            </Text>
          </VStack>

          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </FormControl>
              
              <Button
                type="submit"
                colorScheme="blue"
                isLoading={loading}
                loadingText="Logging in"
                w="100%"
                size="lg"
              >
                Login
              </Button>
            </VStack>
          </form>

          <HStack justify="center">
            <Text color="gray.600">
              Don't have an account?{' '}
              <Link color="blue.500" href="/register">
                Register
              </Link>
            </Text>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default LoginForm;