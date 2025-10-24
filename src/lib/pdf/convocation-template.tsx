import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';

// Register fonts (optional - using default fonts)
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
      fontWeight: 'bold',
    },
  ],
});

// Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Roboto',
    fontSize: 11,
    lineHeight: 1.6,
  },
  header: {
    marginBottom: 30,
    borderBottom: 2,
    borderBottomColor: '#3b82f6',
    paddingBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderRadius: 4,
  },
  text: {
    fontSize: 11,
    color: '#374151',
    marginBottom: 5,
  },
  bold: {
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    width: 100,
    fontWeight: 'bold',
    color: '#4b5563',
  },
  infoValue: {
    flex: 1,
    color: '#1f2937',
  },
  agendaItem: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingLeft: 10,
  },
  agendaNumber: {
    width: 30,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  agendaContent: {
    flex: 1,
  },
  agendaTitle: {
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 3,
  },
  agendaDescription: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 3,
  },
  agendaDuration: {
    fontSize: 9,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  participantsList: {
    marginTop: 5,
  },
  participant: {
    fontSize: 10,
    color: '#4b5563',
    marginBottom: 4,
    paddingLeft: 15,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    paddingTop: 15,
    borderTop: 1,
    borderTopColor: '#e5e7eb',
  },
  footerText: {
    fontSize: 9,
    color: '#6b7280',
    textAlign: 'center',
  },
  alertBox: {
    backgroundColor: '#fef3c7',
    border: 1,
    borderColor: '#fbbf24',
    borderRadius: 4,
    padding: 12,
    marginTop: 15,
  },
  alertText: {
    fontSize: 10,
    color: '#92400e',
  },
});

interface AgendaItem {
  order: number;
  title: string;
  description?: string | null;
  duration?: number | null;
}

interface Participant {
  user: {
    name: string;
    cseRole: string | null;
    email: string;
  };
}

interface ConvocationData {
  meeting: {
    date: Date;
    time: string;
    type: 'ORDINARY' | 'EXTRAORDINARY';
    location: string | null;
    feedbackDeadline: Date | null;
  };
  agendaItems: AgendaItem[];
  participants: Participant[];
  createdBy: {
    name: string;
    cseRole: string | null;
  };
}

export const ConvocationTemplate: React.FC<ConvocationData> = ({
  meeting,
  agendaItems,
  participants,
  createdBy,
}) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    return time;
  };

  const meetingType =
    meeting.type === 'ORDINARY' ? 'Réunion ordinaire' : 'Réunion extraordinaire';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Convocation</Text>
          <Text style={styles.subtitle}>
            Comité Social et Économique - RCCEM Montataire
          </Text>
        </View>

        {/* Meeting Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations de la réunion</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Type :</Text>
            <Text style={styles.infoValue}>{meetingType}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date :</Text>
            <Text style={styles.infoValue}>
              {formatDate(meeting.date)} à {formatTime(meeting.time)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Lieu :</Text>
            <Text style={styles.infoValue}>{meeting.location || 'À définir'}</Text>
          </View>
        </View>

        {/* Agenda */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ordre du jour</Text>

          {agendaItems.length === 0 ? (
            <Text style={styles.text}>Aucun point à l'ordre du jour pour le moment.</Text>
          ) : (
            agendaItems.map((item) => (
              <View key={item.order} style={styles.agendaItem}>
                <Text style={styles.agendaNumber}>{item.order}.</Text>
                <View style={styles.agendaContent}>
                  <Text style={styles.agendaTitle}>{item.title}</Text>
                  {item.description && (
                    <Text style={styles.agendaDescription}>{item.description}</Text>
                  )}
                  {item.duration && (
                    <Text style={styles.agendaDuration}>
                      Durée estimée : {item.duration} minutes
                    </Text>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        {/* Participants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Membres convoqués ({participants.length})
          </Text>

          <View style={styles.participantsList}>
            {participants.map((participant, index) => (
              <Text key={index} style={styles.participant}>
                • {participant.user.name}
                {participant.user.cseRole && ` - ${participant.user.cseRole}`}
              </Text>
            ))}
          </View>
        </View>

        {/* Feedback deadline alert */}
        {meeting.feedbackDeadline && (
          <View style={styles.alertBox}>
            <Text style={[styles.alertText, styles.bold]}>
              📢 Remontées du personnel
            </Text>
            <Text style={styles.alertText}>
              Les membres peuvent soumettre des questions ou remarques via
              l'application jusqu'au {formatDate(meeting.feedbackDeadline)} à{' '}
              {formatTime(
                new Date(meeting.feedbackDeadline).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              )}
              .
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Convocation émise par {createdBy.name}
            {createdBy.cseRole && ` (${createdBy.cseRole})`}
          </Text>
          <Text style={styles.footerText}>
            CSE RCCEM-Montataire - {formatDate(new Date())}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default ConvocationTemplate;
