
function asAttachment ({ filename, contents, response }) {
    response.header("Content-Disposition", `attachment; filename="${filename}"`);
    return contents;
}

module.exports = { asAttachment };
  