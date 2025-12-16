
import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Beaker, CheckCircle, AlertCircle, Calendar, Check, X, Circle } from 'lucide-react';
import { getPasswordRequirements, isValidEmail } from '../utils';
import { TRANSLATIONS, AVATAR_OPTIONS } from '../constants';
import { Language, UserProfile } from '../types';

interface AuthViewProps {
  onLogin: (isDemo?: boolean, newProfile?: UserProfile) => void;
  onValidateCredentials: (email: string, password: string) => boolean;
  language: Language;
  onSetLanguage: (lang: Language) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin, onValidateCredentials, language, onSetLanguage }) => {
  const t = TRANSLATIONS[language]; 
  
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  const [street, setStreet] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [city, setCity] = useState('');
  
  const [birthDate, setBirthDate] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const [error, setError] = useState<string | null>(null);

  const pwdReqs = getPasswordRequirements(password);
  const isPasswordValid = pwdReqs.length && pwdReqs.upper && pwdReqs.lower && pwdReqs.numberOrSpecial;

  const today = new Date();
  const maxDateForInput = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate()).toISOString().split('T')[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidEmail(email)) {
        setError(t.errorEmail);
        return;
    }

    if (activeTab === 'register') {
        if (!firstName || !lastName || !street || !houseNumber || !zipCode || !city || !birthDate || !phoneNumber) {
            setError(t.errorRequired);
            return;
        }

        const birthDateObj = new Date(birthDate);
        let age = today.getFullYear() - birthDateObj.getFullYear();
        const m = today.getMonth() - birthDateObj.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
            age--;
        }

        if (age < 18) {
            setError(t.errorAge);
            return;
        }

        if (password !== confirmPassword) {
            setError(t.errorPasswordMatch);
            return;
        }
        
        if (!isPasswordValid) {
            setError(t.errorPasswordPolicy);
            return;
        }

        const fullAddress = `${street} ${houseNumber}, ${zipCode} ${city}`;
        const randomAvatar = AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)];

        const newProfile: UserProfile = {
            firstName,
            lastName,
            email,
            password,
            address: fullAddress,
            birthDate,
            phoneNumber, 
            avatar: randomAvatar
        };

        onLogin(false, newProfile);
    } else {
        const isValid = onValidateCredentials(email, password);
        if (isValid) {
            onLogin(false);
        } else {
            setError(t.errorCredentials);
        }
    }
  };

  const toggleLanguage = () => {
      onSetLanguage(language === 'de' ? 'en' : 'de');
  };

  const RequirementItem = ({ met, text }: { met: boolean, text: string }) => (
      <div className={`flex items-center space-x-2 text-xs transition-colors duration-300 ${met ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
          {met ? <Check size={14} className="flex-shrink-0" /> : <Circle size={14} className="flex-shrink-0" />}
          <span>{text}</span>
      </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900 transition-colors duration-500 overflow-y-auto overflow-x-hidden">
      
      {/* Background Animated Blobs - Fixed to stay in place while scrolling */}
      <div className="fixed inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-green-400/30 dark:bg-green-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-400/30 dark:bg-blue-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] bg-purple-400/30 dark:bg-purple-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Language Toggle Button */}
      <div className="fixed top-6 right-6 z-50">
        <button
            onClick={toggleLanguage}
            className="w-12 h-12 bg-white/70 dark:bg-black/40 backdrop-blur-md rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all flex items-center justify-center border border-white/30 dark:border-white/10"
            title={language === 'de' ? "Switch to English" : "Auf Deutsch wechseln"}
        >
            <span className="text-xs font-black tracking-widest text-gray-800 dark:text-white">
                {language === 'de' ? 'DEU' : 'ENG'}
            </span>
        </button>
      </div>

      <div className="min-h-full flex flex-col items-center justify-center p-4 py-10 relative z-10">
          {/* Logo / Brand */}
          <div className="text-center mb-8 animate-float">
             <div className="inline-flex items-center justify-center w-32 h-32 mb-2">
                {/* Updated Logo SVG - Simplified Leaf Clipart */}
                <svg viewBox="0 0 24 24" className="w-full h-full text-green-600 dark:text-green-500 drop-shadow-xl" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.77 10-10 10Z" fill="currentColor" />
                    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" fill="none" strokeWidth="2" strokeLinecap="round" className="stroke-gray-50 dark:stroke-gray-900" />
                </svg>
             </div>
             <h1 className="text-4xl font-extrabold text-green-900 dark:text-white tracking-tighter uppercase">
               Smart Shift
             </h1>
             <p className="text-green-800 dark:text-green-400 mt-2 font-bold tracking-[0.2em] text-xs uppercase">YOUR WALLBOX - THEIR JOURNEY</p>
          </div>

          <div className="glass-card rounded-3xl p-1 md:p-2 animate-slide-up w-full max-w-md">
              <div className="bg-white/50 dark:bg-gray-900/50 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
                
                {/* Tabs */}
                <div className="flex p-1 bg-gray-100/50 dark:bg-gray-800/50 rounded-xl mb-6 relative">
                    <div 
                        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-gray-700 rounded-lg shadow-sm transition-all duration-300 ease-in-out ${activeTab === 'login' ? 'left-1' : 'left-[calc(50%+4px)]'}`}
                    ></div>
                    <button
                        className={`flex-1 relative z-10 py-2 text-sm font-bold transition-colors ${activeTab === 'login' ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                        onClick={() => { setActiveTab('login'); setError(null); }}
                    >
                        {t.login}
                    </button>
                    <button
                        className={`flex-1 relative z-10 py-2 text-sm font-bold transition-colors ${activeTab === 'register' ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                        onClick={() => { setActiveTab('register'); setError(null); }}
                    >
                        {t.register}
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50/80 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 p-3 rounded-xl text-sm flex items-start backdrop-blur-sm animate-fade-in">
                            <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="text-gray-400 group-focus-within:text-green-500 transition-colors" size={20} />
                            </div>
                            <input
                                type="email"
                                placeholder={t.email}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-gray-900 dark:text-white placeholder-gray-400"
                                required
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="text-gray-400 group-focus-within:text-green-500 transition-colors" size={20} />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder={t.password}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`w-full pl-12 pr-12 py-3.5 bg-gray-50/50 dark:bg-gray-800/50 border rounded-xl outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-gray-900 dark:text-white placeholder-gray-400 ${
                                    activeTab === 'register' && password && !isPasswordValid ? 'border-orange-300 dark:border-orange-800' : 'border-gray-200 dark:border-gray-700'
                                }`}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        
                        {/* Modern Real-time Password Checklist for Register */}
                        {activeTab === 'register' && (
                            <div className="grid grid-cols-2 gap-2 px-1 animate-fade-in">
                                <RequirementItem met={pwdReqs.length} text={t.passwordMinLen} />
                                <RequirementItem met={pwdReqs.upper} text={t.passwordUpper} />
                                <RequirementItem met={pwdReqs.lower} text={t.passwordLower} />
                                <RequirementItem met={pwdReqs.numberOrSpecial} text={t.passwordSpecial} />
                            </div>
                        )}

                        {activeTab === 'register' && (
                            <div className="space-y-4 animate-slide-up">
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <CheckCircle className="text-gray-400 group-focus-within:text-green-500" size={20} />
                                    </div>
                                    <input
                                        type="password"
                                        placeholder={t.repeatPassword}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-gray-900 dark:text-white"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="text" placeholder={t.firstName} value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-4 py-3.5 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-green-500 transition-all text-gray-900 dark:text-white" />
                                    <input type="text" placeholder={t.lastName} value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-4 py-3.5 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-green-500 transition-all text-gray-900 dark:text-white" />
                                </div>
                                <div className="relative group">
                                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Calendar size={20} className="text-gray-400"/></div>
                                     <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-green-500 transition-all text-gray-900 dark:text-white" max={maxDateForInput}/>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <input type="text" placeholder={t.street} value={street} onChange={e => setStreet(e.target.value)} className="col-span-2 px-4 py-3.5 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-green-500 transition-all text-gray-900 dark:text-white" />
                                    <input type="text" placeholder={t.houseNr} value={houseNumber} onChange={e => setHouseNumber(e.target.value)} className="px-4 py-3.5 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-green-500 transition-all text-gray-900 dark:text-white" />
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <input type="text" placeholder={t.zip} value={zipCode} onChange={e => setZipCode(e.target.value)} className="px-4 py-3.5 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-green-500 transition-all text-gray-900 dark:text-white" />
                                    <input type="text" placeholder={t.city} value={city} onChange={e => setCity(e.target.value)} className="col-span-2 px-4 py-3.5 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-green-500 transition-all text-gray-900 dark:text-white" />
                                </div>
                                <input type="tel" placeholder={t.phone} value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="w-full px-4 py-3.5 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-green-500 transition-all text-gray-900 dark:text-white" />
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-500/30 active:scale-[0.98] transition-all duration-300 mt-4"
                    >
                        {activeTab === 'login' ? t.login : t.register}
                    </button>
                </form>

                {activeTab === 'login' && (
                    <div className="text-center mt-6 space-y-4">
                        <button type="button" className="text-sm text-green-600 dark:text-green-400 hover:underline">
                            {t.forgotPassword}
                        </button>
                        <div className="relative py-2">
                             <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-700"></div></div>
                             <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-gray-900 px-2 text-gray-400">{t.or}</span></div>
                        </div>
                        <button 
                            type="button"
                            onClick={() => onLogin(true)}
                            className="w-full py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center space-x-2 border border-gray-200 dark:border-gray-700"
                        >
                            <Beaker size={16} />
                            <span>{t.demoAccount}</span>
                        </button>
                    </div>
                )}
              </div>
          </div>
      </div>
    </div>
  );
};
