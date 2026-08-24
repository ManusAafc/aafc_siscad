import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { IMember } from '../models';
import { formatCPF, formatPhone } from './formatters';
import { addPDFHeader, addPDFFooter } from './pdfHeader';
import { saveFileOnDevice } from './capacitor';

export const exportMembersToPDF = async (members: IMember[], title: string = 'Relatório de Membros') => {
  const doc = new jsPDF('landscape');
  
  // Cabeçalho com título e logo
  const startY = addPDFHeader({ doc, title, totalRecords: members.length });

  // Colunas
  const tableColumn = ["Nome", "CPF", "Telefone", "Celular", "Cidade/UF", "Região", "Plano", "Situação"];
  
  // Linhas
  const tableRows: any[] = [];

  members.forEach(m => {
    const member = m as any;
    const nome = member.name || member.name_full || member.nameFull || '';
    const cpf = member.cpf ? formatCPF(member.cpf) : '';
    const tel = member.phone ? formatPhone(member.phone) : '';
    const cel = member.mobile ? formatPhone(member.mobile) : '';
    
    // Fallbacks pros nomes
    const city = member.cityDescription || member.cityName || member.city_description || member.city_name || member.db_member_city_description || member.db_city_description || member.city || '';
    const uf = member.stateCode || member.state_code || member.db_member_state_code || member.db_state_code || '';
    const cidadeUf = city ? `${city}${uf ? `/${uf}` : ''}` : '';
    
    const regiao = member.regionCode || member.region_code || member.db_member_region_code || member.db_region_code || member.regionDescription || member.regionName || member.region || '';
    const plano = member.planCode || member.plan_code || member.db_member_plan_code || member.db_plan_code || member.planDescription || member.planName || member.plan || '';
    const status = member.statusName || member.status_name || member.statusDescription || member.status_description || `Status ${(member.status_id ?? member.statusId ?? '')}`;

    tableRows.push([
      nome,
      cpf,
      tel,
      cel,
      cidadeUf,
      regiao,
      plano,
      status
    ]);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185] },
  });

  addPDFFooter(doc, members.length);

  const blob = new Blob([doc.output('arraybuffer')], { type: 'application/pdf' });
  await saveFileOnDevice(blob, `membros_${new Date().getTime()}.pdf`);
};

// ── Etiquetas Carta 6181 (Pimaco) ────────────────────────────────────────────
// Dimensões: etiqueta 101,6 x 25,4 mm | folha 216 x 279 mm (Carta)
// Layout: 2 colunas x 10 linhas = 20 etiquetas/folha

const LABEL_WIDTH = 101.6;
const LABEL_HEIGHT = 25.4;
const SHEET_WIDTH = 216;
const SHEET_HEIGHT = 279;
const MARGIN_LEFT = 7.1;
const MARGIN_TOP = 19.0;
const COLS = 2;
const ROWS = 10;
const LABELS_PER_SHEET = COLS * ROWS;

const getMemberAddressFields = (m: IMember) => {
  const member = m as any;
  return {
    name: member.name || member.name_full || member.nameFull || '',
    address: member.address || '',
    neighborhood: member.neighborhood || '',
    city: member.cityDescription || member.cityName || member.city_description || member.city_name || '',
    state: member.stateCode || member.state_code || '',
    zipCode: member.zipCodeMask || member.zipCode || member.zip_code_mask || member.zip_code || member.db_member_zip_code_mask || member.db_zip_code_mask || member.db_member_zip_code || member.db_zip_code || '',
  };
};

export const exportMembersToLabels = async (members: IMember[]) => {
  const doc = new jsPDF({ unit: 'mm', format: 'letter', orientation: 'portrait' });

  members.forEach((m, index) => {
    const sheetIndex = Math.floor(index / LABELS_PER_SHEET);
    const posInSheet = index % LABELS_PER_SHEET;
    const col = posInSheet % COLS;
    const row = Math.floor(posInSheet / COLS);

    if (index > 0 && posInSheet === 0) {
      doc.addPage();
    }

    const x = MARGIN_LEFT + col * LABEL_WIDTH;
    const y = MARGIN_TOP + row * LABEL_HEIGHT;

    const { name, address, neighborhood, city, state, zipCode } = getMemberAddressFields(m);
    const cidadeUf = city ? `${city}${state ? `/${state}` : ''}` : '';

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(name.substring(0, 50), x + 2, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    if (address) doc.text(address.substring(0, 55), x + 2, y + 10);

    const bairroCidade = neighborhood ? `${neighborhood}${cidadeUf ? ` - ${cidadeUf}` : ''}` : cidadeUf;
    if (bairroCidade) doc.text(bairroCidade.substring(0, 55), x + 2, y + 15);

    if (zipCode) doc.text(`CEP: ${zipCode}`, x + 2, y + 20);
  });

  const blob = new Blob([doc.output('arraybuffer')], { type: 'application/pdf' });
  await saveFileOnDevice(blob, `etiquetas_${new Date().getTime()}.pdf`);
};

export const exportMembersToExcel = async (members: IMember[], title: string = 'Membros') => {
  const data = members.map((m) => {
    const member = m as any;
    const city = member.cityDescription || member.cityName || member.city_description || member.city_name || member.db_member_city_description || member.db_city_description || member.city || '';
    const uf = member.stateCode || member.state_code || member.db_member_state_code || member.db_state_code || '';
    
    return {
      Nome: member.name || member.name_full || member.nameFull || '',
      CPF: member.cpf ? formatCPF(member.cpf) : '',
      Telefone: member.phone ? formatPhone(member.phone) : '',
      Celular: member.mobile ? formatPhone(member.mobile) : '',
      'Cidade/UF': city ? `${city}${uf ? `/${uf}` : ''}` : '',
      Regiao: member.regionCode || member.region_code || member.db_member_region_code || member.db_region_code || member.regionDescription || member.regionName || member.region || '',
      Plano: member.planCode || member.plan_code || member.db_member_plan_code || member.db_plan_code || member.planDescription || member.planName || member.plan || '',
      Situacao: member.statusName || member.status_name || member.statusDescription || member.status_description || `Status ${(member.status_id ?? member.statusId ?? '')}`
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Membros");
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  await saveFileOnDevice(blob, `membros_${new Date().getTime()}.xlsx`);
};
