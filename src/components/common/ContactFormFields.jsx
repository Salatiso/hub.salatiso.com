import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { XCircle, Upload, Trash2 } from 'lucide-react';

const ContactFormFields = ({ profile, setProfile }) => {

  const handleFieldChange = (section, index, field, value) => {
    setProfile(p => {
      const sectionCopy = [...p[section]];
      sectionCopy[index] = { ...sectionCopy[index], [field]: value };
      return { ...p, [section]: sectionCopy };
    });
  };

  const addField = (section) => {
    setProfile(p => ({
      ...p,
      [section]: [...p[section], { id: Date.now(), value: '', label: '' }]
    }));
  };

  const removeField = (section, index) => {
    setProfile(p => ({
      ...p,
      [section]: p[section].filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = useCallback((files) => {
    const newImages = Array.from(files).slice(0, 5 - profile.images.length).map(file => {
      return Object.assign(file, {
        preview: URL.createObjectURL(file)
      });
    });
    setProfile(p => ({ ...p, images: [...p.images, ...newImages] }));
  }, [profile.images.length, setProfile]);

  const removeImage = (index) => {
    setProfile(p => {
      const imagesCopy = [...p.images];
      URL.revokeObjectURL(imagesCopy[index].preview);
      imagesCopy.splice(index, 1);
      return { ...p, images: imagesCopy };
    });
  };

  const onDrop = useCallback(acceptedFiles => {
    handleImageUpload(acceptedFiles);
  }, [handleImageUpload]);

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: {'image/*': []}, maxFiles: 5 });

  const nameFieldOptions = [
    { id: 'middleName', label: 'Middle Name' },
    { id: 'prefix', label: 'Prefix' },
    { id: 'suffix', label: 'Suffix' },
    { id: 'nickname', label: 'Nickname' },
    { id: 'phonetic', label: 'Phonetic Spelling' },
  ];

  const contactLabelOptions = ['Mobile', 'Work', 'Home', 'Main', 'Other'];

  return (
    <>
        {/* Image Upload */}
        <fieldset className="border p-4 rounded-lg mb-6">
            <legend className="font-semibold px-2">Profile Pictures</legend>
            <div {...getRootProps()} className="p-6 border-2 border-dashed rounded-lg text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <input {...getInputProps()} />
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p>Drag & drop up to 5 images here, or click to select files.</p>
            </div>
            <div className="mt-4 flex gap-4 flex-wrap">
                {profile.images.map((file, index) => (
                    <div key={index} className="relative">
                        <img src={file.preview} alt="preview" className="h-24 w-24 rounded-lg object-cover" />
                        <button onClick={() => removeImage(index)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1">
                            <Trash2 className="h-3 w-3" />
                        </button>
                    </div>
                ))}
            </div>
             <div className="mt-4 flex gap-2">
                <button disabled className="flex-1 p-3 border rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-700 opacity-50 cursor-not-allowed">
                    Import from Facebook
                </button>
                 <button disabled className="flex-1 p-3 border rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-700 opacity-50 cursor-not-allowed">
                    Import from Google
                </button>
            </div>
        </fieldset>

        {/* Name Fields */}
        <fieldset className="border p-4 rounded-lg mb-6">
            <legend className="font-semibold px-2">Name</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input value={profile.firstName} onChange={e => setProfile(p => ({...p, firstName: e.target.value}))} className="p-2 rounded border dark:bg-gray-700 dark:border-gray-600" placeholder="First Name (Required)" />
                <input value={profile.lastName} onChange={e => setProfile(p => ({...p, lastName: e.target.value}))} className="p-2 rounded border dark:bg-gray-700 dark:border-gray-600" placeholder="Last Name (Required)" />
            </div>
            <div className="space-y-2 mt-4">
                {profile.optionalNameFields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                        <span className="font-semibold w-32 text-sm">{nameFieldOptions.find(opt => opt.id === field.id)?.label}</span>
                        <input value={field.value} onChange={e => handleFieldChange('optionalNameFields', index, 'value', e.target.value)} className="flex-grow p-2 rounded border dark:bg-gray-700 dark:border-gray-600" />
                        <button onClick={() => removeField('optionalNameFields', index)}><XCircle className="text-red-500" /></button>
                    </div>
                ))}
            </div>
            <div className="dropdown mt-2">
                <button tabIndex={0} role="button" className="btn btn-sm">+ Add Name Field</button>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                    {nameFieldOptions.filter(opt => !profile.optionalNameFields.some(f => f.id === opt.id)).map(opt => (
                        <li key={opt.id}><a onClick={() => setProfile(p => ({...p, optionalNameFields: [...p.optionalNameFields, {id: opt.id, value: ''}]}))}>{opt.label}</a></li>
                    ))}
                </ul>
            </div>
        </fieldset>

        {/* Contact Fields */}
        <fieldset className="border p-4 rounded-lg mb-6">
            <legend className="font-semibold px-2">Contact</legend>
            {profile.phones.map((phone, index) => (
                <div key={phone.id} className="flex gap-2 items-center mb-2">
                    <input value={phone.number} onChange={e => handleFieldChange('phones', index, 'number', e.target.value)} type="tel" placeholder="Phone" className="flex-grow p-2 rounded border dark:bg-gray-700 dark:border-gray-600" />
                    <select value={phone.label} onChange={e => handleFieldChange('phones', index, 'label', e.target.value)} className="p-2 rounded border dark:bg-gray-700 dark:border-gray-600">
                        {contactLabelOptions.map(l => <option key={l} value={l}>{l}</option>)}
                        <option value="Custom">Custom</option>
                    </select>
                    {phone.label === 'Custom' && <input onChange={e => handleFieldChange('phones', index, 'customLabel', e.target.value)} placeholder="Custom Label" className="p-2 rounded border dark:bg-gray-700 dark:border-gray-600" />}
                    <button onClick={() => removeField('phones', index)}><XCircle className="text-red-500" /></button>
                </div>
            ))}
            <button onClick={() => addField('phones')} className="text-sm text-primary-600">+ Add phone</button>
            <hr className="my-4" />
            {profile.emails.map((email, index) => (
                 <div key={email.id} className="flex gap-2 items-center mb-2">
                    <input value={email.address} onChange={e => handleFieldChange('emails', index, 'address', e.target.value)} type="email" placeholder="Email" className="flex-grow p-2 rounded border dark:bg-gray-700 dark:border-gray-600" />
                    <select value={email.label} onChange={e => handleFieldChange('emails', index, 'label', e.target.value)} className="p-2 rounded border dark:bg-gray-700 dark:border-gray-600">
                        {contactLabelOptions.map(l => <option key={l} value={l}>{l}</option>)}
                        <option value="Custom">Custom</option>
                    </select>
                    {email.label === 'Custom' && <input onChange={e => handleFieldChange('emails', index, 'customLabel', e.target.value)} placeholder="Custom Label" className="p-2 rounded border dark:bg-gray-700 dark:border-gray-600" />}
                    <button onClick={() => removeField('emails', index)}><XCircle className="text-red-500" /></button>
                </div>
            ))}
            <button onClick={() => addField('emails')} className="text-sm text-primary-600">+ Add email</button>
        </fieldset>

        {/* Notes */}
        <fieldset className="border p-4 rounded-lg mb-6">
            <legend className="font-semibold px-2">Notes</legend>
            <textarea value={profile.notes} onChange={e => setProfile(p => ({...p, notes: e.target.value}))} className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600" rows="4" placeholder="Add any notes here..."></textarea>
        </fieldset>
    </>
  );
}

export default ContactFormFields;
