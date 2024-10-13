import MultiStepForm from "@/app/UiComponents/FormComponents/Forms/MultiStepForm";
import RegisterOpenChecker from "@/app/UiComponents/Feedback/RegisterChecker";

export default function Register() {
    return (
          <div className={"py-20 w-full bg-bgPrimary"}>
              <RegisterOpenChecker>
                  <MultiStepForm/>
              </RegisterOpenChecker>
          </div>
    )
}



