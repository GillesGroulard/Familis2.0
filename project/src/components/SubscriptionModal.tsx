import React from 'react';
import { X, CreditCard, Users } from 'lucide-react';
import type { Family } from '../types';

interface SubscriptionModalProps {
  families: Family[];
  totalCost: number;
  onClose: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  families,
  totalCost,
  onClose,
}) => {
  const annualCost = totalCost * 12;
  const perPersonCost = families.length > 0 ? totalCost / families.length : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full relative animate-scale-up">
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 p-2 bg-white rounded-full shadow-lg text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CreditCard className="w-6 h-6 text-primary-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">
            Subscription Management
          </h2>
        </div>

        <div className="space-y-6">
          {/* Subscription Overview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Active Families</span>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-800">{families.length}</span>
              </div>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Monthly Cost</span>
              <span className="font-medium text-gray-800">€{totalCost}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Annual Cost</span>
              <span className="font-medium text-gray-800">€{annualCost}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Cost per Family</span>
              <span className="font-medium text-gray-800">€{perPersonCost.toFixed(2)}</span>
            </div>
          </div>

          {/* Family List */}
          <div className="space-y-2">
            <h3 className="font-medium text-gray-700 mb-3">Your Families</h3>
            {families.map((family) => (
              <div
                key={family.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {family.family_picture ? (
                    <img
                      src={family.family_picture}
                      alt={family.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-primary-600" />
                    </div>
                  )}
                  <span className="font-medium text-gray-800">
                    {family.display_name || family.name}
                  </span>
                </div>
                <span className="text-gray-600">€10/month</span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => {/* Placeholder for renewal action */}}
              className="w-full bg-primary-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-600 transition-colors"
            >
              Renew Subscription
            </button>
            <button
              onClick={() => {/* Placeholder for payment method action */}}
              className="w-full bg-white text-primary-600 border-2 border-primary-500 py-2 px-4 rounded-lg font-medium hover:bg-primary-50 transition-colors"
            >
              Manage Payment Method
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};