import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
  const hash = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sistema.com' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@sistema.com',
      password: hash,
      role: 'admin',
    },
  });

  console.log('Admin user seed concluído!');

  // Nomes fictícios para os atendimentos
  const nomesPacientes = [
    'João Maria da Silva',
    'Maria Aparecida Nunes',
    'Carlos Roberto Gomes',
    'Ana Lúcia Ferreira',
    'Fernanda Lima',
    'José Alencar',
    'Sandra de Souza',
    'Roberto Justus',
    'Luciana Gimenez',
    'Felipe Neto',
  ];

  // Tipos para gerar os atendimentos (agora como strings literais)
  const tiposTratamento = ['Quimioterapia', 'Radioterapia', 'Quimio_Radio', 'Controle', 'Paliativo'];
  const statusCompar = ['Compareceu', 'Nao_Compareceu', 'Justificou'];
  const encaminhamentos = ['Equipe_Medica', 'Equipe_Multidisciplinar', 'Rede_Apoio', 'Nenhum'];
  const tiposAtendimento = [
    'Formularios', 'Relatorio', 'Orientacoes', 'Relatorio_Formulario', 
    'Relatorio_Orientacoes', 'Baixa_Prontuario', 'Banco_Perucas'
  ];
  const cids = ['C50.9', 'C34.9', 'C61', 'C18.9', 'C53.9', 'C16.9']; 

  const qtdAtendimentosParaGerar = 50;

  // Gerar os Atendimentos (Appointments) Falsos
  for (let i = 0; i < qtdAtendimentosParaGerar; i++) {
    const randomNome = nomesPacientes[Math.floor(Math.random() * nomesPacientes.length)];
    const isThisYear = Math.random() > 0.5; 
    const dtAtendimento = isThisYear 
      ? randomDate(new Date(2023, 0, 1), new Date()) 
      : randomDate(new Date(2022, 0, 1), new Date(2023, 11, 31));

    await prisma.appointment.create({
      data: {
        nome_paciente: randomNome,
        created_by: admin.id,
        tipo_tratamento: tiposTratamento[Math.floor(Math.random() * tiposTratamento.length)],
        status_comparecimento: statusCompar[Math.floor(Math.random() * statusCompar.length)],
        encaminhamento: encaminhamentos[Math.floor(Math.random() * encaminhamentos.length)],
        tipo_atendimento: tiposAtendimento[Math.floor(Math.random() * tiposAtendimento.length)],
        cid: cids[Math.floor(Math.random() * cids.length)],
        observacoes: 'Atendimento gerado pelo script seed de testes.',
        data_atendimento: dtAtendimento,
      }
    });
  }

  console.log('Atendimentos seed concluído!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
