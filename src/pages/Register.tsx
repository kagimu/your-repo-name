import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { EdumallButton } from '@/components/ui/EdumallButton';
import { EdumallInput } from '@/components/ui/EdumallInput';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { PreLoader } from '@/components/ui/PreLoader';

const Register = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [accountType, setAccountType] = useState<'institution' | 'individual'>('institution');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const { mergeGuestCart } = useCart();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    institution_name: '',
    centre_number: '',
    district: '',
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

  const designationOptions = ['Head-Teacher','Deputy Head-Teacher','Deputy of Studies','Bursar','Other'];
  const userTypeOptions = ['Parent','Student','Teacher','Guardian','Other'];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined })); // clear error on input
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

  const isLastStep = () => currentStep === (accountType === 'institution' ? 4 : 2);

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
                <span>Step {currentStep} of {accountType === 'institution' ? 4 : 2}</span>
                <span>{Math.round((currentStep / (accountType === 'institution' ? 4 : 2)) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStep / (accountType === 'institution' ? 4 : 2)) * 100}%` }}
                  className="bg-gradient-to-r from-teal-500 to-cyan-400 h-2 rounded-full transition-all duration-300"
                />
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Here you can reuse your existing step rendering functions */}
            {/* ...Insert renderInstitutionSteps and renderIndividualSteps code here, 
                 but pass down `errors` and show error messages under each field as done in login page */}
            
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
