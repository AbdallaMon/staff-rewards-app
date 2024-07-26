"use client"
import {Button} from "@mui/material";
import {handleRequestSubmit} from "@/helpers/functions/handleSubmit";
import {useToastContext} from "@/providers/ToastLoadingProvider";
import {useRouter} from "next/navigation";
import {useAuth} from "@/providers/AuthProvider";
import {FaSignOutAlt} from "react-icons/fa";

export default function LogoutButton(){
    const { setLoading } = useToastContext();
    const { setRedirect } = useAuth();
    const router = useRouter();

    async function handleLogout() {
        const signout = await handleRequestSubmit(
              {},
              setLoading,
              `auth/signout`,
              false,
              "Logging out...",
              setRedirect,
        );
        if (signout?.status === 200) {
            router.push("/login");
        }
    }
    return (
        <Button
            onClick={() => {
                handleLogout();
            }}
            sx={{
                width: "100%",
            }}
            color="secondary"

        >  <FaSignOutAlt />
            Logout
        </Button>
    );
}