import React from 'react';
import { View } from 'react-native';
import {
  Input,
  InputField,
  Text,
  VStack,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlHelper,
  FormControlHelperText,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
} from '@gluestack-ui/themed';
import { AlertCircleIcon } from '@gluestack-ui/themed';

export const TestInput = () => {
  return (
    <View style={{ padding: 20 }}>
      <VStack space="4xl">
        <Text size="2xl">Test Gluestack UI Input</Text>
        
        {/* Basic Input */}
        <Input size="md">
          <InputField placeholder="Basic input" />
        </Input>

        {/* Input with FormControl */}
        <FormControl>
          <FormControlLabel>
            <FormControlLabelText>Email</FormControlLabelText>
          </FormControlLabel>
          <Input size="md">
            <InputField 
              placeholder="Enter your email" 
              keyboardType="email-address"
            />
          </Input>
          <FormControlHelper>
            <FormControlHelperText>
              We'll never share your email
            </FormControlHelperText>
          </FormControlHelper>
        </FormControl>

        {/* Input with Error */}
        <FormControl isInvalid>
          <FormControlLabel>
            <FormControlLabelText>Password</FormControlLabelText>
          </FormControlLabel>
          <Input size="md">
            <InputField 
              placeholder="Enter password" 
              secureTextEntry
            />
          </Input>
          <FormControlError>
            <FormControlErrorIcon as={AlertCircleIcon} />
            <FormControlErrorText>
              Password must be at least 6 characters
            </FormControlErrorText>
          </FormControlError>
        </FormControl>
      </VStack>
    </View>
  );
};