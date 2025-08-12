// client/src/pages/dashboard/admin-lead/index.js
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
  Skeleton,
  Divider
} from '@chakra-ui/react';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import axios from 'axios';
import { useRouter } from 'next/router';

const AdminLeadDashboard = () => {
  const [user, setUser] = useState({});
  const [stats, setStats] = useState({
    totalProjects: 0,
    pendingPayments: 0,
    verifiedPayments: 0,
    rejectedPayments: 0
  });
  const [pendingPayments, setPendingPayments] = useState([]);
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

        // Fetch user data
        const userRes = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(userRes.data.user);

        // Fetch stats
        const statsRes = await axios.get('/api/admin-lead/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(statsRes.data);

        // Fetch pending payments
        const paymentsRes = await axios.get('/api/admin-lead/payments/pending', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPendingPayments(paymentsRes.data.payments);

      } catch (error) {
        console.error('Dashboard error:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast, router]);

  const handleViewPayment = (paymentId) => {
    router.push(`/dashboard/admin-lead/payments/${paymentId}`);
  };

  const statusColors = {
    pending: 'yellow',
    verified: 'green',
    rejected: 'red'
  };

  if (loading) {
    return (
      <DashboardLayout user={user}>
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
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      <Box p={6}>
        <Heading mb={6} color="orange.600">Admin Lead Dashboard</Heading>
        
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={8}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Projects</StatLabel>
                <StatNumber color="orange.500">{stats.totalProjects}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Pending Payments</StatLabel>
                <StatNumber color="yellow.500">{stats.pendingPayments}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Verified Payments</StatLabel>
                <StatNumber color="green.500">{stats.verifiedPayments}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Rejected Payments</StatLabel>
                <StatNumber color="red.500">{stats.rejectedPayments}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        <Card>
          <CardBody>
            <Heading size="md" mb={4}>Pending Payment Verifications</Heading>
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Project Name</Th>
                    <Th>Amount</Th>
                    <Th>Due Date</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {pendingPayments.length > 0 ? (
                    pendingPayments.map((payment) => (
                      <Tr key={payment.id}>
                        <Td>
                          <Text fontWeight="bold">{payment.project?.name}</Text>
                          <Text fontSize="sm" color="gray.500">
                            {payment.project?.owner_name}
                          </Text>
                        </Td>
                        <Td>
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR'
                          }).format(payment.amount)}
                        </Td>
                        <Td>
                          {payment.due_date 
                            ? new Date(payment.due_date).toLocaleDateString('id-ID')
                            : '-'}
                        </Td>
                        <Td>
                          <Badge colorScheme={statusColors[payment.status] || 'gray'}>
                            {payment.status}
                          </Badge>
                        </Td>
                        <Td>
                          <Button 
                            size="sm" 
                            colorScheme="orange"
                            onClick={() => handleViewPayment(payment.id)}
                          >
                            Verify
                          </Button>
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td colSpan={5} textAlign="center">
                        <Text color="gray.500">No pending payments</Text>
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </TableContainer>
          </CardBody>
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default AdminLeadDashboard;