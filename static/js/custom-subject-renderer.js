function getSubjects(batch_id) {
    $("#subjectSelect").empty().append('<option disabled selected>Subject...</option>');
    url = "/allocation/getSubjects/batch/" + batch_id;
    $.ajax(url, {
        method: "GET"
    })
    .done(function (data, textStatus, jqXHR) {
        if (jqXHR.status === 200) {
            data.batchSubjects.forEach(function (item) {
                var option = document.createElement("option");
                option.value = item._id;
                option.text = item.subjectId + " : " + item.subjectName;
                document.getElementById("subjectSelect").appendChild(option);
            });
        }
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
        alert("Something went wrong...!!! Try Again...")
    });
}

$(document).ready(function () {
    $("#batchSelect").on("change", function(){
        var batch_id = $(this).val();
        getSubjects(batch_id);        
    });
});

$(document).ready(function () {
    if ($("#tempTeacher").val().length > 0) {
        $("#teacherSelect").val($("#tempTeacher").val());
    }
    if ($("#tempBatch").val().length > 0) {
        $("#batchSelect").val($("#tempBatch").val());
        getSubjects($("#tempBatch").val());
        if ($("#tempSubject").val().length > 0) {
            $("#subjectSelect").val($("#tempSubject").val());
        }
    }
});