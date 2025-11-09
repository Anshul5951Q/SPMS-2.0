import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Lock } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const { changePassword, error: authError } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };
  
  const validateForm = () => {
    let valid = true;
    const newErrors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
      valid = false;
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
      valid = false;
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'New password must be at least 6 characters';
      valid = false;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      valid = false;
    }
    
    setFormErrors(newErrors);
    return valid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setSuccessMessage('');
    
    try {
      await changePassword(formData.currentPassword, formData.newPassword);
      setSuccessMessage('Password changed successfully. You will be logged out.');
      
      // Wait for 2 seconds to show the success message
      setTimeout(() => {
        onClose();
        // Force a page reload to clear any cached state
        window.location.href = '/login';
      }, 2000);
    } catch (err) {
      // Error is handled in AuthContext
      console.error('Password change error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change Password"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {authError && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {authError}
            </div>
          )}
          
          {successMessage && (
            <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm">
              {successMessage}
            </div>
          )}
          
          <Input
            label="Current Password"
            name="currentPassword"
            type="password"
            placeholder="••••••••"
            value={formData.currentPassword}
            onChange={handleChange}
            error={formErrors.currentPassword}
            leftIcon={<Lock size={16} />}
            fullWidth
          />
          
          <Input
            label="New Password"
            name="newPassword"
            type="password"
            placeholder="••••••••"
            value={formData.newPassword}
            onChange={handleChange}
            error={formErrors.newPassword}
            leftIcon={<Lock size={16} />}
            fullWidth
          />
          
          <Input
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={formErrors.confirmPassword}
            leftIcon={<Lock size={16} />}
            fullWidth
          />
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
            >
              Change Password
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default ChangePasswordModal; 