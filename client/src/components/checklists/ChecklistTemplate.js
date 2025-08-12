// client/src/components/checklists/ChecklistTemplate.js
import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  Badge,
  Divider,
  Button,
  useToast,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import ChecklistSection from './ChecklistSection';
import axios from 'axios';

const ChecklistTemplate = ({ template, onSave, inspectionId }) => {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const handleSaveResponse = async (responseData) => {
    try {
      setLoading(true);
      
      // Add inspection_id to response data
      const completeData = {
        ...responseData,
        inspection_id: inspectionId
      };

      const response = await axios.post('/api/checklists/responses', completeData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update responses state
      setResponses(prev => [...prev, response.data]);

      toast({
        title: 'Berhasil',
        description: 'Respons checklist berhasil disimpan',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });

      if (onSave) {
        onSave(response.data);
      }

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
    } finally {
      setLoading(false);
    }
  };

  if (!template) {
    return (
      <Box p={6}>
        <Skeleton height="40px" width="200px" mb={6} />
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
            <Box>
              <Heading mb={2} color="blue.600">
                {template.title}
              </Heading>
              <Text color="gray.600">
                {template.description}
              </Text>
            </Box>
            
            <Badge colorScheme="blue" fontSize="sm">
              {template.category.replace(/_/g, ' ')}
            </Badge>
          </HStack>
          
          <Divider />
          
          <Alert status="info">
            <AlertIcon />
            <Box flex="1">
              <AlertTitle>Perhatian!</AlertTitle>
              <AlertDescription>
                Silakan isi semua item checklist sesuai dengan kondisi lapangan. 
                Setiap item wajib diisi dengan benar dan lengkap.
              </AlertDescription>
            </Box>
          </Alert>
          
          <VStack spacing={6} align="stretch">
            {template.subsections && template.subsections.length > 0 ? (
              template.subsections.map((section) => (
                <ChecklistSection
                  key={section.id}
                  section={section}
                  onSave={handleSaveResponse}
                  defaultSampleNumber={`SECTION-${section.id}-${Date.now()}`}
                />
              ))
            ) : template.items && template.items.length > 0 ? (
              <ChecklistSection
                section={{
                  id: template.id,
                  title: template.title,
                  description: template.description,
                  category: template.category,
                  items: template.items
                }}
                onSave={handleSaveResponse}
                defaultSampleNumber={`TEMPLATE-${template.id}-${Date.now()}`}
              />
            ) : (
              <Alert status="warning">
                <AlertIcon />
                <AlertTitle>Tidak ada item</AlertTitle>
                <AlertDescription>
                  Template ini tidak memiliki item checklist.
                </AlertDescription>
              </Alert>
            )}
          </VStack>
          
          <HStack justify="flex-end" pt={4}>
            <Button
              colorScheme="green"
              size="lg"
              isLoading={loading}
              loadingText="Menyimpan..."
              isDisabled={responses.length === 0}
            >
              Simpan Semua Respons
            </Button>
          </HStack>
        </VStack>
      </Box>
    </motion.div>
  );
};

export default ChecklistTemplate;