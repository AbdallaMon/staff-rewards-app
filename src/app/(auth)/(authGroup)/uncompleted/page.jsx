'use client'
import VerifyToken from "@/app/UiComponents/Feedback/VerifyToken";
import UncompletedForm from "@/app/UiComponents/FormComponents/Forms/UncompletedForm";

export default function Confirm() {
    return (
          <VerifyToken verifyTokenUrl={"/api/employee/public/validate?confirmed=true"}
                       renderError={{text: "Register a new account", href: "/register"}}
                       extraSearch={true}
          >
              <UncompletedForm/>
          </VerifyToken>
    )
}