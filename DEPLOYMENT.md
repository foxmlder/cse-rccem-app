# Configuration Base de données Neon et Déploiement Vercel

## 🐘 Configuration Neon PostgreSQL

### Étape 1 : Créer un compte Neon
1. Aller sur [https://neon.tech](https://neon.tech)
2. Créer un compte gratuit
3. Créer un nouveau projet : "cse-rccem-app"

### Étape 2 : Obtenir l'URL de connexion
1. Dans le dashboard Neon, aller dans "Connection Details"
2. Copier la connection string (avec mot de passe)
3. Format : `postgresql://user:password@host.neon.tech/database?sslmode=require`

### Étape 3 : Configuration locale
```bash
# Créer le fichier .env.local
cp .env.example .env.local

# Éditer .env.local et ajouter :
DATABASE_URL="postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require"
```

### Étape 4 : Initialiser la base de données
```bash
# Générer le client Prisma
npx prisma generate

# Créer les tables
npx prisma db push

# Insérer les données initiales
npm run prisma:seed
```

### Vérification
```bash
# Ouvrir Prisma Studio pour voir les données
npx prisma studio
# Ouvrir http://localhost:5555
```

## ☁️ Déploiement sur Vercel

### Étape 1 : Préparer le repository GitHub

```bash
# Initialiser git (si pas déjà fait)
git init

# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "Initial commit - CSE RCCEM App"

# Créer un repo sur GitHub
# Puis pousser :
git remote add origin https://github.com/[votre-username]/cse-rccem-app.git
git branch -M main
git push -u origin main
```

### Étape 2 : Configurer Vercel

1. Aller sur [https://vercel.com](https://vercel.com)
2. Se connecter avec GitHub
3. Cliquer sur "Add New Project"
4. Importer le repository `cse-rccem-app`

### Étape 3 : Variables d'environnement

Dans les paramètres du projet Vercel, ajouter :

```bash
# Base de données
DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="[générer avec : openssl rand -base64 32]"
NEXTAUTH_URL="https://votre-app.vercel.app"

# Resend
RESEND_API_KEY="re_xxxxxxxxxxxx"
RESEND_FROM_EMAIL="noreply@rccem.fr"

# App config
NEXT_PUBLIC_APP_NAME="CSE RCCEM-Montataire"
NEXT_PUBLIC_APP_URL="https://votre-app.vercel.app"
```

### Étape 4 : Build settings

Vercel détecte automatiquement Next.js, mais vérifier :
- Framework Preset : Next.js
- Build Command : `next build`
- Output Directory : `.next`
- Install Command : `npm install`

### Étape 5 : Déploiement

```bash
# Via l'interface Vercel : cliquer sur "Deploy"

# OU via CLI :
npm i -g vercel
vercel login
vercel
vercel --prod
```

### Étape 6 : Post-déploiement

⚠️ Important : Après le premier déploiement, il faut initialiser la base de données :

Option 1 - Via Vercel CLI :
```bash
# Se connecter à votre projet
vercel link

# Pousser le schéma vers Neon
vercel env pull .env.local  # Récupérer les variables d'env
npx prisma db push

# Seed depuis local vers production
npx prisma db seed
```

Option 2 - Via fonction serverless :
Créer une route API temporaire pour le seed :
```typescript
// app/api/admin/seed/route.ts
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  // ⚠️ Ajouter une protection !
  const { secret } = await req.json()
  if (secret !== process.env.SEED_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Logique de seed ici...
  
  return Response.json({ success: true })
}
```

Puis appeler :
```bash
curl -X POST https://votre-app.vercel.app/api/admin/seed \
  -H "Content-Type: application/json" \
  -d '{"secret": "your-secret"}'
```

⚠️ Supprimer cette route après utilisation !

## 📧 Configuration Resend

### Étape 1 : Créer un compte
1. Aller sur [https://resend.com](https://resend.com)
2. Créer un compte
3. Vérifier l'email

### Étape 2 : Ajouter un domaine
1. Dans Resend Dashboard → Domains
2. Ajouter `rccem.fr`
3. Configurer les DNS records (SPF, DKIM, etc.)

DNS records à ajouter :
```
Type: TXT
Name: resend._domainkey
Value: [fourni par Resend]

Type: TXT  
Name: @
Value: v=spf1 include:resend.com ~all

Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none
```

### Étape 3 : Générer une API Key
1. API Keys → Create API Key
2. Donner un nom : "cse-rccem-production"
3. Copier la clé (elle ne sera affichée qu'une fois)
4. Ajouter dans variables d'env Vercel

### Étape 4 : Test d'envoi
```bash
# Tester localement
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "noreply@rccem.fr",
    "to": "f.muselet@rccem.fr",
    "subject": "Test CSE App",
    "html": "<p>Email de test</p>"
  }'
```

## 🔄 Workflow de développement

### Développement local
```bash
git checkout -b feature/nouvelle-fonctionnalite
# Développer...
git add .
git commit -m "feat: description"
git push origin feature/nouvelle-fonctionnalite
```

### Preview deployments
- Chaque push vers une branche crée un preview deployment automatique
- URL : `https://cse-rccem-app-git-branch.vercel.app`
- Parfait pour tester avant merge

### Production
```bash
git checkout main
git merge feature/nouvelle-fonctionnalite
git push origin main
# → Déploiement automatique en production
```

## 🔍 Monitoring

### Logs Vercel
- Aller dans Vercel Dashboard → votre projet → Logs
- Voir les logs en temps réel
- Filtrer par fonction serverless

### Neon Monitoring
- Dashboard Neon → Metrics
- Voir les connexions actives
- Usage du storage
- Query performance

### Errors tracking (optionnel)
Intégrer Sentry :
```bash
npm install @sentry/nextjs

# Suivre la configuration :
npx @sentry/wizard@latest -i nextjs
```

## 🔐 Sécurité Production

### Checklist
- ✅ Variables d'env configurées
- ✅ NEXTAUTH_SECRET fort (32+ caractères)
- ✅ DATABASE_URL avec SSL
- ✅ CORS configuré
- ✅ Rate limiting activé
- ✅ Headers de sécurité configurés

### Headers de sécurité Next.js
```javascript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}
```

## 🆘 Troubleshooting

### Erreur : "Cannot connect to database"
- Vérifier DATABASE_URL dans variables d'env
- Vérifier que Neon n'est pas en pause (gratuit)
- Tester la connexion avec `npx prisma db pull`

### Erreur : "NEXTAUTH_URL is not set"
- Ajouter dans variables d'env Vercel
- Format : https://votre-app.vercel.app (sans slash final)

### Emails non reçus
- Vérifier RESEND_API_KEY
- Vérifier DNS records du domaine
- Checker les logs Resend

### Build échoue
- Vérifier les dépendances dans package.json
- Voir les logs de build Vercel
- Tester `npm run build` localement

## 📊 Coûts estimés

### Neon (Base de données)
- Plan gratuit : 0.5GB storage, 1 projet
- Plan Pro : $19/mois (3GB storage, 10 projets)
- Pour cette app : **Plan gratuit suffisant**

### Vercel (Hébergement)
- Plan Hobby : Gratuit (100GB bandwidth)
- Plan Pro : $20/mois (1TB bandwidth)
- Pour cette app : **Plan gratuit suffisant** (usage interne)

### Resend (Emails)
- Plan gratuit : 100 emails/jour, 3000/mois
- Plan Pro : $20/mois (50k emails/mois)
- Pour cette app : **Plan gratuit largement suffisant**

**Total mensuel estimé : 0€** avec les plans gratuits ! 🎉

## 🎯 URL finale

Une fois déployé, votre application sera accessible à :
```
https://cse-rccem-app.vercel.app
```

Ou avec un domaine custom :
```
https://cse.rccem.fr
```

Pour configurer un domaine custom :
1. Vercel Dashboard → Settings → Domains
2. Ajouter `cse.rccem.fr`
3. Configurer le DNS avec les records fournis
