import { useState, useEffect } from 'react';
import { FiArrowRight, FiCalendar, FiUsers, FiActivity } from 'react-icons/fi';
import axios from 'axios';
import { API_BASE_URL } from '../services/api';

const Home = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/news?limit=3`);
      setNews(response.data.news || []);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-primary-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-primary-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Building a Better Future for South Sudanese Youth
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto">
              Atar Youth Association empowers young people through education, community development, and peace-building initiatives.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/register" className="btn-primary inline-flex items-center justify-center">
                Join Us <FiArrowRight className="ml-2" />
              </a>
              <a href="/about" className="bg-white text-primary-600 hover:bg-gray-100 font-medium py-2 px-6 rounded-lg transition-colors duration-200 inline-flex items-center justify-center">
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiUsers className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Youth Empowerment</h3>
              <p className="text-muted">
                Programs designed to develop leadership skills and create opportunities for young people.
              </p>
            </div>

            <div className="card text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiActivity className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Community Projects</h3>
              <p className="text-muted">
                Ongoing initiatives addressing local challenges and promoting sustainable development.
              </p>
            </div>

            <div className="card text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiCalendar className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Events & Activities</h3>
              <p className="text-muted">
                Regular programs, workshops, and community gatherings to engage and educate youth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Latest News & Announcements</h2>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-12 text-muted">
              <p>No news available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {news.map((item) => (
                <div key={item.id} className="card hover:shadow-xl transition-shadow">
                  <div className="mb-4">
                    <span className="text-sm text-primary-600 font-medium">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-muted mb-4 line-clamp-3">{item.content}</p>
                  <a href={`/news/${item.id}`} className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center">
                    Read More <FiArrowRight className="ml-2 w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <a href="/news" className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center">
              View All News <FiArrowRight className="ml-2 w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
            Join our community of changemakers and help build a brighter future for South Sudan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/register" className="bg-white text-primary-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg transition-colors duration-200 inline-flex items-center justify-center">
              Register Now
            </a>
            <a href="/contact" className="bg-primary-700 hover:bg-primary-800 font-medium py-3 px-8 rounded-lg transition-colors duration-200 inline-flex items-center justify-center">
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;