/**
 * Email HTML Templates
 * Edge-compatible HTML template generators for booking emails.
 */

export interface BookingConfirmationData {
  guestName: string;
  date: string;
  startTime: string;
  endTime: string;
  timezone: string;
  googleCalLink: string;
  outlookCalLink: string;
}

function formatDateReadable(dateStr: string): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return `${days[dateObj.getUTCDay()]}, ${months[month - 1]} ${day}, ${year}`;
}

function formatTimeReadable(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function bookingConfirmationTemplate(data: BookingConfirmationData): string {
  const formattedDate = formatDateReadable(data.date);
  const formattedStart = formatTimeReadable(data.startTime);
  const formattedEnd = formatTimeReadable(data.endTime);
  const safeName = escapeHtml(data.guestName);
  const safeTimezone = escapeHtml(data.timezone);
  const safeGoogleLink = escapeHtml(data.googleCalLink);
  const safeOutlookLink = escapeHtml(data.outlookCalLink);
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmed</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .btn-mobile { display: block !important; width: 100% !important; max-width: 280px !important; margin: 8px auto !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f9;">
  <table role="presentation" style="width: 100%; border: none; border-spacing: 0; background-color: #f4f6f9;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" class="email-container" style="width: 600px; max-width: 600px; border: none; border-spacing: 0; text-align: left; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 16px; line-height: 1.5; color: #1a1a2e;">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px 24px; text-align: center; background-color: #0a0a1a; border-radius: 12px 12px 0 0;">
              <span style="font-size: 28px; font-weight: 700; color: #ffffff;">AI KRE8TION</span>
              <span style="font-size: 28px; font-weight: 300; color: #0066FF;"> Partners</span>
              <br>
              <span style="display: inline-block; margin-top: 16px; background-color: #0066FF; color: #ffffff; font-size: 13px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; padding: 6px 20px; border-radius: 20px;">Booking Confirmed</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background-color: #ffffff;">
              <!-- Greeting -->
              <table role="presentation" style="width: 100%; border: none; border-spacing: 0;">
                <tr>
                  <td style="padding: 36px 40px 16px;">
                    <h1 style="margin: 0; font-size: 22px; font-weight: 600; color: #1a1a2e;">Hi ${safeName},</h1>
                    <p style="margin: 12px 0 0; font-size: 16px; color: #4a4a6a; line-height: 1.6;">Your strategy call has been confirmed. We look forward to connecting with you.</p>
                  </td>
                </tr>
              </table>
              <!-- Booking Details -->
              <table role="presentation" style="width: 100%; border: none; border-spacing: 0;">
                <tr>
                  <td style="padding: 8px 40px 24px;">
                    <table role="presentation" style="width: 100%; border: none; border-spacing: 0; background-color: #f8f9fc; border-radius: 10px; border: 1px solid #e8eaf0;">
                      <tr>
                        <td style="padding: 24px 28px;">
                          <table role="presentation" style="width: 100%; border: none; border-spacing: 0;">
                            <tr>
                              <td style="padding: 0 0 16px; vertical-align: top; width: 28px;"><span style="font-size: 20px;">&#128197;</span></td>
                              <td style="padding: 0 0 16px 12px; vertical-align: top;">
                                <span style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #8a8aaa;">Date</span><br>
                                <span style="font-size: 16px; font-weight: 600; color: #1a1a2e;">${formattedDate}</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 0 0 16px; vertical-align: top; width: 28px;"><span style="font-size: 20px;">&#128336;</span></td>
                              <td style="padding: 0 0 16px 12px; vertical-align: top;">
                                <span style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #8a8aaa;">Time</span><br>
                                <span style="font-size: 16px; font-weight: 600; color: #1a1a2e;">${formattedStart} &ndash; ${formattedEnd}</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 0; vertical-align: top; width: 28px;"><span style="font-size: 20px;">&#127760;</span></td>
                              <td style="padding: 0 0 0 12px; vertical-align: top;">
                                <span style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #8a8aaa;">Timezone</span><br>
                                <span style="font-size: 16px; font-weight: 600; color: #1a1a2e;">${safeTimezone}</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <!-- Calendar Buttons -->
              <table role="presentation" style="width: 100%; border: none; border-spacing: 0;">
                <tr>
                  <td style="padding: 0 40px 12px;">
                    <p style="margin: 0 0 16px; font-size: 15px; font-weight: 600; color: #1a1a2e;">Add to your calendar:</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 40px 32px;">
                    <table role="presentation" style="border: none; border-spacing: 0;">
                      <tr>
                        <td class="btn-mobile" style="padding: 0 12px 0 0;">
                          <a href="${safeGoogleLink}" target="_blank" style="display: inline-block; background-color: #0066FF; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 8px; text-align: center; min-width: 160px;">Google Calendar</a>
                        </td>
                        <td class="btn-mobile" style="padding: 0;">
                          <a href="${safeOutlookLink}" target="_blank" style="display: inline-block; background-color: #ffffff; color: #0066FF; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 8px; border: 2px solid #0066FF; text-align: center; min-width: 160px;">Outlook Calendar</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <!-- What to Expect -->
              <table role="presentation" style="width: 100%; border: none; border-spacing: 0;">
                <tr><td style="padding: 0 40px;"><hr style="border: none; border-top: 1px solid #e8eaf0; margin: 0;"></td></tr>
                <tr>
                  <td style="padding: 28px 40px 36px;">
                    <h2 style="margin: 0 0 12px; font-size: 17px; font-weight: 600; color: #1a1a2e;">What to Expect</h2>
                    <p style="margin: 0; font-size: 15px; color: #4a4a6a; line-height: 1.7;">During your 30-minute strategy call, we will discuss your business needs and explore how our agentic systems can help you scale operations, reduce costs, and unlock new growth.</p>
                    <p style="margin: 16px 0 0; font-size: 15px; color: #4a4a6a; line-height: 1.7;">No preparation is needed &mdash; just come ready to talk about your business goals.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 28px 40px; text-align: center; background-color: #0a0a1a; border-radius: 0 0 12px 12px;">
              <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #ffffff;">AI KRE8TION Partners</p>
              <p style="margin: 0 0 16px; font-size: 13px; color: #8a8aaa;">Agentic Systems for Small &amp; Medium Businesses</p>
              <p style="margin: 0; font-size: 12px; color: #6a6a8a;">Need to reschedule? Reply to this email and we will help you find a new time.</p>
              <p style="margin: 16px 0 0; font-size: 11px; color: #4a4a6a;">&copy; ${year} AI KRE8TION Partners. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export interface AssessmentConfirmationData {
  guestName: string;
  date: string;
  startTime: string;
  endTime: string;
  timezone: string;
  paymentAmountCents: number;
  googleCalLink: string;
  outlookCalLink: string;
}

export function assessmentConfirmationTemplate(data: AssessmentConfirmationData): string {
  const formattedDate = formatDateReadable(data.date);
  const formattedStart = formatTimeReadable(data.startTime);
  const formattedEnd = formatTimeReadable(data.endTime);
  const safeName = escapeHtml(data.guestName);
  const safeTimezone = escapeHtml(data.timezone);
  const safeGoogleLink = escapeHtml(data.googleCalLink);
  const safeOutlookLink = escapeHtml(data.outlookCalLink);
  const amountFormatted = `$${(data.paymentAmountCents / 100).toFixed(2)}`;
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assessment Confirmed</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .btn-mobile { display: block !important; width: 100% !important; max-width: 280px !important; margin: 8px auto !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f9;">
  <table role="presentation" style="width: 100%; border: none; border-spacing: 0; background-color: #f4f6f9;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" class="email-container" style="width: 600px; max-width: 600px; border: none; border-spacing: 0; text-align: left; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 16px; line-height: 1.5; color: #1a1a2e;">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px 24px; text-align: center; background-color: #0a0a1a; border-radius: 12px 12px 0 0;">
              <span style="font-size: 28px; font-weight: 700; color: #ffffff;">AI KRE8TION</span>
              <span style="font-size: 28px; font-weight: 300; color: #0066FF;"> Partners</span>
              <br>
              <span style="display: inline-block; margin-top: 16px; background-color: #F97316; color: #ffffff; font-size: 13px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; padding: 6px 20px; border-radius: 20px;">Assessment Confirmed &amp; Paid</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background-color: #ffffff;">
              <!-- Greeting -->
              <table role="presentation" style="width: 100%; border: none; border-spacing: 0;">
                <tr>
                  <td style="padding: 36px 40px 16px;">
                    <h1 style="margin: 0; font-size: 22px; font-weight: 600; color: #1a1a2e;">Hi ${safeName},</h1>
                    <p style="margin: 12px 0 0; font-size: 16px; color: #4a4a6a; line-height: 1.6;">Your onsite AI assessment has been confirmed and paid. We look forward to visiting your business.</p>
                  </td>
                </tr>
              </table>
              <!-- Payment Confirmation -->
              <table role="presentation" style="width: 100%; border: none; border-spacing: 0;">
                <tr>
                  <td style="padding: 8px 40px 16px;">
                    <table role="presentation" style="width: 100%; border: none; border-spacing: 0; background-color: #F0FDF4; border-radius: 10px; border: 1px solid #BBF7D0;">
                      <tr>
                        <td style="padding: 16px 24px;">
                          <table role="presentation" style="width: 100%; border: none; border-spacing: 0;">
                            <tr>
                              <td style="vertical-align: middle;"><span style="font-size: 14px; color: #166534; font-weight: 600;">Payment Received</span></td>
                              <td style="text-align: right; vertical-align: middle;"><span style="font-size: 20px; font-weight: 700; color: #166534;">${amountFormatted}</span></td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <!-- Booking Details -->
              <table role="presentation" style="width: 100%; border: none; border-spacing: 0;">
                <tr>
                  <td style="padding: 8px 40px 24px;">
                    <table role="presentation" style="width: 100%; border: none; border-spacing: 0; background-color: #f8f9fc; border-radius: 10px; border: 1px solid #e8eaf0;">
                      <tr>
                        <td style="padding: 24px 28px;">
                          <table role="presentation" style="width: 100%; border: none; border-spacing: 0;">
                            <tr>
                              <td style="padding: 0 0 16px; vertical-align: top; width: 28px;"><span style="font-size: 20px;">&#128197;</span></td>
                              <td style="padding: 0 0 16px 12px; vertical-align: top;">
                                <span style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #8a8aaa;">Date</span><br>
                                <span style="font-size: 16px; font-weight: 600; color: #1a1a2e;">${formattedDate}</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 0 0 16px; vertical-align: top; width: 28px;"><span style="font-size: 20px;">&#128336;</span></td>
                              <td style="padding: 0 0 16px 12px; vertical-align: top;">
                                <span style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #8a8aaa;">Time</span><br>
                                <span style="font-size: 16px; font-weight: 600; color: #1a1a2e;">${formattedStart} &ndash; ${formattedEnd}</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 0; vertical-align: top; width: 28px;"><span style="font-size: 20px;">&#127760;</span></td>
                              <td style="padding: 0 0 0 12px; vertical-align: top;">
                                <span style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #8a8aaa;">Timezone</span><br>
                                <span style="font-size: 16px; font-weight: 600; color: #1a1a2e;">${safeTimezone}</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <!-- Calendar Buttons -->
              <table role="presentation" style="width: 100%; border: none; border-spacing: 0;">
                <tr>
                  <td style="padding: 0 40px 12px;">
                    <p style="margin: 0 0 16px; font-size: 15px; font-weight: 600; color: #1a1a2e;">Add to your calendar:</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 40px 32px;">
                    <table role="presentation" style="border: none; border-spacing: 0;">
                      <tr>
                        <td class="btn-mobile" style="padding: 0 12px 0 0;">
                          <a href="${safeGoogleLink}" target="_blank" style="display: inline-block; background-color: #0066FF; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 8px; text-align: center; min-width: 160px;">Google Calendar</a>
                        </td>
                        <td class="btn-mobile" style="padding: 0;">
                          <a href="${safeOutlookLink}" target="_blank" style="display: inline-block; background-color: #ffffff; color: #0066FF; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 8px; border: 2px solid #0066FF; text-align: center; min-width: 160px;">Outlook Calendar</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <!-- What to Expect -->
              <table role="presentation" style="width: 100%; border: none; border-spacing: 0;">
                <tr><td style="padding: 0 40px;"><hr style="border: none; border-top: 1px solid #e8eaf0; margin: 0;"></td></tr>
                <tr>
                  <td style="padding: 28px 40px 36px;">
                    <h2 style="margin: 0 0 12px; font-size: 17px; font-weight: 600; color: #1a1a2e;">What to Expect</h2>
                    <p style="margin: 0; font-size: 15px; color: #4a4a6a; line-height: 1.7;">During your 3-hour on-site assessment, I will shadow you or a staff member to understand your day-to-day operations firsthand &mdash; including ride-alongs, workflow observation, and hands-on time with your team.</p>
                    <p style="margin: 16px 0 0; font-size: 15px; color: #4a4a6a; line-height: 1.7;">Afterward, we will sit down together to review a synopsis of the AI opportunities I&rsquo;ve identified. You&rsquo;ll decide if you&rsquo;d like to invest in implementation and choose a partnership tier.</p>
                    <p style="margin: 16px 0 0; font-size: 15px; color: #4a4a6a; line-height: 1.7;">If you choose not to proceed, you will receive a complete written strategy report with all recommendations &mdash; it&rsquo;s yours to keep.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 28px 40px; text-align: center; background-color: #0a0a1a; border-radius: 0 0 12px 12px;">
              <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #ffffff;">AI KRE8TION Partners</p>
              <p style="margin: 0 0 16px; font-size: 13px; color: #8a8aaa;">Agentic Systems for Small &amp; Medium Businesses</p>
              <p style="margin: 0; font-size: 12px; color: #6a6a8a;">Need to reschedule? Reply to this email and we will help you find a new time.</p>
              <p style="margin: 16px 0 0; font-size: 11px; color: #4a4a6a;">&copy; ${year} AI KRE8TION Partners. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export interface LeadDossierData {
  guestName: string;
  guestEmail: string;
  industry: string;
  employeeCount: string;
  roiScore: number;
  priority: string;
  painPoints: string[];
  summary: string;
  appointmentTime: string;
}

export function leadDossierTemplate(data: LeadDossierData): string {
  const priorityColor = data.priority === 'high' ? '#EF4444' : data.priority === 'medium' ? '#F59E0B' : '#10B981';
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: sans-serif; line-height: 1.5; color: #1a1a2e; background: #f4f6f9; margin: 0; padding: 20px; }
    .card { background: white; border-radius: 12px; padding: 32px; max-width: 600px; margin: 0 auto; border: 1px solid #e8eaf0; }
    .header { border-bottom: 2px solid #f0f2f5; padding-bottom: 20px; margin-bottom: 24px; }
    .priority-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; color: white; font-size: 12px; font-weight: bold; text-transform: uppercase; }
    .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .stat-item { background: #f8f9fc; padding: 12px; border-radius: 8px; border: 1px solid #e8eaf0; }
    .stat-label { font-size: 11px; color: #8a8aaa; text-transform: uppercase; font-weight: bold; }
    .stat-value { font-size: 15px; font-weight: bold; }
    .section-title { font-size: 14px; font-weight: bold; color: #0066FF; margin-top: 24px; margin-bottom: 8px; text-transform: uppercase; }
    .pain-point { background: #FFF5F5; color: #C53030; padding: 4px 8px; border-radius: 4px; display: inline-block; margin: 2px; font-size: 13px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="priority-badge" style="background-color: ${priorityColor};">${data.priority} Priority Lead</div>
      <h1 style="margin: 8px 0 0; font-size: 24px;">New Booking: ${data.guestName}</h1>
      <p style="color: #6a6a8a; margin: 4px 0;">${data.appointmentTime}</p>
    </div>

    <div class="stat-grid">
      <div class="stat-item">
        <div class="stat-label">Industry</div>
        <div class="stat-value">${data.industry}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Business Size</div>
        <div class="stat-value">${data.employeeCount} Employees</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">ROI Score</div>
        <div class="stat-value" style="color: #10B981;">${data.roiScore}/100</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Email</div>
        <div class="stat-value">${data.guestEmail}</div>
      </div>
    </div>

    <div class="section-title">Detected Pain Points</div>
    <div>
      ${data.painPoints.map(p => `<span class="pain-point">${p}</span>`).join('')}
    </div>

    <div class="section-title">AI Strategist Summary</div>
    <p style="font-size: 15px; background: #F0F7FF; padding: 16px; border-radius: 8px; border-left: 4px solid #0066FF;">
      ${data.summary}
    </p>

    <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #aaa;">
      Sent automatically by AI KRE8TION Partners Agentic CRM.
    </div>
  </div>
</body>
</html>`;
}
