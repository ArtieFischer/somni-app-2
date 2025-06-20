import React from 'react';
import {
  Radio as GluestackRadio,
  RadioGroup as GluestackRadioGroup,
  RadioIndicator,
  RadioIcon,
  RadioLabel,
  VStack,
} from '@gluestack-ui/themed';
import { CircleIcon } from '@gluestack-ui/themed';

export interface RadioOption {
  value: string;
  label: string;
  isDisabled?: boolean;
}

export interface RadioGroupProps {
  value?: string;
  onChange?: (value: string) => void;
  options: RadioOption[];
  size?: 'sm' | 'md' | 'lg';
  isDisabled?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  value,
  onChange,
  options,
  size = 'md',
  isDisabled = false,
  orientation = 'vertical',
}) => {
  return (
    <GluestackRadioGroup value={value} onChange={onChange}>
      <VStack space="sm" className={orientation === 'horizontal' ? 'flex-row' : ''}>
        {options.map((option) => (
          <Radio
            key={option.value}
            value={option.value}
            label={option.label}
            size={size}
            isDisabled={isDisabled || option.isDisabled}
          />
        ))}
      </VStack>
    </GluestackRadioGroup>
  );
};

export interface RadioProps {
  value: string;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  isDisabled?: boolean;
}

export const Radio: React.FC<RadioProps> = ({
  value,
  label,
  size = 'md',
  isDisabled = false,
}) => {
  return (
    <GluestackRadio value={value} size={size} isDisabled={isDisabled}>
      <RadioIndicator mr="$2">
        <RadioIcon as={CircleIcon} />
      </RadioIndicator>
      <RadioLabel>{label}</RadioLabel>
    </GluestackRadio>
  );
};