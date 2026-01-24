import { SignedIn, SignedOut, SignInButton, UserButton, useSignIn } from "@clerk/clerk-react";

export default function Auth() {
  const { signIn } = useSignIn();

  const handleGoogleSignIn = () => {
    signIn?.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/",
    });
  };

  return (
    <div>
      <SignedOut>
        <SignInButton />
        <button onClick={handleGoogleSignIn}>Login com Google</button>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  );
}
