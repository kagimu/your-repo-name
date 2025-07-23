import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { EdumallButton } from '@/components/ui/EdumallButton';
import { EdumallInput } from '@/components/ui/EdumallInput';
import { CustomCursor } from '@/components/CustomCursor';
import { useAuth } from '@/contexts/AuthContext';
import { PreLoader } from '@/components/ui/PreLoader';

const Register = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [accountType, setAccountType] = useState<'institution' | 'individual'>('institution');
  const [isRegistering, setIsRegistering] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    // Institution Info
    institution_name: '',
    centre_number: '',
    district: '',
    subcounty: '',
    parish: '',
    village: '',
    // Contact Admin
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    designation: '',
    customDesignation: '',
    // Individual Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    userType: '',
    customUserType: '',
    // Payment Options
    paymentMethods: [] as string[],
    mobileMoneyNumber: '',
    bankAccount: '',
  });

  const designationOptions = [
    'Head-Teacher',
    'Deputy Head-Teacher',
    'Deputy of Studies',
    'Bursar',
    'Other'
  ];

  const userTypeOptions = [
    'Parent',
    'Student', 
    'Teacher',
    'Guardian',
    'Other'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePaymentMethodToggle = (method: string) => {
    setFormData(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(method)
        ? prev.paymentMethods.filter(m => m !== method)
        : [...prev.paymentMethods, method]
    }));
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, accountType === 'institution' ? 4 : 2));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsRegistering(true);

  try {
    // Fetch CSRF cookie if required
    await fetch('http://edumall-admin.up.railway.app/sanctum/csrf-cookie', {
      credentials: 'include',
    });

    const response = await fetch('http://edumall-admin.up.railway.app/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include', // Include cookies for Sanctum
      body: JSON.stringify({
        accountType,
        ...formData,
         paymentMethods: formData.paymentMethods.join(','), // 👈 convert array to string

      }),
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      console.error('Registration error:', errorResponse);
      throw new Error('Failed to register');
    }

    const result = await response.json();
    console.log('Registration successful:', result);
    localStorage.setItem('token', result.token);

    // ✅ Store token in localStorage
    localStorage.setItem('token', result.token);

    // ✅ Login with token
    login({
      id: result.user.id,
      name: `${result.user.firstName} ${result.user.lastName}`,
      email: result.user.email,
      type: accountType,
      phone: result.user.phone,
      firstName: result.user.firstName,
    }, result.token); // ← pass token here too

    navigate('/categories');
  } catch (error) {
    console.error('Registration error:', error);
    alert('Registration failed. Please try again.');
  } finally {
    setIsRegistering(false);
  }
};



  const renderProgressBar = () => {
    const totalSteps = accountType === 'institution' ? 4 : 2;
    const progress = (currentStep / totalSteps) * 100;
    
    return (
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Step {currentStep} of {totalSteps}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="bg-gradient-to-r from-teal-500 to-cyan-400 h-2 rounded-full transition-all duration-300"
          />
        </div>
      </div>
    );
  };

  const renderAccountTypeSelection = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Account Type</h2>
        <p className="text-gray-600">Select the type of account you want to create</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`glass-medium rounded-2xl p-6 cursor-pointer border-2 transition-all ${
            accountType === 'institution' ? 'border-teal-500 bg-teal-50' : 'border-transparent'
          }`}
          onClick={() => setAccountType('institution')}
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🏫</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Institution</h3>
            <p className="text-sm text-gray-600">Schools, colleges, and educational organizations</p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`glass-medium rounded-2xl p-6 cursor-pointer border-2 transition-all ${
            accountType === 'individual' ? 'border-teal-500 bg-teal-50' : 'border-transparent'
          }`}
          onClick={() => setAccountType('individual')}
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👤</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Individual</h3>
            <p className="text-sm text-gray-600">Teachers, parents, and individual buyers</p>
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderInstitutionSteps = () => {
    switch (currentStep) {
      case 1:
        return renderAccountTypeSelection();
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Institution Information</h2>
              <p className="text-gray-600">Tell us about your institution</p>
            </div>
            
            <EdumallInput
              label="Institution Name"
              value={formData.institution_name}
              onChange={(e) => handleInputChange('institution_name', e.target.value)}
              placeholder="Enter institution name"
              required
            />
            
            <EdumallInput
              label="Centre Number"
              value={formData.centre_number}
              onChange={(e) => handleInputChange('centre_number', e.target.value)}
              placeholder="Enter centre number"
              required
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EdumallInput
                label="District"
                value={formData.district}
                onChange={(e) => handleInputChange('district', e.target.value)}
                placeholder="Select district"
                required
              />
              <EdumallInput
                label="Subcounty"
                value={formData.subcounty}
                onChange={(e) => handleInputChange('subcounty', e.target.value)}
                placeholder="Enter subcounty"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EdumallInput
                label="Parish"
                value={formData.parish}
                onChange={(e) => handleInputChange('parish', e.target.value)}
                placeholder="Enter parish"
              />
              <EdumallInput
                label="Village"
                value={formData.village}
                onChange={(e) => handleInputChange('village', e.target.value)}
                placeholder="Enter village"
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Contact Administrator</h2>
              <p className="text-gray-600">Who should we contact for this account?</p>
            </div>
            
           <EdumallInput
              label="First Name"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              placeholder="Enter first name"
              required
            />

            <EdumallInput
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              placeholder="Enter last name"
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
              <select
                value={formData.designation}
                onChange={(e) => handleInputChange('designation', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                required
              >
                <option value="">Select designation</option>
                {designationOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {formData.designation === 'Other' && (
              <EdumallInput
                label="Please specify"
                value={formData.customDesignation}
                onChange={(e) => handleInputChange('customDesignation', e.target.value)}
                placeholder="Enter your designation"
                required
              />
            )}
            
            <EdumallInput
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
              required
            />
            
            <EdumallInput
              label="Phone Number"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Enter phone number"
              required
            />
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Options</h2>
              <p className="text-gray-600">How would you like to pay for orders?</p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Select Payment Methods</h3>
              
              {[
                { id: 'mobileMoney', label: 'Mobile Money', description: 'Pay via MTN, Airtel, or other mobile money services' },
                { id: 'bankTransfer', label: 'Bank Transfer', description: 'Direct bank account transfer' },
                { id: 'cash', label: 'Cash on Delivery', description: 'Pay when items are delivered' }
              ].map((method) => (
                <div
                  key={method.id}
                  className={`glass-medium rounded-xl p-4 cursor-pointer border-2 transition-all ${
                    formData.paymentMethods.includes(method.id) ? 'border-teal-500 bg-teal-50' : 'border-transparent'
                  }`}
                  onClick={() => handlePaymentMethodToggle(method.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{method.label}</h4>
                      <p className="text-sm text-gray-600">{method.description}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      formData.paymentMethods.includes(method.id) 
                        ? 'bg-teal-500 border-teal-500' 
                        : 'border-gray-300'
                    }`}>
                      {formData.paymentMethods.includes(method.id) && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {formData.paymentMethods.includes('mobileMoney') && (
              <EdumallInput
                label="Mobile Money Number"
                value={formData.mobileMoneyNumber}
                onChange={(e) => handleInputChange('mobileMoneyNumber', e.target.value)}
                placeholder="Enter mobile money number"
              />
            )}
            
            {formData.paymentMethods.includes('bankTransfer') && (
              <EdumallInput
                label="Bank Account Number"
                value={formData.bankAccount}
                onChange={(e) => handleInputChange('bankAccount', e.target.value)}
                placeholder="Enter bank account number"
              />
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const renderIndividualSteps = () => {
    switch (currentStep) {
      case 1:
        return renderAccountTypeSelection();
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h2>
              <p className="text-gray-600">Create your individual account</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EdumallInput
                label="First Name"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Enter first name"
                required
              />
              <EdumallInput
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Enter last name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">You are</label>
              <select
                value={formData.userType}
                onChange={(e) => handleInputChange('userType', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                required
              >
                <option value="">Select your role</option>
                {userTypeOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {formData.userType === 'Other' && (
              <EdumallInput
                label="Please specify"
                value={formData.customUserType}
                onChange={(e) => handleInputChange('customUserType', e.target.value)}
                placeholder="Enter your role"
                required
              />
            )}
            
            <EdumallInput
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
              required
            />
            
            <EdumallInput
              label="Phone Number"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Enter phone number"
              required
            />
            
            <EdumallInput
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="Enter password"
              required
            />
            
            <EdumallInput
              label="Confirm Password"
              type="password"
              value={formData.password_confirmation}
              onChange={(e) => handleInputChange('password_confirmation', e.target.value)}
              placeholder="Confirm password"
              required
            />
          </div>
        );
      default:
        return null;
    }
  };

  const isLastStep = () => {
    return currentStep === (accountType === 'institution' ? 4 : 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <CustomCursor />
      <PreLoader isLoading={isRegistering} message="Creating your account..." />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        <div className="glass-strong rounded-3xl p-8">
          <div className="text-center mb-8">
            {/* Clickable Logo */}
            <Link to="/" className="inline-block mb-6 hover:scale-105 transition-transform">
              <img 
                src="/img/logo.png" 
                alt="Edumall" 
                className="h-12 w-auto mx-auto"
              />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">Join thousands of institutions and individuals</p>
          </div>

          {currentStep > 1 && renderProgressBar()}

          <form onSubmit={handleSubmit}>
            {accountType === 'institution' ? renderInstitutionSteps() : renderIndividualSteps()}

            <div className="flex items-center justify-between mt-8">
              {currentStep > 1 ? (
                <EdumallButton
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={prevStep}
                >
                  <ChevronLeft size={20} />
                  Previous
                </EdumallButton>
              ) : (
                <div></div>
              )}

              {currentStep === 1 && accountType ? (
                <EdumallButton
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={nextStep}
                >
                  Continue
                  <ChevronRight size={20} />
                </EdumallButton>
              ) : isLastStep() ? (
                <EdumallButton
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isRegistering}
                >
                  {isRegistering ? 'Creating Account...' : 'Create Account'}
                </EdumallButton>
              ) : currentStep > 1 ? (
                <EdumallButton
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={nextStep}
                >
                  Next
                  <ChevronRight size={20} />
                </EdumallButton>
              ) : null}
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-teal-600 hover:text-teal-500 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
