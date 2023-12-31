"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";

import { useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { useCookies } from "next-client-cookies";

let currentOTPIndex: number = 0;
export default function Verification() {
  const router = useRouter();
  const cookies = useCookies();
  const searchParams = useSearchParams();

  const email = searchParams.get("email");
  const [otp, setotp] = useState<string[]>(new Array(6).fill(""));
  const [ActiveOTPIndex, setActiveOTPIndex] = useState<number>(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const handleOnChange = ({
    target,
  }: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = target;
    const newOTP: string[] = [...otp];
    newOTP[currentOTPIndex] = value.substring(value.length - 1);

    if (!value) setActiveOTPIndex(currentOTPIndex - 1);
    else setActiveOTPIndex(currentOTPIndex + 1);
    setotp(newOTP);
  };

  const handleOnKeyDown = (
    { key }: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    currentOTPIndex = index;
    if (key === "Backspace") setActiveOTPIndex(currentOTPIndex - 1);
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, [ActiveOTPIndex]);

  async function onsubmit() {
    try {
      const otp_val = otp.join("");
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/Verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otp: otp_val, email }),
      }).then((res) => res.json());
      // console.log(res.message);
      setotp(new Array(6).fill(""));

      if (res.message == "User verified") {
        toast.success("User Verified");

        cookies.set("accessToken", res.access_token);
        cookies.set("refreshToken", res.refresh_token);

        setTimeout(() => {
          router.push("/dashboard");
        }, 700);
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      console.log("Login failed", err.message);
    }
  }

  async function onresend() {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER}/api/resendOtp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(email),
        }
      ).then((res) => res.json());
    } catch (err: any) {
      console.log("Login failed", err.message);
    }
  }

  return (
    <div className="bg-[#E5F2FF]">
      <div className="h-screen flex flex-col text-center">
        <Toaster />
        <div className="lg:w-1/4 sm:w-3/4 md:w-3/4 mx-auto my-auto">
          <Image
            alt="Image Not Found"
            src={"/img/Logo_black.png"}
            layout="responsive"
            width={100}
            height={100}
            className="mx-auto"
          />
          <h1 className="font-bold mb-4 mt-3">Verify your account</h1>
          <p>Enter the OTP we{"'"}ve sent in your mailbox</p>

          <div className="flex justify-center items-center space-x-2">
            {otp.map((_, index) => {
              return (
                <React.Fragment key={index}>
                  <input
                    ref={index === ActiveOTPIndex ? inputRef : null}
                    type="number"
                    className="my-4 w-12 h-11 border-b-2 bg-transparent outline-none text-center font-semibold 
                                        text-xl border-b-black focus:border-b-black transition spin-button-none"
                    onChange={handleOnChange}
                    onKeyDown={(e) => handleOnKeyDown(e, index)}
                    value={otp[index]}
                  />
                </React.Fragment>
              );
            })}
          </div>
          <button
            type="submit"
            className="font-bold rounded-3xl px-10 p-2 bg-[#295BE7] mb-3 hover:shadow-2xl"
            onClick={onsubmit}
          >
            Verify
          </button>
          <div>
            <button className="text-xs" onClick={onresend}>
              Resend OTP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
