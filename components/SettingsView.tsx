
import React, { useState, useRef } from 'react';
import { ChevronRight, LogOut, CreditCard, Users, Mail, Globe, Car, Plus, Trash2, ChevronLeft, Save, Clock, Moon, Sun, AlertTriangle, Lock, AlertCircle, Phone, MapPin, Calendar, HelpCircle, FileText, Shield, Zap, CheckCircle, ArrowRight, Send, Star } from 'lucide-react';
import { Vehicle, UserProfile, PaymentMethod, Language, ChargingSession } from '../types';
import { CAR_COLORS, AVATAR_OPTIONS, TRANSLATIONS, LEGAL_TEXTS } from '../constants';
import { checkPasswordStrength, isValidEmail } from '../utils';

interface SettingsViewProps {
  onNavigate: (view: any) => void;
  onLogout: () => void;
  subView?: 'main' | 'vehicle_edit' | 'profile_edit' | 'payment' | 'language' | 'faq' | 'terms' | 'privacy' | 'host_apply' | 'onboarding' | 'history' | 'contact';
  vehicles: Vehicle[];
  onUpdateVehicles: (vehicles: Vehicle[]) => void;
  userProfile?: UserProfile;
  onUpdateProfile?: (profile: UserProfile) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  language: Language;
  onSetLanguage: (lang: Language) => void;
  paymentMethods: PaymentMethod[];
  onUpdatePaymentMethods: (methods: PaymentMethod[]) => void;
  isOnboarding?: boolean;
  chargingHistory?: ChargingSession[];
  onRateSession?: (sessionId: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ 
    onNavigate, 
    onLogout, 
    subView = 'main', 
    vehicles, 
    onUpdateVehicles, 
    userProfile, 
    onUpdateProfile, 
    theme, 
    onToggleTheme,
    language,
    onSetLanguage,
    paymentMethods,
    onUpdatePaymentMethods,
    isOnboarding = false,
    chargingHistory = [],
    onRateSession
}) => {
  const t = TRANSLATIONS[language]; 
  const legal = LEGAL_TEXTS[language];

  // Refs for license plate inputs
  const plateInput1Ref = useRef<HTMLInputElement>(null);
  const plateInput2Ref = useRef<HTMLInputElement>(null);
  const plateInput3Ref = useRef<HTMLInputElement>(null);

  const [editingVehicle, setEditingVehicle] = useState<Partial<Vehicle>>({});
  const [deletingVehicleId, setDeletingVehicleId] = useState<string | null>(null);
  
  const [editProfileData, setEditProfileData] = useState<Partial<UserProfile>>(userProfile || {});
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedOnboardingAvatar, setSelectedOnboardingAvatar] = useState(userProfile?.avatar || AVATAR_OPTIONS[0]);

  const [confirmEmail, setConfirmEmail] = useState('');
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [profileError, setProfileError] = useState<string | null>(null);

  const [newPaymentType, setNewPaymentType] = useState<'paypal' | 'credit_card'>('paypal');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const [hostData, setHostData] = useState({
      street: '',
      number: '',
      plz: '',
      city: '',
      power: 11,
      type: 'Typ 2',
      access: 'private'
  });
  const [hostSuccess, setHostSuccess] = useState(false);

  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);

  const passwordStrength = checkPasswordStrength(newPassword);

  const handleSaveVehicle = () => {
    if(editingVehicle.model) {
        onUpdateVehicles([...vehicles, { 
            ...editingVehicle, 
            id: Math.random().toString(36).substr(2, 9), 
            make: editingVehicle.make || '', 
            color: editingVehicle.color || CAR_COLORS[0] 
        } as Vehicle]);
    }
    
    if (isOnboarding) {
        onNavigate('map');
    } else {
        onNavigate('settings');
    }
  };

  const handleOnboardingAvatarNext = () => {
      if(onUpdateProfile && userProfile) {
          onUpdateProfile({
              ...userProfile,
              avatar: selectedOnboardingAvatar
          });
      }
      onNavigate('vehicle_edit_onboarding');
  };

  const handleSaveProfile = () => {
      setProfileError(null);

      if (!editProfileData.firstName || !editProfileData.lastName) {
          setProfileError(t.errorRequired);
          return;
      }

      if (editProfileData.email !== userProfile?.email) {
          if (!isValidEmail(editProfileData.email || '')) {
              setProfileError(t.errorEmail);
              return;
          }
          if (editProfileData.email !== confirmEmail) {
              setProfileError(t.errorEmail); // Reusing logic for match fail or email fail
              return;
          }
      }

      if (newPassword || currentPasswordInput) {
          if (!userProfile?.password) {
             setProfileError('Interner Fehler');
             return;
          }

          if (currentPasswordInput !== userProfile.password) {
              setProfileError(t.errorCredentials);
              return;
          }

          if (newPassword !== confirmNewPassword) {
              setProfileError(t.errorPasswordMatch);
              return;
          }

          if (passwordStrength.score < 4) {
              setProfileError(t.errorPasswordPolicy);
              return;
          }
          
          editProfileData.password = newPassword;
      }

      if (onUpdateProfile) {
          const finalProfile = {
              ...userProfile,
              ...editProfileData,
              password: newPassword ? newPassword : userProfile?.password
          };
          onUpdateProfile(finalProfile as UserProfile);
          onNavigate('settings');
      }
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => { e.stopPropagation(); setDeletingVehicleId(id); };
  const confirmDelete = () => { if (deletingVehicleId) { onUpdateVehicles(vehicles.filter(v => v.id !== deletingVehicleId)); setDeletingVehicleId(null); }};
  
  const handleAddPaymentMethod = () => { 
      setPaymentError(null);
      let label = '';
      if (newPaymentType === 'paypal') { 
          if(!isValidEmail(paypalEmail)) { setPaymentError(t.errorEmail); return; }
          label = paypalEmail; 
      } else {
          if (!cardHolder || !cardNumber || !cardExpiry) { setPaymentError(t.errorRequired); return; }
          label = `Visa **** ${cardNumber.slice(-4)} (${cardHolder})`;
      }
      
      const newMethod: PaymentMethod = { 
          id: Math.random().toString(36).substr(2, 9), 
          type: newPaymentType, 
          label: label, 
          expiry: newPaymentType === 'credit_card' ? cardExpiry : undefined, 
          isDefault: paymentMethods.length === 0 
      };
      
      onUpdatePaymentMethods([...paymentMethods, newMethod]); 
      setIsAddingPayment(false); 
      setPaypalEmail(''); 
      setCardNumber(''); 
      setCardHolder(''); 
      setCardExpiry(''); 
      setPaymentError(null);
  };

  const setDefaultPaymentMethod = (id: string) => { onUpdatePaymentMethods(paymentMethods.map(p => ({ ...p, isDefault: p.id === id }))); };
  
  const handleDeletePaymentMethod = (id: string, e: React.MouseEvent) => {
       e.stopPropagation();
       onUpdatePaymentMethods(paymentMethods.filter(p => p.id !== id));
  }

  const handleHostSubmit = () => { 
      setHostSuccess(true); 
      setTimeout(() => { 
          onNavigate('settings'); 
          setHostSuccess(false); 
          setHostData({ street: '', number: '', plz: '', city: '', power: 11, type: 'Typ 2', access: 'private' }); 
      }, 2000); 
  };

  const handleContactSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setContactSent(true);
      setTimeout(() => {
          setContactSent(false);
          setContactSubject('');
          setContactMessage('');
          onNavigate('settings');
      }, 2000);
  };

  if (subView === 'onboarding') {
      return (
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-6 animate-fade-in relative overflow-hidden">
             <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-green-400/20 dark:bg-green-600/10 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
             <div className="max-w-md w-full relative z-10 text-center">
                 <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
                    Welcome, {userProfile?.firstName}!
                 </h1>
                 <p className="text-gray-500 dark:text-gray-400 mb-8">
                    Choose an avatar.
                 </p>
                 <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 mb-8">
                     <div className="w-24 h-24 mx-auto mb-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-5xl shadow-inner animate-float">
                        {selectedOnboardingAvatar}
                     </div>
                     <div className="grid grid-cols-5 gap-2 max-h-[30vh] overflow-y-auto no-scrollbar py-2">
                        {AVATAR_OPTIONS.map((avatar) => (
                            <button
                                key={avatar}
                                onClick={() => setSelectedOnboardingAvatar(avatar)}
                                className={`w-12 h-12 text-2xl flex items-center justify-center rounded-xl transition-all duration-200 ${
                                    selectedOnboardingAvatar === avatar 
                                    ? 'bg-green-500 text-white shadow-lg scale-110 rotate-3' 
                                    : 'bg-white dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-gray-600 hover:scale-105'
                                }`}
                            >
                                {avatar}
                            </button>
                        ))}
                     </div>
                 </div>
                 <button 
                    onClick={handleOnboardingAvatarNext}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-500/30 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
                >
                    <span>Next</span>
                    <ArrowRight size={20} />
                </button>
             </div>
          </div>
      );
  }

  if (subView === 'vehicle_edit') {
    const currentPlate = editingVehicle.plate || '';
    const numbersOnly = currentPlate.replace(/[^0-9]/g, '');
    const textPart = currentPlate.replace(/[0-9]/g, '');
    const parts = textPart.split(/[- ]+/).map(s => s.trim()).filter(Boolean);
    const p1 = parts[0] || '';
    const p2 = parts.length > 1 ? parts[1] : '';
    const plateParts = [p1, p2, numbersOnly];

    const handlePlatePartChange = (index: number, val: string) => {
        const hasNumber = /[0-9]/.test(val);
        let newP1 = plateParts[0]; let newP2 = plateParts[1]; let newP3 = plateParts[2];
        if (index === 0) {
             if (hasNumber) { const nums = val.replace(/[^0-9]/g, ''); newP1 = val.replace(/[^A-ZÖÄÜa-zöäü]/g, '').toUpperCase(); newP3 = newP3 + nums; plateInput3Ref.current?.focus(); } 
             else { newP1 = val.toUpperCase().replace(/[^A-ZÖÄÜ]/g, ''); if (newP1.length >= 3) plateInput2Ref.current?.focus(); }
        } else if (index === 1) {
             if (hasNumber) { const nums = val.replace(/[^0-9]/g, ''); newP2 = val.replace(/[^A-ZÖÄÜa-zöäü]/g, '').toUpperCase(); newP3 = newP3 + nums; plateInput3Ref.current?.focus(); } 
             else { newP2 = val.toUpperCase().replace(/[^A-ZÖÄÜ]/g, ''); if (newP2.length >= 2) plateInput3Ref.current?.focus(); }
        } else if (index === 2) { newP3 = val.replace(/[^0-9]/g, ''); }
        setEditingVehicle({ ...editingVehicle, plate: `${newP1}-${newP2} ${newP3}` });
    };

    const handleKeyDown = (e: React.KeyboardEvent, prevRef: React.RefObject<HTMLInputElement>) => {
        if (e.key === 'Backspace' && (e.currentTarget as HTMLInputElement).value === '') { e.preventDefault(); prevRef.current?.focus(); }
    };

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 pt-4 md:pt-4 animate-fade-in transition-colors duration-300">
        <div className="bg-white dark:bg-gray-800 p-4 flex items-center shadow-sm sticky top-0 z-10 md:hidden">
            {!isOnboarding && (
                <button onClick={() => onNavigate('settings')} className="mr-4 text-gray-700 dark:text-gray-200">
                    <ChevronLeft size={24} />
                </button>
            )}
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{isOnboarding ? t.addVehicle : t.myVehicles}</h1>
        </div>
        <div className="p-6 max-w-lg mx-auto space-y-6">
            <div className="flex justify-center py-4">
                <Car size={80} className="text-green-600" fill={editingVehicle.color || CAR_COLORS[0]} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.carColor}</label>
                <div className="flex flex-wrap gap-3">
                    {CAR_COLORS.map(c => (
                        <button 
                            key={c}
                            onClick={() => setEditingVehicle({...editingVehicle, color: c})}
                            className={`w-10 h-10 rounded-full transition-transform ${editingVehicle.color === c ? 'scale-110 ring-2 ring-offset-2 ring-gray-400' : ''}`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                </div>
            </div>
            <div className="space-y-4">
                 <div className="border border-green-500 rounded-lg p-1 bg-white dark:bg-gray-800">
                    <label className="text-xs text-gray-500 dark:text-gray-400 px-3 pt-1 block">{t.country}</label>
                    <select 
                        className="w-full p-2 bg-transparent outline-none text-gray-900 dark:text-white"
                        value={editingVehicle.country || 'D'}
                        onChange={e => setEditingVehicle({...editingVehicle, country: e.target.value})}
                    >
                        <option value="D" className="dark:bg-gray-800">Deutschland (D)</option>
                        <option value="AT" className="dark:bg-gray-800">Österreich (AT)</option>
                        <option value="CH" className="dark:bg-gray-800">Schweiz (CH)</option>
                    </select>
                 </div>
                 <div className="border border-green-500 rounded-lg p-1 bg-white dark:bg-gray-800">
                    <label className="text-xs text-gray-500 dark:text-gray-400 px-3 pt-1 block">{t.make}</label>
                    <input 
                        type="text" 
                        className="w-full p-2 bg-transparent outline-none text-gray-900 dark:text-white"
                        placeholder="Tesla"
                        value={editingVehicle.make || ''}
                        onChange={e => setEditingVehicle({...editingVehicle, make: e.target.value})}
                    />
                 </div>
                 <div className="border border-green-500 rounded-lg p-1 bg-white dark:bg-gray-800">
                    <label className="text-xs text-gray-500 dark:text-gray-400 px-3 pt-1 block">{t.model}</label>
                    <input 
                        type="text" 
                        className="w-full p-2 bg-transparent outline-none text-gray-900 dark:text-white"
                        placeholder="Model 3"
                        value={editingVehicle.model || ''}
                        onChange={e => setEditingVehicle({...editingVehicle, model: e.target.value})}
                    />
                 </div>
                 <div className="border border-green-500 rounded-lg p-1 bg-white dark:bg-gray-800">
                    <label className="text-xs text-gray-500 dark:text-gray-400 px-3 pt-1 block">{t.plate}</label>
                    <div className="flex items-center px-2 pb-1">
                        <input ref={plateInput1Ref} type="text" className="w-16 p-2 bg-transparent outline-none text-gray-900 dark:text-white text-center uppercase placeholder-gray-300 font-bold" placeholder="M" maxLength={3} value={plateParts[0]} onChange={(e) => handlePlatePartChange(0, e.target.value)} />
                        <span className="text-gray-400 font-bold">-</span>
                        <input ref={plateInput2Ref} type="text" className="w-16 p-2 bg-transparent outline-none text-gray-900 dark:text-white text-center uppercase placeholder-gray-300 font-bold" placeholder="XY" maxLength={2} value={plateParts[1]} onChange={(e) => handlePlatePartChange(1, e.target.value)} onKeyDown={(e) => handleKeyDown(e, plateInput1Ref)} />
                        <span className="w-2"></span>
                        <input ref={plateInput3Ref} type="text" className="flex-1 p-2 bg-transparent outline-none text-gray-900 dark:text-white uppercase placeholder-gray-300 font-bold" placeholder="1234" maxLength={4} value={plateParts[2]} onChange={(e) => handlePlatePartChange(2, e.target.value)} onKeyDown={(e) => handleKeyDown(e, plateInput2Ref)} />
                    </div>
                 </div>
                 <div className="border border-green-500 rounded-lg p-1 bg-white dark:bg-gray-800">
                    <label className="text-xs text-gray-500 dark:text-gray-400 px-3 pt-1 block">{t.batterySize}</label>
                    <input type="text" inputMode="numeric" pattern="[0-9]*" className="w-full p-2 bg-transparent outline-none text-gray-900 dark:text-white" placeholder="0" value={editingVehicle.batterySize || ''} onChange={e => { const val = e.target.value.replace(/[^0-9]/g, ''); setEditingVehicle({...editingVehicle, batterySize: val ? Number(val) : 0}); }} />
                 </div>
            </div>
            <button onClick={handleSaveVehicle} className="w-full bg-green-500 text-white font-bold py-4 rounded-full shadow-lg mt-8 flex items-center justify-center space-x-2 hover:bg-green-600 transition-colors">
                {isOnboarding ? ( <><span>Start</span><ChevronRight size={20} /></> ) : ( <> <Save size={20} /> <span>{t.save}</span> </> )}
            </button>
        </div>
      </div>
    );
  }

  if (subView === 'faq' || subView === 'terms' || subView === 'privacy') {
      let title = '', content = '';
      switch(subView) { case 'faq': title = t.faq; content = legal.faq; break; case 'terms': title = t.terms; content = legal.terms; break; case 'privacy': title = t.privacy; content = legal.privacy; break; }
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 pt-4 md:pt-4 animate-fade-in transition-colors duration-300">
             <div className="bg-white dark:bg-gray-800 p-4 flex items-center shadow-sm sticky top-0 z-10 md:hidden mb-4">
                <button onClick={() => onNavigate(subView === 'faq' ? 'settings' : 'profile_edit')} className="mr-4 text-gray-700 dark:text-gray-200"> <ChevronLeft size={24} /> </button>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
            </div>
            <div className="max-w-lg mx-auto p-4 md:p-0"> <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 whitespace-pre-wrap text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{content}</div> </div>
        </div>
      );
  }

  if (subView === 'history') {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 pt-4 md:pt-4 animate-fade-in transition-colors duration-300">
             <div className="bg-white dark:bg-gray-800 p-4 flex items-center shadow-sm sticky top-0 z-10 md:hidden mb-4">
                <button onClick={() => onNavigate('settings')} className="mr-4 text-gray-700 dark:text-gray-200"> <ChevronLeft size={24} /> </button>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t.history}</h1>
            </div>
            <div className="max-w-lg mx-auto p-4 md:p-0 space-y-4">
                {chargingHistory && chargingHistory.length > 0 ? (
                    [...chargingHistory].reverse().map((session) => (
                        <div key={session.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">{session.stationName}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(session.date).toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US')} • {session.durationMinutes} {t.min}</p>
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold text-green-600 dark:text-green-400 text-lg">{session.totalPrice.toFixed(2)} €</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{session.kwh} kWh</span>
                                </div>
                            </div>
                            {session.rating ? (
                                <div className="flex items-center pt-2 border-t border-gray-100 dark:border-gray-700">
                                    {[...Array(5)].map((_, i) => (
                                        <Star 
                                            key={i} 
                                            size={18} 
                                            className={`${i < session.rating! ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"} mr-1`} 
                                        />
                                    ))}
                                    {/* Feedback text hidden as requested */}
                                </div>
                            ) : (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); if (onRateSession) onRateSession(session.id); }}
                                    className="mt-2 w-full py-2 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center justify-center space-x-1"
                                >
                                    <span>{t.rate}</span>
                                </button>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center opacity-50">
                        <Clock size={48} className="mb-4 text-gray-400" />
                        <h3 className="font-bold text-gray-900 dark:text-white">{t.noHistory}</h3>
                        <p className="text-sm text-gray-500">{t.historyEmpty}</p>
                    </div>
                )}
            </div>
        </div>
      );
  }

  if (subView === 'contact') {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 pt-4 md:pt-4 animate-fade-in transition-colors duration-300">
             <div className="bg-white dark:bg-gray-800 p-4 flex items-center shadow-sm sticky top-0 z-10 md:hidden mb-4">
                <button onClick={() => onNavigate('settings')} className="mr-4 text-gray-700 dark:text-gray-200"> <ChevronLeft size={24} /> </button>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t.contact}</h1>
            </div>
            
            <div className="max-w-lg mx-auto p-4 md:p-0">
                {contactSent ? (
                    <div className="bg-green-500 text-white p-8 rounded-2xl flex flex-col items-center justify-center text-center animate-slide-up shadow-xl">
                        <CheckCircle size={64} className="mb-4" />
                        <h2 className="text-2xl font-bold mb-2">{t.contactSuccess}</h2>
                        <p className="opacity-90">{t.applicationReview}</p>
                    </div>
                ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex items-start border border-blue-100 dark:border-blue-800/30 mb-6">
                            <HelpCircle className="text-blue-500 mr-3 flex-shrink-0" size={24} />
                            <p className="text-sm text-blue-800 dark:text-blue-200">{t.contactIntro}</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t.contactSubject}</label>
                                <input type="text" required className="w-full p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-green-500 dark:text-white transition-all" value={contactSubject} onChange={(e) => setContactSubject(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t.contactMessage}</label>
                                <textarea required rows={6} className="w-full p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-green-500 dark:text-white transition-all resize-none" placeholder={t.contactPlaceholder} value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} />
                            </div>
                        </div>

                        <button type="submit" className="w-full bg-green-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-500/20 hover:bg-green-600 transition-colors flex items-center justify-center space-x-2 mt-6">
                            <Send size={20} />
                            <span>{t.contactSend}</span>
                        </button>

                        <div className="pt-8 text-center">
                            <p className="text-xs text-gray-400 mb-2">{t.orReachUs}</p>
                            <a href="mailto:support@smartshift.app" className="text-green-500 font-bold hover:underline">support@smartshift.app</a>
                        </div>
                    </form>
                )}
            </div>
        </div>
      );
  }

  if (subView === 'profile_edit') {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 pt-4 md:pt-4 animate-fade-in transition-colors duration-300">
            <div className="bg-white dark:bg-gray-800 p-4 flex items-center shadow-sm sticky top-0 z-10 md:hidden">
                <button onClick={() => onNavigate('settings')} className="mr-4 text-gray-700 dark:text-gray-200"> <ChevronLeft size={24} /> </button>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t.profile}</h1>
            </div>
            {showAvatarModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative animate-slide-up">
                        <button onClick={() => setShowAvatarModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"> <ChevronRight className="rotate-90" size={24} /> </button>
                        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white text-center">Avatar</h3>
                        <div className="grid grid-cols-4 gap-3"> {AVATAR_OPTIONS.map((avatar) => ( <button key={avatar} onClick={() => { setEditProfileData({...editProfileData, avatar}); setShowAvatarModal(false); }} className={`w-14 h-14 text-3xl flex items-center justify-center rounded-full transition-transform hover:scale-110 active:scale-95 ${editProfileData.avatar === avatar ? 'bg-green-100 ring-4 ring-green-200 dark:ring-green-900' : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'}`}> {avatar} </button> ))} </div>
                    </div>
                </div>
            )}
            <div className="p-6 max-w-lg mx-auto space-y-6">
                {profileError && ( <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-xl flex items-start text-sm text-red-600 dark:text-red-300"> <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" /> <span>{profileError}</span> </div> )}
                <div className="flex flex-col items-center py-2">
                    <button onClick={() => setShowAvatarModal(true)} className="w-24 h-24 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-5xl relative mb-4 shadow-inner hover:scale-105 transition-transform">
                        {editProfileData.avatar || 'User'} <div className="absolute bottom-0 right-0 bg-green-500 text-white p-1.5 rounded-full shadow-sm border-2 border-white dark:border-gray-800"> <Plus size={14} /> </div>
                    </button>
                </div>
                <div className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="border border-green-500 rounded-lg p-1 bg-white dark:bg-gray-800"> <label className="text-xs text-gray-500 dark:text-gray-400 px-3 pt-1 block">{t.firstName}</label> <input type="text" className="w-full p-2 bg-transparent outline-none text-gray-900 dark:text-white" value={editProfileData.firstName || ''} onChange={e => setEditProfileData({...editProfileData, firstName: e.target.value})} /> </div>
                        <div className="border border-green-500 rounded-lg p-1 bg-white dark:bg-gray-800"> <label className="text-xs text-gray-500 dark:text-gray-400 px-3 pt-1 block">{t.lastName}</label> <input type="text" className="w-full p-2 bg-transparent outline-none text-gray-900 dark:text-white" value={editProfileData.lastName || ''} onChange={e => setEditProfileData({...editProfileData, lastName: e.target.value})} /> </div>
                     </div>
                     <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-1 bg-white dark:bg-gray-800"> <label className="text-xs text-gray-500 dark:text-gray-400 px-3 pt-1 block flex items-center"> <Calendar size={12} className="mr-1" /> {t.birthDate} </label> <input type="date" className="w-full p-2 bg-transparent outline-none text-gray-900 dark:text-white" value={editProfileData.birthDate || ''} onChange={e => setEditProfileData({...editProfileData, birthDate: e.target.value})} /> </div>
                     <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-1 bg-white dark:bg-gray-800"> <label className="text-xs text-gray-500 dark:text-gray-400 px-3 pt-1 block flex items-center"> <Phone size={12} className="mr-1" /> {t.phoneNumber} </label> <input type="tel" inputMode="numeric" className="w-full p-2 bg-transparent outline-none text-gray-900 dark:text-white" placeholder="+49 123 456789" value={editProfileData.phoneNumber || ''} onChange={e => { const val = e.target.value.replace(/[^0-9]/g, ''); setEditProfileData({...editProfileData, phoneNumber: val}); }} /> </div>
                     <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-1 bg-white dark:bg-gray-800"> <label className="text-xs text-gray-500 dark:text-gray-400 px-3 pt-1 block flex items-center"> <MapPin size={12} className="mr-1" /> {t.address} </label> <input type="text" className="w-full p-2 bg-transparent outline-none text-gray-900 dark:text-white" placeholder="Musterstraße 1, 80331 München" value={editProfileData.address || ''} onChange={e => setEditProfileData({...editProfileData, address: e.target.value})} /> </div>
                     <div className="border border-green-500 rounded-lg p-1 bg-white dark:bg-gray-800 mt-6"> <label className="text-xs text-gray-500 dark:text-gray-400 px-3 pt-1 block">{t.email}</label> <input type="email" className="w-full p-2 bg-transparent outline-none text-gray-900 dark:text-white" value={editProfileData.email || ''} onChange={e => setEditProfileData({...editProfileData, email: e.target.value})} /> </div>
                     {editProfileData.email !== userProfile?.email && ( <div className="border border-green-500 rounded-lg p-1 bg-white dark:bg-gray-800 animate-slide-up"> <label className="text-xs text-gray-500 dark:text-gray-400 px-3 pt-1 block">{t.email} Confirm</label> <input type="email" className="w-full p-2 bg-transparent outline-none text-gray-900 dark:text-white" placeholder="Zur Bestätigung wiederholen" value={confirmEmail} onChange={e => setConfirmEmail(e.target.value)} /> </div> )}
                     <h3 className="font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 pt-4 flex items-center"> <Lock size={16} className="mr-2" /> {t.password} </h3>
                     <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-1 bg-white dark:bg-gray-800"> <label className="text-xs text-gray-500 dark:text-gray-400 px-3 pt-1 block">Old {t.password}</label> <input type="password" className="w-full p-2 bg-transparent outline-none text-gray-900 dark:text-white" placeholder={t.fillOnlyIfChanged} value={currentPasswordInput} onChange={e => setCurrentPasswordInput(e.target.value)} /> </div>
                     <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-1 bg-white dark:bg-gray-800"> <label className="text-xs text-gray-500 dark:text-gray-400 px-3 pt-1 block">New {t.password}</label> <input type="password" className="w-full p-2 bg-transparent outline-none text-gray-900 dark:text-white" value={newPassword} onChange={e => setNewPassword(e.target.value)} disabled={!currentPasswordInput} /> </div>
                     {newPassword.length > 0 && ( <div className="px-2 animate-fade-in"> <div className="flex justify-between text-xs mb-1"> <span className="text-gray-500 dark:text-gray-400">{t.passwordStrength}</span> <span className={`${passwordStrength.score < 3 ? 'text-orange-500' : 'text-green-500'} font-medium`}>{passwordStrength.label}</span> </div> <div className="flex space-x-1 h-1.5"> {[1, 2, 3, 4].map((i) => ( <div key={i} className={`flex-1 rounded-full transition-colors duration-300 ${i <= passwordStrength.score ? passwordStrength.color : 'bg-gray-200 dark:bg-gray-700'}`} /> ))} </div> </div> )}
                     <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-1 bg-white dark:bg-gray-800"> <label className="text-xs text-gray-500 dark:text-gray-400 px-3 pt-1 block">{t.repeatPassword}</label> <input type="password" className="w-full p-2 bg-transparent outline-none text-gray-900 dark:text-white" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} disabled={!newPassword} /> </div>
                </div>
                <button onClick={handleSaveProfile} className="w-full bg-green-500 text-white font-bold py-4 rounded-full shadow-lg mt-8 flex items-center justify-center space-x-2 hover:bg-green-600 transition-colors"> <Save size={20} /> <span>{t.save}</span> </button>
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-center space-x-6 text-sm"> <button onClick={() => onNavigate('terms')} className="text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 flex items-center"> <FileText size={14} className="mr-1" /> {t.terms} </button> <button onClick={() => onNavigate('privacy')} className="text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 flex items-center"> <Shield size={14} className="mr-1" /> {t.privacy} </button> </div>
            </div>
        </div>
      );
  }

  if (subView === 'payment') {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 pt-4 md:pt-4 animate-fade-in transition-colors duration-300">
             <div className="bg-white dark:bg-gray-800 p-4 flex items-center shadow-sm sticky top-0 z-10 md:hidden mb-4">
                <button onClick={() => onNavigate('settings')} className="mr-4 text-gray-700 dark:text-gray-200"> <ChevronLeft size={24} /> </button>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t.paymentMethods}</h1>
            </div>
            <div className="max-w-lg mx-auto p-4 md:p-0 space-y-4">
                {paymentMethods.map(method => (
                    <div key={method.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                         <div className="flex items-center space-x-3">
                             <div className={`w-10 h-10 rounded-full flex items-center justify-center ${method.type === 'paypal' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                                 {method.type === 'paypal' ? 'P' : <CreditCard size={18} />}
                             </div>
                             <div>
                                 <p className="font-bold text-gray-900 dark:text-white text-sm">{method.type === 'paypal' ? 'PayPal' : t.creditCard}</p>
                                 <p className="text-xs text-gray-500 dark:text-gray-400">{method.label}</p>
                             </div>
                         </div>
                         <div className="flex items-center space-x-2">
                             {method.isDefault && <span className="bg-green-100 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">{t.standard}</span>}
                             <button onClick={() => setDefaultPaymentMethod(method.id)} className={`p-2 rounded-full ${method.isDefault ? 'text-green-500' : 'text-gray-400 hover:text-gray-600'}`}> <CheckCircle size={20} /> </button>
                             <button onClick={(e) => handleDeletePaymentMethod(method.id, e)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"> <Trash2 size={20} /> </button>
                         </div>
                    </div>
                ))}

                {isAddingPayment ? (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 animate-slide-up">
                        <div className="flex space-x-2 mb-4">
                            <button onClick={() => setNewPaymentType('paypal')} className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-colors ${newPaymentType === 'paypal' ? 'bg-blue-50 border-blue-500 text-blue-600' : 'border-gray-200 dark:border-gray-600 text-gray-500'}`}>PayPal</button>
                            <button onClick={() => setNewPaymentType('credit_card')} className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-colors ${newPaymentType === 'credit_card' ? 'bg-blue-50 border-blue-500 text-blue-600' : 'border-gray-200 dark:border-gray-600 text-gray-500'}`}>{t.creditCard}</button>
                        </div>
                        
                        <div className="space-y-3">
                            {newPaymentType === 'paypal' ? (
                                <input type="email" placeholder="PayPal E-Mail" className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white" value={paypalEmail} onChange={e => setPaypalEmail(e.target.value)} />
                            ) : (
                                <>
                                    <input type="text" placeholder="Nummer" className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white" value={cardNumber} onChange={e => setCardNumber(e.target.value.replace(/[^0-9 ]/g, ''))} />
                                    <div className="flex space-x-3">
                                        <input type="text" placeholder="MM/YY" className="w-1/3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white" value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} />
                                        <input type="text" placeholder="Inhaber" className="flex-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white" value={cardHolder} onChange={e => setCardHolder(e.target.value)} />
                                    </div>
                                </>
                            )}
                        </div>

                        {paymentError && <p className="text-red-500 text-xs mt-3">{paymentError}</p>}

                        <div className="flex space-x-3 mt-6">
                            <button onClick={() => setIsAddingPayment(false)} className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold rounded-xl">{t.cancel}</button>
                            <button onClick={handleAddPaymentMethod} className="flex-1 py-3 bg-green-500 text-white font-bold rounded-xl shadow-lg shadow-green-500/20">{t.save}</button>
                        </div>
                    </div>
                ) : (
                    <button onClick={() => setIsAddingPayment(true)} className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 hover:border-green-500 hover:text-green-500 transition-all flex items-center justify-center font-bold">
                        <Plus size={20} className="mr-2" /> {t.paymentMethodAdd}
                    </button>
                )}
            </div>
        </div>
      );
  }

  if (subView === 'language') {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 pt-4 md:pt-4 animate-fade-in transition-colors duration-300">
             <div className="bg-white dark:bg-gray-800 p-4 flex items-center shadow-sm sticky top-0 z-10 md:hidden mb-4">
                <button onClick={() => onNavigate('settings')} className="mr-4 text-gray-700 dark:text-gray-200"> <ChevronLeft size={24} /> </button>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t.changeLanguage}</h1>
            </div>
            <div className="max-w-lg mx-auto p-4 md:p-0 space-y-4">
                 {[
                     { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
                     { code: 'en', label: 'English', flag: '🇬🇧' }
                 ].map((lang) => (
                     <button
                        key={lang.code}
                        onClick={() => onSetLanguage(lang.code as Language)}
                        className={`w-full bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border flex items-center justify-between transition-all ${
                            language === lang.code 
                            ? 'border-green-500 ring-1 ring-green-500 bg-green-50 dark:bg-green-900/10' 
                            : 'border-gray-100 dark:border-gray-700 hover:border-gray-300'
                        }`}
                     >
                         <div className="flex items-center space-x-3">
                             <span className="text-2xl">{lang.flag}</span>
                             <span className={`font-bold ${language === lang.code ? 'text-green-700 dark:text-green-400' : 'text-gray-700 dark:text-white'}`}>{lang.label}</span>
                         </div>
                         {language === lang.code && <CheckCircle size={24} className="text-green-500" fill="currentColor" color="white" />}
                     </button>
                 ))}
            </div>
        </div>
      );
  }

  if (subView === 'host_apply') { 
      return ( 
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 pt-4 md:pt-4 animate-fade-in transition-colors duration-300"> 
            <div className="bg-white dark:bg-gray-800 p-4 flex items-center shadow-sm sticky top-0 z-10 md:hidden mb-4"> 
                <button onClick={() => onNavigate('settings')} className="mr-4 text-gray-700 dark:text-gray-200"> <ChevronLeft size={24} /> </button> 
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t.hostTitle}</h1> 
            </div> 
            
            <div className="max-w-lg mx-auto p-4 md:p-0 space-y-6"> 
                
                {hostSuccess ? (
                    <div className="bg-green-500 text-white p-8 rounded-2xl flex flex-col items-center justify-center text-center animate-slide-up shadow-xl">
                        <CheckCircle size={64} className="mb-4" />
                        <h2 className="text-2xl font-bold mb-2">{t.applicationSent}</h2>
                        <p className="opacity-90">{t.applicationReview}</p>
                    </div>
                ) : (
                    <>
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl flex items-start border border-green-100 dark:border-green-800"> 
                            <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg mr-3 text-green-600 dark:text-green-200 shrink-0"> <Zap size={24} /> </div> 
                            <div> 
                                <h3 className="font-bold text-green-900 dark:text-green-100 mb-1">{t.hostTitle}</h3> 
                                <p className="text-sm text-green-800 dark:text-green-300">{t.hostIntro}</p> 
                            </div> 
                        </div> 
                        
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-4"> 
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">{t.wallboxLocation}</h3>
                            <div className="grid grid-cols-3 gap-3">
                                <input type="text" placeholder="Straße" className="col-span-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-green-500 dark:text-white" value={hostData.street} onChange={e => setHostData({...hostData, street: e.target.value})} />
                                <input type="text" placeholder="Nr." className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-green-500 dark:text-white" value={hostData.number} onChange={e => setHostData({...hostData, number: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <input type="text" placeholder="PLZ" className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-green-500 dark:text-white" value={hostData.plz} onChange={e => setHostData({...hostData, plz: e.target.value})} />
                                <input type="text" placeholder="Stadt" className="col-span-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-green-500 dark:text-white" value={hostData.city} onChange={e => setHostData({...hostData, city: e.target.value})} />
                            </div>

                            <h3 className="font-bold text-gray-900 dark:text-white mt-6 mb-2">{t.techSpecs}</h3>
                            <div className="flex space-x-3 mb-4">
                                <button onClick={() => setHostData({...hostData, type: 'Typ 2'})} className={`flex-1 py-3 rounded-xl border font-bold text-sm ${hostData.type === 'Typ 2' ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'}`}>Typ 2</button>
                                <button onClick={() => setHostData({...hostData, type: 'CCS'})} className={`flex-1 py-3 rounded-xl border font-bold text-sm ${hostData.type === 'CCS' ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'}`}>CCS</button>
                            </div>
                            
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">{t.power}: {hostData.power} kW</label>
                            <input 
                                type="range" min="3.7" max="22" step="0.1" 
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500" 
                                value={hostData.power} 
                                onChange={e => setHostData({...hostData, power: parseFloat(e.target.value)})} 
                            />

                            <h3 className="font-bold text-gray-900 dark:text-white mt-6 mb-2">{t.access}</h3>
                            <div className="flex space-x-3">
                                <button onClick={() => setHostData({...hostData, access: 'private'})} className={`flex-1 py-3 rounded-xl border font-bold text-sm ${hostData.access === 'private' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'}`}>{t.private}</button>
                                <button onClick={() => setHostData({...hostData, access: 'public'})} className={`flex-1 py-3 rounded-xl border font-bold text-sm ${hostData.access === 'public' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'}`}>{t.public}</button>
                            </div>
                        </div> 
                        
                        <button onClick={handleHostSubmit} className="w-full bg-green-500 text-white font-bold py-4 rounded-full shadow-lg shadow-green-200 dark:shadow-green-900/30 active:scale-[0.98] transition-all hover:bg-green-600">
                            {t.submitApplication}
                        </button> 
                    </>
                )}
            </div> 
        </div> 
      ); 
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 md:pt-6 transition-colors duration-300 relative">
      {deletingVehicleId && (
          <div className="fixed inset-0 z-[6000] flex items-center justify-center px-4 animate-fade-in">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeletingVehicleId(null)}></div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm relative z-10 animate-slide-up">
                  <div className="flex flex-col items-center text-center mb-6">
                      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4"> <AlertTriangle className="text-red-500" size={32} /> </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t.deleteVehicleTitle}</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">{t.deleteVehicleConfirm}</p>
                  </div>
                  <div className="flex space-x-3">
                      <button onClick={() => setDeletingVehicleId(null)} className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">{t.cancel}</button>
                      <button onClick={confirmDelete} className="flex-1 py-3 px-4 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 shadow-lg shadow-red-500/30 transition-colors">{t.delete}</button>
                  </div>
              </div>
          </div>
      )}
      <div className="bg-white dark:bg-gray-800 p-6 shadow-sm mb-6 md:hidden"> <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.settings}</h1> </div>
      <div className="max-w-2xl mx-auto md:p-6">
        <button onClick={() => { setEditProfileData(userProfile || {}); setConfirmEmail(''); setCurrentPasswordInput(''); setNewPassword(''); setConfirmNewPassword(''); setProfileError(null); onNavigate('profile_edit'); }} className="w-full bg-white dark:bg-gray-800 md:rounded-xl shadow-sm p-4 mb-6 flex items-center space-x-4 mx-4 md:mx-0 rounded-lg transition-all active:scale-[0.99] text-left group">
             <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-3xl group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors"> {userProfile?.avatar || <Users size={30} className="text-gray-500" />} </div>
             <div className="flex-1"> <h3 className="font-bold text-lg text-gray-900 dark:text-white">{userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'Max Mustermann'}</h3> <p className="text-gray-500 dark:text-gray-400 text-sm truncate">{userProfile ? userProfile.email : 'max.mustermann@example.com'}</p> </div>
             <ChevronRight className="text-gray-400 dark:text-gray-500 group-hover:text-green-500" />
        </button>
        <div className="bg-white dark:bg-gray-800 md:rounded-xl shadow-sm p-4 mb-6 mx-4 md:mx-0 rounded-lg transition-colors">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center"> <Car size={20} className="mr-2 text-green-600" /> {t.myVehicles} </h3>
            {vehicles.map(v => (
                <div key={v.id} className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-700 rounded-lg mb-3">
                    <div className="flex items-center space-x-3"> <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{backgroundColor: v.color + '20'}}> <Car size={20} style={{color: v.color}} /> </div> <div> <p className="font-semibold text-gray-900 dark:text-white">{v.make ? `${v.make} ${v.model}` : v.model}</p> <p className="text-xs text-gray-500 dark:text-gray-400">{v.plate}</p> </div> </div>
                    <button onClick={(e) => handleDeleteClick(v.id, e)} className="bg-gray-50 dark:bg-gray-700 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all p-3 rounded-full" aria-label="Fahrzeug löschen"> <Trash2 size={20} /> </button>
                </div>
            ))}
            <button onClick={() => { setEditingVehicle({}); onNavigate('vehicle_edit'); }} className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 font-medium flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-green-400 hover:text-green-600 transition-all"> <Plus size={20} className="mr-2" /> {t.addVehicle} </button>
        </div>
        <div className="bg-white dark:bg-gray-800 md:rounded-xl shadow-sm mx-4 md:mx-0 rounded-lg divide-y divide-gray-100 dark:divide-gray-700 transition-colors">
             <MenuItem icon={Zap} label={t.hostTitle} onClick={() => onNavigate('host_apply')} />
            <MenuItem icon={theme === 'dark' ? Sun : Moon} label={theme === 'dark' ? t.lightDesign : t.darkDesign} onClick={onToggleTheme} toggle toggleValue={theme === 'dark'} />
            <MenuItem icon={Globe} label={t.changeLanguage} subLabel={language === 'de' ? 'Deutsch' : 'English'} onClick={() => onNavigate('language_select')} />
            <MenuItem icon={Clock} label={t.history} onClick={() => onNavigate('history')} />
            <MenuItem icon={CreditCard} label={t.paymentMethods} onClick={() => onNavigate('payment')} />
             <MenuItem icon={HelpCircle} label={t.faq} onClick={() => onNavigate('faq')} />
            <MenuItem icon={Mail} label={t.contact} onClick={() => onNavigate('contact')} />
        </div>
        <div className="bg-white dark:bg-gray-800 md:rounded-xl shadow-sm mx-4 md:mx-0 rounded-lg mt-6"> <MenuItem icon={LogOut} label={t.logout} onClick={onLogout} /> </div>
        <div className="text-center pt-8"> <p className="text-xs text-gray-400">Version 2.5.0</p> </div>
      </div>
    </div>
  );
};

const MenuItem = ({ icon: Icon, label, subLabel, alert = false, onClick, toggle = false, toggleValue = false }: { icon: any, label: string, subLabel?: string, alert?: boolean, onClick?: () => void, toggle?: boolean, toggleValue?: boolean }) => (
    <button onClick={onClick} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left group">
        <div className="flex items-center space-x-4"> <Icon size={22} className="text-gray-700 dark:text-gray-300 group-hover:text-green-600 transition-colors" /> <span className="text-gray-700 dark:text-gray-200 font-medium">{label}</span> </div>
        <div className="flex items-center"> {subLabel && <span className="text-xs text-gray-400 mr-2 uppercase font-bold">{subLabel}</span>} {alert && <div className="w-2 h-2 rounded-full bg-red-500 mr-3"></div>} {toggle ? ( <div className={`w-11 h-6 rounded-full transition-colors relative ${toggleValue ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}> <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${toggleValue ? 'translate-x-5' : ''}`}></div> </div> ) : ( <ChevronRight size={18} className="text-gray-400 dark:text-gray-500" /> )} </div>
    </button>
);
