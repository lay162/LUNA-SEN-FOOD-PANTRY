import React, { useEffect } from 'react';
import Card, { GiftIcon, HeartIcon, PhoneIcon } from '../components/Card';
import Button from '../components/Button';

const Donate = () => {
  useEffect(() => {
    document.title = 'Donate to LUNA SEN PANTRY - Help Wirral Families | Food & Money Donations';
  }, []);

  const donationMethods = [
    {
      variant: 'primary',
      icon: HeartIcon,
      title: 'Money Donations',
      description: 'Direct financial support helps us buy exactly what families need, including specialty items for SEN requirements.',
      action: (
        <div className="space-y-4">
          <Button variant="primary" size="lg" className="w-full" disabled>
            Donate online (coming soon)
          </Button>
          <p className="text-xs text-gray-500">Payment links will be added once our official checkout is live.</p>
        </div>
      )
    },
    {
      variant: 'gradient',
      icon: GiftIcon,
      title: 'Food Donations',
      description: 'Drop off food items at our collection points or arrange collection from you. We especially need SEN-friendly foods.',
      action: (
        <div className="space-y-3">
          <Button variant="gradient" size="lg" className="w-full">
            View Drop-off Locations
          </Button>
          <Button variant="secondary" size="sm" className="w-full">
            Request Collection
          </Button>
        </div>
      )
    },
    {
      variant: 'secondary',
      icon: PhoneIcon,
      title: 'Corporate Support',
      description: 'Business partnerships, regular donations, or employee fundraising. Help us help more Wirral families.',
      action: (
        <Button variant="secondary" size="lg" className="w-full">
          Contact for Partnership
        </Button>
      )
    }
  ];

  return (
    <div className="luna-page luna-container">
      {/* Hero Section */}
      <div className="luna-page-header">
        <h1 className="luna-page-title">Help Wirral Families</h1>
        <p className="luna-page-subtitle">Your donation directly supports families with SEN and sensory needs</p>
        <p className="text-lg opacity-90 max-w-2xl mx-auto">Every contribution, big or small, makes a real difference to local families in crisis</p>
      </div>

      {/* Donation Methods */}
      <section className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ways to Donate to <span className="luna-text-gradient">LUNA</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the method that works best for you - all donations stay local and help Wirral families
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {donationMethods.map((method, index) => (
            <Card
              key={index}
              variant={method.variant}
              icon={method.icon}
              title={method.title}
              description={method.description}
              action={method.action}
              className="h-full flex flex-col"
            />
          ))}
        </div>
        {/* Quick PayPal donation */}
        <div className="bg-white rounded-lg shadow-md p-8 text-center mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Quick Donation</h3>
          <p className="text-gray-600 mb-6">Make an instant impact - suggested amounts</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {['£5', '£10', '£25', '£50'].map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="lg"
                className="w-full hover:border-luna-pink hover:text-luna-pink"
                disabled
              >
                {amount}
              </Button>
            ))}
          </div>
          <div className="text-sm text-gray-500 space-y-1">
            <p><strong>£5</strong> provides a family meal for 2</p>
            <p><strong>£10</strong> covers basic groceries for a single person</p>
            <p><strong>£25</strong> supports a family of 4 for several days</p>
            <p><strong>£50</strong> provides a week of essentials plus specialty SEN foods</p>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Your Impact
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how your donations make a real difference to Wirral families
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-luna-pink text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                95%
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Local Families</h3>
              <p className="text-gray-600">of our support goes to families with SEN or disabilities</p>
            </div>
            <div className="text-center">
              <div className="bg-luna-blue text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                48h
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Response Time</h3>
              <p className="text-gray-600">from referral to food support delivered</p>
            </div>
            <div className="text-center">
              <div className="bg-luna-pink text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                £1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Goes Further</h3>
              <p className="text-gray-600">provides £3 worth of food through bulk buying</p>
            </div>
          </div>
          <div className="mt-16 bg-gray-50 rounded-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Recent Impact</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-luna-pink mb-2">127</div>
                <div className="text-sm text-gray-600">Families helped this month</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-luna-blue mb-2">89%</div>
                <div className="text-sm text-gray-600">Had SEN requirements</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-luna-pink mb-2">2.4t</div>
                <div className="text-sm text-gray-600">Food distributed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-luna-blue mb-2">£12k</div>
                <div className="text-sm text-gray-600">Donated this month</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-luna-gradient text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Help Local Families?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Every donation stays local and directly helps Wirral families in need
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Button variant="secondary" size="xl" className="w-full bg-white text-luna-pink hover:bg-gray-100" disabled>
              Donate online (coming soon)
            </Button>
            <a href="tel:07123456789" className="block">
              <Button variant="outline" size="xl" className="w-full border-white text-white hover:bg-white hover:text-luna-pink">
                Arrange Food Collection
              </Button>
            </a>
          </div>
          <div className="mt-8 pt-8 border-t border-white border-opacity-20">
            <p className="text-sm opacity-75 mb-4">Quick access via QR code:</p>
            <div className="flex justify-center">
              <div className="text-center bg-white p-4 rounded-lg">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://luna-sen-food-pantry.netlify.app/donate"
                  alt="QR code for donations page"
                  className="w-24 h-24 mx-auto mb-2"
                />
                <p className="text-xs text-gray-600">Scan to donate</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Donate;