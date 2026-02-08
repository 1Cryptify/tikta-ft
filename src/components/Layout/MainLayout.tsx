import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { User } from '../../hooks/useAuth';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  active?: boolean;
  onClick?: () => void;
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

const ContentWrapper = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const MainContent = styled.main`
  flex: 1;
  overflow-y: auto;
  background-color: #f8f9fa;
`;

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  user,
  navItems,
  navTitle = 'Menu',
  onLogout,
  headerTitle,
}) => {
  return (
    <LayoutWrapper>
      <Header user={user} onLogout={onLogout} title={headerTitle} />
      <ContentWrapper>
        <Sidebar items={navItems} title={navTitle} />
        <MainContent>{children}</MainContent>
      </ContentWrapper>
    </LayoutWrapper>
  );
};
