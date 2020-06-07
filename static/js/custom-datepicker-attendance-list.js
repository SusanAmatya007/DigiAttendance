$(function () {
    $('.datepicker').datepicker({
        autoclose: true,
        format: "yyyy-mm-dd",
        todayBtn: "linked",
        todayHighlight: true,
        daysOfWeekDisabled: [0,6],
        weekStart: 1
    });
    $('.datepicker').datepicker("setDate", new Date());
    $('.datepicker').datepicker("setEndDate", new Date());
});

function getAttendanceSubject() {
    url = "/attendance/getSubjectAttendance"
    var data = {
        allocation_id: $("#allocation_id").val(),
        attendanceDate: $(".datepicker > input").val()
    }
    var jsonData = JSON.stringify(data);
    $.ajax(url, {
        method: "POST",
        contentType: "application/json",
        data: jsonData,
    })
        .done(function (data, textStatus, jqXHR) {
            if (jqXHR.status === 200) {
                $("#subAttDate").text(data.attendanceDate);
                $("#subAttDetails").text(data.attendancePresent + " / " + data.attendanceTotalStrength)
            }
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            alert("Something went wrong...!!! Try Again...")
        });
}

function getPDF(url) {
    return axios.get(url, {
        responseType: 'arraybuffer',
        headers: {
            'Accept': 'application/pdf'
        }
    });
}

$(function () {
    getAttendanceSubject();
    $(".datepicker").on("change", function () {
        getAttendanceSubject();
    });

    $(".downloadAttendance").on("click", function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        var url = $(this).attr("data-url");
        getPDF(url)
            .then((response) => {
                const blob = new Blob([response.data], { type: 'application/pdf' })
                const link = document.createElement('a')
                link.href = window.URL.createObjectURL(blob)
                link.download = response.headers.filename
                link.click()
            })
            .catch(err => console.log(err))
    });
}); 