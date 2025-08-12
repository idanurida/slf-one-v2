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
  Badge
} from '@chakra-ui/react';
import { HamburgerIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';
import axios from 'axios';
import NotificationCenter from './NotificationCenter';

const DashboardLayout = ({ children, user }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentUser, setCurrentUser] = useState(user || {});
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const toast = useToast();
  const router = useRouter();

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
        { name: 'Dashboard', path: '/dashboard/superadmin' },
        { name: 'Users', path: '/dashboard/superadmin/users' },
        { name: 'Projects', path: '/dashboard/superadmin/projects' },
        { name: 'Regulations', path: '/dashboard/superadmin/regulations' },
        { name: 'Settings', path: '/dashboard/superadmin/settings' }
      ],
      head_consultant: [
        { name: 'Dashboard', path: '/dashboard/head-consultant' },
        { name: 'Projects', path: '/dashboard/head-consultant/projects' },
        { name: 'Approvals', path: '/dashboard/head-consultant/approvals' },
        { name: 'Reports', path: '/dashboard/head-consultant/reports' }
      ],
      project_lead: [
        { name: 'Dashboard', path: '/dashboard/project-lead' },
        { name: 'My Projects', path: '/dashboard/project-lead/projects' },
        { name: 'Inspections', path: '/dashboard/project-lead/inspections' },
        { name: 'Reports', path: '/dashboard/project-lead/reports' }
      ],
      admin_lead: [
        { name: 'Dashboard', path: '/dashboard/admin-lead' },
        { name: 'Projects', path: '/dashboard/admin-lead/projects' },
        { name: 'Payments', path: '/dashboard/admin-lead/payments' },
        { name: 'Documents', path: '/dashboard/admin-lead/documents' }
      ],
      inspektor: [
        { name: 'Dashboard', path: '/dashboard/inspector' },
        { name: 'My Inspections', path: '/dashboard/inspector/inspections' },
        { name: 'Checklists', path: '/dashboard/inspector/checklists' },
        { name: 'Photos', path: '/dashboard/inspector/photos' }
      ],
      drafter: [
        { name: 'Dashboard', path: '/dashboard/drafter' },
        { name: 'Reports', path: '/dashboard/drafter/reports' },
        { name: 'Templates', path: '/dashboard/drafter/templates' }
      ],
      klien: [
        { name: 'Dashboard', path: '/dashboard/client' },
        { name: 'My Projects', path: '/dashboard/client/projects' },
        { name: 'Documents', path: '/dashboard/client/documents' },
        { name: 'Approvals', path: '/dashboard/client/approvals' }
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
      {/* Mobile Sidebar */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>SLF One Manager</DrawerHeader>
          <DrawerBody>
            <Flex direction="column" gap={4}>
              {getSidebarItems().map((item) => (
                <Box
                  key={item.path}
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
                >
                  {item.name}
                </Box>
              ))}
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Desktop Sidebar */}
      <Box
        w={{ base: 0, md: '250px' }}
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
            <Box
              key={item.path}
              as="button"
              p={3}
              borderRadius="md"
              bg={router.pathname === item.path ? 'blue.600' : 'transparent'}
              _hover={{ bg: 'gray.700' }}
              onClick={() => router.push(item.path)}
              textAlign="left"
              width="100%"
            >
              {item.name}
            </Box>
          ))}
        </Flex>
      </Box>

      {/* Main Content */}
      <Flex flex={1} direction="column" overflow="hidden">
        {/* Top Navigation */}
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
          <IconButton
            display={{ base: 'flex', md: 'none' }}
            onClick={onOpen}
            icon={<HamburgerIcon />}
            aria-label="Open menu"
            variant="outline"
            colorScheme="blue"
          />
          
          <Text fontSize="xl" fontWeight="bold" color="blue.600">
            SLF One Manager
          </Text>
          
          <HStack spacing={4}>
            <NotificationCenter 
              notifications={notifications} 
              unreadCount={unreadCount}
              onNotificationRead={(count) => setUnreadCount(count)}
            />
            
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
                <MenuItem onClick={() => router.push('/dashboard/profile')}>
                  Profile
                </MenuItem>
                <MenuItem onClick={() => router.push('/dashboard/settings')}>
                  Settings
                </MenuItem>
                <MenuDivider />
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>

        {/* Page Content */}
        <Box flex={1} overflowY="auto" bg="gray.50">
          {children}
        </Box>
      </Flex>
    </Flex>
  );
};

export default DashboardLayout;