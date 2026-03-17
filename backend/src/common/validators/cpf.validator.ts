import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

export function isValidCpf(cpf: string): boolean {
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  const calc = (digits: string, len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += parseInt(digits[i]) * (len + 1 - i);
    const rem = (sum * 10) % 11;
    return rem === 10 || rem === 11 ? 0 : rem;
  };
  return calc(cpf, 9) === parseInt(cpf[9]) && calc(cpf, 10) === parseInt(cpf[10]);
}

@ValidatorConstraint({ name: 'cpf', async: false })
export class CpfValidator implements ValidatorConstraintInterface {
  validate(cpf: string) { return isValidCpf(cpf); }
  defaultMessage() { return 'CPF inválido'; }
}
