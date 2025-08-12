// client/src/pages/index.js
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Image,
  useBreakpointValue,
  Center
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';

const SplashPage = () => {
  const router = useRouter();
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Center minH="100vh" bg="blue.50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <VStack
          spacing={8}
          textAlign="center"
          color="blue.800"
          maxW={isMobile ? "100%" : "500px"}
          p={6}
          mx={4}
        >
          <motion.div
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.7, type: "spring" }}
          >
            <Image
              src="/logo.png"
              alt="SLF One Manager Logo"
              boxSize={isMobile ? "120px" : "180px"}
              objectFit="contain"
              borderRadius="full"
              border="4px solid"
              borderColor="blue.200"
            />
          </motion.div>
          
          <VStack spacing={4}>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <Heading 
                as="h1" 
                size={isMobile ? "xl" : "2xl"} 
                fontWeight="bold"
                color="blue.600"
              >
                SLF One Manager
              </Heading>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              <Text 
                fontSize={isMobile ? "md" : "lg"} 
                maxW="500px" 
                color="gray.600"
              >
                Sistem Manajemen Digital untuk Penerbitan/Perpanjangan 
                Sertifikat Laik Fungsi (SLF) Berdasarkan Permen PUPR No 27/2018 & No 3/2020
              </Text>
            </motion.p>
          </VStack>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <HStack 
              spacing={4} 
              wrap="wrap" 
              justify="center"
              maxWidth="100%"
            >
              <Button
                colorScheme="blue"
                variant="outline"
                size={isMobile ? "lg" : "xl"}
                onClick={() => router.push('/login')}
                _hover={{ bg: 'blue.100', transform: 'scale(1.05)' }}
                transition="all 0.2s"
                leftIcon={isMobile ? undefined : "🔒"}
                width={isMobile ? "100%" : "auto"}
              >
                {isMobile ? "Login" : "Login to Account"}
              </Button>
              
              <Button
                colorScheme="green"
                variant="solid"
                size={isMobile ? "lg" : "xl"}
                onClick={() => router.push('/register')}
                _hover={{ bg: 'green.600', transform: 'scale(1.05)' }}
                transition="all 0.2s"
                leftIcon={isMobile ? undefined : "📝"}
                width={isMobile ? "100%" : "auto"}
              >
                {isMobile ? "Register" : "Create Account"}
              </Button>
            </HStack>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
          >
            <Text 
              fontSize="sm" 
              opacity={0.8} 
              maxW="400px" 
              color="gray.500"
            >
              © {new Date().getFullYear(2025)} SLF One Manager. Hak Cipta Dilindungi.
            </Text>
          </motion.div>
        </VStack>
      </motion.div>
    </Center>
  );
};

export default SplashPage;