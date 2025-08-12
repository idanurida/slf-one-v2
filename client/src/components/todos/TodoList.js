// client/src/components/todos/TodoList.js
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
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { 
  SearchIcon, 
  ChevronDownIcon, 
  AddIcon, 
  EditIcon, 
  DeleteIcon, 
  ViewIcon,
  CalendarIcon,
  BellIcon
} from '@chakra-ui/icons';
import axios from 'axios';
import { useRouter } from 'next/router';

const TodoList = ({ user, type = 'my-todos' }) => {
  const [todos, setTodos] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortBy, setSortBy] = useState('due_date');
  const [todoToDelete, setTodoToDelete] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const router = useRouter();
  const cancelRef = React.useRef();

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Fetch todos and stats
  useEffect(() => {
    const fetchTodosAndStats = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        
        // Fetch stats
        const statsRes = await axios.get('/api/todos/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(statsRes.data);

        // Fetch todos
        const endpoint = type === 'my-todos' ? '/api/todos/my-todos' : '/api/todos/assigned-todos';
        const params = {
          search: searchTerm,
          status: statusFilter,
          priority: priorityFilter,
          sort_by: sortBy
        };

        const todosRes = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
          params
        });
        setTodos(todosRes.data.todos || todosRes.data);

      } catch (error) {
        console.error('Fetch todos error:', error);
        toast({
          title: 'Error',
          description: error.response?.data?.error || 'Failed to load todos',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTodosAndStats();
  }, [token, type, searchTerm, statusFilter, priorityFilter, sortBy, toast]);

  const handleViewTodo = (todoId) => {
    router.push(`/dashboard/${user.role}/todos/${todoId}`);
  };

  const handleEditTodo = (todoId) => {
    router.push(`/dashboard/${user.role}/todos/${todoId}/edit`);
  };

  const handleDeleteTodo = async (todoId) => {
    try {
      await axios.delete(`/api/todos/${todoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({
        title: 'Todo deleted',
        description: 'Todo has been successfully deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });

      // Refresh todos
      const endpoint = type === 'my-todos' ? '/api/todos/my-todos' : '/api/todos/assigned-todos';
      const todosRes = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTodos(todosRes.data.todos || todosRes.data);

    } catch (error) {
      console.error('Delete todo error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete todo',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    } finally {
      onClose();
      setTodoToDelete(null);
    }
  };

  const confirmDelete = (todoId) => {
    setTodoToDelete(todoId);
    onOpen();
  };

  const statusColors = {
    pending: 'yellow',
    in_progress: 'orange',
    completed: 'green',
    cancelled: 'red'
  };

  const priorityColors = {
    low: 'gray',
    medium: 'blue',
    high: 'orange',
    urgent: 'red'
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
                <Skeleton key={i} height="50px" width="100%" />
              ))}
            </VStack>
          </CardBody>
        </Card>
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Box p={6}>
        <VStack spacing={6} align="stretch">
          <HStack justify="space-between">
            <Heading mb={6} color="blue.600">
              {type === 'my-todos' ? 'My Tasks' : 'Assigned Tasks'}
            </Heading>
            
            <Button
              leftIcon={<AddIcon />}
              colorScheme="blue"
              onClick={() => router.push(`/dashboard/${user.role}/todos/new`)}
            >
              Add New Task
            </Button>
          </HStack>
          
          {/* Stats Cards */}
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={8}>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Total Tasks</StatLabel>
                  <StatNumber color="blue.500">
                    {type === 'my-todos' ? stats.myTodos?.total : stats.assignedTodos?.total}
                  </StatNumber>
                </Stat>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Pending</StatLabel>
                  <StatNumber color="yellow.500">
                    {type === 'my-todos' ? stats.myTodos?.pending : stats.assignedTodos?.pending}
                  </StatNumber>
                </Stat>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>In Progress</StatLabel>
                  <StatNumber color="orange.500">
                    {type === 'my-todos' ? stats.myTodos?.inProgress : stats.assignedTodos?.inProgress}
                  </StatNumber>
                </Stat>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Completed</StatLabel>
                  <StatNumber color="green.500">
                    {type === 'my-todos' ? stats.myTodos?.completed : stats.assignedTodos?.completed}
                  </StatNumber>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>
          
          {/* Filters */}
          <Card mb={6}>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack spacing={4} wrap="wrap">
                  <InputGroup width={{ base: '100%', md: '300px' }}>
                    <InputLeftElement pointerEvents='none'>
                      <SearchIcon color='gray.300' />
                    </InputLeftElement>
                    <Input
                      placeholder="Search tasks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                  
                  <Select
                    placeholder="Filter by Status"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    width={{ base: '100%', md: '200px' }}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </Select>
                  
                  <Select
                    placeholder="Filter by Priority"
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    width={{ base: '100%', md: '200px' }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </Select>
                  
                  <Select
                    placeholder="Sort by"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    width={{ base: '100%', md: '150px' }}
                  >
                    <option value="due_date">Due Date</option>
                    <option value="priority">Priority</option>
                    <option value="created_at">Created Date</option>
                    <option value="title">Title</option>
                  </Select>
                  
                  {(searchTerm || statusFilter || priorityFilter) && (
                    <Button
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('');
                        setPriorityFilter('');
                      }}
                      variant="outline"
                      colorScheme="red"
                    >
                      Clear Filters
                    </Button>
                  )}
                </HStack>
              </VStack>
            </CardBody>
          </Card>
          
          {/* Todos Table */}
          <Card>
            <CardBody>
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Title</Th>
                      <Th>Due Date</Th>
                      <Th>Priority</Th>
                      <Th>Status</Th>
                      <Th>Progress</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {todos && todos.length > 0 ? (
                      todos.map((todo) => (
                        <Tr key={todo.id}>
                          <Td>
                            <Text fontWeight="bold">{todo.title}</Text>
                            <Text fontSize="sm" color="gray.500">
                              {todo.description?.substring(0, 50)}...
                            </Text>
                            {todo.project && (
                              <Text fontSize="xs" color="blue.500">
                                Project: {todo.project.name}
                              </Text>
                            )}
                          </Td>
                          <Td>
                            {todo.due_date 
                              ? new Date(todo.due_date).toLocaleDateString('id-ID')
                              : '-'}
                          </Td>
                          <Td>
                            <Badge colorScheme={priorityColors[todo.priority] || 'gray'}>
                              {todo.priority}
                            </Badge>
                          </Td>
                          <Td>
                            <Badge colorScheme={statusColors[todo.status] || 'gray'}>
                              {todo.status.replace(/_/g, ' ')}
                            </Badge>
                          </Td>
                          <Td>
                            <Text fontSize="sm">
                              {todo.progress || 0}%
                            </Text>
                          </Td>
                          <Td>
                            <HStack spacing={2}>
                              <Tooltip label="View Details">
                                <IconButton
                                  icon={<ViewIcon />}
                                  size="sm"
                                  colorScheme="blue"
                                  onClick={() => handleViewTodo(todo.id)}
                                />
                              </Tooltip>
                              
                              <Tooltip label="Edit Task">
                                <IconButton
                                  icon={<EditIcon />}
                                  size="sm"
                                  colorScheme="green"
                                  onClick={() => handleEditTodo(todo.id)}
                                />
                              </Tooltip>
                              
                              <Tooltip label="Delete Task">
                                <IconButton
                                  icon={<DeleteIcon />}
                                  size="sm"
                                  colorScheme="red"
                                  onClick={() => confirmDelete(todo.id)}
                                />
                              </Tooltip>
                            </HStack>
                          </Td>
                        </Tr>
                      ))
                    ) : (
                      <Tr>
                        <Td colSpan={6} textAlign="center">
                          <Text color="gray.500">
                            {searchTerm || statusFilter || priorityFilter 
                              ? 'No tasks found matching your criteria'
                              : 'No tasks available'}
                          </Text>
                        </Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
              </TableContainer>
            </CardBody>
          </Card>
        </VStack>
        
        {/* Delete Confirmation Dialog */}
        <AlertDialog
          isOpen={isOpen}
          leastDestructiveRef={cancelRef}
          onClose={onClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                Delete Task
              </AlertDialogHeader>

              <AlertDialogBody>
                Are you sure you want to delete this task? This action cannot be undone.
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  colorScheme='red' 
                  onClick={() => handleDeleteTodo(todoToDelete)}
                  ml={3}
                >
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Box>
    </motion.div>
  );
};

export default TodoList;