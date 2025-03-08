import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import type { Account, Session, User, Profile } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { TokenSetParameters } from "openid-client";
import GoogleProvider from "next-auth/providers/google";
import TwitterProvider from "next-auth/providers/twitter";
import LinkedInProvider from "next-auth/providers/linkedin";

interface ExtendedAccount extends Account {
    oauth_token?: string;
    oauth_token_secret?: string;
    access_token?: string;
}

interface ExtendedSession extends Session {
    accessToken?: string;
    user?: {
        firstname?: string;
        lastname?: string;
    } & Session["user"];
}

interface ExtendedToken extends JWT {
    accessToken?: string;
    provider?: string;
}

interface ExtendedUser extends User {
    firstname?: string;
    lastname?: string;
}

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        TwitterProvider({
            clientId: process.env.TWITTER_OAUTH_1_KEY!,
            clientSecret: process.env.TWITTER_OAUTH_1_SECRET!,
        }),
        LinkedInProvider({
            clientId: process.env.LINKEDIN_CLIENT_ID!,
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
            authorization: {
                params: {
                    scope: "profile email openid w_member_social w_organization_social",
                },
            },
            issuer: "https://www.linkedin.com/oauth",
            jwks_endpoint: "https://www.linkedin.com/oauth/openid/jwks",
            async profile(profile, tokens) {
                if (!profile?.sub) {
                    throw new Error("No sub found in LinkedIn profile");
                }

                const userProfile = {
                    id: profile.sub,
                    name: (profile.name ?? `${profile.given_name || ''} ${profile.family_name || ''}`.trim()) || 'LinkedIn User',
                    email: profile.email,
                    image: profile.picture,
                    firstname: profile.given_name,
                    lastname: profile.family_name,
                } as ExtendedUser;

                return userProfile;
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account }: { user: ExtendedUser, account: ExtendedAccount | null }): Promise<boolean | string> {
            if (account && account.provider !== "google") {
                let token: string | undefined = account.access_token;
                let secret: string | undefined = undefined;

                if (account.provider === "twitter") {
                    token = account.oauth_token;
                    secret = account.oauth_token_secret;
                }

                if (!token) {
                    console.error(
                        `No token found for ${account.provider} login`
                    );
                    return false;
                }

                return `/api/user/save-token?provider=${
                    account.provider
                }&token=${token}${secret ? `&secret=${secret}` : ""}`;
            }
            return true;
        },
        async session({ session, token, user }: { session: ExtendedSession, token: ExtendedToken, user: ExtendedUser }): Promise<ExtendedSession> {
            if (!session.user) {
                session.user = {};
            }

            // Make sure we only set accessToken if it exists in the token
            if (session.user.email && token.accessToken) {
                session.accessToken = token.accessToken;
            }

            // Include firstname and lastname in session if available
            if (user?.firstname) {
                session.user.firstname = user.firstname;
            }
            if (user?.lastname) {
                session.user.lastname = user.lastname;
            }

            return session;
        },
        async jwt({ token, account }: { token: ExtendedToken, account: ExtendedAccount | null }): Promise<ExtendedToken> {
            if (account?.provider === "google") {
                token.accessToken = account.access_token;
                token.provider = account.provider;
            }
            return token;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
