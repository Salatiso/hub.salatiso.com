/**
 * ContactsWidget Component - Real Data Integration (Phase 3)
 * Displays recent contacts and quick actions from Firestore
 */

import { Link } from 'react-router-dom';
import { Mail, ArrowRight, Plus, Loader, AlertCircle } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { useUserId } from '../../context/UserContext';
import { useContacts } from '../../hooks/useFirebaseData';

const ContactsWidget = () => {
  const userId = useUserId();
  const { data: recentContacts, loading, error } = useContacts(userId);

  if (error) {
    return (
      <WidgetCard icon={AlertCircle} title="Contacts">
        <div className="flex items-center justify-center h-40 text-red-600">
          <AlertCircle className="w-8 h-8 mr-2" />
          <p>{error}</p>
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard
      icon={Mail}
      title="Contacts"
      actions={[
        {
          label: 'Add Contact',
          icon: Plus,
          onClick: () => window.location.href = '/contacts',
        },
        {
          label: 'Import Contacts',
          icon: Mail,
          onClick: () => window.location.href = '/contacts/import',
        },
      ]}
    >
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="space-y-3">
          {/* Recent Contacts */}
          {recentContacts && recentContacts.length > 0 ? (
            <>
              {recentContacts.slice(0, 3).map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{contact.name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{contact.email}</p>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 dark:text-gray-400">No contacts yet</p>
            </div>
          )}

          {/* View All Button */}
          <Link
            to="/contacts"
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium mt-2"
          >
            <span>View All Contacts</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </WidgetCard>
  );
};

export default ContactsWidget;
