// client/src/components/approvals/ApprovalForm.js
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardBody,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Textarea,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Badge
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useRouter } from 'next/router';

const ApprovalForm = ({ project, role, user, onApprovalChange }) => {
  const [comment, setComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const handleApprove = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `/api/approvals/projects/${project.id}/approve/${role}`,
        { comment },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast({
        title: 'Project Approved',
        description: response.data.message,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });

      if (onApprovalChange) {
        onApprovalChange(response.data.approval);
      }

      // Redirect ke dashboard
      router.push(`/dashboard/${user.role.replace(/_/g, '-')}`);

    } catch (error) {
      console.error('Approval error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to approve project',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: 'Error',
        description: 'Rejection reason is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `/api/approvals/projects/${project.id}/reject/${role}`,
        { comment, rejection_reason: rejectionReason },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast({
        title: 'Project Rejected',
        description: response.data.message,
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });

      if (onApprovalChange) {
        onApprovalChange(response.data.approval);
      }

      // Redirect ke dashboard
      router.push(`/dashboard/${user.role.replace(/_/g, '-')}`);

    } catch (error) {
      console.error('Rejection error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to reject project',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    } finally {
      setLoading(false);
      setShowRejectionForm(false);
      setRejectionReason('');
    }
  };

  const statusColors = {
    draft: 'gray',
    quotation_sent: 'yellow',
    quotation_accepted: 'orange',
    contract_signed: 'purple',
    spk_issued: 'blue',
    spk_accepted: 'teal',
    inspection_scheduled: 'cyan',
    inspection_in_progress: 'orange',
    inspection_done: 'green',
    report_draft: 'yellow',
    report_reviewed: 'orange',
    report_sent_to_client: 'purple',
    waiting_gov_response: 'pink',
    slf_issued: 'green',
    completed: 'green',
    cancelled: 'red',
    project_lead_approved: 'blue',
    project_lead_rejected: 'red',
    head_consultant_approved: 'purple',
    head_consultant_rejected: 'red',
    client_approved: 'green',
    client_rejected: 'red'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardBody>
          <VStack spacing={6} align="stretch">
            <Box>
              <Heading size="lg" color="blue.600" mb={2}>
                Project Approval - {role.replace(/_/g, ' ')}
              </Heading>
              <Text fontSize="md" color="gray.600">
                Project: {project.name}
              </Text>
              <Text fontSize="sm" color="gray.500">
                Owner: {project.owner_name}
              </Text>
              <Text fontSize="sm" color="gray.500">
                Status: <Badge colorScheme={statusColors[project.status] || 'gray'}>
                  {project.status.replace(/_/g, ' ')}
                </Badge>
              </Text>
            </Box>

            <Divider />

            <Alert status="info">
              <AlertIcon />
              <Box flex="1">
                <AlertTitle>Approval Instructions</AlertTitle>
                <AlertDescription>
                  As a {role.replace(/_/g, ' ')}, please carefully review the project documentation 
                  and provide your approval or rejection with proper justification.
                </AlertDescription>
              </Box>
            </Alert>

            <FormControl>
              <FormLabel>Comment (Optional)</FormLabel>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add any additional comments..."
                minHeight="100px"
                isDisabled={loading}
              />
            </FormControl>

            {!showRejectionForm ? (
              <HStack justifyContent="flex-end" spacing={4}>
                <Button
                  colorScheme="red"
                  onClick={() => setShowRejectionForm(true)}
                  isLoading={loading}
                  loadingText="Rejecting..."
                >
                  Reject Project
                </Button>
                
                <Button
                  colorScheme="green"
                  onClick={handleApprove}
                  isLoading={loading}
                  loadingText="Approving..."
                >
                  Approve Project
                </Button>
              </HStack>
            ) : (
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel>Rejection Reason</FormLabel>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide detailed reason for rejection..."
                    minHeight="100px"
                    isDisabled={loading}
                  />
                </FormControl>

                <HStack justifyContent="flex-end" spacing={4}>
                  <Button
                    variant="outline"
                    onClick={() => setShowRejectionForm(false)}
                    isDisabled={loading}
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    colorScheme="red"
                    onClick={handleReject}
                    isLoading={loading}
                    loadingText="Rejecting..."
                  >
                    Confirm Rejection
                  </Button>
                </HStack>
              </VStack>
            )}
          </VStack>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default ApprovalForm;