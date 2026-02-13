import { FiUsers, FiTarget, FiAward, FiHeart } from 'react-icons/fi';

const About = () => {
  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="section-title">About Atar Youth Association</h1>
          <p className="text-muted max-w-3xl mx-auto">
            Empowering youth in South Sudan through community engagement and sustainable development
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="card">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                <FiTarget className="w-6 h-6 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold">Our Mission</h2>
            </div>
            <p className="text-muted">
              Atar Youth Association is dedicated to empowering young people in South Sudan through education, 
              skills development, and community engagement. We work to create opportunities for youth to 
              become active participants in building a peaceful and prosperous future for their communities.
            </p>
          </div>

          <div className="card">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mr-4">
                <FiAward className="w-6 h-6 text-secondary-600" />
              </div>
              <h2 className="text-2xl font-bold">Our Vision</h2>
            </div>
            <p className="text-muted">
              We envision a South Sudan where every young person has access to quality education, 
              meaningful employment, and the opportunity to contribute positively to their community. 
              Through youth empowerment, we aim to build sustainable peace and development.
            </p>
          </div>
        </div>

        {/* Background */}
        <div className="card mb-16">
          <h2 className="text-2xl font-bold mb-4">Our Background</h2>
          <p className="text-muted mb-4">
            Atar Youth Association was established to address the unique challenges facing young people 
            in South Sudan. We recognize that youth represent the majority of the population and hold 
            the key to the nation's future development.
          </p>
          <p className="text-muted">
            Our programs focus on leadership development, education support, vocational training, 
            and community peace-building initiatives. We work closely with local communities, 
            government agencies, and international partners to maximize our impact.
          </p>
        </div>

        {/* Target Communities */}
        <div className="card mb-16">
          <h2 className="text-2xl font-bold mb-4">Target Communities</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-primary-50 p-4 rounded-lg">
              <FiUsers className="w-8 h-8 text-primary-600 mb-2" />
              <h3 className="font-semibold mb-2">Youth (15-35)</h3>
              <p className="text-sm text-muted">Primary beneficiaries of our programs</p>
            </div>
            <div className="bg-secondary-50 p-4 rounded-lg">
              <FiHeart className="w-8 h-8 text-secondary-600 mb-2" />
              <h3 className="font-semibold mb-2">Vulnerable Groups</h3>
              <p className="text-sm text-muted">Women, disabled youth, and displaced persons</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <FiTarget className="w-8 h-8 text-gray-600 mb-2" />
              <h3 className="font-semibold mb-2">Local Communities</h3>
              <p className="text-sm text-muted">Villages and towns across South Sudan</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Join Our Mission</h2>
          <p className="text-muted mb-6">
            Together, we can create lasting change for South Sudanese youth
          </p>
          <a href="/register" className="btn-primary inline-flex items-center">
            Get Involved
          </a>
        </div>
      </div>
    </div>
  );
};

export default About;