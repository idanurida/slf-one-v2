// client/src/components/checklists/ChecklistSection.js
import React from 'react';
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
  useToast
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import DynamicChecklistForm from './DynamicChecklistForm';
import axios from 'axios';

const ChecklistSection = ({ section, onSave, defaultSampleNumber = '' }) => {
  const toast = useToast();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const handleSaveResponse = async (responseData) => {
    try {
      const response = await axios.post('/api/checklists/responses', responseData, {
        headers: { Authorization: `Bearer ${token}` }
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
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card mb={6}>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <Box>
                <Heading size="md" color="blue.600">
                  {section.title}
                </Heading>
                <Text fontSize="sm" color="gray.500">
                  {section.description}
                </Text>
              </Box>
              
              <Badge colorScheme="purple" fontSize="sm">
                {section.category.replace(/_/g, ' ')}
              </Badge>
            </HStack>
            
            <Divider />
            
            <VStack spacing={6} align="stretch">
              {section.items && section.items.length > 0 ? (
                section.items.map((item) => (
                  <DynamicChecklistForm
                    key={item.id}
                    checklistItem={item}
                    onSave={handleSaveResponse}
                    defaultSampleNumber={defaultSampleNumber}
                  />
                ))
              ) : (
                <Text color="gray.500" textAlign="center" py={4}>
                  Tidak ada item checklist dalam seksi ini
                </Text>
              )}
            </VStack>
          </VStack>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default ChecklistSection;