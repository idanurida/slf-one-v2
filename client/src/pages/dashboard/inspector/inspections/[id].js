// client/src/pages/dashboard/inspector/inspections/[id].js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Card,
  CardBody,
  Button,
  VStack,
  HStack,
  useToast,
  Skeleton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useRouter } from 'next/router';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import DynamicChecklistForm from '../../../../components/inspections/DynamicChecklistForm';
import PhotoUpload from '../../../../components/inspections/PhotoUpload';
import PhotoGallery from '../../../../components/inspections/PhotoGallery';

const InspectionDetail = () => {
  const [user, setUser] = useState({});
  const [inspection, setInspection] = useState(null);
  const [checklistItems, setChecklistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const toast = useToast();
  const router = useRouter();
  const { id } = router.query;

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    const fetchInspectionData = async () => {
      if (!id || !token) return;

      try {
        setLoading(true);

        // Fetch user data
        const userRes = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(userRes.data.user);

        // Fetch inspection data
        const inspectionRes = await axios.get(`/api/inspections/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setInspection(inspectionRes.data);

        // Fetch checklist items (hanya jika status in_progress)
        if (inspectionRes.data.status === 'in_progress') {
          const checklistRes = await axios.get(`/api/inspections/${id}/checklist`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setChecklistItems(checklistRes.data);
        }

      } catch (error) {
        console.error('Inspection detail error:', error);
        toast({
          title: 'Error',
          description: error.response?.data?.error || 'Failed to load inspection data',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right'
        });
        router.push('/dashboard/inspector');
      } finally {
        setLoading(false);
      }
    };

    fetchInspectionData();
  }, [id, token, router, toast]);

  const handleCompleteInspection = async () => {
    try {
      const response = await axios.put(`/api/inspections/${id}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({
        title: 'Inspection Completed',
        description: 'Inspection has been completed successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });

      setInspection(response.data);
      router.push('/dashboard/inspector');

    } catch (error) {
      console.error('Complete inspection error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to complete inspection',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    }
  };

  const handleSaveChecklistResponse = async (responseData) => {
    try {
      const response = await axios.post(`/api/inspections/${id}/checklist-responses`, responseData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({
        title: 'Checklist Response Saved',
        description: 'Checklist response has been saved successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });

      return response.data;
    } catch (error) {
      console.error('Save checklist response error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to save checklist response',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
      throw error;
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
          <Skeleton height="40px" width="250px" mb={6} />
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
            {[1, 2, 3].map((i) => (
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

  if (!inspection) {
    return (
      <DashboardLayout user={user}>
        <Box p={6}>
          <Alert status="error">
            <AlertIcon />
            <AlertTitle>Inspection Not Found</AlertTitle>
            <AlertDescription>
              The inspection you're looking for doesn't exist or you don't have access to it.
            </AlertDescription>
          </Alert>
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
            <HStack justify="space-between">
              <Box>
                <Heading mb={2} color="red.600">
                  Inspection Detail
                </Heading>
                <Text fontSize="lg" color="gray.600">
                  ID: {inspection.id} | Status: {inspection.status.replace(/_/g, ' ')}
                </Text>
              </Box>
              
              {inspection.status === 'in_progress' && (
                <Button
                  colorScheme="green"
                  onClick={handleCompleteInspection}
                  size="lg"
                >
                  Complete Inspection
                </Button>
              )}
            </HStack>

            <Divider />

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Project Name</StatLabel>
                    <StatNumber color="blue.500">{inspection.project?.name}</StatNumber>
                  </Stat>
                </CardBody>
              </Card>
              
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Scheduled Date</StatLabel>
                    <StatNumber color="orange.500">
                      {inspection.scheduled_date 
                        ? new Date(inspection.scheduled_date).toLocaleDateString('id-ID')
                        : '-'}
                    </StatNumber>
                  </Stat>
                </CardBody>
              </Card>
              
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Status</StatLabel>
                    <StatNumber>
                      <Badge colorScheme={statusColors[inspection.status] || 'gray'}>
                        {inspection.status.replace(/_/g, ' ')}
                      </Badge>
                    </StatNumber>
                  </Stat>
                </CardBody>
              </Card>
            </SimpleGrid>

            {inspection.status !== 'in_progress' && (
              <Alert status="warning">
                <AlertIcon />
                <AlertTitle>Inspection Not Active</AlertTitle>
                <AlertDescription>
                  Checklist and photo upload are only available when inspection is in progress.
                  Current status: {inspection.status.replace(/_/g, ' ')}
                </AlertDescription>
              </Alert>
            )}

            {inspection.status === 'in_progress' && (
              <Tabs variant="soft-rounded" colorScheme="red" onChange={setActiveTab}>
                <TabList>
                  <Tab>Checklist Items ({checklistItems.length})</Tab>
                  <Tab>Photo Upload</Tab>
                  <Tab>Photo Gallery</Tab>
                </TabList>
                
                <TabPanels>
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      <Heading size="md" color="gray.700">
                        Checklist Items
                      </Heading>
                      
                      {checklistItems.length > 0 ? (
                        <VStack spacing={4} align="stretch">
                          {checklistItems.map((item) => (
                            <DynamicChecklistForm
                              key={item.id}
                              checklistItem={item}
                              onSave={handleSaveChecklistResponse}
                              defaultSampleNumber={`ITEM-${item.code}-${Date.now()}`}
                            />
                          ))}
                        </VStack>
                      ) : (
                        <Alert status="info">
                          <AlertIcon />
                          <AlertTitle>No Checklist Items</AlertTitle>
                          <AlertDescription>
                            No checklist items found for this inspection.
                          </AlertDescription>
                        </Alert>
                      )}
                    </VStack>
                  </TabPanel>
                  
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      <Heading size="md" color="gray.700">
                        Photo Upload
                      </Heading>
                      
                      <PhotoUpload
                        inspectionId={inspection.id}
                        onUpload={async (photoData) => {
                          try {
                            const formData = new FormData();
                            formData.append('photo', photoData.photo);
                            formData.append('caption', photoData.caption || '');
                            formData.append('floor_info', photoData.floor_info || '');
                            formData.append('room_info', photoData.room_info || '');
                            formData.append('building_info', photoData.building_info || '');
                            formData.append('latitude', photoData.latitude || '');
                            formData.append('longitude', photoData.longitude || '');
                            formData.append('altitude', photoData.altitude || '');
                            formData.append('gps_accuracy', photoData.gps_accuracy || '');
                            formData.append('heading', photoData.heading || '');
                            formData.append('manual_location', photoData.manual_location || '');
                            
                            await axios.post(`/api/inspections/${inspection.id}/photos`, formData, {
                              headers: { 
                                'Content-Type': 'multipart/form-data',
                                Authorization: `Bearer ${token}` 
                              }
                            });
                            
                            toast({
                              title: 'Photo Uploaded',
                              description: 'Photo has been uploaded successfully',
                              status: 'success',
                              duration: 3000,
                              isClosable: true,
                              position: 'top-right'
                            });
                          } catch (error) {
                            console.error('Upload photo error:', error);
                            toast({
                              title: 'Error',
                              description: error.response?.data?.error || 'Failed to upload photo',
                              status: 'error',
                              duration: 5000,
                              isClosable: true,
                              position: 'top-right'
                            });
                            throw error;
                          }
                        }}
                      />
                    </VStack>
                  </TabPanel>
                  
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      <Heading size="md" color="gray.700">
                        Photo Gallery
                      </Heading>
                      
                      <PhotoGallery
                        inspectionId={inspection.id}
                        token={token}
                      />
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            )}
          </VStack>
        </motion.div>
      </Box>
    </DashboardLayout>
  );
};

export default InspectionDetail;