// client/src/components/dashboard/inspector/InspectorDashboard.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Card,
  CardBody,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
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
  VStack,
  HStack,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useRouter } from 'next/router';
import DashboardLayout from '../../layouts/DashboardLayout';

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

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
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
          description: error.response?.data?.error || 'Failed to load dashboard data',
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
  }, [token, router, toast]);

  const handleViewInspection = (inspectionId) => {
    router.push(`/dashboard/inspector/inspections/${inspectionId}`);
  };

  const handleStartInspection = async (inspectionId) => {
    try {
      const response = await axios.put(`/api/inspections/${inspectionId}/start`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({
        title: 'Inspection Started',
        description: 'Inspection has been started successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });

      // Refresh inspections list
      const inspectionsRes = await axios.get('/api/inspector/inspections/scheduled', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setScheduledInspections(inspectionsRes.data.inspections);

      // Redirect to inspection detail page
      router.push(`/dashboard/inspector/inspections/${inspectionId}`);

    } catch (error) {
      console.error('Start inspection error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to start inspection',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    }
  };

  const statusColors = {
    scheduled: 'yellow',
    in_progress: 'orange',
    completed: 'green',
    cancelled: 'red',
    delayed: 'red'
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <VStack spacing={6} align="stretch">
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
                <VStack spacing={4} align="stretch">
                  <Heading size="md" mb={4}>Scheduled Inspections</Heading>
                  
                  {scheduledInspections && scheduledInspections.length > 0 ? (
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
                          {scheduledInspections.map((inspection) => (
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
                                <HStack spacing={2}>
                                  <Button 
                                    size="sm" 
                                    colorScheme="blue"
                                    onClick={() => handleViewInspection(inspection.id)}
                                  >
                                    View Details
                                  </Button>
                                  
                                  {inspection.status === 'scheduled' && (
                                    <Button 
                                      size="sm" 
                                      colorScheme="green"
                                      onClick={() => handleStartInspection(inspection.id)}
                                    >
                                      Start Inspection
                                    </Button>
                                  )}
                                </HStack>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Alert status="info">
                      <AlertIcon />
                      <Box flex="1">
                        <AlertTitle>No Scheduled Inspections</AlertTitle>
                        <AlertDescription>
                          You don't have any scheduled inspections at the moment.
                        </AlertDescription>
                      </Box>
                    </Alert>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </motion.div>
      </Box>
    </DashboardLayout>
  );
};

export default InspectorDashboard;