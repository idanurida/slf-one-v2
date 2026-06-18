// client/src/pages/dashboard/drafter/index.js
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

const DrafterDashboard = () => {
  const [user, setUser] = useState({});
  const [stats, setStats] = useState({
    draft: 0,
    inReview: 0,
    approved: 0,
    rejected: 0
  });
  const [reportsToDraft, setReportsToDraft] = useState([]);
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
        const statsRes = await axios.get('/api/drafter/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(statsRes.data);

        // Fetch reports that need drafting
        const reportsRes = await axios.get('/api/drafter/reports/draft', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReportsToDraft(reportsRes.data.reports);

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

  const handleViewReport = (reportId) => {
    router.push(`/dashboard/drafter/reports/${reportId}`);
  };

  const statusColors = {
    draft: 'gray',
    in_review: 'yellow',
    approved: 'green',
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
        <Heading mb={6} color="yellow.600">Drafter Dashboard</Heading>
        
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={8}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Draft Reports</StatLabel>
                <StatNumber color="gray.500">{stats.draft}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>In Review</StatLabel>
                <StatNumber color="yellow.500">{stats.inReview}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Approved</StatLabel>
                <StatNumber color="green.500">{stats.approved}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Rejected</StatLabel>
                <StatNumber color="red.500">{stats.rejected}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        <Card>
          <CardBody>
            <Heading size="md" mb={4}>Reports Needing Drafting</Heading>
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Project Name</Th>
                    <Th>Inspection Date</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {reportsToDraft.length > 0 ? (
                    reportsToDraft.map((report) => (
                      <Tr key={report.id}>
                        <Td>
                          <Text fontWeight="bold">{report.project?.name}</Text>
                          <Text fontSize="sm" color="gray.500">
                            {report.project?.owner_name}
                          </Text>
                        </Td>
                        <Td>
                          {report.inspection?.scheduled_date 
                            ? new Date(report.inspection.scheduled_date).toLocaleDateString('id-ID')
                            : '-'}
                        </Td>
                        <Td>
                          <Badge colorScheme={statusColors[report.status] || 'gray'}>
                            {report.status.replace(/_/g, ' ')}
                          </Badge>
                        </Td>
                        <Td>
                          <Button 
                            size="sm" 
                            colorScheme="yellow"
                            onClick={() => handleViewReport(report.id)}
                          >
                            Create Report
                          </Button>
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td colSpan={4} textAlign="center">
                        <Text color="gray.500">No reports needing drafting</Text>
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

export default DrafterDashboard;