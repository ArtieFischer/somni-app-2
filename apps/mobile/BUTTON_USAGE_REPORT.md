# Button Usage Report - Somni Mobile App

## Summary
Based on my analysis of the mobile app, here's the current state of button usage:

### Button Import Sources
1. **From atoms index** (`@components/atoms`): Most common approach
2. **From specific Button file** (`@components/atoms/Button`): Used in some components
3. **From Gluestack** (`@gluestack-ui/themed`): Used in ProfileScreen

### Current Button Components

#### 1. **LegacyButton** (Old Button Component)
- Located at: `/src/components/atoms/Button/Button.tsx`
- Exported as `LegacyButton` from index
- **Still being used as the default `Button` in most screens**
- Props: `variant` (solid/outline/link), `size` (small/medium/large), `loading`, `disabled`

#### 2. **New Gluestack Button**
- Located at: `/src/components/atoms/Button/GluestackButton.tsx`
- Exported as `Button` from index (alongside LegacyButton)
- Props: `variant`, `action`, `size`, `isDisabled`, `isLoading`, `leftIcon`, `rightIcon`
- **Not widely adopted yet**

### Button Usage by Screen/Component

#### ✅ Using Atoms Button (Legacy):
1. **HomeScreen** - Uses Button from `@components/atoms`
2. **RecordingActions** - Uses Button from `../../atoms/Button`
3. **SignInScreen** - Uses Button from `@components/atoms`
4. **WelcomeScreen** - Uses Button from `@components/atoms`
5. **ForgotPasswordScreen** - Uses Button from `@components/atoms`
6. **OfflineQueueStatus** - Uses Button from `../../atoms/Button`
7. **TimePicker** - Uses Button from `../../atoms/Button`
8. **SharedDreamsSection** - Uses Button from `../../atoms`
9. **StepCredentials** (Onboarding) - Uses Button from `@components/atoms`
10. **Modal** - Imports new Button from `../Button/GluestackButton` but component is using Gluestack Modal

#### ⚠️ Using Gluestack Button Directly:
1. **ProfileScreen** - Imports Button from `@gluestack-ui/themed`
2. **Modal Component** - Uses Gluestack Modal components

#### 📊 Not Using Traditional Buttons:
1. **DreamDiaryScreen** - Uses PillButton for filters, Pressable for actions
2. **RecordScreen** - Uses MorphingRecordButton (custom component)
3. **DreamDetailScreen** - Uses PillButton for tabs

### Key Findings

1. **Mixed Implementation**: The app is in a transition state with both old and new button components coexisting
2. **Legacy Button Dominance**: Most screens still use the legacy Button component
3. **Inconsistent Imports**: Some import from atoms index, others from specific paths
4. **Gluestack Integration**: Only ProfileScreen directly uses Gluestack buttons
5. **Custom Components**: Some screens use specialized buttons (PillButton, MorphingRecordButton)

### Potential Issues

1. **Styling Inconsistency**: Different button implementations may have different visual styles
2. **Props Mismatch**: Legacy Button uses `loading` while Gluestack uses `isLoading`
3. **Import Confusion**: Having both Button exports in the same index file is confusing
4. **Incomplete Migration**: The new Gluestack Button component exists but isn't being used

### Recommendations

1. **Complete Migration**: Finish migrating all screens to use the new Gluestack Button
2. **Remove Legacy**: Once migration is complete, remove the LegacyButton component
3. **Consistent Imports**: Standardize import paths across all components
4. **Update Props**: Ensure all button usages match the new component's prop interface
5. **Test Thoroughly**: Verify button functionality and styling after migration

### Migration Priority
1. **High Priority**: Auth screens (SignIn, Welcome, ForgotPassword) - user's first interaction
2. **Medium Priority**: Main app screens (Home, RecordingActions, OfflineQueue)
3. **Low Priority**: Utility components (TimePicker, Modal) that may need special handling