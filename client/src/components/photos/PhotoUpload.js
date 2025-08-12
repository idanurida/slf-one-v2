// client/src/components/photos/PhotoUpload.js
import React, { useRef, useState } from 'react';
import {
  Box,
  Button,
  Input,
  Image,
  VStack,
  Text,
  useToast,
  Card,
  CardBody,
  HStack,
  IconButton,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  FormControl,
  FormLabel,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { AttachmentIcon, CloseIcon, CameraIcon } from '@chakra-ui/icons';
import axios from 'axios';

const PhotoUpload = ({ onUpload, inspectionId }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [photoData, setPhotoData] = useState({
    caption: '',
    floor_info: '',
    latitude: '',
    longitude: ''
  });
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const toast = useToast();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file
      if (!file.type.startsWith('image/')) {
        setError('File harus berupa gambar (JPEG, PNG, GIF, dll)');
        toast({
          title: 'File tidak valid',
          description: 'File harus berupa gambar',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right'
        });
        return;
      }
      
      if (file.size > 20 * 1024 * 1024) { // 20MB
        setError('Ukuran file terlalu besar (maksimal 20MB)');
        toast({
          title: 'File terlalu besar',
          description: 'Ukuran file maksimal 20MB',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right'
        });
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: 'Tidak ada file',
        description: 'Silakan pilih foto terlebih dahulu',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
      return;
    }

    if (!inspectionId) {
      toast({
        title: 'ID Inspeksi tidak ditemukan',
        description: 'Tidak dapat mengunggah foto tanpa ID inspeksi',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
      return;
    }

    setUploading(true);
    setProgress(0);
    setError('');

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append('photo', selectedFile);
      formData.append('caption', photoData.caption || '');
      formData.append('floor_info', photoData.floor_info || '');
      formData.append('latitude', photoData.latitude || '');
      formData.append('longitude', photoData.longitude || '');

      // Upload with progress tracking
      const response = await axios.post(
        `/api/photos/inspections/${inspectionId}/upload`,
        formData,
        {
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}` 
          },
          onUploadProgress: (progressEvent) => {
            const { loaded, total } = progressEvent;
            const percentage = Math.round((loaded / total) * 100);
            setProgress(percentage);
          }
        }
      );

      toast({
        title: 'Foto berhasil diunggah',
        description: response.data.message,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });

      // Callback to parent
      if (onUpload) {
        onUpload(response.data.photo);
      }

      // Reset form
      setSelectedFile(null);
      setPreviewUrl('');
      setPhotoData({
        caption: '',
        floor_info: '',
        latitude: '',
        longitude: ''
      });
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (cameraInputRef.current) {
        cameraInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Upload error:', error);
      setError(error.response?.data?.error || 'Gagal mengunggah foto');
      toast({
        title: 'Error mengunggah foto',
        description: error.response?.data?.error || 'Terjadi kesalahan saat mengunggah foto',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setError('');
    setPhotoData({
      caption: '',
      floor_info: '',
      latitude: '',
      longitude: ''
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  };

  const handlePhotoDataChange = (field, value) => {
    setPhotoData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Heading size="md" color="blue.600">
              Upload Foto Dokumentasi
            </Heading>
            
            <Text fontSize="sm" color="gray.600">
              Unggah foto dengan geotagging untuk dokumentasi inspeksi
            </Text>

            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              display="none"
            />
            
            <Input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              display="none"
            />

            <HStack spacing={4}>
              <Button
                onClick={() => fileInputRef.current?.click()}
                leftIcon={<AttachmentIcon />}
                colorScheme="blue"
                variant="outline"
                isDisabled={uploading}
              >
                Pilih Foto
              </Button>
              
              <Button
                onClick={() => cameraInputRef.current?.click()}
                leftIcon={<CameraIcon />}
                colorScheme="green"
                variant="outline"
                isDisabled={uploading}
              >
                Ambil Foto
              </Button>
            </HStack>
            
            {error && (
              <Alert status="error">
                <AlertIcon />
                <AlertTitle mr={2}>Error!</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {previewUrl && (
              <Box position="relative">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  maxH="300px"
                  objectFit="cover"
                  borderRadius="md"
                  border="1px solid"
                  borderColor="gray.200"
                />
                <IconButton
                  icon={<CloseIcon />}
                  aria-label="Remove photo"
                  size="sm"
                  colorScheme="red"
                  position="absolute"
                  top={2}
                  right={2}
                  onClick={handleRemoveFile}
                  isDisabled={uploading}
                />
              </Box>
            )}
            
            {selectedFile && (
              <VStack spacing={3} align="stretch">
                <FormControl>
                  <FormLabel>Keterangan Foto</FormLabel>
                  <Input
                    value={photoData.caption}
                    onChange={(e) => handlePhotoDataChange('caption', e.target.value)}
                    placeholder="e.g., Tampak depan bangunan, Ruang kontrol lift"
                    isDisabled={uploading}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Lantai</FormLabel>
                  <Input
                    value={photoData.floor_info}
                    onChange={(e) => handlePhotoDataChange('floor_info', e.target.value)}
                    placeholder="e.g., Lantai 1, Basement, Atap"
                    isDisabled={uploading}
                  />
                </FormControl>
                
                <HStack spacing={4}>
                  <FormControl>
                    <FormLabel>Latitude</FormLabel>
                    <NumberInput 
                      value={photoData.latitude}
                      onChange={(value) => handlePhotoDataChange('latitude', value)}
                      precision={6}
                      step={0.000001}
                      isDisabled={uploading}
                    >
                      <NumberInputField placeholder="e.g., -6.123456" />
                    </NumberInput>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Longitude</FormLabel>
                    <NumberInput 
                      value={photoData.longitude}
                      onChange={(value) => handlePhotoDataChange('longitude', value)}
                      precision={6}
                      step={0.000001}
                      isDisabled={uploading}
                    >
                      <NumberInputField placeholder="e.g., 106.789012" />
                    </NumberInput>
                  </FormControl>
                </HStack>
              </VStack>
            )}
            
            {uploading && (
              <VStack spacing={3} w="100%">
                <Text fontSize="sm" color="blue.600">Mengunggah...</Text>
                <Progress value={progress} size="sm" colorScheme="blue" w="100%" hasStripe isAnimated />
              </VStack>
            )}
            
            <HStack justifyContent="flex-end">
              <Button
                onClick={handleUpload}
                colorScheme="blue"
                isLoading={uploading}
                loadingText="Mengunggah"
                isDisabled={!selectedFile || uploading}
                size="lg"
              >
                Unggah Foto
              </Button>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default PhotoUpload;