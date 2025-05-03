import twilio from 'twilio';

interface SMSParams {
  to: string;
  message: string;
}

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendSMS({ to, message }: SMSParams): Promise<boolean> {
  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER || '+19897047284', // Using the trial number as fallback
      to
    });

    console.log(`SMS sent with SID: ${result.sid}`);
    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
}