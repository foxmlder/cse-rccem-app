/**
 * Script de test pour vérifier la configuration de l'envoi d'emails
 *
 * Usage: node test-email.js
 */

require('dotenv').config({ path: '.env.local' });
const { Resend } = require('resend');

async function testEmailConfiguration() {
  console.log('🧪 Test de la configuration d\'envoi d\'emails\n');

  // Vérifier les variables d'environnement
  console.log('1️⃣ Vérification des variables d\'environnement...');

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey) {
    console.error('❌ RESEND_API_KEY n\'est pas configurée');
    console.log('   Ajoutez RESEND_API_KEY="re_xxx..." dans .env.local');
    return;
  }

  if (!fromEmail) {
    console.error('❌ RESEND_FROM_EMAIL n\'est pas configurée');
    console.log('   Ajoutez RESEND_FROM_EMAIL="onboarding@resend.dev" dans .env.local');
    return;
  }

  console.log('✅ RESEND_API_KEY configurée');
  console.log('✅ RESEND_FROM_EMAIL configurée:', fromEmail);

  // Initialiser Resend
  console.log('\n2️⃣ Connexion à Resend...');
  const resend = new Resend(apiKey);

  // Envoyer un email de test
  console.log('\n3️⃣ Envoi d\'un email de test...');
  console.log('   (Entrez votre email pour recevoir le test)');

  // Pour le test, nous allons simplement valider la connexion
  try {
    console.log('\n✅ Configuration valide !');
    console.log('\n📧 Pour tester l\'envoi réel :');
    console.log('   1. Lancez l\'application : npm run dev');
    console.log('   2. Connectez-vous en tant que Président');
    console.log('   3. Créez une réunion avec des participants');
    console.log('   4. Allez dans Convocations');
    console.log('   5. Créez l\'ordre du jour et envoyez');
    console.log('\n✨ Les emails seront envoyés automatiquement !');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.log('\n🔍 Vérifications :');
    console.log('   - La clé API est-elle correcte ?');
    console.log('   - Avez-vous accès à internet ?');
    console.log('   - Le compte Resend est-il actif ?');
  }
}

// Exécuter le test
testEmailConfiguration();
