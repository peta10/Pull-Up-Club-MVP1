import React from 'react';
import { Button } from '../ui/Button';
import { Link } from '../ui/Link';

const CTASection: React.FC = () => {
  return (
    <section className="bg-[#9b9b6f] py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-white mb-6">Ready to Test Your Strength?</h2>
        <p className="text-white text-xl mb-8 max-w-2xl mx-auto">
          Join hundreds of athletes already competing in the Battle Bunker Pull-Up Challenge.
          Show the world what you're capable of!
        </p>
        <Button variant="secondary" size="lg">
          <Link href="/login" className="text-white">
            Sign Up
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default CTASection;