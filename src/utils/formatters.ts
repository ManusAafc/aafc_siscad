export const formatCPF = (cpf: string): string => {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return cpf;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const formatMobile = (mobile: string): string => {
  const digits = mobile.replace(/\D/g, '');
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return mobile;
};

export const formatCEP = (cep: string): string => {
  const digits = cep.replace(/\D/g, '');
  if (digits.length !== 8) return cep;
  return digits.replace(/(\d{5})(\d{3})/, '$1-$2');
};

export const formatPhone = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  return phone;
};

export const removeNonNumericChars = (input: string): string => {
  return input.replace(/\D/g, '');
};

export const formatMobileToFull = (mobileMask: string): string => {
  const digits = removeNonNumericChars(mobileMask);
  return `55${digits}`;
};

export const formatMobileToWhatsapp = (mobileMask: string): string => {
  const digits = removeNonNumericChars(mobileMask);
  if (digits.length !== 11) return '';
  const withoutFifth = digits.substring(0, 4) + digits.substring(5);
  return `55${withoutFifth}@s.whatsapp.net`;
};

export const formatMobileFormats = (mobileMask: string | null): string[] => {
  if (!mobileMask) return ['', '', ''];

  const digits = removeNonNumericChars(mobileMask);
  const mobileFull = `55${digits}`;
  const mobileWhatsapp = `${mobileFull.substring(0, 4)}${mobileFull.substring(5)}@s.whatsapp.net`;

  return [mobileFull, mobileWhatsapp, digits];
};

export const formatBRDateToEN = (dateBR: string): string | null => {
  if (!dateBR) return null;
  const parts = dateBR.split('/');
  if (parts.length !== 3) return null;
  const [day, month, year] = parts;
  return `${year}-${month}-${day}`;
};

export const formatENDateToBR = (dateEN: string): string | null => {
  if (!dateEN) return null;
  const parts = dateEN.split('-');
  if (parts.length !== 3) return null;
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
};

export const formatDateTimeBRToEN = (dateTimeBR: string): string | null => {
  if (!dateTimeBR) return null;
  const parts = dateTimeBR.split(' ');
  if (parts.length !== 2) return null;

  const dateParts = parts[0].split('/');
  if (dateParts.length !== 3) return null;

  const timeParts = parts[1].split(':');
  if (timeParts.length !== 2) return null;

  const [day, month, year] = dateParts;
  const [hour, minute] = timeParts;

  return `${year}-${month}-${day}T${hour}:${minute}:00`;
};

export const paginate = (limit: number, pageNumber: number): number => {
  return (pageNumber - 1) * limit;
};

export const capitalizeAll = (text: string): string => {
  return text.toUpperCase();
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatFullDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export const formatBirthDateWithAge = (dateStr: string): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  const today = new Date();
  let age = today.getFullYear() - year;
  const monthDiff = today.getMonth() - d.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d.getDate())) {
    age--;
  }
  
  return `${day}/${month}/${year} (${age} anos)`;
};
