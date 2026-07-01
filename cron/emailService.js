import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendReminderEmail({ to, patientName, medicineName, dosage, unit, scheduledTime }) {
  const subject = `💊 MedTrack Reminder: Time to take ${medicineName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background: #2563eb; padding: 20px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 22px;">💊 MedTrack</h1>
        <p style="color: #bfdbfe; margin: 4px 0 0;">Medicine Reminder</p>
      </div>
      <div style="padding: 24px;">
        <p style="font-size: 16px; color: #374151;">Hi <strong>${patientName}</strong>,</p>
        <p style="font-size: 15px; color: #374151;">It's time to take your scheduled medicine:</p>
        <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 16px; border-radius: 4px; margin: 16px 0;">
          <p style="margin: 0; font-size: 18px; font-weight: bold; color: #1e40af;">${medicineName}</p>
          <p style="margin: 6px 0 0; color: #374151;">Dose: <strong>${dosage} ${unit}</strong></p>
          <p style="margin: 4px 0 0; color: #374151;">Scheduled: <strong>${scheduledTime}</strong></p>
        </div>
        <p style="color: #6b7280; font-size: 14px;">Please log your dose in the MedTrack app after taking it.</p>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">This is an automated reminder from MedTrack. Stay healthy! 🌿</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"MedTrack Reminder" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

export async function sendDailySummaryEmail({ to, patientName, date, taken, skipped, pending }) {
  const total = taken + skipped + pending;
  const adherence = total > 0 ? Math.round((taken / total) * 100) : 0;

  const subject = `📊 MedTrack Daily Summary — ${date}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background: #2563eb; padding: 20px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 22px;">📊 Daily Summary</h1>
        <p style="color: #bfdbfe; margin: 4px 0 0;">${date}</p>
      </div>
      <div style="padding: 24px;">
        <p style="font-size: 16px; color: #374151;">Hi <strong>${patientName}</strong>, here's your medicine adherence for today:</p>
        <div style="display: flex; gap: 12px; margin: 20px 0;">
          <div style="flex: 1; background: #d1fae5; padding: 16px; border-radius: 8px; text-align: center;">
            <p style="font-size: 28px; font-weight: bold; color: #065f46; margin: 0;">${taken}</p>
            <p style="color: #065f46; margin: 4px 0 0; font-size: 13px;">Taken</p>
          </div>
          <div style="flex: 1; background: #fee2e2; padding: 16px; border-radius: 8px; text-align: center;">
            <p style="font-size: 28px; font-weight: bold; color: #991b1b; margin: 0;">${skipped}</p>
            <p style="color: #991b1b; margin: 4px 0 0; font-size: 13px;">Skipped</p>
          </div>
          <div style="flex: 1; background: #fef9c3; padding: 16px; border-radius: 8px; text-align: center;">
            <p style="font-size: 28px; font-weight: bold; color: #854d0e; margin: 0;">${pending}</p>
            <p style="color: #854d0e; margin: 4px 0 0; font-size: 13px;">Pending</p>
          </div>
        </div>
        <div style="background: #f9fafb; padding: 16px; border-radius: 8px; text-align: center;">
          <p style="font-size: 32px; font-weight: bold; color: #2563eb; margin: 0;">${adherence}%</p>
          <p style="color: #6b7280; margin: 4px 0 0;">Adherence Rate</p>
        </div>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">Keep it up! Consistent medication is key to better health. 💪</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"MedTrack" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });
}
