'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useSendOTP, useVerifyOTP } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui';
import { Phone, ArrowLeft, Check } from 'lucide-react';

const phoneSchema = z.object({
  phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
});

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

type PhoneFormData = z.infer<typeof phoneSchema>;
type OTPFormData = z.infer<typeof otpSchema>;

export default function PhoneLoginPage() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const { mutate: sendOTP, isPending: isSendingOTP } = useSendOTP();
  const { mutate: verifyOTP, isPending: isVerifyingOTP } = useVerifyOTP();

  const {
    register: registerPhone,
    handleSubmit: handleSubmitPhone,
    formState: { errors: phoneErrors },
  } = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
  });

  const {
    register: registerOTP,
    handleSubmit: handleSubmitOTP,
    formState: { errors: otpErrors },
  } = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
  });

  const onSubmitPhone = (data: PhoneFormData) => {
    setPhoneNumber(data.phone);
    sendOTP(
      { phone: data.phone },
      {
        onSuccess: () => {
          setStep('otp');
        },
      }
    );
  };

  const onSubmitOTP = (data: OTPFormData) => {
    verifyOTP({
      phone: phoneNumber,
      otp: data.otp,
    });
  };

  const handleResendOTP = () => {
    sendOTP({ phone: phoneNumber });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">GK Store</h1>
          <p className="text-gray-600">
            {step === 'phone'
              ? 'Enter your phone number to continue'
              : 'Enter the OTP sent to your phone'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Back Button */}
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {step === 'phone' ? 'Phone Login' : 'Verify OTP'}
          </h2>

          {step === 'phone' ? (
            <form onSubmit={handleSubmitPhone(onSubmitPhone)} className="space-y-5">
              {/* Phone Field */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...registerPhone('phone')}
                    type="tel"
                    id="phone"
                    className={`block w-full pl-10 pr-3 py-3 border ${
                      phoneErrors.phone ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors`}
                    placeholder="9876543210"
                    disabled={isSendingOTP}
                  />
                </div>
                {phoneErrors.phone && (
                  <p className="mt-1 text-sm text-red-600">{phoneErrors.phone.message}</p>
                )}
                <p className="mt-2 text-sm text-gray-500">
                  We'll send you a 6-digit OTP to verify your number
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSendingOTP}
                className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSendingOTP ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <Phone className="h-5 w-5" />
                    <span>Send OTP</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmitOTP(onSubmitOTP)} className="space-y-5">
              {/* Phone Display */}
              <div className="bg-primary-50 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary-100 rounded-full p-2">
                    <Phone className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Sent to</p>
                    <p className="font-medium text-gray-900">+91 {phoneNumber}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Change
                </button>
              </div>

              {/* OTP Field */}
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <input
                  {...registerOTP('otp')}
                  type="text"
                  id="otp"
                  maxLength={6}
                  className={`block w-full px-4 py-3 border ${
                    otpErrors.otp ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg text-center text-2xl tracking-widest font-semibold focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors`}
                  placeholder="000000"
                  disabled={isVerifyingOTP}
                />
                {otpErrors.otp && (
                  <p className="mt-1 text-sm text-red-600">{otpErrors.otp.message}</p>
                )}
              </div>

              {/* Resend OTP */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isSendingOTP}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
                >
                  {isSendingOTP ? 'Sending...' : "Didn't receive OTP? Resend"}
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isVerifyingOTP}
                className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isVerifyingOTP ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5" />
                    <span>Verify & Login</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
