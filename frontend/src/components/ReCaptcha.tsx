import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

export interface ReCaptchaRef {
  getValue: () => string | null;
  reset: () => void;
}

interface ReCaptchaProps {
  onChange?: (token: string | null) => void;
}

const ReCaptcha = forwardRef<ReCaptchaRef, ReCaptchaProps>((props, ref) => {
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  useImperativeHandle(ref, () => ({
    getValue: () => {
      return recaptchaRef.current?.getValue() || null;
    },
    reset: () => {
      recaptchaRef.current?.reset();
    }
  }));

  const handleChange = (token: string | null) => {
    if (props.onChange) {
      props.onChange(token);
    }
  };

  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  if (!siteKey) {
    console.error('VITE_RECAPTCHA_SITE_KEY is not defined in environment variables');
    return <div className="text-red-500">reCAPTCHA configuration error</div>;
  }

  // Type assertion to fix the JSX component issue
  const ReCAPTCHAComponent = ReCAPTCHA as any;

  return (
    <div className="mb-4">
      <ReCAPTCHAComponent
        ref={recaptchaRef}
        sitekey={siteKey}
        onChange={handleChange}
        theme="light"
      />
    </div>
  );
});

ReCaptcha.displayName = 'ReCaptcha';
export default ReCaptcha;