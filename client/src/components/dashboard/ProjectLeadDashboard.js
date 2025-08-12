// client/src/components/dashboard/ProjectLeadDashboard.js
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

const ProjectLeadDashboard = ({ user }) => {
  const [stats, setStats] = useState({
    assignedProjects: 0,
    onProgress: 0,
    completed: 0,
    delayed: 0
  });
  const [assignedProjects, setAssignedProjects] = useState([]);
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
        const statsRes = await axios.get('/api/project-lead/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(statsRes.data);

        // Fetch assigned projects
        const projectsRes = await axios.get('/api/project-lead/projects', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAssignedProjects(projectsRes.data.projects);

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

  const handleViewProject = (projectId) => {
    router.push(`/dashboard/project-lead/projects/${projectId}`);
  };

  const statusColors = {
    draft: 'gray',
    quotation_sent: 'yellow',
    quotation_accepted: 'orange',
    contract_signed: 'purple',
    spk_issued: 'blue',
    spk_accepted: 'teal',
    inspection_scheduled: 'cyan',
    inspection_in_progress: 'orange',
    inspection_done: 'green',
    report_draft: 'yellow',
    report_reviewed: 'orange',
    report_sent_to_client: 'purple',
    waiting_gov_response: 'pink',
    slf_issued: 'green',
    completed: 'green',
    cancelled: 'red',
    delayed: 'red'
  };

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
      <Heading mb={6} color="blue.600">Project Lead Dashboard</Heading>
      
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={8}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Assigned Projects</StatLabel>
              <StatNumber color="blue.500">{stats.assignedProjects}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>On Progress</StatLabel>
              <StatNumber color="orange.500">{stats.onProgress}</StatNumber>
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
              <StatLabel>Delayed</StatLabel>
              <StatNumber color="red.500">{stats.delayed}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Card>
        <CardBody>
          <Heading size="md" mb={4}>Assigned Projects</Heading>
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Project Name</Th>
                  <Th>Owner</Th>
                  <Th>Building Function</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {assignedProjects.length > 0 ? (
                  assignedProjects.map((project) => (
                    <Tr key={project.id}>
                      <Td>
                        <Text fontWeight="bold">{project.name}</Text>
                      </Td>
                      <Td>{project.owner_name}</Td>
                      <Td>{project.building_function}</Td>
                      <Td>
                        <Badge colorScheme={statusColors[project.status] || 'gray'}>
                          {project.status.replace(/_/g, ' ')}
                        </Badge>
                      </Td>
                      <Td>
                        <Button 
                          size="sm" 
                          colorScheme="blue"
                          onClick={() => handleViewProject(project.id)}
                        >
                          View Details
                        </Button>
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={5} textAlign="center">
                      <Text color="gray.500">No assigned projects</Text>
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>
    </Box>
  );
};

export default ProjectLeadDashboard;