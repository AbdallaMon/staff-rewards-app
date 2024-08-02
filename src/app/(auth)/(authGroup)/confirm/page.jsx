'use client'

import FileUploadForm from "@/app/UiComponents/FormComponents/Forms/FileForm";
import VerifyToken from "@/app/UiComponents/Feedback/VerifyToken";
import {Suspense} from "react";

export default function ConfirmPage() {
    return (
          <Suspense>

              <VerifyToken verifyTokenUrl={"/api/employee/public/validate"}
                           renderError={{text: "Register a new account", href: "/register"}}>
                  <FileUploadForm/>
              </VerifyToken>
          </Suspense>
    )
}