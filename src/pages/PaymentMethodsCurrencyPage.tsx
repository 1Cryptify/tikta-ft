import React, { useState } from 'react';
import { usePaymentMethodCurrency, Currency, PaymentMethod } from '../hooks/usePaymentMethodCurrency';
import { FiPlus, FiEdit2, FiTrash2, FiAlertCircle, FiUpload } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/payment-config.css';
import { API_BASE_URL } from '../services/api';

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
    const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
    const [paymentType, setPaymentType] = useState<string>('');

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
        const type = formData.get('type') as 'bank_account' | 'card' | 'mobile_money' | 'wallet';

        // Build details object based on payment type
        let details: Record<string, unknown> = {};

        if (type === 'bank_account') {
            details = {
                account_holder: formData.get('account_holder') as string,
                bank_code: formData.get('bank_code') as string,
                account_number: formData.get('account_number') as string,
            };
        } else if (type === 'card') {
            details = {
                card_processor: formData.get('card_processor') as string,
            };
        } else if (type === 'wallet') {
            details = {
                wallet_provider: formData.get('wallet_provider') as string,
            };
        }

        const methodData = {
            name: formData.get('name') as string,
            type,
            is_active: formData.get('is_active') === 'on',
            channel: formData.get('channel') as string,
            country: formData.get('country') as string,
            details,
        };

        let result: PaymentMethod | null = null;

        if (editingPaymentMethod) {
            result = await updatePaymentMethod(editingPaymentMethod.id, methodData);
            setEditingPaymentMethod(null);
        } else {
            result = await createPaymentMethod(methodData);
        }

        // Upload logo if selected and method was created/updated successfully
        if (result && selectedLogo) {
            await uploadPaymentMethodLogo(result.id, selectedLogo);
        }

        setShowPaymentMethodForm(false);
        setSelectedLogo(null);
        setPaymentType('');
        e.currentTarget.reset();
    };

    // Handle logo file selection
    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedLogo(e.target.files[0]);
        }
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
        <div className="payment-config-container">
            <div className="payment-config-header">
                <h1 className="payment-config-title">Payment Configuration</h1>
                <p className="payment-config-subtitle">Manage currencies and payment methods</p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="alert alert-error">
                    <FiAlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {/* Success Message */}
            {successMessage && (
                <div className="alert alert-success">
                    <span>{successMessage}</span>
                </div>
            )}

            {/* Tabs */}
            <div className="tab-navigation">
                <button
                    onClick={() => setActiveTab('currencies')}
                    className={`tab-button ${activeTab === 'currencies' ? 'active' : ''}`}
                >
                    Currencies ({currencies.length})
                </button>
                <button
                    onClick={() => setActiveTab('payment-methods')}
                    className={`tab-button ${activeTab === 'payment-methods' ? 'active' : ''}`}
                >
                    Payment Methods ({paymentMethods.length})
                </button>
            </div>

            {/* Loading State */}
            {isLoading && <LoadingSpinner />}

            {/* Currencies Tab */}
            {activeTab === 'currencies' && !isLoading && (
                <div className="form-section">
                    <div className="form-header">
                        {!showCurrencyForm ? (
                            <button
                                onClick={() => setShowCurrencyForm(true)}
                                className="add-button"
                            >
                                <FiPlus size={20} />
                                Add Currency
                            </button>
                        ) : (
                            <form onSubmit={handleCurrencySubmit} className="form-container">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">Code</label>
                                        <input type="text" name="code" placeholder="USD" className="form-input" required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Name</label>
                                        <input type="text" name="name" placeholder="US Dollar" className="form-input" required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Symbol</label>
                                        <input type="text" name="symbol" placeholder="$" className="form-input" required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Value in USD</label>
                                        <input type="number" name="value_in_usd" placeholder="1.0" step="0.0001" className="form-input" required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Decimal Places</label>
                                        <input type="number" name="decimal_places" placeholder="2" className="form-input" required />
                                    </div>
                                    <div className="form-checkbox-group">
                                        <input type="checkbox" id="is_active" name="is_active" />
                                        <label htmlFor="is_active">Active</label>
                                    </div>
                                    <div className="form-checkbox-group">
                                        <input type="checkbox" id="is_default" name="is_default" />
                                        <label htmlFor="is_default">Default</label>
                                    </div>
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="btn-submit">
                                        {editingCurrency ? 'Update Currency' : 'Create Currency'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCurrencyForm(false);
                                            setEditingCurrency(null);
                                        }}
                                        className="btn-cancel"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Currencies List */}
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Name</th>
                                    <th>Symbol</th>
                                    <th>USD Value</th>
                                    <th>Decimals</th>
                                    <th>Active</th>
                                    <th>Default</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currencies.map(currency => (
                                    <tr key={currency.id}>
                                        <td>{currency.code}</td>
                                        <td>{currency.name}</td>
                                        <td>{currency.symbol}</td>
                                        <td>{currency.value_in_usd}</td>
                                        <td>{currency.decimal_places}</td>
                                        <td>
                                            <span className={`badge ${currency.is_active ? 'badge-active' : 'badge-inactive'}`}>
                                                {currency.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${currency.is_default ? 'badge-default' : 'badge-inactive'}`}>
                                                {currency.is_default ? 'Default' : 'No'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    onClick={() => {
                                                        setEditingCurrency(currency);
                                                        setShowCurrencyForm(true);
                                                    }}
                                                    className="btn-icon btn-icon-edit"
                                                    title="Edit"
                                                >
                                                    <FiEdit2 />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCurrency(currency.id)}
                                                    className="btn-icon btn-icon-delete"
                                                    title="Delete"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
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
                <div className="form-section">
                    <div className="form-header">
                        {!showPaymentMethodForm ? (
                            <button
                                onClick={() => setShowPaymentMethodForm(true)}
                                className="add-button"
                            >
                                <FiPlus size={20} />
                                Add Payment Method
                            </button>
                        ) : (
                            <form onSubmit={handlePaymentMethodSubmit} className="form-container">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">Method Name</label>
                                        <input 
                                            type="text" 
                                            name="name" 
                                            placeholder="e.g., MTN Mobile Money" 
                                            className="form-input" 
                                            defaultValue={editingPaymentMethod?.name || ''}
                                            required 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Payment Type</label>
                                        <select 
                                            name="type" 
                                            className="form-select" 
                                            value={paymentType || editingPaymentMethod?.type || ''}
                                            onChange={(e) => setPaymentType(e.target.value)}
                                            required
                                        >
                                            <option value="">Select Type</option>
                                            <option value="bank_account">Bank Account</option>
                                            <option value="card">Card</option>
                                            <option value="mobile_money">Mobile Money</option>
                                            <option value="wallet">Wallet</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Channel (Optional)</label>
                                        <input 
                                            type="text" 
                                            name="channel" 
                                            placeholder="e.g., cm.mtn, cm.orange" 
                                            className="form-input"
                                            defaultValue={editingPaymentMethod?.channel || ''}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Country Code (Optional)</label>
                                        <input 
                                            type="text" 
                                            name="country" 
                                            placeholder="e.g., CM, GA, CI" 
                                            className="form-input"
                                            maxLength={2}
                                            defaultValue={editingPaymentMethod?.country || ''}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Logo (Optional)</label>
                                        <div className="logo-upload-wrapper">
                                            <input 
                                                type="file" 
                                                id="logo" 
                                                name="logo" 
                                                accept="image/*"
                                                onChange={handleLogoChange}
                                                className="form-file-input"
                                                style={{ display: 'none' }}
                                            />
                                            <label htmlFor="logo" className="logo-upload-btn">
                                                <FiUpload size={16} />
                                                {selectedLogo ? selectedLogo.name : (editingPaymentMethod?.logo ? 'Change Logo' : 'Upload Logo')}
                                            </label>
                                            {editingPaymentMethod?.logo && !selectedLogo && (
                                                <span className="logo-current">Current logo exists</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="form-checkbox-group">
                                        <input 
                                            type="checkbox" 
                                            id="pm_is_active" 
                                            name="is_active" 
                                            defaultChecked={editingPaymentMethod?.is_active ?? true}
                                        />
                                        <label htmlFor="pm_is_active">Active</label>
                                    </div>
                                </div>

                                {/* Dynamic fields based on payment type */}
                                {(paymentType || editingPaymentMethod?.type) === 'bank_account' && (
                                    <div className="form-section-divider">
                                        <h4 className="form-section-title">Bank Account Details</h4>
                                        <div className="form-grid">
                                            <div className="form-group">
                                                <label className="form-label">Account Holder Name</label>
                                                <input 
                                                    type="text" 
                                                    name="account_holder" 
                                                    placeholder="John Doe" 
                                                    className="form-input"
                                                    defaultValue={(editingPaymentMethod?.details as Record<string, string>)?.account_holder || ''}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Bank Code</label>
                                                <input 
                                                    type="text" 
                                                    name="bank_code" 
                                                    placeholder="e.g., 001" 
                                                    className="form-input"
                                                    defaultValue={(editingPaymentMethod?.details as Record<string, string>)?.bank_code || ''}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Account Number</label>
                                                <input 
                                                    type="text" 
                                                    name="account_number" 
                                                    placeholder="0123456789" 
                                                    className="form-input"
                                                    defaultValue={(editingPaymentMethod?.details as Record<string, string>)?.account_number || ''}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {(paymentType || editingPaymentMethod?.type) === 'card' && (
                                    <div className="form-section-divider">
                                        <h4 className="form-section-title">Card Details</h4>
                                        <div className="form-grid">
                                            <div className="form-group">
                                                <label className="form-label">Card Processor</label>
                                                <input 
                                                    type="text" 
                                                    name="card_processor" 
                                                    placeholder="e.g., Stripe, PayPal" 
                                                    className="form-input"
                                                    defaultValue={(editingPaymentMethod?.details as Record<string, string>)?.card_processor || ''}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {(paymentType || editingPaymentMethod?.type) === 'wallet' && (
                                    <div className="form-section-divider">
                                        <h4 className="form-section-title">Wallet Details</h4>
                                        <div className="form-grid">
                                            <div className="form-group">
                                                <label className="form-label">Wallet Provider</label>
                                                <input 
                                                    type="text" 
                                                    name="wallet_provider" 
                                                    placeholder="e.g., PayPal, Apple Pay" 
                                                    className="form-input"
                                                    defaultValue={(editingPaymentMethod?.details as Record<string, string>)?.wallet_provider || ''}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="form-actions">
                                    <button type="submit" className="btn-submit">
                                        {editingPaymentMethod ? 'Update Method' : 'Create Method'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowPaymentMethodForm(false);
                                            setEditingPaymentMethod(null);
                                            setSelectedLogo(null);
                                            setPaymentType('');
                                        }}
                                        className="btn-cancel"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Payment Methods List */}
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Logo</th>
                                    <th>Name</th>
                                    <th>Type</th>
                                    <th>Channel</th>
                                    <th>Country</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paymentMethods.map(method => (
                                    <tr key={method.id}>
                                        <td>
                                            {method.logo ? (
                                                <img 
                                                    src={API_BASE_URL+method.logo} 
                                                    alt={method.name}
                                                    style={{ 
                                                        width: '40px', 
                                                        height: '40px', 
                                                        objectFit: 'contain',
                                                        borderRadius: 'var(--radius-md)'
                                                    }}
                                                />
                                            ) : (
                                                <div style={{ 
                                                    width: '40px', 
                                                    height: '40px', 
                                                    backgroundColor: '#f3f4f6',
                                                    borderRadius: 'var(--radius-md)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#9ca3af',
                                                    fontSize: '10px'
                                                }}>
                                                    No Logo
                                                </div>
                                            )}
                                        </td>
                                        <td>{method.name}</td>
                                        <td>
                                            <span style={{ textTransform: 'capitalize' }}>
                                                {method.type.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td>{method.channel || '-'}</td>
                                        <td>{method.country || '-'}</td>
                                        <td>
                                            <span className={`badge ${method.is_active ? 'badge-active' : 'badge-inactive'}`}>
                                                {method.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    onClick={() => {
                                                        setEditingPaymentMethod(method);
                                                        setPaymentType(method.type);
                                                        setShowPaymentMethodForm(true);
                                                    }}
                                                    className="btn-icon btn-icon-edit"
                                                    title="Edit"
                                                >
                                                    <FiEdit2 />
                                                </button>
                                                <button
                                                    onClick={() => handleDeletePaymentMethod(method.id)}
                                                    className="btn-icon btn-icon-delete"
                                                    title="Delete"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
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
