$(function () {
    $('.datepicker').datepicker({
        autoclose: true,
        format: "yyyy-mm-dd",
        todayBtn: "linked",
        todayHighlight: true,
        daysOfWeekDisabled: [0,6],
        weekStart: 1
    });
    if ($("#tempAttendance").val().length > 0) {
        var date = $("#tempAttendance").val().split("-")
        $(".datepicker").datepicker("setDate", new Date(date[0], (date[1] - 1), date[2]));
    } else {
        $('.datepicker').datepicker("setDate", new Date());
    }
    $('.datepicker').datepicker("setEndDate", new Date());
});

$(document).ready(function () {
    $("#attendanceSubmitBtn").on("click", function () {
        if (confirm('Are you sure you want to submit the attendance ?')) {
            $("#attendanceSubmitBtn").prop('disabled', true);
            var checkboxes = [];
            $('input[type=checkbox]').each(function () {
                checkboxes.push({
                    student_id: $(this).val(),
                    status: this.checked
                });
            });
            $("#studentAttendanceStatus").val(JSON.stringify(checkboxes));
            $("#attendanceForm").submit();
        }
    });
});