# CSE RCCEM-Montataire - Application de Gestion

Application web de gestion du Comité Social et Économique (CSE) pour RCCEM-Montataire.

## 🎯 Fonctionnalités

### Gestion des réunions
- Création de réunions (ordinaires et extraordinaires)
- Génération de convocations au format PDF
- Envoi automatique par email aux membres
- Gestion des ordres du jour
- Suivi des participants

### Remontées du personnel
- Collecte des questions et demandes du personnel avant les réunions
- Catégorisation (Conditions de travail, Organisation, Santé/Sécurité, etc.)
- Date limite de soumission avant chaque réunion
- Suivi du statut des remontées

### Comptes-rendus
- Rédaction des comptes-rendus de réunions
- Génération au format PDF
- Signature électronique des documents
- Validation par les membres
- Diffusion automatique par email

### Gestion des membres
- Liste des membres du CSE avec rôles
- Gestion des contacts et emails
- Distinction entre titulaires et suppléants

## 🛠️ Stack technique

- **Framework**: Next.js 14 (App Router)
- **UI**: React 18 + Tailwind CSS
- **Base de données**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Authentification**: NextAuth.js
- **Génération PDF**: react-pdf/renderer
- **Envoi emails**: Resend ou SendGrid
- **Signature électronique**: react-signature-canvas
- **Déploiement**: Vercel

## 📦 Installation

```bash
# Cloner le repository
git clone https://github.com/[votre-username]/cse-rccem-app.git
cd cse-rccem-app

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos valeurs

# Initialiser la base de données
npx prisma generate
npx prisma db push

# Créer les utilisateurs initiaux
npx prisma db seed

# Lancer le serveur de développement
npm run dev
```

## 🔐 Utilisateurs par défaut

### Président du CSE
- Email: f.muselet@rccem.fr
- Mot de passe: admin123
- Rôle: Président

### Membre titulaire
- Email: f.lakhdar@rccem.fr
- Mot de passe: membre123
- Rôle: Titulaire CSE

## 📁 Structure du projet

```
cse-rccem-app/
├── src/
│   ├── app/                    # Pages Next.js (App Router)
│   │   ├── api/               # API Routes
│   │   ├── auth/              # Pages d'authentification
│   │   ├── dashboard/         # Tableau de bord
│   │   ├── convocations/      # Gestion des convocations
│   │   ├── remontees/         # Remontées du personnel
│   │   ├── comptes-rendus/    # Comptes-rendus
│   │   └── membres/           # Gestion des membres
│   ├── components/            # Composants React réutilisables
│   ├── lib/                   # Utilitaires et configuration
│   │   ├── db.ts             # Client Prisma
│   │   ├── pdf.ts            # Génération PDF
│   │   └── email.ts          # Envoi emails
│   └── types/                 # Types TypeScript
├── prisma/
│   ├── schema.prisma         # Schéma de base de données
│   └── seed.ts               # Données initiales
├── public/                    # Fichiers statiques
└── package.json
```

## 🗄️ Base de données (Neon PostgreSQL)

La base de données comprend les tables suivantes :
- `users` - Utilisateurs et membres du CSE
- `meetings` - Réunions
- `meeting_participants` - Participants aux réunions
- `agenda_items` - Points à l'ordre du jour
- `feedbacks` - Remontées du personnel
- `meeting_minutes` - Comptes-rendus
- `signatures` - Signatures électroniques

Voir `prisma/schema.prisma` pour le schéma complet.

## 🚀 Déploiement sur Vercel

1. Créer un compte sur [Vercel](https://vercel.com)
2. Connecter votre repository GitHub
3. Configurer les variables d'environnement dans Vercel
4. Déployer automatiquement

### Variables d'environnement requises

```
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://votre-app.vercel.app"
RESEND_API_KEY="..."
```

## 📧 Configuration des emails

L'application utilise Resend pour l'envoi d'emails :
1. Créer un compte sur [Resend](https://resend.com)
2. Obtenir une API Key
3. Configurer le domaine d'envoi (rccem.fr)
4. Ajouter la clé dans `.env.local`

## 🔒 Sécurité

- Authentification sécurisée avec NextAuth.js
- Mots de passe hashés avec bcrypt
- Protection CSRF
- Variables d'environnement pour les secrets
- Validation des entrées avec Zod

## 📝 Développement avec Claude Code

Ce projet est conçu pour être développé avec Claude Code :

```bash
# Lancer Claude Code
claude-code

# Commandes utiles
- "Crée la page de dashboard selon la maquette"
- "Implémente l'authentification avec NextAuth"
- "Configure Prisma avec Neon"
- "Génère les API routes pour les réunions"
```

## 📄 License

Propriétaire - RCCEM-Montataire

## 👥 Contact

Pour toute question : f.muselet@rccem.fr
