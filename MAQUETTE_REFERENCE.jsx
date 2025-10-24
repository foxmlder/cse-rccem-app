import React, { useState } from 'react';
import { Calendar, FileText, Send, CheckCircle, Users, Plus, Download, Mail, Edit, Eye, MessageSquare, AlertCircle, Trash2 } from 'lucide-react';

export default function CSEApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showNewMeetingModal, setShowNewMeetingModal] = useState(false);

  // Données fictives
  const meetings = [
    {
      id: 1,
      date: '2025-11-05',
      time: '14:00',
      type: 'Réunion ordinaire',
      status: 'À venir',
      convocationSent: true,
      crStatus: 'Non rédigé',
      attendees: ['Marie Dupont', 'Jean Martin', 'Sophie Bernard', 'Luc Petit'],
      feedbackCount: 3,
      feedbackDeadline: '2025-11-03T14:00:00'
    },
    {
      id: 2,
      date: '2025-10-15',
      time: '14:00',
      type: 'Réunion ordinaire',
      status: 'Terminée',
      convocationSent: true,
      crStatus: 'Signé',
      attendees: ['Marie Dupont', 'Jean Martin', 'Sophie Bernard', 'Luc Petit'],
      feedbackCount: 5,
      feedbackDeadline: '2025-10-13T14:00:00'
    },
    {
      id: 3,
      date: '2025-09-20',
      time: '14:00',
      type: 'Réunion extraordinaire',
      status: 'Terminée',
      convocationSent: true,
      crStatus: 'Signé',
      attendees: ['Marie Dupont', 'Jean Martin', 'Sophie Bernard'],
      feedbackCount: 2,
      feedbackDeadline: '2025-09-18T14:00:00'
    }
  ];

  const members = [
    { id: 1, name: 'Marie Dupont', role: 'Secrétaire', email: 'marie.dupont@rccem.fr' },
    { id: 2, name: 'Jean Martin', role: 'Trésorier', email: 'jean.martin@rccem.fr' },
    { id: 3, name: 'Sophie Bernard', role: 'Membre titulaire', email: 'sophie.bernard@rccem.fr' },
    { id: 4, name: 'Luc Petit', role: 'Membre suppléant', email: 'luc.petit@rccem.fr' }
  ];

  // Remontées du personnel
  const [feedbacks, setFeedbacks] = useState([
    {
      id: 1,
      meetingId: 1,
      submittedBy: 'Marie Dupont',
      submittedAt: '2025-11-01T10:30:00',
      subject: 'Demande d\'amélioration des vestiaires',
      description: 'Plusieurs salariés se plaignent de l\'état des vestiaires. Il serait nécessaire de prévoir une rénovation.',
      category: 'Conditions de travail',
      status: 'En attente'
    },
    {
      id: 2,
      meetingId: 1,
      submittedBy: 'Jean Martin',
      submittedAt: '2025-11-02T14:15:00',
      subject: 'Question sur les horaires d\'été',
      description: 'Des salariés aimeraient savoir si les horaires d\'été seront reconduits l\'année prochaine.',
      category: 'Organisation du travail',
      status: 'En attente'
    },
    {
      id: 3,
      meetingId: 1,
      submittedBy: 'Sophie Bernard',
      submittedAt: '2025-11-02T16:45:00',
      subject: 'Formation sécurité',
      description: 'Demande de formation complémentaire sur les nouveaux équipements de sécurité.',
      category: 'Santé et sécurité',
      status: 'En attente'
    }
  ]);

  // Composant Dashboard
  const Dashboard = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Tableau de bord CSE</h2>
        <button 
          onClick={() => setShowNewMeetingModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          Nouvelle réunion
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Prochaine réunion</p>
              <p className="text-2xl font-bold text-gray-800">5 Nov</p>
            </div>
            <Calendar className="text-blue-500" size={40} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">CR en attente</p>
              <p className="text-2xl font-bold text-gray-800">1</p>
            </div>
            <FileText className="text-green-500" size={40} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Membres CSE</p>
              <p className="text-2xl font-bold text-gray-800">{members.length}</p>
            </div>
            <Users className="text-purple-500" size={40} />
          </div>
        </div>
      </div>

      {/* Liste des réunions */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Réunions</h3>
        </div>
        <div className="divide-y">
          {meetings.map(meeting => (
            <div key={meeting.id} className="p-6 hover:bg-gray-50 transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-800">{meeting.type}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      meeting.status === 'À venir' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {meeting.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar size={16} />
                      {new Date(meeting.date).toLocaleDateString('fr-FR', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })} à {meeting.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={16} />
                      {meeting.attendees.length} participants
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare size={16} />
                      {meeting.feedbackCount} remontée{meeting.feedbackCount > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="mt-2 flex gap-4 text-sm">
                    <span className={`flex items-center gap-1 ${
                      meeting.convocationSent ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {meeting.convocationSent ? <CheckCircle size={16} /> : <Mail size={16} />}
                      Convocation {meeting.convocationSent ? 'envoyée' : 'à envoyer'}
                    </span>
                    <span className={`flex items-center gap-1 ${
                      meeting.crStatus === 'Signé' ? 'text-green-600' : 
                      meeting.crStatus === 'En attente' ? 'text-orange-600' : 'text-gray-600'
                    }`}>
                      <FileText size={16} />
                      CR: {meeting.crStatus}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setSelectedMeeting(meeting);
                      setActiveTab('remontees');
                    }}
                    className="px-3 py-2 text-sm bg-purple-50 text-purple-600 rounded hover:bg-purple-100 transition flex items-center gap-1"
                  >
                    <MessageSquare size={16} />
                    Remontées ({meeting.feedbackCount})
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedMeeting(meeting);
                      setActiveTab('convocation');
                    }}
                    className="px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition"
                  >
                    Convocation
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedMeeting(meeting);
                      setActiveTab('cr');
                    }}
                    className="px-3 py-2 text-sm bg-green-50 text-green-600 rounded hover:bg-green-100 transition"
                  >
                    Compte-rendu
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Composant Convocation
  const Convocation = () => {
    const meeting = selectedMeeting || meetings[0];
    const [orderItems, setOrderItems] = useState([
      'Approbation du procès-verbal de la réunion précédente',
      'Informations de la direction',
      'Questions diverses'
    ]);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Convocation</h2>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Retour
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Informations de la réunion */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Informations de la réunion</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input 
                  type="date" 
                  defaultValue={meeting.date}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Heure</label>
                <input 
                  type="time" 
                  defaultValue={meeting.time}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lieu</label>
                <input 
                  type="text" 
                  defaultValue="Salle de réunion - RCCEM Montataire"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type de réunion</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Réunion ordinaire</option>
                  <option>Réunion extraordinaire</option>
                </select>
              </div>
            </div>
          </div>

          {/* Ordre du jour */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Ordre du jour</h3>
            <div className="space-y-2">
              {orderItems.map((item, index) => (
                <div key={index} className="flex items-center gap-2 bg-gray-50 p-3 rounded">
                  <span className="text-gray-600 font-medium">{index + 1}.</span>
                  <input 
                    type="text" 
                    value={item}
                    onChange={(e) => {
                      const newItems = [...orderItems];
                      newItems[index] = e.target.value;
                      setOrderItems(newItems);
                    }}
                    className="flex-1 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              ))}
              <button 
                onClick={() => setOrderItems([...orderItems, ''])}
                className="text-blue-600 text-sm hover:text-blue-700 flex items-center gap-1"
              >
                <Plus size={16} />
                Ajouter un point
              </button>
            </div>
          </div>

          {/* Participants */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Participants convoqués</h3>
            <div className="space-y-2">
              {members.map(member => (
                <div key={member.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{member.name}</p>
                    <p className="text-sm text-gray-600">{member.role} - {member.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition font-medium">
              <Eye size={20} />
              Prévisualiser le PDF
            </button>
            <button className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 transition font-medium">
              <Send size={20} />
              Générer et envoyer
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Composant Remontées du personnel
  const Remontees = () => {
    const meeting = selectedMeeting || meetings[0];
    const [showNewFeedback, setShowNewFeedback] = useState(false);
    const [newFeedback, setNewFeedback] = useState({
      subject: '',
      description: '',
      category: 'Conditions de travail'
    });
    
    const meetingFeedbacks = feedbacks.filter(f => f.meetingId === meeting.id);
    const now = new Date();
    const deadline = new Date(meeting.feedbackDeadline);
    const canSubmit = now < deadline;
    const hoursRemaining = Math.max(0, Math.floor((deadline - now) / (1000 * 60 * 60)));

    const handleSubmitFeedback = () => {
      const feedback = {
        id: feedbacks.length + 1,
        meetingId: meeting.id,
        submittedBy: 'Marie Dupont', // À remplacer par l'utilisateur connecté
        submittedAt: new Date().toISOString(),
        ...newFeedback,
        status: 'En attente'
      };
      setFeedbacks([...feedbacks, feedback]);
      setNewFeedback({ subject: '', description: '', category: 'Conditions de travail' });
      setShowNewFeedback(false);
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Remontées du personnel</h2>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Retour
          </button>
        </div>

        {/* Informations sur la réunion et deadline */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{meeting.type}</h3>
              <p className="text-gray-600 mt-1">
                {new Date(meeting.date).toLocaleDateString('fr-FR', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })} à {meeting.time}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-lg ${
              canSubmit ? 'bg-green-50' : 'bg-red-50'
            }`}>
              {canSubmit ? (
                <div className="text-center">
                  <p className="text-sm font-medium text-green-800">Dépôt ouvert</p>
                  <p className="text-xs text-green-600 mt-1">
                    {hoursRemaining}h restantes
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm font-medium text-red-800">Dépôt clôturé</p>
                  <p className="text-xs text-red-600 mt-1">Délai expiré</p>
                </div>
              )}
            </div>
          </div>

          {canSubmit && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Délai de remontée : 48h avant la réunion</p>
                <p className="mt-1">Les remontées du personnel doivent être déposées au plus tard le {new Date(meeting.feedbackDeadline).toLocaleDateString('fr-FR')} à {new Date(meeting.feedbackDeadline).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}.</p>
              </div>
            </div>
          )}
        </div>

        {/* Bouton nouvelle remontée */}
        {canSubmit && !showNewFeedback && (
          <button 
            onClick={() => setShowNewFeedback(true)}
            className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-purple-700 transition font-medium"
          >
            <Plus size={20} />
            Nouvelle remontée du personnel
          </button>
        )}

        {/* Formulaire nouvelle remontée */}
        {showNewFeedback && (
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Nouvelle remontée</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
              <select 
                value={newFeedback.category}
                onChange={(e) => setNewFeedback({...newFeedback, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option>Conditions de travail</option>
                <option>Organisation du travail</option>
                <option>Santé et sécurité</option>
                <option>Formation</option>
                <option>Rémunération</option>
                <option>Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sujet</label>
              <input 
                type="text"
                value={newFeedback.subject}
                onChange={(e) => setNewFeedback({...newFeedback, subject: e.target.value})}
                placeholder="Ex: Demande d'amélioration des vestiaires"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description détaillée</label>
              <textarea 
                value={newFeedback.description}
                onChange={(e) => setNewFeedback({...newFeedback, description: e.target.value})}
                rows={4}
                placeholder="Décrivez la remontée du personnel en détail..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowNewFeedback(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button 
                onClick={handleSubmitFeedback}
                disabled={!newFeedback.subject || !newFeedback.description}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Soumettre la remontée
              </button>
            </div>
          </div>
        )}

        {/* Liste des remontées */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Remontées déposées ({meetingFeedbacks.length})
          </h3>
          
          {meetingFeedbacks.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
              <MessageSquare size={48} className="mx-auto mb-3 text-gray-300" />
              <p>Aucune remontée pour cette réunion</p>
            </div>
          ) : (
            meetingFeedbacks.map(feedback => (
              <div key={feedback.id} className="bg-white rounded-lg shadow-md p-6 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                        {feedback.category}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                        {feedback.status}
                      </span>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">{feedback.subject}</h4>
                    <p className="text-gray-600 text-sm mb-3">{feedback.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Déposé par {feedback.submittedBy}</span>
                      <span>•</span>
                      <span>{new Date(feedback.submittedAt).toLocaleDateString('fr-FR')} à {new Date(feedback.submittedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  <button className="text-red-500 hover:text-red-700 p-2">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // Composant Compte-rendu
  const CompteRendu = () => {
    const meeting = selectedMeeting || meetings[0];
    
    // Points de l'ordre du jour (récupérés depuis la convocation)
    const [agendaPoints] = useState([
      { id: 1, title: 'Approbation du procès-verbal de la réunion précédente', fromAgenda: true },
      { id: 2, title: 'Informations de la direction', fromAgenda: true },
      { id: 3, title: 'Questions diverses', fromAgenda: true }
    ]);
    
    // Structure des points du CR avec échanges, débats, décisions
    const [crPoints, setCrPoints] = useState([
      {
        id: 1,
        title: 'Approbation du procès-verbal de la réunion précédente',
        fromAgenda: true,
        exchanges: 'Lecture du procès-verbal de la réunion du 15 septembre 2025.',
        debates: '',
        decisions: 'Le procès-verbal est approuvé à l\'unanimité.'
      },
      {
        id: 2,
        title: 'Informations de la direction',
        fromAgenda: true,
        exchanges: 'La direction présente les résultats du trimestre et annonce l\'arrivée de deux nouveaux collaborateurs.',
        debates: 'Discussion sur l\'organisation de l\'intégration des nouveaux collaborateurs.',
        decisions: 'Un parcours d\'intégration sera mis en place sur 2 semaines.'
      },
      {
        id: 3,
        title: 'Questions diverses',
        fromAgenda: true,
        exchanges: '',
        debates: '',
        decisions: ''
      }
    ]);

    const [signatures, setSignatures] = useState([
      { name: 'Marie Dupont', role: 'Secrétaire', signed: true, date: '2025-10-16' },
      { name: 'Jean Martin', role: 'Trésorier', signed: true, date: '2025-10-16' },
      { name: 'Sophie Bernard', role: 'Membre', signed: false, date: null },
      { name: 'Luc Petit', role: 'Membre', signed: true, date: '2025-10-17' }
    ]);

    const addFreePoint = () => {
      const newPoint = {
        id: Date.now(),
        title: '',
        fromAgenda: false,
        exchanges: '',
        debates: '',
        decisions: ''
      };
      setCrPoints([...crPoints, newPoint]);
    };

    const updatePoint = (id, field, value) => {
      setCrPoints(crPoints.map(point => 
        point.id === id ? { ...point, [field]: value } : point
      ));
    };

    const removePoint = (id) => {
      setCrPoints(crPoints.filter(point => point.id !== id));
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Compte-rendu de réunion</h2>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Retour
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* En-tête */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold text-gray-800">{meeting.type}</h3>
            <p className="text-gray-600">
              {new Date(meeting.date).toLocaleDateString('fr-FR', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })} à {meeting.time}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Présents : {meeting.attendees.join(', ')}
            </p>
          </div>

          {/* Points du compte-rendu */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-800">Points abordés</h4>
              <button 
                onClick={addFreePoint}
                className="text-blue-600 text-sm hover:text-blue-700 flex items-center gap-1"
              >
                <Plus size={16} />
                Ajouter un point libre
              </button>
            </div>

            {crPoints.map((point, index) => (
              <div key={point.id} className="border border-gray-200 rounded-lg p-5 space-y-4 bg-gray-50">
                {/* Titre du point */}
                <div className="flex items-start gap-3">
                  <span className="font-bold text-gray-700 text-lg mt-1">{index + 1}.</span>
                  <div className="flex-1">
                    {point.fromAgenda ? (
                      <div className="flex items-center gap-2">
                        <h5 className="font-semibold text-gray-800 text-lg">{point.title}</h5>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">Ordre du jour</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input 
                          type="text"
                          value={point.title}
                          onChange={(e) => updatePoint(point.id, 'title', e.target.value)}
                          placeholder="Titre du point libre"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-semibold"
                        />
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Point libre</span>
                      </div>
                    )}
                  </div>
                  {!point.fromAgenda && (
                    <button 
                      onClick={() => removePoint(point.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                {/* Échanges */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📢 Échanges et exposé
                  </label>
                  <textarea 
                    value={point.exchanges}
                    onChange={(e) => updatePoint(point.id, 'exchanges', e.target.value)}
                    className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Décrivez les échanges et informations partagées..."
                  />
                </div>

                {/* Débats */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    💬 Débats et discussions
                  </label>
                  <textarea 
                    value={point.debates}
                    onChange={(e) => updatePoint(point.id, 'debates', e.target.value)}
                    className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Résumez les débats et points de vue exprimés..."
                  />
                </div>

                {/* Décisions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ✅ Décisions et conclusions
                  </label>
                  <textarea 
                    value={point.decisions}
                    onChange={(e) => updatePoint(point.id, 'decisions', e.target.value)}
                    className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Indiquez les décisions prises et actions à mener..."
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Clôture */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Clôture de la séance</label>
            <textarea 
              className="w-full h-16 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="Ex: La séance est levée à 15h30. Prochaine réunion prévue le..."
              defaultValue="La séance est levée à 15h30."
            />
          </div>

          {/* Signatures */}
          <div className="border-t pt-6">
            <h4 className="font-semibold text-gray-800 mb-4">Signatures électroniques</h4>
            <div className="space-y-3">
              {signatures.map((sig, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{sig.name}</p>
                    <p className="text-sm text-gray-600">{sig.role}</p>
                  </div>
                  {sig.signed ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle size={20} />
                      <span className="text-sm">Signé le {sig.date}</span>
                    </div>
                  ) : (
                    <span className="text-orange-600 text-sm">En attente</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-300 transition font-medium">
              <Download size={20} />
              Télécharger PDF
            </button>
            <button className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition font-medium">
              <Edit size={20} />
              Enregistrer les modifications
            </button>
            <button className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 transition font-medium">
              <Send size={20} />
              Envoyer pour signature
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Composant Membres
  const Membres = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Membres du CSE</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
          <Plus size={20} />
          Ajouter un membre
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Nom</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Rôle</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Email</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {members.map(member => (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-800">{member.name}</td>
                <td className="px-6 py-4 text-gray-600">{member.role}</td>
                <td className="px-6 py-4 text-gray-600">{member.email}</td>
                <td className="px-6 py-4">
                  <button className="text-blue-600 hover:text-blue-700 text-sm">Modifier</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Modal nouvelle réunion
  const NewMeetingModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">Nouvelle réunion</h3>
          <button 
            onClick={() => setShowNewMeetingModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Heure</label>
            <input type="time" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
            <option>Réunion ordinaire</option>
            <option>Réunion extraordinaire</option>
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <button 
            onClick={() => setShowNewMeetingModal(false)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Annuler
          </button>
          <button 
            onClick={() => {
              setShowNewMeetingModal(false);
              setActiveTab('convocation');
            }}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Créer la réunion
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <Users size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CSE RCCEM-Montataire</h1>
                <p className="text-sm text-gray-500">Gestion des réunions et comptes-rendus</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Admin CSE</span>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                A
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                activeTab === 'dashboard'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tableau de bord
            </button>
            <button
              onClick={() => setActiveTab('convocation')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                activeTab === 'convocation'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Convocations
            </button>
            <button
              onClick={() => setActiveTab('remontees')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                activeTab === 'remontees'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Remontées personnel
            </button>
            <button
              onClick={() => setActiveTab('cr')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                activeTab === 'cr'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Comptes-rendus
            </button>
            <button
              onClick={() => setActiveTab('membres')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                activeTab === 'membres'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Membres
            </button>
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'convocation' && <Convocation />}
        {activeTab === 'remontees' && <Remontees />}
        {activeTab === 'cr' && <CompteRendu />}
        {activeTab === 'membres' && <Membres />}
      </main>

      {/* Modal */}
      {showNewMeetingModal && <NewMeetingModal />}
    </div>
  );
}