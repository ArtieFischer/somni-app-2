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
  // Debug logging
  console.log('🔍 InterpretationDisplay received:', {
    interpretation,
    interpreterName,
    hasInterpretation: !!interpretation,
    interpretationType: interpretation ? Object.prototype.toString.call(interpretation) : 'null',
    interpretationKeys: interpretation ? Object.keys(interpretation) : [],
    interpretationText: interpretation?.interpretation,
    hasDreamTopic: interpretation && 'dreamTopic' in interpretation,
    hasInterpreterId: interpretation && 'interpreter_id' in interpretation,
  });

  // Handle both database format and API response format
  const isApiResponse = interpretation && 'dreamTopic' in interpretation;
  const hasFullResponse = interpretation && 'full_response' in interpretation;
  
  const interpretationData = isApiResponse ? interpretation as InterpretationResponse : null;
  const dbInterpretation = !isApiResponse ? interpretation as Interpretation : null;

  // Extract data from full_response if available (new database format)
  const fullResponse = hasFullResponse ? interpretation.full_response : null;
  
  // Get interpretation text from various possible locations
  const interpretationText = interpretation?.interpretation || 
    interpretation?.interpretation_summary || 
    fullResponse?.condensedInterpretation ||
    interpretationData?.interpretation;

  // Get symbols from various possible locations
  const keySymbols = interpretation?.symbols ||
    interpretationData?.symbols || 
    fullResponse?.symbols ||
    (dbInterpretation?.key_symbols ? 
      (typeof dbInterpretation.key_symbols === 'string' ? 
        JSON.parse(dbInterpretation.key_symbols) : 
        dbInterpretation.key_symbols) : 
      []);

  // Get emotional tone from various sources
  const emotionalTone = interpretation?.emotional_tone || 
    interpretationData?.emotionalTone || 
    fullResponse?.emotionalTone;

  return (
    <VStack space="lg">
      {/* Header */}
      <Card variant="elevated" marginHorizontal={0}>
        <VStack space="md">
          <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <HStack space="sm" style={{ alignItems: 'center' }}>
              <MaterialCommunityIcons
                name={getInterpreterIcon(interpretation?.interpreter_type || interpretation?.interpreter_id || interpretationData?.interpreterId || '')}
                size={24}
                color={darkTheme.colors.primary}
              />
              <Text style={{ fontSize: 18, fontWeight: '600', color: darkTheme.colors.text.primary }}>
                {interpreterName || getInterpreterDisplayName(interpretation?.interpreter_type || interpretation?.interpreter_id || interpretationData?.interpreterId || '')}
              </Text>
            </HStack>
            {dbInterpretation?.created_at && (
              <Text style={{ fontSize: 12, color: darkTheme.colors.text.secondary }}>
                {format(new Date(dbInterpretation.created_at), 'MMM d, h:mm a')}
              </Text>
            )}
          </HStack>

          {/* Topic/Title */}
          {(interpretation?.dream_topic || interpretationData?.dreamTopic) && (
            <Text style={{ fontSize: 20, fontWeight: '600', color: darkTheme.colors.text.primary }}>
              {interpretation?.dream_topic || interpretationData?.dreamTopic}
            </Text>
          )}

          {/* Quick Take */}
          {(interpretation?.quick_take || interpretationData?.quickTake) && (
            <View style={{ 
              backgroundColor: darkTheme.colors.background.secondary, 
              padding: 12, 
              borderRadius: 8,
              borderLeftWidth: 3,
              borderLeftColor: darkTheme.colors.primary,
            }}>
              <Text style={{ fontSize: 14, color: darkTheme.colors.text.primary, fontStyle: 'italic' }}>
                {interpretation?.quick_take || interpretationData?.quickTake}
              </Text>
            </View>
          )}
        </VStack>
      </Card>

      {/* Emotional Tone */}
      {emotionalTone && (
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
                <BadgeText>{emotionalTone.primary}</BadgeText>
              </Badge>
              {emotionalTone.secondary && (
                <Badge variant="outline" action="muted">
                  <BadgeText>{emotionalTone.secondary}</BadgeText>
                </Badge>
              )}
              <Text style={{ fontSize: 12, color: darkTheme.colors.text.secondary }}>
                Intensity: {Math.round(emotionalTone.intensity * 100)}%
              </Text>
            </HStack>
          </VStack>
        </Card>
      )}

      {/* Primary Insight */}
      {(interpretation?.primary_insight || fullResponse?.primaryInsight) && (
        <Card variant="elevated" marginHorizontal={0}>
          <VStack space="md">
            <HStack space="sm" style={{ alignItems: 'center' }}>
              <MaterialCommunityIcons
                name="lightbulb"
                size={20}
                color={darkTheme.colors.secondary}
              />
              <Text style={{ fontSize: 12, color: darkTheme.colors.text.secondary, fontWeight: '500', textTransform: 'uppercase' }}>
                PRIMARY INSIGHT
              </Text>
            </HStack>
            <Text style={{ fontSize: 14, color: darkTheme.colors.text.primary, lineHeight: 22, fontWeight: '500' }}>
              {interpretation?.primary_insight || fullResponse?.primaryInsight}
            </Text>
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
              ANALYSIS
            </Text>
          </HStack>
          <Text style={{ fontSize: 14, color: darkTheme.colors.text.primary, lineHeight: 22 }}>
            {interpretationText ? 
              interpretationText.split('\n\n').map((paragraph, i) => (
                <React.Fragment key={i}>
                  {paragraph}
                  {i < interpretationText.split('\n\n').length - 1 && '\n\n'}
                </React.Fragment>
              )) : 
              'No analysis available'
            }
          </Text>
        </VStack>
      </Card>

      {/* Key Pattern */}
      {(interpretation?.key_pattern || fullResponse?.keyPattern) && (
        <Card variant="elevated" marginHorizontal={0}>
          <VStack space="md">
            <HStack space="sm" style={{ alignItems: 'center' }}>
              <MaterialCommunityIcons
                name="vector-square"
                size={20}
                color={darkTheme.colors.secondary}
              />
              <Text style={{ fontSize: 12, color: darkTheme.colors.text.secondary, fontWeight: '500', textTransform: 'uppercase' }}>
                KEY PATTERN
              </Text>
            </HStack>
            <Text style={{ fontSize: 14, color: darkTheme.colors.text.primary, lineHeight: 22 }}>
              {interpretation?.key_pattern || fullResponse?.keyPattern}
            </Text>
          </VStack>
        </Card>
      )}

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

      {/* Practical Guidance / Advice */}
      {(fullResponse?.advice || interpretationData?.practicalGuidance) && (
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
            {fullResponse?.advice ? (
              <Text style={{ fontSize: 14, color: darkTheme.colors.text.primary, lineHeight: 22 }}>
                {fullResponse.advice}
              </Text>
            ) : interpretationData?.practicalGuidance ? (
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
            ) : null}
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
      {(fullResponse?.selfReflection || interpretationData?.selfReflection) && (
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
                {fullResponse?.selfReflection || interpretationData?.selfReflection}
              </Text>
            </View>
          </VStack>
        </Card>
      )}
    </VStack>
  );
};

export { InterpretationDisplay };