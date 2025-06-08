TITLE: Enabling Row Level Security and Public Access for 'todos' Table (SQL)
DESCRIPTION: This SQL snippet enables Row Level Security (RLS) on the 'todos' table to control data access. It then creates a policy named 'Allow public access' that grants 'anon' (anonymous) users permission to perform SELECT operations on the 'todos' table, making the data publicly readable via the API.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/api/quickstart.mdx#_snippet_1

LANGUAGE: SQL
CODE:
```
-- Turn on security
alter table "todos"
enable row level security;

-- Allow anonymous access
create policy "Allow public access"
  on todos
  for select
  to anon
  using (true);
```

----------------------------------------

TITLE: Adding Admin Role to JWT Claims (SQL)
DESCRIPTION: This SQL function implements a custom access token hook that checks if a user is an administrator based on an `is_admin` flag in a `profiles` table. If the user is an admin, it adds an `admin: true` claim to their `app_metadata` within the JWT, allowing for restricted actions. It also includes DDL for the `profiles` table and grants/revokes for permissions.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/auth/auth-hooks/custom-access-token-hook.mdx#_snippet_3

LANGUAGE: SQL
CODE:
```
create table profiles (
  user_id uuid not null primary key references auth.users (id),
  is_admin boolean not null default false
);
```

LANGUAGE: SQL
CODE:
```
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
as $$
  declare
    claims jsonb;
    is_admin boolean;
  begin
    -- Check if the user is marked as admin in the profiles table
    select is_admin into is_admin from profiles where user_id = (event->>'user_id')::uuid;

    -- Proceed only if the user is an admin
    if is_admin then
      claims := event->'claims';

      -- Check if 'app_metadata' exists in claims
      if jsonb_typeof(claims->'app_metadata') is null then
        -- If 'app_metadata' does not exist, create an empty object
        claims := jsonb_set(claims, '{app_metadata}', '{}');
      end if;

      -- Set a claim of 'admin'
      claims := jsonb_set(claims, '{app_metadata, admin}', 'true');

      -- Update the 'claims' object in the original event
      event := jsonb_set(event, '{claims}', claims);
    end if;

    -- Return the modified or original event
    return event;
  end;
$$;
```

LANGUAGE: SQL
CODE:
```
grant all
  on table public.profiles
  to supabase_auth_admin;

revoke all
  on table public.profiles
  from authenticated, anon, public;
```

----------------------------------------

TITLE: Handle Email Webhook and Send via Postmark - Deno/JavaScript
DESCRIPTION: Implements a Deno serverless function using `Deno.serve` to handle incoming webhook requests. It verifies the webhook signature, extracts user and email data, determines the user's preferred language, selects the appropriate email template, generates the confirmation URL, replaces placeholders in the HTML body, and sends the email using the Postmark API via a fetch request.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/auth/auth-hooks/send-email-hook.mdx#_snippet_19

LANGUAGE: JavaScript
CODE:
```
Deno.serve(async (req) => {
  const payload = await req.text()
  const serverToken = Deno.env.get('POSTMARK_SERVER_TOKEN')
  const headers = Object.fromEntries(req.headers)
  const base64_secret = Deno.env.get('SEND_EMAIL_HOOK_SECRET').replace('v1,whsec_', '')
  const wh = new Webhook(base64_secret)
  const { user, email_data } = wh.verify(payload, headers)

  const language = (user.user_metadata && user.user_metadata.i18n) || 'en'
  const subject = subjects[language][email_data.email_action_type] || 'Notification'

  let template = templates[language][email_data.email_action_type]
  const confirmation_url = generateConfirmationURL(email_data)
  let htmlBody = template
    .replace('{{confirmation_url}}', confirmation_url)
    .replace('{{token}}', email_data.token || '')
    .replace('{{new_token}}', email_data.new_token || '')
    .replace('{{site_url}}', email_data.site_url || '')
    .replace('{{old_email}}', email_data.email || '')
    .replace('{{new_email}}', email_data.new_email || '')

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Postmark-Server-Token': serverToken,
    },
    body: JSON.stringify({
      From: FROM_EMAIL,
      To: user.email,
      Subject: subject,
      HtmlBody: htmlBody,
    }),
  }

  try {
    const response = await fetch(postmarkEndpoint, requestOptions)
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Failed to send email: ${errorData.Message}`)
    }
    return new Response(
      JSON.stringify({
        message: 'Email sent successfully.',
      }),

```

----------------------------------------

TITLE: Defining Employees Table Schema (SQL)
DESCRIPTION: This SQL snippet defines the `employees` table with columns for `id`, `name`, `email`, and `created_at`. The `id` column is a primary key with auto-generated identity, and `created_at` defaults to the current timestamp.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/local-development/overview.mdx#_snippet_1

LANGUAGE: sql
CODE:
```
create table employees (
  id bigint primary key generated always as identity,
  name text,
  email text,
  created_at timestamptz default now()
);
```

----------------------------------------

TITLE: Configuring Supabase Environment Variables for Next.js
DESCRIPTION: This snippet illustrates the essential environment variables required to establish a connection between a Next.js application and Supabase. 'NEXT_PUBLIC_SUPABASE_URL' defines the URL of your Supabase project, while 'NEXT_PUBLIC_SUPABASE_ANON_KEY' stores the public anonymous key. These variables are fundamental for the Supabase client to authenticate and interact with your backend services.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/ui-library/content/docs/nextjs/client.mdx#_snippet_0

LANGUAGE: env
CODE:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

----------------------------------------

TITLE: Defining User Profiles Table with Row Level Security Policies
DESCRIPTION: This SQL snippet defines the 'profiles' table for public user profiles, including fields for ID, update timestamp, username, avatar URL, and website. It establishes robust Row Level Security (RLS) policies to control access: public viewing, user-specific insertion, and user-specific updates. Additionally, it configures Supabase Realtime for the 'profiles' table and sets up a 'avatars' storage bucket with policies for public access and user uploads.
SOURCE: https://github.com/supabase/supabase/blob/master/examples/user-management/react-user-management/README.md#_snippet_1

LANGUAGE: sql
CODE:
```
-- Create a table for Public Profiles
create table
  profiles (
    id uuid references auth.users not null,
    updated_at timestamp
    with
      time zone,
      username text unique,
      avatar_url text,
      website text,
      primary key (id),
      unique (username),
      constraint username_length check (char_length(username) >= 3)
  );

alter table
  profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles for
select
  using (true);

create policy "Users can insert their own profile." on profiles for insert
with
  check ((select auth.uid()) = id);

create policy "Users can update own profile." on profiles for
update
  using ((select auth.uid()) = id);

-- Set up Realtime!
begin;

drop
  publication if exists supabase_realtime;

create publication supabase_realtime;

commit;

alter
  publication supabase_realtime add table profiles;

-- Set up Storage!
insert into
  storage.buckets (id, name)
values
  ('avatars', 'avatars');

create policy "Avatar images are publicly accessible." on storage.objects for
select
  using (bucket_id = 'avatars');

create policy "Anyone can upload an avatar." on storage.objects for insert
with
  check (bucket_id = 'avatars');
```

----------------------------------------

TITLE: Implement Supabase Session Update Middleware Logic
DESCRIPTION: This utility function `updateSession` creates a Supabase client instance configured for server-side rendering (SSR) within middleware. It uses `supabase.auth.getUser()` to refresh the session and handles redirects for unauthenticated users attempting to access protected routes. It's crucial to return the modified `supabaseResponse` to propagate cookie changes.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/auth/server-side/nextjs.mdx#_snippet_4

LANGUAGE: typescript
CODE:
```
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: {
      user
    },
  } = await supabase.auth.getUser()

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}
```

----------------------------------------

TITLE: Defining Insert Policy for User Profiles - Supabase SQL
DESCRIPTION: This RLS policy grants users permission to insert new profile entries. The 'with check' clause ensures that a user can only insert a profile where the 'id' matches their authenticated user ID (auth.uid()).
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/_partials/user_management_quickstart_sql_template.mdx#_snippet_2

LANGUAGE: SQL
CODE:
```
create policy "Users can insert their own profile." on profiles
  for insert with check ((select auth.uid()) = id);
```

----------------------------------------

TITLE: Querying PostgreSQL with Drizzle ORM and node-postgres in Deno Edge Function
DESCRIPTION: This Deno Edge Function demonstrates connecting to a PostgreSQL database using `node-postgres` and querying data with Drizzle ORM. It defines a 'users' table schema, initializes a PostgreSQL client with a connection string from environment variables, and then uses Drizzle to select all users from the table. The function logs the retrieved users and returns an "ok" response.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/www/_blog/2024-09-12-edge-functions-faster-smaller.mdx#_snippet_2

LANGUAGE: JavaScript
CODE:
```
import { drizzle } from 'npm:drizzle-orm@0.33.0/node-postgres'
import pg from 'npm:pg@8.12.0'
const { Client } = pg

import { pgTable, serial, text, varchar } from 'npm:drizzle-orm@0.33.0/pg-core'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  fullName: text('full_name'),
  phone: varchar('phone', { length: 256 }),
})

const client = new Client({
  connectionString: Deno.env.get('SUPABASE_DB_URL'),
})

await client.connect()
const db = drizzle(client)

Deno.serve(async (req) => {
  const allUsers = await db.select().from(users)
  console.log(allUsers)

  return new Response('ok')
})
```

----------------------------------------

TITLE: Initializing Supabase Project Locally (Shell)
DESCRIPTION: This command initializes a new Supabase project in the current directory and starts the local Supabase stack, including the database and other services. It's a prerequisite for developing Supabase Edge Functions locally.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/ai/quickstarts/generate-text-embeddings.mdx#_snippet_0

LANGUAGE: shell
CODE:
```
supabase init
supabase start
```

----------------------------------------

TITLE: Configuring Supabase Environment Variables
DESCRIPTION: This snippet shows the required environment variables for connecting your application to Supabase. VITE_SUPABASE_URL specifies the Supabase project URL, and VITE_SUPABASE_ANON_KEY is the public API key. These values are crucial for initializing the Supabase client and enabling communication with your backend.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/ui-library/content/docs/react-router/password-based-auth.mdx#_snippet_0

LANGUAGE: env
CODE:
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

----------------------------------------

TITLE: Initializing Supabase Client in JavaScript
DESCRIPTION: This snippet demonstrates how to initialize the Supabase client in JavaScript. It requires the project URL and an anonymous public API key, which can be obtained from the Supabase dashboard. The `createClient` function is used to establish a connection to the Supabase project.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/realtime/broadcast.mdx#_snippet_0

LANGUAGE: JavaScript
CODE:
```
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://<project>.supabase.co'
const SUPABASE_KEY = '<your-anon-key>'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
```

----------------------------------------

TITLE: Setting Up Supabase Environment Variables (.env.local)
DESCRIPTION: This snippet shows how to configure environment variables in a `.env.local` file. It requires setting `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` with your specific Supabase project details. These variables are crucial for the application to connect to your Supabase project.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/auth/server-side/sveltekit.mdx#_snippet_1

LANGUAGE: txt
CODE:
```
PUBLIC_SUPABASE_URL=<your_supabase_project_url>
PUBLIC_SUPABASE_ANON_KEY=<your_supabase_anon_key>
```

----------------------------------------

TITLE: Defining Row Level Security Policies for Supabase Realtime Authorization - SQL
DESCRIPTION: This SQL snippet establishes RLS policies for `public.profiles`, `public.rooms`, `public.rooms_users`, and `realtime.messages`. These policies authorize authenticated users to perform read/insert operations on public tables and control access to Realtime Broadcast and Presence based on user membership in `public.rooms_users`, ensuring secure channel access.
SOURCE: https://github.com/supabase/supabase/blob/master/examples/realtime/nextjs-authorization-demo/README.md#_snippet_1

LANGUAGE: SQL
CODE:
```
CREATE POLICY "authenticated can view all profiles"
ON "public"."profiles"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "supabase_auth_admin can insert profile"
ON "public"."profiles"
AS PERMISSIVE FOR INSERT
TO supabase_auth_admin
WITH CHECK (true);

CREATE POLICY "authenticated can read rooms"
ON "public"."rooms"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (TRUE);

CREATE POLICY "authenticated can add rooms"
ON "public"."rooms"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (TRUE);

CREATE POLICY "authenticated can read rooms_users"
ON "public"."rooms_users"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (TRUE);

CREATE POLICY "authenticated can add rooms_users"
ON "public"."rooms_users"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (TRUE);

CREATE POLICY "authenticated can read broadcast and presence state"
ON "realtime"."messages"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.rooms_users
    WHERE user_id = (select auth.uid())
    AND room_topic = realtime.topic()
    AND realtime.messages.extension in ('broadcast', 'presence')
  )
);

CREATE POLICY "authenticated can send broadcast and track presence"
ON "realtime"."messages"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.rooms_users
    WHERE user_id = (select auth.uid())
    AND room_topic = realtime.topic()
    AND realtime.messages.extension in ('broadcast', 'presence')
  )
);
```

----------------------------------------

TITLE: Creating Todo with Supabase in Next.js Route Handler (JavaScript)
DESCRIPTION: This snippet demonstrates how to handle a POST request in a Next.js Route Handler to insert a new todo item into Supabase. It uses `createRouteHandlerClient` with `cookies()` to establish an authenticated Supabase client, allowing server-side data manipulation based on the user's session.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/auth/auth-helpers/nextjs.mdx#_snippet_19

LANGUAGE: JavaScript
CODE:
```
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request) {
  const { title } = await request.json()
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  const { data } = await supabase.from('todos').insert({ title }).select()
  return NextResponse.json(data)
}
```

----------------------------------------

TITLE: Installing Supabase JavaScript Client
DESCRIPTION: This command installs the official `@supabase/supabase-js` library, which is required to interact with Supabase services from a JavaScript/TypeScript application.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/www/_blog/2022-11-17-fetching-and-caching-supabase-data-in-next-js-server-components.mdx#_snippet_3

LANGUAGE: bash
CODE:
```
npm install @supabase/supabase-js
```

----------------------------------------

TITLE: Calling a Supabase RPC with Large Payload - JavaScript
DESCRIPTION: This JavaScript snippet demonstrates how to call the previously defined PostgreSQL `example` function using Supabase's `rpc` method. It shows how to pass a large array of UUIDs as an argument within the request payload, effectively circumventing the 16KB URL/header limit that causes 520 errors. This is the recommended solution for handling large data inputs.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/troubleshooting/fixing-520-errors-in-the-database-rest-api-Ur5-B2.mdx#_snippet_4

LANGUAGE: javascript
CODE:
```
const { data, error } = await supabase.rpc('example', { id: ['e2f34fb9-bbf9-4649-9b2f-09ec56e67a42', ...900 more UUIDs] })
```

----------------------------------------

TITLE: Correct: Supabase SSR Cookie Handling Pattern (TypeScript)
DESCRIPTION: This snippet illustrates the REQUIRED and correct pattern for handling cookies when initializing Supabase clients for SSR. It mandates the use of `getAll()` and `setAll(cookiesToSet)` methods, ensuring proper session management and preventing application breakage. AI models MUST always generate this exact pattern.
SOURCE: https://github.com/supabase/supabase/blob/master/examples/prompts/nextjs-supabase-auth.md#_snippet_2

LANGUAGE: typescript
CODE:
```
{
  cookies: {
    getAll() {
      return cookieStore.getAll()
    },
    setAll(cookiesToSet) {
      const response = NextResponse.next({
        request,
      })
      
      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options)
      })
      
      return response
    }
  }
}
```

----------------------------------------

TITLE: Initializing a Supabase Project Locally
DESCRIPTION: This command initializes a new Supabase project in the current directory, setting up the necessary local development environment files and configurations. It's the first step to begin working with Supabase locally.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/functions/examples/elevenlabs-generate-speech-stream.mdx#_snippet_0

LANGUAGE: bash
CODE:
```
supabase init
```

----------------------------------------

TITLE: Initializing Next.js Supabase Starter Template
DESCRIPTION: This command initializes a new Next.js project pre-configured with Supabase support. It includes features like Cookie-based Auth, Tailwind CSS styled authentication forms, and examples for Client Components, Server Components, Route Handlers, and Server Actions, all in TypeScript. It's designed to provide a quick start for building full-stack applications with Supabase.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/www/_blog/2023-08-11-launch-week-8-community-highlights.mdx#_snippet_0

LANGUAGE: bash
CODE:
```
npx create-next-app -e with-supabase
```

----------------------------------------

TITLE: Implementing Real-time Chat Page with Supabase and Flutter
DESCRIPTION: This comprehensive Dart code defines the `ChatPage` widget, responsible for displaying real-time messages from Supabase and allowing users to send new ones. It utilizes `StreamBuilder` to listen for message updates, lazily loads sender profiles for display, and includes nested widgets like `_MessageBar` for input and `_ChatBubble` for message rendering. Dependencies include `supabase_flutter` for database interaction and `timeago` for timestamp formatting.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/www/_blog/2022-06-30-flutter-tutorial-building-a-chat-app.mdx#_snippet_13

LANGUAGE: Dart
CODE:
```
import 'dart:async';

import 'package:flutter/material.dart';

import 'package:my_chat_app/models/message.dart';
import 'package:my_chat_app/models/profile.dart';
import 'package:my_chat_app/utils/constants.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:timeago/timeago.dart';

/// Page to chat with someone.
///
/// Displays chat bubbles as a ListView and TextField to enter new chat.
class ChatPage extends StatefulWidget {
  const ChatPage({Key? key}) : super(key: key);

  static Route<void> route() {
    return MaterialPageRoute(
      builder: (context) => const ChatPage(),
    );
  }

  @override
  State<ChatPage> createState() => _ChatPageState();
}

class _ChatPageState extends State<ChatPage> {
  late final Stream<List<Message>> _messagesStream;
  final Map<String, Profile> _profileCache = {};

  @override
  void initState() {
    final myUserId = supabase.auth.currentUser!.id;
    _messagesStream = supabase
        .from('messages')
        .stream(primaryKey: ['id'])
        .order('created_at')
        .map((maps) => maps
            .map((map) => Message.fromMap(map: map, myUserId: myUserId))
            .toList());
    super.initState();
  }

  Future<void> _loadProfileCache(String profileId) async {
    if (_profileCache[profileId] != null) {
      return;
    }
    final data =
        await supabase.from('profiles').select().eq('id', profileId).single();
    final profile = Profile.fromMap(data);
    setState(() {
      _profileCache[profileId] = profile;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Chat')),
      body: StreamBuilder<List<Message>>(
        stream: _messagesStream,
        builder: (context, snapshot) {
          if (snapshot.hasData) {
            final messages = snapshot.data!;
            return Column(
              children: [
                Expanded(
                  child: messages.isEmpty
                      ? const Center(
                          child: Text('Start your conversation now :)'),
                        )
                      : ListView.builder(
                          reverse: true,
                          itemCount: messages.length,
                          itemBuilder: (context, index) {
                            final message = messages[index];

                            /// I know it's not good to include code that is not related
                            /// to rendering the widget inside build method, but for
                            /// creating an app quick and dirty, it's fine 😂
                            _loadProfileCache(message.profileId);

                            return _ChatBubble(
                              message: message,
                              profile: _profileCache[message.profileId],
                            );
                          },
                        ),
                ),
                const _MessageBar(),
              ],
            );
          } else {
            return preloader;
          }
        },
      ),
    );
  }
}

/// Set of widget that contains TextField and Button to submit message
class _MessageBar extends StatefulWidget {
  const _MessageBar({
    Key? key,
  }) : super(key: key);

  @override
  State<_MessageBar> createState() => _MessageBarState();
}

class _MessageBarState extends State<_MessageBar> {
  late final TextEditingController _textController;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.grey[200],
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(8.0),
          child: Row(
            children: [
              Expanded(
                child: TextFormField(
                  keyboardType: TextInputType.text,
                  maxLines: null,
                  autofocus: true,
                  controller: _textController,
                  decoration: const InputDecoration(
                    hintText: 'Type a message',
                    border: InputBorder.none,
                    focusedBorder: InputBorder.none,
                    contentPadding: EdgeInsets.all(8),
                  ),
                ),
              ),
              TextButton(
                onPressed: () => _submitMessage(),
                child: const Text('Send'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void initState() {
    _textController = TextEditingController();
    super.initState();
  }

  @override
  void dispose() {
    _textController.dispose();
    super.dispose();
  }

  void _submitMessage() async {
    final text = _textController.text;
    final myUserId = supabase.auth.currentUser!.id;
    if (text.isEmpty) {
      return;
    }
    _textController.clear();
    try {
      await supabase.from('messages').insert({
        'profile_id': myUserId,
        'content': text,
      });
    } on PostgrestException catch (error) {
      context.showErrorSnackBar(message: error.message);
    } catch (_) {
      context.showErrorSnackBar(message: unexpectedErrorMessage);
    }
  }
}

class _ChatBubble extends StatelessWidget {
  const _ChatBubble({
    Key? key,
    required this.message,
    required this.profile,
  }) : super(key: key);

  final Message message;
  final Profile? profile;

  @override
  Widget build(BuildContext context) {
    List<Widget> chatContents = [
      if (!message.isMine)
        CircleAvatar(
          child: profile == null
              ? preloader
              : Text(profile!.username.substring(0, 2)),
        ),
      const SizedBox(width: 12),
      Flexible(
        child: Container(
          padding: const EdgeInsets.symmetric(
            vertical: 8,
            horizontal: 12,
          ),
          decoration: BoxDecoration(
            color: message.isMine
                ? Theme.of(context).primaryColor
                : Colors.grey[300],
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(message.content),
        ),
      ),
      const SizedBox(width: 12),
      Text(format(message.createdAt, locale: 'en_short')),
      const SizedBox(width: 60),
    ];
    if (message.isMine) {
      chatContents = chatContents.reversed.toList();
    }
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 18),
      child: Row(
        mainAxisAlignment:
            message.isMine ? MainAxisAlignment.end : MainAxisAlignment.start,
        children: chatContents,
      ),
    );
  }
}
```

----------------------------------------

TITLE: Defining Row Level Security Policies in Supabase SQL
DESCRIPTION: This SQL block enables Row Level Security (RLS) for the `users`, `groups`, and `messages` tables, and then defines specific access policies. It allows all users to read user emails and group data, while restricting group creation, message reading, and message creation to authenticated users only. Group owners are also granted permission to delete their own groups, enhancing data security and access control.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/www/_blog/2022-11-08-authentication-in-ionic-angular.mdx#_snippet_1

LANGUAGE: SQL
CODE:
```
-- Secure tables
alter table users enable row level security;
alter table groups enable row level security;
alter table messages enable row level security;

-- User Policies
create policy "Users can read the user email." on users
  for select using (true);

-- Group Policies
create policy "Groups are viewable by everyone." on groups
  for select using (true);

create policy "Authenticated users can create groups." on groups for
  insert to authenticated with check (true);

create policy "The owner can delete a group." on groups for
    delete using ((select auth.uid()) = creator);

-- Message Policies
create policy "Authenticated users can read messages." on messages
  for select to authenticated using (true);

create policy "Authenticated users can create messages." on messages
  for insert to authenticated with check (true);
```

----------------------------------------

TITLE: Configuring Row Level Security Policies
DESCRIPTION: This SQL snippet establishes Row Level Security (RLS) policies for the `drivers` and `rides` tables. These policies enforce data access control, allowing authenticated users to select driver information, enabling drivers to update their own availability, and restricting ride data access and updates to the involved driver or passenger.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/www/_blog/2024-09-05-flutter-uber-clone.mdx#_snippet_4

LANGUAGE: sql
CODE:
```
alter table public.drivers enable row level security;
create policy "Any authenticated users can select drivers." on public.drivers for select to authenticated using (true);
create policy "Drivers can update their own status." on public.drivers for update to authenticated using (auth.uid() = id);

alter table public.rides enable row level security;
create policy "The driver or the passenger can select the ride." on public.rides for select to authenticated using (driver_id = auth.uid() or passenger_id = auth.uid());
create policy "The driver can update the status. " on public.rides for update to authenticated using (auth.uid() = driver_id);
```

----------------------------------------

TITLE: Configuring Supabase Postgres Profiles Table, RLS, Realtime, and Storage
DESCRIPTION: This SQL script defines the `profiles` table with user-related information, establishes Row Level Security (RLS) policies to control data access based on user authentication, sets up Realtime capabilities for the `profiles` table, and initializes a storage bucket for user avatars. RLS policies ensure users can only view public profiles, insert their own, and update their own profile data.
SOURCE: https://github.com/supabase/supabase/blob/master/examples/user-management/solid-user-management/README.md#_snippet_3

LANGUAGE: sql
CODE:
```
-- Create a table for Public Profiles
create table
	profiles (
		id uuid references auth.users not null,
		updated_at timestamp
		with
			time zone,
			username text unique,
			avatar_url text,
			website text,
			primary key (id),
			unique (username),
			constraint username_length check (char_length(username) >= 3)
	);

alter table
	profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles for
select
	using (true);

create policy "Users can insert their own profile." on profiles for insert
with
	check ((select auth.uid()) = id);

create policy "Users can update own profile." on profiles for
update
	using ((select auth.uid()) = id);

-- Set up Realtime!
begin;

drop
	publication if exists supabase_realtime;

create publication supabase_realtime;

commit;

alter
	publication supabase_realtime add table profiles;

-- Set up Storage!
insert into
	storage.buckets (id, name)
values
	('avatars', 'avatars');

create policy "Avatar images are publicly accessible." on storage.objects for
select
	using (bucket_id = 'avatars');

create policy "Anyone can upload an avatar." on storage.objects for insert
with
	check (bucket_id = 'avatars');
```

----------------------------------------

TITLE: Initializing Supabase Client (JavaScript)
DESCRIPTION: This JavaScript file (`src/supabaseClient.js`) initializes and exports a Supabase client instance. It retrieves the Supabase URL and anonymous key from environment variables, enabling the application to interact with the Supabase backend securely.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/getting-started/tutorials/with-react.mdx#_snippet_3

LANGUAGE: javascript
CODE:
```
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

----------------------------------------

TITLE: Signing In with Email and Password - JavaScript
DESCRIPTION: This snippet demonstrates how to sign in a user using their email and password with the Supabase JavaScript client. It calls `signInWithPassword()` and handles the response, which includes user data or an error.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/auth/passwords.mdx#_snippet_16

LANGUAGE: JavaScript
CODE:
```
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://your-project.supabase.co', 'your-anon-key')

// ---cut---
async function signInWithEmail() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'valid.email@supabase.io',
    password: 'example-password',
  })
}
```

----------------------------------------

TITLE: Deprecated: Importing from @supabase/auth-helpers-nextjs (TypeScript)
DESCRIPTION: This code snippet shows DEPRECATED imports from `@supabase/auth-helpers-nextjs`. This package and its functions (`createMiddlewareClient`, `createClientComponentClient`) are no longer supported and will cause the application to break. AI models are strictly prohibited from generating these imports.
SOURCE: https://github.com/supabase/supabase/blob/master/examples/prompts/nextjs-supabase-auth.md#_snippet_1

LANGUAGE: typescript
CODE:
```
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'  // ❌ BREAKS APPLICATION
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'  // ❌ BREAKS APPLICATION
```

----------------------------------------

TITLE: Initializing Supabase Client in Flutter (Dart)
DESCRIPTION: Initializes the Supabase client in the `main.dart` file using the project's URL and public API (anon) key. This setup is crucial for connecting the Flutter app to the Supabase backend.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/getting-started/quickstarts/flutter.mdx#_snippet_2

LANGUAGE: dart
CODE:
```
import 'package:supabase_flutter/supabase_flutter.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Supabase.initialize(
    url: 'YOUR_SUPABASE_URL',
    anonKey: 'YOUR_SUPABASE_ANON_KEY',
  );
  runApp(MyApp());
}
```

----------------------------------------

TITLE: Building a Complete Form with Form Components (TSX)
DESCRIPTION: This comprehensive snippet demonstrates how to construct a complete form using the `<Form>` and `<FormField>` components, integrating the previously defined Zod schema and `useForm` hook. It shows how to render an input field with labels, descriptions, and messages, and includes a submit button.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/design-system/content/docs/components/form.mdx#_snippet_6

LANGUAGE: tsx
CODE:
```
'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const formSchema = z.object({
  username: z.string().min(2, {
    message: 'Username must be at least 2 characters.',
  }),
})

export function ProfileForm() {
  // ...

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>This is your public display name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
```

----------------------------------------

TITLE: Creating Supabase Client Utility Functions for Next.js
DESCRIPTION: Create utility functions to initialize Supabase clients for use in Client Components and Server Components/Actions/Route Handlers, handling cookie management for server-side rendering.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/auth/server-side/nextjs.mdx#_snippet_2

LANGUAGE: ts
CODE:
```
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

LANGUAGE: ts
CODE:
```
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        }
      }
    }
  )
}
```

----------------------------------------

TITLE: Creating Postgres Function and Trigger for New User Profiles
DESCRIPTION: This SQL snippet defines a PostgreSQL function `handle_new_user` and a trigger `on_auth_user_created`. The function automatically inserts a new row into the `public.profiles` table with the user's ID and username (extracted from `raw_user_meta_data`) whenever a new user is inserted into `auth.users`. This ensures that every registered user has a corresponding profile entry.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/www/_blog/2022-06-30-flutter-tutorial-building-a-chat-app.mdx#_snippet_11

LANGUAGE: SQL
CODE:
```
-- Function to create a new row in profiles table upon signup
-- Also copies the username value from metadata
create or replace function handle_new_user() returns trigger as $$
    begin
        insert into public.profiles(id, username)
        values(new.id, new.raw_user_meta_data->>'username');

        return new;
    end;
$$ language plpgsql security definer;

-- Trigger to call `handle_new_user` when new user signs up
create trigger on_auth_user_created
    after insert on auth.users
    for each row
    execute function handle_new_user();
```

----------------------------------------

TITLE: Creating a SELECT Policy for User-Owned Data in Postgres
DESCRIPTION: This policy allows individuals to view only their own 'todos' by comparing the authenticated user's ID (obtained via `auth.uid()`) with the `user_id` column in the `todos` table. It acts as an implicit `WHERE` clause for `SELECT` operations.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/database/postgres/row-level-security.mdx#_snippet_1

LANGUAGE: SQL
CODE:
```
create policy "Individuals can view their own todos."
on todos for select
using ( (select auth.uid()) = user_id );
```

----------------------------------------

TITLE: Configuring Supabase Environment Variables
DESCRIPTION: This snippet shows how to set up environment variables for Supabase project URL and anonymous key, typically in a `.env` file, which are essential for connecting to your Supabase project.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/auth/auth-helpers/remix.mdx#_snippet_1

LANGUAGE: Bash
CODE:
```
SUPABASE_URL=YOUR_SUPABASE_URL
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

----------------------------------------

TITLE: Creating a SELECT Policy for Authenticated Users (SQL)
DESCRIPTION: This policy restricts `SELECT` access on the 'profiles' table to only authenticated users. It uses the `to authenticated` clause to specify the allowed role, making all rows viewable by logged-in users.
SOURCE: https://github.com/supabase/supabase/blob/master/examples/prompts/database-rls-policies.md#_snippet_2

LANGUAGE: SQL
CODE:
```
create policy "Public profiles are viewable only by authenticated users"
on profiles
for select
to authenticated
using ( true );
```

----------------------------------------

TITLE: Automating Profile Creation on New User Signup - SQL
DESCRIPTION: This SQL snippet defines a `public.handle_new_user` function that inserts a new row into the `public.profiles` table when a new user is created in `auth.users`. It then sets up a trigger, `on_auth_user_created`, to execute this function automatically after each `INSERT` operation on the `auth.users` table, populating the profile with `first_name` and `last_name` from `raw_user_meta_data`.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/auth/managing-user-data.mdx#_snippet_1

LANGUAGE: SQL
CODE:
```
-- inserts a row into public.profiles
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (new.id, new.raw_user_meta_data ->> 'first_name', new.raw_user_meta_data ->> 'last_name');
  return new;
end;
$$;

-- trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```