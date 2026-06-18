// client/src/pages/dashboard/inspector/index.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
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

const InspectorDashboard = () => {
  const [user, setUser] = useState({});
  const [stats, setStats] = useState({
    scheduled: 0,
    inProgress: 0,
    completed: 0,
    total: 0
  });
  const [scheduledInspections, setScheduledInspections] = useState([]);
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
        const statsRes = await axios.get('/api/inspector/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(statsRes.data);

        // Fetch scheduled inspections
        const inspectionsRes = await axios.get('/api/inspector/inspections/scheduled', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setScheduledInspections(inspectionsRes.data.inspections);

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

  const handleViewInspection = (inspectionId) => {
    router.push(`/dashboard/inspector/inspections/${inspectionId}`);
  };

  const statusColors = {
    scheduled: 'yellow',
    in_progress: 'orange',
    completed: 'green',
    cancelled: 'red'
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
        <Heading mb={6} color="red.600">Inspector Dashboard</Heading>
        
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={8}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Scheduled Inspections</StatLabel>
                <StatNumber color="yellow.500">{stats.scheduled}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>In Progress</StatLabel>
                <StatNumber color="orange.500">{stats.inProgress}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Completed</StatLabel>
                <StatNumber color="green.500">{stats.completed}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Inspections</StatLabel>
                <StatNumber color="blue.500">{stats.total}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        <Card>
          <CardBody>
            <Heading size="md" mb={4}>Scheduled Inspections</Heading>
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Project Name</Th>
                    <Th>Scheduled Date</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {scheduledInspections.length > 0 ? (
                    scheduledInspections.map((inspection) => (
                      <Tr key={inspection.id}>
                        <Td>
                          <Text fontWeight="bold">{inspection.project?.name}</Text>
                          <Text fontSize="sm" color="gray.500">
                            {inspection.project?.owner_name}
                          </Text>
                        </Td>
                        <Td>
                          {inspection.scheduled_date 
                            ? new Date(inspection.scheduled_date).toLocaleDateString('id-ID')
                            : '-'}
                        </Td>
                        <Td>
                          <Badge colorScheme={statusColors[inspection.status] || 'gray'}>
                            {inspection.status.replace(/_/g, ' ')}
                          </Badge>
                        </Td>
                        <Td>
                          <Button 
                            size="sm" 
                            colorScheme="red"
                            onClick={() => handleViewInspection(inspection.id)}
                          >
                            Start Inspection
                          </Button>
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td colSpan={4} textAlign="center">
                        <Text color="gray.500">No scheduled inspections</Text>
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

export default InspectorDashboard;