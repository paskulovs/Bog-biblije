import type { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";
import { authOptions } from "../../lib/auth";

interface SignInPageProps {
  callbackUrl: string;
  error: string | null;
}

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: "Korisničko ime ili lozinka nisu ispravni.",
};

const getSafeCallbackUrl = (value: unknown) => {
  const callbackUrl = Array.isArray(value) ? value[0] : value;

  if (typeof callbackUrl !== "string") {
    return "/cms";
  }

  const isCmsCallback =
    callbackUrl === "/cms" || callbackUrl.startsWith("/cms/") || callbackUrl.startsWith("/cms?");

  if (!isCmsCallback) {
    return "/cms";
  }

  return callbackUrl;
};

export default function SignInPage({ callbackUrl, error }: SignInPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState(
    error ? AUTH_ERROR_MESSAGES[error] || "Prijava nije uspela. Pokušajte ponovo." : ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      const response = await signIn("credentials", {
        username,
        password,
        callbackUrl,
        redirect: false,
      });

      if (response?.error) {
        setFormError(AUTH_ERROR_MESSAGES[response.error] || "Prijava nije uspela. Pokušajte ponovo.");
        setIsSubmitting(false);
        return;
      }

      window.location.assign(callbackUrl);
    } catch {
      setFormError("Prijava trenutno nije dostupna. Pokušajte ponovo.");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>CMS prijava | Bog Biblije</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="auth-shell">
        <section className="auth-panel" aria-labelledby="signin-title">
          <div className="auth-brand-row">
            <Link href="/" passHref>
              <a className="auth-brand">
                <Image
                  src="/images/logo_white.png"
                  alt="Bog Biblije"
                  width={44}
                  height={44}
                  className="auth-brand-logo"
                />
                <span>Bog Biblije</span>
              </a>
            </Link>
            <span className="auth-badge">CMS</span>
          </div>

          <p className="auth-kicker">Administracija</p>
          <h1 className="auth-title" id="signin-title">
            Prijava u CMS
          </h1>
          <p className="auth-copy">Pristup za uređivanje sadržaja sajta Bog Biblije.</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="cms-admin-field">
              <label className="cms-admin-label" htmlFor="cms-username">
                Korisničko ime
              </label>
              <div className="auth-input-wrap">
                <i className="bi-person auth-input-icon" aria-hidden="true"></i>
                <input
                  id="cms-username"
                  className="cms-admin-input"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                />
              </div>
            </div>

            <div className="cms-admin-field">
              <label className="cms-admin-label" htmlFor="cms-password">
                Lozinka
              </label>
              <div className="auth-input-wrap">
                <i className="bi-lock auth-input-icon" aria-hidden="true"></i>
                <input
                  id="cms-password"
                  className="cms-admin-input"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
            </div>

            {formError ? (
              <div className="auth-error" role="alert">
                <i className="bi-exclamation-circle" aria-hidden="true"></i>
                <span>{formError}</span>
              </div>
            ) : null}

            <button type="submit" className="btn custom-btn auth-submit" disabled={isSubmitting}>
              {isSubmitting ? "Prijava..." : "Prijavi se"}
              <i className="bi-arrow-right" aria-hidden="true"></i>
            </button>
          </form>

          <div className="auth-footer-row">
            <Link href="/" passHref>
              <a className="auth-back-link">Nazad na sajt</a>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<SignInPageProps> = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  const callbackUrl = getSafeCallbackUrl(context.query.callbackUrl);

  if (session) {
    return {
      redirect: {
        destination: callbackUrl,
        permanent: false,
      },
    };
  }

  return {
    props: {
      callbackUrl,
      error: typeof context.query.error === "string" ? context.query.error : null,
    },
  };
};
