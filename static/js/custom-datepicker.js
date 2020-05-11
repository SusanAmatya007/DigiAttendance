$(document).ready(function () {
    if ($("#tempBatch").val().length > 0) {
        $("#batchSelect").val($("#tempBatch").val());
    }
});

$(function () {
    $('.datepicker').datepicker({
        autoclose: true,
        format: "yyyy-mm-dd",
        todayBtn: "linked",
        todayHighlight: true,
    });
    if ($("#tempDOB").val().length > 0) {
        var date = $("#tempDOB").val().split("-")
        $(".datepicker").datepicker("setDate", new Date(date[0], (date[1] - 1), date[2]));
    } else {
        $('.datepicker').datepicker("setDate", new Date());
    }
    $('.datepicker').datepicker("setEndDate", new Date());
});