import React, { useState } from 'react';
import { usePaymentMethodCurrency, Currency, PaymentMethod } from '../hooks/usePaymentMethodCurrency';
import { FiPlus, FiEdit2, FiTrash2, FiLoaderLoader, FiAlertCircle } from 'react-icons/fi';

export const PaymentMethodsCurrencyPage: React.FC = () => {
    const {
        currencies,
        paymentMethods,
        isLoading,
        error,
        successMessage,
        getCurrencies,
        createCurrency,
        updateCurrency,
        deleteCurrency,
        getPaymentMethods,
        createPaymentMethod,
        updatePaymentMethod,
        deletePaymentMethod,
        uploadPaymentMethodLogo,
    } = usePaymentMethodCurrency();

    const [activeTab, setActiveTab] = useState<'currencies' | 'payment-methods'>('currencies');
    const [showCurrencyForm, setShowCurrencyForm] = useState(false);
    const [showPaymentMethodForm, setShowPaymentMethodForm] = useState(false);
    const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
    const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethod | null>(null);

    // Currency Form Handler
    const handleCurrencySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        const currencyData = {
            code: formData.get('code') as string,
            name: formData.get('name') as string,
            symbol: formData.get('symbol') as string,
            value_in_usd: parseFloat(formData.get('value_in_usd') as string),
            decimal_places: parseInt(formData.get('decimal_places') as string),
            is_active: formData.get('is_active') === 'on',
            is_default: formData.get('is_default') === 'on',
        };

        if (editingCurrency) {
            await updateCurrency(editingCurrency.id, currencyData);
            setEditingCurrency(null);
        } else {
            await createCurrency(currencyData);
        }

        setShowCurrencyForm(false);
        e.currentTarget.reset();
    };

    // Payment Method Form Handler
    const handlePaymentMethodSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const methodData = {
            name: formData.get('name') as string,
            type: formData.get('type') as 'bank_account' | 'card' | 'mobile_money' | 'wallet',
            is_active: formData.get('is_active') === 'on',
            details: {},
        };

        if (editingPaymentMethod) {
            await updatePaymentMethod(editingPaymentMethod.id, methodData);
            setEditingPaymentMethod(null);
        } else {
            await createPaymentMethod(methodData);
        }

        setShowPaymentMethodForm(false);
        e.currentTarget.reset();
    };

    // Delete Currency
    const handleDeleteCurrency = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this currency?')) {
            await deleteCurrency(id);
        }
    };

    // Delete Payment Method
    const handleDeletePaymentMethod = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this payment method?')) {
            await deletePaymentMethod(id);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Configuration</h1>
                <p className="text-gray-600">Manage currencies and payment methods</p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                    <FiAlertCircle className="text-red-600" size={20} />
                    <span className="text-red-800">{error}</span>
                </div>
            )}

            {/* Success Message */}
            {successMessage && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-green-800">{successMessage}</span>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b">
                <button
                    onClick={() => setActiveTab('currencies')}
                    className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                        activeTab === 'currencies'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                >
                    Currencies ({currencies.length})
                </button>
                <button
                    onClick={() => setActiveTab('payment-methods')}
                    className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                        activeTab === 'payment-methods'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                >
                    Payment Methods ({paymentMethods.length})
                </button>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <FiLoaderLoader className="animate-spin text-blue-600" size={32} />
                </div>
            )}

            {/* Currencies Tab */}
            {activeTab === 'currencies' && !isLoading && (
                <div>
                    <div className="mb-6">
                        {!showCurrencyForm ? (
                            <button
                                onClick={() => setShowCurrencyForm(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <FiPlus size={20} />
                                Add Currency
                            </button>
                        ) : (
                            <form onSubmit={handleCurrencySubmit} className="bg-gray-50 p-6 rounded-lg">
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" name="code" placeholder="Code (USD)" className="border p-2 rounded" required />
                                    <input type="text" name="name" placeholder="Name (US Dollar)" className="border p-2 rounded" required />
                                    <input type="text" name="symbol" placeholder="Symbol ($)" className="border p-2 rounded" required />
                                    <input type="number" name="value_in_usd" placeholder="Value in USD" step="0.0001" className="border p-2 rounded" required />
                                    <input type="number" name="decimal_places" placeholder="Decimal Places" className="border p-2 rounded" required />
                                    <label className="flex items-center gap-2">
                                        <input type="checkbox" name="is_active" />
                                        <span>Active</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input type="checkbox" name="is_default" />
                                        <span>Default</span>
                                    </label>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                        {editingCurrency ? 'Update' : 'Create'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCurrencyForm(false);
                                            setEditingCurrency(null);
                                        }}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Currencies List */}
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border p-3 text-left">Code</th>
                                    <th className="border p-3 text-left">Name</th>
                                    <th className="border p-3 text-left">Symbol</th>
                                    <th className="border p-3 text-left">USD Value</th>
                                    <th className="border p-3 text-left">Decimals</th>
                                    <th className="border p-3 text-left">Active</th>
                                    <th className="border p-3 text-left">Default</th>
                                    <th className="border p-3 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currencies.map(currency => (
                                    <tr key={currency.id} className="hover:bg-gray-50">
                                        <td className="border p-3">{currency.code}</td>
                                        <td className="border p-3">{currency.name}</td>
                                        <td className="border p-3">{currency.symbol}</td>
                                        <td className="border p-3">{currency.value_in_usd}</td>
                                        <td className="border p-3">{currency.decimal_places}</td>
                                        <td className="border p-3">
                                            <span className={`px-2 py-1 rounded text-white text-sm ${currency.is_active ? 'bg-green-600' : 'bg-red-600'}`}>
                                                {currency.is_active ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td className="border p-3">
                                            <span className={`px-2 py-1 rounded text-white text-sm ${currency.is_default ? 'bg-blue-600' : 'bg-gray-400'}`}>
                                                {currency.is_default ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td className="border p-3 flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditingCurrency(currency);
                                                    setShowCurrencyForm(true);
                                                }}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                            >
                                                <FiEdit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCurrency(currency.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                                            >
                                                <FiTrash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Payment Methods Tab */}
            {activeTab === 'payment-methods' && !isLoading && (
                <div>
                    <div className="mb-6">
                        {!showPaymentMethodForm ? (
                            <button
                                onClick={() => setShowPaymentMethodForm(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <FiPlus size={20} />
                                Add Payment Method
                            </button>
                        ) : (
                            <form onSubmit={handlePaymentMethodSubmit} className="bg-gray-50 p-6 rounded-lg">
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" name="name" placeholder="Name" className="border p-2 rounded" required />
                                    <select name="type" className="border p-2 rounded" required>
                                        <option value="">Select Type</option>
                                        <option value="bank_account">Bank Account</option>
                                        <option value="card">Card</option>
                                        <option value="mobile_money">Mobile Money</option>
                                        <option value="wallet">Wallet</option>
                                    </select>
                                    <label className="flex items-center gap-2 col-span-2">
                                        <input type="checkbox" name="is_active" />
                                        <span>Active</span>
                                    </label>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                        {editingPaymentMethod ? 'Update' : 'Create'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowPaymentMethodForm(false);
                                            setEditingPaymentMethod(null);
                                        }}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Payment Methods List */}
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border p-3 text-left">Name</th>
                                    <th className="border p-3 text-left">Type</th>
                                    <th className="border p-3 text-left">Active</th>
                                    <th className="border p-3 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paymentMethods.map(method => (
                                    <tr key={method.id} className="hover:bg-gray-50">
                                        <td className="border p-3">{method.name}</td>
                                        <td className="border p-3 capitalize">{method.type.replace('_', ' ')}</td>
                                        <td className="border p-3">
                                            <span className={`px-2 py-1 rounded text-white text-sm ${method.is_active ? 'bg-green-600' : 'bg-red-600'}`}>
                                                {method.is_active ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td className="border p-3 flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditingPaymentMethod(method);
                                                    setShowPaymentMethodForm(true);
                                                }}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                            >
                                                <FiEdit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeletePaymentMethod(method.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                                            >
                                                <FiTrash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
