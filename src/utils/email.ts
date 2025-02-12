import emailjs from '@emailjs/browser';

const EMAIL_SERVICE_ID = 'service_j644zxc';
const EMAIL_TEMPLATE_ID = 'template_52clyl6';
const EMAIL_PUBLIC_KEY = 'vV8pqpVZWGl7yH_qb';

// Initialize EmailJS with public key
emailjs.init(EMAIL_PUBLIC_KEY);

interface EmailParams {
  to_name?: string;
  from_name: string;
  message: string;
  reply_to: string;
  [key: string]: any; // For any additional template parameters
}

export const sendEmail = async (params: EmailParams): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await emailjs.send(
      EMAIL_SERVICE_ID,
      EMAIL_TEMPLATE_ID,
      params,
      EMAIL_PUBLIC_KEY
    );

    if (response.status === 200) {
      return {
        success: true,
        message: 'Email sent successfully!'
      };
    } else {
      throw new Error('Failed to send email');
    }
  } catch (error) {
    console.error('Email sending failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to send email'
    };
  }
}; 