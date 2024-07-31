"use client"
import {useRouter, useSearchParams} from "next/navigation";
import React, {useEffect, useState} from "react";
import {Backdrop, Button, Card, CircularProgress, Typography} from "@mui/material";
import Link from "next/link";


export default function VerifyToken({verifyTokenUrl, renderError, extraSearch, children}) {
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const searchParams = useSearchParams()
    const token = searchParams.get("token")
    const [isValidatingAToken, setIsValidatingAToken] = useState(false)
    const [isValidToken, setIsValidToken] = useState(true)
    const [tokenMessage, setTokenMessage] = useState("")
    const validateToken = async () => {
        setIsValidatingAToken(true)
        try {
            const sendToken = extraSearch ? "&token=" : "?token="
            const request = await fetch(verifyTokenUrl + sendToken + token, {
                method: "POST"
            })
            const response = await request.json()
            if (response.status === 200) {
                setIsValidToken(true)
                if (response.redirect) {
                    router.push("/" + response.redirect)
                }
            } else {
                throw new Error(response.message)
            }
        } catch (e) {
            setIsValidToken(false)
            setTokenMessage(e.message)
        }
        setIsValidatingAToken(false)
    }

    useEffect(() => {
        setLoading(false);
    }, []);
    useEffect(() => {
        if (token) {
            validateToken()
        }
    }, [token])
    if (loading) return <div>Loading...</div>;
    if (token && isValidatingAToken) {
        return (
              <Backdrop
                    open={isValidatingAToken}
              >
                  <div className={"flex gap-2 flex-col text-white items-center"}>

                      <Typography variant="h4">Validating....</Typography>
                      <CircularProgress color="inherit"/>
                  </div>
              </Backdrop>
        )
    }
    if (token && !isValidToken) {
        return (
              <div className={"flex items-center justify-center min-h-screen bg-gray-100 w-full"}>
                  <Card className={"py-10 p-6 flex flex-col items-center text-center w-full max-w-[800px]"}>
                      <Typography variant="h5" className={"text-red-600 font-bold mb-4"}>
                          {tokenMessage}
                      </Typography>
                      <div className={"flex flex-col gap-2"}>
                          <Link href={renderError.href}>
                              <Button variant="outlined">
                                  {renderError.text}
                              </Button>
                          </Link>
                          <Typography variant="body1" className={"text-center"}>or</Typography>
                          <Link href={"/login"}>
                              <Button variant="outlined">
                                  Login instead
                              </Button>
                          </Link>
                      </div>
                  </Card>
              </div>
        );
    } else {
        return <>{children}</>
    }
}