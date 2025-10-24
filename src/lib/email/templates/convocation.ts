interface ConvocationEmailData {
  recipientName: string;
  meetingDate: string;
  meetingTime: string;
  meetingType: string;
  location: string;
  feedbackDeadline?: string;
  agendaItems: Array<{
    order: number;
    title: string;
    description?: string | null;
    duration?: number | null;
  }>;
  appUrl: string;
  presidentName: string;
}

export function getConvocationEmailHtml(data: ConvocationEmailData): string {
  const agendaItemsHtml = data.agendaItems
    .map(
      (item) => `
        <div style="margin: 15px 0; padding: 12px; background: #f9fafb; border-left: 3px solid #3b82f6; border-radius: 4px;">
          <div style="font-weight: 600; color: #1f2937; margin-bottom: 5px;">
            ${item.order}. ${item.title}
          </div>
          ${
            item.description
              ? `<div style="font-size: 14px; color: #6b7280; margin-bottom: 5px;">${item.description}</div>`
              : ''
          }
          ${
            item.duration
              ? `<div style="font-size: 12px; color: #9ca3af; font-style: italic;">Durée estimée : ${item.duration} minutes</div>`
              : ''
          }
        </div>
      `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Convocation - Réunion CSE</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">

        <!-- Header -->
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px 20px; text-align: center;">
          <div style="font-size: 28px; font-weight: bold; color: #ffffff; margin-bottom: 8px;">
            Convocation
          </div>
          <div style="font-size: 16px; color: #dbeafe;">
            Comité Social et Économique
          </div>
        </div>

        <!-- Content -->
        <div style="padding: 30px 20px;">

          <!-- Greeting -->
          <p style="font-size: 16px; color: #1f2937; margin: 0 0 20px 0;">
            Bonjour <strong>${data.recipientName}</strong>,
          </p>

          <p style="font-size: 15px; color: #4b5563; line-height: 1.6; margin: 0 0 25px 0;">
            Vous êtes convoqué(e) à la <strong>${data.meetingType.toLowerCase()}</strong> du CSE qui se tiendra le :
          </p>

          <!-- Meeting Info Card -->
          <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <div style="display: flex; align-items: center; margin-bottom: 12px;">
              <span style="font-size: 20px; margin-right: 10px;">📅</span>
              <div>
                <div style="font-size: 12px; color: #6b7280; margin-bottom: 2px;">Date et heure</div>
                <div style="font-size: 16px; font-weight: 600; color: #1f2937;">${data.meetingDate} à ${data.meetingTime}</div>
              </div>
            </div>

            <div style="display: flex; align-items: center;">
              <span style="font-size: 20px; margin-right: 10px;">📍</span>
              <div>
                <div style="font-size: 12px; color: #6b7280; margin-bottom: 2px;">Lieu</div>
                <div style="font-size: 16px; font-weight: 600; color: #1f2937;">${data.location}</div>
              </div>
            </div>
          </div>

          <!-- Agenda -->
          <div style="margin-bottom: 25px;">
            <h2 style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb;">
              Ordre du jour
            </h2>
            ${agendaItemsHtml}
          </div>

          <!-- Feedback Deadline Alert -->
          ${
            data.feedbackDeadline
              ? `
          <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
            <div style="display: flex; align-items: start;">
              <span style="font-size: 20px; margin-right: 10px;">💬</span>
              <div>
                <div style="font-weight: 600; color: #92400e; margin-bottom: 5px;">
                  Remontées du personnel
                </div>
                <div style="font-size: 14px; color: #92400e; line-height: 1.5;">
                  Si vous souhaitez soumettre des questions ou remarques, vous pouvez le faire via l'application jusqu'au <strong>${data.feedbackDeadline}</strong>.
                </div>
              </div>
            </div>
          </div>
          `
              : ''
          }

          <!-- CTA Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.appUrl}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; font-size: 16px;">
              Accéder à l'application
            </a>
          </div>

          <p style="font-size: 14px; color: #6b7280; line-height: 1.6; margin: 0;">
            Cordialement,<br>
            <strong>${data.presidentName}</strong><br>
            CSE RCCEM-Montataire
          </p>

        </div>

        <!-- Footer -->
        <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #9ca3af; margin: 0;">
            Cet email a été envoyé automatiquement depuis l'application de gestion CSE RCCEM-Montataire.
          </p>
        </div>

      </div>
    </body>
    </html>
  `;
}

export function getConvocationEmailText(data: ConvocationEmailData): string {
  const agendaItemsText = data.agendaItems
    .map(
      (item) =>
        `${item.order}. ${item.title}${item.description ? `\n   ${item.description}` : ''}${item.duration ? `\n   (Durée estimée : ${item.duration} minutes)` : ''}`
    )
    .join('\n\n');

  return `
Convocation - Réunion CSE
CSE RCCEM-Montataire

Bonjour ${data.recipientName},

Vous êtes convoqué(e) à la ${data.meetingType.toLowerCase()} du CSE qui se tiendra le :

📅 Date et heure : ${data.meetingDate} à ${data.meetingTime}
📍 Lieu : ${data.location}

ORDRE DU JOUR
${agendaItemsText}

${
  data.feedbackDeadline
    ? `
💬 REMONTÉES DU PERSONNEL
Si vous souhaitez soumettre des questions ou remarques, vous pouvez le faire via l'application jusqu'au ${data.feedbackDeadline}.
`
    : ''
}

Accédez à l'application : ${data.appUrl}

Cordialement,
${data.presidentName}
CSE RCCEM-Montataire

---
Cet email a été envoyé automatiquement depuis l'application de gestion CSE RCCEM-Montataire.
  `.trim();
}
