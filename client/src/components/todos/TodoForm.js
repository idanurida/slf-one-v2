// client/src/components/todos/TodoForm.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Button,
  VStack,
  HStack,
  useToast,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  DatePicker,
  TimePicker
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useRouter } from 'next/router';

const TodoForm = ({ todo, onSave, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigned_to: '',
    project_id: '',
    inspection_id: '',
    due_date: '',
    priority: 'medium',
    ...todo
  });
  
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  const [fetchingProjects, setFetchingProjects] = useState(true);
  const toast = useToast();
  const router = useRouter();

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Fetch users for assignment
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setFetchingUsers(true);
        const response = await axios.get('/api/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(response.data.users || response.data);
      } catch (error) {
        console.error('Fetch users error:', error);
        toast({
          title: 'Error',
          description: 'Failed to load users',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right'
        });
      } finally {
        setFetchingUsers(false);
      }
    };

    fetchUsers();
  }, [token, toast]);

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setFetchingProjects(true);
        const response = await axios.get('/api/projects', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProjects(response.data.projects || response.data);
      } catch (error) {
        console.error('Fetch projects error:', error);
        toast({
          title: 'Error',
          description: 'Failed to load projects',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right'
        });
      } finally {
        setFetchingProjects(false);
      }
    };

    fetchProjects();
  }, [token, toast]);

  // Fetch inspections when project is selected
  useEffect(() => {
    const fetchInspections = async () => {
      if (!formData.project_id) {
        setInspections([]);
        return;
      }

      try {
        const response = await axios.get(`/api/projects/${formData.project_id}/inspections`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setInspections(response.data.inspections || response.data);
      } catch (error) {
        console.error('Fetch inspections error:', error);
        toast({
          title: 'Error',
          description: 'Failed to load inspections',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right'
        });
      }
    };

    fetchInspections();
  }, [formData.project_id, token, toast]);

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

    try {
      const token = localStorage.getItem('token');
      let response;

      if (isEditing && todo?.id) {
        // Update existing todo
        response = await axios.put(`/api/todos/${todo.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        toast({
          title: 'Task updated',
          description: 'Task has been successfully updated',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top-right'
        });
      } else {
        // Create new todo
        response = await axios.post('/api/todos', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        toast({
          title: 'Task created',
          description: 'New task has been successfully created',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top-right'
        });
      }

      if (onSave) {
        onSave(response.data);
      }

      router.push(`/dashboard/${user.role}/todos`);

    } catch (error) {
      console.error('Todo form error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to save task',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetchingUsers || fetchingProjects) {
    return (
      <Box p={6}>
        <Skeleton height="40px" width="200px" mb={6} />
        <VStack spacing={4} align="stretch">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={i} height="60px" borderRadius="md" />
          ))}
        </VStack>
        <HStack justify="flex-end" pt={4}>
          <Skeleton height="40px" width="100px" />
          <Skeleton height="40px" width="100px" />
        </HStack>
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardBody>
          <VStack spacing={6} align="stretch">
            <Box>
              <Heading size="lg" color="blue.600">
                {isEditing ? 'Edit Task' : 'Create New Task'}
              </Heading>
              <Text color="gray.600">
                {isEditing 
                  ? 'Update task details' 
                  : 'Assign a new task to team member'}
              </Text>
            </Box>
            
            <Divider />
            
            <form onSubmit={handleSubmit}>
              <VStack spacing={6} align="stretch">
                <FormControl isRequired>
                  <FormLabel>Task Title</FormLabel>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter task title"
                    isDisabled={loading}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter task description"
                    minHeight="100px"
                    isDisabled={loading}
                  />
                </FormControl>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl isRequired>
                    <FormLabel>Assign To</FormLabel>
                    <Select
                      name="assigned_to"
                      value={formData.assigned_to}
                      onChange={handleChange}
                      placeholder="Select team member"
                      isDisabled={loading}
                    >
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.role})
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Project (Optional)</FormLabel>
                    <Select
                      name="project_id"
                      value={formData.project_id}
                      onChange={handleChange}
                      placeholder="Select project"
                      isDisabled={loading}
                    >
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name} - {project.owner_name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </SimpleGrid>
                
                {formData.project_id && (
                  <FormControl>
                    <FormLabel>Inspection (Optional)</FormLabel>
                    <Select
                      name="inspection_id"
                      value={formData.inspection_id}
                      onChange={handleChange}
                      placeholder="Select inspection"
                      isDisabled={loading}
                    >
                      {inspections.map((inspection) => (
                        <option key={inspection.id} value={inspection.id}>
                          Inspection #{inspection.id} - {new Date(inspection.scheduled_date).toLocaleDateString('id-ID')}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                )}
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl>
                    <FormLabel>Due Date</FormLabel>
                    <Input
                      type="date"
                      name="due_date"
                      value={formData.due_date}
                      onChange={handleChange}
                      isDisabled={loading}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      isDisabled={loading}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </Select>
                  </FormControl>
                </SimpleGrid>
                
                <HStack justify="flex-end" spacing={4} pt={2}>
                  <Button
                    onClick={onCancel}
                    isDisabled={loading}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    type="submit"
                    colorScheme="blue"
                    isLoading={loading}
                    loadingText={isEditing ? "Updating..." : "Creating..."}
                  >
                    {isEditing ? "Update Task" : "Create Task"}
                  </Button>
                </HStack>
              </VStack>
            </form>
          </VStack>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default TodoForm;