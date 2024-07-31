'use client'
import FileUploadForm from "@/app/UiComponents/FormComponents/Forms/FileForm";
import VerifyToken from "@/app/UiComponents/Feedback/VerifyToken";

export default function Confirm() {
    return (
          <VerifyToken verifyTokenUrl={"/api/employee/public/validate"}
                       renderError={{text: "Register a new account", href: "/register"}}>
              <FileUploadForm/>
          </VerifyToken>
    )
}