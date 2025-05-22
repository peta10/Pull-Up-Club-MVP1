import React from 'react';
import Layout from '../components/Layout/Layout';
import VideoSubmissionForm from '../components/Submission/VideoSubmissionForm';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const VideoSubmissionPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // If user is not authenticated, redirect to submission page
  React.useEffect(() => {
    if (!user) {
      navigate('/submit');
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <Layout>
      <div className="bg-black py-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">Submit Your Pull-Up Video</h1>
            <p className="mt-2 text-gray-400">
              Please ensure your video follows our submission guidelines before uploading.
            </p>
          </div>
          
          <VideoSubmissionForm />
        </div>
      </div>
    </Layout>
  );
};

export default VideoSubmissionPage;