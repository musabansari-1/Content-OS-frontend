import VerifyEmailPage from "../../components/auth/VerifyEmailPage";

export default async function Page({ searchParams }) {
  const params = (await searchParams) ?? {};
  const token = typeof params.token === "string" ? params.token : "";

  return <VerifyEmailPage initialToken={token} />;
}
