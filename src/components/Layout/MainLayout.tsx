import React, { ReactNode, useState } from 'react';
import styled from 'styled-components';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { User } from '../../hooks/useAuth';

interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    active?: boolean;
    onClick?: () => void | Promise<void>;
}

interface MainLayoutProps {
    children: ReactNode;
    user?: User;
    navItems: NavItem[];
    navTitle?: string;
    onLogout?: () => void;
    headerTitle?: string;
}

const LayoutWrapper = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const ContentWrapper = styled.div<{ sidebarOpen?: boolean }>`
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SidebarContainer = styled.div<{ isOpen?: boolean }>`
  @media (max-width: 768px) {
    position: fixed;
    top: 60px;
    left: 0;
    height: calc(100vh - 60px);
    width: 100%;
    z-index: 999;
    transform: translateX(${props => (props.isOpen ? '0' : '-100%')});
    transition: transform 0.3s ease;
    pointer-events: ${props => (props.isOpen ? 'auto' : 'none')};
    overflow: hidden;

    > * {
      width: 280px;
      max-width: 80vw;
      height: 100%;
      background: white;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
  }
`;

const MainContent = styled.main`
  flex: 1;
  overflow-y: auto;
  background-color: #f8f9fa;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const MobileMenuBackdrop = styled.div<{ isOpen?: boolean }>`
  display: none;

  @media (max-width: 768px) {
    display: ${props => (props.isOpen ? 'block' : 'none')};
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 998;
    pointer-events: ${props => (props.isOpen ? 'auto' : 'none')};
  }
`;

export const MainLayout: React.FC<MainLayoutProps> = ({
    children,
    user,
    navItems,
    navTitle = 'Menu',
    onLogout,
    headerTitle,
}) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const closeSidebar = () => setSidebarOpen(false);

    // Prevent body scroll when sidebar is open on mobile
    React.useEffect(() => {
        if (sidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [sidebarOpen]);

    return (
        <LayoutWrapper>
            <Header
                user={user}
                onLogout={onLogout}
                title={headerTitle}
                onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
            />
            <ContentWrapper sidebarOpen={sidebarOpen}>
                <SidebarContainer isOpen={sidebarOpen}>
                    <Sidebar
                        items={navItems}
                        title={navTitle}
                        onItemClick={closeSidebar}
                    />
                </SidebarContainer>
                <MobileMenuBackdrop isOpen={sidebarOpen} onClick={closeSidebar} />
                <MainContent>{children}</MainContent>
            </ContentWrapper>
        </LayoutWrapper>
    );
};
