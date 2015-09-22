
//Overload of dragdrop.js to insert function into case4
function UploadProgressFunc(percentDone, timeElapsed, state) {
    state.percentDone = percentDone;
    var messageType = ProgressMessage.EMPTY;

    switch (state.status) {
        case 1:
            messageType = ProgressMessage.VALIDATION;
            break;
        case 3:
            messageType = ProgressMessage.UPLOADING;
            break;
        case 4:
            messageType = ProgressMessage.UPLOADED;
            FoCMultiFileUploadCheck();
            break;
        case 5:
            messageType = ProgressMessage.CANCELLED;
            break;
    }
    UpdateProgressBar(messageType, state);
}

function FoCMultiFileUploadCheck() {
    if (FoCNumberofDroppedFiles == 1) {
        //alert("Number of files uploaded = " + FoCNumberofDroppedFiles);
        MyNewFunction();
    }
    else if (FoCNumberofDroppedFiles > 1) {
        alert("Multiple files uploaded, edit via datasheet view(in development)");
    }
    else {
        alert("Error: FoCMultiFileUpload Check edge case, not 1 or >1");
    }
};

function MyNewFunction() {

    var caml = "<View><Query><Where>"
        + "<Eq><FieldRef Name='FSObjType' /><Value Type='int'>0</Value></Eq>"
        + "</Where>"
        + "<OrderBy><FieldRef Name='ID' Ascending='False' /></OrderBy>"
        + "</Query>"
        + "<ViewFields><FieldRef Name='ID' /></ViewFields>"
        + "<RowLimit>1</RowLimit>"
        + "</View>";


    var ctx = SP.ClientContext.get_current()
    var web = ctx.get_web();
    var list = web.get_lists().getByTitle("Documents")
    var query = new SP.CamlQuery();
    query.set_viewXml(caml);
    var items = list.getItems(query);
    ctx.load(items)
    ctx.executeQueryAsync(function () {
        var enumerator = items.getEnumerator();
        enumerator.moveNext();
        var item = enumerator.get_current();
        var id = item.get_id();
        //alert(id);
        _MyGotoEditForm(id)
    }, function () {
        //failure handling comes here
        alert("failed");
    });

}

function _MyGotoEditForm(id) {
    var options = SP.UI.$create_DialogOptions();
    options.title = "Add File Metadata";
    options.url = "../Lists/Documents/Forms/EditForm.aspx?ID=" + id;
    options.dialogReturnValueCallback = Function.createDelegate(null, CloseCallback);
    options.autoSize = true; SP.UI.ModalDialog.showModalDialog(options);
    return false;
}

// Dialog close event capture function
function CloseCallback(strReturnValue, result, target) {
    if (strReturnValue === SP.UI.DialogResult.OK) // Perform action on Ok.
    {
        //reset your body overflow here
        window.location = window.location;
    }

    if (strReturnValue === SP.UI.DialogResult.cancel) // Perform action on Cancel.
    {
        //logic for cancel here
    }


}

//Overload of dragdrop.js to detect multi-file uploads
function fTooManyFiles(a) {
    var l = a.length;
    if (l > 1) {
        window.FoCNumberofDroppedFiles = l;
        //alert("Multidocuments detected var = " + FoCNumberofDroppedFiles);
    }
    else {
        window.FoCNumberofDroppedFiles = l;
        //alert("Single document detected var = " + FoCNumberofDroppedFiles);
        //return of 1 either from single document being uploaded, or 2nd functional call on multi-upload. Add timer to reset var here? or globally?
    }    
    //alert("Number of files being uploaded = " + FoCNumberofDroppedFiles);
    if (a.length > C_MAX_FILECOUNT) {
        var b = String.format(Strings.STS.L_UploadMaxFileCount, C_MAX_FILECOUNT);
        ShowErrorDialogCore(Strings.STS.L_UploadMaxFileCountTitle, b, null);
        g_currentControl.status = ControlStatus.IDLE;
        return true
    }
    return false
}
