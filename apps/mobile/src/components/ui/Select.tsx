import React from 'react';
import {
  Select as GluestackSelect,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicatorWrapper,
  SelectDragIndicator,
  SelectItem,
} from '@gluestack-ui/themed';
import { ChevronDownIcon } from '@gluestack-ui/themed';

export interface SelectOption {
  label: string;
  value: string;
  isDisabled?: boolean;
}

export interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  options: SelectOption[];
  size?: 'sm' | 'md' | 'lg';
  isDisabled?: boolean;
  isInvalid?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onValueChange,
  placeholder = 'Select option',
  options,
  size = 'md',
  isDisabled = false,
  isInvalid = false,
}) => {
  return (
    <GluestackSelect
      selectedValue={value}
      onValueChange={onValueChange}
      isDisabled={isDisabled}
      isInvalid={isInvalid}
    >
      <SelectTrigger size={size}>
        <SelectInput placeholder={placeholder} />
        <SelectIcon mr="$3">
          <ChevronDownIcon />
        </SelectIcon>
      </SelectTrigger>
      <SelectPortal>
        <SelectBackdrop />
        <SelectContent>
          <SelectDragIndicatorWrapper>
            <SelectDragIndicator />
          </SelectDragIndicatorWrapper>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              label={option.label}
              value={option.value}
              isDisabled={option.isDisabled}
            />
          ))}
        </SelectContent>
      </SelectPortal>
    </GluestackSelect>
  );
};