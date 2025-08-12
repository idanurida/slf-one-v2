// client/src/pages/dashboard/index.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const DashboardRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    const redirectToRoleDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const res = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const { role } = res.data.user;
        
        // Redirect based on role
        switch (role) {
          case 'superadmin':
            router.push('/dashboard/superadmin');
            break;
          case 'head_consultant':
            router.push('/dashboard/head-consultant');
            break;
          case 'project_lead':
            router.push('/dashboard/project-lead');
            break;
          case 'admin_lead':
            router.push('/dashboard/admin-lead');
            break;
          case 'inspektor':
            router.push('/dashboard/inspector');
            break;
          case 'drafter':
            router.push('/dashboard/drafter');
            break;
          case 'klien':
            router.push('/dashboard/client');
            break;
          default:
            router.push('/login');
        }
      } catch (err) {
        console.error('Error redirecting:', err);
        localStorage.removeItem('token');
        router.push('/login');
      }
    };

    redirectToRoleDashboard();
  }, [router]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Redirecting to your dashboard...</p>
    </div>
  );
};

export default DashboardRedirect;