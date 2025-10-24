# Configuration de l'envoi d'emails - Guide complet

## 📧 Vue d'ensemble

Le système d'envoi d'emails pour les convocations est **déjà implémenté** et utilise Resend (service d'envoi d'emails moderne et fiable).

### Fichiers créés

✅ **Templates d'emails**
- `src/lib/email/templates/convocation.ts` - Templates HTML et texte

✅ **Service d'envoi**
- `src/lib/email/send-convocation.ts` - Logique d'envoi avec Resend

✅ **API Routes**
- `src/app/api/convocations/send/route.ts` - Endpoint d'envoi
- `src/app/api/convocations/generate/route.ts` - Génération PDF

## 🔧 Configuration (5 minutes)

### Étape 1 : Créer un compte Resend

1. Allez sur [resend.com](https://resend.com)
2. Créez un compte gratuit (100 emails/jour gratuits)
3. Connectez-vous au dashboard

### Étape 2 : Obtenir une API Key

1. Dans le dashboard Resend, allez dans **API Keys**
2. Cliquez sur **Create API Key**
3. Donnez un nom : "CSE RCCEM Development"
4. Copiez la clé générée (elle commence par `re_`)

### Étape 3 : Configurer les variables d'environnement

Éditez votre fichier `.env.local` :

```bash
# Resend API Key (obligatoire)
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxx"

# Email de l'expéditeur (obligatoire)
RESEND_FROM_EMAIL="onboarding@resend.dev"

# URL de l'application (déjà configuré)
NEXTAUTH_URL="http://localhost:3000"
```

**⚠️ Important pour le développement :**
- En mode développement, utilisez `onboarding@resend.dev` comme email expéditeur
- Cet email est fourni par Resend pour les tests et fonctionne sans configuration de domaine

### Étape 4 : Vérifier que le package est installé

Le package `resend` est déjà dans le `package.json`. Si vous avez un problème, réinstallez :

```bash
npm install resend
```

### Étape 5 : Redémarrer l'application

```bash
npm run dev
```

## ✅ Test de l'envoi d'emails

### Test rapide (recommandé)

1. **Connectez-vous** en tant que Président :
   - Email : `f.muselet@rccem.fr`
   - Mot de passe : `admin123`

2. **Accédez aux réunions** via la navigation

3. **Créez une nouvelle réunion** :
   - Date : demain
   - Heure : 14:00
   - Lieu : Salle de réunion
   - Sélectionnez au moins 1 participant

4. **Allez dans Convocations** (menu navigation)

5. **Cliquez sur la réunion** que vous venez de créer

6. **Ajoutez des points à l'ordre du jour** :
   - Cliquez sur "Ajouter un point"
   - Remplissez le titre
   - Ajoutez une description et durée (optionnel)
   - Cliquez sur "Sauvegarder l'ordre du jour"

7. **Prévisualisez le PDF** (optionnel) :
   - Cliquez sur "Prévisualiser"
   - Vérifiez que tout est correct

8. **Envoyez la convocation** :
   - Cliquez sur "Envoyer la convocation"
   - Confirmez l'envoi
   - ✅ Les emails sont envoyés !

### Vérifier la réception

1. **Dashboard Resend** :
   - Allez sur [resend.com/emails](https://resend.com/emails)
   - Vous verrez tous les emails envoyés
   - Cliquez sur un email pour voir les détails

2. **Boîte mail des participants** :
   - Vérifiez la boîte mail des participants
   - L'email devrait contenir :
     - Informations de la réunion
     - Ordre du jour complet
     - PDF en pièce jointe
     - Lien vers l'application

## 📝 Exemple d'email envoyé

```
De : CSE RCCEM <onboarding@resend.dev>
À : participant@example.com
Sujet : Convocation - Réunion ordinaire du 15 novembre 2025
Pièce jointe : convocation-2025-11-15.pdf

Bonjour [Nom du participant],

Vous êtes convoqué(e) à la réunion ordinaire du CSE qui se tiendra le :

📅 vendredi 15 novembre 2025 à 14:00
📍 Salle de réunion - RCCEM Montataire

Ordre du jour :
1. Approbation du procès-verbal
2. Informations de la direction
3. Questions diverses

[Bouton : Accéder à l'application]

Cordialement,
Fabien Muselet
CSE RCCEM-Montataire
```

## 🚀 Configuration en production

### Étape 1 : Configurer un domaine personnalisé

1. Dans Resend, allez dans **Domains**
2. Cliquez sur **Add Domain**
3. Entrez votre domaine : `rccem.fr`
4. Suivez les instructions pour configurer les DNS

### Étape 2 : Vérifier le domaine

Ajoutez ces enregistrements DNS chez votre hébergeur :

```
Type  Name            Value
TXT   @               v=spf1 include:_spf.resend.com ~all
TXT   resend._domainkey  [clé fournie par Resend]
CNAME resend           feedback-smtp.resend.com
```

### Étape 3 : Utiliser votre domaine

Une fois le domaine vérifié, modifiez `.env.local` en production :

```bash
RESEND_FROM_EMAIL="noreply@rccem.fr"
# ou
RESEND_FROM_EMAIL="cse@rccem.fr"
```

### Étape 4 : Variables d'environnement sur Vercel

Dans les settings de votre projet Vercel :

```bash
RESEND_API_KEY=re_[votre_clé_de_production]
RESEND_FROM_EMAIL=noreply@rccem.fr
NEXTAUTH_URL=https://votre-app.vercel.app
```

## 🔍 Résolution de problèmes

### "RESEND_API_KEY is not configured"

**Solution :**
- Vérifiez que `.env.local` contient `RESEND_API_KEY`
- Redémarrez le serveur de développement
- La clé doit commencer par `re_`

### "RESEND_FROM_EMAIL is not configured"

**Solution :**
- Ajoutez `RESEND_FROM_EMAIL="onboarding@resend.dev"` dans `.env.local`
- Redémarrez le serveur

### Les emails ne sont pas reçus

**Vérifications :**
1. ✅ Les emails sont-ils dans le dashboard Resend ?
2. ✅ Vérifiez les spams/courriers indésirables
3. ✅ L'email du destinataire est-il correct ?
4. ✅ Avec le domaine `onboarding@resend.dev`, les emails peuvent mettre quelques minutes

### Erreur "Invalid from address"

**Solution :**
- En développement, utilisez `onboarding@resend.dev`
- Pour utiliser votre propre domaine, il doit être vérifié dans Resend

## 📊 Limites et quotas

### Plan gratuit Resend
- ✅ 100 emails par jour
- ✅ 3 000 emails par mois
- ✅ 1 domaine personnalisé
- ✅ API complète

### Pour plus de volume
- Plan Pro : $20/mois pour 50 000 emails
- Pas de limite de domaines

## 🧪 Test en développement

### Emails de test

Pour tester sans envoyer de vrais emails, vous pouvez :

1. **Utiliser un email de test** :
   - [Mailtrap.io](https://mailtrap.io) - Inbox de test
   - [Ethereal Email](https://ethereal.email) - Emails de test

2. **Modifier temporairement le code** :

```typescript
// src/lib/email/send-convocation.ts
// Remplacez temporairement les emails réels par un email de test
const recipientEmails = ['votre-email-de-test@example.com'];
```

## 💡 Fonctionnalités implémentées

✅ **Génération automatique du PDF** en pièce jointe
✅ **Template HTML responsive** avec design professionnel
✅ **Version texte** pour clients email simples
✅ **Personnalisation** du contenu par destinataire
✅ **Gestion des erreurs** avec logs détaillés
✅ **Tracking** des emails envoyés et échoués
✅ **Mise à jour automatique** du statut de la réunion
✅ **Protection** contre le double envoi

## 📞 Support

- **Documentation Resend** : [resend.com/docs](https://resend.com/docs)
- **Dashboard Resend** : [resend.com/emails](https://resend.com/emails)
- **Status Resend** : [status.resend.com](https://status.resend.com)

## ✨ Améliorations futures possibles

- [ ] Templates d'emails personnalisables
- [ ] Planification d'envoi différé
- [ ] Rappels automatiques avant la réunion
- [ ] Statistiques d'ouverture des emails
- [ ] Support de plusieurs langues
- [ ] Emails de confirmation de lecture

---

**Le système d'emails est prêt à l'emploi !** Configurez simplement votre compte Resend et testez. 🚀
