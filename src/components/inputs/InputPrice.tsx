import { InputText, type InputTextProps } from './InputText';

export const InputPrice = (props: InputTextProps) => (
  <InputText type="test" pattern="[0-9]+([,\.][0-9]+)?" placeholder="0,00" className="text-right" {...props} />
);
