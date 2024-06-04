import NextAuth from 'next-auth';
import 'next-auth/jwt';

import Credentials from 'next-auth/providers/credentials';
import type { NextAuthConfig } from 'next-auth';

// generate random string
const randomString = (length: number): string => [...Array(length)].map(() => Math.random().toString(36)[2]).join('');

const config = {
  theme: { logo: 'https://authjs.dev/img/logo-sm.png' },
  providers: [
    Credentials({
      async authorize() {
        // Add logic here to look up the user from the credentials supplied
        const user = { id: '1', name: 'J aaaaaaaaSmith', email: 'jsmith@example.com', accessToken: randomString(32), refreshToken: randomString(32), トークン有効期限: new Date(Date.now() + 20000) };

        if (user) {
          // Any object returned will be saved in `user` property of the JWT
          return user;
        } else {
          // If you return null then an error will be displayed advising the user to check their details.
          return null;

          // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
        }
      },
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: 'Credentials',
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        username: { label: 'Username', type: 'text', placeholder: 'jsmith' },
        password: { label: 'Password', type: 'password' },
      },
    }),
  ],
  basePath: '/auth',
  session: {
    strategy: 'jwt',
    maxAge: 30,
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        console.log('ログイン時');
        return { ...token, accessToken: user.accessToken, refreshToken: user.refreshToken, トークン有効期限: user['トークン有効期限'] };
      } else if (Date.now() < new Date(token.トークン有効期限).getTime()) {
        console.log('アクセストークン有効期限が切れていません');
        return token;
      } else {
        if (!token.refreshToken) throw new Error('Missing refresh token');

        console.log('アクセストークン有効期限が切れています');
        const accessToken = randomString(32);
        const refreshToken = randomString(32);
        console.log('新しいアクセストークン発行');

        return {
          ...token,
          accessToken,
          refreshToken,
          トークン有効期限: new Date(Date.now() + 20000),
        };
      }
    },
    session({ session, token }) {
      // console.log(token);
      if (token?.accessToken) {
        session.accessToken = token.accessToken;
      }
      if (token?.refreshToken) {
        session.refreshToken = token.refreshToken;
      }
      if (token['トークン有効期限']) {
        session['トークン有効期限'] = token['トークン有効期限'];
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV !== 'production' ? true : false,
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    トークン有効期限: Date;
  }
  interface User {
    accessToken?: string;
    refreshToken?: string;
    トークン有効期限: Date;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    トークン有効期限: Date;
  }
}
