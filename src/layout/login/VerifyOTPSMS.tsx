import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify"; // Import Toastify và toast
import "react-toastify/dist/ReactToastify.css";
import { auth } from "../util/fucntion/firebaseConfig";
import { Auth, ConfirmationResult, signInWithPhoneNumber } from "firebase/auth";
import { getAuth, RecaptchaVerifier } from "firebase/auth";
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
    confirmationResult: any;
  }
}
const VerifyOTPSMS: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "normal",
        callback: (response: any) => {},
        // Handle Recaptcha callback if needed
        "expired-callback": () => {},
      }
    );
  }, [auth]);
  
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
  };
  
  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtp(e.target.value);
  };
  
  const handleSendOtp = async () => {
    try {
      const formattedPhoneNumber = `+${phoneNumber.replace(/\D/g, "")}`;
      const confirmation = await signInWithPhoneNumber(
        auth,
        formattedPhoneNumber,
        window.recaptchaVerifier
      );
      setConfirmationResult(confirmation);
      setOtpSent(true);
      setPhoneNumber("");
      alert("OTP has been sent");
    } catch (error) {
      console.error(error);
    }
  };
  const handleOTPSubmit = async () => {
    if (!confirmationResult) {
      console.error("Confirmation result is null");
      return;
    }
  
    try {
      await confirmationResult.confirm(otp);
      setOtp("");
      alert("OTP verified successfully!");
    } catch (error) {
      console.error("Error verifying OTP:", error);
      alert("Invalid OTP. Please try again.");
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {!otpSent && <div id="recaptcha-container" className="w-full"></div>}

      <input
        type="tel"
        value={phoneNumber}
        onChange={handlePhoneNumberChange}
        placeholder="Enter Phone Number with Country Code"
        className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring focus:border-blue-500"
      />

      {otpSent && (
        <input
          type="text"
          value={otp}
          onChange={handleOTPChange}
          placeholder="Enter OTP"
          className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring focus:border-blue-500"
        />
      )}

      <button
        onClick={otpSent ? handleOTPSubmit : handleSendOtp}
        className={`w-full bg-${
          otpSent ? "green" : "blue"
        }-500 text-white py-3 rounded-md`}
        style={{ backgroundColor: otpSent ? "green" : "blue" }}
      >
        {otpSent ? "Submit OTP" : "Send OTP"}
      </button>
    </div>
  );
};

export default VerifyOTPSMS;
