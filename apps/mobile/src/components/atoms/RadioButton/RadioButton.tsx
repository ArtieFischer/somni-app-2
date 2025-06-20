import React from 'react';
import {
  Radio,
  RadioGroup,
  RadioIcon,
  RadioIndicator,
  RadioLabel,
  VStack,
  HStack,
} from '@gluestack-ui/themed';
import { CircleIcon } from '@gluestack-ui/themed';
import { useTheme } from '../../../hooks/useTheme';

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface RadioButtonProps {
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  orientation?: 'vertical' | 'horizontal';
  size?: 'sm' | 'md' | 'lg';
  isDisabled?: boolean;
}

export const RadioButton: React.FC<RadioButtonProps> = ({
  options,
  value,
  onChange,
  orientation = 'vertical',
  size = 'md',
  isDisabled = false,
}) => {
  const theme = useTheme();
  const Container = orientation === 'vertical' ? VStack : HStack;

  return (
    <RadioGroup value={value} onChange={onChange}>
      <Container space={size === 'sm' ? 'xs' : size === 'lg' ? 'lg' : 'sm'}>
        {options.map((option) => (
          <Radio
            key={option.value}
            value={option.value}
            isDisabled={isDisabled || option.disabled}
            size={size}
          >
            <RadioIndicator mr="$2">
              <RadioIcon as={CircleIcon} strokeWidth={0} />
            </RadioIndicator>
            <RadioLabel
              color={value === option.value ? '$textLight200' : '$textLight300'}
            >
              {option.label}
            </RadioLabel>
          </Radio>
        ))}
      </Container>
    </RadioGroup>
  );
};

export { RadioGroup };