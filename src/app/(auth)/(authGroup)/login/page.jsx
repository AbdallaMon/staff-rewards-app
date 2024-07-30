"use client";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { useToastContext } from "@/providers/ToastLoadingProvider";
import { loginInputs } from "./data";
import AuthForm from "@/app/UiComponents/FormComponents/Forms/AuthFrom/AuthForm";
import {handleRequestSubmit} from "@/helpers/functions/handleSubmit";
import {url} from "@/app/constants";

export default function LoginPage() {
  const { setLoading } = useToastContext();
  const { setRedirect } = useAuth();

  async function handleLogin(data) {
    await handleRequestSubmit(
          data,
          setLoading,
          "auth/login",
          false,
          "Logging in...",
          setRedirect,
    );
  }

  const subTitle = <Link href={url + "/register"}>Request a new account ?</Link>;
  return (
        <>
          <AuthForm
                btnText={"Login"}
                inputs={loginInputs}
                formTitle={"Login "}
                onSubmit={handleLogin}
                subTitle={subTitle}
          >
            <Link href={url + "/reset"} className={"text-secondary"}>Forgot password?</Link>
          </AuthForm>
        </>
  );
}
