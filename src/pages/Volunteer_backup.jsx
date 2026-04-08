import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import FormField from '../components/FormField';
import Button from '../components/Button';
import Card, { UserGroupIcon, PhoneIcon, HeartIcon } from '../components/Card';
import { useFormValidation } from '../hooks/useFormValidation';
import { useOfflineForm } from '../hooks/useOfflineForm';

const Volunteer = () => {
  const [searchParams] = useSearchParams();
  const preferredRole = searchParams.get('role');
  
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    document.title = 'Volunteer with LUNA SEN PANTRY - Help Wirral Families | Hub & Driver Roles';
  }, []);

  const initialFormData = {
    name: '',
    email: '',
    phone: '',
    role: preferredRole || '',
    availability: '',
    experience: '',
    hasVehicle: false,
    drivingLicense: '',
    canLiftHeavy: false,
    additionalInfo: '',
    consent: false,
    references: '',
    startDate: ''
  };

  const requiredFields = ['name', 'email', 'phone', 'role', 'availability', 'consent'];

  const { formData, errors, touched, updateField, touchField, validateForm, resetForm } = 
    useFormValidation(initialFormData, requiredFields);

  const { isSubmitting, submitStatus, networkStatus, submitForm } = 
    useOfflineForm('volunteer');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    await submitForm(formData);
    
    if (submitStatus?.success) {
      setShowForm(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const volunteerRoles = [
    {
      variant: 'pink',
      icon: HeartIcon,
      title: 'Hub Volunteer',
      description: 'Sort donations, pack food parcels, and welcome families at our community hub. Perfect for those who want regular, structured volunteering.',
      requirements: [
        'Friendly and patient approach',
        'Understanding of SEN needs helpful',
        'Able to lift light-medium items',
        'Flexible 2-4 hour shifts'
      ],
      commitment: 'Weekly shifts available',
      action: (
        <Button 
          variant="primary" 
          size="lg" 
          className="w-full"
          onClick={() => {
            updateField('role', 'hub');
            setShowForm(true);
          }}
        >
          Apply for Hub Role
        </Button>
      )
    },
    {
      variant: 'gradient',
      icon: PhoneIcon,
      title: 'Delivery Driver',
      description: 'Deliver food parcels directly to families who cannot collect. Essential for supporting isolated families and those with mobility challenges.',
      requirements: [
        'Full driving license',
        'Own vehicle with insurance',
        'Comfortable lifting 10-20kg',
        'Flexible daytime availability'
      ],
      commitment: 'Ad-hoc deliveries, typically 2-3 per week',
      action: (
        <Button 
          variant="gradient" 
          size="lg" 
          className="w-full"
          onClick={() => {
            updateField('role', 'driver');
            setShowForm(true);
          }}
        >
          Apply as Driver
        </Button>
      )
    },
    {
      variant: 'blue',
      icon: UserGroupIcon,
      title: 'Support Volunteer',
      description: 'Help with admin, social media, fundraising, or special projects. Use your skills to support operations behind the scenes.',
      requirements: [
        'Specific skills (admin, marketing, etc)',
        'Home-based or hub-based',
        'Good communication skills',
        'Reliable internet connection'
      ],
      commitment: 'Flexible hours, project-based',
      action: (
        <Button 
          variant="outline" 
          size="lg" 
          className="w-full border-luna-blue text-luna-blue hover:bg-luna-blue hover:text-white"
          onClick={() => {
            updateField('role', 'support');
            setShowForm(true);
          }}
        >
          Apply for Support Role
        </Button>
      )
    }
  ];

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <button
              onClick={() => setShowForm(false)}
              className="inline-flex items-center text-luna-pink hover:text-pink-600 mb-4 focus-visible"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Volunteer Roles
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Volunteer Application
            </h1>
            <p className="text-lg text-gray-600">
              {formData.role === 'hub' ? 'Hub Volunteer Application' :
               formData.role === 'driver' ? 'Delivery Driver Application' :
               formData.role === 'support' ? 'Support Volunteer Application' :
               'General Volunteer Application'}
            </p>
          </div>

          {/* Offline indicator */}
          {!networkStatus && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Offline mode:</strong> Your application will be saved and sent when connection returns.
              </p>
            </div>
          )}

          <div className="bg-white shadow rounded-lg">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              {/* Personal Information */}
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                </div>

                <FormField
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={updateField}
                  onBlur={touchField}
                  error={touched.name ? errors.name : ''}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={updateField}
                    onBlur={touchField}
                    error={touched.email ? errors.email : ''}
                    required
                  />

                  <FormField
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={updateField}
                    onBlur={touchField}
                    error={touched.phone ? errors.phone : ''}
                    required
                  />
                </div>
              </div>

              {/* Role and Availability */}
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Role & Availability</h2>
                </div>

                <FormField
                  label="Preferred Role"
                  name="role"
                  type="radio"
                  value={formData.role}
                  onChange={updateField}
                  onBlur={touchField}
                  error={touched.role ? errors.role : ''}
                  required
                  options={[
                    { value: 'hub', label: 'Hub Volunteer - Sort and pack donations at our community centre' },
                    { value: 'driver', label: 'Delivery Driver - Deliver food parcels to families' },
                    { value: 'support', label: 'Support Volunteer - Admin, social media, fundraising, projects' },
                    { value: 'any', label: 'Any role - I\'m flexible and happy to help where needed' }
                  ]}
                />

                <FormField
                  label="When are you available?"
                  name="availability"
                  type="textarea"
                  value={formData.availability}
                  onChange={updateField}
                  onBlur={touchField}
                  error={touched.availability ? errors.availability : ''}
                  required
                  placeholder="e.g., Weekday mornings, Saturday afternoons, flexible weekdays, evenings only..."
                  helpText="Please be as specific as possible about days and times"
                />

                <FormField
                  label="When would you like to start?"
                  name="startDate"
                  type="select"
                  value={formData.startDate}
                  onChange={updateField}
                  onBlur={touchField}
                  error={touched.startDate ? errors.startDate : ''}
                  options={[
                    { value: 'immediately', label: 'Immediately' },
                    { value: '1-2weeks', label: 'In 1-2 weeks' },
                    { value: '1month', label: 'In about a month' },
                    { value: 'flexible', label: 'Flexible - when you need me' }
                  ]}
                />
              </div>

              {/* Driver-specific questions */}
              {(formData.role === 'driver' || formData.role === 'any') && (
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Driver Information</h2>
                    <p className="text-sm text-gray-600 mt-1">Only if applying for delivery driver role</p>
                  </div>

                  <FormField
                    label="Do you have your own vehicle?"
                    name="hasVehicle"
                    type="checkbox"
                    value={formData.hasVehicle}
                    onChange={updateField}
                  />

                  {formData.hasVehicle && (
                    <FormField
                      label="Driving License Details"
                      name="drivingLicense"
                      type="textarea"
                      value={formData.drivingLicense}
                      onChange={updateField}
                      onBlur={touchField}
                      error={touched.drivingLicense ? errors.drivingLicense : ''}
                      placeholder="e.g., Full UK license held for 5 years, clean record..."
                      helpText="Include license type, how long held, and any relevant details"
                    />
                  )}

                  <FormField
                    label="Can you comfortably lift and carry items up to 20kg?"
                    name="canLiftHeavy"
                    type="checkbox"
                    value={formData.canLiftHeavy}
                    onChange={updateField}
                    helpText="Food parcels can be heavy - please only check if you're comfortable with this"
                  />
                </div>
              )}

              {/* Experience and Skills */}
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Experience & Skills</h2>
                </div>

                <FormField
                  label="Previous volunteering or relevant experience"
                  name="experience"
                  type="textarea"
                  value={formData.experience}
                  onChange={updateField}
                  onBlur={touchField}
                  error={touched.experience ? errors.experience : ''}
                  placeholder="e.g., Volunteered at foodbank, worked with children, experience with SEN, customer service..."
                  helpText="Any experience working with vulnerable groups, SEN families, or in caring roles"
                />

                <FormField
                  label="References"
                  name="references"
                  type="textarea"
                  value={formData.references}
                  onChange={updateField}
                  onBlur={touchField}
                  error={touched.references ? errors.references : ''}
                  placeholder="Name, relationship, and contact details for 2 references..."
                  helpText="We'll need 2 references before you can start volunteering"
                />

                <FormField
                  label="Anything else we should know?"
                  name="additionalInfo"
                  type="textarea"
                  value={formData.additionalInfo}
                  onChange={updateField}
                  onBlur={touchField}
                  error={touched.additionalInfo ? errors.additionalInfo : ''}
                  placeholder="e.g., Specific skills, languages spoken, accessibility needs, questions about the role..."
                />
              </div>

              {/* Consent */}
              <div className="space-y-6">
                <FormField
                  label="I consent to LUNA SEN PANTRY processing my information for volunteer applications, conducting background checks if required, and contacting me about volunteering opportunities. I understand this information will be kept confidential."
                  name="consent"
                  type="checkbox"
                  value={formData.consent}
                  onChange={updateField}
                  onBlur={touchField}
                  error={touched.consent ? errors.consent : ''}
                  required
                />
              </div>

              {/* Submit */}
              <div className="pt-6 border-t">
                <Button
                  type="submit"
                  variant="gradient"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  size="lg"
                  className="w-full"
                >
                  Submit Application
                </Button>
              </div>

              {/* Submit status */}
              {submitStatus && (
                <div className={`p-4 rounded-md ${submitStatus.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <p className={`text-sm ${submitStatus.success ? 'text-green-800' : 'text-red-800'}`}>
                    {submitStatus.message}
                  </p>
                  {submitStatus.success && (
                    <div className="mt-3">
                      <p className="text-sm text-green-700">
                        <strong>What happens next:</strong>
                      </p>
                      <ul className="list-disc list-inside text-sm text-green-700 mt-2 space-y-1">
                        <li>We'll contact you within 48 hours to discuss your application</li>
                        <li>If suitable, we'll arrange an informal chat and reference checks</li>
                        <li>We'll provide full training and support before you start</li>
                        <li>You'll be matched with experienced volunteers for your first few shifts</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-luna-gradient text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Volunteer with Us
          </h1>
          <p className="text-xl md:text-2xl mb-4 max-w-3xl mx-auto">
            Join our team supporting Wirral families with SEN and sensory needs
          </p>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Make a real difference in your local community - flexible roles to suit your skills and availability
          </p>
        </div>
      </section>

      {/* Why Volunteer */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Volunteer with Luna SEN Pantry?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Be part of something special - supporting families who need understanding and care
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-luna-pink text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                💖
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Make Real Impact</h3>
              <p className="text-gray-600">Directly help families in crisis with understanding and dignity</p>
            </div>
            
            <div className="text-center">
              <div className="bg-luna-blue text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                🕐
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Flexible Hours</h3>
              <p className="text-gray-600">Volunteer when it suits you - from 2 hours to regular commitment</p>
            </div>
            
            <div className="text-center">
              <div className="bg-luna-pink text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                🎓
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Full Training</h3>
              <p className="text-gray-600">Complete training on SEN awareness and food safety provided</p>
            </div>
            
            <div className="text-center">
              <div className="bg-luna-blue text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                👥
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Great Team</h3>
              <p className="text-gray-600">Join our supportive community of volunteers who really care</p>
            </div>
          </div>
        </div>
      </section>

      {/* Volunteer Roles */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Volunteer Roles
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose a role that matches your skills, interests and availability
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {volunteerRoles.map((role, index) => (
              <div key={index} className="h-full">
                <Card
                  variant={role.variant}
                  icon={role.icon}
                  title={role.title}
                  description={role.description}
                  className="h-full flex flex-col"
                >
                  <div className="flex-grow">
                    <h4 className="font-semibold text-gray-900 mb-2">Requirements:</h4>
                    <ul className="text-sm text-gray-600 space-y-1 mb-4">
                      {role.requirements.map((req, reqIndex) => (
                        <li key={reqIndex} className="flex items-start">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                          {req}
                        </li>
                      ))}
                    </ul>
                    <p className="text-sm text-gray-500 mb-6">
                      <strong>Commitment:</strong> {role.commitment}
                    </p>
                  </div>
                  {role.action}
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Volunteer Journey */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Your Volunteer Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From application to making a difference - here's what to expect
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-luna-pink text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Apply</h3>
              <p className="text-sm text-gray-600">Fill out our simple application form - takes 5 minutes</p>
            </div>

            <div className="text-center">
              <div className="bg-luna-blue text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Chat</h3>
              <p className="text-sm text-gray-600">Informal phone or video call to discuss the role and answer questions</p>
            </div>

            <div className="text-center">
              <div className="bg-luna-pink text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Training</h3>
              <p className="text-sm text-gray-600">SEN awareness, food safety, and role-specific training provided</p>
            </div>

            <div className="text-center">
              <div className="bg-luna-blue text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Start</h3>
              <p className="text-sm text-gray-600">Begin volunteering with full support and mentoring</p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h3>
              <p className="text-gray-600 mb-6">
                Apply now or get in touch if you have any questions about volunteering
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="w-full"
                  onClick={() => setShowForm(true)}
                >
                  Apply to Volunteer
                </Button>
                <a href="tel:07718851362" className="block">
                  <Button variant="outline" size="lg" className="w-full">
                    Call to Discuss
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Common Questions
            </h2>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Do I need experience with SEN families?</h3>
              <p className="text-gray-600">No experience needed! We provide full SEN awareness training and pair new volunteers with experienced team members.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How much time do I need to commit?</h3>
              <p className="text-gray-600">It's flexible! From 2-hour one-off sessions to regular weekly shifts. We work around your availability.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What about insurance and safety?</h3>
              <p className="text-gray-600">All volunteers are covered by our insurance. We provide safety training and equipment. Your wellbeing is our priority.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I volunteer if I receive benefits?</h3>
              <p className="text-gray-600">Yes! Volunteering doesn't affect most benefits. We can provide letters confirming your volunteer status if needed.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Do you need references and checks?</h3>
              <p className="text-gray-600">We ask for 2 references and may conduct DBS checks for certain roles. We'll guide you through the process.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Volunteer;