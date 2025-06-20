import React from 'react';
import {
  Modal as GluestackModal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Heading,
  Text,
  VStack,
  HStack,
  Box,
  Icon,
} from '@gluestack-ui/themed';
import { CloseIcon, AlertCircleIcon } from '@gluestack-ui/themed';
import { Button } from '../Button/GluestackButton';
import { darkTheme } from '@somni/theme';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'full';
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}) => {
  return (
    <GluestackModal isOpen={isOpen} onClose={onClose} size={size}>
      <ModalBackdrop />
      <ModalContent>
        {(title || showCloseButton) && (
          <ModalHeader>
            {title && (
              <Heading size="lg" color="$textLight50">
                {title}
              </Heading>
            )}
            {showCloseButton && (
              <ModalCloseButton onPress={onClose}>
                <Icon as={CloseIcon} size="md" color="$textLight400" />
              </ModalCloseButton>
            )}
          </ModalHeader>
        )}
        {children}
      </ModalContent>
    </GluestackModal>
  );
};

// Recording Confirmation Modal Component
export interface RecordingConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  onRecordAgain: () => void;
  recordingDuration: string;
  recordingDate: string;
}

export const RecordingConfirmationModal: React.FC<RecordingConfirmationModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  onRecordAgain,
  recordingDuration,
  recordingDate,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Recording Complete">
      <ModalBody>
        <VStack space="lg">
          <Box
            bg={darkTheme.colors.background.secondary}
            p="$4"
            borderRadius="$lg"
          >
            <VStack space="md">
              <HStack justifyContent="space-between">
                <Text size="sm" color="$textLight400">
                  Duration
                </Text>
                <Text size="sm" color="$textLight200" fontWeight="$medium">
                  {recordingDuration}
                </Text>
              </HStack>
              <HStack justifyContent="space-between">
                <Text size="sm" color="$textLight400">
                  Recorded at
                </Text>
                <Text size="sm" color="$textLight200" fontWeight="$medium">
                  {recordingDate}
                </Text>
              </HStack>
              <HStack justifyContent="space-between">
                <Text size="sm" color="$textLight400">
                  Quality
                </Text>
                <Text size="sm" color="$success500" fontWeight="$medium">
                  High Quality
                </Text>
              </HStack>
            </VStack>
          </Box>

          <Box
            bg="rgba(139, 92, 246, 0.1)"
            p="$3"
            borderRadius="$md"
            borderWidth={1}
            borderColor={darkTheme.colors.primary}
          >
            <HStack space="sm" alignItems="center">
              <Icon as={AlertCircleIcon} size="sm" color="$primary400" />
              <VStack flex={1}>
                <Text size="xs" color="$primary400" fontWeight="$medium">
                  Important Notice
                </Text>
                <Text size="xs" color="$textLight300">
                  Once sent for transcription, this recording cannot be undone or edited.
                </Text>
              </VStack>
            </HStack>
          </Box>

          <Text size="sm" color="$textLight300" textAlign="center">
            Your dream recording will be transcribed using AI and saved to your dream journal.
          </Text>
        </VStack>
      </ModalBody>

      <ModalFooter>
        <VStack space="md" w="$full">
          <HStack space="md">
            <Button
              variant="outline"
              action="secondary"
              onPress={onRecordAgain}
              flex={1}
            >
              Record Again
            </Button>
            <Button
              action="primary"
              onPress={onAccept}
              flex={1}
            >
              Accept & Send
            </Button>
          </HStack>
          <Button
            variant="link"
            onPress={onClose}
            size="sm"
          >
            Cancel
          </Button>
        </VStack>
      </ModalFooter>
    </Modal>
  );
};

export { ModalBody, ModalFooter };