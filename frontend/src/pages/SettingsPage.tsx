import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Bell, Shield, CreditCard, Mail } from 'lucide-react';
import ChangePasswordModal from '../components/settings/ChangePasswordModal';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    reservationReminders: true,
    marketingEmails: false,
  });

  const [loading, setLoading] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  const handleNotificationChange = (setting: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="space-y-6">
        <Card>
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Mail size={20} className="mr-2 text-blue-600" />
            Contact Information
          </h2>
          <div className="space-y-4">
            <Input
              label="Email Address"
              value={user?.email}
              disabled
              fullWidth
            />
            <Input
              label="Phone Number"
              value="+91 98765 43210"
              disabled
              fullWidth
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Bell size={20} className="mr-2 text-blue-600" />
            Notification Preferences
          </h2>
          <div className="space-y-4">
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-gray-700">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={value}
                    onChange={() => handleNotificationChange(key as keyof typeof notifications)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <CreditCard size={20} className="mr-2 text-blue-600" />
            Payment Methods
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-md">
              <div className="flex items-center">
                <CreditCard size={24} className="text-gray-500 mr-3" />
                <div>
                  <p className="font-medium">Visa ending in 1234</p>
                  <p className="text-sm text-gray-500">Expires 12/25</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Edit</Button>
            </div>
            <Button variant="outline" fullWidth>Add New Payment Method</Button>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Shield size={20} className="mr-2 text-blue-600" />
            Security
          </h2>
          <div className="space-y-4">
            <Button 
              variant="outline" 
              fullWidth
              onClick={() => setShowChangePasswordModal(true)}
            >
              Change Password
            </Button>
            <Button variant="outline" fullWidth>Enable Two-Factor Authentication</Button>
          </div>
        </Card>

        <div className="flex justify-end space-x-3">
          <Button variant="outline">Cancel</Button>
          <Button
            variant="primary"
            onClick={handleSave}
            isLoading={loading}
          >
            Save Changes
          </Button>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />
    </div>
  );
};

export default SettingsPage;