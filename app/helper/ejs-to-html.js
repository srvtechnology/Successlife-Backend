const fs = require('fs');
const ejs = require('ejs');

const ejsToHtml = {
    toHTML: function (ejsTemplateURL, data) {
        return new Promise(function (resolve, reject) {
            fs.readFile(ejsTemplateURL, 'utf8', function (error, response) {
                if(error) {
                    reject(error);
                }
                else {
                    let html = ejs.render(response, data);
                    resolve(html);
                }
            });
        });
    }
    
}

module.exports = ejsToHtml;

