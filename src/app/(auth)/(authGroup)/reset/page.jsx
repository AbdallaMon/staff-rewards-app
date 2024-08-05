"use client";
import {resetInputs, resetPasswordInputs} from "./data";
import Link from "next/link";
import {useToastContext} from "@/providers/ToastLoadingProvider";
import {useAuth} from "@/providers/AuthProvider";
import {useRouter} from "next/navigation";
import AuthForm from "@/app/UiComponents/FormComponents/Forms/AuthFrom/AuthForm";
import {handleRequestSubmit} from "@/helpers/functions/handleSubmit";
import {url} from "@/app/constants";

export default function Page({params, searchParams: {token}}) {
    const {setLoading} = useToastContext();
    const {setRedirect} = useAuth();
    const router = useRouter();

    async function handleReset(data) {
        try {
            await handleRequestSubmit(
                  data,
                  setLoading,
                  !token ? "auth/reset" : `auth/reset/${token}`,
                  false,
                  !token ? "Reviewing your email..." : "Resetting your password...",
                  setRedirect,
            );
            if (token) {
                router.push("/login");
            }
        } catch (e) {
            console.log(e);
        }
    }

    const subTitle = <Link href={url + "/login"}>Back to login page?</Link>;
    return (
          <>
              <AuthForm
                    btnText={"Reset"}
                    inputs={token ? resetPasswordInputs : resetInputs}
                    formTitle={"Reset password"}
                    onSubmit={handleReset}
                    subTitle={subTitle}
              />
          </>
    );
}
