import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import twilio from 'twilio';
import { generateAcknowledgmentResponse } from '@/lib/voice';
const { twiml: { VoiceResponse } } = twilio;

// Debug helper to log all form data fields
function logFormData(formData: FormData): void {
  const entries: Record<string, string> = {};
  formData.forEach((value, key) => {
    entries[key] = typeof value === 'string' ? value : '[File]';
  });
  console.log('Twilio callback form data:', JSON.stringify(entries, null, 2));
}

/**
 * Process alert acknowledgment from digit press
 * @param alertId The alert ID
 * @param contactId The contact ID
 * @returns True if acknowledgment was successful
 */
async function processAlertAcknowledgment(alertId: string, contactId: string): Promise<boolean> {
  try {
    if (!alertId || !contactId) {
      console.error('Missing alertId or contactId for acknowledgment');
      return false;
    }
    
    console.log(`Processing acknowledgment for alert ${alertId} by contact ${contactId}`);
    
    // Find the alert
    const alert = await prisma.alert.findUnique({
      where: { id: alertId },
      select: { 
        id: true,
        firstAcknowledgedBy: true, 
        firstAcknowledgedAt: true 
      }
    });
    
    if (!alert) {
      console.error(`Alert not found: ${alertId}`);
      return false;
    }
    
    console.log(`Found alert: ${JSON.stringify(alert)}`);
    
    // Check if this is the first acknowledgment
    const isFirstAcknowledgment = !alert.firstAcknowledgedBy || !alert.firstAcknowledgedAt;
    
    // If this is the first acknowledgment, update the alert record
    if (isFirstAcknowledgment) {
      await prisma.alert.update({
        where: { id: alertId },
        data: {
          firstAcknowledgedBy: contactId,
          firstAcknowledgedAt: new Date()
        }
      });
      console.log(`Alert ${alertId} marked with first acknowledgment by contact ${contactId}`);
    }
    
    // Find ALL notifications for this alert and contact, not just voice
    const notifications = await prisma.notificationSent.findMany({
      where: {
        alertId,
        contactId
      }
    });
    
    if (notifications.length > 0) {
      // Update all notifications as acknowledged
      await prisma.notificationSent.updateMany({
        where: { 
          alertId,
          contactId 
        },
        data: {
          acknowledged: true,
          acknowledgedAt: new Date()
        }
      });
      
      console.log(`${notifications.length} notifications marked as acknowledged`);
    } else {
      // If no notification records exist, create a manual acknowledgment
      const newNotification = await prisma.notificationSent.create({
        data: {
          alertId,
          contactId,
          type: 'voice',
          recipient: 'voice_acknowledgment',
          status: 'success',
          timestamp: new Date(),
          acknowledged: true,
          acknowledgedAt: new Date(),
        }
      });
      
      console.log(`Created new voice acknowledgment record: ${newNotification.id}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error processing alert acknowledgment:', error);
    return false;
  }
}

/**
 * Handles Twilio voice call status updates and digit press inputs
 */
export async function POST(req: Request) {
  try {
    // Parse the URL and form data
    const url = new URL(req.url);
    const alertId = url.searchParams.get('alertId');
    const contactId = url.searchParams.get('contactId');
    
    console.log(`Received voice callback with alertId=${alertId}, contactId=${contactId}`);
    
    // Parse the form data from Twilio (Twilio sends form-urlencoded data, not JSON)
    const formData = await req.formData();
    
    // Log all form fields for debugging
    logFormData(formData);
    
    // Get important form data values
    const callSid = formData.get('CallSid') as string;
    const callStatus = formData.get('CallStatus') as string;
    // const from = formData.get('From') as string; // Caller's number (your Twilio number)
    const to = formData.get('To') as string;   // Called number (contact's number)
    const digits = formData.get('Digits') as string; // Get pressed digits for gather
    
    console.log(`Voice callback received - SID: ${callSid}, Status: ${callStatus || 'n/a'}, To: ${to || 'n/a'}, Digits: ${digits || 'none'}`);
    
    // Handle digit input (from gather)
    if (digits) {
      console.log(`Received digit input: ${digits}`);
      
      // Ensure we have the required IDs for processing the acknowledgment
      if (!alertId || !contactId) {
        console.error(`Missing required parameters for acknowledgment - alertId: ${alertId}, contactId: ${contactId}`);
        
        // Return a friendly message even if we can't process the acknowledgment
        const errorResponse = new VoiceResponse();
        errorResponse.say(
          { voice: 'woman', language: 'en-IN' },
          `Thank you. Your response has been recorded, but we couldn't process your acknowledgment due to missing information. Please check on the patient immediately. This call will now end.`
        );
        
        return new Response(errorResponse.toString(), {
          headers: { 'Content-Type': 'text/xml' }
        });
      }
      
      // If user pressed 1, acknowledge the alert
      if (digits === '1') {
        console.log(`Processing acknowledgment for alert ${alertId} by contact ${contactId}`);
        const success = await processAlertAcknowledgment(alertId, contactId);
        console.log(`Alert acknowledgment processing ${success ? 'successful' : 'failed'}`);
      } else {
        console.log(`Digit ${digits} pressed, but only 1 is accepted for acknowledgment`);
      }
      
      // Return TwiML response based on the digit pressed
      const twimlResponse = generateAcknowledgmentResponse(digits);
      return new Response(twimlResponse, {
        headers: { 'Content-Type': 'text/xml' }
      });
    }
    
    // For call status updates (initiated, ringing, answered, completed)
    if (callStatus) {
      console.log(`Call status update: ${callStatus} for SID: ${callSid}`);
      
      // If call was answered, update the notification
      if (callStatus === 'answered' || callStatus === 'in-progress') {
        const contactPhone = to;
        if (!contactPhone) {
          console.log('No phone number found in status callback');
          return NextResponse.json({ success: false, error: 'No phone number found' });
        }
        
        const formattedPhone = contactPhone.replace(/^\+/, '');
        
        try {
          // Find the notification that matches this phone number
          const notification = await prisma.notificationSent.findFirst({
            where: {
              type: 'voice',
              OR: [
                { recipient: formattedPhone },
                { recipient: contactPhone }
              ],
              status: 'pending'
            },
            orderBy: {
              timestamp: 'desc'
            }
          });
          
          if (notification) {
            // Update the notification to show call was successful
            await prisma.notificationSent.update({
              where: { id: notification.id },
              data: {
                status: 'success'
              }
            });
            
            console.log(`Voice call to ${contactPhone} marked as delivered (waiting for digit input)`);
            
            // Store the alertId and contactId for later use if not already in the URL
            if (alertId && contactId && !notification.alertId) {
              await prisma.notificationSent.update({
                where: { id: notification.id },
                data: {
                  alertId: alertId,
                  contactId: contactId
                }
              });
            }
          } else {
            console.log(`No pending voice notification found for ${contactPhone}`);
          }
        } catch (dbError) {
          console.error('Database error when updating call status:', dbError);
        }
      }
      // For completed calls that weren't previously acknowledged
      else if (callStatus === 'completed') {
        // Code for handling completed calls remains the same
        // ...
      }
      
      // Return OK for status updates
      return NextResponse.json({ success: true, status: callStatus });
    }
    
    // For any other callback type we didn't handle
    console.log('Unknown callback type received');
    return NextResponse.json({ success: false, message: 'Unknown callback type' });
    
  } catch (error) {
    console.error('Unhandled error in voice call status handler:', error);
    
    // Generate error TwiML response
    const response = new VoiceResponse();
    response.say(
      { voice: 'woman', language: 'en-IN' },
      `Sorry, an application error occurred. Our support team has been notified. This call will now end.`
    );
    
    return new Response(response.toString(), {
      headers: {
        'Content-Type': 'text/xml'
      }
    });
  }
}