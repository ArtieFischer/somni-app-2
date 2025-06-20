import React from 'react';
import {
  Modal as GluestackModal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from '@gluestack-ui/themed';
import { CloseIcon } from '@gluestack-ui/themed';
import { Heading } from '@gluestack-ui/themed';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
}) => {
  return (
    <GluestackModal isOpen={isOpen} onClose={onClose} size={size}>
      <ModalBackdrop onPress={closeOnOverlayClick ? onClose : undefined} />
      <ModalContent>
        {(title || showCloseButton) && (
          <ModalHeader>
            {title && <Heading size="lg">{title}</Heading>}
            {showCloseButton && (
              <ModalCloseButton onPress={onClose}>
                <CloseIcon />
              </ModalCloseButton>
            )}
          </ModalHeader>
        )}
        <ModalBody>{children}</ModalBody>
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContent>
    </GluestackModal>
  );
};