import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Démarrage du seeding...');

  // Créer les utilisateurs
  const hashedPasswordAdmin = await bcrypt.hash('admin123', 10);
  const hashedPasswordMember = await bcrypt.hash('membre123', 10);

  // Fabien Muselet - Président du CSE
  const president = await prisma.user.upsert({
    where: { email: 'f.muselet@rccem.fr' },
    update: {},
    create: {
      email: 'f.muselet@rccem.fr',
      name: 'Fabien Muselet',
      password: hashedPasswordAdmin,
      role: 'PRESIDENT',
      cseRole: 'Président du CSE',
    },
  });

  console.log('✅ Utilisateur créé:', president.name, '- Président du CSE');

  // Fatiha Lakhdar - Titulaire CSE
  const member = await prisma.user.upsert({
    where: { email: 'f.lakhdar@rccem.fr' },
    update: {},
    create: {
      email: 'f.lakhdar@rccem.fr',
      name: 'Fatiha Lakhdar',
      password: hashedPasswordMember,
      role: 'MEMBER',
      cseRole: 'Titulaire CSE',
    },
  });

  console.log('✅ Utilisateur créé:', member.name, '- Titulaire CSE');

  // Créer quelques membres supplémentaires pour les tests
  const hashedPasswordTest = await bcrypt.hash('test123', 10);

  const additionalMembers = [
    {
      email: 'marie.dupont@rccem.fr',
      name: 'Marie Dupont',
      cseRole: 'Secrétaire',
    },
    {
      email: 'jean.martin@rccem.fr',
      name: 'Jean Martin',
      cseRole: 'Trésorier',
    },
    {
      email: 'sophie.bernard@rccem.fr',
      name: 'Sophie Bernard',
      cseRole: 'Membre titulaire',
    },
    {
      email: 'luc.petit@rccem.fr',
      name: 'Luc Petit',
      cseRole: 'Membre suppléant',
    },
  ];

  for (const memberData of additionalMembers) {
    await prisma.user.upsert({
      where: { email: memberData.email },
      update: {},
      create: {
        ...memberData,
        password: hashedPasswordTest,
        role: 'MEMBER',
      },
    });
    console.log('✅ Utilisateur créé:', memberData.name, '-', memberData.cseRole);
  }

  // Créer une réunion de test
  const testMeeting = await prisma.meeting.create({
    data: {
      date: new Date('2025-11-05'),
      time: '14:00',
      type: 'ORDINARY',
      status: 'PLANNED',
      location: 'Salle de réunion - Bâtiment A',
      feedbackDeadline: new Date('2025-11-03T14:00:00'),
      createdById: president.id,
      participants: {
        create: [
          { userId: president.id, status: 'INVITED' },
          { userId: member.id, status: 'INVITED' },
        ],
      },
      agendaItems: {
        create: [
          {
            order: 1,
            title: 'Approbation du procès-verbal de la dernière réunion',
            duration: 10,
          },
          {
            order: 2,
            title: 'Bilan des activités sociales',
            description: 'Point sur les activités du trimestre',
            duration: 20,
          },
          {
            order: 3,
            title: 'Questions diverses',
            duration: 15,
          },
        ],
      },
    },
  });

  console.log('✅ Réunion de test créée pour le', testMeeting.date.toLocaleDateString('fr-FR'));

  // Créer des remontées de test
  await prisma.feedback.create({
    data: {
      meetingId: testMeeting.id,
      submittedById: member.id,
      subject: 'Amélioration des vestiaires',
      description: 'Plusieurs salariés se plaignent de l\'état des vestiaires. Il serait nécessaire de prévoir une rénovation.',
      category: 'WORKING_CONDITIONS',
      status: 'PENDING',
    },
  });

  console.log('✅ Remontées de test créées');

  console.log('');
  console.log('🎉 Seeding terminé avec succès !');
  console.log('');
  console.log('📧 Comptes créés :');
  console.log('   Président : f.muselet@rccem.fr / admin123');
  console.log('   Titulaire : f.lakhdar@rccem.fr / membre123');
  console.log('   Autres membres : test123');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
