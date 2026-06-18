// client/src/components/inspections/PhotoUpload.js
import React, { useRef, useState, useEffect } from 'react';
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
  NumberDecrementStepper,
  Textarea,
  Switch,
  Collapse,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { AttachmentIcon, CloseIcon } from '@chakra-ui/icons';
import axios from 'axios';

const PhotoUpload = ({ inspectionId, onUploadSuccess, defaultFloorInfo = '' }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [useManualLocation, setUseManualLocation] = useState(false);
  const [locationData, setLocationData] = useState({
    caption: '',
    floor_info: defaultFloorInfo,
    room_info: '',
    building_info: '',
    manual_location: '',
    latitude: '',
    longitude: '',
    gps_accuracy: '',
    altitude: '',
    heading: ''
  });
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const toast = useToast();

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Get current location
  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Geolocation tidak didukung',
        description: 'Browser Anda tidak mendukung geolocation',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
      return;
    }

    try {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy, altitude, heading } = position.coords;
          setLocationData(prev => ({
            ...prev,
            latitude: latitude.toFixed(6),
            longitude: longitude.toFixed(6),
            gps_accuracy: accuracy ? accuracy.toFixed(2) : '',
            altitude: altitude ? altitude.toFixed(2) : '',
            heading: heading ? heading.toFixed(2) : ''
          }));
          
          toast({
            title: 'Lokasi ditemukan',
            description: `Koordinat: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            status: 'success',
            duration: 3000,
            isClosable: true,
            position: 'top-right'
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast({
            title: 'Error mendapatkan lokasi',
            description: 'GPS tidak tersedia atau ditolak. Gunakan input manual.',
            status: 'warning',
            duration: 5000,
            isClosable: true,
            position: 'top-right'
          });
          setUseManualLocation(true);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } catch (err) {
      console.error('Get location error:', err);
      toast({
        title: 'Error',
        description: 'Gagal mendapatkan lokasi GPS',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
      setUseManualLocation(true);
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file
      if (!file.type.startsWith('image/')) {
        setError('File harus berupa gambar (JPEG, PNG, GIF)');
        toast({
          title: 'File tidak valid',
          description: 'File harus berupa gambar.',
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
          description: 'Ukuran file maksimal 20MB.',
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
      
      // Auto-get location when file selected
      getCurrentLocation();
    }
  };

  // Handle location data change
  const handleLocationChange = (field, value) => {
    setLocationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: 'Tidak ada file',
        description: 'Silakan pilih foto terlebih dahulu.',
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
        description: 'Tidak dapat mengunggah foto tanpa ID inspeksi.',
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
      formData.append('caption', locationData.caption || '');
      formData.append('floor_info', locationData.floor_info || '');
      formData.append('room_info', locationData.room_info || '');
      formData.append('building_info', locationData.building_info || '');
      formData.append('manual_location', locationData.manual_location || '');
      
      if (!useManualLocation && locationData.latitude && locationData.longitude) {
        formData.append('latitude', locationData.latitude);
        formData.append('longitude', locationData.longitude);
        formData.append('gps_accuracy', locationData.gps_accuracy || '');
        formData.append('altitude', locationData.altitude || '');
        formData.append('heading', locationData.heading || '');
      }

      // Upload with progress tracking
      const response = await axios.post(
        `/api/photos/inspections/${inspectionId}/photos`,
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

      // Callback success
      if (onUploadSuccess) {
        onUploadSuccess(response.data.photo);
      }

      // Reset form
      setSelectedFile(null);
      setPreviewUrl('');
      setProgress(0);
      setLocationData({
        caption: '',
        floor_info: defaultFloorInfo,
        room_info: '',
        building_info: '',
        manual_location: '',
        latitude: '',
        longitude: '',
        gps_accuracy: '',
        altitude: '',
        heading: ''
      });
      setUseManualLocation(false);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.response?.data?.error || 'Gagal mengunggah foto.');
      toast({
        title: 'Error mengunggah foto',
        description: error.response?.data?.error || 'Terjadi kesalahan saat mengunggah foto.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    } finally {
      setUploading(false);
    }
  };

  // Handle remove file
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setError('');
    setLocationData({
      caption: '',
      floor_info: defaultFloorInfo,
      room_info: '',
      building_info: '',
      manual_location: '',
      latitude: '',
      longitude: '',
      gps_accuracy: '',
      altitude: '',
      heading: ''
    });
    setUseManualLocation(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardBody>
          <VStack spacing={6} align="stretch">
            <Box>
              <Heading size="md" color="blue.600">
                Upload Foto Dokumentasi
              </Heading>
              <Text fontSize="sm" color="gray.600">
                Unggah foto dengan geotagging untuk dokumentasi inspeksi
              </Text>
            </Box>

            <Tabs variant="soft-rounded" colorScheme="blue">
              <TabList>
                <Tab>Pilih Foto</Tab>
                <Tab>Lokasi & Metadata</Tab>
              </TabList>
              
              <TabPanels>
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileSelect}
                      display="none"
                    />
                    
                    <Input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="user"
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
                        leftIcon={<Text as="span" fontSize="md">📷</Text>}
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
                    
                    {uploading && (
                      <VStack spacing={3} w="100%">
                        <Text fontSize="sm" color="blue.600">Mengunggah...</Text>
                        <Progress value={progress} size="sm" colorScheme="blue" w="100%" hasStripe isAnimated />
                      </VStack>
                    )}
                  </VStack>
                </TabPanel>
                
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel>Keterangan Foto</FormLabel>
                      <Input
                        value={locationData.caption}
                        onChange={(e) => handleLocationChange('caption', e.target.value)}
                        placeholder="e.g., Tampak depan bangunan, Ruang kontrol lift"
                        isDisabled={uploading}
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Lantai</FormLabel>
                      <Input
                        value={locationData.floor_info}
                        onChange={(e) => handleLocationChange('floor_info', e.target.value)}
                        placeholder="e.g., Lantai 1, Basement, Atap"
                        isDisabled={uploading}
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Ruangan</FormLabel>
                      <Input
                        value={locationData.room_info}
                        onChange={(e) => handleLocationChange('room_info', e.target.value)}
                        placeholder="e.g., Ruang Meeting, Lobby, Ruang Kontrol"
                        isDisabled={uploading}
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Bangunan</FormLabel>
                      <Input
                        value={locationData.building_info}
                        onChange={(e) => handleLocationChange('building_info', e.target.value)}
                        placeholder="e.g., Gedung A, Tower B"
                        isDisabled={uploading}
                      />
                    </FormControl>
                    
                    <FormControl>
                      <HStack>
                        <FormLabel>Gunakan Lokasi Manual</FormLabel>
                        <Switch 
                          isChecked={useManualLocation}
                          onChange={(e) => setUseManualLocation(e.target.checked)}
                          isDisabled={uploading}
                        />
                      </HStack>
                    </FormControl>
                    
                    <Collapse in={useManualLocation} animateOpacity>
                      <FormControl>
                        <FormLabel>Deskripsi Lokasi Manual</FormLabel>
                        <Textarea
                          value={locationData.manual_location}
                          onChange={(e) => handleLocationChange('manual_location', e.target.value)}
                          placeholder="Deskripsikan lokasi foto secara manual jika GPS tidak tersedia..."
                          minHeight="100px"
                          isDisabled={uploading}
                        />
                      </FormControl>
                    </Collapse>
                    
                    {!useManualLocation && (
                      <VStack spacing={3} align="stretch">
                        <FormControl>
                          <FormLabel>Koordinat GPS</FormLabel>
                          <HStack>
                            <Input
                              value={locationData.latitude}
                              onChange={(e) => handleLocationChange('latitude', e.target.value)}
                              placeholder="Latitude"
                              isDisabled={uploading}
                            />
                            <Input
                              value={locationData.longitude}
                              onChange={(e) => handleLocationChange('longitude', e.target.value)}
                              placeholder="Longitude"
                              isDisabled={uploading}
                            />
                          </HStack>
                        </FormControl>
                        
                        <HStack spacing={4}>
                          <FormControl>
                            <FormLabel>Akurasi GPS (meter)</FormLabel>
                            <NumberInput 
                              value={locationData.gps_accuracy}
                              onChange={(val) => handleLocationChange('gps_accuracy', val)}
                              isDisabled={uploading}
                            >
                              <NumberInputField placeholder="0.00" />
                            </NumberInput>
                          </FormControl>
                          
                          <FormControl>
                            <FormLabel>Ketinggian (meter)</FormLabel>
                            <NumberInput 
                              value={locationData.altitude}
                              onChange={(val) => handleLocationChange('altitude', val)}
                              isDisabled={uploading}
                            >
                              <NumberInputField placeholder="0.00" />
                            </NumberInput>
                          </FormControl>
                          
                          <FormControl>
                            <FormLabel>Arah Kamera (°)</FormLabel>
                            <NumberInput 
                              value={locationData.heading}
                              onChange={(val) => handleLocationChange('heading', val)}
                              min={0}
                              max={360}
                              isDisabled={uploading}
                            >
                              <NumberInputField placeholder="0.00" />
                            </NumberInput>
                          </FormControl>
                        </HStack>
                      </VStack>
                    )}
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
            
            <HStack justifyContent="flex-end" pt={2}>
              <Button
                onClick={handleUpload}
                colorScheme="blue"
                isLoading={uploading}
                loadingText="Mengunggah..."
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