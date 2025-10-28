import { memo } from 'react';
import { Edit2, Trash2 } from 'lucide-react';

/**
 * FamilyMemberCard Component
 * Pure presentational component for displaying a family member
 * Memoized to prevent unnecessary re-renders in lists
 * 
 * @param {Object} member - Family member data
 * @param {string} member.id - Unique member ID
 * @param {string} member.name - Member name
 * @param {string} member.relationship - Relationship (optional)
 * @param {string} member.dateOfBirth - Birth date (optional)
 * @param {string} member.email - Email (optional)
 * @param {string} member.phone - Phone (optional)
 * @param {string} member.address - Address (optional)
 * @param {boolean} member.isEmergencyContact - Emergency contact flag
 * @param {Function} onEdit - Edit handler
 * @param {Function} onDelete - Delete handler
 */
function FamilyMemberCard({ member, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-blue-500">
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
          {member.name.charAt(0)}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(member)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            aria-label={`Edit: ${member.name}`}
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(member.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
            aria-label={`Delete: ${member.name}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <h3 className="text-lg font-bold">{member.name}</h3>
      <div className="flex gap-2 mt-2 flex-wrap">
        {member.relationship && (
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded capitalize">
            {member.relationship}
          </span>
        )}
        {member.isEmergencyContact && (
          <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
            🚨 Emergency
          </span>
        )}
      </div>
      <div className="mt-4 space-y-1 text-sm text-gray-600">
        {member.dateOfBirth && <p>🎂 Born: {member.dateOfBirth}</p>}
        {member.email && <p>📧 {member.email}</p>}
        {member.phone && <p>📱 {member.phone}</p>}
        {member.address && <p>📍 {member.address}</p>}
      </div>
    </div>
  );
}

export default memo(FamilyMemberCard);
