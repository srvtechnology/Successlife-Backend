const pdf = require('html-pdf');

const htmlToPdf = {
    toPDF: function (html, options,  output) {
        return new Promise(function (resolve, reject) {
            pdf.create(html, options)
                .toFile(output, function(error, response) {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(response);
                }
            });
        });
    }    
}

module.exports = htmlToPdf;

