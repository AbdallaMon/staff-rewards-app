
import {useForm} from "react-hook-form";
import {Button, Typography} from "@mui/material";
import InputField from "@/app/UiComponents/FormComponents/MUIInputs/InputField";
export default function AuthForm({
  inputs,
  onSubmit,
  btnText,
  formTitle,
  subTitle,
  formStyle,
  variant,
  children,
}) {
      const { formState, register, handleSubmit, watch, trigger, control } =
      useForm();
      const { errors } = formState;
      return (

      <form
            noValidate
            onSubmit={handleSubmit(onSubmit)}

            className={
                  "flex flex-col items-center bg-bgPrimary justify-center w-full  p-5 py-6 bg-gray-100 rounded shadow-md  sm:max-w-[400px] md:max-w-[450px] max-w-[500px] w-full h-fit m-auto  "
            }
            style={{
              ...formStyle,
            }}
      >
        <Typography
              variant="h4"
              className="mb-4 font-bold text-primary"
        >
          {formTitle}
        </Typography>
        {subTitle && (
              <Typography
                    variant="subtitle1"
                    className="mb-4 font-bold text-secondary"
              >
                {subTitle}
              </Typography>
        )}
        <div className={"w-full "}>
          {inputs.map((input) => {

                  return (
                        <InputField
                              key={input.data.id}
                              input={input}
                              register={register}
                              errors={errors}
                              variant={variant}
                              watch={watch}
                              trigger={trigger}
                        />
                  );
                }
          )}
          {children}
        </div>
        <Button
              type="submit"
              variant="contained"
              size="large"
              color="primary"
              className={" w-full  p-3 capitalize  font-bold"}
        >
          {btnText}
        </Button>

      </form>
  );
}
