import { memo } from 'react';
import { Phone, Mail, MapPin, Edit2, Trash2 } from 'lucide-react';

/**
 * ContactCard Component
 * Displays a single contact in the contacts list
 * Memoized to prevent re-renders of unchanged contacts
 */
function ContactCard({ contact, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-xl font-bold">
            {contact.firstName} {contact.lastName}
          </h3>
          <div className="mt-2 space-y-1 text-gray-600">
            {contact.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a
                  href={`mailto:${contact.email}`}
                  className="hover:text-blue-600"
                >
                  {contact.email}
                </a>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <a href={`tel:${contact.phone}`} className="hover:text-blue-600">
                  {contact.phone}
                </a>
              </div>
            )}
            {contact.address && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {contact.address}
              </div>
            )}
          </div>
          {contact.notes && (
            <p className="mt-2 text-sm text-gray-500">{contact.notes}</p>
          )}
          <div className="mt-2">
            <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
              {contact.category}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(contact)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            aria-label={`Edit contact: ${contact.firstName} ${contact.lastName}`}
          >
            <Edit2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(contact.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            aria-label={`Delete contact: ${contact.firstName} ${contact.lastName}`}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(ContactCard);
