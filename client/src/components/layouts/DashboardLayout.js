// client/src/components/layouts/DashboardLayout.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  VStack,
  HStack,
  useToast,
  Skeleton,
  Divider,
  Badge,
  useBreakpointValue
} from '@chakra-ui/react';
import { HamburgerIcon, ChevronDownIcon, BellIcon } from '@chakra-ui/icons';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import axios from 'axios';

const DashboardLayout = ({ children, user }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentUser, setCurrentUser] = useState(user || {});
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const router = useRouter();

  // Responsive breakpoints
  const isMobile = useBreakpointValue({ base: true, md: false });
  const sidebarWidth = useBreakpointValue({ base: 0, md: '250px' });

  // Fetch user and notifications data
  useEffect(() => {
    const fetchData = async () => {
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
        setCurrentUser(userRes.data.user);

        // Fetch notifications
        const notificationsRes = await axios.get('/api/notifications', {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 5 }
        });
        setNotifications(notificationsRes.data.notifications || notificationsRes.data);
        
        // Fetch unread count
        const unreadRes = await axios.get('/api/notifications/unread-count', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUnreadCount(unreadRes.data.count || 0);

      } catch (error) {
        console.error('Fetch data error:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right'
        });
        localStorage.removeItem('token');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    if (!user) {
      fetchData();
    }
  }, [user, router, toast]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
    toast({
      title: 'Logged out successfully',
      status: 'info',
      duration: 3000,
      isClosable: true,
      position: 'top-right'
    });
  };

  // Get sidebar items based on user role
  const getSidebarItems = () => {
    const items = {
      superadmin: [
        { name: 'Dashboard', path: '/dashboard/superadmin', icon: '🏠' },
        { name: 'Users', path: '/dashboard/superadmin/users', icon: '👥' },
        { name: 'Projects', path: '/dashboard/superadmin/projects', icon: '🏗️' },
        { name: 'Reports', path: '/dashboard/superadmin/reports', icon: '📄' },
        { name: 'Settings', path: '/dashboard/superadmin/settings', icon: '⚙️' }
      ],
      head_consultant: [
        { name: 'Dashboard', path: '/dashboard/head-consultant', icon: '🏠' },
        { name: 'Projects', path: '/dashboard/head-consultant/projects', icon: '🏗️' },
        { name: 'Approvals', path: '/dashboard/head-consultant/approvals', icon: '✅' },
        { name: 'Reports', path: '/dashboard/head-consultant/reports', icon: '📄' }
      ],
      project_lead: [
        { name: 'Dashboard', path: '/dashboard/project-lead', icon: '🏠' },
        { name: 'My Projects', path: '/dashboard/project-lead/projects', icon: '🏗️' },
        { name: 'Inspections', path: '/dashboard/project-lead/inspections', icon: '🔍' },
        { name: 'Reports', path: '/dashboard/project-lead/reports', icon: '📄' }
      ],
      admin_lead: [
        { name: 'Dashboard', path: '/dashboard/admin-lead', icon: '🏠' },
        { name: 'Projects', path: '/dashboard/admin-lead/projects', icon: '🏗️' },
        { name: 'Payments', path: '/dashboard/admin-lead/payments', icon: '💰' },
        { name: 'Documents', path: '/dashboard/admin-lead/documents', icon: '📁' }
      ],
      inspektor: [
        { name: 'Dashboard', path: '/dashboard/inspector', icon: '🏠' },
        { name: 'My Inspections', path: '/dashboard/inspector/inspections', icon: '🔍' },
        { name: 'Checklists', path: '/dashboard/inspector/checklists', icon: '📋' },
        { name: 'Photos', path: '/dashboard/inspector/photos', icon: '📸' }
      ],
      drafter: [
        { name: 'Dashboard', path: '/dashboard/drafter', icon: '🏠' },
        { name: 'Reports', path: '/dashboard/drafter/reports', icon: '📄' },
        { name: 'Templates', path: '/dashboard/drafter/templates', icon: '📝' }
      ],
      klien: [
        { name: 'Dashboard', path: '/dashboard/client', icon: '🏠' },
        { name: 'My Projects', path: '/dashboard/client/projects', icon: '🏗️' },
        { name: 'Documents', path: '/dashboard/client/documents', icon: '📁' },
        { name: 'Approvals', path: '/dashboard/client/approvals', icon: '✅' }
      ]
    };
    
    return items[currentUser?.role] || [];
  };

  // Get user role display name
  const getRoleDisplayName = (role) => {
    const roleNames = {
      superadmin: 'Superadmin',
      head_consultant: 'Head Consultant',
      project_lead: 'Project Lead',
      admin_lead: 'Admin Lead',
      inspektor: 'Inspector',
      drafter: 'Drafter',
      klien: 'Client'
    };
    return roleNames[role] || role;
  };

  return (
    <Flex h="100vh" direction="column">
      {/* Mobile Navigation */}
      {isMobile && (
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Flex
            as="nav"
            align="center"
            justify="space-between"
            px={4}
            py={3}
            bg="white"
            borderBottom="1px"
            borderColor="gray.200"
            boxShadow="sm"
          >
            <IconButton
              icon={<HamburgerIcon />}
              onClick={onOpen}
              aria-label="Open menu"
              variant="outline"
              colorScheme="blue"
            />
            
            <Heading size="md" color="blue.600">
              SLF One
            </Heading>
            
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<BellIcon />}
                aria-label="Notifications"
                variant="outline"
                colorScheme="blue"
                position="relative"
              >
                {unreadCount > 0 && (
                  <Badge
                    position="absolute"
                    top="-1"
                    right="-1"
                    borderRadius="full"
                    colorScheme="red"
                    fontSize="0.6em"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => router.push('/dashboard/notifications')}>
                  View All Notifications
                </MenuItem>
                <MenuDivider />
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </motion.div>
      )}

      {/* Mobile Sidebar */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>SLF One Manager</DrawerHeader>
          <DrawerBody>
            <Flex direction="column" gap={4}>
              {getSidebarItems().map((item) => (
                <motion.div
                  key={item.path}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Box
                    as="button"
                    p={3}
                    borderRadius="md"
                    bg={router.pathname === item.path ? 'blue.500' : 'transparent'}
                    color={router.pathname === item.path ? 'white' : 'inherit'}
                    onClick={() => {
                      router.push(item.path);
                      onClose();
                    }}
                    textAlign="left"
                    width="100%"
                    border="1px solid"
                    borderColor={router.pathname === item.path ? 'blue.500' : 'gray.200'}
                  >
                    <HStack spacing={3}>
                      <Text fontSize="xl">{item.icon}</Text>
                      <Text fontWeight="medium">{item.name}</Text>
                    </HStack>
                  </Box>
                </motion.div>
              ))}
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Desktop Sidebar */}
      {!isMobile && (
        <Box
          w={sidebarWidth}
          bg="gray.800"
          color="white"
          display={{ base: 'none', md: 'block' }}
          p={4}
          overflowY="auto"
        >
          <Text fontSize="xl" fontWeight="bold" mb={6} color="blue.300">
            SLF One Manager
          </Text>
          <Flex direction="column" gap={2}>
            {getSidebarItems().map((item) => (
              <motion.div
                key={item.path}
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <Box
                  as="button"
                  p={3}
                  borderRadius="md"
                  bg={router.pathname === item.path ? 'blue.600' : 'transparent'}
                  _hover={{ bg: 'gray.700' }}
                  onClick={() => router.push(item.path)}
                  textAlign="left"
                  width="100%"
                >
                  <HStack spacing={3}>
                    <Text fontSize="xl">{item.icon}</Text>
                    <Text fontSize="sm" fontWeight="medium">{item.name}</Text>
                  </HStack>
                </Box>
              </motion.div>
            ))}
          </Flex>
        </Box>
      )}

      {/* Main Content */}
      <Flex flex={1} direction="column" overflow="hidden">
        {/* Top Navigation (Desktop) */}
        {!isMobile && (
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Flex
              as="nav"
              align="center"
              justify="space-between"
              px={6}
              py={4}
              bg="white"
              borderBottom="1px"
              borderColor="gray.200"
              boxShadow="sm"
            >
              <Text fontSize="xl" fontWeight="bold" color="blue.600">
                SLF One Manager
              </Text>
              
              <HStack spacing={4}>
                <Menu>
                  <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                    <HStack spacing={3}>
                      <Avatar size="sm" name={currentUser?.name} src={currentUser?.avatar} />
                      <VStack
                        display={{ base: 'none', md: 'flex' }}
                        alignItems="flex-start"
                        spacing="1px"
                        ml="2"
                      >
                        <Text fontSize="sm" fontWeight="bold">
                          {currentUser?.name || 'Loading...'}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          {getRoleDisplayName(currentUser?.role)}
                        </Text>
                      </VStack>
                      <Badge colorScheme="green" display={{ base: 'none', md: 'flex' }}>
                        {currentUser?.role || 'guest'}
                      </Badge>
                    </HStack>
                  </MenuButton>
                  <MenuList
                    bg="white"
                    borderColor="gray.200"
                  >
                    <MenuItem as="a" href="/dashboard/profile">
                      Profile
                    </MenuItem>
                    <MenuItem as="a" href="/dashboard/settings">
                      Settings
                    </MenuItem>
                    <MenuDivider />
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                  </MenuList>
                </Menu>
              </HStack>
            </Flex>
          </motion.div>
        )}

        {/* Page Content */}
        <Box flex={1} overflowY="auto" bg="gray.50" p={4}>
          {children}
        </Box>
      </Flex>
    </Flex>
  );
};

export default DashboardLayout;