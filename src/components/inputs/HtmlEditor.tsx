import { useEffect, useState } from 'react';
import CKeditor from './CKeditor';

interface HtmlEditorProps {
  value: string;
  setValue: (value: string) => void;
  id?: string;
  className?: string;
}

export const HtmlEditor = ({ value, setValue }: HtmlEditorProps) => {
  const [editorLoaded, setEditorLoaded] = useState<boolean>(false);

  useEffect(() => {
    setEditorLoaded(true);
  }, []);

  return (
    <div>
      <CKeditor
        name="description"
        onChange={(data: string) => {
          setValue(data);
        }}
        value={value}
        editorLoaded={editorLoaded}
      />
    </div>
  );
};
