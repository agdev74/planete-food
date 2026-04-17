import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// ✅ Initialisation sécurisée : si la clé est manquante (build time), on ne crée pas l'instance
// Cela évite l'erreur "Missing API key" qui bloque le déploiement.
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null;

export async function POST(request: Request) {
  try {
    // ✅ Vérification de sécurité : on s'assure que Resend est bien configuré
    if (!resend) {
      console.error("RESEND_API_KEY est manquante dans les variables d'environnement.");
      return NextResponse.json(
        { message: "Service de messagerie non configuré" }, 
        { status: 500 }
      );
    }

    const body = await request.json();
    const { name, email, subject, phone, message, date, guests } = body;

    // Envoi de l'e-mail via Resend
    const { data, error } = await resend.emails.send({
      from: 'Kabuki Sushi - Site Web <onboarding@resend.dev>',
      to: ['adrien.garcon@gmail.com'], 
      subject: `🍣 Nouvelle demande Kabuki : ${subject}`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #000; padding: 30px; text-align: center;">
            <h1 style="color: #e11d48; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">Nouvelle demande</h1>
          </div>
          
          <div style="padding: 30px; background-color: #ffffff;">
            <p style="font-size: 16px; margin-bottom: 25px;">Vous avez reçu un nouveau message depuis le formulaire de contact du site <strong>Kabuki Sushi</strong>.</p>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #666; font-size: 14px; width: 150px;"><strong>Client</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #000; font-size: 14px;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #666; font-size: 14px;"><strong>Email</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #000; font-size: 14px;"><a href="mailto:${email}" style="color: #e11d48; text-decoration: none;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #666; font-size: 14px;"><strong>Téléphone</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #000; font-size: 14px;">${phone || 'Non renseigné'}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #666; font-size: 14px;"><strong>Sujet</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #000; font-size: 14px; font-weight: bold;">${subject}</td>
              </tr>
              
              ${subject === 'Traiteur' ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #e11d48; font-size: 14px;"><strong>Date Event</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #e11d48; font-size: 14px; font-weight: bold;">${date || 'Non précisée'}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #e11d48; font-size: 14px;"><strong>Convives</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #e11d48; font-size: 14px; font-weight: bold;">${guests || 'Non précisé'}</td>
              </tr>
              ` : ''}
            </table>
            
            <div style="margin-top: 30px; padding: 20px; background-color: #f9f9f9; border-radius: 8px; font-style: italic; color: #444; line-height: 1.6;">
              "${message}"
            </div>
          </div>
          
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; color: #999; font-size: 12px;">
            Cet e-mail a été généré automatiquement par le système de contact de kabukisushi.ch
          </div>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json({ message: "Erreur d'envoi", error }, { status: 400 });
    }

    return NextResponse.json({ message: "Succès", data }, { status: 200 });

  } catch (err) {
    return NextResponse.json({ message: "Erreur serveur", error: err }, { status: 500 });
  }
}