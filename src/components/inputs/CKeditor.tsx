/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef } from 'react';

class Base64UploadAdapter {
  loader: any;

  constructor(loader: any) {
    this.loader = loader;
  }

  upload() {
    return this.loader.file.then(
      (file: Blob) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();

          reader.onload = () => {
            resolve({ default: reader.result });
          };

          reader.onerror = (error) => {
            reject(`Error occurred while reading file: ${error}`);
          };

          reader.readAsDataURL(file);
        })
    );
  }

  abort() {
    // TODO
  }
}

type EditorProps = {
  onChange: (data: string) => void;
  editorLoaded: boolean;
  name: string;
  value: string;
};

const editorConfiguration = {
  toolbar: [
    'heading',
    '|',
    'bold',
    'italic',
    'link',
    'bulletedList',
    'numberedList',
    'blockQuote',
    '|',
    'undo',
    'redo',
    '|',
    'imageUpload',
  ],
  heading: {
    options: [
      { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
      { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
      { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
      { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
    ],
  },
  image: {
    toolbar: ['imageTextAlternative'],
    resizeUnit: 'px',
  },
  extraPlugins: [MyCustomUploadAdapterPlugin],
};

function MyCustomUploadAdapterPlugin(editor: any) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => new Base64UploadAdapter(loader);
}

function Editor({ onChange, editorLoaded, name, value }: EditorProps) {
  const editorRef = useRef();
  const { CKEditor, ClassicEditor } = (editorRef.current || {}) as any;

  useEffect(() => {
    editorRef.current = {
      CKEditor: require('@ckeditor/ckeditor5-react').CKEditor, // v3+
      ClassicEditor: require('@ckeditor/ckeditor5-build-classic'),
    } as any;
  }, []);

  return (
    <div>
      {editorLoaded ? (
        <CKEditor
          type=""
          name={name}
          editor={ClassicEditor}
          data={value}
          config={editorConfiguration}
          onChange={(_event: any, editor: any) => {
            const data = editor.getData();
            // console.log({ event, editor, data })
            onChange(data);
          }}
        />
      ) : (
        <div>Editor loading</div>
      )}
    </div>
  );
}

export default Editor;
