
import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { CreditCardIcon } from '../icons/CreditCardIcon';
import { Select } from '../ui/Select';
import { TokenIcon } from '../icons/TokenIcon';
import { GiftIcon } from '../icons/GiftIcon';

interface AddPaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (method: any) => void;
  initialMethod?: any;
}

export const AddPaymentMethodModal: React.FC<AddPaymentMethodModalProps> = ({ isOpen, onClose, onSave, initialMethod }) => {
  const [methodType, setMethodType] = useState<'card' | 'paypal' | 'crypto'>('card');
  
  // Card Fields
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  const [cardType, setCardType] = useState('Visa');

  // Other Fields
  const [email, setEmail] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [walletLabel, setWalletLabel] = useState('My Wallet');
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
        setErrors({});
        if (initialMethod) {
            // Determine type based on category/type
            if (initialMethod.category === 'cards') {
                setMethodType('card');
                setCardNumber(initialMethod.last4 ? `**** **** **** ${initialMethod.last4}` : '');
                setExpiry(initialMethod.expiry || '');
                setName(initialMethod.cardholderName || '');
                setCardType(initialMethod.type || 'Visa');
                setCvv(''); 
            } else if (initialMethod.type === 'PayPal') {
                setMethodType('paypal');
                setEmail(initialMethod.detail || '');
            } else if (initialMethod.type === 'Crypto Wallet') {
                setMethodType('crypto');
                setWalletAddress(initialMethod.detail || '');
                setWalletLabel(initialMethod.cardholderName || 'My Wallet'); // Reusing cardholderName prop for label if needed
            }
        } else {
            setMethodType('card');
            setCardNumber('');
            setExpiry('');
            setCvv('');
            setName('');
            setCardType('Visa');
            setEmail('');
            setWalletAddress('');
            setWalletLabel('My Wallet');
        }
    }
  }, [isOpen, initialMethod]);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value.replace(/\D/g, ''); 
      if (val.length > 16) val = val.substring(0, 16); 
      
      const parts = [];
      for (let i = 0; i < val.length; i += 4) {
          parts.push(val.substring(i, i + 4));
      }
      const formatted = parts.join(' ');
      
      setCardNumber(formatted);
      if (errors.cardNumber) setErrors(prev => ({ ...prev, cardNumber: '' }));
      
      if (val.startsWith('4')) setCardType('Visa');
      else if (val.startsWith('5')) setCardType('Mastercard');
      else if (val.startsWith('3')) setCardType('American Express');
      else if (val.startsWith('6')) setCardType('Discover');
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value.replace(/\D/g, '');
      if (val.length > 4) val = val.substring(0, 4);
      
      if (val.length >= 2) {
          setExpiry(val.substring(0, 2) + '/' + val.substring(2));
      } else {
          setExpiry(val);
      }
      
      if (errors.expiry) setErrors(prev => ({ ...prev, expiry: '' }));
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/\D/g, '').substring(0, 4);
      setCvv(val);
      if (errors.cvv) setErrors(prev => ({ ...prev, cvv: '' }));
  };

  const validate = () => {
      const newErrors: Record<string, string> = {};
      
      if (methodType === 'card') {
          if (!name.trim()) newErrors.name = "Cardholder name is required";
          
          const cleanCardNumber = cardNumber.replace(/\s/g, '');
          if (!initialMethod && cleanCardNumber.length < 13) {
              newErrors.cardNumber = "Invalid card number length";
          }
          
          if (!expiry.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)) {
              newErrors.expiry = "Invalid format (MM/YY)";
          } else {
              const [month, year] = expiry.split('/');
              const currentYear = new Date().getFullYear() % 100;
              const currentMonth = new Date().getMonth() + 1;
              
              if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
                  newErrors.expiry = "Card has expired";
              }
          }
          
          if (!initialMethod && cvv.length < 3) {
              newErrors.cvv = "Invalid CVV";
          }
      } else if (methodType === 'paypal') {
          if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
              newErrors.email = "Valid email is required";
          }
      } else if (methodType === 'crypto') {
          if (!walletAddress.trim()) {
              newErrors.walletAddress = "Wallet address is required";
          }
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    let methodData: any = {
        ...initialMethod,
        isDefault: initialMethod ? initialMethod.isDefault : false
    };

    if (methodType === 'card') {
        methodData = {
            ...methodData,
            category: 'cards',
            type: cardType,
            expiry,
            cardholderName: name,
        };
        if (!initialMethod) {
            const cleanCardNumber = cardNumber.replace(/\s/g, '');
            methodData.last4 = cleanCardNumber.slice(-4);
            methodData.id = `card-${Date.now()}`;
        }
    } else if (methodType === 'paypal') {
        methodData = {
            ...methodData,
            category: 'other',
            type: 'PayPal',
            detail: email,
        };
         if (!initialMethod) {
            methodData.id = `paypal-${Date.now()}`;
        }
    } else if (methodType === 'crypto') {
        methodData = {
            ...methodData,
            category: 'other',
            type: 'Crypto Wallet',
            detail: walletAddress,
            cardholderName: walletLabel, // Using cardholderName to store label if needed
        };
        if (!initialMethod) {
            methodData.id = `crypto-${Date.now()}`;
        }
    }

    onSave(methodData);
    onClose();
  };

  const getCardGradient = () => {
      const type = cardType.toLowerCase();
      if (type.includes('visa')) return 'bg-gradient-to-br from-blue-900 to-indigo-800';
      if (type.includes('mastercard')) return 'bg-gradient-to-br from-orange-900 to-red-900';
      if (type.includes('amex') || type.includes('american')) return 'bg-gradient-to-br from-cyan-900 to-blue-900';
      if (type.includes('discover')) return 'bg-gradient-to-br from-yellow-800 to-orange-900';
      return 'bg-gradient-to-br from-gray-800 to-gray-900';
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialMethod ? "Edit Payment Method" : "Add Payment Method"}>
      <div className="space-y-6">
        
        {/* Method Type Selector */}
        {!initialMethod && (
            <div className="flex bg-gray-800 p-1 rounded-lg">
                <button 
                    onClick={() => setMethodType('card')} 
                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${methodType === 'card' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-white'}`}
                >
                    Card
                </button>
                <button 
                    onClick={() => setMethodType('paypal')} 
                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${methodType === 'paypal' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-white'}`}
                >
                    PayPal
                </button>
                <button 
                    onClick={() => setMethodType('crypto')} 
                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${methodType === 'crypto' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-white'}`}
                >
                    Crypto
                </button>
            </div>
        )}

        {methodType === 'card' && (
            <>
                {/* Visual Card Preview */}
                <div className={`relative w-full aspect-[1.586/1] rounded-xl p-5 shadow-2xl overflow-hidden ${getCardGradient()} border border-white/10 transition-colors duration-500`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <CreditCardIcon className="w-32 h-32 text-white" />
                    </div>
                    <div className="relative z-10 flex flex-col justify-between h-full text-white">
                        <div className="flex justify-between items-start">
                            <span className="font-bold italic text-lg opacity-90">{cardType}</span>
                            <CreditCardIcon className="w-8 h-8 opacity-80" />
                        </div>
                        <div className="mt-2">
                            <p className="text-xl tracking-widest font-mono drop-shadow-md">
                                {cardNumber || '•••• •••• •••• ••••'}
                            </p>
                        </div>
                        <div className="flex justify-between items-end mt-2">
                            <div>
                                <p className="text-[9px] uppercase tracking-wider opacity-70 mb-0.5">Card Holder</p>
                                <p className="text-sm font-medium tracking-wide uppercase truncate max-w-[180px]">{name || 'YOUR NAME'}</p>
                            </div>
                            <div>
                                <p className="text-[9px] uppercase tracking-wider opacity-70 mb-0.5">Expires</p>
                                <p className="text-sm font-medium tracking-wide">{expiry || 'MM/YY'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Card Number</label>
                        <div className="relative">
                            <Input 
                                placeholder="0000 0000 0000 0000" 
                                value={cardNumber} 
                                onChange={handleCardNumberChange} 
                                prefixIcon={<CreditCardIcon className="w-5 h-5"/>} 
                                disabled={!!initialMethod}
                                className={initialMethod ? "opacity-50 cursor-not-allowed" : ""}
                                maxLength={19} 
                            />
                        </div>
                        {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Card Type</label>
                            <Select value={cardType} onChange={e => setCardType(e.target.value)} disabled={!!initialMethod}>
                                <option value="Visa">Visa</option>
                                <option value="Mastercard">Mastercard</option>
                                <option value="American Express">American Express</option>
                                <option value="Discover">Discover</option>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Expiry Date</label>
                            <Input placeholder="MM/YY" value={expiry} onChange={handleExpiryChange} maxLength={5} />
                            {errors.expiry && <p className="text-red-500 text-xs mt-1">{errors.expiry}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">CVV</label>
                            <Input 
                                placeholder="123" 
                                value={cvv} 
                                onChange={handleCvvChange} 
                                type="password" 
                                maxLength={4} 
                                disabled={!!initialMethod} 
                                className={initialMethod ? "opacity-50 cursor-not-allowed placeholder-transparent" : ""}
                            />
                            {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Cardholder Name</label>
                            <Input placeholder="Name on Card" value={name} onChange={e => { setName(e.target.value); if(errors.name) setErrors({...errors, name: ''}) }} />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>
                    </div>
                </div>
            </>
        )}

        {methodType === 'paypal' && (
             <div className="space-y-4 pt-4">
                 <div className="flex items-center justify-center mb-6">
                     <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                         <span className="text-blue-600 font-bold italic text-2xl">P</span>
                     </div>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">PayPal Email Address</label>
                    <Input 
                        placeholder="you@example.com" 
                        value={email} 
                        onChange={e => { setEmail(e.target.value); if(errors.email) setErrors({...errors, email: ''}) }} 
                        type="email"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <p className="text-xs text-gray-500">
                    You will be redirected to PayPal to complete your purchase when selecting this method.
                </p>
             </div>
        )}

        {methodType === 'crypto' && (
             <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-center mb-6">
                     <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center border border-amber-400/50">
                         <TokenIcon className="w-8 h-8 text-amber-400" />
                     </div>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Wallet Label</label>
                    <Input 
                        placeholder="e.g. My Metamask" 
                        value={walletLabel} 
                        onChange={e => setWalletLabel(e.target.value)} 
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Wallet Address</label>
                    <Input 
                        placeholder="0x..." 
                        value={walletAddress} 
                        onChange={e => { setWalletAddress(e.target.value); if(errors.walletAddress) setErrors({...errors, walletAddress: ''}) }} 
                    />
                    {errors.walletAddress && <p className="text-red-500 text-xs mt-1">{errors.walletAddress}</p>}
                </div>
                <div className="bg-amber-900/20 border border-amber-500/20 p-3 rounded-lg flex gap-3 items-start">
                    <GiftIcon className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-200/80">
                        Ensure you are using a compatible wallet network (Ethereum Mainnet or Polygon) to avoid lost funds.
                    </p>
                </div>
             </div>
        )}
        
        <div className="pt-6 flex gap-3 border-t border-gray-800 mt-4">
            <Button variant="secondary" onClick={onClose} className="w-full">Cancel</Button>
            <Button variant="primary" onClick={handleSave} className="w-full bg-[#EC4899] hover:bg-[#d8428a] text-white">
                {initialMethod ? "Save Changes" : `Add ${methodType === 'card' ? 'Card' : methodType === 'paypal' ? 'PayPal' : 'Wallet'}`}
            </Button>
        </div>
      </div>
    </Modal>
  );
};
