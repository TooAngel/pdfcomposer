# PDFComposer

Webservice to split and merge PDFs

There are a lot of good services around which do the job of splitting and
merging documents. Since GDPR it is more tricky, from the privacy perspective
anywaw, to use these services.

PDFComposer is an opensource web service which can be simply deployed into the
existing infrastructure to provide these kind of functionality.

It relies on `pdfunite` (poppler-utils) for merging pdfs and `pdftk` for
splitting them. Splitted pdfs are returned as a zip file.

## Deploy

Install the required packages (check `Aptfile` and `package.json`) and start
the service with `node server.js`.
