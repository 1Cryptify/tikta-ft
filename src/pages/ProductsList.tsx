import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import {
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiSearch,
    FiAlertCircle,
    FiCheck,
    FiX,
    FiEye,
} from 'react-icons/fi';
import { useProduct, Product } from '../hooks/useProduct';
import { ProductModal } from '../components/ProductModal';
import { colors, spacing, borderRadius, shadows } from '../config/theme';

const Header = styled.div`
  margin-bottom: ${spacing.xxl};

  h2 {
    font-size: 1.5rem;
    color: ${colors.textPrimary};
    margin: 0;
  }

  p {
    color: ${colors.textSecondary};
    font-size: 0.875rem;
    margin: ${spacing.sm} 0 0 0;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: ${spacing.lg};
  align-items: center;
  margin-bottom: ${spacing.lg};
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchBox = styled.div`
  flex: 1;
  min-width: 250px;
  position: relative;

  input {
    width: 100%;
    padding: ${spacing.md} ${spacing.lg};
    padding-left: 2.5rem;
    border: 1px solid ${colors.border};
    border-radius: ${borderRadius.md};
    font-size: 0.875rem;
    transition: border-color 0.3s ease;

    &:focus {
      outline: none;
      border-color: ${colors.primary};
      box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.1);
    }
  }

  svg {
    position: absolute;
    left: ${spacing.lg};
    top: 50%;
    transform: translateY(-50%);
    color: ${colors.textSecondary};
    pointer-events: none;
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.md} ${spacing.lg};
  background-color: ${colors.primary};
  color: ${colors.surface};
  border: none;
  border-radius: ${borderRadius.md};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
    box-shadow: ${shadows.md};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorBanner = styled.div`
  background-color: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: ${borderRadius.md};
  padding: ${spacing.lg};
  margin-bottom: ${spacing.lg};
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  color: ${colors.error};
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: ${colors.textSecondary};

  div {
    font-size: 0.875rem;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: ${colors.textSecondary};

  svg {
    font-size: 3rem;
    margin-bottom: ${spacing.lg};
    opacity: 0.5;
  }

  p {
    margin-bottom: ${spacing.md};
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${spacing.lg};
  margin-bottom: ${spacing.lg};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: ${borderRadius.lg};
  padding: ${spacing.lg};
  transition: all 0.3s ease;
  box-shadow: ${shadows.sm};

  &:hover {
    box-shadow: ${shadows.md};
    transform: translateY(-2px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${spacing.md};
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 1.125rem;
  color: ${colors.textPrimary};
  word-break: break-word;
`;

const Badge = styled.span<{ variant: 'active' | 'inactive' }>`
  display: inline-flex;
  align-items: center;
  gap: ${spacing.xs};
  padding: ${spacing.xs} ${spacing.sm};
  border-radius: ${borderRadius.full};
  font-size: 0.75rem;
  font-weight: 600;
  background-color: ${(props) =>
        props.variant === 'active' ? '#d1fae5' : '#fee2e2'};
  color: ${(props) => (props.variant === 'active' ? '#065f46' : '#991b1b')};
`;

const Description = styled.p`
  color: ${colors.textSecondary};
  font-size: 0.875rem;
  margin: 0 0 ${spacing.md} 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PriceSection = styled.div`
  display: flex;
  align-items: baseline;
  gap: ${spacing.md};
  margin-bottom: ${spacing.lg};
  padding: ${spacing.md};
  background-color: ${colors.neutral};
  border-radius: ${borderRadius.md};

  label {
    font-size: 0.75rem;
    font-weight: 600;
    color: ${colors.textSecondary};
  }

  span {
    font-size: 1.5rem;
    font-weight: 700;
    color: ${colors.textPrimary};
  }
`;

const CardActions = styled.div`
  display: flex;
  gap: ${spacing.sm};
  margin-top: ${spacing.lg};
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'danger' }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.sm};
  padding: ${spacing.sm} ${spacing.md};
  border: 1px solid ${(props) => (props.variant === 'danger' ? colors.error : colors.border)};
  background-color: ${(props) =>
        props.variant === 'danger' ? 'transparent' : colors.neutral};
  color: ${(props) => (props.variant === 'danger' ? colors.error : colors.textPrimary)};
  border-radius: ${borderRadius.md};
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background-color: ${(props) =>
        props.variant === 'danger' ? '#fee2e2' : colors.border};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const DetailsModalOverlay = styled.div<{ isOpen: boolean }>`
  display: ${(props) => (props.isOpen ? 'flex' : 'none')};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  align-items: center;
  justify-content: center;
  z-index: 999;
`;

const DetailsModalContent = styled.div`
  background: ${colors.surface};
  border-radius: ${borderRadius.lg};
  padding: 2rem;
  max-width: 700px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${shadows.lg};

  h2 {
    font-size: 1.5rem;
    color: ${colors.textPrimary};
    margin-top: 0;
    margin-bottom: ${spacing.lg};
  }
`;

const DetailsSection = styled.div`
  margin-bottom: ${spacing.lg};
  padding-bottom: ${spacing.lg};
  border-bottom: 1px solid ${colors.border};

  h3 {
    font-size: 0.875rem;
    font-weight: 600;
    color: ${colors.textSecondary};
    text-transform: uppercase;
    margin: 0 0 ${spacing.sm} 0;
  }

  p {
    color: ${colors.textPrimary};
    margin: 0;
    word-break: break-word;
  }
`;

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${spacing.lg};
  margin-bottom: ${spacing.lg};

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const DetailItem = styled.div`
  h3 {
    font-size: 0.875rem;
    font-weight: 600;
    color: ${colors.textSecondary};
    text-transform: uppercase;
    margin: 0 0 ${spacing.sm} 0;
  }

  p {
    color: ${colors.textPrimary};
    margin: 0;
    word-break: break-word;
  }
`;

const DetailsCloseButton = styled.button`
  width: 100%;
  padding: ${spacing.md} ${spacing.lg};
  background-color: ${colors.neutral};
  color: ${colors.textPrimary};
  border: 1px solid ${colors.border};
  border-radius: ${borderRadius.md};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: ${spacing.lg};

  &:hover {
    background-color: ${colors.border};
  }
`;

export const ProductsList: React.FC = () => {
    const {
        products,
        currencies,
        isLoading,
        error,
        createProduct,
        updateProduct,
        deleteProduct,
        activateProduct,
        deactivateProduct,
    } = useProduct();

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const filteredProducts = useMemo(() => {
        return products.filter((product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.description &&
                product.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [products, searchTerm]);

    const handleOpenModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
        } else {
            setEditingProduct(null);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const handleSubmit = async (data: Partial<Product>) => {
        setIsSaving(true);
        try {
            if (editingProduct) {
                await updateProduct(editingProduct.id, data);
            } else {
                await createProduct(data);
            }
            handleCloseModal();
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }
        setIsSaving(true);
        try {
            await deleteProduct(id);
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleStatus = async (product: Product) => {
        setIsSaving(true);
        try {
            if (product.is_active) {
                await deactivateProduct(product.id);
            } else {
                await activateProduct(product.id);
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleViewDetails = (product: Product) => {
        setSelectedProduct(product);
        setDetailsModalOpen(true);
    };

    const handleCloseDetails = () => {
        setDetailsModalOpen(false);
        setSelectedProduct(null);
    };

    return (
        <>
            <Header>
                <h2>Products</h2>
                <p>Manage all your products in one place</p>
            </Header>

            {error && (
                <ErrorBanner>
                    <FiAlertCircle /> {error}
                </ErrorBanner>
            )}

            <HeaderActions>
                <SearchBox>
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </SearchBox>
                <AddButton
                    onClick={() => handleOpenModal()}
                    disabled={isSaving}
                >
                    <FiPlus /> Add Product
                </AddButton>
            </HeaderActions>

            {isLoading ? (
                <LoadingSpinner>
                    <div>Loading...</div>
                </LoadingSpinner>
            ) : filteredProducts.length === 0 ? (
                <EmptyState>
                    <FiAlertCircle />
                    <p>{searchTerm ? 'No products found' : 'No products yet'}</p>
                    {!searchTerm && (
                        <AddButton onClick={() => handleOpenModal()}>
                            <FiPlus /> Create Your First Product
                        </AddButton>
                    )}
                </EmptyState>
            ) : (
                <Grid>
                    {filteredProducts.map((product) => (
                        <Card key={product.id}>
                            <CardHeader>
                                <div>
                                    <CardTitle>{product.name}</CardTitle>
                                    <Badge variant={product.is_active ? 'active' : 'inactive'}>
                                        {product.is_active ? (
                                            <>
                                                <FiCheck /> Active
                                            </>
                                        ) : (
                                            <>
                                                <FiX /> Inactive
                                            </>
                                        )}
                                    </Badge>
                                </div>
                            </CardHeader>

                            {product.description && <Description>{product.description}</Description>}

                            <PriceSection>
                                <label>Price</label>
                                <span>{Number(product.price)?.toFixed(2) || '0.00'}</span>
                                <label>Currency</label>
                                <span>{product.currency?.symbol}</span>
                            </PriceSection>

                            <CardActions>
                                <ActionButton
                                    onClick={() => handleViewDetails(product)}
                                    disabled={isSaving}
                                >
                                    <FiEye /> View
                                </ActionButton>
                                <ActionButton
                                    onClick={() => handleOpenModal(product)}
                                    disabled={isSaving}
                                >
                                    <FiEdit2 /> Edit
                                </ActionButton>
                                <ActionButton
                                    variant={product.is_active ? 'primary' : 'primary'}
                                    onClick={() => handleToggleStatus(product)}
                                    disabled={isSaving}
                                >
                                    {product.is_active ? 'Deactivate' : 'Activate'}
                                </ActionButton>
                                <ActionButton
                                    variant="danger"
                                    onClick={() => handleDelete(product.id)}
                                    disabled={isSaving}
                                >
                                    <FiTrash2 /> Delete
                                </ActionButton>
                            </CardActions>
                        </Card>
                    ))}
                </Grid>
            )}

            <ProductModal
                isOpen={isModalOpen}
                product={editingProduct}
                onClose={handleCloseModal}
                onSubmit={handleSubmit}
                isLoading={isSaving}
                currencies={currencies}
            />

            <DetailsModalOverlay isOpen={detailsModalOpen} onClick={handleCloseDetails}>
                <DetailsModalContent onClick={(e) => e.stopPropagation()}>
                    {selectedProduct && (
                        <>
                            <h2>{selectedProduct.name}</h2>

                            {selectedProduct.description && (
                                <DetailsSection>
                                    <h3>Description</h3>
                                    <p>{selectedProduct.description}</p>
                                </DetailsSection>
                            )}

                            <DetailsGrid>
                                <DetailItem>
                                    <h3>Product ID</h3>
                                    <p style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>{selectedProduct.id}</p>
                                </DetailItem>
                                <DetailItem>
                                    <h3>Company ID</h3>
                                    <p style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>{selectedProduct.company}</p>
                                </DetailItem>
                            </DetailsGrid>

                            <DetailsGrid>
                                <DetailItem>
                                    <h3>Price</h3>
                                    <p>
                                        {selectedProduct.currency?.symbol}
                                        {Number(selectedProduct.price)?.toFixed(
                                            selectedProduct.currency?.decimal_places || 2
                                        ) || '0.00'}
                                    </p>
                                </DetailItem>
                                {selectedProduct.currency && (
                                    <DetailItem>
                                        <h3>Currency</h3>
                                        <p>{selectedProduct.currency.code}</p>
                                    </DetailItem>
                                )}
                            </DetailsGrid>

                            {selectedProduct.currency && (
                                <DetailsGrid>
                                    <DetailItem>
                                        <h3>Currency Name</h3>
                                        <p>{selectedProduct.currency.name}</p>
                                    </DetailItem>
                                    <DetailItem>
                                        <h3>Decimal Places</h3>
                                        <p>{selectedProduct.currency.decimal_places}</p>
                                    </DetailItem>
                                </DetailsGrid>
                            )}

                            <DetailsGrid>
                                <DetailItem>
                                    <h3>Status</h3>
                                    <p>
                                        {selectedProduct.is_active ? (
                                            <span style={{ color: '#065f46', fontWeight: '600' }}>Active</span>
                                        ) : (
                                            <span style={{ color: '#991b1b', fontWeight: '600' }}>Inactive</span>
                                        )}
                                    </p>
                                </DetailItem>
                                <DetailItem>
                                    <h3>Deleted</h3>
                                    <p>
                                        {selectedProduct.is_deleted ? (
                                            <span style={{ color: '#991b1b' }}>Yes</span>
                                        ) : (
                                            <span style={{ color: '#065f46' }}>No</span>
                                        )}
                                    </p>
                                </DetailItem>
                            </DetailsGrid>

                            <DetailsGrid>
                                <DetailItem>
                                    <h3>Created At</h3>
                                    <p style={{ fontSize: '0.85rem' }}>
                                        {selectedProduct.created_at
                                            ? new Date(selectedProduct.created_at).toLocaleString()
                                            : 'N/A'}
                                    </p>
                                </DetailItem>
                                <DetailItem>
                                    <h3>Updated At</h3>
                                    <p style={{ fontSize: '0.85rem' }}>
                                        {selectedProduct.updated_at
                                            ? new Date(selectedProduct.updated_at).toLocaleString()
                                            : 'N/A'}
                                    </p>
                                </DetailItem>
                            </DetailsGrid>

                            <DetailsCloseButton onClick={handleCloseDetails}>
                                Close
                            </DetailsCloseButton>
                        </>
                    )}
                </DetailsModalContent>
            </DetailsModalOverlay>
        </>
    );
};
