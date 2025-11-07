/**
 * Public User Profile Page Route
 * Dynamic route for viewing other users' profiles
 */
'use client'

import { use } from 'react';
import PublicProfile from '@/pages/PublicProfile';

export default function UserProfilePage({ params }) {
  const { id } = use(params);

  return <PublicProfile userId={id} />;
}
