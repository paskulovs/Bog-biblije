import type { GetServerSideProps, NextApiRequest, NextApiResponse } from "next";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";

const getConfiguredCmsCredentials = () => ({
  username: process.env.CMS_USERNAME,
  password: process.env.CMS_PASSWORD,
});

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "CMS prijava",
      credentials: {
        username: { label: "Korisnicko ime", type: "text" },
        password: { label: "Lozinka", type: "password" },
      },
      async authorize(credentials) {
        const configuredCredentials = getConfiguredCmsCredentials();

        if (!configuredCredentials.username || !configuredCredentials.password) {
          console.warn("CMS credentials are not configured.");
          return null;
        }

        if (
          credentials?.username !== configuredCredentials.username ||
          credentials?.password !== configuredCredentials.password
        ) {
          return null;
        }

        return {
          id: "cms-admin",
          name: configuredCredentials.username,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
};

export const getCmsSession = (req: NextApiRequest, res: NextApiResponse) =>
  getServerSession(req, res, authOptions);

export const requireCmsPageAuth: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    const callbackUrl = encodeURIComponent(context.resolvedUrl || "/cms");

    return {
      redirect: {
        destination: `/auth/signin?callbackUrl=${callbackUrl}`,
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export const requireCmsApiAuth = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getCmsSession(req, res);

  if (!session) {
    res.status(401).json({ error: "Unauthorized." });
    return false;
  }

  return true;
};
