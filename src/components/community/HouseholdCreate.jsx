import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { MapPin, Upload, User, Users, Plus, X, Phone, Mail, Shield, Wifi, CheckCircle, AlertTriangle, Settings, Trash2 } from 'lucide-react';
import PropTypes from 'prop-types';

const HouseholdCreate = ({ onCreate }) => {
  const [step, setStep] = useState(1);
  const [householdData, setHouseholdData] = useState({
    name: '',
    address: '',
    image: null,
    coordinates: null,
    noFormalAddress: false,
    householdType: 'freestanding', // freestanding, flat_single, flat_complex, cluster, farm, compound, other
    scope: 'my_dwelling', // dynamic by type
    description: '',
    dwellings: 1,
    families: 1,
    units: [{ id: 1, type: 'main', members: 1, description: '' }],
    members: [],
    connectionPreferences: {
      primary: 'wifi_bluetooth', // wifi_bluetooth, wifi_only, bluetooth_only, internet_permanent, internet_periodic
      internetSync: 'weekly', // hourly, daily, weekly, monthly
      guestAccess: 'wifi_bluetooth' // wifi_bluetooth, wifi_only, bluetooth_only, none
    },
    guests: []
  });
  const [errors, setErrors] = useState({});
  const [gettingLocation, setGettingLocation] = useState(false);
  const [validatingAddress, setValidatingAddress] = useState(false);
  const [deviceContacts, setDeviceContacts] = useState([]);
  const [showContactImport, setShowContactImport] = useState(false);
  const [importMethod, setImportMethod] = useState(''); // 'device', 'csv', 'vcf', 'json', 'paste', 'manual'
  const [pastedJson, setPastedJson] = useState('');
  const [jsonConversionResult, setJsonConversionResult] = useState(null);
  const [manualContact, setManualContact] = useState({
    name: '',
    phone: '',
    email: '',
    relationship: 'family',
    role: 'family',
    roleCustom: '',
    unit: 1,
    customFields: []
  });
  const contactsSupported = typeof navigator !== 'undefined' && !!(navigator.contacts && navigator.contacts.select);

  const onDrop = useCallback(acceptedFiles => {
    const file = acceptedFiles[0];
    if (file) {
        setHouseholdData(prev => ({...prev, image: Object.assign(file, { preview: URL.createObjectURL(file) })}));
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: {'image/*': []}, maxFiles: 1 });

  const removeImage = () => {
      if(householdData.image) {
          URL.revokeObjectURL(householdData.image.preview);
          setHouseholdData(prev => ({...prev, image: null}));
      }
  };

  // Validation functions
  const validatePhoneNumber = (phone) => {
    if (!phone.trim()) return true; // Optional field
    // South African phone number validation
    const saPhoneRegex = /^(\+27|27|0)[6-8][0-9]{8}$/;
    // International format validation
    const intlPhoneRegex = /^\+[1-9]\d{1,14}$/;
    return saPhoneRegex.test(phone.replace(/\s+/g, '')) || intlPhoneRegex.test(phone.replace(/\s+/g, ''));
  };

  const validateEmail = (email) => {
    if (!email.trim()) return true; // Optional field
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateAddress = async (address) => {
    if (householdData.noFormalAddress) {
      // If no formal address, coordinates are required, but skip address validation
      return { valid: !!householdData.coordinates, message: householdData.coordinates ? undefined : 'Please set GPS pin if no formal address' };
    }
    if (!address.trim()) return { valid: false, message: 'Address is required' };

    setValidatingAddress(true);
    try {
      // Simulate geocoding API call
      // In real implementation, use Google Maps API or similar
      const mockGeocodeResult = {
        valid: address.length > 10,
        coordinates: address.length > 10 ? {
          lat: -26.2041 + (Math.random() - 0.5) * 0.1,
          lng: 28.0473 + (Math.random() - 0.5) * 0.1
        } : null
      };

      setValidatingAddress(false);
      return mockGeocodeResult;
    } catch (error) {
      setValidatingAddress(false);
      return { valid: false, message: 'Address validation failed' };
    }
  };

  const getCurrentLocation = () => {
    setGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setHouseholdData(prev => ({ ...prev, coordinates: coords }));
          setGettingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setGettingLocation(false);
          alert('Unable to get your location. Please enter address manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
      setGettingLocation(false);
    }
  };

  // Contact import functionality
  const requestContactsPermission = async () => {
    try {
      if (!contactsSupported) {
        alert('Device contacts picker is not supported on this device/browser.');
        return;
      }
      const props = ['name', 'tel', 'email'];
      const opts = { multiple: true };
      const selection = await navigator.contacts.select(props, opts);
      const picked = selection.map(c => ({
        name: Array.isArray(c.name) ? c.name[0] : c.name || '',
        phone: Array.isArray(c.tel) ? c.tel[0] : c.tel || '',
        email: Array.isArray(c.email) ? c.email[0] : c.email || ''
      }));
      setDeviceContacts(picked);
      setShowContactImport(true);
    } catch (error) {
      console.error('Contacts select failed:', error);
      alert('Unable to access device contacts. Please add members manually.');
    }
  };

  const importContact = (contact) => {
    const newMember = {
      id: Date.now(),
      name: contact.name,
      phone: contact.phone,
      email: contact.email,
      relationship: 'family',
      role: 'family',
      unit: 1,
      permissions: getDefaultPermissions('family'),
      customFields: {}
    };
    setHouseholdData(prev => ({
      ...prev,
      members: [...prev.members, newMember]
    }));
  };

  // Role-based permissions
  const getDefaultPermissions = (role) => {
    const basePermissions = {
      canCommunicate: true,
      canSendAlerts: false,
      canApproveEvents: false,
      canManageHousehold: false,
      canInviteGuests: false,
      communicationScope: 'unit' // unit, household, all
    };

    switch (role) {
      case 'father':
      case 'mother':
      case 'parent':
        return {
          ...basePermissions,
          canSendAlerts: true,
          canApproveEvents: true,
          canManageHousehold: true,
          canInviteGuests: true,
          communicationScope: 'household'
        };
      case 'grandparent':
        return {
          ...basePermissions,
          canSendAlerts: true,
          canApproveEvents: true,
          communicationScope: 'household'
        };
      case 'child':
        return {
          ...basePermissions,
          communicationScope: 'unit'
        };
      case 'tenant':
        return {
          ...basePermissions,
          communicationScope: 'unit'
        };
      case 'guest':
        return {
          ...basePermissions,
          canCommunicate: false,
          communicationScope: 'none'
        };
      default:
        return basePermissions;
    }
  };

  // Guest management
  const addGuest = () => {
    const newGuest = {
      id: Date.now(),
      name: '',
      phone: '',
      email: '',
      accessStart: new Date().toISOString().split('T')[0],
      accessEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days
      accessType: 'wifi_bluetooth', // wifi_bluetooth, wifi_only, bluetooth_only, none
      permissions: getDefaultPermissions('guest')
    };
    setHouseholdData(prev => ({
      ...prev,
      guests: [...prev.guests, newGuest]
    }));
  };

  const updateGuest = (guestId, field, value) => {
    setHouseholdData(prev => ({
      ...prev,
      guests: prev.guests.map(g => g.id === guestId ? { ...g, [field]: value } : g)
    }));
  };

  const removeGuest = (guestId) => {
    setHouseholdData(prev => ({
      ...prev,
      guests: prev.guests.filter(g => g.id !== guestId)
    }));
  };

  const addUnit = () => {
    const newUnit = {
      id: householdData.units.length + 1,
      type: 'rental',
      members: 1,
      description: ''
    };
    setHouseholdData(prev => ({
      ...prev,
      units: [...prev.units, newUnit],
      dwellings: prev.dwellings + 1
    }));
  };

  const removeUnit = (unitId) => {
    if (householdData.units.length > 1) {
      setHouseholdData(prev => ({
        ...prev,
        units: prev.units.filter(u => u.id !== unitId),
        dwellings: prev.dwellings - 1
      }));
    }
  };

  const updateUnit = (unitId, field, value) => {
    setHouseholdData(prev => ({
      ...prev,
      units: prev.units.map(u => u.id === unitId ? { ...u, [field]: value } : u)
    }));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target.result;
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

        const importedMembers = [];
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(',');
            const member = {};
            headers.forEach((header, index) => {
              member[header] = values[index]?.trim() || '';
            });
            if (member.name || member.firstname || member.lastname) {
              importedMembers.push({
                id: Date.now() + i,
                name: member.name || `${member.firstname || ''} ${member.lastname || ''}`.trim(),
                phone: member.phone || member.mobile || '',
                email: member.email || '',
                relationship: member.relationship || 'family',
                unit: 1,
                customFields: member
              });
            }
          }
        }

        setHouseholdData(prev => ({
          ...prev,
          members: [...prev.members, ...importedMembers]
        }));

        alert(`Imported ${importedMembers.length} contacts successfully!`);
      } catch (error) {
        alert('Error parsing CSV file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  const handleVcfUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const vcfText = e.target.result;
        const contacts = parseVcf(vcfText);
        const importedMembers = contacts.map((contact, index) => ({
          id: Date.now() + index,
          name: contact.name || '',
          phone: contact.phone || '',
          email: contact.email || '',
          relationship: 'family',
          unit: 1,
          customFields: contact
        }));

        setHouseholdData(prev => ({
          ...prev,
          members: [...prev.members, ...importedMembers]
        }));

        alert(`Imported ${importedMembers.length} contacts from VCF successfully!`);
      } catch (error) {
        alert('Error parsing VCF file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  const handleJsonUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        const contacts = Array.isArray(jsonData) ? jsonData : [jsonData];
        const importedMembers = contacts.map((contact, index) => ({
          id: Date.now() + index,
          name: contact.name || contact.fullName || contact.displayName || '',
          phone: contact.phone || contact.mobile || contact.phoneNumber || '',
          email: contact.email || contact.emailAddress || '',
          relationship: contact.relationship || 'family',
          unit: 1,
          customFields: contact
        }));

        setHouseholdData(prev => ({
          ...prev,
          members: [...prev.members, ...importedMembers]
        }));

        alert(`Imported ${importedMembers.length} contacts from JSON successfully!`);
      } catch (error) {
        alert('Error parsing JSON file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  const parseVcf = (vcfText) => {
    const contacts = [];
    const vcards = vcfText.split('BEGIN:VCARD');

    for (const vcard of vcards) {
      if (!vcard.includes('END:VCARD')) continue;

      const contact = {};
      const lines = vcard.split('\n');

      for (const line of lines) {
        if (line.startsWith('FN:') || line.startsWith('FN;')) {
          contact.name = line.split(':')[1]?.trim();
        } else if (line.startsWith('TEL') && !contact.phone) {
          const phoneMatch = line.match(/:(.*)/);
          if (phoneMatch) contact.phone = phoneMatch[1].trim();
        } else if (line.startsWith('EMAIL') && !contact.email) {
          const emailMatch = line.match(/:(.*)/);
          if (emailMatch) contact.email = emailMatch[1].trim();
        }
      }

      if (contact.name || contact.phone || contact.email) {
        contacts.push(contact);
      }
    }

    return contacts;
  };

  const convertJsonWithAI = async (jsonText) => {
    try {
      // Simulate AI conversion - in real implementation, this would call an AI service
      const data = JSON.parse(jsonText);

      // Simple conversion logic - map common fields
      const convertedContacts = [];

      if (Array.isArray(data)) {
        for (const item of data) {
          const contact = {
            name: item.name || item.full_name || item.display_name || item.first_name + ' ' + item.last_name || '',
            phone: item.phone || item.mobile || item.phone_number || item.cell || '',
            email: item.email || item.email_address || item.mail || '',
            relationship: item.relationship || item.relation || 'family'
          };
          if (contact.name || contact.phone || contact.email) {
            convertedContacts.push(contact);
          }
        }
      } else {
        // Single contact object
        const contact = {
          name: data.name || data.full_name || data.display_name || '',
          phone: data.phone || data.mobile || data.phone_number || '',
          email: data.email || data.email_address || '',
          relationship: data.relationship || 'family'
        };
        if (contact.name || contact.phone || contact.email) {
          convertedContacts.push(contact);
        }
      }

      setJsonConversionResult(convertedContacts);
      return convertedContacts;
    } catch (error) {
      alert('Error converting JSON. Please check the format.');
      return [];
    }
  };

  const importConvertedContacts = () => {
    if (!jsonConversionResult) return;

    const importedMembers = jsonConversionResult.map((contact, index) => ({
      id: Date.now() + index,
      name: contact.name || '',
      phone: contact.phone || '',
      email: contact.email || '',
      relationship: contact.relationship || 'family',
      unit: 1,
      customFields: contact
    }));

    setHouseholdData(prev => ({
      ...prev,
      members: [...prev.members, ...importedMembers]
    }));

    alert(`Imported ${importedMembers.length} contacts successfully!`);
    setPastedJson('');
    setJsonConversionResult(null);
    setImportMethod('');
  };

  const addCustomField = () => {
    setManualContact(prev => ({
      ...prev,
      customFields: [...prev.customFields, { key: '', value: '' }]
    }));
  };

  const updateCustomField = (index, field, value) => {
    setManualContact(prev => ({
      ...prev,
      customFields: prev.customFields.map((cf, i) =>
        i === index ? { ...cf, [field]: value } : cf
      )
    }));
  };

  const removeCustomField = (index) => {
    setManualContact(prev => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== index)
    }));
  };

  const saveManualContact = () => {
    if (!manualContact.name.trim()) {
      alert('Please enter a name for the contact');
      return;
    }

    const newMember = {
      id: Date.now(),
      name: manualContact.name,
      phone: manualContact.phone,
      email: manualContact.email,
      relationship: manualContact.relationship,
      role: manualContact.role,
      roleCustom: manualContact.roleCustom,
      unit: manualContact.unit,
      permissions: getDefaultPermissions(manualContact.role),
      customFields: manualContact.customFields.reduce((acc, cf) => {
        if (cf.key.trim()) {
          acc[cf.key.trim()] = cf.value;
        }
        return acc;
      }, {})
    };

    setHouseholdData(prev => ({
      ...prev,
      members: [...prev.members, newMember]
    }));

    // Reset form
    setManualContact({
      name: '',
      phone: '',
      email: '',
      relationship: 'family',
      role: 'family',
      roleCustom: '',
      unit: 1,
      customFields: []
    });

    alert('Contact added successfully!');
    setImportMethod('');
  };

  const addMember = () => {
    const newMember = {
      id: Date.now(),
      name: '',
      phone: '',
      email: '',
      relationship: 'family',
      role: 'family',
      roleCustom: '',
      unit: 1,
      permissions: getDefaultPermissions('family'),
      customFields: {}
    };
    setHouseholdData(prev => ({
      ...prev,
      members: [...prev.members, newMember]
    }));
  };

  const updateMember = (memberId, field, value) => {
    setHouseholdData(prev => ({
      ...prev,
      members: prev.members.map(m => {
        if (m.id === memberId) {
          const updated = { ...m, [field]: value };
          // Update permissions when role changes
          if (field === 'role') {
            updated.permissions = getDefaultPermissions(value);
          }
          return updated;
        }
        return m;
      })
    }));
  };

  const removeMember = (memberId) => {
    setHouseholdData(prev => ({
      ...prev,
      members: prev.members.filter(m => m.id !== memberId)
    }));
  };

  const validate = async () => {
    const newErrors = {};
    if (!householdData.name.trim()) newErrors.name = 'Household name is required';

    // Address validation
    if (!householdData.noFormalAddress) {
      if (!householdData.address.trim()) {
        newErrors.address = 'Address is required';
      } else {
        const addressValidation = await validateAddress(householdData.address);
        if (!addressValidation.valid) {
          newErrors.address = addressValidation.message || 'Invalid address format';
        } else if (!householdData.coordinates) {
          // Auto-set coordinates if address is valid
          setHouseholdData(prev => ({ ...prev, coordinates: addressValidation.coordinates }));
        }
      }
    } else {
      if (!householdData.coordinates) {
        newErrors.address = 'Please set GPS pin when no formal address is available';
      }
    }

    if (householdData.members.length === 0) newErrors.members = 'At least one member is required';

    // Validate members
    householdData.members.forEach((member, index) => {
      if (!member.name.trim()) {
        newErrors[`member_${member.id}_name`] = 'Member name is required';
      }
      if (member.phone && !validatePhoneNumber(member.phone)) {
        newErrors[`member_${member.id}_phone`] = 'Invalid phone number format';
      }
      if (member.email && !validateEmail(member.email)) {
        newErrors[`member_${member.id}_email`] = 'Invalid email format';
      }
    });

    // Validate guests
    householdData.guests.forEach((guest, index) => {
      if (!guest.name.trim()) {
        newErrors[`guest_${guest.id}_name`] = 'Guest name is required';
      }
      if (guest.phone && !validatePhoneNumber(guest.phone)) {
        newErrors[`guest_${guest.id}_phone`] = 'Invalid phone number format';
      }
      if (guest.email && !validateEmail(guest.email)) {
        newErrors[`guest_${guest.id}_email`] = 'Invalid email format';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!(await validate())) return;

    const id = 'h_' + Date.now();
    const household = {
      id,
      ...householdData,
      createdAt: Date.now()
    };

    onCreate(household);

    // Reset form
    setHouseholdData({
      name: '',
      address: '',
      coordinates: null,
      noFormalAddress: false,
      householdType: 'freestanding',
      scope: 'my_dwelling',
      description: '',
      dwellings: 1,
      families: 1,
      units: [{ id: 1, type: 'main', members: 1, description: '' }],
      members: [],
      connectionPreferences: {
        primary: 'wifi_bluetooth',
        internetSync: 'weekly',
        guestAccess: 'wifi_bluetooth'
      },
      guests: []
    });
    setStep(1);
    setErrors({});
  };

  const nextStep = async () => {
    if (step === 1) {
      if (!householdData.name.trim()) {
        setErrors({ name: 'Household name is required' });
        return;
      }
      if (!householdData.noFormalAddress) {
        if (!householdData.address.trim()) {
          setErrors({ address: 'Address is required' });
          return;
        }
        // Validate address
        const addressValidation = await validateAddress(householdData.address);
        if (!addressValidation.valid) {
          setErrors({ address: addressValidation.message || 'Invalid address' });
          return;
        }
        if (!householdData.coordinates) {
          setHouseholdData(prev => ({ ...prev, coordinates: addressValidation.coordinates }));
        }
      } else {
        if (!householdData.coordinates) {
          setErrors({ address: 'Please set GPS pin when no formal address is available' });
          return;
        }
      }
    }
    setErrors({});
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
           <h3 className="text-xl font-semibold">Create Household</h3>
           <div className="text-sm text-gray-500">Step {step} of 4</div>
         </div>
         <div className="flex space-x-2">
           {[1, 2, 3, 4].map((s) => (
             <div
               key={s}
               className={`flex-1 h-2 rounded ${s <= step ? 'bg-primary-500' : 'bg-gray-200'}`}
             />
           ))}
         </div>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Household Name</label>
            <input
              className={`w-full p-3 border rounded-lg ${errors.name ? 'border-red-500' : ''}`}
              placeholder="e.g., Smith Family Household"
              value={householdData.name}
              onChange={(e) => setHouseholdData(prev => ({ ...prev, name: e.target.value }))}
            />
            {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Household Image (Optional)</label>
            <div {...getRootProps()} className="p-6 border-2 border-dashed rounded-lg text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <input {...getInputProps()} />
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p>Drag & drop an image here, or click to select a file.</p>
            </div>
            {householdData.image && (
                <div className="mt-4 relative w-32">
                    <img src={householdData.image.preview} alt="preview" className="h-32 w-32 rounded-lg object-cover" />
                    <button onClick={removeImage} className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1">
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            )}
          </div>

          {/* Household Type and Scope */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Household Type</label>
              <select
                className="w-full p-3 border rounded-lg"
                value={householdData.householdType}
                onChange={(e) => {
                  const type = e.target.value;
                  // Reset scope to a sensible default when type changes
                  const defaultScopeByType = {
                    freestanding: 'my_dwelling',
                    flat_single: 'my_floor',
                    flat_complex: 'my_unit',
                    cluster: 'my_unit',
                    farm: 'my_dwelling',
                    compound: 'my_dwelling',
                    other: 'my_dwelling'
                  };
                  setHouseholdData(prev => ({ ...prev, householdType: type, scope: defaultScopeByType[type] || 'my_dwelling' }));
                }}
              >
                <option value="freestanding">Freestanding House</option>
                <option value="flat_single">Flat (Single Building)</option>
                <option value="flat_complex">Flat (Complex)</option>
                <option value="cluster">Cluster/Townhouse</option>
                <option value="farm">Farm/Smallholding</option>
                <option value="compound">Compound</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Scope</label>
              <select
                className="w-full p-3 border rounded-lg"
                value={householdData.scope}
                onChange={(e) => setHouseholdData(prev => ({ ...prev, scope: e.target.value }))}
              >
                {householdData.householdType === 'freestanding' && (
                  <>
                    <option value="my_dwelling">My dwelling/yard</option>
                    <option value="entire_property">Entire property</option>
                  </>
                )}
                {householdData.householdType === 'flat_single' && (
                  <>
                    <option value="my_floor">My floor</option>
                    <option value="entire_building">Entire building</option>
                    <option value="my_unit">My unit</option>
                  </>
                )}
                {householdData.householdType === 'flat_complex' && (
                  <>
                    <option value="my_unit">My unit</option>
                    <option value="my_block">My block</option>
                    <option value="entire_complex">Entire complex</option>
                  </>
                )}
                {householdData.householdType === 'cluster' && (
                  <>
                    <option value="my_unit">My unit</option>
                    <option value="entire_estate">Entire estate</option>
                  </>
                )}
                {householdData.householdType === 'farm' && (
                  <>
                    <option value="my_dwelling">My dwelling</option>
                    <option value="entire_farm">Entire farm/smallholding</option>
                  </>
                )}
                {householdData.householdType === 'compound' && (
                  <>
                    <option value="my_dwelling">My dwelling</option>
                    <option value="entire_compound">Entire compound</option>
                  </>
                )}
                {householdData.householdType === 'other' && (
                  <>
                    <option value="my_dwelling">My dwelling</option>
                    <option value="entire_property">Entire property</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <input
                  disabled={householdData.noFormalAddress}
                  className={`w-full p-3 border rounded-lg ${errors.address ? 'border-red-500' : householdData.coordinates ? 'border-green-500' : ''} ${householdData.noFormalAddress ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  placeholder={householdData.noFormalAddress ? 'No formal address (use GPS pin)' : 'Enter full address (will be validated and GPS paired)'}
                  value={householdData.address}
                  onChange={(e) => setHouseholdData(prev => ({ ...prev, address: e.target.value }))}
                />
                {validatingAddress && (
                  <div className="absolute right-3 top-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>
              <button
                onClick={getCurrentLocation}
                disabled={gettingLocation}
                className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
                title="Use current location"
              >
                {gettingLocation ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <MapPin className="h-5 w-5" />
                )}
              </button>
            </div>
            <div className="mt-2 flex items-center space-x-2">
              <input
                id="noFormalAddress"
                type="checkbox"
                className="mr-2"
                checked={householdData.noFormalAddress}
                onChange={(e) => setHouseholdData(prev => ({ ...prev, noFormalAddress: e.target.checked, address: e.target.checked ? '' : prev.address }))}
              />
              <label htmlFor="noFormalAddress" className="text-sm text-gray-700">No formal address (rural/informal). Use GPS pin instead.</label>
            </div>
            {householdData.coordinates && (
              <div className="text-sm text-green-600 mt-1 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                GPS coordinates paired: {householdData.coordinates.lat.toFixed(6)}, {householdData.coordinates.lng.toFixed(6)}
              </div>
            )}
            {errors.address && (
              <div className="text-sm text-red-600 mt-1 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1" />
                {errors.address}
              </div>
            )}
            <div className="text-xs text-gray-500 mt-1">
              Address will be validated and paired with GPS coordinates for emergency services
            </div>
            {householdData.coordinates && (
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    className="w-full p-2 border rounded"
                    value={householdData.coordinates.lat}
                    onChange={(e) => setHouseholdData(prev => ({ ...prev, coordinates: { ...prev.coordinates, lat: parseFloat(e.target.value) || 0 } }))}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    className="w-full p-2 border rounded"
                    value={householdData.coordinates.lng}
                    onChange={(e) => setHouseholdData(prev => ({ ...prev, coordinates: { ...prev.coordinates, lng: parseFloat(e.target.value) || 0 } }))}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    className="w-full p-2 bg-gray-100 border rounded hover:bg-gray-200"
                    title="Refine pin"
                    onClick={() => alert('Map pin refinement coming soon. For now, adjust lat/lng manually or use current location.')}
                  >
                    Refine pin (map)
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description (Optional)</label>
            <textarea
              className="w-full p-3 border rounded-lg"
              placeholder="Brief description of the household"
              value={householdData.description}
              onChange={(e) => setHouseholdData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex justify-end">
            <button onClick={nextStep} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              Next: Household Structure
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Number of Dwellings</label>
              <input
                type="number"
                min="1"
                className="w-full p-3 border rounded-lg"
                value={householdData.dwellings}
                onChange={(e) => setHouseholdData(prev => ({ ...prev, dwellings: parseInt(e.target.value) || 1 }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Number of Families</label>
              <input
                type="number"
                min="1"
                className="w-full p-3 border rounded-lg"
                value={householdData.families}
                onChange={(e) => setHouseholdData(prev => ({ ...prev, families: parseInt(e.target.value) || 1 }))}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">Units/Dwellings</label>
              <button onClick={addUnit} className="text-primary-600 hover:text-primary-700 text-sm flex items-center">
                <Plus className="h-4 w-4 mr-1" /> Add Unit
              </button>
            </div>
            <div className="space-y-3">
              {householdData.units.map((unit) => (
                <div key={unit.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium">Unit {unit.id}</span>
                    {householdData.units.length > 1 && (
                      <button onClick={() => removeUnit(unit.id)} className="text-red-500 hover:text-red-700">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      className="p-2 border rounded"
                      value={unit.type}
                      onChange={(e) => updateUnit(unit.id, 'type', e.target.value)}
                    >
                      <option value="main">Main House</option>
                      <option value="rental">Rental Unit</option>
                      <option value="guest">Guest House</option>
                      <option value="other">Other</option>
                    </select>
                    <input
                      type="number"
                      min="1"
                      placeholder="Members"
                      className="p-2 border rounded"
                      value={unit.members}
                      onChange={(e) => updateUnit(unit.id, 'members', parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <input
                    className="w-full mt-2 p-2 border rounded"
                    placeholder="Unit description (optional)"
                    value={unit.description}
                    onChange={(e) => updateUnit(unit.id, 'description', e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button onClick={prevStep} className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
              Back
            </button>
            <button onClick={nextStep} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              Next: Add Members
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium">Household Members</label>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setImportMethod('menu');
                  setShowContactImport(true);
                }}
                className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 flex items-center"
              >
                <User className="h-4 w-4 mr-1" /> Import Contacts
              </button>
              <button onClick={addMember} className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 flex items-center">
                <Plus className="h-4 w-4 mr-1" /> Add Member
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {householdData.members.map((member) => (
              <div key={member.id} className="p-3 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Member {householdData.members.indexOf(member) + 1}
                  </span>
                  <button onClick={() => removeMember(member.id)} className="text-red-500 hover:text-red-700">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <input
                      className={`p-2 border rounded w-full ${errors[`member_${member.id}_name`] ? 'border-red-500' : ''}`}
                      placeholder="Full Name"
                      value={member.name}
                      onChange={(e) => updateMember(member.id, 'name', e.target.value)}
                    />
                    {errors[`member_${member.id}_name`] && (
                      <div className="text-red-500 text-xs mt-1">{errors[`member_${member.id}_name`]}</div>
                    )}
                  </div>
                  <div>
                    <div className="relative">
                      <Phone className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        className={`pl-8 p-2 border rounded w-full ${errors[`member_${member.id}_phone`] ? 'border-red-500' : member.phone && validatePhoneNumber(member.phone) ? 'border-green-500' : ''}`}
                        placeholder="+27 XX XXX XXXX"
                        value={member.phone}
                        onChange={(e) => updateMember(member.id, 'phone', e.target.value)}
                      />
                    </div>
                    {errors[`member_${member.id}_phone`] && (
                      <div className="text-red-500 text-xs mt-1">{errors[`member_${member.id}_phone`]}</div>
                    )}
                  </div>
                  <div>
                    <div className="relative">
                      <Mail className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        className={`pl-8 p-2 border rounded w-full ${errors[`member_${member.id}_email`] ? 'border-red-500' : member.email && validateEmail(member.email) ? 'border-green-500' : ''}`}
                        placeholder="email@example.com"
                        value={member.email}
                        onChange={(e) => updateMember(member.id, 'email', e.target.value)}
                      />
                    </div>
                    {errors[`member_${member.id}_email`] && (
                      <div className="text-red-500 text-xs mt-1">{errors[`member_${member.id}_email`]}</div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      className="p-2 border rounded"
                      value={member.role}
                      onChange={(e) => updateMember(member.id, 'role', e.target.value)}
                    >
                      <optgroup label="Immediate family">
                        <option value="father">Father</option>
                        <option value="mother">Mother</option>
                        <option value="parent">Parent</option>
                        <option value="spouse">Spouse/Partner</option>
                        <option value="child">Child</option>
                        <option value="sister">Sister</option>
                        <option value="brother">Brother</option>
                      </optgroup>
                      <optgroup label="Extended family">
                        <option value="grandmother">Grandmother</option>
                        <option value="grandfather">Grandfather</option>
                        <option value="uncle">Uncle</option>
                        <option value="aunt">Aunt</option>
                        <option value="cousin">Cousin</option>
                        <option value="mother_in_law">Mother-in-law</option>
                        <option value="father_in_law">Father-in-law</option>
                        <option value="sister_in_law">Sister-in-law</option>
                        <option value="brother_in_law">Brother-in-law</option>
                      </optgroup>
                      <optgroup label="Other">
                        <option value="friend">Friend</option>
                        <option value="tenant">Tenant</option>
                        <option value="caregiver">Caregiver</option>
                        <option value="custom">Custom…</option>
                      </optgroup>
                    </select>
                    {member.role === 'custom' && (
                      <input
                        className="p-2 border rounded w-full"
                        placeholder="Describe relationship (e.g., godmother, cousin-in-law)"
                        value={member.roleCustom || ''}
                        onChange={(e) => updateMember(member.id, 'roleCustom', e.target.value)}
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Assign to Unit</label>
                    <select
                      className="p-2 border rounded w-full"
                      value={member.unit}
                      onChange={(e) => updateMember(member.id, 'unit', parseInt(e.target.value) || 1)}
                    >
                      {householdData.units.map(u => (
                        <option key={u.id} value={u.id}>
                          Unit {u.id} - {u.type} ({u.members} members)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Permissions for {member.role === 'custom' ? (member.roleCustom || 'custom') : member.role}:</div>
                    <div className="text-xs text-gray-600 flex items-center">
                      <Settings className="h-3 w-3 mr-1" />
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          className="mr-1"
                          checked={member.permissions.__customized || false}
                          onChange={(e) => updateMember(member.id, 'permissions', { ...member.permissions, __customized: e.target.checked })}
                        />
                        Customize
                      </label>
                    </div>
                  </div>
                  {!member.permissions.__customized ? (
                    <div className="grid grid-cols-2 gap-1 text-xs mt-1">
                      <div>Communicate: {member.permissions.canCommunicate ? '✓' : '✗'}</div>
                      <div>Send Alerts: {member.permissions.canSendAlerts ? '✓' : '✗'}</div>
                      <div>Approve Events: {member.permissions.canApproveEvents ? '✓' : '✗'}</div>
                      <div>Manage Household: {member.permissions.canManageHousehold ? '✓' : '✗'}</div>
                      <div className="col-span-2">Communication Scope: {member.permissions.communicationScope}</div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <label className="text-xs inline-flex items-center">
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={member.permissions.canCommunicate}
                          onChange={(e) => updateMember(member.id, 'permissions', { ...member.permissions, canCommunicate: e.target.checked })}
                        />
                        Can communicate
                      </label>
                      <label className="text-xs inline-flex items-center">
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={member.permissions.canSendAlerts}
                          onChange={(e) => updateMember(member.id, 'permissions', { ...member.permissions, canSendAlerts: e.target.checked })}
                        />
                        Can send alerts
                      </label>
                      <label className="text-xs inline-flex items-center">
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={member.permissions.canApproveEvents}
                          onChange={(e) => updateMember(member.id, 'permissions', { ...member.permissions, canApproveEvents: e.target.checked })}
                        />
                        Can approve events
                      </label>
                      <label className="text-xs inline-flex items-center">
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={member.permissions.canManageHousehold}
                          onChange={(e) => updateMember(member.id, 'permissions', { ...member.permissions, canManageHousehold: e.target.checked })}
                        />
                        Can manage household
                      </label>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Communication scope</label>
                        <select
                          className="p-2 border rounded w-full"
                          value={member.permissions.communicationScope}
                          onChange={(e) => updateMember(member.id, 'permissions', { ...member.permissions, communicationScope: e.target.value })}
                        >
                          <option value="unit">Unit</option>
                          <option value="household">Household</option>
                          <option value="all">All</option>
                          <option value="none">None</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {householdData.members.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No members added yet. Add members or import from CSV.</p>
            </div>
          )}

          {errors.members && <div className="text-red-500 text-sm">{errors.members}</div>}

          <div className="flex justify-between">
            <button onClick={prevStep} className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
              Back
            </button>
            <button onClick={nextStep} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              Next: Connection & Guests
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6">
          {/* Connection Preferences */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center text-blue-800 dark:text-blue-200">
              <Wifi className="h-5 w-5 mr-2" />
              Connection Preferences
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Primary Connection Method</label>
                <select
                  className="w-full p-3 border rounded-lg"
                  value={householdData.connectionPreferences.primary}
                  onChange={(e) => setHouseholdData(prev => ({
                    ...prev,
                    connectionPreferences: { ...prev.connectionPreferences, primary: e.target.value }
                  }))}
                >
                  <option value="wifi_bluetooth">Wi-Fi & Bluetooth (Recommended - Offline First)</option>
                  <option value="wifi_only">Wi-Fi Only</option>
                  <option value="bluetooth_only">Bluetooth Only</option>
                  <option value="internet_permanent">Internet Permanent</option>
                  <option value="internet_periodic">Internet Periodic Updates</option>
                </select>
                <div className="text-xs text-gray-600 mt-1">
                  Choose how household devices primarily connect. Offline methods are more secure and private.
                </div>
              </div>

              {householdData.connectionPreferences.primary.includes('internet') && (
                <div>
                  <label className="block text-sm font-medium mb-2">Internet Sync Frequency</label>
                  <select
                    className="w-full p-3 border rounded-lg"
                    value={householdData.connectionPreferences.internetSync}
                    onChange={(e) => setHouseholdData(prev => ({
                      ...prev,
                      connectionPreferences: { ...prev.connectionPreferences, internetSync: e.target.value }
                    }))}
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Guest Management */}
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold flex items-center text-green-800 dark:text-green-200">
                <Shield className="h-5 w-5 mr-2" />
                Guest Access Management
              </h4>
              <button onClick={addGuest} className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 flex items-center">
                <Plus className="h-4 w-4 mr-1" /> Add Guest
              </button>
            </div>

            <div className="space-y-3">
              {householdData.guests.map((guest) => (
                <div key={guest.id} className="p-3 border rounded-lg bg-white dark:bg-gray-800">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium">Guest: {guest.name || 'Unnamed'}</span>
                    <button onClick={() => removeGuest(guest.id)} className="text-red-500 hover:text-red-700">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input
                      className={`p-2 border rounded ${errors[`guest_${guest.id}_name`] ? 'border-red-500' : ''}`}
                      placeholder="Guest Name"
                      value={guest.name}
                      onChange={(e) => updateGuest(guest.id, 'name', e.target.value)}
                    />
                    <input
                      className="p-2 border rounded"
                      placeholder="Phone (optional)"
                      value={guest.phone}
                      onChange={(e) => updateGuest(guest.id, 'phone', e.target.value)}
                    />
                    <input
                      className="p-2 border rounded"
                      placeholder="Email (optional)"
                      value={guest.email}
                      onChange={(e) => updateGuest(guest.id, 'email', e.target.value)}
                    />
                    <select
                      className="p-2 border rounded"
                      value={guest.accessType}
                      onChange={(e) => updateGuest(guest.id, 'accessType', e.target.value)}
                    >
                      <option value="wifi_bluetooth">Wi-Fi & Bluetooth</option>
                      <option value="wifi_only">Wi-Fi Only</option>
                      <option value="bluetooth_only">Bluetooth Only</option>
                      <option value="none">No Access</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Access Start</label>
                      <input
                        type="date"
                        className="w-full p-2 border rounded text-sm"
                        value={guest.accessStart}
                        onChange={(e) => updateGuest(guest.id, 'accessStart', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Access End</label>
                      <input
                        type="date"
                        className="w-full p-2 border rounded text-sm"
                        value={guest.accessEnd}
                        onChange={(e) => updateGuest(guest.id, 'accessEnd', e.target.value)}
                      />
                    </div>
                  </div>
                  {errors[`guest_${guest.id}_name`] && (
                    <div className="text-red-500 text-xs mt-1">{errors[`guest_${guest.id}_name`]}</div>
                  )}
                </div>
              ))}

              {householdData.guests.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No guests configured. Guests can have temporary access with specific connection permissions.</p>
                </div>
              )}
            </div>
          </div>

          {/* Invitation/Public Link */}
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <h4 className="font-semibold mb-3">Invite family and neighbors</h4>
            <div className="text-sm text-gray-700 mb-2">Each member gets a shareable link to join and sync later. You can also broadcast a household link.</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {householdData.members.slice(0, 6).map((m) => {
                const shareId = `${m.id.toString(36)}-${(m.name||'').split(' ').join('-').toLowerCase()}`;
                const url = `${window.location.origin}/join/${shareId}`;
                return (
                  <div key={m.id} className="p-2 border rounded text-xs">
                    <div className="font-medium truncate">{m.name || 'Unnamed'} • <span className="text-gray-500">{m.role}</span></div>
                    <div className="truncate text-gray-600">{url}</div>
                    <div className="mt-1 flex space-x-2">
                      <button type="button" className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200" onClick={() => navigator.clipboard?.writeText(url)}>Copy</button>
                      <a className="px-2 py-1 bg-green-100 rounded hover:bg-green-200" href={`https://wa.me/?text=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer">WhatsApp</a>
                      <a className="px-2 py-1 bg-blue-100 rounded hover:bg-blue-200" href={`sms:?&body=${encodeURIComponent(url)}`}>SMS</a>
                      <a className="px-2 py-1 bg-indigo-100 rounded hover:bg-indigo-200" href={`mailto:?subject=Join our household&body=${encodeURIComponent(url)}`}>Email</a>
                    </div>
                  </div>
                );
              })}
            </div>
            {householdData.members.length > 6 && (
              <div className="text-xs text-gray-600 mt-2">Showing first 6 members. You can send others from Household Management later.</div>
            )}
          </div>

          <div className="flex justify-between">
            <button onClick={prevStep} className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
              Back
            </button>
            <button onClick={handleCreate} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              Create Household
            </button>
          </div>
        </div>
      )}

      {errors.general && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {errors.general}
        </div>
      )}

      {/* Enhanced Contact Import Modal */}
      {showContactImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Import Household Members</h3>
                <button
                  onClick={() => {
                    setShowContactImport(false);
                    setImportMethod('');
                    setPastedJson('');
                    setJsonConversionResult(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              {importMethod === '' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Device Contacts */}
                  {contactsSupported && (
                    <div className="p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 cursor-pointer"
                         onClick={() => {
                           setImportMethod('device');
                           requestContactsPermission();
                         }}>
                      <div className="text-center">
                        <Phone className="h-12 w-12 mx-auto text-purple-500 mb-2" />
                        <h4 className="font-medium text-purple-700">Pick from Phone</h4>
                        <p className="text-sm text-gray-600">Access your device contacts</p>
                      </div>
                    </div>
                  )}

                  {/* CSV Upload */}
                  <label className="p-4 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 cursor-pointer block">
                    <div className="text-center">
                      <Upload className="h-12 w-12 mx-auto text-green-500 mb-2" />
                      <h4 className="font-medium text-green-700">Upload CSV</h4>
                      <p className="text-sm text-gray-600">Import from spreadsheet</p>
                    </div>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => {
                        handleFileUpload(e);
                        setShowContactImport(false);
                      }}
                      className="hidden"
                    />
                  </label>

                  {/* VCF Upload */}
                  <label className="p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 cursor-pointer block">
                    <div className="text-center">
                      <Upload className="h-12 w-12 mx-auto text-blue-500 mb-2" />
                      <h4 className="font-medium text-blue-700">Upload VCF</h4>
                      <p className="text-sm text-gray-600">Import from vCard file</p>
                    </div>
                    <input
                      type="file"
                      accept=".vcf"
                      onChange={(e) => {
                        handleVcfUpload(e);
                        setShowContactImport(false);
                      }}
                      className="hidden"
                    />
                  </label>

                  {/* JSON Upload */}
                  <label className="p-4 border-2 border-dashed border-orange-300 rounded-lg hover:border-orange-500 cursor-pointer block">
                    <div className="text-center">
                      <Upload className="h-12 w-12 mx-auto text-orange-500 mb-2" />
                      <h4 className="font-medium text-orange-700">Upload JSON</h4>
                      <p className="text-sm text-gray-600">Import from JSON file</p>
                    </div>
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => {
                        handleJsonUpload(e);
                        setShowContactImport(false);
                      }}
                      className="hidden"
                    />
                  </label>

                  {/* Paste JSON */}
                  <div className="p-4 border-2 border-dashed border-red-300 rounded-lg hover:border-red-500 cursor-pointer md:col-span-2"
                       onClick={() => setImportMethod('paste')}> 
                    <div className="text-center">
                      <Settings className="h-12 w-12 mx-auto text-red-500 mb-2" />
                      <h4 className="font-medium text-red-700">Paste JSON (AI Convert)</h4>
                      <p className="text-sm text-gray-600">Paste any JSON format and let AI convert it</p>
                    </div>
                  </div>

                  {/* Manual Creation */}
                  <div className="p-4 border-2 border-dashed border-indigo-300 rounded-lg hover:border-indigo-500 cursor-pointer md:col-span-2"
                       onClick={() => setImportMethod('manual')}> 
                    <div className="text-center">
                      <Plus className="h-12 w-12 mx-auto text-indigo-500 mb-2" />
                      <h4 className="font-medium text-indigo-700">Create Manually</h4>
                      <p className="text-sm text-gray-600">Add contact details manually with custom fields</p>
                    </div>
                  </div>
                </div>
              )}

              {importMethod === 'device' && contactsSupported && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium">Select Contacts to Import</h4>
                    <button
                      onClick={() => setImportMethod('')}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      ← Back to options
                    </button>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {deviceContacts.map((contact) => (
                      <div key={contact.name} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{contact.name}</div>
                          <div className="text-sm text-gray-600">{contact.phone} • {contact.email}</div>
                        </div>
                        <button
                          onClick={() => {
                            importContact(contact);
                            // Remove from deviceContacts after import
                            setDeviceContacts(prev => prev.filter(c => c.name !== contact.name));
                          }}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Import
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setShowContactImport(false);
                        setImportMethod('');
                      }}
                      className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}

              {importMethod === 'paste' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium">Paste JSON (AI Conversion)</h4>
                    <button
                      onClick={() => setImportMethod('')}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      ← Back to options
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Paste your JSON data:</label>
                      <textarea
                        className="w-full h-48 p-3 border rounded-lg font-mono text-sm"
                        placeholder='[{"name": "John Doe", "phone": "+1234567890", "email": "john@example.com"}]'
                        value={pastedJson}
                        onChange={(e) => setPastedJson(e.target.value)}
                      />
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => convertJsonWithAI(pastedJson)}
                        disabled={!pastedJson.trim()}
                        className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        Convert with AI
                      </button>
                      <button
                        onClick={() => setImportMethod('')}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>

                    {jsonConversionResult && (
                      <div className="border rounded-lg p-4 bg-green-50">
                        <h5 className="font-medium text-green-800 mb-2">Conversion Result:</h5>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {jsonConversionResult.map((contact, index) => (
                            <div key={index} className="text-sm bg-white p-2 rounded border">
                              <strong>{contact.name}</strong> • {contact.phone} • {contact.email}
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 flex space-x-2">
                          <button
                            onClick={importConvertedContacts}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            Import {jsonConversionResult.length} Contacts
                          </button>
                          <button
                            onClick={() => setJsonConversionResult(null)}
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {importMethod === 'manual' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium">Create Contact Manually</h4>
                    <button
                      onClick={() => setImportMethod('')}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      ← Back to options
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Basic Information */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Full Name *</label>
                      <input
                        type="text"
                        className="w-full p-3 border rounded-lg"
                        placeholder="Enter full name"
                        value={manualContact.name}
                        onChange={(e) => setManualContact(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Phone Number</label>
                      <input
                        type="tel"
                        className="w-full p-3 border rounded-lg"
                        placeholder="+27 XX XXX XXXX"
                        value={manualContact.phone}
                        onChange={(e) => setManualContact(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Email Address</label>
                      <input
                        type="email"
                        className="w-full p-3 border rounded-lg"
                        placeholder="email@example.com"
                        value={manualContact.email}
                        onChange={(e) => setManualContact(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Relationship</label>
                      <select
                        className="w-full p-3 border rounded-lg"
                        value={manualContact.relationship}
                        onChange={(e) => setManualContact(prev => ({ ...prev, relationship: e.target.value }))}
                      >
                        <option value="family">Family</option>
                        <option value="friend">Friend</option>
                        <option value="colleague">Colleague</option>
                        <option value="neighbor">Neighbor</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Role</label>
                      <select
                        className="w-full p-3 border rounded-lg"
                        value={manualContact.role}
                        onChange={(e) => setManualContact(prev => ({ ...prev, role: e.target.value }))}
                      >
                        <option value="father">Father</option>
                        <option value="mother">Mother</option>
                        <option value="son">Son</option>
                        <option value="daughter">Daughter</option>
                        <option value="brother">Brother</option>
                        <option value="sister">Sister</option>
                        <option value="grandfather">Grandfather</option>
                        <option value="grandmother">Grandmother</option>
                        <option value="uncle">Uncle</option>
                        <option value="aunt">Aunt</option>
                        <option value="cousin">Cousin</option>
                        <option value="in-law">In-law</option>
                        <option value="tenant">Tenant</option>
                        <option value="family">Other Family</option>
                        <option value="friend">Friend</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {manualContact.role === 'other' && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Custom Role</label>
                        <input
                          type="text"
                          className="w-full p-3 border rounded-lg"
                          placeholder="Specify the role"
                          value={manualContact.roleCustom}
                          onChange={(e) => setManualContact(prev => ({ ...prev, roleCustom: e.target.value }))}
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium mb-1">Unit</label>
                      <select
                        className="w-full p-3 border rounded-lg"
                        value={manualContact.unit}
                        onChange={(e) => setManualContact(prev => ({ ...prev, unit: parseInt(e.target.value) }))}
                      >
                        {householdData.units.map(unit => (
                          <option key={unit.id} value={unit.id}>
                            Unit {unit.id} - {unit.type} ({unit.members} members)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Custom Fields */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-md font-medium">Custom Fields</h5>
                      <button
                        onClick={addCustomField}
                        className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Field
                      </button>
                    </div>

                    <div className="space-y-2">
                      {manualContact.customFields.map((field, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            className="flex-1 p-2 border rounded"
                            placeholder="Field name (e.g., Occupation)"
                            value={field.key}
                            onChange={(e) => updateCustomField(index, 'key', e.target.value)}
                          />
                          <input
                            type="text"
                            className="flex-1 p-2 border rounded"
                            placeholder="Field value (e.g., Teacher)"
                            value={field.value}
                            onChange={(e) => updateCustomField(index, 'value', e.target.value)}
                          />
                          <button
                            onClick={() => removeCustomField(index)}
                            className="p-2 text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    <button
                      onClick={() => setImportMethod('')}
                      className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveManualContact}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Add Contact
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

HouseholdCreate.propTypes = {
  onCreate: PropTypes.func.isRequired,
};
export default HouseholdCreate;
