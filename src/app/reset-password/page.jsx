import ResetPasswordPage from "../../components/auth/ResetPasswordPage";

export default async function Page({ searchParams }) {
  const params = (await searchParams) ?? {};
  const token = typeof params.token === "string" ? params.token : "";

  return <ResetPasswordPage initialToken={token} />;
}
