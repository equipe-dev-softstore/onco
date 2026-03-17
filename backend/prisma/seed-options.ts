import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const options = [
    // TIPO_TRATAMENTO
    { category: 'TIPO_TRATAMENTO', label: 'Quimioterapia', value: 'Quimioterapia' },
    { category: 'TIPO_TRATAMENTO', label: 'Radioterapia', value: 'Radioterapia' },
    { category: 'TIPO_TRATAMENTO', label: 'Quimioterapia + Radioterapia concomitante', value: 'Quimio_Radio' },
    { category: 'TIPO_TRATAMENTO', label: 'Controle', value: 'Controle' },
    { category: 'TIPO_TRATAMENTO', label: 'Paliativo', value: 'Paliativo' },

    // STATUS_COMPARECIMENTO
    { category: 'STATUS_COMPARECIMENTO', label: 'Compareceu', value: 'Compareceu' },
    { category: 'STATUS_COMPARECIMENTO', label: 'Não Compareceu', value: 'Nao_Compareceu' },
    { category: 'STATUS_COMPARECIMENTO', label: 'Justificou', value: 'Justificou' },

    // ENCAMINHAMENTO (based on what's in frontend)
    { category: 'ENCAMINHAMENTO', label: 'Equipe Médica', value: 'Equipe_Medica' },
    { category: 'ENCAMINHAMENTO', label: 'Equipe Multidisciplinar', value: 'Equipe_Multidisciplinar' },
    { category: 'ENCAMINHAMENTO', label: 'Rede de Apoio', value: 'Rede_Apoio' },
    { category: 'ENCAMINHAMENTO', label: 'Nenhum', value: 'Nenhum' },
    { category: 'ENCAMINHAMENTO', label: 'Quimioterapia', value: 'Quimioterapia' },
    { category: 'ENCAMINHAMENTO', label: 'Radioterapia', value: 'Radioterapia' },
    { category: 'ENCAMINHAMENTO', label: 'Cirurgia', value: 'Cirurgia' },
    { category: 'ENCAMINHAMENTO', label: 'Cuidados Paliativos', value: 'Cuidados_Paliativos' },
    { category: 'ENCAMINHAMENTO', label: 'Alta', value: 'Alta' },
    { category: 'ENCAMINHAMENTO', label: 'Internação', value: 'Internacao' },

    // TIPO_ATENDIMENTO
    { category: 'TIPO_ATENDIMENTO', label: 'Formulários', value: 'Formularios' },
    { category: 'TIPO_ATENDIMENTO', label: 'Relatório', value: 'Relatorio' },
    { category: 'TIPO_ATENDIMENTO', label: 'Orientações', value: 'Orientacoes' },
    { category: 'TIPO_ATENDIMENTO', label: 'Relatório+Formulário', value: 'Relatorio_Formulario' },
    { category: 'TIPO_ATENDIMENTO', label: 'Relatório+Orientações', value: 'Relatorio_Orientacoes' },
    { category: 'TIPO_ATENDIMENTO', label: 'Baixa de Prontuário', value: 'Baixa_Prontuario' },
    { category: 'TIPO_ATENDIMENTO', label: 'Banco de Perucas', value: 'Banco_Perucas' },
    { category: 'TIPO_ATENDIMENTO', label: 'Não compareceu', value: 'Nao_Compareceu' },
  ];

  for (const option of options) {
    await prisma.fieldOption.create({
      data: option,
    });
  }

  console.log('Fields seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
