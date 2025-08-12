// client/src/components/inspections/DynamicChecklistForm.js
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardBody,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  Input,
  Textarea,
  Button,
  VStack,
  HStack,
  useToast,
  Divider,
  FormErrorMessage,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import axios from 'axios';

const DynamicChecklistForm = ({ checklistItem, onSave, defaultSampleNumber = '' }) => {
  const [sampleNumber, setSampleNumber] = useState(defaultSampleNumber);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const toast = useToast();

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Handle response change
  const handleResponseChange = (columnName, value) => {
    setResponses(prev => ({ ...prev, [columnName]: value }));
    
    // Clear error when user starts typing
    if (errors[columnName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[columnName];
        return newErrors;
      });
    }
  };

  // Validate form before submit
  const validateForm = () => {
    const newErrors = {};
    
    // Validate sample number
    if (!sampleNumber.trim()) {
      newErrors.sampleNumber = 'Nomor sampel wajib diisi';
    }
    
    // Validate required columns
    if (checklistItem.column_config) {
      for (const column of checklistItem.column_config) {
        const { name, type, required = false } = column;
        const value = responses[name];
        
        if (required) {
          if (type === 'radio' || type === 'radio_with_text') {
            if (!value || (Array.isArray(value) && !value[0])) {
              newErrors[name] = `${column.label || name} wajib dipilih`;
            }
          } else if (type === 'input_number') {
            if (!value || value === '') {
              newErrors[name] = `${column.label || name} wajib diisi`;
            }
          } else if (type === 'textarea') {
            if (!value || value.trim() === '') {
              newErrors[name] = `${column.label || name} wajib diisi`;
            }
          }
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate form
    if (!validateForm()) {
      toast({
        title: 'Form Tidak Valid',
        description: 'Mohon lengkapi semua field yang wajib diisi',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
      setLoading(false);
      return;
    }

    try {
      // Prepare data for submission
      const responseData = {
        checklist_item_id: checklistItem.id,
        sample_number: sampleNumber,
        response_ responses
      };

      await onSave(responseData);

      toast({
        title: 'Data Tersimpan',
        description: `Respons untuk "${checklistItem.description}" berhasil disimpan`,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });

      // Reset form after successful save
      setSampleNumber(defaultSampleNumber);
      setResponses({});
      setErrors({});

    } catch (error) {
      console.error('Save checklist response error:', error);
      toast({
        title: 'Gagal Menyimpan',
        description: error.response?.data?.error || 'Terjadi kesalahan saat menyimpan data',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    } finally {
      setLoading(false);
    }
  };

  // Render column based on configuration
  const renderColumn = (column) => {
    const { name, type, options = [], label, text_label, unit = '', required = false } = column;
    const value = responses[name] ?? '';

    // Wrapper for each column with animation
    const ColumnWrapper = ({ children }) => (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ width: '100%' }}
      >
        {children}
      </motion.div>
    );

    switch (type) {
      case 'radio':
        return (
          <ColumnWrapper key={name}>
            <FormControl isRequired={required} isInvalid={!!errors[name]}>
              <FormLabel fontSize="sm" fontWeight="medium">{label || name}</FormLabel>
              <RadioGroup onChange={(val) => handleResponseChange(name, val)} value={value}>
                <Stack direction="row" flexWrap="wrap">
                  {options.map((option) => (
                    <Radio key={option} value={option} size="sm" mr={4}>
                      {option}
                    </Radio>
                  ))}
                </Stack>
              </RadioGroup>
              <FormErrorMessage>{errors[name]}</FormErrorMessage>
            </FormControl>
          </ColumnWrapper>
        );
      
      case 'radio_with_text':
        // This is more complex: radio + textarea if 'Tidak Sesuai' is selected
        const [radioVal, textVal = ''] = Array.isArray(value) ? value : [value, ''];
        return (
          <ColumnWrapper key={name}>
            <FormControl isRequired={required} isInvalid={!!errors[name]}>
              <FormLabel fontSize="sm" fontWeight="medium">{label || name}</FormLabel>
              <RadioGroup onChange={(val) => handleResponseChange(name, [val, textVal])} value={radioVal}>
                <Stack direction="row" flexWrap="wrap">
                  {options.map((option) => (
                    <Radio key={option} value={option} size="sm" mr={4}>
                      {option}
                    </Radio>
                  ))}
                </Stack>
              </RadioGroup>
              <FormErrorMessage>{errors[name]}</FormErrorMessage>
            </FormControl>
            
            {radioVal === 'Tidak Sesuai' && (
              <FormControl mt={3} isRequired={required} isInvalid={!!errors[`${name}_text`]}>
                <FormLabel fontSize="sm">{text_label || 'Keterangan'}</FormLabel>
                <Textarea
                  size="sm"
                  value={textVal}
                  onChange={(e) => handleResponseChange(name, [radioVal, e.target.value])}
                  placeholder={text_label || 'Masukkan keterangan...'}
                  minHeight="80px"
                />
                <FormErrorMessage>{errors[`${name}_text`] || errors[name]}</FormErrorMessage>
              </FormControl>
            )}
          </ColumnWrapper>
        );
      
      case 'input_number':
        return (
          <ColumnWrapper key={name}>
            <FormControl isRequired={required} isInvalid={!!errors[name]}>
              <FormLabel fontSize="sm" fontWeight="medium">{label || name} {unit ? `(${unit})` : ''}</FormLabel>
              <Input
                size="sm"
                type="number"
                value={value}
                onChange={(e) => handleResponseChange(name, e.target.value)}
                placeholder={`Masukkan nilai ${unit ? `(${unit})` : ''}`}
                isDisabled={loading}
              />
              <FormErrorMessage>{errors[name]}</FormErrorMessage>
            </FormControl>
          </ColumnWrapper>
        );
      
      case 'textarea':
        return (
          <ColumnWrapper key={name}>
            <FormControl isRequired={required} isInvalid={!!errors[name]}>
              <FormLabel fontSize="sm" fontWeight="medium">{label || name}</FormLabel>
              <Textarea
                size="sm"
                value={value}
                onChange={(e) => handleResponseChange(name, e.target.value)}
                placeholder={label || `Masukkan ${name}...`}
                minHeight="100px"
                isDisabled={loading}
              />
              <FormErrorMessage>{errors[name]}</FormErrorMessage>
            </FormControl>
          </ColumnWrapper>
        );
      
      default:
        // Fallback for unknown types
        return (
          <ColumnWrapper key={name}>
            <FormControl isRequired={required} isInvalid={!!errors[name]}>
              <FormLabel fontSize="sm" fontWeight="medium">{label || name} (Tipe: {type})</FormLabel>
              <Input
                size="sm"
                value={value}
                onChange={(e) => handleResponseChange(name, e.target.value)}
                placeholder={`Input untuk ${type}...`}
                isDisabled={loading}
              />
              <FormErrorMessage>{errors[name]}</FormErrorMessage>
            </FormControl>
          </ColumnWrapper>
        );
    }
  };

  if (!checklistItem) {
    return (
      <Card>
        <CardBody>
          <Skeleton height="30px" width="200px" mb={4} />
          <VStack spacing={3}>
            <Skeleton height="20px" width="100%" />
            <Skeleton height="20px" width="100%" />
            <Skeleton height="40px" width="100%" />
          </VStack>
        </CardBody>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        as={motion.div}
        whileHover={{ boxShadow: 'lg' }}
        transition={{ duration: 0.2 }}
        variant="outline"
        borderRadius="lg"
      >
        <CardBody>
          <VStack spacing={4} align="stretch">
            {/* Header Item */}
            <Box>
              <Heading size="sm" color="blue.600">
                {checklistItem.code}
              </Heading>
              <Text fontSize="md" fontWeight="semibold" mt={1}>
                {checklistItem.description}
              </Text>
              <Text fontSize="xs" color="gray.500">
                Kategori: {checklistItem.category}
              </Text>
            </Box>

            <Divider />

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <VStack spacing={5} align="stretch">
                {/* Input Sample Number */}
                <FormControl isRequired isInvalid={!!errors.sampleNumber}>
                  <FormLabel fontSize="sm" fontWeight="medium">Nomor Sampel</FormLabel>
                  <Input
                    size="sm"
                    value={sampleNumber}
                    onChange={(e) => setSampleNumber(e.target.value)}
                    placeholder="e.g., ITEM-001, LANTAI1-RUANG01"
                    isDisabled={loading}
                  />
                  <FormErrorMessage>{errors.sampleNumber}</FormErrorMessage>
                </FormControl>

                {/* Render kolom-kolom dinamis */}
                {checklistItem.column_config && checklistItem.column_config.length > 0 ? (
                  <VStack spacing={4} align="stretch">
                    {checklistItem.column_config.map((column) => renderColumn(column))}
                  </VStack>
                ) : (
                  <Alert status="warning">
                    <AlertIcon />
                    <AlertTitle>Konfigurasi Kolom Kosong</AlertTitle>
                    <AlertDescription>
                      Item checklist ini tidak memiliki konfigurasi kolom. Silakan hubungi administrator.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Tombol Submit */}
                <HStack justifyContent="flex-end" pt={2}>
                  <Button
                    type="submit"
                    colorScheme="blue"
                    isLoading={loading}
                    loadingText="Menyimpan..."
                    isDisabled={!sampleNumber.trim() || loading}
                    size="lg"
                  >
                    Simpan Respons
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

export default DynamicChecklistForm;