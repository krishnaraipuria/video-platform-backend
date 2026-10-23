import { Resend } from 'resend';
import { ApiError } from "../utils/APiError.js";

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmailVerificationByResend = async (email, verificationCode) => {
    const { data, error } = await resend.emails.send({
        from: 'Acme <onboarding@resend.dev>',
        to: [email],
        subject: 'Email Verification',
        html: `<p>Your verification code is: <strong>${verificationCode}</strong></p>`,
    });

    if (error) {
        console.log(error.message);
        throw new ApiError(500, 'Failed to send email');
    }

    return data;
};

export default sendEmailVerificationByResend;

// (async function () {
//   const { data, error } = await resend.emails.send({
//     from: 'Acme <onboarding@resend.dev>',
//     to: ['delivered@resend.dev'],
//     subject: 'Hello World',
//     html: '<strong>It works!</strong>',
//   });

//   if (error) {
//     return console.error({ error });
//   }

//   console.log({ data });
// })();