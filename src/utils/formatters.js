export const formatCurrency = (amount) => {
  return `Rp ${Number(amount).toLocaleString('id-ID')}`;
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const classNames = (...classes) => classes.filter(Boolean).join(' ');
