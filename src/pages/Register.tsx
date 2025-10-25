import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { EdumallButton } from '@/components/ui/EdumallButton';
import { EdumallInput } from '@/components/ui/EdumallInput';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { PreLoader } from '@/components/ui/PreLoader';
import { useUgandaLocale } from '@/hooks/useUgandaLocale';

const Register = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [accountType, setAccountType] = useState<'institution' | 'individual'>('institution');
  const [isRegistering, setIsRegistering] = useState(false);

  const maxSteps = accountType === 'institution' ? 4 : 2;
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const { mergeGuestCart } = useCart();
  const navigate = useNavigate();

  // Use Uganda locale hook for dynamic location data
  const { districts, getCounties, getSubcounties, getParishes, getVillages, loading: locationLoading, error: locationError } = useUgandaLocale();

  // Location state for cascading dropdowns
  const [availableCounties, setAvailableCounties] = useState<string[]>([]);
  const [availableSubcounties, setAvailableSubcounties] = useState<string[]>([]);
  const [availableParishes, setAvailableParishes] = useState<string[]>([]);
  const [availableVillages, setAvailableVillages] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    institution_name: '',
    centre_number: '',
    district: '',
    county: '',
    subcounty: '',
    parish: '',
    village: '',
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    designation: '',
    customDesignation: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    userType: '',
    customUserType: '',
    paymentMethods: [] as string[],
    mobileMoneyNumber: '',
    bankAccount: '',
  });

  // New: form errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const designationOptions = ['Head-Teacher', 'Deputy Head-Teacher', 'Deputy of Studies', 'Bursar', 'Other'];
  const userTypeOptions = ['Parent', 'Student', 'Teacher', 'Guardian', 'Other'];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined })); // clear error on input

    // Handle cascading dropdowns for location fields
    if (field === 'district') {
      setAvailableCounties(getCounties(value));
      setAvailableSubcounties([]);
      setAvailableParishes([]);
      setAvailableVillages([]);
      // Clear dependent fields
      setFormData(prev => ({
        ...prev,
        county: '',
        subcounty: '',
        parish: '',
        village: ''
      }));
    } else if (field === 'county') {
      setAvailableSubcounties(getSubcounties(formData.district, value));
      setAvailableParishes([]);
      setAvailableVillages([]);
      // Clear dependent fields
      setFormData(prev => ({
        ...prev,
        subcounty: '',
        parish: '',
        village: ''
      }));
    } else if (field === 'subcounty') {
      setAvailableParishes(getParishes(formData.district, value));
      setAvailableVillages([]);
      // Clear dependent fields
      setFormData(prev => ({
        ...prev,
        parish: '',
        village: ''
      }));
    } else if (field === 'parish') {
      setAvailableVillages(getVillages(formData.district, formData.subcounty, value));
      // Clear dependent field
      setFormData(prev => ({
        ...prev,
        village: ''
      }));
    }
  };

  // Update maxSteps when accountType changes
  useEffect(() => {
    const newMaxSteps = accountType === 'institution' ? 4 : 2;
    if (currentStep > newMaxSteps) {
      setCurrentStep(newMaxSteps);
    }
  }, [accountType, currentStep]);

  const handlePaymentMethodToggle = (method: string) => {
    setFormData(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(method)
        ? prev.paymentMethods.filter(m => m !== method)
        : [...prev.paymentMethods, method]
    }));
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, maxSteps));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    setErrors({}); // reset errors

    // Client-side password validation
    if (formData.password.length < 6) {
      setErrors({ password: 'Password must be at least 6 characters' });
      setIsRegistering(false);
      return;
    }
    if (formData.password !== formData.password_confirmation) {
      setErrors({ password_confirmation: 'Passwords do not match' });
      setIsRegistering(false);
      return;
    }

    try {
      const response = await fetch('https://backend-main.laravel.cloud/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          accountType,
          ...formData,
          paymentMethods: formData.paymentMethods.join(','),
          featureFlags: accountType === 'institution' ? { labManagementEnabled: true } : undefined
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          // Map backend validation errors
          const backendErrors: { [key: string]: string } = {};
          for (const key in result.errors) {
            backendErrors[key] = result.errors[key][0];
          }
          setErrors(backendErrors);
        } else {
          alert(result.message || 'Registration failed');
        }
        setIsRegistering(false);
        return;
      }

      // Successful registration
      localStorage.setItem('token', result.token);

      login({
        id: result.user.id,
        name: `${result.user.firstName} ${result.user.lastName}`,
        email: result.user.email,
        accountType: accountType,
        type: accountType,
        phone: result.user.phone,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
      }, result.token);

      await mergeGuestCart();
      navigate('/categories');
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  const isLastStep = () => currentStep === maxSteps;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <PreLoader isLoading={isRegistering} message="Creating your account..." />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl w-full">
        <div className="glass-strong rounded-3xl p-8">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-6 hover:scale-105 transition-transform">
              <img src="/img/logo.png" alt="Edumall" className="h-12 w-auto mx-auto" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">Join thousands of institutions and individuals</p>
          </div>

          {currentStep > 1 && (
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Step {currentStep} of {maxSteps}</span>
                <span>{Math.round((currentStep / maxSteps) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStep / maxSteps) * 100}%` }}
                  className="bg-gradient-to-r from-teal-500 to-cyan-400 h-2 rounded-full transition-all duration-300"
                />
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setAccountType('institution')}
                      className={`p-4 border rounded-xl text-center transition-all ${
                        accountType === 'institution'
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="font-medium">Institution</div>
                      <div className="text-sm text-gray-500">Schools, Colleges, Universities</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccountType('individual')}
                      className={`p-4 border rounded-xl text-center transition-all ${
                        accountType === 'individual'
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="font-medium">Individual</div>
                      <div className="text-sm text-gray-500">Parents, Students, Teachers</div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {accountType === 'institution' && currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Institution Details</h3>
                {locationLoading && (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500"></div>
                    <p className="text-sm text-gray-600 mt-2">Loading location data...</p>
                  </div>
                )}
                {locationError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-600">{locationError}</p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <EdumallInput
                    label="Institution Name"
                    value={formData.institution_name}
                    onChange={(value) => handleInputChange('institution_name', value)}
                    placeholder="Enter institution name"
                    error={errors.institution_name}
                    required
                  />
                  <EdumallInput
                    label="Centre Number"
                    value={formData.centre_number}
                    onChange={(value) => handleInputChange('centre_number', value)}
                    placeholder="Enter centre number"
                    error={errors.centre_number}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                    <select
                      value={formData.district}
                      onChange={(e) => handleInputChange('district', e.target.value)}
                      className={`w-full px-3 py-3 border rounded-xl focus:ring-2 focus:border-teal-500 ${errors.district ? 'border-red-500' : 'border-gray-300'}`}
                      required
                    >
                      <option value="">Select district</option>
                      {districts.map(district => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                    {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">County</label>
                    <select
                      value={formData.county}
                      onChange={(e) => handleInputChange('county', e.target.value)}
                      className={`w-full px-3 py-3 border rounded-xl focus:ring-2 focus:border-teal-500 ${errors.county ? 'border-red-500' : 'border-gray-300'}`}
                      required
                      disabled={!formData.district}
                    >
                      <option value="">Select county</option>
                      {availableCounties.map(county => (
                        <option key={county} value={county}>{county}</option>
                      ))}
                    </select>
                    {errors.county && <p className="text-red-500 text-sm mt-1">{errors.county}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subcounty</label>
                    <select
                      value={formData.subcounty}
                      onChange={(e) => handleInputChange('subcounty', e.target.value)}
                      className={`w-full px-3 py-3 border rounded-xl focus:ring-2 focus:border-teal-500 ${errors.subcounty ? 'border-red-500' : 'border-gray-300'}`}
                      required
                      disabled={!formData.county}
                    >
                      <option value="">Select subcounty</option>
                      {availableSubcounties.map(subcounty => (
                        <option key={subcounty} value={subcounty}>{subcounty}</option>
                      ))}
                    </select>
                    {errors.subcounty && <p className="text-red-500 text-sm mt-1">{errors.subcounty}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Parish</label>
                    <select
                      value={formData.parish}
                      onChange={(e) => handleInputChange('parish', e.target.value)}
                      className={`w-full px-3 py-3 border rounded-xl focus:ring-2 focus:border-teal-500 ${errors.parish ? 'border-red-500' : 'border-gray-300'}`}
                      required
                      disabled={!formData.subcounty}
                    >
                      <option value="">Select parish</option>
                      {availableParishes.map(parish => (
                        <option key={parish} value={parish}>{parish}</option>
                      ))}
                    </select>
                    {errors.parish && <p className="text-red-500 text-sm mt-1">{errors.parish}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Village</label>
                    <select
                      value={formData.village}
                      onChange={(e) => handleInputChange('village', e.target.value)}
                      className={`w-full px-3 py-3 border rounded-xl focus:ring-2 focus:border-teal-500 ${errors.village ? 'border-red-500' : 'border-gray-300'}`}
                      required
                      disabled={!formData.parish}
                    >
                      <option value="">Select village</option>
                      {availableVillages.map(village => (
                        <option key={village} value={village}>{village}</option>
                      ))}
                    </select>
                    {errors.village && <p className="text-red-500 text-sm mt-1">{errors.village}</p>}
                  </div>
                </div>
              </div>
            )}

            {accountType === 'institution' && currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Administrator Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <EdumallInput
                    label="Administrator Name"
                    value={formData.adminName}
                    onChange={(value) => handleInputChange('adminName', value)}
                    placeholder="Enter administrator name"
                    error={errors.adminName}
                    required
                  />
                  <EdumallInput
                    label="Administrator Email"
                    type="email"
                    value={formData.adminEmail}
                    onChange={(value) => handleInputChange('adminEmail', value)}
                    placeholder="Enter administrator email"
                    error={errors.adminEmail}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <EdumallInput
                    label="Administrator Phone"
                    value={formData.adminPhone}
                    onChange={(value) => handleInputChange('adminPhone', value)}
                    placeholder="Enter administrator phone"
                    error={errors.adminPhone}
                    required
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
                    <select
                      value={formData.designation}
                      onChange={(e) => handleInputChange('designation', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:border-teal-500 ${
                        errors.designation ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    >
                      <option value="">Select designation</option>
                      {designationOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    {errors.designation && <p className="text-red-500 text-sm mt-1">{errors.designation}</p>}
                  </div>
                </div>
                {formData.designation === 'Other' && (
                  <EdumallInput
                    label="Custom Designation"
                    value={formData.customDesignation}
                    onChange={(value) => handleInputChange('customDesignation', value)}
                    placeholder="Enter custom designation"
                    error={errors.customDesignation}
                    required
                  />
                )}
              </div>
            )}

            {accountType === 'individual' && currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Personal Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <EdumallInput
                    label="First Name"
                    value={formData.firstName}
                    onChange={(value) => handleInputChange('firstName', value)}
                    placeholder="Enter first name"
                    error={errors.firstName}
                    required
                  />
                  <EdumallInput
                    label="Last Name"
                    value={formData.lastName}
                    onChange={(value) => handleInputChange('lastName', value)}
                    placeholder="Enter last name"
                    error={errors.lastName}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <EdumallInput
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(value) => handleInputChange('email', value)}
                    placeholder="Enter email"
                    error={errors.email}
                    required
                  />
                  <EdumallInput
                    label="Phone"
                    value={formData.phone}
                    onChange={(value) => handleInputChange('phone', value)}
                    placeholder="Enter phone number"
                    error={errors.phone}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">User Type</label>
                  <select
                    value={formData.userType}
                    onChange={(e) => handleInputChange('userType', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:border-teal-500 ${
                      errors.userType ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Select user type</option>
                    {userTypeOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  {errors.userType && <p className="text-red-500 text-sm mt-1">{errors.userType}</p>}
                </div>
                {formData.userType === 'Other' && (
                  <EdumallInput
                    label="Custom User Type"
                    value={formData.customUserType}
                    onChange={(value) => handleInputChange('customUserType', value)}
                    placeholder="Enter custom user type"
                    error={errors.customUserType}
                    required
                  />
                )}
              </div>
            )}

            {isLastStep() && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Account Security</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <EdumallInput
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={(value) => handleInputChange('password', value)}
                    placeholder="Enter password"
                    error={errors.password}
                    required
                  />
                  <EdumallInput
                    label="Confirm Password"
                    type="password"
                    value={formData.password_confirmation}
                    onChange={(value) => handleInputChange('password_confirmation', value)}
                    placeholder="Confirm password"
                    error={errors.password_confirmation}
                    required
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-8">
              {currentStep > 1 ? (
                <EdumallButton type="button" variant="ghost" size="md" onClick={prevStep}>
                  <ChevronLeft size={20} /> Previous
                </EdumallButton>
              ) : <div></div>}

              {currentStep === 1 ? (
                <EdumallButton type="button" variant="primary" size="md" onClick={nextStep}>
                  Continue <ChevronRight size={20} />
                </EdumallButton>
              ) : isLastStep() ? (
                <EdumallButton type="submit" variant="primary" size="md" disabled={isRegistering}>
                  {isRegistering ? 'Creating Account...' : 'Create Account'}
                </EdumallButton>
              ) : (
                <EdumallButton type="button" variant="primary" size="md" onClick={nextStep}>
                  Next <ChevronRight size={20} />
                </EdumallButton>
              )}
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-teal-600 hover:text-teal-500 font-medium">Sign in</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
