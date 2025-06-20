import React from 'react';
import {
  Checkbox as GluestackCheckbox,
  CheckboxIndicator,
  CheckboxIcon,
  CheckboxLabel,
  CheckboxGroup as GluestackCheckboxGroup,
} from '@gluestack-ui/themed';
import { CheckIcon } from '@gluestack-ui/themed';

export interface CheckboxProps {
  value?: string;
  label?: string;
  isChecked?: boolean;
  onChange?: (checked: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  isDisabled?: boolean;
  isInvalid?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  value,
  label,
  isChecked = false,
  onChange,
  size = 'md',
  isDisabled = false,
  isInvalid = false,
}) => {
  return (
    <GluestackCheckbox
      value={value}
      isChecked={isChecked}
      onChange={onChange}
      size={size}
      isDisabled={isDisabled}
      isInvalid={isInvalid}
    >
      <CheckboxIndicator mr="$2">
        <CheckboxIcon as={CheckIcon} />
      </CheckboxIndicator>
      {label && <CheckboxLabel>{label}</CheckboxLabel>}
    </GluestackCheckbox>
  );
};

export interface CheckboxGroupProps {
  value?: string[];
  onChange?: (values: string[]) => void;
  children: React.ReactNode;
  isDisabled?: boolean;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  value = [],
  onChange,
  children,
  isDisabled = false,
}) => {
  return (
    <GluestackCheckboxGroup
      value={value}
      onChange={onChange}
      isDisabled={isDisabled}
    >
      {children}
    </GluestackCheckboxGroup>
  );
};