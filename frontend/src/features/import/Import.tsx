// import React from 'react';

// const Import: React.FC = () => {
//   return <div className="page-container"><h1 className="page-title">Import</h1></div>;
// };

// export default Import;


import FileUpload from "./components/FileUpload";

function Import() {
  return (
    <main className="page-container">
      <h1 className="page-title">Import</h1>

      <FileUpload />
    </main>
  );
}

export default Import;