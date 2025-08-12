// client/src/components/dashboard/SuperadminDashboard.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Card,
  CardBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Button,
  Badge,
  useToast,
  Skeleton
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import axios from 'axios';

const SuperadminDashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    pendingApprovals: 0,
    reportsGenerated: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        // Fetch stats
        const statsRes = await axios.get('/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(statsRes.data);

        // Fetch recent users
        const usersRes = await axios.get('/api/users?limit=5', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRecentUsers(usersRes.data.users);

      } catch (error) {
        console.error('Dashboard error:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          status: 'error',
          duration: 5000,
          isClosable: true
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast, router]);

  if (loading) {
    return (
      <Box p={6}>
        <Skeleton height="40px" width="200px" mb={6} />
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={8}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height="100px" borderRadius="md" />
          ))}
        </SimpleGrid>
        <Card>
          <CardBody>
            <Skeleton height="30px" width="150px" mb={4} />
            <VStack spacing={3}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} height="40px" width="100%" />
              ))}
            </VStack>
          </CardBody>
        </Card>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <Heading mb={6} color="blue.600">Superadmin Dashboard</Heading>
      
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={8}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total Users</StatLabel>
              <StatNumber color="blue.500">{stats.totalUsers}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total Projects</StatLabel>
              <StatNumber color="green.500">{stats.totalProjects}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Pending Approvals</StatLabel>
              <StatNumber color="orange.500">{stats.pendingApprovals}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Reports Generated</StatLabel>
              <StatNumber color="purple.500">{stats.reportsGenerated}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Card>
        <CardBody>
          <Heading size="md" mb={4}>Recent Users</Heading>
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Role</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {recentUsers.map((user) => (
                  <Tr key={user.id}>
                    <Td>
                      <Text fontWeight="bold">{user.name}</Text>
                    </Td>
                    <Td>{user.email}</Td>
                    <Td>
                      <Text color="blue.500">{user.role}</Text>
                    </Td>
                    <Td>
                      <Badge colorScheme={user.is_active ? 'green' : 'red'}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </Td>
                    <Td>
                      <Button size="sm" colorScheme="blue">
                        View Details
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>
    </Box>
  );
};

export default SuperadminDashboard;