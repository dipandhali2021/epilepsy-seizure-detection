import twilio from 'twilio';
const { twiml: { VoiceResponse } } = twilio;

// Initialize Twilio client with your account credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID || 'SDKFJSDFKJKDSGSDJG324235325';
const authToken = process.env.TWILIO_AUTH_TOKEN || '';
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '+91XXXXXXXXXX'; // Replace with your Twilio phone number
const client = twilio(accountSid, authToken);

/**
 * Interface for voice call parameters
 */
interface VoiceCallParams {
  to: string;
  patientName: string;
  alertId: string;
  contactId: string;
  acknowledgeUrl?: string;
}

/**
 * Makes an emergency voice call to a contact using Twilio
 * @param params Voice call parameters
 * @returns Promise with call details or error
 */
export async function makeEmergencyCall({
  to,
  patientName,
  alertId,
  contactId,
  acknowledgeUrl
}: VoiceCallParams): Promise<boolean> {
  try {
    console.log('acknowledgeUrl:', acknowledgeUrl);
    // Use APP_URL from environment or fallback
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // Create a proper VoiceResponse TwiML document
    const response = new VoiceResponse();
    
    // Initial message about the emergency
    response.say({
      voice: 'woman', 
      language: 'en-IN'
    }, `Urgent medical alert! A seizure has been predicted for ${patientName}. Please check on them immediately.`);
    
    // Add a pause to ensure message is fully heard
    response.pause({ length: 1 });
    
    // Create absolute URL for gather action with required parameters
    const gatherActionUrl = `${baseUrl}/api/voice/status-callback?alertId=${alertId}&contactId=${contactId}`;
    console.log(`Setting gather action URL to: ${gatherActionUrl}`);
    
    // Create a gather for user input
    const gather = response.gather({
      numDigits: 1,
      action: gatherActionUrl,
      method: 'POST',
      timeout: 10
    });
    
    gather.say({
      voice: 'woman',
      language: 'en-IN'
    }, `Press 1 to acknowledge this alert and confirm you will check on the patient. This will mark you as the first responder.`);
    
    // If no input is received (timeout or user didn't press any key)
    response.say({
      voice: 'woman',
      language: 'en-IN'
    }, `We didn't receive your input. This alert has not been acknowledged. Please check on the patient immediately. The call will now end.`);
    
    // Convert the response to TwiML string
    const twiml = response.toString();
    
    console.log(`Making emergency call to ${to} with TwiML: ${twiml}`);

    // Define the status callback URL with parameters for tracking
    const statusCallbackUrl = `${baseUrl}/api/voice/status-callback?alertId=${alertId}&contactId=${contactId}`;

    // Make the call with the generated TwiML
    const call = await client.calls.create({
      twiml: twiml,
      from: twilioPhoneNumber,
      to: to,
      statusCallback: statusCallbackUrl,
      statusCallbackMethod: 'POST',
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed']
    });

    console.log(`Emergency voice call placed to ${to}, SID: ${call.sid}, alert: ${alertId}, contact: ${contactId}`);
    return true;
  } catch (error) {
    console.error('Error making emergency voice call:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

/**
 * Generates TwiML for handling digit input acknowledgment
 * @param digit The digit pressed by the user
 * @returns TwiML response string
 */
export function generateAcknowledgmentResponse(digit?: string): string {
  const response = new VoiceResponse();
  
  if (digit === '1') {
    response.say({
      voice: 'woman',
      language: 'en-IN'
    }, `Thank you. You have successfully acknowledged this alert. Please check on the patient immediately. This call will now end.`);
  } else {
    response.say({
      voice: 'woman',
      language: 'en-IN'
    }, `Invalid input received. This alert has not been acknowledged. Please check on the patient immediately. This call will now end.`);
  }
  
  return response.toString();
}

/**
 * Removes "Sent from your Twilio trial account" message by upgrading account
 * Note: This message cannot be removed in trial accounts. To remove it:
 * 1. Upgrade to a paid Twilio account
 * 2. Purchase a phone number
 * 3. Complete SMS registration if required in your country
 */
export function removeTrialMessage(): string {
  return `To remove the "Sent from your Twilio trial account" message:
    1. Upgrade to a paid Twilio account
    2. Purchase a phone number ($1/month plus usage)
    3. Complete any required SMS registration process for your country
    
    The trial message cannot be removed from trial accounts.`;
}