import { EmailType, EmailMetadata } from '@/types/email';

export function getEmailTemplate(type: EmailType, metadata: EmailMetadata) {
  const {
    student_name, course_name, batch_name, batch_timing,
    start_date, teacher_name, amount, transaction_id,
    receipt_number, rejection_reason
  } = metadata;

  const getBaseTemplate = (title: string, content: string) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@600&family=Work+Sans:wght@400&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Work Sans', sans-serif; background-color: #FFF9F4; color: #2C2416; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background: #FFFFFF; border: 1px solid #F0E4D7; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(44, 36, 22, 0.05); }
          .header { background-color: #FF8C42; padding: 24px; text-align: center; }
          .header h1 { color: #FFF9F4; font-family: 'Outfit', sans-serif; margin: 0; font-size: 24px; }
          .body { padding: 40px; line-height: 1.6; }
          .footer { background-color: #F0E4D7; padding: 24px; text-align: center; font-size: 12px; color: #8B7355; }
          .button { display: inline-block; padding: 12px 24px; background-color: #FF8C42; color: #FFF9F4; text-decoration: none; border-radius: 4px; font-weight: 600; margin-top: 20px; }
          .highlight { color: #FF8C42; fontWeight: 600; }
          .details { background-color: #FFF9F4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #F0E4D7; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>Speak Orange Academy</h1></div>
          <div class="body">
            <h2 style="font-family: 'Outfit', sans-serif; font-size: 20px; margin-top: 0;">${title}</h2>
            ${content}
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Speak Orange Academy. All rights reserved.<br>
            approachable professional | premium education
          </div>
        </div>
      </body>
    </html>
  `;

  switch (type) {
    case 'REGISTRATION_CONFIRMATION':
      return {
        subject: 'Registration Successful – Speak Orange Academy',
        html: getBaseTemplate(
          'Registration Confirmed!',
          `<p>Hi <strong>${student_name}</strong>,</p>
           <p>Welcome to Speak Orange Academy! Your registration for the <span class="highlight">${course_name}</span> has been successfully recorded.</p>
           <div class="details">
             <strong>Next Step:</strong> To secure your seat, please complete the payment process if you haven't already.
           </div>
           <p>We look forward to having you with us!</p>`
        )
      };

    case 'PAYMENT_SUBMITTED':
      return {
        subject: 'Payment Submitted – Verification Pending',
        html: getBaseTemplate(
          'Payment Received!',
          `<p>Hi <strong>${student_name}</strong>,</p>
           <p>Thank you for submitting your payment details. Our team is currently verifying the transaction.</p>
           <div class="details">
             <strong>Transaction ID:</strong> ${transaction_id}<br>
             <strong>Amount:</strong> ₹${amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}<br>
             <strong>Status:</strong> Pending Verification
           </div>
           <p>You will receive another update once the verification is complete.</p>`
        )
      };

    case 'PAYMENT_APPROVED':
      return {
        subject: 'Payment Approved – Enrollment Confirmed',
        html: getBaseTemplate(
          'Admission Confirmed!',
          `<p>Congratulations <strong>${student_name}</strong>!</p>
           <p>Your payment has been approved and your admission to <span class="highlight">${course_name}</span> is now confirmed.</p>
           <div class="details">
             <strong>Batch:</strong> ${batch_name}<br>
             <strong>Receipt No:</strong> ${receipt_number}
           </div>
           <p>Please find your official payment receipt attached to this email.</p>
           <p>See you in class!</p>`
        )
      };

    case 'PAYMENT_REJECTED':
      return {
        subject: 'Payment Verification Update',
        html: getBaseTemplate(
          'Action Required: Payment Verification',
          `<p>Hi <strong>${student_name}</strong>,</p>
           <p>We were unable to verify your payment submission for the following reason:</p>
           <div class="details" style="color: #E53935; border-color: #E53935;">
             <strong>Reason:</strong> ${rejection_reason}
           </div>
           <p>Please resubmit your payment details with the correct information through your dashboard.</p>`
        )
      };

    case 'BATCH_ALLOCATED':
      return {
        subject: 'Batch Allocation Confirmed',
        html: getBaseTemplate(
          'Your Batch is Ready!',
          `<p>Hi <strong>${student_name}</strong>,</p>
           <p>Your batch allocation for <span class="highlight">${course_name}</span> has been finalized.</p>
           <div class="details">
             <strong>Batch:</strong> ${batch_name}<br>
             <strong>Timing:</strong> ${batch_timing}<br>
             <strong>Start Date:</strong> ${start_date}<br>
             ${teacher_name ? `<strong>Teacher:</strong> ${teacher_name}` : ''}
           </div>
           <p>We are excited to start this journey with you!</p>`
        )
      };

    case 'TEACHER_BATCH_ASSIGNED':
      return {
        subject: 'New Batch Assignment – Speak Orange Academy',
        html: getBaseTemplate(
          'New Batch Assigned',
          `<p>Hello <strong>${teacher_name}</strong>,</p>
           <p>You have been assigned as the instructor for a new batch at Speak Orange Academy.</p>
           <div class="details">
             <strong>Course:</strong> ${course_name}<br>
             <strong>Batch:</strong> ${batch_name}<br>
             <strong>Timing:</strong> ${batch_timing}<br>
             <strong>Start Date:</strong> ${start_date}
           </div>
           <p>Please log in to your dashboard to view the student roster and preparation materials.</p>`
        )
      };

    default:
      return { subject: 'Speak Orange Academy Notification', html: getBaseTemplate('Notification', '<p>You have a new notification from Speak Orange Academy.</p>') };
  }
}
