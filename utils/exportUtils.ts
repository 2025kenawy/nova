
import { Lead } from '../types';

export const exportLeadsToCsv = (leads: Lead[], filename: string = 'nova_export.csv') => {
  if (leads.length === 0) return;

  const headers = [
    'First Name',
    'Last Name',
    'Title',
    'Company',
    'Email',
    'LinkedIn',
    'Phone',
    'Status',
    'Industry',
    'Score'
  ];

  const rows = leads.map(l => [
    l.firstName,
    l.lastName,
    l.title,
    l.companyName,
    l.email,
    l.linkedin || '',
    l.whatsapp || '',
    l.status,
    l.horseCategory || '',
    l.scoring?.overall || 0
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
