export interface Business {
  id: string;
  name: string;
  nui: string;
  commerce_register: string;
  website: string;
  is_verified: boolean;
  is_blocked: boolean;
  is_deleted: boolean;
  is_active: boolean;
  created_at: string;
  logo?: string;
}

export const mockBusinesses: Business[] = [
  {
    id: '1',
    name: 'TechSolutions SARL',
    nui: 'TL/2023/001',
    commerce_register: 'RC-2023-001',
    website: 'https://techsolutions.tg',
    is_verified: true,
    is_blocked: false,
    is_deleted: false,
    is_active: false,
    created_at: '2023-01-15T10:30:00Z',
    logo: 'https://via.placeholder.com/40?text=TS',
  },
  {
    id: '2',
    name: 'WebAffaires Togo',
    nui: 'TL/2023/002',
    commerce_register: 'RC-2023-002',
    website: 'https://webaffaires.tg',
    is_verified: true,
    is_blocked: false,
    is_deleted: false,
    is_active: true,
    created_at: '2023-02-20T14:45:00Z',
    logo: 'https://via.placeholder.com/40?text=WA',
  },
  {
    id: '3',
    name: 'Commerce Digital Africa',
    nui: 'TL/2023/003',
    commerce_register: 'RC-2023-003',
    website: 'https://cda.tg',
    is_verified: false,
    is_blocked: false,
    is_deleted: false,
    is_active: false,
    created_at: '2023-03-10T09:15:00Z',
  },
  {
    id: '4',
    name: 'Import Export Global',
    nui: 'TL/2023/004',
    commerce_register: 'RC-2023-004',
    website: 'https://ieag.tg',
    is_verified: true,
    is_blocked: true,
    is_deleted: false,
    is_active: false,
    created_at: '2023-04-05T16:20:00Z',
  },
  {
    id: '5',
    name: 'Logistique Togo Services',
    nui: 'TL/2023/005',
    commerce_register: 'RC-2023-005',
    website: 'https://lts.tg',
    is_verified: true,
    is_blocked: false,
    is_deleted: false,
    is_active: false,
    created_at: '2023-05-12T11:00:00Z',
    logo: 'https://via.placeholder.com/40?text=LTS',
  },
  {
    id: '6',
    name: 'Construction & Bâtiment Togo',
    nui: 'TL/2023/006',
    commerce_register: 'RC-2023-006',
    website: 'https://cbt.tg',
    is_verified: false,
    is_blocked: false,
    is_deleted: false,
    is_active: false,
    created_at: '2023-06-08T13:30:00Z',
  },
  {
    id: '7',
    name: 'Pharmacie Plus Distribution',
    nui: 'TL/2023/007',
    commerce_register: 'RC-2023-007',
    website: 'https://pharmaplus.tg',
    is_verified: true,
    is_blocked: false,
    is_deleted: false,
    is_active: false,
    created_at: '2023-07-22T10:45:00Z',
    logo: 'https://via.placeholder.com/40?text=PP',
  },
  {
    id: '8',
    name: 'Agriculture Durable Togo',
    nui: 'TL/2023/008',
    commerce_register: 'RC-2023-008',
    website: 'https://adt.tg',
    is_verified: false,
    is_blocked: true,
    is_deleted: false,
    is_active: false,
    created_at: '2023-08-14T15:20:00Z',
  },
];
