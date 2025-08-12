// client/src/components/approvals/ApprovalStatus.js
import React from 'react';
import {
  Box,
  Heading,
  Text,
  Card,
  CardBody,
  VStack,
  HStack,
  Badge,
  Divider,
  Skeleton
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

const ApprovalStatus = ({ project, approvals, loading = false }) => {
  const statusColors = {
    pending: 'yellow',
    approved: 'green',
    rejected: 'red'
  };

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString('id-ID') : '-';
  };

  if (loading) {
    return (
      <Card>
        <CardBody>
          <Skeleton height="30px" width="200px" mb={4} />
          <VStack spacing={3} align="stretch">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height="50px" />
            ))}
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
      <Card>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Heading size="md" color="gray.700">
              Approval Status
            </Heading>

            <Divider />

            <VStack spacing={3} align="stretch">
              {/* Project Lead Approval */}
              <Box>
                <HStack justify="space-between">
                  <Text fontWeight="semibold">Project Lead</Text>
                  <Badge colorScheme={statusColors[approvals?.project_lead?.status || 'pending'] || 'gray'}>
                    {approvals?.project_lead?.status?.replace(/_/g, ' ') || 'pending'}
                  </Badge>
                </HStack>
                
                {approvals?.project_lead && (
                  <>
                    <Text fontSize="sm" color="gray.600">
                      Approved by: {approvals.project_lead.approver?.name || '-'}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Date: {formatDate(approvals.project_lead.approved_at || approvals.project_lead.rejected_at)}
                    </Text>
                    {approvals.project_lead.comment && (
                      <Text fontSize="sm">
                        Comment: {approvals.project_lead.comment}
                      </Text>
                    )}
                    {approvals.project_lead.rejection_reason && (
                      <Text fontSize="sm" color="red.600">
                        Rejection Reason: {approvals.project_lead.rejection_reason}
                      </Text>
                    )}
                  </>
                )}
              </Box>

              <Divider />

              {/* Head Consultant Approval */}
              <Box>
                <HStack justify="space-between">
                  <Text fontWeight="semibold">Head Consultant</Text>
                  <Badge colorScheme={statusColors[approvals?.head_consultant?.status || 'pending'] || 'gray'}>
                    {approvals?.head_consultant?.status?.replace(/_/g, ' ') || 'pending'}
                  </Badge>
                </HStack>
                
                {approvals?.head_consultant && (
                  <>
                    <Text fontSize="sm" color="gray.600">
                      Approved by: {approvals.head_consultant.approver?.name || '-'}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Date: {formatDate(approvals.head_consultant.approved_at || approvals.head_consultant.rejected_at)}
                    </Text>
                    {approvals.head_consultant.comment && (
                      <Text fontSize="sm">
                        Comment: {approvals.head_consultant.comment}
                      </Text>
                    )}
                    {approvals.head_consultant.rejection_reason && (
                      <Text fontSize="sm" color="red.600">
                        Rejection Reason: {approvals.head_consultant.rejection_reason}
                      </Text>
                    )}
                  </>
                )}
              </Box>

              <Divider />

              {/* Client Approval */}
              <Box>
                <HStack justify="space-between">
                  <Text fontWeight="semibold">Client</Text>
                  <Badge colorScheme={statusColors[approvals?.klien?.status || 'pending'] || 'gray'}>
                    {approvals?.klien?.status?.replace(/_/g, ' ') || 'pending'}
                  </Badge>
                </HStack>
                
                {approvals?.klien && (
                  <>
                    <Text fontSize="sm" color="gray.600">
                      Approved by: {approvals.klien.approver?.name || '-'}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Date: {formatDate(approvals.klien.approved_at || approvals.klien.rejected_at)}
                    </Text>
                    {approvals.klien.comment && (
                      <Text fontSize="sm">
                        Comment: {approvals.klien.comment}
                      </Text>
                    )}
                    {approvals.klien.rejection_reason && (
                      <Text fontSize="sm" color="red.600">
                        Rejection Reason: {approvals.klien.rejection_reason}
                      </Text>
                    )}
                  </>
                )}
              </Box>
            </VStack>

            <Divider />

            <Box>
              <Text fontSize="sm" color="gray.600">
                <strong>Current Project Status:</strong>{' '}
                <Badge colorScheme="blue">
                  {project?.status?.replace(/_/g, ' ') || 'draft'}
                </Badge>
              </Text>
            </Box>
          </VStack>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default ApprovalStatus;