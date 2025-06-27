import React from 'react';
import { View, ScrollView } from 'react-native';
import { VStack, HStack, Box, Text, Badge, BadgeText } from '@gluestack-ui/themed';
import { darkTheme } from '@somni/theme';
import { Card } from '../atoms';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Interpretation, InterpretationResponse } from '../../services/interpretationService';
import { format } from 'date-fns';

interface InterpretationDisplayProps {
  interpretation: Interpretation | InterpretationResponse;
  interpreterName?: string;
}

const getInterpreterIcon = (interpreterId: string) => {
  const icons = {
    jung: 'head-cog',
    freud: 'brain',
    lakshmi: 'meditation',
    mary: 'microscope',
  };
  return icons[interpreterId] || 'telescope';
};

const getInterpreterDisplayName = (interpreterId: string) => {
  const names = {
    jung: 'Carl Jung',
    freud: 'Sigmund Freud',
    lakshmi: 'Lakshmi Devi',
    mary: 'Mary Whiton',
  };
  return names[interpreterId] || interpreterId;
};

export const InterpretationDisplay: React.FC<InterpretationDisplayProps> = ({ 
  interpretation,
  interpreterName 
}) => {
  // Handle both database format and API response format
  const isApiResponse = 'dreamTopic' in interpretation;
  
  const interpretationData = isApiResponse ? interpretation as InterpretationResponse : null;
  const dbInterpretation = !isApiResponse ? interpretation as Interpretation : null;

  // Parse key_symbols if it's from database
  const keySymbols = interpretationData?.symbols || 
    (dbInterpretation?.key_symbols ? 
      (typeof dbInterpretation.key_symbols === 'string' ? 
        JSON.parse(dbInterpretation.key_symbols) : 
        dbInterpretation.key_symbols) : 
      []);

  return (
    <VStack space="lg">
      {/* Header */}
      <Card variant="elevated" marginHorizontal={0}>
        <VStack space="md">
          <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <HStack space="sm" style={{ alignItems: 'center' }}>
              <MaterialCommunityIcons
                name={getInterpreterIcon(interpretation.interpreter_id || interpretationData?.interpreterId || '')}
                size={24}
                color={darkTheme.colors.primary}
              />
              <Text style={{ fontSize: 18, fontWeight: '600', color: darkTheme.colors.text.primary }}>
                {interpreterName || getInterpreterDisplayName(interpretation.interpreter_id || interpretationData?.interpreterId || '')}
              </Text>
            </HStack>
            {dbInterpretation?.created_at && (
              <Text style={{ fontSize: 12, color: darkTheme.colors.text.secondary }}>
                {format(new Date(dbInterpretation.created_at), 'MMM d, h:mm a')}
              </Text>
            )}
          </HStack>

          {/* Topic/Title */}
          {interpretationData?.dreamTopic && (
            <Text style={{ fontSize: 20, fontWeight: '600', color: darkTheme.colors.text.primary }}>
              {interpretationData.dreamTopic}
            </Text>
          )}

          {/* Quick Take */}
          {interpretationData?.quickTake && (
            <View style={{ 
              backgroundColor: darkTheme.colors.background.secondary, 
              padding: 12, 
              borderRadius: 8,
              borderLeftWidth: 3,
              borderLeftColor: darkTheme.colors.primary,
            }}>
              <Text style={{ fontSize: 14, color: darkTheme.colors.text.primary, fontStyle: 'italic' }}>
                {interpretationData.quickTake}
              </Text>
            </View>
          )}
        </VStack>
      </Card>

      {/* Emotional Tone */}
      {interpretationData?.emotionalTone && (
        <Card variant="elevated" marginHorizontal={0}>
          <VStack space="sm">
            <HStack space="sm" style={{ alignItems: 'center' }}>
              <MaterialCommunityIcons
                name="emoticon-outline"
                size={20}
                color={darkTheme.colors.secondary}
              />
              <Text style={{ fontSize: 12, color: darkTheme.colors.text.secondary, fontWeight: '500', textTransform: 'uppercase' }}>
                EMOTIONAL TONE
              </Text>
            </HStack>
            <HStack space="md" style={{ alignItems: 'center' }}>
              <Badge variant="solid" action="muted">
                <BadgeText>{interpretationData.emotionalTone.primary}</BadgeText>
              </Badge>
              {interpretationData.emotionalTone.secondary && (
                <Badge variant="outline" action="muted">
                  <BadgeText>{interpretationData.emotionalTone.secondary}</BadgeText>
                </Badge>
              )}
              <Text style={{ fontSize: 12, color: darkTheme.colors.text.secondary }}>
                Intensity: {Math.round(interpretationData.emotionalTone.intensity * 100)}%
              </Text>
            </HStack>
          </VStack>
        </Card>
      )}

      {/* Main Interpretation */}
      <Card variant="elevated" marginHorizontal={0}>
        <VStack space="md">
          <HStack space="sm" style={{ alignItems: 'center' }}>
            <MaterialCommunityIcons
              name="book-open-variant"
              size={20}
              color={darkTheme.colors.secondary}
            />
            <Text style={{ fontSize: 12, color: darkTheme.colors.text.secondary, fontWeight: '500', textTransform: 'uppercase' }}>
              INTERPRETATION
            </Text>
          </HStack>
          <Text style={{ fontSize: 14, color: darkTheme.colors.text.primary, lineHeight: 22 }}>
            {interpretation.interpretation.split('\n\n').map((paragraph, i) => (
              <React.Fragment key={i}>
                {paragraph}
                {i < interpretation.interpretation.split('\n\n').length - 1 && '\n\n'}
              </React.Fragment>
            ))}
          </Text>
        </VStack>
      </Card>

      {/* Key Symbols */}
      {keySymbols.length > 0 && (
        <Card variant="elevated" marginHorizontal={0}>
          <VStack space="md">
            <HStack space="sm" style={{ alignItems: 'center' }}>
              <MaterialCommunityIcons
                name="shape-outline"
                size={20}
                color={darkTheme.colors.secondary}
              />
              <Text style={{ fontSize: 12, color: darkTheme.colors.text.secondary, fontWeight: '500', textTransform: 'uppercase' }}>
                KEY SYMBOLS
              </Text>
            </HStack>
            <HStack space="sm" style={{ flexWrap: 'wrap' }}>
              {keySymbols.map((symbol: string, index: number) => (
                <View
                  key={index}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 20,
                    backgroundColor: darkTheme.colors.secondary + '20',
                    borderWidth: 1,
                    borderColor: darkTheme.colors.secondary,
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ fontSize: 14, color: darkTheme.colors.secondary, fontWeight: '500' }}>
                    {symbol}
                  </Text>
                </View>
              ))}
            </HStack>
          </VStack>
        </Card>
      )}

      {/* Practical Guidance */}
      {interpretationData?.practicalGuidance && interpretationData.practicalGuidance.length > 0 && (
        <Card variant="elevated" marginHorizontal={0}>
          <VStack space="md">
            <HStack space="sm" style={{ alignItems: 'center' }}>
              <MaterialCommunityIcons
                name="lightbulb-outline"
                size={20}
                color={darkTheme.colors.secondary}
              />
              <Text style={{ fontSize: 12, color: darkTheme.colors.text.secondary, fontWeight: '500', textTransform: 'uppercase' }}>
                PRACTICAL GUIDANCE
              </Text>
            </HStack>
            <VStack space="sm">
              {interpretationData.practicalGuidance.map((guidance, i) => (
                <HStack key={i} space="sm" style={{ alignItems: 'flex-start' }}>
                  <Text style={{ fontSize: 14, color: darkTheme.colors.primary }}>•</Text>
                  <Text style={{ fontSize: 14, color: darkTheme.colors.text.primary, flex: 1 }}>
                    {guidance}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </VStack>
        </Card>
      )}

      {/* Advice (from database format) */}
      {dbInterpretation?.advice && (
        <Card variant="elevated" marginHorizontal={0}>
          <VStack space="md">
            <HStack space="sm" style={{ alignItems: 'center' }}>
              <MaterialCommunityIcons
                name="lightbulb-outline"
                size={20}
                color={darkTheme.colors.secondary}
              />
              <Text style={{ fontSize: 12, color: darkTheme.colors.text.secondary, fontWeight: '500', textTransform: 'uppercase' }}>
                ADVICE
              </Text>
            </HStack>
            <Text style={{ fontSize: 14, color: darkTheme.colors.text.primary, lineHeight: 22 }}>
              {dbInterpretation.advice}
            </Text>
          </VStack>
        </Card>
      )}

      {/* Self Reflection */}
      {interpretationData?.selfReflection && (
        <Card variant="elevated" marginHorizontal={0}>
          <VStack space="md">
            <HStack space="sm" style={{ alignItems: 'center' }}>
              <MaterialCommunityIcons
                name="mirror"
                size={20}
                color={darkTheme.colors.secondary}
              />
              <Text style={{ fontSize: 12, color: darkTheme.colors.text.secondary, fontWeight: '500', textTransform: 'uppercase' }}>
                REFLECTION PROMPT
              </Text>
            </HStack>
            <View style={{ 
              backgroundColor: darkTheme.colors.primary + '10', 
              padding: 16, 
              borderRadius: 8,
              borderWidth: 1,
              borderColor: darkTheme.colors.primary + '30',
            }}>
              <Text style={{ fontSize: 16, color: darkTheme.colors.text.primary, fontStyle: 'italic', lineHeight: 24 }}>
                {interpretationData.selfReflection}
              </Text>
            </View>
          </VStack>
        </Card>
      )}
    </VStack>
  );
};