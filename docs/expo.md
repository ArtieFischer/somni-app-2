TITLE: Starting Expo Development Server - Shell
DESCRIPTION: This command starts the Metro bundler, initiating the development server for an Expo project. It makes the application available for live reloading and debugging on development builds, displaying a QR code and manifest URL in the terminal for easy access.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/tutorial/eas/configure-development-build.mdx#_snippet_1

LANGUAGE: Shell
CODE:
```
$ npx expo start
```

----------------------------------------

TITLE: Starting Expo Development Server - Bash
DESCRIPTION: This command starts the Expo development server, providing options to open the app in a development build, Android emulator, iOS simulator, or Expo Go. It enables live reloading and debugging during the development process.
SOURCE: https://github.com/expo/expo/blob/main/templates/expo-template-default/README.md#_snippet_1

LANGUAGE: bash
CODE:
```
npx expo start
```

----------------------------------------

TITLE: Full Example: Handling and Scheduling Notifications with Expo
DESCRIPTION: This snippet demonstrates a complete React Native application using `expo-notifications` to register for push notifications, handle incoming notifications, and schedule local notifications. It includes permission requests, token retrieval, and UI to display notification details. It also shows how to set up notification channels for Android.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/v52.0.0/sdk/notifications.mdx#_snippet_0

LANGUAGE: tsx
CODE:
```
import { useState, useEffect, useRef } from 'react';
import { Text, View, Button, Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>([]);
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(
    undefined
  );
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => token && setExpoPushToken(token));

    if (Platform.OS === 'android') {
      Notifications.getNotificationChannelsAsync().then(value => setChannels(value ?? []));
    }
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
      }}>
      <Text>Your expo push token: {expoPushToken}</Text>
      <Text>{`Channels: ${JSON.stringify(
        channels.map(c => c.id),
        null,
        2
      )}`}</Text>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text>Title: {notification && notification.request.content.title} </Text>
        <Text>Body: {notification && notification.request.content.body}</Text>
        <Text>Data: {notification && JSON.stringify(notification.request.content.data)}</Text>
      </View>
      <Button
        title="Press to schedule a notification"
        onPress={async () => {
          await schedulePushNotification();
        }}
      />
    </View>
  );
}

async function schedulePushNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "You've got mail! 📬",
      body: 'Here is the notification body',
      data: { data: 'goes here', test: { test1: 'more data' } },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
    },
  });
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('myNotificationChannel', {
      name: 'A channel is needed for the permissions prompt to appear',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    // Learn more about projectId:
    // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
    // EAS projectId is used here.
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) {
        throw new Error('Project ID not found');
      }
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log(token);
    } catch (e) {
      token = `${e}`;
    }
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}
```

----------------------------------------

TITLE: Handling Browser Redirects with Expo Linking for Stripe
DESCRIPTION: This JavaScript snippet provides the recommended `urlScheme` configuration for `initStripe` to ensure proper redirection from browser pop-ups back to the app. It dynamically generates the scheme using `expo-linking` and `expo-constants` to support both Expo Go and production builds, addressing common redirect issues.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/v52.0.0/sdk/stripe.mdx#_snippet_1

LANGUAGE: javascript
CODE:
```
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';

urlScheme:
  Constants.appOwnership === 'expo'
    ? Linking.createURL('/--/')
    : Linking.createURL(''),
```

----------------------------------------

TITLE: Using Public Environment Variables in React Native (TypeScript)
DESCRIPTION: Demonstrates how to access `EXPO_PUBLIC_` prefixed environment variables within a React Native component. The `EXPO_PUBLIC_API_URL` variable is used to dynamically set the API endpoint for a `fetch` request. These variables are visible in the compiled app.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/eas/environment-variables.mdx#_snippet_0

LANGUAGE: tsx
CODE:
```
import { Button } from 'react-native';

function Post() {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  async function onPress() {
    await fetch(apiUrl, { ... })
  }

  return <Button onPress={onPress} title="Post" />;
}
```

----------------------------------------

TITLE: Full Push Notification Example with Expo
DESCRIPTION: This comprehensive example demonstrates how to set up and handle push notifications in an Expo React Native application. It includes registering for push tokens, scheduling local notifications, listening for incoming notifications, and handling notification responses. It also manages Android notification channels and checks device compatibility.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/v51.0.0/sdk/notifications.mdx#_snippet_0

LANGUAGE: tsx
CODE:
```
import { useState, useEffect, useRef } from 'react';
import { Text, View, Button, Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>([]);
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(
    undefined
  );
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => token && setExpoPushToken(token));

    if (Platform.OS === 'android') {
      Notifications.getNotificationChannelsAsync().then(value => setChannels(value ?? []));
    }
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
      }}>
      <Text>Your expo push token: {expoPushToken}</Text>
      <Text>{`Channels: ${JSON.stringify(
        channels.map(c => c.id),
        null,
        2
      )}`}</Text>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text>Title: {notification && notification.request.content.title} </Text>
        <Text>Body: {notification && notification.request.content.body}</Text>
        <Text>Data: {notification && JSON.stringify(notification.request.content.data)}</Text>
      </View>
      <Button
        title="Press to schedule a notification"
        onPress={async () => {
          await schedulePushNotification();
        }}
      />
    </View>
  );
}

async function schedulePushNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "You've got mail! 📬",
      body: 'Here is the notification body',
      data: { data: 'goes here', test: { test1: 'more data' } },
    },
    trigger: { seconds: 2 },
  });
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    // Learn more about projectId:
    // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
    // EAS projectId is used here.
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) {
        throw new Error('Project ID not found');
      }
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log(token);
    } catch (e) {
      token = `${e}`;
    }
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}
```

----------------------------------------

TITLE: Creating a New Expo Project
DESCRIPTION: Initializes a new Expo project using the `create-expo-app` utility. This is the recommended and easiest method to set up a new Expo application, allowing immediate launch in Expo Go on a physical device or in an emulator/simulator for quick prototyping.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/workflow/overview.mdx#_snippet_5

LANGUAGE: Shell
CODE:
```
create-expo-app
```

----------------------------------------

TITLE: Basic Image Usage with BlurHash Placeholder in React Native
DESCRIPTION: This snippet demonstrates how to use the `expo-image` component in a React Native application. It shows importing the `Image` component, defining a `blurhash` string for a placeholder, and rendering an `Image` component with `source`, `placeholder`, `contentFit`, and `transition` props. It also includes basic styling using `StyleSheet` for layout.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/v52.0.0/sdk/image.mdx#_snippet_0

LANGUAGE: jsx
CODE:
```
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

export default function App() {
  return (
    <View style={styles.container}>
      <Image
        style={styles.image}
        source="https://picsum.photos/seed/696/3000/2000"
        placeholder={{ blurhash }}
        contentFit="cover"
        transition={1000}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    flex: 1,
    width: '100%',
    backgroundColor: '#0553',
  },
});
```

----------------------------------------

TITLE: Implementing a Persistent Storage Hook (TypeScript)
DESCRIPTION: This hook, `useStorageState`, provides a mechanism to persist tokens or other session data securely. It leverages `expo-secure-store` for native platforms and `localStorage` for web, ensuring data persistence across app sessions. The `setStorageItemAsync` function handles the platform-specific storage logic, while `useAsyncState` manages the asynchronous state updates.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/router/advanced/authentication.mdx#_snippet_1

LANGUAGE: tsx
CODE:
```
import  { useEffect, useCallback, useReducer } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

type UseStateHook<T> = [[boolean, T | null], (value: T | null) => void];

function useAsyncState<T>(
  initialValue: [boolean, T | null] = [true, null],
): UseStateHook<T> {
  return useReducer(
    (state: [boolean, T | null], action: T | null = null): [boolean, T | null] => [false, action],
    initialValue
  ) as UseStateHook<T>;
}

export async function setStorageItemAsync(key: string, value: string | null) {
  if (Platform.OS === 'web') {
    try {
      if (value === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, value);
      }
    } catch (e) {
      console.error('Local storage is unavailable:', e);
    }
  } else {
    if (value == null) {
      await SecureStore.deleteItemAsync(key);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  }
}

export function useStorageState(key: string): UseStateHook<string> {
  // Public
  const [state, setState] = useAsyncState<string>();

  // Get
  useEffect(() => {
    if (Platform.OS === 'web') {
      try {
        if (typeof localStorage !== 'undefined') {
          setState(localStorage.getItem(key));
        }
      } catch (e) {
        console.error('Local storage is unavailable:', e);
      }
    } else {
      SecureStore.getItemAsync(key).then(value => {
        setState(value);
      });
    }
  }, [key]);

  // Set
  const setValue = useCallback(
    (value: string | null) => {
      setState(value);
      setStorageItemAsync(key, value);
    },
    [key]
  );

  return [state, setValue];
}
```

----------------------------------------

TITLE: Nest Tab Navigator in Root Stack (app/_layout.tsx)
DESCRIPTION: Updates the root layout file (`app/_layout.tsx`) to include the `(tabs)` route within the main stack navigator. This ensures the tab navigator is part of the main navigation flow and allows other routes (like `+not-found`) to overlay it. It also hides the header for the tab navigator.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/tutorial/add-navigation.mdx#_snippet_4

LANGUAGE: tsx
CODE:
```
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      /* @tutinfo This is how a tab navigator is nested inside a stack navigator, especially when the Root layout is composed of a parent stack navigator. We're also setting the <CODE>headerShown</CODE> option to <CODE>false</CODE> to hide the header for the tab navigator. Otherwise, there will be two headers displayed on each screen. */
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      /* @end */
    </Stack>
  );
}
```

----------------------------------------

TITLE: Create New Expo Project - Shell
DESCRIPTION: Illustrates how to create a new React Native project with integrated Expo SDK support using the `npx create-expo-app` command with the `--template bare-minimum` flag.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/v52.0.0/index.mdx#_snippet_2

LANGUAGE: shell
CODE:
```
npx create-expo-app my-app --template bare-minimum
```

----------------------------------------

TITLE: Creating New Expo Project with npm
DESCRIPTION: This command initializes a new Expo and React Native project using `npx` and the latest version of `create-expo-app`. It's the recommended way to start a new project with npm, fetching the tool directly without global installation.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/more/create-expo.mdx#_snippet_0

LANGUAGE: npm
CODE:
```
$ npx create-expo-app@latest
```

----------------------------------------

TITLE: Registering for Push Notifications and Getting Token in Expo React Native
DESCRIPTION: This asynchronous function handles the complete process of registering the device for push notifications. It includes setting up Android notification channels, checking device type and permissions, requesting permissions if necessary, retrieving the Expo project ID, and finally fetching the unique Expo push token for the device and project.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/push-notifications/push-notifications-setup.mdx#_snippet_4

LANGUAGE: TSX
CODE:
```
async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      handleRegistrationError('Permission not granted to get push token for push notification!');
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError('Project ID not found');
    }
    try {
      /* @info This fetches the Expo push token (if not previously fetched), which is unique to this device and projectID. */
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      /* @end */
      console.log(pushTokenString);
      return pushTokenString;
    } catch (e: unknown) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError('Must use physical device for push notifications');
  }
}
```

----------------------------------------

TITLE: Full Expo Notifications Integration Example (React Native)
DESCRIPTION: This comprehensive example demonstrates integrating `expo-notifications` into a React Native app. It covers requesting push notification permissions, obtaining an Expo Push Token, setting up Android notification channels, scheduling local notifications, and handling received notifications and user responses. It's designed for testing on a physical device as push notifications are unavailable on emulators/simulators in Expo Go from SDK 53.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/v53.0.0/sdk/notifications.mdx#_snippet_0

LANGUAGE: typescript
CODE:
```
import { useState, useEffect, useRef } from 'react';
import { Text, View, Button, Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>([]);
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(
    undefined
  );
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => token && setExpoPushToken(token));

    if (Platform.OS === 'android') {
      Notifications.getNotificationChannelsAsync().then(value => setChannels(value ?? []));
    }
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
      }}>
      <Text>Your expo push token: {expoPushToken}</Text>
      <Text>{`Channels: ${JSON.stringify(
        channels.map(c => c.id),
        null,
        2
      )}`}</Text>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text>Title: {notification && notification.request.content.title} </Text>
        <Text>Body: {notification && notification.request.content.body}</Text>
        <Text>Data: {notification && JSON.stringify(notification.request.content.data)}</Text>
      </View>
      <Button
        title="Press to schedule a notification"
        onPress={async () => {
          await schedulePushNotification();
        }}
      />
    </View>
  );
}

async function schedulePushNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "You've got mail! 📬",
      body: 'Here is the notification body',
      data: { data: 'goes here', test: { test1: 'more data' } },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
    },
  });
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('myNotificationChannel', {
      name: 'A channel is needed for the permissions prompt to appear',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    // Learn more about projectId:
    // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
    // EAS projectId is used here.
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) {
        throw new Error('Project ID not found');
      }
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log(token);
    } catch (e) {
      token = `${e}`;
    }
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}
```

----------------------------------------

TITLE: Publishing EAS Update Previews on Pull Requests (YAML)
DESCRIPTION: This GitHub Action workflow automates the publishing of Expo EAS updates for every pull request. It checks for an `EXPO_TOKEN`, checks out the repository, sets up Node.js and EAS, installs dependencies, and then creates a preview update using `eas update --auto`, commenting the details back to the pull request. It requires `contents: read` and `pull-requests: write` permissions.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/eas-update/github-actions.mdx#_snippet_0

LANGUAGE: YAML
CODE:
```
name: preview
on: pull_request

jobs:
  update:
    name: EAS Update
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - name: Check for EXPO_TOKEN
        run: |
          if [ -z "${{ secrets.EXPO_TOKEN }}" ]; then
            echo "You must provide an EXPO_TOKEN secret linked to this project's Expo account in this repo's secrets. Learn more: https://docs.expo.dev/eas-update/github-actions"
            exit 1
          fi

      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 18.x
          cache: yarn

      - name: Setup EAS
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Install dependencies
        run: yarn install

      - name: Create preview
        uses: expo/expo-github-action/preview@v8
        with:
          command: eas update --auto
```

----------------------------------------

TITLE: Define EAS Workflow for Automatic Updates (YAML)
DESCRIPTION: Add this YAML configuration to '.eas/workflows/send-updates.yml' to define an EAS workflow that automatically sends an over-the-air update to the 'production' channel on every push to the 'main' branch.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/deploy/send-over-the-air-updates.mdx#_snippet_2

LANGUAGE: YAML
CODE:
```
name: Send updates

on:
  push:
    branches: ['main']

jobs:
  send_updates:
    name: Send updates
    type: update
    params:
      channel: production
```

----------------------------------------

TITLE: Getting Current Location with Expo Location in React Native
DESCRIPTION: This React Native component demonstrates how to fetch the user's current location using `expo-location`. It requests foreground location permissions upon component mount and, if granted, retrieves the current position. The snippet includes state management for location data and error messages, displaying the result or an error to the user. It also contains a platform-specific check for Android emulators.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/v51.0.0/sdk/location.mdx#_snippet_2

LANGUAGE: jsx
CODE:
```
import { useState, useEffect } from 'react';
import { Platform, Text, View, StyleSheet } from 'react-native';
/* @hide */
import * as Device from 'expo-device';
/* @end */
import * as Location from 'expo-location';

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      /* @hide */
      if (Platform.OS === 'android' && !Device.isDevice) {
        setErrorMsg(
          'Oops, this will not work on Snack in an Android Emulator. Try it on your device!'
        );
        return;
      }
      /* @end */
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  let text = 'Waiting..';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.paragraph}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  paragraph: {
    fontSize: 18,
    textAlign: 'center',
  },
});
```

----------------------------------------

TITLE: Publishing OTA Updates with EAS CLI (Shell)
DESCRIPTION: This command, part of the EAS CLI, is used to publish static files to the EAS Update cloud hosting service, enabling over-the-air (OTA) updates for Expo applications.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/more/glossary-of-terms.mdx#_snippet_3

LANGUAGE: Shell
CODE:
```
eas update
```

----------------------------------------

TITLE: Initializing Expo Project with create-expo-app (Shell)
DESCRIPTION: This command initializes a new Expo project using the `create-expo-app` CLI tool. It fetches the latest version of the tool and sets up a default project structure, including example code. Users can specify a different template using the `--template` option.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/get-started/create-a-project.mdx#_snippet_0

LANGUAGE: Shell
CODE:
```
$ npx create-expo-app@latest
```

----------------------------------------

TITLE: Running Expo CLI via npx
DESCRIPTION: This command executes the Expo CLI directly using `npx`, providing a quick way to start the CLI without a global installation. It's the recommended method for interacting with the Expo CLI.
SOURCE: https://github.com/expo/expo/blob/main/packages/@expo/cli/README.md#_snippet_0

LANGUAGE: Shell
CODE:
```
npx expo
```

----------------------------------------

TITLE: Protecting Routes with Authentication Check in Expo Router (TypeScript)
DESCRIPTION: This layout route, part of a route group, checks if a user is authenticated using `useSession`. If `isLoading` is true, it renders a loading screen. If `session` is null (user not authenticated), it redirects to the `/sign-in` screen, effectively protecting all child routes within the `(app)` group. This ensures that only authenticated users can access these routes.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/router/advanced/authentication-rewrites.mdx#_snippet_3

LANGUAGE: tsx
CODE:
```
import { Text } from 'react-native';
import { Redirect, Stack } from 'expo-router';

import { useSession } from '../../ctx';

export default function AppLayout() {
  const { session, isLoading } = useSession();

  // You can keep the splash screen open, or render a loading screen like we do here.
  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!session) {
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    return <Redirect href="/sign-in" />;
  }

  // This layout can be deferred because it's not the root layout.
  return <Stack />;
}
```

----------------------------------------

TITLE: Defining Pan Gesture Handler and Animated Style - React Native
DESCRIPTION: Creates a `Gesture.Pan` handler with an `onChange` callback to update `translateX` and `translateY` based on gesture movement. Defines an animated style using `useAnimatedStyle` that applies the current `translateX` and `translateY` values as a transform to the component.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/tutorial/gestures.mdx#_snippet_7

LANGUAGE: tsx
CODE:
```
const drag = Gesture.Pan().onChange(event => {
  translateX.value += event.changeX;
  translateY.value += event.changeY;
});

const containerStyle = useAnimatedStyle(() => {
  return {
    transform: [
      {
        translateX: translateX.value,
      },
      {
        translateY: translateY.value,
      },
    ],
  };
});
```

----------------------------------------

TITLE: Scheduling Notifications with Custom Sounds and Channels (TypeScript)
DESCRIPTION: This TypeScript example demonstrates how to set up a notification channel and schedule a notification using the `expo-notifications` API. It shows how to specify a custom sound (using only the base filename) for both the notification channel (for Android 8.0+) and the notification content itself, ensuring the custom sound is played when the notification is received.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/unversioned/sdk/notifications.mdx#_snippet_7

LANGUAGE: typescript
CODE:
```
await Notifications.setNotificationChannelAsync('new_emails', {
  name: 'E-mail notifications',
  importance: Notifications.AndroidImportance.HIGH,
  sound: 'mySoundFile.wav', // Provide ONLY the base filename
});

await Notifications.scheduleNotificationAsync({
  content: {
    title: "You've got mail! 📬",
    sound: 'mySoundFile.wav', // Provide ONLY the base filename
  },
  trigger: {
    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
    seconds: 2,
    channelId: 'new_emails',
  },
});
```

----------------------------------------

TITLE: Configuring Android Google Services File with Environment Variable in app.config.js
DESCRIPTION: This snippet demonstrates how to configure the `android.googleServicesFile` property in `app.config.js` using an environment variable. It allows passing a `google-services.json` file path via `process.env.GOOGLE_SERVICES_JSON`, falling back to a local path if the environment variable is not set. This is useful for securely providing sensitive configuration files during EAS builds.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/eas/environment-variables.mdx#_snippet_12

LANGUAGE: JavaScript
CODE:
```
export default {
  /* @hide ...*/ /* @end */
  android: {
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? '/local/path/to/google-services.json',
    /* @hide ...*/ /* @end */
  }
};
```

----------------------------------------

TITLE: Installing ESLint for Expo Projects
DESCRIPTION: This command installs ESLint as a development dependency in an Expo project using `npx expo install`, ensuring it's available for linting tasks.
SOURCE: https://github.com/expo/expo/blob/main/packages/eslint-plugin-expo/README.md#_snippet_0

LANGUAGE: Shell
CODE:
```
npx expo install eslint --save-dev
```

----------------------------------------

TITLE: Starting Local Development Server with Expo CLI (Shell)
DESCRIPTION: This command initiates a local development server for your Expo project. It allows you to make real-time changes to your project's JavaScript, styling, and assets, which are then reflected in the running application on a device or simulator.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/eas-update/getting-started.mdx#_snippet_12

LANGUAGE: shell
CODE:
```
$ npx expo start
```

----------------------------------------

TITLE: Creating a New Expo Project (Bash)
DESCRIPTION: This command initializes a new Expo project named 'my-app' using the latest version of `create-expo-app`. It sets up a basic 'Hello world' application, which can then be used with this deployment guide.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/eas/hosting/get-started.mdx#_snippet_0

LANGUAGE: bash
CODE:
```
npx create-expo-app@latest my-app
```

----------------------------------------

TITLE: Starting Expo Project
DESCRIPTION: Starts the Expo development server for your project. This command is typically run before attempting to connect a debugger like the React Native Debugger.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/debugging/tools.mdx#_snippet_2

LANGUAGE: Shell
CODE:
```
npx expo start
```

----------------------------------------

TITLE: Implementing an API Route Handler for HTTP Methods in Expo Router (TypeScript)
DESCRIPTION: This example shows how to create an API route handler for the `/hello` path. The `GET` function is exported and executed when a GET request is made. Expo Router supports exporting functions for `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, and `OPTIONS` to handle corresponding HTTP methods, automatically returning `405: Method not allowed` for unsupported ones.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/router/reference/api-routes.mdx#_snippet_2

LANGUAGE: TypeScript
CODE:
```
export function GET(request: Request) {
  return Response.json({ hello: 'world' });
}
```

----------------------------------------

TITLE: Managing Cached GIF Files with Expo FileSystem in TypeScript
DESCRIPTION: This example demonstrates how to manage a local cache of GIF files using `expo-file-system`. It includes functions to ensure a directory exists, download multiple GIFs, retrieve a single GIF (downloading if not cached), obtain shareable content URIs, and delete the entire GIF cache. It uses TypeScript syntax for clarity.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/v53.0.0/sdk/filesystem.mdx#_snippet_1

LANGUAGE: typescript
CODE:
```
import * as FileSystem from 'expo-file-system';

const gifDir = FileSystem.cacheDirectory + 'giphy/';
const gifFileUri = (gifId: string) => gifDir + `gif_${gifId}_200.gif`;
const gifUrl = (gifId: string) => `https://media1.giphy.com/media/${gifId}/200.gif`;

// Checks if gif directory exists. If not, creates it
async function ensureDirExists() {
  const dirInfo = await FileSystem.getInfoAsync(gifDir);
  if (!dirInfo.exists) {
    console.log("Gif directory doesn't exist, creating…");
    await FileSystem.makeDirectoryAsync(gifDir, { intermediates: true });
  }
}

// Downloads all gifs specified as array of IDs
export async function addMultipleGifs(gifIds: string[]) {
  try {
    await ensureDirExists();

    console.log('Downloading', gifIds.length, 'gif files…');
    await Promise.all(gifIds.map(id => FileSystem.downloadAsync(gifUrl(id), gifFileUri(id))));
  } catch (e) {
    console.error("Couldn't download gif files:", e);
  }
}

// Returns URI to our local gif file
// If our gif doesn't exist locally, it downloads it
export async function getSingleGif(gifId: string) {
  await ensureDirExists();

  const fileUri = gifFileUri(gifId);
  const fileInfo = await FileSystem.getInfoAsync(fileUri);

  if (!fileInfo.exists) {
    console.log("Gif isn't cached locally. Downloading…");
    await FileSystem.downloadAsync(gifUrl(gifId), fileUri);
  }

  return fileUri;
}

// Exports shareable URI - it can be shared outside your app
export async function getGifContentUri(gifId: string) {
  return FileSystem.getContentUriAsync(await getSingleGif(gifId));
}

// Deletes whole giphy directory with all its content
export async function deleteAllGifs() {
  console.log('Deleting all GIF files…');
  await FileSystem.deleteAsync(gifDir);
}
```

----------------------------------------

TITLE: Declaring State and Conditional Rendering in React Native (app/(tabs)/index.tsx)
DESCRIPTION: This snippet declares state variables `selectedImage` and `showAppOptions` to manage the selected image URI and control the visibility of app options buttons. The `pickImageAsync` function uses `expo-image-picker` to select an image and updates `selectedImage` and sets `showAppOptions` to `true` upon successful selection. The component's JSX conditionally renders different sets of buttons based on the value of `showAppOptions`.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/tutorial/create-a-modal.mdx#_snippet_0

LANGUAGE: tsx
CODE:
```
import { View, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';

import Button from '@/components/Button';
import ImageViewer from '@/components/ImageViewer';

const PlaceholderImage = require('@/assets/images/background-image.png');

export default function Index() {
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
  /* @tutinfo Create a state variable inside the <CODE>Index</CODE> component. */
  const [showAppOptions, setShowAppOptions] = useState<boolean>(false);
  /* @end */

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      /* @tutinfo After selecting the image, set the app options to true. */
      setShowAppOptions(true);
      /* @end */
    } else {
      alert('You did not select any image.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <ImageViewer imgSource={PlaceholderImage} selectedImage={selectedImage} />
      </View>
      /* @tutinfo Based on the value of <CODE>showAppOptions</CODE>, the buttons will be displayed. Also, move the existing buttons in the conditional operator block. */
      {showAppOptions ? (
        <View />
      /* @end */
      ) : (
        <View style={styles.footerContainer}>
          <Button theme="primary" label="Choose a photo" onPress={pickImageAsync} />
          /* @tutinfo Replace the <CODE>alert()</CODE> with the <CODE>onPress</CODE>.*/
          <Button label="Use this photo" onPress={() => setShowAppOptions(true)} />
          /* @end */
        </View>
      /* @tutinfo */)}/* @end */
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1,
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: 'center',
  },
});
```

----------------------------------------

TITLE: Full Notifications Example with Expo
DESCRIPTION: This comprehensive example demonstrates how to set up and use `expo-notifications` in a React Native application. It covers registering for push notifications, handling incoming notifications, scheduling local notifications, and managing notification channels on Android. It also shows how to obtain an Expo Push Token and includes listeners for received notifications and user responses.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/unversioned/sdk/notifications.mdx#_snippet_0

LANGUAGE: typescript
CODE:
```
import { useState, useEffect, useRef } from 'react';
import { Text, View, Button, Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>([]);
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(
    undefined
  );
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => token && setExpoPushToken(token));

    if (Platform.OS === 'android') {
      Notifications.getNotificationChannelsAsync().then(value => setChannels(value ?? []));
    }
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
      }}>
      <Text>Your expo push token: {expoPushToken}</Text>
      <Text>{`Channels: ${JSON.stringify(
        channels.map(c => c.id),
        null,
        2
      )}`}</Text>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text>Title: {notification && notification.request.content.title} </Text>
        <Text>Body: {notification && notification.request.content.body}</Text>
        <Text>Data: {notification && JSON.stringify(notification.request.content.data)}</Text>
      </View>
      <Button
        title="Press to schedule a notification"
        onPress={async () => {
          await schedulePushNotification();
        }}
      />
    </View>
  );
}

async function schedulePushNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "You've got mail! 📬",
      body: 'Here is the notification body',
      data: { data: 'goes here', test: { test1: 'more data' } },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
    },
  });
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('myNotificationChannel', {
      name: 'A channel is needed for the permissions prompt to appear',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    // Learn more about projectId:
    // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
    // EAS projectId is used here.
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) {
        throw new Error('Project ID not found');
      }
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log(token);
    } catch (e) {
      token = `${e}`;
    }
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}
```

----------------------------------------

TITLE: Run Expo Lint or Generate Config - Terminal
DESCRIPTION: Command to execute the Expo linting process, which checks code against configured ESLint and Prettier rules. It can also generate a new flat configuration file if no config exists.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/guides/using-eslint.mdx#_snippet_5

LANGUAGE: terminal
CODE:
```
$ npx expo lint
```

----------------------------------------

TITLE: Controlling SplashScreen Visibility in React Native (JSX)
DESCRIPTION: This example demonstrates how to use `expo-splash-screen` to keep the native splash screen visible while the app loads resources (like fonts or API data) and then hide it once the initial content is rendered and the root view has performed layout.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/v51.0.0/sdk/splash-screen.mdx#_snippet_0

LANGUAGE: jsx
CODE:
```
import { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        await Font.loadAsync(Entypo.font);
        // Artificially delay for two seconds to simulate a slow loading
        // experience. Remove this if you copy and paste the code!
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately! If we call this after
      // `setAppIsReady`, then we may see a blank screen while the app is
      // loading its initial state and rendering its first pixels. So instead,
      // we hide the splash screen once we know the root view has already
      // performed layout.
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <View
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      onLayout={onLayoutRootView}>
      <Text>SplashScreen Demo! 👋</Text>
      <Entypo name="rocket" size={30} />
    </View>
  );
}
```

----------------------------------------

TITLE: Default EAS Build Configuration in eas.json
DESCRIPTION: This is the default `eas.json` configuration generated for a new project, defining `development`, `preview`, and `production` build profiles. It sets up development builds with `developmentClient` and `internal` distribution, and preview builds for internal distribution.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/build/eas-json.mdx#_snippet_0

LANGUAGE: json
CODE:
```
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

----------------------------------------

TITLE: Adding Camera and Microphone Usage Descriptions to iOS Info.plist (XML)
DESCRIPTION: This XML snippet demonstrates how to add the `NSCameraUsageDescription` and `NSMicrophoneUsageDescription` keys to your iOS `Info.plist` file. These keys provide user-facing strings that explain why your app needs access to the camera and microphone, which is required by Apple's privacy guidelines.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/v53.0.0/sdk/camera.mdx#_snippet_3

LANGUAGE: xml
CODE:
```
<key>NSCameraUsageDescription</key>
<string>Allow $(PRODUCT_NAME) to access your camera</string>
<key>NSMicrophoneUsageDescription</key>
<string>Allow $(PRODUCT_NAME) to access your microphone</string>
```

----------------------------------------

TITLE: Animating View Width with react-native-reanimated in React Native
DESCRIPTION: This example demonstrates how to use `react-native-reanimated` to animate the width of a `View` component. It utilizes `useSharedValue` to manage the animated value, `withTiming` for smooth transitions with a custom easing curve, and `useAnimatedStyle` to apply the animation. A button press triggers a random width update, showcasing dynamic animation.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/unversioned/sdk/reanimated.mdx#_snippet_0

LANGUAGE: jsx
CODE:
```
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';
import { View, Button, StyleSheet } from 'react-native';

export default function AnimatedStyleUpdateExample() {
  const randomWidth = useSharedValue(10);

  const config = {
    duration: 500,
    easing: Easing.bezier(0.5, 0.01, 0, 1),
  };

  const style = useAnimatedStyle(() => {
    return {
      width: withTiming(randomWidth.value, config),
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.box, style]} />
      <Button
        title="toggle"
        onPress={() => {
          randomWidth.value = Math.random() * 350;
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 100,
    height: 80,
    backgroundColor: 'black',
    margin: 30,
  },
});
```

----------------------------------------

TITLE: Using `SafeAreaView` Component in React Native
DESCRIPTION: `SafeAreaView` is a convenient component that automatically applies safe area insets as padding to its content. This example shows how to wrap a `View` component with `SafeAreaView` to ensure its content avoids device notches, status bars, and home indicators. Any custom padding set on the `SafeAreaView` will be added to the safe area padding.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/v53.0.0/sdk/safe-area-context.mdx#_snippet_1

LANGUAGE: jsx
CODE:
```
import { SafeAreaView } from 'react-native-safe-area-context';

function SomeComponent() {
  return (
    <SafeAreaView>
      <View />
    </SafeAreaView>
  );
}
```

----------------------------------------

TITLE: Implementing Image Selection with Button (React Native/Expo TSX)
DESCRIPTION: This snippet defines the main screen component, integrating the custom Button component and `expo-image-picker`. It includes an asynchronous function `pickImageAsync` that launches the image library, handles the selection result, and logs it or shows an alert if canceled. This function is assigned to the `onPress` prop of the primary button.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/tutorial/image-picker.mdx#_snippet_2

LANGUAGE: TSX
CODE:
```
import { View, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import Button from '@/components/Button';
import ImageViewer from '@/components/ImageViewer';

const PlaceholderImage = require('@/assets/images/background-image.png');

export default function Index() {
  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      console.log(result);
    } else {
      alert('You did not select any image.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <ImageViewer imgSource={PlaceholderImage} />
      </View>
      <View style={styles.footerContainer}>
        <Button theme="primary" label="Choose a photo" onPress={/* @tutinfo Add this. */pickImageAsync/* @end */} />
        <Button label="Use this photo" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1,
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: 'center',
  },
});
```

----------------------------------------

TITLE: Start Expo Project - Bash
DESCRIPTION: Run the `npx expo start` command to launch the development server for your Expo project. This will open the Terminal UI where you can choose to run the app on a device or web.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/router/installation.mdx#_snippet_1

LANGUAGE: bash
CODE:
```
$ npx expo start
```

----------------------------------------

TITLE: Setting iOS Permission Messages in app.json
DESCRIPTION: This snippet shows how to customize iOS permission usage descriptions using the `ios.infoPlist` key in `app.json`. This allows developers to provide specific, user-facing explanations for why the app requires access to sensitive data, such as `NSCameraUsageDescription`, which is crucial for App Store approval.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/guides/permissions.mdx#_snippet_3

LANGUAGE: json
CODE:
```
{
  "ios": {
    "infoPlist": {
      "NSCameraUsageDescription": "This app uses the camera to scan barcodes on event tickets."
    }
  }
}
```

----------------------------------------

TITLE: Implementing Tab Navigator with Expo Router
DESCRIPTION: This snippet demonstrates how to set up a tab navigator in Expo Router using the `Tabs` component within a `_layout.tsx` file. It defines a screen named 'index' with a custom title and an icon, allowing other routes in the same directory to appear as tabs. This setup influences the order and appearance of tabs in the bottom tab navigator.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/router/basics/layout.mdx#_snippet_3

LANGUAGE: TypeScript
CODE:
```
import { Tabs } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="house.fill" color={color} />,
        }}
      />
      <!-- Add more tabs here -->
    </Tabs>
  );
}
```

----------------------------------------

TITLE: Generating Dynamic URL Scheme for Stripe Redirects in JavaScript
DESCRIPTION: This JavaScript snippet provides a robust way to generate the `urlScheme` required for `initStripe` to handle browser redirects correctly. It dynamically determines the appropriate scheme using `expo-linking` and `expo-constants`, ensuring proper deep linking behavior in both Expo Go and standalone production builds.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/v51.0.0/sdk/stripe.mdx#_snippet_1

LANGUAGE: javascript
CODE:
```
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';

urlScheme:
  Constants.appOwnership === 'expo'
    ? Linking.createURL('/--/')
    : Linking.createURL(''),
```

----------------------------------------

TITLE: Manually Checking and Applying Expo Updates in React Native
DESCRIPTION: This React Native (JSX) code snippet demonstrates how to manually check for, download, and apply Expo updates. It uses `Updates.checkForUpdateAsync()`, `Updates.fetchUpdateAsync()`, and `Updates.reloadAsync()` to manage the update process, typically triggered by a user action like pressing a button. Error handling is included to alert the user of any issues during the update fetch.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/v53.0.0/sdk/updates.mdx#_snippet_6

LANGUAGE: jsx
CODE:
```
import { View, Button } from 'react-native';
import * as Updates from 'expo-updates';

function App() {
  async function onFetchUpdateAsync() {
    try {
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      }
    } catch (error) {
      // You can also add an alert() to see the error message in case of an error when fetching updates.
      alert(`Error fetching latest Expo update: ${error}`);
    }
  }

  return (
    <View>
      <Button title="Fetch update" onPress={onFetchUpdateAsync} />
    </View>
  );
}
```

----------------------------------------

TITLE: Loading Google Font with useFonts Hook in Expo (TSX)
DESCRIPTION: Illustrates how to use the `useFonts` hook from `@expo-google-fonts/inter` to asynchronously load a Google Font (`Inter_900Black`). Similar to custom fonts, it integrates `expo-splash-screen` to manage app visibility until the font is fully loaded or an error occurs, providing a seamless startup experience.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/develop/user-interface/fonts.mdx#_snippet_10

LANGUAGE: TSX
CODE:
```
// Rest of the import statements
/* @info Import <CODE>Inter_900Black</CODE> and <CODE>useFonts</CODE> hook from <CODE>@expo-google-fonts/inter</CODE>*/
import { Inter_900Black, useFonts } from '@expo-google-fonts/inter';
/* @end */
/* @info Import <CODE>SplashScreen</CODE> so that when the fonts are not loaded, we can continue to show <CODE>SplashScreen</CODE>. */
import * as SplashScreen from 'expo-splash-screen';
/* @end */
import {useEffect} from 'react';

/* @info This prevents <CODE>SplashScreen</CODE> from auto hiding while the fonts are in loading state. */
SplashScreen.preventAutoHideAsync();
/* @end */

export default function RootLayout() {
  /* @info Map the font file using <CODE>useFonts</CODE> hook. */
  const [loaded, error] = useFonts({
    Inter_900Black,
  });
  /* @end */

  useEffect(() => {
    if (loaded || error) {
      /* @info After the custom fonts have loaded, we can hide the splash screen and display the app screen. */
      SplashScreen.hideAsync();
      /* @end */
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    /* @hide ... */ /* @end */
  )
}
```

----------------------------------------

TITLE: Handling Push Notifications with React Navigation (TypeScript)
DESCRIPTION: This snippet shows how to configure the `linking` prop of React Navigation's `NavigationContainer` to handle deep links from push notifications. It defines `getInitialURL` to check for initial deep links and notification responses, and `subscribe` to listen for incoming deep links and notification responses, directing them to the navigation listener.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/unversioned/sdk/notifications.mdx#_snippet_3

LANGUAGE: TypeScript
CODE:
```
import React from 'react';
import { Linking } from 'react-native';
import * as Notifications from 'expo-notifications';
import { NavigationContainer } from '@react-navigation/native';

export default function App() {
  return (
    <NavigationContainer
      linking={{
        config: {
          // Configuration for linking
        },
        async getInitialURL() {
          // First, you may want to do the default deep link handling
          // Check if app was opened from a deep link
          const url = await Linking.getInitialURL();

          if (url != null) {
            return url;
          }

          // Handle URL from expo push notifications
          const response = await Notifications.getLastNotificationResponseAsync();

          return response?.notification.request.content.data.url;
        },
        subscribe(listener) {
          const onReceiveURL = ({ url }: { url: string }) => listener(url);

          // Listen to incoming links from deep linking
          const eventListenerSubscription = Linking.addEventListener('url', onReceiveURL);

          // Listen to expo push notifications
          const subscription = Notifications.addNotificationResponseReceivedListener(response => {
            const url = response.notification.request.content.data.url;

            // Any custom logic to see whether the URL needs to be handled
            //...

            // Let React Navigation handle the URL
            listener(url);
          });

          return () => {
            // Clean up the event listeners
            eventListenerSubscription.remove();
            subscription.remove();
          };
        },
      }}>
      {/* Your app content */}
    </NavigationContainer>
  );
}
```

----------------------------------------

TITLE: Dynamically Configuring app.config.js with Environment Variables (JavaScript)
DESCRIPTION: This `app.config.js` snippet demonstrates how to dynamically set application properties like `name` and `bundleIdentifier` based on the `APP_ENV` environment variable. It allows the application to have different names and bundle identifiers for production and development builds, leveraging environment variables passed from EAS Build profiles.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/build/automate-submissions.mdx#_snippet_1

LANGUAGE: javascript
CODE:
```
export default () => {
  return {
    name: process.env.APP_ENV === 'production' ? 'My App' : 'My App (DEV)',
    ios: {
      bundleIdentifier: process.env.APP_ENV === 'production' ? 'com.my.app' : 'com.my.app-dev',
    },
    // ... other config here
  };
};
```

----------------------------------------

TITLE: Clearing Expo CLI Caches with Yarn on Windows
DESCRIPTION: This snippet provides a sequence of commands to clear various development caches for an Expo CLI project using Yarn on Windows. It includes removing `node_modules`, cleaning Yarn's global cache, reinstalling dependencies, resetting Watchman, deleting temporary haste-map and Metro caches, and finally restarting the Expo development server with cache cleared.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/troubleshooting/clear-cache-windows.mdx#_snippet_0

LANGUAGE: Batch
CODE:
```
# With Yarn workspaces, you may need to delete node_modules in each workspace
$ rm -rf node_modules

$ yarn cache clean

$ yarn

$ watchman watch-del-all

$ del %localappdata%\\Temp\\haste-map-*

$ del %localappdata%\\Temp\\metro-cache

$ npx expo start --clear
```

----------------------------------------

TITLE: Install Firebase JS SDK using Expo CLI
DESCRIPTION: Install the Firebase JavaScript SDK into your Expo project using the Expo CLI's `npx expo install` command. This command ensures compatibility with the current Expo SDK version.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/guides/using-firebase.mdx#_snippet_0

LANGUAGE: Shell
CODE:
```
$ npx expo install firebase
```

----------------------------------------

TITLE: Authenticating with GitHub using expo-auth-session (TypeScript)
DESCRIPTION: This example demonstrates how to authenticate with GitHub using `expo-auth-session`. It utilizes `WebBrowser.maybeCompleteAuthSession()` for dismissing the web popup, `makeRedirectUri()` for creating platform-agnostic redirect URIs, and `useAuthRequest()` to build the authentication request. The `useEffect` hook handles the successful response by extracting the authorization code for server-side exchange. The button is disabled until the request is ready and `promptAsync()` is invoked on press.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/guides/authentication.mdx#_snippet_0

LANGUAGE: TypeScript
CODE:
```
import { useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import { Button } from 'react-native';

/* @info <strong>Web only:</strong> This method should be invoked on the page that the auth popup gets redirected to on web, it'll ensure that authentication is completed properly. On native this does nothing. */
WebBrowser.maybeCompleteAuthSession();
/* @end */

// Endpoint
const discovery = {
  authorizationEndpoint: 'https://github.com/login/oauth/authorize',
  tokenEndpoint: 'https://github.com/login/oauth/access_token',
  revocationEndpoint: 'https://github.com/settings/connections/applications/<CLIENT_ID>',
};

export default function App() {
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: 'CLIENT_ID',
      scopes: ['identity'],
      redirectUri: makeRedirectUri({
        /* @info The URI <code>[scheme]://</code> to be used. If undefined, the <code>scheme</code> property of your app.json or app.config.js will be used instead. */
        scheme: 'your.app'
        /* @end */
      }),
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === 'success') {
      /* @info Exchange the code for an access token in a server. */
      const { code } = response.params;
      /* @end */
    }
  }, [response]);

  return (
    <Button
      /* @info Disable the button until the request is loaded asynchronously. */
      disabled={!request}
      /* @end */
      title="Login"
      onPress={() => {
        /* @info Prompt the user to authenticate in a user interaction or web browsers will block it. */
        promptAsync();
        /* @end */
      }}
    />
  );
}
```

----------------------------------------

TITLE: Configuring iOS Privacy Manifests in Expo app.json
DESCRIPTION: This snippet shows how to configure iOS privacy manifests within the `expo.ios` section of the `app.json` file. It demonstrates declaring accessed API types and their required reasons, specifically for `NSPrivacyAccessedAPICategoryUserDefaults`. This configuration is processed by Expo's build tools to generate the necessary `PrivacyInfo.xcprivacy` file.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/guides/apple-privacy.mdx#_snippet_0

LANGUAGE: JSON
CODE:
```
{
  "expo": {
    "name": "My App",
    "slug": "my-app",
    /* @hide ... */ /* @end */
    "ios": {
      "privacyManifests": {
        "NSPrivacyAccessedAPITypes": [
          {
            "NSPrivacyAccessedAPIType": "NSPrivacyAccessedAPICategoryUserDefaults",
            "NSPrivacyAccessedAPITypeReasons": ["CA92.1"]
          }
        ]
      }
    }
  }
}
```

----------------------------------------

TITLE: Wrapping Custom Components with Link asChild in Expo Router (TypeScript)
DESCRIPTION: This snippet illustrates how to use the `asChild` prop with the `Link` component to wrap non-Text components, such as `Pressable`. When `asChild` is used, the navigation event (e.g., `onPress`) is passed down to the child component, allowing custom components to trigger navigation.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/router/basics/navigation.mdx#_snippet_2

LANGUAGE: tsx
CODE:
```
import { Pressable, Text } from 'react-native';
import { Link } from 'expo-router';

export default function Page() {
  return (
    <Link href="/other" asChild>
      <Pressable>
        <Text>Home</Text>
      </Pressable>
    </Link>
  );
}
```

----------------------------------------

TITLE: Loading Custom Fonts with useFonts Hook in React Native (Expo)
DESCRIPTION: Demonstrates how to load a custom font ('Inter-Black.otf') at runtime using the `useFonts` hook from 'expo-font' in an Expo React Native application. It also shows how to manage the splash screen visibility while fonts are loading.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/v53.0.0/sdk/font.mdx#_snippet_1

LANGUAGE: tsx
CODE:
```
/* @info Import useFonts hook from 'expo-font'. */ import { useFonts } from 'expo-font'; /* @end */
/* @info Also, import SplashScreen so that when the fonts are not loaded, we can continue to show SplashScreen. */ import * as SplashScreen from 'expo-splash-screen'; /* @end */
import { useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';

/* @info This prevents SplashScreen from auto hiding while the fonts are loaded. */
SplashScreen.preventAutoHideAsync();
/* @end */

export default function App() {
  // Use `useFonts` only if you can't use the config plugin.
  const [loaded, error] = useFonts({
    'Inter-Black': require('./assets/fonts/Inter-Black.otf'),
  });

  useEffect(() => {
    if (loaded || error) {
      /* @info After the custom fonts have loaded, we can hide the splash screen and display the app screen. */
      SplashScreen.hideAsync();
      /* @end */
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={{ fontFamily: 'Inter-Black', fontSize: 30 }}>Inter Black</Text>
      <Text style={{ fontSize: 30 }}>Platform Default</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

----------------------------------------

TITLE: Nesting Tab Navigator in Root Stack Layout (TSX)
DESCRIPTION: This code updates the root layout file (`app/_layout.tsx`) to integrate the tab navigator. It uses an `Expo Router` `Stack` component and includes a `Stack.Screen` named `(tabs)`, making the previously defined tab navigator the initial and primary route of the application. This ensures the tab-based navigation is accessible from the app's entry point.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/develop/file-based-routing.mdx#_snippet_8

LANGUAGE: tsx
CODE:
```
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
```

----------------------------------------

TITLE: Redirecting with Redirect Component in Expo Router (TypeScript)
DESCRIPTION: This snippet demonstrates how to perform an immediate, declarative redirect using the `Redirect` component in Expo Router. It checks for user authentication status and, if the user is not logged in, redirects them to the `/login` screen. This method is suitable for conditional rendering based on application state.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/router/reference/redirects.mdx#_snippet_0

LANGUAGE: tsx
CODE:
```
import { View, Text } from 'react-native';
import { Redirect } from 'expo-router';

export default function Page() {
  const { user } = useAuth();

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <View>
      <Text>Welcome Back!</Text>
    </View>
  );
}
```

----------------------------------------

TITLE: Create Animated Style for Image Scaling (React Native TSX)
DESCRIPTION: Defines an animated style object `imageStyle` using `useAnimatedStyle()`. This hook creates a style that can be updated based on shared values. It uses `withSpring()` to apply a spring animation to the `width` and `height` properties, driven by the `scaleImage.value`.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/tutorial/gestures.mdx#_snippet_4

LANGUAGE: tsx
CODE:
```
const imageStyle = useAnimatedStyle(() => {
  return {
    width: withSpring(scaleImage.value),
    height: withSpring(scaleImage.value),
  };
});
```

----------------------------------------

TITLE: Start Development Server (Bash)
DESCRIPTION: Starts the local development server for the Expo project using `npx expo start`, which is required to run the development build and generate the ExpoPushToken for testing.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/push-notifications/push-notifications-setup.mdx#_snippet_8

LANGUAGE: bash
CODE:
```
$ npx expo start
```

----------------------------------------

TITLE: Enhancing Button Component with Theming and Icons (TypeScript)
DESCRIPTION: This snippet modifies a React Native `Button` component to support a `primary` theme and integrate `FontAwesome` icons from `@expo/vector-icons`. It conditionally renders different styles and includes an icon based on the `theme` prop, demonstrating the use of inline styling to override default styles for the primary variant. The `label` prop defines the button's text, and `theme` (optional) applies specific styling.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/tutorial/build-a-screen.mdx#_snippet_6

LANGUAGE: TypeScript
CODE:
```
import { StyleSheet, View, Pressable, Text } from 'react-native';
/* @tutinfo Import FontAwesome. */import FontAwesome from '@expo/vector-icons/FontAwesome';/* @end */

type Props = {
  label: string;
  theme?: 'primary';
};

export default function Button({ label, /* @tutinfo The prop <CODEtheme</CODE> to detect the button variant. */theme/* @end */ }: Props) {
  /* @tutinfo Conditionally render the primary themed button. */
  if (theme === 'primary') {
  /* @end */
  /* @tutinfo */
    return (
      <View
        style={[
          styles.buttonContainer,
          { borderWidth: 4, borderColor: '#ffd33d', borderRadius: 18 },
        ]}>
        <Pressable
          style={[styles.button, { backgroundColor: '#fff' }]}
          onPress={() => alert('You pressed a button.')}>
          <FontAwesome name="picture-o" size={18} color="#25292e" style={styles.buttonIcon} />
          <Text style={[styles.buttonLabel, { color: '#25292e' }]}>{label}</Text>
        </Pressable>
      </View>
    );
  /* @end */
  /* @tutinfo */
  }
  /* @end */

  return (
    <View style={styles.buttonContainer}>
      <Pressable style={styles.button} onPress={() => alert('You pressed a button.')}>
        <Text style={styles.buttonLabel}>{label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: 320,
    height: 68,
    marginHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  button: {
    borderRadius: 10,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  /* @tutinfo Conditionally render the primary themed button. */
  buttonIcon: {
    paddingRight: 8,
  },
  /* @end */
  buttonLabel: {
    color: '#fff',
    fontSize: 16,
  },
});
```

----------------------------------------

TITLE: Performing Basic CRUD Operations with expo-sqlite (JavaScript)
DESCRIPTION: This comprehensive example demonstrates fundamental database operations using `expo-sqlite`. It covers opening a database, executing multiple SQL commands with `execAsync`, performing insert/update/delete operations with `runAsync` using both unnamed and named parameter binding, and retrieving data using `getFirstAsync` for single rows, `getAllAsync` for all results, and `getEachAsync` for iterating over results.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/unversioned/sdk/sqlite.mdx#_snippet_2

LANGUAGE: js
CODE:
```
const db = await SQLite.openDatabaseAsync('databaseName');

// `execAsync()` is useful for bulk queries when you want to execute altogether.
// Note that `execAsync()` does not escape parameters and may lead to SQL injection.
await db.execAsync(`
PRAGMA journal_mode = WAL;
CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY NOT NULL, value TEXT NOT NULL, intValue INTEGER);
INSERT INTO test (value, intValue) VALUES ('test1', 123);
INSERT INTO test (value, intValue) VALUES ('test2', 456);
INSERT INTO test (value, intValue) VALUES ('test3', 789);
`);

// `runAsync()` is useful when you want to execute some write operations.
const result = await db.runAsync('INSERT INTO test (value, intValue) VALUES (?, ?)', 'aaa', 100);
console.log(result.lastInsertRowId, result.changes);
await db.runAsync('UPDATE test SET intValue = ? WHERE value = ?', 999, 'aaa'); // Binding unnamed parameters from variadic arguments
await db.runAsync('UPDATE test SET intValue = ? WHERE value = ?', [999, 'aaa']); // Binding unnamed parameters from array
await db.runAsync('DELETE FROM test WHERE value = $value', { $value: 'aaa' }); // Binding named parameters from object

// `getFirstAsync()` is useful when you want to get a single row from the database.
const firstRow = await db.getFirstAsync('SELECT * FROM test');
console.log(firstRow.id, firstRow.value, firstRow.intValue);

// `getAllAsync()` is useful when you want to get all results as an array of objects.
const allRows = await db.getAllAsync('SELECT * FROM test');
for (const row of allRows) {
  console.log(row.id, row.value, row.intValue);
}

// `getEachAsync()` is useful when you want to iterate SQLite query cursor.
for await (const row of db.getEachAsync('SELECT * FROM test')) {
  console.log(row.id, row.value, row.intValue);
}
```

----------------------------------------

TITLE: Rewriting Native Deep Links with redirectSystemPath in Expo Router
DESCRIPTION: This snippet demonstrates how to use the `redirectSystemPath` function within `app/+native-intent.tsx` to rewrite incoming native deep links. It processes URLs, especially those from third-party providers, to ensure they correctly target app routes. It handles potential errors by redirecting to a custom error route, preventing app crashes.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/router/advanced/native-intent.mdx#_snippet_0

LANGUAGE: TypeScript
CODE:
```
import ThirdPartyService from 'third-party-sdk';

export function redirectSystemPath({ path, initial }) {
  try {
    if (initial) {
      // While the parameter is called `path` there is no guarantee that this is a path or a valid URL
      const url = new URL(path, 'myapp://app.home');
      // Detection of third-party URLs will change based on the provider
      if (url.hostname === '<third-party-provider-hostname>') {
        return ThirdPartyService.processReferringUrl(url).catch(() => {
          // Something went wrong
          return '/unexpected-error';
        });
      }
      return path;
    }
    return path;
  } catch {
    // Do not crash inside this function! Instead you should redirect users
    // to a custom route to handle unexpected errors, where they are able to report the incident
    return '/unexpected-error';
  }
}
```

----------------------------------------

TITLE: Universal Safe Area Handling with useSafeAreaInsets Hook (JSX)
DESCRIPTION: This snippet demonstrates the universal approach to handling safe area insets using the `useSafeAreaInsets` hook from `react-native-safe-area-context`. It replaces the platform-specific CSS environment variables by providing a consistent way to access `top`, `left`, `bottom`, and `right` inset values, which are then applied as padding to a `View` component, making the UI adaptable across various devices and platforms.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/unversioned/sdk/safe-area-context.mdx#_snippet_7

LANGUAGE: jsx
CODE:
```
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function App() {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        paddingTop: insets.top,
        paddingLeft: insets.left,
        paddingBottom: insets.bottom,
        paddingRight: insets.right,
      }}
    />
  );
}
```

----------------------------------------

TITLE: Defining EAS Workflow for Android Build and Submission (YAML)
DESCRIPTION: This YAML workflow defines an automated CI/CD pipeline for an Android app using EAS Workflows. It first builds the Android app on `push` to the `main` branch and then, upon successful build, automatically submits it to the Google Play Store using the generated build ID.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/submit/android.mdx#_snippet_9

LANGUAGE: YAML
CODE:
```
on:
  push:
    branches: ['main']

jobs:
  build_android:
    name: Build Android app
    type: build
    params:
      platform: android
      profile: production

  # @info #
  submit_android:
    name: Submit to Google Play Store
    needs: [build_android]
    type: submit
    params:
      platform: android
      build_id: ${{ needs.build_android.outputs.build_id }}
  # @end #
```

----------------------------------------

TITLE: Implementing Apple Sign-In with Expo Apple Authentication in React Native
DESCRIPTION: This comprehensive React Native example demonstrates how to integrate and use `expo-apple-authentication`. It shows how to render an `AppleAuthenticationButton`, configure its appearance, and handle the `signInAsync` method, including requesting user scopes (full name, email) and managing potential errors like user cancellation.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/v53.0.0/sdk/apple-authentication.mdx#_snippet_3

LANGUAGE: jsx
CODE:
```
import * as AppleAuthentication from 'expo-apple-authentication';
import { View, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={5}
        style={styles.button}
        onPress={async () => {
          try {
            const credential = await AppleAuthentication.signInAsync({
              requestedScopes: [
                AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                AppleAuthentication.AppleAuthenticationScope.EMAIL,
              ],
            });
            // signed in
          } catch (e) {
            if (e.code === 'ERR_REQUEST_CANCELED') {
              // handle that the user canceled the sign-in flow
            } else {
              // handle other errors
            }
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: 200,
    height: 44,
  },
});
```

----------------------------------------

TITLE: Creating New Expo Project with Yarn
DESCRIPTION: This command initializes a new Expo and React Native project using `yarn create`. It's the recommended way to start a new project with Yarn, leveraging Yarn's package creation capabilities.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/more/create-expo.mdx#_snippet_1

LANGUAGE: Yarn
CODE:
```
$ yarn create expo-app
```

----------------------------------------

TITLE: Ignoring Local Environment Files in Git
DESCRIPTION: This .gitignore entry specifies a pattern to exclude local environment variable files (e.g., .env.local) from version control. This is crucial for security and consistency, as these files often contain machine-specific or sensitive configurations that should not be committed to the repository.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/guides/environment-variables.mdx#_snippet_2

LANGUAGE: bash
CODE:
```
.env*.local
```

----------------------------------------

TITLE: Create New Expo App with Router - Bash
DESCRIPTION: Use the `create-expo-app` command to initialize a new Expo project with Expo Router pre-installed and configured. This is the recommended quick start method.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/router/installation.mdx#_snippet_0

LANGUAGE: bash
CODE:
```
$ npx create-expo-app@latest
```

----------------------------------------

TITLE: Basic React Native Component with Text Display (TypeScript)
DESCRIPTION: This snippet demonstrates a basic React Native functional component that renders 'Hello world!' text within a `View`. It uses `StyleSheet` for basic centering and background styling. The inline comments highlight a specific change made for the tutorial's demonstration purposes.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/tutorial/introduction.mdx#_snippet_0

LANGUAGE: TypeScript
CODE:
```
import { StyleSheet, Text, View } from 'react-native';

export default function Index() {
  return (
    <View style={styles.container}>
      /* @tutinfo This used to say: "Edit app/index.tsx to edit this screen.". Now it says: "Hello world!". */<Text>Hello world!</Text>/* @end */
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

----------------------------------------

TITLE: Defining a Grouped Layout with Stack Navigator in Expo Router - TypeScript
DESCRIPTION: This snippet defines a layout file for a route group, `app/(home)/_layout.tsx`. It encapsulates a `Stack` navigator specifically for the 'index' and 'details' routes within the '(home)' group. This allows for applying specific screen options and navigation logic only to routes belonging to this group, isolating their UI configuration.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/develop/file-based-routing.mdx#_snippet_5

LANGUAGE: tsx
CODE:
```
import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#f4511e',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="details" />
    </Stack>
  );
}
```

----------------------------------------

TITLE: Defining a Root Layout Component in Expo Router - TypeScript
DESCRIPTION: This snippet shows the basic structure of a root layout file (`app/_layout.tsx`) in Expo Router. This component serves as the single root component for the application, allowing for shared UI elements, global providers, and initial navigation structure definition across all routes.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/develop/file-based-routing.mdx#_snippet_1

LANGUAGE: tsx
CODE:
```
export default function RootLayout() {
  return (
	  /* @hide ... */ /* @end */
  )
}
```

----------------------------------------

TITLE: Writing a Basic Component Unit Test with React Native Testing Library (TSX)
DESCRIPTION: Located in `__tests__/HomeScreen-test.tsx`, this snippet shows a basic unit test for the `HomeScreen` component. It uses `@testing-library/react-native`'s `render` function and `getByText` query to verify that the 'Welcome!' text is rendered correctly within the component.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/develop/unit-testing.mdx#_snippet_9

LANGUAGE: tsx
CODE:
```
import { render } from '@testing-library/react-native';

import HomeScreen, { CustomText } from '@/app/index';

describe('<HomeScreen />', () => {
  test('Text renders correctly on HomeScreen', () => {
    const { getByText } = render(<HomeScreen />);

    getByText('Welcome!');
  });
});
```

----------------------------------------

TITLE: Full Localization Example with React Native and i18n-js
DESCRIPTION: This comprehensive example demonstrates integrating `expo-localization` and `i18n-js` within a React Native application. It sets up translations, dynamically determines the app's locale, enables fallback for missing translations, and displays localized text along with current and device locales. It also includes basic styling for the UI.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/guides/localization.mdx#_snippet_4

LANGUAGE: tsx
CODE:
```
import { View, StyleSheet, Text } from 'react-native';
import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';

// Set the key-value pairs for the different languages you want to support.
const translations = {
  en: { welcome: 'Hello', name: 'Charlie' },
  ja: { welcome: 'こんにちは' }
};
const i18n = new I18n(translations);

// Set the locale once at the beginning of your app.
i18n.locale = getLocales()[0].languageCode ?? 'en';

// When a value is missing from a language it'll fall back to another language with the key present.
i18n.enableFallback = true;
// To see the fallback mechanism uncomment the line below to force the app to use the Japanese language.
// i18n.locale = 'ja';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {i18n.t('welcome')} {i18n.t('name')}
      </Text>
      <Text>Current locale: {i18n.locale}</Text>
      <Text>Device locale: {getLocales()[0].languageCode}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  text: {
    fontSize: 20,
    marginBottom: 16
  }
});
```

----------------------------------------

TITLE: Performing Basic CRUD Operations with expo-sqlite
DESCRIPTION: This JavaScript snippet illustrates fundamental database operations including opening a database, executing bulk queries with execAsync, performing write operations with runAsync (demonstrating parameter binding), and retrieving data using getFirstAsync, getAllAsync, and getEachAsync.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/v52.0.0/sdk/sqlite.mdx#_snippet_2

LANGUAGE: javascript
CODE:
```
const db = await SQLite.openDatabaseAsync('databaseName');

// `execAsync()` is useful for bulk queries when you want to execute altogether.
// Note that `execAsync()` does not escape parameters and may lead to SQL injection.
await db.execAsync(`
PRAGMA journal_mode = WAL;
CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY NOT NULL, value TEXT NOT NULL, intValue INTEGER);
INSERT INTO test (value, intValue) VALUES ('test1', 123);
INSERT INTO test (value, intValue) VALUES ('test2', 456);
INSERT INTO test (value, intValue) VALUES ('test3', 789);
`);

// `runAsync()` is useful when you want to execute some write operations.
const result = await db.runAsync('INSERT INTO test (value, intValue) VALUES (?, ?)', 'aaa', 100);
console.log(result.lastInsertRowId, result.changes);
await db.runAsync('UPDATE test SET intValue = ? WHERE value = ?', 999, 'aaa'); // Binding unnamed parameters from variadic arguments
await db.runAsync('UPDATE test SET intValue = ? WHERE value = ?', [999, 'aaa']); // Binding unnamed parameters from array
await db.runAsync('DELETE FROM test WHERE value = $value', { $value: 'aaa' }); // Binding named parameters from object

// `getFirstAsync()` is useful when you want to get a single row from the database.
const firstRow = await db.getFirstAsync('SELECT * FROM test');
console.log(firstRow.id, firstRow.value, firstRow.intValue);

// `getAllAsync()` is useful when you want to get all results as an array of objects.
const allRows = await db.getAllAsync('SELECT * FROM test');
for (const row of allRows) {
  console.log(row.id, row.value, row.intValue);
}

// `getEachAsync()` is useful when you want to iterate SQLite query cursor.
for await (const row of db.getEachAsync('SELECT * FROM test')) {
  console.log(row.id, row.value, row.intValue);
}
```

----------------------------------------

TITLE: Setting up SafeAreaProvider in React Native App Root (JSX)
DESCRIPTION: This code demonstrates how to wrap the root component of a React Native application with `SafeAreaProvider`. This provider is essential for the `useSafeAreaInsets` hook and `SafeAreaInsetsContext.Consumer` to function correctly, making safe area inset data available throughout the component tree. It may also be required for modals or routes when using `react-native-screen`.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/unversioned/sdk/safe-area-context.mdx#_snippet_3

LANGUAGE: jsx
CODE:
```
import { SafeAreaProvider } from 'react-native-safe-area-context';

function App() {
  return <SafeAreaProvider>...</SafeAreaProvider>;
}
```

----------------------------------------

TITLE: EAS CLI and Build Profile Schema Definition (JSON)
DESCRIPTION: This snippet illustrates the top-level schema for eas.json, defining the 'cli' section for EAS CLI configuration (e.g., version, commit requirements) and the 'build' section for custom build profiles. It shows placeholders for common and platform-specific options for Android and iOS builds.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/build/eas-json.mdx#_snippet_8

LANGUAGE: json
CODE:
```
{
  "cli": {
    "version": "SEMVER_RANGE",
    "requireCommit": true,
    "appVersionSource": "local",
    "promptToConfigurePushNotifications": true
  },
  "build": {
    "BUILD_PROFILE_NAME_1": {
      "android": {},
      "ios": {}
    },
    "BUILD_PROFILE_NAME_2": {}
  }
}
```

----------------------------------------

TITLE: Start Expo Development Server (Shell)
DESCRIPTION: Runs the command to start the Expo development server, which compiles the project and makes it available for testing on devices or simulators connected to the same network.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/get-started/start-developing.mdx#_snippet_0

LANGUAGE: shell
CODE:
```
$ npx expo start
```

----------------------------------------

TITLE: Creating a New React Native App with Expo SDK Support
DESCRIPTION: Provides the command to create a new React Native project (`my-app`) using `npx create-expo-app` with the `--template bare-minimum` flag. This is the recommended way to start a new project with Expo SDK support.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/v51.0.0/index.mdx#_snippet_2

LANGUAGE: Terminal
CODE:
```
# Create a project named my-app
$ npx create-expo-app my-app --template bare-minimum
```

----------------------------------------

TITLE: Example app.json Configuration File (JSON)
DESCRIPTION: Provides a simple example of an `app.json` file, defining the basic `name` property for the application. This file is read by Expo CLI before processing `app.config.js`.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/workflow/configuration.mdx#_snippet_3

LANGUAGE: JSON
CODE:
```
{
  "name": "My App"
}
```

----------------------------------------

TITLE: Creating a Basic Counter Component with React and ReactDOM
DESCRIPTION: This snippet demonstrates how to create a simple functional React component using `useState` for state management and render it to the DOM using `createRoot` from `react-dom/client`. It shows a counter that increments on button click, illustrating basic component definition and rendering.
SOURCE: https://github.com/expo/expo/blob/main/packages/@expo/cli/static/canary-full/react/README.md#_snippet_0

LANGUAGE: JavaScript
CODE:
```
import { useState } from 'react';
import { createRoot } from 'react-dom/client';

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <>
      <h1>{count}</h1>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<Counter />);
```

----------------------------------------

TITLE: Automating Production Builds with EAS Workflows (YAML)
DESCRIPTION: This YAML configuration defines an EAS Workflow that automates the creation of Android and iOS production builds. The workflow is triggered on every commit to the `main` branch, enabling continuous integration for your app builds.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/deploy/build-project.mdx#_snippet_5

LANGUAGE: yaml
CODE:
```
name: Create builds

on:
  push:
    branches: ['main']

jobs:
  build_android:
    name: Build Android app
    type: build
    params:
      platform: android
      profile: production
  build_ios:
    name: Build iOS app
    type: build
    params:
      platform: ios
      profile: production
```

----------------------------------------

TITLE: Upgrade Expo Dependencies
DESCRIPTION: Upgrades all project dependencies to ensure they are compatible with the currently installed Expo SDK version. This command helps fix potential version mismatches.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/workflow/upgrading-expo-sdk-walkthrough.mdx#_snippet_2

LANGUAGE: shell
CODE:
```
$ npx expo install --fix
```

----------------------------------------

TITLE: Importing Constants from expo-constants (JavaScript)
DESCRIPTION: This snippet imports the `Constants` object from the `expo-constants` package. The `Constants` object provides access to system information that remains constant throughout the app's installation lifecycle, such as app version, device ID, and platform details. It is a fundamental step for utilizing the `expo-constants` API.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/v51.0.0/sdk/constants.mdx#_snippet_0

LANGUAGE: javascript
CODE:
```
import Constants from 'expo-constants';
```

----------------------------------------

TITLE: Defining a Standalone Server Function in Expo
DESCRIPTION: This snippet shows how to define a standalone server function (`components/server-actions.tsx`) by placing `'use server'` at the top of the file. This function can then be imported and called from client components, centralizing server-side actions.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/guides/server-components.mdx#_snippet_7

LANGUAGE: tsx
CODE:
```
'use server';

export async function callAction() {
  // ...
}
```

----------------------------------------

TITLE: Keeping Splash Screen Visible While Loading Resources in React Native
DESCRIPTION: This example demonstrates how to use `expo-splash-screen` to prevent the splash screen from auto-hiding while asynchronous tasks like font loading or API calls are in progress. It sets up a state variable to track readiness and hides the splash screen only after the initial view has rendered, preventing a blank screen flash. Requires `expo-splash-screen`, `react`, `react-native`, `@expo/vector-icons`, and `expo-font`.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/v53.0.0/sdk/splash-screen.mdx#_snippet_0

LANGUAGE: jsx
CODE:
```
import { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Set the animation options. This is optional.
SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        await Font.loadAsync(Entypo.font);
        // Artificially delay for two seconds to simulate a slow loading
        // experience. Remove this if you copy and paste the code!
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(() => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately! If we call this after
      // `setAppIsReady`, then we may see a blank screen while the app is
      // loading its initial state and rendering its first pixels. So instead,
      // we hide the splash screen once we know the root view has already
      // performed layout.
      SplashScreen.hide();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <View
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      onLayout={onLayoutRootView}>
      <Text>SplashScreen Demo! 👋</Text>
      <Entypo name="rocket" size={30} />
    </View>
  );
}
```

----------------------------------------

TITLE: Implementing Platform-Specific Image Saving Logic (React Native/TypeScript)
DESCRIPTION: This code snippet shows the implementation of the main screen component in an Expo app, focusing on the `onSaveImageAsync` function. It demonstrates how to use `Platform.OS` to check the current platform and execute different image saving logic: using `captureRef` from `react-native-view-shot` for native platforms (iOS/Android) and `domtoimage.toJpeg` for the web platform.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/tutorial/platform-differences.mdx#_snippet_1

LANGUAGE: tsx
CODE:
```
import { ImageSourcePropType, View, StyleSheet, /* @tutinfo */Platform/* @end */ } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useState, useRef } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as MediaLibrary from 'expo-media-library';
import { captureRef } from 'react-native-view-shot';
/* @tutinfo Import <CODE>domtoimage</CODE> library. */import domtoimage from 'dom-to-image';/* @end */

import Button from '@/components/Button';
import ImageViewer from '@/components/ImageViewer';
import IconButton from '@/components/IconButton';
import CircleButton from '@/components/CircleButton';
import EmojiPicker from '@/components/EmojiPicker';
import EmojiList from '@/components/EmojiList';
import EmojiSticker from '@/components/EmojiSticker';

const PlaceholderImage = require('@/assets/images/background-image.png');

export default function Index() {
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
  const [showAppOptions, setShowAppOptions] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [pickedEmoji, setPickedEmoji] = useState<ImageSourcePropType | undefined>(undefined);
  const [status, requestPermission] = MediaLibrary.usePermissions();
  const imageRef = useRef<View>(null);

  if (status === null) {
    requestPermission();
  }

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setShowAppOptions(true);
    } else {
      alert('You did not select any image.');
    }
  };

  const onReset = () => {
    setShowAppOptions(false);
  };

  const onAddSticker = () => {
    setIsModalVisible(true);
  };

  const onModalClose = () => {
    setIsModalVisible(false);
  };

  const onSaveImageAsync = async () => {
    /* @tutinfo Add the if condition here to check whether the current platform is web or not. */
    if (Platform.OS !== 'web') {
    /* @end */
      try {
        const localUri = await captureRef(imageRef, {
          height: 440,
          quality: 1,
        });

        await MediaLibrary.saveToLibraryAsync(localUri);
        if (localUri) {
          alert('Saved!');
        }
      } catch (e) {
        console.log(e);
      }
    /* @tutinfo Add an else condition to run the logic when the current platform is the web. */
    } else {
      try {
        const dataUrl = await domtoimage.toJpeg(imageRef.current, {
          quality: 0.95,
          width: 320,
          height: 440,
        });

        let link = document.createElement('a');
        link.download = 'sticker-smash.jpeg';
        link.href = dataUrl;
        link.click();
      } catch (e) {
        console.log(e);
      }
    }
    /* @end */
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.imageContainer}>
        <View ref={imageRef} collapsable={false}>
          <ImageViewer imgSource={PlaceholderImage} selectedImage={selectedImage} />
          {pickedEmoji && <EmojiSticker imageSize={40} stickerSource={pickedEmoji} />}
        </View>
      </View>
      {showAppOptions ? (
        <View style={styles.optionsContainer}>
          <View style={styles.optionsRow}>
            <IconButton icon="refresh" label="Reset" onPress={onReset} />
            <CircleButton onPress={onAddSticker} />
            <IconButton icon="save-alt" label="Save" onPress={onSaveImageAsync} />
          </View>
        </View>
      ) : (
        <View style={styles.footerContainer}>
          <Button theme="primary" label="Choose a photo" onPress={pickImageAsync} />
          <Button label="Use this photo" onPress={() => setShowAppOptions(true)} />
        </View>
      )}
      <EmojiPicker isVisible={isModalVisible} onClose={onModalClose}>
        <EmojiList onSelect={setPickedEmoji} onCloseModal={onModalClose} />
      </EmojiPicker>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1,
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: 'center',
  },

```

----------------------------------------

TITLE: Downloading Files with FileSystem (next) in TypeScript
DESCRIPTION: This example illustrates how to download a file from a URL to a specified directory using `File.downloadFileAsync`. It creates a destination directory, downloads a PDF, and then logs whether the file exists and its local URI, demonstrating robust file download capabilities.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/v52.0.0/sdk/filesystem-next.mdx#_snippet_1

LANGUAGE: typescript
CODE:
```
import { File, Paths } from 'expo-file-system/next';

const url = 'https://pdfobject.com/pdf/sample.pdf';
const destination = new Directory(Paths.cache, 'pdfs');
try {
  destination.create();
  const output = await File.downloadFileAsync(url, destination);
  console.log(output.exists); // true
  console.log(output.uri); // path to the downloaded file, e.g. '${cacheDirectory}/pdfs/sample.pdf'
} catch (error) {
  console.error(error);
}
```

----------------------------------------

TITLE: Importing Core Components and Hooks from react-native-safe-area-context (JS)
DESCRIPTION: This snippet demonstrates how to import the main components and hooks provided by the `react-native-safe-area-context` library. These include `SafeAreaView` for automatic safe area padding, `SafeAreaProvider` for context provision, `SafeAreaInsetsContext` for consumer-based access, and `useSafeAreaInsets` hook for direct inset values.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/unversioned/sdk/safe-area-context.mdx#_snippet_0

LANGUAGE: js
CODE:
```
import {
  SafeAreaView,
  SafeAreaProvider,
  SafeAreaInsetsContext,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
```

----------------------------------------

TITLE: Importing DocumentPicker Module (JavaScript)
DESCRIPTION: This JavaScript snippet demonstrates the standard way to import the `expo-document-picker` module into a project. It imports all exports from the module as `DocumentPicker`, making its functions and constants accessible for use in the application.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/v52.0.0/sdk/document-picker.mdx#_snippet_2

LANGUAGE: js
CODE:
```
import * as DocumentPicker from 'expo-document-picker';
```

----------------------------------------

TITLE: Importing Linking Module - JavaScript
DESCRIPTION: This snippet shows the standard way to import the `expo-linking` module in a JavaScript or TypeScript project. The `Linking` object provides access to all the API methods for interacting with deep links and other installed applications.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/v51.0.0/sdk/linking.mdx#_snippet_0

LANGUAGE: javascript
CODE:
```
import * as Linking from 'expo-linking';
```

----------------------------------------

TITLE: Defining EAS Build and Submit Workflow (YAML)
DESCRIPTION: This YAML configuration defines an EAS Workflow named "Build and submit". It triggers on pushes to the `main` branch and includes jobs to build production versions of both Android and iOS apps (`build_android`, `build_ios`) and then submit them to their respective stores (`submit_android`, `submit_ios`) using the build IDs from the build jobs.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/deploy/submit-to-app-stores.mdx#_snippet_8

LANGUAGE: YAML
CODE:
```
name: Build and submit

on:
  push:
    branches: ['main']

jobs:
  build_android:
    name: Build Android app
    type: build
    params:
      platform: android
      profile: production
  build_ios:
    name: Build iOS app
    type: build
    params:
      platform: ios
      profile: production
  submit_android:
    name: Submit Android
    type: submit
    needs: [build_android]
    params:
      build_id: ${{ needs.build_android.outputs.build_id }}
  submit_ios:
    name: Submit iOS
    type: submit
    needs: [build_ios]
    params:
      build_id: ${{ needs.build_ios.outputs.build_id }}
```

----------------------------------------

TITLE: Setting Custom Runtime Version in Expo
DESCRIPTION: This snippet demonstrates how to manually set a custom runtime version in your project's `app.json` or `app.config.js` file. This approach provides complete control over which updates are compatible with specific builds, independent of other version numbers in the project.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/eas-update/runtime-versions.mdx#_snippet_0

LANGUAGE: json
CODE:
```
{
  "expo": {
    "runtimeVersion": "1.0.0"
  }
}
```

----------------------------------------

TITLE: Starting Expo Development Server - Expo CLI - Shell
DESCRIPTION: This command starts the Expo development server, which compiles and serves the application. It generates a QR code for opening the app on physical devices via Expo Go and allows launching the web version by pressing 'w' in the terminal. This is essential for live development and testing across multiple platforms.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/tutorial/create-your-first-app.mdx#_snippet_2

LANGUAGE: Shell
CODE:
```
$ npx expo start
```

----------------------------------------

TITLE: Initializing SQLite Database with `useSQLiteContext` Hook (TypeScript)
DESCRIPTION: This snippet demonstrates how to initialize an SQLite database using `SQLiteProvider` and interact with it via the `useSQLiteContext` hook in an Expo React Native application. It includes examples of database migration, fetching SQLite version, and displaying data.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/unversioned/sdk/sqlite.mdx#_snippet_4

LANGUAGE: tsx
CODE:
```
import { SQLiteProvider, useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <SQLiteProvider databaseName="test.db" onInit={migrateDbIfNeeded}>
        <Header />
        <Content />
      </SQLiteProvider>
    </View>
  );
}

export function Header() {
  const db = useSQLiteContext();
  const [version, setVersion] = useState('');
  useEffect(() => {
    async function setup() {
      const result = await db.getFirstAsync<{ 'sqlite_version()': string }>(
        'SELECT sqlite_version()'
      );
      setVersion(result['sqlite_version()']);
    }
    setup();
  }, []);
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerText}>SQLite version: {version}</Text>
    </View>
  );
}

interface Todo {
  value: string;
  intValue: number;
}

export function Content() {
  const db = useSQLiteContext();
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    async function setup() {
      const result = await db.getAllAsync<Todo>('SELECT * FROM todos');
      setTodos(result);
    }
    setup();
  }, []);

  return (
    <View style={styles.contentContainer}>
      {todos.map((todo, index) => (
        <View style={styles.todoItemContainer} key={index}>
          <Text>{`${todo.intValue} - ${todo.value}`}</Text>
        </View>
      ))}
    </View>
  );
}

async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const DATABASE_VERSION = 1;
  let { user_version: currentDbVersion } = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version'
  );
  if (currentDbVersion >= DATABASE_VERSION) {
    return;
  }
  if (currentDbVersion === 0) {
    await db.execAsync(`
PRAGMA journal_mode = 'wal';
CREATE TABLE todos (id INTEGER PRIMARY KEY NOT NULL, value TEXT NOT NULL, intValue INTEGER);
`);
    await db.runAsync('INSERT INTO todos (value, intValue) VALUES (?, ?)', 'hello', 1);
    await db.runAsync('INSERT INTO todos (value, intValue) VALUES (?, ?)', 'world', 2);
    currentDbVersion = 1;
  }
  // if (currentDbVersion === 1) {
  //   Add more migrations
  // }
  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}

const styles = StyleSheet.create({
  // Your styles...
});
```

----------------------------------------

TITLE: Creating an Authentication Context Provider (TypeScript)
DESCRIPTION: This snippet defines a React Context provider (`SessionProvider`) that exposes authentication-related functions (`signIn`, `signOut`) and state (`session`, `isLoading`) to the entire application. It uses a mock implementation for demonstration purposes, which can be replaced with a real authentication provider. The `useSession` hook is provided to easily access the authentication context from any component.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/router/advanced/authentication.mdx#_snippet_0

LANGUAGE: tsx
CODE:
```
import { use, createContext, type PropsWithChildren } from 'react';
import { useStorageState } from './useStorageState';

const AuthContext = createContext<{
  signIn: () => void;
  signOut: () => void;
  session?: string | null;
  isLoading: boolean;
}> ({
  signIn: () => null,
  signOut: () => null,
  session: null,
  isLoading: false,
});

// This hook can be used to access the user info.
export function useSession() {
  const value = use(AuthContext);
  if (!value) {
    throw new Error('useSession must be wrapped in a <SessionProvider />');
  }

  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState('session');

  return (
    <AuthContext
      value={{
        signIn: () => {
          // Perform sign-in logic here
          setSession('xxx');
        },
        signOut: () => {
          setSession(null);
        },
        session,
        isLoading,
      }}>
      {children}
    </AuthContext>
  );
}
```

----------------------------------------

TITLE: Using Prepared Statements for Efficient Database Operations in TypeScript
DESCRIPTION: This snippet demonstrates how to use prepared statements in `expo-sqlite` for efficient, repeated query execution with different parameters. It covers preparing a statement with `prepareAsync`, executing it multiple times with `executeAsync` (using named parameters), and crucially, finalizing the statement with `finalizeAsync` within a `try-finally` block to ensure resource release. It also shows how to fetch results from a prepared statement's execution, including resetting the cursor.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/v53.0.0/sdk/sqlite.mdx#_snippet_3

LANGUAGE: typescript
CODE:
```
const statement = await db.prepareAsync(
  'INSERT INTO test (value, intValue) VALUES ($value, $intValue)'
);
try {
  let result = await statement.executeAsync({ $value: 'bbb', $intValue: 101 });
  console.log('bbb and 101:', result.lastInsertRowId, result.changes);

  result = await statement.executeAsync({ $value: 'ccc', $intValue: 102 });
  console.log('ccc and 102:', result.lastInsertRowId, result.changes);

  result = await statement.executeAsync({ $value: 'ddd', $intValue: 103 });
  console.log('ddd and 103:', result.lastInsertRowId, result.changes);
} finally {
  await statement.finalizeAsync();
}

const statement2 = await db.prepareAsync('SELECT * FROM test WHERE intValue >= $intValue');
try {
  const result = await statement2.executeAsync<{ value: string; intValue: number }>({
    $intValue: 100,
  });

  // `getFirstAsync()` is useful when you want to get a single row from the database.
  const firstRow = await result.getFirstAsync();
  console.log(firstRow.id, firstRow.value, firstRow.intValue);

  // Reset the SQLite query cursor to the beginning for the next `getAllAsync()` call.
  await result.resetAsync();

  // `getAllAsync()` is useful when you want to get all results as an array of objects.
  const allRows = await result.getAllAsync();
  for (const row of allRows) {
    console.log(row.value, row.intValue);
  }

  // Reset the SQLite query cursor to the beginning for the next `for-await-of` loop.
  await result.resetAsync();

  // The result object is also an async iterable. You can use it in `for-await-of` loop to iterate SQLite query cursor.
  for await (const row of result) {
    console.log(row.value, row.intValue);
  }
} finally {
  await statement2.finalizeAsync();
}
```

----------------------------------------

TITLE: Requesting Foreground Location and Displaying Current Position (Expo TypeScript)
DESCRIPTION: This TypeScript React Native component demonstrates requesting foreground location permissions using `expo-location` and then fetching the device's current geographical position. It includes state management for location data and error messages, and a platform-specific check to advise against running on Android emulators in Snack, ensuring a robust user experience.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/v53.0.0/sdk/location.mdx#_snippet_4

LANGUAGE: TypeScript
CODE:
```
import { useState, useEffect } from 'react';
import { Platform, Text, View, StyleSheet } from 'react-native';
/* @hide */
import * as Device from 'expo-device';
/* @end */
import * as Location from 'expo-location';

export default function App() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function getCurrentLocation() {
      /* @hide */
      if (Platform.OS === 'android' && !Device.isDevice) {
        setErrorMsg(
          'Oops, this will not work on Snack in an Android Emulator. Try it on your device!'
        );
        return;
      }
      /* @end */
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    }

    getCurrentLocation();
  }, []);

  let text = 'Waiting...';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.paragraph}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  paragraph: {
    fontSize: 18,
    textAlign: 'center',
  },
});
```

----------------------------------------

TITLE: Creating a New Expo Project (Bash)
DESCRIPTION: This command initializes a new React Native project using the latest version of `create-expo-app`. It's the foundational step required before integrating with EAS Workflows.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/eas/workflows/get-started.mdx#_snippet_0

LANGUAGE: bash
CODE:
```
npx create-expo-app@latest
```

----------------------------------------

TITLE: Importing Core Components from Expo Router
DESCRIPTION: This JavaScript snippet demonstrates how to import essential navigation components like `Stack`, `Tabs`, and `Link` from the `expo-router` library for use in React Native and web applications.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/v53.0.0/sdk/router.mdx#_snippet_1

LANGUAGE: javascript
CODE:
```
import { Stack, Tabs, Link } from 'expo-router';
```

----------------------------------------

TITLE: Using Expo Image Component in React Native
DESCRIPTION: This snippet demonstrates how to integrate and use the `Image` component from `expo-image` in a React Native application. It shows how to set a source URL, apply a BlurHash placeholder, control content fitting, and define a transition duration. It also includes basic styling using `StyleSheet`.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/v51.0.0/sdk/image.mdx#_snippet_0

LANGUAGE: jsx
CODE:
```
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

export default function App() {
  return (
    <View style={styles.container}>
      <Image
        style={styles.image}
        source="https://picsum.photos/seed/696/3000/2000"
        placeholder={{ blurhash }}
        contentFit="cover"
        transition={1000}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    flex: 1,
    width: '100%',
    backgroundColor: '#0553',
  },
});
```

----------------------------------------

TITLE: Implementing Background Location Updates with TaskManager in React Native
DESCRIPTION: This snippet demonstrates how to request foreground and background location permissions and then start background location updates using `expo-location` and `expo-task-manager`. It defines a `TaskManager` task to process location data captured in the background. This setup is crucial for apps requiring continuous location tracking even when not in active use.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/v53.0.0/sdk/task-manager.mdx#_snippet_0

LANGUAGE: jsx
CODE:
```
import React from 'react';
import { Button, View, StyleSheet } from 'react-native';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';

const LOCATION_TASK_NAME = 'background-location-task';

const requestPermissions = async () => {
  const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
  if (foregroundStatus === 'granted') {
    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus === 'granted') {
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
      });
    }
  }
};

const PermissionsButton = () => (
  <View style={styles.container}>
    <Button onPress={requestPermissions} title="Enable background location" />
  </View>
);

TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
  if (error) {
    // Error occurred - check `error.message` for more details.
    return;
  }
  if (data) {
    const { locations } = data;
    // do something with the locations captured in the background
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PermissionsButton;
```

----------------------------------------

TITLE: Installing EAS CLI Globally
DESCRIPTION: This command installs the EAS CLI globally on your local machine, enabling access to EAS services for building, updating, and submitting Expo applications.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/develop/tools.mdx#_snippet_1

LANGUAGE: Shell
CODE:
```
npm install -g eas-cli
```

----------------------------------------

TITLE: Installing EAS CLI and Logging In (Shell)
DESCRIPTION: This command globally installs the Expo Application Services (EAS) command-line interface and then logs the user into their EAS account. It is a prerequisite for using EAS Build services.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/develop/development-builds/create-a-build.mdx#_snippet_7

LANGUAGE: Shell
CODE:
```
npm install -g eas-cli && eas login
```

----------------------------------------

TITLE: Defining Production Build Workflow (YAML)
DESCRIPTION: This YAML configuration defines an EAS Workflow named 'Create Production Builds'. It includes two parallel jobs, `build_android` and `build_ios`, both using the `build` job type to create production builds for their respective platforms.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/eas/workflows/get-started.mdx#_snippet_3

LANGUAGE: yaml
CODE:
```
name: Create Production Builds

jobs:
  build_android:
    type: build # This job type creates a production build for Android
    params:
      platform: android
  build_ios:
    type: build # This job type creates a production build for iOS
    params:
      platform: ios
```

----------------------------------------

TITLE: Displaying Update Status (Embedded vs. Downloaded) in React Native
DESCRIPTION: This React Native component uses `expo-updates` to determine if the currently running application update is embedded in the build or was downloaded from the server. It displays a message indicating whether the update can be traced in the EAS dashboard, as embedded updates are not trackable there. This helps users understand why an `updateId` might not be found in the dashboard.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/eas-update/trace-update-id-expo-dashboard.mdx#_snippet_0

LANGUAGE: tsx
CODE:
```
import * as Updates from 'expo-updates';
import { Text } from 'react-native';

export default function UpdateStatus() {
  return (
    <Text>
      {Updates.isEmbeddedLaunch
        ? '(Embedded) ❌ You cannot trace this update in the EAS dashboard.'
        : '(Downloaded) ✅ You can trace this update in the EAS dashboard.'}
    </Text>
  );
}
```

----------------------------------------

TITLE: Installing Expo Network Package (npm)
DESCRIPTION: This command adds the `expo-network` package to your project's `npm` dependencies. It's the standard way to install Expo modules in both managed and bare React Native projects, ensuring compatibility with your current Expo SDK version.
SOURCE: https://github.com/expo/expo/blob/main/packages/expo-network/README.md#_snippet_0

LANGUAGE: JavaScript
CODE:
```
npx expo install expo-network
```

----------------------------------------

TITLE: Sending FCM v1 Notification (TypeScript)
DESCRIPTION: Demonstrates how to send an FCM v1 notification using fetch in TypeScript. It retrieves an OAuth 2.0 access token, constructs the message payload, and makes a POST request to the FCM API endpoint. Requires environment variables for the FCM server key path, project name, and device token.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/push-notifications/sending-notifications-custom.mdx#_snippet_2

LANGUAGE: TypeScript
CODE:
```
// FCM_SERVER_KEY: Environment variable with the path to your FCM private key file
// FCM_PROJECT_NAME: Your Firebase project name
// FCM_DEVICE_TOKEN: The client's device token (see above in this document)

async function sendFCMv1Notification() {
  const key = require(process.env.FCM_SERVER_KEY);
  const firebaseAccessToken = await getAccessTokenAsync(key);
  const deviceToken = process.env.FCM_DEVICE_TOKEN;

  const messageBody = {
    message: {
      token: deviceToken,
      data: {
        channelId: 'default',
        message: 'Testing',
        title: `This is an FCM notification message`,
        body: JSON.stringify({ title: 'bodyTitle', body: 'bodyBody' }),
        scopeKey: '@yourExpoUsername/yourProjectSlug',
        experienceId: '@yourExpoUsername/yourProjectSlug',
      },
    },
  };

  const response = await fetch(
    `https://fcm.googleapis.com/v1/projects/${process.env.FCM_PROJECT_NAME}/messages:send`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${firebaseAccessToken}`,
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageBody),
    }
  );

  const readResponse = (response: Response) => response.json();
  const json = await readResponse(response);

  console.log(`Response JSON: ${JSON.stringify(json, null, 2)}`);
}
```

----------------------------------------

TITLE: Creating a New Expo Project with create-expo-app
DESCRIPTION: This command initializes a new React Native project using `create-expo-app`, setting up a basic 'Hello world' application. It's a quick way to get started with a project compatible with EAS Update.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/eas-update/getting-started.mdx#_snippet_0

LANGUAGE: bash
CODE:
```
npx create-expo-app my-app
```

----------------------------------------

TITLE: Creating Global CSS File for Tailwind CSS v4
DESCRIPTION: This CSS snippet defines the `global.css` file, which includes the `@import 'tailwindcss';` directive. This is the simplified way to include Tailwind's styles in your project for version 4.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/guides/tailwind.mdx#_snippet_8

LANGUAGE: css
CODE:
```
@import 'tailwindcss';
```

----------------------------------------

TITLE: Configuring Android Google Services File in app.json
DESCRIPTION: This JSON snippet illustrates how to specify the path to the `google-services.json` file within the `expo.android` configuration in `app.json`. This file is crucial for integrating Firebase Cloud Messaging (FCM V1) into an Expo Android project, allowing the application to receive push notifications. The `googleServicesFile` property directs the build process to the correct Firebase configuration.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/push-notifications/fcm-credentials.mdx#_snippet_0

LANGUAGE: JSON
CODE:
```
{
  "expo": {
  /* @hide ...*/ /* @end */
  "android": {
    /* @hide ...*/ /* @end */
    "googleServicesFile": "./path/to/google-services.json"
  }
}
```

----------------------------------------

TITLE: Starting Expo Development Server (Shell)
DESCRIPTION: This command initiates the local development server for an Expo project. Running `npx expo start` makes the application accessible on connected Android emulators, iOS simulators, or physical devices via a QR code, enabling live development and debugging.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/develop/development-builds/use-development-builds.mdx#_snippet_1

LANGUAGE: Shell
CODE:
```
npx expo start
```

----------------------------------------

TITLE: Navigating with useRouter Hook in Expo Router (TypeScript)
DESCRIPTION: This snippet demonstrates how to use the `useRouter` hook for imperative navigation in Expo Router. The `router.navigate` function is used to move to a specified URL, either pushing a new page onto the stack or unwinding to an existing route. Other functions like `router.push`, `router.back`, and `router.replace` are also available for specific navigation behaviors.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/router/basics/navigation.mdx#_snippet_0

LANGUAGE: tsx
CODE:
```
import { useRouter } from 'expo-router';

export default function Home() {
  const router = useRouter();

  return <Button onPress={() => router.navigate('/about')}>Go to About</Button>;
}
```

----------------------------------------

TITLE: Install Expo Notification Libraries (Shell)
DESCRIPTION: Installs the necessary Expo libraries (`expo-notifications`, `expo-device`, `expo-constants`) required for setting up and handling push notifications in an Expo project. These libraries are used for requesting user permissions, obtaining the push token, checking device type, and accessing project constants.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/push-notifications/push-notifications-setup.mdx#_snippet_0

LANGUAGE: shell
CODE:
```
$ npx expo install expo-notifications expo-device expo-constants
```

----------------------------------------

TITLE: Configuring Multiple Build Profiles for EAS Build (JSON)
DESCRIPTION: This JSON snippet illustrates how to define multiple build profiles within `eas.json` for EAS Build. It demonstrates profile inheritance using `extends`, setting global and platform-specific environment variables, and configuring build behaviors like development client, distribution, and simulator usage for Android and iOS.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/eas/json.mdx#_snippet_0

LANGUAGE: json
CODE:
```
{
  "build": {
    "base": {
      "node": "12.13.0",
      "yarn": "1.22.5",
      "env": {
        "EXAMPLE_ENV": "example value"
      },
      "android": {
        "image": "default",
        "env": {
          "PLATFORM": "android"
        }
      },
      "ios": {
        "image": "latest",
        "env": {
          "PLATFORM": "ios"
        }
      }
    },
    "development": {
      "extends": "base",
      "developmentClient": true,
      "env": {
        "ENVIRONMENT": "development"
      },
      "android": {
        "distribution": "internal",
        "withoutCredentials": true
      },
      "ios": {
        "simulator": true
      }
    },
    "staging": {
      "extends": "base",
      "env": {
        "ENVIRONMENT": "staging"
      },
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "extends": "base",
      "env": {
        "ENVIRONMENT": "production"
      }
    }
  }
}
```

----------------------------------------

TITLE: Building Android and iOS Apps Simultaneously (EAS CLI/Shell)
DESCRIPTION: This command initiates release builds for both Android and iOS platforms concurrently. It's a convenient option to prepare binaries for both Google Play Store and Apple App Store in a single command.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/build/setup.mdx#_snippet_7

LANGUAGE: shell
CODE:
```
eas build --platform all
```

----------------------------------------

TITLE: Installing Dependencies for Expo Project - Bash
DESCRIPTION: This command installs all necessary project dependencies as defined in the `package.json` file. It is the first step required to set up the Expo application for development, ensuring all required packages are available.
SOURCE: https://github.com/expo/expo/blob/main/templates/expo-template-default/README.md#_snippet_0

LANGUAGE: bash
CODE:
```
npm install
```

----------------------------------------

TITLE: Implementing KeyboardAvoidingView for Input Visibility (React Native TSX)
DESCRIPTION: This snippet demonstrates how to use `KeyboardAvoidingView` to prevent the software keyboard from obscuring text inputs. It dynamically sets the `behavior` prop to `padding` for iOS and `undefined` for Android, ensuring the input remains visible. It requires `KeyboardAvoidingView` and `TextInput` from `react-native`.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/guides/keyboard-handling.mdx#_snippet_0

LANGUAGE: tsx
CODE:
```
import { KeyboardAvoidingView, TextInput } from 'react-native';

export default function HomeScreen() {
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <TextInput placeholder="Type here..." />
    </KeyboardAvoidingView>;
  );
}
```

----------------------------------------

TITLE: Clearing Bundler Caches with Expo CLI and npm
DESCRIPTION: This sequence of commands is designed to clear development caches for an Expo CLI project utilizing npm. It removes `node_modules`, forces a clean of the global npm cache, reinstalls project dependencies, resets the Watchman file watcher, clears temporary Metro/Haste-map caches, and then restarts the Expo development server with a fresh cache.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/troubleshooting/clear-cache-macos-linux.mdx#_snippet_1

LANGUAGE: Shell
CODE:
```
$ rm -rf node_modules

$ npm cache clean --force

$ npm install

$ watchman watch-del-all

$ rm -fr $TMPDIR/haste-map-*

$ rm -rf $TMPDIR/metro-cache

$ npx expo start --clear
```

----------------------------------------

TITLE: Loading Custom Font with useFonts Hook in Expo (TSX)
DESCRIPTION: Demonstrates how to use the `useFonts` hook from `expo-font` to asynchronously load a custom font (`Inter-Black.otf`). It also integrates `expo-splash-screen` to prevent the app from rendering until the font is loaded, ensuring a smooth user experience. The `useEffect` hook handles hiding the splash screen once fonts are ready or an error occurs.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/develop/user-interface/fonts.mdx#_snippet_4

LANGUAGE: TSX
CODE:
```
/* @info Import <CODE>useFonts</CODE> hook from <CODE>expo-font</CODE>. */ import { useFonts } from 'expo-font'; /* @end */
/* @info Import <CODE>SplashScreen</CODE> so that when the fonts are not loaded, we can continue to show <CODE>SplashScreen</CODE>. */ import * as SplashScreen from 'expo-splash-screen'; /* @end */
import {useEffect} from 'react';

/* @info This prevents <CODE>SplashScreen</CODE> from auto hiding while the fonts are in loading state. */
SplashScreen.preventAutoHideAsync();
/* @end */

export default function RootLayout() {
  /* @info Map the font file using <CODE>useFonts</CODE> hook. */
  const [loaded, error] = useFonts({
    'Inter-Black': require('./assets/fonts/Inter-Black.otf'),
  });
  /* @end */

  useEffect(() => {
    if (loaded || error) {
      /* @info After the custom fonts have loaded, we can hide the splash screen and display the app screen. */
      SplashScreen.hideAsync();
      /* @end */
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    /* @hide ... */ /* @end */
  )
}
```

----------------------------------------

TITLE: Initializing a New Expo Project - create-expo-app - Shell
DESCRIPTION: This snippet initializes a new Expo project named "StickerSmash" using the `create-expo-app` command-line tool. It then navigates into the newly created project directory. This command sets up the basic boilerplate for a React Native application with Expo.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/tutorial/create-your-first-app.mdx#_snippet_0

LANGUAGE: Shell
CODE:
```
# Create a project named StickerSmash
$ npx create-expo-app@latest StickerSmash

# Navigate to the project directory
$ cd StickerSmash
```

----------------------------------------

TITLE: Setting Up SafeAreaProvider in React Native App Root
DESCRIPTION: This code illustrates the essential step of wrapping the root component of a React Native application with `SafeAreaProvider`. This provider makes the safe area context available to all child components, enabling `SafeAreaView` and `useSafeAreaInsets` to function correctly.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/v52.0.0/sdk/safe-area-context.mdx#_snippet_3

LANGUAGE: jsx
CODE:
```
import { SafeAreaProvider } from 'react-native-safe-area-context';

function App() {
  return <SafeAreaProvider>...</SafeAreaProvider>;
}
```

----------------------------------------

TITLE: Initial EAS Build Configuration (eas.json)
DESCRIPTION: This snippet illustrates the basic `eas.json` configuration for an Expo project, defining `development` and `production` build profiles. The `development` profile enables the development client, while the `production` profile is for release builds.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/build-reference/variants.mdx#_snippet_1

LANGUAGE: json
CODE:
```
{
  "build": {
    "development": {
      "developmentClient": true
    },
    "production": {}
  }
}
```

----------------------------------------

TITLE: Starting Expo Development Server (Shell)
DESCRIPTION: This command initiates the Expo development server from the project directory. It allows the development build on the device to connect to the local server for live updates and debugging. This is a prerequisite for running and interacting with the development build.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/tutorial/eas/ios-development-build-for-devices.mdx#_snippet_2

LANGUAGE: Shell
CODE:
```
npx expo start
```

----------------------------------------

TITLE: Triggering Expo EAS Workflow on GitHub Push (YAML)
DESCRIPTION: This YAML configuration defines an Expo EAS workflow that is automatically triggered when a commit is pushed to the 'main' branch of the connected GitHub repository. It includes two build jobs, one for Android and one for iOS, both of type 'build', demonstrating a common setup for continuous integration.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/eas/workflows/get-started.mdx#_snippet_5

LANGUAGE: YAML
CODE:
```
name: Create Production Builds

# @info #
on:
  push:
    branches: ['main']
  # @end #

  jobs:
    build_android:
      type: build
      params:
        platform: android
    build_ios:
      type: build
```

----------------------------------------

TITLE: Initializing Root Layout with Font Loading in Expo Router (TSX)
DESCRIPTION: This snippet demonstrates a common root layout (`_layout.tsx`) in Expo Router. It initializes fonts using `useFonts`, prevents the splash screen from auto-hiding, and then hides it once fonts are loaded. The layout returns a `Stack` component, serving as the top-level navigator and entry point for the application's routes. It's suitable for app-wide setup like font loading or context providers.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/router/basics/layout.mdx#_snippet_0

LANGUAGE: tsx
CODE:
```
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <Stack />;
}
```

----------------------------------------

TITLE: Creating a New Expo Project with npx
DESCRIPTION: This command initializes a new Expo project using `create-expo-app`, a command-line tool that sets up a basic Expo application with all necessary dependencies. It is the recommended way to start a new Expo project for development.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/tutorial/eas/introduction.mdx#_snippet_0

LANGUAGE: Shell
CODE:
```
npx create-expo-app
```

----------------------------------------

TITLE: Accessing Route and Search Parameters in Expo Router (TypeScript)
DESCRIPTION: This snippet demonstrates how to access both route and search parameters using the `useLocalSearchParams` hook in Expo Router. It shows how `user` (a route parameter) and `tab` (an optional search parameter) are extracted from the URL and logged to the console, illustrating different URL scenarios and their corresponding parameter values.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/router/reference/url-parameters.mdx#_snippet_9

LANGUAGE: tsx
CODE:
```
import { useLocalSearchParams } from 'expo-router';

export default function User() {
  const {
    // The route parameter
    user,
    // An optional search parameter.
    tab,
  } = useLocalSearchParams<{ user: string; tab?: string }>();

  console.log({ user, tab });

  // Given the URL: `/bacon?tab=projects`, the following is printed:
  // { user: 'bacon', tab: 'projects' }

  // Given the URL: `/expo`, the following is printed:
  // { user: 'expo', tab: undefined }
}
```

----------------------------------------

TITLE: Building iOS Production App with EAS Build
DESCRIPTION: This command uses EAS Build to create a production-ready build for the iOS platform. The `--profile production` flag ensures that the build uses the production configuration defined in `eas.json`, suitable for App Store submission.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/submit/ios.mdx#_snippet_2

LANGUAGE: bash
CODE:
```
$ eas build --platform ios --profile production
```

----------------------------------------

TITLE: Use Animated Image Component for Emoji Sticker
DESCRIPTION: Imports `Animated` from `react-native-reanimated` and replaces the standard `Image` component with `<Animated.Image>` in `components/EmojiSticker.tsx`. This allows the component's style properties, such as size, to be animated using Reanimated.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/tutorial/gestures.mdx#_snippet_1

LANGUAGE: tsx
CODE:
```
import { ImageSourcePropType, View } from 'react-native';
/* @tutinfo Import <CODE>Animated</CODE> from <CODE>react-native-reanimated</CODE>. */import Animated from 'react-native-reanimated';/* @end */

type Props = {
  imageSize: number;
  stickerSource: ImageSourcePropType;
};

export default function EmojiSticker({ imageSize, stickerSource }: Props) {
  return (
    <View style={{ top: -350 }}>
      /* @tutinfo Replace the <CODE>Image</CODE> component with <CODE>Animated.Image</CODE>. */
      <Animated.Image
        source={stickerSource}
        resizeMode="contain"
        style={{ width: imageSize, height: imageSize }}
      />
      /* @end */
    </View>
  );
}
```

----------------------------------------

TITLE: Rewriting URLs Based on Business Logic in Expo Router
DESCRIPTION: This `_layout.tsx` snippet shows how to react to URL changes using the `usePathname()` hook in Expo Router. It implements a conditional redirect based on custom business logic (e.g., user permissions via `isUserAllowed`), ensuring users are navigated to appropriate routes like `/home` if not allowed access to the current `pathname`.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/router/advanced/native-intent.mdx#_snippet_1

LANGUAGE: TypeScript
CODE:
```
import { Slot, Redirect } from 'expo-router';

export default function RootLayout() {
  const pathname = usePathname();

  if (pathname && !isUserAllowed(pathname)) {
    return <Redirect href="/home" />;
  }

  return <Slot />;
}
```

----------------------------------------

TITLE: Testing Android App Links via ADB Shell
DESCRIPTION: This `adb` command allows for manual testing of Android App Links by directly starting an intent activity on a connected device. It simulates opening a specific URL (`https://my-custom-domain.ngrok.io/`) with the specified package name, enabling developers to verify if the app correctly handles the inbound link.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/linking/android-app-links.mdx#_snippet_4

LANGUAGE: shell
CODE:
```
$ adb shell am start -a android.intent.action.VIEW  -c android.intent.category.BROWSABLE -d "https://my-custom-domain.ngrok.io/" <your-package-name>
```

----------------------------------------

TITLE: Dynamic App Configuration with Environment Variables (app.config.js)
DESCRIPTION: This snippet shows how to dynamically set the app's name, iOS bundle identifier, and Android package name in `app.config.js` based on an `APP_VARIANT` environment variable. This allows for unique identifiers and names for development and production builds, enabling simultaneous installation on a single device.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/build-reference/variants.mdx#_snippet_3

LANGUAGE: javascript
CODE:
```
const IS_DEV = process.env.APP_VARIANT === 'development';

export default {
  /* @info You can also switch out the app icon and other properties to further differentiate the app on your device. */
  name: IS_DEV ? 'MyApp (Dev)' : 'MyApp',
  /* @end */
  slug: 'my-app',
  ios: {
    bundleIdentifier: IS_DEV ? 'com.myapp.dev' : 'com.myapp',
  },
  android: {
    package: IS_DEV ? 'com.myapp.dev' : 'com.myapp',
  }
};
```

----------------------------------------

TITLE: Define Multiple Submit Profiles (eas.json)
DESCRIPTION: Illustrates how to define multiple named submit profiles within the 'submit' object in eas.json. Each profile can have distinct Android and iOS configurations and can inherit settings from another profile using the 'extends' key.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/submit/eas-json.mdx#_snippet_1

LANGUAGE: json
CODE:
```
{
  "cli": {
    "version": "SEMVER_RANGE", // Required EAS CLI version range.
    "requireCommit": boolean // If true, ensures that all changes are committed before a build. Defaults to false.
  },
  "build": {
    // EAS Build configuration
    // ...
  },
  "submit": {
    "SUBMIT_PROFILE_NAME_1": { // any arbitrary name - used as an identifier
      "android": {
        // Android-specific configuration
      },
      "ios": {
        // iOS-specific configuration
      }
    },
    "SUBMIT_PROFILE_NAME_2": { // any arbitrary name - used as an identifier
      "extends": "SUBMIT_PROFILE_NAME_1",
      "android": {
        // Android-specific configuration
      }
    },
    // ...
  }
}
```

----------------------------------------

TITLE: Implementing Apple Sign-In Button and Flow (React Native)
DESCRIPTION: This React Native JSX snippet demonstrates how to integrate the `AppleAuthenticationButton` component and initiate the `signInAsync` flow. It requests full name and email scopes, and includes basic error handling for user cancellation or other issues during the authentication process. It requires `expo-apple-authentication` and `react-native`.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/v52.0.0/sdk/apple-authentication.mdx#_snippet_3

LANGUAGE: jsx
CODE:
```
import * as AppleAuthentication from 'expo-apple-authentication';
import { View, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={5}
        style={styles.button}
        onPress={async () => {
          try {
            const credential = await AppleAuthentication.signInAsync({
              requestedScopes: [
                AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                AppleAuthentication.AppleAuthenticationScope.EMAIL,
              ],
            });
            // signed in
          } catch (e) {
            if (e.code === 'ERR_REQUEST_CANCELED') {
              // handle that the user canceled the sign-in flow
            } else {
              // handle other errors
            }
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: 200,
    height: 44,
  },
});
```

----------------------------------------

TITLE: Using `SafeAreaView` for Screen Content in React Native
DESCRIPTION: This snippet demonstrates how to wrap a screen's content with `SafeAreaView` from `react-native-safe-area-context`. It automatically applies appropriate padding to ensure content is not obscured by device notches, status bars, or home indicators, making it a simple way to handle safe areas.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/develop/user-interface/safe-areas.mdx#_snippet_1

LANGUAGE: TypeScript
CODE:
```
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Text>Content is in safe area.</Text>
    </SafeAreaView>
  );
}
```

----------------------------------------

TITLE: Cleaning and Prebuilding Native Directories
DESCRIPTION: This command cleans existing native directories and regenerates them based on the current project configuration. It's recommended when modifying project configuration or native code after the first build to ensure a fresh build and prevent unexpected layering issues.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/workflow/overview.mdx#_snippet_7

LANGUAGE: Shell
CODE:
```
npx expo prebuild --clean
```

----------------------------------------

TITLE: Dynamic App Configuration with Environment Variables in Expo (JavaScript)
DESCRIPTION: Illustrates how to use non-public environment variables, specifically `APP_VARIANT`, within `app.config.js` to dynamically set the app name and bundle identifier/package name based on the build variant (development, preview, or production). This allows for different app configurations without code changes.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/eas/environment-variables.mdx#_snippet_1

LANGUAGE: js
CODE:
```
const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

const getUniqueIdentifier = () => {
  if (IS_DEV) {
    return 'com.yourname.stickersmash.dev';
  }

  if (IS_PREVIEW) {
    return 'com.yourname.stickersmash.preview';
  }

  return 'com.yourname.stickersmash';
};

const getAppName = () => {
  if (IS_DEV) {
    return 'StickerSmash (Dev)';
  }

  if (IS_PREVIEW) {
    return 'StickerSmash (Preview)';
  }

  return 'StickerSmash: Emoji Stickers';
};

export default {
  /* @info Using <CODE>getAppName()</CODE> for "name" property */
  name: getAppName(),
  /* @end */
  /* @hide ... */ /* @end */
  ios: {
    /* @info Using <CODE>getUniqueIdentifier()</CODE> for "bundleIdentifier" property */
    bundleIdentifier: getUniqueIdentifier(),
    /* @end */
    /* @hide ... */ /* @end */
  },
  android: {
    /* @info Using <CODE>getUniqueIdentifier()</CODE> for "package" property */
    package: getUniqueIdentifier(),
    /* @end */
    /* @hide ... */ /* @end */
  }
};
```

----------------------------------------

TITLE: Managing Giphy Files with expo-file-system in TypeScript
DESCRIPTION: This example demonstrates how to manage local GIF files using `expo-file-system`. It includes functions to ensure a dedicated directory exists, download multiple GIFs, retrieve a single GIF (with caching), obtain a shareable content URI, and delete all cached GIFs.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/v51.0.0/sdk/filesystem.mdx#_snippet_1

LANGUAGE: ts
CODE:
```
import * as FileSystem from 'expo-file-system';

const gifDir = FileSystem.cacheDirectory + 'giphy/';
const gifFileUri = (gifId: string) => gifDir + `gif_${gifId}_200.gif`;
const gifUrl = (gifId: string) => `https://media1.giphy.com/media/${gifId}/200.gif`;

// Checks if gif directory exists. If not, creates it
async function ensureDirExists() {
  const dirInfo = await FileSystem.getInfoAsync(gifDir);
  if (!dirInfo.exists) {
    console.log("Gif directory doesn't exist, creating…");
    await FileSystem.makeDirectoryAsync(gifDir, { intermediates: true });
  }
}

// Downloads all gifs specified as array of IDs
export async function addMultipleGifs(gifIds: string[]) {
  try {
    await ensureDirExists();

    console.log('Downloading', gifIds.length, 'gif files…');
    await Promise.all(gifIds.map(id => FileSystem.downloadAsync(gifUrl(id), gifFileUri(id))));
  } catch (e) {
    console.error("Couldn't download gif files:", e);
  }
}

// Returns URI to our local gif file
// If our gif doesn't exist locally, it downloads it
export async function getSingleGif(gifId: string) {
  await ensureDirExists();

  const fileUri = gifFileUri(gifId);
  const fileInfo = await FileSystem.getInfoAsync(fileUri);

  if (!fileInfo.exists) {
    console.log("Gif isn't cached locally. Downloading…");
    await FileSystem.downloadAsync(gifUrl(gifId), fileUri);
  }

  return fileUri;
}

// Exports shareable URI - it can be shared outside your app
export async function getGifContentUri(gifId: string) {
  return FileSystem.getContentUriAsync(await getSingleGif(gifId));
}

// Deletes whole giphy directory with all its content
export async function deleteAllGifs() {
  console.log('Deleting all GIF files…');
  await FileSystem.deleteAsync(gifDir);
}
```

----------------------------------------

TITLE: Configuring Stripe React Native Plugin in Expo's app.json
DESCRIPTION: This JSON snippet demonstrates how to add the `@stripe/stripe-react-native` config plugin to your Expo `app.json` or `app.config.js`. This plugin simplifies the setup for features like Apple Pay and Google Pay by allowing you to specify `merchantIdentifier` (for iOS Apple Pay) and `enableGooglePay` (for Android Google Pay) directly in your app configuration. Rebuilding the app is required after making these changes.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/v53.0.0/sdk/stripe.mdx#_snippet_0

LANGUAGE: json
CODE:
```
{
  "expo": {
    /* @hide ... */ /* @end */
    "plugins": [
      [
        "@stripe/stripe-react-native",
        {
          "merchantIdentifier": string | string [],
          "enableGooglePay": boolean
        }
      ]
    ]
  }
}
```

----------------------------------------

TITLE: Creating Production Build for Android with EAS CLI
DESCRIPTION: This command initiates a production build specifically for the Android platform using the EAS CLI. It's the primary step for generating an Android App Bundle (AAB) or APK ready for submission to the Google Play Store.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/deploy/build-project.mdx#_snippet_1

LANGUAGE: bash
CODE:
```
eas build --platform android
```

----------------------------------------

TITLE: Creating an Initial Route with Expo Router (Home Screen) - TypeScript
DESCRIPTION: This snippet defines the initial home screen component for an Expo Router application. It uses React Native's `View` and `Text` components to display 'Home' and applies basic styling. This file, `app/index.tsx`, automatically maps to the root route (`/`) in the file-based routing system.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/develop/file-based-routing.mdx#_snippet_0

LANGUAGE: tsx
CODE:
```
import { View, Text, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text>Home</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

----------------------------------------

TITLE: Importing Installed Expo SDK Packages in JavaScript
DESCRIPTION: Shows how to import the installed Expo SDK packages (expo-camera, expo-contacts, expo-sensors) into a JavaScript file. This makes the package's modules and functions available for use in the application code.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/v51.0.0/index.mdx#_snippet_1

LANGUAGE: JavaScript
CODE:
```
import { CameraView } from 'expo-camera';
import * as Contacts from 'expo-contacts';
import { Gyroscope } from 'expo-sensors';
```

----------------------------------------

TITLE: Importing WebBrowser Module
DESCRIPTION: This snippet shows the standard way to import the `expo-web-browser` module into a JavaScript or TypeScript file. It makes all functions and constants exported by the library available under the `WebBrowser` namespace, allowing access to methods like `openBrowserAsync` and `openAuthSessionAsync`.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/v51.0.0/sdk/webbrowser.mdx#_snippet_1

LANGUAGE: javascript
CODE:
```
import * as WebBrowser from 'expo-web-browser';
```

----------------------------------------

TITLE: Configuring Stack Screen Options in Expo Router (TSX)
DESCRIPTION: This snippet demonstrates how to apply specific screen options to routes within an Expo Router `Stack` navigator. By including `Stack.Screen` components inside the `Stack`, you can customize individual route behaviors, such as hiding the header for a specific product detail page (`[productId]`). The `name` prop should match the route name, and the `component` prop is not required as Expo Router handles automatic mapping.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/router/basics/layout.mdx#_snippet_2

LANGUAGE: tsx
CODE:
```
import { Stack } from 'expo-router';

export default function StackLayout() {
  return (
    <Stack>
      <Stack.Screen name="[productId]" options={{ headerShown: false }} />
    </Stack>
  );
}
```

----------------------------------------

TITLE: Running Expo App on iOS Simulator
DESCRIPTION: Execute this command from your terminal to build and run your Expo development build on an iOS Simulator. This command also automatically starts a development server, making `npx expo start` redundant.
SOURCE: https://github.com/expo/expo/blob/main/docs/scenes/get-started/set-up-your-environment/instructions/iosSimulatedDevelopmentBuildLocal.mdx#_snippet_1

LANGUAGE: bash
CODE:
```
$ npx expo run:ios
```

----------------------------------------

TITLE: Defining Environment Variables in .env for Expo
DESCRIPTION: This snippet demonstrates how to define environment variables in a .env file for an Expo project. Variables must be prefixed with EXPO_PUBLIC_ to be automatically loaded and inlined by the Expo CLI into the JavaScript bundle. These variables are key-value pairs used to configure app behavior based on the environment.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/guides/environment-variables.mdx#_snippet_0

LANGUAGE: bash
CODE:
```
EXPO_PUBLIC_API_URL=https://staging.example.com
EXPO_PUBLIC_API_KEY=abc123
```

----------------------------------------

TITLE: Updating Search Parameters via TextInput (Expo Router)
DESCRIPTION: This example demonstrates how to update a URL search parameter (`q`) imperatively using `router.setParams` in response to user input from a `TextInput`. The `useState` hook manages the input field's value, and `onChangeText` triggers the `router.setParams` call, which updates the URL without adding a new entry to the history stack.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/router/reference/url-parameters.mdx#_snippet_7

LANGUAGE: tsx
CODE:
```
import { useLocalSearchParams, router } from 'expo-router';
import { useState } from 'react';
import { TextInput, View } from 'react-native';

export default function Page() {
  const params = useLocalSearchParams<{ query?: string }>();
  const [search, setSearch] = useState(params.query);

  return (
    <TextInput
      value={search}
      onChangeText={search => {
        setSearch(search);
        /* @info Set the search parameter <b>query</b> to the text input <b>search</b> */
        router.setParams({ query: search });
        /* @end */
      }}
      placeholderTextColor="#A0A0A0"
      placeholder="Search"
      style={{
        borderRadius: 12,
        backgroundColor: '#fff',
        fontSize: 24,
        color: '#000',
        margin: 12,
        padding: 16,
      }}
    />
  );
}
```

----------------------------------------

TITLE: Importing expo-secure-store API
DESCRIPTION: This snippet demonstrates the standard JavaScript import statement required to access the SecureStore module from the expo-secure-store package. It allows developers to use functions like setItemAsync and getItemAsync for secure data storage.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/v53.0.0/sdk/securestore.mdx#_snippet_6

LANGUAGE: javascript
CODE:
```
import * as SecureStore from 'expo-secure-store';
```

----------------------------------------

TITLE: Configuring Root Stack Navigator in Expo Router
DESCRIPTION: This snippet defines the root layout for the Expo Router application, using a `Stack` navigator. It ensures that all routes nested within this layout will be rendered as part of a stack navigation flow, allowing for screen transitions and header configurations.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/router/advanced/nesting-navigators.mdx#_snippet_0

LANGUAGE: tsx
CODE:
```
import { Stack } from 'expo-router';

export default Stack;
```

----------------------------------------

TITLE: Starting Expo JavaScript Bundler (Shell)
DESCRIPTION: This command starts the JavaScript bundler for an Expo project. It automatically detects if `expo-dev-client` is installed and targets the development build, allowing for live reloading and debugging of the JavaScript code.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/develop/development-builds/create-a-build.mdx#_snippet_10

LANGUAGE: Shell
CODE:
```
npx expo start
```

----------------------------------------

TITLE: Conditionally Updating Navigation Options When Focused (JavaScript)
DESCRIPTION: This snippet demonstrates how to safely update navigation options using `navigation.setOptions()` by first checking if the screen is currently focused with `navigation.isFocused()`. This pattern is crucial for preloaded screens, as it prevents imperative updates from occurring before the screen is actively displayed, ensuring actions like setting options are performed at the correct time.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/router/basics/navigation.mdx#_snippet_12

LANGUAGE: tsx
CODE:
```
const navigation = useNavigation();

if (navigation.isFocused()) {
  navigation.setOptions({ title: 'Updated title' });
}
```

----------------------------------------

TITLE: Configuring expo-media-library with Config Plugin in app.json
DESCRIPTION: This JSON snippet demonstrates how to configure `expo-media-library` using its built-in config plugin in your `app.json` file. It allows setting iOS permission messages for photo access (`photosPermission`, `savePhotosPermission`) and enabling `ACCESS_MEDIA_LOCATION` on Android (`isAccessMediaLocationEnabled`) for accessing media location data.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/v52.0.0/sdk/media-library.mdx#_snippet_0

LANGUAGE: JSON
CODE:
```
{
  "expo": {
    "plugins": [
      [
        "expo-media-library",
        {
          "photosPermission": "Allow $(PRODUCT_NAME) to access your photos.",
          "savePhotosPermission": "Allow $(PRODUCT_NAME) to save photos.",
          "isAccessMediaLocationEnabled": true
        }
      ]
    ]
  }
}
```

----------------------------------------

TITLE: Configuring EAS Build Environments in eas.json
DESCRIPTION: This JSON snippet demonstrates how to configure build environments within the `eas.json` file for EAS Build. It defines different build profiles (development, preview, production, my-profile) and sets their respective `environment` fields, allowing fine-grained control over environment variables used during the build process.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/eas/environment-variables.mdx#_snippet_4

LANGUAGE: json
CODE:
```
{
  "build": {
    "development": {
      "environment": "development"
    },
    "preview": {
      "environment": "preview"
    },
    "production": {
      "environment": "production"
    },
    "my-profile": {
      "environment": "production"
    }
  }
}
```

----------------------------------------

TITLE: Getting Current Location with Expo (TypeScript)
DESCRIPTION: This React Native component demonstrates how to request foreground location permissions and retrieve the device's current position using `expo-location`. It handles permission denial and displays the location data or an error message. It also includes a check for Android emulators where location might not work directly.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/v52.0.0/sdk/location.mdx#_snippet_4

LANGUAGE: TypeScript
CODE:
```
import { useState, useEffect } from 'react';
import { Platform, Text, View, StyleSheet } from 'react-native';
/* @hide */
import * as Device from 'expo-device';
/* @end */
import * as Location from 'expo-location';

export default function App() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function getCurrentLocation() {
      /* @hide */
      if (Platform.OS === 'android' && !Device.isDevice) {
        setErrorMsg(
          'Oops, this will not work on Snack in an Android Emulator. Try it on your device!'
        );
        return;
      }
      /* @end */
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    }

    getCurrentLocation();
  }, []);

  let text = 'Waiting...';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.paragraph}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  paragraph: {
    fontSize: 18,
    textAlign: 'center',
  },
});
```

----------------------------------------

TITLE: Fixing Expo Dependency Versions (Shell)
DESCRIPTION: This command is used in Expo projects to automatically align dependency versions, such as `expo` and `react-native`, after an SDK upgrade, ensuring compatibility and resolving version mismatches.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/troubleshooting/react-native-version-mismatch.mdx#_snippet_3

LANGUAGE: Shell
CODE:
```
npx expo install --fix
```

----------------------------------------

TITLE: Handling Push Notifications with Deep Linking using Expo Router (TypeScript)
DESCRIPTION: This TypeScript snippet demonstrates how to create a `useNotificationObserver` hook within an Expo Router root layout (`_layout.tsx`) to handle deep linking from push notifications. It listens for both initial notification responses and runtime notification events, pushing the associated URL to the router. It depends on `expo-notifications` and `expo-router`.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/v52.0.0/sdk/notifications.mdx#_snippet_2

LANGUAGE: TypeScript
CODE:
```
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

function useNotificationObserver() {
  useEffect(() => {
    let isMounted = true;

    function redirect(notification: Notifications.Notification) {
      const url = notification.request.content.data?.url;
      if (url) {
        /* @info Push the URL. You may want to verify the format before navigating. */
        router.push(url);
        /* @end */
      }
    }

    /* @info Handle the initial push notification. */
    Notifications.getLastNotificationResponseAsync() /* @end */
      .then(response => {
        if (!isMounted || !response?.notification) {
          return;
        }
        redirect(response?.notification);
      });

    /* @info Listen for runtime notifications. */
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      /* @end */
      redirect(response.notification);
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);
}

export default function Layout() {
  /* @info Observe at the root. Ensure this layout never returns <b>null</b> or the navigation will go unhandled. */
  useNotificationObserver();
  /* @end */

  return <Slot />;
}
```

----------------------------------------

TITLE: Implementing Apple Sign-In Button and Flow (React Native)
DESCRIPTION: This React Native example demonstrates how to integrate the `AppleAuthenticationButton` component and initiate the `signInAsync` flow. It requests full name and email scopes, and includes basic error handling for user cancellation or other issues during the sign-in process.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/unversioned/sdk/apple-authentication.mdx#_snippet_3

LANGUAGE: jsx
CODE:
```
import * as AppleAuthentication from 'expo-apple-authentication';
import { View, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={5}
        style={styles.button}
        onPress={async () => {
          try {
            const credential = await AppleAuthentication.signInAsync({
              requestedScopes: [
                AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                AppleAuthentication.AppleAuthenticationScope.EMAIL,
              ],
            });
            // signed in
          } catch (e) {
            if (e.code === 'ERR_REQUEST_CANCELED') {
              // handle that the user canceled the sign-in flow
            } else {
              // handle other errors
            }
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: 200,
    height: 44,
  },
});
```

----------------------------------------

TITLE: Implementing Basic Video Playback with Play/Pause in React Native (expo-av)
DESCRIPTION: This snippet demonstrates how to integrate the `Video` component from `expo-av` into a React Native application. It shows how to play a video from a URI, use native controls, handle playback status updates, and implement a custom play/pause button using `useRef` and `useState` hooks. Dependencies include `expo-av` and `react-native`. The `Video` component expects a `source` URI and can be controlled programmatically via its `ref`.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/v51.0.0/sdk/video-av.mdx#_snippet_0

LANGUAGE: jsx
CODE:
```
import { useState, useRef } from 'react';
import { View, StyleSheet, Button } from 'react-native';
import { Video, ResizeMode } from 'expo-av';

export default function App() {
  const video = useRef(null);
  const [status, setStatus] = useState({});
  return (
    <View style={styles.container}>
      <Video
        ref={video}
        style={styles.video}
        source={{
          uri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
        }}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        isLooping
        onPlaybackStatusUpdate={status => setStatus(() => status)}
      />
      <View style={styles.buttons}>
        <Button
          title={status.isPlaying ? 'Pause' : 'Play'}
          onPress={() =>
            status.isPlaying ? video.current.pauseAsync() : video.current.playAsync()
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
  },
  video: {
    alignSelf: 'center',
    width: 320,
    height: 200,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

----------------------------------------

TITLE: Defining Basic Stack Layout (TSX)
DESCRIPTION: This snippet shows how to define a basic Stack navigator in the `_layout.tsx` file using `expo-router`. It imports the `Stack` component and renders it as the default export, setting up the navigation stack for the app based on the file structure.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/router/advanced/stack.mdx#_snippet_0

LANGUAGE: tsx
CODE:
```
import { Stack } from 'expo-router';

export default function Layout() {
  return <Stack />;
}
```

----------------------------------------

TITLE: EAS Workflow for Building and Submitting iOS App
DESCRIPTION: This YAML workflow defines an automated CI/CD pipeline using EAS Workflows. It configures two jobs: `build_ios` to create a production iOS build and `submit_ios` to submit that build to the Apple App Store, dependent on the build job's success.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/submit/ios.mdx#_snippet_7

LANGUAGE: yaml
CODE:
```
on:
  push:
    branches: ['main']

jobs:
  build_ios:
    name: Build iOS app
    type: build
    params:
      platform: ios
      profile: production

  submit_ios:
    name: Submit to Apple App Store
    needs: [build_ios]
    type: submit
    params:
      platform: ios
      build_id: ${{ needs.build_ios.outputs.build_id }}
```

----------------------------------------

TITLE: Submitting Android App with EAS Submit for CI/CD (Shell)
DESCRIPTION: This command uses EAS Submit to upload an Android application to the Google Play Store, leveraging the specified production profile. It's intended for use within external CI/CD services and requires an `EXPO_TOKEN` environment variable for authentication.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/submit/android.mdx#_snippet_10

LANGUAGE: Shell
CODE:
```
eas submit --platform android --profile production
```

----------------------------------------

TITLE: Diagnosing Expo Project Issues with Expo Doctor (Shell)
DESCRIPTION: This command runs `expo-doctor` to diagnose common issues in an Expo project, including checking for correct `react-native` version alignment, and providing warnings for necessary installations.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/troubleshooting/react-native-version-mismatch.mdx#_snippet_2

LANGUAGE: Shell
CODE:
```
npx expo-doctor
```

----------------------------------------

TITLE: Configuring Runtime Version Policy in Expo
DESCRIPTION: This JSON snippet shows how to configure the `runtimeVersion` to use a policy-based approach in an Expo project. The `policy` field, set within the `runtimeVersion` object, determines how the runtime version is automatically derived, with `<policy_name>` indicating the specific policy to be used.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/v53.0.0/sdk/updates.mdx#_snippet_1

LANGUAGE: json
CODE:
```
{
  "expo": {
    "runtimeVersion": {
      "policy": "<policy_name>"
    }
  }
}
```

----------------------------------------

TITLE: Send EAS Update to Production Channel (Shell)
DESCRIPTION: Execute this EAS CLI command to create and send an over-the-air update to builds configured for the 'production' channel. The channel is defined in eas.json.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/deploy/send-over-the-air-updates.mdx#_snippet_1

LANGUAGE: Shell
CODE:
```
$ eas update --channel production
```

----------------------------------------

TITLE: Using expo-sqlite/kv-store for Async Key-Value Storage (TypeScript)
DESCRIPTION: This example demonstrates using `expo-sqlite/kv-store` as an asynchronous key-value storage solution. It shows how to `setItem` to store a stringified JSON object and then `getItem` to retrieve and parse it, providing a drop-in replacement for `@react-native-async-storage/async-storage`.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/v52.0.0/sdk/sqlite.mdx#_snippet_13

LANGUAGE: ts
CODE:
```
// The storage API is the default export, you can call it Storage, AsyncStorage, or whatever you prefer.
import Storage from 'expo-sqlite/kv-store';

await Storage.setItem('key', JSON.stringify({ entity: 'value' }));
const value = await Storage.getItem('key');
const entity = JSON.parse(value);
console.log(entity); // { entity: 'value' }
```

----------------------------------------

TITLE: Importing and Using React Native Core Components (TypeScript)
DESCRIPTION: This snippet demonstrates how to import and use core React Native components like `Text` and `View`. It shows a basic functional component that renders 'Hello, world!' centered on the screen. This requires the `react-native` package to be installed in your project.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/workflow/using-libraries.mdx#_snippet_0

LANGUAGE: tsx
CODE:
```
import { Text, View } from 'react-native';

export default function App() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Hello, world!</Text>
    </View>
  );
}
```

----------------------------------------

TITLE: Configuring EAS Update
DESCRIPTION: This command initializes and configures EAS Update for your Expo project. It sets up the necessary files and settings to enable over-the-air updates, which are crucial for delivering instant changes to your app without requiring a new app store submission. This is a prerequisite for the automated deployment workflow.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/eas/workflows/examples.mdx#_snippet_5

LANGUAGE: Shell
CODE:
```
$ eas update:configure
```

----------------------------------------

TITLE: Nested Layout for Deferred Conditional Logic (After Fix)
DESCRIPTION: This nested layout demonstrates the correct approach to handle conditional rendering and navigation. By moving `useEffect` and `isLoading` checks here, navigation events are triggered only after the root layout and its `Slot` are mounted, resolving the 'navigate before mounting' error.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/router/advanced/authentication-rewrites.mdx#_snippet_10

LANGUAGE: tsx
CODE:
```
export default function RootLayout() {
  React.useEffect(() => {
    router.push('/about');
  }, []);

  // It is OK to defer rendering this nested layout's content. We couldn't
  // defer rendering the root layout's content since a navigation event (the
  // redirect) would have been triggered before the root layout's content had
  // been mounted.
  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  return <Slot />;
}
```

----------------------------------------

TITLE: Running Expo Doctor CLI Command
DESCRIPTION: This snippet demonstrates the basic command-line usage of the Expo Doctor tool. It shows how to invoke the `expo-doctor` utility via `npx`, allowing for optional parameters and a project path to be specified for diagnosis.
SOURCE: https://github.com/expo/expo/blob/main/packages/expo-doctor/README.md#_snippet_0

LANGUAGE: sh
CODE:
```
npx expo-doctor [options] [path]
```

----------------------------------------

TITLE: Run expo-doctor (Terminal)
DESCRIPTION: Command to execute the `expo-doctor` tool to validate project dependencies against the data in React Native Directory. Using `@latest` ensures the most recent version is used.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/guides/new-architecture.mdx#_snippet_2

LANGUAGE: shell
CODE:
```
$ npx expo-doctor@latest
```

----------------------------------------

TITLE: Triggering EAS Builds from CI
DESCRIPTION: This command triggers a new build on EAS for all platforms from a CI environment. The `--non-interactive` flag prevents prompts, and `--no-wait` allows the CI job to exit immediately after triggering the build, without waiting for its completion.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/build/building-on-ci.mdx#_snippet_1

LANGUAGE: shell
CODE:
```
npx eas-cli build --platform all --non-interactive --no-wait
```

----------------------------------------

TITLE: Opening URLs with System vs. In-App Browser in React Native
DESCRIPTION: This snippet compares opening URLs using `Linking.openURL` (which uses the system's default browser) versus `WebBrowser.openBrowserAsync` from `expo-web-browser` (for an in-app browser). In-app browsers are particularly useful for secure authentication flows.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/linking/into-other-apps.mdx#_snippet_7

LANGUAGE: tsx
CODE:
```
import { Button, View, StyleSheet } from 'react-native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

export default function Home() {
  return (
    <View style={styles.container}>
      <Button
        title="Open URL with the system browser"
        onPress={() => Linking.openURL('https://expo.dev')}
        style={styles.button}
      />
      <Button
        title="Open URL with an in-app browser"
        onPress={() => WebBrowser.openBrowserAsync('https://expo.dev')}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    marginVertical: 10,
  },
});
```

----------------------------------------

TITLE: Basic BarCodeScanner Usage in React Native
DESCRIPTION: This example demonstrates how to implement a basic barcode scanner in a React Native application using `expo-barcode-scanner`. It includes requesting camera permissions, rendering the `BarCodeScanner` component, and handling scanned barcodes. The `onBarCodeScanned` prop is used to process the scanned data, and a button allows rescanning.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/v51.0.0/sdk/bar-code-scanner.mdx#_snippet_1

LANGUAGE: jsx
CODE:
```
import { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    alert(`Bar code with type ${type} and data ${data} has been scanned!`);
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
});
```

----------------------------------------

TITLE: Basic Video Playback with Controls using expo-video in React Native
DESCRIPTION: This example demonstrates how to integrate `expo-video` for basic video playback in a React Native application. It utilizes `useVideoPlayer` to manage video state and `VideoView` for rendering, including play/pause functionality, looping, and event listeners for playback changes. It requires `expo-video`, `react`, and `react-native`.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/v51.0.0/sdk/video.mdx#_snippet_0

LANGUAGE: jsx
CODE:
```
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useRef, useState } from 'react';
import { PixelRatio, StyleSheet, View, Button } from 'react-native';

const videoSource =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

export default function VideoScreen() {
  const ref = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const player = useVideoPlayer(videoSource, player => {
    player.loop = true;
    player.play();
  });

  useEffect(() => {
    const subscription = player.addListener('playingChange', isPlaying => {
      setIsPlaying(isPlaying);
    });

    return () => {
      subscription.remove();
    };
  }, [player]);

  return (
    <View style={styles.contentContainer}>
      <VideoView
        ref={ref}
        style={styles.video}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
      />
      <View style={styles.controlsContainer}>
        <Button
          title={isPlaying ? 'Pause' : 'Play'}
          onPress={() => {
            if (isPlaying) {
              player.pause();
            } else {
              player.play();
            }
            setIsPlaying(!isPlaying);
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 50,
  },
  video: {
    width: 350,
    height: 275,
  },
  controlsContainer: {
    padding: 10,
  },
});
```

----------------------------------------

TITLE: Handling Push Notifications with Expo Router
DESCRIPTION: This TypeScript snippet demonstrates how to integrate push notification deep linking with Expo Router. It uses a custom `useNotificationObserver` hook to listen for initial and runtime notification responses, redirecting to the URL specified in the notification data. It's designed to be used in the root layout of an Expo Router application.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/v51.0.0/sdk/notifications.mdx#_snippet_2

LANGUAGE: tsx
CODE:
```
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

function useNotificationObserver() {
  useEffect(() => {
    let isMounted = true;

    function redirect(notification: Notifications.Notification) {
      const url = notification.request.content.data?.url;
      if (url) {
        /* @info Push the URL. You may want to verify the format before navigating. */
        router.push(url);
        /* @end */
      }
    }

    /* @info Handle the initial push notification. */
    Notifications.getLastNotificationResponseAsync() /* @end */
      .then(response => {
        if (!isMounted || !response?.notification) {
          return;
        }
        redirect(response?.notification);
      });

    /* @info Listen for runtime notifications. */
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      /* @end */
      redirect(response.notification);
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);
}

export default function Layout() {
  /* @info Observe at the root. Ensure this layout never returns <b>null</b> or the navigation will go unhandled. */
  useNotificationObserver();
  /* @end */

  return <Slot />;
}
```

----------------------------------------

TITLE: Integrating Session Provider in Root Layout (TypeScript)
DESCRIPTION: This snippet shows the initial setup of the root layout (`app/_layout.tsx`) for an Expo Router application. It wraps the entire application with the `SessionProvider` to make the authentication context available globally. The `SplashScreenController` is placed inside the `SessionProvider` to ensure it can access the authentication loading state.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/router/advanced/authentication.mdx#_snippet_3

LANGUAGE: tsx
CODE:
```
import { Slot } from 'expo-router';
import { SessionProvider } from '../ctx';
import { SplashScreenController } from '../splash'

export default function Root() {
  // Set up the auth context and render our layout inside of it.
  return (
    <SessionProvider>
      <SplashScreenController />
      <RootNavigator />
    </SessionProvider>
  );
}

// Separate this into a new component so it can access the SessionProvider context later
function RootNavigator() {
  return <Stack />
}
```

----------------------------------------

TITLE: Requesting Tracking Permissions in React Native
DESCRIPTION: This React Native (JSX) example demonstrates how to use the `requestTrackingPermissionsAsync` function from `expo-tracking-transparency` within a `useEffect` hook. It asynchronously requests user tracking permissions and logs a message if permission is granted, showcasing basic integration.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/v51.0.0/sdk/tracking-transparency.mdx#_snippet_3

LANGUAGE: jsx
CODE:
```
import { useEffect } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';

export default function App() {
  useEffect(() => {
    (async () => {
      const { status } = await requestTrackingPermissionsAsync();
      if (status === 'granted') {
        console.log('Yay! I have user permission to track data');
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text>Tracking Transparency Module Example</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

----------------------------------------

TITLE: Start Expo Development Server
DESCRIPTION: Run the development server using npx expo start to begin developing your Expo Router application with static rendering enabled. This command launches the local development environment.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/router/reference/static-rendering.mdx#_snippet_2

LANGUAGE: bash
CODE:
```
$ npx expo start
```

----------------------------------------

TITLE: Implementing Basic Protected Routes with Stack Navigator (TypeScript)
DESCRIPTION: This snippet demonstrates how to protect routes using `Stack.Protected` in Expo Router. The `guard` prop determines access; if `!isLoggedIn` is true, the 'login' screen is protected, and if `isLoggedIn` is true, the 'private' screen is protected. Users attempting to access a protected screen when the guard is false are redirected to the anchor route (index).
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/router/advanced/protected.mdx#_snippet_0

LANGUAGE: TypeScript
CODE:
```
import { Stack } from 'expo-router';

const isLoggedIn = false;

export function AppLayout() {
  return (
    <Stack>
      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="login" />
      </Stack.Protected>

      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="private" />
      </Stack.Protected>
      {/* Expo Router includes all routes by default. Adding Stack.Protected creates exceptions for these screens. */}
    </Stack>
  );
}
```

----------------------------------------

TITLE: Setting up Express Server for Expo Router
DESCRIPTION: This TypeScript/JavaScript code defines an Express server entry file (`server.ts`) that serves static client files from `dist/client` and delegates requests to Expo Router server routes using `@expo/server/adapter/express` from `dist/server`. It includes middleware for compression and logging.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/router/reference/api-routes.mdx#_snippet_24

LANGUAGE: ts
CODE:
```
#!/usr/bin/env node

const path = require('path');
const { createRequestHandler } = require('@expo/server/adapter/express');

const express = require('express');
const compression = require('compression');
const morgan = require('morgan');

const CLIENT_BUILD_DIR = path.join(process.cwd(), 'dist/client');
const SERVER_BUILD_DIR = path.join(process.cwd(), 'dist/server');

const app = express();

app.use(compression());

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable('x-powered-by');

process.env.NODE_ENV = 'production';

app.use(
  express.static(CLIENT_BUILD_DIR, {
    maxAge: '1h',
    extensions: ['html'],
  })
);

app.use(morgan('tiny'));

app.all(
  '*',
  createRequestHandler({
    build: SERVER_BUILD_DIR,
  })
);
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});
```

----------------------------------------

TITLE: Defining a Basic Expo Config Plugin in app.plugin.js
DESCRIPTION: This snippet shows a minimal Expo config plugin defined in 'app.plugin.js'. This file serves as the primary entry point for custom plugins within a Node module, allowing for different transpilation settings than the module's 'main' file. It receives the Expo config object and returns the modified config.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/config-plugins/plugins-and-mods.mdx#_snippet_13

LANGUAGE: javascript
CODE:
```
module.exports = config => config;
```

----------------------------------------

TITLE: Automated Production Deployment Workflow with EAS
DESCRIPTION: This YAML configuration defines an automated CI/CD workflow for deploying Expo applications to production. Triggered on pushes to the `main` branch, it uses Expo Fingerprint to detect native changes. Based on this, it either initiates new builds and submissions to app stores via EAS Build and Submit, or publishes over-the-air updates via EAS Update if no new build is required.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/eas/workflows/examples.mdx#_snippet_6

LANGUAGE: YAML
CODE:
```
name: Deploy to production

on:
  push:
    branches: ['main']

jobs:
  fingerprint:
    name: Fingerprint
    type: fingerprint
  get_android_build:
    name: Check for existing android build
    needs: [fingerprint]
    type: get-build
    params:
      fingerprint_hash: ${{ needs.fingerprint.outputs.android_fingerprint_hash }}
      profile: production
  get_ios_build:
    name: Check for existing ios build
    needs: [fingerprint]
    type: get-build
    params:
      fingerprint_hash: ${{ needs.fingerprint.outputs.ios_fingerprint_hash }}
      profile: production
  build_android:
    name: Build Android
    needs: [get_android_build]
    if: ${{ !needs.get_android_build.outputs.build_id }}
    type: build
    params:
      platform: android
      profile: production
  build_ios:
    name: Build iOS
    needs: [get_ios_build]
    if: ${{ !needs.get_ios_build.outputs.build_id }}
    type: build
    params:
      platform: ios
      profile: production
  submit_android_build:
    name: Submit Android Build
    needs: [build_android]
    type: submit
    params:
      build_id: ${{ needs.build_android.outputs.build_id }}
  submit_ios_build:
    name: Submit iOS Build
    needs: [build_ios]
    type: submit
    params:
      build_id: ${{ needs.build_ios.outputs.build_id }}
  publish_android_update:
    name: Publish Android update
    needs: [get_android_build]
    if: ${{ needs.get_android_build.outputs.build_id }}
    type: update
    params:
      branch: production
      platform: android
  publish_ios_update:
    name: Publish iOS update
    needs: [get_ios_build]
    if: ${{ needs.get_ios_build.outputs.build_id }}
    type: update
    params:
      branch: production
      platform: ios
```

----------------------------------------

TITLE: Publishing a New Update to a Branch with EAS CLI
DESCRIPTION: This command creates and publishes a new update to a specified branch, including a custom message. The example shows publishing an update to 'version-1.0' with a 'Fixes typo' message.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/eas-update/eas-cli.mdx#_snippet_6

LANGUAGE: Shell
CODE:
```
$ eas update --branch [branch-name] --message "..."

# Example
$ eas update --branch version-1.0 --message "Fixes typo"
```

----------------------------------------

TITLE: Importing Global CSS in Expo Router Layout (Tailwind v3)
DESCRIPTION: This TypeScript snippet shows how to import the `global.css` file into your `app/_layout.tsx` file when using Expo Router. This makes Tailwind CSS styles available throughout your application for v3.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/guides/tailwind.mdx#_snippet_4

LANGUAGE: tsx
CODE:
```
import '../global.css';
```

----------------------------------------

TITLE: Sending Basic Slack Build Notifications (YAML)
DESCRIPTION: This workflow builds an iOS app and then sends a basic Slack notification using a hardcoded webhook URL. The message includes the app identifier and version, dynamically retrieved from the outputs of the preceding build job.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/eas/workflows/pre-packaged-jobs.mdx#_snippet_31

LANGUAGE: yaml
CODE:
```
name: Build Notification

jobs:
  build_ios:
    name: Build iOS
    type: build
    params:
      platform: ios
      profile: production

  notify_build:
    name: Notify Build Status
    needs: [build_ios]
    type: slack
    params:
      webhook_url: https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
      message: 'Build completed for app ${{ needs.build_ios.outputs.app_identifier }} (version ${{ needs.build_ios.outputs.app_version }})'
```

----------------------------------------

TITLE: Full Example of Dynamic Theming with useColorScheme
DESCRIPTION: This comprehensive TypeScript snippet provides a minimal working example of an Expo app that dynamically adjusts its colors based on the system's color scheme using `useColorScheme`. It defines styles for both light and dark themes and applies them conditionally to text and container components, also integrating `expo-status-bar` for automatic status bar styling.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/develop/user-interface/color-themes.mdx#_snippet_8

LANGUAGE: tsx
CODE:
```
import { Text, StyleSheet, View, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const colorScheme = useColorScheme();

  const themeTextStyle = colorScheme === 'light' ? styles.lightThemeText : styles.darkThemeText;
  const themeContainerStyle =
    colorScheme === 'light' ? styles.lightContainer : styles.darkContainer;

  return (
    <View style={[styles.container, themeContainerStyle]}>
      <Text style={[styles.text, themeTextStyle]}>Color scheme: {colorScheme}</Text>
      <StatusBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 20,
  },
  lightContainer: {
    backgroundColor: '#d0d0c0',
  },
  darkContainer: {
    backgroundColor: '#242c40',
  },
  lightThemeText: {
    color: '#242c40',
  },
  darkThemeText: {
    color: '#d0d0c0',
  }
});
```

----------------------------------------

TITLE: Saving and Retrieving Values with Expo SecureStore in React Native
DESCRIPTION: This React Native component demonstrates the practical usage of `expo-secure-store` to save and retrieve sensitive key-value pairs. It includes asynchronous functions `save` and `getValueFor` that interact with `SecureStore.setItemAsync` and `SecureStore.getItemAsync`, respectively, and integrates them into a simple UI with text inputs and buttons.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/v52.0.0/sdk/securestore.mdx#_snippet_5

LANGUAGE: jsx
CODE:
```
import { useState } from 'react';
import { Text, View, StyleSheet, TextInput, Button } from 'react-native';
import * as SecureStore from 'expo-secure-store';

async function save(key, value) {
  await SecureStore.setItemAsync(key, value);
}

async function getValueFor(key) {
  let result = await SecureStore.getItemAsync(key);
  if (result) {
    alert("🔐 Here's your value 🔐 \n" + result);
  } else {
    alert('No values stored under that key.');
  }
}

export default function App() {
  const [key, onChangeKey] = useState('Your key here');
  const [value, onChangeValue] = useState('Your value here');

  return (
    <View style={styles.container}>
      <Text style={styles.paragraph}>Save an item, and grab it later!</Text>

      <TextInput
        style={styles.textInput}
        clearTextOnFocus
        onChangeText={text => onChangeKey(text)}
        value={key}
      />
      <TextInput
        style={styles.textInput}
        clearTextOnFocus
        onChangeText={text => onChangeValue(text)}
        value={value}
      />
      <Button
        title="Save this key/value pair"
        onPress={() => {
          save(key, value);
          onChangeKey('Your key here');
          onChangeValue('Your value here');
        }}
      />
      <Text style={styles.paragraph}>🔐 Enter your key 🔐</Text>
      <TextInput
        style={styles.textInput}
        onSubmitEditing={event => {
          getValueFor(event.nativeEvent.text);
        }}
        placeholder="Enter the key for the value you want to get"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 10,
    backgroundColor: '#ecf0f1',
    padding: 8,
  },
  paragraph: {
    marginTop: 34,
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  textInput: {
    height: 35,
    borderColor: 'gray',
    borderWidth: 0.5,
    padding: 4,
  },
});
```

----------------------------------------

TITLE: Accessing Safe Area Insets with `useSafeAreaInsets` Hook
DESCRIPTION: This snippet illustrates the use of the `useSafeAreaInsets` hook, which provides direct access to the device's safe area inset values (top, right, bottom, left). This allows for manual application of insets, such as setting `paddingTop` based on `insets.top`, offering more granular control than `SafeAreaView`.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/v53.0.0/sdk/safe-area-context.mdx#_snippet_2

LANGUAGE: jsx
CODE:
```
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function HookComponent() {
  const insets = useSafeAreaInsets();

  return <View style={{ paddingTop: insets.top }} />;
}
```

----------------------------------------

TITLE: Defining Multiple Sequential Steps in EAS Build (YAML)
DESCRIPTION: This configuration demonstrates how to define and execute multiple steps sequentially within an EAS Build. It includes steps for checking out the project, installing npm dependencies, and running tests, showcasing a typical multi-stage build workflow.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/custom-builds/schema.mdx#_snippet_4

LANGUAGE: YAML
CODE:
```
build:
  name: Run tests
  steps:
    # @info #
    - eas/checkout
    - run:
        name: Install dependencies
        command: npm install
    - run:
        name: Run tests
        command: |
          echo "Running tests..."
          npm test
    # @end #
```

----------------------------------------

TITLE: Changing Route Parameters in Expo Router (TypeScript)
DESCRIPTION: This example illustrates various methods to change the `user` route parameter in Expo Router, effectively navigating to new user pages. It demonstrates using `router.setParams`, `router.push`, and the `Link` component to update the route parameter and trigger a component re-mount.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/router/reference/url-parameters.mdx#_snippet_10

LANGUAGE: tsx
CODE:
```
import { Text } from 'react-native';
import { router, useLocalSearchParams, Link } from 'expo-router';

export default function User() {
  // All three of these will change the route parameter `user`, and add a new user page.
  return (
    <>
      <Text onPress={() => router.setParams({ user: 'evan' })}>Go to Evan</Text>
      <Text onPress={() => router.push('/mark')}>Go to Mark</Text>
      <Link href="/charlie">Go to Charlie</Link>
    </>
  );
}
```

----------------------------------------

TITLE: Basic Camera Usage in React Native with Expo Camera (TypeScript)
DESCRIPTION: This TypeScript React Native example illustrates the fundamental steps for integrating `expo-camera`. It covers requesting camera permissions, conditionally rendering the camera view, and implementing a button to toggle between the front and back cameras, providing a complete minimal working example.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/versions/v53.0.0/sdk/camera.mdx#_snippet_4

LANGUAGE: tsx
CODE:
```
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function App() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});
```

----------------------------------------

TITLE: Installing EAS CLI - Shell
DESCRIPTION: This command globally installs the Expo Application Services (EAS) command-line interface, which is a prerequisite for building and managing Expo projects.
SOURCE: https://github.com/expo/expo/blob/main/docs/scenes/get-started/set-up-your-environment/instructions/androidPhysicalDevelopmentBuild.mdx#_snippet_0

LANGUAGE: Shell
CODE:
```
$ npm install -g eas-cli
```

----------------------------------------

TITLE: Logging in to EAS CLI (Shell)
DESCRIPTION: This command initiates the login process for the EAS CLI, connecting your local environment to your Expo account for build and deployment services.
SOURCE: https://github.com/expo/expo/blob/main/docs/scenes/get-started/set-up-your-environment/instructions/iosSimulatedDevelopmentBuild.mdx#_snippet_1

LANGUAGE: shell
CODE:
```
$ eas login
```

----------------------------------------

TITLE: Clearing Bundler Caches with Expo CLI and Yarn
DESCRIPTION: This set of commands clears various development caches for an Expo CLI project using Yarn. It removes `node_modules`, cleans the global Yarn cache, reinstalls dependencies, resets Watchman, clears temporary Metro/Haste-map caches, and finally restarts the Expo development server with a cleared JavaScript transformation cache.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/troubleshooting/clear-cache-macos-linux.mdx#_snippet_0

LANGUAGE: Shell
CODE:
```
# With Yarn workspaces, you may need to delete node_modules in each workspace
$ rm -rf node_modules

$ yarn cache clean

$ yarn

$ watchman watch-del-all

$ rm -fr $TMPDIR/haste-map-*

$ rm -rf $TMPDIR/metro-cache

$ npx expo start --clear
```

----------------------------------------

TITLE: Applying a Custom Expo Config Plugin in app.config.js
DESCRIPTION: This `app.config.js` snippet demonstrates how to import and apply a custom Expo config plugin, `withMySDK`, to an `ExpoConfig` object. It initializes a basic config with a `name` and then exports the result of applying `withMySDK` with a specific `apiKey`, effectively modifying the config before it's used by Expo.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/config-plugins/plugins-and-mods.mdx#_snippet_2

LANGUAGE: javascript
CODE:
```
const { withMySDK } = require('./my-plugin');

/* @info Create a config */
const config = {
  /* @end */
  name: 'my app',
};

/* @info Apply the plugin */
module.exports = withMySDK(config, { apiKey: 'X-XXX-XXX' });
/* @end */
```

----------------------------------------

TITLE: Diagnosing Expo Project Issues with Expo Doctor
DESCRIPTION: This command executes Expo Doctor, a command-line tool that diagnoses common issues within an Expo project's configuration, dependencies, and overall health, providing actionable advice for fixes.
SOURCE: https://github.com/expo/expo/blob/main/docs/pages/develop/tools.mdx#_snippet_2

LANGUAGE: Shell
CODE:
```
npx expo-doctor
```