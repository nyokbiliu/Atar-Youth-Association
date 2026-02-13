import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiSmartphone, FiMapPin, FiCalendar, FiEye, FiEyeOff, FiCheckCircle } from 'react-icons/fi';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { authAPI } from '../services/api';

const RegisterSchema = Yup.object().shape({
  full_name: Yup.string().min(2, 'Too short').max(50, 'Too long').required('Full name required'),
  email: Yup.string().email('Invalid email').required('Email required'),
  phone: Yup.string()
    .matches(/^\+211\d{9}$/, 'Must be South Sudan format: +211XXXXXXXXX')
    .required('Phone required'),
  password: Yup.string().min(6, 'Min 6 characters').required('Password required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password'),
  gender: Yup.string().required('Gender required'),
  date_of_birth: Yup.date()
    .max(new Date(Date.now() - 86400000 * 365 * 13), 'Must be at least 13 years old')
    .required('Date of birth required'),
  county: Yup.string().required('County required'),
  payam: Yup.string().required('Payam required'),
});

const Register = ({ onSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isRedirectFromLogin = searchParams.get('registered') === 'true';

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      const response = await authAPI.register(values);
      
      if (response.success) {
        // Show success message then redirect
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (error) {
      console.error('Registration error:', error);
      const msg = error.response?.data?.message || 'Registration failed. Please try again.';
      if (msg.includes('already')) {
        if (msg.includes('email')) setFieldError('email', 'Email already registered');
        if (msg.includes('phone')) setFieldError('phone', 'Phone already registered');
      } else {
        setFieldError('full_name', msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        {isRedirectFromLogin && (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center space-x-3 mb-6">
            <FiCheckCircle className="w-6 h-6 flex-shrink-0" />
            <div>
              <p className="font-medium">Registration successful!</p>
              <p className="text-sm">Please login with your credentials to continue.</p>
            </div>
          </div>
        )}
        
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">AY</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Join Atar Youth</h2>
          <p className="mt-2 text-gray-600">Create your account to participate in community initiatives</p>
        </div>

        <Formik
          initialValues={{
            full_name: '',
            email: '',
            phone: '+211',
            password: '',
            confirmPassword: '',
            gender: 'male',
            date_of_birth: '',
            county: '',
            payam: ''
          }}
          validationSchema={RegisterSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched, values }) => (
            <Form className="space-y-6">
              {/* Personal Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Field
                      type="text"
                      name="full_name"
                      className={`input-field pl-10 ${errors.full_name && touched.full_name ? 'border-red-500' : ''}`}
                      placeholder="John Doe"
                    />
                  </div>
                  <ErrorMessage name="full_name" component="div" className="text-red-500 text-sm mt-1" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <Field as="select" name="gender" className="input-field">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </Field>
                </div>
              </div>

              {/* Contact Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Field
                      type="email"
                      name="email"
                      className={`input-field pl-10 ${errors.email && touched.email ? 'border-red-500' : ''}`}
                      placeholder="you@example.com"
                    />
                  </div>
                  <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <FiSmartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Field
                      type="tel"
                      name="phone"
                      className={`input-field pl-10 ${errors.phone && touched.phone ? 'border-red-500' : ''}`}
                      placeholder="+211912345678"
                    />
                  </div>
                  <ErrorMessage name="phone" component="div" className="text-red-500 text-sm mt-1" />
                  <p className="text-xs text-gray-500 mt-1">South Sudan format: +211XXXXXXXXX</p>
                </div>
              </div>

              {/* Location Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">County</label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Field
                      type="text"
                      name="county"
                      className={`input-field pl-10 ${errors.county && touched.county ? 'border-red-500' : ''}`}
                      placeholder="Central Equatoria"
                    />
                  </div>
                  <ErrorMessage name="county" component="div" className="text-red-500 text-sm mt-1" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payam</label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Field
                      type="text"
                      name="payam"
                      className={`input-field pl-10 ${errors.payam && touched.payam ? 'border-red-500' : ''}`}
                      placeholder="Juba"
                    />
                  </div>
                  <ErrorMessage name="payam" component="div" className="text-red-500 text-sm mt-1" />
                </div>
              </div>

              {/* DOB & Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Field
                      type="date"
                      name="date_of_birth"
                      className={`input-field pl-10 ${errors.date_of_birth && touched.date_of_birth ? 'border-red-500' : ''}`}
                    />
                  </div>
                  <ErrorMessage name="date_of_birth" component="div" className="text-red-500 text-sm mt-1" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Field
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      className={`input-field pl-10 pr-12 ${errors.password && touched.password ? 'border-red-500' : ''}`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Field
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    className={`input-field pl-10 pr-12 ${errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : ''}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                <ErrorMessage name="confirmPassword" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                  I agree to the{' '}
                  <Link to="/terms" className="text-primary-600 hover:text-primary-700 font-medium">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-primary-600 hover:text-primary-700 font-medium">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full py-3 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </Form>
          )}
        </Formik>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;