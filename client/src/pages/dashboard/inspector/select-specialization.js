// client/src/pages/dashboard/inspector/select-specialization.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Card,
  CardBody,
  Select,
  Button,
  VStack,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import { useRouter } from 'next/router';
import axios from 'axios';

const SelectSpecialization = () => {
  const [user, setUser] = useState({});
  const [specialization, setSpecialization] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!token) {
          router.push('/login');
          return;
        }

        const res = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data.user);
        
        // Jika sudah ada spesialisasi, redirect ke dashboard
        if (res.data.user.inspector_specialization) {
          router.push(`/dashboard/inspector/${res.data.user.inspector_specialization}`);
        }
      } catch (error) {
        console.error('Fetch user error:', error);
        toast({
          title: 'Error',
          description: 'Failed to load user data',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right'
        });
        router.push('/login');
      }
    };

    fetchUserData();
  }, [token, router, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.put('/api/users/me/specialization', {
        inspector_specialization: specialization
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({
        title: 'Specialization Selected',
        description: 'Your specialization has been updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });

      // Redirect ke dashboard spesialisasi
      router.push(`/dashboard/inspector/${specialization}`);

    } catch (error) {
      console.error('Update specialization error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update specialization',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    } finally {
      setLoading(false);
    }
  };

  const specializationOptions = [
    { value: 'administrative', label: 'Dokumen Administratif' },
    { value: 'tata_bangunan', label: 'Tata Bangunan' },
    { value: 'struktur', label: 'Struktur Bangunan' },
    { value: 'utilitas', label: 'Utilitas (Listrik, Air, Gas)' },
    { value: 'keselamatan', label: 'Keselamatan Kebakaran' },
    { value: 'aksesibilitas', label: 'Aksesibilitas Disabilitas' },
    { value: 'kenyamanan', label: 'Kenyamanan Lingkungan' },
    { value: 'sanitasi', label: 'Sanitasi & Tata Air' }
  ];

  return (
    <DashboardLayout user={user}>
      <Box p={6}>
        <Card maxW="500px" mx="auto">
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Heading textAlign="center" color="red.600">
                Pilih Spesialisasi Anda
              </Heading>
              
              <Text textAlign="center" color="gray.600">
                Sebagai Inspector, Anda perlu memilih bidang keahlian spesifik 
                untuk fokus pada jenis pemeriksaan yang sesuai.
              </Text>

              <Alert status="info">
                <AlertIcon />
                <Box flex="1">
                  <AlertTitle>Perhatian!</AlertTitle>
                  <AlertDescription>
                    Spesialisasi yang Anda pilih akan menentukan jenis checklist 
                    dan item inspeksi yang akan ditampilkan di dashboard Anda.
                  </AlertDescription>
                </Box>
              </Alert>

              <form onSubmit={handleSubmit}>
                <VStack spacing={4} align="stretch">
                  <Select
                    placeholder="Pilih spesialisasi inspeksi"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    size="lg"
                  >
                    {specializationOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>

                  <Button
                    type="submit"
                    colorScheme="red"
                    size="lg"
                    isLoading={loading}
                    loadingText="Menyimpan..."
                    isDisabled={!specialization}
                  >
                    Simpan Spesialisasi
                  </Button>
                </VStack>
              </form>
            </VStack>
          </CardBody>
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default SelectSpecialization;