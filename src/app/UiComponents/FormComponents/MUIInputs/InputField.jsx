"use client";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import {useEffect, useRef, useState} from "react";
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa6";

export default function InputField({
                                     input,
                                     variant = "filled",
                                     register,
                                     errors,
                                     watch,
                                     trigger,
                                   }) {
  const [inputData, setInputData] = useState(input.data);
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
const inputRef = useRef(null);
  const handleClickShowPassword = () => {
    setInputData({
      ...inputData,
      type: inputData.type === "password" ? "text" : "password",
    });
  };
useEffect(()=>{
  if(inputRef.current){
    inputRef.current.onBlur = handleBlur;
  }
},[inputRef, inputRef.current])
  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setIsHovered(false); // Ensure hover state is also reset on blur
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const [type, setType] = useState(null);
  const fieldValue = watch(inputData.id);

  useEffect(() => {
    if (type) {
      if (input.data.type === "password" || input.data.type === "email") {
        trigger(inputData.id);
      }
    }
  }, [fieldValue]);

  useEffect(() => {
    setShowPassword(inputData.type !== "text");
  }, [inputData.type]);

  return (
        <TextField
              fullWidth
              sx={input.sx ? input.sx : { width: "100%" ,mb:2}}
              onInput={() => setType(true)}
              variant={variant}
              error={Boolean(errors[inputData.id])}
              helperText={errors[inputData.id]?.message}
              inputProps={{
                onBlur: () => {
                  handleBlur()
                },
                onFocus: () => {
                    handleFocus()
                }
              }}
                ref={inputRef}
              {...inputData}
              {...register(inputData.id, input.pattern)}
              InputProps={{
                endAdornment: input.data.type === "password" && (
                      <InputAdornment position="end">
                        <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowPassword}
                              edge="end"
                              onMouseEnter={handleMouseEnter}
                              onMouseLeave={handleMouseLeave}
                              style={{
                                visibility: (isFocused || fieldValue || isHovered) ? 'visible' : 'hidden'
                              }}
                        >
                          {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                        </IconButton>
                      </InputAdornment>
                ),
              }}
        />
  );
}
