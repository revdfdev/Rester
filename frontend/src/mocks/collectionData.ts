import { CollectionNode, EnvironmentNode } from '../types';

export const MOCK_COLLECTIONS: CollectionNode[] = [
  {
    id: 'folder-1',
    name: 'Authentication',
    type: 'folder',
    path: '/auth',
    children: [
      {
        id: 'file-1',
        name: 'login.http',
        type: 'file',
        path: '/auth/login.http',
        method: 'POST'
      },
      {
        id: 'file-2',
        name: 'register.http',
        type: 'file',
        path: '/auth/register.http',
        method: 'POST',
        isDirty: true
      },
      {
        id: 'file-3',
        name: 'logout.http',
        type: 'file',
        path: '/auth/logout.http',
        method: 'GET'
      }
    ]
  },
  {
    id: 'folder-2',
    name: 'User Management',
    type: 'folder',
    path: '/users',
    children: [
      {
        id: 'file-4',
        name: 'get-profile.http',
        type: 'file',
        path: '/users/profile.http',
        method: 'GET'
      },
      {
        id: 'file-5',
        name: 'update-avatar.http',
        type: 'file',
        path: '/users/avatar.http',
        method: 'PATCH'
      }
    ]
  }
];

export const MOCK_ENVIRONMENTS: EnvironmentNode[] = [
  { id: 'env-1', name: 'development', path: '/envs/dev.json', isActive: false },
  { id: 'env-2', name: 'production', path: '/envs/prod.json', isActive: true },
  { id: 'env-3', name: 'staging', path: '/envs/staging.json', isActive: false }
];
