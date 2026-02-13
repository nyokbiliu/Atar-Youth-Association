import { FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const ContactSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  message: Yup.string()
    .min(10, 'Message must be at least 10 characters')
    .required('Message is required'),
});

const Contact = () => {
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      // TODO: Implement contact form submission API
      console.log('Contact form submitted:', values);
      alert('Thank you for your message! We will get back to you soon.');
      resetForm();
    } catch (error) {
      console.error('Error submitting contact form:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="section-title">Contact Us</h1>
          <p className="text-muted max-w-3xl mx-auto">
            We'd love to hear from you! Get in touch with us using the form below or through our contact details.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
            <Formik
              initialValues={{ name: '', email: '', message: '' }}
              validationSchema={ContactSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, errors, touched }) => (
                <Form className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <Field
                      type="text"
                      id="name"
                      name="name"
                      className={`input-field ${
                        errors.name && touched.name ? 'border-red-500' : ''
                      }`}
                      placeholder="John Doe"
                    />
                    <ErrorMessage
                      name="name"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <Field
                      type="email"
                      id="email"
                      name="email"
                      className={`input-field ${
                        errors.email && touched.email ? 'border-red-500' : ''
                      }`}
                      placeholder="your@email.com"
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <Field
                      as="textarea"
                      id="message"
                      name="message"
                      rows="5"
                      className={`input-field ${
                        errors.message && touched.message ? 'border-red-500' : ''
                      }`}
                      placeholder="Your message here..."
                    />
                    <ErrorMessage
                      name="message"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <FiSend className="mr-2" />
                        Send Message
                      </>
                    )}
                  </button>
                </Form>
              )}
            </Formik>
          </div>

          {/* Contact Information */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <FiMail className="w-6 h-6 text-primary-600 mt-1 mr-4" />
                <div>
                  <h3 className="font-semibold mb-1">Email</h3>
                  <p className="text-muted">info@ataryouth.org</p>
                  <p className="text-muted">admin@ataryouth.org</p>
                </div>
              </div>

              <div className="flex items-start">
                <FiPhone className="w-6 h-6 text-primary-600 mt-1 mr-4" />
                <div>
                  <h3 className="font-semibold mb-1">Phone</h3>
                  <p className="text-muted">+211 912 345 678</p>
                  <p className="text-muted">+211 923 456 789</p>
                </div>
              </div>

              <div className="flex items-start">
                <FiMapPin className="w-6 h-6 text-primary-600 mt-1 mr-4" />
                <div>
                  <h3 className="font-semibold mb-1">Address</h3>
                  <p className="text-muted">
                    Atar Youth Association<br />
                    Juba, Central Equatoria<br />
                    South Sudan
                  </p>
                </div>
              </div>
            </div>

            {/* Office Hours */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-semibold mb-2">Office Hours</h3>
              <p className="text-muted">
                Monday - Friday: 8:00 AM - 5:00 PM<br />
                Saturday: 9:00 AM - 1:00 PM<br />
                Sunday: Closed
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;